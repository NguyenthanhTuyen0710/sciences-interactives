import Link from "next/link";
import { sql } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { allMetas } from "@/lib/content/registry";
import { LEVELS, SUBJECTS } from "@/lib/content/curriculum";
import { db, schema } from "@/lib/db";
import { userDashboard } from "@/lib/progress";
import { dailyItems, todayKey } from "@/lib/series";
import { Bar, ExerciseCard, Stat } from "@/components/ui";
import RecentList from "@/components/RecentList";
import { MathInline } from "@/components/MathText";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, metas] = await Promise.all([getUser(), allMetas()]);
  const byId = new Map(metas.map((m) => [m.id, m]));
  const popularRows = await db.select({ id: schema.attempts.exerciseId, n: sql<number>`count(*)::int` }).from(schema.attempts).groupBy(schema.attempts.exerciseId).orderBy(sql`count(*) desc`).limit(6);
  const fallback = ["m4-pythagore-longueur", "m6-comparer-fractions", "m4-equation-premier-degre", "p4-loi-ohm", "p2-equilibrer-equation", "m3-trigonometrie"];
  const popular = [...popularRows.map((r) => r.id), ...fallback].filter((id, i, a) => byId.has(id) && a.indexOf(id) === i).slice(0, 6).map((id) => byId.get(id)!);
  const daily = dailyItems(metas);
  const dash = user ? await userDashboard(user.id, user.level) : null;
  const recommended = dash?.recs.length ? dash.recs.slice(0, 3) : null;
  const levelPicks = metas.filter((m) => !user?.level || m.level === user.level).slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Bienvenue */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-emerald-600 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">{user ? `Bonjour ${user.name} 👋` : "Collège · Lycée · De la 6e à la Terminale"}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">Apprendre les maths et la physique-chimie en <span className="text-emerald-200">pratiquant</span>.</h1>
          <p className="mt-4 text-indigo-50 sm:text-lg">Des exercices interactifs générés à l'infini, corrigés instantanément, avec des solutions détaillées étape par étape.</p>
          <form action="/exercices" className="mt-6 flex max-w-lg gap-2" role="search">
            <input name="q" placeholder="Fractions, Pythagore, loi d'Ohm, pH…" aria-label="Rechercher" className="min-w-0 flex-1 rounded-xl border-0 px-4 py-3 text-slate-900 outline-none ring-2 ring-white/30 focus:ring-white" />
            <button className="rounded-xl bg-slate-900 px-5 font-semibold hover:bg-black">Rechercher</button>
          </form>
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-6 top-6 hidden select-none text-right font-serif text-white/15 lg:block">
          <div className="animate-float text-7xl"><MathInline text="$a^2 + b^2 = c^2$" /></div>
          <div className="mt-6 text-5xl"><MathInline text="$\ce{CH4 + 2O2 -> CO2 + 2H2O}$" /></div>
          <div className="mt-6 text-6xl"><MathInline text="$\int_0^1 x^2\,\mathrm{d}x$" /></div>
        </div>
      </section>

      {/* Matières */}
      <section className="grid gap-4 md:grid-cols-2">
        {(["maths", "pc"] as const).map((s) => {
          const S = SUBJECTS[s];
          const n = metas.filter((m) => m.subject === s).length;
          return (
            <Link key={s} href={`/${S.slug}`} className={`group card flex items-center gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${s === "maths" ? "hover:border-indigo-300" : "hover:border-emerald-300"}`}>
              <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl font-black text-white ${s === "maths" ? "bg-indigo-600" : "bg-emerald-600"}`}>{S.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{S.label}</h2>
                <p className="text-sm text-slate-600">{S.description}</p>
                <p className={`mt-1 text-sm font-semibold ${s === "maths" ? "text-indigo-600" : "text-emerald-600"}`}>{n} exercices interactifs →</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Niveaux */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Choisir sa classe</h2>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <Link key={l.id} href={`/exercices?niveau=${l.id}`} className={`rounded-xl border-2 px-4 py-2 font-semibold transition hover:border-indigo-500 hover:text-indigo-700 ${user?.level === l.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700"}`}>
              {l.short} <span className="text-xs font-normal text-slate-400">{l.cycle}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Défi du jour */}
        <section className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🎯 Défi du jour</h2>
            <span className="text-xs text-slate-500">{new Date(todayKey()).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">5 exercices, 10 minutes, mêmes questions pour tous aujourd'hui.</p>
          <ul className="mt-3 space-y-1 text-sm">
            {daily.map((d, i) => <li key={i} className="flex gap-2"><span className="text-slate-400">{i + 1}.</span>{byId.get(d.id)?.title}</li>)}
          </ul>
          <Link href="/revisions/defi-du-jour" className="btn-primary mt-4 w-full">Relever le défi</Link>
        </section>

        {/* Progression */}
        <section className="card p-5">
          <h2 className="text-lg font-bold">📈 Ma progression</h2>
          {dash ? (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Exercices faits" value={String(dash.total)} />
                <Stat label="Score moyen" value={`${Math.round(dash.avg * 100)} %`} />
              </div>
              {dash.chapters.slice(0, 3).map((c) => (
                <div key={c.chapterId} className="text-sm"><div className="mb-1 flex justify-between"><span>{c.title}</span><span className="text-slate-500">{c.done}/{c.total}</span></div><Bar value={c.done / c.total} /></div>
              ))}
              <Link href="/mon-espace" className="text-sm font-semibold text-indigo-600 hover:underline">Tableau de bord complet →</Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>Crée un compte gratuit pour enregistrer tes résultats, suivre ta progression par chapitre et recevoir des recommandations adaptées.</p>
              <div className="flex gap-2"><Link href="/inscription" className="btn-primary">Créer un compte</Link><Link href="/connexion" className="btn-ghost">Connexion</Link></div>
            </div>
          )}
        </section>

        {/* Récents */}
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">🕘 Récemment consultés</h2>
          <RecentList />
        </section>
      </div>

      {/* Recommandés */}
      <section>
        <h2 className="mb-3 text-lg font-bold">✨ Recommandés pour toi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended
            ? recommended.map((r) => byId.get(r.exerciseId) && <ExerciseCard key={r.exerciseId} m={byId.get(r.exerciseId)!} difficulty={r.difficulty} note={r.reason} />)
            : levelPicks.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>

      {/* Populaires */}
      <section>
        <h2 className="mb-3 text-lg font-bold">🔥 Thèmes populaires</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((m) => <ExerciseCard key={m.id} m={m} />)}
        </div>
      </section>

      <section className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <span className="text-4xl">🎬</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Nouveau : leçons animées interactives</h2>
          <p className="text-sm text-slate-600">Une animation qui s'arrête pour te poser des questions, comme une vidéo interactive.</p>
        </div>
        <Link href="/lecons/pythagore" className="btn-primary">Découvrir</Link>
      </section>
    </div>
  );
}
