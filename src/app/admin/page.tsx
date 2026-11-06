import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { allMetas } from "@/lib/content/registry";
import { teacherStats } from "@/lib/admin";
import { Bar, Empty, Stat, SubjectBadge } from "@/components/ui";
import { DeleteButton, ImportBox } from "@/components/admin/AdminActions";

export const metadata = { title: "Espace enseignant" };

export default async function AdminHome() {
  const [stats, custom, metas] = await Promise.all([teacherStats(), db.select().from(schema.customExercises).orderBy(desc(schema.customExercises.updatedAt)), allMetas({ includeUnpublished: true })]);
  const byId = new Map(metas.map((m) => [m.id, m]));
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Élèves inscrits" value={String(stats.students)} />
        <Stat label="Tentatives" value={String(stats.attempts)} />
        <Stat label="Score moyen" value={`${Math.round(stats.avg * 100)} %`} />
        <Stat label="Exercices disponibles" value={String(metas.length)} sub={`dont ${custom.length} créés par l'équipe`} />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Exercices de l'équipe pédagogique</h2>
          <div className="flex gap-2"><a href="/api/admin/export" download className="btn-ghost">⬇ Exporter (JSON)</a><Link href="/admin/exercices/nouveau" className="btn-primary">+ Nouvel exercice</Link></div>
        </div>
        {custom.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500"><tr><th className="py-2">Titre</th><th>Matière</th><th>Niveau</th><th>Statut</th><th>Modifié</th><th></th></tr></thead>
              <tbody>{custom.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{c.title}</td><td><SubjectBadge subject={c.subject} /></td><td>{c.level}</td>
                  <td>{c.published ? <span className="chip bg-emerald-100 text-emerald-700">Publié</span> : <span className="chip bg-slate-100 text-slate-600">Brouillon</span>}</td>
                  <td className="text-slate-500">{c.updatedAt.toLocaleDateString("fr-FR")}</td>
                  <td className="space-x-3 text-right whitespace-nowrap">
                    <Link href={`/exercice/perso-${c.id}`} className="text-sm font-semibold text-slate-600 hover:underline">Voir</Link>
                    <Link href={`/admin/exercices/${c.id}`} className="text-sm font-semibold text-indigo-400 hover:underline">Modifier</Link>
                    <DeleteButton url={`/api/admin/exercises/${c.id}`} confirmText={`Supprimer « ${c.title} » ?`} />
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <Empty>Aucun exercice créé pour le moment. Les {metas.length} exercices générés de la plateforme sont déjà disponibles.</Empty>}
        <div className="mt-4 border-t border-slate-100 pt-4"><p className="mb-1 text-sm font-semibold">Importer des contenus (fichier exporté depuis cette plateforme)</p><ImportBox /></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Statistiques par exercice</h2>
          {stats.perEx.length ? (
            <ul className="space-y-3">{stats.perEx.slice(0, 15).map((e) => (
              <li key={e.id} className="text-sm">
                <div className="mb-1 flex justify-between gap-2"><span className="font-medium">{byId.get(e.id)?.title ?? e.id}</span><span className="text-slate-500">{e.n} tent. · {e.users} élève(s) · {Math.round(e.avg * 100)} % · {Math.round(e.time)} s</span></div>
                <Bar value={e.avg} color={e.avg >= 0.75 ? "bg-emerald-500" : e.avg >= 0.5 ? "bg-amber-400" : "bg-rose-400"} />
              </li>
            ))}</ul>
          ) : <Empty>Pas encore de tentative enregistrée.</Empty>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Suivi des élèves</h2>
          {stats.perStudent.length ? (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500"><tr><th className="py-1">Élève</th><th>Classe</th><th>Tent.</th><th>Moy.</th><th>Dernière activité</th></tr></thead>
              <tbody>{stats.perStudent.map((s) => (
                <tr key={s.id} className="border-t border-slate-100"><td className="py-1.5 font-medium">{s.name}</td><td>{s.level ?? "—"}</td><td>{s.n}</td>
                  <td className={s.avg >= 0.75 ? "text-emerald-400" : s.avg >= 0.5 ? "text-amber-400" : "text-rose-400"}>{s.n ? `${Math.round(s.avg * 100)} %` : "—"}</td>
                  <td className="text-slate-500">{s.last ? new Date(s.last).toLocaleDateString("fr-FR") : "—"}</td></tr>
              ))}</tbody>
            </table>
          ) : <Empty>Aucun élève inscrit.</Empty>}
        </section>
      </div>
    </div>
  );
}
