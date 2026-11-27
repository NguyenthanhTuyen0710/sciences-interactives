# Runbook de déploiement et de retour arrière (VinaHost)

Principes : le PPID d'un processus n'est jamais un critère d'arrêt (LiteSpeed le fait passer à 1 en fonctionnement normal) ; build en CI (jamais sur l'hébergement) ; un redémarrage cPanel n'est **jamais** présumé réussi ; aucun `kill -9`, `pkill`, `killall` ni arrêt automatique ; SIGTERM sur PID vérifié, un par un.
Le **mode de transfert de l'artefact reste à décider** (voir `production.md`) : les étapes décrivent les contrôles, pas la copie.

## 0. Avant de déployer le groupe « secrets de production »

Vérifier que l'application en cours utilise déjà des valeurs propres, sans les afficher :

```bash
ops/preflight.sh --env-from-pid <PID du processus node actuel>
```

`AUTH_SECRET` et `TEACHER_INVITE_CODE` doivent être « définie ». Si l'une reprend une valeur publique du dépôt, la nouvelle version refusera de démarrer : décider d'abord, avec le porteur du projet, du changement de valeur (changer `AUTH_SECRET` déconnecte tous les utilisateurs ; ne pas le faire par surprise). `ops/preflight.sh` ne sait pas détecter une valeur publique : seul le démarrage de la nouvelle version la refuse.

## 1. Préparation

1. Noter l'état courant : `ops/preflight.sh --env-from-pid <PID>` (processus existants, marge NPROC, binaires natifs). `node` n'est pas dans le PATH du shell : le script trouve `/opt/alt/alt-nodejs22/root/usr/bin/node` ; sinon `--node <chemin>`.
2. Sauvegarder : dossier actuel de l'application, **`public/uploads`**, dump PostgreSQL (lecture seule sur la base).
3. Vérifier l'artefact : `SHA256SUMS`, Node 22.23.5, `server.js` identique à `ops/server.js`.

## 2. Déploiement

1. Noter l'heure `T0` (`date +%s`) et les PID Node actuels.
2. Installer la nouvelle version dans un nouveau dossier ; conserver l'ancien. Reporter `public/uploads`. Ne pas toucher aux variables cPanel (`TOKIO_WORKER_THREADS=2` doit rester).
3. `ops/preflight.sh --app-dir <nouveau dossier> --env-from-pid <PID>` : aucun échec.
4. Basculer le dossier d'application, puis **RESTART APP** dans cPanel.

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

1. Restaurer le dossier précédent et son `server.js` (la base n'est pas modifiée par ce déploiement ; ne restaurer le dump qu'en cas de migration, hors périmètre ici).
2. Remettre `public/uploads` si besoin.
3. RESTART APP, puis refaire l'étape 3 (`--deployed-at` = heure du retour arrière).
4. Consigner la cause (un arrêt de configuration nomme la variable fautive, jamais la valeur).
