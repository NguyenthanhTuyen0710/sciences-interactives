# Runbook de déploiement — VinaHost, flux A (dépendances inchangées)

Ce document est la **seule** procédure de déploiement et de retour arrière. Il décrit un déploiement **manuel** : aucune automatisation n'existe ni n'est prévue avant acceptation du premier déploiement.

## Règles qui s'appliquent à chaque étape

- Chaque étape donne : la commande, le résultat attendu, la **condition d'arrêt**. Si une condition d'arrêt se réalise : s'arrêter, ne pas continuer, consigner la sortie.
- La racine de l'application n'est **jamais renommée**. Une version = `.next`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js`, `RELEASE.json`, échangée par renommage **dans** la racine. `node_modules` (lien CloudLinux), `public/` et `public/uploads` ne sont jamais touchés.
- Jamais `kill -9`, `pkill`, `killall`. SIGTERM seulement, sur un PID vérifié, un à la fois. Le PPID n'est jamais un critère (il passe à 1 en fonctionnement normal sous LiteSpeed).
- Un redémarrage cPanel n'est jamais présumé réussi : il est vérifié par les processus réels.
- Aucune valeur secrète n'est affichée, copiée dans un message, un fichier ou l'historique du shell. Les mots de passe se saisissent avec `read -s`.
- Rien n'est construit ni installé sur l'hébergement (`npm ci`, `npm install` et build interdits).
- **Vérifié le 2026-11-27 sur une application jetable** (serveur `http` pur, sans `node_modules`) : arrêt et démarrage cPanel, échange et retour arrière par renommage dans la racine. **Non vérifié sur la production** (Next.js, lien `node_modules`, document root de production) : cette procédure vérifie donc chaque étape et prévoit un retour arrière. Résultats : `docs/ops/repetition-annexe-a.md`.
- **STOP APP n'est jamais présumé effectif** : il est prouvé par quatre preuves (étape 13). Pendant l'attente du STOP, **aucune requête HTTP en boucle**. Un PID absent à un instant donné ne prouve rien (l'application démarre à la demande) ; un PID présent n'est pas forcément un échec (l'étape 14 décide).
- L'identité d'un processus se vérifie par UID, `cwd`, `exe`, `cmdline` et `starttime` **relus dans la même commande, juste avant tout SIGTERM** (étape 14).
- **Aucun fichier n'est créé ni supprimé dans le document root de production sans décision du propriétaire** (étape 12 bis).
- Tout se fait dans **une seule session SSH** (les variables et fonctions définies à l'étape 3 y sont réutilisées).

## Phase 0 — Conditions préalables

| Condition | Vérification |
|---|---|
| PR #72 fusionnée dans `main` par le propriétaire | page de la PR : « Merged » |
| Aucun autre changement en attente sur `main` à déployer en même temps | `git log` de `main` |
| Fenêtre de déploiement choisie (faible trafic), propriétaire disponible 2 h, surveillance prévue 48 h | décision du propriétaire |
| Contact VinaHost prêt (sortie des commandes de l'étape 15 à fournir) | — |
| Décision sur les comptes de test (étape 7) | propriétaire |
| Répétition de l'annexe A : **faite le 2026-11-27** ; ses limites (section « Non vérifié » de `docs/ops/repetition-annexe-a.md`) sont lues et acceptées | propriétaire |
| Outils PostgreSQL vérifiés (`pg_dump`, `pg_restore`, `psql`, version client ≥ serveur), étape 8 | commandes de l'étape 8 |
| Restauration de la sauvegarde testée dans une **base jetable**, ou décision explicite de s'en passer | étape 8 |
| Document root de production examiné en lecture seule ; décision A/B sur la page de maintenance | étape 12 bis, propriétaire |
| Emplacement du journal de l'application relevé | étape 18 |
| Artefact encore valide (conservé 7 jours ; au-delà : relancer l'étape 1 et recontrôler le SHA-256) | page *Actions* |

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
Le compte héberge d'autres applications Node.js (par exemple `bayde24h-smart-pnr`) : `app_pids` ne retient que les processus dont le répertoire courant est `$APP`.

Document root du domaine et fonction d'identité des processus (lecture seule, utilisées aux étapes 12 bis, 13 et 14) :

```bash
DOCROOT=$HOME/public_html/starluxvn.com; HT="$DOCROOT/.htaccess"; ME=$(id -u); AR=$(readlink -f "$APP")
ident() { local p=$1 s rest; [ -r "/proc/$p/stat" ] || return 1; s=$(cat "/proc/$p/stat" 2>/dev/null) || return 1; rest=${s##*) }; set -- $rest; printf '%s|%s|%s|%s|%s' "$(stat -c %u "/proc/$p" 2>/dev/null)" "$(readlink "/proc/$p/cwd" 2>/dev/null)" "$(readlink "/proc/$p/exe" 2>/dev/null)" "${20}" "$(tr '\0' ' ' < "/proc/$p/cmdline" 2>/dev/null)"; }; echo "document root : $DOCROOT ; lignes Passenger : $(grep -c -i 'Passenger' "$HT")"
```

Attendu : un nombre de lignes Passenger **supérieur à 0** (application activée ; 7 lors de la répétition). Aucun contenu du fichier n'est affiché.

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

Outils et versions (lecture seule ; non encore vérifiés sur cet hébergement) :

```bash
command -v pg_dump pg_restore psql; for t in pg_dump pg_restore psql; do $t --version 2>&1 | head -1; done; psql -At -c "show server_version"; psql -At -c "select current_database(), pg_size_pretty(pg_database_size(current_database()))"
```

Attendu : les trois chemins et trois versions ; **version majeure de `pg_dump` ≥ version majeure du serveur** (sinon `pg_dump` refuse : « server version mismatch »).
**Arrêt si** un outil manque ou si le client est plus ancien que le serveur : ne pas improviser, voir le repli de la fin de cette étape.

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

**Ce que prouve chaque contrôle.** `pg_restore --list` et `pg_restore --file=/dev/null` prouvent que l'archive est valide, lisible en entier et contient les six tables de données. Ils ne prouvent **pas** que les données se rechargent dans PostgreSQL (contraintes, types, droits). Seule une restauration dans une base jetable le prouve.

**Test de restauration (recommandé ; sinon décision explicite du propriétaire)**, dans une base **distincte de la production** :

1. cPanel → *PostgreSQL Databases* : créer une base et un utilisateur jetables (noms différents de la production, mot de passe propre). La création de bases n'est pas présumée possible.
2. Cible et garde-fou (mot de passe saisi avec `read -s`) :

```bash
TEST_DB=<base_jetable>; TEST_USER=<utilisateur_jetable>; read -rs -p "Mot de passe de la base jetable : " TEST_PW; echo; [ -n "$TEST_DB" ] && [ "$TEST_DB" != "$PGDATABASE" ] && echo "cible distincte de la production" || echo "ARRET : cible absente ou identique à la production"
```

3. Restauration (la variable `PGDATABASE` de la production n'est pas utilisée) puis comparaison des comptages :

```bash
[ "$TEST_DB" != "$PGDATABASE" ] && PGDATABASE="$TEST_DB" PGUSER="$TEST_USER" PGPASSWORD="$TEST_PW" pg_restore --no-owner --no-privileges --exit-on-error -d "$TEST_DB" "$B" && PGDATABASE="$TEST_DB" PGUSER="$TEST_USER" PGPASSWORD="$TEST_PW" psql -At -c "select 'users',count(*) from users union all select 'attempts',count(*) from attempts union all select 'custom_exercises',count(*) from custom_exercises union all select 'custom_chapters',count(*) from custom_chapters union all select 'collections',count(*) from collections union all select 'media',count(*) from media" | diff - ~/si-backups/comptages-avant-$S12.txt && echo "restauration identique"
```

4. Supprimer la base et l'utilisateur jetables dans cPanel, puis `unset TEST_PW TEST_DB TEST_USER`.
Un écart léger est normal si des utilisateurs ont travaillé entre la sauvegarde et le comptage : l'expliquer ligne par ligne. **Arrêt si** la cible est identique à la production ou si la restauration échoue.

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

## Étape 12 bis — Document root de production et page de maintenance (décision du propriétaire)

**Constat de la répétition** (domaine de test, `docs/ops/repetition-annexe-a.md`) : application arrêtée, le serveur sert le document root du domaine, c'est-à-dire une **liste de répertoire** (« Index of / », avec `cgi-bin/` et `php.ini`). Le contenu du document root de production n'a **pas** été examiné ; la page `/` de `starluxvn.com` peut donc afficher une liste entre l'arrêt et la remise en route. Ne pas extrapoler le résultat du domaine de test.

Examen en lecture seule (noms uniquement ; **ne jamais afficher le contenu** d'un fichier de configuration, ni `wp-config.php`) :

```bash
ls -la "$DOCROOT" | head -40; echo "lignes Passenger : $(grep -c -i 'Passenger' "$HT") ; fichiers index.* : $(ls -A "$DOCROOT" | grep -ciE '^index\.(html?|php)$')"
```

Le propriétaire choisit **avant l'étape 13** :

| Option | Effet | Condition |
|---|---|---|
| **A** — aucune page | une liste de répertoire peut apparaître pendant l'arrêt (durée : de STOP à START ; non mesurée en production) | la liste ne contient rien de sensible |
| **B** — page de maintenance statique | la page remplace la liste pendant l'arrêt | ajoute **un fichier dans un dossier de production** : approbation explicite ; aucun `index.*` préexistant |

Particularités de l'option B (vérifiées sur le domaine de test) : la page est posée **après** un arrêt prouvé et retirée **après** START (ordre sans liste de répertoire observé sur 20 requêtes à 0,3 s, **non garanti**) ; si elle reste en place **après** START, elle **masque l'application** ; elle répond en HTTP 200 (pas 503) ; le fichier est reconnu par un marqueur et un contenu exact, jamais par son seul nom. Ne **jamais** écraser ni supprimer un `index.*` existant. Le dossier étant sous `public_html`, vérifier avant la fenêtre s'il est aussi joignable depuis un autre domaine du compte.

Contenu de la page (fonction à définir dans la session, utilisée aux étapes 13 et 16) :

```bash
MP() { printf '%s\n' '<!doctype html>' '<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Maintenance en cours</title></head>' '<body><!-- si-maintenance --><main><h1>Maintenance en cours</h1><p>Le site est en cours de mise à jour. Reviens dans quelques minutes.</p></main></body></html>'; }; echo "index.* avant la fenêtre : $(ls -A "$DOCROOT" | grep -ciE '^index\.(html?|php)$')"
```

## Étape 13 — STOP APP et preuves de l'arrêt

**Constats de la répétition** : STOP a été lent (de quelques secondes à plus de 4 min), a **échoué une fois** sans cause établie (l'interface restait sur STOP APP/RESTART, `restart.txt` inchangé), et a **laissé un processus vivant plus de 5 min** une autre fois. L'application démarre à la demande : un PID absent à un instant donné ne prouve rien.

1. cPanel : actualiser la page (F5) pour éviter un affichage périmé, puis **STOP APP**, **une seule fois**. **Aucune requête HTTP en boucle** pendant l'attente (le seul échec de STOP a eu lieu pendant une interrogation toutes les 2 s ; lien de cause non établi).
2. **P1 — bouton** : après F5, cPanel affiche **START APP** (et non STOP APP/RESTART).
3. **P2 et P3 — configuration et processus** (attente d'au plus 300 s, sans HTTP) :

```bash
sleep 60; echo "P2 lignes Passenger : $(grep -c -i 'Passenger' "$HT") (attendu 0) ; .htaccess modifié : $(stat -c %y "$HT" | cut -c1-19)"; for i in $(seq 1 24); do N=$(app_pids | wc -l); echo "P3 $(date -u +%T) : $N processus"; [ "$N" = 0 ] && break; sleep 10; done
```

4. **P4 — réponse qui n'est plus celle de l'application** (une seule requête, après P1–P3 ; en option B, après la pose de la page ci-dessous) :

```bash
curl -sS -o "$R/p4.html" -w 'HTTP %{http_code}\n' --max-time 20 https://starluxvn.com/; sed 's/<[^>]*>/ /g' "$R/p4.html" | tr -s ' \n' | head -c 200; echo; sleep 4; echo "processus après la requête : $(app_pids | wc -l)"
```

Attendu : P1 vrai ; P2 = `0` ; P3 = `0 processus` ; P4 = « Index of / » (option A), `si-maintenance` (option B) ou HTTP 403/404/503, et `0` processus ensuite. **Toute page du site** = l'application répond encore.
5. **Option B seulement**, une fois P1–P3 vrais : poser la page.

```bash
{ [ ! -e "$DOCROOT/index.html" ] && [ ! -e "$DOCROOT/index.htm" ] && [ ! -e "$DOCROOT/index.php" ] && MP > "$DOCROOT/index.html" && chmod 644 "$DOCROOT/index.html" && echo "page de maintenance posée"; } || echo "ARRET : un index.* existe déjà ou l'écriture est impossible : ne rien créer"
```

puis répéter P4 : attendu `si-maintenance`.

**Arrêt si** :
- P1 ou P2 faux après 300 s : **le STOP n'a pas été appliqué**. Ne toucher à aucun fichier. Une seule nouvelle tentative de STOP APP, puis recontrôle ; si P1/P2 restent faux : lever le verrou (`bash "$OPS/ops/deploy-lock.sh" release --app-dir "$APP"`), garder les sorties, contacter VinaHost. Le déploiement est annulé.
- P1 et P2 vrais mais un processus subsiste après 300 s : étape 14.
- P4 montre une page du site : l'application répond ; recommencer à l'étape 13.

## Étape 14 — Processus subsistant après STOP (SIGTERM contrôlé)

Un processus actif garderait l'ancienne version en mémoire et son répertoire courant : **ne jamais déplacer de fichiers tant qu'il vit**. Ce chemin ne s'applique que si P1 et P2 sont vrais (le STOP est appliqué) et qu'au moins 300 s se sont écoulées depuis la modification de `.htaccess`.

1. Identifier chaque processus restant :

```bash
for p in $(app_pids); do ps -o pid,ppid,etimes,rss,nlwp,args -p $p; done
```

Le PPID n'est pas un critère (il vaut 1 en fonctionnement normal sous LiteSpeed ; le parent est absent de la vue CageFS).
2. Définir la fonction de contrôle (identité relue dans la même commande, juste avant `kill`) :

```bash
sigterm_verifie() {
  local p=$1 I1 I2 OWN CWD EXE ST CMD START CLK BT CONF_TS G st OLDIFS
  [ "$(grep -c -i 'Passenger' "$HT")" = 0 ] || { echo "ARRET : lignes Passenger encore présentes, STOP non appliqué"; return 1; }
  CONF_TS=$(stat -c %Y "$HT"); [ $(( $(date +%s) - CONF_TS )) -ge 300 ] || { echo "ARRET : moins de 300 s depuis le STOP"; return 1; }
  I1=$(ident "$p") || { echo "PID $p déjà disparu"; return 0; }
  OLDIFS=$IFS; IFS='|'; set -- $I1; IFS=$OLDIFS; OWN=$1; CWD=$2; EXE=$3; ST=$4; CMD=$5
  CLK=$(getconf CLK_TCK); BT=$(awk '/^btime/{print $2}' /proc/stat); START=$(( BT + ST / CLK ))
  echo "PID $p : uid=$OWN cwd=$CWD exe=$EXE démarré≈$(date -u -d @"$START" +%T) cmdline=[$CMD]"
  { [ "$OWN" = "$ME" ] && [ "$CWD" = "$AR" ]; } || { echo "ARRET : UID ou répertoire courant différents"; return 1; }
  case "$EXE" in */node|*/lsnode) ;; *) echo "ARRET : exécutable inattendu"; return 1;; esac
  case "$CMD" in *"$APP"*) ;; *) echo "ARRET : la ligne de commande ne contient pas la racine de l'application"; return 1;; esac
  [ "$START" -le "$CONF_TS" ] || { echo "ARRET : processus démarré APRÈS le STOP (l'application a redémarré) : pas de kill"; return 1; }
  I2=$(ident "$p") || { echo "PID $p disparu avant l'envoi"; return 0; }
  [ "$I1" = "$I2" ] || { echo "ARRET : identité modifiée entre la vérification et l'envoi (PID réutilisé ?), annulation"; return 1; }
  kill -TERM "$p" || { echo "ARRET : kill -TERM refusé"; return 1; }
  for G in $(seq 1 30); do st=$(ps -o stat= -p "$p" 2>/dev/null | tr -d ' '); if [ -z "$st" ] || [ "${st:0:1}" = Z ]; then echo "PID $p terminé après ${G} s"; return 0; fi; sleep 1; done
  echo "ARRET : PID $p vivant 30 s après SIGTERM : aucune escalade"; return 1
}
```

3. Un PID à la fois, puis recontrôle :

```bash
for p in $(app_pids); do sigterm_verifie "$p" || break; done; echo "processus restants : $(app_pids | wc -l)"
```

Attendu : « terminé après N s », `processus restants : 0`, puis relancer P3 et P4 de l'étape 13. Si un message commence par « ARRET » : ne pas continuer, ne rien forcer. Un « ARRET : processus démarré APRÈS le STOP » est un échec du STOP, pas un ancien processus.
**Arrêt si** un processus survit à SIGTERM ou si un contrôle d'identité échoue : ne pas escalader (jamais `kill -9`, jamais `pkill`). Lever le verrou, garder la sortie des commandes précédentes et contacter VinaHost. Le déploiement est annulé ; rien n'a été modifié dans la racine. Limite connue : une fenêtre de quelques millisecondes subsiste entre la dernière lecture d'identité et `kill` (non supprimable en shell).

## Étape 15 — Mettre en place la nouvelle version (application arrêtée, preuves P1 à P4 vraies)

Si plus de 10 minutes se sont écoulées depuis les preuves, les rejouer. La commande refuse de commencer si la configuration n'est pas arrêtée, si un processus existe ou si `rollback/` ou `failed/` ne sont pas vides :

```bash
[ "$(grep -c -i 'Passenger' "$HT")" = 0 ] && [ "$(app_pids | wc -l)" = 0 ] && mkdir -p "$R/rollback" "$R/failed" && [ -z "$(ls -A "$R/rollback")" ] && [ -z "$(ls -A "$R/failed")" ] && { cd "$APP" && for it in .next package.json package-lock.json next.config.ts server.js RELEASE.json; do [ -e "$APP/$it" ] && { mv -- "$APP/$it" "$R/rollback/$it" || { echo "ECHEC rangement $it"; break; }; }; mv -- "$R/staging/$it" "$APP/$it" || { echo "ECHEC mise en place $it"; break; }; done; echo "terminé"; } || echo "ARRET : garde non satisfaite (STOP non appliqué, processus présent, ou rollback/failed non vides)"
```

Contrôle :

```bash
cd "$APP" && ls -A "$R/staging" | wc -l; grep '"commit"' RELEASE.json; cmp server.js "$OPS/ops/server.js" && echo "server.js = ops/server.js"; readlink node_modules; ls -d public/uploads 2>&1 | head -1; ls -A "$R/rollback"; echo "processus : $(app_pids | wc -l)"
```

Attendu : `0` élément restant dans le staging ; commit = `$SHA` ; `server.js = ops/server.js` ; `node_modules` pointe vers `/home/tkuyhwlk/nodevenv/sciences-interactives/22/lib/node_modules` ; `public/uploads` inchangé (inexistant tant qu'aucune image n'est téléversée) ; le rollback contient `.next`, `package.json`, `package-lock.json`, `next.config.ts`, `server.js` (sans `RELEASE.json` : la version précédente n'en avait pas) ; `processus : 0` (la mise en place n'a pas relancé l'application : constat de la répétition).
**Arrêt si** le message `ECHEC` ou `ARRET` apparaît, ou si le contrôle diffère : exécuter immédiatement le retour arrière (section dédiée), **sans démarrer l'application**. Le lien `node_modules` n'a pas été exercé lors de la répétition (l'application jetable n'en avait pas) : le contrôle `readlink` est donc obligatoire.

## Étape 16 — START APP

1. cPanel : actualiser (F5), **START APP** une seule fois. Puis :

```bash
sleep 5; echo "lignes Passenger : $(grep -c -i 'Passenger' "$HT") (attendu > 0 : START appliqué) ; processus : $(app_pids | tr '\n' ' ')"
```

**Arrêt si** 0 ligne Passenger : le START n'est pas appliqué (ne pas poser ni retirer de page, retour arrière). **Zéro processus n'est pas un échec** : l'application démarre à la demande ; la preuve est la réponse HTTP (étape 17).
2. **Option B seulement** : retirer la page **après** START, uniquement si elle est celle posée par la procédure (marqueur, propriétaire, contenu identique octet pour octet) :

```bash
MP > "$R/maintenance-attendue.html"; { [ -f "$DOCROOT/index.html" ] && [ ! -L "$DOCROOT/index.html" ] && [ "$(stat -c %u "$DOCROOT/index.html")" = "$ME" ] && grep -q 'si-maintenance' "$DOCROOT/index.html" && cmp -s "$R/maintenance-attendue.html" "$DOCROOT/index.html"; } && rm -- "$DOCROOT/index.html" && echo "page de maintenance retirée" || echo "ARRET : le fichier n'est pas celui posé par la procédure : ne rien supprimer"
```

Tant que la page est en place, l'application n'est **pas joignable** (la page la masque) : aucun contrôle HTTP de l'application n'est possible. Le retirer sans attendre.
3. Ouvrir `https://starluxvn.com/` dans un navigateur (démarre l'application à la demande), puis :

```bash
sleep 5; echo "processus : $(app_pids | tr '\n' ' ')"; for p in $(app_pids); do ps -o pid,ppid,etimes,rss,nlwp -p $p; done
```

Attendu : un nouveau PID (démarré après l'étape 15), 13 threads, aucun ancien PID. L'absence de liste de répertoire entre le retrait de la page et la remise en route a été observée sur le domaine de test (20 requêtes à 0,3 s) ; ce n'est **pas une garantie** sur la production.
**Arrêt si** la page répond en erreur ou si aucun processus n'apparaît en 2 minutes après le retrait de la page : retour arrière (une erreur de configuration nomme la variable fautive dans le journal, jamais sa valeur). Si le retrait échoue, **ne pas laisser la page** : elle masque l'application ; traiter l'échec avant toute autre action.

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
- Journal de l'application : repérer son emplacement (non vérifié pour la production ; l'application jetable avait un `stderr.log` vide dans sa racine : `ls -la "$APP"/*.log ~/logs 2>/dev/null`, ou l'écran de l'application dans cPanel) et chercher « Configuration de production invalide » ou des erreurs de démarrage. Ne jamais afficher une variable d'environnement.

**Arrêt si** un échec : retour arrière.

## Étape 19 — Clôture du déploiement

```bash
bash "$OPS/ops/deploy-lock.sh" release --app-dir "$APP"; unset VERIFY_STUDENT_PASSWORD VERIFY_TEACHER_PASSWORD PGPASSWORD; ls -A "$R"; echo "index.* dans le document root : $(ls -A "$DOCROOT" | grep -ciE '^index\.(html?|php)$') (valeur relevée à l'étape 12 bis) ; lignes Passenger : $(grep -c -i 'Passenger' "$HT")"
```

Attendu : « verrou levé » ; le nombre de fichiers `index.*` est celui d'avant la fenêtre (aucune page de maintenance résiduelle) ; `.release` contient `rollback/`, `artifact.tar.gz`(`.sha256`) (et `staging/` vide). **Ne pas nettoyer maintenant** : le rollback et l'artefact restent jusqu'à la fin de la surveillance. Conserver la sauvegarde `~/si-backups` (décision du propriétaire sur sa durée ; elle compte dans le quota).

## Retour arrière

**Déclencheurs** : échec d'une étape 15 à 18 ; application en erreur ou lente ; NPROC > 85 % ; RAM de l'application > 450 Mo de façon durable (référence : 256 Mo) ; erreurs de démarrage ; décision du propriétaire. Pendant la surveillance de 48 h, le retour arrière reste possible tant que `.release/rollback` n'a pas été nettoyé.

R1. Verrou : `bash "$OPS/ops/deploy-lock.sh" acquire rollback --app-dir "$APP"`.
R2. Noter `T1=$(date +%s)` et `OLD_PIDS=$(app_pids | tr '\n' ' ')`.
R3. **STOP APP** (cPanel, une seule fois, sans requête en boucle) et les quatre preuves P1 à P4 de l'étape 13 ; si un processus subsiste, étape 14. Option B : si une page de maintenance a été posée et retirée avant l'échec, la reposer seulement après P1 à P3 (mêmes contrôles).
R4. Échange inverse (refuse de commencer si le STOP n'est pas prouvé, si un processus existe ou si `failed/` n'est pas vide) :

```bash
[ "$(grep -c -i 'Passenger' "$HT")" = 0 ] && [ "$(app_pids | wc -l)" = 0 ] && mkdir -p "$R/failed" && [ -z "$(ls -A "$R/failed")" ] && { cd "$APP" && for it in .next package.json package-lock.json next.config.ts server.js RELEASE.json; do if [ -e "$APP/$it" ]; then mv -- "$APP/$it" "$R/failed/$it" || { echo "ECHEC mise de côté $it"; break; }; fi; if [ -e "$R/rollback/$it" ]; then mv -- "$R/rollback/$it" "$APP/$it" || { echo "ECHEC restauration $it"; break; }; fi; done; echo "terminé"; ls -A "$APP" | head -30; readlink node_modules; } || echo "ARRET : garde non satisfaite (STOP non appliqué, processus présent, ou failed/ non vide)"
```

Attendu : la version précédente est en place (sans `RELEASE.json` pour le premier déploiement ; la répétition a vérifié que ce fichier n'est pas laissé dans la racine) ; la version en échec est dans `.release/failed` ; le lien `node_modules` est inchangé ; `public/uploads` intact. En cas de message `ECHEC` ou `ARRET` : ne pas démarrer, consigner l'état de chaque fichier (`ls -A "$APP" "$R/rollback" "$R/failed"`) et contacter VinaHost.
R5. **START APP** (étape 16 : lignes Passenger > 0 ; option B : retrait de la page après START avec contrôle d'identité), puis `ops/verify.sh --deployed-at $T1 --old-pids "$OLD_PIDS"` : 0 échec.
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
| Instances | une (ou plusieurs récentes) ; zéro à un instant donné est normal (démarrage à la demande) | une instance plus ancienne que `T0` | étape 14 (identité vérifiée avant tout SIGTERM) |
| Page de maintenance ou liste de répertoire à `/` | aucune | présence d'« Index of / » ou de `si-maintenance` alors que l'application est démarrée | contrôle d'identité puis retrait (étape 16), enquêter |
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

Règle pour toute suppression de dossier ou de fichier d'exploitation (acquise lors du nettoyage de la répétition, annexe A) : chemin réel égal au chemin attendu, ni lien symbolique ni point de montage, bon propriétaire, contenu limité à des noms connus, aucun processus dont le répertoire courant s'y trouve, suppression ciblée (`rm -r --one-file-system --`, jamais `rm -rf` ni `*`). Avant de supprimer des journaux : archive créée, **somme SHA-256 recoupée sur un autre poste**, contenu comparé fichier par fichier, journal de l'étape en cours copié hors du dossier. Les sauvegardes PostgreSQL ne sont jamais supprimées par cette règle.

## Annexe A — Répétition sur une application jetable (réalisée le 2026-11-27)

La répétition a été faite sur VinaHost avec une application jetable (`si-repetition`, sous-domaine `si-test.starluxvn.com`, Node 22.23.5, `TOKIO_WORKER_THREADS=2` dès la création, serveur `http` pur) puis supprimée. Détail, chronologie, constats et limites : `docs/ops/repetition-annexe-a.md`. Constats qui structurent cette procédure :

- STOP lent, parfois sans effet, parfois avec un processus qui survit : étapes 13 et 14 (quatre preuves, 300 s, SIGTERM contrôlé).
- L'application démarre à la demande ; le PPID n'est pas un critère : règles de l'en-tête et étape 14.
- Liste de répertoire quand l'application est arrêtée ; une page statique masque l'application après START : étape 12 bis, étapes 13 et 16.
- Wildcard DNS sur `starluxvn.com` : un sous-domaine supprimé résout toujours vers le serveur ; aucune action DNS n'est prévue.

**À refaire** (sur une nouvelle application jetable, avec une copie de ces étapes) si l'un des éléments suivants change : version de Node, mécanisme cPanel/LiteSpeed annoncé par l'hébergeur, forme du `server.js` d'entrée, ou si un STOP/START inattendu se produit en production. Chaque réalisation se termine par le nettoyage sûr décrit à la section « Nettoyage ».

## Annexe B — Ce qui est vérifié et ce qui ne l'est pas

| Élément | État |
|---|---|
| Artefact (contenu, SHA-256, dépendances, binaires natifs, démarrage, API, authentification, correction, ressources) | **Vérifié** en local et en CI (smoke test, glibc 2.34 en conteneur), y compris sur l'artefact officiel de `main` (run `workflow_dispatch`, SHA-256 recoupé sur le poste du propriétaire) |
| Échange de versions et retour arrière par renommage, verrou, uploads et lien préservés | **Vérifié** sur un faux répertoire et en CI (sans LiteSpeed) |
| Échange et retour arrière par renommage dans la racine, STOP/START cPanel, `RELEASE.json` absent après retour arrière | **Vérifié sur VinaHost** (application jetable, serveur `http` pur, sans `node_modules`) |
| Quatre preuves d'arrêt, SIGTERM avec contrôle d'identité, page de maintenance (remplacement de la liste, masquage de l'application, retrait après START), nettoyage | **Vérifié sur VinaHost** (application jetable) |
| Preflight, `check-config`, `disk-check`, lien `node_modules`, dimensionnement | **Vérifié par le propriétaire** sur VinaHost avec les `ops` du commit `3f566f4` |
| STOP/START de l'application de production, échange avec le lien `node_modules` CloudLinux en place, `public/uploads` | **Non vérifié** |
| Document root de production application arrêtée (liste de répertoire, wildcard DNS), page de maintenance en production | **Non vérifié** (étape 12 bis) |
| Cause de l'échec de STOP/RESTART constaté lors de l'incident, et cause du STOP resté sans effet pendant la répétition (étape A8.1) | **Non établies** |
| Sauvegarde et restauration PostgreSQL : `pg_dump`/`pg_restore`/`psql` présents, versions, sauvegarde réelle, restauration dans une base jetable | **Non vérifié** (étape 8) |
| Emplacement du journal de l'application de production | **Non vérifié** (étape 18) |
| Trafic réel pendant l'échange ; durée de la liste de répertoire sans page ; code HTTP de la page statique (200) | **Non vérifié / non mesuré** |
