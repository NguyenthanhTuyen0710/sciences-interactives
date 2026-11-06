import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { err, json } from "@/lib/http";

const body = z.object({
  subject: z.enum(["maths", "pc"]),
  level: z.enum(["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"]),
  title: z.string().trim().min(3).max(100),
  theme: z.string().trim().max(100).optional(),
  notions: z.array(z.string().trim().min(2).max(100)).min(1).max(20),
});
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export async function GET() {
  return json(await db.select().from(schema.customChapters));
}

export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const p = body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return err("Données invalides (titre et au moins une notion).");
  const id = `c-${p.data.subject}-${p.data.level}-${slug(p.data.title)}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(schema.customChapters).values({
    id, subject: p.data.subject, level: p.data.level, title: p.data.title, theme: p.data.theme || "Chapitre ajouté par l'équipe",
    notions: p.data.notions.map((t) => ({ id: `${id}-${slug(t)}`, title: t })),
  }).returning();
  return json(row, 201);
}

export async function DELETE(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return err("id manquant");
  await db.delete(schema.customChapters).where(eq(schema.customChapters.id, id));
  return json({ ok: true });
}
