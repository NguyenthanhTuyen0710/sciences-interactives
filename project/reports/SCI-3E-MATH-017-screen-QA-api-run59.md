<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-pythagore

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
1. **MAJEUR** · exercises · `py3-03` — Le niveau 3 est affiché pour un exercice vrai/faux de type découverte, et l'item « Si BC² = AB² + AC², alors ABC est rectangle en A » est présenté sans précision de la condition d'ordre (BC le plus grand côté).
   - Correction proposée : Revoir le niveau (1 ou 2) ou préciser que BC est le plus grand côté dans l'énoncé de l'item.
2. **MAJEUR** · exercises · `py3-18` — Le périmètre et l'aire arrondis au dixième dépendent d'une racine non entière ; la consigne « sans arrondir avant la fin » n'est pas explicitement reliée au calcul de la valeur exacte de AC pour la réponse attendue.
   - Correction proposée : Préciser dans l'énoncé que la valeur exacte de AC est gardée jusqu'au calcul final du périmètre et de l'aire.
3. **MINEUR** · accuracy — La définition « Valeur exacte, valeur approchée » utilise « $\sqrt{13}$ » et « $3{,}6$ » sans lien avec les données de l'exemple, ce qui peut prêter à confusion sur l'arrondi au dixième de $\sqrt{13}$ (≈ 3,6).
   - Correction proposée : Ajouter explicitement « $\sqrt{13} \approx 3{,}6$ au dixième » pour que l'élève relie la définition à l'arrondi.
4. **MINEUR** · games · `py3-jeu-erreurs` — L'item « $7^2 = 14$ » est rangé en niveau 2 alors qu'il porte sur les carrés élémentaires, et « Triangle $4$, $5$, $6$ » propose une erreur « Il fallait arrondir » sans lien avec le contenu.
   - Correction proposée : Remplacer les proposés d'erreur hors sujet par des erreurs pertinentes (confusion carré/double).
5. **MINEUR** · language · `py3-17` — Le libellé « d'après la réciproque ... (prolongement : contraposée ...) » mélange deux notions, et la mention « prolongement » est hors programme sans étiquette claire pour l'élève.
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
   "exerciseId": "py3-03",
   "issue": "Le niveau 3 est affiché pour un exercice vrai/faux de type découverte, et l'item « Si BC² = AB² + AC², alors ABC est rectangle en A » est présenté sans précision de la condition d'ordre (BC le plus grand côté).",
   "fix": "Revoir le niveau (1 ou 2) ou préciser que BC est le plus grand côté dans l'énoncé de l'item."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-18",
   "issue": "Le périmètre et l'aire arrondis au dixième dépendent d'une racine non entière ; la consigne « sans arrondir avant la fin » n'est pas explicitement reliée au calcul de la valeur exacte de AC pour la réponse attendue.",
   "fix": "Préciser dans l'énoncé que la valeur exacte de AC est gardée jusqu'au calcul final du périmètre et de l'aire."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "La définition « Valeur exacte, valeur approchée » utilise « $\\sqrt{13}$ » et « $3{,}6$ » sans lien avec les données de l'exemple, ce qui peut prêter à confusion sur l'arrondi au dixième de $\\sqrt{13}$ (≈ 3,6).",
   "fix": "Ajouter explicitement « $\\sqrt{13} \\approx 3{,}6$ au dixième » pour que l'élève relie la définition à l'arrondi."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "py3-jeu-erreurs",
   "issue": "L'item « $7^2 = 14$ » est rangé en niveau 2 alors qu'il porte sur les carrés élémentaires, et « Triangle $4$, $5$, $6$ » propose une erreur « Il fallait arrondir » sans lien avec le contenu.",
   "fix": "Remplacer les proposés d'erreur hors sujet par des erreurs pertinentes (confusion carré/double)."
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
