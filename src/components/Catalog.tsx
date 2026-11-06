"use client";
import { useMemo, useState } from "react";
import type { ExerciseMeta, InteractionKind } from "@/lib/engine/types";
import { KIND_LABELS } from "@/lib/engine/labels";
import { ExerciseCard } from "./ui";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LEVELS = ["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"];

export default function Catalog({ items, initial }: { items: { meta: ExerciseMeta; text: string }[]; initial: { q?: string; niveau?: string; matiere?: string; type?: string } }) {
  const [q, setQ] = useState(initial.q ?? "");
  const [level, setLevel] = useState(initial.niveau ?? "");
  const [subject, setSubject] = useState(initial.matiere ?? "");
  const [kind, setKind] = useState(initial.type ?? "");
  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return items.filter(({ meta, text }) =>
      (!level || meta.level === level) && (!subject || meta.subject === subject) && (!kind || meta.kinds.includes(kind as InteractionKind)) &&
      words.every((w) => norm(text).includes(w)));
  }, [items, q, level, subject, kind]);
  const sel = "rounded-xl border border-slate-300 bg-surface px-3 py-2 text-sm";
  return (
    <div>
      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (ex. fractions, ohm)…" aria-label="Recherche" className="input" />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Matière" className={sel}>
          <option value="">Toutes les matières</option><option value="maths">Mathématiques</option><option value="pc">Physique-Chimie</option>
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Niveau" className={sel}>
          <option value="">Tous les niveaux</option>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type d'exercice" className={sel}>
          <option value="">Tous les types</option>{Object.entries(KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <p className="mb-3 text-sm text-slate-500">{list.length} exercice{list.length > 1 ? "s" : ""}</p>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(({ meta }) => <ExerciseCard key={meta.id} m={meta} />)}</div>
      ) : <p className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">Aucun exercice ne correspond à cette recherche.</p>}
    </div>
  );
}
