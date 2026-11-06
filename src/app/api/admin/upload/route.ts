import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { err, json } from "@/lib/http";

// Images uniquement (pas de SVG : risque de script), 2 Mo max, nom de fichier aléatoire.
const ALLOWED: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const MAGIC: Record<string, number[]> = { png: [0x89, 0x50, 0x4e, 0x47], jpg: [0xff, 0xd8, 0xff], gif: [0x47, 0x49, 0x46], webp: [0x52, 0x49, 0x46, 0x46] };

export async function POST(req: Request) {
  const g = await requireStaff();
  if (g.error) return g.error;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return err("Aucun fichier reçu.");
  const ext = ALLOWED[file.type];
  if (!ext) return err("Format non autorisé (PNG, JPEG, WebP ou GIF).");
  if (file.size > 2 * 1024 * 1024) return err("Fichier trop volumineux (2 Mo maximum).");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!MAGIC[ext].every((b, i) => buf[i] === b)) return err("Le contenu du fichier ne correspond pas à son type.");
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  await db.insert(schema.media).values({ ownerId: g.user.id, filename: name, mime: file.type, size: file.size });
  return json({ url: `/uploads/${name}` }, 201);
}
