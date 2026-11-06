"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import MathText, { MathInline } from "../MathText";
import { Interaction, initValue } from "../interactions";
import { FigureView } from "../ExercisePlayer";
import type { PublicExercise } from "@/lib/engine/public";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ChapterOpt = { id: string; title: string; subject: string; level: string; notions: { id: string; title: string }[] };
type Part = Record<string, any> & { kind: string };
type Schema = { statement: string; variables: { name: string; min: number; max: number; step?: number; nonZero?: boolean }[]; figure?: { kind: "image" | "video"; src: string; alt?: string; caption?: string }; parts: Part[]; solution: string[]; rappel?: string };
export interface EditorInitial { id?: string; title: string; summary: string; subject: string; level: string; chapterId: string; notionId: string; difficulty: number; published: boolean; schema: Schema }

const KINDS: [string, string][] = [["numerique", "Réponse numérique"], ["qcm", "QCM"], ["vrai-faux", "Vrai / Faux"], ["expression", "Expression algébrique"], ["texte-libre", "Réponse libre (texte)"], ["ordonner", "Ordonner"], ["associer", "Associer"], ["classer", "Classer"]];
const LEVELS = ["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"];

const newPart = (kind: string): Part => {
  switch (kind) {
    case "qcm": return { kind, prompt: "", options: ["", ""], correct: [0] };
    case "vrai-faux": return { kind, prompt: "", items: [""], answers: [true] };
    case "expression": return { kind, prompt: "", label: "", variable: "x", answer: "" };
    case "texte-libre": return { kind, prompt: "", answers: [""] };
    case "ordonner": return { kind, prompt: "", items: ["", ""] };
    case "associer": return { kind, prompt: "", pairs: [["", ""], ["", ""]] };
    case "classer": return { kind, prompt: "", categories: ["", ""], items: [{ text: "", category: 0 }] };
    default: return { kind: "numerique", prompt: "", label: "", answerExpr: "", tol: 0, suffix: "" };
  }
};

export const EMPTY: EditorInitial = {
  title: "", summary: "", subject: "maths", level: "6e", chapterId: "", notionId: "", difficulty: 1, published: true,
  schema: { statement: "Un article coûte {a} €. Combien coûtent {n} articles ?", variables: [{ name: "a", min: 2, max: 9 }, { name: "n", min: 3, max: 12 }], parts: [{ kind: "numerique", prompt: "", label: "Prix :", answerExpr: "a*n", tol: 0, suffix: "€" }], solution: ["$ {n} \\times {a} = {{n*a}} $ €"], rappel: "" },
};

function ListEditor({ values, onChange, placeholder, render }: { values: any[]; onChange: (v: any[]) => void; placeholder?: string; render?: (v: any, set: (x: any) => void, i: number) => React.ReactNode }) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{render ? render(v, (x) => onChange(values.map((y, j) => (j === i ? x : y))), i) : <input className="input" value={v} placeholder={placeholder} onChange={(e) => onChange(values.map((y, j) => (j === i ? e.target.value : y)))} />}</div>
          <button type="button" aria-label="Supprimer" onClick={() => onChange(values.filter((_, j) => j !== i))} className="mt-1 rounded-lg px-2 py-1 text-rose-400 hover:bg-rose-50">✕</button>
        </div>
      ))}
    </div>
  );
}

function PartEditor({ p, set }: { p: Part; set: (p: Part) => void }) {
  const f = (k: string, v: any) => set({ ...p, [k]: v });
  const add = (k: string, v: any) => set({ ...p, [k]: [...p[k], v] });
  return (
    <div className="space-y-3">
      <div><label className="label">Consigne de la question (facultatif)</label><input className="input" value={p.prompt ?? ""} onChange={(e) => f("prompt", e.target.value)} /></div>
      {p.kind === "numerique" && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div><label className="label">Étiquette</label><input className="input" value={p.label ?? ""} onChange={(e) => f("label", e.target.value)} placeholder="$x =$" /></div>
          <div><label className="label">Réponse (formule)</label><input className="input font-mono" value={p.answerExpr} onChange={(e) => f("answerExpr", e.target.value)} placeholder="a*n" /></div>
          <div><label className="label">Tolérance</label><input className="input" type="number" step="any" min={0} value={p.tol ?? 0} onChange={(e) => f("tol", Number(e.target.value))} /></div>
          <div><label className="label">Unité affichée</label><input className="input" value={p.suffix ?? ""} onChange={(e) => f("suffix", e.target.value)} /></div>
        </div>
      )}
      {p.kind === "expression" && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div><label className="label">Étiquette</label><input className="input" value={p.label ?? ""} onChange={(e) => f("label", e.target.value)} placeholder="A =" /></div>
          <div><label className="label">Variable</label><input className="input" value={p.variable} onChange={(e) => f("variable", e.target.value)} /></div>
          <div><label className="label">Expression attendue</label><input className="input font-mono" value={p.answer} onChange={(e) => f("answer", e.target.value)} placeholder="a*x + b" /></div>
          <div><label className="label">Forme exigée</label><select className="input" value={p.form ?? ""} onChange={(e) => f("form", e.target.value || undefined)}><option value="">aucune</option><option value="reduite">réduite</option><option value="developpee">développée</option></select></div>
        </div>
      )}
      {p.kind === "qcm" && (
        <div>
          <label className="label">Propositions (cocher les bonnes réponses)</label>
          <ListEditor values={p.options} onChange={(v) => set({ ...p, options: v, correct: p.correct.filter((c: number) => c < v.length) })} render={(v, s, i) => (
            <div className="flex items-center gap-2"><input type="checkbox" checked={p.correct.includes(i)} onChange={(e) => f("correct", e.target.checked ? [...p.correct, i] : p.correct.filter((c: number) => c !== i))} aria-label="Bonne réponse" /><input className="input" value={v} onChange={(e) => s(e.target.value)} /></div>
          )} />
          <button type="button" className="mt-2 text-sm font-semibold text-indigo-400" onClick={() => add("options", "")}>+ proposition</button>
        </div>
      )}
      {p.kind === "vrai-faux" && (
        <div>
          <label className="label">Affirmations</label>
          <ListEditor values={p.items} onChange={(v) => set({ ...p, items: v, answers: p.answers.slice(0, v.length) })} render={(v, s, i) => (
            <div className="flex items-center gap-2"><input className="input" value={v} onChange={(e) => s(e.target.value)} /><select className="rounded-lg border border-slate-300 px-2 py-2" value={p.answers[i] ? "1" : "0"} onChange={(e) => f("answers", p.answers.map((a: boolean, j: number) => (j === i ? e.target.value === "1" : a)))}><option value="1">Vrai</option><option value="0">Faux</option></select></div>
          )} />
          <button type="button" className="mt-2 text-sm font-semibold text-indigo-400" onClick={() => set({ ...p, items: [...p.items, ""], answers: [...p.answers, true] })}>+ affirmation</button>
        </div>
      )}
      {p.kind === "texte-libre" && (
        <div><label className="label">Réponses acceptées (accents et majuscules ignorés)</label><ListEditor values={p.answers} onChange={(v) => f("answers", v)} /><button type="button" className="mt-2 text-sm font-semibold text-indigo-400" onClick={() => add("answers", "")}>+ variante acceptée</button></div>
      )}
      {p.kind === "ordonner" && (
        <div><label className="label">Éléments dans le BON ordre (ils seront mélangés)</label><ListEditor values={p.items} onChange={(v) => f("items", v)} /><button type="button" className="mt-2 text-sm font-semibold text-indigo-400" onClick={() => add("items", "")}>+ élément</button></div>
      )}
      {p.kind === "associer" && (
        <div>
          <label className="label">Paires à associer</label>
          <ListEditor values={p.pairs} onChange={(v) => f("pairs", v)} render={(v, s) => <div className="grid grid-cols-2 gap-2"><input className="input" value={v[0]} onChange={(e) => s([e.target.value, v[1]])} /><input className="input" value={v[1]} onChange={(e) => s([v[0], e.target.value])} /></div>} />
          <button type="button" className="mt-2 text-sm font-semibold text-indigo-400" onClick={() => add("pairs", ["", ""])}>+ paire</button>
        </div>
      )}
      {p.kind === "classer" && (
        <div className="space-y-2">
          <label className="label">Catégories</label>
          <ListEditor values={p.categories} onChange={(v) => f("categories", v)} />
          <button type="button" className="text-sm font-semibold text-indigo-400" onClick={() => add("categories", "")}>+ catégorie</button>
          <label className="label">Éléments à classer</label>
          <ListEditor values={p.items} onChange={(v) => f("items", v)} render={(v, s) => (
            <div className="flex gap-2"><input className="input" value={v.text} onChange={(e) => s({ ...v, text: e.target.value })} /><select className="rounded-lg border border-slate-300 px-2" value={v.category} onChange={(e) => s({ ...v, category: Number(e.target.value) })}>{p.categories.map((c: string, ci: number) => <option key={ci} value={ci}>{c || `Catégorie ${ci + 1}`}</option>)}</select></div>
          )} />
          <button type="button" className="text-sm font-semibold text-indigo-400" onClick={() => add("items", { text: "", category: 0 })}>+ élément</button>
        </div>
      )}
    </div>
  );
}

export default function ExerciseEditor({ initial, chapters }: { initial: EditorInitial; chapters: ChapterOpt[] }) {
  const router = useRouter();
  const [m, setM] = useState(initial);
  const [s, setS] = useState<Schema>(initial.schema);
  const [preview, setPreview] = useState<{ exercise: PublicExercise; expected: string[]; solution: string[] } | null>(null);
  const [pv, setPv] = useState<unknown[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [json, setJson] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chapOpts = useMemo(() => chapters.filter((c) => c.subject === m.subject && c.level === m.level), [chapters, m.subject, m.level]);
  const notions = chapOpts.find((c) => c.id === m.chapterId)?.notions ?? [];
  const setPart = (i: number, p: Part) => setS({ ...s, parts: s.parts.map((x, j) => (j === i ? p : x)) });
  const clean = (): Schema => ({ ...s, rappel: s.rappel || undefined, figure: s.figure?.src ? s.figure : undefined, solution: s.solution.filter((x) => x.trim()) });

  const doPreview = async () => {
    setErrors([]);
    const r = await fetch("/api/admin/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ schema: clean() }) });
    const d = await r.json();
    if (!r.ok) { setErrors(d.errors ?? [d.error]); setPreview(null); return; }
    setPreview(d);
    setPv(d.exercise.parts.map((p: { interaction: any }) => initValue(p.interaction)));
  };

  const save = async () => {
    setBusy(true); setErrors([]); setMsg("");
    const body = { ...m, schema: clean() };
    const r = await fetch(m.id ? `/api/admin/exercises/${m.id}` : "/api/admin/exercises", { method: m.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setErrors(d.errors ?? [d.error]); return; }
    setMsg("Exercice enregistré.");
    if (!m.id) router.replace(`/admin/exercices/${d.id}`);
    router.refresh();
  };

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) return setErrors([d.error]);
    setS({ ...s, figure: { kind: "image", src: d.url, alt: file.name } });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-5">
        <section className="card space-y-3 p-5">
          <h2 className="font-bold">1. Classement</h2>
          <div><label className="label" htmlFor="t">Titre</label><input id="t" className="input" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} /></div>
          <div><label className="label" htmlFor="su">Résumé</label><input id="su" className="input" value={m.summary} onChange={(e) => setM({ ...m, summary: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label">Matière</label><select className="input" value={m.subject} onChange={(e) => setM({ ...m, subject: e.target.value, chapterId: "", notionId: "" })}><option value="maths">Mathématiques</option><option value="pc">Physique-Chimie</option></select></div>
            <div><label className="label">Niveau</label><select className="input" value={m.level} onChange={(e) => setM({ ...m, level: e.target.value, chapterId: "", notionId: "" })}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
            <div><label className="label">Difficulté</label><select className="input" value={m.difficulty} onChange={(e) => setM({ ...m, difficulty: Number(e.target.value) })}><option value={1}>Facile</option><option value={2}>Moyen</option><option value={3}>Difficile</option></select></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Chapitre</label><select className="input" value={m.chapterId} onChange={(e) => setM({ ...m, chapterId: e.target.value, notionId: "" })}><option value="">— choisir —</option>{chapOpts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            <div><label className="label">Notion</label><select className="input" value={m.notionId} onChange={(e) => setM({ ...m, notionId: e.target.value })} disabled={!notions.length}><option value="">— choisir —</option>{notions.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select>{m.chapterId && !notions.length && <p className="mt-1 text-xs text-amber-700">Ce chapitre n'a pas de notion : créez-en une dans « Chapitres ».</p>}</div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={m.published} onChange={(e) => setM({ ...m, published: e.target.checked })} /> Publié (visible par les élèves)</label>
        </section>

        <div className="flex gap-2"><button type="button" className="btn-ghost" onClick={() => setJson(json === null ? JSON.stringify(clean(), null, 2) : null)}>{json === null ? "Éditer en JSON" : "Revenir au formulaire"}</button></div>

        {json !== null ? (
          <section className="card space-y-2 p-5">
            <textarea className="input h-96 font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} aria-label="Schéma JSON" />
            <button type="button" className="btn-primary" onClick={() => { try { setS(JSON.parse(json)); setJson(null); } catch { setErrors(["JSON invalide."]); } }}>Appliquer</button>
          </section>
        ) : (
          <>
            <section className="card space-y-3 p-5">
              <h2 className="font-bold">2. Énoncé et paramètres aléatoires</h2>
              <p className="text-xs text-slate-500">LaTeX entre <code>$…$</code>. Variables : <code>{"{a}"}</code> ; calculs : <code>{"{{a*b}}"}</code>. Chaque élève reçoit des valeurs différentes.</p>
              <textarea className="input h-28" value={s.statement} onChange={(e) => setS({ ...s, statement: e.target.value })} aria-label="Énoncé" />
              <label className="label">Variables</label>
              <ListEditor values={s.variables} onChange={(v) => setS({ ...s, variables: v })} render={(v, set) => (
                <div className="grid grid-cols-5 gap-2">
                  <input className="input font-mono" value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} aria-label="Nom" placeholder="a" />
                  <input className="input" type="number" step="any" value={v.min} onChange={(e) => set({ ...v, min: Number(e.target.value) })} aria-label="Min" />
                  <input className="input" type="number" step="any" value={v.max} onChange={(e) => set({ ...v, max: Number(e.target.value) })} aria-label="Max" />
                  <input className="input" type="number" step="any" value={v.step ?? 1} onChange={(e) => set({ ...v, step: Number(e.target.value) })} aria-label="Pas" />
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!v.nonZero} onChange={(e) => set({ ...v, nonZero: e.target.checked })} />≠ 0</label>
                </div>
              )} />
              <button type="button" className="text-sm font-semibold text-indigo-400" onClick={() => setS({ ...s, variables: [...s.variables, { name: String.fromCharCode(97 + s.variables.length), min: 1, max: 10 }] })}>+ variable (nom · min · max · pas)</button>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="label">Image (PNG, JPEG, WebP – 2 Mo)</label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-sm" /></div>
                <div><label className="label">ou vidéo (URL YouTube ou .mp4)</label><input className="input" value={s.figure?.kind === "video" ? s.figure.src : ""} onChange={(e) => setS({ ...s, figure: e.target.value ? { kind: "video", src: e.target.value } : undefined })} /></div>
              </div>
              {s.figure && <div className="flex items-center gap-2 text-sm text-slate-600">Média : {s.figure.src} <button type="button" className="text-rose-400" onClick={() => setS({ ...s, figure: undefined })}>retirer</button></div>}
            </section>

            <section className="card space-y-4 p-5">
              <h2 className="font-bold">3. Questions et réponses</h2>
              {s.parts.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                    <select className="rounded-lg border border-slate-300 px-2 py-1 text-sm" value={p.kind} onChange={(e) => setPart(i, newPart(e.target.value))}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <button type="button" className="ml-auto text-sm text-rose-400" onClick={() => setS({ ...s, parts: s.parts.filter((_, j) => j !== i) })} disabled={s.parts.length === 1}>Supprimer</button>
                  </div>
                  <PartEditor p={p} set={(np) => setPart(i, np)} />
                </div>
              ))}
              <button type="button" className="btn-ghost" onClick={() => setS({ ...s, parts: [...s.parts, newPart("numerique")] })}>+ Ajouter une question</button>
            </section>

            <section className="card space-y-3 p-5">
              <h2 className="font-bold">4. Correction détaillée</h2>
              <ListEditor values={s.solution} onChange={(v) => setS({ ...s, solution: v })} placeholder="Étape de la solution (LaTeX et {{calculs}} autorisés)" />
              <button type="button" className="text-sm font-semibold text-indigo-400" onClick={() => setS({ ...s, solution: [...s.solution, ""] })}>+ étape</button>
              <div><label className="label">Rappel de cours</label><input className="input" value={s.rappel ?? ""} onChange={(e) => setS({ ...s, rappel: e.target.value })} /></div>
            </section>
          </>
        )}

        {errors.length > 0 && <ul className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>}
        {msg && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={doPreview}>Aperçu (nouveau tirage)</button>
          <button type="button" className="btn-primary" onClick={save} disabled={busy || !m.title || !m.chapterId || !m.notionId}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <div className="card p-5">
          <h2 className="mb-3 font-bold">Aperçu élève</h2>
          {preview ? (
            <div className="space-y-4">
              <MathText text={preview.exercise.statement} />
              {preview.exercise.figure && <FigureView figure={preview.exercise.figure} />}
              {preview.exercise.parts.map((p, i) => (
                <div key={i} className="space-y-2">
                  {p.prompt && <MathInline text={p.prompt} className="font-medium" />}
                  <Interaction it={p.interaction} value={pv[i]} onChange={(v) => setPv(pv.map((x, j) => (j === i ? v : x)))} locked={false} />
                  <p className="text-xs text-emerald-700">Réponse attendue : <MathInline text={preview.expected[i]} /></p>
                </div>
              ))}
              {preview.solution.length > 0 && <div className="rounded-xl bg-indigo-50 p-3 text-sm"><p className="font-semibold">Correction</p>{preview.solution.map((x, i) => <MathText key={i} text={x} />)}</div>}
            </div>
          ) : <p className="text-sm text-slate-500">Cliquez sur « Aperçu » pour voir l'exercice tel qu'un élève le verra, avec un tirage aléatoire des valeurs.</p>}
        </div>
      </div>
    </div>
  );
}
