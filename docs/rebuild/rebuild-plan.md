# Rebuild Plan

> Created: 2026-06-17. Companion to `architecture-audit.md`.
> This is an incremental refactor plan — not a rewrite. Existing behavior must stay working after each phase.

---

## Goal

Make `apps/web` a clean two-layer stack:

- **Frontend** (`app/` pages, `components/`, `hooks/`) — renders UI, calls backend APIs, shows loading/error/empty states. Contains no business logic, no database access, no external API calls.
- **Backend** (`app/api/` routes, `lib/server/`) — owns all data access, business logic, validation, and orchestration. Exposes stable API endpoints. Can be called by any future frontend, agent, or script without code duplication.

The Python orchestrator, worker, MCP services, and shared packages are already well-separated and are out of scope for this refactor.

---

## Target Folder Structure (inside `apps/web/src/`)

```
apps/web/src/
├── app/                          # Next.js App Router (unchanged shape)
│   ├── (auth)/                   # Auth pages — no change
│   ├── api/                      # Backend API routes — route files stay; logic moves to lib/server/
│   │   ├── chat/route.ts         # Thin: delegates to lib/server/chat/orchestrator.ts
│   │   ├── approvals/[id]/route.ts
│   │   └── ... (all other routes unchanged in location)
│   ├── dashboard/page.tsx        # Server component — calls lib/server/data/dashboard.ts
│   ├── tools/cogs-simulation/page.tsx  # Refactored to thin UI + useCogsSimulation() hook
│   └── ...                       # All other pages — minimal changes
│
├── components/                   # UI components — no change in location
│   └── ...                       # Remove inline business logic where it exists
│
├── hooks/                        # React hooks — GROW THIS LAYER
│   ├── useChartTheme.ts          # Existing
│   ├── useApprovals.ts           # NEW: SWR + typed response
│   ├── useInsights.ts            # NEW: SWR + typed response + mutations
│   ├── useControlStats.ts        # NEW: SWR + typed response
│   ├── useActionHistory.ts       # NEW: SWR + typed response
│   └── useCogsSimulation.ts      # NEW: wraps data fetch + simulation logic
│
├── lib/
│   ├── api/                      # NEW: typed client-side API layer
│   │   ├── client.ts             # fetcher(), post(), patch() with error handling
│   │   ├── approvals.ts          # getApprovals(), submitDecision()
│   │   ├── insights.ts           # getInsights(), dismissInsight(), snoozeInsight()
│   │   ├── control.ts            # getControlStats()
│   │   └── actions.ts            # getActionHistory()
│   │
│   ├── server/                   # NEW: server-only backend code (add `server-only` guard)
│   │   ├── data/                 # Data access layer
│   │   │   ├── clickhouse.ts     # ← moves from lib/clickhouse-client.ts
│   │   │   ├── cube.ts           # ← consolidates lib/cube-rest.ts + lib/cube-client.ts
│   │   │   ├── cube-presets.ts   # ← moves from lib/cube-presets.ts
│   │   │   └── prisma.ts         # ← moves from lib/prisma.ts
│   │   ├── queries/              # Query builders per domain (← moves from lib/dashboard/queries/)
│   │   │   ├── pnl.ts
│   │   │   ├── attribution.ts
│   │   │   ├── ads.ts
│   │   │   ├── neurotag.ts
│   │   │   └── ...
│   │   ├── services/             # ← moves from lib/services/ (same files, new location)
│   │   │   ├── approval.service.ts
│   │   │   ├── insight.service.ts
│   │   │   ├── action.service.ts
│   │   │   ├── control.service.ts
│   │   │   ├── cogs.service.ts   # NEW: extracts normalization from cogs-data route
│   │   │   └── creative-iq.service.ts  # NEW: extracts scoring from creative-iq route
│   │   └── chat/                 # ← moves from lib/chat/ (server-only subset)
│   │       ├── orchestrator.ts   # NEW: extracts model-routing logic from route.ts
│   │       ├── model.ts
│   │       ├── system-prompt.ts
│   │       ├── domain-context.ts
│   │       └── tools/
│   │
│   ├── utils/                    # Pure client-safe utilities (no server deps)
│   │   ├── cogs-engine.ts        # ← moves from lib/cogs-engine.ts
│   │   ├── campaign-sku-matcher.ts  # ← moves from lib/campaign-sku-matcher.ts
│   │   ├── date-ranges.ts        # ← moves from lib/dashboard/date-ranges.ts
│   │   ├── transforms.ts         # ← moves from lib/dashboard/transforms.ts
│   │   ├── page-helpers.ts       # ← moves from lib/dashboard/page-helpers.ts
│   │   └── format.ts             # NEW: pct(), INR formatting, shared formatters
│   │
│   └── chat/                     # Chat-specific client utilities (keep in lib/chat/)
│       ├── computed-query.ts
│       └── visualization/        # Chart detection, binning, formatting
```

---

## Frontend Boundary Rules (what stays in pages/components/hooks)

**Allowed:**
- React rendering, layout, conditional display
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- Calling custom hooks (`useApprovals()`, `useInsights()`, etc.)
- Calling `lib/api/` client functions
- Importing pure utilities from `lib/utils/` (cogs-engine, formatters, date-ranges)
- Reading URL search params, routing
- AI SDK `useChat` hook (for streaming chat UI)

**Not allowed:**
- Direct `fetch('/api/...')` calls without going through `lib/api/`
- `import { prisma }` or any direct DB client import
- `import { clickhouseClient }` or Cube REST client
- Business logic calculations inline in components
- Defining formatters, date utilities, or transformation functions inline

---

## Backend Boundary Rules (what lives in `lib/server/` and `app/api/`)

**Owns:**
- All database queries (Prisma, ClickHouse, Cube)
- External API calls (LLM providers via AI SDK, BullMQ, Redis)
- Business logic (HMAC verification, scoring, normalization, aggregation)
- Validation (request body shape, permission checks)
- Stable API response shapes that the frontend depends on

**Route handlers should be thin:**
```ts
// Good
export async function GET(req: Request) {
  const result = await getApprovals()   // service call
  return NextResponse.json(result)
}

// Bad — business logic in route
export async function GET(req: Request) {
  const raw = await prisma.pendingAction.findMany(...)
  const filtered = raw.filter(...)      // belongs in service
  const scored = filtered.map(row => ({ ...row, score: row.riskLevel === "HIGH" ? 1 : 0 }))  // belongs in service
  return NextResponse.json(scored)
}
```

---

## What Becomes a Service

| New service | Extracted from | What it does |
|-------------|---------------|--------------|
| `lib/server/services/cogs.service.ts` | `api/tools/cogs-data/route.ts` (inline normalization) | SKU per-unit cost normalization, ASP extraction, campaign spend join |
| `lib/server/services/creative-iq.service.ts` | `api/chat/creative-iq/route.ts` (inline scoring) | Neurotag scoring, ad funnel data assembly, classification |
| `lib/server/chat/orchestrator.ts` | `api/chat/route.ts` (model routing, fallback, health check) | Model health check, primary/fallback routing, rate-limit detection |

---

## What Becomes a Hook

| New hook | Extracted from | What it does |
|----------|---------------|--------------|
| `hooks/useApprovals.ts` | `app/control/approvals/page.tsx` | SWR fetch `/api/approvals`, typed return, `refreshInterval: 30_000` |
| `hooks/useInsights.ts` | `app/insights/page.tsx` | SWR fetch + dismiss/snooze mutations |
| `hooks/useControlStats.ts` | `app/control/page.tsx` | SWR fetch `/api/control/stats`, typed return |
| `hooks/useActionHistory.ts` | `app/control/history/page.tsx` | SWR fetch with refresh |
| `hooks/useCogsSimulation.ts` | `app/tools/cogs-simulation/page.tsx` | Data fetch + grouping + simulation; returns `{ products, simulation, loading, error }` |

---

## What Becomes a Shared Utility

| Utility | Move to | Note |
|---------|---------|------|
| `lib/cogs-engine.ts` | `lib/utils/cogs-engine.ts` | Already pure — just a folder move |
| `lib/campaign-sku-matcher.ts` | `lib/utils/campaign-sku-matcher.ts` | Already pure — just a folder move |
| `lib/dashboard/date-ranges.ts` | `lib/utils/date-ranges.ts` | Remove `todayStr`/`daysAgoStr` duplication in cogs-simulation page |
| `lib/dashboard/transforms.ts` | `lib/utils/transforms.ts` | Already pure |
| `lib/dashboard/page-helpers.ts` | `lib/utils/page-helpers.ts` | Already pure |
| Percentage formatter (`pct()`) | `lib/utils/format.ts` | Consolidate from 3 inline definitions |

---

## What Stays Untouched

- `services/orchestrator/` — Python FastAPI + LangGraph; correctly isolated
- `services/agents/` — Python LangGraph node modules; correctly isolated
- `services/worker/` — Node.js BullMQ; correctly isolated
- `services/mcp-shopify/` — Node.js MCP; correctly isolated
- `packages/db/`, `packages/shared-types/`, `packages/queue/`, `packages/config/` — well-structured
- `config/rules.yaml` — guardrail rules; YAML is the right format
- `infra/` — Docker, Nginx; no changes
- All 87 chart/display components — pure rendering, no mixed concerns
- `lib/chat/visualization/` — chart detection and formatting utilities; clean
- `lib/chat/computed-query.ts` — in-memory transforms; clean

---

## Migration Phases

### Phase A — API client layer + custom hooks (zero risk)
**What**: Add `lib/api/` and `hooks/` files. Do not move or delete anything.
**Why first**: Adds structure without breaking anything. Pages can adopt hooks one at a time.

Steps:
1. Create `lib/api/client.ts` with typed `fetcher()`, `post()`, `patch()` functions
2. Create `lib/api/approvals.ts`, `lib/api/insights.ts`, `lib/api/control.ts`, `lib/api/actions.ts`
3. Create `hooks/useApprovals.ts`, `hooks/useInsights.ts`, `hooks/useControlStats.ts`, `hooks/useActionHistory.ts`
4. Migrate pages one at a time to use the new hooks (remove inline `useSWR` + fetcher)
5. Add `lib/utils/format.ts` with `pct()` and remove inline definitions

Acceptance: Pages render identically. Zero changes to API routes.

---

### Phase B — Fix `cogs-simulation/page.tsx` (low risk)
**What**: Move inline logic in the cogs simulation page to its correct homes.
**Why second**: Most critical mixed-concern file; logic is already extracted correctly elsewhere.

Steps:
1. Create `hooks/useCogsSimulation.ts` — moves all data fetching, grouping, and simulation state out of the page
2. Remove `todayStr`, `daysAgoStr`, `normalizeDateRange` from the page; import from `lib/utils/date-ranges.ts`
3. Remove inline variant ASP and CAC calculations; use `resolveVariantCac()` / `resolveProductCac()` from `lib/campaign-sku-matcher.ts`
4. `page.tsx` becomes: render `useCogsSimulation()` data → pass to existing sub-components

Acceptance: COGS simulation page behaves identically. The hook is independently testable.

---

### Phase C — Extract route-embedded business logic into services (medium risk)
**What**: Create two new services from inline route logic. Routes become thin.

Steps:
1. Create `lib/server/services/cogs.service.ts` — extract SKU/cost normalization from `api/tools/cogs-data/route.ts`
2. Create `lib/server/services/creative-iq.service.ts` — extract neurotag scoring from `api/chat/creative-iq/route.ts`
3. Create `lib/server/chat/orchestrator.ts` — extract model health-check, primary/fallback routing, and rate-limit detection from `api/chat/route.ts` (leave streaming setup and step-count logic in the route for now)
4. Update route handlers to call new services
5. Fix BullMQ singleton: replace per-request `new Queue()` in `approval.service.ts` with a module-level singleton

Acceptance: All routes return identical responses. Audit log entries unchanged. Chat still streams.

---

### Phase D — Declare server/client boundaries (medium risk)
**What**: Add `server-only` guards to server-only modules. Reorganize `lib/` into `lib/server/`, `lib/utils/`, keeping `lib/chat/` in place.

Steps:
1. Add `import 'server-only'` to: `lib/prisma.ts`, `lib/clickhouse-client.ts`, `lib/cube-rest.ts`, `lib/cube-client.ts`, all `lib/services/` files
2. Move `lib/services/` → `lib/server/services/` (update imports)
3. Move `lib/dashboard/queries/` → `lib/server/queries/` (update imports)
4. Move pure utilities to `lib/utils/` (cogs-engine, campaign-sku-matcher, date-ranges, transforms, page-helpers)
5. Document the two ClickHouse paths: add comments to `lib/server/queries/pnl.ts` and `pnl-clickhouse.ts` explaining when each is used

Acceptance: `pnpm build` passes. `pnpm typecheck` passes. Server-only modules throw at build time if imported from client components.

---

### Phase E — Document the BFF pattern and clean up stubs (low risk)
**What**: Clarify the architecture boundary in code and remove ambiguity.

Steps:
1. Replace stub routes (`/api/campaigns`, `/api/metrics`, `/api/webhooks/shopify`, `/api/insights/stream`) with proper 501 Not Implemented responses and a comment explaining planned purpose
2. Add a `BACKEND_GUIDE.md` in `apps/web/src/` describing the BFF pattern: when to use Next.js API routes vs. Python orchestrator, what belongs in services vs. routes
3. Add env validation for critical vars (LLM provider, ClickHouse) to `packages/config/src/env.ts`

Acceptance: No functional changes. Future developers know where to add new features.

---

## Risk Areas

| Risk | Mitigation |
|------|-----------|
| Import path changes break the build | Use `pnpm typecheck` after each move; rename in phases |
| `server-only` guard breaks an existing client import | Run build immediately after adding guard; fix before merging |
| Chat streaming breaks if orchestrator extraction misses a state mutation | Extract incrementally; keep rate-limit state (module-level vars) in the route during Phase C |
| BullMQ singleton causes issues during hot reload in dev | Use `globalThis` pattern (same pattern as Prisma singleton) |
| ClickHouse path split causes data inconsistency | Document both paths; do not consolidate until Cube coverage is verified |

---

## Acceptance Criteria (Overall)

- [ ] `pnpm build` passes after each phase
- [ ] `pnpm typecheck` passes after each phase
- [ ] Dashboard, chat, COGS simulation, approvals, control, insights pages all load and function correctly
- [ ] No client component imports a server-only module (enforced by `server-only` package after Phase D)
- [ ] `lib/api/` provides typed wrappers for all frontend API calls
- [ ] At least 4 custom hooks exist for the main polling/data patterns
- [ ] No inline business logic remains in `app/tools/cogs-simulation/page.tsx`
- [ ] Chat route handler is under 150 lines (orchestration extracted to `lib/server/chat/orchestrator.ts`)
- [ ] BullMQ connection uses singleton pattern

---

## Rollback Notes

- Phases A and B add new files and modify pages only. Rollback = delete new files, revert page changes.
- Phase C modifies route handlers. Before starting, ensure each route has at least a manual test case documented. Keep old route logic in comments until the replacement is verified in staging.
- Phase D changes import paths. Use find-and-replace across the workspace; do not manually update individual files. If `pnpm build` fails, `git stash` is safe.
- No database migrations are required at any phase. This is a code organization refactor only.
- The Python services, worker, and MCP server are untouched throughout — there is no rollback risk for those.

---

## What NOT to Do

- Do not restructure `packages/` — they are already well-organized
- Do not move pages to a `frontend/` folder or API routes to a `backend/` folder — Next.js App Router does not support this without significant framework-level config changes
- Do not create abstract repository classes or factory patterns — the service pattern already in use is sufficient
- Do not consolidate the two ClickHouse paths without first verifying that Cube covers all required fields
- Do not break streaming in the chat route — this is the hardest thing to debug and the most user-visible feature
