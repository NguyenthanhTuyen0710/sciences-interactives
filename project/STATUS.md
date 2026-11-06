# État du projet et reprise

_Mis à jour à chaque fin de session. Source de vérité des tâches : `project/ledger.json` ; tableau de bord : `npm run dashboard`._

## Fait
- **SCI-INFRA-001** audit du dépôt et base de référence (`project/reports/SCI-INFRA-001-orchestrateur.md`).
- **SCI-INFRA-002** contrat de données `ChapterSchema`, Definition of Done automatique, 4 modèles de jeux, page de chapitre, registre et tableau de bord.
- **Inventaires officiels 2026-2027** : maths (80 chapitres, 249 objectifs) et physique-chimie (36 chapitres, 125 objectifs) dans `research/curriculum/` ; format DNB 2027 dans `research/brevet/`.
- **SCI-5E-MATH-001 Nombres relatifs (5e)** : cours, 36 exercices, 4 activités ; six revues QA, deux contre-vérifications indépendantes (six PASS) ; **publié** (couvre aussi `math-5e-relatifs-addition-soustraction` et `math-5e-reperage` de l'inventaire). Rapports : `project/reports/SCI-5E-MATH-001-*`.

## Décision en attente (porteur de projet)
- Tutoiement ou vouvoiement de l'interface existante (lecteur d'exercices, messages du moteur) : le chapitre et les jeux tutoient.

## Leçons de la tranche verticale
- Lire le **code de sortie** des outils (`echo $?`), pas la dernière ligne affichée.
- Tout composant à tirage aléatoire est monté côté navigateur (sinon écart d'hydratation).
- Rejouer au clavier après chaque correctif de focus : un correctif QA4 a introduit une régression détectée en contre-vérification.
- Prévoir une contre-vérification indépendante après correction : elle a trouvé 2 bloquants.

## Prochaines actions
1. SCI-INFRA-003 : erreur d'hydratation intermittente de `/admin/exercices/nouveau` pendant l'e2e.
2. Chapitre suivant de la file : 5e (nouveau programme, en vigueur cette année), en commençant par les chapitres liés aux relatifs (`math-5e-expressions-litterales`, `math-5e-equations`) puis par domaine.
3. Physique-chimie : premier chapitre pilote (dossier A3 puis production).
4. Phase Brevet : banque de questions originales « automatismes » (format partie 1 du DNB 2027).

## Environnement local (non versionné)
- PostgreSQL : `service postgresql start` ; base `eduplateforme`, utilisateur `edu`/`edu` ; `.env` local ; `npm run setup`.
- Prévisualisation des brouillons : `npm run build && SHOW_DRAFTS=1 npx next start -p 3000`.
- e2e : `SHOW_DRAFTS=1 BASE_URL=http://localhost:3000 npx tsx scripts/e2e.ts`.
