import "server-only"



import { type DashboardBrandFilter } from "../brand-filter"

import { toCubeDateRange, type DashboardDateRange } from "../date-ranges"

import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"

import { fetchKpiPeriodCompare, type KpiPeriodCompare } from "../kpi"

import { reconcileChannelNetProfitRows } from "../channel-net-profit"
import { q, td } from "../query-helpers"



export interface MainDashboardData {

  kpiPeriodCompare: KpiPeriodCompare

  netProfitTrend: Record<string, unknown>[]

  revenueVsSpend: Record<string, unknown>[]

  channelRevenue: Record<string, unknown>[]

  channelNetProfitTrend: Record<string, unknown>[]

  ordersAovTrend: Record<string, unknown>[]

  roasByChannel: Record<string, unknown>[]

  grossMarginTrend: Record<string, unknown>[]

  returnRateTrend: Record<string, unknown>[]

  pnlWaterfall: Record<string, unknown>[]

}



const DAILY_PNL_MEASURES = [

  "daily_pnl.net_profit",

  "daily_pnl.gross_profit",

  "daily_pnl.total_sales_ex_gst",

  "daily_pnl.total_cogs",

  "daily_pnl.total_ad_spend",

  "daily_pnl.gross_margin_pct",

] as const



const CHANNEL_DAILY_MEASURES = [

  "channel_pnl.meta_net_profit",

  "channel_pnl.google_net_profit",

  "channel_pnl.organic_net_profit",

  "channel_pnl.meta_roas",

  "channel_pnl.google_roas",

  "channel_pnl.meta_ad_spend",

  "channel_pnl.google_ad_spend",

] as const



const SHOPIFY_DAILY_MEASURES = [

  "shopify_orders.net_orders",

  "shopify_orders.aov",

  "shopify_orders.gross_revenue",

  "shopify_orders.return_rate",

  "shopify_orders.returned_orders",

] as const



export async function fetchMainDashboardData(

  range: DashboardDateRange,

  brand: DashboardBrandFilter

): Promise<MainDashboardData> {

  return runDashboardCubeFetch(async () => {

    const [

      kpiPeriodCompare,

      dailyPnl,

      channelRevenue,

      channelDaily,

      shopifyDaily,

      pnlWaterfall,

    ] = await Promise.all([

      fetchKpiPeriodCompare(range, brand),

      safeCubeQuery(

        q("daily_pnl", brand, {

          measures: [...DAILY_PNL_MEASURES],

          timeDimensions: [td("daily_pnl.report_date", range, "day")],

          order: { "daily_pnl.report_date": "asc" },

        }),

        "dailyPnl"

      ),

      safeCubeQuery(

        q("channel_pnl", brand, {

          measures: [

            "channel_pnl.meta_attributed_revenue_ex_gst",

            "channel_pnl.google_attributed_revenue_ex_gst",

            "channel_pnl.organic_attributed_revenue_ex_gst",

            "channel_pnl.meta_attributed_orders",

            "channel_pnl.google_attributed_orders",

            "channel_pnl.organic_attributed_orders",

          ],

          timeDimensions: [td("channel_pnl.date_start", range)],

        }),

        "channelRevenue"

      ),

      safeCubeQuery(

        q("channel_pnl", brand, {

          measures: [...CHANNEL_DAILY_MEASURES],

          timeDimensions: [td("channel_pnl.date_start", range, "day")],

          order: { "channel_pnl.date_start": "asc" },

        }),

        "channelDaily"

      ),

      safeCubeQuery(

        q("shopify_orders", brand, {

          measures: [...SHOPIFY_DAILY_MEASURES],

          timeDimensions: [td("shopify_orders.created_at_ist", range, "day")],

          order: { "shopify_orders.created_at_ist": "asc" },

        }),

        "shopifyDaily"

      ),

      safeCubeQuery(

        q("canonical_pnl", brand, {

          measures: [

            "canonical_pnl.net_revenue_excl_tax",

            "canonical_pnl.product_cost",

            "canonical_pnl.shipping_cost",

            "canonical_pnl.packaging_cost",

            "canonical_pnl.payment_gateway_fees",

            "canonical_pnl.rto_cost",

            "canonical_pnl.total_operating_cost",

            "canonical_pnl.gross_profit",

            "canonical_pnl.total_ad_spend",

            "canonical_pnl.net_profit",

          ],

          timeDimensions: [td("canonical_pnl.report_date", range)],

        }),

        "pnlWaterfall"

      ),

    ])



    return {

      kpiPeriodCompare,

      netProfitTrend: dailyPnl,

      revenueVsSpend: dailyPnl,

      channelRevenue,

      channelNetProfitTrend: reconcileChannelNetProfitRows(channelDaily, dailyPnl),

      ordersAovTrend: shopifyDaily,

      roasByChannel: channelDaily,

      grossMarginTrend: dailyPnl,

      returnRateTrend: shopifyDaily,

      pnlWaterfall,

    }

  })

}

