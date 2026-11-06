import { metaBody } from "@/lib/content/admin-schema";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { validateCustom } from "@/lib/content/custom";
import { err, json } from "@/lib/http";



export async function GET() {
  const g = await requireStaff();
  if (g.error) return g.error;
  return json(await db.select().from(schema.customExercises).orderBy(desc(schema.customExercises.updatedAt)));
}

export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const p = metaBody.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return err("Métadonnées invalides : " + p.error.issues.map((i) => i.path.join(".") + " " + i.message).join(" ; "));
  const v = validateCustom(p.data.schema);
  if (!v.ok) return json({ error: "Contenu invalide", errors: v.errors }, 400);
  const [row] = await db.insert(schema.customExercises).values({ ...p.data, schema: v.schema, authorId: g.user.id }).returning();
  return json(row, 201);
}
