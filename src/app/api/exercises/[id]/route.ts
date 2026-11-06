import { getGenerator } from "@/lib/content/registry";
import { createRng, randomSeed } from "@/lib/engine/rng";
import { toPublic } from "@/lib/engine/public";
import type { Difficulty } from "@/lib/engine/types";
import { err, json } from "@/lib/http";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await getGenerator(id);
  if (!g) return err("Exercice introuvable.", 404);
  const url = new URL(req.url);
  const seed = (url.searchParams.get("seed") || randomSeed()).slice(0, 32);
  const d = Math.min(3, Math.max(1, Number(url.searchParams.get("d")) || 1)) as Difficulty;
  return json({ meta: g.meta, seed, difficulty: d, exercise: toPublic(g.generate(createRng(seed), d)) });
}
