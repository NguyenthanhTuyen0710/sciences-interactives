# État du projet et reprise

_Mis à jour à chaque fin de session. Source de vérité des tâches : `project/ledger.json` ; tableau de bord : `npm run dashboard`._

## Fait
- **SCI-INFRA-001** audit du dépôt et base de référence (`project/reports/SCI-INFRA-001-orchestrateur.md`).
- **SCI-INFRA-002** contrat de données `ChapterSchema`, Definition of Done automatique, 4 modèles de jeux, page de chapitre, registre et tableau de bord.
- **Inventaires officiels 2026-2027** : maths (80 chapitres, 249 objectifs) et physique-chimie (36 chapitres, 125 objectifs) dans `research/curriculum/` ; format DNB 2027 dans `research/brevet/`.
- **SCI-5E-MATH-001 Nombres relatifs (5e)** : cours, 36 exercices, 4 activités ; six revues QA effectuées, tous les constats corrigés sauf la décision ci-dessous ; statut `draft` en attente de contre-vérification.

## Décision en attente (porteur de projet)
- Tutoiement ou vouvoiement de l'interface existante (lecteur d'exercices, messages du moteur) : le chapitre et les jeux tutoient.

## Prochaines actions
1. Intégrer le résultat de la contre-vérification ; si six PASS, passer `reviewStatus` à `pass` et `publicationStatus` à `published`, relancer tests, build et e2e.
2. Chapitre suivant de la file : 5e (nouveau programme, en vigueur cette année), en commençant par les chapitres liés aux relatifs (`math-5e-expressions-litterales`, `math-5e-equations`) puis par domaine.
3. Physique-chimie : premier chapitre pilote (dossier A3 puis production).
4. Phase Brevet : banque de questions originales « automatismes » (format partie 1 du DNB 2027).

## Environnement local (non versionné)
- PostgreSQL : `service postgresql start` ; base `eduplateforme`, utilisateur `edu`/`edu` ; `.env` local ; `npm run setup`.
- Prévisualisation des brouillons : `npm run build && SHOW_DRAFTS=1 npx next start -p 3000`.
- e2e : `SHOW_DRAFTS=1 BASE_URL=http://localhost:3000 npx tsx scripts/e2e.ts`.
