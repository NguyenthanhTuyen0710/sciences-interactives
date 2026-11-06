// Moteur de correction : une fonction pure par type d'interaction.
import type { CheckResult, ExerciseInstance, Interaction, NumAnswer, PartResult } from "./types";
import { fr, fracTex, frFixed, gcd, nearlyEqual, parseNumber, roundSig, sciTex, simplify } from "./numbers";
import { convert } from "./units";
import { equivalent, isReducedPolynomial, normalizeExpr, safeParse, usesUnknownSymbols } from "./expr";
import { derivative, simplify as mjsSimplify } from "mathjs";

type NumCheck = { ok: boolean; partial: boolean; feedback: string[] };

export function expectedNum(a: NumAnswer): string {
  if (a.fraction) {
    const [n, d] = simplify(a.fraction[0], a.fraction[1]);
    return d === 1 ? `$${n}$` : `$${fracTex(n, d)}$`;
  }
  let v: string;
  if (a.sigFigs) {
    const p = Math.floor(Math.log10(Math.abs(a.value) || 1));
    v = p < -2 || p > 4 ? `$${sciTex(a.value, a.sigFigs)}$` : frFixed(roundSig(a.value, a.sigFigs), Math.max(0, a.sigFigs - 1 - p));
  } else if (a.decimals !== undefined) v = frFixed(a.value, a.decimals);
  else v = fr(a.value);
  return v + (a.unit ? ` ${a.unit.base}` : "");
}

const normText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export function checkNumber(raw: unknown, unitSel: unknown, a: NumAnswer): NumCheck {
  const fb: string[] = [];
  const p = parseNumber(String(raw ?? ""));
  if (!p) {
    return {
      ok: false,
      partial: false,
      feedback: [String(raw ?? "").trim() ? "Saisie non reconnue comme un nombre (exemples : 3,5 ; -2 ; 7/4 ; 2,1×10^3)." : "Aucune réponse saisie."],
    };
  }
  let v = p.value;
  if (a.unit) {
    const u = String(unitSel ?? "");
    if (!u) return { ok: false, partial: false, feedback: ["Précisez l'unité de votre résultat."] };
    const c = convert(v, u, a.unit.base);
    if (c === null) return { ok: false, partial: false, feedback: [`L'unité « ${u} » ne correspond pas à la grandeur demandée.`] };
    // valeur juste mais unité incohérente ?
    if (!nearlyEqual(c, a.value, a.tol ?? 0, 1e-3)) {
      for (const other of a.unit.choices) {
        const c2 = convert(v, other, a.unit.base);
        if (other !== u && c2 !== null && nearlyEqual(c2, a.value, a.tol ?? 0, 1e-3)) {
          fb.push(`Votre valeur serait correcte en ${other}, pas en ${u} : vérifiez l'unité ou la conversion.`);
          break;
        }
      }
    }
    v = c;
  }
  const exp = a.fraction ? a.fraction[0] / a.fraction[1] : a.value;
  // tolérance : exacte, absolue (arrondi) ou relative (chiffres significatifs, ±0,5 sur le dernier chiffre)
  let tolAbs = a.tol ?? 0;
  if (a.sigFigs && !a.tol) tolAbs = 0.5 * 10 ** (Math.floor(Math.log10(Math.abs(exp) || 1)) - a.sigFigs + 1) * 1.0001;
  const ok = nearlyEqual(v, exp, tolAbs);
  if (ok) {
    if (a.fraction && p.isFraction && p.num !== undefined && Number.isInteger(p.num) && Number.isInteger(p.den!) && gcd(p.num, p.den!) > 1) {
      return { ok: false, partial: true, feedback: ["Valeur juste, mais la fraction n'est pas irréductible : simplifiez-la."] };
    }
    if (a.sigFigs && !p.isFraction && p.sigFigs !== a.sigFigs) {
      return {
        ok: false,
        partial: true,
        feedback: [`Valeur juste, mais le résultat doit comporter ${a.sigFigs} chiffres significatifs (votre réponse en a ${p.sigFigs}).`],
      };
    }
    return { ok: true, partial: false, feedback: fb };
  }
  // Diagnostics d'erreurs fréquentes
  if (a.sigFigs && !p.isFraction && p.sigFigs !== a.sigFigs) {
    const tolUser = 0.5 * 10 ** (Math.floor(Math.log10(Math.abs(exp) || 1)) - p.sigFigs + 1) * 1.0001;
    if (nearlyEqual(v, exp, tolUser))
      return { ok: false, partial: true, feedback: [`Valeur correcte à l'arrondi près, mais le résultat doit comporter ${a.sigFigs} chiffres significatifs (votre réponse en a ${p.sigFigs}).`] };
  }
  if (a.fraction && nearlyEqual(v, exp, 0.01 * Math.abs(exp) + 0.005)) {
    fb.push("Ceci est une valeur approchée : on attend la valeur exacte (fraction irréductible ou décimal exact).");
  } else if (exp !== 0 && nearlyEqual(v, -exp, tolAbs)) {
    fb.push("Attention au signe !");
  } else if (exp !== 0 && v !== 0) {
    const r = Math.log10(Math.abs(v / exp));
    if (Math.abs(r - Math.round(r)) < 1e-6 && Math.round(r) !== 0)
      fb.push(`Votre résultat est ${Math.round(r) > 0 ? "10^" + Math.round(r) + " fois trop grand" : "10^" + -Math.round(r) + " fois trop petit"} : vérifiez les conversions et les puissances de 10.`);
    else if (a.tol && nearlyEqual(v, exp, 10 * a.tol))
      fb.push(`Presque : vérifiez l'arrondi${a.roundingLabel ? " (" + a.roundingLabel + ")" : ""}.`);
  }
  return { ok: false, partial: false, feedback: fb };
}

function result(details: boolean[], expected: string, feedback: string[] = [], allOrNothing = false): PartResult {
  const n = details.filter(Boolean).length;
  const score = details.length ? n / details.length : 0;
  const status = n === details.length && details.length > 0 ? "correct" : n > 0 && !allOrNothing ? "partiel" : "faux";
  return { status, score: allOrNothing ? (status === "correct" ? 1 : 0) : score, feedback, details, expected };
}

const arr = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);

function texOf(e: string) {
  try {
    return mjsSimplify(normalizeExpr(e)).toTex({ implicit: "hide" }).replace(/\\cdot/g, "\\,");
  } catch {
    return e;
  }
}

export function checkPart(it: Interaction, r: unknown): PartResult {
  switch (it.kind) {
    case "qcm": {
      const sel = new Set(arr<number>(r).map(Number));
      const exp = new Set(it.answer);
      const ok = sel.size === exp.size && [...exp].every((i) => sel.has(i));
      const fb: string[] = [];
      if (!ok && it.multiple && [...sel].every((i) => exp.has(i)) && sel.size > 0) fb.push("Il manque au moins une bonne réponse.");
      return result([ok], it.answer.map((i) => it.options[i]).join(" ; "), fb, true);
    }
    case "vrai-faux": {
      const resp = arr<boolean | null>(r);
      const d = it.answer.map((a, i) => resp[i] === a);
      return result(d, it.answer.map((a, i) => `${i + 1}. ${a ? "Vrai" : "Faux"}`).join(" — "));
    }
    case "numerique": {
      const o = (r ?? {}) as { value?: string; unit?: string };
      const c = checkNumber(o.value, o.unit, it.answer);
      return { status: c.ok ? "correct" : c.partial ? "partiel" : "faux", score: c.ok ? 1 : c.partial ? 0.5 : 0, feedback: c.feedback, details: [c.ok], expected: expectedNum(it.answer) };
    }
    case "expression": {
      const s = String(r ?? "");
      const fb: string[] = [];
      let ok = false;
      let partial = false;
      if (!s.trim()) fb.push("Aucune réponse saisie.");
      else if (!safeParse(s)) fb.push("Expression mal écrite (vérifiez les parenthèses et les opérations).");
      else {
        const unk = usesUnknownSymbols(s, it.variable);
        if (unk.length) fb.push(`Symbole(s) inattendu(s) : ${unk.join(", ")}. La variable est ${it.variable}.`);
        else if (it.primitive) {
          let d: string | null = null;
          try {
            d = derivative(normalizeExpr(s), it.variable).toString();
          } catch {
            d = null;
          }
          if (d && equivalent(d, it.answer, it.variable)) ok = true;
          else fb.push("La dérivée de votre expression n'est pas égale à la fonction donnée : ce n'est pas une primitive.");
        } else if (equivalent(s, it.answer, it.variable)) {
          if (it.form && !isReducedPolynomial(s, it.variable)) {
            partial = true;
            fb.push(it.form === "reduite" ? "Votre expression est égale à la bonne réponse, mais elle n'est pas réduite." : "Votre expression est égale à la bonne réponse, mais elle n'est pas développée et réduite.");
          } else ok = true;
        } else fb.push("Cette expression n'est pas égale à la bonne réponse (testée pour plusieurs valeurs de " + it.variable + ").");
      }
      return { status: ok ? "correct" : partial ? "partiel" : "faux", score: ok ? 1 : partial ? 0.5 : 0, feedback: fb, details: [ok], expected: (it.primitive ? "une primitive de " : "") + (it.display ? `$${it.display}$` : `$${texOf(it.answer)}$`) };
    }
    case "texte-libre": {
      const ok = it.answer.map(normText).includes(normText(String(r ?? "")));
      return result([ok], it.answer[0], [], true);
    }
    case "texte-trous": {
      const resp = arr<string>(r);
      const fb: string[] = [];
      const d = it.blanks.map((b, i) => {
        if (b.type === "select") return Number(resp[i]) === b.answer && resp[i] !== "" && resp[i] != null;
        if (b.type === "text") return b.answer.map(normText).includes(normText(String(resp[i] ?? "")));
        const c = checkNumber(resp[i], undefined, b.answer);
        c.feedback.forEach((f) => fb.includes(f) || fb.push(`Trou ${i + 1} : ${f}`));
        return c.ok;
      });
      if (it.proportional && d.some((x) => !x)) {
        const nums = it.blanks.map((b, i) => (b.type === "number" ? [parseNumber(String(resp[i] ?? ""))?.value ?? NaN, b.answer.value] : [NaN, NaN]));
        const k = nums[0][0] / nums[0][1];
        if (Number.isFinite(k) && k > 0 && nums.every(([u, a]) => Number.isInteger(u) && nearlyEqual(u / a, k))) {
          const exp0 = it.blanks.map((b) => (b.type === "number" ? expectedNum(b.answer) : "")).join(" ; ");
          return { status: "partiel", score: 0.5, details: d, expected: exp0, feedback: ["L'équation est bien équilibrée, mais on attend les plus petits nombres entiers possibles."] };
        }
      }
      const exp = it.blanks.map((b, i) => `(${i + 1}) ${b.type === "select" ? b.options[b.answer] : b.type === "text" ? b.answer[0] : expectedNum(b.answer)}`).join("  ");
      return result(d, exp, fb);
    }
    case "glisser-deposer": {
      const resp = arr<number | null>(r);
      const d = it.answer.map((a, i) => resp[i] === a);
      return result(d, it.zones.map((z, i) => `${z} → ${it.tokens[it.answer[i]]}`).join(" ; "));
    }
    case "associer": {
      const resp = arr<number | null>(r);
      const d = it.answer.map((a, i) => resp[i] === a);
      return result(d, it.left.map((l, i) => `${l} ↔ ${it.right[it.answer[i]]}`).join(" ; "));
    }
    case "classer": {
      const resp = arr<number | null>(r);
      const d = it.answer.map((a, i) => resp[i] === a);
      return result(d, it.categories.map((c, ci) => `${c} : ${it.items.filter((_, i) => it.answer[i] === ci).join(", ")}`).join(" | "));
    }
    case "ordonner": {
      const resp = arr<number>(r);
      const d = it.answer.map((a, i) => resp[i] === a);
      return result(d, it.answer.map((i) => it.items[i]).join("  →  "), [], false);
    }
    case "repere": {
      const resp = arr<[number, number] | null>(r);
      const d = it.points.map((p, i) => {
        const q = resp[i];
        return !!q && Math.abs(q[0] - p.answer[0]) < it.step / 2 && Math.abs(q[1] - p.answer[1]) < it.step / 2;
      });
      return result(d, it.points.map((p) => `$${p.label}(${fr(p.answer[0]).replace(",", "{,}")}\\,;\\,${fr(p.answer[1]).replace(",", "{,}")})$`).join(" ; ").replace(/−/g, "-"));
    }
    case "tableau": {
      const resp = (r ?? {}) as Record<string, string>;
      const d: boolean[] = [];
      const exp: string[] = [];
      const fb: string[] = [];
      it.rows.forEach((row, ri) =>
        row.cells.forEach((c, ci) => {
          if (typeof c === "string") return;
          const res = checkNumber(resp[`${ri}-${ci}`], undefined, c.answer);
          d.push(res.ok);
          exp.push(expectedNum(c.answer));
          res.feedback.forEach((f) => fb.includes(f) || fb.push(f));
        }),
      );
      return result(d, exp.join(" ; "), fb.slice(0, 2));
    }
    case "etapes": {
      const resp = arr<string>(r);
      const fb: string[] = [];
      const d = it.steps.map((s, i) => {
        const c = checkNumber(resp[i], undefined, s.answer);
        if (!c.ok) fb.push(`Étape ${i + 1} : ${c.feedback[0] ?? "valeur incorrecte."}`);
        return c.ok;
      });
      return result(d, it.steps.map((s, i) => `Étape ${i + 1} : ${expectedNum(s.answer)}`).join(" ; "), fb);
    }
    case "demonstration": {
      const o = (r ?? {}) as { order?: number[]; justifs?: (number | null)[] };
      const order = arr<number>(o.order);
      const just = arr<number | null>(o.justifs);
      const dOrder = it.answer.map((a, i) => order[i] === a);
      const dJust = it.steps.map((_, i) => just[i] === it.justifications.answer[i]);
      const fb: string[] = [];
      if (dOrder.some((x) => !x)) fb.push("L'enchaînement des étapes n'est pas logique.");
      if (dJust.some((x) => !x)) fb.push("Certaines justifications (propriétés utilisées) sont incorrectes.");
      return result([...dOrder, ...dJust], it.answer.map((i) => `${it.steps[i]} [${it.justifications.options[it.justifications.answer[i]]}]`).join("  →  "), fb);
    }
  }
}

export function checkExercise(inst: ExerciseInstance, responses: unknown[]): CheckResult {
  const parts = inst.parts.map((p, i) => checkPart(p.interaction, responses?.[i]));
  const score = parts.reduce((s, p) => s + p.score, 0) / Math.max(1, parts.length);
  return { parts, score, solution: inst.solution, rappel: inst.rappel };
}
