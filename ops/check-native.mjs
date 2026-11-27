// Contrôle des binaires natifs d'une arborescence node_modules : architecture, version de glibc exigée, bibliothèques dynamiques requises.
// Lit les en-têtes ELF directement (aucun binutils, ldd ni strings requis : utilisable sur l'hébergement partagé) ; --load tente en plus un vrai chargement.
//
// Usage : node ops/check-native.mjs [node_modules] [--max-glibc 2.34] [--load]
//   --max-glibc : glibc maximale autorisée (défaut : glibc du Node qui exécute ce script, donc celle de l'hôte quand on le lance là-bas)
//   --load      : charge chaque addon .node glibc x86_64 dans un processus Node séparé (TOKIO_WORKER_THREADS=2) : preuve réelle de compatibilité
// Les binaires musl sont signalés et ignorés (inutilisables avec la glibc, jamais chargés par Node sur glibc).
// Codes de sortie : 0 = aucun échec · 1 = échec · 2 = erreur d'usage.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
let maxGlibc = null, doLoad = false, dir = "node_modules";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--max-glibc") maxGlibc = args[++i];
  else if (args[i] === "--load") doLoad = true;
  else if (args[i].startsWith("--")) { console.error(`Option inconnue : ${args[i]}`); process.exit(2); }
  else dir = args[i];
}
maxGlibc ??= process.report?.getReport?.().header?.glibcVersionRuntime ?? null;
if (!maxGlibc) { console.error("glibc de l'hôte indéterminée : préciser --max-glibc X.Y"); process.exit(2); }
if (!fs.existsSync(dir)) { console.error(`Dossier introuvable : ${dir}`); process.exit(2); }

const ver = (s) => s.split(".").map(Number);
const cmp = (a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] ?? 0) - (y[i] ?? 0); if (d) return d; } return 0; };
const maxOf = (list) => list.reduce((m, v) => (m === null || cmp(v, m) > 0 ? v : m), null);

function cstr(buf, off) { let e = off; while (e < buf.length && buf[e] !== 0) e++; return buf.toString("latin1", off, e); }

function parseElf(buf) {
  if (buf.length < 64 || buf.readUInt32BE(0) !== 0x7f454c46) return null;
  if (buf[4] !== 2 || buf[5] !== 1) return { unsupported: true };
  const machine = buf.readUInt16LE(18);
  const shoff = Number(buf.readBigUInt64LE(40)), shentsize = buf.readUInt16LE(58), shnum = buf.readUInt16LE(60);
  const sec = [];
  for (let i = 0; i < shnum; i++) {
    const o = shoff + i * shentsize;
    sec.push({ type: buf.readUInt32LE(o + 4), offset: Number(buf.readBigUInt64LE(o + 24)), size: Number(buf.readBigUInt64LE(o + 32)), link: buf.readUInt32LE(o + 40) });
  }
  const needed = []; const req = {};
  for (const s of sec) {
    if (s.type === 6) { // SHT_DYNAMIC
      const str = sec[s.link];
      for (let o = s.offset; o < s.offset + s.size; o += 16) {
        const tag = Number(buf.readBigInt64LE(o)); if (tag === 0) break;
        if (tag === 1) needed.push(cstr(buf, str.offset + Number(buf.readBigUInt64LE(o + 8))));
      }
    } else if (s.type === 0x6ffffffe) { // SHT_GNU_verneed
      const str = sec[s.link]; let off = s.offset;
      for (;;) {
        const cnt = buf.readUInt16LE(off + 2), file = cstr(buf, str.offset + buf.readUInt32LE(off + 4)), aux = buf.readUInt32LE(off + 8), next = buf.readUInt32LE(off + 12);
        let a = off + aux; (req[file] ??= []);
        for (let k = 0; k < cnt; k++) { req[file].push(cstr(buf, str.offset + buf.readUInt32LE(a + 8))); const an = buf.readUInt32LE(a + 12); if (!an) break; a += an; }
        if (!next) break; off += next;
      }
    }
  }
  return { machine, needed, req };
}

// 1. inventaire
const files = []; const names = new Set();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile()) {
      names.add(e.name);
      let cand = /\.node$|\.so(\.\d+)*$/.test(e.name);
      if (!cand) { try { cand = (fs.statSync(p).mode & 0o111) !== 0 && fs.statSync(p).size > 4096; } catch { /* ignoré */ } }
      if (cand) files.push(p);
    }
  }
})(dir);

let fails = 0, warns = 0, count = 0; const loadable = [];
const out = (lvl, msg) => { console.log(`  ${lvl.padEnd(5)} ${msg}`); if (lvl === "FAIL") fails++; if (lvl === "WARN") warns++; };
const STD = new Set(["libc.so.6", "libm.so.6", "libdl.so.2", "libpthread.so.0", "librt.so.1", "libutil.so.1", "libgcc_s.so.1", "libstdc++.so.6", "ld-linux-x86-64.so.2"]);
const hostDirs = ["/lib64", "/usr/lib64", "/lib/x86_64-linux-gnu", "/usr/lib/x86_64-linux-gnu"];
const hostHas = (n) => hostDirs.some((d) => fs.existsSync(path.join(d, n)));
function hostLibMax(libName, prefix) {
  for (const d of hostDirs) { const p = path.join(d, libName); if (fs.existsSync(p)) {
    const m = [...fs.readFileSync(p).toString("latin1").matchAll(new RegExp(`${prefix}_([0-9][0-9.]*)`, "g"))].map((x) => x[1]);
    return maxOf(m); } }
  return null;
}
const hostCxx = hostLibMax("libstdc++.so.6", "GLIBCXX"), hostGcc = hostLibMax("libgcc_s.so.1", "GCC");

console.log(`== Binaires natifs de ${dir} (glibc autorisée : ${maxGlibc}${hostCxx ? `, GLIBCXX hôte : ${hostCxx}` : ""})`);
for (const f of files.sort()) {
  let elf; try { elf = parseElf(fs.readFileSync(f)); } catch { elf = null; }
  if (!elf) continue;
  count++;
  const rel = path.relative(dir, f);
  if (elf.unsupported) { out("WARN", `${rel} : ELF non 64 bits petit-boutiste, non analysé`); continue; }
  if (/musl/.test(rel) || elf.needed.some((n) => n.includes("musl"))) { out("info", `${rel} : binaire musl, ignoré (inutilisable avec la glibc, jamais chargé)`); continue; }
  const glibc = maxOf((elf.req["libc.so.6"] ?? []).filter((v) => v.startsWith("GLIBC_") && !v.includes("PRIVATE")).map((v) => v.slice(6)));
  const cxx = maxOf((elf.req["libstdc++.so.6"] ?? []).filter((v) => v.startsWith("GLIBCXX_")).map((v) => v.slice(8)));
  const gcc = maxOf((elf.req["libgcc_s.so.1"] ?? []).filter((v) => v.startsWith("GCC_")).map((v) => v.slice(4)));
  const desc = `${rel} : x86_64=${elf.machine === 62 ? "oui" : `NON(${elf.machine})`}, glibc≥${glibc ?? "-"}, GLIBCXX≥${cxx ?? "-"}, GCC≥${gcc ?? "-"}`;
  let bad = false;
  if (elf.machine !== 62) { out("WARN", `${desc} : architecture différente de x86_64`); continue; }
  if (glibc && cmp(glibc, maxGlibc) > 0) { out("FAIL", `${desc} : exige glibc ${glibc} > ${maxGlibc}`); bad = true; }
  if (cxx && hostCxx && cmp(cxx, hostCxx) > 0) { out("FAIL", `${desc} : exige GLIBCXX_${cxx} > ${hostCxx} (libstdc++ de l'hôte)`); bad = true; }
  if (gcc && hostGcc && cmp(gcc, hostGcc) > 0) { out("FAIL", `${desc} : exige GCC_${gcc} > ${hostGcc} (libgcc_s de l'hôte)`); bad = true; }
  for (const n of elf.needed.filter((n) => !STD.has(n))) {
    if (names.has(n)) continue; // fournie dans l'arborescence (RPATH $ORIGIN)
    if (hostHas(n)) continue;
    out("FAIL", `${desc} : bibliothèque requise introuvable (${n})`); bad = true;
  }
  if (!bad) out("ok", desc);
  if (/\.node$/.test(f)) loadable.push(f);
}

if (doLoad) {
  console.log("== Chargement réel (process.dlopen, un processus par addon)");
  for (const f of loadable) {
    const r = spawnSync(process.execPath, ["-e", "process.dlopen({exports:{}}, process.argv[1])", path.resolve(f)], { encoding: "utf8", timeout: 30000, env: { ...process.env, TOKIO_WORKER_THREADS: "2" } });
    const rel = path.relative(dir, f);
    if (r.status === 0) out("ok", `${rel} : chargé`);
    else out("FAIL", `${rel} : chargement impossible — ${(r.stderr || r.error?.message || "").split("\n").find((l) => /Error|error|version|not found/.test(l))?.trim().slice(0, 200) ?? "raison inconnue"}`);
  }
}

console.log(`== Synthèse : ${count} binaire(s) ELF, ${fails} échec(s), ${warns} avertissement(s)`);
process.exit(fails ? 1 : 0);
