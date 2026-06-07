import "server-only"

import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { q, td } from "../query-helpers"
import { type DashboardBrandFilter } from "../brand-filter"
import type { DashboardDateRange } from "../date-ranges"

const AP = "meta_ad_performance"      // ad-grain full video funnel (gold.fct_meta_ads_daily)
const NT = "meta_neurotag_analysis"   // ad → neuro tag map
const OA = "order_attribution"        // warehouse last-touch attribution — has ad grain (lt_ad_id)

// Ad-level additive counts + ratios that power the stage funnel and per-ad scoring.
// NOTE singular names on this view: add_to_cart / initiate_checkout (marketing_performance
// uses plurals). The whole tail (LPV→ATC→Checkout→Purchase) is Meta pixel-attributed.
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
  `${AP}.landing_page_views`,
  `${AP}.add_to_cart`,
  `${AP}.initiate_checkout`,
  `${AP}.purchases`,
  `${AP}.purchase_value`,
  `${AP}.roas`,
  `${AP}.hook_rate`,
] as const

// Neuro-category × funnel-stage rates for the heatmap (cube computes weighted averages).
// Ad-performance / creative stages only — the on-site conversion rates (click_to_lpv,
// lpv_to_atc, atc_to_checkout, checkout_to_purchase) are Meta-pixel and belong to the
// PDP funnel module, so they are not requested here.
const CATEGORY_STAGE_MEASURES = [
  `${NT}.spend_sc`,
  `${NT}.impressions_sc`,
  `${NT}.hook_rate`,
  `${NT}.hold_rate_p50`,
  `${NT}.hold_rate_p75`,
  `${NT}.hold_rate_p100`,
  `${NT}.ctr`,
] as const

export interface AdFunnelData {
  /** One row per ad (top 400 by spend) — drives per-stage winners/losers and tag rollups. */
  adRows: Record<string, unknown>[]
  /** Period totals with no dimensions (exact, not limited to top-N) — drives the headline bars. */
  funnelTotals: Record<string, unknown>[]
  /** ad_id → neuro tag map from meta_neurotag_analysis. */
  adTagMap: Record<string, unknown>[]
  /** Neuro-category × stage rates for the heatmap. */
  categoryStage: Record<string, unknown>[]
  /** ad_id → real (warehouse, last-touch) Meta orders/revenue — the ROAS reality check. */
  adAttribution: Record<string, unknown>[]
}

export async function fetchAdFunnelData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<AdFunnelData> {
  return runDashboardCubeFetch(async () => {
    const [adRows, funnelTotals, adTagMap, categoryStage, adAttribution] = await Promise.all([
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
        }),
        "adTagMap",
      ),

      // Neuro-category × stage rates for the heatmap
      safeCubeQuery(
        q(NT, brand, {
          measures: [...CATEGORY_STAGE_MEASURES],
          dimensions: [`${NT}.category_name`],
          timeDimensions: [td(`${NT}.report_date`, range)],
          order: { [`${NT}.spend_sc`]: "desc" },
          limit: 30,
        }),
        "categoryStage",
      ),

      // Real warehouse attribution per ad (last-touch). Joined to the funnel on ad_id
      // (lt_ad_id = meta_ad_performance.ad_id) to reconcile the pixel tail to true
      // Meta-attributed orders/revenue. Filtered to meta so each row is one Meta ad.
      safeCubeQuery(
        q(OA, brand, {
          measures: [
            `${OA}.meta_attributed_orders`,
            `${OA}.meta_attributed_revenue`,
            `${OA}.placed_orders`,
          ],
          dimensions: [`${OA}.lt_ad_id`],
          filters: [{ member: `${OA}.lt_platform`, operator: "equals", values: ["meta"] }],
          timeDimensions: [td(`${OA}.order_date`, range)],
          order: { [`${OA}.meta_attributed_revenue`]: "desc" },
        }),
        "adAttribution",
      ),
    ])

    return { adRows, funnelTotals, adTagMap, categoryStage, adAttribution }
  })
}
