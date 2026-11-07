#!/usr/bin/env bash
# Stockage persistant hors Git : release GitHub en BROUILLON (tag « data-store », ou $DATA_STORE_TAG pour les tests).
# Un brouillon n'est visible que des personnes ayant un accès en écriture ; le dépôt est public : ne JAMAIS le publier.
# Contenu autorisé : ledger.jsonl (+ ledger.sha256, ledger.backup.jsonl) et src-<sha256>.<ext> (documents dont la
# conservation est approuvée, cf. `pipeline/sources/run.ts storable`). Jamais de clé, de secret ni de document non autorisé.
#
#   init                 crée le brouillon et un registre vide (refuse s'il existe déjà)
#   pull-ledger          télécharge le registre, vérifie son SHA256 → pipeline/.store/{ledger,ledger.base}.jsonl
#                        (échoue si le brouillon est absent, publié, en double, ou si l'empreinte ne correspond pas)
#   push-ledger          vérifie (cohérence, ajout seul, absence de modification concurrente), sauvegarde la version
#                        précédente en ledger.backup.jsonl puis publie le nouveau registre et son SHA256
#   restore-ledger <f>   reconstitution manuelle (brouillon supprimé ou registre perdu) à partir d'une copie vérifiée
#   pull-docs | push-docs  documents sources (push : uniquement les documents « storable »)
set -euo pipefail
TAG="${DATA_STORE_TAG:-data-store}"
STORE=pipeline/.store

count() { gh release list --limit 200 --json tagName -q "[.[] | select(.tagName == \"$TAG\")] | length"; }
require() {
  local n; n=$(count)
  [ "$n" = "1" ] || { echo "::error::stockage « $TAG » : $n release(s) trouvée(s) (attendu : 1). Restauration manuelle requise (restore-ledger)."; exit 1; }
  [ "$(gh release view "$TAG" --json isDraft -q .isDraft)" = "true" ] || { echo "::error::la release « $TAG » n'est PLUS un brouillon : arrêt (la dépublier avant tout usage)"; exit 1; }
}
assets() { gh release view "$TAG" --json assets -q '.assets[].name'; }
remote_sha() { local d; d=$(mktemp -d); gh release download "$TAG" -p ledger.sha256 -D "$d" >/dev/null && cut -d' ' -f1 "$d/ledger.sha256"; }
upload_ledger() { # $1 = fichier à publier comme ledger.jsonl
  local d; d=$(mktemp -d); cp "$1" "$d/ledger.jsonl"
  [ -s "$d/ledger.jsonl" ] || echo > "$d/ledger.jsonl" # GitHub refuse un fichier vide ; une ligne vide = registre vide
  (cd "$d" && sha256sum ledger.jsonl > ledger.sha256)
  gh release upload "$TAG" "$d/ledger.jsonl" "$d/ledger.sha256" --clobber
}

case "${1:-}" in
  init)
    [ "$(count)" = "0" ] || { echo "::error::« $TAG » existe déjà : init refusé"; exit 1; }
    gh release create "$TAG" --draft --title "$TAG (stockage interne, ne pas publier)" \
      --notes "Stockage du pipeline : registre des dépenses API et documents sources autorisés. Brouillon volontaire : NE PAS PUBLIER." >/dev/null
    e=$(mktemp); upload_ledger "$e"
    echo "brouillon « $TAG » créé avec un registre vide"
    ;;
  pull-ledger)
    require
    names=$(assets)
    grep -qx ledger.jsonl <<<"$names" && grep -qx ledger.sha256 <<<"$names" || { echo "::error::registre absent du stockage : restauration manuelle requise"; exit 1; }
    mkdir -p "$STORE"; rm -f "$STORE/ledger.jsonl" "$STORE/ledger.sha256" "$STORE/ledger.base.jsonl"
    gh release download "$TAG" -p ledger.jsonl -p ledger.sha256 -D "$STORE"
    (cd "$STORE" && sha256sum -c ledger.sha256) || { echo "::error::SHA256 du registre invalide : stockage altéré"; exit 1; }
    cp "$STORE/ledger.jsonl" "$STORE/ledger.base.jsonl"
    echo "registre restauré : $(wc -l < "$STORE/ledger.jsonl") entrée(s), sha256 $(cut -c1-12 "$STORE/ledger.sha256")…"
    ;;
  push-ledger)
    require
    [ -f "$STORE/ledger.jsonl" ] && [ -f "$STORE/ledger.base.jsonl" ] || { echo "::error::registre local ou version de base manquant"; exit 1; }
    npx tsx pipeline/ledger.ts check "$STORE/ledger.jsonl" --base "$STORE/ledger.base.jsonl"
    base_sha=$(sha256sum "$STORE/ledger.base.jsonl" | cut -d' ' -f1)
    [ "$(remote_sha)" = "$base_sha" ] || { echo "::error::le registre distant a changé depuis la lecture : publication refusée"; exit 1; }
    if cmp -s "$STORE/ledger.jsonl" "$STORE/ledger.base.jsonl"; then echo "registre inchangé"; exit 0; fi
    d=$(mktemp -d); cp "$STORE/ledger.base.jsonl" "$d/ledger.backup.jsonl"; gh release upload "$TAG" "$d/ledger.backup.jsonl" --clobber
    upload_ledger "$STORE/ledger.jsonl"
    [ "$(remote_sha)" = "$(sha256sum "$STORE/ledger.jsonl" | cut -d' ' -f1)" ] || { echo "::error::relecture du registre publié : empreinte différente"; exit 1; }
    echo "registre publié et relu (sha256 $(sha256sum "$STORE/ledger.jsonl" | cut -c1-12)…)"
    ;;
  restore-ledger)
    f="${2:?fichier de registre à restaurer}"
    npx tsx pipeline/ledger.ts check "$f"
    case "$(count)" in
      0) gh release create "$TAG" --draft --title "$TAG (stockage interne, ne pas publier)" --notes "Restauré depuis une copie. Brouillon volontaire : NE PAS PUBLIER." >/dev/null ;;
      1) require ;;
      *) echo "::error::plusieurs releases « $TAG »"; exit 1 ;;
    esac
    upload_ledger "$f"
    echo "registre restauré dans « $TAG » (sha256 $(sha256sum "$f" | cut -c1-12)…)"
    ;;
  pull-docs)
    require
    names=$(assets); mkdir -p .sources-cache/docs
    for rec in research/sources/records/*.json; do
      [ -e "$rec" ] || continue
      sha=$(node -e 'process.stdout.write(require(process.argv[1]).sha256||"")' "$PWD/$rec"); [ -n "$sha" ] || continue
      for ext in pdf html; do
        f=".sources-cache/docs/$sha.$ext"
        if [ ! -f "$f" ] && grep -qx "src-$sha.$ext" <<<"$names"; then
          gh release download "$TAG" -p "src-$sha.$ext" -O "$f"
          [ "$(sha256sum "$f" | cut -d' ' -f1)" = "$sha" ] || { rm -f "$f"; echo "::error::src-$sha.$ext : SHA256 différent, ignoré"; }
        fi
      done
    done
    ;;
  push-docs)
    require
    names=$(assets); d=$(mktemp -d)
    for name in $(npx tsx pipeline/sources/run.ts storable); do
      f=".sources-cache/docs/$name"; [ -f "$f" ] || continue
      grep -qx "src-$name" <<<"$names" && continue
      [ "$(sha256sum "$f" | cut -d' ' -f1)" = "${name%.*}" ] || { echo "::error::$name : SHA256 différent, non sauvegardé"; continue; }
      cp "$f" "$d/src-$name"; gh release upload "$TAG" "$d/src-$name"; echo "sauvegardé : src-$name"
    done
    ;;
  *) echo "usage : $0 init|pull-ledger|push-ledger|restore-ledger <f>|pull-docs|push-docs" >&2; exit 2 ;;
esac
