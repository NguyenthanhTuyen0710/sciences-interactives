// Validation déterministe d'un chapitre (sans IA) : tout ce qu'un script peut vérifier avant une relecture humaine ou IA.
// Usage : npx tsx scripts/validate-chapter.ts <id-du-chapitre | chemin/vers/fichier.ts> [--seeds 500] [--json]
// Code de sortie : 0 si aucun problème bloquant, 1 sinon. La sortie --json est compacte : elle sert d'entrée
// au pipeline de contenu (on ne renvoie à l'IA que les erreurs, pas tout le chapitre).
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { ALL_CHAPTERS, exerciseGenerator } from "../src/lib/chapters";
import { ChapterSchema, doneIssues, type ChapterContent } from "../src/lib/chapters/schema";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise } from "../src/lib/engine/check";
import { chapterTexts, diagnosticIssues, instanceTexts, specialValues, unitIssues, vouvoiementIssues } from "../src/lib/engine/diagnostics";
import { perfect } from "../src/lib/engine/solve";
import { toPublic } from "../src/lib/engine/public";
import { gcd, parseNumber } from "../src/lib/engine/numbers";
import { flashFeedback, type FlashLevel } from "../src/lib/games/logic";
import type { Interaction } from "../src/lib/engine/types";

interface Issue { where: string; problem: string; example?: string }

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const seeds = Number(args[args.indexOf("--seeds") + 1]) || 500;
const asJson = args.includes("--json");

async function load(t: string): Promise<ChapterContent> {
  const known = ALL_CHAPTERS.find((c) => c.id === t);
  if (known) return known;
  const mod = (await import(pathToFileURL(resolve(t)).href)) as Record<string, unknown>;
  const c = Object.values(mod).find((v) => v && typeof v === "object" && "lesson" in (v as object) && "exercises" in (v as object));
  if (!c) throw new Error(`Aucun chapitre exporté dans ${t}`);
  return c as ChapterContent;
}

/** Listes de choix d'une interaction : aucune ne doit contenir deux fois le même élément. */
function lists(it: Interaction): string[][] {
  switch (it.kind) {
    case "qcm": return [it.options];
    case "vrai-faux": return [it.items];
    case "associer": return [it.left, it.right];
    case "classer": return [it.categories, it.items];
    case "ordonner": return [it.items];
    case "glisser-deposer": return [it.zones, it.tokens];
    default: return [];
  }
}
const dup = (a: string[]) => a.find((x, i) => a.indexOf(x) !== i);
// Valeur d'attribut SVG contenant « < » : signe d'un gabarit tronqué.
const BROKEN_SVG = /="[^"]*</;
const RECORDS = fileURLToPath(new URL("../research/sources/records", import.meta.url));
const CURRICULUM = fileURLToPath(new URL("../research/curriculum", import.meta.url));

interface TaxonomyType { id: string; difficulty: number[]; exercises?: string[]; level?: string; countsTowardCompleteness?: boolean; transversal?: boolean }
interface Taxonomy { status: string; types: TaxonomyType[] }
/** Titre d'évaluation finale (niveau 5) : « Type Brevet — », « Type épreuve anticipée — », « Type bac — ». */
const FINAL_TITLE = /^Type (Brevet|épreuve anticipée|bac) —/;

/**
 * QA tier 2 : chaque exercice relève d'au moins un type ; chaque rattachement respecte la difficulté du type ;
 * chaque type obligatoire (ni approfondissement, ni transversal, compté dans la complétude) a au moins un exercice ;
 * un exercice d'approfondissement n'est ni rattaché à un type obligatoire ni présenté en évaluation finale.
 */
function taxonomyIssues(c: ChapterContent, tax: Taxonomy): Issue[] {
  const out: Issue[] = [];
  if (tax.status !== "verrouillé") out.push({ where: "taxonomie", problem: `taxonomie non verrouillée (statut « ${tax.status} »)` });
  const byId = new Map(c.exercises.map((e) => [e.id, e]));
  const required = (t: TaxonomyType) => t.level !== "approfondissement" && !t.transversal && t.countsTowardCompleteness !== false;
  const typesOf = new Map<string, TaxonomyType[]>();
  for (const t of tax.types) {
    for (const id of t.exercises ?? []) {
      const e = byId.get(id);
      if (!e) { out.push({ where: `taxonomie:${t.id}`, problem: `exercice ${id} absent du chapitre` }); continue; }
      typesOf.set(id, [...(typesOf.get(id) ?? []), t]);
      if (!t.difficulty.includes(e.niveau)) out.push({ where: e.id, problem: `niveau ${e.niveau} hors de la difficulté du type ${t.id} (${t.difficulty.join(", ")})` });
    }
    if (required(t) && !(t.exercises ?? []).some((id) => byId.has(id))) out.push({ where: `taxonomie:${t.id}`, problem: "type obligatoire sans exercice" });
  }
  for (const e of c.exercises) {
    const ts = typesOf.get(e.id) ?? [];
    if (!ts.length) { out.push({ where: e.id, problem: "exercice rattaché à aucun type de la taxonomie" }); continue; }
    if (!ts.some((t) => t.level === "approfondissement")) continue;
    const req = ts.filter(required).map((t) => t.id);
    if (req.length) out.push({ where: e.id, problem: `exercice d'approfondissement rattaché à un type obligatoire (${req.join(", ")})` });
    if (FINAL_TITLE.test(e.title)) out.push({ where: e.id, problem: "exercice d'approfondissement présenté en évaluation finale (titre « Type … — »)" });
  }
  return out;
}

async function main() {
  if (!target) { console.error("Usage : npx tsx scripts/validate-chapter.ts <id|fichier.ts> [--seeds N] [--json]"); process.exit(2); }
  const c = await load(target);
  const issues: Issue[] = [];
  const add = (where: string, problem: string, example?: string) => { if (issues.length < 200) issues.push({ where, problem, example }); };

  // 1. Contrat de données et Definition of Done (hors revues QA).
  const parsed = ChapterSchema.safeParse(c);
  if (!parsed.success) for (const i of parsed.error.issues.slice(0, 20)) add(`schema:${i.path.join(".")}`, i.message);
  for (const d of doneIssues(c).filter((x) => !x.startsWith("revue "))) add("dod", d);
  // Une source « verified » doit correspondre à un enregistrement vérifié du collecteur (même URL, même SHA256).
  for (const s of c.sources.filter((x) => x.verification === "verified")) {
    const rec = existsSync(RECORDS) ? readdirSync(RECORDS).map((f) => JSON.parse(readFileSync(join(RECORDS, f), "utf8")) as { url: string; sha256: string | null; verification: { status: string } })
      .find((r) => r.url === s.url && r.sha256 === s.sha256) : undefined;
    if (!rec) add(`sources:${s.id}`, "« verified » sans enregistrement correspondant (URL + SHA256) dans research/sources/records");
    else if (rec.verification.status !== "verified") add(`sources:${s.id}`, `enregistrement non vérifié (${rec.verification.status})`);
  }
  const pendingSources = c.sources.filter((x) => x.verification !== "verified").length;

  // 2. Tutoiement sur tous les textes élève hors tirages (chapitre, cours, exercices, jeux) ; SVG du cours.
  //    Champs : titre, prérequis, textes des objectifs (résumé d'exercice) ; cours entier sauf le code SVG (alt et
  //    légende compris) ; titre, raisonnement et indices des exercices ; titre, objectif, consignes et configuration des jeux.
  const staticTexts = chapterTexts(c);
  for (const i of vouvoiementIssues(staticTexts)) add(i.where, i.problem);
  for (const [i, ill] of c.lesson.illustrations.entries()) if (BROKEN_SVG.test(ill.svg)) add(`lesson.illustrations[${i}]`, "SVG mal formé (attribut contenant « < »)");

  // 3. Exercices : chaque tirage est vérifié comme le ferait le serveur.
  let instances = 0;
  const vousSeen = new Set<string>();
  // Couverture des cas limites (réponses numériques) : zéro, un, négatif, décimal, arrondi — par exercice, sur tous les tirages.
  const special: Record<string, Record<string, number>> = {};
  for (const e of c.exercises) {
    const g = exerciseGenerator(c, e);
    const n = e.vary ? seeds : 1;
    const statements = new Set<string>();
    for (let k = 0; k < n; k++) {
      const seed = `v${k}`;
      let inst;
      try { inst = g.generate(createRng(seed), 1); } catch (err) { add(e.id, `exception du générateur : ${(err as Error).message}`, seed); break; }
      instances++;
      statements.add(inst.statement + JSON.stringify(inst.parts.map((p) => p.interaction)));
      const raw = JSON.stringify(inst);
      if (/NaN|undefined|Infinity/.test(raw)) { add(e.id, "valeur NaN / undefined / Infinity", seed); continue; }
      if (/\d\.\d*0{6,}\d|\d\.\d*9{6,}\d/.test(inst.statement + inst.solution.join(" "))) add(e.id, "artefact de virgule flottante dans l'énoncé ou la correction", seed);
      // Tirage : énoncé, figure, parties (consigne, interaction, diagnostics), correction ; un signalement par champ.
      for (const i of vouvoiementIssues(instanceTexts(inst, e.id))) {
        const key = i.where.replace(/\[\d+\]/g, "[]");
        if (!vousSeen.has(key)) { vousSeen.add(key); add(i.where, i.problem, seed); }
      }
      const pub = JSON.stringify(toPublic(inst));
      if (pub.includes('"answer"') || pub.includes('"mistakes"')) add(e.id, "fuite de la réponse vers le navigateur", seed);
      const responses = inst.parts.map((p) => perfect(p.interaction));
      const res = checkExercise(inst, responses);
      res.parts.forEach((r, i) => { if (r.status !== "correct") add(e.id, `réponse parfaite non acceptée (partie ${i}) : ${r.feedback.join(" ")}`, seed); });
      if (checkExercise(inst, inst.parts.map(() => undefined)).score !== 0) add(e.id, "réponse vide non nulle", seed);
      inst.parts.forEach((p, i) => {
        for (const d of diagnosticIssues(p.interaction, p.mistakes, responses[i], i)) add(e.id, d, seed);
        if (c.subject === "physique-chimie") for (const u of unitIssues(p.interaction)) add(e.id, `partie ${i} : ${u}`, seed);
        for (const v of specialValues(p.interaction)) special[e.id] = { ...special[e.id], [v]: (special[e.id]?.[v] ?? 0) + 1 };
        for (const l of lists(p.interaction)) { const d = dup(l); if (d) add(e.id, `élément en double : ${d}`, seed); }
        if (p.interaction.kind === "ordonner" && p.interaction.answer.every((v, j) => v === j)) add(e.id, "ordre déjà correct au départ", seed);
      });
    }
    if (e.vary && statements.size < 2) add(e.id, "tirage constant : `vary` produit toujours le même énoncé");
  }

  // 4. Jeux.
  for (const gm of c.games) {
    const cfg = gm.config;
    if (gm.template === "calcul-flash") {
      for (const lv of cfg.levels as FlashLevel[]) {
        if (lv.items.length < 6) add(gm.id, `niveau « ${lv.label} » : moins de 6 questions`);
        for (const it of lv.items) {
          const p = parseNumber(it.answer);
          if (!p) add(gm.id, `réponse illisible « ${it.answer} »`);
          else if (it.irreducible && p.isFraction && gcd(p.num!, p.den!) !== 1) add(gm.id, `${it.answer} non irréductible`);
          else if (!flashFeedback(it, it.answer)?.ok) add(gm.id, `réponse de référence refusée : ${it.q}`);
        }
      }
    }
    if (gm.template === "memory") { const d = dup((cfg.pairs as [string, string][]).flat()); if (d) add(gm.id, `carte en double : ${d}`); }
  }

  // 5. QA tier 2 (déterministe) : chapitre ↔ taxonomie verrouillée, si elle existe.
  const taxFile = join(CURRICULUM, c.subject, "taxonomy", `${c.id}.json`);
  const taxonomy = existsSync(taxFile) ? (JSON.parse(readFileSync(taxFile, "utf8")) as Taxonomy) : null;
  if (taxonomy) for (const t of taxonomyIssues(c, taxonomy)) add(t.where, t.problem);

  const perLevel = [1, 2, 3, 4, 5].map((l) => c.exercises.filter((e) => e.niveau === l).length);
  const summary = { chapter: c.id, exercises: c.exercises.length, perLevel, vary: c.exercises.filter((e) => e.vary).length, games: c.games.length, instances, sourcesPendingVerification: pendingSources, taxonomy: taxonomy ? taxonomy.status : "absente", issues: issues.length, ok: issues.length === 0 };
  if (asJson) console.log(JSON.stringify({ summary, issues, special }));
  else {
    console.log(`${c.id} : ${summary.exercises} exercices (niveaux ${perLevel.join("/")}), ${summary.vary} à tirage variable, ${summary.games} jeux, ${instances} tirages vérifiés, ${pendingSources}/${c.sources.length} source(s) en attente de vérification, taxonomie : ${summary.taxonomy}${taxonomy ? "" : " (QA tier 2 non évaluée)"}`);
    const cov = Object.entries(special).map(([id, v]) => `${id} ${Object.entries(v).map(([k, n]) => `${k}×${n}`).join(" ")}`);
    if (cov.length) console.log(`  cas limites rencontrés (réponses numériques) : ${cov.join(" · ")}`);
    for (const i of issues) console.log(`  ✘ ${i.where} : ${i.problem}${i.example ? ` (graine ${i.example})` : ""}`);
    console.log(summary.ok ? "  ✔ aucun problème détecté" : `  ${issues.length} problème(s)`);
  }
  process.exit(summary.ok ? 0 : 1);
}
main();
