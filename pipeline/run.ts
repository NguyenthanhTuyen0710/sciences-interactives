// Pipeline de production d'UN chapitre par l'API Claude, avec plafond de dépense et reprise.
//
//   npx tsx pipeline/run.ts <chapitre>                    dry-run : prompts construits, coûts estimés, AUCUN appel
//   npx tsx pipeline/run.ts <chapitre> --live             appels réels (clé + crédit vérifié obligatoires)
//   options : --step dossier|chapter|fix|review  --force  --batch (dossier, chapter, review : -50 %, asynchrone)
//             --exercises N   nombre d'exercices imposé (pilote ; justification ajoutée au chapitre)
//             --level 3e --subject mathematiques|physique-chimie   contrôle de cohérence avec la fiche du chapitre
//   npx tsx pipeline/run.ts <chapitre> --submit           soumet la prochaine étape par Message Batches puis s'arrête
//                                                         (aucun appel synchrone : la correction « fix » reste manuelle)
//   npx tsx pipeline/run.ts <chapitre> --collect <batchId>  récupère le résultat d'un batch ; n'envoie aucune requête
//   npx tsx pipeline/run.ts <chapitre> --reconcile        rattache une réservation à l'issue inconnue au batch réellement créé (lecture seule côté API)
//   Toute dépense passe par pipeline/ledger.ts : registre synchronisé, réservation avant envoi, anti-doublon, plafond 10 USD.
//
// Étapes : dossier → chapter → (validation par script → fix ≤ 2 tours) → review. Chaque étape terminée est
// enregistrée dans pipeline/state/<chapitre>.json et n'est pas refaite (sauf --force). Chaque appel est journalisé
// dans pipeline/.store/ledger.jsonl. Avant chaque appel, le coût MAXIMAL possible (max_tokens en sortie) est ajouté à la
// dépense déjà réalisée : si le total dépasse budget.limitUsd, le pipeline s'arrête sans appeler l'API.
// La clé API n'est jamais lue autrement que par le SDK (variable d'environnement) et n'est jamais affichée.
import Anthropic from "@anthropic-ai/sdk";
import { appendLedger, effectiveLimitUsd, ops, readLedger, reconcileBatch, retryPlan, RETRY_SUFFIX, spendBlockers, spentUsd } from "./ledger";
import { outputProblem, parseReview, REVIEW_JSON_SCHEMA, reviewMarkdown, type Review } from "./review-format";
import { addUsage, costUsd, exerciseBlocks, fixModel, FORBIDDEN_MODEL, g2Missing, H1_STEPS, isExperimentStep, latestReport, reportFile, runTag, truncationRisk, type InventoryObjective, longPromptWarning, maxTokensFor, MODELS, rateFor, STEP_CONFIG, SUBJECTS, promptSections, sectionKeys, isLycee, inputHash, injectMeta, isPipelineDraft, metaBlock, thinkingParam, type ByModel, type PipelineStep, type Prices, type SubjectSlug } from "./models";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// PIPELINE_ROOT : racine de données de remplacement (tests sur un répertoire temporaire) ; refusée hors dry-run.
const ROOT = process.env.PIPELINE_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (f: string) => join(ROOT, f);
const read = (f: string) => readFileSync(P(f), "utf8");
const readJson = <T>(f: string): T => JSON.parse(read(f));
const write = (f: string, s: string) => { mkdirSync(dirname(P(f)), { recursive: true }); writeFileSync(P(f), s); };

// ───────── Configuration ─────────
// Modèle, effort et max_tokens par étape : pipeline/models.ts (STEP_CONFIG, paliers du 2026-11-15). Relecture en effort
// « low » (2026-11-08 : 11 260 des 12 000 tokens de sortie étaient de la réflexion au run #9). Ni le modèle ni l'effort
// n'entrent dans l'empreinte anti-doublon (inputHash = texte du prompt).
const MAX_FIX_ROUNDS = 2;
// Estimation hors ligne (dry-run) ; remplacée par count_tokens en mode réel. Mesuré sur les runs #5 à #8 (Sonnet 5.5,
// français + TypeScript) : 2,02 à 2,17 caractères par token ; 2 donne une légère surestimation.
const CHARS_PER_TOKEN = 2;
type Step = PipelineStep;


interface Spec { id: string; taskId: string; grade: string; subject: SubjectSlug; objectiveIds?: string[]; parcours?: string; demonstrations?: string[]; treeChapterId: string; title: string; exportName: string; exercisePrefix: string; officialChapterIds: string[]; consolidationChapterIds: string[]; scopeNotes: string[]; exampleChapter: string; objectiveLevels?: Record<string, string>; optionalObjectives?: string[] }
interface StepState { status: "done" | "batch-pending"; hash: string; batchId?: string; at: string; note?: string }
interface State { chapter: string; steps: Partial<Record<Step, StepState>>; fixRounds: number }

const args = process.argv.slice(2);
const VALUE_OPTS = ["--step", "--exercises", "--collect", "--level", "--subject", "--parcours", "--dossier-model", "--retry", "--experiment"];
const flag = (f: string) => args.includes(f);
const opt = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);

// ───────── Rapport du run (pipeline-output/summary.{md,json}, repris dans le résumé du job GitHub) ─────────
const RUN = {
  chapter: "" as string, mode: "", newCostUsd: 0, tokens: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, thinking: 0 },
  qa: [] as { check: string; ok: boolean; detail: string }[], needsHuman: [] as string[], missing: [] as string[], notes: [] as string[],
  byModel: {} as ByModel, plan: [] as string[],
  /** Gate 1 du chapitre : null = non évalué dans ce run (collect, reconcile, arrêt avant). */
  gate1: null as null | { ok: boolean; missing: string[] },
  /** Sorties utilisables écrites par ce run (« étape:fichier ») ; vide = rien à publier, publish-pr ne s'exécute pas. */
  usableOutputs: [] as string[],
};
function writeSummary(code: number) {
  try {
    const passed = RUN.qa.filter((q) => q.ok).length;
    const md = [`### Pipeline \`${RUN.chapter || "—"}\` — ${RUN.mode} (code ${code})`, "",
      `- Dépense de ce run : $${RUN.newCostUsd.toFixed(3)} · cumul registre : ${LEDGER_TOTAL()}`,
      `- Tokens : entrée ${RUN.tokens.input}, cache écrit ${RUN.tokens.cacheWrite}, cache lu ${RUN.tokens.cacheRead}, sortie ${RUN.tokens.output} (dont réflexion ${RUN.tokens.thinking})`,
      ...Object.entries(RUN.byModel).map(([m, u]) => `  - ${m} : $${u.usd.toFixed(3)} · entrée ${u.input}, cache écrit ${u.cacheWrite}, cache lu ${u.cacheRead}, sortie ${u.output} (réflexion ${u.thinking})`),
      `- Gate 1 : ${RUN.gate1 === null ? "non évalué dans ce run" : RUN.gate1.ok ? "atteint" : `non atteint (${RUN.gate1.missing.join(", ")})`}`,
      ...(RUN.plan.length ? ["", "Dépense maximale prévue par étape et par modèle (batch) :", "", ...RUN.plan] : []),
      `- QA : ${RUN.qa.length ? `${passed}/${RUN.qa.length} contrôle(s) réussi(s) (${Math.round((100 * passed) / RUN.qa.length)} %)` : "aucun contrôle dans ce run"}${RUN.qa.map((q) => `\n  - ${q.ok ? "✔" : "✘"} ${q.check} : ${q.detail}`).join("")}`,
      `- needs-human : ${RUN.needsHuman.length}${RUN.needsHuman.map((n) => `\n  - ${n}`).join("")}`,
      `- Manques (matrice de couverture) : ${RUN.missing.length ? RUN.missing.slice(0, 10).join(" ; ") : "aucun relevé"}`,
      ...RUN.notes.map((n) => `- ${n}`)].join("\n");
    write("pipeline-output/summary.md", md + "\n");
    write("pipeline-output/summary.json", JSON.stringify({ ...RUN, exitCode: code, qaPassRate: RUN.qa.length ? passed / RUN.qa.length : null }, null, 1) + "\n");
  } catch { /* le rapport ne doit jamais masquer le code de sortie */ }
}
let LEDGER_TOTAL = () => "inconnu";
process.on("exit", writeSummary);

// ───────── Chapitre : argument explicite, ou --next (premier chapitre à produire selon la matrice de couverture) ─────────
interface MatrixRow { subject: string; grade: string; chapterId: string; state: string; pipelineSpec: string | null; missing: string[]; content: { id: string; sha256: string; qaPassed: boolean } | null }
const MATRIX_FILE = "research/curriculum/coverage-matrix.json";
const matrixRows = (): MatrixRow[] => (existsSync(P(MATRIX_FILE)) ? readJson<{ chapters: MatrixRow[] }>(MATRIX_FILE).chapters : []);
function nextFromMatrix(): string | undefined {
  const level = opt("--level"), subject = opt("--subject");
  return matrixRows().find((r) => r.pipelineSpec && !r.content && (!level || r.grade === level) && (!subject || r.subject === subject))?.pipelineSpec ?? undefined;
}
let chapterId = args.find((a, i) => !a.startsWith("--") && !VALUE_OPTS.includes(args[i - 1]));
if (!chapterId && flag("--next")) {
  chapterId = nextFromMatrix();
  RUN.mode = "next";
  if (!chapterId) { console.log(`--next : aucun chapitre à produire dans ${MATRIX_FILE} (fiche pipeline présente et contenu absent) pour ${opt("--level") ?? "tout niveau"} / ${opt("--subject") ?? "toute matière"}.`); process.exit(0); }
  console.log(`--next : chapitre retenu d'après la matrice de couverture : ${chapterId}`);
}
const SUBMIT = flag("--submit"), COLLECT = opt("--collect"), RECONCILE = flag("--reconcile");
const RETRY_REASON = opt("--retry");
const EXPERIMENT = opt("--experiment");
if (EXPERIMENT !== undefined && EXPERIMENT !== "h1") { console.error(`ARRÊT : --experiment inconnu : ${EXPERIMENT} (seul « h1 » existe)`); process.exit(2); }
const LIVE = flag("--live") || SUBMIT || !!COLLECT || RECONCILE, FORCE = flag("--force"), BATCH = flag("--batch") || SUBMIT, ONLY = opt("--step") as Step | undefined;
if (process.env.PIPELINE_ROOT && LIVE) { console.error("ARRÊT : PIPELINE_ROOT est réservé au dry-run (tests)."); process.exit(2); }
const EXERCISES = opt("--exercises") === undefined ? undefined : Number(opt("--exercises"));

function fail(msg: string, code = 2): never { console.error(`ARRÊT : ${msg}`); process.exit(code); }
if (!chapterId) fail("Usage : npx tsx pipeline/run.ts <chapitre | --next> [--live] [--step s] [--force] [--batch] [--submit | --collect <batchId>] [--exercises N] [--level g --subject s]");
if (!/^[a-z0-9-]+$/.test(chapterId!)) fail(`identifiant de chapitre invalide : ${chapterId}`);
if (!existsSync(P(`pipeline/chapters/${chapterId}.json`))) fail(`chapitre ${chapterId} absent du catalogue du pipeline (pipeline/chapters/)`);
if ([SUBMIT, !!COLLECT, RECONCILE].filter(Boolean).length > 1) fail("--submit, --collect et --reconcile sont exclusifs");
if (COLLECT !== undefined && !/^msgbatch_[A-Za-z0-9]+$/.test(COLLECT)) fail("identifiant de batch invalide (attendu : msgbatch_…)");
if (EXERCISES !== undefined && !(Number.isInteger(EXERCISES) && EXERCISES >= 1 && EXERCISES <= 60)) fail("--exercises doit être un entier entre 1 et 60");
const spec = readJson<Spec>(`pipeline/chapters/${chapterId}.json`);
const prices = readJson<Prices>("pipeline/prices.json");
const budget = readJson<{ limitUsd: number; creditVerified: boolean }>("pipeline/budget.json");
// Dossier : modèle forcé pour la comparaison du pilote (--dossier-model haiku|sonnet) ; sinon STEP_CONFIG.
const DOSSIER_MODEL = opt("--dossier-model") ? MODELS[opt("--dossier-model") as keyof typeof MODELS] : STEP_CONFIG.dossier.model;
if (!DOSSIER_MODEL) fail("--dossier-model attend haiku, sonnet ou opus");
// Chapitre : palier Opus seulement au lycée et si la fiche liste des démonstrations exigibles (MODEL_POLICY) ; sinon Sonnet.
const CHAPTER_MODEL = isLycee(spec.grade) && spec.demonstrations?.length ? MODELS.opus : STEP_CONFIG.chapter.model;
for (const m of [...Object.values(STEP_CONFIG).map((c) => c.model), DOSSIER_MODEL, CHAPTER_MODEL]) {
  if (FORBIDDEN_MODEL.test(m)) fail(`modèle exclu par décision du porteur de projet : ${m}`);
  if (!prices.models[m]) fail(`tarif absent de pipeline/prices.json pour ${m}`);
}
const STATE_FILE = `pipeline/state/${spec.id}.json`;
const state: State = existsSync(P(STATE_FILE)) ? readJson(STATE_FILE) : { chapter: spec.id, steps: {}, fixRounds: 0 };
const saveState = () => write(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
const CHAPTER_FILE = `src/lib/chapters/data/${spec.id}.ts`;
const DOSSIER_FILE = `research/dossiers/${spec.id}.md`;
// Rapports nommés par run (décision du 2026-11-18) : un nouveau rapport n'écrase jamais l'ancien.
const REPORT_FILE = reportFile(spec.taskId, "review", runTag());

// ───────── Contrôle des données d'entrée (avant toute estimation ou tout appel) ─────────
function checkInputs() {
  const level = opt("--level"), subject = opt("--subject");
  if (spec.id !== chapterId) fail(`la fiche pipeline/chapters/${chapterId}.json déclare l'id ${spec.id}`);
  if (level && level !== spec.grade) fail(`niveau ${level} ≠ niveau du chapitre (${spec.grade})`);
  if (subject && subject !== spec.subject) fail(`matière ${subject} ≠ matière du chapitre (${spec.subject})`);
  const parcours = opt("--parcours");
  if (parcours && parcours !== (spec.parcours ?? "college")) fail(`parcours ${parcours} ≠ parcours du chapitre (${spec.parcours ?? "college"})`);
  if (!(spec.subject in SUBJECTS)) fail(`matière non prise en charge : ${spec.subject} (attendu : ${Object.keys(SUBJECTS).join(", ")})`);
  const manifestFile = `research/curriculum/${spec.subject}/manifest-${spec.grade}.json`;
  if (existsSync(P(manifestFile))) {
    const themes = readJson<{ themes: { treeChapterId: string; taskId: string }[] }>(manifestFile).themes;
    if (!themes.some((t) => t.treeChapterId === spec.treeChapterId && t.taskId === spec.taskId)) fail(`${spec.treeChapterId} / ${spec.taskId} absent de ${manifestFile}`);
  } else if (SUBJECTS[spec.subject].manifest && !isLycee(spec.grade)) fail(`aucun manifest pour ${spec.subject} ${spec.grade} (${manifestFile})`);
  else console.log(`note : pas de manifest pour ${spec.subject} ${spec.grade} ; contrôle par l'inventaire et la matrice de couverture seulement.`);
  if (isLycee(spec.grade)) {
    const PARCOURS_LABEL: Record<string, string> = { "tronc-commun": "tronc commun", specialite: "spécialité", "maths-complementaires": "complémentaires", "maths-expertes": "expertes" };
    const track = readJson<{ grades: { grade: string; track?: string }[] }>(SUBJECTS[spec.subject].inventory).grades.find((g) => g.grade === spec.grade)?.track ?? "";
    if (!spec.parcours || !PARCOURS_LABEL[spec.parcours] || !track.includes(PARCOURS_LABEL[spec.parcours])) fail(`parcours ${spec.parcours ?? "absent"} incompatible avec l'inventaire ${spec.grade} (« ${track || "aucun"} »)`);
  } else if (spec.parcours && spec.parcours !== "college") fail(`parcours ${spec.parcours} : réservé au lycée`);
  if (!read("src/lib/content/curriculum.ts").includes(`"${spec.treeChapterId}"`)) console.log(`avertissement : ${spec.treeChapterId} pas encore dans l'arborescence du site (src/lib/content/curriculum.ts) ; à ajouter lors de l'intégration.`);
  console.log(`contrôle des données : OK (${spec.grade}, ${spec.subject}, ${spec.treeChapterId}, ${spec.taskId}${EXERCISES ? `, ${EXERCISES} exercices imposés` : ""})`);
}
checkInputs();

// ───────── Coûts ─────────
// Registre des dépenses partagé (pipeline/ledger.ts) ; synchronisé avec le stockage « data-store » par le workflow.
const LEDGER = P("pipeline/.store/ledger.jsonl");
const ledger = () => readLedger(LEDGER);
const spent = () => spentUsd(ledger());
LEDGER_TOTAL = () => `$${spent().toFixed(3)} / $${effectiveLimitUsd(budget.limitUsd)}`;
RUN.chapter = spec.id;
const readiness = () => ({ ledgerSynced: process.env.PIPELINE_LEDGER_SYNCED === "1", creditVerified: budget.creditVerified, limitUsd: budget.limitUsd });
const usd = (n: number, perM: number) => (n * perM) / 1e6;
const money = (x: number) => `$${x.toFixed(3)}`;

const usageOf = (u: Anthropic.Usage) => ({ input: u.input_tokens, cacheWrite: u.cache_creation_input_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, output: u.output_tokens, thinking: u.output_tokens_details?.thinking_tokens ?? 0 });
const actualCost = (u: Anthropic.Usage, batch: boolean, model: string) => costUsd(prices, model, usageOf(u), batch);

// ───────── Prompts ─────────
// Blocs {{#maths}} / {{#pc}} / {{#college}} / {{#lycee}} résolus d'abord (matière et niveau de la fiche), puis les variables.
const fill = (tpl: string, v: Record<string, string>) => promptSections(tpl, sectionKeys(spec.subject, spec.grade)).replace(/\{\{(\w+)\}\}/g, (_, k: string) => { if (!(k in v)) throw new Error(`variable de gabarit manquante : ${k}`); return v[k]; });
const SYSTEM = fill(read("pipeline/prompts/system.md"), {
  SCHEMA: read("src/lib/chapters/schema.ts"), TYPES: read("src/lib/engine/types.ts"), EXAMPLE_PATH: spec.exampleChapter, EXAMPLE: read(spec.exampleChapter),
});
// Préfixe « light » (dossier, criblage) : mêmes règles, sans schéma, types ni chapitre d'exemple (entrée minimale).
const OMITTED = "(non fourni pour cette étape : aucun code TypeScript n'est attendu)";
const SYSTEM_LIGHT = fill(read("pipeline/prompts/system.md"), { SCHEMA: OMITTED, TYPES: OMITTED, EXAMPLE_PATH: "—", EXAMPLE: OMITTED });
const systemFor = (step: Step) => (STEP_CONFIG[step].system === "light" ? SYSTEM_LIGHT : SYSTEM);

function objectives(): string {
  const inv = readJson<{ grades: { domains: { chapters: { id: string; objectives: unknown[] }[] }[] }[] }>(SUBJECTS[spec.subject].inventory);
  const all = inv.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters));
  const pick = (ids: string[], kind: string, keep?: string[]) => ids.map((id) => {
    const c = all.find((x) => x.id === id);
    if (!c) throw new Error(`chapitre ${id} absent de l'inventaire`);
    const objectives = keep ? (c.objectives as { id: string }[]).filter((o) => keep.includes(o.id)) : c.objectives;
    if (!objectives.length) throw new Error(`aucun objectif retenu pour ${id}`);
    return { chapter: id, kind, objectives };
  });
  const groups = [...pick(spec.officialChapterIds, `officiel ${spec.grade}`, spec.objectiveIds), ...pick(spec.consolidationChapterIds, "consolidation")];
  // Fiche `optionalObjectives` (décision du 2026-11-18) : objectifs non exigés dans CE chapitre → required: false
  // (META, critère d'achèvement, porte G2), sans toucher l'inventaire partagé avec les autres niveaux.
  const optional = new Set(spec.optionalObjectives ?? []);
  const unknown = [...optional].filter((id) => !groups.some((g) => (g.objectives as { id: string }[]).some((o) => o.id === id)));
  if (unknown.length) throw new Error(`optionalObjectives : objectif(s) absent(s) du chapitre : ${unknown.join(", ")}`);
  const marked = groups.map((g) => ({ ...g, objectives: (g.objectives as { id: string }[]).map((o) => (optional.has(o.id) ? { ...o, required: false } : o)) }));
  return JSON.stringify(marked, null, 1);
}
const SPEC = JSON.stringify(spec, null, 1);
/**
 * Taxonomie verrouillée du chapitre pour le prompt (décision du 2026-11-18) : vide sans taxonomie verrouillée, si bien
 * que le prompt des autres chapitres reste identique octet pour octet (même empreinte anti-doublon).
 */
function taxonomyPrompt(): string {
  const file = `research/curriculum/${spec.subject}/taxonomy/${spec.id}.json`;
  if (!existsSync(P(file))) return "";
  const tax = readJson<{ status: string; types: { id: string; title: string; objectives: string[]; level?: string; difficulty: number[]; variants: string[]; countsTowardCompleteness?: boolean; transversal?: boolean; rule?: string }[] }>(file);
  if (tax.status !== "verrouillé") return "";
  const types = tax.types.map(({ id, title, objectives, level, difficulty, variants, countsTowardCompleteness, transversal, rule }) => ({ id, title, objectives, level, difficulty, variants, countsTowardCompleteness, transversal, rule }));
  return `\nLocked exercise taxonomy (JSON). Every exercise declares \`taxonomyTypes: ["<type id>", …]\` with ids from this list only; its \`niveau\` must be in the \`difficulty\` of each declared type; every type that is not « approfondissement », not transversal and not \`countsTowardCompleteness: false\` has at least one exercise; an « approfondissement » type is never combined with a required type and never used in a « Type Brevet — » exercise; variants differ by structure or reasoning step, never only by numbers.\n${JSON.stringify(types, null, 1)}\n`;
}

// ───────── Contrôles déterministes ─────────
function validate(): { ok: boolean; json: string; summary: string } {
  const v = spawnSync("npx", ["tsx", "scripts/validate-chapter.ts", CHAPTER_FILE, "--json", "--seeds", "300"], { cwd: ROOT, encoding: "utf8" });
  const t = spawnSync("npx", ["tsc", "--noEmit"], { cwd: ROOT, encoding: "utf8" });
  const tsc = (t.stdout + t.stderr).split("\n").filter((l) => l.includes(`${spec.id}.ts`)).slice(0, 30);
  let parsed: { summary: { ok: boolean }; issues: unknown[] } | null = null;
  try { parsed = JSON.parse(v.stdout.trim().split("\n").pop() ?? ""); } catch { /* le fichier ne se charge pas */ }
  const ok = !!parsed?.summary.ok && tsc.length === 0;
  const json = JSON.stringify({ validator: parsed ?? { loadError: (v.stderr || v.stdout).slice(0, 3000) }, typescript: tsc });
  return { ok, json, summary: JSON.stringify(parsed?.summary ?? "chargement impossible") };
}

function extractBlock(text: string, lang: string): string {
  const m = text.match(new RegExp("```" + lang + "\\n([\\s\\S]*?)\\n```"));
  if (!m) throw new Error(`réponse sans bloc \`\`\`${lang}`);
  return m[1];
}

function applyEdits(file: string, edits: { old: string; new: string }[]): { text: string; failed: string[] } {
  let text = file;
  const failed: string[] = [];
  for (const e of edits) {
    const n = text.split(e.old).length - 1;
    if (n !== 1) { failed.push(`${n} occurrence(s) : ${e.old.slice(0, 80)}`); continue; }
    text = text.replace(e.old, () => e.new);
  }
  return { text, failed };
}

// ───────── Appel API (toujours après contrôle du budget) ─────────
let client: Anthropic | null = null;
let systemCached = false;
/**
 * Cache conditionnel (M14, option A) : le préfixe n'est marqué que pour un appel synchrone, suivi dans le même run
 * d'autres appels au même préfixe (dossier → chapitre → fix). Un batch d'une seule requête est suivi d'une relecture
 * humaine (heures) : l'écriture en cache (2 × le prix d'entrée en TTL 1 h) ne serait jamais relue. Mesuré au run #12 :
 * 50 420 tokens écrits sans lecture, 0,050 $ perdus. La relecture (output_config.format) invalide de toute façon le cache.
 */
const cacheSystem = (step: Step, batch: boolean) => !batch && step !== "review" && step !== "screen";
const params = (step: Step, user: string, batch: boolean, model: string): Anthropic.MessageCreateParamsNonStreaming => ({
  model,
  max_tokens: maxTokensFor(step, model),
  ...(thinkingParam(step, model) ? { thinking: thinkingParam(step, model) } : {}),
  // Relecture et criblage : JSON imposé par structured outputs (Message Batches compatibles), revérifié par parseReview.
  output_config: step === "review" || step === "screen" ? { effort: STEP_CONFIG[step].effort, format: { type: "json_schema", schema: REVIEW_JSON_SCHEMA } } : { effort: STEP_CONFIG[step].effort },
  system: [{ type: "text", text: systemFor(step), ...(cacheSystem(step, batch) ? { cache_control: { type: "ephemeral" as const, ttl: "1h" as const } } : {}) }],
  messages: [{ role: "user", content: user }],
});

/** Coût maximal d'une requête (sortie au maximum) au tarif du modèle et de la longueur du prompt. */
function upperCost(step: Step, model: string, sysTok: number, userTok: number, batch: boolean) {
  const r = rateFor(prices.models[model], sysTok + userTok);
  const m = batch ? prices.batchMultiplier : 1;
  // Préfixe écrit en cache s'il est marqué (lu s'il l'a déjà été dans ce run), sinon prix d'entrée.
  const sysPrice = !cacheSystem(step, batch) ? r.input : systemCached ? r.cacheRead : r.cacheWrite1h;
  return { upper: m * (usd(sysTok, sysPrice) + usd(userTok, r.input) + usd(maxTokensFor(step, model), r.output)), long: r.long };
}

async function estimate(step: Step, user: string, batch: boolean, model: string) {
  const sys = systemFor(step);
  let sysTok = Math.ceil(sys.length / CHARS_PER_TOKEN), userTok = Math.ceil(user.length / CHARS_PER_TOKEN), exact = false;
  if (client) {
    const c = await client.messages.countTokens({ model, system: [{ type: "text", text: sys }], messages: [{ role: "user", content: "." }] });
    const t = await client.messages.countTokens({ model, system: [{ type: "text", text: sys }], messages: [{ role: "user", content: user }] });
    sysTok = c.input_tokens; userTok = t.input_tokens - c.input_tokens; exact = true;
  }
  return { sysTok, userTok, exact, ...upperCost(step, model, sysTok, userTok, batch), warning: longPromptWarning(prices, model, sysTok + userTok) };
}

/** Estime le coût maximal et applique TOUS les contrôles de dépense ; en dry-run, les affiche sans bloquer. */
async function guard(step: Step, user: string, batch: boolean, hash: string, model: string) {
  if (LIVE) { // conditions indépendantes du coût : vérifiées avant toute requête, même gratuite (count_tokens)
    const pre = spendBlockers(ledger(), { chapter: spec.id, step, inputHash: hash, maxUsd: 0 }, readiness());
    if (pre.length) { for (const b of pre) console.error(`  ARRÊT : ${b}`); process.exit(3); }
  }
  const e = await estimate(step, user, batch, model);
  console.log(`  estimation ${step}${batch ? " (batch)" : ""} [${model}] : système ${e.sysTok} + requête ${e.userTok} tokens${e.exact ? " (count_tokens)" : ` (approx. ${CHARS_PER_TOKEN} car./token)`}, sortie ≤ ${maxTokensFor(step, model)}, empreinte ${hash}, coût maximal ${money(e.upper)}${e.long ? " (tarif long)" : ""} ; déjà compté ${money(spent())} / plafond ${money(effectiveLimitUsd(budget.limitUsd))}`);
  if (e.warning) { console.log(`  AVERTISSEMENT : ${e.warning}`); RUN.notes.push(e.warning); }
  const pr = params(step, user, batch, model);
  console.log(`  requête : ${JSON.stringify({ model: pr.model, max_tokens: pr.max_tokens, output_config: { effort: pr.output_config?.effort, format: pr.output_config?.format ? `json_schema (sha256 ${createHash("sha256").update(JSON.stringify(pr.output_config.format.schema)).digest("hex").slice(0, 16)})` : undefined }, system_cache_control: (pr.system as Anthropic.TextBlockParam[])[0].cache_control, thinking: pr.thinking ?? "par défaut (adaptatif)", messages: `${pr.messages.length} message(s), ${user.length} car.` })}`);
  const blockers = spendBlockers(ledger(), { chapter: spec.id, step, inputHash: hash, maxUsd: e.upper }, readiness());
  const trunc = truncationRisk(step, model);
  if (trunc) { blockers.push(trunc); RUN.notes.push(trunc); }
  if (!LIVE) { for (const b of blockers) console.log(`  (envoi réel bloqué : ${b})`); return e; }
  if (blockers.length) { for (const b of blockers) console.error(`  ARRÊT : ${b}`); process.exit(3); }
  return e;
}

/** Réserve le coût maximal dans le registre AVANT l'envoi ; renvoie l'identifiant de l'opération. */
function reserve(step: Step, hash: string, mode: "batch" | "sync", maxUsd: number, model: string, retry?: { retryOf: string; retryReason: string }): string {
  const id = `${spec.id}-${step}-${Date.now()}`;
  appendLedger(LEDGER, { type: "reserve", id, at: new Date().toISOString(), chapter: spec.id, step, inputHash: hash, mode, maxUsd: Number(maxUsd.toFixed(5)), model, ...(retry ?? {}) });
  return id;
}

/** Solde une opération par son coût réel, au tarif du modèle réellement utilisé (une seule fois par opération). */
function logCost(step: Step, msg: Anthropic.Message, batch: boolean, ref: { opId?: string; batchId?: string }) {
  const usage = msg.usage, model = msg.model, u = usageOf(usage);
  const cost = actualCost(usage, batch, model);
  const op = ops(ledger()).find((o) => (ref.opId && o.id === ref.opId) || (ref.batchId && o.batchId === ref.batchId));
  const detail = `${model} : entrée ${u.input}, cache écrit ${u.cacheWrite}, cache lu ${u.cacheRead}, sortie ${u.output} dont réflexion ${u.thinking}`;
  if (op?.state === "settled") { console.log(`  coût déjà enregistré pour ${op.id} (${money(op.usd ?? 0)}) : non compté deux fois (${detail})`); return; }
  appendLedger(LEDGER, { type: "actual", id: op?.id ?? `externe-${ref.batchId}`, at: new Date().toISOString(), usd: Number(cost.toFixed(5)), batchId: ref.batchId, model, tokens: u });
  RUN.newCostUsd += cost;
  const tk = RUN.tokens;
  tk.input += u.input; tk.cacheWrite += u.cacheWrite; tk.cacheRead += u.cacheRead; tk.output += u.output; tk.thinking += u.thinking;
  addUsage(RUN.byModel, model, u, cost);
  console.log(`  coût réel ${money(cost)} (${detail}) — total ${money(spent())}`);
}

/**
 * Résultat d'une opération soldée. Texte utilisable → renvoyé. Sinon (max_tokens, refus, relecture hors schéma) :
 * le texte reçu est sauvegardé (jamais perdu), l'issue est écrite dans le registre (« outcome », sans effet sur la
 * dépense ni l'anti-doublon) et l'exécution s'arrête (code 7) : ce n'est pas un résultat valide.
 */
function finish(step: Step, msg: Anthropic.Message, ref: { opId?: string; batchId?: string }): string {
  const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const stop = msg.stop_reason ?? "inconnu";
  const problem = outputProblem(step, msg.stop_reason, text);
  const op = ops(ledger()).find((o) => (ref.opId && o.id === ref.opId) || (ref.batchId && o.batchId === ref.batchId));
  const note = (usable: boolean, extra: { note?: string; saved?: string } = {}) => {
    if (op?.state === "settled" && !op.outcome) appendLedger(LEDGER, { type: "outcome", id: op.id, at: new Date().toISOString(), stopReason: stop, usable, ...extra });
  };
  if (!problem) { note(true); return text; }
  const saved = `pipeline-output/unusable/${spec.id}-${step}-${stop}.md`;
  write(saved, `<!-- TRUNCATED – không phải báo cáo QA hợp lệ / résultat inutilisable, pas un rapport QA valide. Étape ${step}, stop_reason ${stop}, ${problem}. Opération ${op?.id ?? "?"}${ref.batchId ? `, batch ${ref.batchId}` : ""}. -->\n\n` + text + "\n");
  note(false, { note: problem, saved });
  RUN.needsHuman.push(`${step} : ${problem} (texte dans ${saved})`);
  console.error(`ARRÊT : étape ${step} : ${problem} ; texte reçu (${text.length} caractères) sauvegardé dans ${saved}, issue inscrite au registre.`);
  process.exit(7);
}

/** Exécute une étape : renvoie le texte, ou null si un batch est en attente. */
async function call(step: Step, user: string, hash: string, model: string): Promise<string | null> {
  // M17 minimal : --retry "motif" renvoie une fois une étape payée sans résultat utilisable (empreinte suffixée).
  let retry: { retryOf: string; retryReason: string } | undefined;
  if (RETRY_REASON !== undefined) {
    const r = retryPlan(ledger(), spec.id, step, hash, RETRY_REASON);
    if ("error" in r) fail(`--retry : ${r.error}`);
    console.log(`  nouvel envoi motivé de ${r.retryOf} (« ${RETRY_REASON} »), empreinte ${r.hash}`);
    hash = r.hash; retry = { retryOf: r.retryOf, retryReason: RETRY_REASON };
  }
  // Production : toutes les étapes, fix compris, passent par Message Batches (--submit) ; synchrone seulement avec --live sans --batch.
  const batch = BATCH;
  const st = state.steps[step];
  if (LIVE && client && st?.status === "batch-pending" && st.batchId && st.hash === hash) {
    const b = await client.messages.batches.retrieve(st.batchId);
    if (b.processing_status !== "ended") { console.log(`  batch ${step} en cours (${b.request_counts.processing} en traitement) : relancer plus tard.`); return null; }
    for await (const r of await client.messages.batches.results(st.batchId)) {
      if (r.result.type !== "succeeded") throw new Error(`batch ${step} : ${r.result.type}`);
      logCost(step, r.result.message, true, { batchId: st.batchId });
      return finish(step, r.result.message, { batchId: st.batchId });
    }
    throw new Error(`batch ${step} : aucun résultat`);
  }
  const e = await guard(step, user, batch, hash, model);
  if (!LIVE || !client) { console.log(`  dry-run : appel ${step} non envoyé.`); return null; }
  const opId = reserve(step, hash, batch ? "batch" : "sync", e.upper, model, retry);
  // Pas de nouvelle tentative automatique pour un envoi payant : une erreur laisse l'issue « inconnue » (→ --reconcile).
  const unknown = (err: unknown): never => { appendLedger(LEDGER, { type: "unknown", id: opId, at: new Date().toISOString(), error: String((err as Error).message ?? err).slice(0, 300) }); throw err; };
  if (batch) {
    const b = await client.messages.batches.create({ requests: [{ custom_id: `${spec.id}-${step}`, params: params(step, user, true, model) }] }, { maxRetries: 0 }).catch(unknown);
    appendLedger(LEDGER, { type: "submitted", id: opId, at: new Date().toISOString(), batchId: b.id });
    state.steps[step] = { status: "batch-pending", hash, batchId: b.id, at: new Date().toISOString() };
    saveState();
    console.log(`  batch ${step} soumis : ${b.id} (récupérer avec --collect ${b.id}, ou relancer la même commande en local).`);
    return null;
  }
  const msg = await client.messages.stream(params(step, user, false, model), { maxRetries: 0 }).finalMessage().catch(unknown);
  systemCached = true;
  logCost(step, msg, false, { opId });
  return finish(step, msg, { opId });
}

// ───────── Écriture des sorties (jamais publiées : le chapitre reste « draft » et hors registre) ─────────
const SCREEN_FILE = reportFile(spec.taskId, "screen", runTag());
/** Criblage le plus récent présent dans le dépôt (lu par le juge), quel que soit le run qui l'a écrit. */
const latestScreenFile = () => latestReport(existsSync(P("project/reports")) ? readdirSync(P("project/reports")) : [], spec.taskId, "screen");
function saveReport(file: string, label: string, t: string, model: string) {
  const r = parseReview(t);
  if (!r.ok) fail(`${label} hors schéma : ${r.errors.join(" ; ")}`, 7);
  RUN.qa.push({ check: `${label} [${model}] (schéma, 6 critères)`, ok: r.review.verdict === "PASS", detail: `${r.review.verdict}, ${r.review.findings.length} constat(s)` });
  write(file, reviewMarkdown(r.review, `<!-- ${label} produite par ${model} via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->\n# ${label} (API) — ${spec.id}`));
}
/** Correction ciblée : remplacements exacts dans le fichier du chapitre, puis revalidation. */
function applyFix(t: string) {
  const { text, failed } = applyEdits(read(CHAPTER_FILE), JSON.parse(extractBlock(t, "json")));
  write(CHAPTER_FILE, text);
  if (failed.length) console.log(`  ${failed.length} remplacement(s) non appliqué(s) : ${failed.join(" | ")}`);
}
const OUT: Record<Step, { file: string; replaces: boolean; save: (t: string, model: string) => void }> = {
  dossier: { file: DOSSIER_FILE, replaces: false, save: (t) => write(DOSSIER_FILE, t.trim() + "\n") },
  // Proposition A : le bloc META (identité, objectifs, sources, statuts) est inséré par le pipeline, pas écrit par le modèle.
  chapter: { file: CHAPTER_FILE, replaces: false, save: (t) => write(CHAPTER_FILE, injectMeta(extractBlock(t, "ts"), metaBlock(spec, JSON.parse(objectives()))) + "\n") },
  fix: { file: CHAPTER_FILE, replaces: true, save: (t) => applyFix(t) },
  screen: { file: SCREEN_FILE, replaces: false, save: (t, model) => saveReport(SCREEN_FILE, "Criblage QA", t, model) },
  review: { file: REPORT_FILE, replaces: false, save: (t, model) => saveReport(REPORT_FILE, "Relecture QA", t, model) },
  // Essai H1 : sorties en artefact du run seulement (pipeline-output/), jamais committées sur la branche du chapitre.
  "h1-low": { file: "pipeline-output/h1/h1-low.md", replaces: true, save: (t) => write("pipeline-output/h1/h1-low.md", t.trim() + "\n") },
  "h1-medium": { file: "pipeline-output/h1/h1-medium.md", replaces: true, save: (t) => write("pipeline-output/h1/h1-medium.md", t.trim() + "\n") },
};

/** Mode collect : lit le résultat d'un batch déjà soumis ; aucune nouvelle requête payante. */
async function collect(batchId: string) {
  const b = await client!.messages.batches.retrieve(batchId);
  const c = b.request_counts;
  console.log(`batch ${batchId} : ${b.processing_status} (réussis ${c.succeeded}, en cours ${c.processing}, erreurs ${c.errored}, expirés ${c.expired}, annulés ${c.canceled})`);
  if (b.processing_status !== "ended") { console.log("résultat pas encore disponible : relancer collect plus tard."); return; }
  for await (const r of await client!.messages.batches.results(batchId)) {
    const step = r.custom_id.startsWith(`${spec.id}-`) ? r.custom_id.slice(spec.id.length + 1) : "";
    if (!(step in OUT)) fail(`le batch ${batchId} ne correspond pas au chapitre ${spec.id} (custom_id ${r.custom_id})`);
    const out = OUT[step as Step];
    if (r.result.type !== "succeeded") fail(`batch ${step} : ${r.result.type}`, 1);
    if (!out.replaces && existsSync(P(out.file)) && !FORCE) fail(`${out.file} existe déjà ; utiliser --force pour le remplacer`, 5);
    logCost(step as Step, r.result.message, true, { batchId });
    out.save(finish(step as Step, r.result.message, { batchId }), r.result.message.model);
    console.log(`${step} écrit dans ${out.file} (brouillon, relecture humaine requise avant tout commit)`);
    if (!isExperimentStep(step as Step)) RUN.usableOutputs.push(`${step}:${out.file}`);
    if (step === "chapter" || step === "fix") {
      const v = validate(); qaValidation(v);
      console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
      if (!v.ok) RUN.needsHuman.push("chapitre collecté hors validation : correction ciblée (fix) à lancer");
    }
  }
}

const entriesAt = (id: string) => ledger().find((e) => e.id === id)?.at ?? new Date(0).toISOString();

/** Mode reconcile : rattache chaque réservation à l'issue inconnue au batch réellement créé, ou la déclare échouée. */
async function reconcile() {
  const open = ops(ledger()).filter((o) => o.state === "reserved" || o.state === "unknown");
  if (!open.length) { console.log("aucune opération à réconcilier."); return; }
  const recent: { id: string; created_at: string }[] = [];
  for await (const b of client!.messages.batches.list({ limit: 100 })) { recent.push({ id: b.id, created_at: b.created_at }); if (recent.length >= 100) break; }
  const linked = new Set(ops(ledger()).flatMap((o) => (o.batchId ? [o.batchId] : [])));
  for (const o of open) {
    if (!o.reserve) { // exécution interrompue sans registre (marqueur run-<id>) : batchs créés pendant la fenêtre du run ?
      const end = Date.parse(entriesAt(o.id)), c = recent.filter((x) => Date.parse(x.created_at) >= end - 25 * 60_000 && Date.parse(x.created_at) <= end && !linked.has(x.id));
      if (c.length === 0) { appendLedger(LEDGER, { type: "failed", id: o.id, at: new Date().toISOString(), reason: "aucun batch créé pendant l'exécution interrompue" }); console.log(`${o.id} : aucun batch créé → clos`); }
      else console.log(`${o.id} : batch(s) créé(s) pendant l'exécution interrompue (${c.map((x) => x.id).join(", ")}) — décision humaine requise`);
      continue;
    }
    if (o.reserve.mode !== "batch") { console.log(`${o.id} : appel synchrone à l'issue inconnue — vérifier la consommation dans la Console Anthropic, puis solder l'entrée à la main (type « actual » ou « failed »).`); continue; }
    const r = reconcileBatch(o, recent, linked);
    const at = new Date().toISOString();
    if ("batchId" in r) { appendLedger(LEDGER, { type: "submitted", id: o.id, at, batchId: r.batchId }); linked.add(r.batchId); console.log(`${o.id} : rattaché au batch ${r.batchId}`); }
    else if ("failed" in r) { appendLedger(LEDGER, { type: "failed", id: o.id, at, reason: "aucun batch créé après la réservation" }); console.log(`${o.id} : aucun batch créé → échec, coût 0`); }
    else console.log(`${o.id} : ambigu (${r.ambiguous.join(", ")}) — décision humaine requise`);
  }
}

const hashOf = (...parts: string[]) => inputHash(parts);
// Étape faite : état local (pipeline/state) ou, à défaut, registre partagé (data-store) — opération soldée de même
// empreinte et résultat utilisable. Le registre survit aux runs GitHub, l'état local non : il assure la reprise (M1).
// Étape faite : opération soldée utilisable, d'origine ou par nouvel envoi motivé (empreinte + RETRY_SUFFIX).
const doneInLedger = (step: Step, hash: string) => ops(ledger()).some((o) => o.reserve?.chapter === spec.id && o.reserve.step === step && (o.reserve.inputHash === hash || o.reserve.inputHash === hash + RETRY_SUFFIX) && o.state === "settled" && o.outcome?.usable !== false);
const done = (step: Step, hash: string) => !FORCE && ((state.steps[step]?.status === "done" && [hash, hash + RETRY_SUFFIX].includes(state.steps[step]!.hash)) || doneInLedger(step, hash));
function qaValidation(v: { ok: boolean; summary: string }) { RUN.qa.push({ check: "validate-chapter + tsc", ok: v.ok, detail: v.summary }); }
const wanted = (step: Step) => !ONLY || ONLY === step;
const markDone = (step: Step, hash: string, note?: string) => { state.steps[step] = { status: "done", hash, at: new Date().toISOString(), note }; saveState(); };

// ───────── Programme ─────────
async function main() {
  console.log(`Pipeline ${spec.id} (${spec.taskId}) — modèles ${Object.entries(STEP_CONFIG).map(([s, c]) => `${s}=${s === "dossier" ? DOSSIER_MODEL : s === "chapter" ? CHAPTER_MODEL : s === "fix" ? "haiku|sonnet" : c.model}/${c.effort}`).join(", ")}, mode ${RECONCILE ? "reconcile" : COLLECT ? "collect" : SUBMIT ? "submit (batch)" : LIVE ? "RÉEL" : "dry-run"}${BATCH && !SUBMIT ? " + batch" : ""}`);
  if (LIVE) {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) { console.error("ARRÊT : aucune clé dans l'environnement (ANTHROPIC_API_KEY)."); process.exit(4); }
    client = new Anthropic({ maxRetries: 2 }); // nouvelles tentatives réservées aux lectures ; les envois payants passent maxRetries: 0
  }
  RUN.mode = `${RUN.mode ? RUN.mode + " → " : ""}${RECONCILE ? "reconcile" : COLLECT ? "collect" : SUBMIT ? "submit" : LIVE ? "réel" : "dry-run"}`;
  const rows = matrixRows().filter((r) => r.pipelineSpec === spec.id || r.content?.id === spec.id);
  RUN.missing = [...new Set(rows.flatMap((r) => r.missing))];
  if (COLLECT) return collect(COLLECT);
  if (RECONCILE) return reconcile();
  // Rien à refaire : chapitre validé (six revues QA « pass ») dont le fichier n'a pas changé depuis la matrice.
  const current = existsSync(P(CHAPTER_FILE)) ? createHash("sha256").update(read(CHAPTER_FILE)).digest("hex") : null;
  const passed = rows.find((r) => r.content?.qaPassed && r.content.sha256 === current);
  if (passed && !FORCE) { RUN.notes.push(`déjà validé (QA pass, sha256 ${current!.slice(0, 16)} inchangé) : aucune étape relancée`); console.log(`${spec.id} : déjà validé, empreinte inchangée — rien à faire (--force pour forcer).`); return; }
  const OBJ = objectives();
  // Gate 1 : tout objectif utilisé par le chapitre doit être classé (niveau, notions, compétences) et validé.
  type Classified = { id: string; level?: unknown; notions?: unknown[]; competences?: unknown[]; classification?: { status?: string } };
  const unclassified = (JSON.parse(OBJ) as { objectives: Classified[] }[]).flatMap((g) => g.objectives)
    .filter((o) => !(o.level && o.notions?.length && o.competences?.length && o.classification?.status === "validé")).map((o) => o.id);
  RUN.gate1 = { ok: unclassified.length === 0, missing: unclassified };
  if (unclassified.length) {
    const msg = `Gate 1 non atteint : objectif(s) sans classement validé (niveau, notions, compétences) : ${unclassified.join(", ")}`;
    if (LIVE) fail(`${msg} — aucun envoi.`, 8);
    console.log(`avertissement : ${msg} (un envoi réel serait refusé).`);
    RUN.notes.push(msg);
  }
  // Porte G2 (décision du 2026-11-17) : tout objectif obligatoire du chapitre doit être vérifié par G2
  // (citation verbatim + approbation humaine) ; « lecture-initiale » ne suffit pas pour générer.
  const notG2 = g2Missing((JSON.parse(OBJ) as { objectives: InventoryObjective[] }[]).flatMap((g) => g.objectives), spec.grade, spec.objectiveLevels);
  if (notG2.length) {
    const msg = `porte G2 : objectif(s) obligatoire(s) sans vérification G2 (méthode « lecture-initiale ») : ${notG2.join(", ")}`;
    if (LIVE) fail(`${msg} — aucun envoi.`, 8);
    console.log(`avertissement : ${msg} (un envoi réel serait refusé).`);
    RUN.notes.push(msg);
  }

  // Essai H1 (décision du 2026-11-18) : deux requêtes Opus 5.5, même prompt, effort low puis medium, un batch chacune.
  if (EXPERIMENT === "h1") return experimentH1(OBJ);

  // 1. Dossier de recherche (à partir de l'inventaire officiel vérifié uniquement).
  const dossierUser = fill(read("pipeline/prompts/dossier.md"), { SPEC, OBJECTIVES: OBJ });
  // Modèle imposé (--dossier-model, comparaison) : ajouté à l'empreinte ; sinon empreinte inchangée.
  const hDossier = inputHash([SYSTEM_LIGHT, dossierUser], opt("--dossier-model") ? DOSSIER_MODEL : undefined);
  const dossierText = () => (existsSync(P(DOSSIER_FILE)) ? read(DOSSIER_FILE) : "(dossier non encore produit : estimation avec un dossier d'environ 8 000 caractères)".padEnd(8000, " "));
  const chapterUserFor = (dossier: string) => fill(read("pipeline/prompts/chapter.md"), { SUBJECT: spec.subject, PARCOURS: spec.parcours ?? "", ID: spec.id, EXPORT: spec.exportName, TASK: spec.taskId, GRADE: spec.grade, TREE: spec.treeChapterId, TITLE: spec.title, PREFIX: spec.exercisePrefix, SPEC, OBJECTIVES: OBJ, DOSSIER: dossier, TAXONOMY: taxonomyPrompt() })
    + (EXERCISES ? `\n\nPilot override (takes precedence over the "at least 30 exercises" rule): write exactly ${EXERCISES} exercises, progressive in level and covering every objective listed above, and set \`exerciseCountJustification\` to « Pilote API : ${EXERCISES} exercices pour valider la chaîne de production. ». All other rules still apply, including at least 3 games.` : "");
  if (!LIVE) costPlan(dossierUser, chapterUserFor(dossierText()));
  if (wanted("dossier") && !done("dossier", hDossier)) {
    if (existsSync(P(DOSSIER_FILE)) && !FORCE) { console.log(`dossier : ${DOSSIER_FILE} existe déjà, conservé (modèle ${DOSSIER_MODEL}, empreinte ${hDossier}).`); markDone("dossier", hDossier, "fichier existant"); }
    else {
      console.log("dossier :");
      const t = await call("dossier", dossierUser, hDossier, DOSSIER_MODEL);
      if (t !== null) { OUT.dossier.save(t, DOSSIER_MODEL); markDone("dossier", hDossier); }
      else if (LIVE) return; // batch en attente
    }
  }

  // 2. Chapitre complet (une requête, D4).
  const chapterUser = chapterUserFor(dossierText());
  const hChapter = hashOf(SYSTEM, chapterUser);
  if (wanted("chapter") && !done("chapter", hChapter)) {
    if (existsSync(P(CHAPTER_FILE)) && !FORCE) { console.log(`chapter : ${CHAPTER_FILE} existe déjà, conservé (--force pour le régénérer).`); markDone("chapter", hChapter, "fichier existant"); }
    else {
      if (LIVE && !existsSync(P(DOSSIER_FILE))) fail(`chapter : ${DOSSIER_FILE} absent — committer le dossier relu (et retenu, en cas de comparaison) avant de générer le chapitre.`);
      console.log("chapter :");
      const t = await call("chapter", chapterUser, hChapter, CHAPTER_MODEL);
      if (t === null) return;
      OUT.chapter.save(t, CHAPTER_MODEL); markDone("chapter", hChapter); state.fixRounds = 0; saveState();
    }
  }
  if (!existsSync(P(CHAPTER_FILE))) return;

  // 3. Validation par script, puis corrections ciblées (≤ 2 tours ; tour 1 Haiku si tout est mineur, sinon et ensuite Sonnet).
  let v = validate();
  qaValidation(v);
  console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
  // L'IA ne corrige qu'un brouillon produit par le pipeline (registre ou run courant), jamais un fichier relu et publié.
  const ledgerOps = ops(ledger()).filter((o) => o.reserve?.chapter === spec.id && o.state === "settled");
  const pipelineGenerated = state.steps.chapter?.note !== "fichier existant" || ledgerOps.some((o) => o.reserve!.step === "chapter" && o.outcome?.usable !== false);
  // Brouillon du pipeline : bloc META inséré par le pipeline (draft) ; un brouillon écrit à la main n'est jamais corrigé ici.
  const generatedHere = pipelineGenerated && isPipelineDraft(read(CHAPTER_FILE));
  let rounds = Math.max(state.fixRounds, ledgerOps.filter((o) => o.reserve!.step === "fix").length);
  while (!v.ok && generatedHere && wanted("fix") && rounds < MAX_FIX_ROUNDS) {
    rounds++; state.fixRounds = rounds; saveState();
    const model = fixModel(problemsOf(v.json), rounds);
    console.log(`fix (tour ${rounds}/${MAX_FIX_ROUNDS}) [${model}${model === MODELS.haiku ? " : problèmes tous mineurs" : ""}] :`);
    const user = fill(read("pipeline/prompts/fix.md"), { ISSUES: v.json, ID: spec.id, FILE: read(CHAPTER_FILE) });
    const t = await call("fix", user, hashOf(user), model);
    if (t === null) return;
    applyFix(t);
    v = validate(); qaValidation(v);
    console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
  }
  if (!v.ok) {
    RUN.needsHuman.push(generatedHere ? `validation en échec après ${rounds}/${MAX_FIX_ROUNDS} tour(s) de correction` : "validation en échec sur un fichier existant (jamais modifié par l'IA)");
    console.error("ARRÊT : le chapitre ne passe pas la validation automatique ; correction humaine nécessaire (needs-human)."); process.exit(6);
  }

  // 4. Juge, étape 1 : criblage Haiku sur tout le chapitre (langue, tutoiement, ton ; signale le reste).
  const screenUser = fill(read("pipeline/prompts/review.md"), { FOCUS: SCREEN_FOCUS, VALIDATOR: v.summary, SPEC, FILE: read(CHAPTER_FILE) });
  const hScreen = hashOf(screenUser);
  if (wanted("screen") && !done("screen", hScreen)) {
    console.log("screen :");
    const t = await call("screen", screenUser, hScreen, STEP_CONFIG.screen.model);
    if (t === null) { if (!LIVE) reviewDry(v.summary, null); return; }
    OUT.screen.save(t, STEP_CONFIG.screen.model); markDone("screen", hScreen);
  }

  // 5. Juge, étape 2 : Sonnet sur les seuls exercices signalés et les niveaux 4-5.
  const screen = screenResult();
  if (!screen) {
    if (doneInLedger("screen", hScreen)) { const n = `criblage soldé mais aucun rapport de criblage ${spec.taskId}-screen-QA-api*.md dans le dépôt : lancer la suite sur la branche pipeline/${spec.id}`; RUN.needsHuman.push(n); console.log(n); }
    return;
  }
  const reviewUser = reviewUserFor(v.summary, screen);
  const hReview = hashOf(reviewUser);
  if (wanted("review") && !done("review", hReview)) {
    console.log("review :");
    const t = await call("review", reviewUser, hReview, STEP_CONFIG.review.model);
    if (t === null) return;
    OUT.review.save(t, STEP_CONFIG.review.model); markDone("review", hReview);
  }
  console.log(`Terminé. Dépense totale de la phase pilote : ${money(spent())} / ${money(effectiveLimitUsd(budget.limitUsd))}.`);
}

/**
 * Essai H1 : la réflexion d'Opus 5.5 baisse-t-elle avec l'effort ? Tâche bornée : la seule démonstration M1S-SD-05.
 * Aucune exemption : chaque requête passe guard() (plafond, garde-fou de troncature avec l'estimation propre de H1).
 */
async function experimentH1(OBJ: string) {
  if (spec.id !== "math-1re-spe-second-degre") fail("--experiment h1 : réservé à math-1re-spe-second-degre");
  const objective = (JSON.parse(OBJ) as { objectives: { id: string }[] }[]).flatMap((g) => g.objectives).find((o) => o.id === "M1S-SD-05");
  if (!objective) fail("--experiment h1 : objectif M1S-SD-05 absent de l'inventaire");
  const dossier = read(DOSSIER_FILE);
  const section = dossier.slice(dossier.indexOf("## 4."), dossier.indexOf("## 5."));
  if (section.length < 200) fail("--experiment h1 : section 4 du dossier introuvable");
  const user = [
    "Essai H1. Rédige UNIQUEMENT la démonstration exigible du programme de 1re spécialité (objectif M1S-SD-05) : « Résolution de l'équation du second degré ».",
    "Contraintes : français standard, tutoiement de l'élève ; Markdown avec LaTeX entre $…$ ; hypothèses (a, b, c réels, a ≠ 0) ; forme canonique ; puis les trois cas Δ < 0, Δ = 0, Δ > 0, chacun avec sa conclusion ; démonstration complète et rigoureuse, niveau 1re, sans calculatrice ; une page au plus ; aucun exercice, aucun jeu, aucun autre contenu.",
    `Objectif (inventaire vérifié G2) :\n${JSON.stringify(objective, null, 1)}`,
    `Extrait du dossier de recherche du chapitre :\n${section.trim()}`,
  ].join("\n\n");
  const hash = hashOf(user);
  let total = 0;
  for (const step of H1_STEPS) {
    console.log(`${step} :`);
    const t = await call(step, user, hash, STEP_CONFIG[step].model);
    if (t !== null) OUT[step].save(t, STEP_CONFIG[step].model);
    total +=(await estimate(step, user, true, STEP_CONFIG[step].model)).upper;
  }
  console.log(`H1 : coût maximal des deux requêtes ${money(total)} ; dépense comptée ${money(spent())} / plafond ${money(effectiveLimitUsd(budget.limitUsd))}.`);
  RUN.notes.push(`H1 : coût maximal ${money(total)} (2 requêtes Opus, max_tokens ${STEP_CONFIG["h1-low"].maxTokens})`);
}

const SCREEN_FOCUS ="Screening pass (fast model). Check the whole chapter for French spelling and grammar, consistent « tu », tone and the terminology of the French programme (criterion « language »). For the five other criteria, do not try to be exhaustive: report as a finding, with its exerciseId, anything that looks wrong or doubtful so that a stronger model checks it; give such a criterion NEEDS_REVIEW if you report something under it, PASS otherwise.";

/** Problèmes de validation (texte) à partir du JSON de validate(). */
function problemsOf(json: string): string[] {
  try {
    const j = JSON.parse(json) as { validator?: { issues?: { problem: string }[] }; typescript?: string[] };
    return [...(j.validator?.issues ?? []).map((i) => i.problem), ...(j.typescript ?? [])];
  } catch { return ["validation illisible"]; }
}

/** Résultat du criblage enregistré (JSON validé joint au rapport Markdown), ou null. */
function screenResult(): Review | null {
  const file = latestScreenFile();
  if (!file) return null;
  const r = parseReview(extractBlock(read(file), "json"));
  return r.ok ? r.review : null;
}

/** Entrée du juge approfondi : exercices signalés par le criblage (hors langue) et exercices de niveaux 4-5. */
function reviewUserFor(validator: string, screen: Review | null): string {
  const file = read(CHAPTER_FILE);
  const flagged = new Set((screen?.findings ?? []).filter((f) => f.criterion !== "language" && f.exerciseId).map((f) => f.exerciseId));
  const general = (screen?.findings ?? []).some((f) => f.criterion !== "language" && !f.exerciseId);
  const blocks = exerciseBlocks(file, spec.exercisePrefix).filter((b) => b.niveau >= 4 || flagged.has(b.id));
  const scope = general || blocks.length === 0 ? file
    : `// Extrait : exercices ${blocks.map((b) => b.id).join(", ")} (signalés par le criblage ou de niveaux 4-5). Le reste du chapitre a été criblé.\n${blocks.map((b) => b.text).join("\n")}`;
  const focus = "In-depth judge (strong model). The screening pass already checked language; its findings are listed below. Check the exercises given (those flagged by the screening pass and every level 4-5 exercise) on the five criteria other than language: confirm or reject each screening finding and report new defects. Copy the screening verdict for « language » and its language findings.\nScreening findings (JSON):\n"
    + JSON.stringify(screen?.findings ?? [], null, 1);
  return fill(read("pipeline/prompts/review.md"), { FOCUS: focus, VALIDATOR: validator, SPEC, FILE: scope });
}

/** Dry-run : estimation du juge approfondi quand le criblage n'est pas encore produit (exercices de niveaux 4-5). */
async function reviewDry(validator: string, screen: Review | null) {
  console.log("review (estimation, criblage non encore produit : niveaux 4-5 seulement) :");
  const user = reviewUserFor(validator, screen);
  await call("review", user, hashOf(user), STEP_CONFIG.review.model);
}

/**
 * Dry-run : dépense maximale prévue par étape et par modèle, en batch (production), comparée à la même chaîne
 * entièrement sur Sonnet. Estimation hors ligne (2 car./token) ; le criblage et la correction supposent le chapitre
 * actuel (ou ~32 000 tokens s'il n'existe pas).
 */
function costPlan(dossierUser: string, chapterUser: string) {
  const tok = (s: string) => Math.ceil(s.length / CHARS_PER_TOKEN);
  const fileText = existsSync(P(CHAPTER_FILE)) ? read(CHAPTER_FILE) : "x".repeat(64000);
  const fixUser = fill(read("pipeline/prompts/fix.md"), { ISSUES: "x".repeat(3000), ID: spec.id, FILE: fileText });
  const screenUser = fill(read("pipeline/prompts/review.md"), { FOCUS: SCREEN_FOCUS, VALIDATOR: "{}", SPEC, FILE: fileText });
  const reviewUser = existsSync(P(CHAPTER_FILE)) ? reviewUserFor("{}", screenResult()) : fill(read("pipeline/prompts/review.md"), { FOCUS: "", VALIDATOR: "{}", SPEC, FILE: "x".repeat(26000) });
  const rows: [string, Step, string, string][] = [
    ["dossier", "dossier", DOSSIER_MODEL, dossierUser],
    ["chapitre", "chapter", CHAPTER_MODEL, chapterUser],
    ["fix tour 1 (MINEUR)", "fix", MODELS.haiku, fixUser],
    ["fix tour 1 (MAJEUR) ou tour 2", "fix", MODELS.sonnet, fixUser],
    ["criblage (juge 1)", "screen", STEP_CONFIG.screen.model, screenUser],
    ["juge approfondi (signalés + niveaux 4-5)", "review", STEP_CONFIG.review.model, reviewUser],
  ];
  let tiered = 0, sonnet = 0, tieredBest = 0;
  const lines = ["| Étape | Modèle | Entrée (tokens) | Sortie max | Coût max | Tout Sonnet |", "|---|---|---|---|---|---|"];
  for (const [label, step, model, user] of rows) {
    const sysTok = tok(systemFor(step)), userTok = tok(user);
    const a = upperCost(step, model, sysTok, userTok, true), b = upperCost(step, MODELS.sonnet, sysTok, userTok, true);
    const warn = longPromptWarning(prices, model, sysTok + userTok);
    lines.push(`| ${label} | ${model}${a.long ? " (tarif long)" : ""} | ${sysTok + userTok} | ${maxTokensFor(step, model)} | ${money(a.upper)} | ${money(b.upper)} |`);
    if (warn) RUN.notes.push(warn);
    const worst = label.startsWith("fix tour 1 (MINEUR)") ? 0 : label.startsWith("fix tour 1 (MAJEUR)") ? 2 : 1; // pire cas : 2 tours Sonnet
    tiered += worst * a.upper; sonnet += worst * b.upper;
    tieredBest += label.startsWith("fix") ? (label.includes("MINEUR") ? a.upper : 0) : a.upper;
  }
  lines.push(`| **Total, pire cas** (2 tours de fix Sonnet) | | | | **${money(tiered)}** | **${money(sonnet)}** |`);
  lines.push(`| Total, sans échec de validation (aucun fix) | | | | ${money(tiered - 2 * upperCost("fix", MODELS.sonnet, tok(systemFor("fix")), tok(fixUser), true).upper)} | ${money(sonnet - 2 * upperCost("fix", MODELS.sonnet, tok(systemFor("fix")), tok(fixUser), true).upper)} |`);
  lines.push(`| Total, un seul tour de fix mineur (Haiku) | | | | ${money(tieredBest)} | — |`);
  RUN.plan = lines;
  console.log(["Dépense maximale prévue (batch, estimation hors ligne) :", ...lines].join("\n"));
}

main().catch((e: unknown) => {
  if (e instanceof Anthropic.APIError) console.error(`Erreur API ${e.status} : ${e.message}`);
  else console.error(`Erreur : ${(e as Error).message}`);
  process.exit(1);
});
