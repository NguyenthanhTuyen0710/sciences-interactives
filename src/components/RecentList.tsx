"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { id: string; title: string; score: number; at: number; level: string; subject: string };

/** Exercices récemment consultés sur cet appareil. */
export default function RecentList() {
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("recents") || "[]")); } catch { setItems([]); }
  }, []);
  if (items === null) return <div className="h-24 animate-pulse rounded-xl bg-slate-100" />;
  if (!items.length) return <p className="text-sm text-slate-500">Aucun exercice récent sur cet appareil. Lance-toi avec le défi du jour !</p>;
  return (
    <ul className="space-y-2">
      {items.slice(0, 5).map((it) => (
        <li key={it.id}>
          <Link href={`/exercice/${it.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${it.score === 1 ? "bg-emerald-100 text-emerald-700" : it.score >= 0.5 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-700"}`}>{Math.round(it.score * 100)}%</span>
            <span className="flex-1 text-sm font-medium">{it.title}</span>
            <span className="text-xs text-slate-400">{it.level}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
