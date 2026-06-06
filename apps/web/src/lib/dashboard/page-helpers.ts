import { wideRowToSlices } from "./transforms"
import { cogsBreakdownFromRow } from "./cogs-breakdown"
import { CHANNEL_NET_PROFIT_RECON_MEASURE } from "./channel-net-profit"

export const CHANNEL_REVENUE_SLICES = [
  { label: "Meta", measure: "channel_pnl.meta_attributed_revenue_ex_gst" },
  { label: "Google", measure: "channel_pnl.google_attributed_revenue_ex_gst" },
  { label: "Organic", measure: "channel_pnl.organic_attributed_revenue_ex_gst" },
] as const

export const CHANNEL_NET_PROFIT_SERIES = [
  { label: "Meta", measure: "channel_pnl.meta_net_profit" },
  { label: "Google", measure: "channel_pnl.google_net_profit" },
  { label: "Organic", measure: "channel_pnl.organic_net_profit" },
  { label: "Unattributed & ops", measure: CHANNEL_NET_PROFIT_RECON_MEASURE },
] as const

/** Meta ad funnel — link_clicks after impressions. */
export const FUNNEL_STEPS = [
  { label: "Impressions", measure: "marketing_performance.impressions" },
  { label: "Link clicks", measure: "marketing_performance.link_clicks" },
  { label: "Landing page views", measure: "marketing_performance.landing_page_views" },
  { label: "Add to carts", measure: "marketing_performance.add_to_carts" },
  { label: "Initiated checkouts", measure: "marketing_performance.initiated_checkouts" },
  { label: "Purchases", measure: "marketing_performance.purchases" },
] as const

export const RETURN_CANCEL_SERIES = [
  { label: "Returned", measure: "product_performance.returned_units" },
  { label: "Cancelled", measure: "product_performance.cancelled_units" },
] as const

export function channelRevenueSlices(row: Record<string, unknown>) {
  return wideRowToSlices(row, [...CHANNEL_REVENUE_SLICES])
}

export function funnelFromAggregate(row: Record<string, unknown>) {
  return FUNNEL_STEPS.map(({ label, measure }) => ({
    name: label,
    value: Number(row[measure] ?? 0),
  }))
}

/** P&L waterfall from period-aggregate canonical_pnl row with COGS / ops cost breakdown. */
export function pnlWaterfallSteps(row: Record<string, unknown>) {
  const sales = Number(
    row["canonical_pnl.net_revenue_excl_tax"] ?? row["daily_pnl.total_sales_ex_gst"] ?? 0
  )
  const gross = Number(row["canonical_pnl.gross_profit"] ?? row["daily_pnl.gross_profit"] ?? 0)
  const spend = Number(row["canonical_pnl.total_ad_spend"] ?? row["daily_pnl.total_ad_spend"] ?? 0)
  const net = Number(row["canonical_pnl.net_profit"] ?? row["daily_pnl.net_profit"] ?? 0)
  const costs = cogsBreakdownFromRow(row)

  return [
    { name: "Net sales ex GST", value: sales, kind: "start" as const },
    { name: "Product COGS", value: -costs.productCost, kind: "delta" as const, segment: "cogs" as const },
    { name: "Gross profit", value: gross, kind: "subtotal" as const },
    { name: "Ad spend", value: -spend, kind: "delta" as const },
    { name: "Shipping", value: -costs.shippingCost, kind: "delta" as const, segment: "cogs" as const },
    { name: "Packaging", value: -costs.packagingCost, kind: "delta" as const, segment: "cogs" as const },
    { name: "Gateway fees", value: -costs.gatewayFees, kind: "delta" as const, segment: "cogs" as const },
    { name: "RTO logistics", value: -costs.rtoCost, kind: "delta" as const, segment: "cogs" as const },
    { name: "Net profit", value: net, kind: "total" as const },
  ]
}

export function geoLabel(row: Record<string, unknown>) {
  const country = String(row["shopify_orders.ship_country"] ?? "")
  const province = String(row["shopify_orders.ship_province"] ?? "")
  if (country && province) return `${country} · ${province}`
  return country || province || "Unknown"
}

export function utmLabel(row: Record<string, unknown>) {
  const src = String(row["shopify_orders.utm_source"] ?? "direct")
  const med = String(row["shopify_orders.utm_medium"] ?? "")
  return med ? `${src} / ${med}` : src
}

export function skuLabel(row: Record<string, unknown>) {
  const sku = String(row["product_performance.sku"] ?? "")
  const title = String(row["product_performance.product_title"] ?? "")
  return title ? `${sku} · ${title}` : sku
}
