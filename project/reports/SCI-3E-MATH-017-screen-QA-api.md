<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-pythagore

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | PASS |
| games | PASS |
| technical | PASS |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · curriculum — La source bo-2019-22-pdf est marquée « verified » alors qu'elle n'figure pas dans officialSources, ce qui contredit la note de périmètre (aucune autre source citée comme vérifiée) ; son sha256 et sa date d'accès ne sont pas traçables.
   - Correction proposée : Retirer cette entrée de sources ou la marquer non vérifiée, et ne citer que les trois entrées officialSources.
2. **MAJEUR** · curriculum · `py3-17` — La contraposée (« n'est pas rectangle ») est présentée comme attendue dans un exercice Brevet alors que le programme ne demande que la démonstration « est rectangle ».
   - Correction proposée : Retirer la contraposée des options attendues ou la signaler explicitement comme prolongement hors exigible.
3. **MAJEUR** · curriculum · `py3-20` — Exercice de niveau 5 « Type Brevet » entièrement consacré à la contraposée, alors que l'extension PY-EXT-01 est réservée au prolongement et ne doit pas être évaluée comme exigible.
   - Correction proposée : Étiqueter l'exercice « Prolongement » ou le remplacer par un exercice sur la réciproque.
4. **MINEUR** · accuracy · `py3-03` — La solution « Faux : il faut que le triangle soit rectangle (ou que l'égalité soit vérifiée, pour la réciproque) » est ambiguë sur la notion de triangle rectangle.
   - Correction proposée : Reformuler : le théorème ne s'applique qu'aux triangles rectangles ; la réciproque part d'une égalité.
5. **MINEUR** · language — Dans workedExamples, il manque une espace après la virgule : title « Exemple 5 (prolongement) — Démontrer qu'il ne l'est pas »,statement.
   - Correction proposée : Ajouter une espace après la virgule et vérifier le formatage du fichier.

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
   "verdict": "PASS"
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
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "",
   "issue": "La source bo-2019-22-pdf est marquée « verified » alors qu'elle n'figure pas dans officialSources, ce qui contredit la note de périmètre (aucune autre source citée comme vérifiée) ; son sha256 et sa date d'accès ne sont pas traçables.",
   "fix": "Retirer cette entrée de sources ou la marquer non vérifiée, et ne citer que les trois entrées officialSources."
  },
  {
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "py3-17",
   "issue": "La contraposée (« n'est pas rectangle ») est présentée comme attendue dans un exercice Brevet alors que le programme ne demande que la démonstration « est rectangle ».",
   "fix": "Retirer la contraposée des options attendues ou la signaler explicitement comme prolongement hors exigible."
  },
  {
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "py3-20",
   "issue": "Exercice de niveau 5 « Type Brevet » entièrement consacré à la contraposée, alors que l'extension PY-EXT-01 est réservée au prolongement et ne doit pas être évaluée comme exigible.",
   "fix": "Étiqueter l'exercice « Prolongement » ou le remplacer par un exercice sur la réciproque."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "py3-03",
   "issue": "La solution « Faux : il faut que le triangle soit rectangle (ou que l'égalité soit vérifiée, pour la réciproque) » est ambiguë sur la notion de triangle rectangle.",
   "fix": "Reformuler : le théorème ne s'applique qu'aux triangles rectangles ; la réciproque part d'une égalité."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Dans workedExamples, il manque une espace après la virgule : title « Exemple 5 (prolongement) — Démontrer qu'il ne l'est pas »,statement.",
   "fix": "Ajouter une espace après la virgule et vérifier le formatage du fichier."
  }
 ]
}
```
</details>
