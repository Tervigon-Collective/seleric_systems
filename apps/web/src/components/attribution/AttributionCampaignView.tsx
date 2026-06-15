import { ChartCard } from "@/components/charts/ChartCard"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionCampaignData, AttributionChannel } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionCampaignData
  channel: AttributionChannel
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

function buildMetaAdRows(
  adRows: Record<string, unknown>[],
  adDelivery: Record<string, unknown>[]
): Record<string, unknown>[] {
  const deliveryByAdId = new Map<string, Record<string, unknown>>()
  for (const row of adDelivery) {
    const id = String(row["meta_ad_performance.ad_id"] ?? "")
    if (id) deliveryByAdId.set(id, row)
  }

  return adRows
    .filter((r) => r["order_attribution.lt_ad_id"])
    .map((r) => {
      const adId = String(r["order_attribution.lt_ad_id"])
      const d = deliveryByAdId.get(adId) ?? {}
      const attrRev = n(r["order_attribution.attributed_net_revenue_ex_gst"])
      const spend = n(d["meta_ad_performance.spend"])
      const wRoas = spend > 0 ? attrRev / spend : 0
      const attrOrders = n(r["order_attribution.attributed_orders"])
      return {
        "Ad Name": String(r["order_attribution.lt_ad_name"] ?? r["order_attribution.lt_ad_id"] ?? "—").slice(0, 60),
        Campaign: String(r["order_attribution.lt_campaign_name"] ?? "—").slice(0, 40),
        Adset: String(r["order_attribution.lt_adset_name"] ?? "—").slice(0, 40),
        "Attr. Orders": attrOrders > 0 ? fmtCount(attrOrders) : "—",
        "Attr. Revenue": fmtMoney(attrRev),
        Spend: fmtMoney(spend),
        "W-ROAS": wRoas > 0 ? `${wRoas.toFixed(2)}x` : "—",
        CTR: n(d["meta_ad_performance.ctr"]) > 0 ? fmtPct(d["meta_ad_performance.ctr"]) : "—",
        CPC: n(d["meta_ad_performance.cpc"]) > 0 ? fmtMoney(d["meta_ad_performance.cpc"]) : "—",
        "Hook Rate": n(d["meta_ad_performance.hook_rate"]) > 0 ? `${(n(d["meta_ad_performance.hook_rate"]) * 100).toFixed(1)}%` : "—",
      }
    })
}

export function AttributionCampaignView({ data, channel }: Props) {
  const { metaAttrib, metaDelivery, googleDelivery, orderTrace, adRows, adDelivery } = data

  const showMeta = channel === "all" || channel === "meta"
  const showGoogle = channel === "all" || channel === "google"
  const showOrganic = channel === "organic"
  const showOrderTrace = channel === "all"
  const showMetaAds = channel === "meta"

  const mergedMeta = showMeta ? buildMergedMeta(metaAttrib, metaDelivery) : []
  const googleRows = showGoogle ? buildGoogleRows(googleDelivery) : []
  const traceRows = showOrderTrace ? buildOrderTraceRows(orderTrace) : []
  const organicRows = showOrganic ? buildOrderTraceRows(orderTrace) : []
  const metaAdRows = showMetaAds ? buildMetaAdRows(adRows, adDelivery) : []

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-night-800 dark:bg-night-875 dark:text-night-400">
        {channel === "meta" && "Meta channel drill-down · W-ROAS = warehouse attributed revenue / ad spend (last-touch). Impressions, CTR, CPC, Hook Rate from Meta delivery data."}
        {channel === "google" && "Google channel drill-down · Conversions and revenue from Google Ads reporting (not warehouse last-touch). ROAS = conversion value / spend."}
        {channel === "organic" && "Organic channel drill-down · Orders attributed to organic (no paid ad last-touch). No spend or ROAS available."}
        {channel === "all" && "W-ROAS = warehouse attributed revenue / ad spend (from event pipeline, last-touch). Impressions, CTR, CPC from Meta delivery data."}
      </div>

      {showMeta && (
        <ChartCard
          title="Meta — campaign attribution"
          subtitle="Warehouse orders + revenue joined with pixel delivery · sorted by attributed revenue"
          cube="dw_meta_ads_attribution"
        >
          {mergedMeta.length > 0 ? (
            <DataTable rows={mergedMeta} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No Meta campaign data for this period.</p>
          )}
        </ChartCard>
      )}

      {showMetaAds && (
        <ChartCard
          title="Meta — ad-level attribution"
          subtitle="Warehouse last-touch orders + revenue per ad · joined with Meta delivery metrics"
          cube="order_attribution"
        >
          {metaAdRows.length > 0 ? (
            <DataTable rows={metaAdRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No Meta ad-level attribution data for this period.</p>
          )}
        </ChartCard>
      )}

      {showGoogle && (
        <ChartCard
          title="Google — campaign performance"
          subtitle="Spend, conversions, and ROAS by campaign · sorted by spend"
          cube="google_ad_performance"
        >
          {googleRows.length > 0 ? (
            <DataTable rows={googleRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No Google campaign data for this period.</p>
          )}
        </ChartCard>
      )}

      {showOrganic && (
        <ChartCard
          title="Organic — order attribution trace"
          subtitle="Orders attributed to organic traffic (direct / SEO / referral with no paid last-touch)"
          cube="order_attribution"
        >
          {organicRows.length > 0 ? (
            <DataTable rows={organicRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No organic attribution data for this period.</p>
          )}
        </ChartCard>
      )}

      {showOrderTrace && (
        <ChartCard
          title="Order attribution trace"
          subtitle="Last-touch platform × campaign × day — all channels"
          cube="order_attribution"
          className="xl:col-span-2"
        >
          {traceRows.length > 0 ? (
            <DataTable rows={traceRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No order attribution data for this period.</p>
          )}
        </ChartCard>
      )}
    </div>
  )
}
