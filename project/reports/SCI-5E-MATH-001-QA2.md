# SCI-5E-MATH-001 — QA2 Exactitude mathématique

_Rapport de l'agent QA2 (indépendant), consigné par l'orchestrateur._

**Verdict : NEEDS REVIEW** — aucun résultat faux (calculs, clés, mini-quiz, SVG exacts) ; corrections de rédaction requises.

| # | Sévérité | Emplacement | Constat | Correction demandée |
|---|---|---|---|---|
| F1 | moyenne | `lesson.properties[1]`, `rel5-12.solution`, `workedExamples[0]` | « négatif < positif » contredit la convention du chapitre (0 positif et négatif) | préciser « strictement » |
| F2 | moyenne | `rel5-33` | justification de l'étape 4 discutable (regroupement implicite), ordre 2→3→1→4 aussi valable | réécrire l'étape 3 avec le regroupement explicite, phrase-pont en étape 1 |
| F3 | faible | `rel5-32` | −2,21, −2,25… vérifient aussi les indices | ajouter « un seul chiffre après la virgule » |
| F4 | faible | `rel5-17` | solution maladroite quand la somme vaut 0 (31/3000 graines) | cas `s === 0` |
| F5 | faible | `rel5-24` option 1 | diagnostic « changé le signe de chaque nombre » inexact | décrire l'inversion des deux soustractions |
| F6 | faible | `rel5-04` | diagnostic x+1 ne vise qu'un mode de comptage | ajouter x−1 / message neutre |
| F7 | faible | `revisionSheet.keyPoints[0]` | « idem pour négatif » vague | écrire explicitement |
| F8 | info | `rel5-22` | démarche peu « astucieuse » | retirer la paire d'opposés avant de sommer |
| F9 | info | introduction | Brahmagupta exact ; préciser l'antériorité chinoise | ajout facultatif |

Vérifications : définitions, propriétés, 5 explications, 5 exemples, 7 erreurs, 4 méthodes, résumé, fiche, mini-quiz (6/6), 9 exercices statiques, 25 générateurs (3 000 graines chacun : aucun NaN/undefined/artefact), carré magique (8 sommes nulles), symétries rel5-36, 12 items de la chasse aux erreurs, 6 paires du memory, thermomètre (liquide en y = Y(−4) = 156, recalculé et confirmé dans le DOM), illustrations (captures `/tmp/claude-0/qa2/`).

Limites : jeux non joués en navigateur (périmètre QA4), rendu KaTeX non contrôlé en détail, conformité programme et langue hors périmètre.
