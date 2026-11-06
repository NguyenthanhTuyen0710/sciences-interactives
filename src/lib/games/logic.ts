// Logique pure (testable) des modèles de jeux : génération des manches, correction, diagnostic, adaptation.
import { createRng } from "../engine/rng";
import type { Rng } from "../engine/types";
import { gcd, nearlyEqual, parseNumber } from "../engine/numbers";

/** Écriture française d'un relatif : −3 ; 2,5 ; +4 si `plus`. */
export function frRel(x: number, plus = false): string {
  const s = String(Math.abs(Math.round(x * 1000) / 1000)).replace(".", ",");
  return x < 0 ? `−${s}` : plus && x > 0 ? `+${s}` : s;
}
/** Relatif entre parenthèses s'il est négatif (pour écrire un calcul). */
export const par = (x: number) => (x < 0 ? `(${frRel(x)})` : frRel(x));

/** Analyse une saisie d'élève : « -3 », « −3 », « +2,5 », « (−4) ». */
export function parseRel(raw: string): number | null {
  const s = raw.trim().replace(/[()\s]/g, "").replace(/[−–]/g, "-").replace(",", ".");
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

const eq = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// ───────── Adaptation de la difficulté (commune à tous les jeux) ─────────
export interface Adapt { level: number; streak: number; misses: number }
/** 3 réussites d'affilée → niveau supérieur ; 2 erreurs d'affilée → niveau inférieur. */
export function adapt(s: Adapt, ok: boolean, maxLevel: number): Adapt {
  if (ok) {
    const streak = s.streak + 1;
    return streak >= 3 && s.level < maxLevel ? { level: s.level + 1, streak: 0, misses: 0 } : { level: s.level, streak, misses: 0 };
  }
  const misses = s.misses + 1;
  return misses >= 2 && s.level > 1 ? { level: s.level - 1, streak: 0, misses: 0 } : { level: s.level, streak: 0, misses };
}

// ───────── Droite graduée ─────────
export interface LineLevel { min: number; max: number; step: number }
export interface LineRound { type: "placer" | "lire"; target: number; level: LineLevel }

export function lineRound(rng: Rng, lv: LineLevel): LineRound {
  const n = Math.round((lv.max - lv.min) / lv.step);
  const type = rng.next() < 0.5 ? "placer" : "lire";
  // En lecture, les extrémités (déjà étiquetées) sont exclues ; 0 est toujours exclu.
  const at = (k: number) => Math.round((lv.min + k * lv.step) * 1000) / 1000;
  let target = 0;
  while (eq(target, 0)) target = at(type === "lire" ? rng.int(1, n - 1) : rng.int(0, n));
  // Privilégier les négatifs (objet du chapitre) : environ 65 % des cibles.
  if (target > 0 && rng.next() < 0.3 && -target >= lv.min) target = -target;
  return { type, target, level: lv };
}

export function lineFeedback(target: number, answer: number, step: number): { ok: boolean; message: string } {
  if (eq(answer, target)) return { ok: true, message: `Exact : le point d'abscisse ${frRel(target)} est bien placé.` };
  if (!eq(target, 0) && eq(answer, -target))
    return { ok: false, message: `Tu as trouvé l'opposé (${frRel(answer)}). ${target < 0 ? "Les nombres négatifs sont à gauche de 0." : "Les nombres positifs sont à droite de 0."}` };
  if (Math.abs(answer - target) <= step + 1e-9)
    return { ok: false, message: `Presque : décalage d'une graduation. Chaque graduation vaut ${frRel(step)} ; compte-les depuis 0.` };
  const n = Math.round(Math.abs(target / step));
  return { ok: false, message: `La réponse était ${frRel(target)} : le point est à ${n} graduation${n > 1 ? "s" : ""} de ${frRel(step)} ${target < 0 ? "à gauche" : "à droite"} de 0 (distance à zéro : ${frRel(Math.abs(target))}).` };
}

// ───────── Calcul mental (somme / différence de relatifs) ─────────
export interface CalcLevel { range: number; ops: ("+" | "-")[]; decimals?: boolean }
export interface CalcQuestion { a: number; b: number; op: "+" | "-"; answer: number; tex: string }

export function calcQuestion(rng: Rng, lv: CalcLevel): CalcQuestion {
  const draw = () => {
    const v = lv.decimals ? rng.int(-lv.range * 10, lv.range * 10) / 10 : rng.int(-lv.range, lv.range);
    return v === 0 ? -1 : v;
  };
  const a = draw();
  let b = draw();
  // au moins un négatif : c'est l'objet du chapitre
  if (a > 0 && b > 0) b = -b;
  const op = rng.pick(lv.ops);
  const answer = Math.round((op === "+" ? a + b : a - b) * 1000) / 1000;
  return { a, b, op, answer, tex: `${frRel(a)} ${op === "+" ? "+" : "-"} ${par(b)}`.replace(/-/g, "−").replace(/,/g, "{,}") };
}

/** Diagnostic des erreurs fréquentes sur une somme ou une différence de relatifs. */
export function calcFeedback(q: CalcQuestion, given: number): { ok: boolean; message: string } {
  const { a, b, op, answer } = q;
  if (eq(given, answer)) return { ok: true, message: "Juste !" };
  const bb = op === "+" ? b : -b; // terme réellement ajouté
  const rule = op === "-" ? ` Soustraire ${par(b)}, c'est ajouter son opposé ${par(-b)} : ${frRel(a)} + ${par(-b)}.` : "";
  if (!eq(answer, 0) && eq(given, -answer)) return { ok: false, message: `Erreur de signe : le résultat est ${frRel(answer)}.${rule}` };
  if (op === "-" && eq(given, a + b)) return { ok: false, message: `Tu as ajouté ${par(b)} au lieu de le soustraire.${rule} Résultat : ${frRel(answer)}.` };
  if (Math.sign(a) !== Math.sign(bb) && eq(Math.abs(given), Math.abs(a) + Math.abs(bb)))
    return { ok: false, message: `Les deux nombres ont des signes contraires : on soustrait les distances à zéro (${frRel(Math.max(Math.abs(a), Math.abs(bb)))} − ${frRel(Math.min(Math.abs(a), Math.abs(bb)))}) au lieu de les additionner.${rule} Résultat : ${frRel(answer)}.` };
  return { ok: false, message: `Le résultat était ${frRel(answer)}.${rule}` };
}

// ───────── Calcul flash (banque de questions à réponse numérique, tous chapitres) ─────────
export interface FlashItem { q: string; answer: string; irreducible?: boolean; explanation: string }
export interface FlashLevel { label: string; items: FlashItem[] }

/** Tire l'indice d'une question du niveau, différente de la précédente si possible. */
export function flashPick(rng: Rng, n: number, last = -1): number {
  if (n <= 1) return 0;
  let i = last;
  while (i === last) i = rng.int(0, n - 1);
  return i;
}

/** Écriture LaTeX d'une réponse de la banque : « 17/12 » → \dfrac{17}{12}, « 3e-4 » → 3 \times 10^{-4}, « -2,5 » → -2{,}5. */
export function flashAnswerTex(answer: string): string {
  const s = answer.trim().replace(/[−–]/g, "-").replace(/\./g, ",");
  const f = s.match(/^(-?)(\d+)\/(\d+)$/);
  if (f) return `${f[1]}\\dfrac{${f[2]}}{${f[3]}}`;
  const e = s.match(/^(-?[\d,]+)e([+-]?\d+)$/i);
  if (e) return `${e[1].replace(",", "{,}")} \\times 10^{${Number(e[2])}}`;
  return s.replace(",", "{,}");
}

/** Correction d'une réponse saisie ; `null` si la saisie n'est pas un nombre. */
export function flashFeedback(item: FlashItem, raw: string): { ok: boolean; message: string } | null {
  const p = parseNumber(raw);
  if (!p) return null;
  const exp = parseNumber(item.answer);
  if (!exp) throw new Error(`Réponse de banque illisible : ${item.answer}`);
  const shown = `$${flashAnswerTex(item.answer)}$`;
  if (!nearlyEqual(p.value, exp.value)) return { ok: false, message: `Réponse attendue : ${shown}. ${item.explanation}` };
  if (item.irreducible && p.isFraction && Number.isInteger(p.num) && Number.isInteger(p.den) && gcd(p.num!, p.den!) > 1)
    return { ok: false, message: `Valeur juste, mais la fraction n'est pas irréductible : ${shown}. ${item.explanation}` };
  return { ok: true, message: item.explanation };
}

/** Graine stable pour une partie (permet de rejouer à l'identique dans les tests). */
export const gameRng = (seed: string) => createRng(seed);
