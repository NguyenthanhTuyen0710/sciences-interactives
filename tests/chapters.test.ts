import { describe, expect, it } from "vitest";
import { ALL_CHAPTERS } from "../src/lib/chapters";
import { describeChapter } from "./chapter-suite";
import { createRng } from "../src/lib/engine/rng";
import { adapt, calcFeedback, calcQuestion, flashAnswerTex, flashFeedback, flashPick, lineFeedback, lineRound, parseRel, type CalcLevel, type LineLevel } from "../src/lib/games/logic";

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
  it("calcul flash : correction, fraction non irréductible, saisie illisible, affichage", () => {
    const it0 = { q: "$\\dfrac{1}{2} + \\dfrac{1}{4}$", answer: "3/4", irreducible: true, explanation: "On réduit au même dénominateur." };
    expect(flashFeedback(it0, "3/4")?.ok).toBe(true);
    expect(flashFeedback(it0, "0,75")?.ok).toBe(false);
    expect(flashFeedback(it0, "0,75")?.message).toMatch(/fraction irréductible/);
    expect(flashFeedback({ ...it0, answer: "4" }, "4")?.ok).toBe(true);
    expect(flashFeedback(it0, "6/8")?.ok).toBe(false);
    expect(flashFeedback(it0, "6/8")?.message).toMatch(/irréductible/);
    expect(flashFeedback(it0, "2/3")?.message).toMatch(/attendue/);
    expect(flashFeedback(it0, "abc")).toBeNull();
    expect(flashFeedback({ q: "", answer: "3e-4", explanation: "" }, "3×10^-4")?.ok).toBe(true);
    expect(flashAnswerTex("17/12")).toBe("\\dfrac{17}{12}");
    expect(flashAnswerTex("-2,5")).toBe("-2{,}5");
    expect(flashAnswerTex("3e-4")).toBe("3 \\times 10^{-4}");
    const rng = createRng("fp");
    let last = -1;
    for (let i = 0; i < 200; i++) { const k = flashPick(rng, 6, last); expect(k).not.toBe(last); expect(k).toBeGreaterThanOrEqual(0); expect(k).toBeLessThan(6); last = k; }
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
  it("droite graduée : nombre de graduations correct quand le pas n'est pas 1 (QA4 F10)", () => {
    expect(lineFeedback(-1.5, 2, 0.5).message).toMatch(/3 graduations de 0,5 à gauche/);
    expect(lineFeedback(-0.4, 1, 0.2).message).toMatch(/2 graduations de 0,2/);
    expect(lineFeedback(-1.5, 2, 0.5).message).toContain("−1,5");
  });
  it("droite graduée : ~65 % de négatifs, extrémités exclues en lecture (QA4 F11)", () => {
    const lv: LineLevel = { min: -5, max: 5, step: 1 };
    const rng = createRng("neg");
    let neg = 0;
    const N = 4000;
    for (let i = 0; i < N; i++) {
      const r = lineRound(rng, lv);
      if (r.target < 0) neg++;
      if (r.type === "lire") expect(Math.abs(r.target)).toBeLessThan(5);
    }
    expect(neg / N).toBeGreaterThan(0.6);
    expect(neg / N).toBeLessThan(0.72);
  });
});

for (const c of ALL_CHAPTERS) describeChapter(c);
