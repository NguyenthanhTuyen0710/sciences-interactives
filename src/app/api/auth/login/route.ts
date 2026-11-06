import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { err, json } from "@/lib/http";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return err("E-mail et mot de passe requis.");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email.trim().toLowerCase()));
  if (!u || !(await verifyPassword(password, u.passwordHash))) return err("E-mail ou mot de passe incorrect.", 401);
  await createSession(u.id);
  return json({ ok: true, role: u.role });
}
