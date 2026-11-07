// Contrôle navigateur QA5 scripté (sans IA) : desktop + mobile, erreurs console, débordement horizontal,
// erreurs KaTeX, activités montées, partie de calcul flash jouée au clavier.
// Usage (serveur lancé, SHOW_DRAFTS=1 pour les brouillons) : PAGES=3e/m3-puissances npx tsx scripts/ui-check.ts
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright") as typeof import("playwright");
const OUT = process.env.OUT ?? "shots";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
// PAGES=niveau/chapitre,… (défaut : chapitres 3e du batch 1)
const pages = (process.env.PAGES ?? "3e/m3-arithmetique,3e/m3-puissances,3e/m3-pourcentages").split(",");
let fail = 0;
const ok = (c: boolean, m: string) => { console.log(c ? "  ✔" : "  ✘", m); if (!c) fail++; };
(async () => {
  const browser = await chromium.launch();
  for (const [name, opts] of [["desktop", { viewport: { width: 1280, height: 900 } }], ["mobile", devices["iPhone 13"]]] as const) {
    const ctx = await browser.newContext(opts);
    for (const p of pages) {
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(`${BASE}/mathematiques/${p}`, { waitUntil: "networkidle" });
      console.log(`${name} ${p}`);
      ok(res?.status() === 200, "HTTP 200");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 1, `pas de défilement horizontal (${overflow}px)`);
      const katexErr = await page.locator(".katex-error").count();
      ok(katexErr === 0, `aucune erreur KaTeX (${katexErr})`);
      const games = await page.locator("section[aria-labelledby$='-t']").count();
      ok(games >= 3, `activités montées (${games})`);
      // Calcul flash : entraînement, une réponse fausse puis une réponse quelconque, au clavier.
      const host = page.locator("section[aria-labelledby$='-t']", { has: page.getByRole("button", { name: /Entraînement sans chrono/ }) }).first();
      if (await host.count()) {
        const flash = page.locator(`section[aria-labelledby="${await host.getAttribute("aria-labelledby")}"]`);
        await flash.getByRole("button", { name: /Entraînement sans chrono/ }).click();
        const input = flash.getByLabel("Ta réponse");
        await input.fill("abc"); await input.press("Enter");
        ok(await flash.getByRole("status").filter({ hasText: "Écris un nombre" }).count() > 0, "saisie illisible signalée");
        await input.fill("999999"); await input.press("Enter");
        ok(await flash.getByText(/Question précédente/).count() > 0, "réponse fausse corrigée avec explication");
      }
      ok(errors.length === 0, `aucune erreur console${errors.length ? " : " + errors.slice(0, 2).join(" | ") : ""}`);
      await page.screenshot({ path: `${OUT}/${name}-${p.replace("/", "-")}.png`, fullPage: false });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fail ? `ÉCHECS : ${fail}` : "TOUT EST VERT");
  process.exit(fail ? 1 : 0);
})();
