import "server-only"

import { clickHouseQuery } from "@/lib/clickhouse-client"
import { type DashboardBrandFilter } from "../brand-filter"
import { type DashboardDateRange } from "../date-ranges"

export interface DirectPlatformStat {
  platform: string
  total_orders: number   // all statuses (ground truth)
  active_orders: number  // order_status = 'active' (paid / delivered)
  cod_orders: number     // order_status = 'payment_pending' (COD undelivered)
  active_revenue: number // SUM(net_revenue_excl_tax) for active only
}

export interface DirectTrendRow {
  day: string
  platform: string
  orders: number   // total orders created that day (all statuses)
  revenue: number  // active orders revenue that day
}

export interface AttributionDirectData {
  totalOrders: number            // COUNT(*) from fct_orders — ground truth
  metaSpend: number              // SUM(meta_spend) from fct_daily_pnl
  googleSpend: number            // SUM(google_spend) from fct_daily_pnl
  platforms: DirectPlatformStat[]
  trend: DirectTrendRow[]
}

export async function fetchAttributionDirect(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<AttributionDirectData> {
  const b = brand.id
  const s = range.start
  const e = range.end

  const [totalRows, platformRows, trendRows, spendRows] = await Promise.all([
    clickHouseQuery<{ total_orders: string }>(`
      SELECT toInt64(COUNT(*)) AS total_orders
      FROM gold.fct_orders
      WHERE brand_id = ${b}
        AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
    `),

    clickHouseQuery<{
      platform: string
      total_orders: string
      active_orders: string
      cod_orders: string
      active_revenue: string
    }>(`
      SELECT
        coalesce(nullIf(lt_platform, ''), 'other')                                      AS platform,
        toInt64(COUNT(DISTINCT order_id))                                               AS total_orders,
        toInt64(countDistinctIf(order_id, order_status = 'active'))                    AS active_orders,
        toInt64(countDistinctIf(order_id, order_status = 'payment_pending'))           AS cod_orders,
        toFloat64(sumIf(net_revenue_excl_tax, order_status = 'active'))                AS active_revenue
      FROM gold.fct_order_attribution
      WHERE brand_id = ${b}
        AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
      GROUP BY platform
      ORDER BY total_orders DESC
    `),

    clickHouseQuery<{ day: string; platform: string; orders: string; revenue: string }>(`
      SELECT
        formatDateTime(order_date, '%Y-%m-%d')                                         AS day,
        coalesce(nullIf(lt_platform, ''), 'other')                                     AS platform,
        toInt64(COUNT(DISTINCT order_id))                                               AS orders,
        toFloat64(sumIf(net_revenue_excl_tax, order_status = 'active'))                AS revenue
      FROM gold.fct_order_attribution
      WHERE brand_id = ${b}
        AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
      GROUP BY order_date, platform
      ORDER BY order_date ASC
    `),

    clickHouseQuery<{ meta_spend: string; google_spend: string }>(`
      SELECT
        toFloat64(sum(meta_spend))   AS meta_spend,
        toFloat64(sum(google_spend)) AS google_spend
      FROM gold.fct_daily_pnl
      WHERE brand_id = ${b}
        AND report_date BETWEEN toDate('${s}') AND toDate('${e}')
    `),
  ])

  const totalOrders = Number(totalRows[0]?.total_orders ?? 0)
  const spendRow = spendRows[0] ?? { meta_spend: "0", google_spend: "0" }

  return {
    totalOrders,
    metaSpend: Number(spendRow.meta_spend ?? 0),
    googleSpend: Number(spendRow.google_spend ?? 0),
    platforms: platformRows.map((r) => ({
      platform: r.platform,
      total_orders: Number(r.total_orders),
      active_orders: Number(r.active_orders),
      cod_orders: Number(r.cod_orders),
      active_revenue: Number(r.active_revenue),
    })),
    trend: trendRows.map((r) => ({
      day: r.day,
      platform: r.platform,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    })),
  }
}
