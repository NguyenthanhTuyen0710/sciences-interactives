// SCI-4E-PC-007 — Physique-chimie 4e : Électricité (intensité, tension et loi d'Ohm).
// Programme du cycle 4 (BO n° 31 du 30 juillet 2020), « Exploiter les lois de l'électricité » (p. 103).
// Contenu original rédigé à partir du dossier research/dossiers/pc-4e-electricite.md.
// Hors chapitre : puissance et énergie électriques (3e). Les valeurs numériques sont fictives (non issues de mesures réelles).
// P4-E-04 (influence d'une résistance) est un approfondissement tiré d'un document d'accompagnement non prescriptif.
import type { ChapterContent, ChapterExercise, ChapterPart } from "../schema";
import type { Mistake, NumAnswer, Rng } from "../../engine/types";
import { parseNumber, tex } from "../../engine/numbers";
import { flashConfig, erreursConfig } from "../../games/logic";

// <pipeline:meta> générée par pipeline/run.ts depuis la fiche et l'inventaire — ne pas modifier à la main
const META = {
  "id": "pc-4e-electricite",
  "taskId": "SCI-4E-PC-007",
  "grade": "4e",
  "subject": "physique-chimie",
  "treeChapterId": "p4-electricite",
  "curriculumChapterIds": [
    "pc-4e-lois-electricite",
    "pc-3e-puissance-energie-electrique",
    "pc-5e-circuits-electriques"
  ],
  "curriculumVersion": "2026-2027",
  "title": "Électricité : intensité, tension et loi d'Ohm",
  "officialObjectives": [
    {
      "id": "P4-E-01",
      "text": "Élaborer et réaliser un protocole pour vérifier une loi de l'électricité.",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité"
    },
    {
      "id": "P4-E-02",
      "text": "Exploiter l'unicité de l'intensité dans un circuit série et l'additivité des intensités (circuit à deux mailles).",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité"
    },
    {
      "id": "P4-E-03",
      "text": "Exploiter l'additivité des tensions (une maille) et l'unicité des tensions (dérivation).",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité"
    },
    {
      "id": "P4-E-04",
      "text": "Étudier l'influence d'une résistance dans un circuit.",
      "source": "Éduscol (juin 2016), Aide à la construction d'une progression en PC au cycle 4 – niveau 4e (document d'accompagnement non prescriptif, pas un texte du BO)",
      "required": false
    },
    {
      "id": "P3-E-07",
      "text": "Exploiter la relation tension-courant : loi d'Ohm.",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité"
    },
    {
      "id": "P3-E-10",
      "text": "Mettre en relation les lois de l'électricité et les règles de sécurité électrique.",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité"
    },
    {
      "id": "P5-E-04",
      "text": "Élaborer et réaliser un circuit électrique répondant à un cahier des charges simple.",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité (consolidation)",
      "required": false
    },
    {
      "id": "P5-E-05",
      "text": "Distinguer dipôles en série et dipôles en dérivation.",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Réaliser des circuits électriques simples et exploiter les lois de l'électricité (consolidation)",
      "required": false
    },
    {
      "id": "P5-E-06",
      "text": "Aborder qualitativement le courant et la tension (premières mesures à l'ampèremètre et au voltmètre).",
      "source": "BO n°31 du 30/07/2020, annexe 3, Physique-chimie cycle 4 – L'énergie, ses transferts et ses conversions – Repères de progressivité (consolidation)",
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
const rd = (x: number, d = 3) => { const k = 10 ** d; return Math.round(x * k) / k; };
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;
/** Grandeur avec unité (valeur exacte, virgule décimale française). */
const u = (x: number, unit: string) => `$${T(x)}\\ \\mathrm{${unit}}$`;
/** Valeur de mesure : nombre de décimales conservé (chiffres significatifs). */
const m1 = (x: number, unit: string) => `$${x.toFixed(1).replace(".", "{,}")}\\ \\mathrm{${unit}}$`;
const m2 = (x: number, unit: string) => `$${x.toFixed(2).replace(".", "{,}")}\\ \\mathrm{${unit}}$`;

const clean = (value: number, ms: Mistake[]) => {
  const kept: Mistake[] = [];
  const seen: number[] = [];
  for (const m of ms) {
    const v = parseNumber(m.match)?.value;
    if (v === undefined) { kept.push(m); continue; }
    if (close(v, value) || seen.some((s) => close(s, v))) continue;
    seen.push(v);
    kept.push(m);
  }
  return kept;
};
/** Réponse numérique avec son unité (suffix). */
const num = (value: number, suffix: string, mistakes: Mistake[] = [], prompt?: string, extra: Partial<NumAnswer> = {}): ChapterPart => ({ prompt, interaction: { kind: "numerique", suffix, answer: { value, ...extra } }, mistakes: clean(value, mistakes) });
/** Réponse numérique où l'élève choisit l'unité (A ou mA), valeur exprimée en ampères. */
const numA = (value: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "numerique", answer: { value, unit: { base: "A", choices: ["A", "mA"] } } }, mistakes: clean(value, mistakes) });
const qcm = (options: string[], answer: number, mistakes: Mistake[] = [], prompt?: string): ChapterPart => ({ prompt, interaction: { kind: "qcm", options, answer: [answer] }, mistakes });
function shuffledQcm(rng: Rng, options: string[], answer: number, diag: Record<number, string> = {}, prompt?: string): ChapterPart {
  const order = rng.shuffle(options.map((_, i) => i));
  return qcm(order.map((i) => options[i]), order.indexOf(answer), Object.entries(diag).map(([i, feedback]) => ({ match: String(order.indexOf(Number(i))), feedback })), prompt);
}

type Obj = "P4-E-01" | "P4-E-02" | "P4-E-03" | "P4-E-04" | "P3-E-07" | "P3-E-10";
const ex = (e: Omit<ChapterExercise, "objectives"> & { objectives: Obj[] }): ChapterExercise => e;
const FICTIF = "(valeurs fictives choisies pour l'exercice)";

const EXERCISES: ChapterExercise[] = [
  // ── Niveau 1 : Découverte ──
  ex({
    id: "el4-01", title: "Série ou dérivation ?", niveau: 1, objectives: ["P4-E-02", "P4-E-03"], time: 90,
    statement: "Classe chaque description : correspond-elle à des dipôles **en série** ou **en dérivation** ?",
    parts: [{ interaction: { kind: "classer", categories: ["Série", "Dérivation"], items: ["Deux lampes parcourues par le même courant, sur un seul chemin.", "Deux lampes dont les bornes sont reliées aux mêmes deux nœuds.", "Si on dévisse l'une des deux lampes, l'autre s'éteint aussi.", "Le courant se partage en arrivant à un nœud.", "Un voltmètre branché aux bornes d'un dipôle.", "Un ampèremètre placé dans la branche étudiée."], answer: [0, 1, 0, 1, 1, 0] } }],
    solution: ["Série : un seul chemin pour le courant, donc des dipôles qui se suivent (et un ampèremètre qui s'intercale).", "Dérivation : les dipôles ont leurs bornes reliées aux mêmes nœuds ; le courant se partage au nœud. Le voltmètre se branche ainsi."],
    reasoning: "En série, le courant n'a qu'un seul chemin. En dérivation, il se partage entre plusieurs branches.",
    hints: ["Demande-toi : le courant a-t-il un seul chemin ou plusieurs ?", "Un nœud est un point où se rejoignent au moins trois fils."],
  }),
  ex({
    id: "el4-02", title: "Grandeurs, unités et symboles", niveau: 1, objectives: ["P4-E-01"], time: 90,
    statement: "Associe chaque grandeur électrique à son unité du Système international.",
    parts: [{ interaction: { kind: "associer", left: ["Intensité du courant $I$", "Tension électrique $U$", "Résistance $R$"], right: ["ohm ($\\Omega$)", "ampère (A)", "volt (V)"], answer: [1, 2, 0] } }],
    solution: ["L'intensité $I$ se mesure en ampères (A), avec un ampèremètre.", "La tension $U$ se mesure en volts (V), avec un voltmètre.", "La résistance $R$ se mesure en ohms ($\\Omega$)."],
    reasoning: "Chaque grandeur a une unité et un appareil de mesure associés.",
    hints: ["L'ampèremètre mesure une intensité.", "Le voltmètre mesure une tension."],
  }),
  ex({
    id: "el4-03", title: "Où placer l'ampèremètre ?", niveau: 1, objectives: ["P4-E-01"], time: 60,
    vary: (rng) => ({
      statement: "Tu veux mesurer l'intensité du courant qui traverse la lampe $L_1$. Comment places-tu l'ampèremètre ?",
      parts: [shuffledQcm(rng, ["En série avec $L_1$, dans la même branche.", "En dérivation, aux bornes de $L_1$.", "En dérivation, aux bornes du générateur.", "N'importe où : sa position n'a pas d'importance."], 0, { 1: "Cette position est celle d'un voltmètre. Un ampèremètre en dérivation provoque presque un court-circuit.", 2: "En dérivation, un ampèremètre court-circuite le générateur : danger.", 3: "Un ampèremètre mesure le courant qui le traverse : il doit être dans la branche étudiée." })],
      solution: ["Un ampèremètre mesure le courant qui le **traverse** : on l'insère **en série** dans la branche étudiée.", "On relie la borne COM et la borne du calibre adapté (le plus élevé d'abord)."],
    }),
    reasoning: "Pour mesurer un courant, l'appareil doit être traversé par ce courant : il se place en série.",
    hints: ["Le courant doit traverser l'appareil.", "Pense au sens « mettre l'appareil sur le trajet du courant »."],
  }),
  ex({
    id: "el4-04", title: "Les lois : vrai ou faux ?", niveau: 1, objectives: ["P4-E-02", "P4-E-03"], time: 120,
    statement: "Pour chaque affirmation, dis si elle est vraie ou fausse.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["Dans un circuit en série, l'intensité est la même en tout point : $I = I_1 = I_2$.", "À un nœud, l'intensité dans la branche principale est $I = I_1 + I_2$.", "Dans une boucle en série, la tension du générateur est la somme des tensions aux bornes des dipôles.", "Pour des dipôles en dérivation, $U = U_1 + U_2$.", "Dans un circuit en série, $I = I_1 + I_2$."], answer: [true, true, true, false, false] }, mistakes: [] }],
    solution: ["Vrai : un seul chemin, donc la même intensité partout.", "Vrai : le courant de la branche principale se partage entre les deux branches.", "Vrai : additivité des tensions dans une maille.", "Faux : en dérivation, la tension est la **même** aux bornes de chaque branche, $U = U_1 = U_2$.", "Faux : l'addition des intensités ne concerne que les branches en dérivation."],
    reasoning: "Les intensités s'additionnent aux nœuds (dérivation), les tensions s'additionnent dans une maille (série).",
    hints: ["Série : un seul chemin pour le courant.", "Dérivation : les branches sont soumises à la même tension."],
  }),
  ex({
    id: "el4-05", title: "Règles de sécurité", niveau: 1, objectives: ["P3-E-10"], time: 90,
    statement: "Vrai ou faux ? À l'école, tu réalises des montages avec un générateur de $0$ à $12\\ \\mathrm{V}$.",
    parts: [{ interaction: { kind: "vrai-faux", items: ["On peut relier directement les deux bornes d'un générateur par un fil.", "On coupe le circuit avant de modifier un branchement.", "On commence une mesure avec le calibre le plus élevé de l'appareil.", "Pour les montages d'élève, on utilise la prise du secteur.", "On touche un fil dénudé pour vérifier s'il est sous tension."], answer: [false, true, true, false, false] } }],
    solution: ["Faux : c'est un court-circuit, l'intensité devient très grande et les fils chauffent.", "Vrai : on évite ainsi les erreurs de branchement sous tension.", "Vrai : cela protège l'appareil d'une surcharge.", "Faux : le secteur est dangereux ; on utilise un générateur basse tension.", "Faux : ne jamais toucher les parties métalliques sous tension ; signaler tout fil abîmé."],
    reasoning: "Les règles de sécurité découlent des lois de l'électricité : une intensité trop grande est dangereuse. Le règlement de ton établissement prévaut toujours.",
    hints: ["Pense à ce qui se passe quand l'intensité est très grande.", "Une manipulation se prépare générateur éteint."],
  }),
  ex({
    id: "el4-06", title: "Convertir des milliampères en ampères", niveau: 1, objectives: ["P3-E-07"], time: 75,
    vary: (rng) => {
      const mA = rng.pick([50, 80, 120, 150, 200, 250, 300, 450, 600, 800]);
      const A = rd(mA / 1000, 3);
      return {
        statement: `Un ampèremètre indique ${u(mA, "mA")} pour le courant traversant une lampe. Exprime cette intensité en ampères.`,
        parts: [num(A, "A", [{ match: String(mA), feedback: "Tu n'as pas converti : $1\\ \\mathrm{mA} = 0{,}001\\ \\mathrm{A}$." }, { match: String(rd(mA / 100, 2)), feedback: "Tu as divisé par $100$ au lieu de $1\\,000$." }])],
        solution: [`$1\\ \\mathrm{A} = 1\\,000\\ \\mathrm{mA}$, donc on divise par $1\\,000$.`, `$${mA}\\ \\mathrm{mA} = ${mA} \\div 1\\,000\\ \\mathrm{A} = ${T(A)}\\ \\mathrm{A}$.`],
      };
    },
    reasoning: "Avant tout calcul avec la loi d'Ohm, on convertit les milliampères en ampères.",
    hints: ["Combien de milliampères dans un ampère ?", "Passer à une unité plus grande : le nombre devient plus petit."],
  }),
  // ── Niveau 2 : Application directe ──
  ex({
    id: "el4-07", title: "Unicité de l'intensité en série", niveau: 2, objectives: ["P4-E-02"], time: 75,
    vary: (rng) => {
      const i1 = rng.int(5, 90) / 100;
      return {
        statement: `Deux lampes $L_1$ et $L_2$ sont en série avec un générateur. L'ampèremètre $A_1$, placé entre le générateur et $L_1$, indique $I_1 = ${i1.toFixed(2).replace(".", "{,}")}\\ \\mathrm{A}$. Que indique l'ampèremètre $A_2$ placé entre $L_1$ et $L_2$ ?`.replace("Que indique", "Qu'indique"),
        parts: [num(i1, "A", [{ match: String(rd(2 * i1, 2)), feedback: "Tu as additionné : en série, il n'y a qu'un seul chemin, donc pas d'addition des intensités." }, { match: String(rd(i1 / 2, 3)), feedback: "L'intensité ne se partage pas dans un circuit en série." }], "Indication de $A_2$")],
        solution: ["Les deux lampes sont en série : le courant n'a qu'un seul chemin.", `L'intensité est la même en tout point : $I_2 = I_1 = ${T(i1)}\\ \\mathrm{A}$.`],
      };
    },
    reasoning: "Unicité de l'intensité en série : $I = I_1 = I_2$.",
    hints: ["Combien de chemins le courant a-t-il ?", "Que devient l'intensité après avoir traversé une lampe ?"],
  }),
  ex({
    id: "el4-08", title: "Additivité des intensités", niveau: 2, objectives: ["P4-E-02"], time: 90,
    vary: (rng) => {
      const a = rng.int(10, 45), b = rng.int(10, 45);
      const i1 = a / 100, i2 = b / 100, s = rd(i1 + i2, 2);
      return {
        statement: `Un générateur alimente deux branches en dérivation. Dans la branche de $L_1$, l'ampèremètre indique $I_1 = ${m2(i1, "A")}$ ; dans celle de $L_2$, $I_2 = ${m2(i2, "A")}$. Quelle intensité $I$ traverse la branche principale ?`,
        parts: [num(s, "A", [{ match: String(rd(Math.abs(i1 - i2), 2)), feedback: "On additionne les intensités des branches, on ne les soustrait pas." }, { match: String(i1), feedback: "Il faut ajouter l'intensité de l'autre branche." }], "Intensité $I$", { sigFigs: 2 })],
        solution: ["Le courant de la branche principale se partage entre les deux branches au nœud : $I = I_1 + I_2$.", `$I = ${i1.toFixed(2).replace(".", ",")} + ${i2.toFixed(2).replace(".", ",")} = ${s.toFixed(2).replace(".", ",")}\\ \\mathrm{A}$ (deux chiffres significatifs, comme les données).`],
      };
    },
    reasoning: "Additivité des intensités : $I = I_1 + I_2$ (A).",
    hints: ["Le courant de la branche principale se partage au nœud.", "Les données ont deux chiffres significatifs : garde-en deux."],
  }),
  ex({
    id: "el4-09", title: "Intensité dans une branche", niveau: 2, objectives: ["P4-E-02"], time: 90,
    vary: (rng) => {
      const I = rng.int(30, 90), a = rng.int(10, I - 10);
      const i2 = rd((I - a) / 100, 2);
      return {
        statement: `Dans un circuit à deux branches, l'ampèremètre de la branche principale indique $I = ${m2(I / 100, "A")}$ et celui de la branche de $L_1$ indique $I_1 = ${m2(a / 100, "A")}$. Quelle est l'intensité $I_2$ dans la branche de $L_2$ ?`,
        parts: [num(i2, "A", [{ match: String(rd((I + a) / 100, 2)), feedback: "Tu as additionné $I$ et $I_1$ : c'est $I$ qui est la somme de $I_1$ et $I_2$." }], "Intensité $I_2$", { sigFigs: 2 })],
        solution: ["$I = I_1 + I_2$, donc $I_2 = I - I_1$.", `$I_2 = ${(I / 100).toFixed(2).replace(".", ",")} - ${(a / 100).toFixed(2).replace(".", ",")} = ${i2.toFixed(2).replace(".", ",")}\\ \\mathrm{A}$.`],
      };
    },
    reasoning: "On retranche l'intensité connue de l'intensité totale.",
    hints: ["Écris la loi du nœud avec les trois intensités.", "Isole $I_2$."],
  }),
  ex({
    id: "el4-10", title: "Additivité des tensions", niveau: 2, objectives: ["P4-E-03"], time: 90,
    vary: (rng) => {
      const U = rng.pick([6, 9, 12]), U1 = rng.int(10, U * 10 - 10) / 10, U2 = rd(U - U1, 1);
      return {
        statement: `Deux lampes $L_1$ et $L_2$ sont en série aux bornes d'un générateur qui délivre $U = ${U}\\ \\mathrm{V}$. Un voltmètre aux bornes de $L_1$ indique $U_1 = ${T(U1)}\\ \\mathrm{V}$. Quelle tension $U_2$ y a-t-il aux bornes de $L_2$ ?`,
        parts: [num(U2, "V", [{ match: String(U1), feedback: "Les tensions des deux lampes ne sont pas égales : elles s'additionnent pour donner $U$." }, { match: String(rd(U + U1, 1)), feedback: "On retranche $U_1$ à $U$, on ne l'ajoute pas." }], "Tension $U_2$")],
        solution: ["Dans une maille, $U = U_1 + U_2$.", `$U_2 = U - U_1 = ${U} - ${T(U1)} = ${T(U2)}\\ \\mathrm{V}$.`],
      };
    },
    reasoning: "Additivité des tensions dans un circuit à une seule maille.",
    hints: ["La tension du générateur se répartit entre les deux lampes.", "Isole $U_2$ dans $U = U_1 + U_2$."],
  }),
  ex({
    id: "el4-11", title: "Unicité des tensions en dérivation", niveau: 2, objectives: ["P4-E-03"], time: 75,
    vary: (rng) => {
      const U = rng.pick([3, 4.5, 6, 9, 12]);
      return {
        statement: `Deux lampes sont montées en dérivation aux bornes d'un générateur. Un voltmètre aux bornes du générateur indique $U = ${T(U)}\\ \\mathrm{V}$. Quelle tension indique un voltmètre placé aux bornes de $L_2$ ?`,
        parts: [num(U, "V", [{ match: String(2 * U), feedback: "En dérivation, les tensions ne s'additionnent pas." }, { match: String(rd(U / 2, 2)), feedback: "La tension ne se partage pas entre des branches en dérivation." }])],
        solution: ["Les branches sont en dérivation : elles ont les mêmes deux bornes que le générateur.", `$U = U_1 = U_2 = ${T(U)}\\ \\mathrm{V}$.`],
      };
    },
    reasoning: "Unicité des tensions en dérivation : $U = U_1 = U_2$.",
    hints: ["Les deux lampes sont reliées aux mêmes deux nœuds.", "Que vaut la tension entre deux mêmes points ?"],
  }),
  ex({
    id: "el4-12", title: "Quelle loi utiliser ?", niveau: 2, objectives: ["P4-E-02", "P4-E-03"], time: 120,
    statement: "Associe chaque situation à la loi qui permet de conclure.",
    parts: [{ interaction: { kind: "classer", categories: ["$I = I_1 = I_2$", "$I = I_1 + I_2$", "$U = U_1 + U_2$", "$U = U_1 = U_2$"], items: ["Tension aux bornes de deux lampes en dérivation.", "Intensité de la branche principale, avant deux branches en dérivation.", "Intensités mesurées en trois points d'un circuit en série.", "Tension du générateur et tensions aux bornes de deux lampes en série."], answer: [3, 1, 0, 2] } }],
    solution: ["Deux lampes en dérivation : même tension, $U = U_1 = U_2$.", "Branche principale : $I = I_1 + I_2$ (nœud).", "Série : l'intensité est la même partout, $I = I_1 = I_2$.", "Boucle en série : $U = U_1 + U_2$."],
    reasoning: "Intensité : égale en série, additive au nœud. Tension : additive dans une maille, égale en dérivation.",
    hints: ["Repère d'abord s'il s'agit d'une intensité ou d'une tension.", "Puis repère série ou dérivation."],
  }),
  ex({
    id: "el4-13", title: "Trois ampèremètres en série", niveau: 2, objectives: ["P4-E-02"], time: 90,
    vary: (rng) => {
      const i = rng.int(10, 60) / 100;
      const s = i.toFixed(2).replace(".", ",");
      return {
        statement: `Trois ampèremètres sont placés en série dans un circuit comportant deux lampes. $A_1$ indique $${s}\\ \\mathrm{A}$. Complète le tableau (intensités en ampères).`,
        parts: [{ interaction: { kind: "tableau", headers: ["Ampèremètre", "$A_1$", "$A_2$", "$A_3$"], rows: [{ label: "Position", cells: ["avant $L_1$", "entre $L_1$ et $L_2$", "après $L_2$"] }, { label: "$I$ (A)", cells: [s, { answer: { value: i } }, { answer: { value: i } }] }] } }],
        solution: ["Les trois appareils sont en série : le courant a un seul chemin.", `Les trois indiquent la même valeur : $${s}\\ \\mathrm{A}$.`],
      };
    },
    reasoning: "L'intensité n'est « consommée » par aucune lampe : elle est la même en tout point du circuit série.",
    hints: ["Une lampe « use »-t-elle le courant ?", "Un seul chemin : une seule valeur."],
  }),
  ex({
    id: "el4-14", title: "Un ampèremètre mal branché", niveau: 2, objectives: ["P4-E-01", "P3-E-10"], time: 90,
    vary: (rng) => ({
      statement: "Un élève branche l'ampèremètre **en dérivation**, directement aux bornes d'une lampe. Que se passe-t-il ?",
      parts: [shuffledQcm(rng, ["L'ampèremètre se comporte presque comme un fil : il court-circuite la lampe, l'intensité devient grande et l'appareil peut être endommagé.", "Il mesure correctement l'intensité dans la lampe.", "Il mesure la tension aux bornes de la lampe.", "Rien ne change dans le circuit."], 0, { 1: "Un ampèremètre mesure bien l'intensité, mais seulement s'il est en série.", 2: "La tension se mesure avec un voltmètre.", 3: "La résistance de l'ampèremètre est très faible : il modifie le circuit." })],
      solution: ["Un ampèremètre a une résistance très faible.", "En dérivation, il laisse passer une très grande intensité : presque un court-circuit.", "Règle : ampèremètre **en série**, voltmètre **en dérivation**."],
    }),
    reasoning: "Les rôles de l'ampèremètre (série) et du voltmètre (dérivation) ne sont pas interchangeables.",
    hints: ["L'ampèremètre est-il conçu pour s'opposer au courant ?", "Pense au court-circuit."],
  }),
  // ── Niveau 3 : Entraînement ──
  ex({
    id: "el4-15", title: "Calculer une tension : $U = R \\times I$", niveau: 3, objectives: ["P3-E-07"], time: 120,
    vary: (rng) => {
      let R = 0, im = 0, U = 0;
      do { R = rng.pick([10, 15, 20, 22, 33, 47, 100, 150, 220]); im = rng.pick([20, 30, 40, 50, 60, 80, 100, 150, 200, 300]); U = rd(R * im / 1000, 3); } while (U < 1 || U > 12);
      return {
        statement: `Un conducteur ohmique de résistance $R = ${R}\\ \\Omega$ est traversé par un courant d'intensité $I = ${im}\\ \\mathrm{mA}$. Calcule la tension $U$ à ses bornes. ${FICTIF}`,
        parts: [num(U, "V", [{ match: String(R * im), feedback: "Tu n'as pas converti les mA en A avant de multiplier." }, { match: String(rd(R / (im / 1000), 2)), feedback: "On multiplie $R$ par $I$ : $U = R \\times I$." }], "Tension $U$")],
        solution: [`Conversion : $I = ${im}\\ \\mathrm{mA} = ${T(im / 1000)}\\ \\mathrm{A}$.`, `Loi d'Ohm : $U = R \\times I = ${R} \\times ${T(im / 1000)} = ${T(U)}\\ \\mathrm{V}$.`],
      };
    },
    reasoning: "Loi d'Ohm avec $R$ en ohms et $I$ en ampères : $U$ est alors en volts.",
    hints: ["Convertis d'abord l'intensité en ampères.", "Écris la loi d'Ohm avant de remplacer les lettres par les valeurs."],
  }),
  ex({
    id: "el4-16", title: "Calculer une résistance : $R = U / I$", niveau: 3, objectives: ["P3-E-07"], time: 120,
    vary: (rng) => {
      let R = 0, i = 0, U = 0;
      do { R = rng.pick([10, 15, 20, 22, 33, 47, 56, 68, 100, 150, 220]); i = rng.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]); U = rd(R * i, 3); } while (U < 1 || U > 12);
      return {
        statement: `Un conducteur ohmique est soumis à une tension $U = ${T(U)}\\ \\mathrm{V}$ et traversé par un courant d'intensité $I = ${T(i)}\\ \\mathrm{A}$. Calcule sa résistance $R$. ${FICTIF}`,
        parts: [num(R, "Ω", [{ match: String(rd(U * i, 4)), feedback: "Tu as multiplié : $R = U \\times I$ est faux. La loi d'Ohm donne $R = U / I$." }, { match: String(rd(i / U, 4)), feedback: "Tu as inversé le quotient : $R = U / I$." }], "Résistance $R$")],
        solution: ["$U = R \\times I$ donc $R = \\dfrac{U}{I}$.", `$R = \\dfrac{${T(U)}}{${T(i)}} = ${R}\\ \\Omega$.`],
      };
    },
    reasoning: "On isole $R$ dans $U = R \\times I$ en divisant par $I$.",
    hints: ["Isole $R$ dans la loi d'Ohm.", "L'unité du résultat est l'ohm."],
  }),
  ex({
    id: "el4-17", title: "Calculer une intensité : $I = U / R$", niveau: 3, objectives: ["P3-E-07"], time: 150,
    vary: (rng) => {
      const U = rng.pick([3, 4.5, 6, 9, 12]), R = rng.pick([30, 60, 100, 120, 150, 200, 300]);
      const I = rd(U / R, 6);
      return {
        statement: `Un conducteur ohmique de résistance $R = ${R}\\ \\Omega$ est branché aux bornes d'un générateur qui délivre $U = ${T(U)}\\ \\mathrm{V}$. Calcule l'intensité $I$ qui le traverse. Choisis l'unité de ta réponse (A ou mA). ${FICTIF}`,
        parts: [numA(I, [{ match: String(rd(U * R, 2)), feedback: "Tu as multiplié $U$ par $R$ : il faut diviser." }, { match: String(rd(R / U, 4)), feedback: "Tu as inversé le quotient : $I = U / R$." }], "Intensité $I$")],
        solution: ["$U = R \\times I$ donc $I = \\dfrac{U}{R}$.", `$I = \\dfrac{${T(U)}}{${R}} = ${T(I)}\\ \\mathrm{A} = ${T(rd(I * 1000, 3))}\\ \\mathrm{mA}$.`],
      };
    },
    reasoning: "Avec $U$ en volts et $R$ en ohms, le quotient est une intensité en ampères.",
    hints: ["Isole $I$ dans la loi d'Ohm.", "Pense à l'ordre de grandeur : quelques dizaines de mA ou quelques centaines de mA."],
  }),
  ex({
    id: "el4-18", title: "Compléter un tableau de mesures", niveau: 3, objectives: ["P3-E-07"], time: 150,
    vary: (rng) => {
      const R = rng.pick([50, 100, 150, 200]), ims = [20, 40, 60];
      return {
        statement: `Un conducteur ohmique de résistance $R = ${R}\\ \\Omega$ est alimenté sous des tensions variables. Complète le tableau (tension en volts) en utilisant la loi d'Ohm. ${FICTIF}`,
        parts: [{ interaction: { kind: "tableau", headers: ["Mesure", "1", "2", "3"], rows: [{ label: "$I$ (mA)", cells: ims.map((v) => String(v)) }, { label: "$U$ (V)", cells: ims.map((v) => ({ answer: { value: rd(R * v / 1000, 3) } })) }] } }],
        solution: ims.map((v) => `$I = ${v}\\ \\mathrm{mA} = ${T(v / 1000)}\\ \\mathrm{A}$ : $U = ${R} \\times ${T(v / 1000)} = ${T(rd(R * v / 1000, 3))}\\ \\mathrm{V}$.`),
        figure: undefined,
      };
    },
    reasoning: "Quand $I$ double, $U$ double : la tension est proportionnelle à l'intensité pour un dipôle ohmique.",
    hints: ["Convertis chaque intensité en ampères.", "Utilise $U = R \\times I$ pour chaque colonne."],
  }),
  ex({
    id: "el4-19", title: "Résultat d'une mesure et chiffres significatifs", niveau: 3, objectives: ["P3-E-07", "P4-E-01"], time: 150,
    vary: (rng) => {
      let R = 0, i = 0, U = 0;
      do { R = rng.pick([12, 15, 18, 22, 27, 33, 39, 47]); i = rng.pick([0.1, 0.2, 0.4, 0.5]); U = rd(R * i, 1); } while (U > 12);
      return {
        statement: `Lors d'une manipulation (valeurs fictives), un voltmètre indique $U = ${m1(U, "V").slice(1, -1)}$ et un ampèremètre $I = ${m2(i, "A").slice(1, -1)}$ pour un conducteur ohmique. Calcule sa résistance $R$ avec le bon nombre de chiffres significatifs (celui de la donnée la moins précise).`.replace("$U = $", "$U = "),
        parts: [num(R, "Ω", [{ match: String(rd(U * i, 3)), feedback: "Tu as multiplié $U$ par $I$ : la loi d'Ohm donne $R = U / I$." }], "Résistance $R$", { sigFigs: 2 })],
        solution: [`$R = \\dfrac{U}{I} = \\dfrac{${U.toFixed(1).replace(".", ",")}}{${i.toFixed(2).replace(".", ",")}}$.`, `$R = ${R}\\ \\Omega$ (deux chiffres significatifs, comme $I$ qui s'écrit avec deux chiffres).`],
      };
    },
    reasoning: "Un résultat calculé à partir de mesures ne peut pas être plus précis que la mesure la moins précise.",
    hints: ["Écris $R$ en fonction de $U$ et $I$.", "Compte les chiffres significatifs des deux données."],
  }),
  ex({
    id: "el4-20", title: "Résistance en kiloohms", niveau: 3, objectives: ["P3-E-07"], time: 150,
    vary: (rng) => {
      const k = rng.pick([1, 2, 3, 4, 5, 6, 10]), U = rng.pick([6, 9, 12]);
      const mA = rd(U / k, 3), A = rd(mA / 1000, 6);
      return {
        statement: `Un conducteur ohmique de résistance $R = ${k}\\ \\mathrm{k\\Omega}$ est soumis à une tension $U = ${U}\\ \\mathrm{V}$. Calcule l'intensité $I$ (choisis l'unité A ou mA). ${FICTIF}`,
        parts: [numA(A, [{ match: String(rd(U / k, 3)), feedback: "Tu as oublié de convertir les kiloohms en ohms ($1\\ \\mathrm{k\\Omega} = 1\\,000\\ \\Omega$)." }], "Intensité $I$")],
        solution: [`$R = ${k}\\ \\mathrm{k\\Omega} = ${k * 1000}\\ \\Omega$.`, `$I = \\dfrac{U}{R} = \\dfrac{${U}}{${k * 1000}} = ${T(A)}\\ \\mathrm{A} = ${T(mA)}\\ \\mathrm{mA}$.`],
      };
    },
    reasoning: "On convertit $R$ en ohms avant de diviser. (Astuce : des volts divisés par des kiloohms donnent des milliampères.)",
    hints: ["Convertis $R$ en ohms.", "Divise ensuite $U$ par $R$."],
  }),
  ex({
    id: "el4-21", title: "La bonne écriture de la loi d'Ohm", niveau: 3, objectives: ["P3-E-07"], time: 60,
    vary: (rng) => ({
      statement: "Quelle relation est correcte pour un dipôle ohmique ($U$ en V, $R$ en $\\Omega$, $I$ en A) ?",
      parts: [shuffledQcm(rng, ["$U = R \\times I$", "$R = U \\times I$", "$I = R \\times U$", "$U = \\dfrac{R}{I}$"], 0, { 1: "Avec $U = R \\times I$ on obtient $R = U / I$, pas un produit.", 2: "On obtient $I = U / R$, pas un produit.", 3: "$R$ et $I$ se multiplient pour donner $U$." })],
      solution: ["La loi d'Ohm s'écrit $U = R \\times I$.", "On en déduit $R = \\dfrac{U}{I}$ et $I = \\dfrac{U}{R}$."],
    }),
    reasoning: "Un « triangle » $U$ / $R \\times I$ aide à retrouver les trois écritures.",
    hints: ["Plus $R$ est grande, plus $U$ est grande pour une même intensité.", "Vérifie avec les unités : $\\Omega \\times \\mathrm{A} = \\mathrm{V}$."],
  }),
  ex({
    id: "el4-22", title: "Remettre un calcul dans l'ordre", niveau: 3, objectives: ["P3-E-07"], time: 120,
    statement: "On veut calculer la résistance d'un conducteur ohmique soumis à $9\\ \\mathrm{V}$ et traversé par $150\\ \\mathrm{mA}$. Remets les étapes dans l'ordre.",
    parts: [{ interaction: { kind: "ordonner", items: ["On écrit la loi : $R = \\dfrac{U}{I}$.", "On lit les données : $U = 9\\ \\mathrm{V}$ et $I = 150\\ \\mathrm{mA}$.", "On conclut : $R = 60\\ \\Omega$.", "On convertit : $I = 0{,}150\\ \\mathrm{A}$."], answer: [1, 3, 0, 2], hint: "Première étape en haut" } }],
    solution: ["On lit les données : $U = 9\\ \\mathrm{V}$ et $I = 150\\ \\mathrm{mA}$.", "On convertit : $I = 0{,}150\\ \\mathrm{A}$.", "On écrit la loi : $R = \\dfrac{U}{I}$, soit $R = \\dfrac{9}{0{,}150}$.", "On conclut : $R = 60\\ \\Omega$."],
    reasoning: "Méthode : données, conversions, formule, calcul, conclusion avec l'unité.",
    hints: ["Commence par relever les données.", "La conversion se fait avant le calcul."],
  }),
  // ── Niveau 4 : Problèmes ──
  ex({
    id: "el4-23", title: "Circuit à deux mailles", niveau: 4, objectives: ["P4-E-02", "P4-E-03"], time: 180,
    vary: (rng) => {
      const U = rng.pick([6, 9, 12]), a = rng.int(10, 45), b = rng.int(10, 45);
      const i1 = a / 100, i2 = b / 100, I = rd(i1 + i2, 2);
      return {
        statement: `Un générateur de $${U}\\ \\mathrm{V}$ alimente deux lampes $L_1$ et $L_2$ montées en dérivation. L'ampèremètre de la branche principale indique $I = ${m2(I, "A")}$ ; celui de la branche de $L_2$ indique $I_2 = ${m2(i2, "A")}$.`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Intensité $I_1$ dans la branche de $L_1$", answer: { value: i1 }, suffix: "A" }, { prompt: "Tension aux bornes de $L_1$", answer: { value: U }, suffix: "V" }] } }],
        solution: [`Au nœud, $I = I_1 + I_2$ donc $I_1 = I - I_2 = ${I.toFixed(2).replace(".", ",")} - ${i2.toFixed(2).replace(".", ",")} = ${i1.toFixed(2).replace(".", ",")}\\ \\mathrm{A}$.`, `Les lampes sont en dérivation : $U_1 = U_2 = U = ${U}\\ \\mathrm{V}$.`],
      };
    },
    reasoning: "On combine la loi des nœuds (intensités) et l'unicité des tensions en dérivation.",
    hints: ["Quelle loi relie $I$, $I_1$ et $I_2$ ?", "Les deux lampes ont-elles la même tension à leurs bornes ?"],
  }),
  ex({
    id: "el4-24", title: "Deux conducteurs ohmiques en série", niveau: 4, objectives: ["P4-E-03", "P3-E-07"], time: 210,
    vary: (rng) => {
      let R1 = 0, R2 = 0, im = 0, U = 0;
      do { R1 = rng.pick([10, 20, 30, 47, 100, 150, 220]); R2 = rng.pick([10, 20, 30, 47, 100, 150, 220]); im = rng.pick([20, 30, 40, 50, 60, 80, 100]); U = rd((R1 + R2) * im / 1000, 3); } while (R1 === R2 || U < 3 || U > 12);
      const U1 = rd(R1 * im / 1000, 3), U2 = rd(R2 * im / 1000, 3);
      return {
        statement: `Deux conducteurs ohmiques $R_1 = ${R1}\\ \\Omega$ et $R_2 = ${R2}\\ \\Omega$ sont en série avec un générateur. L'intensité du courant vaut $I = ${im}\\ \\mathrm{mA}$. ${FICTIF}`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: "Tension $U_1$ aux bornes de $R_1$", answer: { value: U1 }, suffix: "V" }, { prompt: "Tension $U_2$ aux bornes de $R_2$", answer: { value: U2 }, suffix: "V" }, { prompt: "Tension $U$ du générateur", answer: { value: U }, suffix: "V" }] } }],
        solution: [`$I = ${im}\\ \\mathrm{mA} = ${T(im / 1000)}\\ \\mathrm{A}$ (même intensité dans les deux dipôles, car ils sont en série).`, `$U_1 = R_1 \\times I = ${R1} \\times ${T(im / 1000)} = ${T(U1)}\\ \\mathrm{V}$ et $U_2 = R_2 \\times I = ${T(U2)}\\ \\mathrm{V}$.`, `Additivité des tensions : $U = U_1 + U_2 = ${T(U)}\\ \\mathrm{V}$.`],
      };
    },
    reasoning: "On applique la loi d'Ohm à chaque dipôle puis l'additivité des tensions.",
    hints: ["Le même courant traverse les deux conducteurs.", "Calcule chaque tension avec $U = R \\times I$ puis additionne."],
  }),
  ex({
    id: "el4-25", title: "Protocole de vérification d'une loi", niveau: 4, objectives: ["P4-E-01"], time: 150,
    statement: "Tu veux vérifier une loi de l'électricité par une expérience. Remets les étapes du protocole dans l'ordre.",
    parts: [{ interaction: { kind: "ordonner", items: ["Mesurer et noter les valeurs avec leur unité.", "Schématiser le circuit avec les symboles normalisés.", "Comparer les résultats à la loi en tenant compte de l'incertitude, puis conclure.", "Réaliser le circuit générateur éteint, puis brancher les appareils (ampèremètre en série, voltmètre en dérivation).", "Choisir la loi à vérifier et les grandeurs à mesurer."], answer: [1, 4, 3, 0, 2], hint: "Première étape en haut" } }],
    solution: ["1. Schématiser le circuit.", "2. Choisir la loi et les grandeurs à mesurer.", "3. Réaliser le montage en respectant les branchements et la sécurité.", "4. Mesurer et consigner les valeurs avec leurs unités.", "5. Comparer à la loi (en tenant compte de l'incertitude) et conclure."],
    reasoning: "Un protocole va de la préparation (schéma) à la conclusion en passant par la mesure, sans sauter l'analyse de l'incertitude.",
    hints: ["On prépare avant de manipuler.", "La conclusion vient en dernier."],
  }),
  ex({
    id: "el4-26", title: "Choisir un protocole", niveau: 4, objectives: ["P4-E-01", "P4-E-03"], time: 120,
    vary: (rng) => ({
      statement: "Quel protocole permet de vérifier l'additivité des tensions dans un circuit en série à deux lampes ?",
      parts: [shuffledQcm(rng, ["Mesurer avec un voltmètre en dérivation les tensions $U$ (générateur), $U_1$ ($L_1$) et $U_2$ ($L_2$), puis comparer $U$ et $U_1 + U_2$.", "Placer un ampèremètre en série avec chaque lampe et additionner les intensités.", "Mesurer une seule tension, aux bornes de $L_1$, et conclure.", "Brancher le voltmètre en série avec le générateur et lire sa valeur."], 0, { 1: "Ce protocole concerne les intensités, pas les tensions.", 2: "Une seule mesure ne permet pas de comparer avec la somme.", 3: "Un voltmètre se branche en dérivation." })],
      solution: ["Pour comparer $U$ à $U_1 + U_2$, il faut les trois tensions.", "Le voltmètre se branche toujours en dérivation, aux bornes du dipôle étudié."],
    }),
    reasoning: "Un protocole doit permettre de mesurer toutes les grandeurs de la loi avec les bons branchements.",
    hints: ["Quelles grandeurs apparaissent dans la loi ?", "Quel appareil mesure une tension, et comment se branche-t-il ?"],
  }),
  ex({
    id: "el4-27", title: "Un dipôle est-il ohmique ?", niveau: 4, objectives: ["P3-E-07"], time: 180,
    vary: (rng) => {
      const R = rng.pick([20, 50, 100, 150]), ims = [20, 40, 60];
      const us = ims.map((v) => rd(R * v / 1000, 3));
      return {
        statement: `On mesure (valeurs fictives) ${ims.map((v, k) => `$I = ${v}\\ \\mathrm{mA}$ pour $U = ${T(us[k])}\\ \\mathrm{V}$`).join(" ; ")}. Calcule le rapport $U / I$ pour chaque mesure, puis conclus.`,
        parts: [{ interaction: { kind: "etapes", steps: ims.map((v, k) => ({ prompt: `Rapport $U/I$ de la mesure ${k + 1}`, answer: { value: R }, suffix: "Ω" })) } }, shuffledQcm(rng, ["Le rapport $U/I$ est constant : le dipôle est ohmique, de résistance $R$ égale à ce rapport.", "Le rapport change : le dipôle n'est pas ohmique.", "On ne peut rien conclure avec trois mesures, jamais.", "La résistance dépend de la tension : $R$ augmente à chaque mesure."], 0, { 1: "Ici les trois rapports sont identiques.", 2: "Trois mesures alignées avec l'origine suffisent à un premier test.", 3: "Les rapports sont égaux, pas croissants." }, "Conclusion")],
        solution: ims.map((v, k) => `Mesure ${k + 1} : $\\dfrac{${T(us[k])}}{${T(v / 1000)}} = ${R}\\ \\Omega$.`).concat(["Les trois rapports sont égaux : $U$ est proportionnelle à $I$ ; le graphique $U = f(I)$ serait une droite passant par l'origine."]),
      };
    },
    reasoning: "Pour un dipôle ohmique, $U/I$ est constant et égal à $R$ ; le graphique $U = f(I)$ est une droite passant par l'origine.",
    hints: ["Convertis les mA en A.", "Compare les trois rapports."],
  }),
  ex({
    id: "el4-28", title: "Approfondissement — Résistance doublée", niveau: 4, objectives: ["P4-E-04", "P3-E-07"], time: 180,
    vary: (rng) => {
      const U = rng.pick([6, 9, 12]), R1 = rng.pick([100, 200]), R2 = 2 * R1;
      const i1 = rd(U * 1000 / R1, 3), i2 = rd(U * 1000 / R2, 3);
      return {
        statement: `**Approfondissement.** On branche successivement un conducteur ohmique de $${R1}\\ \\Omega$ puis un de $${R2}\\ \\Omega$ aux bornes du même générateur de $${U}\\ \\mathrm{V}$. ${FICTIF}`,
        parts: [{ interaction: { kind: "etapes", steps: [{ prompt: `Intensité avec $${R1}\\ \\Omega$`, answer: { value: i1 }, suffix: "mA" }, { prompt: `Intensité avec $${R2}\\ \\Omega$`, answer: { value: i2 }, suffix: "mA" }] } }, shuffledQcm(rng, ["L'intensité est divisée par $2$.", "L'intensité est multipliée par $2$.", "L'intensité ne change pas.", "L'intensité est divisée par $4$."], 0, { 1: "Une résistance plus grande s'oppose davantage au courant.", 2: "À tension fixée, $I = U / R$ dépend de $R$.", 3: "$R$ est doublée, pas multipliée par $4$." }, "Quand la résistance double (à tension fixée) :")],
        solution: [`$I = \\dfrac{U}{R}$ : $I_1 = \\dfrac{${U}}{${R1}} = ${T(i1 / 1000)}\\ \\mathrm{A} = ${T(i1)}\\ \\mathrm{mA}$.`, `$I_2 = \\dfrac{${U}}{${R2}} = ${T(i2 / 1000)}\\ \\mathrm{A} = ${T(i2)}\\ \\mathrm{mA}$.`, "Quand $R$ double à tension constante, $I$ est divisée par $2$ : plus une résistance est grande, plus elle limite le courant."],
      };
    },
    reasoning: "À tension fixée, $I = U / R$ : l'intensité varie en sens inverse de la résistance.",
    hints: ["Calcule $I$ pour chaque résistance avec $I = U/R$.", "Compare les deux résultats."],
  }),
  ex({
    id: "el4-29", title: "Approfondissement — Influence d'une résistance", niveau: 4, objectives: ["P4-E-04"], time: 120,
    statement: "**Approfondissement.** La tension aux bornes d'un conducteur ohmique est maintenue constante. Vrai ou faux ?",
    parts: [{ interaction: { kind: "vrai-faux", items: ["Plus la résistance est grande, plus l'intensité est grande.", "Une résistance plus petite laisse passer une intensité plus grande.", "Si on remplace $R$ par une résistance trois fois plus petite, $I$ est multipliée par $3$.", "La résistance d'un dipôle ohmique dépend de la tension appliquée."], answer: [false, true, true, false] } }],
    solution: ["Faux : $I = U / R$, donc $I$ diminue quand $R$ augmente.", "Vrai : $I = U / R$ augmente quand $R$ diminue.", "Vrai : $I = U / (R/3) = 3 \\times U / R$.", "Faux : pour un dipôle ohmique, $R$ est constante, c'est le rapport $U/I$."],
    reasoning: "À tension constante, l'intensité est inversement proportionnelle à la résistance.",
    hints: ["Écris $I = U/R$.", "Que devient un quotient quand le dénominateur diminue ?"],
  }),
  ex({
    id: "el4-30", title: "Un fusible pour se protéger", niveau: 4, objectives: ["P3-E-10", "P3-E-07"], time: 180,
    vary: (rng) => {
      const blow = rng.next() < 0.5;
      let U = 6, R = 12;
      do { U = rng.pick([6, 9, 12]); R = rng.pick([10, 12, 15, 20, 24, 30, 40, 60]); } while ((U / R > 0.5) !== blow);
      const I = rd(U / R, 4);
      return {
        statement: `Un fusible de calibre $0{,}50\\ \\mathrm{A}$ protège un circuit : il fond si l'intensité dépasse cette valeur. On branche un conducteur ohmique de $${R}\\ \\Omega$ sous $${U}\\ \\mathrm{V}$. ${FICTIF}`,
        parts: [num(I, "A", [{ match: String(rd(U * R, 2)), feedback: "On divise $U$ par $R$ pour trouver $I$." }], "Intensité $I$ dans le circuit"), qcm(["Le fusible fond : le circuit est coupé.", "Le fusible ne fond pas."], blow ? 0 : 1, [], "Que se passe-t-il ?")],
        solution: [`$I = \\dfrac{U}{R} = \\dfrac{${U}}{${R}} = ${T(I)}\\ \\mathrm{A}$.`, blow ? `$${T(I)}\\ \\mathrm{A} > 0{,}50\\ \\mathrm{A}$ : le fusible fond et coupe le circuit, ce qui évite un échauffement dangereux.` : `$${T(I)}\\ \\mathrm{A} \\leqslant 0{,}50\\ \\mathrm{A}$ : le fusible ne fond pas, le circuit fonctionne.`, "Un court-circuit (résistance quasi nulle) donnerait une intensité très grande : c'est pour cela qu'on ne relie jamais directement les deux bornes d'un générateur."],
      };
    },
    reasoning: "La loi d'Ohm permet de prévoir une surintensité : plus la résistance du circuit est faible, plus l'intensité est grande.",
    hints: ["Calcule d'abord l'intensité avec la loi d'Ohm.", "Compare-la au calibre du fusible."],
  }),
  ex({
    id: "el4-31", title: "Règles de sécurité et raisons", niveau: 4, objectives: ["P3-E-10"], time: 150,
    statement: "Associe chaque règle de sécurité à sa justification.",
    parts: [{ interaction: { kind: "associer", left: ["Ne jamais relier directement les deux bornes d'un générateur par un fil.", "Couper le circuit avant de modifier un branchement.", "Commencer avec le calibre le plus élevé de l'appareil de mesure.", "Ne pas utiliser le secteur pour les montages d'élève."], right: ["On évite de dépasser le maximum de l'appareil et de l'abîmer.", "La résistance du fil est quasi nulle : l'intensité devient très grande (court-circuit).", "Le secteur peut être dangereux pour le corps humain ; un générateur de 0 à 12 V limite le risque.", "On évite un court-circuit ou une erreur pendant la manipulation."], answer: [1, 3, 0, 2] } }],
    solution: ["Court-circuit : $R$ quasi nulle donc $I = U/R$ très grande, d'où échauffement.", "Modifier un montage éteint évite les erreurs de branchement sous tension.", "Un calibre élevé protège l'appareil d'une intensité inattendue.", "Une tension basse limite les risques pour la personne. Le règlement de l'établissement prévaut."],
    reasoning: "Les règles de sécurité s'appuient sur les lois de l'électricité : surintensité et court-circuit.",
    hints: ["Pense à $I = U / R$ quand $R$ devient très petite.", "Une règle protège soit la personne, soit le matériel."],
  }),
  // ── Niveau 5 : Type Brevet ──
  ex({
    id: "el4-32", title: "Type Brevet — Deux lampes en série", niveau: 5, objectives: ["P4-E-01", "P4-E-03", "P3-E-07"], time: 360,
    vary: (rng) => {
      let R1 = 0, R2 = 0, i = 0, U1 = 0, U2 = 0, U = 0;
      do { R1 = rng.pick([10, 15, 18, 22, 27, 33]); R2 = rng.pick([12, 15, 22, 27, 33, 39, 47]); i = rng.pick([0.1, 0.2, 0.3, 0.4]); U1 = rd(R1 * i, 1); U2 = rd(R2 * i, 1); U = rd(U1 + U2, 1); } while (R1 === R2 || U < 3 || U > 12);
      return {
        statement: `Un générateur est branché en série avec deux conducteurs ohmiques $R_1$ et $R_2$ (valeurs de mesure fictives). Un ampèremètre en série indique $I = ${m2(i, "A")}$. Un voltmètre aux bornes du générateur indique $U = ${m1(U, "V")}$ et un voltmètre aux bornes de $R_1$ indique $U_1 = ${m1(U1, "V")}$.`,
        parts: [shuffledQcm(rng, ["En dérivation, aux bornes de $R_1$.", "En série avec $R_1$.", "En série avec le générateur.", "Entre $R_1$ et $R_2$, dans le fil."], 0, { 1: "Un voltmètre en série bloquerait presque le courant.", 2: "C'est la position d'un ampèremètre.", 3: "Dans le fil, c'est la position d'un ampèremètre." }, "1. Comment est branché le voltmètre qui mesure $U_1$ ?"), num(U2, "V", [{ match: String(rd(U + U1, 1)), feedback: "On retranche $U_1$ à $U$." }], "2. Tension $U_2$ aux bornes de $R_2$"), num(R1, "Ω", [{ match: String(rd(U1 * i, 3)), feedback: "$R = U / I$, pas $U \\times I$." }], "3. Résistance $R_1$", { sigFigs: 2 }), num(R2, "Ω", [], "4. Résistance $R_2$", { sigFigs: 2 })],
        solution: ["1. Un voltmètre se branche en dérivation aux bornes du dipôle étudié.", `2. Additivité des tensions : $U_2 = U - U_1 = ${U.toFixed(1).replace(".", ",")} - ${U1.toFixed(1).replace(".", ",")} = ${U2.toFixed(1).replace(".", ",")}\\ \\mathrm{V}$.`, `3. $R_1 = \\dfrac{U_1}{I} = \\dfrac{${U1.toFixed(1).replace(".", ",")}}{${i.toFixed(2).replace(".", ",")}} = ${R1}\\ \\Omega$ (deux chiffres significatifs).`, `4. L'intensité est la même dans $R_2$ (série) : $R_2 = \\dfrac{U_2}{I} = ${R2}\\ \\Omega$.`],
      };
    },
    reasoning: "Rédaction attendue : citer la loi utilisée (additivité des tensions, unicité de l'intensité, loi d'Ohm), calculer, donner l'unité et le bon nombre de chiffres significatifs.",
    hints: ["Quel est le rôle d'un voltmètre, et comment se branche-t-il ?", "Quelle loi relie $U$, $U_1$ et $U_2$ ?", "Utilise la loi d'Ohm pour chaque conducteur, avec la même intensité."],
  }),
  ex({
    id: "el4-33", title: "Type Brevet — Deux branches en dérivation", niveau: 5, objectives: ["P4-E-02", "P4-E-03", "P3-E-07"], time: 360,
    vary: (rng) => {
      let U = 6, R2 = 20, i2 = 0;
      do { U = rng.pick([6, 9, 12]); R2 = rng.pick([20, 30, 40, 60]); i2 = rd(U / R2, 2); } while (!close(i2, U / R2) || i2 < 0.1 || i2 > 0.6);
      const i1 = rng.int(10, 40) / 100, I = rd(i1 + i2, 2);
      return {
        statement: `Un générateur de $${m1(U, "V").slice(1, -1)}$ alimente deux lampes $L_1$ et $L_2$ en dérivation (valeurs de mesure fictives). L'ampèremètre de la branche principale indique $I = ${m2(I, "A")}$ et celui de la branche de $L_2$ indique $I_2 = ${m2(i2, "A")}$.`,
        parts: [qcm(["Additivité des intensités : $I = I_1 + I_2$.", "Unicité de l'intensité : $I = I_1 = I_2$.", "Additivité des tensions : $U = U_1 + U_2$.", "Loi d'Ohm : $U = R \\times I$."], 0, [{ match: "1", feedback: "L'unicité de l'intensité concerne un circuit en série." }], "1. Quelle loi permet de trouver $I_1$ ?"), num(i1, "A", [{ match: String(I), feedback: "$I_1$ est plus petite que $I$ : c'est $I - I_2$." }], "2. Intensité $I_1$", { sigFigs: 2 }), num(U, "V", [{ match: String(rd(2 * U, 1)), feedback: "En dérivation, les tensions ne s'additionnent pas." }], "3. Tension aux bornes de $L_2$"), num(R2, "Ω", [{ match: String(rd(U * i2, 3)), feedback: "$R = U / I$, pas $U \\times I$." }], "4. Résistance de la lampe $L_2$ (supposée ohmique)", { sigFigs: 2 })],
        solution: ["1. Les lampes sont en dérivation : $I = I_1 + I_2$.", `2. $I_1 = I - I_2 = ${I.toFixed(2).replace(".", ",")} - ${i2.toFixed(2).replace(".", ",")} = ${i1.toFixed(2).replace(".", ",")}\\ \\mathrm{A}$.`, `3. Unicité des tensions en dérivation : $U_2 = U = ${U}\\ \\mathrm{V}$.`, `4. $R_2 = \\dfrac{U_2}{I_2} = \\dfrac{${U}}{${i2.toFixed(2).replace(".", ",")}} = ${R2}\\ \\Omega$.`],
      };
    },
    reasoning: "On combine la loi des nœuds, l'unicité des tensions en dérivation et la loi d'Ohm sur une branche.",
    hints: ["Sur un schéma, repère le nœud et les trois intensités.", "Que vaut la tension aux bornes d'une branche reliée au générateur ?", "Applique la loi d'Ohm à la branche de $L_2$ seulement."],
  }),
  ex({
    id: "el4-34", title: "Type Brevet — Vérifier la loi d'Ohm", niveau: 5, objectives: ["P4-E-01", "P3-E-07"], time: 360,
    vary: (rng) => {
      const R = rng.pick([20, 50, 100, 150]), ims = [20, 40, 60];
      const us = ims.map((v) => rd(R * v / 1000, 3));
      return {
        statement: `Pour vérifier la loi d'Ohm, on alimente un conducteur ohmique avec des tensions croissantes (générateur $0$ à $12\\ \\mathrm{V}$) et on relève, pour chaque tension, l'intensité. Données fictives : ${ims.map((v, k) => `($U = ${T(us[k])}\\ \\mathrm{V}$ ; $I = ${v}\\ \\mathrm{mA}$)`).join(" ; ")}.`,
        parts: [shuffledQcm(rng, ["Ampèremètre en série avec le conducteur et voltmètre en dérivation aux bornes du conducteur.", "Ampèremètre en dérivation aux bornes du conducteur et voltmètre en série.", "Deux ampèremètres, l'un en série, l'autre en dérivation.", "Deux voltmètres en série avec le conducteur."], 0, { 1: "Les deux appareils sont inversés.", 2: "Il faut mesurer une tension, donc un voltmètre.", 3: "Il faut mesurer une intensité, donc un ampèremètre en série." }, "1. Quels appareils et quels branchements ?"), { prompt: "2. Calcule $R = U / I$ pour chaque mesure.", interaction: { kind: "etapes", steps: ims.map((v, k) => ({ prompt: `Mesure ${k + 1}`, answer: { value: R }, suffix: "Ω" })) } }, shuffledQcm(rng, ["Le rapport $U/I$ est constant : le dipôle est ohmique, et $U = R \\times I$ est vérifiée.", "Le rapport varie : la loi n'est pas vérifiée.", "Il faudrait une seule mesure pour conclure.", "La loi d'Ohm ne s'applique qu'aux lampes."], 0, { 1: "Les trois rapports sont identiques.", 2: "Plusieurs mesures permettent de tester la proportionnalité.", 3: "La loi d'Ohm s'applique aux dipôles ohmiques (conducteurs ohmiques)." }, "3. Conclusion"), shuffledQcm(rng, ["L'incertitude de mesure : les appareils ne sont jamais parfaitement précis.", "Une erreur de la loi d'Ohm.", "La loi change à chaque mesure.", "Le générateur impose les valeurs de $R$."], 0, { 1: "Les écarts viennent des mesures, pas de la loi.", 2: "La loi ne change pas.", 3: "$R$ est une propriété du conducteur." }, "4. Avec de vraies mesures, pourquoi les valeurs de $R$ ne seraient-elles pas exactement identiques ?")],
        solution: ["1. Ampèremètre en série (intensité), voltmètre en dérivation (tension).", ...ims.map((v, k) => `2. Mesure ${k + 1} : $R = \\dfrac{${T(us[k])}}{${T(v / 1000)}} = ${R}\\ \\Omega$.`), "3. $U/I$ est constant : $U$ est proportionnelle à $I$ ; le graphique $U = f(I)$ est une droite passant par l'origine.", "4. Les mesures réelles s'accompagnent d'une incertitude : on compare les valeurs en tenant compte de cet écart."],
      };
    },
    reasoning: "Vérifier une loi : choisir les mesures, les réaliser avec les bons branchements, comparer au modèle en tenant compte de l'incertitude, conclure.",
    hints: ["Quel appareil mesure quelle grandeur, et comment se branche-t-il ?", "Convertis les mA en A avant de diviser.", "Une loi se vérifie sur plusieurs mesures."],
  }),
  ex({
    id: "el4-35", title: "Type Brevet — Sécurité et court-circuit", niveau: 5, objectives: ["P3-E-10", "P3-E-07"], time: 300,
    statement: "Pour un montage d'élève, un générateur de $9\\ \\mathrm{V}$ alimente un conducteur ohmique de $15\\ \\Omega$ protégé par un fusible de calibre $0{,}50\\ \\mathrm{A}$ (valeurs fictives).",
    parts: [num(0.6, "A", [{ match: "135", feedback: "On divise la tension par la résistance : $I = U / R$." }], "1. Calcule l'intensité du courant dans le circuit."), qcm(["Le fusible fond : le circuit est coupé.", "Le fusible ne fond pas."], 0, [], "2. Que se passe-t-il ?"), { prompt: "3. Pourquoi ne faut-il jamais relier directement les deux bornes du générateur par un fil ?", interaction: { kind: "qcm", options: ["La résistance du fil est quasi nulle : l'intensité $I = U/R$ devient très grande, avec échauffement et danger.", "Le fil absorbe toute la tension et le générateur s'éteint sans risque.", "Cela augmente la résistance du circuit.", "Il n'y a aucun risque avec une tension aussi faible."], answer: [0] }, mistakes: [{ match: "3", feedback: "Même à basse tension, un court-circuit provoque une très forte intensité." }] }, { prompt: "4. Vrai ou faux ?", interaction: { kind: "vrai-faux", items: ["On remplace le fusible fondu par un fil de cuivre pour éviter les pannes.", "Avant de changer un branchement, on coupe le circuit.", "On travaille avec le secteur pour obtenir plus de précision."], answer: [false, true, false] } }],
    solution: ["1. $I = \\dfrac{U}{R} = \\dfrac{9}{15} = 0{,}60\\ \\mathrm{A}$.", "2. $0{,}60\\ \\mathrm{A} > 0{,}50\\ \\mathrm{A}$ : le fusible fond.", "3. Une résistance presque nulle donne une intensité très grande (court-circuit), d'où échauffement et risque.", "4. Faux : le fusible protège ; vrai : on coupe avant de modifier ; faux : le secteur est dangereux, on utilise 0 à 12 V."],
    reasoning: "Les lois de l'électricité expliquent les règles de sécurité : on évite les surintensités. Le règlement de l'établissement prévaut.",
    hints: ["Calcule l'intensité puis compare à $0{,}50\\ \\mathrm{A}$.", "Si $R$ devient très petite, que devient $I = U/R$ ?"],
  }),
  ex({
    id: "el4-36", title: "Type Brevet — Une lampe est-elle un dipôle ohmique ?", niveau: 5, objectives: ["P3-E-07", "P4-E-01"], time: 300,
    statement: "On étudie une lampe en relevant tension et intensité (mesures fictives) : ($U = 1{,}0\\ \\mathrm{V}$ ; $I = 0{,}10\\ \\mathrm{A}$), ($U = 3{,}0\\ \\mathrm{V}$ ; $I = 0{,}20\\ \\mathrm{A}$), ($U = 6{,}0\\ \\mathrm{V}$ ; $I = 0{,}30\\ \\mathrm{A}$).",
    parts: [{ prompt: "1. Calcule le rapport $U / I$ pour chaque mesure (deux chiffres significatifs).", interaction: { kind: "etapes", steps: [{ prompt: "Mesure 1", answer: { value: 10, sigFigs: 2 }, suffix: "Ω" }, { prompt: "Mesure 2", answer: { value: 15, sigFigs: 2 }, suffix: "Ω" }, { prompt: "Mesure 3", answer: { value: 20, sigFigs: 2 }, suffix: "Ω" }] } }, qcm(["Le rapport $U/I$ n'est pas constant : la lampe n'est pas un dipôle ohmique.", "Le rapport est constant : la lampe est un dipôle ohmique.", "On ne peut pas calculer $U/I$ pour une lampe.", "La lampe a une résistance de $10\\ \\Omega$ en toutes circonstances."], 0, [{ match: "1", feedback: "Les trois rapports sont différents ($10$, $15$, $20\\ \\Omega$)." }, { match: "3", feedback: "Cette valeur n'est vraie que pour la première mesure." }], "2. Que peux-tu conclure ?"), qcm(["Une courbe qui ne serait pas une droite passant par l'origine.", "Une droite passant par l'origine.", "Un point unique.", "Une droite horizontale."], 0, [{ match: "1", feedback: "Une droite passant par l'origine est la caractéristique d'un dipôle ohmique." }], "3. Quelle forme aurait le graphique $U = f(I)$ ?")],
    solution: ["1. $\\dfrac{1{,}0}{0{,}10} = 10\\ \\Omega$ ; $\\dfrac{3{,}0}{0{,}20} = 15\\ \\Omega$ ; $\\dfrac{6{,}0}{0{,}30} = 20\\ \\Omega$.", "2. Le rapport $U/I$ varie : $U$ n'est pas proportionnelle à $I$ ; la loi d'Ohm $U = R \\times I$ (avec $R$ constante) ne s'applique pas à cette lampe.", "3. Le graphique ne serait pas une droite passant par l'origine."],
    reasoning: "La loi d'Ohm s'applique aux dipôles ohmiques seulement ; on le teste en regardant si $U/I$ est constant.",
    hints: ["Divise $U$ par $I$ pour chaque mesure.", "Compare les trois résultats."],
  }),
];

// ───────────────────────── Illustrations ─────────────────────────
const wireStyle = `fill="none" stroke="#334155" stroke-width="2"`;
const lamp = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#334155" stroke-width="2"/><path d="M${x - 10} ${y - 10}L${x + 10} ${y + 10}M${x - 10} ${y + 10}L${x + 10} ${y - 10}" stroke="#334155" stroke-width="2"/>`;
const meter = (x: number, y: number, t: string, col: string) => `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="${col}" stroke-width="2"/><text x="${x}" y="${y + 5}" font-size="14" text-anchor="middle" fill="${col}" font-weight="700">${t}</text>`;
const gen = (x: number, y: number) => `<rect x="${x - 10}" y="${y - 15}" width="20" height="30" fill="#fff" stroke="#334155" stroke-width="2"/><text x="${x}" y="${y + 5}" font-size="13" text-anchor="middle" fill="#0f172a">G</text>`;

const serie = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" role="img" aria-label="Circuit en série : un générateur, deux lampes et trois ampèremètres en série" style="width:100%;max-width:320px;height:auto;font-family:Inter,Arial,sans-serif"><path d="M40 40H280V130H40Z" ${wireStyle}/>${gen(40, 85)}${lamp(115, 40)}${lamp(215, 40)}${meter(65, 40, "A", "#4f46e5")}${meter(165, 40, "A", "#4f46e5")}${meter(280, 85, "A", "#4f46e5")}<text x="160" y="155" font-size="12" text-anchor="middle" fill="#475569">Trois ampèremètres en série : même valeur</text></svg>`;
const derivation = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" role="img" aria-label="Circuit à deux branches en dérivation : générateur, deux lampes et deux nœuds" style="width:100%;max-width:320px;height:auto;font-family:Inter,Arial,sans-serif"><path d="M40 30H250M40 150H250M40 30V150M150 30V150M250 30V150" ${wireStyle}/>${gen(40, 90)}${lamp(150, 90)}${lamp(250, 90)}<circle cx="150" cy="30" r="4" fill="#334155"/><circle cx="150" cy="150" r="4" fill="#334155"/><text x="85" y="22" font-size="12" fill="#4f46e5">I</text><text x="160" y="60" font-size="12" fill="#b45309">I₁</text><text x="260" y="60" font-size="12" fill="#b45309">I₂</text><text x="160" y="178" font-size="12" text-anchor="middle" fill="#475569">I = I₁ + I₂ ; U = U₁ = U₂</text></svg>`;

const prerequisites: ChapterContent["prerequisites"] = [
  { text: "Reconnaître les dipôles usuels (générateur, interrupteur, lampe) et leurs symboles normalisés (5e).", chapterId: "pc-5e-circuits-electriques" },
  { text: "Distinguer des dipôles en série et en dérivation ; repérer une boucle ou une maille (5e).", chapterId: "pc-5e-circuits-electriques" },
  { text: "Mesurer une intensité et une tension : ampèremètre en série, voltmètre en dérivation (5e).", chapterId: "pc-5e-circuits-electriques" },
  { text: "Convertir des unités ($1\\ \\mathrm{A} = 1\\,000\\ \\mathrm{mA}$) et calculer un produit ou un quotient de nombres décimaux." },
  { text: "Compter les chiffres significatifs d'une mesure." },
];

const games: ChapterContent["games"] = [
  {
    id: "el4-jeu-flash", template: "calcul-flash", title: "Flash électricité",
    objective: "Automatiser les lois des intensités et des tensions et la loi d'Ohm avec les bonnes unités.",
    instructions: "Réponds le plus vite possible par un nombre, dans l'unité demandée dans la question. Le niveau monte après trois bonnes réponses d'affilée.",
    objectives: ["P4-E-02", "P4-E-03", "P3-E-07"],
    config: flashConfig([
      ["Lois des intensités et des tensions", [
        ["Deux lampes en série : $I_1 = 120\\ \\mathrm{mA}$. Quelle est $I_2$ en mA ?", "120", "En série, l'intensité est la même partout."],
        ["Au nœud : $I_1 = 150\\ \\mathrm{mA}$ et $I_2 = 250\\ \\mathrm{mA}$. Quelle est $I$ en mA ?", "400", "$I = I_1 + I_2$."],
        ["Au nœud : $I = 500\\ \\mathrm{mA}$ et $I_1 = 180\\ \\mathrm{mA}$. Quelle est $I_2$ en mA ?", "320", "$I_2 = I - I_1$."],
        ["Maille : $U = 12\\ \\mathrm{V}$ et $U_1 = 5\\ \\mathrm{V}$. Quelle est $U_2$ en V ?", "7", "$U_2 = U - U_1$."],
        ["Maille : $U_1 = 4\\ \\mathrm{V}$ et $U_2 = 2\\ \\mathrm{V}$. Quelle est $U$ en V ?", "6", "$U = U_1 + U_2$."],
        ["Dérivation : le générateur impose $6\\ \\mathrm{V}$. Tension aux bornes de $L_2$ en V ?", "6", "En dérivation, $U = U_1 = U_2$."],
        ["Maille : $U = 9\\ \\mathrm{V}$ et $U_1 = 3\\ \\mathrm{V}$. Quelle est $U_2$ en V ?", "6", "$U_2 = 9 - 3$."],
        ["Dérivation : $U_1 = 9\\ \\mathrm{V}$. Quelle est $U_2$ en V ?", "9", "Même tension aux bornes de chaque branche."],
      ]],
      ["Loi d'Ohm", [
        ["$R = 40\\ \\Omega$ et $I = 0{,}2\\ \\mathrm{A}$. Calcule $U$ en V.", "8", "$U = R \\times I = 40 \\times 0{,}2$."],
        ["$R = 100\\ \\Omega$ et $I = 0{,}06\\ \\mathrm{A}$. Calcule $U$ en V.", "6", "$U = 100 \\times 0{,}06$."],
        ["$U = 12\\ \\mathrm{V}$ et $R = 60\\ \\Omega$. Calcule $I$ en mA.", "200", "$I = 12 / 60 = 0{,}2\\ \\mathrm{A}$."],
        ["$U = 6\\ \\mathrm{V}$ et $I = 0{,}05\\ \\mathrm{A}$. Calcule $R$ en $\\Omega$.", "120", "$R = U / I = 6 / 0{,}05$."],
        ["$U = 9\\ \\mathrm{V}$ et $I = 0{,}3\\ \\mathrm{A}$. Calcule $R$ en $\\Omega$.", "30", "$R = 9 / 0{,}3$."],
        ["$U = 12\\ \\mathrm{V}$ et $R = 240\\ \\Omega$. Calcule $I$ en mA.", "50", "$I = 12 / 240 = 0{,}05\\ \\mathrm{A}$."],
        ["$R = 50\\ \\Omega$ et $I = 100\\ \\mathrm{mA}$. Calcule $U$ en V.", "5", "$100\\ \\mathrm{mA} = 0{,}1\\ \\mathrm{A}$ ; $U = 50 \\times 0{,}1$."],
        ["$U = 10\\ \\mathrm{V}$ et $I = 0{,}25\\ \\mathrm{A}$. Calcule $R$ en $\\Omega$.", "40", "$R = 10 / 0{,}25$."],
      ]],
      ["Conversions et kiloohms", [
        ["Convertis $0{,}25\\ \\mathrm{A}$ en mA.", "250", "$1\\ \\mathrm{A} = 1\\,000\\ \\mathrm{mA}$."],
        ["Convertis $2\\ \\mathrm{k\\Omega}$ en $\\Omega$.", "2000", "$1\\ \\mathrm{k\\Omega} = 1\\,000\\ \\Omega$."],
        ["$I = 2\\ \\mathrm{mA}$ et $R = 3\\ \\mathrm{k\\Omega}$. Calcule $U$ en V.", "6", "$U = 3\\,000 \\times 0{,}002$."],
        ["$U = 9\\ \\mathrm{V}$ et $R = 3\\ \\mathrm{k\\Omega}$. Calcule $I$ en mA.", "3", "$I = 9 / 3\\,000 = 0{,}003\\ \\mathrm{A}$."],
        ["Convertis $1{,}5\\ \\mathrm{A}$ en mA.", "1500", "$1{,}5 \\times 1\\,000$."],
        ["Convertis $0{,}5\\ \\mathrm{k\\Omega}$ en $\\Omega$.", "500", "$0{,}5 \\times 1\\,000$."],
        ["$U = 12\\ \\mathrm{V}$ et $R = 4\\ \\mathrm{k\\Omega}$. Calcule $I$ en mA.", "3", "$12 / 4$ : des volts divisés par des kiloohms donnent des mA."],
      ]],
    ]),
  },
  {
    id: "el4-jeu-erreurs", template: "chasse-erreurs", title: "Chasse aux erreurs d'électricité",
    objective: "Repérer et nommer les erreurs fréquentes sur les lois de l'électricité, la loi d'Ohm et la sécurité.",
    instructions: "Pour chaque affirmation, dis si elle est juste. Si elle est fausse, choisis l'erreur commise.",
    objectives: ["P4-E-01", "P4-E-02", "P4-E-03", "P3-E-07", "P3-E-10"],
    config: erreursConfig([
      [1, "En série : $I = I_1 + I_2$.", "En série, le courant n'a qu'un seul chemin : $I = I_1 = I_2$. L'addition concerne les branches en dérivation.", ["On a additionné les intensités alors qu'il n'y a qu'un seul chemin pour le courant", "On a confondu intensité et tension", "L'unité est fausse"], 0],
      [1, "En série, l'intensité est la même en tout point du circuit.", "Vrai : unicité de l'intensité en série."],
      [1, "Le voltmètre se branche en série dans la branche étudiée.", "Un voltmètre se branche en dérivation, aux bornes du dipôle étudié.", ["On a confondu le voltmètre et l'ampèremètre", "L'unité du voltmètre est l'ampère", "Un voltmètre ne se branche jamais"], 0],
      [2, "En dérivation : $U = U_1 + U_2$.", "En dérivation, chaque branche a la même tension : $U = U_1 = U_2$.", ["On a appliqué la loi d'une maille à des branches en dérivation", "On a oublié l'unité", "On a confondu intensité et tension"], 0],
      [2, "Au nœud : $I = I_1 + I_2$.", "Vrai : additivité des intensités."],
      [2, "$250\\ \\mathrm{mA} = 250\\ \\mathrm{A}$.", "$250\\ \\mathrm{mA} = 0{,}250\\ \\mathrm{A}$ : on divise par $1\\,000$.", ["On a oublié de convertir les milliampères en ampères", "Ce sont des volts", "On a multiplié par $1\\,000$ deux fois"], 0],
      [3, "$R = U \\times I$.", "La loi d'Ohm est $U = R \\times I$, donc $R = U / I$.", ["On a inversé la loi d'Ohm : $R = U / I$", "Il manque l'unité", "$R$ se calcule en volts"], 0],
      [3, "Avec $U = 6\\ \\mathrm{V}$ et $I = 0{,}20\\ \\mathrm{A}$ : $R = 30\\ \\Omega$.", "Vrai : $R = 6 / 0{,}20 = 30\\ \\Omega$."],
      [3, "Avec $R = 100\\ \\Omega$ et $I = 50\\ \\mathrm{mA}$ : $U = 5\\,000\\ \\mathrm{V}$.", "$50\\ \\mathrm{mA} = 0{,}050\\ \\mathrm{A}$ donc $U = 100 \\times 0{,}050 = 5\\ \\mathrm{V}$.", ["Les mA n'ont pas été convertis en A", "On a divisé au lieu de multiplier", "L'unité de $R$ est fausse"], 0],
      [4, "Relier directement les deux bornes du générateur par un fil est sans danger.", "La résistance du fil est quasi nulle : $I = U / R$ devient très grande (court-circuit), le fil chauffe.", ["On a oublié que l'intensité devient très grande quand la résistance est très faible", "On a oublié le voltmètre", "Le générateur n'a pas deux bornes"], 0],
      [4, "Un ampèremètre en dérivation aux bornes d'une lampe court-circuite presque la lampe.", "Vrai : l'ampèremètre a une résistance très faible."],
    ]),
  },
  {
    id: "el4-jeu-memory", template: "memory", title: "Memory de l'électricité",
    objective: "Associer grandeurs, unités, appareils et lois de l'électricité.",
    instructions: "Retourne deux cartes : si elles vont ensemble, elles restent visibles. Trouve toutes les paires en un minimum d'essais.",
    objectives: ["P4-E-01", "P4-E-02", "P4-E-03", "P3-E-07"],
    config: { pairs: [
      ["Intensité $I$", "ampère (A)"],
      ["Tension $U$", "volt (V)"],
      ["Résistance $R$", "ohm ($\\Omega$)"],
      ["Ampèremètre", "en série"],
      ["Voltmètre", "en dérivation"],
      ["Loi d'Ohm", "$U = R \\times I$"],
    ] },
  },
];

export const pc4eElectricite: ChapterContent = {
  ...META,
  prerequisites,
  lesson: {
    introduction: "Dans un circuit, deux grandeurs se mesurent sans cesse : l'**intensité** du courant, avec un ampèremètre, et la **tension** entre deux points, avec un voltmètre. Comment ces mesures sont-elles liées d'une lampe à l'autre ? Que se passe-t-il quand le courant se partage ? Et pourquoi un fil relié directement aux deux bornes d'un générateur est-il dangereux ?\nDans ce chapitre, tu découvres les **lois de l'électricité** (intensité en série, additivité des intensités, additivité et unicité des tensions), tu apprends à les **vérifier par une expérience**, puis tu utilises la **loi d'Ohm** $U = R \\times I$. Tu relies enfin ces lois aux **règles de sécurité**. Les valeurs des exercices sont fictives ; en TP, tu travailles avec un générateur basse tension (de $0$ à $12\\ \\mathrm{V}$) et tu suis le règlement de ton établissement.",
    definitions: [
      { term: "Intensité du courant", text: "L'**intensité** $I$ du courant électrique se mesure en **ampères** (A) avec un **ampèremètre** placé **en série** dans la branche étudiée. $1\\ \\mathrm{A} = 1\\,000\\ \\mathrm{mA}$ : $250\\ \\mathrm{mA} = 0{,}250\\ \\mathrm{A}$." },
      { term: "Tension électrique", text: "La **tension** $U$ entre deux points se mesure en **volts** (V) avec un **voltmètre** placé **en dérivation**, aux bornes du dipôle étudié." },
      { term: "Résistance et conducteur ohmique", text: "La **résistance** $R$ d'un conducteur ohmique se mesure en **ohms** ($\\Omega$) ; $1\\ \\mathrm{k\\Omega} = 1\\,000\\ \\Omega$. Un **dipôle ohmique** est un dipôle pour lequel la tension à ses bornes est proportionnelle à l'intensité qui le traverse." },
      { term: "Série, dérivation, nœud, maille", text: "Des dipôles sont **en série** s'ils sont sur un seul chemin. Ils sont **en dérivation** si leurs bornes sont reliées aux mêmes deux **nœuds** (points où se rejoignent au moins trois fils). Une **maille** est une boucle fermée du circuit." },
      { term: "Court-circuit", text: "Il y a **court-circuit** quand les bornes d'un dipôle (ou d'un générateur) sont reliées par un fil de résistance quasi nulle : l'intensité devient très grande." },
    ],
    properties: [
      { title: "Unicité de l'intensité (série)", statement: "Dans un circuit qui ne comporte que des dipôles en série, l'intensité est la même en tout point : $I = I_1 = I_2$ (en A).", conditions: "Valable seulement quand il n'y a qu'un seul chemin pour le courant." },
      { title: "Additivité des intensités (deux mailles)", statement: "À un nœud, l'intensité dans la branche principale est la somme des intensités dans les branches en dérivation : $I = I_1 + I_2$ (en A)." },
      { title: "Additivité des tensions (une maille)", statement: "Dans un circuit à une seule maille, la tension aux bornes du générateur est la somme des tensions aux bornes des dipôles en série : $U = U_1 + U_2$ (en V)." },
      { title: "Unicité des tensions (dérivation)", statement: "Des dipôles en dérivation ont la même tension à leurs bornes : $U = U_1 = U_2$ (en V)." },
      { title: "Loi d'Ohm", statement: "Pour un dipôle ohmique : $U = R \\times I$, avec $U$ en volts (V), $R$ en ohms ($\\Omega$) et $I$ en ampères (A). On en déduit $R = \\dfrac{U}{I}$ et $I = \\dfrac{U}{R}$.", conditions: "Elle ne s'applique qu'aux dipôles ohmiques : pour une lampe, le rapport $U/I$ peut changer." },
    ],
    explanations: [
      { title: "1. Mesurer correctement", body: "L'ampèremètre se place **en série** et le voltmètre **en dérivation**. On relie la borne **COM** et la borne du calibre adapté, en commençant par le **calibre le plus élevé**. On lit l'unité et on convertit les mA en A avant tout calcul. Un ampèremètre en dérivation se comporte presque comme un fil : il court-circuite le dipôle, d'où un risque pour l'appareil et le montage." },
      { title: "2. Les intensités", body: "En série, le courant n'a qu'un seul chemin : trois ampèremètres placés en trois points indiquent la même valeur. En dérivation, le courant se partage au nœud : si $I_1 = 0{,}20\\ \\mathrm{A}$ et $I_2 = 0{,}30\\ \\mathrm{A}$, la branche principale est traversée par $I = 0{,}50\\ \\mathrm{A}$." },
      { title: "3. Les tensions", body: "Avec deux lampes en série sous $9\\ \\mathrm{V}$, la tension se répartit : $U_1 + U_2 = 9\\ \\mathrm{V}$. Avec deux lampes en dérivation, chacune reçoit toute la tension du générateur. Attention à ne pas mélanger : **intensités** additives aux **nœuds**, **tensions** additives dans une **maille**." },
      { title: "4. La loi d'Ohm et la caractéristique", body: "On mesure plusieurs couples $(I, U)$ pour un conducteur ohmique. Si on trace $U$ en fonction de $I$, on obtient une **droite passant par l'origine** dont la pente est $R$. On peut aussi calculer $R = U/I$ pour une mesure ; pour un dipôle ohmique, ce rapport est constant." },
      { title: "5. Vérifier une loi : le protocole", body: "1. Schématiser le circuit avec les symboles normalisés. 2. Choisir la loi à vérifier et les grandeurs à mesurer. 3. Réaliser le montage (générateur éteint) et faire varier une seule grandeur à la fois. 4. Noter chaque valeur avec son unité et le bon nombre de chiffres significatifs. 5. Comparer à la loi en tenant compte de l'**incertitude de mesure** : les valeurs ne sont jamais exactement identiques, mais doivent être compatibles." },
      { title: "6. Lois de l'électricité et sécurité", body: "Comme $I = U/R$, une résistance très faible donne une intensité très grande : c'est le danger du **court-circuit**. Règles : générateur basse tension ($0$ à $12\\ \\mathrm{V}$), jamais le secteur pour les montages d'élève ; ne jamais relier directement les deux bornes d'un générateur ; couper le circuit avant de modifier un branchement ; commencer par le calibre le plus élevé ; ne pas toucher les parties métalliques sous tension et signaler tout fil abîmé. Un fusible coupe le circuit si l'intensité dépasse son calibre. Le règlement de l'établissement prévaut." },
      { title: "7. Approfondissement — Influence d'une résistance", body: "**Approfondissement (non exigible).** À tension constante, $I = U/R$ : si on double $R$, l'intensité est divisée par $2$ ; si on divise $R$ par $3$, l'intensité est multipliée par $3$. Une résistance sert à limiter le courant." },
    ],
    workedExamples: [
      { title: "Exemple 1 — Intensités et tensions", statement: "Deux branches en dérivation sont alimentées par un générateur de $6\\ \\mathrm{V}$. L'ampèremètre principal indique $0{,}50\\ \\mathrm{A}$ et celui de $L_2$ indique $0{,}20\\ \\mathrm{A}$. Calcule $I_1$ et la tension aux bornes de $L_1$.", steps: ["Au nœud : $I = I_1 + I_2$, donc $I_1 = I - I_2 = 0{,}50 - 0{,}20 = 0{,}30\\ \\mathrm{A}$.", "Les lampes sont en dérivation : $U_1 = U = 6\\ \\mathrm{V}$."], answer: "$I_1 = 0{,}30\\ \\mathrm{A}$ et $U_1 = 6\\ \\mathrm{V}$." },
      { title: "Exemple 2 — Additivité des tensions", statement: "Deux lampes sont en série sous $9{,}0\\ \\mathrm{V}$. La première a $U_1 = 3{,}5\\ \\mathrm{V}$ à ses bornes. Calcule $U_2$.", steps: ["Une seule maille : $U = U_1 + U_2$.", "$U_2 = U - U_1 = 9{,}0 - 3{,}5 = 5{,}5\\ \\mathrm{V}$."], answer: "$U_2 = 5{,}5\\ \\mathrm{V}$." },
      { title: "Exemple 3 — Loi d'Ohm", statement: "Un conducteur ohmique est soumis à $U = 6{,}0\\ \\mathrm{V}$ et traversé par $I = 40\\ \\mathrm{mA}$. Calcule sa résistance (données fictives).", steps: ["Conversion : $I = 40\\ \\mathrm{mA} = 0{,}040\\ \\mathrm{A}$.", "$R = \\dfrac{U}{I} = \\dfrac{6{,}0}{0{,}040} = 150\\ \\Omega$.", "Les données ont deux chiffres significatifs : $R = 1{,}5 \\times 10^{2}\\ \\Omega$."], answer: "$R = 150\\ \\Omega$." },
      { title: "Exemple 4 — Calcul d'une intensité", statement: "Un conducteur de $R = 2{,}0\\ \\mathrm{k\\Omega}$ est soumis à $U = 12\\ \\mathrm{V}$. Quelle intensité le traverse ?", steps: ["$R = 2{,}0\\ \\mathrm{k\\Omega} = 2\\,000\\ \\Omega$.", "$I = \\dfrac{U}{R} = \\dfrac{12}{2\\,000} = 0{,}0060\\ \\mathrm{A} = 6{,}0\\ \\mathrm{mA}$."], answer: "$I = 6{,}0\\ \\mathrm{mA}$." },
    ],
    illustrations: [
      { svg: serie, alt: "Circuit en série avec un générateur, deux lampes et trois ampèremètres placés en trois endroits du circuit.", caption: "En série, les trois ampèremètres indiquent la même intensité : $I = I_1 = I_2$." },
      { svg: derivation, alt: "Circuit avec deux branches en dérivation, chacune avec une lampe, reliées par deux nœuds ; les intensités I, I1 et I2 sont indiquées.", caption: "En dérivation : $I = I_1 + I_2$ et $U = U_1 = U_2$." },
    ],
    commonMistakes: [
      { mistake: "« En série, $I = I_1 + I_2$. »", correction: "En série, $I = I_1 = I_2$.", why: "Il n'y a qu'un seul chemin pour le courant : l'intensité est identique partout. L'addition ne concerne que les branches en dérivation (nœud)." },
      { mistake: "« En dérivation, $U = U_1 + U_2$. »", correction: "En dérivation, $U = U_1 = U_2$.", why: "Chaque branche est reliée aux mêmes deux nœuds. L'addition des tensions concerne une maille (série)." },
      { mistake: "Brancher le voltmètre en série et l'ampèremètre en dérivation.", correction: "Ampèremètre en série, voltmètre en dérivation.", why: "Un ampèremètre en dérivation crée presque un court-circuit : danger pour l'appareil et le montage." },
      { mistake: "« $R = U \\times I$. »", correction: "$R = \\dfrac{U}{I}$.", why: "La loi d'Ohm est $U = R \\times I$ ; pour isoler $R$, on divise par $I$." },
      { mistake: "« $250\\ \\mathrm{mA} = 250\\ \\mathrm{A}$. »", correction: "$250\\ \\mathrm{mA} = 0{,}250\\ \\mathrm{A}$.", why: "Il faut convertir les milliampères en ampères avant de calculer avec la loi d'Ohm." },
      { mistake: "Donner $R = 150{,}00\\ \\Omega$ à partir de mesures à deux chiffres significatifs.", correction: "Garder le nombre de chiffres significatifs de la donnée la moins précise.", why: "Un résultat calculé ne peut pas être plus précis que les mesures." },
    ],
    methods: [
      { title: "Utiliser une loi des intensités ou des tensions", steps: ["Repérer série ou dérivation sur le schéma, et s'il s'agit d'une intensité ou d'une tension.", "Écrire la loi adaptée ($I = I_1 = I_2$, $I = I_1 + I_2$, $U = U_1 + U_2$ ou $U = U_1 = U_2$).", "Remplacer par les valeurs (même unité) et calculer.", "Conclure avec l'unité (A ou V)."] },
      { title: "Appliquer la loi d'Ohm", steps: ["Relever $U$, $I$ ou $R$ et convertir (mA en A, k$\\Omega$ en $\\Omega$).", "Écrire $U = R \\times I$ puis isoler la grandeur cherchée.", "Calculer et donner l'unité ($\\mathrm{V}$, $\\Omega$ ou $\\mathrm{A}$) avec le bon nombre de chiffres significatifs."] },
      { title: "Vérifier une loi par l'expérience", steps: ["Schématiser le circuit et choisir les grandeurs à mesurer.", "Réaliser le montage générateur éteint, avec les bons branchements.", "Mesurer, consigner les valeurs avec unités.", "Comparer à la loi en tenant compte de l'incertitude, puis conclure."] },
    ],
    summary: [
      "Intensité $I$ en ampères (ampèremètre en série) ; tension $U$ en volts (voltmètre en dérivation) ; résistance $R$ en ohms.",
      "Série : $I = I_1 = I_2$. Dérivation (nœud) : $I = I_1 + I_2$.",
      "Une maille : $U = U_1 + U_2$. Dérivation : $U = U_1 = U_2$.",
      "Loi d'Ohm pour un dipôle ohmique : $U = R \\times I$, donc $R = U/I$ et $I = U/R$ ; $U = f(I)$ est une droite passant par l'origine.",
      "Pour vérifier une loi : schéma, mesures avec unités, comparaison avec la loi en tenant compte de l'incertitude.",
      "Un court-circuit donne une très grande intensité : on ne relie jamais directement les bornes d'un générateur ; on travaille en basse tension.",
    ],
    revisionSheet: {
      keyPoints: ["$I = I_1 = I_2$ en série ; $I = I_1 + I_2$ au nœud.", "$U = U_1 + U_2$ dans une maille ; $U = U_1 = U_2$ en dérivation.", "$U = R \\times I$ ; $R = U/I$ ; $I = U/R$.", "$1\\ \\mathrm{A} = 1\\,000\\ \\mathrm{mA}$ ; $1\\ \\mathrm{k\\Omega} = 1\\,000\\ \\Omega$.", "Ampèremètre en série, voltmètre en dérivation, calibre le plus élevé d'abord."],
      skills: ["Choisir et appliquer la bonne loi des intensités ou des tensions.", "Calculer $U$, $R$ ou $I$ avec la loi d'Ohm et les bonnes unités.", "Élaborer et suivre un protocole pour vérifier une loi.", "Expliquer une règle de sécurité avec les lois de l'électricité."],
    },
    miniQuiz: [
      { question: "Deux lampes en série : $I_1 = 0{,}30\\ \\mathrm{A}$. Quelle est $I_2$ ?", options: ["$0{,}15\\ \\mathrm{A}$", "$0{,}30\\ \\mathrm{A}$", "$0{,}60\\ \\mathrm{A}$", "On ne peut pas savoir"], answer: 1, explanation: "En série, l'intensité est la même partout." },
      { question: "Deux lampes en dérivation aux bornes de $6\\ \\mathrm{V}$. Quelle est la tension aux bornes de chaque lampe ?", options: ["$3\\ \\mathrm{V}$", "$6\\ \\mathrm{V}$", "$12\\ \\mathrm{V}$", "$0\\ \\mathrm{V}$"], answer: 1, explanation: "En dérivation, $U = U_1 = U_2$." },
      { question: "Quel est le calcul de $R$ avec $U = 6\\ \\mathrm{V}$ et $I = 0{,}20\\ \\mathrm{A}$ ?", options: ["$R = 6 \\times 0{,}20 = 1{,}2\\ \\Omega$", "$R = 6 / 0{,}20 = 30\\ \\Omega$", "$R = 0{,}20 / 6 \\approx 0{,}033\\ \\Omega$", "$R = 6 + 0{,}20 = 6{,}2\\ \\Omega$"], answer: 1, explanation: "$R = U / I = 30\\ \\Omega$." },
      { question: "Pourquoi ne relie-t-on jamais directement les deux bornes d'un générateur par un fil ?", options: ["Le fil se charge en tension", "La résistance du fil est quasi nulle : l'intensité devient très grande", "Le générateur s'éteint toujours sans risque", "Cela diminue la tension du générateur sans danger"], answer: 1, explanation: "$I = U/R$ devient très grande quand $R$ est très petite : échauffement et danger." },
      { question: "Dans un circuit à une maille, $U = 12\\ \\mathrm{V}$ et $U_1 = 5\\ \\mathrm{V}$. Que vaut $U_2$ ?", options: ["$5\\ \\mathrm{V}$", "$7\\ \\mathrm{V}$", "$12\\ \\mathrm{V}$", "$17\\ \\mathrm{V}$"], answer: 1, explanation: "$U_2 = U - U_1 = 12 - 5 = 7\\ \\mathrm{V}$." },
    ],
  },
  exercises: EXERCISES,
  games,
};
