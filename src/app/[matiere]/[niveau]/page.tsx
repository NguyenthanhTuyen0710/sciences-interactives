import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS, subjectFromSlug } from "@/lib/content/curriculum";
import { getTree } from "@/lib/content/tree";
import { Breadcrumbs, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LevelPage({ params }: { params: Promise<{ matiere: string; niveau: string }> }) {
  const { matiere, niveau } = await params;
  const subject = subjectFromSlug(matiere);
  if (!subject) notFound();
  const { levels, metas } = await getTree(subject);
  const level = levels.find((l) => l.id === niveau);
  if (!level) notFound();
  const S = SUBJECTS[subject];
  const themes = [...new Set(level.chapters.map((c) => c.theme))];
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: `/${matiere}`, label: S.label }, { label: level.label }]} />
      <h1 className="mb-1 text-3xl font-black">{S.label} · {level.label}</h1>
      <p className="mb-6 text-slate-600">Chapitres organisés par thème du programme.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {levels.map((l) => <Link key={l.id} href={`/${matiere}/${l.id}`} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${l.id === niveau ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white hover:bg-slate-50"}`}>{l.id}</Link>)}
      </div>
      {themes.map((t) => (
        <section key={t} className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{t}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {level.chapters.filter((c) => c.theme === t).map((c) => {
              const ex = metas.filter((m) => m.chapterId === c.id);
              return (
                <Link key={c.id} href={`/${matiere}/${niveau}/${c.id}`} className="card block p-5 transition hover:border-indigo-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <span className="chip shrink-0 bg-slate-100 text-slate-600">{ex.length} ex.</span>
                  </div>
                  {c.notions.length ? (
                    <ul className="mt-2 space-y-0.5 text-sm text-slate-600">{c.notions.map((n) => <li key={n.id}>• {n.title}</li>)}</ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">Notions et exercices en cours de rédaction par l'équipe pédagogique.</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      {!level.chapters.length && <Empty>Aucun chapitre pour ce niveau.</Empty>}
    </div>
  );
}
