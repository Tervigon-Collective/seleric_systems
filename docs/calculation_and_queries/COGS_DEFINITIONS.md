# COGS definitions & missing-cost diagnostics

**Canonical models:** `gold.fct_order_items` → rolled up in `gold.fct_daily_pnl`  
**Master glossary:** [BUSINESS_CALCULATIONS_GLOSSARY.md](./BUSINESS_CALCULATIONS_GLOSSARY.md)  
**Date axes:** [PNL_ORDER_DATE_ATTRIBUTION.md](./PNL_ORDER_DATE_ATTRIBUTION.md)

---

## 1. What “COGS” means in this stack

All product and operational unit costs come from Shopify variant **inventory-stream metafields** (GraphQL snapshots), joined **point-in-time** at `order_created_at` via `int_shopify_variant_cost_scd2`.

| Term | Field | Definition |
|------|-------|------------|
| **Unit COGS** | `unit_cost` | Ex-GST product cost per unit (`custom.product_cost_ex_gst`) |
| **Line COGS (snapshot)** | `net_cost` | `unit_cost × net_quantity` where `net_quantity = quantity − refunded_quantity` |
| **Placed COGS** | `total_cost` | `unit_cost × quantity` — full order quantity at placement |
| **Refund COGS reversal** | `refunded_product_cost` | `unit_cost × refunded_quantity` |
| **Booked COGS in P&L** | `product_cost` | **Placement** `sum(total_cost)` − **refund event** `sum(refunded_product_cost)` |
| **Per-unit ops rates** | `*_cost_per_unit`, `rto_per_unit` | Metafield values at order time (for refund-date math) |
| **Placed ops costs** | `placed_packaging_cost`, `placed_shipping_cost`, `placed_gateway_fee` | Rate × `quantity` |
| **Refund ops reversals** | `refunded_packaging_cost`, `refunded_shipping_cost`, `refunded_gateway_fee` | Rate × `refunded_quantity` |
| **Net ops (line snapshot)** | `packaging_cost`, `shipping_cost`, `gateway_fee` | Rate × `net_quantity` (current-state on line row) |
| **`rto_cost` (line)** | `rto_cost` | `rto_per_unit × rto_quantity` when return gate passes |
| **`rto_cost` (P&L)** | `rto_cost` | Refund-event `rto_per_unit × refunded_quantity` + in-flight `IN_PROGRESS` on placement |

COGS is **ex-GST**. P&L revenue ex-GST uses `÷ 1.18` on order totals; `unit_cost` is already ex-GST.

### P&L cost date axes (do not mix)

| Axis | Date | What is booked |
|------|------|----------------|
| **Placement** | `fct_order_items.order_date` | Full-quantity product + shipping + packaging + PG fees |
| **Refund event** | IST `coalesce(refund.processed_at, refund.created_at)` | Reversals of product + ops costs; **RTO logistics** on refunded units |
| **In-flight return** | Same as placement | `return_status = IN_PROGRESS` and `refunded_quantity = 0` → RTO on `order_date` |

```text
daily product_cost = product_cost_placed − product_cost_reversal
daily shipping_cost = shipping_cost_placed − shipping_cost_reversal
… (packaging, payment_gateway_fees same pattern)
daily rto_cost     = rto_cost_placed (IN_PROGRESS only) + rto_cost_refund (refund events)
```

**Filter for net P&L costs:** `revenue_eligible = true` AND `NOT is_gift_card` on `fct_order_items`.  
`is_revenue_adjustment` (RTO ₹0 drafts) lines are **excluded** from net costs; see `rto_adj_*` audit columns on `fct_daily_pnl`.

---

## 2. Point-in-time join (required for `is_cost_set = true`)

```text
fct_order_items.line
  LEFT JOIN shopify__product_variants (by SKU) when line.variant_id IS NULL
  LEFT JOIN int_shopify_variant_cost_scd2 h
    ON  h.brand_id   = line.brand_id
   AND  h.variant_id = coalesce(line.variant_id, catalog.variant_id)
   AND  order_created_at >= h.valid_from
   AND  (h.valid_to IS NULL OR order_created_at <= h.valid_to)
```

| Result | `is_cost_set` | P&L effect |
|--------|:-------------:|------------|
| Match with real COGS (`NOT cogs_missing_flag`) | **true** | Costs booked per axes above |
| No match / zero metafield | **false** | **NULL** on line → P&L **coalesce to 0** |

**SKU fallback:** When `variant_id` is NULL but `sku` matches `shopify__product_variants`, costs attach via catalog `variant_id`.

**Legacy SKU fallback:** When SKU is absent from live catalog, `dbt seed shopify_variant_cost_legacy` supplies SCD2 periods via `gold.stg_shopify_variant_cost_legacy` unioned into `int_shopify_variant_cost_scd2`. Requires `enable_seeds: true` (set in `platform_config.yaml`).

**SCD2 first-version `valid_from`:** `least(first_snapshot_at, coalesce(variant_created_at, 2000-01-01))` so orders before first inventory extract still get COGS.

**Pipeline:**

| Layer | Table | Role |
|-------|-------|------|
| raw | `shopify_product_variants`, variant cost extracts | API |
| silver | `shopify__product_variants`, `shopify__variant_cost_snapshots` | Parse + dedupe |
| gold | `stg_shopify_variant_cost_legacy` | Legacy Postgres cost periods (seed) |
| gold | `int_shopify_variant_cost_scd2` | SCD2 builder + legacy union |
| gold | `fct_product_variant_cost_history` | History for audits (append sync to CH) |
| gold | `fct_product_variant_cost` | Current costs — catalog variants |
| gold | `fct_order_items` | Point-in-time costs on orders |
| gold | `fct_daily_pnl` | Daily rollup (placement − refund reversals) |

---

## 3. `is_cost_set` — precise definition

```sql
is_cost_set = (unit_cost IS NOT NULL AND NOT cogs_missing_flag)
```

`cogs_missing_flag = true` when the metafield is absent and SCD2 coalesced `cogs_per_unit` to 0 — **not** a confirmed free product.

`included_in_pnl_cogs = revenue_eligible AND NOT is_gift_card AND is_cost_set` (line-level flag for exports; P&L sums use `revenue_eligible` filter with `coalesce(..., 0)`).

---

## 4. Why COGS is missing — failure modes

### A. No `variant_id` (custom / deleted SKU)

| Signal | Value |
|--------|--------|
| `variant_id` | **NULL** |
| SKU on line | Present (e.g. `TH-344-SNOUTSTATION`) |

**Fix:** Load `shopify_variant_cost_legacy` seed + rebuild with `enable_seeds: true`. After June 2026 full rebuild with seed: **7** May lines still missing (seed SKUs not in export).

### B. `variant_id` present, no SCD2 window for order time

First cost snapshot after order date. Rare when first-version backdating is working.

### C. SCD2 row exists, zero COGS (`cogs_missing_flag`)

Variant in catalog but **`product_cost_ex_gst`** metafield empty.  
**May 2026 brand 20:** TH-298-CARROT, TH-299-BERRY-P3 (2 lines).

### D. Excluded by design

| Rule | Effect |
|------|--------|
| `is_gift_card = true` | Excluded from P&L cost sums |
| `is_revenue_adjustment = true` | Excluded from net P&L; costs in `rto_adj_*` audit columns |
| `revenue_eligible = false` | Not in P&L cost rollup (cancelled, voided, fully refunded, RTO draft) |

### E. RTO ops cost (`rto_cost`)

**Line-level gate** (must pass + `rto_per_unit IS NOT NULL`):

- `order_status IN ('refunded', 'partially_refunded')`, OR
- `return_status IN ('RETURNED', 'IN_PROGRESS')`, OR
- `refunded_quantity > 0`

**Quantity:**

```text
rto_quantity = refunded_quantity  if refunded_quantity > 0
             else quantity         when gate passes
```

**P&L attribution:**

| Case | Axis | Formula |
|------|------|---------|
| Refund processed | Refund event date | `rto_per_unit × refunded_quantity` per refund line item |
| Return in progress, no refund yet | Placement (`order_date`) | Line `rto_cost` where `IN_PROGRESS` and `refunded_quantity = 0` |

Full returns with `net_quantity = 0` still book RTO on **refund event date** (not zeroed like net snapshot columns).

---

## 5. P&L vs line reconcile (May 2026 brand 20)

Validated after full dbt rebuild + legacy seed (June 2026):

| Metric | May total (₹) | Reconcile |
|--------|--------------:|-----------|
| `product_cost` | 1,321,155.12 | 0 / 31 days line↔P&L mismatch |
| `shipping_cost` | 287,937.00 | 0 mismatch days |
| `packaging_cost` | 24,630.00 | 0 mismatch days |
| `payment_gateway_fees` | 120,567.53 | 0 mismatch days |
| `rto_cost` | 1,989.00 | 0 mismatch days (was ₹117 before RTO fix) |
| `total_operating_cost` | 1,757,600.01 | = sum of five components |
| `product_cost_coverage_pct` | 99.92% | 2,378 / 2,380 eligible lines with `is_cost_set` |
| `rto_adj_product_cost` (audit) | 9,851.06 | RTO draft lines — not in net costs |
| `rto_adj_shipping_cost` (audit) | 1,521.00 | Same |

Report: `reports/may_cogs_reconcile_brand20_2026-06-05.csv`

---

## 6. Diagnostics & export

```bash
python scripts/export_order_cogs_reconcile.py \
  --brand-id 20 --start 2026-05-01 --end 2026-05-31 \
  --export sample_data/orders_export_1.csv
```

```bash
# Full cost chain rebuild
docker exec mageai-local bash -lc 'cd /home/src/default_repo/dbt && \
  dbt seed --select shopify_variant_cost_legacy --full-refresh --vars "{\"enable_seeds\": true}" && \
  dbt run --select stg_shopify_variant_cost_legacy+ --vars "{\"enable_seeds\": true}"'

# Sync to ClickHouse
python scripts/run_ch_sync_all.py
```

**ClickHouse May COGS query:**

```sql
SELECT report_date,
  round(product_cost, 2) AS product_cost,
  round(shipping_cost, 2) AS shipping_cost,
  round(packaging_cost, 2) AS packaging_cost,
  round(payment_gateway_fees, 2) AS pg_fee,
  round(rto_cost, 2) AS rto_cost,
  round(total_operating_cost, 2) AS total_ops,
  round(rto_adj_product_cost, 2) AS rto_adj_prod
FROM gold.fct_daily_pnl FINAL
WHERE brand_id = 20
  AND report_date >= toDate('2026-05-01')
  AND report_date < toDate('2026-06-01')
ORDER BY report_date;
```

---

## 7. Imputed COGS (reconciliation only)

When `is_cost_set = false`, booked COGS = **0**. For sensitivity analysis:

```text
imputed_gap ≈ (missing_line_net_revenue / 1.18) × brand_active_cogs_rate_ex_gst
```

Not stored in `fct_daily_pnl`.

---

*Last updated: June 2026 — placement + refund-event cost axes; RTO on refund quantity; `rto_adj_*` audit columns.*
