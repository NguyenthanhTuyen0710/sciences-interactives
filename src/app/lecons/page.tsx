import Link from "next/link";
import { LESSON_META } from "@/lib/lessons-meta";
import { Breadcrumbs, SubjectBadge } from "@/components/ui";

export const metadata = { title: "Leçons animées" };

export default function Lessons() {
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Leçons animées" }]} />
      <h1 className="mb-1 text-3xl font-black">Leçons animées interactives</h1>
      <p className="mb-6 text-slate-600">L'animation s'arrête pour vous poser des questions : répondez pour continuer.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {LESSON_META.map((l) => (
          <Link key={l.slug} href={`/lecons/${l.slug}`} className="card p-5 hover:border-indigo-300 hover:shadow-md">
            <div className="mb-2 flex gap-2"><SubjectBadge subject={l.subject} /><span className="chip bg-slate-100 text-slate-700">{l.level}</span></div>
            <h2 className="text-lg font-bold">🎬 {l.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
