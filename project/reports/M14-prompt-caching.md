# M14 — Prompt caching du pipeline : diagnostic et options (2026-11-08)

Analyse sans appel API. Sources officielles consultées le 2026-11-08 :
- Prompt caching : https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Message Batches : https://platform.claude.com/docs/en/build-with-claude/batch-processing
- Tarifs : https://platform.claude.com/docs/en/about-claude/pricing
- Structured outputs : https://platform.claude.com/docs/en/build-with-claude/structured-outputs

## 1. Configuration actuelle (`pipeline/run.ts`)
- Un seul point de cache : `system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral", ttl: "1h" } }]`. C'est le dernier (et unique) bloc de la partie commune ; aucun outil ; les messages (variables) viennent après.
- `SYSTEM` = `pipeline/prompts/system.md` + `schema.ts` + `types.ts` + le chapitre d'exemple (`spec.exampleChapter`). Aucune date, aucun identifiant de requête ; l'identifiant du chapitre n'y figure que par le chemin du chapitre d'exemple (identique pour tous les chapitres qui partagent cet exemple).
- Empreinte de ces quatre fichiers identique aux trois commits exécutés (adbc6b3, 04ab6c3, 2608441 : `7b1e73b3de325548`) ; même modèle (`claude-sonnet-5-5`), même `effort` (`medium`), pas d'outils, pas de `thinking` explicite. `cache_creation` identique (49 643 tokens) aux runs #5 et #7 : même préfixe.

## 2. Usage mesuré (batchs, registre et journaux de run)
| Étape | Soumission (UTC) | Écart avec la requête précédente | Entrée | Cache écrit | Cache lu | Sortie | Coût enregistré |
|---|---|---|---|---|---|---|---|
| dossier `msgbatch_01CT9a…` | 2026-11-07 16:00:42 | — | 3 464 | 49 643 | 0 | 4 002 | 0,123 $ |
| chapter `msgbatch_012BLb…` | 2026-11-08 04:13:12 | ≈ 12 h 12 min | 7 660 | 49 643 | 0 | 45 868 | 0,336 $ |
| review `msgbatch_019EqH…` | 2026-11-08 04:33:02 | ≤ 19 min 50 s | 30 099 | 0 | 49 643 | 12 000 (tronquée) | 0,095 $ |

## 3. Pourquoi 0, 0 puis 49 643
- **Cause établie : l'écart entre étapes par rapport au TTL.** La durée de vie se compte « à partir du début de la requête qui écrit ou lit l'entrée » (doc prompt caching). Dossier → chapitre : ≈ 12 h, bien au-delà d'1 h → entrée expirée. Chapitre → relecture : ≤ 20 min, dans la fenêtre d'1 h → lecture. Avec un TTL de 5 min, la relecture aurait aussi manqué.
- **Écartées** : (a) préfixe différent — non, empreinte et taille identiques, aucune variable avant le point de cache ; (b) seuil minimal — 512 tokens pour Claude Sonnet 5.5, préfixe de 49 643 ; (c) modèle ou paramètres — identiques ; (d) requêtes concurrentes dans un batch — non applicable, une requête par batch ; (e) préfixe différent selon l'étape — non, le même `SYSTEM` sert aux trois étapes.
- **À noter pour la suite** : la nouvelle relecture impose `output_config.format`. D'après la doc structured outputs, « changing the `output_config.format` parameter will invalidate any prompt cache for that conversation thread » : la relecture ne lira plus le cache écrit par l'étape chapitre.
- **Écart de tarif** : `pipeline/prices.json` indique `cacheRead` 0,20 $/MTok pour Sonnet 5.5 ; la page Tarifs donne **0,10 $/MTok** (0,05 × l'entrée). Le coût enregistré de la relecture est donc surestimé d'environ 0,0025 $ (sens prudent). Correction proposée, non appliquée.

## 4. Coût du préfixe (P = 49 643 tokens, batch −50 %, Sonnet 5.5 : entrée 2 $, écriture 5 min 2,50 $, écriture 1 h 4 $, lecture 0,10 $ par MTok)
| Mode | 1re requête | Requête suivante (lecture réussie) | Coût pour N requêtes |
|---|---|---|---|
| Sans cache | 0,0496 $ | 0,0496 $ | 0,0496 × N |
| TTL 5 min | 0,0621 $ | 0,0025 $ | 0,0621 + 0,0025 × (N − 1) |
| TTL 1 h | 0,0993 $ | 0,0025 $ | 0,0993 + 0,0025 × (N − 1) |

Point mort (lectures toutes réussies) : **TTL 5 min dès N = 2**, **TTL 1 h dès N = 3** (N = 2 : 0,1018 $ contre 0,0993 $ sans cache). Les deux ne valent que si la requête suivante démarre dans la fenêtre ; une écriture sans lecture coûte 1,25 × (5 min) ou 2 × (1 h) le prix sans cache.

Pilote réel : 2 écritures 1 h perdues (+0,0993 $ au total par rapport à « sans cache ») et 1 lecture (−0,0472 $) : **le cache a coûté ≈ 0,052 $ de plus que l'absence de cache.**

## 5. Options indépendantes de la durée de traitement d'un batch
| Option | Principe | Gain attendu | Risque |
|---|---|---|---|
| A. Cache conditionnel | `cache_control` seulement si au moins 2 requêtes du même batch (ou d'un enchaînement automatique) partagent le préfixe ; sinon aucune marque | supprime les écritures perdues (≈ 0,05 $ par étape isolée) | aucun sur la qualité |
| B. Grouper par étape et par niveau | un batch = la même étape pour plusieurs chapitres partageant le même chapitre d'exemple (ex. 5 dossiers de 3e), TTL 1 h comme le recommande la doc Batches ; succès « best-effort », 30 à 98 % selon la doc | avec N = 5 et 4 lectures : 0,109 $ au lieu de 0,248 $ pour le préfixe | relecture humaine de plusieurs sorties à la fois ; un chapitre d'exemple unique par lot |
| C. Préfixe plus court | remplacer le chapitre d'exemple complet (≈ 90 Ko, l'essentiel des 49 643 tokens) par un extrait (leçon + un exercice par niveau + un jeu) | −60 à −70 % sur chaque étape, avec ou sans cache | modèle moins guidé → plus d'échecs de validation / de tours de fix ; à mesurer |
| D. Enchaîner collect chapitre → submit relecture dans le même run | relecture soumise dès la validation, dans l'heure | lecture du cache, sauf si `output_config.format` diffère (cas actuel) | perd la relecture humaine du chapitre avant relecture IA |

Recommandation : **A tout de suite** (sans risque, simple), **B à la production par niveau** (Gate 4), **C à évaluer** sur le pilote suivant. D n'apporte rien tant que la relecture impose un format JSON.

## 6. Essai payant possible (non lancé, à approuver)
Un batch de 2 dossiers (deux chapitres 3e partageant `math-3e-arithmetique.ts` comme exemple), TTL 1 h : mesure de `cache_read_input_tokens` sur la 2e requête. Coût maximal ≈ 2 × 0,14 $ ≈ 0,28 $ ; les dossiers produits restent utiles pour la suite.
