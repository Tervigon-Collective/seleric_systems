import { type NextRequest, NextResponse } from "next/server"
import { runCubeQuery } from "@/lib/dashboard/cube-query"
import { withBrandFilter } from "@/lib/dashboard/brand-filter"
import { DEFAULT_BRAND_ID } from "@/lib/dashboard/brand-filter-constants"

// Raw "all columns" gold view — exposes ad_id at the placement grain, which the
// curated `meta_ad_breakdown` cube intentionally rolls up/drops.
const G = "gold__fct_meta_ads_breakdown_daily"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const adId = searchParams.get("ad_id")
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  const brandId = Number(searchParams.get("brand") ?? String(DEFAULT_BRAND_ID))

  if (!adId || !start || !end) {
    return NextResponse.json({ error: "ad_id, start, end required" }, { status: 400 })
  }

  try {
    const query = withBrandFilter(G, { id: brandId, isDefault: false }, {
      measures: [
        `${G}.spend`,
        `${G}.impressions`,
        `${G}.clicks`,
        `${G}.purchases`,
        `${G}.video_views_3s`,
        `${G}.video_thruplay_15s`,
      ],
      dimensions: [`${G}.platform_position`, `${G}.publisher_platform`],
      timeDimensions: [{ dimension: `${G}.report_date`, dateRange: [start, end] }],
      filters: [
        { member: `${G}.breakdown_type`, operator: "equals", values: ["placement"] },
        { member: `${G}.ad_id`, operator: "equals", values: [adId] },
      ],
      order: { [`${G}.spend`]: "desc" },
      limit: 50,
    })

    const rows = await runCubeQuery(query)
    return NextResponse.json({ rows })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg, rows: [] }, { status: 500 })
  }
}
