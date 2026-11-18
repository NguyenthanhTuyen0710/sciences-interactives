# Passation : reprendre le projet sans l'historique de conversation

_Créé le 2026-11-17, mis à jour au point d'arrêt du 2026-11-17 ~13:50 UTC (autorisation du porteur de projet du même jour). À tenir à jour à chaque point d'arrêt. Aucun secret ni clé API dans ce fichier._
_Les numéros « run #N » sont les `run_number` du workflow « Generate Lessons » (`.github/workflows/generate-lessons.yml`)._

## 1. État au 2026-11-17

### Pilote API (terminé le 2026-11-17 ; rapport : `project/reports/PILOT-rapport-final.md`)
- **Pilote approuvé** le 2026-11-16 : plafond propre 2,20 $, **cumul maximal 2,892 $** (`pipeline/budget.json` de la branche de travail). Ne jamais relever le plafond. Vérifier le cumul avant chaque lot ; arrêter s'il serait dépassé.
- **Cumul réel au registre (Data Store, entrées `actual`)** : **2,359 $** (run #49 : 58 entrées, 15 opérations, aucune réservation ouverte ; Sonnet 1,259 $, Haiku 0,014 $, Opus 1,086 $). Reste sous le plafond : 0,533 $.
- Lot 1 (relecture Pythagore) : terminé. Lot 2 (chapitre PC 4e) : terminé. **Lot 3 (chapitre 1re, Opus) : ARRÊTÉ** — chapitre tronqué, aucun nouvel envoi (décision du 2026-11-17).

### Point d'arrêt exact (2026-11-17, ~13:50 UTC) — ARRÊT du lot 3 (sortie Opus tronquée)
| Élément | Valeur |
|---|---|
| Lot / étape | lot 3, étape `chapter` (Opus 5.5, `max_tokens` 96 000, effort medium) : **payée, inutilisable** |
| Batch | `msgbatch_01JcPJdoquTQWk8Sk7Rd5d8C` soumis au run #47 (13:05 UTC) ; run #48 (13:16) `in_progress` ; collecté au **run #49** (13:44, `ended`, 1 réussi) |
| Résultat | **coût réel 1,086 $** (estimation max 1,094 $) ; entrée 63 143, sortie **96 000 / 96 000 dont réflexion 73 359 (76 %)** ; `stop_reason` `max_tokens` → code 7, `outcome` `usable: false` au registre. Texte visible ≈ 22 600 tokens (43 553 caractères) : en-tête, helpers, exercices `sd1-01`…`sd1-18` complets et `sd1-19` coupé (niveaux 1-3 seulement) ; ni niveaux 4-5, ni cours (démonstration SD-05), ni jeux. Texte conservé dans l'artefact du run #49 `lessons-math-1re-spe-second-degre-collect-44095538633` (id 14333931839, expire le 2026-12-17), `pipeline-output/unusable/math-1re-spe-second-degre-chapter-max_tokens.md` ; non committé. |
| Dossier | collecté au run #46 (0,002 $, sortie 5 901 / 12 000 dont réflexion 2 130), committé (`51d3769`). |
| Relecture du dossier (Claude Code, 2026-11-17) | contenu mathématique correct (formules, démonstration en 5 étapes avec `2\|a\|`, signe, somme/produit, erreurs typiques) ; SD-06 avec les 3 approfondissements. Écarts hérités de la fiche, non corrigés (entrées du pilote figées) : la fiche déclare les 2 sources `seedId: null` / `pending_verification` alors que le collecteur a vérifié `bo-2026-14-pdf` ; le format 2 h / 6 + 14 pts est déjà vérifié (NS p. 44) mais le dossier le dit « à vérifier ». À traiter dans la PR de synthèse. |
| PR du bot | publish-pr du run #46 ouvre une PR `pipeline/math-1re-spe-second-degre-44088482503` (même traitement que #8-#10 : ne pas fusionner, fermer avec la PR de synthèse). |

**Étape suivante exacte** : aucune action API. Lot 3 fermé (option A) ; rapport du pilote écrit ; PR de synthèse ouverte ; **arrêt** en attente des décisions (§ 3).
- **Branche de travail actuelle : `claude/stoic-dirac-asjcs0`** (avance rapide sur `claude/zealous-newton-dn96ub` au commit `d0d5234`, 2026-11-17, décision du porteur de projet ; `budget.json` identique, `limitUsd` 2,892). Les runs sont lancés sur cette ref. `claude/zealous-newton-dn96ub` reste en l'état (historique du pilote jusqu'à `d0d5234`), on n'y committe plus.

### Chapitres
| Chapitre | Statut | Remarque |
|---|---|---|
| `math-5e-nombres-relatifs` | publié | |
| `math-3e-arithmetique` | publié | |
| `math-3e-pourcentages-evolution` | publié | |
| `math-3e-puissances-calculs` | brouillon (écrit à la main) | |
| `math-3e-pythagore` | brouillon (écrit à la main) | 3 MAJEUR + 1 MINEUR confirmés par le juge (lot 1), **non corrigés** (décision) |
| `pc-4e-electricite` | brouillon (pipeline, META), non inscrit dans `index.ts` | lot 2 ; NEEDS_REVIEW : 5 MAJEUR + 5 MINEUR (`project/reports/SCI-4E-PC-007-QA-api.md`) |
| `math-1re-spe-second-degre` | à produire (lot 3) | Opus, démonstration exigible |

### Gates (feuille de route `project/roadmap.md`)
- Gate 0 : chaîne Pythagore complète atteinte (0,692 $).
- Gate 1 : atteint pour les 3 lots du pilote. Attention : Gate 1 ne contrôle que le classement, pas `verified` (voir § 4).
- G2 (sources) : lot 1re approuvé par Nguyễn Thanh Tuyền (M1S-SD-01…06). Lot PC : **non passé en G2** (exception délibérée du pilote).

### Branches et PR
| Élément | État | Action |
|---|---|---|
| `claude/stoic-dirac-asjcs0` | **branche de travail actuelle** ; PR #13 fusionnée (`38cf04e`), branche repartie de `main` le 2026-11-17 | y committer ; une nouvelle PR par lot |
| `claude/zealous-newton-dn96ub` | ancienne branche de travail du pilote, arrêtée à `d0d5234` | laisser en l'état |
| PR #8, #9 (`pipeline/math-3e-pythagore-*`) | **fermées sans fusion** (2026-11-17, motif en commentaire), PR du bot | **ne jamais fusionner** ; laisser ouvertes |
| PR #10 (`pipeline/math-1re-spe-second-degre-44086852652`) | **fermée sans fusion** (2026-11-17), PR du bot, ouverte par publish-pr du run #45 alors que la collecte n'a rien rapporté | **ne pas fusionner** ; ne contient ni dossier ni chapitre (rapports QA déjà sur la branche, dashboard, matrice avec coûts `null`). Fermeture avec la PR de synthèse (décision du 2026-11-17). Défaut à corriger : publish-pr ne doit pas s'exécuter quand une collecte n'a produit aucun fichier. |
| `claude/busy-fermi-8y29au` | absente du dépôt distant (constat du 2026-11-17) | **ne pas toucher** (ni fusion ni suppression) |
| PR #11 (`…-44088482503`, run #46, dossier) et #12 (`…-44090982433`, run #48, collecte sans résultat) | **fermées sans fusion** (2026-11-17), PR du bot (publish-pr) | même traitement que #10 |
| PR #13 (synthèse du pilote) | **fusionnée** le 2026-11-17 (`38cf04e`) | — |

## 2. Décisions en vigueur
| Date | Décision |
|---|---|
| 2026-11-07 | Tutoiement dans tout le contenu élève ; `/admin` vouvoie. |
| 2026-11-07 | Paliers de modèles : Haiku extraction/criblage, Sonnet contenu et relecture, Opus seulement si nécessaire (chapitre lycée avec démonstrations). |
| 2026-11-15 | D2 : sortie TypeScript (fonctions `vary`), contrôle obligatoire par `ChapterSchema`, PR. |
| 2026-11-15 | D3 : déclenchement automatique (`workflow_run`) = dry-run seulement ; pilote/production à la main. |
| 2026-11-15 | D4 : une requête de chapitre + corrections ciblées par diff ; pas de découpage en 5 étapes. |
| 2026-11-15 | D6 : la PR ne met à jour que `project/ledger.json` ; le registre des coûts reste dans le Data Store. |
| 2026-11-15 | D8 : ne pas toucher `claude/busy-fermi-8y29au`. |
| 2026-11-15 | Juge : préfixe système « light ». |
| 2026-11-16 | Réviseur G2 : « Nguyễn Thanh Tuyền ». `attach_evidence` ne passe `verified: true` que si citation verbatim + approbation datée. |
| 2026-11-16 | **Lancer test, tsc et lint AVANT chaque commit** (le hook pousse automatiquement) ; jamais de commit avec un test rouge. |
| 2026-11-16 | Chaque lot de travail : branche neuve depuis `main` + nouvelle PR. Commits en français. Jamais de `.env`. |
| 2026-11-16 | Ne pas créer de fichier sans demander (rapports et propositions dans les conventions existantes : admis). |
| 2026-11-16 | PR du bot (#8, #9) : ne jamais fusionner. Aucune publication : les chapitres du pilote restent brouillons. |
| 2026-11-16 | Exception publish-pr, **étroite** : (i) tests dry-run `tests/pipeline-models.test.ts` l. 103/124/128 rouges car ils lisent l'état du dépôt (corrigé sur la branche, pas sur `main`) ; (ii) erreurs de contenu signalées identiquement par validate-chapter et traitées par un tour de correction. Après correction, publish-pr ne peut être rouge que par (i). Chaque application est journalisée (run, job, erreur verbatim). Toute autre erreur système : ARRÊT et rapport. |
| 2026-11-16 | Après chaque génération ou correction : contrôles compensatoires complets sur la branche (ChapterSchema, validate-chapter avec tutoiement et unités, tsc, tests, lint, build). |
| 2026-11-17 | Criblage Haiku sans réflexion (`thinking: disabled`) ; M17 minimal : un seul nouvel envoi, seulement si `usable: false`, motif obligatoire, empreinte `:retry=1`, toujours soumis au plafond. |
| 2026-11-17 | Chapitre 1re Opus : `max_tokens` 96 000, effort medium ; **envoi du batch chapitre Opus approuvé**. |
| 2026-11-17 | Dossier Haiku : `max_tokens` 12 000 pour tous les chapitres. |
| 2026-11-17 | Rapport du pilote : proposer `max_tokens` 96 000 par défaut pour le chapitre Sonnet en production (proposition seulement, pas de changement de code pendant le pilote). |
| 2026-11-17 | `project/HANDOFF.md` écrit tôt, mis à jour après le rapport du pilote. |
| 2026-11-17 | Branche de travail : `claude/stoic-dirac-asjcs0` (avance rapide sur `d0d5234`) ; `claude/zealous-newton-dn96ub` laissée en l'état. |
| 2026-11-17 | Lot 3 : si la sortie du chapitre Opus est tronquée (`max_tokens`) ou inutilisable → **ARRÊT et rapport, aucun nouvel envoi** (hors budget). Si utilisable : contrôles compensatoires complets puis suite du lot 3 (correction si nécessaire, criblage, juge) aux conditions déjà approuvées. |
| 2026-11-17 | PR #8, #9, #10 : laissées ouvertes, jamais fusionnées ; fermées avec motif à l'ouverture de la PR de synthèse. |
| 2026-11-17 | HANDOFF mis à jour après chaque envoi ou collecte de batch. |
| 2026-11-17 | Lot 3 : option A — fermé, aucun nouvel envoi ; constat versé au rapport (réflexion Opus 76 %, ≈ 1,19 $ de sorties tronquées, conception lycée en deux requêtes modifiant D4 pour le lycée, hypothèse effort `low` non testée). |
| 2026-11-17 | Sortie tronquée conservée : `project/reports/SCI-1RE-SD-chapter-TRUNCATED.md` (jamais dans `src/`). |
| 2026-11-17 | publish-pr seulement si la collecte a produit une sortie utilisable ; lié à la conception « une PR par chapitre » (à faire avant la production). |

### Décisions du 17-11-2026 (après fusion de la PR #13, `38cf04e`)
| Sujet | Décision |
|---|---|
| Plafond | `main` garde `limitUsd` **2,892 $**. Chaque relèvement = **une petite PR qui ne modifie que `pipeline/budget.json`**, approuvée par le porteur de projet. |
| Première vague de production | **(A)** correction ciblée de Pythagore selon la taxonomie verrouillée (3 MAJEUR + 1 MINEUR du juge) ; **(B)** 4 nouveaux chapitres de 3e. Plafond de la vague : **6,40 $**, plus **0,30 $** à part pour l'essai H1. **Aucun plafond** pour les autres niveaux. |
| Lycée | Pilote séparé, plus tard, après H1 et l'approbation de la conception en deux requêtes. |
| D4 (lycée) | Modifiée pour le lycée : requête « cours + démonstrations » et requête « exercices + jeux » séparées (conception à approuver). Le collège garde D4. |
| Exceptions publish-pr (i)/(ii) du 2026-11-16 | **Caduques**, sauf si elles sont reformulées. |
| Préparatifs sans API | (a) porte G2 + `verificationMethod` ; (b) une PR par chapitre et rapport du juge nommé par run (**conception à approuver avant code**) ; (c) QA tier 2 déterministe contre la taxonomie verrouillée ; (d) garde-fou de troncature (`max_tokens` ≥ besoin estimé) ; (e) proposition H1 (**envoi après approbation**). |

### Décisions du 18-11-2026
| Sujet | Décision |
|---|---|
| CI de la PR #14 | Chapitre témoin du dry-run de `pr-checks` : `math-3e-calcul-litteral` (au lieu de Pythagore) ; assertion « aucun appel API » inchangée ; dry-runs PC et 1re conservés. Pythagore reste « non validé » (matrice : brouillon, QA en attente) jusqu'à la correction (A). Tout autre contrôle rouge à cause de la QA tier 2 : rapport, jamais d'assouplissement. |
| (b) une PR par chapitre | **Approuvé** : une branche `pipeline/<chapitre>` et une PR par chapitre ; PR ouverte seulement quand la chaîne est terminée et les contrôles verts ; une collecte sans sortie utilisable ne committe rien et n'ouvre aucune PR. |
| Chapitre Sonnet | `max_tokens` **96 000** (approuvé). Réservation maximale par chapitre plus élevée (≈ 0,48 $ de sortie en batch) ; coût réel = tokens consommés. Essai D (baisse d'effort/réflexion) après les résultats de H1. |
| H1 | 2 requêtes Opus 5.5 (effort `low` et `medium`), même prompt de démonstration M1S-SD-05, `max_tokens` 13 500 chacune, maximum 0,29 $. Le garde-fou de troncature s'applique avec l'estimation propre de H1 (aucune exemption). Envoi seulement si le dry-run affiche ≤ 0,30 $ et cumul ≤ 2,892 $ ; sinon ARRÊT et rapport. Rapport : part de réflexion, `stop_reason`, tokens visibles, démonstration complète (3 cas de Δ), tutoiement, conclusion H1. |
| 4 chapitres de 3e | Approuvés, **en séquence** : `math-3e-calcul-litteral` d'abord, puis `math-3e-equations`, `math-3e-thales-semblables`, `math-3e-trigonometrie`. Un fichier de taxonomie par chapitre (rédigé à la main, sans API ; approuvé puis verrouillé). Thalès et trigonométrie : vérifier d'abord que le moteur prend en charge les figures nécessaires. À soumettre pour calcul littéral : classement G1, propositions G2 (citation verbatim + page), taxonomie. |
| PR `budget.json` (9,059 $) | Après approbation du G1, du G2 et de la taxonomie de calcul littéral, juste avant le premier batch. |
| (A) Pythagore | Après fusion de #14 et H1 : une requête de correction ciblée via le pipeline (Sonnet) regroupant 3 MAJEUR + 1 MINEUR du juge et les 3 écarts QA tier 2. Avant : confirmer que le pipeline reconnaît Pythagore comme produit par le pipeline (étape `chapter` au registre, pas de regex) et que l'estimation ≤ reste sous le plafond ; sinon ARRÊT, attendre la PR de relèvement. |
| Ordre | fusion #14 → PR (b) + étape d'essai H1 → H1 → (A) → chaîne calcul littéral. |

Journal des exceptions publish-pr (caduques depuis le 2026-11-17) : (ii) non appliquée ; (i) : run #37 (job 134024697098), run #41 (job 134036690749), run #43 (job 134042527165) ; erreur identique : `tests/pipeline-models.test.ts:128 TypeError: .toMatch() expects to receive a string, but got undefined`.

## 3. Travail en cours et suivant (par priorité)
1. **Lot 3** : fermé (décision du 2026-11-17, option A) ; aucune correction, criblage ni juge du chapitre 1re.
2. **Rapport du pilote** : **fait** — `project/reports/PILOT-rapport-final.md` (pièce : `project/reports/SCI-1RE-SD-chapter-TRUNCATED.md`).
3. **PR de synthèse** : **fusionnée** (PR #13, commit de fusion `38cf04e`, 2026-11-17 ~14:09 UTC). Historique : (https://github.com/NguyenthanhTuyen0710/sciences-interactives/pull/13 ; base `main`, tête `claude/stoic-dirac-asjcs0`) ; PR du bot #8-#12 fermées le 2026-11-17 sans fusion, avec motif. Contenu : rapport, publish-pr seulement si sortie utilisable, plafond affiché = plafond appliqué, correctifs de tests, HANDOFF/STATUS. **Non inclus (décision attendue)** : `budget.json` revenu à 10 (un relèvement du plafond effectif : non fait sans décision), `verificationMethod` et porte G2 dans `run.ts`, rapport du juge nommé par run, une PR par chapitre (rapport § 8).
4. **Préparatifs de la première vague** (décisions du 17-11-2026, sans API) : branche `claude/stoic-dirac-asjcs0` repartie de `main` (`38cf04e`).
   - **Fait** : (a) porte G2 dans `run.ts` (`verificationMethod` calculée : « g2 » = preuve `attach_evidence` approuvée) ; P4-E-04 `verified: false`. (c) QA tier 2 dans `validate-chapter` (Pythagore : 3 écarts — py3-03, PY-T11, py3-20). (d) garde-fou de troncature (chapitre Sonnet à 64 000 refusé : besoin 67 453 → décision 96 000 attendue).
   - **En attente d'approbation** : (b) une PR par chapitre + rapport du juge nommé par run ; (e) essai H1 ; liste des 4 chapitres de 3e ; 4 taxonomies (nouveaux fichiers) ; PR `budget.json` pour la vague.
   - **2026-11-18** : CI de #14 verte (témoin calcul littéral) ; chapitre Sonnet à 96 000 ; dossier d'approbation de calcul littéral soumis (`research/sources/proposals/math-3e-calcul-litteral.json` : G1 + G2 ; `research/curriculum/mathematiques/taxonomy/math-3e-calcul-litteral.json` : statut « proposé »). Point ouvert : rattachement exercice ↔ type pour un chapitre nouveau (taxonomie verrouillée avant génération, listes `exercises` vides).
   - **2026-11-18, après fusion de #14 (`ffc890d`)** : (b) codée (job `stage-chapter` + `publish-pr` de fin de chaîne, rapports nommés par run) ; étape d'essai H1 codée (`--experiment h1`, entrée « experience »). Dry-run H1 : 0,284 $ au maximum, garde-fou accepté (besoin 11 459 ≤ 13 500). **Lancement de H1** (après fusion de la PR) : Generate Lessons, mode `pilot`, niveau `1re`, matière `mathematiques`, parcours `specialite`, chapitre `math-1re-spe-second-degre`, experience `h1` ; puis un `collect` par batch (deux `msgbatch_…`). Condition : dry-run ≤ 0,30 $ et cumul ≤ 2,892 $, sinon ARRÊT.
   - **H1 soumis (2026-11-18 ~12:10 UTC)** : PR #15 fusionnée (`38dfdbe`) ; dry-run run #50 sur `main` (registre réel) : 0,284 $ max, cumul 2,359 $, aucun blocage → envoi au run #51. Batches : `h1-low` = `msgbatch_01CQ7osNq7PLT9SugDEsiTWw`, `h1-medium` = `msgbatch_01QgBnhrCovwwvn2NpDpk58u`. Registre : 62 entrées, 17 opérations, dépense comptée 2,643 $ (réservations incluses), reste 0,249 $. **Suite** : `collect` de chaque batch (ref `main`, chapitre `math-1re-spe-second-degre`, niveau `1re`, parcours `specialite`), puis rapport H1.
   - **G2 à faire** : Pythagore 0 (déjà approuvé le 2026-11-07) ; 4 chapitres proposés : 11 objectifs obligatoires (+ classement G1 de 10 objectifs de 3e et de leurs objectifs de consolidation de 4e).

## 4. Erreurs récurrentes et leçons
- **La réflexion consomme toute la sortie** : relecture Gate 0 (11 260 tokens de réflexion, sortie tronquée), criblage lot 2 (7 999 / 8 000). Chapitre PC : 37 % de réflexion, 96,5 % de `max_tokens`. Opus 5.5 : réflexion ni désactivable ni plafonnable, seule la marge de `max_tokens` la contient.
- **Diagnostics équivalents en double** (py3-12, pct3-07/10/20, el4-08/16) : à traiter par une règle commune du moteur et/ou une exigence du prompt de chapitre.
- **Tests dépendants de l'état du dépôt** : utiliser la fixture `PIPELINE_ROOT` (tests hermétiques).
- **Détection d'un chapitre produit par le pipeline** : « brouillon » ≠ « écrit par l'IA » ; s'appuyer sur le marqueur META (`isPipelineDraft`), jamais sur une regex de forme.
- **`verified` sans G2** : 114/114 objectifs PC et 246/255 de maths sont `verified: true` depuis l'inventaire initial (commit 56cfac9), sans passage G2.
- Lire le code de sortie des outils, pas la dernière ligne affichée ; vérifier l'état réel d'une PR (fusionnée ou fermée) avant de l'annoncer.

## 5. Fichiers à lire au démarrage (dans l'ordre)
1. `CLAUDE.md`
2. `project/HANDOFF.md` (ce fichier)
3. `project/STATUS.md`
4. `pipeline/README.md`, puis `pipeline/models.ts` (`STEP_CONFIG`), `pipeline/budget.json`, `pipeline/ledger.ts`
5. `project/reports/PILOT-chapitres-PC-lycee.md`, puis le rapport du pilote une fois écrit
6. `project/roadmap.md`
7. Rapports QA des lots : `project/reports/SCI-3E-MATH-017-*-api.md`, `project/reports/SCI-4E-PC-007-*-api.md`
8. Fiches du pilote : `pipeline/chapters/pc-4e-electricite.json`, `pipeline/chapters/math-1re-spe-second-degre.json`
