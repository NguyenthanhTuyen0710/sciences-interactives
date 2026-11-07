# Système multi-agents — contrats

Un **orchestrateur** coordonne 14 agents spécialisés. L'environnement exécute les agents par lots (sous-agents en
arrière-plan) ; aucun rôle de revue n'est supprimé. Seul **B4** modifie le code partagé de l'application ; chaque
agent n'écrit que dans ses fichiers dédiés. L'état des tâches vit dans `project/ledger.json` (source unique) ;
`project/dashboard.md` est **généré** par `npm run dashboard` (ne pas l'éditer à la main).

Identifiants de tâche : `SCI-<NIVEAU>-<MATIÈRE>-<NNN>` (ex. `SCI-5E-MATH-001`), `SCI-DNB-MATH-NNN`, `SCI-INFRA-NNN`.
États : `TODO → RESEARCHING → RESEARCHED → AUTHORING → QA_PENDING → (QA_FAILED ↺) → APPROVED → INTEGRATED → PUBLISHED`, ou `BLOCKED`.

Rapport de passation (obligatoire, `project/reports/<taskId>-<agent>.md`) : identifiant de tâche, périmètre réalisé,
fichiers modifiés, sources utilisées, validations exécutées (commande + résultat réel), problèmes, travail restant,
prochaine action.

## Groupe A — Recherche et programme

| Agent | Responsabilité | Entrées | Sorties (fichiers dédiés) | Dépend de | Passe à |
|---|---|---|---|---|---|
| **A1** Auditeur du programme officiel | Inventaire exhaustif des programmes en vigueur (cycles 3 et 4), versions applicables par année, matrice de couverture, prérequis | BO, Éduscol, sites académiques | `research/curriculum/mathematiques/*`, `research/curriculum/master-curriculum.json` (fusion par l'orchestrateur), `research/curriculum/coverage-matrix.md` | — | A2, A3, A4, QA1 |
| **A2** Recherche mathématiques | Dossier par chapitre : périmètre officiel, hors-programme, définitions, méthodes, progression, erreurs typiques, idées visuelles | Matrice A1, sources officielles, Math93 (complémentaire) | `research/dossiers/math-<niveau>-<slug>.md` | A1 | B1, B2, B3 |
| **A3** Recherche physique-chimie | Idem pour la physique-chimie (+ sécurité, expériences, unités) ; niveau de chaque source vérifié (Labolycée = lycée en général) | Programmes cycle 3/4, sources académiques | `research/curriculum/physique-chimie/*`, `research/dossiers/pc-*.md` | A1 | B1, B2, B3 |
| **A4** Recherche Brevet | Format des épreuves par session, annales officielles référencées (sans copie), types de questions, automatismes, carte compétences ↔ questions | Notes de service, annales | `research/brevet/*` | A1 | B2, QA6 |

## Groupe B — Production

| Agent | Responsabilité | Sorties | Liste de contrôle |
|---|---|---|---|
| **B1** Auteur du cours | Cours original en français (15 rubriques du contrat `lesson`) | `src/lib/chapters/data/<id>.ts` (partie `lesson`) | rubriques complètes ; aucune paraphrase serrée d'une source ; niveau de langue adapté ; notations françaises (virgule décimale, `−`) |
| **B2** Exercices et corrections | ≥ 30 exercices validés répartis sur 5 niveaux, formats variés, indices progressifs, diagnostics d'erreurs | même fichier (partie `exercises`) | chaque objectif officiel couvert ; réponse vérifiée ; correction pas à pas ; raisonnement ; durée ; erreurs fréquentes |
| **B3** Jeux interactifs | ≥ 3 activités par chapitre à partir des modèles `src/components/games` | même fichier (partie `games`) ; nouveaux modèles dans `src/lib/games` + `src/components/games` | objectif précis ; consignes FR ; logique testée ; rétroaction ; recommencer ; adaptation ; progression ; clavier + tactile |
| **B4** Intégration front | Seul agent autorisé à modifier le code partagé (`src/app`, `src/components`, `src/lib/engine`, registres) | routes, composants, tests | réutiliser les composants ; pas de nouvelle dépendance sans justification ; build + tests verts |

Les données B1/B2/B3 d'un chapitre sont validées par `ChapterSchema` (`src/lib/chapters/schema.ts`) et par
`tests/chapters.test.ts` avant toute intégration.

## Groupe C — Assurance qualité (indépendante des auteurs)

Chaque agent QA relit **les sources officielles et le contenu**, pas le résumé d'un autre agent. Verdict : `PASS`, `FAIL`
ou `NEEDS REVIEW`, consigné dans `project/reports/<taskId>-QAx.md` puis reporté dans `reviewStatus` du chapitre.

| Agent | Vérifie | Clé `reviewStatus` |
|---|---|---|
| **QA1** Complétude du programme | domaines représentés, bon niveau, prérequis, notions manquantes, programme obsolète, correspondance objectifs ↔ compétences | `curriculum` |
| **QA2** Exactitude scientifique | définitions, propriétés, démonstrations, lois, unités, sécurité expérimentale | `accuracy` |
| **QA3** Exercices et réponses | résout chaque exercice **sans** la clé ; ambiguïtés, réponses multiples, équivalences acceptées, cohérence indices/corrections, niveaux réalistes, paramètres aléatoires valides ; ajoute des tests | `exercises` |
| **QA4** Jeux et pédagogie | consignes, logique, score, rétroaction, rejouer, cas limites, accessibilité, intérêt didactique réel | `games` |
| **QA5** Ingénierie et UX | build, routes, erreurs d'exécution, mobile, clavier, sémantique, liens, rendu KaTeX, performances, saisies | `technical` |
| **QA6** Langue et Brevet | orthographe, grammaire, terminologie, niveau de langue, cohérence ; conformité Brevet ; distinction sujet officiel / sujet original | `language` |

## Règles de publication (Definition of Done)

Un chapitre passe `publicationStatus: "published"` seulement si `doneIssues()` est vide (≥ 30 exercices ou justification,
≥ 3 activités, 5 niveaux, chaque objectif couvert, six revues `pass`), si `npm test`, `npm run lint`, `npx tsc --noEmit`
et `npm run build` réussissent, et si le contrôle navigateur QA5 a réellement été exécuté. Une erreur critique bloque la
publication. Les chapitres non publiés sont invisibles sur le site (prévisualisation : `SHOW_DRAFTS=1`).
