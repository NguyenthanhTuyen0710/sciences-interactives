import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { validateCustom } from "@/lib/content/custom";
import { err, json } from "@/lib/http";
import { metaBody } from "@/lib/content/admin-schema";

export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const data = (await req.json().catch(() => null)) as { format?: string; exercises?: unknown[]; chapters?: { id: string; subject: string; level: string; title: string; theme: string; notions: { id: string; title: string }[] }[] } | null;
  if (!data || data.format !== "plateforme-educative/v1") return err("Fichier non reconnu (format attendu : plateforme-educative/v1).");
  const report = { imported: 0, chapters: 0, rejected: [] as string[] };
  for (const c of data.chapters ?? []) {
    if (!c?.id || !c.title) continue;
    await db.insert(schema.customChapters).values({ id: c.id, subject: c.subject, level: c.level, title: c.title, theme: c.theme, notions: c.notions ?? [] }).onConflictDoNothing();
    report.chapters++;
  }
  for (const [i, raw] of (data.exercises ?? []).entries()) {
    const p = metaBody.safeParse(raw);
    if (!p.success) { report.rejected.push(`#${i + 1} : métadonnées invalides`); continue; }
    const v = validateCustom(p.data.schema);
    if (!v.ok) { report.rejected.push(`#${i + 1} « ${p.data.title} » : ${v.errors[0]}`); continue; }
    await db.insert(schema.customExercises).values({ ...p.data, schema: v.schema, authorId: g.user.id });
    report.imported++;
  }
  return json(report);
}
