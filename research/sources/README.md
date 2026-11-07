# Sources — collecte et vérification

Liste fermée, contrôlée par des décisions humaines. Le collecteur (`pipeline/sources/run.ts`) n'explore aucun site.

| Fichier | Rôle |
|---|---|
| `registry.json` | Sources autorisables : hôte, préfixes de chemin, rôle (`officiel` / `reference`), délai, faits G0 (robots.txt, conditions, accès). **`g0.status` = décision humaine**. |
| `G0-report.md` | Relevé des faits du 2026-11-07 et points à trancher. |
| `G1-table.md` | Tableau des documents proposés (titre lu, accès, droits, proposition). |
| `seeds.json` | Documents précis à télécharger, métadonnées déclarées (matière, niveaux, référence officielle, statut d'application) et attendus de vérification. **`g1` = décision humaine**. |
| `records/<seed>.json` | Une ligne de preuve par document : URL, URL finale, date d'accès, HTTP, SHA256, lisibilité, indices extraits, statut de vérification. Committé à la main après relecture. |

## Portes de décision
- **G0** (registre) puis **G1** (seed) doivent être `approved` pour qu'un document soit téléchargé ; robots.txt est relu (cache 24 h) avant chaque exécution.
- **G2** : un changement de l'inventaire `research/curriculum/` passe par une proposition JSON appliquée avec `run.ts apply`, refusée si elle n'est pas approuvée (`approvedBy`, `approvedAt`), si le document n'est pas `verified` ou si la citation (≥ 20 caractères) n'y figure pas mot pour mot. Aucun objectif existant n'est modifié : `attach_evidence` ajoute une preuve, `add_objective` ajoute un objectif.
- **G3** : publication d'un chapitre, toujours manuelle.

## Statuts
- `verified` : document lu et identité confirmée (attendus présents) — ce n'est pas une validation juridique ou pédagogique.
- `needs_review`, `unreadable` (« non lu » : aucun texte exploitable), `inaccessible` (HTTP ≠ 200, redirection hors hôte). Aucun contenu n'est déduit d'un document non lu.
- Dans un chapitre, une source sans statut ou `pending_verification` n'est pas vérifiée ; `verified` exige le SHA256 et la date d'un enregistrement `verified` du collecteur (contrôlé par `scripts/validate-chapter.ts`).

## Stockage
Documents et textes extraits : `.sources-cache/` (hors Git). Copie dans la release GitHub **brouillon** `data-store` (visible des seuls membres ayant un accès en écriture ; ne jamais la publier) **uniquement** si `g0.storage = "approved"` pour la source (droit de conservation confirmé) ; sinon le document reste récupérable à la source et contrôlable par son SHA256. Dans Git : uniquement métadonnées, URL, SHA256 et statuts.

## Notion
Entrée `notion` (`kind: connector`, `optional: true`) : point d'intégration pour un futur connecteur. Non configurée, elle est ignorée et ne bloque rien.
