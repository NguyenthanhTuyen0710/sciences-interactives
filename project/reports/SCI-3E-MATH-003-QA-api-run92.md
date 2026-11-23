<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-calcul-litteral

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | PASS |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | PASS |
| language | NEEDS_REVIEW |

## Constats
1. **MINEUR** · exercises · `cl3-37` — L'indice 2 est écrit avec la chaîne littérale « w » (« $x^{2}$ et $wx$ ») : l'élève voit une lettre « w » jamais définie au lieu de la largeur de la bande.
   - Correction proposée : Reformuler l'indice sans variable : « Les deux termes de l'aire, $x^{2}$ et la largeur de la bande fois $x$, ont $x$ en facteur commun. »
2. **MINEUR** · language · `cl3-jeu-erreurs` — Formulation « Il fallait diviser par 3 sans parenthèse » : tournure peu claire pour un élève de 3e.
   - Correction proposée : Reformuler en « Il fallait factoriser sans mettre les parenthèses ».

<details><summary>JSON validé</summary>

```json
{
 "verdict": "NEEDS_REVIEW",
 "criteria": [
  {
   "criterion": "curriculum",
   "verdict": "PASS"
  },
  {
   "criterion": "accuracy",
   "verdict": "PASS"
  },
  {
   "criterion": "exercises",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "games",
   "verdict": "PASS"
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
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-37",
   "issue": "L'indice 2 est écrit avec la chaîne littérale « w » (« $x^{2}$ et $wx$ ») : l'élève voit une lettre « w » jamais définie au lieu de la largeur de la bande.",
   "fix": "Reformuler l'indice sans variable : « Les deux termes de l'aire, $x^{2}$ et la largeur de la bande fois $x$, ont $x$ en facteur commun. »"
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
