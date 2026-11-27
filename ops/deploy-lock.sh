#!/usr/bin/env bash
# Verrou d'exploitation de sciences-interactives : empêche deux déploiements, ou un déploiement et un nettoyage, en même temps.
# Usage : ops/deploy-lock.sh acquire <deploy|rollback> [--app-dir DIR] · release [--app-dir DIR] · status [--app-dir DIR]
# Le verrou est un dossier créé atomiquement ; il n'est jamais levé automatiquement (un verrou orphelin se lève à la main avec `release`,
# après avoir vérifié qu'aucun déploiement n'est en cours).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"
CMD=${1:-}; shift || true; PURPOSE=""; APP="$HOME/sciences-interactives"
[ "$CMD" = acquire ] && { PURPOSE=${1:-}; shift || true; }
while [ $# -gt 0 ]; do case "$1" in --app-dir) APP=${2%/}; shift 2;; *) echo "Option inconnue : $1"; exit 1;; esac; done
case "$CMD" in
  acquire)
    case "$PURPOSE" in deploy|rollback) ;; *) echo "Usage : acquire <deploy|rollback>"; exit 1;; esac
    if lock_try "$APP" "$PURPOSE"; then echo "verrou acquis ($PURPOSE)"; else echo "REFUS : un verrou existe déjà :"; lock_info "$APP" | sed 's/^/  /'; exit 1; fi ;;
  release) lock_free "$APP"; echo "verrou levé" ;;
  status) if [ -d "$(lock_dir "$APP")" ]; then echo "verrou présent :"; lock_info "$APP" | sed 's/^/  /'; else echo "aucun verrou"; fi ;;
  *) echo "Usage : ops/deploy-lock.sh acquire <deploy|rollback>|release|status [--app-dir DIR]"; exit 1 ;;
esac
