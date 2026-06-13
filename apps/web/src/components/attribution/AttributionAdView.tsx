import { ChartCard } from "@/components/charts/ChartCard"
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionAdData } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionAdData
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

function fmtRoas(x: number): string {
  return x > 0 ? `${x.toFixed(2)}x` : "—"
}

function fmtPct(v: unknown): string {
  const x = n(v)
  return x > 0 ? `${(x * 100).toFixed(1)}%` : "—"
}

function fmtHookRate(v: unknown): string {
  const x = n(v)
  return x > 0 ? `${(x * 100).toFixed(1)}%` : "—"
}

export function AttributionAdView({ data }: Props) {
  const { warehouseAds, adDelivery } = data

  const deliveryByAdId = new Map<string, Record<string, unknown>>()
  for (const row of adDelivery) {
    const id = String(row["meta_ad_performance.ad_id"] ?? "")
    if (id) deliveryByAdId.set(id, row)
  }

  const merged = warehouseAds
    .filter((r) => r["order_attribution.lt_ad_id"])
    .map((r) => {
      const adId = String(r["order_attribution.lt_ad_id"])
      const d = deliveryByAdId.get(adId) ?? {}
      const attrRev = n(r["order_attribution.attributed_net_revenue_ex_gst"])
      const spend = n(d["meta_ad_performance.spend"])
      const wRoas = spend > 0 ? attrRev / spend : 0
      return { r, d, attrRev, spend, wRoas }
    })

  const top10 = merged
    .filter((m) => m.attrRev > 0)
    .slice(0, 10)
    .map((m) => ({
      "order_attribution.lt_ad_name":
        m.r["order_attribution.lt_ad_name"] ?? m.r["order_attribution.lt_ad_id"],
      attrRev: m.attrRev,
      spend: m.spend,
    }))

  const tableRows = merged.map(({ r, d, attrRev, spend, wRoas }) => {
    const attrOrders = n(r["order_attribution.attributed_orders"])
    return {
      "Ad Name": String(
        r["order_attribution.lt_ad_name"] ?? r["order_attribution.lt_ad_id"] ?? "—"
      ).slice(0, 60),
      Adset: String(r["order_attribution.lt_adset_name"] ?? "—").slice(0, 40),
      Campaign: String(r["order_attribution.lt_campaign_name"] ?? "—").slice(0, 40),
      Platform: String(r["order_attribution.lt_platform"] ?? "—"),
      "Attr. Orders": attrOrders > 0 ? fmtCount(attrOrders) : "—",
      "Attr. Revenue": fmtMoney(attrRev),
      Spend: fmtMoney(spend),
      "W-ROAS": fmtRoas(wRoas),
      CTR: n(d["meta_ad_performance.ctr"]) > 0 ? fmtPct(d["meta_ad_performance.ctr"]) : "—",
      CPC: n(d["meta_ad_performance.cpc"]) > 0 ? fmtMoney(d["meta_ad_performance.cpc"]) : "—",
      "Hook Rate":
        n(d["meta_ad_performance.hook_rate"]) > 0
          ? fmtHookRate(d["meta_ad_performance.hook_rate"])
          : "—",
    }
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-night-800 dark:bg-night-875 dark:text-night-400">
        Ad-level attribution from event pipeline (last-touch). W-ROAS = warehouse attributed revenue
        / Meta spend. Google PMax ads show without ad-level IDs. CTR, CPC, Hook Rate from Meta
        delivery where available.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Top 10 ads by attributed revenue"
          subtitle="Warehouse last-touch · ex-GST"
          cube="order_attribution"
        >
          {top10.length > 0 ? (
            <HorizontalBarChart
              rows={top10}
              labelKey="order_attribution.lt_ad_name"
              measureKeys={["attrRev", "spend"]}
              height={300}
            />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">
              No ad-level attribution data for this period.
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Ad attribution table"
          subtitle="Warehouse orders + revenue joined with Meta delivery"
          cube="order_attribution"
          className="xl:col-span-2"
        >
          {tableRows.length > 0 ? (
            <DataTable rows={tableRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">
              No ad-level attribution data for this period.
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
