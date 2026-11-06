import { db, schema } from "@/lib/db";
import ChapterForm from "@/components/admin/ChapterForm";
import { DeleteButton } from "@/components/admin/AdminActions";
import { Empty, SubjectBadge } from "@/components/ui";

export default async function ChaptersAdmin() {
  const rows = await db.select().from(schema.customChapters);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5"><h1 className="mb-3 text-xl font-bold">Ajouter un chapitre</h1><ChapterForm /></section>
      <section className="card p-5">
        <h2 className="mb-3 text-xl font-bold">Chapitres ajoutés</h2>
        {rows.length ? <ul className="space-y-3">{rows.map((c) => (
          <li key={c.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2"><span><SubjectBadge subject={c.subject} /> <span className="font-semibold">{c.level} · {c.title}</span></span><DeleteButton url={`/api/admin/chapters?id=${encodeURIComponent(c.id)}`} confirmText="Supprimer ce chapitre ? (les exercices associés ne seront plus classés)" /></div>
            <p className="mt-1 text-sm text-slate-600">{c.notions.map((n) => n.title).join(" · ")}</p>
          </li>
        ))}</ul> : <Empty>Les chapitres du programme sont déjà intégrés. Ajoutez ici des chapitres complémentaires.</Empty>}
      </section>
    </div>
  );
}
