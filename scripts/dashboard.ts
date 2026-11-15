// Registre de tâches et tableau de bord.
//   npm run dashboard          → régénère project/dashboard.md à partir des enregistrements réels
//   npm run dashboard -- sync  → fusionne les inventaires A1/A3 dans research/curriculum/master-curriculum.json
//                                et crée une tâche TODO par chapitre officiel absent du registre
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ALL_CHAPTERS } from "../src/lib/chapters";
import { doneIssues, REVIEW_KEYS } from "../src/lib/chapters/schema";

const ROOT = new URL("..", import.meta.url).pathname;
const P = (f: string) => ROOT + f;
const readJson = <T>(f: string): T | null => (existsSync(P(f)) ? JSON.parse(readFileSync(P(f), "utf8")) : null);

export const STATES = ["TODO", "RESEARCHING", "RESEARCHED", "AUTHORING", "QA_PENDING", "QA_FAILED", "APPROVED", "INTEGRATED", "PUBLISHED", "BLOCKED"] as const;
type State = (typeof STATES)[number];
interface Task { id: string; kind: "chapter" | "brevet" | "infra" | "research"; title: string; state: State; grade?: string; subject?: string; chapterId?: string; owner?: string; dependsOn?: string[]; files?: string[]; reports?: string[]; blockers?: string[]; next?: string }
interface Ledger { version: 1; updatedAt: string; tasks: Task[] }
interface Objective { id: string; text: string; verified?: boolean }
interface CChapter { id: string; title: string; objectives: Objective[] }
interface CGrade { grade: string; programme?: { reference?: string; status?: string }; domains: { id: string; title: string; chapters: CChapter[] }[] }
interface Curriculum { subject: string; grades: CGrade[] }

const LEDGER = "project/ledger.json";
const ledger = readJson<Ledger>(LEDGER) ?? { version: 1, updatedAt: "", tasks: [] };
const save = () => { ledger.updatedAt = new Date().toISOString(); writeFileSync(P(LEDGER), JSON.stringify(ledger, null, 2) + "\n"); };

function curricula(): Curriculum[] {
  const master = readJson<{ subjects: Curriculum[] }>("research/curriculum/master-curriculum.json");
  if (master) return master.subjects;
  return [readJson<Curriculum>("research/curriculum/mathematiques/curriculum-math.json"), readJson<Curriculum>("research/curriculum/physique-chimie/curriculum-pc.json")].filter(Boolean) as Curriculum[];
}

function sync() {
  const subjects = [readJson<Curriculum>("research/curriculum/mathematiques/curriculum-math.json"), readJson<Curriculum>("research/curriculum/physique-chimie/curriculum-pc.json")].filter(Boolean) as Curriculum[];
  writeFileSync(P("research/curriculum/master-curriculum.json"), JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), note: "Fusion générée par scripts/dashboard.ts sync — ne pas éditer à la main.", subjects }, null, 2) + "\n");
  let added = 0;
  for (const s of subjects) {
    const sub = s.subject === "mathematiques" ? "MATH" : "PC";
    for (const g of s.grades) for (const d of g.domains) for (const c of d.chapters) {
      if (ledger.tasks.some((t) => t.chapterId === c.id)) continue;
      const prefix = `SCI-${g.grade.toUpperCase()}-${sub}-`;
      const n = Math.max(0, ...ledger.tasks.filter((t) => t.id.startsWith(prefix)).map((t) => Number(t.id.slice(prefix.length)))) + 1;
      ledger.tasks.push({ id: prefix + String(n).padStart(3, "0"), kind: "chapter", title: c.title, state: "TODO", grade: g.grade, subject: s.subject, chapterId: c.id, dependsOn: ["SCI-INFRA-002"], next: "A2/A3 : dossier de recherche" });
      added++;
    }
  }
  save();
  console.log(`master-curriculum.json écrit ; ${added} tâche(s) ajoutée(s).`);
}

const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)} %` : "—");

function render() {
  const cur = curricula();
  const chapters = new Map(ALL_CHAPTERS.flatMap((c) => (c.curriculumChapterIds ?? [c.id]).map((id) => [id, c] as const)));
  const out: string[] = [];
  out.push("# Tableau de bord de progression", "", `_Généré par \`npm run dashboard\` le ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC à partir de \`project/ledger.json\`, des inventaires de \`research/curriculum/\` et des données de \`src/lib/chapters/data/\`. Ne pas éditer._`, "");
  out.push("Jalons distincts : **Recherche** (dossier validé) · **Généré** (données de chapitre présentes) · **Validé** (Definition of Done automatique sans écart, six revues QA `pass`) · **Publié** (`publicationStatus = published`).", "");

  out.push("## Par niveau et matière", "", "| Matière | Niveau | Programme | Chapitres officiels | Objectifs (vérifiés) | Recherche | Généré | Validé | Publié |", "|---|---|---|---|---|---|---|---|---|");
  for (const s of cur) for (const g of s.grades) {
    const chs = g.domains.flatMap((d) => d.chapters);
    const objs = chs.flatMap((c) => c.objectives);
    const tasks = chs.map((c) => ledger.tasks.find((t) => t.chapterId === c.id));
    const researched = tasks.filter((t) => t && STATES.indexOf(t.state) >= STATES.indexOf("RESEARCHED") && t.state !== "BLOCKED").length;
    const gen = chs.filter((c) => chapters.has(c.id)).length;
    const val = chs.filter((c) => chapters.has(c.id) && doneIssues(chapters.get(c.id)!).length === 0).length;
    const pub = chs.filter((c) => chapters.get(c.id)?.publicationStatus === "published").length;
    out.push(`| ${s.subject} | ${g.grade} | ${g.programme?.reference ?? "?"} | ${chs.length} | ${objs.length} (${objs.filter((o) => o.verified).length}) | ${researched} (${pct(researched, chs.length)}) | ${gen} (${pct(gen, chs.length)}) | ${val} (${pct(val, chs.length)}) | ${pub} (${pct(pub, chs.length)}) |`);
  }
  if (!cur.length) out.push("| — | — | inventaire officiel non encore produit | | | | | | |");

  out.push("", "## Chapitres produits", "");
  for (const c of ALL_CHAPTERS) {
    const issues = doneIssues(c);
    const objs = c.officialObjectives.map((o) => o.id);
    const byEx = objs.filter((o) => c.exercises.some((e) => e.objectives.includes(o)));
    const byGame = objs.filter((o) => c.games.some((g) => g.objectives.includes(o)));
    out.push(`### ${c.taskId} — ${c.title} (${c.grade}, ${c.subject})`, "",
      `- Publication : **${c.publicationStatus}**`,
      `- Objectifs officiels : ${objs.length} · couverts par le cours : ${objs.length} · par des exercices : ${byEx.length} · par des jeux : ${byGame.length}`,
      `- Exercices : ${c.exercises.length} (niveaux ${[1, 2, 3, 4, 5].map((l) => `${l}:${c.exercises.filter((e) => e.niveau === l).length}`).join(" ")}) · activités : ${c.games.length}`,
      `- Revues QA : ${REVIEW_KEYS.map((k) => `${k} = ${c.reviewStatus[k]}`).join(" · ")}`,
      `- Écarts à la Definition of Done : ${issues.length ? issues.join(" ; ") : "aucun"}`, "");
  }

  out.push("## Registre des tâches", "", "| Tâche | Type | Titre | État | Prochaine action |", "|---|---|---|---|---|");
  const counts: Record<string, number> = {};
  for (const t of ledger.tasks) counts[t.state] = (counts[t.state] ?? 0) + 1;
  for (const t of ledger.tasks.filter((t) => t.kind !== "chapter" || t.state !== "TODO")) out.push(`| ${t.id} | ${t.kind} | ${t.title} | ${t.state} | ${t.next ?? ""} |`);
  out.push("", `Total : ${ledger.tasks.length} tâches — ${STATES.filter((s) => counts[s]).map((s) => `${s} ${counts[s]}`).join(" · ")}. Les tâches de chapitre au statut TODO ne sont pas listées individuellement.`, "");
  writeFileSync(P("project/dashboard.md"), out.join("\n"));
  console.log("project/dashboard.md régénéré.");
}

// ───────── Matrice de couverture lisible par machine (source de décision du pipeline, roadmap § 7) ─────────
// research/curriculum/coverage-matrix.json + bloc généré de coverage-matrix.md. Contenu : tous les fichiers de
// src/lib/chapters/data (y compris les brouillons hors registre) ; coût API : registre pipeline/.store/ledger.jsonl
// s'il est présent localement (il vit dans le stockage « data-store », hors Git), sinon null.
export const MATRIX_STATES = ["todo", "researched", "draft", "qa-passed", "published"] as const;
type MatrixState = (typeof MATRIX_STATES)[number];

async function matrix() {
  const { readdirSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const { pathToFileURL } = await import("node:url");
  const { readLedger, ops } = await import("../pipeline/ledger");
  const registered = new Set(ALL_CHAPTERS.map((c) => c.id));
  const objectiveMap = (subject: string) => readJson<{ chapters: Record<string, Record<string, string[]>> }>(`research/curriculum/${subject}/objective-map.json`)?.chapters ?? {};
  const specs = readdirSync(P("pipeline/chapters")).filter((f) => f.endsWith(".json")).sort()
    .map((f) => JSON.parse(readFileSync(P(`pipeline/chapters/${f}`), "utf8")) as { id: string; officialChapterIds: string[] });
  type Loaded = { c: (typeof ALL_CHAPTERS)[number]; file: string; sha256: string };
  const loaded: Loaded[] = [];
  for (const f of readdirSync(P("src/lib/chapters/data")).filter((x) => x.endsWith(".ts")).sort()) {
    const file = `src/lib/chapters/data/${f}`;
    const mod = (await import(pathToFileURL(P(file)).href)) as Record<string, unknown>;
    const c = Object.values(mod).find((v) => v && typeof v === "object" && "lesson" in (v as object) && "exercises" in (v as object)) as Loaded["c"] | undefined;
    if (c) loaded.push({ c, file, sha256: createHash("sha256").update(readFileSync(P(file))).digest("hex") });
  }
  const ledgerFile = P("pipeline/.store/ledger.jsonl");
  const costs = existsSync(ledgerFile) ? ops(readLedger(ledgerFile)) : null;
  // null : registre absent, ou chapitre jamais passé par l'API (produit dans Claude Code).
  const costOf = (id: string) => {
    const mine = costs?.filter((o) => o.reserve?.chapter === id && o.state === "settled") ?? [];
    return mine.length ? Number(mine.reduce((s, o) => s + (o.usd ?? 0), 0).toFixed(5)) : null;
  };

  const rows = curricula().flatMap((s) => s.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters.map((ch) => {
    const hit = loaded.find((l) => l.c.id === ch.id || (l.c.curriculumChapterIds ?? []).includes(ch.id));
    const c = hit?.c;
    const qaPassed = !!c && REVIEW_KEYS.every((k) => c.reviewStatus[k] === "pass");
    const dossier = c ? `research/dossiers/${c.id}.md` : `research/dossiers/${ch.id}.md`;
    const missing: string[] = [];
    if (!c) missing.push("chapitre complet");
    else {
      const issues = doneIssues(c);
      missing.push(...issues);
      // Objectif d'inventaire couvert : même identifiant dans le chapitre, ou correspondance déclarée
      // (research/curriculum/<matière>/objective-map.json) dont toutes les cibles existent dans le chapitre.
      const own = new Set(c.officialObjectives.map((o) => o.id));
      const map = objectiveMap(s.subject)[c.id] ?? {};
      const covered = (id: string) => own.has(id) || (map[id]?.length > 0 && map[id].every((t) => own.has(t)));
      for (const o of ch.objectives) if (!covered(o.id)) missing.push(`objectif ${o.id} non repris dans le chapitre`);
    }
    const state: MatrixState = c?.publicationStatus === "published" ? "published" : qaPassed ? "qa-passed" : c ? "draft" : existsSync(P(dossier)) ? "researched" : "todo";
    return {
      subject: s.subject, grade: g.grade, domain: d.id, chapterId: ch.id, title: ch.title, state,
      objectives: { total: ch.objectives.length, verified: ch.objectives.filter((o) => o.verified).length },
      // Fiche du pipeline (pipeline/chapters/<id>.json) qui produit ce chapitre d'inventaire, ou null.
      pipelineSpec: specs.find((sp) => sp.id === c?.id || sp.id === ch.id || sp.officialChapterIds.includes(ch.id))?.id ?? null,
      content: c && hit ? {
        id: c.id, taskId: c.taskId, file: hit.file, sha256: hit.sha256, registered: registered.has(c.id), publication: c.publicationStatus,
        exercises: c.exercises.length, perLevel: [1, 2, 3, 4, 5].map((l) => c.exercises.filter((e) => e.niveau === l).length),
        games: c.games.length, review: c.reviewStatus, qaPassed, apiCostUsd: costOf(c.id),
      } : null,
      missing,
    };
  }))));

  // Manifests de thèmes (research/curriculum/<matière>/manifest-*.json) : statut dérivé du chapitre complet portant
  // la même tâche (published → PUBLISHED ; six revues pass → APPROVED ; sinon brouillon → QA_PENDING ; absent → TODO).
  for (const subject of ["mathematiques", "physique-chimie"]) {
    const dir = P(`research/curriculum/${subject}`);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => /^manifest-.*\.json$/.test(x))) {
      const file = `research/curriculum/${subject}/${f}`;
      const man = readJson<{ themes: { taskId: string; status: string }[] }>(file)!;
      let changed = 0;
      for (const t of man.themes) {
        const c = loaded.find((l) => l.c.taskId === t.taskId)?.c;
        const status = !c ? "TODO" : c.publicationStatus === "published" ? "PUBLISHED" : REVIEW_KEYS.every((k) => c.reviewStatus[k] === "pass") ? "APPROVED" : "QA_PENDING";
        if (t.status !== status) { t.status = status; changed++; }
      }
      if (changed) { writeFileSync(P(file), JSON.stringify(man, null, 1) + "\n"); console.log(`${file} : ${changed} statut(s) de thème mis à jour.`); }
    }
  }

  const summary = Object.values(rows.reduce<Record<string, { subject: string; grade: string; chapters: number; byState: Record<string, number> }>>((acc, r) => {
    const k = `${r.subject}/${r.grade}`;
    acc[k] ??= { subject: r.subject, grade: r.grade, chapters: 0, byState: {} };
    acc[k].chapters++; acc[k].byState[r.state] = (acc[k].byState[r.state] ?? 0) + 1;
    return acc;
  }, {}));
  writeFileSync(P("research/curriculum/coverage-matrix.json"), JSON.stringify({
    note: "Généré par `npm run dashboard` — ne pas modifier à la main. États : " + MATRIX_STATES.join(" → ") + ". apiCostUsd null = registre des dépenses absent localement (data-store).",
    costsAvailable: !!costs, summary, chapters: rows,
  }, null, 1) + "\n");

  const md = P("research/curriculum/coverage-matrix.md");
  const BEGIN = "<!-- BEGIN GENERATED: npm run dashboard -->", END = "<!-- END GENERATED -->";
  const block = [BEGIN, "## Matrice générée (chapitres de l'inventaire)", "",
    "| Matière | Niveau | Chapitres | " + MATRIX_STATES.join(" | ") + " |", "|---|---|---|" + MATRIX_STATES.map(() => "---").join("|") + "|",
    ...summary.map((s) => `| ${s.subject} | ${s.grade} | ${s.chapters} | ${MATRIX_STATES.map((st) => s.byState[st] ?? 0).join(" | ")} |`), "",
    "| Chapitre d'inventaire | État | Objectifs (vérifiés) | Contenu | Exercices / jeux | QA | Coût API | Manques |", "|---|---|---|---|---|---|---|---|",
    ...rows.filter((r) => r.state !== "todo").map((r) => `| ${r.chapterId} | ${r.state} | ${r.objectives.total} (${r.objectives.verified}) | ${r.content ? `\`${r.content.id}\`${r.content.registered ? "" : " (hors registre)"}` : "—"} | ${r.content ? `${r.content.exercises} / ${r.content.games}` : "—"} | ${r.content ? (r.content.qaPassed ? "pass" : "en attente") : "—"} | ${r.content?.apiCostUsd ?? "—"} | ${r.missing.slice(0, 3).join(" ; ") || "—"} |`),
    "", `Chapitres d'inventaire au statut \`todo\` : ${rows.filter((r) => r.state === "todo").length} (détail dans \`coverage-matrix.json\`).`, END].join("\n");
  const prev = readFileSync(md, "utf8");
  const next = prev.includes(BEGIN) ? prev.slice(0, prev.indexOf(BEGIN)) + block + prev.slice(prev.indexOf(END) + END.length) : prev.trimEnd() + "\n\n" + block + "\n";
  writeFileSync(md, next);
  console.log(`coverage-matrix.json et bloc généré de coverage-matrix.md écrits (${rows.length} chapitres d'inventaire).`);
}

// ───────── Inscription d'un chapitre produit par le pipeline (job « publish-pr » de generate-lessons.yml) ─────────
//   npm run dashboard -- register <id>
// Contrôle ChapterSchema (obligatoire), inscription dans src/lib/chapters/index.ts (un brouillon reste invisible :
// isVisible exige « published »), tâche de project/ledger.json mise à jour, puis tableau de bord et matrice régénérés.
async function register(id: string) {
  const { pathToFileURL } = await import("node:url");
  const { ChapterSchema } = await import("../src/lib/chapters/schema");
  const file = `src/lib/chapters/data/${id}.ts`;
  if (!/^[a-z0-9-]+$/.test(id) || !existsSync(P(file))) throw new Error(`chapitre introuvable : ${file}`);
  const mod = (await import(pathToFileURL(P(file)).href)) as Record<string, unknown>;
  const entry = Object.entries(mod).find(([, v]) => v && typeof v === "object" && "lesson" in (v as object) && "exercises" in (v as object));
  if (!entry) throw new Error(`aucun chapitre exporté dans ${file}`);
  const [exportName, c] = entry as [string, (typeof ALL_CHAPTERS)[number]];
  const parsed = ChapterSchema.safeParse(c);
  if (!parsed.success) throw new Error(`ChapterSchema refuse ${id} : ${JSON.stringify(parsed.error.issues.slice(0, 5))}`);
  if (c.id !== id) throw new Error(`le fichier ${file} déclare l'id ${c.id}`);

  const INDEX = "src/lib/chapters/index.ts";
  let src = readFileSync(P(INDEX), "utf8");
  const importLine = `import { ${exportName} } from "./data/${id}";`;
  if (!src.includes(importLine)) {
    const imports = [...src.matchAll(/^import \{ \w+ \} from "\.\/data\/[a-z0-9-]+";$/gm)];
    const last = imports[imports.length - 1];
    if (!last) throw new Error(`${INDEX} : aucune importation de chapitre repérée`);
    src = src.slice(0, last.index! + last[0].length) + "\n" + importLine + src.slice(last.index! + last[0].length);
  }
  const arr = /export const ALL_CHAPTERS: ChapterContent\[\] = \[([^\]]*)\];/.exec(src);
  if (!arr) throw new Error(`${INDEX} : tableau ALL_CHAPTERS introuvable`);
  if (!arr[1].split(",").map((s) => s.trim()).includes(exportName)) src = src.replace(arr[0], `export const ALL_CHAPTERS: ChapterContent[] = [${arr[1].trim()}, ${exportName}];`);
  writeFileSync(P(INDEX), src);

  const state: State = c.publicationStatus === "published" ? "PUBLISHED" : REVIEW_KEYS.every((k) => c.reviewStatus[k] === "pass") ? "APPROVED" : "QA_PENDING";
  const task = ledger.tasks.find((t) => t.id === c.taskId);
  const next = state === "QA_PENDING" ? "Relecture humaine de la PR (revues QA), puis décision de publication" : undefined;
  if (task) Object.assign(task, { state, chapterId: task.chapterId ?? id, ...(next ? { next } : {}) });
  else ledger.tasks.push({ id: c.taskId, kind: "chapter", title: c.title, state, grade: c.grade, subject: c.subject, chapterId: id, ...(next ? { next } : {}) } as Task);
  save();
  console.log(`${id} inscrit (${exportName}, ${c.publicationStatus}) ; tâche ${c.taskId} → ${state}.`);
}

(async () => {
  if (process.argv[2] === "sync") sync();
  if (process.argv[2] === "register") await register(process.argv[3] ?? "");
  render();
  await matrix();
})().catch((e: unknown) => { console.error(`ARRÊT : ${(e as Error).message ?? e}`); process.exit(1); });
