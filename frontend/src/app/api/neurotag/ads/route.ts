import { type NextRequest, NextResponse } from "next/server"
import { runCubeQuery } from "@/lib/dashboard/cube-query"
import { withBrandFilter } from "@/lib/dashboard/brand-filter"

const C = "meta_neurotag_analysis"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tag = searchParams.get("tag")
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  const brandId = Number(searchParams.get("brand") ?? "1")

  if (!tag || !start || !end) {
    return NextResponse.json({ error: "tag, start, end required" }, { status: 400 })
  }

  try {
    const base = withBrandFilter(C, { id: brandId, isDefault: false }, {
      measures: [
        `${C}.spend_sc`,
        `${C}.spend_fc`,
        `${C}.net_revenue_sc`,
        `${C}.attributed_orders_sc`,
        `${C}.impressions_sc`,
        `${C}.clicks_sc`,
        `${C}.new_customer_revenue_sc`,
      ],
      dimensions: [
        `${C}.ad_id`,
        `${C}.ad_name`,
        `${C}.campaign_name`,
        `${C}.adset_name`,
      ],
      timeDimensions: [
        {
          dimension: `${C}.report_date`,
          dateRange: [start, end],
        },
      ],
      filters: [
        {
          member: `${C}.tag_code`,
          operator: "equals",
          values: [tag],
        },
      ],
      order: { [`${C}.spend_sc`]: "desc" },
      limit: 100,
    })

    const rows = await runCubeQuery(base)
    return NextResponse.json({ rows })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg, rows: [] }, { status: 500 })
  }
}
