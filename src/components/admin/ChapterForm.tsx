"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChapterForm() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const body = { subject: f.get("subject"), level: f.get("level"), title: f.get("title"), theme: f.get("theme") || undefined, notions: String(f.get("notions")).split("\n").map((s) => s.trim()).filter(Boolean) };
      const r = await fetch("/api/admin/chapters", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      setMsg(r.ok ? "Chapitre créé." : d.error);
      if (r.ok) { (e.target as HTMLFormElement).reset(); router.refresh(); }
    }}>
      <div><label className="label">Matière</label><select name="subject" className="input"><option value="maths">Mathématiques</option><option value="pc">Physique-Chimie</option></select></div>
      <div><label className="label">Niveau</label><select name="level" className="input">{["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"].map((l) => <option key={l}>{l}</option>)}</select></div>
      <div><label className="label">Titre du chapitre</label><input name="title" required minLength={3} className="input" /></div>
      <div><label className="label">Thème du programme (facultatif)</label><input name="theme" className="input" /></div>
      <div className="sm:col-span-2"><label className="label">Notions (une par ligne)</label><textarea name="notions" required className="input h-24" /></div>
      <button className="btn-primary sm:col-span-2">Créer le chapitre</button>
      {msg && <p className="text-sm sm:col-span-2">{msg}</p>}
    </form>
  );
}
