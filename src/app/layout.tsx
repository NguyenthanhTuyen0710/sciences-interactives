import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "./globals.css";
import Header from "@/components/Header";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Sciences Interactives – Mathématiques et Physique-Chimie", template: "%s · Sciences Interactives" },
  description: "Plateforme d'apprentissage interactive : exercices corrigés et générés aléatoirement en mathématiques et physique-chimie, de la 6e à la Terminale.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a1020" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans">
        <Header user={user ? { name: user.name, role: user.role } : null} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-surface">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="font-bold text-slate-900">Sciences Interactives</p>
              <p className="mt-1">Exercices originaux, générés aléatoirement et corrigés automatiquement, organisés selon les thèmes des programmes officiels de l'Éducation nationale.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Explorer</p>
              <ul className="mt-1 space-y-1">
                <li><Link href="/mathematiques" className="hover:text-indigo-400">Mathématiques</Link></li>
                <li><Link href="/physique-chimie" className="hover:text-indigo-400">Physique-Chimie</Link></li>
                <li><Link href="/lecons/pythagore" className="hover:text-indigo-400">Leçon animée interactive</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Sources et licences</p>
              <p className="mt-1">Contenus rédigés pour la plateforme. Références : programmes officiels publiés au Bulletin officiel (education.gouv.fr, eduscol). Rendu mathématique : KaTeX (MIT). Calcul symbolique : math.js (Apache 2.0).</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
