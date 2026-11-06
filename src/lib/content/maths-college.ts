// Générateurs originaux – Mathématiques, collège (6e → 3e).
import type { Generator, Rng } from "../engine/types";
import { fr, fracTex, gcd, roundTo, simplify, tex } from "../engine/numbers";
import { LETTERS, par, polyExpr, polyTex, rel, signed } from "../engine/fmt";
import { plot, triangle, urn } from "../engine/svg";
import { shuffleWithIndex } from "../engine/rng";

const nz = (rng: Rng, a: number, b: number) => {
  let v = 0;
  while (v === 0) v = rng.int(a, b);
  return v;
};
const df = (n: number | string, d: number | string) => `\\dfrac{${n}}{${d}}`;
const letters = (rng: Rng, k: number) => rng.shuffle(LETTERS).slice(0, k);

// ───────────────────────── 6e ─────────────────────────

export const m6ComparerFractions: Generator = {
  meta: {
    id: "m6-comparer-fractions",
    title: "Comparer des fractions",
    subject: "maths", level: "6e", chapterId: "m6-fractions", notionId: "m6-fractions-comparer",
    kinds: ["texte-trous"], summary: "Compléter avec <, = ou > en comparant deux fractions.", randomized: "valeurs", timeLimit: 150,
  },
  generate(rng, d) {
    const lines: string[] = [];
    const answers: number[] = [];
    const sol: string[] = [];
    const sym = ["<", "=", ">"];
    for (let k = 0; k < 4; k++) {
      let a: number, b: number, c: number, e: number, why: string;
      const variant = d === 3 ? rng.pick(["un", "egal", "multiple"] as const) : d === 2 ? "multiple" : "meme";
      if (variant === "meme") {
        b = rng.int(3, 12); e = b; a = rng.int(1, 2 * b);
        c = rng.next() < 0.15 ? a : rng.int(1, 2 * b);
        why = `Les dénominateurs sont égaux ($${b}$) : on compare les numérateurs $${a}$ et $${c}$.`;
      } else if (variant === "multiple") {
        b = rng.int(2, 6); const m = rng.int(2, 4); e = b * m; a = rng.int(1, 2 * b);
        c = rng.next() < 0.2 ? a * m : rng.int(1, 2 * e);
        why = `$${df(a, b)} = ${df(`${a} \\times ${m}`, `${b} \\times ${m}`)} = ${df(a * m, e)}$ ; on compare alors $${a * m}$ et $${c}$ (même dénominateur $${e}$).`;
        if (rng.next() < 0.5) { [a, b, c, e] = [c, e, a, b]; }
      } else if (variant === "un") {
        b = rng.int(2, 12); a = rng.int(1, 2 * b); c = 1; e = 1;
        why = a > b ? `$${a} > ${b}$ : le numérateur est plus grand que le dénominateur, donc $${df(a, b)} > 1$.` : a < b ? `$${a} < ${b}$ : le numérateur est plus petit que le dénominateur, donc $${df(a, b)} < 1$.` : `Numérateur et dénominateur égaux : $${df(a, b)} = 1$.`;
      } else {
        b = rng.int(2, 9); a = rng.int(1, 2 * b); const m = rng.int(2, 5); e = b * m;
        c = rng.next() < 0.6 ? a * m : a * m + rng.pick([-1, 1]);
        why = `On multiplie numérateur et dénominateur de $${df(a, b)}$ par $${m}$ : $${df(a, b)} = ${df(a * m, e)}$, à comparer avec $${df(c, e)}$.`;
      }
      const cmp = Math.sign(a * e - c * b) + 1;
      const right = e === 1 ? `${c}` : df(c, e);
      lines.push(`$${df(a, b)}$ [[${k}]] $${right}$`);
      answers.push(cmp);
      sol.push(`**${String.fromCharCode(97 + k)})** ${why} Donc $${df(a, b)} ${sym[cmp]} ${right}$.`);
    }
    return {
      statement: "Compléter chaque ligne avec le symbole qui convient : $<$, $=$ ou $>$.",
      parts: [{ interaction: { kind: "texte-trous", template: lines.join("\n"), blanks: answers.map((a) => ({ type: "select", options: ["<", "=", ">"], answer: a })) } }],
      solution: sol,
      rappel: "Si deux fractions ont le même dénominateur, la plus grande est celle qui a le plus grand numérateur. Sinon, on les écrit d'abord avec le même dénominateur.",
    };
  },
};

export const m6RangerDecimaux: Generator = {
  meta: {
    id: "m6-ranger-decimaux", title: "Ranger des nombres décimaux",
    subject: "maths", level: "6e", chapterId: "m6-nombres", notionId: "m6-nombres-comparer",
    kinds: ["ordonner"], summary: "Glisser les nombres pour les ranger dans l'ordre croissant.", randomized: "valeurs", timeLimit: 120,
  },
  generate(rng, d) {
    const n = d === 1 ? 4 : d === 2 ? 5 : 6;
    const base = rng.int(0, 15);
    const dg = rng.int(1, 9), dg2 = rng.int(1, 9);
    const patterns = d === 1 ? [[dg], [dg2], [dg, dg2], [dg2, dg], [0, dg]] : [[dg], [0, dg], [dg, 0, dg2], [dg, dg2], [0, dg, dg2], [dg2, dg], [dg, dg, 1], [0, 0, dg]];
    const vals = new Set<string>();
    let guard = 0;
    while (vals.size < n && guard++ < 200) {
      const p = rng.pick(patterns);
      const ip = d === 3 ? base + rng.int(-1, 1) : base;
      if (ip < 0) continue;
      const s = `${ip},${p.join("")}`.replace(/0+$/, "").replace(/,$/, "");
      vals.add(s);
    }
    const items = rng.shuffle([...vals]);
    const value = (s: string) => Number(s.replace(",", "."));
    const order = items.map((_, i) => i).sort((a, b) => value(items[a]) - value(items[b]));
    return {
      statement: "Ranger les nombres suivants dans l'**ordre croissant** (du plus petit au plus grand).",
      parts: [{ interaction: { kind: "ordonner", items: items.map((s) => `$${s.replace(",", "{,}")}$`), answer: order, hint: "Du plus petit (en haut) au plus grand (en bas)" } }],
      solution: [
        "On compare d'abord les parties entières, puis, à partie entière égale, les chiffres des dixièmes, puis des centièmes, etc.",
        "On peut compléter avec des zéros pour avoir le même nombre de décimales : " + items.map((s) => `$${s.replace(",", "{,}")}$`).join(", ") + ".",
        "Ordre croissant : $" + order.map((i) => items[i].replace(",", "{,}")).join(" < ") + "$.",
      ],
      rappel: "Attention : $3{,}17 < 3{,}7$ car $3{,}17 = 3{,}17$ et $3{,}7 = 3{,}70$ ; on compare 17 centièmes et 70 centièmes.",
    };
  },
};

export const m6TableauProportionnalite: Generator = {
  meta: {
    id: "m6-tableau-proportionnalite", title: "Compléter un tableau de proportionnalité",
    subject: "maths", level: "6e", chapterId: "m6-proportionnalite", notionId: "m6-proportionnalite-tableau",
    kinds: ["tableau"], summary: "Trouver le coefficient de proportionnalité et compléter le tableau.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const ctx = rng.pick([
      { r1: "Masse de pommes (kg)", r2: "Prix (€)", ks: d === 1 ? [2, 3, 4] : [1.5, 2.5, 3.2, 1.8], unitK: "€ par kg", dec: true },
      { r1: "Nombre de cahiers", r2: "Prix (€)", ks: d === 1 ? [2, 3, 5] : [1.5, 2.4, 0.8, 1.2], unitK: "€ par cahier", dec: false },
      { r1: "Durée (h)", r2: "Distance (km)", ks: d === 1 ? [4, 5, 60] : [4.5, 15, 80, 12], unitK: "km par heure", dec: true },
    ]);
    const k = rng.pick(ctx.ks);
    const pool = ctx.dec && d === 3 ? [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    const xs = rng.shuffle(pool).slice(0, 4).sort((a, b) => a - b);
    const ys = xs.map((x) => roundTo(x * k, 4));
    const givenY = rng.int(0, 3);
    const missing1 = d === 3 ? [(givenY + 1 + rng.int(0, 2)) % 4] : [];
    const missing2 = [0, 1, 2, 3].filter((i) => i !== givenY && !missing1.includes(i));
    const cell = (v: number, miss: boolean) => (miss ? { answer: { value: v } } : `$${tex(v)}$`);
    const sol = [
      `Le tableau est un tableau de proportionnalité. On calcule le coefficient à partir de la colonne complète : $${tex(ys[givenY])} \\div ${tex(xs[givenY])} = ${tex(k)}$ (${ctx.unitK}).`,
      ...missing2.map((i) => `$${tex(xs[i])} \\times ${tex(k)} = ${tex(ys[i])}$`),
      ...missing1.map((i) => `Pour la première ligne, on divise : $${tex(ys[i])} \\div ${tex(k)} = ${tex(xs[i])}$`),
    ];
    return {
      statement: `Le tableau ci-dessous est un tableau de proportionnalité. Le compléter.`,
      parts: [{ interaction: { kind: "tableau", headers: [], rows: [
        { label: ctx.r1, cells: xs.map((x, i) => cell(x, missing1.includes(i))) },
        { label: ctx.r2, cells: ys.map((y, i) => cell(y, missing2.includes(i))) },
      ] } }],
      solution: sol,
      rappel: "Dans un tableau de proportionnalité, on passe d'une ligne à l'autre en multipliant toujours par le même nombre : le coefficient de proportionnalité.",
    };
  },
};

export const m6ClasserNombres: Generator = {
  meta: {
    id: "m6-classer-nombres", title: "Entier, décimal ou non décimal ?",
    subject: "maths", level: "6e", chapterId: "m6-fractions", notionId: "m6-fractions-ecritures",
    kinds: ["classer"], summary: "Classer des nombres écrits sous différentes formes.", randomized: "valeurs",
  },
  generate(rng) {
    const cat = (n: number, dd: number) => {
      const [, s] = simplify(n, dd);
      if (s === 1) return 0;
      let t = s;
      while (t % 2 === 0) t /= 2;
      while (t % 5 === 0) t /= 5;
      return t === 1 ? 1 : 2;
    };
    const items: { s: string; c: number; why: string }[] = [];
    const k = rng.int(2, 6), q = rng.int(2, 9);
    items.push({ s: `$${df(k * q, k)}$`, c: 0, why: `$${df(k * q, k)} = ${q}$` });
    items.push({ s: `$${rng.int(2, 99)}$`, c: 0, why: "nombre entier" });
    const dval = rng.int(101, 999) / 100;
    items.push({ s: `$${tex(dval)}$`, c: Number.isInteger(dval) ? 0 : 1, why: "écriture décimale" });
    const dd = rng.pick([2, 4, 5, 20]);
    let nn = rng.int(1, 3 * dd);
    while (cat(nn, dd) !== 1) nn++;
    items.push({ s: `$${df(nn, dd)}$`, c: 1, why: `$${df(nn, dd)} = ${tex(nn / dd)}$` });
    for (let i = 0; i < 2; i++) {
      const den = rng.pick([3, 6, 7, 9, 11, 12]);
      let num = rng.int(1, 2 * den);
      while (cat(num, den) !== 2) num++;
      if (items.some((it) => it.s === `$${df(num, den)}$`)) num += den;
      items.push({ s: `$${df(num, den)}$`, c: 2, why: `la division de ${num} par ${den} ne s'arrête jamais` });
    }
    const sh = rng.shuffle(items);
    return {
      statement: "Classer chaque nombre dans la bonne catégorie.",
      parts: [{ interaction: { kind: "classer", categories: ["Nombre entier", "Nombre décimal non entier", "Nombre non décimal"], items: sh.map((i) => i.s), answer: sh.map((i) => i.c) } }],
      solution: sh.map((i) => `${i.s} : ${["entier", "décimal non entier", "non décimal"][i.c]} (${i.why}).`),
      rappel: "Un nombre décimal peut s'écrire avec un nombre fini de chiffres après la virgule. $\\dfrac{1}{3} = 0{,}333\\ldots$ n'est pas décimal.",
    };
  },
};

export const m6VraiFauxDivisibilite: Generator = {
  meta: {
    id: "m6-divisibilite", title: "Critères de divisibilité – Vrai ou faux ?",
    subject: "maths", level: "6e", chapterId: "m6-division", notionId: "m6-calculs-divisibilite",
    kinds: ["vrai-faux"], summary: "Utiliser les critères de divisibilité par 2, 3, 4, 5, 9 et 10.", randomized: "valeurs", timeLimit: 120,
  },
  generate(rng, d) {
    const divs = d === 1 ? [2, 5, 10] : d === 2 ? [2, 3, 5, 9, 10] : [3, 4, 9, 4, 3];
    const crit: Record<number, string> = {
      2: "son chiffre des unités est pair", 3: "la somme de ses chiffres est divisible par 3", 4: "le nombre formé par ses deux derniers chiffres est divisible par 4",
      5: "son chiffre des unités est 0 ou 5", 9: "la somme de ses chiffres est divisible par 9", 10: "son chiffre des unités est 0",
    };
    const items: string[] = [], ans: boolean[] = [], sol: string[] = [];
    for (let i = 0; i < 4; i++) {
      const k = rng.pick(divs);
      const want = rng.next() < 0.5;
      let N = rng.int(100, d === 3 ? 9999 : 999);
      while ((N % k === 0) !== want) N++;
      const sum = String(N).split("").reduce((s, c) => s + Number(c), 0);
      items.push(`$${tex(N)}$ est divisible par $${k}$.`);
      ans.push(want);
      const detail = k === 3 || k === 9 ? ` (somme des chiffres : ${sum})` : k === 4 ? ` (deux derniers chiffres : ${String(N).slice(-2)})` : ` (chiffre des unités : ${N % 10})`;
      sol.push(`${i + 1}. ${want ? "Vrai" : "Faux"} : un nombre est divisible par ${k} si ${crit[k]}${detail}.`);
    }
    return { statement: "Pour chaque affirmation, indiquer si elle est vraie ou fausse.", parts: [{ interaction: { kind: "vrai-faux", items, answer: ans } }], solution: sol };
  },
};

export const m6AssocierEcritures: Generator = {
  meta: {
    id: "m6-associer-ecritures", title: "Associer fractions et écritures décimales",
    subject: "maths", level: "6e", chapterId: "m6-fractions", notionId: "m6-fractions-ecritures",
    kinds: ["associer"], summary: "Relier chaque fraction à son écriture décimale ou à un pourcentage.", randomized: "valeurs",
  },
  generate(rng, d) {
    const dens = d === 1 ? [10, 100] : [2, 4, 5, 10, 20, 25];
    const pairs: [number, number][] = [];
    const seen = new Set<number>();
    while (pairs.length < 4) {
      const den = rng.pick(dens);
      const num = rng.int(1, den === 100 ? 99 : 2 * den - 1);
      const v = num / den;
      if (seen.has(v) || Number.isInteger(v)) continue;
      seen.add(v);
      pairs.push([num, den]);
    }
    const right = pairs.map(([n, dd]) => (d === 3 ? `$${tex(roundTo((100 * n) / dd, 4))}\\,\\%$` : `$${tex(n / dd)}$`));
    const sh = shuffleWithIndex(rng, right);
    return {
      statement: d === 3 ? "Associer chaque fraction au pourcentage égal." : "Associer chaque fraction à son écriture décimale.",
      parts: [{ interaction: { kind: "associer", left: pairs.map(([n, dd]) => `$${df(n, dd)}$`), right: sh.shuffled, answer: pairs.map((_, i) => sh.indexOf(i)) } }],
      solution: pairs.map(([n, dd], i) => `$${df(n, dd)} = ${tex(n)} \\div ${dd} = ${tex(n / dd)}$${d === 3 ? ` soit ${right[i]}` : ""}`),
      rappel: "$\\dfrac{a}{b}$ est le quotient de $a$ par $b$ : on obtient l'écriture décimale en effectuant la division. Un pourcentage $p\\,\\%$ est la fraction $\\dfrac{p}{100}$.",
    };
  },
};

export const m6VocabulaireOperations: Generator = {
  meta: {
    id: "m6-vocabulaire", title: "Vocabulaire des opérations",
    subject: "maths", level: "6e", chapterId: "m6-calculs", notionId: "m6-calculs-vocabulaire",
    kinds: ["glisser-deposer"], summary: "Glisser les bonnes étiquettes : somme, différence, produit, quotient…", randomized: "valeurs",
  },
  generate(rng, d) {
    const a = rng.int(12, 60), b = rng.int(2, 11);
    const tokens = ["somme", "différence", "produit", "quotient", "terme", "facteur"];
    const zonesAll = [
      { z: `$${a} + ${b}$ est une …`, t: 0 },
      { z: `$${a} - ${b}$ est une …`, t: 1 },
      { z: `$${a} \\times ${b}$ est un …`, t: 2 },
      { z: `$${a} \\div ${b}$ est un …`, t: 3 },
      { z: `Dans $${a} + ${b}$, le nombre $${b}$ est un …`, t: 4 },
      { z: `Dans $${a} \\times ${b}$, le nombre $${a}$ est un …`, t: 5 },
    ];
    const zones = rng.shuffle(d === 1 ? zonesAll.slice(0, 4) : zonesAll);
    const sh = shuffleWithIndex(rng, tokens);
    return {
      statement: "Glisser chaque étiquette dans la bonne case.",
      parts: [{ interaction: { kind: "glisser-deposer", zones: zones.map((z) => z.z), tokens: sh.shuffled, answer: zones.map((z) => sh.indexOf(z.t)) } }],
      solution: [
        "Le résultat d'une addition est une **somme** ; les nombres additionnés sont des **termes**.",
        "Le résultat d'une soustraction est une **différence**.",
        "Le résultat d'une multiplication est un **produit** ; les nombres multipliés sont des **facteurs**.",
        "Le résultat d'une division est un **quotient**.",
      ],
    };
  },
};

export const m6CalculMental: Generator = {
  meta: {
    id: "m6-calcul-mental", title: "Défi calcul mental (chronométré)",
    subject: "maths", level: "6e", chapterId: "m6-calculs", notionId: "m6-calculs-mental",
    kinds: ["texte-trous"], summary: "Six calculs rapides avec des décimaux, en temps limité.", randomized: "valeurs", timeLimit: 90,
  },
  generate(rng, d) {
    const qs: { q: string; v: number; s: string }[] = [];
    const x = rng.int(12, 999) / (d === 1 ? 1 : 10);
    const p = rng.pick([10, 100, 1000]);
    qs.push({ q: `$${tex(x)} \\times ${p} =$`, v: x * p, s: `Multiplier par ${p} : la virgule se décale de ${String(p).length - 1} rang(s) vers la droite.` });
    const y = rng.int(12, 999);
    const p2 = rng.pick([10, 100]);
    qs.push({ q: `$${y} \\div ${p2} =$`, v: y / p2, s: `Diviser par ${p2} : la virgule se décale vers la gauche.` });
    const t1 = rng.int(3, 9), t2 = rng.int(6, 9);
    qs.push({ q: `$${t1} \\times ${t2} =$`, v: t1 * t2, s: "Table de multiplication." });
    const u = rng.int(11, 89) / 10, w = rng.int(11, 89) / 10;
    qs.push({ q: `$${tex(u)} + ${tex(w)} =$`, v: roundTo(u + w, 2), s: "On additionne les unités puis les dixièmes." });
    const z = rng.int(20, 90);
    qs.push({ q: `$${z} \\times 0{,}1 =$`, v: z / 10, s: "Multiplier par $0{,}1$ revient à diviser par 10." });
    const h = rng.pick([12, 16, 24, 30, 48, 50, 64, 90]);
    qs.push({ q: `La moitié de $${h}$ est`, v: h / 2, s: `$${h} \\div 2 = ${h / 2}$` });
    return {
      statement: "Calculer mentalement le plus vite possible.",
      parts: [{ interaction: { kind: "texte-trous", template: qs.map((q, i) => `${q.q} [[${i}]]`).join("\n"), blanks: qs.map((q) => ({ type: "number", answer: { value: roundTo(q.v, 6) } })) } }],
      solution: qs.map((q) => `${q.q} $${tex(q.v)}$ — ${q.s}`),
    };
  },
};

// ───────────────────────── 5e ─────────────────────────

export const m5Relatifs: Generator = {
  meta: {
    id: "m5-relatifs-additions", title: "Additionner et soustraire des relatifs",
    subject: "maths", level: "5e", chapterId: "m5-relatifs", notionId: "m5-relatifs-somme",
    kinds: ["texte-trous"], summary: "Calculer des sommes et des différences de nombres relatifs.", randomized: "valeurs", timeLimit: 120,
  },
  generate(rng, d) {
    const lines: string[] = [], vals: number[] = [], sol: string[] = [];
    for (let i = 0; i < 4; i++) {
      const R = d === 3 ? 20 : 12;
      const a = nz(rng, -R, R), b = nz(rng, -R, R);
      if (d === 1 || (d === 2 && i < 2)) {
        lines.push(`$${rel(a)} + ${rel(b)} =$ [[${i}]]`);
        vals.push(a + b);
        sol.push(`$${rel(a)} + ${rel(b)} = ${tex(a + b)}$ : ${Math.sign(a) === Math.sign(b) ? "même signe, on additionne les distances à zéro et on garde le signe" : "signes contraires, on soustrait les distances à zéro et on prend le signe du nombre le plus éloigné de zéro"}.`);
      } else if (d === 2) {
        lines.push(`$${rel(a)} - ${rel(b)} =$ [[${i}]]`);
        vals.push(a - b);
        sol.push(`Soustraire un nombre, c'est ajouter son opposé : $${rel(a)} - ${rel(b)} = ${rel(a)} + ${rel(-b)} = ${tex(a - b)}$.`);
      } else {
        const c = nz(rng, -R, R);
        lines.push(`$${rel(a)} - ${rel(b)} + ${rel(c)} =$ [[${i}]]`);
        vals.push(a - b + c);
        sol.push(`$${rel(a)} - ${rel(b)} + ${rel(c)} = ${rel(a)} + ${rel(-b)} + ${rel(c)} = ${tex(a - b + c)}$.`);
      }
    }
    return {
      statement: "Effectuer les calculs suivants.",
      parts: [{ interaction: { kind: "texte-trous", template: lines.join("\n"), blanks: vals.map((v) => ({ type: "number", answer: { value: v } })) } }],
      solution: sol,
      rappel: "Pour soustraire un nombre relatif, on ajoute son opposé : $a - b = a + (-b)$.",
    };
  },
};

export const m5Priorites: Generator = {
  meta: {
    id: "m5-priorites-etapes", title: "Priorités opératoires – calcul détaillé",
    subject: "maths", level: "5e", chapterId: "m5-relatifs", notionId: "m5-relatifs-priorites",
    kinds: ["etapes"], summary: "Effectuer un calcul étape par étape en respectant les priorités.", randomized: "valeurs",
  },
  generate(rng, d) {
    const R = d === 1 ? 9 : 12;
    const pos = d === 1;
    const g = () => (pos ? rng.int(2, R) : nz(rng, -R, R));
    const a = g(), b = g(), c = g(), e = g();
    const s1 = c - e, s2 = b * s1, s3 = a + s2;
    const A = `A = ${par(a)} + ${par(b)} \\times (${par(c)} - ${par(e)})`;
    return {
      statement: `On considère l'expression $${A}$.\nCalculer $A$ en détaillant les étapes.`,
      parts: [{ interaction: { kind: "etapes", steps: [
        { prompt: `Étape 1 – les parenthèses : $${par(c)} - ${par(e)} =$`, answer: { value: s1 } },
        { prompt: `Étape 2 – la multiplication : $${par(b)} \\times ${par(s1)} =$`, answer: { value: s2 } },
        { prompt: `Étape 3 – l'addition : $${par(a)} + ${par(s2)} = A =$`, answer: { value: s3 } },
      ] } }],
      solution: [
        "On calcule d'abord ce qui est entre parenthèses, puis les multiplications et divisions, enfin les additions et soustractions.",
        `$${A}$`, `$A = ${par(a)} + ${par(b)} \\times ${par(s1)}$`, `$A = ${par(a)} + ${par(s2)}$`, `$A = ${tex(s3)}$`,
      ],
    };
  },
};

export const m5Reduire: Generator = {
  meta: {
    id: "m5-reduire-expression", title: "Réduire une expression littérale",
    subject: "maths", level: "5e", chapterId: "m5-calcul-litteral", notionId: "m5-litteral-reduire",
    kinds: ["expression"], summary: "Regrouper les termes semblables. Correction symbolique (expressions équivalentes acceptées si réduites).", randomized: "valeurs",
  },
  generate(rng, d) {
    const terms: { c: number; p: number }[] = [
      { c: nz(rng, -9, 9), p: 1 }, { c: nz(rng, -12, 12), p: 0 }, { c: nz(rng, -9, 9), p: 1 },
    ];
    if (d >= 2) terms.push({ c: nz(rng, -12, 12), p: 0 });
    if (d === 3) terms.push({ c: nz(rng, -6, 6), p: 2 }, { c: nz(rng, -6, 6), p: 2 });
    const sh = rng.shuffle(terms);
    const coefs = [0, 0, 0];
    sh.forEach((t) => (coefs[t.p] += t.c));
    const mono = (t: { c: number; p: number }, first: boolean) => {
      const abs = Math.abs(t.c);
      const body = (t.p === 0 ? `${abs}` : abs === 1 ? "" : `${abs}`) + (t.p === 1 ? "x" : t.p === 2 ? "x^2" : "");
      return first ? (t.c < 0 ? "-" : "") + body : ` ${t.c < 0 ? "-" : "+"} ${body}`;
    };
    const E = sh.map((t, i) => mono(t, i === 0)).join("");
    const deg = d === 3 ? 3 : 2;
    return {
      statement: `Réduire l'expression $A = ${E}$.`,
      parts: [{ interaction: { kind: "expression", label: "A =", variable: "x", answer: polyExpr(coefs.slice(0, deg)), form: "reduite", display: polyTex(coefs.slice(0, deg)) } }],
      solution: [
        "On regroupe les termes de même nature" + (d === 3 ? " (termes en $x^2$, termes en $x$, constantes)" : " (termes en $x$, constantes)") + " :",
        ...(d === 3 ? [`Termes en $x^2$ : $${sh.filter((t) => t.p === 2).map((t) => par(t.c)).join(" + ")} = ${coefs[2]}$`] : []),
        `Termes en $x$ : $${sh.filter((t) => t.p === 1).map((t) => par(t.c)).join(" + ")} = ${coefs[1]}$`,
        `Constantes : $${sh.filter((t) => t.p === 0).map((t) => par(t.c)).join(" + ")} = ${coefs[0]}$`,
        `Donc $A = ${polyTex(coefs.slice(0, deg))}$.`,
      ],
      rappel: "Réduire, c'est regrouper les termes semblables : $3x + 5x = (3+5)x = 8x$. On ne peut pas additionner un terme en $x$ et une constante.",
    };
  },
};

export const m5PlacerPoints: Generator = {
  meta: {
    id: "m5-placer-points", title: "Placer des points dans un repère",
    subject: "maths", level: "5e", chapterId: "m5-geometrie", notionId: "m5-geometrie-reperage",
    kinds: ["repere"], summary: "Cliquer dans le repère pour placer des points donnés par leurs coordonnées.", randomized: "valeurs",
  },
  generate(rng, d) {
    const step = d === 3 ? 0.5 : 1;
    const names = letters(rng, 3);
    const pts: [number, number][] = [];
    let guard = 0;
    while (pts.length < 3 && guard++ < 500) {
      const g = () => (d === 1 ? rng.int(0, 5) : d === 2 ? rng.int(-5, 5) : rng.int(-10, 10) / 2);
      const x = g(), y = g();
      if (pts.some((p) => p[0] === x && p[1] === y)) continue;
      if (d > 1 && pts.length === 0 && x >= 0 && y >= 0) continue; // au moins un point hors du 1er quadrant
      pts.push([x, y]);
    }
    const coord = (p: [number, number]) => `(${tex(p[0])}\\,;\\,${tex(p[1])})`;
    return {
      statement: `Placer les points ${pts.map((p, i) => `$${names[i]}${coord(p)}$`).join(", ")} dans le repère.\nCliquer sur le point à placer puis dans le repère (cliquer à nouveau pour déplacer).`,
      parts: [{ interaction: { kind: "repere", xmin: -5, xmax: 5, ymin: -5, ymax: 5, step, points: pts.map((p, i) => ({ label: names[i], answer: p })) } }],
      solution: pts.map((p, i) => `$${names[i]}${coord(p)}$ : on part de l'origine, on se déplace de $${tex(p[0])}$ sur l'axe des abscisses (horizontal), puis de $${tex(p[1])}$ parallèlement à l'axe des ordonnées (vertical).`),
      rappel: "Un point est repéré par son abscisse (lue sur l'axe horizontal) puis son ordonnée (lue sur l'axe vertical) : $A(\\text{abscisse}\\,;\\,\\text{ordonnée})$.",
    };
  },
};

// ───────────────────────── 4e ─────────────────────────

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

export const m4Pythagore: Generator = {
  meta: {
    id: "m4-pythagore-longueur", title: "Calculer une longueur avec Pythagore",
    subject: "maths", level: "4e", chapterId: "m4-pythagore", notionId: "m4-pythagore-calcul",
    kinds: ["numerique"], summary: "Calculer l'hypoténuse ou un côté de l'angle droit (figure générée).", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const [A, B, C] = letters(rng, 3);
    let a: number, b: number, h: number;
    if (d < 3) { const t = rng.pick(TRIPLES); [a, b, h] = rng.next() < 0.5 ? [t[0], t[1], t[2]] : [t[1], t[0], t[2]]; }
    else { a = rng.int(21, 90) / 10; b = rng.int(21, 90) / 10; h = Math.hypot(a, b); }
    const findHyp = d === 1 || (d === 3 && rng.next() < 0.5);
    // AB = b (vertical), BC = a (horizontal), AC = h ; angle droit en B
    let ans: number, sol: string[];
    const hRounded = d === 3 ? roundTo(h, 1) : h;
    if (findHyp) {
      ans = d === 3 ? roundTo(h, 1) : h;
      sol = [
        `Le triangle $${A}${B}${C}$ est rectangle en $${B}$ ; son hypoténuse est $[${A}${C}]$.`,
        `D'après le théorème de Pythagore : $${A}${C}^2 = ${A}${B}^2 + ${B}${C}^2$`,
        `$${A}${C}^2 = ${tex(b)}^2 + ${tex(a)}^2 = ${tex(b * b)} + ${tex(a * a)} = ${tex(roundTo(a * a + b * b, 4))}$`,
        `$${A}${C} = \\sqrt{${tex(roundTo(a * a + b * b, 4))}} ${d === 3 ? "\\approx" : "="} ${tex(ans)}$ cm${d === 3 ? " (arrondi au dixième)" : ""}.`,
      ];
    } else {
      const hh = d === 3 ? hRounded : h;
      const missing = Math.sqrt(hh * hh - b * b);
      ans = d === 3 ? roundTo(missing, 1) : missing;
      a = d === 3 ? missing : a;
      sol = [
        `Le triangle $${A}${B}${C}$ est rectangle en $${B}$ ; son hypoténuse est $[${A}${C}]$.`,
        `D'après le théorème de Pythagore : $${A}${C}^2 = ${A}${B}^2 + ${B}${C}^2$, donc $${B}${C}^2 = ${A}${C}^2 - ${A}${B}^2$.`,
        `$${B}${C}^2 = ${tex(hh)}^2 - ${tex(b)}^2 = ${tex(roundTo(hh * hh, 4))} - ${tex(roundTo(b * b, 4))} = ${tex(roundTo(hh * hh - b * b, 4))}$`,
        `$${B}${C} = \\sqrt{${tex(roundTo(hh * hh - b * b, 4))}} ${d === 3 ? "\\approx" : "="} ${tex(ans)}$ cm${d === 3 ? " (arrondi au dixième)" : ""}.`,
      ];
      h = hh;
    }
    const lab = (v: number) => `${fr(v)} cm`;
    const fig = triangle({
      pts: [[0, b], [0, 0], [a, 0]], names: [A, B, C], rightAngleAt: 1,
      sideLabels: [lab(b), findHyp ? lab(a) : "?", findHyp ? "?" : lab(h)],
      title: `Triangle ${A}${B}${C} rectangle en ${B}`,
    });
    const given = findHyp ? `$${A}${B} = ${tex(b)}$ cm et $${B}${C} = ${tex(a)}$ cm` : `$${A}${B} = ${tex(b)}$ cm et $${A}${C} = ${tex(h)}$ cm`;
    return {
      statement: `Le triangle $${A}${B}${C}$ est rectangle en $${B}$, avec ${given}.\nCalculer la longueur $${findHyp ? A + C : B + C}$${d === 3 ? ", arrondie au dixième" : ""}.`,
      figure: { kind: "svg", svg: fig, caption: "La figure n'est pas en vraie grandeur." },
      parts: [{ interaction: { kind: "numerique", label: `$${findHyp ? A + C : B + C} =$`, suffix: "cm", answer: { value: ans, tol: d === 3 ? 0.05 : 0, roundingLabel: "au dixième", decimals: d === 3 ? 1 : undefined } } }],
      solution: sol,
      rappel: "Théorème de Pythagore : si un triangle est rectangle, alors le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
    };
  },
};

export const m4Equations: Generator = {
  meta: {
    id: "m4-equation-premier-degre", title: "Résoudre une équation du premier degré",
    subject: "maths", level: "4e", chapterId: "m4-equations", notionId: "m4-equations-resoudre",
    kinds: ["numerique"], summary: "Solution exacte attendue (entier, décimal ou fraction irréductible).", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    let a: number, b: number, c: number, e: number;
    if (d === 1) { a = nz(rng, -6, 9); const x = rng.int(-9, 9); b = rng.int(-12, 12); c = 0; e = a * x + b; }
    else if (d === 2) { a = nz(rng, -9, 9); c = nz(rng, -9, 9); while (c === a) c = nz(rng, -9, 9); const x = rng.int(-9, 9); b = rng.int(-15, 15); e = (a - c) * x + b; }
    else { a = nz(rng, -9, 9); c = nz(rng, -9, 9); while (c === a || Math.abs(a - c) === 1) c = nz(rng, -9, 9); b = rng.int(-15, 15); e = rng.int(-15, 15); while ((e - b) % (a - c) === 0) e++; }
    const num = e - b, den = a - c;
    const [sn, sd] = simplify(num, den);
    const eq = `${polyTex([b, a])} = ${polyTex([e, c])}`;
    const sol = [
      `$${eq}$`,
      ...(c !== 0 ? [`On soustrait $${polyTex([0, c])}$ aux deux membres : $${polyTex([b, a - c])} = ${tex(e)}$`] : []),
      ...(b !== 0 ? [`On soustrait $${tex(b)}$ aux deux membres : $${polyTex([0, a - c])} = ${tex(e - b)}$`] : []),
      ...(a - c !== 1 ? [`On divise les deux membres par $${par(a - c)}$ : $x = ${df(num, den)}${sd !== 1 || Math.abs(den) !== 1 ? " = " + fracTex(num, den) : ""}$`] : []),
      `La solution de l'équation est $${fracTex(sn, sd)}$.`,
    ];
    return {
      statement: `Résoudre l'équation $${eq}$.`,
      parts: [{ interaction: { kind: "numerique", label: "$x =$", answer: { value: sn / sd, fraction: [sn, sd] } } }],
      solution: sol,
      rappel: "On ne change pas les solutions d'une équation en ajoutant (ou soustrayant) un même nombre aux deux membres, ni en les multipliant (ou divisant) par un même nombre non nul.",
    };
  },
};

export const m4Puissances: Generator = {
  meta: {
    id: "m4-puissances-regles", title: "Calculs sur les puissances",
    subject: "maths", level: "4e", chapterId: "m4-puissances", notionId: "m4-puissances-regles",
    kinds: ["texte-trous"], summary: "Trouver l'exposant manquant à l'aide des règles de calcul.", randomized: "valeurs", timeLimit: 120,
  },
  generate(rng, d) {
    const base = d === 3 ? rng.pick(["a", "2", "3", "5"]) : "10";
    const r = () => (d === 1 ? rng.int(1, 8) : nz(rng, -7, 9));
    const m = r(), n = r(), p = r(), q = r(), s = r(), t = d === 1 ? rng.int(2, 3) : nz(rng, -3, 4);
    const B = (e: number | string) => `${base}^{${e}}`;
    const lines = [
      `$${B(m)} \\times ${B(n)} = ${base}^{\\square}$ avec $\\square =$ [[0]]`,
      `$\\dfrac{${B(p)}}{${B(q)}} = ${base}^{\\square}$ avec $\\square =$ [[1]]`,
      `$\\left(${B(s)}\\right)^{${t}} = ${base}^{\\square}$ avec $\\square =$ [[2]]`,
    ];
    return {
      statement: `Compléter avec l'exposant qui convient${d === 3 && base === "a" ? " ($a$ désigne un nombre non nul)" : ""}.`,
      parts: [{ interaction: { kind: "texte-trous", template: lines.join("\n"), blanks: [m + n, p - q, s * t].map((v) => ({ type: "number", answer: { value: v } })) } }],
      solution: [
        `$${B(m)} \\times ${B(n)} = ${base}^{${m} + ${par(n)}} = ${B(m + n)}$ (on additionne les exposants).`,
        `$\\dfrac{${B(p)}}{${B(q)}} = ${base}^{${p} - ${par(q)}} = ${B(p - q)}$ (on soustrait les exposants).`,
        `$\\left(${B(s)}\\right)^{${t}} = ${base}^{${s} \\times ${par(t)}} = ${B(s * t)}$ (on multiplie les exposants).`,
      ],
      rappel: "$a^m \\times a^n = a^{m+n}$ ; $\\dfrac{a^m}{a^n} = a^{m-n}$ ; $(a^m)^n = a^{m \\times n}$.",
    };
  },
};

export const m4Statistiques: Generator = {
  meta: {
    id: "m4-moyenne-mediane", title: "Moyenne et médiane d'une série",
    subject: "maths", level: "4e", chapterId: "m4-statistiques", notionId: "m4-stats-indicateurs",
    kinds: ["numerique"], summary: "Calculer la moyenne (arrondie) et la médiane d'une série de notes.", randomized: "valeurs",
  },
  generate(rng, d) {
    const n = d === 1 ? 5 : d === 2 ? 8 : rng.pick([9, 10]);
    const notes = Array.from({ length: n }, () => rng.int(4, 20));
    const sum = notes.reduce((s, x) => s + x, 0);
    const mean = sum / n;
    const sorted = [...notes].sort((a, b) => a - b);
    const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const exact = Number.isInteger(mean * 10);
    return {
      statement: `Voici les notes (sur 20) obtenues par ${n} élèves à un contrôle :\n$$${notes.join(" \\quad ")}$$`,
      parts: [
        { prompt: `Calculer la moyenne de la série${exact ? "" : " (arrondir au dixième)"}.`, interaction: { kind: "numerique", label: "Moyenne :", answer: { value: roundTo(mean, 1), tol: exact ? 0 : 0.05, roundingLabel: "au dixième" } } },
        { prompt: "Déterminer la médiane de la série.", interaction: { kind: "numerique", label: "Médiane :", answer: { value: med } } },
      ],
      solution: [
        `Moyenne : $\\dfrac{${notes.join(" + ")}}{${n}} = \\dfrac{${sum}}{${n}} ${exact ? "=" : "\\approx"} ${tex(roundTo(mean, 1))}$.`,
        `Pour la médiane, on range les notes dans l'ordre croissant : $${sorted.join(" \\leqslant ")}$.`,
        n % 2
          ? `L'effectif ${n} est impair : la médiane est la ${(n + 1) / 2}e valeur, soit $${med}$.`
          : `L'effectif ${n} est pair : la médiane est la moyenne des ${n / 2}e et ${n / 2 + 1}e valeurs : $\\dfrac{${sorted[n / 2 - 1]} + ${sorted[n / 2]}}{2} = ${tex(med)}$.`,
      ],
      rappel: "La médiane partage la série rangée en deux groupes de même effectif : au moins la moitié des valeurs lui sont inférieures ou égales.",
    };
  },
};

// ───────────────────────── 3e ─────────────────────────

export const m3FonctionAffine: Generator = {
  meta: {
    id: "m3-fonction-affine-graphique", title: "Fonction affine : lecture graphique",
    subject: "maths", level: "3e", chapterId: "m3-fonctions", notionId: "m3-fonctions-affines",
    kinds: ["numerique"], summary: "Lire le coefficient directeur et l'ordonnée à l'origine d'une droite.", randomized: "valeurs",
  },
  generate(rng, d) {
    let p = 0, q = 1, b = 0;
    for (let g = 0; g < 100; g++) {
      q = d === 1 ? 1 : rng.pick(d === 2 ? [1, 2] : [2, 3]);
      p = nz(rng, -4, 4);
      if (gcd(p, q) !== 1) continue;
      b = rng.int(-3, 3);
      if (Math.abs(b + p) <= 5) break;
    }
    const a = p / q;
    const fig = plot({
      xmin: -5, xmax: 5, ymin: -6, ymax: 6, title: "Représentation graphique de la fonction f",
      fns: [{ f: (x) => a * x + b, label: "(d)" }],
      points: d === 1 ? [{ x: 0, y: b }, { x: q, y: b + p }] : [],
    });
    return {
      statement: "La droite $(d)$ ci-dessous représente une fonction affine $f : x \\mapsto ax + b$.\nLire graphiquement $a$ et $b$ (valeurs exactes, une fraction est acceptée).",
      figure: { kind: "svg", svg: fig },
      parts: [
        { prompt: "Coefficient directeur :", interaction: { kind: "numerique", label: "$a =$", answer: { value: a, fraction: [p, q] } } },
        { prompt: "Ordonnée à l'origine :", interaction: { kind: "numerique", label: "$b =$", answer: { value: b } } },
      ],
      solution: [
        `$b$ est l'ordonnée du point d'intersection de $(d)$ avec l'axe des ordonnées : la droite passe par $(0\\,;\\,${b})$, donc $b = ${b}$.`,
        `La droite passe aussi par $(${q}\\,;\\,${b + p})$. Quand $x$ augmente de $${q}$, $y$ ${p > 0 ? "augmente" : "diminue"} de $${Math.abs(p)}$.`,
        `$a = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{${p}}{${q}}${q === 1 ? "" : " = " + fracTex(p, q)}$. Donc $f(x) = ${q === 1 ? polyTex([b, p]) : fracTex(p, q) + "x" + (b ? " " + signed(b) : "")}$.`,
      ],
      rappel: "Pour $f(x) = ax + b$ : $b = f(0)$ et $a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$.",
    };
  },
};

export const m3Trigonometrie: Generator = {
  meta: {
    id: "m3-trigonometrie", title: "Trigonométrie dans le triangle rectangle",
    subject: "maths", level: "3e", chapterId: "m3-trigonometrie", notionId: "m3-trigo-calculs",
    kinds: ["numerique"], summary: "Utiliser cosinus, sinus ou tangente pour calculer une longueur ou un angle.", randomized: "valeurs", timeLimit: 240,
  },
  generate(rng, d) {
    const [A, B, C] = letters(rng, 3);
    const alpha = rng.int(20, 70);
    const rad = (alpha * Math.PI) / 180;
    let adj: number, opp: number, hyp: number, statement: string, ans: number, sol: string[], label: string, suffix = "cm";
    const kind = d === 1 ? rng.pick(["cos", "sin"] as const) : d === 2 ? "tan" : "angle";
    if (kind === "cos" || kind === "sin") {
      hyp = rng.int(5, 15); adj = hyp * Math.cos(rad); opp = hyp * Math.sin(rad);
      const target = kind === "cos" ? `${A}${B}` : `${B}${C}`;
      ans = roundTo(kind === "cos" ? adj : opp, 1);
      label = `$${target} \\approx$`;
      statement = `Le triangle $${A}${B}${C}$ est rectangle en $${B}$, avec $${A}${C} = ${hyp}$ cm et $\\widehat{${B}${A}${C}} = ${alpha}°$.\nCalculer $${target}$, arrondie au dixième.`;
      sol = [
        `Dans le triangle $${A}${B}${C}$ rectangle en $${B}$, $[${A}${C}]$ est l'hypoténuse et $[${target}]$ est le côté ${kind === "cos" ? "adjacent" : "opposé"} à l'angle $\\widehat{${B}${A}${C}}$.`,
        `$\\${kind}(\\widehat{${B}${A}${C}}) = \\dfrac{${target}}{${A}${C}}$, donc $${target} = ${A}${C} \\times \\${kind}(${alpha}°) = ${hyp} \\times \\${kind}(${alpha}°)$.`,
        `$${target} \\approx ${tex(ans)}$ cm.`,
      ];
    } else if (kind === "tan") {
      adj = rng.int(4, 12); opp = adj * Math.tan(rad); hyp = Math.hypot(adj, opp);
      ans = roundTo(opp, 1);
      label = `$${B}${C} \\approx$`;
      statement = `Le triangle $${A}${B}${C}$ est rectangle en $${B}$, avec $${A}${B} = ${adj}$ cm et $\\widehat{${B}${A}${C}} = ${alpha}°$.\nCalculer $${B}${C}$, arrondie au dixième.`;
      sol = [
        `$[${B}${C}]$ est le côté opposé et $[${A}${B}]$ le côté adjacent à l'angle $\\widehat{${B}${A}${C}}$ : on utilise la tangente.`,
        `$\\tan(\\widehat{${B}${A}${C}}) = \\dfrac{${B}${C}}{${A}${B}}$, donc $${B}${C} = ${adj} \\times \\tan(${alpha}°) \\approx ${tex(ans)}$ cm.`,
      ];
    } else {
      adj = rng.int(4, 12); opp = rng.int(3, 12); hyp = Math.hypot(adj, opp);
      const ang = (Math.atan(opp / adj) * 180) / Math.PI;
      ans = Math.round(ang);
      suffix = "°";
      label = `$\\widehat{${B}${A}${C}} \\approx$`;
      statement = `Le triangle $${A}${B}${C}$ est rectangle en $${B}$, avec $${A}${B} = ${adj}$ cm et $${B}${C} = ${opp}$ cm.\nCalculer la mesure de l'angle $\\widehat{${B}${A}${C}}$, arrondie au degré.`;
      sol = [
        `On connaît le côté opposé $${B}${C}$ et le côté adjacent $${A}${B}$ à l'angle $\\widehat{${B}${A}${C}}$ : on utilise la tangente.`,
        `$\\tan(\\widehat{${B}${A}${C}}) = \\dfrac{${opp}}{${adj}}$, donc $\\widehat{${B}${A}${C}} = \\arctan\\left(\\dfrac{${opp}}{${adj}}\\right) \\approx ${ans}°$ (touche $\\tan^{-1}$ de la calculatrice).`,
      ];
    }
    const fig = triangle({
      pts: [[0, 0], [adj, 0], [adj, opp]], names: [A, B, C], rightAngleAt: 1,
      sideLabels: kind === "angle" ? [`${adj} cm`, `${opp} cm`, null] : kind === "tan" ? [`${adj} cm`, "?", null] : [kind === "cos" ? "?" : null, kind === "sin" ? "?" : null, `${hyp} cm`],
      angleLabel: { at: 0, text: kind === "angle" ? "?" : `${alpha}°` },
      title: "Triangle rectangle",
    });
    return {
      statement, figure: { kind: "svg", svg: fig, caption: "La figure n'est pas en vraie grandeur." },
      parts: [{ interaction: { kind: "numerique", label, suffix, answer: { value: ans, tol: kind === "angle" ? 0.5 : 0.05, roundingLabel: kind === "angle" ? "au degré" : "au dixième", decimals: kind === "angle" ? 0 : 1 } } }],
      solution: sol,
      rappel: "Dans un triangle rectangle : $\\cos = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$, $\\sin = \\dfrac{\\text{opposé}}{\\text{hypoténuse}}$, $\\tan = \\dfrac{\\text{opposé}}{\\text{adjacent}}$ (« CAH SOH TOA »).",
    };
  },
};

export const m3Probabilites: Generator = {
  meta: {
    id: "m3-probabilites-urne", title: "Probabilités : tirage dans une urne",
    subject: "maths", level: "3e", chapterId: "m3-probabilites", notionId: "m3-probas-calcul",
    kinds: ["numerique"], summary: "Calculer des probabilités en situation d'équiprobabilité.", randomized: "valeurs",
  },
  generate(rng, d) {
    const r = rng.int(1, 6), b = rng.int(1, 6), g = d === 1 ? 0 : rng.int(1, 5);
    const N = r + b + g;
    const fig = urn([{ color: "rouge", fill: "#ef4444", n: r }, { color: "bleue", fill: "#3b82f6", n: b }, { color: "verte", fill: "#22c55e", n: g }], "Urne");
    const parts = [
      { prompt: "Quelle est la probabilité de tirer une boule rouge ?", interaction: { kind: "numerique" as const, label: "$P(R) =$", answer: { value: r / N, fraction: [r, N] as [number, number] } } },
      { prompt: "Quelle est la probabilité de ne pas tirer une boule bleue ?", interaction: { kind: "numerique" as const, label: "$P(\\overline{B}) =$", answer: { value: (N - b) / N, fraction: [N - b, N] as [number, number] } } },
    ];
    return {
      statement: `Une urne contient ${r} boule(s) rouge(s), ${b} boule(s) bleue(s)${g ? ` et ${g} boule(s) verte(s)` : ""}, indiscernables au toucher. On tire une boule au hasard.\nDonner les résultats sous forme de fraction irréductible (ou de décimal exact).`,
      figure: { kind: "svg", svg: fig },
      parts,
      solution: [
        `Il y a $${N}$ boules en tout, tirées au hasard : chaque boule a la même probabilité d'être tirée (équiprobabilité).`,
        `$P(R) = \\dfrac{\\text{nombre de boules rouges}}{\\text{nombre total de boules}} = \\dfrac{${r}}{${N}}${gcd(r, N) > 1 ? " = " + fracTex(r, N) : ""}$`,
        `« Ne pas tirer une bleue » est l'événement contraire de $B$ : $P(\\overline{B}) = 1 - P(B) = 1 - \\dfrac{${b}}{${N}} = \\dfrac{${N - b}}{${N}}${gcd(N - b, N) > 1 ? " = " + fracTex(N - b, N) : ""}$`,
      ],
      rappel: "En situation d'équiprobabilité : $P(A) = \\dfrac{\\text{nombre d'issues favorables}}{\\text{nombre d'issues possibles}}$, et $P(\\overline{A}) = 1 - P(A)$.",
    };
  },
};

export const m3DemoPythagore: Generator = {
  meta: {
    id: "m3-demonstration-rectangle", title: "Démontrer qu'un triangle est (ou n'est pas) rectangle",
    subject: "maths", level: "3e", chapterId: "m3-pythagore", notionId: "m3-pythagore-reciproque",
    kinds: ["demonstration"], summary: "Remettre la démonstration dans l'ordre et choisir la justification de chaque étape.", randomized: "valeurs",
  },
  generate(rng, d) {
    const [X, Y, Z] = letters(rng, 3);
    let a: number, b: number, c: number;
    const right = d === 1 || rng.next() < 0.5;
    if (right) { const t = rng.pick(TRIPLES); const k = d === 3 ? rng.pick([0.5, 1.5, 2]) : 1; [a, b, c] = t.map((v) => v * k); }
    else { do { a = rng.int(4, 12); b = rng.int(4, 12); c = rng.int(Math.max(a, b) + 1, a + b - 1); } while (a * a + b * b === c * c); }
    const OPTIONS = ["On repère le plus long côté", "Calcul séparé des deux membres", "Comparaison des résultats", "Réciproque du théorème de Pythagore", "Contraposée du théorème de Pythagore", "Théorème de Thalès"];
    const steps = [
      { s: `Dans le triangle $${X}${Y}${Z}$, le plus long côté est $[${X}${Z}]$.`, j: 0 },
      { s: `D'une part $${X}${Z}^2 = ${tex(c)}^2 = ${tex(c * c)}$. D'autre part $${X}${Y}^2 + ${Y}${Z}^2 = ${tex(a)}^2 + ${tex(b)}^2 = ${tex(a * a + b * b)}$.`, j: 1 },
      { s: right ? `On constate que $${X}${Z}^2 = ${X}${Y}^2 + ${Y}${Z}^2$.` : `On constate que $${X}${Z}^2 \\neq ${X}${Y}^2 + ${Y}${Z}^2$.`, j: 2 },
      { s: right ? `Donc le triangle $${X}${Y}${Z}$ est rectangle en $${Y}$.` : `Donc le triangle $${X}${Y}${Z}$ n'est pas rectangle.`, j: right ? 3 : 4 },
    ];
    const sh = shuffleWithIndex(rng, steps);
    const opt = shuffleWithIndex(rng, OPTIONS);
    return {
      statement: `On donne $${X}${Y} = ${tex(a)}$ cm, $${Y}${Z} = ${tex(b)}$ cm et $${X}${Z} = ${tex(c)}$ cm.\nLe triangle $${X}${Y}${Z}$ est-il rectangle ? Remettre les étapes de la démonstration dans l'ordre, puis choisir la justification de chaque étape.`,
      parts: [{ interaction: { kind: "demonstration", steps: sh.shuffled.map((s) => s.s), answer: steps.map((_, i) => sh.indexOf(i)), justifications: { options: opt.shuffled, answer: sh.shuffled.map((s) => opt.indexOf(s.j)) } } }],
      solution: steps.map((s, i) => `${i + 1}. ${s.s} — *${OPTIONS[s.j]}*`),
      rappel: "Réciproque : si $XZ^2 = XY^2 + YZ^2$, alors le triangle est rectangle en $Y$. Contraposée : si l'égalité n'est pas vérifiée, le triangle n'est pas rectangle.",
    };
  },
};
