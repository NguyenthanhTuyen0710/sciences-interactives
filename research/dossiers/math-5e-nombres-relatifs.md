# Dossier de recherche — Mathématiques 5e : « Nombres relatifs »

- **Tâche :** SCI-5E-MATH-001
- **Auteur :** Agent A2 (spécialiste recherche mathématiques)
- **Date de rédaction :** 2026-11-06 (année scolaire 2026-2027)
- **Programme de référence :** programme de mathématiques du cycle 4, arrêté du 18 février 2026, publié au BO n° 10 du 5 mars 2026. Il s'applique en 5e depuis la rentrée 2026, en 4e à la rentrée 2027 et en 3e à la rentrée 2028.
- **Statut des sources :** la page du BO sur education.gouv.fr renvoie HTTP 403 (blocage Cloudflare) aux requêtes automatisées. Le texte de l'annexe 2 a été lu dans **deux reproductions académiques identiques octet pour octet** (académies de Corse et de Besançon). Voir §1.1 et §8.

> Convention : un objectif est marqué **verified** seulement si je l'ai lu moi-même dans le texte de l'annexe 2, sous une reproduction académique fidèle (fichier PDF ministériel rediffusé tel quel). Les autres sont marqués **inferred** (déduction) ou **unverified**.

---

## 1. Références officielles et périmètre exact en 5e

### 1.1 Références

| # | Référence | URL | Date | Statut d'accès / vérification |
|---|---|---|---|---|
| R1 | BO n° 10 du 5 mars 2026 — arrêté fixant le programme du cycle 4 (NOR MENE2602912A, d'après le brief) | https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A | 05/03/2026 | **HTTP 403** (page Cloudflare « Attention Required », 2026-11-06). Non contourné. Le NOR n'a pas pu être vérifié par lecture directe. |
| R2 | « Annexe 2 – Programme de mathématiques pour le cycle 4 » (PDF de 20 pages, métadonnées de création du 19/02/2026), reproduction de l'académie de Corse | https://sites.ac-corse.fr/maths/wp-content/uploads/sites/18/2026/03/Annexe-2-–-Programme-de-mathematiques-pour-le-cycle-4-480716-2.pdf (article : https://sites.ac-corse.fr/maths/2026/03/05/nouveau-programme-pour-le-cycle-4/) | publié le 05/03/2026 | **Lu intégralement** pour les parties utiles. C'est le texte de référence de ce dossier. |
| R2bis | Même annexe, reproduction de l'académie de Besançon (« B.O. n° 10 du 5 mars 2026 ») | https://mathematiques.ac-besancon.fr/wp-content/uploads/sites/45/2026/04/Programme-de-mathematiques-Cycle-4-2026.pdf (article du 17/04/2026) | 17/04/2026 | **Identique octet pour octet à R2** (vérifié avec `cmp`). Elle confirme le rattachement au BO n° 10 et le calendrier 5e 2026, 4e 2027, 3e 2028. |
| R3 | « Exemples pour la mise en œuvre des programmes – Cycle 4 – Mathématiques – 2026 » (51 pages, « exemples de réussite et conseils de mise en œuvre ») | Corse : https://sites.ac-corse.fr/maths/wp-content/uploads/sites/18/2026/03/exemple-mise-en-oeuvre-c4-mathematiques.pdf · Besançon : https://mathematiques.ac-besancon.fr/wp-content/uploads/sites/45/2026/04/Exemple-mise-en-oeuvre-c4-mathematiques0pdf-126080.pdf | 2026 | **Lu.** Les deux fichiers diffèrent en binaire, mais la section « Nombres relatifs » est textuellement identique. Ce document d'accompagnement n'a pas valeur réglementaire. La page Éduscol qui devrait l'héberger renvoie 403. |
| R4 | Nancy-Metz : « Webinaire Programmes Cycle 4 – Focus 5° » (IA-IPR, webinaires du 8 et du 29 juin 2026) | https://sites.ac-nancy-metz.fr/mathematiques/wp-content/uploads/Webinaire-Programmes-Cycle-4-Focus-5°.pdf | 01/07/2026 | **Lu.** Il annonce « Les nombres relatifs en 5° et 4° (consolidation en 3°) » et place la « Valeur absolue » dans le « Focus 5° ». |
| R5 | Bordeaux : « Le programme de 5e » et « Présentation des nouveaux programmes de Cycle 4 » | https://ent2d.ac-bordeaux.fr/disciplines/mathematiques/wp-content/uploads/sites/3/2026/07/Le-programme-de-5e.pdf et …/Presentation-des_nouveaux_programmes_de_Cycle_4.pdf | 07/2026 | **Non accessibles :** certificat TLS du serveur expiré (curl : « certificate has expired »), puis 503 avec WebFetch. La vérification TLS n'a pas été désactivée. Non lus. |
| R6 | Normandie : « nvx_programmes_cycle_4_rs_2026.pdf » | https://mathematiques.ac-normandie.fr/IMG/pdf/nvx_programmes_cycle_4_rs_2026.pdf | 05/2026 (d'après le moteur de recherche) | **Non accessible :** connexion réinitialisée par le proxy à deux reprises, puis 503. Seul un résumé du moteur de recherche est disponible : présentation générale, sans détail sur les relatifs. Non utilisé comme preuve. |
| R7 | Programme de mathématiques du cycle 3 (annexe ministérielle, arrêté du 10 avril 2025, BO n° 16 du 17 avril 2025) | https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf (redirection depuis ensel620_annexe2-v2.pdf) | PDF du 16/04/2025 | **Lu.** Ce fichier statique a été servi directement par education.gouv.fr (HTTP 200). Il sert pour les prérequis de 6e. |
| R8 | Éduscol : « Exemples pour la mise en œuvre des programmes – 6e – Mathématiques – Exemples de réussite – 2025 » | https://eduscol.education.fr/document/64878/download | 2025 | **Lu** pour les extraits concernant la demi-droite graduée et les décimaux. |

### 1.2 Où se trouve le contenu « relatifs » dans le programme

- **Préambule « Nombres et calculs », cycle 4** (R2 p. 6). Les nombres relatifs sont introduits pour rendre **toutes les soustractions possibles**. Les opérations sont construites **progressivement**. Une **pratique routinière des calculs additifs et soustractifs** doit permettre de se détacher des contextes familiers : c'est un **préalable** à la multiplication et à la division (donc après la 5e).
- **5e, « Nombres et calculs », rubrique « Nombres relatifs »** (R2 p. 7). Elle comprend des automatismes, 13 objectifs d'apprentissage et un prolongement historique (Brahmagupta).
- **5e, « Espace et géométrie », rubrique « Repérage sur une droite et dans le plan »** (R2 p. 12). Droite graduée et plan muni d'un repère orthogonal.
- **4e, « Opérations sur les nombres relatifs »** (R2 p. 9). Multiplication, division et enchaînements des quatre opérations : tout cela est **hors 5e**.

### 1.3 Objectifs 5e (paraphrasés, avec les termes clés officiels entre guillemets)

| ID | Objectif (paraphrase) | Source | Statut |
|---|---|---|---|
| M5-REL-01 | « Définir les nombres relatifs » : nombres positifs et négatifs, signe, partie numérique. | R2 p. 7, 5e > Nombres relatifs, objectif 1 | verified |
| M5-REL-02 | « Définir l'opposé » d'un nombre. Dans R3, l'opposé de a est l'unique b tel que a + b = 0, noté –a. On en déduit –(–a) = a. L'élève remarque que **–a n'est pas toujours négatif**. | R2 p. 7, obj. 2 ; R3 p. 11 | verified |
| M5-REL-03 | « Définir … la valeur absolue » : a si a ≥ 0, –a si a ≤ 0, illustrée par des exemples et lue sur la droite graduée. **Le terme est introduit mais ne fait pas l'objet d'exercices dédiés. La notation \|a\| n'est pas exigible** (R3). | R2 p. 7, obj. 2 ; R3 p. 11 ; R4 (« Valeur absolue » en Focus 5°) | verified |
| M5-REL-04 | Définir positif, **strictement** positif, négatif, **strictement** négatif. | R2 p. 7, obj. 3 | verified |
| M5-REL-05 | Utiliser les relatifs pour représenter des grandeurs qui peuvent être inférieures à zéro (température, temps, altitude, etc.), en particulier en résolution de problèmes. | R2 p. 7, obj. 4 | verified |
| M5-REL-06 | Lire l'abscisse d'un nombre relatif sur une droite graduée et placer un nombre relatif d'abscisse donnée. La demi-droite graduée de 6e est complétée **par symétrie** en droite graduée, avec des décimaux relatifs **simples** (R3). | R2 p. 7, obj. 5 ; R2 p. 12 (Repérage) ; R3 p. 11 et p. 23 | verified |
| M5-REL-07 | Dans le plan muni d'un repère orthogonal, lire les coordonnées d'un point et placer un point de coordonnées données. Vocabulaire attendu : origine, axes, coordonnées, abscisse, ordonnée. Les notions sont réinvesties en données et en fonctions. | R2 p. 12 (Espace et géométrie, 5e) ; R3 p. 23 | verified. Les coordonnées négatives sont **inferred** : R3 demande de « faire le lien avec l'étude des nombres relatifs », et les automatismes de 4e portent sur des abscisses relatives. |
| M5-REL-08 | Comparer et ranger dans l'ordre croissant ou décroissant des **décimaux relatifs**. Comparer deux nombres à l'aide de leur **signe** et de leur **valeur absolue**. Verbaliser un écart (« –7, c'est 2 de moins que –5 »). La droite graduée sert d'appui. | R2 p. 7, obj. 6 ; R3 p. 11 | verified |
| M5-REL-09 | Additionner **deux** décimaux relatifs. | R2 p. 7, obj. 7 | verified |
| M5-REL-10 | Additionner **plusieurs** décimaux relatifs, par exemple en regroupant les termes positifs, les termes négatifs et les opposés. | R2 p. 7, obj. 8 ; R3 p. 11-12 | verified |
| M5-REL-11 | Soustraire deux décimaux relatifs. L'élève établit que **soustraire un nombre revient à additionner son opposé**. | R2 p. 7, obj. 9 ; R3 p. 12 | verified |
| M5-REL-12 | Connaître et justifier les situations où les **parenthèses sont indispensables** au sens d'une écriture. Distinguer les trois rôles du signe « – » : marque du nombre négatif, soustraction, opposé. | R2 p. 7, obj. 10 ; R3 p. 12 | verified |
| M5-REL-13 | Simplifier l'écriture de sommes comportant des parenthèses, par exemple (–3) + (–4) – (+5) – (–2) = –3 – 4 – 5 + 2. | R2 p. 7, obj. 11 ; R3 p. 12 | verified |
| M5-REL-14 | Enchaîner additions et soustractions de décimaux relatifs. | R2 p. 7, obj. 12 | verified |
| M5-REL-15 | Résoudre des problèmes mobilisant l'addition et la soustraction de décimaux relatifs : bilan de deux variations, application d'une variation à un état (R3). | R2 p. 7, obj. 13 ; R3 p. 11 | verified |
| M5-REL-A1 | **Automatismes** associés : additionner, soustraire et multiplier des décimaux (positifs) à une ou deux décimales. Compléter une addition à trou par une soustraction (2 + … = 7 se complète par 7 – 2). | R2 p. 7, Automatismes | verified |
| M5-REL-A2 | **Automatismes** du repérage : placer et repérer un décimal sur une demi-droite graduée (entretien de la 6e). | R2 p. 12 | verified |
| M5-REL-H1 | Prolongement facultatif : premières apparitions des nombres négatifs chez Brahmagupta (vers 600), dont l'existence était encore niée au XVIIe siècle. | R2 p. 7 | verified (facultatif) |

**Liens avec d'autres chapitres de 5e (même annexe R2) :**
- **Opérations** (5e) : priorités opératoires, expressions avec parenthèses, termes et facteurs. Ces apprentissages sont faits avec des décimaux positifs, mais le vocabulaire « somme, terme » sert pour les relatifs.
- **Calcul littéral** (5e) : substitution, formules, équations x + b = c résolues par opération inverse. R3 relie –a à ce chapitre (–a n'est pas forcément négatif).
- **Fonctions** (5e) : programmes de calcul, graphique d'une grandeur en fonction d'une autre. Le repère y est réinvesti.
- **Transformations** (5e) : demi-tour et symétrie centrale. Le lien opposé ↔ symétrique par rapport à l'origine relève de l'idée didactique, **pas d'une exigence**.
- **Statistiques** : températures, écarts. Interdisciplinarité : géographie (altitudes, fuseaux horaires), physique-chimie (températures), histoire (frise avant/après J.-C.).

---

## 2. Hors programme en 5e (à ne pas enseigner ni évaluer)

| Notion | Où elle se trouve | Source |
|---|---|---|
| **Multiplication** de deux relatifs, règle des signes. Elle s'introduit en 4e, d'abord avec un seul facteur négatif, puis deux facteurs négatifs via la distributivité. | 4e, Opérations sur les nombres relatifs | R2 p. 9 ; R3 p. 15 |
| **Division** de deux relatifs et quotient de relatifs | 4e | R2 p. 9 |
| **Enchaînements des quatre opérations** avec des relatifs (priorités avec produits ou quotients de négatifs) | 4e | R2 p. 9 |
| Nombres rationnels relatifs : rationnel défini comme quotient d'entiers relatifs, opposé d'un rationnel, fractions négatives | 4e | R2 p. 9 ; R3 p. 15-16 |
| Opposé d'une expression littérale, par exemple –(4x – 2) = –4x + 2 | 4e (calcul littéral et exemples) | R3, partie 4e |
| Puissances d'exposant négatif | 3e (exposants négatifs rencontrés via les puissances de dix en 4e) | R2 |
| Équation x² = a avec a < 0 | 3e | R3 |
| **Notations des ensembles ℕ, ℤ, 𝔻, ℚ** | « Prolongement possible » de **3e** seulement | R2 p. 9-10 (3e) |
| **Exercices dédiés à la valeur absolue et notation \|a\|** | Terme introduit en 5e, sans exercice dédié, notation non exigible | R3 p. 11 |
| Fractions négatives et additions de fractions de signes différents | Non prévu en 5e : les fractions de 5e sont positives | R2 p. 7-8 (inferred) |
| Substituer des valeurs négatives dans des expressions contenant des produits (par exemple 3x pour x = –2) | Cela demanderait la multiplication des relatifs, donc à éviter en 5e | inferred de R2 |

> ⚠ **Risque de sur-enseignement constaté :** certaines ressources ouvertes de 5e (par exemple le TD « Nombres relatifs » de math93, version 2026-2027) incluent les ensembles ℕ, ℤ, 𝔻, les notations ∈/∉ et la notation |a| avec des exercices dédiés, jusqu'à des « défis » avec |π – 3|. **C'est au-delà du programme 5e 2026** : les ensembles relèvent d'un prolongement de 3e, et |a| est non exigible sans exercice dédié. À exclure de la plateforme, ou à baliser « pour aller plus loin » sans évaluation.

---

## 3. Prérequis (cycle 3, programme 2025, appliqué en 6e depuis la rentrée 2025)

Source principale : R7 (annexe cycle 3, partie 6e, p. 14) et R8.

| Prérequis | Référence | Remarque pour la plateforme |
|---|---|---|
| Placer un point d'abscisse décimale sur une **demi-droite** graduée et repérer un décimal sur une demi-droite graduée (graduation adaptée aux nombres) | R7, 6e « nombres entiers et décimaux » ; R8 | En 6e, **pas de partie négative** : la 5e prolonge par symétrie. |
| Comparer et ordonner des décimaux, signes ⩽ et ⩾ (introduits en 6e), encadrer et intercaler | R7 ; R8 | Base de M5-REL-08. Erreurs persistantes du type « 2,15 > 2,5 », qui se transposent aux négatifs. |
| Additionner et soustraire des décimaux, mentalement ou en posant | R7 | Base du calcul sur les parties numériques. |
| Sens de la soustraction comme **écart** et comme **complément** ; additions à trous | R7 (CM, 6e), automatisme 5e R2 | Indispensable pour la soustraction des relatifs (« ce qu'il faut ajouter à b pour obtenir a »). |
| Calculs avec une ou deux paires de parenthèses | R7 (CM1, CM2) | Lecture de (–3) + (–4). |
| Lecture de tableaux et de courbes, points dans un repère (premier quadrant) | R7 (CM1, CM2, 6e : organisation et gestion de données) | Le repère complet à quatre quadrants est nouveau en 5e. |
| Symétrie axiale (6e) | R7 | Appui pour l'image « miroir » de la droite graduée autour de 0. |
| Vocabulaire du thermomètre, de l'altitude et des dates (contextes vécus) | Expérience quotidienne et autres disciplines | Les élèves connaissent souvent « –5 °C » avant la 5e. |

**À vérifier au diagnostic d'entrée :** lecture d'une graduation dont le pas n'est pas 1 (0,5 ; 0,2 ; 2 ; 5), comparaison de décimaux, compléments à 10 et à 100, soustraction comme écart.

---

## 4. Définitions et propriétés à enseigner (rédaction propre, en français)

> Dans ce niveau, les nombres manipulés sont des **décimaux relatifs**. Formulations « niveau élève 5e », avec entre crochets les conditions à respecter.

**D1 — Nombre relatif.** Un nombre relatif est un nombre muni d'un signe : « + » pour les nombres positifs, « – » pour les nombres négatifs. Il s'écrit avec un signe et une partie numérique (sa distance à zéro). Le signe + est souvent omis : +3 = 3. Le nombre 0 est le seul nombre qui est à la fois positif et négatif.

**D2 — Positif, négatif, strictement.**
- Un nombre est **positif** s'il est supérieur ou égal à 0, et **strictement positif** s'il est supérieur à 0.
- Un nombre est **négatif** s'il est inférieur ou égal à 0, et **strictement négatif** s'il est inférieur à 0.
- [Convention française : 0 est positif **et** négatif, mais ni strictement positif ni strictement négatif.]

**D3 — Droite graduée, abscisse.** Une droite graduée est une droite munie d'une origine O (d'abscisse 0), d'un sens (de gauche à droite en général) et d'une unité reportée régulièrement des deux côtés de O. À chaque point correspond un nombre relatif, son **abscisse** : positive à droite de O, négative à gauche. [Le pas de graduation n'est pas forcément 1.]

**D4 — Opposé.** Deux nombres sont **opposés** si leur somme est égale à 0. L'opposé de a se note –a.
- Propriétés : –(–a) = a ; l'opposé de 0 est 0.
- Deux nombres opposés ont la même distance à zéro et des signes contraires (sauf 0).
- Sur une droite graduée, les points d'abscisses a et –a sont symétriques par rapport à l'origine.
- [–a est négatif seulement si a est positif. Par exemple, si a = –4, alors –a = 4.]

**D5 — Valeur absolue (« distance à zéro »).** La valeur absolue d'un nombre a est égale à a si a est positif, et à –a si a est négatif. C'est la distance entre l'origine et le point d'abscisse a ; elle est toujours positive. Exemples : la valeur absolue de –3,5 est 3,5 ; celle de 2 est 2 ; celle de 0 est 0.
- [En 5e, le **terme** est introduit. L'expression « distance à zéro » est une aide intuitive qui ne figure pas dans le texte officiel. La notation |a| est non exigible et ne fait pas l'objet d'exercices dédiés.]

**P1 — Comparaison.** Sur une droite graduée orientée de gauche à droite, le plus petit de deux nombres est celui dont le point est le plus à gauche. En conséquence :
- (a) un nombre négatif est inférieur à un nombre positif ;
- (b) entre deux nombres positifs, le plus grand est celui qui a la plus grande valeur absolue ;
- (c) entre deux nombres **négatifs**, le plus grand est celui qui a la **plus petite** valeur absolue. Par exemple, –2,3 > –4,1.

**P2 — Somme de deux relatifs de même signe.** La somme garde ce signe commun, et sa valeur absolue est la somme des valeurs absolues. Exemple : (–6) + (–9) = –(6 + 9) = –15.
- Justification suggérée par R3 : (–6) + (–9) + 6 + 9 = 0, donc (–6) + (–9) est l'opposé de 15.

**P3 — Somme de deux relatifs de signes contraires.** La somme prend le signe de celui qui a la plus grande valeur absolue. Sa valeur absolue est la **différence** des valeurs absolues (la plus grande moins la plus petite). Exemple : 6 + (–9) = –3.
- Justification : 6 + (–9) = 6 + (–6) + (–3) = 0 + (–3).
- Cas particulier : la somme de deux opposés vaut 0.

**P4 — Soustraction.** Soustraire un nombre relatif revient à **additionner son opposé** : a – b = a + (–b). Exemples : 3,1 – (–2) = 3,1 + 2 = 5,1 ; 4 – 7 = 4 + (–7) = –3.
- [Cette règle ne s'applique qu'au nombre soustrait : le premier terme ne change pas.]
- Interprétation : b – a est le déplacement (avec son signe) qui mène du point a au point b. C'est l'**écart orienté** ou la variation : « valeur finale – valeur initiale ».

**P5 — Sommes de plusieurs termes.** Pour une suite d'additions, on peut changer l'ordre des termes et les regrouper (commutativité, associativité) : regrouper les positifs, les négatifs, les opposés.
- [Avant de réordonner, transformer les soustractions en additions des opposés. L'ordre d'une soustraction ne peut pas être changé : 5 – 3 ≠ 3 – 5.]

**P6 — Écriture simplifiée.** Une fois toutes les soustractions transformées en additions, on peut supprimer les signes « + » d'addition et les parenthèses autour des nombres. Exemple : (–3) + (–4) + (–5) + (+2) s'écrit –3 – 4 – 5 + 2.
- Lecture : chaque nombre est lu avec le signe qui le précède comme un terme relatif d'une somme.

**P7 — Parenthèses indispensables.**
- Un nombre négatif placé juste après un signe opératoire doit être entre parenthèses : on écrit 3 + (–2) et non « 3 + –2 ».
- –(2 + 3) = –5 est différent de –2 + 3 = 1.
- –(–2) = 2 ; –(2 – 3) = 1.
- Distinguer les trois rôles de « – » : signe d'un nombre (–2), opération (5 – 2), opposé (–a, –(–2)).

**P8 — Repère du plan.** Un repère orthogonal est formé de deux droites graduées perpendiculaires de même origine O : l'axe des abscisses (horizontal) et l'axe des ordonnées (vertical). Un point M est repéré par un couple (x ; y), toujours dans l'ordre abscisse puis ordonnée. [Les unités des deux axes peuvent être différentes.]

---

## 5. Types d'exemples travaillés et progression (5 niveaux)

| Niveau | Intention | Types de tâches (descriptions, pas d'exercices recopiés) |
|---|---|---|
| **1. Découverte** | Donner du sens aux négatifs | Lire des températures sur un thermomètre vertical. Repérer des étages en sous-sol, des altitudes sous le niveau de la mer, des dates avant et après J.-C. Classer des situations : « peut-on avoir une valeur inférieure à zéro ? ». Compléter une droite graduée à partir de la demi-droite de 6e (symétrie). Écrire 3 – 5 en contexte (« j'ai 3, je dois 5 ») pour faire naître le besoin de –2. |
| **2. Application directe** | Vocabulaire et repérage | Lire et placer des abscisses entières, puis des décimaux simples (pas de 1, puis 0,5, puis 0,2). Donner l'opposé et la valeur absolue en s'appuyant sur la droite. Trier positif, strictement positif, etc., avec 0 comme cas piège. Lire et placer des points dans les quatre quadrants. Comparer deux relatifs avec support graphique. |
| **3. Entraînement / technique** | Automatiser les règles | Ranger 5 à 8 décimaux relatifs (mêmes parties entières, nombres de décimales différents). Sommes de deux relatifs, d'abord entiers puis décimaux à 1 ou 2 décimales. Transformer des soustractions en additions. Tableaux de sommes et de différences à double entrée. Prévoir le signe d'une somme sans la calculer. |
| **4. Approfondissement** | Enchaînements et problèmes | Suites de 4 à 6 termes avec parenthèses, à simplifier puis calculer astucieusement (regrouper les opposés, les positifs, les négatifs). Problèmes « état – variation – état » : température finale, variation d'altitude d'un plongeur, solde, fuseaux horaires. Repérer un écart orienté (« de combien a-t-il monté ? »). Additions à trous : (–3) + … = 5. Justifier qu'une parenthèse est nécessaire ou non. |
| **5. Défi** | Raisonnement, preuve, modélisation | Carrés magiques à somme nulle. Retrouver un nombre mystère à partir d'indices (signe, distance à zéro, encadrement). Programmes de calcul à remonter qui ne mobilisent que des additions et des soustractions. Contre-exemple : « –a est toujours négatif » est faux. Prouver avec l'idée de R3 que soustraire revient à ajouter l'opposé. Petits algorithmes (blocs) qui additionnent ou comparent deux relatifs. Météo ou bourse : bilans de variations successives à partir d'un tableau de données. |

**Garde-fous de progression :**
- Entiers avant décimaux. Une décimale avant deux.
- Contexte → droite graduée → règle → règle sans support. R2 insiste sur le fait qu'il faut se détacher progressivement des contextes.
- Ne jamais introduire de produit de relatifs. Les nombres en jeu restent « simples » (R3).

---

## 6. Conceptions erronées typiques (diagnostic → remédiation)

| # | Conception erronée | Signature diagnostique (motif de réponse) | Remédiation |
|---|---|---|---|
| E1 | **Comparer les négatifs comme des positifs** : le plus grand nombre est celui qui a la plus grande partie numérique. | « –7 > –3 », rangements croissants inversés **seulement** pour les négatifs : –1 < –4 < –9. | Placer les nombres sur une droite graduée (« le plus à droite est le plus grand »). Thermomètre : « –7 °C, fait-il plus chaud ou plus froid que –3 °C ? ». Règle P1(c) verbalisée. |
| E2 | **Erreurs de décimaux transposées aux négatifs** (« plus il y a de chiffres, plus c'est grand ») combinées à E1. | « –2,15 < –2,5 », ou ordre erroné entre –0,8 et –0,75. | Zoomer sur la droite (dixièmes, puis centièmes). Compléter avec des zéros : –2,50 et –2,15. Revenir d'abord à la comparaison de 2,15 et 2,5. |
| E3 | **Lecture de graduation en négatif** : on compte les traits au lieu des intervalles, ou on gradue à gauche de 0 « dans le même sens » qu'à droite. | Point lu à –2 au lieu de –3 (erreur d'un pas). Graduation –1, –2… écrite de gauche à droite (–1 à l'extrême gauche). –1,5 placé entre 0 et –1. | Construire la partie gauche par symétrie de la demi-droite (R3). Flèches de déplacement depuis 0. Faire dire « 1,5 unité à gauche de 0 ». |
| E4 | **« Moins plus moins égale plus »** : une règle des signes (de la multiplication, entendue ailleurs) appliquée à l'addition. | (–3) + (–4) = 7 ou +7. Les deux termes sont négatifs et le résultat est positif. | Modèle des jetons (dettes) ou thermomètre : « deux baisses successives ». Interdire le slogan. Vérification : une somme de deux négatifs est plus petite que chacun d'eux. |
| E5 | **Additionner les valeurs absolues quels que soient les signes**, ou garder le signe du premier terme. | (–8) + 5 = –13 ou 13. 3 + (–8) = +5 : bon module, signe du premier terme. | Paires nulles (5 jetons + annulent 5 jetons –). Déplacement sur la droite : partir de –8 et avancer de 5. Faire prédire le signe **avant** de calculer. |
| E6 | **Soustraction non transformée** : on soustrait les parties numériques, ou on change le signe des deux termes. | 5 – (–3) = 2. (–5) – (+3) traité comme (+5) + (–3) = 2. 3 – 7 = 4 (« on enlève le petit du grand »). | Écart orienté sur la droite : de –3 à 5, on avance de 8. Addition à trou : (–3) + … = 5. Preuve générique de R3. Mantra précis : « on garde le premier nombre ; on ajoute l'opposé du second ». |
| E7 | **« –a est toujours négatif »** et confusion des rôles de « – ». | « L'opposé de –4 est –4 » ou « –(–2) = –2 ». « Si a = –3, –a est négatif ». | Contre-exemples (R3 : –a n'est pas toujours négatif). Code couleur pour les trois rôles du signe « – ». Lecture « l'opposé de… ». |
| E8 | **Suppression des parenthèses sans transformation** | 7 – (+3) – (–2) réécrit 7 – 3 – 2 = 2, au lieu de 7 – 3 + 2 = 6. | D'abord réécrire toutes les soustractions en additions des opposés, puis seulement supprimer les signes « + » et les parenthèses (P6). Tâche « trouve l'écriture équivalente » avec distracteurs. |
| E9 | **Statut de 0** | « 0 est strictement positif », ou « 0 n'est ni positif ni négatif » (convention anglo-saxonne). | Tableau à quatre colonnes (positif / strictement positif / négatif / strictement négatif) où 0 coche deux cases. Lien avec ⩽ et ⩾ vus en 6e. |
| E10 | **Confondre état et variation dans les problèmes** | Température de –3 à 5 : variation calculée 5 – 3 = 2, ou –3 + 5 = 2 interprété comme « monte de 2 ». Écart d'altitude entre –200 m et 1 500 m donné égal à 1 300 m. | Schéma état → flèche (variation) → état. Formule « variation = final – initial ». Vérifier sur le thermomètre. |
| E11 | **Inversion abscisse/ordonnée ou des signes dans le repère** | (–2 ; 3) placé en (3 ; –2) ou en (2 ; –3). Points systématiquement symétriques de la bonne position. | Mnémotechnique « on marche (x) avant de grimper (y) ». Retour instantané montrant le chemin depuis O. Bataille navale à quatre quadrants. |
| E12 | **Regroupement fautif dans une somme longue** : un signe « – » est attaché au mauvais terme quand on réordonne. | 5 – 3 + 2 réordonné en 5 + 2 – … mal fait, d'où le résultat 0 (5 – (3 + 2)). | Encadrer chaque terme avec le signe qui le précède. Ne réordonner qu'après la réécriture en somme. |
| E13 | **Le signe est vu comme une « étiquette »** sans valeur de nombre, refus de –3 comme nombre (obstacle historique : le XVIIe siècle niait encore les négatifs, R2). | Réponses du type « impossible » ou « on ne peut pas » à 3 – 7. | Situations de dette ou de solde, frise historique (Brahmagupta). Besoin de fermer la soustraction : c'est l'intention même du programme (R2 p. 6). |

> Les tâches de diagnostic peuvent servir de **QCM à distracteurs** : chaque distracteur correspond à une signature ci-dessus (par exemple, pour 5 – (–3), les distracteurs 2, –2, –8 et la bonne réponse 8). Cela permet un retour ciblé.

---

## 7. Idées visuelles et intuitives, activités interactives

### 7.1 Supports intuitifs (à utiliser puis à faire disparaître progressivement)

- **Thermomètre vertical** : comparaison (plus haut = plus grand), variation = montée ou descente. Contexte cité explicitement par le programme.
- **Altitude et profondeur** : montagne, niveau de la mer, plongeur. Écarts entre un sommet et une fosse.
- **Ascenseur / étages** (0 = rez-de-chaussée, –2 = parking) : déplacements entiers.
- **Frise chronologique** avant/après J.-C. : attention, il n'existe pas d'« an 0 ». C'est une **limite** du modèle à signaler, ou à éviter en début d'apprentissage.
- **Droite graduée et déplacements** : un nombre est à la fois une **position** (état) et un **déplacement** (flèche). Additionner, c'est enchaîner des flèches. Soustraire, c'est chercher la flèche d'un point vers un autre.
- **Jetons « + » et « – » (paires nulles)** : une paire (+, –) vaut 0. C'est le modèle qui correspond le mieux aux justifications de R3 : ajouter puis retirer une paire nulle pour soustraire un négatif.
- **Comptes et soldes** (gains et dettes) : bilan de variations.
- **Fuseaux horaires** (UTC –5, UTC +9) : écarts horaires, lien avec la géographie.

### 7.2 Activités interactives qui enseignent réellement

1. **« Machine à paires nulles » (jetons)** — objectifs M5-REL-02, 09, 10, 11.
   - L'élève construit (–6) + (–9) ou 6 + (–9) en déposant des jetons. Les paires (+, –) s'annulent avec une animation, et il lit le résultat.
   - Pour 3 – (–2), l'élève constate qu'il n'y a pas de jeton « – » à retirer. Il doit ajouter deux paires nulles, retirer les deux « – », et observe que le résultat est le même que 3 + 2.
   - Le système **demande une prédiction avant l'animation**, puis compare. Les jetons s'effacent progressivement aux niveaux 3 et 4.
   - *Pourquoi ça enseigne :* l'activité rend visible la définition de l'opposé (a + (–a) = 0) et la règle a – b = a + (–b), exactement comme dans R3.

2. **« Droite des déplacements »** — M5-REL-06, 08, 11, 15.
   - Droite graduée zoomable : pas de 1, puis 0,5, puis 0,1. L'élève place un point d'état, puis trace une flèche de variation ; le système affiche l'équation correspondante, par exemple –3 + 8 = 5.
   - Mode inverse : on donne deux points, l'élève trace la flèche qui les relie, et le système affiche 5 – (–3) = 8.
   - Mode comparaison : glisser des cartes de nombres sur la droite pour les ranger, avec un retour qui montre la position réelle (E1, E2, E3).
   - *Pourquoi ça enseigne :* l'activité relie les trois représentations (contexte, droite, écriture) et donne une interprétation stable de la soustraction comme écart orienté.

3. **« Thermomètre de l'expédition »** (résolution de problèmes) — M5-REL-05, 14, 15.
   - Une journée météo en montagne est découpée en relevés. L'élève doit prédire chaque température, puis le bilan total des variations. Le thermomètre animé valide ou réfute la prédiction.
   - Des questions « état ou variation ? » sont intercalées pour cibler E10.
   - Au niveau 5, l'élève reçoit un tableau de données réelles simplifiées et calcule les amplitudes thermiques.

4. **« Chasse au trésor 4 quadrants »** (repère) — M5-REL-07.
   - Placer et lire des points de coordonnées relatives. Les indices sont formulés avec des opposés (« l'abscisse du coffre est l'opposé de celle du phare »).
   - Le retour sur erreur montre le chemin « d'abord horizontal, puis vertical » depuis O (E11).
   - Extension possible : symétrique d'un point par rapport à O, en lien avec la symétrie centrale de 5e, sans exigence formelle.

5. **« Détective des parenthèses »** — M5-REL-12, 13.
   - Des paires d'écritures sont proposées (–(2 + 3) / –2 + 3 ; 3 – (–2) / 3 – 2 ; 7 – (+3) – (–2) / 7 – 3 + 2). L'élève dit si elles sont égales et choisit une justification.
   - Code couleur des trois rôles du signe « – ».
   - Cible E7 et E8.

6. **Diagnostic adaptatif** : un QCM à distracteurs codés (voir §6) oriente vers l'activité de remédiation correspondante.

> **À éviter :** des jeux de rapidité pure dès le niveau 1 (qui risquent de figer des règles mal comprises), des « astuces » verbales (« moins et moins font plus ») et tout calcul de produit de relatifs.

---

## 8. Sources, licences et limites d'accès

| Source | Type | Utilisation dans ce dossier | Licence / réutilisation | Accès (2026-11-06) |
|---|---|---|---|---|
| R1 BO n° 10 du 5 mars 2026 (education.gouv.fr) | Officiel | Référence juridique (non lue directement) | Texte officiel. Le BO est réutilisable avec mention de la source (Licence Ouverte Etalab : principe général des données publiques, à confirmer sur la page). | **403 Cloudflare**, non contourné |
| R2 et R2bis Annexe 2, programme cycle 4 (reproductions des académies de Corse et de Besançon) | Officiel, reproduction académique fidèle | Périmètre, objectifs, report en 4e et 3e | Programme officiel. Citation courte et paraphrase. Les académies rediffusent le fichier ministériel. | 200, lu. Deux copies identiques (`cmp`). |
| R3 Exemples pour la mise en œuvre, cycle 4, 2026 (copies Corse et Besançon) | Document d'accompagnement institutionnel (attribution à Éduscol non vérifiée directement : page Éduscol en 403) | Précisions : valeur absolue non exigible, justifications des règles, exemples d'écritures | Paraphrase et courts exemples génériques seulement. | 200, lu (section identique dans les deux copies) |
| R4 Webinaire Nancy-Metz « Focus 5° » | Présentation des IA-IPR | Confirme la répartition 5e/4e et le « Focus 5° : valeur absolue » | Usage informatif, ne pas reproduire les diapositives | 200, lu |
| R5 Bordeaux (2 PDF) | Synthèse académique | Non utilisée | — | **Certificat TLS expiré**, puis 503 avec WebFetch. Non lu ; la vérification TLS n'a pas été désactivée. |
| R6 Normandie (nvx_programmes_cycle_4_rs_2026.pdf) | Synthèse académique | Non utilisée (résumé du moteur de recherche seulement) | — | **Connexion réinitialisée** (proxy : `ws_closed_mid_exchange`), puis 503. Non lu. |
| R7 Programme cycle 3 (education.gouv.fr, PDF statique) | Officiel | Prérequis de 6e | Texte officiel. Paraphrase. | 200, lu |
| R8 Éduscol, exemples de réussite 6e (2025) | Accompagnement | Prérequis (demi-droite, comparaison, ⩽ et ⩾) | Paraphrase | 200, lu |
| math93.com, TD « Nombres relatifs » 5e (version octobre 2026) | Ressource ouverte d'enseignant | **Seulement** l'analyse de la typologie et de la progression des exercices (guidés, puis bilan, consolidation, approfondissement, défis). Repérage d'écarts au programme (ensembles ℕ/ℤ/𝔻, \|a\|). | **Aucune licence libre trouvée** sur le site ni dans le PDF : traiter comme « tous droits réservés ». **Ne rien reproduire.** | 200 (titres et sommaire consultés seulement) |
| Pass-Education, Euler Versailles et autres (résultats de recherche) | Ressources commerciales ou académiques | Confirmation des types d'exercices courants (« quel signe ? », tableaux de sommes, suppression des parenthèses). Contenus non consultés. | Commercial ou droits réservés : ne pas reproduire | Titres seulement |

**Incertitudes et limites :**
1. Le NOR MENE2602912A et la date de l'arrêté (18/02/2026, d'après une source secondaire) n'ont pas été lus dans le BO (403). Le rattachement de l'annexe au BO n° 10 du 5 mars 2026 est confirmé par l'académie de Besançon et par le webinaire de Nancy.
2. Les coordonnées **négatives** dans le repère du plan en 5e (M5-REL-07) sont déduites, et non écrites explicitement. Elles sont très probables, vu le lien demandé avec les relatifs et les automatismes de 4e.
3. L'attribution du document « Exemples pour la mise en œuvre » à Éduscol n'a pas été vérifiée sur Éduscol (403). Sa section relatifs est identique dans deux rediffusions académiques.
4. Les synthèses de Bordeaux et de Normandie n'ont pas été lues. Elles pourraient contenir des recommandations de progression annuelle non reflétées ici.
5. Le texte de R2 ne précise pas si les décimaux du calcul littéral de 5e (ax + b) peuvent être négatifs. Par prudence, la recommandation est de ne pas substituer de valeurs négatives dans des produits.
