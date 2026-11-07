# SCI-5E-MATH-001 — QA1 Complétude du programme

_Rapport de l'agent QA1 (indépendant), consigné par l'orchestrateur. Sources lues : annexe 2 du programme cycle 4 (BO n° 10 du 5 mars 2026, copie ac-corse, p. 5, 7-10, 12, 14), document « Exemples pour la mise en œuvre » cycle 4 (PDF p. 11, 12, 23), programme cycle 3 2025._

**Verdict : NEEDS REVIEW** — aucun écart critique ; tous les objectifs 5e « Nombres relatifs » et « Repérage » couverts ; rien d'hors programme enseigné ou évalué.

| # | Sévérité | Constat | Correction |
|---|---|---|---|
| F1 | majeur | « distance à zéro » (ancien programme) utilisé comme terme principal et définition ; « le nombre sans son signe » informel | définir la valeur absolue selon le document (a si a ⩾ 0, −a si a ⩽ 0), interprétée comme distance à l'origine ; relatifs = décimaux positifs et leurs opposés |
| F2 | mineur | valeur absolue évaluée (rel5-06, memory) alors que le terme « ne fait pas l'objet d'exercice » | reformuler ou justifier (le document admet « donner la valeur absolue » sur la droite) ; pas d'autre item dédié |
| F3 | mineur | objectifs paraphrasés avec ajouts pédagogiques présentés comme officiels | coller au texte de l'annexe 2 |
| F4 | mineur | repère du plan rattaché à « Nombres relatifs » ; `math-5e-reperage` non référencé | ajouter le chapitre d'inventaire et la source « Espace et géométrie › Repérage p. 12 » |
| F5 | mineur | prérequis ⩽/⩾ et « placer des points dans un repère » non attestés au cycle 3 2025 | corriger les prérequis, définir ⩾/⩽ dans le cours |
| F6 | mineur | ordre décroissant jamais demandé ; sommes et enchaînements surtout entiers ; verbalisation d'un écart absente ; justification de la règle d'addition par les opposés absente | compléter rel5-16, 22/25, 12/26, explications |
| F7 | mineur | étiquettes d'objectifs discutables (rel5-07, rel5-31, jeu droite) ou incomplètes (rel5-24, 25, 30) | réétiqueter |
| F8 | mineur | distracteurs évoquant la multiplication (notion de 4e) | remplacer par un distracteur de 5e |
| F9 | mineur | automatismes non explicités | les mentionner (optionnel) |
