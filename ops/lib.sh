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
