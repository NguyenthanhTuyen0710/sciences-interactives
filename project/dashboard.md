# Tableau de bord de progression

_Généré par `npm run dashboard` le 2026-11-06 08:39 UTC à partir de `project/ledger.json`, des inventaires de `research/curriculum/` et des données de `src/lib/chapters/data/`. Ne pas éditer._

Jalons distincts : **Recherche** (dossier validé) · **Généré** (données de chapitre présentes) · **Validé** (Definition of Done automatique sans écart, six revues QA `pass`) · **Publié** (`publicationStatus = published`).

## Par niveau et matière

| Matière | Niveau | Programme | Chapitres officiels | Objectifs (vérifiés) | Recherche | Généré | Validé | Publié |
|---|---|---|---|---|---|---|---|---|
| mathematiques | 6e | Arrêté du 10 avril 2025, BO n°16 du 17 avril 2025 (annexe) | 22 | 69 (69) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| mathematiques | 5e | Arrêté du 18 février 2026, BO n°10 du 5 mars 2026 | 21 | 80 (80) | 3 (14 %) | 3 (14 %) | 3 (14 %) | 3 (14 %) |
| mathematiques | 4e | Arrêté du 9 novembre 2015 modifié, programme publié au BO n°31 du 30 juillet 2020 ; repères et attendus : BO n°22 du 29 mai 2019 | 21 | 56 (56) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| mathematiques | 3e | Arrêté du 9 novembre 2015 modifié, programme publié au BO n°31 du 30 juillet 2020 ; repères et attendus : BO n°22 du 29 mai 2019 | 16 | 44 (44) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 6e | Arrêté du 15 juin 2023 (JO du 21/06/2023) modifiant l'arrêté du 9 novembre 2015 ; BO n°25 du 22 juin 2023 | 8 | 38 (38) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 5e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 9 | 24 (24) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 4e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 9 | 33 (29) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 3e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 10 | 30 (23) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |

## Chapitres produits

### SCI-5E-MATH-001 — Nombres relatifs (5e, mathematiques)

- Publication : **published**
- Objectifs officiels : 15 · couverts par le cours : 15 · par des exercices : 15 · par des jeux : 9
- Exercices : 36 (niveaux 1:7 2:8 3:8 4:7 5:6) · activités : 4
- Revues QA : curriculum = pass · accuracy = pass · exercises = pass · games = pass · technical = pass · language = pass
- Écarts à la Definition of Done : aucun

## Registre des tâches

| Tâche | Type | Titre | État | Prochaine action |
|---|---|---|---|---|
| SCI-INFRA-001 | infra | Audit du dépôt et base de référence (tests, typage, lint, build) | PUBLISHED |  |
| SCI-INFRA-002 | infra | Contrat de données chapitre, modèles de jeux, registre et tableau de bord | INTEGRATED | Revue QA5 avec le chapitre pilote |
| SCI-RES-001 | research | A1 — Inventaire officiel mathématiques 6e-3e (2026-2027) | RESEARCHED | Revue QA1 de l’inventaire ; dossiers par chapitre (A2/A3) |
| SCI-RES-002 | research | A3 — Inventaire officiel physique-chimie 6e-3e (2026-2027) | RESEARCHED | Revue QA1 de l’inventaire ; dossiers par chapitre (A2/A3) |
| SCI-DNB-MATH-001 | brevet | A4 — Format DNB session 2027 et carte des compétences | RESEARCHED | Banque de questions DNB originales (phase 5) |
| SCI-5E-MATH-001 | chapter | Nombres relatifs (5e) — tranche verticale pilote | PUBLISHED |  |
| SCI-5E-MATH-004 | chapter | Addition et soustraction des nombres relatifs | PUBLISHED | Couvert par SCI-5E-MATH-001 (publié) |
| SCI-5E-MATH-009 | chapter | Repérage sur une droite et dans le plan | PUBLISHED | Couvert par SCI-5E-MATH-001 (publié) |
| SCI-INFRA-003 | infra | Instruire l'erreur d'hydratation intermittente de /admin/exercices/nouveau (e2e) | TODO | Reproduire, puis attendre l'hydratation dans scripts/e2e.ts ou corriger la page |
| SCI-INFRA-004 | infra | Décision : tutoiement ou vouvoiement de l'interface existante | BLOCKED | Appliquer la décision au lecteur d'exercices et au moteur de correction |

Total : 123 tâches — TODO 114 · RESEARCHED 3 · INTEGRATED 1 · PUBLISHED 4 · BLOCKED 1. Les tâches de chapitre au statut TODO ne sont pas listées individuellement.
