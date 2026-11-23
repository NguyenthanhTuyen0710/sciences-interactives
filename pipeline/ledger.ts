// Registre des dépenses API (append-only, JSONL) partagé entre les exécutions via le stockage « data-store »
// (release GitHub en brouillon, voir .github/workflows/generate-lessons.yml). Hors Git.
//
// Chaque appel payant est RÉSERVÉ (coût maximal) et écrit sur disque AVANT l'envoi. Tant qu'une réservation n'est pas
// soldée par son coût réel, elle compte pour son coût maximal. Une issue inconnue (erreur réseau à la création) bloque
// toute nouvelle dépense jusqu'à réconciliation : aucune nouvelle tentative automatique, donc aucun doublon.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

export const TRIAL_CAP_USD = 10; // plafond de la phase d'essai, non modifiable par budget.json

export type LedgerEntry =
  | { type: "reserve"; id: string; at: string; chapter: string; step: string; inputHash: string; mode: "batch" | "sync"; maxUsd: number; model?: string; retryOf?: string; retryReason?: string }
  | { type: "submitted"; id: string; at: string; batchId: string }
  | { type: "actual"; id: string; at: string; usd: number; batchId?: string; model?: string; tokens?: { input: number; cacheWrite: number; cacheRead: number; output: number; thinking?: number } }
  | { type: "failed"; id: string; at: string; reason: string }
  | { type: "unknown"; id: string; at: string; error: string }
  // Issue d'une opération soldée : motif d'arrêt du modèle et utilisabilité du résultat (sans effet sur la dépense ni l'anti-doublon).
  | { type: "outcome"; id: string; at: string; stopReason: string; usable: boolean; note?: string; saved?: string };

export type OpState = "reserved" | "submitted" | "settled" | "failed" | "unknown";
export interface Op { id: string; reserve: Extract<LedgerEntry, { type: "reserve" }> | null; state: OpState; batchId?: string; usd?: number; outcome?: Extract<LedgerEntry, { type: "outcome" }>; actual?: Extract<LedgerEntry, { type: "actual" }> }

/** Modèle d'une opération ; les entrées antérieures au 2026-11-15 (sans champ) étaient toutes faites avec Sonnet 5.5. */
export const HISTORICAL_MODEL = "claude-sonnet-5-5";
export const modelOf = (o: Op) => o.actual?.model ?? o.reserve?.model ?? HISTORICAL_MODEL;

/** Dépense soldée par modèle (USD). */
export function spentByModel(entries: LedgerEntry[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of ops(entries)) if (o.state === "settled") out[modelOf(o)] = (out[modelOf(o)] ?? 0) + (o.usd ?? 0);
  return out;
}

export function readLedger(file: string): LedgerEntry[] {
  return existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as LedgerEntry) : [];
}
export function appendLedger(file: string, e: LedgerEntry) { mkdirSync(dirname(file), { recursive: true }); appendFileSync(file, JSON.stringify(e) + "\n"); }

export function ops(entries: LedgerEntry[]): Op[] {
  const m = new Map<string, Op>();
  for (const e of entries) {
    const op = m.get(e.id) ?? { id: e.id, reserve: null, state: "reserved" as OpState };
    if (e.type === "reserve") op.reserve = e;
    else if (e.type === "submitted") { op.state = "submitted"; op.batchId = e.batchId; }
    else if (e.type === "actual") { op.state = "settled"; op.usd = e.usd; op.batchId ??= e.batchId; op.actual = e; }
    else if (e.type === "failed") op.state = "failed";
    else if (e.type === "unknown") op.state = "unknown";
    else if (e.type === "outcome") op.outcome = e;
    m.set(e.id, op);
  }
  return [...m.values()];
}

/** Dépense comptée : coût réel si soldé, coût maximal sinon (prudent), 0 si l'échec est établi. */
export const spentUsd = (entries: LedgerEntry[]) =>
  ops(entries).reduce((s, o) => s + (o.state === "settled" ? o.usd ?? 0 : o.state === "failed" ? 0 : o.reserve?.maxUsd ?? 0), 0);

export interface SpendRequest { chapter: string; step: string; inputHash: string; maxUsd: number }
export interface Readiness { ledgerSynced: boolean; creditVerified: boolean; limitUsd: number }

/** Plafond réellement appliqué : budget.json → limitUsd, jamais au-delà du plafond d'essai. */
export const effectiveLimitUsd = (limitUsd: number) => Math.min(limitUsd, TRIAL_CAP_USD);

/** Toutes les conditions d'une dépense ; la liste vide signifie « autorisé ». */
export function spendBlockers(entries: LedgerEntry[], req: SpendRequest, r: Readiness): string[] {
  const b: string[] = [];
  if (!r.ledgerSynced) b.push("registre des dépenses non synchronisé avec le stockage partagé (PIPELINE_LEDGER_SYNCED≠1) : dépense cumulée inconnue");
  if (!r.creditVerified) b.push("crédit API et limite de dépense non confirmés (budget.json → creditVerified)");
  if (r.limitUsd > TRIAL_CAP_USD) b.push(`budget.json → limitUsd (${r.limitUsd}) dépasse le plafond d'essai de ${TRIAL_CAP_USD} USD`);
  const all = ops(entries);
  const open = all.filter((o) => o.state === "reserved" || o.state === "unknown");
  if (open.length) b.push(`opération(s) à l'issue inconnue : ${open.map((o) => o.id).join(", ")} — lancer --reconcile (aucune nouvelle tentative automatique)`);
  const dup = all.find((o) => o.reserve && o.reserve.chapter === req.chapter && o.reserve.step === req.step && o.reserve.inputHash === req.inputHash && (o.state === "submitted" || o.state === "settled"));
  if (dup) b.push(`requête identique déjà ${dup.state === "submitted" ? `soumise (batch ${dup.batchId}, à récupérer avec --collect)` : "traitée"} : ${dup.id}`);
  const spent = spentUsd(entries), limit = effectiveLimitUsd(r.limitUsd);
  if (spent + req.maxUsd > limit) b.push(`plafond : ${spent.toFixed(3)} + ${req.maxUsd.toFixed(3)} > ${limit} USD`);
  return b;
}

/** Réconciliation d'une réservation de batch avec les batchs créés après elle (liste fournie par l'API). */
export function reconcileBatch(op: Op, candidates: { id: string; created_at: string }[], linked: Set<string>): { batchId: string } | { failed: true } | { ambiguous: string[] } {
  const since = Date.parse(op.reserve!.at) - 60_000;
  const c = candidates.filter((b) => Date.parse(b.created_at) >= since && !linked.has(b.id));
  if (c.length === 0) return { failed: true };
  if (c.length === 1) return { batchId: c[0].id };
  return { ambiguous: c.map((x) => x.id) };
}

/** Cohérence du registre : chaque entrée se rattache à une réservation, aucun état après une issue finale, batchs uniques. */
export function ledgerIssues(entries: LedgerEntry[]): string[] {
  const issues: string[] = [];
  const reserved = new Set<string>(), closed = new Set<string>(), settled = new Set<string>(), outcome = new Set<string>(), batchOwner = new Map<string, string>();
  entries.forEach((e, i) => {
    const at = `ligne ${i + 1} (${e.id})`;
    if (e.type === "reserve") {
      if (reserved.has(e.id)) issues.push(`${at} : réservation en double`);
      if (!(e.maxUsd > 0 && Number.isFinite(e.maxUsd))) issues.push(`${at} : coût maximal invalide`);
      reserved.add(e.id);
      return;
    }
    if (!reserved.has(e.id) && !e.id.startsWith("run-")) issues.push(`${at} : « ${e.type} » sans réservation`);
    if (e.type === "outcome") { // annotation d'une opération soldée, une seule fois
      if (!settled.has(e.id)) issues.push(`${at} : « outcome » avant le coût réel`);
      if (outcome.has(e.id)) issues.push(`${at} : « outcome » en double`);
      outcome.add(e.id);
      return;
    }
    if (closed.has(e.id)) issues.push(`${at} : « ${e.type} » après une issue finale`);
    if (e.type === "submitted" || (e.type === "actual" && e.batchId)) {
      const b = e.batchId!;
      if (!/^msgbatch_[A-Za-z0-9]+$/.test(b)) issues.push(`${at} : identifiant de batch invalide`);
      if (batchOwner.has(b) && batchOwner.get(b) !== e.id) issues.push(`${at} : batch ${b} déjà rattaché à ${batchOwner.get(b)}`);
      batchOwner.set(b, e.id);
    }
    if (e.type === "actual" && !(e.usd >= 0 && Number.isFinite(e.usd))) issues.push(`${at} : coût réel invalide`);
    if (e.type === "actual") settled.add(e.id);
    if (e.type === "actual" || e.type === "failed") closed.add(e.id);
  });
  return issues;
}

// CLI : npx tsx pipeline/ledger.ts check <registre.jsonl> [--base <registre-initial.jsonl>]
// Code 1 si le registre est incohérent, illisible, ou s'il ne prolonge pas exactement la version de base (ajout seul).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, file] = process.argv.slice(2), base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : undefined;
  if (cmd !== "check" || !file) { console.error("usage : ledger.ts check <fichier> [--base <fichier>]"); process.exit(2); }
  let entries: LedgerEntry[];
  try { entries = readLedger(file); } catch (e) { console.error(`registre illisible : ${(e as Error).message}`); process.exit(1); }
  const issues = ledgerIssues(entries);
  if (base) {
    const before = existsSync(base) ? readFileSync(base, "utf8") : "";
    if (!(existsSync(file) ? readFileSync(file, "utf8") : "").startsWith(before)) issues.push("le registre ne prolonge pas la version de base (modification ou suppression d'entrées)");
  }
  const all = ops(entries), spent = spentUsd(entries);
  // Plafond affiché = celui de pipeline/budget.json (exécuté depuis la racine du dépôt), borné par le plafond d'essai.
  const budgetFile = "pipeline/budget.json";
  const limit = effectiveLimitUsd(existsSync(budgetFile) ? (JSON.parse(readFileSync(budgetFile, "utf8")) as { limitUsd: number }).limitUsd : TRIAL_CAP_USD);
  console.log(`registre : ${entries.length} entrée(s), ${all.length} opération(s) ; dépense comptée ${spent.toFixed(3)} USD ; reste ${(limit - spent).toFixed(3)} / ${limit} USD`);
  const byModel = spentByModel(entries);
  if (Object.keys(byModel).length) console.log(`  par modèle : ${Object.entries(byModel).map(([m, v]) => `${m} ${v.toFixed(3)} USD`).join(" · ")}`);
  const open = all.filter((o) => o.state === "reserved" || o.state === "unknown" || o.state === "submitted");
  for (const o of open) console.log(`  ouverte : ${o.id} (${o.state}${o.batchId ? `, ${o.batchId}` : ""})`);
  for (const o of all.filter((x) => x.outcome && !x.outcome.usable)) console.log(`  payée sans résultat utilisable : ${o.id} (${o.outcome!.stopReason}${o.outcome!.note ? ` — ${o.outcome!.note}` : ""})`);
  for (const i of issues) console.error(`  ✗ ${i}`);
  console.log(issues.length ? `INCOHÉRENT (${issues.length})` : "cohérent");
  process.exit(issues.length ? 1 : 0);
}

/** Suffixe d'empreinte du tour de correction sur les MAJEUR du juge (décision 19) : distingue ce tour des corrections de validation. */
export const JUDGE_FIX_SUFFIX = ":judge-fix=1";
/** Le tour unique de correction sur constats du juge est-il déjà engagé pour ce chapitre (réservé, soumis ou soldé) ? */
export const judgeFixRoundUsed = (entries: LedgerEntry[], chapter: string) =>
  ops(entries).some((o) => o.reserve?.chapter === chapter && o.reserve.step === "fix" && o.reserve.inputHash.includes(JUDGE_FIX_SUFFIX) && o.state !== "failed");

/** Suffixe d'empreinte du nouvel envoi motivé (M17, version minimale). */
export const RETRY_SUFFIX = ":retry=1";
/**
 * Nouvel envoi motivé d'une étape payée sans résultat utilisable (M17 minimal) : au plus UNE fois, seulement si
 * l'opération d'origine est soldée avec `outcome.usable: false`, motif obligatoire. L'empreinte reçoit le suffixe
 * RETRY_SUFFIX (l'anti-doublon reste actif) ; le plafond s'applique comme à tout envoi (spendBlockers).
 */
export function retryPlan(entries: LedgerEntry[], chapter: string, step: string, inputHash: string, reason: string | undefined): { hash: string; retryOf: string } | { error: string } {
  if (!reason?.trim()) return { error: "motif du nouvel envoi obligatoire (--retry \"motif\")" };
  const all = ops(entries);
  const same = (o: Op, h: string) => o.reserve?.chapter === chapter && o.reserve.step === step && o.reserve.inputHash === h;
  const orig = all.find((o) => same(o, inputHash) && o.state === "settled");
  if (!orig) return { error: `aucune opération soldée ${chapter}/${step} (empreinte ${inputHash}) à renvoyer` };
  if (orig.outcome?.usable !== false) return { error: `${orig.id} a un résultat utilisable : aucun nouvel envoi` };
  if (all.some((o) => same(o, inputHash + RETRY_SUFFIX))) return { error: `nouvel envoi de ${orig.id} déjà fait (au plus un)` };
  return { hash: inputHash + RETRY_SUFFIX, retryOf: orig.id };
}
