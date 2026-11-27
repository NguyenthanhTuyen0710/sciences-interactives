# Runbook de déploiement et de retour arrière (VinaHost)

Principes : le PPID d'un processus n'est jamais un critère d'arrêt (LiteSpeed le fait passer à 1 en fonctionnement normal) ; build en CI (jamais sur l'hébergement) ; un redémarrage cPanel n'est **jamais** présumé réussi ; aucun `kill -9`, `pkill`, `killall` ni arrêt automatique ; SIGTERM sur PID vérifié, un par un.
Le **mode de transfert de l'artefact reste à décider** (voir `production.md`) : les étapes décrivent les contrôles, pas la copie.

## 0. Avant de déployer le groupe « secrets de production »

Vérifier que l'application en cours utilise déjà des valeurs propres, sans les afficher :

```bash
ops/preflight.sh --env-from-pid <PID du processus node actuel>
```

`AUTH_SECRET` et `TEACHER_INVITE_CODE` doivent être « définie ». Si l'une reprend une valeur publique du dépôt, la nouvelle version refusera de démarrer : décider d'abord, avec le porteur du projet, du changement de valeur (changer `AUTH_SECRET` déconnecte tous les utilisateurs ; ne pas le faire par surprise). `ops/preflight.sh` ne sait pas détecter une valeur publique : seul le démarrage de la nouvelle version la refuse.

## Disposition sur l'hébergement (un seul staging, un seul rollback)

| Chemin (dans `$HOME`) | Rôle |
|---|---|
| `sciences-interactives` | version en production (chemin enregistré dans cPanel, inchangé) |
| `sciences-interactives.staging` | nouvelle version en préparation (au plus une) |
| `sciences-interactives.rollback` | version précédente, conservée (au plus une) |
| `sciences-interactives.rollback.prev`, `.failed`, `.artifact.tar.gz`(`.sha256`) | transitoires, supprimés par `ops/cleanup.sh` |
| `sciences-interactives/node_modules` | **lien symbolique CloudLinux vers `~/nodevenv/…` : jamais remplacé, jamais copié, jamais supprimé** |

L'artefact ne contient ni `node_modules` ni `.next/cache`. Le staging reçoit un lien `node_modules` identique à celui de la production (`cp -P` ou `ln -s "$(readlink sciences-interactives/node_modules)"`). Si `package-lock.json` change, les dépendances relèvent d'une décision séparée (voir `production.md`).
Le quota qui compte est celui de cPanel (7 168 Mo) et non `df -h`, qui montre la partition du serveur.

## 1. Préparation

1. Relever dans cPanel → Disk Usage : « Disk Quota » et la plus haute des valeurs d'occupation (« Total Disk Space Used » ; 2 969,08 Mo le 2026-11-27).
2. `ops/disk-check.sh --quota-mb <quota> --used-mb <occupation> --artifact <archive> --release-mb <taille décompressée> [--node-modules-mb <Mo>]` (point décimal : `2969.08`). Condition : **0 échec**. Sans taille d'artefact ou de version, ou sans quota lisible, le script refuse. Marge exigée : au moins 1 024 Mo libres au pic de la préparation et après déploiement avec le rollback en place.
3. `ops/preflight.sh --env-from-pid <PID>` (processus existants, marge NPROC, binaires natifs, variables).
4. Sauvegarder : dump PostgreSQL (lecture seule sur la base) et `public/uploads`.
5. Vérifier l'artefact : `SHA256SUMS`, Node 22.23.5, `server.js` identique à `ops/server.js`.

## 2. Déploiement

1. Noter l'heure `T0` (`date +%s`) et les PID Node actuels.
2. Décompresser l'artefact dans `sciences-interactives.staging` ; recréer le lien `node_modules` ; copier `public/uploads`. Ne pas toucher aux variables cPanel (`TOKIO_WORKER_THREADS=2` doit rester).
3. `ops/preflight.sh --app-dir <staging> --env-from-pid <PID>` : aucun échec.
4. Si un `sciences-interactives.rollback` existe : le renommer en `sciences-interactives.rollback.prev` (renommage, aucun espace consommé).
5. STOP APP dans cPanel, puis **vérifier que l'ancien processus est arrêté** (`ops/verify.sh` ou `ps`) ; ne rien présumer.
6. `mv sciences-interactives sciences-interactives.rollback`, puis `mv sciences-interactives.staging sciences-interactives` (renommages au sein d'une même partition : aucune copie, donc aucun pic supplémentaire).
7. START APP.

## 3. Vérification (obligatoire)

```bash
VERIFY_STUDENT_EMAIL=… VERIFY_STUDENT_PASSWORD=… VERIFY_TEACHER_EMAIL=… VERIFY_TEACHER_PASSWORD=… \
  ops/verify.sh --base-url https://starluxvn.com --app-dir <dossier> --deployed-at <T0> --old-pids "<anciens PID>"
```

Identifiants : comptes de test dédiés, passés par l'environnement (jamais en argument, jamais dans un fichier versionné). Sans eux, les contrôles de connexion sont SKIP : **non validés**.
Attendu : 0 échec ; processus plus récents que `T0` ; Tokio = 2, threads ≈ 13 ; aucun enfant ; anciens PID disparus ; NPROC sous 60 % du quota. Le PPID s'affiche à titre d'information (PPID=1 est normal).

## 4. Si d'anciens processus subsistent

1. Les identifier par un seul critère : processus Node du même utilisateur, de même dossier d'application (`readlink /proc/<pid>/cwd`), **démarré avant `T0`** (`ops/verify.sh --deployed-at` les liste). Ne jamais se fonder sur le PPID. `ps -eo pid,ppid,lstart,etimes,nlwp,rss,args --forest` : conserver la sortie pour VinaHost.
2. Un PID à la fois : `kill -TERM <pid>` ; attendre 10 s ; relancer `ops/verify.sh`.
3. Si le processus subsiste : ne pas escalader, contacter VinaHost avec la sortie ci-dessus.

## 5. Retour arrière

Déclencheurs : échec de `ops/verify.sh`, application en erreur, marge NPROC insuffisante.

1. STOP APP et vérifier l'arrêt du processus.
2. `mv sciences-interactives sciences-interactives.failed` ; `mv sciences-interactives.rollback sciences-interactives` ; s'il existe, `mv sciences-interactives.rollback.prev sciences-interactives.rollback`. Renommages seulement : aucun espace supplémentaire, d'où le calcul du pic de `ops/disk-check.sh`.
3. `public/uploads` : récupérer les fichiers ajoutés depuis la bascule (`sciences-interactives.failed/public/uploads`), sans rien écraser.
4. START APP, puis refaire l'étape 3 (`--deployed-at` = heure du retour arrière). La base n'est pas modifiée par ce déploiement ; ne restaurer le dump qu'en cas de migration, hors périmètre ici.
5. Consigner la cause (un arrêt de configuration nomme la variable fautive, jamais la valeur), puis nettoyer (section 6).

## 6. Nettoyage (seulement après une vérification réussie)

```bash
ops/cleanup.sh                      # simulation : liste ce qui serait supprimé
ops/cleanup.sh --apply --verified   # suppression réelle ; --verified atteste que ops/verify.sh vient de réussir
```

Liste fermée : `.rollback.prev`, `.failed`, `.staging`, `.artifact.tar.gz` et son `.sha256`. Jamais supprimés : la production, `sciences-interactives.rollback` (le seul rollback conservé), le lien `node_modules`, `nodevenv`, `public/uploads`, `public_html`, les bases de données et tout autre chemin. Un lien symbolique parmi les cibles est refusé.
Le script ne supprime rien en dehors de `sciences-interactives`. Un fichier hors périmètre (WordPress BAYDE24H, `.npm`, caches cachés de 317 Mo) n'est jamais touché ; leur nettoyage éventuel est une décision séparée.
