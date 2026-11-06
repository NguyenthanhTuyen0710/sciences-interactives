import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { err, json } from "@/lib/http";

const body = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["eleve", "enseignant"]).default("eleve"),
  teacherCode: z.string().optional(),
  level: z.enum(["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"]).optional(),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return err("Données invalides : nom (2 caractères min.), e-mail valide et mot de passe de 8 caractères minimum.");
  const d = parsed.data;
  if (d.role === "enseignant" && d.teacherCode !== (process.env.TEACHER_INVITE_CODE || "PROF-2026")) return err("Code d'invitation enseignant incorrect.", 403);
  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, d.email));
  if (exists) return err("Un compte existe déjà avec cette adresse e-mail.", 409);
  const [u] = await db.insert(schema.users).values({ name: d.name, email: d.email, passwordHash: await hashPassword(d.password), role: d.role, level: d.level ?? null }).returning();
  await createSession(u.id);
  return json({ ok: true, role: u.role });
}
