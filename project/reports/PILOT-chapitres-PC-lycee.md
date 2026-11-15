# Pilote — chapitres PC et lycée, plan M3 (2026-11-15, aucun appel API)

## 1. Physique-chimie : électricité cycle 4 (tension, intensité, loi d'Ohm)
Texte lu : programme du cycle 4 (2020), Éduscol, PDF sha256 `de42e981…` (= enregistrement `c4-programme-2020-eduscol-pdf`), p. 103 :
« Exploiter les lois de l’électricité. – Dipôles en série, dipôles en dérivation. – L’intensité du courant électrique est la même en tout point d’un circuit qui ne compte que des dipôles en série. – Loi d’additivité des tensions […] – Loi d’additivité des intensités […] – Relation tension-courant : loi d’Ohm. – Loi d’unicité des tensions. » ; repères : « En classes de 4e et de 3e, les différentes lois de l'électricité peuvent être abordées sans qu'un ordre précis ne s'impose […] Les aspects énergétiques peuvent être réservés à la classe de 3e. »

| Option | Arbre du site | Inventaire | Remarque |
|---|---|---|---|
| **A. 4e `pc-4e-electricite` (recommandée)** | `p4-electricite` existe (notions « Lois des circuits », « Loi d'Ohm », générateur `p4LoiOhm`) | P4-E-01…04 exigibles ; P3-E-07 (loi d'Ohm) rangé en 3e par l'inventaire | ordre libre 4e/3e (p. 103) : la loi d'Ohm peut être exigible en 4e ; énergie électrique (P3-E-08/09) laissée en 3e |
| B. 3e (Ohm + rappel des lois) | pas de chapitre d'arbre dédié | P3-E-07, P3-E-10 exigibles ; P4-E-01…04 en consolidation | proche du modèle Pythagore ; arbre à compléter |

**Décision du porteur de projet (2026-11-15) : option A.** Classement G1 **validé** pour P4-E-01…04, P3-E-07, P3-E-10 (compétences PC p. 97-98) :
- P4-E-01…03 : exigibles en 4e, consolidation en 3e ;
- P3-E-07 (loi d'Ohm) et P3-E-10 (sécurité) : exigibles dès le chapitre 4e (ordre libre, p. 103), et encore en 3e s'ils n'ont pas été traités ;
- **P4-E-04** (« influence d'une résistance ») : rattaché à « Exploiter les lois de l'électricité », niveau **approfondissement**, `required: false` (non compté comme objectif obligatoire), source notée « aide Éduscol 2016, document non prescriptif, pas le BO ».

## 2. Lycée : comparaison (programmes 2026 lus dans le BO n° 14 du 2-4-2026, PDF sha256 `34875c42…`)
Constat préalable : **les programmes 2019 de 2nde et de 1re sont remplacés à la rentrée 2026-2027** (arrêtés du 26-2-2026, NOR MENE2602914A et MENE2602917A, article 2). La matrice de couverture indiquait encore « pending_verification ».

| Critère | 2nde « Fonctions » (MENE2602914A, p. 342-343) | **1re spécialité « Second degré » (MENE2602917A, p. 359-360)** |
|---|---|---|
| Place | partie « Fonctions » : représentations, signe, tableaux de signes, variations, extrémums, fonctions de référence (valeur absolue, carré, inverse, racine, cube) | partie « Algèbre » : forme factorisée, canonique, discriminant, factorisation, signe |
| Exigences | capacités nombreuses et transversales ; démonstrations : variations affines, carré, inverse, position de y = x et y = x² | 4 capacités attendues ; **démonstration : résolution de l'équation du second degré** ; forme canonique « dans des cas simples » (le cas général « n'est pas un attendu ») |
| Examen | aucun examen en fin de 2nde | **épreuve anticipée de mathématiques** fin de 1re (NS MENE2622640N, BO spécial n° 4 du 17-9-2026, PDF sha256 `63e1f231…`) : 2 h, **sans calculatrice**, automatismes 6 pts + 2-3 exercices 14 pts ; session 2028 pour les élèves de 2026-2027 |
| Taille | grande (plusieurs chapitres d'un manuel) | un chapitre borné |
| Pilote | teste l'étendue | teste démonstration lycée (palier Opus), examen proche, prérequis de 2nde en consolidation |

**Proposition : 1re spécialité « Équations, fonctions polynômes du second degré ».** Raisons : chapitre borné, évalué à l'épreuve anticipée dès la session 2028, comporte une démonstration exigible (cas d'usage du palier Opus), et consolide la 2nde (fonction carré, identités remarquables). Inventaire G1 relevé pour ce seul chapitre (`math-1re-spe-second-degre`, M1S-SD-01…06, dont SD-06 en approfondissement), statut « proposé », `verified: false` : lecture manuelle du BO, **hors collecteur** (à enregistrer par le collecteur après approbation G1 du document).

**Décision du porteur de projet (2026-11-15) : 1re spécialité « Second degré », sous condition de périmètre d'examen. Vérification faite — condition remplie :**
- NS MENE2622640N (BO spécial n° 4 du 17-9-2026, **p. 44**, texte entier de la note sur cette page) : « Cette épreuve comprend trois sujets différents, chacun correspondant à un programme de mathématiques de première […]. Le candidat compose sur le sujet correspondant au programme qu'il a préparé : — enseignement de spécialité de mathématiques de la voie générale ; […] ». Objectif : « vérifier la maîtrise des compétences fondamentales attendues dans les programmes de mathématiques de première du lycée, ainsi que des automatismes ». La note abroge celle du 10-6-2025 (MENE2515469N).
- Le second degré fait partie du programme de spécialité de 1re (BO n° 14, MENE2602917A, p. 359-360), et sa liste d'automatismes contient « Déterminer le signe d'une expression du premier degré, d'une expression factorisée du second degré » (**p. 359**) : le chapitre relève donc des deux parties de l'épreuve (automatismes 6 pts, exercices 14 pts).
- Limite : la note ne fixe pas les chapitres tirés à chaque session ; « liée à l'examen » signifie « dans le programme évalué », non « présent à chaque sujet ». La partie « Examen » ci-dessus reste exacte.

**Vérification par le collecteur (2026-11-15)** : seed `bo-2026-14-pdf` (G1 approuvé par le porteur de projet), HTTP 200, SHA256 `34875c42…` identique à la copie lue, statut `verified` ; rapprochement `run.ts match math-1re-spe-second-degre` (`research/sources/verification/math-1re-spe-second-degre.json`) ; toutes les capacités sont en **p. 360** :

| Objectif | Collecteur | Texte du BO (p. 360) | Constat |
|---|---|---|---|
| SD-01 | verified (citation exacte) | « Étudier le signe d'une fonction polynôme du second degré donnée sous forme factorisée. » | conforme ; capacité attendue → exigible |
| SD-02 | verified (citation exacte) | « Déterminer les fonctions polynômes du second degré s'annulant en deux nombres réels distincts. » | conforme ; exigible |
| SD-03 | à relire (100 % des mots) | « Factoriser …, en diversifiant les stratégies : racine évidente, détection des racines par leur somme et leur produit, identité remarquable, application des formules générales. » | paraphrase fidèle ; exigible |
| SD-04 | à relire (92 %) | « Choisir une forme adaptée (développée réduite, canonique, factorisée) d'une fonction polynôme du second degré dans le cadre de la résolution d'un problème (équation, inéquation, optimisation, variations). » | paraphrase fidèle (« d'une fonction polynôme du second degré » omis) ; exigible |
| SD-05 | à relire (80 %) | « Démonstration — Résolution de l'équation du second degré. » | conforme ; démonstration exigible |
| SD-06 | à relire (54 %) | « Approfondissements possibles : Factorisation d'un polynôme du troisième degré admettant une racine et résolution de l'équation associée. — Factorisation de xⁿ − 1 par x − 1, de xⁿ − aⁿ par x − a. — Déterminer deux nombres réels connaissant leur somme s et leur produit p comme racines de la fonction polynôme x ↦ x² − sx + p. » | **écart** : niveau conforme, mais 2 approfondissements sur 3 (factorisation de xⁿ − aⁿ omise) et « résolution de l'équation associée » omise ; non corrigé (décision attendue) |

## 3. M3 — prise en charge de la physique-chimie (étape A) et du lycée (étape B) : faites
Principe : extension par paramètre de matière, sans nouveau fichier de configuration ni nouveau pipeline.

| Fichier | Modification |
|---|---|
| `pipeline/run.ts` | retirer le refus « mathématiques seulement » ; `objectives()` lit `research/curriculum/<matière>/curriculum-<math|pc>.json` ; manifest exigé seulement s'il existe pour la matière ; Gate 1 inchangé (vaut aussi pour PC) |
| `pipeline/prompts/system.md`, `dossier.md`, `chapter.md`, `review.md` | bloc conditionnel PC : unités SI, chiffres significatifs (`sigFigs` du moteur), schémas normalisés, sécurité ; vocabulaire « grandeur, mesure, incertitude » ; relecture « exactitude physique » |
| `pipeline/chapters/<pc-…>.json` | fiche du chapitre pilote (données, pas configuration) |
| `src/lib/content/curriculum.ts` | aucune modification si l'option A (`p4-electricite`) est retenue |
| `scripts/validate-chapter.ts` | contrôle PC : toute réponse numérique a une unité (`suffix` ou `unit`) ; cohérence `sigFigs` |
| `tests/` | dry-run de la fiche PC ; contrôles d'unités |
| `.github/workflows/pr-checks.yml` | dry-run PC à côté du dry-run Pythagore |

**Étape A : faite** (2026-11-15) — `run.ts` (matière, inventaire, manifest), blocs `{{#pc}}` des 4 prompts (prompts de mathématiques inchangés octet pour octet), `unitIssues` dans `validate-chapter`, fiche `pc-4e-electricite.json`, tests, dry-run PC dans `pr-checks.yml`.

### Étape B (lycée) — faite le 2026-11-15 (commit « M3 étape B »), d'après la proposition ci-dessous
Écarts : aucun titre « Type … » n'était contrôlé par `doneIssues` (consigne portée par le bloc `{{#lycee}}` du prompt) ; `master-curriculum.json` ne contenait aucune donnée propre (comparaison champ à champ : 0 champ absent des sources, 1 valeur périmée), il est désormais régénéré à chaque `npm run dashboard`.
Constat : le moteur (`LevelId` de `src/lib/engine/types.ts`) et l'arborescence du site (`src/lib/content/curriculum.ts`, niveaux 2nde/1re/Tle, routes `[matiere]/[niveau]`) connaissent déjà le lycée ; seuls le contrat des chapitres complets, le pipeline et la matrice sont limités au collège.

| Fichier | Modification | Pourquoi |
|---|---|---|
| `src/lib/chapters/schema.ts` | `GRADES` += `2nde`, `1re`, `Tle` ; motif `id` : `(math\|pc)-(6e\|5e\|4e\|3e\|2nde\|1re\|tle)-…` ; motif `taskId` : `SCI-(6E\|…\|3E\|2NDE\|1RE\|TLE\|DNB\|EAM)-(MATH\|PC)-NNN` ; champ facultatif `parcours` (`tronc-commun`, `specialite`, `maths-complementaires`, `maths-expertes`), exigé si `grade` est lycée | un chapitre 1re spé doit passer `ChapterSchema` ; distinguer spécialité et tronc commun |
| `src/lib/chapters/schema.ts` (`doneIssues`) | niveau 5 : titre « Type Brevet — » au collège, « Type épreuve anticipée — » en 1re, « Type bac — » en Tle | évaluation finale propre au lycée |
| `src/lib/content/curriculum.ts` | 1re : chapitre `m1-second-degre` « Second degré » (le chapitre `m1-fonctions` « Fonction exponentielle et second degré » devient « Fonction exponentielle »), conforme au découpage du programme 2026 | `treeChapterId` de la fiche lycée |
| `pipeline/run.ts` | manifest exigé pour les mathématiques **du collège** seulement (aucun nouveau fichier manifest) ; parcours de la fiche contrôlé contre `track` de l'inventaire | pas de nouveau fichier de configuration |
| `pipeline/prompts/system.md`, `chapter.md`, `review.md` | blocs `{{#lycee}}` (âge, notation lycée, démonstrations exigibles rédigées, épreuve anticipée sans calculatrice) — même mécanisme que `{{#pc}}`, clé déduite du niveau | prompts collège inchangés |
| `pipeline/models.ts` | palier Opus pour l'étape chapitre **seulement si** la fiche marque une démonstration exigible (`MODEL_POLICY` le prévoit déjà) ; sinon Sonnet | coût (≈ +0,6 $ max par chapitre en Opus) |
| `pipeline/chapters/math-1re-spe-second-degre.json` | fiche du chapitre (données) | pilote |
| `scripts/dashboard.ts` / `master-curriculum.json` | `npm run dashboard -- sync` : **la matrice lit `master-curriculum.json`, non resynchronisé depuis les classements G1** (le chapitre 1re et les classements récents n'y figurent pas) ; ajoute aussi la tâche `SCI-1RE-MATH-001` au registre des tâches | matrice et `--next` à jour |
| `tests/` | schéma (id/taskId/grade lycée, parcours), titre de niveau 5, dry-run de la fiche 1re | non-régression |

Hors étape B : inventaire complet du lycée (autres chapitres), épreuves du bac, PC lycée.

## 4. Plan de l'étape 9 (pilote réel) — prêt sauf Gate 1 du lot 3 ; NON lancé, approbation séparée
Dépense comptée : 0,692 $ ; plafond 10 $ ; **reste 9,308 $**. Dry-runs du 2026-11-15 après M3 A+B, juge à préfixe court et propositions A+C (batch, sortie au `max_tokens`).

| Lot | Étapes (modèle) | Gate 1 | Dry-run | Max sans correction | Max pire cas | Réaliste |
|---|---|---|---|---|---|---|
| 1. Pythagore 3e — relecture | criblage Haiku 0,004 $ + juge Sonnet 0,071 $ | atteint | OK (empreintes inchangées) | 0,075 $ | 0,075 $ | ≈ 0,02 $ |
| 2. PC 4e électricité | dossier Haiku 0,003 $ **et** Sonnet 0,050 $ ; chapitre Sonnet 0,386 $ ; criblage 0,004 $ ; juge 0,077 $ ; correction 2 × 0,167 $ au pire | atteint (9 objectifs validés) | OK | 0,520 $ | 0,854 $ | ≈ 0,33 $ |
| 3. 1re spé Second degré | dossier Haiku 0,002 $ ; chapitre **Opus** 0,767 $ (démonstration exigible) ; criblage 0,004 $ ; juge 0,077 $ ; correction 2 × 0,167 $ au pire | **non atteint** : M1S-SD-01…06 « proposé » ; collecteur : écart sur SD-06 (§ 2) | OK (refus d'envoi réel tant que G1 manque) | 0,850 $ | 1,183 $ | ≈ 0,61 $ |
| **Total** | | | | **1,445 $** | **2,112 $** | **≈ 0,96 $** |

Après le pilote, au pire : 0,692 + 2,112 = **2,804 $ / 10 $**.

Ordre (décision du 2026-11-15) : lots 1 et 2 d'abord, sans attendre le lot 3 ; lot 3 dès que son Gate 1 est atteint. Aucun lot avant les chiffres 8c et « duyệt pilot ».

Points d'arrêt (un `pilot` puis un `collect` par étape ; relecture humaine entre chaque) :
1. Pythagore : criblage → juge → vérification humaine du rapport ; publication = décision séparée.
2. PC : dossier (`dossier_model` = haiku) puis dossier (`dossier_model` = sonnet), mêmes entrées, empreintes distinctes ; comparaison humaine sur une grille commune ; commit du dossier retenu seul (le chapitre réel est refusé sans dossier committé) → chapitre → validate-chapter (unités, sigFigs) → correction(s) → criblage → juge.
3. 1re : après validation G1 de M1S-SD-01…06 ; mêmes étapes, chapitre au palier Opus.

Préalables restants : 8c (chiffres de la Console) et `creditVerified: true` ; Gate 1 du lot 3 ; droit de création de PR des Actions effectif (Việc 1).

Après le pilote, **comparaison Opus / Sonnet de la démonstration** (M1S-SD-05) sur le même chapitre 1re : même requête, chapitre au palier Sonnet ; critères : rigueur et complétude de la démonstration, validate-chapter, relecture ; décide si le palier Opus est nécessaire pour l'ensemble des chapitres du lycée.

Après le pilote (non mesuré pendant le pilote, décision du 2026-11-15) : **essai D** sur un seul chapitre : étape chapitre en effort `low`, comparée à l'effort `medium` (tokens de réflexion, validate-chapter, tours de correction, relecture) ; B (`kit.ts`) réexaminé ; budget de production proposé **par niveau** à partir des coûts réels du pilote.

## 5. Analyse de la sortie du chapitre (Pythagore, sans appel API)
Mesures sur le fichier produit par le pipeline (commit `d4528b1`, 57 883 octets, 632 lignes) et le registre : sortie facturée 45 868 tokens (run #7). Rapport octets/token mesuré au run #12 (requête de 63 187 octets = 30 351 tokens) : 2,08. Le fichier ≈ 27 800 tokens ; **le reste, ≈ 18 000 tokens (≈ 39 % de la sortie), est de la réflexion** (effort medium, réflexion adaptative ; non mesurée directement à l'époque, `actual.tokens.thinking` l'enregistre désormais).

| Partie du fichier | Octets | % | dont texte (chaînes) |
|---|---|---|---|
| exercices (20) | 28 433 | 50 % | 62 % |
| cours | 11 315 | 20 % | 84 % |
| jeux (3) | 7 677 | 14 % | 65 % |
| en-tête, imports, helpers (`num`, `qcm`, `shuffledQcm`, `etapes`, `triple`, `NAMES`…) | 3 569 | 6 % | 21 % |
| métadonnées (objectifs, sources, statuts) | 2 617 | 5 % | ≈ 65 % |
| figures SVG et constantes rédigées | 2 901 | 5 % | 85 % |

Constats :
- Le chapitre est surtout du **texte pédagogique** (énoncés, corrections, indices, diagnostics, cours) : il ne se factorise pas sans perdre en qualité.
- Le **squelette répétitif** est déjà réduit par des helpers locaux (`ex(…)` ×20, `vary` ×16, `shuffledQcm`/`num`/`etapes` ×17) ; le code hors chaînes des exercices = 10 663 octets (19 % du fichier), dont 2 328 d'indentation.
- Ce qui est **réécrit à chaque chapitre** sans valeur ajoutée : les helpers génériques, les métadonnées entièrement déterminées par la fiche (objectifs, sources, statuts, version), la structure verbeuse des jeux (`{ q, answer, explanation }` ×24, `{ niveau, calc, correct, errors }`).

Propositions (non codées) et gain estimé par chapitre (sortie visible ≈ 27 800 tokens) :

| # | Proposition | Gain (octets) | Gain (tokens) | Risque |
|---|---|---|---|---|
| A | Métadonnées injectées par le pipeline après génération (objectifs, `sources` copiées de la fiche, statuts) : le modèle ne les écrit plus | ≈ 2 400 | ≈ 1 150 | nul ; supprime aussi le risque de source mal recopiée |
| B | Module de helpers partagé (`num`, `qcm`, `shuffledQcm`, `etapes`, `vf`, `ex`, diagnostics en tuples) utilisé par le chapitre d'exemple : le modèle les importe | ≈ 3 000 | ≈ 1 450 | faible ; **nouveau fichier** `src/lib/chapters/kit.ts` → votre accord requis |
| C | Constructeurs compacts des jeux (`flash([[q, réponse, explication], …])`, `memory`, `erreurs`) dans le même module | ≈ 1 500 | ≈ 700 | faible |
| | **A + B + C** | **≈ 6 900 (≈ 12 %)** | **≈ 3 300** | |
| D | Effort `low` (ou plafond de réflexion) pour l'étape chapitre | — | jusqu'à ≈ 9 000 (moitié de la réflexion) | **qualité** des générateurs : à mesurer au pilote avant décision |

Effet en coût (Sonnet batch, sortie 5 $/MTok) : A+B+C ≈ 3 300 tokens ≈ **0,017 $ par chapitre** (≈ 6 % du coût réel de l'étape, 0,29 $), soit ≈ 1,8 $ sur les 106 chapitres restants ; D ≈ 0,045 $ par chapitre (≈ 4,8 $ sur 106). Le gain principal de A+B+C n'est pas le coût mais la fiabilité (moins de code réécrit, moins d'erreurs à corriger, moins de tours de correction à 0,166 $). Domain helpers (figures de géométrie, triplets, rédaction type) : à créer seulement quand un 2e chapitre du même domaine en a besoin (YAGNI). Reformater après génération (sortie sans indentation) : aucun formateur installé, gain ≈ 600 tokens : écarté.

## 6. Estimation du coût de production du projet (sans appel API)
Base : matrice de couverture (116 chapitres d'inventaire au collège ; 7 couverts par des chapitres publiés, 3 par des brouillons). **106 chapitres à produire**, en supposant un chapitre de contenu par chapitre d'inventaire (borne haute : plusieurs chapitres d'inventaire peuvent partager un chapitre de contenu, comme Pythagore). Tarifs actuels, Message Batches, paliers de modèles du 2026-11-15, juge à préfixe court.
- **Réaliste** (0,31 $/chapitre) : tokens réels de Pythagore (chapitre : 61 400 en entrée, 45 900 en sortie ; dossier, criblage et juge mesurés ou estimés de même), aucune correction.
- **Max sans correction** (0,46 $ maths, 0,47 $ PC) : sortie au `max_tokens` à chaque étape.
- **Pire cas** (0,79 $ maths, 0,80 $ PC) : en plus, deux tours de correction Sonnet.

| Niveau | Chapitres | Réaliste | Max sans correction | Pire cas |
|---|---|---|---|---|
| Maths 6e | 22 | 6,86 $ | 10,10 $ | 17,29 $ |
| Maths 5e | 18 | 5,62 $ | 8,26 $ | 14,15 $ |
| Maths 4e | 18 | 5,62 $ | 8,26 $ | 14,15 $ |
| Maths 3e | 12 | 3,74 $ | 5,51 $ | 9,43 $ |
| PC 6e | 8 | 2,50 $ | 3,74 $ | 6,41 $ |
| PC 5e | 9 | 2,81 $ | 4,21 $ | 7,21 $ |
| PC 4e | 9 | 2,81 $ | 4,21 $ | 7,21 $ |
| PC 3e | 10 | 3,12 $ | 4,68 $ | 8,01 $ |
| **Collège** | **106** | **≈ 33 $** | **≈ 49 $** | **≈ 84 $** |
| Brouillon existant hors pilote (`math-3e-puissances-calculs`, relecture seule) | 1 | 0,02 $ | 0,075 $ | 0,075 $ |
| Lycée connu (1re spé Second degré) | 1 | 0,31 $ | 0,46 $ | 0,79 $ (≈ 1,4 $ si chapitre au palier Opus) |

Lecture : un budget de production collège de **≈ 50 $** couvre le cas « max sans correction » ; **≈ 85 $** couvre le pire cas. Le reste du lycée (2nde, 1re, Tle, maths et PC) n'est pas inventorié : non chiffrable sans inventaire ; à titre indicatif, au même coût unitaire, chaque tranche de 10 chapitres = 3,1 à 7,9 $ (davantage si les démonstrations passent par Opus). Non compris : relectures humaines, régénérations complètes, propositions A-D de la section 5 (≈ −2 à −7 $ sur 106 chapitres), et le Pythagore du pilote (section 4). À recalibrer avec les tokens réels du pilote (chapitre PC).
