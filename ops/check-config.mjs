// Contrôle de la configuration obligatoire de production, avec LES MÊMES règles que le démarrage (ops/config-rules.json, lu aussi par src/lib/config.ts).
// Répond PASS/FAIL par NOM de variable : ne lit ni n'affiche jamais une valeur.
//
// Usage : node ops/check-config.mjs --env-from-pid PID   (variables du processus de l'application, via /proc/PID/environ ; même utilisateur)
//         node ops/check-config.mjs --env                (variables du processus courant)
// Règles : AUTH_SECRET et TEACHER_INVITE_CODE présents, non vides, différents des valeurs publiées dans le dépôt ; ALLOW_DEMO_SECRETS absente ou ≠ 1.
// Codes de sortie : 0 = tout PASS · 1 = au moins un FAIL · 2 = usage ou lecture impossible.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rules = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "config-rules.json"), "utf8"));
const a = process.argv.slice(2);
let env;
if (a[0] === "--env") env = process.env;
else if (a[0] === "--env-from-pid" && /^\d+$/.test(a[1] ?? "")) {
  try {
    env = Object.fromEntries(fs.readFileSync(`/proc/${a[1]}/environ`, "latin1").split("\0").filter(Boolean).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; }));
  } catch { console.error(`/proc/${a[1]}/environ illisible (PID inexistant ou autre utilisateur)`); process.exit(2); }
} else { console.error("Usage : node ops/check-config.mjs --env-from-pid PID | --env"); process.exit(2); }

let fails = 0;
const res = (ok, name, why) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${why ? ` : ${why}` : ""}`); if (!ok) fails++; };
for (const [name, bad] of Object.entries(rules.unsafe)) {
  const v = env[name]?.trim();
  if (!v) res(false, name, "absente ou vide");
  else if (bad.includes(v)) res(false, name, "valeur par défaut publique (publiée dans le dépôt)");
  else res(true, name);
}
if (env[rules.demoFlag] === "1") res(false, rules.demoFlag, "mode démonstration actif : interdit en production");
else res(true, rules.demoFlag, "inactif");
process.exit(fails ? 1 : 0);
