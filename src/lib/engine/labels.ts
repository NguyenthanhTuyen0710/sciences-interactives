import type { InteractionKind } from "./types";

export const KIND_LABELS: Record<InteractionKind, string> = {
  qcm: "QCM", "vrai-faux": "Vrai / Faux", numerique: "Réponse numérique", expression: "Expression algébrique", "texte-libre": "Réponse libre",
  "texte-trous": "Texte à trous", "glisser-deposer": "Glisser-déposer", associer: "Associer", classer: "Classer", ordonner: "Ordonner",
  repere: "Géométrie interactive", tableau: "Tableau à compléter", etapes: "Calcul détaillé", demonstration: "Démonstration",
};
