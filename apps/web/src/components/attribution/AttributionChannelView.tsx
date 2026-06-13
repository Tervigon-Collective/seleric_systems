import { ChartCard } from "@/components/charts/ChartCard"
import { StackedBarChart } from "@/components/charts/StackedBarChart"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionChannelData } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionChannelData
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtRoas(v: unknown): string {
  const x = n(v)
  return x > 0 ? `${x.toFixed(2)}x` : "—"
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

function pivotChannelTrend(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const dateKey = "order_attribution.order_date"
  const platformKey = "order_attribution.lt_platform"
  const measureKey = "order_attribution.attributed_net_revenue_ex_gst"

  const map = new Map<string, Record<string, unknown>>()
  for (const row of rows) {
    const date = String(row[dateKey] ?? "").slice(0, 10)
    if (!date) continue
    const platform = String(row[platformKey] ?? "other").toLowerCase()
    const value = n(row[measureKey])
    if (!map.has(date)) map.set(date, { order_date: date })
    const entry = map.get(date)!
    entry[platform] = n(entry[platform]) + value
  }
  return [...map.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export function AttributionChannelView({ data }: Props) {
  const { channelTotals, channelTrend } = data

  const meta = channelTotals.find((r) => r["channel_pnl.platform"] === "meta") ?? {}
  const google = channelTotals.find((r) => r["channel_pnl.platform"] === "google") ?? {}
  const organic = channelTotals.find((r) => r["channel_pnl.platform"] === "organic") ?? {}

  const metaSpend = n(meta["channel_pnl.meta_ad_spend"])
  const googleSpend = n(google["channel_pnl.google_ad_spend"])
  const totalSpend = metaSpend + googleSpend

  const metaRev = n(meta["channel_pnl.meta_attributed_revenue_ex_gst"])
  const googleRev = n(google["channel_pnl.google_attributed_revenue_ex_gst"])
  const organicRev = n(organic["channel_pnl.organic_attributed_revenue_ex_gst"])
  const totalRev = metaRev + googleRev + organicRev

  const blendedRoas = totalSpend > 0 ? totalRev / totalSpend : 0

  const metaOrders = n(meta["channel_pnl.meta_attributed_orders"])
  const googleOrders = n(google["channel_pnl.google_attributed_orders"])
  const organicOrders = n(organic["channel_pnl.organic_attributed_orders"])
  const totalOrders = metaOrders + googleOrders + organicOrders

  const pivotedTrend = pivotChannelTrend(channelTrend)

  const summaryRows = [
    {
      Platform: "Meta",
      Orders: metaOrders > 0 ? fmtCount(metaOrders) : "—",
      "Revenue (ex-GST)": fmtMoney(metaRev),
      Spend: fmtMoney(metaSpend),
      ROAS: fmtRoas(meta["channel_pnl.meta_roas"]),
      "Net Profit": fmtMoney(n(meta["channel_pnl.meta_net_profit"])),
    },
    {
      Platform: "Google",
      Orders: googleOrders > 0 ? fmtCount(googleOrders) : "—",
      "Revenue (ex-GST)": fmtMoney(googleRev),
      Spend: fmtMoney(googleSpend),
      ROAS: fmtRoas(google["channel_pnl.google_roas"]),
      "Net Profit": fmtMoney(n(google["channel_pnl.google_net_profit"])),
    },
    {
      Platform: "Organic",
      Orders: organicOrders > 0 ? fmtCount(organicOrders) : "—",
      "Revenue (ex-GST)": fmtMoney(organicRev),
      Spend: "—",
      ROAS: "—",
      "Net Profit": fmtMoney(n(organic["channel_pnl.organic_net_profit"])),
    },
  ]

  const kpiCards = [
    { label: "Total Attributed Orders", value: fmtCount(totalOrders) },
    { label: "Total Attributed Revenue", value: fmtMoney(totalRev) },
    { label: "Meta Spend", value: fmtMoney(metaSpend) },
    { label: "Google Spend", value: fmtMoney(googleSpend) },
    { label: "Blended ROAS", value: blendedRoas > 0 ? `${blendedRoas.toFixed(2)}x` : "—" },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
        Attribution model: last-touch. &quot;Other&quot; platform = unresolvable UTM (direct / referral / unknown). No Amazon Ads data available.
      </div>

      <div className="flex flex-wrap gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-850 px-4 py-3 flex flex-col gap-1 min-w-[140px]"
          >
            <span className="text-xs text-stone-500 dark:text-night-500 uppercase tracking-wide">{card.label}</span>
            <span className="text-lg font-semibold text-stone-900 dark:text-night-50">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Attributed revenue by channel"
          subtitle="Last-touch, ex-GST, per day"
          cube="order_attribution"
          className="xl:col-span-2"
        >
          <StackedBarChart
            rows={pivotedTrend}
            series={[
              { label: "Meta", measure: "meta" },
              { label: "Google", measure: "google" },
              { label: "Organic", measure: "organic" },
              { label: "Other", measure: "other" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Channel summary"
          subtitle="Last-touch attribution + spend from channel P&L"
          cube="channel_pnl"
          className="xl:col-span-2"
        >
          <DataTable rows={summaryRows} />
        </ChartCard>
      </div>
    </div>
  )
}
