import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";
import Header from "@/components/Header";
import { getUser } from "@/lib/auth";
import { CURRICULUM, SUBJECTS } from "@/lib/content/curriculum";
import { levelTone } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Sciences Interactives – Mathématiques et Physique-Chimie", template: "%s · Sciences Interactives" },
  description: "Plateforme d'apprentissage interactive : exercices corrigés et générés aléatoirement en mathématiques et physique-chimie, de la 6e à la Terminale.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#4f46e5" }, { media: "(prefers-color-scheme: dark)", color: "#0b1120" }],
};

// Thème posé avant le premier rendu (pas de flash) : choix mémorisé, sinon préférence du système.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

const CONTENTS = [
  { href: "/chapitres", label: "Tous les chapitres" },
  { href: "/exercices", label: "Exercices interactifs" },
  { href: "/cours", label: "Cours et fiches" },
  { href: "/revisions", label: "Révisions" },
  { href: "/examens", label: "Examens" },
  { href: "/lecons/pythagore", label: "Leçon animée interactive" },
];
const footLink = "hover:text-indigo-600 hover:underline";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen font-sans">
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <Header user={user ? { name: user.name, role: user.role } : null} />
        <main id="contenu" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none sm:py-8">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr_1.3fr]">
            <div>
              <p className="font-bold text-slate-900">Sciences Interactives</p>
              <p className="mt-2">Exercices originaux, générés aléatoirement et corrigés automatiquement, organisés selon les thèmes des programmes officiels de l'Éducation nationale.</p>
            </div>
            {(["maths", "pc"] as const).map((s) => (
              <nav key={s} aria-label={`${SUBJECTS[s].label} par classe`}>
                <p className="font-semibold text-slate-900">{SUBJECTS[s].label}</p>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {CURRICULUM[s].map((l) => <li key={l.id}><Link href={`/${SUBJECTS[s].slug}/${l.id}`} className={`inline-flex items-center gap-1.5 ${footLink}`}><span aria-hidden className={`h-2 w-2 rounded-full ${levelTone(l.id).dot}`} />{l.label}</Link></li>)}
                </ul>
              </nav>
            ))}
            <nav aria-label="Contenus">
              <p className="font-semibold text-slate-900">Contenus</p>
              <ul className="mt-2 space-y-1">{CONTENTS.map((c) => <li key={c.href}><Link href={c.href} className={footLink}>{c.label}</Link></li>)}</ul>
            </nav>
            <div>
              <p className="font-semibold text-slate-900">Sources et licences</p>
              <p className="mt-2">Contenus rédigés pour la plateforme. Références : programmes officiels publiés au Bulletin officiel (education.gouv.fr, eduscol). Rendu mathématique : KaTeX (MIT). Calcul symbolique : math.js (Apache 2.0).</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
