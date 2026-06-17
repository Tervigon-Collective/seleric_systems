# Architecture Audit

> Generated: 2026-06-17. Branch: phase-1.
> Purpose: Establish a clear baseline before any refactoring begins.

---

## 1. Current Folder Structure

```
seleric_systems/                           # Monorepo root
├── frontend/                              # Next.js 14 (App Router) — UI only
│       └── src/
│           ├── app/                       # Pages + API routes (Next.js routing)
│           │   ├── (auth)/                # Sign-in / sign-up pages
│           │   ├── ads/                   # Ad performance pages + [campaignId], neurotag
│           │   ├── api/                   # Backend API routes (see §3)
│           │   │   ├── actions/history/
│           │   │   ├── ads/engagement/, ads/placement/
│           │   │   ├── approvals/, approvals/[id]/
│           │   │   ├── campaigns/         # stub (returns ok)
│           │   │   ├── chat/              # Main LLM route + creative-iq sub-route
│           │   │   ├── control/stats/
│           │   │   ├── debug/cube/
│           │   │   ├── health/
│           │   │   ├── insights/, insights/[id]/, insights/stream/
│           │   │   ├── metrics/           # stub
│           │   │   ├── neurotag/ads/
│           │   │   ├── tools/cogs-data/
│           │   │   └── webhooks/shopify/  # stub
│           │   ├── attribution/
│           │   ├── chat/
│           │   ├── control/               # approvals, history, rules sub-pages
│           │   ├── dashboard/
│           │   ├── insights/
│           │   ├── pnl/
│           │   ├── shopify/
│           │   └── tools/cogs-simulation/
│           ├── components/                # React UI components
│           │   ├── attribution/           # 5 files
│           │   ├── charts/                # 27 files — pure rendering
│           │   ├── chat/                  # 19 files — AI chat UI + sub-charts + insights
│           │   ├── cogs/                  # 8 files — COGS simulator inputs/display
│           │   ├── control/               # 2 files — approval cards
│           │   ├── dashboard/             # 10 files — KPI panels, filters, agent activity
│           │   ├── insight/               # insight card display
│           │   └── layout/                # Shell, Sidebar, Header
│           ├── hooks/
│           │   └── useChartTheme.ts       # 1 file — theme colors only
│           └── lib/                       # ⚠ catch-all backend — 73+ files
│               ├── chat/                  # 12 files: model routing, tools, system prompts
│               │   ├── model.ts           # 3-model resolver (data/analysis/fallback)
│               │   ├── system-prompt.ts   # System prompt builder
│               │   ├── domain-context.ts  # Domain filter parsing
│               │   ├── computed-query.ts  # In-memory data transforms
│               │   ├── visualization/     # Chart detection, INR formatting, binning
│               │   └── tools/             # 6 tool modules (pnl, query, schema, python, creative-iq, page-context)
│               ├── dashboard/             # 12 files: Cube query builders per domain
│               │   ├── queries/           # 10 query builder files (pnl, attribution, ads, neurotag, etc.)
│               │   ├── page-helpers.ts    # Chart data transformation
│               │   ├── transforms.ts      # Row slicing/sorting
│               │   ├── brand-filter.ts    # Brand dimension injection
│               │   └── date-ranges.ts
│               ├── services/              # 4 service files (Prisma-backed business logic)
│               │   ├── approval.service.ts
│               │   ├── insight.service.ts
│               │   ├── action.service.ts
│               │   └── control.service.ts
│               ├── clickhouse-client.ts   # Raw ClickHouse HTTP client
│               ├── cube-client.ts         # MCP-tool shim → cube-presets
│               ├── cube-presets.ts        # Named Cube query helpers
│               ├── cube-rest.ts           # Cube REST POST client (JWT auth)
│               ├── cube-parse.ts          # Cube response → JS arrays
│               ├── cogs-engine.ts         # COGS simulation engine (pure functions)
│               ├── campaign-sku-matcher.ts # Campaign-SKU matching (pure functions)
│               ├── prisma.ts              # PrismaClient singleton
│               └── server-log.ts          # In-process ring-buffer logger
│
├── backend/                               # All server-side code
│   ├── orchestrator/                      # Python FastAPI + LangGraph
│   │   └── src/{main,graph,api,db,llm,memory,nodes,prompts,schemas,tools}/
│   ├── agents/                            # Python LangGraph node modules
│   │   └── {guardrail,insight,meta,shopify}/src/{agent,parser,tools}.py
│   ├── worker/                            # Node.js BullMQ job processor
│   │   └── src/{index,jobs,processors,lib}/
│   └── mcp-shopify/                       # Node.js MCP server (Shopify tools)
│       └── src/server.ts
│
├── packages/                              # Shared packages (well-structured)
│   ├── db/                                # Prisma schema — single source of truth
│   │   └── prisma/schema.prisma
│   ├── shared-types/                      # TypeScript contracts (no runtime deps)
│   │   └── src/{action,insight,signal,index}.ts
│   ├── queue/                             # BullMQ queue abstractions
│   └── config/                            # Zod env schema
│
├── config/rules.yaml                      # Guardrail rules (YAML, no redeploy needed)
├── infra/                                 # Docker, Nginx, init SQL, scripts
├── docs/                                  # Architecture docs
└── docker-compose.yml                     # Dev stack (postgres, redis, all services)
```

---

## 2. Where Frontend Code Lives

**Pages** (`apps/web/src/app/`):
- Server components (async, data-fetching): `dashboard/`, `pnl/`, `ads/`, `attribution/`, `shopify/`
- Client components (`"use client"`): `control/`, `insights/`, `chat/`, `tools/cogs-simulation/`
- Auth pages: `(auth)/sign-in`, `(auth)/sign-up`

**UI Components** (`apps/web/src/components/`):
- 87 files organized by domain
- Pure rendering: `charts/` (27 files), `layout/`, `cogs/display` components
- Client-interactive: `chat/ChatView.tsx`, `dashboard/AgentActivityPanel.tsx`, `control/ApprovalCard.tsx`

**Hooks** (`apps/web/src/hooks/`):
- 1 file: `useChartTheme.ts` (returns theme palette — pure utility)
- No data-fetching hooks exist; fetching is inlined into pages

**State management**: No Zustand stores. React `useState` + SWR for data, React Context for chat domain.

---

## 3. Where Backend / Server Code Lives

**API Routes** (`apps/web/src/app/api/`) — 18 route files:

| Route | Method | Purpose | Concern level |
|-------|--------|---------|---------------|
| `chat/route.ts` | POST | LLM streaming, 3-model routing, tool calling | HIGH — orchestration in a route |
| `chat/creative-iq/route.ts` | POST | Neurotag scoring + funnel data | MEDIUM — scoring logic inline |
| `insights/route.ts` | GET | List insights (Prisma) | Clean |
| `insights/[id]/route.ts` | PATCH | Dismiss/snooze insight | Clean |
| `approvals/route.ts` | GET | List pending approvals | Clean |
| `approvals/[id]/route.ts` | GET+POST | HMAC approval decision + BullMQ enqueue | Clean (delegates to service) |
| `control/stats/route.ts` | GET | Control panel aggregates | Clean |
| `actions/history/route.ts` | GET | Executed action history | Clean |
| `ads/placement/route.ts` | GET | Placement-grain Cube query | Clean |
| `ads/engagement/route.ts` | GET | Engagement breakdown Cube query | Clean |
| `neurotag/ads/route.ts` | GET | Neurotag ad performance | Clean |
| `tools/cogs-data/route.ts` | GET | SKU economics + campaign spend | MEDIUM — normalization logic inline |
| `debug/cube/route.ts` | GET | Cube schema/query debug (dev only) | OK |
| `health/route.ts` | GET | Liveness check | OK |
| `campaigns/route.ts` | GET | Stub | — |
| `metrics/route.ts` | GET | Stub | — |
| `insights/stream/route.ts` | GET | Stub | — |
| `webhooks/shopify/route.ts` | POST | Stub | — |

**Services** (`apps/web/src/lib/services/`) — 4 files, backed by Prisma:
- `approval.service.ts` — HMAC verification, status transitions, BullMQ enqueue
- `insight.service.ts` — paginated fetch, dismiss, snooze
- `action.service.ts` — executed action history with outcomes
- `control.service.ts` — 7/30-day aggregates for control panel

**External services** (properly isolated):
- `services/orchestrator/` — Python FastAPI + LangGraph; multi-agent graph execution
- `services/worker/` — Node.js BullMQ; async action execution
- `services/mcp-shopify/` — Node.js MCP server; Shopify tool definitions

---

## 4. Where Business Logic Lives

| Logic | File | Type | Problem? |
|-------|------|------|---------|
| COGS simulation (classify, scenarios) | `lib/cogs-engine.ts` | Pure functions | ✅ Clean |
| Campaign-SKU matching, CAC, ROAS | `lib/campaign-sku-matcher.ts` | Pure functions | ✅ Clean |
| Chart data transformation (waterfall, funnel slices) | `lib/dashboard/page-helpers.ts` | Pure functions | ✅ Clean |
| Row slicing/sorting | `lib/dashboard/transforms.ts` | Pure functions | ✅ Clean |
| COGS breakdown from P&L rows | `lib/dashboard/cogs-breakdown.ts` | Pure functions | ✅ Clean |
| In-memory query transforms (group_by, top_n, formula cols) | `lib/chat/computed-query.ts` | Pure functions | ✅ Clean |
| Metric derivation (CAC, LTV, LTV:CAC) | `lib/chat/visualization/derive-metrics.ts` | Pure functions | ✅ Clean |
| INR currency formatting, chart binning | `lib/chat/visualization/` | Utilities | ✅ Clean |
| Approval workflow (HMAC, transitions, audit log) | `lib/services/approval.service.ts` | Service | ✅ Clean |
| Insight lifecycle (dismiss, snooze) | `lib/services/insight.service.ts` | Service | ✅ Clean |
| Control stats aggregation | `lib/services/control.service.ts` | Service | ✅ Clean |
| Neurotag scoring (classification of ad performance) | `api/chat/creative-iq/route.ts` | ⚠ Inline in route | Belongs in service |
| SKU per-unit cost normalization | `api/tools/cogs-data/route.ts` | ⚠ Inline in route | Belongs in service |
| Variant ASP calculation | `app/tools/cogs-simulation/page.tsx` | ⚠ Inline in UI | Duplicates `campaign-sku-matcher.ts` |
| CAC calculation (variant-level) | `app/tools/cogs-simulation/page.tsx` | ⚠ Inline in UI | Duplicates `campaign-sku-matcher.ts` |
| Date normalization | `app/tools/cogs-simulation/page.tsx` | ⚠ Inline in UI | Already in `lib/dashboard/date-ranges.ts` |
| Guardrail rules evaluation | `config/rules.yaml` + Python `services/agents/guardrail/` | YAML + Python | ✅ Clean |
| LLM model routing (3 models) | `lib/chat/model.ts` | Library | ✅ Clean (but complex) |

---

## 5. Where Database Access Happens

### Prisma (PostgreSQL — application state)
- **Client**: `lib/prisma.ts` — singleton pattern, globalForPrisma to prevent pool exhaustion in dev
- **Tables**: Signal, Insight, PendingAction, InsightOutcome, AuditLog, AgentConfig
- **Call sites** (all through services, no raw Prisma in routes):
  - `lib/services/approval.service.ts` — PendingAction, AuditLog reads/writes
  - `lib/services/insight.service.ts` — Insight reads/updates
  - `lib/services/action.service.ts` — PendingAction reads with nested includes
  - `lib/services/control.service.ts` — groupBy/aggregate queries

### ClickHouse (OLAP — gold layer data)
- **Client**: `lib/clickhouse-client.ts` — raw HTTP POST, JWT auth, FORMAT JSONEachRow, line-delimited JSON parsing
- **Call sites**:
  - `lib/dashboard/queries/pnl-clickhouse.ts` — `SELECT` on `gold.fct_daily_pnl` for canonical P&L reconciliation
  - `lib/dashboard/queries/attribution-clickhouse.ts` — attribution queries direct to ClickHouse
- **Pattern concern**: ClickHouse is also the backing store for Cube; some queries go direct (bypassing semantic layer) while others go via Cube. The split is intentional (reconciliation) but undocumented.

### Cube.js REST (semantic layer over ClickHouse)
- **Clients**: `lib/cube-rest.ts` (HTTP POST, JWT), `lib/cube-presets.ts` (named helpers), `lib/cube-client.ts` (MCP shim)
- **Schema cache**: 1-hour in-memory TTL
- **Call sites** (via query builders in `lib/dashboard/queries/`):
  - `main.ts`, `pnl.ts`, `attribution.ts`, `ad-funnel.ts`, `neurotag.ts`, `ads.ts`, `icp.ts`, `shopify.ts`
  - Also used by chat tool modules in `lib/chat/tools/`
  - Also called directly from `api/ads/placement/`, `api/ads/engagement/`, `api/neurotag/ads/`
- **Named presets**: `cube_daily_pnl`, `cube_channel_pnl`, `cube_query`, `cube_meta`

### Python Orchestrator (separate service — has its own data access)
- **asyncpg** → PostgreSQL (same DB, different connection pool)
- **pgvector** → vector embedding storage/search
- **redis-py** → Redis session cache
- **httpx** → Cube semantic layer (via SELERIC_MCP_URL or CUBE_MCP_URL)

---

## 6. Where External API Calls Happen

| Integration | Where Called | Pattern | Concern? |
|------------|-------------|---------|---------|
| Anthropic / OpenAI / Azure OpenAI | `lib/chat/model.ts` → `api/chat/route.ts` | AI SDK `streamText()` / `generateText()` | ✅ Centralized |
| Cube semantic layer | `lib/cube-rest.ts` + `lib/cube-client.ts` | HTTP POST + JWT | ✅ Centralized |
| ClickHouse | `lib/clickhouse-client.ts` | Raw HTTP | ✅ Centralized |
| BullMQ / Redis (job enqueue) | `lib/services/approval.service.ts` | `new Queue()` per call | ⚠ Queue connection created and closed per request |
| Shopify (MCP) | `services/mcp-shopify/src/server.ts` | MCP SSE server | ✅ Isolated service |
| Meta Ads | Via Cube gold layer (no direct API calls in `apps/web`) | Synced via dbt | ✅ |
| Google Ads | Via Cube gold layer (no direct API calls in `apps/web`) | Synced via dbt | ✅ |
| Slack notifications | `services/worker/src/` | `@slack/webhook` | ✅ Isolated in worker |
| Resend (email) | `services/worker/src/` | `resend` SDK | ✅ Isolated in worker |
| Sentry | Configured via env (`SENTRY_DSN`) | Framework-level | ✅ |

---

## 7. Feature-Specific Logic Mixed into UI

### HIGH severity

**`app/tools/cogs-simulation/page.tsx`** — `"use client"` page that does all of:
- `fetch('/api/tools/cogs-data')` — data loading
- `groupSkusByProduct()`, `matchCampaignsToProducts()` from `lib/campaign-sku-matcher.ts` — data transformation (imported correctly but called inline)
- Variant ASP calculation (lines ~130–157) — duplicates `resolveVariantCac()` logic
- CAC resolution (lines ~144, 167) — duplicates `resolveProductCac()` 
- `simulate(inputs)` from `lib/cogs-engine.ts` — simulation (imported correctly)
- 7 `useState` hooks, 3 `useEffect` chains
- Date string utilities `todayStr()`, `daysAgoStr()`, `normalizeDateRange()` — duplicates `lib/dashboard/date-ranges.ts`
- All rendering

**`components/chat/ChatView.tsx`** — `"use client"` component that:
- Runs `useChat` (AI SDK) with custom transport to `/api/chat`
- Builds request body with domain context injection
- Contains `parseStreamError()` — rate-limit detection logic that belongs in the API client layer
- Manages scroll ref, message partitioning, clarification state
- 4 useState + 1 useRef

**`components/dashboard/AgentActivityPanel.tsx`** — `"use client"` component that:
- Makes 3 concurrent SWR calls with `refreshInterval: 30_000` to `/api/approvals`, `/api/insights`, `/api/actions/history`
- Contains `scoreColor()` — conditional color logic for outcome scoring
- Slices and transforms fetched data inline

### MEDIUM severity

**`app/insights/page.tsx`** — `"use client"` page with:
- SWR data fetching
- Direct `fetch()` PATCH calls for dismiss/snooze mutations
- Local state for expanded, acting, snoozeOpen

**`app/control/page.tsx`** — `"use client"` page with:
- SWR data fetching
- `pct()` percentage formatting function defined inline

**`app/control/approvals/page.tsx`** — `"use client"` page with:
- SWR with optimistic mutate callback

---

## 8. Duplicated Logic

| Logic | Canonical location | Duplicate location |
|-------|-------------------|--------------------|
| Variant ASP / CAC calculation | `lib/campaign-sku-matcher.ts` (`resolveVariantCac`) | `app/tools/cogs-simulation/page.tsx` (inline) |
| Date normalization (today, daysAgo) | `lib/dashboard/date-ranges.ts` | `app/tools/cogs-simulation/page.tsx` (`todayStr`, `daysAgoStr`, `normalizeDateRange`) |
| SWR `fetcher` boilerplate | — | Defined independently in 5 pages/components |
| Percentage formatting | — | `components/control/ApprovalCard.tsx` and `app/control/page.tsx` |
| Search-param parsing | — | Multiple pages re-implement independently |
| URL building with search params | — | `components/attribution/AttributionChannelView.tsx` and others |

---

## 9. Unclear Boundaries

1. **`lib/` has no declared boundary.** It mixes frontend utilities, server-only logic (Prisma, ClickHouse), chat orchestration, and business rules. Nothing prevents a client component from accidentally importing a server-only module.

2. **Two ClickHouse data paths** — some P&L queries go via Cube (semantic layer, cached), others go direct to ClickHouse (for reconciliation). The reason is valid but undocumented; a new developer would not know which to extend.

3. **"BFF or primary backend?"** — `apps/web/src/app/api/` acts as a Backend-for-Frontend in some routes (thin wrappers around services) and as a primary backend in others (`/api/chat` runs full LLM orchestration). There is no stated boundary.

4. **Python orchestrator vs. Next.js chat route** — Both do LLM orchestration. The orchestrator handles signal-driven background intelligence. The chat route handles interactive user sessions. The split is correct but not documented, creating risk that new features land in the wrong layer.

5. **Queue connection per approval** — `approval.service.ts` creates and closes a new `ioredis` connection per approval decision. Should use a shared singleton.

---

## 10. Risky Files

| File | Risk | Reason |
|------|------|--------|
| `app/api/chat/route.ts` | HIGH | ~300 lines; owns model health-checking, rate-limit detection, model fallback, streaming, step-count safety, 3-model routing. A single edit can break all chat. |
| `app/tools/cogs-simulation/page.tsx` | HIGH | Business logic embedded in UI; any change to COGS calculation requires touching this page. |
| `lib/chat/model.ts` | MEDIUM | Central model resolver; incorrect env var changes cause silent model downgrades. |
| `lib/services/approval.service.ts` | MEDIUM | HMAC-secured approval flow; timing-safe comparison is security-critical. |
| `lib/dashboard/queries/pnl-clickhouse.ts` | MEDIUM | Bypasses Cube; raw SQL against gold layer. Schema changes in ClickHouse break silently. |

---

## 11. Environment / Config Usage

**Single `.env` / `.env.example`** at monorepo root — consumed by all services via Docker Compose env passthrough.

Key groups:
- LLM providers: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `AZURE_OPENAI_*` family (6 vars)
- Model selection: `ORCHESTRATOR_MODEL`, `DATA_MODEL`, `ANALYSIS_MODEL`, `AZURE_*_DEPLOYMENT` (8 vars)
- MCP connectors: `PIPEBOARD_TOKEN`, `SELERIC_MCP_URL`, `SELERIC_API_KEY`, `CUBE_MCP_URL`
- Databases: `DATABASE_URL` (Postgres), `REDIS_URL`, `CLICKHOUSE_*` (5 vars)
- Shopify: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_WEBHOOK_SECRET`
- Auth: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Security: `APPROVAL_SIGNING_SECRET`, `APPROVAL_SECRET`
- Feature flags: `WRITE_ENABLED` (gates action execution in Phase 3)
- Notifications: `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL_*`
- Monitoring: `SENTRY_DSN`, `AXIOM_DATASET`, `AXIOM_API_TOKEN`

**`packages/config/src/env.ts`** validates a subset (NODE_ENV, DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, WRITE_ENABLED) with Zod at startup.

Problem: Most env vars are consumed directly via `process.env.*` without the Zod schema, so typos in variable names fail silently at runtime rather than at startup.

---

## 12. Build / Runtime Entry Points

| Service | Entry | Port | Runtime |
|---------|-------|------|---------|
| Web (Next.js) | `apps/web/next.config.mjs` → `src/app/layout.tsx` | 3000 (3001 in Docker) | Node.js 20 |
| Orchestrator | `services/orchestrator/src/main.py` | 8000 | Python 3.12 / uvicorn |
| Worker | `services/worker/src/index.ts` | — | Node.js 20 / BullMQ |
| MCP Shopify | `services/mcp-shopify/src/server.ts` | 3100 | Node.js 20 |

CI/CD: Jenkinsfile (GitHub → rsync → `docker compose up --build`). Health checks on ports 8000, 3001, 3100.

---

## 13. Current Problems That Make the System Hard to Scale

### P1 — `lib/` has no declared server boundary
Any `"use client"` component can import `lib/prisma.ts` or `lib/clickhouse-client.ts`. Next.js does not prevent this at build time unless `server-only` is used. A badly placed import could leak database credentials to the client bundle.

**Files missing `server-only` guard**: `lib/prisma.ts`, `lib/clickhouse-client.ts`, `lib/cube-rest.ts`, all service files.

### P2 — No unified API client
Five pages each reinvent `const fetcher = (url) => fetch(url).then(r => r.json())`. There is no typed client for the Next.js API layer, so changing a response shape requires grepping all pages.

### P3 — No data-fetching hooks
Every page that needs polling or SWR wires it up from scratch. There are no shared `useApprovals()`, `useInsights()`, `useControlStats()` hooks.

### P4 — Chat route is a single-file orchestration layer
`/api/chat/route.ts` (~300 lines) mixes model health-checking, rate-limit detection, fallback routing, streaming setup, step counting, and tool assembly. Adding a new model provider or changing the fallback strategy requires editing a fragile, dense file.

### P5 — `cogs-simulation/page.tsx` is untestable
Business logic inlined in a `"use client"` page cannot be unit tested without rendering the React tree. The COGS engine and campaign matcher are already extracted as testable pure functions; the page just doesn't use them correctly.

### P6 — BullMQ queue connection opened per approval
Each approval decision creates and closes an `ioredis` connection. Under load this exhausts connection limits. Should use a singleton queue client shared across requests.

### P7 — Two undocumented ClickHouse paths
The dual path (Cube vs. direct ClickHouse) is confusing and creates inconsistent caching behavior. Direct ClickHouse queries bypass the semantic layer cache, so the same metric can return different values depending on which path fetches it.

### P8 — Stub routes and placeholders
`/api/campaigns`, `/api/metrics`, `/api/webhooks/shopify`, `/api/insights/stream` all return `ok` or nothing. They represent planned features that haven't been built, making the API surface unclear.
