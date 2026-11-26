import Link from "next/link";
import { redirect } from "next/navigation";
import { Fraunces } from "next/font/google";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import { allMetas } from "@/lib/content/registry";
import { SUBJECTS } from "@/lib/content/curriculum";
import { getUser } from "@/lib/auth";
import { userAttempts } from "@/lib/progress";
import type { Subject } from "@/lib/engine/types";
import { ChapterCard, Empty, ProgressNote, chapterProgress, chapterSummary, countsLabel, levelCounts, plural } from "@/components/ui";

// Titre en Fraunces (SIL Open Font License 1.1), comme l'accroche de l'accueil ; police auto-hébergée par next/font.
const display = Fraunces({ subsets: ["latin"], weight: ["700"], display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Bac" };

const SUBJECT_IDS: Subject[] = ["maths", "pc"];

export default async function BacPage({ searchParams }: { searchParams: Promise<{ hasard?: string }> }) {
  const sp = await searchParams;
  // Exercices interactifs réels de Terminale (catalogue public, hors exercices personnels d'enseignants).
  const pool = (await allMetas()).filter((m) => m.level === "Tle" && !m.id.startsWith("perso-"));

  // « Un exercice au hasard » : tirage côté serveur, rien n'est enregistré.
  if (sp.hasard !== undefined && pool.length) redirect(`/exercice/${pool[Math.floor(Math.random() * pool.length)].id}`);

  const tle = ALL_CHAPTERS.filter((c) => c.grade === "Tle");
  const summaries = tle.map((c) => chapterSummary(c, isVisible(c)));
  const user = await getUser();
  const attempts = user && tle.length ? await userAttempts(user.id) : [];

  return (
    <div className="space-y-12">
      <section aria-labelledby="titre" className="relative overflow-hidden rounded-3xl border-2 border-violet-600 bg-violet-50 px-5 py-8 shadow-sm sm:px-10">
        <BacMotifs />
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-800">Terminale</p>
        <h1 id="titre" className={`${display.className} mt-1 max-w-xl text-4xl leading-tight text-slate-900 sm:text-5xl`}>Prépare le Bac à ton rythme</h1>
        <p className="mt-3 max-w-xl text-slate-700">Les chapitres complets de Terminale arrivent progressivement. En attendant, retrouve les fiches du programme et les premiers exercices interactifs.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/revisions/plan?matiere=maths&niveau=Tle" className="btn-primary">Plan de révision</Link>
          <Link href="/cours?niveau=Tle" className="btn-ghost">Fiches de Terminale</Link>
        </div>
      </section>

      <section aria-labelledby="chapitres">
        <h2 id="chapitres" className={`${display.className} mb-4 text-3xl text-slate-900`}>Les chapitres de Terminale</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBJECT_IDS.map((s) => {
            const list = tle.filter((c) => c.subject === SUBJECTS[s].slug);
            return (
              <div key={s}>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{SUBJECTS[s].label}</h3>
                {list.length ? (
                  <ol className="space-y-3">
                    {list.map((c) => {
                      const sum = summaries.find((x) => x.id === c.id)!;
                      const p = chapterProgress(c, attempts);
                      return <li key={c.id}><ChapterCard c={sum} />{user && sum.href && p.tried > 0 && <ProgressNote p={p} />}</li>;
                    })}
                  </ol>
                ) : (
                  <Empty>
                    <p>{countsLabel(levelCounts(summaries, "Tle", s))}.</p>
                    <Link href={`/${SUBJECTS[s].slug}/Tle`} className="mt-2 inline-block font-semibold text-indigo-600 hover:underline">Voir les thèmes de {SUBJECTS[s].label}</Link>
                  </Empty>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="defi" className="card flex flex-wrap items-center justify-between gap-4 border-2 border-violet-600 p-5">
        <div>
          <h2 id="defi" className={`${display.className} text-2xl text-slate-900`}>Défi</h2>
          <p className="text-sm text-slate-600">
            {pool.length
              ? `Le catalogue compte pour l'instant ${plural(pool.length, "exercice interactif", "exercices interactifs")} de Terminale : laisse le hasard en choisir un.`
              : "Pas encore d'exercice interactif de Terminale."}
          </p>
        </div>
        {pool.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <form action="/bac" method="get"><input type="hidden" name="hasard" value="1" /><button type="submit" className="btn-primary">Un exercice au hasard</button></form>
            <Link href="/exercices?niveau=Tle" className="btn-ghost">Voir la liste</Link>
          </div>
        )}
      </section>
    </div>
  );
}

/** Erlenmeyer et sablier, dessinés à la main ; décor seulement, masqué sous md pour ne jamais passer sous le texte. */
function BacMotifs() {
  return (
    <svg aria-hidden viewBox="0 0 170 110" className="pointer-events-none absolute right-6 top-6 hidden w-44 text-violet-700 opacity-40 md:block lg:w-56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 8h24M32 8v30L10 96a4 4 0 0 0 4 6h48a4 4 0 0 0 4-6L44 38V8" />
      <path d="M20 74h36" />
      <circle cx="30" cy="86" r="2.5" /><circle cx="44" cy="82" r="2" />
      <path d="M104 8h48M104 102h48M110 8c0 26 32 30 32 47s-32 21-32 47M146 8c0 26-32 30-32 47s32 21 32 47" />
      <path d="M118 96l10-12 10 12z" />
    </svg>
  );
}
