import Link from "next/link";
import { notFound } from "next/navigation";
import { findNotion, SUBJECTS } from "@/lib/content/curriculum";
import { allMetas } from "@/lib/content/registry";
import { Breadcrumbs, ExerciseCard } from "@/components/ui";
import MathText from "@/components/MathText";

export const dynamic = "force-dynamic";

export default async function FichePage({ params }: { params: Promise<{ notion: string }> }) {
  const { notion } = await params;
  const f = findNotion(notion);
  if (!f?.notion.fiche) notFound();
  const fiche = f.notion.fiche;
  const S = SUBJECTS[f.subject];
  const exs = (await allMetas()).filter((m) => m.notionId === notion);
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/cours", label: "Cours et fiches" }, { href: `/${S.slug}/${f.level.id}/${f.chapter.id}`, label: `${f.level.label} · ${f.chapter.title}` }, { label: f.notion.title }]} />
      <article className="card overflow-hidden">
        <header className={`px-6 py-5 text-white ${f.subject === "maths" ? "bg-indigo-600" : "bg-emerald-600"}`}>
          <p className="text-sm opacity-80">{S.label} · {f.level.label} · {f.chapter.title}</p>
          <h1 className="text-2xl font-black">{f.notion.title}</h1>
        </header>
        <div className="space-y-6 p-6">
          <section>
            <h2 className="mb-2 font-bold text-slate-900">Définition</h2>
            <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50/60 p-4"><MathText text={fiche.definition} /></div>
          </section>
          <section>
            <h2 className="mb-2 font-bold text-slate-900">À retenir</h2>
            <ul className="space-y-2">{fiche.proprietes.map((p, i) => <li key={i} className="flex gap-2 rounded-xl bg-slate-50 p-3"><span className="font-bold text-indigo-400">{i + 1}.</span><MathText text={p} /></li>)}</ul>
          </section>
          {fiche.methode && (
            <section>
              <h2 className="mb-2 font-bold text-slate-900">Méthode</h2>
              <ol className="list-decimal space-y-1 pl-6">{fiche.methode.map((m, i) => <li key={i}><MathText text={m} /></li>)}</ol>
            </section>
          )}
          {fiche.exemple && (
            <section>
              <h2 className="mb-2 font-bold text-slate-900">Exemple</h2>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><MathText text={fiche.exemple} /></div>
            </section>
          )}
        </div>
      </article>
      {exs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold">S'entraîner</h2>
          <div className="grid gap-4 sm:grid-cols-2">{exs.map((m) => <ExerciseCard key={m.id} m={m} />)}</div>
        </section>
      )}
      <p className="mt-6 text-center"><Link href="/cours" className="text-sm font-semibold text-indigo-400 hover:underline">← Toutes les fiches</Link></p>
    </div>
  );
}
