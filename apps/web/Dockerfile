FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune --scope=web --docker

FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g turbo


# Copia la estructura podada desde la fase anterior
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/out/full/ .

RUN npm install

RUN npm run build --filter=web

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json

COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public

WORKDIR /app/apps/web

EXPOSE 3001
CMD ["npm", "start"]