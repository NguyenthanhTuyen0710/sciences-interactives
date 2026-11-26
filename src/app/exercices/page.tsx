import Link from "next/link";
import { allMetas } from "@/lib/content/registry";
import { findNotion, LEVELS, SUBJECTS } from "@/lib/content/curriculum";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import { LESSON_META } from "@/lib/lessons-meta";
import type { Subject } from "@/lib/engine/types";
import { Breadcrumbs, ChapterCard, Empty, LevelBadge, chapterSummary, chapterTypes, countsLabel, levelCounts, levelTone, plural, type TaxonomyRef } from "@/components/ui";
import Catalog from "@/components/Catalog";
import { MathInline } from "@/components/MathText";
import { KIND_LABELS } from "@/lib/engine/labels";
// Taxonomies verrouillées, lues au build côté serveur : seuls `id` et `title` en sortent (chapterTypes).
import taxCalculLitteral from "../../../research/curriculum/mathematiques/taxonomy/math-3e-calcul-litteral.json";
import taxEquations from "../../../research/curriculum/mathematiques/taxonomy/math-3e-equations.json";
import taxPythagore from "../../../research/curriculum/mathematiques/taxonomy/math-3e-pythagore.json";

export const dynamic = "force-dynamic";
export const metadata = { title: "Exercices interactifs" };

const TAXONOMIES: Record<string, TaxonomyRef> = {
  "math-3e-calcul-litteral": taxCalculLitteral,
  "math-3e-equations": taxEquations,
  "math-3e-pythagore": taxPythagore,
};
const SUBJECT_IDS: Subject[] = ["maths", "pc"];

export default async function ExercisesPage({ searchParams }: { searchParams: Promise<{ q?: string; niveau?: string; matiere?: string; type?: string }> }) {
  const sp = await searchParams;
  // Matière : Mathématiques par défaut pour les chapitres ; une recherche (?q=) sans matière explicite porte sur toutes les matières.
  const explicitSubject: Subject | null = sp.matiere === "maths" || sp.matiere === "pc" ? sp.matiere : null;
  const subject: Subject = explicitSubject ?? "maths";
  const level = LEVELS.find((l) => l.id === sp.niveau) ?? null;
  const href = (matiere: Subject, niveau: string | null) => {
    const q = new URLSearchParams({ matiere });
    if (niveau) q.set("niveau", niveau);
    if (sp.q) q.set("q", sp.q);
    return `/exercices?${q}`;
  };

  const metas = await allMetas();
  const items = metas.map((m) => {
    const f = findNotion(m.notionId);
    return { meta: m, text: [m.title, m.summary, m.level, SUBJECTS[m.subject].label, f?.notion.title, f?.chapter.title, ...m.kinds.map((k) => KIND_LABELS[k])].join(" ") };
  });
  const catalogInitial = { q: sp.q, type: sp.type, niveau: level?.id, matiere: explicitSubject ?? (sp.q ? undefined : subject) };
  const catalogCount = metas.filter((m) => m.subject === subject && (!level || m.level === level.id)).length;

  const chapters = ALL_CHAPTERS.map((c) => ({ c, s: chapterSummary(c, isVisible(c)) })).filter(({ s }) => s.subject === subject && (!level || s.level === level.id));
  const k = (level ? [level] : LEVELS).map((l) => levelCounts(chapters.map((x) => x.s), l.id, subject))
    .reduce((a, b) => ({ total: a.total + b.total, published: a.published + b.published, unpublished: a.unpublished + b.unpublished, themes: a.themes + b.themes }));
  const lessons = LESSON_META.filter((l) => l.subject === subject);
  const S = SUBJECTS[subject];
  const pill = "rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition hover:shadow-md";

  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Exercices interactifs" }]} />
      <h1 className="mb-1 text-3xl font-black">Exercices interactifs</h1>
      <p className="mb-6 max-w-3xl text-slate-600">Choisis ta matière et ta classe : tu t'entraînes chapitre par chapitre, avec des exercices corrigés tirés au hasard à chaque essai.</p>

      <nav aria-label="Choisir la matière" className="sticky top-[63px] z-30 -mx-4 mb-4 grid grid-cols-2 gap-2 bg-(--page) px-4 py-2 sm:static sm:mx-0 sm:flex sm:bg-transparent sm:px-0">
        {SUBJECT_IDS.map((id) => {
          const on = subject === id;
          return <Link key={id} href={href(id, level?.id ?? null)} aria-current={on ? "page" : undefined} className={`rounded-xl border-2 px-4 py-2.5 text-center font-bold transition ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-(--surface) text-slate-700 hover:shadow-md"}`}>{SUBJECTS[id].label}</Link>;
        })}
      </nav>
      <nav aria-label="Filtrer par classe" className="mb-8 flex flex-wrap gap-2">
        <Link href={href(subject, null)} aria-current={!level ? "page" : undefined} className={`${pill} ${!level ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-(--surface) text-slate-700"}`}>Toutes les classes</Link>
        {LEVELS.map((l) => {
          const on = level?.id === l.id;
          return <Link key={l.id} href={href(subject, l.id)} aria-current={on ? "page" : undefined} className={`${pill} ${on ? levelTone(l.id).solid : `${levelTone(l.id).chip} border-transparent`}`}>{l.short}</Link>;
        })}
      </nav>

      <section aria-labelledby="par-chapitre" className="mb-12">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="par-chapitre" className="text-2xl font-black">Par chapitre du programme</h2>
          <p className="text-sm text-slate-600">{S.label}{level ? ` · ${level.short}` : ""} : {countsLabel(k)}</p>
        </div>
        {chapters.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map(({ c, s }) => {
              const t = chapterTypes(c, TAXONOMIES[c.id] ?? null);
              return (
                <li key={s.id}>
                  <ChapterCard c={s} anchor="exercices" action="S'entraîner"
                    types={{ label: t.kind === "taxonomy" ? "Types d'exercices" : "Méthodes du cours", items: t.items.map((x) => <MathInline key={x.id} text={x.title} />) }} />
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>
            <p className="font-semibold text-slate-700">Pas encore de chapitre complet en {S.label}{level ? ` en ${level.short}` : ""}.</p>
            {catalogCount > 0
              ? <p className="mt-1">Tu peux déjà t'entraîner sur <a href="#tous-les-exercices" className="font-semibold text-indigo-600 hover:underline">{plural(catalogCount, "exercice interactif", "exercices interactifs")} de {S.label}{level ? ` en ${level.short}` : ""}</a>, plus bas sur cette page.</p>
              : <p className="mt-1">Aucun exercice interactif pour ce choix pour l'instant.</p>}
          </Empty>
        )}
      </section>

      <section aria-labelledby="lecons" className="mb-12">
        <h2 id="lecons" className="mb-3 text-2xl font-black">Leçons animées</h2>
        {lessons.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((l) => (
              <li key={l.slug}>
                <Link href={`/lecons/${l.slug}`} className={`card flex h-full flex-col gap-2 border-l-4 ${levelTone(l.level).accent} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}>
                  <div><LevelBadge level={l.level} /></div>
                  <h3 className="text-lg font-bold text-slate-900">{l.title}</h3>
                  <p className="text-sm text-slate-600">L'animation s'arrête pour te poser des questions.</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : <Empty><p>Pas encore de leçon animée en {S.label}.</p></Empty>}
      </section>

      <section aria-labelledby="tous-les-exercices">
        <h2 id="tous-les-exercices" className="mb-1 scroll-mt-24 text-2xl font-black">Tous les exercices</h2>
        <p className="mb-4 text-sm text-slate-600">Recherche un exercice précis par mot-clé, matière, classe ou type de réponse.</p>
        <Catalog key={JSON.stringify(catalogInitial)} items={items} initial={catalogInitial} />
      </section>
    </div>
  );
}
