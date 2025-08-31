FROM node:18 AS backend
WORKDIR /app
COPY backend_nomongo/package*.json ./
RUN npm install
COPY backend_nomongo/ .
EXPOSE 5000
FROM caddy:2
COPY --from=backend /app /app
COPY Caddyfile /etc/caddy/Caddyfile
RUN apt-get update && apt-get install -y nodejs npm
WORKDIR /app
CMD node server.js & caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
