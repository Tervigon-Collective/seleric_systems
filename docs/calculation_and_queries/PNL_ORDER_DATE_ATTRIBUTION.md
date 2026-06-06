# P&L order date attribution (`gold.fct_daily_pnl`)

> **Master reference:** [BUSINESS_CALCULATIONS_GLOSSARY.md](./BUSINESS_CALCULATIONS_GLOSSARY.md)  
> **COGS axes:** [COGS_DEFINITIONS.md](./COGS_DEFINITIONS.md)

Aligned with **Shopify Admin order export** and **Shopify Analytics** breakdown (gross, discounts, returns, net, taxes, total sales).

## Shopify export → gold mapping

| Shopify export column | Gold `fct_orders` | Used in P&L on |
|----------------------|-------------------|-----------------|
| **Created at** | `order_date` (IST) | Placement axis |
| **Updated at** | `updated_at` → IST date | Status-change axis |
| **Financial Status: Paid** (not cancelled) | `order_status` = `active` | Created at |
| **Cancelled** | `order_status` = `cancelled` | Created at |
| **Refunded** | `order_status` = `refunded` | **Updated at** (count) |
| **Partially refunded** | `order_status` = `partially_refunded` | **Updated at** (count) |
| **Voided** | `order_status` = `voided` | **Updated at** (audit) |
| **Total** | `gross_revenue` (`total_price`) | **Created at** (all statuses incl. cancelled) |
| **Discounts** | `total_discounts` | Created at |
| **Refund transactions** | `total_refund_amount` | Refund **event** date (IST `processed_at` / `created_at`) |

`revenue_eligible` = `order_status IN ('active', 'partially_refunded', 'payment_pending')` AND `NOT is_revenue_adjustment`.

## Four date axes (do not mix)

| Axis | Date field | Drives |
|------|------------|--------|
| **A — Placement** | `order_date` | Order counts, `gross_revenue`, `gross_sales_excl_tax`, discounts, shipping charged, **cost placement** |
| **B — Status change** | IST `updated_at` | `refunded_orders`, `voided_orders`, `voided_revenue`, `revenue_adjustment_orders` |
| **C — Refund events** | IST refund `processed_at` / `created_at` | `total_refund_amount`, **cost reversals**, **RTO on refunds** |
| **D — Cost placement** | Same as A | `product_cost_placed`, ops costs at full `quantity` |
| **E — Cost reversal** | Same as C | `refunded_product_cost`, ops reversals, `rto_cost_refund` |

```text
WRONG:  sum(total_orders) + sum(refunded_orders) = orders in month
RIGHT:  sum(orders_created) = all Shopify rows with Created at in month
        sum(total_orders)    = active + cancelled only (placement)
```

## Order count buckets

| Bucket | `report_date` | P&L column |
|--------|---------------|------------|
| All placed | **Created at** | `orders_created` |
| Active (excl. RTO draft) | **Created at** | `active_orders` |
| Cancelled | **Created at** | `cancelled_orders` |
| RTO draft placed | **Created at** | `rto_orders_placed` |
| Refunded + partial | **Updated at** | `refunded_orders` |
| Voided | **Updated at** | `voided_orders`, `voided_revenue` |
| RTO draft status change | **Updated at** | `revenue_adjustment_orders` |

| Label | May 2026 brand 20 |
|-------|-------------------:|
| `orders_created` | **1,897** |
| `total_orders` (active + cancelled) | **1,794** |
| `active_orders` | **1,753** |

## Revenue — Shopify Analytics alignment

| Field | Rule |
|-------|------|
| `gross_revenue` | Sum `total_price` all placement orders incl. cancelled (excl. test; excl. RTO from `gross_revenue` non-adj bucket) |
| `gross_sales_excl_tax` | `sum(total_price + total_discounts) / 1.18` — all placement incl. cancelled **and RTO** |
| `total_discounts_excl_tax` | Shopify “Discounts” line |
| `total_refund_amount` | Refund events incl. GST: `sum(refund_subtotal + adjustments)` — subtotal is tax-inclusive |
| `returns_excl_tax` | `total_refund_amount / 1.18` |
| `total_refund_tax` | `total_refund_amount − returns_excl_tax` |
| `net_sales_excl_tax` | `gross_sales_excl_tax − discounts_excl − returns_excl` — **voided NOT subtracted** |
| `total_tax_collected` | `net_sales_excl_tax × 0.18` (allows negative on refund-heavy days) |
| `shipping_charged_to_customers` | Customer-charged shipping on placement (non-RTO) |
| `total_sales_incl_tax` | `net_sales_excl_tax + total_tax_collected + shipping_charged_to_customers` |
| `net_revenue` | `gross_revenue − total_refund_amount` — cash-style total sales; **may be negative** |
| `voided_revenue` / `voided_revenue_excl_tax` | Audit on **Updated at** — overlaps returns; do not subtract from `net_sales_excl_tax` |
| `voided_revenue_placed` | Voided on **Created at** (placement audit) |
| `net_sales_excl_tax_incl_voided_deduction` | Legacy audit only — do not use for Shopify reconcile |
| `rto_gross_revenue` / `rto_gross_sales_excl_tax` | RTO revenue-adjustment orders on placement (audit) |

**May 2026 brand 20 (Shopify vs gold):**

| Metric | Shopify Analytics | Gold | Notes |
|--------|------------------:|-----:|-------|
| Gross sales | 4,386,697.74 | 4,382,578.81 | ~₹4k cohort gap |
| Discounts | 230,842.30 | 226,350.25 | ~₹4.5k |
| Returns | 493,622.52 | 493,389.66 | ~₹233 |
| Net sales | 3,662,232.92 | 3,662,838.90 | ~₹606 |
| Taxes | 658,924.98 | 659,311.00 | net × 18% |
| Total sales | 4,321,789.90 | 4,322,881.90 (breakdown) | shipping definition differs |

## Operating costs — two-axis rollup

| P&L column | Formula |
|------------|---------|
| `product_cost` | `sum(total_cost)` on placement − `sum(refunded_product_cost)` on refund events |
| `shipping_cost` | `placed_shipping_cost` − `refunded_shipping_cost` (same axes) |
| `packaging_cost` | placed − refunded reversals |
| `payment_gateway_fees` | placed − refunded reversals |
| `rto_cost` | IN_PROGRESS on placement (no refund yet) + `rto_per_unit × refunded_qty` on refund events |
| `total_operating_cost` | Sum of five net cost columns above |
| `rto_adj_product_cost` | Audit: `total_cost` on `is_revenue_adjustment` lines (excluded from net) |
| `rto_adj_shipping_cost` | Audit: placed shipping on RTO drafts |
| `rto_adj_packaging_cost` | Audit |
| `rto_adj_payment_gateway_fees` | Audit |

**Filter:** `revenue_eligible AND NOT is_gift_card` for net costs.

## Refunds in P&L

| Question | Use | Do **not** use |
|----------|-----|----------------|
| Cash refunded **in May**? | `total_refund_amount` (refund event date) | `refunded_revenue_placed`, export Refunded Amount |
| Cancelled value **placed in May**? | `cancelled_revenue` | Refund event sum |
| Refunded order totals at placement? | `refunded_revenue_placed` (audit) | P&L net subtraction |

Refund events include orders placed **before** May if refunded in May.

## Profit stack (daily row)

```text
gross_profit          = net_revenue_excl_tax − product_cost
contribution_margin   = net_revenue_excl_tax − product_cost − total_ad_spend
net_profit            = net_revenue_excl_tax − total_ad_spend − total_operating_cost
```

## Query snippets

**ClickHouse:**

```sql
SELECT
  sum(gross_sales_excl_tax) AS gross_excl,
  sum(net_sales_excl_tax) AS net_excl,
  sum(total_refund_amount) AS refunds,
  sum(product_cost) AS product_cost,
  sum(rto_cost) AS rto_cost,
  sum(total_operating_cost) AS total_ops,
  sum(net_profit) AS net_profit
FROM gold.fct_daily_pnl FINAL
WHERE brand_id = 20
  AND report_date >= toDate('2026-05-01')
  AND report_date < toDate('2026-06-01');
```

**Trino:**

```sql
SELECT sum(net_sales_excl_tax), sum(net_revenue), sum(product_cost), sum(rto_cost)
FROM iceberg.gold.fct_daily_pnl
WHERE brand_id = 20
  AND report_date >= DATE '2026-05-01'
  AND report_date < DATE '2026-06-01';
```

## Rebuild

```bash
docker exec mageai-local bash -lc 'cd /home/src/default_repo/dbt && \
  dbt run --vars "{\"enable_seeds\": true}"'
python scripts/run_ch_sync_all.py
```

Reports: `reports/may_cogs_reconcile_brand20_2026-06-05.csv`, `reports/may_pnl_daywise_drift_brand20_2026-06-05.csv`

*Last updated: June 2026*
