# Rapport du pilote API (lots 1-3), 2026-11-17

_Base : registre des dépenses du Data Store (release brouillon `data-store`, run #49 : 58 entrées, 15 opérations, cohérent), artefacts des runs #25-#49 du workflow « Generate Lessons », `scripts/validate-chapter.ts`. Plan et estimations d'origine : `project/reports/PILOT-chapitres-PC-lycee.md` § 4. Aucun appel API pour ce rapport._

## 0. Synthèse
- **Dépense cumulée : 2,359 $ / plafond 2,892 $** (Gate 0 : 0,692 $ ; pilote : 1,667 $). Reste 0,533 $. Aucune réservation ouverte.
- Lot 1 (relecture Pythagore) et lot 2 (chapitre PC 4e) : **chaîne complète**, chapitres valides au tier 1, **NEEDS_REVIEW** au juge. Lot 3 (chapitre 1re, Opus) : **arrêté**, sortie tronquée, lot fermé sans nouvel envoi (décision du 2026-11-17).
- **Constat principal** : la réflexion non plafonnable consomme la sortie. Opus 5.5 : 73 359 / 96 000 tokens (76 %) ; Sonnet 5.5 sur le chapitre PC : 23 147 / 61 779 (37 %).
- **≈ 1,19 $ (50 % de la dépense cumulée) payés pour des sorties inutilisables**, les trois fois par troncature : chapitre 1re 1,086 $, relecture Pythagore (Gate 0) 0,095 $, criblage PC 0,004 $.
- Coût réel d'un chapitre collège complet (chaîne Sonnet, PC 4e) : **≈ 0,50 $** ; réestimation collège : **≈ 52 $ réaliste, ≈ 66 $ max sans correction, ≈ 102 $ pire cas** (105 chapitres).

## 1. Coût réel par lot, étape et modèle (Message Batches)

| Lot | Étape | Modèle | Estimation (max) | Réel | Utilisable | Remarque |
|---|---|---|---|---|---|---|
| G0 | dossier | non enregistré (avant les paliers) | 0,143 | 0,123 | oui | |
| G0 | chapitre | non enregistré | 0,427 | 0,336 | oui | |
| G0 | relecture | non enregistré | 0,189 | **0,095** | **non** | tronquée (11 260 tokens de réflexion) |
| G0 | relecture (2e) | non enregistré | 0,190 | 0,138 | oui | |
| **G0** | | | | **0,692** | | |
| 1 | criblage | Haiku 5.5 | 0,004 | 0,003 | oui | réflexion 3 108 / 4 047 |
| 1 | juge | Sonnet 5.5 | 0,071 | 0,041 | oui | |
| **1** | | | **0,075** | **0,044** | | réaliste estimé ≈ 0,02 |
| 2 | dossier | Haiku 5.5 | 0,003 | 0,002 | oui | retenu |
| 2 | dossier (comparaison) | Sonnet 5.5 | 0,050 | 0,030 | oui | non retenu (§ 4) |
| 2 | chapitre | Sonnet 5.5 | 0,386 | 0,371 | oui | 96,5 % de `max_tokens` (64 000) |
| 2 | correction, tour 1 | Sonnet 5.5 | 0,172 | 0,095 | oui | 1 tour sur 2 permis |
| 2 | criblage | Haiku 5.5 | 0,004 | **0,004** | **non** | 7 999 / 8 000 en réflexion |
| 2 | criblage (nouvel envoi motivé, sans réflexion) | Haiku 5.5 | 0,004 | 0,003 | oui | |
| 2 | juge | Sonnet 5.5 | 0,079 | 0,029 | oui | |
| **2** | | | **0,520** sans correction / **0,854** pire cas | **0,535** | | réaliste estimé ≈ 0,33 |
| 3 | dossier | Haiku 5.5 | 0,003 | 0,002 | oui | |
| 3 | chapitre | **Opus 5.5** | 1,094 (96 000 tokens) | **1,086** | **non** | tronqué ; lot fermé |
| **3** | | | **0,850** (plan) / **1,511** (pire cas à 96 000) | **1,088** | | |
| **Pilote (1-3)** | | | **1,445** max / **2,112** pire cas (plan) ; plafond propre 2,20 | **1,667** | | |
| **Cumul** | | | plafond 2,892 | **2,359** | | |

Par modèle (cumul) : Sonnet 1,259 $ · Opus 1,086 $ · Haiku 0,014 $. Écart principal à l'estimation : lot 3 (troncature au maximum autorisé) et lot 2 (correction + dossier de comparaison).

## 2. Réflexion (thinking) par étape et modèle

| Étape | Modèle, effort | Sortie | dont réflexion | % | Issue |
|---|---|---|---|---|---|
| dossier PC | Haiku 5.5, medium | 6 657 | 2 897 | 44 % | OK |
| dossier 1re | Haiku 5.5, medium | 5 901 | 2 130 | 36 % | OK |
| dossier PC | Sonnet 5.5, medium | 4 190 | 0 | 0 % | OK |
| chapitre PC | Sonnet 5.5, medium | 61 779 | 23 147 | **37 %** | OK (96,5 % du plafond) |
| **chapitre 1re** | **Opus 5.5, medium** | **96 000** | **73 359** | **76 %** | **tronqué** |
| correction PC | Sonnet 5.5, medium | 590 | 339 | 57 % | OK |
| criblage Pythagore | Haiku 5.5, low | 4 047 | 3 108 | 77 % | OK |
| criblage PC | Haiku 5.5, low | 8 000 | 7 999 | 100 % | **tronqué** |
| criblage PC | Haiku 5.5, réflexion désactivée | 1 898 | 0 | 0 % | OK |
| juge Pythagore / PC | Sonnet 5.5, low | 1 229 / 2 000 | 0 / 0 | 0 % | OK |

Lecture : la réflexion adaptative est imprévisible d'une étape à l'autre (0 % à 100 %) et augmente avec la taille de l'entrée. Seul Haiku 5.5 accepte `thinking: disabled` (à effort ≤ high) ; Sonnet 5.5 l'accepte sous la forme `between_tools` (effort ≤ high) ; **Opus 5.5 ne permet ni de la désactiver ni de la plafonner** (`budget_tokens` refusé).

### Lot 3 : pourquoi le chapitre ne pouvait pas tenir (`SCI-1RE-SD-chapter-TRUNCATED.md`)
- Reçu : 18 exercices complets (niveaux 1-3), le 19e coupé ; ni niveaux 4-5, ni cours (démonstration SD-05), ni jeux. Contenu visible ≈ 22 641 tokens.
- Chapitre complet estimé (≥ 30 exercices, cours avec démonstration, ≥ 3 jeux) : ≈ 83 000-86 000 octets ≈ **42 000-43 500 tokens visibles**. Au taux de 76 %, il faudrait ≈ 175 000-180 000 tokens de sortie, **au-delà du maximum de l'API (128 000)** : aucune valeur de `max_tokens` ne suffisait à cette configuration.

### Hypothèse à tester (non testée, aucun batch envoyé) : `effort` plus bas sur Opus 5.5
Documentation officielle (guide de migration vers Claude Opus 5.5) : « Effort is now the control for how much the model thinks » ; « lowering effort reduces thinking, cost, and latency more reliably than prompting does » ; à `low`, « the model keeps its thinking short » ; « At a given level, Claude Opus 5.5 tends to think more per turn than Claude Opus 5 ». La documentation ne chiffre pas la baisse.
- **Hypothèse H1** : effort `low` ramène la réflexion du chapitre sous ≈ 50 % de la sortie. À mesurer sur une seule requête bornée (par exemple la seule partie cours + démonstration), avec un critère d'arrêt.
- **H2** : un `task_budget` (bêta `task-budgets-2026-03-13`, minimum 20 000 tokens, pris en charge par Opus 5.5) fait « rythmer » le modèle pour finir avant la limite au lieu d'être coupé. Compatibilité avec Message Batches à vérifier dans la documentation avant tout essai.
- Ces essais demandent une approbation de budget séparée.

## 3. QA

| Chapitre | Tier 1 (déterministe) | Corrections | Criblage Haiku | Juge Sonnet | needs-human |
|---|---|---|---|---|---|
| `math-3e-pythagore` (lot 1, écrit à la main) | validate-chapter OK (20 exercices, 3 jeux, 8 004 tirages) | 0 | NEEDS_REVIEW, 5 constats | NEEDS_REVIEW, **3 MAJEUR + 1 MINEUR** confirmés | oui (non corrigés, décision) |
| `pc-4e-electricite` (lot 2, pipeline) | validate-chapter OK après correction (36 exercices, niveaux 6/8/8/9/5, 3 jeux, 12 511 tirages, unités et sigFigs) | **1 tour** (0,095 $) | NEEDS_REVIEW, 9 constats | NEEDS_REVIEW, **5 MAJEUR + 5 MINEUR** | oui |
| `math-1re-spe-second-degre` (lot 3) | non évaluable (tronqué) | 0 | — | — | oui |

Taux : tier 1 **2/2** chapitres utilisables (dont 1 après un tour de correction) ; juge LLM **0/2 PASS** ; needs-human **3/3**. Le juge rejette une partie des constats du criblage (ex. `el4-19`, `el4-30`) : le criblage Haiku seul n'est pas fiable, le juge Sonnet est nécessaire.

## 4. Dossiers Haiku / Sonnet (lot 2, mêmes entrées) : comparaison par le contenu
Grille commune, relecture indépendante (agent Sonnet, lecture seule) :

| Critère | Haiku (0,0021 $) | Sonnet (0,0297 $) |
|---|---|---|
| Exactitude physique | moyen (branchement du multimètre flou) | bon (exemple chiffré avec chiffres significatifs, sécurité plus complète) |
| Périmètre | bon | bon, plus explicite (pas de P = U×I ni de kWh) |
| Utilité pour le chapitre | moyen (progression générique, 5 erreurs typiques) | bon (protocole, 10 erreurs typiques avec raisonnement) |
| Sources et prudence | moyen (pas de citation du BO) | bon (cite le BO, signale ce qui n'y figure pas mot pour mot) |
| Langue | bon | bon |

Aucune erreur factuelle grave dans l'un ou l'autre. Sonnet est meilleur sur la substance pour un surcoût absolu de ≈ 0,03 $ par chapitre (≈ 3 $ sur 105 chapitres). **Proposition : dossier Sonnet par défaut en production** (moins de relecture des citations), Haiku seulement sous contrainte de budget. Le chapitre PC a été généré à partir du dossier Haiku : l'effet du dossier sur la qualité du chapitre n'est pas mesuré.

## 5. Couverture objectifs et taxonomie
- PC 4e : **6/6 objectifs de la fiche** couverts (P4-E-01…03, P3-E-07, P3-E-10 exigibles ; P4-E-04 en approfondissement, `required: false`).
- Pythagore : taxonomie verrouillée (11 types), **10/11 types** couverts (PY-T11 : 0 exercice) et 4 manques de variantes relevés dans la taxonomie elle-même.
- **Pas de taxonomie** pour PC 4e ni pour 1re Second degré : la QA tier 2 « couverture de la taxonomie » n'est ni mesurable ni implémentée (`validate-chapter` ne lit pas la taxonomie ; aucun exercice ne porte d'identifiant de type).
- Fiche 1re : sources déclarées `seedId: null` / `pending_verification`, alors que le collecteur a vérifié `bo-2026-14-pdf` ; le dossier reprend cet écart. À corriger avant toute nouvelle génération 1re.

## 6. Erreurs récurrentes
1. **Troncature par la réflexion** (3 sorties payées inutilisables, ≈ 1,19 $) : relecture G0, criblage PC, chapitre 1re. Seul remède sûr à ce jour : réflexion désactivée là où le modèle l'accepte (criblage Haiku : fait) et marge de `max_tokens`.
2. **Diagnostics équivalents en double** dans les exercices générés (py3-12, pct3-07/10/20, el4-08/16) : corrigé par `clean()` pour PC ; à traiter par une règle commune du moteur ou du prompt.
3. **PR vides du bot** ouvertes par publish-pr quand la collecte n'a rien produit (#10, #12) : **corrigé** dans cette PR (publish-pr exige une sortie utilisable).
4. **Affichage du plafond** « reste … / 10 USD » au lieu du plafond de `budget.json` : **corrigé** dans cette PR.
5. **Tests dépendants de l'état du dépôt** (`tests/pipeline-models.test.ts`) : corrigé sur la branche (fixture `PIPELINE_ROOT`).
6. **`verified` sans G2** : 114/114 objectifs PC et 246/255 de maths `verified: true` depuis l'inventaire initial ; le lot PC n'est pas passé en G2.
7. **Constats de juge récurrents** : distracteurs de QCM trop évidents, réponses numériques sans `sigFigs` pour des mesures, étapes répétitives (même valeur demandée plusieurs fois).

## 7. Réestimation du coût de production collège
Base mesurée : chaîne PC 4e (Sonnet), **0,50 $ par chapitre** = dossier Haiku 0,002 + chapitre 0,371 + 1 correction 0,095 + criblage 0,003 + juge 0,029. Max sans correction : chapitre Sonnet à `max_tokens` 96 000 (0,54 $) + dossier, criblage, juge ≈ **0,63 $**. Pire cas : + 2 corrections (0,17 $ chacune) et un nouvel envoi du criblage ≈ **0,97 $**. Dossier Sonnet : + 0,03 $ par chapitre (non compté ci-dessous).

| Niveau | Chapitres restants | Réaliste | Max sans correction | Pire cas | **Plafond proposé** |
|---|---|---|---|---|---|
| Maths 6e | 22 | 11,0 $ | 13,9 $ | 21,3 $ | **14 $** |
| Maths 5e | 18 | 9,0 $ | 11,3 $ | 17,5 $ | **12 $** |
| Maths 4e | 18 | 9,0 $ | 11,3 $ | 17,5 $ | **12 $** |
| Maths 3e | 12 | 6,0 $ | 7,6 $ | 11,6 $ | **8 $** |
| PC 6e | 8 | 4,0 $ | 5,0 $ | 7,8 $ | **5 $** |
| PC 5e | 9 | 4,5 $ | 5,7 $ | 8,7 $ | **6 $** |
| PC 4e | 8 | 4,0 $ | 5,0 $ | 7,8 $ | **5 $** |
| PC 3e | 10 | 5,0 $ | 6,3 $ | 9,7 $ | **7 $** |
| **Collège** | **105** | **≈ 52 $** | **≈ 66 $** | **≈ 102 $** | **≈ 69 $** |

Plafond proposé = « max sans correction » arrondi au dollar supérieur, **un niveau à la fois**, arrêt et rapport s'il serait dépassé (même mécanique que le pilote). L'estimation du 2026-11-15 (33 / 49 / 84 $) est relevée : chapitre réel plus long que Pythagore (61 800 contre 45 900 tokens de sortie) et un tour de correction réel. Hors champ : lycée (non inventorié), relectures humaines, propositions B/D.

### Lycée : proposition de conception (non codée)
Constat : un chapitre lycée complet en une requête Opus dépasse la sortie maximale (§ 2). Proposition :
- **Requête 1, Opus, périmètre réduit** : cours, démonstrations exigibles, méthodes, fiche de synthèse (≈ 12 000-15 000 tokens visibles).
- **Requête 2, Sonnet** : exercices et jeux, avec le cours de la requête 1 en entrée (sortie ≈ 30 000 tokens visibles ; 96 000 de `max_tokens` laissent la marge observée à 37 % de réflexion).
- **Cela modifie la décision D4** (« une requête de chapitre + corrections ciblées ») **pour le lycée seulement** ; le collège garde D4. Assemblage des deux sorties par le pipeline (bloc META déjà injecté par le pipeline).
- Coût et faisabilité à mesurer sur un chapitre (avec H1/H2 du § 2), après approbation.

## 8. Avant la production (liste à valider)
1. Budget de production par niveau (§ 7) : décision du porteur de projet.
2. `max_tokens` 96 000 par défaut pour le chapitre Sonnet (le chapitre PC a utilisé 96,5 % de 64 000).
3. Dossier Sonnet par défaut (§ 4).
4. **Une seule PR par chapitre**, en fin de chaîne (dossier → chapitre → corrections → criblage → juge), au lieu d'une PR par run ; ce correctif publish-pr (sortie utilisable exigée) en est la première étape.
5. QA tier 2 contre la taxonomie verrouillée : taxonomie par chapitre et identifiant de type par exercice ; à défaut, la couverture reste déclarative.
6. G2 : porte G2 dans `run.ts` (refus en pilot/production, avertissement en dry-run), `verificationMethod` « lecture-initiale » / « g2 » (P4-E-04 → `verified: false`), comptes séparés dans la matrice.
7. Corrections ciblées des chapitres pilotes : Pythagore (3 MAJEUR + 1 MINEUR), PC 4e (5 MAJEUR + 5 MINEUR).
8. Règle commune contre les diagnostics équivalents en double.
9. Essais isolés et approuvés séparément : B (`kit.ts`), D (effort `low` sur le chapitre Sonnet), H1/H2 (Opus lycée), conception lycée en deux requêtes.
10. Fiche 1re : sources alignées sur le collecteur (`bo-2026-14-pdf`).
11. Rapport du juge nommé par run (ne plus écraser `*-QA-api.md`).

## 9. Essai H1 (2026-11-18) : réflexion d'Opus 5.5 selon l'effort
Décision du porteur de projet du 2026-11-18 : 2 requêtes Opus 5.5, même prompt (rédiger la seule démonstration exigible M1S-SD-05, « Résolution de l'équation du second degré », à partir de la section 4 du dossier 1re), effort `low` puis `medium`, `max_tokens` 13 500, maximum 0,29 $. Garde-fou de troncature appliqué sans exemption (estimation propre : 2 500 visibles, 76 % de réflexion → besoin 11 459).
- Dry-run sur `main` avec le registre réel (run #50) : 0,284 $ au maximum ; cumul 2,359 $ ≤ 2,892 $ ; aucun blocage → envoi au run #51.
- Batches : `h1-low` = `msgbatch_01CQ7osNq7PLT9SugDEsiTWw` (collecté au run #52), `h1-medium` = `msgbatch_01QgBnhrCovwwvn2NpDpk58u` (run #53). Textes : artefacts des runs #52 et #53 (`pipeline-output/h1/`), non committés.

| Requête | Entrée | Sortie | dont réflexion | **Part de réflexion** | Visible | `stop_reason` | Coût réel |
|---|---|---|---|---|---|---|---|
| `h1-low` | 3 479 | 2 463 | 337 | **13,7 %** | 2 126 | `end_turn` | 0,032 $ |
| `h1-medium` | 3 479 | 3 039 | 708 | **23,3 %** | 2 331 | `end_turn` | 0,037 $ |
| **Total** | | | | | | | **0,069 $** (estimation max 0,284 $) |

Relecture du contenu (Claude Code, les deux textes lus en entier) :
- **Démonstration complète dans les deux cas** : hypothèses (a ≠ 0, donc 4a² > 0), factorisation par a et complétion du carré, forme canonique, équivalence (E) ⇔ (x + b/2a)² = Δ/4a², puis **les trois cas** Δ < 0 (carré positif ≠ négatif → aucune solution), Δ = 0 (solution unique −b/2a), Δ > 0 (k = √Δ/2|a|, X² = k² ⇔ (X − k)(X + k) = 0, passage de |a| à a justifié, deux solutions distinctes car leur différence vaut √Δ/a ≠ 0), chacun avec sa conclusion. Aucune erreur mathématique relevée.
- **Tutoiement** : présent et cohérent (« Tu peux donc diviser par a », « Développe… », « Tu en déduis », « Tu distingues ») ; aucun vouvoiement.
- Différence `medium` / `low` : `medium` justifie explicitement que toutes les transformations sont des équivalences ; contenu par ailleurs équivalent.

**Conclusion : H1 atteinte.** À effort `low`, la réflexion représente 13,7 % de la sortie (< 50 %) et la démonstration est complète ; même à `medium`, 23,3 %. Le taux de 76 % du chapitre 1re (lot 3) tient donc surtout à l'**ampleur de la requête** (chapitre entier), non à l'effort seul. Conséquences proposées (non codées) :
- La conception lycée en deux requêtes (§ 7) est viable : une requête Opus « cours + démonstrations » (≈ 12 000-15 000 tokens visibles) tiendrait en `max_tokens` ≈ 32 000 même à 50 % de réflexion ; effort `low` suffit pour la démonstration mesurée ici.
- Les mesures du garde-fou de troncature pour Opus sont à séparer par taille de requête (76 % = chapitre entier ; 14-23 % = démonstration seule).
- Essai D (baisse d'effort ou de réflexion sur le chapitre Sonnet) : à proposer maintenant que H1 est connu.

Dépense cumulée après H1 : **2,428 $** (aucune réservation ouverte) ; reste 0,464 $ sous le plafond 2,892 $.
