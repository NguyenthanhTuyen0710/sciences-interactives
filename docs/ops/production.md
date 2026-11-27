# Production — VinaHost (CloudLinux LVE, cPanel, CageFS, LiteSpeed lsnode)

Dernière mise à jour : 2026-11-27. Les valeurs de l'hébergement viennent de VinaHost et de l'exploitant ; les mesures viennent de `ops/probe.sh` (Linux x64, Node 22.23.5).

## Environnement

| Élément | Valeur |
|---|---|
| Domaine | starluxvn.com |
| Application | Next.js 15, `NODE_ENV=production`, Node.js 22.23.5, PostgreSQL local |
| Système (vérifié) | Linux x86_64, GNU libc **2.34** |
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
| Avant déploiement et en CI | `ops/check-native.mjs` | binaires natifs : architecture, glibc exigée, bibliothèques dynamiques, chargement réel (aucun binutils requis) |
| Après déploiement vérifié | `ops/cleanup.sh` | suppression des restes transitoires de `sciences-interactives` uniquement (simulation par défaut) |
| Pull request | `.github/workflows/runtime-resources.yml` | contrôles statiques, revue des dépendances, sonde |

## Compatibilité de l'artefact (glibc 2.34, Linux x86_64, Node 22.23.5)

Principe : `.next` (JavaScript) ne dépend pas de la plateforme de build. Seuls les binaires natifs de `node_modules` en dépendent ; ce sont des paquets npm **précompilés** (pas compilés sur le runner) : ce qui compte est la glibc qu'ils exigent, pas celle d'`ubuntu-latest` (2.39).

Binaires natifs de l'arborescence de production (`npm ci --omit=dev`), mesurés par `ops/check-native.mjs` (en-têtes ELF) :

| Binaire | glibc exigée | Autres exigences | Utilisé par l'application |
|---|---|---|---|
| `@next/swc-linux-x64-gnu` | ≥ 2.17 | libgcc ≥ 4.2.0 | oui (runtime Next.js, source des threads Tokio) |
| `@img/sharp-linux-x64` (`.node`) | ≥ 2.17 | GLIBCXX ≥ 3.4.21 | non (`next/image` n'est pas utilisé) ; chargé uniquement si une image est optimisée |
| `@img/sharp-libvips-linux-x64` | ≥ 2.28 | GLIBCXX ≥ 3.4.22 | non (dépendance de sharp) |
| variantes `musl` (swc, sharp, libvips) | — | — | non : ignorées, inutilisables avec la glibc |

Tous ≤ 2.28 < 2.34 : compatibles avec VinaHost. Chargement réel (`process.dlopen`) réussi pour swc et sharp sur la machine de test (glibc 2.39). La preuve sur une vraie glibc 2.34 est le job `native-glibc234` du workflow (conteneur AlmaLinux 9, glibc 2.34). L'autorité finale reste `ops/preflight.sh` lancé sur l'hébergement avec le `node_modules` réel.

Nécessaire sur l'hôte : `libstdc++.so.6` (GLIBCXX ≥ 3.4.22) et `libgcc_s.so.1` ; `ops/check-native.mjs` compare avec les bibliothèques présentes et signale l'absence.

Tailles mesurées (production, `npm ci --omit=dev`) : `node_modules` ≈ 548 Mo, dont 137 Mo pour la variante musl de SWC et 19 Mo pour libvips musl, inutilisées.

### Options de build (proposition, non mise en œuvre)

| Option | Avantage | Inconvénient |
|---|---|---|
| A. Build sur `ubuntu-latest`, vérification sur AlmaLinux 9 (retenue pour l'instant) | rapide ; déjà utilisée par `pr-checks.yml` ; aucun risque glibc tant que `check-native` passe | la preuve de chargement est séparée du build |
| B. Tout le build dans un conteneur AlmaLinux 9 | même glibc que l'hébergement, y compris pour la sonde | plus lent ; image à maintenir ; apporte peu puisque `.next` est indépendant de la plateforme |
| C. Artefact sans `node_modules`, installé sur l'hébergement | transfert léger | `npm ci` sur l'hébergement : consomme threads et mémoire du quota, donc contraire à la règle « aucun build lourd sur l'hébergement » |

Le mécanisme de transfert de l'artefact (copie, `SHA256SUMS`, élagage des variantes musl) reste **à décider** ; rien n'est déployé automatiquement.

## Espace disque (quota cPanel)

Le plafond est le **quota du compte**, pas la partition du serveur : `df -h` n'est jamais utilisé. Relevé cPanel → Disk Usage du 2026-11-27 (hébergement partagé avec WordPress BAYDE24H) :

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

Politique : au plus **un** staging et **un** rollback ; au moins **1 024 Mo** libres au pic de la préparation et après déploiement (rollback en place) ; `node_modules` reste un lien CloudLinux vers `nodevenv` ; rien n'est supprimé hors de `sciences-interactives`. Contrôle : `ops/disk-check.sh` (quota lu par `quota` si possible, sinon fourni avec `--quota-mb` / `--used-mb` relevés dans cPanel ; refus si le quota est inconnu). Nettoyage : `ops/cleanup.sh`.

Modèle de calcul du pic (en Mo) :

- préparation et bascule : occupation + artefact + version décompressée + `public/uploads` copié + nouveau `node_modules` (0 si le lock est inchangé) + marge (100) ; l'ancien rollback et l'artefact existent encore ;
- après nettoyage : occupation + version + uploads + nouveau `node_modules` − ancien rollback − rollback.prev + marge ;
- retour arrière : échange de noms, donc le même état que « après nettoyage ».

Exemple (version mesurée localement : archive 3,1 Mo, 11 Mo décompressée sans `.next/cache` ni `node_modules` ; uploads de production inconnus) : pic ≈ 2 969,08 + 3,1 + 11 + 100 ≈ 3 083 Mo, soit ≈ 4 085 Mo libres avant déduction des uploads. Avec un nouveau `node_modules` de 548 Mo : ≈ 3 537 Mo libres. Le disque n'est donc pas la contrainte tant que l'artefact reste léger. Il le deviendrait si l'on copiait telle quelle l'arborescence actuelle : `sciences-interactives` fait 323,78 Mo (très probablement `.next/cache`, 343 Mo mesurés localement après un build ; à confirmer avec `du -sm` sur l'hébergement), un cache de build que le runtime n'utilise pas.

`nodevenv` (753,62 Mo) contient déjà un `node_modules` : un second exemplaire complet de 548 Mo n'y tient qu'en conservant le quota ci-dessus ; la décision sur les dépendances (installation par cPanel ou artefact) reste à prendre.

## Risques et limites connus

1. Les images téléversées par `/api/admin/upload` sont écrites dans `public/uploads` : **elles répondent 404 jusqu'au redémarrage suivant** de l'application (mesuré avec `ops/server.js`). Un déploiement qui remplace le dossier de l'application les efface. Déplacement non approuvé : à traiter séparément.
2. RESTART/STOP cPanel non fiables le 2026-11-27 : voir `incident-2026-11-27.md`. Toujours vérifier avec `ops/verify.sh`.
3. NPROC partagé avec WordPress/PHP : un pic PHP peut provoquer « Unable to fork » même avec Node à 13 threads.
4. Tout composant dimensionné sur le nombre de CPU visibles (56) peut réintroduire le problème ; la garde ne couvre que Tokio.
5. Mémoire : 515 Mo mesurés en charge extrême (60 requêtes en parallèle) sur le poste de test ; aucune limite de heap n'est imposée (non approuvé).
