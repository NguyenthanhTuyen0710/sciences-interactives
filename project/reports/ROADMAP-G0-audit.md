# Gate 0 de la feuille de route — confirmation du socle et audit des manques (2026-11-08)

Référence : `project/roadmap.md` § 4 (Gate 0) et § 3, 5, 6, 7. Audit en lecture seule : aucun code modifié, aucun appel API.

## Verdict
**Mise à jour 2026-11-08 (run #12) : la démo Pythagore a parcouru toute la chaîne** (dossier → chapitre → validation → correction manuelle → relecture IA valide), pour 0,692 $ au total. Gate 0 clos sous réserve de l'approbation du porteur de projet (voir « Conditions de clôture » en fin de document).

Historique : **Gate 0 non atteint.** Le socle est sain (tests, types, contrôles, garde-fous de dépense vérifiés en conditions réelles), mais la démo Pythagore n'a pas abouti : le batch « dossier » a été soumis et n'a jamais été récupéré. Mise à jour 2026-11-08 : dossier (run #5) et chapitre brouillon (runs #6-#7) produits, `validate-chapter` vert après une correction d'une ligne ; reste la relecture (étape `review`, ≈ 0,10 $) pour clore le Gate 0.

## 1. Démo Pythagore (`math-3e-pythagore`)
| Étape | État | Preuve |
|---|---|---|
| Sources G0/G1/G2 | fait | 3 PDF officiels collectés (SHA256), 3 correspondances G2 approuvées (`research/sources/verification/math-3e-pythagore.json`) |
| Dry-run local | OK | contrôle des données OK ; coût maximal dossier 0,223 $, chapitre 0,789 $, fix ≤ 2 × 0,237 $, relecture 0,195 $ |
| Run #3 (submit, `main`) | succès | batch dossier `msgbatch_01CT9aQexYLepseuqxZ932uw` soumis ; registre : 0,143 $ comptés, reste 9,857 / 10 $ |
| Run #4 (submit, `main`) | échec **attendu** | `ARRÊT : requête identique déjà soumise` (code 3) : l'anti-doublon a fonctionné ; registre cohérent et republié |
| Run #5 (collect, 2026-11-08) | succès | coût réel 0,123 $ (cache écrit 49 643 tokens, sortie 4 002) ; registre : 0,123 $ comptés, reste 9,877 / 10 $ ; dossier relu et committé (`research/dossiers/math-3e-pythagore.md`) |
| Run #6 (submit chapitre) + #7 (collect) | succès | batch `msgbatch_012BLbnuvEzL6ekt9WYVkPDP` ; coût réel 0,336 $ (entrée 7 660, cache écrit 49 643, sortie 45 868) ; total pilote 0,459 / 10 $ ; 20 exercices (4 par niveau, 16 à tirage), 3 jeux |
| validate-chapter | 1 défaut → corrigé à la main | py3-12 : diagnostic « $BC^2$ » égal à la réponse quand $BC = 1$ (triplet 3-4-5 × 2) ; filtre ciblé ; ensuite 8 004 tirages, 0 problème ; tsc, lint, 450/450 tests OK |
| Run #8 (submit review) | succès | pré-vol : HEAD 2608441 poussé (branche, 4 commits devant `main`), chapitre sha256 4757087…, draft, non inscrit ; registre 0,459 $ ; estimation exacte 0,189 $ (dry-run approx. 0,150 $) ; batch `msgbatch_019EqHN5QVtiojtrfEh95YVT` |
| Run #9 (collect review) | **échec — gate non atteint** | coût réel 0,095 $ (entrée 30 099, **cache lu 49 643**, sortie 12 000) ; total 0,554 / 10 $ ; `sortie tronquée (max_tokens atteint)` : `MAX_TOKENS.review = 12000` insuffisant, texte de relecture non enregistré ; un nouvel envoi identique est bloqué par l'anti-doublon (opération soldée) |
| Run #10 (collect du même batch, nouveau code) | sans frais | texte tronqué récupéré (`SCI-3E-MATH-017-review-TRUNCATED.md`) ; 11 260 tokens de réflexion sur 12 000 ; entrée `outcome` (usable: false) |
| Run #11 (submit review, effort low, JSON à schéma) | succès | requête : effort `low`, max_tokens 12 000, schéma sha `769c2fc2…` ; empreinte `57e531e1…` (≠ `108facdb…`) ; estimation exacte 0,190 $ ; batch `msgbatch_01PywfKNDA2tXivB6NQ41rfr` |
| Run #12 (collect review) | **succès** | `end_turn`, JSON conforme ; coût réel 0,138 $ (entrée 30 351, cache écrit 50 420, cache lu 0, sortie 1 368 dont réflexion 0) ; total **0,692 / 10 $** ; verdict NEEDS_REVIEW, 3 MAJEUR + 4 MINEUR → `SCI-3E-MATH-017-QA-api.md`, vérifiés dans `SCI-3E-MATH-017-QA-verification.md` |

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
| M12 | Gate 4 | Le moteur d'exercices couvre déjà QCM, texte à trous, associer, glisser-déposer, classer, ordonner, vrai-faux, repère (`src/lib/engine/types.ts`) ; modèles de **jeux** : 5 (droite-graduee, calcul-mental, calcul-flash, chasse-erreurs, memory). Absents : manipulation géométrique, simulation physique, équilibrage d'équations. | Gate 4 |
| M14 | § 3 | Cache de prompt inopérant entre batchs : `cache lu 0` aux runs #5 et #7, préfixe de 49 643 tokens écrit (et payé) à chaque étape. Les batchs séparés de plus de quelques minutes ne profitent pas du cache. | § 3 |
| M15 | § 5 | Mode `submit` : l'étape `fix` (synchrone) n'est jamais envoyée ; une erreur de validation exige une correction manuelle (faite ici en 1 ligne). | § 5 |
| M16 | § 5 | Sortie tronquée : `run.ts` lève une erreur avant d'enregistrer le texte partiel (relecture payée mais perdue) ; `MAX_TOKENS.review` (12 000) trop bas pour un chapitre de 20 exercices. | § 5 |
| M17 | § 3, § 5 | Pas de mécanisme de « nouvelle tentative motivée » pour une opération payée sans résultat utilisable (`outcome.usable = false`) : l'anti-doublon bloque toute requête de même empreinte, et l'empreinte de la relecture ne couvre que le texte du prompt (pas `max_tokens` ni `output_config`). À concevoir : entrée de registre « retry » liée à l'opération d'origine, motif obligatoire, une seule fois, coût compté. **Consigné, non implémenté.** | § 5 |
| M13 | — | `pipeline/README.md` et `project/maths-3e-progress.md` désignent encore `math-3e-calcul-litteral` comme pilote, alors que le pilote lancé est `math-3e-pythagore`. | documentation |

## Relecture du dossier Pythagore (2026-11-08)
- Conforme : 3 sources officielles seulement, objectifs M3-AUTO-03 / M4-EG-03 / M4-EG-04, consolidation 4e, méthodes, 9 erreurs typiques, 5 niveaux, tutoiement demandé.
- À surveiller dans le chapitre : « démontrer qu'un triangle n'est pas rectangle » absent de la citation retenue (le dossier le signale) ; § 9 rappelle « au moins 30 exercices » alors que le pilote impose 20 (`--exercises 20`, justification ajoutée par le pipeline).

## État des manques traités le 2026-11-08 (après le run #9)
- **M14** analysé : `project/reports/M14-prompt-caching.md` (cause : écart entre étapes > TTL ; préfixe identique ; options A à D ; non implémenté).
- **M15** traité : validateur étendu (`src/lib/engine/diagnostics.ts`), test de non-régression py3-12. Constat sur `math-3e-pourcentages-evolution` (publié) : deux diagnostics de même valeur sur 7 tirages / 15 502 (pct3-07, pct3-10, pct3-20) — **corrigé** (commit 5b5affd, approuvé : diagnostics ambigus retirés ; énoncés, réponses, options inchangés sur 15 502 tirages ; `validate-chapter` vert). Ce chapitre n'est pas contrôlé par `pr-checks.yml` (aucun blocage CI).
- **M14, tarif** : `pipeline/prices.json` → Sonnet 5.5 `cacheRead` 0,20 $/MTok ; page Tarifs Anthropic : **0,10 $/MTok** (0,05 × entrée). Seule la relecture #9 a lu le cache : sur-comptage ≈ 0,0025 $. Registre historique non modifié. Les autres prix Sonnet 5.5 (entrée 2, sortie 10, écriture 5 min 2,50, 1 h 4) sont conformes.
- **M14, preuve d'économie (option A, cache conditionnel)** : relecture #12 = 50 420 tokens écrits en cache 1 h et jamais relus (le format JSON invalide le cache des étapes précédentes, et aucune requête ne suit). Écriture : 0,1008 $ ; même préfixe sans cache : 0,0504 $ → **0,050 $ perdus, 37 % du coût de cette relecture**, sans aucun effet sur la sortie (mêmes tokens traités). Proposition : ne pas poser `cache_control` sur une étape isolée (relecture, dossier seul). Non implémenté.
- **M16** traité : texte tronqué sauvegardé et inscrit au registre (`outcome`), relecture JSON à schéma. Cause mesurée de la troncature (run #10, relecture du batch déjà payé) : **11 260 tokens de réflexion sur 12 000** ; il ne restait que ≈ 740 tokens de texte. Texte récupéré : `project/reports/SCI-3E-MATH-017-review-TRUNCATED.md` (non valide comme rapport QA).

## 4. Suite proposée
1. Collect du batch dossier (mode `collect`, sans dépense), relecture du dossier, puis chaîne chapitre → validate → review : **clôt le Gate 0**.
2. Gate 1 : rendre la matrice lisible par machine (M4, M11) et inventorier le lycée (M6, M7), sans appel API.
3. M1, M2, M3, M5 au moment d'élargir le pilote (une chaîne PC, une chaîne lycée), dans les fichiers existants uniquement.

## Conditions de clôture du Gate 0 (2026-11-08)
- [x] Démo Pythagore exécutée de bout en bout par le pipeline existant (runs #3 à #12), dépense 0,692 / 10 $.
- [x] Audit des manques (M1 à M17) consigné ; M15, M16 traités ; M14 analysé ; M17 consigné.
- [ ] Approbation du porteur de projet : ce rapport, la relecture `SCI-3E-MATH-017-QA-api.md` et sa vérification.
- [ ] Décision sur la fusion de la branche `claude/zealous-newton-dn96ub` dans `main` (correctifs pipeline, validateur, correction Pourcentages) : sans elle, un run lancé depuis `main` n'a pas ces correctifs.
- Hors Gate 0 : lot de corrections QA de Pythagore (C1 à C8) et publication — décisions séparées.
