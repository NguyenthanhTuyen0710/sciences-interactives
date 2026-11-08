// Format de la relecture IA (étape « review » de pipeline/run.ts) : JSON imposé par structured outputs
// (output_config.format, accepté par les Message Batches) puis revérifié ici. Une sortie qui ne passe pas
// ce contrôle n'est pas un rapport QA valide.
import { z } from "zod";
import { REVIEW_KEYS } from "../src/lib/chapters/schema";

export const VERDICTS = ["PASS", "FAIL", "NEEDS_REVIEW"] as const;
export const SEVERITIES = ["BLOQUANT", "MAJEUR", "MINEUR"] as const;

/** Ordre des champs = ordre de génération : verdict, puis verdicts par critère, puis constats (les plus graves d'abord). */
export const REVIEW_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "criteria", "findings"],
  properties: {
    verdict: { type: "string", enum: [...VERDICTS] },
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["criterion", "verdict"],
        properties: { criterion: { type: "string", enum: [...REVIEW_KEYS] }, verdict: { type: "string", enum: [...VERDICTS] } },
      },
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["criterion", "severity", "exerciseId", "issue", "fix"],
        properties: {
          criterion: { type: "string", enum: [...REVIEW_KEYS] },
          severity: { type: "string", enum: [...SEVERITIES] },
          exerciseId: { type: "string", description: "identifiant d'exercice ou de jeu, chaîne vide si sans objet" },
          issue: { type: "string" },
          fix: { type: "string" },
        },
      },
    },
  },
} as const;

const Finding = z.object({ criterion: z.enum(REVIEW_KEYS), severity: z.enum(SEVERITIES), exerciseId: z.string(), issue: z.string().min(1), fix: z.string().min(1) }).strict();
export const ReviewSchema = z
  .object({ verdict: z.enum(VERDICTS), criteria: z.array(z.object({ criterion: z.enum(REVIEW_KEYS), verdict: z.enum(VERDICTS) }).strict()), findings: z.array(Finding) })
  .strict()
  .superRefine((r, ctx) => {
    const seen = r.criteria.map((c) => c.criterion);
    for (const k of REVIEW_KEYS) if (seen.filter((s) => s === k).length !== 1) ctx.addIssue({ code: "custom", message: `critère ${k} absent ou en double` });
    const rank = r.findings.map((f) => SEVERITIES.indexOf(f.severity));
    if (rank.some((x, i) => i > 0 && x < rank[i - 1])) ctx.addIssue({ code: "custom", message: "constats non triés par gravité décroissante" });
    if (r.verdict === "PASS" && r.findings.some((f) => f.severity !== "MINEUR")) ctx.addIssue({ code: "custom", message: "verdict PASS avec un constat BLOQUANT ou MAJEUR" });
  });
export type Review = z.infer<typeof ReviewSchema>;

/** Analyse et contrôle la sortie ; renvoie les erreurs au lieu de lever. */
export function parseReview(text: string): { ok: true; review: Review } | { ok: false; errors: string[] } {
  let json: unknown;
  try { json = JSON.parse(text); } catch (e) { return { ok: false, errors: [`JSON illisible : ${(e as Error).message}`] }; }
  const r = ReviewSchema.safeParse(json);
  return r.success ? { ok: true, review: r.data } : { ok: false, errors: r.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`) };
}

/** Rapport Markdown lisible (le JSON validé reste joint, source de vérité). */
export function reviewMarkdown(r: Review, header: string): string {
  const rows = r.criteria.map((c) => `| ${c.criterion} | ${c.verdict} |`).join("\n");
  const findings = r.findings.length
    ? r.findings.map((f, i) => `${i + 1}. **${f.severity}** · ${f.criterion}${f.exerciseId ? ` · \`${f.exerciseId}\`` : ""} — ${f.issue}\n   - Correction proposée : ${f.fix}`).join("\n")
    : "Aucun constat.";
  return `${header}\n\n**Verdict : ${r.verdict}**\n\n| Critère | Verdict |\n|---|---|\n${rows}\n\n## Constats\n${findings}\n\n<details><summary>JSON validé</summary>\n\n\`\`\`json\n${JSON.stringify(r, null, 1)}\n\`\`\`\n</details>\n`;
}

/** Motif d'inutilisabilité d'une sortie payée (null : utilisable). Tronquée ou refusée : jamais un résultat valide. */
export function outputProblem(step: string, stopReason: string | null, text: string): string | null {
  if (stopReason === "max_tokens") return "sortie tronquée (max_tokens atteint)";
  if (stopReason === "refusal") return "refus du modèle";
  if (step === "review") { const r = parseReview(text); if (!r.ok) return `JSON hors schéma : ${r.errors.slice(0, 5).join(" ; ")}`; }
  return null;
}
