import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { validateCustom } from "@/lib/content/custom";
import { err, json } from "@/lib/http";
import { metaBody } from "@/lib/content/admin-schema";

const isUuid = (s: string) => /^[0-9a-f-]{36}$/.test(s);

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const { id } = await params;
  if (!isUuid(id)) return err("Identifiant invalide.", 404);
  const [row] = await db.select().from(schema.customExercises).where(eq(schema.customExercises.id, id));
  return row ? json(row) : err("Introuvable.", 404);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const { id } = await params;
  if (!isUuid(id)) return err("Identifiant invalide.", 404);
  const p = metaBody.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return err("Métadonnées invalides.");
  const v = validateCustom(p.data.schema);
  if (!v.ok) return json({ error: "Contenu invalide", errors: v.errors }, 400);
  const [row] = await db.update(schema.customExercises).set({ ...p.data, schema: v.schema, updatedAt: new Date() }).where(eq(schema.customExercises.id, id)).returning();
  return row ? json(row) : err("Introuvable.", 404);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const { id } = await params;
  if (!isUuid(id)) return err("Identifiant invalide.", 404);
  await db.delete(schema.customExercises).where(eq(schema.customExercises.id, id));
  return json({ ok: true });
}
