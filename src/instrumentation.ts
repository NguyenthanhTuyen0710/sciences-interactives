// Exécuté une fois au démarrage du serveur Next.js (hook officiel `register`).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./instrumentation-node");
}
