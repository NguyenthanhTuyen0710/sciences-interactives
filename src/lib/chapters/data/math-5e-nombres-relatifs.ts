// SCI-5E-MATH-001 — Mathématiques 5e : Nombres relatifs (programme du cycle 4, BO n° 10 du 5 mars 2026).
// Contenu original rédigé à partir du dossier research/dossiers/math-5e-nombres-relatifs.md.
// Hors programme 5e (non traité) : multiplication/division de relatifs, notation |a|, ensembles ℤ, 𝔻, ℚ.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, Rng } from "../../engine/types";
import { tex } from "../../engine/numbers";
import { numberLine, plot } from "../../engine/svg";

const T = (x: number) => tex(x);
/** Relatif entre parenthèses s'il est négatif. */
const P = (x: number) => (x < 0 ? `(${T(x)})` : T(x));
const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;
const nz = (rng: Rng, a: number, b: number) => { let v = 0; while (v === 0) v = rng.int(a, b); return v; };
const num = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value } }, mistakes });
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
/** Mélange des options en conservant la bonne réponse et les diagnostics (indices d'origine). */
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const SIGN_SUM_NEG = "Deux nombres négatifs ajoutés donnent un résultat **négatif** : deux baisses successives de température font encore baisser.";

const O = {
  "M5-REL-01": "Définir un nombre relatif : un signe et une distance à zéro.",
  "M5-REL-02": "Définir et déterminer l'opposé d'un nombre ; savoir que $-a$ n'est pas toujours négatif.",
  "M5-REL-03": "Connaître le terme « valeur absolue » (distance à zéro) et l'utiliser pour comparer.",
  "M5-REL-04": "Distinguer positif, strictement positif, négatif, strictement négatif (cas de 0).",
  "M5-REL-05": "Utiliser les relatifs pour représenter des grandeurs pouvant être inférieures à zéro (température, altitude, temps…).",
  "M5-REL-06": "Lire l'abscisse d'un point et placer un point d'abscisse donnée sur une droite graduée.",
  "M5-REL-07": "Lire et placer des points dans un repère orthogonal du plan (coordonnées relatives).",
  "M5-REL-08": "Comparer et ranger des décimaux relatifs.",
  "M5-REL-09": "Additionner deux décimaux relatifs.",
  "M5-REL-10": "Additionner plusieurs décimaux relatifs en regroupant astucieusement les termes.",
  "M5-REL-11": "Soustraire deux décimaux relatifs : soustraire un nombre revient à ajouter son opposé.",
  "M5-REL-12": "Savoir quand les parenthèses sont indispensables ; distinguer les trois rôles du signe « − ».",
  "M5-REL-13": "Simplifier l'écriture d'une somme comportant des parenthèses.",
  "M5-REL-14": "Enchaîner additions et soustractions de décimaux relatifs.",
  "M5-REL-15": "Résoudre des problèmes mettant en jeu additions et soustractions de relatifs (états et variations).",
} as const;
type Obj = keyof typeof O;
const SRC = "Programme de mathématiques du cycle 4 (annexe 2, BO n° 10 du 5 mars 2026), classe de 5e, « Nombres et calculs – Nombres relatifs »";

// ───────────────────────── Exercices ─────────────────────────
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "rel5-01", title: "Lire une température négative", niveau: 1, objectives: ["M5-REL-01", "M5-REL-05"], time: 45,
    statement: "Un matin d'hiver, la météo annonce : « il fait 4 degrés **sous zéro** ». Quel nombre relatif représente cette température (en °C) ?",
    parts: [qcm(["$-4$", "$4$", "$+4$", "$0{,}4$"], 0, [
      { match: "1", feedback: "4 °C, c'est 4 degrés **au-dessus** de zéro. « Sous zéro » se traduit par un nombre négatif." },
      { match: "2", feedback: "$+4$ et $4$ désignent le même nombre positif. « Sous zéro » se traduit par le signe −." },
    ])],
    solution: ["« Sous zéro » signifie inférieur à 0 : la température est négative.", "Sa distance à zéro est 4, d'où le nombre $-4$ (on lit « moins quatre »)."],
    reasoning: "Un nombre relatif est formé d'un signe et d'une distance à zéro : le signe − indique « en dessous de 0 ».",
    hints: ["La température est-elle au-dessus ou en dessous de 0 ?", "Les températures en dessous de 0 s'écrivent avec le signe −."],
  }),
  ex({
    id: "rel5-02", title: "Grandeurs qui peuvent être négatives", niveau: 1, objectives: ["M5-REL-05"], time: 90,
    statement: "Classer chaque grandeur selon qu'elle **peut** ou non prendre une valeur négative.",
    parts: [{ interaction: { kind: "classer", categories: ["Peut être négative", "Jamais négative"], items: ["La température extérieure en °C", "L'altitude d'un point (niveau de la mer = 0)", "L'âge d'une personne", "L'étage desservi par un ascenseur (rez-de-chaussée = 0)", "Le nombre d'élèves d'une classe", "Le solde d'un compte en banque", "La longueur d'un segment"], answer: [0, 0, 1, 0, 1, 0, 1] } }],
    solution: ["Peuvent être négatifs : la température (sous 0 °C), l'altitude (sous le niveau de la mer), l'étage (sous-sols), le solde (découvert).", "Ne sont jamais négatifs : un âge, un nombre d'élèves, une longueur."],
    reasoning: "Les nombres négatifs servent quand une grandeur a un « zéro de référence » et peut se trouver en dessous : température, altitude, étages, argent.",
    hints: ["Demande-toi s'il existe un « zéro de référence » en dessous duquel on peut descendre.", "Un parking au 2e sous-sol est à l'étage $-2$."],
  }),
  ex({
    id: "rel5-03", title: "Positif, négatif… et zéro", niveau: 1, objectives: ["M5-REL-04"], time: 75,
    statement: "Pour chaque affirmation, répondre Vrai ou Faux.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["$0$ est un nombre positif.", "$0$ est un nombre strictement positif.", "$-2{,}5$ est strictement négatif.", "$+7$ est un nombre négatif.", "$0$ est un nombre négatif."], answer: [true, false, true, false, true] } }],
    solution: ["Un nombre est positif s'il est supérieur ou égal à 0 : 0 est positif.", "Strictement positif signifie supérieur à 0 (sans égalité) : 0 ne l'est pas.", "$-2{,}5 < 0$ : strictement négatif.", "$+7 > 0$ : positif.", "Négatif signifie inférieur ou égal à 0 : 0 est aussi négatif."],
    reasoning: "« Positif » et « négatif » incluent 0 ; « strictement » exclut 0. Zéro est le seul nombre à la fois positif et négatif.",
    hints: ["« Positif » veut dire « supérieur **ou égal** à 0 ».", "« Strictement » enlève le cas d'égalité avec 0."],
  }),
  ex({
    id: "rel5-04", title: "Lire une abscisse (graduation 1)", niveau: 1, objectives: ["M5-REL-06"], time: 45,
    vary: (rng) => {
      const x = nz(rng, -6, -1);
      return {
        statement: "Lire l'abscisse du point $A$ sur la droite graduée.",
        figure: { kind: "svg", svg: numberLine({ min: -7, max: 3, step: 1, labels: "zero-unit", points: [{ x, label: "A" }], title: "Droite graduée avec le point A" }) },
        parts: [num(x, [{ match: String(-x), feedback: "Tu as donné l'opposé : le point est à **gauche** de 0, son abscisse est négative." }, { match: String(x + 1), feedback: "Décalage d'une graduation : compte les intervalles depuis 0, pas les traits." }], "Abscisse de $A$ :")],
        solution: [`Chaque graduation vaut 1 (on passe de 0 à 1 en une graduation).`, `$A$ est à ${-x} graduation${x < -1 ? "s" : ""} à gauche de 0 : son abscisse est $${T(x)}$.`],
      };
    },
    reasoning: "L'abscisse d'un point indique sa position : sa distance à 0 et, par le signe, le côté (− à gauche, + à droite).",
    hints: ["Repère d'abord combien vaut une graduation.", "Compte les intervalles entre 0 et $A$."],
  }),
  ex({
    id: "rel5-05", title: "Associer un nombre et son opposé", niveau: 1, objectives: ["M5-REL-02"], time: 60,
    statement: "Associer chaque nombre à son opposé.",
    parts: [{ interaction: { kind: "associer", left: ["$-7$", "$2{,}5$", "$0$", "$-0{,}3$", "$11$"], right: ["$-2{,}5$", "$0{,}3$", "$-11$", "$7$", "$0$"], answer: [3, 0, 4, 1, 2] } }],
    solution: ["Deux nombres opposés ont la même distance à zéro et des signes contraires.", "$-7 \\leftrightarrow 7$ ; $2{,}5 \\leftrightarrow -2{,}5$ ; $-0{,}3 \\leftrightarrow 0{,}3$ ; $11 \\leftrightarrow -11$.", "L'opposé de 0 est 0."],
    reasoning: "Deux nombres sont opposés quand leur somme est nulle : $-7 + 7 = 0$.",
    hints: ["Garde la même distance à zéro et change le signe.", "Quel nombre ajouté à 0 donne 0 ?"],
  }),
  ex({
    id: "rel5-06", title: "Signe et distance à zéro", niveau: 1, objectives: ["M5-REL-01", "M5-REL-03"], time: 60,
    vary: (rng) => {
      const a = -rng.int(12, 95) / 10;
      return {
        statement: `On considère le nombre $${T(a)}$. Compléter.`,
        parts: [{ interaction: { kind: "texte-trous", template: `Le signe de $${T(a)}$ est [[0]].\nSa distance à zéro (sa valeur absolue) est [[1]].`, blanks: [{ type: "select", options: ["+", "−"], answer: 1 }, { type: "number", answer: { value: -a } }] } }],
        solution: [`$${T(a)}$ est négatif : son signe est « − ».`, `Sa distance à zéro est $${T(-a)}$ : c'est sa valeur absolue (toujours positive).`],
      };
    },
    reasoning: "Un relatif = un signe + une distance à zéro. La valeur absolue est cette distance, elle n'est jamais négative.",
    hints: ["La distance entre deux points n'est jamais négative."],
  }),
  ex({
    id: "rel5-07", title: "L'ascenseur", niveau: 1, objectives: ["M5-REL-05", "M5-REL-01"], time: 45,
    statement: "Dans un immeuble, le rez-de-chaussée correspond à l'étage $0$. Inès part du 3e étage et descend de 5 étages pour aller au parking. À quel étage arrive-t-elle ?",
    parts: [num(-2, [{ match: "2", feedback: "Le parking est **sous** le rez-de-chaussée : l'étage est négatif." }, { match: "8", feedback: "Elle **descend** : il faut retirer 5 étages, pas en ajouter." }], "Étage d'arrivée :")],
    solution: ["En descendant de 3 étages, elle arrive au rez-de-chaussée (étage 0).", "Il reste 2 étages à descendre : elle arrive à l'étage $-2$ (2e sous-sol).", "En calcul : $3 - 5 = -2$."],
    reasoning: "Une soustraction comme $3 - 5$ n'a pas de résultat parmi les nombres positifs : les nombres négatifs rendent toutes les soustractions possibles.",
    hints: ["Combien d'étages pour atteindre le rez-de-chaussée ?", "Combien en reste-t-il ensuite ?"],
  }),

  // ── Niveau 2 : Application ──
  ex({
    id: "rel5-08", title: "Lire une abscisse (graduation 0,5)", niveau: 2, objectives: ["M5-REL-06"], time: 60,
    vary: (rng) => {
      const k = nz(rng, -7, 3);
      const x = k === 0 ? -0.5 : k / 2;
      const xx = Number.isInteger(x) ? (x > 0 ? x + 0.5 : x - 0.5) : x;
      return {
        statement: "Lire l'abscisse du point $B$.",
        figure: { kind: "svg", svg: numberLine({ min: -4, max: 2, step: 0.5, labels: "zero-unit", points: [{ x: xx, label: "B" }], title: "Droite graduée de 0,5 en 0,5 avec le point B" }) },
        parts: [num(xx, [{ match: String(-xx), feedback: "Attention au côté : à gauche de 0 l'abscisse est négative, à droite elle est positive." }, { match: String(xx * 2), feedback: "Chaque graduation vaut **0,5** et non 1 : il y a deux graduations entre 0 et 1." }], "Abscisse de $B$ :")],
        solution: ["Entre 0 et 1 il y a 2 intervalles : chaque graduation vaut $0{,}5$.", `$B$ est à ${Math.round(Math.abs(xx) * 2)} graduations ${xx < 0 ? "à gauche" : "à droite"} de 0 : ${Math.round(Math.abs(xx) * 2)} × 0,5 = ${T(Math.abs(xx))}.`, `Donc $B$ a pour abscisse $${T(xx)}$.`],
      };
    },
    reasoning: "Avant de lire une abscisse, on détermine la valeur d'une graduation à partir de deux nombres connus (ici 0 et 1).",
    hints: ["Combien d'intervalles y a-t-il entre 0 et 1 ?", "Une graduation vaut donc $1 \\div 2$."],
  }),
  ex({
    id: "rel5-09", title: "Opposé et opposé de l'opposé", niveau: 2, objectives: ["M5-REL-02"], time: 60,
    vary: (rng) => {
      const a = rng.sign() * rng.int(11, 89) / 10;
      return {
        statement: `On note $a = ${T(a)}$. Compléter.`,
        parts: [{ interaction: { kind: "texte-trous", template: `L'opposé de $a$ est $-a =$ [[0]].\nL'opposé de $-a$ est $-(-a) =$ [[1]].\n$a + (-a) =$ [[2]].`, blanks: [{ type: "number", answer: { value: -a } }, { type: "number", answer: { value: a } }, { type: "number", answer: { value: 0 } }] } }],
        solution: [`L'opposé de $${T(a)}$ est $${T(-a)}$ (même distance à zéro, signe contraire).`, `L'opposé de $${T(-a)}$ est $${T(a)}$ : on revient au nombre de départ, $-(-a) = a$.`, "La somme de deux nombres opposés est nulle."],
      };
    },
    reasoning: "$-a$ se lit « l'opposé de $a$ » : si $a$ est négatif, $-a$ est positif. $-a$ n'est donc pas toujours négatif.",
    hints: ["« $-a$ » signifie « l'opposé de $a$ », pas « un nombre négatif ».", "Que vaut la somme d'un nombre et de son opposé ?"],
  }),
  ex({
    id: "rel5-10", title: "Placer des points dans un repère", niveau: 2, objectives: ["M5-REL-07"], time: 120,
    vary: (rng) => {
      const pts: [number, number][] = [[-nz(rng, 1, 4), nz(rng, 1, 4)], [nz(rng, 1, 4), -nz(rng, 1, 4)], [-nz(rng, 1, 4), -nz(rng, 1, 4)], [0, -nz(rng, 1, 4)]];
      const names = ["A", "B", "C", "D"];
      return {
        statement: `Placer les points ${pts.map((p, i) => `$${names[i]}(${T(p[0])}\\,;\\,${T(p[1])})$`).join(", ")} en cliquant dans le repère.`,
        parts: [{ interaction: { kind: "repere", xmin: -5, xmax: 5, ymin: -5, ymax: 5, step: 1, points: pts.map((p, i) => ({ label: names[i], answer: p })) } }],
        solution: ["Pour placer $M(x\\,;\\,y)$ : on part de l'origine, on se déplace horizontalement de $x$ (à droite si $x>0$, à gauche si $x<0$), puis verticalement de $y$ (vers le haut si $y>0$, vers le bas si $y<0$).", ...pts.map((p, i) => `$${names[i]}$ : ${p[0] === 0 ? "pas de déplacement horizontal" : `${Math.abs(p[0])} ${p[0] < 0 ? "à gauche" : "à droite"}`}, puis ${Math.abs(p[1])} ${p[1] < 0 ? "vers le bas" : "vers le haut"}.`)],
      };
    },
    reasoning: "Les coordonnées s'écrivent toujours dans l'ordre (abscisse ; ordonnée) : d'abord l'axe horizontal, puis l'axe vertical.",
    hints: ["Le premier nombre se lit sur l'axe horizontal.", "Un nombre négatif indique un déplacement vers la gauche (abscisse) ou vers le bas (ordonnée)."],
  }),
  ex({
    id: "rel5-11", title: "Lire les coordonnées d'un point", niveau: 2, objectives: ["M5-REL-07"], time: 60,
    vary: (rng) => {
      const x = nz(rng, -4, 4), y = nz(rng, -4, 4);
      const xx = x > 0 && y > 0 ? -x : x; // au moins une coordonnée négative
      return {
        statement: "Quelles sont les coordonnées du point $M$ ?",
        figure: { kind: "svg", svg: plot({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: xx, y, label: "M" }], title: "Repère orthogonal avec le point M", width: 320, height: 300 }) },
        parts: [{ interaction: { kind: "texte-trous", template: "$M($ [[0]] $\\,;\\,$ [[1]] $)$", blanks: [{ type: "number", answer: { value: xx } }, { type: "number", answer: { value: y } }] } }],
        solution: [`On lit l'abscisse sur l'axe horizontal : $${T(xx)}$.`, `On lit l'ordonnée sur l'axe vertical : $${T(y)}$.`, `Donc $M(${T(xx)}\\,;\\,${T(y)})$.`],
      };
    },
    reasoning: "Abscisse d'abord, ordonnée ensuite : $(x\\,;\\,y)$. Inverser l'ordre donne un autre point.",
    hints: ["Trace mentalement la verticale passant par $M$ jusqu'à l'axe horizontal."],
  }),
  ex({
    id: "rel5-12", title: "Comparer deux relatifs", niveau: 2, objectives: ["M5-REL-08", "M5-REL-03"], time: 90,
    vary: (rng) => {
      const pairs: [number, number][] = [
        [-nz(rng, 2, 9), -nz(rng, 2, 9)],
        [-rng.int(1, 9) / 10 - rng.int(1, 5), rng.int(1, 9) / 10],
        [-rng.int(21, 29) / 10, -rng.int(201, 299) / 100],
        [-rng.int(1, 9), rng.int(0, 1) ? 0 : -rng.int(1, 9)],
      ];
      const lines = pairs.map(([a, b], i) => `$${T(a)}$ [[${i}]] $${T(b)}$`);
      return {
        statement: "Compléter avec le symbole qui convient : $<$, $=$ ou $>$.",
        parts: [{ interaction: { kind: "texte-trous", template: lines.join("\n"), blanks: pairs.map(([a, b]) => ({ type: "select", options: ["<", "=", ">"], answer: a < b ? 0 : a === b ? 1 : 2 })) } }],
        solution: ["Sur une droite graduée, le plus petit nombre est le plus à gauche.", "Un négatif est toujours inférieur à un positif (ou à 0).", "Entre deux négatifs, le plus grand est celui qui a la **plus petite** distance à zéro.", ...pairs.map(([a, b]) => `$${T(a)} ${a < b ? "<" : a === b ? "=" : ">"} ${T(b)}$`)],
      };
    },
    reasoning: "Pour deux nombres négatifs, l'ordre des distances à zéro est inversé : $-3 > -7$ car $-3$ est plus proche de 0, donc plus à droite.",
    hints: ["Imagine deux températures : $-3$ °C ou $-7$ °C, laquelle est la plus froide ?", "Place les nombres sur une droite graduée : le plus à droite est le plus grand."],
  }),
  ex({
    id: "rel5-13", title: "Somme de deux négatifs", niveau: 2, objectives: ["M5-REL-09"], time: 40,
    vary: (rng) => {
      const a = -rng.int(2, 19), b = -rng.int(2, 19);
      return {
        statement: `Calculer $${T(a)} + ${P(b)}$.`,
        parts: [num(a + b, [{ match: String(-(a + b)), feedback: SIGN_SUM_NEG }, { match: String(a - b), feedback: "Les deux nombres ont le même signe : on **additionne** leurs distances à zéro." }])],
        solution: ["Les deux nombres sont négatifs : la somme est négative.", `On additionne les distances à zéro : $${-a} + ${-b} = ${-(a + b)}$.`, `Donc $${T(a)} + ${P(b)} = ${T(a + b)}$.`],
      };
    },
    reasoning: "Deux nombres de même signe : on garde le signe commun et on additionne les distances à zéro.",
    hints: ["Les deux nombres sont-ils du même signe ?", "Pense à deux baisses de température successives."],
  }),
  ex({
    id: "rel5-14", title: "Somme de deux nombres de signes contraires", niveau: 2, objectives: ["M5-REL-09"], time: 45,
    vary: (rng) => {
      const a = rng.int(2, 19);
      let b = rng.int(2, 19);
      while (a === b) b = rng.int(2, 19);
      const [x, y] = rng.next() < 0.5 ? [a, -b] : [-a, b];
      const s = x + y;
      return {
        statement: `Calculer $${T(x)} + ${P(y)}$.`,
        parts: [num(s, [{ match: String(-s), feedback: "Signe incorrect : la somme prend le signe du nombre qui a la **plus grande** distance à zéro." }, { match: String(Math.sign(s) * (a + b)), feedback: "Les nombres sont de signes contraires : on **soustrait** les distances à zéro (la plus grande moins la plus petite)." }])],
        solution: ["Les deux nombres sont de signes contraires.", `On soustrait les distances à zéro : $${Math.max(a, b)} - ${Math.min(a, b)} = ${Math.abs(s)}$.`, `La somme prend le signe du nombre le plus éloigné de zéro : $${T(x)} + ${P(y)} = ${T(s)}$.`],
      };
    },
    reasoning: "Des « paires nulles » se compensent : dans $6 + (-9)$, 6 et $-6$ s'annulent, il reste $-3$.",
    hints: ["Lequel des deux nombres est le plus éloigné de zéro ?", "Sur la droite graduée : pars du premier nombre et déplace-toi du second."],
  }),
  ex({
    id: "rel5-15", title: "Prévoir le signe d'une somme", niveau: 2, objectives: ["M5-REL-09"], time: 30,
    vary: (rng) => {
      const x = rng.sign() * rng.int(10, 99) / 10;
      let y = -Math.sign(x) * rng.int(10, 99) / 10;
      if (Math.abs(y) === Math.abs(x)) y = r1(y + Math.sign(y) * 0.3);
      if (rng.next() < 0.3) y = -y;
      const s = r1(x + y);
      return {
        statement: `Sans calculer la valeur exacte, quel est le signe de $${T(x)} + ${P(y)}$ ?`,
        parts: [qcm(["La somme est positive", "La somme est négative", "La somme est nulle"], s > 0 ? 0 : 1)],
        solution: [Math.sign(x) === Math.sign(y) ? "Les deux nombres sont de même signe : la somme a ce signe." : `Signes contraires : la somme prend le signe du nombre le plus éloigné de zéro, ici $${T(Math.abs(x) > Math.abs(y) ? x : y)}$.`, `En effet, $${T(x)} + ${P(y)} = ${T(s)}$.`],
      };
    },
    reasoning: "Prévoir le signe avant de calculer permet de contrôler son résultat.",
    hints: ["Compare d'abord les signes des deux nombres.", "S'ils sont contraires, compare leurs distances à zéro."],
  }),

  // ── Niveau 3 : Consolidation ──
  ex({
    id: "rel5-16", title: "Ranger des décimaux relatifs", niveau: 3, objectives: ["M5-REL-08"], time: 120,
    vary: (rng) => {
      const base = rng.int(1, 4);
      const set = new Set<number>([-(base + 0.5), -(base + 0.15), -(base + 0.05), -base, -(base - 1 + 0.9), r2(rng.int(1, 9) / 10), -(base + 1)]);
      const vals = rng.shuffle([...set].map(r2)).slice(0, 6);
      const order = vals.map((_, i) => i).sort((i, j) => vals[i] - vals[j]);
      if (order.every((v, i) => v === i)) vals.reverse();
      const ord = vals.map((_, i) => i).sort((i, j) => vals[i] - vals[j]);
      return {
        statement: "Ranger ces nombres dans l'**ordre croissant** (du plus petit au plus grand).",
        parts: [{ interaction: { kind: "ordonner", items: vals.map((v) => `$${T(v)}$`), answer: ord, hint: "Du plus petit (en haut) au plus grand (en bas)" } }],
        solution: ["Les négatifs sont plus petits que les positifs.", "Entre deux négatifs, le plus petit est celui qui a la plus grande distance à zéro (comparer en complétant par des zéros : $-2{,}50$ et $-2{,}15$).", `Ordre croissant : $${ord.map((i) => T(vals[i])).join(" < ")}$.`],
      };
    },
    reasoning: "On compare d'abord les signes, puis les distances à zéro ; pour des négatifs, l'ordre des distances est inversé.",
    hints: ["Commence par repérer le seul (ou les) nombre(s) positif(s).", "Écris tous les nombres avec deux décimales pour comparer les distances à zéro."],
  }),
  ex({
    id: "rel5-17", title: "Additionner des décimaux relatifs", niveau: 3, objectives: ["M5-REL-09"], time: 60,
    vary: (rng) => {
      const x = rng.sign() * rng.int(11, 99) / 10, y0 = rng.int(11, 99) / 10;
      const y = x > 0 ? -y0 : rng.sign() * y0;
      const s = r1(x + y);
      const sameSign = Math.sign(x) === Math.sign(y);
      const wrong = r1(Math.sign(s || 1) * (sameSign ? Math.abs(Math.abs(x) - Math.abs(y)) : Math.abs(x) + Math.abs(y)));
      const mistakes: Mistake[] = [];
      if (s !== 0 && Math.abs(wrong) !== Math.abs(s)) mistakes.push({ match: String(wrong), feedback: sameSign ? "Même signe : on additionne les distances à zéro." : "Signes contraires : on soustrait les distances à zéro." });
      if (s !== 0) mistakes.push({ match: String(-s), feedback: "Erreur de signe : regarde quel nombre est le plus éloigné de zéro." });
      return {
        statement: `Calculer $${T(x)} + ${P(y)}$.`,
        parts: [num(s, mistakes)],
        solution: [sameSign ? `Même signe : on additionne $${T(Math.abs(x))} + ${T(Math.abs(y))} = ${T(Math.abs(s))}$ et on garde le signe.` : `Signes contraires : $${T(Math.max(Math.abs(x), Math.abs(y)))} - ${T(Math.min(Math.abs(x), Math.abs(y)))} = ${T(Math.abs(s))}$, signe du plus éloigné de zéro.`, `$${T(x)} + ${P(y)} = ${T(s)}$.`],
      };
    },
    reasoning: "Les règles sont les mêmes pour les décimaux que pour les entiers ; on calcule sur les distances à zéro puis on fixe le signe.",
    hints: ["Prévois d'abord le signe du résultat.", "Calcule ensuite sur les distances à zéro (comme avec des décimaux positifs)."],
  }),
  ex({
    id: "rel5-18", title: "Transformer une soustraction en addition", niveau: 3, objectives: ["M5-REL-11"], time: 75,
    vary: (rng) => {
      const a = rng.sign() * rng.int(2, 15), b = rng.sign() * rng.int(2, 15);
      return {
        statement: `Compléter le calcul de $${T(a)} - ${P(b)}$.`,
        parts: [{ interaction: { kind: "texte-trous", template: `$${T(a)} - ${P(b)} = ${T(a)} + ($ [[0]] $) =$ [[1]]`, blanks: [{ type: "number", answer: { value: -b } }, { type: "number", answer: { value: a - b } }] } }],
        solution: [`Soustraire $${P(b)}$, c'est ajouter son opposé $${P(-b)}$.`, `$${T(a)} - ${P(b)} = ${T(a)} + ${P(-b)} = ${T(a - b)}$.`],
      };
    },
    reasoning: "Soustraire un nombre revient à additionner son opposé : $a - b = a + (-b)$. Seul le second nombre change.",
    hints: ["Quel est l'opposé du nombre soustrait ?", "Le premier nombre ne change pas."],
  }),
  ex({
    id: "rel5-19", title: "Table d'addition de relatifs", niveau: 3, objectives: ["M5-REL-09"], time: 150,
    vary: (rng) => {
      const cols = [-nz(rng, 2, 9), nz(rng, 2, 9), -rng.int(11, 49) / 10];
      const rows = [rng.int(2, 9), -rng.int(2, 9)];
      return {
        statement: "Compléter la table : chaque case contient la **somme** du nombre de sa ligne et du nombre de sa colonne.",
        parts: [{ interaction: { kind: "tableau", headers: ["$+$", ...cols.map((c) => `$${T(c)}$`)], rows: rows.map((r) => ({ label: `$${T(r)}$`, cells: cols.map((c) => ({ answer: { value: r1(r + c) } })) })) } }],
        solution: rows.flatMap((r) => cols.map((c) => `$${T(r)} + ${P(c)} = ${T(r1(r + c))}$`)),
      };
    },
    reasoning: "Chaque case applique la règle de l'addition de deux relatifs ; un tableau permet de s'entraîner sur tous les cas de signes.",
    hints: ["Pour chaque case, regarde si les deux nombres ont le même signe ou non."],
  }),
  ex({
    id: "rel5-20", title: "Soustraire des relatifs", niveau: 3, objectives: ["M5-REL-11"], time: 50,
    vary: (rng) => {
      const a = rng.sign() * rng.int(2, 15), b = -rng.int(2, 15);
      const d = a - b;
      return {
        statement: `Calculer $${T(a)} - ${P(b)}$.`,
        parts: [num(d, [{ match: String(a + b), feedback: `Tu as ajouté $${P(b)}$ au lieu de le soustraire. Soustraire $${P(b)}$, c'est ajouter $${T(-b)}$.` }, { match: String(-d), feedback: "Erreur de signe. Écris d'abord la soustraction sous forme d'addition de l'opposé." }])],
        solution: [`$${T(a)} - ${P(b)} = ${T(a)} + ${T(-b)}$ (on ajoute l'opposé).`, `$= ${T(d)}$.`],
      };
    },
    reasoning: "Retirer une dette, c'est gagner de l'argent : soustraire un négatif augmente le résultat.",
    hints: ["Quel est l'opposé du nombre soustrait ?", "Réécris le calcul avec un « + »."],
  }),
  ex({
    id: "rel5-21", title: "Écritures égales", niveau: 3, objectives: ["M5-REL-11", "M5-REL-12"], time: 90,
    statement: "Associer chaque soustraction à l'addition qui lui est égale.",
    parts: [{ interaction: { kind: "associer", left: ["$5 - (-3)$", "$-4 - 6$", "$7 - (+2)$", "$-1 - (-8)$"], right: ["$7 + (-2)$", "$-1 + 8$", "$5 + 3$", "$(-4) + (-6)$"], answer: [2, 3, 0, 1] } }],
    solution: ["On garde le premier nombre et on ajoute l'opposé du second.", "$5 - (-3) = 5 + 3$ ; $-4 - 6 = (-4) + (-6)$ ; $7 - (+2) = 7 + (-2)$ ; $-1 - (-8) = -1 + 8$."],
    reasoning: "La transformation $a - b = a + (-b)$ ne modifie que le nombre soustrait.",
    hints: ["Repère dans chaque soustraction le nombre soustrait, puis son opposé."],
  }),
  ex({
    id: "rel5-22", title: "Somme de plusieurs relatifs", niveau: 3, objectives: ["M5-REL-10"], time: 90,
    vary: (rng) => {
      const a = rng.int(2, 9);
      const t = rng.shuffle([a, -a, rng.int(2, 12), -rng.int(2, 12), -rng.int(2, 12)]);
      const s = t.reduce((u, v) => u + v, 0);
      const pos = t.filter((v) => v > 0).reduce((u, v) => u + v, 0), neg = t.filter((v) => v < 0).reduce((u, v) => u + v, 0);
      return {
        statement: `Calculer astucieusement $${t.map((v, i) => (i === 0 ? T(v) : P(v))).join(" + ")}$.`,
        parts: [num(s, s !== 0 ? [{ match: String(-s), feedback: "Erreur de signe sur le résultat final : compare la somme des positifs et celle des négatifs." }] : [])],
        solution: [`On repère deux opposés, $${T(a)}$ et $${T(-a)}$ : leur somme est nulle.`, `Somme des termes positifs : $${pos}$ ; somme des termes négatifs : $${T(neg)}$.`, `Résultat : $${pos} + ${P(neg)} = ${T(s)}$.`],
      };
    },
    reasoning: "Dans une suite d'additions, on peut changer l'ordre et regrouper les termes : opposés ensemble, positifs ensemble, négatifs ensemble.",
    hints: ["Cherche deux nombres opposés.", "Regroupe ensuite les positifs d'un côté, les négatifs de l'autre."],
  }),
  ex({
    id: "rel5-23", title: "Comparaisons de décimaux négatifs", niveau: 3, objectives: ["M5-REL-08"], time: 75,
    statement: "Pour chaque affirmation, répondre Vrai ou Faux.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["$-2{,}15 < -2{,}5$", "$-0{,}8 < -0{,}75$", "$-3 > -3{,}01$", "$-10 > -9$", "$-0{,}1 > -1$"], answer: [false, true, true, false, true] } }],
    solution: ["$-2{,}15$ est plus proche de 0 que $-2{,}50$ : $-2{,}15 > -2{,}5$ (Faux).", "$0{,}80 > 0{,}75$ donc $-0{,}8 < -0{,}75$ (Vrai).", "$3{,}00 < 3{,}01$ donc $-3 > -3{,}01$ (Vrai).", "$-10$ est plus loin de 0 que $-9$ : $-10 < -9$ (Faux).", "$-0{,}1$ est plus proche de 0 : $-0{,}1 > -1$ (Vrai)."],
    reasoning: "Entre deux négatifs, le plus grand est le plus proche de 0. Complète par des zéros pour comparer les distances.",
    hints: ["Écris les deux nombres avec le même nombre de décimales.", "Pour des négatifs, la plus petite distance à zéro donne le plus grand nombre."],
  }),

  // ── Niveau 4 : Approfondissement ──
  ex({
    id: "rel5-24", title: "Simplifier une écriture", niveau: 4, objectives: ["M5-REL-13"], time: 75,
    vary: (rng) => {
      const [a, b, c, d] = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)];
      const opts = [`$-${a} - ${b} - ${c} + ${d}$`, `$-${a} - ${b} + ${c} - ${d}$`, `$-${a} - ${b} - ${c} - ${d}$`, `$${a} + ${b} - ${c} + ${d}$`];
      return {
        statement: `Quelle est l'écriture simplifiée de $(-${a}) + (-${b}) - (+${c}) - (-${d})$ ?`,
        parts: [shuffledQcm(rng, opts, 0, { 1: "Tu as changé le signe de chaque nombre au lieu de transformer seulement les soustractions.", 2: `Attention : $-(-${d})$ devient $+${d}$ (soustraire un négatif revient à ajouter son opposé).`, 3: "Les signes « − » placés devant les nombres entre parenthèses font partie de ces nombres : ils ne disparaissent pas." })],
        solution: [`On transforme les soustractions : $-(+${c}) = +(-${c})$ et $-(-${d}) = +(+${d})$.`, `On obtient la somme $(-${a}) + (-${b}) + (-${c}) + (+${d})$.`, `On supprime les « + » d'addition et les parenthèses : $-${a} - ${b} - ${c} + ${d}$.`],
      };
    },
    reasoning: "D'abord transformer toutes les soustractions en additions, ensuite seulement supprimer parenthèses et signes « + ».",
    hints: ["Commence par écrire la somme sans aucune soustraction.", "Que devient $-(-x)$ ?"],
  }),
  ex({
    id: "rel5-25", title: "Enchaîner additions et soustractions", niveau: 4, objectives: ["M5-REL-14", "M5-REL-10"], time: 150,
    vary: (rng) => {
      const v = [rng.int(2, 12), -rng.int(2, 12), rng.int(2, 12), -rng.int(2, 12), rng.int(2, 12)];
      const expr = `${v[0]} - ${P(-v[1])} + ${P(v[2])} - ${P(-v[3])} - ${P(-v[4])}`;
      // termes réels de la somme : v[0] + v[1] + v[2] + v[3] + v[4]
      const pos = v.filter((x) => x > 0).reduce((s, x) => s + x, 0), neg = v.filter((x) => x < 0).reduce((s, x) => s + x, 0);
      return {
        statement: `On veut calculer $A = ${expr}$.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Somme des termes positifs (après transformation des soustractions)", answer: { value: pos } }, { prompt: "Somme des termes négatifs", answer: { value: neg } }, { prompt: "$A =$", answer: { value: pos + neg } }] } }],
        solution: [`On écrit $A$ sous forme de somme : $A = ${v.map((x, i) => (i === 0 ? T(x) : P(x))).join(" + ")}$.`, `Termes positifs : $${v.filter((x) => x > 0).join(" + ")} = ${pos}$.`, `Termes négatifs : $${v.filter((x) => x < 0).map(P).join(" + ")} = ${T(neg)}$.`, `$A = ${pos} + ${P(neg)} = ${T(pos + neg)}$.`],
      };
    },
    reasoning: "Une fois toutes les soustractions transformées, on a une somme : on peut regrouper les positifs et les négatifs.",
    hints: ["Transforme chaque « $-$ (…) » en « $+$ opposé ».", "Écris la liste des termes avec leur signe avant de regrouper."],
  }),
  ex({
    id: "rel5-26", title: "Variation de température", niveau: 4, objectives: ["M5-REL-15", "M5-REL-05"], time: 90,
    vary: (rng) => {
      const t1 = -rng.int(15, 95) / 10, t2 = rng.int(5, 80) / 10;
      const v = r1(t2 - t1);
      return {
        statement: `Dans une station de montagne, il faisait $${T(t1)}$ °C à 7 h et $${T(t2)}$ °C à 14 h. De combien de degrés la température a-t-elle augmenté ?`,
        parts: [num(v, [{ match: String(r1(t2 + t1)), feedback: "La variation se calcule par « valeur finale − valeur initiale » : il faut soustraire la température de départ (négative)." }, { match: String(-v), feedback: "La température est montée : la variation est positive. Calcule « finale − initiale »." }], "Augmentation (en °C) :")],
        solution: ["Variation = température finale − température initiale.", `$${T(t2)} - ${P(t1)} = ${T(t2)} + ${T(-t1)} = ${T(v)}$.`, `La température a augmenté de $${T(v)}$ °C : de $${T(t1)}$ à 0 il y a $${T(-t1)}$ degrés, puis de 0 à $${T(t2)}$ il y en a $${T(t2)}$.`],
      };
    },
    reasoning: "Ne pas confondre un **état** (une température) et une **variation** (un écart entre deux états) : variation = final − initial.",
    hints: ["Combien de degrés pour remonter jusqu'à 0 °C ?", "Et combien ensuite de 0 °C à la température finale ?"],
  }),
  ex({
    id: "rel5-27", title: "Le plongeur", niveau: 4, objectives: ["M5-REL-15", "M5-REL-14"], time: 90,
    vary: (rng) => {
      const a = -rng.int(8, 30), up = rng.int(20, 79) / 10, down = rng.int(2, 9);
      const f = r1(a + up - down);
      return {
        statement: `Un plongeur se trouve à l'altitude $${T(a)}$ m (le niveau de la mer correspond à 0 m). Il remonte de $${T(up)}$ m, puis redescend de $${down}$ m. À quelle altitude se trouve-t-il alors ?`,
        parts: [num(f, [{ match: String(r1(a - up + down)), feedback: "Remonter fait **augmenter** l'altitude (on ajoute) ; descendre la fait diminuer (on soustrait)." }, { match: String(-f), feedback: "Le plongeur est toujours sous la surface : son altitude est négative." }], "Altitude finale (en m) :")],
        solution: [`Altitude finale $= ${T(a)} + ${T(up)} - ${down}$.`, `$${T(a)} + ${T(up)} = ${T(r1(a + up))}$, puis $${T(r1(a + up))} - ${down} = ${T(f)}$.`, `Le plongeur est à $${T(f)}$ m, soit $${T(-f)}$ m sous la surface.`],
      };
    },
    reasoning: "On applique successivement les variations (+ pour monter, − pour descendre) à l'état de départ.",
    hints: ["Écris le calcul : état initial + variation 1 + variation 2.", "Une descente est une variation négative."],
  }),
  ex({
    id: "rel5-28", title: "Addition à trou", niveau: 4, objectives: ["M5-REL-11"], time: 60,
    vary: (rng) => {
      const a = -rng.int(2, 12), c = rng.sign() * rng.int(1, 12);
      return {
        statement: `Trouver le nombre manquant : $${T(a)} + \\ldots = ${T(c)}$.`,
        parts: [num(c - a, [{ match: String(c + a), feedback: `Le nombre cherché est $${T(c)} - ${P(a)}$ : soustraire $${P(a)}$ revient à ajouter $${T(-a)}$.` }])],
        solution: [`Le nombre manquant est la différence $${T(c)} - ${P(a)}$.`, `$${T(c)} - ${P(a)} = ${T(c)} + ${T(-a)} = ${T(c - a)}$.`, `Vérification : $${T(a)} + ${P(c - a)} = ${T(c)}$.`],
      };
    },
    reasoning: "Compléter une addition à trou, c'est calculer une différence : $a + \\ldots = c$ donne $\\ldots = c - a$.",
    hints: ["Sur la droite graduée : de combien faut-il se déplacer pour aller de $a$ à $c$ ?", "Vérifie ta réponse en refaisant l'addition."],
  }),
  ex({
    id: "rel5-29", title: "Parenthèses et signe « − »", niveau: 4, objectives: ["M5-REL-12", "M5-REL-02"], time: 120,
    statement: "Pour chaque affirmation, répondre Vrai ou Faux.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["$-(2 + 3) = -2 + 3$", "L'écriture « $3 + -2$ » est correcte.", "$-(-6) = 6$", "Si $a$ est un nombre, $-a$ est toujours négatif.", "$7 - (+3) - (-2) = 7 - 3 + 2$"], answer: [false, false, true, false, true] } }],
    solution: ["$-(2+3) = -5$ alors que $-2 + 3 = 1$ : les parenthèses changent le sens (Faux).", "Deux signes ne se suivent pas : on écrit $3 + (-2)$ (Faux).", "L'opposé de $-6$ est $6$ (Vrai).", "Contre-exemple : si $a = -4$, alors $-a = 4$, positif (Faux).", "$-(+3) = +(-3)$ et $-(-2) = +(+2)$ (Vrai)."],
    reasoning: "Le signe « − » a trois rôles : signe d'un nombre ($-2$), soustraction ($5 - 2$), opposé ($-a$). Les parenthèses lèvent les ambiguïtés.",
    hints: ["Calcule séparément les deux membres de chaque égalité.", "Pour une affirmation « toujours », un seul contre-exemple suffit à la rendre fausse."],
  }),
  ex({
    id: "rel5-30", title: "Du sommet à la fosse", niveau: 4, objectives: ["M5-REL-15"], time: 90,
    vary: (rng) => {
      const h = rng.int(8, 30) * 50, d = -rng.int(3, 40) * 10;
      return {
        statement: `Le sommet d'une île culmine à $${T(h)}$ m d'altitude. Au large, le fond marin est à l'altitude $${T(d)}$ m. Quelle est la différence d'altitude entre le sommet et le fond ?`,
        parts: [num(h - d, [{ match: String(h + d), feedback: "La différence d'altitude est « altitude du sommet − altitude du fond » : soustraire un négatif revient à ajouter sa distance à zéro." }], "Différence (en m) :")],
        solution: ["Différence = altitude la plus haute − altitude la plus basse.", `$${T(h)} - ${P(d)} = ${T(h)} + ${T(-d)} = ${T(h - d)}$.`, `Il y a $${T(h)}$ m au-dessus du niveau de la mer et $${T(-d)}$ m en dessous.`],
      };
    },
    reasoning: "Un écart entre deux positions se calcule par une soustraction ; avec un négatif, l'écart « traverse » le zéro.",
    hints: ["Fais un schéma vertical avec le niveau de la mer à 0.", "Combien de mètres au-dessus de 0 ? Et en dessous ?"],
  }),

  // ── Niveau 5 : Défi ──
  ex({
    id: "rel5-31", title: "Carré magique à somme nulle", niveau: 5, objectives: ["M5-REL-10", "M5-REL-14"], time: 240,
    vary: (rng) => {
      const k = rng.pick([1, 2, 5]) * rng.sign();
      const base = [[-3, 2, 1], [4, 0, -4], [-1, -2, 3]].map((r) => r.map((v) => v * k));
      const hidden = new Set(rng.pick([["0-0", "1-2", "2-1"], ["0-1", "1-0", "2-2"], ["0-2", "1-1", "2-0"]]));
      return {
        statement: "Dans ce carré magique, la somme des nombres de chaque ligne, de chaque colonne et de chaque diagonale est égale à $0$. Compléter les cases vides.",
        parts: [{ interaction: { kind: "tableau", headers: [], rows: base.map((r, i) => ({ label: "", cells: r.map((v, j) => (hidden.has(`${i}-${j}`) ? { answer: { value: v } } : `$${T(v)}$`)) })) } }],
        solution: ["Dans chaque ligne, la case manquante est l'opposé de la somme des deux autres (car la somme totale vaut 0).", ...base.map((r) => `$${r.map((v, j) => (j === 0 ? T(v) : P(v))).join(" + ")} = 0$`)],
      };
    },
    reasoning: "Si $a + b + x = 0$, alors $x$ est l'opposé de $a + b$.",
    hints: ["Choisis une ligne ou une colonne où il ne manque qu'un nombre.", "Calcule la somme des deux nombres connus : le nombre manquant est son opposé."],
  }),
  ex({
    id: "rel5-32", title: "Le nombre mystère", niveau: 5, objectives: ["M5-REL-08", "M5-REL-03", "M5-REL-04"], time: 150,
    statement: "Je suis un nombre **strictement négatif**. Ma distance à zéro est comprise entre 2 et 3. Je suis **supérieur** à $-2{,}5$. Mon chiffre des dixièmes est 2. Qui suis-je ?",
    parts: [qcm(["$-2{,}2$", "$-2{,}6$", "$2{,}2$", "$-1{,}2$", "$-2{,}8$"], 0, [
      { match: "1", feedback: "$-2{,}6 < -2{,}5$ : il n'est pas supérieur à $-2{,}5$ (il est plus loin de 0)." },
      { match: "2", feedback: "$2{,}2$ est positif, or le nombre est strictement négatif." },
      { match: "3", feedback: "La distance à zéro de $-1{,}2$ est $1{,}2$, elle n'est pas comprise entre 2 et 3." },
      { match: "4", feedback: "$-2{,}8 < -2{,}5$ et son chiffre des dixièmes est 8." },
    ])],
    solution: ["Strictement négatif : on élimine $2{,}2$.", "Distance à zéro entre 2 et 3 : on élimine $-1{,}2$.", "Supérieur à $-2{,}5$ : on élimine $-2{,}6$ et $-2{,}8$ (plus loin de 0).", "Il reste $-2{,}2$, dont le chiffre des dixièmes est bien 2."],
    reasoning: "On traite les indices un par un en éliminant les candidats ; chaque indice mobilise une notion (signe, distance à zéro, comparaison).",
    hints: ["Commence par l'indice sur le signe.", "Place $-2{,}5$ sur une droite : quels nombres sont à sa droite ?"],
  }),
  ex({
    id: "rel5-33", title: "Démontrer une soustraction", niveau: 5, objectives: ["M5-REL-11"], time: 240,
    vary: (rng) => {
      const steps = [
        { s: "$5 - (-3)$ est le nombre qu'il faut ajouter à $-3$ pour obtenir $5$.", j: 0 },
        { s: "$(-3) + 3 = 0$.", j: 1 },
        { s: "Donc $(-3) + 3 + 5 = 0 + 5 = 5$.", j: 2 },
        { s: "Ainsi, ajouter $3 + 5 = 8$ à $-3$ donne $5$ : $5 - (-3) = 8 = 5 + 3$.", j: 0 },
      ];
      const OPTS = ["Définition de la différence", "Deux nombres opposés ont une somme nulle", "On peut regrouper les termes d'une somme", "Règle des signes de la multiplication"];
      const order = rng.shuffle([0, 1, 2, 3]);
      const shown = order.map((i) => steps[i]);
      return {
        statement: "Remettre dans l'ordre les étapes qui prouvent que $5 - (-3) = 5 + 3$, et choisir la justification de chaque étape.",
        parts: [{ interaction: { kind: "demonstration", steps: shown.map((x) => x.s), answer: steps.map((_, i) => order.indexOf(i)), justifications: { options: OPTS, answer: shown.map((x) => x.j) } } }],
        solution: steps.map((x, i) => `${i + 1}. ${x.s} — *${OPTS[x.j]}*`),
      };
    },
    reasoning: "La différence $a - b$ est le nombre qu'on ajoute à $b$ pour obtenir $a$. Ajouter l'opposé de $b$ « annule » $b$ : d'où $a - b = a + (-b)$.",
    hints: ["La première étape rappelle ce que signifie une différence.", "Quel nombre faut-il ajouter à $-3$ pour revenir à 0 ?"],
  }),
  ex({
    id: "rel5-34", title: "Bilan d'une semaine de températures", niveau: 5, objectives: ["M5-REL-15", "M5-REL-14", "M5-REL-10"], time: 240,
    vary: (rng) => {
      const t0 = -rng.int(1, 6);
      const vars = [rng.int(1, 5), -rng.int(2, 7), -rng.int(1, 4), rng.int(2, 8)];
      const total = vars.reduce((s, x) => s + x, 0);
      const days = ["mardi", "mercredi", "jeudi", "vendredi"];
      let t = t0; const temps = vars.map((v) => (t += v));
      return {
        statement: `Lundi à midi, il faisait $${T(t0)}$ °C. Les variations de température d'un jour à l'autre (à midi) ont été : ${vars.map((v, i) => `${days[i]} $${v > 0 ? "+" : ""}${T(v)}$ °C`).join(", ")}.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Température du mercredi (en °C)", answer: { value: temps[1] } }, { prompt: "Température du vendredi (en °C)", answer: { value: temps[3] } }, { prompt: "Variation totale entre lundi et vendredi (en °C)", answer: { value: total } }] } }],
        solution: [`Mardi : $${T(t0)} + ${P(vars[0])} = ${T(temps[0])}$ ; mercredi : $${T(temps[0])} + ${P(vars[1])} = ${T(temps[1])}$.`, `Jeudi : $${T(temps[2])}$ ; vendredi : $${T(temps[2])} + ${P(vars[3])} = ${T(temps[3])}$.`, `Variation totale : somme des variations $= ${vars.map((v, i) => (i === 0 ? T(v) : P(v))).join(" + ")} = ${T(total)}$.`, `Contrôle : $${T(temps[3])} - ${P(t0)} = ${T(total)}$ (final − initial).`],
      };
    },
    reasoning: "La variation totale est la somme des variations successives ; elle est aussi égale à « état final − état initial » : deux calculs qui se contrôlent.",
    hints: ["Applique les variations une par une à partir de la température du lundi.", "La variation totale peut se calculer sans les températures intermédiaires."],
  }),
  ex({
    id: "rel5-35", title: "Toujours vrai ?", niveau: 5, objectives: ["M5-REL-02", "M5-REL-09", "M5-REL-11"], time: 180,
    statement: "Pour chaque affirmation, répondre Vrai (toujours vrai) ou Faux (un contre-exemple existe).",
    parts: [{ interaction: { kind: "vrai-faux", items: ["La somme de deux nombres négatifs est négative.", "La différence de deux nombres négatifs est toujours négative.", "La somme d'un nombre et de son opposé est égale à $0$.", "Si $a > b$, alors $a - b$ est positif.", "La somme d'un nombre positif et d'un nombre négatif est toujours positive."], answer: [true, false, true, true, false] } }],
    solution: ["Deux nombres négatifs : la somme garde le signe −. (Vrai)", "Contre-exemple : $-2 - (-5) = -2 + 5 = 3$, positif. (Faux)", "C'est la définition de l'opposé. (Vrai)", "$a - b$ est le déplacement de $b$ vers $a$ ; si $a$ est à droite de $b$, ce déplacement se fait vers la droite : il est positif. (Vrai)", "Contre-exemple : $2 + (-7) = -5$. (Faux)"],
    reasoning: "Pour réfuter une affirmation générale, un seul contre-exemple suffit ; pour l'admettre, il faut s'appuyer sur une règle.",
    hints: ["Teste chaque affirmation avec des nombres simples, en cherchant un cas qui la met en défaut."],
  }),
  ex({
    id: "rel5-36", title: "Points symétriques et opposés", niveau: 5, objectives: ["M5-REL-07", "M5-REL-02"], time: 180,
    vary: (rng) => {
      const a = nz(rng, -4, 4), b = nz(rng, -4, 4);
      return {
        statement: `On donne $A(${T(a)}\\,;\\,${T(b)})$. Placer :\n- $B$, dont les coordonnées sont les opposées de celles de $A$ ;\n- $C$, de même ordonnée que $A$ et d'abscisse opposée ;\n- $D$, de même abscisse que $A$ et d'ordonnée opposée.`,
        parts: [{ interaction: { kind: "repere", xmin: -5, xmax: 5, ymin: -5, ymax: 5, step: 1, points: [{ label: "B", answer: [-a, -b] }, { label: "C", answer: [-a, b] }, { label: "D", answer: [a, -b] }] } }],
        solution: [`$B(${T(-a)}\\,;\\,${T(-b)})$ : symétrique de $A$ par rapport à l'origine.`, `$C(${T(-a)}\\,;\\,${T(b)})$ : symétrique de $A$ par rapport à l'axe des ordonnées.`, `$D(${T(a)}\\,;\\,${T(-b)})$ : symétrique de $A$ par rapport à l'axe des abscisses.`],
      };
    },
    reasoning: "Prendre l'opposé d'une coordonnée revient à « retourner » le point de l'autre côté d'un axe ; changer les deux revient à faire un demi-tour autour de l'origine.",
    hints: ["Écris d'abord les coordonnées de chaque point avant de le placer.", "L'opposé de $-3$ est $3$."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const thermometer = (() => {
  const vals = [10, 5, 0, -5, -10];
  const Y = (t: number) => 30 + (10 - t) * 9;
  let s = `<rect x="70" y="20" width="22" height="200" rx="11" fill="#fff" stroke="#334155" stroke-width="2"/><circle cx="81" cy="236" r="18" fill="#dc2626" stroke="#334155" stroke-width="2"/><rect x="76" y="${Y(-4)}" width="12" height="${236 - Y(-4)}" fill="#dc2626"/>`;
  for (let t = -10; t <= 10; t++) s += `<line x1="92" y1="${Y(t)}" x2="${t % 5 === 0 ? 104 : 98}" y2="${Y(t)}" stroke="#334155"/>`;
  for (const t of vals) s += `<text x="110" y="${Y(t) + 4}" font-size="12" fill="${t === 0 ? "#2563eb" : "#334155"}" font-weight="${t === 0 ? 700 : 400}">${t === 0 ? "0" : String(t).replace("-", "−")} °C</text>`;
  s += `<text x="160" y="${Y(-4) + 4}" font-size="13" fill="#dc2626" font-weight="700">← −4 °C</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 270" role="img" aria-label="Thermomètre indiquant moins 4 degrés" style="width:100%;max-width:240px;height:auto;font-family:Inter,Arial,sans-serif">${s}</svg>`;
})();

// ───────────────────────── Chapitre ─────────────────────────
export const math5eNombresRelatifs: ChapterContent = {
  id: "math-5e-nombres-relatifs",
  taskId: "SCI-5E-MATH-001",
  grade: "5e",
  subject: "mathematiques",
  treeChapterId: "m5-relatifs",
  // Correspondance avec l'inventaire A1 : M5-NC-10…14 → M5-REL-01…08 ; M5-NC-15…18 → M5-REL-09…15.
  curriculumChapterIds: ["math-5e-nombres-relatifs", "math-5e-relatifs-addition-soustraction"],
  curriculumVersion: "2026-2027",
  title: "Nombres relatifs",
  officialObjectives: (Object.keys(O) as Obj[]).map((id) => ({ id, text: O[id], source: SRC })),
  prerequisites: [
    { text: "Repérer et placer un nombre décimal sur une demi-droite graduée (6e).", chapterId: "m6-nombres" },
    { text: "Comparer et ranger des nombres décimaux, utiliser les symboles $<$, $>$, $\\leqslant$, $\\geqslant$ (6e).", chapterId: "m6-nombres" },
    { text: "Additionner et soustraire des nombres décimaux ; sens de la soustraction comme écart et comme complément (cycle 3).", chapterId: "m6-calculs" },
    { text: "Lire un graphique et placer des points dans un repère (premier quart du plan, cycle 3)." },
  ],
  sources: [
    { id: "R2", title: "Annexe 2 — Programme de mathématiques pour le cycle 4 (BO n° 10 du 5 mars 2026), reproduction académie de Corse", url: "https://sites.ac-corse.fr/maths/2026/03/05/nouveau-programme-pour-le-cycle-4/", kind: "official", note: "texte de référence ; la page du BO n'était pas accessible automatiquement (403)" },
    { id: "R1", title: "Bulletin officiel n° 10 du 5 mars 2026", url: "https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A", kind: "official" },
    { id: "R3", title: "Exemples pour la mise en œuvre des programmes — Cycle 4 — Mathématiques (2026), reproduction académie de Besançon", url: "https://mathematiques.ac-besancon.fr/wp-content/uploads/sites/45/2026/04/Exemple-mise-en-oeuvre-c4-mathematiques0pdf-126080.pdf", kind: "academic", note: "document d'accompagnement, sans valeur réglementaire" },
    { id: "R7", title: "Programme de mathématiques du cycle 3 (BO n° 16 du 17 avril 2025)", url: "https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf", kind: "official", note: "prérequis de 6e" },
  ],
  lesson: {
    introduction: "Il fait $3$ °C le soir et la température baisse de $5$ degrés pendant la nuit. Avec les nombres connus jusqu'ici, le calcul $3 - 5$ est impossible ! Pourtant le thermomètre indique bien une température : **2 degrés sous zéro**, que l'on note $-2$ °C.\nLes **nombres relatifs** (positifs et négatifs) permettent de décrire tout ce qui peut passer « sous zéro » : températures, altitudes sous le niveau de la mer, étages en sous-sol, dettes… Ils rendent toutes les soustractions possibles.\nLe savais-tu ? Le mathématicien indien Brahmagupta utilisait déjà des nombres négatifs vers l'an 600, mais en Europe certains savants refusaient encore de les considérer comme des nombres au XVIIe siècle.",
    definitions: [
      { term: "Nombre relatif", text: "Un nombre relatif est formé d'un **signe** ($+$ ou $-$) et d'une **distance à zéro**. Les nombres précédés de $-$ sont **négatifs**, ceux précédés de $+$ (que l'on peut omettre : $+3 = 3$) sont **positifs**.\nExemples : $-4{,}5$ a pour signe $-$ et pour distance à zéro $4{,}5$ ; $7$ a pour signe $+$ et pour distance à zéro $7$." },
      { term: "Positif, négatif, strictement", text: "Un nombre est **positif** s'il est supérieur ou égal à $0$, **strictement positif** s'il est supérieur à $0$.\nUn nombre est **négatif** s'il est inférieur ou égal à $0$, **strictement négatif** s'il est inférieur à $0$.\n$0$ est le seul nombre à la fois positif et négatif ; il n'est ni strictement positif, ni strictement négatif." },
      { term: "Droite graduée, abscisse", text: "Une droite graduée possède une origine (le point d'abscisse $0$), un sens et une unité reportée régulièrement **des deux côtés** de l'origine. Chaque point est repéré par un nombre relatif, son **abscisse** : positive à droite de l'origine, négative à gauche." },
      { term: "Opposé", text: "Deux nombres sont **opposés** lorsque leur somme est égale à $0$. L'opposé de $a$ se note $-a$.\nExemples : l'opposé de $5$ est $-5$ ; l'opposé de $-2{,}3$ est $2{,}3$ ; l'opposé de $0$ est $0$." },
      { term: "Valeur absolue (distance à zéro)", text: "La **valeur absolue** d'un nombre est sa distance à zéro : c'est le nombre sans son signe. Elle est toujours positive.\nExemples : la valeur absolue de $-3{,}5$ est $3{,}5$ ; celle de $2$ est $2$." },
      { term: "Repère du plan, coordonnées", text: "Un repère orthogonal est formé de deux droites graduées perpendiculaires de même origine $O$ : l'**axe des abscisses** (horizontal) et l'**axe des ordonnées** (vertical). Un point $M$ est repéré par ses **coordonnées** $(x\\,;\\,y)$ : d'abord l'abscisse, puis l'ordonnée." },
    ],
    properties: [
      { title: "Opposé de l'opposé", statement: "Pour tout nombre $a$ : $-(-a) = a$. Deux nombres opposés ont la même distance à zéro et des signes contraires ; sur une droite graduée, ils sont symétriques par rapport à l'origine.", conditions: "Attention : $-a$ n'est pas toujours négatif. Si $a = -4$, alors $-a = 4$." },
      { title: "Comparer deux relatifs", statement: "Sur une droite graduée orientée vers la droite, le plus petit de deux nombres est le plus à gauche. Donc :\n– un nombre négatif est inférieur à un nombre positif ;\n– entre deux positifs, le plus grand a la plus grande distance à zéro ;\n– entre deux **négatifs**, le plus grand a la **plus petite** distance à zéro : $-2{,}3 > -4{,}1$." },
      { title: "Somme de deux nombres de même signe", statement: "On garde le signe commun et on **additionne** les distances à zéro : $(-6) + (-9) = -15$ ; $4{,}2 + 1{,}3 = 5{,}5$." },
      { title: "Somme de deux nombres de signes contraires", statement: "On **soustrait** les distances à zéro (la plus grande moins la plus petite) et on prend le signe du nombre qui a la plus grande distance à zéro : $6 + (-9) = -3$ ; $(-2{,}5) + 7 = 4{,}5$.", conditions: "Cas particulier : la somme de deux nombres opposés est $0$." },
      { title: "Soustraction", statement: "Soustraire un nombre revient à **ajouter son opposé** : $a - b = a + (-b)$.\nExemples : $3{,}1 - (-2) = 3{,}1 + 2 = 5{,}1$ ; $4 - 7 = 4 + (-7) = -3$.", conditions: "Seul le nombre soustrait est remplacé par son opposé ; le premier nombre ne change pas." },
      { title: "Sommes de plusieurs nombres", statement: "Dans une suite d'**additions**, on peut changer l'ordre des termes et les regrouper (positifs ensemble, négatifs ensemble, opposés ensemble).", conditions: "On transforme d'abord toutes les soustractions en additions : on ne peut pas changer l'ordre dans une soustraction ($5 - 3 \\neq 3 - 5$)." },
      { title: "Écriture simplifiée et parenthèses", statement: "Quand une expression ne contient plus que des additions, on peut supprimer les signes « + » d'addition et les parenthèses : $(-3) + (-4) + (+2)$ s'écrit $-3 - 4 + 2$.\nUn nombre négatif écrit juste après un signe d'opération doit être entre parenthèses : on écrit $3 + (-2)$, jamais « $3 + -2$ »." },
    ],
    explanations: [
      { title: "1. Prolonger la demi-droite graduée", body: "En 6e, la demi-droite graduée partait de $0$. On la prolonge vers la gauche **par symétrie** : à gauche de $0$ on place $-1$, $-2$, $-3$… exactement en face de $1$, $2$, $3$. Le point d'abscisse $-3$ est à $3$ unités à gauche de l'origine." },
      { title: "2. Comparer avec la droite graduée", body: "Plus un point est à droite, plus son abscisse est grande. $-7$ est à gauche de $-3$, donc $-7 < -3$. Penser à un thermomètre : $-7$ °C est plus froid que $-3$ °C." },
      { title: "3. Additionner : des déplacements", body: "Un nombre relatif peut aussi représenter un **déplacement** : $+5$ = avancer de 5 vers la droite, $-5$ = reculer de 5 vers la gauche. Calculer $-8 + 5$, c'est partir de $-8$ et avancer de $5$ : on arrive en $-3$.\nAutre image : des jetons $+1$ et $-1$. Une paire ($+1$, $-1$) vaut $0$. Dans $6 + (-9)$, six paires s'annulent et il reste $3$ jetons $-1$ : le résultat est $-3$." },
      { title: "4. Pourquoi « soustraire, c'est ajouter l'opposé » ?", body: "$5 - (-3)$ est le nombre qu'il faut ajouter à $-3$ pour obtenir $5$. On ajoute d'abord $3$ (pour revenir à $0$), puis $5$ : en tout $3 + 5 = 8$. Donc $5 - (-3) = 5 + 3 = 8$.\nSur la droite graduée, $a - b$ est le déplacement qui mène du point $b$ au point $a$ : de $-3$ à $5$, on avance de $8$." },
      { title: "5. États et variations", body: "Dans un problème, distingue un **état** (une température, une altitude) d'une **variation** (une hausse, une baisse). On a : état final = état initial + variation, et variation = état final − état initial." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Comparer", statement: "Ranger dans l'ordre croissant : $-2{,}5$ ; $1{,}2$ ; $-2{,}15$ ; $0$ ; $-3$.", steps: ["Les nombres négatifs sont les plus petits : $-2{,}5$, $-2{,}15$, $-3$.", "Entre négatifs, le plus petit est le plus éloigné de zéro : $3 > 2{,}50 > 2{,}15$, donc $-3 < -2{,}5 < -2{,}15$.", "Viennent ensuite $0$ puis le positif $1{,}2$."], answer: "$-3 < -2{,}5 < -2{,}15 < 0 < 1{,}2$" },
      { title: "Exemple 2 — Additionner", statement: "Calculer $A = (-7{,}5) + 4{,}2$ et $B = (-3) + (-8)$.", steps: ["$A$ : signes contraires ; $7{,}5 - 4{,}2 = 3{,}3$ ; $-7{,}5$ est le plus éloigné de zéro, donc le signe est $-$.", "$B$ : deux négatifs ; $3 + 8 = 11$ et on garde le signe $-$."], answer: "$A = -3{,}3$ et $B = -11$" },
      { title: "Exemple 3 — Soustraire", statement: "Calculer $C = 2 - (-6)$ et $D = -4 - 9$.", steps: ["$C = 2 + 6 = 8$ (on ajoute l'opposé de $-6$).", "$D = (-4) + (-9) = -13$ (on ajoute l'opposé de $9$)."], answer: "$C = 8$ et $D = -13$" },
      { title: "Exemple 4 — Simplifier puis calculer", statement: "Calculer $E = (-5) - (+3) + (+8) - (-5)$.", steps: ["On transforme les soustractions : $E = (-5) + (-3) + (+8) + (+5)$.", "On simplifie l'écriture : $E = -5 - 3 + 8 + 5$.", "On regroupe : $-5$ et $+5$ sont opposés (somme $0$) ; il reste $-3 + 8 = 5$."], answer: "$E = 5$" },
      { title: "Exemple 5 — Problème", statement: "Un sous-marin est à $-120$ m. Il remonte de $45$ m puis descend de $30$ m. À quelle altitude est-il ?", steps: ["Altitude finale $= -120 + 45 - 30$.", "$-120 + 45 = -75$ puis $-75 - 30 = -105$."], answer: "Il est à $-105$ m, c'est-à-dire $105$ m sous la surface." },
    ],
    illustrations: [
      { svg: numberLine({ min: -5, max: 5, step: 1, points: [{ x: -3, label: "A" }, { x: 3, label: "B" }], title: "Droite graduée : A d'abscisse −3 et B d'abscisse 3, symétriques par rapport à 0" }), alt: "Droite graduée de −5 à 5 ; le point A d'abscisse −3 et le point B d'abscisse 3 sont à la même distance de 0, de part et d'autre.", caption: "$A(-3)$ et $B(3)$ : deux nombres opposés, symétriques par rapport à l'origine." },
      { svg: thermometer, alt: "Thermomètre gradué de −10 °C à 10 °C ; le liquide s'arrête à −4 °C.", caption: "Plus on descend sur le thermomètre, plus la température est petite : $-4 < 0 < 5$." },
      { svg: plot({ xmin: -5, xmax: 5, ymin: -4, ymax: 4, points: [{ x: 3, y: 2, label: "A(3 ; 2)" }, { x: -4, y: 1, label: "B(−4 ; 1)" }, { x: -2, y: -3, label: "C(−2 ; −3)" }, { x: 2, y: -2, label: "D(2 ; −2)" }], title: "Repère orthogonal avec quatre points", width: 360, height: 300 }), alt: "Repère orthogonal avec les points A(3 ; 2), B(−4 ; 1), C(−2 ; −3) et D(2 ; −2), un dans chaque quart du plan.", caption: "Un point dans chaque quart du plan : le signe des coordonnées indique le quart." },
    ],
    commonMistakes: [
      { mistake: "$-7 > -3$ « car 7 est plus grand que 3 »", correction: "$-7 < -3$", why: "Entre deux négatifs, le plus grand est le plus proche de $0$ (−3 °C est moins froid que −7 °C)." },
      { mistake: "$(-3) + (-4) = 7$", correction: "$(-3) + (-4) = -7$", why: "Deux baisses successives font baisser davantage : la somme de deux négatifs est négative." },
      { mistake: "$(-8) + 5 = -13$", correction: "$(-8) + 5 = -3$", why: "Signes contraires : on soustrait les distances à zéro ($8 - 5$) au lieu de les additionner." },
      { mistake: "$5 - (-3) = 2$", correction: "$5 - (-3) = 5 + 3 = 8$", why: "Soustraire un nombre, c'est ajouter son opposé." },
      { mistake: "$7 - (+3) - (-2) = 7 - 3 - 2$", correction: "$7 - (+3) - (-2) = 7 - 3 + 2$", why: "On transforme chaque soustraction avant de supprimer les parenthèses : $-(-2) = +2$." },
      { mistake: "« $-a$ est toujours négatif »", correction: "$-a$ est l'opposé de $a$ : si $a = -4$, $-a = 4$", why: "Le signe « − » devant une lettre signifie « opposé de », pas « nombre négatif »." },
      { mistake: "Placer $(-2\\,;\\,3)$ au point $(3\\,;\\,-2)$", correction: "Abscisse $-2$ (horizontal), puis ordonnée $3$ (vertical)", why: "Les coordonnées s'écrivent toujours dans l'ordre (abscisse ; ordonnée)." },
    ],
    methods: [
      { title: "Additionner deux relatifs", steps: ["Regarder les signes des deux nombres.", "Même signe : additionner les distances à zéro et garder le signe.", "Signes contraires : soustraire les distances à zéro et prendre le signe du nombre le plus éloigné de zéro.", "Contrôler le signe obtenu avec la droite graduée."] },
      { title: "Soustraire deux relatifs", steps: ["Garder le premier nombre.", "Remplacer « $-$ nombre » par « $+$ opposé du nombre ».", "Calculer l'addition obtenue."] },
      { title: "Calculer une suite d'additions et de soustractions", steps: ["Transformer toutes les soustractions en additions.", "Écrire la somme simplifiée (sans parenthèses ni « + » d'addition).", "Regrouper les opposés, puis les positifs, puis les négatifs.", "Additionner les deux résultats."] },
      { title: "Résoudre un problème avec des relatifs", steps: ["Repérer l'état initial, les variations, l'état cherché.", "Écrire le calcul : état final = état initial + variations, ou variation = final − initial.", "Calculer, puis vérifier le sens du résultat (hausse ou baisse ?)."] },
    ],
    summary: [
      "Un nombre relatif = un signe + une distance à zéro (sa valeur absolue).",
      "$0$ est positif et négatif, mais ni strictement positif ni strictement négatif.",
      "Deux nombres opposés ont une somme nulle ; $-(-a) = a$ ; $-a$ n'est pas toujours négatif.",
      "Entre deux négatifs, le plus grand est le plus proche de $0$.",
      "Même signe : on additionne les distances à zéro ; signes contraires : on les soustrait et on prend le signe du plus éloigné de zéro.",
      "Soustraire un nombre revient à ajouter son opposé : $a - b = a + (-b)$.",
      "Dans un repère, un point $M(x\\,;\\,y)$ : abscisse d'abord, ordonnée ensuite.",
    ],
    revisionSheet: {
      keyPoints: ["Positif : $\\geqslant 0$ ; strictement positif : $> 0$ (idem pour négatif).", "Opposé de $a$ : $-a$, avec $a + (-a) = 0$.", "Comparaison : le plus à gauche sur la droite graduée est le plus petit.", "$(-6) + (-9) = -15$ ; $6 + (-9) = -3$.", "$a - b = a + (-b)$ : $3 - (-2) = 5$.", "Variation = état final − état initial."],
      skills: ["Lire et placer un nombre relatif sur une droite graduée.", "Lire et placer un point dans un repère du plan.", "Comparer et ranger des décimaux relatifs.", "Additionner et soustraire des décimaux relatifs.", "Simplifier une écriture et calculer une suite d'additions et de soustractions.", "Résoudre un problème de températures, d'altitudes ou de soldes."],
    },
    miniQuiz: [
      { question: "Quel est le plus grand nombre ?", options: ["$-8$", "$-3$", "$-5{,}5$", "$-10$"], answer: 1, explanation: "Entre négatifs, le plus grand est le plus proche de $0$ : $-3$." },
      { question: "$(-4) + (-6) =$", options: ["$10$", "$-2$", "$-10$", "$2$"], answer: 2, explanation: "Même signe : $4 + 6 = 10$, on garde le signe $-$." },
      { question: "$3 + (-9) =$", options: ["$-6$", "$6$", "$-12$", "$12$"], answer: 0, explanation: "Signes contraires : $9 - 3 = 6$, signe de $-9$ (plus éloigné de $0$)." },
      { question: "$2 - (-5) =$", options: ["$-3$", "$3$", "$-7$", "$7$"], answer: 3, explanation: "On ajoute l'opposé : $2 + 5 = 7$." },
      { question: "Le nombre $0$ est…", options: ["strictement positif", "positif et négatif", "ni positif ni négatif", "strictement négatif"], answer: 1, explanation: "$0 \\geqslant 0$ et $0 \\leqslant 0$ : il est positif et négatif, mais pas « strictement »." },
      { question: "Si $a = -2{,}5$, alors $-a$ est égal à…", options: ["$-2{,}5$", "$2{,}5$", "$0$", "on ne peut pas savoir"], answer: 1, explanation: "$-a$ est l'opposé de $a$ : l'opposé de $-2{,}5$ est $2{,}5$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "rel5-jeu-droite", template: "droite-graduee", title: "Explorateur de la droite graduée",
      objective: "Placer et lire des nombres relatifs sur une droite graduée, avec des graduations de 1, 0,5 puis 0,2.",
      instructions: "Place le point demandé (clic, toucher ou flèches ← → puis Entrée) ou lis l'abscisse du point affiché. Trois réussites d'affilée font passer au niveau suivant.",
      objectives: ["M5-REL-06", "M5-REL-08"],
      config: { rounds: 10, levels: [{ min: -5, max: 5, step: 1 }, { min: -10, max: 10, step: 1 }, { min: -3, max: 3, step: 0.5 }, { min: -2, max: 2, step: 0.2 }] },
    },
    {
      id: "rel5-jeu-calcul", template: "calcul-mental", title: "Défi calcul : sommes et différences",
      objective: "Automatiser l'addition puis la soustraction de relatifs, avec un retour expliqué sur chaque erreur de signe.",
      instructions: "Calcule le plus de résultats possible en 90 secondes. On commence par des additions d'entiers ; les soustractions et les décimaux arrivent quand tu réussis.",
      objectives: ["M5-REL-09", "M5-REL-11"],
      config: { duration: 90, levels: [{ range: 10, ops: ["+"] }, { range: 10, ops: ["+", "-"] }, { range: 20, ops: ["+", "-"] }, { range: 5, ops: ["+", "-"], decimals: true }] },
    },
    {
      id: "rel5-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs",
      objective: "Repérer et nommer les erreurs typiques sur les relatifs (signes, soustractions, parenthèses, comparaisons).",
      instructions: "Pour chaque calcul, dis s'il est juste. S'il est faux, choisis l'erreur commise.",
      objectives: ["M5-REL-08", "M5-REL-09", "M5-REL-11", "M5-REL-12", "M5-REL-13"],
      config: { items: [
        { niveau: 1, calc: "$(-3) + (-4) = -7$", correct: true, explanation: "Même signe : $3 + 4 = 7$, signe $-$." },
        { niveau: 1, calc: "$(-3) + (-4) = 7$", correct: false, errors: ["Une somme de deux négatifs est négative", "Il fallait soustraire 3 et 4", "Le calcul est impossible"], error: 0, explanation: "$(-3) + (-4) = -7$ : deux baisses font encore baisser." },
        { niveau: 1, calc: "$-7 > -3$", correct: false, errors: ["Entre deux négatifs, le plus grand est le plus proche de 0", "Il faut comparer 7 et 3 sans les signes", "Un négatif est toujours plus grand qu'un positif"], error: 0, explanation: "$-7 < -3$ : $-3$ est plus proche de $0$." },
        { niveau: 2, calc: "$(-8) + 5 = -13$", correct: false, errors: ["Signes contraires : il fallait soustraire 8 et 5", "Le signe devrait être +", "Il fallait multiplier"], error: 0, explanation: "$(-8) + 5 = -3$." },
        { niveau: 2, calc: "$3 + (-8) = 5$", correct: false, errors: ["Le résultat prend le signe du nombre le plus éloigné de zéro", "Il fallait additionner 3 et 8", "Il fallait écrire $3 - 8 = 5$"], error: 0, explanation: "$3 + (-8) = -5$ : $-8$ est le plus éloigné de $0$." },
        { niveau: 2, calc: "$6 + (-6) = 0$", correct: true, explanation: "Deux nombres opposés ont une somme nulle." },
        { niveau: 3, calc: "$5 - (-3) = 2$", correct: false, errors: ["Soustraire $-3$, c'est ajouter $3$", "Il fallait changer le signe de 5", "Le résultat doit être négatif"], error: 0, explanation: "$5 - (-3) = 5 + 3 = 8$." },
        { niveau: 3, calc: "$-4 - 6 = -10$", correct: true, explanation: "$-4 - 6 = (-4) + (-6) = -10$." },
        { niveau: 3, calc: "$3 - 7 = 4$", correct: false, errors: ["On ne peut pas inverser l'ordre d'une soustraction : $3 - 7 = -4$", "Il fallait écrire $3 + 7$", "Le calcul est impossible"], error: 0, explanation: "$3 - 7 = 3 + (-7) = -4$." },
        { niveau: 4, calc: "$7 - (+3) - (-2) = 7 - 3 - 2$", correct: false, errors: ["$-(-2)$ devient $+2$", "$-(+3)$ devient $+3$", "On ne peut pas enlever les parenthèses"], error: 0, explanation: "$7 - (+3) - (-2) = 7 - 3 + 2 = 6$." },
        { niveau: 4, calc: "$-(2 + 3) = -2 + 3$", correct: false, errors: ["Le « − » devant la parenthèse s'applique à toute la somme : $-(2+3) = -5$", "Il faudrait écrire $-2 - 3 = 1$", "Les deux écritures sont égales"], error: 0, explanation: "$-(2+3) = -5$ alors que $-2 + 3 = 1$." },
        { niveau: 4, calc: "$(-5) + (-2) - (-5) = -2$", correct: true, explanation: "$-5 - 2 + 5$ : $-5$ et $+5$ s'annulent, il reste $-2$." },
      ] },
    },
    {
      id: "rel5-jeu-memory", template: "memory", title: "Memory des relatifs",
      objective: "Consolider le vocabulaire (opposé, valeur absolue, positif/négatif) et les calculs de référence.",
      instructions: "Retourne deux cartes : si elles vont ensemble (une notion ou un calcul et sa valeur), elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M5-REL-02", "M5-REL-03", "M5-REL-04", "M5-REL-09", "M5-REL-11"],
      config: { pairs: [
        ["Opposé de $-7$", "$7$"],
        ["Valeur absolue de $-4{,}5$", "$4{,}5$"],
        ["$(-3) + (-5)$", "$-8$"],
        ["$-2 - (-6)$", "$4$"],
        ["Seul nombre positif et négatif", "$0$"],
        ["$4 + (-9)$", "$-5$"],
      ] },
    },
  ],
  reviewStatus: { curriculum: "pending", accuracy: "pending", exercises: "pending", games: "pending", technical: "pending", language: "pending" },
  publicationStatus: "draft",
};
