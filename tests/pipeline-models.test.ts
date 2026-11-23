// Paliers de modèles (pipeline/models.ts), tarifs (pipeline/prices.json) et répartition par modèle du registre.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { costUsd, exerciseBlocks, fixModel, FORBIDDEN_MODEL, longPromptWarning, MODEL_POLICY, MODELS, inputHash, rateFor, STEP_CONFIG, promptSections, sectionKeys, SUBJECTS, injectMeta, isPipelineDraft, metaBlock, META_START, maxTokensFor, OPUS_CHAPTER_MAX_TOKENS, thinkingParam, g2Missing, verificationMethod, requiredMaxTokens, truncationRisk, latestReport, reportFile, runTag, type Prices } from "../pipeline/models";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { judgeFixRoundUsed, JUDGE_FIX_SUFFIX, retryPlan, RETRY_SUFFIX, spentByModel, type LedgerEntry } from "../pipeline/ledger";
import { judgeFixPlan, type Review } from "../pipeline/review-format";

const prices = JSON.parse(readFileSync("pipeline/prices.json", "utf8")) as Prices;

/**
 * Dry-run de pipeline/run.ts sur une racine de données temporaire (PIPELINE_ROOT) : seules les données d'entrée sont
 * copiées (prompts, fiches, tarifs, inventaires, schéma, types, arborescence, chapitre d'exemple) ; aucun dossier,
 * chapitre produit, état, rapport ni registre du dépôt n'est vu. `files` ajoute des fichiers au fixture.
 */
function dryRun(args: string[], files: Record<string, string> = {}, withCode = false) {
  const root = mkdtempSync(join(tmpdir(), "pipeline-fixture-"));
  try {
    for (const p of ["pipeline/prompts", "pipeline/chapters", "pipeline/prices.json", "pipeline/budget.json", "research/curriculum", "src/lib/chapters/schema.ts", "src/lib/engine/types.ts", "src/lib/content/curriculum.ts", "src/lib/chapters/data/math-3e-arithmetique.ts"]) cpSync(p, join(root, p), { recursive: true });
    // withCode : validate-chapter et tsc s'exécutent dans le fixture (code source, sans les chapitres produits du dépôt).
    if (withCode) {
      for (const p of ["src", "scripts", "package.json", "tsconfig.json", "research/sources/records"]) cpSync(p, join(root, p), { recursive: true, filter: (x) => !/src\/lib\/chapters\/data\/(pc-4e-electricite|math-3e-pythagore|math-3e-puissances-calculs)\.ts$/.test(x) });
      symlinkSync(join(process.cwd(), "node_modules"), join(root, "node_modules"));
    }
    for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text); }
    const r = spawnSync("npx", ["tsx", "pipeline/run.ts", ...args], { encoding: "utf8", env: { ...process.env, ANTHROPIC_API_KEY: "", PIPELINE_ROOT: root } });
    return { status: r.status, out: r.stdout + r.stderr };
  } finally { rmSync(root, { recursive: true, force: true }); }
}

describe("porte G2 (décision du 2026-11-17)", () => {
  const ev = { quote: "citation verbatim du BO", approvedBy: "porteur", approvedAt: "2026-11-17" };
  const objs = [
    { id: "A", level: { "3e": "exigible" }, evidence: ev },
    { id: "B", level: { "3e": "exigible" } },
    { id: "C", level: { "3e": "consolidation" } },
    { id: "D", level: { "3e": "exigible" }, required: false },
    { id: "E", level: { "3e": "exigible" }, evidence: { quote: "sans approbation" } },
  ];
  it("méthode : g2 seulement avec citation et approbation datée", () => {
    expect(verificationMethod(objs[0])).toBe("g2");
    expect(verificationMethod(objs[1])).toBe("lecture-initiale");
    expect(verificationMethod(objs[4])).toBe("lecture-initiale");
  });
  it("objectifs obligatoires sans G2 : exigibles, required ≠ false ; consolidation exclue", () => {
    expect(g2Missing(objs, "3e")).toEqual(["B", "E"]);
  });
  it("le niveau de la fiche prime sur l'inventaire ; niveau inconnu = obligatoire", () => {
    expect(g2Missing(objs, "3e", { B: "consolidation" })).toEqual(["E"]);
    expect(g2Missing([{ id: "F" }], "3e")).toEqual(["F"]);
  });
  it("Pythagore : objectifs obligatoires déjà vérifiés par G2 ; P4-E-04 non vérifié", () => {
    const inv = JSON.parse(readFileSync("research/curriculum/mathematiques/curriculum-math.json", "utf8")) as { grades: { domains: { chapters: { objectives: { id: string }[] }[] }[] }[] };
    const all = inv.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters.flatMap((c) => c.objectives)));
    const py = JSON.parse(readFileSync("pipeline/chapters/math-3e-pythagore.json", "utf8")) as { objectiveLevels: Record<string, string> };
    expect(g2Missing(all.filter((o) => o.id in py.objectiveLevels), "3e", py.objectiveLevels)).toEqual([]);
    const pc = JSON.parse(readFileSync("research/curriculum/physique-chimie/curriculum-pc.json", "utf8")) as typeof inv;
    const p404 = pc.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters.flatMap((c) => c.objectives))).find((o) => o.id === "P4-E-04") as { verified: boolean };
    expect(p404.verified).toBe(false);
  });
});

describe("rapports QA nommés par run (décision du 2026-11-18)", () => {
  it("nom écrit par le run ; étiquette « local » hors GitHub", () => {
    expect(reportFile("SCI-3E-MATH-003", "review", "52")).toBe("project/reports/SCI-3E-MATH-003-QA-api-run52.md");
    expect(reportFile("SCI-3E-MATH-003", "screen", "52")).toBe("project/reports/SCI-3E-MATH-003-screen-QA-api-run52.md");
    expect(runTag({ GITHUB_RUN_NUMBER: "52" })).toBe("52");
    expect(runTag({})).toBe("local");
  });
  it("criblage le plus récent : run le plus élevé ; ancien nom = 0 ; local = le plus récent ; autre chapitre ignoré", () => {
    const files = ["SCI-3E-MATH-017-screen-QA-api.md", "SCI-3E-MATH-017-screen-QA-api-run9.md", "SCI-3E-MATH-017-screen-QA-api-run41.md", "SCI-3E-MATH-017-QA-api-run50.md", "SCI-4E-PC-007-screen-QA-api-run60.md"];
    expect(latestReport(files, "SCI-3E-MATH-017", "screen")).toBe("project/reports/SCI-3E-MATH-017-screen-QA-api-run41.md");
    expect(latestReport([...files, "SCI-3E-MATH-017-screen-QA-api-runlocal.md"], "SCI-3E-MATH-017", "screen")).toBe("project/reports/SCI-3E-MATH-017-screen-QA-api-runlocal.md");
    expect(latestReport(["SCI-3E-MATH-017-screen-QA-api.md"], "SCI-3E-MATH-017", "screen")).toBe("project/reports/SCI-3E-MATH-017-screen-QA-api.md");
    expect(latestReport(files, "SCI-3E-MATH-003", "screen")).toBeNull();
  });
});

describe("garde-fou de troncature (décision du 2026-11-17)", () => {
  it("chapitre Sonnet : 64 000 refusé, 96 000 accepté", () => {
    expect(requiredMaxTokens("chapter", MODELS.sonnet)).toBe(Math.ceil((38632 / 0.63) * 1.1));
    expect(truncationRisk("chapter", MODELS.sonnet, 64000)).toMatch(/max_tokens 64000 < besoin estimé/);
    expect(truncationRisk("chapter", MODELS.sonnet, 96000)).toBeNull();
  });
  it("essai H1 : estimation propre (2 500 visibles, 76 %) acceptée à 13 500, sans exemption", () => {
    for (const s of ["h1-low", "h1-medium"] as const) {
      expect(STEP_CONFIG[s]).toMatchObject({ model: MODELS.opus, maxTokens: 13500 });
      expect(requiredMaxTokens(s, MODELS.opus)).toBe(Math.ceil((2500 / 0.24) * 1.1));
      expect(truncationRisk(s, MODELS.opus)).toBeNull();
      expect(truncationRisk(s, MODELS.opus, 11000)).toMatch(/besoin estimé/);
    }
    expect([STEP_CONFIG["h1-low"].effort, STEP_CONFIG["h1-medium"].effort]).toEqual(["low", "medium"]);
  });
  it("chapitre Opus : besoin au-delà de 128 000 → toujours refusé", () => {
    expect(truncationRisk("chapter", MODELS.opus, 128000)).toMatch(/maximum de sortie de l'API/);
  });
  it("dossier, criblage, juge : configuration actuelle suffisante ; étape sans mesure non contrôlée", () => {
    for (const [step, model] of [["dossier", MODELS.haiku], ["screen", MODELS.haiku], ["review", MODELS.sonnet]] as const) expect(truncationRisk(step, model)).toBeNull();
    expect(requiredMaxTokens("fix", MODELS.sonnet)).toBeNull();
  });
});

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
  it("Pythagore : 21 blocs (py3-21 ajouté par la correction du run 56), niveaux 4/4/5/4/4", () => {
    const blocks = exerciseBlocks(readFileSync("src/lib/chapters/data/math-3e-pythagore.ts", "utf8"), "py3-");
    const ids = Array.from({ length: 20 }, (_, i) => `py3-${String(i + 1).padStart(2, "0")}`);
    expect(blocks.map((b) => b.id)).toEqual([...ids.slice(0, 4), "py3-21", ...ids.slice(4)]);
    expect([1, 2, 3, 4, 5].map((n) => blocks.filter((b) => b.niveau === n).length)).toEqual([4, 4, 5, 4, 4]);
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

describe("tour de correction sur constats du juge (décisions 19 et 21, données factices, aucun appel API)", () => {
  const f = (severity: "BLOQUANT" | "MAJEUR" | "MINEUR", exerciseId: string) => ({ criterion: "exercises" as const, severity, exerciseId, issue: "défaut", fix: "correction" });
  const review = (...findings: Review["findings"]): Review => ({ verdict: findings.some((x) => x.severity !== "MINEUR") ? "NEEDS_REVIEW" : "PASS", criteria: [], findings });
  it("désactivé par défaut (opt-in) ou sans rapport du juge : rien", () => {
    expect(judgeFixPlan(false, review(f("MAJEUR", "x-01")), false)).toEqual({ action: "none" });
    expect(judgeFixPlan(true, null, false)).toEqual({ action: "none" });
  });
  it("BLOQUANT et MAJEUR du juge seulement ; jamais un MINEUR seul", () => {
    expect(judgeFixPlan(true, review(f("MINEUR", "x-02")), false)).toEqual({ action: "none" });
    const p = judgeFixPlan(true, review(f("BLOQUANT", "x-00"), f("MAJEUR", "x-01"), f("MINEUR", "x-02")), false);
    expect(p.action).toBe("fix");
    expect(p.action !== "none" && p.findings.map((x) => x.exerciseId)).toEqual(["x-00", "x-01"]);
  });
  it("un seul tour : MAJEUR restant ou nouveau après le tour → arrêt (décision 17)", () => {
    const p = judgeFixPlan(true, review(f("MAJEUR", "x-09")), true);
    expect(p).toEqual({ action: "stop", findings: [f("MAJEUR", "x-09")] });
    expect(judgeFixPlan(true, review(f("MINEUR", "x-02")), true)).toEqual({ action: "none" });
  });
  it("BLOQUANT seul : corrigé au tour ; BLOQUANT restant ou nouveau après le tour → arrêt (décision 21)", () => {
    expect(judgeFixPlan(true, review(f("BLOQUANT", "x-03")), false)).toEqual({ action: "fix", findings: [f("BLOQUANT", "x-03")] });
    expect(judgeFixPlan(true, review(f("BLOQUANT", "x-04"), f("MINEUR", "x-05")), true)).toEqual({ action: "stop", findings: [f("BLOQUANT", "x-04")] });
  });
  it("registre : tour engagé dès la réservation, distinct des corrections de validation, rendu si échec", () => {
    const fix = (id: string, inputHash: string, chapter = "c"): LedgerEntry => ({ type: "reserve", id, at: "t", chapter, step: "fix", inputHash, mode: "batch", maxUsd: 0.2, model: MODELS.sonnet });
    expect(judgeFixRoundUsed([fix("a", "h1")], "c")).toBe(false);
    expect(judgeFixRoundUsed([fix("b", "h2" + JUDGE_FIX_SUFFIX, "autre")], "c")).toBe(false);
    expect(judgeFixRoundUsed([fix("c", "h3" + JUDGE_FIX_SUFFIX)], "c")).toBe(true);
    expect(judgeFixRoundUsed([fix("d", "h4" + JUDGE_FIX_SUFFIX + RETRY_SUFFIX)], "c")).toBe(true);
    expect(judgeFixRoundUsed([fix("e", "h5" + JUDGE_FIX_SUFFIX), { type: "failed", id: "e", at: "t", reason: "test" }], "c")).toBe(false);
  });
  it("run.ts : opt-in `true`, Sonnet, plafond 0,20 $, empreinte suffixée ; sélection numérotée (Pythagore) inchangée", () => {
    const src = readFileSync("pipeline/run.ts", "utf8");
    expect(src).toMatch(/const JUDGE_FIX_CAP_USD = 0\.2;/);
    expect(src).toMatch(/spec\.judgeFindingsForFix === true && done\("review", hReview\)/);
    expect(src).toMatch(/call\("fix", user, hashOf\(user\) \+ JUDGE_FIX_SUFFIX, MODELS\.sonnet, JUDGE_FIX_CAP_USD\)/);
    expect(src).toMatch(/!judgeFixUsed && wanted\("fix"\)/);
    expect(JSON.parse(readFileSync("pipeline/chapters/math-3e-pythagore.json", "utf8")).judgeFindingsForFix).toBeInstanceOf(Array);
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
    const { status, out } = dryRun(["pc-4e-electricite", "--level", "4e", "--subject", "physique-chimie", "--batch"]);
    expect(status, out).toBe(0);
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
      const { status, out } = dryRun(["pc-4e-electricite", "--batch", ...extra]);
      expect(status, out).toBe(0);
      return Object.fromEntries([...out.matchAll(/estimation (\w+) \(batch\).*?empreinte ([0-9a-f]{16})/g)].map((m) => [m[1], m[2]]));
    };
    const d = hashes([]), s = hashes(["--dossier-model", "sonnet"]);
    expect(d.dossier).toMatch(/^[0-9a-f]{16}$/);
    expect(s.dossier).not.toBe(d.dossier);
    expect(s.chapter).toBe(d.chapter);
  }, 60_000);
  it("dossier déjà présent : conservé, empreinte et modèle tracés ; même empreinte que l'estimation", () => {
    const est = dryRun(["pc-4e-electricite", "--batch"]).out.match(/estimation dossier \(batch\).*?empreinte ([0-9a-f]{16})/)![1];
    const { status, out } = dryRun(["pc-4e-electricite", "--batch"], { "research/dossiers/pc-4e-electricite.md": "# Dossier de test\n" });
    expect(status, out).toBe(0);
    expect(out).toMatch(new RegExp(`dossier : research/dossiers/pc-4e-electricite\\.md existe déjà, conservé \\(modèle claude-haiku-5-5, empreinte ${est}\\)`));
  }, 60_000);
  it("PIPELINE_ROOT refusé hors dry-run", () => {
    const r = spawnSync("npx", ["tsx", "pipeline/run.ts", "pc-4e-electricite", "--submit"], { encoding: "utf8", env: { ...process.env, ANTHROPIC_API_KEY: "", PIPELINE_ROOT: tmpdir() } });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/réservé au dry-run/);
  });
});

describe("prompts du collège : empreintes inchangées par l'étape B (blocs lycée)", () => {
  // sha256 (16) des prompts résolus pour le collège, relevés avant l'étape B ; chapter.md modifié ensuite par A et C
  // (empreinte de l'étape chapitre seule changée ; dossier, fix, criblage et relecture inchangés). Une modification volontaire d'un prompt
  // du collège met à jour cette table dans le même commit, avec sa justification.
  const COLLEGE_PROMPTS: Record<string, string> = {
    // chapter : modifié volontairement (propositions A et C, 2026-11-15 ; variable {{TAXONOMY}}, 2026-11-18). L'empreinte
    // est prise avec {{TAXONOMY}} vide (chapitre sans taxonomie verrouillée) : prompt résolu identique à celui d'avant.
    "mathematiques/system": "2fdf1cdcf55b1430", "mathematiques/dossier": "9ed40b191a3c9c20", "mathematiques/chapter": "54ec615f95f20d67",
    "mathematiques/fix": "ecc7a2b99610772e", "mathematiques/review": "f84f4e7803af6a9c",
    "physique-chimie/system": "c42697dd748044e1", "physique-chimie/dossier": "1eaaa1b02eda782d", "physique-chimie/chapter": "0cce633843c2cc8b", // idem
    "physique-chimie/fix": "ecc7a2b99610772e", "physique-chimie/review": "216835bdc19e6453",
  };
  it("prompts résolus identiques", () => {
    for (const [k, h] of Object.entries(COLLEGE_PROMPTS)) {
      const [subj, f] = k.split("/") as ["mathematiques" | "physique-chimie", string];
      const t = promptSections(readFileSync(`pipeline/prompts/${f}.md`, "utf8"), sectionKeys(subj, "3e")).replace("{{TAXONOMY}}", "").replace("{{FINDINGS}}", "");
      expect(createHash("sha256").update(t).digest("hex").slice(0, 16), k).toBe(h);
    }
  });
  it("dry-run de la fiche 1re : parcours contrôlé, palier Opus pour le chapitre (démonstration exigible)", () => {
    const { status, out } = dryRun(["math-1re-spe-second-degre", "--level", "1re", "--parcours", "specialite", "--batch"]);
    expect(status, out).toBe(0);
    expect(out).toContain("contrôle des données : OK (1re, mathematiques, m1-second-degre, SCI-1RE-MATH-001)");
    expect(out).toContain(`chapter=${MODELS.opus}`);
    expect(dryRun(["math-1re-spe-second-degre", "--parcours", "tronc-commun"]).status).not.toBe(0);
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
    expect(m.sources).toHaveLength(4); // BO n° 22 ajouté aux officialSources (C2 du 2026-11-15, décision du 2026-11-18)
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

describe("correction automatique : seulement un brouillon produit par le pipeline (bloc META)", () => {
  const spec = JSON.parse(readFileSync("pipeline/chapters/pc-4e-electricite.json", "utf8"));
  const meta = metaBlock(spec, [{ chapter: "pc-4e-lois-electricite", kind: "officiel 4e", objectives: [{ id: "P4-E-01", text: "Protocole." }] }]);
  const withMeta = injectMeta('import type { ChapterContent } from "../schema";\nexport const x: ChapterContent = { ...META } as never;\n', meta);
  it("chapitre avec META draft : corrigeable", () => expect(isPipelineDraft(withMeta)).toBe(true));
  it("chapitre avec META publié : non corrigeable", () => expect(isPipelineDraft(withMeta.replace('"publicationStatus": "draft"', '"publicationStatus": "published"'))).toBe(false));
  it("brouillons écrits à la main (sans META) : jamais corrigés, même en draft", () => {
    for (const id of ["math-3e-puissances-calculs"]) { // Pythagore : META injecté le 2026-11-18 (test ci-dessous)
      const src = readFileSync(`src/lib/chapters/data/${id}.ts`, "utf8");
      expect(src).toMatch(/publicationStatus: "draft"/);
      expect(isPipelineDraft(src), id).toBe(false);
    }
  });
  it("« draft » hors du bloc META ignoré", () => expect(isPipelineDraft('const a = { "publicationStatus": "draft" };')).toBe(false));
  it("chapitre PC du pilote (produit par le pipeline) : corrigeable", () => expect(isPipelineDraft(readFileSync("src/lib/chapters/data/pc-4e-electricite.ts", "utf8"))).toBe(true));
  it("Pythagore (décision du 2026-11-18) : META injecté → corrigeable ; provenance notée, BO 22 dans les sources du META", () => {
    const f = readFileSync("src/lib/chapters/data/math-3e-pythagore.ts", "utf8");
    expect(isPipelineDraft(f)).toBe(true);
    expect(f).toContain("corrigé à la main\n// (commit 49ad9ce, lot QA C1–C8)");
    expect(f.slice(f.indexOf(META_START))).toContain('"id": "bo-2019-22-pdf"');
  });
});

describe("correction automatique : chemin complet en dry-run (fixture)", () => {
  const ledgerChapter = [
    { type: "reserve", id: "c1", at: "2026-11-17T00:00:00Z", chapter: "pc-4e-electricite", step: "chapter", inputHash: "x", mode: "batch", maxUsd: 0.4, model: "claude-sonnet-5-5" },
    { type: "submitted", id: "c1", at: "2026-11-17T00:00:01Z", batchId: "msgbatch_test" },
    { type: "actual", id: "c1", at: "2026-11-17T00:10:00Z", usd: 0.37, model: "claude-sonnet-5-5" },
  ].map((e) => JSON.stringify(e)).join("\n") + "\n";
  it("chapitre du pipeline (META) en échec de validation : tour de correction 1 prévu (Sonnet, problème majeur)", () => {
    const { status, out } = dryRun(["pc-4e-electricite", "--batch"], {
      "research/dossiers/pc-4e-electricite.md": "# Dossier\n",
      "src/lib/chapters/data/pc-4e-electricite.ts": readFileSync("src/lib/chapters/data/pc-4e-electricite.ts", "utf8"),
      "pipeline/.store/ledger.jsonl": ledgerChapter,
    }, true);
    expect(out).toMatch(/validation : échecs/);
    expect(out).toMatch(/fix \(tour 1\/2\) \[claude-sonnet-5-5\]/);
    expect(out).not.toMatch(/jamais modifié par l'IA/);
    expect(status, out).toBe(0);
  }, 180_000);
  it("brouillon écrit à la main (sans META) en échec : aucune correction, needs-human", () => {
    const src = readFileSync("src/lib/chapters/data/pc-4e-electricite.ts", "utf8");
    const a = src.indexOf(META_START), b = src.indexOf("// </pipeline:meta>");
    const manual = src.slice(0, a) + src.slice(a, b).replace(/^\/\/ <pipeline:meta>.*$/m, "// métadonnées écrites à la main") + src.slice(b).replace("// </pipeline:meta>", "");
    const { status, out } = dryRun(["pc-4e-electricite", "--batch"], {
      "research/dossiers/pc-4e-electricite.md": "# Dossier\n",
      "src/lib/chapters/data/pc-4e-electricite.ts": manual,
      "pipeline/.store/ledger.jsonl": ledgerChapter,
    }, true);
    expect(out).not.toMatch(/fix \(tour/);
    expect(status, out).toBe(6);
  }, 180_000);
});

describe("criblage sans réflexion (run 39 : sortie entièrement consommée par la réflexion)", () => {
  it("criblage Haiku : thinking disabled ; autres étapes : adaptatif par défaut", () => {
    expect(thinkingParam("screen", MODELS.haiku)).toEqual({ type: "disabled" });
    for (const st of ["dossier", "chapter", "fix", "review"] as const) expect(thinkingParam(st, STEP_CONFIG[st].model)).toBeUndefined();
  });
  it("refusé hors Haiku (400 sur Opus 5.5 / Sonnet 5.5)", () => expect(() => thinkingParam("screen", MODELS.sonnet)).toThrow(/non accepté/));
});

describe("marge de sortie (décision du 2026-11-17)", () => {
  it("chapitre Opus : 96 000 ; chapitre Sonnet 96 000 (décision du 2026-11-18) ; dossier 12 000", () => {
    expect(maxTokensFor("chapter", MODELS.opus)).toBe(OPUS_CHAPTER_MAX_TOKENS);
    expect(OPUS_CHAPTER_MAX_TOKENS).toBe(96000);
    expect(maxTokensFor("chapter", MODELS.sonnet)).toBe(96000);
    expect(truncationRisk("chapter", MODELS.sonnet)).toBeNull();
    expect(maxTokensFor("dossier", MODELS.haiku)).toBe(12000);
    expect(maxTokensFor("fix", MODELS.opus)).toBe(STEP_CONFIG.fix.maxTokens);
  });
});

describe("M17 minimal : nouvel envoi motivé, une seule fois, seulement sans résultat utilisable", () => {
  const base: LedgerEntry[] = [
    { type: "reserve", id: "s1", at: "t", chapter: "c", step: "screen", inputHash: "h", mode: "batch", maxUsd: 0.004, model: MODELS.haiku },
    { type: "submitted", id: "s1", at: "t", batchId: "b1" },
    { type: "actual", id: "s1", at: "t", usd: 0.004 },
  ];
  const unusable: LedgerEntry[] = [...base, { type: "outcome", id: "s1", at: "t", stopReason: "max_tokens", usable: false }];
  it("accepté : empreinte suffixée, rattaché à l'opération d'origine", () => {
    expect(retryPlan(unusable, "c", "screen", "h", "réflexion a consommé max_tokens")).toEqual({ hash: "h" + RETRY_SUFFIX, retryOf: "s1" });
  });
  it("refusé : second nouvel envoi", () => {
    const after: LedgerEntry[] = [...unusable, { type: "reserve", id: "s2", at: "t", chapter: "c", step: "screen", inputHash: "h" + RETRY_SUFFIX, mode: "batch", maxUsd: 0.004, retryOf: "s1", retryReason: "x" }];
    expect(retryPlan(after, "c", "screen", "h", "encore")).toMatchObject({ error: expect.stringMatching(/déjà fait/) });
  });
  it("refusé : résultat utilisable, opération absente, motif vide", () => {
    expect(retryPlan(base, "c", "screen", "h", "motif")).toMatchObject({ error: expect.stringMatching(/utilisable/) });
    expect(retryPlan(unusable, "c", "review", "h", "motif")).toMatchObject({ error: expect.stringMatching(/aucune opération/) });
    expect(retryPlan(unusable, "c", "screen", "h", "  ")).toMatchObject({ error: expect.stringMatching(/obligatoire/) });
  });
});

describe("calcul littéral : dossier approuvé (décision du 2026-11-18)", () => {
  const inv = JSON.parse(readFileSync("research/curriculum/mathematiques/curriculum-math.json", "utf8")) as { grades: { domains: { chapters: { objectives: { id: string; level?: Record<string, string>; competences?: string[]; classification?: { status: string } }[] }[] }[] }[] };
  const all = inv.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters.flatMap((c) => c.objectives)));
  const fiche = JSON.parse(readFileSync("pipeline/chapters/math-3e-calcul-litteral.json", "utf8")) as { objectiveLevels: Record<string, string>; optionalObjectives: string[] };
  it("G1 appliqué : 7 objectifs classés et validés ; G2 : 4 objectifs exigibles vérifiés, consolidation hors porte", () => {
    const ids = Object.keys(fiche.objectiveLevels);
    expect(ids).toHaveLength(7);
    for (const id of ids) expect(all.find((o) => o.id === id)?.classification?.status, id).toBe("validé");
    expect(g2Missing(all.filter((o) => ids.includes(o.id)), "3e", fiche.objectiveLevels)).toEqual([]);
    expect(fiche.optionalObjectives).toEqual(ids.filter((id) => fiche.objectiveLevels[id] === "consolidation"));
  });
  it("dry-run : Gate 1 et porte G2 atteints ; optionalObjectives inconnu refusé", () => {
    const { status, out } = dryRun(["math-3e-calcul-litteral", "--batch"]);
    expect(status, out).toBe(0);
    expect(out).not.toMatch(/Gate 1 non atteint|porte G2/);
    const bad = dryRun(["math-3e-calcul-litteral", "--batch"], { "pipeline/chapters/math-3e-calcul-litteral.json": JSON.stringify({ ...fiche, optionalObjectives: ["M9-XX-99"] }) });
    expect(bad.status).not.toBe(0);
    expect(bad.out).toContain("optionalObjectives : objectif(s) absent(s) du chapitre : M9-XX-99");
  }, 60_000);
  it("prompt du chapitre modifié : un chapitre existant n'est pas régénéré sans --force", () => {
    // Taxonomie verrouillée → {{TAXONOMY}} non vide → nouvelle empreinte de l'étape chapitre ; le fichier existant est gardé
    // (la suite du dry-run s'arrête à la validation, faute de code source dans ce fixture : hors sujet ici).
    const { out } = dryRun(["math-3e-pythagore", "--batch"], { "src/lib/chapters/data/math-3e-pythagore.ts": readFileSync("src/lib/chapters/data/math-3e-pythagore.ts", "utf8"), "project/reports/SCI-3E-MATH-017-QA-api-run28.md": readFileSync("project/reports/SCI-3E-MATH-017-QA-api-run28.md", "utf8") });
    expect(out).toContain("chapter : src/lib/chapters/data/math-3e-pythagore.ts existe déjà, conservé (--force pour le régénérer).");
  }, 60_000);
});
