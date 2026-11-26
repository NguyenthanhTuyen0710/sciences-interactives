// Relevé du SOMMAIRE d'un site de référence (classes, matières, chapitres, rubriques brevet/bac) — fonctions pures,
// réseau injecté (testé dans tests/toc.test.ts). Commande : `npx tsx pipeline/sources/run.ts toc` (voir run.ts).
//
// Ce qui est conservé : chemin, titre de page, titres h1-h3 (≤ TOC_MAX_TEXT caractères), liens du périmètre et leur
// libellé court, classement (niveau, matière, examen). Aucun paragraphe, image, PDF ni exercice n'est demandé ou gardé.
// La source doit être `enabled` et `g0.status = "approved"` dans research/sources/registry.json (décision humaine) :
// sinon aucune requête n'est envoyée. Le relevé sert à préparer une collecte ultérieure ; il n'autorise pas celle-ci.
import { groupFor, parseRobots, robotsAllows, squash, UI_FORBIDDEN, type SourceEntry } from "./lib";

export const TOC_MAX_TEXT = 120;
export const TOC_MIN_DELAY_S = 2;
export const TOC_DEFAULT_MAX_PAGES = 400;
export const TOC_HARD_MAX_PAGES = 1500;
export const TOC_DEFAULT_MAX_DEPTH = 5;
const TOC_MAX_BYTES = 3_000_000;

// ───────── Classement par chemin et libellé ─────────
export type Grade = "6e" | "5e" | "4e" | "3e" | "2nde" | "1re" | "Tle";
export type Subject = "mathematiques" | "physique-chimie" | "autre";
export type Exam = "brevet" | "bac";
export interface Classification { grade?: Grade; subject?: Subject; exam?: Exam }

export const TARGET_GRADES: Grade[] = ["3e", "2nde", "1re", "Tle"];
const GRADE_RULES: [Grade, RegExp][] = [
  ["6e", /\b(6e|6eme|6ème|sixieme|sixième)\b/],
  ["5e", /\b(5e|5eme|5ème|cinquieme|cinquième)\b/],
  ["4e", /\b(4e|4eme|4ème|quatrieme|quatrième)\b/],
  ["3e", /\b(3e|3eme|3ème|troisieme|troisième)\b/],
  ["2nde", /\b(2nde|2de|seconde)\b/],
  ["1re", /\b(1re|1ere|1ère|premiere|première)\b/],
  ["Tle", /\b(tle|terminale|tale)\b/],
];
const SUBJECT_RULES: [Subject, RegExp][] = [
  ["physique-chimie", /\b(physique|chimie|physique chimie|pc)\b/],
  ["mathematiques", /\b(maths?|mathematiques?|mathématiques?)\b/],
  ["autre", /\b(svt|francais|français|histoire|geographie|géographie|anglais|espagnol|allemand|philo|philosophie|ses|nsi|snt|technologie|emc)\b/],
];
const EXAM_RULES: [Exam, RegExp][] = [
  ["brevet", /\b(brevet|dnb)\b/],
  ["bac", /\b(bac|baccalaureat|baccalauréat|grand oral)\b/],
];

/** Mots d'un chemin décodé et d'un libellé : séparateurs (/-_.+) → espaces, minuscules. */
const words = (s: string) => {
  let t = s;
  try { t = decodeURIComponent(s); } catch { /* chemin mal encodé : tel quel */ }
  return ` ${t.toLowerCase().replace(/[/\-_.+?=&#]+/g, " ")} `;
};

/** Règle dont la correspondance apparaît le plus tôt (ex. « /terminale/premiere-loi » → Tle, pas 1re). */
function earliest<T>(rules: [T, RegExp][], src: string): T | undefined {
  let best: { v: T; at: number } | undefined;
  for (const [v, re] of rules) { const at = src.search(re); if (at >= 0 && (!best || at < best.at)) best = { v, at }; }
  return best?.v;
}

/** Classement d'un lien ou d'une page : niveau, matière et examen reconnus dans le chemin, sinon dans le libellé. */
export function classify(path: string, label = ""): Classification {
  const c: Classification = {};
  for (const src of [words(path), words(label)]) {
    c.grade ??= earliest(GRADE_RULES, src);
    c.subject ??= earliest(SUBJECT_RULES, src);
    c.exam ??= earliest(EXAM_RULES, src);
  }
  return Object.fromEntries(Object.entries(c).filter(([, v]) => v)) as Classification;
}

/** Ce qu'un lien précise l'emporte ; le reste est hérité de la page qui le contient. */
export const merge = (inherited: Classification, own: Classification): Classification => ({ ...inherited, ...Object.fromEntries(Object.entries(own).filter(([, v]) => v)) });
const isEmpty = (c: Classification) => !c.grade && !c.subject && !c.exam;

/** Périmètre demandé : 3e → Tle ou brevet/bac, en mathématiques ou physique-chimie (matière inconnue acceptée). */
export function inScope(c: Classification): boolean {
  if (c.subject === "autre") return false;
  if (c.grade && !TARGET_GRADES.includes(c.grade)) return false;
  return !!c.grade || !!c.exam;
}

// ───────── Extraction d'une page HTML (titres et liens uniquement) ─────────
export type Zone = "header" | "nav" | "footer" | "main";
export interface RawLink { href: string; text: string; zone: Zone }
export interface PageOutline { title: string | null; headings: { level: 1 | 2 | 3; text: string }[]; links: RawLink[] }

const cut = (s: string) => (s.length > TOC_MAX_TEXT ? s.slice(0, TOC_MAX_TEXT - 1) + "…" : s);

export function extractOutline(html: string): PageOutline {
  const src = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1\s*>/gi, "");
  const titleMatch = src.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const out: PageOutline = { title: titleMatch ? cut(squash(titleMatch[1])) || null : null, headings: [], links: [] };
  const zones: Zone[] = [];
  let heading: { level: 1 | 2 | 3; text: string } | null = null;
  let link: { href: string; text: string } | null = null;
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)\/?>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) { if (heading) heading.text += m[4]; if (link) link.text += m[4]; continue; }
    const closing = m[1] === "/", tag = m[2].toLowerCase();
    if (tag === "header" || tag === "nav" || tag === "footer") { if (closing) zones.pop(); else zones.push(tag); continue; }
    if (/^h[1-3]$/.test(tag)) {
      if (!closing) heading = { level: Number(tag[1]) as 1 | 2 | 3, text: "" };
      else if (heading) { const t = cut(squash(heading.text)); if (t) out.headings.push({ level: heading.level, text: t }); heading = null; }
      continue;
    }
    if (tag === "a") {
      if (!closing) { const h = m[3].match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i); link = h ? { href: (h[2] ?? h[3] ?? h[4]).replace(/&amp;/g, "&"), text: "" } : null; }
      else if (link) { out.links.push({ href: link.href, text: cut(squash(link.text)), zone: zones.at(-1) ?? "main" }); link = null; }
    }
  }
  return out;
}

// ───────── Exploration bornée ─────────
const ASSET = /\.(pdf|png|jpe?g|gif|webp|svg|avif|ico|mp4|webm|mp3|zip|docx?|xlsx?|pptx?|css|js|json|xml|txt)$/i;

/** Chemin normalisé (sans fragment, sans barre finale) d'un lien du même hôte ; null sinon. */
export function normalizeLink(href: string, base: string, host: string): string | null {
  let u: URL;
  try { u = new URL(href, base); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.host !== host) return null;
  const path = (u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : u.pathname) + u.search;
  if (ASSET.test(u.pathname) || UI_FORBIDDEN.test(path)) return null;
  return path;
}

export interface TocLink { path: string; text: string; zone: Zone; classification: Classification }
export interface TocPage {
  path: string; depth: number; parent: string | null; httpStatus: number; note?: string;
  classification: Classification; title: string | null; headings: { level: 1 | 2 | 3; text: string }[]; links: TocLink[];
}
export interface TocOptions { start: string[]; maxPages: number; maxDepth: number; userAgent: string }
export interface TocHttp { status: number; headers: { get(name: string): string | null }; text(): Promise<string> }
export interface TocDeps { fetch: (url: string, init: { headers: Record<string, string>; redirect: "manual" }) => Promise<TocHttp>; sleep: (ms: number) => Promise<void> }
export interface TocReport {
  sourceId: string; host: string; userAgent: string; generatedAt: string;
  limits: { maxPages: number; maxDepth: number; delaySeconds: number | null; maxText: number };
  robots: { httpStatus: number | null; note: string }; requests: number; stopped: string | null;
  skipped: { path: string; reason: string }[]; pages: TocPage[];
}

/** Contrôles avant toute requête : source HTTP du registre, activée, G0 approuvé, options valides. */
export function gateToc(source: SourceEntry | undefined, opts: TocOptions): string[] {
  const r: string[] = [];
  if (!source) return ["source absente du registre"];
  if (source.kind !== "http" || !source.host) r.push(`source ${source.id} : pas une source HTTP`);
  if (!source.enabled) r.push(`source ${source.id} désactivée (enabled = false)`);
  if (source.g0.status !== "approved") r.push(`source ${source.id} : G0 = ${source.g0.status} (décision humaine requise dans research/sources/registry.json)`);
  if (!opts.start.length || opts.start.some((p) => !p.startsWith("/"))) r.push("pages de départ : chemins commençant par « / » attendus");
  if (!(opts.maxPages >= 1 && opts.maxPages <= TOC_HARD_MAX_PAGES)) r.push(`maxPages hors de 1…${TOC_HARD_MAX_PAGES}`);
  if (!(opts.maxDepth >= 0 && opts.maxDepth <= 10)) r.push("maxDepth hors de 0…10");
  return r;
}

/**
 * Parcours en largeur depuis les pages de départ, un hôte, robots.txt respecté, délai ≥ 2 s (ou Crawl-delay / délai du registre).
 * Un lien est suivi s'il est classé dans le périmètre (inScope), ou s'il n'est pas classé, se trouve dans le corps (« main »)
 * d'une page du périmètre et descend de son chemin (ex. /3e/maths → /3e/maths/fractions). Redirections : même hôte seulement.
 */
export async function collectToc(source: SourceEntry | undefined, opts: TocOptions, deps: TocDeps): Promise<TocReport> {
  const host = source?.host ?? "";
  const report: TocReport = {
    sourceId: source?.id ?? "", host, userAgent: opts.userAgent, generatedAt: new Date().toISOString(),
    limits: { maxPages: opts.maxPages, maxDepth: opts.maxDepth, delaySeconds: null, maxText: TOC_MAX_TEXT },
    robots: { httpStatus: null, note: "non consulté" }, requests: 0, stopped: null, skipped: [], pages: [],
  };
  const gate = gateToc(source, opts);
  if (gate.length) { report.stopped = gate.join(" ; "); return report; }
  const origin = `https://${host}`;
  const get = (path: string) => { report.requests++; return deps.fetch(origin + path, { headers: { "User-Agent": opts.userAgent }, redirect: "manual" }); };

  let robotsTxt = "";
  try {
    const r = await get("/robots.txt");
    report.robots.httpStatus = r.status;
    if (r.status === 200) robotsTxt = await r.text();
    else if (r.status < 400 || r.status >= 500) { report.stopped = `robots.txt indisponible (HTTP ${r.status})`; return report; }
  } catch (e) { report.stopped = `robots.txt indisponible (${(e as Error).message})`; return report; }
  const group = groupFor(parseRobots(robotsTxt), opts.userAgent);
  const delay = Math.max(TOC_MIN_DELAY_S, group.crawlDelay ?? 0, source!.crawlDelaySeconds ?? 0);
  report.limits.delaySeconds = delay;
  report.robots.note = robotsTxt ? "lu" : "absent (aucune restriction, RFC 9309)";

  const queue: { path: string; depth: number; parent: string | null; inherited: Classification }[] = [];
  const seen = new Set<string>();
  const push = (path: string, depth: number, parent: string | null, inherited: Classification) => { if (!seen.has(path)) { seen.add(path); queue.push({ path, depth, parent, inherited }); } };
  for (const p of opts.start) push(p, 0, null, {});

  while (queue.length) {
    if (report.pages.length >= opts.maxPages) { report.stopped = `limite de ${opts.maxPages} pages atteinte (${queue.length} en attente)`; break; }
    const item = queue.shift()!;
    const rule = robotsAllows(group, item.path);
    if (!rule.allowed) { report.skipped.push({ path: item.path, reason: `robots.txt (${rule.rule})` }); continue; }
    const cls = merge(item.inherited, classify(item.path));
    const page: TocPage = { path: item.path, depth: item.depth, parent: item.parent, httpStatus: 0, classification: cls, title: null, headings: [], links: [] };
    report.pages.push(page);
    await deps.sleep(delay * 1000);
    let html: string;
    try {
      const r = await get(item.path);
      page.httpStatus = r.status;
      if (r.status >= 300 && r.status < 400) {
        const target = normalizeLink(r.headers.get("location") ?? "", origin + item.path, host);
        page.note = target ? `redirection → ${target}` : "redirection hors hôte non suivie";
        if (target) push(target, item.depth, item.path, cls);
        continue;
      }
      const type = r.headers.get("content-type") ?? "";
      if (r.status !== 200 || !type.includes("text/html")) { page.note = r.status === 200 ? "contenu non HTML ignoré" : "page non lue"; continue; }
      html = await r.text();
      if (html.length > TOC_MAX_BYTES) { page.note = "page trop volumineuse, ignorée"; continue; }
    } catch (e) { page.note = `échec réseau (${(e as Error).name})`; continue; }

    const outline = extractOutline(html);
    page.title = outline.title;
    page.headings = outline.headings;
    if (isEmpty(classify(item.path))) Object.assign(page.classification, merge(cls, classify("", outline.headings.find((h) => h.level === 1)?.text ?? "")));
    const pageIn = inScope(page.classification);
    const kept = new Set<string>();
    for (const l of outline.links) {
      const path = normalizeLink(l.href, origin + item.path, host);
      if (!path || path === item.path || kept.has(path)) continue;
      const own = classify(path, l.text);
      const linkCls = merge(page.classification, own);
      const descendant = item.path !== "/" && path.startsWith(item.path.replace(/\?.*$/, "") + "/");
      const follow = isEmpty(own) ? pageIn && l.zone === "main" && descendant : inScope(linkCls);
      if (!follow) continue;
      kept.add(path);
      page.links.push({ path, text: l.text, zone: l.zone, classification: linkCls });
      if (item.depth < opts.maxDepth) push(path, item.depth + 1, item.path, linkCls);
    }
  }
  assertTocText(report);
  return report;
}

/** Garde-fou : aucun texte relevé (titres, libellés) ne dépasse TOC_MAX_TEXT caractères. */
export function assertTocText(report: TocReport): void {
  for (const p of report.pages) for (const t of [p.title ?? "", ...p.headings.map((h) => h.text), ...p.links.map((l) => l.text)]) {
    if (t.length > TOC_MAX_TEXT) throw new Error(`texte relevé trop long (${t.length} caractères) sur ${p.path}`);
  }
}

// ───────── Index exploitable par la branche principale ─────────
export interface TocEntry { path: string; title: string | null; h1: string | null; sections: string[]; parent: string | null }
/** { "3e": { mathematiques: [...], "physique-chimie": [...], "non-classé": [...] }, …, brevet: {...}, bac: {...} } */
export type TocIndex = Record<string, Record<string, TocEntry[]>>;

export function buildIndex(report: TocReport): TocIndex {
  const idx: TocIndex = {};
  const order = [...TARGET_GRADES, "brevet", "bac"];
  for (const p of report.pages) {
    if (p.httpStatus !== 200 || !inScope(p.classification)) continue;
    const top = p.classification.exam ?? p.classification.grade!;
    const sub = p.classification.subject ?? "non-classé";
    ((idx[top] ??= {})[sub] ??= []).push({
      path: p.path, title: p.title, parent: p.parent,
      h1: p.headings.find((h) => h.level === 1)?.text ?? null,
      sections: p.headings.filter((h) => h.level === 2).map((h) => h.text),
    });
  }
  return Object.fromEntries(order.filter((k) => idx[k]).map((k) => [k, idx[k]]));
}

/** Résumé lisible (Markdown) : un titre par niveau / examen, une sous-section par matière, une ligne par page. */
export function renderMarkdown(report: TocReport, idx: TocIndex): string {
  const lines = [
    `# Sommaire relevé — ${report.host}`, "",
    `Relevé du ${report.generatedAt.slice(0, 10)} : ${report.pages.length} page(s), ${report.requests} requête(s), délai ${report.limits.delaySeconds ?? "—"} s.` +
      (report.stopped ? ` Arrêt : ${report.stopped}.` : ""),
    "Titres et chemins uniquement (aucun contenu). Classement automatique par chemin et libellé : à relire avant usage.", "",
  ];
  for (const [top, subs] of Object.entries(idx)) {
    lines.push(`## ${top}`, "");
    for (const [sub, entries] of Object.entries(subs)) {
      lines.push(`### ${sub} (${entries.length})`, "");
      for (const e of entries) {
        lines.push(`- **${e.h1 ?? e.title ?? e.path}** — \`${e.path}\``);
        for (const s of e.sections) lines.push(`  - ${s}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}
