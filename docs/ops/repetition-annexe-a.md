# Répétition de l'annexe A — VinaHost, 2026-11-27

Rapport de la répétition du déploiement sur une application jetable. Procédure de référence : `docs/ops/runbook.md`.

**Source des résultats.** Les commandes ont été exécutées par le propriétaire sur VinaHost ; les sorties ont été transmises à l'assistant. Les valeurs ci-dessous sont donc **communiquées par le propriétaire** (VinaHost), non rejouées par l'assistant. Certaines étapes ont été confirmées « réussies » sans transmission de la sortie brute (marquées *confirmé*). Les tests locaux et CI sont distingués.

## 1. Périmètre et garanties

- Application jetable `si-repetition` (racine `~/si-repetition`), sous-domaine `si-test.starluxvn.com` (document root `~/si-test.starluxvn.com`, hors `public_html`), Node 22.23.5, `TOKIO_WORKER_THREADS=2` dès la création, serveur `http` pur (516 octets, SHA-256 `1a0d427f85fa3be7cc18f2d13eea3d2ec0bd4de5d535ded902bbe1f13c6e0819`) qui répond le contenu de `.next/hello.txt`.
- Hors périmètre, jamais touchés : `sciences-interactives`, `bayde24h-smart-pnr` (Node 20.20.2, `bayde24h.com/pnr`), WordPress, PostgreSQL, DNS, `next.config.ts`. Pas de `npm ci`, ni de build.
- Preuve de non-impact sur la production, relevée à chaque étape : PID `1355617` inchangé (ETIMES croissant, NLWP 13, RSS 262 972 → 267 452 Kio sur la durée), `public_html/starluxvn.com/.htaccess` à 7 lignes Passenger, mtime `10:08:00` (antérieur à la création de l'application jetable, 13:50), hash de la liste des noms de `sciences-interactives` `cb5fb0ee5d26dc1c` identique avant/après le nettoyage.
- Quota cPanel : 2 975,27 Mo utilisés au départ (quota 7 168 Mo, libre prudent 4 192,73 Mo) ; 2 975,74 Mo à la fin (+0,47 Mo, libre prudent 4 192,26 Mo).

## 2. Déroulement

| Étape | Résultat | Ce que cela établit |
|---|---|---|
| A0 | NPROC, RAM, Node, quota relevés (*confirmé*) | Marge suffisante avant la répétition |
| A1.1 | Sous-domaine créé, document root `drwxr-x---` hors `public_html` | — |
| A1.2 | Application créée, **démarrée automatiquement par cPanel** ; `server.js` d'exemple de 323 octets, `public/`, `tmp/restart.txt`, `stderr.log` (0 octet) ; `nodevenv/si-repetition` créé ; pas de `node_modules` | cPanel démarre l'application dès la création |
| A2.0 | **2 processus `lsnode`** (PID cités, ELAPSED 116 s et 106 s, NLWP 7, RSS ≈ 56 Mo) sans aucune requête HTTP du propriétaire | Plusieurs instances peuvent coexister pour une application |
| A2.1 / A5 | STOP : 0 processus au premier relevé (93 s après T0) ; `restart.txt` mis à jour ; HTTP après STOP : **AutoIndex** (« Index of / », `cgi-bin/`, `php.ini`) ; production inchangée | STOP peut fonctionner ; la liste de répertoire apparaît quand l'application est arrêtée |
| A4 / A4.1 | Réponses `version A, pid=…, tokio=2` ; un PID **disparaît en quelques secondes d'inactivité** (démarrage à la demande) | « 0 PID » à un instant donné ne prouve pas un STOP |
| A6 | Échange de version **par renommage dans la racine** (`.next`, `RELEASE.json`) application arrêtée : rollback conservé (`version A`), staging vidé ; aucune requête n'a relancé l'application | Le mécanisme de l'échange fonctionne sous LiteSpeed/cPanel (cas sans `node_modules`) |
| A7 | START : 5/5 réponses HTTP 200 `version B`, `tokio=2` (lu aussi dans `/proc/PID/environ`), même PID neuf, NLWP 7, RSS 56–57 Mo | START et activation de la nouvelle version |
| A8.1 | **Échec** : STOP demandé ; l'interface est restée sur STOP APP/RESTART, `restart.txt` inchangé, HTTP 200 `version B` pendant 180 s d'interrogation toutes les 2 s | STOP n'a pas été appliqué ; cause **non établie** |
| A8.1.1 | STOP sans interrogation HTTP : `.htaccess` 915 → 611 octets (7 lignes Passenger retirées), `restart.txt` mis à jour, PID 3439311 (630 s) disparu au relevé suivant (≈ 4 min), HTTP : AutoIndex | STOP effectif visible dans `.htaccess` ; la cause du A8.1 reste indéterminée (l'actualisation de l'interface s'est faite en même temps) |
| A8.2 | Retour arrière : version A restaurée, version B conservée dans `failed/`, **pas de `RELEASE.json`** dans la racine (la version A n'en avait pas) | Le retour arrière par renommage fonctionne |
| A8.3 | START, version A servie, nouveau PID, `tokio=2` (*confirmé*) | Cycle complet |
| A8.5.1 | **Échec** : configuration STOP appliquée (14:52:02, 0 ligne Passenger, bouton START APP) mais le PID 3736835 vivait encore (ETIMES 1 272 s, PPID 1, démarré avant le STOP) 5 min 21 s plus tard | **STOP peut laisser un processus** |
| A8.5.1c | SIGTERM sur ce seul PID après vérification UID/cwd/exe/cmdline/heure de démarrage : terminé (*confirmé*) ; aucun nouveau PID ; production inchangée | Le contrôle d'identité puis SIGTERM suffisent |
| A8.5.1 (rejeu) | Page de maintenance statique créée dans le document root : servie à la place de l'AutoIndex (*confirmé*) | La page remplace la liste de répertoire à `/` |
| A8.5.2 | START avec `index.html` présent : **maintenance servie 5/5, l'application masquée** ; un processus a bien démarré (PID 4108297, NLWP 7, RSS 58 240 Kio) | Une page statique masque l'application |
| A9 | Retrait de la page (identité vérifiée octet pour octet) **après** START : 20 requêtes à 0,3 s : **AutoIndex = 0** ; 8 passes `version A`, `tokio=2`, NPROC 26, RSS total 332 Mo | Ordre « START puis retrait » sans AutoIndex observé |
| DNS | Trois serveurs faisant autorité (PA Vietnam), Google DNS et Cloudflare : `si-test.starluxvn.com` **et** une étiquette aléatoire → `103.9.76.10`, TTL 3 600 | **Wildcard DNS** sur `starluxvn.com` ; non modifié |
| A10.1–A10.6 | Archives des journaux (SHA-256 recoupé sur le poste Windows : `4c06fedb1e808a4ef86afae2f29ff097ad55fe4f830c161aaff622bec0e9a34a`) ; DESTROY (supprime `nodevenv/si-repetition`, pas la racine) ; sous-domaine retiré (document root conservé) ; suppression contrôlée de `~/si-repetition` (16 Ko), `~/si-test.starluxvn.com` (12 Ko) puis `~/si-rehearsal` | Nettoyage sûr et reproductible |

## 3. Constats et conséquences pour la procédure

| # | Constat | Conséquence (runbook) |
|---|---|---|
| C1 | STOP peut être lent, ne pas s'appliquer (A8.1) ou laisser un processus (A8.5.1) | Quatre preuves obligatoires (bouton, `.htaccess`, processus, réponse non-application) ; attente jusqu'à 300 s sans interrogation ; étape 14 |
| C2 | Les processus démarrent à la demande ; durée de vie variable (quelques secondes à plus de 20 min ; le processus de production vit depuis plusieurs heures) | Un PID absent n'est pas une preuve ; un PID présent ne prouve pas que le STOP a échoué (voir son heure de démarrage) |
| C3 | `PPID` : les processus de l'application ont un parent absent de la vue CageFS (`ps -p` ne retourne que l'en-tête) ou `PPID 1` | Le PPID n'est ni un critère d'orphelin ni un critère de décision |
| C4 | L'interrogation HTTP continue a coïncidé avec un STOP sans effet (A8.1) ; non reproduit sans interrogation (A8.1.1, confondu avec l'actualisation de l'interface) | Aucune requête en boucle pendant le STOP ; au plus une requête de contrôle après les autres preuves |
| C5 | Un processus légitime survit parfois au STOP | SIGTERM contrôlé : même UID, `cwd` = racine, `exe` node/lsnode, `cmdline` contenant la racine, **démarré avant** la mise à jour STOP, ≥ 300 s écoulées, `starttime` (`/proc/PID/stat` champ 22) relu dans la même commande juste avant `kill` ; un PID à la fois, 30 s, aucune escalade |
| C6 | Application arrêtée : le serveur sert le document root (AutoIndex avec `cgi-bin/` et `php.ini` sur le domaine de test) | Examiner le document root de production avant (étape 12 bis) ; décision du propriétaire sur la page de maintenance |
| C7 | Une page statique `index.html` **masque** l'application une fois démarrée | Page créée seulement après STOP prouvé, retirée **après** START (identité exacte), jamais laissée en place ; ne jamais écraser ni supprimer un `index.*` existant |
| C8 | Wildcard DNS : un sous-domaine supprimé continue de résoudre vers le serveur | Pas une anomalie du déploiement ; aucun changement DNS ; à connaître pour toute analyse de journaux |
| C9 | DESTROY supprime `nodevenv/<application>` mais pas la racine ; la suppression du sous-domaine ne supprime pas le document root | Nettoyage manuel avec contrôle de chemin, de contenu, de liens symboliques et des `cwd` |
| C10 | Les archives de journaux sont à recouper (SHA-256 sur un autre poste) avant toute suppression ; le journal d'une étape qui crée l'archive n'y est pas complet | Archive faite avant, journal complet copié hors du dossier, vérification fichier par fichier avant `rm` |

## 4. Vérifié, non vérifié, risques résiduels

**Vérifié sur VinaHost (application jetable, serveur `http` pur)** : STOP/START par cPanel ; échange et retour arrière par renommage dans la racine ; arrêt prouvé par `.htaccess` ; SIGTERM contrôlé ; comportement de la page de maintenance (remplacement de l'AutoIndex, masquage de l'application, ordre sans AutoIndex observé) ; nettoyage ; non-impact sur la production sur toute la durée.

**Non vérifié** (ne pas extrapoler) :
- STOP/START de l'application **de production** (Next.js, ≈ 260 Mo, processus longue durée) ; l'échange avec le lien `node_modules` CloudLinux en place (absent de l'application jetable, jamais touché par l'échange) ; `public/uploads`.
- Contenu et comportement du document root de production `public_html/starluxvn.com` application arrêtée ; effet du wildcard DNS sur ce document root ; une page de maintenance en production (ajout d'un fichier dans un dossier de production : décision du propriétaire).
- Cause de l'échec de STOP du A8.1 ; durée exacte d'arrêt des processus ; trafic réel pendant l'échange ; code HTTP de la page statique (200, pas 503).
- `pg_dump`, `pg_restore`, `psql` (présence, versions) ; sauvegarde PostgreSQL réelle ; restauration dans une base jetable ; emplacement du journal de la production (l'application jetable n'avait qu'un `stderr.log` vide dans sa racine).
- Comptes de test pour `ops/verify.sh` ; accès de l'hébergement à GitHub ; transfert de l'artefact (expire le 2026-12-04).
- Les sorties brutes de A0, A8.3, A8.5.1c et du rejeu A8.5.1 n'ont pas été transmises (résultats confirmés).

**Risques résiduels** : un STOP sans effet ou un processus qui survit allongent la fenêtre (retour : procédure d'arrêt, sinon annulation et contact VinaHost) ; AutoIndex possible entre l'arrêt et la remise en route si aucune page n'est posée (non mesuré en production) ; une fenêtre de quelques millisecondes subsiste entre la vérification d'identité et `kill` (impossible à supprimer en shell).

## 5. Conditions manquantes avant le premier déploiement de production

1. Approbation explicite du propriétaire pour la phase de déploiement.
2. **PostgreSQL** (étape 8) : `pg_dump`, `pg_restore`, `psql` présents, version client ≥ serveur ; sauvegarde réelle + `pg_restore --list` ; **restauration dans une base jetable** (ou décision explicite de s'en passer), jamais dans la base de production.
3. Examen en lecture seule du document root de production (étape 12 bis) et décision A/B sur la page de maintenance.
4. Comptes de test (`VERIFY_*`, saisis par `read -s`).
5. Emplacement du journal de l'application de production relevé (étape 18).
6. Artefact valide (régénérer et recontrôler le SHA-256 après le 2026-12-04) ; mode de transfert décidé.
7. Quota cPanel relevé juste avant (`ops/disk-check.sh`) ; fenêtre et disponibilité du propriétaire ; contact VinaHost prêt.

## 6. Conservation

Les journaux de la répétition restent dans le répertoire personnel de l'hébergement : `si-rehearsal-journaux-20261127.tar.gz`, `si-rehearsal-journaux-final-20261127.tar.gz` (+ `.sha256`), `si-rehearsal-a105-journal-20261127.txt`, `si-rehearsal-a106-journal-20261127.txt` (quelques Ko). Leur suppression est une décision du propriétaire.
