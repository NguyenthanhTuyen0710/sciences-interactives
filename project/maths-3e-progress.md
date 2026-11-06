# Mathématiques 3e — suivi de production

_Source unique pour reprendre le travail. Manifest des 40 thèmes : `research/curriculum/mathematiques/manifest-3e.json`. Registre des tâches : `project/ledger.json`._

## Cadre
- Programme applicable en 3e (2026-2027 et 2027-2028) : cycle 4 2020 (BO n° 31 du 30-07-2020) + repères et attendus 2019. Le programme 2026 ne s'appliquera à la 3e qu'à la rentrée 2028.
- Sources Notion : **SOURCE_INACCESSIBLE** (aucune URL dans la session, connecteur Notion non autorisé). Contenu rédigé à partir de l'inventaire officiel ; aucune page Notion lue.

## Batch 1 — Nombres et calculs
| Tâche | Chapitre | Exercices | Revue QA | Contre-vérification | Statut |
|---|---|---|---|---|---|
| SCI-3E-MATH-001 | Arithmétique | 36 | FAIL → corrigé | PASS ×6 | **publié** |
| SCI-3E-MATH-009 | Ratios, pourcentages et évolutions | 33 | NEEDS REVIEW → corrigé | PASS ×6 | **publié** |
| SCI-3E-MATH-002 | Fractions, puissances et racines carrées | 35 | NEEDS REVIEW → corrigé | 2 MAJEUR vérifiés par script (0 anomalie / 21 000 tirages) ; mineurs non revérifiés | brouillon |

QA5 navigateur (desktop + mobile) : `scripts/ui-check.ts` vert sur les 3 chapitres ; e2e `ONLY=ari3-,pc3-,pct3-` : 121/121.
Rapports : `project/reports/SCI-3E-MATH-00{1,2,9}-*.md`.

## Code partagé ajouté
- Modèle de jeu `calcul-flash` ; calcul mental et calcul flash partagent `TimedQuiz`.
- `tests/chapter-suite.ts` : batterie commune à tout chapitre (contrat, DoD, jeux, tirages `vary` non constants).
- Moteur : arrondi exigé (crédit partiel si non arrondi quand `tol` + `decimals`), saisie « 35 % », « 12 € », « 5,6.10^-6 », « 10⁻⁶ ».
- `scripts/ui-check.ts` (QA5 scripté), filtre `ONLY=` pour `scripts/e2e.ts`.
- Piège connu : le minificateur SWC de Next peut tronquer des gabarits SVG à expressions constantes ; vérifier avec `scripts/ui-check.ts`.

## Tests passés (dernier état)
- `npm test` 428/428 ; `tsc` 0 erreur ; ESLint 0 erreur ; `npm run build` OK ; e2e 3e 121/121 ; ui-check vert.

## Reste à faire
1. Contre-vérification des mineurs de SCI-3E-MATH-002 (de préférence script `validate-chapter` + relecture Sonnet), puis publication.
2. Batch 2 : **en attente d'approbation** (voir `project/reports/SCI-INFRA-005-ai-workflow.md`).

## Lacunes et points ouverts
- Constats mineurs restants : aucune détection de réponse constante d'un `vary` (R-1) ; deux distracteurs faibles en chasse-erreurs (arithmétique) ; zéro final « 27,90 » au dixième = crédit partiel (choix moteur).
- Décision du porteur de projet (SCI-INFRA-004) : tutoiement des chapitres vs vouvoiement des messages du moteur.

## Batches suivants (manifest)
2 Calcul littéral et équations (SCI-3E-MATH-003, 004) · 3 Fonctions (007, 008) · 4 Géométrie plane (012, 013, 017) · 5 Statistiques et probabilités (005, 006) · 6 Transformations et espace (014, 011, 010) · 7 Algorithmique (015) · 8 Méthodologie DNB (SCI-DNB-MATH-002) · 9 Annales DNB (SCI-DNB-MATH-003).
