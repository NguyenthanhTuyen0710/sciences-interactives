# Image de démonstration : construit l'application et l'exécute (migrations + données de démo au démarrage).
FROM node:22-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh", "docker/start.sh"]
