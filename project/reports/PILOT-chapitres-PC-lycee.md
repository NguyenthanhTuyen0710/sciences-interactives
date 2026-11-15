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

Non vérifié : liste des automatismes évaluables de l'épreuve anticipée pour la session 2028 (texte de 2025 lu en résumé seulement).

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

## 4. Plan de l'étape 9 (pilote réel, non lancé — approbation séparée)
- Pythagore : relecture (criblage Haiku + juge Sonnet), dépense maximale ≈ 0,126 $ (dry-run du 2026-11-15) ; remplace l'estimation de 0,145 $ (relecture Sonnet unique).
- **Dossier : comparaison Haiku / Sonnet sur un même chapitre** (le chapitre PC retenu) : deux soumissions du dossier, `--dossier-model haiku` puis `--dossier-model sonnet`, mêmes entrées ; comparer le taux de réussite à la relecture humaine du dossier (sources, objectifs, erreurs typiques, progression), puis la validation du chapitre généré à partir de chacun, et le coût réel par modèle (registre). Le dossier retenu alimente seul la génération du chapitre.
- Préalables : Gate 1 validé pour le chapitre choisi, M3 (PC) et, pour le lycée, extension du schéma des chapitres.
