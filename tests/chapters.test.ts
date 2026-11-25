import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_CHAPTERS } from "../src/lib/chapters";
import { describeChapter } from "./chapter-suite";
import { chapterTexts, instanceTexts, vouvoiement, vouvoiementIssues } from "../src/lib/engine/diagnostics";
import { createRng } from "../src/lib/engine/rng";
import { adapt, calcFeedback, calcQuestion, erreursConfig, flashAnswerTex, flashConfig, flashFeedback, flashPick, lineFeedback, lineRound, parseRel, type CalcLevel, type ErrItem, type FlashLevel, type LineLevel } from "../src/lib/games/logic";

describe("tutoiement de l'interface élève", () => {
  it("aucun « vous / votre / vos » ni impératif en -ez hors espace enseignant", () => {
    const root = join(__dirname, "../src");
    const files = (readdirSync(root, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f) && !/(^|\/)admin\//.test(f) && f !== join("lib", "engine", "diagnostics.ts")); // diagnostics.ts : définition de la règle (aucun texte élève)
    const bad: string[] = [];
    for (const f of files) {
      readFileSync(join(root, f), "utf8").split("\n").forEach((line, i) => {
        if (vouvoiement(line)) bad.push(`${f}:${i + 1}`); // même règle que validate-chapter
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
    "math-3e-pythagore": "1798901b94c1be9b4aa51032c14aed3243dc3b7d356297de92987af63de285ae", // META (2026-11-18) + correction pipeline run 56 + corrections manuelles du 2026-11-22 (py3-20 niveau 5, décisions 7 et 8)
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

describe("proposition C : constructeurs compacts des jeux = écriture développée", () => {
  it("calcul-flash et chasse-erreurs de l'arithmétique 3e reconstruits à l'identique", () => {
    const c = ALL_CHAPTERS.find((x) => x.id === "math-3e-arithmetique")!;
    const flash = c.games.find((g) => g.template === "calcul-flash")!.config as { duration: number; practiceCount: number; levels: FlashLevel[] };
    const rows = flash.levels.map((l) => [l.label, l.items.map((i) => [i.q, i.answer, i.explanation, ...(i.irreducible ? [true] : [])])] as [string, [string, string, string, boolean?][]]);
    expect(flashConfig(rows, flash.duration, flash.practiceCount)).toEqual(flash);
    const err = c.games.find((g) => g.template === "chasse-erreurs")!.config as { items: ErrItem[] };
    const erows = err.items.map((i) => (i.correct ? [i.niveau, i.calc, i.explanation] : [i.niveau, i.calc, i.explanation, i.errors!, i.error!]) as Parameters<typeof erreursConfig>[0][number]);
    expect(erreursConfig(erows)).toEqual(err);
  });
});

describe("tutoiement : tous les textes élève contrôlés par validate-chapter", () => {
  const base = ALL_CHAPTERS.find((x) => x.id === "math-3e-arithmetique")!;
  const clone = () => JSON.parse(JSON.stringify({ ...base, exercises: base.exercises.map(({ vary: _v, ...e }) => e) }));
  const flagged = (c: Parameters<typeof chapterTexts>[0]) => vouvoiementIssues(chapterTexts(c)).map((i) => i.where);
  it("règle : vous / votre / vos et impératif en -ez ; exceptions chez, assez, nez, rez-de-chaussée", () => {
    expect(vouvoiement("Calculez la somme.")).toBe("Calculez");
    expect(vouvoiement("Donne votre réponse.")).toBe("votre");
    expect(vouvoiement("Vos résultats")).toBe("Vos");
    for (const ok of ["Calcule la somme.", "Il habite chez Léa, au rez-de-chaussée.", "C'est assez grand, le nez en l'air.", "$x = 2$"]) expect(vouvoiement(ok)).toBeNull();
  });
  const chapterCases: [string, (c: any) => void, RegExp][] = [
    ["titre du chapitre", (c) => { c.title = "Révisez"; }, /^chapter\.title$/],
    ["prérequis", (c) => { c.prerequisites[0].text = "Connaissez les multiples."; }, /^chapter\.prerequisites\[0\]\.text$/],
    ["texte d'objectif (résumé d'exercice)", (c) => { c.officialObjectives[0].text = "Vous savez décomposer."; }, /^chapter\.officialObjectives\[0\]$/],
    ["cours : introduction", (c) => { c.lesson.introduction = "Vous allez apprendre."; }, /^lesson\.introduction$/],
    ["cours : définition", (c) => { c.lesson.definitions[0].text = "Retenez ceci."; }, /^lesson\.definitions\[0\]\.text$/],
    ["cours : exemple résolu (étape)", (c) => { c.lesson.workedExamples[0].steps[0] = "Divisez par 2."; }, /^lesson\.workedExamples\[0\]\.steps\[0\]$/],
    ["cours : illustration (alt)", (c) => { c.lesson.illustrations[0].alt = "Observez la figure."; }, /^lesson\.illustrations\[0\]\.alt$/],
    ["cours : erreur fréquente", (c) => { c.lesson.commonMistakes[0].why = "Vous oubliez un facteur."; }, /^lesson\.commonMistakes\[0\]\.why$/],
    ["cours : méthode", (c) => { c.lesson.methods[0].steps[0] = "Cherchez un diviseur."; }, /^lesson\.methods\[0\]\.steps\[0\]$/],
    ["cours : résumé et fiche de révision", (c) => { c.lesson.summary[0] = "Notez bien."; c.lesson.revisionSheet.skills[0] = "Vérifiez."; }, /^lesson\.(summary|revisionSheet\.skills)\[0\]$/],
    ["cours : mini-quiz (question, option, explication)", (c) => { c.lesson.miniQuiz[0].options[1] = "Votre choix"; }, /^lesson\.miniQuiz\[0\]\.options\[1\]$/],
    ["exercice : titre", (c) => { c.exercises[0].title = "Repérez votre hypoténuse"; }, /^ari3-01\.title$/],
    ["exercice : raisonnement", (c) => { c.exercises[0].reasoning = "Pensez au PGCD."; }, /^ari3-01\.reasoning$/],
    ["exercice : indice", (c) => { c.exercises[0].hints[0] = "Essayez 2."; }, /^ari3-01\.hints\[0\]$/],
    ["jeu : titre, objectif, consignes", (c) => { c.games[0].instructions = "Répondez vite."; }, /^ari3-jeu-flash\.instructions$/],
    ["jeu : question et explication flash", (c) => { c.games[0].config.levels[0].items[0].explanation = "Vous divisez."; }, /^ari3-jeu-flash\.config\.levels\[0\]\.items\[0\]\.explanation$/],
    ["jeu : chasse-erreurs (calcul, erreurs proposées)", (c) => { c.games[1].config.items[0].errors[0] = "Vous avez oublié 1"; }, /^ari3-jeu-erreurs\.config\.items\[0\]\.errors\[0\]$/],
    ["jeu : memory (carte)", (c) => { c.games[2].config.pairs[0][1] = "votre carte"; }, /^ari3-jeu-memory\.config\.pairs\[0\]\[1\]$/],
  ];
  for (const [name, mutate, where] of chapterCases) it(`signalé : ${name}`, () => {
    const c = clone(); mutate(c);
    const w = flagged(c);
    expect(w.length, w.join(", ")).toBeGreaterThan(0);
    expect(w.every((x) => where.test(x)), w.join(", ")).toBe(true);
  });
  it("code SVG et motifs de saisie (match) ignorés ; chapitre d'origine sans signalement", () => {
    const c = clone();
    c.lesson.illustrations[0].svg = '<svg aria-label="Regardez"></svg>';
    expect(flagged(c)).toEqual([]);
    expect(vouvoiementIssues(instanceTexts({ statement: "s", parts: [{ interaction: { kind: "numerique", answer: { value: 1 } }, mistakes: [{ match: "vous", feedback: "Revois la règle." }] }], solution: ["ok"] }, "x"))).toEqual([]);
  });
  const inter = (interaction: object, extra: object = {}) => vouvoiementIssues(instanceTexts({ statement: "Énoncé.", parts: [{ interaction, ...extra }], solution: ["Correction."] } as never, "ex")).map((i) => i.where);
  const instanceCases: [string, () => string[], string][] = [
    ["énoncé", () => vouvoiementIssues(instanceTexts({ statement: "Calculez $x$.", parts: [], solution: [] } as never, "ex")).map((i) => i.where), "ex.statement"],
    ["correction", () => vouvoiementIssues(instanceTexts({ statement: "s", parts: [], solution: ["Vous obtenez 4."] } as never, "ex")).map((i) => i.where), "ex.solution[0]"],
    ["figure (étiquette)", () => vouvoiementIssues(instanceTexts({ statement: "s", figure: { kind: "x", labels: ["Placez A"] }, parts: [], solution: [] } as never, "ex")).map((i) => i.where), "ex.figure.labels[0]"],
    ["consigne de partie", () => inter({ kind: "numerique", answer: { value: 1 } }, { prompt: "Donnez la valeur." }), "ex.parts[0].prompt"],
    ["diagnostic (feedback)", () => inter({ kind: "numerique", answer: { value: 1 } }, { mistakes: [{ match: "2", feedback: "Vous avez doublé." }] }), "ex.parts[0].mistakes[0].feedback"],
    ["QCM : option", () => inter({ kind: "qcm", options: ["a", "Votre réponse"], answer: [0] }), "ex.parts[0].interaction.options[1]"],
    ["vrai-faux : affirmation", () => inter({ kind: "vrai-faux", items: ["Vous avez raison"], answer: [true] }), "ex.parts[0].interaction.items[0]"],
    ["numérique : label et suffixe", () => inter({ kind: "numerique", label: "Entrez $x$", answer: { value: 1 } }), "ex.parts[0].interaction.label"],
    ["texte à trous : gabarit", () => inter({ kind: "texte-trous", template: "Complétez [[0]]", blanks: [] }), "ex.parts[0].interaction.template"],
    ["texte à trous : options de liste", () => inter({ kind: "texte-trous", template: "[[0]]", blanks: [{ type: "select", options: ["oui", "Choisissez"], answer: 0 }] }), "ex.parts[0].interaction.blanks[0].options[1]"],
    ["texte libre : réponse acceptée affichée", () => inter({ kind: "texte-libre", answer: ["vous"] }), "ex.parts[0].interaction.answer[0]"],
    ["glisser-déposer : zones et étiquettes", () => inter({ kind: "glisser-deposer", zones: ["Votre zone"], tokens: ["a"], answer: [0] }), "ex.parts[0].interaction.zones[0]"],
    ["associer : colonnes", () => inter({ kind: "associer", left: ["a"], right: ["vos nombres"], answer: [0] }), "ex.parts[0].interaction.right[0]"],
    ["classer : catégories", () => inter({ kind: "classer", categories: ["Vos premiers"], items: ["2"], answer: [0] }), "ex.parts[0].interaction.categories[0]"],
    ["ordonner : indice", () => inter({ kind: "ordonner", items: ["a", "b"], answer: [1, 0], hint: "Commencez par a" }), "ex.parts[0].interaction.hint"],
    ["étapes : consigne d'étape", () => inter({ kind: "etapes", steps: [{ prompt: "Calculez $a$", answer: { value: 1 } }] }), "ex.parts[0].interaction.steps[0].prompt"],
    ["repère : nom de point", () => inter({ kind: "repere", xmin: 0, xmax: 1, ymin: 0, ymax: 1, step: 1, points: [{ label: "Placez A", answer: [0, 0] }] }), "ex.parts[0].interaction.points[0].label"],
  ];
  for (const [name, run, where] of instanceCases) it(`signalé dans un tirage : ${name}`, () => expect(run()).toEqual([where]));
});

describe("QA tier 2 : chapitre ↔ taxonomie verrouillée (validate-chapter)", () => {
  it("Pythagore : écarts connus (correction ciblée A) tous corrigés — run 56 + niveau de py3-20 à la main", async () => {
    const { spawnSync } = await import("node:child_process");
    const r = spawnSync("npx", ["tsx", "scripts/validate-chapter.ts", "math-3e-pythagore", "--json", "--seeds", "3"], { encoding: "utf8" });
    const out = JSON.parse(r.stdout.trim().split("\n").pop() ?? "{}") as { summary: { taxonomy: string }; issues: { where: string; problem: string }[] };
    expect(out.summary.taxonomy).toBe("verrouillé");
    const tier2 = out.issues.map((i) => `${i.where} | ${i.problem}`);
    // Avant correction : py3-03 niveau 1 hors PY-T06, PY-T11 sans exercice, py3-20 titré « Type Brevet — » (détecteurs : tests taxonomyIssues ci-dessous).
    expect(tier2).toEqual([]);
  }, 120_000);
  it("taxonomyTypes (décision du 2026-11-18) : exigé si la taxonomie verrouillée ne liste aucun exercice ; type inconnu, niveau hors plage, approfondissement contrôlés", async () => {
    const { taxonomyIssues } = await import("../scripts/validate-chapter");
    const tax = JSON.parse(readFileSync("research/curriculum/mathematiques/taxonomy/math-3e-calcul-litteral.json", "utf8"));
    const base = ALL_CHAPTERS.find((c) => c.id === "math-3e-arithmetique")!;
    const ex = (id: string, niveau: 1 | 2 | 3 | 4 | 5, taxonomyTypes?: string[], title = "Exercice") => ({ ...base.exercises[0], id, niveau, title, taxonomyTypes });
    const required = tax.types.filter((t: { level?: string; countsTowardCompleteness?: boolean }) => t.level !== "approfondissement" && t.countsTowardCompleteness !== false);
    const covering = required.map((t: { id: string; difficulty: number[] }, i: number) => ex(`cl3-${String(i + 1).padStart(2, "0")}`, t.difficulty[0] as 1, [t.id]));
    const run = (exercises: object[], t = tax) => taxonomyIssues({ ...base, exercises } as never, t).map((i) => `${i.where} | ${i.problem}`);
    expect(run(covering)).toEqual([]);
    expect(run([...covering, ex("cl3-90", 2)])).toEqual(["cl3-90 | taxonomyTypes manquant (taxonomie verrouillée sans liste d'exercices)"]);
    expect(run([...covering, ex("cl3-91", 2, ["CL-T99"])])).toEqual(["cl3-91 | type inconnu dans taxonomyTypes : CL-T99"]);
    expect(run([...covering, ex("cl3-92", 1, ["CL-T08"])])).toEqual(["cl3-92 | niveau 1 hors de la difficulté du type CL-T08 (3, 4, 5)"]);
    expect(run([...covering, ex("cl3-93", 4, ["CL-T10"], "Type Brevet — aire")])).toEqual(["cl3-93 | exercice d'approfondissement présenté en évaluation finale (titre « Type … — »)"]);
    expect(run([...covering, ex("cl3-94", 4, ["CL-T10", "CL-T06"])])).toEqual(["cl3-94 | exercice d'approfondissement rattaché à un type obligatoire (CL-T06)"]);
    expect(run(covering.slice(1))).toEqual([`taxonomie:${required[0].id} | type obligatoire sans exercice`]);
    // Taxonomie non verrouillée : signalée, et le champ n'est pas exigé (rattachement par listes seulement).
    expect(run([...covering, ex("cl3-95", 2)], { ...tax, status: "proposé" })).toEqual(["taxonomie | taxonomie non verrouillée (statut « proposé »)", "cl3-95 | exercice rattaché à aucun type de la taxonomie"]);
  });
  it("schéma : taxonomyTypes facultatif, identifiants de type contrôlés", async () => {
    const { ChapterSchema } = await import("../src/lib/chapters/schema");
    const base = ALL_CHAPTERS.find((c) => c.id === "math-3e-arithmetique")!;
    const withTypes = (t: string[]) => ChapterSchema.safeParse({ ...base, exercises: [{ ...base.exercises[0], taxonomyTypes: t }, ...base.exercises.slice(1)] }).success;
    expect(ChapterSchema.safeParse(base).success).toBe(true);
    expect(withTypes(["CL-T04"])).toBe(true);
    expect(withTypes(["cl-t4"])).toBe(false);
    expect(withTypes([])).toBe(false);
  });
  it("chapitre sans taxonomie : QA tier 2 non évaluée, pas d'échec", async () => {
    const { spawnSync } = await import("node:child_process");
    const r = spawnSync("npx", ["tsx", "scripts/validate-chapter.ts", "math-5e-nombres-relatifs", "--json", "--seeds", "3"], { encoding: "utf8" });
    const out = JSON.parse(r.stdout.trim().split("\n").pop() ?? "{}") as { summary: { taxonomy: string; ok: boolean } };
    expect(out.summary).toMatchObject({ taxonomy: "absente", ok: true });
  }, 120_000);
});

describe("catalogue des chapitres (interface)", () => {
  it("résumé fidèle aux données : brouillon non cliquable, chiffres réels, libellé sans chapitre", async () => {
    const { chapterSummary, levelCounts, countsLabel } = await import("../src/components/ui");
    const all = ALL_CHAPTERS.map((c) => chapterSummary(c, c.publicationStatus === "published"));
    for (const s of all) {
      const c = ALL_CHAPTERS.find((x) => x.id === s.id)!;
      expect(s.exercises).toBe(c.exercises.length);
      expect(s.games).toBe(c.games.length);
      expect(s.href === null).toBe(c.publicationStatus !== "published");
      expect(JSON.stringify(s)).not.toMatch(/"answer"|"mistakes"/);
    }
    const k3 = levelCounts(all, "3e", null);
    expect(k3.total).toBe(ALL_CHAPTERS.filter((c) => c.grade === "3e").length);
    expect(k3.published + k3.unpublished).toBe(k3.total);
    expect(countsLabel({ total: 0, published: 0, unpublished: 0, themes: 12 })).toBe("12 thèmes du programme, chapitres en préparation");
    expect(countsLabel({ total: 6, published: 2, unpublished: 4, themes: 16 })).toBe("6 chapitres (2 publiés, 4 brouillons)");
    expect(countsLabel({ total: 1, published: 1, unpublished: 0, themes: 7 })).toBe("1 chapitre (1 publié)");
  });
});
