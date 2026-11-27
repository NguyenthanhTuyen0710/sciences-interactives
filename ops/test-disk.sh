#!/usr/bin/env bash
# Tests de ops/disk-check.sh, ops/cleanup.sh, ops/deploy-lock.sh et de l'analyse du quota, sur un faux $HOME jetable (aucun accès au vrai compte).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
export HOME="$T/home"; A="$HOME/sciences-interactives"; R="$A/.release"; NV="$HOME/nodevenv/sciences-interactives/22/lib/node_modules"
mkdir -p "$NV" "$A/.next" "$R/rollback/.next"; echo x > "$A/server.js"; ln -s "$NV" "$A/node_modules"
dd if=/dev/zero of="$R/rollback/.next/r.bin" bs=1M count=11 2>/dev/null
mkdir -p "$T/ok/.next" "$T/bad/node_modules" "$T/bad2/public/uploads" "$T/bad2/.next"
for d in ok bad2; do echo x > "$T/$d/.next/BUILD_ID"; echo x > "$T/$d/server.js"; echo x > "$T/$d/package.json"; echo x > "$T/$d/RELEASE.json"; done
echo x > "$T/bad/node_modules/a"; echo x > "$T/bad2/public/uploads/u.jpg"
tar czf "$T/ok.tgz" -C "$T/ok" .next server.js package.json RELEASE.json; tar czf "$T/bad.tgz" -C "$T/bad" node_modules; tar czf "$T/bad2.tgz" -C "$T/bad2" .next server.js package.json RELEASE.json public
NOK=0; NKO=0
pass() { NOK=$((NOK+1)); echo "  ok    $1"; }
nope() { NKO=$((NKO+1)); echo "  FAIL  $1"; }
expect() { local want=$1 label=$2; shift 2; "$@" >"$T/out" 2>&1; local got=$?
  if [ "$got" -eq "$want" ]; then pass "$label"; else nope "$label (code $got, attendu $want)"; sed 's/^/        /' "$T/out" | tail -5; fi; }
D="$HERE/disk-check.sh"
expect 0 "quota 7168, occupation 2969.08, version 11 Mo : autorisé" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact "$T/ok.tgz" --release-mb 11
expect 0 "idem avec nouveau node_modules de 548 Mo (flux B)" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3.1 --release-mb 11 --node-modules-mb 548
expect 1 "occupation 6500 : moins de 1 Go libre au pic" "$D" --quota-mb 7168 --used-mb 6500 --artifact-mb 3.1 --release-mb 11
expect 1 "quota illisible et non fourni : refus (aucun repli sur df)" env PATH=/usr/bin:/bin "$D" --used-mb 2969.08 --artifact-mb 3.1 --release-mb 11
expect 1 "tailles manquantes : refus" "$D" --quota-mb 7168 --used-mb 2969.08
expect 1 "artefact contenant node_modules : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact "$T/bad.tgz" --release-mb 11
expect 1 "artefact contenant public/ (donc public/uploads) : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact "$T/bad2.tgz" --release-mb 11
expect 1 "séparateur de milliers : refus" "$D" --quota-mb 7.168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
# pas de double comptage : seuil exact
OUT=$("$D" --quota-mb 4300 --used-mb 3000 --artifact-mb 100 --release-mb 100 --margin-mb 0 2>&1); echo "$OUT" | grep -q "pic .*3200.00 Mo" && pass "pic = occupation + artefact + version (3200)" || nope "calcul du pic ($OUT)"
OUT=$("$D" --quota-mb 4300 --used-mb 3000 --artifact-mb 100 --release-mb 100 --margin-mb 0 --used-includes-artifact --used-includes-staging 2>&1); echo "$OUT" | grep -q "pic .*3000.00 Mo" && pass "occupation incluant déjà artefact et staging : pas de double comptage (3000)" || nope "double comptage ($OUT)"
OUT=$("$D" --quota-mb 7168 --used-mb 3000 --artifact-mb 100 --release-mb 100 --margin-mb 0 2>&1); echo "$OUT" | grep -q "après déploiement.*3088.00 Mo" && pass "rollback existant (12 Mo mesurés par du) libéré après déploiement : 3000 + 100 − 12" || nope "régime établi ($OUT)"
mkdir "$A/.release/staging" "$A/.release/staging/node_modules"
expect 1 "staging contenant node_modules : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
rm -rf "$A/.release/staging"
rm "$A/node_modules"; mkdir "$A/node_modules"
expect 1 "node_modules réel (pas un lien) : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
rmdir "$A/node_modules"; ln -s "$NV" "$A/node_modules"
L="$HERE/deploy-lock.sh"
expect 0 "verrou : acquisition" "$L" acquire deploy
expect 1 "verrou : seconde acquisition refusée (pas de déploiements simultanés)" "$L" acquire deploy
expect 0 "disk-check avertit mais ne bloque pas quand un verrou existe" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
C="$HERE/cleanup.sh"
mkdir -p "$R/rollback.prev" "$R/failed" "$HOME/public_html" "$HOME/autre-site" "$A/public/uploads"; echo keep > "$HOME/public_html/i"; echo keep > "$HOME/autre-site/i"; echo keep > "$A/public/uploads/u.jpg"
echo t > "$R/artifact.tar.gz"; echo s > "$R/artifact.tar.gz.sha256"
expect 1 "cleanup --apply pendant un déploiement (verrou) : refus" "$C" --apply --verified
"$L" release >/dev/null
expect 1 "cleanup --apply sans --verified : refus" "$C" --apply
expect 1 "cleanup hors sciences-interactives : refus" "$C" --app-dir "$HOME/public_html"
expect 0 "cleanup en simulation" "$C"
[ -d "$R/failed" ] && pass "la simulation ne supprime rien" || nope "la simulation a supprimé"
expect 0 "cleanup --apply --verified" "$C" --apply --verified
if [ ! -e "$R/failed" ] && [ ! -e "$R/rollback.prev" ] && [ ! -e "$R/artifact.tar.gz" ] && [ -d "$R/rollback" ] && [ -L "$A/node_modules" ] && [ -f "$A/public/uploads/u.jpg" ] && [ -f "$HOME/public_html/i" ] && [ -f "$HOME/autre-site/i" ] && [ ! -d "$(lock_dir "$A")" ]; then
  pass "cibles supprimées ; rollback, lien node_modules, uploads, autres sites conservés ; verrou levé"; else nope "état final inattendu"; fi
ln -s "$HOME/autre-site" "$R/staging"
expect 1 "cleanup refuse un lien symbolique parmi les cibles" "$C" --apply --verified
[ -f "$HOME/autre-site/i" ] && pass "la cible du lien est intacte" || nope "la cible du lien a été touchée"
rm "$R/staging"; mv "$R" "$T/release-reel"; ln -s "$T/release-reel" "$R"
expect 1 "cleanup refuse un .release remplacé par un lien (traversée de chemin)" "$C" --apply --verified
rm "$R"; mv "$T/release-reel" "$R"
Q1=$(printf 'Disk quotas for user u (uid 1):\n     Filesystem  blocks   quota   limit   grace   files\n          /home 3040336* 7340032 7340032          123456       0\n' | quota_mb_from_text)
Q2=$(printf 'Disk quotas for user u (uid 1):\n     Filesystem  blocks   quota   limit\n/dev/mapper/vg-home-nom-long\n                 3040336       0 7340032\n' | quota_mb_from_text)
Q3=$(printf 'rien de numérique\n' | quota_mb_from_text)
[ "$Q1" = "7168.00" ] && [ "$Q2" = "7168.00" ] && [ -z "$Q3" ] && pass "analyse du quota (ligne simple, nom de système de fichiers à la ligne, format inconnu)" || nope "analyse du quota ($Q1 / $Q2 / $Q3)"
echo "== $NOK réussi(s), $NKO échec(s)"
[ "$NKO" -eq 0 ]
