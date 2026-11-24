// SCI-3E-MATH-004 — Mathématiques 3e : Équations (programme du cycle 4 de 2020, BO n° 31 du 30 juillet 2020 ;
// attendus de fin de 3e et repères annuels, BO n° 22 du 29 mai 2019).
// Contenu original. Hors programme : inéquations et équations générales du second degré.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Blank, Mistake, Rng } from "../../engine/types";
import { parseNumber } from "../../engine/numbers";
import { erreursConfig, flashConfig } from "../../games/logic";

// <pipeline:meta> générée par pipeline/run.ts depuis la fiche et l'inventaire — ne pas modifier à la main
const META = {
  "id": "math-3e-equations",
  "taskId": "SCI-3E-MATH-004",
  "grade": "3e",
  "subject": "mathematiques",
  "treeChapterId": "m3-equations",
  "curriculumChapterIds": [
    "math-3e-equations",
    "math-4e-equations"
  ],
  "curriculumVersion": "2026-2027",
  "title": "Équations : premier degré, produit nul, x² = a",
  "officialObjectives": [
    {
      "id": "M3-NC-12",
      "text": "Résoudre des équations du premier degré et des problèmes s'y ramenant.",
      "source": "Attendus de fin d'année de 3e (2019) › Utiliser le calcul littéral"
    },
    {
      "id": "M3-NC-13",
      "text": "Résoudre des équations produits nuls (après factorisation).",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Équations (3e) ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M3-NC-14",
      "text": "Résoudre des équations du type x² = a sur des exemples simples.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Équations (3e) ; Attendus de fin d'année de 3e (2019)"
    },
    {
      "id": "M4-NC-19",
      "text": "Désigner une inconnue par une lettre et mettre un problème en équation.",
      "source": "Attendus de fin d'année de 4e (2019) › Utiliser le calcul littéral (consolidation)",
      "required": false
    },
    {
      "id": "M4-NC-20",
      "text": "Tester si un nombre est solution d'une équation.",
      "source": "Attendus de fin d'année de 4e (2019) › Utiliser le calcul littéral (consolidation)",
      "required": false
    },
    {
      "id": "M4-NC-21",
      "text": "Résoudre algébriquement une équation du premier degré.",
      "source": "Repères annuels de progression cycle 4 (BO n°22 du 29-05-2019) › Équations (4e) ; Attendus de fin d'année de 4e (2019) (consolidation)",
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


const nb = (value: number): Blank => ({ type: "number", answer: { value } });
const sel = (options: string[], answer: number): Blank => ({ type: "select", options, answer });
const tt = (template: string, blanks: Blank[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "texte-trous", template, blanks } });
const num = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } }, mistakes: mistakes.filter((m) => parseNumber(m.match)?.value !== value) });
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
const vf = (items: string[], answer: boolean[], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "vrai-faux", items, answer } });
const steps = (list: [string, number][], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "etapes", steps: list.map(([p, v]) => ({ prompt: p, answer: { value: v } })) } });
function shuffledOrder(rng: Rng, lines: string[]): ChapterPart {
  let items = rng.shuffle(lines);
  while (items.every((x, i) => x === lines[i])) items = rng.shuffle(lines);
  return { interaction: { kind: "ordonner", items, answer: lines.map((l) => items.indexOf(l)), hint: "Première étape en haut" } };
}
const sgn = (rng: Rng, lo: number, hi: number) => rng.sign() * rng.int(lo, hi);
/** « ax + b » en LaTeX. */
function lin(a: number, b: number): string {
  const ax = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  return b === 0 ? ax : `${ax} ${b < 0 ? "-" : "+"} ${Math.abs(b)}`;
}
const sq = (n: number) => n * n;
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const O = {
  "M3-NC-12": "Résoudre des équations du premier degré et des problèmes s'y ramenant.",
  "M3-NC-13": "Résoudre des équations produits nuls (après factorisation).",
  "M3-NC-14": "Résoudre des équations du type x² = a sur des exemples simples.",
  "M4-NC-19": "Désigner une inconnue par une lettre et mettre un problème en équation.",
  "M4-NC-20": "Tester si un nombre est solution d'une équation.",
  "M4-NC-21": "Résoudre algébriquement une équation du premier degré.",
} as const;
type Obj = keyof typeof O;
type TT = "EQ-T01" | "EQ-T02" | "EQ-T03" | "EQ-T04" | "EQ-T05" | "EQ-T06" | "EQ-T07" | "EQ-T08";
const ex = (e: Omit<ChapterExercise, "objectives" | "taxonomyTypes"> & { objectives: Obj[]; taxonomyTypes: TT[] }): ChapterExercise => e;

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 ──
  ex({
    id: "eq3-01", title: "Ce nombre est-il solution ?", niveau: 1, objectives: ["M4-NC-20"], taxonomyTypes: ["EQ-T01"], time: 90,
    vary: (rng) => {
      const a = rng.int(2, 6), s = rng.int(1, 8), b = rng.int(1, 9), c = a * s + b;
      return {
        statement: `On considère l'équation $${a}x + ${b} = ${c}$. Remplace $x$ par $${s}$ pour tester.`,
        parts: [steps([[`Valeur de $${a}x + ${b}$ pour $x = ${s}$`, c]]), vf([`$${s}$ est solution de l'équation.`, `$${s + 1}$ est solution de l'équation.`], [true, false])],
        solution: [`Pour $x = ${s}$ : $${a} \\times ${s} + ${b} = ${c}$.`, `Le résultat est bien $${c}$ : $${s}$ est solution.`, `Pour $x = ${s + 1}$ : $${a * (s + 1) + b} \\neq ${c}$, ce n'est pas une solution.`],
      };
    },
    reasoning: "Un nombre est solution si, en remplaçant l'inconnue par ce nombre, l'égalité devient vraie.",
    hints: ["Remplace $x$ par la valeur dans le membre de gauche.", "Compare avec le membre de droite."],
  }),
  ex({
    id: "eq3-02", title: "Choisir la solution", niveau: 1, objectives: ["M4-NC-20"], taxonomyTypes: ["EQ-T01"], time: 90,
    vary: (rng) => {
      const a = rng.int(2, 5), c = rng.pick([1, 2, 3, 4].filter((v) => v !== a)), s = rng.int(2, 8), b = rng.int(1, 6), d = (a - c) * s + b;
      const opts = rng.shuffle([s, s + 1, s - 1, s + 2]);
      return {
        statement: `Quel nombre est solution de $${a}x + ${b} = ${lin(c, d)}$ ?`,
        parts: [qcm(opts.map((v) => `$${v}$`), opts.indexOf(s))],
        solution: [`Pour $x = ${s}$ : membre de gauche $${a * s + b}$, membre de droite $${c * s + d}$.`, "Les deux membres sont égaux : c'est la solution. Les autres valeurs donnent des résultats différents."],
      };
    },
    reasoning: "On teste chaque nombre dans les deux membres.",
    hints: ["Calcule les deux membres pour une valeur proposée.", "Une seule valeur rend les deux membres égaux."],
  }),
  ex({
    id: "eq3-03", title: "Équation comme une balance", niveau: 1, objectives: ["M4-NC-21"], taxonomyTypes: ["EQ-T02"], time: 90,
    vary: (rng) => {
      const b = rng.int(2, 9), s = rng.int(1, 12);
      return {
        statement: `Une balance est en équilibre : à gauche une masse inconnue $x$ et $${b}$ kg, à droite $${s + b}$ kg. On retire $${b}$ kg de chaque côté.`,
        parts: [tt(`$x + ${b} = ${s + b}$ donne $x =$ [[0]]`, [nb(s)])],
        solution: [`On retire $${b}$ des deux côtés : $x = ${s + b} - ${b}$.`, `$x = ${s}$.`],
      };
    },
    reasoning: "Retirer la même quantité des deux côtés conserve l'égalité.",
    hints: ["Quelle opération annule l'ajout de la masse connue ?", "Fais la même opération des deux côtés."],
  }),
  ex({
    id: "eq3-04", title: "Résoudre ax = b", niveau: 1, objectives: ["M4-NC-21"], taxonomyTypes: ["EQ-T02"], time: 90,
    vary: (rng) => {
      const a = rng.int(2, 9), s = sgn(rng, 1, 9);
      return {
        statement: `Résous $${a}x = ${a * s}$.`,
        parts: [num(s, [{ match: String(a * s), feedback: "Tu as recopié le second membre : il faut diviser par le coefficient de $x$." }])],
        solution: [`On divise les deux membres par $${a}$ : $x = ${a * s} \\div ${a}$.`, `$x = ${s}$.`],
      };
    },
    reasoning: "Diviser les deux membres par un même nombre non nul conserve l'égalité.",
    hints: ["Par quel nombre est multiplié $x$ ?", "Divise les deux membres par ce nombre."],
  }),
  ex({
    id: "eq3-05", title: "Résoudre a + x = b", niveau: 1, objectives: ["M4-NC-21"], taxonomyTypes: ["EQ-T02"], time: 90,
    vary: (rng) => {
      const a = sgn(rng, 1, 9), b = sgn(rng, 1, 9);
      return {
        statement: `Résous $${a} + x = ${b}$.`,
        parts: [num(b - a, [{ match: String(a + b), feedback: "Tu as additionné : il faut retrancher $" + a + "$ aux deux membres." }])],
        solution: [`On retranche $${a}$ aux deux membres : $x = ${b} - (${a})$.`, `$x = ${b - a}$.`],
      };
    },
    reasoning: "On retranche aux deux membres le nombre ajouté à $x$.",
    hints: ["Quelle opération annule l'addition de $a$ ?", "Attention aux signes avec les nombres négatifs."],
  }),
  // ── Niveau 2 ──
  ex({
    id: "eq3-06", title: "Équation ax + b = c", niveau: 2, objectives: ["M3-NC-12", "M4-NC-21"], taxonomyTypes: ["EQ-T03"], time: 120,
    vary: (rng) => {
      const a = rng.int(2, 9), s = sgn(rng, 1, 9), b = sgn(rng, 1, 12), c = a * s + b;
      return {
        statement: `Résous $${lin(a, b)} = ${c}$.`,
        parts: [num(s, [{ match: String(c - b), feedback: "Tu as oublié de diviser par le coefficient de $x$ après avoir isolé $" + a + "x$." }])],
        solution: [`On soustrait $${b}$ aux deux membres : $${a}x = ${c - b}$.`, `On divise par $${a}$ : $x = ${s}$.`, `Vérification : $${a} \\times ${s < 0 ? `(${s})` : s} + (${b}) = ${c}$ ✓.`],
      };
    },
    reasoning: "On isole d'abord le terme en $x$, puis on divise.",
    hints: ["Commence par éliminer le terme constant.", "Divise ensuite par le coefficient de $x$."],
  }),
  ex({
    id: "eq3-07", title: "Inconnue dans les deux membres", niveau: 2, objectives: ["M3-NC-12"], taxonomyTypes: ["EQ-T03"], time: 150,
    vary: (rng) => {
      const c = rng.int(1, 4), a = c + rng.int(1, 5), s = sgn(rng, 1, 8), b = sgn(rng, 1, 9), d = (a - c) * s + b;
      return {
        statement: `Résous $${lin(a, b)} = ${lin(c, d)}$.`,
        parts: [num(s)],
        solution: [`On regroupe les termes en $x$ à gauche : $${a - c}x + (${b}) = ${d}$.`, `$${a - c}x = ${d - b}$.`, `$x = ${s}$.`],
      };
    },
    reasoning: "Soustraire le même terme en $x$ des deux membres ramène à une équation de la forme $ax = b$.",
    hints: ["Retire $" + "cx" + "$ des deux membres.", "Puis isole $x$ comme d'habitude."],
  }),
  ex({
    id: "eq3-08", title: "Équation avec parenthèses", niveau: 2, objectives: ["M3-NC-12"], taxonomyTypes: ["EQ-T03"], time: 150,
    vary: (rng) => {
      const k = rng.int(2, 5), b = sgn(rng, 1, 6), s = sgn(rng, 1, 7), e = rng.int(1, 9), c = k * (s + b) + e;
      return {
        statement: `Résous $${k}(x ${b < 0 ? "-" : "+"} ${Math.abs(b)}) + ${e} = ${c}$.`,
        parts: [num(s, [{ match: String((c - e) / k + b), feedback: "Le terme constant de la parenthèse doit être soustrait, pas ajouté." }])],
        solution: [`On développe : $${lin(k, k * b)} + ${e} = ${c}$.`, `$${k}x = ${c - e - k * b}$.`, `$x = ${s}$.`],
      };
    },
    reasoning: "On développe d'abord la parenthèse, puis on résout.",
    hints: ["Applique la distributivité.", "Isole ensuite $x$."],
  }),
  ex({
    id: "eq3-09", title: "Solution fractionnaire", niveau: 2, objectives: ["M3-NC-12", "M4-NC-21"], taxonomyTypes: ["EQ-T02"], time: 120,
    vary: (rng) => {
      const a = rng.pick([2, 4, 5, 8]), b = rng.int(1, 9);
      let p = rng.int(1, 15);
      while (p % a === 0) p = rng.int(1, 15);
      const g = gcd(p, a), c = p + b;
      return {
        statement: `Résous $${a}x + ${b} = ${c}$. Donne la solution sous forme de fraction irréductible.`,
        parts: [{ interaction: { kind: "numerique", answer: { value: p / a, fraction: [p, a] } } }],
        solution: [`$${a}x = ${c} - ${b} = ${p}$.`, `$x = \\dfrac{${p}}{${a}}${g > 1 ? ` = \\dfrac{${p / g}}{${a / g}}` : ""}$.`],
      };
    },
    reasoning: "La division des deux membres donne la solution exacte, qui peut être une fraction.",
    hints: ["Soustrais d'abord le terme constant.", "Divise ensuite, puis simplifie la fraction."],
  }),
  ex({
    id: "eq3-10", title: "Équation produit nul simple", niveau: 2, objectives: ["M3-NC-13"], taxonomyTypes: ["EQ-T05"], time: 120,
    vary: (rng) => {
      let p = 0, q = 0;
      do { p = sgn(rng, 1, 9); q = sgn(rng, 1, 9); } while (p === q);
      const lo = Math.min(-p, -q), hi = Math.max(-p, -q);
      return {
        statement: `Résous $(x ${p < 0 ? "-" : "+"} ${Math.abs(p)})(x ${q < 0 ? "-" : "+"} ${Math.abs(q)}) = 0$ et donne les deux solutions par ordre croissant.`,
        parts: [tt("Solutions : [[0]] et [[1]]", [nb(lo), nb(hi)])],
        solution: ["Un produit est nul si l'un de ses facteurs est nul.", `$x ${p < 0 ? "-" : "+"} ${Math.abs(p)} = 0$ donne $x = ${-p}$ ; $x ${q < 0 ? "-" : "+"} ${Math.abs(q)} = 0$ donne $x = ${-q}$.`, `Les solutions sont $${lo}$ et $${hi}$.`],
      };
    },
    reasoning: "Annulation d'un produit : $A \\times B = 0$ équivaut à $A = 0$ ou $B = 0$.",
    hints: ["Annule chaque facteur séparément.", "Attention au signe de la solution de chaque facteur."],
  }),
  ex({
    id: "eq3-11", title: "Produit nul avec x en facteur", niveau: 2, objectives: ["M3-NC-13"], taxonomyTypes: ["EQ-T05"], time: 120,
    vary: (rng) => {
      const a = rng.int(2, 5), s = sgn(rng, 1, 6), b = -a * s;
      const lo = Math.min(0, s), hi = Math.max(0, s);
      return {
        statement: `Résous $x(${lin(a, b)}) = 0$ ; donne les solutions par ordre croissant.`,
        parts: [tt("Solutions : [[0]] et [[1]]", [nb(lo), nb(hi)])],
        solution: [`$x = 0$ ou $${lin(a, b)} = 0$.`, `$${lin(a, b)} = 0$ donne $x = ${s}$.`, `Solutions : $${lo}$ et $${hi}$.`],
      };
    },
    reasoning: "Le facteur $x$ lui-même peut s'annuler.",
    hints: ["Un des facteurs est simplement $x$.", "Résous l'autre facteur comme une équation du premier degré."],
  }),
  ex({
    id: "eq3-12", title: "x² = a avec a donné", niveau: 2, objectives: ["M3-NC-14"], taxonomyTypes: ["EQ-T07"], time: 120,
    vary: (rng) => {
      const n = rng.int(2, 13);
      return {
        statement: `Résous $x^{2} = ${sq(n)}$ ; donne les deux solutions par ordre croissant.`,
        parts: [tt("Solutions : [[0]] et [[1]]", [nb(-n), nb(n)])],
        solution: [`$${sq(n)} > 0$ : il y a deux solutions opposées.`, `$x = \\sqrt{${sq(n)}} = ${n}$ ou $x = -${n}$.`],
      };
    },
    reasoning: "Deux nombres opposés ont le même carré.",
    hints: ["Cherche un nombre positif dont le carré vaut $a$.", "N'oublie pas son opposé."],
  }),
  ex({
    id: "eq3-13", title: "Combien de solutions ?", niveau: 2, objectives: ["M3-NC-14"], taxonomyTypes: ["EQ-T07"], time: 120,
    statement: "Associe chaque équation au nombre de solutions.",
    parts: [{ interaction: { kind: "classer", categories: ["Aucune solution", "Une solution", "Deux solutions"], items: ["$x^{2} = -9$", "$x^{2} = 0$", "$x^{2} = 16$", "$x^{2} = 7$", "$x^{2} = -1$"], answer: [0, 1, 2, 2, 0] } }],
    solution: ["Un carré n'est jamais négatif : $x^{2} = -9$ et $x^{2} = -1$ n'ont aucune solution.", "$x^{2} = 0$ : seule solution $0$.", "$x^{2} = 16$ et $x^{2} = 7$ : deux solutions ($\\pm 4$ et $\\pm\\sqrt{7}$)."],
    reasoning: "Le nombre de solutions dépend du signe de $a$.",
    hints: ["Un carré peut-il être négatif ?", "Si $a > 0$, pense aux deux racines."],
  }),
  // ── Niveau 3 ──
  ex({
    id: "eq3-14", title: "Équation à coefficients relatifs", niveau: 3, objectives: ["M3-NC-12"], taxonomyTypes: ["EQ-T03"], time: 180,
    vary: (rng) => {
      const a = rng.int(2, 6), c = rng.int(1, 3), s = sgn(rng, 1, 7), k = rng.int(2, 4), e = sgn(rng, 1, 8);
      const left = `${k}(x - ${a}) + ${e < 0 ? `(${e})` : e}`;
      // k(x-a)+e = (k+c)x + d  => d = k*s - k*a + e - (k+c)*s
      const d = k * (s - a) + e - (k + c) * s;
      return {
        statement: `Résous $${left} = ${lin(k + c, d)}$.`,
        parts: [num(s)],
        solution: [`On développe : $${lin(k, -k * a)} + (${e}) = ${lin(k + c, d)}$.`, `On regroupe : $${-c}x = ${d - e + k * a}$.`, `$x = ${s}$.`],
      };
    },
    reasoning: "Développer, regrouper les termes en $x$, isoler, diviser.",
    hints: ["Développe la parenthèse.", "Regroupe les termes en $x$ d'un côté."],
  }),
  ex({
    id: "eq3-15", title: "Produit nul avec deux facteurs affines", niveau: 3, objectives: ["M3-NC-13"], taxonomyTypes: ["EQ-T05"], time: 180,
    vary: (rng) => {
      const a = rng.int(2, 5), c = rng.int(2, 5), s = sgn(rng, 1, 5), t = s + rng.int(1, 4);
      return {
        statement: `Résous $(${lin(a, -a * s)})(${lin(c, -c * t)}) = 0$ ; donne les solutions par ordre croissant.`,
        parts: [tt("Solutions : [[0]] et [[1]]", [nb(s), nb(t)])],
        solution: [`$${lin(a, -a * s)} = 0$ donne $x = ${s}$.`, `$${lin(c, -c * t)} = 0$ donne $x = ${t}$.`],
      };
    },
    reasoning: "On résout séparément chaque facteur.",
    hints: ["Annule le premier facteur.", "Annule le second facteur."],
  }),
  ex({
    id: "eq3-16", title: "Factoriser par un facteur commun", niveau: 3, objectives: ["M3-NC-13"], taxonomyTypes: ["EQ-T06"], time: 180,
    vary: (rng) => {
      const a = rng.int(2, 6), s = rng.int(1, 8);
      return {
        statement: `Résous $${a}x^{2} = ${a * s}x$. Ramène-toi d'abord à $${a}x^{2} - ${a * s}x = 0$.`,
        parts: [tt(`$${a}x(x - ${s}) = 0$ donne les solutions [[0]] et [[1]] (ordre croissant)`, [nb(0), nb(s)]), vf(["Diviser par $x$ des deux côtés est une bonne méthode ici."], [false])],
        solution: [`$${a}x^{2} - ${a * s}x = ${a}x(x - ${s})$.`, `$x = 0$ ou $x = ${s}$.`, "Diviser par $x$ ferait perdre la solution $0$."],
      };
    },
    reasoning: "On ramène tout dans un membre, on factorise, puis on annule le produit.",
    hints: ["Passe tout dans le membre de gauche.", "Cherche le facteur commun."],
  }),
  ex({
    id: "eq3-17", title: "Différence de deux carrés", niveau: 3, objectives: ["M3-NC-13"], taxonomyTypes: ["EQ-T06"], time: 180,
    vary: (rng) => {
      const n = rng.int(2, 12);
      return {
        statement: `Résous $x^{2} - ${sq(n)} = 0$ en factorisant avec $a^{2} - b^{2} = (a - b)(a + b)$.`,
        parts: [tt(`$(x - ${n})(x + ${n}) = 0$ donne [[0]] et [[1]] (ordre croissant)`, [nb(-n), nb(n)])],
        solution: [`$x^{2} - ${sq(n)} = (x - ${n})(x + ${n})$.`, `$x = ${n}$ ou $x = -${n}$.`],
      };
    },
    reasoning: "La factorisation ramène à un produit nul.",
    hints: ["Écris $" + "b^{2}" + "$ comme un carré.", "Applique l'identité."],
  }),
  ex({
    id: "eq3-18", title: "x² = a, a non carré parfait", niveau: 3, objectives: ["M3-NC-14"], taxonomyTypes: ["EQ-T07"], time: 150,
    vary: (rng) => {
      const a = rng.pick([2, 3, 5, 6, 7, 10, 11]);
      const opts = [`$\\sqrt{${a}}$ uniquement`, `$-\\sqrt{${a}}$ et $\\sqrt{${a}}$`, `$${a / 2}$`, "aucune solution"];
      return {
        statement: `Quelles sont les solutions exactes de $x^{2} = ${a}$ ?`,
        parts: [qcm(opts, 1, [{ match: "0", feedback: "Tu as oublié la solution négative." }, { match: "2", feedback: "Cela ne vérifie pas l'équation : calcule le carré." }, { match: "3", feedback: "$" + a + " > 0$ : il y a des solutions." }])],
        solution: [`$${a} > 0$ : deux solutions $\\sqrt{${a}}$ et $-\\sqrt{${a}}$.`],
      };
    },
    reasoning: "Si $a > 0$, l'équation a deux solutions opposées.",
    hints: ["Signe de $a$ ?", "Il y a deux solutions."],
  }),
  ex({
    id: "eq3-19", title: "Discuter selon le signe de a", niveau: 3, objectives: ["M3-NC-14"], taxonomyTypes: ["EQ-T07"], time: 150,
    statement: "Vrai ou faux ?",
    parts: [vf(["$x^{2} = 25$ a pour seule solution $5$.", "$x^{2} = -4$ n'a aucune solution.", "$x^{2} = 0$ a pour seule solution $0$.", "On peut calculer $\\sqrt{-4}$."], [false, true, true, false])],
    solution: ["Faux : $-5$ est aussi solution.", "Vrai : un carré est positif ou nul.", "Vrai.", "Faux : la racine carrée d'un nombre négatif n'existe pas, car un carré n'est jamais négatif."],
    reasoning: "On discute selon le signe de $a$.",
    hints: ["Un carré est-il négatif ?", "Pense à l'opposé."],
  }),
  ex({
    id: "eq3-20", title: "Programme de calcul", niveau: 3, objectives: ["M3-NC-12", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 180,
    vary: (rng) => {
      const k = rng.int(2, 5), c = rng.int(1, 9), s = rng.int(1, 12), r = k * (s + c);
      return {
        statement: `Programme : choisir un nombre, lui ajouter $${c}$, multiplier par $${k}$. On obtient $${r}$. Quel est le nombre de départ ?`,
        parts: [tt(`Équation : $${k}(x + ${c}) =$ [[0]]`, [nb(r)]), num(s, [{ match: String(r / k), feedback: "Il reste à retrancher " + c + "." }])],
        solution: [`Avec $x$ le nombre de départ : $${k}(x + ${c}) = ${r}$.`, `$x + ${c} = ${r / k}$, donc $x = ${s}$.`],
      };
    },
    reasoning: "On désigne l'inconnue par $x$, on traduit le programme, on résout.",
    hints: ["Nomme le nombre de départ $x$.", "Traduis chaque étape."],
  }),
  // ── Niveau 4 ──
  ex({
    id: "eq3-21", title: "Partage d'une somme", niveau: 4, objectives: ["M3-NC-12", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 240,
    vary: (rng) => {
      const x = rng.int(10, 40), d1 = rng.int(5, 20), k = rng.int(2, 3), tot = x + (x + d1) + k * x;
      return {
        statement: `Trois amis se partagent $${tot}$ €. Le deuxième reçoit $${d1}$ € de plus que le premier ; le troisième reçoit $${k}$ fois la part du premier. On note $x$ la part du premier (en €).`,
        parts: [tt(`$x + (x + ${d1}) + ${k}x = ${tot}$ donne [[0]] $x = ${tot - d1}$`, [nb(k + 2)]), num(x, [], "Part du premier (en €)")],
        solution: [`Équation : $${k + 2}x + ${d1} = ${tot}$.`, `$${k + 2}x = ${tot - d1}$, donc $x = ${x}$.`, `Parts : $${x}$ €, $${x + d1}$ € et $${k * x}$ €.`],
      };
    },
    reasoning: "On exprime chaque part avec $x$ puis on écrit que la somme vaut le total.",
    hints: ["Exprime les trois parts avec $x$.", "La somme des parts vaut le total."],
  }),
  ex({
    id: "eq3-22", title: "Périmètre d'un rectangle", niveau: 4, objectives: ["M3-NC-12", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 240,
    vary: (rng) => {
      const l = rng.int(3, 12), d = rng.int(2, 8), P = 2 * (l + l + d);
      return {
        statement: `Un rectangle a un périmètre de $${P}$ cm. Sa longueur dépasse sa largeur de $${d}$ cm. On note $x$ la largeur (en cm).`,
        parts: [tt(`$2(x + x + ${d}) = ${P}$ donne [[0]] $x + ${2 * d} = ${P}$`, [nb(4)]), num(l, [], "Largeur (en cm)"), num(l + d, [], "Longueur (en cm)")],
        solution: [`Équation : $2(2x + ${d}) = ${P}$, soit $4x + ${2 * d} = ${P}$.`, `$x = ${l}$ cm.`, `La longueur est $${l + d}$ cm.`],
      };
    },
    reasoning: "Le périmètre vaut $2 \\times$ (longueur + largeur).",
    hints: ["Exprime la longueur avec $x$.", "Écris le périmètre."],
  }),
  ex({
    id: "eq3-23", title: "Aire d'un carré donnée", niveau: 4, objectives: ["M3-NC-14", "M3-NC-12"], taxonomyTypes: ["EQ-T08"], time: 210,
    vary: (rng) => {
      const n = rng.int(3, 15);
      return {
        statement: `Un carré a une aire de $${sq(n)}$ cm². On note $x$ la longueur de son côté (en cm).`,
        parts: [tt(`$x^{2} = ${sq(n)}$ a pour solutions algébriques [[0]] et [[1]] (ordre croissant)`, [nb(-n), nb(n)]), num(n, [{ match: String(-n), feedback: "Une longueur ne peut pas être négative." }], "Longueur du côté (en cm)")],
        solution: [`$x^{2} = ${sq(n)}$ donne $x = ${n}$ ou $x = -${n}$.`, `Une longueur est positive : le côté mesure $${n}$ cm.`],
      };
    },
    reasoning: "Deux solutions algébriques, une seule convient dans le contexte.",
    hints: ["Résous $x^{2} = a$.", "Vérifie le sens dans le contexte."],
  }),
  ex({
    id: "eq3-24", title: "Âges", niveau: 4, objectives: ["M3-NC-12", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 240,
    vary: (rng) => {
      const x = rng.int(8, 12), n = rng.int(2, 6), P = 3 * x + 2 * n;
      const eqs = [`$${P} + ${n} = 3(x + ${n})$`, `$${P} = 3(x + ${n})$`, `$${P} + ${n} = 3x + ${n}$`, `$3(${P} + ${n}) = x + ${n}$`];
      const opts = rng.shuffle(eqs);
      return {
        statement: `Un parent a aujourd'hui $${P}$ ans. Dans $${n}$ ans, il aura le triple de l'âge qu'aura alors son enfant. On note $x$ l'âge actuel de l'enfant.`,
        parts: [qcm(opts, opts.indexOf(eqs[0]), [], "1. Quelle équation traduit l'énoncé ?"), num(x, [{ match: String(P), feedback: "Tu as recopié l'âge du parent : résous l'équation." }], "2. Âge actuel de l'enfant")],
        solution: [`Dans $${n}$ ans, le parent aura $${P + n}$ ans et l'enfant $x + ${n}$ ans : $${P} + ${n} = 3(x + ${n})$.`, `$${P + n} = 3x + ${3 * n}$, donc $3x = ${P - 2 * n}$ et $x = ${x}$.`, `Vérification : dans $${n}$ ans, $${P + n} = 3 \\times ${x + n}$.`],
      };
    },
    reasoning: "On ajoute le même nombre d'années aux deux âges, puis on traduit « le triple » par une égalité.",
    hints: ["Ajoute le même nombre d'années aux deux âges.", "Le parent aura alors le triple de l'âge de l'enfant : écris cette égalité."],
  }),
  ex({
    id: "eq3-25", title: "Problème avec produit nul", niveau: 4, objectives: ["M3-NC-13", "M3-NC-12"], taxonomyTypes: ["EQ-T08"], time: 240,
    vary: (rng) => {
      const a = rng.int(2, 9);
      return {
        statement: `Un premier rectangle a pour côtés $x$ cm et $(x + ${a})$ cm ; un second a pour côtés $x$ cm et $${2 * a}$ cm. On cherche $x > 0$ pour que les deux rectangles aient la même aire, soit $x(x + ${a}) = ${2 * a}x$.`,
        parts: [tt(`$x(x + ${a}) - ${2 * a}x = 0$ donne $x(x -$ [[0]] $) = 0$`, [nb(a)]), num(a, [{ match: "0", feedback: "$0$ n'est pas une longueur acceptable." }], "Valeur de $x$ possible (en cm)")],
        solution: [`$x(x + ${a}) - ${2 * a}x = x(x - ${a})$.`, `$x = 0$ ou $x = ${a}$.`, `$x$ est une longueur non nulle : $x = ${a}$ cm.`],
      };
    },
    reasoning: "Solution unique dans le contexte malgré deux solutions algébriques.",
    hints: ["Ramène tout dans un membre.", "Élimine la solution qui n'a pas de sens."],
  }),
  ex({
    id: "eq3-26", title: "Choisir la bonne mise en équation", niveau: 4, objectives: ["M4-NC-19", "M3-NC-12"], taxonomyTypes: ["EQ-T04"], time: 180,
    vary: (rng) => {
      const p = rng.int(2, 6), f = rng.int(5, 15), n = rng.int(3, 8), T = p * n + f;
      const opts = rng.shuffle([`$${p}x + ${f} = ${T}$`, `$${p + f}x = ${T}$`, `$${p}(x + ${f}) = ${T}$`, `$${p}x - ${f} = ${T}$`]);
      return {
        statement: `Un abonnement coûte $${f}$ € d'inscription plus $${p}$ € par séance. Avec $${T}$ € dépensés au total, on veut le nombre $x$ de séances.`,
        parts: [qcm(opts, opts.indexOf(`$${p}x + ${f} = ${T}$`), [], "Quelle équation traduit le problème ?"), num(n, [], "Nombre de séances")],
        solution: [`Coût : $${p}x + ${f} = ${T}$.`, `$${p}x = ${T - f}$ donc $x = ${n}$.`],
      };
    },
    reasoning: "Coût fixe plus coût variable.",
    hints: ["Quel terme dépend de $x$ ?", "Quel terme est fixe ?"],
  }),
  // ── Niveau 5 ──
  ex({
    id: "eq3-27", title: "Type Brevet — Deux tarifs", niveau: 5, objectives: ["M3-NC-12", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 360,
    vary: (rng) => {
      const a = rng.int(2, 4), b = a + rng.int(1, 3), s = rng.int(5, 15), g = (b - a) * s;
      return {
        statement: `Une salle de sport propose deux tarifs. Tarif A : un abonnement de $${g}$ € puis $${a}$ € par séance. Tarif B : $${b}$ € par séance, sans abonnement. On note $x$ le nombre de séances.`,
        parts: [tt(`1. Les deux tarifs coûtent autant lorsque [[0]] $x + ${g} = ${b}x$`, [nb(a)]), num(s, [{ match: String(g), feedback: "C'est le prix de l'abonnement : résous l'équation." }], "2. Nombre de séances pour lequel les deux tarifs coûtent autant"), vf([`Pour $${s + 1}$ séances, le tarif A est plus avantageux.`, `Pour $${s - 1}$ séances, le tarif A est plus avantageux.`], [true, false], "3. Vrai ou faux ?")],
        solution: [`1. Tarif A : $${a}x + ${g}$ € ; tarif B : $${b}x$ €. Égalité : $${a}x + ${g} = ${b}x$.`, `2. $${g} = ${b - a}x$, donc $x = ${s}$.`, `3. Pour $${s + 1}$ séances, A coûte $${a * (s + 1) + g}$ € et B $${b * (s + 1)}$ € : A est moins cher (vrai). Pour $${s - 1}$ séances, A coûte $${a * (s - 1) + g}$ € et B $${b * (s - 1)}$ € : B est moins cher (faux).`],
      };
    },
    reasoning: "On égale les deux coûts pour trouver le nombre de séances où les tarifs se croisent, puis on compare juste avant et juste après.",
    hints: ["Écris le coût de chaque tarif en fonction de $x$.", "Résous l'égalité, puis calcule les deux coûts juste avant et juste après."],
  }),
  ex({
    id: "eq3-28", title: "Équation factorisée complète", niveau: 4, objectives: ["M3-NC-13", "M3-NC-12"], taxonomyTypes: ["EQ-T06"], time: 360,
    vary: (rng) => {
      const a = rng.int(2, 7), b = rng.int(1, 6);
      return {
        statement: `Résous $(x + ${a})(x - ${b}) = (x + ${a})(${b + 3})$.`,
        parts: [tt(`1. $(x + ${a})\\big[(x - ${b}) - ${b + 3}\\big] = 0$, soit $(x + ${a})(x -$ [[0]] $) = 0$`, [nb(2 * b + 3)]), tt("2. Solutions (ordre croissant) : [[0]] et [[1]]", [nb(Math.min(-a, 2 * b + 3)), nb(Math.max(-a, 2 * b + 3))]), vf(["Diviser par $(x + " + a + ")$ aurait fait perdre une solution."], [true], "3. Vrai ou faux ?")],
        solution: [`1. On passe tout à gauche et on met $(x + ${a})$ en facteur : $(x + ${a})(x - ${2 * b + 3}) = 0$.`, `2. $x = ${-a}$ ou $x = ${2 * b + 3}$.`, `3. Vrai : on perdrait $x = ${-a}$.`],
      };
    },
    reasoning: "Ne jamais diviser par une expression contenant l'inconnue.",
    hints: ["Passe tout dans un membre.", "Repère le facteur commun."],
  }),
  ex({
    id: "eq3-29", title: "Type Brevet — Agrandir un carré", niveau: 5, objectives: ["M3-NC-14", "M3-NC-12"], taxonomyTypes: ["EQ-T08"], time: 360,
    vary: (rng) => {
      const n = rng.int(3, 12), e = rng.int(2, 6), m = n + e, A = sq(m);
      const eqs = [`$(x + ${e})^{2} = ${A}$`, `$x^{2} + ${e} = ${A}$`, `$x^{2} + ${sq(e)} = ${A}$`, `$4(x + ${e}) = ${A}$`];
      const opts = rng.shuffle(eqs);
      return {
        statement: `Un carré a pour côté $x$ cm. On allonge chacun de ses côtés de $${e}$ cm : le nouveau carré a une aire de $${A}$ cm².`,
        parts: [qcm(opts, opts.indexOf(eqs[0]), [], "1. Quelle équation vérifie $x$ ?"), tt(`2. $(x + ${e})^{2} = ${A}$ donne $x + ${e} = ${m}$ ou $x + ${e} = -${m}$, soit $x =$ [[0]] ou $x =$ [[1]] (ordre croissant).`, [nb(-m - e), nb(n)]), num(n, [{ match: String(-m - e), feedback: "Une longueur ne peut pas être négative." }, { match: String(m), feedback: "C'est le côté du nouveau carré : retire l'allongement." }], "3. Côté du carré de départ (en cm)")],
        solution: [`1. Le nouveau carré a pour côté $x + ${e}$ : $(x + ${e})^{2} = ${A}$.`, `2. $${A} > 0$ : $x + ${e} = ${m}$ ou $x + ${e} = -${m}$, donc $x = ${n}$ ou $x = ${-m - e}$.`, `3. Une longueur est positive : le côté de départ mesure $${n}$ cm.`],
      };
    },
    reasoning: "On se ramène à une équation du type $X^{2} = a$ avec $X = x + e$, puis on garde la solution qui a un sens.",
    hints: ["Exprime le côté du nouveau carré en fonction de $x$.", "Un carré égal à un nombre positif : deux possibilités."],
  }),
  ex({
    id: "eq3-30", title: "Type Brevet — Programmes équivalents", niveau: 5, objectives: ["M3-NC-12", "M3-NC-13", "M4-NC-19"], taxonomyTypes: ["EQ-T04"], time: 360,
    vary: (rng) => {
      const k = rng.int(2, 5), s = rng.int(2, 9), c = rng.int(1, 5), v = k * s - c * s;
      return {
        statement: `Programme A : choisir un nombre, le multiplier par $${k}$. Programme B : choisir un nombre, le multiplier par $${c}$ puis ajouter $${v}$. Pour quel nombre $x$ les deux programmes donnent-ils le même résultat ?`,
        parts: [tt(`1. Équation : $${k}x =$ [[0]] $x + ${v}$`, [nb(c)]), num(s, [], "2. Valeur de $x$"), steps([[`Résultat des deux programmes pour $x = ${s}$`, k * s]], "3. Vérifie.")],
        solution: [`1. $${k}x = ${c}x + ${v}$.`, `2. $${k - c}x = ${v}$ donc $x = ${s}$.`, `3. Pour $x = ${s}$ : $${k * s}$ dans les deux cas.`],
      };
    },
    reasoning: "On égale les deux programmes et on résout.",
    hints: ["Écris chaque programme avec $x$.", "Égale les expressions."],
  }),
];

export const math3eEquations: ChapterContent = {
  ...META,
  prerequisites: [
    { text: "Développer, réduire et factoriser des expressions (facteur commun, $a^{2} - b^{2}$)." },
    { text: "Calculer avec des nombres relatifs et des fractions simples." },
    { text: "Connaître la racine carrée d'un nombre positif." },
  ],
  lesson: {
    introduction: "Un nombre multiplié par $3$ puis augmenté de $4$ donne $19$ : quel est ce nombre ? Pour répondre avec certitude, on écrit une **équation** et on la résout. Dans ce chapitre, tu résous des équations du premier degré, des équations où un produit s'annule, et des équations $x^{2} = a$. Les inéquations ne sont pas au programme de 3e.",
    definitions: [
      { term: "Équation et solution", text: "Une **équation** est une égalité contenant une inconnue. Une **solution** est une valeur de l'inconnue qui rend l'égalité vraie." },
      { term: "Équation du premier degré", text: "Une équation du premier degré se ramène à $ax + b = 0$ avec $a \\neq 0$ ; elle a une unique solution $x = -\\dfrac{b}{a}$." },
      { term: "Équation produit nul", text: "Une équation de la forme $A \\times B = 0$, où $A$ et $B$ sont des expressions contenant l'inconnue." },
    ],
    properties: [
      { title: "Transformations conservant l'égalité", statement: "On peut ajouter ou soustraire un même nombre aux deux membres, les multiplier ou les diviser par un même nombre **non nul**." },
      { title: "Annulation d'un produit", statement: "Un produit est nul si et seulement si l'un au moins de ses facteurs est nul : $A \\times B = 0 \\iff A = 0$ ou $B = 0$." },
      { title: "Équation $x^{2} = a$", statement: "Si $a < 0$ : aucune solution. Si $a = 0$ : une seule solution, $0$. Si $a > 0$ : deux solutions, $\\sqrt{a}$ et $-\\sqrt{a}$." },
    ],
    explanations: [
      { title: "1. La balance", body: "Une équation est comme une balance en équilibre : ce qu'on fait d'un côté (ajouter, retirer, multiplier, diviser), on le fait de l'autre pour garder l'équilibre. Par exemple, $3x + 4 = 19$ donne $3x = 15$ puis $x = 5$." },
      { title: "2. Mettre en équation", body: "On choisit l'inconnue et on précise son sens (« soit $x$ la largeur en cm »), on traduit l'énoncé par une égalité, on résout, puis on **vérifie que la solution a du sens** dans le contexte (une longueur est positive)." },
      { title: "3. Produit nul et factorisation", body: "Pour résoudre $x^{2} = 3x$, on écrit $x^{2} - 3x = 0$, donc $x(x - 3) = 0$ : $x = 0$ ou $x = 3$. Si on divisait par $x$, on perdrait la solution $0$." },
      { title: "4. L'équation $x^{2} = a$", body: "L'aire d'un carré vaut $25$ cm² : le côté mesure $5$ cm. Mais l'équation $x^{2} = 25$ a deux solutions, $5$ et $-5$, car $(-5)^{2} = 25$. Dans un problème de longueur, on garde la solution positive." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Premier degré", statement: "Résoudre $5x - 3 = 2x + 9$.", steps: ["On soustrait $2x$ : $3x - 3 = 9$.", "On ajoute $3$ : $3x = 12$.", "On divise par $3$."], answer: "$x = 4$" },
      { title: "Exemple 2 — Produit nul", statement: "Résoudre $(x - 2)(x + 5) = 0$.", steps: ["$x - 2 = 0$ ou $x + 5 = 0$.", "$x = 2$ ou $x = -5$."], answer: "Solutions : $-5$ et $2$" },
      { title: "Exemple 3 — Factoriser d'abord", statement: "Résoudre $x^{2} - 9 = 0$ puis $x^{2} = 3x$.", steps: ["$x^{2} - 9 = (x - 3)(x + 3) = 0$ donc $x = 3$ ou $x = -3$.", "$x^{2} - 3x = x(x - 3) = 0$ donc $x = 0$ ou $x = 3$."], answer: "$\\pm 3$ ; $0$ et $3$" },
      { title: "Exemple 4 — $x^{2} = a$", statement: "Résoudre $x^{2} = 7$, $x^{2} = 0$, $x^{2} = -4$.", steps: ["$7 > 0$ : $x = \\sqrt{7}$ ou $x = -\\sqrt{7}$.", "$x^{2} = 0$ : $x = 0$.", "$-4 < 0$ : aucune solution."], answer: "Deux solutions ; une solution ; aucune." },
    ],
    illustrations: [
      { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 130" role="img" aria-label="Balance en équilibre : x plus 4 d'un côté, 19 de l'autre" style="width:100%;max-width:280px;height:auto;font-family:Arial,sans-serif"><line x1="40" y1="90" x2="240" y2="90" stroke="#334155" stroke-width="3"/><line x1="140" y1="90" x2="140" y2="120" stroke="#334155" stroke-width="3"/><rect x="50" y="55" width="80" height="35" fill="#e0e7ff" stroke="#334155"/><rect x="150" y="55" width="80" height="35" fill="#fef3c7" stroke="#334155"/><text x="90" y="78" font-size="16" text-anchor="middle">3x + 4</text><text x="190" y="78" font-size="16" text-anchor="middle">19</text></svg>`, alt: "Balance en équilibre avec 3x + 4 à gauche et 19 à droite.", caption: "Ce qu'on fait d'un côté, on le fait de l'autre." },
    ],
    commonMistakes: [
      { mistake: "$x^{2} = 9$ donc $x = 3$", correction: "$x = 3$ ou $x = -3$", why: "Deux nombres opposés ont le même carré." },
      { mistake: "$x^{2} = -4$ donc $x = \\sqrt{-4}$", correction: "Aucune solution", why: "Un carré est positif ou nul." },
      { mistake: "$(x - 2)(x + 5) = 0$ donc $x = 2$ et $x = 5$", correction: "$x = 2$ ou $x = -5$", why: "On résout $x + 5 = 0$ : le signe change." },
      { mistake: "$x^{2} = 3x$ donc $x = 3$ (division par $x$)", correction: "$x = 0$ ou $x = 3$", why: "Diviser par $x$ fait perdre la solution $0$." },
      { mistake: "Garder une longueur négative comme solution d'un problème", correction: "Vérifier dans le contexte", why: "Seules les valeurs qui ont un sens sont conservées." },
    ],
    methods: [
      { title: "Résoudre une équation du premier degré", steps: ["Développer et réduire chaque membre.", "Regrouper les termes en $x$ d'un côté, les nombres de l'autre.", "Diviser par le coefficient de $x$, puis vérifier."] },
      { title: "Résoudre un produit nul", steps: ["Ramener tout dans un membre et factoriser.", "Écrire $A = 0$ ou $B = 0$.", "Résoudre chaque équation séparément."] },
      { title: "Résoudre $x^{2} = a$", steps: ["Regarder le signe de $a$.", "Si $a > 0$, écrire les deux solutions $\\sqrt{a}$ et $-\\sqrt{a}$."] },
    ],
    summary: [
      "On résout une équation en gardant l'égalité : on fait la même opération sur les deux membres.",
      "Un produit est nul si et seulement si l'un de ses facteurs est nul.",
      "$x^{2} = a$ : aucune solution si $a < 0$, une si $a = 0$, deux si $a > 0$.",
    ],
    revisionSheet: {
      keyPoints: ["$ax + b = 0$ donne $x = -b/a$.", "$A \\times B = 0 \\iff A = 0$ ou $B = 0$.", "$x^{2} = a$ avec $a > 0$ : $\\sqrt{a}$ et $-\\sqrt{a}$."],
      skills: ["Résoudre une équation du premier degré.", "Mettre un problème en équation.", "Résoudre un produit nul après factorisation et $x^{2} = a$."],
    },
    miniQuiz: [
      { question: "La solution de $3x + 4 = 19$ est…", options: ["$5$", "$7{,}67$", "$15$", "$-5$"], answer: 0, explanation: "$3x = 15$ donc $x = 5$." },
      { question: "Les solutions de $(x - 1)(x + 4) = 0$ sont…", options: ["$1$ et $4$", "$1$ et $-4$", "$-1$ et $4$", "$-1$ et $-4$"], answer: 1, explanation: "$x - 1 = 0$ ou $x + 4 = 0$." },
      { question: "L'équation $x^{2} = 16$ a pour solutions…", options: ["$4$ seulement", "$-4$ et $4$", "$8$", "aucune"], answer: 1, explanation: "$4^{2} = (-4)^{2} = 16$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "eq3-jeu-flash", template: "calcul-flash", title: "Flash équations",
      objective: "Résoudre rapidement des équations simples et reconnaître le nombre de solutions.",
      instructions: "Réponds le plus vite possible par un nombre.",
      objectives: ["M3-NC-12", "M3-NC-13", "M3-NC-14"],
      config: flashConfig([
        ["Premier degré", [
          ["Résous $2x = 14$", "7", "$14 \\div 2$."],
          ["Résous $x + 5 = 2$", "-3", "$2 - 5$."],
          ["Résous $3x + 1 = 10$", "3", "$3x = 9$."],
          ["Résous $5x - 4 = 11$", "3", "$5x = 15$."],
          ["Résous $4x - 7 = 5$", "3", "$4x = 12$."],
          ["Résous $7x = -21$", "-3", "$-21 \\div 7$."],
        ]],
        ["Produit nul", [
          ["Plus grande solution de $(x - 3)(x + 8) = 0$", "3", "$x = 3$ ou $x = -8$."],
          ["Plus petite solution de $(x - 3)(x + 8) = 0$", "-8", "$x + 8 = 0$."],
          ["Plus grande solution de $x(x - 6) = 0$", "6", "$x = 0$ ou $x = 6$."],
          ["Plus petite solution de $x(x - 6) = 0$", "0", "$x = 0$ ou $x = 6$."],
          ["Plus grande solution de $(x + 1)(x - 5) = 0$", "5", "$x = -1$ ou $x = 5$."],
          ["Plus petite solution de $(x + 1)(x - 5) = 0$", "-1", "$x + 1 = 0$."],
        ]],
        ["$x^{2} = a$", [
          ["Solution positive de $x^{2} = 49$", "7", "$7^{2} = 49$."],
          ["Solution négative de $x^{2} = 81$", "-9", "$(-9)^{2} = 81$."],
          ["Solution positive de $x^{2} = 144$", "12", "$12^{2} = 144$."],
          ["Solution négative de $x^{2} = 16$", "-4", "$(-4)^{2} = 16$."],
          ["Solution positive de $x^{2} = 100$", "10", "$10^{2} = 100$."],
          ["Solution négative de $x^{2} = 36$", "-6", "$(-6)^{2} = 36$."],
        ]],
      ]),
    },
    {
      id: "eq3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs d'équations",
      objective: "Repérer les erreurs classiques sur les racines, les signes et le produit nul.",
      instructions: "Pour chaque affirmation, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
      objectives: ["M3-NC-12", "M3-NC-13", "M3-NC-14"],
      config: erreursConfig([
        [1, "$2x + 3 = 11$ donne $x = 4$", "$2x = 8$ donc $x = 4$."],
        [2, "$(x - 2)(x + 5) = 0$ donne $x = 2$ ou $x = 5$", "Le second facteur donne $x = -5$.", ["Le signe de la solution du second facteur n'a pas été changé", "Les deux facteurs ont été additionnés", "Il fallait diviser par $x$"], 0],
        [2, "$x^{2} = 9$ donne $x = 3$ ou $x = -3$", "Deux nombres opposés ont le même carré."],
        [3, "$x^{2} = 3x$ donne $x = 3$ en divisant par $x$", "On perd la solution $0$ : $x(x - 3) = 0$.", ["Diviser par l'inconnue fait perdre une solution", "$x = 3$ est fausse", "Il fallait prendre une racine carrée"], 0],
        [3, "$x^{2} = -4$ donne $x = \\sqrt{-4}$", "Aucune solution : un carré n'est jamais négatif.", ["Un carré ne peut pas être négatif", "Il manque une solution", "Il fallait diviser par $-4$"], 0],
        [3, "$x^{2} - 25 = 0$ donne $x = 5$ ou $x = -5$", "$(x - 5)(x + 5) = 0$."],
      ]),
    },
    {
      id: "eq3-jeu-memory", template: "memory", title: "Memory des équations",
      objective: "Associer une équation à l'ensemble de ses solutions.",
      instructions: "Retourne deux cartes : si l'équation correspond à ses solutions, la paire reste visible.",
      objectives: ["M3-NC-12", "M3-NC-13", "M3-NC-14"],
      config: { pairs: [
        ["$2x + 1 = 9$", "$x = 4$"],
        ["$(x - 1)(x + 2) = 0$", "$x = 1$ ou $x = -2$"],
        ["$x^{2} = 25$", "$x = 5$ ou $x = -5$"],
        ["$x^{2} = 0$", "$x = 0$"],
        ["$x^{2} = -3$", "aucune solution"],
        ["$x(x - 4) = 0$", "$x = 0$ ou $x = 4$"],
      ] },
    },
  ],
};
