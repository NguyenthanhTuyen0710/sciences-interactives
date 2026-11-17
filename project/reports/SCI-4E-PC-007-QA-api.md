<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — pc-4e-electricite

**Verdict : NEEDS_REVIEW**

| Critère | Verdict |
|---|---|
| curriculum | PASS |
| accuracy | NEEDS_REVIEW |
| exercises | NEEDS_REVIEW |
| games | PASS |
| technical | NEEDS_REVIEW |
| language | NEEDS_REVIEW |

## Constats
1. **MAJEUR** · exercises · `el4-35` — I = 9/15 = 0,60 A et la réponse numérique est donnée sans sigFigs, alors que les valeurs sont dites mesurées. Dans la partie 4, la bonne réponse « faux » à « secteur pour plus de précision » est correcte mais on ne dit pas que le secteur est interdit en TP.
   - Correction proposée : Ajouter sigFigs: 2 à la réponse 0,6 A et préciser dans la solution que le secteur est interdit aux élèves.
2. **MAJEUR** · exercises · `el4-36` — Les données sont présentées comme des mesures, mais la lampe donne U/I = 10, 15 puis 20 Ω avec 1,0, 3,0 et 6,0 V, ce qui est cohérent. Le point (0 ; 0) manque pour juger la droite passant par l'origine, et la conclusion « pas une droite par l'origine » est affirmée sans graphe.
   - Correction proposée : Conclure uniquement sur la non-constance de U/I, ou fournir le graphique U = f(I).
3. **MAJEUR** · exercises · `el4-27` — Le QCM propose « On ne peut rien conclure avec trois mesures, jamais », piège trop évident. Les étapes demandent trois fois la même valeur R, ce qui est répétitif sans plus.
   - Correction proposée : Remplacer le distracteur par une formulation plus plausible et faire varier les données (par exemple une mesure non ohmique dans certains tirages).
4. **MAJEUR** · exercises · `el4-29` — L'énoncé dit que la tension est constante puis fait deviner « Vrai/Faux » sur R, et l'item 4 (R dépend de U) est exact mais la solution écrit « c'est le rapport U/I » de façon elliptique.
   - Correction proposée : Reformuler la solution : « R est constante, et U/I est égal à cette constante ». Le finding du criblage est confirmé pour la solution seulement.
5. **MAJEUR** · technical · `el4-19` — U est arrondi à 1 décimale, puis R attendu est R tiré au hasard (ex. 27 × 0,4 = 10,8 → U/I = 27, correct) ; mais avec I = 0,5 et R impair, U = 8,5 donne bien 17, sans erreur. L'arrondi n'altère pas R ici, donc le finding du criblage est rejeté. Par contre le .replace("$U = $", ...) est inutile et fragile, et m1/m2 sont affichés avec un nombre de chiffres supposé.
   - Correction proposée : Supprimer le .replace inutile et vérifier que m1 et m2 affichent bien 2 chiffres significatifs (I = 0,10 A).
6. **MINEUR** · exercises · `el4-30` — Le calibre 0,50 A est bien dans l'énoncé et U/R est strictement comparé à 0,5 ; le finding du criblage est rejeté. Cas limite : U/R = 0,5 exactement (6 V/12 Ω = 0,5 A) est impossible car la boucle exclut seulement > 0,5 pour blow=false, donc 12 Ω sous 6 V peut sortir et le texte « ≤ 0,50 A » reste correct mais borderline.
   - Correction proposée : Éviter les cas U/R = 0,50 A exactement pour ne pas créer d'ambiguïté fond / ne fond pas.
7. **MINEUR** · accuracy · `el4-35` — Le finding du criblage sur la sécurité est en grande partie rejeté : la mention « Le règlement de l'établissement prévaut » figure déjà dans la solution et le raisonnement. Elle n'apparaît cependant pas dans l'énoncé.
   - Correction proposée : Ajouter la phrase sur le règlement de l'établissement à l'énoncé.
8. **MINEUR** · accuracy · `el4-25` — L'ordre attendu [1,4,3,0,2] place le schéma avant le choix de la loi, alors que la solution écrite suit le même ordre. Cependant « choisir la loi à vérifier » précède logiquement le schéma.
   - Correction proposée : Mettre « Choisir la loi » en premier, puis le schéma, et aligner la réponse et la solution.
9. **MINEUR** · language · `el4-07` — Finding de langue du criblage, copié tel quel : notation I₁ en prose incohérente avec la notation LaTeX.
   - Correction proposée : Écrire $I_1$ en LaTeX partout.
10. **MINEUR** · language · `el4-13` — Finding de langue du criblage, copié tel quel : guillemets mal placés dans « use-t-elle » et virgule décimale.
   - Correction proposée : Corriger les guillemets et afficher la virgule décimale.

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
   "exerciseId": "el4-35",
   "issue": "I = 9/15 = 0,60 A et la réponse numérique est donnée sans sigFigs, alors que les valeurs sont dites mesurées. Dans la partie 4, la bonne réponse « faux » à « secteur pour plus de précision » est correcte mais on ne dit pas que le secteur est interdit en TP.",
   "fix": "Ajouter sigFigs: 2 à la réponse 0,6 A et préciser dans la solution que le secteur est interdit aux élèves."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "el4-36",
   "issue": "Les données sont présentées comme des mesures, mais la lampe donne U/I = 10, 15 puis 20 Ω avec 1,0, 3,0 et 6,0 V, ce qui est cohérent. Le point (0 ; 0) manque pour juger la droite passant par l'origine, et la conclusion « pas une droite par l'origine » est affirmée sans graphe.",
   "fix": "Conclure uniquement sur la non-constance de U/I, ou fournir le graphique U = f(I)."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "el4-27",
   "issue": "Le QCM propose « On ne peut rien conclure avec trois mesures, jamais », piège trop évident. Les étapes demandent trois fois la même valeur R, ce qui est répétitif sans plus.",
   "fix": "Remplacer le distracteur par une formulation plus plausible et faire varier les données (par exemple une mesure non ohmique dans certains tirages)."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "el4-29",
   "issue": "L'énoncé dit que la tension est constante puis fait deviner « Vrai/Faux » sur R, et l'item 4 (R dépend de U) est exact mais la solution écrit « c'est le rapport U/I » de façon elliptique.",
   "fix": "Reformuler la solution : « R est constante, et U/I est égal à cette constante ». Le finding du criblage est confirmé pour la solution seulement."
  },
  {
   "criterion": "technical",
   "severity": "MAJEUR",
   "exerciseId": "el4-19",
   "issue": "U est arrondi à 1 décimale, puis R attendu est R tiré au hasard (ex. 27 × 0,4 = 10,8 → U/I = 27, correct) ; mais avec I = 0,5 et R impair, U = 8,5 donne bien 17, sans erreur. L'arrondi n'altère pas R ici, donc le finding du criblage est rejeté. Par contre le .replace(\"$U = $\", ...) est inutile et fragile, et m1/m2 sont affichés avec un nombre de chiffres supposé.",
   "fix": "Supprimer le .replace inutile et vérifier que m1 et m2 affichent bien 2 chiffres significatifs (I = 0,10 A)."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "el4-30",
   "issue": "Le calibre 0,50 A est bien dans l'énoncé et U/R est strictement comparé à 0,5 ; le finding du criblage est rejeté. Cas limite : U/R = 0,5 exactement (6 V/12 Ω = 0,5 A) est impossible car la boucle exclut seulement > 0,5 pour blow=false, donc 12 Ω sous 6 V peut sortir et le texte « ≤ 0,50 A » reste correct mais borderline.",
   "fix": "Éviter les cas U/R = 0,50 A exactement pour ne pas créer d'ambiguïté fond / ne fond pas."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "el4-35",
   "issue": "Le finding du criblage sur la sécurité est en grande partie rejeté : la mention « Le règlement de l'établissement prévaut » figure déjà dans la solution et le raisonnement. Elle n'apparaît cependant pas dans l'énoncé.",
   "fix": "Ajouter la phrase sur le règlement de l'établissement à l'énoncé."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "el4-25",
   "issue": "L'ordre attendu [1,4,3,0,2] place le schéma avant le choix de la loi, alors que la solution écrite suit le même ordre. Cependant « choisir la loi à vérifier » précède logiquement le schéma.",
   "fix": "Mettre « Choisir la loi » en premier, puis le schéma, et aligner la réponse et la solution."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "el4-07",
   "issue": "Finding de langue du criblage, copié tel quel : notation I₁ en prose incohérente avec la notation LaTeX.",
   "fix": "Écrire $I_1$ en LaTeX partout."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "el4-13",
   "issue": "Finding de langue du criblage, copié tel quel : guillemets mal placés dans « use-t-elle » et virgule décimale.",
   "fix": "Corriger les guillemets et afficher la virgule décimale."
  }
 ]
}
```
</details>
