// Vérifie que le node_modules RÉEL contient exactement les versions que package-lock.json prévoit pour la production.
// Ne se contente pas d'un hash du lockfile : lit les package.json réellement installés.
// Usage : node ops/check-deps.mjs [--lock package-lock.json] [--modules node_modules] [--dev-ok]
// Contrôle : chaque paquet de production du lock (hors dev et hors optionnels) est installé à la version du lock ; les binaires optionnels de plateforme
// (os/cpu/libc) correspondant à CET hôte sont installés ; les paquets installés en plus (dev) sont comptés, sans échec.
// Codes de sortie : 0 = conforme · 1 = écart · 2 = usage.
import fs from "node:fs";
import path from "node:path";

const a = process.argv.slice(2);
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const lockFile = opt("--lock", "package-lock.json"), modules = opt("--modules", "node_modules");
if (!fs.existsSync(lockFile) || !fs.existsSync(modules)) { console.error("lock ou node_modules introuvable"); process.exit(2); }

const lock = JSON.parse(fs.readFileSync(lockFile, "utf8")).packages ?? {};
const isGlibc = !!process.report?.getReport?.().header?.glibcVersionRuntime;
const match = (list, v) => !list || list.every((x) => !x.startsWith("!")) && list.includes(v) || (list.some((x) => x.startsWith("!")) && !list.includes(`!${v}`));
const platformOk = (p) => match(p.os, process.platform) && match(p.cpu, process.arch) && (!p.libc || p.libc.includes(isGlibc ? "glibc" : "musl"));

let checked = 0, bad = 0, optionalOk = 0, extra = 0;
const out = (lvl, m) => { console.log(`  ${lvl.padEnd(5)} ${m}`); if (lvl === "FAIL") bad++; };
for (const [key, p] of Object.entries(lock)) {
  if (!key.startsWith("node_modules/") || p.link) continue;
  const rel = key.replace(/^node_modules\//, "");
  const pj = path.join(modules, rel, "package.json");
  const installed = fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, "utf8")).version : null;
  if (p.dev) { if (installed) extra++; continue; }
  if (p.optional) {
    if (!platformOk(p)) continue;           // autre plateforme : non attendu ici
    if (installed === p.version) optionalOk++; else if (installed) out("FAIL", `${rel} : ${installed} installé, ${p.version} attendu`);
    else out("FAIL", `${rel} : binaire optionnel de cette plateforme (${process.platform}/${process.arch}) absent`);
    continue;
  }
  checked++;
  if (!installed) out("FAIL", `${rel} : absent (lock : ${p.version})`);
  else if (installed !== p.version) out("FAIL", `${rel} : ${installed} installé, ${p.version} attendu`);
}
console.log(`== ${checked} paquet(s) de production vérifié(s), ${optionalOk} binaire(s) optionnel(s) de plateforme conforme(s), ${extra} paquet(s) de développement en plus (ignorés), ${bad} écart(s)`);
process.exit(bad ? 1 : 0);
