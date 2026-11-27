/* eslint-disable @typescript-eslint/no-require-imports -- point d'entrée CommonJS exécuté tel quel par lsnode */
// Point d'entrée de production (VinaHost / LiteSpeed lsnode). Version suivie dans Git de /home/<compte>/sciences-interactives/server.js.
// Aucun secret ici : toutes les valeurs viennent des variables d'environnement de cPanel.

// Garde de repli : doit rester AVANT tout require().
// Le runtime natif de Next.js (SWC / Tokio) crée sinon autant de threads que de CPU visibles (56 sur l'hébergement, soit 67 threads par instance).
// Une valeur définie dans cPanel est conservée (elle prime) ; seule une variable absente ou vide reçoit la valeur de repli.
if (!process.env.TOKIO_WORKER_THREADS) process.env.TOKIO_WORKER_THREADS = "2";

const http = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
