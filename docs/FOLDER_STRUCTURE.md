# Folder Structure

```
seleric_systems/
│
├── frontend/                           # Next.js 14 · App Router · Port 3000 / 3007 (dev)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout (Clerk auth, global nav)
│   │   │   ├── page.tsx                # Root redirect → /dashboard
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   └── sign-up/page.tsx
│   │   │   ├── dashboard/page.tsx      # P&L overview (Server Component)
│   │   │   ├── ads/                    # Ad performance + campaign detail + neurotag
│   │   │   ├── attribution/page.tsx
│   │   │   ├── chat/page.tsx           # AI chat UI
│   │   │   ├── control/                # Approvals, history, rules sub-pages
│   │   │   ├── insights/page.tsx
│   │   │   ├── pnl/page.tsx
│   │   │   ├── shopify/page.tsx
│   │   │   ├── tools/cogs-simulation/  # COGS simulator
│   │   │   └── api/                    # Next.js API routes (BFF layer)
│   │   │       ├── chat/route.ts       # Streaming LLM endpoint (3-model routing)
│   │   │       ├── chat/creative-iq/route.ts
│   │   │       ├── approvals/route.ts
│   │   │       ├── approvals/[id]/route.ts  # HMAC approval decision + BullMQ enqueue
│   │   │       ├── insights/route.ts
│   │   │       ├── insights/[id]/route.ts
│   │   │       ├── control/stats/route.ts
│   │   │       ├── actions/history/route.ts
│   │   │       ├── ads/placement/route.ts
│   │   │       ├── ads/engagement/route.ts
│   │   │       ├── neurotag/ads/route.ts
│   │   │       ├── tools/cogs-data/route.ts
│   │   │       ├── debug/cube/route.ts
│   │   │       └── health/route.ts
│   │   ├── components/                 # 87 React UI components organized by domain
│   │   │   ├── attribution/            # 5 files
│   │   │   ├── charts/                 # 27 files — pure rendering
│   │   │   ├── chat/                   # 19 files — AI chat UI + sub-charts + insights
│   │   │   ├── cogs/                   # 8 files — COGS simulator inputs/display
│   │   │   ├── control/                # 2 files — approval cards
│   │   │   ├── dashboard/              # 10 files — KPI panels, filters, agent activity
│   │   │   ├── insight/                # Insight card display
│   │   │   └── layout/                 # Shell, Sidebar, Header
│   │   ├── hooks/
│   │   │   └── useChartTheme.ts        # Theme palette utility
│   │   ├── lib/
│   │   │   ├── chat/                   # 12 files: model routing, tools, system prompts
│   │   │   │   ├── model.ts            # 3-model resolver (data/analysis/fallback)
│   │   │   │   ├── system-prompt.ts
│   │   │   │   ├── domain-context.ts
│   │   │   │   ├── computed-query.ts
│   │   │   │   └── tools/              # 6 tool modules
│   │   │   ├── dashboard/              # 12 files: Cube query builders per domain
│   │   │   │   ├── queries/            # 10 query builder files
│   │   │   │   ├── page-helpers.ts
│   │   │   │   ├── transforms.ts
│   │   │   │   ├── brand-filter.ts
│   │   │   │   └── date-ranges.ts
│   │   │   ├── services/               # 4 Prisma-backed service files
│   │   │   │   ├── approval.service.ts
│   │   │   │   ├── insight.service.ts
│   │   │   │   ├── action.service.ts
│   │   │   │   └── control.service.ts
│   │   │   ├── api/                    # Typed client-side API wrappers
│   │   │   │   └── python-proxy.ts     # Proxy to Python orchestrator
│   │   │   ├── clickhouse-client.ts    # Raw ClickHouse HTTP client
│   │   │   ├── cube-client.ts          # MCP-tool shim → cube-presets
│   │   │   ├── cube-presets.ts         # Named Cube query helpers
│   │   │   ├── cube-rest.ts            # Cube REST POST client (JWT auth)
│   │   │   ├── cube-parse.ts           # Cube response → JS arrays
│   │   │   ├── cogs-engine.ts          # COGS simulation engine (pure functions)
│   │   │   ├── campaign-sku-matcher.ts # Campaign-SKU matching (pure functions)
│   │   │   ├── prisma.ts               # PrismaClient singleton
│   │   │   └── server-log.ts           # In-process ring-buffer logger
│   │   └── generated/                  # Auto-generated files (do not edit)
│   ├── Dockerfile
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── orchestrator/                   # Python · FastAPI + LangGraph · Port 8000
│   │   ├── src/
│   │   │   ├── main.py                 # FastAPI entry point
│   │   │   ├── graph.py                # LangGraph StateGraph definition
│   │   │   ├── api/                    # /signal, /health, /status/{trace_id}
│   │   │   ├── nodes/                  # validate_signal, assemble_context, guardrail, dispatch
│   │   │   ├── prompts/                # Jinja2 prompt templates per agent
│   │   │   ├── memory/                 # Redis, pgvector, Cube clients
│   │   │   ├── tools/                  # ClickHouse query tool, pipeboard client
│   │   │   └── schemas/                # Pydantic models (Signal, Insight, Action, Agent)
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── agents/                         # Python · LangGraph node packages (imported by orchestrator)
│   │   ├── insight/src/                # agent.py, tools.py, parser.py
│   │   ├── meta/src/                   # agent.py, tools.py (Pipeboard), parser.py
│   │   ├── shopify/src/                # agent.py, tools.py (Shopify MCP), parser.py
│   │   └── guardrail/src/              # agent.py, rules_loader.py, classifier.py
│   │
│   ├── creative_intelligence/          # Python · Creative scoring utilities
│   │   └── neuro_scorer.py
│   │
│   ├── worker/                         # Node.js · BullMQ · Background jobs
│   │   ├── src/
│   │   │   ├── index.ts                # Worker entry point, queue registrations
│   │   │   ├── queues.ts               # Queue name constants + BullMQ instances
│   │   │   ├── jobs/                   # execute-action, send-notification, record-outcome, embed-insight
│   │   │   ├── processors/             # pipeboard.ts, shopify.ts, notifications.ts
│   │   │   └── lib/                    # db.ts, redis.ts, anthropic.ts
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── mcp-shopify/                    # Node.js · MCP SDK · SSE · Port 3100
│   │   ├── src/
│   │   │   ├── server.ts               # MCP server entry point
│   │   │   ├── tools/                  # get-products, get-orders, get-inventory, update-product, create-discount
│   │   │   ├── handlers/shopify-client.ts  # Shopify Admin API wrapper
│   │   │   └── lib/write-guard.ts      # Checks WRITE_ENABLED env var
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── scripts/                        # Data analysis and reconciliation scripts
│       ├── _verify_dashboard_may.py
│       ├── build_pnl_workbook.py
│       ├── reconcile_cogs_pnl.py
│       ├── reconcile_daily_pnl_audit.py
│       ├── daily_pnl_2026_ytd.sql
│       └── *.csv / *.xlsx              # Output data snapshots
│
├── packages/                           # Shared TypeScript packages (pnpm workspace)
│   ├── db/                             # Prisma schema — single source of truth
│   │   ├── prisma/schema.prisma        # All models (Signal, Insight, PendingAction, AuditLog)
│   │   └── src/client.ts
│   ├── shared-types/                   # TypeScript contracts (no runtime deps)
│   │   └── src/                        # signal.ts, insight.ts, action.ts, index.ts
│   ├── queue/                          # BullMQ queue abstractions
│   │   └── index.ts
│   └── config/                         # Zod env schema validation
│       └── src/env.ts
│
├── config/
│   └── rules.yaml                      # Guardrail rules — edit without code changes
│
├── infra/
│   ├── docker/
│   │   ├── postgres/init.sql           # pgvector extension + indexes
│   │   └── clickhouse/                 # ClickHouse table definitions
│   ├── nginx/
│   │   ├── nginx.conf                  # Production reverse proxy
│   │   └── multiagent.seleric.com.conf
│   └── scripts/
│       ├── setup-dev.sh                # One-command dev environment setup
│       ├── seed-test-data.sh           # Seed ClickHouse + Postgres with test data
│       ├── check-connections.sh        # Validate all external service connections
│       ├── test-phase1.sh
│       └── test-phase2.sh
│
├── docs/                               # Architecture and reference documentation
│   ├── rebuild/                        # Architecture audit + refactor plan
│   ├── calculation_and_queries/        # Business calculation definitions
│   └── *.md                            # ARCHITECTURE, DATA_FLOW, CHAT, TECH_STACK, etc.
│
├── .cursor/rules/                      # Cursor IDE coding rules per domain
├── docker-compose.yml                  # Dev stack (postgres, redis, all services)
├── docker-compose.prod.yml             # Production overrides
├── docker-compose.override.yml
├── Jenkinsfile                         # CI/CD: GitHub → rsync → docker compose
├── start.ps1                           # Windows: starts orchestrator + pnpm dev
├── start.sh                            # macOS/Linux: starts orchestrator + pnpm dev
├── turbo.json                          # Turborepo pipeline config
├── pnpm-workspace.yaml                 # Workspace packages: frontend, backend/worker, backend/mcp-shopify, packages/*
├── package.json                        # Root (pnpm workspace scripts + turbo)
├── .env.example                        # All env vars with descriptions
└── .gitignore
```

## Key File Responsibilities

| File | Responsibility |
|---|---|
| `backend/orchestrator/src/graph.py` | LangGraph StateGraph — nodes and edges wired together |
| `backend/orchestrator/src/nodes/assemble_context.py` | Redis + pgvector + Cube context fetch |
| `backend/agents/guardrail/src/classifier.py` | Guardrail rule evaluation — all classification logic |
| `config/rules.yaml` | Guardrail thresholds — edit to change behaviour without code changes |
| `frontend/src/app/api/chat/route.ts` | Chat endpoint — 3-model routing, streaming LLM response |
| `frontend/src/app/api/approvals/[id]/route.ts` | Approval endpoint — HMAC verification, BullMQ enqueue |
| `backend/worker/src/jobs/execute-action.ts` | Actual MCP write call — only place production writes happen |
| `backend/worker/src/jobs/record-outcome.ts` | Outcome measurement — feeds back to signal calibration |
| `packages/db/prisma/schema.prisma` | Single source of truth for all database models |
| `frontend/src/lib/chat/model.ts` | 3-model resolver (data / analysis / fallback) |
| `frontend/src/lib/services/approval.service.ts` | HMAC verification, status transitions, audit log |
