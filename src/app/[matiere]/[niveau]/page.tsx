import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS, subjectFromSlug } from "@/lib/content/curriculum";
import { getTree } from "@/lib/content/tree";
import { Breadcrumbs, Empty, StatusBadge, levelTone } from "@/components/ui";
import { ALL_CHAPTERS, chapterByTreeId, isVisible } from "@/lib/chapters";

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
      <h1 className="mb-1 text-3xl font-black">{S.label} · <span className={levelTone(level.id).text}>{level.label}</span></h1>
      <p className="mb-6 text-slate-600">Chapitres organisés par thème du programme.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {levels.map((l) => <Link key={l.id} href={`/${matiere}/${l.id}`} aria-current={l.id === niveau ? "page" : undefined} className={`rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${l.id === niveau ? levelTone(l.id).solid : `${levelTone(l.id).chip} border-transparent hover:shadow-md`}`}>{l.id}</Link>)}
      </div>
      {themes.map((t) => (
        <section key={t} className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{t}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {level.chapters.filter((c) => c.theme === t).map((c) => {
              const ex = metas.filter((m) => m.chapterId === c.id);
              const full = chapterByTreeId(c.id);
              const pending = full ? null : ALL_CHAPTERS.find((x) => x.treeChapterId === c.id && !isVisible(x));
              return (
                <Link key={c.id} href={`/${matiere}/${niveau}/${c.id}`} className={`card block border-l-4 ${levelTone(niveau).accent} p-5 transition hover:shadow-md`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <span className="chip shrink-0 bg-slate-100 text-slate-600">{ex.length} ex.</span>
                  </div>
                  {(full || pending) && <div className="mt-2"><StatusBadge status={full ? full.publicationStatus : pending!.publicationStatus} /></div>}
                  {pending && <p className="mt-2 text-sm text-slate-600">Chapitre complet en relecture : pas encore ouvert.</p>}
                  {full ? (
                    <p className="mt-2 text-sm text-slate-600">Cours complet, exercices sur 5 niveaux et {full.games.length} activités interactives.</p>
                  ) : c.notions.length ? (
                    <ul className="mt-2 space-y-0.5 text-sm text-slate-600">{c.notions.map((n) => <li key={n.id}>• {n.title}</li>)}</ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">Notions et exercices en cours de rédaction par l'équipe pédagogique.</p>
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
