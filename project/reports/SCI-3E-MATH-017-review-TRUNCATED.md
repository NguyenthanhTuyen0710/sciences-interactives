<!-- TRUNCATED – không phải báo cáo QA hợp lệ / résultat inutilisable, pas un rapport QA valide. Étape review, stop_reason max_tokens, sortie tronquée (max_tokens atteint). Opération math-3e-pythagore-review-1794112382035, batch msgbatch_019EqHN5QVtiojtrfEh95YVT. -->

# Rapport de revue QA : `math-3e-pythagore` (SCI-3E-MATH-017)

## Verdicts

| Dimension | Verdict | Résumé |
|---|---|---|
| QA1 Programme | NEEDS REVIEW | Statut de la « contraposée » non établi ; référence BO n° 22 absente de `sources` ; couverture partielle de M3-AUTO-03 non signalée. |
| QA2 Exactitude | PASS | Définitions, exemples travaillés et figures vérifiés ; aucune erreur mathématique. |
| QA3 Exercices | NEEDS REVIEW | 20 exercices au lieu de 30 ; angle droit toujours au premier sommet ; calibrage faible des niveaux 4 et 5 ; indices et diagnostics à noms figés. |
| QA4 Jeux | PASS | Items exacts. Réserves mineures sur le calcul-flash (codage 1/0) et une ambiguïté de la chasse aux erreurs. |
| QA6 Langue | NEEDS REVIEW | Accords au genre de « hypoténuse » ; quelques formulations et notations à corriger. |

Exercices résolus de mon côté avant lecture de la clé : py3-01, 05, 06, 09, 11, 13, 16, 19, 20. Tous les résultats concordent, les données sont cohérentes et les triplets sont exacts. J'ai aussi vérifié la géométrie de `squaresSvg` : les trois carrés sont bien extérieurs, de côtés 60, 80 et 100, avec un angle droit en A.

## Constats

1. **Cohérence globale, MAJEUR : nombre d'exercices.**
   - Le chapitre compte 20 exercices pour une exigence de 30 minimum (règle 6).
   - La justification « Pilote API » n'est pas une justification pédagogique.
   - Correction : ajouter au moins 10 exercices avant publication, ou assumer explicitement que le chapitre reste en brouillon pilote.
   - Exercices à ajouter en priorité :
     - angle droit en B ou C ;
     - triangle à identif
