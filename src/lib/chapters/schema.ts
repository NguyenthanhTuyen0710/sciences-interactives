// Contrat de données d'un chapitre complet (cours + exercices + activités + revue QA).
// Toute donnée de chapitre doit passer `ChapterSchema` avant intégration (vérifié par `npm test`).
import { z } from "zod";
import type { Figure, Interaction, Mistake, Rng } from "../engine/types";

export const GRADES = ["6e", "5e", "4e", "3e"] as const;
export const SUBJECT_SLUGS = ["mathematiques", "physique-chimie"] as const;
export const REVIEW_KEYS = ["curriculum", "accuracy", "exercises", "games", "technical", "language"] as const;
export type ReviewKey = (typeof REVIEW_KEYS)[number];
export const REVIEW_STATES = ["pending", "pass", "fail", "needs-review"] as const;
export const PUBLICATION_STATES = ["draft", "approved", "published"] as const;

const rich = z.string().min(1); // texte riche : LaTeX entre $…$, **gras**
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);

export const SourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  kind: z.enum(["official", "academic", "supplementary"]),
  note: z.string().optional(),
});

const SvgIllustration = z.object({ svg: z.string().startsWith("<svg"), alt: z.string().min(5), caption: z.string().optional() });

export const LessonSchema = z.object({
  introduction: rich,
  definitions: z.array(z.object({ term: z.string().min(1), text: rich })).min(1),
  properties: z.array(z.object({ title: z.string().min(1), statement: rich, conditions: z.string().optional() })).min(1),
  explanations: z.array(z.object({ title: z.string().min(1), body: rich })).min(1),
  workedExamples: z.array(z.object({ title: z.string().min(1), statement: rich, steps: z.array(rich).min(1), answer: rich })).min(2),
  illustrations: z.array(SvgIllustration).min(1),
  commonMistakes: z.array(z.object({ mistake: rich, correction: rich, why: rich })).min(3),
  methods: z.array(z.object({ title: z.string().min(1), steps: z.array(rich).min(2) })).min(1),
  summary: z.array(rich).min(3),
  revisionSheet: z.object({ keyPoints: z.array(rich).min(3), skills: z.array(rich).min(3) }),
  miniQuiz: z.array(z.object({ question: rich, options: z.array(rich).min(2), answer: z.number().int().min(0), explanation: rich })).min(3),
});

/** Partie d'exercice : interaction du moteur + diagnostics d'erreurs fréquentes. */
export interface ChapterPart { prompt?: string; interaction: Interaction; mistakes?: Mistake[] }

export interface ExerciseBody {
  statement: string;
  figure?: Figure;
  parts: ChapterPart[];
  solution: string[];
}

export interface ChapterExercise extends Partial<ExerciseBody> {
  id: string;
  title: string;
  niveau: 1 | 2 | 3 | 4 | 5;
  objectives: string[];
  /** Durée estimée en secondes. */
  time: number;
  /** Explication du raisonnement (affichée avec la correction). */
  reasoning: string;
  hints: string[];
  /** Variation contrôlée des paramètres : remplace statement/parts/solution par un tirage. */
  vary?: (rng: Rng) => ExerciseBody;
}

const ExerciseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(3),
    niveau: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    objectives: z.array(z.string()).min(1),
    time: z.number().int().min(10).max(3600),
    reasoning: rich,
    hints: z.array(rich).min(1),
    statement: z.string().optional(),
    parts: z.array(z.object({ interaction: z.object({ kind: z.string() }).passthrough(), mistakes: z.array(z.object({ match: z.string(), feedback: rich })).optional() }).passthrough()).optional(),
    solution: z.array(rich).optional(),
    vary: z.function().optional(),
  })
  .passthrough()
  .refine((e) => e.vary || (e.statement && e.parts?.length && e.solution?.length), "exercice sans énoncé/parties/solution ni générateur `vary`");

export const GAME_TEMPLATES = ["droite-graduee", "calcul-mental", "calcul-flash", "chasse-erreurs", "memory"] as const;

export const GameSchema = z.object({
  id: id,
  template: z.enum(GAME_TEMPLATES),
  title: z.string().min(3),
  objective: z.string().min(10),
  instructions: z.string().min(10),
  objectives: z.array(z.string()).min(1),
  config: z.record(z.string(), z.unknown()),
});
export type ChapterGame = z.infer<typeof GameSchema>;

export const ChapterSchema = z.object({
  id: z.string().regex(/^(math|pc)-(6e|5e|4e|3e)-[a-z0-9-]+$/),
  taskId: z.string().regex(/^SCI-(6E|5E|4E|3E|DNB)-(MATH|PC)-\d{3}$/),
  grade: z.enum(GRADES),
  subject: z.enum(SUBJECT_SLUGS),
  /** Identifiant du chapitre dans l'arborescence du site (src/lib/content/curriculum.ts). */
  treeChapterId: z.string().min(1),
  curriculumVersion: z.string().regex(/^\d{4}-\d{4}$/),
  title: z.string().min(3),
  officialObjectives: z.array(z.object({ id: z.string().min(1), text: z.string().min(5), source: z.string().min(1) })).min(1),
  prerequisites: z.array(z.object({ text: z.string().min(3), chapterId: z.string().optional() })).min(1),
  sources: z.array(SourceSchema).min(1),
  lesson: LessonSchema,
  exercises: z.array(ExerciseSchema).min(1),
  games: z.array(GameSchema).min(1),
  reviewStatus: z.object(Object.fromEntries(REVIEW_KEYS.map((k) => [k, z.enum(REVIEW_STATES)])) as Record<ReviewKey, z.ZodEnum<{ pending: "pending"; pass: "pass"; fail: "fail"; "needs-review": "needs-review" }>>),
  publicationStatus: z.enum(PUBLICATION_STATES),
  /** Chapitres de l'inventaire officiel (research/curriculum) couverts par ce chapitre, si différent de `id`. */
  curriculumChapterIds: z.array(z.string()).optional(),
  /** Justification documentée si moins de 30 exercices. */
  exerciseCountJustification: z.string().optional(),
});

export type ChapterContent = Omit<z.infer<typeof ChapterSchema>, "exercises"> & { exercises: ChapterExercise[] };

/** Règles de la « Definition of Done » vérifiables automatiquement. */
export function doneIssues(c: ChapterContent): string[] {
  const issues: string[] = [];
  if (c.exercises.length < 30 && !c.exerciseCountJustification) issues.push(`${c.exercises.length} exercices (< 30) sans justification`);
  if (c.games.length < 3) issues.push(`${c.games.length} activités interactives (< 3)`);
  for (const lvl of [1, 2, 3, 4, 5]) if (!c.exercises.some((e) => e.niveau === lvl)) issues.push(`aucun exercice de niveau ${lvl}`);
  const objIds = new Set(c.officialObjectives.map((o) => o.id));
  for (const o of objIds) {
    if (!c.exercises.some((e) => e.objectives.includes(o))) issues.push(`objectif ${o} sans exercice`);
  }
  for (const e of c.exercises) for (const o of e.objectives) if (!objIds.has(o)) issues.push(`${e.id} : objectif inconnu ${o}`);
  for (const g of c.games) for (const o of g.objectives) if (!objIds.has(o)) issues.push(`${g.id} : objectif inconnu ${o}`);
  const ids = c.exercises.map((e) => e.id);
  if (new Set(ids).size !== ids.length) issues.push("identifiants d'exercice dupliqués");
  for (const k of REVIEW_KEYS) if (c.reviewStatus[k] !== "pass") issues.push(`revue ${k} : ${c.reviewStatus[k]}`);
  return issues;
}
