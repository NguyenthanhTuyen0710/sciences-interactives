import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { chapterOptions } from "@/lib/admin";
import ExerciseEditor, { type EditorInitial } from "@/components/admin/ExerciseEditor";

export default async function EditExercise({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [row] = await db.select().from(schema.customExercises).where(eq(schema.customExercises.id, id));
  if (!row) notFound();
  const initial: EditorInitial = { id: row.id, title: row.title, summary: row.summary, subject: row.subject, level: row.level, chapterId: row.chapterId, notionId: row.notionId, difficulty: row.difficulty, published: row.published, schema: row.schema as EditorInitial["schema"] };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Modifier : {row.title}</h1>
      <ExerciseEditor initial={initial} chapters={await chapterOptions()} />
    </div>
  );
}
