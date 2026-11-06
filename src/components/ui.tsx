import Link from "next/link";
import type { ExerciseMeta } from "@/lib/engine/types";
import { KIND_LABELS } from "@/lib/engine/labels";
import { levelLabel } from "@/lib/content/curriculum";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden>›</span>}
          {it.href ? <Link href={it.href} className="hover:text-indigo-600 hover:underline">{it.label}</Link> : <span className="font-medium text-slate-800">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SubjectBadge({ subject }: { subject: string }) {
  return subject === "maths"
    ? <span className="chip bg-indigo-100 text-indigo-700">Maths</span>
    : <span className="chip bg-emerald-100 text-emerald-700">Physique-Chimie</span>;
}

export function ExerciseCard({ m, difficulty, note }: { m: ExerciseMeta; difficulty?: number; note?: string }) {
  return (
    <Link href={`/exercice/${m.id}${difficulty ? `?d=${difficulty}` : ""}`} className="card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-1.5">
        <SubjectBadge subject={m.subject} />
        <span className="chip bg-slate-100 text-slate-700">{levelLabel(m.level)}</span>
        {m.id.startsWith("perso-") && <span className="chip bg-amber-100 text-amber-800">Enseignant</span>}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{m.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-600">{note ?? m.summary}</p>
      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {m.kinds.map((k) => <span key={k} className="chip bg-white text-slate-500 ring-1 ring-slate-200">{KIND_LABELS[k]}</span>)}
      </div>
    </Link>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Bar({ value, color = "bg-indigo-500" }: { value: number; color?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} /></div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</div>;
}
