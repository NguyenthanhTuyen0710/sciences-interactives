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

## 3. M3 — prise en charge de la physique-chimie par le pipeline (proposition, non codée)
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

Prérequis lycée (séparé de M3) : `src/lib/chapters/schema.ts` (GRADES, motifs `id` et `taskId` : 2nde, 1re, Tle, parcours), arborescence et routes du site, contrôle de cohérence de `run.ts` (manifest par niveau). À chiffrer après choix du chapitre lycée.

## 4. Plan de l'étape 9 (pilote réel) — NON lancé, approbation séparée
Dépense déjà comptée : 0,692 $ ; plafond 10 $ ; **reste 9,308 $**. Montants : dépense maximale des dry-runs du 2026-11-15 (batch, sortie au `max_tokens`, juge approfondi à préfixe court) ; « réaliste » : tokens réels de Pythagore (runs #5-#12) aux tarifs actuels.

| # | Lot | Étapes (modèle) | Max sans correction | Max pire cas | Réaliste |
|---|---|---|---|---|---|
| 1 | Pythagore 3e : relecture | criblage (Haiku) + juge approfondi (Sonnet) | 0,075 $ | 0,075 $ | ≈ 0,02 $ |
| 2 | PC 4e électricité (`pc-4e-electricite`) | dossier Haiku **et** dossier Sonnet (comparaison) 0,052 $ ; chapitre 0,385 $ ; criblage 0,004 $ ; juge 0,077 $ | 0,518 $ | 0,851 $ (2 tours de correction Sonnet) | ≈ 0,36 $ |
| 3 | 1re spé « Second degré » (après M3 étape B) | même chaîne que les mathématiques | 0,46 $ | 0,79 $ (+ jusqu'à ≈ 0,6 $ si la démonstration passe au palier Opus) | ≈ 0,31 $ |
| | **Total** | | **≈ 1,05 $** | **≈ 1,72 $** (≈ 2,3 $ avec Opus) | **≈ 0,69 $** |

Après le pilote, dans le pire cas : 0,692 + 2,3 ≈ **3,0 $ / 10 $**.

Ordre et points d'arrêt (un `pilot` puis un `collect` par étape, relecture humaine entre chaque) :
1. Pythagore : criblage → collect → juge → collect → vérification humaine du rapport ; publication = décision séparée.
2. PC : dossier Haiku → collect ; dossier Sonnet → collect ; comparaison humaine (sources, périmètre, protocoles et unités, erreurs typiques, progression) avec une grille commune ; le dossier retenu seul alimente le chapitre → chapitre → validate-chapter (unités, sigFigs) → correction(s) → criblage → juge.
3. Lycée : seulement après M3 étape B (schéma, niveaux, arborescence) et Gate 1 de M1S-SD-01…06.

Préalables (bloquants) :
- 8c : chiffres de la Console comparés au registre (0,692 $) ; `creditVerified: true` posé par le porteur de projet.
- Gate 1 PC : P5-E-04…06 (consolidation 5e) classés « proposé » ; à valider, ou consolidation retirée de la fiche.
- **Comparaison des dossiers non réalisable en l'état** : l'empreinte anti-doublon du dossier (`hashOf(SYSTEM_LIGHT, dossierUser)`) n'inclut pas le modèle, donc la 2e soumission (Sonnet, mêmes entrées) serait refusée comme doublon ; et le workflow n'a pas d'entrée `dossier_model` / `force`. Correctif proposé (non codé) : ajouter le modèle à l'empreinte seulement si `--dossier-model` est donné (les empreintes existantes, dont le dossier Pythagore, restent identiques) ; deux entrées facultatives dans `generate-lessons.yml`.
- Droit « Allow GitHub Actions to create and approve pull requests » effectif (run #15 refusé), pour publier le résultat par PR.

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
