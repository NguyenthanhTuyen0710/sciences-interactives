// Fonctions pures du collecteur de sources (testées dans tests/sources.test.ts).
import { createHash } from "node:crypto";

// ───────── Types des fichiers research/sources/*.json ─────────
export interface SourceEntry {
  id: string; name: string; kind: "http" | "connector"; host?: string; allowedPathPrefixes?: string[];
  role: "officiel" | "reference"; enabled: boolean; optional?: boolean; crawlDelaySeconds?: number;
  g0: { status: "pending" | "approved" | "rejected" | "not_configured"; [k: string]: unknown };
}
export interface Registry { userAgent: string; sources: SourceEntry[] }
export interface Seed {
  id: string; sourceId: string; url: string; g1: "proposed" | "approved" | "rejected"; inventorySourceId?: string | null;
  declared: { subject: string; cycle?: number; grades: string[]; officialRef: string; applicability: { grade: string; status: "en_vigueur" | "a_venir" | "abroge"; from?: string; until?: string }[] };
  expect: { contains: string[] }; note?: string;
}
export type VerificationStatus = "verified" | "needs_review" | "unreadable" | "inaccessible";
export interface Check { name: string; ok: boolean; detail: string }
export interface SourceRecord {
  seedId: string; url: string; finalUrl: string; accessedAt: string; httpStatus: number; contentType: string;
  bytes: number; sha256: string | null; etag: string | null; lastModified: string | null; readable: boolean;
  text: { tool: string; chars: number; sha256: string } | null;
  extracted: Extracted | null;
  verification: { status: VerificationStatus; checkedAt: string; checks: Check[] };
}

export const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

// ───────── robots.txt (RFC 9309 : groupe le plus spécifique, règle la plus longue, Allow en cas d'égalité) ─────────
export interface RobotsGroup { agents: string[]; rules: { allow: boolean; path: string }[]; crawlDelay?: number }

export function parseRobots(txt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let cur: RobotsGroup | null = null, lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase(), val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!cur) continue;
    if (key === "allow" || key === "disallow") { if (val) cur.rules.push({ allow: key === "allow", path: val }); }
    else if (key === "crawl-delay" && Number.isFinite(Number(val))) cur.crawlDelay = Number(val);
  }
  return groups;
}

/** Règles applicables à un agent : groupes qui le nomment (jeton produit), sinon groupes « * ». */
export function groupFor(groups: RobotsGroup[], userAgent: string): RobotsGroup {
  const token = userAgent.split("/")[0].trim().toLowerCase();
  const named = groups.filter((g) => g.agents.includes(token));
  const chosen = named.length ? named : groups.filter((g) => g.agents.includes("*"));
  const delays = chosen.map((g) => g.crawlDelay).filter((d): d is number => d !== undefined);
  return { agents: chosen.flatMap((g) => g.agents), rules: chosen.flatMap((g) => g.rules), crawlDelay: delays.length ? Math.max(...delays) : undefined };
}

function patternToRegex(p: string): RegExp {
  const anchored = p.endsWith("$"), body = anchored ? p.slice(0, -1) : p;
  return new RegExp("^" + body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + (anchored ? "$" : ""));
}

export function robotsAllows(group: RobotsGroup, pathAndQuery: string): { allowed: boolean; rule: string | null } {
  let best: { allow: boolean; path: string } | null = null;
  for (const r of group.rules) {
    if (!patternToRegex(r.path).test(pathAndQuery)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return { allowed: best ? best.allow : true, rule: best ? `${best.allow ? "Allow" : "Disallow"}: ${best.path}` : null };
}

// ───────── Contrôles avant téléchargement (aucun accès réseau ici) ─────────
export function gateSeed(seed: Seed, source: SourceEntry | undefined): string[] {
  const reasons: string[] = [];
  if (!source) return [`source ${seed.sourceId} absente du registre`];
  if (source.kind === "connector") return [`source ${source.id} : connecteur ${source.g0.status === "not_configured" ? "non configuré (SOURCE_INACCESSIBLE, optionnel)" : "non pris en charge par le collecteur HTTP"}`];
  if (!source.enabled) reasons.push(`source ${source.id} désactivée`);
  if (source.g0.status !== "approved") reasons.push(`G0 non approuvé pour ${source.id} (${source.g0.status})`);
  if (seed.g1 !== "approved") reasons.push(`G1 non approuvé pour ce document (${seed.g1})`);
  let u: URL | null = null;
  try { u = new URL(seed.url); } catch { reasons.push("URL invalide"); }
  if (u && u.protocol !== "https:") reasons.push("HTTPS obligatoire");
  if (u && u.host !== source.host) reasons.push(`hôte ${u.host} ≠ ${source.host}`);
  if (u && !(source.allowedPathPrefixes ?? []).some((p) => u!.pathname.startsWith(p))) reasons.push(`chemin ${u.pathname} hors des préfixes autorisés`);
  return reasons;
}

// ───────── Extraction de métadonnées (indices textuels, jamais des conclusions) ─────────
export const normalize = (s: string) => s.normalize("NFKC").replace(/[’ʼ]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

export interface Extracted { boRefs: string[]; cycles: number[]; applicabilitySnippets: string[] }

export function extractMetadata(text: string): Extracted {
  const t = text.normalize("NFKC").replace(/\s+/g, " ");
  const uniq = <T>(a: T[]) => [...new Set(a)];
  const boRefs = uniq([...t.matchAll(/\b(?:B\.?O\.?(?:E\.?N\.?)?|Bulletin officiel)\s*(?:spécial\s*)?n\s*[°o]\s*(\d+)\s+du\s+(\d{1,2}(?:er)?\s+\p{L}+\s+\d{4})/giu)].map((m) => `BO n° ${m[1]} du ${m[2].toLowerCase()}`));
  const cycles = uniq([...t.matchAll(/\bcycle\s+([1-4])\b/gi)].map((m) => Number(m[1]))).sort();
  const applicabilitySnippets = uniq([...t.matchAll(/.{0,60}\b(?:rentrée(?: scolaire)?\s+\d{4}|entre(?:nt)? en vigueur|applicable[s]? (?:à compter|dès|à partir))\b.{0,60}/giu)].map((m) => m[0].trim())).slice(0, 5);
  return { boRefs, cycles, applicabilitySnippets };
}

/** Compare un document lu à la déclaration du seed. « verified » = identité confirmée, pas validité juridique. */
export function verify(seed: Seed, text: string | null, httpStatus: number, extracted: Extracted | null): { status: VerificationStatus; checks: Check[] } {
  if (httpStatus !== 200) return { status: "inaccessible", checks: [{ name: "http", ok: false, detail: `HTTP ${httpStatus}` }] };
  if (!text || normalize(text).length < 200) return { status: "unreadable", checks: [{ name: "texte", ok: false, detail: "aucun texte exploitable (document non lu)" }] };
  const n = normalize(text);
  const checks: Check[] = seed.expect.contains.map((c) => ({ name: `contient « ${c} »`, ok: n.includes(normalize(c)), detail: "" }));
  if (seed.declared.cycle !== undefined && extracted) {
    const ok = extracted.cycles.includes(seed.declared.cycle);
    checks.push({ name: `cycle ${seed.declared.cycle}`, ok, detail: `cycles trouvés : ${extracted.cycles.join(", ") || "aucun"}` });
  }
  return { status: checks.every((c) => c.ok) ? "verified" : "needs_review", checks };
}

/** Une citation est retrouvée mot pour mot (à la normalisation des espaces près) dans le texte. */
export const quoteFound = (text: string, quote: string) => normalize(quote).length >= 20 && normalize(text).includes(normalize(quote));
