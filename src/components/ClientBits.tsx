"use client";
// Petits contrôles qui ont besoin du navigateur ; tout le reste des pages reste rendu côté serveur.
import { useEffect, useRef, useState } from "react";

/** Ouvre la boîte d'impression ; la feuille d'impression masque l'en-tête, le pied de page et les formulaires (classes print:hidden). */
export function PrintButton({ label = "Imprimer le plan" }: { label?: string }) {
  return <button type="button" onClick={() => window.print()} className="btn-primary print:hidden">{label}</button>;
}

/** Inverse de `obfuscate` (ui.tsx) : morceaux base64 d'un texte écrit à l'envers. */
export function revealText(parts: string[]): string {
  return [...new TextDecoder().decode(Uint8Array.from(atob(parts.join("")), (ch) => ch.charCodeAt(0)))].reverse().join("");
}

/**
 * Coordonnée protégée des robots simples : la page n'en contient qu'une version codée, recomposée au clic.
 * Sans JavaScript, `fallback` est affiché à la place (texte lisible par un humain, sans lien).
 */
export function RevealContact({ kind, parts, label, fallback }: { kind: "email" | "phone"; parts: string[]; label: string; fallback: string }) {
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (value) link.current?.focus(); }, [value]);
  if (!ready) return <span className="text-slate-700">{fallback}</span>;
  if (!value) return <button type="button" onClick={() => setValue(revealText(parts))} className="btn-primary">{label}</button>;
  const href = kind === "email" ? `mailto:${value}` : `tel:${value.replace(/\s+/g, "")}`;
  return <a ref={link} href={href} className="text-lg font-semibold text-indigo-700 underline-offset-4 hover:underline">{value}</a>;
}
