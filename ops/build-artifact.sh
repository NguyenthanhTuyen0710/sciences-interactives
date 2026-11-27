#!/usr/bin/env bash
# Construit l'artefact de déploiement (flux A : dépendances inchangées) à partir d'un `npm run build` déjà fait, en CI ou en local.
# Contenu : .next (sans cache de build), package.json, package-lock.json, next.config.ts (lu au démarrage par `next start` : le retirer changerait la configuration
# réellement appliquée), server.js (= ops/server.js), RELEASE.json.
# Jamais dans l'artefact : node_modules (lien CloudLinux vers nodevenv), public/ (donc public/uploads), sources, tests, .git, .next/cache.
# .next/cache est un cache de BUILD (webpack, eslint, swc) : le runtime n'en a pas besoin et Next.js recrée ses caches d'exécution (fetch, images) à la demande.
#
# Usage : ops/build-artifact.sh [--out DIR] [--commit SHA]     (sortie : DIR/sciences-interactives-<sha12>.tar.gz et .sha256)
set -eu
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/.." && pwd); cd "$ROOT"
OUT=$ROOT/artifact; COMMIT=${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}
while [ $# -gt 0 ]; do case "$1" in --out) OUT=$2; shift 2;; --commit) COMMIT=$2; shift 2;; *) echo "Option inconnue : $1"; exit 1;; esac; done
[ -f .next/BUILD_ID ] || { echo "Build absent : lancer npm run build."; exit 1; }
NODE=$(command -v node)
mkdir -p "$OUT"; STAGE=$(mktemp -d); trap 'rm -rf "$STAGE"' EXIT
mkdir "$STAGE/r"
tar -c --exclude='.next/cache' .next | tar -x -C "$STAGE/r"
cp package.json package-lock.json next.config.ts "$STAGE/r/"; cp ops/server.js "$STAGE/r/server.js"
LOCK_SHA=$(sha256sum package-lock.json | awk '{print $1}')
"$NODE" -e '
const [commit, lock] = process.argv.slice(1);
const nx = require("./node_modules/next/package.json").version;
console.log(JSON.stringify({ name: "sciences-interactives", commit, built_at: new Date().toISOString(), node: process.version, platform: process.platform + "-" + process.arch, next: nx, lock_sha256: lock }, null, 2));
' "$COMMIT" "$LOCK_SHA" > "$STAGE/r/RELEASE.json"
NAME=sciences-interactives-$(echo "$COMMIT" | cut -c1-12).tar.gz
tar -C "$STAGE/r" --sort=name --owner=0 --group=0 --numeric-owner -czf "$OUT/$NAME" .next package.json package-lock.json next.config.ts server.js RELEASE.json
( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
echo "artefact : $OUT/$NAME ($(du -k "$OUT/$NAME" | awk '{printf "%.1f", $1/1024}') Mo compressé, $(du -sk "$STAGE/r" | awk '{printf "%.1f", $1/1024}') Mo décompressé)"
cat "$OUT/$NAME.sha256"
