import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSON_META } from "@/lib/lessons-meta";
import { Breadcrumbs } from "@/components/ui";
import InteractiveLesson from "@/components/InteractiveLesson";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = LESSON_META.find((l) => l.slug === slug);
  if (!meta) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/lecons", label: "Leçons animées" }, { label: meta.title }]} />
      <h1 className="mb-4 text-2xl font-black sm:text-3xl">{meta.title}</h1>
      <InteractiveLesson slug={slug} />
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/cours/${meta.notion}`} className="btn-ghost">📘 Fiche de cours</Link>
        <Link href={`/exercice/${meta.exercise}`} className="btn-primary">S'entraîner →</Link>
      </div>
    </div>
  );
}
