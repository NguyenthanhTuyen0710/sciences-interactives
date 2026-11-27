# Production — VinaHost (CloudLinux LVE, cPanel, CageFS, LiteSpeed lsnode)

Dernière mise à jour : 2026-11-27. Les valeurs de l'hébergement viennent de VinaHost et de l'exploitant ; les mesures viennent de `ops/probe.sh` (Linux x64, Node 22.23.5).

## Environnement

| Élément | Valeur |
|---|---|
| Domaine | starluxvn.com |
| Application | Next.js 15, `NODE_ENV=production`, Node.js 22.23.5, PostgreSQL local |
| Système (vérifié) | Linux x86_64, GNU libc **2.34**, GLIBCXX maximum 3.4.29 (`/lib64/libstdc++.so.6`), `/lib64/libgcc_s.so.1` |
| Racine de l'application | `/home/tkuyhwlk/sciences-interactives` ; `node_modules` = lien vers `/home/tkuyhwlk/nodevenv/sciences-interactives/22/lib/node_modules` (≈ 754 Mo, dépendances de développement comprises) |
| Exécutable Node | `/opt/alt/alt-nodejs22/root/usr/bin/node` — **absent du PATH du shell par défaut** : les scripts `ops/` le détectent (`--node` ou `NODE_BIN` pour le forcer) |
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

LiteSpeed peut créer plusieurs instances valides. `ops/verify.sh` ne compte donc pas les instances : il contrôle chaque processus (threads, Tokio, enfants, âge) et les totaux du compte, et signale tout processus **démarré avant le déploiement**.

**Le PPID n'est pas un critère.** Mesuré en production : le PID 1355617 avait le PPID 1182422 juste après le démarrage, puis le PPID 1 après 1 h 21 (même processus, 13 threads, RSS 241 → 256 Mo, soit +6 %). Le PPID=1 est donc un état normal sous LiteSpeed : il ne prouve ni un orphelin ni un processus à arrêter. Les scripts l'affichent à titre d'information, ne l'utilisent dans aucun test et n'arrêtent jamais un processus. La cause du changement de parent n'est pas établie.

## Contrôles

| Quand | Outil | Rôle |
|---|---|---|
| Avant déploiement | `ops/disk-check.sh` | quota cPanel, pic d'occupation staging/bascule/retour arrière, liens CloudLinux (lecture seule) |
| Avant déploiement | `ops/preflight.sh` | Node, artefact, `server.js`, variables, marge NPROC/mémoire, processus existants (lecture seule) |
| Après déploiement | `ops/verify.sh` | processus réels, santé HTTP, PostgreSQL, authentification, rôles, correction serveur (lecture seule) |
| CI et local | `ops/probe.sh` | non-régression des ressources, base locale/jetable uniquement |
| Avant déploiement | `ops/check-config.mjs` | secrets de production : mêmes règles que le démarrage, verdict PASS/FAIL par nom de variable, jamais de valeur |
| Avant déploiement | `ops/check-deps.mjs` | versions réellement installées dans `node_modules` comparées au lock de la version à déployer (flux A ou B) |
| CI | `ops/build-artifact.sh`, `ops/smoke-artifact.sh` | construction de l'artefact et test de fumée dans un dossier isolé (intégrité, dépendances, démarrage, authentification, API, correction, ressources, bascule et retour arrière) |
| Déploiement | `ops/deploy-lock.sh` | un seul déploiement, retour arrière ou nettoyage à la fois |
| Avant déploiement et en CI | `ops/check-native.mjs` | binaires natifs : architecture, glibc exigée, bibliothèques dynamiques, chargement réel (aucun binutils requis) |
| Après déploiement vérifié | `ops/cleanup.sh` | suppression des restes transitoires de `sciences-interactives` uniquement (simulation par défaut) |
| Pull request | `.github/workflows/runtime-resources.yml` | contrôles statiques, revue des dépendances, sonde |

## Compatibilité de l'artefact (glibc 2.34, Linux x86_64, Node 22.23.5)

Principe : `.next` (JavaScript) ne dépend pas de la plateforme de build. Seuls les binaires natifs de `node_modules` en dépendent ; ce sont des paquets npm **précompilés** (pas compilés sur le runner) : ce qui compte est la glibc qu'ils exigent, pas celle d'`ubuntu-latest` (2.39).

Binaires natifs (`ops/check-native.mjs`, lecture des en-têtes ELF ; arbre de production et arbre complet, 20 ELF, donnent le même verdict) :

| Binaire | glibc exigée | Autres exigences | Utilisé par l'application |
|---|---|---|---|
| `@next/swc-linux-x64-gnu` | ≥ 2.17 | libgcc ≥ 4.2.0 | oui (chargé au démarrage pour lire `next.config.ts` : source des threads Tokio) |
| `@img/sharp-linux-x64` (`.node`) | ≥ 2.17 | GLIBCXX ≥ 3.4.21 | non (`next/image` n'est pas utilisé) |
| `@img/sharp-libvips-linux-x64` | ≥ 2.28 | GLIBCXX ≥ 3.4.22 | non (dépendance de sharp) |
| variantes `musl` | — | — | non : ignorées |

Tous ≤ 2.28 < 2.34, et GLIBCXX ≤ 3.4.22 ≤ 3.4.29 : compatibles avec VinaHost. Preuves : analyse ELF locale et en CI ; **chargement réel dans un conteneur AlmaLinux 9 (glibc 2.34) en CI** (job `native-glibc234`). Sur l'hébergement : `ops/preflight.sh` recharge les addons réels du `node_modules` (nodevenv) et compare à la glibc, à `libstdc++` et à `libgcc_s` de l'hôte.

**Constat important** : `next.config.ts` est lu au démarrage de `next start`, et sa lecture charge SWC. Si le package `typescript` est absent de `node_modules`, Next lance **`npm install typescript`** au démarrage (observé en test) : sur l'hébergement partagé cela créerait des processus et écrirait des centaines de Mo. Le `node_modules` de l'hébergement (754 Mo, dépendances de développement comprises) contient `typescript` : c'est une condition à conserver. `ops/preflight.sh` et `ops/smoke-artifact.sh` la contrôlent. (Mesure : sans `next.config.ts`, le serveur démarre à 11 threads, 0 Tokio et ≈ 172 Mo de RSS au lieu de 13 threads, 2 Tokio et ≈ 263 Mo. Convertir la configuration en JavaScript est une option pour plus tard ; elle modifie la configuration Next.js et n'est pas proposée sans approbation.)

## Compatibilité CageFS des scripts `ops/`

Constaté sur VinaHost avec les scripts du commit `9f405bf` : la substitution de processus Bash (`done < <(commande)`) échoue avec `/dev/fd/63: No such file or directory`, car `/dev/fd` n'est pas disponible sous CageFS ; la détection de Node renvoyait alors « aucun exécutable trouvé » même avec `--node` valide. Correction : `--node` (ou `NODE_BIN`) est utilisé tel quel s'il est exécutable, sans aucune détection ; s'il est invalide, le script échoue explicitement, sans repli silencieux ; la détection n'utilise plus de substitution de processus. Règle pour tous les scripts d'exploitation : ni `<(…)`, ni `>(…)`, ni `/dev/fd`, `/dev/stdin`, `/proc/self/fd`, `coproc`. `ops/test-portability.sh` le vérifie (analyse statique, tests de `find_node`, exécution des scripts dans un `/dev` minimal qui reproduit l'erreur) et tourne à chaque pull request.

## Flux de déploiement

L'artefact est construit en CI (`ops/build-artifact.sh`) : `.next` sans cache de build, `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, `RELEASE.json` (commit, date, Node, plateforme, version de Next.js, SHA-256 du lock) + fichier `.sha256`. Jamais : `node_modules`, `public/` (donc `public/uploads`), sources, tests, `.git`. Mesuré : 3,1 Mo compressé, 11,0 Mo décompressé. Le job CI `runtime` le teste (`ops/smoke-artifact.sh`) puis le conserve 7 jours comme artefact GitHub ; **aucun déploiement automatique**.

La racine de l'application n'est **jamais renommée** : cPanel/LiteSpeed enregistrent ce chemin, et un processus resté vivant garderait son répertoire courant dans le dossier renommé (cas observé le 2026-11-27 : STOP sans effet). Une version = `{.next, package.json, package-lock.json, next.config.ts, server.js, RELEASE.json}` ; on échange ces éléments par renommage **dans** la racine, application arrêtée et arrêt vérifié, avec `.release/staging` et `.release/rollback`. Le lien `node_modules`, `public/` et `public/uploads` ne sont jamais touchés.

| | Flux A : dépendances inchangées | Flux B : dépendances modifiées |
|---|---|---|
| Déclencheur | `ops/check-deps.mjs` : les **versions réellement installées** dans le `node_modules` de l'hébergement correspondent au `package-lock.json` de l'artefact (pas seulement son hash) | écart constaté : paquet absent ou version différente |
| Contrôles | Node = `RELEASE.json`, `typescript` présent, `check-native.mjs --load` sur l'hôte, `disk-check`, `verify` | idem + approbation manuelle |
| Dépendances | `nodevenv` réutilisé tel quel ; lien préservé | **déploiement bloqué** ; `preflight.sh` échoue (« flux B ») |
| Automatisation | possible **après** l'acceptation de PR #72 | non mise en œuvre |

Flux B, pistes à étudier (rien n'est prouvé) : construire le `node_modules` en CI dans un conteneur AlmaLinux 9 avec Node 22.23.5 (comme le Node.js Selector CloudLinux), le transférer comme second dossier à côté de l'actuel dans `nodevenv/.../lib` (`node_modules.staging`), puis échanger les **dossiers cibles** (le lien lui-même reste intact) avec `node_modules.rollback` conservé : le retour arrière couvre alors dépendances **et** application, d'où la mesure disque `--node-modules-mb 754`. À vérifier avant tout usage : que le Node.js Selector ne régénère ni ne valide `nodevenv` autrement, et le comportement de LiteSpeed au changement de dossier cible. Pas de `npm ci` ni de build lourd sur l'hébergement.

## Espace disque (quota cPanel)

Le plafond est le **quota du compte**, pas la partition du serveur : `df -h` n'est jamais utilisé. La commande `quota` n'existe pas sur l'hébergement (« command not found ») : le quota et l'occupation sont donc fournis à `ops/disk-check.sh` avec `--quota-mb` et `--used-mb`, relevés dans cPanel → Disk Usage. Relevé du 2026-11-27 (hébergement partagé avec WordPress BAYDE24H) :

| Élément | Mo |
|---|---|
| Quota | 7 168 |
| Total disk space used | 2 969,08 |
| Quota usage | 2 880,77 |
| Disponible (valeur prudente = quota − plus haute occupation) | 4 198,92 |
| `public_html` | 1 418,26 |
| `nodevenv` | 753,62 |
| `sciences-interactives` | 323,78 |
| Sous-dossiers cachés | 317,11 |
| PostgreSQL | 8,11 |
| `public/uploads` | n'existe pas |

Composition de l'application sur l'hébergement : racine 324 Mo ; `.next` 314 Mo, dont `.next/cache` 305 Mo (**97,1 % de `.next`**), tout en `cache/webpack` (305 Mo ; `eslint` 44 Ko, `swc` 0) ; `.next/server` 5,1 Mo ; `.next/static` 3,3 Mo ; `.next/types` 304 Ko ; `.next/diagnostics` 8 Ko. Le code exécutable utile représente donc environ 9 Mo.

**Cache de build et cache d'exécution** : `.next/cache/webpack`, `eslint` et `swc` sont des caches de **build** : le runtime ne les lit pas, et l'artefact les exclut. Les caches d'**exécution** de Next.js (`fetch-cache`, `images`, cache incrémental) ne sont pas désactivés : ils sont créés à la demande dans `.next/cache` par le serveur lui-même. L'application n'en utilise aucun aujourd'hui (aucune route statique ni ISR, toutes les routes sont dynamiques (`ƒ` dans la sortie du build), aucun `fetch` serveur, pas de `next/image`) et l'hébergement n'en contient aucun. Le cache actuel de 305 Mo **n'est pas supprimé** : lors de la première bascule, l'ancienne `.next` (cache compris) est renommée en `.release/rollback` et libérée seulement au déploiement suivant.

Politique : au plus **un** staging et **un** rollback ; au moins **1 024 Mo** libres au pic et après déploiement (rollback en place) ; `node_modules` reste un lien CloudLinux ; `public/uploads` n'est jamais copié ni déplacé ; rien n'est supprimé hors de `sciences-interactives/.release`. Contrôle : `ops/disk-check.sh` ; nettoyage : `ops/cleanup.sh`.

Modèle de calcul du pic (Mo) : préparation et bascule = occupation + artefact + version décompressée + nouveau `node_modules` (0 en flux A) + marge 100 ; l'ancien rollback et l'artefact existent encore. Après nettoyage = occupation + version + nouveau `node_modules` − ancien rollback − `rollback.prev` − artefact + marge. Retour arrière = échange de noms : même état. Ce qui est déjà dans l'occupation relevée n'est pas compté deux fois (`--used-includes-artifact`, `--used-includes-staging`, détectés automatiquement avec une occupation mesurée par `du`).

Estimation avec les mesures réelles (artefact 3,1 Mo, 11,0 Mo décompressé, marge 100) :

| Cas | Pic | Libre au pic | Libre après déploiement |
|---|---|---|---|
| Flux A, premier déploiement | 3 083,18 | 4 084,82 | 4 087,92 |
| Flux B (nouveau `node_modules` ≈ 754) | 3 837,18 | 3 330,82 | 3 333,92 |

Dans les deux cas la marge de 1 024 Mo est respectée avec un large écart : le disque n'est pas la contrainte, à condition que l'artefact reste sans cache de build. Copier telle quelle l'arborescence actuelle (324 Mo) pour le staging et le rollback ajouterait ≈ 650 Mo : acceptable, mais inutile.

## Risques et limites connus

1. Les images téléversées par `/api/admin/upload` sont écrites dans `public/uploads` : **elles répondent 404 jusqu'au redémarrage suivant** de l'application (mesuré avec `ops/server.js`). `public/uploads` n'existe pas encore sur l'hébergement ; la disposition en versions la protège (jamais copié, jamais déplacé, jamais dans l'artefact). Le défaut d'affichage et un éventuel déplacement hors du dossier de l'application sont à traiter séparément (issue dédiée).
2. RESTART/STOP cPanel non fiables le 2026-11-27 : voir `incident-2026-11-27.md`. Toujours vérifier avec `ops/verify.sh`.
3. NPROC partagé avec WordPress/PHP : un pic PHP peut provoquer « Unable to fork » même avec Node à 13 threads.
4. Tout composant dimensionné sur le nombre de CPU visibles (56) peut réintroduire le problème ; la garde ne couvre que Tokio.
5. Mémoire : 515 Mo mesurés en charge extrême (60 requêtes en parallèle) sur le poste de test ; aucune limite de heap n'est imposée (non approuvé).
