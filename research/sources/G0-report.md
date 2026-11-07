# G0 — Relevé des conditions d'accès aux sources (2026-11-07)

Faits relevés par un client automatisé (`curl`, agent `SciencesInteractivesBot/0.1`), quelques requêtes espacées d'au moins 10 s.
**Ce document ne conclut pas** qu'une collecte ou une réutilisation est permise : la décision appartient au porteur de projet (`registry.json → g0.status`).

| Source | robots.txt (groupe applicable : `*`) | Conditions / licence | Accès constaté |
|---|---|---|---|
| Bulletin officiel (www.education.gouv.fr) | `Crawl-delay: 10` ; `Disallow` : `/recherche`, `/search`, chemins Drupal ; `Allow` explicite : `/*.pdf$`, `/sites/default/files/` ; aucun groupe propre aux agents d'IA | **Non lues** : `/mentions-legales` → HTTP 403 (page Cloudflare) | Pages HTML `/bo/…` → **403** ; PDF `/sites/default/files/…` → 200/206 |
| Éduscol (eduscol.education.gouv.fr) | Même contenu que ci-dessus | **Non lues** : `/mentions-legales` → HTTP 403 | Pages HTML → **403** ; PDF `/sites/default/files/…` → 206 |
| Math93 (www.math93.com) | `Disallow` : dossiers techniques Joomla uniquement ; pas de `Crawl-delay` ; pas de règle pour les agents d'IA | **Aucune page de conditions trouvée** : accueil « ©1999 / ISSN 2272-5318 / Contact » ; `/mentions-legales` → 404 | Accueil → 200 |
| Labolycée (www.labolycee.org) | Commentaire : contenu « pas destiné à la constitution de corpus d'entraînement », robots d'entraînement refusés aussi côté serveur ; `Disallow: /` pour `GPTBot`, `ClaudeBot`, `anthropic-ai`, `Claude-Web`, `CCBot`, `Wget`, `HTTrack`… ; `Allow: /` pour `Claude-SearchBot`, `Claude-User`, `ChatGPT-User`, `PerplexityBot` ; groupe `*` : `Disallow` `/admin`, `/compte`, `/api/`, `/recherche`, `/generateur/pdf`, `/generateur/mon-sujet`, `/static/pdfjs/` | [Mentions légales](https://www.labolycee.org/mentions-legales) (MAJ 31-07-2026) : corrigés, notes et outils sous **CC BY-NC-ND** (attribution, pas d'usage commercial, pas de modification) ; réutilisation commerciale sur demande ; sujets = épreuves officielles, hors licence | Accueil et mentions légales → 200 |
| Notion | — | Connecteur non autorisé : aucune page lue | `SOURCE_INACCESSIBLE` |

## Points soumis à décision (non tranchés ici)
1. BO / Éduscol : les conditions de réutilisation n'ont pas pu être lues (403). Faut-il les lire manuellement dans un navigateur avant d'approuver G0 ?
2. Labolycée : compatibilité de l'usage prévu (analyse par un pipeline d'IA, contenu généré pour un site) avec le refus des « robots d'entraînement », l'interdiction de `ClaudeBot`/`anthropic-ai` et la clause « pas de modification » de CC BY-NC-ND.
3. Math93 : aucune licence affichée ; utiliser sans conditions écrites, demander l'autorisation (lien « Contact ») ou exclure ?
4. Selon ses mentions légales, les sujets de Labolycée sont des épreuves du baccalauréat et de concours : pertinence pour le périmètre actuel (collège) à confirmer.

Tant que `g0.status` ≠ `approved`, le collecteur refuse tout téléchargement pour la source ; Math93 et Labolycée sont en outre `enabled: false`.
