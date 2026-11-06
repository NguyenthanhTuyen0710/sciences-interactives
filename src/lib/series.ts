// Composition de séries d'exercices (défi du jour, défi chronométré, sujets d'examen).
import { createRng, randomSeed } from "./engine/rng";
import type { ExerciseMeta } from "./engine/types";
import type { SeriesItem } from "@/components/SeriesPlayer";

export function todayKey(d = new Date()) {
  return d.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}

export function dailyItems(metas: ExerciseMeta[], key = todayKey()): SeriesItem[] {
  const rng = createRng("defi-du-jour-" + key);
  const maths = rng.shuffle(metas.filter((m) => m.subject === "maths" && !m.id.startsWith("perso-")));
  const pc = rng.shuffle(metas.filter((m) => m.subject === "pc" && !m.id.startsWith("perso-")));
  return [maths[0], pc[0], maths[1], pc[1], maths[2]].filter(Boolean).map((m, i) => ({ id: m.id, difficulty: 1 + (i % 3), seed: `${key}-${i}` }));
}

export function randomItems(metas: ExerciseMeta[], n: number, difficulty: number, seed = randomSeed()): SeriesItem[] {
  const rng = createRng(seed);
  return rng.shuffle(metas).slice(0, n).map((m, i) => ({ id: m.id, difficulty, seed: `${seed}${i}` }));
}

export const EXAMS: Record<string, { title: string; subject: "maths" | "pc"; levels: string[]; n: number; minutes: number; difficulty: number; intro: string }> = {
  "brevet-maths": { title: "Brevet blanc – Mathématiques", subject: "maths", levels: ["4e", "3e"], n: 5, minutes: 45, difficulty: 2, intro: "Un sujet d'entraînement composé d'exercices du programme de 4e et 3e, noté sur 20. Calculatrice autorisée." },
  "brevet-pc": { title: "Brevet blanc – Physique-Chimie", subject: "pc", levels: ["4e", "3e", "5e"], n: 4, minutes: 30, difficulty: 2, intro: "Un sujet d'entraînement de sciences (cycle 4), noté sur 20." },
  "controle-seconde": { title: "Contrôle de Seconde – Mathématiques et Physique-Chimie", subject: "maths", levels: ["2nde"], n: 4, minutes: 40, difficulty: 2, intro: "Un contrôle mêlant les notions de Seconde, noté sur 20." },
  "bac-maths": { title: "Bac – Spécialité mathématiques (Première et Terminale)", subject: "maths", levels: ["1re", "Tle"], n: 4, minutes: 60, difficulty: 3, intro: "Exercices de niveau spécialité sur les notions de Première et Terminale. Note sur 20." },
  "bac-pc": { title: "Bac – Spécialité physique-chimie", subject: "pc", levels: ["2nde", "1re", "Tle"], n: 5, minutes: 50, difficulty: 3, intro: "Exercices de chimie et de physique du cycle terminal, notés sur 20. Calculatrice autorisée." },
};

export function examItems(slug: string, metas: ExerciseMeta[], seed = randomSeed()): SeriesItem[] {
  const e = EXAMS[slug];
  if (!e) return [];
  const pool = metas.filter((m) => e.levels.includes(m.level) && (slug === "controle-seconde" || m.subject === e.subject) && !m.id.startsWith("perso-"));
  return randomItems(pool, e.n, e.difficulty, seed);
}
