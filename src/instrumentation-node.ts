// Démarrage du serveur Node.js : en production, arrête le processus (code 1) si la configuration obligatoire est absente ou publique.
// Next.js 15 journalise seulement l'erreur d'un hook d'instrumentation et laisse le serveur répondre en 500 : l'arrêt explicite évite une instance « vivante mais cassée ».
// Le message nomme les variables, jamais leurs valeurs.
import { assertProductionConfig } from "./lib/config";

try {
  assertProductionConfig();
} catch (e) {
  console.error(e instanceof Error ? e.message : "Configuration de production invalide.");
  process.exit(1);
}
