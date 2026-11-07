# SCI-INFRA-001 — Audit du dépôt (Orchestrateur)

Date : 2026-11-06 · Branche : `claude/zealous-newton-dn96ub` · Commit de départ : `803cc5d`

## Existant (préservé)
- Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, PostgreSQL + Drizzle, KaTeX (+ mhchem), math.js, zod.
- Moteur d'exercices `src/lib/engine` : 14 types d'interaction, correction côté serveur (la clé ne transite pas),
  diagnostics (signe, ordre de grandeur, chiffres significatifs, fractions), aléatoire déterministe par graine.
- 50 générateurs (`src/lib/content/maths-college.ts`, `maths-lycee.ts`, `physique.ts`), arborescence
  `curriculum.ts` (6e → Terminale, nombreux chapitres vides), fiches de cours courtes par notion.
- Pages : matière/niveau/chapitre, exercice, catalogue, cours, révisions (défis), examens générés, leçons animées,
  comptes élève/enseignant/admin, espace enseignant (exercices paramétrés en JSON, import/export).
- Tests : `tests/engine.test.ts` (vitest) ; `scripts/e2e.ts` (Playwright, serveur requis).

## Base de référence mesurée (avant modification)
| Vérification | Commande | Résultat |
|---|---|---|
| Tests unitaires | `npx vitest run` | 59/59 réussis |
| Typage | `npx tsc --noEmit` | 0 erreur |
| Lint | `npx eslint` | 0 erreur, 2 avertissements (préexistants) |
| Build | `npx next build` | réussi (toutes routes dynamiques) |

## Manques constatés au regard de la mission
1. Aucun inventaire officiel sourcé ; `curriculum.ts` signale lui-même le changement de programme de cycle 4
   (BO n° 10 du 5 mars 2026) non intégré. En 2026-2027 : 5e = nouveau programme ; 4e/3e = programme 2015/2020.
2. Pas de « chapitre complet » : seulement des fiches courtes par notion ; pas de cours structuré (15 rubriques),
   pas de banque de 30 exercices par chapitre, pas d'indices progressifs, pas de diagnostics déclaratifs.
3. Pas de jeux réutilisables pilotés par les données (seules 2 leçons animées codées à la main).
4. Pas de registre de tâches, de statut de revue ni de tableau de bord ; pas de règle de publication.
5. Pas d'espace Brevet aligné sur le format de la session 2027 (les « examens » existants sont générés sans référence au format officiel).

## Décisions d'architecture
- **Étendre, ne pas réécrire** : un chapitre complet est un objet de données (`src/lib/chapters/data/<id>.ts`)
  validé par `ChapterSchema` ; ses exercices sont convertis en générateurs du moteur existant → ils réutilisent le
  lecteur, la correction serveur, l'enregistrement des tentatives et les tests.
- Extensions minimales du moteur : `hints` (indices progressifs), `mistakes` (diagnostics, jamais envoyés au
  navigateur), `niveau` 1–5, `objectives`.
- Jeux : 4 modèles réutilisables (`droite-graduee`, `calcul-mental`, `chasse-erreurs`, `memory`), logique pure testée
  dans `src/lib/games/logic.ts`.
- Publication contrôlée : un chapitre non publié est invisible (prévisualisation `SHOW_DRAFTS=1`).
- Aucune nouvelle dépendance.

## Limites d'accès aux sources
`education.gouv.fr` et `eduscol.education.gouv.fr` renvoient 403 aux requêtes automatisées directes depuis cet
environnement. Aucun contournement n'a été tenté ; les agents utilisent l'outil de lecture web autorisé et, à défaut,
les reproductions académiques (ac-bordeaux, ac-normandie, ac-nancy-metz…), limitation consignée dans chaque rapport.

## Prochaine action
Inventaire officiel (A1, A3), recherche Brevet (A4), dossier du chapitre pilote `SCI-5E-MATH-001` (A2), puis tranche verticale.
