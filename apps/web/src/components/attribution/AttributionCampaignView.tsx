import { ChartCard } from "@/components/charts/ChartCard"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionCampaignData } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionCampaignData
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtRoas(v: unknown): string {
  const x = n(v)
  return x > 0 ? `${x.toFixed(2)}x` : "—"
}

function fmtPct(v: unknown): string {
  const x = n(v)
  return x > 0 ? `${(x * 100).toFixed(1)}%` : "—"
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

function buildMergedMeta(
  metaAttrib: Record<string, unknown>[],
  metaDelivery: Record<string, unknown>[]
): Record<string, unknown>[] {
  const deliveryByName = new Map<string, Record<string, unknown>>()
  for (const row of metaDelivery) {
    const name = String(row["marketing_performance.campaign_name"] ?? "")
    if (name) deliveryByName.set(name, row)
  }

  return metaAttrib.map((attrib) => {
    const name = String(attrib["dw_meta_ads_attribution.campaign_name"] ?? "")
    const d = deliveryByName.get(name) ?? {}
    const attrRev = n(attrib["dw_meta_ads_attribution.attributed_revenue"])
    const attrOrders = n(attrib["dw_meta_ads_attribution.attributed_orders"])
    const spend = n(attrib["dw_meta_ads_attribution.ad_spend"])
    return {
      Campaign: name || "—",
      "Attr. Orders": attrOrders > 0 ? fmtCount(attrOrders) : "—",
      "Attr. Revenue": fmtMoney(attrRev),
      Spend: fmtMoney(spend),
      "W-ROAS": fmtRoas(attrib["dw_meta_ads_attribution.roas"]),
      Impressions: n(d["marketing_performance.impressions"]) > 0 ? fmtCount(n(d["marketing_performance.impressions"])) : "—",
      CTR: fmtPct(d["marketing_performance.ctr"]),
      CPC: fmtMoney(d["marketing_performance.cpc"]),
      CPM: fmtMoney(d["marketing_performance.cpm"]),
    }
  })
}

function buildGoogleRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => ({
    Campaign: String(r["google_ad_performance.campaign_name"] ?? "—"),
    Spend: fmtMoney(r["google_ad_performance.spend"]),
    Impressions: n(r["google_ad_performance.impressions"]) > 0 ? fmtCount(n(r["google_ad_performance.impressions"])) : "—",
    Clicks: n(r["google_ad_performance.clicks"]) > 0 ? fmtCount(n(r["google_ad_performance.clicks"])) : "—",
    Conversions: n(r["google_ad_performance.conversions"]) > 0 ? `${n(r["google_ad_performance.conversions"]).toFixed(1)}` : "—",
    Revenue: fmtMoney(r["google_ad_performance.conversion_value"]),
    ROAS: fmtRoas(r["google_ad_performance.roas"]),
    CTR: fmtPct(r["google_ad_performance.ctr"]),
    CPC: fmtMoney(r["google_ad_performance.cpc"]),
    CPA: fmtMoney(r["google_ad_performance.cost_per_conversion"]),
  }))
}

function buildOrderTraceRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const platform = String(r["order_attribution.lt_platform"] ?? "other")
    const campaign = r["order_attribution.lt_campaign_name"]
    const attrOrders = n(r["order_attribution.attributed_orders"])
    const placedOrders = n(r["order_attribution.placed_orders"])
    const gap = placedOrders - attrOrders
    const rawDate = String(r["order_attribution.order_date"] ?? r["order_attribution.order_date.day"] ?? "")
    return {
      Date: rawDate.slice(0, 10) || "—",
      Platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      Campaign: campaign ? String(campaign) : "Unattributed",
      "Attr. Orders": attrOrders > 0 ? String(attrOrders) : "—",
      "Placed Orders": placedOrders > 0 ? String(placedOrders) : "—",
      "Gap": gap > 0 ? String(gap) : "—",
      Revenue: fmtMoney(r["order_attribution.attributed_net_revenue_ex_gst"]),
    }
  })
}

export function AttributionCampaignView({ data }: Props) {
  const { metaAttrib, metaDelivery, googleDelivery, orderTrace } = data
  const mergedMeta = buildMergedMeta(metaAttrib, metaDelivery)
  const googleRows = buildGoogleRows(googleDelivery)
  const traceRows = buildOrderTraceRows(orderTrace)

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-night-800 dark:bg-night-875 dark:text-night-400">
        W-ROAS = warehouse attributed revenue / ad spend (from event pipeline, last-touch). Impressions, CTR, CPC from Meta delivery data.
      </div>

      <ChartCard title="Meta — campaign attribution" subtitle="Warehouse orders + revenue joined with pixel delivery" cube="dw_meta_ads_attribution">
        {mergedMeta.length > 0 ? (
          <DataTable rows={mergedMeta} />
        ) : (
          <p className="text-sm text-stone-500 dark:text-night-500">No Meta campaign data for this period.</p>
        )}
      </ChartCard>

      <ChartCard title="Google — campaign performance" subtitle="Spend, conversions, and ROAS by campaign" cube="google_ad_performance">
        {googleRows.length > 0 ? (
          <DataTable rows={googleRows} />
        ) : (
          <p className="text-sm text-stone-500 dark:text-night-500">No Google campaign data for this period.</p>
        )}
      </ChartCard>

      <ChartCard
        title="Order attribution trace"
        subtitle="Last-touch platform × campaign × day — warehouse orders"
        cube="order_attribution"
        className="xl:col-span-2"
      >
        {traceRows.length > 0 ? (
          <DataTable rows={traceRows} />
        ) : (
          <p className="text-sm text-stone-500 dark:text-night-500">No order attribution data for this period.</p>
        )}
      </ChartCard>
    </div>
  )
}
