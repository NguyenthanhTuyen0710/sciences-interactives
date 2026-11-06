import { notFound } from "next/navigation";
import { allMetas } from "@/lib/content/registry";
import { EXAMS, examItems } from "@/lib/series";
import { Breadcrumbs } from "@/components/ui";
import SeriesPlayer from "@/components/SeriesPlayer";

export const dynamic = "force-dynamic";

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = EXAMS[slug];
  if (!e) notFound();
  const items = examItems(slug, await allMetas());
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/examens", label: "Examens" }, { label: e.title }]} />
      <SeriesPlayer items={items} mode="examen" totalTime={e.minutes * 60} title={e.title} intro={e.intro} />
    </div>
  );
}
