FROM node:20-slim AS base
WORKDIR /app

# Prisma needs openssl at runtime for query engine TLS / engine selection
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types packages/shared-types
COPY packages/queue packages/queue
COPY packages/db packages/db
COPY frontend frontend
RUN pnpm install --filter @multiagent/web... \
    && pnpm --filter @multiagent/db generate
WORKDIR /app/frontend
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types packages/shared-types
COPY packages/queue packages/queue
COPY packages/db packages/db
COPY frontend frontend
RUN pnpm install --frozen-lockfile --filter @multiagent/web... \
    && pnpm --filter @multiagent/db generate
WORKDIR /app/frontend
RUN pnpm build
CMD ["pnpm", "start"]
