# Pythagore 3e (`math-3e-pythagore`) — vérification QA humaine/scriptée (2026-11-08)

Chapitre vérifié : `src/lib/chapters/data/math-3e-pythagore.ts`, sha256 `47570879eca97499…` (draft, hors registre). **Aucune modification faite** : les corrections ci-dessous sont proposées en un seul lot, à approuver (elles changent l'empreinte du chapitre).

Sources lues pour cette vérification (empreintes identiques aux enregistrements du collecteur) :
- Attendus de fin d'année de 4e (2019), Éduscol — sha256 `d0edabd6…` (= `research/sources/records/c4-attendus-4e-2019-pdf.json`).
- Programme du cycle 4 (2020), Éduscol — sha256 `de42e981…` (= `c4-programme-2020-eduscol-pdf.json`).
- Relecture IA validée (schéma) : `project/reports/SCI-3E-MATH-017-QA-api.md` (batch `msgbatch_01PywfKNDA2tXivB6NQ41rfr`, effort low). Ses constats sont traités ci-dessous comme des **pistes**, chacun revérifié.

## 1. Contrôles demandés
| Point | Constat | Preuve |
|---|---|---|
| Démontrer qu'un triangle n'est **pas** rectangle | Présent : définition « Contraposée », exemple 5, py3-11 (classer), py3-17 et py3-19 (QCM « n'est pas rectangle »), py3-20 (niveau 5, dédié). Les textes lus ne le nomment pas : Attendus 4e « Il démontre qu'un triangle est un triangle rectangle à partir de la connaissance des longueurs de ses côtés » (exemple de l'étagère 40-42-58, cas rectangle) ; programme 2020 « Le théorème de Pythagore et sa réciproque » et, pour le cycle, « le raisonnement par disjonction de cas ou par l'absurde ». | → prolongement logique, à étiqueter (C1) |
| Position de l'angle droit | Sur 500 graines × 20 exercices : angle droit au **1er sommet** du nom dans 5 003 occurrences sur 6 003 ; 2e sommet 500 (py3-15 seul), 3e sommet 500 (py3-16 seul). 15 exercices sur 20 : toujours le 1er sommet (4 noms ABC, EFG, KLM, RST tirés au hasard, mais même position). | `stats` par exercice (script de vérification, graines v0…v499) |
| Niveaux 4-5 vs 3 | N3 : un calcul direct (arrondi, valeur exacte, décimaux, classement). N4 : même calcul dans un contexte (échelle, panneau, repère, isocèle), 3 sur 4 sous forme `etapes` guidées. N5 : 2 à 4 parties guidées (py3-17 : « Calcule BC² », « Calcule AB² + AC² », conclusion QCM, triplets 3-4-5 ×k). Différence surtout contextuelle ; aucune question sans étapes intermédiaires. | lecture des énoncés (graine v1) |
| Genre de « hypoténuse » | 56 occurrences ; accords corrects partout (« l'hypoténuse est opposée », « le carré de l'hypoténuse est égal ») **sauf 2** : « Quel est l'hypoténuse ? » (indice de py3-18, l. 435) et « Quel est son hypoténuse ? » (mini-quiz, l. 546). | grep sur le fichier |
| BO n° 22 | Absent de `sources` du chapitre. L'objectif M4-EG-03 de l'inventaire cite pourtant « Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) ». Enregistrement du collecteur **vérifié** : `research/sources/records/bo-2019-22-pdf.json` (HTTP 200, sha256 `59c3cdd3…`, contient « Bulletin officiel n°22 du 29 mai 2019 » et « MENE1913283N »). | records |
| Équilibre des types | 20 exercices (4 par niveau, pilote) : M4-EG-03 (calculer une longueur) 13, M4-EG-04 (réciproque / non rectangle) 5, M3-AUTO-03 5 (recoupements). Côté de l'angle droit à calculer : 4 exercices (py3-06, 13, 16, 18) contre 9 pour l'hypoténuse. Interactions : numérique, QCM, étapes, tableau, ordonner, classer, vrai-faux. | liste des exercices |

## 2. Constats classés
| # | Catégorie | Exercice | Gravité | Preuve | Correction proposée |
|---|---|---|---|---|---|
| C1 | Programme | leçon (définition « Contraposée »), py3-20 | MINEUR | Non nommé dans les Attendus 4e ni le programme 2020 lus (cf. § 1) ; la leçon le présente comme une définition sans étiquette. | Étiqueter « Prolongement (raisonnement par l'absurde, cycle 4) » dans la leçon et py3-20 ; garder l'exercice. |
| C2 | Programme / sources | `sources` | MINEUR | BO n° 22 absent alors que l'inventaire s'y réfère ; enregistrement vérifié disponible. | Ajouter l'entrée BO n° 22 (kind official, verified, sha256 et accessedAt de l'enregistrement). |
| C3 | Réponses et logique | py3-01, 02, 05, 06, 07, 09, 10, 12, 17, 18 | **MAJEUR** | Angle droit toujours au 1er sommet (5 003/6 003) : py3-01 « Repérer l'hypoténuse » se résout sans comprendre (côté formé des deux autres lettres). | Tirer le sommet de l'angle droit parmi les trois (ou le nom du triangle de façon que l'angle droit change de position) dans ces générateurs ; garder les diagnostics par position. |
| C4 | Langue | py3-18 (indice), mini-quiz q1 | MINEUR | « Quel est l'hypoténuse ? », « Quel est son hypoténuse ? » | « Quelle est l'hypoténuse ? », « Quelle est son hypoténuse ? » |
| C5 | Niveau de difficulté | py3-17, 18, 19 (N5), py3-14, 15, 16 (N4) | MINEUR | Toutes les questions N4-N5 sont découpées en étapes ; N5 = N2-N3 en contexte. | Au moins un N5 sans étapes intermédiaires (réponse finale + rédaction), données non triplets (décimaux, arrondi). |
| C6 | Types d'exercices | py3-20 partie 2 | MINEUR | Demande « l'écart » $FG^2 - (EF^2 + EG^2)$ (31 cm²) : grandeur sans usage au Brevet (constat de la relecture IA, confirmé). | Remplacer par la saisie des deux quantités ou par la conclusion. |
| C7 | Jeux | calcul-flash, 5 items | MINEUR | « rectangle ? (1 si oui, 0 si non) » : codage artificiel (constat IA, confirmé, l. 585-589). | Remplacer par des carrés/racines ou passer ces items en vrai-faux. |
| C8 | Langue / consigne | py3-12 | MINEUR | « (valeur exacte, un décimal) » alors que BC est entier dans ≈ 20 % des tirages (BC = 1 : 51/500 ; non décimal au total 99/500). | « valeur exacte » seul, ou « écris le résultat sous forme décimale ». |
| C9 | Amélioration facultative | py3-15 | — | Pas de figure du repère. (Le triangle dégénéré évoqué par la relecture IA est **impossible** : écarts issus de triplets, jamais nuls.) | Ajouter une figure SVG du repère (facultatif). |
| C10 | Volume | chapitre | (connu) | 20 exercices au lieu de 30 : décision du pilote (`--exercises 20`). | À traiter avant publication, hors pilote. |

Constats de la relecture IA **non confirmés** : « dégénérescence » de py3-15 (impossible) ; « l'introduction ne signale pas la 4e » (elle le dit : « Ces notions, vues en 4e, reviennent très souvent… ») ; py3-09 « arrondi ambigu » (les tirages à moins de 0,05 de la demi-unité sont exclus ; 500 tirages validés) ; « mistakes mal formés » de py3-12 (`parseNumber` lit « 1.96 » ; validateur vert).

## 3. Lot de corrections proposé (à approuver, aucune appliquée)
C3 (majeur), puis C1, C2, C4, C6, C7, C8 (mineurs, éditions locales), C5 en option (un exercice N5 réécrit). Après correction : `validate-chapter`, test de non-régression sur la position de l'angle droit (≥ 2 positions par générateur sur 500 graines), relecture humaine ; pas de nouvelle relecture IA nécessaire pour ces éditions.
