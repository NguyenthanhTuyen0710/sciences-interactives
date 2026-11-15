<!-- Relecture produite par claude-sonnet-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Relecture QA (API) — math-3e-pythagore

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
1. **MAJEUR** · exercises · `py3-20` — La partie 2 demande « l'écart » 256 − 225 = 31, une notion artificielle qui n'est pas un attendu du Brevet. Le niveau 5 se réduit à un exercice de rédaction mécanique.
   - Correction proposée : Remplacer l'écart par une question de conclusion (QCM) ou une autre longueur à calculer.
2. **MAJEUR** · accuracy · `py3-15` — L'énoncé donne H(x1 ; y0) et affirme que AHB est rectangle en H. Si dx ou dy est nul, le triangle est dégénéré ; ce n'est pas le cas ici, mais la figure manque et le repère n'est pas tracé. Le niveau 4 repose sur une construction imposée.
   - Correction proposée : Ajouter une figure SVG du repère, ou demander à l'élève d'identifier lui-même le triangle rectangle.
3. **MAJEUR** · exercises · `py3-12` — La valeur affichée dans l'énoncé se réduit à un décimal avec « un décimal » en consigne, ce qui indique la forme de la réponse. Si x/10 est entier (ex. 1,5 ou 2), la forme attendue est ambiguë ; mistakes[match] peut aussi devenir un nombre mal formé (arrondi à 2 décimales).
   - Correction proposée : Retirer « un décimal » de la consigne et vérifier les diagnostics pour chaque triplet.
4. **MINEUR** · curriculum — Le chapitre est présenté comme consolidation de 4e, mais le seul objectif de 3e est M3-AUTO-03. Les exercices niveau 5 reposent sur des notions de 4e, ce qui est acceptable mais doit être signalé comme révision aux élèves.
   - Correction proposée : Ajouter une phrase dans l'introduction indiquant que les notions sont vues en 4e et reprises en 3e.
5. **MINEUR** · games · `py3-jeu-flash` — Les items « rectangle ? (1 si oui, 0 si non) » imposent un codage artificiel et peu pédagogique.
   - Correction proposée : Remplacer par des calculs de carrés ou de racines, ou par un mini-QCM.
6. **MINEUR** · language · `py3-18` — Indice « Quel est l'hypoténuse ? » : « hypoténuse » est féminin (dans le mini-quiz aussi : « son hypoténuse » est correct, mais « Quel est son hypoténuse ? » est faux).
   - Correction proposée : Écrire « Quelle est l'hypoténuse ? » et « Quelle est son hypoténuse ? ».
7. **MINEUR** · technical · `py3-09` — Le diagnostic « a+b » est filtré par Number(match) !== v, alors que a+b ne peut pas égaler v. Le test de proximité à .5 n'évite pas tous les cas d'arrondi ambigus.
   - Correction proposée : Contrôler l'arrondi avec une marge plus large ou fixer une liste de couples valides.

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
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-20",
   "issue": "La partie 2 demande « l'écart » 256 − 225 = 31, une notion artificielle qui n'est pas un attendu du Brevet. Le niveau 5 se réduit à un exercice de rédaction mécanique.",
   "fix": "Remplacer l'écart par une question de conclusion (QCM) ou une autre longueur à calculer."
  },
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "py3-15",
   "issue": "L'énoncé donne H(x1 ; y0) et affirme que AHB est rectangle en H. Si dx ou dy est nul, le triangle est dégénéré ; ce n'est pas le cas ici, mais la figure manque et le repère n'est pas tracé. Le niveau 4 repose sur une construction imposée.",
   "fix": "Ajouter une figure SVG du repère, ou demander à l'élève d'identifier lui-même le triangle rectangle."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "py3-12",
   "issue": "La valeur affichée dans l'énoncé se réduit à un décimal avec « un décimal » en consigne, ce qui indique la forme de la réponse. Si x/10 est entier (ex. 1,5 ou 2), la forme attendue est ambiguë ; mistakes[match] peut aussi devenir un nombre mal formé (arrondi à 2 décimales).",
   "fix": "Retirer « un décimal » de la consigne et vérifier les diagnostics pour chaque triplet."
  },
  {
   "criterion": "curriculum",
   "severity": "MINEUR",
   "exerciseId": "",
   "issue": "Le chapitre est présenté comme consolidation de 4e, mais le seul objectif de 3e est M3-AUTO-03. Les exercices niveau 5 reposent sur des notions de 4e, ce qui est acceptable mais doit être signalé comme révision aux élèves.",
   "fix": "Ajouter une phrase dans l'introduction indiquant que les notions sont vues en 4e et reprises en 3e."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "py3-jeu-flash",
   "issue": "Les items « rectangle ? (1 si oui, 0 si non) » imposent un codage artificiel et peu pédagogique.",
   "fix": "Remplacer par des calculs de carrés ou de racines, ou par un mini-QCM."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "py3-18",
   "issue": "Indice « Quel est l'hypoténuse ? » : « hypoténuse » est féminin (dans le mini-quiz aussi : « son hypoténuse » est correct, mais « Quel est son hypoténuse ? » est faux).",
   "fix": "Écrire « Quelle est l'hypoténuse ? » et « Quelle est son hypoténuse ? »."
  },
  {
   "criterion": "technical",
   "severity": "MINEUR",
   "exerciseId": "py3-09",
   "issue": "Le diagnostic « a+b » est filtré par Number(match) !== v, alors que a+b ne peut pas égaler v. Le test de proximité à .5 n'évite pas tous les cas d'arrondi ambigus.",
   "fix": "Contrôler l'arrondi avec une marge plus large ou fixer une liste de couples valides."
  }
 ]
}
```
</details>
