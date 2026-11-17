# Passation : reprendre le projet sans l'historique de conversation

_Créé le 2026-11-17, mis à jour au point d'arrêt du 2026-11-17 ~13:08 UTC (autorisation du porteur de projet du même jour). À tenir à jour à chaque point d'arrêt. Aucun secret ni clé API dans ce fichier._
_Les numéros « run #N » sont les `run_number` du workflow « Generate Lessons » (`.github/workflows/generate-lessons.yml`)._

## 1. État au 2026-11-17

### Pilote API (en cours)
- **Pilote approuvé** le 2026-11-16 : plafond propre 2,20 $, **cumul maximal 2,892 $** (`pipeline/budget.json` de la branche de travail). Ne jamais relever le plafond. Vérifier le cumul avant chaque lot ; arrêter s'il serait dépassé.
- **Cumul réel au registre (Data Store, entrées `actual`)** : **1,272 $** (run #46 : 54 entrées, 14 opérations, aucune réservation ouverte ; Sonnet 1,259 $, Haiku 0,014 $).
- Pire cas restant du lot 3 : 1,508 $ (chapitre Opus 1,094 $ + criblage 0,004 $ + juge 0,077 $ + 2 corrections × 0,167 $) → cumul ≤ 2,780 $ ≤ 2,892 $.
- Lot 1 (relecture Pythagore) : terminé. Lot 2 (chapitre PC 4e) : terminé. **Lot 3 (chapitre 1re, Opus) : en cours.**

### Point d'arrêt exact (2026-11-17, ~13:08 UTC)
| Élément | Valeur |
|---|---|
| Lot / étape | lot 3, étape `chapter` (Opus 5.5, `max_tokens` 96 000, effort medium), état `batch-pending` |
| Batch ouvert | `msgbatch_01JcPJdoquTQWk8Sk7Rd5d8C`, soumis au run #47 (2026-11-17T13:05Z, ref `claude/stoic-dirac-asjcs0`, commit `51d3769`) |
| Réservation | `math-1re-spe-second-degre-chapter-1794920701043` ; registre après envoi : 56 entrées, 15 opérations, dépense comptée 2,359 $ (= 1,272 $ réel + réservation ≈ 1,087 $) |
| Dossier | batch `msgbatch_01HsGPMA5ZzLkSeTv6778Gnz` (run #44) collecté au run #46 (ref `claude/stoic-dirac-asjcs0`, 13:01 UTC) : `ended`, 1 réussi. **Coût réel 0,002 $** (estimation max 0,00348 $) ; entrée 9 563, sortie 5 901 / 12 000 dont réflexion 2 130 (36 %). Committé sans modification : `research/dossiers/math-1re-spe-second-degre.md` (sha256 `fc9e2e95…`). |
| Relecture du dossier (Claude Code, 2026-11-17) | contenu mathématique correct (formules, démonstration en 5 étapes avec `2\|a\|`, signe, somme/produit, erreurs typiques) ; SD-06 avec les 3 approfondissements. Écarts hérités de la fiche, non corrigés (entrées du pilote figées) : la fiche déclare les 2 sources `seedId: null` / `pending_verification` alors que le collecteur a vérifié `bo-2026-14-pdf` ; le format 2 h / 6 + 14 pts est déjà vérifié (NS p. 44) mais le dossier le dit « à vérifier ». À traiter dans la PR de synthèse. |
| PR du bot | publish-pr du run #46 ouvre une PR `pipeline/math-1re-spe-second-degre-44088482503` (même traitement que #8-#10 : ne pas fusionner, fermer avec la PR de synthèse). |

**Étape suivante exacte** :
1. `collect` (ref `claude/stoic-dirac-asjcs0`, mode `collect`, niveau `1re`, matière `mathematiques`, parcours `specialite`, chapitre `math-1re-spe-second-degre`, batch_id `msgbatch_01JcPJdoquTQWk8Sk7Rd5d8C`). Gratuit. Si « pas encore disponible », relancer plus tard.
2. **Sortie tronquée (`max_tokens`) ou inutilisable → ARRÊT et rapport, aucun nouvel envoi.**
3. Si utilisable : contrôles compensatoires complets (ChapterSchema, validate-chapter, tsc, lint, tests, build), correction si nécessaire, criblage (Haiku sans réflexion), juge (Sonnet).
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
| `claude/stoic-dirac-asjcs0` | **branche de travail actuelle** (depuis le 2026-11-17, = `d0d5234` + suite) | y committer ; base de la PR de synthèse |
| `claude/zealous-newton-dn96ub` | ancienne branche de travail du pilote, arrêtée à `d0d5234` | laisser en l'état |
| PR #8, #9 (`pipeline/math-3e-pythagore-*`) | ouvertes, PR du bot | **ne jamais fusionner** ; laisser ouvertes |
| PR #10 (`pipeline/math-1re-spe-second-degre-44086852652`) | ouverte, PR du bot, ouverte par publish-pr du run #45 alors que la collecte n'a rien rapporté | **ne pas fusionner** ; ne contient ni dossier ni chapitre (rapports QA déjà sur la branche, dashboard, matrice avec coûts `null`). Fermeture avec la PR de synthèse (décision du 2026-11-17). Défaut à corriger : publish-pr ne doit pas s'exécuter quand une collecte n'a produit aucun fichier. |
| `claude/busy-fermi-8y29au` | absente du dépôt distant (constat du 2026-11-17) | **ne pas toucher** (ni fusion ni suppression) |
| PR de synthèse du pilote | à ouvrir après le rapport | contenu au § 3 ; **à son ouverture, fermer #8, #9, #10 sans fusion, avec une note de motif** (décision du 2026-11-17) |

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

Journal des exceptions publish-pr : (ii) non appliquée à ce jour ; (i) : run #37 (job 134024697098), run #41 (job 134036690749), run #43 (job 134042527165) ; erreur identique : `tests/pipeline-models.test.ts:128 TypeError: .toMatch() expects to receive a string, but got undefined`.

## 3. Travail en cours et suivant (par priorité)
1. **Lot 3** : voir « Étape suivante exacte » au § 1.
2. **Rapport du pilote** (`project/reports/`) : coût réel par lot, étape et modèle contre l'estimation ; QA (taux de réussite, tours de correction, needs-human, constats du juge) ; comparaison des dossiers Haiku/Sonnet **par le contenu** ; couverture objectifs/taxonomie ; réestimation du projet par niveau avec plafond proposé ; sorties tronquées par la réflexion (2 fois : relecture Gate 0, criblage lot 2) et tokens de réflexion par étape/modèle ; configuration par défaut proposée pour la production (dont chapitre Sonnet 96 000) ; « erreurs récurrentes » ; charge G2 par niveau ; liste « avant production » (B kit.ts, test D effort low, comparaison démonstration Opus/Sonnet, une PR par chapitre en fin de chaîne, QA tier 2 contre la taxonomie verrouillée, corrections ciblées Pythagore).
3. **PR de synthèse unique** : `budget.json` revenu à `limitUsd` 10 sur `main` avec historique du plafond du pilote à part ; affichage « reste … / 10 USD » corrigé ; correctifs de tests ; rapport du pilote ; `verificationMethod` « lecture-initiale » / « g2 » (P4-E-04 → `verified: false`, comptes séparés dans la matrice) ; porte G2 dans `run.ts` (refus en pilote/production, avertissement en dry-run) ; rapport du juge nommé par run ; ce fichier et `STATUS.md` à jour.
4. **Arrêt** après la PR de synthèse : attendre la décision du budget de production.

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
