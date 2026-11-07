# Sciences Interactives — consignes pour Claude

Plateforme Next.js 15 / TypeScript / PostgreSQL (Drizzle) d'exercices de maths et physique-chimie, 6e → Tle, en français.

## Où lire l'état du projet (ne pas relire tout le dépôt)
- Maths 3e : `project/maths-3e-progress.md` (source unique) ; manifest des thèmes : `research/curriculum/mathematiques/manifest-3e.json`.
- Projet global : `project/STATUS.md` ; tâches : `project/ledger.json` ; rôles QA : `project/agents.md`.
- Programmes officiels déjà inventoriés : `research/curriculum/` — ne pas refaire la recherche.

## Architecture utile
- Chapitre complet = un fichier `src/lib/chapters/data/<id>.ts` validé par `ChapterSchema` (`src/lib/chapters/schema.ts`), inscrit dans `src/lib/chapters/index.ts`. Visible seulement si `publicationStatus: "published"` (prévisualisation : `SHOW_DRAFTS=1`).
- Moteur d'exercices : `src/lib/engine/` (correction côté serveur ; le navigateur ne reçoit jamais `answer` ni `mistakes`).
- Jeux : `src/components/games/Games.tsx` + logique pure `src/lib/games/logic.ts` (modèles : droite-graduee, calcul-mental, calcul-flash, chasse-erreurs, memory).

## Contenu élève
- Français standard, **tutoiement partout** (cours, exercices, corrections, jeux, messages du moteur). L'espace enseignant `/admin` vouvoie. Un test bloque « vous/votre » et les impératifs en -ez côté élève.
- 3e : programme 2020 (BO n° 31 du 30-07-2020) en vigueur jusqu'en 2027-2028 ; distinguer « exigible », « consolidation » et « approfondissement ».
- Nouvelles sources : ne jamais inventer un contenu à partir d'une source non lue ; noter `SOURCE_INACCESSIBLE`.

## Vérifier : script d'abord, IA ensuite
| Besoin | Commande |
|---|---|
| Un chapitre (contrat, 500 tirages, réponses, diagnostics, doublons, langue) | `npx tsx scripts/validate-chapter.ts <id>` |
| Tests unitaires | `npm test` |
| Types / lint | `npx tsc --noEmit` · `npm run lint` |
| Build | `npm run build` |
| Navigateur desktop + mobile (serveur lancé) | `PAGES=3e/m3-xxx npx tsx scripts/ui-check.ts` |
| e2e d'un chapitre (serveur lancé) | `ONLY=prefixe- SHOW_DRAFTS=1 npx tsx scripts/e2e.ts` |

Environnement local : `service postgresql start`, puis `npm run build && npx next start` (tuer `next-server` avant un nouveau lancement).

## Agents et modèles
- Production de chapitre : agent `chapter-author` (Sonnet). Relecture : `chapter-reviewer` (Sonnet), **une fois**, après `validate-chapter`. Extraction / classement : `extractor` (Haiku). Opus seulement pour l'architecture ou un bug complexe.
- Au plus 2 agents en parallèle ; pas de fork pour produire du contenu (il emporte tout le contexte).
- Pipeline API de contenu : `pipeline/README.md` (budget plafonné, reprise, aucune clé dans le dépôt).

## Git
Branche de travail indiquée par la session ; commits en français ; ne jamais committer `.env`.
