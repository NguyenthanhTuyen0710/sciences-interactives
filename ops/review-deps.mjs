// Revue des dépendances ajoutées ou modifiées par rapport à une référence Git (défaut : origin/main).
// Signale celles qui peuvent embarquer un runtime natif ou un thread pool implicite : script d'installation, binaire par plateforme (os/cpu/libc).
// Informatif (code de sortie 0) : la décision reste humaine. Usage : node ops/review-deps.mjs [ref]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ref = process.argv[2] || "origin/main";
const read = (txt) => JSON.parse(txt).packages ?? {};
let before = {};
try { before = read(execFileSync("git", ["show", `${ref}:package-lock.json`], { encoding: "utf8", maxBuffer: 1 << 28 })); }
catch { console.log(`Référence ${ref} illisible : tous les paquets sont considérés comme nouveaux.`); }
const after = read(readFileSync("package-lock.json", "utf8"));

const rows = [];
for (const [path, p] of Object.entries(after)) {
  if (!path || before[path]?.version === p.version) continue;
  const flags = [];
  if (p.hasInstallScript) flags.push("script d'installation");
  if (p.os || p.cpu || p.libc) flags.push(`binaire par plateforme (${[p.os, p.cpu, p.libc].flat().filter(Boolean).join("/")})`);
  if (/(^|[-/])(native|binding|bindings|node-gyp|napi)($|[-/])|\.node$/.test(path)) flags.push("nom évocateur d'un module natif");
  if (/^(next|sharp|esbuild|lightningcss|bcrypt|argon2|better-sqlite3|canvas|pg-native|@swc\/core)$/.test(path.replace(/^.*node_modules\//, ""))) flags.push("runtime connu pour ses threads ou ses binaires natifs");
  rows.push({ name: path.replace(/^.*node_modules\//, ""), version: p.version, dev: !!p.dev, optional: !!p.optional, flags, isNew: !before[path] });
}
// Les builds optionnels par plateforme (ex. @next/swc-*, @unrs/resolver-binding-*) sont masqués : seul leur paquet parent compte.
const flagged = rows.filter((r) => r.flags.length && !(r.optional && !r.flags.includes("script d'installation")));
console.log(`## Revue des dépendances (${ref})\n\n${rows.length} paquet(s) ajouté(s) ou modifié(s), dont ${rows.filter((r) => r.isNew).length} nouveau(x).`);
if (!flagged.length) console.log("\nAucun paquet nouveau ou modifié ne présente de signal de runtime natif (hors binaires optionnels par plateforme).");
else {
  console.log("\n| Paquet | Version | Portée | Signaux |\n|---|---|---|---|");
  for (const r of flagged) console.log(`| ${r.name} | ${r.version} | ${r.dev ? "dev" : "production"} | ${r.flags.join(", ")} |`);
  console.log("\nÀ vérifier avant fusion : threads implicites, mémoire, processus d'arrière-plan, compatibilité glibc/Linux x64 de l'hébergement.");
  for (const r of flagged.filter((r) => !r.dev)) console.log(`::warning::Dépendance de production à revoir : ${r.name}@${r.version} (${r.flags.join(", ")})`);
}
