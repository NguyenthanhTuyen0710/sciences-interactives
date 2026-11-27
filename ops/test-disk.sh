#!/usr/bin/env bash
# Tests de ops/disk-check.sh, ops/cleanup.sh et de l'analyse du quota, sur un faux $HOME jetable (aucun accès au vrai compte).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
export HOME="$T/home"; A="$HOME/sciences-interactives"; NV="$HOME/nodevenv/sciences-interactives/22/lib/node_modules"
mkdir -p "$NV" "$A/public/uploads" "$A.rollback"; ln -s "$NV" "$A/node_modules"
mkdir -p "$T/ok/.next" "$T/bad/node_modules"; echo x > "$T/ok/.next/a"; echo x > "$T/bad/node_modules/a"
tar czf "$T/ok.tgz" -C "$T/ok" .next; tar czf "$T/bad.tgz" -C "$T/bad" node_modules
NOK=0; NKO=0
expect() { # $1 = code attendu, $2 = libellé, le reste = commande
  local want=$1 label=$2; shift 2; "$@" >"$T/out" 2>&1; local got=$?
  if [ "$got" -eq "$want" ]; then NOK=$((NOK+1)); echo "  ok    $label"; else NKO=$((NKO+1)); echo "  FAIL  $label (code $got, attendu $want)"; sed 's/^/        /' "$T/out" | tail -5; fi; }
D="$HERE/disk-check.sh"
expect 0 "quota 7168, occupation 2969.08, version 11 Mo : déploiement autorisé" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact "$T/ok.tgz" --release-mb 11
expect 0 "idem avec nouveau node_modules de 548 Mo" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3.1 --release-mb 11 --node-modules-mb 548
expect 1 "occupation 6500 : moins de 1 Go libre au pic" "$D" --quota-mb 7168 --used-mb 6500 --artifact-mb 3.1 --release-mb 11
expect 1 "pas de quota lisible ni fourni : refus (aucun repli sur df)" env PATH=/usr/bin:/bin "$D" --used-mb 2969.08 --artifact-mb 3.1 --release-mb 11
expect 1 "tailles de version manquantes : refus" "$D" --quota-mb 7168 --used-mb 2969.08
expect 1 "artefact contenant node_modules : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact "$T/bad.tgz" --release-mb 11
expect 1 "nombre avec séparateur de milliers : refus" "$D" --quota-mb 7.168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
rm "$A/node_modules"; mkdir "$A/node_modules"
expect 1 "node_modules réel (pas un lien) : refus" "$D" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3 --release-mb 11
rmdir "$A/node_modules"; ln -s "$NV" "$A/node_modules"
C="$HERE/cleanup.sh"
mkdir -p "$A.rollback.prev" "$A.failed" "$HOME/public_html" "$HOME/autre-site"; echo keep > "$HOME/public_html/i"; echo keep > "$HOME/autre-site/i"
expect 1 "cleanup --apply sans --verified : refus" "$C" --apply
expect 1 "cleanup hors sciences-interactives : refus" "$C" --app-dir "$HOME/public_html"
expect 0 "cleanup en simulation" "$C"
[ -d "$A.failed" ] && { NOK=$((NOK+1)); echo "  ok    la simulation ne supprime rien"; } || { NKO=$((NKO+1)); echo "  FAIL  la simulation a supprimé"; }
expect 0 "cleanup --apply --verified" "$C" --apply --verified
if [ ! -e "$A.failed" ] && [ ! -e "$A.rollback.prev" ] && [ -d "$A.rollback" ] && [ -L "$A/node_modules" ] && [ -d "$A/public/uploads" ] && [ -f "$HOME/public_html/i" ] && [ -f "$HOME/autre-site/i" ]; then
  NOK=$((NOK+1)); echo "  ok    cibles supprimées ; rollback, lien node_modules, uploads et autres sites conservés"; else NKO=$((NKO+1)); echo "  FAIL  état final inattendu"; fi
rm -rf "$A.staging"; ln -s "$HOME/autre-site" "$A.staging"
expect 1 "cleanup refuse un lien symbolique parmi les cibles" "$C" --apply --verified
[ -f "$HOME/autre-site/i" ] && { NOK=$((NOK+1)); echo "  ok    la cible du lien est intacte"; } || { NKO=$((NKO+1)); echo "  FAIL  la cible du lien a été touchée"; }
# analyse du quota (blocs de 1 Kio → Mo)
Q1=$(printf 'Disk quotas for user u (uid 1):\n     Filesystem  blocks   quota   limit   grace   files\n          /home 3040336* 7340032 7340032          123456       0\n' | quota_mb_from_text)
Q2=$(printf 'Disk quotas for user u (uid 1):\n     Filesystem  blocks   quota   limit\n/dev/mapper/vg-home-nom-long\n                 3040336       0 7340032\n' | quota_mb_from_text)
Q3=$(printf 'rien de numérique\n' | quota_mb_from_text)
[ "$Q1" = "7168.00" ] && [ "$Q2" = "7168.00" ] && [ -z "$Q3" ] && { NOK=$((NOK+1)); echo "  ok    analyse du quota (ligne simple, nom de système de fichiers à la ligne, format inconnu)"; } || { NKO=$((NKO+1)); echo "  FAIL  analyse du quota ($Q1 / $Q2 / $Q3)"; }
echo "== $NOK réussi(s), $NKO échec(s)"
[ "$NKO" -eq 0 ]
