import { allMetas } from "@/lib/content/registry";
import { dailyItems } from "@/lib/series";
import { Breadcrumbs } from "@/components/ui";
import SeriesPlayer from "@/components/SeriesPlayer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Défi du jour" };

export default async function DailyPage() {
  const items = dailyItems(await allMetas());
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/revisions", label: "Révisions" }, { label: "Défi du jour" }]} />
      <SeriesPlayer items={items} mode="defi" totalTime={600} title="Défi du jour" intro="5 exercices de maths et de physique-chimie, identiques pour tous aujourd'hui. 10 minutes !" />
    </div>
  );
}
