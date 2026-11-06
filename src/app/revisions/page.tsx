import Link from "next/link";
import { getUser } from "@/lib/auth";
import { userDashboard } from "@/lib/progress";
import { LEVELS } from "@/lib/content/curriculum";
import { Breadcrumbs, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Révisions" };

export default async function RevisionsPage() {
  const user = await getUser();
  const dash = user ? await userDashboard(user.id, user.level) : null;
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Révisions" }]} />
      <h1 className="mb-6 text-3xl font-black">Réviser efficacement</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-xl font-bold">⏱ Défi chronométré</h2>
          <p className="mb-4 text-sm text-slate-600">5 exercices tirés au hasard dans votre niveau, 10 minutes chrono, note sur 20.</p>
          <form action="/revisions/defi" className="grid gap-3 sm:grid-cols-3">
            <select name="matiere" className="input" aria-label="Matière" defaultValue="tout">
              <option value="tout">Maths + PC</option><option value="maths">Mathématiques</option><option value="pc">Physique-Chimie</option>
            </select>
            <select name="niveau" className="input" aria-label="Niveau" defaultValue={user?.level ?? "4e"}>
              {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.short}</option>)}
            </select>
            <select name="d" className="input" aria-label="Difficulté" defaultValue="2">
              <option value="1">Facile</option><option value="2">Moyen</option><option value="3">Difficile</option>
            </select>
            <button className="btn-primary sm:col-span-3">Lancer le défi</button>
          </form>
        </section>
        <section className="card p-5">
          <h2 className="text-xl font-bold">🎯 Défi du jour</h2>
          <p className="mb-4 text-sm text-slate-600">Les mêmes 5 exercices pour tout le monde aujourd'hui : comparez vos résultats avec votre classe !</p>
          <Link href="/revisions/defi-du-jour" className="btn-primary">Relever le défi du jour</Link>
        </section>
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-xl font-bold">🩺 Mes points faibles</h2>
          {!user ? (
            <p className="mt-2 text-sm text-slate-600"><Link href="/connexion" className="font-semibold text-indigo-400">Connectez-vous</Link> pour obtenir un programme de révision basé sur vos résultats.</p>
          ) : dash && dash.weak.length ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {dash.weak.map((w) => {
                const rec = dash.recs.find((r) => r.notionId === w.notionId);
                return (
                  <li key={w.notionId} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="font-semibold">{w.title}</p>
                    <p className="text-sm text-slate-600">{w.chapter} · réussite récente {Math.round(w.recentAvg * 100)} %</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={`/cours/${w.notionId}`} className="btn-ghost !py-1.5">1. Relire la fiche</Link>
                      {rec && <Link href={`/exercice/${rec.exerciseId}?d=${rec.difficulty}`} className="btn-primary !py-1.5">2. S'entraîner (niveau {rec.difficulty})</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <div className="mt-3"><Empty>Aucun point faible détecté pour l'instant. Continuez à vous entraîner !</Empty></div>}
        </section>
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-xl font-bold">📚 Fiches de révision par niveau</h2>
          <div className="mt-3 flex flex-wrap gap-2">{LEVELS.map((l) => <Link key={l.id} href={`/cours?niveau=${l.id}`} className="btn-ghost">{l.label}</Link>)}</div>
        </section>
      </div>
    </div>
  );
}
