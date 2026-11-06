// Page de chapitre complet : cours (15 rubriques), exercices par niveau, activités interactives, révision.
import Link from "next/link";
import MathText, { MathInline } from "../MathText";
import MiniQuiz from "./MiniQuiz";
import ChapterGameView from "../games/Games";
import type { ChapterContent } from "@/lib/chapters/schema";
import { NIVEAUX } from "@/lib/engine/labels";

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => <h2 id={id} className="scroll-mt-24 text-2xl font-black text-slate-900">{children}</h2>;
const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mb-2 mt-6 text-lg font-bold text-indigo-900">{children}</h3>;
const fmtTime = (s: number) => (s < 60 ? `${s} s` : `${Math.round(s / 60)} min`);

export default function ChapterView({ c }: { c: ChapterContent }) {
  const L = c.lesson;
  const nav = [["cours", "Cours"], ["exercices", `Exercices (${c.exercises.length})`], ["activites", `Activités (${c.games.length})`], ["revision", "Fiche de révision"], ["evaluation", "Mini-évaluation"]];
  return (
    <div className="space-y-10">
      {c.publicationStatus !== "published" && (
        <p role="note" className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-900">Prévisualisation : ce chapitre est en cours de validation et n'est pas encore publié.</p>
      )}
      <nav aria-label="Sommaire du chapitre" className="sticky top-16 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-slate-200 backdrop-blur">
        {nav.map(([id, label]) => <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{label}</a>)}
      </nav>

      <section aria-labelledby="cours" className="space-y-2">
        <H2 id="cours">Cours</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-4"><h3 className="mb-2 font-bold">Prérequis</h3><ul className="list-disc space-y-1 pl-5 text-sm">{c.prerequisites.map((p, i) => <li key={i}><MathInline text={p.text} /></li>)}</ul></div>
          <div className="card p-4"><h3 className="mb-2 font-bold">Objectifs d'apprentissage</h3><ul className="list-disc space-y-1 pl-5 text-sm">{c.officialObjectives.map((o) => <li key={o.id}><MathInline text={o.text} /></li>)}</ul></div>
        </div>
        <H3>Pour commencer</H3>
        <MathText text={L.introduction} className="leading-relaxed" />
        <H3>Définitions essentielles</H3>
        <dl className="space-y-3">{L.definitions.map((d) => <div key={d.term} className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50/60 p-3"><dt className="font-bold">{d.term}</dt><dd><MathText text={d.text} /></dd></div>)}</dl>
        <H3>Propriétés et règles</H3>
        <div className="space-y-3">{L.properties.map((p) => <div key={p.title} className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/60 p-3"><p className="font-bold">{p.title}</p><MathText text={p.statement} />{p.conditions && <p className="mt-1 text-sm text-slate-600"><MathInline text={p.conditions} /></p>}</div>)}</div>
        <H3>Explications pas à pas</H3>
        <div className="space-y-4">{L.explanations.map((e) => <div key={e.title}><p className="font-semibold">{e.title}</p><MathText text={e.body} className="text-slate-700" /></div>)}</div>
        <H3>Illustrations</H3>
        <div className="grid gap-4 md:grid-cols-2">{L.illustrations.map((f, i) => <figure key={i} className="card p-3"><div role="img" aria-label={f.alt} className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: f.svg }} />{f.caption && <figcaption className="mt-2 text-center text-xs text-slate-500"><MathInline text={f.caption} /></figcaption>}</figure>)}</div>
        <H3>Exemples corrigés</H3>
        <div className="space-y-4">{L.workedExamples.map((w) => (
          <details key={w.title} className="card p-4 open:ring-1 open:ring-indigo-200">
            <summary className="cursor-pointer font-semibold">{w.title} — <MathInline text={w.statement} /></summary>
            <ol className="mt-3 list-decimal space-y-1 pl-6">{w.steps.map((s, i) => <li key={i}><MathInline text={s} /></li>)}</ol>
            <p className="mt-2 font-semibold text-emerald-800">Réponse : <MathInline text={w.answer} /></p>
          </details>
        ))}</div>
        <H3>Erreurs fréquentes</H3>
        <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-3">Erreur</th><th className="py-2 pr-3">Ce qu'il faut écrire</th><th className="py-2">Pourquoi</th></tr></thead>
          <tbody>{L.commonMistakes.map((m, i) => <tr key={i} className="border-b border-slate-100 align-top"><td className="py-2 pr-3 text-rose-800"><MathInline text={m.mistake} /></td><td className="py-2 pr-3 text-emerald-800"><MathInline text={m.correction} /></td><td className="py-2"><MathInline text={m.why} /></td></tr>)}</tbody></table></div>
        <H3>Méthodes à retenir</H3>
        <div className="grid gap-4 md:grid-cols-2">{L.methods.map((m) => <div key={m.title} className="card p-4"><p className="mb-2 font-bold">{m.title}</p><ol className="list-decimal space-y-1 pl-5 text-sm">{m.steps.map((s, i) => <li key={i}><MathInline text={s} /></li>)}</ol></div>)}</div>
        <H3>Résumé du cours</H3>
        <ul className="list-disc space-y-1 pl-5">{L.summary.map((s, i) => <li key={i}><MathInline text={s} /></li>)}</ul>
      </section>

      <section aria-labelledby="exercices" className="space-y-4">
        <H2 id="exercices">Exercices</H2>
        <p className="text-sm text-slate-600">Cinq niveaux de difficulté. Chaque exercice est corrigé avec une explication détaillée ; des indices progressifs sont disponibles.</p>
        {[1, 2, 3, 4, 5].map((lvl) => {
          const list = c.exercises.filter((e) => e.niveau === lvl);
          if (!list.length) return null;
          return (
            <div key={lvl}>
              <h3 className="mb-2 font-bold">Niveau {lvl} — {NIVEAUX[lvl]} <span className="text-sm font-normal text-slate-500">({list.length})</span></h3>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => (
                  <li key={e.id}><Link href={`/exercice/${e.id}`} className="card flex h-full items-start justify-between gap-2 p-3 text-sm transition hover:border-indigo-300 hover:shadow-md">
                    <span className="font-medium text-slate-800">{e.title}</span><span className="chip shrink-0 bg-slate-100 text-slate-600">≈ {fmtTime(e.time)}</span>
                  </Link></li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="activites" className="space-y-4">
        <H2 id="activites">Activités interactives</H2>
        {c.games.map((g) => <ChapterGameView key={g.id} game={g} />)}
      </section>

      <section aria-labelledby="revision" className="space-y-3">
        <H2 id="revision">Fiche de révision</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-4"><h3 className="mb-2 font-bold">À retenir</h3><ul className="list-disc space-y-1 pl-5 text-sm">{L.revisionSheet.keyPoints.map((k, i) => <li key={i}><MathInline text={k} /></li>)}</ul></div>
          <div className="card p-4"><h3 className="mb-2 font-bold">Je sais faire</h3><ul className="space-y-1 text-sm">{L.revisionSheet.skills.map((k, i) => <li key={i}>☐ <MathInline text={k} /></li>)}</ul></div>
        </div>
      </section>

      <section aria-labelledby="evaluation" className="space-y-3">
        <H2 id="evaluation">Mini-évaluation</H2>
        <MiniQuiz items={L.miniQuiz} />
      </section>

      <section aria-labelledby="sources" className="text-xs text-slate-500">
        <h2 id="sources" className="mb-1 font-semibold">Références (programme {c.curriculumVersion})</h2>
        <ul className="space-y-0.5">{c.sources.map((s) => <li key={s.id}><a className="underline hover:text-indigo-600" href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>{s.note ? ` — ${s.note}` : ""}</li>)}</ul>
        <p className="mt-1">Cours, exercices et activités originaux. Les sujets d'examen éventuellement cités sont des références ; aucun n'est reproduit.</p>
      </section>
    </div>
  );
}
