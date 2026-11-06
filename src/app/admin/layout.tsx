import Link from "next/link";
import { getUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!isStaff(user))
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-black">Espace enseignant</h1>
        <p className="mt-2 text-slate-600">Cet espace est réservé aux enseignants et administrateurs.</p>
        <Link href="/connexion" className="btn-primary mt-4">Se connecter</Link>
      </div>
    );
  const nav = [["/admin", "Tableau de bord"], ["/admin/exercices/nouveau", "Nouvel exercice"], ["/admin/chapitres", "Chapitres"], ["/admin/collections", "Collections"]];
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-black/30 p-2 text-sm">
        <span className="px-3 font-bold text-white">🧑‍🏫 Espace enseignant</span>
        {nav.map(([h, l]) => <Link key={h} href={h} className="rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">{l}</Link>)}
        <span className="ml-auto px-3 text-slate-400">{user!.name} · {user!.role}</span>
      </div>
      {children}
    </div>
  );
}
