"use client";
// Mini-évaluation de compréhension (formative, corrigée immédiatement dans le navigateur).
import { useState } from "react";
import { MathInline } from "../MathText";

export interface QuizItem { question: string; options: string[]; answer: number; explanation: string }

export default function MiniQuiz({ items }: { items: QuizItem[] }) {
  const [sel, setSel] = useState<(number | null)[]>(() => items.map(() => null));
  const [done, setDone] = useState(false);
  const score = sel.filter((s, i) => s === items[i].answer).length;
  return (
    <div className="space-y-4">
      {items.map((q, i) => (
        <fieldset key={i} className="space-y-2">
          <legend className="font-medium"><span className="mr-2 text-indigo-600">{i + 1}.</span><MathInline text={q.question} /></legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o, j) => {
              const on = sel[i] === j;
              const tone = !done ? (on ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300") : j === q.answer ? "border-emerald-500 bg-emerald-50" : on ? "border-rose-500 bg-rose-50" : "border-slate-200 opacity-70";
              return (
                <label key={j} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${tone}`}>
                  <input type="radio" className="accent-indigo-600" name={`q${i}`} checked={on} disabled={done} onChange={() => setSel((s) => s.map((x, k) => (k === i ? j : x)))} />
                  <MathInline text={o} />
                </label>
              );
            })}
          </div>
          {done && <p className={`rounded-lg p-2 text-sm ${sel[i] === q.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>{sel[i] === q.answer ? "✔ " : "✘ "}<MathInline text={q.explanation} /></p>}
        </fieldset>
      ))}
      {!done ? (
        <button type="button" className="btn-primary" disabled={sel.some((s) => s === null)} onClick={() => setDone(true)}>Corriger</button>
      ) : (
        <div className="flex flex-wrap items-center gap-3" role="status">
          <span className="text-xl font-black">{score}/{items.length}</span>
          <span className="text-sm text-slate-600">{score === items.length ? "Tu maîtrises l'essentiel du cours." : "Relis les rubriques concernées, puis recommence."}</span>
          <button type="button" className="btn-ghost" onClick={() => { setSel(items.map(() => null)); setDone(false); }}>Recommencer</button>
        </div>
      )}
    </div>
  );
}
