# Dossier de recherche — Mathématiques 3e : « Arithmétique »

- **Tâche :** SCI-3E-MATH-001 — chapitre `math-3e-arithmetique` (arborescence `m3-arithmetique`)
- **Date :** 2026-11-06 (année scolaire 2026-2027)
- **Programme applicable en 3e :** programme du cycle 4 de 2020 (BO n° 31 du 30 juillet 2020) + repères annuels de progression et attendus de fin d'année (BO n° 22 du 29 mai 2019). Le programme 2026 (BO n° 10 du 5 mars 2026) ne s'appliquera en 3e qu'à la rentrée 2028 : il n'est pas utilisé ici.
- **Sources :** inventaire A1 (`research/curriculum/mathematiques/curriculum-math.json`, sources S5, S6, S7, S8) ; aucune source web n'a été retéléchargée. Source Notion du porteur de projet : `SOURCE_INACCESSIBLE` (URL absente de la session, voir `manifest-3e.json`).

## 1. Périmètre officiel

| ID | Objectif (paraphrase) | Référence |
|---|---|---|
| M3-NC-01 | Décomposer un entier en produit de facteurs premiers, à la main ou avec un outil numérique | Attendus 3e (2019) › Divisibilité et nombres premiers |
| M3-NC-02 | Rendre une fraction irréductible | Repères 2019 (3e) › Divisibilité ; attendus 3e |
| M3-NC-03 | Modéliser et résoudre des problèmes de divisibilité (engrenages, conjonction de phénomènes) | Attendus 3e (2019) |
| M4-NC-12 | Liste des nombres premiers inférieurs à 100 (**consolidation de 4e**) | Repères 2019 (4e) ; attendus 4e |

Prérequis : division euclidienne (cycle 3), multiples/diviseurs et critères (2, 3, 5, 9, 10), définition d'un nombre premier et décomposition (4e), puissances d'exposant positif (4e), calcul fractionnaire (4e).

## 2. Hors programme / points de vigilance
- Les sigles **PGCD** et **PPCM** ne sont pas exigibles : le chapitre parle de « plus grand diviseur commun » et de « plus petit multiple commun » et les présente comme outils, avec la mention « parfois noté ».
- Algorithme d'Euclide, algorithme des soustractions successives : non exigibles (non traités).
- Nombre de diviseurs par formule $(a+1)(b+1)\dots$ : non exigible (on compte par paires).
- Unicité de la décomposition : **admise**.

## 3. Définitions et propriétés retenues
- $a$ multiple de $b$ ⇔ il existe un entier $k$ tel que $a = b \times k$ (reste nul).
- Nombre premier : exactement deux diviseurs (donc $1$ exclu ; $2$ seul premier pair).
- Test de primalité : tester les premiers $p$ avec $p^2 \le n$.
- Plus grand diviseur commun : facteurs communs, plus petits exposants ; plus petit multiple commun : tous les facteurs, plus grands exposants ; diviseurs communs = diviseurs du plus grand diviseur commun.
- Fraction irréductible : numérateur et dénominateur sans diviseur commun autre que 1 ; diviser par le plus grand diviseur commun la rend irréductible.

## 4. Méthodes et progression
Critères → diviseurs par paires → nombres premiers (crible) → divisions successives → simplification par décompositions → problèmes de partage (diviseur commun) → problèmes de rencontre (multiple commun) → problèmes type Brevet rédigés.

## 5. Erreurs typiques (diagnostiquées dans les exercices et les jeux)
1 considéré comme premier ; « impair donc premier » (91, 57, 51) ; facteur non premier dans une décomposition (4, 6, 15) ; simplification incomplète ; « simplifier » des termes d'une somme ; « divisible par 4 et 6 donc par 24 » ; confusion diviseur commun / multiple commun ; produit $a \times b$ pris pour le plus petit multiple commun ; oubli de 1 et du nombre dans la liste des diviseurs ; contour fermé : nombre d'arbres = nombre d'intervalles.

## 6. Contextes de problèmes (originaux)
Bouquets, boîtes de confiseries, carrelage sans découpe, phares, lignes de bus, engrenages, cyclistes sur piste, choristes (encadrement), plantation autour d'un terrain, fraction d'un effectif.
