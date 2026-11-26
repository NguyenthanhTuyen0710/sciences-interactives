import { describe, expect, it } from "vitest";
import { applyChanges, assertNoLongText, collectUiStructure, extractUiStructure, UI_MAX_TEXT, UI_OUTPUT_DIR, UI_REFERENCE_HOST, uiUserAgent, validateUiPages, type UiDeps, normalize, extractMetadata, gateSeed, type Change, type Inventory, type SourceRecord, groupFor, matchObjective, parseRobots, quoteFound, robotsAllows, verify, type Seed, type SourceEntry } from "../pipeline/sources/lib";
import { ledgerIssues, ops, reconcileBatch, spendBlockers, spentUsd, type LedgerEntry } from "../pipeline/ledger";
import { SourceSchema } from "../src/lib/chapters/schema";
import registry from "../research/sources/registry.json";
import seedsFile from "../research/sources/seeds.json";
import inventory from "../research/curriculum/mathematiques/curriculum-math.json";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const UA = "SciencesInteractivesBot/0.1 (+https://example.org)";

describe("robots.txt", () => {
  const txt = `# commentaire
User-agent: ClaudeBot
User-agent: GPTBot
Disallow: /

User-agent: *
Crawl-delay: 10
Disallow: /recherche/
Disallow: /admin
Allow: /*.pdf$
Allow: /sites/default/files/
Disallow: /sites/default/files/prive/
`;
  const g = groupFor(parseRobots(txt), UA);
  it("applique le groupe * à un agent non nommé", () => {
    expect(g.crawlDelay).toBe(10);
    expect(robotsAllows(g, "/bo/20/Hebdo31/x.htm").allowed).toBe(true);
    expect(robotsAllows(g, "/recherche/?q=a").allowed).toBe(false);
    expect(robotsAllows(g, "/admin/x").allowed).toBe(false);
  });
  it("retient la règle la plus longue et l'ancre $", () => {
    expect(robotsAllows(g, "/sites/default/files/doc.pdf").allowed).toBe(true);
    expect(robotsAllows(g, "/sites/default/files/prive/a.txt").allowed).toBe(false);
    expect(robotsAllows(g, "/admin/a.pdf").allowed).toBe(true); // Allow /*.pdf$ (7) > Disallow /admin (6)
    expect(robotsAllows(g, "/admin/a.pdf?x=1").allowed).toBe(false);
  });
  it("applique le groupe nommé à l'agent concerné", () => {
    expect(robotsAllows(groupFor(parseRobots(txt), "ClaudeBot/1.0"), "/sites/default/files/a.pdf").allowed).toBe(false);
  });
});

describe("registre, seeds et contrôles avant téléchargement", () => {
  const sources = registry.sources as SourceEntry[];
  const seeds = seedsFile.seeds as Seed[];
  it("toute approbation G0 est tracée ; seules les sources officielles le sont ; Math93 et Labolycée désactivées ; aucune conservation autorisée", () => {
    for (const s of sources) {
      if (s.g0.status === "approved") { expect(s.role).toBe("officiel"); expect(String(s.g0.decision)).toMatch(/Décision du porteur de projet/); }
      expect(s.g0.storage ?? "pending").not.toBe("approved");
    }
    expect(sources.filter((s) => s.role === "reference" && s.kind === "http").every((s) => !s.enabled && s.g0.status !== "approved")).toBe(true);
  });
  it("les seeds ne visent que les sources officielles ; toute décision G1 est tracée ; un seed ne passe qu'avec G0 et G1 approuvés", () => {
    for (const s of seeds as (Seed & { g1Note?: string })[]) {
      expect(["bo", "eduscol"]).toContain(s.sourceId);
      if (s.g1 !== "proposed") expect(s.g1Note).toMatch(/Décision du porteur de projet/);
      const src = sources.find((x) => x.id === s.sourceId)!;
      if (s.g1 !== "approved" || src.g0.status !== "approved") expect(gateSeed(s, src).length).toBeGreaterThan(0);
    }
  });
  it("autorise un seed uniquement si G0, G1, hôte et préfixe sont conformes", () => {
    const src: SourceEntry = { id: "bo", name: "BO", kind: "http", host: "www.education.gouv.fr", allowedPathPrefixes: ["/sites/default/files/"], role: "officiel", enabled: true, g0: { status: "approved" } };
    const seed = { ...seeds[0], g1: "approved" } as Seed;
    expect(gateSeed(seed, src)).toEqual([]);
    expect(gateSeed({ ...seed, url: "https://www.education.gouv.fr/recherche?q=x" }, src)[0]).toMatch(/hors des préfixes/);
    expect(gateSeed({ ...seed, url: "https://evil.example/sites/default/files/a.pdf" }, src)[0]).toMatch(/hôte/);
  });
  it("références pédagogiques : champs complets, jamais sources du programme, aucune source de référence active", () => {
    const refs = (registry as unknown as { references: { entries: Record<string, string>[] } }).references.entries;
    for (const r of refs) for (const k of ["niveau", "matiere", "chapitre", "edition", "curriculumVersion", "typeReference", "url", "acces", "droits"]) expect(r[k], `${r.niveau} ${k}`).toBeTruthy();
    expect(sources.filter((s) => s.role === "reference").every((s) => !s.enabled && s.g0.status !== "approved")).toBe(true);
  });
  it("un connecteur non configuré (Notion) est ignoré sans bloquer le reste", () => {
    const notion = sources.find((s) => s.id === "notion")!;
    expect(notion.optional).toBe(true);
    expect(gateSeed({ ...seeds[0], sourceId: "notion" }, notion)[0]).toMatch(/SOURCE_INACCESSIBLE/);
  });
});

describe("extraction et vérification", () => {
  const seed = (seedsFile.seeds as Seed[])[0];
  const text = "Programme de mathématiques du cycle 4. Publié au BO n° 10 du 5 mars 2026. Applicable à compter de la rentrée 2028 en classe de troisième. " + "Contenu. ".repeat(40);
  it("extrait des indices sans conclure", () => {
    const m = extractMetadata(text);
    expect(m.boRefs).toEqual(["BO n° 10 du 5 mars 2026"]);
    expect(m.cycles).toEqual([4]);
    expect(m.applicabilitySnippets.join(" ")).toMatch(/rentrée 2028/);
  });
  it("vérifie l'identité, ou signale un document non lu / inaccessible", () => {
    expect(verify(seed, text, 200, extractMetadata(text)).status).toBe("verified");
    expect(verify(seed, text.replace(/cycle 4/g, "cycle 3"), 200, extractMetadata(text.replace(/cycle 4/g, "cycle 3"))).status).toBe("needs_review");
    expect(verify(seed, "", 200, null).status).toBe("unreadable");
    expect(verify(seed, null, 403, null).status).toBe("inaccessible");
  });
  it("une citation doit figurer mot pour mot (≥ 20 caractères)", () => {
    expect(quoteFound(text, "Applicable à compter de la rentrée 2028")).toBe(true);
    expect(quoteFound(text, "applicable dès la rentrée 2027 partout")).toBe(false);
    expect(quoteFound(text, "cycle 4")).toBe(false);
  });
});

describe("rapprochement des objectifs", () => {
  const docs = [{ seedId: "d", sha256: "s", text: "Thème D.\n- Le théorème de Pythagore et sa réciproque.\n- Calculer une longueur dans un triangle rectangle avec le théorème de Pythagore." }];
  it("verified seulement pour une citation mot pour mot", () => {
    expect(matchObjective("Calculer une longueur dans un triangle  rectangle avec le théorème de Pythagore.", docs).status).toBe("verified");
  });
  it("paraphrase → needs_manual_review avec passage candidat, jamais verified", () => {
    const m = matchObjective("Démontrer qu'un triangle est rectangle (réciproque).", docs);
    expect(m.status).toBe("needs_manual_review");
    expect(m.evidence).toBeUndefined();
    expect(m.candidates?.[0].excerpt).toMatch(/réciproque/);
    expect(m.candidates?.[0].page).toBe(1);
  });
});

describe("preuves G2 dans l'inventaire", () => {
  type Ev = { seedId: string; sha256: string; quote: string; page: number; approvedBy: string; approvedAt: string; reason: string };
  const objs = (inventory as unknown as { grades: { domains: { chapters: { objectives: { id: string; text: string; evidence?: Ev }[] }[] }[] }[] }).grades
    .flatMap((g) => g.domains.flatMap((d) => d.chapters.flatMap((c) => c.objectives)));
  it("chaque preuve est approuvée, datée, motivée et rattachée à un document vérifié de même SHA256", () => {
    const withEv = objs.filter((o) => o.evidence);
    expect(withEv.map((o) => o.id).sort()).toEqual(["M1S-SD-01", "M1S-SD-02", "M1S-SD-03", "M1S-SD-04", "M1S-SD-05", "M1S-SD-06", "M3-AUTO-03", "M3-EG-03", "M3-EG-04", "M3-NC-08", "M3-NC-09", "M3-NC-10", "M3-NC-11", "M3-NC-12", "M3-NC-13", "M3-NC-14", "M4-EG-03", "M4-EG-04"]);
    for (const o of withEv) {
      const e = o.evidence!;
      expect(e.approvedBy).toBeTruthy(); expect(e.approvedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(e.reason).toBeTruthy(); expect(e.page).toBeGreaterThan(0);
      const f = `research/sources/records/${e.seedId}.json`;
      expect(existsSync(f)).toBe(true);
      const rec = JSON.parse(readFileSync(f, "utf8"));
      expect(rec.sha256).toBe(e.sha256); expect(rec.verification.status).toBe("verified");
      // Objectif paraphrasé (type b) : la citation d'origine ne l'a pas remplacé. Type a : texte aligné mot pour mot.
      if (!String(e.matchType ?? "b").startsWith("a")) expect(e.quote).not.toBe(o.text);
      else expect(normalize(e.quote)).toContain(normalize(o.text).replace(/\.$/, ""));
    }
  });
});

describe("schéma des sources de chapitre", () => {
  const base = { id: "R1", title: "Programme", url: "https://www.education.gouv.fr/a.pdf", kind: "official" as const };
  it("reste compatible avec les sources sans statut", () => {
    expect(SourceSchema.safeParse(base).success).toBe(true);
    expect(SourceSchema.safeParse({ ...base, verification: "pending_verification" }).success).toBe(true);
  });
  it("refuse « verified » sans empreinte ni date d'accès", () => {
    expect(SourceSchema.safeParse({ ...base, verification: "verified" }).success).toBe(false);
    expect(SourceSchema.safeParse({ ...base, verification: "verified", sha256: "a".repeat(64), accessedAt: "2026-11-07T10:00:00.000Z" }).success).toBe(true);
  });
});

describe("registre des dépenses", () => {
  const ready = { ledgerSynced: true, creditVerified: true, limitUsd: 10 };
  const req = { chapter: "c", step: "dossier", inputHash: "h1", maxUsd: 0.5 };
  const reserve = (id: string, inputHash = "h1", maxUsd = 0.5, at = "2026-11-07T10:00:00.000Z"): LedgerEntry => ({ type: "reserve", id, at, chapter: "c", step: "dossier", inputHash, mode: "batch", maxUsd });

  it("autorise seulement si tout est réuni", () => {
    expect(spendBlockers([], req, ready)).toEqual([]);
    expect(spendBlockers([], req, { ...ready, ledgerSynced: false })[0]).toMatch(/non synchronisé/);
    expect(spendBlockers([], req, { ...ready, creditVerified: false })[0]).toMatch(/creditVerified/);
    expect(spendBlockers([], req, { ...ready, limitUsd: 50 })[0]).toMatch(/plafond d'essai/);
  });
  it("compte une réservation non soldée à son coût maximal, puis au coût réel", () => {
    const e: LedgerEntry[] = [reserve("a"), { type: "submitted", id: "a", at: "t", batchId: "msgbatch_1" }];
    expect(spentUsd(e)).toBe(0.5);
    e.push({ type: "actual", id: "a", at: "t", usd: 0.12, batchId: "msgbatch_1" });
    expect(spentUsd(e)).toBe(0.12);
    expect(spentUsd([reserve("b"), { type: "failed", id: "b", at: "t", reason: "x" }])).toBe(0);
  });
  it("bloque un doublon, une issue inconnue et le dépassement du plafond", () => {
    expect(spendBlockers([reserve("a"), { type: "submitted", id: "a", at: "t", batchId: "msgbatch_1" }], req, ready)[0]).toMatch(/déjà soumise/);
    expect(spendBlockers([reserve("a", "h2"), { type: "unknown", id: "a", at: "t", error: "ECONNRESET" }], req, ready)[0]).toMatch(/issue inconnue/);
    expect(spendBlockers([reserve("a", "h2"), { type: "actual", id: "a", at: "t", usd: 9.8 }], req, ready)[0]).toMatch(/plafond/);
  });
  it("détecte un registre incohérent", () => {
    const good: LedgerEntry[] = [reserve("a"), { type: "submitted", id: "a", at: "t", batchId: "msgbatch_1" }, { type: "actual", id: "a", at: "t", usd: 0.1, batchId: "msgbatch_1" }];
    expect(ledgerIssues(good)).toEqual([]);
    expect(ledgerIssues([{ type: "actual", id: "z", at: "t", usd: 1 }])[0]).toMatch(/sans réservation/);
    expect(ledgerIssues([...good, { type: "failed", id: "a", at: "t", reason: "x" }])[0]).toMatch(/après une issue finale/);
    expect(ledgerIssues([...good, reserve("b"), { type: "submitted", id: "b", at: "t", batchId: "msgbatch_1" }])[0]).toMatch(/déjà rattaché/);
    expect(ledgerIssues([{ type: "unknown", id: "run-42", at: "t", error: "interrompu" }, { type: "failed", id: "run-42", at: "t", reason: "aucun batch" }])).toEqual([]);
  });
  it("réconcilie sans deviner", () => {
    const op = ops([reserve("a")])[0];
    expect(reconcileBatch(op, [], new Set())).toEqual({ failed: true });
    expect(reconcileBatch(op, [{ id: "msgbatch_x", created_at: "2026-11-07T10:00:05Z" }], new Set())).toEqual({ batchId: "msgbatch_x" });
    expect(reconcileBatch(op, [{ id: "msgbatch_old", created_at: "2026-11-06T10:00:00Z" }], new Set())).toEqual({ failed: true });
    expect("ambiguous" in reconcileBatch(op, [{ id: "x1", created_at: "2026-11-07T10:01:00Z" }, { id: "x2", created_at: "2026-11-07T10:02:00Z" }], new Set())).toBe(true);
  });
});

describe("G2 : attach_evidence passe un objectif à verified seulement si la citation est prouvée ET le rapprochement approuvé", () => {
  const SHA = "a".repeat(64);
  const rec = { seedId: "doc", url: "https://www.education.gouv.fr/x.pdf", accessedAt: "2026-11-15T00:00:00.000Z", sha256: SHA, verification: { status: "verified", checks: [] } } as unknown as SourceRecord;
  const text = "Capacités attendues − Étudier le signe d'une fonction polynôme du second degré donnée sous forme factorisée.";
  const inv = (): Inventory => ({ grades: [{ domains: [{ chapters: [{ id: "c", objectives: [{ id: "O1", text: "Étudier le signe…", verified: false }] }] }] }] });
  const ev = { seedId: "doc", sha256: SHA, quote: "Étudier le signe d'une fonction polynôme du second degré donnée sous forme factorisée." };
  const ok: Change = { op: "attach_evidence", objectiveId: "O1", evidence: ev, approvedBy: "porteur de projet", approvedAt: "2026-11-15" };
  const docOf = () => ({ record: rec, text });
  const obj = (i: Inventory) => i.grades[0].domains[0].chapters[0].objectives[0];
  it("accepté : verified true, preuve avec approbation, texte inchangé", () => {
    const i = inv();
    expect(applyChanges(i, [ok], docOf)).toEqual({ applied: 1, errors: [] });
    expect(obj(i)).toMatchObject({ verified: true, text: "Étudier le signe…", evidence: { approvedBy: "porteur de projet", approvedAt: "2026-11-15", sha256: SHA } });
  });
  const refused: [string, Change, typeof docOf][] = [
    ["sans approbation", { ...ok, approvedBy: undefined }, docOf],
    ["approbation sans date", { ...ok, approvedAt: "hier" }, docOf],
    ["citation absente du document", { ...ok, evidence: { ...ev, quote: "Étudier le signe d'une fonction affine quelconque sur un intervalle." } }, docOf],
    ["SHA256 différent", { ...ok, evidence: { ...ev, sha256: "b".repeat(64) } }, docOf],
    ["document non vérifié", ok, () => ({ record: { ...rec, verification: { status: "needs_review", checks: [] } } as SourceRecord, text })],
    ["document absent du cache", ok, () => ({ record: rec, text: null })],
  ];
  for (const [name, change, d] of refused) it(`refusé : ${name} (objectif inchangé, verified false)`, () => {
    const i = inv();
    const r = applyChanges(i, [change], d);
    expect(r.applied).toBe(0);
    expect(r.errors).toHaveLength(1);
    expect(obj(i).verified).toBe(false);
    expect(obj(i).evidence).toBeUndefined();
  });
  it("tout ou rien : un refus annule les changements valides du même lot", () => {
    const i = inv();
    i.grades[0].domains[0].chapters[0].objectives.push({ id: "O2", text: "x", verified: false });
    const r = applyChanges(i, [ok, { ...ok, objectiveId: "O2", approvedBy: "" }], docOf);
    expect(r.errors).toHaveLength(1);
    expect(obj(i).verified).toBe(false);
  });
});

describe("relevé de structure d'interface (hors chaîne de contenu)", () => {
  const LONG = "Ce paragraphe de présentation est volontairement long pour vérifier qu'aucun texte n'est conservé par le relevé.";
  const QUOTE = "Témoignage fictif d'un élève, à ne jamais recopier dans la sortie du relevé.";
  const HTML = `<!doctype html><html><head><title>Titre de page à ignorer</title><script>var secret = "${LONG}";</script></head><body>
<a href="#contenu">Aller au contenu</a>
<header><a href="/"><img src="/logo.png" alt="logo"></a>
  <nav aria-label="principale"><ul><li><a href="/cours">Le cours</a></li><li><a href="/exos">Exercices</a></li>
  <li><a href="/x">${LONG}</a></li><li><a href="https://ailleurs.example/">Externe</a></li></ul></nav></header>
<main id="contenu">
  <section><h1>Grand titre du hero à ne pas conserver</h1><p>${LONG}</p>
    <a href="/3e">Troisième 12 chapitres</a><a href="/2nde">Seconde</a><a href="/1re">Première</a><a href="/tle">Terminale</a>
    <img src="/mascotte.webp" alt=""><video src="/intro.mp4"></video></section>
  <section><h2>Derniers chapitres</h2><ul>
    <li><a href="/c1"><img src="/c1.jpg"><h3>Chapitre un</h3></a></li><li><a href="/c2"><img src="/c2.jpg"><h3>Chapitre deux</h3></a></li><li><a href="/c3"><img src="/c3.jpg"><h3>Chapitre trois</h3></a></li></ul></section>
  <section><h2>Avis</h2><blockquote>${QUOTE}</blockquote><form><input type="email" name="email"><button>Envoyer</button></form></section>
</main>
<footer><div><p>Marque</p></div><div><h3>Par classe</h3><ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul></div>
<div><h3>Contenus</h3><ul><li><a href="/c">C</a></li><li><a href="/d">D</a></li><li><a href="/e">E</a></li></ul></div></footer>
</body></html>`;

  it("ne conserve aucun texte long, aucun titre, aucune adresse d'image", () => {
    const out = extractUiStructure(HTML);
    const json = JSON.stringify(out);
    for (const s of [LONG, QUOTE, "Grand titre", "Derniers chapitres", "Chapitre un", "Titre de page", "secret", ".png", ".jpg", ".webp", ".mp4", "ailleurs.example", "email"]) expect(json).not.toContain(s);
    const strings: string[] = [];
    const walk = (v: unknown): void => { if (typeof v === "string") strings.push(v); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
    walk(out);
    expect(strings.every((s) => s.length <= UI_MAX_TEXT)).toBe(true);
    expect(() => assertNoLongText({ a: ["x".repeat(UI_MAX_TEXT + 1)] })).toThrow();
  });

  it("relève l'ordre des blocs, les niveaux de titres, la navigation, les rôles et les colonnes du pied de page", () => {
    const out = extractUiStructure(HTML);
    expect(out.blocks.map((b) => b.tag)).toEqual(["header", "nav", "main", "section", "section", "section", "footer"]);
    expect(out.totals).toEqual({ h1: 1, h2: 2, h3: 5, blocks: 7 });
    const nav = out.blocks.find((b) => b.tag === "nav")!;
    expect(nav.navItems).toEqual(["Le cours", "Exercices", "Externe"]);
    expect(nav.navOmitted).toBe(1);
    const [hero, cards, avis] = out.blocks.filter((b) => b.tag === "section");
    expect(hero.roles).toEqual(["hero", "sélecteur de niveau"]);
    expect([hero.images, hero.videos]).toEqual([1, 1]);
    expect(cards.roles).toEqual(["grille de cartes"]);
    expect(cards.cards).toBe(3);
    expect(avis.roles).toEqual(["formulaire"]);
    const footer = out.blocks.find((b) => b.tag === "footer")!;
    expect([footer.footerColumns, footer.linksPerColumn]).toEqual([2, [2, 3]]);
  });

  it("refuse avant toute requête : autre hôte, HTTP, chemins réservés ou d'achat, plus de 10 pages", () => {
    expect(validateUiPages("/, /cours, https://" + UI_REFERENCE_HOST + "/fiches").paths).toEqual(["/", "/cours", "/fiches"]);
    for (const bad of ["https://ailleurs.example/", "http://" + UI_REFERENCE_HOST + "/", "/api/x", "/merci", "/classeurs/a", "/fiches-pdf/b", "/connexion", "/boutique", "/packs-exercices", "/cours-particuliers", ""]) expect(validateUiPages(bad).errors.length, bad).toBeGreaterThan(0);
    expect(validateUiPages(Array.from({ length: 11 }, (_, i) => `/p${i}`).join(",")).errors[0]).toMatch(/maximum 10/);
  });

  const fakeDeps = (robots: string, pageStatus = 200) => {
    const calls: string[] = [], sleeps: number[] = [];
    const deps: UiDeps = {
      fetch: async (url, init) => {
        calls.push(url);
        expect(init.redirect).toBe("manual");
        expect(init.headers["User-Agent"]).toMatch(/relevé de structure de mise en page, sans contenu\)$/);
        const isRobots = url.endsWith("/robots.txt");
        return { status: isRobots ? 200 : pageStatus, headers: { get: (n: string) => (n === "content-type" ? (isRobots ? "text/plain" : "text/html; charset=utf-8") : n === "location" ? "https://ailleurs.example/" : null) }, text: async () => (isRobots ? robots : HTML) };
      },
      sleep: async (ms) => { sleeps.push(ms); },
    };
    return { deps, calls, sleeps };
  };
  const UA_UI = uiUserAgent("SciencesInteractivesBot/0.1 (+https://example.org)");

  it("une requête par page autorisée, robots.txt d'abord, délai ≥ 2 s, aucune image ni lien suivi", async () => {
    const { deps, calls, sleeps } = fakeDeps("User-agent: *\nAllow: /\nDisallow: /api/\n");
    const r = await collectUiStructure("/,/cours", UA_UI, deps);
    expect(r.stopped).toBeNull();
    expect(calls).toEqual([`https://${UI_REFERENCE_HOST}/robots.txt`, `https://${UI_REFERENCE_HOST}/`, `https://${UI_REFERENCE_HOST}/cours`]);
    expect(calls.every((u) => new URL(u).host === UI_REFERENCE_HOST && !/\.(png|jpe?g|webp|gif|svg|mp4)$/.test(u))).toBe(true);
    expect(sleeps).toEqual([2000, 2000]);
    expect(r.pages.map((p) => p.totals.blocks)).toEqual([7, 7]);
  });

  it("respecte un Crawl-delay plus long et ne suit pas les redirections", async () => {
    const { deps, calls, sleeps } = fakeDeps("User-agent: *\nCrawl-delay: 5\n", 301);
    const r = await collectUiStructure("/", UA_UI, deps);
    expect(sleeps).toEqual([5000]);
    expect(calls).toHaveLength(2);
    expect(r.pages[0]).toMatchObject({ httpStatus: 301, note: "redirection non suivie", blocks: [] });
  });

  it("s'arrête si robots.txt interdit une page : aucune page demandée", async () => {
    const { deps, calls } = fakeDeps("User-agent: *\nDisallow: /\n");
    const r = await collectUiStructure("/,/cours", UA_UI, deps);
    expect(r.stopped).toMatch(/robots\.txt interdit/);
    expect(calls).toEqual([`https://${UI_REFERENCE_HOST}/robots.txt`]);
    expect(r.pages).toEqual([]);
  });

  it("pages refusées : aucune requête, pas même robots.txt", async () => {
    const { deps, calls } = fakeDeps("");
    const r = await collectUiStructure("https://ailleurs.example/", UA_UI, deps);
    expect(r.stopped).toMatch(/pages refusées/);
    expect(calls).toEqual([]);
  });

  it("reste hors de la chaîne de contenu et hors de Git", () => {
    const root = join(__dirname, "..");
    const readers = ["pipeline/run.ts", "scripts/validate-chapter.ts", ...readdirSync(join(root, "pipeline/prompts")).map((f) => `pipeline/prompts/${f}`)];
    for (const f of readers) {
      const txt = readFileSync(join(root, f), "utf8");
      for (const needle of [UI_OUTPUT_DIR, "ui-structure", "UiStructure", "sources/lib"]) expect(txt.includes(needle), `${f} : ${needle}`).toBe(false);
    }
    expect(UI_OUTPUT_DIR.startsWith("research") || UI_OUTPUT_DIR.startsWith("project")).toBe(false);
    expect(readFileSync(join(root, ".gitignore"), "utf8")).toContain(`/${UI_OUTPUT_DIR}/`);
  });
});
