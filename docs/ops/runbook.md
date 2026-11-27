# Runbook de déploiement — VinaHost, flux A (dépendances inchangées)

Ce document est la **seule** procédure de déploiement et de retour arrière. Il décrit un déploiement **manuel** : aucune automatisation n'existe ni n'est prévue avant acceptation du premier déploiement.

## Règles qui s'appliquent à chaque étape

- Chaque étape donne : la commande, le résultat attendu, la **condition d'arrêt**. Si une condition d'arrêt se réalise : s'arrêter, ne pas continuer, consigner la sortie.
- La racine de l'application n'est **jamais renommée**. Une version = `.next`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, `RELEASE.json`, échangée par renommage **dans** la racine. `node_modules` (lien CloudLinux), `public/` et `public/uploads` ne sont jamais touchés.
- Jamais `kill -9`, `pkill`, `killall`. SIGTERM seulement, sur un PID vérifié, un à la fois. Le PPID n'est jamais un critère (il passe à 1 en fonctionnement normal sous LiteSpeed).
- Un redémarrage cPanel n'est jamais présumé réussi : il est vérifié par les processus réels.
- Aucune valeur secrète n'est affichée, copiée dans un message, un fichier ou l'historique du shell. Les mots de passe se saisissent avec `read -s`.
- Rien n'est construit ni installé sur l'hébergement (`npm ci`, `npm install` et build interdits).
- **Non prouvé** : que le renommage de fichiers dans la racine, application arrêtée, se comporte comme prévu sous LiteSpeed/cPanel. Cette procédure ne le suppose pas : elle le vérifie à chaque étape et prévoit un retour arrière. La répétition de l'annexe A est recommandée avant le premier déploiement réel.
- Tout se fait dans **une seule session SSH** (les variables et fonctions définies à l'étape 3 y sont réutilisées).

## Phase 0 — Conditions préalables

| Condition | Vérification |
|---|---|
| PR #72 fusionnée dans `main` par le propriétaire | page de la PR : « Merged » |
| Aucun autre changement en attente sur `main` à déployer en même temps | `git log` de `main` |
| Fenêtre de déploiement choisie (faible trafic), propriétaire disponible 2 h, surveillance prévue 48 h | décision du propriétaire |
| Contact VinaHost prêt (sortie des commandes de l'étape 15 à fournir) | — |
| Décision sur les comptes de test (étape 7) | propriétaire |
| Répétition de l'annexe A faite, ou décision explicite de s'en passer | propriétaire |

**Arrêt si** une condition manque.

## Étape 1 — Construire l'artefact officiel (GitHub)

Aucun workflow ne se lance sur `push` vers `main` (pas de déploiement automatique). L'artefact se construit par lancement manuel :

1. GitHub → *Actions* → *Runtime Resources* → *Run workflow* → branche `main`.
2. Attendre la fin des 2 jobs (« Binaires natifs sur glibc 2.34 », « Ressources du runtime et artefact de déploiement »).

Attendu : 2 jobs verts ; artefact `sciences-interactives-<SHA de main>` (≈ 3,3 Mo, conservé 7 jours).
**Arrêt si** un job est rouge, ou si `main` a avancé depuis le lancement (relancer).

## Étape 2 — Télécharger et contrôler l'artefact (poste local)

Télécharger l'artefact GitHub (zip), le décompresser : il contient `sciences-interactives-<sha12>.tar.gz` et `.sha256`.

```bash
SHA=$(git rev-parse origin/main); S12=${SHA:0:12}; echo "$SHA"
```

```bash
sha256sum -c sciences-interactives-$S12.tar.gz.sha256 && tar -xzOf sciences-interactives-$S12.tar.gz RELEASE.json | grep -E '"(commit|node|platform|next)"'
```

Attendu : `OK` ; `commit` = `$SHA` ; `node` v22.23.5 ; `platform` linux-x64.
**Arrêt si** la somme est fausse ou si le commit n'est pas celui de `main`.

## Étape 3 — Variables de session et bibliothèque de contrôle (hôte)

Se connecter en SSH, puis (remplacer `<SHA>` par le SHA complet de l'étape 2) :

```bash
APP=/home/tkuyhwlk/sciences-interactives; NODE=/opt/alt/alt-nodejs22/root/usr/bin/node; SHA=<SHA>; S12=${SHA:0:12}; OPS=$HOME/si-ops-$S12; R="$APP/.release"
```

```bash
app_pids() { for p in $(pgrep -u "$(id -un)"); do [ "$(readlink /proc/$p/cwd 2>/dev/null)" = "$APP" ] && readlink /proc/$p/exe 2>/dev/null | grep -Eq '/(node|lsnode)$' && echo $p; done; }; PID=$(app_pids | head -1); echo "PID=${PID:-aucun} ; processus de l'application : $(app_pids | wc -l)"
```

Attendu : un PID. Si « aucun » : ouvrir une page du site (lsnode démarre à la demande) puis relancer la commande.
**Arrêt si** plusieurs instances apparaissent sans explication : noter leurs âges (`ps -o pid,ppid,etimes,rss,nlwp -p <pid>`) et poursuivre seulement si elles sont toutes récentes et connues ; sinon contacter VinaHost.

## Étape 4 — Récupérer `ops/` du même commit (hôte, lecture seule)

Option 1, depuis GitHub :

```bash
mkdir -p "$OPS" && cd "$OPS" && git init -q . && git remote add origin https://github.com/NguyenthanhTuyen0710/sciences-interactives.git && git fetch -q --depth 1 origin "$SHA" && git checkout -q FETCH_HEAD -- ops && git rev-parse FETCH_HEAD
```

Option 2 (sans accès à GitHub) : envoyer `ops-$S12.tar.gz` (produit par `git archive --format=tar.gz -o ops-$S12.tar.gz $SHA ops`) et son `.sha256` dans `$OPS`, puis `cd "$OPS" && sha256sum -c ops-$S12.tar.gz.sha256 && tar xzf ops-$S12.tar.gz`.

Attendu : `git rev-parse` affiche exactement `$SHA` (option 1) ; `ls "$OPS/ops"` liste les scripts.
**Arrêt si** le SHA diffère.

## Étape 5 — Contrôles préalables, lecture seule

```bash
cd "$OPS" && "$NODE" ops/check-config.mjs --env-from-pid "$PID"
```

Attendu : `PASS` pour `AUTH_SECRET`, `TEACHER_INVITE_CODE`, `ALLOW_DEMO_SECRETS` (inactif). **Arrêt si** un `FAIL` (la nouvelle version refuserait de démarrer ; ne rien changer sans décision du propriétaire : changer `AUTH_SECRET` déconnecte tous les utilisateurs).

```bash
cd "$OPS" && bash ops/preflight.sh --app-dir "$APP" --node "$NODE" --env-from-pid "$PID"
```

Attendu : tout `ok`, sauf **exactement** : `server.js` sans garde Tokio et différent de la référence (état actuel), et `SHA256SUMS absent` (SKIP). Lignes à voir : Node 22.23.5, `typescript présent`, dépendances conformes au lock, binaires natifs « chargé », `TOKIO_WORKER_THREADS=2`, marge NPROC ≥ 40.
**Arrêt si** une autre ligne `FAIL` ou `SKIP` apparaît, notamment `node_modules ≠ lock` (c'est le **flux B** : déploiement interdit sans approbation, voir `production.md`).

## Étape 6 — Quota et dimensionnement (cPanel + hôte)

1. cPanel → *Disk Usage* : relever le quota et la plus haute des occupations (« Total Disk Space Used »). Noter `USED_MB` (point décimal, ex. `2969.08`).
2. Estimation avant tout transfert :

```bash
cd "$OPS" && bash ops/disk-check.sh --app-dir "$APP" --quota-mb 7168 --used-mb <USED_MB> --artifact-mb 3.3 --release-mb 12.6
```

Attendu : 0 échec, ≥ 1 024 Mo libres au pic et après déploiement (≈ 4 080 Mo avec les mesures du 2026-11-27) ; `node_modules` : lien vers `nodevenv`.
**Arrêt si** un `FAIL` ou une donnée manquante.

## Étape 7 — Comptes de test (décision du propriétaire)

`ops/verify.sh` teste l'authentification et les rôles avec deux comptes **dédiés** (un élève, un enseignant). Créer ces comptes est une **écriture dans la base de production** (deux lignes dans `users`) : à décider explicitement. Sans eux, les contrôles de connexion sont `SKIP`, donc **non validés**.

Option : les créer à l'avance via la page d'inscription du site (l'inscription enseignant demande `TEACHER_INVITE_CODE`, connu du propriétaire). Puis, dans la session SSH, saisir (le mot de passe ne s'affiche ni ne reste dans l'historique) :

```bash
read -rp 'E-mail élève de test : ' VERIFY_STUDENT_EMAIL; read -rsp 'Mot de passe élève : ' VERIFY_STUDENT_PASSWORD; echo; read -rp 'E-mail enseignant de test : ' VERIFY_TEACHER_EMAIL; read -rsp 'Mot de passe enseignant : ' VERIFY_TEACHER_PASSWORD; echo; export VERIFY_STUDENT_EMAIL VERIFY_STUDENT_PASSWORD VERIFY_TEACHER_EMAIL VERIFY_TEACHER_PASSWORD
```

## Étape 8 — Sauvegarde PostgreSQL et vérification

Lire `DATABASE_URL` depuis le processus (sans l'afficher) et la convertir en variables `PG*` :

```bash
DBURL=$(tr '\0' '\n' < /proc/$PID/environ | sed -n 's/^DATABASE_URL=//p'); [ -n "$DBURL" ] && echo "DATABASE_URL lue (non affichée)"; eval "$(DBURL="$DBURL" "$NODE" -e 'const u=new URL(process.env.DBURL);const q=s=>"\x27"+String(s).replace(/\x27/g,"\x27\\\x27\x27")+"\x27";console.log("export PGHOST="+q(u.hostname)+" PGPORT="+q(u.port||5432)+" PGUSER="+q(decodeURIComponent(u.username))+" PGPASSWORD="+q(decodeURIComponent(u.password))+" PGDATABASE="+q(u.pathname.slice(1)))')"; unset DBURL; echo "base : $PGDATABASE sur $PGHOST:$PGPORT"
```

```bash
command -v pg_dump pg_restore psql && mkdir -p ~/si-backups && chmod 700 ~/si-backups && B=~/si-backups/si-$(date +%Y%m%d-%H%M)-avant-$S12.dump && pg_dump --format=custom --no-owner --no-privileges --file "$B" && ls -l "$B" && sha256sum "$B" > "$B.sha256" && echo "sauvegarde : $B"
```

Vérification (lecture seule) :

```bash
pg_restore --list "$B" | grep -cE 'TABLE DATA public (users|attempts|custom_exercises|custom_chapters|collections|media)'; pg_restore --file=/dev/null "$B" && echo "archive lisible en entier"
```

```bash
psql -At -c "select 'users',count(*) from users union all select 'attempts',count(*) from attempts union all select 'custom_exercises',count(*) from custom_exercises union all select 'custom_chapters',count(*) from custom_chapters union all select 'collections',count(*) from collections union all select 'media',count(*) from media" | tee ~/si-backups/comptages-avant-$S12.txt
```

Attendu : le premier `grep -c` affiche `6` ; « archive lisible en entier » ; un fichier non vide ; les comptages sont notés (comparés après le déploiement : aucune ligne ne doit avoir changé à cause du déploiement).
**Arrêt si** `pg_dump` est introuvable, ou si une vérification échoue : ne pas déployer. Solution de repli : export par cPanel (phpPgAdmin ou sauvegarde de base) puis le même contrôle de taille et de lisibilité ; la procédure ne continue qu'avec une sauvegarde vérifiée.

## Étape 9 — Transférer l'artefact et l'installer en préparation

Envoyer `sciences-interactives-$S12.tar.gz` et son `.sha256` dans `$HOME/` (Gestionnaire de fichiers cPanel), puis :

```bash
mkdir -p "$R" && mv "$HOME/sciences-interactives-$S12.tar.gz" "$R/artifact.tar.gz" && mv "$HOME/sciences-interactives-$S12.tar.gz.sha256" "$R/artifact.tar.gz.sha256" && cd "$R" && echo "$(cut -d' ' -f1 artifact.tar.gz.sha256)  artifact.tar.gz" | sha256sum -c -
```

Attendu : `artifact.tar.gz: OK`. **Arrêt si** la somme est fausse (refaire le transfert).

```bash
bash "$OPS/ops/deploy-lock.sh" acquire deploy --app-dir "$APP"
```

Attendu : « verrou acquis (deploy) ». **Arrêt si** un verrou existe déjà (un autre déploiement, retour arrière ou nettoyage est peut-être en cours : lire son propriétaire, ne pas forcer).

```bash
mkdir -p "$R/staging" && tar -xzf "$R/artifact.tar.gz" -C "$R/staging" && ls -A "$R/staging" && grep '"commit"' "$R/staging/RELEASE.json" && cmp "$R/staging/server.js" "$OPS/ops/server.js" && echo "server.js identique à ops/server.js" && ls -d "$R/staging/node_modules" "$R/staging/public" "$R/staging/.next/cache" 2>&1 | grep -c 'No such file'
```

Attendu : liste exactement `.next next.config.ts package-lock.json package.json RELEASE.json server.js` ; commit = `$SHA` ; « server.js identique » ; la dernière commande affiche `3` (ni `node_modules`, ni `public`, ni `.next/cache`).
**Arrêt si** un écart.

## Étape 10 — Contrôles de la version en préparation (lecture seule)

```bash
cd "$OPS" && bash ops/preflight.sh --app-dir "$APP" --release-dir "$R/staging" --node "$NODE" --env-from-pid "$PID"
```

Attendu : mêmes lignes qu'à l'étape 5 ; en plus « node_modules conforme au lock : flux A possible ». Le contrôle de `server.js` concerne encore le fichier **actuel** (FAIL attendu).
**Arrêt si** `node_modules ≠ lock` ou si un binaire natif est incompatible.

```bash
cd "$OPS" && bash ops/disk-check.sh --app-dir "$APP" --quota-mb 7168 --used-mb <NOUVELLE_OCCUPATION_CPANEL> --artifact "$R/artifact.tar.gz" --release-mb $(du -sm "$R/staging" | cut -f1) --used-includes-artifact --used-includes-staging
```

(relever à nouveau l'occupation dans cPanel avant cette commande.) Attendu : 0 échec ; artefact conforme (sans `node_modules`, sans `public/`).
**Arrêt si** un `FAIL`.

## Étape 11 — Point de non-retour : liste de décision

Tous les éléments suivants doivent être vrais, sinon ne pas continuer :

- Étapes 5, 8 et 10 sans `FAIL` inattendu ; sauvegarde vérifiée.
- Verrou acquis ; staging identique à l'artefact contrôlé.
- Propriétaire présent ; fenêtre ouverte ; rollback compris (section « Retour arrière »).

## Étape 12 — Noter l'état initial

```bash
T0=$(date +%s); OLD_PIDS=$(app_pids | tr '\n' ' '); echo "T0=$T0 ; anciens PID : $OLD_PIDS"; ps -o pid,ppid,etimes,rss,nlwp,args -p $(echo $OLD_PIDS | tr ' ' ',') 2>/dev/null
```

Conserver cette sortie (elle sert à VinaHost en cas de problème).

## Étape 13 — STOP APP et vérification de l'arrêt

cPanel → *Setup Node.js App* → l'application → **STOP APP**. Puis :

```bash
for i in 1 2 3 4 5 6; do N=$(app_pids | wc -l); echo "essai $i : $N processus de l'application"; [ "$N" = 0 ] && break; sleep 10; done
```

Attendu : `0 processus` en moins de 60 s. Contrôle complémentaire : `ps -u "$(id -un)" -o pid,ppid,etimes,args | grep -c "[s]ciences-interactives"` doit afficher `0`.
**Arrêt si** un processus subsiste : ne pas toucher aux fichiers, passer à l'étape 14.

## Étape 14 — Si STOP APP est sans effet

Un processus actif garderait sa version en mémoire et son répertoire courant : ne jamais déplacer de fichiers tant qu'il vit.

1. Identifier chaque processus restant (même utilisateur, même dossier, binaire `node`/`lsnode`, **démarré avant `T0`**) :

```bash
for p in $(app_pids); do ps -o pid,ppid,etimes,rss,nlwp,args -p $p; done
```

2. Un PID à la fois, SIGTERM, puis attendre :

```bash
kill -TERM <PID> && sleep 10 && ps -p <PID> -o pid,etimes,args
```

3. Relancer la boucle de l'étape 13.
**Arrêt si** un processus survit à SIGTERM : ne pas escalader (jamais `kill -9`, jamais `pkill`). Lever le verrou (`bash "$OPS/ops/deploy-lock.sh" release --app-dir "$APP"`), garder la sortie des commandes précédentes et contacter VinaHost. Le déploiement est annulé ; rien n'a été modifié dans la racine.

## Étape 15 — Mettre en place la nouvelle version (application arrêtée, 0 processus)

```bash
mkdir -p "$R/rollback" "$R/failed" && cd "$APP" && for it in .next package.json package-lock.json next.config.ts server.js RELEASE.json; do [ -e "$APP/$it" ] && { mv -- "$APP/$it" "$R/rollback/$it" || { echo "ECHEC rangement $it"; break; }; }; mv -- "$R/staging/$it" "$APP/$it" || { echo "ECHEC mise en place $it"; break; }; done; echo "terminé"
```

Contrôle :

```bash
cd "$APP" && ls -A "$R/staging" | wc -l; grep '"commit"' RELEASE.json; cmp server.js "$OPS/ops/server.js" && echo "server.js = ops/server.js"; readlink node_modules; ls -d public/uploads 2>&1 | head -1; ls -A "$R/rollback"
```

Attendu : `0` élément restant dans le staging ; commit = `$SHA` ; `server.js = ops/server.js` ; `node_modules` pointe vers `/home/tkuyhwlk/nodevenv/sciences-interactives/22/lib/node_modules` ; `public/uploads` inchangé (inexistant tant qu'aucune image n'est téléversée) ; le rollback contient `.next`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js` (sans `RELEASE.json` : la version précédente n'en avait pas).
**Arrêt si** le message `ECHEC` apparaît ou si le contrôle diffère : exécuter immédiatement le retour arrière (section dédiée), **sans démarrer l'application**.

## Étape 16 — START APP

cPanel → **START APP**. Puis ouvrir `https://starluxvn.com/` dans un navigateur (démarre l'application à la demande) et :

```bash
sleep 5; echo "processus : $(app_pids | tr '\n' ' ')"; for p in $(app_pids); do ps -o pid,ppid,etimes,rss,nlwp -p $p; done
```

Attendu : un nouveau PID (âge < quelques minutes), 13 threads. Aucun ancien PID.
**Arrêt si** la page répond en erreur ou si aucun processus n'apparaît en 2 minutes : retour arrière (une erreur de configuration nomme la variable fautive dans le journal, jamais sa valeur).

## Étape 17 — Vérification complète (obligatoire)

```bash
cd "$OPS" && bash ops/verify.sh --base-url https://starluxvn.com --app-dir "$APP" --deployed-at $T0 --old-pids "$OLD_PIDS"
```

Attendu : `0 échec(s)`, `0 contrôle(s) non effectué(s)` (comptes de test fournis) ; accueil 200 (donc PostgreSQL joignable) ; connexion élève et enseignant ; `/admin` refusé sans connexion et aux élèves ; exercice servi sans clé de correction ; correction serveur ; Tokio ≤ 3 (2 attendu), threads ≈ 13 ; aucun enfant ; anciens PID disparus ; NPROC sous 60 %.
Contrôle de la configuration et des dépendances après bascule :

```bash
cd "$OPS" && bash ops/preflight.sh --app-dir "$APP" --node "$NODE" --env-from-pid "$(app_pids | head -1)"
```

Attendu : plus aucun `FAIL` : `server.js` est maintenant identique à la référence et contient la garde.
Comptages de la base (aucune ligne ne doit avoir changé à cause du déploiement, hors activité réelle des utilisateurs) :

```bash
psql -At -c "select 'users',count(*) from users union all select 'attempts',count(*) from attempts union all select 'custom_exercises',count(*) from custom_exercises union all select 'custom_chapters',count(*) from custom_chapters union all select 'collections',count(*) from collections union all select 'media',count(*) from media" | diff - ~/si-backups/comptages-avant-$S12.txt && echo "comptages identiques"
```

**Arrêt si** un `FAIL`, un `SKIP`, ou un comptage qui diminue : retour arrière.

## Étape 18 — Contrôles manuels

- Parcours élève : une série d'exercices, correction affichée.
- Espace enseignant : tableau de bord (compte de test).
- **WordPress / WP Toolkit** : ouvrir WP Toolkit et le site WordPress BAYDE24H : ils doivent fonctionner (c'était la victime de l'incident du 2026-11-27).
- Journal de l'application : repérer son emplacement (non vérifié sur cet hébergement : `ls -la "$APP"/*.log ~/logs 2>/dev/null`, ou l'écran de l'application dans cPanel) et chercher « Configuration de production invalide » ou des erreurs de démarrage.

**Arrêt si** un échec : retour arrière.

## Étape 19 — Clôture du déploiement

```bash
bash "$OPS/ops/deploy-lock.sh" release --app-dir "$APP"; unset VERIFY_STUDENT_PASSWORD VERIFY_TEACHER_PASSWORD PGPASSWORD; ls -A "$R"
```

Attendu : « verrou levé » ; `.release` contient `rollback/`, `artifact.tar.gz`(`.sha256`) (et `staging/` vide). **Ne pas nettoyer maintenant** : le rollback et l'artefact restent jusqu'à la fin de la surveillance. Conserver la sauvegarde `~/si-backups` (décision du propriétaire sur sa durée ; elle compte dans le quota).

## Retour arrière

**Déclencheurs** : échec d'une étape 15 à 18 ; application en erreur ou lente ; NPROC > 85 % ; RAM de l'application > 450 Mo de façon durable (référence : 256 Mo) ; erreurs de démarrage ; décision du propriétaire. Pendant la surveillance de 48 h, le retour arrière reste possible tant que `.release/rollback` n'a pas été nettoyé.

R1. Verrou : `bash "$OPS/ops/deploy-lock.sh" acquire rollback --app-dir "$APP"`.
R2. Noter `T1=$(date +%s)` et `OLD_PIDS=$(app_pids | tr '\n' ' ')`.
R3. **STOP APP** (cPanel) et vérifier l'arrêt complet (étape 13) ; si un processus subsiste, étape 14.
R4. Échange inverse :

```bash
mkdir -p "$R/failed" && cd "$APP" && for it in .next package.json package-lock.json next.config.ts server.js RELEASE.json; do [ -e "$APP/$it" ] && mv -- "$APP/$it" "$R/failed/$it"; [ -e "$R/rollback/$it" ] && mv -- "$R/rollback/$it" "$APP/$it"; done; echo "terminé"; ls -A "$APP" | head -30; readlink node_modules
```

Attendu : la version précédente est en place (sans `RELEASE.json` pour le premier déploiement) ; la version en échec est dans `.release/failed` ; le lien `node_modules` est inchangé ; `public/uploads` intact.
R5. **START APP**, puis `ops/verify.sh --deployed-at $T1 --old-pids "$OLD_PIDS"` : 0 échec.
R6. Lever le verrou (`release`), consigner la cause (journal, sortie de `verify.sh`) ; garder `.release/failed` pour l'analyse.
La base de données n'est pas modifiée par ce déploiement : la sauvegarde n'est restaurée que si une anomalie de données est constatée, hors périmètre de cette procédure.

## Surveillance pendant 48 h

À T+15 min, +1 h, +4 h, +24 h, +48 h, dans une session SSH (redéfinir `APP`, `NODE`, `OPS`, `app_pids` comme à l'étape 3) :

```bash
echo "NPROC : $(ps -eL -u "$(id -un)" --no-headers | wc -l)/165 ; RAM (RSS cumulé) : $(ps -u "$(id -un)" -o rss= | awk '{s+=$1} END{print int(s/1024)}')/2048 Mo"; for p in $(app_pids); do ps -o pid,etimes,rss,nlwp -p $p; done
```

```bash
cd "$OPS" && bash ops/verify.sh --base-url https://starluxvn.com --app-dir "$APP" --deployed-at $T0
```

| Indicateur | Normal | Alerte | Action |
|---|---|---|---|
| NPROC du compte | ≈ 20/165 | > 99 (60 %) | enquêter ; > 140 (85 %) : envisager le retour arrière |
| Threads de l'application | 13 | > 20 | enquêter (Tokio ≤ 3) |
| RSS de l'application | ≈ 250–350 Mo | > 450 Mo durable | enquêter, retour arrière si croissant |
| Instances | une (ou plusieurs récentes) | une instance plus ancienne que `T0` | étape 14 |
| Erreurs HTTP 5xx / démarrage | aucune | toute occurrence | journal, retour arrière |
| WordPress / WP Toolkit | fonctionnels | « Unable to fork » | retour arrière + VinaHost |

Le journal des erreurs de l'application est à consulter à chaque point (emplacement à confirmer, voir étape 18).

## Nettoyage (seulement après 48 h stables)

```bash
bash "$OPS/ops/cleanup.sh" --app-dir "$APP"
```

Simulation : elle liste ce qui serait supprimé (`artifact.tar.gz`, `.sha256`, `failed/`, `staging/` éventuel). Puis, après décision du propriétaire :

```bash
bash "$OPS/ops/cleanup.sh" --app-dir "$APP" --apply --verified
```

`--verified` atteste que `ops/verify.sh` vient de réussir. `.release/rollback` est **conservé** (seul rollback gardé) ; le lien `node_modules`, `public/uploads`, WordPress, les bases et tout autre chemin ne sont jamais touchés. Supprimer ensuite le dossier `$OPS` si désiré (`rm -r "$OPS"` : décision du propriétaire) et gérer la durée de conservation de `~/si-backups`.

## Annexe A — Répétition sur une application jetable (recommandée avant le premier déploiement)

But : observer, **sans toucher à la production**, le comportement de cPanel/LiteSpeed lors d'un arrêt, d'un renommage de fichiers dans la racine de l'application et d'un redémarrage.

1. cPanel → *Setup Node.js App* → créer une application jetable (Node 22, racine `~/si-repetition`, démarrage `server.js`). C'est une modification de configuration cPanel décidée par le propriétaire ; la supprimer à la fin.
2. Déposer un `server.js` minimal qui répond le contenu du fichier `.next/hello.txt` (« version A »), démarrer l'application et vérifier la réponse.
3. STOP APP ; vérifier avec une commande équivalente à `app_pids` (racine `~/si-repetition`) que tous les processus ont disparu ; noter les noms de processus (`ps -o pid,ppid,args`), l'emplacement des journaux, le délai d'arrêt.
4. Remplacer `.next/hello.txt` par « version B » par renommage (`mv`), START APP, vérifier la réponse ; refaire le retour arrière et vérifier « version A ».
5. Noter tout comportement inattendu (processus qui survit, cache de répertoire, erreurs de journal) : à traiter avant le déploiement réel. Supprimer l'application jetable.

Si la répétition n'est pas faite, le premier déploiement réel en tient lieu, avec le retour arrière prêt.

## Annexe B — Ce qui est vérifié et ce qui ne l'est pas

| Élément | État |
|---|---|
| Artefact (contenu, SHA-256, dépendances, binaires natifs, démarrage, API, authentification, correction, ressources) | **Vérifié** en local et en CI (smoke test, glibc 2.34 en conteneur) |
| Échange de versions et retour arrière par renommage, verrou, uploads et lien préservés | **Vérifié** sur un faux répertoire et en CI (sans LiteSpeed) |
| Preflight, `check-config`, `disk-check`, lien `node_modules`, dimensionnement | **Vérifié par le propriétaire** sur VinaHost avec les `ops` du commit `3f566f4` |
| Comportement de LiteSpeed/cPanel au renommage de fichiers dans la racine, à STOP/START | **Non vérifié** (annexe A) |
| Sauvegarde `pg_dump` sur l'hébergement (outil disponible, version compatible) | **Non vérifié** (étape 8) |
| Emplacement des journaux de l'application | **Non vérifié** |
| Cause de l'échec de STOP APP/RESTART du 2026-11-27 | **Non établie** |
