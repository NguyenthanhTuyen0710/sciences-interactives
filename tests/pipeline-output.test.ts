// Sorties payées inutilisables (M16) : détection, format de relecture, annotation « outcome » du registre.
import { describe, expect, it } from "vitest";
import { outputProblem, parseReview, REVIEW_JSON_SCHEMA, reviewMarkdown, SEVERITIES, VERDICTS } from "../pipeline/review-format";
import { effectiveLimitUsd, ledgerIssues, ops, spendBlockers, spentUsd, TRIAL_CAP_USD, type LedgerEntry } from "../pipeline/ledger";
import { REVIEW_KEYS } from "../src/lib/chapters/schema";

const crit = (v = "PASS") => REVIEW_KEYS.map((criterion) => ({ criterion, verdict: v }));
const ok = { verdict: "NEEDS_REVIEW", criteria: crit(), findings: [
  { criterion: "exercises", severity: "MAJEUR", exerciseId: "py3-07", issue: "Énoncé ambigu.", fix: "Préciser l'unité." },
  { criterion: "language", severity: "MINEUR", exerciseId: "", issue: "Coquille.", fix: "Corriger." },
] };

describe("plafond affiché = plafond appliqué", () => {
  it("budget.json → limitUsd, borné par le plafond d'essai", () => {
    expect(effectiveLimitUsd(2.892)).toBe(2.892);
    expect(effectiveLimitUsd(50)).toBe(TRIAL_CAP_USD);
  });
});

describe("sortie inutilisable : jamais traitée comme un rapport QA", () => {
  it("max_tokens et refus sont toujours inutilisables, même avec un JSON valide", () => {
    expect(outputProblem("review", "max_tokens", JSON.stringify(ok))).toMatch(/tronquée/);
    expect(outputProblem("chapter", "max_tokens", "```ts\nexport const x = 1;\n```")).toMatch(/tronquée/);
    expect(outputProblem("review", "refusal", "")).toMatch(/refus/);
  });
  it("relecture JSON coupée au milieu → hors schéma", () => {
    const cut = JSON.stringify(ok).slice(0, 120);
    expect(outputProblem("review", "end_turn", cut)).toMatch(/JSON/);
  });
  it("relecture conforme → utilisable", () => expect(outputProblem("review", "end_turn", JSON.stringify(ok))).toBeNull());
});

describe("format de relecture", () => {
  it("schéma JSON et validation partagent les mêmes énumérations", () => {
    const p = REVIEW_JSON_SCHEMA.properties;
    expect(p.verdict.enum).toEqual([...VERDICTS]);
    expect(p.findings.items.properties.severity.enum).toEqual([...SEVERITIES]);
    expect(p.criteria.items.properties.criterion.enum).toEqual([...REVIEW_KEYS]);
    expect(JSON.stringify(REVIEW_JSON_SCHEMA)).not.toMatch(/minLength|maxItems|minimum|maximum/); // mots-clés refusés par structured outputs
  });
  it("refuse : critère manquant, PASS avec MAJEUR", () => {
    expect(parseReview(JSON.stringify({ ...ok, criteria: crit().slice(1) })).ok).toBe(false);
    expect(parseReview(JSON.stringify({ ...ok, verdict: "PASS" })).ok).toBe(false);
  });
  it("constats dans le désordre : triés par gravité (tri stable), même contenu ; rapport déjà trié inchangé", () => {
    const f = (severity: string, exerciseId: string) => ({ criterion: "exercises", severity, exerciseId, issue: "Défaut.", fix: "Corriger." });
    const mixed = [f("MAJEUR", "a"), f("MINEUR", "b"), f("BLOQUANT", "c"), f("MAJEUR", "d"), f("MINEUR", "e")];
    const r = parseReview(JSON.stringify({ ...ok, findings: mixed }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.review.findings.map((x) => `${x.severity}:${x.exerciseId}`)).toEqual(["BLOQUANT:c", "MAJEUR:a", "MAJEUR:d", "MINEUR:b", "MINEUR:e"]);
    const sorted = parseReview(JSON.stringify(ok));
    expect(sorted.ok && sorted.review).toEqual(ok);
    expect(parseReview(JSON.stringify({ ...ok, findings: [...ok.findings].reverse() })).ok).toBe(true);
    expect(outputProblem("screen", "end_turn", JSON.stringify({ ...ok, findings: [...ok.findings].reverse() }))).toBeNull();
  });
  it("contenu hors schéma toujours refusé, même dans le désordre : gravité inconnue, champ manquant ou en trop, texte vide", () => {
    const bad = (x: Record<string, unknown>) => parseReview(JSON.stringify({ ...ok, findings: [ok.findings[1], { ...ok.findings[0], ...x }] }));
    expect(bad({ severity: "CRITIQUE" }).ok).toBe(false);
    expect(bad({ severity: undefined }).ok).toBe(false);
    expect(bad({ fix: "" }).ok).toBe(false);
    expect(bad({ extra: 1 }).ok).toBe(false);
    expect(bad({ criterion: "style" }).ok).toBe(false);
    expect(parseReview(JSON.stringify({ ...ok, findings: "aucun" })).ok).toBe(false);
  });
  it("PASS court accepté et rendu en Markdown", () => {
    const r = parseReview(JSON.stringify({ verdict: "PASS", criteria: crit(), findings: [] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(reviewMarkdown(r.review, "# T")).toMatch(/Verdict : PASS[\s\S]*Aucun constat/);
  });
});

describe("registre : issue « outcome »", () => {
  const base: LedgerEntry[] = [
    { type: "reserve", id: "r1", at: "2026-11-08T04:33:02Z", chapter: "c", step: "review", inputHash: "h", mode: "batch", maxUsd: 0.189 },
    { type: "submitted", id: "r1", at: "2026-11-08T04:33:02Z", batchId: "msgbatch_A" },
    { type: "actual", id: "r1", at: "2026-11-08T04:39:41Z", usd: 0.095, batchId: "msgbatch_A" },
  ];
  const outcome: LedgerEntry = { type: "outcome", id: "r1", at: "2026-11-08T05:00:00Z", stopReason: "max_tokens", usable: false, note: "sortie tronquée" };
  it("acceptée après le coût réel, sans effet sur la dépense ni sur l'anti-doublon", () => {
    const l = [...base, outcome];
    expect(ledgerIssues(l)).toEqual([]);
    expect(spentUsd(l)).toBeCloseTo(0.095);
    expect(ops(l)[0].outcome?.usable).toBe(false);
    const b = spendBlockers(l, { chapter: "c", step: "review", inputHash: "h", maxUsd: 0.1 }, { ledgerSynced: true, creditVerified: true, limitUsd: 10 });
    expect(b.join()).toMatch(/requête identique déjà traitée/);
  });
  it("refusée avant le coût réel ou en double", () => {
    expect(ledgerIssues([...base.slice(0, 2), outcome]).join()).toMatch(/avant le coût réel/);
    expect(ledgerIssues([...base, outcome, outcome]).join()).toMatch(/en double/);
  });
});
