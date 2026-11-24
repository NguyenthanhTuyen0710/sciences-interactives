// Contrôle par résolution indépendante (scripts/solve-check.ts, décisions 31-32) : reproduit les trois BLOQUANT
// d'équations passés sous validate-chapter (eq3-02, eq3-27, eq3-30), puis vérifie le chapitre corrigé.
import { describe, expect, it } from "vitest";
import { equationsIn, solveCheckIssues, solveEquation, texToExpr } from "../scripts/solve-check";
import { ALL_CHAPTERS, exerciseGenerator } from "../src/lib/chapters";
import type { ChapterPart, ExerciseBody, SolveCheck } from "../src/lib/chapters/schema";
import type { Blank, Rng } from "../src/lib/engine/types";
import { createRng } from "../src/lib/engine/rng";

// Constructeurs identiques à ceux du chapitre (math-3e-equations.ts), sans diagnostics.
const nb = (value: number): Blank => ({ type: "number", answer: { value } });
const tt = (template: string, blanks: Blank[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "texte-trous", template, blanks } });
const num = (value: number, prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } } });
const qcm = (options: string[], answer: number, prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] } });
const vf = (items: string[], answer: boolean[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "vrai-faux", items, answer } });
const steps = (list: [string, number][], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "etapes", steps: list.map(([p, v]) => ({ prompt: p, answer: { value: v } })) } });

// Générateurs fautifs, recopiés de l'historique (eq3-02 et eq3-27 : avant 6ea35b4 ; eq3-30 : 6ea35b4, avant 8465b2c).
const OLD: Record<string, { vary: (rng: Rng) => ExerciseBody; check: SolveCheck[] }> = {
  "eq3-02": {
    check: [{ equation: "statement", answer: 0 }],
    vary: (rng) => {
      const a = rng.int(2, 5), c = rng.int(1, 4), s = rng.int(2, 8), b = rng.int(1, 6), d = (a - c) * s + b;
      const opts = rng.shuffle([s, s + 1, s - 1, s + 2]);
      return { statement: `Quel nombre est solution de $${a}x + ${b} = ${c}x + ${d}$ ?`, parts: [qcm(opts.map((v) => `$${v}$`), opts.indexOf(s))], solution: [] };
    },
  },
  "eq3-27": {
    check: [{ equation: 0, answer: 1 }],
    vary: (rng) => {
      const a = rng.int(2, 4), b = a + rng.int(1, 3), f = rng.int(6, 20), s = rng.int(5, 15), g = (b - a) * s + f;
      return {
        statement: `Forfait A : $${a}$ € par séance. Forfait B : $${b}$ € par séance, avec $${g}$ € de moins… Plus précisément, le forfait A coûte $${a}x + ${g}$ € et le forfait B coûte $${b}x$ € pour $x$ séances.`,
        parts: [tt(`1. Équation : [[0]] $x + ${g} = ${b}x$`, [nb(a)]), num(g / (b - a), "2. Nombre de séances pour lequel les prix sont égaux (en séances)"), vf([`Pour $${s + 1}$ séances, le forfait A est plus avantageux.`], [false], "3. Vrai ou faux ?")].map((p, i) => (i === 1 ? num(s) : p)),
        solution: [],
      };
    },
  },
  "eq3-30": {
    check: [{ equation: 0, answer: 1 }],
    vary: (rng) => {
      const k = rng.int(2, 5), s = rng.int(2, 9), c = rng.int(1, 5), v = k * s - c * s;
      return {
        statement: `Programme A : choisir un nombre, le multiplier par $${k}$. Programme B : choisir un nombre, le multiplier par $${c}$ puis ajouter $${v}$. Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ?`,
        parts: [tt(`1. Équation : $${k}x =$ [[0]] $x + ${v}$`, [nb(c)]), num(s, "2. Valeur de $x$"), steps([[`Résultat des deux programmes pour $x = ${s}$`, k * s]], "3. Vérifie.")],
        solution: [],
      };
    },
  },
};

/** Rng scripté : `int` rend les valeurs données dans l'ordre, `shuffle` garde l'ordre. */
const scripted = (ints: number[]): Rng => ({ next: () => 0, int: () => ints.shift()!, pick: (a) => a[0], shuffle: (a) => [...a], sign: () => 1 });
const failures = (id: string, seeds = 500) => {
  let n = 0;
  for (let k = 0; k < seeds; k++) if (solveCheckIssues(OLD[id].vary(createRng(`v${k}`)), OLD[id].check).length) n++;
  return n;
};

describe("contrôle par résolution : résolution d'une équation lue dans le texte", () => {
  it("convertit le LaTeX courant et ignore les commandes inconnues", () => {
    expect(texToExpr("\\dfrac{3}{4}x")).toBe("((3)/(4))x");
    expect(texToExpr("3x(x - 7)")).toBe("3x*(x - 7)");
    expect(texToExpr("(x + 2)\\big[(x - 1) - 4\\big]")).toBe("(x + 2)((x - 1) - 4)");
    expect(texToExpr("x \\neq 2")).toBeNull();
  });
  it("résout identité, contradiction, premier et second degré ; refuse le reste", () => {
    expect(solveEquation("3x + 2", "3x + 2")).toBe("all");
    expect(solveEquation("x + 1", "x + 2")).toEqual([]);
    expect(solveEquation("4x + 6", "2")).toEqual([-1]);
    expect(solveEquation("x^2", "16")).toEqual([-4, 4]);
    expect(solveEquation("x^2", "-4")).toEqual([]);
    expect(solveEquation("(x + 3)^2", "0")).toEqual([-3]);
    expect(solveEquation("x^3", "8")).toBeNull();
  });
  it("relie segments $…$ et trous remplis ; ignore les égalités à d'autres lettres", () => {
    expect(equationsIn("1. Équation : $5x =$ [[0]] $x + 12$", () => "2").map((e) => e.tex)).toEqual(["5x = 2 x + 12"]);
    expect(equationsIn("Factorise avec $a^{2} - b^{2} = (a - b)(a + b)$ : $x^{2} - 9 = 0$").map((e) => e.tex)).toEqual(["x^{2} - 9 = 0"]);
    expect(equationsIn("$x + 3 = 5$ donne $x = 2$").length).toBe(2);
  });
  it("signale un distracteur de QCM équivalent à l'équation correcte", () => {
    const body: ExerciseBody = { statement: "", parts: [qcm(["$2x + 4 = 10$", "$x + 2 = 5$", "$2x = 10$"], 0), num(3)], solution: [] };
    expect(solveCheckIssues(body, [{ equation: 0, answer: 1 }])).toEqual([expect.stringContaining("distracteur 1")]);
  });
  it("signale une source sans équation (contrôle mal déclaré)", () => {
    const body: ExerciseBody = { statement: "Pas d'équation ici.", parts: [num(3)], solution: [] };
    expect(solveCheckIssues(body, [{ equation: "statement", answer: 0 }])[0]).toMatch(/aucune équation/);
  });
});

describe("contrôle par résolution : les trois BLOQUANT d'équations sont reproduits", () => {
  it("eq3-02 : a = c rend l'équation identique, toutes les options sont solutions", () => {
    const body = OLD["eq3-02"].vary(scripted([3, 3, 5, 2]));
    expect(body.statement).toContain("3x + 2 = 3x + 2");
    expect(solveCheckIssues(body, OLD["eq3-02"].check)).toEqual([expect.stringMatching(/tout réel \(identité\).*options solutions 0, 1, 2, 3, options attendues 0/)]);
    expect(failures("eq3-02")).toBeGreaterThan(0);
  });
  it("eq3-27 : réponse attendue s au lieu de s + f/(b − a)", () => {
    const body = OLD["eq3-27"].vary(scripted([2, 1, 6, 10])); // a = 2, b = 3, f = 6, s = 10, g = 16
    expect(solveCheckIssues(body, OLD["eq3-27"].check)).toEqual([expect.stringContaining("a pour solutions {16}, réponse attendue (partie 1) {10}")]);
    expect(failures("eq3-27")).toBe(500); // toujours faux (f ≥ 6)
  });
  it("eq3-30 : c = k rend l'équation identique (v = 0)", () => {
    const body = OLD["eq3-30"].vary(scripted([4, 7, 4]));
    expect(solveCheckIssues(body, OLD["eq3-30"].check)).toEqual([expect.stringContaining("tout réel (identité)")]);
    expect(failures("eq3-30")).toBeGreaterThan(0);
  });
  it("chapitre corrigé : 0 échec sur 300 tirages par exercice déclaré", () => {
    const c = ALL_CHAPTERS.find((x) => x.id === "math-3e-equations")!;
    const bad: string[] = [];
    for (const e of c.exercises.filter((x) => x.solveCheck)) {
      const g = exerciseGenerator(c, e);
      for (let k = 0; k < (e.vary ? 300 : 1); k++) for (const p of solveCheckIssues(g.generate(createRng(`v${k}`), 1), e.solveCheck!)) bad.push(`${e.id} v${k} : ${p}`);
    }
    expect(bad.slice(0, 5)).toEqual([]);
  });
});
