import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { getFullTree } from "./content/tree";

export async function chapterOptions() {
  const t = await getFullTree();
  return (["maths", "pc"] as const).flatMap((s) => t[s].levels.flatMap((l) => l.chapters.map((c) => ({ id: c.id, title: c.title, subject: s, level: l.id, notions: c.notions.map((n) => ({ id: n.id, title: n.title })) }))));
}

export async function teacherStats() {
  const [students, perEx, perStudent, totals] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(schema.users).where(eq(schema.users.role, "eleve")),
    db.select({ id: schema.attempts.exerciseId, n: sql<number>`count(*)::int`, avg: sql<number>`avg(${schema.attempts.score})::float`, users: sql<number>`count(distinct ${schema.attempts.userId})::int`, time: sql<number>`avg(${schema.attempts.timeSpentSec})::float` })
      .from(schema.attempts).groupBy(schema.attempts.exerciseId).orderBy(sql`count(*) desc`),
    db.select({ id: schema.users.id, name: schema.users.name, level: schema.users.level, n: sql<number>`count(${schema.attempts.id})::int`, avg: sql<number>`coalesce(avg(${schema.attempts.score}),0)::float`, last: sql<Date | null>`max(${schema.attempts.createdAt})` })
      .from(schema.users).leftJoin(schema.attempts, eq(schema.attempts.userId, schema.users.id)).where(eq(schema.users.role, "eleve")).groupBy(schema.users.id).orderBy(desc(sql`max(${schema.attempts.createdAt})`)),
    db.select({ n: sql<number>`count(*)::int`, avg: sql<number>`coalesce(avg(${schema.attempts.score}),0)::float` }).from(schema.attempts),
  ]);
  return { students: students[0].n, perEx, perStudent, attempts: totals[0].n, avg: totals[0].avg };
}
