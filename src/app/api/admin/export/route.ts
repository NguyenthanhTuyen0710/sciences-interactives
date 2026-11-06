import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

export async function GET() {
  const g = await requireStaff();
  if (g.error) return g.error;
  const [exercises, chapters, collections] = await Promise.all([
    db.select().from(schema.customExercises), db.select().from(schema.customChapters), db.select().from(schema.collections),
  ]);
  const payload = {
    format: "plateforme-educative/v1", exportedAt: new Date().toISOString(),
    chapters: chapters.map(({ createdAt: _c, ...r }) => r),
    exercises: exercises.map(({ id: _i, authorId: _a, createdAt: _c, updatedAt: _u, ...r }) => r),
    collections: collections.map(({ id: _i, authorId: _a, createdAt: _c, ...r }) => r),
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="contenus-${new Date().toISOString().slice(0, 10)}.json"` },
  });
}
