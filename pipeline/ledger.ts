// Registre des dépenses API (append-only, JSONL) partagé entre les exécutions via le stockage « data-store »
// (release GitHub en brouillon, voir .github/workflows/generate-lessons.yml). Hors Git.
//
// Chaque appel payant est RÉSERVÉ (coût maximal) et écrit sur disque AVANT l'envoi. Tant qu'une réservation n'est pas
// soldée par son coût réel, elle compte pour son coût maximal. Une issue inconnue (erreur réseau à la création) bloque
// toute nouvelle dépense jusqu'à réconciliation : aucune nouvelle tentative automatique, donc aucun doublon.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export const TRIAL_CAP_USD = 10; // plafond de la phase d'essai, non modifiable par budget.json

export type LedgerEntry =
  | { type: "reserve"; id: string; at: string; chapter: string; step: string; inputHash: string; mode: "batch" | "sync"; maxUsd: number }
  | { type: "submitted"; id: string; at: string; batchId: string }
  | { type: "actual"; id: string; at: string; usd: number; batchId?: string }
  | { type: "failed"; id: string; at: string; reason: string }
  | { type: "unknown"; id: string; at: string; error: string };

export type OpState = "reserved" | "submitted" | "settled" | "failed" | "unknown";
export interface Op { id: string; reserve: Extract<LedgerEntry, { type: "reserve" }> | null; state: OpState; batchId?: string; usd?: number }

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
    else if (e.type === "actual") { op.state = "settled"; op.usd = e.usd; op.batchId ??= e.batchId; }
    else if (e.type === "failed") op.state = "failed";
    else if (e.type === "unknown") op.state = "unknown";
    m.set(e.id, op);
  }
  return [...m.values()];
}

/** Dépense comptée : coût réel si soldé, coût maximal sinon (prudent), 0 si l'échec est établi. */
export const spentUsd = (entries: LedgerEntry[]) =>
  ops(entries).reduce((s, o) => s + (o.state === "settled" ? o.usd ?? 0 : o.state === "failed" ? 0 : o.reserve?.maxUsd ?? 0), 0);

export interface SpendRequest { chapter: string; step: string; inputHash: string; maxUsd: number }
export interface Readiness { ledgerSynced: boolean; creditVerified: boolean; limitUsd: number }

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
  const spent = spentUsd(entries), limit = Math.min(r.limitUsd, TRIAL_CAP_USD);
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
