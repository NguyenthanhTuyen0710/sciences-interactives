import "server-only";
import { getUser, isStaff, type SessionUser } from "./auth";
import { err } from "./http";

/** Renvoie l'utilisateur enseignant/admin, ou une réponse d'erreur. */
export async function requireStaff(): Promise<{ user: SessionUser; error?: undefined } | { user?: undefined; error: Response }> {
  const user = await getUser();
  if (!user) return { error: err("Connexion requise.", 401) };
  if (!isStaff(user)) return { error: err("Accès réservé aux enseignants.", 403) };
  return { user };
}
