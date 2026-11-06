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
  const chapters = new Map(ALL_CHAPTERS.map((c) => [c.id, c]));
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

if (process.argv[2] === "sync") sync();
render();
