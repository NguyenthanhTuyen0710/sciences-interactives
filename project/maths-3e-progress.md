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

## Pipeline API — pilote approuvé (2026-11-07)
- Chapitre pilote : `math-3e-calcul-litteral` (SCI-3E-MATH-003), Sonnet 5.5, plafond 10 USD (`pipeline/`).
- État : **prêt, non lancé** — dry-run OK (coût maximal ≈ 1,7 USD, ≈ 1,1 USD en batch) ; aucune clé API dans l'environnement et crédit Startup / limite de dépense non confirmés (`pipeline/budget.json` → `creditVerified: false`).
- Aucun autre chapitre ne doit passer par le pipeline avant évaluation du pilote.

## Reste à faire
1. SCI-3E-MATH-002 : `validate-chapter` vert (10 500 tirages) ; relecture des mineurs non refaite → reste en brouillon.
2. Lancer le pilote dès que la clé et le crédit sont confirmés, puis rapport (coût réel, exercices, taux de réussite, défauts).

## Lacunes et points ouverts
- Constats mineurs restants : aucune détection de réponse constante d'un `vary` (R-1) ; deux distracteurs faibles en chasse-erreurs (arithmétique) ; zéro final « 27,90 » au dixième = crédit partiel (choix moteur).
- Tutoiement : appliqué partout côté élève (décision du 2026-11-07).

## Batches suivants (manifest)
2 Calcul littéral et équations (SCI-3E-MATH-003, 004) · 3 Fonctions (007, 008) · 4 Géométrie plane (012, 013, 017) · 5 Statistiques et probabilités (005, 006) · 6 Transformations et espace (014, 011, 010) · 7 Algorithmique (015) · 8 Méthodologie DNB (SCI-DNB-MATH-002) · 9 Annales DNB (SCI-DNB-MATH-003).
