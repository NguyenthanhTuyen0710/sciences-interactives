// Schéma PostgreSQL (Drizzle ORM).
import { boolean, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["eleve", "enseignant", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("eleve"),
  level: text("level"),
  subjects: jsonb("subjects").$type<string[]>().notNull().default(["maths", "pc"]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Une tentative = une soumission d'un exercice (instance identifiée par sa graine). */
export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  seed: text("seed").notNull(),
  difficulty: integer("difficulty").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  score: real("score").notNull(),
  correctParts: integer("correct_parts").notNull(),
  totalParts: integer("total_parts").notNull(),
  timeSpentSec: integer("time_spent_sec").notNull(),
  responses: jsonb("responses").notNull(),
  mode: text("mode").notNull().default("libre"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("attempts_user_idx").on(t.userId, t.createdAt), index("attempts_ex_idx").on(t.exerciseId)]);

/** Exercices créés par les enseignants (schéma de contenu JSON, paramétrable). */
export const customExercises = pgTable("custom_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  chapterId: text("chapter_id").notNull(),
  notionId: text("notion_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  difficulty: integer("difficulty").notNull().default(1),
  schema: jsonb("schema").notNull(),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Chapitres et notions ajoutés par les enseignants. */
export const customChapters = pgTable("custom_chapters", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  title: text("title").notNull(),
  theme: text("theme").notNull().default("Chapitre ajouté"),
  notions: jsonb("notions").$type<{ id: string; title: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Collections (feuilles d'exercices) composées par un enseignant. */
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  items: jsonb("items").$type<{ exerciseId: string; difficulty: number }[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
