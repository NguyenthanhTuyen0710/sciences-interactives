import Link from "next/link";
import { sql } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { allMetas } from "@/lib/content/registry";
import { LEVELS } from "@/lib/content/curriculum";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import { db, schema } from "@/lib/db";
import { userDashboard } from "@/lib/progress";
import { dailyItems, todayKey } from "@/lib/series";
import { Bar, ChapterCard, ExerciseCard, chapterSummary, countsLabel, levelCounts, levelTone, plural } from "@/components/ui";
import RecentList from "@/components/RecentList";

export const dynamic = "force-dynamic";

/** Sections « Recommandés pour toi » et « Thèmes populaires » : masquées sur l'accueil (décision D5), code et données conservés. */
const SHOW_DISCOVERY = false;
const HERO_LEVELS = ["3e", "2nde", "1re", "Tle"];
const LATEST_COUNT = 6;

export default async function Home() {
  const [user, metas] = await Promise.all([getUser(), allMetas()]);
  const byId = new Map(metas.map((m) => [m.id, m]));
  const chapters = ALL_CHAPTERS.map((c) => chapterSummary(c, isVisible(c)));
  // Ordre d'inscription dans le registre (src/lib/chapters/index.ts) : le dernier inscrit en premier.
  const latest = [...chapters].reverse().slice(0, LATEST_COUNT);
  const exampleChapter = [...ALL_CHAPTERS].reverse().find(isVisible) ?? null;
  const example = exampleChapter ? chapterSummary(exampleChapter, true) : null;
  const daily = dailyItems(metas);
  const dash = user ? await userDashboard(user.id, user.level) : null;
  const others = LEVELS.filter((l) => !HERO_LEVELS.includes(l.id));

  return (
    <div className="space-y-12">
      {/* Accroche et choix de la classe */}
      <section aria-labelledby="accroche" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 px-5 py-10 text-white sm:px-10 sm:py-14">
        <div className="max-w-3xl">
          <h1 id="accroche" className="text-3xl font-black leading-tight sm:text-5xl">Comprendre en faisant, à ton rythme.</h1>
          <p className="mt-4 text-indigo-100 sm:text-lg">Des cours clairs, des exercices corrigés tout de suite, la plupart avec des valeurs renouvelées à chaque essai, et des jeux pour fixer les réflexes, en mathématiques et en physique-chimie.</p>
        </div>
        <nav aria-label="Choisir ta classe" className="mt-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-100">Choisis ta classe</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_LEVELS.map((id) => {
              const l = LEVELS.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <Link href={`/chapitres?niveau=${id}`} className={`flex h-full flex-col gap-1 rounded-2xl border-2 p-4 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${levelTone(id).solid}`}>
                    <span className="text-2xl font-black">{l.short}</span>
                    <span className="text-sm font-medium">{countsLabel(levelCounts(chapters, id, null))}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-indigo-100">
            Collège :{" "}
            {others.map((l, i) => <span key={l.id}>{i > 0 && " · "}<Link href={`/chapitres?niveau=${l.id}`} className="font-semibold text-white underline-offset-2 hover:underline">{l.short}</Link></span>)}
          </p>
        </nav>
        <p className="mt-6 text-sm font-medium text-white">Gratuit et sans publicité. Un compte sert seulement à garder ta progression.</p>
      </section>

      {/* Les trois formats, sur un chapitre réel */}
      {exampleChapter && example?.href && (
        <section aria-labelledby="formats">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="formats" className="text-2xl font-black">Chaque chapitre, en trois formats</h2>
              <p className="text-slate-600">Exemple : <Link href={example.href} className="font-semibold text-indigo-600 hover:underline">{example.title}</Link> ({example.level}).</p>
            </div>
            <Link href="/chapitres" className="text-sm font-semibold text-indigo-600 hover:underline">Tous les chapitres →</Link>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { n: 1, title: "Le cours", href: "#cours", text: `${plural(exampleChapter.lesson.properties.length, "propriété", "propriétés")}, ${plural(exampleChapter.lesson.workedExamples.length, "exemple corrigé", "exemples corrigés")} et ${plural(exampleChapter.lesson.methods.length, "méthode", "méthodes")} pas à pas.` },
              { n: 2, title: "Les exercices", href: "#exercices", text: `${plural(example.exercises, "exercice", "exercices")} sur ${plural(new Set(exampleChapter.exercises.map((e) => e.niveau)).size, "niveau", "niveaux")} de difficulté, dont ${exampleChapter.exercises.filter((e) => e.vary).length} aux valeurs renouvelées à chaque essai, corrigés tout de suite.` },
              { n: 3, title: "Les jeux", href: "#activites", text: `${plural(example.games, "jeu", "jeux")} pour t'entraîner autrement : ${exampleChapter.games.map((g) => g.title).join(", ")}.` },
            ].map((s) => (
              <li key={s.n}>
                <Link href={`${example.href}${s.href}`} className="card group flex h-full gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-lg font-black text-white">{s.n}</span>
                  <span>
                    <span className="block text-lg font-bold group-hover:text-indigo-700">{s.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{s.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Derniers chapitres (les brouillons restent visibles et non cliquables) */}
      <section aria-labelledby="derniers">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 id="derniers" className="text-2xl font-black">Derniers chapitres</h2>
          <Link href="/chapitres" className="text-sm font-semibold text-indigo-600 hover:underline">Voir tout →</Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((c) => <li key={c.id}><ChapterCard c={c} /></li>)}
        </ul>
      </section>

      {/* Défi du jour + Reprendre */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="defi" className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="defi" className="text-lg font-bold">Défi du jour</h2>
            <span className="text-xs text-slate-600">{new Date(todayKey()).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{plural(daily.length, "exercice", "exercices")}, les mêmes pour tout le monde aujourd'hui.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm marker:text-slate-500">
            {daily.map((d, i) => <li key={i}>{byId.get(d.id)?.title}</li>)}
          </ol>
          <Link href="/revisions/defi-du-jour" className="btn-primary mt-4 w-full">Relever le défi</Link>
        </section>

        <section aria-labelledby="reprendre" className="card p-5">
          <h2 id="reprendre" className="text-lg font-bold">Reprendre</h2>
          {dash && dash.chapters.length > 0 && (
            <div className="mt-3 space-y-3">
              {dash.chapters.slice(0, 3).map((c) => (
                <div key={c.chapterId} className="text-sm"><div className="mb-1 flex justify-between gap-2"><span>{c.title}</span><span className="text-slate-600">{c.done}/{c.total}</span></div><Bar value={c.done / c.total} /></div>
              ))}
              <Link href="/mon-espace" className="text-sm font-semibold text-indigo-600 hover:underline">Ma progression complète →</Link>
            </div>
          )}
          <div className="mt-3"><RecentList /></div>
          {!user && (
            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p>Crée un compte gratuit pour enregistrer tes résultats et suivre ta progression par chapitre.</p>
              <div className="flex flex-wrap gap-2"><Link href="/inscription" className="btn-primary">Créer un compte</Link><Link href="/connexion" className="btn-ghost">Connexion</Link></div>
            </div>
          )}
        </section>
      </div>

      {SHOW_DISCOVERY && <Discovery level={user?.level ?? null} byId={byId} recs={dash?.recs ?? []} />}
    </div>
  );
}

/** Ancienne partie « Recommandés » / « Populaires » de l'accueil, conservée telle quelle mais non affichée (SHOW_DISCOVERY). */
async function Discovery({ level, byId, recs }: { level: string | null; byId: Map<string, Awaited<ReturnType<typeof allMetas>>[number]>; recs: { exerciseId: string; difficulty: number; reason: string }[] }) {
  const metas = [...byId.values()];
  const popularRows = await db.select({ id: schema.attempts.exerciseId, n: sql<number>`count(*)::int` }).from(schema.attempts).groupBy(schema.attempts.exerciseId).orderBy(sql`count(*) desc`).limit(6);
  const fallback = ["m4-pythagore-longueur", "m6-comparer-fractions", "m4-equation-premier-degre", "p4-loi-ohm", "p2-equilibrer-equation", "m3-trigonometrie"];
  const popular = [...popularRows.map((r) => r.id), ...fallback].filter((id, i, a) => byId.has(id) && a.indexOf(id) === i).slice(0, 6).map((id) => byId.get(id)!);
  const recommended = recs.length ? recs.slice(0, 3) : null;
  const levelPicks = metas.filter((m) => !level || m.level === level).slice(0, 3);
  return (
    <>
      <section>
        <h2 className="mb-3 text-lg font-bold">Recommandés pour toi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended
            ? recommended.map((r) => byId.get(r.exerciseId) && <ExerciseCard key={r.exerciseId} m={byId.get(r.exerciseId)!} difficulty={r.difficulty} note={r.reason} />)
            : levelPicks.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Thèmes populaires</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>
    </>
  );
}
