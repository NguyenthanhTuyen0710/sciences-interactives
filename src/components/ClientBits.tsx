"use client";
// Petits contrôles qui ont besoin du navigateur ; tout le reste des pages reste rendu côté serveur.

/** Ouvre la boîte d'impression ; la feuille d'impression masque l'en-tête, le pied de page et les formulaires (classes print:hidden). */
export function PrintButton({ label = "Imprimer le plan" }: { label?: string }) {
  return <button type="button" onClick={() => window.print()} className="btn-primary print:hidden">{label}</button>;
}
