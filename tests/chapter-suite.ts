// Batterie de tests commune à tout chapitre complet (contrat, Definition of Done, activités, exercices).
// Réutilisable pour tester un brouillon avant son inscription dans le registre.
import { describe, expect, it } from "vitest";
import { exerciseGenerator } from "../src/lib/chapters";
import { ChapterSchema, doneIssues, type ChapterContent } from "../src/lib/chapters/schema";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise, matchesMistake } from "../src/lib/engine/check";
import { perfect } from "../src/lib/engine/solve";
import { toPublic } from "../src/lib/engine/public";
import { flashFeedback, type FlashLevel, type LineLevel } from "../src/lib/games/logic";
import { gcd, parseNumber } from "../src/lib/engine/numbers";

export function describeChapter(c: ChapterContent) {
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
        if (g.template === "calcul-flash") {
          const levels = g.config.levels as FlashLevel[];
          expect(levels.length).toBeGreaterThanOrEqual(2);
          for (const lv of levels) {
            expect(lv.items.length, `${g.id} ${lv.label}`).toBeGreaterThanOrEqual(6);
            for (const it of lv.items) {
              const p = parseNumber(it.answer);
              expect(p, `${g.id} : réponse illisible « ${it.answer} »`).not.toBeNull();
              if (it.irreducible && p!.isFraction) expect(gcd(p!.num!, p!.den!), `${g.id} : ${it.answer} non irréductible`).toBe(1);
              expect(flashFeedback(it, it.answer)?.ok, `${g.id} : ${it.q}`).toBe(true);
              expect(it.explanation.length).toBeGreaterThan(5);
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
