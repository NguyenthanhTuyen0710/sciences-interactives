# Pipeline de contenu par l'API Claude (phase pilote)

Produit **un** chapitre à la fois : dossier → chapitre → validation par script → corrections ciblées (≤ 2 tours) → criblage → relecture approfondie.
Phase pilote : chapitre Pythagore 3e produit (0,692 $) ; pilote élargi (PC, lycée) soumis à approbation. Plafond **10 USD** au total.

## Paliers de modèles (décision du 2026-11-15 ; `pipeline/models.ts`, tarifs `pipeline/prices.json`)
| Tâche | Modèle |
|---|---|
| Extraction de sources, BO → inventaire, proposition de classement G1 | Haiku 5.5 |
| Taxonomie G3 | Opus 5.5, effort high |
| Dossier | Haiku 5.5 (`--dossier-model sonnet` pour la comparaison du pilote) |
| Chapitre (une requête, D4) | Sonnet 5.5 |
| Correction : tour 1 si tous les problèmes sont mineurs (vouvoiement, flottants, doublons, options équivalentes) | Haiku 5.5 |
| Correction : problème majeur, ou tour 2 (escalade après un échec) | Sonnet 5.5 ; au-delà de 2 tours : needs-human |
| Juge 1 : criblage du chapitre entier (langue, tutoiement, ton ; signale le reste) | Haiku 5.5, effort low |
| Juge 2 : exercices signalés et niveaux 4-5 seulement | Sonnet 5.5, effort low |
| Démonstrations lycée, sujets bac, juge d'examens (G5) | Opus 5.5 |
Fable et Mythos sont refusés par le script. Toutes les étapes de production passent par Message Batches (`--submit`), correction comprise ; le cache n'est posé que sur un appel synchrone suivi d'autres appels au même préfixe. Le dry-run affiche la dépense maximale par étape et par modèle, comparée à la même chaîne entièrement sur Sonnet, et avertit quand une requête Haiku dépasse 100 000 tokens (tarif × 5, découpage proposé). Le registre (`reserve.model`, `actual.model`, `actual.tokens`) et le rapport de run ventilent coûts et tokens par modèle ; `ledger.ts check` affiche la dépense par modèle (entrées antérieures : Sonnet 5.5).

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
Deux déclencheurs, jamais sur push :
- **automatique** (`workflow_run`, après un run réussi de *Collect Sources*) : **toujours dry-run** sur le prochain chapitre de la matrice de couverture (`run.ts --next`), sans clé API ;
- **manuel** (*Actions → Generate Lessons → Run workflow*) : `mode`, `niveau`, `matiere`, `parcours`, `chapitre` (fiche de `pipeline/chapters/` ; vide = `--next`), `exercise_count`, `batch_id`.

Modes :
- `dry-run` (défaut) : contrôle des données (fiche, niveau, matière, parcours, manifest) et estimation ; registre des dépenses lu (lecture seule, jamais republié) pour afficher la dépense réelle et appliquer le plafond ; la clé n'est pas transmise.
- `production` : fermé pendant la phase d'essai (le job `setup` refuse).
- `pilot` : `run.ts --submit` soumet la prochaine étape par Message Batches et affiche le `msgbatch_…` ; refusé tant que `creditVerified` vaut `false` ou si le coût maximal dépasse `limitUsd`. Une étape synchrone (fix) n'est jamais envoyée dans ce mode.
- `collect` : `run.ts --collect <batch_id>` récupère le résultat, journalise le coût réel et valide le chapitre ; aucune nouvelle requête.
- Le registre des dépenses vit dans la release GitHub **brouillon** `data-store` (`.github/scripts/data-store.sh`), avec son SHA256 et la version précédente (`ledger.backup.jsonl`). Seuls les jobs `ledger-pull` / `ledger-push` ont `contents: write` ; le job qui détient la clé API n'a que `contents: read` et reçoit le registre par artefact. Tous les workflows qui touchent au stockage partagent le groupe de concurrence `data-store`.
- Lecture : refusée (donc aucun envoi) si le brouillon est absent, publié, en double, ou si l'empreinte ne correspond pas ; jamais de recréation implicite. Écriture : refusée si le registre n'est pas cohérent (`npx tsx pipeline/ledger.ts check`), s'il ne prolonge pas la version lue (ajout seul) ou si la version distante a changé entre-temps.
- Exécution interrompue sans registre transmis : une opération `run-<id>` « inconnue » est ajoutée, ce qui bloque tout envoi jusqu'à `reconcile` (aucun batch créé pendant la fenêtre du run → clos ; sinon décision humaine).
- **Restauration** (brouillon supprimé ou registre perdu) : récupérer la dernière copie (`ledger-out` ou `ledger-in` des artefacts de run, conservés 90 jours, ou `ledger.backup.jsonl`), puis `DATA_STORE_TAG=data-store bash .github/scripts/data-store.sh restore-ledger <fichier>` avec un jeton GitHub ayant l'accès en écriture. Un registre restauré plus ancien que la réalité sous-compte : vérifier la consommation dans la Console Anthropic avant tout nouvel envoi.
- Initialisation (une seule fois, après décision) : workflow `Data Store Init` (saisir CREER), ou `bash .github/scripts/data-store.sh init`. Test réel du mécanisme : workflow `Data Store Self-test` (release jetable).
- Les sorties (dossier, chapitre `draft`, rapport, registre, journal) sont publiées en **artefact du run**, jamais committées.
- `reconcile` : à lancer si un envoi a échoué avec une issue inconnue.
- Chaîne type : pilot (dossier) → collect → relecture + commit du dossier → pilot (chapitre) → collect → relecture → commit du brouillon. Le résumé du job reprend `pipeline-output/summary.md` (dépense, tokens, QA, needs-human, manques).

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
