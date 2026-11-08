// Pipeline de production d'UN chapitre par l'API Claude, avec plafond de dépense et reprise.
//
//   npx tsx pipeline/run.ts <chapitre>                    dry-run : prompts construits, coûts estimés, AUCUN appel
//   npx tsx pipeline/run.ts <chapitre> --live             appels réels (clé + crédit vérifié obligatoires)
//   options : --step dossier|chapter|fix|review  --force  --batch (dossier, chapter, review : -50 %, asynchrone)
//             --exercises N   nombre d'exercices imposé (pilote ; justification ajoutée au chapitre)
//             --level 3e --subject mathematiques   contrôle de cohérence avec la fiche du chapitre
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
import { appendLedger, ops, readLedger, reconcileBatch, spendBlockers, spentUsd, TRIAL_CAP_USD } from "./ledger";
import { outputProblem, parseReview, REVIEW_JSON_SCHEMA, reviewMarkdown } from "./review-format";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
// Estimation hors ligne (dry-run) ; remplacée par count_tokens en mode réel. Mesuré sur les runs #5 à #8 (Sonnet 5.5,
// français + TypeScript) : 2,02 à 2,17 caractères par token ; 2 donne une légère surestimation.
const CHARS_PER_TOKEN = 2;
type Step = keyof typeof MAX_TOKENS;

interface Spec { id: string; taskId: string; grade: string; subject: string; objectiveIds?: string[]; treeChapterId: string; title: string; exportName: string; exercisePrefix: string; officialChapterIds: string[]; consolidationChapterIds: string[]; scopeNotes: string[]; exampleChapter: string }
interface Price { input: number; output: number; cacheWrite1h: number; cacheRead: number }
interface StepState { status: "done" | "batch-pending"; hash: string; batchId?: string; at: string; note?: string }
interface State { chapter: string; steps: Partial<Record<Step, StepState>>; fixRounds: number }

const args = process.argv.slice(2);
const VALUE_OPTS = ["--step", "--exercises", "--collect", "--level", "--subject"];
const chapterId = args.find((a, i) => !a.startsWith("--") && !VALUE_OPTS.includes(args[i - 1]));
const flag = (f: string) => args.includes(f);
const opt = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const SUBMIT = flag("--submit"), COLLECT = opt("--collect"), RECONCILE = flag("--reconcile");
const LIVE = flag("--live") || SUBMIT || !!COLLECT || RECONCILE, FORCE = flag("--force"), BATCH = flag("--batch") || SUBMIT, ONLY = opt("--step") as Step | undefined;
const EXERCISES = opt("--exercises") === undefined ? undefined : Number(opt("--exercises"));

function fail(msg: string, code = 2): never { console.error(`ARRÊT : ${msg}`); process.exit(code); }
if (!chapterId) fail("Usage : npx tsx pipeline/run.ts <chapitre> [--live] [--step s] [--force] [--batch] [--submit | --collect <batchId>] [--exercises N] [--level g --subject s]");
if (!/^[a-z0-9-]+$/.test(chapterId!)) fail(`identifiant de chapitre invalide : ${chapterId}`);
if (!existsSync(P(`pipeline/chapters/${chapterId}.json`))) fail(`chapitre ${chapterId} absent du catalogue du pipeline (pipeline/chapters/)`);
if ([SUBMIT, !!COLLECT, RECONCILE].filter(Boolean).length > 1) fail("--submit, --collect et --reconcile sont exclusifs");
if (COLLECT !== undefined && !/^msgbatch_[A-Za-z0-9]+$/.test(COLLECT)) fail("identifiant de batch invalide (attendu : msgbatch_…)");
if (EXERCISES !== undefined && !(Number.isInteger(EXERCISES) && EXERCISES >= 1 && EXERCISES <= 60)) fail("--exercises doit être un entier entre 1 et 60");
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

// ───────── Contrôle des données d'entrée (avant toute estimation ou tout appel) ─────────
function checkInputs() {
  const level = opt("--level"), subject = opt("--subject");
  if (spec.id !== chapterId) fail(`la fiche pipeline/chapters/${chapterId}.json déclare l'id ${spec.id}`);
  if (level && level !== spec.grade) fail(`niveau ${level} ≠ niveau du chapitre (${spec.grade})`);
  if (subject && subject !== spec.subject) fail(`matière ${subject} ≠ matière du chapitre (${spec.subject})`);
  if (spec.subject !== "mathematiques") fail("le pipeline ne produit que des chapitres de mathématiques (prompts et inventaire)");
  const manifestFile = `research/curriculum/${spec.subject}/manifest-${spec.grade}.json`;
  if (!existsSync(P(manifestFile))) fail(`aucun manifest pour ${spec.subject} ${spec.grade} (${manifestFile})`);
  const themes = readJson<{ themes: { treeChapterId: string; taskId: string }[] }>(manifestFile).themes;
  if (!themes.some((t) => t.treeChapterId === spec.treeChapterId && t.taskId === spec.taskId)) fail(`${spec.treeChapterId} / ${spec.taskId} absent de ${manifestFile}`);
  if (!read("src/lib/content/curriculum.ts").includes(`"${spec.treeChapterId}"`)) console.log(`avertissement : ${spec.treeChapterId} pas encore dans l'arborescence du site (src/lib/content/curriculum.ts) ; à ajouter lors de l'intégration.`);
  console.log(`contrôle des données : OK (${spec.grade}, ${spec.subject}, ${spec.treeChapterId}, ${spec.taskId}${EXERCISES ? `, ${EXERCISES} exercices imposés` : ""})`);
}
checkInputs();

// ───────── Coûts ─────────
// Registre des dépenses partagé (pipeline/ledger.ts) ; synchronisé avec le stockage « data-store » par le workflow.
const LEDGER = P("pipeline/.store/ledger.jsonl");
const ledger = () => readLedger(LEDGER);
const spent = () => spentUsd(ledger());
const readiness = () => ({ ledgerSynced: process.env.PIPELINE_LEDGER_SYNCED === "1", creditVerified: budget.creditVerified, limitUsd: budget.limitUsd });
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
  const pick = (ids: string[], kind: string, keep?: string[]) => ids.map((id) => {
    const c = all.find((x) => x.id === id);
    if (!c) throw new Error(`chapitre ${id} absent de l'inventaire`);
    const objectives = keep ? (c.objectives as { id: string }[]).filter((o) => keep.includes(o.id)) : c.objectives;
    if (!objectives.length) throw new Error(`aucun objectif retenu pour ${id}`);
    return { chapter: id, kind, objectives };
  });
  return JSON.stringify([...pick(spec.officialChapterIds, `officiel ${spec.grade}`, spec.objectiveIds), ...pick(spec.consolidationChapterIds, "consolidation")], null, 1);
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
  // Relecture : JSON imposé par structured outputs (pris en charge par les Message Batches), revérifié par parseReview.
  output_config: step === "review" ? { effort: EFFORT, format: { type: "json_schema", schema: REVIEW_JSON_SCHEMA } } : { effort: EFFORT },
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

/** Estime le coût maximal et applique TOUS les contrôles de dépense ; en dry-run, les affiche sans bloquer. */
async function guard(step: Step, user: string, batch: boolean, hash: string) {
  if (LIVE) { // conditions indépendantes du coût : vérifiées avant toute requête, même gratuite (count_tokens)
    const pre = spendBlockers(ledger(), { chapter: spec.id, step, inputHash: hash, maxUsd: 0 }, readiness());
    if (pre.length) { for (const b of pre) console.error(`  ARRÊT : ${b}`); process.exit(3); }
  }
  const e = await estimate(step, user, batch);
  console.log(`  estimation ${step}${batch ? " (batch)" : ""} : système ${e.sysTok} + requête ${e.userTok} tokens${e.exact ? " (count_tokens)" : ` (approx. ${CHARS_PER_TOKEN} car./token)`}, sortie ≤ ${MAX_TOKENS[step]}, empreinte ${hash}, coût maximal ${money(e.upper)} ; déjà compté ${money(spent())} / plafond ${money(Math.min(budget.limitUsd, TRIAL_CAP_USD))}`);
  const blockers = spendBlockers(ledger(), { chapter: spec.id, step, inputHash: hash, maxUsd: e.upper }, readiness());
  if (!LIVE) { for (const b of blockers) console.log(`  (envoi réel bloqué : ${b})`); return e; }
  if (blockers.length) { for (const b of blockers) console.error(`  ARRÊT : ${b}`); process.exit(3); }
  return e;
}

/** Réserve le coût maximal dans le registre AVANT l'envoi ; renvoie l'identifiant de l'opération. */
function reserve(step: Step, hash: string, mode: "batch" | "sync", maxUsd: number): string {
  const id = `${spec.id}-${step}-${Date.now()}`;
  appendLedger(LEDGER, { type: "reserve", id, at: new Date().toISOString(), chapter: spec.id, step, inputHash: hash, mode, maxUsd: Number(maxUsd.toFixed(5)) });
  return id;
}

/** Solde une opération par son coût réel (une seule fois par opération ou par batch). */
function logCost(step: Step, usage: Anthropic.Usage, batch: boolean, ref: { opId?: string; batchId?: string }) {
  const cost = actualCost(usage, batch);
  const op = ops(ledger()).find((o) => (ref.opId && o.id === ref.opId) || (ref.batchId && o.batchId === ref.batchId));
  const thinking = usage.output_tokens_details?.thinking_tokens;
  const detail = `entrée ${usage.input_tokens}, cache écrit ${usage.cache_creation_input_tokens ?? 0}, cache lu ${usage.cache_read_input_tokens ?? 0}, sortie ${usage.output_tokens}${thinking != null ? ` dont réflexion ${thinking}` : ""}`;
  if (op?.state === "settled") { console.log(`  coût déjà enregistré pour ${op.id} (${money(op.usd ?? 0)}) : non compté deux fois (${detail})`); return; }
  appendLedger(LEDGER, { type: "actual", id: op?.id ?? `externe-${ref.batchId}`, at: new Date().toISOString(), usd: Number(cost.toFixed(5)), batchId: ref.batchId });
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
  console.error(`ARRÊT : étape ${step} : ${problem} ; texte reçu (${text.length} caractères) sauvegardé dans ${saved}, issue inscrite au registre.`);
  process.exit(7);
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
      logCost(step, r.result.message.usage, true, { batchId: st.batchId });
      return finish(step, r.result.message, { batchId: st.batchId });
    }
    throw new Error(`batch ${step} : aucun résultat`);
  }
  if (SUBMIT && !batch) { console.log(`  submit : l'étape ${step} exige un appel synchrone, non autorisé dans ce mode ; à traiter localement après relecture.`); return null; }
  const e = await guard(step, user, batch, hash);
  if (!LIVE || !client) { console.log(`  dry-run : appel ${step} non envoyé.`); return null; }
  const opId = reserve(step, hash, batch ? "batch" : "sync", e.upper);
  // Pas de nouvelle tentative automatique pour un envoi payant : une erreur laisse l'issue « inconnue » (→ --reconcile).
  const unknown = (err: unknown): never => { appendLedger(LEDGER, { type: "unknown", id: opId, at: new Date().toISOString(), error: String((err as Error).message ?? err).slice(0, 300) }); throw err; };
  if (batch) {
    const b = await client.messages.batches.create({ requests: [{ custom_id: `${spec.id}-${step}`, params: params(step, user) }] }, { maxRetries: 0 }).catch(unknown);
    appendLedger(LEDGER, { type: "submitted", id: opId, at: new Date().toISOString(), batchId: b.id });
    state.steps[step] = { status: "batch-pending", hash, batchId: b.id, at: new Date().toISOString() };
    saveState();
    console.log(`  batch ${step} soumis : ${b.id} (récupérer avec --collect ${b.id}, ou relancer la même commande en local).`);
    return null;
  }
  const msg = await client.messages.stream(params(step, user), { maxRetries: 0 }).finalMessage().catch(unknown);
  systemCached = true;
  logCost(step, msg.usage, false, { opId });
  return finish(step, msg, { opId });
}

// ───────── Écriture des sorties (jamais publiées : le chapitre reste « draft » et hors registre) ─────────
type OutStep = Exclude<Step, "fix">;
const OUT: Record<OutStep, { file: string; save: (t: string) => void }> = {
  dossier: { file: DOSSIER_FILE, save: (t) => write(DOSSIER_FILE, t.trim() + "\n") },
  chapter: { file: CHAPTER_FILE, save: (t) => write(CHAPTER_FILE, extractBlock(t, "ts") + "\n") },
  review: { file: REPORT_FILE, save: (t) => { const r = parseReview(t); if (!r.ok) fail(`relecture hors schéma : ${r.errors.join(" ; ")}`, 7); write(REPORT_FILE, reviewMarkdown(r.review, `<!-- Relecture produite par ${MODEL} via pipeline/run.ts (JSON validé par pipeline/review-format.ts) ; à confirmer par un humain. -->\n# Relecture QA (API) — ${spec.id}`)); } },
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
    const out = OUT[step as OutStep];
    if (r.result.type !== "succeeded") fail(`batch ${step} : ${r.result.type}`, 1);
    if (existsSync(P(out.file)) && !FORCE) fail(`${out.file} existe déjà ; utiliser --force pour le remplacer`, 5);
    logCost(step as Step, r.result.message.usage, true, { batchId });
    out.save(finish(step as Step, r.result.message, { batchId }));
    console.log(`${step} écrit dans ${out.file} (brouillon, relecture humaine requise avant tout commit)`);
    if (step === "chapter") { const v = validate(); console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`); }
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

const hashOf = (...parts: string[]) => createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 16);
const done = (step: Step, hash: string) => !FORCE && state.steps[step]?.status === "done" && state.steps[step]!.hash === hash;
const wanted = (step: Step) => !ONLY || ONLY === step;
const markDone = (step: Step, hash: string, note?: string) => { state.steps[step] = { status: "done", hash, at: new Date().toISOString(), note }; saveState(); };

// ───────── Programme ─────────
async function main() {
  console.log(`Pipeline ${spec.id} (${spec.taskId}) — modèle ${MODEL}, effort ${EFFORT}, mode ${RECONCILE ? "reconcile" : COLLECT ? "collect" : SUBMIT ? "submit (batch)" : LIVE ? "RÉEL" : "dry-run"}${BATCH && !SUBMIT ? " + batch" : ""}`);
  if (LIVE) {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) { console.error("ARRÊT : aucune clé dans l'environnement (ANTHROPIC_API_KEY)."); process.exit(4); }
    client = new Anthropic({ maxRetries: 2 }); // nouvelles tentatives réservées aux lectures ; les envois payants passent maxRetries: 0
  }
  if (COLLECT) return collect(COLLECT);
  if (RECONCILE) return reconcile();
  const OBJ = objectives();

  // 1. Dossier de recherche (à partir de l'inventaire officiel vérifié uniquement).
  const dossierUser = fill(read("pipeline/prompts/dossier.md"), { SPEC, OBJECTIVES: OBJ });
  const hDossier = hashOf(SYSTEM, dossierUser);
  if (wanted("dossier") && !done("dossier", hDossier)) {
    if (existsSync(P(DOSSIER_FILE)) && !FORCE) { console.log(`dossier : ${DOSSIER_FILE} existe déjà, conservé.`); markDone("dossier", hDossier, "fichier existant"); }
    else {
      console.log("dossier :");
      const t = await call("dossier", dossierUser, hDossier);
      if (t !== null) { OUT.dossier.save(t); markDone("dossier", hDossier); }
      else if (LIVE) return; // batch en attente
    }
  }

  // 2. Chapitre complet.
  const dossier = existsSync(P(DOSSIER_FILE)) ? read(DOSSIER_FILE) : "(dossier non encore produit : estimation avec un dossier d'environ 8 000 caractères)".padEnd(8000, " ");
  const chapterUser = fill(read("pipeline/prompts/chapter.md"), { ID: spec.id, EXPORT: spec.exportName, TASK: spec.taskId, GRADE: spec.grade, TREE: spec.treeChapterId, TITLE: spec.title, PREFIX: spec.exercisePrefix, SPEC, OBJECTIVES: OBJ, DOSSIER: dossier })
    + (EXERCISES ? `\n\nPilot override (takes precedence over the "at least 30 exercises" rule): write exactly ${EXERCISES} exercises, progressive in level and covering every objective listed above, and set \`exerciseCountJustification\` to « Pilote API : ${EXERCISES} exercices pour valider la chaîne de production. ». All other rules still apply, including at least 3 games.` : "");
  const hChapter = hashOf(SYSTEM, chapterUser);
  if (wanted("chapter") && !done("chapter", hChapter)) {
    if (existsSync(P(CHAPTER_FILE)) && !FORCE) { console.log(`chapter : ${CHAPTER_FILE} existe déjà, conservé (--force pour le régénérer).`); markDone("chapter", hChapter, "fichier existant"); }
    else {
      console.log("chapter :");
      const t = await call("chapter", chapterUser, hChapter);
      if (t === null) { if (!LIVE) estimateRest(); return; }
      OUT.chapter.save(t); markDone("chapter", hChapter); state.fixRounds = 0; saveState();
    }
  }
  if (!existsSync(P(CHAPTER_FILE))) return;

  // 3. Validation par script, puis corrections ciblées (≤ 2 tours, éditions minimales).
  let v = validate();
  console.log(`validation : ${v.ok ? "OK" : "échecs"} — ${v.summary}`);
  // Un fichier préexistant (approuvé ou relu par un humain) n'est jamais modifié par l'IA.
  const generatedHere = state.steps.chapter?.note !== "fichier existant";
  while (!v.ok && generatedHere && wanted("fix") && state.fixRounds < MAX_FIX_ROUNDS) {
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
    OUT.review.save(t); markDone("review", hReview);
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
