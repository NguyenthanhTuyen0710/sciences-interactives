# SCI-5E-MATH-001 — Contre-vérification n° 2 (inspecteur indépendant) et publication

_Consignée par l'orchestrateur. Code vérifié : a244347. Exécuté par l'inspecteur : vitest 206/206, tsc 0 erreur, eslint et `npm run lint` code 0, Playwright Chromium (page du chapitre 8 chargements sans erreur ; partie complète de 12 manches au clavier ; rel5-22 sur 3 000 graines)._

| Clé | Verdict |
|---|---|
| curriculum | **PASS** |
| accuracy | **PASS** |
| exercises | **PASS** |
| games | **PASS** (réserve mineure : focus en fin de chasse) |
| technical | **PASS** (exception ESLint `no-explicit-any` limitée à `tests/**` jugée acceptable) |
| language | **PASS** (réserves mineures : `{,}` du résultat décimal, deux espaces fines) |

## Réserves mineures traitées avant publication
`{,}` dans le résultat et la liste « À revoir » du calcul mental, espaces fines (« ta réponse : », « essais ; », étiquettes du repère), focus sur « Rejouer » en fin de partie.

## Contrôles de publication (orchestrateur, après passage à `published`)
- `npx vitest run` 206/206 (dont la Definition of Done stricte d'un chapitre publié), `npx tsc --noEmit` 0 erreur, `npx eslint .` code 0, `next build` réussi.
- Serveur **sans** `SHOW_DRAFTS` : bandeau de prévisualisation absent ; e2e complet (87 exercices dont les 36 du chapitre) : 1 passage avec une erreur d'hydratation intermittente sur `/admin/exercices/nouveau` (page non modifiée, non reproduite en 6 chargements manuels), puis 2 passages consécutifs entièrement verts.
- Contrôles Playwright des correctifs : 9/9.

## Points ouverts hors chapitre
- Décision du porteur : tutoiement ou vouvoiement de l'interface existante (QA6 Moy3).
- Défaut intermittent d'hydratation de `/admin/exercices/nouveau` lors de l'e2e (probable saisie avant hydratation dans le script) : à instruire.
- Point didactique : égalités triviales possibles dans rel5-12 (~20 % des tirages).
