import Link from "next/link";
import { CURRICULUM, LEVELS, SUBJECTS } from "@/lib/content/curriculum";
import { ALL_CHAPTERS, isVisible } from "@/lib/chapters";
import type { Subject } from "@/lib/engine/types";
import { PLAN_MAX_DAYS, addDays, buildPlan, daysBetween, parisToday, type PlanTask, type StepKind } from "@/lib/revision-plan";
import { Breadcrumbs, Empty, StatusBadge, chapterSummary, levelTone, plural } from "@/components/ui";
import { PrintButton } from "@/components/ClientBits";

// Rendu à chaque demande : « aujourd'hui » est la date de Paris au moment de la requête, jamais une page figée au build.
export const dynamic = "force-dynamic";
export const metadata = { title: "Plan de révision" };

const SUBJECT_IDS: Subject[] = ["maths", "pc"];
const STEP: Record<StepKind, { title: string; text: string }> = {
  cours: { title: "Cours", text: "Lis le cours et refais les exemples résolus sans regarder la solution." },
  bases: { title: "Exercices de base", text: "Commence par ces exercices, puis joue pour fixer les automatismes." },
  entrainement: { title: "Entraînement", text: "Des exercices plus complets, puis un deuxième jeu." },
  approfondissement: { title: "Approfondissement", text: "Les exercices les plus exigeants, puis relis la fiche de révision." },
  bilan: { title: "Bilan de la veille", text: "Relis la fiche de révision, fais la mini-évaluation, puis refais un exercice des jours précédents qui t'a posé problème." },
  express: { title: "Révision express", text: "Relis la fiche, fais la mini-évaluation et ces deux exercices." },
};
/** « (niveau 5) », « (niveaux 3 et 4) » ; rien sans niveaux. */
const levelsLabel = (l?: number[]) => !l?.length ? "" : l.length === 1 ? ` (niveau ${l[0]})` : ` (niveaux ${l.slice(0, -1).join(", ")} et ${l[l.length - 1]})`;
const SECTION_LABEL = { cours: "Cours", exercices: "Exercices", activites: "Activités", revision: "Fiche de révision", evaluation: "Mini-évaluation" } as const;
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", ...opts });
const longDate = (iso: string) => fmt(iso, { weekday: "long", day: "numeric", month: "long" });
const dayTitle = (iso: string) => { const s = longDate(iso); return s.charAt(0).toUpperCase() + s.slice(1); };
const ignoredNote = (n: number) => n > 1
  ? `${n} chapitres demandés ne sont pas disponibles (en relecture ou inconnus) : ils n'apparaissent pas dans le plan.`
  : "1 chapitre demandé n'est pas disponible (en relecture ou inconnu) : il n'apparaît pas dans le plan.";

type SP = { niveau?: string; matiere?: string; date?: string; c?: string | string[] };

export default async function RevisionPlanPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const today = parisToday();
  const subject: Subject = sp.matiere === "pc" ? "pc" : "maths";
  const level = LEVELS.find((l) => l.id === sp.niveau) ?? LEVELS.find((l) => l.id === "3e")!;
  const requested = [sp.c ?? []].flat().flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean);
  const date = sp.date ?? "";
  const href = (matiere: Subject, niveau: string) => `/revisions/plan?${new URLSearchParams({ matiere, niveau, ...(date ? { date } : {}) })}`;

  const slug = SUBJECTS[subject].slug;
  const ofLevel = ALL_CHAPTERS.filter((c) => c.subject === slug && c.grade === level.id);
  const available = ofLevel.filter(isVisible);
  const covered = new Set(ofLevel.map((c) => c.treeChapterId));
  const themesWithout = (CURRICULUM[subject].find((l) => l.id === level.id)?.chapters ?? []).filter((t) => !covered.has(t.id));
  const plan = date || requested.length ? buildPlan({ today, examDate: date, requested, available: ALL_CHAPTERS.filter(isVisible) }) : null;
  const chapterHref = (id: string) => chapterSummary(ALL_CHAPTERS.find((c) => c.id === id)!, true).href!;
  const pill = "rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition hover:shadow-md";

  return (
    <div>
      <div className="print:hidden"><Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/revisions", label: "Révisions" }, { label: "Plan de révision" }]} /></div>
      <h1 className="mb-1 text-3xl font-black">Plan de révision</h1>
      <p className="mb-6 max-w-3xl text-slate-600 print:hidden">Indique la date de ton évaluation et les chapitres à revoir : tu obtiens un programme jour par jour, avec le cours, des exercices de difficulté croissante et des jeux. Rien n'est enregistré : le plan tient dans l'adresse de la page, que tu peux garder en favori ou imprimer.</p>

      <section aria-labelledby="choix" className="card mb-8 space-y-4 p-4 print:hidden">
        <h2 id="choix" className="sr-only">Choisir les chapitres et la date</h2>
        <nav aria-label="Choisir la matière" className="flex flex-wrap gap-2">
          {SUBJECT_IDS.map((id) => <Link key={id} href={href(id, level.id)} aria-current={subject === id ? "page" : undefined} className={`${pill} ${subject === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-(--surface) text-slate-700"}`}>{SUBJECTS[id].label}</Link>)}
        </nav>
        <nav aria-label="Choisir la classe" className="flex flex-wrap gap-2">
          {LEVELS.map((l) => <Link key={l.id} href={href(subject, l.id)} aria-current={level.id === l.id ? "page" : undefined} className={`${pill} ${level.id === l.id ? levelTone(l.id).solid : `${levelTone(l.id).chip} border-transparent`}`}>{l.short}</Link>)}
        </nav>
        <form action="/revisions/plan" method="get" className="space-y-4">
          <input type="hidden" name="matiere" value={subject} />
          <input type="hidden" name="niveau" value={level.id} />
          <fieldset>
            <legend className="mb-2 font-semibold">Chapitres à réviser ({SUBJECTS[subject].label}, {level.short})</legend>
            {ofLevel.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {ofLevel.map((c) => {
                  const open = isVisible(c);
                  return (
                    <li key={c.id}>
                      <label className={`flex items-start gap-3 rounded-xl border-2 p-3 ${open ? "cursor-pointer border-slate-200 bg-(--surface)" : "border-dashed border-slate-300"}`}>
                        <input type="checkbox" name="c" value={c.id} disabled={!open} defaultChecked={open && requested.includes(c.id)} className="mt-1 h-4 w-4" />
                        <span className="flex flex-col gap-1">
                          <span className={`font-semibold ${open ? "text-slate-900" : "text-slate-600"}`}>{c.title}</span>
                          <span className="flex flex-wrap items-center gap-1.5"><StatusBadge status={c.publicationStatus} />{!open && <span className="text-xs text-slate-600">En relecture : pas encore disponible.</span>}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : <Empty><p>Pas encore de chapitre complet en {SUBJECTS[subject].label} en {level.short}.</p></Empty>}
            {themesWithout.length > 0 && (
              <p className="mt-3 text-sm text-slate-600">
                {ofLevel.length ? "Sans chapitre complet pour l'instant" : "Thèmes du programme"} ({themesWithout.length}) : révise-les avec les fiches —{" "}
                {themesWithout.map((t, i) => <span key={t.id}>{i > 0 && ", "}<Link href={`/${slug}/${level.id}/${t.id}`} className="font-medium text-indigo-600 hover:underline">{t.title}</Link></span>)}.
              </p>
            )}
          </fieldset>
          {available.length > 0 && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Date de ton évaluation
                <input type="date" name="date" required min={today} defaultValue={date} className="input w-auto" />
              </label>
              <button type="submit" className="btn-primary">Construire mon plan</button>
            </div>
          )}
        </form>
      </section>

      {plan && !plan.ok && (
        <div role="status" className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          {plan.reason === "date-invalide" && "Choisis une date d'évaluation valide."}
          {plan.reason === "date-passee" && "Cette date est déjà passée : choisis la date de ta prochaine évaluation."}
          {plan.reason === "aucun-chapitre" && "Coche au moins un chapitre disponible pour construire ton plan."}
          {plan.ignored.length > 0 && ` ${ignoredNote(plan.ignored.length)}`}
        </div>
      )}

      {plan?.ok && (
        <section aria-labelledby="mon-plan">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="mon-plan" className="text-2xl font-black">Ton plan jusqu'au {longDate(plan.examDate)}</h2>
              <p className="text-sm text-slate-600">
                {plan.mode === "express"
                  ? "Ton évaluation est très proche : voici une révision express à faire en une séance."
                  : `${plural(daysBetween(plan.start, plan.examDate), "jour", "jours")} de révision, du ${longDate(plan.start)} au ${longDate(addDays(plan.examDate, -1))}. Les jours sans tâche sont libres : refais quelques exercices déjà vus.`}
              </p>
              {plan.capped && <p className="mt-1 text-sm text-slate-600">Ton évaluation est dans plus de {PLAN_MAX_DAYS} jours : le plan commence {PLAN_MAX_DAYS} jours avant. D'ici là, avance à ton rythme dans les chapitres.</p>}
              {plan.ignored.length > 0 && <p className="mt-1 text-sm text-slate-600">{ignoredNote(plan.ignored.length)}</p>}
            </div>
            <PrintButton />
          </div>
          <ol className="space-y-4">
            {plan.days.map((d) => (
              <li key={d.date} className="card break-inside-avoid p-4">
                <h3 className="mb-3 text-lg font-bold">{dayTitle(d.date)}{d.date === today && <span className="ml-2 text-sm font-semibold text-indigo-700">(aujourd'hui)</span>}</h3>
                <ul className="space-y-3">{d.tasks.map((t) => <Task key={`${t.chapterId}-${t.kind}`} t={t} href={chapterHref(t.chapterId)} />)}</ul>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Task({ t, href }: { t: PlanTask; href: string }) {
  const link = "font-medium text-indigo-600 hover:underline";
  return (
    <li className="border-l-4 border-slate-300 pl-3">
      <p className="font-semibold text-slate-900">{STEP[t.kind].title}{levelsLabel(t.levels)} · <Link href={href} className={link}>{t.chapterTitle}</Link></p>
      <p className="text-sm text-slate-600">{STEP[t.kind].text}</p>
      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {t.sections.map((s) => <Link key={s} href={`${href}#${s}`} className={link}>{SECTION_LABEL[s]}</Link>)}
      </p>
      {t.exercises.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-sm">
          {t.exercises.map((e) => (
            <li key={e.id}><Link href={`/exercice/${e.id}`} className={link}>{e.title}</Link> <span className="text-slate-600">(niveau {e.niveau})</span></li>
          ))}
        </ul>
      )}
      {t.game && <p className="mt-1 text-sm">Jeu : <Link href={`${href}#activites`} className={link}>{t.game}</Link></p>}
    </li>
  );
}
