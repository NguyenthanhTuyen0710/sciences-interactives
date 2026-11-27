#!/usr/bin/env bash
# Test de non-régression des ressources du runtime de production (Linux, local ou CI uniquement).
#
# Lance ops/server.js en NODE_ENV=production contre une base PostgreSQL LOCALE préparée (npm run setup), puis mesure :
# processus, threads, threads Tokio, processus enfants, RSS (repos / pic / après retour au calme), connexions PostgreSQL, arrêt par SIGTERM.
#
# Prérequis : `npm run build` fait ; DATABASE_URL pointe vers localhost avec les comptes de démonstration (npm run db:seed).
# Usage    : DATABASE_URL=postgresql://… ops/probe.sh
# Variables optionnelles : RUNS=3 PORT=3222 SETTLE_SECS=12 LOAD_REQS=100 LOAD_PAR=20 PG_MAX_EXPECTED=10
#
# Codes de sortie : 0 = aucun échec (des avertissements sont possibles) · 1 = au moins un échec · 2 = prérequis manquant.
# Rien n'est tué autrement que par SIGTERM sur le seul PID lancé par ce script. Aucun secret n'est affiché.
set -u

RUNS=${RUNS:-3}
PORT=${PORT:-3222}
SETTLE_SECS=${SETTLE_SECS:-12}       # > idleTimeoutMillis du pool pg (10 s par défaut)
LOAD_REQS=${LOAD_REQS:-100}
LOAD_PAR=${LOAD_PAR:-20}
SERVER_FILE=${SERVER_FILE:-ops/server.js}   # surcharge utile pour les tests négatifs
PG_MAX_EXPECTED=${PG_MAX_EXPECTED:-10}   # valeur actuelle de `max` dans src/lib/db/index.ts (non modifiée)

# Seuils. FAIL = fait échouer le test (comportement déterministe) ; WARN = à examiner (dépend du runner ou de la charge).
FAIL_IDLE_THREADS=20                 # baseline production : 13
WARN_IDLE_RSS_MB=350                 # baseline production : ~236 Mo au repos
WARN_PEAK_RSS_MB=700                 # propre au scénario de charge ci-dessous, pas une valeur générale
WARN_RETAINED_GROWTH_PCT=25          # croissance du RSS « après retour au calme » entre la charge 1 et la charge 2
WARN_RETAINED_GROWTH_MB=40

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT" || exit 2
# shellcheck source=ops/lib.sh
. "$ROOT/ops/lib.sh"

# ---- prérequis -------------------------------------------------------------------------------
[ "$(uname -s)" = "Linux" ] || { echo "Linux requis (/proc)."; exit 2; }
[ -f .next/BUILD_ID ] || { echo "Build absent : lancer npm run build."; exit 2; }
[ -n "${DATABASE_URL:-}" ] || { echo "DATABASE_URL absente."; exit 2; }
DB_HOST=$(node -e 'try{console.log(new URL(process.env.DATABASE_URL).hostname)}catch{console.log("")}')
case "$DB_HOST" in
  localhost|127.0.0.1|"[::1]"|::1) ;;
  *) echo "Refus : la base doit être locale (hôte lu : « ${DB_HOST:-illisible} »). Ce test ne doit jamais viser la production."; exit 2 ;;
esac
HAVE_PSQL=0; command -v psql >/dev/null 2>&1 && HAVE_PSQL=1
[ "$HAVE_PSQL" = 1 ] || echo "psql absent : les contrôles de connexions PostgreSQL sont ignorés."
NPROC_VISIBLE=$(nproc 2>/dev/null || echo 1)
WORK=$(mktemp -d); SRV=""
cleanup() { [ -n "$SRV" ] && kill -0 "$SRV" 2>/dev/null && kill -TERM "$SRV" 2>/dev/null; rm -rf "$WORK"; }
trap cleanup EXIT

# Secrets jetables, propres à ce test (ils ne protègent aucune donnée réelle et ne sont jamais affichés).
PROBE_AUTH_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')
PROBE_INVITE=$(node -e 'console.log(require("crypto").randomBytes(9).toString("hex"))')
PROBE_EMAIL=${PROBE_EMAIL:-hugo@demo.fr}
PROBE_PASSWORD=${PROBE_PASSWORD:-demo1234}   # compte de démonstration du seed (publié dans README.md)

pg_count() { [ "$HAVE_PSQL" = 1 ] && psql "$DATABASE_URL" -Atqc "select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid()" 2>/dev/null || echo 0; }

start_server() { # $1 = valeur de TOKIO_WORKER_THREADS ("" = variable absente)
  local envcmd=(env -u TOKIO_WORKER_THREADS)
  [ -n "$1" ] && envcmd=(env "TOKIO_WORKER_THREADS=$1")
  PORT=$PORT NODE_ENV=production AUTH_SECRET=$PROBE_AUTH_SECRET TEACHER_INVITE_CODE=$PROBE_INVITE \
    "${envcmd[@]}" node "$SERVER_FILE" >"$WORK/server.log" 2>&1 &
  SRV=$!
  local i
  for i in $(seq 1 120); do
    kill -0 "$SRV" 2>/dev/null || { fail "le serveur s'est arrêté au démarrage (voir journal ci-dessous)"; tail -5 "$WORK/server.log"; SRV=""; return 1; }
    curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/contact" && return 0
    sleep 0.5
  done
  fail "le serveur ne répond pas après 60 s"; return 1
}

stop_server() { # SIGTERM sur le seul PID lancé ici ; jamais de SIGKILL.
  [ -n "$SRV" ] || return 0
  local pid=$SRV i
  kill -TERM "$pid" 2>/dev/null
  for i in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
  if kill -0 "$pid" 2>/dev/null; then fail "PID $pid toujours vivant 10 s après SIGTERM (aucun SIGKILL envoyé)"; else info "arrêt propre sur SIGTERM"; SRV=""; fi
}

load_round() { # $1 = numéro ; écrit le pic de connexions PostgreSQL dans $WORK/pgpeak
  local base=$2 u r
  echo 0 > "$WORK/pgpeak"; touch "$WORK/sampling"
  ( while [ -f "$WORK/sampling" ]; do c=$(( $(pg_count) - base )); [ "$c" -gt "$(cat "$WORK/pgpeak")" ] && echo "$c" > "$WORK/pgpeak"; sleep 0.2; done ) &
  local sampler=$!
  for r in 1 2 3; do for u in / /lecons /chapitres /cours /exercices /mon-espace /bac /brevet /revisions /contact; do
    curl -s -b "$WORK/cj" -o /dev/null --max-time 20 "http://127.0.0.1:$PORT$u"; done; done
  seq 1 "$LOAD_REQS" | xargs -P "$LOAD_PAR" -I{} sh -c "curl -s -b '$WORK/cj' -o /dev/null --max-time 20 http://127.0.0.1:$PORT/mon-espace; curl -s -b '$WORK/cj' -o /dev/null --max-time 20 http://127.0.0.1:$PORT/api/me"
  rm -f "$WORK/sampling"; wait "$sampler" 2>/dev/null
}

check_idle() { # $1 = attendu Tokio
  local pid=$SRV th tk ch rs
  th=$(threads "$pid"); tk=$(tokio "$pid"); ch=$(kids "$pid"); rs=$(rss_mb "$pid")
  echo "  idle: threads=$th tokio=$tk enfants=$ch rss=${rs}Mo"
  [ "$tk" -eq "$1" ] || fail "Tokio : $tk thread(s), attendu $1"
  [ "$th" -le "$FAIL_IDLE_THREADS" ] || fail "threads au repos : $th > $FAIL_IDLE_THREADS"
  [ "$ch" -eq 0 ] || fail "processus enfant inattendu : $ch"
  [ "$rs" -le "$WARN_IDLE_RSS_MB" ] || warn "RSS au repos ${rs} Mo > ${WARN_IDLE_RSS_MB} Mo"
  IDLE_TH+=("$th"); IDLE_RSS+=("$rs")
}

check_after_exit() {
  local base=$1 left
  sleep 1
  left=$(( $(pg_count) - base ))
  [ "$left" -le 0 ] || fail "connexions PostgreSQL restantes après l'arrêt : $left"
}

IDLE_TH=(); IDLE_RSS=(); PEAK_RSS=(); RET1=(); RET2=(); PG_PEAKS=()

run_scenario() { # $1 nom  $2 valeur TOKIO ("" = absente)  $3 attendu  $4 full|idle
  local name=$1 val=$2 expect=$3 mode=$4 run
  for run in $(seq 1 "$RUNS"); do
    echo "== scénario $name, passage $run/$RUNS (TOKIO_WORKER_THREADS=${val:-<absente>}, attendu $expect)"
    local base; base=$(pg_count)
    start_server "$val" || { stop_server; continue; }
    check_idle "$expect"
    if [ "$mode" = full ]; then
      rm -f "$WORK/cj"
      local code; code=$(curl -s -c "$WORK/cj" -o /dev/null -w '%{http_code}' --max-time 20 -H 'content-type: application/json' \
        -d "{\"email\":\"$PROBE_EMAIL\",\"password\":\"$PROBE_PASSWORD\"}" "http://127.0.0.1:$PORT/api/auth/login")
      [ "$code" = 200 ] || { fail "connexion de test refusée (HTTP $code) : base non initialisée (npm run setup) ?"; stop_server; continue; }
      local t0 t1 th2 tk2 ch2 peak pgp
      t0=$(cpu_ticks "$SRV")
      load_round 1 "$base"; pgp=$(cat "$WORK/pgpeak")
      peak=$(rss_mb "$SRV"); sleep "$SETTLE_SECS"; local ret1; ret1=$(rss_mb "$SRV")
      load_round 2 "$base"; [ "$(cat "$WORK/pgpeak")" -gt "$pgp" ] && pgp=$(cat "$WORK/pgpeak")
      local peak2; peak2=$(rss_mb "$SRV"); [ "$peak2" -gt "$peak" ] && peak=$peak2
      sleep "$SETTLE_SECS"; local ret2; ret2=$(rss_mb "$SRV")
      t1=$(cpu_ticks "$SRV"); th2=$(threads "$SRV"); tk2=$(tokio "$SRV"); ch2=$(kids "$SRV")
      echo "  charge : threads=$th2 tokio=$tk2 enfants=$ch2 | rss pic=${peak}Mo, calme#1=${ret1}Mo, calme#2=${ret2}Mo | pg pic=$pgp | cpu=$(( (t1-t0) ))ticks"
      [ "$tk2" -eq "$expect" ] || fail "Tokio sous charge : $tk2, attendu $expect"
      [ "$th2" -le "$FAIL_IDLE_THREADS" ] || fail "threads sous charge : $th2 > $FAIL_IDLE_THREADS"
      [ "$ch2" -eq 0 ] || fail "processus enfant après charge : $ch2"
      [ "$pgp" -le "$PG_MAX_EXPECTED" ] || fail "connexions PostgreSQL : pic $pgp > $PG_MAX_EXPECTED attendues"
      [ "$peak" -le "$WARN_PEAK_RSS_MB" ] || warn "RSS au pic ${peak} Mo > ${WARN_PEAK_RSS_MB} Mo (scénario : ${LOAD_REQS}x2 requêtes, ${LOAD_PAR} en parallèle)"
      PEAK_RSS+=("$peak"); RET1+=("$ret1"); RET2+=("$ret2"); PG_PEAKS+=("$pgp")
      local grow=$(( ret2 - ret1 ))
      if [ "$grow" -gt "$WARN_RETAINED_GROWTH_MB" ] && [ $(( grow * 100 / (ret1 > 0 ? ret1 : 1) )) -gt "$WARN_RETAINED_GROWTH_PCT" ]; then
        warn "RSS retenu après retour au calme : ${ret1} → ${ret2} Mo (+${grow} Mo) : fuite possible, à confirmer sur plusieurs charges"
      fi
    fi
    stop_server
    check_after_exit "$base"
  done
}

echo "Probe ressources — CPU visibles : $NPROC_VISIBLE · passages par scénario : $RUNS"
run_scenario standard 2  2 full
run_scenario override 3  3 idle
run_scenario fallback "" 2 idle
if [ "$NPROC_VISIBLE" -le 2 ]; then
  warn "seulement $NPROC_VISIBLE CPU visible(s) : le scénario « fallback » ne distingue pas la garde d'un Tokio par défaut (le test ne prouve pas la garde ici)"
else
  info "$NPROC_VISIBLE CPU visibles contre 2 Tokio attendus : le scénario « fallback » reproduit l'écart CPU visibles / quota"
fi

echo
echo "== Synthèse"
[ "${#IDLE_TH[@]}" -gt 0 ] && echo "  threads au repos (médiane) : $(median "${IDLE_TH[@]}") · RSS au repos (médiane) : $(median "${IDLE_RSS[@]}") Mo"
[ "${#PEAK_RSS[@]}" -gt 0 ] && echo "  RSS pic (médiane) : $(median "${PEAK_RSS[@]}") Mo · calme#2 (médiane) : $(median "${RET2[@]}") Mo · connexions pg pic (max) : $(printf '%s\n' "${PG_PEAKS[@]}" | sort -n | tail -1)"
echo "  avertissements : ${#WARNS[@]} · échecs : ${#FAILS[@]}"
[ "${#FAILS[@]}" -eq 0 ]
