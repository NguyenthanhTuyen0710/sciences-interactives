"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ url, label = "Supprimer", confirmText }: { url: string; label?: string; confirmText: string }) {
  const router = useRouter();
  return (
    <button type="button" className="text-sm font-semibold text-rose-400 hover:underline" onClick={async () => {
      if (!confirm(confirmText)) return;
      const r = await fetch(url, { method: "DELETE" });
      if (!r.ok) alert("Suppression impossible.");
      router.refresh();
    }}>{label}</button>
  );
}

export function ImportBox() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-2">
      <input type="file" accept="application/json" aria-label="Fichier d'import JSON" className="text-sm" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const text = await f.text();
        const r = await fetch("/api/admin/import", { method: "POST", headers: { "content-type": "application/json" }, body: text });
        const d = await r.json();
        setMsg(r.ok ? `${d.imported} exercice(s) et ${d.chapters} chapitre(s) importés.${d.rejected.length ? " Rejetés : " + d.rejected.join(" ; ") : ""}` : d.error);
        router.refresh();
      }} />
      {msg && <p className="text-sm text-slate-700">{msg}</p>}
    </div>
  );
}
