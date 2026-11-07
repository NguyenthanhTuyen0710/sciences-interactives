# Pipeline de contenu par l'API Claude (phase pilote)

Produit **un** chapitre à la fois : dossier → chapitre → validation par script → corrections ciblées (≤ 2 tours) → relecture.
Phase pilote approuvée : un seul chapitre 3e (`math-3e-calcul-litteral`), plafond **10 USD** au total, modèle Sonnet 5.5.

## Sécurité et budget
- La clé est lue par le SDK dans `ANTHROPIC_API_KEY` (variable d'environnement ou secret de l'environnement). Si elle est mise dans `.env`, ce fichier est exclu par `.gitignore` (`.env*`). Le script n'affiche jamais la clé.
- `budget.json` : `limitUsd` (plafond cumulé de toute la phase) et `creditVerified`. Tant que `creditVerified` vaut `false`, le mode réel refuse de démarrer. Le porteur de projet le passe à `true` après avoir vérifié dans la Console Anthropic que :
  1. le workspace de la clé consomme les crédits API Startup ;
  2. une limite de dépense est active et ne dépasse pas le crédit disponible (aucune recharge automatique).
- Avant chaque appel, le script calcule le **coût maximal** possible (sortie à `max_tokens`, cache écrit) et s'arrête si `dépense déjà journalisée + coût maximal > limitUsd`.
- Chaque appel est journalisé dans `costs.jsonl` (tokens d'entrée, cache écrit/lu, sortie, coût en USD selon `prices.json`).

## Commandes
```bash
npx tsx pipeline/run.ts math-3e-calcul-litteral            # dry-run : estimation, aucun appel
npx tsx pipeline/run.ts math-3e-calcul-litteral --live     # appels réels
npx tsx pipeline/run.ts math-3e-calcul-litteral --live --batch   # dossier/chapitre/relecture via Message Batches (−50 %, asynchrone ; relancer pour récupérer)
npx tsx pipeline/run.ts math-3e-calcul-litteral --live --step review --force   # refaire une seule étape
```

## Reprise et non-régression
- `state/<chapitre>.json` mémorise les étapes terminées (avec l'empreinte de leurs entrées) et les batchs en attente : une relance reprend là où le pipeline s'est arrêté.
- Un fichier de chapitre existant n'est jamais écrasé sans `--force` ; un dossier existant est conservé.
- Le chapitre produit reste `draft` et n'est inscrit ni au registre ni au menu : l'intégration se fait après relecture humaine.

## Économies
- Préfixe système identique pour toutes les étapes (règles + `schema.ts` + `types.ts` + un chapitre approuvé), mis en cache 1 h (`cache_control`), vérifiable avec `cache_read_input_tokens` dans `costs.jsonl`.
- Toutes les vérifications déterministes sont faites par `scripts/validate-chapter.ts` et `tsc` ; l'IA ne reçoit que la liste des erreurs et répond par des remplacements ciblés, pas par un fichier entier.
- Pas de bascule automatique vers un autre modèle en cas de refus : le script s'arrête (coût prévisible).
