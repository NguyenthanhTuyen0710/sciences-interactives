"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MathText, { MathInline } from "./MathText";
import { Interaction, initValue } from "./interactions";
import { KIND_LABELS } from "@/lib/engine/labels";
import type { PublicExercise } from "@/lib/engine/public";
import type { CheckResult, ExerciseMeta, Figure as Fig } from "@/lib/engine/types";

export type Mode = "libre" | "chrono" | "defi" | "examen" | "collection";
export interface Loaded { meta: ExerciseMeta; seed: string; difficulty: number; exercise: PublicExercise }
type Result = CheckResult & { saved: boolean; recommendedDifficulty: number };

const DIFF = ["", "Facile", "Moyen", "Difficile"];

export function FigureView({ figure }: { figure: Fig }) {
  if (figure.kind === "svg") return <figure className="my-2"><div className="flex justify-center" dangerouslySetInnerHTML={{ __html: figure.svg }} />{figure.caption && <figcaption className="mt-1 text-center text-xs text-slate-500">{figure.caption}</figcaption>}</figure>;
  if (figure.kind === "image")
    // eslint-disable-next-line @next/next/no-img-element
    return <figure className="my-2 text-center"><img src={figure.src} alt={figure.alt} className="mx-auto max-h-80 rounded-lg" />{figure.caption && <figcaption className="mt-1 text-xs text-slate-500">{figure.caption}</figcaption>}</figure>;
  const yt = figure.src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return (
    <figure className="my-2">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        {yt ? <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} title="Vidéo" allowFullScreen /> : <video className="h-full w-full" src={figure.src} controls />}
      </div>
      {figure.caption && <figcaption className="mt-1 text-xs text-slate-500">{figure.caption}</figcaption>}
    </figure>
  );
}

function saveRecent(meta: ExerciseMeta, score: number) {
  try {
    const raw = localStorage.getItem("recents");
    const list: { id: string; title: string; score: number; at: number; level: string; subject: string }[] = raw ? JSON.parse(raw) : [];
    const next = [{ id: meta.id, title: meta.title, score, at: Date.now(), level: meta.level, subject: meta.subject }, ...list.filter((x) => x.id !== meta.id)].slice(0, 8);
    localStorage.setItem("recents", JSON.stringify(next));
  } catch { /* stockage indisponible : on ignore */ }
}

export default function ExercisePlayer({ initial, mode = "libre", series, syncUrl = false, startTimed = false }: {
  initial: Loaded; mode?: Mode; syncUrl?: boolean; startTimed?: boolean;
  series?: { onDone: (score: number, result: Result) => void; nextLabel?: string };
}) {
  const [data, setData] = useState(initial);
  const [values, setValues] = useState<unknown[]>(() => initial.exercise.parts.map((p) => initValue(p.interaction)));
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [timed, setTimed] = useState(startTimed);
  const limit = data.meta.timeLimit ?? 180;
  const [remaining, setRemaining] = useState(limit);
  const started = useRef(Date.now());
  const meta = data.meta;

  const reset = useCallback((d: Loaded) => {
    setData(d);
    setValues(d.exercise.parts.map((p) => initValue(p.interaction)));
    setResult(null);
    setShowSolution(false);
    setError("");
    started.current = Date.now();
    setRemaining(d.meta.timeLimit ?? 180);
  }, []);

  useEffect(() => {
    if (syncUrl) window.history.replaceState(null, "", `?d=${data.difficulty}&seed=${data.seed}`);
  }, [data.seed, data.difficulty, syncUrl]);

  const load = async (difficulty: number, seed?: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/exercises/${meta.id}?d=${difficulty}${seed ? `&seed=${seed}` : ""}`);
      if (!r.ok) throw new Error();
      reset(await r.json());
      setAttempt(1);
    } catch {
      setError("Impossible de charger un nouvel exercice. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const submit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/exercises/${meta.id}/check`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed: data.seed, difficulty: data.difficulty, responses: values, timeSpentSec: (Date.now() - started.current) / 1000, attemptNumber: attempt, mode: timed && mode === "libre" ? "chrono" : mode }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error);
      const res: Result = await r.json();
      setResult(res);
      saveRecent(meta, res.score);
      if (series) setShowSolution(true);
    } catch (e) {
      setError((e as Error).message || "La correction a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, [meta, data, values, attempt, timed, mode, series]);

  // chronomètre
  useEffect(() => {
    if (!timed || result) return;
    if (remaining <= 0) { void submit(); return; }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timed, remaining, result, submit]);

  const answered = useMemo(() => values.filter((v, i) => {
    const k = data.exercise.parts[i].interaction.kind;
    if (k === "ordonner") return true;
    if (Array.isArray(v)) return v.some((x) => x !== null && x !== "");
    if (v && typeof v === "object") return Object.values(v as object).some((x) => x !== null && x !== "" && !(Array.isArray(x) && x.every((y) => y === null)));
    return v !== "" && v !== null;
  }).length, [values, data]);

  const kinds = [...new Set(data.exercise.parts.map((p) => p.interaction.kind))];
  const scorePct = result ? Math.round(result.score * 100) : 0;
  const mm = String(Math.floor(Math.max(0, remaining) / 60)).padStart(1, "0"), ss = String(Math.max(0, remaining) % 60).padStart(2, "0");

  return (
    <div className="card overflow-hidden">
      {/* barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => <span key={k} className="chip bg-white text-slate-600 ring-1 ring-slate-200">{KIND_LABELS[k]}</span>)}
          {meta.randomized === "valeurs" && <span className="chip bg-violet-50 text-violet-700 ring-1 ring-violet-200">Valeurs aléatoires</span>}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {!series && (
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-xs font-semibold" role="group" aria-label="Difficulté">
              {[1, 2, 3].map((d) => (
                <button key={d} type="button" disabled={loading} onClick={() => load(d)} aria-pressed={data.difficulty === d}
                  className={`px-2.5 py-1.5 ${data.difficulty === d ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{DIFF[d]}</button>
              ))}
            </div>
          )}
          {!series && mode === "libre" && (
            <button type="button" onClick={() => { setTimed(!timed); setRemaining(limit); started.current = Date.now(); }} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${timed ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-300 bg-white text-slate-600"}`}>
              ⏱ {timed ? "Chrono activé" : "Mode chronométré"}
            </button>
          )}
          {timed && !result && (
            <span className={`rounded-lg px-2.5 py-1.5 font-mono text-sm font-bold ${remaining <= 15 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`} aria-live="polite">{mm}:{ss}</span>
          )}
        </div>
      </div>

      {/* progression des réponses */}
      <div className="h-1.5 bg-slate-100" aria-hidden>
        <div className={`h-full transition-all ${result ? (result.score === 1 ? "bg-emerald-500" : "bg-amber-500") : "bg-indigo-500"}`} style={{ width: `${result ? scorePct : (answered / data.exercise.parts.length) * 100}%` }} />
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <MathText text={data.exercise.statement} className="text-[1.05rem] leading-relaxed text-slate-800" />
        {data.exercise.figure && <FigureView figure={data.exercise.figure} />}

        {data.exercise.parts.map((p, i) => {
          const r = result?.parts[i];
          return (
            <section key={`${data.seed}-${i}`} data-part={i} className="space-y-3">
              {(p.prompt || data.exercise.parts.length > 1) && (
                <div className="flex gap-2">
                  {data.exercise.parts.length > 1 && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>}
                  {p.prompt && <MathInline text={p.prompt} className="font-medium text-slate-800" />}
                </div>
              )}
              <Interaction it={p.interaction} value={values[i]} onChange={(v) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)))} result={r} locked={!!result || loading} />
              {r && (
                <div className={`animate-pop rounded-xl border-l-4 p-3 text-sm ${r.status === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : r.status === "partiel" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-rose-500 bg-rose-50 text-rose-900"}`}>
                  <p className="font-semibold">{r.status === "correct" ? "✔ Bonne réponse !" : r.status === "partiel" ? "◐ Réponse partiellement juste" : "✘ Réponse incorrecte"}</p>
                  {r.feedback.map((f, k) => <p key={k} className="mt-1"><MathInline text={f} /></p>)}
                  {r.status !== "correct" && showSolution && <p className="mt-1">Réponse attendue : <MathInline text={r.expected} /></p>}
                </div>
              )}
            </section>
          );
        })}

        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}

        {/* actions */}
        {!result ? (
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? "Correction…" : "Valider"}</button>
            {!series && <button className="btn-ghost" onClick={() => load(data.difficulty)} disabled={loading}>↻ Autre exercice</button>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex flex-wrap items-center gap-4 rounded-2xl p-4 ${result.score === 1 ? "bg-emerald-600 text-white" : result.score >= 0.5 ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-900"}`}>
              <div className="text-3xl font-black">{scorePct} %</div>
              <div className="flex-1 text-sm">
                <p className="font-semibold">{result.score === 1 ? "Excellent, tout est juste !" : result.score >= 0.5 ? "Pas mal ! Regardez la correction pour progresser." : "Ce n'est pas encore ça : la correction détaillée va vous aider."}</p>
                <p className="opacity-80">Tentative n° {attempt} · {result.saved ? "résultat enregistré dans Mon espace" : "connectez-vous pour enregistrer vos résultats"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {series ? (
                <button className="btn-primary" onClick={() => series.onDone(result.score, result)}>{series.nextLabel ?? "Question suivante →"}</button>
              ) : (
                <>
                  <button className="btn-ghost" onClick={() => setShowSolution((s) => !s)}>{showSolution ? "Masquer la correction" : "Voir la correction détaillée"}</button>
                  <button className="btn-ghost" onClick={() => { setAttempt((a) => a + 1); reset({ ...data }); }}>Réessayer le même</button>
                  <button className="btn-primary" onClick={() => load(result.recommendedDifficulty)}>
                    Nouvel exercice{result.recommendedDifficulty !== data.difficulty ? ` · niveau ${DIFF[result.recommendedDifficulty].toLowerCase()} conseillé` : ""} →
                  </button>
                </>
              )}
            </div>

            {showSolution && (
              <div className="animate-pop space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                <h3 className="font-bold text-indigo-900">Correction détaillée</h3>
                <ol className="space-y-2">
                  {result.solution.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
                      <MathText text={s} className="flex-1 text-slate-800" />
                    </li>
                  ))}
                </ol>
                {result.rappel && (
                  <div className="rounded-xl bg-white p-3 text-sm ring-1 ring-indigo-100">
                    <span className="font-semibold text-indigo-800">📘 Rappel de cours : </span><MathInline text={result.rappel} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
