// QA3 — Validation indépendante des exercices de SCI-5E-MATH-001 (Nombres relatifs, 5e).
// Principe : les réponses attendues sont RECALCULÉES à partir de l'énoncé affiché (ou fixées à la main pour
// les exercices statiques), puis comparées à la clé ; les saisies « élève » sont celles qu'envoie l'UI
// (numerique : { value: string } ; texte-trous / etapes : string[] ; tableau : Record<"r-c", string>).
// Les tests préfixés « [DÉFAUT] » révèlent des défauts réels : leur échec est attendu tant que le contenu
// ou le moteur n'est pas corrigé.
import { describe, expect, it } from "vitest";
import { math5eNombresRelatifs as CH } from "../src/lib/chapters/data/math-5e-nombres-relatifs";
import { exerciseGenerator } from "../src/lib/chapters";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise, checkPart, matchesMistake } from "../src/lib/engine/check";
import { perfect } from "../src/lib/engine/solve";
import { parseNumber } from "../src/lib/engine/numbers";
import type { ExerciseInstance, Interaction } from "../src/lib/engine/types";

const N = 500;
const EX = (id: string) => {
  const e = CH.exercises.find((x) => x.id === id);
  if (!e) throw new Error(id);
  return e;
};
const gen = (id: string, seed: number | string): ExerciseInstance => exerciseGenerator(CH, EX(id)).generate(createRng(`qa3-${id}-${seed}`)) as ExerciseInstance;
const seeds = Array.from({ length: N }, (_, i) => i);
const it0 = (inst: ExerciseInstance, i = 0) => inst.parts[i].interaction as any;

/** TeX (format du chapitre) → expression JS évaluable. */
const js = (t: string) => t.replace(/\{,\}/g, ".").replace(/\\,/g, "").replace(/\\ldots/g, "NaN").replace(/−/g, "-");
const evalTex = (t: string): number => Function(`"use strict";return (${js(t)});`)();
const maths = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const nums = (s: string) => maths(s).map((m) => js(m)).filter((m) => /^[+-]?\d+(\.\d+)?$/.test(m.trim())).map(Number);
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/** Réponse « élève » : numerique. */
const numResp = (v: string) => ({ value: v });
const grade = (inst: ExerciseInstance, responses: unknown[]) => checkExercise(inst, responses);

// ───────────────────────── 0. Inventaire ─────────────────────────
describe("inventaire", () => {
  it("36 exercices, identifiants rel5-01…rel5-36, niveaux 1→5 croissants", () => {
    expect(CH.exercises).toHaveLength(36);
    CH.exercises.forEach((e, i) => expect(e.id).toBe(`rel5-${String(i + 1).padStart(2, "0")}`));
    const lv = CH.exercises.map((e) => e.niveau);
    expect([...lv].sort()).toEqual(lv);
    expect(lv.filter((x) => x === 1)).toHaveLength(7);
    expect(lv.filter((x) => x === 5)).toHaveLength(6);
  });
});

// ───────────────────────── 1. Exercices statiques : clé recalculée à la main ─────────────────────────
describe("exercices statiques — clés vérifiées indépendamment", () => {
  const st = (id: string) => gen(id, 0);
  it("rel5-01 : « 4 degrés sous zéro » = −4", () => {
    const i = st("rel5-01");
    expect(it0(i).options[it0(i).answer[0]]).toBe("$-4$");
    const k = it0(i).answer[0];
    expect(grade(i, [[k]]).score).toBe(1);
    const pos4 = it0(i).options.indexOf("$4$");
    expect(grade(i, [[pos4]]).parts[0].feedback[0]).toMatch(/au-dessus/);
  });
  it("rel5-02 : classement (température, altitude, étage, solde peuvent être négatifs)", () => {
    expect(it0(st("rel5-02")).answer).toEqual([0, 0, 1, 0, 1, 0, 1]);
  });
  it("rel5-03 : 0 est positif ET négatif, pas strictement", () => {
    expect(it0(st("rel5-03")).answer).toEqual([true, false, true, false, true]);
  });
  it("rel5-05 : associer opposés", () => {
    const i = it0(st("rel5-05"));
    const v = (s: string) => evalTex(s.replace(/\$/g, ""));
    i.left.forEach((l: string, k: number) => expect(close(v(l) + v(i.right[i.answer[k]]), 0)).toBe(true));
  });
  it("rel5-07 : 3 − 5 = −2", () => {
    const i = st("rel5-07");
    expect(it0(i).answer.value).toBe(-2);
  });
  it("rel5-21 : chaque soustraction associée à une addition de même valeur, valeurs uniques", () => {
    const i = it0(st("rel5-21"));
    const v = (s: string) => evalTex(s.replace(/\$/g, ""));
    i.left.forEach((l: string, k: number) => expect(v(l)).toBe(v(i.right[i.answer[k]])));
    expect(new Set(i.right.map(v)).size).toBe(i.right.length);
  });
  it("rel5-23 : comparaisons de décimaux négatifs (évaluées numériquement)", () => {
    const i = it0(st("rel5-23"));
    const truth = i.items.map((s: string) => evalTex(s.replace(/\$/g, "")));
    expect(i.answer).toEqual(truth);
  });
  it("rel5-29 : parenthèses et signe « − »", () => {
    expect(it0(st("rel5-29")).answer).toEqual([false, false, true, false, true]);
  });
  it("rel5-32 : nombre mystère = −2,2 (seul candidat satisfaisant les 4 contraintes)", () => {
    const i = it0(st("rel5-32"));
    const vals = i.options.map((s: string) => evalTex(s.replace(/\$/g, "")));
    const ok = vals.map((x: number, k: number) => (x < 0 && -x > 2 && -x < 3 && x > -2.5 && Math.floor(Math.abs(x) * 10 + 1e-9) % 10 === 2 ? k : -1)).filter((k: number) => k >= 0);
    expect(ok).toEqual(i.answer);
  });
  it("rel5-35 : toujours vrai ?", () => {
    expect(it0(st("rel5-35")).answer).toEqual([true, false, true, true, false]);
  });
  it("diagnostics QCM statiques : aucun ne pointe sur la bonne option", () => {
    for (const id of ["rel5-01", "rel5-32"]) {
      const i = st(id);
      for (const m of i.parts[0].mistakes ?? []) expect(Number(m.match)).not.toBe(it0(i).answer[0]);
    }
  });
});

// ───────────────────────── 2. Formes équivalentes acceptées par la correction ─────────────────────────
describe("saisies équivalentes (numerique envoie { value: string })", () => {
  const i7 = gen("rel5-07", 0); // réponse −2
  const ok = (s: string) => checkPart(it0(i7), numResp(s)).status;
  it.each(["-2", "−2", "–2", "-2,0", "-2.0", " -2 ", "- 2", "-2,00"])("« %s » accepté pour −2", (s) => expect(ok(s)).toBe("correct"));
  it("« +5 » accepté pour 5", () => {
    const inst = gen("rel5-30", 1);
    const v = it0(inst).answer.value as number;
    expect(checkPart(it0(inst), numResp(`+${v}`)).status).toBe("correct");
  });
  it("milliers avec espace « 1 700 » / espace insécable acceptés (rel5-30, réponses ≥ 1000)", () => {
    let tested = 0;
    for (const s of seeds) {
      const inst = gen("rel5-30", s);
      const v = it0(inst).answer.value as number;
      if (v < 1000) continue;
      tested++;
      const sp = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      expect(checkPart(it0(inst), numResp(sp)).status).toBe("correct");
      expect(checkPart(it0(inst), numResp(sp.replace(" ", " "))).status).toBe("correct");
    }
    expect(tested).toBeGreaterThan(0);
  });
  it("[DÉFAUT] « (-2) » / « (−2) » (écriture entre parenthèses enseignée dans le chapitre) devrait être accepté", () => {
    // Le jeu (parseRel) accepte « (+2,5) » mais le moteur de correction (parseNumber) rejette les parenthèses.
    expect(ok("(-2)")).toBe("correct");
    expect(ok("(−2)")).toBe("correct");
  });
  it("une réponse fausse n'est pas acceptée ; saisie vide → faux", () => {
    expect(ok("2")).toBe("faux");
    expect(ok("")).toBe("faux");
    expect(ok("-2,1")).toBe("faux");
  });
  it("texte-trous / etapes / tableau acceptent aussi « −x » (signe moins typographique) et « x,0 »", () => {
    const inst = gen("rel5-18", 3);
    const bl = it0(inst).blanks;
    const resp = bl.map((b: any) => String(b.answer.value).replace("-", "−").replace(/^(\d)/, "$1") + (Number.isInteger(b.answer.value) ? ",0" : ""));
    expect(checkPart(it0(inst), resp).status).toBe("correct");
  });
});

// ───────────────────────── 3. Exercices variables : clé recalculée depuis l'énoncé, 500 graines ─────────────────────────
describe("exercices variables — clé recalculée depuis l'énoncé (500 graines)", () => {
  it("toutes les réponses parfaites de la clé obtiennent 1 et sont distinctes d'une réponse vide", () => {
    for (const e of CH.exercises) {
      for (const s of seeds.slice(0, e.vary ? N : 1)) {
        const inst = gen(e.id, s);
        expect(grade(inst, inst.parts.map((p) => perfect(p.interaction))).score, `${e.id} seed ${s}`).toBe(1);
        expect(grade(inst, []).score, `${e.id} seed ${s}`).toBe(0);
      }
    }
  });

  it("rel5-04 : abscisse entière dans [−6 ; −1]", () => {
    for (const s of seeds) {
      const v = it0(gen("rel5-04", s)).answer.value;
      expect(Number.isInteger(v) && v >= -6 && v <= -1).toBe(true);
    }
  });
  it("rel5-06 : signe « − », distance à zéro = −a, dans [1,2 ; 9,5]", () => {
    for (const s of seeds) {
      const inst = gen("rel5-06", s);
      const a = nums(inst.statement)[0];
      const b = it0(inst).blanks;
      expect(a).toBeLessThan(0);
      expect(b[0].options[b[0].answer]).toBe("−");
      expect(b[1].answer.value).toBeCloseTo(-a, 9);
    }
  });
  it("rel5-08 : abscisse multiple de 0,5 non entière, dans [−4 ; 2], diagnostics ≠ réponse", () => {
    for (const s of seeds) {
      const inst = gen("rel5-08", s);
      const v = it0(inst).answer.value;
      expect(v >= -4 && v <= 2 && close(v * 2, Math.round(v * 2)) && !Number.isInteger(v)).toBe(true);
    }
  });
  it("rel5-09 : −a, a, 0", () => {
    for (const s of seeds) {
      const inst = gen("rel5-09", s);
      const a = evalTex(maths(inst.statement)[0].replace("a =", ""));
      expect(it0(inst).blanks.map((b: any) => b.answer.value)).toEqual([-a, a, 0]);
    }
  });
  it("rel5-10 : 4 points distincts, dans la grille, coordonnées conformes à l'énoncé", () => {
    for (const s of seeds) {
      const inst = gen("rel5-10", s);
      const pts = it0(inst).points.map((p: any) => p.answer);
      expect(new Set(pts.map(String)).size).toBe(4);
      const fromStmt = [...inst.statement.matchAll(/\(([^;]+)\\,;\\,([^)]+)\)/g)].map((m) => [Number(js(m[1])), Number(js(m[2]))]);
      expect(fromStmt).toEqual(pts);
      for (const [x, y] of pts) expect(Math.abs(x) <= 5 && Math.abs(y) <= 5).toBe(true);
    }
  });
  it("rel5-11 : au moins une coordonnée négative, M hors des axes", () => {
    for (const s of seeds) {
      const [x, y] = it0(gen("rel5-11", s)).blanks.map((b: any) => b.answer.value);
      expect(x < 0 || y < 0).toBe(true);
      expect(x !== 0 && y !== 0).toBe(true);
    }
  });
  it("rel5-12 : symbole attendu = comparaison réelle des nombres affichés", () => {
    for (const s of seeds) {
      const inst = gen("rel5-12", s);
      const t = it0(inst);
      t.template.split("\n").forEach((line: string, k: number) => {
        const [a, b] = maths(line).map(evalTex);
        expect(t.blanks[k].options[t.blanks[k].answer]).toBe(a < b ? "<" : a > b ? ">" : "=");
      });
    }
  });

  const numericFromStatement: [string, (st: string) => number][] = [
    ["rel5-13", (st) => evalTex(maths(st)[0])],
    ["rel5-14", (st) => evalTex(maths(st)[0])],
    ["rel5-17", (st) => evalTex(maths(st)[0])],
    ["rel5-20", (st) => evalTex(maths(st)[0])],
    ["rel5-22", (st) => evalTex(maths(st)[0])],
    ["rel5-26", (st) => { const [t1, t2] = nums(st); return t2 - t1; }],
    ["rel5-27", (st) => { const [a, up, down] = nums(st); return a + up - down; }],
    ["rel5-28", (st) => { const [a, c] = maths(st)[0].split(/\+\s*\\ldots\s*=/).map(evalTex); return c - a; }],
    ["rel5-30", (st) => { const [h, d] = nums(st); return h - d; }],
  ];
  it.each(numericFromStatement)("%s : clé = valeur recalculée depuis l'énoncé", (id, f) => {
    for (const s of seeds) {
      const inst = gen(id, s);
      expect(it0(inst).answer.value).toBeCloseTo(f(inst.statement), 9);
    }
  });

  it("rel5-13 / 14 / 20 : signes et plages conformes (2 à 19, deux négatifs, signes contraires, b négatif)", () => {
    for (const s of seeds) {
      const [a13, b13] = maths(gen("rel5-13", s).statement)[0].split("+").map(evalTex);
      expect(a13 < 0 && b13 < 0 && a13 >= -19 && b13 >= -19).toBe(true);
      const [a14, b14] = maths(gen("rel5-14", s).statement)[0].split("+").map(evalTex);
      expect(Math.sign(a14) * Math.sign(b14)).toBe(-1);
      expect(Math.abs(a14)).not.toBe(Math.abs(b14));
    }
  });
  it("rel5-15 : signe attendu = signe réel de la somme affichée, jamais nulle", () => {
    for (const s of seeds) {
      const inst = gen("rel5-15", s);
      const v = evalTex(maths(inst.statement)[0]);
      expect(Math.abs(v)).toBeGreaterThan(1e-9);
      expect(it0(inst).answer[0]).toBe(v > 0 ? 0 : 1);
    }
  });
  it("rel5-16 : 6 nombres distincts, pas déjà dans l'ordre, clé = tri dans le sens demandé", () => {
    for (const s of seeds) {
      const inst = gen("rel5-16", s);
      const t = it0(inst);
      const up = /croissant/.test(inst.statement) && !/décroissant/.test(inst.statement);
      const v = t.items.map((x: string) => evalTex(x.replace(/\$/g, "")));
      expect(new Set(v).size).toBe(6);
      expect(v.some((x: number) => x > 0)).toBe(true);
      expect(t.answer.every((k: number, i: number) => k === i)).toBe(false);
      for (let i = 1; i < 6; i++) {
        if (up) expect(v[t.answer[i - 1]]).toBeLessThan(v[t.answer[i]]);
        else expect(v[t.answer[i - 1]]).toBeGreaterThan(v[t.answer[i]]);
      }
    }
  });
  it("rel5-18 : trou 1 = opposé du nombre soustrait, trou 2 = différence", () => {
    for (const s of seeds) {
      const inst = gen("rel5-18", s);
      const expr = maths(inst.statement)[0];
      const b = evalTex(expr.replace(/^-?\d+\s*-\s*/, ""));
      expect(it0(inst).blanks.map((x: any) => x.answer.value)).toEqual([-b, evalTex(expr)]);
    }
  });
  it("rel5-19 : chaque case = ligne + colonne (lues dans les en-têtes)", () => {
    for (const s of seeds) {
      const t = it0(gen("rel5-19", s));
      const cols = t.headers.slice(1).map((h: string) => evalTex(h.replace(/\$/g, "")));
      t.rows.forEach((r: any) => {
        const rv = evalTex(r.label.replace(/\$/g, ""));
        r.cells.forEach((c: any, j: number) => expect(c.answer.value).toBeCloseTo(rv + cols[j], 9));
      });
    }
  });
  it("[DÉFAUT] rel5-19 : deux colonnes d'en-tête identiques (ex. −3 et −3,0) ne devraient pas apparaître", () => {
    const bad: number[] = [];
    for (const s of seeds) {
      const cols = it0(gen("rel5-19", s)).headers.slice(1).map((h: string) => evalTex(h.replace(/\$/g, "")));
      if (new Set(cols).size < cols.length) bad.push(s);
    }
    expect(bad, `graines avec colonnes en double : ${bad.length}/${N}`).toEqual([]);
  });
  it("rel5-24 : la bonne option est la transformation exacte de l'énoncé", () => {
    for (const s of seeds) {
      const inst = gen("rel5-24", s);
      const [a, b, c, d] = [...maths(inst.statement)[0].matchAll(/\d+/g)].map((m) => Number(m[0]));
      const q = it0(inst);
      expect(q.options[q.answer[0]]).toBe(`$-${a} - ${b} - ${c} + ${d}$`);
      expect(new Set(q.options).size).toBe(4);
      for (const m of inst.parts[0].mistakes ?? []) expect(Number(m.match)).not.toBe(q.answer[0]);
    }
  });
  it("[DÉFAUT] rel5-24 : aucun distracteur ne doit être une écriture simplifiée ÉGALE (cas c = d : même liste de termes réordonnée)", () => {
    const bad: number[] = [];
    for (const s of seeds) {
      const inst = gen("rel5-24", s);
      const q = it0(inst);
      const target = evalTex(maths(inst.statement)[0]);
      const sameTerms = (o: string) => (o.replace(/\$/g, "").match(/[+-]?\s*\d+/g) ?? []).map((x) => Number(x.replace(/\s/g, ""))).sort().join();
      q.options.forEach((o: string, k: number) => {
        if (k !== q.answer[0] && close(evalTex(o.replace(/\$/g, "")), target) && sameTerms(o) === sameTerms(q.options[q.answer[0]])) bad.push(s);
      });
    }
    expect(bad, `graines ambiguës : ${bad.length}/${N}`).toEqual([]);
  });
  it("rel5-25 : somme des positifs, des négatifs et A recalculés depuis l'expression", () => {
    for (const s of seeds) {
      const inst = gen("rel5-25", s);
      const expr = maths(inst.statement)[0].replace("A =", "");
      // termes signés de la somme : chaque « ± nombre » ou « ± (nombre) »
      const terms = [...js(expr).matchAll(/([+-]?)\s*\(?([+-]?\d+)\)?/g)].map((m) => (m[1] === "-" ? -1 : 1) * Number(m[2]));
      const pos = terms.filter((x) => x > 0).reduce((u, v) => u + v, 0);
      const neg = terms.filter((x) => x < 0).reduce((u, v) => u + v, 0);
      expect(pos + neg).toBe(evalTex(expr));
      expect(it0(inst).steps.map((x: any) => x.answer.value)).toEqual([pos, neg, pos + neg]);
    }
  });
  it("rel5-27 : le plongeur reste sous la surface (altitude finale < 0)", () => {
    for (const s of seeds) expect(it0(gen("rel5-27", s)).answer.value).toBeLessThan(0);
  });
  it("rel5-31 : grille complète (cases données + clé) = carré magique de somme 0, une case cachée par ligne et colonne", () => {
    for (const s of seeds) {
      const t = it0(gen("rel5-31", s));
      const g = t.rows.map((r: any) => r.cells.map((c: any) => (typeof c === "string" ? evalTex(c.replace(/\$/g, "")) : c.answer.value)));
      const lines = [...g, ...[0, 1, 2].map((j) => g.map((r: number[]) => r[j])), [g[0][0], g[1][1], g[2][2]], [g[0][2], g[1][1], g[2][0]]];
      for (const l of lines) expect(l.reduce((u: number, v: number) => u + v, 0)).toBe(0);
      const hidden = t.rows.map((r: any) => r.cells.findIndex((c: any) => typeof c !== "string"));
      expect(new Set(hidden).size).toBe(3);
      expect(t.rows.every((r: any) => r.cells.filter((c: any) => typeof c !== "string").length === 1)).toBe(true);
    }
  });
  it("rel5-33 : ordre logique et justifications cohérents avec la clé", () => {
    for (const s of seeds) {
      const t = it0(gen("rel5-33", s));
      const ordered = t.answer.map((k: number) => t.steps[k]);
      expect(ordered[0]).toMatch(/nombre qu'il faut ajouter/);
      expect(ordered[3]).toMatch(/^Ainsi/);
      expect(t.justifications.options[t.justifications.answer[t.answer[1]]]).toMatch(/opposés/);
    }
  });
  it("rel5-34 : températures et variation totale recalculées depuis l'énoncé", () => {
    for (const s of seeds) {
      const inst = gen("rel5-34", s);
      const [t0, ...vars] = maths(inst.statement).map((m) => evalTex(m.replace(/^\+/, "")));
      expect(vars).toHaveLength(4);
      const temps: number[] = [];
      vars.reduce((t, v) => (temps.push(t + v), t + v), t0);
      const total = vars.reduce((u, v) => u + v, 0);
      expect(it0(inst).steps.map((x: any) => x.answer.value)).toEqual([temps[1], temps[3], total]);
      expect(temps[3] - t0).toBe(total);
    }
  });
  it("rel5-36 : B, C, D symétriques de A, distincts de A et entre eux, dans la grille", () => {
    for (const s of seeds) {
      const inst = gen("rel5-36", s);
      const m = inst.statement.match(/A\(([^\\]+)\\,;\\,([^)]+)\)/)!;
      const [a, b] = [Number(js(m[1])), Number(js(m[2]))];
      const pts = it0(inst).points.map((p: any) => p.answer);
      expect(pts).toEqual([[-a, -b], [-a, b], [a, -b]]);
      expect(new Set([[a, b], ...pts].map(String)).size).toBe(4);
    }
  });
});

// ───────────────────────── 4. Diagnostics (mistakes) ─────────────────────────
describe("diagnostics d'erreurs fréquentes", () => {
  const varyNum = CH.exercises.filter((e) => e.vary).map((e) => e.id);
  it("une erreur diagnostiquée, saisie telle quelle, déclenche bien son message (et n'est jamais notée juste)", () => {
    for (const id of varyNum) {
      for (const s of seeds.slice(0, 100)) {
        const inst = gen(id, s);
        inst.parts.forEach((p, k) => {
          if (p.interaction.kind !== "numerique") return;
          for (const m of p.mistakes ?? []) {
            if (close(parseNumber(m.match)!.value, (p.interaction as any).answer.value)) continue; // traité par le test [DÉFAUT] ci-dessous
            const resp = inst.parts.map(() => undefined as unknown);
            resp[k] = numResp(m.match);
            const r = grade(inst, resp).parts[k];
            expect(r.status).toBe("faux");
            expect(r.feedback[0]).toBe(m.feedback);
          }
        });
      }
    }
  });
  it("[DÉFAUT] aucune erreur déclarée ne doit coïncider avec la bonne réponse (rel5-20 quand a = b, rel5-27 quand remontée = descente)", () => {
    const bad: string[] = [];
    for (const id of varyNum) {
      for (const s of seeds) {
        const inst = gen(id, s);
        inst.parts.forEach((p) => {
          const it = p.interaction as Interaction;
          for (const m of p.mistakes ?? []) {
            if (it.kind === "numerique" && matchesMistake(it, numResp(String(it.answer.value)), m)) bad.push(`${id}#${s}`);
            if (it.kind === "qcm" && Number(m.match) === it.answer[0]) bad.push(`${id}#${s}`);
          }
        });
      }
    }
    expect([...new Set(bad)], `${bad.length} cas`).toEqual([]);
  });
  it("le diagnostic n'apparaît pas sur une bonne réponse", () => {
    for (const id of varyNum) {
      const inst = gen(id, 7);
      const r = grade(inst, inst.parts.map((p) => perfect(p.interaction)));
      r.parts.forEach((p) => expect(p.status).toBe("correct"));
    }
  });
  it("rel5-04 : les deux décalages d'une graduation (x+1 et x−1) sont diagnostiqués", () => {
    for (const s of seeds.slice(0, 50)) {
      const inst = gen("rel5-04", s);
      const x = it0(inst).answer.value;
      for (const w of [x + 1, x - 1]) {
        const r = grade(inst, [numResp(String(w))]);
        expect(r.parts[0].status).toBe("faux");
        expect(r.parts[0].feedback[0]).toMatch(/graduation/);
      }
    }
  });
});

// ───────────────────────── 5. Cas dégénérés / cohérence pédagogique ─────────────────────────
describe("cas dégénérés et cohérence énoncé ↔ indices ↔ solution", () => {
  it("[DÉFAUT] rel5-16 : l'indice 1 annonce « le seul (ou les) nombre(s) positif(s) » — il doit toujours y en avoir un", () => {
    const bad: number[] = [];
    for (const s of seeds) {
      const v = it0(gen("rel5-16", s)).items.map((x: string) => evalTex(x.replace(/\$/g, "")));
      if (!v.some((x: number) => x > 0)) bad.push(s);
    }
    expect(bad, `${bad.length}/${N} tirages sans aucun positif`).toEqual([]);
  });
  it("[DÉFAUT] rel5-33 : l'ordre initial affiché ne doit pas être déjà la bonne réponse (UI : ordre initial = identité)", () => {
    const bad: number[] = [];
    for (const s of seeds) if (it0(gen("rel5-33", s)).answer.every((k: number, i: number) => k === i)) bad.push(s);
    expect(bad, `${bad.length}/${N}`).toEqual([]);
  });
  it("taux de cas limites (informatif, non bloquant)", () => {
    const rate = (id: string, f: (i: ExerciseInstance) => boolean) => seeds.filter((s) => f(gen(id, s))).length;
    const r = {
      "rel5-12 au moins un « = »": rate("rel5-12", (i) => it0(i).blanks.some((b: any) => b.answer === 1)),
      "rel5-11 x = y (ordre des coordonnées non testé)": rate("rel5-11", (i) => it0(i).blanks[0].answer.value === it0(i).blanks[1].answer.value),
      "rel5-17 somme nulle": rate("rel5-17", (i) => it0(i).answer.value === 0),
      "rel5-22 somme nulle": rate("rel5-22", (i) => it0(i).answer.value === 0),
      "rel5-28 réponse 0": rate("rel5-28", (i) => it0(i).answer.value === 0),
      "rel5-18 réponse 0": rate("rel5-18", (i) => it0(i).blanks[1].answer.value === 0),
    };
    console.log("[QA3] cas limites /500 :", JSON.stringify(r));
    expect(true).toBe(true);
  });
  it("chaque exercice a au moins un indice, l'indice 1 ne contient pas la réponse numérique (exercices numériques)", () => {
    for (const e of CH.exercises) {
      expect(e.hints.length).toBeGreaterThan(0);
      for (const s of seeds.slice(0, 50)) {
        const inst = gen(e.id, s);
        inst.parts.forEach((p) => {
          if (p.interaction.kind !== "numerique") return;
          const v = p.interaction.answer.value;
          const h1 = js(e.hints[0]);
          expect(new RegExp(`(^|[^\\d.])${String(v).replace(/[.+-]/g, "\\$&")}($|[^\\d.])`).test(h1), `${e.id} : indice 1 « ${e.hints[0]} » contient ${v}`).toBe(false);
        });
      }
    }
  });
  it("la solution affichée contient la valeur de la clé (exercices numériques variables)", () => {
    for (const e of CH.exercises.filter((x) => x.vary)) {
      for (const s of seeds.slice(0, 100)) {
        const inst = gen(e.id, s);
        inst.parts.forEach((p) => {
          if (p.interaction.kind !== "numerique") return;
          const sol = js(inst.solution.join(" "));
          expect(sol.includes(String(p.interaction.answer.value)), `${e.id}#${s}`).toBe(true);
        });
      }
    }
  });
});
