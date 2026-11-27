#!/usr/bin/env bash
# Test de fumée de l'ARTEFACT de déploiement, décompressé dans un dossier isolé (sans sources, sans cache de build), sur une base de test LOCALE.
# Vérifie : intégrité (SHA-256, commit), contenu, dépendances réelles, binaires natifs, démarrage, ressources statiques, authentification, rôles,
# routes API, correction côté serveur, PostgreSQL, limites de ressources (ops/probe.sh sur l'artefact), échange de versions et retour arrière.
#
# Usage : DATABASE_URL=postgresql://…@localhost/… ops/smoke-artifact.sh --artifact FICHIER.tar.gz --node-modules DIR [--expect-commit SHA]
#   --node-modules : node_modules à relier, comme le lien CloudLinux vers nodevenv : doit ressembler à celui de l'hébergement, DONC avec les dépendances de développement
#                    (typescript est requis par next.config.ts ; sans lui `next start` lance npm install typescript).
# La base doit être préparée (npm run setup : comptes de démonstration). Codes de sortie : 0 = aucun échec · 1 = échec · 2 = prérequis manquant.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"
ART=""; MODS=""; EXPECT=""; PORT=${PORT:-3333}
while [ $# -gt 0 ]; do case "$1" in
  --artifact) ART=$2; shift 2;; --node-modules) MODS=$2; shift 2;; --expect-commit) EXPECT=$2; shift 2;;
  *) echo "Option inconnue : $1"; exit 2;; esac; done
[ -f "$ART" ] && [ -d "$MODS" ] && [ -n "${DATABASE_URL:-}" ] || { echo "Usage : --artifact FICHIER --node-modules DIR + DATABASE_URL"; exit 2; }
NODE=$(find_node 22.23.5) || { echo "Node introuvable."; exit 2; }
DB_HOST=$("$NODE" -e 'try{console.log(new URL(process.env.DATABASE_URL).hostname)}catch{console.log("")}')
case "$DB_HOST" in localhost|127.0.0.1|"[::1]"|::1) ;; *) echo "Refus : la base doit être locale (jamais la production)."; exit 2;; esac
ART=$(cd "$(dirname "$ART")" && pwd)/$(basename "$ART"); MODS=$(cd "$MODS" && pwd)
T=$(mktemp -d); APP="$T/home/sciences-interactives"; SRV=""
cleanup() { [ -n "$SRV" ] && kill -0 "$SRV" 2>/dev/null && kill -TERM "$SRV" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
mkdir -p "$APP"
SECRET=$("$NODE" -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'); INVITE=$("$NODE" -e 'console.log(require("crypto").randomBytes(9).toString("hex"))')

start_app() { # démarre server.js depuis le dossier de l'application, environnement minimal, TOKIO_WORKER_THREADS volontairement absente (la garde s'applique)
  ( cd "$APP" && exec env -i PATH="$PATH" HOME="$T" PORT="$PORT" NODE_ENV=production DATABASE_URL="$DATABASE_URL" AUTH_SECRET="$SECRET" TEACHER_INVITE_CODE="$INVITE" "$NODE" server.js ) >"$T/server.log" 2>&1 &
  SRV=$!
  for _ in $(seq 1 120); do
    kill -0 "$SRV" 2>/dev/null || { fail "le serveur s'est arrêté au démarrage"; tail -5 "$T/server.log"; SRV=""; return 1; }
    curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/contact" && { START=$(date +%s); return 0; }
    sleep 0.5
  done
  fail "le serveur ne répond pas après 60 s"; return 1
}
stop_app() { [ -n "$SRV" ] || return 0; local pid=$SRV; kill -TERM "$pid" 2>/dev/null
  for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
  kill -0 "$pid" 2>/dev/null && fail "PID $pid vivant 10 s après SIGTERM (aucun SIGKILL)" || { SRV=""; ok "arrêt propre sur SIGTERM"; }; }
run_verify() { VERIFY_STUDENT_EMAIL=hugo@demo.fr VERIFY_STUDENT_PASSWORD=demo1234 VERIFY_TEACHER_EMAIL=prof@demo.fr VERIFY_TEACHER_PASSWORD=demo1234 NPROC_LIMIT=100000 \
  "$HERE/verify.sh" --base-url "http://127.0.0.1:$PORT" --app-dir "$APP" --deployed-at "$((START-5))" >"$T/verify.log" 2>&1; local rc=$?
  grep -E "FAIL|WARN|SKIP" "$T/verify.log" | sed 's/^/    /'; return $rc; }
commit_of() { sed -n 's/.*"commit": "\([^"]*\)".*/\1/p' "$APP/RELEASE.json"; }

echo "== 1. Intégrité de l'artefact"
SUMF="$ART.sha256"
if [ -f "$SUMF" ]; then ( cd "$(dirname "$ART")" && sha256sum -c --quiet "$(basename "$SUMF")" >/dev/null 2>&1 ) && ok "SHA-256 conforme ($(cut -c1-12 "$SUMF"))" || fail "SHA-256 non conforme"; else fail "fichier .sha256 absent"; fi
LIST=$(tar -tzf "$ART") || fail "artefact illisible"
for it in "${REL_ITEMS[@]}"; do echo "$LIST" | grep -Eq "^(\./)?$it(/|$)" && ok "contient $it" || fail "ne contient pas $it"; done
for bad in node_modules public src tests .git .env .next/cache; do echo "$LIST" | grep -Eq "^(\./)?$bad(/|$)" && fail "contient $bad (interdit)"; done
echo "$LIST" | grep -Eq '^(\./)?\.next/(BUILD_ID|static/|server/)' && ok "fichiers d'exécution Next.js présents (BUILD_ID, static, server)" || fail "fichiers d'exécution Next.js manquants"

echo "== 2. Extraction isolée (aucune dépendance au dépôt ni au cache de build)"
tar -xzf "$ART" -C "$APP"; ln -s "$MODS" "$APP/node_modules"
[ -d "$APP/src" ] || [ -d "$APP/.next/cache" ] && fail "sources ou cache de build présents après extraction" || ok "ni sources ni .next/cache dans le dossier de test ($(du -sm "$APP" | awk '{print $1}') Mo, node_modules relié sans copie)"
C=$(commit_of); [ -n "$C" ] && ok "RELEASE.json : commit $(echo "$C" | cut -c1-12)" || fail "RELEASE.json sans commit"
[ -z "$EXPECT" ] || { [ "$C" = "$EXPECT" ] && ok "commit conforme à celui attendu" || fail "commit $C ≠ attendu $EXPECT"; }
LSHA=$(sha256sum "$APP/package-lock.json" | awk '{print $1}'); grep -q "$LSHA" "$APP/RELEASE.json" && ok "package-lock.json conforme à RELEASE.json" || fail "package-lock.json ≠ RELEASE.json"
grep -q "\"node\": \"v${NODE_MAJOR:-22}\." "$APP/RELEASE.json" && ok "construit avec Node 22" || warn "version de Node de build ≠ 22"
grep -q "linux-x64" "$APP/RELEASE.json" && ok "plateforme linux-x64" || fail "plateforme ≠ linux-x64"

echo "== 3. Dépendances réelles et binaires natifs"
"$NODE" "$HERE/check-deps.mjs" --lock "$APP/package-lock.json" --modules "$APP/node_modules" | sed 's/^/    /'; [ "${PIPESTATUS[0]}" -eq 0 ] && ok "node_modules conforme au lock (versions lues dans les package.json installés)" || fail "node_modules non conforme au lock"
"$NODE" "$HERE/check-native.mjs" "$APP/node_modules" --load | grep -E "FAIL|Synthèse" | sed 's/^/    /'; [ "${PIPESTATUS[0]}" -eq 0 ] && ok "binaires natifs : glibc de cet hôte et chargement réel" || fail "binaires natifs incompatibles"

[ -f "$APP/next.config.ts" ] && { [ -f "$APP/node_modules/typescript/package.json" ] && ok "typescript présent pour next.config.ts" || fail "next.config.ts sans typescript dans node_modules : \`next start\` tenterait d'installer TypeScript avec npm au démarrage (observé) ; utiliser un node_modules identique à nodevenv (dépendances de développement comprises)"; }

echo "== 4. Démarrage et fonctions (base de test locale)"
if start_app; then
  ok "démarrage depuis l'artefact (TOKIO_WORKER_THREADS absente : garde de server.js)"
  H=$(curl -s --max-time 20 "http://127.0.0.1:$PORT/connexion"); JS=$(echo "$H" | grep -o '/_next/static/[^"]*\.js' | head -1)
  if [ -n "$JS" ]; then
    HDR=$(curl -s -D - -o /dev/null --max-time 20 "http://127.0.0.1:$PORT$JS")
    echo "$HDR" | head -1 | grep -q 200 && echo "$HDR" | grep -qi 'content-type: .*javascript' && ok "ressource statique servie : $JS" || fail "ressource statique non servie : $JS"
  else fail "aucune ressource /_next/static dans la page de connexion"; fi
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -H 'content-type: application/json' -d "{\"name\":\"Smoke\",\"email\":\"smoke-$$@test.fr\",\"password\":\"motdepasse1\",\"role\":\"enseignant\",\"teacherCode\":\"mauvais\"}" "http://127.0.0.1:$PORT/api/auth/register")" = 403 ] && ok "inscription enseignant refusée avec un mauvais code (403)" || fail "inscription enseignant : code de réponse inattendu"
  run_verify && ok "ops/verify.sh : santé, PostgreSQL, authentification, rôles, correction serveur, processus" || { fail "ops/verify.sh a échoué"; sed 's/^/    /' "$T/verify.log" | tail -15; }
  stop_app
fi

echo "== 5. Limites de ressources (ops/probe.sh sur l'artefact, 1 passage par scénario)"
PROBE_APP_DIR="$APP" RUNS=1 PORT=$((PORT+1)) "$HERE/probe.sh" >"$T/probe.log" 2>&1; PRC=$?
grep -E "FAIL|WARN|threads au repos|RSS pic|avertissements" "$T/probe.log" | sed 's/^/    /'
[ "$PRC" -eq 0 ] && ok "sonde : threads, Tokio, enfants, RSS, connexions PostgreSQL, arrêt" || fail "sonde en échec (voir ci-dessus)"

echo "== 6. Échange de versions et retour arrière (renommages dans la racine, sans la renommer)"
mkdir -p "$APP/public/uploads"; echo keep > "$APP/public/uploads/photo.jpg"; LINK=$(readlink "$APP/node_modules")
OLD=$(commit_of); R="$APP/$REL_DIR"; mkdir -p "$R/staging" "$R/rollback"
for it in "${REL_ITEMS[@]}"; do cp -a "$APP/$it" "$R/staging/$it"; done
sed -i 's/"commit": "[^"]*"/"commit": "nouvelle-version-test"/' "$R/staging/RELEASE.json"
swap() { # $1 = dossier source des éléments à mettre en place ; $2 = dossier où ranger la version actuelle
  local it; for it in "${REL_ITEMS[@]}"; do mv "$APP/$it" "$2/$it" && mv "$1/$it" "$APP/$it" || return 1; done; }
lock_try "$APP" deploy && ok "verrou de déploiement acquis" || fail "verrou refusé"
lock_try "$APP" deploy 2>/dev/null && fail "un second déploiement simultané a été accepté" || ok "second déploiement simultané refusé"
swap "$R/staging" "$R/rollback" && ok "bascule : version actuelle rangée dans .release/rollback, nouvelle version en place" || fail "bascule impossible"
[ "$(commit_of)" = "nouvelle-version-test" ] && ok "la nouvelle version est active" || fail "la nouvelle version n'est pas active"
if start_app; then run_verify && ok "nouvelle version : ops/verify.sh sans échec" || fail "nouvelle version : ops/verify.sh en échec"; stop_app; fi
mkdir -p "$R/failed"; swap "$R/rollback" "$R/failed" && ok "retour arrière : ancienne version remise en place, la nouvelle rangée dans .release/failed" || fail "retour arrière impossible"
[ "$(commit_of)" = "$OLD" ] && ok "l'ancienne version est active (commit $(echo "$OLD" | cut -c1-12))" || fail "l'ancienne version n'est pas revenue"
if start_app; then run_verify && ok "après retour arrière : ops/verify.sh sans échec" || fail "après retour arrière : ops/verify.sh en échec"; stop_app; fi
[ -f "$APP/public/uploads/photo.jpg" ] && [ "$(readlink "$APP/node_modules")" = "$LINK" ] && ok "public/uploads et le lien node_modules intacts après bascule et retour arrière" || fail "uploads ou lien node_modules altérés"
lock_free "$APP"; [ ! -d "$(lock_dir "$APP")" ] && ok "verrou levé" || fail "verrou non levé"
summary
