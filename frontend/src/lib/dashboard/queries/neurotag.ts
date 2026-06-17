import "server-only"

import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { td } from "../query-helpers"
import { withBrandFilter, type DashboardBrandFilter } from "../brand-filter"
import type { DashboardDateRange } from "../date-ranges"

const C = "meta_neurotag_analysis"

const ADDITIVE = [
  `${C}.spend_sc`,
  `${C}.spend_fc`,
  `${C}.net_revenue_sc`,
  `${C}.attributed_orders_sc`,
  `${C}.impressions_sc`,
  `${C}.clicks_sc`,
  `${C}.link_clicks_sc`,
  `${C}.new_customer_revenue_sc`,
  `${C}.video_thruplay_15s_sc`,
  `${C}.video_p100_views_sc`,
] as const

// Non-additive ratio measures — safe only when the grain is a single ad or single tag
const RATIO = [
  `${C}.hook_rate`,
  `${C}.hold_rate_15s`,
  `${C}.hold_rate_p50`,
  `${C}.hold_rate_p75`,
  `${C}.hold_rate_p100`,
  `${C}.cost_per_thruplay`,
] as const

export interface NeurotagDashboardData {
  tagLeaderboard: Record<string, unknown>[]
  categoryBreakdown: Record<string, unknown>[]
  spendTrend: Record<string, unknown>[]
  adLeaderboard: Record<string, unknown>[]
  adTagMap: Record<string, unknown>[]
  adNcrMap: Record<string, unknown>[]
  priorAdLeaderboard: Record<string, unknown>[]
}

function q(query: Record<string, unknown>, brand: DashboardBrandFilter) {
  return withBrandFilter(C, brand, query)
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export async function fetchNeurotagData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<NeurotagDashboardData> {
  return runDashboardCubeFetch(async () => {
    const priorStart = shiftDate(range.start, -range.spanDays)
    const priorEnd   = shiftDate(range.end,   -range.spanDays)

    const [tagLeaderboard, categoryBreakdown, spendTrend, adLeaderboard, adTagMap, adNcrMap, priorAdLeaderboard] =
      await Promise.all([
        // Ad-level leaderboard with additive + video ratio measures (grouped by ad_id)
        safeCubeQuery(
          q(
            {
              measures: [...ADDITIVE, ...RATIO],
              dimensions: [`${C}.ad_id`, `${C}.ad_name`, `${C}.tag_code`, `${C}.category_name`, `${C}.hack_name`],
              timeDimensions: [td(`${C}.report_date`, range)],
              order: { [`${C}.spend_sc`]: "desc" },
              limit: 500,
            },
            brand,
          ),
          "tagLeaderboard",
        ),

        // Category rollup (additive only — safe for grouping)
        safeCubeQuery(
          q(
            {
              measures: [...ADDITIVE],
              dimensions: [`${C}.category_name`],
              timeDimensions: [td(`${C}.report_date`, range)],
              order: { [`${C}.spend_sc`]: "desc" },
            },
            brand,
          ),
          "categoryBreakdown",
        ),

        // Daily spend trend
        safeCubeQuery(
          q(
            {
              measures: [
                `${C}.spend_sc`,
                `${C}.spend_fc`,
                `${C}.net_revenue_sc`,
                `${C}.attributed_orders_sc`,
              ],
              timeDimensions: [td(`${C}.report_date`, range, "day")],
              order: { [`${C}.report_date`]: "asc" },
            },
            brand,
          ),
          "spendTrend",
        ),

        // Ad-level leaderboard — uses meta_ad_performance to get ALL ads (not just tagged)
        safeCubeQuery(
          withBrandFilter("meta_ad_performance", brand, {
            measures: [
              "meta_ad_performance.spend",
              "meta_ad_performance.impressions",
              "meta_ad_performance.reach",
              "meta_ad_performance.clicks",
              "meta_ad_performance.link_clicks",
              "meta_ad_performance.purchase_value",
              "meta_ad_performance.purchases",
              "meta_ad_performance.add_to_cart",
              "meta_ad_performance.initiate_checkout",
              "meta_ad_performance.roas",
              "meta_ad_performance.frequency",
              "meta_ad_performance.hook_rate",
              "meta_ad_performance.hold_rate_p50",
              "meta_ad_performance.hold_rate_p100",
              "meta_ad_performance.video_views_3s",
              "meta_ad_performance.video_thruplay_15s",
              "meta_ad_performance.video_p50_views",
              "meta_ad_performance.video_p75_views",
              "meta_ad_performance.video_p100_views",
              "meta_ad_performance.cost_per_thruplay",
            ],
            dimensions: [
              "meta_ad_performance.ad_id",
              "meta_ad_performance.ad_name",
              "meta_ad_performance.campaign_name",
              "meta_ad_performance.adset_name",
            ],
            timeDimensions: [td("meta_ad_performance.report_date", range)],
            order: { "meta_ad_performance.spend": "desc" },
            limit: 300,
          }),
          "adLeaderboard",
        ),

        // Ad → tag mapping (for tag chips in Ads tab)
        safeCubeQuery(
          q(
            {
              measures: [`${C}.spend_sc`],
              dimensions: [
                `${C}.ad_id`,
                `${C}.tag_code`,
                `${C}.hack_name`,
                `${C}.category_name`,
              ],
              timeDimensions: [td(`${C}.report_date`, range)],
              order: { [`${C}.spend_sc`]: "desc" },
            },
            brand,
          ),
          "adTagMap",
        ),

        // Per-ad new-customer revenue for the NCR % column (grouped by ad_id without tag)
        safeCubeQuery(
          q(
            {
              measures: [`${C}.new_customer_revenue_sc`, `${C}.net_revenue_sc`],
              dimensions: [`${C}.ad_id`],
              timeDimensions: [td(`${C}.report_date`, range)],
              order: { [`${C}.net_revenue_sc`]: "desc" },
            },
            brand,
          ),
          "adNcrMap",
        ),

        // Prior-period ad ROAS + frequency for decay / fatigue signals
        safeCubeQuery(
          withBrandFilter("meta_ad_performance", brand, {
            measures: [
              "meta_ad_performance.spend",
              "meta_ad_performance.roas",
              "meta_ad_performance.frequency",
            ],
            dimensions: ["meta_ad_performance.ad_id"],
            timeDimensions: [{
              dimension: "meta_ad_performance.report_date",
              dateRange: [priorStart, priorEnd] as [string, string],
            }],
            order: { "meta_ad_performance.spend": "desc" },
            limit: 300,
          }),
          "priorAdLeaderboard",
        ),
      ])

    return { tagLeaderboard, categoryBreakdown, spendTrend, adLeaderboard, adTagMap, adNcrMap, priorAdLeaderboard }
  })
}
