"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileForm({ level, subjects }: { level: string | null; subjects: string[] }) {
  const router = useRouter();
  const [lv, setLv] = useState(level ?? "");
  const [subs, setSubs] = useState(subjects);
  const [msg, setMsg] = useState("");
  const save = async () => {
    const r = await fetch("/api/me", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ level: lv || null, subjects: subs.length ? subs : ["maths", "pc"] }) });
    setMsg(r.ok ? "Profil enregistré." : "Erreur d'enregistrement.");
    router.refresh();
  };
  return (
    <div className="space-y-3">
      <div><label className="label" htmlFor="lv">Ma classe</label>
        <select id="lv" className="input" value={lv} onChange={(e) => setLv(e.target.value)}><option value="">— non renseignée —</option>{["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"].map((l) => <option key={l}>{l}</option>)}</select>
      </div>
      <fieldset><legend className="label">Mes matières</legend>
        {[["maths", "Mathématiques"], ["pc", "Physique-Chimie"]].map(([k, l]) => (
          <label key={k} className="mr-4 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={subs.includes(k)} onChange={(e) => setSubs(e.target.checked ? [...subs, k] : subs.filter((s) => s !== k))} />{l}</label>
        ))}
      </fieldset>
      <button onClick={save} className="btn-primary">Enregistrer</button>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  );
}
