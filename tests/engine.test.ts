import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { geometry, plot, triangle } from "../src/lib/engine/svg";
import { STATIC_GENERATORS } from "../src/lib/content/registry-static";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise, checkNumber, checkPart } from "../src/lib/engine/check";
import { parseNumber, fr } from "../src/lib/engine/numbers";
import { equivalent, isReducedPolynomial } from "../src/lib/engine/expr";
import { toPublic } from "../src/lib/engine/public";
import type { Difficulty, Interaction } from "../src/lib/engine/types";
import { buildInstance, validateCustom } from "../src/lib/content/custom";
import { perfect } from "../src/lib/engine/solve";

describe("analyse des nombres", () => {
  it("format français", () => {
    expect(parseNumber("3,5")?.value).toBe(3.5);
    expect(parseNumber("-7/4")?.value).toBe(-1.75);
    expect(parseNumber("2,5×10^-3")?.value).toBeCloseTo(0.0025);
    expect(parseNumber("12 000")?.value).toBe(12000);
    expect(parseNumber("5,6.10^-6")?.value).toBeCloseTo(5.6e-6, 12);
    expect(parseNumber("5,6×10⁻⁶")?.value).toBeCloseTo(5.6e-6, 12);
    expect(parseNumber("35 %")?.value).toBe(35);
    expect(parseNumber("12,50 €")?.value).toBe(12.5);
    expect(parseNumber("1,20")?.sigFigs).toBe(3);
    expect(parseNumber("0,0450")?.sigFigs).toBe(3);
    expect(parseNumber("abc")).toBeNull();
    expect(fr(12345.5)).toBe("12\u202f345,5");
  });
  it("fractions exactes et irréductibles", () => {
    const a = { value: 2 / 3, fraction: [2, 3] as [number, number] };
    expect(checkNumber("2/3", undefined, a).ok).toBe(true);
    expect(checkNumber("4/6", undefined, a).partial).toBe(true);
    expect(checkNumber("0,67", undefined, a).ok).toBe(false);
    expect(checkNumber("0,67", undefined, a).feedback[0]).toMatch(/approchée/);
    expect(checkNumber("1,5", undefined, { value: 1.5, fraction: [3, 2] }).ok).toBe(true);
  });
  it("unités et chiffres significatifs", () => {
    const a = { value: 0.25, unit: { base: "A", choices: ["A", "mA"] } };
    expect(checkNumber("250", "mA", a).ok).toBe(true);
    expect(checkNumber("250", "A", a).feedback.join()).toMatch(/correcte en mA/);
    const s = { value: 0.123456, sigFigs: 3 };
    expect(checkNumber("0,123", undefined, s).ok).toBe(true);
    expect(checkNumber("0,12", undefined, s).partial).toBe(true);
    expect(checkNumber("-3", undefined, { value: 3 }).feedback[0]).toMatch(/signe/);
  });
});

describe("expressions algébriques", () => {
  it("équivalence", () => {
    expect(equivalent("5x-2", "(5)*x^1 + (-2)*x^0")).toBe(true);
    expect(equivalent("2(x+1)", "2x+2")).toBe(true);
    expect(equivalent("x²+2x+1", "(x+1)^2")).toBe(true);
    expect(equivalent("2x+3", "2x+2")).toBe(false);
    expect(equivalent("2y", "2x")).toBe(false);
  });
  it("forme réduite", () => {
    expect(isReducedPolynomial("5x - 2")).toBe(true);
    expect(isReducedPolynomial("3x + 2x - 2")).toBe(false);
    expect(isReducedPolynomial("(x+1)^2")).toBe(false);
    expect(isReducedPolynomial("4x^2 - 12x + 9")).toBe(true);
    const r = checkPart({ kind: "expression", variable: "x", answer: "5x-2", form: "reduite" }, "3x+2x-2");
    expect(r.status).toBe("partiel");
  });
  it("primitive vérifiée par dérivation", () => {
    const it0: Interaction = { kind: "expression", variable: "x", answer: "3x^2+2", primitive: true };
    expect(checkPart(it0, "x^3+2x").status).toBe("correct");
    expect(checkPart(it0, "x^3+2x+7").status).toBe("correct");
    expect(checkPart(it0, "x^3").status).toBe("faux");
  });
});

describe("tous les générateurs", () => {
  it("au moins 10 exercices par matière", () => {
    expect(STATIC_GENERATORS.filter((g) => g.meta.subject === "maths").length).toBeGreaterThanOrEqual(10);
    expect(STATIC_GENERATORS.filter((g) => g.meta.subject === "pc").length).toBeGreaterThanOrEqual(10);
    expect(new Set(STATIC_GENERATORS.map((g) => g.meta.id)).size).toBe(STATIC_GENERATORS.length);
  });
  for (const g of STATIC_GENERATORS) {
    it(`${g.meta.id} : déterministe, sans fuite de réponse, réponse parfaite = 100 %`, () => {
      for (const d of [1, 2, 3] as Difficulty[]) {
        for (let k = 0; k < 60; k++) {
          const seed = `t${k}`;
          const inst = g.generate(createRng(seed), d);
          const again = g.generate(createRng(seed), d);
          expect(JSON.stringify(again)).toBe(JSON.stringify(inst));
          const pub = JSON.stringify(toPublic(inst));
          expect(pub).not.toContain('"answer"');
          expect(inst.statement).not.toMatch(/NaN|undefined|Infinity/);
          expect(pub).not.toMatch(/NaN|undefined/);
          inst.solution.forEach((s) => expect(s).not.toMatch(/NaN|undefined/));
          const responses = inst.parts.map((p) => perfect(p.interaction));
          inst.parts.forEach((p, i) => {
            if (p.interaction.kind === "expression" && p.interaction.primitive) responses[i] = "__skip";
          });
          const res = checkExercise(inst, responses);
          res.parts.forEach((r, i) => {
            if (responses[i] === "__skip") return;
            if (r.status !== "correct") throw new Error(`${g.meta.id} d=${d} seed=${seed} partie ${i}: ${r.status} ${r.feedback.join(" | ")} ${JSON.stringify(inst.parts[i].interaction)} resp=${JSON.stringify(responses[i])}`);
          });
          // une réponse vide n'est jamais correcte
          const empty = checkExercise(inst, inst.parts.map(() => undefined));
          expect(empty.score).toBeLessThan(1);
        }
      }
    });
  }
});

describe("exercices enseignants paramétrés", () => {
  it("interpolation et correction", () => {
    const raw = {
      statement: "Calculer $ {a} \\times {b} $ puis {{a+b}}.",
      variables: [{ name: "a", min: 2, max: 9 }, { name: "b", min: 2, max: 9 }],
      parts: [{ kind: "numerique", answerExpr: "a*b" }, { kind: "expression", variable: "x", answer: "a*x+b" }],
      solution: ["$ {a} \\times {b} = {{a*b}} $"],
    };
    const v = validateCustom(raw);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const inst = buildInstance(v.schema, createRng("z"));
    expect(inst.statement).not.toMatch(/\{/);
    const it0 = inst.parts[0].interaction as Extract<Interaction, { kind: "numerique" }>;
    expect(checkPart(it0, { value: String(it0.answer.value) }).status).toBe("correct");
  });
  it("rejette un schéma incohérent", () => {
    expect(validateCustom({ statement: "x", parts: [{ kind: "qcm", options: ["a", "b"], correct: [5] }] }).ok).toBe(false);
  });
});

describe("figures : geometry() (Thalès, triangles semblables) ; triangle() et plot() inchangés", () => {
  const sha = (s: string) => createHash("sha256").update(s).digest("hex");
  // Papillon : (MN) // (BC), droites (BM) et (CN) sécantes en A.
  const papillon = () => geometry({
    points: { A: [0, 0], B: [4, 2], C: [4, -1], M: [-2, -1], N: [-2, 0.5] },
    segments: [{ from: "M", to: "B", line: true }, { from: "N", to: "C", line: true }, { from: "M", to: "N", parallel: 1, label: "MN" }, { from: "B", to: "C", parallel: 1, label: "6 cm" }],
    angles: [{ at: "A", from: "B", to: "C", marks: 2 }],
    title: "Configuration papillon",
  });
  it("sortie SVG complète : points nommés, chevrons de parallélisme, arcs d'angle, étiquettes", () => {
    const svg = papillon();
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('aria-label="Configuration papillon"');
    for (const n of ["A", "B", "C", "M", "N"]) expect(svg).toMatch(new RegExp(`>${n}</text>`));
    expect(svg.match(/<polyline/g)).toHaveLength(2);
    expect(svg.match(/<path d="M [^"]+ A 2[05] /g)).toHaveLength(2);
    expect(svg).toContain(">6 cm</text>");
    expect(svg).toBe(papillon());
  });
  it("mise à l'échelle : toutes les coordonnées restent dans le cadre, quelle que soit l'unité", () => {
    for (const k of [0.01, 1, 1000]) {
      const svg = geometry({ points: { A: [0, 0], B: [5 * k, 0], C: [0, 3 * k] }, segments: [{ from: "A", to: "B", line: true }, { from: "B", to: "C" }, { from: "C", to: "A" }], title: "t" });
      const nums = [...svg.matchAll(/(?:x1|y1|x2|y2|cx|cy)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
      expect(Math.min(...nums)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...nums)).toBeLessThanOrEqual(360);
    }
  });
  it("nom de point inconnu → erreur ; étiquettes échappées", () => {
    expect(() => geometry({ points: { A: [0, 0] }, segments: [{ from: "A", to: "Z" }], title: "t" })).toThrow(/point « Z » absent/);
    expect(geometry({ points: { A: [0, 0], B: [1, 0] }, segments: [{ from: "A", to: "B", label: "x < 3" }], title: "t" })).toContain("x &lt; 3");
  });
  it("triangle() et plot() : sortie identique octet pour octet à celle d'avant geometry()", () => {
    expect(sha(triangle({ pts: [[0, 0], [4, 0], [0, 3]], names: ["A", "B", "C"], rightAngleAt: 0, sideLabels: ["4", "5", null], angleLabel: { at: 1, text: "α" }, title: "t" }))).toBe("fc8f79f5d61371618018e559efe612678c5e369906b96f3d0593b1cb0862e3fd");
    expect(sha(plot({ xmin: -3, xmax: 3, ymin: -2, ymax: 5, fns: [{ f: (x) => x * x, label: "f" }], points: [{ x: 1, y: 1, label: "P" }], title: "p" }))).toBe("5ea3e3325bd50f164b0d657d2634591daa6a8da791b7232426bfb348119e4f20");
  });
});
