// Authentification : mot de passe haché (bcrypt) + session JWT signée dans un cookie httpOnly.
import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

const COOKIE = "session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-0123456789");

export type Role = "eleve" | "enseignant" | "admin";
export interface SessionUser { id: string; name: string; email: string; role: Role; level: string | null; subjects: string[] }

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, payload.sub));
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, role: u.role, level: u.level, subjects: u.subjects };
  } catch {
    return null;
  }
}

export const isStaff = (u: SessionUser | null) => !!u && (u.role === "enseignant" || u.role === "admin");
