#!/usr/bin/env bash
# Contrôle AVANT déploiement ou redémarrage (lecture seule : aucun fichier modifié, aucun processus touché).
# À lancer sur l'hébergement, dans le dossier de l'application déjà déployé/décompressé, sans le démarrer.
#
# Usage : ops/preflight.sh [--app-dir DIR] [--node CHEMIN_NODE] [--env-from-pid PID] [--ref FICHIER_server.js]
#   --node         : exécutable Node à utiliser (défaut : détecté sans supposer le PATH, voir find_node dans ops/lib.sh ;
#                    sur VinaHost : /opt/alt/alt-nodejs22/root/usr/bin/node).
#   --env-from-pid : lit les NOMS et la forme (longueur) des variables dans /proc/PID/environ du process cPanel actuel
#                    (les variables cPanel ne sont pas visibles depuis un shell SSH). Les valeurs ne sont jamais affichées.
#   --ref          : server.js de référence du dépôt (défaut : ops/server.js à côté de ce script, s'il existe).
# Variables : EXPECTED_NODE=22.23.5 NPROC_LIMIT=165 MEM_LIMIT_MB=2048 MIN_FREE_THREADS=40
# Codes de sortie : 0 = aucun échec · 1 = au moins un échec.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP=$PWD; ENV_PID=""; REF="$HERE/server.js"
while [ $# -gt 0 ]; do case "$1" in
  --app-dir) APP=$2; shift 2;; --node) NODE_BIN=$2; shift 2;; --env-from-pid) ENV_PID=$2; shift 2;; --ref) REF=$2; shift 2;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done
cd "$APP" || { echo "Dossier introuvable : $APP"; exit 1; }
EXPECTED_NODE=${EXPECTED_NODE:-22.23.5}; NPROC_LIMIT=${NPROC_LIMIT:-165}; MEM_LIMIT_MB=${MEM_LIMIT_MB:-2048}; MIN_FREE_THREADS=${MIN_FREE_THREADS:-40}
ME=$(id -un)

echo "== 1. Node.js"
NODE=$(find_node "$EXPECTED_NODE") || NODE=""
if [ -z "$NODE" ]; then fail "aucun exécutable Node trouvé (PATH, /opt/alt/alt-nodejs*, ~/nodevenv) : utiliser --node"
else
  info "exécutable : $NODE (node dans le PATH : $(command -v node 2>/dev/null || echo absent — normal sur cPanel))"
  NODE_V=$("$NODE" -v 2>/dev/null | sed 's/^v//')
  if [ "${NODE_V%%.*}" != "${EXPECTED_NODE%%.*}" ]; then fail "Node $NODE_V : version majeure différente de $EXPECTED_NODE"
  elif [ "$NODE_V" != "$EXPECTED_NODE" ]; then warn "Node $NODE_V, version testée : $EXPECTED_NODE"
  else ok "Node $NODE_V"; fi
fi

echo "== 2. Artefact de build"
for f in package.json .next/BUILD_ID .next/server node_modules/next/package.json; do [ -e "$f" ] && ok "$f" || fail "absent : $f"; done
SWC=$(ls node_modules/@next/swc-linux-x64-gnu/*.node 2>/dev/null | head -1)
[ -n "$SWC" ] && ok "binaire natif SWC linux-x64-gnu présent" || fail "binaire natif @next/swc-linux-x64-gnu absent (artefact construit pour une autre plateforme ?)"
if [ -f SHA256SUMS ]; then sha256sum -c --quiet SHA256SUMS >/dev/null 2>&1 && ok "SHA256SUMS conforme" || fail "SHA256SUMS : fichier(s) altéré(s) ou manquant(s)"
else skip "SHA256SUMS absent : intégrité de l'artefact non vérifiée"; fi
if [ -n "$NODE" ] && [ -f "$HERE/check-native.mjs" ] && [ -d node_modules ]; then
  echo "  -- binaires natifs (glibc de l'hôte, bibliothèques dynamiques, chargement réel)"
  NATIVE_OUT=$("$NODE" "$HERE/check-native.mjs" node_modules --load 2>&1); NATIVE_RC=$?
  echo "$NATIVE_OUT" | sed 's/^/     /'
  [ "$NATIVE_RC" -eq 0 ] && ok "binaires natifs compatibles avec cet hôte" || fail "binaire(s) natif(s) incompatible(s) avec cet hôte (voir ci-dessus)"
else skip "ops/check-native.mjs, Node ou node_modules absent : compatibilité des binaires natifs non vérifiée"; fi

echo "== 3. Fichier de démarrage"
if [ -f server.js ]; then
  ok "server.js présent"
  CODE=$(grep -nvE '^[[:space:]]*(//|$)' server.js)   # lignes de code uniquement : les commentaires ne comptent pas
  L_GUARD=$(echo "$CODE" | grep 'TOKIO_WORKER_THREADS' | head -1 | cut -d: -f1); L_REQ=$(echo "$CODE" | grep 'require(' | head -1 | cut -d: -f1)
  if [ -z "$L_GUARD" ]; then fail "server.js ne contient pas la garde TOKIO_WORKER_THREADS"
  elif [ -n "$L_REQ" ] && [ "$L_GUARD" -gt "$L_REQ" ]; then fail "la garde TOKIO_WORKER_THREADS est APRÈS le premier require() (ligne $L_GUARD > $L_REQ)"
  else ok "garde TOKIO_WORKER_THREADS avant tout require()"; fi
  if [ -f "$REF" ]; then cmp -s server.js "$REF" && ok "server.js identique à la référence du dépôt" || fail "server.js différent de $REF"
  else skip "pas de server.js de référence ($REF) : comparaison impossible"; fi
else fail "server.js absent"; fi

echo "== 4. Variables d'environnement (noms et formes seulement)"
envval() { # $1 = nom ; valeur lue dans l'environnement ou dans /proc/PID/environ (jamais affichée)
  if [ -n "$ENV_PID" ]; then tr '\0' '\n' < "/proc/$ENV_PID/environ" 2>/dev/null | sed -n "s/^$1=//p" | head -1; else printenv "$1"; fi; }
if [ -n "$ENV_PID" ] && [ ! -r "/proc/$ENV_PID/environ" ]; then fail "/proc/$ENV_PID/environ illisible (autre utilisateur ou PID inexistant)"
else
  [ -z "$ENV_PID" ] && info "environnement du shell courant (les variables cPanel peuvent être invisibles ici : utiliser --env-from-pid)"
  for v in DATABASE_URL AUTH_SECRET TEACHER_INVITE_CODE; do
    if [ -n "$(envval $v)" ]; then ok "$v définie"; elif [ -n "$ENV_PID" ]; then fail "$v absente"; else skip "$v non vérifiable depuis ce shell"; fi; done
  AS=$(envval AUTH_SECRET); [ -n "$AS" ] && [ "${#AS}" -lt 32 ] && warn "AUTH_SECRET courte (${#AS} caractères ; 32 ou plus recommandés — l'application ne refuse que l'absence ou une valeur par défaut connue)"
  NE=$(envval NODE_ENV); [ "$NE" = production ] && ok "NODE_ENV=production" || { [ -n "$ENV_PID" ] && fail "NODE_ENV='${NE:-absente}' (production attendu)"; }
  TK=$(envval TOKIO_WORKER_THREADS)
  if [ -z "$TK" ]; then [ -n "$ENV_PID" ] && warn "TOKIO_WORKER_THREADS absente de l'environnement cPanel (la garde de server.js s'applique, mais la variable doit rester configurée)"
  elif ! [[ "$TK" =~ ^[0-9]+$ ]] || [ "$TK" -lt 1 ] || [ "$TK" -gt 3 ]; then fail "TOKIO_WORKER_THREADS='$TK' (1 à 3 attendu, 2 en production)"
  else ok "TOKIO_WORKER_THREADS=$TK"; fi
  for v in ALLOW_DEMO_SECRETS INSECURE_COOKIES SHOW_DRAFTS; do [ -n "$(envval $v)" ] && fail "$v est définie : interdite en production"; done
fi

echo "== 5. Marge de ressources (compte $ME)"
USED=$(ps -eL -u "$ME" --no-headers 2>/dev/null | wc -l); FREE=$((NPROC_LIMIT-USED))
info "NPROC : $USED threads/processus utilisés sur $NPROC_LIMIT (ulimit -u du shell : $(ulimit -u))"
[ "$FREE" -ge "$MIN_FREE_THREADS" ] && ok "marge NPROC : $FREE (minimum $MIN_FREE_THREADS : 13 pour la nouvelle instance + 13 pour le recouvrement + réserve WordPress)" || fail "marge NPROC insuffisante : $FREE < $MIN_FREE_THREADS"
[ "$USED" -le $((NPROC_LIMIT*60/100)) ] || warn "NPROC au-dessus de 60 % ($USED/$NPROC_LIMIT)"
RSS_USED=$(ps -u "$ME" -o rss= 2>/dev/null | awk '{s+=$1} END{print int(s/1024)}'); MFREE=$((MEM_LIMIT_MB-RSS_USED))
info "RSS cumulé du compte : ${RSS_USED} Mo sur ${MEM_LIMIT_MB} Mo (somme approximative : mémoire partagée comptée plusieurs fois)"
if [ "$MFREE" -lt 400 ]; then fail "marge mémoire insuffisante : ${MFREE} Mo < 400 Mo"; elif [ "$MFREE" -lt 700 ]; then warn "marge mémoire faible : ${MFREE} Mo"; else ok "marge mémoire : ${MFREE} Mo"; fi

echo "== 6. Processus Node existants (pour comparaison avec ops/verify.sh après le déploiement)"
N=0
for pid in $(node_pids "$ME"); do
  N=$((N+1)); cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null)
  echo "  pid=$pid ppid=$(ppid_of "$pid") age=$(ps -o etimes= -p "$pid" | tr -d ' ')s threads=$(threads "$pid") tokio=$(tokio "$pid") rss=$(rss_mb "$pid")Mo cwd=${cwd:-?}"
done
[ "$N" -gt 0 ] && info "le PPID est indiqué à titre d'information : il change en cours de vie sous LiteSpeed, ce n'est pas un critère d'anomalie" || info "aucun processus Node du compte (l'application démarre à la première requête)"
summary
