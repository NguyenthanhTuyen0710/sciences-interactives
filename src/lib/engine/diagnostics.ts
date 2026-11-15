// Cohérence des diagnostics d'erreurs fréquentes et des distracteurs d'une partie d'exercice.
// Partagé par scripts/validate-chapter.ts et tests/chapter-suite.ts : une seule définition des règles.
import { checkPart, matchesMistake } from "./check";
import { nearlyEqual, parseNumber } from "./numbers";
import { convert } from "./units";
import type { ExerciseInstance, Interaction, Mistake, NumAnswer } from "./types";
import type { ChapterContent } from "../chapters/schema";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Deux saisies équivalentes : même valeur numérique (fraction, décimal, écriture française) ou même texte normalisé. */
export function sameValue(a: string, b: string): boolean {
  const x = parseNumber(a), y = parseNumber(b);
  if (x && y) return nearlyEqual(x.value, y.value, 0);
  return norm(a) === norm(b);
}

/** Réponse d'élève correspondant à un diagnostic, telle que le correcteur la recevrait (null : non applicable). */
function responseFor(it: Interaction, m: Mistake): unknown {
  switch (it.kind) {
    case "numerique": return { value: m.match, unit: it.answer.unit?.base };
    case "qcm": return [Number(m.match)];
    case "texte-libre": return m.match;
    default: return null;
  }
}

/**
 * Problèmes d'une partie : un diagnostic égal à la bonne réponse, ou accepté comme correct par le correcteur
 * (équivalence après normalisation : fraction/décimal, tolérance, arrondi, unité) ; deux diagnostics équivalents
 * (un seul pourrait s'afficher) ; deux options de QCM équivalentes.
 */
export function diagnosticIssues(it: Interaction, mistakes: Mistake[] | undefined, perfectResponse: unknown, part = 0): string[] {
  const out: string[] = [];
  const ms = mistakes ?? [];
  for (const m of ms) {
    if (matchesMistake(it, perfectResponse, m)) { out.push(`diagnostic « ${m.match} » égal à la bonne réponse (partie ${part})`); continue; }
    const r = responseFor(it, m);
    if (r !== null && checkPart(it, r).status === "correct") out.push(`diagnostic « ${m.match} » accepté comme bonne réponse par le correcteur (partie ${part})`);
  }
  for (let i = 0; i < ms.length; i++)
    for (let j = i + 1; j < ms.length; j++)
      if (sameValue(ms[i].match, ms[j].match)) out.push(`diagnostics « ${ms[i].match} » et « ${ms[j].match} » équivalents : un seul message peut s'afficher (partie ${part})`);
  if (it.kind === "qcm")
    for (let i = 0; i < it.options.length; i++)
      for (let j = i + 1; j < it.options.length; j++)
        if (sameValue(it.options[i], it.options[j])) out.push(`options de QCM équivalentes « ${it.options[i]} » / « ${it.options[j]} » (partie ${part})`);
  return out;
}

/** Valeurs particulières prises par une réponse numérique (couverture des cas limites sur l'ensemble des tirages). */
export function specialValues(it: Interaction): string[] {
  if (it.kind !== "numerique") return [];
  const v = it.answer.value, s: string[] = [];
  if (v === 0) s.push("zéro");
  if (v === 1) s.push("un");
  if (v < 0) s.push("négatif");
  if (!Number.isInteger(v)) s.push("décimal");
  if ((it.answer.tol ?? 0) > 0 || it.answer.decimals !== undefined || it.answer.sigFigs !== undefined) s.push("arrondi");
  return s;
}

/**
 * Physique-chimie : toute réponse numérique porte son unité (`suffix` ou `answer.unit` ; dans un texte à trous, l'unité
 * est écrite dans le gabarit) ; `sigFigs` entier de 1 à 6 ; unité de base proposée parmi les choix et convertible.
 */
export function unitIssues(it: Interaction): string[] {
  const nums: { a: NumAnswer; hasUnit: boolean; where: string }[] = [];
  if (it.kind === "numerique") nums.push({ a: it.answer, hasUnit: !!it.suffix?.trim() || !!it.answer.unit, where: "réponse numérique" });
  if (it.kind === "texte-trous") it.blanks.forEach((b, i) => { if (b.type === "number") nums.push({ a: b.answer, hasUnit: true, where: `trou ${i}` }); });
  const out: string[] = [];
  for (const { a, hasUnit, where } of nums) {
    if (!hasUnit) out.push(`${where} sans unité (suffix ou answer.unit)`);
    if (a.sigFigs !== undefined && !(Number.isInteger(a.sigFigs) && a.sigFigs >= 1 && a.sigFigs <= 6)) out.push(`${where} : sigFigs invalide (${a.sigFigs})`);
    if (a.unit) {
      if (!a.unit.choices.includes(a.unit.base)) out.push(`${where} : unité de base « ${a.unit.base} » absente des choix`);
      for (const u of a.unit.choices) if (convert(1, u, a.unit.base) === null) out.push(`${where} : unité « ${u} » non convertible en ${a.unit.base}`);
    }
  }
  return out;
}

// ───────── Tutoiement : une seule règle pour le test du code source et validate-chapter ─────────
/** « vous / votre / vos » ; impératif en -ez (sauf chez, assez, nez, rez, rez-de-chaussée). */
export const VOUS_RE = /\b(vous|votre|vos)\b/i;
export const IMPERATIF_EZ_RE = /\b(?!(?:chez|assez|nez|rez)\b)[a-zéèêîô]{3,}ez\b(?!-de)/i;
/** Mot de vouvoiement trouvé dans un texte élève, ou null. */
export function vouvoiement(text: string): string | null {
  const t = text.replace(/rez-de-chaussée/gi, "");
  return (t.match(VOUS_RE) ?? t.match(IMPERATIF_EZ_RE))?.[0] ?? null;
}

/** Clés jamais affichées comme texte à l'élève (identifiants, types, motifs de saisie, code SVG, nombres). */
const NOT_TEXT = new Set(["id", "kind", "svg", "match", "objectives", "answer", "irreducible", "niveau", "correct", "error", "url", "sha256", "accessedAt"]);
/** Toutes les chaînes affichables d'une valeur (objet, tableau, chaîne), avec leur chemin. */
export function displayedTexts(value: unknown, path: string, out: { where: string; text: string }[] = []): { where: string; text: string }[] {
  if (typeof value === "string") out.push({ where: path, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => displayedTexts(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) {
    // texte-libre : les réponses acceptées sont affichées dans la correction ; ailleurs `answer` est numérique ou indiciel.
    if (NOT_TEXT.has(k) && !(k === "answer" && Array.isArray(v) && v.every((x) => typeof x === "string"))) continue;
    displayedTexts(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/** Vouvoiement dans des textes élève : un message par champ fautif (« vouvoiement » : problème mineur pour le pipeline). */
export function vouvoiementIssues(texts: { where: string; text: string }[]): { where: string; problem: string }[] {
  return texts.flatMap(({ where, text }) => { const w = vouvoiement(text); return w ? [{ where, problem: `vouvoiement (« ${w} »)` }] : []; });
}

/**
 * Textes élève d'un chapitre hors tirages : titre, prérequis, textes des objectifs (résumé d'exercice) ; cours entier
 * sauf le code SVG (alt et légende compris) ; titre, raisonnement et indices des exercices ; titre, objectif, consignes
 * et configuration des jeux.
 */
export function chapterTexts(c: Pick<ChapterContent, "title" | "prerequisites" | "officialObjectives" | "lesson" | "exercises" | "games">): { where: string; text: string }[] {
  return [
    ...displayedTexts({ title: c.title, prerequisites: c.prerequisites, officialObjectives: c.officialObjectives.map((o) => o.text) }, "chapter"),
    ...displayedTexts(c.lesson, "lesson"),
    ...c.exercises.flatMap((e) => displayedTexts({ title: e.title, reasoning: e.reasoning, hints: e.hints }, e.id)),
    ...c.games.flatMap((g) => displayedTexts({ title: g.title, objective: g.objective, instructions: g.instructions, config: g.config }, g.id)),
  ];
}
/** Textes élève d'un tirage : énoncé, figure, parties (consigne, interaction, diagnostics), correction. */
export function instanceTexts(inst: Pick<ExerciseInstance, "statement" | "figure" | "parts" | "solution">, exerciseId: string): { where: string; text: string }[] {
  return displayedTexts({ statement: inst.statement, figure: inst.figure, parts: inst.parts, solution: inst.solution }, exerciseId);
}
