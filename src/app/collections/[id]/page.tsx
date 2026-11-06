import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { allMetas } from "@/lib/content/registry";
import { Breadcrumbs, ExerciseCard } from "@/components/ui";
import SeriesPlayer from "@/components/SeriesPlayer";
import { randomSeed } from "@/lib/engine/rng";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mode?: string }> }) {
  const { id } = await params;
  const { mode } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [c] = await db.select().from(schema.collections).where(eq(schema.collections.id, id));
  if (!c) notFound();
  const metas = new Map((await allMetas()).map((m) => [m.id, m]));
  const items = c.items.filter((i) => metas.has(i.exerciseId));
  const seed = randomSeed();
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Collection" }, { label: c.title }]} />
      <h1 className="text-3xl font-black">{c.title}</h1>
      {c.description && <p className="mb-4 text-slate-600">{c.description}</p>}
      {mode === "serie" ? (
        <SeriesPlayer items={items.map((i, k) => ({ id: i.exerciseId, difficulty: i.difficulty, seed: seed + k }))} mode="collection" title={c.title} intro="Faites les exercices dans l'ordre ; votre note sur 20 s'affichera à la fin." />
      ) : (
        <>
          <a href="?mode=serie" className="btn-primary mb-6">▶ Faire la série complète (note sur 20)</a>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => <ExerciseCard key={i.exerciseId} m={metas.get(i.exerciseId)!} difficulty={i.difficulty} />)}</div>
        </>
      )}
    </div>
  );
}
