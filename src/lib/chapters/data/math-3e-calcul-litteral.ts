// SCI-3E-MATH-003 — Mathématiques 3e : Calcul littéral (programme du cycle 4 de 2020, BO n° 31 du 30 juillet 2020,
// « Utiliser le calcul littéral » ; attendus de fin de 3e et repères annuels, BO n° 22 du 29 mai 2019).
// Contenu original. Seule identité exigible : a² − b² = (a − b)(a + b). Les identités (a ± b)² ne sont pas utilisées.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Blank, Mistake, Rng } from "../../engine/types";
import { gcd, parseNumber, tex } from "../../engine/numbers";
import { erreursConfig, flashConfig } from "../../games/logic";

// <pipeline:meta> générée par pipeline/run.ts depuis la fiche et l'inventaire — ne pas modifier à la main
const META = {
  "id": "math-3e-calcul-litteral",
  "taskId": "SCI-3E-MATH-003",
  "grade": "3e",
  "subject": "mathematiques",
  "treeChapterId": "m3-calcul-litteral",
  "curriculumChapterIds": [
    "math-3e-calcul-litteral",
    "math-4e-calcul-litteral"
  ],
  "curriculumVersion": "2026-2027",
  "title": "Calcul littéral : développer, factoriser, identités",
  "officialObjectives": [
    {
      "id": "M3-NC-08",
      "text": "Déterminer l'opposé d'une expression littérale.",
      "source": "Attendus de fin d'année de 3e (2019) › Utiliser le calcul littéral"
    },
    {
      "id": "M3-NC-09",
      "text": "Développer avec la double distributivité, factoriser et réduire des expressions simples.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Distributivité (3e) ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M3-NC-10",
      "text": "Factoriser a²−b² et développer (a+b)(a−b).",
      "source": "Programme cycle 4 2020 (BO n°31 du 30-07-2020) › Thème A › Utiliser le calcul littéral ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M3-NC-11",
      "text": "Utiliser le calcul littéral pour démontrer un résultat général ou réfuter une conjecture.",
      "source": "Programme cycle 4 2020 (BO n°31 du 30-07-2020) › Thème A › Utiliser le calcul littéral"
    },
    {
      "id": "M4-NC-16",
      "text": "Identifier la structure d'une expression littérale (somme, produit).",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Calcul littéral (4e) ; Attendus de fin d'année de 4e (2019) (consolidation)",
      "required": false
    },
    {
      "id": "M4-NC-17",
      "text": "Développer, factoriser et réduire avec la distributivité simple.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Distributivité (4e) ; Attendus de fin d'année de 4e (2019) (consolidation)",
      "required": false
    },
    {
      "id": "M4-NC-18",
      "text": "Démontrer l'équivalence de deux programmes de calcul ; notion d'identité.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Expressions littérales (4e) ; Attendus de fin d'année de 4e (2019) (consolidation)",
      "required": false
    }
  ],
  "sources": [
    {
      "id": "c4-programme-2020-eduscol-pdf",
      "title": "Programme du cycle 4 en vigueur à la rentrée 2020 (d'après le BOEN n° 31 du 30 juillet 2020), Éduscol",
      "url": "https://eduscol.education.gouv.fr/sites/default/files/document/programme-d-enseignement-du-cycle-4-67722.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "de42e9816d7d012fd5d6b3349171cf43dd038c1e50fa0fe9e664bcc8521194b9",
      "accessedAt": "2026-11-07T14:49:44.189Z"
    },
    {
      "id": "c4-attendus-3e-2019-pdf",
      "title": "Mathématiques 3e — attendus de fin d'année (2019), Éduscol",
      "url": "https://eduscol.education.gouv.fr/sites/default/files/document/18-maths-3e-attendus-eduscol1114748pdf-74688.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "49ccdca4d97ba4cf25875dfc731474e84d0332985c15396d3abfb9107f5f545a",
      "accessedAt": "2026-11-07T14:50:10.048Z"
    },
    {
      "id": "bo-2019-22-pdf",
      "title": "Bulletin officiel n° 22 du 29 mai 2019 — repères annuels de progression et attendus de fin d'année (note de service n° 2019-072, NOR MENE1913283N), annexe 26 : mathématiques cycle 4",
      "url": "https://www.education.gouv.fr/sites/default/files/document/BO_22_MENJ_1132537.pdf-231744.pdf",
      "kind": "official",
      "verification": "verified",
      "sha256": "59c3cdd34dc2fbfb05573d913b695eae1bc98eea1c0eb51580cbb4ad42f36065",
      "accessedAt": "2026-11-07T15:03:14.705Z"
    }
  ],
  "reviewStatus": {
    "curriculum": "pending",
    "accuracy": "pending",
    "exercises": "pending",
    "games": "pending",
    "technical": "pending",
    "language": "pending"
  },
  "publicationStatus": "draft"
} satisfies Partial<import("../schema").ChapterContent>;
// </pipeline:meta>


const T = (x: number) => tex(x);

/** Écriture LaTeX d'un polynôme en x : coefficients du plus haut degré au terme constant. */
function poly(cs: number[], v = "x"): string {
  const n = cs.length - 1;
  let s = "";
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = n - i, a = Math.abs(c);
    const body = p === 0 ? `${a}` : `${a === 1 ? "" : a}${v}${p > 1 ? `^{${p}}` : ""}`;
    s += s === "" ? (c < 0 ? `-${body}` : body) : c < 0 ? ` - ${body}` : ` + ${body}`;
  });
  return s || "0";
}
const lin = (a: number, b: number) => poly([a, b]);
const quad = (a: number, b: number, c: number) => poly([a, b, c]);
const sgnInt = (rng: Rng, lo: number, hi: number) => rng.sign() * rng.int(lo, hi);

const nb = (value: number): Blank => ({ type: "number", answer: { value } });
const sel = (options: string[], answer: number): Blank => ({ type: "select", options, answer });
const tt = (template: string, blanks: Blank[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "texte-trous", template, blanks } });
const num = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } }, mistakes: mistakes.filter((m) => parseNumber(m.match)?.value !== value) });
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const vf = (items: string[], answer: boolean[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "vrai-faux", items, answer } });
const steps = (list: [string, number][], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "etapes", steps: list.map(([p, v]) => ({ prompt: p, answer: { value: v } })) } });
/** Étapes dans le désordre : `lines` est l'ordre correct, `perm` donne l'ordre d'affichage. */
function orderPart(lines: string[], items: string[], hint = "Première étape en haut"): ChapterPart {
  return { interaction: { kind: "ordonner", items, answer: lines.map((l) => items.indexOf(l)), hint } };
}
function shuffledOrder(rng: Rng, lines: string[]): ChapterPart {
  let items = rng.shuffle(lines);
  while (items.every((x, i) => x === lines[i])) items = rng.shuffle(lines);
  return orderPart(lines, items);
}

const O = {
  "M3-NC-08": "Déterminer l'opposé d'une expression littérale.",
  "M3-NC-09": "Développer avec la double distributivité, factoriser et réduire des expressions simples.",
  "M3-NC-10": "Factoriser a²−b² et développer (a+b)(a−b).",
  "M3-NC-11": "Utiliser le calcul littéral pour démontrer un résultat général ou réfuter une conjecture.",
  "M4-NC-16": "Identifier la structure d'une expression littérale (somme, produit).",
  "M4-NC-17": "Développer, factoriser et réduire avec la distributivité simple.",
  "M4-NC-18": "Démontrer l'équivalence de deux programmes de calcul ; notion d'identité.",
} as const;
type Obj = keyof typeof O;
type TT = "CL-T01" | "CL-T02" | "CL-T03" | "CL-T04" | "CL-T05" | "CL-T06" | "CL-T07" | "CL-T08" | "CL-T09";
const ex = (e: Omit<ChapterExercise, "objectives" | "taxonomyTypes"> & { objectives: Obj[]; taxonomyTypes: TT[] }): ChapterExercise => e;

// ───────────────────────── Exercices ─────────────────────────
const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 ──
  ex({
    id: "cl3-01", title: "Somme ou produit ?", niveau: 1, objectives: ["M4-NC-16"], taxonomyTypes: ["CL-T01"], time: 90,
    statement: "Pour chaque expression, regarde la **dernière opération** à effectuer : en fait-elle une somme (ou différence) ou un produit ?",
    parts: [{ interaction: { kind: "classer", categories: ["Somme ou différence", "Produit"], items: ["$3x + 5$", "$3(x + 5)$", "$x(x - 4)$", "$2x^{2} - 7$", "$(x + 1)(x + 2)$", "$5x - 2(x + 1)$"], answer: [0, 1, 1, 0, 1, 0] } }],
    solution: ["$3x + 5$ : on additionne $3x$ et $5$ en dernier, c'est une somme.", "$3(x + 5)$, $x(x - 4)$ et $(x + 1)(x + 2)$ : la dernière opération est une multiplication, ce sont des produits.", "$2x^{2} - 7$ et $5x - 2(x + 1)$ : la dernière opération est une soustraction ; dans le second cas, $2(x + 1)$ est lui-même un produit, mais ce n'est pas la dernière opération."],
    reasoning: "La structure d'une expression dépend de la dernière opération effectuée en respectant les priorités : elle décide de la méthode (développer un produit, factoriser une somme).",
    hints: ["Rappelle-toi les priorités : la multiplication se fait avant l'addition et la soustraction.", "Une expression de la forme (…)(…) ou k(…) est un produit."],
  }),
  ex({
    id: "cl3-02", title: "L'opposé d'une somme", niveau: 1, objectives: ["M3-NC-08"], taxonomyTypes: ["CL-T02"], time: 90,
    vary: (rng) => {
      const a = sgnInt(rng, 1, 9), b = sgnInt(rng, 1, 9), e = lin(a, b);
      return {
        statement: `Détermine l'opposé de l'expression $${e}$ et écris-le sans parenthèses sous la forme $px + q$.`,
        parts: [tt(`Opposé de $${e}$ : [[0]] $x$ + [[1]]`, [nb(-a), nb(-b)])],
        solution: [`L'opposé de $${e}$ est $-(${e})$.`, `Le signe $-$ change le signe de **chaque** terme : le coefficient de $x$ devient $${-a}$ et le terme constant devient $${-b}$.`, `$-(${e}) = ${lin(-a, -b)}$.`],
      };
    },
    reasoning: "L'opposé d'une expression est ce qu'on ajoute à l'expression pour obtenir $0$ : il s'obtient en changeant le signe de chaque terme.",
    hints: ["Écris l'opposé avec le signe $-$ devant une parenthèse.", "Change le signe du terme en $x$ **et** celui du terme constant."],
  }),
  ex({
    id: "cl3-03", title: "Quel est l'opposé ?", niveau: 1, objectives: ["M3-NC-08"], taxonomyTypes: ["CL-T02"], time: 90,
    vary: (rng) => {
      const p = rng.int(2, 9), q = rng.int(1, 9);
      return {
        statement: `Quelle expression est l'opposé de $${lin(p, -q)}$ ?`,
        parts: [shuffledQcm(rng, [`$${lin(-p, q)}$`, `$${lin(-p, -q)}$`, `$${lin(p, q)}$`, `$${lin(p, -q)}$`], 0, {
          1: `Tu as changé le signe de $${p}x$ mais pas celui de $-${q}$ : $-(-${q}) = +${q}$.`,
          2: `Tu as changé seulement le signe du terme constant ; il faut aussi changer celui de $${p}x$.`,
          3: "C'est l'expression de départ : son opposé s'en déduit en changeant tous les signes.",
        })],
        solution: [`$-(${lin(p, -q)}) = -${p}x - (-${q}) = -${p}x + ${q}$.`, `L'opposé est $${lin(-p, q)}$ : les deux termes ont changé de signe.`],
      };
    },
    reasoning: "Pour vérifier : la somme d'une expression et de son opposé doit valoir $0$.",
    hints: ["Change le signe de chaque terme.", "Vérifie : la somme des deux expressions doit donner $0$."],
  }),
  ex({
    id: "cl3-04", title: "Distribuer un facteur", niveau: 1, objectives: ["M4-NC-17"], taxonomyTypes: ["CL-T03"], time: 90,
    vary: (rng) => {
      const k = sgnInt(rng, 2, 9), a = rng.int(1, 5), b = sgnInt(rng, 1, 9), e = lin(a, b);
      return {
        statement: `Développe et réduis $${k}(${e})$ sous la forme $px + q$.`,
        parts: [tt("[[0]] $x$ + [[1]]", [nb(k * a), nb(k * b)])],
        solution: [`$${k}(${e}) = ${k} \\times ${a === 1 ? "x" : `${a}x`} + (${k}) \\times (${b})$.`, `$= ${lin(k * a, k * b)}$.`],
      };
    },
    reasoning: "La distributivité simple : $k(A + B) = kA + kB$. Le facteur multiplie chaque terme de la parenthèse, signe compris.",
    hints: ["Multiplie le facteur par chaque terme de la parenthèse.", "Attention aux signes quand le facteur ou le terme est négatif."],
  }),
  ex({
    id: "cl3-05", title: "Calcul mental avec la distributivité", niveau: 1, objectives: ["M4-NC-17"], taxonomyTypes: ["CL-T03"], time: 90,
    vary: (rng) => {
      const k = rng.int(3, 9), s = rng.sign(), e = rng.int(1, 3), m = 100 + s * e;
      return {
        statement: `Calcule $${k} \\times ${m}$ de tête en écrivant $${m} = 100 ${s > 0 ? "+" : "-"} ${e}$ et en utilisant la distributivité.`,
        parts: [num(k * m, [{ match: String(k * 100 + s * e), feedback: `Tu n'as multiplié que $100$ par $${k}$ : il faut aussi multiplier $${e}$ par $${k}$.` }])],
        solution: [`$${k} \\times ${m} = ${k} \\times (100 ${s > 0 ? "+" : "-"} ${e}) = ${k * 100} ${s > 0 ? "+" : "-"} ${k * e}$.`, `Résultat : $${k * m}$.`],
      };
    },
    reasoning: "On décompose un des facteurs pour se ramener à des multiplications simples : c'est la distributivité appliquée à des nombres.",
    hints: ["Remplace le second facteur par la somme (ou différence) proposée.", "Multiplie chaque terme de la parenthèse par le premier facteur."],
  }),
  // ── Niveau 2 ──
  ex({
    id: "cl3-06", title: "Compter les termes et les facteurs", niveau: 2, objectives: ["M4-NC-16"], taxonomyTypes: ["CL-T01"], time: 120,
    statement: "Complète chaque phrase.",
    parts: [tt("$4x^{2} - 3x + 7$ est une somme de [[0]] termes.\n$(x + 3)(x - 1)(2x + 5)$ est un produit de [[1]] facteurs.\n$5x - 2(x + 1)$ est la différence de [[2]] termes ; son second terme est un [[3]].", [nb(3), nb(3), nb(2), sel(["somme", "produit"], 1)])],
    solution: ["$4x^{2}$, $-3x$ et $7$ : trois termes.", "$(x + 3)$, $(x - 1)$ et $(2x + 5)$ : trois facteurs.", "$5x$ et $2(x + 1)$ : deux termes ; le second, $2(x+1)$, est un produit."],
    reasoning: "Les termes sont séparés par des $+$ ou des $-$ qui ne sont pas à l'intérieur d'une parenthèse ; les facteurs sont séparés par des multiplications.",
    hints: ["Ne regarde pas à l'intérieur des parenthèses pour compter les termes de l'expression complète.", "Un facteur peut lui-même être une somme entre parenthèses."],
  }),
  ex({
    id: "cl3-07", title: "Soustraire une expression", niveau: 2, objectives: ["M3-NC-08"], taxonomyTypes: ["CL-T02"], time: 120,
    vary: (rng) => {
      let a = 0, c = 0;
      do { a = sgnInt(rng, 1, 9); c = sgnInt(rng, 1, 9); } while (a === c);
      const b = sgnInt(rng, 1, 9), d = sgnInt(rng, 1, 9);
      return {
        statement: `Écris $(${lin(a, b)}) - (${lin(c, d)})$ sans parenthèses, puis réduis-le sous la forme $px + q$.`,
        parts: [tt("[[0]] $x$ + [[1]]", [nb(a - c), nb(b - d)])],
        solution: [`Soustraire $(${lin(c, d)})$, c'est ajouter son opposé $${lin(-c, -d)}$.`, `$(${lin(a, b)}) - (${lin(c, d)}) = ${lin(a, b)} + (${lin(-c, -d)})$.`, `On regroupe : $(${a} - (${c}))x + (${b} - (${d})) = ${lin(a - c, b - d)}$.`],
      };
    },
    reasoning: "Un signe $-$ devant une parenthèse change le signe de chaque terme qu'elle contient.",
    hints: ["Supprime la parenthèse précédée du signe $-$ en changeant le signe de chaque terme.", "Regroupe ensuite les termes en $x$ et les termes constants."],
  }),
  ex({
    id: "cl3-08", title: "Supprimer une parenthèse précédée d'un moins", niveau: 2, objectives: ["M3-NC-08"], taxonomyTypes: ["CL-T02"], time: 120,
    vary: (rng) => {
      const a = rng.int(4, 9), c = rng.int(1, 3), d = rng.int(1, 9);
      return {
        statement: `Quelle est la forme réduite de $${a}x - (${lin(c, -d)})$ ?`,
        parts: [shuffledQcm(rng, [`$${lin(a - c, d)}$`, `$${lin(a - c, -d)}$`, `$${lin(a + c, d)}$`, `$${lin(a + c, -d)}$`], 0, {
          1: `Le signe $-$ n'a pas été appliqué au terme constant : $-(-${d}) = +${d}$.`,
          2: `Le signe $-$ n'a pas été appliqué à $${c}x$ : $${a}x - ${c}x = ${a - c}x$.`,
          3: "Le signe $-$ n'a été appliqué à aucun terme de la parenthèse.",
        })],
        solution: [`$${a}x - (${lin(c, -d)}) = ${a}x - ${c === 1 ? "" : c}x + ${d}$.`, `$= ${lin(a - c, d)}$.`],
      };
    },
    reasoning: "Le signe $-$ devant la parenthèse s'applique à tous ses termes.",
    hints: ["Supprime la parenthèse en changeant le signe de chacun de ses termes.", "Réduis ensuite les termes en $x$."],
  }),
  ex({
    id: "cl3-09", title: "Double distributivité (signes positifs)", niveau: 2, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T04"], time: 120,
    vary: (rng) => {
      const p = rng.int(1, 9), q = rng.int(1, 9);
      return {
        statement: `Développe et réduis $(x + ${p})(x + ${q})$, puis complète : $x^{2} + \\dots x + \\dots$`,
        parts: [tt("$x^{2}$ + [[0]] $x$ + [[1]]", [nb(p + q), nb(p * q)])],
        solution: [`$(x + ${p})(x + ${q}) = x \\times x + x \\times ${q} + ${p} \\times x + ${p} \\times ${q}$.`, `$= x^{2} + ${q}x + ${p}x + ${p * q} = x^{2} + ${p + q}x + ${p * q}$.`],
      };
    },
    reasoning: "Double distributivité : $(a + b)(c + d) = ac + ad + bc + bd$ ; chaque terme du premier facteur multiplie chaque terme du second (quatre produits).",
    hints: ["Écris les quatre produits sans rien oublier.", "Réduis les deux termes en $x$ à la fin."],
  }),
  ex({
    id: "cl3-10", title: "Double distributivité (avec des signes moins)", niveau: 2, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T04"], time: 150,
    vary: (rng) => {
      let p = 0, q = 0;
      do { p = sgnInt(rng, 1, 9); q = sgnInt(rng, 1, 9); } while (p > 0 && q > 0);
      return {
        statement: `Développe et réduis $(${lin(1, p)})(${lin(1, q)})$, puis complète : $x^{2} + \\dots x + \\dots$`,
        parts: [tt("$x^{2}$ + [[0]] $x$ + [[1]]", [nb(p + q), nb(p * q)])],
        solution: [`$(${lin(1, p)})(${lin(1, q)}) = x^{2} + (${q})x + (${p})x + (${p}) \\times (${q})$.`, `Coefficient de $x$ : $${q} + (${p}) = ${p + q}$ ; terme constant : $(${p}) \\times (${q}) = ${p * q}$.`, `Résultat : $${quad(1, p + q, p * q)}$.`],
      };
    },
    reasoning: "Les signes des termes font partie des termes : $-3$ est multiplié comme un nombre négatif (règle des signes).",
    hints: ["Entoure chaque terme avec son signe avant de multiplier.", "Règle des signes : $(-) \\times (-) = (+)$ et $(-) \\times (+) = (-)$."],
  }),
  ex({
    id: "cl3-11", title: "Factoriser par un nombre", niveau: 2, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T05"], time: 120,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.int(1, 5); b = rng.int(1, 9); } while (gcd(a, b) !== 1);
      const g = rng.int(2, 9), e = lin(g * a, g * b);
      return {
        statement: `Factorise $${e}$ avec le **plus grand** facteur commun numérique.`,
        parts: [tt(`$${e} =$ [[0]] $\\times (${lin(a, b)})$`, [nb(g)])],
        solution: [`$${g * a}$ et $${g * b}$ sont tous deux multiples de $${g}$ : $${g * a} = ${g} \\times ${a}$ et $${g * b} = ${g} \\times ${b}$.`, `$${e} = ${g} \\times ${a === 1 ? "x" : `${a}x`} + ${g} \\times ${b} = ${g}(${lin(a, b)})$.`, `Il ne reste plus de facteur commun entre $${a}$ et $${b}$ : $${g}$ est bien le plus grand.`],
      };
    },
    reasoning: "Factoriser, c'est la distributivité à l'envers : $kA + kB = k(A + B)$. On repère le facteur commun, puis on le met en évidence.",
    hints: ["Cherche un nombre qui divise les deux coefficients.", "Vérifie en redéveloppant : tu dois retrouver l'expression de départ."],
  }),
  ex({
    id: "cl3-12", title: "Factoriser par un facteur littéral", niveau: 2, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T05"], time: 150,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.int(1, 5); b = rng.int(1, 9); } while (gcd(a, b) !== 1);
      const g = rng.int(2, 6), e = quad(g * a, g * b, 0);
      return {
        statement: `On veut factoriser $${e}$ par le plus grand facteur commun, qui est $${g}x$.`,
        parts: [tt(`$${e} = ${g}x \\times ($ [[0]] $x +$ [[1]] $)$`, [nb(a), nb(b)])],
        solution: [`$${e} = ${g}x \\times ${a === 1 ? "x" : `${a}x`} + ${g}x \\times ${b}$.`, `On met $${g}x$ en facteur : $${e} = ${g}x(${lin(a, b)})$.`, `Contrôle en développant : $${g}x \\times ${a === 1 ? "x" : `${a}x`} = ${g * a}x^{2}$ et $${g}x \\times ${b} = ${g * b}x$ ✓.`],
      };
    },
    reasoning: "Le facteur commun peut contenir une lettre : $x^{2} = x \\times x$, donc $x$ est présent dans chaque terme.",
    hints: ["Écris chaque terme comme un produit contenant $" + "x" + "$ (par exemple $x^{2} = x \\times x$).", "Contrôle en redéveloppant."],
  }),
  ex({
    id: "cl3-13", title: "Développer (x + p)(x − p)", niveau: 2, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 90,
    vary: (rng) => {
      const p = rng.int(2, 12);
      return {
        statement: `Développe et réduis $(x + ${p})(x - ${p})$.`,
        parts: [tt("$x^{2} -$ [[0]]", [nb(p * p)])],
        solution: [`$(x + ${p})(x - ${p}) = x^{2} - ${p}x + ${p}x - ${p * p}$.`, `Les deux termes en $x$ s'annulent : $x^{2} - ${p * p}$.`, `C'est l'identité $(a + b)(a - b) = a^{2} - b^{2}$ avec $a = x$ et $b = ${p}$.`],
      };
    },
    reasoning: "Quand les deux facteurs ne diffèrent que par le signe du second terme, les termes « du milieu » se compensent : il reste $a^{2} - b^{2}$.",
    hints: ["Écris les quatre produits de la double distributivité.", "Que vaut la somme des deux termes en $x$ ?"],
  }),
  ex({
    id: "cl3-14", title: "Calcul mental astucieux", niveau: 2, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 120,
    vary: (rng) => {
      const n = rng.pick([20, 30, 40, 50, 60, 100]), d = rng.int(1, 3);
      return {
        statement: `Calcule $${n + d} \\times ${n - d}$ de tête en écrivant $(${n} + ${d})(${n} - ${d})$.`,
        parts: [num(n * n - d * d, [{ match: String(n * n), feedback: `Tu as oublié de retrancher $${d}^{2} = ${d * d}$.` }])],
        solution: [`$(${n} + ${d})(${n} - ${d}) = ${n}^{2} - ${d}^{2}$ (identité $a^{2} - b^{2} = (a - b)(a + b)$).`, `$= ${T(n * n)} - ${d * d} = ${T(n * n - d * d)}$.`],
      };
    },
    reasoning: "On reconnaît un produit de la forme $(a + b)(a - b)$ avec $a$ et $b$ « faciles » : il vaut $a^{2} - b^{2}$.",
    hints: ["Cherche le nombre qui est exactement au milieu des deux facteurs.", "Utilise $(a + b)(a - b) = a^{2} - b^{2}$."],
  }),
  ex({
    id: "cl3-15", title: "Tester une égalité avec des valeurs", niveau: 2, objectives: ["M3-NC-11"], taxonomyTypes: ["CL-T07"], time: 150,
    vary: (rng) => {
      const k = rng.int(2, 5), b = rng.int(1, 6);
      return {
        statement: `On veut savoir si l'égalité $${k}(x + ${b}) = ${k}x + ${b}$ est vraie pour toutes les valeurs de $x$. Complète le tableau avec la valeur de chaque expression.`,
        parts: [
          { interaction: { kind: "tableau", headers: ["Valeur de $x$", "$0$", "$1$", "$2$"], rows: [{ label: `$${k}(x + ${b})$`, cells: [0, 1, 2].map((x) => ({ answer: { value: k * (x + b) } })) }, { label: `$${k}x + ${b}$`, cells: [0, 1, 2].map((x) => ({ answer: { value: k * x + b } })) }] } },
          vf(["Les deux expressions sont égales pour $x = 0$.", "On peut conclure que l'égalité n'est pas une identité."], [false, true]),
        ],
        solution: [`Pour $x = 0$ : $${k}(0 + ${b}) = ${k * b}$ et $${k} \\times 0 + ${b} = ${b}$.`, `Pour $x = 1$ : $${k * (1 + b)}$ et $${k + b}$ ; pour $x = 2$ : $${k * (2 + b)}$ et $${2 * k + b}$.`, `Les valeurs diffèrent : un seul contre-exemple suffit, l'égalité est fausse en général (la bonne distributivité donne $${k}x + ${k * b}$).`],
      };
    },
    reasoning: "Pour réfuter une égalité, un seul contre-exemple suffit.",
    hints: ["Remplace $x$ par chaque valeur dans les deux expressions.", "Une seule valeur pour laquelle les résultats diffèrent suffit à conclure."],
  }),
  ex({
    id: "cl3-16", title: "Vrai pour une valeur, vrai pour toutes ?", niveau: 2, objectives: ["M3-NC-11", "M4-NC-18"], taxonomyTypes: ["CL-T07"], time: 120,
    statement: "Vrai ou faux ?",
    parts: [vf(["L'égalité $2x + 3 = x + 5$ est vraie pour $x = 2$.", "Donc $2x + 3 = x + 5$ est une identité.", "L'égalité $x + x = 2x$ est vraie pour toutes les valeurs de $x$.", "Pour prouver qu'une égalité est fausse en général, un seul contre-exemple suffit.", "Si une égalité est vraie pour $x = 1$, $x = 2$ et $x = 3$, c'est forcément une identité."], [true, false, true, true, false])],
    solution: ["Vrai : $2 \\times 2 + 3 = 7$ et $2 + 5 = 7$.", "Faux : pour $x = 0$, $3 \\neq 5$ ; elle n'est vraie que pour $x = 2$.", "Vrai : c'est une identité, $x + x = 2x$ quel que soit $x$.", "Vrai : une seule valeur qui ne convient pas la réfute.", "Faux : vérifier quelques valeurs ne prouve rien ; il faut un calcul littéral valable pour tout $x$."],
    reasoning: "Une identité est vraie pour toutes les valeurs ; une égalité vraie pour quelques valeurs seulement n'en est pas une.",
    hints: ["Remplace $x$ par la valeur donnée.", "Pense à la différence entre « réfuter » (un exemple) et « prouver » (un calcul général)."],
  }),
  // ── Niveau 3 ──
  ex({
    id: "cl3-17", title: "Double distributivité générale", niveau: 3, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T04"], time: 180,
    vary: (rng) => {
      let a = 0, b = 0, c = 0, d = 0;
      do { a = rng.int(1, 3); c = rng.int(1, 3); b = sgnInt(rng, 1, 6); d = sgnInt(rng, 1, 6); } while (a * d + b * c === 0);
      return {
        statement: `Développe et réduis $(${lin(a, b)})(${lin(c, d)})$ sous la forme $\\dots x^{2} + \\dots x + \\dots$`,
        parts: [tt("[[0]] $x^{2}$ + [[1]] $x$ + [[2]]", [nb(a * c), nb(a * d + b * c), nb(b * d)])],
        solution: [`$(${lin(a, b)})(${lin(c, d)}) = ${a * c}x^{2} + (${a * d})x + (${b * c})x + (${b * d})$.`, `Terme en $x$ : $${a * d} + (${b * c}) = ${a * d + b * c}$.`, `Résultat : $${quad(a * c, a * d + b * c, b * d)}$.`],
      };
    },
    reasoning: "Quatre produits, puis regroupement des termes de même nature : $x^{2}$ avec $x^{2}$, $x$ avec $x$, constantes entre elles.",
    hints: ["Premier terme × premier terme, premier × second, second × premier, second × second.", "Regroupe seulement les termes en $x$ entre eux."],
  }),
  ex({
    id: "cl3-18", title: "Développer puis réduire avec un autre terme", niveau: 3, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T04"], time: 180,
    vary: (rng) => {
      const a = rng.int(2, 3), b = sgnInt(rng, 1, 5), d = sgnInt(rng, 1, 5), e = sgnInt(rng, 1, 6), f = sgnInt(rng, 1, 9);
      return {
        statement: `Développe et réduis $A = (${lin(a, b)})(${lin(1, d)}) + (${lin(e, f)})$ sous la forme $\\dots x^{2} + \\dots x + \\dots$`,
        parts: [tt("[[0]] $x^{2}$ + [[1]] $x$ + [[2]]", [nb(a), nb(a * d + b + e), nb(b * d + f)])],
        solution: [`$(${lin(a, b)})(${lin(1, d)}) = ${a}x^{2} + (${a * d})x + (${b})x + (${b * d}) = ${quad(a, a * d + b, b * d)}$.`, `On ajoute $(${lin(e, f)})$ : les termes en $x$ donnent $${a * d + b} + (${e}) = ${a * d + b + e}$ et les constantes $${b * d} + (${f}) = ${b * d + f}$.`, `$A = ${quad(a, a * d + b + e, b * d + f)}$.`],
      };
    },
    reasoning: "On développe d'abord le produit, on réduit, puis on ajoute le dernier terme sans changer ses signes (il est précédé d'un $+$).",
    hints: ["Développe d'abord le produit seul.", "Ajoute ensuite les termes semblables : en $x$ avec en $x$, constantes avec constantes."],
  }),
  ex({
    id: "cl3-19", title: "La double distributivité comme simple distributivité", niveau: 3, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T04"], time: 180,
    vary: (rng) => {
      const p = rng.int(2, 7), q = rng.int(2, 7);
      const lines = [
        `On pose $k = x + ${p}$ : $(x + ${p})(x + ${q}) = k(x + ${q})$.`,
        `Distributivité simple : $k(x + ${q}) = kx + ${q}k$.`,
        `On remplace $k$ : $kx + ${q}k = x(x + ${p}) + ${q}(x + ${p})$.`,
        `On distribue : $= x^{2} + ${p}x + ${q}x + ${p * q}$.`,
        `On réduit : $= x^{2} + ${p + q}x + ${p * q}$.`,
      ];
      return { statement: `Pour développer $(x + ${p})(x + ${q})$, on pose $k = x + ${p}$ pour se ramener à la distributivité simple. Remets les étapes dans l'ordre.`, parts: [shuffledOrder(rng, lines)], solution: lines };
    },
    reasoning: "La double distributivité n'est pas une règle nouvelle : c'est deux fois la distributivité simple, en traitant une parenthèse comme un seul nombre $k$.",
    hints: ["La première étape pose la lettre $k$.", "La dernière étape est la réduction."],
  }),
  ex({
    id: "cl3-20", title: "Un facteur commun entre parenthèses", niveau: 3, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T05"], time: 180,
    vary: (rng) => {
      const p = rng.int(1, 9);
      let q = 0, r = 0;
      do { q = rng.int(1, 9); r = rng.int(1, 9); } while (q === r);
      return {
        statement: `Factorise $A = (x + ${p})(2x + ${q}) - (x + ${p})(x + ${r})$ : le facteur commun est $(x + ${p})$.`,
        parts: [tt(`$A = (x + ${p}) \\times (x +$ [[0]] $)$`, [nb(q - r)])],
        solution: [`On met $(x + ${p})$ en facteur : $A = (x + ${p})\\big[(2x + ${q}) - (x + ${r})\\big]$.`, `Dans le crochet, on supprime la parenthèse précédée du signe $-$ : $2x + ${q} - x - ${r} = x + ${q - r}$.`, `$A = (x + ${p})(x + ${q - r})$.`],
      };
    },
    reasoning: "Le facteur commun peut être une expression entière entre parenthèses ; ce qui reste est une différence qu'il faut réduire en changeant les signes de la parenthèse soustraite.",
    hints: ["Repère l'expression qui apparaît dans les deux produits.", "Dans le crochet, attention au signe $-$ devant la seconde parenthèse."],
  }),
  ex({
    id: "cl3-21", title: "Factoriser avec un signe moins", niveau: 3, objectives: ["M3-NC-09"], taxonomyTypes: ["CL-T05"], time: 150,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.int(1, 5); b = rng.int(1, 9); } while (gcd(a, b) !== 1);
      const g = rng.int(2, 8), e = poly([-g * a, -g * b]);
      return {
        statement: `Factorise $${e}$ en mettant $-${g}$ en facteur.`,
        parts: [tt(`$${e} = -${g} \\times ($ [[0]] $x +$ [[1]] $)$`, [nb(a), nb(b)])],
        solution: [`$-${g * a}x = -${g} \\times ${a === 1 ? "x" : `${a}x`}$ et $-${g * b} = -${g} \\times ${b}$.`, `$${e} = -${g}(${lin(a, b)})$.`, `Contrôle : $-${g} \\times ${b} = -${g * b}$ ✓.`],
      };
    },
    reasoning: "Mettre un nombre négatif en facteur change le signe de chaque terme restant par rapport à l'expression de départ : on divise chaque terme par $-k$.",
    hints: ["Divise chaque terme par le nombre négatif mis en facteur (attention aux signes).", "Contrôle en redéveloppant."],
  }),
  ex({
    id: "cl3-22", title: "Factoriser une différence de deux carrés", niveau: 3, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 180,
    vary: (rng) => {
      const m = rng.int(2, 7), n = rng.int(1, 10);
      return {
        statement: `Factorise $${m * m}x^{2} - ${n * n}$ en utilisant l'identité $a^{2} - b^{2} = (a - b)(a + b)$.`,
        parts: [tt(`$${m * m}x^{2} - ${n * n} = ($ [[0]] $x -$ [[1]] $)($ [[2]] $x +$ [[3]] $)$`, [nb(m), nb(n), nb(m), nb(n)])],
        solution: [`$${m * m}x^{2} = (${m}x)^{2}$ et $${n * n} = ${n}^{2}$ : on reconnaît $a^{2} - b^{2}$ avec $a = ${m}x$ et $b = ${n}$.`, `$${m * m}x^{2} - ${n * n} = (${m}x - ${n})(${m}x + ${n})$.`, `Contrôle : $(${m}x)^{2} - ${n}^{2}$ ✓.`],
      };
    },
    reasoning: "On repère deux carrés séparés par un signe moins : $a$ est la « racine » du premier carré et $b$ celle du second.",
    hints: ["Écris chaque terme sous la forme (quelque chose)$^{2}$.", "Applique $a^{2} - b^{2} = (a - b)(a + b)$ avec ces deux « quelque chose »."],
  }),
  ex({
    id: "cl3-23", title: "Développer (mx + n)(mx − n)", niveau: 3, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 150,
    vary: (rng) => {
      const m = rng.int(2, 7), n = rng.int(1, 9);
      return {
        statement: `Développe et réduis $(${m}x + ${n})(${m}x - ${n})$.`,
        parts: [tt("[[0]] $x^{2} -$ [[1]]", [nb(m * m), nb(n * n)])],
        solution: [`C'est de la forme $(a + b)(a - b)$ avec $a = ${m}x$ et $b = ${n}$.`, `$(a + b)(a - b) = a^{2} - b^{2} = (${m}x)^{2} - ${n}^{2} = ${m * m}x^{2} - ${n * n}$.`],
      };
    },
    reasoning: "Quand $a$ est un produit ($mx$), son carré s'écrit $m^{2}x^{2}$ : on élève au carré le nombre **et** la lettre.",
    hints: ["Repère $a$ et $b$ dans les deux facteurs.", "$(mx)^{2} = m^{2}x^{2}$."],
  }),
  ex({
    id: "cl3-24", title: "Trouver un contre-exemple", niveau: 3, objectives: ["M3-NC-11"], taxonomyTypes: ["CL-T07"], time: 180,
    vary: (rng) => {
      const p = rng.int(2, 6), q = rng.int(2, 6);
      return {
        statement: `Chloé affirme que $(x + ${p})(x + ${q}) = x^{2} + ${p * q}$ pour toutes les valeurs de $x$. Elle l'a vérifié pour $x = 0$. Teste l'égalité pour $x = 1$.`,
        parts: [
          steps([[`Valeur de $(1 + ${p})(1 + ${q})$`, (1 + p) * (1 + q)], [`Valeur de $1^{2} + ${p * q}$`, 1 + p * q]]),
          vf(["L'égalité est vraie pour $x = 0$.", "L'égalité est vraie pour $x = 1$.", "Un seul contre-exemple suffit pour affirmer que l'égalité n'est pas une identité.", "Avoir vérifié $x = 0$ prouve que l'égalité est toujours vraie."], [true, false, true, false]),
        ],
        solution: [`Pour $x = 0$ : $${p} \\times ${q} = ${p * q}$ des deux côtés, l'égalité est vérifiée.`, `Pour $x = 1$ : $(1 + ${p})(1 + ${q}) = ${(1 + p) * (1 + q)}$ alors que $1 + ${p * q} = ${1 + p * q}$ : l'égalité est fausse.`, `$x = 1$ est un contre-exemple : l'affirmation de Chloé est réfutée. (En développant : $(x + ${p})(x + ${q}) = x^{2} + ${p + q}x + ${p * q}$.)`],
      };
    },
    reasoning: "Une valeur « qui marche » (ici $x = 0$) ne prouve rien ; une valeur « qui ne marche pas » réfute définitivement.",
    hints: ["Remplace $x$ par $1$ dans chaque membre.", "Compare les deux résultats."],
  }),
  ex({
    id: "cl3-25", title: "Un programme de calcul qui cache un produit", niveau: 3, objectives: ["M3-NC-11", "M4-NC-18"], taxonomyTypes: ["CL-T08"], time: 180,
    vary: (rng) => {
      const k = rng.int(2, 5), c = rng.int(2, 9);
      const names = ["le double", "le triple", "le quadruple", "le quintuple"];
      return {
        statement: `Programme : choisir un nombre $x$ ; lui ajouter $${c}$ ; multiplier le résultat par $${k}$ ; soustraire $${k * c}$.`,
        parts: [tt(`$${k}(x + ${c}) - ${k * c} =$ [[0]] $x +$ [[1]]\nLe résultat est toujours [[2]] du nombre de départ.`, [nb(k), nb(0), sel(names, k - 2)])],
        solution: [`Le programme s'écrit $${k}(x + ${c}) - ${k * c}$.`, `On développe : $${k}x + ${k * c} - ${k * c} = ${k}x$.`, `Quel que soit $x$, le résultat est $${k}x$ : ${names[k - 2]} du nombre choisi.`],
      };
    },
    reasoning: "Traduire le programme par une expression littérale, la développer et la réduire permet de démontrer une propriété valable pour tous les nombres de départ.",
    hints: ["Traduis chaque étape par une opération sur $x$.", "Développe, puis réduis."],
  }),
  ex({
    id: "cl3-26", title: "Quatre entiers consécutifs", niveau: 3, objectives: ["M3-NC-11"], taxonomyTypes: ["CL-T08"], time: 180,
    statement: "Soit $n$ un entier. On considère la somme $S$ de quatre entiers consécutifs : $n$, $n + 1$, $n + 2$ et $n + 3$.",
    parts: [tt("$S = n + (n + 1) + (n + 2) + (n + 3) =$ [[0]] $n +$ [[1]]", [nb(4), nb(6)]), vf(["$S$ est toujours un nombre pair.", "$S$ est toujours un multiple de $4$.", "$S = 2(2n + 3)$, ce qui prouve que $S$ est un multiple de $2$."], [true, false, true])],
    solution: ["$S = n + n + 1 + n + 2 + n + 3 = 4n + 6$.", "$4n + 6 = 2(2n + 3)$ avec $2n + 3$ entier : $S$ est un multiple de $2$, donc pair.", "Contre-exemple pour « multiple de $4$ » : $1 + 2 + 3 + 4 = 10$ n'est pas un multiple de $4$."],
    reasoning: "Le calcul littéral démontre une propriété pour tous les entiers ; un contre-exemple réfute une propriété fausse.",
    hints: ["Additionne séparément les $n$ puis les nombres.", "Pour « multiple de $4$ », teste $n = 1$."],
  }),
  // ── Niveau 4 ──
  ex({
    id: "cl3-27", title: "Différence de deux carrés de grands nombres", niveau: 4, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 180,
    vary: (rng) => {
      const b = rng.int(30, 90), d = rng.int(1, 5), a = b + d;
      return {
        statement: `Sans calculatrice, calcule $${a}^{2} - ${b}^{2}$ en utilisant $a^{2} - b^{2} = (a - b)(a + b)$.`,
        parts: [steps([[`Valeur de $${a} - ${b}$`, d], [`Valeur de $${a} + ${b}$`, a + b], [`Valeur de $${a}^{2} - ${b}^{2}$`, d * (a + b)]])],
        solution: [`$${a}^{2} - ${b}^{2} = (${a} - ${b})(${a} + ${b})$.`, `$${a} - ${b} = ${d}$ et $${a} + ${b} = ${a + b}$.`, `$${a}^{2} - ${b}^{2} = ${d} \\times ${a + b} = ${d * (a + b)}$.`],
      };
    },
    reasoning: "La factorisation transforme une différence de deux grands carrés en un produit de petits nombres.",
    hints: ["Applique $a^{2} - b^{2} = (a - b)(a + b)$ avec $a$ et $b$ les deux nombres.", "Calcule séparément $a - b$ et $a + b$."],
  }),
  ex({
    id: "cl3-28", title: "Reconnaître $a^2$ avec $a = x + p$", niveau: 4, objectives: ["M3-NC-10"], taxonomyTypes: ["CL-T06"], time: 210,
    vary: (rng) => {
      const p = rng.int(3, 9), q = rng.int(1, p - 1);
      return {
        statement: `Factorise $(x + ${p})^{2} - ${q * q}$ en posant $a = x + ${p}$ et $b = ${q}$. Ne développe pas $(x + ${p})^{2}$. Dans ta réponse, le premier facteur contient la différence $a - b$ et le second la somme $a + b$.`,
        parts: [tt("$(x + " + p + ")^{2} - " + q * q + " = (x +$ [[0]] $)(x +$ [[1]] $)$", [nb(p - q), nb(p + q)])],
        solution: [`$${q * q} = ${q}^{2}$ : on a $a^{2} - b^{2}$ avec $a = x + ${p}$ et $b = ${q}$.`, `$a - b = x + ${p} - ${q} = x + ${p - q}$ et $a + b = x + ${p} + ${q} = x + ${p + q}$.`, `Donc $(x + ${p})^{2} - ${q * q} = (x + ${p - q})(x + ${p + q})$.`],
      };
    },
    reasoning: "Dans $a^{2} - b^{2} = (a - b)(a + b)$, la lettre $a$ peut désigner une expression entière comme $x + p$.",
    hints: ["Identifie $a$ (l'expression élevée au carré) et $b$ (le nombre positif dont le carré est soustrait).", "Calcule $a - b$ puis $a + b$ en réduisant."],
  }),
  ex({
    id: "cl3-29", title: "Un programme dont le résultat est un carré", niveau: 4, objectives: ["M3-NC-11", "M3-NC-10"], taxonomyTypes: ["CL-T08"], time: 240,
    vary: (rng) => {
      const p = rng.int(2, 9);
      return {
        statement: `Programme : choisir un nombre $x$ ; calculer $x + ${p}$ ; calculer $x - ${p}$ ; multiplier ces deux résultats ; ajouter $${p * p}$.`,
        parts: [
          tt(`$(x + ${p})(x - ${p}) + ${p * p} = x^{2} -$ [[0]] $+$ [[1]] $= x^{2}$`, [nb(p * p), nb(p * p)], "1. Développe l'expression qui traduit le programme."),
          shuffledQcm(rng, ["le carré du nombre de départ", "le nombre de départ", `toujours $${p * p}$`, "le double du carré du nombre de départ"], 0, { 2: `$${p * p}$ est ajouté à la fin mais les autres termes ne s'annulent pas tous : il reste $x^{2}$.` }, "2. Que peut-on dire du résultat du programme ?"),
        ],
        solution: [`Le programme s'écrit $(x + ${p})(x - ${p}) + ${p * p}$.`, `$(x + ${p})(x - ${p}) = x^{2} - ${p * p}$ (identité $(a + b)(a - b) = a^{2} - b^{2}$).`, `$x^{2} - ${p * p} + ${p * p} = x^{2}$ : le résultat est toujours le carré du nombre de départ.`],
      };
    },
    reasoning: "Le calcul littéral prouve en une fois ce que des essais numériques ne pourraient que suggérer.",
    hints: ["Écris l'expression complète du programme.", "Utilise l'identité pour développer le produit."],
  }),
  ex({
    id: "cl3-30", title: "Démontrer une propriété de deux entiers consécutifs", niveau: 4, objectives: ["M3-NC-11", "M3-NC-10"], taxonomyTypes: ["CL-T08"], time: 210,
    statement: "On veut démontrer que la différence des carrés de deux entiers consécutifs est égale à leur somme. Remets les étapes dans l'ordre.",
    vary: (rng) => {
      const lines = ["Soit $n$ un entier : deux entiers consécutifs sont $n$ et $n + 1$.", "On calcule $(n + 1)^{2} - n^{2}$, de la forme $a^{2} - b^{2}$ avec $a = n + 1$ et $b = n$.", "$a^{2} - b^{2} = (a - b)(a + b)$ donne $(n + 1)^{2} - n^{2} = ((n + 1) - n)((n + 1) + n)$.", "On réduit : $(n + 1) - n = 1$ et $(n + 1) + n = 2n + 1$.", "Donc $(n + 1)^{2} - n^{2} = 2n + 1 = n + (n + 1)$ : c'est bien la somme des deux entiers."];
      return { statement: "On veut démontrer que la différence des carrés de deux entiers consécutifs est égale à leur somme. Remets les étapes dans l'ordre.", parts: [shuffledOrder(rng, lines)], solution: [...lines, "Contrôle : $5^{2} - 4^{2} = 9 = 4 + 5$."] };
    },
    reasoning: "Une démonstration part d'une lettre représentant un entier quelconque et conclut sans jamais utiliser de valeur particulière.",
    hints: ["Une démonstration commence par « Soit $n$ un entier ».", "La conclusion revient à la propriété à démontrer."],
  }),
  ex({
    id: "cl3-31", title: "Aire d'un rectangle auquel on retire un carré", niveau: 4, objectives: ["M3-NC-09", "M3-NC-11"], taxonomyTypes: ["CL-T09"], time: 240,
    vary: (rng) => {
      const p = rng.int(4, 9), q = rng.int(4, 9), c = rng.int(1, 3);
      return {
        statement: `Un jardin rectangulaire a pour dimensions $(x + ${p})$ m et $(x + ${q})$ m. Dans un coin, on construit une terrasse carrée de $${c}$ m de côté. On note $A$ l'aire (en m²) de la partie restante du jardin. Exprime $A$ en fonction de $x$ et complète : $A = \\dots x^{2} + \\dots x + \\dots$`,
        parts: [tt("$A =$ [[0]] $x^{2}$ + [[1]] $x$ + [[2]]", [nb(1), nb(p + q), nb(p * q - c * c)])],
        solution: [`Aire du rectangle : $(x + ${p})(x + ${q}) = x^{2} + ${p + q}x + ${p * q}$.`, `Aire de la terrasse : $${c} \\times ${c} = ${c * c}$.`, `$A = x^{2} + ${p + q}x + ${p * q} - ${c * c} = ${quad(1, p + q, p * q - c * c)}$.`],
      };
    },
    reasoning: "Modéliser, c'est traduire la figure par une expression ; on développe ensuite pour obtenir une forme réduite exploitable.",
    hints: ["Aire de la partie restante = aire du rectangle − aire de la terrasse.", "Développe le produit des deux dimensions."],
  }),
  ex({
    id: "cl3-32", title: "Un carré transformé en rectangle", niveau: 4, objectives: ["M3-NC-11", "M3-NC-10"], taxonomyTypes: ["CL-T09"], time: 240,
    vary: (rng) => {
      const a = rng.int(2, 9);
      return {
        statement: `On part d'un carré de côté $x$ cm (avec $x > ${a}$). On allonge un côté de $${a}$ cm et on raccourcit l'autre de $${a}$ cm : on obtient un rectangle.`,
        parts: [
          tt(`Aire du rectangle : $(x + ${a})(x - ${a}) = x^{2} -$ [[0]]`, [nb(a * a)], "1. Développe l'aire du rectangle."),
          num(a * a, [{ match: String(a), feedback: `Tu as calculé ${a} : il faut le carré de ${a}, car $b^{2}$ apparaît dans $a^{2} - b^{2}$.` }], "2. De combien de cm² l'aire a-t-elle diminué, quelle que soit la valeur de $x$ ?"),
        ],
        solution: [`Rectangle : $(x + ${a})(x - ${a}) = x^{2} - ${a * a}$ (identité $a^{2} - b^{2}$).`, `Carré de départ : $x^{2}$. Différence : $x^{2} - (x^{2} - ${a * a}) = ${a * a}$.`, `L'aire diminue toujours de $${a * a}$ cm², quelle que soit la valeur de $x$.`],
      };
    },
    reasoning: "L'expression littérale montre que la diminution ne dépend pas de $x$, ce que de simples essais ne prouveraient pas.",
    hints: ["Aire du carré : $x^{2}$.", "Diminution = aire du carré − aire du rectangle."],
  }),
  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "cl3-33", title: "Type Brevet — Deux programmes de calcul", niveau: 5, objectives: ["M3-NC-10", "M3-NC-11", "M4-NC-18"], taxonomyTypes: ["CL-T08"], time: 360,
    vary: (rng) => {
      const p = rng.int(2, 9), t = rng.int(3, 12);
      return {
        statement: `**Programme A** : choisir un nombre ; calculer d'une part ce nombre plus $${p}$, d'autre part ce même nombre moins $${p}$ (deux calculs séparés, à partir du nombre choisi) ; multiplier les deux résultats.\n**Programme B** : choisir un nombre ; le multiplier par lui-même ; retrancher $${p * p}$.`,
        parts: [
          steps([[`Résultat du programme A pour $${t}$`, (t + p) * (t - p)], [`Résultat du programme B pour $${t}$`, t * t - p * p]], `1. On choisit le nombre $${t}$.`),
          tt(`2. En notant $x$ le nombre choisi, le programme A donne $(x + ${p})(x - ${p}) = x^{2} -$ [[0]]`, [nb(p * p)]),
          qcm(["Oui, car les deux programmes donnent $x^{2} - " + p * p + "$ pour toute valeur de $x$", "Oui, car ils donnent le même résultat pour $" + t + "$", "Non, car A est un produit et B une différence", "On ne peut pas savoir sans tester tous les nombres"], 0, [{ match: "1", feedback: "Un seul nombre qui marche ne prouve pas l'égalité pour tous les nombres." }, { match: "2", feedback: "Deux expressions de formes différentes peuvent être égales : c'est justement le rôle d'un développement." }], "3. Les deux programmes donnent-ils toujours le même résultat ?"),
        ],
        solution: [`1. Programme A : $(${t} + ${p})(${t} - ${p}) = ${t + p} \\times ${t - p} = ${(t + p) * (t - p)}$. Programme B : $${t}^{2} - ${p * p} = ${t * t - p * p}$.`, `2. $(x + ${p})(x - ${p}) = x^{2} - ${p}x + ${p}x - ${p * p} = x^{2} - ${p * p}$.`, `3. Le programme B donne $x^{2} - ${p * p}$ : c'est la même expression, donc les deux programmes sont équivalents pour tout nombre. Vérifier un exemple ne suffisait pas : c'est le développement qui le prouve.`],
      };
    },
    reasoning: "Rédaction attendue : traduire chaque programme par une expression, développer, comparer, puis conclure en précisant que le calcul est valable quel que soit le nombre choisi.",
    hints: ["Pour la partie 1, effectue les calculs étape par étape.", "Pour la partie 2, utilise la double distributivité.", "Pour la partie 3, compare les expressions littérales des deux programmes."],
  }),
  ex({
    id: "cl3-34", title: "Type Brevet — La cour et le massif", niveau: 5, objectives: ["M3-NC-10", "M3-NC-11"], taxonomyTypes: ["CL-T09"], time: 360,
    vary: (rng) => {
      const b = rng.int(11, 29), a = b + rng.int(4, 20), c = rng.int(3, 9), x0 = rng.int(c + 4, c + 20);
      return {
        statement: `Une cour carrée a pour côté $${a}$ m. Elle contient un massif de fleurs carré de $${b}$ m de côté : le reste de la cour est dallé.\nPlus tard, on compare avec une cour carrée de côté $x$ m (avec $x > ${c}$) contenant un massif carré de $${c}$ m de côté.`,
        parts: [
          steps([[`Valeur de $${a} - ${b}$`, a - b], [`Valeur de $${a} + ${b}$`, a + b], [`Aire dallée de la première cour (en m²)`, a * a - b * b]], "1. Calcule l'aire dallée de la première cour en utilisant une factorisation."),
          tt(`2. Aire dallée de la seconde cour : $x^{2} - ${c * c} = (x -$ [[0]] $)(x +$ [[1]] $)$`, [nb(c), nb(c)]),
          num(x0 * x0 - c * c, [{ match: String(x0 * x0 - c), feedback: `$${c * c} = ${c}^{2}$ est à retrancher, pas $${c}$.` }], `3. Calcule cette aire pour $x = ${x0}$ (en m²).`),
        ],
        solution: [`1. $${a}^{2} - ${b}^{2} = (${a} - ${b})(${a} + ${b}) = ${a - b} \\times ${a + b} = ${a * a - b * b}$ m².`, `2. $${c * c} = ${c}^{2}$, donc $x^{2} - ${c * c} = (x - ${c})(x + ${c})$.`, `3. Pour $x = ${x0}$ : $(${x0} - ${c})(${x0} + ${c}) = ${x0 - c} \\times ${x0 + c} = ${x0 * x0 - c * c}$ m².`],
      };
    },
    reasoning: "L'aire dallée est une différence de deux carrés : la factorisation donne un calcul simple et une expression générale en fonction de $x$.",
    hints: ["Aire dallée = aire de la cour − aire du massif.", "Utilise $a^{2} - b^{2} = (a - b)(a + b)$.", "Pour la partie 3, remplace $x$ par la valeur donnée dans la forme factorisée."],
  }),
  ex({
    id: "cl3-35", title: "Type Brevet — Un multiple de 12 pour tout entier", niveau: 5, objectives: ["M3-NC-11", "M3-NC-10"], taxonomyTypes: ["CL-T08"], time: 360,
    vary: (rng) => {
      const lines = [
        "On reconnaît $a^{2} - b^{2}$ avec $a = n + 3$ et $b = n - 3$.",
        "$a^{2} - b^{2} = (a - b)(a + b)$ donne $(n + 3)^{2} - (n - 3)^{2} = ((n + 3) - (n - 3))((n + 3) + (n - 3))$.",
        "On réduit chaque parenthèse : $(n + 3) - (n - 3) = 6$ et $(n + 3) + (n - 3) = 2n$.",
        "L'expression vaut donc $6 \\times 2n = 12n$.",
        "$n$ est un entier, donc $12n$ est un multiple de $12$ : le résultat est démontré pour tout entier $n$.",
      ];
      return {
        statement: "Démontre que, pour tout entier $n$, le nombre $(n + 3)^{2} - (n - 3)^{2}$ est un multiple de $12$.",
        parts: [
          { ...shuffledOrder(rng, lines), prompt: "1. Remets dans l'ordre les étapes de la démonstration." },
          vf(["Vérifier la propriété pour $n = 1$, $n = 2$ et $n = 3$ suffit à la démontrer.", "Au lieu d'appliquer l'identité $a^{2} - b^{2}$, on aurait pu développer chaque carré, mais l'identité est plus rapide.", "Pour $n = 5$, le nombre vaut $60$, un multiple de $12$."], [false, true, true], "2. Vrai ou faux ?"),
        ],
        solution: [...lines, "Vérifier quelques valeurs ne démontre rien : il faut un calcul valable pour un entier $n$ quelconque.", "Pour $n = 5$ : $8^{2} - 2^{2} = 64 - 4 = 60 = 12 \\times 5$ ✓."],
      };
    },
    reasoning: "On factorise pour faire apparaître le facteur $12$ : un nombre de la forme $12 \\times$ (entier) est un multiple de $12$.",
    hints: ["Cherche à écrire l'expression sous la forme $12 \\times$ (un entier).", "Quel est le point commun entre les deux nombres élevés au carré ? Une soustraction de carrés."],
  }),
  ex({
    id: "cl3-36", title: "Type Brevet — Conjectures de deux élèves", niveau: 5, objectives: ["M3-NC-11", "M3-NC-09", "M4-NC-18"], taxonomyTypes: ["CL-T08"], time: 360,
    statement: "Deux élèves font une conjecture sur toutes les valeurs de $x$ :\n• Léo : « $(x + 1)(x + 2) = x^{2} + 2$ ».\n• Inès : « $2(x + 3) + 3(x - 1) = 5x + 3$ ».",
    parts: [
      steps([["Valeur de $(1 + 1)(1 + 2)$", 6], ["Valeur de $1^{2} + 2$", 3]], "1. Teste la conjecture de Léo pour $x = 1$."),
      tt("2. Développe et réduis l'expression d'Inès : $2(x + 3) + 3(x - 1) =$ [[0]] $x +$ [[1]]", [nb(5), nb(3)]),
      vf(["La conjecture de Léo est réfutée.", "La conjecture d'Inès est démontrée pour toutes les valeurs de $x$.", "Un seul test avec $x = 0$ aurait suffi à réfuter la conjecture de Léo."], [true, true, false], "3. Conclus : vrai ou faux ?"),
    ],
    solution: ["1. $(1 + 1)(1 + 2) = 2 \\times 3 = 6$ et $1^{2} + 2 = 3$ : $6 \\neq 3$.", "2. $2(x + 3) + 3(x - 1) = 2x + 6 + 3x - 3 = 5x + 3$ : l'égalité est une identité.", "3. Léo : $x = 1$ est un contre-exemple, sa conjecture est réfutée. Inès : le développement prouve l'égalité pour tout $x$. Avec $x = 0$, Léo trouverait $2 = 2$ : ce test ne réfute rien, il faut choisir une autre valeur."],
    reasoning: "On réfute avec un contre-exemple, on démontre avec un calcul littéral ; il faut choisir la valeur du test avec soin, car certaines valeurs « cachent » l'erreur.",
    hints: ["Pour la partie 1, calcule chaque membre séparément.", "Pour la partie 2, utilise la distributivité simple deux fois, puis réduis.", "Pour la dernière affirmation, calcule les deux membres de la conjecture de Léo avec $x = 0$."],
  }),
  ex({
    id: "cl3-37", title: "Type Brevet — Le terrain et la bande cédée", niveau: 5, objectives: ["M3-NC-09", "M3-NC-11"], taxonomyTypes: ["CL-T09"], time: 360,
    vary: (rng) => {
      const w = rng.int(3, 8), x0 = rng.int(w + 4, w + 14);
      return {
        statement: `Un terrain carré a pour côté $x$ m (avec $x > ${w}$). On cède une bande rectangulaire de $${w}$ m de large qui longe tout un côté du terrain. On note $A$ l'aire du terrain restant (en m²).`,
        parts: [
          tt(`1. $A = x^{2} -$ [[0]] $x$`, [nb(w)]),
          tt(`2. Factorise : $A = x(x -$ [[0]] $)$`, [nb(w)]),
          num(x0 * (x0 - w), [{ match: String(x0 * x0 - w), feedback: `La bande cédée mesure $${w} \\times x$, pas $${w}$ m².` }], `3. Calcule $A$ pour $x = ${x0}$ (en m²).`),
          vf([`L'aire restante est $${w}$ m² de moins que celle du terrain carré.`, `Le terrain restant est un rectangle de côtés $x$ m et $(x - ${w})$ m.`], [false, true], "4. Vrai ou faux ?"),
        ],
        solution: [`1. La bande a pour aire $${w} \\times x$ : $A = x^{2} - ${w}x$.`, `2. $x$ est un facteur commun : $A = x(x - ${w})$.`, `3. Pour $x = ${x0}$ : $${x0} \\times ${x0 - w} = ${x0 * (x0 - w)}$ m².`, `4. Faux pour la première (l'aire cédée est $${w}x$) ; vrai pour la seconde, ce qui explique la forme factorisée.`],
      };
    },
    reasoning: "La forme développée traduit « aire du carré − aire de la bande » ; la forme factorisée traduit « aire d'un rectangle ». Les deux expressions sont égales.",
    hints: ["Aire de la bande = largeur × longueur du côté.", "$x^{2}$ et $" + "w" + "x$ ont un facteur commun.", "Pour la partie 3, la forme factorisée est la plus rapide."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const areaModel = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 190" role="img" aria-label="Rectangle de côtés x + 3 et x + 2 découpé en quatre rectangles d'aires x², 3x, 2x et 6" style="width:100%;max-width:280px;height:auto;font-family:Inter,Arial,sans-serif"><rect x="40" y="20" width="130" height="100" fill="#e0e7ff" stroke="#334155"/><rect x="170" y="20" width="60" height="100" fill="#fef3c7" stroke="#334155"/><rect x="40" y="120" width="130" height="40" fill="#fef3c7" stroke="#334155"/><rect x="170" y="120" width="60" height="40" fill="#dcfce7" stroke="#334155"/><text x="105" y="76" font-size="18" text-anchor="middle" fill="#0f172a">x²</text><text x="200" y="76" font-size="16" text-anchor="middle" fill="#0f172a">3x</text><text x="105" y="145" font-size="16" text-anchor="middle" fill="#0f172a">2x</text><text x="200" y="145" font-size="16" text-anchor="middle" fill="#0f172a">6</text><text x="105" y="14" font-size="14" text-anchor="middle" fill="#4f46e5">x</text><text x="200" y="14" font-size="14" text-anchor="middle" fill="#4f46e5">3</text><text x="30" y="75" font-size="14" text-anchor="end" fill="#4f46e5">x</text><text x="30" y="144" font-size="14" text-anchor="end" fill="#4f46e5">2</text></svg>`;
const squareMinusSquare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 170" role="img" aria-label="Grand carré de côté a dont on retire un petit carré de côté b dans un coin" style="width:100%;max-width:280px;height:auto;font-family:Inter,Arial,sans-serif"><rect x="40" y="25" width="120" height="120" fill="#e0e7ff" stroke="#334155"/><rect x="110" y="25" width="50" height="50" fill="#ffffff" stroke="#b45309" stroke-dasharray="4 3"/><text x="85" y="95" font-size="18" text-anchor="middle" fill="#0f172a">a² − b²</text><text x="135" y="55" font-size="15" text-anchor="middle" fill="#b45309">b²</text><text x="100" y="18" font-size="14" text-anchor="middle" fill="#4f46e5">a</text><text x="135" y="162" font-size="13" text-anchor="middle" fill="#475569">b</text><text x="205" y="90" font-size="14" fill="#334155">= (a − b)(a + b)</text></svg>`;

// ───────────────────────── Chapitre ─────────────────────────
export const math3eCalculLitteral: ChapterContent = {
  ...META,
  prerequisites: [
    { text: "Calculer avec des nombres relatifs (règle des signes, priorités opératoires)." },
    { text: "Utiliser la distributivité simple et réduire une expression (4e)." },
    { text: "Remplacer une lettre par une valeur dans une expression littérale (4e)." },
    { text: "Calculer l'aire d'un rectangle et d'un carré ; connaître le carré d'un nombre ($a^{2} = a \\times a$)." },
  ],
  lesson: {
    introduction: "Pense à un nombre, ajoute $3$, multiplie par $2$, retranche $6$ : quel que soit le nombre choisi, tu retrouves son double. Peut-on en être sûr pour **tous** les nombres ? Quelques essais ne le prouvent pas.\nLe **calcul littéral** permet de le démontrer : on remplace le nombre par une lettre, on transforme l'expression (on la développe, on la factorise, on la réduit) et on conclut. Dans ce chapitre, tu apprends à déterminer l'opposé d'une expression, à développer avec la double distributivité, à factoriser, à utiliser l'identité $a^{2} - b^{2} = (a - b)(a + b)$, puis à démontrer ou réfuter un résultat.",
    definitions: [
      { term: "Expression littérale", text: "Une **expression littérale** est une expression qui contient une ou plusieurs lettres représentant des nombres, par exemple $3x + 5$ ou $(x + 1)(x - 4)$.\nSa **structure** dépend de la dernière opération effectuée : $3x + 5$ est une somme, $3(x + 5)$ est un produit." },
      { term: "Opposé d'une expression", text: "L'**opposé** d'une expression $A$ est l'expression $-A$ : la somme de $A$ et de $-A$ vaut $0$.\nExemple : l'opposé de $2x - 5$ est $-(2x - 5) = -2x + 5$." },
      { term: "Développer, réduire, factoriser", text: "**Développer**, c'est transformer un produit en somme. **Réduire**, c'est regrouper les termes de même nature (par exemple $4x + 2x - x = 5x$). **Factoriser**, c'est transformer une somme en produit en repérant un facteur commun (par exemple $3x + 3 = 3(x + 1)$)." },
      { term: "Identité", text: "Une **identité** est une égalité vraie pour **toutes** les valeurs des lettres. Exemples : $x + x = 2x$ ; $a^{2} - b^{2} = (a - b)(a + b)$.\nUne égalité vraie seulement pour certaines valeurs (par exemple $2x + 3 = x + 5$, vraie seulement pour $x = 2$) n'est pas une identité." },
      { term: "Contre-exemple", text: "Un **contre-exemple** est une valeur pour laquelle une égalité (ou une affirmation) proposée est fausse. Un seul contre-exemple suffit pour la réfuter." },
    ],
    properties: [
      { title: "Opposé d'une somme ou d'une différence", statement: "$-(A + B) = -A - B$ et $-(A - B) = -A + B$.\nUn signe $-$ placé devant une parenthèse change le signe de **chaque** terme de la parenthèse.", conditions: "Cela vaut aussi pour soustraire une parenthèse : $C - (A - B) = C - A + B$." },
      { title: "Distributivité simple", statement: "$k(A + B) = kA + kB$ et $k(A - B) = kA - kB$.", conditions: "Le facteur $k$ multiplie **chaque** terme de la parenthèse, signe compris. Lue de droite à gauche, c'est la factorisation." },
      { title: "Double distributivité", statement: "$(a + b)(c + d) = ac + ad + bc + bd$.\nExemple : $(x + 4)(x - 3) = x^{2} - 3x + 4x - 12 = x^{2} + x - 12$.", conditions: "Quatre produits : chaque terme de la première parenthèse multiplie chaque terme de la seconde." },
      { title: "Factorisation par un facteur commun", statement: "$kA + kB = k(A + B)$ : on repère le facteur $k$ présent dans tous les termes.\nExemple : $6x^{2} + 9x = 3x(2x + 3)$.", conditions: "Le facteur commun peut être un nombre, une lettre ou une parenthèse. Contrôle : en redéveloppant, on retrouve l'expression de départ." },
      { title: "Identité $a^{2} - b^{2} = (a - b)(a + b)$", statement: "Pour tous nombres $a$ et $b$ : $a^{2} - b^{2} = (a - b)(a + b)$.\nExemples : $(x + 5)(x - 5) = x^{2} - 25$ ; $4x^{2} - 49 = (2x - 7)(2x + 7)$.", conditions: "Elle s'utilise dans les deux sens : développer un produit $(a + b)(a - b)$, ou factoriser une **différence** de deux carrés (le signe doit être un moins)." },
      { title: "Démontrer ou réfuter", statement: "– Pour **démontrer** une égalité générale : développer (ou factoriser) pour que les deux membres soient identiques, avec une lettre qui représente n'importe quel nombre.\n– Pour **réfuter** : un seul contre-exemple suffit.", conditions: "Vérifier quelques valeurs ne démontre jamais une égalité générale." },
    ],
    explanations: [
      { title: "1. Le signe moins devant une parenthèse", body: "Écrire $-(x - 5)$, c'est multiplier la parenthèse par $-1$ : $-1 \\times x + (-1) \\times (-5) = -x + 5$. C'est pourquoi **tous** les signes changent. Soustraire une expression revient à ajouter son opposé : $7x - (2x - 3) = 7x - 2x + 3 = 5x + 3$." },
      { title: "2. Pourquoi la double distributivité marche", body: "Un rectangle de côtés $(x + 3)$ et $(x + 2)$ se découpe en quatre rectangles d'aires $x^{2}$, $3x$, $2x$ et $6$. Son aire est donc $x^{2} + 3x + 2x + 6 = x^{2} + 5x + 6$. On peut aussi poser $k = x + 3$ : $(x + 3)(x + 2) = k(x + 2) = kx + 2k$, puis on remplace $k$ : la double distributivité est la distributivité simple appliquée deux fois." },
      { title: "3. Factoriser, c'est développer à l'envers", body: "On cherche ce qui est commun à tous les termes. Pour $12x + 18$ : $12 = 6 \\times 2$ et $18 = 6 \\times 3$, donc $12x + 18 = 6(2x + 3)$. Quand le facteur commun est une parenthèse, on l'écrit une seule fois : $(x + 2)(3x + 1) - (x + 2)(x - 4) = (x + 2)[(3x + 1) - (x - 4)] = (x + 2)(2x + 5)$." },
      { title: "4. La différence de deux carrés", body: "Un grand carré de côté $a$ auquel on retire un petit carré de côté $b$ a pour aire $a^{2} - b^{2}$. Cette aire peut aussi s'écrire comme celle d'un rectangle de côtés $(a - b)$ et $(a + b)$. Pour factoriser, on repère deux carrés séparés par un moins : $9x^{2} - 16$ avec $a = 3x$ et $b = 4$. Pour calculer de tête : $101 \\times 99 = (100 + 1)(100 - 1) = 10\\,000 - 1 = 9\\,999$." },
      { title: "5. Prouver n'est pas tester", body: "Un programme de calcul qui donne toujours le double du nombre de départ sur dix exemples n'est pas démontré. Avec une lettre : $2(x + 3) - 6 = 2x + 6 - 6 = 2x$ vaut pour **tous** les nombres. À l'inverse, pour montrer qu'une égalité est fausse, il suffit d'un seul contre-exemple. Attention : certaines valeurs (comme $x = 0$) peuvent faire « marcher » une égalité fausse." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Opposé et soustraction", statement: "Donner l'opposé de $3x - 7$, puis réduire $5x - (3x - 7)$.", steps: ["L'opposé de $3x - 7$ est $-(3x - 7)$.", "On change le signe de chaque terme : $-3x + 7$.", "$5x - (3x - 7) = 5x - 3x + 7 = 2x + 7$."], answer: "Opposé : $-3x + 7$ ; $5x - (3x - 7) = 2x + 7$." },
      { title: "Exemple 2 — Double distributivité", statement: "Développer et réduire $(2x + 3)(x - 5)$.", steps: ["$(2x + 3)(x - 5) = 2x \\times x + 2x \\times (-5) + 3 \\times x + 3 \\times (-5)$.", "$= 2x^{2} - 10x + 3x - 15$.", "On réduit : $-10x + 3x = -7x$."], answer: "$(2x + 3)(x - 5) = 2x^{2} - 7x - 15$" },
      { title: "Exemple 3 — Factoriser", statement: "Factoriser $6x^{2} + 9x$, puis $(x + 2)(3x + 1) - (x + 2)(x - 4)$.", steps: ["$6x^{2} = 3x \\times 2x$ et $9x = 3x \\times 3$ : $6x^{2} + 9x = 3x(2x + 3)$.", "Facteur commun $(x + 2)$ : $(x + 2)[(3x + 1) - (x - 4)]$.", "$(3x + 1) - (x - 4) = 3x + 1 - x + 4 = 2x + 5$."], answer: "$6x^{2} + 9x = 3x(2x + 3)$ ; $(x + 2)(3x + 1) - (x + 2)(x - 4) = (x + 2)(2x + 5)$" },
      { title: "Exemple 4 — L'identité $a^{2} - b^{2}$", statement: "Factoriser $4x^{2} - 49$, puis calculer $101 \\times 99$.", steps: ["$4x^{2} = (2x)^{2}$ et $49 = 7^{2}$ : $a = 2x$, $b = 7$.", "$4x^{2} - 49 = (2x - 7)(2x + 7)$.", "$101 \\times 99 = (100 + 1)(100 - 1) = 100^{2} - 1^{2} = 10\\,000 - 1$."], answer: "$4x^{2} - 49 = (2x - 7)(2x + 7)$ ; $101 \\times 99 = 9\\,999$" },
      { title: "Exemple 5 — Démontrer avec un programme de calcul", statement: "Programme : choisir un nombre $n$, lui ajouter $2$, multiplier par $3$, retrancher $6$. Que donne-t-il toujours ?", steps: ["Le programme s'écrit $3(n + 2) - 6$.", "On développe : $3n + 6 - 6$.", "On réduit : $3n$."], answer: "Le résultat est toujours le triple du nombre de départ." },
    ],
    illustrations: [
      { svg: areaModel, alt: "Rectangle de côtés x + 3 et x + 2 découpé en quatre rectangles d'aires x², 3x, 2x et 6.", caption: "$(x + 3)(x + 2) = x^{2} + 3x + 2x + 6$ : l'aire totale est la somme des quatre aires." },
      { svg: squareMinusSquare, alt: "Grand carré de côté a dont on retire dans un coin un petit carré de côté b : l'aire restante est a² − b².", caption: "L'aire du carré de côté $a$ privé d'un carré de côté $b$ vaut $a^{2} - b^{2} = (a - b)(a + b)$." },
    ],
    commonMistakes: [
      { mistake: "$-(a - b) = -a - b$", correction: "$-(a - b) = -a + b$", why: "Le signe $-$ s'applique à **chaque** terme de la parenthèse, y compris au second : $-(-b) = +b$." },
      { mistake: "$2(x + 3) = 2x + 3$", correction: "$2(x + 3) = 2x + 6$", why: "Le facteur multiplie **chaque** terme de la parenthèse, pas seulement le premier." },
      { mistake: "$(x + 2)(x - 3) = x^{2} - 6$", correction: "$(x + 2)(x - 3) = x^{2} - x - 6$", why: "Il faut les quatre produits : $x^{2} - 3x + 2x - 6$, puis on réduit $-3x + 2x = -x$." },
      { mistake: "$3x + 3 = 3x(1 + 1)$", correction: "$3x + 3 = 3(x + 1)$", why: "Le facteur doit se retrouver dans chaque terme ; on vérifie en redéveloppant : $3x(1 + 1) = 6x \\neq 3x + 3$." },
      { mistake: "$a^{2} - b^{2} = (a - b)^{2}$", correction: "$a^{2} - b^{2} = (a - b)(a + b)$", why: "Le produit contient deux facteurs **différents** : la différence et la somme. Test : $5^{2} - 3^{2} = 16$ mais $(5 - 3)^{2} = 4$." },
      { mistake: "« Cela marche pour $x = 1$, $x = 2$ et $x = 3$, donc l'égalité est vraie pour tout $x$. »", correction: "Vérifier des exemples ne démontre pas une égalité générale.", why: "Il faut un calcul littéral. En revanche, un seul contre-exemple suffit à réfuter une égalité." },
    ],
    methods: [
      { title: "Développer avec la double distributivité", steps: ["Écrire les quatre produits $ac + ad + bc + bd$ en gardant les signes de chaque terme.", "Calculer chaque produit avec la règle des signes.", "Réduire en regroupant les termes de même nature."] },
      { title: "Factoriser une expression", steps: ["Repérer un facteur commun à tous les termes (nombre, lettre ou parenthèse).", "Écrire chaque terme comme un produit contenant ce facteur.", "Mettre le facteur devant une parenthèse contenant ce qui reste, puis vérifier en développant."] },
      { title: "Utiliser $a^{2} - b^{2} = (a - b)(a + b)$", steps: ["Vérifier qu'il s'agit d'une **différence** de deux carrés.", "Identifier $a$ et $b$ (par exemple $9x^{2} = (3x)^{2}$).", "Écrire $(a - b)(a + b)$, puis réduire chaque parenthèse."] },
      { title: "Démontrer ou réfuter", steps: ["Traduire le problème par une expression littérale (programme de calcul, figure…).", "Pour démontrer : développer ou factoriser pour obtenir le résultat annoncé, quel que soit le nombre de départ.", "Pour réfuter : choisir une valeur simple (en évitant celles qui « cachent » l'erreur, comme $0$), calculer les deux membres, constater l'écart.", "Conclure par une phrase."] },
    ],
    summary: [
      "L'opposé d'une expression s'obtient en changeant le signe de chaque terme : $-(A - B) = -A + B$.",
      "Double distributivité : $(a + b)(c + d) = ac + ad + bc + bd$ (quatre produits), puis on réduit.",
      "Factoriser, c'est écrire une somme comme un produit en repérant un facteur commun : $kA + kB = k(A + B)$.",
      "Identité : $a^{2} - b^{2} = (a - b)(a + b)$ ; on l'utilise pour développer un produit ou factoriser une différence de deux carrés.",
      "Une identité est vraie pour toutes les valeurs ; un seul contre-exemple suffit à réfuter une égalité.",
      "Pour démontrer un résultat général, on travaille avec une lettre ; tester des exemples ne suffit pas.",
    ],
    revisionSheet: {
      keyPoints: ["$-(A - B) = -A + B$.", "$(a + b)(c + d) = ac + ad + bc + bd$.", "$kA + kB = k(A + B)$.", "$a^{2} - b^{2} = (a - b)(a + b)$ : par exemple $x^{2} - 36 = (x - 6)(x + 6)$.", "Un contre-exemple réfute ; un calcul littéral démontre."],
      skills: ["Déterminer l'opposé d'une expression littérale.", "Développer avec la double distributivité et réduire.", "Factoriser par un facteur commun et avec $a^{2} - b^{2}$.", "Démontrer l'équivalence de deux programmes de calcul.", "Réfuter une conjecture avec un contre-exemple."],
    },
    miniQuiz: [
      { question: "Le développement réduit de $(x + 3)(x - 2)$ est…", options: ["$x^{2} - 6$", "$x^{2} + x - 6$", "$x^{2} + 5x - 6$", "$x^{2} - x - 6$"], answer: 1, explanation: "$x^{2} - 2x + 3x - 6 = x^{2} + x - 6$." },
      { question: "L'opposé de $3x - 7$ est…", options: ["$-3x - 7$", "$-3x + 7$", "$3x + 7$", "$3x - 7$"], answer: 1, explanation: "On change le signe de chaque terme : $-3x + 7$." },
      { question: "La factorisation de $x^{2} - 36$ est…", options: ["$(x - 6)^{2}$", "$(x - 6)(x + 6)$", "$(x - 18)(x + 18)$", "$x(x - 36)$"], answer: 1, explanation: "$a = x$ et $b = 6$ : $(x - 6)(x + 6)$." },
      { question: "$51 \\times 49$ vaut…", options: ["$2\\,499$", "$2\\,500$", "$2\\,501$", "$2\\,401$"], answer: 0, explanation: "$51 \\times 49 = (50 + 1)(50 - 1) = 2\\,500 - 1 = 2\\,499$." },
      { question: "La factorisation de $3x + 3$ est…", options: ["$3x(1 + 1)$", "$3(x + 1)$", "$3(x + 3)$", "$x(3 + 3)$"], answer: 1, explanation: "$3x + 3 = 3 \\times x + 3 \\times 1 = 3(x + 1)$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "cl3-jeu-flash", template: "calcul-flash", title: "Flash calcul littéral",
      objective: "Automatiser les coefficients d'un développement, les calculs astucieux avec l'identité remarquable et la lecture d'un facteur commun.",
      instructions: "Réponds le plus vite possible par un nombre. Le niveau monte après trois bonnes réponses d'affilée.",
      objectives: ["M3-NC-08", "M3-NC-09", "M3-NC-10"],
      config: flashConfig([
        ["Opposés et distributivité", [
          ["Coefficient de $x$ dans $-(3x - 5)$", "-3", "Le signe $-$ change le signe de $3x$."],
          ["Terme constant dans $-(3x - 5)$", "5", "$-(-5) = +5$."],
          ["Calcule $-(4 - 9)$", "5", "$-(4 - 9) = -4 + 9 = 5$."],
          ["Calcule $5 - (2 - 7)$", "10", "$5 - 2 + 7 = 10$."],
          ["Calcule $7 \\times 102$ avec $7 \\times (100 + 2)$", "714", "$700 + 14$."],
          ["Calcule $8 \\times 99$ avec $8 \\times (100 - 1)$", "792", "$800 - 8$."],
          ["Coefficient de $x$ dans $-(-2x + 7)$", "2", "$-(-2x) = +2x$."],
        ]],
        ["Double distributivité", [
          ["Coefficient de $x$ dans $(x + 2)(x + 5)$", "7", "$5x + 2x = 7x$."],
          ["Terme constant dans $(x - 3)(x + 4)$", "-12", "$(-3) \\times 4 = -12$."],
          ["Coefficient de $x$ dans $(x - 3)(x + 4)$", "1", "$4x - 3x = x$."],
          ["Coefficient de $x^{2}$ dans $(2x + 1)(3x + 5)$", "6", "$2 \\times 3 = 6$."],
          ["Coefficient de $x$ dans $(2x + 1)(3x + 5)$", "13", "$10x + 3x = 13x$."],
          ["Terme constant dans $(x - 2)(x - 6)$", "12", "$(-2) \\times (-6) = 12$."],
          ["Coefficient de $x$ dans $(x - 2)(x - 6)$", "-8", "$-6x - 2x = -8x$."],
          ["Coefficient de $x$ dans $(2x - 3)(x + 4)$", "5", "$8x - 3x = 5x$."],
        ]],
        ["Identité et factorisation", [
          ["Calcule $101 \\times 99$", "9999", "$100^{2} - 1^{2}$."],
          ["Calcule $51 \\times 49$", "2499", "$50^{2} - 1^{2}$."],
          ["Calcule $1001 \\times 999$", "999999", "$1000^{2} - 1^{2}$."],
          ["Calcule $32^{2} - 28^{2}$", "240", "$(32 - 28)(32 + 28) = 4 \\times 60$."],
          ["Calcule $75^{2} - 25^{2}$", "5000", "$(75 - 25)(75 + 25) = 50 \\times 100$."],
          ["$x^{2} - 49 = (x - 7)(x + b)$ : que vaut $b$ ?", "7", "$a^{2} - b^{2} = (a - b)(a + b)$."],
          ["Plus grand facteur commun numérique de $12x + 18$", "6", "$12x + 18 = 6(2x + 3)$."],
          ["Valeur de $(x + 3)(x - 3)$ pour $x = 10$", "91", "$x^{2} - 9 = 100 - 9$."],
        ]],
      ]),
    },
    {
      id: "cl3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs de calcul littéral",
      objective: "Repérer et nommer les erreurs typiques sur les signes, la distributivité, la factorisation et l'identité remarquable.",
      instructions: "Pour chaque égalité, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
      objectives: ["M3-NC-08", "M3-NC-09", "M3-NC-10", "M3-NC-11"],
      config: erreursConfig([
        [1, "$-(x - 4) = -x + 4$", "Le signe $-$ change le signe de chaque terme de la parenthèse."],
        [1, "$-(a - b) = -a - b$", "$-(a - b) = -a + b$ : le signe du second terme change aussi.", ["Le signe $-$ n'a été appliqué qu'au premier terme", "Les deux termes ont été échangés", "Il fallait additionner $a$ et $b$"], 0],
        [1, "$2(x + 3) = 2x + 3$", "$2(x + 3) = 2x + 6$ : le facteur multiplie chaque terme.", ["Le facteur n'a multiplié que le premier terme", "Le facteur a été ajouté au lieu d'être multiplié", "Le signe du second terme a été changé"], 0],
        [2, "$(x + 2)(x - 3) = x^{2} - x - 6$", "$x^{2} - 3x + 2x - 6 = x^{2} - x - 6$."],
        [2, "$(x + 2)(x - 3) = x^{2} - 6$", "Il manque les produits « croisés » : $x^{2} - 3x + 2x - 6 = x^{2} - x - 6$.", ["Seuls le premier et le dernier produits ont été calculés", "Le produit $2 \\times (-3)$ a le mauvais signe", "Il fallait additionner les deux parenthèses"], 0],
        [2, "$3x + 3 = 3x(1 + 1)$", "$3x + 3 = 3(x + 1)$ : le facteur commun est $3$, pas $3x$.", ["Le facteur choisi n'est pas commun aux deux termes", "Il fallait mettre $x$ en facteur", "Il fallait diviser par $3$ sans parenthèse"], 0],
        [3, "$x^{2} - 25 = (x - 5)(x + 5)$", "Identité $a^{2} - b^{2} = (a - b)(a + b)$ avec $a = x$ et $b = 5$."],
        [3, "$a^{2} - b^{2} = (a - b)^{2}$", "Le produit correct est $(a - b)(a + b)$ ; par exemple $5^{2} - 3^{2} = 16$ mais $(5 - 3)^{2} = 4$.", ["On a oublié que les deux facteurs sont différents", "Il fallait écrire $(a + b)^{2}$", "Il fallait écrire $a^{2} + b^{2}$"], 0],
        [3, "$x^{2} + 9 = (x - 3)(x + 3)$", "$(x - 3)(x + 3) = x^{2} - 9$ : l'identité s'applique à une **différence** de deux carrés.", ["On a appliqué l'identité à une somme de deux carrés", "$3$ n'est pas la racine de $9$", "Les deux parenthèses sont inversées"], 0],
        [4, "« L'égalité est vraie pour $x = 1$, $x = 2$ et $x = 3$, donc c'est une identité. »", "Quelques exemples ne prouvent rien : il faut un calcul littéral valable pour tout $x$.", ["Vérifier des exemples ne démontre pas une égalité générale", "Il fallait tester aussi $x = 4$", "Une identité ne se démontre jamais"], 0],
        [4, "« $(x + 1)(x + 2) = x^{2} + 2$ est fausse car elle est fausse pour $x = 1$. »", "Un seul contre-exemple suffit à réfuter : pour $x = 1$ on trouve $6$ et $3$."],
      ]),
    },
    {
      id: "cl3-jeu-memory", template: "memory", title: "Memory des expressions équivalentes",
      objective: "Associer une expression développée à sa forme factorisée ou à une écriture équivalente.",
      instructions: "Retourne deux cartes : si elles représentent la même expression, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-NC-08", "M3-NC-09", "M3-NC-10"],
      config: { pairs: [
        ["$(x + 2)(x + 3)$", "$x^{2} + 5x + 6$"],
        ["$(x - 2)(x + 3)$", "$x^{2} + x - 6$"],
        ["$(x - 1)(x - 4)$", "$x^{2} - 5x + 4$"],
        ["$x^{2} - 16$", "$(x - 4)(x + 4)$"],
        ["$-(x - 5)$", "$-x + 5$"],
        ["$3x + 6$", "$3(x + 2)$"],
      ] },
    },
  ],
};
