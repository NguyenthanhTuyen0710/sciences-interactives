<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-equations

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | PASS |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · accuracy · `eq3-19` — L'énoncé affirme que $\sqrt{-4}$ « n'existe pas » mais l'explication mélange la notion de racine carrée réelle et l'équation ; à vérifier selon le programme.
   - Correction proposée : Reformuler l'explication : un carré réel ne peut être négatif, donc $x^2=-4$ n'a pas de solution réelle.
2. **MAJEUR** · exercises · `eq3-02` — Le QCM peut proposer des valeurs où le choix de la « bonne » réponse dépend de la forme de l'équation ; la solution est vérifiable mais la calibration niveau 1 est à contrôler.
   - Correction proposée : Vérifier manuellement chaque valeur proposée pour l'unicité de la solution.
3. **MAJEUR** · exercises · `eq3-24` — Énoncé : « Dans n ans, il aura le triple » est ambigu (le parent ou l'enfant) ; l'équation proposée dépend de cette lecture.
   - Correction proposée : Préciser « le parent aura le triple de l'âge de l'enfant ».
4. **MINEUR** · exercises · `eq3-13` — Le classement de « $x^2 = 7$ » en « Deux solutions » est correct mais la consigne ne précise pas le cadre réel des solutions.
   - Correction proposée : Préciser « dans l'ensemble des nombres réels ».
5. **MINEUR** · language · `eq3-09` — Consigne : « sous forme de fraction irréductible » est correcte, mais le texte de la solution contient une formule à vérifier pour le cas où la fraction est déjà irréductible.
   - Correction proposée : Vérifier le rendu de la solution quand $g=1$.
6. **MINEUR** · language · `eq3-30` — Consigne « Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ? » : formulation acceptable mais lourde pour le niveau 5.
   - Correction proposée : Reformuler plus simplement, par exemple « Pour quelle valeur de $x$ ... ».

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
   "verdict": "NEEDS_REVIEW"
  }
 ],
 "findings": [
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "eq3-19",
   "issue": "L'énoncé affirme que $\\sqrt{-4}$ « n'existe pas » mais l'explication mélange la notion de racine carrée réelle et l'équation ; à vérifier selon le programme.",
   "fix": "Reformuler l'explication : un carré réel ne peut être négatif, donc $x^2=-4$ n'a pas de solution réelle."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-02",
   "issue": "Le QCM peut proposer des valeurs où le choix de la « bonne » réponse dépend de la forme de l'équation ; la solution est vérifiable mais la calibration niveau 1 est à contrôler.",
   "fix": "Vérifier manuellement chaque valeur proposée pour l'unicité de la solution."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-24",
   "issue": "Énoncé : « Dans n ans, il aura le triple » est ambigu (le parent ou l'enfant) ; l'équation proposée dépend de cette lecture.",
   "fix": "Préciser « le parent aura le triple de l'âge de l'enfant »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-13",
   "issue": "Le classement de « $x^2 = 7$ » en « Deux solutions » est correct mais la consigne ne précise pas le cadre réel des solutions.",
   "fix": "Préciser « dans l'ensemble des nombres réels »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-09",
   "issue": "Consigne : « sous forme de fraction irréductible » est correcte, mais le texte de la solution contient une formule à vérifier pour le cas où la fraction est déjà irréductible.",
   "fix": "Vérifier le rendu de la solution quand $g=1$."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-30",
   "issue": "Consigne « Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ? » : formulation acceptable mais lourde pour le niveau 5.",
   "fix": "Reformuler plus simplement, par exemple « Pour quelle valeur de $x$ ... »."
  }
 ]
}
```
</details>
