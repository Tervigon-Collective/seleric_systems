import "server-only"

import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { q, td } from "../query-helpers"
import { type DashboardBrandFilter } from "../brand-filter"
import type { DashboardDateRange } from "../date-ranges"

const AP = "meta_ad_performance"      // ad-grain full video funnel (gold.fct_meta_ads_daily)
const NT = "meta_neurotag_analysis"   // ad → neuro tag map

// Ad-level additive counts + ratios that power the stage funnel and per-ad scoring.
const AD_MEASURES = [
  `${AP}.spend`,
  `${AP}.reach`,
  `${AP}.impressions`,
  `${AP}.video_views`,        // 3s views
  `${AP}.video_p25_views`,
  `${AP}.video_p50_views`,
  `${AP}.video_p75_views`,
  `${AP}.video_p100_views`,
  `${AP}.video_thruplay_15s`,
  `${AP}.link_clicks`,
  `${AP}.clicks`,
  `${AP}.purchases`,
  `${AP}.purchase_value`,
  `${AP}.roas`,
  `${AP}.hook_rate`,
] as const

export interface AdFunnelData {
  /** One row per ad (top 400 by spend) — drives per-stage winners/losers and tag rollups. */
  adRows: Record<string, unknown>[]
  /** Period totals with no dimensions (exact, not limited to top-N) — drives the headline bars. */
  funnelTotals: Record<string, unknown>[]
  /** ad_id → neuro tag map from meta_neurotag_analysis. */
  adTagMap: Record<string, unknown>[]
}

export async function fetchAdFunnelData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<AdFunnelData> {
  return runDashboardCubeFetch(async () => {
    const [adRows, funnelTotals, adTagMap] = await Promise.all([
      // Per-ad funnel rows
      safeCubeQuery(
        q(AP, brand, {
          measures: [...AD_MEASURES],
          dimensions: [
            `${AP}.ad_id`,
            `${AP}.ad_name`,
            `${AP}.campaign_name`,
            `${AP}.adset_name`,
          ],
          timeDimensions: [td(`${AP}.report_date`, range)],
          order: { [`${AP}.spend`]: "desc" },
          limit: 400,
        }),
        "adFunnelRows",
      ),

      // True period totals (no dimensions) + reach quality ratios for the header
      safeCubeQuery(
        q(AP, brand, {
          measures: [...AD_MEASURES, `${AP}.frequency`, `${AP}.cpm`],
          timeDimensions: [td(`${AP}.report_date`, range)],
        }),
        "funnelTotals",
      ),

      // ad_id → tags (neuro tag map); __untagged__ filtered out downstream
      safeCubeQuery(
        q(NT, brand, {
          measures: [`${NT}.spend_sc`],
          dimensions: [
            `${NT}.ad_id`,
            `${NT}.tag_code`,
            `${NT}.hack_name`,
            `${NT}.category_name`,
          ],
          timeDimensions: [td(`${NT}.report_date`, range)],
          order: { [`${NT}.spend_sc`]: "desc" },
          limit: 800,
        }),
        "adTagMap",
      ),
    ])

    return { adRows, funnelTotals, adTagMap }
  })
}
