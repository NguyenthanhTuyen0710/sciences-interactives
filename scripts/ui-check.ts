// Contrôle navigateur QA5 scripté (sans IA) : desktop + mobile, erreurs console, débordement horizontal,
// erreurs KaTeX, activités montées, partie de calcul flash jouée au clavier.
// Usage (serveur lancé, SHOW_DRAFTS=1 pour les brouillons) : PAGES=3e/m3-puissances npx tsx scripts/ui-check.ts
// Pages quelconques (contrôles génériques + lien d'évitement) : PATHS=/,/exercices ; thèmes : THEMES=light,dark (défaut light).
// Pages connectées : AS=hugo@demo.fr,prof@demo.fr (un passage par compte, via POST /api/auth/login ; mot de passe PASSWORD,
// défaut : celui des comptes de démo du seed). Ex. : AS=prof@demo.fr PATHS=/admin,/mon-espace npx tsx scripts/ui-check.ts
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright") as typeof import("playwright");
const OUT = process.env.OUT ?? "shots";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
// PAGES=niveau/chapitre,… (défaut : chapitres 3e du batch 1)
const pages = process.env.PATHS && !process.env.PAGES ? [] : (process.env.PAGES ?? "3e/m3-arithmetique,3e/m3-puissances,3e/m3-pourcentages").split(",");
const paths = (process.env.PATHS ?? "").split(",").filter(Boolean);
const themes = (process.env.THEMES ?? "light").split(",") as ("light" | "dark")[];
const accounts: (string | null)[] = (process.env.AS ?? "").split(",").filter(Boolean);
const PASSWORD = process.env.PASSWORD ?? "demo1234";
let fail = 0;
const ok = (c: boolean, m: string) => { console.log(c ? "  ✔" : "  ✘", m); if (!c) fail++; };
(async () => {
  const browser = await chromium.launch();
  for (const theme of themes) for (const [device, opts] of [["desktop", { viewport: { width: 1280, height: 900 } }], ["mobile", devices["iPhone 13"]]] as const) for (const as of accounts.length ? accounts : [null]) {
    const name = (theme === "light" ? device : `${device}-${theme}`) + (as ? `-${as.split("@")[0]}` : "");
    const ctx = await browser.newContext({ ...opts, colorScheme: theme });
    if (as) {
      const login = await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: as, password: PASSWORD } });
      const me = (await (await ctx.request.get(`${BASE}/api/me`)).json()) as { user: { email: string; role: string } | null };
      console.log(`${name} connexion`);
      ok(login.ok() && me.user?.email === as, `connecté : ${as} (${me.user?.role ?? `HTTP ${login.status()}`})`);
    }
    for (const p of paths) {
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
      console.log(`${name} ${p}`);
      ok(res?.status() === 200, "HTTP 200");
      // Connecté : aucun lien vers /connexion (en-tête « Connexion », message « Se connecter » des pages réservées).
      if (as) ok(await page.locator('a[href="/connexion"]').count() === 0, "page vue connectée (aucun lien de connexion)");
      ok(await page.evaluate((t) => document.documentElement.classList.contains("dark") === (t === "dark"), theme), `thème ${theme} appliqué`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 1, `pas de défilement horizontal (${overflow}px)`);
      ok(await page.locator(".katex-error").count() === 0, "aucune erreur KaTeX");
      await page.screenshot({ path: `${OUT}/${name}${p === "/" ? "-accueil" : p.replace(/[/?=&]+/g, "-")}.png`, fullPage: true });
      await page.keyboard.press("Tab");
      ok(await page.evaluate(() => document.activeElement?.getAttribute("href") === "#contenu"), "lien d'évitement en premier");
      ok(errors.length === 0, `aucune erreur console${errors.length ? " : " + errors.slice(0, 2).join(" | ") : ""}`);
      await page.close();
    }
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
