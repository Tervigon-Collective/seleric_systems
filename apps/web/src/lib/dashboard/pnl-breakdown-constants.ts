import { measureFormat } from "@/components/charts/format"

export const PNL_CUBE = "canonical_pnl" as const

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
    subtitle: "Placement axis · gross_sales − discounts − returns = net_sales · cancelled_revenue is audit-only (subset of gross)",
    measures: [
      { key: "canonical_pnl.gross_sales_excl_tax", label: "Gross sales ex GST" },
      { key: "canonical_pnl.cancelled_revenue", label: "Cancelled revenue", audit: true },
      { key: "canonical_pnl.total_discounts_excl_tax", label: "Discounts ex GST", deduction: true },
      { key: "canonical_pnl.returns_excl_tax", label: "Returns ex GST", deduction: true },
      { key: "canonical_pnl.net_sales_excl_tax", label: "Net sales ex GST" },
      { key: "canonical_pnl.net_revenue_excl_tax", label: "Net sales ex GST" },
      { key: "canonical_pnl.gross_revenue", label: "Gross revenue (incl. GST)" },
      { key: "canonical_pnl.total_refund_amount", label: "Refund amount (events)", deduction: true },
      { key: "canonical_pnl.net_revenue", label: "Net sales (cash)" },
      { key: "canonical_pnl.total_tax_collected", label: "Tax collected" },
      { key: "canonical_pnl.shipping_charged_to_customers", label: "Shipping charged" },
      { key: "canonical_pnl.total_sales_incl_tax", label: "Total sales incl. tax" },
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
      { key: "canonical_pnl.contribution_margin", label: "Contribution margin" },
      { key: "canonical_pnl.net_profit", label: "Net profit" },
      { key: "canonical_pnl.gross_margin_pct", label: "Gross margin %", format: "pct" },
      { key: "canonical_pnl.contribution_margin_pct", label: "Contribution margin %", format: "pct" },
      { key: "canonical_pnl.net_margin_pct", label: "Net margin %", format: "pct" },
      { key: "canonical_pnl.mer", label: "MER", format: "ratio" },
      { key: "canonical_pnl.blended_roas", label: "Blended ROAS", format: "ratio" },
    ],
  },
  {
    id: "orders",
    title: "Order volumes",
    subtitle: "Placement vs status-change axes",
    measures: [
      { key: "canonical_pnl.orders_created", label: "Orders created", format: "count" },
      { key: "canonical_pnl.total_orders", label: "Total orders (active + cancelled)", format: "count" },
      { key: "canonical_pnl.active_orders", label: "Active orders", format: "count" },
      { key: "canonical_pnl.cancelled_orders", label: "Cancelled orders", format: "count" },
      { key: "canonical_pnl.refunded_orders", label: "Refunded orders (status axis)", format: "count" },
      { key: "canonical_pnl.voided_orders", label: "Voided orders (status axis)", format: "count" },
      { key: "canonical_pnl.revenue_adjustment_orders", label: "RTO revenue adjustments", format: "count", audit: true },
    ],
  },
  {
    id: "audit",
    title: "Audit & data quality",
    subtitle: "Excluded from net P&L — reconciliation only",
    measures: [
      { key: "canonical_pnl.voided_revenue", label: "Voided revenue", audit: true },
      { key: "canonical_pnl.rto_gross_revenue", label: "RTO gross revenue", audit: true },
      { key: "canonical_pnl.rto_adj_product_cost", label: "RTO adj. product cost", audit: true },
      { key: "canonical_pnl.rto_adj_shipping_cost", label: "RTO adj. shipping", audit: true },
      { key: "canonical_pnl.rto_adj_packaging_cost", label: "RTO adj. packaging", audit: true },
      { key: "canonical_pnl.rto_adj_payment_gateway_fees", label: "RTO adj. gateway fees", audit: true },
      { key: "canonical_pnl.product_cost_coverage_pct", label: "COGS coverage %", format: "pct" },
    ],
  },
]

export const ALL_PNL_MEASURES = PNL_BREAKDOWN_SECTIONS.flatMap((s) => s.measures.map((m) => m.key))

export const WATERFALL_MEASURES = [
  "canonical_pnl.gross_sales_excl_tax",
  "canonical_pnl.total_discounts_excl_tax",
  "canonical_pnl.returns_excl_tax",
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
  "canonical_pnl.returns_excl_tax",
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.net_revenue_excl_tax",
  "canonical_pnl.product_cost",
  "canonical_pnl.gross_profit",
  "canonical_pnl.meta_spend",
  "canonical_pnl.google_spend",
  "canonical_pnl.total_ad_spend",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.total_operating_cost",
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
  { key: "canonical_pnl.returns_excl_tax", label: "− Returns ex GST", kind: "cost", indent: 1, optional: true },
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
  const returns = num("canonical_pnl.returns_excl_tax")
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
    (available.has("canonical_pnl.total_discounts_excl_tax") || available.has("canonical_pnl.returns_excl_tax"))

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
    if (available.has("canonical_pnl.returns_excl_tax")) {
      steps.push({
        name: "Returns",
        value: -Math.abs(returns.value),
        kind: "delta",
        segment: "revenue",
        measureKey: "canonical_pnl.returns_excl_tax",
        unavailable: returns.unavailable,
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
