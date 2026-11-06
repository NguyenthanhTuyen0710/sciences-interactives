# Sciences Interactives – plateforme d'apprentissage (Mathématiques & Physique-Chimie)

Plateforme web en français, de la 6e à la Terminale : exercices interactifs **générés aléatoirement**, **corrigés automatiquement côté serveur**, avec **solution détaillée étape par étape**, suivi de progression, recommandations adaptatives et espace enseignant.

## Lancer la démo en un clic

[![Ouvrir dans GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NguyenthanhTuyen0710/sciences-interactives)

1. Cliquez sur le bouton ci-dessus, puis **Create codespace** (gratuit avec un compte GitHub).
2. Attendez 2 à 3 minutes : installation, création de la base PostgreSQL et des données de démonstration se font automatiquement.
3. L'application s'ouvre dans un nouvel onglet (port 3000). Sinon : onglet **Ports** → 3000 → icône 🌐.

**Avec Docker (sur votre ordinateur)** : `docker compose up --build` puis ouvrez http://localhost:3000.

## Démarrage manuel

Prérequis : Node.js ≥ 20, PostgreSQL ≥ 14.

```bash
# 1. Base de données
createdb eduplateforme            # ou via psql : CREATE DATABASE eduplateforme;
cp .env.example .env              # puis renseigner DATABASE_URL et AUTH_SECRET

# 2. Installation, migrations, données de démonstration
npm install --legacy-peer-deps
npm run setup                     # = db:migrate + db:seed

# 3. Lancer
npm run dev                       # développement : http://localhost:3000
# ou en production :
npm run build && npm start
```

Comptes de démonstration (mot de passe `demo1234`) : `eleve@demo.fr` (élève de 4e), `hugo@demo.fr` (élève de 3e), `prof@demo.fr` (enseignante), `admin@demo.fr`.
Inscription enseignant : code d'invitation défini par `TEACHER_INVITE_CODE` (défaut `PROF-2026`).

## Tests

```bash
npm test                          # 77 tests unitaires : 68 générateurs × 3 difficultés × 60 tirages + moteur de correction
npm start &                       # puis, serveur lancé :
npm run test:e2e                  # Playwright : chaque exercice est rempli via l'interface avec la bonne réponse → 100 %
```

## Choix techniques

| Besoin | Choix |
|---|---|
| Front + API | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Base de données | PostgreSQL + **Drizzle ORM** (voir note ci-dessous) |
| Rendu maths | KaTeX (+ mhchem pour les équations chimiques) — aucun LaTeX brut affiché |
| Calcul symbolique | math.js : équivalence d'expressions, dérivation (primitives), simplification |
| Authentification | bcrypt + session JWT (jose) en cookie httpOnly ; rôles élève / enseignant / admin |
| Figures | SVG générés par le serveur (triangles, repères, courbes, circuits, modèles particulaires, réfraction…) |

**Note Prisma → Drizzle** : Prisma était demandé, mais son moteur binaire doit être téléchargé depuis `binaries.prisma.sh`, domaine bloqué dans l'environnement de développement. Drizzle offre le même usage (schéma typé, migrations SQL, PostgreSQL) en pur JavaScript. Le schéma est dans `src/lib/db/schema.ts` ; une migration vers Prisma reste simple si nécessaire.

## Architecture

```
src/
  lib/engine/          Moteur d'exercices (indépendant de l'interface)
    types.ts           Schéma de contenu : 14 types d'interaction, réponses, figures
    rng.ts             Aléatoire déterministe : même graine → même exercice
    check.ts           Correction : nombres (virgule, fractions, 10^n), unités, chiffres significatifs,
                       expressions (équivalence + forme réduite), primitives, diagnostics d'erreurs
    numbers.ts / units.ts / expr.ts / svg.ts / fmt.ts
    public.ts          Version envoyée au navigateur : SANS les réponses
  lib/content/
    maths-college.ts   20 générateurs (6e → 3e)
    maths-lycee.ts     6 générateurs (2nde → Tle)
    physique.ts        24 générateurs (6e → Tle) … total : 50 générateurs
    curriculum.ts      Arborescence Matière → Niveau → Chapitre → Notion + fiches de cours
    custom.ts          Exercices enseignants (JSON paramétrable, validé par zod)
    registry.ts        Registre unique (générateurs + exercices en base)
  lib/progress.ts      Statistiques et recommandations adaptatives
  components/          ExercisePlayer, interactions, SeriesPlayer, InteractiveLesson, éditeur…
  app/                 Pages et API (voir ci-dessous)
scripts/seed.ts        Données de démonstration    scripts/e2e.ts  Tests Playwright
tests/engine.test.ts   Tests unitaires (vitest)
```

**Sécurité de la correction** : le navigateur reçoit l'énoncé sans la clé de correction ; à la validation, il envoie la graine et ses réponses, le serveur régénère l'exercice et corrige.

### Pages

Accueil · Mathématiques / Physique-Chimie (`/[matiere]/[niveau]/[chapitre]`) · Exercice (`/exercice/[id]?d=&seed=`) · Exercices interactifs (recherche + filtres) · Cours et fiches · Révisions (défi chronométré, défi du jour, points faibles) · Examens (brevet blanc, contrôles, bac : sujets générés notés /20) · Mon espace · Leçons animées interactives (`/lecons`) · Espace enseignant (`/admin`) · Collections (`/collections/[id]`).

## Ajouter un exercice

**Sans code (enseignants)** : Espace enseignant → *Nouvel exercice*. Variables aléatoires (`{a}`), calculs (`{{a*b}}`), LaTeX (`$…$`), 8 types de questions, image (upload sécurisé) ou vidéo, correction détaillée, aperçu avec tirage aléatoire. Import/export JSON.

**Générateur (développeurs)** : ajouter dans `src/lib/content/*.ts` un objet `Generator` :

```ts
export const monExo: Generator = {
  meta: { id: "m4-mon-exo", title: "…", subject: "maths", level: "4e", chapterId: "m4-equations",
          notionId: "m4-equations-resoudre", kinds: ["numerique"], summary: "…", randomized: "valeurs" },
  generate(rng, d) {
    const a = rng.int(2, 9);
    return { statement: `Calculer $${a}^2$.`, parts: [{ interaction: { kind: "numerique", answer: { value: a * a } } }],
             solution: [`$${a}^2 = ${a} \\times ${a} = ${a * a}$`] };
  },
};
```

Il est automatiquement enregistré, testé par `npm test` (déterminisme, absence de fuite de réponse, réponse parfaite = 100 %) et visible dans l'arborescence.

## Fonctionnalités réalisées

- 50 exercices originaux paramétrés (26 maths, 24 physique-chimie, soit 50 générateurs + 1 exercice enseignant de démonstration), 3 niveaux de difficulté, régénération illimitée.
- 14 types d'interaction : QCM, vrai/faux, numérique (avec unités), expression algébrique, réponse libre, texte à trous, glisser-déposer, associer, classer, ordonner, géométrie interactive (repère cliquable), tableau à compléter, calcul détaillé par étapes, démonstration (ordre + justifications) ; mode chronométré sur tout exercice.
- Correction : équivalence mathématique, forme réduite/développée, fractions irréductibles, valeurs exactes vs approchées, unités et conversions, chiffres significatifs, arrondis, erreurs de signe / d'ordre de grandeur expliquées ; crédit partiel.
- Fiches de cours pour chaque notion travaillée, leçons animées interactives (questions intégrées qui mettent en pause, à la manière d'une vidéo interactive).
- Comptes élève/enseignant/admin, tableau de bord élève (historique, réussite, temps, activité, progression par chapitre, points faibles, recommandations), difficulté conseillée après chaque exercice.
- Espace enseignant : CRUD d'exercices paramétrés, chapitres et notions, collections partageables, statistiques par exercice et par élève, upload d'images, import/export.
- Défi du jour, défi chronométré, sujets d'examen générés et notés /20 ; interface responsive (mobile testée).

## Reste à faire (non implémenté)

- Contenu : de nombreux chapitres n'ont pas encore d'exercice (affichés comme tels) — notamment Thalès, géométrie, algorithmique, probabilités conditionnelles, exponentielle, lois de Newton, oxydoréduction, thermodynamique.
- Types d'activités LearningApps non faits : mots croisés, mots mêlés.
- Simulations expérimentales et circuits électriques modifiables par l'élève ; graphes interactifs à tracer (le repère cliquable existe).
- Intégration GeoGebra / Desmos (licences d'intégration à vérifier) ; vidéos interactives réelles avec points de question (le composant le permet, aucune vidéo fournie).
- Classes/groupes d'élèves, devoirs avec échéance, réinitialisation de mot de passe par e-mail, stockage des médias sur un service objet (actuellement `public/uploads`).
- Version vietnamienne de l'interface (le projet initial évoquait le vietnamien et le français ; cette version est entièrement en français).
- Validation de l'arborescence par des enseignants : le programme de mathématiques du cycle 4 change (BO n° 10 du 5 mars 2026, entrée en vigueur progressive à partir de la rentrée 2026).
