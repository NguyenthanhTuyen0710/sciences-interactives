# Production — VinaHost (CloudLinux LVE, cPanel, CageFS, LiteSpeed lsnode)

Dernière mise à jour : 2026-11-27. Les valeurs de l'hébergement viennent de VinaHost et de l'exploitant ; les mesures viennent de `ops/probe.sh` (Linux x64, Node 22.23.5).

## Environnement

| Élément | Valeur |
|---|---|
| Domaine | starluxvn.com |
| Application | Next.js 15, `NODE_ENV=production`, Node.js 22.23.5, PostgreSQL local |
| Fichier de démarrage | `server.js` à la racine de l'application, version suivie : `ops/server.js` |
| Quota CPU | 150 % ; 56 CPU logiques visibles (affinité 0-55) |
| Mémoire | 2 Go pour tout le compte |
| NPROC | 165, **threads inclus** |
| Entry Processes | 150 |
| Partage | sites WordPress/PHP du même compte : mêmes limites |

## Démarrage : `ops/server.js`

Reprend à l'identique le serveur HTTP de production (`next({ dev: false })`, `http.createServer`, `listen(PORT)`), plus :

- une garde `TOKIO_WORKER_THREADS=2` placée **avant tout `require()`** (la variable cPanel, si elle existe, prime) ;
- une ligne ESLint pour le style CommonJS.

Aucun gestionnaire SIGTERM/SIGINT n'est ajouté : le comportement actuel est conservé (Node termine sur SIGTERM).
Aucun secret dans ce fichier. Pour déployer une nouvelle version du fichier : copier `ops/server.js` vers `server.js`, puis `ops/preflight.sh` (il compare les deux).

## Variables d'environnement (cPanel → Setup Node.js App)

| Variable | Rôle | Règle |
|---|---|---|
| `NODE_ENV` | `production` | obligatoire |
| `DATABASE_URL` | PostgreSQL local | obligatoire |
| `AUTH_SECRET` | signature des sessions | obligatoire, ni absente ni valeur publique du dépôt ; **ne pas la changer** : cela déconnecte tous les utilisateurs |
| `TEACHER_INVITE_CODE` | inscription enseignant | obligatoire, ni absente ni `PROF-2026` |
| `TOKIO_WORKER_THREADS` | threads du runtime natif SWC | `2`, à conserver |
| `ALLOW_DEMO_SECRETS`, `INSECURE_COOKIES`, `SHOW_DRAFTS` | démonstration / brouillons | **interdites** en production |

Les valeurs ne vont jamais dans Git, la documentation, les journaux ou les rapports.
En production, l'application s'arrête au démarrage (code 1) si `AUTH_SECRET` ou `TEACHER_INVITE_CODE` manque ou reprend une valeur publiée dans le dépôt (`src/lib/config.ts`, `src/instrumentation-node.ts`). Le message nomme la variable, jamais la valeur. Une instance qui s'arrête ainsi apparaît dans cPanel comme non démarrée : lire le journal de l'application.

## Pourquoi `TOKIO_WORKER_THREADS`

Le binaire natif `@next/swc` (Rust, runtime Tokio) crée autant de threads de travail que de CPU visibles. Sur l'hébergement : 56 CPU → 11 threads fixes + 56 = 67 threads par instance. Le quota NPROC (165, partagé) s'épuise alors avec deux instances. Mesures locales :

| Cas (4 CPU physiques) | Threads au repos | Tokio |
|---|---|---|
| Sans garde, 4 CPU visibles | 15 | 4 |
| Sans garde, 1 CPU visible | 12 | 1 |
| `TOKIO_WORKER_THREADS=2` | 13 | 2 |
| Garde de `ops/server.js`, variable absente | 13 | 2 |
| Valeur d'environnement 3 (prime sur la garde) | 14 | 3 |

Limite : la machine de test n'a que 4 CPU ; l'écart 56 CPU / quota n'est pas reproduit à l'identique. La relation « Tokio = CPU visibles » l'est (1 → 1, 4 → 4). Sur l'hébergement, baseline vérifiée : 13 threads dont 2 Tokio.

## Références mesurées (`ops/probe.sh`, 3 passages, poste de test)

| Mesure | Valeur | Remarque |
|---|---|---|
| Threads au repos | 13 | identique sous charge |
| Threads Tokio | 2 | |
| Processus enfants | 0 | |
| RSS au repos | 263 Mo (production : ~236 Mo) | |
| RSS au pic | 344–347 Mo | 2 × (30 pages + 100 × 2 requêtes, 20 en parallèle) ; propre à ce scénario |
| RSS après retour au calme | 314 → 346 Mo entre les charges 1 et 2 | V8 ne rend pas la mémoire ; pas de dérive au-delà |
| Connexions PostgreSQL | pic 10, 0 après arrêt | `max: 10` du pool, inchangé |
| Arrêt sur SIGTERM | < 2 s, connexions fermées | |

Seuils de `ops/probe.sh`. **Échec** : Tokio ≠ valeur attendue, threads > 20, processus enfant, connexions PostgreSQL > 10, processus vivant 10 s après SIGTERM, connexions restantes après l'arrêt. **Avertissement** (dépend du runner ou de la charge) : RSS au repos > 350 Mo, RSS au pic > 700 Mo (valable pour ce scénario seulement), RSS « après calme » en hausse de plus de 25 % et 40 Mo entre deux charges identiques. Valeurs initiales : à ajuster avec les premiers résultats CI.

## Ne pas supposer une seule instance

LiteSpeed peut créer plusieurs instances valides. `ops/verify.sh` ne compte donc pas les instances : il contrôle chaque processus (threads, Tokio, enfants, âge, PPID) et les totaux du compte, et signale tout processus **plus ancien que le déploiement** ou **orphelin (PPID=1)**.

## Contrôles

| Quand | Outil | Rôle |
|---|---|---|
| Avant déploiement | `ops/preflight.sh` | Node, artefact, `server.js`, variables, marge NPROC/mémoire, processus existants (lecture seule) |
| Après déploiement | `ops/verify.sh` | processus réels, santé HTTP, PostgreSQL, authentification, rôles, correction serveur (lecture seule) |
| CI et local | `ops/probe.sh` | non-régression des ressources, base locale/jetable uniquement |
| Pull request | `.github/workflows/runtime-resources.yml` | contrôles statiques, revue des dépendances, sonde |

## Compatibilité de l'artefact (état des vérifications)

- Binaire natif SWC : `@next/swc-linux-x64-gnu` exige au plus **glibc 2.17** (mesuré sur le binaire de ce dépôt). `ops/preflight.sh` le compare à la glibc de l'hôte (pas encore mesurée sur VinaHost : à lancer).
- Autres modules natifs : aucun dans le code de production (`bcryptjs` est du JavaScript pur ; `sharp` n'est pas utilisé). `ops/review-deps.mjs` (et la CI) signale toute nouvelle dépendance à risque.
- **Le mécanisme de transfert de l'artefact (CI → hébergement) n'est pas décidé** : il attend `ldd --version`, l'état de `node_modules` sur l'hôte et la structure cPanel. Aucun build lourd sur l'hébergement.

## Risques et limites connus

1. Les images téléversées par `/api/admin/upload` sont écrites dans `public/uploads` : **elles répondent 404 jusqu'au redémarrage suivant** de l'application (mesuré avec `ops/server.js`). Un déploiement qui remplace le dossier de l'application les efface. Déplacement non approuvé : à traiter séparément.
2. RESTART/STOP cPanel non fiables le 2026-11-27 : voir `incident-2026-11-27.md`. Toujours vérifier avec `ops/verify.sh`.
3. NPROC partagé avec WordPress/PHP : un pic PHP peut provoquer « Unable to fork » même avec Node à 13 threads.
4. Tout composant dimensionné sur le nombre de CPU visibles (56) peut réintroduire le problème ; la garde ne couvre que Tokio.
5. Mémoire : 515 Mo mesurés en charge extrême (60 requêtes en parallèle) sur le poste de test ; aucune limite de heap n'est imposée (non approuvé).
