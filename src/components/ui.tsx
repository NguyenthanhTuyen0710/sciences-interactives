import Link from "next/link";
import type { ExerciseMeta, Subject } from "@/lib/engine/types";
import type { ChapterContent } from "@/lib/chapters/schema";
// Chemins relatifs pour les modules d'exécution : ce fichier est aussi importé par les tests (vitest, sans alias « @ »).
import { KIND_LABELS } from "../lib/engine/labels";
import { CURRICULUM, SUBJECTS, levelLabel } from "../lib/content/curriculum";

/** Tonalité de chaque classe (un code couleur par niveau, collège → lycée). Classes Tailwind écrites en entier. */
export interface LevelTone { chip: string; solid: string; accent: string; dot: string; text: string }
const LEVEL_TONES: Record<string, LevelTone> = {
  "6e": { chip: "bg-sky-100 text-sky-800", solid: "border-sky-700 bg-sky-700 text-white", accent: "border-sky-600", dot: "bg-sky-500", text: "text-sky-700" },
  "5e": { chip: "bg-teal-100 text-teal-800", solid: "border-teal-700 bg-teal-700 text-white", accent: "border-teal-600", dot: "bg-teal-500", text: "text-teal-700" },
  "4e": { chip: "bg-lime-100 text-lime-800", solid: "border-lime-700 bg-lime-700 text-white", accent: "border-lime-600", dot: "bg-lime-500", text: "text-lime-700" },
  "3e": { chip: "bg-orange-100 text-orange-800", solid: "border-orange-700 bg-orange-700 text-white", accent: "border-orange-600", dot: "bg-orange-500", text: "text-orange-700" },
  "2nde": { chip: "bg-rose-100 text-rose-800", solid: "border-rose-700 bg-rose-700 text-white", accent: "border-rose-600", dot: "bg-rose-500", text: "text-rose-700" },
  "1re": { chip: "bg-fuchsia-100 text-fuchsia-800", solid: "border-fuchsia-700 bg-fuchsia-700 text-white", accent: "border-fuchsia-600", dot: "bg-fuchsia-500", text: "text-fuchsia-700" },
  Tle: { chip: "bg-violet-100 text-violet-800", solid: "border-violet-700 bg-violet-700 text-white", accent: "border-violet-600", dot: "bg-violet-500", text: "text-violet-700" },
};
const NEUTRAL: LevelTone = { chip: "bg-slate-100 text-slate-700", solid: "border-slate-700 bg-slate-700 text-white", accent: "border-slate-400", dot: "bg-slate-400", text: "text-slate-700" };
export const levelTone = (level: string): LevelTone => LEVEL_TONES[level] ?? NEUTRAL;

export function LevelBadge({ level }: { level: string }) {
  return <span className={`chip ${levelTone(level).chip}`}>{levelLabel(level)}</span>;
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden>›</span>}
          {it.href ? <Link href={it.href} className="hover:text-indigo-600 hover:underline">{it.label}</Link> : <span className="font-medium text-slate-800">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SubjectBadge({ subject }: { subject: string }) {
  return subject === "maths"
    ? <span className="chip bg-indigo-100 text-indigo-700">Maths</span>
    : <span className="chip bg-emerald-100 text-emerald-700">Physique-Chimie</span>;
}

export function ExerciseCard({ m, difficulty, note }: { m: ExerciseMeta; difficulty?: number; note?: string }) {
  return (
    <Link href={`/exercice/${m.id}${difficulty ? `?d=${difficulty}` : ""}`} className="card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-1.5">
        <SubjectBadge subject={m.subject} />
        <LevelBadge level={m.level} />
        {m.id.startsWith("perso-") && <span className="chip bg-amber-100 text-amber-800">Enseignant</span>}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{m.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-600">{note ?? m.summary}</p>
      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {m.kinds.map((k) => <span key={k} className="chip bg-white text-slate-500 ring-1 ring-slate-200">{KIND_LABELS[k]}</span>)}
      </div>
    </Link>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Bar({ value, color = "bg-indigo-500" }: { value: number; color?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} /></div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">{children}</div>;
}

// ───────── Chapitres complets : résumé sans contenu (aucune réponse ni correction) ─────────
// Construit côté serveur (les pages passent ALL_CHAPTERS) ; seul ce résumé atteint le rendu.
export interface ChapterSummary {
  id: string; title: string; level: string; subject: Subject; theme: string | null;
  status: "published" | "approved" | "draft"; href: string | null; exercises: number; games: number;
}
const subjectOfSlug = (slug: string): Subject => (slug === "mathematiques" ? "maths" : "pc");

/** `visible` : publié, ou prévisualisation (SHOW_DRAFTS=1) ; sinon le chapitre n'est pas cliquable. */
export function chapterSummary(c: ChapterContent, visible: boolean): ChapterSummary {
  const subject = subjectOfSlug(c.subject);
  const node = CURRICULUM[subject].find((l) => l.id === c.grade)?.chapters.find((x) => x.id === c.treeChapterId);
  return {
    id: c.id, title: c.title, level: c.grade, subject, theme: node?.theme ?? null, status: c.publicationStatus,
    href: visible ? `/${SUBJECTS[subject].slug}/${c.grade}/${c.treeChapterId}` : null, exercises: c.exercises.length, games: c.games.length,
  };
}

/** Chiffres réels d'une classe : chapitres complets (publiés / non publiés) et thèmes du programme. */
export function levelCounts(chapters: ChapterSummary[], level: string, subject: Subject | null) {
  const list = chapters.filter((c) => c.level === level && (!subject || c.subject === subject));
  const subjects: Subject[] = subject ? [subject] : ["maths", "pc"];
  const themes = subjects.reduce((n, s) => n + (CURRICULUM[s].find((l) => l.id === level)?.chapters.length ?? 0), 0);
  return { total: list.length, published: list.filter((c) => c.status === "published").length, unpublished: list.filter((c) => c.status !== "published").length, themes };
}

/** Taxonomie verrouillée d'un chapitre (research/…/taxonomy), lue côté serveur ; seuls `id` et `title` en sortent. */
export interface TaxonomyRef { types: { id: string; title: string; exercises?: string[] }[] }
export interface ChapterTypes { kind: "taxonomy" | "methods"; items: { id: string; title: string }[] }

/**
 * Libellés « types d'exercices » d'un chapitre, sans aucun contenu d'exercice.
 * Avec taxonomie : un type n'apparaît que si au moins un exercice du chapitre y est rattaché
 * (champ `taxonomyTypes` de l'exercice, ou liste `exercises` du type) ; un type sans exercice reste caché.
 * Sans taxonomie : titres des méthodes du cours (les étapes ne sont jamais reprises).
 */
export function chapterTypes(c: ChapterContent, tax: TaxonomyRef | null): ChapterTypes {
  if (!tax) return { kind: "methods", items: c.lesson.methods.map((m, i) => ({ id: `methode-${i + 1}`, title: m.title })) };
  const ids = new Set(c.exercises.map((e) => e.id));
  const tagged = new Set(c.exercises.flatMap((e) => e.taxonomyTypes ?? []));
  const items = tax.types.filter((t) => tagged.has(t.id) || (t.exercises ?? []).some((x) => ids.has(x))).map((t) => ({ id: t.id, title: t.title }));
  return { kind: "taxonomy", items };
}

/** Liens vers des exercices d'un chapitre, filtrés par titre : identifiant, titre et niveau seulement (aucun contenu). */
export function exerciseLinks(c: ChapterContent, keep: (title: string) => boolean) {
  return c.exercises.filter((e) => keep(e.title)).map((e) => ({ id: e.id, title: e.title, niveau: e.niveau }));
}

/** Progression réelle d'un élève sur un chapitre, d'après ses tentatives (exercice réussi = score 1). */
export interface ChapterProgress { done: number; total: number; tried: number; milestones: string[] }
export function chapterProgress(c: ChapterContent, attempts: { exerciseId: string; score: number }[], isExam?: (title: string) => boolean): ChapterProgress {
  const ids = new Set(c.exercises.map((e) => e.id));
  const mine = attempts.filter((a) => ids.has(a.exerciseId));
  const ok = new Set(mine.filter((a) => a.score >= 0.999).map((a) => a.exerciseId));
  const solved = c.exercises.filter((e) => ok.has(e.id));
  const milestones = [
    solved.length > 0 && "Premier exercice réussi",
    new Set(solved.map((e) => e.niveau)).size === 5 && "Un exercice réussi à chaque niveau",
    solved.some((e) => e.niveau === 5) && "Niveau 5 réussi",
    !!isExam && solved.some((e) => isExam(e.title)) && "Exercice type examen réussi",
  ].filter((x): x is string => !!x);
  return { done: solved.length, total: c.exercises.length, tried: new Set(mine.map((a) => a.exerciseId)).size, milestones };
}

/** Barre de progression et petits jalons, affichés seulement pour un élève connecté ayant déjà travaillé le chapitre. */
export function ProgressNote({ p }: { p: ChapterProgress }) {
  const pct = Math.round((100 * p.done) / Math.max(1, p.total));
  return (
    <div className="mt-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
      <p className="mb-1 font-semibold">Ta progression : {plural(p.done, "exercice réussi", "exercices réussis")} sur {p.total}</p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-300" role="progressbar" aria-label="Exercices réussis" aria-valuemin={0} aria-valuemax={p.total} aria-valuenow={p.done}>
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
      </div>
      {p.milestones.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Jalons atteints">
          {p.milestones.map((m) => <li key={m} className="chip bg-emerald-100 text-emerald-800">✓ {m}</li>)}
        </ul>
      )}
    </div>
  );
}

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

/** « 6 chapitres (2 publiés, 4 brouillons) » ou, sans chapitre complet, « 12 thèmes du programme, chapitres en préparation ». */
export function countsLabel(k: ReturnType<typeof levelCounts>) {
  if (!k.total) return `${plural(k.themes, "thème", "thèmes")} du programme, chapitres en préparation`;
  const parts = [k.published && plural(k.published, "publié", "publiés"), k.unpublished && plural(k.unpublished, "brouillon", "brouillons")].filter(Boolean);
  return `${plural(k.total, "chapitre", "chapitres")} (${parts.join(", ")})`;
}


export function StatusBadge({ status }: { status: ChapterSummary["status"] }) {
  if (status === "published") return <span className="chip bg-emerald-100 text-emerald-800">Publié</span>;
  return <span className="chip bg-amber-100 text-amber-900">{status === "approved" ? "Validé, bientôt publié" : "Brouillon"}</span>;
}

/** Carte de chapitre : lien seulement s'il est ouvert ; un brouillon reste visible mais non cliquable. */
/**
 * `types` : libellés déjà rendus (titres pouvant contenir du LaTeX) et leur intitulé ; `anchor` : section visée du chapitre ;
 * `action` : appel affiché en bas de la carte (la carte entière reste un seul lien).
 */
export function ChapterCard({ c, types, anchor, action }: { c: ChapterSummary; types?: { label: string; items: React.ReactNode[] }; anchor?: string; action?: string }) {
  const MAX_TYPES = 3;
  const body = (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <LevelBadge level={c.level} />
        <SubjectBadge subject={c.subject} />
        <StatusBadge status={c.status} />
      </div>
      <h3 className={`text-lg font-bold ${c.href ? "text-slate-900 group-hover:text-indigo-700" : "text-slate-700"}`}>{c.title}</h3>
      {c.theme && <p className="text-sm text-slate-600">{c.theme}</p>}
      {types && types.items.length > 0 && (
        <div className="text-xs">
          <p className="mb-1 font-semibold text-slate-600">{types.label}</p>
          <ul className="flex flex-wrap gap-1.5" aria-label={types.label}>
            {types.items.slice(0, MAX_TYPES).map((t, i) => <li key={i} className="chip bg-slate-100 text-left text-slate-700">{t}</li>)}
            {types.items.length > MAX_TYPES && <li className="chip bg-slate-100 text-slate-700">+{types.items.length - MAX_TYPES} {types.items.length - MAX_TYPES > 1 ? "autres" : "autre"}</li>}
          </ul>
        </div>
      )}
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-1 text-xs" aria-label="Contenu du chapitre">
        <li className="chip bg-slate-100 text-slate-700">Cours</li>
        <li className="chip bg-slate-100 text-slate-700">{plural(c.exercises, "exercice", "exercices")}</li>
        <li className="chip bg-slate-100 text-slate-700">{plural(c.games, "jeu", "jeux")}</li>
      </ul>
      {!c.href && <p className="text-xs font-medium text-slate-600">En relecture : pas encore ouvert.</p>}
      {c.href && action && <span className="mt-1 self-start rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white group-hover:bg-indigo-700">{action} →</span>}
    </>
  );
  const base = `card flex h-full flex-col gap-2 border-l-4 ${levelTone(c.level).accent} p-4`;
  return c.href
    ? <Link href={anchor ? `${c.href}#${anchor}` : c.href} className={`group ${base} transition hover:-translate-y-0.5 hover:shadow-md`}>{body}</Link>
    : <div className={`${base} border-dashed`}>{body}</div>;
}
