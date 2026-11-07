"use client";
import Link from "next/link";
import { useState } from "react";

const LEVELS = ["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"];

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState<"eleve" | "enseignant">("eleve");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const body = mode === "login" ? { email: f.email, password: f.password } : { ...f, role, level: f.level || undefined };
    const r = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setError(data.error ?? "Erreur inattendue.");
    // rechargement complet : l'en-tête et toutes les données sont régénérés avec la session
    window.location.assign(data.role === "eleve" ? "/mon-espace" : "/admin");
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-black">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
      {mode === "register" && (
        <>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de compte">
            {(["eleve", "enseignant"] as const).map((r) => (
              <button type="button" key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${role === r ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200"}`}>{r === "eleve" ? "🎒 Élève" : "🧑‍🏫 Enseignant"}</button>
            ))}
          </div>
          <div><label className="label" htmlFor="name">Prénom et nom</label><input id="name" name="name" required minLength={2} className="input" autoComplete="name" /></div>
        </>
      )}
      <div><label className="label" htmlFor="email">Adresse e-mail</label><input id="email" name="email" type="email" required className="input" autoComplete="email" /></div>
      <div><label className="label" htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} />{mode === "register" && <p className="mt-1 text-xs text-slate-500">8 caractères minimum.</p>}</div>
      {mode === "register" && role === "eleve" && (
        <div><label className="label" htmlFor="level">Ma classe</label><select id="level" name="level" className="input" defaultValue=""><option value="">— choisir —</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
      )}
      {mode === "register" && role === "enseignant" && (
        <div><label className="label" htmlFor="teacherCode">Code d'invitation enseignant</label><input id="teacherCode" name="teacherCode" required className="input" /><p className="mt-1 text-xs text-slate-500">Fourni par l'administrateur de l'établissement.</p></div>
      )}
      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Patiente…" : mode === "login" ? "Se connecter" : "Créer mon compte"}</button>
      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? <>Pas encore de compte ? <Link href="/inscription" className="font-semibold text-indigo-600">Inscription</Link></> : <>Déjà inscrit ? <Link href="/connexion" className="font-semibold text-indigo-600">Connexion</Link></>}
      </p>
    </form>
  );
}
