<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-calcul-litteral

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | PASS |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | PASS |
| language | PASS |

## Constats
1. **MAJEUR** · exercises · `cl3-28` — Les deux blancs sont attendus dans l'ordre (x + p − q)(x + p + q). La réponse (x + p + q)(x + p − q) est mathématiquement juste (commutativité) mais serait refusée.
   - Correction proposée : Accepter les deux ordres, par exemple avec une réponse de type ensemble ou permutation, ou imposer l'ordre dans la consigne : « le premier facteur contient la différence ».
2. **MINEUR** · exercises · `cl3-28` — Le premier indice parle de « la racine de $q^{2}$ » alors que la lettre q n'est pas définie dans l'énoncé, qui donne seulement b = valeur.
   - Correction proposée : Écrire « le nombre b dont le carré est ${q*q} » avec la valeur injectée.
3. **MINEUR** · exercises · `cl3-33` — Avec t = 3 et p = 9, on obtient (12)(−6) = −72 et 3² − 81 = −72. Ces résultats négatifs alourdissent inutilement la partie 1 d'un exercice de découverte du programme.
   - Correction proposée : Imposer t > p, par exemple t = rng.int(p + 1, p + 8).
4. **MINEUR** · exercises · `cl3-29` — Le retour pour l'option « toujours p² » est confus : « les autres termes ne s'annulent pas tous : il reste x² » se contredit lui-même.
   - Correction proposée : Reformuler : « Le −p² et le +p² s'annulent, mais il reste x², qui dépend du nombre choisi. »
5. **MINEUR** · exercises · `cl3-36` — Le troisième indice demande de calculer Léo avec x = 0, ce qui donne directement la réponse à la 3ᵉ affirmation.
   - Correction proposée : Remplacer par « Demande-toi si une valeur particulière peut donner une égalité vraie par hasard. »
6. **MINEUR** · exercises · `cl3-37` — Le deuxième indice mentionne « $wx$ » alors que w n'est pas défini pour l'élève.
   - Correction proposée : Injecter la valeur : « $x^{2}$ et ${w}x$ ont un facteur commun ».
7. **MINEUR** · language · `cl3-33` — L'énoncé du programme A (« deux calculs séparés ») est peu clair pour un élève de 3e.
   - Correction proposée : Reformuler : « ajoute p au nombre, puis retranche p au nombre de départ, puis multiplie les deux résultats ».
8. **MINEUR** · language · `cl3-02` — Consigne mêlant plusieurs formulations (« sans parenthèses », « sous la forme px + q »).
   - Correction proposée : Relire pour uniformiser la consigne et le tutoiement.

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
   "exerciseId": "cl3-28",
   "issue": "Les deux blancs sont attendus dans l'ordre (x + p − q)(x + p + q). La réponse (x + p + q)(x + p − q) est mathématiquement juste (commutativité) mais serait refusée.",
   "fix": "Accepter les deux ordres, par exemple avec une réponse de type ensemble ou permutation, ou imposer l'ordre dans la consigne : « le premier facteur contient la différence »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-28",
   "issue": "Le premier indice parle de « la racine de $q^{2}$ » alors que la lettre q n'est pas définie dans l'énoncé, qui donne seulement b = valeur.",
   "fix": "Écrire « le nombre b dont le carré est ${q*q} » avec la valeur injectée."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-33",
   "issue": "Avec t = 3 et p = 9, on obtient (12)(−6) = −72 et 3² − 81 = −72. Ces résultats négatifs alourdissent inutilement la partie 1 d'un exercice de découverte du programme.",
   "fix": "Imposer t > p, par exemple t = rng.int(p + 1, p + 8)."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-29",
   "issue": "Le retour pour l'option « toujours p² » est confus : « les autres termes ne s'annulent pas tous : il reste x² » se contredit lui-même.",
   "fix": "Reformuler : « Le −p² et le +p² s'annulent, mais il reste x², qui dépend du nombre choisi. »"
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-36",
   "issue": "Le troisième indice demande de calculer Léo avec x = 0, ce qui donne directement la réponse à la 3ᵉ affirmation.",
   "fix": "Remplacer par « Demande-toi si une valeur particulière peut donner une égalité vraie par hasard. »"
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "cl3-37",
   "issue": "Le deuxième indice mentionne « $wx$ » alors que w n'est pas défini pour l'élève.",
   "fix": "Injecter la valeur : « $x^{2}$ et ${w}x$ ont un facteur commun »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-33",
   "issue": "L'énoncé du programme A (« deux calculs séparés ») est peu clair pour un élève de 3e.",
   "fix": "Reformuler : « ajoute p au nombre, puis retranche p au nombre de départ, puis multiplie les deux résultats »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-02",
   "issue": "Consigne mêlant plusieurs formulations (« sans parenthèses », « sous la forme px + q »).",
   "fix": "Relire pour uniformiser la consigne et le tutoiement."
  }
 ]
}
```
</details>
