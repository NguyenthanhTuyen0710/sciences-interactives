# Dossier de recherche : Électricité, intensité, tension et loi d'Ohm

*Chapitre `pc-4e-electricite` · tâche SCI-4E-PC-007 · 4e · physique-chimie · arbre `p4-electricite`*

## 1. Références officielles

- **Programme du cycle 4 en vigueur** (BO n° 31 du 30-07-2020), physique-chimie, « Exploiter les lois de l'électricité », p. 103. Source Éduscol enregistrée : `c4-programme-2020-eduscol-pdf`, sha256 `de42e981…521194b9`, accédée le 2026-11-07T14:49:44.189Z, statut *verified*.
- Compétences travaillées : programme, p. 97-98.
- Repères de progressivité (BO, annexe 3) : objectif P5-E-06 (consolidation).
- **Aide Éduscol (juin 2016)** : document d'accompagnement non prescriptif, pas un texte du BO. Elle sert uniquement à l'objectif P4-E-04 (approfondissement). Aucun enregistrement vérifié du collecteur n'existe pour elle : ne pas la citer comme source vérifiée.

## 2. Périmètre exigible et hors programme

**Exigible (4e) :**
- P4-E-01 : élaborer et réaliser un protocole pour vérifier une loi de l'électricité.
- P4-E-02 : unicité de l'intensité en série ; additivité des intensités (circuit à deux mailles).
- P4-E-03 : additivité des tensions (une maille) ; unicité des tensions (dérivation).
- P3-E-07 : relation tension-courant, loi d'Ohm U = R × I (exigible en 4e par option A, et en 3e s'il n'a pas été vu en 4e).
- P3-E-10 : lois de l'électricité et règles de sécurité électrique.

**Approfondissement, non obligatoire :** P4-E-04 (influence d'une résistance). À étiqueter « Approfondissement » pour l'élève.

**Hors chapitre :** puissance et énergie électriques (P3-E-08, P3-E-09), réservées à la 3e selon le programme (p. 103).

**Consolidation (5e, non comptée dans l'achèvement) :** P5-E-04 (circuit répondant à un cahier des charges), P5-E-05 (série et dérivation), P5-E-06 (premières mesures avec ampèremètre et voltmètre).

**Évaluation finale :** niveau 5, exercices « Type Brevet » (épreuve de sciences du DNB).

## 3. Prérequis

- Dipôles usuels, générateur, interrupteur, lampe, symboles normalisés des schémas (5e).
- Distinction série / dérivation et notion de boucle ou de maille.
- Grandeurs, unités et mesures ; conversions (1 A = 1 000 mA) ; puissances de 10.
- Calculs de quotient et de produit ; lecture d'une graduation ; droite passant par l'origine.
- Chiffres significatifs.

## 4. Définitions et propriétés à énoncer

| Grandeur | Symbole | Unité SI | Appareil |
|---|---|---|---|
| Intensité du courant | $I$ | ampère (A) | ampèremètre |
| Tension électrique | $U$ | volt (V) | voltmètre |
| Résistance | $R$ | ohm (Ω) | ohmmètre ou calcul |

**Lois à énoncer, avec leurs symboles :**
- **Unicité de l'intensité (série) :** $I = I_1 = I_2$ (A). Le programme la formule ainsi : l'intensité est la même en tout point d'un circuit ne comportant que des dipôles en série.
- **Additivité des intensités (deux mailles, au nœud) :** $I = I_1 + I_2$ (A).
- **Additivité des tensions (une maille) :** $U = U_1 + U_2$ (V).
- **Unicité des tensions (dérivation) :** $U = U_1 = U_2$ (V).
- **Loi d'Ohm (dipôle ohmique) :** $U = R \times I$, avec $U$ en V, $R$ en Ω, $I$ en A.

## 5. Méthodes et protocoles

**Ampèremètre (intensité) :**
- Placement : **en série** dans la branche étudiée.
- Branchement : borne COM et borne du calibre adapté, le calibre le plus élevé d'abord.
- Unité de lecture : A (convertir les mA en A avant tout calcul).
- Chiffres significatifs : la lecture suit la précision de l'appareil ; `sigFigs` = nombre de chiffres de la donnée la moins précise.

**Voltmètre (tension) :**
- Placement : **en dérivation** aux bornes du dipôle étudié.
- Unité de lecture : V.

**Protocole de vérification d'une loi (P4-E-01) :**
1. Schématiser le circuit avec les symboles normalisés.
2. Choisir la grandeur à vérifier (ex. $I$ en différents points d'une série).
3. Faire varier une seule grandeur à la fois et mesurer les autres.
4. Consigner les valeurs avec leur unité et leur nombre de chiffres significatifs.
5. Comparer les résultats à la loi, en tenant compte de l'incertitude de mesure.

**Loi d'Ohm :** tracer $U$ en fonction de $I$ ; une droite passant par l'origine indique un dipôle ohmique, de pente $R$. On peut aussi calculer $R = U/I$ pour une mesure.

## 6. Progression en 5 niveaux

1. **Découverte :** repérer série ou dérivation sur un schéma ; placer ampèremètre et voltmètre.
2. **Application directe :** appliquer $I = I_1 = I_2$, $I = I_1 + I_2$, $U = U_1 + U_2$, $U = U_1 = U_2$ à des valeurs données.
3. **Entraînement :** $U = R \times I$ dans les trois sens (calculer $U$, $R$ ou $I$), avec conversions d'unités.
4. **Problèmes :** circuit à deux mailles ; choix d'un protocole de vérification ; interprétation d'un graphique $U = f(I)$ ; P4-E-04 en approfondissement.
5. **Type Brevet (« Type Brevet — … ») :** plusieurs étapes, lecture d'un schéma et de mesures, calcul de $R$, conclusion argumentée, incertitude.

## 7. Erreurs typiques et raisonnement correct

- **« En série, $I = I_1 + I_2$ »** : faux. Dans une série, il n'y a qu'un seul chemin pour le courant, donc $I$ est identique partout. L'addition des intensités ne concerne que les dérivations (nœud).
- **« En dérivation, $U = U_1 + U_2$ »** : faux. Chaque branche est soumise à la même tension $U$. L'addition des tensions concerne une maille.
- **Voltmètre branché en série, ampèremètre en dérivation** : inversion des rôles. Le voltmètre se place en dérivation et l'ampèremètre en série. Un ampèremètre en dérivation crée un court-circuit quasi total.
- **« $R = U \times I$ »** : inversion de la loi. Avec $U = R \times I$, on obtient $R = U/I$.
- **Oubli de conversion :** 250 mA = 0,250 A, pas 250 A.
- **Chiffres significatifs :** donner 4 chiffres à partir d'une lecture à 2 chiffres significatifs ; le résultat doit suivre la donnée la moins précise.

## 8. Idées d'illustrations et d'activités

- **Série :** une pile ou un générateur (0 à 12 V), deux lampes et un interrupteur. Mesurer $I$ en trois points : les valeurs doivent être égales.
- **Dérivation :** deux lampes en parallèle ; mesurer $U$ aux bornes de chacune puis de la source.
- **Deux mailles :** montrer $I = I_1 + I_2$ au nœud et $U = U_1 + U_2$ dans une maille.
- **Loi d'Ohm :** un conducteur ohmique (résistance usuelle), plusieurs tensions, tableau $U$ / $I$, droite $U = f(I)$.
- **Approfondissement P4-E-04 :** comparer l'intensité obtenue avec deux résistances différentes sous la même tension.

**Règles de sécurité à rappeler (P3-E-10) :**
- Travailler uniquement avec un générateur basse tension (0 à 12 V) ; ne jamais utiliser le secteur pour ces activités.
- Ne jamais relier directement les deux bornes du générateur par un fil (court-circuit, surintensité, échauffement).
- Couper le circuit avant toute modification de branchement.
- Commencer avec le calibre le plus élevé d'un appareil de mesure.
- Ne pas toucher les parties métalliques sous tension ; signaler tout fil abîmé.
- Respecter le règlement de l'établissement, qui prévaut sur ces consignes générales.

## 9. Points à vérifier en relecture

- **Citations :** vérifier sur le PDF, p. 103, les citations du programme. Elles sont marquées « lecture manuelle » : une relecture humaine doit les confirmer.
- **Statut de P4-E-04 :** l'inventaire le marque `verified: true`, alors que la source (aide Éduscol 2016) n'a pas d'enregistrement vérifié. Corriger l'inventaire ou accepter explicitement l'exception. Dans le chapitre, ne pas citer cette aide comme vérifiée.
- **Niveaux 3e :** P3-E-07 et P3-E-10 sont traités en 4e (option A) et restent exigibles en 3e si non vus en 4e. Vérifier la cohérence avec le chapitre 3e.
- **Valeurs numériques :** les ordres de grandeur (lampes, résistances, tensions 0 à 12 V) ne proviennent d'aucune source fournie. Les valider avant publication, et ne jamais présenter une valeur inventée comme une mesure réelle.
- **Sécurité :** seules les consignes liées à P3-E-10 sont issues du programme. Les autres règles sont des règles générales à faire valider par l'établissement.
- **Chiffres significatifs :** chaque résultat issu de mesures doit porter son `sigFigs` et son unité.
- **Périmètre :** vérifier que la puissance et l'énergie électriques (P3-E-08, P3-E-09) n'apparaissent dans aucun exercice du chapitre.
