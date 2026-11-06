"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/mathematiques", label: "Mathématiques" },
  { href: "/physique-chimie", label: "Physique-Chimie" },
  { href: "/exercices", label: "Exercices interactifs" },
  { href: "/cours", label: "Cours et fiches" },
  { href: "/revisions", label: "Révisions" },
  { href: "/examens", label: "Examens" },
  { href: "/mon-espace", label: "Mon espace" },
];

export default function Header({ user }: { user: { name: string; role: string } | null }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-lg text-white">π</span>
          <span className="hidden sm:inline xl:hidden 2xl:inline">Sciences<span className="text-indigo-600">Interactives</span></span>
        </Link>
        <nav className="ml-2 hidden items-center gap-0.5 xl:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition ${active(n.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form action="/exercices" className="hidden md:block xl:hidden 2xl:block" role="search">
            <input name="q" placeholder="Rechercher…" aria-label="Rechercher un exercice ou une notion" className="w-40 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:w-56 focus:border-indigo-500 focus:bg-white" />
          </form>
          {user ? (
            <>
              {(user.role === "enseignant" || user.role === "admin") && <Link href="/admin" className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white sm:inline-block">Espace enseignant</Link>}
              <button onClick={logout} className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 sm:inline-block">Déconnexion</button>
            </>
          ) : (
            <Link href="/connexion" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">Connexion</Link>
          )}
          <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 xl:hidden" aria-label="Navigation mobile">
          <form action="/exercices" className="mb-3" role="search"><input name="q" placeholder="Rechercher un exercice, une notion…" className="input" /></form>
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2 text-sm font-medium ${active(n.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"}`}>{n.label}</Link>
            ))}
            {user && (user.role !== "eleve") && <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">Espace enseignant</Link>}
            {user && <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100">Déconnexion</button>}
          </div>
        </nav>
      )}
    </header>
  );
}
