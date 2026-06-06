# Business calculations glossary

**Status:** Active (2026-06-03)  
**Audience:** Analytics, BI, MCP agents, reconciliation scripts  
**Source of truth:** dbt gold models (`fct_orders`, `fct_order_items`, `fct_daily_pnl`) unless a section explicitly names Postgres Cube or DW.

Related detail: [PNL_ORDER_DATE_ATTRIBUTION.md](./PNL_ORDER_DATE_ATTRIBUTION.md) · [attribution_logic.md](./attribution_logic.md) · [docs/README.md](./README.md)

---

## Table of contents

1. [Global conventions](#1-global-conventions)
2. [Data layers — which table to use](#2-data-layers--which-table-to-use)
3. [Shopify order facts (`gold.fct_orders`)](#3-shopify-order-facts-goldfct_orders)
4. [Daily P&L (`gold.fct_daily_pnl`)](#4-daily-pnl-goldfct_daily_pnl)
5. [Line items & COGS (`gold.fct_order_items`)](#5-line-items--cogs-goldfct_order_items)
6. [Refunds & returns](#6-refunds--returns)
7. [DW commerce metrics (`serve.dw_shopify_orders`)](#7-dw-commerce-metrics-servedw_shopify_orders)
8. [Advertising metrics](#8-advertising-metrics)
9. [Profit stack & efficiency KPIs](#9-profit-stack--efficiency-kpis)
10. [Attribution KPIs (summary)](#10-attribution-kpis-summary)
11. [Semantic layer / MCP routing](#11-semantic-layer--mcp-routing)
12. [Reconciliation cases](#12-reconciliation-cases)
13. [Anti-patterns](#13-anti-patterns)

---

## 1. Global conventions

| Convention | Rule |
|------------|------|
| **Calendar** | **IST** (`Asia/Kolkata`) for all `report_date`, `order_date`, and P&L rollups unless noted |
| **Grain** | `brand_id` × `report_date` for P&L; `brand_id` × `order_id` for orders |
| **Test orders** | Always filter `is_test = false` in P&L and published KPIs |
| **GST** | India DTC: **ex-GST** metrics use **`÷ 1.18`** on GST-inclusive amounts (`total_price`, line totals) |
| **Currency** | INR (`shop_money`) unless `currency` column says otherwise |
| **Period rollup** | Sum daily `fct_daily_pnl` rows over `report_date` in range — do not re-aggregate from orders unless reconciling |
| **API windows** | Shopify Admin `created_at_min/max`: use **end of last day** (`2026-05-31`), not `2026-06-01`, for “May only” counts |

---

## 2. Data layers — which table to use

| Layer | Schema / table | Purpose |
|-------|----------------|---------|
| **Gold (canonical P&L)** | `iceberg.gold.fct_daily_pnl` → `gold.fct_daily_pnl` (CH) | Daily brand P&L, order buckets, costs, ads |
| **Gold orders** | `gold.fct_orders`, `gold.fct_order_items` | Order/line facts, status, COGS |
| **DW** | `serve.dw_shopify_orders` | API-style `gross_sales` (`total_line_items_price`), attribution-friendly |
| **Postgres Cube** | `daily_business_pnl` / view `daily_pnl` | Legacy dashboard (return_status COGS rules) |
| **Marts** | `serve.mart_finance_daily`, `mart_channel_*` | Phase 1 waterfalls — **do not** equate to gold `net_profit` without reading §13 |

**Rule:** Company net profit on ClickHouse serve → **`gold.fct_daily_pnl.net_profit`** (or Cube `canonical_pnl` when deployed). Dashboard Postgres `daily_pnl.net_profit` uses different return/cancel rules (§11).

---

## 3. Shopify order facts (`gold.fct_orders`)

**Grain:** `brand_id` × `order_id`  
**Partition:** `order_date` (IST date of `created_at`)

### 3.1 `order_status` (derived)

Macro: `shopify_order_status(cancelled_at, payment_status)` — matches Shopify **Financial Status** with cancel precedence.

| `order_status` | Condition |
|----------------|-----------|
| `cancelled` | `cancelled_at IS NOT NULL` |
| `refunded` | `payment_status = 'refunded'` |
| `partially_refunded` | `payment_status = 'partially_refunded'` |
| `voided` | `payment_status = 'voided'` |
| `active` | else (paid, pending, authorized, etc.) |

**Case — cancelled vs refunded:** Cancelled wins even if financial status later shows refunded.

### 3.2 Revenue fields (order grain)

| Field | Definition | P&L use |
|-------|------------|---------|
| `gross_revenue` | Shopify `total_price` (incl. GST, shipping, after discounts) | Order grain; P&L sums **all statuses** on placement (§4.3) |
| `net_revenue` | Line product net + shipping for active/partial; **0** for cancelled/refunded/voided; partial-refund fallbacks to `current_total_price` | Order-level net; **not** the same as daily P&L `net_revenue` |
| `total_refund_amount` | `gross_revenue − net_revenue` (order lifetime) | Order reporting; P&L refund **$** uses **refund events** (§6) |
| `gross_revenue_excl_tax` | `gross_revenue / 1.18` | Ex-GST views |
| `net_revenue_excl_tax` | `net_revenue / 1.18` | Ex-GST views |
| `total_discounts` | Order-level discounts | All placement P&L (excl. RTO drafts) |
| `total_tax` | Order taxes | All placement P&L (excl. RTO drafts) |
| `total_shipping_charged` | Shipping charged to customer | All placement P&L (excl. RTO drafts) |
| `product_gross_revenue` | Sum of line `line_total` (catalog, audit) | **Not** used in `fct_daily_pnl.gross_revenue` |

### 3.3 RTO / revenue adjustment

| Flag | Definition |
|------|------------|
| `is_draft_order` | `source_name = 'shopify_draft_order'` |
| `is_revenue_adjustment` | Draft + `net_revenue = 0` + `payment_status IN ('paid','partially_refunded')` |

**Case — RTO reship (brand 20, May 2026):** 8 draft orders show **paid** in Shopify export with **Total = 0** and discounts on lines; gold excludes them from `active_orders` and `gross_revenue` (`is_revenue_adjustment`) but counts `revenue_adjustment_orders` on **updated_at**.

### 3.4 Returns lifecycle

| Field | Source |
|-------|--------|
| `return_status` | GraphQL `Order.returnStatus` snapshot, else refund/financial fallback |
| `returned_at` | Latest refund `processed_at` / `created_at` |
| `primary_return_status` | Return object status (OPEN/CLOSED/…) |

See [SHOPIFY_RETURNS_API.md](./SHOPIFY_RETURNS_API.md).

---

## 4. Daily P&L (`gold.fct_daily_pnl`)

**Grain:** `brand_id` × `report_date` (IST)  
**Model:** `dbt/models/iceberg/cross_platform/fct_daily_pnl.sql`

### 4.1 Four date axes (do not mix)

| Axis | Date field | What it drives |
|------|------------|----------------|
| **A — Placement** | `fct_orders.order_date` | `orders_created`, `active_orders`, `cancelled_orders`, `total_orders`, `gross_revenue`, `gross_sales_excl_tax`, discounts, shipping charged, **cost placement** |
| **B — Status change** | IST date of `fct_orders.updated_at` | `refunded_orders`, `voided_orders`, `voided_revenue`, `revenue_adjustment_orders` |
| **C — Refund events** | IST date of `coalesce(refund.processed_at, refund.created_at)` | `total_refund_amount`, `returns_excl_tax`, **cost reversals**, **RTO on refunds** |
| **D — Cost (net)** | A minus C per day | `product_cost`, `shipping_cost`, `packaging_cost`, `payment_gateway_fees`, `rto_cost` |

```text
WRONG:  sum(total_orders) + sum(refunded_orders) = orders in month
RIGHT:  sum(orders_created) = all Shopify rows with Created at in month
        sum(total_orders)    = active + cancelled only (placement)
        sum(refunded_orders) = status changed to refunded/partial on updated_at day
```

### 4.2 Order count metrics

| Metric | Formula / rule | Example (brand 20, May 2026) |
|--------|----------------|------------------------------|
| `orders_created` | `count(*)` orders with `order_date` = `report_date` | **1,897** |
| `total_orders` | `active_orders + cancelled_orders` (excl. RTO from active) | **1,794** |
| `active_orders` | `order_status = active` AND `NOT is_revenue_adjustment` | **1,753** |
| `cancelled_orders` | `order_status = cancelled` | **41** |
| `revenue_adjustment_orders` | `is_revenue_adjustment` on **updated_at** day | **8** (month total on status axis) |
| `refunded_orders_placed` | `order_status = refunded` on **order_date** | **21** |
| `voided_orders_placed` | `order_status = voided` on **order_date** | **74** |
| `refunded_orders` | `refunded` + `partially_refunded` on **updated_at** day | **48** |
| `voided_orders` | `voided` on **updated_at** day | **107** |
| `cod_orders` / `prepaid_orders` | Active COD vs non-COD | — |

**Case — export “active” vs gold:** Export counts paid/pending not cancelled = 1,761; gold active = 1,753; gap = **8 RTO drafts**. Use `scripts/reconcile_shopify_csv_full.py` or gold `is_revenue_adjustment` filters for export-aligned counts.

### 4.3 Revenue metrics (daily) — Shopify Analytics alignment

| Metric | Formula | Compare to Shopify |
|--------|---------|-------------------|
| `gross_revenue` | Σ `total_price` placement day (incl. cancelled; excl. test) | Order `Total` sum on Created at |
| `gross_sales_excl_tax` | `sum(total_price + total_discounts) / 1.18` incl. cancelled + RTO | Shopify “Gross sales” |
| `total_discounts_excl_tax` | Discounts / 1.18 | Shopify “Discounts” |
| `total_refund_amount` | Σ refund event subtotal + adjustments (incl. GST) | Shopify “Returns” (timing may differ) |
| `returns_excl_tax` | `total_refund_amount / 1.18` | Returns ex-GST |
| `net_sales_excl_tax` | `gross_sales_excl_tax − discounts_excl − returns_excl` | Shopify “Net sales”; **voided not subtracted** |
| `total_tax_collected` | `net_sales_excl_tax × 0.18` | Shopify “Taxes” |
| `shipping_charged_to_customers` | Customer shipping on placement | Shopify “Shipping” |
| `total_sales_incl_tax` | `net_sales_excl_tax + tax + shipping_charged` | Shopify total (breakdown path) |
| `net_revenue` | `gross_revenue − total_refund_amount` | Cash-style total; **may be negative** |
| `cancelled_revenue` | Cancelled subset on placement | Audit; **in** `gross_sales_excl_tax` |
| `voided_revenue` | Voided on **updated_at** | Audit only; overlaps returns |
| `rto_gross_revenue` / `rto_gross_sales_excl_tax` | RTO draft orders on placement | Audit |

**Period rollup (Shopify breakdown):**

```text
sum(net_sales_excl_tax) = sum(gross_sales_excl_tax) − sum(discounts_excl) − sum(returns_excl)
sum(net_revenue)        = sum(gross_revenue) − sum(total_refund_amount)
```

**Do not** subtract `voided_revenue` or `cancelled_revenue` from `net_sales_excl_tax` (Shopify-aligned). Use `net_sales_excl_tax_incl_voided_deduction` for legacy CA audit only.

### 4.4 Cost & ad columns (summed daily)

| Column | Source / formula |
|--------|------------------|
| `product_cost` | Placement `sum(total_cost)` − refund-event `sum(refunded_product_cost)` |
| `shipping_cost` | `placed_shipping_cost` − `refunded_shipping_cost` |
| `packaging_cost` | `placed_packaging_cost` − `refunded_packaging_cost` |
| `payment_gateway_fees` | `placed_gateway_fee` − `refunded_gateway_fee` |
| `rto_cost` | IN_PROGRESS on placement + `rto_per_unit × refunded_qty` on refund events |
| `total_operating_cost` | Sum of five cost buckets above |
| `rto_adj_product_cost` | Audit: COGS on `is_revenue_adjustment` lines (excluded from net) |
| `rto_adj_shipping_cost` | Audit: shipping on RTO drafts |
| `rto_adj_packaging_cost` | Audit |
| `rto_adj_payment_gateway_fees` | Audit |
| `meta_spend`, `google_spend`, `total_ad_spend` | Ad platform daily facts |
| `product_cost_coverage_pct` | `items_with_cost / total_items` on placement (`revenue_eligible` lines) |

**Filter for net costs:** `revenue_eligible AND NOT is_gift_card`. RTO drafts excluded — see `rto_adj_*`.

Full spec: [COGS_DEFINITIONS.md](./COGS_DEFINITIONS.md).

### 4.5 Derived profit & efficiency (daily row)

| Column | Formula |
|--------|---------|
| `net_revenue_excl_tax` | Same as `net_sales_excl_tax` (Shopify breakdown net) |
| `avg_order_value` | `net_revenue / active_orders` (NULL if 0 active) |
| `gross_profit` | `net_revenue_excl_tax − product_cost` |
| `gross_margin_pct` | `gross_profit / net_revenue_excl_tax` |
| `contribution_margin` | `net_revenue_excl_tax − product_cost − total_ad_spend` |
| `contribution_margin_pct` | `contribution_margin / net_revenue_excl_tax` |
| `net_profit` | `net_revenue_excl_tax − total_ad_spend − total_operating_cost` |
| `net_margin_pct` | `net_profit / net_revenue_excl_tax` |
| `meta_roas` | `meta_purchase_value_reported / meta_spend` |
| `google_roas` | `google_conversion_value / google_spend` |
| `blended_roas` | `(meta purchase value + google conversion value) / total_ad_spend` |
| `mer` | `net_revenue_excl_tax / total_ad_spend` (daily row) |

**Case — period MER:** For a month, prefer **`sum(net_revenue_excl_tax) / sum(total_ad_spend)`** (≈ 1.73 for May brand 20), not `avg(mer)` from daily rows (≈ 55.58 when many zero-spend days).

---

## 5. Line items & COGS (`gold.fct_order_items`)

**Full spec:** [COGS_DEFINITIONS.md](./COGS_DEFINITIONS.md)

**Grain:** `brand_id` × `order_id` × `line_item_id`

| Field | Definition |
|-------|------------|
| `net_quantity` | `quantity − refunded_quantity` |
| `unit_cost` | Ex-GST COGS/unit (SCD2 at `order_created_at`) |
| `total_cost` | `unit_cost × quantity` — **placement COGS** |
| `net_cost` | `unit_cost × net_quantity` — current-state line snapshot |
| `refunded_product_cost` | `unit_cost × refunded_quantity` |
| `placed_*` / `refunded_*` | Ops costs at placement / reversal quantities |
| `packaging_cost_per_unit`, `shipping_cost_per_unit`, `gateway_fee_per_unit`, `rto_per_unit` | Rates at order time |
| `is_cost_set` | `unit_cost IS NOT NULL AND NOT cogs_missing_flag` |
| `included_in_pnl_cogs` | `revenue_eligible AND NOT is_gift_card AND is_cost_set` |
| `rto_cost` (line) | `rto_per_unit × rto_quantity` when return gate passes — see §5.1 |
| `is_gift_card` | Excluded from P&L cost sums |
| `is_revenue_adjustment` | RTO draft; `revenue_eligible = false`; costs in `rto_adj_*` |

### 5.1 RTO cost attribution

**Return gate** (any of): `order_status` refunded/partial, `return_status` RETURNED/IN_PROGRESS, `refunded_quantity > 0`.

**Quantity:** `refunded_quantity` if &gt; 0, else `quantity`.

**P&L:** Refund-event axis for refunded units; placement axis for `IN_PROGRESS` with no refund yet.

### 5.2 P&L cost rollup (`fct_daily_pnl`)

```text
product_cost = sum(total_cost) on order_date
             − sum(refunded_product_cost) on refund processed_at

rto_cost     = sum(IN_PROGRESS rto on order_date)
             + sum(rto_per_unit × refund_line.qty on refund date)
```

**Coverage:** `product_cost_coverage_pct = items_with_cost / total_items`. Missing cost books as **₹0**.

### Why COGS is missing (summary)

| Mode | Condition | May 2026 brand 20 (post-seed) |
|------|-----------|-------------------------------|
| **A — No variant** | `variant_id` NULL, no legacy seed match | **7** lines |
| **B — No history window** | No SCD2 row for `order_created_at` | 0 |
| **C — Empty metafield** | `cogs_missing_flag` | **2** lines (JerHigh treats) |
| **D — Excluded** | Gift card, RTO draft, not `revenue_eligible` | audit only |

**Fix missing SKUs:** `dbt seed --select shopify_variant_cost_legacy --full-refresh --vars '{"enable_seeds": true}'` then rebuild `stg_shopify_variant_cost_legacy+`.

---

## 6. Refunds & returns

### 6.1 Refund events (`silver.shopify__order_refunds`)

| Field | Definition |
|-------|------------|
| `refund_total_amount` | **Incl-GST:** line subtotals + adjustments (subtotal is tax-inclusive in Shopify REST). Used in P&L as `total_refund_amount`; `returns_excl_tax = amount / 1.18` |
| Event date | `coalesce(processed_at, created_at)` in IST |

P&L **`total_refund_amount`** uses **event date**, not order placement or `updated_at`.

**Case — May brand 20:** refund events in month → **₹582,199.80** (`total_refund_amount`); export `Refunded Amount` on May-**created** orders → **₹54,612** (`refunded_revenue_placed`).

### 6.2 Order-level refund total

`fct_orders.total_refund_amount` = lifetime on order — use for order drill-down, **not** for monthly P&L refund line.

---

## 7. DW commerce metrics (`serve.dw_shopify_orders`)

Use for **API reconciliation** and **catalog-value** reporting — not interchangeable with gold P&L `gross_revenue`.

| DW field | Formula |
|----------|---------|
| `gross_sales` | `total_line_items_price` (line catalog before discounts) |
| `total_discounts` | Order discounts |
| `net_revenue` | `gross_sales − total_discounts − order_refund_total` (all ex-GST) |
| `order_total_price` | Shopify `total_price` (= gold `gross_revenue`) |

**Case — May brand 20:** API/DW `gross_sales` ≈ **₹5.17M** (catalog line totals) vs gold `gross_revenue` (order `total_price`, all placed statuses) — different grain and definition.

---

## 8. Advertising metrics

| Metric | Gold source | Definition |
|--------|-------------|------------|
| `meta_spend` | `fct_meta_ads_daily` | Σ Meta `spend` |
| `meta_impressions`, `meta_clicks` | same | Platform delivery |
| `meta_purchases_reported`, `meta_purchase_value_reported` | same | Meta **platform** conversion columns (not Shopify) |
| `google_spend`, `google_conversions`, `google_conversion_value` | `fct_google_ads_daily` | Google Ads |
| `total_ad_spend` | `meta_spend + google_spend` | |

| KPI | Formula | Notes |
|-----|---------|-------|
| **Platform ROAS** | `purchase_value / spend` | Meta/Google self-attribution |
| **Blended ROAS** | `(meta purchase value + google value) / total_ad_spend` | Platform-reported mix |
| **MER** | `net_revenue_excl_tax / total_ad_spend` | **Shopify-anchored** efficiency (gold P&L) |
| **True ROAS** (DW marts) | `attributed_net_revenue / spend` | See DW marts / attribution |

---

## 9. Profit stack & efficiency KPIs

**Canonical stack (gold `fct_daily_pnl`, period sums):**

```text
Shopify breakdown path:
  gross_sales_excl_tax − discounts_excl − returns_excl = net_sales_excl_tax (= net_revenue_excl_tax)
  net_sales_excl_tax × 0.18 = total_tax_collected
  net_sales_excl_tax + tax + shipping_charged = total_sales_incl_tax

Cash path:
  gross_revenue − total_refund_amount = net_revenue

Costs (placement − refund reversals):
  product_cost, shipping_cost, packaging_cost, payment_gateway_fees, rto_cost
  → total_operating_cost

net_revenue_excl_tax − product_cost = gross_profit
gross_profit − total_ad_spend = contribution_margin
contribution_margin − (shipping + packaging + pg + rto) = net_profit
  ≡ net_revenue_excl_tax − total_ad_spend − total_operating_cost
```

**May 2026 brand 20 reference totals (post June 2026 rebuild):**

| KPI | Value (₹) |
|-----|----------:|
| `orders_created` | 1,897 |
| `gross_sales_excl_tax` | 4,382,578.81 |
| `net_sales_excl_tax` | 3,662,838.90 |
| `total_refund_amount` (events) | 582,199.80 |
| `net_revenue` (cash) | 4,319,150.90 |
| `product_cost` | 1,321,155.12 |
| `rto_cost` | 1,989.00 |
| `total_operating_cost` | 1,757,600.01 |
| `total_ad_spend` | 2,257,946.96 |
| `gross_profit` | 2,341,683.78 |
| `contribution_margin` | 83,736.82 |
| `net_profit` | −352,708.07 |
| `rto_adj_product_cost` (audit) | 9,851.06 |

| Efficiency KPI | Period formula | May brand 20 |
|----------------|----------------|-------------:|
| **MER** | `sum(net_revenue_excl_tax) / sum(total_ad_spend)` | **~1.62** |
| **Gross margin %** | `sum(gross_profit) / sum(net_revenue_excl_tax)` | ~64.0% |
| **Net margin %** | `sum(net_profit) / sum(net_revenue_excl_tax)` | ~−9.6% |
| **AOV (net cash)** | `sum(net_revenue) / sum(active_orders)` | ~₹2,465 |

---

## 10. Attribution KPIs (summary)

Full stitching: [attribution_logic.md](./attribution_logic.md).

| KPI | Definition |
|-----|------------|
| **Attributed orders** | Orders linked to ad session (last-click ladder) |
| **CPA** | `spend / attributed_orders` |
| **True ROAS** | `attributed_net_revenue / spend` (Shopify net, DW) |
| **attribution_confidence** | 0.20–0.95 by match path (gclid/fbclid highest) |

Channel P&L (Cube `channel_pnl`): per-platform **attributed** revenue/orders — sums can exceed unique Shopify orders.

---

## 11. Semantic layer / MCP routing

| Need | Cube view | Tool | Stack |
|------|-----------|------|-------|
| Company net profit, MER, full P&L | `canonical_pnl` | `cube_canonical_pnl` | CH serve |
| Dashboard revenue, COGS, orders | `daily_pnl` | `cube_daily_pnl` | Postgres |
| Mart operating waterfall | `finance_pnl` | `cube_finance_daily` | serve mart |
| Channel attribution | `channel_pnl` | `cube_channel_pnl` | serve |

**Postgres `daily_pnl` vs gold:**

| Aspect | Postgres `daily_business_pnl` | Gold `fct_daily_pnl` |
|--------|------------------------------|----------------------|
| Order date | `created_at_ist` | `order_date` (IST) |
| Return handling | Excludes `RETURNED` / `IN_PROGRESS` from net sales | Uses `order_status` + refund events + voided on `updated_at` |
| Refunds | Embedded in order/line net | Separate **refund event** axis |
| Net profit | `net_sales_ex_gst − cogs − ad_spend` (simplified) | Full operating cost stack |

Do **not** compare Postgres `net_profit` to gold `net_profit` without mapping both formulas.

---

## 12. Reconciliation cases

### Case A — “1,925 orders” vs 1,897

| Window | Orders |
|--------|-------:|
| `2026-05-01` … `2026-05-31` | **1,897** |
| `2026-05-01` … `2026-06-01` (includes Jun 1) | **1,925** (+28) |

Use `orders_created` or API with **May end date only**.

### Case B — Shopify export CSV (no `Updated at`)

| Check | Tool / field |
|-------|----------------|
| Created in month | `orders_created` = export row count |
| Active + cancelled | `total_orders` after excluding RTO drafts |
| Refunded in month (status) | Join export `Id` → `fct_orders.updated_at` |
| Refund $ (export column) | `refunded_revenue_placed` |
| Refund $ (P&L) | `total_refund_amount` |

```bash
python scripts/reconcile_shopify_csv_full.py \
  --csv sample_data/orders_export_1.csv --brand-id 20 \
  --start-date 2026-05-01 --end-date 2026-05-31
```

### Case C — `gross_sales` vs `gross_revenue`

Same orders, different numerators — document which field dashboards use.

### Case D — Cross-month voids/refunds

Orders **created in April**, **voided in May** → in May `voided_orders` / `voided_revenue`, not in May `orders_created`.

---

## 13. Anti-patterns

| Don’t | Do instead |
|-------|------------|
| Sum `active + cancelled + refunded + voided` and call it “total orders” | Use `orders_created` or `total_orders` per definition |
| Compare export FS snapshot to `refunded_orders` on updated_at without join | Use compare script + `updated_at` |
| Use `total_refund_amount` vs export `Refunded Amount` | Use `refunded_revenue_placed` vs export; events vs P&L net |
| Use `serve.mart_finance_daily.net_revenue` as gold net | Use `gold.fct_daily_pnl` |
| Use `dw_shopify_orders.gross_sales` as P&L gross | Use `fct_daily_pnl.gross_revenue` |
| Filter `gross_revenue` to active-only in P&L | `gross_revenue` = all placed statuses; use `cancelled_revenue` / `refunded_revenue_placed` for subsets |
| Average daily `mer` for monthly MER | `sum(net_revenue_excl_tax) / sum(total_ad_spend)` |
| Include `is_test = true` | Filter `is_test = false` |
| Use API window ending `2026-06-01` for “May” | End `2026-05-31` |

---

## Appendix — Quick metric index

| Metric | Primary table | Column |
|--------|---------------|--------|
| Orders created in period | `fct_daily_pnl` | `orders_created` |
| Billable orders (active+cancelled) | `fct_daily_pnl` | `total_orders` |
| Gross sales (customer total, all placed orders) | `fct_daily_pnl` | `gross_revenue` |
| Line catalog gross | `dw_shopify_orders` | `gross_sales` |
| Refunds (cash events) | `fct_daily_pnl` | `total_refund_amount` |
| Refunds (placed status $) | `fct_daily_pnl` | `refunded_revenue_placed` |
| Net sales (Shopify breakdown) | `fct_daily_pnl` | `net_sales_excl_tax` |
| Net cash total | `fct_daily_pnl` | `net_revenue` |
| COGS | `fct_daily_pnl` | `product_cost` |
| RTO logistics cost | `fct_daily_pnl` | `rto_cost` |
| RTO draft COGS (audit) | `fct_daily_pnl` | `rto_adj_product_cost` |
| Ad spend | `fct_daily_pnl` | `total_ad_spend` |
| Company net profit | `fct_daily_pnl` | `net_profit` |
| MER | derived | `sum(net_revenue_excl_tax)/sum(total_ad_spend)` |

**Rebuild full stack:**

```bash
docker exec mageai-local bash -lc 'cd /home/src/default_repo/dbt && \
  dbt seed --select shopify_variant_cost_legacy --full-refresh --vars "{\"enable_seeds\": true}" && \
  dbt run --vars "{\"enable_seeds\": true}"'
python scripts/run_ch_sync_all.py
```
