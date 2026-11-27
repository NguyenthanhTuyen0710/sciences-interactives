import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { assertProductionConfig, authSecret, configProblems, demoModeActive, teacherInviteCode } from "../src/lib/config";

// Valeurs fictives propres à ces tests (aucun lien avec la production).
const GOOD = { NODE_ENV: "production", AUTH_SECRET: "test-only-secret-not-used-anywhere-0001", TEACHER_INVITE_CODE: "test-only-invite-0001" };

describe("configuration obligatoire en production", () => {
  it("accepte une configuration valide et renvoie les valeurs fournies", () => {
    expect(configProblems(GOOD)).toEqual([]);
    expect(() => assertProductionConfig(GOOD)).not.toThrow();
    expect(authSecret(GOOD)).toBe(GOOD.AUTH_SECRET);
    expect(teacherInviteCode(GOOD)).toBe(GOOD.TEACHER_INVITE_CODE);
  });

  it("refuse les variables absentes ou vides", () => {
    expect(configProblems({ NODE_ENV: "production" })).toHaveLength(2);
    expect(configProblems({ ...GOOD, AUTH_SECRET: "   " })).toEqual(["AUTH_SECRET absente ou vide"]);
    expect(() => assertProductionConfig({ NODE_ENV: "production" })).toThrow(/AUTH_SECRET.*TEACHER_INVITE_CODE/);
  });

  it.each([
    "dev-secret-change-me-0123456789",
    "remplacer-par-une-longue-chaine-aleatoire",
    "demo-secret-a-changer-en-production-0123456789",
    "demo-secret-codespaces-0123456789abcdef",
  ])("refuse la valeur par défaut publique de AUTH_SECRET (%s)", (v) => {
    expect(() => authSecret({ ...GOOD, AUTH_SECRET: v })).toThrow(/AUTH_SECRET/);
  });

  it("refuse le code enseignant par défaut", () => {
    expect(() => teacherInviteCode({ ...GOOD, TEACHER_INVITE_CODE: "PROF-2026" })).toThrow(/TEACHER_INVITE_CODE/);
  });

  it("n'inclut jamais une valeur dans le message d'erreur", () => {
    let msg = "";
    try { authSecret({ ...GOOD, AUTH_SECRET: "dev-secret-change-me-0123456789" }); } catch (e) { msg = String(e); }
    expect(msg).not.toContain("dev-secret-change-me");
    expect(msg).not.toContain("PROF-2026");
  });

  it("autorise le mode démonstration explicite", () => {
    const demo = { NODE_ENV: "production", ALLOW_DEMO_SECRETS: "1", AUTH_SECRET: "demo-secret-a-changer-en-production-0123456789", TEACHER_INVITE_CODE: "PROF-2026" };
    expect(configProblems(demo)).toEqual([]);
    expect(authSecret(demo)).toBe(demo.AUTH_SECRET);
  });

  it("conserve les valeurs de repli historiques hors production", () => {
    expect(authSecret({ NODE_ENV: "development" })).toBe("dev-secret-change-me-0123456789");
    expect(teacherInviteCode({ NODE_ENV: "test" })).toBe("PROF-2026");
    expect(configProblems({ NODE_ENV: "development" })).toEqual([]);
  });
});

// Les règles du démarrage (src/lib/config.ts) et du preflight (ops/check-config.mjs) doivent rester identiques : même fichier de valeurs, même verdict.

describe("règles partagées avec ops/check-config.mjs", () => {
  const verdict = (env: Record<string, string>) => spawnSync(process.execPath, ["ops/check-config.mjs", "--env"], { env, encoding: "utf8" });
  const cases: [string, Record<string, string>][] = [
    ["configuration valide", { AUTH_SECRET: "test-only-secret-not-used-anywhere-0001", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET absente", { TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET vide", { AUTH_SECRET: "  ", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET publique (dev)", { AUTH_SECRET: "dev-secret-change-me-0123456789", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET publique (.env.example)", { AUTH_SECRET: "remplacer-par-une-longue-chaine-aleatoire", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET publique (docker-compose)", { AUTH_SECRET: "demo-secret-a-changer-en-production-0123456789", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["AUTH_SECRET publique (devcontainer)", { AUTH_SECRET: "demo-secret-codespaces-0123456789abcdef", TEACHER_INVITE_CODE: "test-only-invite-0001" }],
    ["code enseignant absent", { AUTH_SECRET: "test-only-secret-not-used-anywhere-0001" }],
    ["code enseignant par défaut", { AUTH_SECRET: "test-only-secret-not-used-anywhere-0001", TEACHER_INVITE_CODE: "PROF-2026" }],
  ];
  it.each(cases)("même verdict au démarrage et au preflight : %s", (_n, env) => {
    const startup = configProblems({ NODE_ENV: "production", ...env }).length === 0;
    const r = verdict(env);
    expect(r.status === 0).toBe(startup);
  });

  it("le preflight n'affiche jamais une valeur", () => {
    const env = { AUTH_SECRET: "dev-secret-change-me-0123456789", TEACHER_INVITE_CODE: "PROF-2026" };
    const r = verdict(env);
    expect(r.stdout + r.stderr).not.toContain("dev-secret-change-me");
    expect(r.stdout + r.stderr).not.toContain("PROF-2026");
  });

  it("le mode démonstration est accepté au démarrage mais refusé par le preflight", () => {
    const env = { AUTH_SECRET: "dev-secret-change-me-0123456789", TEACHER_INVITE_CODE: "PROF-2026", ALLOW_DEMO_SECRETS: "1" };
    expect(configProblems({ NODE_ENV: "production", ...env })).toEqual([]);
    expect(demoModeActive({ NODE_ENV: "production", ...env })).toBe(true);
    expect(verdict(env).status).toBe(1);
  });
});
