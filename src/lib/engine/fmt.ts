// Aides d'écriture LaTeX pour les générateurs.
import { tex } from "./numbers";

/** Polynôme LaTeX à partir de coefficients [c0, c1, c2, ...] (degré croissant). */
export function polyTex(coefs: number[], v = "x"): string {
  const out: string[] = [];
  for (let p = coefs.length - 1; p >= 0; p--) {
    const c = coefs[p];
    if (!c) continue;
    const abs = Math.abs(c);
    const coef = p === 0 ? tex(abs) : abs === 1 ? "" : tex(abs);
    const vp = p === 0 ? "" : p === 1 ? v : `${v}^{${p}}`;
    const sign = c < 0 ? "-" : "+";
    out.push(out.length === 0 ? (c < 0 ? "-" : "") + coef + vp : ` ${sign} ${coef}${vp}`);
  }
  return out.join("") || "0";
}

/** Polynôme en syntaxe math.js (pour la correction). */
export function polyExpr(coefs: number[], v = "x"): string {
  return coefs.map((c, p) => `(${c})*${v}^${p}`).join(" + ") || "0";
}

/** Relatif entre parenthèses s'il est négatif : (-3). */
export const par = (n: number) => (n < 0 ? `(${tex(n)})` : tex(n));
/** Relatif écrit avec son signe : (+3) ou (-3). */
export const rel = (n: number) => (n < 0 ? `(${tex(n)})` : `(+${tex(n)})`);
/** Terme signé pour une somme : « + 3 » ou « - 3 ». */
export const signed = (n: number) => (n < 0 ? `- ${tex(-n)}` : `+ ${tex(n)}`);

export const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T"];
