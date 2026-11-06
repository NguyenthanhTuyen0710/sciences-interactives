import Link from "next/link";
import { notFound } from "next/navigation";
import { SUBJECTS, subjectFromSlug } from "@/lib/content/curriculum";
import { getTree } from "@/lib/content/tree";
import { getUser } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ matiere: string }> }) {
  const s = subjectFromSlug((await params).matiere);
  return { title: s ? SUBJECTS[s].label : "Matière" };
}

export default async function SubjectPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const subject = subjectFromSlug(matiere);
  if (!subject) notFound();
  const [{ levels, metas }, user] = await Promise.all([getTree(subject), getUser()]);
  const S = SUBJECTS[subject];
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: S.label }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-black">{S.label}</h1>
        <p className="mt-1 text-slate-600">{S.description} Choisissez votre niveau, puis un chapitre.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((l) => {
          const n = metas.filter((m) => m.level === l.id).length;
          const mine = user?.level === l.id;
          return (
            <section key={l.id} className={`card p-5 ${mine ? (subject === "maths" ? "ring-2 ring-indigo-400" : "ring-2 ring-emerald-400") : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <Link href={`/${matiere}/${l.id}`} className="text-xl font-bold hover:underline">{l.label}</Link>
                <span className={`chip ${subject === "maths" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}>{n} exercice{n > 1 ? "s" : ""}</span>
              </div>
              <ul className="space-y-1 text-sm">
                {l.chapters.map((c) => {
                  const k = metas.filter((m) => m.chapterId === c.id).length;
                  return (
                    <li key={c.id}>
                      <Link href={`/${matiere}/${l.id}/${c.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                        <span className={k ? "text-slate-800" : "text-slate-400"}>{c.title}</span>
                        <span className={`text-xs ${k ? "font-semibold text-slate-600" : "text-slate-300"}`}>{k || "—"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
