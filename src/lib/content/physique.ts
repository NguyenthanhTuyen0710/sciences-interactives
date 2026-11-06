// Générateurs originaux – Physique-Chimie (collège et lycée).
import type { Generator, Part, Rng } from "../engine/types";
import { fr, frFixed, roundSig, roundTo, sciTex, tex } from "../engine/numbers";
import { circuitParallel, circuitSeries, particlePanels, plot, refraction } from "../engine/svg";
import { shuffleWithIndex } from "../engine/rng";

const ce = (f: string) => `$\\ce{${f}}$`;
const sig3 = (x: number) => frFixed(roundSig(x, 3), Math.max(0, 2 - Math.floor(Math.log10(Math.abs(roundSig(x, 3)) || 1))));
const pickN = <T,>(rng: Rng, arr: readonly T[], n: number) => rng.shuffle(arr).slice(0, n);

// ───────────── Collège : matière ─────────────

export const p5ChangementsEtat: Generator = {
  meta: {
    id: "p5-changements-etat", title: "Nommer les changements d'état",
    subject: "pc", level: "5e", chapterId: "p5-matiere", notionId: "p5-matiere-etats",
    kinds: ["associer"], summary: "Associer chaque changement d'état à son nom.", randomized: "banque",
  },
  generate(rng, d) {
    const all = [
      ["solide → liquide", "Fusion"], ["liquide → solide", "Solidification"], ["liquide → gaz", "Vaporisation"],
      ["gaz → liquide", "Liquéfaction"], ["solide → gaz", "Sublimation"], ["gaz → solide", "Condensation"],
    ];
    const pairs = d === 1 ? pickN(rng, all.slice(0, 4), 4) : rng.shuffle(all);
    const sh = shuffleWithIndex(rng, pairs.map((p) => p[1]));
    return {
      statement: "Associer chaque transformation à son nom.",
      parts: [{ interaction: { kind: "associer", left: pairs.map((p) => p[0]), right: sh.shuffled, answer: pairs.map((_, i) => sh.indexOf(i)) } }],
      solution: pairs.map((p) => `${p[0]} : **${p[1].toLowerCase()}**.`),
      rappel: "Lors d'un changement d'état, la masse se conserve mais le volume peut varier. Pour un corps pur, la température reste constante pendant le changement d'état.",
    };
  },
};

export const p5ModeleParticulaire: Generator = {
  meta: {
    id: "p5-modele-particulaire", title: "Modèle particulaire des états de la matière",
    subject: "pc", level: "5e", chapterId: "p5-matiere", notionId: "p5-matiere-etats",
    kinds: ["glisser-deposer"], summary: "Glisser l'état physique sous chaque schéma moléculaire.", randomized: "valeurs",
  },
  generate(rng, d) {
    const states = rng.shuffle(["solide", "liquide", "gaz"] as const);
    const names = { solide: "État solide", liquide: "État liquide", gaz: "État gazeux" };
    const tokens = [names.solide, names.liquide, names.gaz, ...(d >= 2 ? ["Mélange homogène"] : [])];
    const sh = shuffleWithIndex(rng, tokens);
    const fig = particlePanels([...states], rng.next, "Trois modèles particulaires");
    return {
      statement: "Chaque schéma représente la même espèce chimique (les molécules sont représentées par des disques). Glisser le bon état physique sous chaque schéma.",
      figure: { kind: "svg", svg: fig },
      parts: [{ interaction: { kind: "glisser-deposer", zones: ["Schéma A", "Schéma B", "Schéma C"], tokens: sh.shuffled, answer: states.map((s) => sh.indexOf(tokens.indexOf(names[s]))) } }],
      solution: [
        "**Solide** : molécules rapprochées, ordonnées et liées entre elles (état compact et ordonné).",
        "**Liquide** : molécules rapprochées mais désordonnées, qui peuvent glisser les unes sur les autres (compact et désordonné).",
        "**Gaz** : molécules éloignées les unes des autres, désordonnées et très agitées (dispersé et désordonné).",
        `Ici : A = ${states[0]}, B = ${states[1]}, C = ${states[2]}.`,
      ],
    };
  },
};

export const p5Melanges: Generator = {
  meta: {
    id: "p5-melanges-classer", title: "Corps purs et mélanges",
    subject: "pc", level: "5e", chapterId: "p5-matiere", notionId: "p5-matiere-melanges",
    kinds: ["classer"], summary: "Classer des substances : corps pur, mélange homogène ou hétérogène.", randomized: "banque",
  },
  generate(rng) {
    const pool: [string, number][] = [
      ["Eau distillée", 0], ["Dioxygène", 0], ["Cuivre", 0], ["Diazote", 0], ["Saccharose (sucre pur)", 0],
      ["Eau salée", 1], ["Air", 1], ["Sirop dilué dans l'eau", 1], ["Vinaigre", 1], ["Eau minérale", 1],
      ["Eau boueuse", 2], ["Eau et huile", 2], ["Jus d'orange avec pulpe", 2], ["Granite", 2], ["Eau gazeuse avec bulles", 2],
    ];
    const chosen = [0, 1, 2].flatMap((c) => pickN(rng, pool.filter((p) => p[1] === c), 2));
    const sh = rng.shuffle(chosen);
    const why = ["une seule espèce chimique", "plusieurs constituants, on ne distingue qu'une seule phase à l'œil nu", "on distingue plusieurs phases à l'œil nu"];
    return {
      statement: "Classer chaque substance dans la bonne catégorie.",
      parts: [{ interaction: { kind: "classer", categories: ["Corps pur", "Mélange homogène", "Mélange hétérogène"], items: sh.map((s) => s[0]), answer: sh.map((s) => s[1]) } }],
      solution: sh.map((s) => `${s[0]} : ${["corps pur", "mélange homogène", "mélange hétérogène"][s[1]]} (${why[s[1]]}).`),
      rappel: "Un corps pur est constitué d'une seule espèce chimique. Un mélange est homogène si on ne peut pas distinguer ses constituants à l'œil nu.",
    };
  },
};

export const p5Conversions: Generator = {
  meta: {
    id: "p6-conversions", title: "Conversions d'unités (volume, masse, durée)",
    subject: "pc", level: "6e", chapterId: "p6-matiere", notionId: "p6-matiere-mesures",
    kinds: ["texte-trous"], summary: "Convertir des volumes, des masses et des durées.", randomized: "valeurs", timeLimit: 150,
  },
  generate(rng) {
    const L = rng.int(2, 95) / 10, g = rng.int(50, 2500), cl = rng.int(5, 150), h = rng.pick([0.5, 1.2, 1.5, 2.25, 0.75, 3.1]), cm3 = rng.int(20, 900);
    const items = [
      { q: `$${tex(L)}\\ \\text{L} =$`, u: "mL", v: L * 1000, s: "1 L = 1 000 mL" },
      { q: `$${tex(g)}\\ \\text{g} =$`, u: "kg", v: g / 1000, s: "1 kg = 1 000 g" },
      { q: `$${tex(cl)}\\ \\text{cL} =$`, u: "L", v: cl / 100, s: "1 L = 100 cL" },
      { q: `$${tex(h)}\\ \\text{h} =$`, u: "min", v: h * 60, s: "1 h = 60 min (attention : ce n'est pas un système décimal !)" },
      { q: `$${tex(cm3)}\\ \\text{cm}^3 =$`, u: "mL", v: cm3, s: "1 cm³ = 1 mL" },
    ];
    return {
      statement: "Effectuer les conversions suivantes.",
      parts: [{ interaction: { kind: "texte-trous", template: items.map((it, i) => `${it.q} [[${i}]] ${it.u}`).join("\n"), blanks: items.map((it) => ({ type: "number", answer: { value: roundTo(it.v, 6) } })) } }],
      solution: items.map((it) => `${it.q} $${tex(roundTo(it.v, 6))}$ ${it.u} — car ${it.s}.`),
    };
  },
};

export const p4Atomes: Generator = {
  meta: {
    id: "p4-formules-molecules", title: "Lire une formule chimique",
    subject: "pc", level: "4e", chapterId: "p4-matiere", notionId: "p4-matiere-molecules",
    kinds: ["tableau"], summary: "Compter les atomes de chaque élément dans une molécule.", randomized: "banque",
  },
  generate(rng, d) {
    const mols: [string, string, number[]][] = [
      ["Eau", "H2O", [0, 2, 1, 0]], ["Dioxyde de carbone", "CO2", [1, 0, 2, 0]], ["Méthane", "CH4", [1, 4, 0, 0]],
      ["Éthanol", "C2H6O", [2, 6, 1, 0]], ["Glucose", "C6H12O6", [6, 12, 6, 0]], ["Ammoniac", "NH3", [0, 3, 0, 1]],
      ["Propane", "C3H8", [3, 8, 0, 0]], ["Butane", "C4H10", [4, 10, 0, 0]], ["Urée", "CH4N2O", [1, 4, 1, 2]], ["Caféine", "C8H10N4O2", [8, 10, 2, 4]],
    ];
    const chosen = pickN(rng, d === 1 ? mols.slice(0, 7) : mols, d === 3 ? 3 : 2);
    return {
      statement: "Compléter le tableau en indiquant le nombre d'atomes de chaque élément dans la molécule, puis le nombre total d'atomes.",
      parts: [{ interaction: { kind: "tableau", headers: ["Molécule", "C", "H", "O", "N", "Total"], rows: chosen.map(([n, f, c]) => ({ label: `${n} ${ce(f)}`, cells: [...c.map((v) => ({ answer: { value: v } })), { answer: { value: c.reduce((s, x) => s + x, 0) } }] })) } }],
      solution: chosen.map(([n, f, c]) => `${n} ${ce(f)} : ${c[0]} C, ${c[1]} H, ${c[2]} O, ${c[3]} N, soit ${c.reduce((s, x) => s + x, 0)} atomes.`),
      rappel: "Dans une formule, l'indice en bas à droite d'un symbole indique le nombre d'atomes de cet élément ; l'absence d'indice signifie 1. Un élément absent de la formule compte 0.",
    };
  },
};

// ───────────── Collège : mouvement, électricité, énergie, signaux ─────────────

export const p4Vitesse: Generator = {
  meta: {
    id: "p4-vitesse-moyenne", title: "Calculer une vitesse moyenne",
    subject: "pc", level: "4e", chapterId: "p4-mouvement", notionId: "p4-mouvement-vitesse",
    kinds: ["numerique"], summary: "Relation v = d/t, choix de l'unité (km/h ou m/s) et conversions.", randomized: "valeurs", timeLimit: 180,
  },
  generate(rng, d) {
    const v = rng.pick([18, 36, 45, 54, 72, 90, 108]);
    const t = rng.pick([10, 15, 20, 30, 40, 45, 90]);
    const dist = (v * t) / 60;
    const who = rng.pick(["Un cycliste", "Un train régional", "Une voiture", "Un scooter"]);
    if (d < 3) {
      return {
        statement: `${who} parcourt $${tex(dist)}$ km en $${t}$ minutes.\nCalculer sa vitesse moyenne. ${d === 2 ? "Exprimer le résultat en m/s." : "Choisir l'unité du résultat."}`,
        parts: [{ interaction: { kind: "numerique", label: "$v =$", answer: { value: v / 3.6, tol: 0.06, unit: { base: "m/s", choices: d === 2 ? ["m/s"] : ["km/h", "m/s"] } } } }],
        solution: [
          `$t = ${t}\\ \\text{min} = \\dfrac{${t}}{60}\\ \\text{h} = ${tex(t / 60, 4)}\\ \\text{h}$`,
          `$v = \\dfrac{d}{t} = \\dfrac{${tex(dist)}\\ \\text{km}}{${tex(t / 60, 4)}\\ \\text{h}} = ${v}\\ \\text{km/h}$`,
          `Pour convertir en m/s, on divise par 3,6 : $v = \\dfrac{${v}}{3{,}6} = ${tex(v / 3.6)}\\ \\text{m/s}$.`,
        ],
        rappel: "$v = \\dfrac{d}{t}$. $1\\ \\text{m/s} = 3{,}6\\ \\text{km/h}$ car 1 h = 3 600 s et 1 km = 1 000 m.",
      };
    }
    const vms = v / 3.6;
    const ts = t * 60;
    return {
      statement: `${who} roule à la vitesse constante de $${tex(vms)}$ m/s pendant $${t}$ minutes.\nCalculer la distance parcourue.`,
      parts: [{ interaction: { kind: "numerique", label: "$d =$", answer: { value: vms * ts, unit: { base: "m", choices: ["m", "km"] } } } }],
      solution: [
        `La vitesse est en m/s : on convertit la durée en secondes, $t = ${t} \\times 60 = ${ts}$ s.`,
        `$d = v \\times t = ${tex(vms)} \\times ${ts} = ${tex(vms * ts)}$ m, soit $${tex((vms * ts) / 1000)}$ km.`,
      ],
      rappel: "$d = v \\times t$ : les unités doivent être cohérentes (m/s avec s, km/h avec h).",
    };
  },
};

export const p4LoiOhm: Generator = {
  meta: {
    id: "p4-loi-ohm", title: "Appliquer la loi d'Ohm",
    subject: "pc", level: "4e", chapterId: "p4-electricite", notionId: "p4-electricite-ohm",
    kinds: ["numerique"], summary: "U = R × I : calculer une tension, une intensité ou une résistance.", randomized: "valeurs",
  },
  generate(rng, d) {
    const R = rng.pick([10, 22, 33, 47, 68, 100, 150, 220, 330, 470]);
    const ImA = rng.pick([10, 20, 25, 30, 40, 50, 60, 80, 100, 120]);
    const U = roundTo((R * ImA) / 1000, 6);
    const which = d === 1 ? "U" : d === 2 ? "I" : rng.pick(["I", "R"] as const);
    const fig = circuitSeries([{ type: "R", label: which === "R" ? "R = ?" : `R = ${R} Ω` }], which === "U" ? "U = ?" : `U = ${fr(U)} V`, "Circuit série : générateur et résistance");
    const base = { U: { base: "V", choices: ["V", "mV"] }, I: { base: "mA", choices: ["A", "mA"] }, R: { base: "Ω", choices: ["Ω", "kΩ"] } }[which];
    const value = which === "U" ? U : which === "I" ? ImA : R;
    const statement = which === "U"
      ? `Une résistance $R = ${R}\\ \\Omega$ est traversée par un courant d'intensité $I = ${ImA}$ mA.\nCalculer la tension $U$ à ses bornes.`
      : which === "I"
        ? `On applique une tension $U = ${tex(U)}$ V aux bornes d'une résistance $R = ${R}\\ \\Omega$.\nCalculer l'intensité $I$ du courant qui la traverse.`
        : `Une résistance est traversée par un courant de $${ImA}$ mA lorsque la tension à ses bornes vaut $${tex(U)}$ V.\nCalculer la valeur de $R$.`;
    const sol = which === "U"
      ? [`On convertit : $I = ${ImA}\\ \\text{mA} = ${tex(ImA / 1000)}\\ \\text{A}$.`, `Loi d'Ohm : $U = R \\times I = ${R} \\times ${tex(ImA / 1000)} = ${tex(U)}\\ \\text{V}$.`]
      : which === "I"
        ? [`Loi d'Ohm : $U = R \\times I$, donc $I = \\dfrac{U}{R} = \\dfrac{${tex(U)}}{${R}} = ${tex(ImA / 1000)}\\ \\text{A}$.`, `Soit $I = ${ImA}$ mA.`]
        : [`On convertit : $I = ${tex(ImA / 1000)}$ A.`, `Loi d'Ohm : $R = \\dfrac{U}{I} = \\dfrac{${tex(U)}}{${tex(ImA / 1000)}} = ${R}\\ \\Omega$.`];
    return {
      statement, figure: { kind: "svg", svg: fig },
      parts: [{ interaction: { kind: "numerique", label: `$${which} =$`, answer: { value, unit: base } } }],
      solution: sol,
      rappel: "Loi d'Ohm : $U = R \\times I$ avec $U$ en volts (V), $R$ en ohms (Ω) et $I$ en ampères (A).",
    };
  },
};

export const p4Tensions: Generator = {
  meta: {
    id: "p4-circuit-serie", title: "Circuit en série : tensions et intensité",
    subject: "pc", level: "4e", chapterId: "p4-electricite", notionId: "p4-electricite-lois",
    kinds: ["numerique"], summary: "Loi d'additivité des tensions et loi d'unicité de l'intensité.", randomized: "valeurs",
  },
  generate(rng, d) {
    const UG = rng.pick([4.5, 6, 9, 12]);
    const n = d === 3 ? 3 : 2;
    const parts1: number[] = [];
    let rest = UG;
    for (let i = 0; i < n - 1; i++) { const u = roundTo(rng.int(5, Math.round(rest * 10) - 5 * (n - 1 - i)) / 10, 1); parts1.push(u); rest = roundTo(rest - u, 1); }
    const last = rest;
    const I = rng.pick([0.12, 0.15, 0.2, 0.25, 0.3]);
    const lab = (i: number) => `L${"₁₂₃"[i]}`;
    const fig = circuitSeries(Array.from({ length: n }, (_, i) => ({ type: "L" as const, label: lab(i) })), `G : ${fr(UG)} V`, "Circuit série");
    const parts = [{ prompt: `Calculer la tension $U_{${n}}$ aux bornes de la lampe L${n}.`, interaction: { kind: "numerique" as const, label: `$U_{${n}} =$`, answer: { value: last, unit: { base: "V", choices: ["V", "mV"] } } } }];
    if (d >= 2) parts.push({ prompt: `L'intensité du courant dans L₁ vaut $${tex(I)}$ A. Quelle est l'intensité dans L${n} ?`, interaction: { kind: "numerique" as const, label: `$I_{${n}} =$`, answer: { value: I, unit: { base: "A", choices: ["A", "mA"] } } } });
    return {
      statement: `Le générateur G délivre une tension de $${tex(UG)}$ V. On mesure ${parts1.map((u, i) => `$U_{${i + 1}} = ${tex(u)}$ V aux bornes de L${i + 1}`).join(" et ")}.`,
      figure: { kind: "svg", svg: fig },
      parts,
      solution: [
        `Dans un circuit en série, la tension aux bornes du générateur est égale à la somme des tensions aux bornes des autres dipôles : $U_G = ${Array.from({ length: n }, (_, i) => `U_{${i + 1}}`).join(" + ")}$.`,
        `$U_{${n}} = ${tex(UG)} - ${parts1.map((u) => tex(u)).join(" - ")} = ${tex(last)}$ V.`,
        ...(d >= 2 ? [`Dans un circuit en série, l'intensité est la même en tout point : $I_{${n}} = ${tex(I)}$ A.`] : []),
      ],
    };
  },
};

export const p4LoiNoeuds: Generator = {
  meta: {
    id: "p4-loi-noeuds", title: "Circuit en dérivation : loi des nœuds",
    subject: "pc", level: "4e", chapterId: "p4-electricite", notionId: "p4-electricite-lois",
    kinds: ["numerique"], summary: "L'intensité dans la branche principale est la somme des intensités dans les branches dérivées.", randomized: "valeurs",
  },
  generate(rng, d) {
    const n = d === 3 ? 3 : 2;
    const Is = Array.from({ length: n }, () => rng.pick([60, 80, 100, 120, 150, 180, 200, 250, 300]));
    const tot = Is.reduce((s, x) => s + x, 0);
    const findMain = d === 1;
    const fig = circuitParallel(Is.map((I, i) => ({ label: `L${"₁₂₃"[i]}`, current: !findMain && i === n - 1 ? `I${"₁₂₃"[i]} = ?` : `I${"₁₂₃"[i]} = ${I} mA` })), "G", findMain ? "I = ?" : `I = ${fr(tot / 1000)} A`, "Circuit en dérivation");
    return {
      statement: findMain
        ? `Dans le circuit ci-contre, on mesure ${Is.map((I, i) => `$I_${i + 1} = ${I}$ mA`).join(" et ")}. Calculer l'intensité $I$ du courant dans la branche principale.`
        : `L'intensité dans la branche principale vaut $I = ${tex(tot / 1000)}$ A. On mesure ${Is.slice(0, -1).map((I, i) => `$I_${i + 1} = ${I}$ mA`).join(" et ")}. Calculer $I_${n}$.`,
      figure: { kind: "svg", svg: fig },
      parts: [{ interaction: { kind: "numerique", label: findMain ? "$I =$" : `$I_${n} =$`, answer: { value: findMain ? tot : Is[n - 1], unit: { base: "mA", choices: ["mA", "A"] } } } }],
      solution: findMain
        ? [`Loi des nœuds : $I = ${Is.map((_, i) => `I_${i + 1}`).join(" + ")} = ${Is.join(" + ")} = ${tot}$ mA, soit $${tex(tot / 1000)}$ A.`]
        : [`On convertit : $I = ${tex(tot / 1000)}\\ \\text{A} = ${tot}\\ \\text{mA}$.`, `Loi des nœuds : $I_${n} = I - ${Is.slice(0, -1).map((_, i) => `I_${i + 1}`).join(" - ")} = ${tot} - ${Is.slice(0, -1).join(" - ")} = ${Is[n - 1]}$ mA.`],
      rappel: "Dans un circuit en dérivation, l'intensité du courant dans la branche principale est égale à la somme des intensités dans les branches dérivées.",
    };
  },
};

export const p3Poids: Generator = {
  meta: {
    id: "p3-poids-masse", title: "Poids et masse",
    subject: "pc", level: "3e", chapterId: "p3-mouvement", notionId: "p3-mouvement-poids",
    kinds: ["numerique", "qcm"], summary: "Relation P = m × g sur différents astres.", randomized: "valeurs",
  },
  generate(rng, d) {
    const astre = rng.pick([{ n: "la Terre", g: 9.81 }, { n: "la Lune", g: 1.62 }, { n: "Mars", g: 3.71 }]);
    const m = rng.int(15, 95) + (d === 3 ? rng.int(1, 9) / 10 : 0);
    const P = m * astre.g;
    const parts: Part[] = [
      { prompt: `Calculer le poids $P$ d'un astronaute de masse $${tex(m)}$ kg sur ${astre.n} (résultat avec 3 chiffres significatifs).`, interaction: { kind: "numerique" as const, label: "$P =$", suffix: "N", answer: { value: P, sigFigs: 3 } } },
    ];
    const opts = ["Elle est identique", "Elle est plus petite", "Elle est plus grande", "Elle est nulle"];
    if (d >= 2) parts.push({ prompt: "Si l'astronaute se rend sur un autre astre, que devient sa masse ?", interaction: { kind: "qcm", options: opts, answer: [0] } });
    return {
      statement: `Intensité de la pesanteur sur ${astre.n} : $g = ${tex(astre.g)}$ N/kg.`,
      parts,
      solution: [
        `$P = m \\times g = ${tex(m)} \\times ${tex(astre.g)} \\approx ${sig3(P).replace(",", "{,}").replace(/\u202f/g, "\\,")}$ N.`,
        ...(d >= 2 ? ["La masse (quantité de matière, en kg) ne dépend pas du lieu : elle est identique. Seul le poids (force, en N) change."] : []),
      ],
      rappel: "Le poids $P$ (en N) est la force d'attraction exercée par l'astre : $P = m \\times g$. La masse $m$ (en kg) ne dépend pas du lieu.",
    };
  },
};

export const p3Energie: Generator = {
  meta: {
    id: "p3-energie-electrique", title: "Énergie électrique consommée",
    subject: "pc", level: "3e", chapterId: "p3-energie", notionId: "p3-energie-puissance",
    kinds: ["numerique"], summary: "E = P × t en wattheures, kilowattheures ou joules.", randomized: "valeurs",
  },
  generate(rng, d) {
    const app = rng.pick([{ n: "un four", P: 2000 }, { n: "un radiateur", P: 1500 }, { n: "une bouilloire", P: 2200 }, { n: "un téléviseur", P: 100 }, { n: "une lampe LED", P: 10 }, { n: "un ordinateur", P: 60 }]);
    const tmin = rng.pick([15, 30, 45, 90, 120, 150, 180]);
    const E_J = app.P * tmin * 60;
    const unit = d === 1 ? { base: "J", choices: ["Wh", "kWh"] } : d === 2 ? { base: "J", choices: ["kWh"] } : { base: "J", choices: ["J", "kJ"] };
    return {
      statement: `${app.n.charAt(0).toUpperCase() + app.n.slice(1)} de puissance $P = ${tex(app.P)}$ W fonctionne pendant $${tmin}$ min.\nCalculer l'énergie électrique consommée${d === 2 ? " en kWh" : d === 3 ? " en joules (ou kJ)" : ""}.`,
      parts: [{ interaction: { kind: "numerique", label: "$E =$", answer: { value: E_J, unit } } }],
      solution: [
        `$t = ${tmin}\\ \\text{min} = ${tex(tmin / 60, 4)}\\ \\text{h} = ${tmin * 60}\\ \\text{s}$`,
        `En wattheures : $E = P \\times t = ${tex(app.P)} \\times ${tex(tmin / 60, 4)} = ${tex((app.P * tmin) / 60)}\\ \\text{Wh} = ${tex((app.P * tmin) / 60000)}\\ \\text{kWh}$.`,
        `En joules : $E = ${tex(app.P)} \\times ${tmin * 60} = ${tex(E_J)}\\ \\text{J}$.`,
      ],
      rappel: "$E = P \\times t$ : avec $P$ en W et $t$ en s, $E$ est en joules ; avec $P$ en kW et $t$ en h, $E$ est en kWh. $1\\ \\text{kWh} = 3{,}6 \\times 10^6\\ \\text{J}$.",
    };
  },
};

export const p4LumiereSon: Generator = {
  meta: {
    id: "p4-lumiere-son-vf", title: "Lumière et son : vrai ou faux ?",
    subject: "pc", level: "4e", chapterId: "p4-signaux", notionId: "p4-signaux-propagation",
    kinds: ["vrai-faux"], summary: "Propagation, vitesse et fréquence des signaux sonores et lumineux.", randomized: "banque", timeLimit: 90,
  },
  generate(rng) {
    const pool: [string, boolean, string][] = [
      ["Le son peut se propager dans le vide.", false, "Le son a besoin d'un milieu matériel (air, eau, solide) pour se propager."],
      ["La lumière peut se propager dans le vide.", true, "La lumière du Soleil nous parvient à travers le vide spatial."],
      ["Dans l'air, le son se propage à environ 340 m/s.", true, "Valeur à retenir pour l'air à température ambiante."],
      ["Dans le vide, la lumière se propage à environ 300 000 km/s.", true, "$c \\approx 3{,}00 \\times 10^8$ m/s."],
      ["Le son se propage plus vite dans l'air que dans l'eau.", false, "Dans l'eau, le son va à environ 1 500 m/s, bien plus vite que dans l'air."],
      ["Un son de fréquence 30 000 Hz est audible par l'être humain.", false, "L'oreille humaine perçoit environ de 20 Hz à 20 000 Hz : c'est un ultrason."],
      ["Plus la fréquence d'un son est élevée, plus le son est aigu.", true, "Les sons de basse fréquence sont graves, ceux de haute fréquence sont aigus."],
      ["L'année-lumière est une unité de durée.", false, "C'est une unité de distance : la distance parcourue par la lumière en une année."],
      ["Dans un milieu homogène et transparent, la lumière se propage en ligne droite.", true, "C'est le principe de propagation rectiligne."],
      ["Un son de fréquence 10 Hz est un infrason.", true, "En dessous de 20 Hz, on parle d'infrasons."],
    ];
    const chosen = pickN(rng, pool, 5);
    return {
      statement: "Indiquer si chaque affirmation est vraie ou fausse.",
      parts: [{ interaction: { kind: "vrai-faux", items: chosen.map((c) => c[0]), answer: chosen.map((c) => c[1]) } }],
      solution: chosen.map((c, i) => `${i + 1}. **${c[1] ? "Vrai" : "Faux"}** : ${c[2]}`),
    };
  },
};

export const p4Orage: Generator = {
  meta: {
    id: "p4-distance-orage", title: "À quelle distance est l'orage ?",
    subject: "pc", level: "4e", chapterId: "p4-signaux", notionId: "p4-signaux-propagation",
    kinds: ["numerique"], summary: "Utiliser la vitesse du son pour estimer une distance.", randomized: "valeurs",
  },
  generate(rng, d) {
    const dt = rng.int(15, 120) / 10;
    const v = 340;
    if (d < 3) {
      return {
        statement: `Lors d'un orage, on entend le tonnerre $${tex(dt)}$ s après avoir vu l'éclair. On considère que la lumière arrive instantanément et que le son se propage à $${v}$ m/s dans l'air.\nÀ quelle distance l'éclair s'est-il produit ?`,
        parts: [{ interaction: { kind: "numerique", label: "$d =$", answer: { value: v * dt, unit: { base: "m", choices: ["m", "km"] } } } }],
        solution: [
          "La lumière (environ 300 000 km/s) arrive quasi instantanément ; la durée mesurée est celle de la propagation du son.",
          `$d = v \\times t = ${v} \\times ${tex(dt)} = ${tex(v * dt)}$ m, soit $${tex((v * dt) / 1000)}$ km.`,
        ],
      };
    }
    const dist = rng.int(5, 40) * 100;
    return {
      statement: `Un éclair se produit à $${tex(dist)}$ m d'un observateur. Le son se propage à $${v}$ m/s.\nCombien de temps après l'éclair entendra-t-il le tonnerre ? (arrondir au dixième de seconde)`,
      parts: [{ interaction: { kind: "numerique", label: "$t \\approx$", suffix: "s", answer: { value: roundTo(dist / v, 1), tol: 0.05, roundingLabel: "au dixième", decimals: 1 } } }],
      solution: [`$t = \\dfrac{d}{v} = \\dfrac{${tex(dist)}}{${v}} \\approx ${tex(roundTo(dist / v, 1))}$ s.`],
    };
  },
};

// ───────────── Lycée ─────────────

const REACTIONS: { r: [number, string][]; p: [number, string][] }[] = [
  { r: [[1, "CH4"], [2, "O2"]], p: [[1, "CO2"], [2, "H2O"]] },
  { r: [[2, "H2"], [1, "O2"]], p: [[2, "H2O"]] },
  { r: [[1, "C3H8"], [5, "O2"]], p: [[3, "CO2"], [4, "H2O"]] },
  { r: [[4, "Fe"], [3, "O2"]], p: [[2, "Fe2O3"]] },
  { r: [[1, "N2"], [3, "H2"]], p: [[2, "NH3"]] },
  { r: [[2, "C2H6"], [7, "O2"]], p: [[4, "CO2"], [6, "H2O"]] },
  { r: [[1, "Cu^2+"], [2, "HO^-"]], p: [[1, "Cu(OH)2"]] },
  { r: [[1, "Fe^3+"], [3, "HO^-"]], p: [[1, "Fe(OH)3"]] },
  { r: [[1, "Zn"], [2, "H^+"]], p: [[1, "Zn^2+"], [1, "H2"]] },
  { r: [[1, "C2H6O"], [3, "O2"]], p: [[2, "CO2"], [3, "H2O"]] },
  { r: [[2, "Al"], [6, "H^+"]], p: [[2, "Al^3+"], [3, "H2"]] },
];

export const p2Equilibrer: Generator = {
  meta: {
    id: "p2-equilibrer-equation", title: "Ajuster une équation de réaction",
    subject: "pc", level: "2nde", chapterId: "p2-transformations", notionId: "p2-transformations-equations",
    kinds: ["texte-trous"], summary: "Trouver les plus petits nombres stœchiométriques entiers (conservation des éléments et des charges).", randomized: "banque",
  },
  generate(rng, d) {
    const pool = d === 1 ? REACTIONS.slice(0, 5) : d === 2 ? REACTIONS.slice(0, 10) : REACTIONS.slice(5);
    const R = rng.pick(pool);
    const all = [...R.r, ...R.p];
    let k = 0;
    const side = (arr: [number, string][]) => arr.map(([, f]) => `[[${k++}]] $\\ce{${f}}$`).join(" $+$ ");
    const template = `${side(R.r)} $\\longrightarrow$ ${side(R.p)}`;
    const disp = (arr: [number, string][]) => arr.map(([c, f]) => `${c === 1 ? "" : c + "\\,"}${f}`).join(" + ");
    return {
      statement: "Ajuster l'équation de réaction avec les plus petits nombres entiers possibles (écrire 1 si nécessaire).",
      parts: [{ interaction: { kind: "texte-trous", template, blanks: all.map(([c]) => ({ type: "number", answer: { value: c }, width: 3 })), proportional: true } }],
      solution: [
        "Une équation de réaction est ajustée lorsque chaque élément est présent en même nombre de chaque côté de la flèche, et que les charges électriques sont conservées.",
        "On commence par les éléments présents dans une seule espèce de chaque côté, puis on ajuste O (ou H) en dernier.",
        `$\\ce{${disp(R.r)} -> ${disp(R.p)}}$`,
      ],
      rappel: "Les nombres stœchiométriques se placent devant les formules ; on ne modifie jamais les indices d'une formule.",
    };
  },
};

const SPECIES: [string, string, number][] = [
  ["eau", "H2O", 18.0], ["dioxyde de carbone", "CO2", 44.0], ["chlorure de sodium", "NaCl", 58.5], ["glucose", "C6H12O6", 180.0],
  ["éthanol", "C2H6O", 46.0], ["carbonate de calcium", "CaCO3", 100.1], ["hydroxyde de sodium", "NaOH", 40.0], ["saccharose", "C12H22O11", 342.0],
];

export const p2QuantiteMatiere: Generator = {
  meta: {
    id: "p2-quantite-matiere", title: "Calculer une quantité de matière",
    subject: "pc", level: "2nde", chapterId: "p2-matiere", notionId: "p2-matiere-mole",
    kinds: ["numerique"], summary: "n = m / M, avec chiffres significatifs et unité (mol ou mmol).", randomized: "valeurs",
  },
  generate(rng, d) {
    const [name, f, M] = rng.pick(SPECIES);
    const m = d === 1 ? rng.int(10, 99) * (M > 100 ? 2 : 1) : rng.int(100, 999) / (d === 3 ? 100 : 10);
    const n = m / M;
    return {
      statement: `On dispose d'un échantillon ${/^[aeiouéèh]/i.test(name) ? "d'" : "de "}${name} ${ce(f)} de masse $m = ${tex(m)}$ g. La masse molaire de cette espèce est $M = ${tex(M)}$ g·mol⁻¹.\nCalculer la quantité de matière $n$ contenue dans l'échantillon (3 chiffres significatifs).`,
      parts: [{ interaction: { kind: "numerique", label: "$n =$", answer: { value: n, sigFigs: 3, unit: { base: "mol", choices: ["mol", "mmol"] } } } }],
      solution: [
        "$n = \\dfrac{m}{M}$ avec $m$ en g et $M$ en g·mol⁻¹ ; $n$ est alors en mol.",
        `$n = \\dfrac{${tex(m)}}{${tex(M)}} \\approx ${sciTex(n, 3)}$ mol.`,
        "Le résultat est donné avec 3 chiffres significatifs, comme les données.",
      ],
      rappel: "Une mole contient $N_A = 6{,}02 \\times 10^{23}$ entités. $n = \\dfrac{m}{M}$.",
    };
  },
};

export const p2Dilution: Generator = {
  meta: {
    id: "p2-dilution", title: "Préparer une solution par dilution",
    subject: "pc", level: "2nde", chapterId: "p2-matiere", notionId: "p2-matiere-concentration",
    kinds: ["numerique"], summary: "Conservation de la quantité de soluté : C₀ × V₀ = C₁ × V₁.", randomized: "valeurs",
  },
  generate(rng, d) {
    const C0 = rng.pick([0.1, 0.2, 0.5, 1.0, 2.0]);
    const V1 = rng.pick([50, 100, 200, 250, 500]);
    const F = rng.pick([2, 4, 5, 10, 20, 25].filter((x) => Number.isInteger(V1 / x)));
    const V0 = V1 / F, C1 = C0 / F;
    const parts = [];
    if (d === 1 || d === 3) parts.push({ prompt: "Quel volume $V_0$ de solution mère faut-il prélever ?", interaction: { kind: "numerique" as const, label: "$V_0 =$", answer: { value: V0, unit: { base: "mL", choices: ["mL", "L"] } } } });
    if (d >= 2) parts.push({ prompt: "Quel est le facteur de dilution $F$ ?", interaction: { kind: "numerique" as const, label: "$F =$", answer: { value: F } } });
    const statement = d === 2
      ? `On dilue une solution mère de concentration $C_0 = ${tex(C0)}$ mol·L⁻¹ pour obtenir $V_1 = ${V1}$ mL de solution fille de concentration $C_1 = ${tex(C1)}$ mol·L⁻¹.`
      : `On souhaite préparer $V_1 = ${V1}$ mL d'une solution de concentration $C_1 = ${tex(C1)}$ mol·L⁻¹ à partir d'une solution mère de concentration $C_0 = ${tex(C0)}$ mol·L⁻¹.`;
    return {
      statement, parts,
      solution: [
        "Lors d'une dilution, la quantité de soluté se conserve : $C_0 \\times V_0 = C_1 \\times V_1$.",
        `$V_0 = \\dfrac{C_1 \\times V_1}{C_0} = \\dfrac{${tex(C1)} \\times ${V1}}{${tex(C0)}} = ${tex(V0)}$ mL.`,
        `Facteur de dilution : $F = \\dfrac{C_0}{C_1} = \\dfrac{V_1}{V_0} = ${F}$.`,
      ],
      rappel: "On prélève $V_0$ avec une pipette jaugée et on prépare la solution fille dans une fiole jaugée de volume $V_1$.",
    };
  },
};

export const p2ConcentrationMassique: Generator = {
  meta: {
    id: "p2-concentration-massique", title: "Concentration en masse d'une solution",
    subject: "pc", level: "2nde", chapterId: "p2-matiere", notionId: "p2-matiere-concentration",
    kinds: ["numerique"], summary: "Cm = m / V avec conversion du volume en litres.", randomized: "valeurs",
  },
  generate(rng) {
    const m = rng.int(100, 999) / 100;
    const VmL = rng.pick([50.0, 100.0, 200.0, 250.0, 500.0]);
    const Cm = m / (VmL / 1000);
    const solute = rng.pick(["de sulfate de cuivre", "de sel", "de sucre", "de permanganate de potassium"]);
    return {
      statement: `On dissout $m = ${tex(m)}$ g ${solute} dans de l'eau pour obtenir $V = ${tex(VmL)}{,}0$ mL de solution.\nCalculer la concentration en masse $C_m$ du soluté (3 chiffres significatifs).`,
      parts: [{ interaction: { kind: "numerique", label: "$C_m =$", answer: { value: Cm, sigFigs: 3, unit: { base: "g/L", choices: ["g/L", "mg/L"] } } } }],
      solution: [
        `On convertit le volume : $V = ${tex(VmL)}\\ \\text{mL} = ${tex(VmL / 1000)}\\ \\text{L}$.`,
        `$C_m = \\dfrac{m}{V} = \\dfrac{${tex(m)}}{${tex(VmL / 1000)}} = ${sig3(Cm).replace(",", "{,}")}\\ \\text{g·L}^{-1}$.`,
      ],
      rappel: "$C_m = \\dfrac{m_{\\text{soluté}}}{V_{\\text{solution}}}$ en g·L⁻¹.",
    };
  },
};

export const p2StructureAtome: Generator = {
  meta: {
    id: "p2-structure-atome", title: "Composition d'un atome ou d'un ion",
    subject: "pc", level: "2nde", chapterId: "p2-matiere", notionId: "p2-matiere-atome",
    kinds: ["tableau"], summary: "Déduire protons, neutrons et électrons de la notation ᴬ_Z X.", randomized: "banque",
  },
  generate(rng, d) {
    const E: [string, number, number][] = [["C", 12, 6], ["O", 16, 8], ["Na", 23, 11], ["Cl", 35, 17], ["Fe", 56, 26], ["Al", 27, 13], ["Mg", 24, 12], ["Cu", 63, 29], ["K", 39, 19], ["Ca", 40, 20], ["N", 14, 7], ["S", 32, 16]];
    const ions: Record<string, number> = { Na: 1, Cl: -1, Mg: 2, O: -2, Al: 3, K: 1, Ca: 2, S: -2, Fe: 2, Cu: 2 };
    const chosen = pickN(rng, E, d === 1 ? 2 : 3);
    const rows = chosen.map(([X, A, Z], i) => {
      const q = d >= 2 && i > 0 && ions[X] !== undefined ? ions[X] : 0;
      const ch = q === 0 ? "" : `^{${Math.abs(q) === 1 ? "" : Math.abs(q)}${q > 0 ? "+" : "-"}}`;
      return { X, A, Z, q, label: `$^{${A}}_{${Z}}\\mathrm{${X}}${ch}$` };
    });
    return {
      statement: "Compléter le tableau donnant la composition de chaque entité.",
      parts: [{ interaction: { kind: "tableau", headers: ["Entité", "Protons", "Neutrons", "Électrons"], rows: rows.map((r) => ({ label: r.label, cells: [{ answer: { value: r.Z } }, { answer: { value: r.A - r.Z } }, { answer: { value: r.Z - r.q } }] })) } }],
      solution: [
        "Dans la notation $^{A}_{Z}\\mathrm{X}$ : $Z$ est le nombre de protons (numéro atomique), $A$ le nombre de nucléons. Neutrons : $N = A - Z$.",
        "Un atome est électriquement neutre : autant d'électrons que de protons. Un ion $\\mathrm{X}^{n+}$ a perdu $n$ électrons ; un ion $\\mathrm{X}^{n-}$ en a gagné $n$.",
        ...rows.map((r) => `${r.label} : ${r.Z} protons, ${r.A} − ${r.Z} = ${r.A - r.Z} neutrons, ${r.Z - r.q} électrons.`),
      ],
    };
  },
};

export const p2Refraction: Generator = {
  meta: {
    id: "p2-refraction", title: "Loi de Snell-Descartes (réfraction)",
    subject: "pc", level: "2nde", chapterId: "p2-ondes", notionId: "p2-ondes-refraction",
    kinds: ["numerique"], summary: "Calculer un angle de réfraction : n₁ sin i₁ = n₂ sin i₂.", randomized: "valeurs",
  },
  generate(rng, d) {
    const mil = rng.pick([{ n: "l'eau", v: 1.33 }, { n: "le verre", v: 1.5 }]);
    const fromAir = d < 3;
    const i1 = fromAir ? rng.int(20, 70) : rng.int(15, 40);
    const n1 = fromAir ? 1.0 : mil.v, n2 = fromAir ? mil.v : 1.0;
    const s = (n1 * Math.sin((i1 * Math.PI) / 180)) / n2;
    const i2 = (Math.asin(s) * 180) / Math.PI;
    const fig = refraction(i1, i2, fromAir ? "air (n₁ = 1,00)" : `${mil.n} (n₁ = ${fr(mil.v, 2)})`, fromAir ? `${mil.n} (n₂ = ${fr(mil.v, 2)})` : "air (n₂ = 1,00)", "Réfraction d'un rayon lumineux");
    return {
      statement: `Un rayon lumineux passe de ${fromAir ? "l'air" : mil.n} dans ${fromAir ? mil.n : "l'air"} avec un angle d'incidence $i_1 = ${i1}°$.\nCalculer l'angle de réfraction $i_2$, arrondi au degré.`,
      figure: { kind: "svg", svg: fig, caption: "Angles mesurés par rapport à la normale." },
      parts: [{ interaction: { kind: "numerique", label: "$i_2 \\approx$", suffix: "°", answer: { value: Math.round(i2), tol: 0.5, roundingLabel: "au degré" } } }],
      solution: [
        "Loi de Snell-Descartes : $n_1 \\sin i_1 = n_2 \\sin i_2$.",
        `$\\sin i_2 = \\dfrac{n_1 \\sin i_1}{n_2} = \\dfrac{${tex(n1, 2)} \\times \\sin(${i1}°)}{${tex(n2, 2)}} \\approx ${tex(roundTo(s, 3))}$`,
        `$i_2 = \\arcsin(${tex(roundTo(s, 3))}) \\approx ${Math.round(i2)}°$.`,
        fromAir ? "Le rayon se rapproche de la normale en entrant dans un milieu plus réfringent." : "Le rayon s'écarte de la normale en passant dans un milieu moins réfringent.",
      ],
    };
  },
};

export const p2Signal: Generator = {
  meta: {
    id: "p2-periode-frequence", title: "Période et fréquence d'un signal",
    subject: "pc", level: "2nde", chapterId: "p2-ondes", notionId: "p2-ondes-signaux",
    kinds: ["numerique"], summary: "Lire une période sur un oscillogramme et calculer la fréquence.", randomized: "valeurs",
  },
  generate(rng) {
    const T = rng.pick([2, 2.5, 4, 5, 8, 10]);
    const A = rng.pick([2, 3, 4]);
    const tmax = T * rng.pick([2, 3]) + (T <= 4 ? T : 0);
    const fig = plot({
      xmin: 0, xmax: tmax, ymin: -5, ymax: 5, gridX: T / 4, labelX: T, gridY: 1, labelY: 1,
      fns: [{ f: (t) => A * Math.sin((2 * Math.PI * t) / T), color: "#16a34a" }], xName: "t (ms)", yName: "u (V)", title: "Oscillogramme",
    });
    const f = 1000 / T;
    return {
      statement: "On visualise une tension périodique sur l'écran d'un oscilloscope.",
      figure: { kind: "svg", svg: fig },
      parts: [
        { prompt: "Lire la période $T$ du signal.", interaction: { kind: "numerique", label: "$T =$", answer: { value: T, unit: { base: "ms", choices: ["ms", "s"] } } } },
        { prompt: "En déduire la fréquence $f$.", interaction: { kind: "numerique", label: "$f =$", answer: { value: f, unit: { base: "Hz", choices: ["Hz", "kHz"] } } } },
        { prompt: "Lire l'amplitude $U_m$ (tension maximale).", interaction: { kind: "numerique", label: "$U_m =$", suffix: "V", answer: { value: A } } },
      ],
      solution: [
        `La période est la plus petite durée au bout de laquelle le signal se répète : $T = ${tex(T)}$ ms (mesurer plusieurs périodes améliore la précision).`,
        `$f = \\dfrac{1}{T} = \\dfrac{1}{${tex(T / 1000)}\\ \\text{s}} = ${tex(f)}$ Hz.`,
        `L'amplitude est la valeur maximale de la tension : $U_m = ${A}$ V.`,
      ],
      rappel: "$f = \\dfrac{1}{T}$ avec $T$ en secondes et $f$ en hertz (Hz).",
    };
  },
};

export const p2Dissolution: Generator = {
  meta: {
    id: "p2-protocole-solution", title: "Protocole : préparer une solution",
    subject: "pc", level: "2nde", chapterId: "p2-matiere", notionId: "p2-matiere-concentration",
    kinds: ["ordonner"], summary: "Remettre dans l'ordre les étapes d'une dissolution ou d'une dilution.", randomized: "banque",
  },
  generate(rng) {
    const dissolution = rng.next() < 0.5;
    const steps = dissolution
      ? ["Peser la masse de soluté dans une coupelle à l'aide d'une balance tarée.", "Introduire le soluté dans la fiole jaugée à l'aide d'un entonnoir.", "Rincer la coupelle et l'entonnoir avec de l'eau distillée, au-dessus de la fiole.", "Remplir la fiole aux trois quarts avec de l'eau distillée, boucher et agiter jusqu'à dissolution.", "Compléter avec de l'eau distillée jusqu'au trait de jauge.", "Boucher et retourner plusieurs fois la fiole pour homogénéiser."]
      : ["Verser un peu de solution mère dans un bécher.", "Prélever le volume V₀ avec une pipette jaugée munie d'une propipette.", "Verser le prélèvement dans la fiole jaugée.", "Ajouter de l'eau distillée jusqu'aux trois quarts, boucher et agiter.", "Compléter avec de l'eau distillée jusqu'au trait de jauge.", "Boucher et retourner plusieurs fois la fiole pour homogénéiser."];
    const sh = shuffleWithIndex(rng, steps);
    return {
      statement: `Remettre dans l'ordre les étapes du protocole de préparation d'une solution par **${dissolution ? "dissolution" : "dilution"}**.`,
      parts: [{ interaction: { kind: "ordonner", items: sh.shuffled, answer: steps.map((_, i) => sh.indexOf(i)), hint: "Première étape en haut" } }],
      solution: steps.map((s, i) => `${i + 1}. ${s}`),
      rappel: "On ne complète jusqu'au trait de jauge qu'à la fin : le volume final doit être exactement celui de la fiole.",
    };
  },
};

export const p1ChuteLibre: Generator = {
  meta: {
    id: "p1-energie-mecanique-chute", title: "Énergie mécanique : chute libre",
    subject: "pc", level: "1re", chapterId: "p1-energie", notionId: "p1-energie-mecanique",
    kinds: ["numerique"], summary: "Conservation de l'énergie mécanique en l'absence de frottements.", randomized: "valeurs",
  },
  generate(rng, d) {
    const m = rng.int(2, 25) / 10, h = rng.int(5, 45), g = 9.81;
    const Ep = m * g * h, v = Math.sqrt(2 * g * h);
    const parts = [
      { prompt: "Calculer l'énergie potentielle de pesanteur initiale $E_{pp}$ (origine au sol), avec 3 chiffres significatifs.", interaction: { kind: "numerique" as const, label: "$E_{pp} =$", suffix: "J", answer: { value: Ep, sigFigs: 3 } } },
    ];
    if (d >= 2) parts.push({ prompt: "En négligeant les frottements, calculer la vitesse $v$ de la balle juste avant le sol (3 chiffres significatifs).", interaction: { kind: "numerique" as const, label: "$v =$", suffix: "m/s", answer: { value: v, sigFigs: 3 } } });
    return {
      statement: `Une balle de masse $m = ${tex(m)}$ kg est lâchée sans vitesse initiale d'une hauteur $h = ${h}$ m. On prendra $g = 9{,}81$ N·kg⁻¹.`,
      parts,
      solution: [
        `$E_{pp} = m g h = ${tex(m)} \\times 9{,}81 \\times ${h} \\approx ${sig3(Ep).replace(",", "{,}").replace(/\u202f/g, "\\,")}$ J.`,
        ...(d >= 2 ? [
          "Sans frottements, l'énergie mécanique se conserve : $E_m = E_c + E_{pp}$ est constante.",
          "Au départ $E_c = 0$ ; au sol $E_{pp} = 0$. Donc $\\dfrac{1}{2} m v^2 = m g h$, soit $v = \\sqrt{2gh}$ (indépendante de la masse).",
          `$v = \\sqrt{2 \\times 9{,}81 \\times ${h}} \\approx ${sig3(v).replace(",", "{,}")}$ m/s.`,
        ] : []),
      ],
      rappel: "$E_c = \\dfrac{1}{2}mv^2$ ; $E_{pp} = mgz$ ; $E_m = E_c + E_{pp}$.",
    };
  },
};

export const pTpH: Generator = {
  meta: {
    id: "pT-ph-solution", title: "pH d'une solution aqueuse",
    subject: "pc", level: "Tle", chapterId: "pT-acide-base", notionId: "pT-acide-base-ph",
    kinds: ["numerique"], summary: "pH = −log[H₃O⁺] et calcul inverse.", randomized: "valeurs",
  },
  generate(rng, d) {
    if (d < 3) {
      const mant = rng.pick([1, 2, 2.5, 4, 5, 8]), k = rng.int(2, 5);
      const c = mant * 10 ** -k;
      const pH = -Math.log10(c);
      return {
        statement: `La concentration en ions oxonium d'une solution vaut $[\\mathrm{H_3O^+}] = ${tex(mant)} \\times 10^{-${k}}$ mol·L⁻¹.\nCalculer le pH de la solution (arrondi au centième).`,
        parts: [{ interaction: { kind: "numerique", label: "pH $=$", answer: { value: roundTo(pH, 2), tol: 0.005, roundingLabel: "au centième", decimals: 2 } } }],
        solution: [
          `$\\mathrm{pH} = -\\log\\left(\\dfrac{[\\mathrm{H_3O^+}]}{c^\\circ}\\right) = -\\log(${tex(mant)} \\times 10^{-${k}}) \\approx ${tex(roundTo(pH, 2))}$`,
          pH < 7 ? "À 25 °C, pH < 7 : la solution est acide." : "À 25 °C, pH ≥ 7.",
        ],
        rappel: "$\\mathrm{pH} = -\\log[\\mathrm{H_3O^+}]$ et $[\\mathrm{H_3O^+}] = 10^{-\\mathrm{pH}}$ mol·L⁻¹ (avec $c^\\circ = 1$ mol·L⁻¹).",
      };
    }
    const pH = rng.int(20, 120) / 10;
    const c = 10 ** -pH;
    return {
      statement: `Une solution a un pH égal à $${tex(pH)}$. Calculer la concentration $[\\mathrm{H_3O^+}]$ (2 chiffres significatifs).`,
      parts: [{ interaction: { kind: "numerique", label: "$[\\mathrm{H_3O^+}] =$", suffix: "mol·L⁻¹", answer: { value: c, sigFigs: 2 } } }],
      solution: [`$[\\mathrm{H_3O^+}] = 10^{-\\mathrm{pH}} = 10^{-${tex(pH)}} \\approx ${sciTex(c, 2)}$ mol·L⁻¹.`, "Saisie possible : 2,5e-4 ou 2,5×10^-4."],
    };
  },
};

export const pTRadioactivite: Generator = {
  meta: {
    id: "pT-decroissance-radioactive", title: "Décroissance radioactive et demi-vie",
    subject: "pc", level: "Tle", chapterId: "pT-radioactivite", notionId: "pT-radioactivite-demi-vie",
    kinds: ["numerique"], summary: "Après n demi-vies, il reste N₀ / 2ⁿ noyaux.", randomized: "valeurs",
  },
  generate(rng, d) {
    const nuc = rng.pick([
      { n: "l'iode 131", de: "d'iode 131", du: "de l'iode 131", t: 8, u: "jours" }, { n: "le césium 137", de: "de césium 137", du: "du césium 137", t: 30, u: "ans" }, { n: "le phosphore 32", de: "de phosphore 32", du: "du phosphore 32", t: 14.3, u: "jours" },
      { n: "le carbone 14", de: "de carbone 14", du: "du carbone 14", t: 5730, u: "ans" }, { n: "le cobalt 60", de: "de cobalt 60", du: "du cobalt 60", t: 5.27, u: "ans" },
    ]);
    const m0 = rng.pick([16, 32, 64, 80, 100, 200]);
    const k = d === 1 ? rng.int(1, 3) : rng.int(2, 5);
    const parts = [
      { prompt: `Quelle masse ${nuc.de} reste-t-il au bout de $${tex(roundTo(k * nuc.t, 2))}$ ${nuc.u} ?`, interaction: { kind: "numerique" as const, label: "$m =$", suffix: "g", answer: { value: m0 / 2 ** k } } },
    ];
    if (d === 3) parts.push({ prompt: `Au bout de combien de temps la masse aura-t-elle été divisée par $${2 ** (k + 1)}$ ?`, interaction: { kind: "numerique" as const, label: "$t =$", suffix: nuc.u, answer: { value: roundTo((k + 1) * nuc.t, 4) } } });
    return {
      statement: `La demi-vie ${nuc.du} est $t_{1/2} = ${tex(nuc.t)}$ ${nuc.u}. Un échantillon contient initialement $m_0 = ${m0}$ g ${nuc.de}.`,
      parts,
      solution: [
        "La demi-vie est la durée au bout de laquelle la moitié des noyaux radioactifs initialement présents se sont désintégrés.",
        `$${tex(roundTo(k * nuc.t, 2))} = ${k} \\times ${tex(nuc.t)}$ : il s'est écoulé ${k} demi-vies.`,
        `$m = \\dfrac{m_0}{2^{${k}}} = \\dfrac{${m0}}{${2 ** k}} = ${tex(m0 / 2 ** k)}$ g.`,
        ...(d === 3 ? [`Diviser par $${2 ** (k + 1)} = 2^{${k + 1}}$ correspond à ${k + 1} demi-vies : $t = ${k + 1} \\times ${tex(nuc.t)} = ${tex(roundTo((k + 1) * nuc.t, 4))}$ ${nuc.u}.`] : []),
      ],
      rappel: "$N(t) = N_0 \\, e^{-\\lambda t}$ et $t_{1/2} = \\dfrac{\\ln 2}{\\lambda}$ ; après $n$ demi-vies, $N = \\dfrac{N_0}{2^n}$.",
    };
  },
};
