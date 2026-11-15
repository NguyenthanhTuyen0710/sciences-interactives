// Paliers de modèles (pipeline/models.ts), tarifs (pipeline/prices.json) et répartition par modèle du registre.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { costUsd, exerciseBlocks, fixModel, FORBIDDEN_MODEL, longPromptWarning, MODEL_POLICY, MODELS, inputHash, rateFor, STEP_CONFIG, promptSections, sectionKeys, SUBJECTS, injectMeta, metaBlock, META_START, type Prices } from "../pipeline/models";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
    expect(STEP_CONFIG.review.system).toBe("light"); // juge approfondi sans schéma ni chapitre d'exemple
    expect(STEP_CONFIG.chapter.system).toBe("full");
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

describe("matières (M3) : blocs de prompt et fiche physique-chimie", () => {
  it("blocs {{#maths}} / {{#pc}} gardés pour la seule matière du chapitre ; clé inconnue refusée", () => {
    const t = "A{{#maths}}M{{/maths}}{{#pc}}P\n{{/pc}}B";
    expect(promptSections(t, sectionKeys("mathematiques", "3e"))).toBe("AMB");
    expect(promptSections(t, sectionKeys("physique-chimie", "4e"))).toBe("AP\nB");
    expect(() => promptSections("{{#svt}}x{{/svt}}", ["maths"])).toThrow(/inconnu/);
    // imbrication de clés différentes : cycle dans la matière
    const n = "{{#college}}C({{#maths}}m{{/maths}}{{#pc}}p{{/pc}}){{/college}}{{#lycee}}L{{/lycee}}";
    expect(promptSections(n, sectionKeys("mathematiques", "3e"))).toBe("C(m)");
    expect(promptSections(n, sectionKeys("physique-chimie", "5e"))).toBe("C(p)");
    expect(promptSections(n, sectionKeys("mathematiques", "1re"))).toBe("L");
  });
  it("chaque prompt contient un bloc PC et aucune clé inconnue", () => {
    for (const f of ["system", "dossier", "chapter", "review"]) {
      const t = readFileSync(`pipeline/prompts/${f}.md`, "utf8");
      expect(t).toContain("{{#pc}}");
      expect(promptSections(t, sectionKeys("physique-chimie", "4e"))).not.toMatch(/\{\{[#/]/);
      expect(promptSections(t, sectionKeys("mathematiques", "1re"))).not.toMatch(/\{\{[#/]/);
    }
    for (const s of Object.values(SUBJECTS)) expect(existsSync(s.inventory)).toBe(true);
  });
  it("dry-run de la fiche pc-4e-electricite : sans appel, inventaire PC, objectifs du chapitre", () => {
    const r = spawnSync("npx", ["tsx", "pipeline/run.ts", "pc-4e-electricite", "--level", "4e", "--subject", "physique-chimie", "--batch"], { encoding: "utf8", env: { ...process.env, ANTHROPIC_API_KEY: "" } });
    const out = r.stdout + r.stderr;
    expect(r.status, out).toBe(0);
    expect(out).toContain("contrôle des données : OK (4e, physique-chimie, p4-electricite, SCI-4E-PC-007)");
    expect(out).toContain("mode dry-run");
    expect(out).not.toMatch(/soumis|coût réel/);
  }, 60_000);
});

describe("empreinte du dossier : modèle imposé pour la comparaison du pilote", () => {
  it("sans modèle imposé : formule historique inchangée (empreintes du registre conservées)", () => {
    const old = (...p: string[]) => createHash("sha256").update(p.join("\u0000")).digest("hex").slice(0, 16);
    expect(inputHash(["système", "requête"])).toBe(old("système", "requête"));
    expect(inputHash(["x"])).toBe(old("x"));
  });
  it("modèle imposé : empreinte distincte par modèle", () => {
    const base = inputHash(["s", "u"]);
    const h = inputHash(["s", "u"], MODELS.haiku), so = inputHash(["s", "u"], MODELS.sonnet);
    expect(new Set([base, h, so]).size).toBe(3);
  });
  it("dry-run : --dossier-model sonnet change l'empreinte du dossier, pas celle du chapitre", () => {
    const hashes = (extra: string[]) => {
      const r = spawnSync("npx", ["tsx", "pipeline/run.ts", "pc-4e-electricite", "--batch", ...extra], { encoding: "utf8", env: { ...process.env, ANTHROPIC_API_KEY: "" } });
      expect(r.status, r.stdout + r.stderr).toBe(0);
      return Object.fromEntries([...(r.stdout).matchAll(/estimation (\w+) \(batch\).*?empreinte ([0-9a-f]{16})/g)].map((m) => [m[1], m[2]]));
    };
    const d = hashes([]), s = hashes(["--dossier-model", "sonnet"]);
    expect(d.dossier).toMatch(/^[0-9a-f]{16}$/);
    expect(s.dossier).not.toBe(d.dossier);
    expect(s.chapter).toBe(d.chapter);
  }, 60_000);
});

describe("prompts du collège : empreintes inchangées par l'étape B (blocs lycée)", () => {
  // sha256 (16) des prompts résolus pour le collège, relevés avant l'étape B ; chapter.md modifié ensuite par A et C
  // (empreinte de l'étape chapitre seule changée ; dossier, fix, criblage et relecture inchangés). Une modification volontaire d'un prompt
  // du collège met à jour cette table dans le même commit, avec sa justification.
  const COLLEGE_PROMPTS: Record<string, string> = {
    "mathematiques/system": "2fdf1cdcf55b1430", "mathematiques/dossier": "9ed40b191a3c9c20", "mathematiques/chapter": "54ec615f95f20d67", // modifié volontairement : propositions A et C (2026-11-15)
    "mathematiques/fix": "ecc7a2b99610772e", "mathematiques/review": "f84f4e7803af6a9c",
    "physique-chimie/system": "c42697dd748044e1", "physique-chimie/dossier": "1eaaa1b02eda782d", "physique-chimie/chapter": "0cce633843c2cc8b", // idem
    "physique-chimie/fix": "ecc7a2b99610772e", "physique-chimie/review": "216835bdc19e6453",
  };
  it("prompts résolus identiques", () => {
    for (const [k, h] of Object.entries(COLLEGE_PROMPTS)) {
      const [subj, f] = k.split("/") as ["mathematiques" | "physique-chimie", string];
      const t = promptSections(readFileSync(`pipeline/prompts/${f}.md`, "utf8"), sectionKeys(subj, "3e"));
      expect(createHash("sha256").update(t).digest("hex").slice(0, 16), k).toBe(h);
    }
  });
  it("dry-run de la fiche 1re : parcours contrôlé, palier Opus pour le chapitre (démonstration exigible)", () => {
    const r = spawnSync("npx", ["tsx", "pipeline/run.ts", "math-1re-spe-second-degre", "--level", "1re", "--parcours", "specialite", "--batch"], { encoding: "utf8", env: { ...process.env, ANTHROPIC_API_KEY: "" } });
    const out = r.stdout + r.stderr;
    expect(r.status, out).toBe(0);
    expect(out).toContain("contrôle des données : OK (1re, mathematiques, m1-second-degre, SCI-1RE-MATH-001)");
    expect(out).toContain(`chapter=${MODELS.opus}`);
    const bad = spawnSync("npx", ["tsx", "pipeline/run.ts", "math-1re-spe-second-degre", "--parcours", "tronc-commun"], { encoding: "utf8" });
    expect(bad.status).not.toBe(0);
  }, 60_000);
});

describe("proposition A : métadonnées injectées par le pipeline", () => {
  const spec = JSON.parse(readFileSync("pipeline/chapters/math-3e-pythagore.json", "utf8"));
  const groups = [
    { chapter: "math-3e-automatismes", kind: "officiel 3e", objectives: [{ id: "M3-AUTO-03", text: "Images mentales.", officialRef: "BO 2020" }] },
    { chapter: "math-4e-pythagore", kind: "consolidation", objectives: [{ id: "M4-EG-03", text: "Calculer une longueur.", officialRef: "Attendus 4e" }, { id: "X-APP", text: "Prolongement.", officialRef: "BO", required: false }] },
  ];
  const metaOf = (block: string) => JSON.parse(block.slice(block.indexOf("{"), block.lastIndexOf("} satisfies") + 1));
  it("champs déterminés par la fiche : identité, objectifs (consolidation, required), sources vérifiées, statuts", () => {
    const m = metaOf(metaBlock(spec, groups));
    expect(m).toMatchObject({ id: "math-3e-pythagore", taskId: "SCI-3E-MATH-017", grade: "3e", publicationStatus: "draft", curriculumChapterIds: ["math-3e-automatismes", "math-4e-pythagore"] });
    expect(m.parcours).toBeUndefined();
    expect(m.officialObjectives.map((o: { source: string }) => o.source)).toEqual(["BO 2020", "Attendus 4e (consolidation)", "BO (consolidation)"]);
    expect(m.officialObjectives[2].required).toBe(false);
    expect(m.sources).toHaveLength(3);
    expect(m.sources.every((x: { verification: string; sha256: string }) => x.verification === "verified" && x.sha256.length === 64)).toBe(true);
    expect(Object.values(m.reviewStatus).every((v) => v === "pending")).toBe(true);
  });
  it("lycée : parcours, sources non vérifiées, approfondissement non exigé", () => {
    const ly = JSON.parse(readFileSync("pipeline/chapters/math-1re-spe-second-degre.json", "utf8"));
    const m = metaOf(metaBlock(ly, [{ chapter: ly.id, kind: "officiel 1re", objectives: [{ id: "M1S-SD-05", text: "Démontrer." }, { id: "M1S-SD-06", text: "Approfondissement." }] }]));
    expect(m.parcours).toBe("specialite");
    expect(m.curriculumChapterIds).toBeUndefined();
    expect(m.sources.every((x: { verification: string }) => x.verification === "pending_verification")).toBe(true);
    expect(m.officialObjectives.find((o: { id: string }) => o.id === "M1S-SD-06").required).toBe(false);
  });
  it("le chapitre Pythagore recomposé avec ...META reste conforme et complet", async () => {
    const { ChapterSchema, doneIssues } = await import("../src/lib/chapters/schema");
    const { math3ePythagore: c } = await import("../src/lib/chapters/data/math-3e-pythagore");
    const m = metaOf(metaBlock(spec, groups.map((g, i) => (i ? { ...g, objectives: g.objectives.slice(0, 1).concat([{ id: "M4-EG-04", text: "Réciproque.", officialRef: "Attendus 4e" }]) } : g))));
    const r = { ...c, ...m };
    expect(ChapterSchema.safeParse(r).success).toBe(true);
    expect(doneIssues(r).filter((x) => !x.startsWith("revue "))).toEqual(doneIssues(c).filter((x) => !x.startsWith("revue ")));
  });
  it("insertion après les imports, remplacement idempotent", () => {
    const file = 'import type { A } from "../schema";\nimport { b } from "x";\n\nexport const z = { ...META };\n';
    const once = injectMeta(file, metaBlock(spec, groups));
    expect(once.indexOf(META_START)).toBeGreaterThan(once.indexOf('from "x";'));
    expect(once.indexOf(META_START)).toBeLessThan(once.indexOf("export const z"));
    expect(injectMeta(once, metaBlock(spec, groups))).toBe(once);
  });
});
