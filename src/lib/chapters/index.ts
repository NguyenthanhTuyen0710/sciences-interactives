// Registre des chapitres complets et conversion de leurs exercices en générateurs du moteur
// (ils réutilisent ainsi le lecteur d'exercices, la correction côté serveur et les tests existants).
import type { Generator, InteractionKind, Subject } from "../engine/types";
import { createRng } from "../engine/rng";
import type { ChapterContent, ChapterExercise } from "./schema";
import { math5eNombresRelatifs } from "./data/math-5e-nombres-relatifs";

/** Chapitres complets (src/lib/chapters/data/). */
export const ALL_CHAPTERS: ChapterContent[] = [math5eNombresRelatifs];

/** Un chapitre est visible publiquement s'il est publié (ou en prévisualisation : SHOW_DRAFTS=1). */
export const isVisible = (c: ChapterContent) => c.publicationStatus === "published" || process.env.SHOW_DRAFTS === "1";
export const visibleChapters = () => ALL_CHAPTERS.filter(isVisible);

export const subjectOf = (c: ChapterContent): Subject => (c.subject === "mathematiques" ? "maths" : "pc");

export function chapterByTreeId(treeChapterId: string) {
  return visibleChapters().find((c) => c.treeChapterId === treeChapterId) ?? null;
}

function body(e: ChapterExercise, seed: string) {
  if (e.vary) return e.vary(createRng(seed));
  return { statement: e.statement!, figure: e.figure, parts: e.parts!, solution: e.solution! };
}

export function exerciseGenerator(c: ChapterContent, e: ChapterExercise): Generator {
  const kinds = [...new Set(body(e, "kinds").parts.map((p) => p.interaction.kind))] as InteractionKind[];
  return {
    meta: {
      id: e.id, title: e.title, subject: subjectOf(c), level: c.grade, chapterId: c.treeChapterId, notionId: c.id,
      kinds, summary: e.title, randomized: e.vary ? "valeurs" : "banque", timeLimit: Math.max(60, e.time * 2),
      niveau: e.niveau, objectives: e.objectives,
    },
    generate(rng) {
      const b = body(e, String(rng.int(0, 1e9)));
      return { ...b, solution: [...b.solution, `**Pourquoi :** ${e.reasoning}`], hints: e.hints };
    },
  };
}

export const chapterGenerators = (chapters: ChapterContent[]) => chapters.flatMap((c) => c.exercises.map((e) => exerciseGenerator(c, e)));
