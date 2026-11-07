import { allMetas } from "@/lib/content/registry";
import { randomItems } from "@/lib/series";
import { Breadcrumbs, Empty } from "@/components/ui";
import SeriesPlayer from "@/components/SeriesPlayer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Défi chronométré" };

export default async function DefiPage({ searchParams }: { searchParams: Promise<{ matiere?: string; niveau?: string; d?: string }> }) {
  const sp = await searchParams;
  const metas = (await allMetas()).filter((m) => (!sp.niveau || m.level === sp.niveau) && (!sp.matiere || sp.matiere === "tout" || m.subject === sp.matiere));
  const items = randomItems(metas, 5, Math.min(3, Math.max(1, Number(sp.d) || 2)));
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/revisions", label: "Révisions" }, { label: "Défi chronométré" }]} />
      {items.length ? (
        <SeriesPlayer items={items} mode="defi" totalTime={600} title={`Défi chronométré · ${sp.niveau ?? "tous niveaux"}`} intro="Réponds au maximum d'exercices en 10 minutes. La correction s'affiche après chaque exercice." />
      ) : <Empty>Pas encore assez d'exercices pour ce niveau et cette matière.</Empty>}
    </div>
  );
}
