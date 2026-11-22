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
1. **MAJEUR** · curriculum · `cl3-14` — Le calcul astucieux de type (n+d)(n−d) avec n=20…100 est exigible seulement via a²−b², mais la consigne sur (a+b)² reste hors programme ; à vérifier qu'aucun énoncé ne demande (a±b)².
   - Correction proposée : Vérifier que les énoncés n'utilisent que a²−b².
2. **MAJEUR** · exercises · `cl3-31` — Le niveau 4 est problématique : la consigne demande de développer une aire puis dit « complète A = … x² + … x + … » mais le modèle attend la forme réduite ; ambiguïté possible sur le signe de la terrasse soustraite.
   - Correction proposée : Préciser « forme réduite » et vérifier le terme constant pq − c².
3. **MAJEUR** · exercises · `cl3-16` — Affirmation « Donc 2x+3=x+5 est une identité » formulée comme fausse dépend d'une lecture implicite ; énoncé à clarifier.
   - Correction proposée : Reformuler la phrase en « est une identité » sans « Donc ».
4. **MAJEUR** · accuracy — Dans la définition de Expression littérale, « 3(x+5) est un produit » est correct, mais la leçon introduit l'identité (a±b)² absente du programme 3e ; la leçon ne la mentionne pas comme hors programme.
   - Correction proposée : Ajouter la mention « hors programme en 3e » ou la retirer des exemples.
5. **MINEUR** · games · `cl3-jeu-flash` — Item « Calcule 8 × 99 » : la réponse 792 est correcte mais l'item « Coefficient de x dans -(-2x+7) » donne 2 ; ok. Vérifier la cohérence des instructions avec le niveau de difficulté.
   - Correction proposée : Aucune correction certaine ; relecture recommandée.
6. **MINEUR** · language · `cl3-16` — Énoncé « Pour prouver qu'une égalité est fausse en général » : formulation maladroite pour « réfuter ».
   - Correction proposée : Écrire « Pour réfuter qu'une égalité est vraie en général ».

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
   "exerciseId": "cl3-14",
   "issue": "Le calcul astucieux de type (n+d)(n−d) avec n=20…100 est exigible seulement via a²−b², mais la consigne sur (a+b)² reste hors programme ; à vérifier qu'aucun énoncé ne demande (a±b)².",
   "fix": "Vérifier que les énoncés n'utilisent que a²−b²."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-31",
   "issue": "Le niveau 4 est problématique : la consigne demande de développer une aire puis dit « complète A = … x² + … x + … » mais le modèle attend la forme réduite ; ambiguïté possible sur le signe de la terrasse soustraite.",
   "fix": "Préciser « forme réduite » et vérifier le terme constant pq − c²."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-16",
   "issue": "Affirmation « Donc 2x+3=x+5 est une identité » formulée comme fausse dépend d'une lecture implicite ; énoncé à clarifier.",
   "fix": "Reformuler la phrase en « est une identité » sans « Donc »."
  },
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "",
   "issue": "Dans la définition de Expression littérale, « 3(x+5) est un produit » est correct, mais la leçon introduit l'identité (a±b)² absente du programme 3e ; la leçon ne la mentionne pas comme hors programme.",
   "fix": "Ajouter la mention « hors programme en 3e » ou la retirer des exemples."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "cl3-jeu-flash",
   "issue": "Item « Calcule 8 × 99 » : la réponse 792 est correcte mais l'item « Coefficient de x dans -(-2x+7) » donne 2 ; ok. Vérifier la cohérence des instructions avec le niveau de difficulté.",
   "fix": "Aucune correction certaine ; relecture recommandée."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-16",
   "issue": "Énoncé « Pour prouver qu'une égalité est fausse en général » : formulation maladroite pour « réfuter ».",
   "fix": "Écrire « Pour réfuter qu'une égalité est vraie en général »."
  }
 ]
}
```
</details>
