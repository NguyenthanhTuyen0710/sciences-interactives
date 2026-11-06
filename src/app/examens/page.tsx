import Link from "next/link";
import { EXAMS } from "@/lib/series";
import { Breadcrumbs } from "@/components/ui";

export const metadata = { title: "Examens" };

export default function ExamsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Examens" }]} />
      <h1 className="mb-1 text-3xl font-black">Préparer les examens</h1>
      <p className="mb-6 text-slate-600">Des sujets d'entraînement générés à la demande, chronométrés et notés sur 20. Chaque sujet est différent.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(EXAMS).map(([slug, e]) => (
          <Link key={slug} href={`/examens/${slug}`} className="card p-5 transition hover:border-indigo-300 hover:shadow-md">
            <div className="mb-2 flex gap-2">
              <span className={`chip ${e.subject === "maths" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>{slug.startsWith("brevet") ? "Brevet" : slug.startsWith("bac") ? "Baccalauréat" : "Contrôle"}</span>
              <span className="chip bg-slate-100 text-slate-600">{e.minutes} min · {e.n} exercices</span>
            </div>
            <h2 className="text-lg font-bold">{e.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{e.intro}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-500">Ces sujets d'entraînement sont composés d'exercices originaux de la plateforme ; ils ne reproduisent pas les sujets officiels.</p>
    </div>
  );
}
