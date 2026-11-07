# G1 — Documents proposés à la collecte (relevé du 2026-11-07, à décider)

Lecture unitaire de chaque URL (≥ 11 s d'intervalle) dans un répertoire temporaire, **hors dépôt et hors stockage** ; rien n'a été conservé.
« Déclaré » = repris de l'inventaire `research/curriculum` (sources secondaires), **non confirmé par le document lui-même** : aucun des PDF lus ne mentionne de numéro de BO, de date d'application ni de licence.

| # | Seed | Document (titre lu) | Éditeur | Contenu de programme | Année d'application | Accès | Droits d'usage | Proposition |
|---|---|---|---|---|---|---|---|---|
| 1 | `c4-programme-2026-annexe2` | « Annexe 2 – Programme de mathématiques pour le cycle 4 » (20 p., PDF créé le 19-02-2026, modifié le 02-03-2026, SHA256 `e20a05da6c68…`) | education.gouv.fr (`/sites/default/files/`, autorisé par robots.txt) | Cycle 4 : 5e, 4e, 3e, tous domaines (nombres et calculs, espace et géométrie, données et probabilités, proportionnalité et fonctions, algorithmique) | Déclaré : BO n° 10 du 5-03-2026 ; en 3e **à partir de la rentrée 2028** (non en vigueur en 3e en 2026-2027) | HTTP 200 | **Non vérifiés** (mentions légales en 403) ; aucune mention dans le PDF | **Autoriser la collecte** (lecture + empreinte). Conservation dans data-store : **non** tant que les droits ne sont pas confirmés |
| 2 | `c3-programme-2025-annexe2` | Redirection **301** vers le n° 3 ; même fichier (SHA256 identique) | education.gouv.fr | = n° 3 | = n° 3 | HTTP 301 → 200 | = n° 3 | **Ne pas autoriser** (doublon) ; garder seulement le n° 3 |
| 3 | `c3-programme-2025-439827` | « Programme de mathématiques pour le cycle 3 » (28 p., auteur « CSP », PDF du 16-04-2025, SHA256 `f3f79a75ca8b…`) | education.gouv.fr (`/sites/default/files/`) | Cycle 3 : CM1, CM2, 6e (nombres, calcul, grandeurs et mesures, géométrie, données) | Déclaré : BO n° 16 du 17-04-2025 ; date d'application non lue | HTTP 200 | **Non vérifiés** ; aucune mention dans le PDF | **Autoriser la collecte** ; conservation : **non** tant que les droits ne sont pas confirmés |
| 4 | `c4-exemples-mise-en-oeuvre-2026` | « Exemples pour la mise en œuvre des programmes – Cycle 4 – Mathématiques – 2026 » (51 p., auteur « MEN », PDF du 11-03-2026, SHA256 `dfaaee291c15…`) | eduscol.education.gouv.fr (`/sites/default/files/`) | Accompagnement du programme 2026 du cycle 4 (principes, résolution de problèmes, raisonnement, automatisation…) | Lié au programme 2026 (même calendrier que le n° 1) ; caractère non réglementaire **déclaré**, non lu dans le document | HTTP 200 | **Non vérifiés** (mentions légales Éduscol en 403) | **Autoriser la collecte** comme document d'accompagnement (jamais comme source d'objectifs) ; conservation : **non** tant que les droits ne sont pas confirmés |
| 5 | `bo-2020-31-programme-c4` | Page BO (HTML) — **non lue** | education.gouv.fr/bo | Déclaré : programme du cycle 4 de 2020 | Déclaré : en vigueur en 3e jusqu'en 2027-2028 | **HTTP 403** (Cloudflare) | Non vérifiés | **Ne pas autoriser** (inaccessible ; aucun contournement) ; reste « non vérifiée » |
| 6 | `bo-2019-22-reperes-attendus` | Page BO (HTML) — **non lue** | education.gouv.fr/bo | Déclaré : repères annuels et attendus de fin d'année (cycle 4) | Déclaré : 2019 | **HTTP 403** (Cloudflare) | Non vérifiés | **Ne pas autoriser** (inaccessible) |

## Constat important pour la 3e (programme 2020, en vigueur jusqu'en 2027-2028)
Aucun seed accessible ne contient le **programme 2020 du cycle 4** ni les **repères/attendus 2019** : leurs pages BO renvoient 403 et l'inventaire actuel les a lus sur des copies académiques ou tierces (pi.ac3j.fr, ac-toulouse.fr), hors du périmètre « sources officielles uniquement ». Les chapitres 3e (dont Pythagore) ne peuvent donc pas obtenir de source « verified » avec la liste actuelle. Options à décider : fournir l'URL d'un PDF officiel accessible (education.gouv.fr ou eduscol, `/sites/default/files/`), ou admettre une copie académique en tant que source secondaire explicitement signalée.

## Décisions du 2026-11-07 et URL de remplacement
- Approuvés (recherche contrôlée) : n° 1, 3, 4. Rejeté : n° 2 (doublon). La collecte reste bloquée tant que G0 n'est pas approuvé pour `bo` / `eduscol` ; aucune conservation dans data-store (droits non confirmés).
- URL fournies pour remplacer n° 5 et 6 — toutes **HTTP 403 (Cloudflare)**, non lues, aucun contournement :
  - `bo/20/Hebdo31/MENE2018714A.htm` (programme 2020) ;
  - `bo/19/Hebdo22/MENE1913283N.htm` (2019). Écart résolu le 2026-11-07 : le PDF du « Bulletin officiel n° 22 du 29 mai 2019 » (`/sites/default/files/document/BO_22_MENJ_1132537.pdf-231744.pdf`, 308 p., SHA256 `59c3cdd34dc2…`) contient « note de service n° 2019-072 du 28-5-2019 (NOR : MENE1913283N) — Attendus de fin d'année et repères annuels de progression … cycle 4 » ; `MENE1913384N` n'y figure pas. Seul le chapitre math-3e-pourcentages-evolution (source R2) citait ce mauvais code : corrigé (l'inventaire ne le citait pas) ;
  - `eduscol …/5736/ressources-d-accompagnement-…-cycle-4` (page HTML, hors des préfixes autorisés).
- PDF officiels publics trouvés en remplacement (lus un par un hors dépôt ; **G1 à décider**) :

| Seed | Document (lu) | Contenu | Application | Accès | Droits |
|---|---|---|---|---|---|
| `c4-programme-2020-eduscol-pdf` | « Programme du cycle 4 – En vigueur à la rentrée 2020 – D'après le BOEN n° 31 du 30 juillet 2020 », 139 p. (toutes disciplines, dont mathématiques et physique-chimie), SHA256 `de42e9816d7d…` | Programme 2020 (cité « Pythagore ») | 3e : en vigueur jusqu'en 2027-2028 (inventaire) | 200 | Non mentionnés dans le PDF ; conditions Éduscol non lues (403) |
| `c4-attendus-4e-2019-pdf` | « 4e Mathématiques – ATTENDUS de fin d'année », 12 p., 24-04-2019, SHA256 `d0edabd6a21d…` | Contient « le théorème de Pythagore et sa réciproque » | 4e (et consolidation 3e) | 200 | Idem |
| `c4-attendus-3e-2019-pdf` | « 3e Mathématiques – ATTENDUS de fin d'année », 11 p., 24-04-2019, SHA256 `49ccdca4d97b…` | Attendus de 3e (Pythagore non cité) | 3e | 200 | Idem |

Le PDF des **repères annuels de progression du cycle 4** n'a pas été trouvé à une URL directe publique : fichier ou URL à fournir.
