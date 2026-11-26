<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-thales-semblables

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | NEEDS_REVIEW |
| technical | NEEDS_REVIEW |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · exercises · `th3-17` — Exercice de consolidation 4e noté « niveau 3 » mais l'énoncé donne AM = AB… et l'égalité de la question 3 suppose AM×AC = AN×AB sans vérifier l'ordre des points, la figure étant emboîtée.
   - Correction proposée : Vérifier que la configuration emboîtée et la réciproque sont cohérentes avec l'ordre des points, ou corriger la question 3.
2. **MAJEUR** · exercises · `th3-24` — La largeur BC est calculée par un rapport MN/BC impliquant des valeurs issues de ratioSet ; la solution affirme BC = b sans vérifier que la figure respecte l'ordre B-A-M et C-A-N.
   - Correction proposée : Contrôler la cohérence de la figure avec les longueurs tirées, ou reformuler l'énoncé.
3. **MINEUR** · exercises · `th3-08` — Le champ reasoning est défini par une fonction k0() déclarée après l'export, avec un texte qui n'est pas une phrase de raisonnement propre à l'exercice.
   - Correction proposée : Remplacer par une chaîne littérale spécifique à l'exercice.
4. **MINEUR** · games · `th3-jeu-flash` — Question « Triangle (4;6;8) agrandi avec k = 2 » : la réponse 16 est correcte mais l'item « Papillon AB=3, AM=9, AN=12 : AC = 4 » est attendu dans la rubrique longueurs alors que le calcul est un produit en croix inversé, pédagogiquement ambigu.
   - Correction proposée : Vérifier chaque item et clarifier l'inconnue dans l'énoncé.
5. **MINEUR** · language · `th3-16` — Formulation « on sait que AB mesure … cm » à la place de « AB = … » : phrasing répétitif et « Un élève pense » n'est pas en cause ici, mais la consigne de la question 3 mélange « Quelle conclusion est correcte ? » sans justification demandée.
   - Correction proposée : Harmoniser les formulations des consignes de questions à choix.

<details><summary>JSON validé</summary>

```json
{
 "verdict": "NEEDS_REVIEW",
 "criteria": [
  {
   "criterion": "curriculum",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "accuracy",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "exercises",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "games",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "technical",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "language",
   "verdict": "NEEDS_REVIEW"
  }
 ],
 "findings": [
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "th3-17",
   "issue": "Exercice de consolidation 4e noté « niveau 3 » mais l'énoncé donne AM = AB… et l'égalité de la question 3 suppose AM×AC = AN×AB sans vérifier l'ordre des points, la figure étant emboîtée.",
   "fix": "Vérifier que la configuration emboîtée et la réciproque sont cohérentes avec l'ordre des points, ou corriger la question 3."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "th3-24",
   "issue": "La largeur BC est calculée par un rapport MN/BC impliquant des valeurs issues de ratioSet ; la solution affirme BC = b sans vérifier que la figure respecte l'ordre B-A-M et C-A-N.",
   "fix": "Contrôler la cohérence de la figure avec les longueurs tirées, ou reformuler l'énoncé."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "th3-08",
   "issue": "Le champ reasoning est défini par une fonction k0() déclarée après l'export, avec un texte qui n'est pas une phrase de raisonnement propre à l'exercice.",
   "fix": "Remplacer par une chaîne littérale spécifique à l'exercice."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "th3-jeu-flash",
   "issue": "Question « Triangle (4;6;8) agrandi avec k = 2 » : la réponse 16 est correcte mais l'item « Papillon AB=3, AM=9, AN=12 : AC = 4 » est attendu dans la rubrique longueurs alors que le calcul est un produit en croix inversé, pédagogiquement ambigu.",
   "fix": "Vérifier chaque item et clarifier l'inconnue dans l'énoncé."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "th3-16",
   "issue": "Formulation « on sait que AB mesure … cm » à la place de « AB = … » : phrasing répétitif et « Un élève pense » n'est pas en cause ici, mais la consigne de la question 3 mélange « Quelle conclusion est correcte ? » sans justification demandée.",
   "fix": "Harmoniser les formulations des consignes de questions à choix."
  }
 ]
}
```
</details>
