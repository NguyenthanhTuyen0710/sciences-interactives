#!/usr/bin/env bash
# Contrôle d'espace disque avant déploiement (lecture seule), fondé sur le QUOTA du compte cPanel, jamais sur `df`.
# Calcule le pic d'occupation pendant la préparation, la bascule et le retour arrière, puis refuse si moins de MIN_FREE Mo restent libres.
#
# Disposition : la racine de l'application n'est JAMAIS renommée. Une version = {.next, package.json, package-lock.json, server.js, RELEASE.json}.
#   <app>/.release/staging       nouvelle version (au plus une)         <app>/.release/rollback       version précédente (au plus une)
#   <app>/.release/rollback.prev, failed, artifact.tar.gz(.sha256) : transitoires
#   <app>/node_modules           lien symbolique CloudLinux vers ~/nodevenv/… : jamais remplacé ni copié
#   <app>/public/uploads         données des utilisateurs : jamais dans une version, jamais déplacé
#
# Usage : ops/disk-check.sh [--app-dir DIR] [--quota-mb N] [--used-mb N] (--artifact FICHIER | --artifact-mb N) --release-mb N
#                           [--node-modules-mb N] [--min-free-mb 1024] [--margin-mb 100] [--used-includes-artifact] [--used-includes-staging]
#   --quota-mb / --used-mb : valeurs de cPanel → Disk Usage (« Disk Quota » ; la plus haute des occupations affichées, ex. « Total Disk Space Used »).
#                            Point décimal, sans séparateur de milliers : 2969.08. À défaut, le quota est lu avec `quota` (s'il existe) et l'occupation
#                            mesurée avec `du` ; si le quota reste illisible, le contrôle ÉCHOUE (jamais de repli sur df).
#   --release-mb           : taille décompressée de la nouvelle version (sans cache de build ni node_modules).
#   --node-modules-mb      : taille d'un nouveau node_modules préparé à côté de l'ancien (0 si les dépendances sont inchangées : flux A).
#   --used-includes-*      : l'occupation relevée comprend déjà l'artefact transféré / le staging décompressé (évite de les compter deux fois).
#                            Avec une occupation mesurée par `du`, ces deux cas sont détectés automatiquement.
# Codes de sortie : 0 = marge suffisante · 1 = échec ou donnée manquante (ne pas déployer).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP="$HOME/sciences-interactives"; QUOTA=""; USED=""; ART_FILE=""; ART_MB=""; REL_MB=""; NM_MB=0; MIN_FREE=1024; MARGIN=100; INC_ART=0; INC_STG=0
while [ $# -gt 0 ]; do case "$1" in
  --app-dir) APP=${2%/}; shift 2;; --quota-mb) QUOTA=$2; shift 2;; --used-mb) USED=$2; shift 2;;
  --artifact) ART_FILE=$2; shift 2;; --artifact-mb) ART_MB=$2; shift 2;; --release-mb) REL_MB=$2; shift 2;;
  --node-modules-mb) NM_MB=$2; shift 2;; --min-free-mb) MIN_FREE=$2; shift 2;; --margin-mb) MARGIN=$2; shift 2;;
  --used-includes-artifact) INC_ART=1; shift;; --used-includes-staging) INC_STG=1; shift;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done
for v in "$QUOTA" "$USED" "$ART_MB" "$REL_MB" "$NM_MB" "$MIN_FREE" "$MARGIN"; do
  [ -z "$v" ] || is_num "$v" || { echo "Valeur numérique invalide « $v » : point décimal, aucun séparateur de milliers (ex. 2969.08)."; exit 1; }
done
R="$APP/$REL_DIR"; STAGING="$R/staging"; ROLLBACK="$R/rollback"; PREV="$R/rollback.prev"; FAILED="$R/failed"
mb_of() { { [ -e "$1" ] && du -sm "$1" 2>/dev/null | awk '{print $1}'; } || echo 0; }   # du ne suit pas les liens : node_modules (lien) compte 0

echo "== 1. Quota et occupation (cPanel)"
QSRC="paramètre --quota-mb"
if [ -z "$QUOTA" ] && command -v quota >/dev/null 2>&1; then QUOTA=$(quota -u "$(id -un)" 2>/dev/null | quota_mb_from_text); QSRC="commande quota"; fi
if [ -z "$QUOTA" ]; then fail "quota illisible : relever « Disk Quota » dans cPanel → Disk Usage et le fournir avec --quota-mb (aucun repli sur df)"; summary; exit 1; fi
ok "quota : ${QUOTA} Mo (${QSRC})"
USRC="paramètre --used-mb"
if [ -z "$USED" ]; then
  USED=$(du -sm "$HOME" 2>/dev/null | awk '{print $1}'); USRC="du -sm \$HOME (peut différer de cPanel : préférer --used-mb)"
  [ -f "$ART_FILE" ] && INC_ART=1; [ -d "$STAGING" ] && INC_STG=1   # une mesure faite maintenant contient déjà ces éléments
fi
[ -n "$USED" ] || { fail "occupation illisible : fournir --used-mb (cPanel → Total Disk Space Used)"; summary; exit 1; }
FREE_NOW=$(calc "$QUOTA - $USED")
info "occupation : ${USED} Mo (${USRC}) ; libre aujourd'hui : ${FREE_NOW} Mo"
num_lt "$FREE_NOW" 0 && fail "occupation supérieure au quota"

echo "== 2. Liens symboliques, disposition et verrou"
[ -L "$APP" ] && fail "$APP est un lien symbolique : refusé"
if [ -L "$APP/node_modules" ]; then
  T=$(readlink "$APP/node_modules"); case "$T" in */nodevenv/*) ok "node_modules est un lien vers nodevenv ($T)";; *) warn "node_modules est un lien, mais pas vers ~/nodevenv ($T)";; esac
  [ -e "$APP/node_modules" ] || fail "le lien node_modules est cassé ($T)"
elif [ -d "$APP/node_modules" ]; then fail "$APP/node_modules est un dossier réel : CloudLinux attend un lien vers nodevenv ; ne rien déployer par-dessus"
else warn "$APP/node_modules absent"; fi
[ -e "$APP/public/uploads" ] && info "public/uploads existe ($(mb_of "$APP/public/uploads") Mo) : il reste en place, aucune copie, aucun déplacement" || info "public/uploads n'existe pas (rien à préserver pour l'instant ; il est créé à la première image téléversée)"
[ -L "$R" ] && fail "$R est un lien symbolique : refusé"
if [ -d "$(lock_dir "$APP")" ]; then warn "un verrou d'exploitation est présent (un déploiement, un retour arrière ou un nettoyage est peut-être en cours) :"; lock_info "$APP" | sed 's/^/        /'; fi
if [ -d "$STAGING" ]; then
  for x in node_modules public; do [ -e "$STAGING/$x" ] && fail "staging : $x ne doit pas faire partie d'une version"; done
  [ -e "$STAGING/.next/cache" ] && warn "staging : .next/cache présent (cache de build inutile au runtime)"
fi
if [ -n "$ART_FILE" ]; then
  if [ -f "$ART_FILE" ]; then
    LIST=$(tar -tzf "$ART_FILE" 2>/dev/null) || { fail "artefact illisible ($ART_FILE)"; LIST=""; }
    echo "$LIST" | grep -Eq '^(\./)?node_modules(/|$)' && fail "l'artefact contient node_modules (lien CloudLinux, quota)"
    echo "$LIST" | grep -Eq '^(\./)?public(/|$)' && fail "l'artefact contient public/ (jamais dans une version : protège public/uploads)"
    echo "$LIST" | grep -Eq '(^|/)\.next/cache(/|$)' && warn "l'artefact contient .next/cache (cache de build, inutile au runtime)"
    for need in .next/BUILD_ID server.js package.json RELEASE.json; do echo "$LIST" | grep -Eq "^(\./)?$need\$" || fail "l'artefact ne contient pas $need"; done
    [ -z "$ART_MB" ] && ART_MB=$(calc "$(stat -c %s "$ART_FILE") / 1048576")
  else fail "artefact introuvable : $ART_FILE"; fi
fi
OTHERS=""
if [ -d "$R" ]; then for d in "$R"/*; do [ -e "$d" ] || continue
  case "$d" in "$STAGING"|"$ROLLBACK"|"$PREV"|"$FAILED"|"$R/artifact.tar.gz"|"$R/artifact.tar.gz.sha256"|"$R/deploy.lock") ;; *) OTHERS="$OTHERS $d" ;; esac; done; fi
[ -z "$OTHERS" ] || warn "éléments inattendus dans $R (un staging et un rollback au plus ; rien n'est supprimé par ce script) :$OTHERS"

echo "== 3. Pic d'occupation (staging → bascule → retour arrière)"
if [ -z "$ART_MB" ] || [ -z "$REL_MB" ]; then
  fail "taille de l'artefact (--artifact ou --artifact-mb) et/ou de la version (--release-mb) non fournie : pic non calculé, ne pas déployer"
  summary; exit 1
fi
RB=$(mb_of "$ROLLBACK"); RBP=$(mb_of "$PREV")
ADD_ART=$ART_MB; [ "$INC_ART" = 1 ] && ADD_ART=0
ADD_STG=$REL_MB; [ "$INC_STG" = 1 ] && ADD_STG=0
info "artefact ${ART_MB} Mo$([ "$INC_ART" = 1 ] && echo ' (déjà dans l'"'"'occupation)') · version ${REL_MB} Mo$([ "$INC_STG" = 1 ] && echo ' (déjà dans l'"'"'occupation)') · nouveau node_modules ${NM_MB} Mo · rollback actuel ${RB} Mo · rollback.prev ${RBP} Mo · marge ${MARGIN} Mo"
# Préparation et bascule : l'ancien rollback est conservé jusqu'à la vérification, l'artefact jusqu'au nettoyage ; la version en production devient le rollback (renommage, aucune copie).
PEAK=$(calc "$USED + $ADD_ART + $ADD_STG + $NM_MB + $MARGIN")
# Après nettoyage : la nouvelle version s'ajoute (sauf si le staging est déjà compté), l'artefact (s'il est compté) disparaît, ainsi que l'ancien rollback et rollback.prev.
SUB_ART=0; [ "$INC_ART" = 1 ] && SUB_ART=$ART_MB
STEADY=$(calc "$USED + $ADD_STG + $NM_MB - $SUB_ART - $RB - $RBP + $MARGIN")
# Les dossiers failed/ éventuels restent comptés dans l'occupation (jamais supprimés par ce calcul).
printf '  %-36s %10s Mo   libre : %10s Mo\n' "pic (préparation + bascule)" "$PEAK" "$(calc "$QUOTA - $PEAK")"
printf '  %-36s %10s Mo   libre : %10s Mo\n' "après déploiement (nettoyé)" "$STEADY" "$(calc "$QUOTA - $STEADY")"
printf '  %-36s %10s Mo   libre : %10s Mo\n' "retour arrière (échange de noms)" "$STEADY" "$(calc "$QUOTA - $STEADY")"
num_lt "$(calc "$QUOTA - $PEAK")" "$MIN_FREE" && fail "pic : moins de ${MIN_FREE} Mo libres ($(calc "$QUOTA - $PEAK") Mo) : ne pas déployer" || ok "pic : au moins ${MIN_FREE} Mo libres"
num_lt "$(calc "$QUOTA - $STEADY")" "$MIN_FREE" && fail "après déploiement et retour arrière : moins de ${MIN_FREE} Mo libres : ne pas déployer" || ok "après déploiement et retour arrière : au moins ${MIN_FREE} Mo libres"
summary
