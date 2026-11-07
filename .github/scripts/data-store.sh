#!/usr/bin/env bash
# Stockage persistant hors Git : release GitHub « data-store » en BROUILLON.
# Un brouillon n'est visible que des personnes ayant un accès en écriture au dépôt (le dépôt est public : ne jamais publier).
# Contenu : ledger.jsonl (registre des dépenses API) et src-<sha256>.<ext> (documents sources téléchargés).
# Le cache Actions (.sources-cache) n'est qu'une accélération ; cette release est la copie de référence.
# Usage : data-store.sh pull-ledger | push-ledger | pull-docs | push-docs   (GH_TOKEN requis)
set -euo pipefail
TAG=data-store

# Vérifie qu'il existe exactement un brouillon « data-store » ; le crée seulement si la liste a pu être lue.
ensure() {
  local n
  n=$(gh release list --limit 200 --json tagName -q "[.[] | select(.tagName == \"$TAG\")] | length")
  if [ "$n" = "0" ]; then
    gh release create "$TAG" --draft --title "data-store (stockage interne, ne pas publier)" \
      --notes "Stockage du pipeline de contenu : registre des dépenses API et documents sources. Brouillon volontaire : ne pas publier." >/dev/null
  elif [ "$n" != "1" ]; then
    echo "::error::$n releases « $TAG » trouvées : stockage ambigu, arrêt"; exit 1
  fi
}
assets() { gh release view "$TAG" --json assets -q '.assets[].name'; }

case "${1:-}" in
  pull-ledger)
    ensure
    mkdir -p pipeline/.store && rm -f pipeline/.store/ledger.jsonl
    if assets | grep -qx ledger.jsonl; then gh release download "$TAG" -p ledger.jsonl -D pipeline/.store; fi
    echo "registre : $( [ -f pipeline/.store/ledger.jsonl ] && wc -l < pipeline/.store/ledger.jsonl || echo 0 ) entrée(s)"
    echo "PIPELINE_LEDGER_SYNCED=1" >> "$GITHUB_ENV"
    ;;
  push-ledger)
    [ -f pipeline/.store/ledger.jsonl ] || { echo "aucun registre local : rien à sauvegarder"; exit 0; }
    for i in 1 2 3; do
      if gh release upload "$TAG" pipeline/.store/ledger.jsonl --clobber; then echo "registre sauvegardé"; exit 0; fi
      sleep $((i * 5))
    done
    echo "::error::registre des dépenses NON sauvegardé : n'envoyer aucune requête avant de l'avoir restauré depuis l'artefact de ce run"
    exit 1
    ;;
  pull-docs)
    ensure
    names=$(assets)
    mkdir -p .sources-cache/docs
    for rec in research/sources/records/*.json; do
      [ -e "$rec" ] || continue
      sha=$(node -e 'const r=require(process.argv[1]);process.stdout.write(r.sha256||"")' "$PWD/$rec")
      [ -n "$sha" ] || continue
      for ext in pdf html; do
        if [ ! -f ".sources-cache/docs/$sha.$ext" ] && grep -qx "src-$sha.$ext" <<<"$names"; then
          gh release download "$TAG" -p "src-$sha.$ext" -O ".sources-cache/docs/$sha.$ext"
        fi
      done
    done
    ;;
  push-docs)
    ensure
    names=$(assets)
    tmp=$(mktemp -d)
    for f in .sources-cache/docs/*; do
      [ -e "$f" ] || continue
      n="src-$(basename "$f")"
      if ! grep -qx "$n" <<<"$names"; then cp "$f" "$tmp/$n"; gh release upload "$TAG" "$tmp/$n"; echo "sauvegardé : $n"; fi
    done
    ;;
  *) echo "usage : $0 pull-ledger|push-ledger|pull-docs|push-docs" >&2; exit 2 ;;
esac
