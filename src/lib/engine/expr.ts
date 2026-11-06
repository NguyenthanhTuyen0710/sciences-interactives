// Vérification symbolique/numérique d'expressions algébriques (math.js).
import { parse, type MathNode } from "mathjs";

export function normalizeExpr(s: string): string {
  return s
    .trim()
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷|:/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\s+/g, " ");
}

type Node = MathNode & {
  type: string;
  op?: string;
  fn?: string | { name?: string };
  args?: Node[];
  content?: Node;
  name?: string;
  value?: unknown;
};

export function safeParse(s: string): Node | null {
  try {
    return parse(normalizeExpr(s)) as Node;
  } catch {
    return null;
  }
}

function symbols(node: Node): string[] {
  const out: string[] = [];
  node.traverse((n: MathNode, path: string) => {
    const nn = n as Node;
    // ignorer les noms de fonctions (sqrt, exp, ln…)
    if (nn.type === "SymbolNode" && path !== "fn") out.push(nn.name!);
  });
  return out;
}

const SAMPLE = [-2.31, -1.17, -0.43, 0.37, 1.29, 2.61, 3.73];

/** Deux expressions sont-elles égales pour toute valeur de la variable ? (test sur 7 points) */
export function equivalent(user: string, expected: string, variable = "x"): boolean {
  const a = safeParse(user);
  const b = safeParse(expected);
  if (!a || !b) return false;
  const allowed = new Set([variable, "pi", "e"]);
  if (symbols(a).some((s) => !allowed.has(s))) return false;
  const fa = a.compile();
  const fb = b.compile();
  let compared = 0;
  for (const x of SAMPLE) {
    let va: unknown, vb: unknown;
    try {
      va = fa.evaluate({ [variable]: x });
      vb = fb.evaluate({ [variable]: x });
    } catch {
      return false;
    }
    if (typeof vb !== "number" || !Number.isFinite(vb)) continue;
    if (typeof va !== "number" || !Number.isFinite(va)) return false;
    if (Math.abs(va - vb) > 1e-7 * Math.max(1, Math.abs(vb))) return false;
    compared++;
  }
  return compared >= 3;
}

export function usesUnknownSymbols(user: string, variable: string): string[] {
  const a = safeParse(user);
  if (!a) return [];
  const allowed = new Set([variable, "pi", "e"]);
  return [...new Set(symbols(a).filter((s) => !allowed.has(s)))];
}

/** Degré d'un monôme, ou null si le nœud n'est pas un monôme c·x^k. */
function monomialDegree(n: Node, v: string): number | null {
  switch (n.type) {
    case "ConstantNode":
      return 0;
    case "SymbolNode":
      return n.name === v ? 1 : n.name === "pi" ? 0 : null;
    case "ParenthesisNode":
      return monomialDegree(n.content!, v);
    case "OperatorNode": {
      const args = n.args!;
      if (n.fn === "unaryMinus" || n.fn === "unaryPlus") return monomialDegree(args[0], v);
      if (n.op === "*") {
        let d = 0;
        for (const a of args) {
          const k = monomialDegree(a, v);
          if (k === null) return null;
          d += k;
        }
        return d;
      }
      if (n.op === "/") {
        const num = monomialDegree(args[0], v);
        return num !== null && monomialDegree(args[1], v) === 0 ? num : null;
      }
      if (n.op === "^") {
        const base = args[0].type === "ParenthesisNode" ? args[0].content! : args[0];
        if (base.type === "SymbolNode" && base.name === v && args[1].type === "ConstantNode")
          return Number(args[1].value);
        if (monomialDegree(base, v) === 0 && args[1].type === "ConstantNode") return 0;
        return null;
      }
      return null;
    }
    default:
      return null;
  }
}

function terms(n: Node, out: Node[] = []): Node[] {
  if (n.type === "OperatorNode" && (n.op === "+" || (n.op === "-" && n.args!.length === 2))) {
    terms(n.args![0], out);
    terms(n.args![1], out);
  } else if (n.type === "OperatorNode" && n.fn === "unaryMinus") {
    terms(n.args![0], out);
  } else out.push(n);
  return out;
}

/** L'expression est-elle développée et réduite (somme de monômes de degrés distincts) ? */
export function isReducedPolynomial(user: string, v = "x"): boolean {
  const a = safeParse(user);
  if (!a) return false;
  const degs = terms(a).map((t) => monomialDegree(t, v));
  if (degs.some((d) => d === null)) return false;
  return new Set(degs).size === degs.length;
}

/** Rendu LaTeX d'une saisie d'élève (pour l'aperçu). */
export function exprToTex(user: string): string | null {
  const a = safeParse(user);
  if (!a) return null;
  try {
    return a.toTex({ parenthesis: "keep", implicit: "hide" }).replace(/\\cdot/g, "\\times");
  } catch {
    return null;
  }
}
