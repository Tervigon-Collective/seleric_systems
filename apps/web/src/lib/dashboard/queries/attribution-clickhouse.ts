import "server-only"

import { clickHouseQuery } from "@/lib/clickhouse-client"
import { type DashboardBrandFilter } from "../brand-filter"
import { type DashboardDateRange } from "../date-ranges"

// ─── Channel-view types ──────────────────────────────────────────────────────

export interface DirectPlatformStat {
  platform: string
  total_orders: number
  total_revenue: number // gross_sales ex GST from serve.platform_attribution_commerce
}

export interface DirectTrendRow {
  day: string
  platform: string
  orders: number
}

export interface AttributionDirectData {
  totalOrders: number
  metaSpend: number
  googleSpend: number
  platforms: DirectPlatformStat[]
  trend: DirectTrendRow[]
}

// ─── Campaign drill-down types ───────────────────────────────────────────────

/** Order counts per campaign × adset × ad — no SKU join, so orders are not double-counted */
export interface CampaignAdRow {
  platform: string
  campaign_name: string
  adset_name: string
  ad_id: string
  ad_name: string
  orders: number
}

/** Revenue + units breakdown per ad × SKU */
export interface CampaignAdSkuRow {
  platform: string
  ad_id: string
  campaign_name: string
  adset_name: string
  sku: string
  product_title: string
  units: number
  revenue: number // net_price / 1.18 (placed value ex GST)
}

// ─── Channel-view fetch ──────────────────────────────────────────────────────

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

    clickHouseQuery<{ platform: string; total_orders: string; total_revenue: string }>(`
      SELECT
        platform,
        toInt64(count(DISTINCT order_id)) AS total_orders,
        toFloat64(sum(gross_sales))       AS total_revenue
      FROM serve.platform_attribution_commerce
      WHERE brand_id = ${b}
        AND report_date BETWEEN toDate('${s}') AND toDate('${e}')
      GROUP BY platform
      ORDER BY total_orders DESC
    `),

    clickHouseQuery<{ day: string; platform: string; orders: string }>(`
      SELECT
        formatDateTime(report_date, '%Y-%m-%d') AS day,
        platform,
        toInt64(count(DISTINCT order_id))       AS orders
      FROM serve.platform_attribution_commerce
      WHERE brand_id = ${b}
        AND report_date BETWEEN toDate('${s}') AND toDate('${e}')
      GROUP BY report_date, platform
      ORDER BY report_date ASC
    `),

    clickHouseQuery<{ meta_spend: string; google_spend: string }>(`
      SELECT
        (
          SELECT toFloat64(sum(spend))
          FROM gold.fct_meta_ads_daily
          WHERE brand_id = ${b}
            AND report_date BETWEEN toDate('${s}') AND toDate('${e}')
        ) AS meta_spend,
        (
          SELECT toFloat64(sum(spend))
          FROM gold.fct_google_ads_daily
          WHERE brand_id = ${b}
            AND report_date BETWEEN toDate('${s}') AND toDate('${e}')
        ) AS google_spend
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
      total_revenue: Number(r.total_revenue),
    })),
    trend: trendRows.map((r) => ({
      day: r.day,
      platform: r.platform,
      orders: Number(r.orders),
    })),
  }
}

// ─── Campaign drill-down fetches ─────────────────────────────────────────────

function platformClause(channel: string): string {
  if (channel === "all") return ""
  return `AND lt_platform = '${channel}'`
}

export interface CampaignRollupOrders {
  campaign: Map<string, number>
  adset: Map<string, number>
}

export async function fetchCampaignRollupOrders(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: string,
): Promise<CampaignRollupOrders> {
  const b = brand.id
  const s = range.start
  const e = range.end
  const pf = platformClause(channel)

  const [campaignRows, adsetRows] = await Promise.all([
    clickHouseQuery<{ platform: string; campaign_name: string; orders: string }>(`
      SELECT
        coalesce(nullIf(lt_platform, ''), 'other')                   AS platform,
        coalesce(nullIf(lt_campaign_name, ''), 'Unknown Campaign')   AS campaign_name,
        toInt64(COUNT(DISTINCT order_id))                            AS orders
      FROM gold.fct_order_attribution
      WHERE brand_id = ${b}
        AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
        ${pf}
      GROUP BY platform, campaign_name
    `),
    clickHouseQuery<{ platform: string; campaign_name: string; adset_name: string; orders: string }>(`
      SELECT
        coalesce(nullIf(lt_platform, ''), 'other')                   AS platform,
        coalesce(nullIf(lt_campaign_name, ''), 'Unknown Campaign')   AS campaign_name,
        coalesce(nullIf(lt_adset_name, ''), 'Unknown Adset')         AS adset_name,
        toInt64(COUNT(DISTINCT order_id))                            AS orders
      FROM gold.fct_order_attribution
      WHERE brand_id = ${b}
        AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
        ${pf}
      GROUP BY platform, campaign_name, adset_name
    `),
  ])

  const campaign = new Map<string, number>()
  for (const r of campaignRows) {
    campaign.set(`${r.platform}||${r.campaign_name}`, Number(r.orders))
  }
  const adset = new Map<string, number>()
  for (const r of adsetRows) {
    adset.set(`${r.platform}||${r.campaign_name}||${r.adset_name}`, Number(r.orders))
  }
  return { campaign, adset }
}

export async function fetchCampaignAdRows(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: string,
): Promise<CampaignAdRow[]> {
  const b = brand.id
  const s = range.start
  const e = range.end
  const pf = platformClause(channel)

  const rows = await clickHouseQuery<{
    platform: string
    campaign_name: string
    adset_name: string
    ad_id: string
    ad_name: string
    orders: string
  }>(`
    SELECT
      coalesce(nullIf(lt_platform, ''), 'other')                          AS platform,
      coalesce(nullIf(lt_campaign_name, ''), 'Unknown Campaign')          AS campaign_name,
      coalesce(nullIf(lt_adset_name, ''), 'Unknown Adset')               AS adset_name,
      coalesce(lt_ad_id, '')                                              AS ad_id,
      coalesce(nullIf(lt_ad_name, ''), lt_ad_id, 'Unknown Ad')          AS ad_name,
      toInt64(COUNT(DISTINCT order_id))                                   AS orders
    FROM gold.fct_order_attribution
    WHERE brand_id = ${b}
      AND order_date BETWEEN toDate('${s}') AND toDate('${e}')
      ${pf}
    GROUP BY platform, campaign_name, adset_name, ad_id, ad_name
    ORDER BY orders DESC
    LIMIT 2000
  `)

  return rows.map((r) => ({
    platform: r.platform,
    campaign_name: r.campaign_name,
    adset_name: r.adset_name,
    ad_id: r.ad_id,
    ad_name: r.ad_name,
    orders: Number(r.orders),
  }))
}

export async function fetchCampaignAdSkuRows(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: string,
): Promise<CampaignAdSkuRow[]> {
  const b = brand.id
  const s = range.start
  const e = range.end
  const pf = channel === "all" ? "" : `AND a.lt_platform = '${channel}'`

  const rows = await clickHouseQuery<{
    platform: string
    ad_id: string
    campaign_name: string
    adset_name: string
    sku: string
    product_title: string
    units: string
    revenue: string
  }>(`
    SELECT
      coalesce(nullIf(a.lt_platform, ''), 'other')                       AS platform,
      coalesce(a.lt_ad_id, '')                                           AS ad_id,
      coalesce(nullIf(a.lt_campaign_name, ''), 'Unknown Campaign')       AS campaign_name,
      coalesce(nullIf(a.lt_adset_name, ''), 'Unknown Adset')            AS adset_name,
      coalesce(nullIf(i.sku, ''), 'Unknown SKU')                        AS sku,
      coalesce(nullIf(i.product_title, ''), 'Unknown Product')          AS product_title,
      toInt64(SUM(i.quantity))                                           AS units,
      toFloat64(SUM(i.net_price)) / 1.18                                AS revenue
    FROM gold.fct_order_attribution a
    JOIN gold.fct_order_items i
      ON a.order_id = i.order_id AND a.brand_id = i.brand_id
    WHERE a.brand_id = ${b}
      AND a.order_date BETWEEN toDate('${s}') AND toDate('${e}')
      ${pf}
    GROUP BY platform, ad_id, campaign_name, adset_name, sku, product_title
    ORDER BY revenue DESC
    LIMIT 5000
  `)

  return rows.map((r) => ({
    platform: r.platform,
    ad_id: r.ad_id,
    campaign_name: r.campaign_name,
    adset_name: r.adset_name,
    sku: r.sku,
    product_title: r.product_title,
    units: Number(r.units),
    revenue: Number(r.revenue),
  }))
}
