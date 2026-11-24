# Dossier de recherche : Thalès (configuration papillon) et triangles semblables

**Chapitre :** `math-3e-thales-semblables` · **Tâche :** SCI-3E-MATH-012 · **Arbre :** m3-thales · **Niveau :** 3e

## 1. Références officielles

- **Programme du cycle 4 (2020)**, BO n° 31 du 30-07-2020, Éduscol (`c4-programme-2020-eduscol-pdf`). Sert à la liste des six compétences (p. 129) et aux descripteurs (p. 129-130).
- **Attendus de fin d'année de 3e (2019)**, Éduscol (`c4-attendus-3e-2019-pdf`). Sources des objectifs M3-EG-03 et M3-EG-04 (p. 8). La proportionnalité pour le calcul de longueurs figure p. 5.
- **BO n° 22 du 29-05-2019**, annexe 26 (`bo-2019-22-pdf`). Repères annuels de progression ; reprise des attendus (p. 218).
- **Source Notion : inaccessible.** Aucune URL n'est disponible dans la session et le connecteur n'est pas autorisé. Ce dossier ne s'appuie donc que sur les trois textes ci-dessus.

## 2. Périmètre exigible et hors programme

**Exigible en 3e**
- Théorème de Thalès et sa réciproque, dans la configuration papillon (M3-EG-03).
- Triangles semblables : une définition (proportionnalité des longueurs des côtés) et une propriété caractéristique angulaire (M3-EG-04).
- Calculs de longueurs.

**Consolidation 4e, non exigible en 3e**
- M4-EG-05 : Thalès dans la configuration des triangles emboîtés.
- M4-EG-06 : démonstration d'un parallélisme par la réciproque.
- Ces objectifs sont marqués `required: false`, hors porte G2. Ils peuvent être réinvestis dans les problèmes sans être évalués.

**Hors programme (approfondissement signalé seulement)**
- Contraposée de Thalès (démontrer que deux droites ne sont pas parallèles). Elle n'est citée dans aucun des trois textes vérifiés. Elle reste à signaler comme approfondissement, par analogie avec PY-T07 pour Pythagore.

**Renvois vers d'autres chapitres**
- Homothéties, agrandissement-réduction et effet sur les aires : `math-3e-rotations-homotheties`, `math-4e-agrandissement-reduction`.

## 3. Prérequis

- **Proportionnalité et égalités de quotients** : utilisée pour le calcul de longueurs (attendus 3e, p. 5).
- **Résolution d'une égalité de rapports** : produit en croix, simplification, arrondis.
- **Consolidation 4e** : Thalès dans les triangles emboîtés (utile mais non obligatoire).
- **Non tirés des sources fournies, à vérifier avec le programme de 5e-6e** : somme des angles d'un triangle, angles alternes-internes et correspondants (nécessaires pour la caractérisation angulaire).

## 4. Définitions et propriétés à énoncer

**Configuration papillon.** Deux droites sécantes en A. Les points B et D sont sur la première, C et E sur la seconde, avec A entre B et D, et A entre C et E.

**Théorème de Thalès (papillon).** Si (BC) // (DE), alors
$$\frac{AB}{AD} = \frac{AC}{AE} = \frac{BC}{DE}.$$
Les points doivent rester dans le même ordre sur les deux droites.

**Réciproque.** Si les points sont dans le même ordre et que $\dfrac{AB}{AD} = \dfrac{AC}{AE}$, alors (BC) // (DE).

**Triangles semblables.** Deux triangles sont semblables lorsque leurs côtés sont deux à deux proportionnels : les longueurs des côtés homologues ont le même rapport de proportionnalité.

**Propriété caractéristique angulaire.** Deux triangles dont les angles sont deux à deux de même mesure sont semblables.

## 5. Méthodes

1. **Repérer la configuration** : identifier le point d'intersection et vérifier l'ordre des points.
2. **Écrire le rapport avec les bons côtés** : chaque rapport relie deux segments issus de A sur la même droite.
3. **Mettre l'inconnue en x** : par exemple $\dfrac{x}{6} = \dfrac{4}{5}$, avec la longueur cherchée nommée x dans l'énoncé.
4. **Résoudre par produit en croix**, puis vérifier la cohérence (longueur positive, ordre de grandeur).
5. **Pour la réciproque** : calculer les deux rapports, les comparer, et conclure sur le parallélisme seulement si l'ordre des points est respecté.

## 6. Progression en 5 niveaux

1. **Découverte** : repérer une configuration papillon sur une figure et nommer les segments correspondants.
2. **Application directe** : une égalité de rapports à compléter avec une seule inconnue.
3. **Entraînement** : calcul de longueurs dans une configuration papillon ; vérification par la réciproque.
4. **Problèmes** : triangles semblables à partir d'angles égaux ; calcul d'une longueur inaccessible.
5. **Type Brevet** : problème multi-étapes combinant Thalès, triangles semblables et calcul de longueurs, avec justification écrite.

## 7. Erreurs typiques des élèves

| Erreur | Raisonnement correct |
|---|---|
| Écrire $\dfrac{AB}{AC} = \dfrac{AD}{AE}$ (rapports croisés) | Les rapports doivent relier le même couple de droites : $\dfrac{AB}{AD} = \dfrac{AC}{AE}$. |
| Appliquer Thalès sans avoir (BC) // (DE) | On utilise le théorème seulement si le parallélisme est donné. Pour le démontrer, on utilise la réciproque avec des rapports égaux. |
| Oublier l'ordre des points (A entre B et D) | Dans la configuration papillon, le rapport se lit avec des points dans le même ordre. Si ce n'est pas le cas, on ne peut pas conclure. |
| Confondre côtés homologues et côtés quelconques | Dans des triangles semblables, le rapport se calcule entre côtés correspondants (opposés aux mêmes angles). |
| Résoudre $\dfrac{x}{6} = \dfrac{4}{5}$ en écrivant $x = 6 \times 4 - 5$ | On obtient $5x = 24$ par produit en croix, soit $x = 4{,}8$. |
| Conclure à la semblance avec deux côtés proportionnels seulement | Pour des triangles semblables, il faut la proportionnalité des trois côtés ou l'égalité de deux angles (propriété caractéristique angulaire). |

## 8. Idées d'illustrations et d'activités

- **Figures** : générateur `geometry()` de `svg.ts` (PR préalable). Points nommés, droites, étiquettes de longueur, chevrons de parallélisme, arcs d'angles égaux. Les figures sont calculées à partir des valeurs tirées, sans SVG écrit à la main.
- **Calcul-flash** : calculs rapides de quatrièmes proportionnels.
- **Chasse-erreurs** : repérer une fausse égalité de rapports dans une configuration papillon.
- **Memory** : associer une configuration à l'égalité de rapports correspondante.
- **Solveur** : `solveCheck` avec `positive: true` pour les égalités de rapports.

## 9. Points à vérifier en relecture

- La **source Notion est inaccessible**. Vérifier le contenu de la fiche Notion avant publication.
- La **propriété angulaire** et les **prérequis sur les angles** ne sont pas explicitement tirés des trois textes vérifiés. Les confirmer avec le porteur de projet.
- Confirmer que la **contraposée** reste en approfondissement signalé et n'apparaît dans aucun exercice exigible.
- Vérifier que les objectifs **M4-EG-05 et M4-EG-06** sont bien `required: false` et que leurs exercices sont étiquetés consolidation.
- Vérifier que la **PR `geometry()`** est fusionnée avant l'intégration des figures.
- Vérifier que toutes les égalités de rapports sont écrites avec x et que `solveCheck` est déclaré avec `positive: true`.
- Contrôler que les **arrondis** suivent la convention du chapitre (virgule décimale dans LaTeX : `{,}`).
- Relire les **six compétences** et leurs descripteurs (programme 2020, p. 129-130) pour chaque exercice.
