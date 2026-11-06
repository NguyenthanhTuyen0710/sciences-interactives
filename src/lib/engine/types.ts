// Schéma de contenu réutilisable du moteur d'exercices.
// Toutes les chaînes « riches » acceptent du LaTeX entre $...$ et **gras**.

export type Subject = "maths" | "pc";
export type LevelId = "6e" | "5e" | "4e" | "3e" | "2nde" | "1re" | "Tle";
export type Difficulty = 1 | 2 | 3;

/** Réponse numérique attendue. */
export interface NumAnswer {
  value: number;
  /** Tolérance absolue (ex. 0.05 pour « arrondi au dixième »). */
  tol?: number;
  /** Valeur exacte sous forme de fraction n/d : une valeur décimale approchée est refusée. */
  fraction?: [number, number];
  /** Nombre de chiffres significatifs exigés (physique-chimie). */
  sigFigs?: number;
  /** Unité : l'élève choisit une unité parmi `choices`, la valeur est convertie vers `base`. */
  unit?: { base: string; choices: string[] };
  /** Nombre de décimales pour l'affichage de la bonne réponse. */
  decimals?: number;
  /** Texte de l'arrondi demandé, utilisé dans les messages. */
  roundingLabel?: string;
}

export type Blank =
  | { type: "select"; options: string[]; answer: number }
  | { type: "number"; answer: NumAnswer; width?: number }
  | { type: "text"; answer: string[]; width?: number };

export type Interaction =
  | { kind: "qcm"; options: string[]; multiple?: boolean; answer: number[] }
  | { kind: "vrai-faux"; items: string[]; answer: boolean[] }
  | { kind: "numerique"; label?: string; suffix?: string; answer: NumAnswer }
  | {
      kind: "expression";
      label?: string;
      variable: string;
      answer: string;
      form?: "reduite" | "developpee";
      /** Écriture LaTeX de la réponse attendue (affichage de la correction). */
      display?: string;
      /** La réponse attendue est une primitive de `answer` (vérifiée par dérivation). */
      primitive?: boolean;
    }
  | { kind: "texte-libre"; label?: string; answer: string[] }
  | { kind: "texte-trous"; template: string; blanks: Blank[]; /** coefficients stœchiométriques : détecter des réponses proportionnelles */ proportional?: boolean }
  | { kind: "glisser-deposer"; zones: string[]; tokens: string[]; answer: number[] }
  | { kind: "associer"; left: string[]; right: string[]; answer: number[] }
  | { kind: "classer"; categories: string[]; items: string[]; answer: number[] }
  | { kind: "ordonner"; items: string[]; answer: number[]; hint?: string }
  | {
      kind: "repere";
      xmin: number;
      xmax: number;
      ymin: number;
      ymax: number;
      step: number;
      /** Courbes affichées (expressions en x) – décor. */
      curves?: string[];
      points: { label: string; answer: [number, number] }[];
    }
  | {
      kind: "tableau";
      headers: string[];
      rows: { label: string; cells: (string | { answer: NumAnswer })[] }[];
    }
  | { kind: "etapes"; steps: { prompt: string; answer: NumAnswer; suffix?: string }[] }
  | {
      kind: "demonstration";
      steps: string[];
      answer: number[];
      justifications: { options: string[]; answer: number[] };
    };

export type InteractionKind = Interaction["kind"];

export type Figure =
  | { kind: "svg"; svg: string; caption?: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "video"; src: string; caption?: string };

/** Erreur fréquente anticipée : si la réponse de l'élève correspond, on affiche un diagnostic ciblé. */
export interface Mistake {
  /** Numérique : valeur (« -3 », « 7/4 ») ; QCM : index de l'option choisie ; texte : réponse normalisée. */
  match: string;
  feedback: string;
}

export interface Part {
  prompt?: string;
  interaction: Interaction;
  /** Diagnostics d'erreurs fréquentes (jamais envoyés au navigateur). */
  mistakes?: Mistake[];
}

export interface ExerciseInstance {
  statement: string;
  figure?: Figure;
  parts: Part[];
  /** Correction détaillée, étape par étape. */
  solution: string[];
  /** Rappel de cours affiché avec la correction. */
  rappel?: string;
  /** Indices progressifs (dévoilés un par un ; ne contiennent pas la réponse). */
  hints?: string[];
}

export interface ExerciseMeta {
  id: string;
  title: string;
  subject: Subject;
  level: LevelId;
  chapterId: string;
  notionId: string;
  kinds: InteractionKind[];
  summary: string;
  /** Le générateur produit des valeurs aléatoires (sinon : tirage dans une banque). */
  randomized: "valeurs" | "banque";
  /** Durée suggérée en secondes pour le mode chronométré. */
  timeLimit?: number;
  /** Exercice de banque d'un chapitre : niveau 1 (Découverte) à 5 (Défi), sans sélecteur de difficulté. */
  niveau?: 1 | 2 | 3 | 4 | 5;
  /** Objectifs officiels travaillés (identifiants du référentiel). */
  objectives?: string[];
}

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  shuffle<T>(arr: readonly T[]): T[];
  sign(): 1 | -1;
}

export interface Generator {
  meta: ExerciseMeta;
  generate(rng: Rng, difficulty: Difficulty): ExerciseInstance;
}

// ---- Réponses & correction ----
export type PartResponse = unknown;

export interface PartResult {
  status: "correct" | "partiel" | "faux";
  score: number; // 0..1
  feedback: string[];
  /** Détail par sous-élément (case, trou, item…) pour l'affichage. */
  details?: boolean[];
  /** Bonne réponse lisible. */
  expected: string;
}

export interface CheckResult {
  parts: PartResult[];
  score: number; // 0..1
  solution: string[];
  rappel?: string;
}
