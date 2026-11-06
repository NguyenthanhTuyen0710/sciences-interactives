# SCI-5E-MATH-001 — QA4 Jeux et pédagogie

_Rapport de l'agent QA4 (indépendant), consigné par l'orchestrateur. Exécuté : Playwright (1280×900 souris/clavier, 375×760 tactile, horloge simulée), parties complètes des 4 jeux et du mini-quiz ; logique pure testée sur 2 000 tirages. Captures : `/tmp/claude-0/qa4/` (non versionnées)._

**Verdict initial : FAIL**

| # | Sévérité | Jeu | Constat | Suite donnée |
|---|---|---|---|---|
| F1 | bloquant | droite, chasse, memory | graine aléatoire différente serveur/navigateur : point M mal placé (3/15 chargements), erreur React #418 | jeux montés côté navigateur uniquement |
| F2 | bloquant | droite | « Valider » sans placer révèle la cible et permet de sauter la manche | message d'aide séparé, rien n'est révélé |
| F3 | bloquant | calcul mental | chrono figé si l'élève répond en moins d'une seconde | chrono fondé sur l'heure de fin |
| F4 | bloquant | chasse aux erreurs | bonne explication toujours en première position | options mélangées |
| F5 | majeur | calcul mental | retour d'erreur affiché sous la question suivante sans rappeler le calcul | le retour cite le calcul et la réponse |
| F6 | majeur | calcul mental | première question posée deux fois | tirage unique |
| F7 | majeur | droite | pas de touche « − » sur mobile (`inputMode=decimal`) | `inputMode=text` |
| F8 | majeur | droite | focus clavier perdu entre « Valider » et « Manche suivante » | boutons distincts, focus géré |
| F9 | majeur | droite | graduations et étiquettes trop petites à 375 px | viewBox réduite, police agrandie, boutons ← → |
| F10 | mineur | droite | « 1,5 graduations de 0,5 » | corrigé + test unitaire |
| F11 | mineur | droite | niveau 0,2 quasi inatteignable, 51 % de négatifs, lectures triviales | 12 manches, ~65 % de négatifs, extrémités exclues + test |
| F12 | mineur | calcul mental | pression du temps sur une compétence en cours d'acquisition | mode entraînement sans chrono (20 calculs) |
| F13 | mineur | calcul mental | record de 0 enregistré sans réponse | « Temps écoulé : aucune réponse », pas de record |
| F14 | mineur | memory | record dans une autre unité que le score | record = plus petit nombre d'essais |
| F15 | mineur | memory | « Recommencer » pendant le délai referme une carte | minuteur annulé |
| F16 | mineur | tous | sémantique des cartes, focus visible, alerte 10 s | cartes trouvées désactivées et annoncées, styles focus, alerte |
| F17 | mineur | chasse | distracteur peu crédible ; « −(2+3) » en 5e ? | distracteur remplacé ; « −(2+3) » figure dans les exemples 5e du document d'accompagnement (QA1) |
| F18 | mineur | mini-quiz | raison du bouton grisé, focus après « Recommencer » | indication ajoutée, focus en haut |

Conformes : consignes, retours de la droite, saisie (`parseRel`), adaptation de difficulté réelle, fins de partie atteignables au clavier seul, absence de défilement horizontal.
