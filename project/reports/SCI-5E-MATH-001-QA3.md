# SCI-5E-MATH-001 — QA3 Exercices et réponses

_Rapport de l'agent QA3 (indépendant), consigné par l'orchestrateur. Tests automatisés : `tests/qa3-relatifs.test.ts` (65 tests)._

**Verdict : NEEDS REVIEW** — 36 clés justes, recalculées depuis l'énoncé affiché (0 erreur sur 500 tirages par exercice variable). Résultat réel avant correction : 59 réussis, 6 échecs `[DÉFAUT]` attendus.

| # | Sévérité | Constat | Correctif |
|---|---|---|---|
| D1 | moyenne | `parseNumber` refuse « (−3) » / « (-3) », écriture enseignée | retirer une paire de parenthèses extérieure |
| D2 | faible | rel5-19 : colonnes en double (8/500) | tirage sans doublon |
| D3 | moyenne | rel5-24 : distracteur équivalent quand c = d (59/500) | imposer c ≠ d |
| D4 | faible | diagnostics égaux à la bonne réponse (rel5-20 si a = b, rel5-27 si montée = descente ; 30 cas) | filtrer ; éviter a = b |
| D5 | faible | rel5-16 sans positif (64/500) alors que l'indice en annonce un | toujours garder un positif |
| D6 | faible | rel5-33 déjà dans le bon ordre (16/500) | remélanger |

Points à valider : égalités « = » de rel5-12 (~20 %), réponses nulles de rel5-18/22/28, bonne réponse toujours en tête dans les QCM statiques rel5-01 et rel5-32.
