import { allMetas } from "@/lib/content/registry";
import { findNotion, SUBJECTS } from "@/lib/content/curriculum";
import { Breadcrumbs } from "@/components/ui";
import Catalog from "@/components/Catalog";
import { KIND_LABELS } from "@/lib/engine/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Exercices interactifs" };

export default async function ExercisesPage({ searchParams }: { searchParams: Promise<{ q?: string; niveau?: string; matiere?: string; type?: string }> }) {
  const sp = await searchParams;
  const metas = await allMetas();
  const items = metas.map((m) => {
    const f = findNotion(m.notionId);
    return { meta: m, text: [m.title, m.summary, m.level, SUBJECTS[m.subject].label, f?.notion.title, f?.chapter.title, ...m.kinds.map((k) => KIND_LABELS[k])].join(" ") };
  });
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Exercices interactifs" }]} />
      <h1 className="mb-1 text-3xl font-black">Exercices interactifs</h1>
      <p className="mb-6 text-slate-600">Chaque exercice est généré avec des valeurs aléatoires : tu peux t'entraîner à l'infini, avec correction automatique et solution détaillée.</p>
      <Catalog items={items} initial={sp} />
    </div>
  );
}
