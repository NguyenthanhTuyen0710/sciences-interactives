<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-pythagore

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | NEEDS_REVIEW |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · curriculum · `py3-20` — Exercice de niveau 5 « Type Brevet » entièrement consacré à la contraposée (PY-EXT-01, approfondissement), alors que le niveau 5 sert d'évaluation finale du chapitre. La contraposée est évaluée comme exigible, alors que seul le prolongement est validé. Confirme le constat du screening.
   - Correction proposée : Retitrer « Prolongement — … » et sortir l'exercice du niveau 5 Brevet, ou le remplacer par un exercice sur la réciproque.
2. **MAJEUR** · curriculum · `py3-17` — La bonne réponse de la question 3 est la contraposée (« n'est pas rectangle ») dans la moitié des tirages, sans mention de prolongement ; elle est donc attendue comme exigible. Confirme le constat du screening.
   - Correction proposée : Ne faire varier que le cas rectangle, ou signaler « (prolongement) » dans l'énoncé quand la contraposée est attendue.
3. **MAJEUR** · curriculum — La source bo-2019-22-pdf figure dans sources avec verification « verified » alors qu'elle n'est pas dans officialSources ; la note de périmètre interdit de citer une autre source comme vérifiée. Confirme le constat du screening.
   - Correction proposée : Retirer l'entrée, ou la passer en non vérifiée avec accord explicite ; SRC_4E la cite aussi, à corriger en conséquence.
4. **MINEUR** · accuracy · `py3-03` — La solution de l'item 1 (« il faut que le triangle soit rectangle (ou que l'égalité soit vérifiée, pour la réciproque) ») mélange théorème et réciproque. Confirme le constat du screening.
   - Correction proposée : Reformuler : « Faux : le théorème ne s'applique qu'à un triangle rectangle ; la réciproque part de l'égalité. »
5. **MINEUR** · exercises · `py3-18` — Le périmètre et l'aire sont arrondis puis comparés avec tol 0,001 : un élève qui arrondit ses calculs intermédiaires (par exemple AC≈7,5) peut obtenir une réponse différente de la clé.
   - Correction proposée : Préciser dans l'énoncé « sans arrondir avant la fin », ou élargir la tolérance.
6. **MINEUR** · language — Espace manquante après la virgule dans le titre de workedExamples « Exemple 5 (prolongement) — Démontrer qu'il ne l'est pas »,statement. Confirme le constat du screening ; sans effet sur l'affichage.
   - Correction proposée : Ajouter l'espace après la virgule.

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
   "verdict": "PASS"
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
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "py3-20",
   "issue": "Exercice de niveau 5 « Type Brevet » entièrement consacré à la contraposée (PY-EXT-01, approfondissement), alors que le niveau 5 sert d'évaluation finale du chapitre. La contraposée est évaluée comme exigible, alors que seul le prolongement est validé. Confirme le constat du screening.",
   "fix": "Retitrer « Prolongement — … » et sortir l'exercice du niveau 5 Brevet, ou le remplacer par un exercice sur la réciproque."
  },
  {
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "py3-17",
   "issue": "La bonne réponse de la question 3 est la contraposée (« n'est pas rectangle ») dans la moitié des tirages, sans mention de prolongement ; elle est donc attendue comme exigible. Confirme le constat du screening.",
   "fix": "Ne faire varier que le cas rectangle, ou signaler « (prolongement) » dans l'énoncé quand la contraposée est attendue."
  },
  {
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "",
   "issue": "La source bo-2019-22-pdf figure dans sources avec verification « verified » alors qu'elle n'est pas dans officialSources ; la note de périmètre interdit de citer une autre source comme vérifiée. Confirme le constat du screening.",
   "fix": "Retirer l'entrée, ou la passer en non vérifiée avec accord explicite ; SRC_4E la cite aussi, à corriger en conséquence."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "py3-03",
   "issue": "La solution de l'item 1 (« il faut que le triangle soit rectangle (ou que l'égalité soit vérifiée, pour la réciproque) ») mélange théorème et réciproque. Confirme le constat du screening.",
   "fix": "Reformuler : « Faux : le théorème ne s'applique qu'à un triangle rectangle ; la réciproque part de l'égalité. »"
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-18",
   "issue": "Le périmètre et l'aire sont arrondis puis comparés avec tol 0,001 : un élève qui arrondit ses calculs intermédiaires (par exemple AC≈7,5) peut obtenir une réponse différente de la clé.",
   "fix": "Préciser dans l'énoncé « sans arrondir avant la fin », ou élargir la tolérance."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Espace manquante après la virgule dans le titre de workedExamples « Exemple 5 (prolongement) — Démontrer qu'il ne l'est pas »,statement. Confirme le constat du screening ; sans effet sur l'affichage.",
   "fix": "Ajouter l'espace après la virgule."
  }
 ]
}
```
</details>
