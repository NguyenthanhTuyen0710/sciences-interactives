"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CollectionForm({ exercises }: { exercises: { id: string; title: string; level: string; subject: string }[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const r = await fetch("/api/admin/collections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: f.get("title"), description: f.get("description"), items: Object.entries(sel).map(([exerciseId, difficulty]) => ({ exerciseId, difficulty })) }) });
      const d = await r.json();
      setMsg(r.ok ? "Collection créée." : d.error);
      if (r.ok) { setSel({}); (e.target as HTMLFormElement).reset(); router.refresh(); }
    }}>
      <div><label className="label">Titre</label><input name="title" required minLength={3} className="input" placeholder="Feuille d'exercices – Fractions (5e B)" /></div>
      <div><label className="label">Description</label><input name="description" className="input" /></div>
      <div><label className="label">Exercices ({Object.keys(sel).length} sélectionné(s))</label>
        <select className="input mb-2" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par niveau"><option value="">Tous niveaux</option>{["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"].map((l) => <option key={l}>{l}</option>)}</select>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {exercises.filter((x) => !filter || x.level === filter).map((x) => (
            <div key={x.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" id={`c-${x.id}`} checked={x.id in sel} onChange={(e) => { const n = { ...sel }; if (e.target.checked) n[x.id] = 1; else delete n[x.id]; setSel(n); }} />
              <label htmlFor={`c-${x.id}`} className="flex-1">{x.level} · {x.title}</label>
              {x.id in sel && <select aria-label="Difficulté" value={sel[x.id]} onChange={(e) => setSel({ ...sel, [x.id]: Number(e.target.value) })} className="rounded border border-slate-300 text-xs"><option value={1}>Facile</option><option value={2}>Moyen</option><option value={3}>Difficile</option></select>}
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" disabled={!Object.keys(sel).length}>Créer la collection</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
