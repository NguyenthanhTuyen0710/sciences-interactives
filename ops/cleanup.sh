#!/usr/bin/env bash
# Nettoyage APRÈS un déploiement ou un retour arrière vérifié : supprime uniquement des restes transitoires dans <app>/.release/.
# Par défaut : simulation. Suppression réelle seulement avec --apply --verified, et seulement si aucun déploiement n'est en cours (verrou).
#
# Liste FERMÉE de cibles, toutes sous <app>/.release/ (aucun motif, aucun autre chemin possible) :
#   rollback.prev   ancien rollback, remplacé par l'ancienne production     failed   version en échec après un retour arrière
#   staging         staging abandonné                                         artifact.tar.gz et artifact.tar.gz.sha256   artefact transféré
# JAMAIS supprimés : la version en production, <app>/.release/rollback (le seul rollback conservé), <app>/node_modules (lien CloudLinux),
# nodevenv, public/ et public/uploads, public_html, WordPress, bases de données, courriers, tout autre chemin.
#
# Usage : ops/cleanup.sh [--app-dir DIR] [--apply --verified]
#   --verified : atteste que ops/verify.sh vient de réussir sur la version en production (ou après un retour arrière).
# Codes de sortie : 0 = terminé (ou simulation) · 1 = refus ou erreur.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP="$HOME/sciences-interactives"; APPLY=0; VERIFIED=0
while [ $# -gt 0 ]; do case "$1" in
  --app-dir) APP=${2%/}; shift 2;; --apply) APPLY=1; shift;; --verified) VERIFIED=1; shift;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done

# Garde-fous sur la racine : bon nom, directement dans $HOME, ni lien symbolique, version en production en place.
[ "$(basename "$APP")" = "sciences-interactives" ] || { echo "Refus : le dossier doit s'appeler sciences-interactives."; exit 1; }
[ "$(cd "$(dirname "$APP")" 2>/dev/null && pwd -P)" = "$(cd "$HOME" && pwd -P)" ] || { echo "Refus : le dossier doit se trouver directement dans \$HOME."; exit 1; }
[ -L "$APP" ] && { echo "Refus : $APP est un lien symbolique."; exit 1; }
[ -d "$APP" ] && [ -f "$APP/server.js" ] || { echo "Refus : $APP/server.js introuvable (la version en production doit être en place)."; exit 1; }
[ -L "$APP/$REL_DIR" ] && { echo "Refus : $APP/$REL_DIR est un lien symbolique."; exit 1; }
if [ "$APPLY" = 1 ] && [ "$VERIFIED" != 1 ]; then echo "Refus : --apply exige --verified (atteste que ops/verify.sh vient de réussir)."; exit 1; fi

R="$APP/$REL_DIR"; R_REAL=$(cd "$R" 2>/dev/null && pwd -P) || { echo "Rien à nettoyer : $R n'existe pas."; exit 0; }
case "$R_REAL" in "$(cd "$HOME" && pwd -P)"/sciences-interactives/.release) ;; *) echo "Refus : $R sort du périmètre."; exit 1;; esac
if [ "$APPLY" = 1 ]; then
  lock_try "$APP" cleanup || { echo "Refus : un déploiement, un retour arrière ou un autre nettoyage est en cours (verrou) :"; lock_info "$APP" | sed 's/^/  /'; exit 1; }
  trap 'lock_free "$APP"' EXIT
elif [ -d "$(lock_dir "$APP")" ]; then info "un verrou est présent : la suppression réelle serait refusée"; fi

TARGETS=("$R/rollback.prev" "$R/failed" "$R/staging" "$R/artifact.tar.gz" "$R/artifact.tar.gz.sha256")
FREED=0; N=0; RC=0
echo "== Nettoyage de $REL_DIR ($([ "$APPLY" = 1 ] && echo suppression réelle || echo simulation))"
for t in "${TARGETS[@]}"; do
  [ -e "$t" ] || [ -L "$t" ] || continue
  N=$((N+1))
  if [ -L "$t" ]; then fail "$t est un lien symbolique : refusé, rien supprimé"; RC=1; continue; fi
  real=$(cd "$(dirname "$t")" && pwd -P)/$(basename "$t")
  [ "$real" = "$R_REAL/$(basename "$t")" ] || { fail "$t sort du périmètre : refusé"; RC=1; continue; }
  sz=$(du -sm "$t" 2>/dev/null | awk '{print $1}')
  if [ "$APPLY" = 1 ]; then
    if [ -d "$t" ]; then rm -r -- "$t"; else rm -f -- "$t"; fi && { ok "supprimé : ${t#"$APP"/} (${sz} Mo)"; FREED=$((FREED+sz)); } || { fail "suppression impossible : $t"; RC=1; }
  else info "serait supprimé : ${t#"$APP"/} (${sz} Mo)"; FREED=$((FREED+sz)); fi
done
[ "$N" -gt 0 ] || info "rien à nettoyer"
info "espace $([ "$APPLY" = 1 ] && echo libéré || echo récupérable) : ${FREED} Mo"
info "conservés : version en production, $REL_DIR/rollback ($([ -d "$R/rollback" ] && echo présent || echo absent)), node_modules (lien), public/uploads"
[ "$RC" -eq 0 ]
