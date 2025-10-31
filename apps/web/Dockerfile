FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune --scope=web --docker

FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g turbo

# Copy pruned files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/out/full/ .

COPY .env.prod apps/web/.env

RUN npm ci

# Build with environment variables available
RUN npm run build --filter=web

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public


WORKDIR /app/apps/web

EXPOSE 3001
CMD ["npm", "start"]