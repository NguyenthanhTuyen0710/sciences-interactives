#!/bin/sh
# Attend PostgreSQL, applique les migrations, insère les données de démo (idempotent) puis démarre.
set -e
echo "⏳ Attente de la base de données…"
i=0
until node -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.end()).then(()=>process.exit(0)).catch(()=>process.exit(1))"; do
  i=$((i+1)); [ $i -gt 60 ] && echo "Base inaccessible" && exit 1; sleep 1
done
npm run db:migrate
npm run db:seed
exec npx next start -p 3000
