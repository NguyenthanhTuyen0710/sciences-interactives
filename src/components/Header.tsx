"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Cinq rubriques de contenu ; « Mon espace » et la connexion sont dans le groupe de droite.
const NAV = [
  { href: "/chapitres", label: "Chapitres", match: ["/chapitres", "/mathematiques", "/physique-chimie"] },
  { href: "/exercices", label: "Exercices", match: ["/exercices", "/exercice/"] },
  { href: "/cours", label: "Cours et fiches", match: ["/cours", "/lecons"] },
  { href: "/revisions", label: "Révisions", match: ["/revisions"] },
  { href: "/examens", label: "Examens", match: ["/examens"] },
];

type Theme = "light" | "dark";
const THEME_KEY = "theme";

/** Bouton clair / sombre : le choix est mémorisé ; sans choix, le thème suit le système (script de layout.tsx). */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch {}
      if (saved) return;
      root.classList.toggle("dark", e.matches);
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    setTheme(next);
  };
  const label = theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre";
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100">
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {theme === "dark"
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
          : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
      </svg>
    </button>
  );
}

export default function Header({ user }: { user: { name: string; role: string } | null }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const active = (match: string[]) => match.some((m) => path.startsWith(m));
  const teacher = !!user && (user.role === "enseignant" || user.role === "admin");
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  // À partir de lg : marge réduite (la largeur utile plafonne à 1280 px, max-w-7xl) pour que la navigation tienne dans les trois états de connexion.
  const navClass = (on: boolean) => `whitespace-nowrap rounded-lg px-3 py-2 lg:px-2 text-sm font-medium transition ${on ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`;
  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-900" aria-label="Sciences Interactives, accueil">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-lg text-white">π</span>
          <span className="hidden sm:inline lg:hidden">Sciences<span className="text-indigo-600">Interactives</span></span>
        </Link>
        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={active(n.match) ? "page" : undefined} className={navClass(active(n.match))}>{n.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <form action="/exercices" className="hidden xl:block" role="search">
            <input name="q" type="search" placeholder="Rechercher…" aria-label="Rechercher un exercice ou une notion" className="w-44 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200" />
          </form>
          <ThemeToggle />
          <Link href="/mon-espace" aria-current={path.startsWith("/mon-espace") ? "page" : undefined} className={`hidden sm:inline-flex ${navClass(path.startsWith("/mon-espace"))}`}>Mon espace</Link>
          {teacher && <Link href="/admin" className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white lg:inline-block">Espace enseignant</Link>}
          {user
            ? <button type="button" onClick={logout} className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 lg:inline-block">Déconnexion</button>
            : <Link href="/connexion" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">Connexion</Link>}
          <button ref={menuButton} type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen(!open)}>
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
          </button>
        </div>
      </div>
      <div id="menu-mobile" hidden={!open} className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
        <form action="/exercices" className="mb-3" role="search"><input name="q" type="search" placeholder="Rechercher un exercice, une notion…" aria-label="Rechercher un exercice ou une notion" className="input" /></form>
        <nav aria-label="Navigation mobile" className="grid grid-cols-2 gap-1">
          {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={active(n.match) ? "page" : undefined} className={navClass(active(n.match))}>{n.label}</Link>)}
          <Link href="/mon-espace" className={navClass(path.startsWith("/mon-espace"))}>Mon espace</Link>
          {teacher && <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">Espace enseignant</Link>}
          {user && <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">Déconnexion</button>}
        </nav>
      </div>
    </header>
  );
}
