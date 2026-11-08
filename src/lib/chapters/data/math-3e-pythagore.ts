// SCI-3E-MATH-017 — Mathématiques 3e : Théorème de Pythagore et réciproque.
// Chapitre de consolidation : le théorème de Pythagore et sa réciproque sont des notions de 4e
// (M4-EG-03, M4-EG-04), mobilisées en 3e (DNB). Seul objectif rattaché à la 3e : M3-AUTO-03 (images mentales).
// Contenu original rédigé à partir du dossier research/dossiers/math-3e-pythagore.md.
// Remarque : la citation officielle retenue ne mentionne que la démonstration « le triangle est rectangle » ;
// montrer qu'un triangle n'est pas rectangle (contraposée) est présenté comme prolongement logique du théorème.
// Pilote : 20 exercices.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, Rng } from "../../engine/types";
import { parseNumber, tex } from "../../engine/numbers";

const T = (x: number) => tex(x);
const isSq = (n: number) => Number.isInteger(Math.sqrt(n));

/** Triplets pythagoriciens primitifs (a, b, c) avec a² + b² = c². */
const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
/** Triplet multiplié par un facteur ; l'ordre des deux côtés de l'angle droit est aléatoire. */
function triple(rng: Rng, n = 4, ks: number[] = [1, 2, 3]): [number, number, number] {
  const [a, b, c] = rng.pick(TRIPLES.slice(0, n));
  const k = rng.pick(ks);
  return rng.next() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}
const NAMES: [string, string, string][] = [["A", "B", "C"], ["E", "F", "G"], ["K", "L", "M"], ["R", "S", "T"]];

const num = (value: number, mistakes: Mistake[] = [], prompt?: string, suffix?: string): ChapterPart => ({
  prompt,
  interaction: { kind: "numerique", suffix, answer: { value } },
  mistakes: mistakes.filter((m) => parseNumber(m.match)?.value !== value),
});
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
/** Mélange des options en conservant la bonne réponse et les diagnostics (indices d'origine). */
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const etapes = (steps: { prompt: string; value: number; suffix?: string }[]): ChapterPart => ({ interaction: { kind: "etapes", steps: steps.map((s) => ({ prompt: s.prompt, suffix: s.suffix, answer: { value: s.value } })) } });

const O = {
  "M3-AUTO-03": "Images mentales des configurations de Pythagore, Thalès et des lignes trigonométriques.",
  "M4-EG-03": "Calculer une longueur dans un triangle rectangle avec le théorème de Pythagore.",
  "M4-EG-04": "Démontrer qu'un triangle est rectangle (réciproque).",
} as const;
type Obj = keyof typeof O;
const SRC_3E = "Programme du cycle 4 (BO n° 31 du 30 juillet 2020), thème D, automatismes : « images mentales (configurations de Pythagore et de Thalès, lignes trigonométriques dans un triangle rectangle) »";
const SRC_4E = "Consolidation de 4e — Attendus de fin d'année de 4e (2019), p. 10 ; repères annuels de progression du cycle 4 (BO n° 22 du 29 mai 2019), géométrie plane en 4e";

const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

// ───────────────────────── Figures ─────────────────────────
const squaresSvg = (la: string, lb: string, lc: string, aria: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240" role="img" aria-label="${aria}" style="width:100%;max-width:300px;height:auto;font-family:Inter,Arial,sans-serif">` +
  `<polygon points="50,90 110,90 110,150 50,150" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2"/>` +
  `<polygon points="110,150 190,150 190,230 110,230" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>` +
  `<polygon points="110,90 190,150 250,70 170,10" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>` +
  `<polygon points="110,90 110,150 190,150" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>` +
  `<rect x="110" y="138" width="12" height="12" fill="none" stroke="#0f172a"/>` +
  `<text x="80" y="125" font-size="16" text-anchor="middle" fill="#3730a3">${la}</text>` +
  `<text x="150" y="195" font-size="16" text-anchor="middle" fill="#166534">${lb}</text>` +
  `<text x="180" y="85" font-size="16" text-anchor="middle" fill="#92400e">${lc}</text>` +
  `<text x="94" y="84" font-size="14" fill="#0f172a">B</text><text x="94" y="166" font-size="14" fill="#0f172a">A</text><text x="196" y="164" font-size="14" fill="#0f172a">C</text></svg>`;

const ladderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 210" role="img" aria-label="Une échelle appuyée contre un mur vertical : l'échelle, le mur et le sol forment un triangle rectangle" style="width:100%;max-width:280px;height:auto;font-family:Inter,Arial,sans-serif">` +
  `<rect x="220" y="20" width="30" height="170" fill="#e2e8f0"/><line x1="20" y1="190" x2="260" y2="190" stroke="#334155" stroke-width="2"/>` +
  `<line x1="110" y1="190" x2="220" y2="50" stroke="#b45309" stroke-width="5"/>` +
  `<rect x="208" y="178" width="12" height="12" fill="none" stroke="#0f172a"/>` +
  `<text x="235" y="14" font-size="13" text-anchor="middle" fill="#334155">mur</text><text x="160" y="206" font-size="13" text-anchor="middle" fill="#334155">sol</text>` +
  `<text x="132" y="108" font-size="13" fill="#b45309">échelle</text></svg>`;

// ───────────────────────── Exercices ─────────────────────────
const RED_STEPS = [
  "Dans le triangle $ABC$ rectangle en $A$, d'après le théorème de Pythagore, on a $BC^2 = AB^2 + AC^2$.",
  "$BC^2 = 6^2 + 8^2 = 36 + 64 = 100$.",
  "$BC$ est une longueur positive, donc $BC = \\sqrt{100} = 10$.",
  "Conclusion : $BC = 10$ cm.",
];
const redItems = [RED_STEPS[2], RED_STEPS[0], RED_STEPS[3], RED_STEPS[1]];

const BREV_STEPS = [
  "Dans le triangle $EFG$, le plus grand côté est $[FG]$ : $FG = 16$ cm.",
  "$FG^2 = 16^2 = 256$.",
  "$EF^2 + EG^2 = 9^2 + 12^2 = 81 + 144 = 225$.",
  "$FG^2 \\neq EF^2 + EG^2$ ($256 \\neq 225$) : si $EFG$ était rectangle en $E$, le théorème de Pythagore donnerait l'égalité. Donc $EFG$ n'est pas rectangle en $E$.",
];
const brevItems = [BREV_STEPS[2], BREV_STEPS[3], BREV_STEPS[0], BREV_STEPS[1]];

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "py3-01", title: "Repérer l'hypoténuse", niveau: 1, objectives: ["M3-AUTO-03"], time: 60,
    vary: (rng) => {
      const [A, B, C] = rng.pick(NAMES);
      return {
        statement: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$. Quel côté est son hypoténuse ?`,
        parts: [shuffledQcm(rng, [`$[${B}${C}]$`, `$[${A}${B}]$`, `$[${A}${C}]$`, "On ne peut pas le savoir"], 0, {
          1: `$[${A}${B}]$ touche l'angle droit : c'est un côté de l'angle droit, pas l'hypoténuse.`,
          2: `$[${A}${C}]$ touche l'angle droit : c'est un côté de l'angle droit, pas l'hypoténuse.`,
          3: "L'angle droit est donné : l'hypoténuse est le côté qui lui est opposé.",
        })],
        solution: [`L'angle droit est en $${A}$.`, `L'hypoténuse est le côté opposé à l'angle droit : c'est $[${B}${C}]$, le plus long côté du triangle.`],
      };
    },
    reasoning: "L'hypoténuse est toujours en face de l'angle droit ; les deux autres côtés « entourent » l'angle droit.",
    hints: ["Repère le sommet de l'angle droit.", "L'hypoténuse ne touche pas ce sommet."],
  }),
  ex({
    id: "py3-02", title: "Écrire la bonne égalité", niveau: 1, objectives: ["M3-AUTO-03", "M4-EG-03"], time: 90,
    vary: (rng) => {
      const [A, B, C] = rng.pick(NAMES);
      return {
        statement: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$. Quelle égalité donne le théorème de Pythagore ?`,
        parts: [shuffledQcm(rng, [
          `$${B}${C}^2 = ${A}${B}^2 + ${A}${C}^2$`,
          `$${A}${B}^2 = ${B}${C}^2 + ${A}${C}^2$`,
          `$${B}${C} = ${A}${B} + ${A}${C}$`,
          `$${B}${C}^2 = ${A}${B} + ${A}${C}$`,
        ], 0, {
          1: `Ici $[${A}${B}]$ n'est pas l'hypoténuse : le carré de l'hypoténuse est seul d'un côté de l'égalité.`,
          2: "Tu as additionné les longueurs : ce sont les **carrés** des longueurs qu'on additionne.",
          3: "Il manque les carrés dans la somme : $AB$ et $AC$ doivent être élevés au carré.",
        })],
        solution: [`L'hypoténuse est $[${B}${C}]$ (en face de l'angle droit en $${A}$).`, `Le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés : $${B}${C}^2 = ${A}${B}^2 + ${A}${C}^2$.`],
      };
    },
    reasoning: "L'image à garder : l'aire du grand carré (sur l'hypoténuse) est la somme des aires des deux petits carrés.",
    hints: ["Quel est le côté le plus long ?", "Son carré est seul d'un côté de l'égalité."],
  }),
  ex({
    id: "py3-03", title: "Théorème, réciproque : vrai ou faux ?", niveau: 1, objectives: ["M3-AUTO-03", "M4-EG-04"], time: 150,
    statement: "Vrai ou faux ?",
    parts: [{ interaction: { kind: "vrai-faux", items: [
      "Le théorème de Pythagore s'applique à n'importe quel triangle.",
      "Dans un triangle rectangle, l'hypoténuse est le plus long côté.",
      "Si $ABC$ est rectangle en $A$, alors $BC^2 = AB^2 + AC^2$.",
      "Si $BC^2 = AB^2 + AC^2$, alors $ABC$ est rectangle en $A$.",
      "Un triangle de côtés $3$ cm, $4$ cm et $6$ cm est rectangle.",
      "On peut prouver qu'un triangle est rectangle en mesurant l'angle sur le dessin.",
    ], answer: [false, true, true, true, false, false] } }],
    solution: [
      "Faux : il faut que le triangle soit rectangle (ou que l'égalité soit vérifiée, pour la réciproque).",
      "Vrai : l'hypoténuse est opposée à l'angle droit, c'est le plus long côté.",
      "Vrai : c'est le théorème de Pythagore.",
      "Vrai : c'est la réciproque du théorème de Pythagore.",
      "Faux : $6^2 = 36$ et $3^2 + 4^2 = 25$, les deux résultats sont différents.",
      "Faux : une mesure sur un dessin n'est pas une preuve ; on utilise la réciproque avec les longueurs.",
    ],
    reasoning: "Le théorème part d'un triangle rectangle pour donner une égalité ; la réciproque part de l'égalité pour prouver que le triangle est rectangle.",
    hints: ["Pour la dernière, compare $6^2$ et $3^2 + 4^2$.", "Distingue ce qu'on suppose et ce qu'on en déduit."],
  }),
  ex({
    id: "py3-04", title: "Les trois carrés de la configuration", niveau: 1, objectives: ["M3-AUTO-03"], time: 120,
    vary: (rng) => {
      const [a, b, c] = triple(rng, 4, [1]);
      return {
        statement: `Un triangle rectangle a pour côtés de l'angle droit $a = ${a}$ cm et $b = ${b}$ cm, et pour hypoténuse $c = ${c}$ cm. On construit un carré sur chacun de ses trois côtés (voir la figure).`,
        figure: { kind: "svg", svg: squaresSvg("a²", "b²", "c²", "Triangle rectangle avec un carré construit sur chacun de ses trois côtés, d'aires a au carré, b au carré et c au carré"), caption: "Un carré sur chaque côté du triangle rectangle." },
        parts: [etapes([
          { prompt: `Aire du carré construit sur le côté de longueur ${a} cm`, value: a * a, suffix: "cm²" },
          { prompt: `Aire du carré construit sur le côté de longueur ${b} cm`, value: b * b, suffix: "cm²" },
          { prompt: `Aire du carré construit sur l'hypoténuse (${c} cm)`, value: c * c, suffix: "cm²" },
        ])],
        solution: [`Aire d'un carré de côté $x$ : $x^2$. Donc $${a}^2 = ${a * a}$, $${b}^2 = ${b * b}$ et $${c}^2 = ${c * c}$.`, `On constate que $${a * a} + ${b * b} = ${a * a + b * b} = ${c * c}$ : l'aire du grand carré est la somme des aires des deux petits.`],
      };
    },
    reasoning: "Cette image mentale (le grand carré sur l'hypoténuse est la somme des deux petits) est la traduction géométrique de l'égalité de Pythagore.",
    hints: ["L'aire d'un carré de côté $x$ vaut $x \\times x$.", "Compare la somme des deux petites aires avec la grande."],
  }),
  // ── Niveau 2 : Application directe ──
  ex({
    id: "py3-05", title: "Calculer l'hypoténuse", niveau: 2, objectives: ["M4-EG-03"], time: 90,
    vary: (rng) => {
      const [a, b, c] = triple(rng);
      const [A, B, C] = rng.pick(NAMES);
      return {
        statement: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$, avec $${A}${B} = ${a}$ cm et $${A}${C} = ${b}$ cm. Calcule $${B}${C}$.`,
        parts: [num(c, [
          { match: String(a + b), feedback: "Tu as additionné les longueurs : il faut additionner les **carrés** des longueurs." },
          { match: String(a * a + b * b), feedback: `Tu as calculé $${B}${C}^2$ : il reste à prendre la racine carrée.` },
        ], undefined, "cm")],
        solution: [`$${A}${B}${C}$ est rectangle en $${A}$ : d'après le théorème de Pythagore, $${B}${C}^2 = ${A}${B}^2 + ${A}${C}^2$.`, `$${B}${C}^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$.`, `$${B}${C}$ est positif, donc $${B}${C} = \\sqrt{${a * a + b * b}} = ${c}$ cm.`],
      };
    },
    reasoning: "On additionne les carrés des deux côtés de l'angle droit, puis on prend la racine carrée.",
    hints: ["Repère l'hypoténuse : c'est l'inconnue.", "Écris l'égalité de Pythagore avec les carrés.", "Termine par une racine carrée."],
  }),
  ex({
    id: "py3-06", title: "Calculer un côté de l'angle droit", niveau: 2, objectives: ["M4-EG-03"], time: 120,
    vary: (rng) => {
      const [a, b, c] = triple(rng);
      const [A, B, C] = rng.pick(NAMES);
      return {
        statement: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$, avec $${B}${C} = ${c}$ cm et $${A}${B} = ${a}$ cm. Calcule $${A}${C}$.`,
        parts: [num(b, [
          { match: String(c * c - a * a), feedback: `Tu as calculé $${A}${C}^2$ : il reste à prendre la racine carrée.` },
          { match: String(c * c + a * a), feedback: `Ici l'inconnue est un côté de l'angle droit : $${B}${C}$ est l'hypoténuse, on **soustrait** les carrés.` },
          { match: String(c - a), feedback: "Tu as soustrait les longueurs : il faut soustraire les **carrés**, puis prendre la racine." },
        ], undefined, "cm")],
        solution: [`$[${B}${C}]$ est l'hypoténuse : $${B}${C}^2 = ${A}${B}^2 + ${A}${C}^2$, donc $${A}${C}^2 = ${B}${C}^2 - ${A}${B}^2$.`, `$${A}${C}^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b * b}$.`, `$${A}${C} = \\sqrt{${b * b}} = ${b}$ cm.`],
      };
    },
    reasoning: "Quand l'inconnue est un côté de l'angle droit, on soustrait le carré du côté connu au carré de l'hypoténuse.",
    hints: ["Identifie d'abord l'hypoténuse.", "Isole le carré de l'inconnue : $AC^2 = BC^2 - AB^2$."],
  }),
  ex({
    id: "py3-07", title: "Compléter les étapes du calcul", niveau: 2, objectives: ["M4-EG-03"], time: 120,
    vary: (rng) => {
      const [a, b, c] = triple(rng);
      return {
        statement: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ cm et $AC = ${b}$ cm. Complète le tableau pour calculer $BC$.`,
        parts: [{ interaction: { kind: "tableau", headers: ["Calcul", "Résultat"], rows: [
          { label: "$AB^2$", cells: [{ answer: { value: a * a } }] },
          { label: "$AC^2$", cells: [{ answer: { value: b * b } }] },
          { label: "$BC^2 = AB^2 + AC^2$", cells: [{ answer: { value: a * a + b * b } }] },
          { label: "$BC$ (en cm)", cells: [{ answer: { value: c } }] },
        ] } }],
        solution: [`$AB^2 = ${a}^2 = ${a * a}$ et $AC^2 = ${b}^2 = ${b * b}$.`, `$BC^2 = ${a * a} + ${b * b} = ${a * a + b * b}$.`, `$BC = \\sqrt{${a * a + b * b}} = ${c}$ cm.`],
      };
    },
    reasoning: "Décomposer le calcul en étapes évite d'oublier la racine carrée finale.",
    hints: ["Calcule d'abord les deux carrés.", "Additionne-les, puis prends la racine carrée."],
  }),
  ex({
    id: "py3-08", title: "Remettre la rédaction dans l'ordre", niveau: 2, objectives: ["M4-EG-03"], time: 120,
    statement: "On veut calculer $BC$ dans le triangle $ABC$ rectangle en $A$, avec $AB = 6$ cm et $AC = 8$ cm. Remets les étapes de la rédaction dans l'ordre.",
    parts: [{ interaction: { kind: "ordonner", items: redItems, answer: RED_STEPS.map((s) => redItems.indexOf(s)), hint: "Première étape en haut, conclusion en bas" } }],
    solution: [...RED_STEPS.slice(0, 3), RED_STEPS[3]],
    reasoning: "Une bonne rédaction cite le théorème, remplace, calcule, prend la racine, puis conclut avec l'unité.",
    hints: ["La première phrase nomme le triangle et le théorème.", "La conclusion donne la longueur avec son unité."],
  }),
  // ── Niveau 3 : Entraînement ──
  ex({
    id: "py3-09", title: "Une valeur approchée de l'hypoténuse", niveau: 3, objectives: ["M4-EG-03"], time: 150,
    vary: (rng) => {
      let a = 0, b = 0, s = 0;
      do { a = rng.int(2, 9); b = rng.int(2, 9); s = a * a + b * b; } while (isSq(s) || Math.abs((Math.sqrt(s) * 10) % 1 - 0.5) < 0.05);
      const v = Math.round(Math.sqrt(s) * 10) / 10;
      return {
        statement: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ cm et $AC = ${b}$ cm. Calcule $BC$ et donne l'arrondi au dixième.`,
        parts: [{
          interaction: { kind: "numerique", suffix: "cm", answer: { value: v, tol: 0.001, decimals: 1, roundingLabel: "au dixième" } },
          mistakes: [
            { match: String(a + b), feedback: "Tu as additionné les longueurs : il faut additionner les **carrés**." },
            { match: String(s), feedback: "Tu as donné $BC^2$ : il reste à prendre la racine carrée." },
          ].filter((m) => Number(m.match) !== v),
        }],
        solution: [`$ABC$ est rectangle en $A$ : $BC^2 = AB^2 + AC^2 = ${a}^2 + ${b}^2 = ${s}$.`, `$BC = \\sqrt{${s}}$, valeur exacte non décimale.`, `À la calculatrice, $BC \\approx ${T(v)}$ cm (arrondi au dixième).`],
      };
    },
    reasoning: "Quand le résultat n'est pas un carré parfait, on garde $\\sqrt{\\ }$ pour la valeur exacte et on arrondit seulement à la fin.",
    hints: ["Calcule $BC^2$ d'abord.", "Utilise la touche racine carrée de la calculatrice.", "Arrondis seulement le résultat final."],
  }),
  ex({
    id: "py3-10", title: "La valeur exacte de l'hypoténuse", niveau: 3, objectives: ["M4-EG-03"], time: 120,
    vary: (rng) => {
      let a = 0, b = 0, s = 0;
      do { a = rng.int(2, 9); b = rng.int(2, 9); s = a * a + b * b; } while (isSq(s) || a >= b);
      const [E, F, G] = rng.pick(NAMES);
      return {
        statement: `Le triangle $${E}${F}${G}$ est rectangle en $${E}$, avec $${E}${F} = ${a}$ cm et $${E}${G} = ${b}$ cm. Quelle est la valeur **exacte** de $${F}${G}$ ?`,
        parts: [shuffledQcm(rng, [`$\\sqrt{${s}}$ cm`, `$\\sqrt{${b * b - a * a}}$ cm`, `$${a + b}$ cm`, `$${s}$ cm`], 0, {
          1: `Tu as soustrait : mais $[${F}${G}]$ est l'hypoténuse, on additionne les carrés.`,
          2: "Tu as additionné les longueurs au lieu de leurs carrés.",
          3: `Tu as donné $${F}${G}^2$ : il manque la racine carrée.`,
        })],
        solution: [`$${F}${G}^2 = ${E}${F}^2 + ${E}${G}^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${s}$.`, `$${s}$ n'est pas un carré parfait : la valeur exacte est $${F}${G} = \\sqrt{${s}}$ cm.`],
      };
    },
    reasoning: "$\\sqrt{a}$ est la valeur exacte ; une valeur décimale affichée par la calculatrice n'en est qu'une approximation.",
    hints: ["Calcule la somme des carrés.", "Ne remplace pas la racine par un décimal : on demande la valeur exacte."],
  }),
  ex({
    id: "py3-11", title: "Rectangle ou non rectangle ?", niveau: 3, objectives: ["M4-EG-04"], time: 180,
    vary: (rng) => {
      const mk = (t: number[]) => t.slice().sort((x, y) => x - y);
      const rect = rng.shuffle(TRIPLES.slice(0, 5)).slice(0, 3).map((t) => { const k = rng.pick([1, 2]); return mk(t.map((x) => x * k)); });
      const non = rng.shuffle(TRIPLES.slice(0, 5)).slice(0, 3).map(([a, b, c]) => {
        const k = rng.pick([1, 2]); const v = rng.int(0, 2);
        return mk(v === 0 ? [a * k, b * k, c * k + 1] : v === 1 ? [a * k + 1, b * k, c * k] : [a * k, b * k + 1, c * k]);
      });
      const tris = rng.shuffle([...rect, ...non]);
      const isRect = (t: number[]) => t[0] * t[0] + t[1] * t[1] === t[2] * t[2];
      return {
        statement: "Voici les longueurs des côtés (en cm) de six triangles. Classe-les : rectangle ou non rectangle ?",
        parts: [{ interaction: { kind: "classer", categories: ["Rectangle", "Non rectangle"], items: tris.map(([x, y, z]) => `$${x}$ ; $${y}$ ; $${z}$`), answer: tris.map((t) => (isRect(t) ? 0 : 1)) } }],
        solution: tris.map(([x, y, z]) => `Plus grand côté $${z}$ : $${z}^2 = ${z * z}$ et $${x}^2 + ${y}^2 = ${x * x + y * y}$. ${isRect([x, y, z]) ? "Égalité : triangle rectangle (réciproque)." : "Résultats différents : triangle non rectangle."}`),
      };
    },
    reasoning: "On compare le carré du plus grand côté avec la somme des carrés des deux autres.",
    hints: ["Repère le plus grand côté.", "Calcule son carré, puis la somme des deux autres carrés, et compare."],
  }),
  ex({
    id: "py3-12", title: "Longueurs décimales", niveau: 3, objectives: ["M4-EG-03"], time: 150,
    vary: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES.slice(0, 3));
      const m = rng.pick([2, 3, 4, 5]);
      const sw = rng.next() < 0.5;
      const x = (sw ? b : a) * m, y = (sw ? a : b) * m, h = c * m;
      return {
        statement: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${T(x / 10)}$ m et $AC = ${T(y / 10)}$ m. Calcule $BC$ (valeur exacte, un décimal).`,
        parts: [{
          interaction: { kind: "numerique", suffix: "m", answer: { value: h / 10, tol: 1e-9 } },
          mistakes: [
            { match: String((x + y) / 10), feedback: "Tu as additionné les longueurs : il faut additionner les **carrés**." },
            { match: String(Math.round(((x * x + y * y) / 100) * 100) / 100), feedback: "Tu as donné $BC^2$ : il reste à prendre la racine carrée." },
          ].filter((d) => Number(d.match) !== h / 10), // BC = 1 ⇒ BC² = BC : diagnostic retiré
        }],
        solution: [`$BC^2 = ${T(x / 10)}^2 + ${T(y / 10)}^2 = ${T((x * x) / 100)} + ${T((y * y) / 100)} = ${T((x * x + y * y) / 100)}$.`, `$BC = \\sqrt{${T((x * x + y * y) / 100)}} = ${T(h / 10)}$ m.`],
      };
    },
    reasoning: "Les décimaux se traitent comme les entiers : on élève au carré, on additionne, on prend la racine.",
    hints: ["Élève chaque longueur au carré (attention à la virgule).", "Cherche un décimal dont le carré est le résultat."],
  }),
  // ── Niveau 4 : Problèmes ──
  ex({
    id: "py3-13", title: "L'échelle contre le mur", niveau: 4, objectives: ["M4-EG-03", "M3-AUTO-03"], time: 180,
    vary: (rng) => {
      const [f, h, l] = rng.pick<[number, number, number]>([[15, 20, 25], [25, 60, 65], [30, 40, 50]]);
      return {
        statement: `Une échelle de $${T(l / 10)}$ m est appuyée contre un mur vertical ; son pied est posé sur le sol horizontal à $${T(f / 10)}$ m du mur.`,
        figure: { kind: "svg", svg: ladderSvg, caption: "L'échelle, le mur et le sol forment un triangle rectangle." },
        parts: [
          qcm(["l'échelle", "le mur", "le sol"], 0, [
            { match: "1", feedback: "Le mur est un côté de l'angle droit." },
            { match: "2", feedback: "Le sol est un côté de l'angle droit." },
          ], "1. Quel côté du triangle est l'hypoténuse ?"),
          {
            prompt: "2. À quelle hauteur du sol l'échelle touche-t-elle le mur ? (en m)",
            interaction: { kind: "numerique", suffix: "m", answer: { value: h / 10, tol: 1e-9 } },
            mistakes: [
              { match: String(Math.round(((l * l - f * f) / 100) * 100) / 100), feedback: "Tu as donné la hauteur au carré : prends la racine carrée." },
              { match: String((l - f) / 10), feedback: "Tu as soustrait les longueurs : il faut soustraire les **carrés**." },
            ],
          },
        ],
        solution: ["Le mur est vertical et le sol horizontal : le triangle est rectangle ; l'échelle, opposée à l'angle droit, est l'hypoténuse.", `Hauteur $h$ : $h^2 = ${T(l / 10)}^2 - ${T(f / 10)}^2 = ${T((l * l) / 100)} - ${T((f * f) / 100)} = ${T((h * h) / 100)}$.`, `$h = \\sqrt{${T((h * h) / 100)}} = ${T(h / 10)}$ m.`],
      };
    },
    reasoning: "Modéliser : la situation réelle est un triangle rectangle dont l'échelle est l'hypoténuse ; on cherche un côté de l'angle droit.",
    hints: ["Dessine le triangle : où est l'angle droit ?", "L'échelle est le plus long côté.", "Soustrais les carrés."],
  }),
  ex({
    id: "py3-14", title: "Diagonale d'un panneau", niveau: 4, objectives: ["M4-EG-03"], time: 180,
    vary: (rng) => {
      const [a, b, c] = triple(rng, 4, [2, 3, 4]);
      return {
        statement: `Un panneau rectangulaire mesure $${a}$ cm de large et $${b}$ cm de haut. On y fixe une barre diagonale.`,
        parts: [etapes([
          { prompt: "Longueur de la diagonale", value: c, suffix: "cm" },
          { prompt: "Périmètre du panneau", value: 2 * (a + b), suffix: "cm" },
          { prompt: "Aire du panneau", value: a * b, suffix: "cm²" },
        ])],
        solution: [`La diagonale partage le rectangle en deux triangles rectangles : $d^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$, donc $d = ${c}$ cm.`, `Périmètre : $2 \\times (${a} + ${b}) = ${2 * (a + b)}$ cm.`, `Aire : $${a} \\times ${b} = ${a * b}$ cm².`],
      };
    },
    reasoning: "Un rectangle a quatre angles droits : sa diagonale est l'hypoténuse d'un triangle rectangle dont les côtés sont la largeur et la hauteur.",
    hints: ["Repère un triangle rectangle dans le rectangle.", "La diagonale est son hypoténuse."],
  }),
  ex({
    id: "py3-15", title: "Distance dans un repère", niveau: 4, objectives: ["M4-EG-03"], time: 210,
    vary: (rng) => {
      const [dx, dy, c] = triple(rng, 4, [1]);
      const x0 = rng.int(-3, 3), y0 = rng.int(-3, 3);
      const x1 = x0 + rng.sign() * dx, y1 = y0 + rng.sign() * dy;
      return {
        statement: `Dans un repère orthonormé d'unité $1$ cm, on place $A(${x0}\\,;\\,${y0})$ et $B(${x1}\\,;\\,${y1})$. Soit $H$ le point de coordonnées $(${x1}\\,;\\,${y0})$ : le triangle $AHB$ est rectangle en $H$.`,
        parts: [etapes([
          { prompt: "Longueur $AH$ (écart horizontal)", value: dx, suffix: "cm" },
          { prompt: "Longueur $HB$ (écart vertical)", value: dy, suffix: "cm" },
          { prompt: "Distance $AB$", value: c, suffix: "cm" },
        ])],
        solution: [`$AH = |${x1} - ${x0}| = ${dx}$ cm et $HB = |${y1} - ${y0}| = ${dy}$ cm.`, `$AHB$ est rectangle en $H$ : $AB^2 = AH^2 + HB^2 = ${dx * dx} + ${dy * dy} = ${c * c}$.`, `$AB = \\sqrt{${c * c}} = ${c}$ cm.`],
      };
    },
    reasoning: "Dans un repère orthonormé, les écarts de coordonnées donnent les côtés d'un triangle rectangle ; Pythagore donne la distance.",
    hints: ["Les écarts de coordonnées donnent $AH$ et $HB$.", "Applique Pythagore dans $AHB$."],
  }),
  ex({
    id: "py3-16", title: "Hauteur d'un triangle isocèle", niveau: 4, objectives: ["M4-EG-03"], time: 210,
    vary: (rng) => {
      const [a, h, c] = triple(rng, 4, [1, 2, 3]);
      return {
        statement: `Le triangle $ABC$ est isocèle en $A$ avec $AB = AC = ${c}$ cm et $BC = ${2 * a}$ cm. Le point $H$ est le milieu de $[BC]$ ; la droite $(AH)$ est la hauteur issue de $A$, donc $ABH$ est rectangle en $H$.`,
        parts: [etapes([
          { prompt: "Longueur $BH$", value: a, suffix: "cm" },
          { prompt: "Hauteur $AH$", value: h, suffix: "cm" },
          { prompt: "Aire du triangle $ABC$", value: a * h, suffix: "cm²" },
        ])],
        solution: [`$H$ est le milieu de $[BC]$ : $BH = ${2 * a} \\div 2 = ${a}$ cm.`, `$ABH$ est rectangle en $H$ : $AH^2 = AB^2 - BH^2 = ${c * c} - ${a * a} = ${h * h}$, donc $AH = ${h}$ cm.`, `Aire : $\\dfrac{${2 * a} \\times ${h}}{2} = ${a * h}$ cm².`],
      };
    },
    reasoning: "La hauteur d'un triangle isocèle le partage en deux triangles rectangles identiques ; $[AB]$ en est l'hypoténuse.",
    hints: ["Quel est le côté opposé à l'angle droit dans $ABH$ ?", "Pour l'aire : base × hauteur ÷ 2."],
  }),
  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "py3-17", title: "Type Brevet — Le cadre est-il d'équerre ?", niveau: 5, objectives: ["M4-EG-04"], time: 300,
    vary: (rng) => {
      const [a, b, c] = triple(rng);
      const rect = rng.next() < 0.5;
      const d = rect ? c : c + 1;
      return {
        statement: `Pour vérifier qu'un cadre est d'équerre, un artisan mesure un triangle $ABC$ : $AB = ${a}$ cm, $AC = ${b}$ cm et $BC = ${d}$ cm. Il veut savoir si $ABC$ est rectangle en $A$.`,
        parts: [
          num(d * d, [{ match: String(d), feedback: "Tu as donné la longueur : on demande son **carré**." }], "1. Calcule $BC^2$ (le plus grand côté est $[BC]$).", "cm²"),
          num(a * a + b * b, [{ match: String(a + b), feedback: "Il faut additionner les carrés, pas les longueurs." }], "2. Calcule $AB^2 + AC^2$.", "cm²"),
          shuffledQcm(rng, [
            "$ABC$ est rectangle en $A$, d'après la réciproque du théorème de Pythagore.",
            "$ABC$ n'est pas rectangle en $A$ : les deux résultats sont différents (contraposée du théorème de Pythagore).",
            "$ABC$ est rectangle en $A$ car l'angle a l'air droit sur le dessin.",
          ], rect ? 0 : 1, {
            [rect ? 1 : 0]: rect ? "Les deux nombres sont égaux : la réciproque s'applique." : "Les deux nombres sont différents : la réciproque ne s'applique pas.",
            2: "Une impression visuelle ou une mesure ne prouve rien : il faut comparer les carrés.",
          }, "3. Quelle conclusion est correcte ?"),
        ],
        solution: [`1. $BC^2 = ${d}^2 = ${d * d}$.`, `2. $AB^2 + AC^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$.`, rect ? `3. $BC^2 = AB^2 + AC^2$ : d'après la réciproque du théorème de Pythagore, $ABC$ est rectangle en $A$.` : `3. $BC^2 \\neq AB^2 + AC^2$ ($${d * d} \\neq ${a * a + b * b}$) : si $ABC$ était rectangle en $A$, le théorème de Pythagore donnerait l'égalité. Donc $ABC$ n'est pas rectangle en $A$.`],
      };
    },
    reasoning: "Rédaction attendue : isoler le plus grand côté, calculer les deux quantités séparément, les comparer, puis citer la réciproque (ou la contraposée) et conclure.",
    hints: ["Le plus grand côté est le candidat pour l'hypoténuse.", "Calcule séparément les deux quantités sans arrondir.", "Égalité → réciproque ; sinon → le triangle n'est pas rectangle."],
  }),
  ex({
    id: "py3-18", title: "Type Brevet — Clôturer et semer un jardin", niveau: 5, objectives: ["M4-EG-03"], time: 300,
    vary: (rng) => {
      const [a, b, c] = triple(rng);
      return {
        statement: `Un jardin a la forme d'un triangle $ABC$ rectangle en $A$, avec $AB = ${a}$ m et $BC = ${c}$ m. On veut poser une clôture sur tout le pourtour et semer du gazon sur toute la surface.`,
        parts: [etapes([
          { prompt: "Longueur $AC$", value: b, suffix: "m" },
          { prompt: "Longueur de clôture (périmètre)", value: a + b + c, suffix: "m" },
          { prompt: "Surface de gazon (aire)", value: (a * b) / 2, suffix: "m²" },
        ])],
        solution: [`$ABC$ est rectangle en $A$ : $AC^2 = BC^2 - AB^2 = ${c * c} - ${a * a} = ${b * b}$, donc $AC = ${b}$ m.`, `Périmètre : $${a} + ${b} + ${c} = ${a + b + c}$ m.`, `Aire : $\\dfrac{AB \\times AC}{2} = \\dfrac{${a} \\times ${b}}{2} = ${(a * b) / 2}$ m².`],
      };
    },
    reasoning: "Le calcul de la longueur manquante est la première étape : périmètre et aire en dépendent.",
    hints: ["Quel est l'hypoténuse ?", "Calcule d'abord $AC$.", "Aire d'un triangle rectangle : produit des côtés de l'angle droit ÷ 2."],
  }),
  ex({
    id: "py3-19", title: "Type Brevet — Deux triangles pour un atelier", niveau: 5, objectives: ["M4-EG-03", "M4-EG-04"], time: 360,
    statement: "Sur le plan d'un atelier, le triangle $ABC$ est rectangle en $A$, avec $AB = 6$ cm et $AC = 8$ cm. Le point $D$ est tel que $CD = 24$ cm et $BD = 26$ cm. On veut savoir si le triangle $BCD$ est rectangle.",
    parts: [
      num(10, [{ match: "14", feedback: "Tu as additionné les longueurs : il faut additionner les carrés puis prendre la racine." }, { match: "100", feedback: "Tu as donné $BC^2$ : il reste la racine carrée." }], "1. Calcule $BC$.", "cm"),
      num(676, [], "2. Calcule $BC^2 + CD^2$.", "cm²"),
      num(676, [], "3. Calcule $BD^2$.", "cm²"),
      qcm(["$BCD$ est rectangle en $C$ (réciproque du théorème de Pythagore)", "$BCD$ est rectangle en $B$", "$BCD$ n'est pas rectangle", "On ne peut pas conclure sans mesurer l'angle"], 0, [
        { match: "1", feedback: "$[BD]$ est le plus grand côté : l'angle droit lui est opposé, donc en $C$, pas en $B$." },
        { match: "2", feedback: "Les deux nombres sont égaux : la réciproque s'applique." },
        { match: "3", feedback: "Les longueurs suffisent : on n'a pas besoin de mesurer." },
      ], "4. Quelle conclusion est correcte ?"),
    ],
    solution: ["1. $ABC$ rectangle en $A$ : $BC^2 = 6^2 + 8^2 = 100$, donc $BC = 10$ cm.", "2. $BC^2 + CD^2 = 100 + 24^2 = 100 + 576 = 676$.", "3. $BD^2 = 26^2 = 676$.", "4. $BD^2 = BC^2 + CD^2$ : d'après la réciproque du théorème de Pythagore, $BCD$ est rectangle en $C$."],
    reasoning: "On enchaîne le théorème (pour obtenir $BC$) puis la réciproque (pour conclure sur $BCD$) ; le plus grand côté de $BCD$ est $[BD]$.",
    hints: ["Commence par le triangle $ABC$ dont l'angle droit est connu.", "Pour $BCD$, isole le plus grand côté.", "Compare $BD^2$ avec $BC^2 + CD^2$."],
  }),
  ex({
    id: "py3-20", title: "Type Brevet — Démontrer qu'un triangle n'est pas rectangle", niveau: 5, objectives: ["M4-EG-04"], time: 300,
    statement: "Le triangle $EFG$ a pour côtés $EF = 9$ cm, $EG = 12$ cm et $FG = 16$ cm. Un élève affirme : « $EFG$ est rectangle en $E$ ». Remets dans l'ordre la démonstration qui le contredit, puis calcule l'écart entre les deux nombres comparés.",
    parts: [
      { interaction: { kind: "ordonner", items: brevItems, answer: BREV_STEPS.map((s) => brevItems.indexOf(s)), hint: "Première étape en haut" } },
      num(31, [{ match: "225", feedback: "Tu as donné $EF^2 + EG^2$ : on demande l'écart $FG^2 - (EF^2 + EG^2)$." }], "Écart $FG^2 - (EF^2 + EG^2)$ (en cm²).", "cm²"),
    ],
    solution: [...BREV_STEPS, "$256 - 225 = 31$ : les deux nombres sont différents, l'élève a tort. Une mesure sur la figure n'aurait rien prouvé ; la comparaison des carrés exacts, si."],
    reasoning: "Pour prouver qu'un triangle n'est pas rectangle, on montre que l'égalité de Pythagore est fausse : le théorème, appliqué à un triangle rectangle, la donnerait.",
    hints: ["Commence par repérer le plus grand côté.", "Calcule séparément $FG^2$ et $EF^2 + EG^2$.", "Conclus sur le lien entre l'inégalité et l'angle droit."],
  }),
];

// ───────────────────────── Chapitre ─────────────────────────
export const math3ePythagore: ChapterContent = {
  id: "math-3e-pythagore",
  taskId: "SCI-3E-MATH-017",
  grade: "3e",
  subject: "mathematiques",
  treeChapterId: "m3-pythagore",
  curriculumChapterIds: ["math-3e-automatismes", "math-4e-pythagore"],
  curriculumVersion: "2026-2027",
  title: "Théorème de Pythagore et réciproque",
  officialObjectives: (Object.keys(O) as Obj[]).map((id) => ({ id, text: O[id], source: id.startsWith("M4") ? SRC_4E : SRC_3E })),
  prerequisites: [
    { text: "Calculer le carré d'un nombre et connaître les carrés des entiers jusqu'à $15$ ; utiliser la racine carrée (valeurs exactes, valeurs approchées à la calculatrice)." },
    { text: "Reconnaître un triangle rectangle, l'angle droit, les côtés de l'angle droit et l'hypoténuse." },
    { text: "Calculer avec des nombres décimaux ; arrondir au dixième ou au centième." },
    { text: "Résoudre une équation simple du type $x^2 = a$ avec $x > 0$." },
    { text: "Utiliser les notations des longueurs ($AB$) et des segments ($[AB]$), avec leurs unités." },
  ],
  sources: [
    { id: "c4-programme-2020-eduscol-pdf", title: "Programme du cycle 4 en vigueur à la rentrée 2020 (d'après le BOEN n° 31 du 30 juillet 2020), Éduscol", url: "https://eduscol.education.gouv.fr/sites/default/files/document/programme-d-enseignement-du-cycle-4-67722.pdf", kind: "official", verification: "verified", sha256: "de42e9816d7d012fd5d6b3349171cf43dd038c1e50fa0fe9e664bcc8521194b9", accessedAt: "2026-11-07T14:49:44.189Z" },
    { id: "c4-attendus-4e-2019-pdf", title: "Mathématiques 4e — attendus de fin d'année (2019), Éduscol", url: "https://eduscol.education.gouv.fr/sites/default/files/document/16-maths-4e-attendus-eduscol1114746pdf-74682.pdf", kind: "official", note: "notions de 4e consolidées en 3e (p. 10)", verification: "verified", sha256: "d0edabd6a21d6345d36d32c5506ddcf225e819ddca25d27c1ecc3f97b87a8966", accessedAt: "2026-11-07T14:49:57.494Z" },
    { id: "c4-attendus-3e-2019-pdf", title: "Mathématiques 3e — attendus de fin d'année (2019), Éduscol", url: "https://eduscol.education.gouv.fr/sites/default/files/document/18-maths-3e-attendus-eduscol1114748pdf-74688.pdf", kind: "official", note: "cadre de la consolidation en 3e", verification: "verified", sha256: "49ccdca4d97ba4cf25875dfc731474e84d0332985c15396d3abfb9107f5f545a", accessedAt: "2026-11-07T14:50:10.048Z" },
  ],
  lesson: {
    introduction: "Un menuisier veut vérifier qu'un cadre de porte est bien d'équerre, un déménageur se demande si son échelle de $5$ m atteindra une fenêtre : dans les deux cas, on a un triangle et des longueurs, et on veut savoir si un angle est droit ou calculer une longueur manquante.\nLe **théorème de Pythagore** relie les trois longueurs d'un triangle rectangle, et sa **réciproque** permet de prouver qu'un triangle est rectangle à partir de ses seules longueurs. Ces notions, vues en 4e, reviennent très souvent en 3e (notamment au Brevet) : l'objectif est de bien les consolider et d'avoir en tête l'image de la configuration.",
    definitions: [
      { term: "Hypoténuse", text: "Dans un triangle rectangle, l'**hypoténuse** est le côté opposé à l'angle droit. C'est le plus long côté du triangle. Les deux autres côtés sont les **côtés de l'angle droit**." },
      { term: "Théorème de Pythagore", text: "Si le triangle $ABC$ est rectangle en $A$, alors $BC^2 = AB^2 + AC^2$.\nAutrement dit : le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés." },
      { term: "Réciproque du théorème de Pythagore", text: "Si, dans un triangle $ABC$, on a $BC^2 = AB^2 + AC^2$, alors $ABC$ est rectangle en $A$.\nOn l'utilise pour **démontrer** qu'un triangle est rectangle à partir des longueurs de ses côtés." },
      { term: "Contraposée", text: "Si, dans un triangle $ABC$, $BC^2 \\neq AB^2 + AC^2$, alors $ABC$ n'est **pas** rectangle en $A$. En effet, s'il l'était, le théorème de Pythagore donnerait l'égalité." },
      { term: "Valeur exacte, valeur approchée", text: "$\\sqrt{13}$ est une valeur **exacte** ; $3{,}6$ est une valeur **approchée** (arrondi au dixième). Quand on demande une valeur exacte, on garde la racine ; quand on demande un arrondi, on l'effectue **à la fin** du calcul." },
      { term: "Image mentale de la configuration", text: "On construit un carré sur chacun des trois côtés d'un triangle rectangle : l'aire du grand carré (sur l'hypoténuse) est la somme des aires des deux petits carrés. Exemple : $3^2 + 4^2 = 9 + 16 = 25 = 5^2$." },
    ],
    properties: [
      { title: "Calculer l'hypoténuse", statement: "Si $ABC$ est rectangle en $A$, alors $BC = \\sqrt{AB^2 + AC^2}$.", conditions: "Le triangle doit être rectangle ; $[BC]$ doit être le côté opposé à l'angle droit." },
      { title: "Calculer un côté de l'angle droit", statement: "Si $ABC$ est rectangle en $A$, alors $AB^2 = BC^2 - AC^2$, donc $AB = \\sqrt{BC^2 - AC^2}$.", conditions: "On soustrait quand l'inconnue est un côté de l'angle droit." },
      { title: "Démontrer qu'un triangle est rectangle", statement: "On calcule le carré du plus grand côté d'une part, la somme des carrés des deux autres côtés d'autre part. Si les deux résultats sont égaux, le triangle est rectangle (réciproque) ; s'ils sont différents, il ne l'est pas (contraposée).", conditions: "On compare des carrés **exacts**, sans arrondir. Le triangle est rectangle au sommet opposé au plus grand côté." },
    ],
    explanations: [
      { title: "1. Théorème ou réciproque ?", body: "Le théorème **part** d'un triangle rectangle (connu) pour **donner** une égalité sur les longueurs. La réciproque **part** d'une égalité sur les longueurs pour **prouver** que le triangle est rectangle. On utilise donc le théorème pour calculer une longueur, la réciproque pour montrer qu'un angle est droit." },
      { title: "2. Bien choisir : additionner ou soustraire ?", body: "Si l'inconnue est l'hypoténuse, on **additionne** les carrés des deux autres côtés. Si l'inconnue est un côté de l'angle droit, on **soustrait** le carré du côté connu au carré de l'hypoténuse. Contrôle final : l'hypoténuse doit être plus grande que chaque côté de l'angle droit." },
      { title: "3. Pourquoi ne jamais arrondir avant de comparer ?", body: "Pour la réciproque, on compare deux nombres : un arrondi pourrait faire paraître égaux deux nombres différents. On compare donc les carrés exacts, et on n'arrondit qu'une longueur donnée comme résultat final." },
      { title: "4. Reconnaître un triangle rectangle dans une situation", body: "Une échelle contre un mur, la diagonale d'un rectangle, la hauteur d'un triangle isocèle ou une distance dans un repère orthonormé cachent des triangles rectangles. Dessine-les et repère l'angle droit avant tout calcul." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Calculer l'hypoténuse", statement: "$ABC$ est rectangle en $A$ avec $AB = 5$ cm et $AC = 12$ cm. Calculer $BC$.", steps: ["$ABC$ est rectangle en $A$ : d'après le théorème de Pythagore, $BC^2 = AB^2 + AC^2$.", "$BC^2 = 5^2 + 12^2 = 25 + 144 = 169$.", "$BC$ est positif, donc $BC = \\sqrt{169} = 13$."], answer: "$BC = 13$ cm" },
      { title: "Exemple 2 — Calculer un côté de l'angle droit", statement: "$EFG$ est rectangle en $E$ avec $FG = 17$ cm et $EF = 8$ cm. Calculer $EG$.", steps: ["$EFG$ est rectangle en $E$ : $FG^2 = EF^2 + EG^2$, donc $EG^2 = FG^2 - EF^2$.", "$EG^2 = 17^2 - 8^2 = 289 - 64 = 225$.", "$EG = \\sqrt{225} = 15$."], answer: "$EG = 15$ cm" },
      { title: "Exemple 3 — Valeur approchée", statement: "$ABC$ est rectangle en $A$ avec $AB = 3$ cm et $AC = 5$ cm. Donner $BC$ arrondi au dixième.", steps: ["$BC^2 = 3^2 + 5^2 = 9 + 25 = 34$.", "$BC = \\sqrt{34}$ (valeur exacte).", "À la calculatrice, $\\sqrt{34} \\approx 5{,}83$, soit $5{,}8$ au dixième."], answer: "$BC \\approx 5{,}8$ cm" },
      { title: "Exemple 4 — Démontrer qu'un triangle est rectangle", statement: "$ABC$ a pour côtés $AB = 20$ cm, $AC = 21$ cm et $BC = 29$ cm. Est-il rectangle ?", steps: ["Le plus grand côté est $[BC]$ : $BC^2 = 29^2 = 841$.", "$AB^2 + AC^2 = 20^2 + 21^2 = 400 + 441 = 841$.", "Les deux résultats sont égaux : d'après la réciproque du théorème de Pythagore, $ABC$ est rectangle en $A$."], answer: "$ABC$ est rectangle en $A$." },
      { title: "Exemple 5 — Démontrer qu'il ne l'est pas", statement: "$EFG$ a pour côtés $EF = 4$ cm, $EG = 5$ cm et $FG = 7$ cm. Est-il rectangle ?", steps: ["Le plus grand côté est $[FG]$ : $FG^2 = 49$.", "$EF^2 + EG^2 = 16 + 25 = 41$.", "$49 \\neq 41$ : si $EFG$ était rectangle en $E$, on aurait l'égalité."], answer: "$EFG$ n'est pas rectangle." },
    ],
    illustrations: [
      { svg: squaresSvg("9", "16", "25", "Triangle rectangle de côtés 3, 4 et 5 avec un carré sur chaque côté, d'aires 9, 16 et 25"), alt: "Triangle rectangle de côtés 3, 4 et 5 avec un carré construit sur chaque côté, d'aires 9, 16 et 25.", caption: "$9 + 16 = 25$ : l'aire du grand carré est la somme des deux autres." },
      { svg: ladderSvg, alt: "Une échelle appuyée contre un mur : l'échelle, le mur et le sol forment un triangle rectangle dont l'échelle est l'hypoténuse.", caption: "Une échelle contre un mur modélise un triangle rectangle." },
    ],
    commonMistakes: [
      { mistake: "$BC = AB + AC = 5 + 12 = 17$", correction: "$BC^2 = 5^2 + 12^2 = 169$, donc $BC = 13$.", why: "Ce sont les **carrés** des longueurs qu'on additionne, pas les longueurs." },
      { mistake: "Donner $BC^2 = 169$ comme réponse finale.", correction: "$BC = \\sqrt{169} = 13$.", why: "$169$ est le carré de la longueur ; il reste à prendre la racine carrée." },
      { mistake: "Additionner les carrés alors que l'inconnue est un côté de l'angle droit.", correction: "$AB^2 = BC^2 - AC^2$.", why: "L'hypoténuse est le plus grand côté : son carré est la somme des deux autres, donc on soustrait pour retrouver un petit côté." },
      { mistake: "Tester la réciproque avec un autre côté que le plus grand.", correction: "Toujours isoler le plus grand côté et comparer son carré à la somme des deux autres.", why: "L'angle droit éventuel est opposé au plus grand côté." },
      { mistake: "Conclure « rectangle » parce que l'angle semble droit sur le dessin, ou sans citer la réciproque.", correction: "Écrire : « D'après la réciproque du théorème de Pythagore, le triangle est rectangle en… ».", why: "Une figure n'est pas une preuve : seul le calcul exact des carrés démontre." },
      { mistake: "Utiliser le théorème de Pythagore pour prouver qu'un triangle est rectangle.", correction: "Utiliser la réciproque.", why: "Le théorème suppose déjà le triangle rectangle." },
    ],
    methods: [
      { title: "Calculer une longueur dans un triangle rectangle", steps: ["Repérer l'angle droit et nommer l'hypoténuse.", "Écrire l'égalité de Pythagore : « Dans le triangle $ABC$ rectangle en $A$, d'après le théorème de Pythagore… ».", "Remplacer par les valeurs connues ; additionner (hypoténuse inconnue) ou soustraire (côté inconnu).", "Prendre la racine carrée, conclure avec l'unité et contrôler : l'hypoténuse est le plus grand côté."] },
      { title: "Démontrer qu'un triangle est rectangle", steps: ["Identifier le plus grand côté.", "Calculer son carré, puis la somme des carrés des deux autres côtés, sans arrondir.", "Comparer : égalité → réciproque du théorème de Pythagore, le triangle est rectangle ; sinon, il ne l'est pas.", "Rédiger la phrase de conclusion en nommant le sommet de l'angle droit."] },
    ],
    summary: [
      "Dans un triangle rectangle, l'hypoténuse est le côté opposé à l'angle droit ; c'est le plus long.",
      "Si $ABC$ est rectangle en $A$, alors $BC^2 = AB^2 + AC^2$ (théorème de Pythagore).",
      "Si $BC^2 = AB^2 + AC^2$, alors $ABC$ est rectangle en $A$ (réciproque) ; si les deux nombres sont différents, il ne l'est pas.",
      "Pour calculer un côté, on additionne les carrés (hypoténuse inconnue) ou on soustrait (côté de l'angle droit inconnu), puis on prend la racine carrée.",
      "On compare des carrés exacts : on n'arrondit qu'à la fin d'un calcul de longueur.",
    ],
    revisionSheet: {
      keyPoints: ["$BC^2 = AB^2 + AC^2$ si $ABC$ est rectangle en $A$.", "Triplets utiles : $3$-$4$-$5$, $5$-$12$-$13$, $8$-$15$-$17$, $7$-$24$-$25$.", "Réciproque : égalité des carrés → angle droit ; carrés différents → pas d'angle droit.", "Image mentale : le grand carré est la somme des deux petits."],
      skills: ["Reconnaître l'hypoténuse.", "Calculer une longueur manquante (exacte ou arrondie).", "Démontrer qu'un triangle est rectangle ou ne l'est pas.", "Modéliser une situation par un triangle rectangle."],
    },
    miniQuiz: [
      { question: "$ABC$ est rectangle en $B$. Quel est son hypoténuse ?", options: ["$[AB]$", "$[BC]$", "$[AC]$"], answer: 2, explanation: "L'hypoténuse est opposée à l'angle droit, donc au sommet $B$ : c'est $[AC]$." },
      { question: "$ABC$ est rectangle en $A$ avec $AB = 6$ et $AC = 8$. Alors $BC$ vaut…", options: ["$14$", "$10$", "$100$", "$2$"], answer: 1, explanation: "$BC^2 = 36 + 64 = 100$, donc $BC = 10$." },
      { question: "Un triangle a pour côtés $5$, $6$ et $8$. Est-il rectangle ?", options: ["Oui, car $5 + 6 > 8$", "Oui, car $5^2 + 6^2 = 8^2$", "Non, car $5^2 + 6^2 \\neq 8^2$"], answer: 2, explanation: "$5^2 + 6^2 = 61$ et $8^2 = 64$ : les résultats sont différents." },
      { question: "$EFG$ est rectangle en $E$ avec $FG = 13$ et $EF = 5$. Alors $EG$ vaut…", options: ["$18$", "$12$", "$194$", "$8$"], answer: 1, explanation: "$EG^2 = 13^2 - 5^2 = 169 - 25 = 144$, donc $EG = 12$." },
    ],
  },
  exercises: EXERCISES,
  exerciseCountJustification: "Pilote API : 20 exercices pour valider la chaîne de production.",
  games: [
    {
      id: "py3-jeu-flash", template: "calcul-flash", title: "Flash Pythagore",
      objective: "Automatiser les carrés, les racines de carrés parfaits et les calculs de longueurs avec les triplets usuels.",
      instructions: "Réponds le plus vite possible. Le niveau monte après trois bonnes réponses d'affilée.",
      objectives: ["M3-AUTO-03", "M4-EG-03", "M4-EG-04"],
      config: {
        duration: 90, practiceCount: 15,
        levels: [
          { label: "Carrés et racines", items: [
            { q: "$7^2$", answer: "49", explanation: "$7 \\times 7 = 49$." },
            { q: "$12^2$", answer: "144", explanation: "$12 \\times 12 = 144$." },
            { q: "$15^2$", answer: "225", explanation: "$15 \\times 15 = 225$." },
            { q: "$\\sqrt{81}$", answer: "9", explanation: "$9^2 = 81$." },
            { q: "$\\sqrt{169}$", answer: "13", explanation: "$13^2 = 169$." },
            { q: "$\\sqrt{196}$", answer: "14", explanation: "$14^2 = 196$." },
            { q: "$3^2 + 4^2$", answer: "25", explanation: "$9 + 16 = 25$." },
            { q: "$5^2 + 12^2$", answer: "169", explanation: "$25 + 144 = 169$." },
          ] },
          { label: "Calculer une longueur", items: [
            { q: "Hypoténuse (cm) d'un triangle rectangle dont les côtés de l'angle droit mesurent $6$ et $8$", answer: "10", explanation: "$36 + 64 = 100$." },
            { q: "Hypoténuse (cm) pour des côtés de l'angle droit $9$ et $12$", answer: "15", explanation: "$81 + 144 = 225$." },
            { q: "Hypoténuse (cm) pour des côtés de l'angle droit $8$ et $15$", answer: "17", explanation: "$64 + 225 = 289$." },
            { q: "Hypoténuse (cm) pour des côtés de l'angle droit $7$ et $24$", answer: "25", explanation: "$49 + 576 = 625$." },
            { q: "Hypoténuse $13$ cm, un côté $5$ cm : l'autre côté (cm)", answer: "12", explanation: "$169 - 25 = 144$." },
            { q: "Hypoténuse $10$ cm, un côté $6$ cm : l'autre côté (cm)", answer: "8", explanation: "$100 - 36 = 64$." },
            { q: "Hypoténuse $17$ cm, un côté $8$ cm : l'autre côté (cm)", answer: "15", explanation: "$289 - 64 = 225$." },
            { q: "Hypoténuse $25$ cm, un côté $24$ cm : l'autre côté (cm)", answer: "7", explanation: "$625 - 576 = 49$." },
          ] },
          { label: "Réciproque et triplets", items: [
            { q: "Carré du plus grand côté d'un triangle de côtés $5$, $12$ et $13$", answer: "169", explanation: "$13^2 = 169$." },
            { q: "Triangle $9$ ; $12$ ; $15$ rectangle ? (1 si oui, 0 si non)", answer: "1", explanation: "$81 + 144 = 225 = 15^2$." },
            { q: "Triangle $4$ ; $5$ ; $7$ rectangle ? (1 si oui, 0 si non)", answer: "0", explanation: "$16 + 25 = 41 \\neq 49$." },
            { q: "Triangle $20$ ; $21$ ; $29$ rectangle ? (1 si oui, 0 si non)", answer: "1", explanation: "$400 + 441 = 841 = 29^2$." },
            { q: "Triangle $8$ ; $10$ ; $12$ rectangle ? (1 si oui, 0 si non)", answer: "0", explanation: "$64 + 100 = 164 \\neq 144$." },
            { q: "Complète le triplet : $3$ ; $4$ ; ?", answer: "5", explanation: "$9 + 16 = 25$." },
            { q: "Si $6^2 + x^2 = 10^2$ avec $x > 0$, alors $x =$", answer: "8", explanation: "$x^2 = 100 - 36 = 64$." },
            { q: "Triangle $7$ ; $24$ ; $25$ rectangle ? (1 si oui, 0 si non)", answer: "1", explanation: "$49 + 576 = 625 = 25^2$." },
          ] },
        ],
      },
    },
    {
      id: "py3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs de Pythagore",
      objective: "Repérer et nommer les erreurs typiques sur le théorème de Pythagore et sa réciproque.",
      instructions: "Pour chaque affirmation, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
      objectives: ["M3-AUTO-03", "M4-EG-03", "M4-EG-04"],
      config: { items: [
        { niveau: 1, calc: "$ABC$ rectangle en $A$, $AB = 3$, $AC = 4$ : $BC = 3 + 4 = 7$.", correct: false, errors: ["On a additionné les longueurs au lieu de leurs carrés", "On a oublié de prendre la racine carrée", "On a soustrait au lieu d'additionner"], error: 0, explanation: "$BC^2 = 3^2 + 4^2 = 25$, donc $BC = 5$." },
        { niveau: 1, calc: "$3^2 + 4^2 = 25$", correct: true, explanation: "$9 + 16 = 25$." },
        { niveau: 1, calc: "$BC^2 = 25$ donc $BC = 25$.", correct: false, errors: ["La racine carrée a été oubliée", "Le carré a été mal calculé", "L'hypoténuse a été confondue avec un côté"], error: 0, explanation: "$BC = \\sqrt{25} = 5$." },
        { niveau: 2, calc: "$ABC$ rectangle en $A$, $BC = 13$, $AC = 5$ : $AB^2 = 13^2 + 5^2$.", correct: false, errors: ["Le côté inconnu est un côté de l'angle droit : il fallait soustraire", "Il fallait multiplier les carrés", "Il fallait additionner les longueurs"], error: 0, explanation: "$AB^2 = 13^2 - 5^2 = 144$, donc $AB = 12$." },
        { niveau: 2, calc: "$13^2 - 5^2 = 144$ donc $AB = 12$.", correct: true, explanation: "$\\sqrt{144} = 12$." },
        { niveau: 2, calc: "$7^2 = 14$", correct: false, errors: ["Le carré a été confondu avec le double", "Le carré a été confondu avec la racine", "Il manque l'unité"], error: 0, explanation: "$7^2 = 7 \\times 7 = 49$." },
        { niveau: 3, calc: "Un triangle de côtés $6$, $8$ et $10$ est rectangle car $6 + 8 > 10$.", correct: false, errors: ["La condition utilisée n'est pas celle de la réciproque : il faut comparer les carrés", "Il fallait comparer $6 + 8$ et $2 \\times 10$", "Il fallait mesurer l'angle"], error: 0, explanation: "$6^2 + 8^2 = 100 = 10^2$ : c'est cette égalité qui prouve que le triangle est rectangle." },
        { niveau: 3, calc: "$6^2 + 8^2 = 100 = 10^2$, donc, d'après la réciproque du théorème de Pythagore, le triangle est rectangle.", correct: true, explanation: "Égalité des carrés, avec le plus grand côté isolé : la réciproque s'applique." },
        { niveau: 3, calc: "Triangle $4$, $5$, $6$ : $4^2 + 5^2 = 41$ et $6^2 = 36$, donc il est rectangle.", correct: false, errors: ["Les deux nombres sont différents : le triangle n'est pas rectangle", "Il fallait comparer $4^2 + 6^2$ et $5^2$", "Il fallait arrondir avant de comparer"], error: 0, explanation: "$41 \\neq 36$ : pas d'égalité, donc le triangle n'est pas rectangle." },
        { niveau: 4, calc: "On mesure l'angle sur le dessin : $90°$, donc le triangle est rectangle.", correct: false, errors: ["Une mesure sur une figure ne prouve rien", "Il fallait utiliser le théorème de Pythagore et non la réciproque", "Il fallait mesurer avec une règle"], error: 0, explanation: "Seul le calcul exact des carrés, avec la réciproque, démontre qu'un triangle est rectangle." },
        { niveau: 4, calc: "$ABC$ rectangle en $A$, $AB = 2$, $AC = 3$ : $BC = \\sqrt{13}$ cm (valeur exacte).", correct: true, explanation: "$BC^2 = 4 + 9 = 13$ ; $13$ n'est pas un carré parfait, on garde la racine." },
      ] },
    },
    {
      id: "py3-jeu-memory", template: "memory", title: "Memory des triplets pythagoriciens",
      objective: "Associer un triplet de longueurs à la relation entre les carrés qui le caractérise.",
      instructions: "Retourne deux cartes : si elles correspondent (triplet et somme de carrés), elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-AUTO-03", "M4-EG-04"],
      config: { pairs: [
        ["$(3\\,;\\,4\\,;\\,5)$", "$9 + 16 = 25$"],
        ["$(5\\,;\\,12\\,;\\,13)$", "$25 + 144 = 169$"],
        ["$(8\\,;\\,15\\,;\\,17)$", "$64 + 225 = 289$"],
        ["$(7\\,;\\,24\\,;\\,25)$", "$49 + 576 = 625$"],
        ["$(6\\,;\\,8\\,;\\,10)$", "$36 + 64 = 100$"],
        ["$(9\\,;\\,12\\,;\\,15)$", "$81 + 144 = 225$"],
      ] },
    },
  ],
  reviewStatus: { curriculum: "pending", accuracy: "pending", exercises: "pending", games: "pending", technical: "pending", language: "pending" },
  publicationStatus: "draft",
};
