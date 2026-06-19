import "server-only"

import { type DashboardBrandFilter } from "../brand-filter"
import { runCubeQuery, safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { type DashboardDateRange } from "../date-ranges"
import { q, td } from "../query-helpers"
import { type CubeRow } from "@/lib/chat/cube-rows"
import {
  fetchAttributionDirect,
  fetchCampaignAdRows,
  fetchCampaignAdSkuRows,
  fetchCampaignRollupOrders,
  type AttributionDirectData,
  type CampaignAdRow,
  type CampaignAdSkuRow,
  type CampaignRollupOrders,
} from "./attribution-clickhouse"

export type AttributionChannel = "all" | "meta" | "google" | "organic"

export type { CampaignAdRow, CampaignAdSkuRow }

export interface MetaPlatformRow {
  publisher_platform: string
  spend: number
  impressions: number
  clicks: number
  purchases: number
}

export interface MetaPlacementRow {
  publisher_platform: string
  platform_position: string
  spend: number
  impressions: number
  clicks: number
  purchases: number
}

export interface GoogleNetworkRow {
  network: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
}

export interface GoogleDeviceRow {
  device: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
}

export interface SubChannelData {
  metaPlatform: MetaPlatformRow[]
  metaPlacement: MetaPlacementRow[]
  googleNetwork: GoogleNetworkRow[]
  googleDevice: GoogleDeviceRow[]
}

export interface AttributionChannelData {
  channelPnl: CubeRow[]
  direct: AttributionDirectData
  subChannel: SubChannelData
}

export interface AttributionCampaignData {
  adRows: CampaignAdRow[]            // order counts per campaign×adset×ad (no SKU double-count)
  skuRows: CampaignAdSkuRow[]        // gross revenue+units per ad×sku
  rollupOrders: CampaignRollupOrders // distinct orders at campaign + adset level (correct rollups)
  metaDelivery: CubeRow[]            // Meta campaign delivery (spend, impressions, clicks)
  adDelivery: CubeRow[]              // Meta ad delivery (spend, impressions, clicks, video_views_3s) per ad+adset
  googleDelivery: CubeRow[]          // Google campaign performance
}

export interface AttributionOrdersData {
  orderRows: CubeRow[]
}

function platformFilter(channel: AttributionChannel) {
  if (channel === "all") return []
  return [{ member: "order_attribution.lt_platform", operator: "equals", values: [channel] }]
}

async function fetchSubChannelData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<SubChannelData> {
  return runDashboardCubeFetch(async () => {
    const [metaPlatformRaw, metaPlacementRaw, googleNetworkRaw, googleDeviceRaw] = await Promise.all([
      safeCubeQuery(
        q("meta_ad_breakdown", brand, {
          dimensions: ["meta_ad_breakdown.publisher_platform"],
          measures: [
            "meta_ad_breakdown.spend",
            "meta_ad_breakdown.impressions",
            "meta_ad_breakdown.clicks",
            "meta_ad_breakdown.purchases",
          ],
          timeDimensions: [td("meta_ad_breakdown.report_date", range)],
          filters: [{ member: "meta_ad_breakdown.breakdown_type", operator: "equals", values: ["publisher_platform"] }],
          order: { "meta_ad_breakdown.spend": "desc" },
          limit: 20,
        }),
        "metaPlatform"
      ),
      safeCubeQuery(
        q("meta_ad_breakdown", brand, {
          dimensions: ["meta_ad_breakdown.publisher_platform", "meta_ad_breakdown.platform_position"],
          measures: [
            "meta_ad_breakdown.spend",
            "meta_ad_breakdown.impressions",
            "meta_ad_breakdown.clicks",
            "meta_ad_breakdown.purchases",
          ],
          timeDimensions: [td("meta_ad_breakdown.report_date", range)],
          filters: [{ member: "meta_ad_breakdown.breakdown_type", operator: "equals", values: ["placement"] }],
          order: { "meta_ad_breakdown.spend": "desc" },
          limit: 50,
        }),
        "metaPlacement"
      ),
      safeCubeQuery(
        q("google_ad_performance", brand, {
          dimensions: ["google_ad_performance.segment_ad_network_type"],
          measures: [
            "google_ad_performance.spend",
            "google_ad_performance.impressions",
            "google_ad_performance.clicks",
            "google_ad_performance.conversions",
            "google_ad_performance.roas",
          ],
          timeDimensions: [td("google_ad_performance.report_date", range)],
          order: { "google_ad_performance.spend": "desc" },
          limit: 20,
        }),
        "googleNetwork"
      ),
      safeCubeQuery(
        q("google_ad_performance", brand, {
          dimensions: ["google_ad_performance.segment_device"],
          measures: [
            "google_ad_performance.spend",
            "google_ad_performance.impressions",
            "google_ad_performance.clicks",
            "google_ad_performance.conversions",
            "google_ad_performance.roas",
          ],
          timeDimensions: [td("google_ad_performance.report_date", range)],
          order: { "google_ad_performance.spend": "desc" },
          limit: 20,
        }),
        "googleDevice"
      ),
    ])

    const metaPlatform: MetaPlatformRow[] = metaPlatformRaw
      .filter((r) => Number(r["meta_ad_breakdown.spend"] ?? 0) > 0)
      .map((r) => ({
        publisher_platform: String(r["meta_ad_breakdown.publisher_platform"] ?? "unknown"),
        spend: Number(r["meta_ad_breakdown.spend"] ?? 0),
        impressions: Number(r["meta_ad_breakdown.impressions"] ?? 0),
        clicks: Number(r["meta_ad_breakdown.clicks"] ?? 0),
        purchases: Number(r["meta_ad_breakdown.purchases"] ?? 0),
      }))

    const metaPlacement: MetaPlacementRow[] = metaPlacementRaw
      .filter((r) => Number(r["meta_ad_breakdown.spend"] ?? 0) > 0)
      .map((r) => ({
        publisher_platform: String(r["meta_ad_breakdown.publisher_platform"] ?? "unknown"),
        platform_position: String(r["meta_ad_breakdown.platform_position"] ?? "unknown"),
        spend: Number(r["meta_ad_breakdown.spend"] ?? 0),
        impressions: Number(r["meta_ad_breakdown.impressions"] ?? 0),
        clicks: Number(r["meta_ad_breakdown.clicks"] ?? 0),
        purchases: Number(r["meta_ad_breakdown.purchases"] ?? 0),
      }))

    const googleNetwork: GoogleNetworkRow[] = googleNetworkRaw
      .filter((r) => Number(r["google_ad_performance.spend"] ?? 0) > 0)
      .map((r) => ({
        network: String(r["google_ad_performance.segment_ad_network_type"] ?? "unknown"),
        spend: Number(r["google_ad_performance.spend"] ?? 0),
        impressions: Number(r["google_ad_performance.impressions"] ?? 0),
        clicks: Number(r["google_ad_performance.clicks"] ?? 0),
        conversions: Number(r["google_ad_performance.conversions"] ?? 0),
        roas: Number(r["google_ad_performance.roas"] ?? 0),
      }))

    const googleDevice: GoogleDeviceRow[] = googleDeviceRaw
      .filter((r) => Number(r["google_ad_performance.spend"] ?? 0) > 0)
      .map((r) => ({
        device: String(r["google_ad_performance.segment_device"] ?? "unknown"),
        spend: Number(r["google_ad_performance.spend"] ?? 0),
        impressions: Number(r["google_ad_performance.impressions"] ?? 0),
        clicks: Number(r["google_ad_performance.clicks"] ?? 0),
        conversions: Number(r["google_ad_performance.conversions"] ?? 0),
        roas: Number(r["google_ad_performance.roas"] ?? 0),
      }))

    return { metaPlatform, metaPlacement, googleNetwork, googleDevice }
  })
}

export async function fetchAttributionChannel(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<AttributionChannelData> {
  const [channelPnl, direct, subChannel] = await Promise.all([
    // Cube only for net_profit per channel (requires COGS allocation not in raw tables)
    runDashboardCubeFetch(() =>
      safeCubeQuery(
        q("channel_pnl", brand, {
          dimensions: ["channel_pnl.platform"],
          measures: [
            "channel_pnl.meta_net_profit",
            "channel_pnl.google_net_profit",
            "channel_pnl.organic_net_profit",
          ],
          timeDimensions: [td("channel_pnl.date_start", range)],
        }),
        "channelPnl"
      )
    ),
    // Direct ClickHouse for everything else (orders, revenue, spend, trend)
    fetchAttributionDirect(range, brand),
    fetchSubChannelData(range, brand),
  ])
  return { channelPnl, direct, subChannel }
}

export async function fetchAttributionCampaigns(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
  channel: AttributionChannel
): Promise<AttributionCampaignData> {
  const [adRows, skuRows, rollupOrders, cubeData] = await Promise.all([
    fetchCampaignAdRows(range, brand, channel),
    fetchCampaignAdSkuRows(range, brand, channel),
    fetchCampaignRollupOrders(range, brand, channel),
    runDashboardCubeFetch(async () => {
      const [metaDelivery, adDelivery, googleDelivery] = await Promise.all([
        safeCubeQuery(
          q("marketing_performance", brand, {
            dimensions: ["marketing_performance.campaign_name"],
            measures: [
              "marketing_performance.ad_spend",
              "marketing_performance.impressions",
              "marketing_performance.clicks",
            ],
            timeDimensions: [td("marketing_performance.date_start", range)],
            order: { "marketing_performance.ad_spend": "desc" },
            limit: 100,
          }),
          "metaDelivery"
        ),
        safeCubeQuery(
          q("meta_ad_performance", brand, {
            dimensions: [
              "meta_ad_performance.ad_id",
              "meta_ad_performance.ad_name",
              "meta_ad_performance.adset_name",
              "meta_ad_performance.campaign_name",
            ],
            measures: [
              "meta_ad_performance.spend",
              "meta_ad_performance.impressions",
              "meta_ad_performance.clicks",
              "meta_ad_performance.video_views_3s",
            ],
            timeDimensions: [td("meta_ad_performance.report_date", range)],
            order: { "meta_ad_performance.spend": "desc" },
            limit: 1000,
          }),
          "adDelivery"
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
      ])
      return { metaDelivery, adDelivery, googleDelivery }
    }),
  ])
  return { adRows, skuRows, rollupOrders, ...cubeData }
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
