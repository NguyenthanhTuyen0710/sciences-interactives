"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ExercisePlayer, { type Loaded, type Mode } from "./ExercisePlayer";

export interface SeriesItem { id: string; difficulty: number; seed: string; points?: number }

/** Enchaîne plusieurs exercices (défi chronométré, sujet d'examen, collection) et calcule une note. */
export default function SeriesPlayer({ items, title, mode, totalTime, intro }: { items: SeriesItem[]; title: string; mode: Mode; totalTime?: number; intro: string }) {
  const [step, setStep] = useState(-1);
  const [current, setCurrent] = useState<Loaded | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(totalTime ?? 0);
  const [error, setError] = useState("");
  const startedAt = useRef(0);
  const finished = step >= items.length;

  useEffect(() => {
    if (step < 0 || finished) return;
    setCurrent(null);
    const it = items[step];
    fetch(`/api/exercises/${it.id}?d=${it.difficulty}&seed=${it.seed}`).then(async (r) => {
      if (!r.ok) throw new Error();
      setCurrent(await r.json());
    }).catch(() => setError("Impossible de charger l'exercice."));
  }, [step, items, finished]);

  useEffect(() => {
    if (!totalTime || step < 0 || finished) return;
    if (remaining <= 0) { setScores((s) => [...s, ...items.slice(s.length).map(() => 0)]); setStep(items.length); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, totalTime, step, finished, items]);

  const points = items.map((i) => i.points ?? 20 / items.length);
  const note = scores.reduce((s, sc, i) => s + sc * points[i], 0);

  if (step < 0)
    return (
      <div className="card mx-auto max-w-2xl space-y-4 p-6 text-center">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="text-slate-600">{intro}</p>
        <p className="text-sm text-slate-500">{items.length} exercices{totalTime ? ` · ${Math.round(totalTime / 60)} minutes` : ""} · note sur 20</p>
        <button className="btn-primary" onClick={() => { startedAt.current = Date.now(); setStep(0); }}>Commencer</button>
      </div>
    );

  if (finished) {
    const mention = note >= 16 ? "Très bien" : note >= 14 ? "Bien" : note >= 12 ? "Assez bien" : note >= 10 ? "Passable" : "Insuffisant";
    return (
      <div className="card mx-auto max-w-2xl space-y-5 p-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Résultat</p>
          <p className="text-5xl font-black text-indigo-700">{note.toFixed(1).replace(".", ",")} <span className="text-2xl text-slate-400">/ 20</span></p>
          <p className="mt-1 font-semibold text-slate-700">{mention}</p>
          <p className="text-sm text-slate-500">Durée : {Math.round((Date.now() - startedAt.current) / 60000)} min</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between py-2 text-sm">
              <span>Exercice {i + 1}</span>
              <span className="font-semibold">{((scores[i] ?? 0) * points[i]).toFixed(1).replace(".", ",")} / {points[i].toFixed(1).replace(".", ",")}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-center gap-2">
          <button className="btn-primary" onClick={() => window.location.reload()}>Nouveau sujet</button>
          <Link href="/mon-espace" className="btn-ghost">Voir ma progression</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold">Exercice {step + 1} / {items.length}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${(step / items.length) * 100}%` }} /></div>
        {totalTime ? <span className={`rounded-lg px-2.5 py-1 font-mono font-bold ${remaining < 60 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span> : null}
        <span className="text-sm text-slate-500">{points[step].toFixed(1).replace(".", ",")} pt</span>
      </div>
      {error && <p className="text-rose-400">{error}</p>}
      {current ? (
        <div>
          <h2 className="mb-2 text-lg font-bold">{current.meta.title}</h2>
          <ExercisePlayer key={`${step}-${current.seed}`} initial={current} mode={mode}
            series={{ nextLabel: step === items.length - 1 ? "Voir ma note →" : "Exercice suivant →", onDone: (sc) => { setScores((s) => [...s, sc]); setStep((x) => x + 1); } }} />
        </div>
      ) : <div className="card h-64 animate-pulse bg-slate-100" />}
    </div>
  );
}
