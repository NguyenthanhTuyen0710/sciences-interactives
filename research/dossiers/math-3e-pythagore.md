# Dossier de recherche — Théorème de Pythagore et réciproque (3e)

*Chapitre `math-3e-pythagore` · SCI-3E-MATH-017 · notes de préparation (≈ 1 150 mots)*

## 1. Références officielles

Seules les trois sources ci-dessous sont utilisées. Elles sont à reprendre telles quelles dans `sources` : kind « official », verification « verified », avec leur sha256 et leur accessedAt.

- **Programme du cycle 4 (BO n° 31 du 30-07-2020), Éduscol** : thème D, automatismes. Citation (p. 137) : « les élèves doivent avoir mémorisé des images mentales (configurations de Pythagore et de Thalès, lignes trigonométriques dans un triangle rectangle) ». C'est l'objectif **M3-AUTO-03**.
- **Attendus de fin d'année de 4e (2019), Éduscol**, p. 10 :
  - **M4-EG-03** : « Il sait calculer une longueur d'un côté d'un triangle rectangle à partir de la connaissance des longueurs des deux autres côtés. »
  - **M4-EG-04** : « Il démontre qu'un triangle est un triangle rectangle à partir de la connaissance des longueurs de ses côtés. »
- **Attendus de fin d'année de 3e (2019), Éduscol** : cadre de la consolidation en 3e.

**Remarque.** Les trois correspondances objectif/citation sont des paraphrases (matchType b), approuvées manuellement le 07-11-2026. Le script de vérification donne 0 verified pour 3 needs_manual_review. La source Notion est inaccessible : aucun contenu Notion n'a été lu ni utilisé.

## 2. Périmètre exigible et hors programme

**Exigible**
- Chapitre de **consolidation** : le théorème et sa réciproque relèvent de la 4e (M4-EG-03, M4-EG-04). Ils sont mobilisés en 3e, notamment au DNB.
- Le seul objectif propre à la 3e est M3-AUTO-03 : disposer de l'**image mentale** de la configuration (triangle rectangle, hypoténuse, carrés des côtés).
- Calculer une longueur manquante : hypoténuse ou côté de l'angle droit.
- Démontrer qu'un triangle est rectangle à partir de ses trois longueurs.
- Démontrer qu'un triangle n'est pas rectangle, par contraposée ou par calcul de deux quantités différentes. Le texte des attendus cité ne mentionne que la démonstration « rectangle » : ce point est à vérifier (voir 9).
- Évaluation finale : exercices de niveau 5 « Type Brevet ».

**Hors programme ou à traiter avec prudence**
- Démonstrations du théorème (aires, triangles semblables) : au mieux en « Approfondissement » explicitement signalé.
- Triplets pythagoriciens généraux, formules de génération : hors programme.
- La trigonométrie et Thalès appartiennent à d'autres chapitres. Ils ne sont évoqués que pour les images mentales, sans exigence ici.
- Je n'invente aucune référence : les pages du programme au-delà de celles citées ne sont pas affirmées.

## 3. Prérequis

- Carré d'un nombre et racine carrée (notation $\sqrt{\ }$, valeurs approchées à la calculatrice).
- Reconnaître un triangle rectangle, l'angle droit, les côtés de l'angle droit et l'**hypoténuse**.
- Calculs avec décimaux ; arrondi (au dixième, au centième).
- Équation simple du type $x^2 = a$ avec $x > 0$.
- Notations des longueurs ($AB$, segment $[AB]$) ; unités de longueur.

## 4. Définitions et propriétés à énoncer

- **Hypoténuse** : dans un triangle rectangle, côté opposé à l'angle droit ; c'est le plus long côté.
- **Théorème de Pythagore** : si $ABC$ est rectangle en $A$, alors $BC^2 = AB^2 + AC^2$.
- **Réciproque** : si, dans un triangle $ABC$, $BC^2 = AB^2 + AC^2$, alors $ABC$ est rectangle en $A$.
- **Contraposée** (conséquence) : si $BC^2 \neq AB^2 + AC^2$, alors le triangle n'est pas rectangle en $A$.
- Valeurs exactes et approchées : $\sqrt{a}$ est exacte, une valeur décimale est approchée. Les exercices indiquent s'il faut donner la valeur exacte ou l'arrondi demandé.
- **Image mentale** : carré construit sur chaque côté. La somme des aires des deux petits carrés est égale à l'aire du grand (en illustration, sans démonstration).

**Conditions** : le triangle est rectangle (théorème) ; on compare le carré du plus grand côté à la somme des deux autres carrés (réciproque).

## 5. Méthodes

1. **Calculer l'hypoténuse** : repérer l'angle droit, nommer l'hypoténuse, écrire l'égalité, remplacer, additionner, prendre la racine, conclure avec l'unité.
2. **Calculer un côté de l'angle droit** : $AB^2 = BC^2 - AC^2$, puis racine carrée.
3. **Démontrer qu'un triangle est rectangle** : identifier le plus grand côté, calculer son carré d'une part, la somme des carrés des deux autres d'autre part, comparer et conclure avec la réciproque.
4. **Démontrer qu'il ne l'est pas** : les deux résultats sont différents, donc le triangle n'est pas rectangle (contraposée).
5. **Rédaction** : « Dans le triangle $ABC$ rectangle en $A$, d'après le théorème de Pythagore… » ; puis phrase de conclusion.
6. **Contrôle** : l'hypoténuse est plus grande que chaque côté de l'angle droit.

## 6. Progression en 5 niveaux

1. **Découverte** : reconnaître l'hypoténuse, associer les carrés aux côtés, QCM sur l'écriture de l'égalité.
2. **Application directe** : calculer $BC$ à partir de deux côtés de l'angle droit (nombres entiers, racines exactes) ; calculer un côté de l'angle droit.
3. **Entraînement** : valeurs approchées, valeurs exactes en $\sqrt{\ }$, test de la réciproque sur des triplets, figures avec données en décimaux.
4. **Problèmes** : échelle contre un mur, diagonale d'un rectangle ou d'un écran, distance dans un repère, hauteur d'un triangle isocèle, chemin le plus court.
5. **Type Brevet** (titres « Type Brevet — … ») : problème multi-étapes (contexte réel, calcul de longueur puis vérification de l'angle droit, rédaction justifiée), éventuellement associé à des calculs d'aire ou de périmètre.

Variation : les générateurs `vary` s'appuient sur des longueurs entières ou des décimaux à un chiffre, avec des triplets pythagoriciens pour les cas « rectangle » et des quasi-triplets pour les cas « non rectangle ».

## 7. Erreurs typiques des élèves

- **Additionner les longueurs au lieu des carrés** : $5 + 12 = 17$. *Correct* : $5^2 + 12^2 = 169$.
- **Oublier la racine carrée** : $BC^2 = 169$ donné comme réponse. *Correct* : $BC = \sqrt{169} = 13$.
- **Confondre hypoténuse et côté** : additionner les carrés alors que l'inconnue est un côté de l'angle droit. *Correct* : on soustrait ($AB^2 = BC^2 - AC^2$).
- **Tester la réciproque avec un mauvais côté** : le plus grand côté doit être isolé.
- **Conclure sans la phrase de réciproque**, ou conclure « rectangle » par mesure sur la figure.
- **Utiliser le théorème pour prouver qu'un triangle est rectangle** : il suppose le triangle rectangle ; c'est la réciproque qui sert à le démontrer.
- **Arrondi prématuré** : arrondir avant de comparer. *Correct* : comparer les carrés exacts.
- **Calculs de carrés erronés** ($7^2 = 14$) et **oubli de l'unité**.
- **Appliquer Pythagore sans angle droit connu**, par exemple sur un triangle quelconque.

## 8. Idées d'illustrations et d'activités

- SVG : triangle rectangle avec trois carrés construits sur les côtés, aires $a^2$, $b^2$, $c^2$ ; légendes accessibles (`alt`).
- SVG : figure d'une échelle contre un mur (modélisation) ; diagonale d'un rectangle.
- Jeux (config de l'exemple) :
  - `calcul-flash` : carrés, sommes de carrés, racines de carrés parfaits, triplets.
  - `chasse-erreurs` : fausses égalités (somme des longueurs, mauvais côté, racine oubliée, conclusion sans réciproque).
  - `memory` : triplets pythagoriciens et leurs carrés, ou énoncé associé à la configuration.
- Activité « vrai ou faux » : triangle $3$-$4$-$5$ et variantes ($3$-$4$-$6$), pour introduire la différence entre théorème et réciproque.
- Exercice `ordonner` : étapes d'une rédaction ; `demonstration` : justifications possibles.

## 9. Points à vérifier en relecture

- **Sources** : les trois entrées `officialSources` sont reprises à l'identique (url, sha256, accessedAt) ; aucune autre source n'est déclarée « verified ».
- **Objectifs** : M3-AUTO-03 est l'objectif 3e ; M4-EG-03 et M4-EG-04 apparaissent comme consolidation. Le schéma exige `officialObjectives` avec un `source` pour chacun.
- **Citation** : le point sur la démonstration qu'un triangle **n'est pas** rectangle n'est pas dans la citation retenue. À signaler comme prolongement logique de la contraposée, ou à confirmer dans le texte intégral des attendus.
- **Exactitude** : les triplets ($3$-$4$-$5$, $5$-$12$-$13$, $8$-$15$-$17$, $7$-$24$-$25$) et les arrondis sont recalculés avec les helpers du moteur.
- **Générateurs** : aucune dérive flottante ; les valeurs exactes sont préférées, et les non-rectangles ne donnent jamais deux membres égaux.
- **Diagnostics `mistakes`** : jamais égaux à la bonne réponse ; figures cohérentes avec les données.
- **Langage** : « tu », virgule décimale `{,}`, pas de reprise de formulations de manuels ; mention « Approfondissement » pour tout élément hors programme.
- **Statuts** : `reviewStatus` tous « pending », `publicationStatus` « draft ». Au moins 30 exercices, les 5 niveaux, au moins 3 jeux.
