// Règles de cohérence des diagnostics (src/lib/engine/diagnostics.ts) et non-régression py3-12 (Pythagore 3e).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { diagnosticIssues, sameValue, specialValues } from "../src/lib/engine/diagnostics";
import { createRng } from "../src/lib/engine/rng";
import { perfect } from "../src/lib/engine/solve";
import type { Interaction } from "../src/lib/engine/types";
import { math3ePythagore } from "../src/lib/chapters/data/math-3e-pythagore";
import { math3ePourcentagesEvolution } from "../src/lib/chapters/data/math-3e-pourcentages-evolution";
import { exerciseGenerator } from "../src/lib/chapters";

const numInt = (value: number, extra: object = {}): Interaction => ({ kind: "numerique", answer: { value, ...extra } }) as Interaction;
const issues = (it: Interaction, matches: string[]) => diagnosticIssues(it, matches.map((match) => ({ match, feedback: "…" })), perfect(it));

describe("diagnostics : règles", () => {
  it("diagnostic égal à la bonne réponse", () => {
    expect(issues(numInt(1), ["1"])[0]).toMatch(/égal à la bonne réponse/);
  });
  it("diagnostic accepté par le correcteur après normalisation (tolérance d'arrondi)", () => {
    expect(issues(numInt(2.236, { tol: 0.005 }), ["2,24"])[0]).toMatch(/accepté comme bonne réponse/);
  });
  it("deux diagnostics équivalents (fraction / décimal / écriture française)", () => {
    expect(sameValue("0,5", "1/2")).toBe(true);
    expect(sameValue("15.5", "15,5")).toBe(true);
    expect(issues(numInt(3), ["0,5", "1/2"])).toEqual([expect.stringMatching(/équivalents/)]);
  });
  it("options de QCM équivalentes", () => {
    const qcm = { kind: "qcm", options: ["0,5", "1/2", "2"], answer: [2] } as unknown as Interaction;
    expect(diagnosticIssues(qcm, [], perfect(qcm))).toEqual([expect.stringMatching(/options de QCM équivalentes/)]);
  });
  it("cas sain : aucun problème", () => {
    expect(issues(numInt(13), ["17", "169"])).toEqual([]);
  });
  it("valeurs particulières repérées", () => {
    expect(specialValues(numInt(0))).toContain("zéro");
    expect(specialValues(numInt(-0.5, { tol: 0.05 }))).toEqual(["négatif", "décimal", "arrondi"]);
  });
});

describe("non-régression py3-12 : triplet (3, 4, 5) × 2 → BC = 1 et BC² = 1", () => {
  const e = math3ePythagore.exercises.find((x) => x.id === "py3-12")!;
  // Recherche d'un tirage BC = 1 (AB, AC = 0,6 et 0,8 m) sans dépendre d'une graine précise.
  const body = Array.from({ length: 400 }, (_, k) => e.vary!(createRng(`r${k}`))).find(
    (b) => (b.parts[0].interaction as { answer: { value: number } }).answer.value === 1,
  );
  it("le cas BC = 1 est bien tiré", () => expect(body).toBeDefined());
  it("le diagnostic « tu as donné BC² » n'est pas proposé quand BC² = BC", () => {
    const p = body!.parts[0];
    expect((p.mistakes ?? []).map((m) => m.match)).not.toContain("1");
    expect(diagnosticIssues(p.interaction, p.mistakes, perfect(p.interaction))).toEqual([]);
  });
});

describe("non-régression pct3 : diagnostics de même valeur retirés (paires exercice/graine relevées le 2026-11-08)", () => {
  const cases: [string, string, number][] = [["pct3-07", "v3", 0], ["pct3-07", "v8", 0], ["pct3-07", "v301", 0], ["pct3-07", "v395", 0], ["pct3-07", "v419", 0], ["pct3-10", "v419", 0], ["pct3-20", "v397", 1]];
  for (const [id, seed, part] of cases) {
    it(`${id} graine ${seed} partie ${part}`, () => {
      const e = math3ePourcentagesEvolution.exercises.find((x) => x.id === id)!;
      const p = exerciseGenerator(math3ePourcentagesEvolution, e).generate(createRng(seed), 1).parts[part];
      expect(diagnosticIssues(p.interaction, p.mistakes, perfect(p.interaction), part)).toEqual([]);
    });
  }
});

describe("Pythagore : position de l'angle droit (C3) et accords (C4)", () => {
  const ids = ["py3-01", "py3-02", "py3-05", "py3-06", "py3-07", "py3-09", "py3-10", "py3-12", "py3-17", "py3-18"];
  for (const id of ids) {
    it(`${id} : l'angle droit occupe au moins deux positions du nom du triangle`, () => {
      const e = math3ePythagore.exercises.find((x) => x.id === id)!;
      const g = exerciseGenerator(math3ePythagore, e);
      const pos = new Set<number>();
      for (let k = 0; k < 300; k++) {
        const m = /\$([A-Z]{3})\$ (?:est )?rectangle en \$([A-Z])\$/.exec(g.generate(createRng(`p${k}`), 1).statement);
        if (m) pos.add(m[1].indexOf(m[2]));
      }
      expect(pos.size, `${id} : positions ${[...pos].join(",")}`).toBeGreaterThanOrEqual(2);
    });
  }
  it("« hypoténuse » est féminin dans les questions", () => {
    expect(JSON.stringify(math3ePythagore)).not.toMatch(/Quel est (l'|son )hypoténuse/);
  });
});

describe("taxonomie G3 Pythagore (research/curriculum/mathematiques/taxonomy/math-3e-pythagore.json)", () => {
  const tax = JSON.parse(readFileSync("research/curriculum/mathematiques/taxonomy/math-3e-pythagore.json", "utf8"));
  const COMPETENCES = ["Chercher", "Modéliser", "Représenter", "Raisonner", "Calculer", "Communiquer"];
  const ids = new Set(math3ePythagore.exercises.map((e) => e.id));
  const objectives = new Set(math3ePythagore.officialObjectives.map((o) => o.id));
  it("types complets, compétences officielles, objectifs du chapitre, variantes structurelles", () => {
    for (const t of tax.types) {
      expect(t.id).toMatch(/^PY-T\d{2}$/);
      for (const c of t.competences) expect(COMPETENCES, t.id).toContain(c);
      for (const o of t.objectives) expect(objectives.has(o), `${t.id} : ${o}`).toBe(true);
      for (const k of ["method", "commonMistakes", "variants", "prerequisites", "difficulty"]) expect(t[k], `${t.id}.${k}`).toBeTruthy();
      expect(t.variants.length, t.id).toBeGreaterThanOrEqual(2);
    }
  });
  it("chaque exercice du chapitre relève d'au moins un type, et inversement", () => {
    const mapped = new Set(tax.types.flatMap((t: { exercises: string[] }) => t.exercises));
    expect([...ids].filter((i) => !mapped.has(i))).toEqual([]);
    expect([...mapped].filter((i) => !ids.has(i as string))).toEqual([]);
  });
});
