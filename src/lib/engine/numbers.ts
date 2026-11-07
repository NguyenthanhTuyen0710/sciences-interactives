// Nombres : arithmétique exacte simple, format français, analyse des saisies.

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export function simplify(n: number, d: number): [number, number] {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return [n / g, d / g];
}

/** Supprime le bruit des flottants (0.1+0.2 → 0.3). */
export function clean(x: number, digits = 10): number {
  return Number.parseFloat(x.toPrecision(digits));
}

export function roundTo(x: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
}

export function roundSig(x: number, sig: number): number {
  if (x === 0) return 0;
  const p = Math.floor(Math.log10(Math.abs(x)));
  return roundTo(x, sig - 1 - p);
}

/** Format texte français : 1234,5 → « 1 234,5 ». */
export function fr(x: number, maxDecimals = 6): string {
  const v = clean(roundTo(x, maxDecimals));
  const neg = v < 0;
  const [int, dec] = Math.abs(v).toString().includes("e")
    ? [Math.abs(v).toFixed(maxDecimals).replace(/0+$/, ""), ""]
    : Math.abs(v).toString().split(".");
  const intFmt = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int;
  return (neg ? "−" : "") + intFmt + (dec ? "," + dec : "");
}

/** Format LaTeX français : virgule décimale {,} et espaces de milliers. */
export function tex(x: number, maxDecimals = 6): string {
  return fr(x, maxDecimals).replace("−", "-").replace(",", "{,}").replace(/ /g, "\\,");
}

/** Écriture fixe avec n décimales (ex. résultats de physique). */
export function frFixed(x: number, decimals: number): string {
  const [int, dec] = Math.abs(x).toFixed(decimals).split(".");
  const intFmt = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int;
  const neg = x < 0 && Number(Math.abs(x).toFixed(decimals)) !== 0;
  return (neg ? "−" : "") + intFmt + (dec ? "," + dec : "");
}

/** Notation scientifique LaTeX : 3{,}2 \times 10^{-4}. */
export function sciTex(x: number, sig = 3): string {
  if (x === 0) return "0";
  const p = Math.floor(Math.log10(Math.abs(x)));
  const m = roundSig(x / 10 ** p, sig);
  const mStr = frFixed(m, sig - 1).replace("−", "-").replace(",", "{,}");
  return p === 0 ? mStr : `${mStr} \\times 10^{${p}}`;
}

/** Fraction LaTeX simplifiée. */
export function fracTex(n: number, d: number, simplifyIt = true): string {
  const [a, b] = simplifyIt ? simplify(n, d) : [n, d];
  if (b === 1) return `${a}`;
  return `${a < 0 ? "-" : ""}\\dfrac{${Math.abs(a)}}{${b}}`;
}

export interface ParsedNumber {
  value: number;
  isFraction: boolean;
  sigFigs: number;
  decimals: number;
  /** Numérateur/dénominateur si saisie fractionnaire. */
  num?: number;
  den?: number;
}

/**
 * Analyse une saisie d'élève : « 1,5 », « -3/4 », « 2,5×10^3 », « 2,5e-3 », « 12 000 ».
 * Renvoie null si la saisie n'est pas un nombre.
 */
export function parseNumber(input: string): ParsedNumber | null {
  if (typeof input !== "string") return null;
  let s = input
    .trim()
    .replace(/[    ]/g, "")
    .replace(/[−–]/g, "-")
    // « 35 % » ou « 12 € » : l'unité affichée à côté de la case peut aussi être tapée
    .replace(/(\d)(%|€)$/, "$1")
    // exposants Unicode (10⁻⁶) et point de multiplication des calculatrices (5,6.10^-6)
    .replace(/10([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/, (_, e: string) => "10^" + [...e].map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(ch) >= 0 ? String("⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(ch)) : ch === "⁻" ? "-" : "+").join(""))
    .replace(/(\d)[.·]10\^/, "$1×10^")
    .replace(/,/g, ".")
    .replace(/[×x*·]10\^?\(?([+-]?\d+)\)?$/i, "e$1")
    .replace(/^10\^\(?([+-]?\d+)\)?$/, "1e$1")
    // un relatif écrit entre parenthèses, « (−3) », est accepté
    .replace(/^\(([^()]*)\)$/, "$1");
  if (!s) return null;
  const frac = s.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/);
  if (frac) {
    const n = Number(frac[1]);
    const d = Number(frac[2]);
    if (d === 0) return null;
    return { value: n / d, isFraction: true, sigFigs: Infinity, decimals: Infinity, num: n, den: d };
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const value = Number(s);
  if (!Number.isFinite(value)) return null;
  s = s.replace(/^[+-]/, "");
  const mantissa = s.split(/e/i)[0];
  const digits = mantissa.replace(".", "").replace(/^0+/, "");
  const sigFigs = digits.length || 1;
  const decimals = mantissa.includes(".") ? mantissa.split(".")[1].length : 0;
  return { value, isFraction: false, sigFigs, decimals };
}

export function nearlyEqual(a: number, b: number, abs = 0, rel = 1e-9): boolean {
  return Math.abs(a - b) <= abs + rel * Math.max(1, Math.abs(a), Math.abs(b));
}
