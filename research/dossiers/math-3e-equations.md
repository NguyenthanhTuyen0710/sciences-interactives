# Dossier de recherche — Équations : premier degré, produit nul, x² = a

**Chapitre** : `math-3e-equations` · **Tâche** : SCI-3E-MATH-004 · **Niveau** : 3e · **Arbre** : m3-equations
**Statut** : brouillon, relecture en attente (`reviewStatus` : pending, `publicationStatus` : draft)

---

## 1. Références officielles

Seules les trois sources vérifiées sont retenues :

- **[S1]** Programme du cycle 4 en vigueur à la rentrée 2020 (BOEN n° 31 du 30-07-2020), Éduscol. Citations utilisées : p. 129-130 (compétences), p. 131 (objectif M3-NC-12), p. 132 (objectifs M3-NC-13 et M3-NC-14, annulation d'un produit). SHA-256 `de42e981…1194b9`, consulté le 2026-11-07.
- **[S2]** Mathématiques 3e, attendus de fin d'année (2019), Éduscol. Utilisé pour la formule « équations de la forme x = a sur des exemples simples » (p. 3). SHA-256 `49ccdca4…f545a`, consulté le 2026-11-07.
- **[S3]** BO n° 22 du 29-05-2019, annexe 26 (repères annuels de progression, cycle 4). Source des repères « Équations (3e) » et « Équations (4e) ». SHA-256 `59c3cdd3…36065`, consulté le 2026-11-07.

**Source Notion** : non disponible (`SOURCE_INACCESSIBLE`, pas d'URL dans la session, connecteur non autorisé). Aucune information issue de Notion n'est utilisée ici.

---

## 2. Périmètre exigible et hors programme

**Exigible en 3e** (approuvé le 2026-11-24) :
- M3-NC-12 : résoudre des équations du premier degré et des problèmes s'y ramenant.
- M3-NC-13 : résoudre des équations produits nuls, après factorisation.
- M3-NC-14 : résoudre des équations du type x² = a sur des exemples simples.

**Consolidation (4e), non exigibles en 3e** : M4-NC-19 (désigner une inconnue, mettre en équation), M4-NC-20 (tester une solution), M4-NC-21 (résoudre algébriquement une équation du premier degré). Ces objectifs sont marqués `required: false` et restent hors porte G2. Ils peuvent servir de rappels, sans être évalués.

**Hors programme** :
- **Inéquations** : aucune occurrence dans les textes vérifiés. Décision 28 : aucun exercice, exemple, méthode, corrigé ni jeu. Le type EQ-T09 est exclu. Au plus une phrase de cours signale qu'elles ne sont pas au programme de 3e.
- **Équations du second degré générales** et **formule du discriminant** (lycée).

**Factorisation** (identités remarquables, facteur commun) : prérequis du chapitre calcul littéral, réutilisé ici.

---

## 3. Prérequis

- Calcul littéral : réduction, développement, factorisation (facteur commun, a² − b²).
- Calcul sur les nombres relatifs et les fractions simples.
- Racine carrée d'un nombre positif (notion citée dans les notions de M3-NC-14).
- Notion d'inconnue et de solution, même si la formalisation de M4-NC-19 et M4-NC-20 est en consolidation.

---

## 4. Définitions et propriétés à énoncer

- **Équation** : égalité entre deux expressions contenant une inconnue. **Solution** : valeur de l'inconnue qui rend l'égalité vraie.
- **Équation du premier degré** : ramenable à la forme $ax + b = 0$ (ou $ax = b$), avec $a \neq 0$. Elle a une unique solution $x = -\dfrac{b}{a}$.
- **Transformations conservant l'égalité** : ajouter ou soustraire un même nombre aux deux membres ; multiplier ou diviser les deux membres par un même nombre non nul.
- **Annulation d'un produit** ([S1] p. 132) : un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul. Démonstration possible par disjonction de cas. Donc $A \times B = 0 \iff A = 0$ ou $B = 0$.
- **Équation $x^2 = a$** :
  - si $a < 0$, pas de solution ;
  - si $a = 0$, unique solution $x = 0$ ;
  - si $a > 0$, deux solutions $x = \sqrt{a}$ et $x = -\sqrt{a}$.

---

## 5. Méthodes

**Premier degré** : isoler les termes en $x$ d'un côté, les nombres de l'autre, puis diviser par le coefficient. Vérifier en remplaçant $x$ dans l'équation de départ (test de solution, M4-NC-20).

**Mise en équation** (M3-NC-12, M4-NC-19) : désigner l'inconnue par une lettre et préciser son sens, traduire les données en égalité, résoudre, puis vérifier que la solution a un sens dans le contexte (longueur positive, nombre entier, etc.).

**Produit nul** : factoriser d'abord, en utilisant le prérequis. Écrire $A \times B = 0$, puis résoudre $A = 0$ et $B = 0$ séparément. Ne jamais diviser par l'inconnue pour « simplifier » : cela fait perdre des solutions.

**$x^2 = a$** : discuter selon le signe de $a$, puis écrire **les deux** racines lorsque $a > 0$.

---

## 6. Progression en 5 niveaux

1. **Découverte** : tester si un nombre est solution ; compléter une égalité ; lire une équation comme une balance.
2. **Application directe** : résoudre $ax + b = c$ ; factoriser puis annuler un produit ; résoudre $x^2 = a$ avec $a$ donné.
3. **Entraînement** : équations avec inconnue des deux côtés ; produits nuls après facteur commun ou a² − b² ; discussion selon le signe de $a$.
4. **Problèmes** : mise en équation d'un problème géométrique ou numérique, résolution, interprétation de la solution.
5. **Type Brevet multi-étapes** : problème à plusieurs étapes (mise en équation, factorisation, résolution, interprétation), avec vérification finale.

---

## 7. Erreurs typiques des élèves (avec le raisonnement correct)

| Erreur observée | Raisonnement correct |
|---|---|
| Pour $x^2 = 9$, écrire seulement $x = 3$. | Les deux nombres dont le carré vaut 9 sont 3 et −3 : il faut $x = 3$ ou $x = -3$. |
| Pour $x^2 = 9$, conclure « $x = \sqrt{9}$ » et s'arrêter là. | Même raisonnement : $\sqrt{9}$ est la racine positive ; l'équation admet aussi $-\sqrt{9}$. |
| Pour $x^2 = -4$, écrire « $x = \sqrt{-4}$ ». | $\sqrt{-4}$ n'est pas défini dans les nombres du collège ; un carré est positif ou nul, donc il n'y a aucune solution. |
| Pour $(x-2)(x+5) = 0$, écrire $x = 2$ et $x = 5$. | Il faut résoudre $x - 2 = 0$ (donc $x = 2$) et $x + 5 = 0$ (donc $x = -5$). Le signe du second facteur est inversé dans l'erreur. |
| Pour $x^2 = 3x$, diviser par $x$ et trouver $x = 3$ seulement. | Ramener à $x^2 - 3x = 0$, soit $x(x - 3) = 0$ : les solutions sont $x = 0$ et $x = 3$. Diviser par $x$ fait perdre la solution $x = 0$. |
| Pour $(x-1)(x+2) = 0$, développer puis essayer de résoudre sans factoriser. | Le produit est déjà factorisé : on applique directement l'annulation d'un produit. |
| En mise en équation, oublier la vérification du sens de la solution (par exemple une longueur négative). | Une solution mathématique doit être vérifiée dans le contexte : on garde seulement les valeurs compatibles avec le problème. |
| Passer un terme dans l'autre membre sans changer son signe. | Ajouter ou soustraire le même nombre aux deux membres conserve l'égalité ; le signe change parce que l'opération est inversée des deux côtés. |

---

## 8. Idées d'illustrations et d'activités

- **Balance** : représenter une équation comme une égalité de plateaux ; retirer ou ajouter la même masse des deux côtés.
- **Aire d'un carré** : « un carré d'aire 25 cm² a un côté de longueur ? » pour introduire $x^2 = a$, avec la question de la seconde solution.
- **Factorisation puis annulation** : un tableau de valeurs de $(x-2)(x+5)$ montrant que le produit s'annule en $2$ et en $-5$.
- **Mise en équation** : deux rectangles de périmètres égaux, ou un partage d'une somme entre plusieurs personnes.
- **Jeux de la plateforme** :
  - `calcul-flash` : résolution rapide de premier degré (niveaux 1 à 3) ;
  - `chasse-erreurs` : repérer une erreur de racine ou de signe dans une résolution corrigée (niveau 2 et 3) ;
  - `memory` : associer une équation à sa forme résolue ou à son ensemble de solutions.

---

## 9. Points à vérifier en relecture

1. **Notion inaccessible** : aucune comparaison avec les notes Notion du chapitre n'a été faite. La relecture doit confirmer qu'aucune exigence n'y est omise.
2. **Exposant perdu à l'extraction** : dans [S1] p. 132 et [S2] p. 3, « x2 » désigne x². Vérifier la citation dans le PDF d'origine avant publication.
3. **Objectifs 4e** : M4-NC-19 à M4-NC-21 sont en consolidation, `required: false`. Vérifier qu'aucun exercice n'en fait un attendu évalué.
4. **Inéquations** : vérifier l'absence totale d'exercice, de méthode, de corrigé et de jeu sur les inéquations ; une seule phrase de cours est autorisée.
5. **Exemple de référence** : le fichier `math-3e-calcul-litteral.ts` n'a pas été fourni ; vérifier la cohérence de la prose, des notations (virgule décimale `{,}`, tutoiement) et des helpers.
6. **Décision 22** : le tour de correction sur les constats du juge reste désactivé ; le chapitre s'arrête après le premier juge.
7. **Effort de réflexion** : chapitre à effort low (décision 28) ; relire les corrigés avec soin, car le raisonnement interne est limité.
8. **Validation des compétences** : classification « validé » par Claude Code, puis validée par Nguyễn Thanh Tuyền le 2026-11-24. Vérifier que la mention « toValidate » ne reste pas active.
