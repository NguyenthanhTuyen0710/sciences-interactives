// Tests de bout en bout (Playwright) : pilote l'interface comme un élève.
// Pour chaque exercice, on calcule la bonne réponse avec le générateur (même graine),
// on la saisit dans l'interface, on valide et on vérifie le score de 100 %.
// Usage : BASE_URL=http://localhost:3000 npx tsx scripts/e2e.ts
import { createRequire } from "node:module";
import { STATIC_GENERATORS } from "../src/lib/content/registry-static";
import { createRng } from "../src/lib/engine/rng";
import { perfect } from "../src/lib/engine/solve";
import type { Difficulty, Interaction } from "../src/lib/engine/types";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium, devices } = require("playwright") as typeof import("playwright");
type Page = import("playwright").Page;
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

let failures = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log("  ✔", msg);
  else { failures++; console.log("  ✘", msg); }
};

/** Primitive d'un polynôme écrit sous la forme (c)*x^p + … */
function primitiveOf(expr: string) {
  return [...expr.matchAll(/\((-?[\d.]+)\)\*x\^(\d+)/g)].map(([, c, p]) => `(${c})*x^${Number(p) + 1}/${Number(p) + 1}`).join(" + ");
}

async function fillPart(page: Page, i: number, it: Interaction) {
  const part = page.locator(`[data-part="${i}"]`);
  const r = perfect(it) as never;
  switch (it.kind) {
    case "qcm":
      for (const k of it.answer) await part.locator('[role="radio"],[role="checkbox"]').nth(k).click();
      break;
    case "vrai-faux":
      for (const [k, a] of it.answer.entries()) await part.locator("li").nth(k).getByRole("button", { name: a ? "Vrai" : "Faux", exact: true }).click();
      break;
    case "numerique": {
      const v = r as { value: string; unit?: string };
      await part.getByLabel("Réponse").fill(v.value);
      if (await part.getByLabel("Unité").count()) await part.getByLabel("Unité").selectOption(v.unit!);
      break;
    }
    case "expression":
      await part.getByLabel("Expression").fill(it.primitive ? primitiveOf(it.answer) : it.answer);
      break;
    case "texte-libre":
      await part.getByLabel("Réponse").fill(it.answer[0]);
      break;
    case "texte-trous":
      for (const [k, b] of it.blanks.entries()) {
        const el = part.getByLabel(`Trou ${k + 1}`, { exact: true });
        if (b.type === "select") await el.selectOption(String(b.answer));
        else await el.fill((r as string[])[k]);
      }
      break;
    case "glisser-deposer":
      for (const [z, t] of it.answer.entries()) {
        await part.locator(`[data-token="${t}"]`).click();
        await part.locator(`[data-zone="${z}"]`).click();
      }
      break;
    case "associer":
      for (const [l, rr] of it.answer.entries()) {
        await part.locator(`[data-left="${l}"]`).click();
        await part.locator(`[data-right="${rr}"]`).click();
      }
      break;
    case "classer":
      for (const [k, c] of it.answer.entries()) {
        await part.locator(`[data-item="${k}"]`).click();
        await part.locator(`[data-cat="${c}"]`).click();
      }
      break;
    case "ordonner":
    case "demonstration": {
      const target = it.answer;
      for (let pos = 0; pos < target.length; pos++) {
        const li = part.locator(`[data-item-idx="${target[pos]}"]`);
        const items = await part.locator("[data-item-idx]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-item-idx"))));
        const cur = items.indexOf(target[pos]);
        for (let s = cur; s > pos; s--) await li.getByLabel("Monter").click();
      }
      if (it.kind === "demonstration")
        for (const [k, j] of it.justifications.answer.entries()) await part.locator(`[data-item-idx="${k}"]`).getByLabel("Justification").selectOption(String(j));
      break;
    }
    case "repere": {
      const svg = part.locator("svg");
      const box = (await svg.boundingBox())!;
      for (const [k, p] of it.points.entries()) {
        await part.locator(`[data-point="${k}"]`).click();
        const W = 420, pad = 28;
        const px = pad + ((p.answer[0] - it.xmin) / (it.xmax - it.xmin)) * (W - 2 * pad);
        const py = W - pad - ((p.answer[1] - it.ymin) / (it.ymax - it.ymin)) * (W - 2 * pad);
        await svg.click({ position: { x: (px / W) * box.width, y: (py / W) * box.height } });
      }
      break;
    }
    case "tableau": {
      const v = r as Record<string, string>;
      for (const [key, val] of Object.entries(v)) {
        const [ri, ci] = key.split("-").map(Number);
        await part.getByLabel(`Case ligne ${ri + 1} colonne ${ci + 1}`).fill(val);
      }
      break;
    }
    case "etapes":
      for (const [k, val] of (r as string[]).entries()) await part.getByLabel(`Étape ${k + 1}`).fill(val);
      break;
  }
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(page.url() + " → " + e.message.slice(0, 90)));

  console.log("\n1. Connexion élève");
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
  await page.getByLabel("Adresse e-mail").fill("eleve@demo.fr");
  await page.getByLabel("Mot de passe").fill("demo1234");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/mon-espace");
  ok(await page.getByText("Bonjour Léa Dupont").isVisible(), "connexion et redirection vers Mon espace");
  const before = Number((await page.locator("text=Exercices réalisés").locator("..").locator("p").nth(1).textContent()) ?? 0);

  console.log("\n2. Chaque exercice, piloté par l'interface avec la bonne réponse → 100 %");
  for (const g of process.env.QUICK ? STATIC_GENERATORS.slice(0, 2) : STATIC_GENERATORS) {
    const d = ((STATIC_GENERATORS.indexOf(g) % 3) + 1) as Difficulty;
    const seed = `e2e${g.meta.id.length}${d}`;
    const inst = g.generate(createRng(seed), d);
    await page.goto(`${BASE}/exercice/${g.meta.id}?d=${d}&seed=${seed}`, { waitUntil: "networkidle" });
    for (const [i, p] of inst.parts.entries()) await fillPart(page, i, p.interaction);
    await page.getByRole("button", { name: "Valider" }).click();
    const banner = page.locator("text=/^\\d+ %$/").first();
    await banner.waitFor({ timeout: 10000 });
    const txt = await banner.textContent();
    ok(txt === "100 %", `${g.meta.id} (difficulté ${d}, ${inst.parts.map((p) => p.interaction.kind).join("+")}) → ${txt}`);
  }

  console.log("\n3. Réponse fausse : correction et explication");
  await page.goto(`${BASE}/exercice/m4-equation-premier-degre?d=3&seed=faux1`, { waitUntil: "networkidle" });
  await page.getByLabel("Réponse").fill("0,33");
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByText("Réponse incorrecte").waitFor();
  ok(true, "réponse fausse détectée");
  await page.getByRole("button", { name: "Voir la correction détaillée" }).click();
  ok(await page.getByRole("heading", { name: "Correction détaillée" }).isVisible(), "correction détaillée affichée");
  ok(await page.getByText("Réponse attendue").first().isVisible(), "réponse attendue affichée");
  await page.getByRole("button", { name: "Réessayer le même" }).click();
  ok(await page.getByRole("button", { name: "Valider" }).isVisible(), "« Réessayer » remet l'exercice à zéro");
  const firstStatement = await page.locator("[data-part]").first().locator("..").textContent();
  await page.getByRole("button", { name: "↻ Autre exercice" }).click();
  await page.waitForTimeout(800);
  ok((await page.locator("[data-part]").first().locator("..").textContent()) !== firstStatement, "« Autre exercice » génère de nouvelles valeurs");

  console.log("\n4. Progression enregistrée");
  await page.goto(`${BASE}/mon-espace`, { waitUntil: "networkidle" });
  const after = Number((await page.locator("text=Exercices réalisés").locator("..").locator("p").nth(1).textContent()) ?? 0);
  ok(after >= before + (process.env.QUICK ? 2 : STATIC_GENERATORS.length), `tentatives enregistrées (${before} → ${after})`);
  ok(await page.getByText("Recommandations").isVisible(), "recommandations affichées");

  console.log("\n5. Défi chronométré (série notée sur 20)");
  await page.goto(`${BASE}/revisions/defi?matiere=maths&niveau=4e&d=1`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.getByRole("button", { name: "Valider" }).waitFor();
  ok(await page.getByText(/Exercice 1 \/ \d/).isVisible(), "série démarrée avec chronomètre");

  console.log("\n6. Espace enseignant : création d'un exercice paramétré");
  await page.context().clearCookies();
  await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
  await page.getByLabel("Adresse e-mail").fill("prof@demo.fr");
  await page.getByLabel("Mot de passe").fill("demo1234");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/admin");
  await page.goto(`${BASE}/admin/exercices/nouveau`, { waitUntil: "networkidle" });
  await page.getByLabel("Titre").fill("Test E2E – multiplication");
  await page.locator("select").nth(3).selectOption("m6-calculs");
  await page.locator("select").nth(4).selectOption("m6-calculs-mental");
  await page.getByRole("button", { name: "Aperçu (nouveau tirage)" }).click();
  await page.getByText("Réponse attendue :").first().waitFor();
  ok(true, "aperçu avec tirage aléatoire");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForURL(/\/admin\/exercices\/[0-9a-f-]{36}$/);
  const id = page.url().split("/").pop();
  ok(true, "exercice enregistré en base");
  await page.goto(`${BASE}/exercice/perso-${id}`, { waitUntil: "networkidle" });
  ok(await page.getByRole("heading", { name: "Test E2E – multiplication" }).isVisible(), "exercice enseignant jouable par les élèves");
  const res = await page.request.delete(`${BASE}/api/admin/exercises/${id}`);
  ok(res.ok(), "suppression");
  const anon = await (await browser.newContext()).request.post(`${BASE}/api/admin/exercises`, { data: {} });
  ok(anon.status() === 401, "API d'administration refusée sans connexion");

  console.log("\n7. Mobile");
  const mob = await browser.newPage({ ...devices["iPhone 13"] });
  await mob.goto(`${BASE}/exercice/m5-placer-points?d=1&seed=mob`, { waitUntil: "networkidle" });
  const sw = await mob.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  ok(sw, "pas de défilement horizontal sur mobile");
  await mob.getByLabel("Menu").click();
  ok(await mob.getByRole("link", { name: "Mon espace" }).isVisible(), "menu mobile");

  ok(errors.length === 0, `aucune erreur JavaScript${errors.length ? " : " + errors.join(" | ") : ""}`);
  await browser.close();
  console.log(failures ? `\n${failures} échec(s)` : "\nTous les tests de bout en bout sont passés.");
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
