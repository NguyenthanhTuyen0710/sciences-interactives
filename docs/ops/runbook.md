# Runbook de déploiement et de retour arrière (VinaHost)

Principes : build en CI, jamais sur l'hébergement ; **la racine de l'application n'est jamais renommée** ; un redémarrage cPanel n'est **jamais** présumé réussi ; aucun `kill -9`, `pkill`, `killall` ni arrêt automatique (SIGTERM sur PID vérifié, un à la fois) ; le PPID n'est jamais un critère d'arrêt (LiteSpeed le fait passer à 1 en fonctionnement normal) ; un seul déploiement à la fois (`ops/deploy-lock.sh`).
Le déploiement reste **manuel** : aucune automatisation n'est livrée avec PR #72 (flux A automatisable après acceptation ; flux B bloqué, voir `production.md`).

## A. Contrôle en lecture seule sur l'hébergement (à faire avant tout déploiement)

Ne modifie ni l'application, ni `server.js`, ni `node_modules`, ni les secrets, ni la base ; n'installe rien ; ne redémarre rien ; n'affiche aucune valeur secrète. Les scripts sont placés dans un dossier temporaire **hors** de la racine de l'application.
`preflight.sh` lance brièvement (un à la fois, 30 s au plus) des processus Node pour charger les binaires natifs réels ; il refuse de le faire si la marge NPROC est insuffisante.

1. Récupérer `ops/` au commit relu (remplacer `<SHA>` par le SHA complet du commit de PR #72 validé).

   Option 1 — depuis GitHub (dépôt accessible depuis l'hébergement) :

   ```bash
   mkdir -p ~/si-ops-check && cd ~/si-ops-check && git init -q . && git remote add origin https://github.com/NguyenthanhTuyen0710/sciences-interactives.git
   git fetch -q --depth 1 origin <SHA> && git checkout -q FETCH_HEAD -- ops && git rev-parse FETCH_HEAD
   ```

   La dernière commande doit afficher exactement `<SHA>`. Aucun `git pull` dans la racine de l'application.

   Option 2 — sans accès à GitHub : envoyer `ops-<SHA12>.tar.gz` et son `.sha256` dans `~/si-ops-check` avec le Gestionnaire de fichiers cPanel, puis :

   ```bash
   cd ~/si-ops-check && sha256sum -c ops-<SHA12>.tar.gz.sha256 && tar xzf ops-<SHA12>.tar.gz
   ```

2. Repérer le processus de l'application (même dossier, binaire `node`) :

   ```bash
   APP=/home/tkuyhwlk/sciences-interactives; NODE=/opt/alt/alt-nodejs22/root/usr/bin/node
   PID=$(for p in $(pgrep -u "$(id -un)"); do [ "$(readlink /proc/$p/cwd 2>/dev/null)" = "$APP" ] && readlink /proc/$p/exe 2>/dev/null | grep -q '/node$' && echo $p; done | head -1); echo "PID=${PID:-aucun}"
   ```

   Si aucun processus n'apparaît, l'application n'est pas démarrée (lsnode démarre à la demande) : charger une page du site, puis relancer.

3. Contrôles (verdict par nom de variable, jamais de valeur) :

   ```bash
   cd ~/si-ops-check
   "$NODE" ops/check-config.mjs --env-from-pid "$PID"                                              # AUTH_SECRET, TEACHER_INVITE_CODE, ALLOW_DEMO_SECRETS : PASS/FAIL
   bash ops/preflight.sh --app-dir "$APP" --node "$NODE" --env-from-pid "$PID"                     # Node, dépendances réelles, binaires natifs, typescript, server.js, variables, NPROC, mémoire
   bash ops/disk-check.sh --app-dir "$APP" --quota-mb 7168 --used-mb 2969.08 --artifact-mb 3.1 --release-mb 11
   ```

   Résultats attendus **avant** le déploiement de PR #72 : `server.js` différent de `ops/server.js` et sans garde Tokio (FAIL : c'est l'état actuel) ; `TOKIO_WORKER_THREADS` présente ; binaires natifs et dépendances conformes. Toute autre ligne FAIL ou SKIP est à traiter avant d'aller plus loin. `--used-mb` : valeur la plus haute de cPanel → Disk Usage au moment du contrôle.

## B. Préparation d'un déploiement

1. `ops/deploy-lock.sh acquire deploy` (refus si un déploiement, un retour arrière ou un nettoyage est en cours).
2. Télécharger l'artefact vérifié par la CI (nom `sciences-interactives-<sha>`), vérifier `sha256sum -c`, et contrôler que `RELEASE.json` porte le commit attendu.
3. `ops/disk-check.sh` avec les tailles réelles de l'artefact et de la version (0 échec obligatoire ; refus si le quota, une taille ou le lien `node_modules` pose problème).
4. Décompresser dans `$APP/.release/staging` (jamais ailleurs). `node_modules` et `public/` ne font pas partie de l'artefact : le lien CloudLinux et `public/uploads` ne sont ni copiés ni déplacés.
5. `ops/preflight.sh --app-dir "$APP" --release-dir "$APP/.release/staging" --node "$NODE" --env-from-pid "$PID"` : **flux A** si « node_modules conforme au lock » ; sinon **flux B : arrêter** et demander l'approbation manuelle (rien n'est installé sur l'hébergement).
6. Sauvegarder : dump PostgreSQL (lecture seule sur la base).

## C. Bascule (application arrêtée)

1. Noter l'heure `T0` (`date +%s`) et les PID Node actuels.
2. Si `.release/rollback` existe, le renommer en `.release/rollback.prev`.
3. STOP APP dans cPanel, puis **vérifier que l'ancien processus a disparu** (`ops/verify.sh` ou `ps`). S'il subsiste : section F, ne pas continuer.
4. Pour chacun de `.next`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, `RELEASE.json` : `mv "$APP/<élément>" "$APP/.release/rollback/"` puis `mv "$APP/.release/staging/<élément>" "$APP/"` (renommages au sein d'une même partition : aucune copie).
5. START APP.

## D. Vérification (obligatoire)

```bash
VERIFY_STUDENT_EMAIL=… VERIFY_STUDENT_PASSWORD=… VERIFY_TEACHER_EMAIL=… VERIFY_TEACHER_PASSWORD=… \
  bash ~/si-ops-check/ops/verify.sh --base-url https://starluxvn.com --app-dir "$APP" --deployed-at <T0> --old-pids "<anciens PID>"
```

Identifiants : comptes de test dédiés, par l'environnement (jamais en argument, jamais versionnés). Sans eux, les contrôles de connexion sont SKIP : **non validés**.
Attendu : 0 échec ; processus plus récents que `T0` ; Tokio ≤ 3 (2 attendu), threads ≈ 13 ; aucun enfant ; anciens PID disparus ; NPROC sous 60 % du quota. Le PPID s'affiche à titre d'information.

## E. Retour arrière

Déclencheurs : échec de `ops/verify.sh`, application en erreur, marge NPROC insuffisante.

1. `ops/deploy-lock.sh acquire rollback` si le verrou a été levé ; STOP APP et vérifier l'arrêt du processus.
2. Pour chaque élément : `mv "$APP/<élément>" "$APP/.release/failed/"` puis `mv "$APP/.release/rollback/<élément>" "$APP/"` ; s'il existe, remettre `.release/rollback.prev` en `.release/rollback`.
3. START APP, puis refaire la section D (`--deployed-at` = heure du retour arrière). Flux B : le retour arrière devrait aussi restaurer les dépendances (non mis en œuvre).
4. Consigner la cause (un arrêt de configuration nomme la variable fautive, jamais la valeur).

## F. Si d'anciens processus subsistent

1. Critère unique : processus Node du même utilisateur, même dossier d'application (`readlink /proc/<pid>/cwd`), **démarré avant `T0`** (`ops/verify.sh --deployed-at` les liste). Jamais le PPID. Conserver la sortie de `ps -eo pid,ppid,lstart,etimes,nlwp,rss,args --forest` pour VinaHost.
2. Un PID à la fois : `kill -TERM <pid>` ; attendre 10 s ; relancer `ops/verify.sh`.
3. Si le processus subsiste : ne pas escalader, contacter VinaHost avec la sortie ci-dessus.

## G. Nettoyage (seulement après une vérification réussie)

```bash
bash ~/si-ops-check/ops/cleanup.sh --app-dir "$APP"                    # simulation : liste ce qui serait supprimé
ops/deploy-lock.sh release                                              # lever le verrou de déploiement avant de nettoyer
bash ~/si-ops-check/ops/cleanup.sh --app-dir "$APP" --apply --verified  # --verified atteste que verify.sh vient de réussir
```

Liste fermée sous `$APP/.release/` : `rollback.prev`, `failed`, `staging`, `artifact.tar.gz`(`.sha256`). Jamais supprimés : la production, `.release/rollback` (le seul rollback conservé), le lien `node_modules`, `nodevenv`, `public/uploads`, `public_html`, WordPress, bases de données, courriers, tout autre chemin. `cleanup.sh` refuse pendant un déploiement ou un retour arrière (verrou), refuse un lien symbolique parmi ses cibles ou un `.release` détourné, et prend lui-même le verrou pendant son exécution.
Ni `.npm`, ni caches cachés (317 Mo), ni `public_html` ne sont touchés : leur nettoyage éventuel est une décision séparée.

## H. Avant de déployer le groupe « secrets de production »

`check-config.mjs --env-from-pid` (section A) doit afficher PASS pour `AUTH_SECRET`, `TEACHER_INVITE_CODE` et `ALLOW_DEMO_SECRETS`. Sinon la nouvelle version refusera de démarrer : décider d'abord, avec le porteur du projet, du changement de valeur (changer `AUTH_SECRET` déconnecte tous les utilisateurs ; ne pas le faire par surprise).
