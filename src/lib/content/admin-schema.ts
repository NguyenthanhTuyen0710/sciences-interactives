import { z } from "zod";
export const metaBody = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().max(300).default(""),
  subject: z.enum(["maths", "pc"]),
  level: z.enum(["6e", "5e", "4e", "3e", "2nde", "1re", "Tle"]),
  chapterId: z.string().min(1),
  notionId: z.string().min(1),
  difficulty: z.number().int().min(1).max(3).default(1),
  published: z.boolean().default(true),
  schema: z.unknown(),
});
