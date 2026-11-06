import { requireStaff } from "@/lib/guard";
import { buildInstance, validateCustom } from "@/lib/content/custom";
import { createRng, randomSeed } from "@/lib/engine/rng";
import { toPublic } from "@/lib/engine/public";
import { checkExercise } from "@/lib/engine/check";
import { json } from "@/lib/http";

/** Aperçu d'un exercice en cours d'édition : instance publique + bonnes réponses attendues. */
export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const { schema } = (await req.json().catch(() => ({}))) as { schema?: unknown };
  const v = validateCustom(schema);
  if (!v.ok) return json({ errors: v.errors }, 400);
  const seed = randomSeed();
  const inst = buildInstance(v.schema, createRng(seed));
  const res = checkExercise(inst, []);
  return json({ seed, exercise: toPublic(inst), expected: res.parts.map((p) => p.expected), solution: inst.solution });
}
