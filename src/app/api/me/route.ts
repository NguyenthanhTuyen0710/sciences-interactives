import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { err, json } from "@/lib/http";

const body = z.object({ name: z.string().trim().min(2).max(60).optional(), level: z.enum(["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"]).nullable().optional(), subjects: z.array(z.enum(["maths", "pc"])).min(1).optional() });

export async function GET() {
  return json({ user: await getUser() });
}

export async function PATCH(req: Request) {
  const u = await getUser();
  if (!u) return err("Non connecté.", 401);
  const p = body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return err("Données invalides.");
  await db.update(schema.users).set(p.data).where(eq(schema.users.id, u.id));
  return json({ ok: true });
}
