import "server-only"

import { type DashboardBrandFilter } from "../brand-filter"
import { runCubeQuery, safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { priorDateRange, type DashboardDateRange } from "../date-ranges"
import { q, td } from "../query-helpers"

export interface AdsDashboardData {
  spendRoasDaily: Record<string, unknown>[]
  impressionsClicks: Record<string, unknown>[]
  cpcCpmCpaCurrent: Record<string, unknown>[]
  cpcCpmCpaPrior: Record<string, unknown>[]
  topCampaignsRoas: Record<string, unknown>[]
  adsetTable: Record<string, unknown>[]
  purchaseFunnel: Record<string, unknown>[]
  spendByHour: Record<string, unknown>[]
  attributionByCampaign: Record<string, unknown>[]
  engagementPeriod: Record<string, unknown>[]
  engagementDaily: Record<string, unknown>[]
}

export async function fetchAdsDashboardData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<AdsDashboardData> {
  return runDashboardCubeFetch(async () => {
    const [
      spendRoasDaily,
      impressionsClicks,
      cpcCpmCpaCurrent,
      cpcCpmCpaPrior,
      topCampaignsRoas,
      adsetTable,
      purchaseFunnel,
      spendByHour,
      attributionByCampaign,
      engagementPeriod,
      engagementDaily,
    ] = await Promise.all([
      safeCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.ad_spend",
            "marketing_performance.roas",
            "marketing_performance.purchase_value",
            "marketing_performance.purchases",
          ],
          timeDimensions: [td("marketing_performance.date_start", range, "day")],
          order: { "marketing_performance.date_start": "asc" },
        }),
        "spendRoasDaily"
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.impressions",
            "marketing_performance.clicks",
            "marketing_performance.ctr",
            "marketing_performance.cpc",
          ],
          timeDimensions: [td("marketing_performance.date_start", range, "day")],
          order: { "marketing_performance.date_start": "asc" },
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.cpc",
            "marketing_performance.cpm",
            "marketing_performance.ad_spend",
            "marketing_performance.purchases",
            "marketing_performance.conversion_rate",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.cpc",
            "marketing_performance.cpm",
            "marketing_performance.ad_spend",
            "marketing_performance.purchases",
            "marketing_performance.conversion_rate",
          ],
          timeDimensions: [
            {
              dimension: "marketing_performance.date_start",
              dateRange: priorDateRange(range),
            },
          ],
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          dimensions: ["marketing_performance.campaign_name"],
          measures: [
            "marketing_performance.roas",
            "marketing_performance.ad_spend",
            "marketing_performance.purchase_value",
            "marketing_performance.purchases",
            "marketing_performance.cpc",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
          order: { "marketing_performance.roas": "desc" },
          limit: 10,
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          dimensions: ["marketing_performance.campaign_name", "marketing_performance.adset_name"],
          measures: [
            "marketing_performance.ad_spend",
            "marketing_performance.roas",
            "marketing_performance.ctr",
            "marketing_performance.cpc",
            "marketing_performance.cpm",
            "marketing_performance.purchases",
            "marketing_performance.purchase_value",
            "marketing_performance.impressions",
            "marketing_performance.clicks",
            "marketing_performance.conversion_rate",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
          order: { "marketing_performance.ad_spend": "desc" },
          limit: 50,
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.impressions",
            "marketing_performance.link_clicks",
            "marketing_performance.landing_page_views",
            "marketing_performance.add_to_carts",
            "marketing_performance.initiated_checkouts",
            "marketing_performance.purchases",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
        })
      ),
      runCubeQuery(
        q("ad_performance", brand, {
          dimensions: ["ad_performance.hourly_window"],
          measures: [
            "ad_performance.ad_spend",
            "ad_performance.impressions",
            "ad_performance.clicks",
          ],
          timeDimensions: [td("ad_performance.date_start", range)],
          order: { "ad_performance.hourly_window": "asc" },
        })
      ),
      runCubeQuery(
        q("dw_meta_ads_attribution", brand, {
          dimensions: ["dw_meta_ads_attribution.campaign_name"],
          measures: [
            "dw_meta_ads_attribution.attributed_revenue",
            "dw_meta_ads_attribution.attributed_orders",
            "dw_meta_ads_attribution.attributed_cogs",
            "dw_meta_ads_attribution.attributed_gross_profit",
            "dw_meta_ads_attribution.roas",
          ],
          timeDimensions: [td("dw_meta_ads_attribution.date_start", range)],
          order: { "dw_meta_ads_attribution.attributed_revenue": "desc" },
          limit: 15,
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.video_views",
            "marketing_performance.post_engagements",
            "marketing_performance.link_clicks",
            "marketing_performance.landing_page_views",
            "marketing_performance.add_to_carts",
          ],
          timeDimensions: [td("marketing_performance.date_start", range)],
        })
      ),
      runCubeQuery(
        q("marketing_performance", brand, {
          measures: [
            "marketing_performance.video_views",
            "marketing_performance.post_engagements",
            "marketing_performance.link_clicks",
            "marketing_performance.landing_page_views",
            "marketing_performance.add_to_carts",
          ],
          timeDimensions: [td("marketing_performance.date_start", range, "day")],
          order: { "marketing_performance.date_start": "asc" },
        })
      ),
    ])

    return {
      spendRoasDaily,
      impressionsClicks,
      cpcCpmCpaCurrent,
      cpcCpmCpaPrior,
      topCampaignsRoas,
      adsetTable,
      purchaseFunnel,
      spendByHour,
      attributionByCampaign,
      engagementPeriod,
      engagementDaily,
    }
  })
}
