import { type NextRequest, NextResponse } from "next/server"
import { runCubeQuery } from "@/lib/dashboard/cube-query"
import { withBrandFilter } from "@/lib/dashboard/brand-filter"
import { DEFAULT_BRAND_ID } from "@/lib/dashboard/brand-filter-constants"

const G = "gold__fct_meta_ads_breakdown_daily"

const BREAKDOWN_DIMS: Record<string, string[]> = {
  age_and_gender:     [`${G}.age`, `${G}.gender`],
  publisher_platform: [`${G}.publisher_platform`],
  platform_device:    [`${G}.device_platform`],
  region:             [`${G}.region`],
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const adId         = searchParams.get("ad_id")
  const breakdownType = searchParams.get("breakdown_type")
  const start        = searchParams.get("start")
  const end          = searchParams.get("end")
  const brandId      = Number(searchParams.get("brand") ?? String(DEFAULT_BRAND_ID))

  if (!adId || !breakdownType || !start || !end) {
    return NextResponse.json({ error: "ad_id, breakdown_type, start, end required" }, { status: 400 })
  }

  const dims = BREAKDOWN_DIMS[breakdownType]
  if (!dims) {
    return NextResponse.json({ error: `Unknown breakdown_type: ${breakdownType}` }, { status: 400 })
  }

  try {
    const query = withBrandFilter(G, { id: brandId, isDefault: false }, {
      measures: [
        `${G}.spend`,
        `${G}.impressions`,
        `${G}.clicks`,
        `${G}.video_views_3s`,
        `${G}.video_thruplay_15s`,
      ],
      dimensions: dims,
      timeDimensions: [{ dimension: `${G}.report_date`, dateRange: [start, end] }],
      filters: [
        { member: `${G}.breakdown_type`, operator: "equals", values: [breakdownType] },
        { member: `${G}.ad_id`,          operator: "equals", values: [adId]          },
      ],
      order: { [`${G}.spend`]: "desc" },
      limit: breakdownType === "region" ? 30 : 100,
    })

    const rows = await runCubeQuery(query)
    return NextResponse.json({ rows })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg, rows: [] }, { status: 500 })
  }
}
