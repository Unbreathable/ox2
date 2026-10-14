# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV PORT=8000
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY server ./server
COPY src ./src
COPY --from=build /app/dist ./dist
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD sh -c 'wget -qO- "http://127.0.0.1:${PORT:-8000}/" >/dev/null'
CMD ["npx", "tsx", "server/server.ts"]
