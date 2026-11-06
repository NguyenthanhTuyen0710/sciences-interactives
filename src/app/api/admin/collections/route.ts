import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { err, json } from "@/lib/http";

const body = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().max(500).default(""),
  items: z.array(z.object({ exerciseId: z.string().min(1), difficulty: z.number().int().min(1).max(3) })).min(1).max(30),
});

export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const p = body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return err("Donnez un titre et au moins un exercice.");
  const [row] = await db.insert(schema.collections).values({ ...p.data, authorId: g.user.id }).returning();
  return json(row, 201);
}

export async function DELETE(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return err("id invalide");
  await db.delete(schema.collections).where(g.user.role === "admin" ? eq(schema.collections.id, id) : and(eq(schema.collections.id, id), eq(schema.collections.authorId, g.user.id)));
  return json({ ok: true });
}
