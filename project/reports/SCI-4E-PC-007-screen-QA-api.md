<!-- Criblage QA produite par claude-haiku-5-5 via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->
# Criblage QA (API) — pc-4e-electricite

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
1. **MAJEUR** · exercises · `el4-30` — Le générateur de l'énoncé est un générateur quelconque et le ratio U/R calculé sert à décider du sort du fusible, mais la génération garantit une seule valeur possible par tirage ; la réponse « fond/ne fond pas » dépend du tirage aléatoire sans que l'énoncé le rende explicite.
   - Correction proposée : Vérifier que la comparaison I > 0,50 A est bien celle attendue pour chaque tirage et rendre la donnée de calibre visible dans l'énoncé du fusible.
2. **MAJEUR** · exercises · `el4-29` — La partie « Vrai : si on remplace R par une résistance trois fois plus petite, I est multipliée par 3 » est correcte, mais la phrase « La résistance d'un dipôle ohmique dépend de la tension appliquée » est présentée comme fausse alors que l'enseignement attend une formulation plus nette sur la constance de R.
   - Correction proposée : Reformuler l'item pour que la notion de résistance constante soit explicitement distinguée du rapport U/I.
3. **MAJEUR** · exercises · `el4-27` — Les étapes demandent le rapport U/I mais l'interaction fixe la réponse à R, valeur identique pour chaque étape ; la question est donc trop guidée et la réponse est donnée par la structure.
   - Correction proposée : Demander le calcul du rapport puis la conclusion sans pré-remplir la valeur de R dans la réponse de chaque étape.
4. **MAJEUR** · accuracy · `el4-35` — La réponse 0,6 A est cohérente (9/15), mais la mention du « fusible de calibre 0,50 A » et du secteur à éviter est présentée sans référence aux règles de l'établissement ; la règle « ne jamais toucher les parties sous tension » est formulée comme absolue.
   - Correction proposée : Préciser « le règlement de ton établissement prévaut » dans l'énoncé et harmoniser la formulation des règles de sécurité.
5. **MAJEUR** · technical · `el4-19` — La génération de U = R × i arrondie à 1 décimale peut donner une résistance R dont la valeur n'est pas exactement celle attendue au regard des chiffres significatifs (incertitude sur U arrondie).
   - Correction proposée : Calculer R à partir de la valeur de U affichée (arrondie) et vérifier que la réponse attendue est cohérente avec les chiffres significatifs affichés.
6. **MINEUR** · language · `el4-07` — « Qu'indique l'ampèremètre A₂ » : la transformation d'une chaîne par .replace("Que indique", ...) produit une question correcte mais la phrase de générateur contient « Deux lampes L1 et L2 sont en série avec un générateur », fine ; cependant le symbole de l'intensité est écrit « I₁ » en prose à plusieurs endroits, incohérent avec la notation LaTeX utilisée ailleurs.
   - Correction proposée : Uniformiser la notation des indices en LaTeX ($I_1$) dans tout l'énoncé et les solutions.
7. **MINEUR** · language · `el4-13` — Tournure « « Ne « use »-t-elle » avec guillemets mal placés et une virgule décimale manquante dans « $${s}\ \mathrm{A}$ » : le texte affiché utilise le point décimal via le format brut.
   - Correction proposée : Remplacer « « use »-t-elle » par « use-t-elle » et vérifier l'affichage de la virgule décimale dans les valeurs.
8. **MINEUR** · language · `el4-02` — Les symboles « ohm ($\Omega$) » sont affichés sans respecter l'ordre d'association attendu ; l'élève peut lire la réponse comme un indice visuel.
   - Correction proposée : Mélanger davantage l'ordre des choix ou conserver la cohérence avec la consigne.
9. **MINEUR** · games · `el4-jeu-erreurs` — L'item « $250\ \mathrm{mA} = 250\ \mathrm{A}$ » est présenté avec une erreur de conversion mais la bonne réponse est « $0{,}250\ \mathrm{A}$ », ce qui est correct ; en revanche la consigne « dis si elle est juste » ne précise pas qu'il faut choisir l'erreur, ce qui peut dérouter.
   - Correction proposée : Clarifier la consigne : pour un item faux, choisir l'erreur commise parmi les propositions.

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
   "exerciseId": "el4-30",
   "issue": "Le générateur de l'énoncé est un générateur quelconque et le ratio U/R calculé sert à décider du sort du fusible, mais la génération garantit une seule valeur possible par tirage ; la réponse « fond/ne fond pas » dépend du tirage aléatoire sans que l'énoncé le rende explicite.",
   "fix": "Vérifier que la comparaison I > 0,50 A est bien celle attendue pour chaque tirage et rendre la donnée de calibre visible dans l'énoncé du fusible."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "el4-29",
   "issue": "La partie « Vrai : si on remplace R par une résistance trois fois plus petite, I est multipliée par 3 » est correcte, mais la phrase « La résistance d'un dipôle ohmique dépend de la tension appliquée » est présentée comme fausse alors que l'enseignement attend une formulation plus nette sur la constance de R.",
   "fix": "Reformuler l'item pour que la notion de résistance constante soit explicitement distinguée du rapport U/I."
  },
  {
   "criterion": "exercises",
   "severity": "MAJEUR",
   "exerciseId": "el4-27",
   "issue": "Les étapes demandent le rapport U/I mais l'interaction fixe la réponse à R, valeur identique pour chaque étape ; la question est donc trop guidée et la réponse est donnée par la structure.",
   "fix": "Demander le calcul du rapport puis la conclusion sans pré-remplir la valeur de R dans la réponse de chaque étape."
  },
  {
   "criterion": "accuracy",
   "severity": "MAJEUR",
   "exerciseId": "el4-35",
   "issue": "La réponse 0,6 A est cohérente (9/15), mais la mention du « fusible de calibre 0,50 A » et du secteur à éviter est présentée sans référence aux règles de l'établissement ; la règle « ne jamais toucher les parties sous tension » est formulée comme absolue.",
   "fix": "Préciser « le règlement de ton établissement prévaut » dans l'énoncé et harmoniser la formulation des règles de sécurité."
  },
  {
   "criterion": "technical",
   "severity": "MAJEUR",
   "exerciseId": "el4-19",
   "issue": "La génération de U = R × i arrondie à 1 décimale peut donner une résistance R dont la valeur n'est pas exactement celle attendue au regard des chiffres significatifs (incertitude sur U arrondie).",
   "fix": "Calculer R à partir de la valeur de U affichée (arrondie) et vérifier que la réponse attendue est cohérente avec les chiffres significatifs affichés."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "el4-07",
   "issue": "« Qu'indique l'ampèremètre A₂ » : la transformation d'une chaîne par .replace(\"Que indique\", ...) produit une question correcte mais la phrase de générateur contient « Deux lampes L1 et L2 sont en série avec un générateur », fine ; cependant le symbole de l'intensité est écrit « I₁ » en prose à plusieurs endroits, incohérent avec la notation LaTeX utilisée ailleurs.",
   "fix": "Uniformiser la notation des indices en LaTeX ($I_1$) dans tout l'énoncé et les solutions."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "el4-13",
   "issue": "Tournure « « Ne « use »-t-elle » avec guillemets mal placés et une virgule décimale manquante dans « $${s}\\ \\mathrm{A}$ » : le texte affiché utilise le point décimal via le format brut.",
   "fix": "Remplacer « « use »-t-elle » par « use-t-elle » et vérifier l'affichage de la virgule décimale dans les valeurs."
  },
  {
   "criterion": "language",
   "severity": "MINEUR",
   "exerciseId": "el4-02",
   "issue": "Les symboles « ohm ($\\Omega$) » sont affichés sans respecter l'ordre d'association attendu ; l'élève peut lire la réponse comme un indice visuel.",
   "fix": "Mélanger davantage l'ordre des choix ou conserver la cohérence avec la consigne."
  },
  {
   "criterion": "games",
   "severity": "MINEUR",
   "exerciseId": "el4-jeu-erreurs",
   "issue": "L'item « $250\\ \\mathrm{mA} = 250\\ \\mathrm{A}$ » est présenté avec une erreur de conversion mais la bonne réponse est « $0{,}250\\ \\mathrm{A}$ », ce qui est correct ; en revanche la consigne « dis si elle est juste » ne précise pas qu'il faut choisir l'erreur, ce qui peut dérouter.",
   "fix": "Clarifier la consigne : pour un item faux, choisir l'erreur commise parmi les propositions."
  }
 ]
}
```
</details>
