import "server-only"

import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { td } from "../query-helpers"
import { withBrandFilter, type DashboardBrandFilter } from "../brand-filter"
import type { DashboardDateRange } from "../date-ranges"

const G  = "gold__fct_meta_ads_breakdown_daily"
const OA = "order_attribution"
const PP = "product_performance"

const BASE_ENGAGEMENT = [
  `${G}.spend`,
  `${G}.impressions`,
  `${G}.clicks`,
  `${G}.video_views_3s`,
  `${G}.video_thruplay_15s`,
] as const

function bkFilter(type: string) {
  return [{ member: `${G}.breakdown_type`, operator: "equals" as const, values: [type] }]
}

export interface ICPData {
  ageGender:   Record<string, unknown>[]
  device:      Record<string, unknown>[]
  region:      Record<string, unknown>[]
  placement:   Record<string, unknown>[]
  metaBuyer:   Record<string, unknown>[]
  topProducts: Record<string, unknown>[]
}

export async function fetchICPData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<ICPData> {
  return runDashboardCubeFetch(async () => {
    const [ageGender, device, region, placement, metaBuyer, topProducts] = await Promise.all([

      // Q1: Age × gender engagement at brand level (no ad_id filter)
      safeCubeQuery(
        withBrandFilter(G, brand, {
          measures: [...BASE_ENGAGEMENT],
          dimensions: [`${G}.age`, `${G}.gender`],
          timeDimensions: [td(`${G}.report_date`, range)],
          filters: bkFilter("age_and_gender"),
          order: { [`${G}.spend`]: "desc" },
          limit: 60,
        }),
        "icp_ageGender",
      ),

      // Q2: Device breakdown at brand level
      safeCubeQuery(
        withBrandFilter(G, brand, {
          measures: [...BASE_ENGAGEMENT],
          dimensions: [`${G}.device_platform`],
          timeDimensions: [td(`${G}.report_date`, range)],
          filters: bkFilter("platform_device"),
          order: { [`${G}.spend`]: "desc" },
        }),
        "icp_device",
      ),

      // Q3: Region breakdown at brand level
      safeCubeQuery(
        withBrandFilter(G, brand, {
          measures: [...BASE_ENGAGEMENT],
          dimensions: [`${G}.region`],
          timeDimensions: [td(`${G}.report_date`, range)],
          filters: bkFilter("region"),
          order: { [`${G}.spend`]: "desc" },
          limit: 15,
        }),
        "icp_region",
      ),

      // Q4: Placement with pixel purchases at brand level (only breakdown type with purchases)
      safeCubeQuery(
        withBrandFilter(G, brand, {
          measures: [...BASE_ENGAGEMENT, `${G}.purchases`],
          dimensions: [`${G}.publisher_platform`, `${G}.platform_position`],
          timeDimensions: [td(`${G}.report_date`, range)],
          filters: bkFilter("placement"),
          order: { [`${G}.spend`]: "desc" },
        }),
        "icp_placement",
      ),

      // Q5: Real warehouse-attributed Meta buyer totals (AOV)
      safeCubeQuery(
        withBrandFilter(OA, brand, {
          measures: [
            `${OA}.meta_attributed_orders`,
            `${OA}.meta_attributed_revenue`,
            `${OA}.placed_orders`,
          ],
          timeDimensions: [td(`${OA}.order_date`, range)],
          filters: [{ member: `${OA}.lt_platform`, operator: "equals" as const, values: ["meta"] }],
        }),
        "icp_metaBuyer",
      ),

      // Q6: Top products by net revenue (cross-channel Shopify)
      safeCubeQuery(
        withBrandFilter(PP, brand, {
          dimensions: [`${PP}.product_title`],
          measures: [
            `${PP}.total_quantity`,
            `${PP}.net_line_revenue_ex_gst`,
            `${PP}.gross_profit_ex_gst`,
          ],
          timeDimensions: [td(`${PP}.created_at_ist`, range)],
          order: { [`${PP}.net_line_revenue_ex_gst`]: "desc" },
          limit: 5,
        }),
        "icp_topProducts",
      ),
    ])

    return { ageGender, device, region, placement, metaBuyer, topProducts }
  })
}
