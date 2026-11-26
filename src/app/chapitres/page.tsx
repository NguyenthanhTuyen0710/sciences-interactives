import Link from "next/link";
import { LEVELS, SUBJECTS } from "@/lib/content/curriculum";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import type { Subject } from "@/lib/engine/types";
import { Breadcrumbs, ChapterCard, Empty, chapterSummary, countsLabel, levelCounts, levelTone, plural } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chapitres" };

const SUBJECT_FILTERS: { id: Subject | null; label: string }[] = [
  { id: null, label: "Toutes les matières" },
  { id: "maths", label: SUBJECTS.maths.label },
  { id: "pc", label: SUBJECTS.pc.label },
];

export default async function ChaptersPage({ searchParams }: { searchParams: Promise<{ niveau?: string; matiere?: string }> }) {
  const sp = await searchParams;
  const level = sp.niveau ? LEVELS.find((l) => l.id === sp.niveau) ?? null : null;
  const unknownLevel = !!sp.niveau && !level;
  const subject: Subject | null = sp.matiere === "maths" || sp.matiere === "pc" ? sp.matiere : null;
  const href = (niveau: string | null, matiere: Subject | null) => {
    const q = new URLSearchParams();
    if (niveau) q.set("niveau", niveau);
    if (matiere) q.set("matiere", matiere);
    const s = q.toString();
    return s ? `/chapitres?${s}` : "/chapitres";
  };
  const chapters = ALL_CHAPTERS.map((c) => chapterSummary(c, isVisible(c))).filter((c) => !subject || c.subject === subject);
  const shown = level ? [level] : unknownLevel ? [] : LEVELS;
  const inView = chapters.filter((c) => shown.some((l) => l.id === c.level));
  const published = inView.filter((c) => c.status === "published").length;
  const pill = "rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition hover:shadow-md";

  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Chapitres" }]} />
      <h1 className="mb-1 text-3xl font-black">Chapitres</h1>
      <p className="mb-6 max-w-3xl text-slate-600">Un chapitre complet réunit un cours, des exercices corrigés sur plusieurs niveaux de difficulté et des jeux. Ceux marqués « Brouillon » sont encore en relecture : tu les vois dans la liste, mais ils ne sont pas encore ouverts.</p>

      <div className="card mb-8 space-y-3 p-4">
        <nav aria-label="Filtrer par classe" className="flex flex-wrap gap-2">
          <Link href={href(null, subject)} aria-current={!level && !unknownLevel ? "page" : undefined} className={`${pill} ${!level && !unknownLevel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-(--surface) text-slate-700"}`}>Toutes les classes</Link>
          {LEVELS.map((l) => {
            const on = level?.id === l.id;
            return <Link key={l.id} href={href(l.id, subject)} aria-current={on ? "page" : undefined} className={`${pill} ${on ? levelTone(l.id).solid : `${levelTone(l.id).chip} border-transparent`}`}>{l.short}</Link>;
          })}
        </nav>
        <nav aria-label="Filtrer par matière" className="flex flex-wrap gap-2">
          {SUBJECT_FILTERS.map((f) => {
            const on = subject === f.id;
            return <Link key={f.label} href={href(level?.id ?? null, f.id)} aria-current={on ? "page" : undefined} className={`${pill} ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-(--surface) text-slate-700"}`}>{f.label}</Link>;
          })}
        </nav>
      </div>

      {unknownLevel ? (
        <Empty>
          <p>Cette classe n'existe pas dans le programme.</p>
          <Link href={href(null, subject)} className="mt-2 inline-block font-semibold text-indigo-600 hover:underline">Voir toutes les classes</Link>
        </Empty>
      ) : (
        <>
          <p className="mb-6 text-sm text-slate-600" role="status">
            {inView.length ? `${plural(inView.length, "chapitre complet", "chapitres complets")} : ${plural(published, "publié", "publiés")}, ${plural(inView.length - published, "brouillon", "brouillons")}.` : "Aucun chapitre complet pour ce choix pour l'instant."}
          </p>
          <div className="space-y-10">
            {shown.map((l) => {
              const k = levelCounts(chapters, l.id, subject);
              const list = chapters.filter((c) => c.level === l.id);
              const subjects = (subject ? [subject] : (["maths", "pc"] as Subject[]));
              return (
                <section key={l.id} aria-labelledby={`niveau-${l.id}`}>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id={`niveau-${l.id}`} className={`text-2xl font-black ${levelTone(l.id).text}`}>{l.label}</h2>
                    <p className="text-sm text-slate-600">{countsLabel(k)}</p>
                  </div>
                  {list.length ? (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((c) => <li key={c.id}><ChapterCard c={c} /></li>)}
                    </ul>
                  ) : (
                    <Empty>
                      <p>Aucun chapitre complet pour l'instant. Les thèmes du programme sont déjà consultables :</p>
                      <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                        {subjects.map((s) => <Link key={s} href={`/${SUBJECTS[s].slug}/${l.id}`} className="font-semibold text-indigo-600 hover:underline">Voir les thèmes de {SUBJECTS[s].label} en {l.short}</Link>)}
                      </p>
                    </Empty>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
