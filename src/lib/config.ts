// Configuration obligatoire en production : AUTH_SECRET et TEACHER_INVITE_CODE ne doivent ni manquer ni garder une valeur par défaut publique.
// Ne change ni l'authentification, ni les sessions, ni les rôles : ce module n'ajoute qu'une validation de configuration.
// Hors production, les valeurs de repli historiques restent utilisées (développement, tests).
// ALLOW_DEMO_SECRETS=1 est réservé aux démonstrations (docker-compose.yml) ; ops/preflight.sh le refuse en production.
import rules from "../../ops/config-rules.json";

const DEV_AUTH_SECRET = "dev-secret-change-me-0123456789";
const DEV_INVITE_CODE = "PROF-2026";

// Valeurs publiées dans ce dépôt : jamais valables en production. Source unique partagée avec ops/check-config.mjs (preflight).
const UNSAFE: Record<"AUTH_SECRET" | "TEACHER_INVITE_CODE", ReadonlySet<string>> = {
  AUTH_SECRET: new Set(rules.unsafe.AUTH_SECRET),
  TEACHER_INVITE_CODE: new Set(rules.unsafe.TEACHER_INVITE_CODE),
};

type Env = Record<string, string | undefined>;
type Name = keyof typeof UNSAFE;

/** Mode démonstration explicite (docker-compose.yml) : ignore les valeurs par défaut. Interdit en production réelle (ops/preflight.sh le refuse). */
export const demoModeActive = (env: Env = process.env) => env.NODE_ENV === "production" && env[rules.demoFlag] === "1";
const enforced = (env: Env) => env.NODE_ENV === "production" && env[rules.demoFlag] !== "1";

/** Problèmes de configuration, décrits par NOM de variable uniquement (jamais par valeur). */
export function configProblems(env: Env = process.env, names: Name[] = ["AUTH_SECRET", "TEACHER_INVITE_CODE"]): string[] {
  if (!enforced(env)) return [];
  const out: string[] = [];
  for (const n of names) {
    const v = env[n]?.trim();
    if (!v) out.push(`${n} absente ou vide`);
    else if (UNSAFE[n].has(v)) out.push(`${n} : valeur par défaut publique interdite`);
  }
  return out;
}

function fail(problems: string[]): never {
  throw new Error(`Configuration de production invalide — ${problems.join(" ; ")}. Définir ces variables d'environnement (docs/ops/production.md).`);
}

/** Vérification au démarrage du serveur (src/instrumentation.ts). */
export function assertProductionConfig(env: Env = process.env): void {
  const p = configProblems(env);
  if (p.length) fail(p);
}

export function authSecret(env: Env = process.env): string {
  const p = configProblems(env, ["AUTH_SECRET"]);
  if (p.length) fail(p);
  return env.AUTH_SECRET || DEV_AUTH_SECRET;
}

export function teacherInviteCode(env: Env = process.env): string {
  const p = configProblems(env, ["TEACHER_INVITE_CODE"]);
  if (p.length) fail(p);
  return env.TEACHER_INVITE_CODE || DEV_INVITE_CODE;
}
