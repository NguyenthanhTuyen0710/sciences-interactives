# Consignes du projet

## Après chaque tâche : ouvrir l'application pour vérification

Une fois la tâche terminée (tests passés, commit/push effectués), **toujours lancer l'application en local et la présenter à l'utilisateur** pour qu'il vérifie directement dans l'interface web :

1. Base PostgreSQL disponible (`DATABASE_URL` dans `.env`, copié depuis `.env.example`). Si aucune base ne tourne, en démarrer une puis exécuter `npm run setup` (migrations + données de démonstration).
2. Dépendances installées : `npm install --legacy-peer-deps` si `node_modules` est absent.
3. Lancer le serveur en arrière-plan : `npm run dev` (port 3000) et attendre que `http://localhost:3000` réponde 200.
4. Signaler le port à l'utilisateur (session cloud : outil `report_preview_port` avec le port réel lu dans la sortie du serveur) et donner les pages à vérifier pour la tâche, ainsi qu'un compte de démonstration (`eleve@demo.fr` / `demo1234`, `prof@demo.fr` / `demo1234`).
