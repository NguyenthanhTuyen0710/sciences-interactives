# Gate 0 de la feuille de route — confirmation du socle et audit des manques (2026-11-08)

Référence : `project/roadmap.md` § 4 (Gate 0) et § 3, 5, 6, 7. Audit en lecture seule : aucun code modifié, aucun appel API.

## Verdict
**Gate 0 non atteint.** Le socle est sain (tests, types, contrôles, garde-fous de dépense vérifiés en conditions réelles), mais la démo Pythagore n'a pas abouti : le batch « dossier » a été soumis et n'a jamais été récupéré. Action débloquante : lancer `Generate Lessons` en mode **collect** avec `batch_id = msgbatch_01CT9aQexYLepseuqxZ932uw` (aucune nouvelle dépense).

## 1. Démo Pythagore (`math-3e-pythagore`)
| Étape | État | Preuve |
|---|---|---|
| Sources G0/G1/G2 | fait | 3 PDF officiels collectés (SHA256), 3 correspondances G2 approuvées (`research/sources/verification/math-3e-pythagore.json`) |
| Dry-run local | OK | contrôle des données OK ; coût maximal dossier 0,223 $, chapitre 0,789 $, fix ≤ 2 × 0,237 $, relecture 0,195 $ |
| Run #3 (submit, `main`) | succès | batch dossier `msgbatch_01CT9aQexYLepseuqxZ932uw` soumis ; registre : 0,143 $ comptés, reste 9,857 / 10 $ |
| Run #4 (submit, `main`) | échec **attendu** | `ARRÊT : requête identique déjà soumise` (code 3) : l'anti-doublon a fonctionné ; registre cohérent et republié |
| collect dossier | **à faire** | — |
| relecture + commit du dossier, submit chapitre, collect, validate-chapter, fix, review | à faire | — |

Tests locaux sur `main` (adbc6b3) : `npm test` 450/450, `tsc` 0 erreur, `pipeline/sources/run.ts check` OK. `budget.json` : `creditVerified: true` (commit du porteur de projet sur `main`).

## 2. Ce que l'existant couvre déjà
| Exigence de la feuille de route | Existant |
|---|---|
| § 3 Batch API + cache de prompt | `--submit`/`--collect` par Message Batches (−50 %) ; préfixe système identique mis en cache 1 h |
| § 3 Cổng ngân sách 10 USD | coût maximal réservé avant envoi, plafond codé en dur `TRIAL_CAP_USD`, `creditVerified` obligatoire |
| § 3 Idempotence, pas de batch en double | empreinte des entrées par étape, anti-doublon dans le registre, groupe de concurrence `data-store`, `maxRetries: 0`, `--reconcile` |
| § 3 Sửa có mục tiêu ≤ 2 vòng | `MAX_FIX_ROUNDS = 2`, corrections par remplacements ciblés à partir des erreurs de `validate-chapter` |
| § 3 Rẻ trước | `validate-chapter` (contrat, 500 tirages, réponses, doublons, tutoiement) avant la relecture IA |
| § 5 Cổng duyệt trước publish | chapitre produit en `draft`, non inscrit au registre, sorties en artefact, jamais committées |
| § 6 tầng 1 et 3 | tầng 1 : `validate-chapter`, `npm test`, `ui-check`, e2e ; tầng 3 : étape `review` |
| Gate 1 (collège) | inventaires maths et PC 6e→3e (`curriculum-math.json`, `curriculum-pc.json`), format DNB 2027 |
| Gate 2 | collecteur `pipeline/sources/` (G0/G1/G2, robots.txt, préfixes, délai, SHA256) |

## 3. Manques (constat uniquement, à traiter dans les gates suivants)
| # | Réf. | Manque | Gate concerné |
|---|---|---|---|
| M1 | § 5 | La progression entre étapes exige un commit manuel (dossier puis chapitre) : `pipeline/state/` et les sorties ne sont transmis qu'en artefact, pas via le Data Store. | Gate 0 (démo) puis § 5 |
| M2 | § 5 | Entrées du workflow figées : `level` = 3e, `subject` = mathematiques, `chapter` = 2 fiches ; pas de groupe de chapitres, pas de `parcours`, modes `dry-run/submit/collect/reconcile` au lieu de `dry-run/pilot/production`. | § 5 |
| M3 | § 5 | `run.ts` refuse toute matière autre que les mathématiques (prompts et inventaire maths seulement). | pilote PC |
| M4 | § 5, § 7 | Pas de détection automatique du travail restant : la matrice de couverture est un Markdown rédigé à la main, non lisible par machine, et aucun script ne la régénère. | Gate 1 |
| M5 | § 5 | Rapport de run : coût et registre présents ; taux de QA réussi et nombre de `needs-human` absents ; aucun statut `needs-human` après 2 tours de fix. | § 5 |
| M6 | Gate 1 | Aucun inventaire lycée (2de, 1re, Tle, spécialité / complémentaires / expertes, Enseignement scientifique, bac, EAF, ECE) ; `GRADES` du schéma limité à 6e→3e. | Gate 1 |
| M7 | Gate 1 | Objectifs d'inventaire limités à `id, text, officialRef, verified` (chapitres : `prerequisites, notes`) : pas de niveau `exigible / consolidation / approfondissement`, pas de découpage notions → compétences. | Gate 1 |
| M8 | Gate 3 | Aucune taxonomie `ExerciseType` (ID, prérequis, variantes, méthode, erreurs, lien Brevet/Bac) ; les exercices ne référencent que des `objectives`. | Gate 3 |
| M9 | § 3 | Un seul modèle (Sonnet) pour toutes les étapes : pas de palier « petit modèle » avant le grand. | § 3 (à décider) |
| M10 | § 6 tầng 2 | Pas de contrôle de similarité avec les sources (originalité) ni de couverture de taxonomie. | Gate 3–4 |
| M11 | § 7 | Matrice sans colonnes : types d'exercice couverts, jeux actifs, statut QA / publication par chapitre, coût API. | Gate 1 |
| M12 | Gate 4 | Modèles de jeux : 5 (droite-graduee, calcul-mental, calcul-flash, chasse-erreurs, memory) ; absents : texte à trous, association, glisser-déposer, classement, manipulation géométrique, simulation physique, équilibrage d'équations. | Gate 4 |
| M13 | — | `pipeline/README.md` et `project/maths-3e-progress.md` désignent encore `math-3e-calcul-litteral` comme pilote, alors que le pilote lancé est `math-3e-pythagore`. | documentation |

## 4. Suite proposée
1. Collect du batch dossier (mode `collect`, sans dépense), relecture du dossier, puis chaîne chapitre → validate → review : **clôt le Gate 0**.
2. Gate 1 : rendre la matrice lisible par machine (M4, M11) et inventorier le lycée (M6, M7), sans appel API.
3. M1, M2, M3, M5 au moment d'élargir le pilote (une chaîne PC, une chaîne lycée), dans les fichiers existants uniquement.
