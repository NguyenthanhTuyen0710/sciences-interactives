<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-pythagore

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | PASS |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · exercises · `py3-20` — Niveau 5 « Prolongement » : exercice hors programme (contraposée) sans étiquette « Approfondissement », avec un QCM où la réponse correcte repose sur un raisonnement par l'absurde.
   - Correction proposée : Intituler « Approfondissement » (pas « Prolongement ») et le signaler comme facultatif, ou retirer l'exercice du niveau 5.
2. **MAJEUR** · exercises · `py3-17` — La bonne réponse du cas non rectangle est la formulation « (prolongement : contraposée…) », donc une notion hors programme devient obligatoire pour réussir ; l'option « réciproque » reste ambiguë pour le cas non rectangle.
   - Correction proposée : Formuler la bonne option sans contraposée : « les deux nombres sont différents, donc ABC n'est pas rectangle en A » ; réserver l'étiquette « Approfondissement » à une note à part.
3. **MINEUR** · exercises · `py3-03` — Niveau 3 pour un vrai/faux de découverte ; l'item « Si BC² = AB² + AC² » est vrai sans condition d'ordre, ce qui est correct, mais le niveau est mal calibré.
   - Correction proposée : Passer l'exercice au niveau 2.
4. **MINEUR** · exercises · `py3-18` — Constat du screening rejeté comme MAJEUR : l'énoncé dit déjà « sans arrondir avant la fin ». Le seul défaut est que la valeur exacte de AC n'est pas citée.
   - Correction proposée : Ajouter « en gardant la valeur exacte de la longueur manquante ».
5. **MINEUR** · accuracy — Dans la définition « Valeur exacte, valeur approchée », $\sqrt{13}$ et $3{,}6$ ne sont pas explicitement reliés.
   - Correction proposée : Écrire « $\sqrt{13} \approx 3{,}6$ au dixième ».
6. **MINEUR** · games · `py3-jeu-erreurs` — Dans « Triangle 4, 5, 6 », la proposition d'erreur « Il fallait arrondir avant de comparer » est hors sujet ; le classement de « $7^2=14$ » en niveau 2 est acceptable.
   - Correction proposée : Remplacer par une erreur pertinente, par exemple « On a comparé 6 avec 4+5 ».
7. **MINEUR** · language · `py3-17` — Le libellé « d'après la réciproque ... (prolongement : contraposée ...) » mélange deux notions, et la mention « prolongement » est hors programme sans étiquette claire pour l'élève.
   - Correction proposée : Séparer la réponse attendue de l'option de prolongement et l'étiqueter « Approfondissement ».

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
   "severity": "MAJEUR",
   "exerciseId": "py3-20",
   "issue": "Niveau 5 « Prolongement » : exercice hors programme (contraposée) sans étiquette « Approfondissement », avec un QCM où la réponse correcte repose sur un raisonnement par l'absurde.",
   "fix": "Intituler « Approfondissement » (pas « Prolongement ») et le signaler comme facultatif, ou retirer l'exercice du niveau 5."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-17",
   "issue": "La bonne réponse du cas non rectangle est la formulation « (prolongement : contraposée…) », donc une notion hors programme devient obligatoire pour réussir ; l'option « réciproque » reste ambiguë pour le cas non rectangle.",
   "fix": "Formuler la bonne option sans contraposée : « les deux nombres sont différents, donc ABC n'est pas rectangle en A » ; réserver l'étiquette « Approfondissement » à une note à part."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-03",
   "issue": "Niveau 3 pour un vrai/faux de découverte ; l'item « Si BC² = AB² + AC² » est vrai sans condition d'ordre, ce qui est correct, mais le niveau est mal calibré.",
   "fix": "Passer l'exercice au niveau 2."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-18",
   "issue": "Constat du screening rejeté comme MAJEUR : l'énoncé dit déjà « sans arrondir avant la fin ». Le seul défaut est que la valeur exacte de AC n'est pas citée.",
   "fix": "Ajouter « en gardant la valeur exacte de la longueur manquante »."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Dans la définition « Valeur exacte, valeur approchée », $\\sqrt{13}$ et $3{,}6$ ne sont pas explicitement reliés.",
   "fix": "Écrire « $\\sqrt{13} \\approx 3{,}6$ au dixième »."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "py3-jeu-erreurs",
   "issue": "Dans « Triangle 4, 5, 6 », la proposition d'erreur « Il fallait arrondir avant de comparer » est hors sujet ; le classement de « $7^2=14$ » en niveau 2 est acceptable.",
   "fix": "Remplacer par une erreur pertinente, par exemple « On a comparé 6 avec 4+5 »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "py3-17",
   "issue": "Le libellé « d'après la réciproque ... (prolongement : contraposée ...) » mélange deux notions, et la mention « prolongement » est hors programme sans étiquette claire pour l'élève.",
   "fix": "Séparer la réponse attendue de l'option de prolongement et l'étiqueter « Approfondissement »."
  }
 ]
}
```
</details>
