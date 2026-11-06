"use client";
// Leçon animée interactive (équivalent d'une « vidéo interactive ») : une animation pilotée par une
// tête de lecture, qui se met en pause aux points de question. Fonctionne aussi avec une vraie vidéo.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MathInline } from "./MathText";

export interface Cue { t: number; question: string; options: string[]; answer: number; explanation: string }
export interface Scene { title: string; duration: number; render: (p: number) => ReactNode; caption: string }
export interface LessonDef { slug: string; title: string; level: string; subject: "maths" | "pc"; scenes: Scene[]; cues: Cue[] }

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (p: number, a: number, b: number) => ease((p - a) / (b - a));

// ───────────── Leçon 1 : Pythagore ─────────────
const O = { x: 130, y: 250 }; // angle droit
const A = { x: 130, y: 130 }, C = { x: 290, y: 250 }; // côtés 3 (120px) et 4 (160px) → 5 (200px)
function squareOn(P: { x: number; y: number }, Q: { x: number; y: number }, k: number, fill: string, label: string) {
  // carré construit vers l'extérieur sur [PQ], « poussé » selon k ∈ [0,1]
  const dx = Q.x - P.x, dy = Q.y - P.y;
  const nx = dy * k, ny = -dx * k;
  const pts = [P, Q, { x: Q.x + nx, y: Q.y + ny }, { x: P.x + nx, y: P.y + ny }];
  const cx = (P.x + Q.x) / 2 + nx / 2, cy = (P.y + Q.y) / 2 + ny / 2;
  return (
    <g>
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={fill} fillOpacity={0.35} stroke={fill} strokeWidth={2} />
      {k > 0.95 && <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">{label}</text>}
    </g>
  );
}

const PYTHAGORE: LessonDef = {
  slug: "pythagore", title: "Le théorème de Pythagore en animation", level: "4e", subject: "maths",
  scenes: [
    { title: "Un triangle rectangle", duration: 6, caption: "Voici un triangle rectangle en B. Le côté opposé à l'angle droit, [AC], s'appelle l'hypoténuse : c'est le plus long côté.",
      render: (p) => (
        <g>
          <polygon points={`${A.x},${A.y} ${O.x},${O.y} ${C.x},${C.y}`} fill="#dbeafe" stroke="#2563eb" strokeWidth={3} strokeDasharray={600} strokeDashoffset={600 * (1 - seg(p, 0, 0.6))} />
          <polyline points={`${O.x},${O.y - 16} ${O.x + 16},${O.y - 16} ${O.x + 16},${O.y}`} fill="none" stroke="#0f172a" opacity={seg(p, 0.5, 0.7)} />
          <g opacity={seg(p, 0.6, 0.8)} fontSize="20" fontWeight="700"><text x={A.x - 22} y={A.y}>A</text><text x={O.x - 22} y={O.y + 18}>B</text><text x={C.x + 8} y={C.y + 18}>C</text></g>
          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#dc2626" strokeWidth={5} opacity={seg(p, 0.8, 1)} />
          <text x={225} y={175} fill="#dc2626" fontWeight="700" opacity={seg(p, 0.8, 1)}>hypoténuse</text>
        </g>
      ) },
    { title: "Des carrés sur chaque côté", duration: 7, caption: "Construisons un carré sur chacun des trois côtés. AB = 3, BC = 4 et AC = 5 (en unités).",
      render: (p) => (
        <g>
          {squareOn(O, A, seg(p, 0, 0.3), "#f59e0b", "9")}
          {squareOn(C, O, seg(p, 0.3, 0.6), "#10b981", "16")}
          {squareOn(A, C, seg(p, 0.6, 0.9), "#6366f1", "25")}
          <polygon points={`${A.x},${A.y} ${O.x},${O.y} ${C.x},${C.y}`} fill="#fff" stroke="#2563eb" strokeWidth={3} />
          <text x={O.x - 20} y={(A.y + O.y) / 2 + 6} fontSize="18" fontWeight="700">3</text>
          <text x={(O.x + C.x) / 2} y={O.y + 22} fontSize="18" fontWeight="700">4</text>
          <text x={(A.x + C.x) / 2 + 6} y={(A.y + C.y) / 2 - 2} fontSize="18" fontWeight="700">5</text>
        </g>
      ) },
    { title: "Comparer les aires", duration: 7, caption: "Les aires des deux petits carrés valent 3² = 9 et 4² = 16. Leur somme est égale à l'aire du grand carré : 5² = 25.",
      render: (p) => (
        <g fontWeight="800">
          <rect x={60} y={120 - 20 * seg(p, 0, 0.3)} width={60} height={60} fill="#f59e0b" fillOpacity={0.5} />
          <text x={90} y={158 - 20 * seg(p, 0, 0.3)} textAnchor="middle" fontSize="20">9</text>
          <text x={150} y={158} textAnchor="middle" fontSize="28" opacity={seg(p, 0.2, 0.35)}>+</text>
          <rect x={180} y={110} width={80} height={80} fill="#10b981" fillOpacity={0.5} opacity={seg(p, 0.25, 0.45)} />
          <text x={220} y={158} textAnchor="middle" fontSize="20" opacity={seg(p, 0.25, 0.45)}>16</text>
          <text x={295} y={158} textAnchor="middle" fontSize="28" opacity={seg(p, 0.5, 0.6)}>=</text>
          <rect x={325} y={100} width={100} height={100} fill="#6366f1" fillOpacity={0.5} opacity={seg(p, 0.55, 0.75)} />
          <text x={375} y={158} textAnchor="middle" fontSize="22" opacity={seg(p, 0.55, 0.75)}>25</text>
        </g>
      ) },
    { title: "Le théorème", duration: 6, caption: "Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
      render: (p) => (
        <g>
          <foreignObject x={20} y={90} width={440} height={120} opacity={seg(p, 0, 0.4)}>
            <div style={{ fontSize: 30, textAlign: "center", color: "#1e293b" }}><MathInline text="$AC^2 = AB^2 + BC^2$" /></div>
            <div style={{ fontSize: 20, textAlign: "center", color: "#64748b", marginTop: 12, opacity: seg(p, 0.4, 0.8) }}><MathInline text="$5^2 = 3^2 + 4^2 \iff 25 = 9 + 16$" /></div>
          </foreignObject>
        </g>
      ) },
  ],
  cues: [
    { t: 6, question: "Dans le triangle ABC rectangle en B, quelle est l'hypoténuse ?", options: ["[AB]", "[BC]", "[AC]"], answer: 2, explanation: "L'hypoténuse est le côté opposé à l'angle droit B : c'est [AC]." },
    { t: 13, question: "Quelle est l'aire du carré construit sur [AB], de côté 3 ?", options: ["6", "9", "12"], answer: 1, explanation: "Aire d'un carré de côté 3 : $3^2 = 3 \\times 3 = 9$." },
    { t: 26, question: "Un triangle est rectangle ; ses côtés de l'angle droit mesurent 6 cm et 8 cm. Son hypoténuse mesure :", options: ["10 cm", "14 cm", "48 cm"], answer: 0, explanation: "$6^2 + 8^2 = 36 + 64 = 100$, donc l'hypoténuse mesure $\\sqrt{100} = 10$ cm." },
  ],
};

// ───────────── Leçon 2 : états de la matière ─────────────
function particles(state: number, t: number) {
  // state : 0 = solide, 1 = liquide, 2 = gaz (interpolation continue)
  const out: ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    const gx = 170 + (i % 6) * 24, gy = 230 - Math.floor(i / 6) * 24;
    const lx = 130 + ((i * 37) % 220), ly = 245 - ((i * 13) % 80);
    const gxx = 80 + ((i * 53) % 320) + 20 * Math.sin(t * 2 + i), gyy = 60 + ((i * 71) % 190) + 20 * Math.cos(t * 1.7 + i);
    const w1 = Math.min(1, state), w2 = Math.max(0, state - 1);
    const jit = (1 + state * 3) * Math.sin(t * 9 + i * 1.3);
    const x = gx * (1 - w1) + lx * w1 * (1 - w2) + gxx * w2 + jit;
    const y = gy * (1 - w1) + ly * w1 * (1 - w2) + gyy * w2 + jit * 0.6;
    out.push(<circle key={i} cx={x} cy={y} r={10} fill="#3b82f6" stroke="#1d4ed8" />);
  }
  return out;
}
const ETATS: LessonDef = {
  slug: "etats-matiere", title: "Les états de la matière au niveau microscopique", level: "5e", subject: "pc",
  scenes: [
    { title: "L'état solide", duration: 6, caption: "À l'état solide, les molécules sont rapprochées, ordonnées et liées : elles vibrent sur place. Le solide a une forme propre.", render: (p) => <g>{particles(0, p * 6)}</g> },
    { title: "La fusion", duration: 7, caption: "On chauffe : les molécules s'agitent davantage et se désordonnent. C'est la fusion : le solide devient liquide.", render: (p) => <g>{particles(seg(p, 0.1, 0.9), p * 7)}<rect x={440} y={60} width={16} height={200} rx={8} fill="#e2e8f0" /><rect x={440} y={260 - 120 * p} width={16} height={120 * p} rx={8} fill="#ef4444" /></g> },
    { title: "La vaporisation", duration: 7, caption: "En chauffant encore, les molécules s'éloignent les unes des autres et se dispersent : c'est l'état gazeux.", render: (p) => <g>{particles(1 + seg(p, 0.1, 0.9), p * 7)}<rect x={440} y={60} width={16} height={200} rx={8} fill="#e2e8f0" /><rect x={440} y={140 - 80 * p} width={16} height={120 + 80 * p} rx={8} fill="#ef4444" /></g> },
  ],
  cues: [
    { t: 6, question: "À l'état solide, les molécules sont :", options: ["éloignées et désordonnées", "rapprochées et ordonnées", "rapprochées et désordonnées"], answer: 1, explanation: "Solide : état compact et ordonné." },
    { t: 13, question: "Lors de la fusion, la masse de l'échantillon :", options: ["augmente", "diminue", "reste la même"], answer: 2, explanation: "Au cours d'un changement d'état, la masse se conserve : les molécules sont les mêmes, seule leur organisation change." },
    { t: 20, question: "Comment s'appelle le passage de l'état liquide à l'état gazeux ?", options: ["La vaporisation", "La liquéfaction", "La solidification"], answer: 0, explanation: "Liquide → gaz : vaporisation. Gaz → liquide : liquéfaction." },
  ],
};

export const LESSONS: Record<string, LessonDef> = { pythagore: PYTHAGORE, "etats-matiere": ETATS };

export default function InteractiveLesson({ slug }: { slug: string }) {
  const L = LESSONS[slug];
  const total = L.scenes.reduce((s, x) => s + x.duration, 0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cue, setCue] = useState<Cue | null>(null);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [choice, setChoice] = useState<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { last.current = null; return; }
    let raf = 0;
    const step = (now: number) => {
      const dt = last.current === null ? 0 : (now - last.current) / 1000;
      last.current = now;
      setT((prev) => {
        const next = Math.min(total, prev + dt);
        const hit = L.cues.find((c) => !(c.t in answered) && prev < c.t && next >= c.t);
        if (hit) { setPlaying(false); setCue(hit); setChoice(null); return hit.t; }
        if (next >= total) setPlaying(false);
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, total, L.cues, answered]);

  let acc = 0, idx = 0;
  for (let i = 0; i < L.scenes.length; i++) { if (t < acc + L.scenes[i].duration || i === L.scenes.length - 1) { idx = i; break; } acc += L.scenes[i].duration; }
  const scene = L.scenes[idx];
  const local = Math.min(1, Math.max(0, (t - acc) / scene.duration));
  const score = Object.values(answered).filter(Boolean).length;
  const done = t >= total && !cue;

  return (
    <div className="card overflow-hidden">
      <div className="relative bg-paper">
        <svg viewBox="0 0 480 300" className="block w-full" role="img" aria-label={scene.title}>{scene.render(local)}</svg>
        <div className="absolute left-3 top-3 rounded-lg bg-paper/90 px-2 py-1 text-xs font-semibold text-ink shadow">{idx + 1}/{L.scenes.length} · {scene.title}</div>
        {cue && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 p-4">
            <div className="animate-pop w-full max-w-md rounded-2xl bg-surface p-5 shadow-xl" role="dialog" aria-label="Question">
              <p className="mb-3 font-semibold"><MathInline text={cue.question} /></p>
              <div className="space-y-2">
                {cue.options.map((o, i) => (
                  <button key={i} disabled={choice !== null} onClick={() => { setChoice(i); setAnswered((a) => ({ ...a, [cue.t]: i === cue.answer })); }}
                    className={`w-full rounded-xl border-2 px-3 py-2 text-left ${choice === null ? "border-slate-200 hover:border-indigo-400" : i === cue.answer ? "border-emerald-500 bg-emerald-50" : i === choice ? "border-rose-500 bg-rose-50" : "border-slate-200 opacity-60"}`}>
                    <MathInline text={o} />
                  </button>
                ))}
              </div>
              {choice !== null && (
                <div className="mt-3 space-y-3">
                  <p className={`text-sm ${choice === cue.answer ? "text-emerald-700" : "text-rose-700"}`}><strong>{choice === cue.answer ? "Bravo ! " : "Pas tout à fait. "}</strong><MathInline text={cue.explanation} /></p>
                  <button className="btn-primary w-full" onClick={() => { setCue(null); setPlaying(true); }}>Continuer ▶</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <p className="min-h-12 text-slate-700">{scene.caption}</p>
        <div className="flex items-center gap-3">
          <button className="btn-primary !px-3" aria-label={playing ? "Pause" : "Lecture"} disabled={!!cue} onClick={() => { if (done) { setT(0); setAnswered({}); } setPlaying(!playing); }}>{playing ? "❚❚" : done ? "↺" : "▶"}</button>
          <div className="relative flex-1">
            <input type="range" min={0} max={total} step={0.1} value={t} disabled={!!cue} aria-label="Position" onChange={(e) => { const v = Number(e.target.value); const blocked = L.cues.find((c) => !(c.t in answered) && c.t < v); setT(blocked ? blocked.t - 0.05 : v); }} className="w-full accent-indigo-600" />
            {L.cues.map((c) => <span key={c.t} title="Question" className={`pointer-events-none absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white ${c.t in answered ? (answered[c.t] ? "bg-emerald-500" : "bg-rose-500") : "bg-amber-400"}`} style={{ left: `${(c.t / total) * 100}%` }} />)}
          </div>
          <span className="font-mono text-xs text-slate-500">{Math.floor(t)}s / {total}s</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {L.scenes.map((s, i) => {
            const start = L.scenes.slice(0, i).reduce((a, x) => a + x.duration, 0);
            const allowed = !L.cues.some((c) => !(c.t in answered) && c.t < start);
            return <button key={i} disabled={!allowed || !!cue} onClick={() => setT(start)} className={`rounded-full border px-3 py-1 ${i === idx ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300"} disabled:opacity-40`}>{i + 1}. {s.title}</button>;
          })}
        </div>
        {done && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Leçon terminée ! Score aux questions : {score} / {L.cues.length}.</p>}
      </div>
    </div>
  );
}
