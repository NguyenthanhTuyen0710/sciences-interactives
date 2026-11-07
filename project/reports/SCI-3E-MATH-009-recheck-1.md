# SCI-3E-MATH-009 — Contre-vérification n° 1

_Chapitre `src/lib/chapters/data/math-3e-pourcentages-evolution.ts` (commit `030be84`), correctifs partagés du commit `63b518d` (`src/lib/engine/check.ts`, `src/lib/engine/numbers.ts`, `src/components/games/Games.tsx`). Référence : `project/reports/SCI-3E-MATH-009-QA.md` et l'inventaire `research/curriculum/mathematiques/curriculum-math.json`. Aucun fichier source n'a été modifié. Le vouvoiement du moteur est hors périmètre : la décision revient au responsable._

## Méthode

- Scripts jetables `npx tsx` dans le répertoire temporaire de session (`r9sweep.ts`, `r9half.ts`), supprimables.
- Balayage de **2 500 graines** (`q0`…`q2499`) pour chaque générateur, via `exerciseGenerator` et `vary`. Contrôles automatiques :
  - NaN, `undefined`, `Infinity` ;
  - réponse parfaite = 100 % ; réponse vide = 0 ;
  - diagnostic égal à la bonne réponse, ou accepté (en entier ou en partie) par `checkNumber` ;
  - forme affichée (`expectedNum`) acceptée ;
  - saisie avec « % », « € », « ␣% », « ␣€ » acceptée ;
  - pour chaque partie qui a un `tol` : cohérence entre `roundingLabel` et `decimals`, et réponse arrondie au rang annoncé par l'énoncé notée 100 % ;
  - « ≈ » ou « environ » devant une valeur exacte ;
  - cas de mi-chemin ;
  - options, jetons ou items en double ; ordre déjà correct ; position de la bonne réponse des QCM ;
  - plages réalistes.
- Clés des parties arrondies (pct3-20, 24, 28, 29) recalculées **en arithmétique entière exacte** (BigInt, arrondi « 5 au-dessus ») : 10 000 vérifications, **0 écart**.
- `npx vitest run tests/chapters.test.ts` : **164/164** (dont 37 pour ce chapitre, inscrit au registre). `npx tsc --noEmit` : **code 0**.

## Suivi des constats de la première revue

| # | Constat (sévérité) | Statut | Preuve |
|---|---|---|---|
| QA1-1 | Textes de M4-OGDF-08 et M4-OGDF-10 modifiés ; « appliquer un % » rattaché à tort (MAJEUR) | **FIXED** | Les 7 textes de `O` sont identiques, mot pour mot, à l'inventaire : M6-NC-24, M6-NC-25, M4-AUTO-03, M4-OGDF-08, M4-OGDF-10, M3-OGDF-13 (6e : chapitre `math-6e-pourcentages` ; 4e : `math-4e-automatismes` et `math-4e-proportionnalite`). Nouveau rattachement pertinent : M6-NC-24 → pct3-01 (définition d'un % ↔ fraction) ; M4-AUTO-03 → pct3-02, pct3-06 (« 25 % de 80 »), jeu flash (« 20 % de 45 € ») ; M6-NC-25 → pct3-07, 19, 31 (partie/tout en %). M4-OGDF-08 ne reste que sur des quatrièmes proportionnelles (pct3-13, 26). Le script ne trouve aucun objectif d'exercice ou de jeu absent de `officialObjectives`. |
| QA1-2 | Identifiants `M3-OGDF-13-B/-C/-D` de forme officielle (MINEUR) | **FIXED** | Renommés `#B/#C/#D`. Texte préfixé « (Déclinaison interne de M3-OGDF-13) ». La source dit « identifiant absent de l'inventaire ». Le dossier est aligné. |
| QA1-3 | R3 présentée comme officielle (MINEUR) | **FIXED** | « Inventaire interne… (agent A1) », `kind: "supplementary"`, URL pointant vers le fichier du dépôt. |
| QA1-4 | Pas de lien avec la fonction linéaire (MINEUR) | **FIXED** | Explication 1 : « appliquer la **fonction linéaire** $x \mapsto 1{,}15x$ ». |
| QA2-1 | « coefficient compris entre 0 et 1 » pour t = 100 (MINEUR) | **FIXED** | Propriété : « $0 \leqslant CM < 1$ (pour $0 < t \leqslant 100$) ». Fiche : « $0 \leqslant CM < 1$ : baisse ». |
| QA2-2 | `commonMistakes[2]` ambigu (MINEUR) | **FIXED** | « Un article coûte 75 € après une hausse de 25 % ; son prix d'avant… ». |
| QA2-3 | « ≈ » ou « environ » devant une valeur exacte (pct3-17, 20, 22, 28) (MINEUR) | **FIXED** | 0 cas sur 2 500 graines pour chaque exercice. Le contrôle couvre aussi pct3-24 (« Soit » ou « Soit environ »). |
| QA3-1 | pct3-17 : mi-chemin négatif (−9,95) (MINEUR) | **FIXED** | Les tirages de mi-chemin sont rejetés (`halfway`). Contrôle exact en entiers : 0 cas sur 2 500. |
| QA3-2 | `numR` accepte des réponses non arrondies (MINEUR) | **FIXED** (moteur) | `check.ts` donne un crédit partiel quand `tol` et `decimals` sont posés et que la saisie a trop de décimales. Les 6 parties avec `tol` (pct3-17, 20 p2, 22, 24, 28 étape 2, 29 p2) ont toutes `decimals` égal au rang annoncé (dixième = 1, centime = 2, unité = 0) : 0 incohérence. Une réponse arrondie au rang demandé obtient 100 % (0 pénalité sur 2 500 graines). |
| QA3-3 | pct3-23 : QCM non mélangé, bonne réponse en index 0 (MINEUR) | **FIXED** | `shuffledQcm`. Bonne réponse en position 0/1/2 dans 825/845/830 cas. Offre « remise unique » en A dans 1 295 cas, en B dans 1 205. Prix, clé du QCM et conclusion de la solution sont cohérents avec l'étiquette dans 100 % des cas. |
| QA3-4 | pct3-27 : items déjà dans l'ordre (MINEUR) | **FIXED** | Nouveau mélange tant que l'ordre est l'identité : 0 cas sur 2 500. |
| QA3-5 | pct3-19 : consigne « fraction irréductible » mais décimal accepté (MINEUR) | **FIXED** | « (fraction irréductible ou écriture décimale exacte) ». |
| QA3-6 | Valeurs irréalistes (pct3-29, 14, 09) (MINEUR) | **FIXED** | pct3-29 : HT de 800 à 3 000 € par pas de 50. pct3-14 : de 150 à 1 200 €. pct3-09 : vélo de 150 à 900 €, avec d'autres objets aux plages adaptées. 0 cas hors plage. |
| QA3-7 | pct3-26 : ratios farine : sucre invraisemblables (MINEUR) | **FIXED** | Ratios 4:1, 5:1, 6:1, 8:1, 5:2, 7:2 : tous ≥ 2. |
| QA3-8 | pct3-25 et 26 trop faciles pour le niveau 4 (MINEUR) | **FIXED** (partiellement) | pct3-26 passe au niveau 3. pct3-25 reste au niveau 4 : il demande de retrouver le total à partir d'une part, en 3 termes, ce qui est acceptable. |
| QA3-9 | Saisie « 35 % » ou « 12 € » refusée (MINEUR) | **FIXED** | `parseNumber` retire « % » ou « € » en fin de saisie. Des `suffix` sont ajoutés (pct3-07, 09, 10, 13, 14, 17, 20, 22, 23, 26, 29, 31 et les étapes en € ou %). 0 refus sur les 4 variantes de saisie. |
| QA4-1 | Item ambigu de la chasse aux erreurs (MAJEUR) | **FIXED** | « Prix de 30 € après une hausse de 20 % : 30 × 0,2 = 6 € ». La bonne explication est « 6 € est le montant de la hausse : le nouveau prix est 36 € ». |
| QA4-2 | Memory : paires sans coefficient (MINEUR) | **FIXED** | « Hausse de 100 % ↔ × 2 » et « −25 % puis +20 % ↔ × 0,9 » (0,75 × 1,2 = 0,9). M4-OGDF-10 est retiré des objectifs du jeu. Les 14 cartes sont distinctes et aucune n'est ambiguë. |
| QA4-3 | Flash : intitulé du niveau, part de ratio (MINEUR) | **FIXED** | « Calculs de prix et de taux » ; « Plus petite part (en €) quand on partage 60 € selon le ratio 1 : 2 ». |
| QA6-1 | Moteur au vouvoiement (MINEUR, hors chapitre) | **HORS PÉRIMÈTRE** | La décision revient au responsable. Le nouveau message d'arrondi est impersonnel (« Valeur juste, mais il faut arrondir le résultat au dixième. »). « Presque : vérifiez l'arrondi » vouvoie toujours. |
| QA6-2 | « C'est impossible de compenser » (MINEUR) | **FIXED** | « Il est impossible de compenser cette baisse ». |
| QA6-3 | pct3-17 : « −10 % » au lieu de « −10,0 % » (MINEUR) | **FIXED** | `frFixed(…, 1)` : le dixième est toujours affiché (0 exception). |
| QA6-4 | « (5e-4e) » (MINEUR) | **FIXED** | « (5e et 4e) ». |
| Moteur | Libellés de la chasse aux erreurs | **FIXED** | « C'est juste. » ou « Il y a une erreur. », « Question k/n », `aria-label` « Est-ce juste ? ». |

**Régressions : aucune.** Pas de NaN. Réponse parfaite à 100 % et réponse vide à 0 sur toutes les graines. Aucun diagnostic égal à la bonne réponse ni accepté, même en partie, par la tolérance. Aucune option, aucun jeton ni aucun item en double. La forme affichée par `expectedNum` est toujours acceptée. Les nouveaux textes (pct3-09, 17, 19, 23, 26, flash, chasse aux erreurs, memory) sont justes et cohérents avec le tutoiement.

## Nouveaux constats

1. **MINEUR (information) — moteur, zéro final superflu.** Avec la nouvelle règle, « 27,90 » saisi pour un résultat « arrondi au dixième » reçoit un crédit partiel (« il faut arrondir le résultat au dixième »). Cela concerne 15 000 saisies simulées sur les 6 parties à `tol`. C'est défendable, car la réponse a trop de décimales, mais le message est un peu sévère pour une valeur déjà arrondie. **Correctif possible (moteur) :** ignorer les zéros finaux dans `p.decimals` ou adapter le message. À trancher par le responsable du moteur.
2. **MINEUR — source des objectifs M6.** `SRC_6E` cite le programme du cycle 3 du BO n° 16 du 17-04-2025 (référence de l'inventaire). Or la cohorte de 3e de 2026-2027 a suivi la 6e en 2023-2024, sous le programme antérieur. Le contenu (définition d'un pourcentage, proportion partie/tout) est identique dans les deux versions. **Correctif :** préciser « (notion déjà présente dans le programme de cycle 3 antérieur) », ou simplement l'accepter.
3. **MINEUR — commentaire obsolète.** Ligne 384 : « Couvre M3-OGDF-13 (3e) et consolide M4-OGDF-08 et M4-OGDF-10 ». Il ne mentionne pas M4-AUTO-03, M6-NC-24 ni M6-NC-25. Il ne faut pas en conclure qu'il faut ajouter `math-6e-pourcentages` ou `math-4e-automatismes` à `curriculumChapterIds` : `scripts/dashboard.ts` compterait alors ces chapitres comme « générés ». **Correctif :** mettre à jour le commentaire.
4. **INFO — mi-chemin positifs.** Il reste des valeurs exactes à mi-chemin : pct3-20 (255/2 500, par exemple 3,165), pct3-28 (246/2 500, par exemple 14,025) et pct3-24 (17/2 500, par exemple 51 749,5). Elles sont toutes positives, donc la convention « 5 au-dessus » n'est pas ambiguë. Clé vérifiée en arithmétique exacte : 0 écart. Aucune action requise.

## Verdicts

| Dimension | Verdict |
|---|---|
| QA1 Programme | **PASS** |
| QA2 Exactitude | **PASS** |
| QA3 Exercices | **PASS** |
| QA4 Jeux | **PASS** |
| QA5 Technique (tests et types seulement) | **PASS** |
| QA6 Langue | **PASS** (réserve : vouvoiement du moteur, hors périmètre) |

**Aucun constat BLOQUANT ni MAJEUR restant.** Les 2 MAJEURS et les 21 MINEURS de la première revue sont corrigés : pct3-25 est conservé au niveau 4 avec justification, et le vouvoiement du moteur est en attente de décision. Les nouveaux constats sont mineurs ou d'information.
