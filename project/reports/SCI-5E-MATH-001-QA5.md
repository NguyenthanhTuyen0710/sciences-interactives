# SCI-5E-MATH-001 — QA5 Ingénierie web et UX

_Rapport de l'agent QA5 (indépendant), consigné par l'orchestrateur._

**Verdict initial : FAIL** (2 défauts bloquants).

## Exécuté (résultats réels)
- `npx vitest run` : 139/139 ; `npx tsc --noEmit` : 0 erreur ; `npx eslint .` : 0 erreur, 2 avertissements préexistants.
- `QUICK=1 BASE_URL=http://localhost:3000 npx tsx scripts/e2e.ts` : « Tous les tests de bout en bout sont passés » (ne couvre pas le chapitre).
- Script Playwright dédié : les 36 exercices joués via l'interface avec la vraie API : 35/36 à 100 % (échec : rel5-19, voir F1) ; puce de niveau 36/36, pas de sélecteur de difficulté 36/36, « Autre exercice » seulement pour les exercices à valeurs aléatoires, indices progressifs conformes.
- Page du chapitre à 375 et 1280 px : pas de défilement horizontal, 221 formules KaTeX sans erreur, 3 SVG visibles, repères et titres conformes, tabulation logique ; 59 liens, tous les liens internes en 200 (lien du BO en 403 aux robots, à vérifier manuellement).
- API : aucune clé `answer`, `mistakes`, `solution`, `reasoning` exposée (36 exercices) ; diagnostics d'erreur vérifiés ; entrées invalides traitées sans erreur 500. Aucune faille XSS trouvée.
- Sans `SHOW_DRAFTS` : chapitre et exercices masqués (404), confirmé par lecture du code.

## Constats et suite donnée
| # | Sévérité | Constat | Suite |
|---|---|---|---|
| F1 | majeur | LaTeX brut dans les en-têtes du tableau de rel5-19 (`<th>{h}</th>`) | en-têtes rendus via `MathInline` |
| F2 | moyen | erreur d'hydratation React #418 (graines aléatoires des jeux) | jeux montés côté navigateur |
| F3 | mineur | « Exercices complémentaires » après les références | références déplacées en fin de page |
| F4 | mineur | sommaire collant masquant 8 px des titres | `scroll-mt-32` |
| F5 | mineur | e2e complet incluant les brouillons | e2e filtré sur les chapitres visibles |
| F6 | info | sous-titre = titre sur la page d'exercice ; défi ignorant le niveau ; mini-quiz formatif côté navigateur | sous-titre = objectif ; autres points notés |
