// Registre central des exercices : générateurs statiques + exercices enseignants (base de données).
import "server-only";
import { eq } from "drizzle-orm";
import type { Generator, ExerciseMeta } from "../engine/types";
import * as MC from "./maths-college";
import * as ML from "./maths-lycee";
import * as PC from "./physique";
import { customToGenerator } from "./custom";
import { db, schema } from "../db";
import { chapterGenerators, visibleChapters } from "../chapters";

export const STATIC_GENERATORS: Generator[] = [...Object.values(MC), ...Object.values(ML), ...Object.values(PC), ...chapterGenerators(visibleChapters())];
const BY_ID = new Map(STATIC_GENERATORS.map((g) => [g.meta.id, g]));

export async function getGenerator(id: string): Promise<Generator | null> {
  const g = BY_ID.get(id);
  if (g) return g;
  if (id.startsWith("perso-")) {
    const uuid = id.slice(6);
    if (!/^[0-9a-f-]{36}$/.test(uuid)) return null;
    const [r] = await db.select().from(schema.customExercises).where(eq(schema.customExercises.id, uuid));
    if (!r) return null;
    try { return customToGenerator(r); } catch { return null; }
  }
  return null;
}

export async function allMetas(opts: { includeUnpublished?: boolean } = {}): Promise<ExerciseMeta[]> {
  const rows = await db.select().from(schema.customExercises);
  const custom = rows.filter((r) => opts.includeUnpublished || r.published).flatMap((r) => {
    try { return [customToGenerator(r).meta]; } catch { return []; }
  });
  return [...STATIC_GENERATORS.map((g) => g.meta), ...custom];
}
