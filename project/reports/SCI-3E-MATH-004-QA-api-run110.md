<!-- Relecture QA produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-equations

**Verdict : FAIL**

| Critère | Verdict |
|---|---|
| curriculum | NEEDS_REVIEW |
| accuracy | NEEDS_REVIEW |
| exercises | FAIL |
| games | NEEDS_REVIEW |
| technical | FAIL |
| language | NEEDS_REVIEW |

## Constats
1. **BLOQUANT** · exercises · `eq3-27` — L'énoncé est incohérent (« avec g € de moins… »). La partie 2 est remplacée par num(s) alors que g/(b−a) = s, et la partie 3 est fausse : le forfait A (a·x+g) coûte plus que B au-delà de s, donc A n'est jamais plus avantageux pour s+1 séances. La solution avoue « cela dépend du sens ».
   - Correction proposée : Réécrire l'énoncé avec A = a x + g et B = b x, supprimer le .map(), et poser un vrai/faux net : « pour s+1 séances, B est plus avantageux » (VRAI).
2. **BLOQUANT** · exercises · `eq3-29` — L'énoncé est incohérent : carré de côté x, mais l'équation x²+e·x est donnée avec la solution x=n déjà annoncée. L'exercice ne fait que tester une valeur, sans rien résoudre ; il n'est pas de niveau 5 « Type Brevet ».
   - Correction proposée : Refaire un vrai problème multi-étapes (mise en équation, factorisation x(x+e)=k, rejet de la solution négative) sans donner la solution dans l'énoncé.
3. **MAJEUR** · exercises · `eq3-24` — L'énoncé contient le fragment parasite ${p>0?"":""} et donne l'équation toute faite, ce qui supprime la mise en équation. De plus, le parent a 2(e+n)−n ans, ce qui peut donner un âge irréaliste (ex. 2·22−3 = 41 mais l'écart varie). Les indices « Développe 2(x+n) » utilisent n littéral.
   - Correction proposée : Supprimer le fragment, laisser l'élève écrire l'équation, et reformuler les indices avec la valeur numérique.
4. **MAJEUR** · exercises · `eq3-25` — Le contexte x(x+a)=2a·x est artificiel : l'aire est imposée égale à « x fois 2a », sans sens géométrique. L'équation se simplifie en x=a sans besoin de produit nul.
   - Correction proposée : Choisir une aire cible constante (ex. x(x+a)=k) ou un contexte concret menant à un produit nul naturel.
5. **MAJEUR** · exercises · `eq3-28` — Titre « Type Brevet » mais niveau 4, ce qui contredit la règle (titre Type Brevet réservé au niveau 5). Si a=2b+3 impossible mais si −a = 2b+3 jamais ; cas ok. Niveaux 5 : seulement 3 exercices dont 2 défectueux.
   - Correction proposée : Passer eq3-28 en niveau 5 ou retirer « Type Brevet » du titre, et corriger eq3-27 et eq3-29 pour avoir un niveau 5 solide.
6. **MAJEUR** · technical · `eq3-27` — Le .map((p,i)=>i===1?num(s):p) écrase la partie 2 et rend du code mort ; le calcul g/(b−a) est inutile.
   - Correction proposée : Supprimer le map et utiliser directement num(s, [], …).
7. **MINEUR** · exercises · `eq3-09` — Le titre « Solution fractionnaire » est faux : s est entier, et le code s*(a===2?1:1) est redondant.
   - Correction proposée : Choisir des solutions réellement fractionnaires (c−b non multiple de a) ou renommer l'exercice.
8. **MINEUR** · exercises · `eq3-22` — Le tt « $x+2d=P$ donne [[0]] » n'a pas de sens : on attend 4x+2d=P mais l'écriture « [[0]] x + 2d » reste abrupte sans consigne.
   - Correction proposée : Ajouter une consigne : « Complète le coefficient de x après développement ».
9. **MINEUR** · accuracy — La définition de l'équation produit nul n'indique pas qu'il faut factoriser d'abord, et « x = −b/a » dans la fiche est présenté sans la condition a≠0.
   - Correction proposée : Préciser la condition a≠0 dans la fiche et la factorisation préalable dans la définition.
10. **MINEUR** · language · `eq3-03` — L'indice contient « $+ 
   - Correction proposée : $ + 
11. **MINEUR** · language · `eq3-29` — La consigne « Ici, on veut simplement… » est familière et peu claire.
   - Correction proposée : Reformuler en phrase complète et neutre.

<details><summary>JSON validé</summary>

```json
{
 "verdict": "FAIL",
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
   "verdict": "FAIL"
  },
  {
   "criterion": "games",
   "verdict": "NEEDS_REVIEW"
  },
  {
   "criterion": "technical",
   "verdict": "FAIL"
  },
  {
   "criterion": "language",
   "verdict": "NEEDS_REVIEW"
  }
 ],
 "findings": [
  {
   "criterion": "exercises",
   "severity": "BLOQUANT",
   "exerciseId": "eq3-27",
   "issue": "L'énoncé est incohérent (« avec g € de moins… »). La partie 2 est remplacée par num(s) alors que g/(b−a) = s, et la partie 3 est fausse : le forfait A (a·x+g) coûte plus que B au-delà de s, donc A n'est jamais plus avantageux pour s+1 séances. La solution avoue « cela dépend du sens ».",
   "fix": "Réécrire l'énoncé avec A = a x + g et B = b x, supprimer le .map(), et poser un vrai/faux net : « pour s+1 séances, B est plus avantageux » (VRAI)."
  },
  {
   "criterion": "exercises",
   "severity": "BLOQUANT",
   "exerciseId": "eq3-29",
   "issue": "L'énoncé est incohérent : carré de côté x, mais l'équation x²+e·x est donnée avec la solution x=n déjà annoncée. L'exercice ne fait que tester une valeur, sans rien résoudre ; il n'est pas de niveau 5 « Type Brevet ».",
   "fix": "Refaire un vrai problème multi-étapes (mise en équation, factorisation x(x+e)=k, rejet de la solution négative) sans donner la solution dans l'énoncé."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-24",
   "issue": "L'énoncé contient le fragment parasite ${p>0?\"\":\"\"} et donne l'équation toute faite, ce qui supprime la mise en équation. De plus, le parent a 2(e+n)−n ans, ce qui peut donner un âge irréaliste (ex. 2·22−3 = 41 mais l'écart varie). Les indices « Développe 2(x+n) » utilisent n littéral.",
   "fix": "Supprimer le fragment, laisser l'élève écrire l'équation, et reformuler les indices avec la valeur numérique."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-25",
   "issue": "Le contexte x(x+a)=2a·x est artificiel : l'aire est imposée égale à « x fois 2a », sans sens géométrique. L'équation se simplifie en x=a sans besoin de produit nul.",
   "fix": "Choisir une aire cible constante (ex. x(x+a)=k) ou un contexte concret menant à un produit nul naturel."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-28",
   "issue": "Titre « Type Brevet » mais niveau 4, ce qui contredit la règle (titre Type Brevet réservé au niveau 5). Si a=2b+3 impossible mais si −a = 2b+3 jamais ; cas ok. Niveaux 5 : seulement 3 exercices dont 2 défectueux.",
   "fix": "Passer eq3-28 en niveau 5 ou retirer « Type Brevet » du titre, et corriger eq3-27 et eq3-29 pour avoir un niveau 5 solide."
  },
  {
   "criterion": "technical",
   "severity": "MAJEUR",
   "exerciseId": "eq3-27",
   "issue": "Le .map((p,i)=>i===1?num(s):p) écrase la partie 2 et rend du code mort ; le calcul g/(b−a) est inutile.",
   "fix": "Supprimer le map et utiliser directement num(s, [], …)."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-09",
   "issue": "Le titre « Solution fractionnaire » est faux : s est entier, et le code s*(a===2?1:1) est redondant.",
   "fix": "Choisir des solutions réellement fractionnaires (c−b non multiple de a) ou renommer l'exercice."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-22",
   "issue": "Le tt « $x+2d=P$ donne [[0]] » n'a pas de sens : on attend 4x+2d=P mais l'écriture « [[0]] x + 2d » reste abrupte sans consigne.",
   "fix": "Ajouter une consigne : « Complète le coefficient de x après développement »."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "La définition de l'équation produit nul n'indique pas qu'il faut factoriser d'abord, et « x = −b/a » dans la fiche est présenté sans la condition a≠0.",
   "fix": "Préciser la condition a≠0 dans la fiche et la factorisation préalable dans la définition."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-03",
   "issue": "L'indice contient « $+ ",
   "fix": "$ + "
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-29",
   "issue": "La consigne « Ici, on veut simplement… » est familière et peu claire.",
   "fix": "Reformuler en phrase complète et neutre."
  }
 ]
}
```
</details>
