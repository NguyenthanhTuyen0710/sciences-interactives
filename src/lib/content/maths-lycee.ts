// Générateurs originaux – Mathématiques, lycée (Seconde → Terminale).
import type { Generator, Rng } from "../engine/types";
import { fracTex, simplify, tex } from "../engine/numbers";
import { par, polyExpr, polyTex } from "../engine/fmt";
import { plot } from "../engine/svg";

const nz = (rng: Rng, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = rng.int(a, b);
  return v;
};
const mul = (p: number[], q: number[]) => {
  const r = new Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (r[i + j] += a * b)));
  return r;
};
const add = (p: number[], q: number[]) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0));
const mono = (c: number, p: number) => polyTex(Array.from({ length: p + 1 }, (_, j) => (j === p ? c : 0)));
const lin = (a: number, b: number) => `(${polyTex([b, a])})`;

export const m2Developper: Generator = {
  meta: {
    id: "m2-developper", title: "Développer et réduire",
    subject: "maths", level: "2nde", chapterId: "m2-calculs", notionId: "m2-calculs-litteral",
    kinds: ["expression"], summary: "Identités remarquables et double distributivité ; correction symbolique.", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const a = d === 1 ? 1 : rng.int(2, 5), b = rng.int(1, 9);
    const kind = d === 3 ? "mix" : rng.pick(["carre+", "carre-", "diff"] as const);
    let E: string, coefs: number[], sol: string[];
    if (kind === "carre+") {
      E = `${lin(a, b)}^2`; coefs = mul([b, a], [b, a]);
      sol = [`On utilise $(u + v)^2 = u^2 + 2uv + v^2$ avec $u = ${polyTex([0, a])}$ et $v = ${b}$.`, `$${E} = (${polyTex([0, a])})^2 + 2 \\times ${polyTex([0, a])} \\times ${b} + ${b}^2 = ${polyTex(coefs)}$`];
    } else if (kind === "carre-") {
      E = `${lin(a, -b)}^2`; coefs = mul([-b, a], [-b, a]);
      sol = [`On utilise $(u - v)^2 = u^2 - 2uv + v^2$ avec $u = ${polyTex([0, a])}$ et $v = ${b}$.`, `$${E} = (${polyTex([0, a])})^2 - 2 \\times ${polyTex([0, a])} \\times ${b} + ${b}^2 = ${polyTex(coefs)}$`];
    } else if (kind === "diff") {
      E = `${lin(a, b)}${lin(a, -b)}`; coefs = mul([b, a], [-b, a]);
      sol = [`On utilise $(u + v)(u - v) = u^2 - v^2$ avec $u = ${polyTex([0, a])}$ et $v = ${b}$.`, `$${E} = (${polyTex([0, a])})^2 - ${b}^2 = ${polyTex(coefs)}$`];
    } else {
      const c = nz(rng, -5, 5), e = nz(rng, -9, 9), f = nz(rng, -6, 6);
      const p1 = mul([b, a], [e, c]);
      const p2 = mul([f, 1], [f, 1]);
      coefs = add(p1, p2.map((x) => -x));
      E = `${lin(a, b)}${lin(c, e)} - ${lin(1, f)}^2`;
      sol = [
        `Double distributivité : $${lin(a, b)}${lin(c, e)} = ${polyTex(p1)}$`,
        `Identité remarquable : $${lin(1, f)}^2 = ${polyTex(p2)}$`,
        `On soustrait (attention aux signes) : $${polyTex(p1)} - (${polyTex(p2)}) = ${polyTex(coefs)}$`,
      ];
    }
    return {
      statement: `Développer et réduire $A = ${E}$.`,
      parts: [{ interaction: { kind: "expression", label: "A =", variable: "x", answer: polyExpr(coefs), form: "developpee", display: polyTex(coefs) } }],
      solution: sol,
      rappel: "$(a+b)^2 = a^2 + 2ab + b^2$ ; $(a-b)^2 = a^2 - 2ab + b^2$ ; $(a+b)(a-b) = a^2 - b^2$.",
    };
  },
};

export const m2ImageGraphique: Generator = {
  meta: {
    id: "m2-images-antecedents", title: "Images et antécédents par lecture graphique",
    subject: "maths", level: "2nde", chapterId: "m2-fonctions", notionId: "m2-fonctions-lecture",
    kinds: ["numerique"], summary: "Lire une image et compter les antécédents sur une courbe.", randomized: "valeurs",
  },
  generate(rng, d) {
    const s = rng.sign();
    const h = rng.int(-2, 2), k = s > 0 ? rng.int(-4, 0) : rng.int(0, 4);
    const A = d === 3 ? 0.5 : 1;
    const f = (x: number) => s * A * (x - h) ** 2 + k;
    let x0 = h + rng.pick([-2, -1, 1, 2]);
    if (!Number.isInteger(f(x0))) x0 = h + 2;
    let y0 = k + s * rng.pick([0, 2, 3, 4]);
    if (d === 1) y0 = k + s * 2;
    if (rng.next() < 0.25) y0 = k - s * 1;
    const nb = (y0 - k) * s > 0 ? 2 : y0 === k ? 1 : 0;
    const fig = plot({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, fns: [{ f, label: "𝒞f" }], title: "Courbe représentative de f" });
    return {
      statement: "On a tracé ci-dessous la courbe représentative $\\mathcal{C}_f$ d'une fonction $f$ définie sur $[-6\\,;\\,6]$.",
      figure: { kind: "svg", svg: fig },
      parts: [
        { prompt: `Lire l'image de $${x0}$ par $f$.`, interaction: { kind: "numerique", label: `$f(${x0}) =$`, answer: { value: f(x0) } } },
        { prompt: `Combien le nombre $${y0}$ a-t-il d'antécédents par $f$ ?`, interaction: { kind: "numerique", label: "Nombre d'antécédents :", answer: { value: nb } } },
      ],
      solution: [
        `Image de $${x0}$ : on part de $${x0}$ sur l'axe des abscisses, on monte (ou descend) jusqu'à la courbe et on lit l'ordonnée : $f(${x0}) = ${tex(f(x0))}$.`,
        `Antécédents de $${y0}$ : on trace la droite horizontale d'équation $y = ${y0}$ ; elle coupe la courbe en ${nb} point(s), donc $${y0}$ a ${nb} antécédent(s).`,
      ],
      rappel: "L'image se lit sur l'axe des ordonnées ; les antécédents se lisent sur l'axe des abscisses.",
    };
  },
};

export const m1Derivee: Generator = {
  meta: {
    id: "m1-derivee-fonction", title: "Calculer une fonction dérivée",
    subject: "maths", level: "1re", chapterId: "m1-derivation", notionId: "m1-derivation-calcul",
    kinds: ["expression"], summary: "Dériver des polynômes et la fonction inverse ; toute écriture équivalente est acceptée.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    let fTex: string, fpExpr: string, fpTex: string, sol: string[];
    if (d < 3) {
      const coefs = d === 1 ? [rng.int(-9, 9), nz(rng, -9, 9), nz(rng, -6, 6)] : [rng.int(-9, 9), nz(rng, -9, 9), rng.int(-6, 6), nz(rng, -5, 5)];
      const der = coefs.slice(1).map((c, i) => c * (i + 1));
      fTex = polyTex(coefs);
      fpExpr = polyExpr(der);
      fpTex = polyTex(der);
      sol = [
        "On dérive terme à terme en utilisant $(x^n)' = nx^{n-1}$ et $(k)' = 0$.",
        ...coefs.slice(1).map((c, i) => (c ? `$(${mono(c, i + 1)})' = ${mono(c * (i + 1), i)}$` : "")).filter(Boolean),
        `Donc $f'(x) = ${polyTex(der)}$.`,
      ];
    } else {
      const a = nz(rng, -5, 5), b = nz(rng, -9, 9), c = rng.int(-9, 9);
      fTex = `${polyTex([0, 0, a])} ${b < 0 ? "-" : "+"} \\dfrac{${Math.abs(b)}}{x}${c ? (c < 0 ? " - " : " + ") + Math.abs(c) : ""}`;
      fpExpr = `${2 * a}*x - (${b})/x^2`;
      fpTex = `${polyTex([0, 2 * a])} ${b > 0 ? "-" : "+"} \\dfrac{${Math.abs(b)}}{x^2}`;
      sol = [
        `$(${polyTex([0, 0, a])})' = ${polyTex([0, 2 * a])}$`,
        `$\\left(\\dfrac{1}{x}\\right)' = -\\dfrac{1}{x^2}$, donc $\\left(\\dfrac{${b}}{x}\\right)' = ${b > 0 ? "-" : ""}\\dfrac{${Math.abs(b)}}{x^2}$`,
        `Donc $f'(x) = ${polyTex([0, 2 * a])} ${b > 0 ? "-" : "+"} \\dfrac{${Math.abs(b)}}{x^2}$.`,
      ];
    }
    return {
      statement: `Soit $f$ la fonction définie ${d === 3 ? "sur $]0\\,;\\,+\\infty[$" : "sur $\\mathbb{R}$"} par $f(x) = ${fTex}$.\nDéterminer $f'(x)$.`,
      parts: [{ interaction: { kind: "expression", label: "f'(x) =", variable: "x", answer: fpExpr, display: fpTex } }],
      solution: sol,
      rappel: "$(x^n)' = nx^{n-1}$ ; $(ku)' = ku'$ ; $(u+v)' = u' + v'$ ; $\\left(\\dfrac{1}{x}\\right)' = -\\dfrac{1}{x^2}$.",
    };
  },
};

export const m1Suites: Generator = {
  meta: {
    id: "m1-suites-arithmetiques", title: "Suites arithmétiques",
    subject: "maths", level: "1re", chapterId: "m1-suites", notionId: "m1-suites-arithmetiques",
    kinds: ["numerique", "expression"], summary: "Terme général, calcul d'un terme et d'une somme.", randomized: "valeurs",
  },
  generate(rng, d) {
    const u0 = rng.int(-10, 20), r = nz(rng, -6, 8);
    const k = rng.int(10, 50);
    const parts = [];
    const sol: string[] = [];
    if (d === 2) {
      const p = rng.int(2, 6), q = p + rng.int(3, 8);
      const up = u0 + p * r, uq = u0 + q * r;
      parts.push({ prompt: `On sait que $u_{${p}} = ${up}$ et $u_{${q}} = ${uq}$. Déterminer la raison $r$.`, interaction: { kind: "numerique" as const, label: "$r =$", answer: { value: r } } });
      parts.push({ prompt: "En déduire $u_0$.", interaction: { kind: "numerique" as const, label: "$u_0 =$", answer: { value: u0 } } });
      sol.push(`$u_{${q}} - u_{${p}} = (${q} - ${p})r$, donc $r = \\dfrac{${uq} - ${par(up)}}{${q - p}} = \\dfrac{${uq - up}}{${q - p}} = ${r}$.`);
      sol.push(`$u_{${p}} = u_0 + ${p}r$, donc $u_0 = ${up} - ${p} \\times ${par(r)} = ${u0}$.`);
    } else {
      parts.push({ prompt: "Exprimer $u_n$ en fonction de $n$.", interaction: { kind: "expression" as const, label: "u_n =", variable: "n", answer: `${u0} + (${r})*n`, display: polyTex([u0, r], "n") } });
      parts.push({ prompt: `Calculer $u_{${k}}$.`, interaction: { kind: "numerique" as const, label: `$u_{${k}} =$`, answer: { value: u0 + k * r } } });
      sol.push(`Pour une suite arithmétique de premier terme $u_0$ et de raison $r$ : $u_n = u_0 + nr$, donc $u_n = ${polyTex([u0, r], "n")}$.`);
      sol.push(`$u_{${k}} = ${u0} + ${k} \\times ${par(r)} = ${u0 + k * r}$.`);
      if (d === 3) {
        const S = ((k + 1) * (u0 + u0 + k * r)) / 2;
        parts.push({ prompt: `Calculer $S = u_0 + u_1 + \\dots + u_{${k}}$.`, interaction: { kind: "numerique" as const, label: "$S =$", answer: { value: S } } });
        sol.push(`$S = (\\text{nombre de termes}) \\times \\dfrac{\\text{premier} + \\text{dernier}}{2} = ${k + 1} \\times \\dfrac{${u0} + ${par(u0 + k * r)}}{2} = ${tex(S)}$.`);
      }
    }
    return {
      statement: d === 2 ? "$(u_n)$ est une suite arithmétique." : `$(u_n)$ est la suite arithmétique de premier terme $u_0 = ${u0}$ et de raison $r = ${r}$.`,
      parts, solution: sol,
      rappel: "Suite arithmétique : $u_{n+1} = u_n + r$, $u_n = u_0 + nr$ et $u_n = u_p + (n-p)r$.",
    };
  },
};

export const mTIntegrales: Generator = {
  meta: {
    id: "mT-integrale-polynome", title: "Primitive et calcul d'intégrale",
    subject: "maths", level: "Tle", chapterId: "mT-integration", notionId: "mT-integration-calcul",
    kinds: ["expression", "numerique"], summary: "Toute primitive correcte est acceptée (vérification par dérivation).", randomized: "valeurs", timeLimit: 300,
  },
  generate(rng, d) {
    const s = d === 3 ? nz(rng, -2, 2) : 0;
    const p = d >= 2 ? nz(rng, -3, 3) : 0;
    const q = nz(rng, -6, 6), r = rng.int(-6, 6);
    let a = rng.int(-2, 1), b = a + rng.int(1, 3);
    if (d === 1) { a = 0; b = rng.int(1, 4); }
    const f = [r, q, p, s];
    const num = 3 * s * (b ** 4 - a ** 4) + 4 * p * (b ** 3 - a ** 3) + 6 * q * (b ** 2 - a ** 2) + 12 * r * (b - a);
    const [n, dd] = simplify(num, 12);
    const Ftex = [
      s ? `${fracTex(s, 4)}x^4` : "", p ? `${fracTex(p, 3)}x^3` : "", q ? `${fracTex(q, 2)}x^2` : "", r ? `${r}x` : "",
    ].filter(Boolean).join(" + ").replace(/\+ -/g, "- ");
    return {
      statement: `Soit $f(x) = ${polyTex(f)}$.`,
      parts: [
        { prompt: "Donner une primitive $F$ de $f$ sur $\\mathbb{R}$.", interaction: { kind: "expression", label: "F(x) =", variable: "x", answer: polyExpr(f), primitive: true, display: polyTex(f) } },
        { prompt: `Calculer $I = \\displaystyle\\int_{${a}}^{${b}} f(x)\\,\\mathrm{d}x$ (valeur exacte).`, interaction: { kind: "numerique", label: "$I =$", answer: { value: n / dd, fraction: [n, dd] } } },
      ],
      solution: [
        `Une primitive de $x^n$ est $\\dfrac{x^{n+1}}{n+1}$. Ainsi $F(x) = ${Ftex}$ convient (toute fonction $F + C$ aussi).`,
        `$I = F(${b}) - F(${a})$.`,
        `$I = ${fracTex(n, dd)}$.`,
      ],
      rappel: "Si $F$ est une primitive de $f$ continue sur $[a\\,;\\,b]$, alors $\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a)$.",
    };
  },
};

export const mTLimites: Generator = {
  meta: {
    id: "mT-limite-rationnelle", title: "Limite d'une fonction rationnelle en +∞",
    subject: "maths", level: "Tle", chapterId: "mT-limites", notionId: "mT-limites-fonctions",
    kinds: ["qcm"], summary: "Identifier la limite à l'aide des termes de plus haut degré.", randomized: "valeurs", timeLimit: 120,
  },
  generate(rng, d) {
    const degs = d === 1 ? [[1, 1], [2, 2]] : d === 2 ? [[2, 2], [2, 1], [1, 2]] : [[3, 2], [2, 3], [3, 3], [2, 1]];
    const [m, k] = rng.pick(degs);
    const a = nz(rng, -6, 6), c = nz(rng, -5, 5);
    const P = [...Array.from({ length: m }, () => rng.int(-7, 7)), a];
    const Q = [...Array.from({ length: k }, () => rng.int(-7, 7)), c];
    if (Q.slice(0, k).every((v) => v === 0)) Q[0] = 1;
    let ansTex: string, why: string;
    if (m === k) { ansTex = fracTex(a, c); why = `Les degrés sont égaux : la limite est le quotient des coefficients dominants $\\dfrac{${a}}{${c}} = ${fracTex(a, c)}$.`; }
    else if (m > k) { ansTex = a / c > 0 ? "+\\infty" : "-\\infty"; why = `Après simplification, $f(x)$ se comporte comme $${fracTex(a, c)}x^{${m - k}}$, qui tend vers $${ansTex}$.`; }
    else { ansTex = "0"; why = `Après simplification, $f(x)$ se comporte comme $\\dfrac{${a}}{${c}x^{${k - m}}}$, qui tend vers $0$.`; }
    const cand = [ansTex, "0", "+\\infty", "-\\infty", fracTex(a, c), "1", fracTex(c, a)];
    const opts = [...new Set(cand)].slice(0, 5);
    const sh = rng.shuffle(opts);
    return {
      statement: `Soit $f(x) = \\dfrac{${polyTex(P)}}{${polyTex(Q)}}$. Déterminer $\\displaystyle\\lim_{x \\to +\\infty} f(x)$.`,
      parts: [{ interaction: { kind: "qcm", options: sh.map((o) => `$${o}$`), answer: [sh.indexOf(ansTex)] } }],
      solution: [
        `En $+\\infty$, on factorise numérateur et dénominateur par leur terme de plus haut degré : $f(x) = \\dfrac{${polyTex([0, 0, 0, 0].slice(0, m).concat([a]))}\\,(1 + \\dots)}{${polyTex([0, 0, 0, 0].slice(0, k).concat([c]))}\\,(1 + \\dots)}$, où les parenthèses tendent vers $1$.`,
        why,
      ],
      rappel: "En $\\pm\\infty$, une fonction rationnelle a la même limite que le quotient de ses termes de plus haut degré.",
    };
  },
};
