import { Fraunces } from "next/font/google";
import { obfuscate } from "@/components/ui";
import { RevealContact } from "@/components/ClientBits";

/**
 * Contenu de la page : UN SEUL endroit à modifier. Un champ vide ("" ou liste vide) masque sa partie.
 * E-mail et téléphone ne sont jamais écrits en clair dans le HTML (codés ici, recomposés au clic).
 */
const PROF = {
  name: "Nguyễn Thanh Tuyền",
  roleFr: "Mathématiques · Physique-Chimie",
  roleEn: "Mathematics · Physics-Chemistry",
  bioFr: [
    "J'enseigne les mathématiques et la physique-chimie selon les programmes de l'Éducation nationale française, ceux que suivent notamment les écoles internationales francophones au Vietnam.",
    "Chaque élève avance à son rythme. J'adapte donc mes cours et mes exercices à ton niveau, pour que tu progresses sans te perdre et sans t'ennuyer.",
    "J'ai créé ce site et j'écris moi-même son contenu : des exercices interactifs, expliqués pas à pas.",
  ],
  bioEn: [
    "I teach mathematics and physics-chemistry following the French national curriculum (Éducation nationale), the programme used by French-language international schools in Vietnam.",
    "Every student learns at a different pace, so I tailor lessons and exercises to your level, so that you make progress without getting lost or bored.",
    "I built this site and write its content myself: interactive exercises, explained step by step.",
  ],
  email: "nttuyen.jojo@gmail.com",
  /** Affichage ; le lien tel: retire les espaces. */
  phone: "+84 347 447 367",
  /** Pas encore fournis : laissés vides, donc masqués. (Photo : à ajouter avec le fichier réel et son texte alternatif.) */
  hours: "",
  links: [] as { label: string; href: string }[],
};

// Titre en Fraunces (SIL Open Font License 1.1), comme l'accroche de l'accueil ; police auto-hébergée par next/font.
const display = Fraunces({ subsets: ["latin"], weight: ["700"], display: "swap" });

export const metadata = { title: "Contact" };

/** « prénom [arobase] domaine [point] com » : lisible par un humain sans JavaScript, sans adresse en clair. */
const emailFallback = (e: string) => e.replace("@", " [arobase] ").replace(/\.(?=[^.]+$)/, " [point] ").replace(/\.(?=[^.]*\s\[arobase\])/, " [point] ");

export default function ContactPage() {
  const P = PROF;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section aria-labelledby="titre" className="relative overflow-hidden rounded-3xl border-2 border-teal-600 bg-teal-50 px-5 py-8 shadow-sm sm:px-10">
        <ContactMotifs />
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">Le prof</p>
        <h1 id="titre" className={`${display.className} mt-1 text-4xl leading-tight text-slate-900 sm:text-5xl md:max-w-md`}>{P.name}</h1>
        {P.roleFr && <p className="mt-2 font-semibold text-slate-700">{P.roleFr}</p>}
        {P.roleEn && <p lang="en" className="text-sm text-slate-600">{P.roleEn}</p>}
      </section>

      {P.bioFr.length > 0 && (
        <section aria-labelledby="presentation" className="card p-6">
          <h2 id="presentation" className={`${display.className} mb-3 text-2xl text-slate-900`}>Présentation</h2>
          <div className="space-y-3 text-slate-700">{P.bioFr.map((t) => <p key={t}>{t}</p>)}</div>
        </section>
      )}

      {P.bioEn.length > 0 && (
        <section lang="en" aria-labelledby="about" className="card p-6">
          <h2 id="about" className={`${display.className} mb-3 text-2xl text-slate-900`}>About</h2>
          <div className="space-y-3 text-slate-700">{P.bioEn.map((t) => <p key={t}>{t}</p>)}</div>
        </section>
      )}

      {(P.email || P.phone || P.hours || P.links.length > 0) && (
        <section aria-labelledby="contacter" className="card border-2 border-teal-600 p-6">
          <h2 id="contacter" className={`${display.className} mb-1 text-2xl text-slate-900`}>Me contacter <span lang="en" className="text-lg text-slate-600">· Contact</span></h2>
          <p className="mb-4 text-sm text-slate-600">Pas de formulaire : écris-moi ou appelle-moi directement.</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            {P.email && (
              <div>
                <dt className="mb-1 text-sm font-semibold text-slate-700">E-mail</dt>
                <dd><RevealContact kind="email" parts={obfuscate(P.email)} label="Afficher l'adresse" fallback={emailFallback(P.email)} /></dd>
              </div>
            )}
            {P.phone && (
              <div>
                <dt className="mb-1 text-sm font-semibold text-slate-700">Téléphone</dt>
                <dd><RevealContact kind="phone" parts={obfuscate(P.phone)} label="Afficher le numéro" fallback="Active JavaScript pour afficher le numéro." /></dd>
              </div>
            )}
            {P.hours && (
              <div>
                <dt className="mb-1 text-sm font-semibold text-slate-700">Horaires</dt>
                <dd className="text-slate-700">{P.hours}</dd>
              </div>
            )}
          </dl>
          {P.links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3">{P.links.map((l) => <li key={l.href}><a href={l.href} className="font-semibold text-indigo-600 hover:underline">{l.label}</a></li>)}</ul>
          )}
        </section>
      )}

      <p className="text-center text-sm text-slate-600">
        Cette page s'adresse aux élèves et à leurs parents. <span lang="en">This page is for students and their parents.</span>
      </p>
    </div>
  );
}

/** Enveloppe et crayon dessinés à la main ; décor seulement, masqué sous md pour ne jamais passer sous le texte. */
function ContactMotifs() {
  return (
    <svg aria-hidden viewBox="0 0 170 100" className="pointer-events-none absolute right-6 top-6 hidden w-40 text-teal-700 opacity-40 md:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="22" width="92" height="62" rx="6" />
      <path d="M8 26l44 32 44-32M8 82l32-28M96 82L64 54" />
      <path d="M114 88l6-22 30-30 16 16-30 30zM120 66l16 16M144 42l16 16" />
    </svg>
  );
}
