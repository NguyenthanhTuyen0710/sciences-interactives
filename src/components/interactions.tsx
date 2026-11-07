"use client";
// Composants d'interaction réutilisables du moteur d'exercices.
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import katex from "katex";
import { MathInline } from "./MathText";
import type { PublicInteraction } from "@/lib/engine/public";
import type { PartResult } from "@/lib/engine/types";
export { KIND_LABELS } from "@/lib/engine/labels";

/* eslint-disable @typescript-eslint/no-explicit-any */
type P<K extends PublicInteraction["kind"]> = {
  it: Extract<PublicInteraction, { kind: K }>;
  value: any;
  onChange: (v: any) => void;
  result?: PartResult;
  locked: boolean;
};

export function initValue(it: PublicInteraction): unknown {
  switch (it.kind) {
    case "qcm": return [];
    case "vrai-faux": return it.items.map(() => null);
    case "numerique": return { value: "", unit: it.units?.length === 1 ? it.units[0] : "" };
    case "expression": case "texte-libre": return "";
    case "texte-trous": return it.blanks.map(() => "");
    case "glisser-deposer": return it.zones.map(() => null);
    case "associer": return it.left.map(() => null);
    case "classer": return it.items.map(() => null);
    case "ordonner": return it.items.map((_, i) => i);
    case "repere": return it.labels.map(() => null);
    case "tableau": return {};
    case "etapes": return it.steps.map(() => "");
    case "demonstration": return { order: it.steps.map((_, i) => i), justifs: it.steps.map(() => null) };
  }
}

const tone = (ok: boolean | undefined) => (ok === undefined ? "border-slate-300" : ok ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50");
const PAIR_COLORS = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500", "bg-sky-500", "bg-violet-500", "bg-orange-500", "bg-teal-500"];

// ───────── QCM ─────────
function Qcm({ it, value, onChange, result, locked }: P<"qcm">) {
  const sel: number[] = value;
  const toggle = (i: number) => {
    if (locked) return;
    if (it.multiple) onChange(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
    else onChange([i]);
  };
  return (
    <div className="space-y-2" role={it.multiple ? "group" : "radiogroup"}>
      {it.multiple && <p className="text-xs text-slate-500">Plusieurs réponses possibles.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {it.options.map((o, i) => {
          const on = sel.includes(i);
          return (
            <button key={i} type="button" role={it.multiple ? "checkbox" : "radio"} aria-checked={on} onClick={() => toggle(i)} disabled={locked}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${on ? (result ? (result.status === "correct" ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50") : "border-indigo-500 bg-indigo-50") : "border-slate-200 bg-white hover:border-indigo-300"}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center ${it.multiple ? "rounded-md" : "rounded-full"} border-2 text-xs font-bold ${on ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-400"}`}>{String.fromCharCode(65 + i)}</span>
              <MathInline text={o} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ───────── Vrai / Faux ─────────
function VraiFaux({ it, value, onChange, result, locked }: P<"vrai-faux">) {
  const v: (boolean | null)[] = value;
  return (
    <ul className="space-y-2">
      {it.items.map((s, i) => (
        <li key={i} className={`flex flex-col gap-2 rounded-xl border-2 p-3 sm:flex-row sm:items-center ${tone(result?.details?.[i])}`}>
          <span className="flex-1"><MathInline text={s} /></span>
          <div className="flex gap-2">
            {[true, false].map((b) => (
              <button key={String(b)} type="button" disabled={locked} aria-pressed={v[i] === b} onClick={() => onChange(v.map((x, j) => (j === i ? b : x)))}
                className={`min-w-20 rounded-lg border px-3 py-1.5 text-sm font-semibold ${v[i] === b ? (b ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-600 bg-rose-600 text-white") : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                {b ? "Vrai" : "Faux"}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ───────── Réponse numérique ─────────
export function NumberInput({ value, onChange, locked, ok, width, ariaLabel }: { value: string; onChange: (s: string) => void; locked: boolean; ok?: boolean; width?: number; ariaLabel?: string }) {
  return (
    <input inputMode="decimal" autoComplete="off" aria-label={ariaLabel ?? "Réponse"} value={value} disabled={locked} onChange={(e) => onChange(e.target.value)}
      style={width ? { width: `${width + 2}ch` } : undefined}
      className={`rounded-lg border-2 bg-white px-2 py-1.5 text-center font-medium outline-none focus:border-indigo-500 ${width ? "" : "w-32"} ${tone(ok)}`} />
  );
}

function Numerique({ it, value, onChange, result, locked }: P<"numerique">) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {it.label && <MathInline text={it.label} className="font-medium" />}
      <NumberInput value={value.value} onChange={(s) => onChange({ ...value, value: s })} locked={locked} ok={result?.details?.[0]} />
      {it.units && it.units.length > 1 ? (
        <select aria-label="Unité" disabled={locked} value={value.unit} onChange={(e) => onChange({ ...value, unit: e.target.value })} className="rounded-lg border-2 border-slate-300 bg-white px-2 py-1.5">
          <option value="">unité…</option>
          {it.units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      ) : it.units?.length === 1 ? <span className="text-slate-600">{it.units[0]}</span> : it.suffix ? <span className="text-slate-600">{it.suffix}</span> : null}
    </div>
  );
}

// ───────── Expression algébrique ─────────
function ExprPreview({ src }: { src: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    let alive = true;
    if (!src.trim()) { setHtml(""); return; }
    import("@/lib/engine/expr").then(({ exprToTex }) => {
      if (!alive) return;
      const t = exprToTex(src);
      setHtml(t ? katex.renderToString(t, { throwOnError: false }) : '<span class="text-rose-600 text-sm">expression incomplète</span>');
    });
    return () => { alive = false; };
  }, [src]);
  return html ? <div className="min-h-8 rounded-lg bg-slate-50 px-3 py-1 text-slate-800" aria-live="polite"><span className="mr-2 text-xs text-slate-500">Aperçu :</span><span dangerouslySetInnerHTML={{ __html: html }} /></div> : null;
}

function Expression({ it, value, onChange, result, locked }: P<"expression">) {
  const ref = useRef<HTMLInputElement>(null);
  const insert = (s: string) => {
    const el = ref.current;
    if (!el) return onChange(value + s);
    const a = el.selectionStart ?? value.length, b = el.selectionEnd ?? value.length;
    onChange(value.slice(0, a) + s + value.slice(b));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + s.length, a + s.length); });
  };
  const keys = [it.variable, "²", "^", "(", ")", "/", "*", "sqrt("];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {it.label && <MathInline text={`$${it.label.replace("=", "")}=$`} className="font-medium" />}
        <input ref={ref} autoComplete="off" spellCheck={false} aria-label="Expression" value={value} disabled={locked} onChange={(e) => onChange(e.target.value)}
          placeholder={`ex. 3${it.variable}^2 - 5${it.variable} + 2`} className={`min-w-0 flex-1 rounded-lg border-2 bg-white px-3 py-2 font-mono outline-none focus:border-indigo-500 ${tone(result?.details?.[0])}`} />
      </div>
      {!locked && (
        <div className="flex flex-wrap gap-1.5">
          {keys.map((k) => (
            <button key={k} type="button" onClick={() => insert(k)} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-sm hover:bg-slate-100">{k}</button>
          ))}
        </div>
      )}
      <ExprPreview src={value} />
    </div>
  );
}

function TexteLibre({ it, value, onChange, result, locked }: P<"texte-libre">) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {it.label && <MathInline text={it.label} />}
      <input value={value} disabled={locked} aria-label="Réponse" onChange={(e) => onChange(e.target.value)} className={`min-w-0 flex-1 rounded-lg border-2 bg-white px-3 py-2 outline-none focus:border-indigo-500 ${tone(result?.details?.[0])}`} />
    </div>
  );
}

// ───────── Texte à trous ─────────
function TexteTrous({ it, value, onChange, result, locked }: P<"texte-trous">) {
  const v: string[] = value;
  const set = (i: number, s: string) => onChange(v.map((x, j) => (j === i ? s : x)));
  const lines = it.template.split("\n");
  return (
    <div className="space-y-3">
      {lines.map((line, li) => (
        <div key={li} className="flex flex-wrap items-center gap-x-2 gap-y-2 leading-9">
          {line.split(/(\[\[\d+\]\])/).map((seg, k) => {
            const m = seg.match(/^\[\[(\d+)\]\]$/);
            if (!m) return seg ? <MathInline key={k} text={seg} /> : null;
            const i = Number(m[1]);
            const b = it.blanks[i];
            const ok = result?.details?.[i];
            if (b.type === "select")
              return (
                <select key={k} aria-label={`Trou ${i + 1}`} disabled={locked} value={v[i]} onChange={(e) => set(i, e.target.value)} className={`rounded-lg border-2 bg-white px-2 py-1 font-semibold ${tone(ok)}`}>
                  <option value="">…</option>
                  {b.options.map((o, oi) => <option key={oi} value={oi}>{o}</option>)}
                </select>
              );
            return <NumberInput key={k} ariaLabel={`Trou ${i + 1}`} value={v[i]} onChange={(s) => set(i, s)} locked={locked} ok={ok} width={b.width ?? 8} />;
          })}
        </div>
      ))}
    </div>
  );
}

// ───────── Étiquettes (glisser-déposer / classer) ─────────
function Token({ label, selected, onClick, draggable, onDragStart, disabled, extra, data }: { label: string; selected?: boolean; onClick?: () => void; draggable?: boolean; onDragStart?: (e: DragEvent) => void; disabled?: boolean; extra?: string; data?: Record<string, number> }) {
  return (
    <button type="button" {...data} disabled={disabled} draggable={draggable && !disabled} onDragStart={onDragStart} onClick={onClick}
      className={`cursor-grab rounded-lg border-2 px-3 py-1.5 text-sm font-medium shadow-sm transition active:cursor-grabbing ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white hover:border-indigo-400"} ${extra ?? ""}`}>
      <MathInline text={label} />
    </button>
  );
}

function GlisserDeposer({ it, value, onChange, result, locked }: P<"glisser-deposer">) {
  const v: (number | null)[] = value;
  const [sel, setSel] = useState<number | null>(null);
  const used = new Set(v.filter((x) => x !== null));
  const place = (zone: number, token: number) => onChange(v.map((x, j) => (j === zone ? token : x === token ? null : x)));
  const drop = (zone: number) => (e: DragEvent) => { e.preventDefault(); const t = Number(e.dataTransfer.getData("text/plain")); if (!Number.isNaN(t)) place(zone, t); };
  return (
    <div className="space-y-4">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3" aria-label="Étiquettes disponibles">
        {it.tokens.map((t, i) => !used.has(i) && (
          <Token key={i} data={{ "data-token": i }} label={t} selected={sel === i} disabled={locked} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))} onClick={() => setSel(sel === i ? null : i)} />
        ))}
        {used.size === it.tokens.length && <span className="text-sm text-slate-400">Toutes les étiquettes sont placées.</span>}
      </div>
      <p className="text-xs text-slate-500">Glisse une étiquette sur une case, ou touche une étiquette puis une case.</p>
      <div className="grid gap-2">
        {it.zones.map((z, i) => (
          <div key={i} data-zone={i} onDragOver={(e) => e.preventDefault()} onDrop={drop(i)} onClick={() => { if (sel !== null && !locked) { place(i, sel); setSel(null); } }}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 p-3 ${tone(result?.details?.[i])} ${sel !== null ? "cursor-pointer ring-2 ring-indigo-200" : ""}`}>
            <MathInline text={z} />
            {v[i] !== null ? (
              <Token label={it.tokens[v[i] as number]} disabled={locked} extra="bg-indigo-50" onClick={() => onChange(v.map((x, j) => (j === i ? null : x)))} />
            ) : (
              <span className="rounded-lg border-2 border-dashed border-slate-300 px-6 py-1.5 text-sm text-slate-400">déposer ici</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Classer({ it, value, onChange, result, locked }: P<"classer">) {
  const v: (number | null)[] = value;
  const [sel, setSel] = useState<number | null>(null);
  const put = (item: number, cat: number | null) => onChange(v.map((x, j) => (j === item ? cat : x)));
  const drop = (cat: number | null) => (e: DragEvent) => { e.preventDefault(); const t = Number(e.dataTransfer.getData("text/plain")); if (!Number.isNaN(t)) put(t, cat); };
  const tok = (i: number) => (
    <Token key={i} data={{ "data-item": i }} label={it.items[i]} selected={sel === i} disabled={locked} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
      onClick={() => setSel(sel === i ? null : i)} extra={result ? (result.details?.[i] ? "!border-emerald-500" : "!border-rose-500") : ""} />
  );
  return (
    <div className="space-y-3">
      <div onDragOver={(e) => e.preventDefault()} onDrop={drop(null)} onClick={() => { if (sel !== null && !locked && v[sel] !== null) { put(sel, null); setSel(null); } }}
        className="flex min-h-12 flex-wrap gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
        {it.items.map((_, i) => v[i] === null && tok(i))}
        {v.every((x) => x !== null) && <span className="text-sm text-slate-400">Tous les éléments sont classés.</span>}
      </div>
      <p className="text-xs text-slate-500">Glisse chaque élément dans une catégorie, ou touche-le puis touche la catégorie.</p>
      <div>
        <div className={`grid gap-3 ${it.categories.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {it.categories.map((c, ci) => (
            <div key={ci} data-cat={ci} onDragOver={(e) => e.preventDefault()} onDrop={drop(ci)} onClick={() => { if (sel !== null && !locked) { put(sel, ci); setSel(null); } }}
              className={`min-h-28 rounded-xl border-2 bg-white p-3 ${sel !== null ? "cursor-pointer border-indigo-300" : "border-slate-200"}`}>
              <div className="mb-2 text-sm font-semibold text-slate-700"><MathInline text={c} /></div>
              <div className="flex flex-wrap gap-2">{it.items.map((_, i) => v[i] === ci && tok(i))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────── Associer ─────────
function Associer({ it, value, onChange, result, locked }: P<"associer">) {
  const v: (number | null)[] = value;
  const [left, setLeft] = useState<number | null>(null);
  const colorOf = (l: number) => PAIR_COLORS[l % PAIR_COLORS.length];
  const rightOwner = (r: number) => v.findIndex((x) => x === r);
  const clickRight = (r: number) => {
    if (locked) return;
    if (left === null) { const o = rightOwner(r); if (o >= 0) onChange(v.map((x, j) => (j === o ? null : x))); return; }
    onChange(v.map((x, j) => (j === left ? r : x === r ? null : x)));
    setLeft(null);
  };
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">Touche un élément à gauche puis l'élément correspondant à droite. Touche-le à nouveau pour défaire une paire.</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-8">
        <div className="space-y-2">
          {it.left.map((l, i) => (
            <button key={i} data-left={i} type="button" disabled={locked} onClick={() => setLeft(left === i ? null : i)}
              className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left ${left === i ? "border-indigo-600 ring-2 ring-indigo-200" : result ? tone(result.details?.[i]) : "border-slate-200 bg-white hover:border-indigo-300"}`}>
              <span className={`h-3 w-3 shrink-0 rounded-full ${v[i] !== null ? colorOf(i) : "bg-slate-200"}`} />
              <MathInline text={l} />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {it.right.map((r, i) => {
            const o = rightOwner(i);
            return (
              <button key={i} data-right={i} type="button" disabled={locked} onClick={() => clickRight(i)}
                className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left ${left !== null ? "border-indigo-300 hover:bg-indigo-50" : "border-slate-200 bg-white"}`}>
                <span className={`h-3 w-3 shrink-0 rounded-full ${o >= 0 ? colorOf(o) : "bg-slate-200"}`} />
                <MathInline text={r} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────── Ordonner (et démonstration) ─────────
function SortableList({ items, order, onChange, locked, details, render }: { items: string[]; order: number[]; onChange: (o: number[]) => void; locked: boolean; details?: boolean[]; render?: (itemIdx: number, pos: number) => ReactNode }) {
  const [drag, setDrag] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || locked) return;
    const o = [...order];
    const [x] = o.splice(from, 1);
    o.splice(to, 0, x);
    onChange(o);
  };
  return (
    <ol className="space-y-2">
      {order.map((itemIdx, pos) => (
        <li key={itemIdx} data-item-idx={itemIdx} draggable={!locked} onDragStart={() => setDrag(pos)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, pos); setDrag(null); }}
          className={`flex items-start gap-3 rounded-xl border-2 bg-white p-3 ${details ? tone(details[pos]) : "border-slate-200"} ${!locked ? "cursor-grab" : ""}`}>
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{pos + 1}</span>
          <div className="flex-1">
            <MathInline text={items[itemIdx]} />
            {render?.(itemIdx, pos)}
          </div>
          {!locked && (
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" aria-label="Monter" onClick={() => move(pos, pos - 1)} disabled={pos === 0} className="rounded border border-slate-300 px-2 text-xs hover:bg-slate-100 disabled:opacity-30">▲</button>
              <button type="button" aria-label="Descendre" onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1} className="rounded border border-slate-300 px-2 text-xs hover:bg-slate-100 disabled:opacity-30">▼</button>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function Ordonner({ it, value, onChange, result, locked }: P<"ordonner">) {
  return (
    <div>
      {it.hint && <p className="mb-2 text-xs text-slate-500">{it.hint} — glisse les éléments ou utilise les flèches.</p>}
      <SortableList items={it.items} order={value} onChange={onChange} locked={locked} details={result?.details} />
    </div>
  );
}

function Demonstration({ it, value, onChange, result, locked }: P<"demonstration">) {
  const n = it.steps.length;
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">Ordonne les étapes (glisser ou flèches), puis choisis la justification de chacune.</p>
      <SortableList items={it.steps} order={value.order} locked={locked} details={result?.details?.slice(0, n)} onChange={(o) => onChange({ ...value, order: o })}
        render={(idx) => (
          <select aria-label="Justification" disabled={locked} value={value.justifs[idx] ?? ""} onChange={(e) => onChange({ ...value, justifs: value.justifs.map((x: number | null, j: number) => (j === idx ? (e.target.value === "" ? null : Number(e.target.value)) : x)) })}
            className={`mt-2 w-full rounded-lg border-2 bg-white px-2 py-1 text-sm ${result ? tone(result.details?.[n + idx]) : "border-slate-300"}`}>
            <option value="">Justification…</option>
            {it.options.map((o, oi) => <option key={oi} value={oi}>{o}</option>)}
          </select>
        )} />
    </div>
  );
}

// ───────── Repère interactif ─────────
function Repere({ it, value, onChange, result, locked }: P<"repere">) {
  const v: ([number, number] | null)[] = value;
  const [active, setActive] = useState(0);
  const W = 420, H = 420, pad = 28;
  const X = (x: number) => pad + ((x - it.xmin) / (it.xmax - it.xmin)) * (W - 2 * pad);
  const Y = (y: number) => H - pad - ((y - it.ymin) / (it.ymax - it.ymin)) * (H - 2 * pad);
  const svgRef = useRef<SVGSVGElement>(null);
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    if (locked || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
    const x = it.xmin + ((px - pad) / (W - 2 * pad)) * (it.xmax - it.xmin);
    const y = it.ymin + ((H - pad - py) / (H - 2 * pad)) * (it.ymax - it.ymin);
    const snap = (t: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(t / it.step) * it.step));
    const p: [number, number] = [snap(x, it.xmin, it.xmax), snap(y, it.ymin, it.ymax)];
    const nv = v.map((q, j) => (j === active ? p : q));
    onChange(nv);
    const next = nv.findIndex((q) => q === null);
    if (next >= 0) setActive(next);
  };
  const lines: ReactNode[] = [];
  for (let x = it.xmin; x <= it.xmax + 1e-9; x += it.step) lines.push(<line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(it.ymin)} y2={Y(it.ymax)} stroke={Number.isInteger(x) ? "#cbd5e1" : "#eef2f7"} />);
  for (let y = it.ymin; y <= it.ymax + 1e-9; y += it.step) lines.push(<line key={`y${y}`} y1={Y(y)} y2={Y(y)} x1={X(it.xmin)} x2={X(it.xmax)} stroke={Number.isInteger(y) ? "#cbd5e1" : "#eef2f7"} />);
  const ticks: ReactNode[] = [];
  for (let x = Math.ceil(it.xmin); x <= it.xmax; x++) if (x !== 0) ticks.push(<text key={`tx${x}`} x={X(x)} y={Y(0) + 15} fontSize="11" textAnchor="middle" fill="#64748b">{x}</text>);
  for (let y = Math.ceil(it.ymin); y <= it.ymax; y++) if (y !== 0) ticks.push(<text key={`ty${y}`} x={X(0) - 7} y={Y(y) + 4} fontSize="11" textAnchor="end" fill="#64748b">{y}</text>);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {it.labels.map((l, i) => (
          <button key={i} data-point={i} type="button" disabled={locked} onClick={() => setActive(i)}
            className={`rounded-lg border-2 px-3 py-1 text-sm font-semibold ${active === i && !locked ? "border-indigo-600 bg-indigo-600 text-white" : result ? tone(result.details?.[i]) : "border-slate-300 bg-white"}`}>
            Point {l} {v[i] ? `(${String(v[i]![0]).replace(".", ",")} ; ${String(v[i]![1]).replace(".", ",")})` : "— à placer"}
          </button>
        ))}
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onClick={click} className={`w-full max-w-[420px] touch-manipulation select-none rounded-xl border border-slate-200 bg-white ${locked ? "" : "cursor-crosshair"}`} role="img" aria-label="Repère : clique pour placer le point sélectionné">
        {lines}
        <line x1={X(it.xmin)} x2={X(it.xmax)} y1={Y(0)} y2={Y(0)} stroke="#334155" strokeWidth="1.6" />
        <line y1={Y(it.ymin)} y2={Y(it.ymax)} x1={X(0)} x2={X(0)} stroke="#334155" strokeWidth="1.6" />
        <text x={X(0) - 7} y={Y(0) + 15} fontSize="11" textAnchor="end" fill="#64748b">0</text>
        {ticks}
        {v.map((p, i) => p && (
          <g key={i}>
            <circle cx={X(p[0])} cy={Y(p[1])} r="6" fill={result ? (result.details?.[i] ? "#16a34a" : "#e11d48") : "#4f46e5"} />
            <text x={X(p[0]) + 9} y={Y(p[1]) - 8} fontSize="14" fontWeight="700" fill="#0f172a">{it.labels[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ───────── Tableau à compléter ─────────
function Tableau({ it, value, onChange, result, locked }: P<"tableau">) {
  let k = 0;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        {it.headers.length > 0 && (
          <thead><tr>{it.headers.map((h, i) => <th key={i} className="border border-slate-300 bg-slate-100 px-3 py-2 text-center font-semibold"><MathInline text={h} /></th>)}</tr></thead>
        )}
        <tbody>
          {it.rows.map((r, ri) => (
            <tr key={ri}>
              <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-medium"><MathInline text={r.label} /></th>
              {r.cells.map((c, ci) => {
                if (typeof c === "string") return <td key={ci} className="border border-slate-300 px-3 py-2 text-center"><MathInline text={c} /></td>;
                const idx = k++;
                const key = `${ri}-${ci}`;
                return (
                  <td key={ci} className="border border-slate-300 p-1 text-center">
                    <NumberInput value={value[key] ?? ""} onChange={(s) => onChange({ ...value, [key]: s })} locked={locked} ok={result?.details?.[idx]} width={6} ariaLabel={`Case ligne ${ri + 1} colonne ${ci + 1}`} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ───────── Calcul détaillé ─────────
function Etapes({ it, value, onChange, result, locked }: P<"etapes">) {
  const v: string[] = value;
  return (
    <ol className="space-y-2">
      {it.steps.map((s, i) => {
        const reachable = i === 0 || v[i - 1]?.trim() !== "" || locked;
        return (
          <li key={i} className={`flex flex-wrap items-center gap-3 rounded-xl border-2 p-3 transition ${reachable ? "opacity-100" : "opacity-50"} ${tone(result?.details?.[i])}`}>
            <MathInline text={s.prompt} />
            <NumberInput value={v[i]} onChange={(x) => onChange(v.map((y, j) => (j === i ? x : y)))} locked={locked || !reachable} ok={result?.details?.[i]} ariaLabel={`Étape ${i + 1}`} />
            {s.suffix && <span>{s.suffix}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function Interaction(props: { it: PublicInteraction; value: unknown; onChange: (v: unknown) => void; result?: PartResult; locked: boolean }) {
  const p = props as any;
  switch (props.it.kind) {
    case "qcm": return <Qcm {...p} />;
    case "vrai-faux": return <VraiFaux {...p} />;
    case "numerique": return <Numerique {...p} />;
    case "expression": return <Expression {...p} />;
    case "texte-libre": return <TexteLibre {...p} />;
    case "texte-trous": return <TexteTrous {...p} />;
    case "glisser-deposer": return <GlisserDeposer {...p} />;
    case "associer": return <Associer {...p} />;
    case "classer": return <Classer {...p} />;
    case "ordonner": return <Ordonner {...p} />;
    case "repere": return <Repere {...p} />;
    case "tableau": return <Tableau {...p} />;
    case "etapes": return <Etapes {...p} />;
    case "demonstration": return <Demonstration {...p} />;
  }
}

