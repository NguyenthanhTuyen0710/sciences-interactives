# Tableau de bord de progression

_Généré par `npm run dashboard` le 2026-11-06 05:22 UTC à partir de `project/ledger.json`, des inventaires de `research/curriculum/` et des données de `src/lib/chapters/data/`. Ne pas éditer._

Jalons distincts : **Recherche** (dossier validé) · **Généré** (données de chapitre présentes) · **Validé** (Definition of Done automatique sans écart, six revues QA `pass`) · **Publié** (`publicationStatus = published`).

## Par niveau et matière

| Matière | Niveau | Programme | Chapitres officiels | Objectifs (vérifiés) | Recherche | Généré | Validé | Publié |
|---|---|---|---|---|---|---|---|---|
| mathematiques | 6e | Arrêté du 10 avril 2025, BO n°16 du 17 avril 2025 (annexe) | 22 | 69 (69) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| mathematiques | 5e | Arrêté du 18 février 2026, BO n°10 du 5 mars 2026 | 21 | 80 (80) | 2 (10 %) | 2 (10 %) | 0 (0 %) | 0 (0 %) |
| mathematiques | 4e | Arrêté du 9 novembre 2015 modifié, programme publié au BO n°31 du 30 juillet 2020 ; repères et attendus : BO n°22 du 29 mai 2019 | 21 | 56 (56) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| mathematiques | 3e | Arrêté du 9 novembre 2015 modifié, programme publié au BO n°31 du 30 juillet 2020 ; repères et attendus : BO n°22 du 29 mai 2019 | 16 | 44 (44) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 6e | Arrêté du 15 juin 2023 (JO du 21/06/2023) modifiant l'arrêté du 9 novembre 2015 ; BO n°25 du 22 juin 2023 | 8 | 38 (38) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 5e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 9 | 24 (24) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 4e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 9 | 33 (29) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |
| physique-chimie | 3e | Arrêté du 9 novembre 2015 modifié par l'arrêté du 17 juillet 2020 (JO du 28/07/2020) ; BO n°31 du 30 juillet 2020, annexe 3 (physique-chimie) | 10 | 30 (23) | 0 (0 %) | 0 (0 %) | 0 (0 %) | 0 (0 %) |

## Chapitres produits

### SCI-5E-MATH-001 — Nombres relatifs (5e, mathematiques)

- Publication : **draft**
- Objectifs officiels : 15 · couverts par le cours : 15 · par des exercices : 15 · par des jeux : 9
- Exercices : 36 (niveaux 1:7 2:8 3:8 4:7 5:6) · activités : 4
- Revues QA : curriculum = pending · accuracy = pending · exercises = pending · games = pending · technical = pending · language = pending
- Écarts à la Definition of Done : revue curriculum : pending ; revue accuracy : pending ; revue exercises : pending ; revue games : pending ; revue technical : pending ; revue language : pending

## Registre des tâches

| Tâche | Type | Titre | État | Prochaine action |
|---|---|---|---|---|
| SCI-INFRA-001 | infra | Audit du dépôt et base de référence (tests, typage, lint, build) | PUBLISHED |  |
| SCI-INFRA-002 | infra | Contrat de données chapitre, modèles de jeux, registre et tableau de bord | INTEGRATED | Revue QA5 avec le chapitre pilote |
| SCI-RES-001 | research | A1 — Inventaire officiel mathématiques 6e-3e (2026-2027) | RESEARCHED | Revue QA1 de l’inventaire ; dossiers par chapitre (A2/A3) |
| SCI-RES-002 | research | A3 — Inventaire officiel physique-chimie 6e-3e (2026-2027) | RESEARCHED | Revue QA1 de l’inventaire ; dossiers par chapitre (A2/A3) |
| SCI-DNB-MATH-001 | brevet | A4 — Format DNB session 2027 et carte des compétences | RESEARCHED | Banque de questions DNB originales (phase 5) |
| SCI-5E-MATH-001 | chapter | Nombres relatifs (5e) — tranche verticale pilote | QA_PENDING | Revues QA1–QA6 indépendantes |
| SCI-5E-MATH-004 | chapter | Addition et soustraction des nombres relatifs | QA_PENDING | Couvert par SCI-5E-MATH-001 (chapitre fusionné) — suit son statut |

Total : 121 tâches — TODO 114 · RESEARCHED 3 · QA_PENDING 2 · INTEGRATED 1 · PUBLISHED 1. Les tâches de chapitre au statut TODO ne sont pas listées individuellement.
