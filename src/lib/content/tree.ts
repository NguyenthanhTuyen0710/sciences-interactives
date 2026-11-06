// Arborescence complète (programme + chapitres ajoutés par les enseignants) avec le nombre d'exercices.
import "server-only";
import { db, schema } from "../db";
import { CURRICULUM, type Level } from "./curriculum";
import { allMetas } from "./registry";
import type { ExerciseMeta, Subject } from "../engine/types";

export async function getTree(subject: Subject): Promise<{ levels: Level[]; metas: ExerciseMeta[] }> {
  const [custom, metas] = await Promise.all([db.select().from(schema.customChapters), allMetas()]);
  const levels: Level[] = CURRICULUM[subject].map((l) => ({
    ...l,
    chapters: [
      ...l.chapters,
      ...custom.filter((c) => c.subject === subject && c.level === l.id).map((c) => ({ id: c.id, title: c.title, theme: c.theme, notions: c.notions })),
    ],
  }));
  return { levels, metas: metas.filter((m) => m.subject === subject) };
}

export async function getFullTree() {
  const [m, p] = await Promise.all([getTree("maths"), getTree("pc")]);
  return { maths: m, pc: p };
}
