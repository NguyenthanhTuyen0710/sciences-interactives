// Paliers de modèles du pipeline (décision du porteur de projet, 2026-11-15) et calcul des coûts par modèle.
// Module pur (sans E/S) : utilisé par pipeline/run.ts et testé par tests/pipeline-models.test.ts.
// Tarifs : pipeline/prices.json (page officielle https://platform.claude.com/docs/en/about-claude/pricing).

import { createHash } from "node:crypto";

/**
 * Empreinte anti-doublon d'une requête (texte du prompt). `explicitModel` n'est ajouté que si le modèle a été imposé
 * (`--dossier-model`, comparaison du pilote) : sans lui, l'empreinte est identique à celle déjà inscrite au registre.
 */
export function inputHash(parts: string[], explicitModel?: string): string {
  return createHash("sha256").update((explicitModel ? [...parts, `model=${explicitModel}`] : parts).join("\u0000")).digest("hex").slice(0, 16);
}

export const MODELS = { haiku: "claude-haiku-5-5", sonnet: "claude-sonnet-5-5", opus: "claude-opus-5-5" } as const;
/** Familles exclues par décision du porteur de projet. */
export const FORBIDDEN_MODEL = /fable|mythos/i;

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";
export type PipelineStep = "dossier" | "chapter" | "fix" | "screen" | "review";

/**
 * Étapes de pipeline/run.ts. system « light » : règles seules (sans schéma, types ni chapitre d'exemple), pour les
 * étapes qui n'écrivent pas de code (dossier, criblage, juge approfondi) ; « full » : préfixe complet (chapitre, fix).
 * fix : modèle choisi par fixModel() ; review : juge approfondi limité aux constats signalés et aux niveaux 4-5.
 */
export const STEP_CONFIG: Record<PipelineStep, { model: string; effort: Effort; maxTokens: number; system: "full" | "light" }> = {
  dossier: { model: MODELS.haiku, effort: "medium", maxTokens: 8000, system: "light" },
  chapter: { model: MODELS.sonnet, effort: "medium", maxTokens: 64000, system: "full" },
  fix: { model: MODELS.sonnet, effort: "medium", maxTokens: 16000, system: "full" },
  screen: { model: MODELS.haiku, effort: "low", maxTokens: 8000, system: "light" },
  // Juge approfondi : préfixe « light » (décision du 2026-11-15) : les erreurs de type sont déjà prises par ChapterSchema,
  // tsc et validate-chapter (tier 1) ; la requête contient les extraits d'exercices à juger.
  review: { model: MODELS.sonnet, effort: "low", maxTokens: 12000, system: "light" },
};

/** Politique complète, y compris les tâches hors de run.ts (référence pour les scripts et les agents). */
export const MODEL_POLICY: { task: string; model: string; effort?: Effort; note?: string }[] = [
  { task: "extraction de sources, BO → inventaire, proposition de classement G1", model: MODELS.haiku },
  { task: "taxonomie G3", model: MODELS.opus, effort: "high" },
  { task: "dossier", model: MODELS.haiku, note: "pilote : comparaison Haiku / Sonnet sur un même chapitre" },
  { task: "génération du chapitre (une requête, D4)", model: MODELS.sonnet },
  { task: "correction MINEUR", model: MODELS.haiku },
  { task: "correction MAJEUR, ou 2e tour après un échec", model: MODELS.sonnet },
  { task: "juge : criblage (grammaire, tutoiement, ton)", model: MODELS.haiku },
  { task: "juge approfondi : constats signalés et exercices de niveaux 4-5", model: MODELS.sonnet },
  { task: "démonstrations lycée, sujets bac, juge d'examens (G5)", model: MODELS.opus },
];

export interface Rate { input: number; output: number; cacheWrite5m: number; cacheWrite1h: number; cacheRead: number }
export interface ModelPrice extends Rate { longPrompt?: Rate & { thresholdTokens: number }; batch: { input: number; output: number } }
export interface Prices { batchMultiplier: number; models: Record<string, ModelPrice> }
export interface UsageLike { input: number; cacheWrite: number; cacheRead: number; output: number }

/** Tarif applicable : Haiku 5.5 facture tout le prompt au tarif long au-delà du seuil (cache lu et écrit compris). */
export function rateFor(p: ModelPrice, promptTokens: number): Rate & { long: boolean } {
  if (p.longPrompt && promptTokens > p.longPrompt.thresholdTokens) return { ...p.longPrompt, long: true };
  return { input: p.input, output: p.output, cacheWrite5m: p.cacheWrite5m, cacheWrite1h: p.cacheWrite1h, cacheRead: p.cacheRead, long: false };
}

/** Coût en USD d'un usage ; la remise batch s'applique à toutes les catégories (cache compris). */
export function costUsd(prices: Prices, model: string, u: UsageLike, batch: boolean): number {
  const p = prices.models[model];
  if (!p) throw new Error(`tarif absent de prices.json pour ${model}`);
  const r = rateFor(p, u.input + u.cacheWrite + u.cacheRead);
  const m = batch ? prices.batchMultiplier : 1;
  return (m * (u.input * r.input + u.cacheWrite * r.cacheWrite1h + u.cacheRead * r.cacheRead + u.output * r.output)) / 1e6;
}

/** Avertissement si une requête Haiku dépasse le seuil (prix d'entrée × 5) ; null sinon. */
export function longPromptWarning(prices: Prices, model: string, promptTokens: number): string | null {
  const p = prices.models[model];
  if (!p?.longPrompt || promptTokens <= p.longPrompt.thresholdTokens) return null;
  const factor = Math.round(p.longPrompt.input / p.input);
  return `${model} : prompt de ${promptTokens} tokens > ${p.longPrompt.thresholdTokens} → tarif long (entrée × ${factor}). Découper l'entrée (par blocs d'exercices, sans le chapitre d'exemple) ou confier l'étape à ${MODELS.sonnet}.`;
}

/** Problèmes de validation jugés mineurs (forme, langue) : correction confiée à Haiku au 1er tour. */
export const MINOR_ISSUE = /vouvoiement|artefact de virgule flottante|élément en double|options de QCM équivalentes/;

/** Modèle d'un tour de correction : Haiku seulement au 1er tour et si tous les problèmes sont mineurs ; sinon Sonnet. */
export function fixModel(problems: string[], round: number): string {
  if (round >= 2) return MODELS.sonnet; // un échec après Haiku (ou un 2e tour) escalade toujours vers Sonnet
  return problems.length > 0 && problems.every((p) => MINOR_ISSUE.test(p)) ? MODELS.haiku : MODELS.sonnet;
}

/** Agrégation par modèle pour le rapport et le registre. */
export type ByModel = Record<string, UsageLike & { usd: number; thinking: number }>;
export function addUsage(acc: ByModel, model: string, u: UsageLike & { thinking?: number }, usd: number): ByModel {
  const cur = acc[model] ?? { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, thinking: 0, usd: 0 };
  acc[model] = { input: cur.input + u.input, cacheWrite: cur.cacheWrite + u.cacheWrite, cacheRead: cur.cacheRead + u.cacheRead, output: cur.output + u.output, thinking: cur.thinking + (u.thinking ?? 0), usd: cur.usd + usd };
  return acc;
}

/**
 * Matières prises en charge (M3). `key` sélectionne les blocs propres à la matière dans les prompts ; `manifest` : un
 * manifest de niveau (research/curriculum/<matière>/manifest-<niveau>.json) est exigé.
 */
export const SUBJECTS = {
  mathematiques: { key: "maths", inventory: "research/curriculum/mathematiques/curriculum-math.json", manifest: true },
  "physique-chimie": { key: "pc", inventory: "research/curriculum/physique-chimie/curriculum-pc.json", manifest: false },
} as const;
export type SubjectSlug = keyof typeof SUBJECTS;

/** Clés de blocs des prompts : matière (`maths`, `pc`) et cycle (`college`, `lycee`). */
export const SECTION_KEYS = ["maths", "pc", "college", "lycee"] as const;
const LYCEE = ["2nde", "1re", "Tle"];
export const isLycee = (grade: string) => LYCEE.includes(grade);
/** Blocs actifs pour un chapitre : sa matière et son cycle. */
export const sectionKeys = (subject: SubjectSlug, grade: string): string[] => [SUBJECTS[subject].key, isLycee(grade) ? "lycee" : "college"];

/** Garde les blocs `{{#clé}}…{{/clé}}` actifs (imbrication de clés différentes permise), retire les autres ; clé inconnue = erreur. */
export function promptSections(tpl: string, active: string[]): string {
  let out = tpl, prev;
  do {
    prev = out;
    out = out.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k: string, body: string) => {
      if (!(SECTION_KEYS as readonly string[]).includes(k)) throw new Error(`bloc inconnu dans un prompt : ${k}`);
      return active.includes(k) ? body : "";
    });
  } while (out !== prev);
  return out;
}

/** Exercices d'un fichier de chapitre : blocs de source par identifiant (préfixe donné) et niveau. */
export function exerciseBlocks(src: string, prefix: string): { id: string; niveau: number; text: string }[] {
  const re = new RegExp(`id: "(${prefix.replace(/[-]/g, "\\-")}\\d+)"`, "g");
  const starts = [...src.matchAll(re)].map((m) => ({ id: m[1], at: src.lastIndexOf("\n", src.lastIndexOf("\n", m.index!) - 1) + 1 }));
  const end = src.indexOf("\n];", starts[starts.length - 1]?.at ?? 0);
  return starts.map((s, i) => {
    const text = src.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : end > 0 ? end : undefined);
    return { id: s.id, niveau: Number(/niveau: (\d)/.exec(text)?.[1] ?? 0), text };
  });
}
