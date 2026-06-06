# Semantic Layer Gap Analysis

**Date:** 2026-06-06 (revised after gap-closure implementation)  
**Scope:** ClickHouse `gold.*` only · semantic serve layer (Cube + MCP) · no `serve.*` database

---

## Terminology

| Term | Meaning |
|------|---------|
| **Gold DB** | ClickHouse schema `gold.*` — sole physical data source |
| **Serve DB** | Legacy `serve.*` / Postgres marts — **forbidden** |
| **Serve layer** | `semantic_layer_serve/` — Cube model, MCP port 3012, curated views |
| **Serve views** | `serve_views.yml` — analytical view names (`canonical_pnl`, `order_attribution`, …) backed by gold cubes |
| **Chart views** | `chart_views.yml` — 29 dashboard chart aliases (`daily_pnl`, `shopify_orders`, …) |
| **Full views** | `gold_full_views.yml` — auto `gold__{table}` full-column exposure |

**Hard rule:** every cube `sql_table` / SQL `FROM` must reference `gold.{table}` only. Validated by `scripts/validate_no_serve_db.py`.

---

## View layer map

| Gold source | Serve view | Chart view | Full view |
|-------------|------------|------------|-----------|
| `gold.fct_daily_pnl` | `canonical_pnl` | `daily_pnl` | `gold__fct_daily_pnl` |
| `gold.fct_orders` | `commerce_orders` | `shopify_orders` | `gold__fct_orders` |
| `gold.fct_meta_ads_daily` | `meta_ad_performance` | `marketing_performance` | `gold__fct_meta_ads_daily` |
| `gold_channel_pnl` (SQL) | — | `channel_pnl` | `gold__channel_pnl` |
| `gold.fct_order_attribution` | `order_attribution` | — | `gold__fct_order_attribution` |
| `gold.dim_customers` | `customer_ltv` | — | `gold__dim_customers` |
| SQL bridges (see below) | serve only | — | `gold__*` |

---

## Resolved gaps (was missing in original analysis)

| Gap | Resolution |
|-----|------------|
| `canonical_pnl` only ~11 measures | **52+ members** in serve view; full waterfall + audit fields |
| `commerce_orders` missing geo/returns | **PENDING** — `ship_country`, `utm_*`, `return_rate`, `fulfillment_status` not yet in serve view (gap still open; use `shopify_orders` chart view) |
| `order_attribution` missing ad hierarchy | **Added** `lt_adset_name`, `lt_ad_name`, `lt_utm_*`, `attributed_aov` |
| `daily_pnl` chart view thin | **Expanded** with ROAS, audit, rto/prepaid rates |
| Cross-view true ROAS | **`gold_channel_pnl`**, **`gold_daily_performance`**, bridge views |
| Campaign × product | **`gold_campaign_product_performance`** SQL cube + serve view |
| LTV × acquisition | **`gold_customer_acquisition_ltv`** + dbt `dim_customers` acquisition columns |
| Neurohack × revenue | **`gold_neurohack_attribution`** SQL cube |
| COD vs prepaid P&L | **`gold_payment_method_pnl`** + dbt `payment_method` on orders/payments |
| Refund timing | **`gold_refund_events`** from line items + `returned_at` |
| Hourly commerce | **`gold_hourly_commerce`** SQL cube + dbt `fct_orders_hourly` |
| `meta_ad_breakdown` overcount footgun | **Segments** on `breakdown_type` + AGENTS.md warning |
| Full column access | **`gold_full_views.yml`** (32 views) via `sync_gold_cube_columns.py` |

---

## Derived measures added (cube YAML)

| Cube | New members |
|------|-------------|
| `gold_fct_daily_pnl` | `rto_rate`, `prepaid_pct`, `cod_pct` |
| `gold_fct_orders` | `prepaid_orders`, `prepaid_pct`, `payment_method` dim |
| `gold_fct_order_attribution` | `attributed_aov` |
| `gold_fct_payments` | `net_amount`, `avg_transaction_value`, `payment_method` |
| `gold_dim_customers` | `first_order_cohort_month`, `days_since_last_order`, `avg_ltv_ex_gst` |
| `gold_fct_session_funnel` | `cart_abandonment_rate`, `checkout_abandonment_rate` |
| `gold_fct_meta_ads_daily` | `cost_per_add_to_cart`, `cost_per_initiate_checkout` (derived CPA) |
| `gold_channel_pnl` | `channel_net_profit`, `channel_roas` |

---

## dbt gold changes

| Model | Change |
|-------|--------|
| `dim_customers` | `acquisition_platform/channel/campaign`, `first_order_product` |
| `fct_orders` | `payment_method` normalized enum |
| `fct_payments` | `payment_method` |
| `fct_orders_hourly` | **New** — IST hourly order aggregates |

Deploy dbt → sync pipeline → `sync_gold_cube_columns.py` → restart cube-serve.

---

## Remaining / blocked gaps

| Gap | Status |
|-----|--------|
| `commerce_orders` geo/UTM dimensions | Open — `ship_country`, `utm_source/medium/campaign` not in serve view; workaround: use `shopify_orders` chart view |
| `device_type` on session funnel | Blocked — not in Snowplow gold session model yet |
| Google keyword grain | Blocked — no keyword gold table |
| Razorpay payout timing | Blocked — settlement source not in gold |
| Windowed LTV (`ltv_3m/6m/12m`) | Not in dbt — use `customer_acquisition_ltv` + cohort filters |
| Incrementality ROAS | No holdout data |

---

## Naming: serve vs chart

| Concept | Serve view | Chart view |
|---------|------------|------------|
| Company P&L | `canonical_pnl.net_profit` | `daily_pnl.net_profit` |
| Orders | `commerce_orders.orders` | `shopify_orders.net_orders` |
| Meta spend | `meta_ad_performance.spend` | `marketing_performance.ad_spend` |
| Revenue ex-GST | `commerce_orders.net_revenue_excl_tax` | `shopify_orders.net_sales_ex_gst` |

Same gold table — use chart names for dashboard queries, serve names for MCP analytical tools.

---

## MCP tools (new)

| Tool | View | Status |
|------|------|--------|
| `cube_campaign_product` | `campaign_product_performance` | live |
| `cube_customer_acquisition_ltv` | `customer_acquisition_ltv` | live |
| `cube_neurohack_attribution` | `neurohack_attribution` | live |
| `cube_daily_performance` | `daily_performance` | live |
| `cube_refund_events` | `refund_events` | live |
| `cube_payment_method_pnl` | `payment_method_pnl` | live |
| `cube_hourly_commerce` | `hourly_commerce` | live |

---

## Validation

```bash
cd /opt/seleric/mcp_stack/semantic_layer_serve
python3 scripts/validate_no_serve_db.py
python3 scripts/validate_chart_queries.py      # 29/29 dashboard charts
python3 scripts/validate_serve_views.py        # smoke each serve view
python3 scripts/sync_gold_cube_columns.py
python3 scripts/generate_semantic_catalog.py
```

---

## Anti-patterns

1. **`meta_ad_breakdown`** — filter exactly one `breakdown_type` before summing spend
2. **Neurohack tags** — multi-tag ads fan out spend; use `distinct_ads`
3. **IST timezone** — always `timezone: "Asia/Kolkata"` on time dimensions
4. **Dual P&L date axes** — `report_date` (placement) vs status-change dates; do not mix buckets
5. **Never query `serve.*`** — serve views ≠ serve database
