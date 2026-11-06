import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { getGenerator } from "@/lib/content/registry";
import { createRng } from "@/lib/engine/rng";
import { checkExercise } from "@/lib/engine/check";
import type { Difficulty } from "@/lib/engine/types";
import { getUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { adaptDifficulty } from "@/lib/progress";
import { err, json } from "@/lib/http";

const body = z.object({
  seed: z.string().min(1).max(32),
  difficulty: z.number().int().min(1).max(3),
  responses: z.array(z.unknown()).max(20),
  timeSpentSec: z.number().min(0).max(36000).default(0),
  attemptNumber: z.number().int().min(1).max(100).default(1),
  mode: z.enum(["libre", "chrono", "defi", "examen", "collection"]).default("libre"),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await getGenerator(id);
  if (!g) return err("Exercice introuvable.", 404);
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return err("Requête invalide.");
  const b = parsed.data;
  // L'exercice est régénéré côté serveur à partir de sa graine : la clé de correction ne transite jamais.
  const inst = g.generate(createRng(b.seed), b.difficulty as Difficulty);
  const result = checkExercise(inst, b.responses);
  const user = await getUser();
  let saved = false;
  let recommendedDifficulty = b.difficulty;
  if (user) {
    await db.insert(schema.attempts).values({
      userId: user.id, exerciseId: id, seed: b.seed, difficulty: b.difficulty, attemptNumber: b.attemptNumber, score: result.score,
      correctParts: result.parts.filter((p) => p.status === "correct").length, totalParts: result.parts.length,
      timeSpentSec: Math.round(b.timeSpentSec), responses: b.responses, mode: b.mode,
    });
    saved = true;
    const recent = await db.select({ score: schema.attempts.score, difficulty: schema.attempts.difficulty }).from(schema.attempts)
      .where(and(eq(schema.attempts.userId, user.id), eq(schema.attempts.exerciseId, id))).orderBy(desc(schema.attempts.createdAt)).limit(3);
    recommendedDifficulty = adaptDifficulty(recent);
  } else {
    recommendedDifficulty = result.score >= 0.85 ? Math.min(3, b.difficulty + 1) : result.score < 0.5 ? Math.max(1, b.difficulty - 1) : b.difficulty;
  }
  return json({ ...result, saved, recommendedDifficulty });
}
