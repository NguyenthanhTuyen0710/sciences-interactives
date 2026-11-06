// SCI-3E-MATH-002 — Mathématiques 3e : Fractions, puissances et racines carrées
// (programme du cycle 4 de 2020, BO n° 31 du 30 juillet 2020 ; repères annuels et attendus de fin de 3e, BO n° 22 du 29 mai 2019).
// Contenu original rédigé à partir du dossier research/dossiers/math-3e-puissances-calculs.md.
// Hors programme (non exigé) : propriétés algébriques des racines carrées (√a × √b, √(a/b)…), puissances d'exposant non entier.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, NumAnswer, Rng } from "../../engine/types";
import { clean, fracTex, frFixed, gcd, parseNumber, roundTo, simplify, tex } from "../../engine/numbers";

const T = (x: number) => tex(x, 10);
/** Nombre entre parenthèses s'il est négatif. */
const P = (x: number) => (x < 0 ? `(${T(x)})` : T(x));
/** Fraction telle qu'écrite (non simplifiée) et fraction simplifiée. */
const Fw = (n: number, d: number) => fracTex(n, d, false);
const Fs = (n: number, d: number) => fracTex(n, d);
/** Saisie élève d'une fraction simplifiée (pour les diagnostics). */
const mf = (n: number, d: number) => { const [a, b] = simplify(n, d); return b === 1 ? String(a) : `${a}/${b}`; };
const pw = (b: number | string, e: number) => `${typeof b === "number" && b < 0 ? `(${T(b)})` : b}^{${e}}`;
const nz = (rng: Rng, a: number, b: number) => { let v = 0; while (v === 0) v = rng.int(a, b); return v; };
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

const differs = (value: number) => (m: Mistake) => { const p = parseNumber(m.match); return !p || Math.abs(p.value - value) > 1e-9 * Math.max(1, Math.abs(value)); };
/** Écriture LaTeX avec un nombre fixe de décimales (affichage d'un arrondi : 12,0). */
const TF = (x: number, d: number) => frFixed(x, d).replace("−", "-").replace(",", "{,}").replace(/ /g, "\\,");
/** Supprime les diagnostics égaux à la bonne réponse et les doublons de valeur. */
const keep = (value: number, ms: Mistake[]) => ms.filter(differs(value)).filter((m, i, all) => all.findIndex((x) => !differs(parseNumber(x.match)?.value ?? NaN)(m)) === i);
const num = (value: number, mistakes: Mistake[] = [], prompt?: string, extra: Partial<NumAnswer> = {}): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value, ...extra } }, mistakes: keep(value, mistakes) });
/** Réponse exacte sous forme de fraction (une valeur décimale approchée est refusée). */
const frac = (n: number, d: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => {
  const [a, b] = simplify(n, d);
  return { prompt, interaction: { kind: "numerique", answer: { value: a / b, fraction: [a, b] } }, mistakes: keep(a / b, mistakes) };
};
const fracAns = (n: number, d: number): NumAnswer => { const [a, b] = simplify(n, d); return { value: a / b, fraction: [a, b] }; };
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
/** Mélange des options en conservant la bonne réponse et les diagnostics (indices d'origine). */
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}

/** Écriture décimale exacte (LaTeX) de D × 10^e, D entier positif : sans erreur d'arrondi des flottants. */
function decTex(D: number, e: number): string {
  let s = String(D);
  let int: string, dec = "";
  if (e >= 0) int = s + "0".repeat(e);
  else {
    s = s.padStart(-e + 1, "0");
    int = s.slice(0, s.length + e);
    dec = s.slice(s.length + e).replace(/0+$/, "");
  }
  int = int.replace(/^0+(?=\d)/, "");
  const g = int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : int;
  return dec ? `${g}{,}${dec}` : g;
}
/** Notation scientifique de D × 10^e (D entier > 0) : [mantisse, exposant]. */
function sciFromInt(D: number, e: number): [number, number] {
  while (D % 10 === 0) { D /= 10; e++; }
  const len = String(D).length;
  return [clean(D / 10 ** (len - 1), 12), e + len - 1];
}
const sciTx = (m: number, p: number) => `${T(m)} \\times 10^{${p}}`;
/** Nombre de décimales nécessaire pour afficher 10^-k ou m × 10^p. */
const decs = (x: number) => { const s = String(x); if (s.includes("e-")) { const [mm, ee] = s.split("e-"); return Number(ee) + (mm.split(".")[1]?.length ?? 0); } return s.split(".")[1]?.length ?? 0; };
const blanksSci = (m: number, p: number) => [{ type: "number" as const, answer: { value: m } }, { type: "number" as const, answer: { value: p } }];

// Petits calculs exacts sur les fractions [num, den]
type Q = [number, number];
const q = (n: number, d: number): Q => simplify(n, d);
const qAdd = (a: Q, b: Q): Q => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const qSub = (a: Q, b: Q): Q => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const qMul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1]);
const qDiv = (a: Q, b: Q): Q => q(a[0] * b[1], a[1] * b[0]);
const QT = (a: Q) => Fs(a[0], a[1]);
/** Fraction irréductible et non entière n/d, avec 1 ≤ n < d : jamais un entier ni 1 dans un énoncé. */
const pf = (rng: Rng, dmin: number, dmax: number): Q => { const d = rng.int(Math.max(2, dmin), dmax); let n = rng.int(1, d - 1); while (gcd(n, d) !== 1) n = rng.int(1, d - 1); return [n, d]; };
/** Idem avec un dénominateur choisi dans une liste. */
const pfIn = (rng: Rng, dens: number[]): Q => { const d = rng.pick(dens); let n = rng.int(1, d - 1); while (gcd(n, d) !== 1) n = rng.int(1, d - 1); return [n, d]; };

const O = {
  "M3-NC-04": "Utiliser les puissances d'exposant négatif d'un nombre quelconque pour simplifier des quotients.",
  "M3-NC-05": "Résoudre des problèmes avec puissances et notation scientifique.",
  "M3-NC-06": "Résoudre des problèmes mettant en jeu des racines carrées.",
  "M3-NC-07": "Calculer avec des rationnels dans des problèmes.",
  "M4-NC-04": "(Consolidation 4e) Multiplier et diviser des fractions ; utiliser l'inverse.",
  "M4-NC-07": "(Consolidation 4e) Utiliser les puissances de 10 d'exposants positifs et négatifs.",
  "M4-NC-08": "(Consolidation 4e) Utiliser les préfixes de nano à giga et la notation scientifique pour comparer et estimer des ordres de grandeur.",
  "M4-NC-09": "(Consolidation 4e) Utiliser les puissances d'exposant positif d'un nombre pour simplifier l'écriture des produits.",
  "M4-NC-10": "(Consolidation 4e) Connaître les carrés parfaits de 1 à 144 et la définition de la racine carrée d'un nombre positif.",
  "M4-NC-11": "(Consolidation 4e) Encadrer une racine carrée entre deux entiers et en obtenir une valeur approchée à la calculatrice.",
} as const;
type Obj = keyof typeof O;
const SRC: Record<Obj, string> = {
  "M3-NC-04": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 3e › Puissances ; Attendus de fin d'année de 3e (2019)",
  "M3-NC-05": "Attendus de fin d'année de 3e (2019) › Pratiquer le calcul ; programme cycle 4 2020 (BO n° 31 du 30-07-2020), thème A",
  "M3-NC-06": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 3e › Racine carrée ; Attendus de fin d'année de 3e (2019)",
  "M3-NC-07": "Attendus de fin d'année de 3e (2019) › Pratiquer le calcul",
  "M4-NC-04": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 4e › Fractions ; Attendus de fin d'année de 4e (2019)",
  "M4-NC-07": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 4e › Puissances ; Attendus de fin d'année de 4e (2019)",
  "M4-NC-08": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 4e › Puissances ; Attendus de fin d'année de 4e (2019)",
  "M4-NC-09": "Repères annuels de progression cycle 4 (BO n° 22 du 29-05-2019), 4e › Puissances ; Attendus de fin d'année de 4e (2019)",
  "M4-NC-10": "Programme cycle 4 2020 (BO n° 31 du 30-07-2020), thème A › Nombres ; Attendus de fin d'année de 4e (2019)",
  "M4-NC-11": "Attendus de fin d'année de 4e (2019) › Comparaison de nombres / Pratiquer le calcul",
};

// ───────────────────────── Exercices ─────────────────────────
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

const PREFIXES: [string, number][] = [["giga (G)", 9], ["méga (M)", 6], ["kilo (k)", 3], ["milli (m)", -3], ["micro (µ)", -6], ["nano (n)", -9]];

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "pc3-01", title: "Que signifie une puissance ?", niveau: 1, objectives: ["M4-NC-09"], time: 60,
    vary: (rng) => {
      const n = rng.int(3, 5);
      let a = rng.int(2, 9);
      if (a === n) a = n + 2;
      const prod = Array(n).fill(String(a)).join(" \\times ");
      return {
        statement: `On considère le nombre $${pw(a, n)}$.`,
        parts: [
          shuffledQcm(rng, [`$${prod}$`, `$${a} \\times ${n}$`, `$${Array(n).fill(String(a)).join(" + ")}$`, `$${n} \\times ${n} \\times \\ldots \\times ${n}$ (${a} facteurs)`], 0, {
            1: `$${pw(a, n)}$ n'est pas « $${a}$ fois $${n}$ » : l'exposant indique le **nombre de facteurs**.`,
            2: "Une puissance est un produit répété, pas une somme répétée.",
            3: "Tu as inversé la base et l'exposant : la base est le nombre répété.",
          }, "Quelle écriture est égale à ce nombre ?"),
          num(a ** n, [{ match: String(a * n), feedback: `Tu as calculé $${a} \\times ${n}$ : il faut multiplier $${n}$ facteurs égaux à $${a}$.` }, { match: String(n ** a), feedback: `Tu as calculé $${pw(n, a)}$ : base et exposant sont inversés.` }], "Calculer ce nombre."),
        ],
        solution: [`$${pw(a, n)}$ est le produit de $${n}$ facteurs égaux à $${a}$ : $${pw(a, n)} = ${prod}$.`, `$${pw(a, n)} = ${T(a ** n)}$.`],
      };
    },
    reasoning: "Pour un entier $n \\geqslant 1$, $a^n$ est le produit de $n$ facteurs tous égaux à $a$ ; $a$ est la base et $n$ l'exposant.",
    hints: ["Combien de fois le nombre de base est-il écrit dans le produit ?", "Calcule de proche en proche : multiplie le résultat par la base à chaque étape."],
  }),
  ex({
    id: "pc3-02", title: "Puissances de 10", niveau: 1, objectives: ["M4-NC-07"], time: 60,
    vary: (rng) => {
      const n = rng.int(2, 6), k = rng.int(2, 6);
      return {
        statement: "Donner l'écriture décimale de chaque puissance de 10.",
        parts: [{ interaction: { kind: "texte-trous", template: `$10^{${n}} =$ [[0]]\n$10^{-${k}} =$ [[1]]\n$10^{0} =$ [[2]]`, blanks: [{ type: "number", answer: { value: 10 ** n } }, { type: "number", answer: { value: clean(10 ** -k), decimals: k } }, { type: "number", answer: { value: 1 } }] } }],
        solution: [`$10^{${n}}$ s'écrit avec un 1 suivi de ${n} zéros : $10^{${n}} = ${decTex(1, n)}$.`, `$10^{-${k}} = \\dfrac{1}{10^{${k}}}$ : le chiffre 1 est à la ${k}e position après la virgule : $10^{-${k}} = ${decTex(1, -k)}$.`, "Par convention, $10^0 = 1$."],
      };
    },
    reasoning: "L'exposant d'une puissance de 10 compte les zéros (exposant positif) ou donne le rang du chiffre 1 après la virgule (exposant négatif).",
    hints: ["Un exposant positif : combien de zéros après le 1 ?", "Un exposant négatif $-k$ : le 1 est au $k$-ième rang après la virgule."],
  }),
  ex({
    id: "pc3-03", title: "Carrés parfaits et racines carrées", niveau: 1, objectives: ["M4-NC-10"], time: 75,
    vary: (rng) => {
      const ks = rng.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 4);
      const right = rng.shuffle(ks);
      return {
        statement: "Associer chaque racine carrée à sa valeur.",
        parts: [{ interaction: { kind: "associer", left: ks.map((k) => `$\\sqrt{${k * k}}$`), right: right.map((k) => `$${k}$`), answer: ks.map((k) => right.indexOf(k)) } }],
        solution: ks.map((k) => `$${k}^2 = ${k * k}$ et $${k} \\geqslant 0$, donc $\\sqrt{${k * k}} = ${k}$.`),
      };
    },
    reasoning: "$\\sqrt{a}$ est le nombre **positif** dont le carré vaut $a$ : connaître les carrés de 1 à 12 permet de trouver ces racines de tête.",
    hints: ["Quel nombre positif, multiplié par lui-même, donne le nombre sous la racine ?", "Récite la table des carrés : $1, 4, 9, 16, 25, \\ldots, 144$."],
  }),
  ex({
    id: "pc3-04", title: "Exposant négatif", niveau: 1, objectives: ["M3-NC-04"], time: 75,
    vary: (rng) => {
      const a = rng.int(2, 9), n = rng.int(2, 3);
      return {
        statement: `On considère le nombre $${pw(a, -n)}$.`,
        parts: [
          shuffledQcm(rng, [`$\\dfrac{1}{${pw(a, n)}}$`, `$-${pw(a, n)}$`, `$${a} \\times (-${n})$`, `$\\dfrac{${n}}{${a}}$`], 0, {
            1: "Un exposant négatif ne rend pas le nombre négatif : il donne un **inverse**.",
            2: "Une puissance n'est pas le produit de la base par l'exposant.",
          }, "Quelle écriture est égale à ce nombre ?"),
          frac(1, a ** n, [{ match: String(-(a ** n)), feedback: "Un exposant négatif donne l'inverse : le résultat est positif." }, { match: String(-a * n), feedback: "Tu as multiplié la base par l'exposant." }], "Donner sa valeur exacte (fraction irréductible ou décimal exact)."),
        ],
        solution: [`Par définition, $${pw(a, -n)} = \\dfrac{1}{${pw(a, n)}}$.`, `$${pw(a, n)} = ${a ** n}$, donc $${pw(a, -n)} = ${Fw(1, a ** n)}$.`],
      };
    },
    reasoning: "Pour $a \\neq 0$ et $n$ entier positif, $a^{-n}$ est l'inverse de $a^n$ : $a^{-n} = \\dfrac{1}{a^n}$. C'est un nombre positif si $a > 0$.",
    hints: ["Que signifie un exposant négatif : un opposé ou un inverse ?", "Calcule d'abord la puissance avec l'exposant positif."],
  }),
  ex({
    id: "pc3-05", title: "Multiplier deux fractions", niveau: 1, objectives: ["M4-NC-04"], time: 60,
    vary: (rng) => {
      const [a, b] = pf(rng, 2, 9);
      let [c, d] = pf(rng, 2, 9);
      while (d === b) [c, d] = pf(rng, 2, 9);
      const [rn, rd] = simplify(a * c, b * d);
      return {
        statement: `Calculer $${Fw(a, b)} \\times ${Fw(c, d)}$ et donner le résultat sous forme irréductible.`,
        parts: [frac(a * c, b * d, [
          { match: mf(a + c, b + d), feedback: "On ne multiplie pas des fractions en additionnant numérateurs et dénominateurs." },
          { match: mf(a * d, b * c), feedback: "Tu as divisé au lieu de multiplier (tu as inversé la seconde fraction)." },
        ])],
        solution: [`On multiplie les numérateurs entre eux et les dénominateurs entre eux : $${Fw(a, b)} \\times ${Fw(c, d)} = \\dfrac{${a} \\times ${c}}{${b} \\times ${d}} = ${Fw(a * c, b * d)}$.`, rd === b * d && rn === a * c ? "La fraction est déjà irréductible." : `On simplifie par $${gcd(a * c, b * d)}$ : $${Fw(a * c, b * d)} = ${Fs(a * c, b * d)}$.`],
      };
    },
    reasoning: "$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{a \\times c}{b \\times d}$ ; on simplifie ensuite (ou avant, en décomposant).",
    hints: ["Pour multiplier, inutile de mettre au même dénominateur.", "Pense à simplifier le résultat."],
  }),
  ex({
    id: "pc3-06", title: "Notation scientifique ou non ?", niveau: 1, objectives: ["M4-NC-08"], time: 90,
    vary: (rng) => {
      const items: { s: string; ok: boolean; why: string }[] = [];
      const e = () => nz(rng, -9, 12);
      const m1 = rng.int(11, 99) / 10, p1 = e();
      items.push({ s: sciTx(m1, p1), ok: true, why: `$${T(m1)}$ est compris entre 1 et 10 (10 exclu).` });
      let m2 = rng.int(101, 999) / 100, p2 = e();
      while (m2 === m1 && p2 === p1) { m2 = rng.int(101, 999) / 100; p2 = e(); }
      items.push({ s: sciTx(m2, p2), ok: true, why: `$${T(m2)}$ est compris entre 1 et 10.` });
      const m3 = rng.int(11, 99), p3 = e();
      items.push({ s: sciTx(m3, p3), ok: false, why: `$${m3}$ est supérieur à 10 : on écrirait $${sciTx(m3 / 10, p3 + 1)}$.` });
      const m4 = rng.int(1, 9) / 10, p4 = e();
      items.push({ s: sciTx(m4, p4), ok: false, why: `$${T(m4)}$ est inférieur à 1 : on écrirait $${sciTx(m4 * 10, p4 - 1)}$.` });
      const p5 = rng.int(2, 8);
      items.push({ s: sciTx(10, p5), ok: false, why: `Le nombre devant la puissance doit être strictement inférieur à 10 : $10 \\times 10^{${p5}} = 1 \\times 10^{${p5 + 1}}$.` });
      const its = rng.shuffle(items);
      return {
        statement: "Pour chaque écriture, dire si elle est en **notation scientifique**.",
        parts: [{ interaction: { kind: "vrai-faux", items: its.map((i) => `$${i.s}$`), answer: its.map((i) => i.ok) } }],
        solution: ["Un nombre positif est en notation scientifique s'il s'écrit $a \\times 10^{n}$ avec $1 \\leqslant a < 10$ et $n$ entier relatif.", ...its.map((i) => `$${i.s}$ : ${i.ok ? "oui" : "non"} ; ${i.why}`)],
      };
    },
    reasoning: "Seul le nombre $a$ placé devant la puissance de 10 est contrôlé : il doit avoir **un seul chiffre non nul avant la virgule**. L'exposant peut être positif ou négatif.",
    hints: ["Regarde uniquement le nombre écrit devant $\\times 10^{n}$.", "Est-il au moins égal à 1 et strictement inférieur à 10 ?"],
  }),
  ex({
    id: "pc3-07", title: "Préfixes et puissances de 10", niveau: 1, objectives: ["M4-NC-08"], time: 75,
    vary: (rng) => {
      const chosen = rng.shuffle(PREFIXES).slice(0, 4);
      const right = rng.shuffle(chosen);
      return {
        statement: "Associer chaque préfixe à la puissance de 10 qu'il représente (exemple : 1 km = $10^{3}$ m).",
        parts: [{ interaction: { kind: "associer", left: chosen.map(([n]) => n), right: right.map(([, p]) => `$10^{${p}}$`), answer: chosen.map((c) => right.indexOf(c)) } }],
        solution: chosen.map(([n, p]) => `${n} : $10^{${p}}$${p > 0 ? ` (${decTex(1, p)})` : ` (${decTex(1, p)})`}.`),
      };
    },
    reasoning: "Les préfixes vont de 3 en 3 : kilo, méga, giga pour $10^3$, $10^6$, $10^9$ ; milli, micro, nano pour $10^{-3}$, $10^{-6}$, $10^{-9}$.",
    hints: ["Quel préfixe signifie « mille » ? Les autres préfixes avancent de 3 en 3 dans les exposants.", "Les « petits » préfixes (milli, micro, nano) ont des exposants négatifs."],
  }),

  // ── Niveau 2 : Application directe ──
  ex({
    id: "pc3-08", title: "Additionner ou soustraire des fractions", niveau: 2, objectives: ["M3-NC-07"], time: 90,
    vary: (rng) => {
      const [a, b] = pf(rng, 2, 12);
      let [c, d] = pf(rng, 2, 12);
      while (d === b) [c, d] = pf(rng, 2, 12);
      const plus = rng.next() < 0.6;
      const L = lcm(b, d);
      const res = plus ? qAdd([a, b], [c, d]) : qSub([a, b], [c, d]);
      const wrong = plus ? mf(a + c, b + d) : (b - d !== 0 ? mf(a - c, b - d) : "");
      const mistakes: Mistake[] = wrong ? [{ match: wrong, feedback: "On n'additionne (ni ne soustrait) les dénominateurs : il faut d'abord un **dénominateur commun**." }] : [];
      return {
        statement: `Calculer $${Fw(a, b)} ${plus ? "+" : "-"} ${Fw(c, d)}$ et donner le résultat sous forme irréductible.`,
        parts: [frac(res[0], res[1], mistakes)],
        solution: [
          `Un dénominateur commun est $${L}$ (multiple commun de $${b}$ et $${d}$).`,
          `$${Fw(a, b)} = ${Fw(a * (L / b), L)}$ et $${Fw(c, d)} = ${Fw(c * (L / d), L)}$.`,
          `$${Fw(a * (L / b), L)} ${plus ? "+" : "-"} ${Fw(c * (L / d), L)} = ${Fw(plus ? a * (L / b) + c * (L / d) : a * (L / b) - c * (L / d), L)}${simplify(plus ? a * (L / b) + c * (L / d) : a * (L / b) - c * (L / d), L)[1] !== L ? ` = ${QT(res)}` : ""}$.`,
        ],
      };
    },
    reasoning: "On ne peut additionner ou soustraire que des fractions de **même dénominateur** : on garde alors le dénominateur et on ajoute (ou soustrait) les numérateurs.",
    hints: ["Cherche le plus petit multiple commun aux deux dénominateurs.", "Transforme chaque fraction en multipliant numérateur et dénominateur par le même nombre."],
  }),
  ex({
    id: "pc3-09", title: "Diviser par une fraction", niveau: 2, objectives: ["M4-NC-04"], time: 75,
    vary: (rng) => {
      const [a, b] = pf(rng, 2, 9);
      let [c, d] = pf(rng, 2, 9);
      while (c === a && d === b) [c, d] = pf(rng, 2, 9);
      return {
        statement: `Calculer $${Fw(a, b)} \\div ${Fw(c, d)}$ et donner le résultat sous forme irréductible.`,
        parts: [frac(a * d, b * c, [
          { match: mf(a * c, b * d), feedback: "Tu as multiplié par la fraction au lieu de multiplier par son **inverse**." },
          { match: mf(b * c, a * d), feedback: "Tu as inversé la mauvaise fraction : c'est le diviseur (la seconde) qu'on inverse." },
        ])],
        solution: [`Diviser par $${Fw(c, d)}$, c'est multiplier par son inverse $${Fw(d, c)}$.`, `$${Fw(a, b)} \\div ${Fw(c, d)} = ${Fw(a, b)} \\times ${Fw(d, c)} = ${Fw(a * d, b * c)}${simplify(a * d, b * c)[1] !== b * c ? ` = ${Fs(a * d, b * c)}` : ""}$.`],
      };
    },
    reasoning: "Pour $c \\neq 0$ et $d \\neq 0$ : $\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$, car $\\dfrac{d}{c} \\times \\dfrac{c}{d} = 1$.",
    hints: ["Quel est l'inverse de la seconde fraction ?", "Remplace la division par une multiplication."],
  }),
  ex({
    id: "pc3-10", title: "Règles de calcul sur les puissances", niveau: 2, objectives: ["M3-NC-04"], time: 120,
    vary: (rng) => {
      const a = rng.pick([2, 3, 5, 7, 10]);
      const m = nz(rng, -5, 7), n = nz(rng, -5, 7), r = nz(rng, -6, 6), s = nz(rng, -6, 6), u = rng.int(2, 4), v = nz(rng, -3, 4);
      return {
        statement: "Écrire chaque nombre sous la forme d'une seule puissance de $" + a + "$, puis donner l'exposant $k$.",
        parts: [{ interaction: { kind: "texte-trous", template: `$${pw(a, m)} \\times ${pw(a, n)} = ${a}^{k}$ avec $k =$ [[0]]\n$\\dfrac{${pw(a, r)}}{${pw(a, s)}} = ${a}^{k}$ avec $k =$ [[1]]\n$(${pw(a, u)})^{${v}} = ${a}^{k}$ avec $k =$ [[2]]`, blanks: [{ type: "number", answer: { value: m + n } }, { type: "number", answer: { value: r - s } }, { type: "number", answer: { value: u * v } }] } }],
        solution: [`Produit : on additionne les exposants, $${P(m)} + ${P(n)} = ${m + n}$.`, `Quotient : on soustrait l'exposant du dénominateur, $${P(r)} - ${P(s)} = ${r - s}$.`, `Puissance d'une puissance : on multiplie les exposants, $${P(u)} \\times ${P(v)} = ${u * v}$.`],
      };
    },
    reasoning: "Pour $a \\neq 0$ et $m$, $n$ entiers relatifs : $a^m \\times a^n = a^{m+n}$, $\\dfrac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{m \\times n}$. On les retrouve en comptant les facteurs.",
    hints: ["Écris $2^3 \\times 2^2$ en produit de 2 : combien de facteurs ?", "Dans un quotient, attention au signe quand on soustrait un exposant négatif."],
  }),
  ex({
    id: "pc3-11", title: "Écrire un nombre en notation scientifique", niveau: 2, objectives: ["M4-NC-08"], time: 75,
    vary: (rng) => {
      const D = rng.next() < 0.5 ? rng.int(11, 99) : rng.int(101, 999);
      const big = rng.next() < 0.5;
      const e = big ? rng.int(2, 7) : -rng.int(4, 9);
      const [m, p] = sciFromInt(D, e);
      return {
        statement: `Écrire $${decTex(D, e)}$ en notation scientifique.`,
        parts: [{ interaction: { kind: "texte-trous", template: `$${decTex(D, e)} =$ [[0]] $\\times 10^{k}$ avec $k =$ [[1]]`, blanks: blanksSci(m, p) } }],
        solution: [`On place la virgule après le premier chiffre non nul : $${T(m)}$.`, `On a déplacé la virgule de $${Math.abs(p)}$ rang${Math.abs(p) > 1 ? "s" : ""} vers la ${p > 0 ? "gauche (nombre plus grand que 10 : exposant positif)" : "droite (nombre plus petit que 1 : exposant négatif)"}.`, `$${decTex(D, e)} = ${sciTx(m, p)}$.`],
      };
    },
    reasoning: "Notation scientifique : $a \\times 10^{n}$ avec $1 \\leqslant a < 10$. L'exposant compte de combien de rangs on a déplacé la virgule.",
    hints: ["Où placer la virgule pour n'avoir qu'un chiffre non nul avant elle ?", "Le nombre est-il plus grand que 10 ou plus petit que 1 ? Cela donne le signe de l'exposant."],
  }),
  ex({
    id: "pc3-12", title: "Valeur exacte, valeur approchée", niveau: 2, objectives: ["M4-NC-11", "M4-NC-10"], time: 75,
    vary: (rng) => {
      let n = 0; while (!n || Number.isInteger(Math.sqrt(n)) || roundTo(Math.sqrt(n), 1) === roundTo(Math.sqrt(n), 3)) n = rng.int(2, 150);
      const r1 = roundTo(Math.sqrt(n), 1), r3 = roundTo(Math.sqrt(n), 3);
      return {
        statement: `On considère le nombre $\\sqrt{${n}}$.`,
        parts: [
          shuffledQcm(rng, [`$\\sqrt{${n}}$`, `$${TF(r1, 1)}$`, `$${TF(r3, 3)}$`], 0, { 1: "C'est une valeur **approchée** (arrondie) : elle n'est pas égale à la racine.", 2: "Même avec trois décimales, ce n'est qu'une valeur approchée." }, "Quelle écriture est la **valeur exacte** ?"),
          num(r1, [{ match: String(n / 2), feedback: "La racine carrée n'est pas la moitié du nombre." }, { match: String(Math.floor(Math.sqrt(n) * 10) / 10), feedback: "Tu as tronqué : pour arrondir, regarde le chiffre des centièmes." }], "Donner l'arrondi au dixième de ce nombre (calculatrice autorisée).", { tol: 0.0001, decimals: 1, roundingLabel: "au dixième" }),
        ],
        solution: [`$${n}$ n'est pas un carré parfait : $\\sqrt{${n}}$ n'a pas d'écriture décimale exacte. La valeur exacte s'écrit $\\sqrt{${n}}$.`, `La calculatrice affiche $\\sqrt{${n}} \\approx ${T(roundTo(Math.sqrt(n), 4))}$.`, `Arrondi au dixième : $\\sqrt{${n}} \\approx ${TF(r1, 1)}$.`],
      };
    },
    reasoning: "Une valeur exacte est égale au nombre ; une valeur approchée en est proche. On écrit $\\sqrt{2} \\approx 1{,}41$ (symbole $\\approx$), jamais $\\sqrt{2} = 1{,}41$.",
    hints: ["Le nombre sous la racine est-il un carré parfait ?", "Pour arrondir au dixième, regarde le chiffre des centièmes."],
  }),
  ex({
    id: "pc3-13", title: "Encadrer une racine carrée", niveau: 2, objectives: ["M4-NC-11"], time: 60,
    vary: (rng) => {
      let n = 0; while (!n || Number.isInteger(Math.sqrt(n))) n = rng.int(3, 200);
      const k = Math.floor(Math.sqrt(n));
      return {
        statement: `Encadrer $\\sqrt{${n}}$ entre deux nombres entiers consécutifs, **sans calculatrice**.`,
        parts: [{ interaction: { kind: "texte-trous", template: `[[0]] $< \\sqrt{${n}} <$ [[1]]`, blanks: [{ type: "number", answer: { value: k } }, { type: "number", answer: { value: k + 1 } }] } }],
        solution: [`On cherche deux carrés parfaits consécutifs autour de $${n}$ : $${k}^2 = ${k * k}$ et $${k + 1}^2 = ${(k + 1) ** 2}$.`, `$${k * k} < ${n} < ${(k + 1) ** 2}$, donc $${k} < \\sqrt{${n}} < ${k + 1}$.`],
      };
    },
    reasoning: "Pour des nombres positifs, si $a < b$ alors $\\sqrt{a} < \\sqrt{b}$ : on encadre le nombre entre deux carrés parfaits.",
    hints: ["Quel est le plus grand carré parfait inférieur au nombre ?", "Et le plus petit carré parfait supérieur ?"],
  }),
  ex({
    id: "pc3-14", title: "Produit en notation scientifique", niveau: 2, objectives: ["M3-NC-05"], time: 120,
    vary: (rng) => {
      const A = rng.int(11, 49), B = rng.int(11, 49), p = nz(rng, -8, 9), q2 = nz(rng, -8, 9);
      const [m, e] = sciFromInt(A * B, p + q2 - 2);
      const a = A / 10, b = B / 10;
      const prod = clean(a * b, 12);
      return {
        statement: `Calculer $(${sciTx(a, p)}) \\times (${sciTx(b, q2)})$ et donner le résultat en notation scientifique.`,
        parts: [{ interaction: { kind: "texte-trous", template: "Résultat : [[0]] $\\times 10^{k}$ avec $k =$ [[1]]", blanks: blanksSci(m, e) } }],
        solution: [`On regroupe : $(${T(a)} \\times ${T(b)}) \\times (10^{${p}} \\times 10^{${q2}}) = ${T(prod)} \\times 10^{${p + q2}}$.`, prod >= 10 ? `$${T(prod)} = ${sciTx(prod / 10, 1)}$, donc le résultat est $${sciTx(m, e)}$.` : `$${T(prod)}$ est déjà compris entre 1 et 10 : le résultat est $${sciTx(m, e)}$.`],
      };
    },
    reasoning: "On multiplie les nombres décimaux entre eux et les puissances de 10 entre elles (on additionne les exposants), puis on réajuste pour avoir $1 \\leqslant a < 10$.",
    hints: ["Regroupe les décimaux d'un côté, les puissances de 10 de l'autre.", "Si le produit des décimaux dépasse 10, il faut ajouter 1 à l'exposant."],
  }),

  // ── Niveau 3 : Entraînement ──
  ex({
    id: "pc3-15", title: "Priorités avec des fractions", niveau: 3, objectives: ["M3-NC-07"], time: 120,
    vary: (rng) => {
      const [a, b] = pf(rng, 2, 7), [c, d] = pf(rng, 2, 7), [e, f] = pf(rng, 2, 7);
      const plus = rng.next() < 0.6;
      const prod = qMul([c, d], [e, f]);
      const res = plus ? qAdd([a, b], prod) : qSub([a, b], prod);
      const wrongQ = qMul(plus ? qAdd([a, b], [c, d]) : qSub([a, b], [c, d]), [e, f]);
      return {
        statement: `Calculer $A = ${Fw(a, b)} ${plus ? "+" : "-"} ${Fw(c, d)} \\times ${Fw(e, f)}$ et donner le résultat sous forme irréductible.`,
        parts: [frac(res[0], res[1], [{ match: mf(wrongQ[0], wrongQ[1]), feedback: "La multiplication est **prioritaire** sur l'addition et la soustraction." }])],
        solution: [`La multiplication est prioritaire : $${Fw(c, d)} \\times ${Fw(e, f)} = ${QT(prod)}$.`, `$A = ${Fw(a, b)} ${plus ? "+" : "-"} ${QT(prod)} = ${QT(res)}$ (après mise au même dénominateur $${lcm(b, prod[1])}$).`],
      };
    },
    reasoning: "Les règles de priorité sont les mêmes qu'avec les nombres entiers : multiplications et divisions avant additions et soustractions.",
    hints: ["Quelle opération faut-il effectuer en premier ?", "Pour finir, mets les deux fractions au même dénominateur."],
  }),
  ex({
    id: "pc3-16", title: "Simplifier des quotients de puissances", niveau: 3, objectives: ["M3-NC-04"], time: 150,
    vary: (rng) => {
      const m = nz(rng, -6, 8), n = nz(rng, -6, 8), p = nz(rng, -6, 8);
      const a = rng.pick([2, 3, 5]);
      const r = nz(rng, -4, 5), s = nz(rng, -4, 5), t = nz(rng, -3, 3);
      return {
        statement: `Écrire chaque nombre sous la forme d'une seule puissance.\n$A = \\dfrac{10^{${m}} \\times 10^{${n}}}{10^{${p}}}$ et $B = \\dfrac{${pw(a, r)} \\times ${pw(a, s)}}{(${pw(a, t)})^{2}}$.`,
        parts: [{ interaction: { kind: "texte-trous", template: `$A = 10^{k}$ avec $k =$ [[0]]\n$B = ${a}^{j}$ avec $j =$ [[1]]`, blanks: [{ type: "number", answer: { value: m + n - p } }, { type: "number", answer: { value: r + s - 2 * t } }] } }],
        solution: [`Numérateur de $A$ : $10^{${m}} \\times 10^{${n}} = 10^{${m + n}}$.`, `$A = \\dfrac{10^{${m + n}}}{10^{${p}}} = 10^{${m + n} - ${P(p)}} = 10^{${m + n - p}}$.`, `Pour $B$ : numérateur $${pw(a, r + s)}$ ; dénominateur $(${pw(a, t)})^{2} = ${pw(a, 2 * t)}$.`, `$B = ${pw(a, r + s)} \\div ${pw(a, 2 * t)} = ${pw(a, r + s - 2 * t)}$.`],
      };
    },
    reasoning: "On simplifie d'abord le numérateur et le dénominateur séparément, puis on soustrait les exposants. Un exposant négatif au dénominateur devient positif après soustraction.",
    hints: ["Commence par écrire le numérateur sous la forme d'une seule puissance.", "Soustraire un nombre négatif revient à ajouter son opposé."],
  }),
  ex({
    id: "pc3-17", title: "Quotient en notation scientifique", niveau: 3, objectives: ["M3-NC-05", "M3-NC-04"], time: 120,
    vary: (rng) => {
      const b = rng.pick([2, 4, 5, 8]), p = nz(rng, -6, 9), q2 = nz(rng, -6, 9);
      let A = rng.int(10, 99); while (A === 10 * b) A = rng.int(10, 99);
      const a = A / 10, coef = clean(a / b, 12), e0 = p - q2;
      const [m, e] = sciFromInt((A * 1000) / b, e0 - 4);
      return {
        statement: `Calculer $\\dfrac{${sciTx(a, p)}}{${sciTx(b, q2)}}$ et donner le résultat en notation scientifique.`,
        parts: [{ interaction: { kind: "texte-trous", template: "Résultat : [[0]] $\\times 10^{k}$ avec $k =$ [[1]]", blanks: blanksSci(m, e) }, mistakes: [] }],
        solution: [`$\\dfrac{${T(a)}}{${b}} = ${T(coef)}$.`, `$\\dfrac{10^{${p}}}{10^{${q2}}} = 10^{${p} - ${P(q2)}} = 10^{${e0}}$.`, coef < 1 ? `$${T(coef)} \\times 10^{${e0}}$ : le nombre devant la puissance est inférieur à 1, on réajuste : $${T(coef)} = ${T(m)} \\times 10^{-1}$.` : `$${T(coef)}$ est compris entre 1 et 10 : pas de réajustement.`, `Résultat : $${sciTx(m, e)}$.`],
      };
    },
    reasoning: "On divise les nombres décimaux entre eux et les puissances de 10 entre elles (soustraction des exposants).",
    hints: ["Sépare le calcul en deux quotients.", "Attention au signe de l'exposant du dénominateur, et vérifie à la fin que le nombre devant la puissance est entre 1 et 10."],
  }),
  ex({
    id: "pc3-18", title: "Ranger des nombres en notation scientifique", niveau: 3, objectives: ["M4-NC-08"], time: 120,
    vary: (rng) => {
      const p = rng.int(-3, 5);
      const cand: { D: number; e: number; label: string }[] = [];
      const add = (D: number, e: number, label: string) => { if (!cand.some((c) => Math.abs(c.D * 10 ** c.e - D * 10 ** e) < 1e-15 * Math.max(1, D * 10 ** e))) cand.push({ D, e, label }); };
      const m1 = rng.int(11, 49), m2 = rng.int(51, 99);
      add(m1, p - 1, sciTx(m1 / 10, p));
      add(m2, p - 1, sciTx(m2 / 10, p));
      const m3 = rng.int(11, 99); add(m3, p - 2, sciTx(m3 / 10, p - 1));
      const m4 = rng.int(11, 99); add(m4, p, sciTx(m4 / 10, p + 1));
      let m5 = rng.int(11, 99); while (m5 === m1 || m5 === m2) m5 = rng.int(11, 99); add(m5, p - 1, `${T(m5)} \\times 10^{${p - 1}}`);
      const vals = rng.shuffle(cand);
      const v = (c: { D: number; e: number }) => c.D * 10 ** c.e;
      let ord = vals.map((_, i) => i).sort((i, j) => v(vals[i]) - v(vals[j]));
      if (ord.every((x, i) => x === i)) { vals.reverse(); ord = vals.map((_, i) => i).sort((i, j) => v(vals[i]) - v(vals[j])); }
      return {
        statement: "Ranger ces nombres dans l'**ordre croissant**.",
        parts: [{ interaction: { kind: "ordonner", items: vals.map((c) => `$${c.label}$`), answer: ord, hint: "Du plus petit (en haut) au plus grand (en bas)" } }],
        solution: ["On écrit d'abord chaque nombre en notation scientifique, puis on compare les exposants : le plus grand exposant donne le plus grand nombre.", "À exposant égal, on compare les nombres placés devant la puissance de 10.", `Ordre croissant : $${ord.map((i) => vals[i].label).join(" < ")}$.`],
      };
    },
    reasoning: "En notation scientifique, l'exposant renseigne sur l'ordre de grandeur : il se compare en premier. Une écriture non scientifique (comme $23 \\times 10^{2}$) doit être convertie avant de comparer.",
    hints: ["Une des écritures n'est pas en notation scientifique : convertis-la d'abord.", "Compare d'abord les exposants, puis les nombres devant la puissance."],
  }),
  ex({
    id: "pc3-19", title: "Le potager", niveau: 3, objectives: ["M3-NC-07"], time: 180,
    vary: (rng) => {
      const [a, b] = pf(rng, 3, 8), [c, d] = pf(rng, 2, 5);
      const rest = q(b - a, b), sal = qMul(rest, [c, d]), free = qSub(rest, sal);
      return {
        statement: `Dans un potager, on plante des tomates sur $${Fw(a, b)}$ de la surface, puis des salades sur $${Fw(c, d)}$ **du reste**. Le reste est laissé libre. Donner les fractions sous forme irréductible.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Fraction du potager restant après les tomates", answer: fracAns(rest[0], rest[1]) },
          { prompt: "Fraction du potager occupée par les salades", answer: fracAns(sal[0], sal[1]) },
          { prompt: "Fraction du potager laissée libre", answer: fracAns(free[0], free[1]) },
        ] } }],
        solution: [`Reste après les tomates : $1 - ${Fw(a, b)} = ${QT(rest)}$.`, `Salades : $${Fw(c, d)}$ du reste, soit $${Fw(c, d)} \\times ${QT(rest)} = ${QT(sal)}$ du potager.`, `Partie libre : $${QT(rest)} - ${QT(sal)} = ${QT(free)}$.`, `Vérification : $${Fw(a, b)} + ${QT(sal)} + ${QT(free)} = 1$.`],
      };
    },
    reasoning: "« Une fraction **de** » se traduit par une multiplication. Ici les salades occupent une fraction du reste, pas du potager entier.",
    hints: ["Quelle fraction du potager reste-t-il après les tomates ?", "Prendre $\\dfrac{c}{d}$ d'une quantité, c'est la multiplier par $\\dfrac{c}{d}$."],
  }),
  ex({
    id: "pc3-20", title: "Signe d'une puissance", niveau: 3, objectives: ["M4-NC-09", "M3-NC-04"], time: 120,
    vary: (rng) => {
      const a = rng.int(2, 5), ev = rng.pick([2, 4]), od = rng.pick([3, 5]);
      const items: [string, number, string][] = [
        [`(-${a})^{${ev}}`, 0, `exposant pair : $(-${a})^{${ev}} = ${a ** ev}$`],
        [`(-${a})^{${od}}`, 1, `exposant impair : $(-${a})^{${od}} = -${a ** od}$`],
        [`-${a}^{${ev}}`, 1, `sans parenthèses, l'exposant porte sur ${a} seul : $-${a}^{${ev}} = -${a ** ev}$`],
        [`-(-${a})^{${od}}`, 0, `$(-${a})^{${od}} = -${a ** od}$ et son opposé vaut $${a ** od}$`],
        [`${a}^{-${od}}`, 0, `$${a}^{-${od}} = \\dfrac{1}{${a ** od}}$, un inverse positif`],
        [`(-${a})^{-${od}}`, 1, `$(-${a})^{-${od}} = \\dfrac{1}{(-${a})^{${od}}} = -\\dfrac{1}{${a ** od}}$`],
        [`-${a}^{-${ev}}`, 1, `$-${a}^{-${ev}} = -\\dfrac{1}{${a ** ev}}$`],
      ];
      const its = rng.shuffle(items).slice(0, 6);
      return {
        statement: "Classer ces nombres selon leur signe, sans calculatrice.",
        parts: [{ interaction: { kind: "classer", categories: ["Strictement positif", "Strictement négatif"], items: its.map(([s]) => `$${s}$`), answer: its.map(([, c]) => c) } }],
        solution: its.map(([s, c, w]) => `$${s}$ : ${c === 0 ? "positif" : "négatif"}, ${w}.`),
      };
    },
    reasoning: "Un produit d'un nombre pair de facteurs négatifs est positif, d'un nombre impair est négatif. Un exposant négatif ne change pas le signe : il donne un inverse.",
    hints: ["Repère les parenthèses : sur quoi porte l'exposant ?", "Compte les facteurs négatifs : pair ou impair ?"],
  }),
  ex({
    id: "pc3-21", title: "Conversions avec les préfixes", niveau: 3, objectives: ["M4-NC-08", "M3-NC-05"], time: 150,
    vary: (rng) => {
      const kinds: { pre: string; e: number; unit: string; base: string }[] = rng.shuffle([
        { pre: "k", e: 3, unit: "km", base: "m" }, { pre: "m", e: -3, unit: "ms", base: "s" }, { pre: "µ", e: -6, unit: "µm", base: "m" },
        { pre: "n", e: -9, unit: "ns", base: "s" }, { pre: "M", e: 6, unit: "MW", base: "W" }, { pre: "G", e: 9, unit: "Go", base: "octets" },
      ]).slice(0, 4);
      const rows = kinds.map((k) => { const D = rng.next() < 0.5 ? rng.int(2, 9) : rng.int(12, 95); const dd = D >= 10 ? 1 : 0; return { ...k, D, dd }; });
      return {
        statement: "Compléter le tableau : convertir chaque grandeur dans l'unité indiquée (écriture décimale ou notation scientifique acceptées, par exemple 3×10^-6). On prend 1 Go $= 10^{9}$ octets.",
        parts: [{ interaction: { kind: "tableau", headers: ["Grandeur", "Valeur convertie"], rows: rows.map((r) => {
          const x = clean(r.D * 10 ** (r.e - r.dd), 12);
          return { label: `$${decTex(r.D, -r.dd)}$ ${r.unit} (en ${r.base})`, cells: [{ answer: { value: x, decimals: Math.max(0, decs(x)) } }] };
        }) } }],
        solution: rows.map((r) => { const [m, p] = sciFromInt(r.D, r.e - r.dd); return `$${decTex(r.D, -r.dd)}$ ${r.unit} $= ${decTex(r.D, -r.dd)} \\times 10^{${r.e}}$ ${r.base} $= ${sciTx(m, p)}$ ${r.base}.`; }),
      };
    },
    reasoning: "Un préfixe remplace une puissance de 10 : 1 µm $= 10^{-6}$ m. On multiplie la valeur par cette puissance, puis on écrit le résultat en notation scientifique.",
    hints: ["Quelle puissance de 10 correspond au préfixe ?", "Multiplie la valeur par cette puissance de 10."],
  }),
  ex({
    id: "pc3-35", title: "Chaque calcul à sa place", niveau: 3, objectives: ["M3-NC-07", "M4-NC-04"], time: 180,
    vary: (rng) => {
      let a = 1, b = 2, c = 1, d = 3, res: Q[] = [];
      for (let t = 0; t < 30; t++) {
        b = rng.int(2, 7); d = rng.int(2, 7); a = rng.int(1, 6); c = rng.int(1, 6);
        if (b === d) continue;
        res = [qAdd([a, b], [c, d]), qSub([a, b], [c, d]), qMul([a, b], [c, d]), qDiv([a, b], [c, d])];
        if (new Set(res.map((r) => r.join("/"))).size === 4) break;
      }
      const ops = ["+", "-", "\\times", "\\div"];
      const zones = ops.map((o) => `$${Fw(a, b)} ${o} ${Fw(c, d)}$`);
      const distract = q(a + c, b + d);
      const toks = res.map((r) => r.join("/"));
      const pool = toks.includes(distract.join("/")) ? res : [...res, distract];
      const order = rng.shuffle(pool.map((_, i) => i));
      return {
        statement: "Déposer chaque résultat (sous forme irréductible) en face du calcul correspondant. S'il y a cinq résultats proposés, l'un d'eux ne sert pas.",
        parts: [{ interaction: { kind: "glisser-deposer", zones, tokens: order.map((i) => `$${QT(pool[i])}$`), answer: res.map((_, k) => order.indexOf(k)) } }],
        solution: [
          `Somme : $${Fw(a, b)} + ${Fw(c, d)} = ${Fw(a * d + c * b, b * d)} = ${QT(res[0])}$.`,
          `Différence : $${Fw(a, b)} - ${Fw(c, d)} = ${Fw(a * d - c * b, b * d)} = ${QT(res[1])}$.`,
          `Produit : $${Fw(a * c, b * d)} = ${QT(res[2])}$.`,
          `Quotient : $${Fw(a, b)} \\times ${Fw(d, c)} = ${QT(res[3])}$.`,
        ],
      };
    },
    reasoning: "Chaque opération a sa règle : même dénominateur pour $+$ et $-$, produit « en ligne » pour $\\times$, multiplication par l'inverse pour $\\div$.",
    hints: ["Commence par le produit, le plus rapide.", "Pour le quotient, multiplie par l'inverse de la seconde fraction."],
  }),

  // ── Niveau 4 : Problèmes ──
  ex({
    id: "pc3-22", title: "La lumière du Soleil", niveau: 4, objectives: ["M3-NC-05"], time: 240,
    vary: (rng) => {
      const pl = rng.pick([["Mercure", 58, 6], ["Vénus", 108, 6], ["Mars", 228, 6], ["Jupiter", 778, 6], ["Saturne", 143, 7]] as [string, number, number][]);
      const [name, D, e] = pl;
      const N = D * 10 ** (e - 5); // distance / 10^5 (entier)
      const t = N / 3; // secondes
      const [m, p] = sciFromInt(D, e);
      const ts = roundTo(t, 0), tm = roundTo(t / 60, 1);
      return {
        statement: `La distance moyenne entre le Soleil et ${name} est d'environ $${sciTx(m, p)}$ km. La lumière se déplace à environ $3 \\times 10^{5}$ km/s.`,
        parts: [
          num(ts, [], "Durée du trajet de la lumière, en secondes (arrondie à l'unité).", { tol: 0.0001, decimals: 0, roundingLabel: "à l'unité" }),
          num(tm, [{ match: String(roundTo(t / 100, 1)), feedback: "1 min = 60 s, pas 100 s." }], "Cette durée en minutes (arrondie au dixième).", { tol: 0.0001, decimals: 1, roundingLabel: "au dixième" }),
        ],
        solution: [`Durée = distance ÷ vitesse : $t = \\dfrac{${sciTx(m, p)}}{3 \\times 10^{5}}$ s.`, `$t = \\dfrac{${T(m)}}{3} \\times 10^{${p - 5}} \\approx ${T(roundTo(t, 2))}$ s, soit environ $${T(ts)}$ s.`, `En minutes : $${T(roundTo(t, 2))} \\div 60 \\approx ${TF(tm, 1)}$ min.`],
      };
    },
    reasoning: "La relation $d = v \\times t$ donne $t = \\dfrac{d}{v}$. Les puissances de 10 se simplifient comme dans un quotient.",
    hints: ["Quelle relation relie distance, vitesse et durée ?", "Divise les nombres décimaux, puis les puissances de 10."],
  }),
  ex({
    id: "pc3-23", title: "Des molécules d'eau", niveau: 4, objectives: ["M3-NC-05"], time: 240,
    vary: (rng) => {
      const [V, lab] = rng.pick([[1000, "1 L"], [500, "50 cL"], [250, "25 cL"], [2000, "2 L"], [330, "une canette de 33 cL"], [1500, "1,5 L"]] as [number, string][]);
      const drops = 20 * V;
      const [m, p] = sciFromInt(340 * V, 20);
      return {
        statement: `Une goutte d'eau a un volume d'environ $0{,}05$ mL et contient environ $1{,}7 \\times 10^{21}$ molécules d'eau. On s'intéresse à ${lab} d'eau, soit $${T(V)}$ mL.`,
        parts: [
          num(drops, [{ match: String(clean(V * 0.05)), feedback: "Tu as multiplié par $0{,}05$ : pour trouver le nombre de gouttes, on **divise** le volume total par le volume d'une goutte." }], "Combien de gouttes cela représente-t-il ?"),
          { prompt: "Nombre de molécules d'eau, en notation scientifique.", interaction: { kind: "texte-trous", template: "[[0]] $\\times 10^{k}$ avec $k =$ [[1]]", blanks: blanksSci(m, p) } },
        ],
        solution: [`Nombre de gouttes : $${T(V)} \\div 0{,}05 = ${T(V)} \\times 20 = ${T(drops)}$.`, `Nombre de molécules : $${T(drops)} \\times 1{,}7 \\times 10^{21} = ${T(drops * 1.7)} \\times 10^{21}$.`, `En notation scientifique : $${sciTx(m, p)}$.`],
      };
    },
    reasoning: "On décompose : nombre de gouttes, puis nombre de molécules. La notation scientifique permet d'écrire et de comparer ces très grands nombres.",
    hints: ["Diviser par $0{,}05$, c'est multiplier par 20.", "Écris le produit puis réajuste pour avoir un seul chiffre avant la virgule."],
  }),
  ex({
    id: "pc3-24", title: "La pièce carrée", niveau: 4, objectives: ["M3-NC-06"], time: 240,
    vary: (rng) => {
      let A = 0; while (!A || Number.isInteger(Math.sqrt(A))) A = rng.int(5, 60);
      const s = Math.sqrt(A), sr = roundTo(s, 2), per = roundTo(4 * s, 2), perBad = roundTo(4 * sr, 2);
      return {
        statement: `Une pièce carrée a une aire de $${A}$ m².`,
        parts: [
          shuffledQcm(rng, [`$\\sqrt{${A}}$ m`, `$${T(A / 2)}$ m`, `$${T(A / 4)}$ m`, `$${A * A}$ m`], 0, { 1: "Le côté n'est pas la moitié de l'aire : aire = côté × côté.", 2: "Diviser l'aire par 4 donnerait le côté à partir du **périmètre**, pas de l'aire.", 3: "Le carré de l'aire n'a pas de sens ici." }, "Quelle est la valeur **exacte** du côté ?"),
          num(sr, [{ match: String(roundTo(A / 2, 2)), feedback: "Le côté est la racine carrée de l'aire, pas sa moitié." }], "Valeur approchée du côté au centimètre près (en m).", { tol: 0.0001, decimals: 2, roundingLabel: "au centimètre près" }),
          num(per, perBad !== per ? [{ match: String(perBad), feedback: "Tu as calculé avec le côté arrondi : utilise la valeur exacte $\\sqrt{" + A + "}$ (mémoire de la calculatrice), puis arrondis seulement à la fin." }] : [], "Périmètre de la pièce au centimètre près (en m).", { tol: 0.0001, decimals: 2, roundingLabel: "au centimètre près" }),
        ],
        solution: [`Si $c$ est le côté, $c^2 = ${A}$ et $c > 0$, donc $c = \\sqrt{${A}}$ m (valeur exacte).`, `$\\sqrt{${A}} \\approx ${T(roundTo(s, 4))}$, donc $c \\approx ${TF(sr, 2)}$ m au centimètre près.`, `Périmètre exact : $4\\sqrt{${A}}$ m $\\approx ${T(roundTo(4 * s, 4))}$ m, soit environ $${TF(per, 2)}$ m.`],
      };
    },
    reasoning: "On garde la valeur exacte ($\\sqrt{A}$) dans les calculs intermédiaires et on n'arrondit qu'au résultat final, sinon les erreurs d'arrondi s'accumulent.",
    hints: ["Aire d'un carré = côté × côté : quel nombre positif a pour carré l'aire ?", "Pour le périmètre, calcule $4 \\times \\sqrt{A}$ directement à la calculatrice."],
  }),
  ex({
    id: "pc3-25", title: "Rayon d'un disque", niveau: 4, objectives: ["M3-NC-06"], time: 180,
    vary: (rng) => {
      const A = rng.int(20, 500);
      const r = roundTo(Math.sqrt(A / Math.PI), 1);
      return {
        statement: `Un disque a une aire de $${A}$ cm². On note $r$ son rayon.`,
        parts: [
          shuffledQcm(rng, [`$r = \\sqrt{\\dfrac{${A}}{\\pi}}$`, `$r = \\dfrac{${A}}{\\pi}$`, `$r = \\dfrac{${A}}{2\\pi}$`, `$r = \\dfrac{\\sqrt{${A}}}{2}$`], 0, { 1: "$\\dfrac{A}{\\pi}$ est égal à $r^2$ : il faut encore prendre la racine carrée.", 2: "$2\\pi r$ est le périmètre, pas l'aire." }, "Quelle est la valeur exacte de $r$ ?"),
          num(r, [{ match: String(roundTo(A / Math.PI, 1)), feedback: "Ceci est $r^2$ : prends la racine carrée." }], "Valeur approchée de $r$ au millimètre près (en cm).", { tol: 0.0001, decimals: 1, roundingLabel: "au millimètre près" }),
        ],
        solution: [`L'aire d'un disque est $\\pi r^2$, donc $\\pi r^2 = ${A}$ et $r^2 = \\dfrac{${A}}{\\pi}$.`, `$r$ est positif, donc $r = \\sqrt{\\dfrac{${A}}{\\pi}}$ (valeur exacte).`, `À la calculatrice : $r \\approx ${T(roundTo(Math.sqrt(A / Math.PI), 3))}$ cm, soit $r \\approx ${TF(r, 1)}$ cm au millimètre près.`],
      };
    },
    reasoning: "On isole $r^2$ par division, puis on prend la racine carrée car un rayon est positif.",
    hints: ["Écris la formule de l'aire du disque.", "Quand on connaît $r^2$, comment obtient-on $r$ ?"],
  }),
  ex({
    id: "pc3-26", title: "Hypoténuse et racine carrée", niveau: 4, objectives: ["M3-NC-06", "M4-NC-10"], time: 180,
    vary: (rng) => {
      let a = 0, b = 0;
      while (!a || Number.isInteger(Math.sqrt(a * a + b * b))) { a = rng.int(2, 12); b = rng.int(2, 12); }
      const c2 = a * a + b * b, c = roundTo(Math.sqrt(c2), 1);
      return {
        statement: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ cm et $AC = ${b}$ cm.`,
        parts: [
          num(c2, [{ match: String(a + b), feedback: "Pythagore porte sur les **carrés** des longueurs." }, { match: String((a + b) ** 2), feedback: "On additionne les carrés : $AB^2 + AC^2$, pas $(AB + AC)^2$." }], "Calculer $BC^2$ (en cm²)."),
          num(c, [{ match: String(roundTo(c2 / 2, 1)), feedback: "La racine carrée n'est pas la moitié." }], "Donner $BC$ arrondi au millimètre (en cm).", { tol: 0.0001, decimals: 1, roundingLabel: "au millimètre" }),
          shuffledQcm(rng, ["une valeur exacte", "une valeur approchée"], 1, { 0: `$${c2}$ n'est pas un carré parfait : $BC = \\sqrt{${c2}}$ n'a pas d'écriture décimale exacte.` }, "Le nombre trouvé à la question précédente est…"),
        ],
        solution: [`D'après le théorème de Pythagore : $BC^2 = AB^2 + AC^2 = ${a * a} + ${b * b} = ${c2}$.`, `$BC = \\sqrt{${c2}}$ cm (valeur exacte) $\\approx ${T(roundTo(Math.sqrt(c2), 3))}$ cm.`, `Arrondi au millimètre : $BC \\approx ${TF(c, 1)}$ cm ; c'est une valeur approchée.`],
      };
    },
    reasoning: "Le théorème de Pythagore donne le **carré** de l'hypoténuse ; la racine carrée donne la longueur. La valeur exacte est $BC = \\sqrt{AB^2 + AC^2}$ ; le résultat arrondi est une valeur approchée.",
    hints: ["Quel est le plus long côté du triangle ?", "Une longueur s'obtient à partir de son carré grâce à la racine carrée."],
  }),
  ex({
    id: "pc3-27", title: "Partage d'une somme", niveau: 4, objectives: ["M3-NC-07"], time: 240,
    vary: (rng) => {
      let a = 1, b = 3, c = 1, d = 4;
      for (let t = 0; t < 40; t++) {
        [a, b] = pfIn(rng, [3, 4, 5, 6]); [c, d] = pfIn(rng, [3, 4, 6, 8, 10]);
        if (b !== d && a * d + c * b < b * d) break;
      }
      if (!(b !== d && a * d + c * b < b * d)) { a = 1; b = 3; c = 1; d = 4; }
      const L = lcm(b, d), k = rng.int(4, 30), S = L * k * 10;
      const ines = qSub(qSub([1, 1], [a, b]), [c, d]);
      const M = (S * ines[0]) / ines[1];
      return {
        statement: `Trois amis se partagent une somme d'argent. Léa reçoit $${Fw(a, b)}$ de la somme, Tom $${Fw(c, d)}$ de la somme et Inès reçoit le reste, soit $${T(M)}$ €.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Fraction de la somme reçue par Inès (forme irréductible)", answer: fracAns(ines[0], ines[1]) },
          { prompt: "Somme totale partagée", answer: { value: S }, suffix: "€" },
          { prompt: "Part de Léa", answer: { value: (S * a) / b }, suffix: "€" },
        ] } }],
        solution: [`Inès reçoit $1 - ${Fw(a, b)} - ${Fw(c, d)} = ${QT(ines)}$ de la somme.`, `$${QT(ines)}$ de la somme valent $${T(M)}$ €, donc la somme est $${T(M)} \\div ${QT(ines)} = ${T(M)} \\times ${Fs(ines[1], ines[0])} = ${T(S)}$ €.`, `Léa reçoit $${Fw(a, b)} \\times ${T(S)} = ${T((S * a) / b)}$ €.`],
      };
    },
    reasoning: "On exprime d'abord la part inconnue comme une fraction du tout ; connaître la valeur de cette fraction permet de retrouver le tout par division.",
    hints: ["Les trois fractions ont pour somme 1.", "Si $\\dfrac{p}{q}$ de la somme vaut $M$, la somme vaut $M \\div \\dfrac{p}{q}$."],
  }),
  ex({
    id: "pc3-28", title: "Photos sur une clé USB", niveau: 4, objectives: ["M3-NC-05", "M4-NC-08"], time: 180,
    vary: (rng) => {
      const G = rng.pick([8, 16, 32, 64, 128]), Mt = rng.int(24, 65);
      const count = Math.floor((G * 10000) / Mt);
      const exact = (G * 10000) / Mt;
      const [m, p] = sciFromInt(G, 9);
      return {
        statement: `Une clé USB a une capacité de $${G}$ Go. Une photo occupe en moyenne $${decTex(Mt, -1)}$ Mo. On prend 1 Go $= 10^{9}$ octets et 1 Mo $= 10^{6}$ octets.`,
        parts: [
          { prompt: "Capacité de la clé en octets, en notation scientifique.", interaction: { kind: "texte-trous", template: "[[0]] $\\times 10^{k}$ octets avec $k =$ [[1]]", blanks: blanksSci(m, p) } },
          num(count, Math.round(exact) !== count ? [{ match: String(Math.round(exact)), feedback: "On ne peut pas enregistrer une photo incomplète : on garde la partie entière (arrondi à l'unité inférieure)." }] : [], "Nombre maximal de photos que l'on peut enregistrer."),
        ],
        solution: [`$${G}$ Go $= ${G} \\times 10^{9}$ octets $= ${sciTx(m, p)}$ octets.`, `Une photo : $${decTex(Mt, -1)} \\times 10^{6}$ octets.`, `$\\dfrac{${G} \\times 10^{9}}{${decTex(Mt, -1)} \\times 10^{6}} = \\dfrac{${G}}{${decTex(Mt, -1)}} \\times 10^{3} \\approx ${T(roundTo(exact, 2))}$.`, `On peut enregistrer au maximum $${T(count)}$ photos.`],
      };
    },
    reasoning: "On convertit dans la même unité (l'octet) grâce aux puissances de 10, puis on divise. Le contexte impose de prendre la partie entière.",
    hints: ["Exprime les deux tailles en octets.", "Le nombre de photos est un entier : faut-il arrondir au plus proche ?"],
  }),

  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "pc3-29", title: "Vrai ou faux ? Justifier", niveau: 5, objectives: ["M3-NC-07", "M3-NC-04", "M3-NC-06", "M4-NC-04", "M4-NC-07"], time: 300,
    vary: (rng) => {
      const a = rng.int(1, 4), b = rng.int(2, 5);
      const sumOk = rng.next() < 0.5;
      const s = q(3 * a, 2 * b);
      const sumShown = sumOk ? QT(s) : Fs(2 * a, 3 * b);
      const x = rng.int(2, 5), m = rng.int(2, 4), n = rng.int(3, 5);
      const p = rng.int(1, 6), r = rng.int(1, 6);
      const k = rng.int(2, 5);
      const c = rng.int(1, 5), d = rng.int(2, 7), e = rng.int(1, 5), f = rng.int(2, 7);
      const dvOk = rng.next() < 0.5;
      const dv = dvOk ? q(c * f, d * e) : q(c * e, d * f);
      const D = rng.int(11, 99), kk = rng.int(2, 4);
      const items: [string, boolean, string][] = [
        [`$${Fw(a, b)} + ${Fw(a, 2 * b)} = ${sumShown}$`, sumOk || s.join("/") === q(2 * a, 3 * b).join("/"), `$${Fw(a, b)} + ${Fw(a, 2 * b)} = ${Fw(2 * a, 2 * b)} + ${Fw(a, 2 * b)} = ${QT(s)}$.`],
        [`$(${x}^{${m}})^{${n}} = ${x}^{${m + n}}$`, false, `$(${x}^{${m}})^{${n}} = ${x}^{${m * n}}$ : on multiplie les exposants.`],
        [`$\\sqrt{${p * p}} + \\sqrt{${r * r}} = \\sqrt{${p * p + r * r}}$`, false, `$\\sqrt{${p * p}} + \\sqrt{${r * r}} = ${p} + ${r} = ${p + r}$, alors que $${p + r}^2 = ${(p + r) ** 2} \\neq ${p * p + r * r}$.`],
        [`$10^{-${k}}$ est un nombre négatif`, false, `$10^{-${k}} = ${decTex(1, -k)}$ est positif.`],
        [`$${Fw(c, d)} \\div ${Fw(e, f)} = ${QT(dv)}$`, dvOk || dv.join("/") === q(c * f, d * e).join("/"), `$${Fw(c, d)} \\div ${Fw(e, f)} = ${Fw(c, d)} \\times ${Fw(f, e)} = ${Fs(c * f, d * e)}$.`],
        [`$${T(D / 10)} \\times 10^{-${kk}} = ${decTex(D, -kk - 1)}$`, true, `Multiplier par $10^{-${kk}}$, c'est diviser par $${decTex(1, kk)}$ : $${decTex(D, -kk - 1)}$.`],
      ];
      const its = rng.shuffle(items);
      return {
        statement: "Pour chaque affirmation, dire si elle est vraie ou fausse. Au Brevet, une réponse doit être **justifiée** : lis la correction pour voir les justifications attendues.",
        parts: [{ interaction: { kind: "vrai-faux", items: its.map(([s]) => s), answer: its.map(([, v]) => v) } }],
        solution: its.map(([s, v, w]) => `${s} : **${v ? "vrai" : "faux"}**. ${w}`),
      };
    },
    reasoning: "Pour montrer qu'une affirmation est fausse, un calcul qui donne un autre résultat (un contre-exemple) suffit. Pour montrer qu'elle est vraie, on détaille le calcul.",
    hints: ["Fais chaque calcul séparément sur ton brouillon.", "Méfie-toi des « règles » inventées : calcule séparément chaque membre de l'égalité avant de conclure."],
  }),
  ex({
    id: "pc3-30", title: "L'année-lumière", niveau: 5, objectives: ["M3-NC-05"], time: 300,
    vary: (rng) => {
      const [star, d10] = rng.pick([["Proxima du Centaure", 42], ["Sirius", 86], ["Altaïr", 167], ["Arcturus", 367]] as [string, number][]);
      const [m, p] = sciFromInt(d10 * 946, 9);
      const mr = roundTo(m, 2);
      return {
        statement: `Une année-lumière (al) est la distance parcourue par la lumière en un an : $1$ al $\\approx 9{,}46 \\times 10^{12}$ km. L'étoile ${star} est à environ $${decTex(d10, -1)}$ al de la Terre.`,
        parts: [
          { prompt: "Distance Terre–étoile en km, en notation scientifique (nombre devant la puissance arrondi au centième).", interaction: { kind: "texte-trous", template: "[[0]] $\\times 10^{k}$ km avec $k =$ [[1]]", blanks: [{ type: "number", answer: { value: mr, tol: 0.0001, decimals: 2, roundingLabel: "au centième" } }, { type: "number", answer: { value: p } }] } },
          { prompt: "La même distance en mètres.", interaction: { kind: "texte-trous", template: "[[0]] $\\times 10^{k}$ m avec $k =$ [[1]]", blanks: [{ type: "number", answer: { value: mr, tol: 0.0001, decimals: 2, roundingLabel: "au centième" } }, { type: "number", answer: { value: p + 3 } }] } },
          shuffledQcm(rng, [`$${decTex(d10, -1)}$ ans`, `$${decTex(d10, -1)}$ jours`, `$${decTex(d10, -1)}$ secondes`, "on ne peut pas le savoir"], 0, { 1: "L'année-lumière est définie avec une durée d'**un an**." }, "Combien de temps la lumière de l'étoile met-elle pour nous parvenir ?"),
        ],
        solution: [`$${decTex(d10, -1)} \\times 9{,}46 \\times 10^{12} = ${T(clean((d10 * 946) / 1000, 12))} \\times 10^{12}$ km.`, `En notation scientifique : $${sciTx(m, p)}$ km, soit environ $${TF(mr, 2)} \\times 10^{${p}}$ km.`, `$1$ km $= 10^{3}$ m, donc la distance est environ $${TF(mr, 2)} \\times 10^{${p}} \\times 10^{3} = ${TF(mr, 2)} \\times 10^{${p + 3}}$ m.`, `Par définition de l'année-lumière, la lumière met environ $${decTex(d10, -1)}$ ans pour nous parvenir.`],
      };
    },
    reasoning: "Multiplier par une distance de référence, puis convertir (1 km $= 10^{3}$ m) : les puissances de 10 se gèrent en ajoutant les exposants.",
    hints: ["Multiplie le nombre d'années-lumière par la distance d'une année-lumière.", "Pour passer des km aux m, on multiplie par $10^{3}$."],
  }),
  ex({
    id: "pc3-31", title: "Programme de calcul avec des fractions", niveau: 5, objectives: ["M3-NC-07", "M4-NC-04"], time: 240,
    vary: (rng) => {
      const x: Q = q(rng.int(1, 7), rng.int(2, 5));
      const m1: Q = pf(rng, 2, 6), a1: Q = pf(rng, 2, 6), d1: Q = pf(rng, 2, 5);
      const s1 = qMul(x, m1), s2 = qAdd(s1, a1), s3 = qDiv(s2, d1);
      return {
        statement: `Voici un programme de calcul :\n– choisir un nombre ;\n– le multiplier par $${QT(m1)}$ ;\n– ajouter $${QT(a1)}$ au résultat ;\n– diviser le résultat par $${QT(d1)}$.\nOn choisit le nombre $${QT(x)}$. Donner chaque résultat sous forme irréductible.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: `Après la multiplication par $${QT(m1)}$`, answer: fracAns(s1[0], s1[1]) },
          { prompt: `Après l'ajout de $${QT(a1)}$`, answer: fracAns(s2[0], s2[1]) },
          { prompt: `Après la division par $${QT(d1)}$ (résultat du programme)`, answer: fracAns(s3[0], s3[1]) },
        ] } }],
        solution: [`$${QT(x)} \\times ${QT(m1)} = ${QT(s1)}$.`, `$${QT(s1)} + ${QT(a1)} = ${QT(s2)}$.`, `$${QT(s2)} \\div ${QT(d1)} = ${QT(s2)} \\times ${Fs(d1[1], d1[0])} = ${QT(s3)}$.`],
      };
    },
    reasoning: "Un programme de calcul s'exécute étape par étape : chaque résultat devient le nombre de départ de l'étape suivante. Simplifier à chaque étape allège les calculs.",
    hints: ["Applique les étapes dans l'ordre, une seule à la fois.", "Diviser par une fraction, c'est multiplier par son inverse."],
  }),
  ex({
    id: "pc3-32", title: "Doubler l'aire d'un jardin", niveau: 5, objectives: ["M3-NC-06"], time: 300,
    vary: (rng) => {
      const s = rng.int(4, 15), A = s * s, A2 = 2 * A;
      const s2 = roundTo(Math.sqrt(A2), 1);
      return {
        statement: `Un jardin carré a une aire de $${A}$ m². Son propriétaire veut un nouveau jardin carré d'aire **double**.`,
        parts: [
          num(s, [{ match: String(A / 2), feedback: "Le côté d'un carré est la racine carrée de son aire." }], "Côté du premier jardin (en m)."),
          shuffledQcm(rng, [`$\\sqrt{${A2}}$ m`, `$${2 * s}$ m`, `$${A2 / 2}$ m`, `$${A2}$ m`], 0, { 1: "Doubler le côté multiplie l'aire par 4, pas par 2.", 2: "C'est la moitié de la nouvelle aire, pas un côté." }, "Valeur exacte du côté du nouveau jardin :"),
          num(s2, [{ match: String(2 * s), feedback: "Si le côté doublait, l'aire serait multipliée par 4." }], "Côté du nouveau jardin arrondi au décimètre (en m).", { tol: 0.0001, decimals: 1, roundingLabel: "au décimètre" }),
          shuffledQcm(rng, ["par 2", "par environ 1,41", "par 4", "par 0,5"], 1, { 0: `$2 \\times ${s} = ${2 * s}$ et $${2 * s}^2 = ${4 * A}$ : l'aire serait quadruplée.` }, "Pour doubler l'aire, le côté a été multiplié…"),
        ],
        solution: [`Premier jardin : $c^2 = ${A}$, donc $c = \\sqrt{${A}} = ${s}$ m (car $${s}^2 = ${A}$).`, `Nouveau jardin : aire $2 \\times ${A} = ${A2}$ m², côté exact $\\sqrt{${A2}}$ m $\\approx ${T(roundTo(Math.sqrt(A2), 3))}$ m.`, `Arrondi au décimètre : $${TF(s2, 1)}$ m.`, `$\\sqrt{${A2}} \\div ${s} \\approx ${T(roundTo(Math.sqrt(A2) / s, 3))}$ : le côté est multiplié par environ $1{,}41$, et non par 2.`],
      };
    },
    reasoning: "L'aire d'un carré est le carré du côté : multiplier le côté par $k$ multiplie l'aire par $k^2$. Pour doubler l'aire, il faut un côté environ $1{,}41$ fois plus grand.",
    hints: ["Commence par le premier jardin : quel carré parfait vaut son aire ?", "Teste : si on double le côté, quelle est la nouvelle aire ?"],
  }),
  ex({
    id: "pc3-33", title: "Croissance de bactéries", niveau: 5, objectives: ["M3-NC-05", "M4-NC-09"], time: 300,
    vary: (rng) => {
      const a = rng.pick([1, 2, 3, 5]), p = rng.int(2, 4), n = rng.int(4, 10);
      const [m, e] = sciFromInt(a * 2 ** n, p);
      let k = 0; while (a * 2 ** k < 1000) k++;
      return {
        statement: `Une culture contient $${a === 1 ? `10^{${p}}` : sciTx(a, p)}$ bactéries. Leur nombre **double** toutes les 20 minutes.`,
        parts: [
          { prompt: `Nombre de bactéries après $${n}$ doublements, en notation scientifique.`, interaction: { kind: "texte-trous", template: "[[0]] $\\times 10^{k}$ avec $k =$ [[1]]", blanks: blanksSci(m, e) } },
          num(k, [{ match: String(k - 1), feedback: `Après $${k - 1}$ doublements, on n'a que $${a * 2 ** (k - 1)} \\times 10^{${p}}$ bactéries : ce n'est pas encore assez.` }], `Nombre minimal de doublements pour dépasser $10^{${p + 3}}$ bactéries.`),
          num(k * 20, [{ match: String(k), feedback: "Il faut convertir le nombre de doublements en minutes : un doublement dure 20 min." }], "Durée correspondante (en minutes)."),
        ],
        solution: [`Après $${n}$ doublements : $${a === 1 ? "" : `${a} \\times `}2^{${n}} \\times 10^{${p}} = ${a * 2 ** n} \\times 10^{${p}} = ${sciTx(m, e)}$.`, `Il faut ${a === 1 ? "" : `$${a}$ × `}$2^{k} \\times 10^{${p}} > 10^{${p + 3}}$, c'est-à-dire ${a === 1 ? "" : `$${a}$ × `}$2^{k} > 1\\,000$.`, `$${a} \\times 2^{${k - 1}} = ${a * 2 ** (k - 1)} < 1\\,000$ et $${a} \\times 2^{${k}} = ${a * 2 ** k} > 1\\,000$ : il faut $${k}$ doublements.`, `Durée : $${k} \\times 20 = ${k * 20}$ min.`],
      };
    },
    reasoning: "Un doublement répété $n$ fois correspond à une multiplication par $2^n$. Comparer à $10^{" + "p+3}$ revient à comparer $2^n$ à $1\\,000$.",
    hints: ["Doubler $n$ fois, c'est multiplier par $2^n$.", "Calcule les puissances de 2 successives : 2, 4, 8, 16…"],
  }),
  ex({
    id: "pc3-34", title: "Calcul avec des puissances de 10", niveau: 5, objectives: ["M3-NC-04", "M3-NC-05"], time: 240,
    vary: (rng) => {
      const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.pick([2, 4, 5, 8]);
      const p = nz(rng, -6, 9), q2 = nz(rng, -6, 9), r = nz(rng, -6, 9);
      const coef = clean((a * b) / c, 12), e = p + q2 - r;
      const [m, k] = sciFromInt((a * b * 1000) / c, e - 3);
      return {
        statement: `On donne $C = \\dfrac{${a} \\times 10^{${p}} \\times ${b} \\times 10^{${q2}}}{${c} \\times 10^{${r}}}$.`,
        parts: [{ interaction: { kind: "texte-trous", template: `$\\dfrac{${a} \\times ${b}}{${c}} =$ [[0]]\n$\\dfrac{10^{${p}} \\times 10^{${q2}}}{10^{${r}}} = 10^{j}$ avec $j =$ [[1]]\n$C =$ [[2]] $\\times 10^{k}$ avec $k =$ [[3]] (notation scientifique)`, blanks: [{ type: "number", answer: { value: coef } }, { type: "number", answer: { value: e } }, ...blanksSci(m, k)] } }],
        solution: [`On regroupe : $C = \\dfrac{${a} \\times ${b}}{${c}} \\times \\dfrac{10^{${p}} \\times 10^{${q2}}}{10^{${r}}}$.`, `$\\dfrac{${a * b}}{${c}} = ${T(coef)}$ et $10^{${p} + ${P(q2)} - ${P(r)}} = 10^{${e}}$.`, `$C = ${T(coef)} \\times 10^{${e}} = ${sciTx(m, k)}$.`],
      };
    },
    reasoning: "On sépare les nombres et les puissances de 10, on calcule chaque partie, puis on réajuste le nombre devant la puissance pour qu'il soit entre 1 et 10.",
    hints: ["Regroupe d'un côté $a$, $b$, $c$ et de l'autre les puissances de 10.", "Additionne les exposants du numérateur, puis soustrais celui du dénominateur."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const squareRoot = (() => {
  const s = 180;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 250" role="img" aria-label="Carré d'aire 20 centimètres carrés et de côté racine de 20" style="width:100%;max-width:320px;height:auto;font-family:Inter,Arial,sans-serif">`
    + `<rect x="60" y="25" width="${s}" height="${s}" fill="#e0e7ff" stroke="#4338ca" stroke-width="3"/>`
    + `<text x="150" y="110" text-anchor="middle" font-size="18" font-weight="700" fill="#312e81">Aire = 20 cm²</text>`
    + `<text x="150" y="135" text-anchor="middle" font-size="13" fill="#334155">côté × côté = 20</text>`
    + `<text x="150" y="232" text-anchor="middle" font-size="15" fill="#0f172a">côté = √20 cm ≈ 4,47 cm</text>`
    + `<text x="25" y="120" text-anchor="middle" font-size="15" fill="#0f172a" transform="rotate(-90 25 120)">√20 cm</text>`
    + `</svg>`;
})();

const fractionBar = (() => {
  const w = 20, x0 = 10, y = 40, h = 40;
  let s = "";
  for (let i = 0; i < 15; i++) {
    const fill = i < 6 ? "#fca5a5" : i < 9 ? "#86efac" : "#f8fafc";
    s += `<rect x="${x0 + i * w}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#475569" stroke-width="1"/>`;
  }
  s += `<rect x="${x0}" y="${y}" width="${15 * w}" height="${h}" fill="none" stroke="#0f172a" stroke-width="2"/>`;
  s += `<text x="${x0 + 3 * w}" y="${y - 10}" text-anchor="middle" font-size="12" fill="#b91c1c">tomates : 2/5</text>`;
  s += `<text x="${x0 + 7.5 * w}" y="${y + h + 18}" text-anchor="middle" font-size="12" fill="#15803d">salades : 1/3 du reste</text>`;
  s += `<text x="${x0 + 12 * w}" y="${y - 10}" text-anchor="middle" font-size="12" fill="#334155">libre</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" role="img" aria-label="Bande partagée en 15 parts : 6 pour les tomates, 3 pour les salades, 6 libres" style="width:100%;max-width:420px;height:auto;font-family:Inter,Arial,sans-serif">${s}</svg>`;
})();

const powersScale = (() => {
  const items: [string, string][] = [["10⁻⁹ m", "nano : taille d'une molécule"], ["10⁻⁶ m", "micro : une bactérie"], ["10⁻³ m", "milli : grain de sable"], ["10⁰ m", "un mètre"], ["10³ m", "kilo : un village"], ["10⁶ m", "méga : un pays"], ["10⁹ m", "giga : ≈ 2,6 fois la distance Terre–Lune"]];
  let s = `<line x1="20" y1="20" x2="20" y2="${20 + 34 * (items.length - 1)}" stroke="#4338ca" stroke-width="3"/>`;
  items.forEach(([a, b], i) => {
    const y = 20 + 34 * i;
    s += `<circle cx="20" cy="${y}" r="5" fill="#4338ca"/><text x="34" y="${y + 5}" font-size="14" font-weight="700" fill="#0f172a">${a}</text><text x="110" y="${y + 5}" font-size="13" fill="#334155">${b}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" role="img" aria-label="Échelle des longueurs de 10 puissance moins 9 mètres à 10 puissance 9 mètres" style="width:100%;max-width:400px;height:auto;font-family:Inter,Arial,sans-serif">${s}</svg>`;
})();

// ───────────────────────── Chapitre ─────────────────────────
export const math3ePuissancesCalculs: ChapterContent = {
  id: "math-3e-puissances-calculs",
  taskId: "SCI-3E-MATH-002",
  grade: "3e",
  subject: "mathematiques",
  treeChapterId: "m3-puissances",
  // M3-NC-* : objectifs de 3e ; M4-NC-* : objectifs de 4e consolidés en 3e (prérequis directs mobilisés au DNB).
  curriculumChapterIds: ["math-3e-puissances-calculs"],
  curriculumVersion: "2026-2027",
  title: "Fractions, puissances et racines carrées",
  officialObjectives: (Object.keys(O) as Obj[]).map((id) => ({ id, text: O[id], source: SRC[id] })),
  prerequisites: [
    { text: "Additionner, soustraire et comparer des fractions (5e).", chapterId: "m5-fractions" },
    { text: "Calculer avec des nombres relatifs : règle des signes du produit (4e)." },
    { text: "Puissances d'exposant positif et puissances de 10 (4e).", chapterId: "m4-puissances" },
    { text: "Théorème de Pythagore et carrés parfaits de 1 à 144 (4e).", chapterId: "m4-pythagore" },
  ],
  sources: [
    { id: "R1", title: "Programme de mathématiques du cycle 4 (BO n° 31 du 30 juillet 2020)", url: "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm", kind: "official", note: "page du BO non lue automatiquement (403) ; texte lu dans la copie R2" },
    { id: "R2", title: "Programme du cycle 4 (2020), reproduction du PDF ministériel", url: "https://pi.ac3j.fr/wp-content/uploads/2025/11/Programme_Cycle_4_Mathematiques_Juillet_2020.pdf", kind: "official", note: "copie hébergée par un site tiers (inventaire A1, source S5)" },
    { id: "R3", title: "Repères annuels de progression – cycle 4 – mathématiques (BO n° 22 du 29 mai 2019), copie de l'académie de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_rep%C3%A8res%20annuels%20de%20progression%20cycle%204%20maths.pdf", kind: "official" },
    { id: "R4", title: "Attendus de fin d'année de 3e – mathématiques (2019), copie de l'académie de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_attendus%20de%20fin%20d%27ann%C3%A9e%203%C3%A8me.pdf", kind: "official" },
    { id: "R5", title: "Attendus de fin d'année de 4e – mathématiques (2019), copie de l'académie de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_attendus%20de%20fin%20d%27ann%C3%A9e%204%C3%A8me.pdf", kind: "official", note: "objectifs de consolidation M4-NC-*" },
  ],
  lesson: {
    introduction: "La lumière du Soleil met environ $500$ secondes pour parcourir $150\\,000\\,000$ km ; un virus mesure environ $0{,}000\\,000\\,1$ m. Pour écrire et calculer avec de tels nombres sans se perdre dans les zéros, on utilise les **puissances** et la **notation scientifique**.\nDans ce chapitre, tu vas aussi consolider le calcul avec les **fractions** (des nombres exacts, là où une écriture décimale serait arrondie) et utiliser la **racine carrée** pour retrouver une longueur à partir d'une aire. Fil rouge : savoir distinguer une **valeur exacte** ($\\dfrac{1}{3}$, $\\sqrt{2}$) d'une **valeur approchée** ($0{,}33$, $1{,}41$).",
    definitions: [
      { term: "Puissance d'exposant entier", text: "Pour un nombre $a$ et un entier $n \\geqslant 1$, $a^n$ est le produit de $n$ facteurs égaux à $a$ : $a^n = a \\times a \\times \\ldots \\times a$. On lit « $a$ exposant $n$ » ; $a$ est la **base**, $n$ l'**exposant**.\nPour $a \\neq 0$ : $a^0 = 1$ et $a^{-n} = \\dfrac{1}{a^n}$ (l'**inverse** de $a^n$).\nExemples : $2^5 = 32$ ; $5^{-2} = \\dfrac{1}{25} = 0{,}04$ ; $10^{-3} = 0{,}001$." },
      { term: "Notation scientifique", text: "Un nombre décimal positif est écrit en **notation scientifique** lorsqu'il s'écrit $a \\times 10^{n}$ avec $1 \\leqslant a < 10$ et $n$ entier relatif (pour un nombre négatif : $-a \\times 10^{n}$).\nExemples : $45\\,000 = 4{,}5 \\times 10^{4}$ ; $0{,}000\\,72 = 7{,}2 \\times 10^{-4}$. L'exposant $n$ renseigne sur l'**ordre de grandeur** (puissance de 10 la plus proche)." },
      { term: "Préfixes", text: "giga (G) $= 10^{9}$ ; méga (M) $= 10^{6}$ ; kilo (k) $= 10^{3}$ ; milli (m) $= 10^{-3}$ ; micro (µ) $= 10^{-6}$ ; nano (n) $= 10^{-9}$. Exemple : $3$ ns $= 3 \\times 10^{-9}$ s." },
      { term: "Racine carrée", text: "Pour un nombre $a$ **positif**, la racine carrée de $a$, notée $\\sqrt{a}$, est le nombre **positif** dont le carré est égal à $a$ : $(\\sqrt{a})^2 = a$ et $\\sqrt{a} \\geqslant 0$.\nExemples : $\\sqrt{49} = 7$ car $7^2 = 49$ et $7 \\geqslant 0$ ; $\\sqrt{0{,}25} = 0{,}5$. La racine carrée d'un nombre négatif n'existe pas." },
      { term: "Valeur exacte, valeur approchée", text: "Une **valeur exacte** est égale au nombre : $\\dfrac{2}{3}$, $\\sqrt{10}$, $\\pi$. Une **valeur approchée** en est seulement proche : $0{,}67$, $3{,}16$, $3{,}14$. On écrit $\\sqrt{10} \\approx 3{,}16$ avec le symbole $\\approx$, jamais $=$." },
      { term: "Nombre rationnel, inverse", text: "Un **nombre rationnel** est un quotient $\\dfrac{a}{b}$ de deux entiers ($b \\neq 0$). L'**inverse** d'un nombre $x$ non nul est le nombre $\\dfrac{1}{x}$, qui multiplié par $x$ donne $1$ : l'inverse de $\\dfrac{3}{4}$ est $\\dfrac{4}{3}$." },
    ],
    properties: [
      { title: "Opérations sur les fractions", statement: "$\\dfrac{a}{b} + \\dfrac{c}{b} = \\dfrac{a + c}{b}$ (même dénominateur) ;\n$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{a \\times c}{b \\times d}$ ;\n$\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.", conditions: "Dénominateurs non nuls ; pour la division, $c \\neq 0$. Pour additionner, on met d'abord au même dénominateur." },
      { title: "Règles de calcul sur les puissances", statement: "Pour $a \\neq 0$ et $m$, $n$ entiers relatifs :\n$a^m \\times a^n = a^{m+n}$ ; $\\dfrac{a^m}{a^n} = a^{m-n}$ ; $(a^m)^n = a^{m \\times n}$.\nExemple : $\\dfrac{10^{5} \\times 10^{-2}}{10^{-4}} = \\dfrac{10^{3}}{10^{-4}} = 10^{7}$.", conditions: "Ces règles ne valent que pour une **même base**. Il n'y a pas de règle pour $a^m + a^n$. On peut toujours retrouver ces règles en comptant les facteurs." },
      { title: "Signe d'une puissance", statement: "$(-a)^n$ est positif si $n$ est pair, négatif si $n$ est impair. Attention : $-a^n = -(a^n)$, l'exposant ne porte que sur $a$. Ainsi $(-3)^2 = 9$ mais $-3^2 = -9$.", conditions: "Pour $a \\neq 0$ (si $a = 0$, la puissance vaut $0$)." },
      { title: "Racine carrée et carré", statement: "Pour $a \\geqslant 0$ : $\\sqrt{a^2} = a$ et $(\\sqrt{a})^2 = a$. Si $0 \\leqslant a < b$, alors $\\sqrt{a} < \\sqrt{b}$ : on peut encadrer une racine carrée par deux entiers ($5 < \\sqrt{30} < 6$ car $25 < 30 < 36$).", conditions: "En général $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$ : $\\sqrt{9 + 16} = 5$ mais $\\sqrt{9} + \\sqrt{16} = 7$." },
      { title: "Équation $x^2 = a$ pour une longueur", statement: "Si une longueur $\\ell$ vérifie $\\ell^2 = a$ (avec $a > 0$), alors $\\ell = \\sqrt{a}$, car une longueur est positive. Exemple : un carré d'aire $20$ cm² a pour côté $\\sqrt{20}$ cm." },
    ],
    explanations: [
      { title: "1. Pourquoi additionne-t-on les exposants ?", body: "$2^3 \\times 2^4 = (2 \\times 2 \\times 2) \\times (2 \\times 2 \\times 2 \\times 2)$ : il y a $3 + 4 = 7$ facteurs, donc $2^7$. De même, $\\dfrac{2^5}{2^2}$ : on simplifie 2 facteurs du haut avec 2 du bas, il en reste $5 - 2 = 3$. Pas besoin d'apprendre les règles par cœur : on peut toujours les retrouver en comptant les facteurs." },
      { title: "2. D'où vient $a^{-n} = \\dfrac{1}{a^n}$ ?", body: "Prolonge la suite $10^{3} = 1\\,000$, $10^{2} = 100$, $10^{1} = 10$ : à chaque pas, on divise par 10. On obtient $10^{0} = 1$, $10^{-1} = 0{,}1 = \\dfrac{1}{10}$, $10^{-2} = 0{,}01 = \\dfrac{1}{10^{2}}$. Un exposant négatif ne donne donc **pas** un nombre négatif, mais un nombre plus petit que 1 (pour une base supérieure à 1)." },
      { title: "3. La notation scientifique, une affaire de virgule", body: "Pour écrire $0{,}000\\,36$ en notation scientifique, on place la virgule après le premier chiffre non nul : $3{,}6$. On l'a déplacée de 4 rangs vers la droite, le nombre est plus petit que 1 : $0{,}000\\,36 = 3{,}6 \\times 10^{-4}$.\nPour calculer un produit ou un quotient, on traite séparément les nombres décimaux et les puissances de 10, puis on réajuste : $6 \\times 10^{3} \\times 5 \\times 10^{4} = 30 \\times 10^{7} = 3 \\times 10^{8}$." },
      { title: "4. Fractions : un nombre exact", body: "$\\dfrac{1}{3}$ est un nombre exact, mais son écriture décimale $0{,}333\\ldots$ ne s'arrête jamais. C'est pourquoi on garde souvent les fractions jusqu'au bout d'un calcul. « Prendre une fraction **d'**une quantité » se traduit par une **multiplication** : les $\\dfrac{3}{4}$ de $\\dfrac{2}{5}$, c'est $\\dfrac{3}{4} \\times \\dfrac{2}{5} = \\dfrac{3}{10}$." },
      { title: "5. La racine carrée, l'opération « inverse » du carré", body: "Élever au carré transforme un côté en aire ; prendre la racine carrée transforme une aire en côté. $\\sqrt{36} = 6$ est exact. $\\sqrt{20}$ n'est pas un nombre décimal : sa valeur exacte s'écrit $\\sqrt{20}$, et la calculatrice en donne une valeur approchée $4{,}472\\ldots$ Pour ne pas accumuler les erreurs, on garde $\\sqrt{20}$ dans les calculs et on arrondit **à la fin**." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Fractions et priorités", statement: "Calculer $A = \\dfrac{5}{6} - \\dfrac{2}{3} \\times \\dfrac{9}{8}$ et donner le résultat sous forme irréductible.", steps: ["La multiplication est prioritaire : $\\dfrac{2}{3} \\times \\dfrac{9}{8} = \\dfrac{18}{24} = \\dfrac{3}{4}$.", "$A = \\dfrac{5}{6} - \\dfrac{3}{4}$ ; dénominateur commun $12$ : $A = \\dfrac{10}{12} - \\dfrac{9}{12} = \\dfrac{1}{12}$."], answer: "$A = \\dfrac{1}{12}$" },
      { title: "Exemple 2 — Diviser par une fraction", statement: "Calculer $B = \\dfrac{4}{9} \\div \\dfrac{10}{3}$.", steps: ["Diviser par $\\dfrac{10}{3}$, c'est multiplier par son inverse $\\dfrac{3}{10}$.", "$B = \\dfrac{4}{9} \\times \\dfrac{3}{10} = \\dfrac{12}{90} = \\dfrac{2}{15}$ (simplification par 6)."], answer: "$B = \\dfrac{2}{15}$" },
      { title: "Exemple 3 — Puissances et notation scientifique", statement: "Donner l'écriture scientifique de $C = \\dfrac{3 \\times 10^{5} \\times 8 \\times 10^{-2}}{4 \\times 10^{-3}}$.", steps: ["On regroupe : $C = \\dfrac{3 \\times 8}{4} \\times \\dfrac{10^{5} \\times 10^{-2}}{10^{-3}}$.", "$\\dfrac{24}{4} = 6$ et $\\dfrac{10^{3}}{10^{-3}} = 10^{3 - (-3)} = 10^{6}$.", "$C = 6 \\times 10^{6}$, déjà en notation scientifique."], answer: "$C = 6 \\times 10^{6}$" },
      { title: "Exemple 4 — Un problème d'ordre de grandeur", statement: "Un globule rouge mesure environ $7$ µm de diamètre. Combien de globules rouges faut-il aligner pour faire $1$ cm ?", steps: ["$7$ µm $= 7 \\times 10^{-6}$ m et $1$ cm $= 10^{-2}$ m.", "$\\dfrac{10^{-2}}{7 \\times 10^{-6}} = \\dfrac{1}{7} \\times 10^{4} \\approx 0{,}143 \\times 10^{4} \\approx 1\\,430$."], answer: "Environ $1\\,400$ globules rouges." },
      { title: "Exemple 5 — Racine carrée dans un problème", statement: "Un triangle $ABC$ est rectangle en $A$ avec $AB = 4$ cm et $AC = 7$ cm. Calculer $BC$ : valeur exacte puis arrondi au millimètre.", steps: ["Pythagore : $BC^2 = 4^2 + 7^2 = 16 + 49 = 65$.", "$BC > 0$ donc $BC = \\sqrt{65}$ cm (valeur exacte).", "Calculatrice : $\\sqrt{65} \\approx 8{,}062$, donc $BC \\approx 8{,}1$ cm au millimètre."], answer: "$BC = \\sqrt{65}$ cm $\\approx 8{,}1$ cm" },
    ],
    illustrations: [
      { svg: squareRoot, alt: "Carré colorié d'aire 20 cm² ; chaque côté mesure racine de 20 centimètres, environ 4,47 cm.", caption: "Le côté d'un carré d'aire $20$ cm² est $\\sqrt{20}$ cm (valeur exacte) $\\approx 4{,}47$ cm (valeur approchée)." },
      { svg: fractionBar, alt: "Bande de 15 cases : 6 cases rouges pour les tomates (2/5), 3 cases vertes pour les salades (1/3 des 9 cases restantes), 6 cases blanches libres.", caption: "Les salades occupent $\\dfrac{1}{3}$ du reste, soit $\\dfrac{1}{3} \\times \\dfrac{3}{5} = \\dfrac{1}{5}$ du potager." },
      { svg: powersScale, alt: "Échelle verticale des longueurs de 10 puissance −9 m (molécule) à 10 puissance 9 m, avec les préfixes nano, micro, milli, kilo, méga, giga.", caption: "Chaque palier multiplie la longueur par $10^{3}$ : les préfixes vont de 3 en 3." },
    ],
    commonMistakes: [
      { mistake: "$\\dfrac{2}{3} + \\dfrac{1}{4} = \\dfrac{3}{7}$", correction: "$\\dfrac{2}{3} + \\dfrac{1}{4} = \\dfrac{8}{12} + \\dfrac{3}{12} = \\dfrac{11}{12}$", why: "On n'additionne pas les dénominateurs : on met au même dénominateur, puis on additionne les numérateurs." },
      { mistake: "$\\dfrac{3}{5} \\div \\dfrac{2}{7} = \\dfrac{6}{35}$", correction: "$\\dfrac{3}{5} \\div \\dfrac{2}{7} = \\dfrac{3}{5} \\times \\dfrac{7}{2} = \\dfrac{21}{10}$", why: "Diviser par une fraction, c'est multiplier par son **inverse**." },
      { mistake: "$2^{-3} = -8$", correction: "$2^{-3} = \\dfrac{1}{2^{3}} = \\dfrac{1}{8}$", why: "Un exposant négatif donne un inverse, pas un nombre négatif." },
      { mistake: "$3^{4} = 12$", correction: "$3^{4} = 3 \\times 3 \\times 3 \\times 3 = 81$", why: "L'exposant indique le nombre de facteurs, pas un multiplicateur." },
      { mistake: "$5^{2} \\times 5^{3} = 5^{6}$ ou $25^{5}$", correction: "$5^{2} \\times 5^{3} = 5^{5}$", why: "On additionne les exposants et on garde la base." },
      { mistake: "$-4^{2} = 16$", correction: "$-4^{2} = -16$ ; c'est $(-4)^{2}$ qui vaut $16$", why: "Sans parenthèses, l'exposant ne porte que sur $4$." },
      { mistake: "$\\sqrt{9 + 16} = 3 + 4 = 7$", correction: "$\\sqrt{9 + 16} = \\sqrt{25} = 5$", why: "La racine d'une somme n'est pas la somme des racines : on calcule d'abord sous la racine." },
      { mistake: "$\\sqrt{2} = 1{,}414$", correction: "$\\sqrt{2} \\approx 1{,}414$", why: "$1{,}414$ n'est qu'une valeur approchée : on utilise le symbole $\\approx$." },
      { mistake: "$25 \\times 10^{3}$ « est en notation scientifique »", correction: "$25 \\times 10^{3} = 2{,}5 \\times 10^{4}$", why: "Le nombre devant la puissance de 10 doit être compris entre 1 et 10 (10 exclu)." },
    ],
    methods: [
      { title: "Calculer avec des fractions", steps: ["Repérer les priorités (parenthèses, puis $\\times$ et $\\div$, puis $+$ et $-$).", "Pour $\\times$ : multiplier « en ligne » ; pour $\\div$ : multiplier par l'inverse.", "Pour $+$ et $-$ : mettre au même dénominateur.", "Simplifier pour obtenir une fraction irréductible."] },
      { title: "Simplifier un quotient de puissances", steps: ["Regrouper les nombres d'un côté, les puissances de même base de l'autre.", "Simplifier le numérateur (addition des exposants).", "Soustraire l'exposant du dénominateur (attention aux exposants négatifs).", "Réajuster si l'on veut la notation scientifique."] },
      { title: "Écrire en notation scientifique", steps: ["Placer la virgule après le premier chiffre non nul : on obtient $a$, avec $1 \\leqslant a < 10$.", "Compter de combien de rangs la virgule s'est déplacée : c'est la valeur de l'exposant.", "Exposant positif si le nombre est supérieur à 10, négatif s'il est inférieur à 1."] },
      { title: "Utiliser une racine carrée dans un problème", steps: ["Établir une relation du type $\\ell^2 = a$ (aire d'un carré, Pythagore, aire d'un disque…).", "Écrire la valeur exacte $\\ell = \\sqrt{a}$ (une longueur est positive).", "Donner une valeur approchée à la calculatrice, arrondie comme demandé, avec le symbole $\\approx$."] },
    ],
    summary: [
      "$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$ ; diviser par une fraction, c'est multiplier par son inverse ; pour $+$ et $-$, même dénominateur.",
      "$a^n$ : produit de $n$ facteurs égaux à $a$ ; $a^0 = 1$ ; $a^{-n} = \\dfrac{1}{a^n}$ (inverse, pas opposé).",
      "$a^m \\times a^n = a^{m+n}$ ; $\\dfrac{a^m}{a^n} = a^{m-n}$ ; $(a^m)^n = a^{mn}$, pour une même base.",
      "Notation scientifique : $a \\times 10^{n}$ avec $1 \\leqslant a < 10$ ; l'exposant renseigne sur l'ordre de grandeur.",
      "$\\sqrt{a}$ ($a \\geqslant 0$) est le nombre positif dont le carré vaut $a$ ; un côté d'aire $A$ mesure $\\sqrt{A}$.",
      "Valeur exacte ($\\sqrt{2}$, $\\dfrac{1}{3}$) ≠ valeur approchée ($1{,}41$ ; $0{,}33$) : on arrondit à la fin, avec $\\approx$.",
    ],
    revisionSheet: {
      keyPoints: [
        "$\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$.",
        "$10^{-3} = 0{,}001$ ; $10^{6} = 1\\,000\\,000$ ; nano $10^{-9}$, micro $10^{-6}$, milli $10^{-3}$, kilo $10^{3}$, méga $10^{6}$, giga $10^{9}$.",
        "$(-2)^4 = 16$ mais $-2^4 = -16$.",
        "Carrés parfaits : $1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144$.",
        "$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$ en général.",
      ],
      skills: [
        "Calculer avec des fractions en respectant les priorités et donner un résultat irréductible.",
        "Simplifier des produits et quotients de puissances, y compris d'exposant négatif.",
        "Écrire, comparer et calculer en notation scientifique ; utiliser les préfixes.",
        "Donner la valeur exacte puis une valeur approchée d'une racine carrée ; encadrer une racine entre deux entiers.",
        "Résoudre des problèmes (astronomie, biologie, géométrie) avec ces outils.",
      ],
    },
    miniQuiz: [
      { question: "$\\dfrac{2}{3} \\div \\dfrac{4}{9} =$", options: ["$\\dfrac{8}{27}$", "$\\dfrac{3}{2}$", "$\\dfrac{2}{3}$", "$\\dfrac{6}{12}$"], answer: 1, explanation: "$\\dfrac{2}{3} \\times \\dfrac{9}{4} = \\dfrac{18}{12} = \\dfrac{3}{2}$." },
      { question: "$5^{-2} =$", options: ["$-25$", "$-10$", "$\\dfrac{1}{25}$", "$\\dfrac{1}{10}$"], answer: 2, explanation: "$5^{-2} = \\dfrac{1}{5^2} = \\dfrac{1}{25}$." },
      { question: "$\\dfrac{10^{4} \\times 10^{-6}}{10^{-3}} =$", options: ["$10^{1}$", "$10^{-5}$", "$10^{13}$", "$10^{-8}$"], answer: 0, explanation: "$10^{4 + (-6)} = 10^{-2}$, puis $10^{-2 - (-3)} = 10^{1}$." },
      { question: "L'écriture scientifique de $0{,}0052$ est…", options: ["$52 \\times 10^{-4}$", "$5{,}2 \\times 10^{-3}$", "$5{,}2 \\times 10^{3}$", "$0{,}52 \\times 10^{-2}$"], answer: 1, explanation: "On place la virgule après 5 : déplacement de 3 rangs, nombre inférieur à 1, donc $10^{-3}$." },
      { question: "Le côté d'un carré d'aire $50$ cm² vaut exactement…", options: ["$25$ cm", "$\\sqrt{50}$ cm", "$7{,}07$ cm", "$12{,}5$ cm"], answer: 1, explanation: "Côté $= \\sqrt{50}$ cm ; $7{,}07$ cm n'en est qu'une valeur approchée." },
      { question: "Entre quels entiers se trouve $\\sqrt{90}$ ?", options: ["8 et 9", "9 et 10", "44 et 46", "89 et 91"], answer: 1, explanation: "$81 < 90 < 100$, donc $9 < \\sqrt{90} < 10$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "pc3-jeu-flash", template: "calcul-flash", title: "Calcul flash : fractions, puissances, racines",
      objective: "Automatiser les calculs de référence sur les fractions, les puissances et les racines carrées, avec une explication à chaque erreur.",
      instructions: "Donne la valeur exacte de chaque calcul (entier, décimal ou fraction irréductible comme 5/6). Entraînement sans chrono ou défi chronométré ; le niveau monte quand tu réussis.",
      objectives: ["M3-NC-07", "M4-NC-04", "M3-NC-04", "M4-NC-07", "M4-NC-10", "M3-NC-05"],
      config: {
        duration: 90, practiceCount: 15,
        levels: [
          { label: "Fractions", items: [
            { q: "$\\dfrac{1}{2} + \\dfrac{1}{3}$", answer: "5/6", irreducible: true, explanation: "$\\dfrac{3}{6} + \\dfrac{2}{6} = \\dfrac{5}{6}$." },
            { q: "$\\dfrac{3}{4} - \\dfrac{1}{8}$", answer: "5/8", irreducible: true, explanation: "$\\dfrac{6}{8} - \\dfrac{1}{8} = \\dfrac{5}{8}$." },
            { q: "$\\dfrac{2}{3} \\times \\dfrac{9}{4}$", answer: "3/2", irreducible: true, explanation: "$\\dfrac{18}{12} = \\dfrac{3}{2}$." },
            { q: "$\\dfrac{5}{6} \\div \\dfrac{5}{3}$", answer: "1/2", irreducible: true, explanation: "$\\dfrac{5}{6} \\times \\dfrac{3}{5} = \\dfrac{15}{30} = \\dfrac{1}{2}$." },
            { q: "$\\dfrac{7}{10} + \\dfrac{3}{10}$", answer: "1", irreducible: true, explanation: "$\\dfrac{10}{10} = 1$." },
            { q: "$2 - \\dfrac{3}{5}$", answer: "7/5", irreducible: true, explanation: "$\\dfrac{10}{5} - \\dfrac{3}{5} = \\dfrac{7}{5}$." },
            { q: "$\\dfrac{4}{9} \\times 3$", answer: "4/3", irreducible: true, explanation: "$\\dfrac{12}{9} = \\dfrac{4}{3}$." },
            { q: "$\\dfrac{1}{4} + \\dfrac{1}{4} \\times 2$", answer: "3/4", irreducible: true, explanation: "Priorité à la multiplication : $\\dfrac{1}{4} + \\dfrac{2}{4} = \\dfrac{3}{4}$." },
          ] },
          { label: "Puissances", items: [
            { q: "$2^{5}$", answer: "32", explanation: "$2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$." },
            { q: "$3^{-2}$", answer: "1/9", irreducible: true, explanation: "$3^{-2} = \\dfrac{1}{3^2} = \\dfrac{1}{9}$." },
            { q: "$10^{-3}$", answer: "0,001", explanation: "Le 1 est au 3e rang après la virgule." },
            { q: "$(-2)^{3}$", answer: "-8", explanation: "Trois facteurs négatifs : produit négatif, $-8$." },
            { q: "$5^{0}$", answer: "1", explanation: "Pour $a \\neq 0$, $a^0 = 1$." },
            { q: "$-3^{2}$", answer: "-9", explanation: "L'exposant ne porte que sur 3 : $-(3^2) = -9$." },
            { q: "$2^{3} \\times 2^{-1}$", answer: "4", explanation: "$2^{3 + (-1)} = 2^{2} = 4$." },
            { q: "$\\dfrac{10^{7}}{10^{4}}$", answer: "1000", explanation: "$10^{7 - 4} = 10^{3} = 1\\,000$." },
          ] },
          { label: "Racines et notation scientifique", items: [
            { q: "$\\sqrt{144}$", answer: "12", explanation: "$12^2 = 144$." },
            { q: "$\\sqrt{0{,}25}$", answer: "0,5", explanation: "$0{,}5^2 = 0{,}25$." },
            { q: "$\\sqrt{3^{2} + 4^{2}}$", answer: "5", explanation: "$\\sqrt{9 + 16} = \\sqrt{25} = 5$ (et non $3 + 4$)." },
            { q: "$2{,}5 \\times 10^{3} + 500$", answer: "3000", explanation: "$2{,}5 \\times 10^{3} = 2\\,500$, puis $2\\,500 + 500 = 3\\,000$." },
            { q: "$4 \\times 10^{-2} \\times 25$", answer: "1", explanation: "$4 \\times 10^{-2} = 0{,}04$ et $0{,}04 \\times 25 = 1$." },
            { q: "$(2 \\times 10^{3}) \\times (3 \\times 10^{2})$", answer: "6e5", explanation: "$6 \\times 10^{5} = 600\\,000$." },
            { q: "$\\dfrac{8 \\times 10^{5}}{2 \\times 10^{2}}$", answer: "4000", explanation: "$4 \\times 10^{3} = 4\\,000$." },
            { q: "$\\sqrt{100} \\times 10^{-1}$", answer: "1", explanation: "$10 \\times 0{,}1 = 1$." },
          ] },
        ],
      },
    },
    {
      id: "pc3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs de calcul",
      objective: "Repérer et nommer les erreurs classiques sur les fractions, les puissances, la notation scientifique et les racines carrées.",
      instructions: "Pour chaque calcul, dis s'il est juste. S'il est faux, choisis l'erreur commise.",
      objectives: ["M3-NC-07", "M4-NC-04", "M4-NC-09", "M3-NC-04", "M4-NC-08", "M3-NC-06"],
      config: { items: [
        { niveau: 1, calc: "$\\dfrac{2}{3} + \\dfrac{1}{4} = \\dfrac{3}{7}$", correct: false, errors: ["On n'additionne pas les dénominateurs : il faut un dénominateur commun", "Il fallait multiplier les numérateurs", "Il fallait simplifier le résultat"], error: 0, explanation: "$\\dfrac{8}{12} + \\dfrac{3}{12} = \\dfrac{11}{12}$." },
        { niveau: 1, calc: "$\\dfrac{2}{3} \\times \\dfrac{5}{7} = \\dfrac{10}{21}$", correct: true, explanation: "Numérateurs et dénominateurs se multiplient entre eux." },
        { niveau: 1, calc: "$3^{4} = 12$", correct: false, errors: ["$3^4$ signifie $3 \\times 3 \\times 3 \\times 3$, pas $3 \\times 4$", "Il fallait calculer $4^3$", "Il manque un signe moins"], error: 0, explanation: "$3^4 = 81$." },
        { niveau: 1, calc: "$10^{-3} = 0{,}001$", correct: true, explanation: "Le chiffre 1 est au 3e rang après la virgule." },
        { niveau: 2, calc: "$2^{-3} = -8$", correct: false, errors: ["Un exposant négatif donne un inverse, pas un nombre négatif", "Il fallait écrire $-6$", "Il fallait écrire $8$"], error: 0, explanation: "$2^{-3} = \\dfrac{1}{8}$." },
        { niveau: 2, calc: "$\\dfrac{3}{4} \\div \\dfrac{2}{5} = \\dfrac{6}{20}$", correct: false, errors: ["Diviser par une fraction, c'est multiplier par son inverse", "Il fallait seulement simplifier par 2", "Il fallait additionner les fractions"], error: 0, explanation: "$\\dfrac{3}{4} \\times \\dfrac{5}{2} = \\dfrac{15}{8}$." },
        { niveau: 2, calc: "$5^{3} \\times 5^{4} = 5^{12}$", correct: false, errors: ["Pour un produit de puissances de même base, on additionne les exposants", "Il fallait multiplier les bases : $25^{7}$", "Il fallait soustraire les exposants"], error: 0, explanation: "$5^{3} \\times 5^{4} = 5^{7}$." },
        { niveau: 2, calc: "$\\sqrt{49} = 7$", correct: true, explanation: "$7^2 = 49$ et $7 \\geqslant 0$." },
        { niveau: 3, calc: "$\\sqrt{9 + 16} = 3 + 4$", correct: false, errors: ["La racine d'une somme n'est pas la somme des racines", "Il fallait écrire $3 \\times 4$", "Il fallait écrire $9 + 4$"], error: 0, explanation: "$\\sqrt{9 + 16} = \\sqrt{25} = 5$, pas $7$." },
        { niveau: 3, calc: "$34 \\times 10^{5}$ est en notation scientifique", correct: false, errors: ["Le nombre devant la puissance doit être entre 1 et 10 (10 exclu)", "L'exposant devrait être négatif", "Il faudrait écrire $34 \\times 10^{-5}$"], error: 0, explanation: "$34 \\times 10^{5} = 3{,}4 \\times 10^{6}$." },
        { niveau: 3, calc: "$(10^{2})^{3} = 10^{6}$", correct: true, explanation: "On multiplie les exposants : $2 \\times 3 = 6$." },
        { niveau: 3, calc: "$\\dfrac{1}{2} + \\dfrac{1}{2} \\times \\dfrac{1}{3} = \\dfrac{1}{3}$", correct: false, errors: ["La multiplication est prioritaire sur l'addition", "Il fallait additionner les dénominateurs", "Il fallait diviser au lieu de multiplier"], error: 0, explanation: "$\\dfrac{1}{2} + \\dfrac{1}{6} = \\dfrac{2}{3}$." },
        { niveau: 4, calc: "$\\dfrac{10^{5}}{10^{-2}} = 10^{3}$", correct: false, errors: ["On soustrait les exposants : $5 - (-2) = 7$", "Il fallait diviser les exposants", "Il fallait multiplier les exposants"], error: 0, explanation: "$\\dfrac{10^{5}}{10^{-2}} = 10^{7}$." },
        { niveau: 4, calc: "$-2^{4} = 16$", correct: false, errors: ["Sans parenthèses, l'exposant ne porte que sur 2", "Une puissance paire est toujours négative", "Il fallait calculer $2 \\times 4$"], error: 0, explanation: "$-2^{4} = -16$ ; c'est $(-2)^{4}$ qui vaut 16." },
        { niveau: 4, calc: "$\\sqrt{2} = 1{,}414$", correct: false, errors: ["$1{,}414$ n'est qu'une valeur approchée : on écrit $\\approx$", "Il fallait écrire $1{,}41$", "$\\sqrt{2}$ vaut exactement $1{,}5$"], error: 0, explanation: "$\\sqrt{2} \\approx 1{,}414$ : son écriture décimale ne s'arrête jamais." },
        { niveau: 4, calc: "$(3 \\times 10^{4}) \\times (4 \\times 10^{-6}) = 1{,}2 \\times 10^{-1}$", correct: true, explanation: "$12 \\times 10^{-2} = 1{,}2 \\times 10^{-1}$." },
      ] },
    },
    {
      id: "pc3-jeu-memory", template: "memory", title: "Memory des écritures égales",
      objective: "Reconnaître rapidement des écritures égales : puissances, fractions, racines, notation scientifique et préfixes.",
      instructions: "Retourne deux cartes : si elles désignent le même nombre, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-NC-04", "M4-NC-10", "M4-NC-07", "M4-NC-04", "M4-NC-08"],
      config: { pairs: [
        ["$2^{-3}$", "$\\dfrac{1}{8}$"],
        ["$\\sqrt{81}$", "$9$"],
        ["$10^{-4}$", "$0{,}0001$"],
        ["$\\dfrac{3}{4} \\times \\dfrac{2}{9}$", "$\\dfrac{1}{6}$"],
        ["méga (M)", "$10^{6}$"],
        ["$4{,}2 \\times 10^{3}$", "$4\\,200$"],
        ["$5^{0}$", "$1$"],
        ["$\\dfrac{2}{5} \\div \\dfrac{4}{15}$", "$\\dfrac{3}{2}$"],
      ] },
    },
  ],
  reviewStatus: { curriculum: "pending", accuracy: "pending", exercises: "pending", games: "pending", technical: "pending", language: "pending" },
  publicationStatus: "draft",
};
