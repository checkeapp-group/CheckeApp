FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune --scope=server --docker

FROM node:20-slim AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/out/full/ .

RUN npm install

RUN npm run build --filter=server

FROM node:20-slim AS runner
WORKDIR /app
RUN npm install -g turbo

ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/package.json /app/apps/server/package.json

COPY --from=builder /app/apps/server/.next /app/apps/server/.next
COPY --from=builder /app/apps/server/public /app/apps/server/public

WORKDIR /app/apps/server

EXPOSE 3000
CMD ["npm", "start"]