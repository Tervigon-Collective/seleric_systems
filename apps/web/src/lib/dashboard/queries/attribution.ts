import "server-only"

import { type DashboardBrandFilter } from "../brand-filter"
import { runCubeQuery, safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { type DashboardDateRange } from "../date-ranges"
import { q, td } from "../query-helpers"
import { type CubeRow } from "@/lib/chat/cube-rows"

export type AttributionChannel = "all" | "meta" | "google" | "organic"

export interface AttributionChannelData {
  channelTotals: CubeRow[]
  channelTrend: CubeRow[]
}

export interface AttributionCampaignData {
  metaAttrib: CubeRow[]
  metaDelivery: CubeRow[]
  googleDelivery: CubeRow[]
  orderTrace: CubeRow[]
}

export interface AttributionAdData {
  warehouseAds: CubeRow[]
  adDelivery: CubeRow[]
}

export interface AttributionSkuData {
  skuRows: CubeRow[]
}

export interface AttributionOrdersData {
  orderRows: CubeRow[]
}

function platformFilter(channel: AttributionChannel) {
  if (channel === "all") return []
  return [{ member: "order_attribution.lt_platform", operator: "equals", values: [channel] }]
}

export async function fetchAttributionChannel(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<AttributionChannelData> {
  return runDashboardCubeFetch(async () => {
    const [channelTotals, channelTrend] = await Promise.all([
      safeCubeQuery(
        q("channel_pnl", brand, {
          dimensions: ["channel_pnl.platform"],
          measures: [
            "channel_pnl.meta_ad_spend",
            "channel_pnl.google_ad_spend",
            "channel_pnl.meta_attributed_revenue_ex_gst",
            "channel_pnl.google_attributed_revenue_ex_gst",
            "channel_pnl.organic_attributed_revenue_ex_gst",
            "channel_pnl.meta_attributed_orders",
            "channel_pnl.google_attributed_orders",
            "channel_pnl.organic_attributed_orders",
            "channel_pnl.meta_roas",
            "channel_pnl.google_roas",
            "channel_pnl.meta_net_profit",
            "channel_pnl.google_net_profit",
            "channel_pnl.organic_net_profit",
          ],
          timeDimensions: [td("channel_pnl.date_start", range)],
        }),
        "channelTotals"
      ),
      safeCubeQuery(
        q("order_attribution", brand, {
          dimensions: ["order_attribution.lt_platform"],
          measures: [
            "order_attribution.attributed_net_revenue_ex_gst",
            "order_attribution.attributed_orders",
            "order_attribution.placed_orders",
          ],
          timeDimensions: [td("order_attribution.order_date", range, "day")],
          order: { "order_attribution.order_date": "asc" },
        }),
        "channelTrend"
      ),
    ])
    return { channelTotals, channelTrend }
  })
}

export async function fetchAttributionCampaigns(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: AttributionChannel
): Promise<AttributionCampaignData> {
  return runDashboardCubeFetch(async () => {
    const [metaAttrib, metaDelivery, googleDelivery, orderTrace] = await Promise.all([
      safeCubeQuery(
        q("dw_meta_ads_attribution", brand, {
          dimensions: ["dw_meta_ads_attribution.campaign_name"],
          measures: [
            "dw_meta_ads_attribution.attributed_revenue",
            "dw_meta_ads_attribution.attributed_orders",
            "dw_meta_ads_attribution.ad_spend",
            "dw_meta_ads_attribution.roas",
          ],
          timeDimensions: [td("dw_meta_ads_attribution.date_start", range)],
          order: { "dw_meta_ads_attribution.attributed_revenue": "desc" },
          limit: 50,
        }),
        "metaAttrib"
      ),
      safeCubeQuery(
        q("marketing_performance", brand, {
          dimensions: ["marketing_performance.campaign_name"],
          measures: [
            "marketing_performance.ad_spend",
            "marketing_performance.roas",
            "marketing_performance.impressions",
            "marketing_performance.clicks",
            "marketing_performance.ctr",
            "marketing_performance.cpc",
            "marketing_performance.cpm",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
          order: { "marketing_performance.ad_spend": "desc" },
          limit: 50,
        }),
        "metaDelivery"
      ),
      safeCubeQuery(
        q("google_ad_performance", brand, {
          dimensions: ["google_ad_performance.campaign_name"],
          measures: [
            "google_ad_performance.spend",
            "google_ad_performance.impressions",
            "google_ad_performance.clicks",
            "google_ad_performance.conversions",
            "google_ad_performance.conversion_value",
            "google_ad_performance.roas",
            "google_ad_performance.ctr",
            "google_ad_performance.cpc",
            "google_ad_performance.cost_per_conversion",
          ],
          timeDimensions: [td("google_ad_performance.report_date", range)],
          order: { "google_ad_performance.spend": "desc" },
          limit: 50,
        }),
        "googleDelivery"
      ),
      safeCubeQuery(
        q("order_attribution", brand, {
          dimensions: ["order_attribution.lt_platform", "order_attribution.lt_campaign_name"],
          measures: [
            "order_attribution.attributed_orders",
            "order_attribution.placed_orders",
            "order_attribution.attributed_net_revenue_ex_gst",
          ],
          timeDimensions: [td("order_attribution.order_date", range, "day")],
          filters: platformFilter(channel),
          order: { "order_attribution.attributed_net_revenue_ex_gst": "desc" },
          limit: 200,
        }),
        "orderTrace"
      ),
    ])
    return { metaAttrib, metaDelivery, googleDelivery, orderTrace }
  })
}

export async function fetchAttributionAds(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<AttributionAdData> {
  return runDashboardCubeFetch(async () => {
    const [warehouseAds, adDelivery] = await Promise.all([
      safeCubeQuery(
        q("order_attribution", brand, {
          dimensions: [
            "order_attribution.lt_platform",
            "order_attribution.lt_campaign_name",
            "order_attribution.lt_adset_name",
            "order_attribution.lt_ad_id",
            "order_attribution.lt_ad_name",
          ],
          measures: [
            "order_attribution.attributed_orders",
            "order_attribution.attributed_net_revenue_ex_gst",
          ],
          timeDimensions: [td("order_attribution.order_date", range)],
          order: { "order_attribution.attributed_net_revenue_ex_gst": "desc" },
          limit: 200,
        }),
        "warehouseAds"
      ),
      safeCubeQuery(
        q("meta_ad_performance", brand, {
          dimensions: [
            "meta_ad_performance.ad_id",
            "meta_ad_performance.ad_name",
            "meta_ad_performance.campaign_name",
          ],
          measures: [
            "meta_ad_performance.spend",
            "meta_ad_performance.impressions",
            "meta_ad_performance.clicks",
            "meta_ad_performance.ctr",
            "meta_ad_performance.cpc",
            "meta_ad_performance.cpm",
            "meta_ad_performance.hook_rate",
          ],
          timeDimensions: [td("meta_ad_performance.report_date", range)],
          order: { "meta_ad_performance.spend": "desc" },
          limit: 200,
        }),
        "adDelivery"
      ),
    ])
    return { warehouseAds, adDelivery }
  })
}

export async function fetchAttributionSkus(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<AttributionSkuData> {
  return runDashboardCubeFetch(async () => {
    const skuRows = await safeCubeQuery(
      q("product_performance", brand, {
        dimensions: ["product_performance.sku", "product_performance.product_title"],
        measures: [
          "product_performance.net_line_revenue_ex_gst",
          "product_performance.total_quantity",
          "product_performance.total_cogs",
          "product_performance.gross_profit_ex_gst",
        ],
        timeDimensions: [td("product_performance.created_at_ist", range)],
        order: { "product_performance.net_line_revenue_ex_gst": "desc" },
        limit: 100,
      }),
      "skuRows"
    )
    return { skuRows }
  })
}

export async function fetchAttributionOrders(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: AttributionChannel
): Promise<AttributionOrdersData> {
  return runDashboardCubeFetch(async () => {
    const orderRows = await runCubeQuery(
      q("order_attribution", brand, {
        dimensions: ["order_attribution.lt_platform", "order_attribution.lt_campaign_name"],
        measures: [
          "order_attribution.attributed_orders",
          "order_attribution.placed_orders",
          "order_attribution.attributed_net_revenue_ex_gst",
        ],
        timeDimensions: [td("order_attribution.order_date", range, "day")],
        filters: platformFilter(channel),
        order: { "order_attribution.order_date": "desc" },
        limit: 500,
      })
    )
    return { orderRows }
  })
}
