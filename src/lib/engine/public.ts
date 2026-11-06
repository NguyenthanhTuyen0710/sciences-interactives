// Version « publique » d'un exercice : aucune réponse n'est envoyée au navigateur.
// La correction est faite côté serveur en régénérant l'exercice depuis sa graine.
import type { ExerciseInstance, Figure, Interaction } from "./types";

export type PublicBlank = { type: "select"; options: string[] } | { type: "number"; width?: number } | { type: "text"; width?: number };

export type PublicInteraction =
  | { kind: "qcm"; options: string[]; multiple?: boolean }
  | { kind: "vrai-faux"; items: string[] }
  | { kind: "numerique"; label?: string; suffix?: string; units?: string[] }
  | { kind: "expression"; label?: string; variable: string }
  | { kind: "texte-libre"; label?: string }
  | { kind: "texte-trous"; template: string; blanks: PublicBlank[] }
  | { kind: "glisser-deposer"; zones: string[]; tokens: string[] }
  | { kind: "associer"; left: string[]; right: string[] }
  | { kind: "classer"; categories: string[]; items: string[] }
  | { kind: "ordonner"; items: string[]; hint?: string }
  | { kind: "repere"; xmin: number; xmax: number; ymin: number; ymax: number; step: number; curves?: string[]; labels: string[] }
  | { kind: "tableau"; headers: string[]; rows: { label: string; cells: (string | { input: true })[] }[] }
  | { kind: "etapes"; steps: { prompt: string; suffix?: string }[] }
  | { kind: "demonstration"; steps: string[]; options: string[] };

export interface PublicExercise {
  statement: string;
  figure?: Figure;
  parts: { prompt?: string; interaction: PublicInteraction }[];
}

export function toPublicInteraction(it: Interaction): PublicInteraction {
  switch (it.kind) {
    case "qcm":
      return { kind: it.kind, options: it.options, multiple: it.multiple };
    case "vrai-faux":
      return { kind: it.kind, items: it.items };
    case "numerique":
      return { kind: it.kind, label: it.label, suffix: it.suffix, units: it.answer.unit?.choices };
    case "expression":
      return { kind: it.kind, label: it.label, variable: it.variable };
    case "texte-libre":
      return { kind: it.kind, label: it.label };
    case "texte-trous":
      return {
        kind: it.kind,
        template: it.template,
        blanks: it.blanks.map((b) => (b.type === "select" ? { type: "select", options: b.options } : { type: b.type, width: b.width })),
      };
    case "glisser-deposer":
      return { kind: it.kind, zones: it.zones, tokens: it.tokens };
    case "associer":
      return { kind: it.kind, left: it.left, right: it.right };
    case "classer":
      return { kind: it.kind, categories: it.categories, items: it.items };
    case "ordonner":
      return { kind: it.kind, items: it.items, hint: it.hint };
    case "repere":
      return { kind: it.kind, xmin: it.xmin, xmax: it.xmax, ymin: it.ymin, ymax: it.ymax, step: it.step, curves: it.curves, labels: it.points.map((p) => p.label) };
    case "tableau":
      return { kind: it.kind, headers: it.headers, rows: it.rows.map((r) => ({ label: r.label, cells: r.cells.map((c) => (typeof c === "string" ? c : { input: true as const })) })) };
    case "etapes":
      return { kind: it.kind, steps: it.steps.map((s) => ({ prompt: s.prompt, suffix: s.suffix })) };
    case "demonstration":
      return { kind: it.kind, steps: it.steps, options: it.justifications.options };
  }
}

export function toPublic(inst: ExerciseInstance): PublicExercise {
  return {
    statement: inst.statement,
    figure: inst.figure,
    parts: inst.parts.map((p) => ({ prompt: p.prompt, interaction: toPublicInteraction(p.interaction) })),
  };
}
