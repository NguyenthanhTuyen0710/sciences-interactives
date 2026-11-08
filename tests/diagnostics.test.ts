// Règles de cohérence des diagnostics (src/lib/engine/diagnostics.ts) et non-régression py3-12 (Pythagore 3e).
import { describe, expect, it } from "vitest";
import { diagnosticIssues, sameValue, specialValues } from "../src/lib/engine/diagnostics";
import { createRng } from "../src/lib/engine/rng";
import { perfect } from "../src/lib/engine/solve";
import type { Interaction } from "../src/lib/engine/types";
import { math3ePythagore } from "../src/lib/chapters/data/math-3e-pythagore";

const numInt = (value: number, extra: object = {}): Interaction => ({ kind: "numerique", answer: { value, ...extra } }) as Interaction;
const issues = (it: Interaction, matches: string[]) => diagnosticIssues(it, matches.map((match) => ({ match, feedback: "…" })), perfect(it));

describe("diagnostics : règles", () => {
  it("diagnostic égal à la bonne réponse", () => {
    expect(issues(numInt(1), ["1"])[0]).toMatch(/égal à la bonne réponse/);
  });
  it("diagnostic accepté par le correcteur après normalisation (tolérance d'arrondi)", () => {
    expect(issues(numInt(2.236, { tol: 0.005 }), ["2,24"])[0]).toMatch(/accepté comme bonne réponse/);
  });
  it("deux diagnostics équivalents (fraction / décimal / écriture française)", () => {
    expect(sameValue("0,5", "1/2")).toBe(true);
    expect(sameValue("15.5", "15,5")).toBe(true);
    expect(issues(numInt(3), ["0,5", "1/2"])).toEqual([expect.stringMatching(/équivalents/)]);
  });
  it("options de QCM équivalentes", () => {
    const qcm = { kind: "qcm", options: ["0,5", "1/2", "2"], answer: [2] } as unknown as Interaction;
    expect(diagnosticIssues(qcm, [], perfect(qcm))).toEqual([expect.stringMatching(/options de QCM équivalentes/)]);
  });
  it("cas sain : aucun problème", () => {
    expect(issues(numInt(13), ["17", "169"])).toEqual([]);
  });
  it("valeurs particulières repérées", () => {
    expect(specialValues(numInt(0))).toContain("zéro");
    expect(specialValues(numInt(-0.5, { tol: 0.05 }))).toEqual(["négatif", "décimal", "arrondi"]);
  });
});

describe("non-régression py3-12 : triplet (3, 4, 5) × 2 → BC = 1 et BC² = 1", () => {
  const e = math3ePythagore.exercises.find((x) => x.id === "py3-12")!;
  // Recherche d'un tirage BC = 1 (AB, AC = 0,6 et 0,8 m) sans dépendre d'une graine précise.
  const body = Array.from({ length: 400 }, (_, k) => e.vary!(createRng(`r${k}`))).find(
    (b) => (b.parts[0].interaction as { answer: { value: number } }).answer.value === 1,
  );
  it("le cas BC = 1 est bien tiré", () => expect(body).toBeDefined());
  it("le diagnostic « tu as donné BC² » n'est pas proposé quand BC² = BC", () => {
    const p = body!.parts[0];
    expect((p.mistakes ?? []).map((m) => m.match)).not.toContain("1");
    expect(diagnosticIssues(p.interaction, p.mistakes, perfect(p.interaction))).toEqual([]);
  });
});
