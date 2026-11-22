<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-calcul-litteral

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | NEEDS_REVIEW |
| technical | PASS |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · curriculum · `cl3-28` — Exercice de niveau 4 sur la factorisation de (x+p)² − q² : l'identité est exigible, mais l'énoncé demande de ne pas développer le carré, ce qui reste hors des formes exigibles en 3e.
   - Correction proposée : Vérifier que la reconnaissance de a² − b² avec a = x + p reste dans le périmètre exigible.
2. **MAJEUR** · accuracy · `cl3-02` — Solution affichée : « L'opposé est −(…) » et « −(…) = −ax − b » sont correctes, mais la phrase de correction utilise lin(-a,-b) avec un coefficient négatif écrit « −(−a)x » à vérifier pour a = 1 (affichage « −x »).
   - Correction proposée : Vérifier l'affichage des coefficients ±1 dans poly/lin pour l'opposé.
3. **MAJEUR** · exercises · `cl3-14` — Calcul mental (x+d)(x−d) avec n ∈ {20..100} : pour d=3 et n=20, l'énoncé « 23 × 17 » est correct, mais la solution présente la valeur n*n sans preuve de niveau 2 ; à vérifier.
   - Correction proposée : Contrôler la calibration du niveau 2.
4. **MAJEUR** · exercises · `cl3-26` — Énoncé « S est un multiple de 4 » marqué faux ; la réponse proposée « Contre-exemple… 10 » est correcte mais l'exercice mélange deux questions dans un seul vrai-faux.
   - Correction proposée : Clarifier la consigne par affirmation.
5. **MINEUR** · games · `cl3-jeu-flash` — Item « Coefficient de x dans −(3x − 5) » : réponse « -3 » ; le signe attendu dépend du format de saisie.
   - Correction proposée : Préciser le format de réponse attendu.
6. **MINEUR** · language · `cl3-jeu-erreurs` — Formulation « Il fallait diviser par 3 sans parenthèse » : tournure peu claire pour un élève de 3e.
   - Correction proposée : Reformuler en « Il fallait factoriser sans mettre les parenthèses ».

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
   "verdict": "PASS"
  },
  {
   "criterion": "language",
   "verdict": "NEEDS_REVIEW"
  }
 ],
 "findings": [
  {
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "cl3-28",
   "issue": "Exercice de niveau 4 sur la factorisation de (x+p)² − q² : l'identité est exigible, mais l'énoncé demande de ne pas développer le carré, ce qui reste hors des formes exigibles en 3e.",
   "fix": "Vérifier que la reconnaissance de a² − b² avec a = x + p reste dans le périmètre exigible."
  },
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "cl3-02",
   "issue": "Solution affichée : « L'opposé est −(…) » et « −(…) = −ax − b » sont correctes, mais la phrase de correction utilise lin(-a,-b) avec un coefficient négatif écrit « −(−a)x » à vérifier pour a = 1 (affichage « −x »).",
   "fix": "Vérifier l'affichage des coefficients ±1 dans poly/lin pour l'opposé."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-14",
   "issue": "Calcul mental (x+d)(x−d) avec n ∈ {20..100} : pour d=3 et n=20, l'énoncé « 23 × 17 » est correct, mais la solution présente la valeur n*n sans preuve de niveau 2 ; à vérifier.",
   "fix": "Contrôler la calibration du niveau 2."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-26",
   "issue": "Énoncé « S est un multiple de 4 » marqué faux ; la réponse proposée « Contre-exemple… 10 » est correcte mais l'exercice mélange deux questions dans un seul vrai-faux.",
   "fix": "Clarifier la consigne par affirmation."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "cl3-jeu-flash",
   "issue": "Item « Coefficient de x dans −(3x − 5) » : réponse « -3 » ; le signe attendu dépend du format de saisie.",
   "fix": "Préciser le format de réponse attendu."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-jeu-erreurs",
   "issue": "Formulation « Il fallait diviser par 3 sans parenthèse » : tournure peu claire pour un élève de 3e.",
   "fix": "Reformuler en « Il fallait factoriser sans mettre les parenthèses »."
  }
 ]
}
```
</details>
