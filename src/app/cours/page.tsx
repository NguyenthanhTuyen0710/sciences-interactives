import Link from "next/link";
import { CURRICULUM, LEVELS, SUBJECTS } from "@/lib/content/curriculum";
import { Breadcrumbs } from "@/components/ui";
import type { Subject } from "@/lib/engine/types";

export const metadata = { title: "Cours et fiches" };

export default async function CoursPage({ searchParams }: { searchParams: Promise<{ niveau?: string }> }) {
  const { niveau } = await searchParams;
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Cours et fiches" }]} />
      <h1 className="mb-1 text-3xl font-black">Cours et fiches de révision</h1>
      <p className="mb-4 text-slate-600">Définitions, propriétés, méthodes et exemples, notion par notion.</p>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/cours" className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${!niveau ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-surface"}`}>Tous</Link>
        {LEVELS.map((l) => <Link key={l.id} href={`/cours?niveau=${l.id}`} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${niveau === l.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-surface"}`}>{l.short}</Link>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {(["maths", "pc"] as Subject[]).map((s) => (
          <section key={s}>
            <h2 className={`mb-3 text-xl font-bold ${s === "maths" ? "text-indigo-700" : "text-emerald-700"}`}>{SUBJECTS[s].label}</h2>
            <div className="space-y-4">
              {CURRICULUM[s].filter((l) => !niveau || l.id === niveau).map((l) => {
                const fiches = l.chapters.flatMap((c) => c.notions.filter((n) => n.fiche).map((n) => ({ n, c })));
                if (!fiches.length) return null;
                return (
                  <div key={l.id} className="card p-4">
                    <h3 className="mb-2 font-bold">{l.label}</h3>
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {fiches.map(({ n, c }) => (
                        <li key={n.id}><Link href={`/cours/${n.id}`} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"><span className="font-medium">{n.title}</span><span className="block text-xs text-slate-500">{c.title}</span></Link></li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
