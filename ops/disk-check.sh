#!/usr/bin/env bash
# Contrôle d'espace disque avant déploiement (lecture seule), fondé sur le QUOTA du compte cPanel, jamais sur `df`.
# Calcule le pic d'occupation pendant la préparation (staging), la bascule et le retour arrière, puis refuse si moins de MIN_FREE Mo restent libres.
#
# Disposition (un seul rollback et un seul staging) :
#   <app>                       version en production (chemin enregistré dans cPanel)   <app>.staging   version en préparation
#   <app>.rollback              version précédente                                       <app>.rollback.prev, <app>.failed, <app>.artifact.tar.gz : transitoires
#   <app>/node_modules          lien symbolique CloudLinux vers ~/nodevenv/… : jamais remplacé, jamais copié
#
# Usage : ops/disk-check.sh [--app-dir DIR] [--quota-mb N] [--used-mb N] (--artifact FICHIER | --artifact-mb N) --release-mb N
#                           [--node-modules-mb N] [--min-free-mb 1024] [--margin-mb 100]
#   --quota-mb / --used-mb : valeurs lues dans cPanel → Disk Usage (« Disk Quota » ; la plus haute des valeurs d'occupation affichées,
#                            ex. « Total Disk Space Used »). Point décimal, sans séparateur de milliers : 2969.08. À défaut, le quota est lu avec `quota`
#                            et l'occupation mesurée avec `du` sur $HOME ; si le quota reste illisible, le contrôle ÉCHOUE (pas de repli sur df).
#   --release-mb           : taille décompressée de la nouvelle version, node_modules exclu.
#   --node-modules-mb      : taille d'un nouveau node_modules à préparer à côté de l'ancien (0 si package-lock.json est inchangé).
# Codes de sortie : 0 = marge suffisante · 1 = échec ou donnée manquante (ne pas déployer).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=ops/lib.sh
. "$HERE/lib.sh"

APP="$HOME/sciences-interactives"; QUOTA=""; USED=""; ART_FILE=""; ART_MB=""; REL_MB=""; NM_MB=0; MIN_FREE=1024; MARGIN=100
while [ $# -gt 0 ]; do case "$1" in
  --app-dir) APP=${2%/}; shift 2;; --quota-mb) QUOTA=$2; shift 2;; --used-mb) USED=$2; shift 2;;
  --artifact) ART_FILE=$2; shift 2;; --artifact-mb) ART_MB=$2; shift 2;; --release-mb) REL_MB=$2; shift 2;;
  --node-modules-mb) NM_MB=$2; shift 2;; --min-free-mb) MIN_FREE=$2; shift 2;; --margin-mb) MARGIN=$2; shift 2;;
  *) echo "Option inconnue : $1"; exit 1;; esac; done
for v in "$QUOTA" "$USED" "$ART_MB" "$REL_MB" "$NM_MB" "$MIN_FREE" "$MARGIN"; do
  [ -z "$v" ] || is_num "$v" || { echo "Valeur numérique invalide « $v » : point décimal, aucun séparateur de milliers (ex. 2969.08)."; exit 1; }
done
STAGING="$APP.staging"; ROLLBACK="$APP.rollback"
mb_of() { [ -e "$1" ] && du -sm "$1" 2>/dev/null | awk '{print $1}' || echo 0; }   # du ne suit pas les liens symboliques : node_modules (lien) compte 0

echo "== 1. Quota et occupation (cPanel)"
QSRC="paramètre --quota-mb"
if [ -z "$QUOTA" ] && command -v quota >/dev/null 2>&1; then
  QUOTA=$(quota -u "$(id -un)" 2>/dev/null | quota_mb_from_text); QSRC="commande quota"
fi
if [ -z "$QUOTA" ]; then fail "quota illisible : relever « Disk Quota » dans cPanel → Disk Usage et le fournir avec --quota-mb (aucun repli sur df)"; summary; exit 1; fi
ok "quota : ${QUOTA} Mo (${QSRC})"
USRC="paramètre --used-mb"
if [ -z "$USED" ]; then USED=$(du -sm "$HOME" 2>/dev/null | awk '{print $1}'); USRC="du -sm \$HOME (peut différer de cPanel : fournir --used-mb)"; fi
[ -n "$USED" ] || { fail "occupation illisible : fournir --used-mb (cPanel → Total Disk Space Used)"; summary; exit 1; }
FREE_NOW=$(calc "$QUOTA - $USED")
info "occupation : ${USED} Mo (${USRC}) ; libre aujourd'hui : ${FREE_NOW} Mo"
num_lt "$FREE_NOW" 0 && fail "occupation supérieure au quota"

echo "== 2. Liens symboliques CloudLinux et disposition"
if [ -L "$APP/node_modules" ]; then
  T=$(readlink "$APP/node_modules"); case "$T" in */nodevenv/*) ok "node_modules est un lien vers nodevenv ($T)";; *) warn "node_modules est un lien, mais pas vers ~/nodevenv ($T)";; esac
  [ -e "$APP/node_modules" ] || fail "le lien node_modules est cassé ($T)"
elif [ -d "$APP/node_modules" ]; then fail "$APP/node_modules est un dossier réel : CloudLinux attend un lien vers nodevenv ; ne rien déployer par-dessus"
else warn "$APP/node_modules absent"; fi
if [ -d "$STAGING" ]; then
  if [ -L "$STAGING/node_modules" ]; then ok "staging : node_modules est un lien"; elif [ -e "$STAGING/node_modules" ]; then fail "staging : node_modules réel (dupliquerait des centaines de Mo et remplacerait le lien) : à exclure de l'artefact"; fi
fi
if [ -n "$ART_FILE" ]; then
  if [ -f "$ART_FILE" ]; then
    LIST=$(tar -tzf "$ART_FILE" 2>/dev/null) || { fail "artefact illisible ($ART_FILE)"; LIST=""; }
    echo "$LIST" | grep -Eq '^(\./)?node_modules(/|$)' && fail "l'artefact contient node_modules : à exclure (lien CloudLinux, quota)" || ok "artefact sans node_modules"
    echo "$LIST" | grep -Eq '(^|/)\.next/cache(/|$)' && warn "l'artefact contient .next/cache (cache de build, inutile au runtime)"
    [ -z "$ART_MB" ] && ART_MB=$(calc "$(stat -c %s "$ART_FILE") / 1048576")
  else fail "artefact introuvable : $ART_FILE"; fi
fi
OTHERS=""
for d in "$APP".*; do
  [ -e "$d" ] || continue
  case "$d" in "$STAGING"|"$ROLLBACK"|"$APP.rollback.prev"|"$APP.failed"|"$APP.artifact.tar.gz"|"$APP.artifact.tar.gz.sha256") ;; *) OTHERS="$OTHERS $d" ;; esac
done
[ -z "$OTHERS" ] || warn "autres dossiers $(basename "$APP").* (maximum : un staging, un rollback ; rien n'est supprimé par ce script) : $OTHERS"

echo "== 3. Pic d'occupation (staging → bascule → retour arrière)"
if [ -z "$ART_MB" ] || [ -z "$REL_MB" ]; then
  fail "taille de l'artefact (--artifact ou --artifact-mb) et/ou de la version (--release-mb) non fournie : pic non calculé, ne pas déployer"
  summary; exit 1
fi
UP=$(mb_of "$APP/public/uploads"); RB=$(mb_of "$ROLLBACK"); RBP=$(mb_of "$APP.rollback.prev")
info "artefact ${ART_MB} Mo · version décompressée ${REL_MB} Mo · public/uploads copié ${UP} Mo · nouveau node_modules ${NM_MB} Mo · rollback actuel ${RB} Mo · marge ${MARGIN} Mo"
# Staging et bascule : l'ancien rollback est conservé jusqu'à la vérification ; l'artefact n'est supprimé qu'après.
PEAK=$(calc "$USED + $ART_MB + $REL_MB + $UP + $NM_MB + $MARGIN")
# Régime établi après déploiement : nouvelle version + un rollback (l'ancienne production) ; l'ancien rollback et l'artefact sont supprimés.
STEADY=$(calc "$USED + $REL_MB + $UP + $NM_MB - $RB - $RBP + $MARGIN")
# Retour arrière : échange de noms, sans copie ; il faut seulement que le régime établi tienne (l'ancien node_modules est conservé tant que le rollback existe).
printf '  %-34s %10s Mo   libre : %10s Mo\n' "pic (staging + bascule)" "$PEAK" "$(calc "$QUOTA - $PEAK")"
printf '  %-34s %10s Mo   libre : %10s Mo\n' "après déploiement (nettoyé)" "$STEADY" "$(calc "$QUOTA - $STEADY")"
printf '  %-34s %10s Mo   libre : %10s Mo\n' "retour arrière (échange de noms)" "$STEADY" "$(calc "$QUOTA - $STEADY")"
num_lt "$(calc "$QUOTA - $PEAK")" "$MIN_FREE" && fail "pic : moins de ${MIN_FREE} Mo libres ($(calc "$QUOTA - $PEAK") Mo) : ne pas déployer" || ok "pic : au moins ${MIN_FREE} Mo libres"
num_lt "$(calc "$QUOTA - $STEADY")" "$MIN_FREE" && fail "après déploiement/retour arrière : moins de ${MIN_FREE} Mo libres : ne pas déployer" || ok "après déploiement et retour arrière : au moins ${MIN_FREE} Mo libres"
summary
