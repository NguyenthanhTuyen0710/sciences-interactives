// Pipeline de production d'UN chapitre par l'API Claude, avec plafond de dépense et reprise.
//
//   npx tsx pipeline/run.ts <chapitre>                    dry-run : prompts construits, coûts estimés, AUCUN appel
//   npx tsx pipeline/run.ts <chapitre> --live             appels réels (clé + crédit vérifié obligatoires)
//   options : --step dossier|chapter|fix|review  --force  --batch (dossier, chapter, review : -50 %, asynchrone)
//
// Étapes : dossier → chapter → (validation par script → fix ≤ 2 tours) → review. Chaque étape terminée est
// enregistrée dans pipeline/state/<chapitre>.json et n'est pas refaite (sauf --force). Chaque appel est journalisé
// dans pipeline/costs.jsonl. Avant chaque appel, le coût MAXIMAL possible (max_tokens en sortie) est ajouté à la
// dépense déjà réalisée : si le total dépasse budget.limitUsd, le pipeline s'arrête sans appeler l'API.
// La clé API n'est jamais lue autrement que par le SDK (variable d'environnement) et n'est jamais affichée.
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (f: string) => join(ROOT, f);
const read = (f: string) => readFileSync(P(f), "utf8");
const readJson = <T>(f: string): T => JSON.parse(read(f));
const write = (f: string, s: string) => { mkdirSync(dirname(P(f)), { recursive: true }); writeFileSync(P(f), s); };

// ───────── Configuration ─────────
const MODEL = "claude-sonnet-5-5"; // production de contenu et relecture (Sonnet, décision du porteur de projet)
const EFFORT = "medium" as const;
const MAX_TOKENS = { dossier: 8000, chapter: 64000, fix: 16000, review: 12000 } as const;
const MAX_FIX_ROUNDS = 2;
const CHARS_PER_TOKEN = 3; // estimation hors ligne prudente (français + code) ; remplacée par count_tokens en mode réel
type Step = keyof typeof MAX_TOKENS;

interface Spec { id: string; taskId: string; grade: string; treeChapterId: string; title: string; exportName: string; exercisePrefix: string; officialChapterIds: string[]; consolidationChapterIds: string[]; scopeNotes: string[]; exampleChapter: string }
interface Price { input: number; output: number; cacheWrite1h: number; cacheRead: number }
interface StepState { status: "done" | "batch-pending"; hash: string; batchId?: string; at: string; note?: string }
interface State { chapter: string; steps: Partial<Record<Step, StepState>>; fixRounds: number }

const args = process.argv.slice(2);
const chapterId = args.find((a) => !a.startsWith("--"));
const flag = (f: string) => args.includes(f);
const opt = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const LIVE = flag("--live"), FORCE = flag("--force"), BATCH = flag("--batch"), ONLY = opt("--step") as Step | undefined;

if (!chapterId) { console.error("Usage : npx tsx pipeline/run.ts <chapitre> [--live] [--step s] [--force] [--batch]"); process.exit(2); }
const spec = readJson<Spec>(`pipeline/chapters/${chapterId}.json`);
const prices = readJson<{ batchMultiplier: number; models: Record<string, Price> }>("pipeline/prices.json");
const budget = readJson<{ limitUsd: number; creditVerified: boolean }>("pipeline/budget.json");
const price = prices.models[MODEL];
const STATE_FILE = `pipeline/state/${spec.id}.json`;
const state: State = existsSync(P(STATE_FILE)) ? readJson(STATE_FILE) : { chapter: spec.id, steps: {}, fixRounds: 0 };
const saveState = () => write(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
const CHAPTER_FILE = `src/lib/chapters/data/${spec.id}.ts`;
const DOSSIER_FILE = `research/dossiers/${spec.id}.md`;
const REPORT_FILE = `project/reports/${spec.taskId}-QA-api.md`;

// ───────── Coûts ─────────
const COSTS = "pipeline/costs.jsonl";
const spent = () => (existsSync(P(COSTS)) ? read(COSTS).trim().split("\n").filter(Boolean).reduce((s, l) => s + JSON.parse(l).usd, 0) : 0);
const usd = (n: number, perM: number) => (n * perM) / 1e6;
const money = (x: number) => `$${x.toFixed(3)}`;

function actualCost(u: Anthropic.Usage, batch: boolean): number {
  const m = batch ? prices.batchMultiplier : 1;
  const write = u.cache_creation_input_tokens ?? 0;
  return m * (usd(u.input_tokens, price.input) + usd(write, price.cacheWrite1h) + usd(u.cache_read_input_tokens ?? 0, price.cacheRead) + usd(u.output_tokens, price.output));
}

// ───────── Prompts (préfixe système identique pour toutes les étapes → cache) ─────────
const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k: string) => { if (!(k in v)) throw new Error(`variable de gabarit manquante : ${k}`); return v[k]; });
const SYSTEM = fill(read("pipeline/prompts/system.md"), {
  SCHEMA: read("src/lib/chapters/schema.ts"), TYPES: read("src/lib/engine/types.ts"), EXAMPLE_PATH: spec.exampleChapter, EXAMPLE: read(spec.exampleChapter),
});

function objectives(): string {
  const inv = readJson<{ grades: { domains: { chapters: { id: string; objectives: unknown[] }[] }[] }[] }>("research/curriculum/mathematiques/curriculum-math.json");
  const all = inv.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters));
  const pick = (ids: string[], kind: string) => ids.map((id) => { const c = all.find((x) => x.id === id); if (!c) throw new Error(`chapitre ${id} absent de l'inventaire`); return { chapter: id, kind, objectives: c.objectives }; });
  return JSON.stringify([...pick(spec.officialChapterIds, "officiel 3e"), ...pick(spec.consolidationChapterIds, "consolidation")], null, 1);
}
const SPEC = JSON.stringify(spec, null, 1);

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
const params = (step: Step, user: string): Anthropic.MessageCreateParamsNonStreaming => ({
  model: MODEL,
  max_tokens: MAX_TOKENS[step],
  output_config: { effort: EFFORT },
  system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral", ttl: "1h" } }],
  messages: [{ role: "user", content: user }],
});

async function estimate(step: Step, user: string, batch: boolean) {
  let sysTok = Math.ceil(SYSTEM.length / CHARS_PER_TOKEN), userTok = Math.ceil(user.length / CHARS_PER_TOKEN), exact = false;
  if (client) {
    const c = await client.messages.countTokens({ model: MODEL, system: [{ type: "text", text: SYSTEM }], messages: [{ role: "user", content: "." }] });
    const t = await client.messages.countTokens({ model: MODEL, system: [{ type: "text", text: SYSTEM }], messages: [{ role: "user", content: user }] });
    sysTok = c.input_tokens; userTok = t.input_tokens - c.input_tokens; exact = true;
  }
  const m = batch ? prices.batchMultiplier : 1;
  // Pire cas : préfixe système écrit en cache (pas lu), sortie au maximum.
  const upper = m * (usd(sysTok, systemCached ? price.cacheRead : price.cacheWrite1h) + usd(userTok, price.input) + usd(MAX_TOKENS[step], price.output));
  return { sysTok, userTok, upper, exact };
}

async function guard(step: Step, user: string, batch: boolean) {
  const e = await estimate(step, user, batch);
  const already = spent();
  console.log(`  estimation ${step}${batch ? " (batch)" : ""} : système ${e.sysTok} + requête ${e.userTok} tokens${e.exact ? "" : " (approx.)"}, coût maximal ${money(e.upper)} ; déjà dépensé ${money(already)} / plafond ${money(budget.limitUsd)}`);
  if (already + e.upper > budget.limitUsd) { console.error(`  ARRÊT : budget insuffisant pour l'étape ${step} (il faudrait jusqu'à ${money(already + e.upper)}).`); process.exit(3); }
  return e;
}

function logCost(step: Step, usage: Anthropic.Usage, batch: boolean, extra: Record<string, unknown> = {}) {
  const cost = actualCost(usage, batch);
  appendFileSync(P(COSTS), JSON.stringify({ at: new Date().toISOString(), chapter: spec.id, step, model: MODEL, batch, usage: { input: usage.input_tokens, output: usage.output_tokens, cacheWrite: usage.cache_creation_input_tokens ?? 0, cacheRead: usage.cache_read_input_tokens ?? 0 }, usd: Number(cost.toFixed(5)), ...extra }) + "\n");
  console.log(`  coût réel ${money(cost)} (entrée ${usage.input_tokens}, cache écrit ${usage.cache_creation_input_tokens ?? 0}, cache lu ${usage.cache_read_input_tokens ?? 0}, sortie ${usage.output_tokens}) — total ${money(spent())}`);
}

function textOf(msg: Anthropic.Message, step: Step): string {
  if (msg.stop_reason === "refusal") throw new Error(`étape ${step} : refus du modèle`);
  if (msg.stop_reason === "max_tokens") throw new Error(`étape ${step} : sortie tronquée (max_tokens atteint)`);
  return msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
}

/** Exécute une étape : renvoie le texte, ou null si un batch est en attente. */
async function call(step: Step, user: string, hash: string): Promise<string | null> {
  const batch = BATCH && step !== "fix";
  const st = state.steps[step];
  if (LIVE && client && st?.status === "batch-pending" && st.batchId && st.hash === hash) {
    const b = await client.messages.batches.retrieve(st.batchId);
    if (b.processing_status !== "ended") { console.log(`  batch ${step} en cours (${b.request_counts.processing} en traitement) : relancer plus tard.`); return null; }
    for await (const r of await client.messages.batches.results(st.batchId)) {
      if (r.result.type !== "succeeded") throw new Error(`batch ${step} : ${r.result.type}`);
      logCost(step, r.result.message.usage, true);
      return textOf(r.result.message, step);
    }
    throw new Error(`batch ${step} : aucun résultat`);
  }
  await guard(step, user, batch);
  if (!LIVE || !client) { console.log(`  dry-run : appel ${step} non envoyé.`); return null; }
  if (batch) {
    const b = await client.messages.batches.create({ requests: [{ custom_id: `${spec.id}-${step}`, params: params(step, user) }] });
    state.steps[step] = { status: "batch-pending", hash, batchId: b.id, at: new Date().toISOString() };
    saveState();
    console.log(`  batch ${step} soumis : relancer la même commande pour récupérer le résultat.`);
    return null;
  }
  const msg = await client.messages.stream(params(step, user)).finalMessage();
  systemCached = true;
  logCost(step, msg.usage, false);
  return textOf(msg, step);
}

const hashOf = (...parts: string[]) => createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 16);
const done = (step: Step, hash: string) => !FORCE && state.steps[step]?.status === "done" && state.steps[step]!.hash === hash;
const wanted = (step: Step) => !ONLY || ONLY === step;
const markDone = (step: Step, hash: string, note?: string) => { state.steps[step] = { status: "done", hash, at: new Date().toISOString(), note }; saveState(); };

// ───────── Programme ─────────
async function main() {
  console.log(`Pipeline ${spec.id} (${spec.taskId}) — modèle ${MODEL}, effort ${EFFORT}, mode ${LIVE ? "RÉEL" : "dry-run"}${BATCH ? " + batch" : ""}`);
  if (LIVE) {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) { console.error("ARRÊT : aucune clé dans l'environnement (ANTHROPIC_API_KEY)."); process.exit(4); }
    if (!budget.creditVerified) { console.error("ARRÊT : crédit API Startup et limite de dépense non confirmés (pipeline/budget.json → creditVerified)."); process.exit(4); }
    client = new Anthropic({ maxRetries: 2 });
  }
  const OBJ = objectives();

  // 1. Dossier de recherche (à partir de l'inventaire officiel vérifié uniquement).
  const dossierUser = fill(read("pipeline/prompts/dossier.md"), { SPEC, OBJECTIVES: OBJ });
  const hDossier = hashOf(SYSTEM, dossierUser);
  if (wanted("dossier") && !done("dossier", hDossier)) {
    if (existsSync(P(DOSSIER_FILE)) && !FORCE) { console.log(`dossier : ${DOSSIER_FILE} existe déjà, conservé.`); markDone("dossier", hDossier, "fichier existant"); }
    else {
      console.log("dossier :");
      const t = await call("dossier", dossierUser, hDossier);
      if (t !== null) { write(DOSSIER_FILE, t.trim() + "\n"); markDone("dossier", hDossier); }
      else if (LIVE) return; // batch en attente
    }
  }

  // 2. Chapitre complet.
  const dossier = existsSync(P(DOSSIER_FILE)) ? read(DOSSIER_FILE) : "(dossier non encore produit : estimation avec un dossier d'environ 8 000 caractères)".padEnd(8000, " ");
  const chapterUser = fill(read("pipeline/prompts/chapter.md"), { ID: spec.id, EXPORT: spec.exportName, TASK: spec.taskId, GRADE: spec.grade, TREE: spec.treeChapterId, TITLE: spec.title, PREFIX: spec.exercisePrefix, SPEC, OBJECTIVES: OBJ, DOSSIER: dossier });
  const hChapter = hashOf(SYSTEM, chapterUser);
  if (wanted("chapter") && !done("chapter", hChapter)) {
    if (existsSync(P(CHAPTER_FILE)) && !FORCE) { console.error(`ARRÊT : ${CHAPTER_FILE} existe déjà (contenu potentiellement approuvé). Utiliser --force pour le régénérer.`); process.exit(5); }
    console.log("chapter :");
    const t = await call("chapter", chapterUser, hChapter);
    if (t === null) { if (!LIVE) estimateRest(); return; }
    write(CHAPTER_FILE, extractBlock(t, "ts") + "\n"); markDone("chapter", hChapter); state.fixRounds = 0; saveState();
  }
  if (!existsSync(P(CHAPTER_FILE))) return;

  // 3. Validation par script, puis corrections ciblées (≤ 2 tours, éditions minimales).
  let v = validate();
  console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
  while (!v.ok && wanted("fix") && state.fixRounds < MAX_FIX_ROUNDS) {
    state.fixRounds++; saveState();
    console.log(`fix (tour ${state.fixRounds}/${MAX_FIX_ROUNDS}) :`);
    const user = fill(read("pipeline/prompts/fix.md"), { ISSUES: v.json, ID: spec.id, FILE: read(CHAPTER_FILE) });
    const t = await call("fix", user, hashOf(user));
    if (t === null) return;
    const { text, failed } = applyEdits(read(CHAPTER_FILE), JSON.parse(extractBlock(t, "json")));
    write(CHAPTER_FILE, text);
    if (failed.length) console.log(`  ${failed.length} remplacement(s) non appliqué(s) : ${failed.join(" | ")}`);
    v = validate();
    console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
  }
  if (!v.ok) { console.error("ARRÊT : le chapitre ne passe pas la validation automatique ; correction humaine nécessaire."); process.exit(6); }

  // 4. Relecture pédagogique et linguistique (une seule).
  const reviewUser = fill(read("pipeline/prompts/review.md"), { VALIDATOR: v.summary, SPEC, FILE: read(CHAPTER_FILE) });
  const hReview = hashOf(reviewUser);
  if (wanted("review") && !done("review", hReview)) {
    console.log("review :");
    const t = await call("review", reviewUser, hReview);
    if (t === null) return;
    write(REPORT_FILE, `<!-- Relecture produite par ${MODEL} via pipeline/run.ts ; à confirmer par un humain. -->\n` + t.trim() + "\n"); markDone("review", hReview);
  }
  console.log(`Terminé. Dépense totale de la phase pilote : ${money(spent())} / ${money(budget.limitUsd)}.`);
}

/** En dry-run, estime aussi les étapes suivantes (dont le texte dépend de sorties pas encore produites). */
function estimateRest() {
  const fileTok = 32000, m = BATCH ? prices.batchMultiplier : 1;
  const sys = Math.ceil(SYSTEM.length / CHARS_PER_TOKEN);
  const fix = usd(sys, price.cacheRead) + usd(fileTok + 3000, price.input) + usd(MAX_TOKENS.fix, price.output);
  const review = m * (usd(sys, price.cacheRead) + usd(fileTok + 2000, price.input) + usd(MAX_TOKENS.review, price.output));
  console.log(`  estimation fix : ≤ ${MAX_FIX_ROUNDS} × ${money(fix)} ; review : ${money(review)} (cache système supposé lu ; pire cas sans cache : +${money(m * usd(sys, price.cacheWrite1h - price.cacheRead))} par appel)`);
}

main().catch((e: unknown) => {
  if (e instanceof Anthropic.APIError) console.error(`Erreur API ${e.status} : ${e.message}`);
  else console.error(`Erreur : ${(e as Error).message}`);
  process.exit(1);
});
