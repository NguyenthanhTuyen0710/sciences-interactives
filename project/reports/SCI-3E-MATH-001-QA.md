# SCI-3E-MATH-001 — Revue QA indépendante (QA1 à QA6)

_Chapitre `src/lib/chapters/data/math-3e-arithmetique.ts` (« Arithmétique »). Relecteur indépendant (Math Validator, pédagogie, langue). Aucun fichier source modifié._

Méthode : chaque exercice a été résolu à partir de l'énoncé affiché avant de lire la clé. Chaque générateur `vary` a été exécuté sur 3 000 graines (`q0`…`q2999`) par des scripts jetables placés dans le scratchpad, qui recherchaient : NaN ou undefined, diagnostic égal à la bonne réponse, options ou items en double, vrai-faux ou classement à réponse unique, ordre déjà correct, réponse constante. Tests : suite `describeChapter` (fichier temporaire supprimé après usage) et `npx tsc --noEmit`.

| Dimension | Verdict |
|---|---|
| QA1 Programme | PASS (3 mineurs) |
| QA2 Exactitude | PASS (2 mineurs) |
| QA3 Exercices | **FAIL** (1 bloquant, 8 mineurs) |
| QA4 Jeux | PASS (3 mineurs) |
| QA5 Technique | NEEDS REVIEW (1 mineur ; contrôle navigateur non effectué) |
| QA6 Langue | NEEDS REVIEW (1 majeur, 6 mineurs) |

---

## QA1 — Programme : PASS

Le périmètre correspond au programme 2020 du cycle 4, avec les repères et attendus de 3e de 2019 :
- décomposition en facteurs premiers (M3-NC-01) ;
- fraction irréductible (M3-NC-02) ;
- problèmes de divisibilité : engrenages, conjonction de phénomènes (M3-NC-03) ;
- liste des nombres premiers inférieurs à 100, en consolidation de 4e (M4-NC-12).

Les sigles PGCD et PPCM ne sont jamais exigés : ils n'apparaissent que sous la forme « parfois noté ». L'algorithme d'Euclide et la formule du nombre de diviseurs sont absents. L'unicité de la décomposition est donnée comme admise. Les prérequis sont corrects.

Répartition par niveau : 7 / 8 / 8 / 7 / 6. Répartition par objectif : M3-NC-01 = 14, M3-NC-02 = 9, M3-NC-03 = 16, M4-NC-12 = 4.

1. **MINEUR — rattachement à des objectifs approximatif.**
   - ari3-03 (critères de divisibilité, notion de 5e) est rattaché à M3-NC-01.
   - ari3-04 et ari3-14 (lister ou compter des diviseurs) sont rattachés à M3-NC-03 (« problèmes »).
   - Correctif : présenter ces exercices comme des réactivations (par exemple un objectif « consolidation »), ou rattacher ari3-03 à M3-NC-03.
2. **MINEUR — objectifs de 4e non cités.** `curriculumChapterIds` inclut `math-4e-nombres-premiers`, mais seul M4-NC-12 est cité. M4-NC-13, M4-NC-14 et M4-NC-15 sont couverts de fait par M3-NC-01, 02 et 03, mais apparaîtront « non couverts » dans la matrice. Correctif : les citer, ou documenter l'équivalence.
3. **MINEUR — compétence formulée comme exigible.** Dans `revisionSheet.skills`, « Calculer le plus grand diviseur commun et le plus petit multiple commun de deux entiers » se lit comme une compétence exigible pour elle-même, alors que le programme les présente comme outils. Correctif : « Utiliser un diviseur commun ou un multiple commun pour résoudre un problème ».

## QA2 — Exactitude mathématique : PASS

Toutes les vérifications sont justes :
- définitions : 1 n'est pas premier, 2 est le seul premier pair, divisibilité ;
- test d'arrêt p² ≤ n ;
- propriétés « plus petit / plus grand exposant » ;
- les 5 exemples résolus : 1 260, 221 = 13 × 17, 1 260/1 650 = 42/55, 84 et 60 (12 et 420), 18 et 24 (72) ;
- explication 4 (360/84 = 30/7), mini-quiz, fiche de révision ;
- SVG « échelle » de 360 (360, 180, 90, 45, 15, 5, 1) et frise des phares (multiples de 4 et de 6, coïncidences à 0, 12 et 24 s).

1. **MINEUR — définition de « Nombre premier ».** Elle dit « un entier qui a exactement deux diviseurs ». Correctif : « un nombre entier naturel (positif) qui a exactement deux diviseurs ».
2. **MINEUR — « plus petit » au lieu de « inférieur ou égal ».** L'explication 5 dit « un diviseur commun est plus petit que les deux nombres, un multiple commun est plus grand ». Le même raccourci apparaît dans `commonMistakes[5].why`. Contre-exemple : le plus grand diviseur commun de 12 et 36 est 12. Correctif : « inférieur ou égal » et « supérieur ou égal ».

## QA3 — Exercices : FAIL

Toutes les clés recalculées sont justes sur les 3 000 tirages, y compris les points suivants :
- ari3-28 : un seul multiple du plus petit multiple commun dans l'intervalle, puisque lo > m − L et hi < m + L ;
- ari3-35 : contour fermé, autant d'arbres que d'intervalles ;
- ari3-26 : nombre de tours ;
- ari3-32 : Léa, plus rapide, fait q tours.

Aucun diagnostic ne coïncide avec la bonne réponse.

1. **BLOQUANT — ari3-03 : le générateur est dégénéré, le nombre vaut toujours 0.**
   - Cause : `let n = 0; while (![2, 3, 5].some((d) => n % d === 0)) …`. Comme 0 est divisible par tout, la boucle ne s'exécute jamais.
   - Résultat sur toutes les graines (par exemple `q1`) : « On considère le nombre $0$ », toutes les réponses sont « oui », la solution affiche « Somme des chiffres : $0 = 0$ ».
   - Une seule instance distincte sur 3 000 : l'exercice est vide de sens.
   - Correctif : `let n = 1;` (ou une boucle do/while). Vérifier ensuite que la réponse « non » apparaît aussi pour 9 et 10.
2. **MINEUR — ari3-06 : tirages déséquilibrés ou en double.**
   - 20 % des tirages sont tout « faux » (par exemple `q4`) et 1,2 % tout « vrai » (`q47`).
   - 0,7 % contiennent un item en double : `q98` donne deux fois « 3/2 = 10/9 ».
   - Correctif : imposer au moins un vrai et un faux, et tirer sans doublon.
3. **MINEUR — ari3-22 : la réponse au dernier trou est toujours « n'est pas ».** n = p × q dans 100 % des tirages, donc le trou 3 est prévisible. Correctif : glisser un nombre premier dans environ 1 tirage sur 3. Le trou 1 vaut alors n et le trou 2 vaut 1, ou bien il faut adapter le gabarit.
4. **MINEUR — ari3-13 : la règle de l'indice classe 2 comme non premier.**
   - L'indice 2 et le raisonnement disent « teste 2, 3, 5, 7 ; si aucun ne divise le nombre, il est premier ».
   - Appliquée à 2, qui apparaît dans environ 50 % des tirages (`rng.pick([1, 2])`), cette règle conclut à tort que 2 n'est pas premier.
   - Correctif : « aucun nombre premier autre que lui-même ».
5. **MINEUR — ari3-02 : l'indice 2 donne la réponse de trois items.** Il donne $49 = 7 × 7$, $77 = 7 × 11$ et $91 = 7 × 13$, or ces trois nombres font partie des pièges tirés. Correctif : « Pense aussi à tester 7 », sans exemples.
6. **MINEUR — ari3-12 : la correction contredit la méthode annoncée.**
   - Le raisonnement et l'indice disent « multiples du plus grand nombre », mais la solution énumère les multiples de b, qui est le plus petit dans 49 % des tirages.
   - Exemple `q8` (24 et 9) : la correction liste 8 multiples de 9.
   - Correctif : énumérer les multiples de max(a, b).
7. **MINEUR — ari3-30 : l'indice 1 cite une lettre absente de l'énoncé.** Il dit « Divise $a$ par 2… », or l'énoncé ne définit pas a, puisque l'indice est statique. Correctif : « Divise le nombre de truffes par 2, 3, 5, 7… ».
8. **MINEUR — ari3-21 : résultat entier écrit comme une fraction.** Le résultat est entier dans 2,8 % des tirages. Exemple `a2` : 10/3 × 3/2, la correction écrit « on obtient $\dfrac{5}{1}$ ». Correctif : afficher l'entier quand q = 1, ou exclure ces tirages.
9. **MINEUR — exercices d'ordre ou d'association déjà résolus au départ.** Correctif : remélanger tant que l'ordre est l'identité.
   - ari3-05 : association déjà dans l'ordre (4 % des tirages, `q0`) ;
   - ari3-36 : jetons déjà dans le bon ordre (1,5 %, `q49`) ;
   - ari3-17 : étapes déjà ordonnées (0,4 %, `q454`).

Niveaux 1 à 5 réalistes. ari3-22 avec 667 = 23 × 29 (8 divisions à tester) reste acceptable en niveau 3.

## QA4 — Jeux : PASS

Toutes les réponses des trois jeux ont été vérifiées : 24 items de calcul-flash, 12 items de chasse-erreurs, 6 paires de memory. Exemples : 48 = 2⁴ × 3, 162 = 2 × 3⁴, 50/35 = 10/7, 126/210 = 3/5, 36 a 9 diviseurs, 8 nombres premiers inférieurs à 20. L'adaptation du niveau (3 réussites d'affilée) correspond bien à la consigne.

1. **MINEUR — calcul-flash, niveau « Fractions irréductibles » : des valeurs décimales sont acceptées.**
   - `flashFeedback` accepte une valeur décimale : « 1,4 » est accepté pour 84/60.
   - Il accepte même une valeur approchée : « 0,6666666667 » est accepté pour 12/18 et « 1,4285714286 » pour 50/35 (tolérance relative 1e-9).
   - Correctif : quand `irreducible` est vrai, exiger une saisie fractionnaire (`p.isFraction`), ou au moins refuser les décimaux non exacts.
2. **MINEUR — chasse-erreurs : distracteurs trop faibles.**
   - La bonne erreur contient systématiquement la correction (« … : $60 = 2^{2} × 3 × 5$ »).
   - Les distracteurs sont absurdes (« $1$ est pair », « $4$ et $6$ sont premiers », « Il faudrait additionner $4$ et $6$ »).
   - Le choix de l'erreur ne discrimine donc presque rien. Correctif : proposer des distracteurs plausibles, par exemple « 57 est divisible par 7 » ou « il manque un facteur 5 ».
3. **MINEUR — chasse-erreurs : le retour parle de « calcul » pour des affirmations.** Le gabarit répond « Ce calcul est juste / contient une erreur », alors que plusieurs items sont des affirmations (« $1$ est un nombre premier »). Correctif : « Cette affirmation… », au niveau du gabarit ou par un champ de libellé.

## QA5 — Technique : NEEDS REVIEW

- La suite `describeChapter` passe : 39 tests sur 39, via le fichier temporaire `tests/qa-tmp-ari.test.ts`, créé puis supprimé.
- `npx tsc --noEmit` se termine avec le code 0.
- Le chapitre est inscrit dans `src/lib/chapters/index.ts`. `treeChapterId` `m3-arithmetique` existe dans `curriculum.ts`.
- Le rendu dans le navigateur (KaTeX, SVG, mobile, clavier) **n'a pas été contrôlé** : d'où le verdict NEEDS REVIEW.

1. **MINEUR — la suite de tests n'a pas détecté le générateur constant d'ari3-03.** Correctif : ajouter à `tests/chapter-suite.ts` une assertion « un `vary` produit au moins 2 énoncés distincts sur 40 graines », et une autre détectant une réponse vrai-faux, select ou classer constante sur toutes les graines.

## QA6 — Langue : NEEDS REVIEW

Le tutoiement est constant dans le chapitre. La typographie française est correcte : espaces avant « ; : ? ! », virgule décimale, espaces fines des milliers via `tex`. Aucune faute d'orthographe relevée.

1. **MAJEUR — ari3-01 : faute de grammaire dans la réponse attendue.**
   - Dans le cas non divisible (28 % des tirages), la phrase reconstituée est « $7$ est ni un diviseur ni un multiple de $30$ » : la négation « ne » manque.
   - Correctif : remplacer les phrases du gabarit par une seule liste de sélection portant la forme verbale complète : « est un diviseur » / « est un multiple » / « n'est ni un diviseur ni un multiple ».
2. **MINEUR — définition « Multiple commun » tautologique.** Elle dit : « Le plus petit multiple commun non nul s'appelle le **plus petit multiple commun** ». Correctif : « Le plus petit d'entre eux, non nul, s'appelle… ».
3. **MINEUR — ari3-29 : nombre écrit hors LaTeX.** Dans 81 % des tirages, la correction écrit « 2 élèves sur $11$ » : le premier nombre n'est pas en LaTeX. Correctif : `$${p}$`.
4. **MINEUR — ari3-32 : « 0 s » affiché.** Dans 47 % des tirages, la correction écrit « soit $3$ min $0$ s » (`q1`). Correctif : omettre « 0 s ».
5. **MINEUR — ari3-27 : « 0 h » affiché.** La correction peut écrire « $24$ min $= 0$ h $24$ min » (8 et 12). Correctif : n'écrire la conversion que si m ≥ 60.
6. **MINEUR — titres « Brevet — … » sur des sujets originaux.** Les 6 exercices de niveau 5 sont titrés « Brevet — … » alors que ce sont des sujets originaux, et QA6 exige de distinguer sujet officiel et sujet original. Correctif : « Type Brevet — … ». La convention est partagée avec `math-3e-pourcentages-evolution`.
7. **MINEUR — moteur au vouvoiement.** Les messages du moteur affichés dans ce chapitre vouvoient l'élève (« simplifiez-la », « Votre résultat… », dans `src/lib/engine/check.ts`), alors que le chapitre tutoie. Ce point est transversal, hors chapitre.

---

**Verdict global : FAIL**, bloqué par ari3-03 (générateur constant sur 0). Après correction d'ari3-03 et d'ari3-01, nouvelle revue QA3 et QA6 requise, puis contrôle navigateur QA5.
