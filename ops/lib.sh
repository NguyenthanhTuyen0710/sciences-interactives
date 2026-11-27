# shellcheck shell=bash
# Fonctions communes à ops/probe.sh, ops/preflight.sh et ops/verify.sh (à sourcer, pas à exécuter).
# Lecture seule : /proc, ps, curl. Aucun kill ici.

FAILS=(); WARNS=(); SKIPS=()
fail() { FAILS+=("$1"); echo "  FAIL  $1"; }
warn() { WARNS+=("$1"); echo "  WARN  $1"; }
skip() { SKIPS+=("$1"); echo "  SKIP  $1"; }
info() { echo "  info  $1"; }
ok()   { echo "  ok    $1"; }

threads()   { ls "/proc/$1/task" 2>/dev/null | wc -l; }
tokio()     { local n=0 t; for t in /proc/"$1"/task/*; do [[ "$(cat "$t/comm" 2>/dev/null)" == tokio-runtime-w* ]] && n=$((n+1)); done; echo "$n"; }
rss_mb()    { awk '/VmRSS/{print int($2/1024)}' "/proc/$1/status" 2>/dev/null || echo 0; }
kids()      { pgrep -P "$1" 2>/dev/null | wc -l; }
cpu_ticks() { awk '{print $14+$15}' "/proc/$1/stat" 2>/dev/null || echo 0; }
median()    { printf '%s\n' "$@" | sort -n | awk '{a[NR]=$1} END{print a[int((NR+1)/2)]}'; }

# Résumé commun ; code de sortie 0 s'il n'y a aucun FAIL.
summary() {
  echo; echo "== Synthèse : ${#FAILS[@]} échec(s), ${#WARNS[@]} avertissement(s), ${#SKIPS[@]} contrôle(s) non effectué(s)"
  [ "${#SKIPS[@]}" -eq 0 ] || echo "  Les contrôles non effectués ne sont PAS validés."
  [ "${#FAILS[@]}" -eq 0 ]
}

# Cherche un exécutable Node sans supposer qu'il est dans le PATH (sur cPanel il ne l'est pas dans le shell SSH).
# Ordre : $NODE_BIN, `node` du PATH, Node.js Selector CloudLinux (/opt/alt/alt-nodejs*/root/usr/bin/node), environnements cPanel (~/nodevenv/*/*/bin/node).
node_candidates() {
  [ -n "${NODE_BIN:-}" ] && echo "$NODE_BIN"
  command -v node 2>/dev/null
  local g
  for g in /opt/alt/alt-nodejs*/root/usr/bin/node "$HOME"/nodevenv/*/*/bin/node; do [ -e "$g" ] && echo "$g"; done
  return 0
}
# find_node [VERSION_ATTENDUE] : affiche l'exécutable Node à utiliser.
#  1. $NODE_BIN (option --node) : utilisé tel quel s'il est exécutable et répond à `-v`, SANS aucune détection ; sinon échec (pas de repli silencieux).
#  2. Sinon détection : première candidate exécutable, de préférence celle dont la version est exactement VERSION_ATTENDUE.
# Aucune substitution de processus ni /dev/fd : CageFS ne les fournit pas toujours (échec « /dev/fd/63: No such file or directory » constaté sur VinaHost).
find_node() {
  local want=${1:-} c first="" list old_ifs=$IFS
  if [ -n "${NODE_BIN:-}" ]; then
    if [ -x "$NODE_BIN" ] && "$NODE_BIN" -v >/dev/null 2>&1; then echo "$NODE_BIN"; return 0; fi
    return 1
  fi
  list=$(node_candidates)
  set -f; IFS='
'
  for c in $list; do
    [ -x "$c" ] || continue
    [ -n "$first" ] || first=$c
    if [ -n "$want" ] && [ "$("$c" -v 2>/dev/null)" = "v$want" ]; then IFS=$old_ifs; set +f; echo "$c"; return 0; fi
  done
  IFS=$old_ifs; set +f
  [ -n "$first" ] && { echo "$first"; return 0; }
  return 1
}

# Processus Node de l'utilisateur $1, reconnus par leur binaire (/proc/PID/exe) et non par leur titre : lsnode change le titre des processus.
node_pids() {
  local pid exe
  for pid in $(ps -u "$1" -o pid= 2>/dev/null); do
    exe=$(readlink "/proc/$pid/exe" 2>/dev/null) || continue
    exe=${exe% (deleted)}
    case "${exe##*/}" in node|lsnode) echo "$pid" ;; esac
  done
}
# PPID d'un processus (information seulement : il change en cours de vie sous LiteSpeed, voir docs/ops/incident-2026-11-27.md).
ppid_of() { awk '{print $4}' "/proc/$1/stat" 2>/dev/null; }

# ---- espace disque : quota cPanel (jamais df : la partition du serveur n'est pas le plafond du compte) ----
# Nombre décimal strict (point décimal, aucun séparateur de milliers) ; sinon code de retour 1.
is_num() { [[ "$1" =~ ^[0-9]+(\.[0-9]+)?$ ]]; }
# calc "expression" : arithmétique décimale (expressions construites par nos scripts à partir de nombres validés par is_num).
calc() { awk "BEGIN{printf \"%.2f\", $1}"; }
# Compare : num_lt A B → vrai si A < B.
num_lt() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a<b)}'; }
# Quota en Mo lu sur la sortie texte de `quota` (blocs de 1 Kio) : colonnes blocks, quota, limit ; le nom du système de fichiers peut être seul sur sa ligne.
# Prend la limite « quota » si elle est non nulle, sinon « limit ». Affiche une valeur en Mo, ou rien si le format n'est pas reconnu.
quota_mb_from_text() {
  awk '
    { n=0; for (i=1;i<=NF;i++) { t=$i; gsub(/\*/,"",t); if (t ~ /^[0-9]+$/) v[++n]=t; else if (i>1 || NF==1) { n=-1; break } }
      if (n>=3 && !found) { q=(v[2]>0)?v[2]:v[3]; if (q>0) { printf "%.2f\n", q/1024; found=1 } } }
    { delete v }' 
}

# ---- verrou de déploiement : un seul déploiement, retour arrière ou nettoyage à la fois (mkdir est atomique) ----
# Disposition des versions : toute l'activité de déploiement reste DANS le dossier de l'application ; sa racine n'est jamais renommée.
REL_DIR=.release
# shellcheck disable=SC2034  # lu par les scripts qui sourcent ce fichier
REL_ITEMS=(.next package.json package-lock.json next.config.ts server.js RELEASE.json)   # unités d'une version ; public/, public/uploads et node_modules n'en font jamais partie
lock_dir()  { echo "$1/$REL_DIR/deploy.lock"; }
lock_try()  { mkdir -p "$1/$REL_DIR" && mkdir "$(lock_dir "$1")" 2>/dev/null || return 1
              printf 'purpose=%s\nuser=%s\npid=%s\nstarted=%s\n' "$2" "$(id -un)" "$$" "$(date -u +%FT%TZ)" > "$(lock_dir "$1")/owner"; }
lock_free() { rm -f "$(lock_dir "$1")/owner"; rmdir "$(lock_dir "$1")" 2>/dev/null; return 0; }
lock_info() { cat "$(lock_dir "$1")/owner" 2>/dev/null; }
