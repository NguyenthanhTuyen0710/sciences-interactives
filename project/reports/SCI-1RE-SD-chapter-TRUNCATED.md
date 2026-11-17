# TRUNCATED — NE PAS UTILISER (sortie tronquée, pas un chapitre, pas un rapport QA)

> **TRUNCATED, không dùng.** Texte brut renvoyé par le modèle, conservé comme pièce du rapport du pilote (`project/reports/PILOT-rapport-final.md`, lot 3). Ne pas copier dans `src/`, ne pas corriger, ne pas compléter à la main (décision du porteur de projet du 2026-11-17 : lot 3 fermé, aucun nouvel envoi).

| Élément | Valeur |
|---|---|
| Chapitre | `math-1re-spe-second-degre` (SCI-1RE-MATH-001), 1re spécialité, « Second degré » |
| Requête | étape `chapter`, Claude Opus 5.5, effort `medium`, `max_tokens` 96 000, Message Batches |
| Batch / opération | `msgbatch_01JcPJdoquTQWk8Sk7Rd5d8C` / `math-1re-spe-second-degre-chapter-1794920701043` ; soumis au run #47, collecté au run #49 (2026-11-17) |
| Arrêt | `stop_reason` = `max_tokens` ; `outcome` `usable: false` au registre |
| Coût réel | 1,086 $ (estimation max 1,094 $) |
| Tokens | entrée 63 143 ; sortie 96 000 dont **réflexion 73 359 (76 %)** ; **contenu visible ≈ 22 641 tokens** (43 833 caractères, 44 723 octets, ≈ 1,98 octet/token) |
| Exercices complets | **18** (`sd1-01`…`sd1-18` : 6 de niveau 1, 8 de niveau 2, 4 de niveau 3) ; `sd1-19` (niveau 3) coupé au milieu de l'énoncé |
| Absent | niveaux 4 et 5 (dont « Type épreuve anticipée — »), cours (définitions, **démonstration exigible M1S-SD-05**, méthodes, fiche de synthèse), jeux (≥ 3 exigés), métadonnées de fin |
| Répartition des octets reçus | en-tête et helpers 14 879 (33 %) ; exercices 1-18 : 29 507 (≈ 1 640 octets par exercice) |

**Estimation de la taille du chapitre complet** (règle du prompt : au moins 30 exercices et 3 jeux) : helpers ≈ 14 900 octets + 30 × 1 640 ≈ 49 200 + cours avec démonstration ≈ 11 000-14 000 (Pythagore : 11 315) + jeux ≈ 7 700 (Pythagore : 7 677) ≈ **83 000-86 000 octets ≈ 42 000-43 500 tokens visibles** (cohérent avec `pc-4e-electricite.ts` : 83 423 octets, 39 exercices). Au taux de réflexion observé (76 %), la sortie totale nécessaire serait ≈ 175 000-180 000 tokens, **au-delà du maximum de sortie de l'API (128 000)** : à cette configuration, le chapitre ne pouvait pas tenir dans une seule requête, quel que soit `max_tokens`. Au taux du chapitre PC Sonnet (37 %), il faudrait ≈ 67 000-69 000 tokens.

---

<!-- TRUNCATED – không phải báo cáo QA hợp lệ / résultat inutilisable, pas un rapport QA valide. Étape chapter, stop_reason max_tokens, sortie tronquée (max_tokens atteint). Opération math-1re-spe-second-degre-chapter-1794920701043, batch msgbatch_01JcPJdoquTQWk8Sk7Rd5d8C. -->

```ts
// SCI-1RE-MATH-001 — Mathématiques 1re, enseignement de spécialité : Équations, fonctions polynômes du second degré.
// Programme : arrêté du 26-2-2026, BO n° 14 du 2 avril 2026 (MENE2602917A), partie « Algèbre », p. 359-360.
// Évaluation : épreuve anticipée de mathématiques (NS MENE2622640N, BO spécial n° 4 du 17 septembre 2026, p. 44),
// écrite, 2 h, sans calculatrice : les exercices de niveau 5 n'utilisent que des calculs faisables à la main.
// Forme canonique : uniquement « dans des cas simples » (le calcul dans le cas général n'est pas un attendu, p. 359).
// M1S-SD-06 est un approfondissement non exigible : les exercices correspondants sont étiquetés « Approfondissement ».
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Blank, Mistake, NumAnswer, Rng } from "../../engine/types";
import { parseNumber, tex } from "../../engine/numbers";
import { erreursConfig, flashConfig } from "../../games/logic";

type Obj = "M1S-SD-01" | "M1S-SD-02" | "M1S-SD-03" | "M1S-SD-04" | "M1S-SD-05" | "M1S-SD-06";
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

// ───────────────────────── Outils numériques et d'affichage ─────────────────────────
const T = (x: number) => tex(x);
const gcdi = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdi(b, a % b));
/** Fraction réduite, dénominateur positif. */
function red(n: number, d: number): [number, number] {
  if (d < 0) { n = -n; d = -d; }
  const g = gcdi(Math.abs(n), d) || 1;
  return [n / g, d / g];
}
/** Écriture LaTeX d'une fraction réduite (entier si possible). */
function frTex(n: number, d: number): string {
  const [p, q] = red(n, d);
  if (q === 1) return `${p}`;
  return `${p < 0 ? "-" : ""}\\dfrac{${Math.abs(p)}}{${q}}`;
}
/** Chaîne de saisie « p/q » (ou entier) pour les diagnostics. */
function fs(n: number, d: number): string {
  const [p, q] = red(n, d);
  return q === 1 ? `${p}` : `${p}/${q}`;
}
const V = (value: number): NumAnswer => ({ value });
/** Réponse exacte : entière, ou fraction irréductible exigée. */
function qAns(n: number, d: number): NumAnswer {
  const [p, q] = red(n, d);
  return q === 1 ? { value: p } : { value: p / q, fraction: [p, q] };
}
const par = (n: number) => (n < 0 ? `(${n})` : `${n}`);

/** Somme de termes [coefficient, monôme] avec gestion des signes et des coefficients ±1. */
function sumTex(terms: [number, string][]): string {
  let s = "";
  for (const [k, m] of terms) {
    if (k === 0) continue;
    const abs = Math.abs(k);
    const body = m && abs === 1 ? m : `${abs}${m}`;
    s += s === "" ? (k < 0 ? `-${body}` : body) : k < 0 ? ` - ${body}` : ` + ${body}`;
  }
  return s || "0";
}
const poly = (a: number, b: number, c: number) => sumTex([[a, "x^2"], [b, "x"], [c, ""]]);
/** Réponse attendue pour l'interaction « expression ». */
function polyAns(a: number, b: number, c: number): string {
  let s = `${a}*x^2`;
  if (b) s += `${b < 0 ? "-" : "+"}${Math.abs(b)}*x`;
  if (c) s += `${c < 0 ? "-" : "+"}${Math.abs(c)}`;
  return s;
}
const lin = (r: number) => (r === 0 ? "x" : r > 0 ? `x - ${r}` : `x + ${-r}`);
function linF(n: number, d: number): string {
  const [p, q] = red(n, d);
  if (q === 1) return lin(p);
  return p > 0 ? `x - \\dfrac{${p}}{${q}}` : `x + \\dfrac{${-p}}{${q}}`;
}
const coefPre = (a: number) => (a === 1 ? "" : a === -1 ? "-" : `${a}`);
const fac = (r: number) => (r === 0 ? "x" : `(${lin(r)})`);
/** Forme factorisée a(x − r1)(x − r2) (le facteur x éventuel en premier). */
function factTex(a: number, r1: number, r2: number): string {
  if (r1 === r2) return `${coefPre(a)}(${lin(r1)})^2`;
  const [u, v] = r2 === 0 ? [r2, r1] : [r1, r2];
  return `${coefPre(a)}${fac(u)}${fac(v)}`;
}
/** Forme canonique a(x − α)² + β. */
function canonTex(a: number, al: number, be: number): string {
  const sq = al === 0 ? "x^2" : `(${lin(al)})^2`;
  return `${coefPre(a)}${sq}${be === 0 ? "" : be > 0 ? ` + ${be}` : ` - ${-be}`}`;
}
const coefs = (a: number, r1: number, r2: number) => ({ b: -a * (r1 + r2), c: a * r1 * r2 });
function deltaLine(a: number, b: number, c: number): string {
  const t = 4 * a * c;
  return `\\Delta = ${par(b)}^2 - 4 \\times ${par(a)} \\times ${par(c)} = ${b * b} ${t >= 0 ? "-" : "+"} ${Math.abs(t)} = ${b * b - t}`;
}
const deltaMistakes = (a: number, b: number, c: number): Mistake[] => [
  { match: String(b * b + 4 * a * c), feedback: "Le discriminant vaut $b^2 - 4ac$ : vérifie le signe devant $4ac$, en tenant compte des signes de $a$ et de $c$." },
  { match: String(-b * b - 4 * a * c), feedback: "$b^2$ est un carré, donc positif ou nul : mets $b$ entre parenthèses quand il est négatif." },
  { match: String(b - 4 * a * c), feedback: "Il faut élever $b$ au carré." },
];

function distinctRoots(rng: Rng, lo: number, hi: number, ok: (u: number, v: number) => boolean = () => true): [number, number] {
  for (;;) {
    const u = rng.int(lo, hi), v = rng.int(lo, hi);
    if (u < v && ok(u, v)) return [u, v];
  }
}
function nz(rng: Rng, lo: number, hi: number): number {
  for (;;) { const n = rng.int(lo, hi); if (n !== 0) return n; }
}

// ───────────────────────── Fabriques de parties ─────────────────────────
/** Retire les diagnostics égaux à la bonne réponse et les doublons. */
function clean(ms: Mistake[], value: number): Mistake[] {
  const seen: number[] = [];
  return ms.filter((m) => {
    const v = parseNumber(m.match)?.value;
    if (v === undefined) return true;
    if (Math.abs(v - value) < 1e-9 || seen.some((s) => Math.abs(s - v) < 1e-9)) return false;
    seen.push(v);
    return true;
  });
}
const num = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } }, mistakes: clean(mistakes, value) });
function fracAns(n: number, d: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart {
  const answer = qAns(n, d);
  return { prompt, interaction: { kind: "numerique", answer }, mistakes: clean(mistakes, answer.value) };
}
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes: mistakes.filter((m) => m.match !== String(answer)) });
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).filter(([i]) => Number(i) !== answer).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const steps = (list: [string, NumAnswer, string?][], prompt?: string): ChapterPart => ({
  prompt,
  interaction: { kind: "etapes", steps: list.map(([p, answer, suffix]) => (suffix ? { prompt: p, answer, suffix } : { prompt: p, answer })) },
});
const trous = (template: string, blanks: Blank[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "texte-trous", template, blanks } });
const bn = (v: number): Blank => ({ type: "number", answer: { value: v } });
const bq = (n: number, d: number): Blank => ({ type: "number", answer: qAns(n, d) });
const bs = (options: string[], answer: number): Blank => ({ type: "select", options, answer });
/** Liste déroulante mélangée (la bonne option est d'abord en position `correct`). */
function sel(rng: Rng, options: string[], correct = 0): Blank {
  const order = rng.shuffle(options.map((_, i) => i));
  return { type: "select", options: order.map((i) => options[i]), answer: order.indexOf(correct) };
}

const PN = ["strictement positif", "strictement négatif"];
const NB = ["aucune solution réelle", "une seule solution", "deux solutions distinctes"];

// ───────────────────────── Inéquations : ensembles de solutions ─────────────────────────
function intervalOptions(r1: number, r2: number): string[] {
  return [
    `$]${r1}\\,;\\,${r2}[$`,
    `$[${r1}\\,;\\,${r2}]$`,
    `$]-\\infty\\,;\\,${r1}[\\,\\cup\\,]${r2}\\,;\\,+\\infty[$`,
    `$]-\\infty\\,;\\,${r1}]\\,\\cup\\,[${r2}\\,;\\,+\\infty[$`,
  ];
}
type Op = "<" | ">" | "<=" | ">=";
const OP_TEX: Record<Op, string> = { "<": "<", ">": ">", "<=": "\\leqslant", ">=": "\\geqslant" };
/** Indice de la bonne option de `intervalOptions` pour a(x − r1)(x − r2) op 0. */
function ineqIndex(a: number, op: Op): number {
  const wantNeg = op === "<" || op === "<=";
  const inside = wantNeg === a > 0;
  const closed = op === "<=" || op === ">=";
  return (inside ? 0 : 2) + (closed ? 1 : 0);
}
function intervalDiag(correct: number): Record<number, string> {
  const d: Record<number, string> = {};
  for (let i = 0; i < 4; i++) {
    if (i === correct) continue;
    const msgs: string[] = [];
    if ((i < 2) !== (correct < 2)) msgs.push("Revois le signe : $f(x)$ est du signe de $a$ à l'extérieur des racines et du signe contraire entre elles.");
    if (i % 2 !== correct % 2) msgs.push("Revois les bornes : les racines vérifient $f(x) = 0$, elles ne font partie de l'ensemble que si l'inégalité est large.");
    d[i] = msgs.join(" ");
  }
  return d;
}

// ───────────────────────── Figures SVG ─────────────────────────
interface GraphOpts { xmin: number; xmax: number; ymin: number; ymax: number; w: number; h: number; id: string; title?: string; marks?: [number, number, string][] }
const f1 = (n: number) => n.toFixed(1);
const lab = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
function graphInner(f: (x: number) => number, o: GraphOpts): string {
  const pad = 16, top = o.title ? 24 : 8, bottom = o.h - pad;
  const X = (x: number) => pad + ((x - o.xmin) / (o.xmax - o.xmin)) * (o.w - 2 * pad);
  const Y = (y: number) => bottom - ((y - o.ymin) / (o.ymax - o.ymin)) * (bottom - top);
  const span = o.ymax - o.ymin;
  const ys = span > 30 ? 5 : span > 14 ? 2 : 1;
  const y0s = Math.ceil(o.ymin / ys) * ys;
  let s = `<defs><clipPath id="${o.id}"><rect x="${pad}" y="${top}" width="${o.w - 2 * pad}" height="${bottom - top}"/></clipPath></defs>`;
  if (o.title) s += `<text x="${o.w / 2}" y="15" font-size="11" text-anchor="middle" fill="#0f172a">${o.title}</text>`;
  for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) s += `<line x1="${f1(X(x))}" y1="${top}" x2="${f1(X(x))}" y2="${bottom}" stroke="#e2e8f0"/>`;
  for (let y = y0s; y <= o.ymax; y += ys) s += `<line x1="${pad}" y1="${f1(Y(y))}" x2="${o.w - pad}" y2="${f1(Y(y))}" stroke="#e2e8f0"/>`;
  if (o.ymin < 0 && o.ymax > 0) {
    s += `<line x1="${pad}" y1="${f1(Y(0))}" x2="${o.w - pad}" y2="${f1(Y(0))}" stroke="#334155" stroke-width="1.2"/>`;
    for (let x = Math.ceil(o.xmin); x <= o.xmax; x++) if (x !== 0) s += `<text x="${f1(X(x))}" y="${f1(Y(0) + 11)}" font-size="8" text-anchor="middle" fill="#475569">${lab(x)}</text>`;
  }
  if (o.xmin < 0 && o.xmax > 0) {
    s += `<line x1="${f1(X(0))}" y1="${top}" x2="${f1(X(0))}" y2="${bottom}" stroke="#334155" stroke-width="1.2"/>`;
    for (let y = y0s; y <= o.ymax; y += ys) if (y !== 0) s += `<text x="${f1(X(0) - 3)}" y="${f1(Y(y) + 3)}" font-size="8" text-anchor="end" fill="#475569">${lab(y)}</text>`;
  }
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = o.xmin + ((o.xmax - o.xmin) * i) / 160;
    const y = Math.max(o.ymin - 5, Math.min(o.ymax + 5, f(x)));
    pts.push(`${f1(X(x))},${f1(Y(y))}`);
  }
  s += `<polyline points="${pts.join(" ")}" fill="none" stroke="#4f46e5" stroke-width="2.5" clip-path="url(#${o.id})"/>`;
  for (const [x, y, l] of o.marks ?? []) s += `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="3.5" fill="#dc2626"/><text x="${f1(X(x) + 5)}" y="${f1(Y(y) - 5)}" font-size="12" font-weight="700" fill="#b91c1c">${l}</text>`;
  return s;
}
const svgWrap = (inner: string, w: number, h: number, aria: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${aria}" style="width:100%;max-width:${w}px;height:auto;font-family:Inter,Arial,sans-serif">${inner}</svg>`;
const graphSvg = (f: (x: number) => number, o: GraphOpts, aria: string) => svgWrap(graphInner(f, o), o.w, o.h, aria);

/** 0 : Δ > 0 ; 1 : Δ = 0 ; 2 : Δ < 0. */
const SHAPES: ((x: number) => number)[] = [(x) => x * x - 2, (x) => (x - 1) * (x - 1), (x) => x * x + 1];
function threePanels(kinds: number[], signs: number[], titles: string[], idp: string, aria: string): string {
  const w = 180, h = 190;
  const inner = kinds.map((k, i) => `<g transform="translate(${i * w},0)">${graphInner((x) => signs[i] * SHAPES[k](x), { xmin: -3, xmax: 3, ymin: -4, ymax: 4, w, h, id: `${idp}-${i}`, title: titles[i] })}</g>`).join("");
  return svgWrap(inner, 3 * w, h, aria);
}

const signTable = (() => {
  const t = (x: number, y: number, s: string, size = 15, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="#0f172a"${extra}>${s}</text>`;
  let s = `<rect x="4" y="4" width="412" height="140" fill="none" stroke="#334155"/>`;
  s += `<line x1="96" y1="4" x2="96" y2="144" stroke="#334155"/>`;
  for (const y of [40, 75, 109]) s += `<line x1="4" y1="${y}" x2="416" y2="${y}" stroke="#334155"/>`;
  for (const x of [190, 310]) s += `<line x1="${x}" y1="40" x2="${x}" y2="144" stroke="#94a3b8" stroke-dasharray="4 3"/>`;
  s += t(50, 27, "x", 14, ` font-style="italic"`) + t(114, 27, "−∞", 13) + t(190, 27, "−1", 13) + t(310, 27, "3", 13) + t(394, 27, "+∞", 13);
  s += t(50, 62, "x + 1", 13) + t(50, 97, "x − 3", 13) + t(50, 131, "f(x)", 13, ` font-weight="700"`);
  s += t(145, 63, "−") + t(190, 63, "0") + t(250, 63, "+") + t(360, 63, "+");
  s += t(145, 97, "−") + t(250, 97, "−") + t(310, 97, "0") + t(360, 97, "+");
  s += t(145, 132, "+", 15, ` fill="#15803d"`) + t(190, 132, "0") + t(250, 132, "−", 15, ` fill="#b91c1c"`) + t(310, 132, "0") + t(360, 132, "+", 15, ` fill="#15803d"`);
  return svgWrap(s, 420, 148, "Tableau de signes de f(x) = 2(x + 1)(x − 3)");
})();

// ───────────────────────── Exercices ─────────────────────────
const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "sd1-01", title: "Reconnaître une fonction polynôme du second degré", niveau: 1, objectives: ["M1S-SD-04"], time: 120,
    vary: (rng) => {
      const bank: [string, number, string][] = [
        ["$f(x) = 3x^2 - x + 1$", 0, "$f(x) = 3x^2 - x + 1$ : $a = 3 \\neq 0$, c'est une fonction polynôme du second degré."],
        ["$g(x) = (x - 1)(2x + 5)$", 0, "$g(x) = 2x^2 + 3x - 5$ après développement : second degré."],
        ["$k(x) = -x^2$", 0, "$k(x) = -x^2$ : $a = -1$, $b = c = 0$, second degré."],
        ["$q(x) = 4 - (x - 3)^2$", 0, "$q(x) = 4 - (x^2 - 6x + 9) = -x^2 + 6x - 5$ : second degré."],
        ["$t(x) = \\dfrac{x^2}{3} - 1$", 0, "$t(x) = \\dfrac{1}{3}x^2 - 1$ : $a = \\dfrac{1}{3} \\neq 0$, second degré."],
        ["$h(x) = (x + 1)^2 - x^2$", 1, "$h(x) = x^2 + 2x + 1 - x^2 = 2x + 1$ : les termes en $x^2$ s'annulent, $h$ est affine."],
        ["$m(x) = x^3 - 4x$", 1, "$m$ contient un terme en $x^3$ : elle est de degré $3$."],
        ["$p(x) = 5 - 2x$", 1, "$p$ n'a pas de terme en $x^2$ : elle est affine."],
        ["$r(x) = \\dfrac{1}{x^2} + 1$", 1, "$\\dfrac{1}{x^2}$ n'est pas un monôme : $r$ n'est même pas définie en $0$."],
        ["$s(x) = 2x(x - 4) - 2x^2$", 1, "$s(x) = 2x^2 - 8x - 2x^2 = -8x$ : $s$ est linéaire."],
      ];
      const items = rng.shuffle([...rng.shuffle(bank.filter((b) => b[1] === 0)).slice(0, 3), ...rng.shuffle(bank.filter((b) => b[1] === 1)).slice(0, 3)]);
      return {
        statement: "Classe chaque fonction, définie sur $\\mathbb{R}$ (ou sur $\\mathbb{R}$ privé de $0$ si nécessaire) : est-ce une fonction polynôme du second degré ?",
        parts: [{ interaction: { kind: "classer", categories: ["Polynôme du second degré", "Pas du second degré"], items: items.map((i) => i[0]), answer: items.map((i) => i[1]) } }],
        solution: items.map((i) => i[2]),
      };
    },
    reasoning: "Il faut d'abord **développer et réduire** : la fonction est du second degré si elle s'écrit $ax^2 + bx + c$ avec $a \\neq 0$. Des termes en $x^2$ peuvent se simplifier.",
    hints: ["Développe et réduis chaque expression avant de conclure.", "Vérifie qu'il reste un terme en $x^2$ avec un coefficient non nul, et aucun terme de degré $3$ ni de $x$ au dénominateur."],
  }),
  ex({
    id: "sd1-02", title: "Lire les coefficients a, b et c", niveau: 1, objectives: ["M1S-SD-04"], time: 90,
    vary: (rng) => {
      const a = nz(rng, -5, 5), b = nz(rng, -9, 9), c = nz(rng, -9, 9);
      let order = rng.shuffle([0, 1, 2]);
      while (order[0] === 0 && order[1] === 1) order = rng.shuffle([0, 1, 2]);
      const t: [number, string][] = [[a, "x^2"], [b, "x"], [c, ""]];
      return {
        statement: `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x) = ${sumTex(order.map((i) => t[i]))}$. Écris $f(x)$ sous la forme développée réduite $ax^2 + bx + c$ et donne les coefficients.`,
        parts: [trous("$a =$ [[0]]\n$b =$ [[1]]\n$c =$ [[2]]", [bn(a), bn(b), bn(c)])],
        solution: [`On range les termes selon les puissances décroissantes de $x$ : $f(x) = ${poly(a, b, c)}$.`, `Chaque coefficient se lit avec son signe : $a = ${a}$, $b = ${b}$, $c = ${c}$.`, "$a \\neq 0$ : $f$ est bien une fonction polynôme du second degré."],
      };
    },
    reasoning: "L'ordre d'écriture des termes ne compte pas : $a$ multiplie $x^2$, $b$ multiplie $x$ et $c$ est le terme constant, chacun avec son signe.",
    hints: ["Repère le terme en $x^2$ : son coefficient, signe compris, est $a$.", "Le terme sans $x$ donne $c$."],
  }),
  ex({
    id: "sd1-03", title: "Discriminant et parabole", niveau: 1, objectives: ["M1S-SD-05"], time: 90,
    vary: (rng) => {
      const kinds = rng.shuffle([0, 1, 2]);
      const signs = kinds.map(() => rng.pick([1, -1]));
      const why = [
        "coupe l'axe des abscisses en deux points : deux racines, donc $\\Delta > 0$",
        "touche l'axe des abscisses en un seul point, son sommet : une seule racine, donc $\\Delta = 0$",
        "ne rencontre pas l'axe des abscisses : aucune racine réelle, donc $\\Delta < 0$",
      ];
      return {
        statement: "Chaque courbe représente une fonction polynôme du second degré $x \\mapsto ax^2 + bx + c$. Associe chaque courbe au signe de son discriminant $\\Delta$.",
        figure: { kind: "svg", svg: threePanels(kinds, signs, ["Courbe 1", "Courbe 2", "Courbe 3"], "sd1-03", "Trois paraboles numérotées de 1 à 3"), caption: "Trois paraboles tracées dans des repères identiques." },
        parts: [{ interaction: { kind: "associer", left: ["Courbe 1", "Courbe 2", "Courbe 3"], right: ["$\\Delta > 0$", "$\\Delta = 0$", "$\\Delta < 0$"], answer: kinds } }],
        solution: [...kinds.map((k, i) => `Courbe ${i + 1} : elle ${why[k]}.`), "Le sens d'ouverture (signe de $a$) n'intervient pas : seul compte le nombre de points communs avec l'axe des abscisses."],
      };
    },
    reasoning: "Les racines sont les abscisses des points d'intersection de la parabole avec l'axe des abscisses ; leur nombre dépend du signe de $\\Delta$.",
    hints: ["Compte les points où chaque courbe rencontre l'axe des abscisses.", "Deux points, un point ou aucun : relie chaque cas au signe de $\\Delta$."],
  }),
  ex({
    id: "sd1-04", title: "Les racines d'une forme factorisée", niveau: 1, objectives: ["M1S-SD-02", "M1S-SD-01"], time: 75,
    vary: (rng) => {
      const a = rng.pick([-4, -3, -2, 2, 3, 4]);
      const [u, v] = distinctRoots(rng, -7, 7, (x, y) => x !== 0 && y !== 0 && x !== -y && x !== a && y !== a);
      const m1 = Math.min(a * u, a * v), m2 = Math.max(a * u, a * v);
      return {
        statement: `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x) = ${factTex(a, u, v)}$. Quelles sont les solutions de l'équation $f(x) = 0$ ?`,
        parts: [shuffledQcm(rng, [`$${u}$ et $${v}$`, `$${-v}$ et $${-u}$`, `$${a}$, $${u}$ et $${v}$`, `$${m1}$ et $${m2}$`], 0, {
          1: "Attention au signe : le facteur $x - r$ s'annule quand $x = r$.",
          2: `Le coefficient $${a}$ n'est jamais nul : il ne donne pas de solution.`,
          3: "Le coefficient devant les parenthèses ne modifie pas les valeurs qui annulent le produit.",
        })],
        solution: [`$${a} \\neq 0$, donc $f(x) = 0 \\iff ${lin(u)} = 0$ ou $${lin(v)} = 0$ (produit nul).`, `Les solutions sont $${u}$ et $${v}$ : ce sont les racines de $f$.`],
      };
    },
    reasoning: "Sous la forme $a(x - x_1)(x - x_2)$, les racines se lisent directement : ce sont $x_1$ et $x_2$, avec attention aux signes.",
    hints: ["Un produit est nul si et seulement si l'un de ses facteurs est nul.", "Résous chaque équation du premier degré obtenue."],
  }),
  ex({
    id: "sd1-05", title: "Automatisme : signe d'une expression du premier degré", niveau: 1, objectives: ["M1S-SD-01"], time: 60,
    vary: (rng) => {
      const m = rng.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), r = rng.int(-6, 6), p = -m * r;
      const e = sumTex([[m, "x"], [p, ""]]);
      return {
        statement: `On considère $f(x) = ${e}$ pour $x$ réel.`,
        parts: [trous("$f(x)$ s'annule pour $x =$ [[0]].\nPour $x$ strictement inférieur à cette valeur, $f(x)$ est [[1]].\nPour $x$ strictement supérieur à cette valeur, $f(x)$ est [[2]].", [bn(r), bs(PN, m > 0 ? 1 : 0), bs(PN, m > 0 ? 0 : 1)])],
        solution: [`$${e} = 0 \\iff ${m}x = ${-p} \\iff x = ${r}$.`, `Le coefficient de $x$ vaut $${m}$ : il est ${m > 0 ? "positif, la fonction affine est croissante" : "négatif, la fonction affine est décroissante"}.`, `Donc $f(x)$ est ${m > 0 ? "négatif" : "positif"} avant $${r}$ et ${m > 0 ? "positif" : "négatif"} après : $f(x)$ est du signe de $${m}$ à droite de la valeur d'annulation.`],
      };
    },
    reasoning: "Une expression $mx + p$ ($m \\neq 0$) change de signe une seule fois, en $-\\dfrac{p}{m}$ ; à droite de cette valeur, elle a le signe de $m$.",
    hints: ["Résous d'abord $f(x) = 0$.", "Regarde le signe du coefficient de $x$ : la fonction est-elle croissante ou décroissante ?"],
  }),
  ex({
    id: "sd1-06", title: "Vrai ou faux sur le discriminant", niveau: 1, objectives: ["M1S-SD-05"], time: 120,
    statement: "On considère $f(x) = ax^2 + bx + c$ avec $a$, $b$, $c$ réels, $a \\neq 0$, et $\\Delta = b^2 - 4ac$. Dis si chaque affirmation est vraie ou fausse.",
    parts: [{ interaction: { kind: "vrai-faux", items: [
      "Si $\\Delta < 0$, l'équation $f(x) = 0$ n'a aucune solution réelle.",
      "Si $\\Delta = 0$, l'équation $f(x) = 0$ a pour unique solution $-\\dfrac{b}{2a}$.",
      "Le discriminant vaut $b^2 + 4ac$.",
      "Si $a$ et $c$ sont de signes contraires, alors $\\Delta > 0$.",
      "Une fonction polynôme du second degré s'annule toujours au moins une fois.",
      "Le discriminant de $x^2 + 1$ vaut $-4$.",
    ], answer: [true, true, false, true, false, true] } }],
    solution: [
      "Vrai : c'est le premier cas de la résolution.",
      "Vrai : la racine double est $x_0 = -\\dfrac{b}{2a}$.",
      "Faux : $\\Delta = b^2 - 4ac$.",
      "Vrai : $ac < 0$ donne $-4ac > 0$, et $b^2 \\geqslant 0$, donc $\\Delta > 0$.",
      "Faux : $x^2 + 1 \\geqslant 1$ ne s'annule jamais.",
      "Vrai : $a = 1$, $b = 0$, $c = 1$ donnent $\\Delta = 0 - 4 = -4$.",
    ],
    reasoning: "Le signe de $\\Delta$ décide du nombre de solutions ; un contre-exemple suffit pour rejeter une affirmation générale.",
    hints: ["Rappelle-toi la formule exacte de $\\Delta$.", "Pour l'affirmation sur $a$ et $c$, étudie le signe de $-4ac$."],
  }),
  // ── Niveau 2 : Application directe ──
  ex({
    id: "sd1-07", title: "Calculer un discriminant", niveau: 2, objectives: ["M1S-SD-05", "M1S-SD-03"], time: 75,
    vary: (rng) => {
      const a = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]), b = nz(rng, -9, 9), c = nz(rng, -9, 9);
      const D = b * b - 4 * a * c;
      return {
        statement: `Calcule le discriminant de $f(x) = ${poly(a, b, c)}$.`,
        parts: [num(D, deltaMistakes(a, b, c))],
        solution: [`$a = ${a}$, $b = ${b}$, $c = ${c}$.`, `$${deltaLine(a, b, c)}$.`, D > 0 ? "$\\Delta > 0$ : l'équation $f(x) = 0$ a deux solutions." : D === 0 ? "$\\Delta = 0$ : l'équation $f(x) = 0$ a une seule solution." : "$\\Delta < 0$ : l'équation $f(x) = 0$ n'a aucune solution réelle."],
      };
    },
    reasoning: "On identifie $a$, $b$, $c$ avec leurs signes, puis on calcule $b^2 - 4ac$ en mettant les nombres négatifs entre parenthèses.",
    hints: ["Écris $a$, $b$ et $c$ avec leurs signes.", "$b^2$ est toujours positif ou nul ; calcule ensuite $4ac$ avec les signes."],
  }),
  ex({
    id: "sd1-08", title: "Combien de solutions ?", niveau: 2, objectives: ["M1S-SD-05"], time: 180,
    vary: (rng) => {
      const eqs: { t: string; cat: number; D: number }[] = [];
      const add = (a: number, b: number, c: number, cat: number) => {
        const t = poly(a, b, c);
        if (!eqs.some((e) => e.t === t)) eqs.push({ t, cat, D: b * b - 4 * a * c });
      };
      const count = (k: number) => eqs.filter((e) => e.cat === k).length;
      while (count(2) < 2) { const a = rng.pick([1, -1, 2]); const [u, v] = distinctRoots(rng, -5, 5); add(a, -a * (u + v), a * u * v, 2); }
      while (count(1) < 2) { const a = rng.pick([1, -1, 2]); const r = nz(rng, -5, 5); add(a, -2 * a * r, a * r * r, 1); }
      while (count(0) < 2) { const a = rng.pick([1, -1, 2]); const al = rng.int(-4, 4); const be = rng.int(1, 6) * Math.sign(a); add(a, -2 * a * al, a * al * al + be, 0); }
      const items = rng.shuffle(eqs);
      const concl = ["aucune solution réelle", "une seule solution", "deux solutions distinctes"];
      return {
        statement: "Classe ces équations selon leur nombre de solutions réelles.",
        parts: [{ interaction: { kind: "classer", categories: ["Aucune solution réelle", "Une seule solution", "Deux solutions distinctes"], items: items.map((e) => `$${e.t} = 0$`), answer: items.map((e) => e.cat) } }],
        solution: items.map((e) => `$${e.t} = 0$ : $\\Delta = ${e.D}$, donc ${concl[e.cat]}.`),
      };
    },
    reasoning: "Il n'est pas nécessaire de calculer les solutions : le signe de $\\Delta$ suffit pour compter les solutions.",
    hints: ["Calcule $\\Delta = b^2 - 4ac$ pour chaque équation.", "Regarde seulement le signe du résultat."],
  }),
  ex({
    id: "sd1-09", title: "Tableau de signes d'une forme factorisée", niveau: 2, objectives: ["M1S-SD-01"], time: 150,
    vary: (rng) => {
      const a = rng.pick([-3, -2, -1, 1, 2, 3]);
      const [u, v] = distinctRoots(rng, -6, 6);
      const L = a > 0 ? 0 : 1, M = 1 - L;
      return {
        statement: `On considère $f(x) = ${factTex(a, u, v)}$ pour $x$ réel. Étudie le signe de $f(x)$.`,
        parts: [trous("Valeurs de $x$ qui annulent $f(x)$, de la plus petite à la plus grande : [[0]] et [[1]].\nSur l'intervalle de gauche, $f(x)$ est [[2]].\nEntre ces deux valeurs, $f(x)$ est [[3]].\nSur l'intervalle de droite, $f(x)$ est [[4]].", [bn(u), bn(v), bs(PN, L), bs(PN, M), bs(PN, L)])],
        solution: [
          `$${a} \\neq 0$ : $f(x) = 0 \\iff ${lin(u)} = 0$ ou $${lin(v)} = 0$, soit $x = ${u}$ ou $x = ${v}$.`,
          `Pour $x < ${u}$, les deux facteurs du premier degré sont négatifs, leur produit est positif : $f(x)$ a le signe de $a = ${a}$.`,
          `Pour $${u} < x < ${v}$, un facteur est positif et l'autre négatif : $f(x)$ a le signe contraire de $a$.`,
          `Pour $x > ${v}$, les deux facteurs sont positifs : $f(x)$ a le signe de $a$.`,
          `Bilan : $f(x)$ est ${a > 0 ? "positif" : "négatif"} sur $]-\\infty\\,;\\,${u}[\\,\\cup\\,]${v}\\,;\\,+\\infty[$ et ${a > 0 ? "négatif" : "positif"} sur $]${u}\\,;\\,${v}[$.`,
        ],
      };
    },
    reasoning: "Dans un tableau de signes, on étudie chaque facteur, puis on applique la règle des signes ; le coefficient $a$ est un facteur à ne pas oublier.",
    hints: ["Cherche la valeur qui annule chaque facteur.", "N'oublie pas le signe du coefficient placé devant les parenthèses."],
  }),
  ex({
    id: "sd1-10", title: "Racine évidente et produit des racines", niveau: 2, objectives: ["M1S-SD-03"], time: 150,
    vary: (rng) => {
      const r0 = rng.pick([1, -1]);
      let a = 0, c = 0;
      do { a = rng.pick([-3, -2, -1, 1, 2, 3, 4, 5]); c = rng.int(-9, 9); } while (c === 0 || c === a);
      const b = r0 === 1 ? -(a + c) : a + c;
      const n = c * r0;
      return {
        statement: `On considère $f(x) = ${poly(a, b, c)}$.`,
        parts: [
          steps([["$f(1)$", V(a + b + c)], ["$f(-1)$", V(a - b + c)]], "1. Calcule $f(1)$ et $f(-1)$."),
          fracAns(n, a, [
            { match: fs(-n, a), feedback: `Attention au signe : le produit des racines est $\\dfrac{c}{a}$ et l'une des racines vaut $${r0}$.` },
            { match: fs(a * r0, c), feedback: "Le produit des racines vaut $\\dfrac{c}{a}$, pas $\\dfrac{a}{c}$." },
          ], "2. Déduis-en, grâce au produit des racines, l'autre racine de $f$ (sous forme de fraction irréductible si nécessaire, saisie du type 7/3)."),
        ],
        solution: [
          `$f(1) = ${a} + ${par(b)} + ${par(c)} = ${a + b + c}$ et $f(-1) = ${a} - ${par(b)} + ${par(c)} = ${a - b + c}$.`,
          `Donc $${r0}$ est une racine « évidente » de $f$.`,
          `Le produit des racines vaut $\\dfrac{c}{a} = ${frTex(c, a)}$, donc $${r0} \\times x_2 = ${frTex(c, a)}$ et $x_2 = ${frTex(n, a)}$.`,
          `Factorisation : $f(x) = ${a === 1 ? "" : a === -1 ? "-" : a}(${lin(r0)})\\left(${linF(n, a)}\\right)$.`,
        ],
      };
    },
    reasoning: "Quand une racine $x_1$ est connue, la relation $x_1 x_2 = \\dfrac{c}{a}$ donne l'autre sans calculer $\\Delta$.",
    hints: ["Pour $f(1)$, remplace $x$ par $1$ : il reste $a + b + c$.", "Utilise la relation entre le produit des racines et les coefficients."],
  }),
  ex({
    id: "sd1-11", title: "Factoriser avec une identité remarquable", niveau: 2, objectives: ["M1S-SD-03"], time: 75,
    vary: (rng) => {
      const k = rng.int(2, 9), kind = rng.int(0, 3);
      const exprs = [poly(1, -2 * k, k * k), poly(1, 2 * k, k * k), poly(1, 0, -k * k), poly(1, 0, k * k)];
      const opts = [`$(x - ${k})^2$`, `$(x + ${k})^2$`, `$(x - ${k})(x + ${k})$`, "Pas de factorisation en facteurs du premier degré (aucune racine réelle)"];
      const fb = [
        `$(x - ${k})^2 = ${exprs[0]}$ : compare le terme en $x$ et le terme constant.`,
        `$(x + ${k})^2 = ${exprs[1]}$ : compare le terme en $x$ et le terme constant.`,
        `$(x - ${k})(x + ${k}) = ${exprs[2]}$ : compare avec l'expression donnée.`,
        "Cette expression s'annule pour au moins une valeur réelle : elle se factorise.",
      ];
      const diag: Record<number, string> = {};
      [0, 1, 2, 3].filter((i) => i !== kind).forEach((i) => { diag[i] = fb[i]; });
      const sol = [
        `$${exprs[0]} = x^2 - 2 \\times x \\times ${k} + ${k}^2 = (x - ${k})^2$ : identité $(u - v)^2$, racine double $${k}$.`,
        `$${exprs[1]} = x^2 + 2 \\times x \\times ${k} + ${k}^2 = (x + ${k})^2$ : identité $(u + v)^2$, racine double $${-k}$.`,
        `$${exprs[2]} = x^2 - ${k}^2 = (x - ${k})(x + ${k})$ : identité $u^2 - v^2$, racines $${k}$ et $${-k}$.`,
        `$${exprs[3]} \\geqslant ${k * k} > 0$ pour tout réel $x$ : aucune racine ($\\Delta = -${4 * k * k} < 0$), donc pas de factorisation en facteurs du premier degré.`,
      ];
      return {
        statement: `Factorise $f(x) = ${exprs[kind]}$ (sans calculer $\\Delta$).`,
        parts: [shuffledQcm(rng, opts, kind, diag)],
        solution: [sol[kind], "Reconnaître une identité remarquable évite le calcul du discriminant."],
      };
    },
    reasoning: "Avant de calculer $\\Delta$, cherche une identité remarquable : $u^2 \\pm 2uv + v^2 = (u \\pm v)^2$ et $u^2 - v^2 = (u - v)(u + v)$.",
    hints: ["Le terme constant est-il un carré ? Avec quel signe ?", "Y a-t-il un terme en $x$ ? Son coefficient est-il le double produit ?"],
  }),
  ex({
    id: "sd1-12", title: "Résoudre avec les formules générales", niveau: 2, objectives: ["M1S-SD-03", "M1S-SD-05"], time: 150,
    vary: (rng) => {
      const a = rng.pick([1, 1, 2, -1, -2, 3]);
      const [u, v] = distinctRoots(rng, -6, 6);
      const { b, c } = coefs(a, u, v);
      const sq = Math.abs(a) * (v - u);
      return {
        statement: `Résous dans $\\mathbb{R}$ l'équation $${poly(a, b, c)} = 0$.`,
        parts: [steps([["$\\Delta =$", V(b * b - 4 * a * c)], ["Plus petite solution", V(u)], ["Plus grande solution", V(v)]])],
        solution: [
          `$${deltaLine(a, b, c)}$, donc $\\Delta > 0$ et $\\sqrt{\\Delta} = ${sq}$.`,
          `$x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} = \\dfrac{${-b} - ${sq}}{${2 * a}} = ${(-b - sq) / (2 * a)}$.`,
          `$x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} = \\dfrac{${-b} + ${sq}}{${2 * a}} = ${(-b + sq) / (2 * a)}$.`,
          a < 0 ? "Comme $a < 0$, la formule avec $-\\sqrt{\\Delta}$ donne ici la plus grande solution." : "Comme $a > 0$, la formule avec $-\\sqrt{\\Delta}$ donne la plus petite solution.",
          `Ensemble des solutions : $\\{${u}\\,;\\,${v}\\}$.`,
        ],
      };
    },
    reasoning: "On calcule $\\Delta$, on vérifie son signe, puis on applique $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$ en divisant par $2a$ en entier.",
    hints: ["Commence par $\\Delta = b^2 - 4ac$ et cherche sa racine carrée.", "Divise bien $-b \\pm \\sqrt{\\Delta}$ par $2a$ (et pas seulement par $2$)."],
  }),
  ex({
    id: "sd1-13", title: "De la forme factorisée à la forme développée", niveau: 2, objectives: ["M1S-SD-04", "M1S-SD-02"], time: 120,
    vary: (rng) => {
      const a = rng.pick([-3, -2, -1, 2, 3]);
      const [u, v] = distinctRoots(rng, -5, 5);
      const { b, c } = coefs(a, u, v);
      return {
        statement: `Développe et réduis $f(x) = ${factTex(a, u, v)}$.`,
        parts: [{ interaction: { kind: "expression", label: "$f(x) =$", variable: "x", answer: polyAns(a, b, c), form: "developpee", display: poly(a, b, c) } }],
        solution: [
          `On développe d'abord le produit des deux facteurs : $${factTex(1, u, v)} = ${poly(1, -(u + v), u * v)}$.`,
          `On multiplie chaque terme par $${a}$ : $f(x) = ${poly(a, b, c)}$.`,
          `Contrôle avec les relations : $-\\dfrac{b}{a} = ${u + v} = ${u} + ${par(v)}$ et $\\dfrac{c}{a} = ${u * v} = ${u} \\times ${par(v)}$.`,
        ],
      };
    },
    reasoning: "Développer d'abord les deux parenthèses, puis multiplier par $a$, limite les erreurs de signe.",
    hints: ["Commence par développer les deux parenthèses entre elles.", "Multiplie ensuite tous les termes par le coefficient placé devant."],
  }),
  ex({
    id: "sd1-14", title: "Le sommet à partir de la forme canonique", niveau: 2, objectives: ["M1S-SD-04"], time: 90,
    vary: (rng) => {
      const a = rng.pick([-2, -1, 1, 2]);
      let al = 0, be = 0;
      do { al = rng.int(-4, 4); be = rng.int(-4, 4); } while (al === 0 && be === 0);
      return {
        statement: `La fonction $f$ est définie sur $\\mathbb{R}$ par $f(x) = ${canonTex(a, al, be)}$. Place le sommet $S$ de sa parabole.`,
        parts: [
          { interaction: { kind: "repere", xmin: -6, xmax: 6, ymin: -6, ymax: 6, step: 1, points: [{ label: "S", answer: [al, be] }] } },
          qcm(["un minimum", "un maximum"], a > 0 ? 0 : 1, [{ match: String(a > 0 ? 1 : 0), feedback: "Regarde le signe du coefficient devant le carré : il indique si la parabole est tournée vers le haut ou vers le bas." }], "Au sommet $S$, la fonction $f$ atteint…"),
        ],
        solution: [
          `$f(x) = a(x - \\alpha)^2 + \\beta$ avec $a = ${a}$, $\\alpha = ${al}$ et $\\beta = ${be}$ ${al < 0 ? `(car $${lin(al)} = x - (${al})$)` : ""}.`,
          `Le sommet est $S(${al}\\,;\\,${be})$.`,
          a > 0 ? `$(x - \\alpha)^2 \\geqslant 0$ et $a > 0$, donc $f(x) \\geqslant ${be}$ : $${be}$ est le minimum de $f$.` : `$(x - \\alpha)^2 \\geqslant 0$ et $a < 0$, donc $f(x) \\leqslant ${be}$ : $${be}$ est le maximum de $f$.`,
        ],
      };
    },
    reasoning: "Dans $a(x - \\alpha)^2 + \\beta$, le sommet est $S(\\alpha\\,;\\,\\beta)$ ; attention : $(x + 3)^2$ correspond à $\\alpha = -3$.",
    hints: ["Écris la parenthèse sous la forme $x - \\alpha$ pour lire $\\alpha$ avec le bon signe.", "Le nombre ajouté après le carré est l'ordonnée du sommet."],
  }),
  // ── Niveau 3 : Entraînement ──
  ex({
    id: "sd1-15", title: "Une fonction qui s'annule en deux réels donnés", niveau: 3, objectives: ["M1S-SD-02"], time: 180,
    vary: (rng) => {
      const a = rng.pick([-3, -2, -1, 1, 2, 3]);
      const [u, v] = distinctRoots(rng, -5, 5);
      let x0 = 0;
      do { x0 = rng.int(-4, 4); } while (x0 === u || x0 === v);
      const P = (x0 - u) * (x0 - v), y0 = a * P;
      const { b, c } = coefs(a, u, v);
      return {
        statement: `$f$ est une fonction polynôme du second degré qui s'annule en $${u}$ et en $${v}$, et telle que $f(${x0}) = ${y0}$. On écrit $f(x) = ax^2 + bx + c$.`,
        parts: [steps([["$a =$", V(a)], ["$b =$", V(b)], ["$c =$", V(c)]])],
        solution: [
          `$f$ s'annule en deux réels distincts $${u}$ et $${v}$ : il existe un réel $a \\neq 0$ tel que $f(x) = a${fac(u)}${fac(v)}$ pour tout $x$.`,
          `$f(${x0}) = a \\times ${par(x0 - u)} \\times ${par(x0 - v)} = ${P}a$, donc $${P}a = ${y0}$ et $a = ${a}$.`,
          `$f(x) = ${factTex(a, u, v)} = ${poly(a, b, c)}$, d'où $a = ${a}$, $b = ${b}$, $c = ${c}$.`,
        ],
      };
    },
    reasoning: "Les fonctions polynômes du second degré qui s'annulent en $x_1 \\neq x_2$ sont les fonctions $a(x - x_1)(x - x_2)$, $a \\neq 0$ ; une valeur supplémentaire fixe $a$.",
    hints: ["Écris $f(x)$ sous forme factorisée avec un coefficient $a$ inconnu.", "Utilise la valeur connue de $f$ pour obtenir une équation d'inconnue $a$."],
  }),
  ex({
    id: "sd1-16", title: "Forme canonique par complétion du carré", niveau: 3, objectives: ["M1S-SD-04"], time: 150,
    vary: (rng) => {
      const a = rng.pick([1, 1, -1]), al = nz(rng, -6, 6), be = rng.int(-9, 9);
      const b = -2 * a * al, c = a * al * al + be;
      const sol = a === 1
        ? [`$x^2 ${b > 0 ? "+" : "-"} ${Math.abs(b)}x$ est le début du développement de $(${lin(al)})^2 = ${poly(1, b, al * al)}$.`, `Donc $x^2 ${b > 0 ? "+" : "-"} ${Math.abs(b)}x = (${lin(al)})^2 - ${al * al}$.`, `$f(x) = (${lin(al)})^2 - ${al * al} + ${par(c)} = ${canonTex(1, al, be)}$ : $\\alpha = ${al}$ et $\\beta = ${be}$.`, `$(x - \\alpha)^2 \\geqslant 0$, donc $f(x) \\geqslant ${be}$ : minimum $${be}$, atteint en $${al}$.`]
        : [`On met $-1$ en facteur dans les termes en $x$ : $f(x) = -\\left(${poly(1, -b, 0)}\\right) + ${par(c)}$.`, `$${poly(1, -b, 0)} = (${lin(al)})^2 - ${al * al}$.`, `$f(x) = -(${lin(al)})^2 + ${al * al} + ${par(c)} = ${canonTex(-1, al, be)}$ : $\\alpha = ${al}$ et $\\beta = ${be}$.`, `$-(x - \\alpha)^2 \\leqslant 0$, donc $f(x) \\leqslant ${be}$ : maximum $${be}$, atteint en $${al}$.`];
      return {
        statement: `Écris $f(x) = ${poly(a, b, c)}$ sous forme canonique.`,
        parts: [trous(`$f(x) = ${a === 1 ? "" : "-"}(x - \\alpha)^2 + \\beta$ avec $\\alpha =$ [[0]] et $\\beta =$ [[1]].\n$f$ admet un [[2]] égal à $\\beta$.`, [bn(al), bn(be), bs(["minimum", "maximum"], a === 1 ? 0 : 1)])],
        solution: sol,
      };
    },
    reasoning: "On reconnaît dans $x^2 + bx$ le début de $\\left(x + \\dfrac{b}{2}\\right)^2$, puis on retranche le carré ajouté en trop.",
    hints: ["Divise le coefficient de $x$ par $2$ pour trouver le nombre à mettre dans la parenthèse.", "Retranche le carré de ce nombre pour garder l'égalité."],
  }),
  ex({
    id: "sd1-17", title: "Factoriser quand a est différent de 1", niveau: 3, objectives: ["M1S-SD-03"], time: 210,
    vary: (rng) => {
      let p = 0, q = 0, r = 0;
      do { p = rng.pick([2, 3, 4, 5]); q = rng.int(-7, 7); r = rng.int(-5, 5); } while (q === 0 || r === 0 || gcdi(Math.abs(q), p) !== 1);
      const a = p, b = -(p * r + q), c = q * r, D = (p * r - q) ** 2, sq = Math.abs(p * r - q);
      const small = q / p < r ? qAns(q, p) : V(r), big = q / p < r ? V(r) : qAns(q, p);
      return {
        statement: `On considère $f(x) = ${poly(a, b, c)}$. Donne les racines sous forme de fraction irréductible si nécessaire (saisie du type -7/3).`,
        parts: [
          steps([["$\\Delta =$", V(D)], ["Plus petite racine", small], ["Plus grande racine", big]], "1. Calcule $\\Delta$ puis les racines de $f$."),
          shuffledQcm(rng, [
            `$${p}\\left(${linF(q, p)}\\right)(${lin(r)})$`,
            `$\\left(${linF(q, p)}\\right)(${lin(r)})$`,
            `$${p}\\left(${linF(-q, p)}\\right)(${lin(-r)})$`,
            `$${p}(${lin(q)})(${lin(r)})$`,
          ], 0, {
            1: "Il manque le coefficient $a$ : en développant, on n'obtient pas le bon coefficient de $x^2$.",
            2: "Attention aux signes : le facteur $x - x_1$ s'annule pour $x = x_1$.",
            3: "La racine non entière est une fraction : vérifie la valeur qui annule chaque facteur.",
          }, "2. Une forme factorisée de $f(x)$ est…"),
        ],
        solution: [
          `$${deltaLine(a, b, c)}$ et $\\sqrt{\\Delta} = ${sq}$.`,
          `$x = \\dfrac{${-b} - ${sq}}{${2 * a}} = ${frTex(-b - sq, 2 * a)}$ ou $x = \\dfrac{${-b} + ${sq}}{${2 * a}} = ${frTex(-b + sq, 2 * a)}$.`,
          `$f(x) = a(x - x_1)(x - x_2) = ${p}\\left(${linF(q, p)}\\right)(${lin(r)})$, que l'on peut aussi écrire $(${sumTex([[p, "x"], [-q, ""]])})(${lin(r)})$.`,
        ],
      };
    },
    reasoning: "Les formules générales fonctionnent pour tout $a \\neq 0$ ; la factorisation garde toujours le coefficient $a$ devant les facteurs.",
    hints: ["Calcule $\\Delta$, puis $\\sqrt{\\Delta}$ : c'est un entier.", "Simplifie les fractions obtenues, et n'oublie pas $a$ dans la factorisation."],
  }),
  ex({
    id: "sd1-18", title: "Résoudre une inéquation du second degré", niveau: 3, objectives: ["M1S-SD-01", "M1S-SD-04"], time: 180,
    vary: (rng) => {
      const a = rng.pick([1, -1, 2, -2, 3]);
      const [u, v] = distinctRoots(rng, -6, 6);
      const { b, c } = coefs(a, u, v);
      const op = rng.pick<Op>(["<", ">", "<=", ">="]);
      const k = ineqIndex(a, op), opts = intervalOptions(u, v);
      return {
        statement: `Résous dans $\\mathbb{R}$ l'inéquation $${poly(a, b, c)} ${OP_TEX[op]} 0$.`,
        parts: [shuffledQcm(rng, opts, k, intervalDiag(k))],
        solution: [
          `$${deltaLine(a, b, c)}$ : deux racines, $${u}$ et $${v}$.`,
          `Donc $${poly(a, b, c)} = ${factTex(a, u, v)}$.`,
          `$a = ${a}$ : le trinôme est ${a > 0 ? "positif" : "négatif"} à l'extérieur de $[${u}\\,;\\,${v}]$ et ${a > 0 ? "négatif" : "positif"} sur $]${u}\\,;\\,${v}[$.`,
          `${op === "<=" || op === ">=" ? "L'inégalité est large : les racines sont incluses." : "L'inégalité est stricte : les racines sont exclues."} Ensemble des solutions : ${opts[k]}.`,
        ],
      };
    },
    reasoning: "On factorise pour obtenir les racines, puis on applique la règle « signe de $a$ à l'extérieur des racines » ; on termine par les crochets.",
    hints: ["Cherche les racines du trinôme.", "Repère le signe de $a$, puis décide si les racines sont incluses."],
  }),
  ex({
    id: "sd1-19", title: "Trouver la seconde racine", niveau: 3, objectives: ["M1S-SD-03"], time: 90,
    vary: (rng) => {
      const a = rng.pick([1, 2, -1, 3, -2]), g = nz(rng, -8, 8);
      let o = 0;
      do { o = rng.int(-8, 8); } while (o === g);
      const { b, c } = coefs(a, g, o);
      return {
        statement: `Le nombre $
