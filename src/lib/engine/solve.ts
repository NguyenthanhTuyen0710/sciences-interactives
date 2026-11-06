// Construit la réponse parfaite d'une interaction à partir de sa clé de correction (tests, données de démonstration).
import type { Interaction } from "./types";
import { fr, simplify } from "./numbers";

/** Construit la réponse parfaite d'une interaction (à partir de la clé de correction). */
export function perfect(it: Interaction): unknown {
  const num = (a: { value: number; fraction?: [number, number]; sigFigs?: number; unit?: { base: string } }) =>
    a.fraction ? simplify(a.fraction[0], a.fraction[1]).join("/") : a.sigFigs ? Number(a.value.toPrecision(a.sigFigs)).toPrecision(a.sigFigs).replace(".", ",") : fr(a.value, 10).replace(/ /g, "").replace("−", "-");
  switch (it.kind) {
    case "qcm": return it.answer;
    case "vrai-faux": return it.answer;
    case "numerique": return { value: num(it.answer), unit: it.answer.unit?.base };
    case "expression": return it.primitive ? "x" : it.answer; // primitive : traité à part
    case "texte-libre": return it.answer[0];
    case "texte-trous": return it.blanks.map((b) => (b.type === "select" ? String(b.answer) : b.type === "text" ? b.answer[0] : num(b.answer)));
    case "glisser-deposer": case "associer": case "classer": case "ordonner": return it.answer;
    case "repere": return it.points.map((p) => p.answer);
    case "tableau": {
      const o: Record<string, string> = {};
      it.rows.forEach((r, ri) => r.cells.forEach((c, ci) => { if (typeof c !== "string") o[`${ri}-${ci}`] = num(c.answer); }));
      return o;
    }
    case "etapes": return it.steps.map((s) => num(s.answer));
    case "demonstration": return { order: it.answer, justifs: it.justifications.answer };
  }
}

