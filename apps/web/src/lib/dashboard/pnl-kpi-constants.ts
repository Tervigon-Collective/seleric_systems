/** Canonical KPI measures — chart view daily_pnl (gold.fct_daily_pnl).
 *
 * Orders measure note: `daily_pnl.orders_created` = every Shopify "Created at"
 * placement (active + payment_pending + cancelled + refunded + voided + RTO
 * draft). This is the universe the brand actually processed and the correct
 * denominator for blended CAC, AOV-from-placements, and the headline "Orders"
 * KPI. Do NOT swap back to `total_orders` (active + cancelled only) — that
 * silently drops payment_pending (COD), refunded and voided rows, which for
 * COD-heavy brands can hide ~40-50% of demand.
 */

export const PNL_KPI_MEASURES = [

  "daily_pnl.net_profit",

  "daily_pnl.gross_profit",

  "daily_pnl.total_sales_ex_gst",

  "daily_pnl.total_cogs",

  "daily_pnl.total_ad_spend",

  "daily_pnl.orders_created",

  "daily_pnl.gross_margin_pct",

] as const



export const PNL_KPI_LABELS: Record<(typeof PNL_KPI_MEASURES)[number], string> = {

  "daily_pnl.net_profit": "Net profit",

  "daily_pnl.gross_profit": "Gross profit",

  "daily_pnl.total_sales_ex_gst": "Net sales ex GST",

  "daily_pnl.total_cogs": "COGS",

  "daily_pnl.total_ad_spend": "Ad spend",

  "daily_pnl.orders_created": "Orders (placed)",

  "daily_pnl.gross_margin_pct": "Gross margin %",

}

