# SCI-3E-MATH-002 — Revue QA indépendante (QA1 à QA6)

_Chapitre `math-3e-puissances-calculs` (« Fractions, puissances et racines carrées »), fichier `src/lib/chapters/data/math-3e-puissances-calculs.ts`. Relecteur indépendant (Math Validator, pédagogie, langue). Aucun fichier source modifié._

**Méthode.** J'ai résolu les 35 exercices avant de lire le corrigé, puis j'ai comparé. J'ai exécuté chaque générateur `vary` sur 3 000 graines (`createRng("q<s>")` passée directement à `vary`) pour vérifier : réponse parfaite = 100 %, diagnostics égaux à la bonne réponse, options en double, artefacts de flottants, point décimal ou notation `e` affichés, NaN. J'ai ajouté des contrôles ciblés par exercice. Les scripts jetables sont dans le scratchpad de la session.

**Résultat global des tirages.** Aucune clé fausse, aucun NaN, aucun artefact de flottant (du type 0,30000000004), aucun diagnostic égal à la bonne réponse : 0 cas sur 30 générateurs × 3 000 tirages. Les défauts relevés portent sur la qualité des données tirées et sur l'affichage.

| Dimension | Verdict |
|---|---|
| QA1 Programme | **PASS** |
| QA2 Exactitude mathématique | **PASS** (4 mineurs) |
| QA3 Exercices | **NEEDS REVIEW** (2 majeurs) |
| QA4 Jeux | **PASS** (2 mineurs) |
| QA5 Technique | **PASS** |
| QA6 Langue | **PASS** (3 mineurs) |

---

## QA1 — Programme : PASS

Le périmètre correspond au programme du cycle 4 de 2020 et aux repères 2019 de 3e (M3-NC-04 à 07). La consolidation de 4e est étiquetée M4-NC-xx. Les prérequis `m5-fractions`, `m4-puissances` et `m4-pythagore` existent dans l'arborescence. Chaque objectif est couvert par au moins un exercice (contrôle DoD passé). **Aucune propriété algébrique des racines carrées n'est exigée** : seuls servent la définition, (√a)² = a, la croissance pour encadrer et le contre-exemple √(a+b) ≠ √a + √b, présenté comme une erreur.

1. **MINEUR — pc3-10, pc3-16, leçon « Règles de calcul sur les puissances ».** L'inventaire de 4e note : « Les formules générales sur les puissances ne sont pas exigibles. » Or pc3-10 (niveau 2) demande d'appliquer directement (a^u)^v avec u et v négatifs et une base quelconque, par exemple (7⁻³)⁻². Ce n'est pas hors programme au regard de M3-NC-04, mais c'est exigeant pour un niveau 2.
   *Correctif :* en pc3-10, limiter u ou v à des valeurs positives (ou passer l'exercice au niveau 3). Dans la propriété, ajouter : « on peut toujours les retrouver en comptant les facteurs ».

## QA2 — Exactitude mathématique : PASS

Ces points sont corrects :
- les définitions : aⁿ, a⁰ = 1 et a⁻ⁿ = 1/aⁿ pour a ≠ 0 ;
- la mantisse de la notation scientifique dans [1 ; 10[ ;
- √a pour a ≥ 0, et la distinction entre valeur exacte et valeur approchée ;
- les exemples travaillés 1 à 5, le mini-quiz et les erreurs fréquentes ;
- les données : distances Soleil–planètes, c ≈ 3 × 10⁵ km/s, 1 al ≈ 9,46 × 10¹² km, Proxima 4,2 al, Sirius 8,6 al, Altaïr 16,7 al, Arcturus 36,7 al, goutte de 0,05 mL ≈ 1,7 × 10²¹ molécules (0,05/18 × 6,02 × 10²³ ≈ 1,67 × 10²¹), doublement des bactéries en 20 min ;
- les SVG : la bande 6/3/6 sur 15 cases est conforme à 2/5 et à 1/3 du reste ; √20 ≈ 4,47.

1. **MINEUR — illustration `powersScale`.** « 10⁹ m : ≈ 3 fois la distance Terre–Lune ». En réalité 10⁹ / 3,84 × 10⁸ ≈ 2,6.
   *Correctif :* « ≈ 2,6 fois la distance Terre–Lune » ou « environ 2,5 fois ».
2. **MINEUR — définition « Notation scientifique » et `reasoning` de pc3-18.** « L'exposant n donne l'ordre de grandeur » est imprécis : 9,6 × 10⁴ a pour ordre de grandeur 10⁵.
   *Correctif :* « l'exposant n renseigne sur l'ordre de grandeur (puissance de 10 la plus proche) ».
3. **MINEUR — propriété « Signe d'une puissance ».** « (−a)ⁿ est positif si n est pair » est énoncé sans condition, alors que pour a = 0 on a (−0)ⁿ = 0.
   *Correctif :* ajouter `conditions: "a > 0"`, ou écrire « pour a ≠ 0 ».
4. **MINEUR — `reasoning` de pc3-26.** « La valeur exacte est √(BC²) » est une tautologie.
   *Correctif :* « La valeur exacte est BC = √(AB² + AC²) ».

## QA3 — Exercices : NEEDS REVIEW

Mes 35 résolutions concordent avec les clés : 0 désaccord.

1. **MAJEUR — pc3-31 « Programme de calcul avec des fractions ».** Le programme tire `m1 = q(int(1,5), int(2,6))` et `d1 = q(int(1,5), int(2,4))`. Résultat : 953 tirages sur 3 000 (32 %) contiennent « le multiplier par 1 » ou « diviser le résultat par 1 ».
   - Exemple q1 : « diviser le résultat par $1$ ».
   - Cas totalement trivial, 5 tirages sur 3 000 (q798) : choisir $1$, multiplier par $1$, ajouter $1$, diviser par $1$, sans aucune fraction dans un exercice « type Brevet ».
   *Correctif :* retirer les tirages où m1 ou d1 vaut 1. Imposer qu'au moins x ou m1 ne soit pas entier, par exemple avec `while (m1[1] === 1 && m1[0] === 1)` et des dénominateurs différents des numérateurs.
2. **MAJEUR — pc3-05, pc3-08, pc3-09, pc3-15 (et pc3-19, pc3-27).** Les opérandes sont affichés non simplifiés (`Fw`) avec un numérateur tiré indépendamment du dénominateur. Des « fractions » entières ou égales à 1 apparaissent donc dans les énoncés :

   | Exercice | Énoncés avec une fraction entière (n/d avec d \| n) | dont n/n |
   |---|---|---|
   | pc3-15 | 1 573 / 3 000 (52 %) | 1 058 / 3 000 (35 %) |
   | pc3-05 | 34 % | 598 / 3 000 (20 %) |
   | pc3-08 | 27 % | — |
   | pc3-09 | 26 % | — |

   - pc3-15, q2 : `4/7 + 4/2 × 4/2`.
   - pc3-09, q1 : `9/9 ÷ 2/5`. Dans ce cas, les deux diagnostics ont le même `match` (347 tirages).
   - pc3-08 : résultat nul dans 1 % des tirages (`3/9 − 1/3`, q28).
   - pc3-27 : énoncés comme « Léa reçoit 2/6, Tom 4/10 ».
   *Correctif :* tirer numérateur et dénominateur tels que `gcd(n, d) = 1` et `d ∤ n` (pour pc3-08, autoriser au plus une fraction impropre) ; exclure le résultat 0.
3. **MINEUR — pc3-12.**
   - L'arrondi au dixième tombe sur un entier dans 105 tirages sur 3 000 (q52 : √145 → affiché « 12 » au lieu de « 12,0 »).
   - Deux options identiques apparaissent dans 23 tirages sur 3 000 (q68 : `10,1 | 10,1 | √102`, car r1 = r3).
   *Correctif :* passer `decimals: 1` dans `num(...)` et afficher `r1`/`r3` avec `frFixed` (`10,1` / `10,100`), ou rejeter les n pour lesquels r3 = r1.
4. **MINEUR — affichage des arrondis demandés (pc3-22, pc3-24, pc3-25, pc3-26, pc3-32).** `roundingLabel` est fourni sans `decimals`, si bien que la correction affiche par exemple « 6 » pour Vénus en minutes, au lieu de « 6,0 ».
   *Correctif :* ajouter `decimals` (1 ou 2) chaque fois qu'un arrondi est demandé.
5. **MINEUR — pc3-17.** `a = R·b/10` impose `m = R/10 ∈ [1,1 ; 9,9]` : le réajustement de la mantisse n'est jamais nécessaire, alors que pc3-14 (niveau 2) l'exige. Par ailleurs, le numérateur n'est pas en notation scientifique dans 76 % des tirages (q1 : `48 × 10⁻³ / (5 × 10¹)`).
   *Correctif :* tirer aussi des cas où a < b, par exemple 2 × 10³ / (5 × 10¹) = 4 × 10¹, et écrire le numérateur en notation scientifique.
6. **MINEUR — pc3-18.** Si `m5` coïncide avec `m1` ou `m2`, l'item non scientifique est éliminé par la déduplication. Cela arrive dans 77 tirages sur 3 000 (q68) : il reste alors 4 items, tous scientifiques, et l'indice 1 (« Une des écritures n'est pas en notation scientifique ») devient faux.
   *Correctif :* tirer `m5` différent de `m1` et de `m2`.
7. **MINEUR — pc3-06.** Un item en double, 1 tirage sur 3 000 (q2735 : `3,1 × 10⁻⁷` deux fois).
   *Correctif :* imposer (m2, p2) ≠ (m1, p1).
8. **MINEUR — diagnostics peu réalistes.**
   - pc3-23 : le diagnostic `V × 5` ne correspond à aucune erreur plausible. L'erreur attendue est « multiplier par 0,05 », soit `V × 0,05`.
   - pc3-22, partie 1 : le diagnostic `3e5/d` arrondi à 10⁻⁶ (par exemple 0,005172) ne sera jamais saisi tel quel. À retirer ou à remplacer par `d × 3 × 10⁵`.
   - pc3-04 (q15, a = n = 2) : deux diagnostics ont le même `match`, −4.
9. **MINEUR — indices qui donnent une partie de la réponse.**
   - pc3-07 : « Kilo signifie mille : 10³ » donne la paire kilo, présente dans environ 2/3 des tirages.
   - pc3-29 : l'indice 2 donne le verdict de l'item √p² + √r².
   *Correctif :* formuler l'indice sans la paire ni le verdict, par exemple « Quel préfixe signifie mille ? ».
10. **MINEUR — QCM non mélangés.** Dans pc3-30 partie 3, la bonne réponse est toujours en première position ; dans pc3-26 partie 3, toujours en seconde.
    *Correctif :* utiliser `shuffledQcm`.
11. **MINEUR — moteur (`parseNumber`), impact sur pc3-11, pc3-14, pc3-21 et pc3-23.** Les saisies françaises courantes `5,6.10^-6` et `5,6×10⁻⁶` (exposant en caractères Unicode) ne sont pas reconnues comme des nombres. `2,5×10^3`, `2,5e3`, `10^-3` et les fractions sont, elles, bien acceptées : les réponses équivalentes passent quand la notation scientifique n'est pas exigée.
    *Correctif :* dans le moteur, accepter `.` comme signe de multiplication devant `10^`, ainsi que les chiffres en exposant.
12. **MINEUR — pc3-21.** Le Go est converti avec 10⁹ octets, mais la convention n'est pas indiquée dans l'énoncé, contrairement à pc3-28.
    *Correctif :* ajouter « (1 Go = 10⁹ octets) ».

Les niveaux 1 à 5 et les durées sont réalistes. Le seul écart est pc3-10, discuté en QA1.

## QA4 — Jeux : PASS

Calcul flash : les 24 items sont justes. Chasse aux erreurs : les 16 items sont justes (5 calculs justes ; pour chaque calcul faux, l'option 0 est la bonne erreur, et le composant mélange les options). Memory : 8 paires, sans carte ambiguë. La logique `flashFeedback` est correcte et l'irréductibilité est contrôlée quand elle est demandée.

1. **MINEUR — `pc3-jeu-flash`, niveau 3.** Les items `2,5 × 10^3` et `4 × 10^-2` acceptent la recopie de l'énoncé (`2,5×10^3`), validée par valeur. La question devient alors triviale.
   *Correctif :* reformuler en « Écriture décimale de 2,5 × 10³ » et accepter le contournement, ou remplacer ces items par une conversion inverse (« 0,04 en notation scientifique »).
2. **MINEUR — `pc3-jeu-flash`, item `7/10 + 3/10`.** Il n'a pas `irreducible: true` : « 10/10 » est donc accepté.
   *Correctif :* ajouter `irreducible: true`.

## QA5 — Technique : PASS

1. `tests/qa-tmp-pc.test.ts` (`describeChapter`) : **38/38 tests réussis** (contrat, DoD hors revue, activités, 35 exercices × 40 graines). Le fichier a été supprimé après exécution.
2. `npx tsc --noEmit` : **0 erreur**.

Seul écart restant pour la Definition of Done : `reviewStatus` est entièrement à `pending`, ce qui est attendu pour un brouillon. À noter : `tests/qa-tmp-ari.test.ts`, non suivi par git, est présent dans le dépôt. Il n'a pas été créé par cette revue et il est hors périmètre.

## QA6 — Langue : PASS

L'orthographe et la terminologie sont correctes : base, exposant, inverse, valeur exacte ou approchée, symbole ≈, « type Brevet ». La virgule décimale et l'écriture `× 10^{n}` sont respectées partout : aucun point décimal ni aucune notation `e` affichés, sur 3 000 tirages par générateur. Le tutoiement est cohérent dans la leçon, les indices et les diagnostics, et les consignes sont à l'infinitif.

1. **MINEUR — pc3-35.** La consigne « Un résultat proposé ne sert pas, s'il y en a cinq. » est maladroite.
   *Correctif :* « S'il y a cinq résultats proposés, l'un d'eux ne sert pas. »
2. **MINEUR — pc3-24.** Le titre « Le carrelage carré » ne correspond pas à l'énoncé, qui parle d'« une pièce carrée » sans carrelage.
   *Correctif :* titre « La pièce carrée », ou mentionner le carrelage dans l'énoncé.
3. **MINEUR — pc3-27 et pc3-23.** Les nombres de 4 ou 5 chiffres sont insérés bruts dans le LaTeX des solutions (`${S}`, `${V}`), sans espace des milliers : par exemple « 12000 € ».
   *Correctif :* utiliser `T(S)` et `T(V)`.

---

**Verdict global : NEEDS REVIEW.** Aucun bloquant et aucune clé fausse. Les 2 majeurs de QA3 (pc3-31 avec ×1 ou ÷1 ; fractions entières ou égales à 1 dans les énoncés de pc3-05, 08, 09, 15, 19, 27) sont à corriger avant de passer à « approved ».

Décompte : BLOQUANT 0 · MAJEUR 2 · MINEUR 20 (QA1 : 1, QA2 : 4, QA3 : 10, QA4 : 2, QA6 : 3).
