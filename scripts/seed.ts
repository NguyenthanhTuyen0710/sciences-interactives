import "./env";
// Données de démonstration : comptes, tentatives réalistes, un exercice enseignant et une collection.
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/lib/db";
import { STATIC_GENERATORS } from "../src/lib/content/registry-static";
import { createRng } from "../src/lib/engine/rng";
import { checkExercise } from "../src/lib/engine/check";
import type { Difficulty } from "../src/lib/engine/types";
import { perfect } from "../src/lib/engine/solve";

async function upsertUser(email: string, name: string, role: "eleve" | "enseignant" | "admin", level: string | null) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (u) return u;
  const [n] = await db.insert(schema.users).values({ email, name, role, level, passwordHash: await bcrypt.hash("demo1234", 10) }).returning();
  return n;
}

async function main() {
  const admin = await upsertUser("admin@demo.fr", "Admin Démo", "admin", null);
  const prof = await upsertUser("prof@demo.fr", "Mme Martin", "enseignant", null);
  const eleve = await upsertUser("eleve@demo.fr", "Léa Dupont", "eleve", "4e");
  const eleve2 = await upsertUser("hugo@demo.fr", "Hugo Bernard", "eleve", "3e");
  void admin;

  const existing = await db.select().from(schema.attempts).where(eq(schema.attempts.userId, eleve.id));
  if (!existing.length) {
    // Tentatives simulées : réponses réelles soumises au moteur de correction (certaines volontairement fausses).
    const rng = createRng("seed-demo");
    const plan: [string, string, number[]][] = [
      [eleve.id, "m4-pythagore-longueur", [1, 1, 0.5, 1]], [eleve.id, "m6-comparer-fractions", [0.25, 0.5, 0.25]], [eleve.id, "m4-equation-premier-degre", [1, 0, 1]],
      [eleve.id, "p4-loi-ohm", [1, 1]], [eleve.id, "p4-vitesse-moyenne", [0, 0.5, 0]], [eleve2.id, "m3-trigonometrie", [1, 1]], [eleve2.id, "m3-probabilites-urne", [0.5, 1]],
    ];
    let day = 12;
    for (const [uid, exId, targets] of plan) {
      const g = STATIC_GENERATORS.find((x) => x.meta.id === exId)!;
      for (const [k, target] of targets.entries()) {
        const d = (1 + (k % 2)) as Difficulty;
        const seed = `demo${exId}${k}`;
        const inst = g.generate(createRng(seed), d);
        // Réponses réellement soumises au moteur : une partie juste (selon « target »), le reste laissé vide.
        const nOk = Math.round(target * inst.parts.length);
        const responses = inst.parts.map((p, i) => (i < nOk && !(p.interaction.kind === "expression" && p.interaction.primitive) ? perfect(p.interaction) : undefined));
        const res = checkExercise(inst, responses);
        const score = res.score;
        await db.insert(schema.attempts).values({
          userId: uid, exerciseId: exId, seed, difficulty: d, attemptNumber: 1, score, correctParts: res.parts.filter((p) => p.status === "correct").length, totalParts: res.parts.length,
          timeSpentSec: 40 + Math.floor(rng.next() * 200), responses, mode: "libre", createdAt: new Date(Date.now() - day * 86400000 * rng.next()),
        });
        day = Math.max(1, day - 1);
      }
    }
  }

  const customs = await db.select().from(schema.customExercises);
  let customId = customs[0]?.id;
  if (!customs.length) {
    const [c] = await db.insert(schema.customExercises).values({
      authorId: prof.id, subject: "maths", level: "6e", chapterId: "m6-proportionnalite", notionId: "m6-proportionnalite-tableau",
      title: "Prix de cahiers (exercice de Mme Martin)", summary: "Exercice paramétré rédigé dans l'éditeur enseignant.", difficulty: 1, published: true,
      schema: {
        statement: "Un cahier coûte $ {{p/10}} $ €. Léa achète {n} cahiers.",
        variables: [{ name: "p", min: 12, max: 35 }, { name: "n", min: 3, max: 9 }],
        parts: [
          { kind: "numerique", prompt: "Combien paie-t-elle ?", label: "Prix total :", answerExpr: "p*n/10", tol: 0, suffix: "€" },
          { kind: "qcm", prompt: "Le prix payé est-il proportionnel au nombre de cahiers ?", options: ["Oui", "Non"], correct: [0] },
        ],
        solution: ["$ {n} \\times {{p/10}} = {{p*n/10}} $ €.", "Chaque cahier coûte le même prix : le prix est proportionnel au nombre de cahiers (coefficient {{p/10}})."],
        rappel: "Deux grandeurs sont proportionnelles si l'on passe de l'une à l'autre en multipliant par un même nombre.",
      },
    }).returning();
    customId = c.id;
  }

  const cols = await db.select().from(schema.collections);
  if (!cols.length)
    await db.insert(schema.collections).values({
      authorId: prof.id, title: "Révisions 4e – Pythagore, équations, électricité", description: "Feuille d'exercices pour la semaine (Mme Martin).",
      items: [{ exerciseId: "m4-pythagore-longueur", difficulty: 1 }, { exerciseId: "m4-equation-premier-degre", difficulty: 2 }, { exerciseId: "p4-loi-ohm", difficulty: 1 }, { exerciseId: `perso-${customId}`, difficulty: 1 }],
    });
  console.log("Données de démonstration prêtes. Comptes : admin@demo.fr, prof@demo.fr, eleve@demo.fr, hugo@demo.fr — mot de passe demo1234");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
