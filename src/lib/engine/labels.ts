import type { InteractionKind } from "./types";

export const KIND_LABELS: Record<InteractionKind, string> = {
  qcm: "QCM", "vrai-faux": "Vrai / Faux", numerique: "Réponse numérique", expression: "Expression algébrique", "texte-libre": "Réponse libre",
  "texte-trous": "Texte à trous", "glisser-deposer": "Glisser-déposer", associer: "Associer", classer: "Classer", ordonner: "Ordonner",
  repere: "Géométrie interactive", tableau: "Tableau à compléter", etapes: "Calcul détaillé", demonstration: "Démonstration",
};

/** Niveaux des exercices de banque de chapitre (1 à 5). */
export const NIVEAUX = ["", "Découverte", "Application", "Consolidation", "Approfondissement", "Défi"];
