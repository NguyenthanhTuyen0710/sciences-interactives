<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-equations

**Verdict : PASS**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | PASS |
| exercises | PASS |
| games | PASS |
| technical | PASS |
| language | PASS |

## Constats
1. **MINEUR** · exercises · `eq3-28` — La partie 3 est un « Vrai ou faux » à une seule affirmation dont la réponse est toujours vrai : elle se devine sans raisonner.
   - Correction proposée : Ajouter une affirmation fausse, par exemple « $x = -a$ n'est pas solution », ou remplacer par un QCM.
2. **MINEUR** · exercises · `eq3-30` — L'exercice est de niveau 5 mais se réduit à une équation $kx = cx + v$ déjà écrite dans la partie 1. Il correspond plutôt au niveau 3.
   - Correction proposée : Le rétrograder en niveau 3 ou retirer l'équation de la partie 1 pour demander la mise en équation.
3. **MINEUR** · exercises · `eq3-13` — La consigne ne précise pas que les solutions sont cherchées dans les nombres réels, ce qui compte pour $x^{2} = -9$. Le classement est correct.
   - Correction proposée : Ajouter « dans l'ensemble des nombres » à la consigne.
4. **MINEUR** · language · `eq3-23` — L'expression « solutions algébriques » n'est pas usuelle au collège.
   - Correction proposée : Écrire « a pour solutions [[0]] et [[1]] (ordre croissant) ».
5. **MINEUR** · language · `eq3-09` — Remarque du criblage : le texte de la solution est à vérifier quand la fraction est déjà irréductible ($g=1$). Ce cas n'est pas dans l'extrait fourni.
   - Correction proposée : Vérifier le rendu de la solution quand $g=1$.
6. **MINEUR** · language · `eq3-30` — Remarque du criblage : « Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ? » est jugée lourde.
   - Correction proposée : Reformuler en « Pour quelle valeur de $x$ les deux programmes donnent-ils le même résultat ? ».

<details><summary>JSON validé</summary>

```json
{
 "verdict": "PASS",
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
   "verdict": "PASS"
  }
 ],
 "findings": [
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-28",
   "issue": "La partie 3 est un « Vrai ou faux » à une seule affirmation dont la réponse est toujours vrai : elle se devine sans raisonner.",
   "fix": "Ajouter une affirmation fausse, par exemple « $x = -a$ n'est pas solution », ou remplacer par un QCM."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-30",
   "issue": "L'exercice est de niveau 5 mais se réduit à une équation $kx = cx + v$ déjà écrite dans la partie 1. Il correspond plutôt au niveau 3.",
   "fix": "Le rétrograder en niveau 3 ou retirer l'équation de la partie 1 pour demander la mise en équation."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-13",
   "issue": "La consigne ne précise pas que les solutions sont cherchées dans les nombres réels, ce qui compte pour $x^{2} = -9$. Le classement est correct.",
   "fix": "Ajouter « dans l'ensemble des nombres » à la consigne."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-23",
   "issue": "L'expression « solutions algébriques » n'est pas usuelle au collège.",
   "fix": "Écrire « a pour solutions [[0]] et [[1]] (ordre croissant) »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-09",
   "issue": "Remarque du criblage : le texte de la solution est à vérifier quand la fraction est déjà irréductible ($g=1$). Ce cas n'est pas dans l'extrait fourni.",
   "fix": "Vérifier le rendu de la solution quand $g=1$."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-30",
   "issue": "Remarque du criblage : « Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ? » est jugée lourde.",
   "fix": "Reformuler en « Pour quelle valeur de $x$ les deux programmes donnent-ils le même résultat ? »."
  }
 ]
}
```
</details>
