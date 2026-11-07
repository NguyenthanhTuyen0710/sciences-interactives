import { describe, expect, it } from "vitest";
import { extractMetadata, gateSeed, groupFor, matchObjective, parseRobots, quoteFound, robotsAllows, verify, type Seed, type SourceEntry } from "../pipeline/sources/lib";
import { ledgerIssues, ops, reconcileBatch, spendBlockers, spentUsd, type LedgerEntry } from "../pipeline/ledger";
import { SourceSchema } from "../src/lib/chapters/schema";
import registry from "../research/sources/registry.json";
import seedsFile from "../research/sources/seeds.json";

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
