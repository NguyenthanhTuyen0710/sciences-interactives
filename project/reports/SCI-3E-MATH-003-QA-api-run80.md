<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-calcul-litteral

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | PASS |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | NEEDS_REVIEW |
| language | PASS |

## Constats
1. **MAJEUR** · exercises · `cl3-13` — Le second indice utilise .replace sur « ${p} » dans une chaîne ordinaire : il s'affiche « Que valent $-pxx$ et $+pxx$ », ce qui est illisible et erroné.
   - Correction proposée : Écrire l'indice en texte fixe : « Que vaut la somme des deux termes en $x$ ? » (sans reprendre la valeur de $p$).
2. **MAJEUR** · exercises · `cl3-33` — La consigne du programme A (« lui ajouter p ; lui retrancher p (séparément) ; multiplier les deux résultats ») peut se lire comme deux opérations successives, ce qui redonne le nombre de départ.
   - Correction proposée : Reformuler : « calculer d'une part x + p, d'autre part x − p, puis multiplier ces deux résultats ».
3. **MINEUR** · exercises · `cl3-35` — Le vrai-faux dit « Dans la ligne 3 », mais les étapes sont mélangées à l'affichage : la numérotation n'a pas de sens pour l'élève.
   - Correction proposée : Écrire « Dans l'étape où l'on applique l'identité » ou « Pour calculer le résultat, on aurait pu développer chaque carré… ».
4. **MINEUR** · exercises · `cl3-21` — L'indice 1 génère un texte mathématique mal formé : « $-le nombre choisi$ » est du texte placé en mode mathématique.
   - Correction proposée : Écrire « Divise chaque terme par $-$ suivi du nombre choisi » sans mettre de mots dans le LaTeX.

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
   "verdict": "NEEDS_REVIEW"
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
   "exerciseId": "cl3-13",
   "issue": "Le second indice utilise .replace sur « ${p} » dans une chaîne ordinaire : il s'affiche « Que valent $-pxx$ et $+pxx$ », ce qui est illisible et erroné.",
   "fix": "Écrire l'indice en texte fixe : « Que vaut la somme des deux termes en $x$ ? » (sans reprendre la valeur de $p$)."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-33",
   "issue": "La consigne du programme A (« lui ajouter p ; lui retrancher p (séparément) ; multiplier les deux résultats ») peut se lire comme deux opérations successives, ce qui redonne le nombre de départ.",
   "fix": "Reformuler : « calculer d'une part x + p, d'autre part x − p, puis multiplier ces deux résultats »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-35",
   "issue": "Le vrai-faux dit « Dans la ligne 3 », mais les étapes sont mélangées à l'affichage : la numérotation n'a pas de sens pour l'élève.",
   "fix": "Écrire « Dans l'étape où l'on applique l'identité » ou « Pour calculer le résultat, on aurait pu développer chaque carré… »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-21",
   "issue": "L'indice 1 génère un texte mathématique mal formé : « $-le nombre choisi$ » est du texte placé en mode mathématique.",
   "fix": "Écrire « Divise chaque terme par $-$ suivi du nombre choisi » sans mettre de mots dans le LaTeX."
  }
 ]
}
```
</details>
