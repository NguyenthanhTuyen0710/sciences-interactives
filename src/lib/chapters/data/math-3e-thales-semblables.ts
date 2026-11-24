// SCI-3E-MATH-012 — Mathématiques 3e : Thalès (configuration papillon) et triangles semblables.
// Exigible en 3e : Thalès et sa réciproque dans la configuration papillon (M3-EG-03) ; triangles semblables,
// une définition (côtés proportionnels) et une propriété caractéristique angulaire, calculs de longueurs (M3-EG-04).
// Consolidation 4e (required: false) : triangles emboîtés (M4-EG-05, M4-EG-06).
// La contraposée (droites non parallèles) est un approfondissement facultatif signalé comme tel.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, Rng } from "../../engine/types";
import { parseNumber, tex } from "../../engine/numbers";
import { geometry } from "../../engine/svg";
import { flashConfig, erreursConfig } from "../../games/logic";

// <pipeline:meta> générée par pipeline/run.ts depuis la fiche et l'inventaire — ne pas modifier à la main
const META = {
  "id": "math-3e-thales-semblables",
  "taskId": "SCI-3E-MATH-012",
  "grade": "3e",
  "subject": "mathematiques",
  "treeChapterId": "m3-thales",
  "curriculumChapterIds": [
    "math-3e-thales-semblables",
    "math-4e-thales"
  ],
  "curriculumVersion": "2026-2027",
  "title": "Thalès (configuration papillon) et triangles semblables",
  "officialObjectives": [
    {
      "id": "M3-EG-03",
      "text": "Utiliser le théorème de Thalès et sa réciproque dans la configuration papillon.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Géométrie plane (3e) ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M3-EG-04",
      "text": "Définir et caractériser des triangles semblables et calculer des longueurs.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Géométrie plane (3e) ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M4-EG-05",
      "text": "Calculer des longueurs avec le théorème de Thalès dans la configuration des triangles emboîtés.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Géométrie plane (4e) ; Attendus de fin d'année de 4e (2019) (consolidation)",
      "required": false
    },
    {
      "id": "M4-EG-06",
      "text": "Démontrer un parallélisme à l'aide de rapports de longueurs (réciproque).",
      "source": "Attendus de fin d'année de 4e (2019) › Utiliser les notions de géométrie plane pour démontrer (consolidation)",
      "required": false
    }
  ],
  "sources": [
    {
      "id": "c4-programme-2020-eduscol-pdf",
      "title": "Programme du cycle 4 en vigueur à la rentrée 2020 (d'après le BOEN n° 31 du 30 juillet 2020), Éduscol",
      "url": "https://eduscol.education.gouv.fr/sites/default/files/document/programme-d-enseignement-du-cycle-4-67722.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "de42e9816d7d012fd5d6b3349171cf43dd038c1e50fa0fe9e664bcc8521194b9",
      "accessedAt": "2026-11-07T14:49:44.189Z"
    },
    {
      "id": "c4-attendus-3e-2019-pdf",
      "title": "Mathématiques 3e — attendus de fin d'année (2019), Éduscol",
      "url": "https://eduscol.education.gouv.fr/sites/default/files/document/18-maths-3e-attendus-eduscol1114748pdf-74688.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "49ccdca4d97ba4cf25875dfc731474e84d0332985c15396d3abfb9107f5f545a",
      "accessedAt": "2026-11-07T14:50:10.048Z"
    },
    {
      "id": "bo-2019-22-pdf",
      "title": "Bulletin officiel n° 22 du 29 mai 2019 — repères annuels de progression et attendus de fin d'année (note de service n° 2019-072, NOR MENE1913283N), annexe 26 : mathématiques cycle 4",
      "url": "https://www.education.gouv.fr/sites/default/files/document/BO_22_MENJ_1132537.pdf-231744.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "59c3cdd34dc2fbfb05573d913b695eae1bc98eea1c0eb51580cbb4ad42f36065",
      "accessedAt": "2026-11-07T15:03:14.705Z"
    }
  ],
  "reviewStatus": {
    "curriculum": "pending",
    "accuracy": "pending",
    "exercises": "pending",
    "games": "pending",
    "technical": "pending",
    "language": "pending"
  },
  "publicationStatus": "draft"
} satisfies Partial<import("../schema").ChapterContent>;
// </pipeline:meta>


const T = (x: number) => tex(x);
const r2 = (x: number) => Math.round(x * 100) / 100;
const lb = (v: number) => String(v).replace(".", ",");
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const num = (value: number, mistakes: Mistake[] = [], prompt?: string, suffix?: string): ChapterPart => ({
  prompt,
  interaction: { kind: "numerique", suffix, answer: { value } },
  mistakes: mistakes.filter((m) => parseNumber(m.match)?.value !== value),
});
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const etapes = (steps: { prompt: string; value: number; suffix?: string }[]): ChapterPart => ({ interaction: { kind: "etapes", steps: steps.map((s) => ({ prompt: s.prompt, suffix: s.suffix, answer: { value: s.value } })) } });

/** Erreurs de calcul fréquentes pour une quatrième proportionnelle X × Y ÷ Z : rapport inversé, raisonnement additif. */
const wrongs = (X: number, Y: number, Z: number, add: number): Mistake[] => [
  { match: String(r2((X * Z) / Y)), feedback: "Tu as inversé l'un des deux rapports : vérifie que chaque rapport relie des longueurs situées dans le même ordre sur les deux droites." },
  { match: String(r2(add)), feedback: "Tu as raisonné par addition ou soustraction : la situation est proportionnelle, on utilise un produit en croix." },
];

type Obj = "M3-EG-03" | "M3-EG-04" | "M4-EG-05" | "M4-EG-06";
type Tax = "TS-T01" | "TS-T02" | "TS-T03" | "TS-T04" | "TS-T05" | "TS-T06" | "TS-T07" | "TS-T08" | "TS-T09";
const ex = (e: Omit<ChapterExercise, "objectives" | "taxonomyTypes"> & { objectives: Obj[]; taxonomyTypes: Tax[] }): ChapterExercise => e;

// ───────────────────────── Figures (générateur geometry) ─────────────────────────
const NE = "Figure non à l'échelle.";
type Lab = string | undefined;
const deg = (d: number) => (d * Math.PI) / 180;
const p3 = (x: number) => Math.round(x * 1000) / 1000;
const pt = (r: number, d: number): [number, number] => [p3(r * Math.cos(deg(d))), p3(r * Math.sin(deg(d)))];
const seg = (from: string, to: string, label?: Lab, parallel?: number) => ({ from, to, ...(label ? { label } : {}), ...(parallel ? { parallel } : {}) });

/** Configuration papillon : B et M sur une droite (A entre les deux), C et N sur l'autre. lab = [AB, AM, AC, AN]. */
function papSvg(o: { a: number; m: number; c: number; n: number; lab?: Lab[]; lbc?: Lab; lmn?: Lab; par?: boolean; marks?: boolean; right?: boolean; title: string }): string {
  const t1 = 20;
  const t2 = o.right ? 110 : 140;
  const lab = o.lab ?? [];
  const par = o.par ? 1 : undefined;
  return geometry({
    points: { A: [0, 0], B: pt(o.a, t1), M: pt(o.m, t1 + 180), C: pt(o.c, t2), N: pt(o.n, t2 + 180) },
    segments: [seg("A", "B", lab[0]), seg("A", "M", lab[1]), seg("A", "C", lab[2]), seg("A", "N", lab[3]), seg("B", "C", o.lbc, par), seg("M", "N", o.lmn, par)],
    ...(o.marks ? { angles: [{ at: "B", from: "A", to: "C", marks: 1 }, { at: "M", from: "A", to: "N", marks: 1 }, { at: "C", from: "A", to: "B", marks: 2 }, { at: "N", from: "A", to: "M", marks: 2 }] } : {}),
    title: o.title,
  });
}
/** Triangles emboîtés : M sur [AB], N sur [AC]. lab = [AM, MB, AN, NC]. */
function embSvg(o: { a: number; m: number; c: number; n: number; lab?: Lab[]; par?: boolean; title: string }): string {
  const lab = o.lab ?? [];
  const par = o.par ? 1 : undefined;
  return geometry({
    points: { A: [0, 0], M: pt(o.m, 8), B: pt(o.a, 8), N: pt(o.n, 70), C: pt(o.c, 70) },
    segments: [seg("A", "M", lab[0]), seg("M", "B", lab[1]), seg("A", "N", lab[2]), seg("N", "C", lab[3]), seg("M", "N", undefined, par), seg("B", "C", undefined, par)],
    title: o.title,
  });
}
const PAP_TITLE = "Configuration papillon : les droites (BM) et (CN) se coupent en A, entre B et M et entre C et N ; (BC) et (MN) sont parallèles";
const EMB_TITLE = "Triangles emboîtés : M est sur le segment [AB], N sur le segment [AC] ; (MN) et (BC) sont parallèles";

// ───────────────────────── Tirages de données ─────────────────────────
/** a/m = c/n (papillon) avec n décimal à une décimale au plus. */
function thalesData(rng: Rng) {
  for (let i = 0; i < 500; i++) {
    const a = rng.int(3, 9), m = rng.int(2, 12), c = rng.int(3, 10);
    if (m === a || (c * m * 10) % a !== 0) continue;
    return { a, m, c, n: (c * m * 10) / a / 10 };
  }
  return { a: 4, m: 6, c: 5, n: 7.5 };
}
/** Triangles emboîtés : m < a, n < c. */
function embData(rng: Rng) {
  for (let i = 0; i < 500; i++) {
    const a = rng.int(6, 12), m = rng.int(2, a - 1), c = rng.int(5, 12);
    if ((c * m * 10) % a !== 0) continue;
    return { a, m, c, n: (c * m * 10) / a / 10 };
  }
  return { a: 8, m: 6, c: 10, n: 7.5 };
}
/** Papillon avec BC et MN : mn/b = m/a. */
function thalesData2(rng: Rng) {
  for (let i = 0; i < 500; i++) {
    const a = rng.int(3, 9), m = rng.int(2, 12), b = rng.int(3, 14);
    if (m === a || (b * m * 10) % a !== 0) continue;
    return { a, m, b, mn: (b * m * 10) / a / 10 };
  }
  return { a: 4, m: 6, b: 5, mn: 7.5 };
}
/** Rapport p/q irréductible ; toutes les longueurs sont entières : m/a = n/c = mn/b = p/q. */
function ratioSet(rng: Rng, ks: number[] = [1, 2, 3, 4]) {
  const [p, q] = rng.pick<[number, number]>([[2, 3], [3, 2], [3, 4], [4, 3], [5, 4], [2, 5], [5, 3], [3, 5]]);
  const [k1, k2, k3] = rng.shuffle(ks);
  return { p, q, a: q * k1, m: p * k1, c: q * k2, n: p * k2, b: q * k3, mn: p * k3 };
}
const BASES: [number, number, number][] = [[3, 4, 5], [4, 5, 6], [5, 6, 8], [6, 7, 9]];
const EVEN_BASES: [number, number, number][] = [[4, 6, 8], [6, 8, 10], [8, 10, 12], [6, 10, 12]];
const TRIPLES2: [number, number, number][] = [[6, 8, 10], [10, 24, 26], [16, 30, 34]];

// ───────────────────────── Rédactions à remettre dans l'ordre ─────────────────────────
const SEMB_STEPS = [
  "On sait que $(BC)$ et $(MN)$ sont parallèles et coupées par la sécante $(BM)$ : les angles alternes-internes $\\widehat{ABC}$ et $\\widehat{AMN}$ ont la même mesure.",
  "De même, avec la sécante $(CN)$, les angles alternes-internes $\\widehat{ACB}$ et $\\widehat{ANM}$ ont la même mesure.",
  "Les triangles $ABC$ et $AMN$ ont donc deux angles deux à deux de même mesure.",
  "Conclusion : $ABC$ et $AMN$ sont semblables, d'après la propriété caractéristique angulaire.",
];
const semItems = [SEMB_STEPS[2], SEMB_STEPS[0], SEMB_STEPS[3], SEMB_STEPS[1]];
const TH_STEPS = [
  "Les points $B$, $A$, $M$ d'une part, $C$, $A$, $N$ d'autre part sont alignés dans cet ordre et $(BC)$ est parallèle à $(MN)$ : d'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.",
  "On remplace par les valeurs : $\\dfrac{6}{4} = \\dfrac{AN}{5}$.",
  "Par le produit en croix : $AN = \\dfrac{6 \\times 5}{4}$.",
  "Conclusion : $AN = 7{,}5$ cm.",
];
const thItems = [TH_STEPS[2], TH_STEPS[0], TH_STEPS[3], TH_STEPS[1]];

// ───────────────────────── Exercices ─────────────────────────
const CONCL_PAP = (nameOk = true) => [
  "Les points $B$, $A$, $M$ et $C$, $A$, $N$ sont alignés dans le même ordre et $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ : d'après la réciproque du théorème de Thalès, $(BC) // (MN)$.",
  "On a $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$, donc d'après le théorème de Thalès, $(BC) // (MN)$.",
  "Les droites ont l'air parallèles sur la figure, donc $(BC) // (MN)$.",
  "On ne peut pas conclure car certaines longueurs sont décimales.",
];
const CONCL_DIAG: Record<number, string> = {
  1: "Le théorème de Thalès **suppose** le parallélisme ; pour le démontrer, on utilise sa **réciproque**.",
  2: "Une impression visuelle ne prouve rien : seul le calcul exact des rapports démontre.",
  3: "Les décimaux ne gênent pas : on compare des produits ou des rapports exacts.",
};

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 ──
  ex({
    id: "th3-01", title: "Reconnaître la configuration", niveau: 1, objectives: ["M3-EG-03", "M4-EG-05"], taxonomyTypes: ["TS-T01"], time: 90,
    vary: (rng) => {
      const pap = rng.next() < 0.5;
      const a = rng.int(4, 6), c = rng.int(4, 6);
      const r = pap ? rng.pick([1.5, 2]) : rng.pick([0.5, 0.75]);
      const svg = pap ? papSvg({ a, m: a * r, c, n: c * r, par: true, title: PAP_TITLE }) : embSvg({ a, m: a * r, c, n: c * r, par: true, title: EMB_TITLE });
      return {
        statement: "Les droites $(BC)$ et $(MN)$ sont parallèles. Observe la figure : quelle configuration reconnais-tu ?",
        figure: { kind: "svg", svg, caption: NE },
        parts: [shuffledQcm(rng, ["Configuration papillon", "Configuration des triangles emboîtés", "Aucune des deux"], pap ? 0 : 1,
          pap ? { 1: "Ici $A$ est entre $B$ et $M$ : les deux triangles sont de part et d'autre de $A$.", 2: "Les deux droites sécantes en $A$ et les parallèles forment bien une configuration de Thalès." }
              : { 0: "Ici $M$ est sur $[AB]$ et $N$ sur $[AC]$ : un triangle est à l'intérieur de l'autre.", 2: "Les deux droites sécantes en $A$ et les parallèles forment bien une configuration de Thalès." })],
        solution: pap
          ? ["Les droites $(BM)$ et $(CN)$ se coupent en $A$, et $A$ est situé entre $B$ et $M$ et entre $C$ et $N$.", "Les triangles $ABC$ et $AMN$ sont de part et d'autre de $A$ : c'est la configuration papillon."]
          : ["Les points $M$ et $N$ sont sur les côtés $[AB]$ et $[AC]$ du triangle $ABC$.", "Le triangle $AMN$ est à l'intérieur de $ABC$ : ce sont des triangles emboîtés."],
      };
    },
    reasoning: "On distingue les deux configurations par la position de $A$ : entre les points (papillon) ou à l'extrémité (emboîtés).",
    hints: ["Où est le point $A$ par rapport aux autres points sur chaque droite ?", "Les deux triangles se touchent-ils seulement en $A$, ou l'un est-il dans l'autre ?"],
  }),
  ex({
    id: "th3-02", title: "Associer les côtés correspondants", niveau: 1, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T01"], time: 120,
    vary: (rng) => {
      const a = rng.int(3, 5), c = rng.int(3, 5), r = rng.pick([1.5, 2]);
      const p = rng.pick([[0, 1, 2], [1, 0, 2], [0, 2, 1], [2, 1, 0]]);
      const base = ["$[AM]$", "$[AN]$", "$[MN]$"];
      return {
        statement: `${"Dans la configuration papillon ci-contre, $(BC)$ et $(MN)$ sont parallèles."} Associe chaque côté du triangle $ABC$ à son côté correspondant dans le triangle $AMN$ (côté porté par la même droite, ou parallèle).`,
        figure: { kind: "svg", svg: papSvg({ a, m: a * r, c, n: c * r, par: true, title: PAP_TITLE }), caption: NE },
        parts: [{ interaction: { kind: "associer", left: ["$[AB]$", "$[AC]$", "$[BC]$"], right: p.map((i) => base[i]), answer: p } }],
        solution: ["$[AB]$ est porté par la droite $(BM)$ : son côté correspondant est $[AM]$.", "$[AC]$ est porté par la droite $(CN)$ : son côté correspondant est $[AN]$.", "$[BC]$ est parallèle à $[MN]$ : son côté correspondant est $[MN]$."],
      };
    },
    reasoning: "Les côtés correspondants sont ceux qui sont sur la même droite issue de $A$, ou parallèles entre eux.",
    hints: ["Repère la droite qui porte $[AB]$.", "Le troisième côté de chaque triangle porte la marque de parallélisme."],
  }),
  ex({
    id: "th3-03", title: "Ces triangles sont-ils semblables ?", niveau: 1, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T06"], time: 120,
    vary: (rng) => {
      const [a, b, c] = rng.pick(BASES);
      const k = rng.pick([2, 3]);
      const sim = rng.next() < 0.5;
      const t2 = sim ? [a * k, b * k, c * k] : [a * k, b * k, c * k + rng.int(1, 2)];
      const s = rng.shuffle(t2);
      const sorted = [...t2].sort((x, y) => x - y);
      return {
        statement: `Un triangle a pour côtés $${a}$ cm, $${b}$ cm et $${c}$ cm. Un second triangle a pour côtés $${s[0]}$ cm, $${s[1]}$ cm et $${s[2]}$ cm. Ces deux triangles sont-ils semblables ?`,
        parts: [shuffledQcm(rng, ["Oui : leurs côtés sont proportionnels", "Non : les rapports des côtés ne sont pas tous égaux", "On ne peut pas savoir sans mesurer les angles"], sim ? 0 : 1,
          { [sim ? 1 : 0]: sim ? `Les trois rapports sont tous égaux à $${k}$.` : "Un seul rapport ne suffit pas : il faut que les trois rapports soient égaux.", 2: "Les longueurs des trois côtés suffisent pour décider." })],
        solution: [`On range les côtés du second triangle dans l'ordre croissant : $${sorted[0]}$, $${sorted[1]}$, $${sorted[2]}$.`, `$\\dfrac{${sorted[0]}}{${a}} = ${k}$ et $\\dfrac{${sorted[1]}}{${b}} = ${k}$.`, sim ? `$\\dfrac{${sorted[2]}}{${c}} = ${k}$ : les trois rapports sont égaux, les triangles sont semblables.` : `Mais $\\dfrac{${sorted[2]}}{${c}} \\neq ${k}$ : les rapports ne sont pas tous égaux, les triangles ne sont pas semblables.`],
      };
    },
    reasoning: "Deux triangles sont semblables quand les côtés de l'un sont proportionnels à ceux de l'autre : on compare les côtés rangés dans le même ordre.",
    hints: ["Range les côtés de chaque triangle par ordre croissant.", "Calcule le rapport de chaque couple de côtés correspondants."],
  }),
  // ── Niveau 2 ──
  ex({
    id: "th3-04", title: "Écrire les rapports de Thalès (papillon)", niveau: 2, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T01"], time: 120,
    vary: (rng) => {
      const a = rng.int(3, 5), c = rng.int(3, 5), r = rng.pick([1.5, 2, 2.5]);
      return {
        statement: "Dans la configuration papillon ci-contre, les droites $(BC)$ et $(MN)$ sont parallèles. Quelle égalité de rapports donne le théorème de Thalès ?",
        figure: { kind: "svg", svg: papSvg({ a, m: a * r, c, n: c * r, par: true, title: PAP_TITLE }), caption: NE },
        parts: [shuffledQcm(rng, [
          "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$",
          "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{BC}{MN}$",
          "$\\dfrac{AB}{AN} = \\dfrac{AC}{AM} = \\dfrac{BC}{MN}$",
          "$\\dfrac{AM}{AB} = \\dfrac{AC}{AN} = \\dfrac{MN}{BC}$",
        ], 0, {
          1: "Le troisième rapport est inversé : $MN$ doit être au numérateur comme $AM$ et $AN$.",
          2: "Les côtés ne sont pas associés dans le bon couple : $AB$ correspond à $AM$ (même droite), $AC$ à $AN$.",
          3: "Le deuxième rapport est inversé : $AN$ est au numérateur dans les autres rapports.",
        })],
        solution: ["Les côtés correspondants sont $[AM]$ et $[AB]$, $[AN]$ et $[AC]$, $[MN]$ et $[BC]$.", "On écrit chaque rapport avec le côté du triangle $AMN$ au numérateur : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$."],
      };
    },
    reasoning: "Chaque rapport compare un côté de $AMN$ à son côté correspondant de $ABC$, toujours dans le même sens.",
    hints: ["Associe d'abord les côtés correspondants.", "Garde le même sens dans les trois rapports."],
  }),
  ex({
    id: "th3-05", title: "Écrire les rapports de Thalès (triangles emboîtés) — consolidation 4e", niveau: 2, objectives: ["M4-EG-05"], taxonomyTypes: ["TS-T01"], time: 120,
    vary: (rng) => {
      const a = rng.int(5, 7), c = rng.int(5, 7), r = rng.pick([0.5, 0.75]);
      return {
        statement: "Consolidation (notion de 4e). Le point $M$ est sur $[AB]$, le point $N$ sur $[AC]$, et $(MN)$ est parallèle à $(BC)$. Quelle égalité de rapports donne le théorème de Thalès ?",
        figure: { kind: "svg", svg: embSvg({ a, m: a * r, c, n: c * r, par: true, title: EMB_TITLE }), caption: NE },
        parts: [shuffledQcm(rng, [
          "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$",
          "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{BC}{MN}$",
          "$\\dfrac{AM}{AB} = \\dfrac{AN}{NC} = \\dfrac{MN}{BC}$",
          "$\\dfrac{AM}{MB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$",
        ], 0, {
          1: "Le troisième rapport est inversé.",
          2: "$[NC]$ n'est qu'une partie de $[AC]$ : le dénominateur correspondant à $AN$ est $AC$.",
          3: "$[MB]$ n'est qu'une partie de $[AB]$ : le dénominateur correspondant à $AM$ est $AB$.",
        })],
        solution: ["$AMN$ est le petit triangle, $ABC$ le grand : on compare chaque côté du petit à son correspondant du grand.", "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$."],
      };
    },
    reasoning: "On prend toujours le côté entier du grand triangle ($AB$, $AC$), pas un morceau comme $MB$ ou $NC$.",
    hints: ["Identifie le petit et le grand triangle.", "Les dénominateurs sont des côtés entiers du grand triangle."],
  }),
  ex({
    id: "th3-06", title: "Thalès, réciproque, triangles semblables : vrai ou faux ?", niveau: 2, objectives: ["M3-EG-03", "M3-EG-04"], taxonomyTypes: ["TS-T01", "TS-T06"], time: 180,
    statement: "Vrai ou faux ?",
    parts: [{ interaction: { kind: "vrai-faux", items: [
      "On peut appliquer le théorème de Thalès sans savoir si $(BC)$ et $(MN)$ sont parallèles.",
      "Dans la configuration papillon, $A$ est situé entre $B$ et $M$ et entre $C$ et $N$.",
      "Si $(BC) // (MN)$ dans la configuration papillon, alors $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.",
      "Si $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ et si les points sont dans le même ordre sur les deux droites, alors $(BC) // (MN)$.",
      "Deux triangles dont seulement deux côtés sont proportionnels sont semblables.",
      "Deux triangles ayant deux angles deux à deux de même mesure sont semblables.",
    ], answer: [false, true, true, true, false, true] } }],
    solution: [
      "Faux : le théorème de Thalès a pour hypothèse le parallélisme ; sans lui, on ne peut pas l'utiliser.",
      "Vrai : c'est la définition de la configuration papillon.",
      "Vrai : c'est le théorème de Thalès.",
      "Vrai : c'est la réciproque, à condition que l'ordre des points soit respecté.",
      "Faux : il faut que les trois côtés soient proportionnels.",
      "Vrai : c'est la propriété caractéristique angulaire (le troisième angle s'en déduit).",
    ],
    reasoning: "Le théorème part du parallélisme pour donner des rapports égaux ; la réciproque fait l'inverse. Deux triangles sont semblables si les trois côtés sont proportionnels ou si deux angles sont égaux deux à deux.",
    hints: ["Distingue ce qu'on suppose et ce qu'on en déduit.", "Pour la semblance, pense aux trois côtés ou aux angles."],
  }),
  ex({
    id: "th3-07", title: "Comparer les côtés rangés", niveau: 2, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T06"], time: 150,
    vary: (rng) => {
      const [a, b, c] = rng.pick(EVEN_BASES);
      const k = rng.pick([1.5, 2, 2.5]);
      return {
        statement: `Le triangle $ABC$ a pour côtés $${a}$ cm, $${b}$ cm et $${c}$ cm ; le triangle $DEF$ a pour côtés $${T(k * a)}$ cm, $${T(k * b)}$ cm et $${T(k * c)}$ cm. Complète le tableau en calculant, pour chaque couple de côtés, le rapport (côté de $DEF$) ÷ (côté de $ABC$).`,
        parts: [
          { interaction: { kind: "tableau", headers: ["Côtés rangés", "ABC (cm)", "DEF (cm)", "Rapport"], rows: [
            { label: "Plus petit côté", cells: [String(a), T(k * a), { answer: { value: k } }] },
            { label: "Côté moyen", cells: [String(b), T(k * b), { answer: { value: k } }] },
            { label: "Plus grand côté", cells: [String(c), T(k * c), { answer: { value: k } }] },
          ] } },
          shuffledQcm(rng, ["Les triangles sont semblables : leurs côtés sont proportionnels", "Les triangles ne sont pas semblables", "On ne peut pas conclure"], 0, { 1: "Les trois rapports sont égaux : les côtés sont proportionnels.", 2: "Trois rapports égaux suffisent pour conclure." }, "Que peut-on en conclure ?"),
        ],
        solution: [`$\\dfrac{${T(k * a)}}{${a}} = ${T(k)}$, $\\dfrac{${T(k * b)}}{${b}} = ${T(k)}$ et $\\dfrac{${T(k * c)}}{${c}} = ${T(k)}$.`, "Les trois rapports sont égaux : les côtés sont proportionnels, les triangles sont semblables."],
      };
    },
    reasoning: "On range les côtés dans le même ordre pour que chaque couple soit formé de côtés homologues.",
    hints: ["Divise chaque côté de $DEF$ par le côté correspondant de $ABC$.", "Compare les trois résultats."],
  }),
  ex({
    id: "th3-08", title: "Coefficient donné : calculer les côtés", niveau: 2, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T08"], time: 150,
    vary: (rng) => {
      const [a, b, c] = rng.pick(EVEN_BASES);
      const k = rng.pick([0.5, 1.5, 2, 2.5, 3]);
      return {
        statement: `Les triangles $ABC$ et $DEF$ sont semblables ; leurs côtés homologues sont $[AB]$ et $[DE]$, $[BC]$ et $[EF]$, $[AC]$ et $[DF]$. On a $AB = ${a}$ cm, $BC = ${b}$ cm et $AC = ${c}$ cm. Le coefficient pour passer de $ABC$ à $DEF$ est $k = ${T(k)}$.`,
        parts: [etapes([
          { prompt: "Longueur $DE$", value: r2(k * a), suffix: "cm" },
          { prompt: "Longueur $EF$", value: r2(k * b), suffix: "cm" },
          { prompt: "Longueur $DF$", value: r2(k * c), suffix: "cm" },
        ])],
        solution: ["Chaque côté de $DEF$ s'obtient en multipliant le côté homologue de $ABC$ par $k$.", `$DE = ${T(k)} \\times ${a} = ${T(r2(k * a))}$ cm.`, `$EF = ${T(k)} \\times ${b} = ${T(r2(k * b))}$ cm.`, `$DF = ${T(k)} \\times ${c} = ${T(r2(k * c))}$ cm.`],
      };
    },
    reasoning: k0(),
    hints: ["Quel côté de $DEF$ est homologue de $[AB]$ ?", "Multiplie par le coefficient."],
  }),
  ex({
    id: "th3-09", title: "Calculer le coefficient puis une longueur", niveau: 2, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T08"], time: 180,
    vary: (rng) => {
      const a = rng.pick([4, 6, 8, 10]), c = rng.pick([6, 8, 10, 12]);
      const k = rng.pick([0.5, 1.5, 2, 2.5, 3]);
      return {
        statement: `Les triangles $ABC$ et $DEF$ sont semblables, avec $[DE]$ homologue de $[AB]$ et $[DF]$ homologue de $[AC]$. On a $AB = ${a}$ cm, $AC = ${c}$ cm et $DE = ${T(r2(k * a))}$ cm. On cherche le coefficient $k$ qui permet de passer de $ABC$ à $DEF$, puis la longueur $DF$.`,
        parts: [etapes([
          { prompt: "Coefficient $k$", value: k },
          { prompt: "Longueur $DF$", value: r2(k * c), suffix: "cm" },
        ])],
        solution: [`$k = \\dfrac{DE}{AB} = \\dfrac{${T(r2(k * a))}}{${a}} = ${T(k)}$.`, `$DF = k \\times AC = ${T(k)} \\times ${c} = ${T(r2(k * c))}$ cm.`],
      };
    },
    reasoning: "Le coefficient se calcule avec deux côtés homologues connus ; il sert ensuite pour tous les autres côtés.",
    hints: ["Divise la longueur du nouveau triangle par celle de l'ancien, côté homologue contre côté homologue.", "Réutilise ce coefficient pour $DF$."],
  }),
  ex({
    id: "th3-10", title: "Calculer AN (configuration papillon)", niveau: 2, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T03"], time: 180,
    vary: (rng) => {
      const { a, m, c, n } = thalesData(rng);
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles. On sait que $AB$ mesure $${T(a)}$ cm, $AM$ mesure $${T(m)}$ cm et $AC$ mesure $${T(c)}$ cm. On cherche la longueur $AN$.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [lb(a), lb(m), lb(c), "x"], par: true, title: PAP_TITLE }), caption: `Configuration papillon. ${NE}` },
        parts: [
          shuffledQcm(rng, ["$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$", "$\\dfrac{AB}{AN} = \\dfrac{AC}{AM}$", "$\\dfrac{AM}{AB} = \\dfrac{AC}{AN}$", "$\\dfrac{AM}{AC} = \\dfrac{BC}{AN}$"], 0, {
            1: "Les côtés ne sont pas dans le bon couple : $AB$ correspond à $AM$.", 2: "Un des rapports est inversé.", 3: "$BC$ n'appartient pas au même couple de côtés correspondants que $AM$ et $AC$.",
          }, "1. Quelle égalité de rapports peut-on écrire ?"),
          num(n, wrongs(c, m, a, c + m - a), `2. En remplaçant, l'égalité devient $\\dfrac{x}{${T(c)}} = \\dfrac{${T(m)}}{${T(a)}}$, où $x$ désigne la longueur $AN$. Calcule $x$.`, "cm"),
        ],
        solution: ["$(BC) // (MN)$, avec $B$, $A$, $M$ et $C$, $A$, $N$ alignés dans cet ordre : d'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", `$\\dfrac{${T(m)}}{${T(a)}} = \\dfrac{AN}{${T(c)}}$, donc $AN = \\dfrac{${T(c)} \\times ${T(m)}}{${T(a)}} = ${T(n)}$ cm.`],
      };
    },
    solveCheck: [{ equation: 1, answer: 1, positive: true }],
    reasoning: "On écrit l'égalité des rapports avec les bons côtés, on remplace, puis on résout par produit en croix.",
    hints: ["Associe $AM$ à $AB$ et $AN$ à $AC$.", "Un produit en croix donne $AN$ en fonction des trois longueurs connues."],
  }),
  ex({
    id: "th3-11", title: "Calculer AN (triangles emboîtés) — consolidation 4e", niveau: 2, objectives: ["M4-EG-05"], taxonomyTypes: ["TS-T02"], time: 180,
    vary: (rng) => {
      const { a, m, c, n } = embData(rng);
      return {
        statement: `Consolidation (notion de 4e). Dans le triangle $ABC$, le point $M$ est sur $[AB]$ et le point $N$ sur $[AC]$ ; les droites $(MN)$ et $(BC)$ sont parallèles. On sait que $AB$ mesure $${T(a)}$ cm, $AM$ mesure $${T(m)}$ cm et $AC$ mesure $${T(c)}$ cm. On cherche la longueur $AN$.`,
        figure: { kind: "svg", svg: embSvg({ a, m, c, n, lab: [lb(m), undefined, "x", undefined], par: true, title: EMB_TITLE }), caption: `Triangles emboîtés. ${NE}` },
        parts: [
          shuffledQcm(rng, ["$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$", "$\\dfrac{AM}{MB} = \\dfrac{AN}{AC}$", "$\\dfrac{AB}{AM} = \\dfrac{AN}{AC}$"], 0, {
            1: "$MB$ n'est qu'une partie de $AB$ : le rapport $\\dfrac{AM}{AB}$ est celui qui correspond à $\\dfrac{AN}{AC}$.", 2: "Un des rapports est inversé.",
          }, "1. Quelle égalité de rapports peut-on écrire ?"),
          num(n, wrongs(c, m, a, c + m - a), `2. En remplaçant, l'égalité devient $\\dfrac{x}{${T(c)}} = \\dfrac{${T(m)}}{${T(a)}}$, où $x$ désigne la longueur $AN$. Calcule $x$.`, "cm"),
        ],
        solution: ["$(MN) // (BC)$, $M \\in [AB]$ et $N \\in [AC]$ : d'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", `$AN = \\dfrac{${T(c)} \\times ${T(m)}}{${T(a)}} = ${T(n)}$ cm.`],
      };
    },
    solveCheck: [{ equation: 1, answer: 1, positive: true }],
    reasoning: "Dans les triangles emboîtés, le petit triangle $AMN$ est une réduction du grand $ABC$ : les rapports portent sur des côtés entiers.",
    hints: ["Quel est le petit triangle, quel est le grand ?", "Produit en croix avec les côtés entiers $AB$ et $AC$."],
  }),
  ex({
    id: "th3-29", title: "Rédiger un calcul avec Thalès", niveau: 2, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T03"], time: 150,
    statement: "Les droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; $(BC) // (MN)$, $AB = 4$ cm, $AM = 6$ cm et $AC = 5$ cm. On veut calculer $AN$. Remets les étapes de la rédaction dans l'ordre.",
    parts: [{ interaction: { kind: "ordonner", items: thItems, answer: TH_STEPS.map((s) => thItems.indexOf(s)), hint: "Première étape en haut, conclusion en bas" } }],
    solution: [...TH_STEPS],
    reasoning: "Une bonne rédaction cite le théorème et ses conditions, écrit l'égalité de rapports, remplace, calcule, puis conclut avec l'unité.",
    hints: ["La première phrase vérifie les hypothèses.", "La conclusion donne $AN$ avec son unité."],
  }),
  // ── Niveau 3 ──
  ex({
    id: "th3-12", title: "Une longueur du grand triangle ABC", niveau: 3, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T03"], time: 180,
    vary: (rng) => {
      const { a, m, c, n } = thalesData(rng);
      const hidAB = rng.next() < 0.5;
      const known = hidAB ? `$AM$ mesure $${T(m)}$ cm, $AN$ mesure $${T(n)}$ cm et $AC$ mesure $${T(c)}$ cm` : `$AM$ mesure $${T(m)}$ cm, $AN$ mesure $${T(n)}$ cm et $AB$ mesure $${T(a)}$ cm`;
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles. On sait que ${known}. Calcule $${hidAB ? "AB" : "AC"}$.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [hidAB ? "x" : lb(a), lb(m), hidAB ? lb(c) : "x", lb(n)], par: true, title: PAP_TITLE }), caption: `Configuration papillon. ${NE}` },
        parts: [num(hidAB ? a : c, hidAB ? wrongs(m, c, n, m + c - n) : wrongs(n, a, m, a + n - m), undefined, "cm")],
        solution: ["$(BC) // (MN)$ avec les points alignés dans le même ordre : d'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", hidAB ? `$\\dfrac{${T(m)}}{AB} = \\dfrac{${T(n)}}{${T(c)}}$, donc $AB = \\dfrac{${T(m)} \\times ${T(c)}}{${T(n)}} = ${T(a)}$ cm.` : `$\\dfrac{${T(m)}}{${T(a)}} = \\dfrac{${T(n)}}{AC}$, donc $AC = \\dfrac{${T(n)} \\times ${T(a)}}{${T(m)}} = ${T(c)}$ cm.`],
      };
    },
    reasoning: "Quand l'inconnue est au dénominateur, le produit en croix permet quand même de l'isoler.",
    hints: ["Écris l'égalité $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", "Utilise le produit en croix pour isoler l'inconnue."],
  }),
  ex({
    id: "th3-13", title: "Calculer MN ou BC", niveau: 3, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T03"], time: 210,
    vary: (rng) => {
      const { a, m, b, mn } = thalesData2(rng);
      const hidMN = rng.next() < 0.5;
      const c = rng.int(4, 8), n = (c * m) / a;
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles. On sait que $AB$ mesure $${T(a)}$ cm, $AM$ mesure $${T(m)}$ cm et ${hidMN ? `$BC$ mesure $${T(b)}$ cm` : `$MN$ mesure $${T(mn)}$ cm`}. Calcule $${hidMN ? "MN" : "BC"}$.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [lb(a), lb(m)], lbc: hidMN ? lb(b) : "x", lmn: hidMN ? "x" : lb(mn), par: true, title: PAP_TITLE }), caption: `Configuration papillon. ${NE}` },
        parts: [num(hidMN ? mn : b, hidMN ? wrongs(b, m, a, b + m - a) : wrongs(mn, a, m, mn + a - m), undefined, "cm")],
        solution: ["Thalès (papillon, $(BC) // (MN)$) : $\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$.", hidMN ? `$MN = \\dfrac{${T(m)} \\times ${T(b)}}{${T(a)}} = ${T(mn)}$ cm.` : `$BC = \\dfrac{${T(a)} \\times ${T(mn)}}{${T(m)}} = ${T(b)}$ cm.`],
      };
    },
    reasoning: "Le troisième rapport de l'égalité de Thalès relie les deux côtés parallèles $[MN]$ et $[BC]$.",
    hints: ["Quel rapport contient $MN$ et $BC$ ?", "Associe-le à $\\dfrac{AM}{AB}$."],
  }),
  ex({
    id: "th3-14", title: "Valeur exacte puis arrondi", niveau: 3, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T03"], time: 240,
    vary: (rng) => {
      let a = 7, m = 5, c = 4;
      for (let i = 0; i < 500; i++) {
        const a2 = rng.int(3, 9), m2 = rng.int(2, 12), c2 = rng.int(3, 10);
        const v2 = (c2 * m2) / a2;
        const f = (v2 * 10) % 1;
        if (m2 !== a2 && (c2 * m2 * 10) % a2 !== 0 && Math.abs(f - 0.5) > 0.05 && gcd(c2 * m2, a2) < a2) { a = a2; m = m2; c = c2; break; }
      }
      const g = gcd(c * m, a), pn = (c * m) / g, pd = a / g;
      const v = (c * m) / a;
      const r1 = Math.round(v * 10) / 10;
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles. On sait que $AB$ mesure $${a}$ cm, $AM$ mesure $${m}$ cm et $AC$ mesure $${c}$ cm.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n: v, lab: [lb(a), lb(m), lb(c), "x"], par: true, title: PAP_TITLE }), caption: `Configuration papillon. ${NE}` },
        parts: [
          { prompt: "1. Donne la valeur **exacte** de $AN$ sous forme de fraction irréductible.", interaction: { kind: "numerique", suffix: "cm", answer: { value: v, fraction: [pn, pd] } } },
          { prompt: "2. Donne l'arrondi de $AN$ au dixième.", interaction: { kind: "numerique", suffix: "cm", answer: { value: r1, tol: 0.001, decimals: 1, roundingLabel: "au dixième" } } },
        ],
        solution: ["Thalès : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", `$AN = \\dfrac{${m} \\times ${c}}{${a}} = \\dfrac{${pn}}{${pd}}$ cm (valeur exacte).`, `À la calculatrice : $AN \\approx ${T(r1)}$ cm (arrondi au dixième).`],
      };
    },
    reasoning: "On garde la fraction exacte et on n'arrondit qu'à la fin.",
    hints: ["Écris $AN$ comme un quotient de produits.", "Simplifie la fraction avant d'arrondir."],
  }),
  ex({
    id: "th3-15", title: "Du segment entier au segment restant — consolidation 4e", niveau: 3, objectives: ["M4-EG-05"], taxonomyTypes: ["TS-T02"], time: 240,
    vary: (rng) => {
      const { a, m, c, n } = embData(rng);
      return {
        statement: `Consolidation (notion de 4e). Dans le triangle $ABC$, $M$ est sur $[AB]$ et $N$ sur $[AC]$ ; $(MN) // (BC)$. On sait que $AM$ mesure $${T(m)}$ cm, $AB$ mesure $${T(a)}$ cm et $AN$ mesure $${T(n)}$ cm. On cherche $AC$, puis la longueur $NC$.`,
        figure: { kind: "svg", svg: embSvg({ a, m, c, n, lab: [lb(m), undefined, lb(n), "?"], par: true, title: EMB_TITLE }), caption: `Triangles emboîtés. ${NE}` },
        parts: [etapes([
          { prompt: "Longueur $AC$", value: c, suffix: "cm" },
          { prompt: "Longueur $NC$", value: r2(c - n), suffix: "cm" },
        ])],
        solution: ["Thalès : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", `$AC = \\dfrac{${T(n)} \\times ${T(a)}}{${T(m)}} = ${T(c)}$ cm.`, `$N$ est sur $[AC]$ : $NC = AC - AN = ${T(c)} - ${T(n)} = ${T(r2(c - n))}$ cm.`],
      };
    },
    reasoning: "Thalès donne les longueurs depuis $A$ ; un segment restant s'obtient par différence.",
    hints: ["Commence par $AC$.", "$N$ est entre $A$ et $C$ : $NC$ s'obtient par soustraction."],
  }),
  ex({
    id: "th3-16", title: "Démontrer que (BC) et (MN) sont parallèles", niveau: 3, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T04"], time: 240,
    vary: (rng) => {
      const { a, m, c, n } = thalesData(rng);
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$. On sait que $AB$ mesure $${T(a)}$ cm, $AM$ mesure $${T(m)}$ cm, $AC$ mesure $${T(c)}$ cm et $AN$ mesure $${T(n)}$ cm. On veut démontrer que $(BC)$ et $(MN)$ sont parallèles.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [lb(a), lb(m), lb(c), lb(n)], title: "Configuration papillon dont on cherche à démontrer le parallélisme" }), caption: `Configuration papillon. ${NE}` },
        parts: [
          num(r2(m * c), [], "1. Calcule $AM \\times AC$.", "cm²"),
          num(r2(n * a), [], "2. Calcule $AN \\times AB$.", "cm²"),
          shuffledQcm(rng, CONCL_PAP(), 0, CONCL_DIAG, "3. Quelle conclusion est correcte ?"),
        ],
        solution: [`$AM \\times AC = ${T(m)} \\times ${T(c)} = ${T(r2(m * c))}$ et $AN \\times AB = ${T(n)} \\times ${T(a)} = ${T(r2(n * a))}$.`, "Les deux produits sont égaux : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ (produit en croix).", "Les points $B$, $A$, $M$ et $C$, $A$, $N$ sont alignés dans le même ordre : d'après la réciproque du théorème de Thalès, $(BC) // (MN)$."],
      };
    },
    reasoning: "Comparer deux rapports revient à comparer deux produits en croix, calculés exactement.",
    hints: ["Les rapports sont égaux exactement quand les produits en croix sont égaux.", "Vérifie aussi l'ordre des points avant de conclure."],
  }),
  ex({
    id: "th3-17", title: "Démontrer un parallélisme (triangles emboîtés) — consolidation 4e", niveau: 3, objectives: ["M4-EG-06"], taxonomyTypes: ["TS-T04"], time: 240,
    vary: (rng) => {
      const { a, m, c, n } = embData(rng);
      return {
        statement: `Consolidation (notion de 4e). Dans le triangle $ABC$, $M$ est sur $[AB]$ et $N$ sur $[AC]$ avec $AM = ${T(m)}$ cm, $AB = ${T(a)}$ cm, $AN = ${T(n)}$ cm et $AC = ${T(c)}$ cm. On veut démontrer que $(MN)$ et $(BC)$ sont parallèles.`,
        figure: { kind: "svg", svg: embSvg({ a, m, c, n, lab: [lb(m), undefined, lb(n), undefined], title: "Triangles emboîtés dont on cherche à démontrer le parallélisme" }), caption: `Triangles emboîtés. ${NE}` },
        parts: [
          num(r2(m * c), [], "1. Calcule $AM \\times AC$.", "cm²"),
          num(r2(n * a), [], "2. Calcule $AN \\times AB$.", "cm²"),
          shuffledQcm(rng, [
            "Les points $A$, $M$, $B$ et $A$, $N$, $C$ sont alignés dans le même ordre et $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ : d'après la réciproque du théorème de Thalès, $(MN) // (BC)$.",
            "On a $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$, donc d'après le théorème de Thalès, $(MN) // (BC)$.",
            "$(MN)$ et $(BC)$ semblent parallèles sur la figure, donc elles le sont.",
          ], 0, { 1: CONCL_DIAG[1], 2: CONCL_DIAG[2] }, "3. Quelle conclusion est correcte ?"),
        ],
        solution: [`$AM \\times AC = ${T(r2(m * c))}$ et $AN \\times AB = ${T(r2(n * a))}$ : les produits sont égaux, donc $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.`, "Les points sont dans le même ordre sur les deux droites : d'après la réciproque du théorème de Thalès, $(MN) // (BC)$."],
      };
    },
    reasoning: "Même raisonnement que dans le papillon : on compare exactement deux rapports, puis on cite la réciproque.",
    hints: ["Compare les produits en croix.", "Cite la réciproque et l'ordre des points."],
  }),
  ex({
    id: "th3-18", title: "Semblables ou pas ?", niveau: 3, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T06"], time: 240,
    vary: (rng) => {
      const bs = rng.shuffle(BASES);
      const items: { txt: string; sim: boolean; sol: string }[] = [];
      for (let i = 0; i < 6; i++) {
        const [a, b, c] = bs[i % 4];
        const k = rng.pick([2, 3]);
        const sim = i < 3;
        const t2 = sim ? [a * k, b * k, c * k] : [a * k, b * k, c * k + rng.int(1, 2)];
        const sorted = [...t2].sort((x, y) => x - y);
        const s = rng.shuffle(t2);
        items.push({
          txt: `$(${a}\\,;\\,${b}\\,;\\,${c})$ et $(${s[0]}\\,;\\,${s[1]}\\,;\\,${s[2]})$`,
          sim,
          sol: `$(${a}\\,;\\,${b}\\,;\\,${c})$ et $(${sorted.join("\\,;\\,")})$ : $\\dfrac{${sorted[0]}}{${a}} = \\dfrac{${sorted[1]}}{${b}} = ${k}$ et $\\dfrac{${sorted[2]}}{${c}}$ ${sim ? `$= ${k}$ : semblables.` : `$\\neq ${k}$ : non semblables.`}`,
        });
      }
      const it = rng.shuffle(items);
      return {
        statement: "Voici les longueurs des côtés (en cm) de six paires de triangles. Classe chaque paire : triangles semblables ou non ?",
        parts: [{ interaction: { kind: "classer", categories: ["Semblables", "Pas semblables"], items: it.map((x) => x.txt), answer: it.map((x) => (x.sim ? 0 : 1)) } }],
        solution: it.map((x) => x.sol),
      };
    },
    reasoning: "On range les côtés dans l'ordre croissant et on compare les trois rapports.",
    hints: ["Les côtés ne sont pas toujours donnés dans le même ordre.", "Un seul rapport différent suffit pour que les triangles ne soient pas semblables."],
  }),
  ex({
    id: "th3-19", title: "Triangles semblables par les angles", niveau: 3, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T07"], time: 240,
    vary: (rng) => {
      for (let i = 0; i < 1000; i++) {
        const al = 5 * rng.int(6, 16), be = 5 * rng.int(6, 16), ga = 180 - al - be;
        if (ga < 25 || ga > 100) continue;
        const sim = rng.next() < 0.5;
        const trio = rng.shuffle([al, be, ga]);
        const d = trio[0], e = sim ? trio[1] : trio[1] + 10, z = 180 - d - e;
        if (z < 10) continue;
        const same = [d, e, z].sort((x, y) => x - y).join() === [al, be, ga].sort((x, y) => x - y).join();
        if (same !== sim) continue;
        return {
          statement: `Dans le triangle $ABC$, $\\widehat{A} = ${al}°$ et $\\widehat{B} = ${be}°$. Dans le triangle $DEF$, $\\widehat{D} = ${d}°$ et $\\widehat{E} = ${e}°$.`,
          parts: [
            etapes([{ prompt: "Mesure de $\\widehat{C}$", value: ga, suffix: "°" }, { prompt: "Mesure de $\\widehat{F}$", value: z, suffix: "°" }]),
            shuffledQcm(rng, ["Oui : leurs angles sont égaux deux à deux", "Non : leurs angles ne sont pas égaux deux à deux", "On ne peut pas savoir sans connaître les longueurs"], sim ? 0 : 1,
              { [sim ? 1 : 0]: sim ? "Les trois angles de $DEF$ sont ceux de $ABC$, rangés dans un autre ordre." : "Les mesures d'angles ne sont pas les mêmes : les triangles n'ont pas la même forme.", 2: "Les angles suffisent pour décider." }, "Les triangles $ABC$ et $DEF$ sont-ils semblables ?"),
          ],
          solution: [`Somme des angles d'un triangle : $\\widehat{C} = 180° - ${al}° - ${be}° = ${ga}°$ et $\\widehat{F} = 180° - ${d}° - ${e}° = ${z}°$.`, sim ? `Les angles de $ABC$ ($${al}°$, $${be}°$, $${ga}°$) et ceux de $DEF$ sont les mêmes : les triangles sont semblables.` : `Les angles de $ABC$ ($${al}°$, $${be}°$, $${ga}°$) et ceux de $DEF$ ($${d}°$, $${e}°$, $${z}°$) ne coïncident pas : les triangles ne sont pas semblables.`],
        };
      }
      return { statement: "", parts: [], solution: [] };
    },
    reasoning: "On déduit d'abord le troisième angle de chaque triangle, puis on compare les angles.",
    hints: ["La somme des angles d'un triangle vaut $180°$.", "Compare les angles sans tenir compte de l'ordre."],
  }),
  ex({
    id: "th3-20", title: "Réduire un plan", niveau: 3, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T08"], time: 240,
    vary: (rng) => {
      const [b0, b1, b2] = rng.pick([[4, 6, 8], [6, 8, 10], [8, 10, 12]] as [number, number, number][]);
      const K = rng.pick([2, 2.5, 3, 4]);
      return {
        statement: `Sur un plan, un triangle $T$ a pour côtés $${T(K * b0)}$ cm, $${T(K * b1)}$ cm et $${T(K * b2)}$ cm. On le réduit : le triangle semblable $T'$ ainsi obtenu a un plus petit côté de $${b0}$ cm. Calcule la longueur du plus grand côté de $T'$, puis son périmètre.`,
        parts: [etapes([
          { prompt: "Plus grand côté de $T'$", value: b2, suffix: "cm" },
          { prompt: "Périmètre de $T'$", value: b0 + b1 + b2, suffix: "cm" },
        ])],
        solution: [`Les plus petits côtés sont homologues : coefficient $k = \\dfrac{${b0}}{${T(K * b0)}}$.`, `Plus grand côté de $T'$ : $${T(K * b2)} \\times \\dfrac{${b0}}{${T(K * b0)}} = ${b2}$ cm.`, `Côté moyen : $${T(K * b1)} \\times \\dfrac{${b0}}{${T(K * b0)}} = ${b1}$ cm.`, `Périmètre : $${b0} + ${b1} + ${b2} = ${b0 + b1 + b2}$ cm.`],
      };
    },
    reasoning: "Le coefficient (inférieur à $1$ pour une réduction) se calcule avec deux côtés homologues ; il s'applique à tous les côtés.",
    hints: ["Quels côtés sont homologues ?", "Calcule le coefficient avant les autres longueurs."],
  }),
  // ── Niveau 4 ──
  ex({
    id: "th3-21", title: "Comparer des rapports sous forme de fractions", niveau: 4, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T04"], time: 270,
    vary: (rng) => {
      const { p, q, a, m, c, n } = ratioSet(rng);
      return {
        statement: `Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$. On sait que $AB$ mesure $${a}$ cm, $AM$ mesure $${m}$ cm, $AC$ mesure $${c}$ cm et $AN$ mesure $${n}$ cm. On veut démontrer que $(BC)$ et $(MN)$ sont parallèles.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [lb(a), lb(m), lb(c), lb(n)], title: "Configuration papillon dont on cherche à démontrer le parallélisme" }), caption: `Configuration papillon. ${NE}` },
        parts: [
          { prompt: "1. Écris $\\dfrac{AM}{AB}$ sous forme de fraction irréductible.", interaction: { kind: "numerique", answer: { value: p / q, fraction: [p, q] } } },
          { prompt: "2. Écris $\\dfrac{AN}{AC}$ sous forme de fraction irréductible.", interaction: { kind: "numerique", answer: { value: p / q, fraction: [p, q] } } },
          shuffledQcm(rng, CONCL_PAP(), 0, CONCL_DIAG, "3. Quelle conclusion est correcte ?"),
        ],
        solution: [`$\\dfrac{AM}{AB} = \\dfrac{${m}}{${a}} = \\dfrac{${p}}{${q}}$.`, `$\\dfrac{AN}{AC} = \\dfrac{${n}}{${c}} = \\dfrac{${p}}{${q}}$.`, "Les deux rapports sont égaux et les points sont dans le même ordre : d'après la réciproque du théorème de Thalès, $(BC) // (MN)$."],
      };
    },
    reasoning: "Les fractions irréductibles permettent de comparer deux rapports sans calculatrice.",
    hints: ["Cherche le plus grand diviseur commun du numérateur et du dénominateur.", "Compare les deux fractions simplifiées."],
  }),
  ex({
    id: "th3-22", title: "Démontrer que deux triangles sont semblables (papillon)", niveau: 4, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T07"], time: 240,
    statement: "Dans la configuration papillon, les droites $(BC)$ et $(MN)$ sont parallèles. On veut démontrer que les triangles $ABC$ et $AMN$ sont semblables. Remets la démonstration dans l'ordre.",
    figure: { kind: "svg", svg: papSvg({ a: 4, m: 6, c: 5, n: 7.5, par: true, title: PAP_TITLE }), caption: NE },
    parts: [{ interaction: { kind: "ordonner", items: semItems, answer: SEMB_STEPS.map((s) => semItems.indexOf(s)), hint: "Première étape en haut" } }],
    solution: [...SEMB_STEPS],
    reasoning: "Les parallèles et les sécantes donnent des angles égaux ; deux angles égaux deux à deux suffisent pour la semblance.",
    hints: ["Cherche des angles alternes-internes.", "Combien d'angles égaux faut-il pour conclure ?"],
  }),
  ex({
    id: "th3-23", title: "Justifier la semblance sur la figure", niveau: 4, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T07"], time: 180,
    vary: (rng) => {
      const a = rng.int(3, 5), c = rng.int(3, 5), r = rng.pick([1.5, 2, 2.5]);
      return {
        statement: "Sur la figure, les angles marqués du même nombre d'arcs ont la même mesure. Les triangles $ABC$ et $AMN$ sont-ils semblables ? Choisis la bonne justification.",
        figure: { kind: "svg", svg: papSvg({ a, m: a * r, c, n: c * r, marks: true, title: "Configuration papillon : les angles en B et en M ont un arc, les angles en C et en N en ont deux" }), caption: NE },
        parts: [shuffledQcm(rng, [
          "Oui : ils ont deux angles deux à deux de même mesure (en $B$ et $M$, en $C$ et $N$).",
          "Non : il faudrait que les trois angles soient marqués.",
          "Oui : parce que les deux triangles ont la même forme sur le dessin.",
          "Non : il faudrait connaître les longueurs des côtés.",
        ], 0, {
          1: "Deux angles égaux suffisent : le troisième s'en déduit par la somme des angles.",
          2: "Une impression visuelle ne prouve rien.",
          3: "La propriété caractéristique angulaire dispense des longueurs.",
        })],
        solution: ["Les angles en $B$ et en $M$ sont égaux, ceux en $C$ et en $N$ le sont aussi.", "Deux angles égaux deux à deux suffisent : $ABC$ et $AMN$ sont semblables (propriété caractéristique angulaire)."],
      };
    },
    reasoning: "La propriété angulaire n'exige que deux angles égaux deux à deux ; le troisième est alors égal aussi.",
    hints: ["Compte les angles marqués égaux deux à deux.", "Que dit la propriété caractéristique angulaire ?"],
  }),
  ex({
    id: "th3-24", title: "Largeur d'un étang", niveau: 4, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T09", "TS-T04"], time: 360,
    vary: (rng) => {
      // Coefficients {2, 3, 4} : triangles ABC et AMN constructibles (inégalité triangulaire stricte).
      const { a, m, c, n, b, mn } = ratioSet(rng, [2, 3, 4]);
      return {
        statement: `Pour trouver la largeur $BC$ d'un étang (les points $B$ et $C$ sont sur les rives), Léa choisit un point $A$ à terre. Elle place $M$ et $N$ de façon que $A$ soit entre $B$ et $M$ et entre $C$ et $N$. Elle mesure $AB = ${a}$ m, $AM = ${m}$ m, $AC = ${c}$ m, $AN = ${n}$ m et $MN = ${mn}$ m.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, lab: [lb(a), lb(m), lb(c), lb(n)], lmn: lb(mn), title: "Configuration papillon : B et C sont les rives de l'étang, MN est mesuré" }), caption: `Situation modélisée. ${NE}` },
        parts: [
          num(m * c, [], "1. Calcule $AM \\times AC$.", "m²"),
          num(n * a, [], "2. Calcule $AN \\times AB$.", "m²"),
          shuffledQcm(rng, CONCL_PAP(), 0, CONCL_DIAG, "3. Quelle conclusion est correcte ?"),
          num(b, wrongs(mn, a, m, mn + a - m), "4. Calcule la largeur $BC$ de l'étang.", "m"),
        ],
        solution: [`$AM \\times AC = ${m * c}$ et $AN \\times AB = ${n * a}$ : les produits sont égaux.`, "Les rapports $\\dfrac{AM}{AB}$ et $\\dfrac{AN}{AC}$ sont égaux et les points sont dans le même ordre : d'après la réciproque du théorème de Thalès, $(BC) // (MN)$.", `Thalès : $\\dfrac{MN}{BC} = \\dfrac{AM}{AB}$, donc $BC = \\dfrac{${mn} \\times ${a}}{${m}} = ${b}$ m.`],
      };
    },
    reasoning: "On prouve d'abord le parallélisme (réciproque), ce qui autorise ensuite le théorème de Thalès pour calculer la longueur inaccessible.",
    hints: ["Il faut d'abord démontrer le parallélisme.", "Une fois $(BC) // (MN)$ établi, utilise le rapport contenant $MN$ et $BC$."],
  }),
  ex({
    id: "th3-25", title: "La hauteur de l'arbre", niveau: 4, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T09", "TS-T07"], time: 300,
    vary: (rng) => {
      const h1 = rng.pick([1.5, 1.6, 1.8, 2]), s1 = rng.pick([1.2, 1.5, 2, 2.5]), k = rng.pick([4, 5, 6, 8]);
      const s2 = r2(s1 * k), H = r2(h1 * k);
      return {
        statement: `À la même heure, un bâton vertical de $${T(h1)}$ m projette sur le sol horizontal une ombre de $${T(s1)}$ m, et un arbre vertical projette une ombre de $${T(s2)}$ m. Les rayons du soleil sont considérés comme parallèles. On veut calculer la hauteur de l'arbre.`,
        parts: [
          shuffledQcm(rng, [
            "Les deux triangles (objet, ombre, rayon) sont rectangles et ont le même angle du côté du soleil : ils ont deux angles égaux, donc ils sont semblables.",
            "Les deux triangles sont semblables car le bâton et l'arbre ont la même hauteur.",
            "Les deux triangles sont semblables car les deux ombres ont la même longueur.",
          ], 0, { 1: "Les hauteurs sont justement différentes.", 2: "Les ombres sont de longueurs différentes." }, "1. Pourquoi les deux triangles sont-ils semblables ?"),
          num(k, [], "2. Calcule le coefficient qui permet de passer de l'ombre du bâton à celle de l'arbre."),
          num(H, [], "3. Calcule la hauteur de l'arbre.", "m"),
        ],
        solution: ["Bâton et arbre sont verticaux sur un sol horizontal : angles droits. Les rayons parallèles donnent le même angle au sommet : deux angles égaux, triangles semblables.", `$k = \\dfrac{${T(s2)}}{${T(s1)}} = ${k}$.`, `Hauteur de l'arbre : $${T(h1)} \\times ${k} = ${T(H)}$ m.`],
      };
    },
    reasoning: "Les triangles formés par l'objet, son ombre et le rayon ont deux angles égaux : ils sont semblables, donc leurs côtés sont proportionnels.",
    hints: ["Quels angles sont égaux ?", "Le coefficient se calcule avec les deux ombres."],
  }),
  ex({
    id: "th3-26", title: "Approfondissement (facultatif) — Droites non parallèles", niveau: 4, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T05"], time: 300,
    vary: (rng) => {
      const { a, m, c, n } = thalesData(rng);
      const n2 = r2(n + rng.pick([1, 2]));
      return {
        statement: `Approfondissement facultatif, hors du programme exigible. Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$. On sait que $AB$ mesure $${T(a)}$ cm, $AM$ mesure $${T(m)}$ cm, $AC$ mesure $${T(c)}$ cm et $AN$ mesure $${T(n2)}$ cm. Un élève pense que $(BC)$ et $(MN)$ sont parallèles. Qu'en penses-tu ?`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n: n2, lab: [lb(a), lb(m), lb(c), lb(n2)], title: "Configuration papillon sans parallélisme annoncé" }), caption: `Configuration papillon. ${NE}` },
        parts: [
          num(r2(m * c), [], "1. Calcule $AM \\times AC$.", "cm²"),
          num(r2(n2 * a), [], "2. Calcule $AN \\times AB$.", "cm²"),
          qcm(["Les produits sont différents, donc les rapports ne sont pas égaux : si $(BC)$ et $(MN)$ étaient parallèles, le théorème de Thalès donnerait l'égalité. Elles ne sont donc pas parallèles.", "Les produits sont différents, mais on ne peut rien dire.", "Les produits sont proches, donc les droites sont presque parallèles et on les considère parallèles."], 0, [
            { match: "1", feedback: "Si les droites étaient parallèles, le théorème de Thalès imposerait l'égalité : on peut donc conclure." },
            { match: "2", feedback: "Des rapports différents, même proches, interdisent le parallélisme." },
          ], "3. Quelle conclusion est correcte ?"),
        ],
        solution: [`$AM \\times AC = ${T(r2(m * c))}$ et $AN \\times AB = ${T(r2(n2 * a))}$ : les produits sont différents.`, "Donc $\\dfrac{AM}{AB} \\neq \\dfrac{AN}{AC}$.", "Si $(BC)$ et $(MN)$ étaient parallèles, le théorème de Thalès donnerait l'égalité des rapports. Elles ne sont donc pas parallèles."],
      };
    },
    reasoning: "Approfondissement facultatif : on raisonne par l'absurde (contraposée du théorème de Thalès) ; l'égalité aurait lieu si les droites étaient parallèles.",
    hints: ["Calcule les deux produits en croix.", "Que donnerait le théorème de Thalès si les droites étaient parallèles ?"],
  }),
  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "th3-27", title: "Type Brevet — Un portique à deux étages", niveau: 5, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T09"], time: 420,
    vary: (rng) => {
      const [x, y, z] = rng.pick(TRIPLES2);
      const [a, c] = rng.next() < 0.5 ? [x, y] : [y, x];
      const r = rng.pick([1.5, 2, 2.5, 3]);
      const m = r2(a * r), n = r2(c * r), mn = r2(z * r);
      return {
        statement: `Sur un schéma de portique, le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ cm et $AC = ${c}$ cm. Les droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles, et $AM = ${T(m)}$ cm. On veut calculer $BC$, $AN$ et $MN$.`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, right: true, lab: [lb(a), lb(m), lb(c)], par: true, title: "Configuration papillon dont l'angle en A est droit, (BC) et (MN) parallèles" }), caption: `Triangle $ABC$ rectangle en $A$. ${NE}` },
        parts: [
          shuffledQcm(rng, ["Le théorème de Pythagore dans le triangle $ABC$ rectangle en $A$", "Le théorème de Thalès", "La réciproque du théorème de Thalès"], 0, { 1: "Pour $BC$ on connaît un triangle rectangle : Pythagore donne $BC$ directement.", 2: "On n'a pas à démontrer de parallélisme, il est donné." }, "1. Quel théorème permet de calculer $BC$ ?"),
          etapes([
            { prompt: "Longueur $BC$", value: z, suffix: "cm" },
            { prompt: "Longueur $AN$", value: n, suffix: "cm" },
            { prompt: "Longueur $MN$", value: mn, suffix: "cm" },
          ]),
        ],
        solution: [`$ABC$ est rectangle en $A$ : d'après le théorème de Pythagore, $BC^2 = ${a}^2 + ${c}^2 = ${a * a + c * c}$, donc $BC = ${z}$ cm.`, `$(BC) // (MN)$ avec les points dans le même ordre : d'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$, soit $\\dfrac{${T(m)}}{${a}} = \\dfrac{AN}{${c}} = \\dfrac{MN}{${z}}$.`, `$AN = \\dfrac{${T(m)} \\times ${c}}{${a}} = ${T(n)}$ cm.`, `$MN = \\dfrac{${T(m)} \\times ${z}}{${a}} = ${T(mn)}$ cm.`],
      };
    },
    reasoning: "On calcule d'abord $BC$ avec Pythagore, puis on réinvestit cette longueur dans l'égalité de Thalès.",
    hints: ["Dans quel triangle connaît-on un angle droit ?", "Une fois $BC$ trouvé, écris les trois rapports de Thalès.", "Utilise le produit en croix pour chaque inconnue."],
  }),
  ex({
    id: "th3-28", title: "Type Brevet — Deux plans semblables", niveau: 5, objectives: ["M3-EG-04"], taxonomyTypes: ["TS-T09"], time: 420,
    vary: (rng) => {
      const [a, b, c] = rng.pick(EVEN_BASES);
      const k = rng.pick([1.5, 2, 2.5, 3]);
      return {
        statement: `Deux triangles $ABC$ et $DEF$ vérifient $\\widehat{A} = \\widehat{D}$ et $\\widehat{B} = \\widehat{E}$. On sait que $AB = ${a}$ cm, $BC = ${b}$ cm, $AC = ${c}$ cm et $DE = ${T(r2(k * a))}$ cm.`,
        parts: [
          shuffledQcm(rng, ["Les triangles sont semblables : deux angles égaux deux à deux", "Les triangles sont semblables car ils ont un côté proportionnel", "On ne peut pas savoir sans les trois côtés de $DEF$"], 0, { 1: "Un seul côté proportionnel ne prouve rien : c'est l'égalité de deux angles qui permet de conclure.", 2: "La propriété angulaire suffit." }, "1. Les triangles sont-ils semblables ? Choisis la justification."),
          shuffledQcm(rng, ["$[EF]$", "$[DF]$", "$[DE]$"], 0, { 1: "$[DF]$ est homologue de $[AC]$.", 2: "$[DE]$ est homologue de $[AB]$." }, "2. Quel côté de $DEF$ est homologue de $[BC]$ ?"),
          num(k, [], "3. Calcule le coefficient pour passer de $ABC$ à $DEF$."),
          num(r2(k * b), [], "4. Calcule $EF$.", "cm"),
          num(r2(k * (a + b + c)), [], "5. Calcule le périmètre de $DEF$.", "cm"),
        ],
        solution: ["Deux angles de $ABC$ sont égaux à deux angles de $DEF$ : d'après la propriété caractéristique angulaire, les triangles sont semblables.", "Les angles égaux ($A$ et $D$, $B$ et $E$) donnent les homologues : $[AB]$ et $[DE]$, $[BC]$ et $[EF]$.", `$k = \\dfrac{DE}{AB} = \\dfrac{${T(r2(k * a))}}{${a}} = ${T(k)}$.`, `$EF = ${T(k)} \\times ${b} = ${T(r2(k * b))}$ cm.`, `Périmètre de $DEF$ : $${T(k)} \\times (${a} + ${b} + ${c}) = ${T(r2(k * (a + b + c)))}$ cm.`],
      };
    },
    reasoning: "On justifie la semblance par les angles, on identifie les côtés homologues, puis on exploite le coefficient pour toutes les longueurs.",
    hints: ["Quelles correspondances les angles égaux imposent-ils ?", "Calcule le coefficient avec les côtés $[DE]$ et $[AB]$.", "Le périmètre est multiplié par le même coefficient."],
  }),
  ex({
    id: "th3-30", title: "Type Brevet — Le toit et sa poutre", niveau: 5, objectives: ["M3-EG-03"], taxonomyTypes: ["TS-T09"], time: 420,
    vary: (rng) => {
      const [x, y, z] = rng.pick(TRIPLES2);
      const [a, c] = rng.next() < 0.5 ? [x, y] : [y, x];
      const r = rng.pick([1.5, 2, 2.5, 3]);
      const m = r2(a * r), n = r2(c * r), aire = r2((m * n) / 2);
      return {
        statement: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ cm et $BC = ${z}$ cm. Les droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; les droites $(BC)$ et $(MN)$ sont parallèles et $AM = ${T(m)}$ cm. On veut l'aire du triangle $AMN$ (rectangle en $A$ aussi).`,
        figure: { kind: "svg", svg: papSvg({ a, m, c, n, right: true, lab: [lb(a), lb(m)], lbc: lb(z), par: true, title: "Configuration papillon dont l'angle en A est droit, (BC) et (MN) parallèles" }), caption: `Triangle $ABC$ rectangle en $A$. ${NE}` },
        parts: [etapes([
          { prompt: "Longueur $AC$", value: c, suffix: "cm" },
          { prompt: "Longueur $AN$", value: n, suffix: "cm" },
          { prompt: "Aire du triangle $AMN$", value: aire, suffix: "cm²" },
        ])],
        solution: [`$ABC$ est rectangle en $A$ : $AC^2 = BC^2 - AB^2 = ${z * z} - ${a * a} = ${c * c}$, donc $AC = ${c}$ cm.`, `Thalès, avec $(BC) // (MN)$ : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$, donc $AN = \\dfrac{${T(m)} \\times ${c}}{${a}} = ${T(n)}$ cm.`, `Les droites $(BM)$ et $(CN)$ sont perpendiculaires en $A$ : l'aire de $AMN$ vaut $\\dfrac{${T(m)} \\times ${T(n)}}{2} = ${T(aire)}$ cm².`],
      };
    },
    reasoning: "Ici l'hypoténuse est connue : Pythagore donne un côté de l'angle droit, puis Thalès donne $AN$, enfin l'aire se calcule avec les deux côtés de l'angle droit.",
    hints: ["Quel côté de $ABC$ est l'hypoténuse ?", "Utilise le même rapport de Thalès que d'habitude.", "L'aire d'un triangle rectangle est le demi-produit des côtés de l'angle droit."],
  }),
];

function k0() { return "Les côtés d'un triangle semblable s'obtiennent en multipliant chaque côté par le coefficient, à condition de multiplier des côtés homologues."; }

// ───────────────────────── Chapitre ─────────────────────────
export const math3eThalesSemblables: ChapterContent = {
  ...META,
  prerequisites: [
    { text: "Utiliser la proportionnalité et les égalités de quotients pour calculer une quatrième proportionnelle (produit en croix)." },
    { text: "Calculer avec des nombres décimaux et des fractions ; simplifier une fraction ; arrondir au dixième." },
    { text: "Connaître les droites parallèles et sécantes ; savoir que la somme des angles d'un triangle vaut $180°$ et reconnaître angles alternes-internes et angles opposés par le sommet." },
    { text: "Utiliser les notations $AB$ (longueur), $[AB]$ (segment) et $(AB)$ (droite)." },
  ],
  lesson: {
    introduction: "Comment mesurer la largeur d'un étang sans le traverser, ou la hauteur d'un arbre sans y monter ? On compare cette longueur inaccessible à des longueurs qu'on peut mesurer, grâce à des triangles qui ont la même forme.\nDans ce chapitre, tu utilises le **théorème de Thalès** et sa **réciproque** dans la configuration papillon, puis tu étudies les **triangles semblables** : leurs côtés sont proportionnels, et deux angles égaux suffisent à les reconnaître.",
    definitions: [
      { term: "Configuration papillon", text: "Deux droites $(BM)$ et $(CN)$ se coupent en $A$, avec $A$ **entre** $B$ et $M$ et **entre** $C$ et $N$. Les triangles $ABC$ et $AMN$ sont de part et d'autre de $A$ ; on s'intéresse aux droites $(BC)$ et $(MN)$." },
      { term: "Théorème de Thalès (papillon)", text: "Si $(BC)$ est parallèle à $(MN)$, alors $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$." },
      { term: "Réciproque du théorème de Thalès", text: "Si $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ et si les points $B$, $A$, $M$ d'une part, $C$, $A$, $N$ d'autre part sont alignés **dans le même ordre**, alors $(BC)$ est parallèle à $(MN)$." },
      { term: "Triangles semblables", text: "Deux triangles sont **semblables** lorsque les longueurs de leurs côtés sont proportionnelles : les côtés **homologues** (qui se correspondent) ont le même rapport $k$, appelé **coefficient**." },
      { term: "Propriété caractéristique angulaire", text: "Deux triangles dont deux angles sont égaux deux à deux (donc les trois) sont semblables. Les côtés homologues sont ceux qui sont opposés aux angles égaux." },
      { term: "Triangles emboîtés (consolidation 4e)", text: "Le point $M$ est sur $[AB]$ et $N$ sur $[AC]$. Si $(MN) // (BC)$, alors $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$. Cette configuration, vue en 4e, n'est pas exigible en 3e." },
      { term: "Contraposée (approfondissement facultatif)", text: "Si $\\dfrac{AM}{AB} \\neq \\dfrac{AN}{AC}$, alors $(BC)$ et $(MN)$ ne sont **pas** parallèles : si elles l'étaient, le théorème de Thalès donnerait l'égalité. Ce raisonnement va au-delà du programme exigible." },
    ],
    properties: [
      { title: "Calculer une longueur avec Thalès", statement: "Dans la configuration papillon avec $(BC) // (MN)$, on écrit l'égalité $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$, on remplace par les valeurs connues et on résout par produit en croix.", conditions: "Le parallélisme doit être donné ; chaque rapport compare un côté de $AMN$ à son côté correspondant de $ABC$." },
      { title: "Démontrer un parallélisme", statement: "On calcule $\\dfrac{AM}{AB}$ et $\\dfrac{AN}{AC}$ (ou les produits $AM \\times AC$ et $AN \\times AB$) ; s'ils sont égaux et si les points sont dans le même ordre, $(BC) // (MN)$.", conditions: "On compare des valeurs exactes, jamais des arrondis." },
      { title: "Triangles semblables : longueurs", statement: "Si deux triangles sont semblables de coefficient $k$, chaque côté du second est égal à $k$ fois son côté homologue du premier ; le périmètre est aussi multiplié par $k$.", conditions: "Il faut multiplier des côtés homologues." },
      { title: "Triangles semblables : angles", statement: "Si deux angles d'un triangle sont égaux à deux angles d'un autre triangle, alors les deux triangles sont semblables.", conditions: "Dans la configuration papillon avec $(BC) // (MN)$, les angles alternes-internes donnent $ABC$ et $AMN$ semblables." },
    ],
    explanations: [
      { title: "1. Lire les rapports", body: "Dans le théorème de Thalès, chaque rapport compare une longueur du triangle $AMN$ à la longueur correspondante du triangle $ABC$ (dans la configuration papillon, $AMN$ peut être plus petit ou plus grand que $ABC$) : $AM$ avec $AB$ (même droite), $AN$ avec $AC$ (même droite), $MN$ avec $BC$ (parallèles). Garde le même sens dans les trois rapports. On peut aussi échanger les « extrêmes » : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ équivaut à $\\dfrac{AM}{AN} = \\dfrac{AB}{AC}$." },
      { title: "2. Pourquoi Thalès donne des triangles semblables", body: "Quand $(BC) // (MN)$, les angles alternes-internes sont égaux et les triangles $ABC$ et $AMN$ ont donc les mêmes angles : ils sont semblables, de coefficient $\\dfrac{AM}{AB}$. Les trois rapports de l'égalité de Thalès sont les rapports entre côtés homologues." },
      { title: "3. Le produit en croix", body: "Si $\\dfrac{x}{6} = \\dfrac{4}{5}$, alors $5x = 6 \\times 4 = 24$, donc $x = 4{,}8$. Une longueur trouvée doit être positive et d'un ordre de grandeur plausible." },
      { title: "4. L'ordre des points", body: "La réciproque ne fonctionne que si les points sont dans le même ordre sur les deux droites (ici $B$, $A$, $M$ et $C$, $A$, $N$). Sans cette condition, l'égalité des rapports ne suffit pas." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Calculer deux longueurs", statement: "$(BM)$ et $(CN)$ se coupent en $A$, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; $(BC) // (MN)$, $AB = 6$ cm, $AM = 9$ cm, $AC = 8$ cm et $BC = 10$ cm. Calculer $AN$ et $MN$.", steps: ["D'après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$, soit $\\dfrac{9}{6} = \\dfrac{AN}{8} = \\dfrac{MN}{10}$.", "$AN = \\dfrac{9 \\times 8}{6} = 12$.", "$MN = \\dfrac{9 \\times 10}{6} = 15$."], answer: "$AN = 12$ cm et $MN = 15$ cm" },
      { title: "Exemple 2 — Démontrer un parallélisme", statement: "$B$, $A$, $M$ et $C$, $A$, $N$ sont alignés, avec $A$ entre $B$ et $M$ et entre $C$ et $N$ ; $AB = 4$ cm, $AM = 6$ cm, $AC = 5$ cm, $AN = 7{,}5$ cm. Les droites $(BC)$ et $(MN)$ sont-elles parallèles ?", steps: ["$AM \\times AC = 6 \\times 5 = 30$ et $AN \\times AB = 7{,}5 \\times 4 = 30$.", "Les produits sont égaux : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", "Les points sont dans le même ordre : d'après la réciproque du théorème de Thalès, $(BC) // (MN)$."], answer: "$(BC)$ et $(MN)$ sont parallèles." },
      { title: "Exemple 3 — Triangles semblables par les côtés", statement: "Un triangle a pour côtés $3$, $4$ et $5$ cm ; un autre $4{,}5$, $6$ et $7{,}5$ cm. Sont-ils semblables ? Quel est le coefficient ?", steps: ["Côtés rangés : $\\dfrac{4{,}5}{3} = 1{,}5$, $\\dfrac{6}{4} = 1{,}5$, $\\dfrac{7{,}5}{5} = 1{,}5$.", "Les trois rapports sont égaux : les triangles sont semblables."], answer: "Semblables, de coefficient $k = 1{,}5$." },
      { title: "Exemple 4 — Triangles semblables par les angles", statement: "Dans $ABC$, $\\widehat{A} = 50°$ et $\\widehat{B} = 60°$. Dans $DEF$, $\\widehat{D} = 60°$ et $\\widehat{E} = 70°$. Sont-ils semblables ?", steps: ["$\\widehat{C} = 180° - 50° - 60° = 70°$ et $\\widehat{F} = 180° - 60° - 70° = 50°$.", "Les angles de $ABC$ sont $50°$, $60°$, $70°$ ; ceux de $DEF$ sont $60°$, $70°$, $50°$ : ce sont les mêmes."], answer: "Les triangles sont semblables." },
      { title: "Exemple 5 (approfondissement facultatif) — Droites non parallèles", statement: "Avec $AB = 4$, $AM = 6$, $AC = 5$ et $AN = 8$ (cm), $(BC)$ et $(MN)$ sont-elles parallèles ?", steps: ["$AM \\times AC = 30$ et $AN \\times AB = 32$.", "Les produits sont différents : $\\dfrac{AM}{AB} \\neq \\dfrac{AN}{AC}$.", "Si les droites étaient parallèles, Thalès donnerait l'égalité."], answer: "$(BC)$ et $(MN)$ ne sont pas parallèles." },
    ],
    illustrations: [
      { svg: papSvg({ a: 6, m: 9, c: 8, n: 12, lab: ["6", "9", "8", "12"], lbc: "10", lmn: "15", par: true, title: PAP_TITLE }), alt: "Configuration papillon : deux droites sécantes en A, les droites (BC) et (MN) parallèles, avec les longueurs AB = 6, AM = 9, AC = 8, AN = 12, BC = 10 et MN = 15.", caption: "Configuration papillon (exemple 1)." },
      { svg: embSvg({ a: 8, m: 6, c: 10, n: 7.5, lab: ["6", "2", "7,5", "2,5"], par: true, title: EMB_TITLE }), alt: "Triangles emboîtés : M sur [AB], N sur [AC], (MN) parallèle à (BC).", caption: "Triangles emboîtés (consolidation 4e). Figure non à l'échelle." },
    ],
    commonMistakes: [
      { mistake: "Appliquer le théorème de Thalès sans que le parallélisme soit donné.", correction: "Utiliser la réciproque pour démontrer le parallélisme, puis seulement Thalès.", why: "Le théorème a pour hypothèse $(BC) // (MN)$." },
      { mistake: "$\\dfrac{AM}{AB} = \\dfrac{AC}{AN}$ (un rapport inversé).", correction: "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", why: "Les deux rapports doivent comparer $AMN$ à $ABC$, dans le même sens." },
      { mistake: "Conclure à un parallélisme sans vérifier l'ordre des points.", correction: "Vérifier que $A$ est entre $B$ et $M$ et entre $C$ et $N$.", why: "La réciproque exige le même ordre sur les deux droites." },
      { mistake: "Comparer des côtés non homologues dans deux triangles semblables.", correction: "Associer les côtés opposés aux angles égaux, ou ranger les côtés par ordre croissant.", why: "Seuls les côtés homologues ont le rapport $k$." },
      { mistake: "Conclure à la semblance avec seulement deux côtés proportionnels.", correction: "Vérifier les trois rapports ou deux angles égaux.", why: "Un troisième côté peut ne pas suivre." },
      { mistake: "$\\dfrac{x}{6} = \\dfrac{4}{5}$ donc $x = 6 \\times 4 - 5$.", correction: "$5x = 24$, donc $x = 4{,}8$.", why: "Dans une égalité de rapports, on utilise le produit en croix, pas une soustraction." },
    ],
    methods: [
      { title: "Calculer une longueur avec Thalès", steps: ["Repérer la configuration, le point $A$ et l'ordre des points ; vérifier que le parallélisme est donné.", "Écrire l'égalité de rapports en citant le théorème.", "Remplacer par les valeurs connues et nommer l'inconnue $x$.", "Résoudre par produit en croix, conclure avec l'unité et vérifier la cohérence."] },
      { title: "Démontrer un parallélisme", steps: ["Vérifier l'ordre des points sur les deux droites.", "Calculer les deux rapports (ou les produits en croix) avec des valeurs exactes.", "S'ils sont égaux, citer la réciproque du théorème de Thalès et conclure."] },
      { title: "Reconnaître des triangles semblables", steps: ["Par les côtés : ranger les côtés par ordre croissant et comparer les trois rapports.", "Par les angles : déduire le troisième angle de chaque triangle puis comparer les angles.", "Conclure, puis utiliser le coefficient $k$ pour calculer les longueurs cherchées."] },
    ],
    summary: [
      "Configuration papillon : $A$ est entre $B$ et $M$ et entre $C$ et $N$ ; si $(BC) // (MN)$, alors $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$.",
      "Réciproque : si $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ et si les points sont dans le même ordre, alors $(BC) // (MN)$ ; on compare des valeurs exactes.",
      "Deux triangles sont semblables si leurs côtés sont proportionnels (les trois rapports sont égaux) ; le rapport est le coefficient $k$.",
      "Deux triangles ayant deux angles égaux deux à deux sont semblables.",
      "On calcule une longueur par produit en croix ; le triangle $ABC$ d'une configuration papillon est semblable à $AMN$.",
    ],
    revisionSheet: {
      keyPoints: ["$(BC) // (MN)$ : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$.", "Réciproque : mêmes rapports + même ordre des points ⇒ parallèles.", "Triangles semblables : côtés homologues proportionnels, coefficient $k$.", "Deux angles égaux deux à deux suffisent."],
      skills: ["Reconnaître la configuration papillon et écrire l'égalité des rapports.", "Calculer une longueur avec le produit en croix.", "Démontrer un parallélisme avec la réciproque.", "Reconnaître des triangles semblables et calculer des longueurs avec $k$."],
    },
    miniQuiz: [
      { question: "Dans la configuration papillon avec $(BC) // (MN)$, quelle égalité est correcte ?", options: ["$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$", "$\\dfrac{AM}{AB} = \\dfrac{AC}{AN}$", "$\\dfrac{AM}{AN} = \\dfrac{BC}{MN}$"], answer: 0, explanation: "Chaque rapport compare un côté de $AMN$ à son correspondant dans $ABC$, dans le même sens." },
      { question: "Si $\\dfrac{x}{6} = \\dfrac{4}{5}$, alors $x$ vaut…", options: ["$4{,}8$", "$7{,}5$", "$5$", "$19$"], answer: 0, explanation: "$5x = 24$, donc $x = 4{,}8$." },
      { question: "Deux triangles de côtés $3$ ; $4$ ; $5$ et $6$ ; $8$ ; $11$ sont-ils semblables ?", options: ["Oui, car $6 = 2 \\times 3$", "Non, car $\\dfrac{11}{5} \\neq 2$", "Oui, car ils ont presque les mêmes angles"], answer: 1, explanation: "Les deux premiers rapports valent $2$ mais $11 \\neq 10$ : les trois rapports ne sont pas égaux." },
      { question: "Pour démontrer que deux droites sont parallèles avec des longueurs, on utilise…", options: ["le théorème de Thalès", "la réciproque du théorème de Thalès", "la mesure de l'angle sur la figure"], answer: 1, explanation: "Le théorème suppose déjà le parallélisme ; la réciproque le démontre à partir de rapports égaux." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "th3-jeu-flash", template: "calcul-flash", title: "Flash Thalès",
      objective: "Automatiser les quatrièmes proportionnelles, les longueurs de Thalès et les coefficients de triangles semblables.",
      instructions: "Réponds le plus vite possible. Le niveau monte après trois bonnes réponses d'affilée.",
      objectives: ["M3-EG-03", "M3-EG-04"],
      config: flashConfig([
        ["Produits en croix", [
          ["$\\dfrac{x}{2} = \\dfrac{6}{4}$ : $x =$", "3", "$4x = 12$, donc $x = 3$."],
          ["$\\dfrac{x}{5} = \\dfrac{8}{10}$ : $x =$", "4", "$10x = 40$."],
          ["$\\dfrac{x}{3} = \\dfrac{10}{6}$ : $x =$", "5", "$6x = 30$."],
          ["$\\dfrac{x}{4} = \\dfrac{9}{6}$ : $x =$", "6", "$6x = 36$."],
          ["$\\dfrac{x}{8} = \\dfrac{3}{12}$ : $x =$", "2", "$12x = 24$."],
          ["$\\dfrac{x}{9} = \\dfrac{4}{6}$ : $x =$", "6", "$6x = 36$."],
        ]],
        ["Longueurs de Thalès", [
          ["Papillon, $(BC)//(MN)$, $AB = 4$, $AM = 6$, $AC = 10$ : $AN =$", "15", "$AN = \\dfrac{10 \\times 6}{4} = 15$."],
          ["Papillon, $AB = 5$, $AM = 10$, $AC = 3$ : $AN =$", "6", "$AN = \\dfrac{3 \\times 10}{5} = 6$."],
          ["Papillon, $AB = 6$, $AM = 3$, $AC = 8$ : $AN =$", "4", "$AN = \\dfrac{8 \\times 3}{6} = 4$."],
          ["Papillon, $AB = 3$, $AM = 9$, $AN = 12$ : $AC =$", "4", "$AC = \\dfrac{12 \\times 3}{9} = 4$."],
          ["Papillon, $AB = 8$, $AM = 6$, $BC = 12$ : $MN =$", "9", "$MN = \\dfrac{12 \\times 6}{8} = 9$."],
          ["Papillon, $AB = 10$, $AM = 4$, $BC = 15$ : $MN =$", "6", "$MN = \\dfrac{15 \\times 4}{10} = 6$."],
        ]],
        ["Triangles semblables", [
          ["Coefficient de $(3\\,;\\,4\\,;\\,5)$ à $(9\\,;\\,12\\,;\\,15)$", "3", "$9 \\div 3 = 3$."],
          ["Triangle $(4\\,;\\,6\\,;\\,8)$ agrandi avec $k = 2$ : plus grand côté", "16", "$8 \\times 2 = 16$."],
          ["Triangle $(6\\,;\\,9\\,;\\,12)$ réduit avec $k = \\dfrac{1}{3}$ : plus petit côté", "2", "$6 \\div 3 = 2$."],
          ["Angles de $50°$ et $60°$ : troisième angle (en °)", "70", "$180 - 110 = 70$."],
          ["Angles de $35°$ et $85°$ : troisième angle (en °)", "60", "$180 - 120 = 60$."],
          ["Triangle $(5\\,;\\,12\\,;\\,13)$ agrandi avec $k = 4$ : plus grand côté", "52", "$13 \\times 4 = 52$."],
        ]],
      ]),
    },
    {
      id: "th3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs de Thalès",
      objective: "Repérer et nommer les erreurs typiques sur Thalès, sa réciproque et les triangles semblables.",
      instructions: "Pour chaque affirmation, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
      objectives: ["M3-EG-03", "M3-EG-04"],
      config: erreursConfig([
        [1, "Papillon avec $(BC) // (MN)$ : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", "Les rapports comparent chaque côté de $AMN$ à son correspondant dans $ABC$ : c'est juste."],
        [1, "Papillon avec $(BC) // (MN)$ : $\\dfrac{AB}{AM} = \\dfrac{AN}{AC}$.", "Les deux rapports sont à l'envers l'un par rapport à l'autre : $\\dfrac{AB}{AM} = \\dfrac{AC}{AN}$ ou $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$.", ["Un des deux rapports est inversé", "Il fallait utiliser $BC$", "Les droites ne sont pas parallèles"], 0],
        [1, "Avant d'utiliser le théorème de Thalès avec $(BC)$ et $(MN)$, on doit savoir que $(BC) // (MN)$.", "Le parallélisme est l'hypothèse du théorème : c'est juste."],
        [2, "$\\dfrac{x}{6} = \\dfrac{4}{5}$ donc $x = 6 \\times 4 - 5 = 19$.", "On fait un produit en croix : $5x = 24$, donc $x = 4{,}8$.", ["On a soustrait au lieu de faire le produit en croix", "On a oublié de diviser par $6$", "L'égalité de départ est fausse"], 0],
        [2, "$\\dfrac{x}{6} = \\dfrac{4}{5}$ donc $5x = 24$ et $x = 4{,}8$.", "Produit en croix : $5x = 6 \\times 4 = 24$ : c'est juste."],
        [2, "$AM = 4$, $AB = 5$, $AN = 3$ : $AC = \\dfrac{3 \\times 4}{5}$ (papillon, $(BC) // (MN)$).", "$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ donne $AC = \\dfrac{AN \\times AB}{AM} = \\dfrac{3 \\times 5}{4} = 3{,}75$.", ["L'inconnue est au dénominateur : le produit en croix a été mal écrit", "Il fallait additionner les longueurs", "Il fallait utiliser Pythagore"], 0],
        [3, "Les triangles de côtés $3$, $4$, $6$ et $6$, $8$, $13$ sont semblables.", "$\\dfrac{6}{3} = \\dfrac{8}{4} = 2$ mais $\\dfrac{13}{6} \\neq 2$ : les trois rapports ne sont pas égaux.", ["Seuls deux côtés sont proportionnels, pas le troisième", "Il fallait comparer les périmètres", "Les triangles sont rectangles"], 0],
        [3, "Deux triangles ayant deux angles égaux deux à deux sont semblables.", "C'est la propriété caractéristique angulaire : c'est juste."],
        [3, "Les triangles de côtés $3$, $4$, $5$ et $6$, $8$, $10$ sont semblables de coefficient $2$.", "$\\dfrac{6}{3} = \\dfrac{8}{4} = \\dfrac{10}{5} = 2$ : c'est juste."],
        [4, "$AM = 4$, $AB = 6$, $AN = 5$, $AC = 8$ : $\\dfrac{4}{6} = \\dfrac{5}{8}$ donc $(BC) // (MN)$.", "$\\dfrac{4}{6} = \\dfrac{2}{3}$ et $\\dfrac{5}{8}$ ne sont pas égaux : on ne peut pas appliquer la réciproque (produits en croix : $4 \\times 8 = 32$ et $5 \\times 6 = 30$).", ["Les deux rapports sont en fait différents", "Il fallait utiliser le théorème et non la réciproque", "Il fallait comparer $AM$ et $AN$"], 0],
        [4, "Sur le dessin, $(BC)$ et $(MN)$ ont l'air parallèles, donc $(BC) // (MN)$.", "Une impression visuelle ne prouve rien : seul le calcul exact des rapports démontre.", ["Une mesure ou un aspect sur la figure n'est pas une preuve", "Il fallait utiliser Pythagore", "Il fallait mesurer avec une règle plus précise"], 0],
      ]),
    },
    {
      id: "th3-jeu-memory", template: "memory", title: "Memory des rapports",
      objective: "Associer une égalité de rapports à sa solution et une notion à sa caractérisation.",
      instructions: "Retourne deux cartes : si elles correspondent, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-EG-03", "M3-EG-04"],
      config: { pairs: [
        ["Triangles semblables", "côtés homologues proportionnels"],
        ["Propriété angulaire", "deux angles égaux deux à deux"],
        ["$\\dfrac{x}{6} = \\dfrac{4}{5}$", "$x = 4{,}8$"],
        ["$\\dfrac{x}{4} = \\dfrac{9}{6}$", "$x = 6$"],
        ["$\\dfrac{x}{5} = \\dfrac{6}{4}$", "$x = 7{,}5$"],
        ["Réciproque de Thalès", "rapports égaux et même ordre ⇒ droites parallèles"],
      ] },
    },
  ],
};
