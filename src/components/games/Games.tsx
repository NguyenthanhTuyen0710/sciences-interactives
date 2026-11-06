"use client";
// Modèles de jeux pédagogiques réutilisables, pilotés par la configuration du chapitre.
// Tous : objectif affiché, consignes, rétroaction expliquée, recommencer, adaptation, progression,
// clavier + souris/tactile. Meilleur score mémorisé localement (confort ; ne bloque rien s'il échoue).
// Les jeux sont montés uniquement dans le navigateur : leur tirage aléatoire ne doit pas différer du rendu serveur.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MathInline } from "../MathText";
import type { ChapterGame } from "@/lib/chapters/schema";
import { adapt, calcFeedback, calcQuestion, frRel, gameRng, lineFeedback, lineRound, parseRel, type Adapt, type CalcLevel, type CalcQuestion, type LineLevel, type LineRound } from "@/lib/games/logic";
import { randomSeed } from "@/lib/engine/rng";
import type { Rng } from "@/lib/engine/types";

type Fb = { ok: boolean; message: string };
const FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1";

/** Meilleur résultat mémorisé localement ; `lowerIsBetter` pour un nombre d'essais. */
function useBest(key: string, lowerIsBetter = false) {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    try { const v = localStorage.getItem(`jeu:${key}`); if (v) setBest(Number(v)); } catch { /* indisponible */ }
  }, [key]);
  const record = useCallback((score: number) => {
    setBest((b) => {
      const nb = b === null ? score : lowerIsBetter ? Math.min(b, score) : Math.max(b, score);
      try { localStorage.setItem(`jeu:${key}`, String(nb)); } catch { /* indisponible */ }
      return nb;
    });
  }, [key, lowerIsBetter]);
  return { best, record };
}

function Shell({ game, score, level, maxLevel, best, onRestart, children }: {
  game: ChapterGame; score: string; level?: number; maxLevel?: number; best?: string; onRestart?: () => void; children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden" aria-labelledby={`${game.id}-t`}>
      <header className="space-y-1 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={`${game.id}-t`} className="text-lg font-bold">{game.title}</h3>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs font-semibold">
            {level !== undefined && <span className="chip bg-violet-100 text-violet-800">Niveau {level}/{maxLevel}</span>}
            <span className="chip bg-indigo-100 text-indigo-800" aria-live="polite">{score}</span>
            {best && <span className="chip bg-amber-100 text-amber-800">Record : {best}</span>}
            {onRestart && <button type="button" className="btn-ghost px-2.5 py-1 text-xs" onClick={onRestart}>↺ Recommencer</button>}
          </div>
        </div>
        <p className="text-sm text-slate-600"><span className="font-semibold">Objectif : </span>{game.objective}</p>
        <p className="text-sm text-slate-600"><span className="font-semibold">Consigne : </span><MathInline text={game.instructions} /></p>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Feedback({ fb }: { fb: Fb | null }) {
  if (!fb) return null;
  return <p role="status" className={`animate-pop rounded-xl border-l-4 p-3 text-sm ${fb.ok ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-rose-500 bg-rose-50 text-rose-900"}`}>{fb.ok ? "✔ " : "✘ "}<MathInline text={fb.message} /></p>;
}

function Finished({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-2xl font-black">{score}/{total}</p>
      <p className="text-slate-600">{score === total ? "Parfait !" : score >= total * 0.7 ? "Bien joué ! Rejoue pour viser le sans-faute." : "Relis la partie du cours concernée puis réessaie."}</p>
      <button type="button" className="btn-primary" onClick={onRestart}>Rejouer</button>
    </div>
  );
}

// ───────── Droite graduée ─────────
function DroiteGraduee({ game }: { game: ChapterGame }) {
  const levels = game.config.levels as LineLevel[];
  const rounds = (game.config.rounds as number) ?? 12;
  const rng = useRef<Rng>(gameRng(randomSeed()));
  const [ad, setAd] = useState<Adapt>({ level: 1, streak: 0, misses: 0 });
  const [round, setRound] = useState<LineRound>(() => lineRound(rng.current, levels[0]));
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [fb, setFb] = useState<Fb | null>(null);
  const [notice, setNotice] = useState("");
  const [moved, setMoved] = useState(false); // le focus n'est déplacé qu'après une action de l'élève
  const { best, record } = useBest(game.id);
  const svgRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const lv = round.level;
  const W = 480, pad = 24, count = Math.round((lv.max - lv.min) / lv.step);
  const xOf = (v: number) => pad + ((v - lv.min) / (lv.max - lv.min)) * (W - 2 * pad);
  const done = n >= rounds;
  const snap = (v: number) => Math.round(Math.min(lv.max, Math.max(lv.min, v)) * 1000) / 1000;

  useEffect(() => { if (fb) nextRef.current?.focus(); }, [fb]);
  useEffect(() => {
    if (!moved || fb || done) return;
    if (round.type === "placer") svgRef.current?.focus(); else inputRef.current?.focus();
  }, [round, moved, fb, done]);

  const restart = () => { rng.current = gameRng(randomSeed()); setAd({ level: 1, streak: 0, misses: 0 }); setRound(lineRound(rng.current, levels[0])); setN(0); setScore(0); setCursor(null); setTyped(""); setFb(null); setNotice(""); };
  const validate = () => {
    if (fb) return;
    const ans = round.type === "placer" ? cursor : parseRel(typed);
    if (ans === null) { setNotice(round.type === "placer" ? "Place d'abord le point (clic, toucher ou boutons ← →)." : "Écris un nombre, par exemple −3 ou 2,5."); return; }
    setNotice("");
    const r = lineFeedback(round.target, ans, lv.step);
    setFb(r);
    if (r.ok) setScore((s) => s + 1);
    setAd((a) => adapt(a, r.ok, levels.length));
  };
  const next = () => {
    const nn = n + 1;
    setN(nn);
    if (nn >= rounds) record(score);
    setRound(lineRound(rng.current, levels[ad.level - 1]));
    setCursor(null); setTyped(""); setFb(null); setMoved(true);
  };
  const move = (dir: 1 | -1) => { if (!fb) { setNotice(""); setCursor((c) => snap((c ?? 0) + dir * lv.step)); } };
  const onKey = (e: React.KeyboardEvent) => {
    if (round.type !== "placer" || fb) return;
    if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    if (e.key === "Enter") { e.preventDefault(); validate(); }
  };
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (round.type !== "placer" || fb) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const k = Math.round(((x - pad) / (W - 2 * pad)) * count);
    setNotice("");
    setCursor(snap(lv.min + Math.max(0, Math.min(count, k)) * lv.step));
  };
  const shown = round.type === "lire" ? round.target : cursor;
  const labelEvery = count > 12 ? 2 : 1;

  return (
    <Shell game={game} score={`Score : ${score}/${rounds}`} level={ad.level} maxLevel={levels.length} best={best !== null ? `${best}/${rounds}` : undefined} onRestart={restart}>
      {done ? <Finished score={score} total={rounds} onRestart={restart} /> : (
        <div className="space-y-3">
          <p className="font-medium" aria-live="polite">Manche {n + 1}/{rounds} — {round.type === "placer" ? <>Place le point <strong>M</strong> d'abscisse <strong>{frRel(round.target)}</strong>.</> : <>Lis l'abscisse du point <strong>M</strong>.</>}</p>
          <svg ref={svgRef} viewBox={`0 0 ${W} 104`} className={`w-full touch-manipulation select-none rounded-lg bg-white ring-1 ring-slate-200 ${FOCUS}`}
            role={round.type === "placer" ? "slider" : "img"} tabIndex={round.type === "placer" ? 0 : -1} onKeyDown={onKey} onClick={onClick}
            aria-label={round.type === "placer" ? "Droite graduée : utilise les flèches gauche et droite pour déplacer le point, Entrée pour valider" : "Droite graduée avec le point M"}
            aria-valuemin={lv.min} aria-valuemax={lv.max} aria-valuenow={cursor ?? undefined} aria-valuetext={cursor === null ? "aucun point placé" : `abscisse ${frRel(cursor)}`}>
            <line x1={pad - 10} y1={52} x2={W - pad + 14} y2={52} stroke="#0f172a" strokeWidth={2} />
            <polygon points={`${W - pad + 14},52 ${W - pad + 4},46 ${W - pad + 4},58`} fill="#0f172a" />
            {Array.from({ length: count + 1 }, (_, k) => {
              const v = Math.round((lv.min + k * lv.step) * 1000) / 1000;
              const zero = Math.abs(v) < 1e-9;
              const lab = zero || (k % labelEvery === 0 && (round.type === "placer" || k === 0 || k === count));
              return (
                <g key={k}>
                  <line x1={xOf(v)} y1={zero ? 38 : 44} x2={xOf(v)} y2={zero ? 66 : 60} stroke={zero ? "#4f46e5" : "#334155"} strokeWidth={zero ? 3 : 1.6} />
                  {lab && <text x={xOf(v)} y={88} textAnchor="middle" fontSize={17} fill={zero ? "#4f46e5" : "#334155"} fontWeight={zero ? 700 : 400}>{frRel(v)}</text>}
                </g>
              );
            })}
            {shown !== null && (
              <g>
                <circle cx={xOf(shown)} cy={52} r={9} fill={fb ? (fb.ok ? "#10b981" : "#e11d48") : "#f59e0b"} stroke="#fff" strokeWidth={2} />
                <text x={xOf(shown)} y={26} textAnchor="middle" fontSize={19} fontWeight={700}>M</text>
              </g>
            )}
            {fb && !fb.ok && round.type === "placer" && <circle cx={xOf(round.target)} cy={52} r={9} fill="none" stroke="#10b981" strokeWidth={3} />}
          </svg>
          {round.type === "placer" ? (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-ghost px-4 text-lg" onClick={() => move(-1)} disabled={!!fb} aria-label="Déplacer le point d'une graduation vers la gauche">←</button>
              <button type="button" className="btn-ghost px-4 text-lg" onClick={() => move(1)} disabled={!!fb} aria-label="Déplacer le point d'une graduation vers la droite">→</button>
              <p className="text-xs text-slate-500">Touche la droite, ou utilise ← → puis Entrée. Chaque graduation vaut {frRel(lv.step)}.</p>
            </div>
          ) : (
            <label className="flex flex-wrap items-center gap-2 text-sm">Abscisse de M :
              <input ref={inputRef} className="input w-32" inputMode="text" autoComplete="off" value={typed} disabled={!!fb} onChange={(e) => { setTyped(e.target.value); setNotice(""); }} onKeyDown={(e) => { if (e.key === "Enter") validate(); }} />
              <span className="text-xs text-slate-500">(graduation : {frRel(lv.step)})</span>
            </label>
          )}
          {notice && <p role="status" className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{notice}</p>}
          <Feedback fb={fb} />
          {fb
            ? <button key="next" ref={nextRef} type="button" className="btn-primary" onClick={next}>{n + 1 >= rounds ? "Voir le résultat" : "Manche suivante →"}</button>
            : <button key="validate" type="button" className="btn-primary" onClick={validate}>Valider</button>}
        </div>
      )}
    </Shell>
  );
}

// ───────── Calcul mental (chronométré ou entraînement) ─────────
interface LogLine { tex: string; given: string; ok: boolean; answer: number }
function CalculMental({ game }: { game: ChapterGame }) {
  const levels = game.config.levels as CalcLevel[];
  const duration = (game.config.duration as number) ?? 90;
  const practiceCount = (game.config.practiceCount as number) ?? 20;
  const rng = useRef<Rng>(gameRng(randomSeed()));
  const [mode, setMode] = useState<"chrono" | "entrainement" | null>(null);
  const [phase, setPhase] = useState<"accueil" | "jeu" | "fin">("accueil");
  const [left, setLeft] = useState(duration);
  const [ad, setAd] = useState<Adapt>({ level: 1, streak: 0, misses: 0 });
  const [q, setQ] = useState<CalcQuestion | null>(null);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const [fb, setFb] = useState<Fb | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const { best, record } = useBest(game.id);
  const input = useRef<HTMLInputElement>(null);
  const endAt = useRef(0);
  const counts = useRef({ score: 0, asked: 0 });

  const finish = useCallback(() => {
    setPhase("fin");
    if (mode === "chrono" && counts.current.asked > 0) record(counts.current.score);
  }, [mode, record]);

  // Chronomètre fondé sur l'heure de fin : indépendant du rythme des réponses.
  useEffect(() => {
    if (phase !== "jeu" || mode !== "chrono") return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) finish();
    }, 250);
    return () => clearInterval(t);
  }, [phase, mode, finish]);

  const start = (m: "chrono" | "entrainement") => {
    rng.current = gameRng(randomSeed());
    counts.current = { score: 0, asked: 0 };
    setMode(m); setQ(calcQuestion(rng.current, levels[0])); setAd({ level: 1, streak: 0, misses: 0 });
    setScore(0); setAsked(0); setLog([]); setFb(null); setTyped(""); setLeft(duration);
    endAt.current = Date.now() + duration * 1000;
    setPhase("jeu");
    setTimeout(() => input.current?.focus(), 0);
  };
  const submit = () => {
    if (!q) return;
    const v = parseRel(typed);
    if (v === null) { setFb({ ok: false, message: "Écris un nombre relatif, par exemple −7 ou 3." }); return; }
    const r = calcFeedback(q, v);
    const result = `$${q.tex} = ${frRel(q.answer)}$`;
    setFb({ ok: r.ok, message: r.ok ? `${result}` : `Calcul précédent : ${result} (ta réponse : ${typed}). ${r.message}` });
    counts.current = { score: counts.current.score + (r.ok ? 1 : 0), asked: counts.current.asked + 1 };
    setAsked(counts.current.asked); setScore(counts.current.score);
    setLog((l) => [...l, { tex: q.tex, given: typed, ok: r.ok, answer: q.answer }]);
    const na = adapt(ad, r.ok, levels.length);
    setAd(na);
    setTyped("");
    if (mode === "entrainement" && counts.current.asked >= practiceCount) { finish(); return; }
    setQ(calcQuestion(rng.current, levels[na.level - 1]));
    input.current?.focus();
  };
  const restart = () => { setPhase("accueil"); setFb(null); };

  return (
    <Shell game={game} score={`Score : ${score}/${asked}`} level={phase === "accueil" ? undefined : ad.level} maxLevel={levels.length} best={best !== null ? `${best} (chrono)` : undefined} onRestart={restart}>
      {phase === "accueil" && (
        <div className="space-y-3 text-center">
          <p className="text-slate-600">Le niveau s'adapte à tes réussites. Commence par l'entraînement si les règles ne sont pas encore sûres.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn-ghost" onClick={() => start("entrainement")}>Entraînement sans chrono ({practiceCount} calculs)</button>
            <button type="button" className="btn-primary" onClick={() => start("chrono")}>Défi chronométré ({duration} s)</button>
          </div>
        </div>
      )}
      {phase === "jeu" && q && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            {mode === "chrono"
              ? <span className={`rounded-lg px-2.5 py-1 font-mono font-bold ${left <= 10 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>⏱ {left} s</span>
              : <span className="text-slate-500">Calcul {asked + 1}/{practiceCount}</span>}
            <span className="sr-only" role="status">{mode === "chrono" && left === 10 ? "Plus que 10 secondes" : ""}</span>
          </div>
          <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <span className="text-2xl"><MathInline text={`$${q.tex} =$`} /></span>
            <input ref={input} className="input w-32 text-lg" inputMode="text" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Ton résultat" />
            <button className="btn-primary" type="submit">OK</button>
          </form>
          <Feedback fb={fb} />
        </div>
      )}
      {phase === "fin" && (
        <div className="space-y-3">
          {asked === 0 ? (
            <div className="space-y-3 text-center"><p className="font-semibold">Temps écoulé : aucune réponse.</p><button type="button" className="btn-primary" onClick={restart}>Rejouer</button></div>
          ) : <Finished score={score} total={asked} onRestart={restart} />}
          {log.some((l) => !l.ok) && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><p className="mb-1 font-semibold">À revoir :</p>
              <ul className="space-y-1">{log.filter((l) => !l.ok).map((l, i) => <li key={i}><MathInline text={`$${l.tex} = ${frRel(l.answer)}$`} /> <span className="text-slate-500">(ta réponse : {l.given})</span></li>)}</ul>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

// ───────── Chasse aux erreurs ─────────
interface ErrItem { niveau: number; calc: string; correct: boolean; errors?: string[]; error?: number; explanation: string }
function ChasseErreurs({ game }: { game: ChapterGame }) {
  const all = game.config.items as ErrItem[];
  const [seed, setSeed] = useState(randomSeed);
  // Ordre par niveau croissant, mélangé dans un niveau ; options d'erreur mélangées (l'indice correct suit).
  const items = useMemo(() => {
    const r = gameRng(seed);
    return [...new Set(all.map((i) => i.niveau))].sort().flatMap((lv) => r.shuffle(all.filter((i) => i.niveau === lv))).map((it) => {
      if (!it.errors) return it;
      const order = r.shuffle(it.errors.map((_, i) => i));
      return { ...it, errors: order.map((i) => it.errors![i]), error: order.indexOf(it.error!) };
    });
  }, [all, seed]);
  const [k, setK] = useState(0);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [fb, setFb] = useState<Fb | null>(null);
  const [score, setScore] = useState(0);
  const { best, record } = useBest(game.id);
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (fb) nextRef.current?.focus(); }, [fb]);
  const it = items[k];
  const done = k >= items.length;
  const restart = () => { setSeed(randomSeed()); setK(0); setVerdict(null); setChoice(null); setFb(null); setScore(0); };
  const judge = (v: boolean) => {
    if (fb) return;
    setVerdict(v);
    if (v === it.correct && it.correct) { setFb({ ok: true, message: it.explanation }); setScore((s) => s + 1); }
    else if (v !== it.correct) setFb({ ok: false, message: (it.correct ? "Ce calcul est juste. " : "Ce calcul contient une erreur. ") + it.explanation });
  };
  const pick = (i: number) => {
    if (fb) return;
    setChoice(i);
    const ok = i === it.error;
    setFb({ ok, message: (ok ? "Bien vu : " : `L'erreur était : « ${it.errors![it.error!]} ». `) + it.explanation });
    if (ok) setScore((s) => s + 1);
  };
  const next = () => { const nk = k + 1; setK(nk); setVerdict(null); setChoice(null); setFb(null); if (nk >= items.length) record(score); };
  return (
    <Shell game={game} score={`Score : ${score}/${items.length}`} level={done ? undefined : it.niveau} maxLevel={Math.max(...all.map((i) => i.niveau))} best={best !== null ? `${best}/${items.length}` : undefined} onRestart={restart}>
      {done ? <Finished score={score} total={items.length} onRestart={restart} /> : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Calcul {k + 1}/{items.length}</p>
          <div className="rounded-xl bg-slate-50 p-4 text-lg"><MathInline text={it.calc} /></div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ce calcul est-il juste ?">
            <button type="button" className={`btn-ghost ${verdict === true ? "ring-2 ring-indigo-500" : ""}`} onClick={() => judge(true)} disabled={verdict !== null}>✔ Juste</button>
            <button type="button" className={`btn-ghost ${verdict === false ? "ring-2 ring-indigo-500" : ""}`} onClick={() => judge(false)} disabled={verdict !== null}>✘ Il y a une erreur</button>
          </div>
          {verdict === false && !it.correct && !fb && (
            <div className="space-y-2"><p className="font-medium">Quelle est l'erreur ?</p>
              <div className="grid gap-2 sm:grid-cols-2">{it.errors!.map((e, i) => <button key={i} type="button" className={`rounded-xl border-2 px-3 py-2 text-left text-sm ${FOCUS} ${choice === i ? "border-indigo-500" : "border-slate-200 hover:border-indigo-300"}`} onClick={() => pick(i)}><MathInline text={e} /></button>)}</div>
            </div>
          )}
          <Feedback fb={fb} />
          {fb && <button ref={nextRef} type="button" className="btn-primary" onClick={next}>{k + 1 >= items.length ? "Voir le résultat" : "Suivant →"}</button>}
        </div>
      )}
    </Shell>
  );
}

// ───────── Memory (paires notion ↔ valeur/définition) ─────────
function Memory({ game }: { game: ChapterGame }) {
  const pairs = game.config.pairs as [string, string][];
  const [seed, setSeed] = useState(randomSeed);
  const cards = useMemo(() => gameRng(seed).shuffle(pairs.flatMap(([a, b], i) => [{ pair: i, text: a }, { pair: i, text: b }])), [pairs, seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [tries, setTries] = useState(0);
  const [fb, setFb] = useState<Fb | null>(null);
  const { best, record } = useBest(game.id, true); // record = plus petit nombre d'essais
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const done = found.size === pairs.length;
  const restart = () => { if (timer.current) clearTimeout(timer.current); setSeed(randomSeed()); setOpen([]); setFound(new Set()); setTries(0); setFb(null); };
  const flip = (i: number) => {
    if (found.has(cards[i].pair) || open.includes(i) || open.length === 2) return;
    const o = [...open, i];
    setOpen(o);
    if (o.length === 2) {
      const t = tries + 1;
      setTries(t);
      const [a, b] = o.map((x) => cards[x]);
      if (a.pair === b.pair) {
        const nf = new Set(found).add(a.pair);
        setFound(nf); setOpen([]);
        setFb({ ok: true, message: `Paire trouvée : ${pairs[a.pair][0]} ↔ ${pairs[a.pair][1]}` });
        if (nf.size === pairs.length) record(t);
      } else {
        setFb({ ok: false, message: "Ces deux cartes ne vont pas ensemble. Mémorise leur place !" });
        timer.current = setTimeout(() => setOpen([]), 1200);
      }
    }
  };
  return (
    <Shell game={game} score={`Paires : ${found.size}/${pairs.length} · Essais : ${tries}`} best={best !== null ? `${best} essais` : undefined} onRestart={restart}>
      <p className="mb-2 text-xs text-slate-500">Il faut au minimum {pairs.length} essais ; moins tu en utilises, meilleur est ton record.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c, i) => {
          const isFound = found.has(c.pair);
          const visible = open.includes(i) || isFound;
          return (
            <button key={`${seed}-${i}`} type="button" onClick={() => flip(i)} disabled={isFound} aria-label={visible ? undefined : `Carte ${i + 1}, face cachée`}
              className={`grid min-h-16 place-items-center rounded-xl border-2 p-2 text-center text-sm transition ${FOCUS} ${isFound ? "border-emerald-400 bg-emerald-50" : visible ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-100 hover:border-indigo-300"}`}>
              {visible ? <span><MathInline text={c.text} />{isFound && <span className="sr-only"> (paire trouvée)</span>}</span> : <span aria-hidden className="text-xl text-slate-400">?</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3"><Feedback fb={fb} /></div>
      {done && <p className="mt-3 text-center font-semibold text-emerald-700">Toutes les paires ont été trouvées en {tries} essais !</p>}
    </Shell>
  );
}

export default function ChapterGameView({ game }: { game: ChapterGame }) {
  // Montage côté navigateur uniquement (tirages aléatoires) ; le serveur rend un emplacement réservé.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Shell game={game} score="Chargement…"><p className="text-sm text-slate-500">Chargement de l'activité…</p></Shell>;
  switch (game.template) {
    case "droite-graduee": return <DroiteGraduee game={game} />;
    case "calcul-mental": return <CalculMental game={game} />;
    case "chasse-erreurs": return <ChasseErreurs game={game} />;
    case "memory": return <Memory game={game} />;
    default: return <p className="text-sm text-slate-500">Activité indisponible.</p>;
  }
}
