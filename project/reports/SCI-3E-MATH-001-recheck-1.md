# SCI-3E-MATH-001 — Contre-vérification n° 1 (après corrections)

_Chapitre `src/lib/chapters/data/math-3e-arithmetique.ts`. Base : rapport `SCI-3E-MATH-001-QA.md`, commit de correction `56e8c25` (chapitre) et `63b518d` (code partagé). Aucun fichier source modifié._

Méthode :
- Chaque générateur `vary` a été exécuté sur 3 000 graines (`q0`…`q2999`) par des scripts jetables placés dans le scratchpad (`sweep.ts`, `targeted.ts`, `flash.ts`, lancés avec `npx tsx`).
- `sweep.ts` passe par `exerciseGenerator` et vérifie pour chaque tirage :
  - réponse parfaite = correcte ;
  - aucun diagnostic égal à la bonne réponse ;
  - ni NaN, ni undefined, ni null ;
  - vrai-faux ni « tout vrai » ni « tout faux » ;
  - classement avec au moins deux catégories ;
  - ordre, association et glisser-déposer jamais déjà résolus ;
  - options sans doublon ;
  - motifs « 0 h », « 0 s », « x/1 », nombre hors LaTeX.
- `targeted.ts` contrôle chaque constat de la première revue.
- `flash.ts` vérifie `flashFeedback` sur les items du chapitre.
- Tests : `npx vitest run tests/chapters.test.ts` et `npx tsc --noEmit`.

## Verdicts par dimension

| Dimension | Verdict | Commentaire |
|---|---|---|
| QA1 Programme | **PASS** | Les 3 mineurs sont corrigés. Les 7 identifiants d'objectifs sont tous déclarés dans `officialObjectives` et tous utilisés. |
| QA2 Exactitude | **PASS** | Les 2 mineurs sont corrigés. Aucune erreur mathématique dans les textes ajoutés. |
| QA3 Exercices | **PASS** | Le bloquant (ari3-03) et les 8 mineurs sont corrigés. 0 anomalie sur 3 000 graines × 33 générateurs. |
| QA4 Jeux | **PASS** | QA4-1 et QA4-3 sont corrigés (code partagé), QA4-2 est corrigé dans le chapitre. Un mineur résiduel (voir R-2). |
| QA5 Technique (tests et types seulement) | **PASS** | vitest : 164/164 (dont 40/40 pour ce chapitre). `tsc --noEmit` : code de sortie 0. Le navigateur est contrôlé à part par l'orchestrateur. |
| QA6 Langue | **PASS** | Le majeur (ari3-01) et les mineurs 2 à 6 sont corrigés. QA6-7 (vouvoiement du moteur) est hors périmètre : décision du porteur de projet en attente. |

## Suivi des constats de la première revue

| Constat | État | Preuve |
|---|---|---|
| QA1-1 Rattachement aux objectifs | FIXED | ari3-01, 03, 04 et 14 sont rattachés à M4-NC-15 (consolidation de 4e : problèmes simples de divisibilité). ari3-05 est rattaché à M4-NC-13, ari3-06 et ari3-15 à M4-NC-14. |
| QA1-2 Objectifs de 4e non cités | FIXED | M4-NC-13, 14 et 15 sont ajoutés à `O`, avec la source `SRC_4E`. Leurs libellés sont fidèles à `curriculum-math.json`, avec une précision entre parenthèses. Répartition : M3-NC-01 = 13, M3-NC-02 = 9, M3-NC-03 = 13, M4-NC-12 = 4, M4-NC-13 = 1, M4-NC-14 = 2, M4-NC-15 = 4. Aucun objectif n'est inutilisé et aucun identifiant n'est inconnu (exercices et jeux). |
| QA1-3 Compétence formulée comme exigible | FIXED | Nouveau libellé : « Utiliser un diviseur commun ou un multiple commun pour résoudre un problème. » |
| QA2-1 Définition de « Nombre premier » | FIXED | Nouveau texte : « un nombre entier naturel (positif) qui a exactement deux diviseurs ». |
| QA2-2 « plus petit » au lieu de « inférieur ou égal » | FIXED | Corrigé dans l'explication 5 et dans `commonMistakes[5].why` : « inférieur ou égal », « supérieur ou égal ». |
| QA3-1 **BLOQUANT** ari3-03 (nombre toujours égal à 0) | FIXED | 2 344 nombres distincts sur 3 000 tirages, aucun nombre nul. Aucun tirage « tout oui » ni « tout non », puisque n % 90 ≠ 0. La réponse « oui » apparaît pour 9 dans 741 tirages et pour 10 dans 735. Exemple `q1` : 9 357, somme 24, réponses non/oui/non/non/non. |
| QA3-2 ari3-06 (tirages déséquilibrés ou en double) | FIXED | Sur 3 000 tirages : 0 « tout vrai », 0 « tout faux », 0 item en double. Chaque tirage contient au moins 1 vrai et 2 faux. |
| QA3-3 ari3-22 (dernier trou toujours « n'est pas ») | FIXED | 33,2 % des tirages portent sur un nombre premier, entre 101 et 293. Le trou 1 vaut n, le trou 2 vaut 1, le trou 3 vaut « est ». Contrôle de primalité et de minimalité de p : 0 erreur. La correction du cas premier est juste, par exemple pour 181 (tests jusqu'à 13). |
| QA3-4 ari3-13 (règle de l'indice fausse pour 2) | FIXED | Indice : « aucun nombre premier autre que lui-même ». Le raisonnement ajoute « sauf éventuellement par lui-même ». |
| QA3-5 ari3-02 (indice donnant des réponses) | FIXED | Nouvel indice : « Pense aussi à tester la divisibilité par 7. » |
| QA3-6 ari3-12 (correction contraire à la méthode annoncée) | FIXED | La correction énumère les multiples de max(a, b) dans les 3 000 tirages. Exemple `q8` : « Multiples de 24 : 24 ; 48 ; 72… ». |
| QA3-7 ari3-30 (lettre absente de l'énoncé) | FIXED | Nouvel indice : « Divise le nombre de truffes par… ». |
| QA3-8 ari3-21 (résultat entier écrit en fraction) | FIXED | La condition `(a*c) % (b*d) === 0` exclut ces tirages : 0 dénominateur égal à 1 sur 3 000. |
| QA3-9 Ordre déjà correct (ari3-05, ari3-36, ari3-17) | FIXED | Le générateur remélange tant que l'ordre est l'identité : 0 cas pour chacun des trois exercices sur 3 000 tirages. |
| QA4-1 calcul-flash accepte les décimaux | FIXED (partagé) | « 1,4 » pour 84/60, « 0,6666666667 » pour 12/18 et « 1,4285714286 » pour 50/35 sont refusés avec le message « On attend une fraction irréductible ». « 14/10 » est refusé (non irréductible). Les 24 clés du jeu sont toujours acceptées. |
| QA4-2 chasse-erreurs : distracteurs faibles | FIXED | La bonne erreur ne contient plus la correction, et les distracteurs sont plausibles et faux, par exemple « 57 est divisible par 7 » ou « Il manque un facteur 2 ». Les 12 items ont été revérifiés : chaque distracteur est bien faux. Le moteur mélange l'ordre des erreurs (Games.tsx l. 338). |
| QA4-3 chasse-erreurs : « calcul » pour des affirmations | FIXED (partagé) | Nouveaux libellés : « C'est juste. », « Il y a une erreur. », « Question k/n », `aria-label` « Est-ce juste ? ». Plus aucune occurrence de « calcul » dans `ChasseErreurs`. |
| QA5-1 La suite n'a pas détecté ari3-03 | FIXED (partiel, partagé) | `tests/chapter-suite.ts` exige plus d'un couple (énoncé, interaction) distinct sur 40 graines. Ce test aurait détecté l'ancien ari3-03. Le contrôle « réponse constante » n'a pas été ajouté (voir R-1). |
| QA6-1 **MAJEUR** ari3-01 (négation manquante) | FIXED | Seules deux phrases sont possibles : « N est un diviseur de M. / M est un multiple de N. » et « N n'est ni un diviseur ni un multiple de M. » (deux fois). La consigne devient « la bonne expression ». |
| QA6-2 Définition « Multiple commun » tautologique | FIXED | Nouveau texte : « Le plus petit d'entre eux, non nul, s'appelle… ». |
| QA6-3 ari3-29 (nombre hors LaTeX) | FIXED | 0 nombre hors LaTeX sur 3 000 tirages. Seules formes produites : « $p$ élèves sur $q$ » et « un élève sur $q$ ». |
| QA6-4 ari3-32 (« 0 s » affiché) | FIXED | 0 « 0 s » sur 3 000 tirages. Formes produites : « soit $x$ min » ou « soit $x$ min $y$ s ». |
| QA6-5 ari3-27 (« 0 h » affiché) | FIXED | 0 « 0 h » sur 3 000 tirages. La conversion n'est écrite que si m ≥ 60, et l'heure finale est cohérente avec les trous à attendre (0 écart). |
| QA6-6 Titres « Brevet — … » | FIXED | Les 6 exercices de niveau 5 sont titrés « Type Brevet — … ». |
| QA6-7 Moteur au vouvoiement | HORS PÉRIMÈTRE | Décision du porteur de projet en attente. Aucune régression : aucun « vous », « votre » ou « vos » dans les lignes ajoutées. |

## Recherche de régressions

Aucune régression n'a été trouvée. Le balayage complet (33 générateurs × 3 000 graines, via `exerciseGenerator`) donne :
- 0 réponse parfaite rejetée ;
- 0 diagnostic égal à la bonne réponse ;
- 0 NaN, undefined ou null ;
- 0 vrai-faux à réponse unique ;
- 0 ordre ou association déjà résolu ;
- 0 option en double.

Les textes ajoutés ont été relus un par un : typographie (espace avant « ; : ? ! »), tutoiement, exactitude. Ils sont conformes.

## Nouveaux constats

- **R-1 — MINEUR (code partagé, `tests/chapter-suite.ts`).** Le test de diversité compare énoncé et interaction ensemble. Il ne détecte donc pas un générateur dont l'énoncé varie mais dont une réponse vrai-faux ou select reste constante sur toutes les graines, ce qui était le cas de l'ancien ari3-22. La seconde moitié du correctif QA5-1 n'est pas faite. Correctif : ajouter une assertion « la clé de réponse prend au moins deux valeurs sur 40 graines » pour vrai-faux, select et classer.
- **R-2 — MINEUR (QA4, chasse-erreurs).** Deux distracteurs restent peu plausibles :
  - « Il fallait conclure : divisible par 10 » (item « 4 et 6 → 24 ») ;
  - « On ne peut pas simplifier une fraction dont le numérateur est pair » (item 36/48).

  Ce point n'est pas bloquant : le reste du jeu discrimine désormais correctement.
- **R-3 — COSMÉTIQUE (QA6, ari3-22).** La liste des nombres premiers testés est jointe par des virgules seules, par exemple « aucun des nombres premiers 2, 3, 5, 7, 11, 13. ». Un « et » avant le dernier terme serait plus soigné.

Aucun constat BLOQUANT ni MAJEUR ne subsiste.

**Verdict global : PASS** sur QA1 à QA4 et QA6. QA5 est PASS pour les tests et les types, sous réserve du contrôle navigateur de l'orchestrateur.
