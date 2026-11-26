// Plan de révision : répartit, du jour de la demande à la veille de l'évaluation, le travail réel des chapitres choisis
// (cours, exercices par niveau, jeux, fiche de révision, mini-évaluation). Fonction pure : la date du jour est un paramètre ;
// aucun état utilisateur n'est stocké (tout passe par l'URL). Seuls des identifiants et des titres sortent d'ici.
import type { ChapterContent, ChapterExercise } from "./chapters/schema";
import { todayKey } from "./series";

/** Horizon maximal : au-delà, le plan commence 60 jours avant l'évaluation. */
export const PLAN_MAX_DAYS = 60;
/** Exercices proposés par étape. */
const PICKS = 3;

/** Exercice « Type Brevet » : repéré par le préfixe de son titre (convention des chapitres de 3e). */
export const TYPE_BREVET_PREFIX = "Type Brevet — ";
export const isTypeBrevet = (title: string) => title.startsWith(TYPE_BREVET_PREFIX);

/** Date du jour à Paris (AAAA-MM-JJ), calculée au moment de la demande. */
export const parisToday = (now = new Date()) => todayKey(now);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
/** Date ISO valide (refuse 2027-02-30). */
export const isIsoDate = (s: string) => ISO.test(s) && new Date(toUtc(s)).toISOString().slice(0, 10) === s;
export const addDays = (iso: string, n: number) => new Date(toUtc(iso) + n * 86_400_000).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / 86_400_000);

export type StepKind = "cours" | "bases" | "entrainement" | "approfondissement" | "bilan" | "express";
export interface PlanExercise { id: string; title: string; niveau: number; brevet: boolean }
export interface PlanTask {
  chapterId: string;
  chapterTitle: string;
  kind: StepKind;
  /** Sections du chapitre à ouvrir (ancres de la page du chapitre). */
  sections: ("cours" | "exercices" | "activites" | "revision" | "evaluation")[];
  exercises: PlanExercise[];
  game: string | null;
}
export interface PlanDay { date: string; tasks: PlanTask[] }
export type PlanResult =
  | { ok: true; mode: "normal" | "express"; examDate: string; start: string; capped: boolean; days: PlanDay[]; ignored: string[] }
  | { ok: false; reason: "date-invalide" | "date-passee" | "aucun-chapitre"; ignored: string[] };

const asPlan = (e: ChapterExercise): PlanExercise => ({ id: e.id, title: e.title, niveau: e.niveau, brevet: isTypeBrevet(e.title) });

/** `n` exercices répartis régulièrement dans la liste (choix reproductible, sans hasard). */
function spread(list: ChapterExercise[], n: number): ChapterExercise[] {
  if (list.length <= n) return list;
  return Array.from({ length: n }, (_, j) => list[Math.floor((j * list.length) / n)]);
}
const byLevels = (c: ChapterContent, levels: number[]) => c.exercises.filter((e) => levels.includes(e.niveau));

function steps(c: ChapterContent): PlanTask[] {
  const base = { chapterId: c.id, chapterTitle: c.title };
  const game = (i: number) => (c.games.length ? c.games[i % c.games.length].title : null);
  const lvl5 = byLevels(c, [5]);
  const brevet = lvl5.filter((e) => isTypeBrevet(e.title));
  // Niveau 5 : au moins un « Type Brevet » s'il en existe, complété par les autres exercices (ou par d'autres « Type Brevet »).
  const others = spread(lvl5.filter((e) => !isTypeBrevet(e.title)), PICKS - Math.min(brevet.length, 1));
  const deep = [...others, ...spread(brevet, PICKS - others.length)];
  return [
    { ...base, kind: "cours", sections: ["cours"], exercises: [], game: null },
    { ...base, kind: "bases", sections: ["exercices", "activites"], exercises: spread(byLevels(c, [1, 2]), PICKS).map(asPlan), game: game(0) },
    { ...base, kind: "entrainement", sections: ["exercices", "activites"], exercises: spread(byLevels(c, [3, 4]), PICKS).map(asPlan), game: game(1) },
    { ...base, kind: "approfondissement", sections: ["exercices", "revision"], exercises: deep.map(asPlan), game: null },
  ];
}
const bilan = (c: ChapterContent): PlanTask => ({ chapterId: c.id, chapterTitle: c.title, kind: "bilan", sections: ["revision", "evaluation"], exercises: [], game: null });
const express = (c: ChapterContent): PlanTask => ({
  chapterId: c.id, chapterTitle: c.title, kind: "express", sections: ["revision", "evaluation", "exercices"],
  exercises: [...spread(byLevels(c, [2]), 1), ...spread(byLevels(c, [4]), 1)].map(asPlan), game: null,
});

/**
 * `requested` : identifiants demandés (URL) ; seuls ceux présents dans `available` (chapitres publiés) sont planifiés,
 * les autres sont renvoyés dans `ignored`.
 */
export function buildPlan(opts: { today: string; examDate: string; requested: string[]; available: ChapterContent[] }): PlanResult {
  const chosen = opts.requested.map((id) => opts.available.find((c) => c.id === id)).filter((c): c is ChapterContent => !!c);
  const ignored = opts.requested.filter((id) => !opts.available.some((c) => c.id === id));
  if (!isIsoDate(opts.examDate)) return { ok: false, reason: "date-invalide", ignored };
  const n = daysBetween(opts.today, opts.examDate);
  if (n < 0) return { ok: false, reason: "date-passee", ignored };
  if (!chosen.length) return { ok: false, reason: "aucun-chapitre", ignored };

  // Évaluation aujourd'hui ou demain : plan express sur la seule journée disponible.
  if (n <= 1) return { ok: true, mode: "express", examDate: opts.examDate, start: opts.today, capped: false, days: [{ date: opts.today, tasks: chosen.map(express) }], ignored };

  const capped = n > PLAN_MAX_DAYS;
  const total = Math.min(n, PLAN_MAX_DAYS);
  const start = addDays(opts.examDate, -total);
  const work = total - 1; // la veille est réservée au bilan
  // Étapes entrelacées (cours de chaque chapitre, puis bases de chaque chapitre…) : la révision d'un chapitre est espacée.
  const perChapter = chosen.map(steps);
  const queue = [0, 1, 2, 3].flatMap((s) => perChapter.map((p) => p[s]));
  const days: PlanDay[] = Array.from({ length: work }, (_, i) => ({ date: addDays(start, i), tasks: [] }));
  // Répartition régulière : l'étape i va au jour ⌊i·work/T⌋ (plusieurs étapes par jour si T > work, jours libres sinon).
  queue.forEach((t, i) => days[Math.floor((i * work) / queue.length)].tasks.push(t));
  days.push({ date: addDays(start, work), tasks: chosen.map(bilan) });
  return { ok: true, mode: "normal", examDate: opts.examDate, start, capped, days: days.filter((d) => d.tasks.length), ignored };
}
