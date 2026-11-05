import { defineConfig } from "drizzle-kit";

// Charge .env s'il existe (Node ≥ 20.12) ; sinon les variables d'environnement du système sont utilisées.
try { process.loadEnvFile(); } catch { /* pas de fichier .env */ }
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
