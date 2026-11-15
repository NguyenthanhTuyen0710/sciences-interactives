// SCI-3E-MATH-009 — Mathématiques 3e : Ratios, pourcentages et évolutions.
// Programme du cycle 4 (version 2020, BO n° 31 du 30 juillet 2020) et repères annuels / attendus de fin de 3e
// (BO n° 22 du 29 mai 2019), applicables en 3e en 2026-2027. Contenu original rédigé à partir du dossier
// research/dossiers/math-3e-pourcentages-evolution.md.
// Hors programme 3e (non traité) : taux moyen, indices base 100, intérêts composés formalisés, suites géométriques.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, Rng } from "../../engine/types";
import { frFixed, roundTo, tex } from "../../engine/numbers";
import { sameValue } from "../../engine/diagnostics";

const T = (x: number) => tex(x);
/** Montant en euros avec deux décimales (LaTeX). */
const E = (x: number) => frFixed(x, 2).replace("−", "-").replace(",", "{,}").replace(/ /g, "\\,");
/** Pourcentage en LaTeX : 12{,}5\,\% */
const P = (x: number) => `${T(x)}\\,\\%`;
/** Taux signé en LaTeX : +12\,\% ou -7\,\% */
const S = (x: number) => (x > 0 ? `+${P(x)}` : P(x));
const r2 = (x: number) => roundTo(x, 2);
const r4 = (x: number) => roundTo(x, 4);

const num = (value: number, mistakes: Mistake[] = [], prompt?: string, decimals?: number, suffix?: string): ChapterPart => ({
  prompt,
  interaction: { kind: "numerique", ...(suffix ? { suffix } : {}), answer: { value, ...(decimals !== undefined ? { decimals } : {}) } },
  mistakes: mistakes.filter((m) => Number(m.match.replace(",", ".")) !== value),
});
/** Réponse arrondie : `dec` décimales, tolérance d'une demi-unité du dernier rang. */
const numR = (exact: number, dec: number, label: string, mistakes: Mistake[] = [], prompt?: string, suffix?: string): ChapterPart => {
  const value = roundTo(exact, dec);
  const tol = 0.5 * 10 ** -dec + 1e-9;
  return {
    prompt,
    interaction: { kind: "numerique", ...(suffix ? { suffix } : {}), answer: { value, tol, decimals: dec, roundingLabel: label } },
    mistakes: mistakes.filter((m) => Math.abs(Number(m.match) - value) > tol),
  };
};
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
/** Mélange des options en conservant la bonne réponse et les diagnostics (indices d'origine). */
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}
const m = (v: number, feedback: string): Mistake => ({ match: String(v), feedback });
/** Retire les diagnostics de même valeur : la réponse ne permet pas de savoir quelle erreur a été commise. */
const distinct = (ms: Mistake[]): Mistake[] => ms.filter((x) => !ms.some((y) => y !== x && sameValue(x.match, y.match)));
/** « = x » si la valeur est exacte à `dec` décimales, sinon « ≈ x » (LaTeX). */
const approx = (x: number, dec: number, fmt: (v: number) => string = T) => (roundTo(x, 6) === roundTo(x, dec) ? "=" : "\\approx") + " " + fmt(roundTo(x, dec));

const ADD_ERR = "Les pourcentages successifs **ne s'additionnent pas** : chaque évolution s'applique à la valeur obtenue juste avant, donc on **multiplie** les coefficients.";

const O = {
  "M6-NC-24": "Connaître la définition d'un pourcentage et son sens.",
  "M6-NC-25": "Calculer une proportion (partie/tout) et l'exprimer en pourcentage dans des cas simples.",
  "M4-AUTO-03": "Procédures de calcul d'une quatrième proportionnelle et d'application d'un pourcentage ou d'une échelle.",
  "M4-OGDF-08": "Calculer une quatrième proportionnelle par la procédure de son choix.",
  "M4-OGDF-10": "Partager une quantité selon un ratio donné (a : b).",
  "M3-OGDF-13": "Relier un taux d'évolution et un coefficient multiplicateur (hausse de 5 % ↔ ×1,05).",
  "M3-OGDF-13#B": "(Déclinaison interne de M3-OGDF-13) Utiliser le coefficient multiplicateur pour calculer une valeur finale ou retrouver une valeur initiale.",
  "M3-OGDF-13#C": "(Déclinaison interne de M3-OGDF-13) Déterminer un taux d'évolution à partir d'une valeur initiale et d'une valeur finale.",
  "M3-OGDF-13#D": "(Déclinaison interne de M3-OGDF-13) Enchaîner des évolutions successives en multipliant les coefficients multiplicateurs.",
} as const;
type Obj = keyof typeof O;
const SRC_3E = "Repères annuels de progression du cycle 4 (BO n° 22 du 29 mai 2019), 3e, « Proportionnalité » ; attendus de fin de 3e (2019) ; programme du cycle 4 (BO n° 31 du 30 juillet 2020), thème B";
const SRC_DECL = `${SRC_3E} — déclinaison interne de M3-OGDF-13 (identifiant absent de l'inventaire)`;
const SRC_4E_08 = "Repères annuels de progression du cycle 4 (BO n° 22 du 29 mai 2019), 4e, « Proportionnalité » ; attendus de fin de 4e (2019) — objectif de 4e consolidé en 3e";
const SRC_AUTO = "Programme du cycle 4 (BO n° 31 du 30 juillet 2020), thème B, automatismes — objectif de 4e consolidé en 3e";
const SRC_6E = "Programme du cycle 3 (BO n° 16 du 17 avril 2025), sixième, « Les fractions – Pourcentages » — prérequis consolidé en 3e";
const SRC_4E_10 = "Programme du cycle 4 (BO n° 31 du 30 juillet 2020), thème B, « Résoudre des problèmes de proportionnalité » (notion de ratio) — objectif de 4e consolidé en 3e";

// ───────────────────────── Exercices ─────────────────────────
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "pct3-01", title: "Pourcentages et fractions", niveau: 1, objectives: ["M6-NC-24"], time: 60,
    statement: "Associe chaque pourcentage à la fraction qui lui est égale.",
    parts: [{ interaction: { kind: "associer", left: ["$50\\,\\%$", "$25\\,\\%$", "$10\\,\\%$", "$75\\,\\%$", "$20\\,\\%$"], right: ["$\\dfrac{1}{4}$", "$\\dfrac{1}{5}$", "$\\dfrac{3}{4}$", "$\\dfrac{1}{2}$", "$\\dfrac{1}{10}$"], answer: [3, 0, 4, 2, 1] } }],
    solution: ["$t\\,\\%$ signifie « $t$ pour cent » : $t\\,\\% = \\dfrac{t}{100}$.", "$50\\,\\% = \\dfrac{50}{100} = \\dfrac{1}{2}$ ; $25\\,\\% = \\dfrac{25}{100} = \\dfrac{1}{4}$ ; $10\\,\\% = \\dfrac{1}{10}$.", "$75\\,\\% = \\dfrac{75}{100} = \\dfrac{3}{4}$ ; $20\\,\\% = \\dfrac{20}{100} = \\dfrac{1}{5}$."],
    reasoning: "Un pourcentage est une fraction de dénominateur 100 ; on la simplifie pour reconnaître les fractions usuelles.",
    hints: ["Écris chaque pourcentage sous la forme $\\dfrac{t}{100}$.", "Simplifie la fraction obtenue."],
  }),
  ex({
    id: "pct3-02", title: "Appliquer un pourcentage", niveau: 1, objectives: ["M4-AUTO-03"], time: 60,
    vary: (rng) => {
      const p = rng.pick([10, 20, 25, 50, 75]);
      const n = rng.int(2, 30) * 20;
      const res = (n * p) / 100;
      return {
        statement: `Un collège compte $${T(n)}$ élèves. $${P(p)}$ d'entre eux mangent à la cantine. Combien d'élèves mangent à la cantine ?`,
        parts: [num(res, [m(n * p, "Tu as oublié de diviser par 100 : $t\\,\\%$ de $N$, c'est $\\dfrac{t}{100} \\times N$."), m(n - res, "Tu as calculé le nombre d'élèves qui **ne** mangent **pas** à la cantine.")])],
        solution: [`$${P(p)}$ de $${T(n)}$, c'est $\\dfrac{${p}}{100} \\times ${T(n)}$.`, `$\\dfrac{${p}}{100} \\times ${T(n)} = ${T(res)}$.`, `$${T(res)}$ élèves mangent à la cantine.`],
      };
    },
    reasoning: "Prendre $t\\,\\%$ d'une quantité, c'est la multiplier par $\\dfrac{t}{100}$.",
    hints: ["« $t\\,\\%$ de » se traduit par « $\\dfrac{t}{100} \\times$ ».", "Commence par calculer $1\\,\\%$ ou $10\\,\\%$ du total si tu préfères le calcul mental."],
  }),
  ex({
    id: "pct3-03", title: "Hausse ou baisse ?", niveau: 1, objectives: ["M3-OGDF-13"], time: 75,
    vary: (rng) => {
      const up = rng.shuffle([1.05, 1.2, 1.5, 2, 1.12, 1.003, 1.35]).slice(0, 3);
      const down = rng.shuffle([0.8, 0.95, 0.5, 0.97, 0.6, 0.25, 0.99]).slice(0, 3);
      const all = rng.shuffle([...up.map((c) => [c, 0]), ...down.map((c) => [c, 1]), [1, 2]]);
      return {
        statement: "On multiplie un prix par chacun des coefficients ci-dessous. Classe chaque coefficient selon l'effet produit sur le prix.",
        parts: [{ interaction: { kind: "classer", categories: ["Hausse", "Baisse", "Ni hausse ni baisse"], items: all.map(([c]) => `$\\times ${T(c)}$`), answer: all.map(([, k]) => k) } }],
        solution: ["Multiplier par un nombre **supérieur à 1** fait augmenter le prix : hausse.", "Multiplier par un nombre **compris entre 0 et 1** fait diminuer le prix : baisse.", "Multiplier par $1$ ne change rien.", `Hausses : ${up.map((c) => `$\\times ${T(c)}$`).join(", ")}. Baisses : ${down.map((c) => `$\\times ${T(c)}$`).join(", ")}.`],
      };
    },
    reasoning: "Le coefficient multiplicateur se compare à 1 : au-dessus, la grandeur augmente ; entre 0 et 1, elle diminue.",
    hints: ["Compare chaque coefficient à $1$.", "Teste avec un prix de $100$ € : que devient-il ?"],
  }),
  ex({
    id: "pct3-04", title: "Coefficient d'une hausse", niveau: 1, objectives: ["M3-OGDF-13"], time: 45,
    vary: (rng) => {
      let t = 50;
      while (t === 50 || t === 10) t = rng.int(2, 45);
      const c = (100 + t) / 100;
      return {
        statement: `Un loyer augmente de $${P(t)}$. Par quel nombre est-il multiplié ?`,
        parts: [shuffledQcm(rng, [`$${T(c)}$`, `$${T(t / 100)}$`, `$${T((100 - t) / 100)}$`, `$${T(1 + t / 10)}$`], 0, {
          1: `$${T(t / 100)}$ donne seulement le **montant de la hausse** ; il faut lui ajouter le loyer lui-même ($100\\,\\%$).`,
          2: "Ce coefficient correspond à une **baisse** : il est inférieur à $1$.",
          3: `$${P(t)} = \\dfrac{${t}}{100}$, et non $\\dfrac{${t}}{10}$.`,
        })],
        solution: [`Nouveau loyer $=$ loyer $+$ $${P(t)}$ du loyer $= (100\\,\\% + ${P(t)})$ du loyer.`, `$${100 + t}\\,\\% = \\dfrac{${100 + t}}{100} = ${T(c)}$.`, `Le loyer est multiplié par $${T(c)}$.`],
      };
    },
    reasoning: "Augmenter de $t\\,\\%$, c'est garder $100\\,\\%$ et ajouter $t\\,\\%$ : on multiplie par $1 + \\dfrac{t}{100}$.",
    hints: ["Après la hausse, le loyer représente combien de pour cent de l'ancien loyer ?", "$100\\,\\% + t\\,\\%$, puis écris ce pourcentage sous forme décimale."],
  }),
  ex({
    id: "pct3-05", title: "Lire un ratio", niveau: 1, objectives: ["M4-OGDF-10"], time: 60,
    vary: (rng) => {
      const [x, y] = rng.pick([[2, 3], [3, 2], [1, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [1, 3]]);
      const k = rng.int(2, 6);
      return {
        statement: `Un sac contient $${k * x}$ billes rouges et $${k * y}$ billes bleues. Écris le ratio « rouges : bleues » avec les plus petits nombres entiers possibles.`,
        parts: [{ interaction: { kind: "texte-trous", template: "rouges : bleues $=$ [[0]] $:$ [[1]]", blanks: [{ type: "number", answer: { value: x } }, { type: "number", answer: { value: y } }] } }],
        solution: [`Le ratio est d'abord $${k * x} : ${k * y}$ (dans cet ordre : rouges, puis bleues).`, `On divise les deux nombres par $${k}$ : $${k * x} \\div ${k} = ${x}$ et $${k * y} \\div ${k} = ${y}$.`, `Ratio simplifié : $${x} : ${y}$ — pour $${x}$ billes rouges, il y a $${y}$ billes bleues.`],
      };
    },
    reasoning: "Comme une fraction, un ratio se simplifie en divisant tous ses termes par un même nombre ; l'ordre des termes suit l'ordre des mots.",
    hints: ["Écris d'abord le ratio avec les nombres de l'énoncé, dans l'ordre demandé.", "Cherche un diviseur commun aux deux nombres."],
  }),
  ex({
    id: "pct3-06", title: "Vrai ou faux ?", niveau: 1, objectives: ["M3-OGDF-13", "M4-AUTO-03"], time: 120,
    statement: "Pour chaque affirmation, indique si elle est vraie ou fausse.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["Augmenter un prix de $100\\,\\%$, c'est le doubler.", "Baisser un prix de $50\\,\\%$, c'est le diviser par $2$.", "Augmenter un prix de $20\\,\\%$, c'est le multiplier par $0{,}2$.", "$25\\,\\%$ de $80$ est égal à $80\\,\\%$ de $25$.", "Baisser un prix de $10\\,\\%$, c'est le multiplier par $0{,}1$."], answer: [true, true, false, true, false] } }],
    solution: ["Hausse de $100\\,\\%$ : coefficient $1 + 1 = 2$ : on double. **Vrai**.", "Baisse de $50\\,\\%$ : coefficient $0{,}5$, c'est diviser par $2$. **Vrai**.", "Hausse de $20\\,\\%$ : coefficient $1{,}2$ (et non $0{,}2$). **Faux**.", "$0{,}25 \\times 80 = 20$ et $0{,}8 \\times 25 = 20$. **Vrai** : la multiplication est commutative.", "Baisse de $10\\,\\%$ : coefficient $1 - 0{,}1 = 0{,}9$. **Faux**."],
    reasoning: "Hausse de $t\\,\\%$ : $\\times\\left(1 + \\dfrac{t}{100}\\right)$ ; baisse de $t\\,\\%$ : $\\times\\left(1 - \\dfrac{t}{100}\\right)$.",
    hints: ["Teste chaque affirmation avec un prix de $100$ €.", "$t\\,\\%$ de $a$ $= \\dfrac{t}{100} \\times a$."],
  }),

  // ── Niveau 2 : Application directe ──
  ex({
    id: "pct3-07", title: "Calculer une proportion en pourcentage", niveau: 2, objectives: ["M6-NC-25"], time: 75,
    vary: (rng) => {
      const n = rng.pick([20, 25, 40, 50]);
      const k = rng.int(3, n - 3);
      const p = roundTo((k * 100) / n, 2);
      return {
        statement: `Dans une classe de $${n}$ élèves, $${k}$ pratiquent un sport en club. Quel pourcentage des élèves de la classe cela représente-t-il ?`,
        parts: [num(p, distinct([m(k, "$" + k + "$ est un effectif, pas un pourcentage : il faut le comparer à l'effectif total."), m(roundTo(((n - k) * 100) / n, 2), "Tu as calculé le pourcentage des élèves qui **ne** pratiquent **pas** de sport en club.")]), "Pourcentage (en %) :", undefined, "%")],
        solution: [`Proportion : $\\dfrac{${k}}{${n}}$.`, `$\\dfrac{${k}}{${n}} = ${T(k / n)} = \\dfrac{${T(p)}}{100}$.`, `Cela représente $${P(p)}$ des élèves.`],
      };
    },
    reasoning: "Un pourcentage de répartition est une proportion (partie / total) écrite avec un dénominateur 100.",
    hints: ["Écris la fraction « partie / total ».", "Multiplie cette fraction par $100$ pour obtenir le pourcentage."],
  }),
  ex({
    id: "pct3-08", title: "Du coefficient au taux, et inversement", niveau: 2, objectives: ["M3-OGDF-13"], time: 90,
    vary: (rng) => {
      const t = rng.int(2, 45);
      const up = rng.next() < 0.5;
      const c = (100 + (up ? t : -t)) / 100;
      const u = rng.int(3, 60);
      return {
        statement: "Complète les phrases.",
        parts: [{ interaction: { kind: "texte-trous", template: `Multiplier par $${T(c)}$ revient à une [[0]] de [[1]] $\\%$.\nUne baisse de $${P(u)}$ revient à multiplier par [[2]].`, blanks: [{ type: "select", options: ["hausse", "baisse"], answer: up ? 0 : 1 }, { type: "number", answer: { value: t } }, { type: "number", answer: { value: (100 - u) / 100 } }] } }],
        solution: [`$${T(c)} ${up ? ">" : "<"} 1$ : c'est une ${up ? "hausse" : "baisse"}.`, `$${T(c)} = 1 ${up ? "+" : "-"} ${T(t / 100)} = 1 ${up ? "+" : "-"} \\dfrac{${t}}{100}$ : ${up ? "hausse" : "baisse"} de $${P(t)}$.`, `Baisse de $${P(u)}$ : $1 - \\dfrac{${u}}{100} = ${T((100 - u) / 100)}$.`],
      };
    },
    reasoning: "Le coefficient multiplicateur et le taux sont liés par $CM = 1 + \\dfrac{t}{100}$ (hausse) ou $CM = 1 - \\dfrac{t}{100}$ (baisse).",
    hints: ["Compare le coefficient à $1$ pour savoir si c'est une hausse ou une baisse.", "L'écart entre le coefficient et $1$, multiplié par $100$, donne le taux."],
  }),
  ex({
    id: "pct3-09", title: "Prix après une hausse", niveau: 2, objectives: ["M3-OGDF-13#B"], time: 75,
    vary: (rng) => {
      const [obj, lo, hi] = rng.pick([["Un vélo", 150, 900], ["Un abonnement annuel", 20, 400], ["Une console", 200, 600], ["Un billet de train", 15, 150]] as const);
      const p0 = rng.int(lo, hi);
      const t = rng.int(3, 30);
      const p1 = r2((p0 * (100 + t)) / 100);
      return {
        statement: `${obj} coûtait $${T(p0)}$ €. Son prix augmente de $${P(t)}$. Quel est son nouveau prix (en €) ?`,
        parts: [num(p1, [m(p0 + t, `Tu as ajouté $${t}$ euros, pas $${P(t)}$ du prix.`), m(r2((p0 * t) / 100), "Tu as calculé le **montant** de la hausse ; il faut l'ajouter au prix initial."), m(r2((p0 * (100 - t)) / 100), "Tu as appliqué une **baisse**.")], undefined, 2, "€")],
        solution: [`Coefficient multiplicateur : $1 + \\dfrac{${t}}{100} = ${T((100 + t) / 100)}$.`, `$${T(p0)} \\times ${T((100 + t) / 100)} = ${E(p1)}$.`, `Le nouveau prix est $${E(p1)}$ €.`],
      };
    },
    reasoning: "Une hausse de $t\\,\\%$ se calcule en une seule multiplication par $1 + \\dfrac{t}{100}$.",
    hints: ["Quel est le coefficient multiplicateur d'une hausse de $t\\,\\%$ ?", "Multiplie l'ancien prix par ce coefficient."],
  }),
  ex({
    id: "pct3-10", title: "Prix soldé", niveau: 2, objectives: ["M3-OGDF-13#B"], time: 75,
    vary: (rng) => {
      const p0 = rng.int(12, 300);
      const t = rng.pick([10, 15, 20, 25, 30, 35, 40, 50, 60, 70]);
      const p1 = r2((p0 * (100 - t)) / 100);
      return {
        statement: `Pendant les soldes, une veste à $${T(p0)}$ € est affichée à $-${P(t)}$. Quel est son prix soldé (en €) ?`,
        parts: [num(p1, distinct([m(p0 - t, `Tu as retiré $${t}$ euros, pas $${P(t)}$ du prix.`), m(r2((p0 * t) / 100), "Tu as calculé le **montant de la réduction** ; il faut le retirer du prix initial."), m(r2((p0 * (100 + t)) / 100), "Tu as appliqué une **hausse** au lieu d'une baisse.")]), undefined, 2, "€")],
        solution: [`Coefficient multiplicateur : $1 - \\dfrac{${t}}{100} = ${T((100 - t) / 100)}$.`, `$${T(p0)} \\times ${T((100 - t) / 100)} = ${E(p1)}$.`, `Le prix soldé est $${E(p1)}$ €.`],
      };
    },
    reasoning: "Après une baisse de $t\\,\\%$, il reste $(100 - t)\\,\\%$ du prix : on multiplie par $1 - \\dfrac{t}{100}$.",
    hints: ["Quel pourcentage du prix reste-t-il à payer ?", "Écris ce pourcentage sous forme décimale et multiplie."],
  }),
  ex({
    id: "pct3-11", title: "Partager selon un ratio", niveau: 2, objectives: ["M4-OGDF-10"], time: 90,
    vary: (rng) => {
      const [a, b] = rng.pick([[2, 3], [3, 2], [1, 4], [3, 5], [5, 3], [2, 7], [4, 5], [3, 7]]);
      const k = rng.int(3, 25) * 5;
      const s = k * (a + b);
      return {
        statement: `Léa et Tom se partagent un gain de $${T(s)}$ € selon le ratio $${a} : ${b}$ (Léa : Tom). Quelle somme reçoit chacun ?`,
        parts: [{ interaction: { kind: "texte-trous", template: "Léa reçoit [[0]] € et Tom reçoit [[1]] €.", blanks: [{ type: "number", answer: { value: a * k } }, { type: "number", answer: { value: b * k } }] } }],
        solution: [`Le ratio $${a} : ${b}$ partage la somme en $${a} + ${b} = ${a + b}$ parts égales.`, `Une part vaut $${T(s)} \\div ${a + b} = ${T(k)}$ €.`, `Léa : $${a} \\times ${T(k)} = ${T(a * k)}$ € ; Tom : $${b} \\times ${T(k)} = ${T(b * k)}$ €.`, `Vérification : $${T(a * k)} + ${T(b * k)} = ${T(s)}$ €.`],
      };
    },
    reasoning: "Partager selon le ratio $a : b$, c'est partager en $a + b$ parts égales : l'un reçoit $a$ parts, l'autre $b$ parts.",
    hints: ["Combien y a-t-il de parts en tout ?", "Calcule la valeur d'une part, puis multiplie."],
  }),
  ex({
    id: "pct3-12", title: "Tableau des évolutions", niveau: 2, objectives: ["M3-OGDF-13"], time: 150,
    vary: (rng) => {
      const [t1, t2, t3, t4] = rng.shuffle([4, 6, 8, 12, 15, 18, 22, 30, 35, 45]).slice(0, 4);
      return {
        statement: "Complète le tableau. Le taux d'évolution est positif pour une hausse et négatif pour une baisse.",
        parts: [{ interaction: { kind: "tableau", headers: ["Situation", "Coefficient multiplicateur", "Taux d'évolution (en %)"], rows: [
          { label: "A", cells: [{ answer: { value: (100 + t1) / 100 } }, `$${S(t1)}$`] },
          { label: "B", cells: [{ answer: { value: (100 - t2) / 100 } }, `$${S(-t2)}$`] },
          { label: "C", cells: [`$${T((100 + t3) / 100)}$`, { answer: { value: t3 } }] },
          { label: "D", cells: [`$${T((100 - t4) / 100)}$`, { answer: { value: -t4 } }] },
        ] } }],
        solution: [`A : $1 + ${T(t1 / 100)} = ${T((100 + t1) / 100)}$.`, `B : $1 - ${T(t2 / 100)} = ${T((100 - t2) / 100)}$.`, `C : $${T((100 + t3) / 100)} - 1 = ${T(t3 / 100)}$, soit une hausse de $${P(t3)}$ : taux $${S(t3)}$.`, `D : $${T((100 - t4) / 100)} - 1 = ${T(-t4 / 100)}$, soit une baisse de $${P(t4)}$ : taux $${S(-t4)}$.`],
      };
    },
    reasoning: "Taux d'évolution (en %) $= (CM - 1) \\times 100$ ; réciproquement $CM = 1 + \\dfrac{\\text{taux}}{100}$, le taux étant négatif pour une baisse.",
    hints: ["Pour passer du taux au coefficient : $1 + \\dfrac{\\text{taux}}{100}$.", "Pour passer du coefficient au taux : $(CM - 1) \\times 100$ ; un résultat négatif signale une baisse."],
  }),
  ex({
    id: "pct3-13", title: "Quatrième proportionnelle", niveau: 2, objectives: ["M4-OGDF-08"], time: 75,
    vary: (rng) => {
      const u = rng.int(120, 480) / 100;
      const q1 = rng.pick([2, 3, 4, 5]);
      let q2 = q1;
      while (q2 === q1) q2 = rng.pick([1, 3, 6, 7, 8, 9]);
      const p1 = r2(u * q1);
      const p2 = r2(u * q2);
      const fruit = rng.pick(["pommes", "tomates", "poires", "carottes"]);
      return {
        statement: `$${q1}$ kg de ${fruit} coûtent $${E(p1)}$ €. Le prix est proportionnel à la masse. Combien coûtent $${q2}$ kg de ${fruit} (en €) ?`,
        parts: [num(p2, [m(r2(p1 * q2), "Tu as multiplié le prix de $" + q1 + "$ kg par $" + q2 + "$ : il faut d'abord trouver le prix d'**un** kilogramme."), m(r2(p1 + q2 - q1), "Le prix n'augmente pas d'un euro par kilogramme : utilise la proportionnalité.")], undefined, 2, "€")],
        solution: [`Prix d'un kilogramme : $${E(p1)} \\div ${q1} = ${E(u)}$ €.`, `Prix de $${q2}$ kg : $${q2} \\times ${E(u)} = ${E(p2)}$ €.`, `Autre méthode (produit en croix) : $\\dfrac{${E(p1)} \\times ${q2}}{${q1}} = ${E(p2)}$.`],
      };
    },
    reasoning: "Dans une situation de proportionnalité, on peut passer par l'unité (prix d'un kilogramme) ou utiliser le produit en croix.",
    hints: ["Combien coûte un seul kilogramme ?", "Multiplie ce prix unitaire par la nouvelle masse."],
  }),

  // ── Niveau 3 : Entraînement ──
  ex({
    id: "pct3-14", title: "Retrouver le prix avant une hausse", niveau: 3, objectives: ["M3-OGDF-13#B"], time: 90,
    vary: (rng) => {
      const p0 = rng.int(150, 1200);
      const t = rng.pick([4, 5, 8, 10, 12, 15, 20, 25]);
      const c = (100 + t) / 100;
      const p1 = r2(p0 * c);
      return {
        statement: `Après une hausse de $${P(t)}$, un téléviseur coûte $${E(p1)}$ €. Quel était son prix avant la hausse (en €) ?`,
        parts: [num(p0, [m(r2((p1 * (100 - t)) / 100), `Retirer $${P(t)}$ du **nouveau** prix ne ramène pas à l'ancien : les $${P(t)}$ ont été calculés sur l'ancien prix. Il faut **diviser** par le coefficient.`), m(r2(p1 - t), "Ce sont des pourcentages, pas des euros.")], undefined, 2, "€")],
        solution: [`On a : ancien prix $\\times ${T(c)} = ${E(p1)}$.`, `Donc ancien prix $= ${E(p1)} \\div ${T(c)} = ${T(p0)}$.`, `Vérification : $${T(p0)} \\times ${T(c)} = ${E(p1)}$. L'ancien prix était $${T(p0)}$ €.`],
      };
    },
    reasoning: "Pour remonter le temps, on fait l'opération inverse : valeur initiale $=$ valeur finale $\\div$ coefficient multiplicateur.",
    hints: ["Écris l'égalité : ancien prix $\\times$ coefficient $=$ nouveau prix.", "Quelle opération permet de retrouver le facteur inconnu d'un produit ?"],
  }),
  ex({
    id: "pct3-15", title: "Le prix avant la remise", niveau: 3, objectives: ["M3-OGDF-13#B", "M3-OGDF-13"], time: 90,
    vary: (rng) => {
      const p0 = rng.int(10, 250);
      const t = rng.pick([10, 15, 20, 25, 30, 35, 40, 60]);
      const c = (100 - t) / 100;
      const p1 = r2(p0 * c);
      return {
        statement: `Grâce à une remise de $${P(t)}$, Inès paie un casque $${E(p1)}$ €. Retrouve le prix du casque avant la remise.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Coefficient multiplicateur de la remise", answer: { value: c } }, { prompt: "Prix avant la remise (en €)", answer: { value: p0 }, suffix: "€" }] } }],
        solution: [`Remise de $${P(t)}$ : coefficient $1 - ${T(t / 100)} = ${T(c)}$.`, `Prix initial $\\times ${T(c)} = ${E(p1)}$, donc prix initial $= ${E(p1)} \\div ${T(c)} = ${T(p0)}$ €.`, `Attention : $${E(p1)} \\times ${T((100 + t) / 100)} = ${E(r2(p1 * (100 + t) / 100))}$ ne redonne pas le bon prix.`],
      };
    },
    reasoning: "La remise est calculée sur le prix initial : on divise le prix payé par le coefficient de la remise.",
    hints: ["Quel pourcentage du prix initial Inès a-t-elle payé ?", "Prix initial $=$ prix payé $\\div$ coefficient."],
  }),
  ex({
    id: "pct3-16", title: "Calculer un taux d'évolution", niveau: 3, objectives: ["M3-OGDF-13#C"], time: 90,
    vary: (rng) => {
      const v1 = rng.int(3, 90) * 100;
      let t = 0;
      while (t === 0) t = rng.int(-40, 60);
      const v2 = (v1 * (100 + t)) / 100;
      return {
        statement: `Le nombre d'abonnés d'une chaîne passe de $${T(v1)}$ à $${T(v2)}$ en un an. Décris cette évolution.`,
        parts: [{ interaction: { kind: "texte-trous", template: "Il s'agit d'une [[0]] de [[1]] $\\%$.", blanks: [{ type: "select", options: ["hausse", "baisse"], answer: t > 0 ? 0 : 1 }, { type: "number", answer: { value: Math.abs(t) } }] } }],
        solution: [`Coefficient multiplicateur : $\\dfrac{${T(v2)}}{${T(v1)}} = ${T(v2 / v1)}$.`, `$${T(v2 / v1)} - 1 = ${T(t / 100)}$, soit $${S(t)}$.`, `Autre calcul : $\\dfrac{${T(v2)} - ${T(v1)}}{${T(v1)}} \\times 100 = ${T(t)}$.`, `C'est une ${t > 0 ? "hausse" : "baisse"} de $${P(Math.abs(t))}$.`],
      };
    },
    reasoning: "Taux d'évolution $= \\dfrac{\\text{valeur finale} - \\text{valeur initiale}}{\\text{valeur initiale}} \\times 100$ : on divise toujours par la valeur de **départ**.",
    hints: ["Calcule d'abord la variation : valeur finale $-$ valeur initiale.", "Divise cette variation par la valeur **initiale**, puis multiplie par $100$."],
  }),
  ex({
    id: "pct3-17", title: "Évolution d'une population", niveau: 3, objectives: ["M3-OGDF-13#C"], time: 120,
    vary: (rng) => {
      const v1 = rng.int(1200, 25000);
      let v2 = v1;
      const halfway = (x: number) => Math.abs(Math.abs(x * 10) % 1 - 0.5) < 1e-6;
      while (Math.abs(v2 - v1) / v1 < 0.01 || halfway(((v2 - v1) / v1) * 100)) v2 = Math.round(v1 * rng.int(80, 130) / 100 + rng.int(-40, 40));
      const t = ((v2 - v1) / v1) * 100;
      const t1 = frFixed(roundTo(t, 1), 1).replace("−", "-").replace(",", "{,}");
      const town = rng.pick(["Saint-Aubin", "Montverde", "Lacroix", "Beaulieu"]);
      return {
        statement: `La population de ${town} est passée de $${T(v1)}$ habitants en 2015 à $${T(v2)}$ habitants en 2025. Calcule le taux d'évolution de la population, en %, arrondi au dixième (négatif s'il s'agit d'une baisse).`,
        parts: [numR(t, 1, "au dixième", [m(roundTo(((v2 - v1) / v2) * 100, 1), "Tu as divisé par la population de 2025 : on divise par la valeur **initiale** (2015)."), m(roundTo((v2 / v1) * 100, 1), "Ce nombre est le pourcentage que représente la population de 2025 par rapport à celle de 2015 ; retire $100$ pour obtenir le taux d'évolution."), m(v2 - v1, "C'est la variation en nombre d'habitants, pas en pourcentage.")], "Taux d'évolution (en %) :", "%")],
        solution: [`Variation : $${T(v2)} - ${T(v1)} = ${T(v2 - v1)}$ habitants.`, `Taux : $\\dfrac{${T(v2 - v1)}}{${T(v1)}} \\times 100 ${approx(t, 3)}$.`, `Arrondi au dixième : $${t > 0 ? "+" : ""}${t1}\\,\\%$.`],
      };
    },
    reasoning: "On compare la variation à la valeur de départ ; l'arrondi se fait seulement à la fin.",
    hints: ["Quelle est la valeur initiale ? la valeur finale ?", "Taux $= \\dfrac{\\text{finale} - \\text{initiale}}{\\text{initiale}} \\times 100$."],
  }),
  ex({
    id: "pct3-18", title: "Deux évolutions successives", niveau: 3, objectives: ["M3-OGDF-13#D", "M3-OGDF-13"], time: 150,
    vary: (rng) => {
      const t1 = rng.int(2, 30);
      const t2 = rng.int(2, 30) * (rng.next() < 0.5 ? 1 : -1);
      const k = (100 + t1) * (100 + t2);
      const g = (k - 10000) / 100;
      return {
        statement: `Un prix augmente de $${P(t1)}$, puis ${t2 > 0 ? "augmente" : "baisse"} de $${P(Math.abs(t2))}$. Complète les étapes du calcul de l'évolution globale.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Coefficient multiplicateur de la 1re évolution", answer: { value: (100 + t1) / 100 } },
          { prompt: "Coefficient multiplicateur de la 2e évolution", answer: { value: (100 + t2) / 100 } },
          { prompt: "Coefficient multiplicateur global", answer: { value: k / 10000 } },
          { prompt: "Taux d'évolution global (en %, négatif pour une baisse)", answer: { value: g }, suffix: "%" },
        ] } }],
        solution: [`1re évolution : $\\times ${T((100 + t1) / 100)}$ ; 2e évolution : $\\times ${T((100 + t2) / 100)}$.`, `Coefficient global : $${T((100 + t1) / 100)} \\times ${T((100 + t2) / 100)} = ${T(k / 10000)}$.`, `Taux global : $(${T(k / 10000)} - 1) \\times 100 = ${T(g)}$, soit $${S(g)}$.`, `Ce n'est pas $${S(t1 + t2)}$ : ${ADD_ERR}`],
      };
    },
    reasoning: "Deux évolutions successives correspondent à deux multiplications : le coefficient global est le produit des coefficients.",
    hints: ["Écris le coefficient de chaque évolution.", "Le prix est multiplié par le premier coefficient, **puis** par le second."],
  }),
  ex({
    id: "pct3-19", title: "Ratio, fraction et pourcentage", niveau: 3, objectives: ["M4-OGDF-10", "M6-NC-25"], time: 90,
    vary: (rng) => {
      const [a, b] = rng.pick([[1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [4, 1], [3, 7], [7, 3], [1, 9], [9, 11], [7, 13], [3, 17], [6, 19], [12, 13], [4, 21]]);
      const n = a + b;
      return {
        statement: `Dans un club, le ratio filles : garçons est $${a} : ${b}$.`,
        parts: [{ interaction: { kind: "texte-trous", template: "La fraction des membres qui sont des filles est [[0]] (fraction irréductible ou écriture décimale exacte).\nLes filles représentent [[1]] $\\%$ des membres.", blanks: [{ type: "number", answer: { value: a / n, fraction: [a, n] } }, { type: "number", answer: { value: (a * 100) / n } }] } }],
        solution: [`Sur $${a} + ${b} = ${n}$ membres, $${a}$ sont des filles : fraction $\\dfrac{${a}}{${n}}$ (et non $\\dfrac{${a}}{${b}}$).`, `$\\dfrac{${a}}{${n}} = ${T(a / n)} = ${P((a * 100) / n)}$.`],
      };
    },
    reasoning: "Un ratio $a : b$ compare deux parts entre elles ; la fraction d'une part se calcule par rapport au total $a + b$.",
    hints: ["Combien de membres y a-t-il dans un « groupe » qui respecte exactement le ratio ?", "La fraction de filles est « filles / total », pas « filles / garçons »."],
  }),
  ex({
    id: "pct3-20", title: "Hors taxes et toutes taxes comprises", niveau: 3, objectives: ["M3-OGDF-13#B", "M3-OGDF-13"], time: 120,
    vary: (rng) => {
      const ht = rng.int(15, 900);
      const ttc = r2(ht * 1.2);
      const ht2 = rng.int(2, 40) + rng.pick([0, 0.2, 0.4, 0.5, 0.8]);
      const ttc2 = ht2 * 1.055;
      return {
        statement: `La TVA est une taxe ajoutée au prix hors taxes (HT) pour obtenir le prix toutes taxes comprises (TTC). Elle est de $20\\,\\%$ pour un aspirateur et de $5{,}5\\,\\%$ pour les produits alimentaires.`,
        parts: [
          num(ttc, [m(ht + 20, "La TVA est de $20\\,\\%$ du prix, pas de $20$ €."), m(r2(ht * 0.2), "C'est le montant de la TVA ; il faut l'ajouter au prix HT.")], `Un aspirateur coûte $${T(ht)}$ € HT. Son prix TTC (en €) :`, 2, "€"),
          numR(ttc2, 2, "au centime", distinct([m(r2(ht2 * 1.55), "$5{,}5\\,\\% = 0{,}055$ : le coefficient est $1{,}055$, et non $1{,}55$."), m(r2(ht2 + 5.5), "La TVA est de $5{,}5\\,\\%$ du prix, pas de $5{,}5$ €.")]), `Un panier de courses coûte $${E(ht2)}$ € HT. Son prix TTC (en €, arrondi au centime) :`, "€"),
        ],
        solution: [`Aspirateur : coefficient $1 + 0{,}2 = 1{,}2$ ; $${T(ht)} \\times 1{,}2 = ${E(ttc)}$ €.`, `Courses : coefficient $1 + 0{,}055 = 1{,}055$ ; $${E(ht2)} \\times 1{,}055 ${roundTo(ttc2, 6) === roundTo(ttc2, 2) ? `= ${E(ttc2)}` : `= ${T(roundTo(ttc2, 4))} \\approx ${E(roundTo(ttc2, 2))}`}$ €.`],
      };
    },
    reasoning: "Ajouter une TVA de $t\\,\\%$, c'est appliquer une hausse de $t\\,\\%$ au prix HT.",
    hints: ["La TVA est une hausse en pourcentage du prix HT.", "$5{,}5\\,\\% = \\dfrac{5{,}5}{100} = 0{,}055$."],
  }),

  // ── Niveau 4 : Problèmes complexes ──
  ex({
    id: "pct3-21", title: "Hausse puis baisse du même pourcentage", niveau: 4, objectives: ["M3-OGDF-13#D"], time: 150,
    vary: (rng) => {
      const p0 = rng.int(2, 20) * 100;
      const t = rng.pick([10, 20, 25, 30, 40, 50]);
      const p1 = (p0 * (100 + t)) / 100;
      const p2 = (p1 * (100 - t)) / 100;
      const g = -(t * t) / 100;
      return {
        statement: `Un ordinateur coûte $${T(p0)}$ €. Son prix augmente de $${P(t)}$, puis baisse de $${P(t)}$.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Prix après la hausse (en €)", answer: { value: p1 }, suffix: "€" },
          { prompt: "Prix après la baisse (en €)", answer: { value: p2 }, suffix: "€" },
          { prompt: "Taux d'évolution global (en %, négatif pour une baisse)", answer: { value: g }, suffix: "%" },
        ] } }],
        solution: [`Après la hausse : $${T(p0)} \\times ${T((100 + t) / 100)} = ${T(p1)}$ €.`, `Après la baisse : $${T(p1)} \\times ${T((100 - t) / 100)} = ${T(p2)}$ €.`, `Coefficient global : $${T((100 + t) / 100)} \\times ${T((100 - t) / 100)} = ${T(1 + g / 100)}$, soit $${S(g)}$.`, `Le prix ne revient pas à $${T(p0)}$ € : la baisse de $${P(t)}$ porte sur un prix plus grand que le prix de départ.`],
      };
    },
    reasoning: "Les deux pourcentages ne portent pas sur la même valeur de référence : la baisse s'applique au prix déjà augmenté.",
    hints: ["Calcule le prix après chaque évolution, l'une après l'autre.", "Pour le taux global, compare le prix final au prix initial."],
  }),
  ex({
    id: "pct3-22", title: "Compenser une hausse", niveau: 4, objectives: ["M3-OGDF-13#D", "M3-OGDF-13#C"], time: 150,
    vary: (rng) => {
      const t = rng.pick([10, 20, 25, 40, 50, 60, 100]);
      const d = (100 * t) / (100 + t);
      return {
        statement: `Le prix d'un article augmente de $${P(t)}$. De quel pourcentage doit-il ensuite baisser pour revenir exactement au prix de départ ? Donne le résultat arrondi au dixième si nécessaire.`,
        parts: [numR(d, 1, "au dixième", [m(t, `Baisser de $${P(t)}$ ne suffit pas à compenser : la baisse porte sur un prix plus grand.`)], "Baisse nécessaire (en %) :", "%")],
        solution: [`Hausse : coefficient $${T((100 + t) / 100)}$. On cherche un coefficient $c$ tel que $${T((100 + t) / 100)} \\times c = 1$.`, `$c = \\dfrac{1}{${T((100 + t) / 100)}} ${approx(100 / (100 + t), 4)}$.`, `$1 - c ${approx(d / 100, 4)}$ : il faut une baisse ${roundTo(d, 6) === roundTo(d, 1) ? "de" : "d'environ"} $${P(roundTo(d, 1))}$.`],
      };
    },
    reasoning: "Pour annuler une multiplication par $c$, on multiplie par l'inverse $\\dfrac{1}{c}$ ; on traduit ensuite ce coefficient en taux.",
    hints: ["Quel coefficient faut-il multiplier par celui de la hausse pour obtenir $1$ ?", "Transforme ce coefficient en taux de baisse : $(1 - c) \\times 100$."],
  }),
  ex({
    id: "pct3-23", title: "Comparer deux offres", niveau: 4, objectives: ["M3-OGDF-13#D", "M3-OGDF-13#B"], time: 180,
    vary: (rng) => {
      const p0 = rng.int(1, 15) * 100;
      const [t2, t3] = rng.pick([[20, 10], [30, 10], [20, 20], [40, 10], [25, 15], [30, 20], [15, 15]]);
      const t = t2 + t3;
      const a = (p0 * (100 - t)) / 100;
      const b = (p0 * (100 - t2) * (100 - t3)) / 10000;
      const single = rng.next() < 0.5; // l'offre « remise unique » est-elle l'offre A ?
      const oneShot = `$-${P(t)}$ en une seule fois`;
      const twoSteps = `$-${P(t2)}$, puis une remise supplémentaire de $${P(t3)}$ sur le prix déjà réduit`;
      const [la, lb] = single ? ["A", "B"] : ["B", "A"];
      return {
        statement: `Un magasin vend un canapé à $${T(p0)}$ €. Deux offres sont proposées :\n– offre A : ${single ? oneShot : twoSteps} ;\n– offre B : ${single ? twoSteps : oneShot}.`,
        parts: [
          num(single ? a : b, single ? [] : [m(a, ADD_ERR)], "Prix avec l'offre A (en €) :", 2, "€"),
          num(single ? b : a, single ? [m(a, ADD_ERR)] : [], "Prix avec l'offre B (en €) :", 2, "€"),
          shuffledQcm(rng, ["L'offre A", "L'offre B", "Les deux offres se valent"], single ? 0 : 1, { 2: ADD_ERR, [single ? 1 : 0]: "Compare les deux prix que tu as calculés : le moins cher est le plus avantageux." }, "Quelle offre est la plus avantageuse ?"),
        ],
        solution: [`Offre ${la} : $${T(p0)} \\times ${T((100 - t) / 100)} = ${E(a)}$ €.`, `Offre ${lb} : $${T(p0)} \\times ${T((100 - t2) / 100)} \\times ${T((100 - t3) / 100)} = ${E(b)}$ €.`, `$${E(a)} < ${E(b)}$ : l'offre ${la} est la plus avantageuse. Les remises successives équivalent à $\\times ${T(r4(((100 - t2) * (100 - t3)) / 10000))}$, soit seulement $${P(roundTo(100 - ((100 - t2) * (100 - t3)) / 100, 2))}$ de remise.`],
      };
    },
    reasoning: "Une remise successive s'applique sur un prix déjà réduit : elle « rapporte » moins que la même remise appliquée au prix de départ.",
    hints: ["Calcule le prix avec chaque offre, sans additionner les deux remises successives.", "Deux remises successives : deux multiplications successives."],
  }),
  ex({
    id: "pct3-24", title: "Une croissance sur plusieurs années", niveau: 4, objectives: ["M3-OGDF-13#D"], time: 150,
    vary: (rng) => {
      const n0 = rng.int(80, 600) * 100;
      const t = rng.pick([1.5, 2, 2.5, 3, 4, -1.5, -2, -3]);
      const n = rng.pick([2, 3]);
      const c = (100 + t) / 100;
      const nf = n0 * c ** n;
      const add = Math.round(n0 * (1 + (n * t) / 100));
      return {
        statement: `Une ville compte $${T(n0)}$ habitants. Sa population ${t > 0 ? "augmente" : "diminue"} de $${P(Math.abs(t))}$ chaque année. Combien d'habitants comptera-t-elle dans $${n}$ ans ? Arrondis à l'unité.`,
        parts: [numR(nf, 0, "à l'unité", [m(add, `Tu as ajouté $${n}$ fois le même nombre d'habitants. Chaque année, le pourcentage s'applique à la population de l'année précédente : on multiplie $${n}$ fois par $${T(c)}$.`)])],
        solution: [`Chaque année, la population est multipliée par $1 ${t > 0 ? "+" : "-"} ${T(Math.abs(t) / 100)} = ${T(c)}$.`, `En $${n}$ ans : $${T(n0)} \\times ${T(c)}^{${n}} ${approx(nf, 2)}$.`, `${roundTo(nf, 6) === Math.round(nf) ? "Soit" : "Soit environ"} $${T(Math.round(nf))}$ habitants.`],
      };
    },
    reasoning: "Une évolution répétée de $t\\,\\%$ pendant $n$ années revient à multiplier $n$ fois par le même coefficient, c'est-à-dire par $CM^n$.",
    hints: ["Quel est le coefficient multiplicateur annuel ?", "Après $2$ ans, on a multiplié deux fois par ce coefficient ; après $3$ ans, trois fois."],
  }),
  ex({
    id: "pct3-25", title: "Partage à trois", niveau: 4, objectives: ["M4-OGDF-10"], time: 150,
    vary: (rng) => {
      const [a, b, c] = rng.pick([[2, 3, 5], [1, 2, 3], [3, 4, 5], [2, 5, 3], [1, 3, 4], [4, 1, 3], [5, 3, 2]]);
      const k = rng.int(4, 40) * 10;
      const s = k * (a + b + c);
      return {
        statement: `Trois associés, Ali, Bérénice et Chloé, se partagent un bénéfice selon le ratio $${a} : ${b} : ${c}$ (dans cet ordre). Chloé reçoit $${T(c * k)}$ €.`,
        parts: [{ interaction: { kind: "texte-trous", template: "Ali reçoit [[0]] €, Bérénice reçoit [[1]] € et le bénéfice total est de [[2]] €.", blanks: [{ type: "number", answer: { value: a * k } }, { type: "number", answer: { value: b * k } }, { type: "number", answer: { value: s } }] } }],
        solution: [`Chloé reçoit $${c}$ parts, donc une part vaut $${T(c * k)} \\div ${c} = ${T(k)}$ €.`, `Ali : $${a} \\times ${T(k)} = ${T(a * k)}$ € ; Bérénice : $${b} \\times ${T(k)} = ${T(b * k)}$ €.`, `Nombre de parts : $${a} + ${b} + ${c} = ${a + b + c}$ ; total : $${a + b + c} \\times ${T(k)} = ${T(s)}$ €.`, `Vérification : $${T(a * k)} + ${T(b * k)} + ${T(c * k)} = ${T(s)}$.`],
      };
    },
    reasoning: "Un ratio à trois termes se traite comme un ratio à deux termes : on compte le nombre total de parts.",
    hints: ["Combien de parts reçoit Chloé ? Déduis-en la valeur d'une part.", "Le total correspond à la somme des trois termes du ratio."],
  }),
  ex({
    id: "pct3-26", title: "Une recette en ratio", niveau: 3, objectives: ["M4-OGDF-10", "M4-OGDF-08"], time: 100,
    vary: (rng) => {
      const [a, b] = rng.pick([[4, 1], [5, 1], [6, 1], [8, 1], [5, 2], [7, 2]]);
      const k = rng.int(2, 9) * 10;
      const f = a * k;
      const s = b * k;
      return {
        statement: `Dans une pâte à crêpes, le ratio farine : sucre est $${a} : ${b}$ (en masse). Sami utilise $${T(f)}$ g de farine. Quelle masse de sucre doit-il utiliser (en g) ?`,
        parts: [num(s, [m(r2((f * a) / b), "Tu as inversé le ratio : il y a $" + a + "$ parts de farine pour $" + b + "$ parts de sucre."), m(f - (a - b), "Un ratio ne se traduit pas par une différence constante : c'est une situation de proportionnalité.")], undefined, undefined, "g")],
        solution: [`$${a}$ parts de farine correspondent à $${T(f)}$ g, donc une part vaut $${T(f)} \\div ${a} = ${T(k)}$ g.`, `Sucre : $${b} \\times ${T(k)} = ${T(s)}$ g.`],
      };
    },
    reasoning: "Les masses de farine et de sucre sont proportionnelles aux termes du ratio.",
    hints: ["À combien de grammes correspond une part ?", "Combien de parts représente le sucre ?"],
  }),
  ex({
    id: "pct3-27", title: "Ranger des évolutions", niveau: 4, objectives: ["M3-OGDF-13", "M3-OGDF-13#D"], time: 150,
    vary: (rng) => {
      const pool: [string, number][] = [
        ["$+15\\,\\%$", 1.15], ["$-20\\,\\%$", 0.8], ["$\\times 0{,}9$", 0.9], ["$+10\\,\\%$ puis $-10\\,\\%$", 0.99],
        ["$\\times 1{,}08$", 1.08], ["$-5\\,\\%$ puis $-5\\,\\%$", 0.9025], ["$+50\\,\\%$ puis $-50\\,\\%$", 0.75], ["$\\times 1{,}2$ puis $\\times 0{,}9$", 1.08], ["$-30\\,\\%$", 0.7],
      ];
      // On évite les ex æquo (×1,08 et ×1,2 puis ×0,9 donnent le même résultat).
      let items = rng.shuffle(pool).slice(0, 5);
      while (new Set(items.map(([, c]) => c)).size < items.length) items = rng.shuffle(pool).slice(0, 5);
      let order = items.map((_, i) => i).sort((i, j) => items[i][1] - items[j][1]);
      while (order.every((v, i) => v === i)) {
        items = rng.shuffle(items);
        order = items.map((_, i) => i).sort((i, j) => items[i][1] - items[j][1]);
      }
      return {
        statement: "Un prix de départ de $100$ € subit l'une des évolutions ci-dessous. Range ces évolutions de celle qui donne le prix final le plus **bas** à celle qui donne le prix final le plus **haut**.",
        parts: [{ interaction: { kind: "ordonner", items: items.map(([l]) => l), answer: order, hint: "Du prix final le plus bas (en haut) au plus haut (en bas)" } }],
        solution: ["On calcule le coefficient global de chaque évolution (produit des coefficients).", ...order.map((i) => `${items[i][0]} : $\\times ${T(items[i][1])}$, prix final $${E(100 * items[i][1])}$ €.`)],
      };
    },
    reasoning: "Pour comparer des évolutions, on compare leurs coefficients multiplicateurs globaux.",
    hints: ["Applique chaque évolution à $100$ €.", "Pour deux évolutions successives, multiplie les deux coefficients."],
  }),

  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "pct3-28", title: "Type Brevet — Le forfait téléphonique", niveau: 5, objectives: ["M3-OGDF-13#B", "M3-OGDF-13#D", "M3-OGDF-13#C"], time: 240,
    vary: (rng) => {
      const p0 = rng.int(15, 45);
      const t1 = rng.pick([4, 5, 6, 8, 10, 12]);
      const t2 = rng.pick([10, 15, 20, 25, 30]);
      const p1 = (p0 * (100 + t1)) / 100;
      const p2 = (p1 * (100 - t2)) / 100;
      const g = ((100 + t1) * (100 - t2) - 10000) / 100;
      return {
        statement: `Le forfait mensuel de Maëlle coûte $${T(p0)}$ €. En janvier, l'opérateur augmente tous ses forfaits de $${P(t1)}$. En mars, Maëlle obtient une réduction de fidélité de $${P(t2)}$ sur le nouveau prix.`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Prix du forfait en janvier (en €)", answer: { value: r2(p1) }, suffix: "€" },
          { prompt: "Prix du forfait en mars (en €, arrondi au centime)", answer: { value: r2(p2), tol: 0.005 + 1e-9, decimals: 2, roundingLabel: "au centime" }, suffix: "€" },
          { prompt: "Taux d'évolution entre le prix initial et le prix de mars (en %, négatif pour une baisse)", answer: { value: g }, suffix: "%" },
        ] } }],
        solution: [`Janvier : $${T(p0)} \\times ${T((100 + t1) / 100)} = ${E(p1)}$ €.`, `Mars : $${E(p1)} \\times ${T((100 - t2) / 100)} ${roundTo(p2, 6) === r2(p2) ? `= ${E(p2)}` : `= ${T(roundTo(p2, 4))} \\approx ${E(r2(p2))}`}$ €.`, `Coefficient global : $${T((100 + t1) / 100)} \\times ${T((100 - t2) / 100)} = ${T(r4(1 + g / 100))}$, donc taux $= ${S(g)}$.`, `Rédaction : « Le prix a été multiplié par $${T(r4(1 + g / 100))}$ ; il a ${g > 0 ? "augmenté" : "baissé"} de $${P(Math.abs(g))}$ par rapport au prix initial. »`],
      };
    },
    reasoning: "Chaque évolution correspond à un coefficient ; le taux global se lit sur le produit des coefficients, pas sur la somme des taux.",
    hints: ["Applique la hausse au prix initial, puis la réduction au prix de janvier.", "Pour le taux global : multiplie les deux coefficients, puis retire $1$ et multiplie par $100$."],
  }),
  ex({
    id: "pct3-29", title: "Type Brevet — TVA et remise", niveau: 5, objectives: ["M3-OGDF-13#B", "M3-OGDF-13#C", "M3-OGDF-13#D"], time: 240,
    vary: (rng) => {
      const ht = rng.int(16, 60) * 50;
      const r = rng.pick([5, 10, 15, 25, 30]);
      const ttc = ht * 1.2;
      const fin = (ttc * (100 - r)) / 100;
      const g = roundTo(20 - 1.2 * r, 4);
      return {
        statement: `Un vélo électrique coûte $${T(ht)}$ € hors taxes. On ajoute la TVA de $20\\,\\%$, puis le vendeur accorde une remise de $${P(r)}$ sur le prix TTC.`,
        parts: [
          num(r2(ttc), [m(r2(ht * 0.2), "C'est seulement le montant de la TVA.")], "Prix TTC (en €) :", 2, "€"),
          numR(fin, 2, "au centime", [m(r2((ht * (120 - r)) / 100), ADD_ERR)], "Prix payé après la remise (en €, arrondi au centime) :", "€"),
          num(g, [m(20 - r, ADD_ERR)], "Taux d'évolution entre le prix HT et le prix payé (en %, négatif pour une baisse) :", undefined, "%"),
        ],
        solution: [`Prix TTC : $${T(ht)} \\times 1{,}2 = ${E(ttc)}$ €.`, `Prix payé : $${E(ttc)} \\times ${T((100 - r) / 100)} = ${E(r2(fin))}$ €.`, `Coefficient global : $1{,}2 \\times ${T((100 - r) / 100)} = ${T(roundTo(1.2 * (100 - r) / 100, 4))}$, soit un taux de $${S(g)}$.`, `Ce n'est pas $${S(20 - r)}$ : ${ADD_ERR}`],
      };
    },
    reasoning: "La TVA puis la remise sont deux évolutions successives : le coefficient global est $1{,}2 \\times \\left(1 - \\dfrac{r}{100}\\right)$.",
    hints: ["Applique d'abord la TVA au prix HT.", "La remise porte sur le prix TTC.", "Pour le taux global, multiplie les deux coefficients."],
  }),
  ex({
    id: "pct3-30", title: "Type Brevet — Le prix d'un appartement", niveau: 5, objectives: ["M3-OGDF-13#B", "M3-OGDF-13#D"], time: 240,
    vary: (rng) => {
      const k = rng.int(12, 40);
      const v0 = k * 10000;
      const t1 = rng.pick([5, 8, 10, 12, 15]);
      const t2 = rng.pick([2, 4, 5, 6, 10]);
      const c = ((100 + t1) * (100 - t2)) / 10000;
      const v2 = k * (100 + t1) * (100 - t2);
      return {
        statement: `Le prix d'un appartement a augmenté de $${P(t1)}$ en 2024, puis baissé de $${P(t2)}$ en 2025. Fin 2025, il vaut $${T(v2)}$ €. Quel était son prix début 2024 ?`,
        parts: [{ interaction: { kind: "etapes", steps: [
          { prompt: "Coefficient multiplicateur global sur les deux années", answer: { value: c } },
          { prompt: "Prix début 2024 (en €)", answer: { value: v0 }, suffix: "€" },
        ] } }],
        solution: [`Coefficient global : $${T((100 + t1) / 100)} \\times ${T((100 - t2) / 100)} = ${T(c)}$.`, `Prix début 2024 $\\times ${T(c)} = ${T(v2)}$, donc prix début 2024 $= ${T(v2)} \\div ${T(c)} = ${T(v0)}$ €.`, `Vérification : $${T(v0)} \\times ${T((100 + t1) / 100)} = ${T((v0 * (100 + t1)) / 100)}$ puis $\\times ${T((100 - t2) / 100)} = ${T(v2)}$.`],
      };
    },
    reasoning: "On remonte les deux évolutions d'un coup en divisant par le coefficient global.",
    hints: ["Calcule le coefficient global des deux évolutions.", "Valeur initiale $=$ valeur finale $\\div$ coefficient global."],
  }),
  ex({
    id: "pct3-31", title: "Type Brevet — Mélange de peinture", niveau: 5, objectives: ["M4-OGDF-10", "M6-NC-25"], time: 180,
    vary: (rng) => {
      const [a, b] = rng.pick([[1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [3, 7], [7, 3], [9, 11], [1, 9]]);
      const k = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
      const v = k * (a + b);
      return {
        statement: `Pour obtenir une peinture verte, on mélange de la peinture bleue et de la peinture jaune selon le ratio bleu : jaune $= ${a} : ${b}$. On veut préparer $${T(v)}$ litres de peinture verte.`,
        parts: [
          num(roundTo(a * k, 4), [m(roundTo((v * a) / b, 4), `Le volume total correspond à $${a} + ${b}$ parts, pas à $${b}$ parts.`), m(roundTo(b * k, 4), "C'est le volume de peinture **jaune**.")], "Volume de peinture bleue (en L) :", undefined, "L"),
          num((a * 100) / (a + b), [m(roundTo((a * 100) / b, 4), "Le pourcentage se calcule par rapport au volume **total**, pas par rapport au jaune.")], "Pourcentage de peinture bleue dans le mélange (en %) :", undefined, "%"),
        ],
        solution: [`Nombre de parts : $${a} + ${b} = ${a + b}$ ; une part : $${T(v)} \\div ${a + b} = ${T(k)}$ L.`, `Bleu : $${a} \\times ${T(k)} = ${T(a * k)}$ L.`, `Pourcentage de bleu : $\\dfrac{${a}}{${a + b}} = ${T(a / (a + b))} = ${P((a * 100) / (a + b))}$.`],
      };
    },
    reasoning: "Le ratio indique la répartition du total en parts égales ; une proportion se calcule toujours par rapport au total.",
    hints: ["Combien de parts au total ?", "Bleu : combien de parts sur le total ?"],
  }),
  ex({
    id: "pct3-32", title: "Type Brevet — Vrai ou faux, justifier", niveau: 5, objectives: ["M3-OGDF-13", "M3-OGDF-13#D", "M3-OGDF-13#C"], time: 240,
    vary: (rng) => {
      const t1 = rng.pick([10, 20, 30]);
      const t2 = rng.pick([5, 10, 15]);
      const c = rng.pick([85, 92, 75, 64]);
      const t = rng.pick([20, 25, 50]);
      const items: [string, boolean, string][] = [
        [`Augmenter un prix de $${P(t1)}$ puis de $${P(t2)}$ revient à l'augmenter de $${P(t1 + t2)}$.`, false, `$${T((100 + t1) / 100)} \\times ${T((100 + t2) / 100)} = ${T(((100 + t1) * (100 + t2)) / 10000)}$ : hausse de $${P(((100 + t1) * (100 + t2) - 10000) / 100)}$, pas $${P(t1 + t2)}$.`],
        [`Multiplier un prix par $${T(c / 100)}$ revient à le baisser de $${P(100 - c)}$.`, true, `$${T(c / 100)} = 1 - ${T((100 - c) / 100)}$ : baisse de $${P(100 - c)}$.`],
        [`Si un prix baisse de $${P(t)}$ puis augmente de $${P(t)}$, il revient à sa valeur initiale.`, false, `$${T((100 - t) / 100)} \\times ${T((100 + t) / 100)} = ${T(((100 - t) * (100 + t)) / 10000)} \\neq 1$.`],
        ["Si un prix passe de $40$ € à $80$ €, il a augmenté de $100\\,\\%$.", true, "$\\dfrac{80}{40} = 2 = 1 + 1$ : hausse de $100\\,\\%$."],
        ["Si un prix passe de $80$ € à $40$ €, il a baissé de $100\\,\\%$.", false, "$\\dfrac{40}{80} = 0{,}5 = 1 - 0{,}5$ : baisse de $50\\,\\%$. Une baisse de $100\\,\\%$ donnerait $0$ €."],
      ];
      const sel = rng.shuffle(items);
      return {
        statement: "Pour chaque affirmation, indique si elle est vraie ou fausse. Au brevet, chaque réponse doit être justifiée (un calcul ou un contre-exemple).",
        parts: [{ interaction: { kind: "vrai-faux", items: sel.map(([s]) => s), answer: sel.map(([, b]) => b) } }],
        solution: sel.map(([, b, j], i) => `${i + 1}. **${b ? "Vrai" : "Faux"}** : ${j}`),
      };
    },
    reasoning: "Une justification de brevet s'appuie sur les coefficients multiplicateurs ; pour montrer qu'une affirmation est fausse, un seul contre-exemple suffit.",
    hints: ["Traduis chaque évolution en coefficient multiplicateur.", "Teste avec un prix de $100$ € si tu hésites."],
  }),
  ex({
    id: "pct3-33", title: "Type Brevet — Compléter un raisonnement", niveau: 5, objectives: ["M3-OGDF-13", "M3-OGDF-13#D", "M3-OGDF-13#C"], time: 180,
    vary: (rng) => {
      const t1 = rng.pick([10, 20, 25, 30, 40]);
      let t2 = t1;
      while (t2 === t1) t2 = rng.pick([5, 10, 15, 20, 25]);
      const c1 = (100 + t1) / 100;
      const c2 = (100 - t2) / 100;
      const c = ((100 + t1) * (100 - t2)) / 10000;
      const g = ((100 + t1) * (100 - t2) - 10000) / 100;
      const tokens = [`$${T(c1)}$`, `$${T(c2)}$`, `$${T(c)}$`, `$${S(g)}$`, `$${T(t1 / 100)}$`, `$${S(t1 - t2)}$`, `$${T((100 + t2) / 100)}$`];
      const order = rng.shuffle(tokens.map((_, i) => i));
      return {
        statement: `Un prix augmente de $${P(t1)}$, puis baisse de $${P(t2)}$. Complète le raisonnement en déposant la bonne valeur dans chaque case.`,
        parts: [{ interaction: { kind: "glisser-deposer", zones: [`Coefficient de la hausse de $${P(t1)}$`, `Coefficient de la baisse de $${P(t2)}$`, "Coefficient multiplicateur global", "Taux d'évolution global"], tokens: order.map((i) => tokens[i]), answer: [0, 1, 2, 3].map((i) => order.indexOf(i)) } }],
        solution: [`Hausse : $1 + ${T(t1 / 100)} = ${T(c1)}$ ; baisse : $1 - ${T(t2 / 100)} = ${T(c2)}$.`, `Global : $${T(c1)} \\times ${T(c2)} = ${T(c)}$.`, `Taux global : $(${T(c)} - 1) \\times 100 = ${T(g)}$, soit $${S(g)}$ (et non $${S(t1 - t2)}$).`],
      };
    },
    reasoning: "La chaîne de raisonnement attendue : taux → coefficients → produit des coefficients → taux global.",
    hints: ["Une baisse correspond à un coefficient inférieur à $1$.", "Le coefficient global est un produit ; le taux global se déduit de ce produit."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const SVG_STYLE = "width:100%;height:auto;font-family:Inter,Arial,sans-serif";
const arrowsSvg = (() => {
  const box = (x: number, label: string, sub: string) => `<rect x="${x}" y="40" width="120" height="56" rx="10" fill="#eef2ff" stroke="#4338ca" stroke-width="2"/><text x="${x + 60}" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#1e1b4b">${label}</text><text x="${x + 60}" y="84" text-anchor="middle" font-size="13" fill="#334155">${sub}</text>`;
  let s = box(10, "Valeur initiale", "80 €") + box(290, "Valeur finale", "92 €");
  s += `<defs><marker id="pa" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#059669"/></marker><marker id="pb" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626"/></marker></defs>`;
  s += `<path d="M135 52 Q210 10 285 52" fill="none" stroke="#059669" stroke-width="2.5" marker-end="url(#pa)"/><text x="210" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#059669">× 1,15 (hausse de 15 %)</text>`;
  s += `<path d="M285 86 Q210 128 135 86" fill="none" stroke="#dc2626" stroke-width="2.5" marker-end="url(#pb)"/><text x="210" y="132" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">÷ 1,15 (retour)</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 145" role="img" aria-label="Schéma : 80 euros multipliés par 1,15 donnent 92 euros ; 92 euros divisés par 1,15 redonnent 80 euros" style="${SVG_STYLE};max-width:420px">${s}</svg>`;
})();
const ratioSvg = (() => {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const blue = i < 3;
    s += `<rect x="${10 + i * 70}" y="30" width="66" height="40" rx="6" fill="${blue ? "#3b82f6" : "#facc15"}" stroke="#334155"/><text x="${43 + i * 70}" y="56" text-anchor="middle" font-size="14" font-weight="700" fill="${blue ? "#fff" : "#1f2937"}">${blue ? "bleu" : "jaune"}</text>`;
  }
  s += `<text x="10" y="20" font-size="14" font-weight="700" fill="#1e3a8a">Ratio bleu : jaune = 3 : 2</text>`;
  s += `<text x="10" y="95" font-size="13" fill="#334155">5 parts égales : bleu = 3/5 = 60 % ; jaune = 2/5 = 40 %</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 105" role="img" aria-label="Barre partagée en 5 parts égales : 3 parts bleues et 2 parts jaunes" style="${SVG_STYLE};max-width:370px">${s}</svg>`;
})();

// ───────────────────────── Chapitre ─────────────────────────
export const math3ePourcentagesEvolution: ChapterContent = {
  id: "math-3e-pourcentages-evolution",
  taskId: "SCI-3E-MATH-009",
  grade: "3e",
  subject: "mathematiques",
  treeChapterId: "m3-pourcentages",
  // Couvre M3-OGDF-13 (3e) et consolide M4-OGDF-08 et M4-OGDF-10 (chapitre math-4e-proportionnalite de l'inventaire).
  curriculumChapterIds: ["math-3e-pourcentages-evolution", "math-4e-proportionnalite"],
  curriculumVersion: "2026-2027",
  title: "Ratios, pourcentages et évolutions",
  officialObjectives: (Object.keys(O) as Obj[]).map((id) => ({ id, text: O[id], source: id === "M3-OGDF-13" ? SRC_3E : id.startsWith("M3-") ? SRC_DECL : id === "M4-OGDF-08" ? SRC_4E_08 : id === "M4-AUTO-03" ? SRC_AUTO : id.startsWith("M6-") ? SRC_6E : SRC_4E_10 })),
  prerequisites: [
    { text: "Reconnaître une situation de proportionnalité et calculer une quatrième proportionnelle (5e et 4e)." },
    { text: "Écrire un pourcentage sous forme de fraction ou de nombre décimal : $t\\,\\% = \\dfrac{t}{100}$ (cycle 3, 5e)." },
    { text: "Multiplier et diviser des nombres décimaux ; simplifier une fraction." },
    { text: "Notion de ratio $a : b$ (4e)." },
  ],
  sources: [
    { id: "R1", title: "Programme de mathématiques du cycle 4 (version 2020), BO n° 31 du 30 juillet 2020", url: "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm", kind: "official", note: "thème B « Organisation et gestion de données, fonctions » : proportionnalité, pourcentages, ratio", verification: "pending_verification" },
    { id: "R2", title: "Repères annuels de progression et attendus de fin d'année du cycle 4, BO n° 22 du 29 mai 2019", url: "https://www.education.gouv.fr/bo/19/Hebdo22/MENE1913283N.htm", kind: "official", note: "3e : relier taux d'évolution et coefficient multiplicateur ; 4e : quatrième proportionnelle", verification: "pending_verification" },
    { id: "R3", title: "Inventaire interne des objectifs de mathématiques 2026-2027 (agent A1)", url: "https://github.com/NguyenthanhTuyen0710/sciences-interactives/blob/main/research/curriculum/mathematiques/curriculum-math.json", kind: "supplementary", note: "research/curriculum/mathematiques/curriculum-math.json ; le programme 2026 ne s'applique en 3e qu'à la rentrée 2028", verification: "pending_verification" },
  ],
  lesson: {
    introduction: "Un jean à $50$ € est soldé à $-20\\,\\%$ ; un loyer augmente de $3\\,\\%$ ; la population d'une ville baisse de $1{,}5\\,\\%$ par an. Les **pourcentages d'évolution** décrivent des changements, et un seul outil suffit pour les calculer tous : le **coefficient multiplicateur**.\nDans ce chapitre, tu vas relier un taux d'évolution et un coefficient multiplicateur, enchaîner plusieurs évolutions, retrouver une valeur de départ, et revoir les **ratios** qui servent à partager une quantité.",
    definitions: [
      { term: "Pourcentage", text: "Un **pourcentage** $t\\,\\%$ est une autre écriture de la fraction $\\dfrac{t}{100}$. Prendre $t\\,\\%$ d'une quantité $Q$, c'est calculer $\\dfrac{t}{100} \\times Q$.\nExemple : $15\\,\\%$ de $60$ € $= 0{,}15 \\times 60 = 9$ €." },
      { term: "Proportion en pourcentage", text: "Si une partie vaut $p$ dans un total $N$, elle représente $\\dfrac{p}{N} \\times 100$ pour cent du total.\nExemple : $9$ élèves sur $25$ : $\\dfrac{9}{25} = 0{,}36 = 36\\,\\%$." },
      { term: "Coefficient multiplicateur", text: "Quand une grandeur passe d'une valeur initiale $V_i$ à une valeur finale $V_f$, le **coefficient multiplicateur** est le nombre $CM$ tel que $V_f = V_i \\times CM$, c'est-à-dire $CM = \\dfrac{V_f}{V_i}$." },
      { term: "Taux d'évolution", text: "Le **taux d'évolution** (en %) est $t = \\dfrac{V_f - V_i}{V_i} \\times 100$. Il est positif pour une hausse, négatif pour une baisse. On le calcule toujours par rapport à la valeur **initiale**." },
      { term: "Ratio", text: "Deux quantités sont dans le **ratio** $a : b$ si l'on peut les partager en parts égales, $a$ parts pour la première et $b$ parts pour la seconde. Exemple : un sirop dilué dans le ratio $1 : 7$ contient $1$ volume de sirop pour $7$ volumes d'eau. Un ratio se simplifie comme une fraction : $12 : 8 = 3 : 2$." },
    ],
    properties: [
      { title: "Hausse de t %", statement: "Augmenter une valeur de $t\\,\\%$, c'est la multiplier par $CM = 1 + \\dfrac{t}{100}$.\nExemple : hausse de $15\\,\\%$ : $\\times 1{,}15$ ; hausse de $100\\,\\%$ : $\\times 2$.", conditions: "Une hausse correspond à un coefficient strictement supérieur à $1$." },
      { title: "Baisse de t %", statement: "Diminuer une valeur de $t\\,\\%$, c'est la multiplier par $CM = 1 - \\dfrac{t}{100}$.\nExemple : baisse de $20\\,\\%$ : $\\times 0{,}8$ ; baisse de $3\\,\\%$ : $\\times 0{,}97$.", conditions: "Une baisse correspond à un coefficient $CM$ tel que $0 \\leqslant CM < 1$ (pour $0 < t \\leqslant 100$)." },
      { title: "Du coefficient au taux", statement: "Si $CM$ est le coefficient multiplicateur, le taux d'évolution vaut $(CM - 1) \\times 100$ (en %).\nExemple : $CM = 0{,}88$ : $(0{,}88 - 1) \\times 100 = -12$ : baisse de $12\\,\\%$." },
      { title: "Retrouver la valeur initiale", statement: "Comme $V_f = V_i \\times CM$, on a $V_i = V_f \\div CM$.\nExemple : après une hausse de $25\\,\\%$, un prix vaut $75$ € ; avant, il valait $75 \\div 1{,}25 = 60$ €." },
      { title: "Évolutions successives", statement: "Si une grandeur subit plusieurs évolutions successives, le coefficient multiplicateur global est le **produit** des coefficients.\nExemple : $+10\\,\\%$ puis $-10\\,\\%$ : $1{,}1 \\times 0{,}9 = 0{,}99$, soit une baisse globale de $1\\,\\%$.", conditions: "Les taux ne s'additionnent pas : chaque évolution porte sur la valeur obtenue juste avant." },
      { title: "Partage selon un ratio", statement: "Pour partager une quantité $Q$ selon le ratio $a : b$, on calcule une part $\\dfrac{Q}{a + b}$ ; la première quantité vaut $a$ parts, la seconde $b$ parts. La première représente la fraction $\\dfrac{a}{a + b}$ du total." },
    ],
    explanations: [
      { title: "1. Pourquoi multiplier par 1,15 ?", body: "Un prix de $80$ € augmente de $15\\,\\%$. Méthode en deux temps : la hausse vaut $0{,}15 \\times 80 = 12$ €, le nouveau prix est $80 + 12 = 92$ €.\nEn une seule fois : nouveau prix $= 80 + 0{,}15 \\times 80 = 80 \\times (1 + 0{,}15) = 80 \\times 1{,}15 = 92$ €. On a factorisé par $80$ : c'est la distributivité !\nAppliquer une hausse de $15\\,\\%$ à n'importe quel prix, c'est donc appliquer la **fonction linéaire** $x \\mapsto 1{,}15x$ : le nouveau prix est proportionnel à l'ancien, de coefficient $1{,}15$." },
      { title: "2. Une baisse, c'est ce qui reste", body: "Après une remise de $20\\,\\%$, il reste à payer $100\\,\\% - 20\\,\\% = 80\\,\\%$ du prix, soit $\\times 0{,}8$. Penser « ce qui reste » évite d'oublier de retirer la remise." },
      { title: "3. Remonter le temps : on divise", body: "Si $V_i \\times 1{,}15 = 92$, alors $V_i = 92 \\div 1{,}15 = 80$. Attention : retirer $15\\,\\%$ à $92$ donnerait $78{,}20$ €, ce qui est faux, car les $15\\,\\%$ portaient sur $80$, pas sur $92$." },
      { title: "4. Enchaîner des évolutions", body: "Un prix augmente de $10\\,\\%$, puis baisse de $10\\,\\%$. Avec $100$ € : $100 \\times 1{,}1 = 110$, puis $110 \\times 0{,}9 = 99$. On ne revient pas à $100$ : la baisse de $10\\,\\%$ porte sur $110$ €, elle enlève $11$ € alors que la hausse avait ajouté $10$ €." },
      { title: "5. Ratio, fraction, pourcentage", body: "Dans une classe où le ratio filles : garçons est $3 : 2$, on imagine des groupes de $5$ élèves : $3$ filles et $2$ garçons. Les filles représentent donc $\\dfrac{3}{5} = 60\\,\\%$ de la classe. La fraction se calcule sur le **total** ($3 + 2$), pas sur l'autre part." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Appliquer une hausse", statement: "Un abonnement de $36$ € augmente de $5\\,\\%$. Quel est son nouveau prix ?", steps: ["Coefficient : $1 + \\dfrac{5}{100} = 1{,}05$.", "$36 \\times 1{,}05 = 37{,}8$."], answer: "Le nouveau prix est $37{,}80$ €." },
      { title: "Exemple 2 — Calculer un taux d'évolution", statement: "Une entreprise passe de $250$ à $215$ salariés. Calculer le taux d'évolution.", steps: ["$CM = \\dfrac{215}{250} = 0{,}86$.", "$(0{,}86 - 1) \\times 100 = -14$."], answer: "Le nombre de salariés a baissé de $14\\,\\%$." },
      { title: "Exemple 3 — Retrouver un prix initial", statement: "Après une remise de $30\\,\\%$, une console coûte $245$ €. Quel était son prix ?", steps: ["Coefficient de la remise : $1 - 0{,}3 = 0{,}7$.", "Prix initial $\\times 0{,}7 = 245$, donc prix initial $= 245 \\div 0{,}7 = 350$.", "Vérification : $350 \\times 0{,}7 = 245$."], answer: "La console coûtait $350$ €." },
      { title: "Exemple 4 — Évolutions successives", statement: "Un prix augmente de $20\\,\\%$ puis baisse de $25\\,\\%$. Quelle est l'évolution globale ?", steps: ["Coefficients : $1{,}2$ et $0{,}75$.", "Coefficient global : $1{,}2 \\times 0{,}75 = 0{,}9$.", "$(0{,}9 - 1) \\times 100 = -10$."], answer: "Globalement, le prix a baissé de $10\\,\\%$ (et non de $5\\,\\%$)." },
      { title: "Exemple 5 — Partager selon un ratio", statement: "Deux frères se partagent $560$ € selon le ratio $3 : 4$. Combien reçoit chacun ?", steps: ["Nombre de parts : $3 + 4 = 7$.", "Une part : $560 \\div 7 = 80$ €.", "Premier : $3 \\times 80 = 240$ € ; second : $4 \\times 80 = 320$ €. Vérification : $240 + 320 = 560$."], answer: "Ils reçoivent $240$ € et $320$ €." },
    ],
    illustrations: [
      { svg: arrowsSvg, alt: "Schéma : de la valeur initiale 80 € à la valeur finale 92 €, on multiplie par 1,15 ; dans l'autre sens, on divise par 1,15.", caption: "Aller : on multiplie par le coefficient. Retour : on divise par ce même coefficient." },
      { svg: ratioSvg, alt: "Barre de cinq parts égales : trois parts bleues et deux parts jaunes, illustrant le ratio 3 : 2.", caption: "Un ratio $3 : 2$ partage le total en $5$ parts égales." },
    ],
    commonMistakes: [
      { mistake: "Une hausse de $15\\,\\%$ : « je multiplie par $0{,}15$ »", correction: "On multiplie par $1{,}15$", why: "$0{,}15 \\times$ prix donne seulement le montant de la hausse ; il faut garder les $100\\,\\%$ du prix." },
      { mistake: "$+10\\,\\%$ puis $+20\\,\\%$ « font $+30\\,\\%$ »", correction: "$1{,}1 \\times 1{,}2 = 1{,}32$ : $+32\\,\\%$", why: "La seconde hausse porte sur un prix déjà augmenté : on multiplie les coefficients." },
      { mistake: "Un article coûte $75$ € après une hausse de $25\\,\\%$ ; son prix d'avant : « $75 \\times 0{,}75 = 56{,}25$ € »", correction: "$75 \\div 1{,}25 = 60$ €", why: "Les $25\\,\\%$ portaient sur l'ancien prix : on divise le nouveau prix par le coefficient." },
      { mistake: "Taux de $40$ à $50$ : « $\\dfrac{10}{50} = 20\\,\\%$ »", correction: "$\\dfrac{10}{40} = 25\\,\\%$", why: "On divise la variation par la valeur **initiale**." },
      { mistake: "Ratio filles : garçons $= 3 : 2$, « les filles représentent $\\dfrac{3}{2}$ de la classe »", correction: "$\\dfrac{3}{5}$ de la classe", why: "La fraction d'une part se calcule par rapport au total $3 + 2 = 5$." },
      { mistake: "« Une baisse de $5\\,\\%$ : $\\times 0{,}5$ »", correction: "$\\times 0{,}95$", why: "$5\\,\\% = 0{,}05$ ; il reste $95\\,\\%$ du prix, et $0{,}5$ correspondrait à une baisse de $50\\,\\%$." },
    ],
    methods: [
      { title: "Appliquer une évolution", steps: ["Traduire le taux en coefficient : $1 + \\dfrac{t}{100}$ (hausse) ou $1 - \\dfrac{t}{100}$ (baisse).", "Multiplier la valeur initiale par ce coefficient.", "Contrôler le sens : une hausse doit agrandir la valeur, une baisse la réduire."] },
      { title: "Calculer un taux d'évolution", steps: ["Calculer $CM = \\dfrac{V_f}{V_i}$.", "Calculer $(CM - 1) \\times 100$.", "Conclure : positif = hausse, négatif = baisse ; arrondir seulement à la fin si demandé."] },
      { title: "Retrouver une valeur initiale", steps: ["Écrire l'égalité $V_i \\times CM = V_f$.", "Calculer $V_i = V_f \\div CM$.", "Vérifier en appliquant l'évolution à la valeur trouvée."] },
      { title: "Enchaîner des évolutions", steps: ["Écrire le coefficient de chaque évolution.", "Multiplier tous les coefficients pour obtenir le coefficient global.", "Traduire le coefficient global en taux global."] },
      { title: "Partager selon un ratio", steps: ["Additionner les termes du ratio : nombre de parts.", "Diviser la quantité par le nombre de parts.", "Multiplier la valeur d'une part par chaque terme ; vérifier que la somme redonne le total."] },
    ],
    summary: [
      "$t\\,\\% = \\dfrac{t}{100}$ ; prendre $t\\,\\%$ de $Q$, c'est calculer $\\dfrac{t}{100} \\times Q$.",
      "Hausse de $t\\,\\%$ : $\\times\\left(1 + \\dfrac{t}{100}\\right)$ ; baisse de $t\\,\\%$ : $\\times\\left(1 - \\dfrac{t}{100}\\right)$.",
      "Taux d'évolution $= (CM - 1) \\times 100$, avec $CM = \\dfrac{V_f}{V_i}$.",
      "Valeur initiale $=$ valeur finale $\\div CM$.",
      "Évolutions successives : on multiplie les coefficients ; les taux ne s'additionnent pas.",
      "Ratio $a : b$ : $a + b$ parts égales ; la première quantité représente $\\dfrac{a}{a + b}$ du total.",
    ],
    revisionSheet: {
      keyPoints: ["$+5\\,\\%$ : $\\times 1{,}05$ ; $-5\\,\\%$ : $\\times 0{,}95$ ; $+100\\,\\%$ : $\\times 2$ ; $-50\\,\\%$ : $\\times 0{,}5$.", "$CM > 1$ : hausse ; $0 \\leqslant CM < 1$ : baisse.", "$+10\\,\\%$ puis $-10\\,\\%$ : $\\times 0{,}99$, soit $-1\\,\\%$.", "Retour en arrière : on divise par le coefficient.", "Ratio $3 : 2$ : $\\dfrac{3}{5} = 60\\,\\%$ et $\\dfrac{2}{5} = 40\\,\\%$."],
      skills: ["Appliquer et calculer un pourcentage.", "Passer d'un taux d'évolution à un coefficient multiplicateur et inversement.", "Calculer une valeur finale, une valeur initiale, un taux d'évolution.", "Calculer l'effet de plusieurs évolutions successives.", "Partager une quantité selon un ratio et relier ratio, fraction et pourcentage."],
    },
    miniQuiz: [
      { question: "Une hausse de $8\\,\\%$ revient à multiplier par…", options: ["$0{,}08$", "$1{,}8$", "$1{,}08$", "$0{,}92$"], answer: 2, explanation: "$1 + \\dfrac{8}{100} = 1{,}08$." },
      { question: "Multiplier par $0{,}75$ revient à…", options: ["une hausse de $75\\,\\%$", "une baisse de $25\\,\\%$", "une baisse de $75\\,\\%$", "une hausse de $25\\,\\%$"], answer: 1, explanation: "$0{,}75 = 1 - 0{,}25$ : baisse de $25\\,\\%$." },
      { question: "Un prix augmente de $50\\,\\%$ puis baisse de $50\\,\\%$. Globalement :", options: ["il ne change pas", "il baisse de $25\\,\\%$", "il augmente de $25\\,\\%$", "il baisse de $50\\,\\%$"], answer: 1, explanation: "$1{,}5 \\times 0{,}5 = 0{,}75$ : baisse de $25\\,\\%$." },
      { question: "Après une hausse de $20\\,\\%$, un livre coûte $18$ €. Avant, il coûtait…", options: ["$14{,}40$ €", "$15$ €", "$21{,}60$ €", "$16$ €"], answer: 1, explanation: "$18 \\div 1{,}2 = 15$ €." },
      { question: "On partage $45$ bonbons selon le ratio $4 : 5$. La plus petite part contient…", options: ["$20$ bonbons", "$25$ bonbons", "$9$ bonbons", "$36$ bonbons"], answer: 0, explanation: "$45 \\div 9 = 5$ ; $4 \\times 5 = 20$." },
    ],
  },
  exercises: EXERCISES,
  games: [
    {
      id: "pct3-jeu-flash", template: "calcul-flash", title: "Flash coefficients",
      objective: "Automatiser le passage entre taux d'évolution et coefficient multiplicateur, puis les calculs de pourcentages les plus fréquents.",
      instructions: "Réponds le plus vite possible. Écris les nombres décimaux avec une virgule, par exemple 1,05. Pour un taux de baisse, écris un nombre négatif, par exemple −12. Le niveau s'adapte à tes réussites.",
      objectives: ["M3-OGDF-13", "M3-OGDF-13#B", "M4-AUTO-03"],
      config: { duration: 90, practiceCount: 15, levels: [
        { label: "Taux → coefficient", items: [
          { q: "Coefficient multiplicateur d'une hausse de $8\\,\\%$", answer: "1,08", explanation: "$1 + 0{,}08 = 1{,}08$." },
          { q: "Coefficient multiplicateur d'une baisse de $20\\,\\%$", answer: "0,8", explanation: "$1 - 0{,}2 = 0{,}8$." },
          { q: "Coefficient multiplicateur d'une hausse de $150\\,\\%$", answer: "2,5", explanation: "$1 + 1{,}5 = 2{,}5$." },
          { q: "Coefficient multiplicateur d'une baisse de $3\\,\\%$", answer: "0,97", explanation: "$1 - 0{,}03 = 0{,}97$." },
          { q: "Coefficient multiplicateur d'une hausse de $12{,}5\\,\\%$", answer: "1,125", explanation: "$1 + 0{,}125 = 1{,}125$." },
          { q: "Coefficient multiplicateur d'une baisse de $45\\,\\%$", answer: "0,55", explanation: "$1 - 0{,}45 = 0{,}55$." },
          { q: "Coefficient multiplicateur d'une hausse de $100\\,\\%$", answer: "2", explanation: "$1 + 1 = 2$ : on double." },
          { q: "Coefficient multiplicateur d'une baisse de $5\\,\\%$", answer: "0,95", explanation: "$1 - 0{,}05 = 0{,}95$ (et non $0{,}5$)." },
        ] },
        { label: "Coefficient → taux", items: [
          { q: "Taux d'évolution (en %) associé à $\\times 1{,}35$", answer: "35", explanation: "$(1{,}35 - 1) \\times 100 = 35$ : hausse de $35\\,\\%$." },
          { q: "Taux d'évolution (en %) associé à $\\times 0{,}85$", answer: "-15", explanation: "$(0{,}85 - 1) \\times 100 = -15$ : baisse de $15\\,\\%$." },
          { q: "Taux d'évolution (en %) associé à $\\times 1{,}02$", answer: "2", explanation: "$(1{,}02 - 1) \\times 100 = 2$." },
          { q: "Taux d'évolution (en %) associé à $\\times 0{,}4$", answer: "-60", explanation: "$(0{,}4 - 1) \\times 100 = -60$." },
          { q: "Taux d'évolution (en %) associé à $\\times 3$", answer: "200", explanation: "$(3 - 1) \\times 100 = 200$ : tripler, c'est augmenter de $200\\,\\%$." },
          { q: "Taux global (en %) de $+10\\,\\%$ puis $-10\\,\\%$", answer: "-1", explanation: "$1{,}1 \\times 0{,}9 = 0{,}99$ : baisse de $1\\,\\%$." },
          { q: "Taux global (en %) de $+20\\,\\%$ puis $+50\\,\\%$", answer: "80", explanation: "$1{,}2 \\times 1{,}5 = 1{,}8$ : hausse de $80\\,\\%$." },
        ] },
        { label: "Calculs de prix et de taux", items: [
          { q: "$20\\,\\%$ de $45$ €, en €", answer: "9", explanation: "$0{,}2 \\times 45 = 9$." },
          { q: "Prix de $80$ € après une baisse de $30\\,\\%$, en €", answer: "56", explanation: "$80 \\times 0{,}7 = 56$." },
          { q: "Prix de $60$ € après une hausse de $15\\,\\%$, en €", answer: "69", explanation: "$60 \\times 1{,}15 = 69$." },
          { q: "Prix avant une hausse de $25\\,\\%$ si le prix est maintenant $50$ €, en €", answer: "40", explanation: "$50 \\div 1{,}25 = 40$." },
          { q: "Prix avant une remise de $50\\,\\%$ si l'on paie $35$ €, en €", answer: "70", explanation: "$35 \\div 0{,}5 = 70$." },
          { q: "Plus petite part (en €) quand on partage $60$ € selon le ratio $1 : 2$", answer: "20", explanation: "$60 \\div 3 = 20$." },
          { q: "Taux d'évolution (en %) d'un prix qui passe de $40$ € à $50$ €", answer: "25", explanation: "$\\dfrac{50 - 40}{40} \\times 100 = 25$." },
        ] },
      ] },
    },
    {
      id: "pct3-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs de pourcentages",
      objective: "Repérer les raisonnements faux les plus fréquents : additionner des taux, multiplier par le taux au lieu du coefficient, diviser par la mauvaise valeur.",
      instructions: "Pour chaque calcul, dis s'il est juste. S'il est faux, choisis l'erreur commise.",
      objectives: ["M3-OGDF-13", "M3-OGDF-13#B", "M3-OGDF-13#C", "M3-OGDF-13#D", "M4-OGDF-10"],
      config: { items: [
        { niveau: 1, calc: "Hausse de $15\\,\\%$ : $\\times 1{,}15$", correct: true, explanation: "$1 + 0{,}15 = 1{,}15$." },
        { niveau: 1, calc: "Baisse de $5\\,\\%$ : $\\times 0{,}5$", correct: false, errors: ["$5\\,\\% = 0{,}05$ : le coefficient est $0{,}95$", "Une baisse se calcule par une division", "Il fallait multiplier par $1{,}05$"], error: 0, explanation: "$1 - 0{,}05 = 0{,}95$ ; $\\times 0{,}5$ correspond à une baisse de $50\\,\\%$." },
        { niveau: 1, calc: "Prix de $30$ € après une hausse de $20\\,\\%$ : $30 \\times 0{,}2 = 6$ €", correct: false, errors: ["$6$ € est le montant de la hausse : le nouveau prix est $36$ €", "Il fallait calculer $30 + 20$", "Il fallait diviser par $0{,}2$"], error: 0, explanation: "$30 \\times 1{,}2 = 36$ €." },
        { niveau: 2, calc: "Taux d'évolution de $40$ à $50$ : $\\dfrac{10}{50} = 20\\,\\%$", correct: false, errors: ["On divise par la valeur initiale : $\\dfrac{10}{40} = 25\\,\\%$", "Il fallait calculer $50 - 40 = 10\\,\\%$", "Il fallait diviser $40$ par $50$"], error: 0, explanation: "Taux $= \\dfrac{50 - 40}{40} \\times 100 = 25\\,\\%$." },
        { niveau: 2, calc: "$\\times 0{,}88$ : baisse de $12\\,\\%$", correct: true, explanation: "$(0{,}88 - 1) \\times 100 = -12$." },
        { niveau: 2, calc: "Ratio $2 : 3$ : la première part représente $\\dfrac{2}{3}$ du total", correct: false, errors: ["Le total compte $2 + 3 = 5$ parts : c'est $\\dfrac{2}{5}$", "C'est $\\dfrac{3}{2}$ du total", "C'est $23\\,\\%$ du total"], error: 0, explanation: "$\\dfrac{2}{5} = 40\\,\\%$." },
        { niveau: 3, calc: "$+10\\,\\%$ puis $+20\\,\\%$ : $+30\\,\\%$", correct: false, errors: ["Les taux ne s'additionnent pas : $1{,}1 \\times 1{,}2 = 1{,}32$, soit $+32\\,\\%$", "Il fallait faire $1{,}1 + 1{,}2 = 2{,}3$", "C'est $+2\\,\\%$ car $10 \\times 20 = 200$"], error: 0, explanation: "Coefficient global $1{,}32$ : hausse de $32\\,\\%$." },
        { niveau: 3, calc: "$+25\\,\\%$ puis $-20\\,\\%$ : le prix revient à sa valeur initiale", correct: true, explanation: "$1{,}25 \\times 0{,}8 = 1$." },
        { niveau: 3, calc: "Avant une hausse de $25\\,\\%$, un prix de $75$ € valait $75 \\times 0{,}75 = 56{,}25$ €", correct: false, errors: ["Il faut diviser par le coefficient : $75 \\div 1{,}25 = 60$ €", "Il fallait calculer $75 - 25 = 50$ €", "Il fallait multiplier par $1{,}25$"], error: 0, explanation: "$60 \\times 1{,}25 = 75$ : l'ancien prix était $60$ €." },
        { niveau: 4, calc: "$+50\\,\\%$ puis $-50\\,\\%$ : baisse globale de $25\\,\\%$", correct: true, explanation: "$1{,}5 \\times 0{,}5 = 0{,}75$." },
        { niveau: 4, calc: "Une population augmente de $2\\,\\%$ par an pendant $3$ ans : $\\times 1{,}06$", correct: false, errors: ["On multiplie trois fois : $1{,}02^3 \\approx 1{,}0612$", "C'est $\\times 1{,}02 \\times 3$", "C'est $\\times 1{,}2$"], error: 0, explanation: "$1{,}02 \\times 1{,}02 \\times 1{,}02 \\approx 1{,}0612$ : un peu plus de $6\\,\\%$." },
        { niveau: 4, calc: "Pour compenser une baisse de $20\\,\\%$, il faut une hausse de $20\\,\\%$", correct: false, errors: ["Il faut $\\times \\dfrac{1}{0{,}8} = 1{,}25$ : une hausse de $25\\,\\%$", "Il faut une baisse de $20\\,\\%$", "Il est impossible de compenser cette baisse"], error: 0, explanation: "$0{,}8 \\times 1{,}25 = 1$." },
      ] },
    },
    {
      id: "pct3-jeu-memory", template: "memory", title: "Memory des évolutions",
      objective: "Associer rapidement une évolution en pourcentage et son coefficient multiplicateur, y compris pour des évolutions successives.",
      instructions: "Retourne deux cartes : si une évolution et son coefficient multiplicateur vont ensemble, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
      objectives: ["M3-OGDF-13", "M3-OGDF-13#D"],
      config: { pairs: [
        ["Hausse de $7\\,\\%$", "$\\times 1{,}07$"],
        ["Baisse de $30\\,\\%$", "$\\times 0{,}7$"],
        ["Hausse de $70\\,\\%$", "$\\times 1{,}7$"],
        ["Baisse de $3\\,\\%$", "$\\times 0{,}97$"],
        ["$+10\\,\\%$ puis $-10\\,\\%$", "$\\times 0{,}99$"],
        ["Hausse de $100\\,\\%$", "$\\times 2$"],
        ["$-25\\,\\%$ puis $+20\\,\\%$", "$\\times 0{,}9$"],
      ] },
    },
  ],
  reviewStatus: { curriculum: "pass", accuracy: "pass", exercises: "pass", games: "pass", technical: "pass", language: "pass" },
  publicationStatus: "published",
};
