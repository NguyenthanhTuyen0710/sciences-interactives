import { describe, expect, it } from "vitest";
import type { SourceEntry } from "../pipeline/sources/lib";
import { buildIndex, classify, collectToc, extractOutline, inScope, normalizeLink, renderMarkdown, TOC_MAX_TEXT, type TocDeps } from "../pipeline/sources/toc";
import registry from "../research/sources/registry.json";

const HOST = "www.exemple-ref.fr";
const SRC: SourceEntry = { id: "ref", name: "Réf", kind: "http", host: HOST, role: "reference", enabled: true, crawlDelaySeconds: 2, g0: { status: "approved" } };
const OPTS = { start: ["/"], maxPages: 50, maxDepth: 5, userAgent: "TestBot/0.1" };

const page = (h1: string, links: [string, string][], extra = "") =>
  `<html><head><title>${h1} | Réf</title></head><body><header><nav>${links.filter(([h]) => h.startsWith("NAV:")).map(([h, t]) => `<a href="${h.slice(4)}">${t}</a>`).join("")}</nav></header>
   <main><h1>${h1}</h1><p>Un long paragraphe de cours qui ne doit jamais être conservé.</p>${extra}
   ${links.filter(([h]) => !h.startsWith("NAV:")).map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</main>
   <footer><a href="/mentions-legales">Mentions légales</a></footer></body></html>`;

const SITE: Record<string, string> = {
  "/": page("Accueil", [["NAV:/troisieme", "3e"], ["NAV:/seconde", "Seconde"], ["NAV:/cinquieme", "5e"], ["NAV:/brevet", "Brevet"], ["NAV:/svt-terminale", "SVT Tle"], ["/boutique", "Boutique"], ["/a-propos", "À propos"]]),
  "/troisieme": page("Troisième", [["/troisieme/maths", "Mathématiques"], ["/troisieme/physique-chimie", "Physique-chimie"], ["/troisieme/francais", "Français"]]),
  "/troisieme/maths": page("Maths 3e", [["/troisieme/maths/fractions", "Fractions"], ["/troisieme/maths/pythagore", "Théorème de Pythagore"], ["/fiches-pdf/x", "PDF"], ["/img/a.png", "image"]], "<h2>Nombres et calculs</h2><h2>Géométrie</h2>"),
  "/troisieme/maths/fractions": page("Calculs avec des fractions", [], "<h2>Cours</h2><h2>Exercices</h2><h3>Niveau 1</h3>"),
  "/troisieme/maths/pythagore": page("Théorème de Pythagore", [["/troisieme/maths", "retour"]], `<h2>${"x".repeat(300)}</h2>`),
  "/troisieme/physique-chimie": page("PC 3e", []),
  "/seconde": page("Seconde", [["/seconde/maths", "Maths"]]),
  "/seconde/maths": page("Maths 2nde", []),
  "/brevet": page("Brevet", [["/brevet/maths-2025", "Sujet de maths 2025"], ["/annales", "Annales"]]),
  "/brevet/maths-2025": page("Brevet maths 2025", []),
  "/annales": page("Annales", []),
};

const fake = (robots = "User-agent: *\nDisallow: /seconde/maths\n", site = SITE) => {
  const calls: string[] = [], sleeps: number[] = [];
  const deps: TocDeps = {
    fetch: async (url, init) => {
      calls.push(url);
      expect(init.redirect).toBe("manual");
      const path = new URL(url).pathname;
      if (path === "/robots.txt") return { status: 200, headers: { get: () => "text/plain" }, text: async () => robots };
      const html = site[path];
      return { status: html ? 200 : 404, headers: { get: (n: string) => (n === "content-type" ? "text/html; charset=utf-8" : null) }, text: async () => html ?? "" };
    },
    sleep: async (ms) => { sleeps.push(ms); },
  };
  return { deps, calls, sleeps };
};

describe("classement", () => {
  it("reconnaît niveau, matière et examen dans le chemin puis le libellé", () => {
    expect(classify("/troisieme/maths/fractions")).toEqual({ grade: "3e", subject: "mathematiques" });
    expect(classify("/cours", "Physique-chimie Terminale")).toEqual({ grade: "Tle", subject: "physique-chimie" });
    expect(classify("/terminale/premiere-loi-de-newton").grade).toBe("Tle");
    expect(classify("/annales-bac-maths").exam).toBe("bac");
    expect(classify("/c/1%C3%A8re-spe").grade).toBe("1re");
  });
  it("périmètre : 3e → Tle ou brevet/bac, hors autres matières", () => {
    expect(inScope({ grade: "3e" })).toBe(true);
    expect(inScope({ exam: "brevet", subject: "mathematiques" })).toBe(true);
    expect(inScope({ grade: "5e", subject: "mathematiques" })).toBe(false);
    expect(inScope({ grade: "Tle", subject: "autre" })).toBe(false);
    expect(inScope({ subject: "mathematiques" })).toBe(false);
  });
  it("liens : même hôte, sans fichier, sans espace réservé ni achat", () => {
    expect(normalizeLink("/a/b/#x", `https://${HOST}/`, HOST)).toBe("/a/b");
    expect(normalizeLink("https://ailleurs.fr/a", `https://${HOST}/`, HOST)).toBeNull();
    for (const bad of ["/doc.pdf", "/boutique", "/connexion", "/fiches-pdf/a", "mailto:x@y.fr"]) expect(normalizeLink(bad, `https://${HOST}/`, HOST), bad).toBeNull();
  });
  it("extraction : titres et liens seulement, zone du lien, texte tronqué", () => {
    const o = extractOutline(SITE["/troisieme/maths/pythagore"]);
    expect(o.headings.map((h) => h.level)).toEqual([1, 2]);
    expect(o.headings[1].text.length).toBe(TOC_MAX_TEXT);
    expect(JSON.stringify(o)).not.toMatch(/paragraphe/);
    expect(extractOutline(SITE["/"]).links.find((l) => l.text === "3e")?.zone).toBe("nav");
  });
});

describe("collecte du sommaire", () => {
  it("bloquée sans G0 approuvé ou source désactivée : aucune requête", async () => {
    for (const src of [{ ...SRC, g0: { status: "pending" as const } }, { ...SRC, enabled: false }, undefined]) {
      const { deps, calls } = fake();
      const r = await collectToc(src, OPTS, deps);
      expect(r.stopped).toBeTruthy();
      expect(calls).toEqual([]);
    }
  });
  it("la source du registre reste bloquée tant que G0 n'est pas approuvé", async () => {
    const src = (registry.sources as SourceEntry[]).find((s) => s.id === "geniesdessciences");
    expect(src?.host).toBe("www.geniesdessciences.com");
    const { deps, calls } = fake();
    expect((await collectToc(src, OPTS, deps)).stopped).toMatch(/G0 = pending/);
    expect(calls).toEqual([]);
  });
  it("parcourt le périmètre, respecte robots.txt et le délai, ignore le reste", async () => {
    const { deps, calls, sleeps } = fake();
    const r = await collectToc(SRC, OPTS, deps);
    const paths = r.pages.map((p) => p.path);
    expect(calls[0]).toBe(`https://${HOST}/robots.txt`);
    expect(paths).toEqual(expect.arrayContaining(["/", "/troisieme", "/troisieme/maths", "/troisieme/maths/fractions", "/troisieme/maths/pythagore", "/troisieme/physique-chimie", "/seconde", "/brevet", "/brevet/maths-2025"]));
    for (const no of ["/cinquieme", "/svt-terminale", "/troisieme/francais", "/boutique", "/a-propos", "/mentions-legales", "/annales", "/seconde/maths"]) expect(paths, no).not.toContain(no);
    expect(r.skipped).toEqual([{ path: "/seconde/maths", reason: "robots.txt (Disallow: /seconde/maths)" }]);
    expect(sleeps.every((s) => s === 2000)).toBe(true);
    expect(calls.every((u) => new URL(u).host === HOST)).toBe(true);
    expect(r.stopped).toBeNull();
  });
  it("index par niveau / examen puis matière, et résumé Markdown", async () => {
    const { deps } = fake();
    const r = await collectToc(SRC, OPTS, deps);
    const idx = buildIndex(r);
    expect(Object.keys(idx)).toEqual(["3e", "2nde", "brevet"]);
    expect(idx["3e"].mathematiques.map((e) => e.h1)).toEqual(["Maths 3e", "Calculs avec des fractions", "Théorème de Pythagore"]);
    expect(idx["3e"].mathematiques[1].sections).toEqual(["Cours", "Exercices"]);
    expect(idx.brevet.mathematiques[0].path).toBe("/brevet/maths-2025");
    const md = renderMarkdown(r, idx);
    expect(md).toMatch(/## 3e[\s\S]*### mathematiques \(3\)[\s\S]*- \*\*Calculs avec des fractions\*\* — `\/troisieme\/maths\/fractions`/);
  });
  it("s'arrête à la limite de pages et respecte un Crawl-delay plus long", async () => {
    const { deps, sleeps } = fake("User-agent: *\nCrawl-delay: 7\n");
    const r = await collectToc(SRC, { ...OPTS, maxPages: 3 }, deps);
    expect(r.pages).toHaveLength(3);
    expect(r.stopped).toMatch(/limite de 3 pages/);
    expect(sleeps).toEqual([7000, 7000, 7000]);
  });
});
