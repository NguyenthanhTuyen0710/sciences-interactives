// Paliers de modèles (pipeline/models.ts), tarifs (pipeline/prices.json) et répartition par modèle du registre.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { costUsd, exerciseBlocks, fixModel, FORBIDDEN_MODEL, longPromptWarning, MODEL_POLICY, MODELS, rateFor, STEP_CONFIG, type Prices } from "../pipeline/models";
import { spentByModel, type LedgerEntry } from "../pipeline/ledger";

const prices = JSON.parse(readFileSync("pipeline/prices.json", "utf8")) as Prices;

describe("tarifs (page officielle du 2026-11-15)", () => {
  it("trois modèles 5.5, remise batch de 50 % cohérente avec les prix batch publiés", () => {
    for (const m of Object.values(MODELS)) {
      const p = prices.models[m] as Prices["models"][string] & { batch: { input: number; output: number } };
      expect(p.batch.input).toBeCloseTo(p.input * prices.batchMultiplier);
      expect(p.batch.output).toBeCloseTo(p.output * prices.batchMultiplier);
    }
    expect(prices.models[MODELS.sonnet].cacheRead).toBe(0.1);
    expect(prices.models[MODELS.opus].cacheRead).toBe(0.2);
  });
  it("Haiku 5.5 : tout le prompt au tarif long au-delà de 100 000 tokens (cache compris)", () => {
    const h = prices.models[MODELS.haiku];
    expect(rateFor(h, 100_000).long).toBe(false);
    expect(rateFor(h, 100_001).input).toBe(0.5);
    const short = costUsd(prices, MODELS.haiku, { input: 90_000, cacheWrite: 0, cacheRead: 0, output: 1000 }, false);
    const long = costUsd(prices, MODELS.haiku, { input: 90_000, cacheWrite: 0, cacheRead: 20_000, output: 1000 }, false);
    expect(short).toBeCloseTo((90_000 * 0.1 + 1000 * 0.5) / 1e6);
    expect(long).toBeCloseTo((90_000 * 0.5 + 20_000 * 0.05 + 1000 * 2.5) / 1e6);
    expect(costUsd(prices, MODELS.haiku, { input: 90_000, cacheWrite: 0, cacheRead: 0, output: 1000 }, true)).toBeCloseTo(short / 2);
  });
  it("avertissement Haiku > 100k avec proposition de découpage", () => {
    expect(longPromptWarning(prices, MODELS.haiku, 120_000)).toMatch(/× 5.*Découper/);
    expect(longPromptWarning(prices, MODELS.haiku, 80_000)).toBeNull();
    expect(longPromptWarning(prices, MODELS.sonnet, 500_000)).toBeNull();
  });
});

describe("paliers", () => {
  it("tableau par défaut (décision du 2026-11-15), sans Fable ni Mythos", () => {
    expect(STEP_CONFIG.dossier.model).toBe(MODELS.haiku);
    expect(STEP_CONFIG.chapter.model).toBe(MODELS.sonnet);
    expect(STEP_CONFIG.screen.model).toBe(MODELS.haiku);
    expect(STEP_CONFIG.review.model).toBe(MODELS.sonnet);
    expect(MODEL_POLICY.find((p) => p.task.startsWith("taxonomie"))).toMatchObject({ model: MODELS.opus, effort: "high" });
    for (const m of [...Object.values(STEP_CONFIG).map((c) => c.model), ...MODEL_POLICY.map((p) => p.model)]) expect(FORBIDDEN_MODEL.test(m)).toBe(false);
  });
  it("correction : Haiku seulement au 1er tour et si tout est mineur ; escalade vers Sonnet ensuite", () => {
    expect(fixModel(["vouvoiement", "élément en double : x"], 1)).toBe(MODELS.haiku);
    expect(fixModel(["vouvoiement", "réponse parfaite non acceptée (partie 0)"], 1)).toBe(MODELS.sonnet);
    expect(fixModel(["vouvoiement"], 2)).toBe(MODELS.sonnet);
    expect(fixModel([], 1)).toBe(MODELS.sonnet);
  });
});

describe("juge approfondi : extraits d'exercices", () => {
  it("Pythagore : 20 blocs, niveaux 4/4/4/4/4", () => {
    const blocks = exerciseBlocks(readFileSync("src/lib/chapters/data/math-3e-pythagore.ts", "utf8"), "py3-");
    expect(blocks.map((b) => b.id)).toEqual(Array.from({ length: 20 }, (_, i) => `py3-${String(i + 1).padStart(2, "0")}`));
    expect([1, 2, 3, 4, 5].map((n) => blocks.filter((b) => b.niveau === n).length)).toEqual([4, 4, 4, 4, 4]);
    for (const b of blocks) expect(b.text).toContain(`id: "${b.id}"`);
  });
});

describe("registre : dépense par modèle", () => {
  it("modèle renseigné, ou Sonnet 5.5 pour l'historique", () => {
    const l: LedgerEntry[] = [
      { type: "reserve", id: "a", at: "t", chapter: "c", step: "chapter", inputHash: "h1", mode: "batch", maxUsd: 1 },
      { type: "actual", id: "a", at: "t", usd: 0.3 },
      { type: "reserve", id: "b", at: "t", chapter: "c", step: "screen", inputHash: "h2", mode: "batch", maxUsd: 1, model: MODELS.haiku },
      { type: "actual", id: "b", at: "t", usd: 0.004, model: MODELS.haiku, tokens: { input: 1, cacheWrite: 0, cacheRead: 0, output: 1 } },
    ];
    expect(spentByModel(l)).toEqual({ [MODELS.sonnet]: 0.3, [MODELS.haiku]: 0.004 });
  });
});
