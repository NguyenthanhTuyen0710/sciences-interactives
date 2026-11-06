import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { allMetas } from "@/lib/content/registry";
import CollectionForm from "@/components/admin/CollectionForm";
import { DeleteButton } from "@/components/admin/AdminActions";
import { Empty } from "@/components/ui";

export default async function CollectionsAdmin() {
  const [rows, metas] = await Promise.all([db.select().from(schema.collections).orderBy(desc(schema.collections.createdAt)), allMetas()]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5"><h1 className="mb-3 text-xl font-bold">Nouvelle collection</h1><CollectionForm exercises={metas.map((m) => ({ id: m.id, title: m.title, level: m.level, subject: m.subject }))} /></section>
      <section className="card p-5">
        <h2 className="mb-3 text-xl font-bold">Collections</h2>
        {rows.length ? <ul className="space-y-2">{rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm">
            <div><p className="font-semibold">{c.title}</p><p className="text-slate-500">{c.items.length} exercice(s)</p></div>
            <div className="flex gap-3"><Link href={`/collections/${c.id}`} className="font-semibold text-indigo-400 hover:underline">Lien élèves</Link><DeleteButton url={`/api/admin/collections?id=${c.id}`} confirmText="Supprimer cette collection ?" /></div>
          </li>
        ))}</ul> : <Empty>Créez une feuille d'exercices à partager avec vos élèves.</Empty>}
      </section>
    </div>
  );
}
