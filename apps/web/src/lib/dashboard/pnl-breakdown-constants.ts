import { measureFormat } from "@/components/charts/format"

export const PNL_CUBE = "canonical_pnl" as const

/**
 * Indian GST rate applied to taxable revenue lines. Used to derive the
 * incl-GST column on the P&L breakdown from cube-exposed excl-GST measures
 * (gross sales, discounts, returns+adjustments, net sales, cancelled audit).
 * Mirrors the canonical "gross_sales_excl_tax × 1.18" bridge used in
 * scripts/_run_pnl_audit.py (May 2026 monthly query).
 */
export const GST_RATE = 0.18

export type PnlMeasureFormat = "currency" | "count" | "pct" | "ratio"

export interface PnlMeasureDef {
  key: string
  label: string
  description?: string
  format?: PnlMeasureFormat
  deduction?: boolean
  audit?: boolean
}

export interface PnlBreakdownSection {
  id: string
  title: string
  subtitle?: string
  measures: PnlMeasureDef[]
}

export const PNL_BREAKDOWN_SECTIONS: PnlBreakdownSection[] = [
  {
    id: "revenue",
    title: "Net sales — Shopify breakdown",
    subtitle:
      "Refund-event axis · gross_sales − discounts − returns − adjustments = net_sales · cancellations are audit-only (subset of gross) · Incl-GST = excl × 1.18 for taxable lines, actual notes_*_incl_gst for refund lines",
    measures: [
      { key: "canonical_pnl.gross_sales_excl_tax", label: "Gross sales ex GST" },
      {
        key: "canonical_pnl.cancelled_revenue",
        label: "Cancelled revenue (audit)",
        description: "notes_cancellation_refund_excl_gst · refund-event axis · subset of gross, not subtracted from net sales",
        audit: true,
      },
      { key: "canonical_pnl.total_discounts_excl_tax", label: "Discounts ex GST", deduction: true },
      {
        key: "canonical_pnl.notes_return_refund_excl_gst",
        label: "Returns ex GST",
        description: "notes_return_refund_excl_gst · pnl_refund_class = RETURN",
        deduction: true,
      },
      {
        key: "canonical_pnl.notes_adjustment_refund_excl_gst",
        label: "Adjustments ex GST",
        description: "notes_adjustment_refund_excl_gst · pnl_refund_class = ADJUSTMENT",
        deduction: true,
      },
      { key: "canonical_pnl.net_sales_excl_tax", label: "Net sales ex GST" },
    ],
  },
  {
    id: "costs",
    title: "Operating costs",
    subtitle: "Placement − refund reversals · revenue_eligible lines",
    measures: [
      { key: "canonical_pnl.product_cost", label: "Product COGS", deduction: true },
      { key: "canonical_pnl.shipping_cost", label: "Shipping cost", deduction: true },
      { key: "canonical_pnl.packaging_cost", label: "Packaging cost", deduction: true },
      { key: "canonical_pnl.payment_gateway_fees", label: "Payment gateway fees", deduction: true },
      { key: "canonical_pnl.rto_cost", label: "RTO logistics", deduction: true },
      { key: "canonical_pnl.total_operating_cost", label: "Total operating cost", deduction: true },
    ],
  },
  {
    id: "ad_spend",
    title: "Ad spend",
    measures: [
      { key: "canonical_pnl.meta_spend", label: "Meta spend", deduction: true },
      { key: "canonical_pnl.google_spend", label: "Google spend", deduction: true },
      { key: "canonical_pnl.total_ad_spend", label: "Total ad spend", deduction: true },
    ],
  },
  {
    id: "profit",
    title: "Profit & efficiency",
    measures: [
      { key: "canonical_pnl.gross_profit", label: "Gross profit" },
      { key: "canonical_pnl.net_profit", label: "Net profit" },
      { key: "canonical_pnl.gross_margin_pct", label: "Gross margin %", format: "pct" },
      { key: "canonical_pnl.net_margin_pct", label: "Net margin %", format: "pct" },
      { key: "canonical_pnl.mer", label: "MER", format: "ratio" },
    ],
  },
  {
    id: "orders",
    title: "Order volumes",
    measures: [
      { key: "canonical_pnl.orders_created", label: "Orders created", format: "count" },
      { key: "canonical_pnl.total_orders", label: "Total orders (active + cancelled)", format: "count" },
      { key: "canonical_pnl.active_orders", label: "Active orders", format: "count" },
      { key: "canonical_pnl.cancelled_orders", label: "Cancelled orders", format: "count" },
    ],
  },
]

export const ALL_PNL_MEASURES = PNL_BREAKDOWN_SECTIONS.flatMap((s) => s.measures.map((m) => m.key))

export const WATERFALL_MEASURES = [
  "canonical_pnl.gross_sales_excl_tax",
  "canonical_pnl.total_discounts_excl_tax",
  "canonical_pnl.notes_return_refund_excl_gst",
  "canonical_pnl.notes_adjustment_refund_excl_gst",
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.product_cost",
  "canonical_pnl.gross_profit",
  "canonical_pnl.total_ad_spend",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.net_profit",
] as const

export const TREND_MEASURES = [
  "canonical_pnl.gross_sales_excl_tax",
  "canonical_pnl.cancelled_revenue",
  "canonical_pnl.total_discounts_excl_tax",
  "canonical_pnl.notes_return_refund_excl_gst",
  "canonical_pnl.notes_adjustment_refund_excl_gst",
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.product_cost",
  "canonical_pnl.gross_profit",
  "canonical_pnl.meta_spend",
  "canonical_pnl.google_spend",
  "canonical_pnl.total_ad_spend",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.net_profit",
] as const

export type TimeSeriesRowKind = "revenue" | "cost" | "subtotal" | "total"

export interface TimeSeriesRowDef {
  key: string
  label: string
  kind: TimeSeriesRowKind
  indent?: number
  optional?: boolean
  altKeys?: string[]
  /** Hide when any of these keys have data (show granular rows instead). */
  hideWhenPresent?: string[]
}

/** P&L time-series table — mirrors waterfall order (revenue bridge → COGS → ad → ops → net). */
export const TIME_SERIES_TABLE_ROWS: TimeSeriesRowDef[] = [
  { key: "canonical_pnl.gross_sales_excl_tax", label: "Gross sales ex GST", kind: "revenue", optional: true },
  {
    key: "canonical_pnl.cancelled_revenue",
    label: "Cancelled revenue (audit)",
    kind: "revenue",
    indent: 1,
    optional: true,
  },
  {
    key: "canonical_pnl.total_discounts_excl_tax",
    label: "− Discounts ex GST",
    kind: "cost",
    indent: 1,
    optional: true,
  },
  {
    key: "canonical_pnl.notes_return_refund_excl_gst",
    label: "− Returns ex GST",
    kind: "cost",
    indent: 1,
    optional: true,
  },
  {
    key: "canonical_pnl.notes_adjustment_refund_excl_gst",
    label: "− Adjustments ex GST",
    kind: "cost",
    indent: 1,
    optional: true,
  },
  {
    key: "canonical_pnl.net_sales_excl_tax",
    label: "= Net sales ex GST",
    kind: "subtotal",
    altKeys: ["canonical_pnl.net_revenue_excl_tax"],
  },
  { key: "canonical_pnl.product_cost", label: "− Product COGS", kind: "cost", indent: 1, optional: true },
  { key: "canonical_pnl.gross_profit", label: "= Gross profit", kind: "subtotal" },
  { key: "canonical_pnl.meta_spend", label: "− Meta ad spend", kind: "cost", indent: 1, optional: true },
  { key: "canonical_pnl.google_spend", label: "− Google ad spend", kind: "cost", indent: 1, optional: true },
  { key: "canonical_pnl.total_ad_spend", label: "− Total ad spend", kind: "cost" },
  { key: "canonical_pnl.shipping_cost", label: "− Shipping cost", kind: "cost", indent: 1, optional: true },
  { key: "canonical_pnl.packaging_cost", label: "− Packaging cost", kind: "cost", indent: 1, optional: true },
  {
    key: "canonical_pnl.payment_gateway_fees",
    label: "− Gateway fees",
    kind: "cost",
    indent: 1,
    optional: true,
  },
  { key: "canonical_pnl.rto_cost", label: "− RTO logistics", kind: "cost", indent: 1, optional: true },
  {
    key: "canonical_pnl.total_operating_cost",
    label: "− Total ops cost",
    kind: "cost",
    optional: true,
    hideWhenPresent: [
      "canonical_pnl.product_cost",
      "canonical_pnl.shipping_cost",
      "canonical_pnl.packaging_cost",
      "canonical_pnl.payment_gateway_fees",
      "canonical_pnl.rto_cost",
    ],
  },
  { key: "canonical_pnl.net_profit", label: "= Net profit", kind: "total" },
]

export function resolveTimeSeriesRowKey(
  def: TimeSeriesRowDef,
  availableKeys: Set<string>
): string | null {
  if (availableKeys.has(def.key)) return def.key
  for (const alt of def.altKeys ?? []) {
    if (availableKeys.has(alt)) return alt
  }
  return def.optional ? null : def.key
}

export function visibleTimeSeriesRows(
  rows: Record<string, unknown>[],
  defs: TimeSeriesRowDef[] = TIME_SERIES_TABLE_ROWS
): Array<TimeSeriesRowDef & { resolvedKey: string }> {
  const availableKeys = new Set<string>()
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (value != null && value !== "" && isFinite(Number(value))) {
        availableKeys.add(key)
      }
    }
  }

  const hasRevenueBridge = availableKeys.has("canonical_pnl.gross_sales_excl_tax")

  return defs.flatMap((def) => {
    if (
      def.key === "canonical_pnl.net_sales_excl_tax" &&
      hasRevenueBridge &&
      !availableKeys.has("canonical_pnl.net_sales_excl_tax") &&
      !availableKeys.has("canonical_pnl.net_revenue_excl_tax")
    ) {
      return []
    }

    if (!hasRevenueBridge && def.optional && def.key !== "canonical_pnl.net_sales_excl_tax") {
      const revenueBridgeKeys = new Set([
        "canonical_pnl.gross_sales_excl_tax",
        "canonical_pnl.total_discounts_excl_tax",
        "canonical_pnl.returns_excl_tax",
      ])
      if (revenueBridgeKeys.has(def.key)) return []
    }

    const resolvedKey = resolveTimeSeriesRowKey(def, availableKeys)
    if (!resolvedKey) return []

    if (def.hideWhenPresent?.some((k) => availableKeys.has(k))) return []

    return [{ ...def, resolvedKey }]
  })
}

export interface PnlSchemaStatus {
  cubeExists: boolean
  available: string[]
  missing: string[]
  measureDefs: PnlMeasureDef[]
}

export interface WaterfallStep {
  name: string
  value: number
  kind: "start" | "delta" | "subtotal" | "total"
  segment?: "cogs" | "revenue"
  measureKey?: string
  unavailable?: boolean
}

export function measureDefFormat(def: PnlMeasureDef): PnlMeasureFormat {
  if (def.format) return def.format
  return measureFormat(def.key) as PnlMeasureFormat
}

export function rowValue(row: Record<string, unknown>, key: string): number | null {
  const v = row[key]
  if (v == null || v === "") return null
  const n = Number(v)
  return isFinite(n) ? n : null
}

export function fullPnlWaterfallSteps(
  row: Record<string, unknown>,
  available: Set<string>
): WaterfallStep[] {
  const num = (key: string, fallback = 0) => {
    if (!available.has(key)) return { value: fallback, unavailable: true }
    const v = rowValue(row, key)
    return { value: v ?? fallback, unavailable: v == null }
  }

  const grossSales = num("canonical_pnl.gross_sales_excl_tax")
  const discounts = num("canonical_pnl.total_discounts_excl_tax")
  const returnsOnly = num("canonical_pnl.notes_return_refund_excl_gst")
  const adjustmentsOnly = num("canonical_pnl.notes_adjustment_refund_excl_gst")
  const netSales = num("canonical_pnl.net_sales_excl_tax")
  const productCost = num("canonical_pnl.product_cost")
  const grossProfit = num("canonical_pnl.gross_profit")
  const adSpend = num("canonical_pnl.total_ad_spend")
  const shipping = num("canonical_pnl.shipping_cost")
  const packaging = num("canonical_pnl.packaging_cost")
  const gateway = num("canonical_pnl.payment_gateway_fees")
  const rto = num("canonical_pnl.rto_cost")
  const netProfit = num("canonical_pnl.net_profit")

  const steps: WaterfallStep[] = []

  const hasRevenueBridge =
    available.has("canonical_pnl.gross_sales_excl_tax") &&
    (available.has("canonical_pnl.total_discounts_excl_tax") ||
      available.has("canonical_pnl.notes_return_refund_excl_gst") ||
      available.has("canonical_pnl.notes_adjustment_refund_excl_gst"))

  if (hasRevenueBridge) {
    steps.push({
      name: "Gross sales ex GST",
      value: grossSales.value,
      kind: "start",
      segment: "revenue",
      measureKey: "canonical_pnl.gross_sales_excl_tax",
      unavailable: grossSales.unavailable,
    })
    if (available.has("canonical_pnl.total_discounts_excl_tax")) {
      steps.push({
        name: "Discounts",
        value: -Math.abs(discounts.value),
        kind: "delta",
        segment: "revenue",
        measureKey: "canonical_pnl.total_discounts_excl_tax",
        unavailable: discounts.unavailable,
      })
    }
    if (available.has("canonical_pnl.notes_return_refund_excl_gst")) {
      steps.push({
        name: "Returns",
        value: -Math.abs(returnsOnly.value),
        kind: "delta",
        segment: "revenue",
        measureKey: "canonical_pnl.notes_return_refund_excl_gst",
        unavailable: returnsOnly.unavailable,
      })
    }
    if (available.has("canonical_pnl.notes_adjustment_refund_excl_gst")) {
      steps.push({
        name: "Adjustments",
        value: -Math.abs(adjustmentsOnly.value),
        kind: "delta",
        segment: "revenue",
        measureKey: "canonical_pnl.notes_adjustment_refund_excl_gst",
        unavailable: adjustmentsOnly.unavailable,
      })
    }
    steps.push({
      name: "Net sales ex GST",
      value: netSales.value,
      kind: "subtotal",
      segment: "revenue",
      measureKey: "canonical_pnl.net_sales_excl_tax",
      unavailable: netSales.unavailable,
    })
  } else {
    const fallbackSales = num("canonical_pnl.net_revenue_excl_tax")
    steps.push({
      name: "Net sales ex GST",
      value: fallbackSales.value,
      kind: "start",
      segment: "revenue",
      measureKey: "canonical_pnl.net_revenue_excl_tax",
      unavailable: fallbackSales.unavailable,
    })
  }

  steps.push({
    name: "Product COGS",
    value: -Math.abs(productCost.value),
    kind: "delta",
    segment: "cogs",
    measureKey: "canonical_pnl.product_cost",
    unavailable: productCost.unavailable,
  })
  steps.push({
    name: "Gross profit",
    value: grossProfit.value,
    kind: "subtotal",
    measureKey: "canonical_pnl.gross_profit",
    unavailable: grossProfit.unavailable,
  })
  steps.push({
    name: "Ad spend",
    value: -Math.abs(adSpend.value),
    kind: "delta",
    measureKey: "canonical_pnl.total_ad_spend",
    unavailable: adSpend.unavailable,
  })

  for (const [name, data, key] of [
    ["Shipping", shipping, "canonical_pnl.shipping_cost"],
    ["Packaging", packaging, "canonical_pnl.packaging_cost"],
    ["Gateway fees", gateway, "canonical_pnl.payment_gateway_fees"],
    ["RTO logistics", rto, "canonical_pnl.rto_cost"],
  ] as const) {
    if (available.has(key)) {
      steps.push({
        name,
        value: -Math.abs(data.value),
        kind: "delta",
        segment: "cogs",
        measureKey: key,
        unavailable: data.unavailable,
      })
    }
  }

  steps.push({
    name: "Net profit",
    value: netProfit.value,
    kind: "total",
    measureKey: "canonical_pnl.net_profit",
    unavailable: netProfit.unavailable,
  })

  return steps
}

/**
 * Excl-GST taxable revenue lines. Incl-GST value = excl × (1 + GST_RATE).
 * Mirrors the canonical monthly P&L bridge:
 *   gross_sales × 1.18 − discounts × 1.18 − returns × 1.18 − adjustments × 1.18
 *     = net_sales × 1.18
 *
 * Notes refund columns (notes_*_refund_excl_gst) also fall here because their
 * incl-GST counterpart equals excl × 1.18 (verified against actual
 * notes_*_refund_incl_gst columns in scripts/reconcile_daily_pnl_audit.py).
 */
const TAXABLE_REVENUE_MEASURES = new Set<string>([
  "canonical_pnl.gross_sales_excl_tax",
  "canonical_pnl.total_discounts_excl_tax",
  "canonical_pnl.returns_excl_tax",
  "canonical_pnl.notes_return_refund_excl_gst",
  "canonical_pnl.notes_adjustment_refund_excl_gst",
  "canonical_pnl.cancelled_revenue",
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.net_revenue_excl_tax",
])

/**
 * Costs and ad spend: no GST is charged to customers / no GST credit is
 * recoverable, so the incl-GST column shows the same value as the excl-GST
 * column. Matches the canonical monthly P&L bridge where product COGS /
 * shipping / packaging / gateway / RTO / ad spend are identical in both
 * columns.
 */
const COST_AND_SPEND_MEASURES = new Set<string>([
  "canonical_pnl.product_cost",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.total_operating_cost",
  "canonical_pnl.meta_spend",
  "canonical_pnl.google_spend",
  "canonical_pnl.total_ad_spend",
])

/**
 * Profit / margin measures whose incl-GST value differs from excl by exactly
 * net_sales_excl × GST_RATE (because COGS / ad / ops are unchanged, but
 * net_sales gets the 1.18 multiplier).
 */
const PROFIT_DELTA_MEASURES = new Set<string>([
  "canonical_pnl.gross_profit",
  "canonical_pnl.net_profit",
])

function rowNetSalesExcl(row: Record<string, unknown>): number | null {
  return (
    rowValue(row, "canonical_pnl.net_sales_excl_tax") ??
    rowValue(row, "canonical_pnl.net_revenue_excl_tax")
  )
}

/**
 * Incl-GST value for a P&L measure on a row. Returns `null` if the measure
 * has no meaningful incl-GST counterpart (percentages, ratios, counts) or if
 * the underlying excl value is missing.
 *
 * Tax bridge used (same as scripts/reconcile_daily_pnl_audit.py May query):
 *   - Taxable revenue lines: excl × 1.18
 *   - Costs / ad spend: same as excl (no GST)
 *   - Derived profit (gross_profit / net_profit):
 *       excl + net_sales_excl × 0.18
 *   - Everything else (%, ratio, count): null
 */
export function inclGstValue(
  row: Record<string, unknown>,
  measureKey: string,
): number | null {
  if (TAXABLE_REVENUE_MEASURES.has(measureKey)) {
    const v = rowValue(row, measureKey)
    return v == null ? null : v * (1 + GST_RATE)
  }
  if (COST_AND_SPEND_MEASURES.has(measureKey)) return rowValue(row, measureKey)
  if (PROFIT_DELTA_MEASURES.has(measureKey)) {
    const v = rowValue(row, measureKey)
    if (v == null) return null
    const ns = rowNetSalesExcl(row)
    return ns == null ? v : v + ns * GST_RATE
  }
  return null
}
