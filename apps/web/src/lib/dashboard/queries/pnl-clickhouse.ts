import "server-only"

import { clickHouseQuery } from "@/lib/clickhouse-client"
import { type DashboardBrandFilter } from "../brand-filter"
import { priorDateRange, type DashboardDateRange } from "../date-ranges"

/**
 * Direct-ClickHouse P&L fetcher for the /pnl dashboard. Reads raw columns
 * from `gold.fct_daily_pnl` so the dashboard matches the canonical bridge
 * defined in `scripts/reconcile_daily_pnl_audit.py`:
 *
 *   net_sales_excl_gst = gross_sales_excl_gst
 *                      − total_discounts_excl_gst
 *                      − notes_return_refund_excl_gst
 *                      − notes_adjustment_refund_excl_gst
 *   net_sales_incl_gst = gross_sales_excl_gst × 1.18
 *                      − total_discounts_excl_gst × 1.18
 *                      − notes_return_refund_incl_gst
 *                      − notes_adjustment_refund_incl_gst
 *   gross_profit       = net_sales − product_cost
 *   net_profit         = gross_profit − total_ad_spend
 *                                     − shipping_cost − packaging_cost
 *                                     − payment_gateway_fees − rto_cost
 *
 * The Cube semantic layer's `canonical_pnl.net_sales_excl_tax` /
 * `net_profit` columns are NOT used here — those are materialised on a
 * different refund/voided axis and drift from the bridge above.
 *
 * To minimise blast radius the output rows reuse the existing
 * `canonical_pnl.*` measure keys consumed by `PnlBreakdownTable`,
 * `PnlTimeSeriesTable`, `PnlWaterfallChart`, etc. New per-class lines
 * (`canonical_pnl.notes_return_refund_excl_gst` etc.) are surfaced as
 * additional keys.
 */

const TAX_RATE = 0.18

/** Cube-style measure keys we populate from ClickHouse. */
export const PNL_DIRECT_MEASURES = [
  // Revenue bridge (refund-event axis, matching reconcile_daily_pnl_audit.py)
  "canonical_pnl.gross_sales_excl_tax",
  "canonical_pnl.total_discounts_excl_tax",
  "canonical_pnl.notes_return_refund_excl_gst",
  "canonical_pnl.notes_adjustment_refund_excl_gst",
  "canonical_pnl.returns_excl_tax", // = notes_return + notes_adjustment (combined)
  "canonical_pnl.cancelled_revenue", // refund-event axis (notes_cancellation_refund_excl_gst)
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.net_revenue_excl_tax",
  // Costs / ad spend
  "canonical_pnl.product_cost",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.total_operating_cost",
  "canonical_pnl.meta_spend",
  "canonical_pnl.google_spend",
  "canonical_pnl.total_ad_spend",
  // Derived profit (computed from bridge above, NOT from cube columns)
  "canonical_pnl.gross_profit",
  "canonical_pnl.net_profit",
  // Ratios
  "canonical_pnl.gross_margin_pct",
  "canonical_pnl.net_margin_pct",
  "canonical_pnl.mer",
  // Order counts
  "canonical_pnl.orders_created",
  "canonical_pnl.total_orders",
  "canonical_pnl.active_orders",
  "canonical_pnl.cancelled_orders",
] as const

export type PnlDirectMeasure = (typeof PNL_DIRECT_MEASURES)[number]

interface RawDailyRow {
  day: string
  gross_sales: number | null
  discounts: number | null
  returns_excl: number | null
  returns_incl: number | null
  adjustments_excl: number | null
  adjustments_incl: number | null
  cancellations_excl: number | null
  cancellations_incl: number | null
  product_cost: number | null
  shipping_cost: number | null
  packaging_cost: number | null
  gateway_fees: number | null
  rto_cost: number | null
  meta_spend: number | null
  google_spend: number | null
  total_ad_spend: number | null
  orders_created: number | null
  total_orders: number | null
  active_orders: number | null
  cancelled_orders: number | null
}

function num(value: unknown): number {
  if (value == null) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function dailySql(brandId: number, start: string, end: string): string {
  return `
SELECT
  formatDateTime(report_date, '%Y-%m-%d')                      AS day,
  toFloat64(sum(gross_sales_excl_tax))                         AS gross_sales,
  toFloat64(sum(total_discounts_excl_tax))                     AS discounts,
  toFloat64(sum(notes_return_refund_excl_gst))                 AS returns_excl,
  toFloat64(sum(notes_return_refund_incl_gst))                 AS returns_incl,
  toFloat64(sum(notes_adjustment_refund_excl_gst))             AS adjustments_excl,
  toFloat64(sum(notes_adjustment_refund_incl_gst))             AS adjustments_incl,
  toFloat64(sum(notes_cancellation_refund_excl_gst))           AS cancellations_excl,
  toFloat64(sum(notes_cancellation_refund_incl_gst))           AS cancellations_incl,
  toFloat64(sum(product_cost))                                 AS product_cost,
  toFloat64(sum(shipping_cost))                                AS shipping_cost,
  toFloat64(sum(packaging_cost))                               AS packaging_cost,
  toFloat64(sum(payment_gateway_fees))                         AS gateway_fees,
  toFloat64(sum(rto_cost))                                     AS rto_cost,
  toFloat64(sum(meta_spend))                                   AS meta_spend,
  toFloat64(sum(google_spend))                                 AS google_spend,
  toFloat64(sum(total_ad_spend))                               AS total_ad_spend,
  toInt64(sum(orders_created))                                 AS orders_created,
  toInt64(sum(total_orders))                                   AS total_orders,
  toInt64(sum(active_orders))                                  AS active_orders,
  toInt64(sum(cancelled_orders))                               AS cancelled_orders
FROM gold.fct_daily_pnl
WHERE brand_id = ${brandId}
  AND report_date BETWEEN toDate('${start}') AND toDate('${end}')
GROUP BY report_date
ORDER BY report_date ASC
`
}

function totalSql(brandId: number, start: string, end: string): string {
  return `
SELECT
  toFloat64(sum(gross_sales_excl_tax))                         AS gross_sales,
  toFloat64(sum(total_discounts_excl_tax))                     AS discounts,
  toFloat64(sum(notes_return_refund_excl_gst))                 AS returns_excl,
  toFloat64(sum(notes_return_refund_incl_gst))                 AS returns_incl,
  toFloat64(sum(notes_adjustment_refund_excl_gst))             AS adjustments_excl,
  toFloat64(sum(notes_adjustment_refund_incl_gst))             AS adjustments_incl,
  toFloat64(sum(notes_cancellation_refund_excl_gst))           AS cancellations_excl,
  toFloat64(sum(notes_cancellation_refund_incl_gst))           AS cancellations_incl,
  toFloat64(sum(product_cost))                                 AS product_cost,
  toFloat64(sum(shipping_cost))                                AS shipping_cost,
  toFloat64(sum(packaging_cost))                               AS packaging_cost,
  toFloat64(sum(payment_gateway_fees))                         AS gateway_fees,
  toFloat64(sum(rto_cost))                                     AS rto_cost,
  toFloat64(sum(meta_spend))                                   AS meta_spend,
  toFloat64(sum(google_spend))                                 AS google_spend,
  toFloat64(sum(total_ad_spend))                               AS total_ad_spend,
  toInt64(sum(orders_created))                                 AS orders_created,
  toInt64(sum(total_orders))                                   AS total_orders,
  toInt64(sum(active_orders))                                  AS active_orders,
  toInt64(sum(cancelled_orders))                               AS cancelled_orders
FROM gold.fct_daily_pnl
WHERE brand_id = ${brandId}
  AND report_date BETWEEN toDate('${start}') AND toDate('${end}')
`
}

/**
 * Convert a raw aggregate row from ClickHouse to the cube-keyed shape that
 * downstream P&L components consume. Computes the derived bridge values
 * (net sales, gross profit, net profit, margin %) per the canonical formula.
 */
function buildCubeRow(raw: Partial<RawDailyRow>): Record<string, unknown> {
  const grossSales = num(raw.gross_sales)
  const discounts = num(raw.discounts)
  const returnsExcl = num(raw.returns_excl)
  const adjustmentsExcl = num(raw.adjustments_excl)
  const cancellationsExcl = num(raw.cancellations_excl)

  const productCost = num(raw.product_cost)
  const shippingCost = num(raw.shipping_cost)
  const packagingCost = num(raw.packaging_cost)
  const gatewayFees = num(raw.gateway_fees)
  const rtoCost = num(raw.rto_cost)
  const totalOperatingCost = productCost + shippingCost + packagingCost + gatewayFees + rtoCost

  const totalAdSpend = num(raw.total_ad_spend)

  const returnsCombinedExcl = returnsExcl + adjustmentsExcl
  const netSalesExcl = grossSales - discounts - returnsCombinedExcl
  const grossProfit = netSalesExcl - productCost
  const netProfit =
    grossProfit - totalAdSpend - shippingCost - packagingCost - gatewayFees - rtoCost

  const grossMarginPct = netSalesExcl !== 0 ? (grossProfit / netSalesExcl) * 100 : 0
  const netMarginPct = netSalesExcl !== 0 ? (netProfit / netSalesExcl) * 100 : 0
  const mer = totalAdSpend !== 0 ? netSalesExcl / totalAdSpend : 0

  return {
    "canonical_pnl.report_date": raw.day ?? "",
    "canonical_pnl.gross_sales_excl_tax": grossSales,
    "canonical_pnl.total_discounts_excl_tax": discounts,
    "canonical_pnl.notes_return_refund_excl_gst": returnsExcl,
    "canonical_pnl.notes_adjustment_refund_excl_gst": adjustmentsExcl,
    "canonical_pnl.returns_excl_tax": returnsCombinedExcl,
    "canonical_pnl.cancelled_revenue": cancellationsExcl,
    "canonical_pnl.net_sales_excl_tax": netSalesExcl,
    "canonical_pnl.net_revenue_excl_tax": netSalesExcl,
    "canonical_pnl.product_cost": productCost,
    "canonical_pnl.shipping_cost": shippingCost,
    "canonical_pnl.packaging_cost": packagingCost,
    "canonical_pnl.payment_gateway_fees": gatewayFees,
    "canonical_pnl.rto_cost": rtoCost,
    "canonical_pnl.total_operating_cost": totalOperatingCost,
    "canonical_pnl.meta_spend": num(raw.meta_spend),
    "canonical_pnl.google_spend": num(raw.google_spend),
    "canonical_pnl.total_ad_spend": totalAdSpend,
    "canonical_pnl.gross_profit": grossProfit,
    "canonical_pnl.net_profit": netProfit,
    "canonical_pnl.gross_margin_pct": grossMarginPct,
    "canonical_pnl.net_margin_pct": netMarginPct,
    "canonical_pnl.mer": mer,
    "canonical_pnl.orders_created": num(raw.orders_created),
    "canonical_pnl.total_orders": num(raw.total_orders),
    "canonical_pnl.active_orders": num(raw.active_orders),
    "canonical_pnl.cancelled_orders": num(raw.cancelled_orders),
  }
}

export interface PnlDirectFetchResult {
  periodRow: Record<string, unknown>
  priorRow: Record<string, unknown>
  priorLabel: string
  dailyTrend: Record<string, unknown>[]
}

export async function fetchPnlDirectClickHouse(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<PnlDirectFetchResult> {
  const prior = priorDateRange(range)

  const [periodRowsRaw, priorRowsRaw, dailyRowsRaw] = await Promise.all([
    clickHouseQuery<Partial<RawDailyRow>>(totalSql(brand.id, range.start, range.end)),
    clickHouseQuery<Partial<RawDailyRow>>(totalSql(brand.id, prior[0], prior[1])),
    clickHouseQuery<Partial<RawDailyRow>>(dailySql(brand.id, range.start, range.end)),
  ])

  const periodRow = buildCubeRow(periodRowsRaw[0] ?? {})
  const priorRow = buildCubeRow(priorRowsRaw[0] ?? {})
  const dailyTrend = dailyRowsRaw.map((r) => buildCubeRow(r))

  return {
    periodRow,
    priorRow,
    priorLabel: `${prior[0]} → ${prior[1]}`,
    dailyTrend,
  }
}

export { TAX_RATE as PNL_GST_RATE }
