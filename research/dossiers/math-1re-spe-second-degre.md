# Dossier de recherche : Équations, fonctions polynômes du second degré (1re, spécialité)

## 1. Références officielles

- Bulletin officiel n° 14 du 2 avril 2026, programme de spécialité de mathématiques de 1re, voie générale (MENE2602917A), partie « Algèbre », pages 359-360. Sha256 : `34875c42…2ae2f37c836`. Vérification : `pending_verification`.
- Bulletin officiel spécial n° 4 du 17 septembre 2026, épreuve anticipée de mathématiques (NS MENE2622640N), page 44. Sha256 : `63e1f231…d23537`. Vérification : `pending_verification`.

Aucune de ces sources n'a d'enregistrement vérifié par le collecteur. Elles doivent être citées avec `pending_verification`, jamais `verified`.

## 2. Périmètre exigible et hors programme

**Exigible :** M1S-SD-01 à M1S-SD-05.

**Approfondissement, non obligatoire :** M1S-SD-06 (somme et produit des racines, polynôme du troisième degré admettant une racine, factorisation de $x^n - a^n$). Le libellé élève doit porter la mention « Approfondissement ».

**Hors programme :**
- le calcul effectif de la forme canonique dans le cas général (le programme le limite aux « cas simples ») ;
- les méthodes de résolution des équations de degré supérieur à 3 ;
- toute notion de dérivée ou de dérivation : elle n'est pas dans ce chapitre.

## 3. Prérequis

Ces prérequis proviennent du programme de 2nde, qui n'est pas inventorié dans les sources. Ils sont à rappeler dans le cours sans exercice compté comme objectif :
- fonction carré et sa parabole ;
- identités remarquables ;
- résolution d'une équation produit nul ;
- signe d'une expression du premier degré (automatisme du programme, p. 359).

## 4. Définitions et propriétés à énoncer

Soit $f(x) = ax^2 + bx + c$ avec $a, b, c \in \mathbb{R}$ et $a \neq 0$. On pose $\Delta = b^2 - 4ac$.

- **Forme canonique (cas simples) :** $f(x) = a\left[\left(x + \dfrac{b}{2a}\right)^2 - \dfrac{\Delta}{4a^2}\right]$.
- **Racines :** si $\Delta > 0$, deux racines distinctes $x_1 = \dfrac{-b - \sqrt{\Delta}}{2a}$ et $x_2 = \dfrac{-b + \sqrt{\Delta}}{2a}$ ; si $\Delta = 0$, une racine double $-\dfrac{b}{2a}$ ; si $\Delta < 0$, aucune racine réelle.
- **Forme factorisée :** si $\Delta \ge 0$, $f(x) = a(x - x_1)(x - x_2)$.
- **Somme et produit :** $x_1 + x_2 = -\dfrac{b}{a}$ et $x_1 x_2 = \dfrac{c}{a}$.
- **Signe :** si $\Delta > 0$, $f$ est du signe de $a$ à l'extérieur de $[x_1 ; x_2]$ et du signe contraire entre $x_1$ et $x_2$. Si $\Delta \le 0$, $f$ est du signe de $a$ sur $\mathbb{R}$ (avec un zéro en $-\dfrac{b}{2a}$ si $\Delta = 0$).

**Démonstration exigible : résolution de l'équation du second degré (M1S-SD-05).** Plan à rédiger en entier dans le cours :
1. **Hypothèses :** $a, b, c \in \mathbb{R}$, $a \neq 0$.
2. **Étape 1 :** factoriser par $a$ puis compléter le carré : $x^2 + \dfrac{b}{a}x = \left(x + \dfrac{b}{2a}\right)^2 - \dfrac{b^2}{4a^2}$.
3. **Étape 2 :** obtenir $ax^2 + bx + c = a\left[\left(x + \dfrac{b}{2a}\right)^2 - \dfrac{\Delta}{4a^2}\right]$. Donc $f(x) = 0 \iff \left(x + \dfrac{b}{2a}\right)^2 = \dfrac{\Delta}{4a^2}$.
4. **Étape 3, cas $\Delta < 0$ :** le membre de gauche est positif et le membre de droite négatif. Il n'y a pas de solution.
5. **Étape 4, cas $\Delta = 0$ :** l'équation s'écrit $\left(x + \dfrac{b}{2a}\right)^2 = 0$, d'où $x = -\dfrac{b}{2a}$.
6. **Étape 5, cas $\Delta > 0$ :** $\left(x + \dfrac{b}{2a}\right)^2 = \left(\dfrac{\sqrt{\Delta}}{2|a|}\right)^2$, donc $x + \dfrac{b}{2a} = \pm\dfrac{\sqrt{\Delta}}{2|a|}$. Comme l'ensemble $\{\pm t\}$ est symétrique, on obtient les deux solutions $\dfrac{-b \pm \sqrt{\Delta}}{2a}$.
7. **Conclusion :** le nombre de solutions dépend du signe de $\Delta$ ; les solutions sont données par la formule ci-dessus.

## 5. Méthodes

- **Racine évidente :** si $f(r) = 0$, alors la seconde racine vaut $\dfrac{c}{ar}$ (produit des racines).
- **Somme et produit :** utiles pour vérifier une factorisation ou trouver une racine entière.
- **Identité remarquable :** reconnaître $a^2 - b^2$ ou un carré parfait avant de calculer $\Delta$.
- **Choix de forme (M1S-SD-04) :** forme factorisée pour les racines et le signe, canonique pour le sommet et l'optimisation, développée pour les coefficients.

## 6. Progression en 5 niveaux

1. **Découverte :** lire $\Delta$ sur une parabole ; reconnaître une forme factorisée.
2. **Application directe :** calcul de $\Delta$ ; factorisation à racine évidente ; tableau de signes à partir d'une forme factorisée.
3. **Entraînement :** formules générales ; forme canonique simple ; fonction s'annulant en deux nombres donnés.
4. **Problèmes :** choix de forme pour une optimisation ou une inéquation ; démonstration guidée de la formule (M1S-SD-05).
5. **Type épreuve anticipée — …** (1re) : épreuve écrite de 2 h **sans calculatrice**, avec automatismes (6 points) et exercices (14 points). Les énoncés ne supposent aucune calculatrice. Le split 6/14 provient du cadrage de la note de service et reste à vérifier.

Approfondissement (M1S-SD-06) : traité à part, dans des exercices étiquetés.

## 7. Erreurs typiques des élèves

- **Oublier $a \neq 0$.** Si $a = 0$, la fonction n'est plus du second degré : la formule de $\Delta$ et la division par $a$ ne s'appliquent pas.
- **Écrire $\sqrt{\Delta}$ alors que $\Delta < 0$.** Raisonnement correct : on conclut qu'il n'y a pas de racine réelle, sans calculer de racine carrée.
- **Oublier le double signe $\pm$.** Un carré égal à une constante positive a deux racines opposées.
- **Confondre $\dfrac{-b}{2a}$ et $\dfrac{-b}{2}a$.** Il faut diviser par $2a$ en entier.
- **Sommes et produits.** Erreur fréquente : $x_1 + x_2 = \dfrac{b}{a}$. Le signe moins est indispensable.
- **Factorisation sans $a$.** Écrire $(x - x_1)(x - x_2)$ au lieu de $a(x - x_1)(x - x_2)$ change le signe de la fonction quand $a < 0$.
- **Signe.** Appliquer le signe de $a$ entre les racines alors que c'est l'inverse. Raisonnement correct : tester une valeur entre $x_1$ et $x_2$, ou lire la parabole.

## 8. Idées d'illustrations et d'activités

- Faire varier $\Delta$ (positif, nul, négatif) sur une même famille de paraboles et faire observer le nombre de points d'intersection avec l'axe des abscisses.
- Faire deviner la forme factorisée d'une parabole tracée à partir de ses racines lues.
- Exercice sur le signe : tableau de signes à partir d'une forme factorisée (automatisme p. 359).
- Activité de démonstration : compléter les étapes de la résolution, avec des trous à remplir.
- Jeux de la plateforme : `calcul-flash` (calcul de $\Delta$ et de racines), `chasse-erreurs` (repérer les erreurs de signe et de $\pm$), `memory` (associer forme développée, canonique et factorisée).

## 9. Points à vérifier en relecture

- **Sources :** les sha256 et les dates d'accès sont à confirmer par le collecteur ; l'entrée `seedId: "bo-2026-14-pdf"` ne figure pas dans les `officialSources` (qui ont `seedId: null`).
- **Citations tronquées :** les `sourceCheck` de M1S-SD-03 et M1S-SD-04 sont tronqués. Les citations complètes sont dans les `evidence`. Vérifier la cohérence.
- **Pages :** la démonstration est donnée p. 359-360 dans le cadrage, mais la citation n'est vérifiée qu'à la page 360.
- **Épreuve anticipée :** le format 2 h, 6 points d'automatismes et 14 points d'exercices vient du cadrage et n'est pas confirmé par les sources inventoriées. À vérifier dans le BO spécial n° 4, p. 44.
- **Prérequis de 2nde :** non inventoriés ; à rappeler sans les compter comme objectifs.
- **Approfondissement :** M1S-SD-06 n'est pas exigible et doit rester étiqueté.
- **Chapitre exemple :** `src/lib/chapters/data/math-3e-arithmetique.ts` n'était pas fourni ; la cohérence de la structure des exercices avec lui reste à contrôler.
