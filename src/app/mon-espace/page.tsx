import Link from "next/link";
import { getUser } from "@/lib/auth";
import { userDashboard } from "@/lib/progress";
import { Bar, Breadcrumbs, Empty, Stat, SubjectBadge } from "@/components/ui";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon espace" };

const fmtTime = (s: number) => (s < 3600 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`);

export default async function MySpace() {
  const user = await getUser();
  if (!user)
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <h1 className="text-3xl font-black">Mon espace</h1>
        <p className="mt-2 text-slate-600">Connectez-vous pour retrouver votre progression, vos statistiques et vos recommandations personnalisées.</p>
        <div className="mt-6 flex justify-center gap-2"><Link href="/connexion" className="btn-primary">Connexion</Link><Link href="/inscription" className="btn-ghost">Créer un compte</Link></div>
      </div>
    );
  const d = await userDashboard(user.id, user.level);
  const maxDay = Math.max(1, ...d.days.map((x) => x.count));
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Accueil" }, { label: "Mon espace" }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-black">Bonjour {user.name}</h1>
          <p className="text-slate-600">{user.level ? `Classe : ${user.level}` : "Renseignez votre classe pour des recommandations adaptées."} · {user.role === "eleve" ? "Élève" : user.role === "enseignant" ? "Enseignant" : "Administrateur"}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Exercices réalisés" value={String(d.total)} sub={`${d.distinct} exercices différents`} />
        <Stat label="Taux de réussite" value={`${Math.round(d.successRate * 100)} %`} sub="exercices 100 % justes" />
        <Stat label="Score moyen" value={`${Math.round(d.avg * 100)} %`} />
        <Stat label="Note moyenne" value={`${(d.avg * 20).toFixed(1).replace(".", ",")} / 20`} />
        <Stat label="Temps de travail" value={fmtTime(d.time)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Activité des 14 derniers jours</h2>
          <div className="flex h-32 items-end gap-1" role="img" aria-label="Nombre d'exercices par jour">
            {d.days.map((x) => (
              <div key={x.day} className="flex h-full flex-1 flex-col items-center gap-1" title={`${x.day} : ${x.count} exercice(s), score moyen ${Math.round(x.avg * 100)} %`}>
                <div className="flex w-full flex-1 items-end"><div className={`w-full rounded-t ${x.count ? (x.avg >= 0.75 ? "bg-emerald-500" : x.avg >= 0.5 ? "bg-amber-400" : "bg-rose-400") : "bg-slate-100"}`} style={{ height: `${Math.max(3, Math.round((x.count / maxDay) * 100))}px` }} /></div>
                <span className="text-[10px] text-slate-400">{x.day.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Couleur : score moyen du jour (vert ≥ 75 %, orange ≥ 50 %, rouge &lt; 50 %).</p>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Mon profil</h2>
          <ProfileForm level={user.level} subjects={user.subjects} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">✨ Recommandations</h2>
          {d.recs.length ? (
            <ul className="space-y-2">
              {d.recs.map((r) => (
                <li key={r.exerciseId + r.kind} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                  <span className={`chip mt-0.5 shrink-0 ${r.kind === "remediation" ? "bg-rose-100 text-rose-700" : r.kind === "progression" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{r.kind === "remediation" ? "À revoir" : r.kind === "progression" ? "Niveau +" : "Nouveau"}</span>
                  <div className="flex-1 text-sm"><p className="font-semibold">{r.title}</p><p className="text-slate-600">{r.reason}</p></div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {r.ficheNotionId && <Link href={`/cours/${r.ficheNotionId}`} className="text-xs font-semibold text-indigo-400 hover:underline">Fiche</Link>}
                    <Link href={`/exercice/${r.exerciseId}?d=${r.difficulty}`} className="text-xs font-semibold text-indigo-400 hover:underline">S'entraîner →</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty>Faites quelques exercices pour recevoir des recommandations.</Empty>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Progression par chapitre</h2>
          {d.chapters.length ? (
            <ul className="space-y-3">
              {d.chapters.map((c) => (
                <li key={c.chapterId} className="text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2"><span><SubjectBadge subject={c.subject} /> <span className="font-medium">{c.level} · {c.title}</span></span><span className="text-xs text-slate-500">{c.done}/{c.total} ex. · {Math.round(c.avg * 100)} %</span></div>
                  <Bar value={c.done / c.total} color={c.avg >= 0.75 ? "bg-emerald-500" : c.avg >= 0.5 ? "bg-amber-400" : "bg-rose-400"} />
                </li>
              ))}
            </ul>
          ) : <Empty>Aucun chapitre commencé.</Empty>}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">🩺 Points faibles</h2>
          {d.weak.length ? (
            <ul className="space-y-2">{d.weak.map((w) => (
              <li key={w.notionId} className="flex items-center justify-between rounded-xl bg-rose-50 p-3 text-sm"><span><span className="font-semibold">{w.title}</span> <span className="text-slate-500">({w.chapter})</span></span><span className="font-bold text-rose-700">{Math.round(w.recentAvg * 100)} %</span></li>
            ))}</ul>
          ) : <Empty>Aucun point faible détecté.</Empty>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Historique</h2>
          {d.history.length ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500"><tr><th className="py-1">Date</th><th>Exercice</th><th>Niv.</th><th className="text-right">Score</th></tr></thead>
                <tbody>
                  {d.history.map((h, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-500">{h.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} {h.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })}</td>
                      <td><Link href={`/exercice/${h.exerciseId}`} className="hover:text-indigo-400">{h.title}</Link>{h.mode !== "libre" && <span className="ml-1 text-xs text-slate-400">({h.mode})</span>}</td>
                      <td className="text-slate-500">{h.difficulty}</td>
                      <td className={`text-right font-semibold ${h.score === 1 ? "text-emerald-400" : h.score >= 0.5 ? "text-amber-400" : "text-rose-400"}`}>{Math.round(h.score * 100)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty>Pas encore d'historique.</Empty>}
        </section>
      </div>
    </div>
  );
}
