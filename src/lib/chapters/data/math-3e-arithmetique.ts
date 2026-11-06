// SCI-3E-MATH-001 — Mathématiques 3e : Arithmétique (programme du cycle 4 de 2020, BO n° 31 du 30 juillet 2020,
// repères annuels et attendus de fin de 3e, BO n° 22 du 29 mai 2019).
// Contenu original rédigé à partir du dossier research/dossiers/math-3e-arithmetique.md.
// Les sigles PGCD et PPCM ne sont pas exigibles : on parle de « plus grand diviseur commun » et de
// « plus petit multiple commun », utilisés comme outils de résolution de problèmes.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, Rng } from "../../engine/types";
import { gcd, parseNumber, simplify, tex } from "../../engine/numbers";

const T = (x: number) => tex(x);
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};
/** Décomposition en facteurs premiers : [[p, exposant], …] par ordre croissant. */
function factors(n: number): [number, number][] {
  const r: [number, number][] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) { m /= p; e++; }
    if (e) r.push([p, e]);
  }
  if (m > 1) r.push([m, 1]);
  return r;
}
const powTex = (p: number, e: number) => (e === 1 ? `${p}` : `${p}^{${e}}`);
const groupTex = (list: [number, number][]) => list.filter(([, e]) => e > 0).map(([p, e]) => powTex(p, e)).join(" \\times ");
/** Écriture LaTeX de la décomposition : 2^{3} \times 3^{2} \times 5. */
const fTex = (n: number) => groupTex(factors(n));
/** Liste des facteurs premiers avec répétition : 12 → [2, 2, 3]. */
const flat = (n: number) => factors(n).flatMap(([p, e]) => Array<number>(e).fill(p));
const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const frac = (n: number, d: number) => `\\dfrac{${T(n)}}{${T(d)}}`;
/** Deux entiers premiers entre eux, distincts, dans [lo, hi]. */
function coprimePair(rng: Rng, lo: number, hi: number): [number, number] {
  for (;;) {
    const p = rng.int(lo, hi), q = rng.int(lo, hi);
    if (p !== q && gcd(p, q) === 1) return [p, q];
  }
}

const num = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } }, mistakes: mistakes.filter((m) => parseNumber(m.match)?.value !== value) });
/** Réponse fractionnaire exacte, exigée sous forme irréductible ; les diagnostics de même valeur sont écartés. */
function fracAns(n: number, d: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart {
  const [a, b] = simplify(n, d);
  return { prompt, interaction: { kind: "numerique", answer: { value: a / b, fraction: [a, b] } }, mistakes: mistakes.filter((m) => { const v = parseNumber(m.match)?.value; return v === undefined || Math.abs(v - a / b) > 1e-9; }) };
}
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
/** Mélange des options en conservant la bonne réponse et les diagnostics (indices d'origine). */
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}

/** Trois fausses décompositions plausibles de n (n doit avoir au moins 3 facteurs premiers comptés avec répétition). */
function wrongDecompositions(n: number): { composite: string; exponent: string; missing: string; compositeFactor: number } {
  const fl = flat(n);
  const c = fl[0] * fl[1];
  const rest = fl.slice(2);
  const restTex = groupTex(factors(rest.reduce((a, b) => a * b, 1)));
  const composite = restTex ? `${c} \\times ${restTex}` : `${c}`;
  const f = factors(n);
  const last = f.length - 1;
  const exponent = groupTex(f.map(([p, e], i) => [p, i === last ? e + 1 : e]));
  const missing = groupTex(f.map(([p, e], i) => [p, i === 0 ? e - 1 : e]));
  return { composite, exponent, missing, compositeFactor: c };
}

const O = {
  "M3-NC-01": "Décomposer un nombre entier en produit de facteurs premiers (à la main ou avec un outil numérique).",
  "M3-NC-02": "Rendre une fraction irréductible.",
  "M3-NC-03": "Modéliser et résoudre des problèmes mettant en jeu la divisibilité (engrenages, conjonction de phénomènes…).",
  "M4-NC-12": "Établir la liste des nombres premiers inférieurs à 100 (consolidation de 4e).",
} as const;
type Obj = keyof typeof O;
const SRC_3E = "Attendus de fin d'année de 3e (2019), « Utiliser les nombres pour comparer, calculer et résoudre des problèmes » ; repères annuels de progression du cycle 4 (BO n° 22 du 29 mai 2019), 3e, divisibilité ; programme du cycle 4 (BO n° 31 du 30 juillet 2020), thème A";
const SRC_4E = "Repères annuels de progression du cycle 4 (BO n° 22 du 29 mai 2019), 4e, « nombres premiers » ; attendus de fin d'année de 4e (2019) — notion de 4e consolidée en 3e";

// ───────────────────────── Exercices ─────────────────────────
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

const NOT_PRIME_TRAPS = [1, 21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93];
const PRIMES_10_100 = Array.from({ length: 90 }, (_, i) => i + 10).filter(isPrime);
const notPrimeReason = (n: number) => (n === 1 ? "$1$ n'a qu'un seul diviseur ($1$) : il n'est pas premier" : `$${n} = ${flat(n)[0]} \\times ${n / flat(n)[0]}$ : il n'est pas premier`);

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "ari3-01", title: "Diviseur ou multiple ?", niveau: 1, objectives: ["M3-NC-03"], time: 60,
    vary: (rng) => {
      const d = rng.pick([3, 4, 6, 7, 8, 9, 11, 12, 15]), k = rng.int(3, 12);
      const divisible = rng.next() < 0.7;
      const r = divisible ? 0 : rng.int(1, d - 1);
      const a = d * k + r;
      const opts = ["un diviseur", "un multiple", "ni un diviseur ni un multiple"];
      return {
        statement: `Complète chaque phrase avec le bon mot.`,
        parts: [{ interaction: { kind: "texte-trous", template: `$${d}$ est [[0]] de $${a}$.\n$${a}$ est [[1]] de $${d}$.`, blanks: [{ type: "select", options: opts, answer: divisible ? 0 : 2 }, { type: "select", options: opts, answer: divisible ? 1 : 2 }] } }],
        solution: divisible
          ? [`$${a} = ${d} \\times ${k}$ : la division de $${a}$ par $${d}$ tombe juste (reste $0$).`, `Donc $${d}$ est un diviseur de $${a}$ et $${a}$ est un multiple de $${d}$.`]
          : [`$${a} = ${d} \\times ${k} + ${r}$ : le reste de la division de $${a}$ par $${d}$ vaut $${r}$, pas $0$.`, `$${d}$ n'est pas un diviseur de $${a}$ et $${a}$ n'est pas un multiple de $${d}$ (et $${d}$, plus petit, ne peut pas être un multiple de $${a}$).`],
      };
    },
    reasoning: "« $d$ divise $a$ » et « $a$ est un multiple de $d$ » disent la même chose : il existe un entier $k$ tel que $a = d \\times k$.",
    hints: ["Effectue la division euclidienne du grand nombre par le petit.", "Si le reste est nul, le petit nombre est un diviseur du grand."],
  }),
  ex({
    id: "ari3-02", title: "Premier ou pas ?", niveau: 1, objectives: ["M4-NC-12"], time: 90,
    vary: (rng) => {
      const nP = rng.int(2, 3);
      const nums = rng.shuffle([...rng.shuffle(PRIMES_10_100).slice(0, nP), ...rng.shuffle(NOT_PRIME_TRAPS).slice(0, 5 - nP)]);
      return {
        statement: "Pour chaque nombre, dis si l'affirmation est vraie ou fausse.",
        parts: [{ interaction: { kind: "vrai-faux", items: nums.map((n) => `$${n}$ est un nombre premier.`), answer: nums.map(isPrime) } }],
        solution: nums.map((n) => (isPrime(n) ? `$${n}$ n'est divisible par aucun nombre premier $p$ tel que $p^2 \\leqslant ${n}$ : il est premier.` : `${notPrimeReason(n)}.`)),
      };
    },
    reasoning: "Un nombre premier a exactement deux diviseurs : $1$ et lui-même. Il suffit d'un diviseur supplémentaire pour qu'il ne soit pas premier.",
    hints: ["Teste les critères de divisibilité par $2$, $3$ et $5$.", "Pense aussi à $7$ : $49 = 7 \\times 7$, $77 = 7 \\times 11$, $91 = 7 \\times 13$."],
  }),
  ex({
    id: "ari3-03", title: "Critères de divisibilité", niveau: 1, objectives: ["M3-NC-01"], time: 90,
    vary: (rng) => {
      let n = 0;
      // un nombre divisible par au moins un des diviseurs testés, pour éviter un exercice « tout non »
      while (![2, 3, 5].some((d) => n % d === 0)) n = rng.int(102, 9990);
      const digits = String(n).split("").map(Number);
      const s = digits.reduce((a, b) => a + b, 0);
      const ds = [2, 3, 5, 9, 10];
      return {
        statement: `On considère le nombre $${T(n)}$. Est-il divisible par… (sans poser de division)`,
        parts: [{ interaction: { kind: "texte-trous", template: ds.map((d, i) => `$${d}$ : [[${i}]]`).join("\n"), blanks: ds.map((d) => ({ type: "select" as const, options: ["oui", "non"], answer: n % d === 0 ? 0 : 1 })) } }],
        solution: [
          `Dernier chiffre : $${digits[digits.length - 1]}$. Divisible par $2$ si le dernier chiffre est pair, par $5$ s'il vaut $0$ ou $5$, par $10$ s'il vaut $0$.`,
          `Somme des chiffres : $${digits.join(" + ")} = ${s}$. Divisible par $3$ si cette somme est un multiple de $3$, par $9$ si c'est un multiple de $9$.`,
          ds.map((d) => `par $${d}$ : ${n % d === 0 ? "oui" : "non"}`).join(" ; ") + ".",
        ],
      };
    },
    reasoning: "Les critères de divisibilité évitent de poser la division : on regarde le dernier chiffre (2, 5, 10) ou la somme des chiffres (3, 9).",
    hints: ["Pour $2$, $5$ et $10$ : regarde seulement le chiffre des unités.", "Pour $3$ et $9$ : additionne tous les chiffres."],
  }),
  ex({
    id: "ari3-04", title: "La liste des diviseurs", niveau: 1, objectives: ["M3-NC-03"], time: 90,
    vary: (rng) => {
      const n = rng.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]);
      const dv = divisors(n);
      const show = (l: number[]) => l.map((x) => `$${x}$`).join(" ; ");
      const mid = dv[rng.int(1, dv.length - 2)];
      const extra = rng.pick(Array.from({ length: n - 3 }, (_, i) => i + 2).filter((x) => n % x !== 0));
      const opts = [show(dv), show(dv.filter((x) => x !== mid)), show(dv.slice(1, -1)), show([...dv, extra].sort((a, b) => a - b))];
      return {
        statement: `Quelle liste contient **tous** les diviseurs de $${n}$, et seulement eux ?`,
        parts: [shuffledQcm(rng, opts, 0, { 1: `Il manque $${mid}$ : $${n} = ${mid} \\times ${n / mid}$.`, 2: `Il manque $1$ et $${n}$ : tout entier est divisible par $1$ et par lui-même.`, 3: `$${extra}$ ne divise pas $${n}$ : la division ne tombe pas juste.` })],
        solution: [`On cherche les produits égaux à $${n}$ en testant $1$, $2$, $3$… : ${dv.filter((d) => d * d <= n).map((d) => `$${n} = ${d} \\times ${n / d}$`).join(" ; ")}.`, `Les diviseurs de $${n}$ sont : ${show(dv)}.`],
      };
    },
    reasoning: "Les diviseurs vont par paires ($d$ et $n \\div d$) : on teste $1$, $2$, $3$… jusqu'à ce que les paires se répètent, sans oublier $1$ et le nombre lui-même.",
    hints: ["Écris $n$ comme produit de deux entiers de toutes les façons possibles.", "N'oublie ni $1$ ni le nombre lui-même."],
  }),
  ex({
    id: "ari3-05", title: "Associer un nombre et sa décomposition", niveau: 1, objectives: ["M3-NC-01"], time: 120,
    vary: (rng) => {
      const set = new Set<number>();
      while (set.size < 4) {
        const n = 2 ** rng.int(0, 3) * 3 ** rng.int(0, 2) * 5 ** rng.int(0, 2) * 7 ** rng.int(0, 1);
        if (n >= 20 && n <= 900 && flat(n).length >= 3) set.add(n);
      }
      const nums = [...set];
      const right = rng.shuffle(nums);
      return {
        statement: "Associe chaque nombre à sa décomposition en produit de facteurs premiers.",
        parts: [{ interaction: { kind: "associer", left: nums.map((n) => `$${T(n)}$`), right: right.map((n) => `$${fTex(n)}$`), answer: nums.map((n) => right.indexOf(n)) } }],
        solution: nums.map((n) => `$${fTex(n)} = ${flat(n).join(" \\times ")} = ${T(n)}$`),
      };
    },
    reasoning: "On peut calculer chaque produit, ou partir du nombre et repérer ses facteurs (pair → facteur 2 ; finit par 0 ou 5 → facteur 5).",
    hints: ["Calcule les puissances : $2^3 = 8$, $3^2 = 9$, $5^2 = 25$.", "Un nombre impair ne contient pas le facteur $2$."],
  }),
  ex({
    id: "ari3-06", title: "Fractions égales ?", niveau: 1, objectives: ["M3-NC-02"], time: 90,
    vary: (rng) => {
      const items: string[] = [], answer: boolean[] = [], sol: string[] = [];
      for (let i = 0; i < 4; i++) {
        const [p, q] = coprimePair(rng, 2, 9);
        const k = rng.int(2, 9);
        const kind = rng.pick(["vrai", "ajout", "mult"]);
        if (kind === "vrai") { items.push(`$${frac(k * p, k * q)} = ${frac(p, q)}$`); answer.push(true); sol.push(`$${frac(k * p, k * q)} = \\dfrac{${k} \\times ${p}}{${k} \\times ${q}} = ${frac(p, q)}$ : vrai.`); }
        else if (kind === "ajout") { items.push(`$${frac(p, q)} = ${frac(p + k, q + k)}$`); answer.push(false); sol.push(`Ajouter $${k}$ au numérateur et au dénominateur ne conserve pas la fraction : $${frac(p, q)} \\neq ${frac(p + k, q + k)}$ (faux).`); }
        else { const m = k + 1; items.push(`$${frac(p, q)} = ${frac(k * p, m * q)}$`); answer.push(false); sol.push(`Le numérateur est multiplié par $${k}$ et le dénominateur par $${m}$ : faux.`); }
      }
      return { statement: "Vrai ou faux ?", parts: [{ interaction: { kind: "vrai-faux", items, answer } }], solution: sol };
    },
    reasoning: "Une fraction ne change pas quand on **multiplie** (ou divise) son numérateur et son dénominateur par le **même** nombre non nul. Ajouter un même nombre la change.",
    hints: ["Cherche par quel nombre on a multiplié le numérateur, puis le dénominateur.", "Les deux multiplicateurs doivent être égaux."],
  }),
  ex({
    id: "ari3-07", title: "Irréductible ou simplifiable ?", niveau: 1, objectives: ["M3-NC-02"], time: 120,
    vary: (rng) => {
      const list: [number, number][] = [];
      const key = (a: number, b: number) => `${a}/${b}`;
      const seen = new Set<string>();
      const push = (a: number, b: number) => { if (!seen.has(key(a, b)) && a !== b) { seen.add(key(a, b)); list.push([a, b]); } };
      while (list.length < 3) { const [p, q] = coprimePair(rng, 2, 40); push(p, q); }
      while (list.length < 6) { const g = rng.pick([2, 3, 5, 7, 11, 13]); const [p, q] = coprimePair(rng, 2, 9); push(g * p, g * q); }
      const items = rng.shuffle(list);
      return {
        statement: "Classe ces fractions : sont-elles irréductibles ou peut-on encore les simplifier ?",
        parts: [{ interaction: { kind: "classer", categories: ["Irréductible", "Simplifiable"], items: items.map(([a, b]) => `$${frac(a, b)}$`), answer: items.map(([a, b]) => (gcd(a, b) === 1 ? 0 : 1)) } }],
        solution: items.map(([a, b]) => (gcd(a, b) === 1 ? `$${frac(a, b)}$ : $${a}$ et $${b}$ n'ont que $1$ comme diviseur commun, irréductible.` : `$${frac(a, b)}$ : $${a}$ et $${b}$ sont divisibles par $${gcd(a, b)}$, simplifiable ($${frac(a, b)} = ${frac(a / gcd(a, b), b / gcd(a, b))}$).`)),
      };
    },
    reasoning: "Une fraction est irréductible quand son numérateur et son dénominateur n'ont aucun diviseur commun autre que $1$.",
    hints: ["Cherche un diviseur commun : $2$ ? $3$ ? $5$ ? $7$ ?", "Attention aux diviseurs communs moins visibles comme $11$ ou $13$."],
  }),
  // ── Niveau 2 : Application directe ──
  ex({
    id: "ari3-08", title: "Trouver les exposants", niveau: 2, objectives: ["M3-NC-01"], time: 120,
    vary: (rng) => {
      let n = 0, e: number[] = [];
      while (n < 60 || n > 5000 || e.filter((x) => x > 0).length < 2 || e.reduce((a, b) => a + b, 0) < 4) {
        e = [rng.int(0, 4), rng.int(0, 3), rng.int(0, 2), rng.int(0, 1)];
        n = 2 ** e[0] * 3 ** e[1] * 5 ** e[2] * 7 ** e[3];
      }
      return {
        statement: `On écrit $N = ${T(n)}$ sous la forme $2^{a} \\times 3^{b} \\times 5^{c} \\times 7^{d}$. Complète le tableau des exposants (écris $0$ si le facteur n'apparaît pas).`,
        parts: [{ interaction: { kind: "tableau", headers: ["Facteur premier", "$2$", "$3$", "$5$", "$7$"], rows: [{ label: "Exposant", cells: e.map((v) => ({ answer: { value: v } })) }] } }],
        solution: [`Divisions successives : ${flat(n).reduce<{ q: number; s: string[] }>((acc, p) => ({ q: acc.q / p, s: [...acc.s, `$${T(acc.q)} \\div ${p} = ${T(acc.q / p)}$`] }), { q: n, s: [] }).s.join(" ; ")}.`, `Donc $${T(n)} = ${fTex(n)}$ : exposants ${e.join(", ")}.`],
      };
    },
    reasoning: "On divise par le plus petit nombre premier possible, autant de fois que possible, puis on passe au suivant ; le nombre de divisions par $p$ est l'exposant de $p$.",
    hints: ["Divise par $2$ tant que le quotient est pair.", "Puis par $3$, puis par $5$, puis par $7$, jusqu'à obtenir $1$."],
  }),
  ex({
    id: "ari3-09", title: "Quelle est la bonne décomposition ?", niveau: 2, objectives: ["M3-NC-01"], time: 90,
    vary: (rng) => {
      let n = 0;
      while (n < 100 || n > 3000 || flat(n).length < 4 || factors(n).length < 2) n = 2 ** rng.int(1, 4) * 3 ** rng.int(0, 2) * 5 ** rng.int(0, 2) * rng.pick([1, 7, 11]);
      const w = wrongDecompositions(n);
      return {
        statement: `Quelle est la décomposition en produit de facteurs premiers de $${T(n)}$ ?`,
        parts: [shuffledQcm(rng, [`$${fTex(n)}$`, `$${w.composite}$`, `$${w.exponent}$`, `$${w.missing}$`], 0, {
          1: `Ce produit vaut bien $${T(n)}$, mais $${w.compositeFactor}$ n'est pas un nombre premier : il faut continuer la décomposition.`,
          2: "Ce produit ne vaut pas le nombre de départ : recalcule-le en vérifiant les exposants.",
          3: `Il manque un facteur $${flat(n)[0]}$ : ce produit vaut $${T(n / flat(n)[0])}$.`,
        })],
        solution: [`$${T(n)} = ${flat(n).join(" \\times ")}$ (divisions successives par des nombres premiers).`, `En regroupant avec des puissances : $${T(n)} = ${fTex(n)}$.`, "Une décomposition en facteurs premiers ne contient **que** des nombres premiers, et son produit doit redonner le nombre."],
      };
    },
    reasoning: "Deux contrôles : tous les facteurs sont-ils premiers ? Le produit redonne-t-il le nombre ?",
    hints: ["Vérifie que chaque facteur est un nombre premier.", "Calcule le produit proposé et compare-le au nombre."],
  }),
  ex({
    id: "ari3-10", title: "Simplifier une fraction", niveau: 2, objectives: ["M3-NC-02"], time: 75,
    vary: (rng) => {
      let p = 0, q = 0, g = 0;
      do { [p, q] = coprimePair(rng, 2, 15); g = rng.int(2, 15); } while (g * Math.max(p, q) > 300);
      const a = g * p, b = g * q;
      return {
        statement: `Écris $${frac(a, b)}$ sous forme de fraction irréductible (exemple de saisie : 3/4).`,
        parts: [fracAns(a, b, [{ match: `${q}/${p}`, feedback: "Tu as inversé le numérateur et le dénominateur." }, { match: `${p}/${b}`, feedback: "Il faut diviser le numérateur **et** le dénominateur par le même nombre." }])],
        solution: [`$${a} = ${g} \\times ${p}$ et $${b} = ${g} \\times ${q}$ : $${g}$ est le plus grand diviseur commun.`, `$${frac(a, b)} = \\dfrac{${g} \\times ${p}}{${g} \\times ${q}} = ${frac(p, q)}$.`, `$${p}$ et $${q}$ n'ont pas de diviseur commun autre que $1$ : la fraction est irréductible.`],
      };
    },
    reasoning: "Diviser numérateur et dénominateur par leur plus grand diviseur commun donne directement la fraction irréductible ; on peut aussi simplifier en plusieurs fois.",
    hints: ["Cherche un nombre qui divise à la fois le numérateur et le dénominateur.", "Recommence tant qu'il reste un diviseur commun."],
  }),
  ex({
    id: "ari3-11", title: "Le plus grand diviseur commun", niveau: 2, objectives: ["M3-NC-03", "M3-NC-01"], time: 90,
    vary: (rng) => {
      const g = rng.pick([4, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24]);
      const [p, q] = coprimePair(rng, 2, 11);
      const a = g * p, b = g * q;
      const small = flat(g)[0];
      return {
        statement: `Quel est le plus grand diviseur commun à $${a}$ et $${b}$ ?`,
        parts: [num(g, [{ match: String(small), feedback: `$${small}$ est bien un diviseur commun, mais ce n'est pas le plus grand.` }, { match: String(lcm(a, b)), feedback: "Ceci est le plus petit multiple commun, pas un diviseur commun." }, { match: String(a * b), feedback: "Le produit des deux nombres n'est pas un diviseur commun." }])],
        solution: [`$${a} = ${fTex(a)}$ et $${b} = ${fTex(b)}$.`, `Facteurs communs (avec le plus petit exposant) : $${fTex(g)}$.`, `Le plus grand diviseur commun est $${g}$. Contrôle : $${a} = ${g} \\times ${p}$, $${b} = ${g} \\times ${q}$ et $${p}$, $${q}$ n'ont plus de diviseur commun.`],
      };
    },
    reasoning: "Le plus grand diviseur commun est le produit des facteurs premiers communs aux deux décompositions, chacun avec son plus petit exposant.",
    hints: ["Décompose les deux nombres en facteurs premiers.", "Garde seulement les facteurs présents dans les deux décompositions."],
  }),
  ex({
    id: "ari3-12", title: "Le plus petit multiple commun", niveau: 2, objectives: ["M3-NC-03"], time: 90,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.int(4, 30); b = rng.int(4, 30); } while (a === b || gcd(a, b) === 1 || a % b === 0 || b % a === 0 || lcm(a, b) > 200);
      const m = lcm(a, b);
      return {
        statement: `Quel est le plus petit multiple commun non nul à $${a}$ et $${b}$ ?`,
        parts: [num(m, [{ match: String(a * b), feedback: `$${a} \\times ${b}$ est bien un multiple commun, mais pas le plus petit : $${a}$ et $${b}$ ont un facteur commun.` }, { match: String(gcd(a, b)), feedback: "Ceci est le plus grand diviseur commun, pas un multiple commun." }])],
        solution: [`Multiples de $${b}$ : ${Array.from({ length: m / b }, (_, i) => `$${(i + 1) * b}$`).join(" ; ")}…`, `Le premier qui est aussi multiple de $${a}$ est $${m}$ ($${m} = ${a} \\times ${m / a}$).`, `Avec les décompositions : $${a} = ${fTex(a)}$, $${b} = ${fTex(b)}$ ; on prend tous les facteurs avec le plus grand exposant : $${fTex(m)} = ${m}$.`],
      };
    },
    reasoning: "On parcourt les multiples du plus grand nombre jusqu'au premier qui est aussi multiple de l'autre ; le produit $a \\times b$ n'est le plus petit que s'ils n'ont aucun facteur commun.",
    hints: ["Écris les multiples du plus grand des deux nombres.", "Arrête-toi au premier qui est divisible par l'autre nombre."],
  }),
  ex({
    id: "ari3-13", title: "Trier des nombres inférieurs à 100", niveau: 2, objectives: ["M4-NC-12"], time: 120,
    vary: (rng) => {
      const nums = rng.shuffle([...rng.shuffle(PRIMES_10_100).slice(0, 4), ...rng.shuffle(NOT_PRIME_TRAPS.filter((n) => n > 1)).slice(0, 3), rng.pick([1, 2])]);
      return {
        statement: "Classe ces nombres : premier ou non premier ?",
        parts: [{ interaction: { kind: "classer", categories: ["Premier", "Non premier"], items: nums.map((n) => `$${n}$`), answer: nums.map((n) => (isPrime(n) ? 0 : 1)) } }],
        solution: [...nums.map((n) => (isPrime(n) ? `$${n}$ : premier.` : `${notPrimeReason(n)}.`)), "Rappel : $2$ est le seul nombre premier pair ; $1$ n'est pas premier."],
      };
    },
    reasoning: "Pour un nombre inférieur à $100$, il suffit de tester $2$, $3$, $5$ et $7$ (car $11^2 = 121 > 100$).",
    hints: ["Teste la divisibilité par $2$, $3$, $5$ puis $7$.", "Si aucun ne divise le nombre (et qu'il est supérieur à 1), il est premier."],
  }),
  ex({
    id: "ari3-14", title: "Compter les diviseurs", niveau: 2, objectives: ["M3-NC-03"], time: 90,
    vary: (rng) => {
      const n = rng.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 60, 72, 84, 90, 100]);
      const dv = divisors(n);
      const sq = Number.isInteger(Math.sqrt(n));
      return {
        statement: `Combien le nombre $${n}$ a-t-il de diviseurs ?`,
        parts: [num(dv.length, [{ match: String(dv.length - 2), feedback: "Tu as oublié $1$ et le nombre lui-même, qui sont toujours des diviseurs." }, ...(sq ? [{ match: String(dv.length + 1), feedback: `$${Math.sqrt(n)}$ est compté deux fois : $${n} = ${Math.sqrt(n)} \\times ${Math.sqrt(n)}$ ne donne qu'un seul diviseur.` }] : [])])],
        solution: [`Paires de diviseurs : ${dv.filter((d) => d * d <= n).map((d) => `$${d} \\times ${n / d}$`).join(" ; ")}.`, `Diviseurs : ${dv.map((d) => `$${d}$`).join(" ; ")}, soit $${dv.length}$ diviseurs.`],
      };
    },
    reasoning: "On liste les diviseurs par paires $d \\times \\dfrac{n}{d}$ ; une paire formée de deux nombres égaux ne compte qu'un diviseur.",
    hints: ["Teste $1$, $2$, $3$… et note chaque paire de diviseurs.", "Arrête quand le premier nombre de la paire dépasse le second."],
  }),
  ex({
    id: "ari3-36", title: "Divisions successives", niveau: 2, objectives: ["M3-NC-01"], time: 120,
    vary: (rng) => {
      let n = 0;
      while (n < 100 || n > 2000 || flat(n).length < 4 || flat(n).length > 6) n = 2 ** rng.int(1, 4) * 3 ** rng.int(0, 2) * 5 ** rng.int(0, 2) * rng.pick([1, 7]);
      const fl = flat(n);
      const qs: number[] = [];
      let q = n;
      for (const p of fl) { q /= p; qs.push(q); }
      const zones = fl.map((p, i) => `$${T(i === 0 ? n : qs[i - 1])} \\div ${p} =$`);
      const tokens = rng.shuffle(qs.map((x) => `$${T(x)}$`));
      return {
        statement: `On décompose $${T(n)}$ par divisions successives. Dépose le bon quotient en face de chaque division.`,
        parts: [{ interaction: { kind: "glisser-deposer", zones, tokens, answer: qs.map((x) => tokens.indexOf(`$${T(x)}$`)) } }],
        solution: [...fl.map((p, i) => `$${T(i === 0 ? n : qs[i - 1])} \\div ${p} = ${T(qs[i])}$`), `Les diviseurs utilisés donnent la décomposition : $${T(n)} = ${fTex(n)}$.`],
      };
    },
    reasoning: "Chaque quotient devient le dividende de la ligne suivante ; on s'arrête quand on obtient $1$.",
    hints: ["Commence par la première ligne : divise le nombre de départ.", "Le résultat d'une ligne est le nombre que l'on divise à la ligne suivante."],
  }),
  // ── Niveau 3 : Entraînement ──
  ex({
    id: "ari3-15", title: "Simplifier grâce aux décompositions", niveau: 3, objectives: ["M3-NC-02", "M3-NC-01"], time: 120,
    vary: (rng) => {
      let c = 0, p = 0, q = 0;
      do {
        c = rng.pick([2, 3, 5]) * rng.pick([2, 3, 7]) * rng.pick([1, 2, 3]);
        [p, q] = coprimePair(rng, 2, 25);
      } while (c * p > 1500 || c * q > 1500 || flat(c * p).length < 3 || flat(c * q).length < 3);
      const a = c * p, b = c * q;
      return {
        statement: `On donne $A = ${T(a)} = ${fTex(a)}$ et $B = ${T(b)} = ${fTex(b)}$. Écris $\\dfrac{A}{B}$ sous forme irréductible.`,
        parts: [fracAns(a, b, [{ match: `${q}/${p}`, feedback: "Tu as inversé le numérateur et le dénominateur." }])],
        solution: [`$\\dfrac{A}{B} = \\dfrac{${flat(a).join(" \\times ")}}{${flat(b).join(" \\times ")}}$.`, `On simplifie par les facteurs communs : $${flat(c).join(" \\times ")} = ${c}$.`, `$\\dfrac{A}{B} = ${frac(p, q)}$ : plus aucun facteur premier commun, la fraction est irréductible.`],
      };
    },
    reasoning: "Écrire numérateur et dénominateur en produits de facteurs premiers permet de voir tous les facteurs communs d'un coup.",
    hints: ["Écris la fraction avec les deux décompositions.", "Barre les facteurs premiers présents en haut et en bas."],
  }),
  ex({
    id: "ari3-16", title: "Décomposer un grand nombre", niveau: 3, objectives: ["M3-NC-01"], time: 150,
    vary: (rng) => {
      let n = 0, e: number[] = [];
      while (n < 1000 || n > 60000 || e[4] + e[5] === 0 || e.filter((x) => x > 0).length < 3) {
        e = [rng.int(0, 3), rng.int(0, 2), rng.int(0, 2), rng.int(0, 1), rng.int(0, 1), rng.int(0, 1)];
        n = 2 ** e[0] * 3 ** e[1] * 5 ** e[2] * 7 ** e[3] * 11 ** e[4] * 13 ** e[5];
      }
      return {
        statement: `Décompose $N = ${T(n)}$ en produit de facteurs premiers en complétant le tableau des exposants ($0$ si le facteur n'apparaît pas).`,
        parts: [{ interaction: { kind: "tableau", headers: ["Facteur premier", "$2$", "$3$", "$5$", "$7$", "$11$", "$13$"], rows: [{ label: "Exposant", cells: e.map((v) => ({ answer: { value: v } })) }] } }],
        solution: [`Divisions successives : ${flat(n).reduce<{ q: number; s: string[] }>((acc, p) => ({ q: acc.q / p, s: [...acc.s, `$${T(acc.q)} \\div ${p} = ${T(acc.q / p)}$`] }), { q: n, s: [] }).s.join(" ; ")}.`, `$${T(n)} = ${fTex(n)}$.`],
      };
    },
    reasoning: "On procède toujours dans l'ordre des nombres premiers ; on vérifie à la fin que le produit redonne bien $N$.",
    hints: ["Commence par $2$, $3$ et $5$ avec les critères de divisibilité.", "Quand le quotient devient petit, teste $7$, $11$ et $13$."],
  }),
  ex({
    id: "ari3-17", title: "Remettre la décomposition dans l'ordre", niveau: 3, objectives: ["M3-NC-01"], time: 120,
    vary: (rng) => {
      let n = 0;
      while (n < 100 || n > 3000 || flat(n).length < 4 || flat(n).length > 5) n = 2 ** rng.int(1, 3) * 3 ** rng.int(0, 2) * 5 ** rng.int(0, 1) * rng.pick([1, 7, 11]);
      const fl = flat(n);
      const lines: string[] = [];
      let q = n;
      for (const p of fl) { lines.push(`$${T(q)} = ${p} \\times ${T(q / p)}$`); q /= p; }
      lines.push(`$${T(n)} = ${fTex(n)}$`);
      const items = rng.shuffle(lines);
      return {
        statement: `Remets dans l'ordre les étapes de la décomposition de $${T(n)}$ en produit de facteurs premiers.`,
        parts: [{ interaction: { kind: "ordonner", items, answer: lines.map((l) => items.indexOf(l)), hint: "Première étape en haut, conclusion en bas" } }],
        solution: [...lines.slice(0, -1), `Conclusion : ${lines[lines.length - 1]}.`],
      };
    },
    reasoning: "Chaque étape décompose le quotient obtenu à l'étape précédente ; la conclusion regroupe les facteurs avec des puissances.",
    hints: ["La première étape commence par le nombre de départ.", "Chaque ligne commence par le quotient de la ligne précédente."],
  }),
  ex({
    id: "ari3-18", title: "Somme de fractions à simplifier", niveau: 3, objectives: ["M3-NC-02"], time: 120,
    vary: (rng) => {
      let b = 0, d = 0, a = 0, c = 0;
      do {
        b = rng.pick([4, 6, 8, 9, 10, 12, 14, 15, 18, 20]); d = rng.pick([4, 6, 8, 9, 10, 12, 14, 15, 18, 20]);
        a = rng.int(1, b - 1); c = rng.int(1, d - 1);
      } while (b === d || gcd(b, d) === 1 || gcd(a, b) !== 1 || gcd(c, d) !== 1);
      const den = lcm(b, d), nu = a * (den / b) + c * (den / d);
      const [p, q] = simplify(nu, den);
      return {
        statement: `Calcule $${frac(a, b)} + ${frac(c, d)}$ et donne le résultat sous forme irréductible.`,
        parts: [fracAns(nu, den, [{ match: `${a + c}/${b + d}`, feedback: "On n'additionne pas les dénominateurs : il faut d'abord mettre les fractions au même dénominateur." }])],
        solution: [`Dénominateur commun : le plus petit multiple commun à $${b}$ et $${d}$, soit $${den}$.`, `$${frac(a, b)} + ${frac(c, d)} = ${frac(a * (den / b), den)} + ${frac(c * (den / d), den)} = ${frac(nu, den)}$.`, gcd(nu, den) > 1 ? `On simplifie par $${gcd(nu, den)}$ : $${frac(nu, den)} = ${frac(p, q)}$.` : `$${frac(nu, den)}$ est déjà irréductible.`],
      };
    },
    reasoning: "Prendre le plus petit multiple commun des dénominateurs limite la taille des nombres ; on termine toujours par une simplification.",
    hints: ["Cherche un multiple commun aux deux dénominateurs.", "Après l'addition, cherche un diviseur commun au numérateur et au dénominateur."],
  }),
  ex({
    id: "ari3-19", title: "Les diviseurs communs", niveau: 3, objectives: ["M3-NC-03"], time: 120,
    vary: (rng) => {
      const g = rng.pick([6, 8, 9, 10, 12, 14, 15]);
      let p = 0, q = 0;
      do { [p, q] = coprimePair(rng, 2, 7); } while (p === 1 || q === 1);
      const a = g * p, b = g * q;
      const common = divisors(g);
      const distract = rng.shuffle([...divisors(a), ...divisors(b)].filter((x) => !common.includes(x) && x < 100)).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 3);
      const opts = [...common, ...distract].sort((x, y) => x - y);
      return {
        statement: `Coche **tous** les diviseurs communs à $${a}$ et $${b}$.`,
        parts: [{ interaction: { kind: "qcm", multiple: true, options: opts.map((x) => `$${x}$`), answer: opts.map((x, i) => (common.includes(x) ? i : -1)).filter((i) => i >= 0) } }],
        solution: [`Le plus grand diviseur commun à $${a}$ et $${b}$ est $${g}$ ($${a} = ${g} \\times ${p}$, $${b} = ${g} \\times ${q}$).`, `Les diviseurs communs sont exactement les diviseurs de $${g}$ : ${common.map((x) => `$${x}$`).join(" ; ")}.`, ...distract.map((x) => `$${x}$ ne divise pas ${a % x === 0 ? `$${b}$` : `$${a}$`}.`)],
      };
    },
    reasoning: "Les diviseurs communs à deux nombres sont les diviseurs de leur plus grand diviseur commun.",
    hints: ["$1$ est toujours un diviseur commun.", "Cherche le plus grand diviseur commun, puis tous ses diviseurs."],
  }),
  ex({
    id: "ari3-20", title: "Idées reçues sur les nombres premiers", niveau: 3, objectives: ["M4-NC-12", "M3-NC-01"], time: 120,
    statement: "Vrai ou faux ?",
    parts: [{ interaction: { kind: "vrai-faux", items: ["Tout nombre premier est impair.", "$1$ est un nombre premier.", "Un nombre premier a exactement deux diviseurs.", "La somme de deux nombres premiers est toujours paire.", "$91$ est un nombre premier.", "Le produit de deux nombres premiers n'est jamais premier."], answer: [false, false, true, false, false, true] } }],
    solution: ["Faux : $2$ est premier et pair.", "Faux : $1$ n'a qu'un seul diviseur.", "Vrai : c'est la définition ($1$ et lui-même, distincts).", "Faux : $2 + 3 = 5$ est impair.", "Faux : $91 = 7 \\times 13$.", "Vrai : $p \\times q$ est divisible par $p$, qui n'est ni $1$ ni $p \\times q$."],
    reasoning: "Un seul contre-exemple suffit pour prouver qu'une affirmation générale est fausse.",
    hints: ["Pense au nombre premier $2$.", "Essaie de diviser $91$ par $7$."],
  }),
  ex({
    id: "ari3-21", title: "Produit de fractions simplifié", niveau: 3, objectives: ["M3-NC-02"], time: 120,
    vary: (rng) => {
      let a = 0, b = 0, c = 0, d = 0;
      do { a = rng.int(2, 15); b = rng.int(2, 21); c = rng.int(2, 21); d = rng.int(2, 15); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || gcd(a * c, b * d) === 1 || a * c === b * d);
      const [p, q] = simplify(a * c, b * d);
      return {
        statement: `Calcule $${frac(a, b)} \\times ${frac(c, d)}$ et donne le résultat sous forme irréductible.`,
        parts: [fracAns(a * c, b * d)],
        solution: [`$${frac(a, b)} \\times ${frac(c, d)} = \\dfrac{${a} \\times ${c}}{${b} \\times ${d}}$.`, `On simplifie avant de calculer : ${gcd(a, d) > 1 ? `$${a}$ et $${d}$ ont le facteur commun $${gcd(a, d)}$ ; ` : ""}${gcd(c, b) > 1 ? `$${c}$ et $${b}$ ont le facteur commun $${gcd(c, b)}$ ; ` : ""}on obtient $${frac(p, q)}$.`],
      };
    },
    reasoning: "Simplifier en croisant (numérateur de l'une avec dénominateur de l'autre) avant de multiplier évite les grands nombres.",
    hints: ["Écris le produit sur une seule barre de fraction sans calculer.", "Cherche un facteur commun entre un numérateur et un dénominateur."],
  }),
  ex({
    id: "ari3-22", title: "Ce nombre est-il premier ?", niveau: 3, objectives: ["M4-NC-12", "M3-NC-01"], time: 150,
    vary: (rng) => {
      let p = 0, q = 0;
      do { p = rng.pick([7, 11, 13, 17, 19, 23]); q = rng.pick([11, 13, 17, 19, 23, 29, 31]); } while (q <= p || p * q > 900);
      const n = p * q, r = Math.floor(Math.sqrt(n));
      return {
        statement: `On veut savoir si $${n}$ est premier. On sait que $${r}^2 = ${r * r}$ et $${r + 1}^2 = ${(r + 1) * (r + 1)}$.`,
        parts: [{ interaction: { kind: "texte-trous", template: `Le plus petit nombre premier qui divise $${n}$ est [[0]].\n$${n} =$ ce nombre $\\times$ [[1]].\nDonc $${n}$ [[2]] un nombre premier.`, blanks: [{ type: "number", answer: { value: p } }, { type: "number", answer: { value: q } }, { type: "select", options: ["est", "n'est pas"], answer: 1 }] } }],
        solution: [`Il suffit de tester les nombres premiers $p$ tels que $p^2 \\leqslant ${n}$, donc jusqu'à $${r}$.`, `$${n}$ n'est divisible ni par $2$, ni par $3$, ni par $5$${p > 7 ? ", ni par $7$" : ""}${p > 11 ? ", ni par $11$" : ""}${p > 13 ? ", ni par $13$" : ""}${p > 17 ? ", ni par $17$" : ""}${p > 19 ? ", ni par $19$" : ""}.`, `$${n} = ${p} \\times ${q}$ : $${n}$ n'est pas premier.`],
      };
    },
    reasoning: "Si $n$ n'est pas premier, il a un diviseur premier $p$ avec $p^2 \\leqslant n$ ; on teste donc les nombres premiers dans l'ordre jusqu'à $\\sqrt{n}$.",
    hints: ["Teste $2$, $3$, $5$, $7$, $11$, $13$… dans l'ordre.", "Arrête-toi dès qu'une division tombe juste."],
  }),
  // ── Niveau 4 : Problèmes ──
  ex({
    id: "ari3-23", title: "Les bouquets identiques", niveau: 4, objectives: ["M3-NC-03"], time: 180,
    vary: (rng) => {
      const g = rng.int(6, 20);
      const [p, q] = coprimePair(rng, 2, 9);
      const a = g * p, b = g * q;
      return {
        statement: `Une fleuriste dispose de $${a}$ roses et de $${b}$ tulipes. Elle veut composer le **plus grand nombre** de bouquets **identiques** en utilisant toutes les fleurs.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Nombre maximal de bouquets", answer: { value: g } }, { prompt: "Nombre de roses par bouquet", answer: { value: p } }, { prompt: "Nombre de tulipes par bouquet", answer: { value: q } }] } }],
        solution: [`Le nombre de bouquets doit diviser $${a}$ et $${b}$ : c'est un diviseur commun.`, `$${a} = ${fTex(a)}$ et $${b} = ${fTex(b)}$ ; le plus grand diviseur commun est $${g}$.`, `Chaque bouquet contient $${a} \\div ${g} = ${p}$ roses et $${b} \\div ${g} = ${q}$ tulipes.`],
      };
    },
    reasoning: "« Répartir sans reste en le plus grand nombre de parts identiques » : on cherche le plus grand diviseur commun.",
    hints: ["Le nombre de bouquets doit diviser le nombre de roses et le nombre de tulipes.", "Cherche le plus grand de ces diviseurs communs."],
  }),
  ex({
    id: "ari3-24", title: "Carreler sans découpe", niveau: 4, objectives: ["M3-NC-03"], time: 180,
    vary: (rng) => {
      const g = rng.pick([15, 20, 25, 30, 40, 45, 50, 60]);
      let p = 0, q = 0;
      do { [p, q] = coprimePair(rng, 2, 7); } while (p <= q);
      const L = g * p, l = g * q;
      return {
        statement: `Une pièce rectangulaire mesure $${L}$ cm sur $${l}$ cm. On veut la recouvrir de carreaux **carrés**, tous identiques, **les plus grands possible**, sans découpe ni espace.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Côté d'un carreau (en cm)", answer: { value: g } }, { prompt: "Nombre de carreaux nécessaires", answer: { value: p * q } }] } }],
        solution: [`Le côté du carreau doit diviser $${L}$ et $${l}$ : c'est un diviseur commun ; on veut le plus grand.`, `$${L} = ${fTex(L)}$ et $${l} = ${fTex(l)}$ : le plus grand diviseur commun est $${g}$ cm.`, `On place $${L} \\div ${g} = ${p}$ carreaux en longueur et $${l} \\div ${g} = ${q}$ en largeur, soit $${p} \\times ${q} = ${p * q}$ carreaux.`],
      };
    },
    reasoning: "Sans découpe, le côté doit tenir un nombre entier de fois dans chaque dimension : c'est un diviseur commun aux deux longueurs.",
    hints: ["Le côté d'un carreau doit diviser la longueur et la largeur.", "Nombre de carreaux = (carreaux en longueur) × (carreaux en largeur)."],
  }),
  ex({
    id: "ari3-25", title: "Deux phares", niveau: 4, objectives: ["M3-NC-03"], time: 120,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.int(4, 20); b = rng.int(4, 20); } while (a >= b || gcd(a, b) === 1 || b % a === 0 || lcm(a, b) > 180);
      const m = lcm(a, b);
      return {
        statement: `Un phare émet un éclair toutes les $${a}$ secondes, un autre toutes les $${b}$ secondes. Ils viennent d'émettre un éclair en même temps. Dans combien de secondes le feront-ils de nouveau ensemble pour la première fois ?`,
        parts: [num(m, [{ match: String(a * b), feedback: `$${a * b}$ s convient, mais ce n'est pas la **première** fois : ${a} et ${b} ont un facteur commun.` }, { match: String(gcd(a, b)), feedback: "Ceci est un diviseur commun ; il faut un multiple commun (une durée plus longue que chacune des deux)." }])],
        solution: [`Le premier phare brille à $${a}$, $${2 * a}$, $${3 * a}$… secondes : aux multiples de $${a}$. Le second aux multiples de $${b}$.`, `On cherche le plus petit multiple commun non nul : $${a} = ${fTex(a)}$, $${b} = ${fTex(b)}$, d'où $${fTex(m)} = ${m}$.`, `Ils brilleront ensemble dans $${m}$ secondes.`],
      };
    },
    reasoning: "« De nouveau en même temps » : on cherche le plus petit multiple commun des deux périodes.",
    hints: ["Écris les instants des éclairs de chaque phare.", "Cherche le premier instant commun aux deux listes."],
  }),
  ex({
    id: "ari3-26", title: "Engrenages", niveau: 4, objectives: ["M3-NC-03"], time: 180,
    vary: (rng) => {
      let n = 0, m = 0;
      do { n = rng.int(12, 60); m = rng.int(12, 60); } while (n >= m || gcd(n, m) === 1 || m % n === 0 || lcm(n, m) > 600);
      const L = lcm(n, m);
      return {
        statement: `Deux roues dentées s'engrènent : la petite a $${n}$ dents, la grande $${m}$. On marque d'un point rouge les deux dents en contact. On fait tourner les roues jusqu'à ce que les deux points rouges se retrouvent en contact pour la première fois.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Nombre de dents passées au point de contact", answer: { value: L } }, { prompt: "Nombre de tours de la petite roue", answer: { value: L / n } }, { prompt: "Nombre de tours de la grande roue", answer: { value: L / m } }] } }],
        solution: [`Après $k$ tours, la petite roue a fait passer $${n}k$ dents : un multiple de $${n}$. De même, la grande fait passer un multiple de $${m}$.`, `Le premier nombre commun est le plus petit multiple commun : $${n} = ${fTex(n)}$, $${m} = ${fTex(m)}$, d'où $${L}$ dents.`, `Petite roue : $${L} \\div ${n} = ${L / n}$ tours ; grande roue : $${L} \\div ${m} = ${L / m}$ tours.`],
      };
    },
    reasoning: "Les deux roues font passer le même nombre de dents ; il doit être un multiple du nombre de dents de chaque roue.",
    hints: ["Combien de dents passent quand la petite roue fait un tour ? deux tours ?", "Cherche le plus petit nombre de dents qui correspond à un nombre entier de tours pour les deux roues."],
  }),
  ex({
    id: "ari3-27", title: "Deux lignes de bus", niveau: 4, objectives: ["M3-NC-03"], time: 180,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.pick([8, 10, 12, 14, 15, 18, 20, 24, 25, 30]); b = rng.pick([8, 10, 12, 14, 15, 18, 20, 24, 25, 30]); } while (a >= b || gcd(a, b) === 1 || b % a === 0 || lcm(a, b) > 180);
      const m = lcm(a, b), H = rng.int(6, 8), t = H * 60 + m;
      return {
        statement: `Au terminus, un bus de la ligne 1 part toutes les $${a}$ min et un bus de la ligne 2 toutes les $${b}$ min. Deux bus partent ensemble à $${H}$ h $00$.`,
        parts: [num(m, [{ match: String(a * b), feedback: `$${a * b}$ min est un multiple commun, mais pas le plus petit.` }], "Dans combien de minutes deux bus repartiront-ils ensemble pour la première fois ?"), { prompt: "À quelle heure ?", interaction: { kind: "texte-trous", template: "[[0]] h [[1]] min", blanks: [{ type: "number", answer: { value: Math.floor(t / 60) } }, { type: "number", answer: { value: t % 60 } }] } }],
        solution: [`Les départs ont lieu aux multiples de $${a}$ min et aux multiples de $${b}$ min après $${H}$ h.`, `$${a} = ${fTex(a)}$, $${b} = ${fTex(b)}$ : le plus petit multiple commun est $${m}$ min.`, `$${m}$ min $= ${Math.floor(m / 60)}$ h $${m % 60}$ min, donc les bus repartent ensemble à $${Math.floor(t / 60)}$ h $${t % 60}$ min.`],
      };
    },
    reasoning: "On cherche le plus petit multiple commun des deux intervalles, puis on l'ajoute à l'heure de départ.",
    hints: ["Écris les minutes de départ de chaque ligne.", "Pour l'heure : $60$ minutes font $1$ heure."],
  }),
  ex({
    id: "ari3-28", title: "Le nombre de choristes", niveau: 4, objectives: ["M3-NC-03"], time: 180,
    vary: (rng) => {
      let a = 0, b = 0;
      do { a = rng.pick([6, 8, 9, 10, 12, 15]); b = rng.pick([6, 8, 9, 10, 12, 15, 18]); } while (a >= b || b % a === 0);
      const L = lcm(a, b), k = rng.int(3, 7), m = k * L;
      const lo = m - rng.int(1, L - 1), hi = m + rng.int(1, L - 1);
      return {
        statement: `Une chorale compte entre $${lo}$ et $${hi}$ choristes. On peut les ranger par rangées de $${a}$ ou par rangées de $${b}$ sans qu'il reste personne. Combien y a-t-il de choristes ?`,
        parts: [num(m, [{ match: String(L), feedback: `$${L}$ est bien un multiple commun, mais il n'est pas compris entre $${lo}$ et $${hi}$.` }])],
        solution: [`Le nombre de choristes est un multiple commun de $${a}$ et $${b}$, donc un multiple de leur plus petit multiple commun $${L}$.`, `Multiples de $${L}$ : ${Array.from({ length: k + 1 }, (_, i) => `$${(i + 1) * L}$`).join(" ; ")}…`, `Le seul compris entre $${lo}$ et $${hi}$ est $${m}$.`],
      };
    },
    reasoning: "Les multiples communs à deux nombres sont les multiples de leur plus petit multiple commun ; l'encadrement permet de choisir le bon.",
    hints: ["Le nombre est divisible par $a$ et par $b$.", "Liste les multiples du plus petit multiple commun et regarde l'encadrement."],
  }),
  ex({
    id: "ari3-29", title: "Quelle fraction des élèves ?", niveau: 4, objectives: ["M3-NC-02"], time: 120,
    vary: (rng) => {
      let g = 0, p = 0, q = 0;
      do { g = rng.int(2, 12); [p, q] = coprimePair(rng, 1, 12); } while (p >= q || g * q < 60 || g * q > 400);
      const tot = g * q, part = g * p;
      const act = rng.pick(["pratiquent un sport en club", "sont demi-pensionnaires", "viennent au collège à vélo", "font partie de la chorale"]);
      return {
        statement: `Dans un collège de $${tot}$ élèves, $${part}$ ${act}. Quelle fraction des élèves cela représente-t-il ? Donne-la sous forme irréductible.`,
        parts: [fracAns(part, tot, [{ match: `${tot}/${part}`, feedback: "La fraction est (partie) ÷ (total) : le total est au dénominateur." }])],
        solution: [`Fraction : $${frac(part, tot)}$.`, `Plus grand diviseur commun à $${part}$ et $${tot}$ : $${g}$.`, `$${frac(part, tot)} = ${frac(p, q)}$ : ${p === 1 ? "un" : T(p)} élève${p > 1 ? "s" : ""} sur $${q}$.`],
      };
    },
    reasoning: "La fraction irréductible donne la proportion la plus lisible : « $p$ élèves sur $q$ ».",
    hints: ["Écris la fraction partie / total.", "Simplifie-la jusqu'à ce qu'elle soit irréductible."],
  }),
  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "ari3-30", title: "Brevet — Les boîtes du chocolatier", niveau: 5, objectives: ["M3-NC-01", "M3-NC-03"], time: 300,
    vary: (rng) => {
      let g = 0, p = 0, q = 0, a = 0;
      do {
        g = rng.pick([12, 14, 15, 18, 20, 21, 24, 28, 30]);
        [p, q] = coprimePair(rng, 3, 13);
        a = g * p;
      } while (a > 400 || g * q > 400 || flat(a).length < 4 || factors(a).length < 2);
      const b = g * q;
      const w = wrongDecompositions(a);
      return {
        statement: `Un chocolatier a fabriqué $${a}$ truffes et $${b}$ pralines. Il veut répartir **toutes** ses confiseries dans des boîtes **identiques** (même nombre de truffes et même nombre de pralines dans chaque boîte), en préparant le **plus grand nombre** de boîtes possible.`,
        parts: [
          shuffledQcm(rng, [`$${fTex(a)}$`, `$${w.composite}$`, `$${w.exponent}$`, `$${w.missing}$`], 0, { 1: `$${w.compositeFactor}$ n'est pas premier.`, 2: "Ce produit ne redonne pas le nombre de truffes.", 3: "Il manque un facteur : recalcule le produit." }, `1. Décomposer $${a}$ en produit de facteurs premiers.`),
          num(g, [{ match: String(flat(g)[0]), feedback: "Ce nombre de boîtes est possible, mais ce n'est pas le plus grand." }], `2. On donne $${b} = ${fTex(b)}$. Combien de boîtes au maximum ?`),
          num(p, [], "3. Combien de truffes par boîte ?"),
          num(q, [], "4. Combien de pralines par boîte ?"),
        ],
        solution: [`1. $${a} = ${fTex(a)}$.`, `2. Le nombre de boîtes divise $${a}$ et $${b}$. Facteurs communs : $${fTex(g)} = ${g}$. Il y aura au maximum $${g}$ boîtes.`, `3. $${a} \\div ${g} = ${p}$ truffes par boîte.`, `4. $${b} \\div ${g} = ${q}$ pralines par boîte.`],
      };
    },
    reasoning: "Rédaction attendue : identifier que le nombre de boîtes est un diviseur commun, justifier qu'on prend le plus grand, puis conclure par une phrase.",
    hints: ["Divise $a$ par $2$, $3$, $5$, $7$… autant de fois que possible.", "Le nombre de boîtes doit diviser les deux quantités.", "Prends les facteurs premiers communs aux deux décompositions."],
  }),
  ex({
    id: "ari3-31", title: "Brevet — Vrai ou faux justifié", niveau: 5, objectives: ["M3-NC-01", "M3-NC-02"], time: 240,
    statement: "Pour chaque affirmation, indique si elle est vraie ou fausse. (À l'écrit, chaque réponse doit être justifiée.)",
    parts: [{ interaction: { kind: "vrai-faux", items: ["$2^{3} \\times 3 \\times 7$ est la décomposition en produit de facteurs premiers de $168$.", "La fraction $\\dfrac{126}{210}$ est irréductible.", "$\\dfrac{126}{210} = \\dfrac{3}{5}$.", "$2^{2} \\times 15$ est une décomposition en produit de facteurs premiers.", "$221$ est un nombre premier.", "Un nombre divisible par $4$ et par $6$ est toujours divisible par $24$."], answer: [true, false, true, false, false, false] } }],
    solution: ["Vrai : $2^{3} \\times 3 \\times 7 = 8 \\times 21 = 168$ et $2$, $3$, $7$ sont premiers.", "Faux : $126$ et $210$ sont pairs.", "Vrai : $126 = 2 \\times 3^{2} \\times 7$ et $210 = 2 \\times 3 \\times 5 \\times 7$ ; on simplifie par $2 \\times 3 \\times 7 = 42$ : $\\dfrac{3}{5}$.", "Faux : $15 = 3 \\times 5$ n'est pas premier ; la décomposition est $2^{2} \\times 3 \\times 5$.", "Faux : $221 = 13 \\times 17$.", "Faux : $12$ est divisible par $4$ et par $6$ mais pas par $24$ (le plus petit multiple commun de $4$ et $6$ est $12$)."],
    reasoning: "Pour prouver « vrai », on calcule ou on cite une propriété ; pour prouver « faux », un contre-exemple suffit.",
    hints: ["Recalcule les produits proposés.", "Pour la dernière, essaie le nombre $12$."],
  }),
  ex({
    id: "ari3-32", title: "Brevet — Deux cyclistes sur une piste", niveau: 5, objectives: ["M3-NC-03"], time: 300,
    vary: (rng) => {
      const g = rng.pick([12, 15, 18, 20, 24, 30]);
      let p = 0, q = 0;
      do { [p, q] = coprimePair(rng, 3, 7); } while (p >= q);
      const a = g * p, b = g * q, m = g * p * q;
      return {
        statement: `Sur une piste, Léa fait un tour en $${a}$ secondes et Hugo en $${b}$ secondes, à vitesse constante. Ils partent ensemble de la ligne de départ. Au bout de combien de temps repasseront-ils **ensemble** sur la ligne de départ pour la première fois ?`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Durée (en secondes)", answer: { value: m } }, { prompt: "Nombre de tours effectués par Léa", answer: { value: q } }, { prompt: "Nombre de tours effectués par Hugo", answer: { value: p } }] } }],
        solution: [`Léa passe sur la ligne aux multiples de $${a}$ s, Hugo aux multiples de $${b}$ s.`, `$${a} = ${fTex(a)}$ et $${b} = ${fTex(b)}$ ; plus petit multiple commun : $${fTex(m)} = ${m}$ s, soit $${Math.floor(m / 60)}$ min $${m % 60}$ s.`, `Léa a fait $${m} \\div ${a} = ${q}$ tours et Hugo $${m} \\div ${b} = ${p}$ tours.`],
      };
    },
    reasoning: "Le plus rapide fait plus de tours : contrôle utile pour vérifier qu'on n'a pas inversé les deux résultats.",
    hints: ["Les instants de passage de chacun sont des multiples de son temps au tour.", "Nombre de tours = durée ÷ temps d'un tour."],
  }),
  ex({
    id: "ari3-33", title: "Brevet — Avec un logiciel de calcul", niveau: 5, objectives: ["M3-NC-01", "M3-NC-02"], time: 240,
    vary: (rng) => {
      let c = 0, p = 0, q = 0;
      do {
        c = rng.pick([2, 4, 8]) * rng.pick([3, 9]) * rng.pick([1, 5, 7, 11]);
        [p, q] = coprimePair(rng, 5, 60);
      } while (c * p > 20000 || c * q > 20000 || c * p < 1000);
      const a = c * p, b = c * q;
      return {
        statement: `Un logiciel de calcul formel affiche : « factoriser(${a}) → $${fTex(a)}$ » et « factoriser(${b}) → $${fTex(b)}$ ».`,
        parts: [
          num(c, [{ match: String(flat(c)[0]), feedback: "C'est un diviseur commun, mais pas le plus grand : prends **tous** les facteurs communs." }], `1. Quel est le plus grand diviseur commun à $${T(a)}$ et $${T(b)}$ ?`),
          fracAns(a, b, [{ match: `${q}/${p}`, feedback: "Tu as inversé le numérateur et le dénominateur." }], `2. Écris $${frac(a, b)}$ sous forme irréductible.`),
        ],
        solution: [`Facteurs communs avec le plus petit exposant : $${fTex(c)} = ${c}$.`, `$${T(a)} \\div ${c} = ${p}$ et $${T(b)} \\div ${c} = ${q}$.`, `$${frac(a, b)} = ${frac(p, q)}$, irréductible car le plus grand diviseur commun a été utilisé.`],
      };
    },
    reasoning: "Les décompositions données par l'outil numérique permettent de lire directement le plus grand diviseur commun.",
    hints: ["Repère les facteurs premiers présents dans les deux décompositions.", "Pour chacun, garde le plus petit exposant."],
  }),
  ex({
    id: "ari3-34", title: "Brevet — Démontrer une propriété", niveau: 5, objectives: ["M3-NC-03"], time: 180,
    statement: "On veut démontrer que **la somme de trois entiers consécutifs est toujours un multiple de 3**. Remets les étapes de la démonstration dans l'ordre.",
    parts: [{ interaction: { kind: "ordonner", items: ["Leur somme est $n + (n + 1) + (n + 2)$.", "Comme $n + 1$ est un entier, la somme est un multiple de $3$.", "Soit $n$ un entier : trois entiers consécutifs s'écrivent $n$, $n + 1$ et $n + 2$.", "Cette somme vaut $3n + 3$, c'est-à-dire $3(n + 1)$."], answer: [2, 0, 3, 1], hint: "Première étape en haut" } }],
    solution: ["Soit $n$ un entier : les trois entiers consécutifs sont $n$, $n + 1$ et $n + 2$.", "Leur somme est $n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1)$.", "$n + 1$ est un entier, donc la somme est un multiple de $3$.", "Vérifier sur un exemple ($4 + 5 + 6 = 15$) ne suffit pas : il faut le calcul littéral pour couvrir **tous** les cas."],
    reasoning: "Une démonstration commence par nommer un entier quelconque, calcule avec des lettres, puis conclut grâce à la définition d'un multiple.",
    hints: ["Une démonstration commence par « Soit… ».", "Un multiple de $3$ s'écrit $3 \\times k$ avec $k$ entier."],
  }),
  ex({
    id: "ari3-35", title: "Brevet — Planter des arbres autour d'un terrain", niveau: 5, objectives: ["M3-NC-03"], time: 300,
    vary: (rng) => {
      const g = rng.pick([3, 4, 5, 6, 8, 10, 12]);
      let p = 0, q = 0;
      do { [p, q] = coprimePair(rng, 3, 11); } while (p <= q);
      const L = g * p, l = g * q;
      return {
        statement: `Un terrain rectangulaire mesure $${L}$ m sur $${l}$ m. On plante des arbres sur son pourtour : un arbre à chaque coin, et tous les arbres régulièrement espacés d'un **nombre entier** de mètres, l'écartement étant **le plus grand possible**.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Écartement entre deux arbres (en m)", answer: { value: g } }, { prompt: "Périmètre du terrain (en m)", answer: { value: 2 * (L + l) } }, { prompt: "Nombre d'arbres plantés", answer: { value: 2 * (p + q) } }] } }],
        solution: [`L'écartement doit diviser $${L}$ et $${l}$ (un arbre à chaque coin) : on cherche le plus grand diviseur commun, $${g}$ m.`, `Périmètre : $2 \\times (${L} + ${l}) = ${2 * (L + l)}$ m.`, `Sur un tour fermé, il y a autant d'arbres que d'intervalles : $${2 * (L + l)} \\div ${g} = ${2 * (p + q)}$ arbres.`],
      };
    },
    reasoning: "Sur un contour fermé, le nombre d'arbres est égal au nombre d'intervalles (pas « +1 » comme sur une ligne ouverte).",
    hints: ["Avec un arbre à chaque coin, l'écartement divise la longueur et la largeur.", "Sur un contour fermé : nombre d'arbres = périmètre ÷ écartement."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const ladder = (() => {
  const rows: [number, number][] = [[360, 2], [180, 2], [90, 2], [45, 3], [15, 3], [5, 5]];
  let s = `<line x1="120" y1="20" x2="120" y2="${20 + 7 * 30}" stroke="#334155" stroke-width="2"/>`;
  rows.forEach(([n, p], i) => {
    const y = 42 + i * 30;
    s += `<text x="108" y="${y}" font-size="17" text-anchor="end" fill="#0f172a">${n}</text><text x="134" y="${y}" font-size="17" fill="#4f46e5" font-weight="700">${p}</text>`;
  });
  s += `<text x="108" y="${42 + 6 * 30}" font-size="17" text-anchor="end" fill="#0f172a">1</text>`;
  s += `<text x="180" y="105" font-size="13" fill="#475569">diviseurs</text><text x="180" y="122" font-size="13" fill="#475569">premiers</text><text x="180" y="139" font-size="13" fill="#475569">utilisés</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 240" role="img" aria-label="Décomposition de 360 par divisions successives" style="width:100%;max-width:280px;height:auto;font-family:Inter,Arial,sans-serif">${s}</svg>`;
})();

const timeline = (() => {
  const X = (t: number) => 30 + t * 15;
  let s = `<line x1="${X(0)}" y1="110" x2="${X(25)}" y2="110" stroke="#334155" stroke-width="1.5"/>`;
  for (let t = 0; t <= 24; t += 2) s += `<line x1="${X(t)}" y1="106" x2="${X(t)}" y2="114" stroke="#334155"/><text x="${X(t)}" y="130" font-size="11" text-anchor="middle" fill="#334155">${t}</text>`;
  s += `<text x="${X(25)}" y="130" font-size="11" fill="#334155">t (s)</text>`;
  for (const t of [0, 12, 24]) s += `<rect x="${X(t) - 9}" y="20" width="18" height="78" rx="6" fill="#fef3c7"/>`;
  for (let t = 0; t <= 24; t += 4) s += `<circle cx="${X(t)}" cy="40" r="6" fill="#f59e0b"/>`;
  for (let t = 0; t <= 24; t += 6) s += `<circle cx="${X(t)}" cy="78" r="6" fill="#4f46e5"/>`;
  s += `<text x="${X(0)}" y="14" font-size="12" fill="#b45309">Phare A : toutes les 4 s</text><text x="${X(9)}" y="14" font-size="12" fill="#4338ca">Phare B : toutes les 6 s</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 140" role="img" aria-label="Frise des éclairs de deux phares, simultanés à 0, 12 et 24 secondes" style="width:100%;max-width:440px;height:auto;font-family:Inter,Arial,sans-serif">${s}</svg>`;
})();

// ───────────────────────── Chapitre ─────────────────────────
export const math3eArithmetique: ChapterContent = {
  id: "math-3e-arithmetique",
  taskId: "SCI-3E-MATH-001",
  grade: "3e",
  subject: "mathematiques",
  treeChapterId: "m3-arithmetique",
  curriculumChapterIds: ["math-3e-arithmetique", "math-4e-nombres-premiers"],
  curriculumVersion: "2026-2027",
  title: "Arithmétique : nombres premiers, diviseurs et multiples",
  officialObjectives: (Object.keys(O) as Obj[]).map((id) => ({ id, text: O[id], source: id.startsWith("M4") ? SRC_4E : SRC_3E })),
  prerequisites: [
    { text: "Effectuer une division euclidienne ; reconnaître un reste nul (cycle 3)." },
    { text: "Connaître les notions de multiple et de diviseur et les critères de divisibilité par 2, 3, 5, 9 et 10 (5e)." },
    { text: "Connaître la définition d'un nombre premier et les nombres premiers inférieurs à 30 (4e)." },
    { text: "Utiliser les puissances d'exposant entier positif ($2^3 = 2 \\times 2 \\times 2$) (4e)." },
    { text: "Multiplier, additionner des fractions ; reconnaître des fractions égales (4e)." },
  ],
  sources: [
    { id: "S5", title: "Programme de mathématiques du cycle 4 (BO n° 31 du 30 juillet 2020) — page officielle", url: "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm", kind: "official", note: "page BO non récupérable automatiquement (403) ; texte lu dans une reproduction du PDF ministériel (inventaire A1, source S5)" },
    { id: "S6", title: "Repères annuels de progression – cycle 4 – mathématiques (BO n° 22 du 29 mai 2019), copie académique de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_rep%C3%A8res%20annuels%20de%20progression%20cycle%204%20maths.pdf", kind: "official" },
    { id: "S8", title: "Attendus de fin d'année de 3e – mathématiques (2019), copie académique de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_attendus%20de%20fin%20d%27ann%C3%A9e%203%C3%A8me.pdf", kind: "official" },
    { id: "S7", title: "Attendus de fin d'année de 4e – mathématiques (2019), copie académique de Toulouse", url: "https://pedagogie.ac-toulouse.fr/mathematiques/system/files/2026-09/2019_attendus%20de%20fin%20d%27ann%C3%A9e%204%C3%A8me.pdf", kind: "official", note: "prérequis et consolidation (nombres premiers)" },
  ],
  lesson: {
    introduction: "Deux phares s'allument l'un toutes les $4$ secondes, l'autre toutes les $6$ secondes. Quand brilleront-ils de nouveau ensemble ? Une fleuriste veut faire des bouquets identiques avec $84$ roses et $60$ tulipes : combien au maximum ?\nCes questions se résolvent avec l'**arithmétique**, l'étude des nombres entiers et de leurs diviseurs. Son outil principal est la **décomposition en produit de facteurs premiers** : chaque entier y est écrit avec ses « briques » de base, les nombres premiers. Elle sert aussi à rendre une fraction **irréductible**.",
    definitions: [
      { term: "Multiple, diviseur", text: "$a$ et $b$ sont des entiers, $b \\neq 0$. Si la division euclidienne de $a$ par $b$ a un reste nul, c'est-à-dire s'il existe un entier $k$ tel que $a = b \\times k$, on dit que $a$ est un **multiple** de $b$, que $b$ est un **diviseur** de $a$, ou que $a$ est **divisible** par $b$.\nExemple : $42 = 6 \\times 7$, donc $6$ et $7$ sont des diviseurs de $42$ ; $42$ est un multiple de $6$ et de $7$." },
      { term: "Nombre premier", text: "Un **nombre premier** est un entier qui a **exactement deux diviseurs** : $1$ et lui-même.\nLes nombres premiers inférieurs à $50$ sont : $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$, $29$, $31$, $37$, $41$, $43$, $47$.\n$1$ n'est **pas** premier (il n'a qu'un seul diviseur) ; $2$ est le seul nombre premier pair." },
      { term: "Décomposition en produit de facteurs premiers", text: "Décomposer un entier supérieur ou égal à $2$, c'est l'écrire comme un produit de nombres premiers, en regroupant les facteurs égaux avec des puissances.\nExemple : $360 = 2 \\times 2 \\times 2 \\times 3 \\times 3 \\times 5 = 2^{3} \\times 3^{2} \\times 5$." },
      { term: "Diviseur commun, plus grand diviseur commun", text: "Un **diviseur commun** à deux entiers est un nombre qui les divise tous les deux. $1$ en est toujours un. Le plus grand d'entre eux s'appelle le **plus grand diviseur commun** (parfois noté PGCD).\nExemple : les diviseurs communs à $12$ et $18$ sont $1$, $2$, $3$, $6$ ; le plus grand est $6$." },
      { term: "Multiple commun, plus petit multiple commun", text: "Un **multiple commun** à deux entiers non nuls est un nombre qui est multiple de chacun d'eux. Le plus petit multiple commun non nul s'appelle le **plus petit multiple commun** (parfois noté PPCM).\nExemple : multiples de $4$ : $4$, $8$, $12$, $16$, $20$, $24$… ; multiples de $6$ : $6$, $12$, $18$, $24$… Le plus petit multiple commun de $4$ et $6$ est $12$." },
      { term: "Fraction irréductible", text: "Une fraction $\\dfrac{a}{b}$ (avec $a$ et $b$ entiers, $b \\neq 0$) est **irréductible** lorsque $a$ et $b$ n'ont aucun diviseur commun autre que $1$ : on ne peut plus la simplifier.\nExemple : $\\dfrac{2}{3}$ est irréductible ; $\\dfrac{12}{18}$ ne l'est pas ($12$ et $18$ sont divisibles par $6$)." },
    ],
    properties: [
      { title: "Critères de divisibilité", statement: "Un entier est divisible :\n– par $2$ si son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$ ;\n– par $5$ si son chiffre des unités est $0$ ou $5$ ; par $10$ s'il est $0$ ;\n– par $3$ si la somme de ses chiffres est un multiple de $3$ ; par $9$ si elle est un multiple de $9$.", conditions: "Pour $3$ et $9$, c'est la **somme des chiffres** qui compte, pas le dernier chiffre : $13$ n'est pas divisible par $3$." },
      { title: "Existence et unicité de la décomposition", statement: "Tout entier supérieur ou égal à $2$ peut s'écrire comme un produit de nombres premiers, et cette décomposition est **unique** (à l'ordre des facteurs près).", conditions: "Propriété admise au collège. Elle garantit que deux méthodes correctes donnent toujours la même décomposition." },
      { title: "Tester si un nombre est premier", statement: "Si un entier $n \\geqslant 2$ n'est divisible par aucun nombre premier $p$ tel que $p^{2} \\leqslant n$, alors $n$ est premier.\nExemple : pour $97$, on teste $2$, $3$, $5$, $7$ (car $11^{2} = 121 > 97$) : aucun ne divise $97$, donc $97$ est premier." },
      { title: "Diviseurs et multiples communs à partir des décompositions", statement: "– Le plus grand diviseur commun est le produit des facteurs premiers **communs** aux deux décompositions, chacun avec son **plus petit** exposant.\n– Le plus petit multiple commun est le produit de **tous** les facteurs premiers présents, chacun avec son **plus grand** exposant.\nExemple : $84 = 2^{2} \\times 3 \\times 7$ et $60 = 2^{2} \\times 3 \\times 5$ : plus grand diviseur commun $2^{2} \\times 3 = 12$ ; plus petit multiple commun $2^{2} \\times 3 \\times 5 \\times 7 = 420$.", conditions: "Les diviseurs communs à deux nombres sont exactement les diviseurs de leur plus grand diviseur commun ; les multiples communs sont les multiples de leur plus petit multiple commun." },
      { title: "Rendre une fraction irréductible", statement: "En divisant le numérateur et le dénominateur d'une fraction par leur **plus grand diviseur commun**, on obtient une fraction égale et **irréductible**.\nExemple : $\\dfrac{84}{60} = \\dfrac{84 \\div 12}{60 \\div 12} = \\dfrac{7}{5}$.", conditions: "On peut aussi simplifier en plusieurs étapes ; on s'arrête seulement quand il n'y a plus de diviseur commun autre que $1$." },
    ],
    explanations: [
      { title: "1. Multiples et diviseurs : une seule relation", body: "« $6$ divise $42$ », « $42$ est un multiple de $6$ », « $42$ est divisible par $6$ » : trois façons de dire que $42 = 6 \\times 7$. Pour vérifier, on effectue la division euclidienne : le reste doit être nul. Les diviseurs vont par **paires** : $42 = 1 \\times 42 = 2 \\times 21 = 3 \\times 14 = 6 \\times 7$." },
      { title: "2. Les nombres premiers, des « briques »", body: "Un nombre premier ne se décompose pas en produit de nombres plus petits (autres que $1$). Tous les autres entiers $\\geqslant 2$ se fabriquent en multipliant des nombres premiers, comme un mur se construit avec des briques. Pour trouver les nombres premiers inférieurs à $100$, on peut utiliser le **crible d'Ératosthène** : on barre les multiples de $2$, puis de $3$, de $5$ et de $7$ (sauf ces nombres eux-mêmes) ; ceux qui restent (sauf $1$) sont premiers." },
      { title: "3. Décomposer par divisions successives", body: "On divise le nombre par le plus petit nombre premier qui le divise, puis on recommence avec le quotient, jusqu'à obtenir $1$. Les diviseurs utilisés forment la décomposition. Une calculatrice ou un logiciel peut aussi donner la décomposition (touche ou commande « décomposer » / « factoriser »)." },
      { title: "4. Simplifier une fraction en une seule fois", body: "Si l'on écrit le numérateur et le dénominateur en produits de facteurs premiers, on voit **tous** les facteurs communs d'un coup. On les « barre » en haut et en bas : ce qui reste forme la fraction irréductible. Ainsi $\\dfrac{360}{84} = \\dfrac{2^{3} \\times 3^{2} \\times 5}{2^{2} \\times 3 \\times 7} = \\dfrac{2 \\times 3 \\times 5}{7} = \\dfrac{30}{7}$." },
      { title: "5. Reconnaître le bon outil dans un problème", body: "– « Partager **sans reste** en le **plus grand** nombre de parts identiques », « carreaux les plus grands possible » : on cherche un **diviseur commun**, le plus grand.\n– « Se retrouver **de nouveau ensemble** », « en même temps pour la première fois », « engrenages » : on cherche un **multiple commun**, le plus petit.\nUn contrôle de bon sens aide : un diviseur commun est plus petit que les deux nombres, un multiple commun est plus grand." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Décomposer", statement: "Décomposer $1\\,260$ en produit de facteurs premiers.", steps: ["$1\\,260$ est pair : $1\\,260 = 2 \\times 630$, puis $630 = 2 \\times 315$.", "$315$ est impair ; somme des chiffres $3 + 1 + 5 = 9$ : divisible par $3$. $315 = 3 \\times 105$, puis $105 = 3 \\times 35$.", "$35 = 5 \\times 7$ et $7$ est premier.", "Donc $1\\,260 = 2 \\times 2 \\times 3 \\times 3 \\times 5 \\times 7$."], answer: "$1\\,260 = 2^{2} \\times 3^{2} \\times 5 \\times 7$" },
      { title: "Exemple 2 — Tester si un nombre est premier", statement: "$221$ est-il un nombre premier ?", steps: ["$14^{2} = 196$ et $15^{2} = 225$ : il suffit de tester les nombres premiers jusqu'à $13$.", "$221$ n'est divisible ni par $2$, ni par $3$ ($2 + 2 + 1 = 5$), ni par $5$, ni par $7$, ni par $11$.", "$221 \\div 13 = 17$ : la division tombe juste."], answer: "$221 = 13 \\times 17$ : $221$ n'est pas premier." },
      { title: "Exemple 3 — Rendre une fraction irréductible", statement: "Écrire $\\dfrac{1\\,260}{1\\,650}$ sous forme irréductible.", steps: ["$1\\,260 = 2^{2} \\times 3^{2} \\times 5 \\times 7$ et $1\\,650 = 2 \\times 3 \\times 5^{2} \\times 11$.", "Facteurs communs avec le plus petit exposant : $2 \\times 3 \\times 5 = 30$.", "$1\\,260 \\div 30 = 42$ et $1\\,650 \\div 30 = 55$.", "$42 = 2 \\times 3 \\times 7$ et $55 = 5 \\times 11$ n'ont plus de facteur commun."], answer: "$\\dfrac{1\\,260}{1\\,650} = \\dfrac{42}{55}$" },
      { title: "Exemple 4 — Problème de partage", statement: "Avec $84$ roses et $60$ tulipes, une fleuriste veut faire le plus grand nombre de bouquets identiques en utilisant toutes les fleurs. Combien de bouquets ? Quelle composition ?", steps: ["Le nombre de bouquets divise $84$ et $60$ : c'est un diviseur commun, le plus grand possible.", "$84 = 2^{2} \\times 3 \\times 7$ et $60 = 2^{2} \\times 3 \\times 5$ : le plus grand diviseur commun est $2^{2} \\times 3 = 12$.", "$84 \\div 12 = 7$ et $60 \\div 12 = 5$."], answer: "$12$ bouquets, chacun de $7$ roses et $5$ tulipes." },
      { title: "Exemple 5 — Problème de rencontre", statement: "Deux phares émettent un éclair, l'un toutes les $18$ s, l'autre toutes les $24$ s. Ils viennent de briller ensemble. Quand brilleront-ils de nouveau ensemble ?", steps: ["Les instants des éclairs sont les multiples de $18$ et les multiples de $24$ : on cherche le plus petit multiple commun.", "$18 = 2 \\times 3^{2}$ et $24 = 2^{3} \\times 3$ : on prend chaque facteur avec le plus grand exposant, $2^{3} \\times 3^{2} = 72$.", "Contrôle : $72 = 18 \\times 4 = 24 \\times 3$."], answer: "Dans $72$ secondes." },
    ],
    illustrations: [
      { svg: ladder, alt: "Divisions successives de 360 : 360 divisé par 2 donne 180, puis 90, puis 45 ; 45 divisé par 3 donne 15, puis 5 ; 5 divisé par 5 donne 1.", caption: "Décomposition de $360$ par divisions successives : $360 = 2^{3} \\times 3^{2} \\times 5$." },
      { svg: timeline, alt: "Frise de 0 à 24 secondes : le phare A brille aux multiples de 4, le phare B aux multiples de 6 ; ils brillent ensemble à 0, 12 et 24 secondes.", caption: "Les deux phares brillent ensemble aux multiples communs de $4$ et $6$ : $12$, $24$… Le plus petit est $12$." },
    ],
    commonMistakes: [
      { mistake: "« $1$ est un nombre premier. »", correction: "$1$ n'est pas premier.", why: "Un nombre premier a **exactement deux** diviseurs ; $1$ n'en a qu'un." },
      { mistake: "« $91$ est premier car il est impair et ne finit pas par $5$. »", correction: "$91 = 7 \\times 13$ n'est pas premier.", why: "Être impair ne suffit pas : il faut aussi tester $3$, $7$, $11$… jusqu'à $\\sqrt{n}$." },
      { mistake: "$60 = 4 \\times 3 \\times 5$ « est la décomposition en facteurs premiers ».", correction: "$60 = 2^{2} \\times 3 \\times 5$", why: "$4$ n'est pas premier : il faut continuer à le décomposer." },
      { mistake: "$\\dfrac{36}{48} = \\dfrac{18}{24}$ « est irréductible ».", correction: "$\\dfrac{36}{48} = \\dfrac{3}{4}$", why: "$18$ et $24$ ont encore le diviseur commun $6$ : on simplifie jusqu'à ce qu'il ne reste que $1$ comme diviseur commun." },
      { mistake: "« Divisible par $4$ et par $6$, donc par $24$. »", correction: "Divisible par le plus petit multiple commun de $4$ et $6$, soit $12$.", why: "$12$ est divisible par $4$ et par $6$ mais pas par $24$ : $4$ et $6$ ont le facteur commun $2$." },
      { mistake: "Utiliser un multiple commun dans un problème de partage (ou l'inverse).", correction: "Partage sans reste → diviseur commun ; rencontre, « de nouveau ensemble » → multiple commun.", why: "Un nombre de parts doit être plus petit que les quantités partagées ; un instant de rencontre est plus grand que chaque période." },
    ],
    methods: [
      { title: "Décomposer un entier en produit de facteurs premiers", steps: ["Diviser par $2$ tant que le quotient est pair.", "Puis diviser par $3$, par $5$, par $7$, $11$… (critères de divisibilité, puis divisions).", "S'arrêter quand le quotient vaut $1$.", "Écrire le produit des diviseurs utilisés en regroupant avec des puissances, puis vérifier en recalculant le produit."] },
      { title: "Rendre une fraction irréductible", steps: ["Décomposer le numérateur et le dénominateur (ou chercher leur plus grand diviseur commun).", "Diviser le numérateur et le dénominateur par tous leurs facteurs communs.", "Vérifier qu'il ne reste aucun diviseur commun autre que $1$."] },
      { title: "Résoudre un problème de partage", steps: ["Reconnaître la situation : parts identiques, sans reste, le plus grand nombre (ou la plus grande taille) possible.", "Calculer le plus grand diviseur commun des quantités.", "En déduire la composition de chaque part par division.", "Conclure par une phrase et contrôler (le produit redonne les quantités)."] },
      { title: "Résoudre un problème de rencontre (phénomènes périodiques)", steps: ["Reconnaître la situation : événements réguliers, « de nouveau ensemble », engrenages.", "Calculer le plus petit multiple commun des périodes.", "Convertir si nécessaire (minutes, heures) et répondre à la question posée (heure, nombre de tours…)."] },
    ],
    summary: [
      "$a$ est un multiple de $b$ (et $b$ un diviseur de $a$) s'il existe un entier $k$ tel que $a = b \\times k$.",
      "Un nombre premier a exactement deux diviseurs : $1$ et lui-même. $1$ n'est pas premier ; $2$ est le seul premier pair.",
      "Tout entier $\\geqslant 2$ se décompose de façon unique en produit de facteurs premiers.",
      "Pour tester si $n$ est premier, on essaie les nombres premiers $p$ tels que $p^{2} \\leqslant n$.",
      "Plus grand diviseur commun : facteurs communs, plus petits exposants. Plus petit multiple commun : tous les facteurs, plus grands exposants.",
      "Diviser numérateur et dénominateur par leur plus grand diviseur commun rend une fraction irréductible.",
      "Partage sans reste → diviseur commun ; rencontre périodique → multiple commun.",
    ],
    revisionSheet: {
      keyPoints: ["Premiers inférieurs à $30$ : $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$, $29$.", "Critères : $2$, $5$, $10$ → dernier chiffre ; $3$, $9$ → somme des chiffres.", "$360 = 2^{3} \\times 3^{2} \\times 5$ : uniquement des facteurs premiers.", "$84 = 2^{2} \\times 3 \\times 7$, $60 = 2^{2} \\times 3 \\times 5$ : plus grand diviseur commun $12$, plus petit multiple commun $420$.", "$\\dfrac{84}{60} = \\dfrac{7}{5}$ (irréductible)."],
      skills: ["Reconnaître un nombre premier et justifier qu'un nombre ne l'est pas.", "Décomposer un entier en produit de facteurs premiers.", "Rendre une fraction irréductible.", "Calculer le plus grand diviseur commun et le plus petit multiple commun de deux entiers.", "Résoudre des problèmes de partage, de carrelage, d'engrenages et de rencontre."],
    },
    miniQuiz: [
      { question: "Lequel de ces nombres est premier ?", options: ["$1$", "$51$", "$53$", "$57$"], answer: 2, explanation: "$51 = 3 \\times 17$, $57 = 3 \\times 19$ et $1$ n'est pas premier ; $53$ n'est divisible ni par $2$, ni par $3$, ni par $5$, ni par $7$." },
      { question: "La décomposition en produit de facteurs premiers de $72$ est…", options: ["$8 \\times 9$", "$2^{3} \\times 3^{2}$", "$2^{2} \\times 3^{3}$", "$2 \\times 36$"], answer: 1, explanation: "$72 = 2 \\times 2 \\times 2 \\times 3 \\times 3 = 2^{3} \\times 3^{2}$ ; $8$, $9$ et $36$ ne sont pas premiers." },
      { question: "La forme irréductible de $\\dfrac{45}{75}$ est…", options: ["$\\dfrac{9}{15}$", "$\\dfrac{3}{5}$", "$\\dfrac{15}{25}$", "$\\dfrac{5}{3}$"], answer: 1, explanation: "Le plus grand diviseur commun à $45$ et $75$ est $15$ : $\\dfrac{45}{75} = \\dfrac{3}{5}$." },
      { question: "Deux bus partent ensemble ; l'un repasse toutes les $10$ min, l'autre toutes les $15$ min. Ils repartent ensemble dans…", options: ["$5$ min", "$25$ min", "$30$ min", "$150$ min"], answer: 2, explanation: "On cherche le plus petit multiple commun de $10$ et $15$ : $30$." },
      { question: "Quel est le plus grand diviseur commun à $24$ et $36$ ?", options: ["$6$", "$12$", "$72$", "$4$"], answer: 1, explanation: "$24 = 2^{3} \\times 3$ et $36 = 2^{2} \\times 3^{2}$ : $2^{2} \\times 3 = 12$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "ari3-jeu-flash", template: "calcul-flash", title: "Flash arithmétique",
      objective: "Automatiser le calcul du plus grand diviseur commun, du plus petit multiple commun et la simplification de fractions.",
      instructions: "Réponds le plus vite possible. Pour une fraction, écris-la sous forme irréductible avec une barre, par exemple 3/4. Le niveau monte après trois bonnes réponses d'affilée.",
      objectives: ["M3-NC-02", "M3-NC-03"],
      config: {
        duration: 90, practiceCount: 15,
        levels: [
          { label: "Diviseurs et multiples communs", items: [
            { q: "Plus grand diviseur commun de $12$ et $18$", answer: "6", explanation: "$12 = 6 \\times 2$ et $18 = 6 \\times 3$." },
            { q: "Plus grand diviseur commun de $20$ et $30$", answer: "10", explanation: "$20 = 10 \\times 2$ et $30 = 10 \\times 3$." },
            { q: "Plus grand diviseur commun de $16$ et $24$", answer: "8", explanation: "$16 = 8 \\times 2$ et $24 = 8 \\times 3$." },
            { q: "Plus petit multiple commun de $4$ et $6$", answer: "12", explanation: "Multiples de $6$ : $6$, $12$ ; $12$ est multiple de $4$." },
            { q: "Plus petit multiple commun de $6$ et $8$", answer: "24", explanation: "Multiples de $8$ : $8$, $16$, $24$ ; $24 = 6 \\times 4$." },
            { q: "Plus petit multiple commun de $10$ et $15$", answer: "30", explanation: "Multiples de $15$ : $15$, $30$ ; $30 = 10 \\times 3$." },
            { q: "Plus grand diviseur commun de $14$ et $21$", answer: "7", explanation: "$14 = 7 \\times 2$ et $21 = 7 \\times 3$." },
            { q: "Plus petit multiple commun de $9$ et $12$", answer: "36", explanation: "Multiples de $12$ : $12$, $24$, $36$ ; $36 = 9 \\times 4$." },
          ] },
          { label: "Fractions irréductibles", items: [
            { q: "Forme irréductible de $\\dfrac{12}{18}$", answer: "2/3", irreducible: true, explanation: "On divise par $6$." },
            { q: "Forme irréductible de $\\dfrac{45}{75}$", answer: "3/5", irreducible: true, explanation: "On divise par $15$." },
            { q: "Forme irréductible de $\\dfrac{84}{60}$", answer: "7/5", irreducible: true, explanation: "On divise par $12$." },
            { q: "Forme irréductible de $\\dfrac{28}{42}$", answer: "2/3", irreducible: true, explanation: "On divise par $14$." },
            { q: "Forme irréductible de $\\dfrac{36}{48}$", answer: "3/4", irreducible: true, explanation: "On divise par $12$." },
            { q: "Forme irréductible de $\\dfrac{39}{65}$", answer: "3/5", irreducible: true, explanation: "$39 = 3 \\times 13$ et $65 = 5 \\times 13$ : on divise par $13$." },
            { q: "Forme irréductible de $\\dfrac{126}{210}$", answer: "3/5", irreducible: true, explanation: "On divise par $42$." },
            { q: "Forme irréductible de $\\dfrac{50}{35}$", answer: "10/7", irreducible: true, explanation: "On divise par $5$." },
          ] },
          { label: "Décompositions et problèmes express", items: [
            { q: "Exposant de $2$ dans la décomposition de $48$", answer: "4", explanation: "$48 = 2^{4} \\times 3$." },
            { q: "Exposant de $3$ dans la décomposition de $162$", answer: "4", explanation: "$162 = 2 \\times 3^{4}$." },
            { q: "Plus petit nombre premier qui divise $91$", answer: "7", explanation: "$91 = 7 \\times 13$." },
            { q: "Plus petit nombre premier qui divise $221$", answer: "13", explanation: "$221 = 13 \\times 17$." },
            { q: "Nombre maximal de bouquets identiques avec $24$ roses et $36$ tulipes", answer: "12", explanation: "Plus grand diviseur commun de $24$ et $36$ : $12$." },
            { q: "Deux feux clignotent toutes les $6$ s et $10$ s : ensemble de nouveau après combien de secondes ?", answer: "30", explanation: "Plus petit multiple commun de $6$ et $10$ : $30$." },
            { q: "Nombre de diviseurs de $36$", answer: "9", explanation: "$1$, $2$, $3$, $4$, $6$, $9$, $12$, $18$, $36$." },
            { q: "Nombre de nombres premiers inférieurs à $20$", answer: "8", explanation: "$2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$." },
          ] },
        ],
      },
    },
    {
      id: "ari3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs d'arithmétique",
      objective: "Repérer et nommer les erreurs typiques sur les nombres premiers, les décompositions et les fractions irréductibles.",
      instructions: "Pour chaque affirmation, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
      objectives: ["M4-NC-12", "M3-NC-01", "M3-NC-02", "M3-NC-03"],
      config: { items: [
        { niveau: 1, calc: "$1$ est un nombre premier.", correct: false, errors: ["Un nombre premier a exactement deux diviseurs ; $1$ n'en a qu'un", "$1$ est pair", "$1$ est divisible par $3$"], error: 0, explanation: "$1$ n'est pas premier." },
        { niveau: 1, calc: "$2$ est un nombre premier.", correct: true, explanation: "$2$ a exactement deux diviseurs : $1$ et $2$. C'est le seul premier pair." },
        { niveau: 1, calc: "$57$ est un nombre premier.", correct: false, errors: ["$57 = 3 \\times 19$ : la somme des chiffres $5 + 7 = 12$ est un multiple de $3$", "$57$ est pair", "Un nombre premier ne peut pas dépasser $50$"], error: 0, explanation: "$57 = 3 \\times 19$." },
        { niveau: 2, calc: "$60 = 4 \\times 3 \\times 5$ est la décomposition en facteurs premiers de $60$.", correct: false, errors: ["$4$ n'est pas premier : $60 = 2^{2} \\times 3 \\times 5$", "Le produit ne vaut pas $60$", "Il faut écrire $60 = 6 \\times 10$"], error: 0, explanation: "$60 = 2^{2} \\times 3 \\times 5$." },
        { niveau: 2, calc: "$72 = 2^{3} \\times 3^{2}$", correct: true, explanation: "$8 \\times 9 = 72$ et $2$, $3$ sont premiers." },
        { niveau: 2, calc: "$90 = 2 \\times 3 \\times 5$", correct: false, errors: ["Il manque un facteur $3$ : $90 = 2 \\times 3^{2} \\times 5$", "$5$ n'est pas premier", "Il faut un facteur $7$"], error: 0, explanation: "$2 \\times 3 \\times 5 = 30$ ; $90 = 2 \\times 3^{2} \\times 5$." },
        { niveau: 3, calc: "$\\dfrac{36}{48} = \\dfrac{18}{24}$, fraction irréductible.", correct: false, errors: ["$18$ et $24$ ont encore le diviseur commun $6$ : $\\dfrac{3}{4}$", "On ne peut pas diviser $36$ par $2$", "Il fallait diviser seulement le numérateur"], error: 0, explanation: "$\\dfrac{36}{48} = \\dfrac{3}{4}$." },
        { niveau: 3, calc: "$\\dfrac{2 + 5}{3 + 5} = \\dfrac{2}{3}$", correct: false, errors: ["On simplifie des facteurs communs, jamais des termes d'une somme", "Il fallait barrer le $2$ et le $3$", "Le résultat est $\\dfrac{5}{5}$"], error: 0, explanation: "$\\dfrac{7}{8} \\neq \\dfrac{2}{3}$ : on ne « simplifie » pas un terme ajouté." },
        { niveau: 3, calc: "$\\dfrac{39}{65} = \\dfrac{3}{5}$", correct: true, explanation: "$39 = 3 \\times 13$ et $65 = 5 \\times 13$." },
        { niveau: 4, calc: "Divisible par $4$ et par $6$, donc divisible par $24$.", correct: false, errors: ["Contre-exemple $12$ : on doit utiliser le plus petit multiple commun, $12$", "$4$ et $6$ sont premiers", "Il faudrait additionner $4$ et $6$"], error: 0, explanation: "$12$ est divisible par $4$ et $6$, pas par $24$." },
        { niveau: 4, calc: "Phares toutes les $4$ s et $6$ s : ils brillent de nouveau ensemble après $24$ s.", correct: false, errors: ["$24$ est un multiple commun mais pas le plus petit : c'est $12$ s", "Il faut le plus grand diviseur commun, $2$ s", "Il faut additionner : $10$ s"], error: 0, explanation: "Plus petit multiple commun de $4$ et $6$ : $12$." },
        { niveau: 4, calc: "$84$ roses et $60$ tulipes : au maximum $12$ bouquets identiques.", correct: true, explanation: "Plus grand diviseur commun de $84$ et $60$ : $12$." },
      ] },
    },
    {
      id: "ari3-jeu-memory", template: "memory", title: "Memory des décompositions",
      objective: "Associer rapidement un entier à sa décomposition et une fraction à sa forme irréductible.",
      instructions: "Retourne deux cartes : si elles représentent le même nombre, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-NC-01", "M3-NC-02"],
      config: { pairs: [
        ["$360$", "$2^{3} \\times 3^{2} \\times 5$"],
        ["$84$", "$2^{2} \\times 3 \\times 7$"],
        ["$98$", "$2 \\times 7^{2}$"],
        ["$150$", "$2 \\times 3 \\times 5^{2}$"],
        ["$\\dfrac{45}{75}$", "$\\dfrac{3}{5}$"],
        ["$\\dfrac{84}{60}$", "$\\dfrac{7}{5}$"],
      ] },
    },
  ],
  reviewStatus: { curriculum: "pending", accuracy: "pending", exercises: "pending", games: "pending", technical: "pending", language: "pending" },
  publicationStatus: "draft",
};
