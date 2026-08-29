/** Cost components from canonical_pnl (int_finance_daily_rollups (via daily_pnl)). */
export const COGS_BREAKDOWN_MEASURES = [
  "canonical_pnl.product_cost",
  "canonical_pnl.shipping_cost",
  "canonical_pnl.packaging_cost",
  "canonical_pnl.payment_gateway_fees",
  "canonical_pnl.rto_cost",
  "canonical_pnl.total_operating_cost",
] as const

export const COGS_BREAKDOWN_LABELS: Record<(typeof COGS_BREAKDOWN_MEASURES)[number], string> = {
  "canonical_pnl.product_cost": "Product",
  "canonical_pnl.shipping_cost": "Shipping",
  "canonical_pnl.packaging_cost": "Packaging",
  "canonical_pnl.payment_gateway_fees": "Gateway fees",
  "canonical_pnl.rto_cost": "RTO logistics",
  "canonical_pnl.total_operating_cost": "Total operating cost",
}

export interface CogsBreakdown {
  productCost: number
  shippingCost: number
  packagingCost: number
  gatewayFees: number
  rtoCost: number
  totalOperatingCost: number
}

export function cogsBreakdownFromRow(row: Record<string, unknown>): CogsBreakdown {
  const productCost = Number(row["canonical_pnl.product_cost"] ?? 0)
  const shippingCost = Number(row["canonical_pnl.shipping_cost"] ?? 0)
  const packagingCost = Number(row["canonical_pnl.packaging_cost"] ?? 0)
  const gatewayFees = Number(row["canonical_pnl.payment_gateway_fees"] ?? 0)
  const rtoCost = Number(row["canonical_pnl.rto_cost"] ?? 0)
  const totalOperatingCost =
    Number(row["canonical_pnl.total_operating_cost"] ?? 0) ||
    productCost + shippingCost + packagingCost + gatewayFees + rtoCost

  return { productCost, shippingCost, packagingCost, gatewayFees, rtoCost, totalOperatingCost }
}

export const COGS_BREAKDOWN_LINES: {
  label: string
  key: keyof Omit<CogsBreakdown, "totalOperatingCost">
}[] = [
  { label: "Product", key: "productCost" },
  { label: "Shipping", key: "shippingCost" },
  { label: "Packaging", key: "packagingCost" },
  { label: "Gateway fees", key: "gatewayFees" },
  { label: "RTO logistics", key: "rtoCost" },
]
