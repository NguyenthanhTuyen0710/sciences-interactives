// Contrôle par résolution indépendante (décisions 31 et 32) : validate-chapter vérifiait que la réponse attendue
// par le code est acceptée par le correcteur, jamais qu'elle résout l'énoncé (eq3-27, eq3-02, eq3-30 sont passés).
// Ici, l'équation est relue dans le texte que voit l'élève (LaTeX entre $…$, trous remplis par leurs réponses),
// résolue sans les variables du générateur (polynôme de degré ≤ 2 en x), puis comparée à la réponse attendue.
import { compile, parse, type MathNode } from "mathjs";
import { normalizeExpr } from "../src/lib/engine/expr";
import { nearlyEqual } from "../src/lib/engine/numbers";
import type { Blank, Interaction } from "../src/lib/engine/types";
import type { ExerciseBody, SolveCheck } from "../src/lib/chapters/schema";

const VAR = "x";

/** LaTeX simple → syntaxe math.js ; null si une commande reste inconnue (texte non pris en compte). */
export function texToExpr(tex: string): string | null {
  let s = tex.replace(/\\(left|right|big|Big|bigg|Bigg)\b/g, "").replace(/\\[,;:! ]/g, " ").replace(/\{,\}/g, ".");
  for (let prev = ""; prev !== s; ) { prev = s; s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))").replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)"); }
  s = s.replace(/\\times|\\cdot/g, "*").replace(/[{[]/g, "(").replace(/[}\]]/g, ")");
  // « x(x + 3) » : produit, pas un appel de fonction.
  return /\\/.test(s) ? null : normalizeExpr(s).replace(/(^|[^a-z])x\s*\(/gi, "$1x*(");
}

function symbolsOf(node: MathNode): string[] {
  const out: string[] = [];
  node.traverse((n: MathNode, path: string) => { if (n.type === "SymbolNode" && path !== "fn") out.push((n as MathNode & { name: string }).name); });
  return out;
}

/**
 * Équations en x contenues dans un texte : suites de segments $…$ et de trous [[i]] séparées seulement par des
 * espaces, avec un seul « = » et aucun autre symbole que x (une identité littérale comme a² − b² = (a − b)(a + b)
 * est ignorée). `fill` donne le texte d'un trou (sa réponse attendue).
 */
export function equationsIn(text: string, fill: (i: number) => string = () => "?"): { tex: string; lhs: string; rhs: string }[] {
  const tokens = text.split(/(\$[^$]*\$|\[\[\d+\]\])/).filter((t) => t !== "");
  const runs: string[] = [];
  let cur: string[] | null = null;
  for (const t of tokens) {
    const blank = /^\[\[(\d+)\]\]$/.exec(t);
    if (blank || t.startsWith("$")) { (cur ??= []).push(blank ? fill(Number(blank[1])) : t.slice(1, -1)); continue; }
    if (/^\s*$/.test(t)) continue;
    if (cur) runs.push(cur.join(" "));
    cur = null;
  }
  if (cur) runs.push(cur.join(" "));
  const out: { tex: string; lhs: string; rhs: string }[] = [];
  for (const tex of runs) {
    const sides = tex.split("=");
    if (sides.length !== 2) continue;
    const [lhs, rhs] = sides.map(texToExpr);
    if (!lhs || !rhs) continue;
    try {
      const syms = [...symbolsOf(parse(lhs)), ...symbolsOf(parse(rhs))];
      if (syms.includes(VAR) && syms.every((s) => s === VAR)) out.push({ tex, lhs, rhs });
    } catch { /* non analysable : ignoré */ }
  }
  return out;
}

/** Ensemble des solutions réelles de lhs = rhs : « all » (identité), liste triée, ou null (pas un polynôme de degré ≤ 2). */
export function solveEquation(lhs: string, rhs: string): number[] | "all" | null {
  const L = compile(lhs), R = compile(rhs);
  const f = (x: number) => { try { return Number(L.evaluate({ x })) - Number(R.evaluate({ x })); } catch { return NaN; } };
  const c = f(0), p = f(1), m = f(-1);
  if (![c, p, m].every(Number.isFinite)) return null;
  const a = (p + m) / 2 - c, b = (p - m) / 2;
  const scale = Math.max(1, Math.abs(a), Math.abs(b), Math.abs(c));
  const poly = (x: number) => a * x * x + b * x + c;
  for (const x of [2, -3, 0.5, 7]) if (!Number.isFinite(f(x)) || !nearlyEqual(f(x), poly(x), 1e-9 * scale * Math.max(1, x * x))) return null;
  const z = (v: number) => (Math.abs(v) < 1e-12 * scale ? 0 : v);
  const [A, B, C] = [z(a), z(b), z(c)];
  if (A === 0 && B === 0) return C === 0 ? "all" : [];
  if (A === 0) return [-C / B];
  const D = z(B * B - 4 * A * C);
  if (D < 0) return [];
  if (D === 0) return [-B / (2 * A)];
  return [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)].sort((u, v) => u - v);
}

const close = (u: number, v: number) => nearlyEqual(u, v, 1e-9, 1e-9);
const fmt = (s: number[] | "all") => (s === "all" ? "tout réel (identité)" : s.length ? `{${s.map((v) => +v.toPrecision(10)).join(" ; ")}}` : "aucune solution");

/** Valeur numérique d'une option de QCM ($…$) ; null si l'option n'est pas un nombre. */
function optionValue(o: string): number | null {
  const e = texToExpr(o.trim().replace(/^\$|\$$/g, ""));
  if (!e) return null;
  try { const v = Number(compile(e).evaluate({})); return Number.isFinite(v) ? v : null; } catch { return null; }
}

const blankText = (b: Blank) => (b.type === "number" ? String(b.answer.value) : b.type === "select" ? b.options[b.answer].replace(/\$/g, "") : b.answer[0] ?? "?");

/** Texte élève d'une partie, trous remplis : consigne, gabarit, option correcte d'un QCM. */
function partEquations(body: ExerciseBody, p: number) {
  const part = body.parts[p];
  if (!part) return null;
  const it = part.interaction;
  const eqs = equationsIn(part.prompt ?? "");
  if (it.kind === "texte-trous") eqs.push(...equationsIn(it.template, (i) => blankText(it.blanks[i])));
  if (it.kind === "qcm" && !it.multiple) eqs.push(...equationsIn(it.options[it.answer[0]]));
  return eqs;
}

/** Réponses attendues d'une partie, en nombres : numérique, trous numériques, ou QCM dont les options sont des nombres. */
function expected(it: Interaction): { kind: "set"; values: number[] } | { kind: "qcm"; values: (number | null)[]; correct: number[] } | null {
  if (it.kind === "numerique") return { kind: "set", values: [it.answer.value] };
  if (it.kind === "texte-trous") return { kind: "set", values: it.blanks.flatMap((b) => (b.type === "number" ? [b.answer.value] : [])) };
  if (it.kind === "qcm") return { kind: "qcm", values: it.options.map(optionValue), correct: it.answer };
  return null;
}

/**
 * Vérifie un tirage contre les contrôles déclarés de l'exercice. Chaque équation trouvée à la source doit avoir pour
 * ensemble de solutions (filtré par `positive`) exactement la réponse attendue ; pour un QCM numérique, une option est
 * correcte si et seulement si elle est solution. Source d'équations en QCM : aucun distracteur ne doit avoir les mêmes
 * solutions que l'équation correcte (deux bonnes réponses).
 */
export function solveCheckIssues(body: ExerciseBody, checks: SolveCheck[]): string[] {
  const out: string[] = [];
  for (const [k, chk] of checks.entries()) {
    const label = `contrôle par résolution ${k + 1}`;
    const eqs = chk.equation === "statement" ? equationsIn(body.statement) : partEquations(body, chk.equation);
    const target = body.parts[chk.answer]?.interaction;
    const exp = target && expected(target);
    if (!eqs?.length) { out.push(`${label} : aucune équation en x trouvée à la source (${chk.equation === "statement" ? "énoncé" : `partie ${chk.equation}`})`); continue; }
    if (!exp) { out.push(`${label} : partie ${chk.answer} sans réponse numérique comparable`); continue; }
    for (const eq of eqs) {
      const sol = solveEquation(eq.lhs, eq.rhs);
      if (sol === null) { out.push(`${label} : $${eq.tex}$ n'est pas une équation de degré ≤ 2 en x`); continue; }
      const kept = sol === "all" ? sol : sol.filter((v) => !chk.positive || v > 0);
      if (exp.kind === "qcm") {
        if (exp.values.some((v) => v === null)) { out.push(`${label} : option de QCM non numérique (partie ${chk.answer})`); break; }
        const isSol = exp.values.map((v) => kept === "all" || kept.some((s) => close(s, v!)));
        const ok = isSol.every((b, i) => b === exp.correct.includes(i));
        if (!ok) out.push(`${label} : $${eq.tex}$ a pour solutions ${fmt(kept)} ; options solutions ${isSol.flatMap((b, i) => (b ? [i] : [])).join(", ") || "aucune"}, options attendues ${exp.correct.join(", ")}`);
        continue;
      }
      const want = [...new Set(exp.values)].sort((u, v) => u - v);
      const same = kept !== "all" && kept.length === want.length && kept.every((s, i) => close(s, want[i]));
      if (!same) out.push(`${label} : $${eq.tex}$ a pour solutions ${fmt(kept)}, réponse attendue (partie ${chk.answer}) ${fmt(want)}`);
    }
    // Équations proposées en QCM : un distracteur de même ensemble de solutions serait une seconde bonne réponse.
    const src = chk.equation === "statement" ? undefined : body.parts[chk.equation]?.interaction;
    if (src?.kind === "qcm" && !src.multiple && exp.kind === "set") {
      const want = [...new Set(exp.values)].sort((u, v) => u - v);
      src.options.forEach((o, i) => {
        if (i === src.answer[0]) return;
        const [eq] = equationsIn(o);
        const sol = eq && solveEquation(eq.lhs, eq.rhs);
        if (!sol) return;
        const kept = sol === "all" ? sol : sol.filter((v) => !chk.positive || v > 0);
        if (kept !== "all" && kept.length === want.length && kept.every((s, j) => close(s, want[j]))) out.push(`${label} : le distracteur ${i} ($${eq.tex}$) a les mêmes solutions que l'équation correcte`);
      });
    }
  }
  return out;
}
