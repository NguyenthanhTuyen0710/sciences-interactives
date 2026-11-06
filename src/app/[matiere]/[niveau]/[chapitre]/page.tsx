import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS, subjectFromSlug } from "@/lib/content/curriculum";
import { getTree } from "@/lib/content/tree";
import { KIND_LABELS } from "@/lib/engine/labels";
import { Breadcrumbs, Empty, ExerciseCard } from "@/components/ui";
import MathText from "@/components/MathText";
import ChapterView, { ChapterSources } from "@/components/chapter/ChapterView";
import { chapterByTreeId } from "@/lib/chapters";

export const dynamic = "force-dynamic";

export default async function ChapterPage({ params }: { params: Promise<{ matiere: string; niveau: string; chapitre: string }> }) {
  const { matiere, niveau, chapitre } = await params;
  const subject = subjectFromSlug(matiere);
  if (!subject) notFound();
  const { levels, metas } = await getTree(subject);
  const level = levels.find((l) => l.id === niveau);
  const chapter = level?.chapters.find((c) => c.id === chapitre);
  if (!level || !chapter) notFound();
  const S = SUBJECTS[subject];
  const full = chapterByTreeId(chapter.id);
  // Exercices du chapitre complet : affichés par niveau dans ChapterView, pas en double ci-dessous.
  const exs = metas.filter((m) => m.chapterId === chapter.id && (!full || m.notionId !== full.id));
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: `/${matiere}`, label: S.label }, { href: `/${matiere}/${niveau}`, label: level.label }, { label: chapter.title }]} />
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{chapter.theme}</p>
      <h1 className="mb-6 text-3xl font-black">{chapter.title}</h1>
      {full && <div className="mb-12"><ChapterView c={full} /></div>}
      {full && chapter.notions.length > 0 && <h2 className="mb-4 text-2xl font-black">Exercices complémentaires</h2>}
      {!full && chapter.notions.length === 0 && <Empty>Ce chapitre n'a pas encore de contenu. Les enseignants peuvent y ajouter des exercices depuis l'espace enseignant.</Empty>}
      <div className="space-y-8">
        {chapter.notions.map((n) => {
          const list = exs.filter((m) => m.notionId === n.id);
          const kinds = [...new Set(list.flatMap((m) => m.kinds))];
          const fiche = "fiche" in n ? (n as { fiche?: { definition: string } }).fiche : undefined;
          return (
            <section key={n.id} id={n.id} className="scroll-mt-24">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-xl font-bold">{n.title}</h2>
                {fiche && <Link href={`/cours/${n.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">📘 Fiche de cours</Link>}
              </div>
              {fiche && <div className="mb-4 rounded-xl bg-indigo-50/60 p-4 text-sm text-slate-700"><MathText text={fiche.definition} /></div>}
              {list.length ? (
                <>
                  <p className="mb-2 text-xs text-slate-500">Types d'exercice : {kinds.map((k) => KIND_LABELS[k]).join(" · ")}</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((m) => <ExerciseCard key={m.id} m={m} />)}</div>
                </>
              ) : <Empty>Pas encore d'exercice pour cette notion.</Empty>}
            </section>
          );
        })}
      </div>
      {full && <ChapterSources c={full} />}
    </div>
  );
}
