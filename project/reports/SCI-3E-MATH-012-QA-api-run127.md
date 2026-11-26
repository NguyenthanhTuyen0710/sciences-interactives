<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-thales-semblables

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
1. **MINEUR** · exercises · `th3-08` — Le champ reasoning est fourni par k0(), une fonction définie après l'export. Ce n'est pas une chaîne littérale propre à l'exercice, et le texte produit n'est pas vérifiable dans l'extrait.
   - Correction proposée : Remplacer k0() par une phrase littérale du type « Les côtés homologues de triangles semblables sont proportionnels : on multiplie chaque côté de ABC par k ».
2. **MINEUR** · exercises · `th3-21` — Classé niveau 4 alors que l'exercice se réduit à simplifier deux fractions puis citer la réciproque (calibration niveau 3). Les parties 1 et 2 attendent la même fraction p/q.
   - Correction proposée : Passer l'exercice en niveau 3, ou lui ajouter une étape de problème (par exemple une longueur à calculer ensuite).
3. **MINEUR** · exercises · `th3-23` — Classé niveau 4 pour un QCM de reconnaissance sans calcul (justification angulaire). L'énoncé est constant, seule la figure varie.
   - Correction proposée : Rétrograder en niveau 3, ou demander en plus un calcul de longueur à partir du coefficient.
4. **MINEUR** · exercises · `th3-28` — Le titre « Deux plans semblables » ne correspond pas à l'énoncé : il n'y a ni plan ni échelle, seulement deux triangles ABC et DEF.
   - Correction proposée : Retitrer par exemple « Type Brevet — Triangles à angles égaux : coefficient et périmètre ».
5. **MINEUR** · exercises · `th3-30` — Le titre « Le toit et sa poutre » annonce un contexte de charpente qui n'apparaît pas dans l'énoncé, purement géométrique.
   - Correction proposée : Ajouter une phrase de contexte (toit, poutre MN) ou retitrer « Type Brevet — Aire d'un triangle rectangle et Thalès ».
6. **MINEUR** · games · `th3-jeu-flash` — Le code du jeu n'est pas dans l'extrait, donc les items ne sont pas contrôlables. Les deux items signalés sont corrects (16 = 2×8 ; AC = 12/(9/3) = 4), mais l'inconnue n'y est pas toujours nommée. « Triangle (4;6;8) agrandi avec k = 2 » ne précise pas quel côté ou quelle grandeur on cherche.
   - Correction proposée : Nommer l'inconnue dans chaque item (par exemple « plus grand côté » ou « AC = ? ») et ranger l'item papillon avec les produits en croix.
7. **MINEUR** · language · `th3-16` — Formulation « on sait que AB mesure … cm » à la place de « AB = … » : phrasing répétitif et « Un élève pense » n'est pas en cause ici, mais la consigne de la question 3 mélange « Quelle conclusion est correcte ? » sans justification demandée.
   - Correction proposée : Harmoniser les formulations des consignes de questions à choix.

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
   "exerciseId": "th3-08",
   "issue": "Le champ reasoning est fourni par k0(), une fonction définie après l'export. Ce n'est pas une chaîne littérale propre à l'exercice, et le texte produit n'est pas vérifiable dans l'extrait.",
   "fix": "Remplacer k0() par une phrase littérale du type « Les côtés homologues de triangles semblables sont proportionnels : on multiplie chaque côté de ABC par k »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "th3-21",
   "issue": "Classé niveau 4 alors que l'exercice se réduit à simplifier deux fractions puis citer la réciproque (calibration niveau 3). Les parties 1 et 2 attendent la même fraction p/q.",
   "fix": "Passer l'exercice en niveau 3, ou lui ajouter une étape de problème (par exemple une longueur à calculer ensuite)."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "th3-23",
   "issue": "Classé niveau 4 pour un QCM de reconnaissance sans calcul (justification angulaire). L'énoncé est constant, seule la figure varie.",
   "fix": "Rétrograder en niveau 3, ou demander en plus un calcul de longueur à partir du coefficient."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "th3-28",
   "issue": "Le titre « Deux plans semblables » ne correspond pas à l'énoncé : il n'y a ni plan ni échelle, seulement deux triangles ABC et DEF.",
   "fix": "Retitrer par exemple « Type Brevet — Triangles à angles égaux : coefficient et périmètre »."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "th3-30",
   "issue": "Le titre « Le toit et sa poutre » annonce un contexte de charpente qui n'apparaît pas dans l'énoncé, purement géométrique.",
   "fix": "Ajouter une phrase de contexte (toit, poutre MN) ou retitrer « Type Brevet — Aire d'un triangle rectangle et Thalès »."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "th3-jeu-flash",
   "issue": "Le code du jeu n'est pas dans l'extrait, donc les items ne sont pas contrôlables. Les deux items signalés sont corrects (16 = 2×8 ; AC = 12/(9/3) = 4), mais l'inconnue n'y est pas toujours nommée. « Triangle (4;6;8) agrandi avec k = 2 » ne précise pas quel côté ou quelle grandeur on cherche.",
   "fix": "Nommer l'inconnue dans chaque item (par exemple « plus grand côté » ou « AC = ? ») et ranger l'item papillon avec les produits en croix."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "th3-16",
   "issue": "Formulation « on sait que AB mesure … cm » à la place de « AB = … » : phrasing répétitif et « Un élève pense » n'est pas en cause ici, mais la consigne de la question 3 mélange « Quelle conclusion est correcte ? » sans justification demandée.",
   "fix": "Harmoniser les formulations des consignes de questions à choix."
  }
 ]
}
```
</details>
