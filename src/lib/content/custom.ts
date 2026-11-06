// Exercices rédigés par les enseignants : schéma JSON paramétrable, transformé en Generator.
import { evaluate } from "mathjs";
import { z } from "zod";
import type { ExerciseInstance, Generator, Interaction, InteractionKind, LevelId, Part, Rng, Subject } from "../engine/types";
import { fr, roundTo, tex } from "../engine/numbers";
import { createRng, shuffleWithIndex } from "../engine/rng";

export const customPartSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("qcm"), prompt: z.string().optional(), options: z.array(z.string().min(1)).min(2), correct: z.array(z.number().int().min(0)).min(1), multiple: z.boolean().optional() }),
  z.object({ kind: z.literal("vrai-faux"), prompt: z.string().optional(), items: z.array(z.string().min(1)).min(1), answers: z.array(z.boolean()) }),
  z.object({ kind: z.literal("numerique"), prompt: z.string().optional(), label: z.string().optional(), answerExpr: z.string().min(1), tol: z.number().min(0).optional(), suffix: z.string().optional(), sigFigs: z.number().int().min(1).max(6).optional() }),
  z.object({ kind: z.literal("expression"), prompt: z.string().optional(), label: z.string().optional(), variable: z.string().min(1).max(3), answer: z.string().min(1), form: z.enum(["reduite", "developpee"]).optional() }),
  z.object({ kind: z.literal("texte-libre"), prompt: z.string().optional(), label: z.string().optional(), answers: z.array(z.string().min(1)).min(1) }),
  z.object({ kind: z.literal("ordonner"), prompt: z.string().optional(), items: z.array(z.string().min(1)).min(2) }),
  z.object({ kind: z.literal("associer"), prompt: z.string().optional(), pairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(2) }),
  z.object({ kind: z.literal("classer"), prompt: z.string().optional(), categories: z.array(z.string().min(1)).min(2), items: z.array(z.object({ text: z.string().min(1), category: z.number().int().min(0) })).min(2) }),
]);

export const customSchema = z.object({
  statement: z.string().min(1),
  variables: z.array(z.object({ name: z.string().regex(/^[a-z]\w*$/i), min: z.number(), max: z.number(), step: z.number().positive().optional(), nonZero: z.boolean().optional() })).default([]),
  figure: z.object({ kind: z.enum(["image", "video"]), src: z.string().min(1), alt: z.string().optional(), caption: z.string().optional() }).optional(),
  parts: z.array(customPartSchema).min(1),
  solution: z.array(z.string()).default([]),
  rappel: z.string().optional(),
});
export type CustomSchema = z.infer<typeof customSchema>;

export interface CustomRecord {
  id: string; subject: string; level: string; chapterId: string; notionId: string; title: string; summary: string; difficulty: number; schema: unknown;
}

type Scope = Record<string, number>;

function drawVariables(rng: Rng, vars: CustomSchema["variables"]): Scope {
  const scope: Scope = {};
  for (const v of vars) {
    const step = v.step ?? 1;
    const count = Math.max(0, Math.floor((v.max - v.min) / step + 1e-9));
    let val = 0, guard = 0;
    do { val = roundTo(v.min + rng.int(0, count) * step, 6); } while (v.nonZero && val === 0 && guard++ < 50);
    scope[v.name] = val;
  }
  return scope;
}

/** Remplace {{expression}} par sa valeur (format LaTeX dans $…$, format texte ailleurs) et {a} par la variable. */
export function interpolate(s: string, scope: Scope): string {
  const out = s.replace(/\{\{(.+?)\}\}|\{([a-zA-Z]\w*)\}/g, (m, expr: string | undefined, name: string | undefined, offset: number) => {
    const inMath = (s.slice(0, offset).match(/\$/g)?.length ?? 0) % 2 === 1;
    let v: unknown;
    try { v = expr ? evaluate(expr, { ...scope }) : name! in scope ? scope[name!] : undefined; } catch { return m; }
    if (typeof v !== "number") return m;
    return inMath ? tex(v) : fr(v);
  });
  return out;
}

export function evalExpr(expr: string, scope: Scope): number {
  const v = evaluate(expr.replace(/,/g, "."), { ...scope });
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`Expression de réponse invalide : ${expr}`);
  return v;
}

function substituteVars(expr: string, scope: Scope, variable: string) {
  // remplace les paramètres par leur valeur dans une expression attendue (la variable reste libre)
  return expr.replace(/\b([a-zA-Z]\w*)\b/g, (m) => (m !== variable && m in scope ? `(${scope[m]})` : m));
}

export function buildInstance(schema: CustomSchema, rng: Rng): ExerciseInstance {
  const scope = drawVariables(rng, schema.variables);
  const I = (s: string) => interpolate(s, scope);
  const parts: Part[] = schema.parts.map((p) => {
    let it: Interaction;
    switch (p.kind) {
      case "qcm": {
        const sh = shuffleWithIndex(rng, p.options.map(I));
        it = { kind: "qcm", options: sh.shuffled, multiple: p.multiple || p.correct.length > 1, answer: p.correct.map((c) => sh.indexOf(c)) };
        break;
      }
      case "vrai-faux":
        it = { kind: "vrai-faux", items: p.items.map(I), answer: p.answers };
        break;
      case "numerique":
        it = { kind: "numerique", label: p.label ? I(p.label) : undefined, suffix: p.suffix, answer: { value: evalExpr(p.answerExpr, scope), tol: p.tol, sigFigs: p.sigFigs } };
        break;
      case "expression":
        it = { kind: "expression", label: p.label, variable: p.variable, answer: substituteVars(p.answer, scope, p.variable), form: p.form };
        break;
      case "texte-libre":
        it = { kind: "texte-libre", label: p.label, answer: p.answers.map(I) };
        break;
      case "ordonner": {
        const sh = shuffleWithIndex(rng, p.items.map(I));
        it = { kind: "ordonner", items: sh.shuffled, answer: p.items.map((_, i) => sh.indexOf(i)) };
        break;
      }
      case "associer": {
        const sh = shuffleWithIndex(rng, p.pairs.map((x) => I(x[1])));
        it = { kind: "associer", left: p.pairs.map((x) => I(x[0])), right: sh.shuffled, answer: p.pairs.map((_, i) => sh.indexOf(i)) };
        break;
      }
      case "classer": {
        const items = rng.shuffle(p.items);
        it = { kind: "classer", categories: p.categories.map(I), items: items.map((x) => I(x.text)), answer: items.map((x) => x.category) };
        break;
      }
    }
    return { prompt: p.prompt ? I(p.prompt) : undefined, interaction: it };
  });
  return {
    statement: I(schema.statement),
    figure: schema.figure ? (schema.figure.kind === "image" ? { kind: "image", src: schema.figure.src, alt: schema.figure.alt ?? "Illustration", caption: schema.figure.caption } : { kind: "video", src: schema.figure.src, caption: schema.figure.caption }) : undefined,
    parts,
    solution: schema.solution.map(I),
    rappel: schema.rappel ? I(schema.rappel) : undefined,
  };
}

export function customToGenerator(r: CustomRecord): Generator {
  const schema = customSchema.parse(r.schema);
  return {
    meta: {
      id: `perso-${r.id}`, title: r.title, subject: r.subject as Subject, level: r.level as LevelId, chapterId: r.chapterId, notionId: r.notionId,
      kinds: [...new Set(schema.parts.map((p) => p.kind))] as InteractionKind[], summary: r.summary || "Exercice proposé par un enseignant.",
      randomized: schema.variables.length ? "valeurs" : "banque",
    },
    generate: (rng) => buildInstance(schema, rng),
  };
}

/** Vérifie qu'un schéma produit des instances valides (utilisé par l'éditeur avant enregistrement). */
export function validateCustom(raw: unknown): { ok: true; schema: CustomSchema } | { ok: false; errors: string[] } {
  const parsed = customSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")} : ${i.message}`) };
  const s = parsed.data;
  const errors: string[] = [];
  s.parts.forEach((p, i) => {
    if (p.kind === "qcm" && p.correct.some((c) => c >= p.options.length)) errors.push(`Partie ${i + 1} : indice de bonne réponse hors limites.`);
    if (p.kind === "vrai-faux" && p.answers.length !== p.items.length) errors.push(`Partie ${i + 1} : chaque affirmation doit avoir une réponse.`);
    if (p.kind === "classer" && p.items.some((x) => x.category >= p.categories.length)) errors.push(`Partie ${i + 1} : catégorie inexistante.`);
  });
  // essai de génération avec plusieurs tirages
  try {
    for (let k = 0; k < 5; k++) {
      buildInstance(s, createRng("validation-" + k));
    }
  } catch (e) {
    errors.push((e as Error).message);
  }
  return errors.length ? { ok: false, errors } : { ok: true, schema: s };
}
