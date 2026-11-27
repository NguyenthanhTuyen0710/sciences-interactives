# Sciences Interactives — consignes pour Claude

Plateforme Next.js 15 / TypeScript / PostgreSQL (Drizzle) d'exercices de maths et physique-chimie, 6e → Tle, en français.

## Où lire l'état du projet (ne pas relire tout le dépôt)
- Maths 3e : `project/maths-3e-progress.md` (source unique) ; manifest des thèmes : `research/curriculum/mathematiques/manifest-3e.json`.
- Feuille de route (gates 0→5, règles d'économie, budget) : `project/roadmap.md` ; Gate 0 : `project/reports/ROADMAP-G0-audit.md`.
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
| Pages connectées (un passage par compte ; un élève sur `/admin` échoue, c'est voulu) | `AS=hugo@demo.fr PATHS=/mon-espace npx tsx scripts/ui-check.ts` · `AS=prof@demo.fr PATHS=/admin,/mon-espace …` |
| e2e d'un chapitre (serveur lancé) | `ONLY=prefixe- SHOW_DRAFTS=1 npx tsx scripts/e2e.ts` |

Environnement local : `service postgresql start`, puis `npm run build && ALLOW_DEMO_SECRETS=1 npx next start` (tuer `next-server` avant un nouveau lancement). `next start` tourne en production : sans `AUTH_SECRET` et `TEACHER_INVITE_CODE` propres il s'arrête ; `ALLOW_DEMO_SECRETS=1` est réservé au poste local.

## Agents et modèles
- Production de chapitre : agent `chapter-author` (Sonnet). Relecture : `chapter-reviewer` (Sonnet), **une fois**, après `validate-chapter`. Extraction / classement : `extractor` (Haiku). Opus seulement pour l'architecture ou un bug complexe.
- Au plus 2 agents en parallèle ; pas de fork pour produire du contenu (il emporte tout le contexte).
- Pipeline API de contenu : `pipeline/README.md` (budget plafonné, reprise, aucune clé dans le dépôt).

## Production (VinaHost : CloudLinux LVE, cPanel, LiteSpeed lsnode)
- Détails : `docs/ops/production.md` (environnement, références mesurées), `docs/ops/runbook.md` (déploiement, retour arrière), `docs/ops/repetition-annexe-a.md` (répétition sur VinaHost du 2026-11-27), `docs/ops/incident-2026-11-27.md`.
- Quotas partagés avec WordPress/PHP : NPROC 165 (**threads inclus**), 2 Go de RAM, 56 CPU visibles. Référence mesurée : 13 threads par instance, dont 2 Tokio.
- Point d'entrée : `ops/server.js` (copie versionnée du `server.js` de production, sans secret). Ne jamais retirer `TOKIO_WORKER_THREADS=2` (cPanel) ni la garde placée avant tout `require()`.
- Interdits sans approbation : `cluster`, `worker_threads`, `child_process`, tâches de fond, pool PostgreSQL non borné, concurrence calculée sur le nombre de CPU visibles, dépendance native non revue (`node ops/review-deps.mjs`, `node ops/check-native.mjs node_modules --max-glibc 2.34 --load` ; hébergement : glibc 2.34, x86_64), build lourd sur l'hébergement (build en CI).
- Production : `AUTH_SECRET` et `TEACHER_INVITE_CODE` obligatoires, jamais une valeur publiée dans le dépôt (l'application s'arrête sinon). `ALLOW_DEMO_SECRETS=1` : démonstration seulement. Aucune valeur secrète dans le dépôt, les journaux ou les rapports.
- Processus : SIGTERM sur PID vérifié uniquement ; jamais `kill -9`, `pkill` large ni arrêt automatique. Le PPID n'est pas un critère (il passe à 1 en fonctionnement normal sous LiteSpeed) : un « ancien » processus = démarré avant le déploiement. `node` est hors du PATH sur l'hébergement (`/opt/alt/alt-nodejs22/root/usr/bin/node`). Un redémarrage cPanel n'est jamais présumé réussi : `ops/preflight.sh` avant, `ops/verify.sh` après (instances multiples possibles : contrôler les processus, pas leur nombre).
- STOP cPanel jamais présumé effectif (constaté : lent, parfois sans effet, parfois un processus survit) : quatre preuves (bouton START APP, `.htaccess` sans ligne Passenger, 0 processus, réponse qui n'est plus celle de l'application), aucune requête HTTP en boucle pendant l'attente, SIGTERM seulement après relecture de l'identité (UID, cwd, exe, cmdline, `starttime`) dans la même commande. L'application démarre à la demande : zéro PID à un instant donné ne prouve rien. Une page de maintenance statique dans le document root masque l'application : posée après un arrêt prouvé, retirée après START, jamais sur un `index.*` existant (`docs/ops/runbook.md`, étapes 12 bis à 16).
- Déploiement : la racine de l'application n'est **jamais renommée** ; une version = `.next` (sans cache de build), `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, `RELEASE.json`, échangée par renommage dans `.release/{staging,rollback}`. `node_modules` (lien CloudLinux vers nodevenv, avec `typescript` : sans lui `next start` lance `npm install`), `public/` et `public/uploads` ne font jamais partie d'une version. Flux A (dépendances conformes au lock, `ops/check-deps.mjs`) ; flux B (dépendances modifiées) bloqué sans approbation. Artefact : `ops/build-artifact.sh` + `ops/smoke-artifact.sh` (CI). Un seul déploiement à la fois : `ops/deploy-lock.sh`.
- Disque : quota cPanel 7 168 Mo (jamais `df`) ; `ops/disk-check.sh` avant déploiement (≥ 1 024 Mo libres au pic et après) ; `ops/cleanup.sh` (simulation par défaut, verrou, liste fermée sous `.release/`) ne supprime rien hors de `sciences-interactives/.release`.
- Secrets : mêmes règles au démarrage (`src/lib/config.ts`) et au preflight (`ops/check-config.mjs`), valeurs publiques listées dans `ops/config-rules.json` ; verdict par nom de variable, jamais de valeur.
- Scripts `ops/*.sh` : compatibles CageFS, donc ni `<(…)`, ni `>(…)`, ni `/dev/fd`, `/dev/stdin`, `/proc/self/fd` ; `--node` valide est utilisé tel quel (`ops/test-portability.sh`).
- Ressources : `ops/probe.sh` (base locale ou CI uniquement) ; workflow `runtime-resources.yml`, séparé de `pr-checks.yml`.

## Git
Branche de travail indiquée par la session ; commits en français ; ne jamais committer `.env`.
