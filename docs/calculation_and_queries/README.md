# Seleric Mage-AI documentation

Canonical **definitions, formulas, conventions, and KPIs** live in one place:

| Document | Use when |
|----------|----------|
| **[BUSINESS_CALCULATIONS_GLOSSARY.md](./BUSINESS_CALCULATIONS_GLOSSARY.md)** | Metrics, P&L formulas, date axes, layer differences, reconciliation cases |
| **[COGS_DEFINITIONS.md](./COGS_DEFINITIONS.md)** | COGS join rules, placement + refund-event cost axes, RTO, `rto_adj_*`, backfill |
| [PNL_ORDER_DATE_ATTRIBUTION.md](./PNL_ORDER_DATE_ATTRIBUTION.md) | Shopify Analytics ↔ `gold.fct_daily_pnl` date rules and revenue breakdown |
| [attribution_logic.md](./attribution_logic.md) | Snowplow / UTM / channel attribution stitching |
| [naming_conventions.md](./naming_conventions.md) | Gold model naming (`meta_` vs `facebook_`, prefixes) |
| [DATA_FLOW.md](./DATA_FLOW.md) | Ingest → raw → silver → gold → serve → ClickHouse |
| [DW_PHASE1_PLAN.md](./DW_PHASE1_PLAN.md) | DW mart metrics (legacy Phase 1 dictionary) |
| [SHOPIFY_FIELD_COVERAGE.md](./SHOPIFY_FIELD_COVERAGE.md) | API field coverage |
| [SHOPIFY_RETURNS_API.md](./SHOPIFY_RETURNS_API.md) | Returns GraphQL vs refund fallback |

**Scripts** — see **[../scripts/README.md](../scripts/README.md)** for the full list. Main entry points:

- `scripts/validate_cross_platform_pipeline.py` — end-to-end validation for a date range
- `scripts/reconcile_shopify_csv_full.py` — Shopify CSV export vs lakehouse
- `scripts/run_ch_sync.py` — Trino gold → ClickHouse

**Semantic layer (Cube MCP)** points here: `mcp_stack/semantic_layer/BUSINESS_GLOSSARY.md`
