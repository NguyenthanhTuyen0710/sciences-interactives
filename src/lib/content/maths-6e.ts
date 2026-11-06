// Générateurs originaux – Mathématiques 6e : chapitres complémentaires
// (nombres, droites, opérations, cercle, fractions, angles, aires, division et durées,
// pourcentages, quadrilatères, solides, données, symétrie axiale).
import type { Blank, Generator, Rng } from "../engine/types";
import { fr, roundTo, tex } from "../engine/numbers";
import { LETTERS } from "../engine/fmt";
import { barChart, graduatedLine, symmetryGrid } from "../engine/svg";
import { shuffleWithIndex } from "../engine/rng";

const df = (n: number | string, d: number | string) => `\\dfrac{${n}}{${d}}`;
const num = (value: number): Blank => ({ type: "number", answer: { value: roundTo(value, 6) } });
const lettre = (k: number) => String.fromCharCode(97 + k);
/** Énoncé à trous : une ligne par question, chaque ligne contenant ses propres [[i]]. */
const trous = (lines: string[], blanks: Blank[]) => ({ interaction: { kind: "texte-trous" as const, template: lines.join("\n"), blanks } });
const distinct = <T,>(rng: Rng, n: number, gen: () => T, key: (t: T) => string = String) => {
  const out: T[] = [], seen = new Set<string>();
  for (let g = 0; out.length < n && g < 500; g++) {
    const t = gen();
    if (!seen.has(key(t))) { seen.add(key(t)); out.push(t); }
  }
  return out;
};

// ───────────── 1. Nombres entiers et décimaux ─────────────

export const m6Decomposer: Generator = {
  meta: {
    id: "m6-decomposer-nombres", title: "Chiffre des…, nombre de…",
    subject: "maths", level: "6e", chapterId: "m6-nombres", notionId: "m6-nombres-ecrire",
    kinds: ["texte-trous"], summary: "Distinguer chiffre et nombre de dizaines, centaines… et recomposer un nombre décimal.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const ranks = [
      { name: "unités", p: 1 }, { name: "dizaines", p: 10 }, { name: "centaines", p: 100 }, { name: "unités de mille", p: 1000 },
      { name: "dixièmes", p: 0.1 }, { name: "centièmes", p: 0.01 },
    ];
    const N = roundTo(rng.int(10000, 99999) + (d === 1 ? 0 : rng.int(1, 99) / 100), 2);
    const digit = (p: number) => Math.floor(roundTo(N / p, 6)) % 10;
    const lines: string[] = [], blanks: Blank[] = [], sol: string[] = [];
    const pool = d === 1 ? ranks.slice(0, 4) : ranks;
    rng.shuffle(pool).slice(0, 2).forEach((r) => {
      lines.push(`Le chiffre des ${r.name} de $${tex(N)}$ est [[${blanks.length}]]`);
      blanks.push(num(digit(r.p)));
      sol.push(`Chiffre des ${r.name} : $${digit(r.p)}$.`);
    });
    const r2 = rng.pick(ranks.slice(1, 4));
    const nb = Math.floor(N / r2.p);
    lines.push(`Le nombre de ${r2.name} dans $${tex(N)}$ est [[${blanks.length}]]`);
    blanks.push(num(nb));
    sol.push(`Nombre de ${r2.name} : on lit tout ce qui est à gauche du chiffre des ${r2.name}, chiffre compris : $${tex(nb)}$.`);
    // Recomposition
    const c = rng.int(1, 9), u = rng.int(0, 9), di = rng.int(1, 9), ce = rng.int(1, 9), mi = d === 3 ? rng.int(1, 9) : 0;
    const val = roundTo(c * 100 + u + di / 10 + ce / 100 + mi / 1000, 3);
    const terms = [`${c} \\times 100`, `${u} \\times 1`, `${di} \\times ${df(1, 10)}`, `${ce} \\times ${df(1, 100)}`, ...(mi ? [`${mi} \\times ${df(1, 1000)}`] : [])];
    lines.push(`$${terms.join(" + ")} =$ [[${blanks.length}]]`);
    blanks.push(num(val));
    sol.push(`$${terms.join(" + ")} = ${tex(val)}$ : aucune dizaine, donc un 0 au rang des dizaines.`);
    return {
      statement: "Compléter.",
      parts: [trous(lines, blanks)],
      solution: sol,
      rappel: "Le **chiffre** des dizaines est un seul chiffre ; le **nombre** de dizaines compte toutes les dizaines contenues dans le nombre.",
    };
  },
};

export const m6DroiteGraduee: Generator = {
  meta: {
    id: "m6-droite-graduee", title: "Lire des abscisses sur une demi-droite graduée",
    subject: "maths", level: "6e", chapterId: "m6-nombres", notionId: "m6-nombres-droite",
    kinds: ["texte-trous"], summary: "Déterminer la valeur d'une graduation puis lire l'abscisse de points.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const major = d === 1 ? 5 : 10;
    const step = d === 1 ? 1 : d === 2 ? 0.1 : 0.01;
    const majorVal = roundTo(step * major, 6);
    const start = d === 1 ? rng.int(0, 4) * 5 : d === 2 ? rng.int(0, 8) : roundTo(rng.int(10, 60) / 10, 1);
    const ticks = 2 * major;
    const ats = distinct(rng, 3, () => {
      let i = 0;
      while (i % major === 0) i = rng.int(1, ticks - 1);
      return i;
    });
    const names = ["A", "B", "C"].slice(0, ats.length);
    const vals = ats.map((i) => roundTo(start + i * step, 6));
    const svg = graduatedLine({
      ticks, major,
      labels: [0, 1].map((k) => ({ at: k * major, text: fr(roundTo(start + k * majorVal, 6)) })),
      points: ats.map((at, i) => ({ at, name: names[i] })),
      title: "Demi-droite graduée",
    });
    return {
      statement: "Lire l'abscisse de chaque point marqué d'une croix.",
      figure: { kind: "svg", svg },
      parts: [trous([`Une petite graduation vaut [[0]]`, ...names.map((nm, i) => `$${nm}$ a pour abscisse [[${i + 1}]]`)], [num(step), ...vals.map(num)])],
      solution: [
        `Entre $${tex(start)}$ et $${tex(roundTo(start + majorVal, 6))}$ il y a ${major} intervalles : une graduation vaut $${tex(majorVal)} \\div ${major} = ${tex(step)}$.`,
        ...names.map((nm, i) => `$${nm}$ est à ${ats[i]} graduation(s) de $${tex(start)}$ : $${tex(start)} + ${ats[i]} \\times ${tex(step)} = ${tex(vals[i])}$.`),
      ],
    };
  },
};

// ───────────── 2. Droites parallèles et perpendiculaires ─────────────

export const m6DroitesProprietes: Generator = {
  meta: {
    id: "m6-droites-proprietes", title: "Parallèles et perpendiculaires – Vrai ou faux ?",
    subject: "maths", level: "6e", chapterId: "m6-droites", notionId: "m6-droites-proprietes",
    kinds: ["vrai-faux"], summary: "Appliquer les trois propriétés des droites parallèles et perpendiculaires.", randomized: "banque",
  },
  generate(rng) {
    const [a, b, c] = rng.shuffle(["d_1", "d_2", "d_3", "d", "\\Delta", "d'"]).slice(0, 3).map((s) => `(${s})`);
    const P = "/\\!/", T = "\\perp";
    const bank = [
      { s: `Si $${a} ${P} ${c}$ et $${b} ${P} ${c}$, alors $${a} ${P} ${b}$.`, v: true, w: "deux droites parallèles à une même troisième sont parallèles entre elles." },
      { s: `Si $${a} ${T} ${c}$ et $${b} ${T} ${c}$, alors $${a} ${P} ${b}$.`, v: true, w: "deux droites perpendiculaires à une même troisième sont parallèles entre elles." },
      { s: `Si $${a} ${T} ${c}$ et $${b} ${T} ${c}$, alors $${a} ${T} ${b}$.`, v: false, w: `elles sont parallèles, pas perpendiculaires.` },
      { s: `Si $${a} ${P} ${b}$ et $${c} ${T} ${a}$, alors $${c} ${T} ${b}$.`, v: true, w: "une droite perpendiculaire à l'une de deux parallèles est perpendiculaire à l'autre." },
      { s: `Si $${a} ${P} ${b}$ et $${c} ${T} ${a}$, alors $${c} ${P} ${b}$.`, v: false, w: `$${c}$ est perpendiculaire à $${b}$.` },
      { s: `Si $${a} ${P} ${c}$ et $${b} ${T} ${c}$, alors $${a} ${T} ${b}$.`, v: true, w: `$${b}$ est perpendiculaire à $${c}$, donc à sa parallèle $${a}$.` },
      { s: "Deux droites sécantes sont toujours perpendiculaires.", v: false, w: "elles sont perpendiculaires seulement si elles forment un angle droit." },
      { s: "Deux droites parallèles n'ont aucun point commun ou sont confondues.", v: true, w: "c'est la définition." },
    ];
    const pick = rng.shuffle(bank).slice(0, 4);
    return {
      statement: "Pour chaque affirmation, indiquer si elle est vraie ou fausse.",
      parts: [{ interaction: { kind: "vrai-faux", items: pick.map((p) => p.s), answer: pick.map((p) => p.v) } }],
      solution: pick.map((p, i) => `${i + 1}. ${p.v ? "Vrai" : "Faux"} : ${p.w}`),
      rappel: "Deux perpendiculaires à une même droite sont parallèles ; deux parallèles à une même droite sont parallèles ; une perpendiculaire à l'une de deux parallèles est perpendiculaire à l'autre.",
    };
  },
};

// ───────────── 3. Opérations ─────────────

export const m6OperationsDecimaux: Generator = {
  meta: {
    id: "m6-operations-decimaux", title: "Additionner, soustraire, multiplier des décimaux",
    subject: "maths", level: "6e", chapterId: "m6-calculs", notionId: "m6-calculs-poser",
    kinds: ["texte-trous"], summary: "Calculer des sommes, différences et produits de nombres décimaux (calcul posé).", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const dec = (lo: number, hi: number, k: number) => roundTo(rng.int(lo * 10 ** k, hi * 10 ** k) / 10 ** k, k);
    const a = dec(10, 99, 1), b = dec(1, 30, 2);
    const c = dec(20, 80, 2), e = dec(1, 19, 1);
    const f = d === 1 ? rng.int(12, 99) : dec(1, 20, 1), g = d === 1 ? rng.int(3, 9) : d === 2 ? rng.int(3, 9) : dec(1, 9, 2);
    const ops = [
      { q: `$${tex(a)} + ${tex(b)} =$`, v: roundTo(a + b, 4), s: `On aligne les virgules (en complétant si besoin par des zéros), puis on additionne rang par rang : $${tex(a)} + ${tex(b)} = ${tex(roundTo(a + b, 4))}$.` },
      { q: `$${tex(c)} - ${tex(e)} =$`, v: roundTo(c - e, 4), s: `On aligne les virgules (en complétant si besoin par des zéros), puis on soustrait rang par rang : $${tex(c)} - ${tex(e)} = ${tex(roundTo(c - e, 4))}$.` },
      { q: `$${tex(f)} \\times ${tex(g)} =$`, v: roundTo(f * g, 6), s: `On multiplie sans les virgules puis on place la virgule (autant de décimales qu'en tout dans les facteurs) : $${tex(f)} \\times ${tex(g)} = ${tex(roundTo(f * g, 6))}$.` },
    ];
    return {
      statement: "Effectuer les calculs (on peut les poser au brouillon).",
      parts: [trous(ops.map((o, i) => `${o.q} [[${i}]]`), ops.map((o) => num(o.v)))],
      solution: ops.map((o) => o.s),
      rappel: "Addition et soustraction : virgules alignées. Multiplication : le produit a autant de décimales que les deux facteurs réunis. Contrôler avec un ordre de grandeur.",
    };
  },
};

// ───────────── 4. Cercle, triangles ─────────────

export const m6RayonDiametre: Generator = {
  meta: {
    id: "m6-rayon-diametre", title: "Rayon et diamètre d'un cercle",
    subject: "maths", level: "6e", chapterId: "m6-cercle", notionId: "m6-cercle-vocabulaire",
    kinds: ["texte-trous"], summary: "Passer du rayon au diamètre et décider si un point est sur un cercle.", randomized: "valeurs", timeLimit: 150,
  },
  generate(rng, d) {
    const r = d === 1 ? rng.int(2, 15) : roundTo(rng.int(15, 95) / 10, 1);
    const D = d === 1 ? 2 * rng.int(2, 15) : roundTo(rng.int(15, 95) / 10, 1);
    const O = rng.pick(["O", "C", "I"]);
    const M = rng.pick(["M", "N", "P"]);
    const dist = rng.pick([roundTo(r, 2), roundTo(2 * r, 2), roundTo(r + 1, 2)]);
    const on = dist === r ? 0 : dist < r ? 1 : 2;
    return {
      statement: `$(\\mathcal{C})$ est un cercle de centre $${O}$ et de rayon $${tex(r)}$ cm ; $(\\mathcal{C}')$ est un cercle de diamètre $${tex(D)}$ cm.`,
      parts: [trous([
        `Le diamètre de $(\\mathcal{C})$ mesure [[0]] cm.`,
        `Le rayon de $(\\mathcal{C}')$ mesure [[1]] cm.`,
        `On sait que $${O}${M} = ${tex(dist)}$ cm. Le point $${M}$ est [[2]] du cercle $(\\mathcal{C})$.`,
      ], [num(2 * r), num(D / 2), { type: "select", options: ["sur le cercle", "à l'intérieur", "à l'extérieur"], answer: on }])],
      solution: [
        `Diamètre $= 2 \\times$ rayon $= 2 \\times ${tex(r)} = ${tex(roundTo(2 * r, 4))}$ cm.`,
        `Rayon $=$ diamètre $\\div 2 = ${tex(D)} \\div 2 = ${tex(roundTo(D / 2, 4))}$ cm.`,
        `$${O}${M} = ${tex(dist)}$ cm ${on === 0 ? "est égal au" : on === 1 ? "est inférieur au" : "est supérieur au"} rayon ($${tex(r)}$ cm) : $${M}$ est ${["sur le cercle", "à l'intérieur du cercle", "à l'extérieur du cercle"][on]}.`,
      ],
    };
  },
};

export const m6InegaliteTriangulaire: Generator = {
  meta: {
    id: "m6-inegalite-triangulaire", title: "Le triangle est-il constructible ?",
    subject: "maths", level: "6e", chapterId: "m6-cercle", notionId: "m6-cercle-triangle",
    kinds: ["vrai-faux"], summary: "Utiliser l'inégalité triangulaire pour savoir si un triangle existe.", randomized: "valeurs",
  },
  generate(rng, d) {
    const items: string[] = [], ans: boolean[] = [], sol: string[] = [];
    const kinds = rng.shuffle(["oui", "oui", "non", d === 1 ? "non" : "plat"] as const);
    kinds.forEach((k, i) => {
      const a = rng.int(2, 9), b = rng.int(2, 9);
      const c = k === "oui" ? rng.int(Math.abs(a - b) + 1, a + b - 1) : k === "plat" ? a + b : a + b + rng.int(1, 4);
      const sides = rng.shuffle([a, b, c]);
      const nm = rng.shuffle(LETTERS).slice(0, 3).join("");
      items.push(`On peut construire un triangle $${nm}$ (non aplati) dont les côtés mesurent $${sides.join("$ cm, $")}$ cm.`);
      ans.push(k === "oui");
      const m = Math.max(...sides), s = sides.reduce((x, y) => x + y, 0) - m, others = sides.filter((x, j) => j !== sides.indexOf(m));
      sol.push(`${i + 1}. ${k === "oui" ? "Vrai" : "Faux"} : le plus grand côté mesure $${m}$ et $${others.join(" + ")} = ${s}$ ; ${m < s ? `$${m} < ${s}$, le triangle est constructible.` : m === s ? `$${m} = ${s}$, les points sont alignés (triangle aplati).` : `$${m} > ${s}$, le triangle n'existe pas.`}`);
    });
    return {
      statement: "Pour chaque affirmation, indiquer si elle est vraie ou fausse.",
      parts: [{ interaction: { kind: "vrai-faux", items, answer: ans } }],
      solution: sol,
      rappel: "On compare la plus grande longueur à la somme des deux autres : le triangle existe si elle est strictement plus petite.",
    };
  },
};

// ───────────── 5. Fractions et partage ─────────────

export const m6FractionQuantite: Generator = {
  meta: {
    id: "m6-fraction-quantite", title: "Prendre une fraction d'une quantité",
    subject: "maths", level: "6e", chapterId: "m6-fractions", notionId: "m6-fractions-partage",
    kinds: ["texte-trous"], summary: "Calculer les trois quarts de 20 €, les deux cinquièmes d'une classe…", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const ctx = [
      (q: number) => ({ s: `de $${q}$ €`, u: "€" }),
      (q: number) => ({ s: `d'une classe de $${q}$ élèves`, u: "élèves" }),
      (q: number) => ({ s: `de $${q}$ km`, u: "km" }),
      (q: number) => ({ s: `de $${q}$ minutes`, u: "min" }),
    ];
    const lines: string[] = [], vals: number[] = [], sol: string[] = [];
    for (let i = 0; i < 3; i++) {
      const b = rng.pick(d === 1 ? [2, 3, 4, 5, 10] : [3, 4, 5, 6, 8, 10]);
      const a = rng.int(1, b - 1);
      const part = d === 3 ? rng.pick([1.5, 2.5, 3, 4, 7, 12]) : rng.int(2, 12);
      const q = roundTo(b * part, 4);
      const c = rng.pick(ctx)(q);
      lines.push(`$${df(a, b)}$ ${c.s} $=$ [[${i}]] ${c.u}`);
      vals.push(roundTo(a * part, 4));
      sol.push(`$${tex(q)} \\div ${b} = ${tex(part)}$ (une part), puis $${tex(part)} \\times ${a} = ${tex(roundTo(a * part, 4))}$.`);
    }
    return {
      statement: "Calculer.",
      parts: [trous(lines, vals.map(num))],
      solution: sol,
      rappel: "Prendre $\\dfrac{a}{b}$ d'une quantité : on la partage en $b$ parts égales (division par $b$), puis on prend $a$ parts (multiplication par $a$).",
    };
  },
};

// ───────────── 6. Angles ─────────────

export const m6NatureAngles: Generator = {
  meta: {
    id: "m6-nature-angles", title: "Aigu, droit, obtus ou plat ?",
    subject: "maths", level: "6e", chapterId: "m6-angles", notionId: "m6-angles-nature",
    kinds: ["classer"], summary: "Classer des angles selon leur mesure, et utiliser la bissectrice.", randomized: "valeurs",
  },
  generate(rng, d) {
    const vals = [rng.int(5, 85), rng.int(5, 85), 90, rng.int(91, 179), rng.int(91, 179), 180];
    if (d >= 2) vals.push(rng.pick([89, 91, 179]));
    if (d === 3) {
      const full = 2 * rng.int(46, 89); // bissectrice d'un angle obtus : moitié aiguë
      vals.push(-full);
    }
    const cat = (v: number) => (v < 90 ? 0 : v === 90 ? 1 : v < 180 ? 2 : 3);
    const names = ["Angle aigu", "Angle droit", "Angle obtus", "Angle plat"];
    const items = rng.shuffle(vals).map((v, i) => {
      const nm = `\\widehat{${LETTERS[i % LETTERS.length]}O${LETTERS[(i + 5) % LETTERS.length]}}`;
      if (v < 0) return { s: `$${nm}$ : la moitié d'un angle de $${-v}°$ (bissectrice)`, c: cat(-v / 2), w: `$${-v} \\div 2 = ${-v / 2}°$` };
      return { s: `$${nm} = ${v}°$`, c: cat(v), w: `$${v}°$` };
    });
    return {
      statement: "Classer chaque angle selon sa nature.",
      parts: [{ interaction: { kind: "classer", categories: names, items: items.map((i) => i.s), answer: items.map((i) => i.c) } }],
      solution: items.map((i) => `${i.s} : ${i.w}, ${names[i.c].toLowerCase()}.`),
      rappel: "Aigu : moins de 90° ; droit : 90° ; obtus : entre 90° et 180° ; plat : 180°.",
    };
  },
};

// ───────────── 7. Aires et périmètres ─────────────

export const m6PerimetreAire: Generator = {
  meta: {
    id: "m6-perimetre-aire", title: "Périmètre et aire de figures usuelles",
    subject: "maths", level: "6e", chapterId: "m6-aires", notionId: "m6-aires-aire",
    kinds: ["texte-trous"], summary: "Rectangle, carré, triangle rectangle, disque : calculer périmètre et aire.", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const L = rng.int(5, 15), l = rng.int(2, L - 1), c = rng.int(3, 12);
    const lines = [
      `Rectangle de longueur $${L}$ cm et de largeur $${l}$ cm : périmètre [[0]] cm, aire [[1]] cm².`,
      `Carré de côté $${c}$ cm : périmètre [[2]] cm, aire [[3]] cm².`,
    ];
    const blanks: Blank[] = [num(2 * (L + l)), num(L * l), num(4 * c), num(c * c)];
    const sol = [
      `Rectangle : $\\mathcal{P} = 2 \\times (${L} + ${l}) = ${2 * (L + l)}$ cm et $\\mathcal{A} = ${L} \\times ${l} = ${L * l}$ cm².`,
      `Carré : $\\mathcal{P} = 4 \\times ${c} = ${4 * c}$ cm et $\\mathcal{A} = ${c} \\times ${c} = ${c * c}$ cm².`,
    ];
    if (d >= 2) {
      const a = 2 * rng.int(2, 8), b = rng.int(3, 11);
      lines.push(`Triangle rectangle dont les côtés de l'angle droit mesurent $${a}$ cm et $${b}$ cm : aire [[4]] cm².`);
      blanks.push(num((a * b) / 2));
      sol.push(`Triangle rectangle : $\\mathcal{A} = \\dfrac{${a} \\times ${b}}{2} = ${(a * b) / 2}$ cm² (moitié du rectangle de côtés ${a} et ${b}).`);
    }
    if (d === 3) {
      const r = rng.int(2, 10);
      lines.push(`Disque de rayon $${r}$ cm (prendre $\\pi \\approx 3{,}14$) : périmètre [[5]] cm, aire [[6]] cm².`);
      blanks.push(num(roundTo(2 * 3.14 * r, 4)), num(roundTo(3.14 * r * r, 4)));
      sol.push(`Cercle : $\\mathcal{P} = 2 \\times 3{,}14 \\times ${r} = ${tex(roundTo(6.28 * r, 4))}$ cm ; disque : $\\mathcal{A} = 3{,}14 \\times ${r} \\times ${r} = ${tex(roundTo(3.14 * r * r, 4))}$ cm².`);
    }
    return {
      statement: "Compléter (les longueurs sont en cm).",
      parts: [trous(lines, blanks)],
      solution: sol,
      rappel: "Le périmètre est une longueur (cm), l'aire une surface (cm²). Rectangle : $\\mathcal{P} = 2(L + \\ell)$, $\\mathcal{A} = L \\times \\ell$.",
    };
  },
};

export const m6Conversions: Generator = {
  meta: {
    id: "m6-conversions", title: "Convertir des longueurs et des aires",
    subject: "maths", level: "6e", chapterId: "m6-aires", notionId: "m6-aires-conversions",
    kinds: ["texte-trous"], summary: "Conversions dans le tableau des unités de longueur (×10) et d'aire (×100).", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const U = ["km", "hm", "dam", "m", "dm", "cm", "mm"];
    const lines: string[] = [], vals: number[] = [], sol: string[] = [];
    const n = d === 1 ? 4 : 5;
    for (let i = 0; i < n; i++) {
      const aire = d >= 2 && i >= 3;
      const pool = aire ? [1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6];
      const [from, to] = rng.shuffle(pool).slice(0, 2);
      const gap = Math.abs(to - from);
      if (gap > (aire ? 2 : 3)) { i--; continue; }
      const x = roundTo(rng.int(5, 950) / (rng.pick([1, 10, 100]) as number), 2);
      const factor = (aire ? 100 : 10) ** (to - from);
      const v = roundTo(x * factor, 8);
      const sq = aire ? "²" : "";
      lines.push(`$${tex(x)}$ ${U[from]}${sq} $=$ [[${i}]] ${U[to]}${sq}`);
      vals.push(v);
      sol.push(`De ${U[from]}${sq} à ${U[to]}${sq} : ${gap} rang(s) vers ${to > from ? "la droite, on multiplie" : "la gauche, on divise"} par $${aire ? 100 : 10}^${gap} = ${tex((aire ? 100 : 10) ** gap)}$ : $${tex(v)}$ ${U[to]}${sq}.`);
    }
    return {
      statement: "Convertir dans l'unité demandée.",
      parts: [trous(lines, vals.map(num))],
      solution: sol,
      rappel: "Longueurs : chaque unité vaut 10 fois la suivante. Aires : chaque unité vaut 100 fois la suivante ($1$ m² $= 100$ dm²).",
    };
  },
};

// ───────────── 8. Division et durées ─────────────

export const m6DivisionEuclidienne: Generator = {
  meta: {
    id: "m6-division-euclidienne", title: "Division euclidienne",
    subject: "maths", level: "6e", chapterId: "m6-division", notionId: "m6-division-euclidienne",
    kinds: ["texte-trous"], summary: "Trouver quotient et reste, et résoudre un problème de partage.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const b = d === 1 ? rng.int(3, 9) : rng.int(6, d === 2 ? 15 : 35);
    const q = rng.int(d === 1 ? 4 : 12, d === 3 ? 250 : 60), r = rng.int(0, b - 1);
    const a = b * q + r;
    const nb = rng.int(5, 9), oeufs = nb * rng.int(9, 30) + rng.int(1, nb - 1);
    const boites = Math.floor(oeufs / nb), reste = oeufs % nb;
    return {
      statement: `Effectuer la division euclidienne de $${tex(a)}$ par $${b}$, puis résoudre le problème.`,
      parts: [
        trous([`$${tex(a)} = ${b} \\times$ [[0]] $+$ [[1]]`], [num(q), num(r)]),
        { prompt: `Un fermier range $${oeufs}$ œufs dans des boîtes de $${nb}$.`, ...trous([`Il remplit [[0]] boîtes complètes et il reste [[1]] œuf(s).`], [num(boites), num(reste)]) },
      ],
      solution: [
        `$${b} \\times ${q} = ${tex(b * q)}$ et $${tex(a)} - ${tex(b * q)} = ${r}$ ; le reste $${r}$ est bien inférieur à $${b}$ : $${tex(a)} = ${b} \\times ${q} + ${r}$.`,
        `$${oeufs} = ${nb} \\times ${boites} + ${reste}$ avec $${reste} < ${nb}$ : ${boites} boîtes pleines et ${reste} œuf(s) restant(s).`,
      ],
      rappel: "$a = b \\times q + r$ avec $0 \\leqslant r < b$ : $q$ est le quotient, $r$ le reste.",
    };
  },
};

export const m6Durees: Generator = {
  meta: {
    id: "m6-durees", title: "Calculer avec des durées",
    subject: "maths", level: "6e", chapterId: "m6-division", notionId: "m6-division-durees",
    kinds: ["texte-trous"], summary: "Convertir des durées, trouver une heure d'arrivée ou une durée.", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const min = rng.int(70, d === 1 ? 150 : 400);
    const h0 = rng.int(7, 15), m0 = rng.pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
    const dh = rng.int(0, 2), dm = rng.int(d === 1 ? 10 : 25, 55);
    const endT = h0 * 60 + m0 + dh * 60 + dm;
    const h1 = rng.int(8, 13), m1 = rng.pick([10, 25, 40, 50]), dur = rng.int(65, 200);
    const fin = h1 * 60 + m1 + dur;
    const lines = [
      `$${min}$ min $=$ [[0]] h [[1]] min`,
      `Un film commence à ${h0} h ${String(m0).padStart(2, "0")} et dure ${dh ? `${dh} h ` : ""}${dm} min : il se termine à [[2]] h [[3]] min.`,
    ];
    const blanks = [num(Math.floor(min / 60)), num(min % 60), num(Math.floor(endT / 60)), num(endT % 60)];
    const sol = [
      `$${min} = 60 \\times ${Math.floor(min / 60)} + ${min % 60}$ : ${Math.floor(min / 60)} h ${min % 60} min.`,
      `${h0} h ${m0} + ${dh} h ${dm} = ${h0 + dh} h ${m0 + dm} min${m0 + dm >= 60 ? ` ; or ${m0 + dm} min = 1 h ${m0 + dm - 60} min, donc ${Math.floor(endT / 60)} h ${endT % 60} min` : ""}.`,
    ];
    if (d >= 2) {
      lines.push(`Un train part à ${h1} h ${m1} et arrive à ${Math.floor(fin / 60)} h ${String(fin % 60).padStart(2, "0")} : le trajet dure [[4]] min.`);
      blanks.push(num(dur));
      sol.push(`De ${h1} h ${m1} à ${Math.floor(fin / 60)} h ${fin % 60} : $${Math.floor(fin / 60) * 60 + (fin % 60)} - ${h1 * 60 + m1} = ${dur}$ min (en convertissant les deux horaires en minutes).`);
    }
    return {
      statement: "Compléter.",
      parts: [trous(lines, blanks)],
      solution: sol,
      rappel: "$1$ h $= 60$ min : quand on dépasse 60 minutes, on les convertit en 1 heure.",
    };
  },
};

// ───────────── 9. Proportionnalité : pourcentages, échelles ─────────────

export const m6Pourcentages: Generator = {
  meta: {
    id: "m6-pourcentages-echelles", title: "Appliquer un pourcentage, utiliser une échelle",
    subject: "maths", level: "6e", chapterId: "m6-proportionnalite", notionId: "m6-proportionnalite-pourcentages",
    kinds: ["texte-trous"], summary: "Calculer 10 %, 25 %, 30 %… d'une quantité et convertir une distance sur un plan.", randomized: "valeurs", timeLimit: 200,
  },
  generate(rng, d) {
    const ps = d === 1 ? [10, 50, 25] : [10, 20, 25, 30, 40, 75];
    const lines: string[] = [], vals: number[] = [], sol: string[] = [];
    rng.shuffle(ps).slice(0, 3).forEach((p, i) => {
      const q = 20 * rng.int(1, d === 3 ? 30 : 10);
      lines.push(`$${p}\\,\\%$ de $${q}$ € $=$ [[${i}]] €`);
      vals.push(roundTo((p * q) / 100, 4));
      sol.push(`$${p}\\,\\%$ de $${q} = ${df(p, 100)} \\times ${q} = ${tex(roundTo((p * q) / 100, 4))}$ €.`);
    });
    const ech = rng.pick([1000, 10000, 25000, 50000, 100000]);
    const cm = rng.int(2, 12);
    const reel = cm * ech; // cm
    const enM = ech <= 10000;
    const v = enM ? reel / 100 : reel / 100000;
    lines.push(`Sur un plan à l'échelle $${df(1, tex(ech))}$, $${cm}$ cm représentent [[3]] ${enM ? "m" : "km"} dans la réalité.`);
    vals.push(roundTo(v, 4));
    sol.push(`$${cm} \\times ${tex(ech)} = ${tex(reel)}$ cm $= ${tex(roundTo(v, 4))}$ ${enM ? "m" : "km"}.`);
    return {
      statement: "Compléter.",
      parts: [trous(lines, vals.map(num))],
      solution: sol,
      rappel: "$p\\,\\%$ de $Q$ $= \\dfrac{p}{100} \\times Q$. À l'échelle $\\dfrac{1}{n}$, une longueur réelle est $n$ fois plus grande que sur le plan.",
    };
  },
};

// ───────────── 10. Triangles et quadrilatères ─────────────

export const m6Quadrilateres: Generator = {
  meta: {
    id: "m6-triangles-quadrilateres", title: "Reconnaître triangles et quadrilatères",
    subject: "maths", level: "6e", chapterId: "m6-quadrilateres", notionId: "m6-quadrilateres-quadri",
    kinds: ["associer"], summary: "Associer chaque description à la figure particulière correspondante.", randomized: "banque",
  },
  generate(rng, d) {
    const bank = d === 1
      ? [
          ["Triangle ayant deux côtés de même longueur", "triangle isocèle"],
          ["Triangle ayant trois côtés de même longueur", "triangle équilatéral"],
          ["Triangle ayant un angle droit", "triangle rectangle"],
          ["Quadrilatère ayant quatre angles droits", "rectangle"],
          ["Quadrilatère ayant quatre côtés de même longueur", "losange"],
        ]
      : [
          ["Quadrilatère dont les diagonales sont perpendiculaires et se coupent en leur milieu", "losange"],
          ["Quadrilatère dont les diagonales ont la même longueur et se coupent en leur milieu", "rectangle"],
          ["Quadrilatère ayant quatre angles droits et quatre côtés égaux", "carré"],
          ["Triangle dont les trois angles mesurent 60°", "triangle équilatéral"],
          ["Triangle ayant deux angles de même mesure", "triangle isocèle"],
          ["Triangle dont un côté est appelé hypoténuse", "triangle rectangle"],
        ];
    const pick = rng.shuffle(bank).slice(0, 4);
    const sh = shuffleWithIndex(rng, pick.map((p) => p[1]));
    return {
      statement: "Associer chaque description à la figure correspondante.",
      parts: [{ interaction: { kind: "associer", left: pick.map((p) => p[0]), right: sh.shuffled, answer: pick.map((_, i) => sh.indexOf(i)) } }],
      solution: pick.map((p) => `${p[0]} : **${p[1]}**.`),
      rappel: "Rectangle : 4 angles droits. Losange : 4 côtés égaux. Carré : les deux à la fois. Isocèle : 2 côtés égaux ; équilatéral : 3 côtés égaux.",
    };
  },
};

// ───────────── 11. Solides et volumes ─────────────

export const m6SolidesVolumes: Generator = {
  meta: {
    id: "m6-solides-volumes", title: "Solides : éléments et volume du pavé",
    subject: "maths", level: "6e", chapterId: "m6-solides", notionId: "m6-solides-volume",
    kinds: ["texte-trous"], summary: "Compter faces, arêtes, sommets et calculer le volume d'un pavé droit ou d'un cube.", randomized: "valeurs", timeLimit: 200,
  },
  generate(rng, d) {
    const solides = [
      { n: "un cube", f: 6, a: 12, s: 8 }, { n: "un pavé droit", f: 6, a: 12, s: 8 },
      { n: "un prisme droit à base triangulaire", f: 5, a: 9, s: 6 }, { n: "une pyramide à base carrée", f: 5, a: 8, s: 5 },
    ];
    const so = rng.pick(d === 1 ? solides.slice(0, 2) : solides);
    const L = rng.int(3, 12), l = rng.int(2, 8), h = rng.int(2, 10), c = rng.int(2, 9);
    const lines = [
      `${so.n[0].toUpperCase()}${so.n.slice(1)} a [[0]] faces, [[1]] arêtes et [[2]] sommets.`,
      `Le volume d'un pavé droit de dimensions $${L}$ cm, $${l}$ cm et $${h}$ cm est [[3]] cm³.`,
      `Le volume d'un cube d'arête $${c}$ cm est [[4]] cm³.`,
    ];
    const blanks = [num(so.f), num(so.a), num(so.s), num(L * l * h), num(c ** 3)];
    const sol = [
      `${so.n[0].toUpperCase()}${so.n.slice(1)} : ${so.f} faces, ${so.a} arêtes, ${so.s} sommets.`,
      `$\\mathcal{V} = L \\times \\ell \\times h = ${L} \\times ${l} \\times ${h} = ${L * l * h}$ cm³.`,
      `$\\mathcal{V} = c \\times c \\times c = ${c} \\times ${c} \\times ${c} = ${c ** 3}$ cm³.`,
    ];
    if (d === 3) {
      lines.push(`Ce pavé contient [[5]] L (rappel : $1$ L $= 1\\,000$ cm³).`);
      blanks.push(num((L * l * h) / 1000));
      sol.push(`$${L * l * h}$ cm³ $= ${tex((L * l * h) / 1000)}$ dm³ $= ${tex((L * l * h) / 1000)}$ L.`);
    }
    return { statement: "Compléter.", parts: [trous(lines, blanks)], solution: sol, rappel: "Pavé droit : $\\mathcal{V} = L \\times \\ell \\times h$ ; cube : $\\mathcal{V} = c^3$. $1$ dm³ $= 1$ L." };
  },
};

// ───────────── 12. Gestion de données ─────────────

export const m6LireDiagramme: Generator = {
  meta: {
    id: "m6-lire-diagramme", title: "Lire un diagramme en barres",
    subject: "maths", level: "6e", chapterId: "m6-donnees", notionId: "m6-donnees-lire",
    kinds: ["texte-trous"], summary: "Lire des effectifs sur un diagramme et les exploiter (total, écart, maximum).", randomized: "valeurs", timeLimit: 200,
  },
  generate(rng, d) {
    const ctx = rng.pick([
      { t: "Sport préféré des élèves de 6e", cats: ["Foot", "Basket", "Danse", "Judo", "Natation"], y: "élèves" },
      { t: "Livres empruntés au CDI", cats: ["Lun", "Mar", "Mer", "Jeu", "Ven"], y: "livres" },
      { t: "Fruits vendus (kg)", cats: ["Pommes", "Poires", "Kiwis", "Prunes", "Raisin"], y: "kg" },
    ]);
    const k = d === 1 ? 4 : 5;
    const cats = ctx.cats.slice(0, k);
    // Valeurs multiples de 5 et maximum >= 20 : chaque barre tombe sur une ligne de la grille (pas de 5).
    let vals: number[] = [];
    while (!vals.length || Math.max(...vals) < 20) vals = distinct(rng, k, () => 5 * rng.int(1, d === 1 ? 6 : 10));
    const iMax = vals.indexOf(Math.max(...vals));
    const [i, j] = rng.shuffle(cats.map((_, t) => t)).slice(0, 2);
    const total = vals.reduce((s, v) => s + v, 0);
    return {
      statement: `Le diagramme ci-dessous représente : **${ctx.t}**.`,
      figure: { kind: "svg", svg: barChart(cats, vals, ctx.t, ctx.y) },
      parts: [trous([
        `${cats[i]} : [[0]] ${ctx.y}`,
        `Écart entre ${cats[i]} et ${cats[j]} : [[1]] ${ctx.y}`,
        `Total : [[2]] ${ctx.y}`,
        `La catégorie la plus représentée est [[3]]`,
      ], [num(vals[i]), num(Math.abs(vals[i] - vals[j])), num(total), { type: "select", options: cats, answer: iMax }])],
      solution: [
        `On lit la hauteur de la barre « ${cats[i]} » : $${vals[i]}$.`,
        `« ${cats[j]} » : $${vals[j]}$ ; écart : $${Math.max(vals[i], vals[j])} - ${Math.min(vals[i], vals[j])} = ${Math.abs(vals[i] - vals[j])}$.`,
        `Total : $${vals.join(" + ")} = ${total}$.`,
        `La barre la plus haute est « ${cats[iMax]} » ($${vals[iMax]}$).`,
      ],
    };
  },
};

// ───────────── 13. Symétrie axiale ─────────────

export const m6SymetrieAxiale: Generator = {
  meta: {
    id: "m6-symetrie-axiale", title: "Symétrique d'un point sur quadrillage",
    subject: "maths", level: "6e", chapterId: "m6-symetrie", notionId: "m6-symetrie-construire",
    kinds: ["texte-trous"], summary: "Retrouver le symétrique de points par rapport à une droite sur un quadrillage.", randomized: "valeurs",
  },
  generate(rng, d) {
    const cols = 12, rows = 8;
    const dir = d === 1 ? "v" : rng.pick(["v", "h"] as const);
    const at = dir === "v" ? 6 : 4;
    const n = d === 1 ? 2 : 3;
    // Points sources (pas sur l'axe), leurs symétriques, plus des leurres.
    const src = distinct(rng, n, () => {
      const p = dir === "v" ? { x: rng.int(1, at - 1), y: rng.int(1, rows - 1) } : { x: rng.int(1, cols - 1), y: rng.int(1, at - 1) };
      return p;
    }, (p) => `${p.x},${p.y}`);
    const sym = (p: { x: number; y: number }) => (dir === "v" ? { x: 2 * at - p.x, y: p.y } : { x: p.x, y: 2 * at - p.y });
    const decoys = src.map((p) => (dir === "v" ? { x: sym(p).x, y: Math.min(rows - 1, Math.max(1, p.y + rng.pick([-1, 1]))) } : { x: Math.min(cols - 1, Math.max(1, p.x + rng.pick([-1, 1]))), y: sym(p).y }));
    const targets = [...src.map(sym), ...decoys].filter((p, k, arr) => arr.findIndex((q) => q.x === p.x && q.y === p.y) === k);
    const names = rng.shuffle(["E", "F", "G", "H", "K", "L", "M", "N"]).slice(0, targets.length);
    const order = rng.shuffle(targets.map((_, k) => k));
    const tNamed = order.map((k, idx) => ({ ...targets[k], name: names[idx] }));
    const srcNames = ["A", "B", "C"].slice(0, n);
    const options = tNamed.map((t) => t.name);
    const answer = src.map((p) => { const s = sym(p); return tNamed.findIndex((t) => t.x === s.x && t.y === s.y); });
    const svg = symmetryGrid({ cols, rows, axis: { dir, at }, points: [...src.map((p, k) => ({ ...p, name: srcNames[k] })), ...tNamed], title: "Quadrillage et axe (d)" });
    const extra = d === 3;
    const lines = srcNames.map((nm, k) => `Le symétrique de $${nm}$ par rapport à $(d)$ est le point [[${k}]]`);
    const blanks: Blank[] = answer.map((a) => ({ type: "select", options, answer: a }));
    if (extra) { lines.push(`Si $AB = 4{,}2$ cm, alors la longueur du segment symétrique de $[AB]$ est [[${n}]] cm.`); blanks.push(num(4.2)); }
    return {
      statement: "Sur le quadrillage, la droite $(d)$ est tracée en bleu.",
      figure: { kind: "svg", svg },
      parts: [trous(lines, blanks)],
      solution: [
        ...srcNames.map((nm, k) => {
          const p = src[k], dist = dir === "v" ? at - p.x : at - p.y;
          return `$${nm}$ est à ${dist} carreau(x) de $(d)$ ; son symétrique est à ${dist} carreau(x) de l'autre côté, sur la perpendiculaire à $(d)$ : c'est $${options[answer[k]]}$.`;
        }),
        ...(extra ? ["La symétrie axiale conserve les longueurs : le symétrique de $[AB]$ mesure aussi $4{,}2$ cm."] : []),
      ],
      rappel: "$A'$ est le symétrique de $A$ par rapport à $(d)$ si $(d)$ est la médiatrice de $[AA']$ : même distance à l'axe, de part et d'autre, sur une perpendiculaire à l'axe.",
    };
  },
};

export const m6AxesSymetrie: Generator = {
  meta: {
    id: "m6-axes-symetrie", title: "Combien d'axes de symétrie ?",
    subject: "maths", level: "6e", chapterId: "m6-symetrie", notionId: "m6-symetrie-axes",
    kinds: ["texte-trous"], summary: "Donner le nombre d'axes de symétrie des figures usuelles.", randomized: "banque",
  },
  generate(rng) {
    const bank: [string, number, string][] = [
      ["un rectangle (non carré)", 2, "les deux médiatrices de ses côtés"],
      ["un losange (non carré)", 2, "ses deux diagonales"],
      ["un carré", 4, "ses deux diagonales et les deux médiatrices de ses côtés"],
      ["un triangle isocèle (non équilatéral)", 1, "la médiatrice de sa base"],
      ["un triangle équilatéral", 3, "les médiatrices de ses trois côtés"],
      ["un segment", 2, "sa médiatrice et la droite qui le porte"],
      ["un parallélogramme quelconque", 0, "aucun pliage ne superpose les deux moitiés"],
    ];
    const pick = rng.shuffle(bank).slice(0, 4);
    return {
      statement: "Compléter avec le nombre d'axes de symétrie.",
      parts: [trous(pick.map((p, i) => `${p[0][0].toUpperCase()}${p[0].slice(1)} a [[${i}]] axe(s) de symétrie.`), pick.map((p) => num(p[1])))],
      solution: pick.map((p, i) => `${lettre(i)}) ${p[0]} : ${p[1]} — ${p[2]}.`),
    };
  },
};
