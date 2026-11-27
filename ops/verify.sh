#!/usr/bin/env bash
# Vérification APRÈS déploiement ou redémarrage (lecture seule côté serveur : requêtes HTTP de lecture + lecture de /proc).
# Ne suppose jamais qu'un redémarrage cPanel a réussi : contrôle les processus réellement présents.
#
# Usage : ops/verify.sh --base-url https://exemple.tld [--app-dir DIR] [--deployed-at ISO8601|EPOCH] [--old-pids "PID PID"]
# Comptes de test OPTIONNELS, via l'environnement (jamais en argument, jamais affichés) :
#   VERIFY_STUDENT_EMAIL / VERIFY_STUDENT_PASSWORD   compte élève dédié
#   VERIFY_TEACHER_EMAIL / VERIFY_TEACHER_PASSWORD   compte enseignant dédié
# La connexion ne modifie pas la base ; la correction est testée sans compte (aucune tentative enregistrée).
# Variables : NPROC_LIMIT=165 MAX_IDLE_THREADS=20 MAX_TOKIO=3
# Codes de sortie : 0 = aucun échec (lire les SKIP) · 1 = au moins un échec.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP=$PWD; BASE=""; DEPLOYED_AT=""; OLD_PIDS=""
while [ $# -gt 0 ]; do case "$1" in
  --base-url) BASE=${2%/}; shift 2;; --app-dir) APP=$2; shift 2;; --deployed-at) DEPLOYED_AT=$2; shift 2;; --old-pids) OLD_PIDS=$2; shift 2;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done
[ -n "$BASE" ] || { echo "--base-url requis"; exit 1; }
APP=$(cd "$APP" && pwd) || exit 1
NPROC_LIMIT=${NPROC_LIMIT:-165}; MAX_IDLE_THREADS=${MAX_IDLE_THREADS:-20}; MAX_TOKIO=${MAX_TOKIO:-3}
ME=$(id -un); umask 077; WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
http() { curl -s --max-time 30 "$@"; }
code() { http -o /dev/null -w '%{http_code}' "$@"; }

echo "== 1. Application et PostgreSQL (la page d'accueil interroge la base : 200 = connexion valide)"
c=$(code "$BASE/"); [ "$c" = 200 ] && ok "GET / → 200" || fail "GET / → $c"
me=$(http "$BASE/api/me"); echo "$me" | grep -q '"user"' && ok "GET /api/me répond" || fail "GET /api/me : réponse inattendue"

echo "== 2. Exercice et correction côté serveur (sans compte : rien n'est enregistré)"
EX=$(http "$BASE/exercices" | grep -o '/exercice/[A-Za-z0-9._~%-]*' | head -1 | sed 's|/exercice/||')
if [ -z "$EX" ]; then fail "aucun exercice trouvé sur /exercices"; else
  ok "exercice de test : $EX"
  g=$(http "$BASE/api/exercises/$EX?d=1")
  seed=$(echo "$g" | sed -n 's/.*"seed":"\([^"]*\)".*/\1/p' | head -1)
  if [ -z "$seed" ]; then fail "GET /api/exercises/$EX : réponse invalide"; else
    echo "$g" | grep -Eq '"(answer|mistakes)"' && fail "la clé de correction (answer/mistakes) est exposée au navigateur" || ok "aucune clé de correction dans la réponse publique"
    r=$(http -H 'content-type: application/json' -d "{\"seed\":\"$seed\",\"difficulty\":1,\"responses\":[]}" "$BASE/api/exercises/$EX/check")
    echo "$r" | grep -q '"score"' && echo "$r" | grep -q '"saved":false' && ok "correction serveur : score calculé, saved=false" || fail "correction serveur : réponse inattendue"
  fi
fi

echo "== 3. Authentification et administration"
body=$(http "$BASE/admin"); echo "$body" | grep -q 'réservé aux enseignants' && ok "/admin refusé sans connexion" || fail "/admin accessible sans connexion"
jesc() { local v=${1//\\/\\\\}; v=${v//\"/\\\"}; printf %s "$v"; }   # échappement JSON minimal (aucun Node requis sur l'hébergement)
login() { # $1 email $2 mot de passe $3 fichier cookie → code HTTP
  printf '{"email":"%s","password":"%s"}' "$(jesc "$1")" "$(jesc "$2")" | http -c "$3" -o /dev/null -w '%{http_code}' -H 'content-type: application/json' --data-binary @- "$BASE/api/auth/login"; }
if [ -n "${VERIFY_STUDENT_EMAIL:-}" ] && [ -n "${VERIFY_STUDENT_PASSWORD:-}" ]; then
  [ "$(login "$VERIFY_STUDENT_EMAIL" "$VERIFY_STUDENT_PASSWORD" "$WORK/s")" = 200 ] && ok "connexion élève" || fail "connexion élève refusée"
  http -b "$WORK/s" "$BASE/api/me" | grep -q '"role":"eleve"' && ok "session élève reconnue" || fail "session élève non reconnue"
  http -b "$WORK/s" "$BASE/admin" | grep -q 'réservé aux enseignants' && ok "élève refusé sur /admin" || fail "élève admis sur /admin"
else skip "compte élève de test non fourni (VERIFY_STUDENT_*)"; fi
if [ -n "${VERIFY_TEACHER_EMAIL:-}" ] && [ -n "${VERIFY_TEACHER_PASSWORD:-}" ]; then
  [ "$(login "$VERIFY_TEACHER_EMAIL" "$VERIFY_TEACHER_PASSWORD" "$WORK/t")" = 200 ] && ok "connexion enseignant" || fail "connexion enseignant refusée"
  http -b "$WORK/t" "$BASE/admin" | grep -q 'Tableau de bord' && ok "/admin accessible à l'enseignant" || fail "/admin inaccessible à l'enseignant"
else skip "compte enseignant de test non fourni (VERIFY_TEACHER_*)"; fi

echo "== 4. Processus de l'application (après les requêtes : lsnode démarre à la demande)"
NOW=$(date +%s); DEP=""
if [ -n "$DEPLOYED_AT" ]; then DEP=$(date -d "@$DEPLOYED_AT" +%s 2>/dev/null || date -d "$DEPLOYED_AT" +%s 2>/dev/null) || { fail "--deployed-at illisible"; DEP=""; }
else skip "--deployed-at non fourni : impossible de distinguer les anciens processus des nouveaux"; fi
N=0; TH=0; RS=0
for pid in $(node_pids "$ME"); do
  [ "$(readlink "/proc/$pid/cwd" 2>/dev/null)" = "$APP" ] || continue
  N=$((N+1)); ppid=$(ppid_of "$pid"); age=$(ps -o etimes= -p "$pid" | tr -d ' '); start=$((NOW-age))
  th=$(threads "$pid"); tk=$(tokio "$pid"); rs=$(rss_mb "$pid"); ch=$(kids "$pid"); TH=$((TH+th)); RS=$((RS+rs))
  echo "  pid=$pid ppid=$ppid age=${age}s threads=$th tokio=$tk rss=${rs}Mo enfants=$ch"
  [ "$tk" -le "$MAX_TOKIO" ] || fail "pid $pid : $tk threads Tokio (> $MAX_TOKIO)"
  [ "$th" -le "$MAX_IDLE_THREADS" ] || warn "pid $pid : $th threads (> $MAX_IDLE_THREADS ; baseline 13)"
  [ "$ch" -eq 0 ] || warn "pid $pid : $ch processus enfant (aucun n'est créé par le code de l'application)"
  # Seul critère « ancien processus » : démarré avant le déploiement. Le PPID n'en est pas un (il passe à 1 en cours de vie sous LiteSpeed).
  if [ -n "$DEP" ] && [ "$start" -lt "$DEP" ]; then fail "pid $pid démarré AVANT le déploiement : ancien processus encore actif"; fi
done
[ "$N" -gt 0 ] && info "$N processus pour $APP (pas de nombre imposé : LiteSpeed peut créer des instances valides ; PPID = information seulement)" || fail "aucun processus Node trouvé dans $APP"
for p in $OLD_PIDS; do kill -0 "$p" 2>/dev/null && fail "ancien PID $p toujours vivant (aucun signal envoyé par ce script)" || ok "ancien PID $p disparu"; done

echo "== 5. Ressources du compte"
USED=$(ps -eL -u "$ME" --no-headers 2>/dev/null | wc -l)
info "application : $TH threads, RSS ${RS} Mo · compte : $USED threads/processus sur $NPROC_LIMIT"
[ "$USED" -le $((NPROC_LIMIT*85/100)) ] || fail "NPROC > 85 % ($USED/$NPROC_LIMIT)"
[ "$USED" -le $((NPROC_LIMIT*60/100)) ] || warn "NPROC > 60 % ($USED/$NPROC_LIMIT)"
summary
