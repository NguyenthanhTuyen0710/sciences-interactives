// Cohérence des diagnostics d'erreurs fréquentes et des distracteurs d'une partie d'exercice.
// Partagé par scripts/validate-chapter.ts et tests/chapter-suite.ts : une seule définition des règles.
import { checkPart, matchesMistake } from "./check";
import { nearlyEqual, parseNumber } from "./numbers";
import type { Interaction, Mistake } from "./types";

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
