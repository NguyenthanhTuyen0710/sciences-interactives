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
# find_node [VERSION_ATTENDUE] : affiche le premier Node exécutable, en préférant celui dont la version est exactement VERSION_ATTENDUE.
find_node() {
  local want=${1:-} c first=""
  while read -r c; do
    [ -x "$c" ] || continue
    [ -n "$first" ] || first=$c
    if [ -n "$want" ] && [ "$("$c" -v 2>/dev/null)" = "v$want" ]; then echo "$c"; return 0; fi
  done < <(node_candidates)
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
