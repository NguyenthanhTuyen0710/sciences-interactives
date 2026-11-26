import Link from "next/link";
import { redirect } from "next/navigation";
import { Fraunces } from "next/font/google";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import { CURRICULUM } from "@/lib/content/curriculum";
import { getUser } from "@/lib/auth";
import { userAttempts } from "@/lib/progress";
import { isTypeBrevet } from "@/lib/revision-plan";
import { ChapterCard, Empty, ProgressNote, chapterProgress, chapterSummary, countsLabel, exerciseLinks, levelCounts, plural } from "@/components/ui";

// Titre en Fraunces (SIL Open Font License 1.1), comme l'accroche de l'accueil ; police auto-hébergée par next/font.
const display = Fraunces({ subsets: ["latin"], weight: ["700"], display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Brevet" };

export default async function BrevetPage({ searchParams }: { searchParams: Promise<{ hasard?: string }> }) {
  const sp = await searchParams;
  const all3e = ALL_CHAPTERS.filter((c) => c.grade === "3e");
  // Étapes dans l'ordre des thèmes du programme (arborescence du site), pas dans l'ordre d'inscription des chapitres.
  const order = (CURRICULUM.maths.find((l) => l.id === "3e")?.chapters ?? []).map((t) => t.id);
  const rank = (id: string) => (order.indexOf(id) + 1 || order.length + 1);
  const maths = all3e.filter((c) => c.subject === "mathematiques").sort((x, y) => rank(x.treeChapterId) - rank(y.treeChapterId));
  const open = maths.filter(isVisible);
  const pool = open.flatMap((c) => exerciseLinks(c, isTypeBrevet).map((e) => ({ ...e, chapter: c.title })));
  const inReview = maths.filter((c) => !isVisible(c)).reduce((n, c) => n + exerciseLinks(c, isTypeBrevet).length, 0);

  // « Un exercice au hasard » : tirage côté serveur dans les exercices « Type Brevet » publiés, rien n'est enregistré.
  if (sp.hasard !== undefined && pool.length) redirect(`/exercice/${pool[Math.floor(Math.random() * pool.length)].id}`);

  const user = await getUser();
  const attempts = user ? await userAttempts(user.id) : [];
  const summaries = maths.map((c) => ({ c, s: chapterSummary(c, isVisible(c)), p: chapterProgress(c, attempts, isTypeBrevet) }));
  const pcCounts = levelCounts(all3e.map((c) => chapterSummary(c, isVisible(c))), "3e", "pc");

  return (
    <div className="space-y-12">
      <section aria-labelledby="titre" className="relative overflow-hidden rounded-3xl border-2 border-orange-600 bg-orange-50 px-5 py-8 shadow-sm sm:px-10">
        <BrevetMotifs />
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-800">Troisième</p>
        <h1 id="titre" className={`${display.className} mt-1 max-w-xl text-4xl leading-tight text-slate-900 sm:text-5xl`}>Prépare le Brevet, une étape après l'autre</h1>
        <p className="mt-3 max-w-xl text-slate-700">Avance chapitre par chapitre, entraîne-toi sur des problèmes complets dans l'esprit du Brevet, puis organise tes révisions jour par jour.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/revisions/plan?matiere=maths&niveau=3e" className="btn-primary">Construire mon plan de révision</Link>
          <Link href="/examens/brevet-maths" className="btn-ghost">Brevet blanc de mathématiques</Link>
        </div>
      </section>

      <section aria-labelledby="chapitres">
        <h2 id="chapitres" className={`${display.className} mb-1 text-3xl text-slate-900`}>Les chapitres de 3e, étape par étape</h2>
        <p className="mb-4 text-sm text-slate-600">Mathématiques : {countsLabel(levelCounts(summaries.map((x) => x.s), "3e", "maths"))}.{!user && " Connecte-toi pour suivre ta progression dans chaque chapitre."}</p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ s, p }, i) => (
            <li key={s.id} className="flex flex-col">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-orange-800">Étape {i + 1}</p>
              <ChapterCard c={s} />
              {user && s.href && p.tried > 0 && <ProgressNote p={p} />}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-slate-600">Physique-Chimie : {countsLabel(pcCounts)}.</p>
      </section>

      <section aria-labelledby="type-brevet">
        <h2 id="type-brevet" className={`${display.className} mb-1 text-3xl text-slate-900`}>Exercices type Brevet</h2>
        <p className="mb-4 max-w-3xl text-sm text-slate-600">Des problèmes complets, rédigés pour la plateforme dans l'esprit du Brevet : ce ne sont pas des sujets officiels. {plural(pool.length, "exercice disponible", "exercices disponibles")}{inReview > 0 && `, ${plural(inReview, "autre en relecture", "autres en relecture")}`}.</p>
        {pool.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {pool.map((e) => (
              <li key={e.id}>
                <Link href={`/exercice/${e.id}`} className="card flex h-full flex-col gap-1 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="font-semibold text-slate-900">{e.title.replace(/^Type Brevet — /, "")}</span>
                  <span className="text-xs text-slate-600">{e.chapter} · niveau {e.niveau}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <Empty><p>Pas encore d'exercice type Brevet publié.</p></Empty>}
      </section>

      {pool.length > 0 && (
        <section aria-labelledby="defi" className="card flex flex-wrap items-center justify-between gap-4 border-2 border-orange-600 p-5">
          <div>
            <h2 id="defi" className={`${display.className} text-2xl text-slate-900`}>Défi</h2>
            <p className="text-sm text-slate-600">Laisse le hasard choisir parmi les {plural(pool.length, "exercice", "exercices")} type Brevet.</p>
          </div>
          <form action="/brevet" method="get"><input type="hidden" name="hasard" value="1" /><button type="submit" className="btn-primary">Un exercice au hasard</button></form>
        </section>
      )}
    </div>
  );
}

/** Compas et calculatrice, dessinés à la main ; décor seulement, masqué sous md pour ne jamais passer sous le texte. */
function BrevetMotifs() {
  return (
    <svg aria-hidden viewBox="0 0 170 110" className="pointer-events-none absolute right-6 top-6 hidden w-44 text-orange-700 opacity-40 md:block lg:w-56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="12" r="5" />
      <path d="M40 4V0M37 16L18 92M43 16L62 92M18 92l-2 6M62 92l1 4" />
      <path d="M12 100a30 30 0 0 1 56 0" strokeDasharray="3 5" />
      <rect x="100" y="14" width="56" height="84" rx="8" />
      <rect x="108" y="22" width="40" height="16" rx="3" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={109 + k * 14} y={46 + r * 16} width="10" height="10" rx="2" />))}
    </svg>
  );
}
