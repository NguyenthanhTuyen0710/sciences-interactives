# Pipeline de contenu par l'API Claude (phase pilote)

Produit **un** chapitre à la fois : dossier → chapitre → validation par script → corrections ciblées (≤ 2 tours) → relecture.
Phase pilote approuvée : un seul chapitre 3e (`math-3e-calcul-litteral`), plafond **10 USD** au total, modèle Sonnet 5.5.

## Sécurité et budget
- La clé est lue par le SDK dans `ANTHROPIC_API_KEY` (variable d'environnement ou secret de l'environnement). Si elle est mise dans `.env`, ce fichier est exclu par `.gitignore` (`.env*`). Le script n'affiche jamais la clé.
- `budget.json` : `limitUsd` (plafond cumulé de toute la phase) et `creditVerified`. Tant que `creditVerified` vaut `false`, le mode réel refuse de démarrer. Le porteur de projet le passe à `true` après avoir vérifié dans la Console Anthropic que :
  1. le workspace de la clé consomme les crédits API Startup ;
  2. une limite de dépense est active et ne dépasse pas le crédit disponible (aucune recharge automatique).
- Avant chaque appel, le script calcule le **coût maximal** possible (sortie à `max_tokens`, cache écrit) et s'arrête si `dépense déjà journalisée + coût maximal > limitUsd`.
- Registre des dépenses `pipeline/.store/ledger.jsonl` (`pipeline/ledger.ts`, hors Git) : chaque appel payant est **réservé à son coût maximal et écrit avant l'envoi**, puis soldé par son coût réel (`prices.json`). Une réservation non soldée compte pour son maximum.
- Un envoi réel n'est possible que si **toutes** ces conditions sont réunies, sinon il est bloqué (et le dry-run affiche ce qui bloquerait) :
  1. registre synchronisé avec le stockage partagé (`PIPELINE_LEDGER_SYNCED=1`, posé par le workflow après téléchargement) ;
  2. `creditVerified: true` ;
  3. dépense comptée + coût maximal ≤ `limitUsd` ≤ 10 USD (plafond d'essai codé en dur) ;
  4. aucune requête identique (chapitre, étape, empreinte des entrées) déjà soumise ou traitée ;
  5. aucune opération à l'issue inconnue : un envoi payant n'est jamais retenté automatiquement (`maxRetries: 0`) ; une erreur le marque « inconnu » et `--reconcile` le rattache au batch réellement créé (ou le déclare échoué), sans deviner en cas d'ambiguïté.

## Commandes
```bash
npx tsx pipeline/run.ts math-3e-calcul-litteral            # dry-run : estimation, aucun appel
npx tsx pipeline/run.ts math-3e-calcul-litteral --live     # appels réels
npx tsx pipeline/run.ts math-3e-calcul-litteral --live --batch   # dossier/chapitre/relecture via Message Batches (−50 %, asynchrone ; relancer pour récupérer)
npx tsx pipeline/run.ts math-3e-calcul-litteral --live --step review --force   # refaire une seule étape
```

## GitHub Actions (`.github/workflows/generate-lessons.yml`)
Lancement manuel uniquement (*Actions → Generate Lessons → Run workflow*), jamais sur push. Entrées : `mode`, `level`, `subject`, `chapter` (fiches de `pipeline/chapters/`), `exercise_count`, `batch_id`.
- `dry-run` (défaut) : contrôle des données (fiche, niveau, matière, manifest) et estimation ; la clé n'est pas transmise.
- `submit` : `run.ts --submit` soumet la prochaine étape par Message Batches et affiche le `msgbatch_…` ; refusé tant que `creditVerified` vaut `false` ou si le coût maximal dépasse `limitUsd`. Une étape synchrone (fix) n'est jamais envoyée dans ce mode.
- `collect` : `run.ts --collect <batch_id>` récupère le résultat, journalise le coût réel et valide le chapitre ; aucune nouvelle requête.
- Le registre des dépenses vit dans la release GitHub **brouillon** `data-store` (`.github/scripts/data-store.sh`), avec son SHA256 et la version précédente (`ledger.backup.jsonl`). Seuls les jobs `ledger-pull` / `ledger-push` ont `contents: write` ; le job qui détient la clé API n'a que `contents: read` et reçoit le registre par artefact. Tous les workflows qui touchent au stockage partagent le groupe de concurrence `data-store`.
- Lecture : refusée (donc aucun envoi) si le brouillon est absent, publié, en double, ou si l'empreinte ne correspond pas ; jamais de recréation implicite. Écriture : refusée si le registre n'est pas cohérent (`npx tsx pipeline/ledger.ts check`), s'il ne prolonge pas la version lue (ajout seul) ou si la version distante a changé entre-temps.
- Exécution interrompue sans registre transmis : une opération `run-<id>` « inconnue » est ajoutée, ce qui bloque tout envoi jusqu'à `reconcile` (aucun batch créé pendant la fenêtre du run → clos ; sinon décision humaine).
- **Restauration** (brouillon supprimé ou registre perdu) : récupérer la dernière copie (`ledger-out` ou `ledger-in` des artefacts de run, conservés 90 jours, ou `ledger.backup.jsonl`), puis `DATA_STORE_TAG=data-store bash .github/scripts/data-store.sh restore-ledger <fichier>` avec un jeton GitHub ayant l'accès en écriture. Un registre restauré plus ancien que la réalité sous-compte : vérifier la consommation dans la Console Anthropic avant tout nouvel envoi.
- Initialisation (une seule fois, après décision) : workflow `Data Store Init` (saisir CREER), ou `bash .github/scripts/data-store.sh init`. Test réel du mécanisme : workflow `Data Store Self-test` (release jetable).
- Les sorties (dossier, chapitre `draft`, rapport, registre, journal) sont publiées en **artefact du run**, jamais committées.
- `reconcile` : à lancer si un envoi a échoué avec une issue inconnue.
- Chaîne type : submit (dossier) → collect → relecture + commit du dossier → submit (chapitre) → collect → relecture → commit du brouillon.

## Reprise et non-régression
- `state/<chapitre>.json` mémorise les étapes terminées (avec l'empreinte de leurs entrées) et les batchs en attente : une relance reprend là où le pipeline s'est arrêté.
- Un fichier de chapitre ou de dossier existant n'est jamais écrasé sans `--force` : il est conservé et sert d'entrée aux étapes suivantes.
- Le chapitre produit reste `draft` et n'est inscrit ni au registre ni au menu : l'intégration se fait après relecture humaine.

## Sorties payées inutilisables
- `stop_reason` = `max_tokens` ou `refusal`, ou relecture hors schéma : le texte reçu est **toujours** sauvegardé dans `pipeline-output/unusable/<chapitre>-<étape>-<stop_reason>.md` (artefact du run, marqué « TRUNCATED – pas un rapport QA valide »), une entrée `outcome` (`usable: false`, motif) est ajoutée au registre, et l'exécution s'arrête (code 7). L'entrée `outcome` ne change ni la dépense ni l'anti-doublon.
- Relecture : JSON imposé par structured outputs (`output_config.format`, schéma `pipeline/review-format.ts`), revérifié localement ; rendu Markdown dans `project/reports/<tâche>-QA-api.md`.

## Économies
- Préfixe système identique pour toutes les étapes (règles + `schema.ts` + `types.ts` + un chapitre approuvé), mis en cache 1 h (`cache_control`), vérifiable avec `cache_read_input_tokens` dans la réponse de l'API.
- Toutes les vérifications déterministes sont faites par `scripts/validate-chapter.ts` et `tsc` ; l'IA ne reçoit que la liste des erreurs et répond par des remplacements ciblés, pas par un fichier entier.
- Pas de bascule automatique vers un autre modèle en cas de refus : le script s'arrête (coût prévisible).
