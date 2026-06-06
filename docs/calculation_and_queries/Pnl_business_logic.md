# P&L Business Logic — Line-Item Grain
**Shopify Order → Refund → Return → Transaction Lifecycle**

> **Grain:** One row per `order_id × line_item_id`
> **Currency:** INR (all amounts)
> **Tax:** All Shopify prices are **tax-inclusive** (`taxes_included = true`)
> **Status:** Reflects current pipeline gaps; workarounds noted where joins are missing

---

## Table of Contents

1. [Source Tables & Joins](#1-source-tables--joins)
2. [Pre-Computation Flags & Exclusions](#2-pre-computation-flags--exclusions)
3. [Revenue / GMV / Net Revenue](#3-revenue--gmv--net-revenue)
4. [COGS & Gross Margin](#4-cogs--gross-margin)
5. [Refund & Return Impact](#5-refund--return-impact)
6. [Cash vs Accrual Treatment](#6-cash-vs-accrual-treatment)
7. [Derived Status Classification → P&L Bucket](#7-derived-status-classification--pl-bucket)
8. [Formula Reference Summary](#8-formula-reference-summary)
9. [Data Quality Rules & Gap Flags](#9-data-quality-rules--gap-flags)

---

## 1. Source Tables & Joins

| Role | Table | Join Key | Notes |
|---|---|---|---|
| Base line items | `dw_shopify_order_items` | `order_id`, `line_item_id` | Primary grain table |
| Order-level status & money | `dw_shopify_orders` | `order_id` | `financial_status`, `cancelled_at`, `return_status`, totals |
| Refund line items | `trino_shopify_order_refund_line_items` | `line_item_id` | Aggregate per `line_item_id` — multiple refunds possible |
| Refund header | `trino_shopify_order_refunds` | `refund_id` → `order_id` | `restock`, `refund_transaction_amount`, `processed_at` |
| Return snapshots | `trino_shopify_order_return_snapshots` | `order_id` | **Currently order-level only; line-level return data missing** |
| Transactions | `trino_shopify_order_transactions` | `order_id` | `kind`, `status`, `amount`, `gateway`, `processed_at` |
| Variant cost | `trino_shopify_product_variants` | `variant_id` | Unit cost for COGS; use cost effective at `order_date` |

### Aggregation needed before joining

**Refund amounts per line item** — aggregate `trino_shopify_order_refund_line_items` before joining to the base grain:

```sql
SELECT
  line_item_id,
  SUM(refunded_quantity)            AS refunded_quantity,
  SUM(refund_subtotal)              AS refunded_revenue_excl_gst,   -- Shopify gives this ex-tax
  SUM(refund_total_tax)             AS refunded_tax,
  SUM(refund_subtotal + refund_total_tax) AS refunded_revenue_incl_gst,
  -- restock_type: take most recent if multiple refunds on same line
  MAX_BY(restock_type, refund_created_at) AS restock_type
FROM trino_shopify_order_refund_line_items
GROUP BY line_item_id
```

**Transaction totals per order** — aggregate before joining:

```sql
SELECT
  order_id,
  SUM(CASE WHEN kind IN ('sale','capture') AND status = 'success'
        THEN amount ELSE 0 END)     AS transaction_collected,
  SUM(CASE WHEN kind = 'refund'     AND status = 'success'
        THEN amount ELSE 0 END)     AS transaction_refunded,
  MAX(CASE WHEN kind IN ('sale','capture') AND status = 'success'
        THEN processed_at END)      AS payment_confirmed_at,
  MAX(CASE WHEN kind = 'refund'     AND status = 'success'
        THEN processed_at END)      AS last_refund_transaction_at
FROM trino_shopify_order_transactions
GROUP BY order_id
```

---

## 2. Pre-Computation Flags & Exclusions

Evaluate these flags **first**, in waterfall order. They determine which P&L bucket a line belongs to and whether it contributes to any metric.

### 2.1 Hard Exclusion Flags (zero contribution to all metrics)

| Flag | Detection Logic | Effect |
|---|---|---|
| `is_test` | `is_test = true` | Exclude from ALL metrics |
| `is_cancelled` | `cancelled_at IS NOT NULL` | Exclude from ALL metrics; `net_revenue = 0`, `cogs = 0` |
| `is_voided` | `financial_status = 'voided'` | Exclude from revenue; `net_revenue = 0` |
| `is_payment_pending` | `financial_status IN ('pending','authorized','partially_paid')` AND `cancelled_at IS NULL` | **Included in realized revenue** (gold `revenue_eligible`); still tagged `order_status = payment_pending` for reporting |

> **Rule:** `cancelled_at IS NOT NULL` takes precedence over ALL other status fields. A cancelled order with refunds, returns, or partial fulfillment always maps to `net_revenue = 0`.

### 2.2 Inclusion Flags (for revenue-eligible lines)

```
revenue_eligible = (
    is_test = false
    AND cancelled_at IS NULL
    AND financial_status NOT IN ('voided')
    AND financial_status IN ('paid', 'partially_refunded', 'refunded')
)
```

For **GMV** (broader inclusion, payment not yet confirmed):
```
gmv_eligible = (
    is_test = false
    AND cancelled_at IS NULL
    AND financial_status NOT IN ('voided')
)
```

### 2.3 COD Detection

```sql
is_cod_order = (
    element_at(payment_gateway_names, 1) ILIKE '%cash%'
    OR element_at(payment_gateway_names, 1) ILIKE '%cod%'
)
```

> Do NOT use `transactions = []` alone as a COD signal — gateway webhook failures can also result in empty transaction arrays for online orders.

---

## 3. Revenue / GMV / Net Revenue

All revenue fields are at `order_id × line_item_id` grain.

### 3.1 Gross Item Revenue (Tax-Inclusive)

```
gross_item_revenue_incl_gst  =  price  ×  quantity
```

- `price` is the Shopify unit price — **tax-inclusive** for this store.
- `quantity` is the original ordered quantity. Never decremented by refunds in the source.
- This is the **catalog value** of the line, before discounts.

### 3.2 Gross Item Revenue (Ex-GST)

Shopify does not store a per-line ex-GST price in the ingested REST fields. Derive using the **blended order tax rate**:

```
effective_gst_rate          =  total_tax  /  total_price          -- order-level
gross_item_revenue_excl_gst =  gross_item_revenue_incl_gst  ×  (1 - effective_gst_rate)
```

> **Limitation:** This approximation is accurate when all items on the order have the same GST rate. If mixed rates exist (e.g. 12% and 18% categories on same order), derive per-line tax from `discountAllocations[]` or the `taxLines` field once ingested. Flag orders with `total_line_items_price != total_price - total_tax - total_shipping` as tax-mixed.

### 3.3 Line Item Discount

```
line_item_discount  =  total_discount          -- field on dw_shopify_order_items
```

This is the **total discount applied to this specific line** across all discount codes and automatic discounts. It is already allocated at the line level by Shopify.

### 3.4 Net Revenue Pre-Refund (Tax-Inclusive)

```
net_item_revenue_pre_refund_incl_gst  =  gross_item_revenue_incl_gst  -  line_item_discount
```

### 3.5 Net Item Revenue (Final — after refunds)

```
net_item_revenue_incl_gst  =  net_item_revenue_pre_refund_incl_gst  -  refunded_revenue_incl_gst
net_item_revenue_excl_gst  =  net_item_revenue_pre_refund_excl_gst  -  refunded_revenue_excl_gst
```

Where `refunded_revenue_*` fields come from the aggregated refund line items (see Section 5).

> For lines with **open returns and no refund yet**, `net_item_revenue` will still equal `net_item_revenue_pre_refund`. This is **not yet a financial error** — the refund has not been issued. It IS at-risk revenue (see Section 5.4).

### 3.6 GMV vs Net Revenue — Distinction

| Metric | Formula | Includes | Excludes |
|---|---|---|---|
| **GMV** | `SUM(gross_item_revenue_incl_gst)` WHERE `gmv_eligible` | Pending payments, partial payments | Test, cancelled, voided |
| **Gross Sales** | `SUM(gross_item_revenue_incl_gst)` WHERE `revenue_eligible` | Paid, partially refunded, refunded | Pending, cancelled, voided, test |
| **Net Revenue** | `SUM(net_item_revenue_incl_gst)` WHERE `revenue_eligible` | All above minus all refunds | Same exclusions |
| **Net Revenue (Ex-GST)** | `SUM(net_item_revenue_excl_gst)` WHERE `revenue_eligible` | Net revenue less GST | Same exclusions |

### 3.7 Revenue Recognition Date

| Basis | Date Field | Notes |
|---|---|---|
| **Accrual** | `order_date` (= `orders.created_at` date part) | Recognize full gross amount on order date |
| **Cash** | `transaction.payment_confirmed_at` | Date of successful `sale`/`capture` transaction |
| **COD (Cash basis)** | `orders.updated_at` WHERE `financial_status` changed to `'paid'` | Merchant manually marks paid; no transaction date available |

See Section 6 for full cash vs accrual treatment.

---

## 4. COGS & Gross Margin

### 4.1 Unit Cost

```
unit_cost  =  trino_shopify_product_variants.cost
              WHERE variant_id = line_item.variant_id
              AND cost_effective_date <= order_date
              ORDER BY cost_effective_date DESC
              LIMIT 1
```

Use the **cost effective at order_date**, not the current cost. This ensures historical margins are stable and not restated when costs change.

If no cost record exists: `unit_cost = NULL`. Flag as `missing_cost_flag = true`. Exclude from margin calculations but retain in revenue calculations.

### 4.2 COGS Buckets

**Gold `fct_order_items` → `fct_daily_pnl` (canonical P&L):**

| Bucket | Formula | P&L date axis |
|--------|---------|---------------|
| `total_cost` | `unit_cost × quantity` | **Placement** (`order_date`) |
| `refunded_product_cost` | `unit_cost × refunded_quantity` | **Refund event** |
| `net_cost` | `unit_cost × net_quantity` | Line snapshot only |
| `placed_*` / `refunded_*` ops | rate × qty / refunded_qty | Placement / refund event |
| `rto_cost` | `rto_per_unit × rto_quantity` | See [COGS_DEFINITIONS.md](./COGS_DEFINITIONS.md) |

**DW `dw_shopify_order_items` (serve / line economics):**

| Bucket | Formula | Condition |
|---|---|---|
| `cogs_active` | `unit_cost × net_quantity` | Units sold and not refunded/returned |
| `cogs_refunded` | `unit_cost × refunded_quantity` | Units for which a refund was issued |
| `cogs_cancelled` | `0` | Cancelled lines — item never shipped, cost not incurred |

```
net_quantity        =  quantity  -  refunded_quantity
cogs_active         =  unit_cost  ×  net_quantity
cogs_refunded       =  unit_cost  ×  refunded_quantity
total_cogs_incurred =  cogs_active  +  cogs_refunded    -- = unit_cost × quantity
```

> Gold P&L books **placement `total_cost` minus refund-event reversals**, not `net_cost` on placement day (which retroactively zeros when refunds update).

### 4.3 COGS by Restock Type

`restock_type` determines whether the physical cost is recovered (item back in stock) or a true write-off:

| `restock_type` | Physical Outcome | COGS Treatment | Inventory |
|---|---|---|---|
| `return` | Item back to sellable stock | Charge to `cogs_refunded` | Inventory restored |
| `no_restock` | Item kept by customer | Charge to `cogs_refunded` (write-off) | Inventory NOT restored |
| `cancel` | Item never shipped | `cogs_active = 0`, `cogs_refunded = 0` | No change |
| `legacy_restock` | Pre-2018 return | Treat as `return` | Inventory restored |
| `NULL` | Manual/adjustment refund, no physical item | `cogs_refunded = 0` for this line | N/A |

> Note: For margin reporting, `no_restock` refunds are more costly than `return` refunds — the item cost is a permanent write-off. Separate these buckets in margin analysis.

### 4.4 Gross Margin

```
gross_margin_incl_gst  =  net_item_revenue_incl_gst  -  cogs_active
gross_margin_excl_gst  =  net_item_revenue_excl_gst  -  cogs_active

gross_margin_pct       =  gross_margin_excl_gst  /  net_item_revenue_excl_gst
```

> Always use **ex-GST revenue** when computing margin percentages. GST is a pass-through tax — including it in the denominator understates margins.

### 4.5 Contribution Margin (Extended)

If shipping cost allocation is available:

```
contribution_margin  =  gross_margin_excl_gst  -  allocated_shipping_cost
```

Where `allocated_shipping_cost = shipping_amount × (gross_item_revenue_excl_gst / subtotal_price)` (pro-rata allocation across lines).

---

## 5. Refund & Return Impact

### 5.1 Refund Fields at Line-Item Grain

Source: aggregated `trino_shopify_order_refund_line_items` joined on `line_item_id`.

| Derived Field | Source | Formula |
|---|---|---|
| `refunded_quantity` | `SUM(refund_line_items.quantity)` | Units refunded across all refund events |
| `refunded_revenue_excl_gst` | `SUM(refund_line_items.subtotal)` | Ex-GST refund value (Shopify REST gives this ex-tax) |
| `refunded_tax` | `SUM(refund_line_items.total_tax)` | GST component of refund |
| `refunded_revenue_incl_gst` | `refunded_revenue_excl_gst + refunded_tax` | Full refund value (use for tax-inclusive P&L) |
| `restock_type` | `MAX_BY(restock_type, refund_created_at)` | Most recent restock disposition |

### 5.2 Return Fields at Line-Item Grain

> **Current pipeline gap:** Return line items (`returnLineItems[]`) are **not yet ingested**. Only order-level return status is available via `trino_shopify_order_return_snapshots`.

**Available today (order-level, apply to all lines on the order):**

| Field | Source | Notes |
|---|---|---|
| `return_status` | `trino_shopify_order_return_snapshots.shopify_return_status` | Order-level rollup |
| `max_return_created_at` | `trino_shopify_order_return_snapshots` | When return was initiated |
| `max_return_closed_at` | `trino_shopify_order_return_snapshots` | When return was closed |

**To be added when return line items are ingested:**

| Future Field | Source | Formula |
|---|---|---|
| `returned_quantity` | `returnLineItems[].quantity` | Units physically returned |
| `return_reason` | `returnLineItems[].returnReason` | Enum: `SIZE_TOO_SMALL`, `DAMAGED`, etc. |
| `refundable_quantity` | `returnLineItems[].refundableQuantity` | Returned but not yet refunded |
| `returned_not_refunded_qty` | `returned_quantity - refunded_quantity` | At-risk units (item back, money not returned) |

### 5.3 Refund Revenue Reduction Logic

Apply in this order:

```
1. gross_item_revenue_incl_gst    = price × quantity
2. line_item_discount             = total_discount
3. net_pre_refund                 = gross - discount
4. refunded_revenue_incl_gst      = from refund_line_items aggregation
5. net_item_revenue_incl_gst      = net_pre_refund - refunded_revenue_incl_gst
```

**Guard against over-refund:**
```
IF net_item_revenue_incl_gst < 0:
    → Set net_item_revenue_incl_gst = 0
    → Set over_refund_flag = true
    → Log: (refunded_revenue_incl_gst - net_pre_refund) as over_refund_amount
```

### 5.4 At-Risk Revenue Classification

These lines are **recognized as revenue** but have elevated refund probability:

| Condition | Flag | Revenue Treatment |
|---|---|---|
| `return_status IN ('IN_PROGRESS','RETURN_REQUESTED','INSPECTION_COMPLETE')` AND `refunded_quantity = 0` | `at_risk_revenue = true` | Counted as revenue; provision separately |
| `return_status = 'RETURNED'` AND `refunded_quantity = 0` | `return_closed_no_refund = true` | Revenue stands; investigate (exchange / store credit?) |
| `return_status IN ('IN_PROGRESS')` AND `refunded_quantity > 0` | Active partial: partial refund done | Revenue partially reduced; remainder still at risk |

**At-risk revenue amount (order level):**

```sql
at_risk_revenue_amount  =  SUM(net_item_revenue_incl_gst)
WHERE return_status IN ('IN_PROGRESS','RETURN_REQUESTED','INSPECTION_COMPLETE')
  AND refunded_quantity = 0
  AND revenue_eligible = true
```

### 5.5 COD Refund Gap

COD orders produce no `refund` transaction — cash is returned outside Shopify.

```
is_cod_refund  =  is_cod_order = true
                  AND refunded_quantity > 0        -- refund exists in Shopify records
                  AND refund_transaction_amount = 0 -- but no money moved via gateway
```

Revenue reduction IS correctly applied (Shopify tracks the refund amount). The gap is a **cash flow gap**, not a P&L gap. The finance team must reconcile COD refunds externally.

### 5.6 Refund Type Classification Matrix

Use `restock_type` + `transaction.gateway` to classify each refund:

| `restock_type` | `transaction.gateway` | Classification | COGS Impact | Cash Outflow |
|---|---|---|---|---|
| `return` | Razorpay / online | Standard return + online refund | `cogs_refunded` | Yes (gateway) |
| `return` | `cash` / none | Return + COD cash refund | `cogs_refunded` | Yes (offline) |
| `no_restock` | Razorpay / online | Goodwill refund, item kept | Write-off (`cogs_refunded`) | Yes (gateway) |
| `no_restock` | `store_credit` / `gift_card` | Store credit issued, item kept | Write-off (`cogs_refunded`) | No (internal liability) |
| `cancel` | Any | Pre-shipment cancellation | `0` (never shipped) | Depends on prior capture |
| `legacy_restock` | Any | Old return — treat as `return` | `cogs_refunded` | Depends on gateway |
| `NULL` | None | Manual / adjustment refund | `0` at line level | Offline |

---

## 6. Cash vs Accrual Treatment

### 6.1 Core Definitions

| Concept | Accrual Basis | Cash Basis |
|---|---|---|
| Revenue recognized when | `order_date` (order created and payment confirmed) | `transaction.processed_at` WHERE `kind IN ('sale','capture')` AND `status = 'success'` |
| Revenue date for COD | `order_date` | Date merchant marks paid (use `orders.updated_at` as proxy) |
| Refund recognized when | `refund.processed_at` | `transaction[kind=refund].processed_at` |
| COD refund date | `refund.processed_at` | `refund.processed_at` (no transaction; use same) |
| Pending orders | Include at `order_date` with full value | Exclude until payment confirmed |
| Open return, no refund | Full revenue recognized, `at_risk_revenue` flag | Full revenue recognized |

### 6.2 Revenue Date Derivation

```sql
-- Accrual date
revenue_date_accrual  =  DATE(orders.created_at)

-- Cash date
revenue_date_cash  =  COALESCE(
    transaction.payment_confirmed_at,          -- online orders
    CASE WHEN is_cod_order AND financial_status = 'paid'
         THEN DATE(orders.updated_at)           -- COD: proxy for when merchant marked paid
    END
)

-- Refund date (both bases use refund.processed_at; cash also accepts transaction date)
refund_date_accrual  =  DATE(refunds.processed_at)
refund_date_cash     =  COALESCE(
    DATE(transaction.last_refund_transaction_at),   -- online refunds
    DATE(refunds.processed_at)                      -- COD and manual refunds
)
```

### 6.3 Period Revenue Calculation

For a given reporting period `[period_start, period_end]`:

**Accrual:**
```
period_gross_revenue  =  SUM(gross_item_revenue_incl_gst)
                         WHERE revenue_date_accrual BETWEEN period_start AND period_end
                           AND revenue_eligible = true

period_refund_amount  =  SUM(refunded_revenue_incl_gst)
                         WHERE refund_date_accrual BETWEEN period_start AND period_end

period_net_revenue    =  period_gross_revenue  -  period_refund_amount
```

> Under accrual, gross and refunds may fall in different periods. An order placed in March refunded in April reduces April's net revenue, not March's.

**Cash:**
```
period_cash_in        =  SUM(transaction_collected)
                         WHERE DATE(payment_confirmed_at) BETWEEN period_start AND period_end

period_cash_out       =  SUM(transaction_refunded)
                         WHERE DATE(last_refund_transaction_at) BETWEEN period_start AND period_end

period_net_cash       =  period_cash_in  -  period_cash_out
```

### 6.4 Store Credit / Gift Card Refunds — Special Treatment

Refunds issued as `store_credit` or `gift_card` create an **internal liability**, not a cash outflow.

```
cash_refund_amount   =  SUM(refunded_revenue_incl_gst)
                        WHERE transaction.gateway NOT IN ('store_credit','gift_card')
                          AND transaction.kind = 'refund'
                          AND transaction.status = 'success'

credit_refund_amount =  SUM(refunded_revenue_incl_gst)
                        WHERE transaction.gateway IN ('store_credit','gift_card')
                          AND transaction.kind = 'refund'
```

**P&L treatment:** Both `cash_refund_amount` and `credit_refund_amount` reduce revenue equally.
**Cash flow treatment:** Only `cash_refund_amount` is an actual cash outflow. `credit_refund_amount` is a deferred liability (gift card / store credit balance).

### 6.5 Pending Payment Orders (COD Unconfirmed / Gateway Delays)

| Order State | Accrual | Cash |
|---|---|---|
| `financial_status = 'pending'` + is COD | Include in GMV; **exclude from revenue** | Exclude |
| `financial_status = 'authorized'` + online | Include in GMV; **exclude from revenue** | Exclude until `capture` |
| `financial_status = 'partially_paid'` | Include partial amount; outstanding is liability | Include only collected amount |

> Current DW bug: pending orders are treated identically to paid orders in revenue calculations. Until fixed, apply the exclusion filter `financial_status IN ('paid','partially_refunded','refunded')` in all revenue queries.

---

## 7. Derived Status Classification → P&L Bucket

Apply the following waterfall to assign `order_financial_status_derived` and map to P&L bucket. Evaluate top-to-bottom, stop at first match.

| Priority | Condition | Derived Status | P&L Bucket | Net Revenue | COGS |
|---|---|---|---|---|---|
| 1 | `cancelled_at IS NOT NULL` | `cancelled` | Cancelled | `0` | `0` |
| 2 | `financial_status = 'voided'` | `voided` | Voided | `0` | `0` |
| 3 | `financial_status IN ('pending','authorized','partially_paid')` | `payment_pending` | Pending | Full line net (incl. GST) | `cogs_active` |
| 4 | `return_status IN ('IN_PROGRESS','RETURN_REQUESTED','INSPECTION_COMPLETE')` AND `refunded_quantity = 0` | `return_pending_refund` | At-Risk Revenue | Full (flagged) | `cogs_active` |
| 5 | `return_status = 'RETURNED'` AND `refunded_quantity = 0` | `returned_no_refund` | Investigate | Full (flagged) | `cogs_active` |
| 6 | `financial_status = 'refunded'` AND `return_status = 'RETURNED'` | `fully_returned_and_refunded` | Returned | `0` (all refunded) | `0` |
| 7 | `financial_status = 'refunded'` | `refunded` | Refunded | `0` | `0` |
| 8 | `financial_status = 'partially_refunded'` AND `return_status = 'NO_RETURN'` | `partial_refund_no_return` | Goodwill / Adjustment | `gross - discounts - refund` | `cogs_active` |
| 9 | `financial_status = 'partially_refunded'` | `partially_refunded` | Partially Refunded | `gross - discounts - refund` | `cogs_active` |
| 10 | `return_status = 'RETURN_FAILED'` | `paid` | Active | Full | `cogs_active` |
| 11 | `financial_status = 'paid'` | `paid` | Active | Full | `cogs_active` |

### 7.1 Revenue Contribution by P&L Bucket

```
GMV                   =  Buckets 4, 5, 6, 7, 8, 9, 10, 11
Realized Revenue      =  Buckets 4, 5, 8, 9, 10, 11        (pending excluded)
Confirmed Revenue     =  Buckets 10, 11                     (no open returns)
At-Risk Revenue       =  Buckets 4, 5                       (open or unexplained returns)
Refunded Revenue      =  Buckets 6, 7                       (fully zeroed out)
```

---

## 8. Formula Reference Summary

### 8.1 Per Line-Item (one row per order_id × line_item_id)

```
-- Revenue
gross_item_revenue_incl_gst       =  price × quantity
gross_item_revenue_excl_gst       =  gross_item_revenue_incl_gst × (1 - total_tax / total_price)
line_item_discount                =  total_discount
net_pre_refund_incl_gst           =  gross_item_revenue_incl_gst - line_item_discount
refunded_revenue_incl_gst         =  refunded_revenue_excl_gst + refunded_tax        [from refund agg]
net_item_revenue_incl_gst         =  MAX(0, net_pre_refund_incl_gst - refunded_revenue_incl_gst)
net_item_revenue_excl_gst         =  MAX(0, net_pre_refund_excl_gst - refunded_revenue_excl_gst)

-- COGS
unit_cost                         =  from variant cost history @ order_date
net_quantity                      =  quantity - refunded_quantity
cogs_active                       =  unit_cost × net_quantity
cogs_refunded                     =  unit_cost × refunded_quantity
gross_margin_excl_gst             =  net_item_revenue_excl_gst - cogs_active
gross_margin_pct                  =  gross_margin_excl_gst / net_item_revenue_excl_gst

-- Refund & Return
refunded_quantity                 =  SUM(refund_line_items.quantity) per line_item_id
at_risk_revenue                   =  (return_status IN ('IN_PROGRESS','RETURN_REQUESTED',
                                       'INSPECTION_COMPLETE')) AND refunded_quantity = 0
return_closed_no_refund           =  return_status = 'RETURNED' AND refunded_quantity = 0

-- Cash / Accrual dates
revenue_date_accrual              =  DATE(orders.created_at)
revenue_date_cash                 =  transaction.payment_confirmed_at (online)
                                  OR orders.updated_at proxy (COD)
refund_date_accrual               =  DATE(refunds.processed_at)
refund_date_cash                  =  DATE(transaction.last_refund_transaction_at)
                                  OR DATE(refunds.processed_at) for COD
```

### 8.2 Aggregated (order or period level cross-check)

```
-- These should match Shopify's stored values
net_revenue_check         =  current_total_price                         [Shopify live value]
refund_total_check        =  total_price - current_total_price           [= total_refunded]
transaction_net_check     =  transaction_collected - transaction_refunded [should ≈ current_total_price]

-- Gaps to flag
refund_cash_gap           =  refund_total > 0 AND refund_transaction_amount = 0   [COD or manual]
reconciliation_gap        =  total_price - transaction_collected                   [untracked payment]
over_refund_flag          =  net_item_revenue_incl_gst < 0 on any line
```

---

## 9. Data Quality Rules & Gap Flags

### 9.1 Pipeline fixes (June 2026 audit)

| Issue | Fix |
|---|---|
| `payment_pending` counted as active / realized revenue | `shopify_order_status` → `payment_pending`; excluded from `revenue_eligible` COGS |
| Cancelled orders with non-zero line `net_revenue` | `shopify_line_net_revenue_realized` zeros lines when `cancelled_at` set |
| Negative `order_net_revenue` (shipping refund overflow) | Removed `greatest(0,…)` clamp; `over_refund_flag` on heavy refund days |
| COGS included without SCD2 cost | `is_cost_set` = real COGS only (`NOT cogs_missing_flag`) |
| COGS retroactively zeroed on placement when refunded later | **P&L uses placement `total_cost` − refund-event reversals** (not `net_cost` rollup) |
| RTO cost zero on full returns (`net_quantity = 0`) | **RTO on refund event:** `rto_per_unit × refunded_quantity`; IN_PROGRESS on placement |
| Shopify Analytics net_sales mismatch | `net_sales_excl_tax = gross − disc − returns`; voided audit-only |
| Voided double-subtract from net | Removed voided from `net_sales_excl_tax`; use `voided_*` audit columns |
| RTO draft costs invisible | `rto_adj_*` audit columns on `fct_daily_pnl` |

**Realized revenue filter:** `revenue_eligible = true` on `fct_orders` / `fct_order_items`.

**Rebuild:** `dbt run --vars '{"enable_seeds": true}'` + `python scripts/run_ch_sync_all.py`

Reports: `reports/may_cogs_reconcile_brand20_2026-06-05.csv`, `reports/may_pnl_daywise_drift_brand20_2026-06-05.csv`

### 9.1b Remaining gaps

| Gap | Impact | Workaround |
|---|---|---|
| `returnLineItems[]` not ingested | Cannot measure return impact at line level | Use order-level `return_status` as proxy |
| `total_refunded` sparse in raw | Cannot cross-check refund aggregation | Use `total_price - current_total_price` as proxy |
| Flat 18% ex-GST divisor | Mixed-GST catalogue may mis-state ex-GST margin | Flag; use order `total_tax/total_price` blend when ingesting per-line tax |

### 9.2 Validation Rules

Run these checks after each build to detect calculation errors:

```sql
-- Check 1: Net revenue should not exceed gross
SELECT order_id, line_item_id
FROM pnl_line_items
WHERE net_item_revenue_incl_gst > gross_item_revenue_incl_gst
  AND revenue_eligible = true

-- Check 2: Net quantity should not be negative
SELECT order_id, line_item_id
FROM pnl_line_items
WHERE net_quantity < 0

-- Check 3: Over-refund detection
SELECT order_id, line_item_id, ABS(net_item_revenue_incl_gst) AS over_refund_amount
FROM pnl_line_items
WHERE net_item_revenue_incl_gst < 0

-- Check 4: Transaction reconciliation gap > 5% of order value
SELECT order_id, total_price, transaction_collected,
       ABS(total_price - transaction_collected) / total_price AS gap_pct
FROM dw_shopify_orders o
JOIN txn_agg t USING (order_id)
WHERE financial_status = 'paid'
  AND ABS(total_price - transaction_collected) / total_price > 0.05
  AND is_cod_order = false    -- exclude COD (no gateway transaction expected)

-- Check 5: Paid COD orders with missing payment confirmation date
SELECT order_id
FROM dw_shopify_orders
WHERE is_cod_order = true
  AND financial_status = 'paid'
  AND revenue_date_cash IS NULL

-- Check 6: Open return orders with no return snapshot join
SELECT order_id
FROM dw_shopify_orders
WHERE financial_status = 'paid'
  AND return_status IS NULL       -- snapshot not joined
  AND order_date > '2024-01-01'  -- should have snapshot data
```

### 9.3 Missing Cost Handling

```
IF unit_cost IS NULL:
    missing_cost_flag     = true
    cogs_active           = NULL
    gross_margin_excl_gst = NULL
    gross_margin_pct      = NULL
    -- Revenue fields still computed; only margin fields are NULL
```

Report missing cost coverage as: `COUNT(*) WHERE missing_cost_flag = true / COUNT(*)` per period. Target < 2%.

### 9.4 GST Apportionment Note

The blended tax rate approximation (`total_tax / total_price`) is acceptable for most P&L reporting. It becomes inaccurate when a single order mixes GST-exempt items with taxable items. Identify such orders:

```sql
SELECT order_id
FROM dw_shopify_order_items
GROUP BY order_id
HAVING COUNT(DISTINCT taxable) > 1     -- mix of taxable and non-taxable lines
```

For these orders, flag `tax_apportionment_approx = true` and hold for exact per-line tax data once `taxLines[]` is ingested.

---

## 10. Gold `fct_daily_pnl` — canonical daily metrics (June 2026)

**Model:** `dbt/models/iceberg/cross_platform/fct_daily_pnl.sql`  
**Grain:** `brand_id` × `report_date` (IST)

This section maps the **implemented** gold P&L to Shopify Analytics. For date-axis detail see [PNL_ORDER_DATE_ATTRIBUTION.md](./PNL_ORDER_DATE_ATTRIBUTION.md).

### 10.1 Revenue (Shopify breakdown)

```text
gross_sales_excl_tax  = sum(total_price + total_discounts) / 1.18   [placement, incl. cancelled + RTO]
total_discounts_excl  = sum(total_discounts) / 1.18
returns_excl          = sum(refund_event subtotal + adjustments) / 1.18
net_sales_excl_tax    = gross_sales_excl_tax − discounts_excl − returns_excl
total_tax_collected   = net_sales_excl_tax × 0.18
total_sales_incl_tax  = net_sales_excl_tax + total_tax_collected + shipping_charged_to_customers

net_revenue (cash)    = gross_revenue − total_refund_amount
```

**Voided:** `voided_revenue`, `voided_revenue_placed` — audit only; **not** in `net_sales_excl_tax`.

**RTO audit:** `rto_gross_revenue`, `rto_orders_placed`, `rto_gross_sales_excl_tax`, `rto_discounts_excl_tax`.

### 10.2 Costs (placement − refund reversals)

```text
product_cost          = product_placed − product_refund_reversal
shipping_cost         = shipping_placed − shipping_refund_reversal
packaging_cost        = packaging_placed − packaging_refund_reversal
payment_gateway_fees  = pg_placed − pg_refund_reversal
rto_cost              = rto_IN_PROGRESS_on_placement + rto_on_refund_events
total_operating_cost  = sum of five above

rto_adj_*             = costs on is_revenue_adjustment lines (excluded from net)
```

### 10.3 Profit

```text
gross_profit         = net_revenue_excl_tax − product_cost
contribution_margin  = net_revenue_excl_tax − product_cost − total_ad_spend
net_profit           = net_revenue_excl_tax − total_ad_spend − total_operating_cost
```

### 10.4 May 2026 brand 20 reference

| Metric | ₹ |
|--------|---:|
| `net_sales_excl_tax` | 3,662,838.90 |
| `product_cost` | 1,321,155.12 |
| `rto_cost` | 1,989.00 |
| `total_operating_cost` | 1,757,600.01 |
| `net_profit` | −352,708.07 |

---

*Last updated: June 2026*
*References: COGS_DEFINITIONS.md, PNL_ORDER_DATE_ATTRIBUTION.md, BUSINESS_CALCULATIONS_GLOSSARY.md*