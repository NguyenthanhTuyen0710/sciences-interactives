// Suivi de progression et recommandations adaptatives.
import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { allMetas } from "./content/registry";
import { findNotion } from "./content/curriculum";
import type { ExerciseMeta } from "./engine/types";

export interface AttemptRow {
  exerciseId: string; difficulty: number; score: number; createdAt: Date; timeSpentSec: number; attemptNumber: number; mode: string; correctParts: number; totalParts: number;
}

export interface Recommendation {
  exerciseId: string; title: string; difficulty: number; reason: string; kind: "remediation" | "progression" | "decouverte"; notionId: string; ficheNotionId?: string;
}

const LEVEL_ORDER = ["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"];

/** Difficulté conseillée pour un exercice d'après les dernières tentatives (ordre antéchronologique). */
export function adaptDifficulty(recent: { score: number; difficulty: number }[]): number {
  if (!recent.length) return 1;
  const last = recent.slice(0, 2);
  const avg = last.reduce((s, a) => s + a.score, 0) / last.length;
  const d = recent[0].difficulty;
  if (last.length >= 2 && avg >= 0.85) return Math.min(3, d + 1);
  if (avg < 0.5) return Math.max(1, d - 1);
  return d;
}

export async function userAttempts(userId: string): Promise<AttemptRow[]> {
  return db
    .select({
      exerciseId: schema.attempts.exerciseId, difficulty: schema.attempts.difficulty, score: schema.attempts.score, createdAt: schema.attempts.createdAt,
      timeSpentSec: schema.attempts.timeSpentSec, attemptNumber: schema.attempts.attemptNumber, mode: schema.attempts.mode,
      correctParts: schema.attempts.correctParts, totalParts: schema.attempts.totalParts,
    })
    .from(schema.attempts)
    .where(eq(schema.attempts.userId, userId))
    .orderBy(desc(schema.attempts.createdAt));
}

export function computeStats(rows: AttemptRow[], metas: ExerciseMeta[], userLevel: string | null) {
  const metaById = new Map(metas.map((m) => [m.id, m]));
  const total = rows.length;
  const success = rows.filter((r) => r.score >= 0.999).length;
  const avg = total ? rows.reduce((s, r) => s + r.score, 0) / total : 0;
  const time = rows.reduce((s, r) => s + r.timeSpentSec, 0);
  const distinct = new Set(rows.map((r) => r.exerciseId));

  // par exercice
  const byEx = new Map<string, AttemptRow[]>();
  rows.forEach((r) => byEx.set(r.exerciseId, [...(byEx.get(r.exerciseId) ?? []), r]));

  // par notion / chapitre
  const byNotion = new Map<string, { notionId: string; title: string; chapter: string; level: string; subject: string; attempts: number; avg: number; recentAvg: number }>();
  for (const [exId, list] of byEx) {
    const m = metaById.get(exId);
    if (!m) continue;
    const f = findNotion(m.notionId);
    const key = m.notionId;
    const prev = byNotion.get(key);
    const sum = list.reduce((s, r) => s + r.score, 0);
    const recent = list.slice(0, 3);
    const recentSum = recent.reduce((s, r) => s + r.score, 0);
    if (!prev) byNotion.set(key, { notionId: key, title: f?.notion.title ?? m.title, chapter: f?.chapter.title ?? m.chapterId, level: m.level, subject: m.subject, attempts: list.length, avg: sum / list.length, recentAvg: recentSum / recent.length });
    else {
      const n = prev.attempts + list.length;
      prev.avg = (prev.avg * prev.attempts + sum) / n;
      prev.recentAvg = (prev.recentAvg + recentSum / recent.length) / 2;
      prev.attempts = n;
    }
  }
  const notions = [...byNotion.values()].sort((a, b) => a.recentAvg - b.recentAvg);
  const weak = notions.filter((n) => n.attempts >= 2 && n.recentAvg < 0.6);

  // progression par chapitre
  const byChapter = new Map<string, { chapterId: string; title: string; subject: string; level: string; done: number; total: number; avg: number; n: number }>();
  for (const m of metas) {
    const f = findNotion(m.notionId);
    const key = m.chapterId;
    const c = byChapter.get(key) ?? { chapterId: key, title: f?.chapter.title ?? key, subject: m.subject, level: m.level, done: 0, total: 0, avg: 0, n: 0 };
    c.total++;
    const list = byEx.get(m.id);
    if (list) {
      c.done++;
      const best = Math.max(...list.map((r) => r.score));
      c.avg = (c.avg * c.n + best) / (c.n + 1);
      c.n++;
    }
    byChapter.set(key, c);
  }
  const chapters = [...byChapter.values()].filter((c) => c.done > 0).sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));

  // recommandations
  const recs: Recommendation[] = [];
  for (const [exId, list] of byEx) {
    const m = metaById.get(exId);
    if (!m) continue;
    const recent = list.slice(0, 3);
    const rAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length;
    const nextD = adaptDifficulty(list);
    if (list.length >= 2 && rAvg < 0.6)
      recs.push({ exerciseId: exId, title: m.title, difficulty: nextD, kind: "remediation", notionId: m.notionId, ficheNotionId: findNotion(m.notionId)?.notion.fiche ? m.notionId : undefined, reason: `Résultats récents à ${Math.round(rAvg * 100)} % : relire la fiche puis s'entraîner au niveau ${nextD}.` });
    else if (rAvg >= 0.85 && list[0].difficulty < 3)
      recs.push({ exerciseId: exId, title: m.title, difficulty: Math.min(3, list[0].difficulty + 1), kind: "progression", notionId: m.notionId, reason: "Bien maîtrisé : passer au niveau de difficulté supérieur." });
  }
  const levelPool = metas.filter((m) => !byEx.has(m.id) && (!userLevel || m.level === userLevel));
  levelPool.slice(0, 4).forEach((m) => recs.push({ exerciseId: m.id, title: m.title, difficulty: 1, kind: "decouverte", notionId: m.notionId, reason: `Nouvel exercice de ${m.level} à découvrir.` }));
  const order = { remediation: 0, progression: 1, decouverte: 2 };
  recs.sort((a, b) => order[a.kind] - order[b.kind]);

  const history = rows.slice(0, 25).map((r) => ({ ...r, title: metaById.get(r.exerciseId)?.title ?? r.exerciseId, subject: metaById.get(r.exerciseId)?.subject }));
  // activité des 14 derniers jours
  const days: { day: string; count: number; avg: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const list = rows.filter((r) => r.createdAt.toISOString().slice(0, 10) === key);
    days.push({ day: key, count: list.length, avg: list.length ? list.reduce((s, r) => s + r.score, 0) / list.length : 0 });
  }
  return { total, success, successRate: total ? success / total : 0, avg, time, distinct: distinct.size, notions, weak, chapters, recs: recs.slice(0, 8), history, days };
}

export async function userDashboard(userId: string, level: string | null) {
  const [rows, metas] = await Promise.all([userAttempts(userId), allMetas()]);
  return computeStats(rows, metas, level);
}
