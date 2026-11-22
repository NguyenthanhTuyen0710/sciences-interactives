<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-pythagore

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | PASS |
| language | PASS |

## Constats
1. **MAJEUR** · exercises · `py3-19` — Les questions 2 et 3 donnent toutes deux 676 ; la question 3 est redondante, et la question 4 suppose la comparaison. Le calcul de 24²+10² est correct mais la structure est confuse.
   - Correction proposée : Reformuler les questions 2 et 3 en « Calcule BC² + CD² » puis « Calcule BD² et compare », ou fusionner en un tableau à deux lignes.
2. **MINEUR** · exercises · `py3-18` — Le tirage a=3, c=5 donne AC=4, entier, donc exclu. Pour a=3, c=6, AC=√27≈5,196 : périmètre 14,196≈14,2 et aire 7,794≈7,8, sans ambiguïté. Le constat de screening est rejeté, mais les nearHalf sont mal testés (x*10 % 1 plutôt que x*100).
   - Correction proposée : Garder le code, ou corriger nearHalf pour tester le chiffre suivant de l'arrondi.
3. **MINEUR** · accuracy — La réciproque est énoncée « Si BC²=AB²+AC² » sans préciser que [BC] est le plus grand côté, alors que le sommet A est nommé dans la conclusion.
   - Correction proposée : La formulation reste exacte ; ajouter éventuellement « le triangle ABC est rectangle en A » comme déjà indiqué, aucune correction requise.
4. **MINEUR** · exercises · `py3-03` — Exercice classé niveau 3 alors qu'il s'agit d'un vrai-faux de cours (niveau 1 ou 2), placé parmi les exercices de découverte.
   - Correction proposée : Passer l'exercice en niveau 2 et le déplacer, ou le laisser en 3 en ajoutant un item de justification.

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
   "verdict": "NEEDS_REVIEW"
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
   "verdict": "PASS"
  }
 ],
 "findings": [
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-19",
   "issue": "Les questions 2 et 3 donnent toutes deux 676 ; la question 3 est redondante, et la question 4 suppose la comparaison. Le calcul de 24²+10² est correct mais la structure est confuse.",
   "fix": "Reformuler les questions 2 et 3 en « Calcule BC² + CD² » puis « Calcule BD² et compare », ou fusionner en un tableau à deux lignes."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-18",
   "issue": "Le tirage a=3, c=5 donne AC=4, entier, donc exclu. Pour a=3, c=6, AC=√27≈5,196 : périmètre 14,196≈14,2 et aire 7,794≈7,8, sans ambiguïté. Le constat de screening est rejeté, mais les nearHalf sont mal testés (x*10 % 1 plutôt que x*100).",
   "fix": "Garder le code, ou corriger nearHalf pour tester le chiffre suivant de l'arrondi."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "La réciproque est énoncée « Si BC²=AB²+AC² » sans préciser que [BC] est le plus grand côté, alors que le sommet A est nommé dans la conclusion.",
   "fix": "La formulation reste exacte ; ajouter éventuellement « le triangle ABC est rectangle en A » comme déjà indiqué, aucune correction requise."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-03",
   "issue": "Exercice classé niveau 3 alors qu'il s'agit d'un vrai-faux de cours (niveau 1 ou 2), placé parmi les exercices de découverte.",
   "fix": "Passer l'exercice en niveau 2 et le déplacer, ou le laisser en 3 en ajoutant un item de justification."
  }
 ]
}
```
</details>
