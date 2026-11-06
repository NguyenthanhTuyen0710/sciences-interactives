import Link from "next/link";
import { notFound } from "next/navigation";
import { allMetas, getGenerator } from "@/lib/content/registry";
import { CURRICULUM, SUBJECTS, findNotion, levelLabel } from "@/lib/content/curriculum";
import { createRng, randomSeed } from "@/lib/engine/rng";
import { toPublic } from "@/lib/engine/public";
import type { Difficulty } from "@/lib/engine/types";
import { Breadcrumbs, ExerciseCard } from "@/components/ui";
import ExercisePlayer from "@/components/ExercisePlayer";
import MathText from "@/components/MathText";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const g = await getGenerator((await params).id);
  return { title: g?.meta.title ?? "Exercice" };
}

export default async function ExercisePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ seed?: string; d?: string; chrono?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const g = await getGenerator(id);
  if (!g) notFound();
  const seed = (sp.seed || randomSeed()).slice(0, 32);
  const d = Math.min(3, Math.max(1, Number(sp.d) || 1)) as Difficulty;
  const exercise = toPublic(g.generate(createRng(seed), d));
  const m = g.meta;
  const S = SUBJECTS[m.subject];
  const found = findNotion(m.notionId);
  const chapterTitle = found?.chapter.title ?? CURRICULUM[m.subject].flatMap((l) => l.chapters).find((c) => c.id === m.chapterId)?.title ?? "Chapitre";
  const related = (await allMetas()).filter((x) => x.chapterId === m.chapterId && x.id !== m.id).slice(0, 3);
  return (
    <div>
      <Breadcrumbs items={[
        { href: "/", label: "Accueil" }, { href: `/${S.slug}`, label: S.label }, { href: `/${S.slug}/${m.level}`, label: levelLabel(m.level) },
        { href: `/${S.slug}/${m.level}/${m.chapterId}`, label: chapterTitle }, { label: m.title },
      ]} />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="mb-1 text-2xl font-black sm:text-3xl">{m.title}</h1>
          <p className="mb-4 text-slate-600">{m.summary}</p>
          <ExercisePlayer initial={{ meta: m, seed, difficulty: d, exercise }} syncUrl startTimed={sp.chrono === "1"} />
        </div>
        <aside className="space-y-4">
          {found?.notion.fiche && (
            <div className="card p-4">
              <h2 className="mb-2 font-bold">📘 {found.notion.title}</h2>
              <MathText text={found.notion.fiche.definition} className="text-sm text-slate-700" />
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {found.notion.fiche.proprietes.slice(0, 3).map((p, i) => <li key={i} className="flex gap-1"><span>•</span><MathText text={p} /></li>)}
              </ul>
              <Link href={`/cours/${found.notion.id}`} className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">Fiche complète →</Link>
            </div>
          )}
          <div className="card p-4 text-sm text-slate-600">
            <h2 className="mb-1 font-bold text-slate-900">Comment répondre ?</h2>
            <ul className="list-disc space-y-1 pl-4">
              <li>Nombres : virgule décimale (3,5), fractions (7/4), puissances de 10 (2,1×10^3 ou 2,1e3).</li>
              <li>Expressions : 3x^2 - 5x + 2 (le signe × est facultatif).</li>
              <li>« Autre exercice » génère de nouvelles valeurs à l'infini.</li>
            </ul>
          </div>
          {related.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-bold">Dans le même chapitre</h2>
              {related.map((r) => <ExerciseCard key={r.id} m={r} />)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
