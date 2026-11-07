// Collecteur de sources officielles — liste fermée (research/sources/seeds.json), aucune exploration.
//
//   npx tsx pipeline/sources/run.ts [check] [--offline]   défaut : contrôles (registre, G0, G1, préfixes, robots.txt) ; ne télécharge aucun document
//   npx tsx pipeline/sources/run.ts fetch [--only <seed>]  télécharge les seeds autorisés (G0 + G1 approuvés, robots.txt), ≤ 20 par exécution
//   npx tsx pipeline/sources/run.ts verify                 recalcule la vérification à partir du cache local (sans réseau)
//   npx tsx pipeline/sources/run.ts storable               liste les documents dont la conservation (data-store) est approuvée
//   npx tsx pipeline/sources/run.ts apply <proposition.json>  applique à l'inventaire les changements APPROUVÉS et prouvés par citation
//
// Dans Git : research/sources/records/<seed>.json (URL, date d'accès, SHA256, statut). Documents et textes : .sources-cache/
// (hors Git ; persistance assurée par le workflow collect-sources). Un document illisible ou refusé est enregistré comme tel,
// sans aucun contenu déduit.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMetadata, gateSeed, groupFor, parseRobots, quoteFound, robotsAllows, sha256, verify, type Registry, type Seed, type SourceRecord } from "./lib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const P = (f: string) => join(ROOT, f);
const readJson = <T>(f: string): T => JSON.parse(readFileSync(P(f), "utf8"));
const writeFile = (f: string, s: string | Buffer) => { mkdirSync(dirname(P(f)), { recursive: true }); writeFileSync(P(f), s); };
const fail = (msg: string): never => { console.error(`ARRÊT : ${msg}`); process.exit(2); };

const CACHE = ".sources-cache";
const RECORDS = "research/sources/records";
const MAX_DOCS_PER_RUN = 20;
const ROBOTS_TTL_MS = 24 * 3600 * 1000;

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "check";
const opt = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const registry = readJson<Registry>("research/sources/registry.json");
const seeds = readJson<{ seeds: Seed[] }>("research/sources/seeds.json").seeds;
const sourceOf = (s: Seed) => registry.sources.find((x) => x.id === s.sourceId);
const recordFile = (id: string) => `${RECORDS}/${id}.json`;
const loadRecord = (id: string): SourceRecord | null => (existsSync(P(recordFile(id))) ? readJson(recordFile(id)) : null);
const textFile = (sha: string) => `${CACHE}/text/${sha}.txt`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ───────── Réseau (uniquement robots.txt et seeds autorisés) ─────────
const lastHit = new Map<string, number>();
async function politeFetch(url: string, delaySec: number, headers: Record<string, string> = {}): Promise<Response> {
  const host = new URL(url).host;
  const wait = (lastHit.get(host) ?? 0) + delaySec * 1000 - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
  return fetch(url, { headers: { "User-Agent": registry.userAgent, ...headers }, redirect: "manual", signal: AbortSignal.timeout(60_000) });
}

async function robotsFor(host: string, delaySec: number, offline: boolean): Promise<{ txt: string | null; note: string }> {
  const f = `${CACHE}/robots/${host}.txt`;
  if (existsSync(P(f)) && (offline || Date.now() - statSync(P(f)).mtimeMs < ROBOTS_TTL_MS)) return { txt: readFileSync(P(f), "utf8"), note: "cache" };
  if (offline) return { txt: null, note: "hors ligne, pas de copie locale" };
  const r = await politeFetch(`https://${host}/robots.txt`, delaySec);
  if (r.status === 200) { const t = await r.text(); writeFile(f, t); return { txt: t, note: "téléchargé" }; }
  if (r.status >= 400 && r.status < 500) { writeFile(f, ""); return { txt: "", note: `HTTP ${r.status} (aucune restriction selon RFC 9309)` }; }
  return { txt: null, note: `HTTP ${r.status} : robots.txt indisponible` };
}

async function decide(seed: Seed, offline: boolean): Promise<{ ok: boolean; reasons: string[]; delay: number }> {
  const source = sourceOf(seed);
  const reasons = gateSeed(seed, source);
  let delay = source?.crawlDelaySeconds ?? 10;
  if (source?.kind === "http" && source.host) {
    const { txt, note } = await robotsFor(source.host, delay, offline);
    if (txt === null) reasons.push(`robots.txt non vérifié (${note})`);
    else {
      const g = groupFor(parseRobots(txt), registry.userAgent);
      const u = new URL(seed.url);
      const r = robotsAllows(g, u.pathname + u.search);
      if (!r.allowed) reasons.push(`robots.txt interdit ce chemin (${r.rule})`);
      delay = Math.max(delay, g.crawlDelay ?? 0);
    }
  }
  return { ok: reasons.length === 0, reasons, delay };
}

function toText(buf: Buffer, contentType: string, sha: string): { text: string | null; tool: string } {
  if (contentType.includes("pdf")) {
    const raw = `${CACHE}/docs/${sha}.pdf`;
    const r = spawnSync("pdftotext", ["-enc", "UTF-8", P(raw), "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (r.error || r.status !== 0) return { text: null, tool: "pdftotext indisponible ou en échec" };
    return { text: r.stdout, tool: "pdftotext" };
  }
  if (contentType.includes("html")) {
    const t = buf.toString("utf8").replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)));
    return { text: t, tool: "html-strip" };
  }
  return { text: null, tool: `type ${contentType} non pris en charge` };
}

async function fetchSeed(seed: Seed, delay: number): Promise<SourceRecord> {
  const prev = loadRecord(seed.id);
  const host = new URL(seed.url).host;
  const cond: Record<string, string> = {};
  const prevRaw = prev?.sha256 ? `${CACHE}/docs/${prev.sha256}${prev.contentType.includes("pdf") ? ".pdf" : ".html"}` : null;
  if (prev && prevRaw && existsSync(P(prevRaw))) { if (prev.etag) cond["If-None-Match"] = prev.etag; if (prev.lastModified) cond["If-Modified-Since"] = prev.lastModified; }
  let url = seed.url, res: Response | null = null;
  for (let hop = 0; hop < 4; hop++) {
    res = await politeFetch(url, delay, cond);
    const loc = res.headers.get("location");
    if (res.status < 300 || res.status >= 400 || !loc) break;
    const next = new URL(loc, url);
    if (next.host !== host || next.protocol !== "https:") { res = null; break; }
    url = next.toString();
  }
  const accessedAt = new Date().toISOString();
  const base = { seedId: seed.id, url: seed.url, finalUrl: url, accessedAt };
  if (!res) return { ...base, httpStatus: 0, contentType: "", bytes: 0, sha256: null, etag: null, lastModified: null, readable: false, text: null, extracted: null, verification: { status: "inaccessible", checkedAt: accessedAt, checks: [{ name: "redirection", ok: false, detail: "redirection hors de l'hôte autorisé ou en boucle" }] } };
  if (res.status === 304 && prev) return { ...prev, accessedAt, finalUrl: url };
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status !== 200) {
    return { ...base, httpStatus: res.status, contentType, bytes: 0, sha256: null, etag: null, lastModified: null, readable: false, text: null, extracted: null, verification: { ...verify(seed, null, res.status, null), checkedAt: accessedAt } };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const sha = sha256(buf);
  writeFile(`${CACHE}/docs/${sha}${contentType.includes("pdf") ? ".pdf" : ".html"}`, buf);
  const { text, tool } = toText(buf, contentType, sha);
  if (text) writeFile(textFile(sha), text);
  const extracted = text ? extractMetadata(text) : null;
  return {
    ...base, httpStatus: 200, contentType, bytes: buf.length, sha256: sha, etag: res.headers.get("etag"), lastModified: res.headers.get("last-modified"),
    readable: !!text, text: text ? { tool, chars: text.length, sha256: sha256(text) } : null, extracted,
    verification: { ...verify(seed, text, 200, extracted), checkedAt: accessedAt },
  };
}

/** Texte d'un document enregistré : cache texte, sinon ré-extraction depuis le document brut du cache ; null si absent. */
function textOf(rec: SourceRecord): string | null {
  if (!rec.sha256) return null;
  if (existsSync(P(textFile(rec.sha256)))) return readFileSync(P(textFile(rec.sha256)), "utf8");
  const raw = `${CACHE}/docs/${rec.sha256}${rec.contentType.includes("pdf") ? ".pdf" : ".html"}`;
  if (!existsSync(P(raw))) return null;
  const { text } = toText(readFileSync(P(raw)), rec.contentType, rec.sha256);
  if (text) writeFile(textFile(rec.sha256), text);
  return text;
}

// ───────── Mise à jour de l'inventaire : uniquement des changements approuvés et prouvés ─────────
interface Evidence { seedId: string; sha256: string; quote: string }
type Change =
  | { op: "add_objective"; chapterId: string; objective: { id: string; text: string; officialRef: string }; evidence: Evidence; approvedBy?: string; approvedAt?: string }
  | { op: "attach_evidence"; objectiveId: string; evidence: Evidence; approvedBy?: string; approvedAt?: string };

function apply(file: string) {
  const INV = "research/curriculum/mathematiques/curriculum-math.json";
  const inv = readJson<{ grades: { domains: { chapters: { id: string; objectives: Record<string, unknown>[] }[] }[] }[] }>(INV);
  const chapters = inv.grades.flatMap((g) => g.domains.flatMap((d) => d.chapters));
  const objectives = chapters.flatMap((c) => c.objectives);
  const { changes } = JSON.parse(readFileSync(file, "utf8")) as { changes: Change[] };
  const errors: string[] = [];
  let applied = 0;
  for (const [i, ch] of changes.entries()) {
    const where = `changement ${i + 1} (${ch.op})`;
    if (!ch.approvedBy || !/^\d{4}-\d{2}-\d{2}/.test(ch.approvedAt ?? "")) { errors.push(`${where} : non approuvé (approvedBy/approvedAt)`); continue; }
    const rec = loadRecord(ch.evidence.seedId);
    if (!rec || rec.sha256 !== ch.evidence.sha256) { errors.push(`${where} : aucun enregistrement ${ch.evidence.seedId} avec ce SHA256`); continue; }
    if (rec.verification.status !== "verified") { errors.push(`${where} : document ${ch.evidence.seedId} non vérifié (${rec.verification.status})`); continue; }
    const text = textOf(rec);
    if (!text) { errors.push(`${where} : document absent du cache local (restaurer le stockage ou lancer fetch)`); continue; }
    if (!quoteFound(text, ch.evidence.quote)) { errors.push(`${where} : citation introuvable dans le document (≥ 20 caractères, mot pour mot)`); continue; }
    const evidence = { ...ch.evidence, accessedAt: rec.accessedAt, url: rec.url, approvedBy: ch.approvedBy, approvedAt: ch.approvedAt };
    if (ch.op === "add_objective") {
      const c = chapters.find((x) => x.id === ch.chapterId);
      if (!c) { errors.push(`${where} : chapitre ${ch.chapterId} absent`); continue; }
      if (objectives.some((o) => o.id === ch.objective.id)) { errors.push(`${where} : objectif ${ch.objective.id} déjà présent (aucune modification d'un objectif existant)`); continue; }
      c.objectives.push({ ...ch.objective, verified: true, evidence });
    } else {
      const o = objectives.find((x) => x.id === ch.objectiveId);
      if (!o) { errors.push(`${where} : objectif ${ch.objectiveId} absent`); continue; }
      o.evidence = evidence; // le texte et le statut existants ne sont pas modifiés
    }
    applied++;
  }
  if (errors.length) { console.error(errors.map((e) => `  ✗ ${e}`).join("\n")); fail(`${errors.length} changement(s) refusé(s) ; inventaire inchangé`); }
  writeFile(INV, JSON.stringify(inv, null, 2) + "\n");
  console.log(`${applied} changement(s) appliqué(s) à ${INV}.`);
}

// ───────── Programme ─────────
async function main() {
  if (cmd === "apply") return apply(opt("apply") ?? args[1] ?? fail("fichier de proposition manquant"));
  if (cmd === "verify") {
    for (const s of seeds) {
      const rec = loadRecord(s.id);
      if (!rec) { console.log(`${s.id} : aucun enregistrement`); continue; }
      const text = textOf(rec);
      if (rec.httpStatus === 200 && rec.readable && !text) { console.log(`${s.id} : texte absent du cache, statut conservé (${rec.verification.status})`); continue; }
      rec.verification = { ...verify(s, text, rec.httpStatus, rec.extracted), checkedAt: new Date().toISOString() };
      writeFile(recordFile(s.id), JSON.stringify(rec, null, 2) + "\n");
      console.log(`${s.id} : ${rec.verification.status}`);
    }
    return;
  }
  if (cmd === "storable") { // documents dont la conservation dans data-store est approuvée (G0 + storage)
    for (const s of seeds) {
      const rec = loadRecord(s.id), src = sourceOf(s);
      if (rec?.sha256 && src?.g0.status === "approved" && src.g0.storage === "approved") console.log(`${rec.sha256}${rec.contentType.includes("pdf") ? ".pdf" : ".html"}`);
    }
    return;
  }
  if (cmd !== "check" && cmd !== "fetch") fail(`commande inconnue : ${cmd}`);
  const offline = args.includes("--offline"), only = opt("--only");
  for (const src of registry.sources.filter((x) => x.kind === "connector")) console.log(`${src.id} : connecteur ${src.g0.status}${src.optional ? " (optionnel, ignoré)" : ""}`);
  let fetched = 0;
  for (const s of seeds.filter((x) => !only || x.id === only)) {
    const d = await decide(s, offline);
    if (!d.ok) { console.log(`${s.id} : BLOQUÉ — ${d.reasons.join(" ; ")}`); continue; }
    if (cmd === "check") { console.log(`${s.id} : autorisé (délai ${d.delay} s) — non téléchargé en mode check`); continue; }
    if (fetched >= MAX_DOCS_PER_RUN) { console.log(`${s.id} : reporté (limite de ${MAX_DOCS_PER_RUN} documents par exécution)`); continue; }
    const rec = await fetchSeed(s, d.delay);
    fetched++;
    writeFile(recordFile(s.id), JSON.stringify(rec, null, 2) + "\n");
    console.log(`${s.id} : HTTP ${rec.httpStatus}, ${rec.readable ? `lu (${rec.text?.chars} caractères)` : "NON LU"}, vérification ${rec.verification.status}${rec.sha256 ? `, sha256 ${rec.sha256.slice(0, 12)}…` : ""}`);
  }
}

main().catch((e: unknown) => { console.error(`Erreur : ${(e as Error).message}`); process.exit(1); });
