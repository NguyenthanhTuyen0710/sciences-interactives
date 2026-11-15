import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_CHAPTERS } from "../src/lib/chapters";
import { describeChapter } from "./chapter-suite";
import { createRng } from "../src/lib/engine/rng";
import { adapt, calcFeedback, calcQuestion, flashAnswerTex, flashFeedback, flashPick, lineFeedback, lineRound, parseRel, type CalcLevel, type LineLevel } from "../src/lib/games/logic";

describe("tutoiement de l'interface élève", () => {
  it("aucun « vous / votre / vos » ni impératif en -ez hors espace enseignant", () => {
    const root = join(__dirname, "../src");
    const files = (readdirSync(root, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f) && !/(^|\/)admin\//.test(f));
    const bad: string[] = [];
    for (const f of files) {
      readFileSync(join(root, f), "utf8").split("\n").forEach((line, i) => {
        if (/\b(vous|votre|vos)\b/i.test(line) || /\b(?!(?:chez|assez|nez|rez)\b)[a-zéèêîô]{3,}ez\b(?!-de)/i.test(line.replace(/rez-de-chaussée/g, ""))) bad.push(`${f}:${i + 1}`);
      });
    }
    expect(bad).toEqual([]);
  });
});

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

describe("correspondance d'objectifs inventaire → chapitre (research/curriculum/*/objective-map.json)", () => {
  for (const subject of ["mathematiques", "physique-chimie"]) {
    const file = `research/curriculum/${subject}/objective-map.json`;
    if (!existsSync(file)) continue;
    const map = JSON.parse(readFileSync(file, "utf8")).chapters as Record<string, Record<string, string[]>>;
    for (const [chapterId, entries] of Object.entries(map)) {
      it(`${chapterId} : toutes les cibles existent dans le chapitre`, () => {
        const c = ALL_CHAPTERS.find((x) => x.id === chapterId);
        expect(c, `chapitre ${chapterId} non inscrit`).toBeDefined();
        const own = new Set(c!.officialObjectives.map((o) => o.id));
        for (const [inv, targets] of Object.entries(entries)) for (const t of targets) expect(own.has(t), `${inv} → ${t}`).toBe(true);
      });
    }
  }
});

describe("inventaire : niveaux d'exigence et compétences (8a)", () => {
  const LEVELS = ["exigible", "consolidation", "approfondissement"];
  const COMPETENCES = ["Chercher", "Modéliser", "Représenter", "Raisonner", "Calculer", "Communiquer"];
  const inv = JSON.parse(readFileSync("research/curriculum/mathematiques/curriculum-math.json", "utf8"));
  const objs = inv.grades.flatMap((g: { domains: { chapters: { objectives: Record<string, unknown>[] }[] }[] }) => g.domains.flatMap((d) => d.chapters.flatMap((c) => c.objectives)));
  it("valeurs autorisées seulement (programme cycle 4 2020, p. 129)", () => {
    for (const o of objs.filter((x: Record<string, unknown>) => x.level || x.competences)) {
      for (const l of Object.values(o.level as Record<string, string>)) expect(LEVELS, `${o.id}`).toContain(l);
      for (const c of o.competences as string[]) expect(COMPETENCES, `${o.id}`).toContain(c);
      expect((o.notions as string[]).length, `${o.id}`).toBeGreaterThan(0);
    }
  });
  it("objectifs du pilote Pythagore classés", () => {
    for (const id of ["M4-EG-03", "M4-EG-04", "M3-AUTO-03"]) expect(objs.find((o: { id: string }) => o.id === id)?.level, id).toBeDefined();
  });
});

describe("M3 étape B (lycée) : collège inchangé, schéma lycée, master généré", () => {
  // Instantané du 2026-11-15 (avant l'étape B) : une modification légitime d'un chapitre met à jour cette liste dans le même commit.
  const COLLEGE = {
    "math-3e-arithmetique": "d0cf16f9d03ddd26128e8063073984b7065803cab1c4b2ebbdc22d91cbca985c",
    "math-3e-pourcentages-evolution": "006db69983018ecf2ff05232d80325760722bc4f75309180312835c296a1643b",
    "math-3e-puissances-calculs": "7239a34eb246c59efd5d4486ebdaba4e2167ca918f464c3dc39cd2fcf569adec",
    "math-3e-pythagore": "ee3bc04b5c7fac11dfd9bf4464cf9406fb77d6914e3484e5e2567eb4d84667d6",
    "math-5e-nombres-relatifs": "0e6398cc3698886779ce51491bab71972e32e1800991a9614fae5bbdecf86fcd",
  };
  it("chapitres du collège : mêmes identifiants, mêmes empreintes de fichier, toujours conformes au schéma", async () => {
    const { createHash } = await import("node:crypto");
    const { ChapterSchema } = await import("../src/lib/chapters/schema");
    for (const [id, sha] of Object.entries(COLLEGE)) {
      expect(createHash("sha256").update(readFileSync(`src/lib/chapters/data/${id}.ts`)).digest("hex"), id).toBe(sha);
      const mod = (await import(`../src/lib/chapters/data/${id}`)) as Record<string, { id: string }>;
      const c = Object.values(mod).find((v) => v && typeof v === "object" && "lesson" in v)!;
      expect(c.id).toBe(id);
      expect(ChapterSchema.safeParse(c).success, id).toBe(true);
    }
  });
  it("schéma : lycée avec parcours obligatoire ; collège sans parcours ; niveau de l'id = grade", async () => {
    const { ChapterSchema } = await import("../src/lib/chapters/schema");
    const base = ALL_CHAPTERS.find((c) => c.id === "math-3e-arithmetique")!;
    const ok = (o: object) => ChapterSchema.safeParse({ ...base, ...o }).success;
    expect(ok({ id: "math-1re-spe-second-degre", taskId: "SCI-1RE-MATH-001", grade: "1re", parcours: "specialite" })).toBe(true);
    expect(ok({ id: "math-tle-x", taskId: "SCI-TLE-MATH-001", grade: "Tle", parcours: "maths-expertes" })).toBe(true);
    expect(ok({ id: "math-1re-spe-second-degre", taskId: "SCI-1RE-MATH-001", grade: "1re" })).toBe(false);
    expect(ok({ parcours: "specialite" })).toBe(false);
    expect(ok({ grade: "4e" })).toBe(false);
  });
  it("objectif required: false : hors critère d'achèvement", async () => {
    const { doneIssues } = await import("../src/lib/chapters/schema");
    const base = ALL_CHAPTERS.find((c) => c.id === "math-3e-arithmetique")!;
    const extra = { id: "X-99", text: "Objectif de consolidation", source: "test" };
    expect(doneIssues({ ...base, officialObjectives: [...base.officialObjectives, extra] })).toContain("objectif X-99 sans exercice");
    expect(doneIssues({ ...base, officialObjectives: [...base.officialObjectives, { ...extra, required: false }] })).not.toContain("objectif X-99 sans exercice");
  });
  it("master-curriculum.json = fusion exacte des curriculum-*.json (généré par npm run dashboard, jamais à la main)", () => {
    const read = (f: string) => JSON.parse(readFileSync(f, "utf8"));
    const master = read("research/curriculum/master-curriculum.json");
    const src = [read("research/curriculum/mathematiques/curriculum-math.json"), read("research/curriculum/physique-chimie/curriculum-pc.json")];
    expect(master.subjects).toEqual(src);
    expect(master.generatedAt).toBe(src.map((s) => s.generatedAt).sort().pop());
  });
});
