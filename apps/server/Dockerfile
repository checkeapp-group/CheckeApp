FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune --scope=server --docker

FROM node:20-slim AS builder
WORKDIR /app

# Copy pruned files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY --from=pruner /app/out/full/ .

# Copy .env file for build-time
COPY apps/server/.env apps/server/.env

RUN npm ci

# Build with environment variables available
RUN npm run build --filter=server

FROM node:20-slim AS runner
WORKDIR /app
RUN npm install -g turbo

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/package.json /app/apps/server/package.json
COPY --from=builder /app/apps/server/.next /app/apps/server/.next

# Copy .env file for runtime
COPY --from=builder /app/apps/server/.env /app/apps/server/.env

WORKDIR /app/apps/server

EXPOSE 3000
CMD ["npm", "start"]