# SCI-3E-MATH-009 — Revue QA indépendante (QA1–QA6)

_Chapitre `src/lib/chapters/data/math-3e-pourcentages-evolution.ts` (« Ratios, pourcentages et évolutions »), dossier `research/dossiers/math-3e-pourcentages-evolution.md`. Référence : programme du cycle 4 2020 (BO n° 31 du 30-07-2020) et repères 2019, inventaire `research/curriculum/mathematiques/curriculum-math.json`. Aucun fichier source n'a été modifié._

**Méthode.** J'ai résolu les 33 exercices à partir de l'énoncé affiché, puis comparé avec la clé. J'ai fait tourner chaque générateur `vary` sur 3 000 graines (`q0`…`q2999`) avec des contrôles automatiques : NaN/undefined, réponse parfaite = 100 %, diagnostic égal à la bonne réponse ou accepté par la tolérance, options/jetons/items en double, valeurs nulles, cas d'arrondi à mi-chemin, « ≈ » sur une valeur exacte, ordre déjà correct. Côté technique : `tests/qa-tmp-pct.test.ts` (suite `describeChapter`) a passé 36/36 puis a été supprimé, et `npx tsc --noEmit` s'est terminé avec le code 0.

| Dimension | Verdict |
|---|---|
| QA1 Programme | NEEDS REVIEW |
| QA2 Exactitude | PASS |
| QA3 Exercices | PASS (réserves mineures) |
| QA4 Jeux | NEEDS REVIEW |
| QA5 Technique | PASS |
| QA6 Langue | PASS (réserves mineures) |

---

## QA1 — Programme : NEEDS REVIEW

Le périmètre est conforme : CM ↔ taux, valeur finale ou initiale, taux à partir de deux valeurs, évolutions successives, ratio (2020). Aucun contenu hors programme n'est présenté comme exigible : CMⁿ seulement pour n = 2 ou 3, pas de taux moyen, pas d'indice. Les prérequis sont corrects.

1. **MAJEUR — `O["M4-OGDF-08"]`, `O["M4-OGDF-10"]`.** Les textes ont été modifiés par rapport à l'inventaire. On lit « …; appliquer et calculer un pourcentage » et « …; relier ratio, fraction et pourcentage », alors que l'inventaire dit « Calculer une quatrième proportionnelle par la procédure de son choix » et « Partager une quantité selon un ratio donné (a : b) ». Conséquence : pct3-02, pct3-07, pct3-19, pct3-31 et le jeu flash sont rattachés à un identifiant officiel dont le texte réel ne couvre pas « appliquer un pourcentage ». **Correctif :** citer les textes de l'inventaire mot pour mot et rattacher l'application d'un pourcentage à `M4-AUTO-03` (« …application d'un pourcentage… », thème B, automatismes) ou à `M5-PF-01`.
2. **MINEUR — `M3-OGDF-13-B/-C/-D`.** Ces identifiants n'existent pas dans l'inventaire mais ont la même forme que les identifiants officiels. **Correctif :** les signaler comme déclinaisons internes (préfixe ou suffixe distinct, par exemple `M3-OGDF-13#B`) ou les enregistrer dans l'inventaire.
3. **MINEUR — `sources` R3.** Elle s'intitule « Inventaire officiel… (agent A1) » et pointe vers la racine d'Éduscol. C'est pourtant un document interne. **Correctif :** l'intituler « Inventaire interne (agent A1) » et supprimer l'URL ou pointer vers le fichier du dépôt.
4. **MINEUR — leçon.** Il n'y a aucun lien entre le coefficient multiplicateur et la fonction linéaire x ↦ CM·x, alors que les repères de 3e le font. **Correctif :** ajouter une phrase dans l'explication 1 ou dans une propriété (« appliquer une hausse de 5 %, c'est appliquer la fonction linéaire x ↦ 1,05x »).

## QA2 — Exactitude : PASS

Définitions, propriétés, explications, 5 exemples travaillés, 2 SVG (80 × 1,15 = 92 ; 3 : 2 → 60 %/40 %), mini-quiz et erreurs fréquentes : tout est vérifié et juste.

1. **MINEUR — propriété « Baisse de t % ».** Elle dit « coefficient compris entre 0 et 1 (pour 0 < t ≤ 100) », alors que la fiche de révision dit « 0 < CM < 1 : baisse ». Pour t = 100, on a CM = 0. **Correctif :** écrire « 0 ≤ CM < 1 » ou bien « 0 < t < 100 ».
2. **MINEUR — `commonMistakes[2]`.** « Prix avant une hausse de 25 % d'un article à 75 € » est ambigu : on peut comprendre que 75 € est le prix d'avant. **Correctif :** « Un article coûte 75 € après une hausse de 25 % ; son prix avant : … ».
3. **MINEUR — « ≈ » ou « environ » devant une valeur exacte.**
   - pct3-28 : 1140/3000 graines, par exemple `q0` : « 34,44 ≈ 34,44 ».
   - pct3-20 : 268/3000, par exemple « 28,00 × 1,055 = 29,54 ≈ 29,54 ».
   - pct3-22 : 1312/3000 (t ∈ {25, 60, 100}), par exemple « c ≈ 0,8… baisse d'environ 20 % ».
   - pct3-17 `q1628` : « ≈ −9,95 », qui est exact.

   **Correctif :** écrire « = » quand `roundTo(x, 4) === roundTo(x, 2)` (ou la valeur arrondie demandée).

## QA3 — Exercices : PASS (réserves mineures)

Les 33 clés recalculées sont toutes justes. Les diagnostics ne sont jamais égaux à une réponse acceptée, y compris avec la tolérance (0 cas sur 3 000 graines × 33). Aucun doublon d'options, de jetons ou d'items. Les distracteurs de pct3-04 sont toujours distincts et pct3-33 n'a jamais de jeton en double. Les indices ne donnent pas la réponse.

1. **MINEUR — pct3-17, `q1628`.** v₁ = 2000, v₂ = 1801, donc t = −9,95 exactement. C'est un arrondi à mi-chemin : la clé attend −10 et refuse −9,9, ce qui dépend de la convention et de la calculatrice. **Correctif :** retirer les tirages où |10t| a une partie fractionnaire égale à 0,5.
2. **MINEUR — `numR` (pct3-17, 20, 22, 24, 29 ; pct3-28 étape 2).** La tolérance de ±½ unité accepte des réponses non arrondies : −12,34 pour « arrondi au dixième », ou 36,081 pour « au centime ». **Correctif :** exiger `p.decimals ≤ dec`, ou donner un crédit partiel avec le message « arrondis comme demandé ».
3. **MINEUR — pct3-23.** Le QCM n'est pas mélangé (`qcm`, pas `shuffledQcm`) : la bonne réponse est « L'offre A » (index 0) pour toutes les graines, et l'élève la devine dès la deuxième partie. **Correctif :** utiliser `shuffledQcm` et tirer au sort l'étiquette (A ou B) de l'offre « remise unique ».
4. **MINEUR — pct3-27.** Les items sont déjà dans le bon ordre pour 25/3000 graines (par exemple `q87`). **Correctif :** mélanger de nouveau tant que `order` est l'identité.
5. **MINEUR — pct3-19.** La consigne dit « (fraction irréductible) » mais 0,25 est accepté comme entièrement juste (le moteur accepte un décimal exact). **Correctif :** écrire « (fraction irréductible ou nombre décimal) », ou l'inverse selon l'intention.
6. **MINEUR — réalisme des valeurs.**
   - pct3-29 : « vélo électrique » à 40–600 € HT (`ht = int(8,120)·5`, par exemple 40 €).
   - pct3-14 : téléviseur à partir de 20 €.
   - pct3-09 : « Un vélo » à partir de 15 €.

   **Correctif :** adapter les plages (vélo électrique 800–3 000 € par pas de 50 ; téléviseur 150–1 200 €) ou changer d'objet.
7. **MINEUR — pct3-26.** Les ratios farine : sucre 2 : 3, 4 : 3 et 3 : 2 sont invraisemblables pour une pâte à crêpes (par exemple 60 g de farine pour 90 g de sucre). **Correctif :** prendre des ratios de 4 : 1 à 8 : 1, ou changer de contexte.
8. **MINEUR — niveaux.** pct3-25 et pct3-26 sont des partages en une étape (même tâche que pct3-11, niveau 2) placés au niveau 4. **Correctif :** passer pct3-26 au niveau 3, ou ajouter une contrainte (quantité imposée sur la 2ᵉ grandeur, conversion, ingrédient limitant).
9. **MINEUR — saisie des unités.** Les réponses `numerique` « (en %) » ou « (en €) » n'ont pas de `suffix` (pct3-07, 17, 22, 23, 29, 31…). Une réponse comme « 35 % » ou « 12 € » est refusée (`parseNumber` → null, « Saisie non reconnue »). **Correctif :** passer `suffix: "%"` ou `"€"` (déjà rendu par `interactions.tsx`), ou retirer `%`/`€` en fin de saisie dans `parseNumber`.

## QA4 — Jeux : NEEDS REVIEW

Calcul flash : 22 items, tous justes et lisibles ; l'adaptation fonctionne. Chasse aux erreurs : 12 items, les explications sont justes et les erreurs proposées sont mélangées. Memory : 7 paires, sans carte ambiguë.

1. **MAJEUR — `pct3-jeu-erreurs`, item niveau 1.** « Hausse de 20 % de 30 € : 30 × 0,2 = 6 € » est attendu faux. Or, lu littéralement, « la hausse de 20 % de 30 € » vaut bien 6 € : l'élève qui répond « juste » est sanctionné pour une lecture défendable. **Correctif :** « Prix de 30 € après une hausse de 20 % : 30 × 0,2 = 6 € ».
2. **MINEUR — `pct3-jeu-memory`.** La consigne dit « une évolution et son coefficient multiplicateur », mais deux paires n'ont pas de coefficient : « Doubler ↔ Hausse de 100 % » et « Ratio 3 : 1 … ↔ 75 % ». **Correctif :** soit remplacer ces paires par « Hausse de 100 % ↔ × 2 » et « −25 % puis +20 % ↔ × 0,9 » (et retirer M4-OGDF-10 des objectifs du jeu), soit élargir la consigne.
3. **MINEUR — `pct3-jeu-flash`, niveau « Calculs en euros ».** Ce niveau contient un taux en % (« de 40 € à 50 € » → 25). De plus, la question « Part de la plus petite quantité quand on partage 60 €… » est maladroite. **Correctif :** renommer le niveau « Calculs de prix et de taux » et écrire « Plus petite part (en €) quand on partage 60 € selon le ratio 1 : 2 ».

## QA5 — Technique : PASS

- `describeChapter` sur le brouillon (fichier temporaire supprimé ensuite) : 36/36. `npx tsc --noEmit` : code 0.
- Balayage de 3 000 graines par générateur : aucun NaN, `undefined` ou `Infinity` ; réponse parfaite à 100 % partout ; un QCM laissé vide vaut 0.
- Le LaTeX est compatible KaTeX (`\leqslant`, `\neq`, `{,}`, `\,\%`). Les SVG ont un `role="img"`, un `aria-label` et un `alt`.
- Statut cohérent avec un brouillon (`draft`, revues `pending`) ; le chapitre n'est pas encore inscrit au registre.

Aucun constat.

## QA6 — Langue : PASS (réserves mineures)

Le tutoiement est cohérent dans tout le contenu du chapitre. La virgule décimale est utilisée partout et `\,\%` est systématique. Aucune faute d'orthographe relevée.

1. **MINEUR — moteur (`src/lib/engine/check.ts`), hors chapitre.** Les retours génériques vouvoient (« Presque : vérifiez l'arrondi », « Votre résultat est… », « Précisez l'unité… ») et s'affichent avec ce chapitre qui tutoie : par exemple, pct3-17 avec une réponse mal arrondie. **Correctif :** harmoniser le moteur, à signaler à son responsable.
2. **MINEUR — `pct3-jeu-erreurs`, distracteur.** « C'est impossible de compenser » est un registre oral. **Correctif :** « Il est impossible de compenser cette baisse ».
3. **MINEUR — pct3-17, solution.** Le résultat « arrondi au dixième » est affiché « −10 % » ou « +12 % » quand la valeur arrondie est entière. **Correctif :** `frFixed(…, 1)`, ce qui donne « −10,0 % ».
4. **MINEUR — `prerequisites[0]`.** « (5e-4e) » s'écrit avec un tiret court (« 5e–4e »), ou mieux « (5e et 4e) ».

---

**Verdict global : NEEDS REVIEW.** Aucun bloquant ; les 2 constats MAJEURS (textes d'objectifs officiels modifiés, item ambigu de la chasse aux erreurs) sont à corriger avant publication. Les 21 constats mineurs sont recommandés.
