import { describe, expect, it } from "vitest";
import { ALL_CHAPTERS, exerciseGenerator } from "../src/lib/chapters";
import { ChapterSchema, doneIssues } from "../src/lib/chapters/schema";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise, matchesMistake } from "../src/lib/engine/check";
import { perfect } from "../src/lib/engine/solve";
import { toPublic } from "../src/lib/engine/public";
import { adapt, calcFeedback, calcQuestion, lineFeedback, lineRound, parseRel, type CalcLevel, type LineLevel } from "../src/lib/games/logic";

describe("logique des jeux", () => {
  it("analyse des relatifs saisis", () => {
    expect(parseRel("-3")).toBe(-3);
    expect(parseRel("−3")).toBe(-3);
    expect(parseRel("(+2,5)")).toBe(2.5);
    expect(parseRel("3-")).toBeNull();
    expect(parseRel("")).toBeNull();
  });
  it("adaptation : 3 réussites montent, 2 erreurs descendent, bornes respectées", () => {
    let s = { level: 1, streak: 0, misses: 0 };
    for (let i = 0; i < 3; i++) s = adapt(s, true, 3);
    expect(s.level).toBe(2);
    s = adapt(adapt(s, false, 3), false, 3);
    expect(s.level).toBe(1);
    s = adapt(adapt(s, false, 3), false, 3);
    expect(s.level).toBe(1);
    let t = { level: 3, streak: 0, misses: 0 };
    for (let i = 0; i < 6; i++) t = adapt(t, true, 3);
    expect(t.level).toBe(3);
  });
  it("diagnostics du calcul mental", () => {
    const q = { a: 3, b: -5, op: "-" as const, answer: 8, tex: "" };
    expect(calcFeedback(q, 8).ok).toBe(true);
    expect(calcFeedback(q, -8).message).toMatch(/signe/);
    expect(calcFeedback(q, -2).message).toMatch(/ajouté/);
    const q2 = { a: -7, b: 3, op: "+" as const, answer: -4, tex: "" };
    expect(calcFeedback(q2, -10).message).toMatch(/signes contraires/);
    expect(calcFeedback(q2, 4).message).toMatch(/signe/);
  });
  it("calcul mental : questions valides sur de nombreux tirages", () => {
    const lv: CalcLevel = { range: 20, ops: ["+", "-"], decimals: true };
    const rng = createRng("cm");
    for (let i = 0; i < 500; i++) {
      const q = calcQuestion(rng, lv);
      expect(q.a < 0 || q.b < 0).toBe(true);
      expect(q.a).not.toBe(0);
      expect(Math.abs(q.answer - (q.op === "+" ? q.a + q.b : q.a - q.b))).toBeLessThan(1e-9);
      expect(calcFeedback(q, q.answer).ok).toBe(true);
    }
  });
  it("droite graduée : cibles sur une graduation, non nulles, rétroaction", () => {
    const lv: LineLevel = { min: -2, max: 2, step: 0.5 };
    const rng = createRng("dg");
    for (let i = 0; i < 300; i++) {
      const r = lineRound(rng, lv);
      expect(r.target).not.toBe(0);
      expect(r.target).toBeGreaterThanOrEqual(lv.min);
      expect(r.target).toBeLessThanOrEqual(lv.max);
      expect(Math.abs(r.target / lv.step - Math.round(r.target / lv.step))).toBeLessThan(1e-9);
    }
    expect(lineFeedback(-3, 3, 1).message).toMatch(/opposé/);
    expect(lineFeedback(-3, -3, 1).ok).toBe(true);
    expect(lineFeedback(-3, -2, 1).message).toMatch(/graduation/);
  });
});

for (const c of ALL_CHAPTERS) {
  describe(`chapitre ${c.id}`, () => {
    it("respecte le contrat de données", () => {
      const r = ChapterSchema.safeParse(c);
      if (!r.success) throw new Error(JSON.stringify(r.error.issues.slice(0, 5), null, 1));
    });
    it("Definition of Done : seuls les écarts de revue QA sont tolérés tant que le chapitre n'est pas publié", () => {
      const issues = doneIssues(c);
      if (c.publicationStatus === "published") expect(issues).toEqual([]);
      else expect(issues.filter((i) => !i.startsWith("revue "))).toEqual([]);
    });
    it("activités : configurations cohérentes", () => {
      for (const g of c.games) {
        if (g.template === "memory") {
          const pairs = g.config.pairs as [string, string][];
          expect(pairs.length).toBeGreaterThanOrEqual(4);
          const texts = pairs.flat();
          expect(new Set(texts).size).toBe(texts.length); // aucune carte ambiguë
        }
        if (g.template === "chasse-erreurs") {
          for (const it0 of g.config.items as { correct: boolean; errors?: string[]; error?: number }[]) {
            if (!it0.correct) {
              expect(it0.errors?.length).toBeGreaterThanOrEqual(2);
              expect(it0.error).toBeGreaterThanOrEqual(0);
              expect(it0.error).toBeLessThan(it0.errors!.length);
            }
          }
        }
        if (g.template === "droite-graduee") {
          for (const lv of g.config.levels as LineLevel[]) {
            const n = (lv.max - lv.min) / lv.step;
            expect(Math.abs(n - Math.round(n))).toBeLessThan(1e-9);
            expect(lv.min).toBeLessThan(0);
          }
        }
      }
    });
    for (const e of c.exercises) {
      it(`${e.id} : réponse parfaite = 100 %, diagnostics distincts de la bonne réponse, sans fuite`, () => {
        const g = exerciseGenerator(c, e);
        for (let k = 0; k < (e.vary ? 40 : 1); k++) {
          const inst = g.generate(createRng(`s${k}`), 1);
          const pub = JSON.stringify(toPublic(inst));
          expect(pub).not.toContain('"answer"');
          expect(pub).not.toContain('"mistakes"');
          expect(JSON.stringify(inst)).not.toMatch(/NaN|undefined|Infinity/);
          const responses = inst.parts.map((p) => perfect(p.interaction));
          const res = checkExercise(inst, responses);
          res.parts.forEach((r, i) => {
            if (r.status !== "correct") throw new Error(`${e.id} seed s${k} partie ${i} : ${r.status} ${r.feedback.join(" | ")}`);
          });
          inst.parts.forEach((p, i) => {
            for (const m of p.mistakes ?? []) expect(matchesMistake(p.interaction, responses[i], m), `${e.id} : diagnostic « ${m.match} » = bonne réponse`).toBe(false);
          });
          expect(checkExercise(inst, inst.parts.map(() => undefined)).score).toBe(0);
        }
      });
    }
  });
}
