<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — math-3e-calcul-litteral

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
1. **MAJEUR** · curriculum · `cl3-14` — Le calcul mental astucieux utilise (a+b)(a-b) : identité exigible, mais l'exercice de niveau 2 n'est pas en cause ; en revanche la leçon (explication 4) utilise $101 \times 99$ et l'identité dans un cadre acceptable.
   - Correction proposée : Vérifier la cohérence de niveau ; rien d'obligatoire à changer si l'identité a² − b² est bien exigible.
2. **MAJEUR** · accuracy · `cl3-25` — Le programme « soustraire $k \times c$ » et l'énoncé « le résultat est toujours [...] du nombre de départ » : la réponse « double/triple » est pilotée par un sélecteur d'ordre dépendant de k, à vérifier.
   - Correction proposée : Vérifier que names[k-2] correspond bien à k (double pour 2, triple pour 3, etc.).
3. **MAJEUR** · exercises · `cl3-16` — La phrase « Donc 2x + 3 = x + 5 est une identité » est classée fausse, mais l'énoncé ne précise pas le contexte ; ambiguïté possible sur « égalité vraie pour x = 2 ».
   - Correction proposée : Préciser « Pour tout x, 2x + 3 = x + 5 » pour lever l'ambiguïté.
4. **MAJEUR** · exercises · `cl3-30` — Consigne « Remets les étapes dans l'ordre » sans précision sur l'ordre de la phrase de départ ; la dernière étape est la conclusion, mais 'Soit n' n'est pas garanti en première position si shuffle le mélange.
   - Correction proposée : Vérifier que la première étape reste ancrée ou ajouter un indice explicite.
5. **MINEUR** · technical · `cl3-14` — Le générateur utilise n = rng.pick([20,...]) puis d ≤ 3 ; pour n = 20, d = 3 : 23 × 17 fine, pas de cas absurde, mais la réponse n*n - d*d est correcte.
   - Correction proposée : Aucun correctif requis ; vérification manuelle recommandée.
6. **MINEUR** · language · `cl3-02` — « Écris-le sans parenthèses » : la consigne mélange vocabulaire ; « sous la forme px + q » est correct mais « Détermine l'opposé » est acceptable.
   - Correction proposée : Aucune correction obligatoire ; relire pour cohérence du tutoiement.
7. **MINEUR** · language · `cl3-33` — Le programme A est formulé « deux calculs séparés » de façon peu claire pour un élève de 3e.
   - Correction proposée : Reformuler : « ajoute p au nombre, puis retranche p au nombre de départ, puis multiplie les deux résultats ».

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
   "criterion": "curriculum",
   "severity": "MAJEUR",
   "exerciseId": "cl3-14",
   "issue": "Le calcul mental astucieux utilise (a+b)(a-b) : identité exigible, mais l'exercice de niveau 2 n'est pas en cause ; en revanche la leçon (explication 4) utilise $101 \\times 99$ et l'identité dans un cadre acceptable.",
   "fix": "Vérifier la cohérence de niveau ; rien d'obligatoire à changer si l'identité a² − b² est bien exigible."
  },
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "cl3-25",
   "issue": "Le programme « soustraire $k \\times c$ » et l'énoncé « le résultat est toujours [...] du nombre de départ » : la réponse « double/triple » est pilotée par un sélecteur d'ordre dépendant de k, à vérifier.",
   "fix": "Vérifier que names[k-2] correspond bien à k (double pour 2, triple pour 3, etc.)."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-16",
   "issue": "La phrase « Donc 2x + 3 = x + 5 est une identité » est classée fausse, mais l'énoncé ne précise pas le contexte ; ambiguïté possible sur « égalité vraie pour x = 2 ».",
   "fix": "Préciser « Pour tout x, 2x + 3 = x + 5 » pour lever l'ambiguïté."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "cl3-30",
   "issue": "Consigne « Remets les étapes dans l'ordre » sans précision sur l'ordre de la phrase de départ ; la dernière étape est la conclusion, mais 'Soit n' n'est pas garanti en première position si shuffle le mélange.",
   "fix": "Vérifier que la première étape reste ancrée ou ajouter un indice explicite."
  },
  {
   "criterion": "technical",
   "severity": "MINEUR",
   "exerciseId": "cl3-14",
   "issue": "Le générateur utilise n = rng.pick([20,...]) puis d ≤ 3 ; pour n = 20, d = 3 : 23 × 17 fine, pas de cas absurde, mais la réponse n*n - d*d est correcte.",
   "fix": "Aucun correctif requis ; vérification manuelle recommandée."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-02",
   "issue": "« Écris-le sans parenthèses » : la consigne mélange vocabulaire ; « sous la forme px + q » est correct mais « Détermine l'opposé » est acceptable.",
   "fix": "Aucune correction obligatoire ; relire pour cohérence du tutoiement."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "cl3-33",
   "issue": "Le programme A est formulé « deux calculs séparés » de façon peu claire pour un élève de 3e.",
   "fix": "Reformuler : « ajoute p au nombre, puis retranche p au nombre de départ, puis multiplie les deux résultats »."
  }
 ]
}
```
</details>
