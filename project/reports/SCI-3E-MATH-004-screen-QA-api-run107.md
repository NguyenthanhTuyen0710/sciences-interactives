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
1. **MAJEUR** · exercises · `eq3-27` — L'énoncé mélange « Forfait A : $a$ € par séance » avec « $g$ € de moins… » puis redéfinit le forfait A ; la partie 3 est ambiguë (« dépend du sens »).
   - Correction proposée : Réécrire l'énoncé avec un seul coût fixe par forfait et une question vrai/faux non ambiguë.
2. **MAJEUR** · exercises · `eq3-24` — L'énoncé comporte la formule « ${p > 0 ? "" : ""}équation » inutile et l'équation donnée ne correspond pas clairement à l'âge du parent défini ; formulation confuse.
   - Correction proposée : Supprimer le fragment parasite et reformuler la relation d'âges en une phrase claire.
3. **MAJEUR** · exercises · `eq3-29` — L'énoncé est incohérent (agrandissement d'un côté, puis équation $x^{2}+ex$ sans rapport avec le carré annoncé) ; la question « Vrai ou faux » sur une longueur positive est mal posée.
   - Correction proposée : Refaire l'énoncé autour d'une seule équation et d'une seule question.
4. **MAJEUR** · exercises · `eq3-25` — Le contexte « x(x+a)=2ax » est un rectangle dont l'aire est égale à $x$ fois une constante, peu naturel ; l'énoncé demande x>0 alors que la solution a est donnée sans justification concrète.
   - Correction proposée : Proposer un contexte plus clair ou une équation sans dépendance artificielle.
5. **MINEUR** · exercises · `eq3-09` — Le titre « Solution fractionnaire » ne correspond pas à des solutions fractionnaires (s est entier) et la ligne s = rng.int(...) * (a===2?1:1) est un code redondant.
   - Correction proposée : Renommer l'exercice et utiliser des solutions réellement fractionnaires ou supprimer la mention.
6. **MINEUR** · accuracy — Définition « Équation du premier degré » : « se ramène à ax+b=0 » est correct mais la présentation « a≠0 » gagnerait à être explicite comme condition du cas, et les « Exemple 4 » mélangent $\sqrt{}$ et réponse textuelle.
   - Correction proposée : Reformuler la définition en précisant la condition a≠0 et harmoniser la forme des réponses.
7. **MINEUR** · language · `eq3-03` — Hint « Quelle opération annule « $+ " + "b$ » ? » contient un artefact de concaténation visible.
   - Correction proposée : Remplacer par « Quelle opération annule « $+ b$ » ? ».
8. **MINEUR** · language · `eq3-22` — Hint et énoncé utilisent « Écris le périmètre » sans mention de la forme attendue ; la consigne « Ici » dans eq3-29 est trop familière et peu claire.
   - Correction proposée : Reformuler la consigne en phrase complète et neutre.

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
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-27",
   "issue": "L'énoncé mélange « Forfait A : $a$ € par séance » avec « $g$ € de moins… » puis redéfinit le forfait A ; la partie 3 est ambiguë (« dépend du sens »).",
   "fix": "Réécrire l'énoncé avec un seul coût fixe par forfait et une question vrai/faux non ambiguë."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-24",
   "issue": "L'énoncé comporte la formule « ${p > 0 ? \"\" : \"\"}équation » inutile et l'équation donnée ne correspond pas clairement à l'âge du parent défini ; formulation confuse.",
   "fix": "Supprimer le fragment parasite et reformuler la relation d'âges en une phrase claire."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-29",
   "issue": "L'énoncé est incohérent (agrandissement d'un côté, puis équation $x^{2}+ex$ sans rapport avec le carré annoncé) ; la question « Vrai ou faux » sur une longueur positive est mal posée.",
   "fix": "Refaire l'énoncé autour d'une seule équation et d'une seule question."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "eq3-25",
   "issue": "Le contexte « x(x+a)=2ax » est un rectangle dont l'aire est égale à $x$ fois une constante, peu naturel ; l'énoncé demande x>0 alors que la solution a est donnée sans justification concrète.",
   "fix": "Proposer un contexte plus clair ou une équation sans dépendance artificielle."
  },
  {
   "criterion": "exercises",
   "severity": "MINEUR",
   "exerciseId": "eq3-09",
   "issue": "Le titre « Solution fractionnaire » ne correspond pas à des solutions fractionnaires (s est entier) et la ligne s = rng.int(...) * (a===2?1:1) est un code redondant.",
   "fix": "Renommer l'exercice et utiliser des solutions réellement fractionnaires ou supprimer la mention."
  },
  {
   "criterion": "accuracy",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Définition « Équation du premier degré » : « se ramène à ax+b=0 » est correct mais la présentation « a≠0 » gagnerait à être explicite comme condition du cas, et les « Exemple 4 » mélangent $\\sqrt{}$ et réponse textuelle.",
   "fix": "Reformuler la définition en précisant la condition a≠0 et harmoniser la forme des réponses."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-03",
   "issue": "Hint « Quelle opération annule « $+ \" + \"b$ » ? » contient un artefact de concaténation visible.",
   "fix": "Remplacer par « Quelle opération annule « $+ b$ » ? »."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "eq3-22",
   "issue": "Hint et énoncé utilisent « Écris le périmètre » sans mention de la forme attendue ; la consigne « Ici » dans eq3-29 est trop familière et peu claire.",
   "fix": "Reformuler la consigne en phrase complète et neutre."
  }
 ]
}
```
</details>
