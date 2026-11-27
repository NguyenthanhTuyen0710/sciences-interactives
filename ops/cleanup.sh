#!/usr/bin/env bash
# Nettoyage APRÈS un déploiement vérifié : supprime uniquement les restes transitoires de sciences-interactives.
# Par défaut : simulation (liste ce qui serait supprimé). Suppression réelle seulement avec --apply --verified.
#
# Liste FERMÉE de cibles, toutes à côté du dossier de l'application (aucun motif, aucun autre chemin possible) :
#   <app>.rollback.prev   ancien rollback, remplacé par l'ancienne production
#   <app>.failed          version en échec après un retour arrière
#   <app>.staging         staging abandonné
#   <app>.artifact.tar.gz et <app>.artifact.tar.gz.sha256   artefact transféré
# JAMAIS supprimés : <app>, <app>.rollback (le seul rollback conservé), <app>/node_modules (lien CloudLinux), nodevenv, public/uploads,
# public_html, bases de données, tout ce qui est hors de la liste ci-dessus.
#
# Usage : ops/cleanup.sh [--app-dir DIR] [--apply --verified]
#   --verified : atteste que ops/verify.sh vient de réussir sur la version en production (ou après retour arrière).
# Codes de sortie : 0 = terminé (ou simulation) · 1 = refus ou erreur.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP="$HOME/sciences-interactives"; APPLY=0; VERIFIED=0
while [ $# -gt 0 ]; do case "$1" in
  --app-dir) APP=${2%/}; shift 2;; --apply) APPLY=1; shift;; --verified) VERIFIED=1; shift;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done

# Garde-fous sur la racine : doit s'appeler sciences-interactives et se trouver directement dans $HOME.
[ "$(basename "$APP")" = "sciences-interactives" ] || { echo "Refus : le dossier doit s'appeler sciences-interactives."; exit 1; }
[ "$(cd "$(dirname "$APP")" 2>/dev/null && pwd -P)" = "$(cd "$HOME" && pwd -P)" ] || { echo "Refus : le dossier doit se trouver directement dans \$HOME."; exit 1; }
[ -d "$APP" ] || { echo "Refus : $APP n'existe pas (la version en production doit être en place)."; exit 1; }
if [ "$APPLY" = 1 ] && [ "$VERIFIED" != 1 ]; then echo "Refus : --apply exige --verified (atteste que ops/verify.sh vient de réussir)."; exit 1; fi

TARGETS=("$APP.rollback.prev" "$APP.failed" "$APP.staging" "$APP.artifact.tar.gz" "$APP.artifact.tar.gz.sha256")
HOME_REAL=$(cd "$HOME" && pwd -P); FREED=0; N=0; RC=0
echo "== Nettoyage de $(basename "$APP") ($([ "$APPLY" = 1 ] && echo suppression réelle || echo simulation))"
for t in "${TARGETS[@]}"; do
  [ -e "$t" ] || [ -L "$t" ] || continue
  N=$((N+1))
  if [ -L "$t" ]; then fail "$t est un lien symbolique : refusé, rien supprimé"; RC=1; continue; fi
  real=$(cd "$(dirname "$t")" && pwd -P)/$(basename "$t")
  case "$real" in "$HOME_REAL"/sciences-interactives.*) ;; *) fail "$t sort du périmètre : refusé"; RC=1; continue ;; esac
  sz=$(du -sm "$t" 2>/dev/null | awk '{print $1}')
  if [ "$APPLY" = 1 ]; then
    if [ -d "$t" ]; then rm -r -- "$t"; else rm -f -- "$t"; fi && { ok "supprimé : $t (${sz} Mo)"; FREED=$((FREED+sz)); } || { fail "suppression impossible : $t"; RC=1; }
  else info "serait supprimé : $t (${sz} Mo)"; FREED=$((FREED+sz)); fi
done
[ "$N" -gt 0 ] || info "rien à nettoyer"
info "espace $([ "$APPLY" = 1 ] && echo libéré || echo récupérable) : ${FREED} Mo"
info "conservés : $APP, $APP.rollback ($([ -d "$APP.rollback" ] && echo présent || echo absent)), node_modules (lien), public/uploads"
[ "$RC" -eq 0 ]
