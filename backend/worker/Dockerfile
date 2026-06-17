FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types packages/shared-types
COPY packages/db packages/db
COPY backend/worker backend/worker

RUN pnpm install --frozen-lockfile --filter @multiagent/worker... \
    && pnpm --filter @multiagent/db generate

WORKDIR /app/backend/worker

ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
