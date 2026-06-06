# Gold Semantic Layer

**Status:** Active (MCP serve v2.0.0)  
**Scope:** ClickHouse `gold.*` only — canonical dbt-trino lakehouse facts and dimensions  
**Catalog:** [`mcp_stack/semantic_layer_serve/catalog/gold_semantic_catalog.json`](../../mcp_stack/semantic_layer_serve/catalog/gold_semantic_catalog.json)

Formulas and reconciliation rules: [BUSINESS_CALCULATIONS_GLOSSARY.md](./BUSINESS_CALCULATIONS_GLOSSARY.md)

---

## Architecture

```
dbt gold (Iceberg) → sync_iceberg_gold_to_clickhouse → ClickHouse gold.*
                                                      → Cube.js gold-native cubes
                                                      → MCP serve (port 3012)
```

24 gold tables synced (including neurotag marts `mart_meta_ad_neurotag_daily` and parents). All cubes and views read `gold.*` only — legacy **`serve.*` database** is forbidden; **`serve_views.yml`** is the semantic layer (gold-backed view names).

**Gap analysis:** [`SEMANTIC_LAYER_GAP_ANALYSIS.md`](../../mcp_stack/semantic_layer_serve/SEMANTIC_LAYER_GAP_ANALYSIS.md)

**SQL bridge views (serve layer):** `campaign_product_performance`, `customer_acquisition_ltv`, `neurohack_attribution`, `daily_performance`, `refund_events`, `payment_method_pnl`, `hourly_commerce` — each backed by a `gold_*` SQL cube querying `gold.*` only.

| MCP tool | View | Status |
|----------|------|--------|
| `cube_campaign_product` | `campaign_product_performance` | live |
| `cube_customer_acquisition_ltv` | `customer_acquisition_ltv` | live |
| `cube_neurohack_attribution` | `neurohack_attribution` | live |
| `cube_daily_performance` | `daily_performance` | live |
| `cube_refund_events` | `refund_events` | live |
| `cube_payment_method_pnl` | `payment_method_pnl` | live |
| `cube_hourly_commerce` | `hourly_commerce` | live |
| `cube_meta_neurotag` | `meta_neurotag_analysis` | live (materialized mart; replaces SQL bridge for tag analysis) |

Validate: `python3 scripts/validate_bridge_views.py` (8/8 LIVE).

**29 dashboard charts:** [`CHART_QUERY_REFERENCE.md`](../../mcp_stack/semantic_layer_serve/CHART_QUERY_REFERENCE.md)  
**Chart views:** `model/views/chart_views.yml` (`daily_pnl`, `channel_pnl`, `shopify_orders`, etc.)

---

## Domain routing

### Dashboard charts (29)

| Business question | View | MCP tool |
|-------------------|------|----------|
| P&L KPI strip, waterfall | `daily_pnl` | `cube_daily_pnl` |
| Channel revenue / net profit | `channel_pnl` | `cube_channel_pnl` |
| Meta ads daily | `marketing_performance` | `cube_meta_ads` |
| Meta ads hourly | `ad_performance` | `cube_query` |
| Meta campaign attribution | `dw_meta_ads_attribution` | `cube_query` |
| Orders, AOV, geo, UTM | `shopify_orders` | `cube_commerce_orders` |
| Line discounts, basket | `shopify_order_line_items` | `cube_line_economics` |
| SKU performance | `product_performance` | `cube_product_performance` |

Full query JSON for every chart: [CHART_QUERY_REFERENCE.md](../../mcp_stack/semantic_layer_serve/CHART_QUERY_REFERENCE.md)

### Extended / ad-hoc queries

| Business question | Gold table | Cube view | MCP tool |
|-------------------|------------|-----------|----------|
| Company net profit, MER | `fct_daily_pnl` | `canonical_pnl` | `cube_canonical_pnl` |
| Order trends, AOV | `fct_orders` | `commerce_orders` | `cube_commerce_orders` |
| SKU revenue, COGS, margin | `fct_order_items` | `product_performance` | `cube_product_performance` |
| Customer LTV, repeat rate | `dim_customers` | `customer_ltv` | `cube_customer_ltv` |
| Payment collections/refunds | `fct_payments` | `payment_cashflow` | `cube_payment_cashflow` |
| Meta ad spend, ROAS, video | `fct_meta_ads_daily` | `meta_ad_performance` | `cube_meta_ads` |
| Google ads by device/network | `fct_google_ads_daily` | `google_ad_performance` | `cube_google_ads` |
| Google hourly pacing | `google_campaign_hourly` | `google_ad_hourly` | `cube_google_ads_hourly` |
| Last-touch attribution | `fct_order_attribution` | `order_attribution` | `cube_order_attribution` |
| Session funnel, conversion rates | `fct_session_funnel` | `session_funnel` | `cube_session_funnel` |
| Current variant COGS/margin | `fct_product_variant_cost` | `variant_economics` | `cube_variant_economics` |
| Ad budget/status audit | `fct_*_status_history` | `meta_ad_status_changes` / `google_ad_status_changes` | `cube_query` |
| Field definitions (all entities) | — | — | `cube_schema_catalog` |
| Neurohack tag catalog | `dim_neurohack` | `neurohack_catalog` | `cube_neurohack_catalog` |
| Ad → Neurohack tags | `dim_ad_neurohack_map` | `ad_neurohack_map` | `cube_ad_neurohack` |
| Meta × tag analysis (fc/sc + attribution) | `mart_meta_ad_neurotag_daily` | `meta_neurotag_analysis` | `cube_meta_neurotag` |
| Meta spend by Neurohack tag (legacy) | `fct_meta_ads_daily` × map | `meta_neurohack_performance` | `cube_meta_neurohack` (deprecated) |

---

## Neurohack tag analysis (`meta_neurotag_analysis`)

**Source:** `gold.mart_meta_ad_neurotag_daily` — materialized dbt mart (hourly performance + last-touch attribution × tag map).

**Grain:** `brand_id × report_date × ad_id × tag_code` (untagged ads → `tag_code = __untagged__`).

| Credit mode | Columns | When to use |
|-------------|---------|-------------|
| **Split-credit** (`*_sc`) | `spend_sc`, `net_revenue_sc`, `attributed_orders_sc`, … | Tag/category rollups — divides metrics by `tag_count` so multi-tag ads do not overcount |
| **Full-credit** (`*_fc`) | `spend_fc`, `net_revenue_fc`, `attributed_orders_fc`, … | Ad-level totals or when filtering to a single `tag_code` per ad |

**Parent marts (not exposed via MCP):**

| Table | Grain | Role |
|-------|-------|------|
| `mart_meta_ad_daily_performance` | ad-day | Hourly → daily Meta delivery metrics |
| `mart_meta_ad_daily_attribution` | ad-day | Meta last-touch Shopify attribution |

**Build & validate:**

```bash
# dbt (Mage container)
dbt run --select mart_meta_ad_daily_performance mart_meta_ad_daily_attribution mart_meta_ad_neurotag_daily
dbt test --select mart_meta_ad_neurotag_daily assert_neurotag_split_credit_conservation

# CH sync (post-serve orchestrator block: trigger_sync_neurotag_gold_marts)
python3 scripts/validate_neurotag_marts.py --brand-id 20 --start-date 2026-05-01 --end-date 2026-05-31
```

---

## Grains (do not mix)

| Table | Grain |
|-------|-------|
| `dim_neurohack` | `tag_code` |
| `dim_ad_neurohack_map` | `brand_id × ad_key × tag_code × tag_position` |
| `mart_meta_ad_daily_performance` | `brand_id × report_date × account × campaign × adset × ad` |
| `mart_meta_ad_daily_attribution` | `brand_id × report_date × campaign × adset × ad` |
| `mart_meta_ad_neurotag_daily` | `brand_id × report_date × ad_id × tag_code` |
| `fct_daily_pnl` | `brand_id × report_date` (IST) |
| `fct_orders` | `brand_id × order_id` |
| `fct_order_items` | `brand_id × order_id × line_item_id` |
| `fct_order_attribution` | `brand_id × order_id` |
| `fct_session_funnel` | `brand_id × session_id` |
| `fct_meta_ads_daily` | `brand_id × report_date × account × campaign × adset × ad` |
| `fct_google_ads_daily` | + `segment_device × segment_ad_network_type` |
| `google_campaign_hourly` | + `hour_of_day` |

---

## Anti-patterns

1. **Session funnel revenue** — Do not sum `purchase_revenue` from `fct_session_funnel` for P&L. Use `fct_order_attribution` or `fct_daily_pnl`.
2. **Attribution for company profit** — `order_attribution` is for channel credit, not canonical `net_profit`.
3. **Period P&L** — Sum `fct_daily_pnl` daily rows; do not re-aggregate orders across mixed date axes.
4. **Test orders** — Filter `is_test = false` on order-level queries.
5. **Neurohack spend by tag** — Do not `SUM(spend_fc)` across tags (multi-tag ads duplicate). Use `spend_sc` for tag rollups via `cube_meta_neurotag`, or ad-level totals from `cube_meta_ads` for account spend. Legacy `cube_meta_neurohack` has the same fan-out issue.

---

## Machine-readable catalog

Regenerate after cube or dbt schema changes:

```bash
cd mcp_stack/semantic_layer_serve
python3 scripts/generate_semantic_catalog.py
```

Outputs:
- `catalog/gold_semantic_catalog.json` — primary contract for external platforms
- `catalog/gold_semantic_catalog.yaml` — human-editable mirror

Expose via MCP: `cube_schema_catalog` tool.

---

## Ops

```bash
cd mcp_stack && docker compose up -d --build
curl -s http://127.0.0.1:3012/tools | jq .
```

Remote: `https://mcp-serve.seleric.com/sse` or `https://mcp.seleric.com/serve/sse`

Agent guide: [`mcp_stack/semantic_layer_serve/AGENTS.md`](../../mcp_stack/semantic_layer_serve/AGENTS.md)  
Chart queries: [`mcp_stack/semantic_layer_serve/CHART_QUERY_REFERENCE.md`](../../mcp_stack/semantic_layer_serve/CHART_QUERY_REFERENCE.md)
