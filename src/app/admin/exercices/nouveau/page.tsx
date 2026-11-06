import { chapterOptions } from "@/lib/admin";
import ExerciseEditor, { EMPTY } from "@/components/admin/ExerciseEditor";

export const metadata = { title: "Nouvel exercice" };

export default async function NewExercise() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Créer un exercice</h1>
      <ExerciseEditor initial={EMPTY} chapters={await chapterOptions()} />
    </div>
  );
}
