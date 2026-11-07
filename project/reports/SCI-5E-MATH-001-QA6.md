# SCI-5E-MATH-001 — QA6 Langue française et standards Brevet

_Rapport de l'agent QA6 (indépendant), consigné par l'orchestrateur._

**Verdict initial : FAIL** — 2 défauts bloquants ; orthographe, accents, grammaire et terminologie par ailleurs conformes.

## Bloquants
- **M1** rel5-08 `solution[1]` : LaTeX brut affiché (`1{,}5` hors `$…$`) et pluriel fautif « 1 graduations ».
- **M2** `src/lib/games/logic.ts` `lineFeedback` : « sa distance à zéro est 2,5 graduations de 0,5 » est faux pour un pas ≠ 1.

## Moyens
- Moy1 message « graduation −1 » faux pour les pas 0,5/0,2 ; Moy2 trait d'union au lieu du signe moins (U+2212) dans les jeux ; Moy3 tutoiement (chapitre, jeux) vs vouvoiement (lecteur d'exercices, moteur de correction existants) ; Moy4 aucun espace insécable sur le site ; Moy5 « soustraire 3 et 4 » ; Moy6 légende « A(−3) et B(3) : deux nombres opposés » ; Moy7 « idem pour négatif ».

## Mineurs
Majuscule dans la citation de rel5-01, `SIGN_SUM_NEG`, guillemets « Vrai »/« Faux », indices rel5-14/rel5-16, exemple fixe de rel5-16, formulations de rel5-29, pléonasme rel5-30, distracteur hors programme rel5-33 (« règle des signes de la multiplication »), « à l'altitude » dans l'exemple 5, « signifie » dans l'explication 3, objectif et consigne du jeu de la droite, message de fin du memory.

## Brevet
Aucune mention « DNB »/« Brevet »/« sujet officiel » ; pied de page conforme. Éléments réutilisables pour la partie automatismes du DNB 2027 : rel5-13, 14, 17, 20, 26, 28 (réponse directe), mini-quiz, rel5-01, rel5-24 (QCM), rel5-03, 23, 29, 35 (vrai/faux), rel5-11, rel5-12, rel5-15. Recommandation : étiqueter ces exercices `automatismes` lors de la phase Brevet.

## Suite donnée (orchestrateur)
Corrigés : M1, M2, Moy1 (branche inatteignable supprimée), Moy2, Moy4 (filtre `frTypo` dans `MathText`), Moy5, Moy6, Moy7, tous les mineurs ; aria-label du jeu passé au tutoiement.
**Non tranché — décision du porteur de projet** : Moy3, harmonisation tutoiement/vouvoiement de l'interface existante (lecteur d'exercices, messages du moteur), qui touche aussi le lycée.
