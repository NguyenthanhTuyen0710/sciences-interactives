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
1. **MAJEUR** · exercises · `py3-19` — Question 3 demande $BD^2$ alors que la question 2 demande déjà la somme ; la réponse 676 est correcte mais la question 4 suppose la comparaison déjà faite, la conclusion ne dépend pas d'un calcul exigible clair.
   - Correction proposée : Vérifier la cohérence de l'enchaînement des questions 2 à 4 et reformuler la question 4 pour qu'elle s'appuie explicitement sur les réponses 2 et 3.
2. **MAJEUR** · exercises · `py3-18` — Le tolérance numérique et la règle d'exclusion des diagnostics (nearHalf) peuvent produire un arrondi au dixième ambigu ; le périmètre et l'aire ne sont pas vérifiés à la main pour un tirage donné.
   - Correction proposée : Contrôler à la main un tirage (ex. a=3, c=5) et vérifier que l'arrondi au dixième est univoque et que l'aire utilise bien AB × AC ÷ 2.
3. **MINEUR** · exercises · `py3-03` — Affirmation « Un triangle de côtés 3, 4 et 6 cm » : le calcul est juste mais la justification écrite contient « les deux résultats sont différents » sans nommer la comparaison ; niveau 3 classé comme entraînement, à vérifier.
   - Correction proposée : Vérifier la calibration du niveau et harmoniser la justification avec l'énoncé.
4. **MINEUR** · accuracy — Dans la définition de la réciproque, la forme « Si $BC^2 = AB^2 + AC^2$ » ne précise pas que $BC$ est le plus grand côté ; la définition du contrat ne le mentionne qu'ailleurs.
   - Correction proposée : Ajouter « où $[BC]$ est le plus grand côté » dans la définition de la réciproque pour rester exact.
5. **MINEUR** · games · `py3-jeu-flash` — Item « Triangle $4$ ; $5$ ; $7$ : $4^2 + 5^2 =$ » donne 41 ; l'explication compare à $7^2 = 49$, cohérent, mais la question seule ne mène pas à la conclusion annoncée.
   - Correction proposée : Reformuler l'item ou préciser dans l'explication le lien avec la réciproque.
6. **MINEUR** · language · `py3-07` — Le titre « Compléter les étapes du calcul » et la consigne « Complète le tableau » sont cohérents, mais l'exercice utilise « rectangle en A » avec des lettres A, B, C imposées par rightTriangle sans contrainte, ce qui peut donner « rectangle en B » alors que le tableau est écrit sur AB, AC, BC.
   - Correction proposée : Fixer les lettres à ['A','B','C'] pour cohérence avec le tableau (le code le fait, à vérifier que le calcul reste juste).

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
   "exerciseId": "py3-19",
   "issue": "Question 3 demande $BD^2$ alors que la question 2 demande déjà la somme ; la réponse 676 est correcte mais la question 4 suppose la comparaison déjà faite, la conclusion ne dépend pas d'un calcul exigible clair.",
   "fix": "Vérifier la cohérence de l'enchaînement des questions 2 à 4 et reformuler la question 4 pour qu'elle s'appuie explicitement sur les réponses 2 et 3."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-18",
   "issue": "Le tolérance numérique et la règle d'exclusion des diagnostics (nearHalf) peuvent produire un arrondi au dixième ambigu ; le périmètre et l'aire ne sont pas vérifiés à la main pour un tirage donné.",
   "fix": "Contrôler à la main un tirage (ex. a=3, c=5) et vérifier que l'arrondi au dixième est univoque et que l'aire utilise bien AB × AC ÷ 2."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "py3-03",
   "issue": "Affirmation « Un triangle de côtés 3, 4 et 6 cm » : le calcul est juste mais la justification écrite contient « les deux résultats sont différents » sans nommer la comparaison ; niveau 3 classé comme entraînement, à vérifier.",
   "fix": "Vérifier la calibration du niveau et harmoniser la justification avec l'énoncé."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Dans la définition de la réciproque, la forme « Si $BC^2 = AB^2 + AC^2$ » ne précise pas que $BC$ est le plus grand côté ; la définition du contrat ne le mentionne qu'ailleurs.",
   "fix": "Ajouter « où $[BC]$ est le plus grand côté » dans la définition de la réciproque pour rester exact."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "py3-jeu-flash",
   "issue": "Item « Triangle $4$ ; $5$ ; $7$ : $4^2 + 5^2 =$ » donne 41 ; l'explication compare à $7^2 = 49$, cohérent, mais la question seule ne mène pas à la conclusion annoncée.",
   "fix": "Reformuler l'item ou préciser dans l'explication le lien avec la réciproque."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "py3-07",
   "issue": "Le titre « Compléter les étapes du calcul » et la consigne « Complète le tableau » sont cohérents, mais l'exercice utilise « rectangle en A » avec des lettres A, B, C imposées par rightTriangle sans contrainte, ce qui peut donner « rectangle en B » alors que le tableau est écrit sur AB, AC, BC.",
   "fix": "Fixer les lettres à ['A','B','C'] pour cohérence avec le tableau (le code le fait, à vérifier que le calcul reste juste)."
  }
 ]
}
```
</details>
