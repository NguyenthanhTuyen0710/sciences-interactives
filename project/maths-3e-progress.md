# Mathématiques 3e — suivi de production

_Source unique pour reprendre le travail. Manifest des 40 thèmes : `research/curriculum/mathematiques/manifest-3e.json`. Registre des tâches : `project/ledger.json`._

## Cadre
- Programme applicable en 3e (2026-2027 et 2027-2028) : cycle 4 2020 (BO n° 31 du 30-07-2020) + repères et attendus 2019. Le programme 2026 ne s'appliquera à la 3e qu'à la rentrée 2028.
- Sources Notion : **SOURCE_INACCESSIBLE** (aucune URL dans la session, connecteur Notion non autorisé). Contenu rédigé à partir de l'inventaire officiel ; aucune page Notion lue.

## Batch 1 — Nombres et calculs (brouillons, non publiés)
| Tâche | Chapitre | Fichier | Exercices | Revue QA | Contre-vérification |
|---|---|---|---|---|---|
| SCI-3E-MATH-001 | Arithmétique | `src/lib/chapters/data/math-3e-arithmetique.ts` | 36 | FAIL → corrigé | PASS ×6 (QA5 hors navigateur) |
| SCI-3E-MATH-002 | Fractions, puissances et racines carrées | `src/lib/chapters/data/math-3e-puissances-calculs.ts` | 35 | NEEDS REVIEW → corrigé | **non faite** (interrompue) |
| SCI-3E-MATH-009 | Ratios, pourcentages et évolutions | `src/lib/chapters/data/math-3e-pourcentages-evolution.ts` | 33 | NEEDS REVIEW → corrigé | PASS ×6 (QA5 hors navigateur) |

Les trois chapitres sont inscrits au registre (`src/lib/chapters/index.ts`) en `draft`, avec `reviewStatus` à `pending` : invisibles sur le site (prévisualisation : `SHOW_DRAFTS=1`). Rapports : `project/reports/SCI-3E-MATH-00{1,2,9}-*.md`.

## Code partagé ajouté
- Modèle de jeu `calcul-flash` (banque de questions numériques, adaptatif, chrono/entraînement) ; calcul mental et calcul flash partagent `TimedQuiz`.
- `tests/chapter-suite.ts` : batterie commune à tout chapitre, y compris contrôle des configurations `calcul-flash` et des tirages `vary` non constants.
- Moteur : arrondi exigé (crédit partiel si non arrondi quand `tol` + `decimals`), saisie « 35 % », « 12 € », « 5,6.10^-6 », « 10⁻⁶ ».
- Arborescence 3e : `m3-arithmetique`, `m3-puissances` (renommé), `m3-pourcentages` ; `m3-racines` supprimé (vide).

## Tests passés (dernier état)
- `npm test` : 428/428 ; `npx tsc --noEmit` : 0 erreur ; ESLint : 0 erreur (1 avertissement antérieur) ; `npm run build` : OK.
- e2e Playwright (`SHOW_DRAFTS=1`) : interrompu à la demande du porteur de projet après 139 contrôles réussis, 0 échec.
- Pages `/mathematiques/3e/m3-arithmetique`, `m3-puissances`, `m3-pourcentages` : HTTP 200.

## Reste à faire avant publication du batch 1
1. Contre-vérification de SCI-3E-MATH-002.
2. Contrôle navigateur QA5 (desktop + mobile, clavier, KaTeX) et e2e complet.
3. Puis `reviewStatus` → `pass`, `publicationStatus` → `published`.

## Lacunes et points ouverts
- Constats mineurs restants : aucune détection de réponse constante d'un `vary` (R-1) ; deux distracteurs faibles en chasse-erreurs (arithmétique) ; zéro final « 27,90 » au dixième = crédit partiel (choix moteur).
- Décision du porteur de projet (SCI-INFRA-004) : tutoiement des chapitres vs vouvoiement des messages du moteur.

## Batches suivants (manifest)
2 Calcul littéral et équations (SCI-3E-MATH-003, 004) · 3 Fonctions (007, 008) · 4 Géométrie plane (012, 013, 017) · 5 Statistiques et probabilités (005, 006) · 6 Transformations et espace (014, 011, 010) · 7 Algorithmique (015) · 8 Méthodologie DNB (SCI-DNB-MATH-002) · 9 Annales DNB (SCI-DNB-MATH-003).
