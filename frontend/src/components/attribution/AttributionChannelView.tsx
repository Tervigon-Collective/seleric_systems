import Link from "next/link"
import { ChartCard } from "@/components/charts/ChartCard"
import { StackedBarChart } from "@/components/charts/StackedBarChart"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionChannelData } from "@/lib/dashboard/queries/attribution"
import type { DashboardSearchParams } from "@/lib/dashboard/date-ranges"

interface Props {
  data: AttributionChannelData
  searchParams?: DashboardSearchParams
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

function buildChannelUrl(searchParams: DashboardSearchParams | undefined, channel: string): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "view" || key === "channel") continue
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
    else if (value !== undefined) params.set(key, value)
  }
  params.set("view", "campaign")
  params.set("channel", channel)
  return `/attribution?${params.toString()}`
}

interface ChannelRow {
  platform: string
  href: string | null
  totalOrders: number
  revenue: number
  spend: number
  roas: number
  netProfit: number
}

function ChannelSummaryTable({
  rows,
  totalOrders,
  totalRev,
  totalSpend,
}: {
  rows: ChannelRow[]
  totalOrders: number
  totalRev: number
  totalSpend: number
}) {
  const thCls =
    "border-b border-slate-800 dark:border-night-800 bg-slate-900 dark:bg-night-875 px-3 py-2 text-left text-slate-400 dark:text-night-400 font-medium whitespace-nowrap text-xs"
  const tdCls = "px-3 py-2 text-slate-300 dark:text-night-200 whitespace-nowrap text-xs"
  const trCls =
    "border-b border-slate-800/50 dark:border-night-800/50 hover:bg-slate-800/30 dark:hover:bg-night-850/40"

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 dark:border-night-800">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Platform</th>
            <th className={thCls}>Orders Created</th>
            <th className={thCls}>Revenue (Ex-GST)</th>
            <th className={thCls}>Spend</th>
            <th className={thCls}>ROAS</th>
            <th className={thCls}>Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.platform} className={trCls}>
              <td className={tdCls}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                  >
                    {row.platform} →
                  </Link>
                ) : (
                  <span className="text-slate-400">{row.platform}</span>
                )}
              </td>
              <td className={tdCls}>{row.totalOrders > 0 ? fmtCount(row.totalOrders) : "—"}</td>
              <td className={tdCls}>{fmtMoney(row.revenue)}</td>
              <td className={tdCls}>{row.spend > 0 ? fmtMoney(row.spend) : "—"}</td>
              <td className={tdCls}>{row.roas > 0 ? `${row.roas.toFixed(2)}x` : "—"}</td>
              <td className={tdCls}>{row.netProfit !== 0 ? fmtMoney(row.netProfit) : "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-700 dark:border-night-700">
            <td className="px-3 py-2 text-xs font-semibold text-slate-300 dark:text-night-200">Total</td>
            <td className="px-3 py-2 text-xs font-semibold text-slate-300 dark:text-night-200">
              {fmtCount(totalOrders)}
            </td>
            <td className="px-3 py-2 text-xs font-semibold text-slate-300 dark:text-night-200">
              {fmtMoney(totalRev)}
            </td>
            <td className="px-3 py-2 text-xs font-semibold text-slate-300 dark:text-night-200">
              {totalSpend > 0 ? fmtMoney(totalSpend) : "—"}
            </td>
            <td className="px-3 py-2 text-xs text-slate-500 dark:text-night-500" colSpan={2}>—</td>
          </tr>
        </tfoot>
      </table>
      <div className="px-3 py-1 text-xs text-slate-600 dark:text-night-600">
        Orders Created = all orders placed in period from fct_order_attribution (all statuses: paid, COD, cancelled, returned) · Unattributed = gap to fct_orders ground truth (unresolved UTM)
      </div>
    </div>
  )
}

export function AttributionChannelView({ data, searchParams }: Props) {
  const { channelPnl, direct } = data
  const { totalOrders, metaSpend, googleSpend, platforms, trend } = direct

  // Net profit per channel from Cube channel_pnl (requires COGS allocation)
  const pnlMeta = channelPnl.find((r) => r["channel_pnl.platform"] === "meta") ?? {}
  const pnlGoogle = channelPnl.find((r) => r["channel_pnl.platform"] === "google") ?? {}
  const pnlOrganic = channelPnl.find((r) => r["channel_pnl.platform"] === "organic") ?? {}

  const totalSpend = metaSpend + googleSpend

  // Platform lookup from direct ClickHouse
  const byPlatform = new Map(platforms.map((p) => [p.platform, p]))
  const m = byPlatform.get("meta")
  const g = byPlatform.get("google")
  const org = byPlatform.get("organic")

  // Group all non-standard platforms into "Other"
  const knownPlatforms = new Set(["meta", "google", "organic"])
  let otherTotal = 0, otherRev = 0
  for (const p of platforms) {
    if (!knownPlatforms.has(p.platform)) {
      otherTotal += p.total_orders
      otherRev += p.total_revenue
    }
  }

  const totalRev =
    (m?.total_revenue ?? 0) +
    (g?.total_revenue ?? 0) +
    (org?.total_revenue ?? 0) +
    otherRev

  const metaRoas = metaSpend > 0 && m ? m.total_revenue / metaSpend : 0
  const googleRoas = googleSpend > 0 && g ? g.total_revenue / googleSpend : 0
  const blendedRoas = totalSpend > 0 ? totalRev / totalSpend : 0

  // Pivot trend for chart — orders created per day per channel (count)
  const trendMap = new Map<string, Record<string, unknown>>()
  for (const row of trend) {
    if (!trendMap.has(row.day)) trendMap.set(row.day, { order_date: row.day })
    const entry = trendMap.get(row.day)!
    entry[row.platform] = (Number(entry[row.platform] ?? 0)) + row.orders
  }
  const pivotedTrend = [...trendMap.values()].sort((a, b) =>
    String(a.order_date).localeCompare(String(b.order_date))
  )

  const channelRows: ChannelRow[] = [
    {
      platform: "Meta",
      href: buildChannelUrl(searchParams, "meta"),
      totalOrders: m?.total_orders ?? 0,
      revenue: m?.total_revenue ?? 0,
      spend: metaSpend,
      roas: metaRoas,
      netProfit: n(pnlMeta["channel_pnl.meta_net_profit"]),
    },
    {
      platform: "Google",
      href: buildChannelUrl(searchParams, "google"),
      totalOrders: g?.total_orders ?? 0,
      revenue: g?.total_revenue ?? 0,
      spend: googleSpend,
      roas: googleRoas,
      netProfit: n(pnlGoogle["channel_pnl.google_net_profit"]),
    },
    {
      platform: "Organic",
      href: buildChannelUrl(searchParams, "organic"),
      totalOrders: org?.total_orders ?? 0,
      revenue: org?.total_revenue ?? 0,
      spend: 0,
      roas: 0,
      netProfit: n(pnlOrganic["channel_pnl.organic_net_profit"]),
    },
    ...(otherTotal > 0
      ? [
          {
            platform: "Other",
            href: null,
            totalOrders: otherTotal,
            revenue: otherRev,
            spend: 0,
            roas: 0,
            netProfit: 0,
          },
        ]
      : []),
  ]

  // Unattributed gap: orders in fct_orders not in fct_order_attribution (no UTM)
  const attributedTotal = channelRows.reduce((s, r) => s + r.totalOrders, 0)
  const unattributedGap = totalOrders - attributedTotal
  if (unattributedGap > 0) {
    channelRows.push({
      platform: "Unattributed",
      href: null,
      totalOrders: unattributedGap,
      revenue: 0,
      spend: 0,
      roas: 0,
      netProfit: 0,
    })
  }

  const kpiCards = [
    {
      label: "Orders Created",
      value: fmtCount(totalOrders),
      sub: "all orders placed in period",
    },
    {
      label: "Revenue (Ex-GST)",
      value: fmtMoney(totalRev),
      sub: "all created orders",
    },
    { label: "Meta Spend", value: fmtMoney(metaSpend), sub: null },
    { label: "Google Spend", value: fmtMoney(googleSpend), sub: null },
    {
      label: "Blended ROAS",
      value: blendedRoas > 0 ? `${blendedRoas.toFixed(2)}x` : "—",
      sub: "revenue / total spend",
    },
  ]

  return (
    <div className="space-y-4">
<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
        Attribution model: last-touch · Orders/revenue from <strong>gold.fct_order_attribution</strong> direct · Spend from <strong>gold.fct_daily_pnl</strong> direct · Net Profit from channel_pnl (Cube) · &quot;Other&quot; = unresolvable UTM (direct / referral / unknown)
      </div>

      <div className="flex flex-wrap gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-850 px-4 py-3 flex flex-col gap-0.5 min-w-[140px]"
          >
            <span className="text-xs text-stone-500 dark:text-night-500 uppercase tracking-wide">
              {card.label}
            </span>
            <span className="text-lg font-semibold text-stone-900 dark:text-night-50">
              {card.value}
            </span>
            {card.sub && (
              <span className="text-[10px] text-stone-400 dark:text-night-600">{card.sub}</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Orders created by channel"
          subtitle="All orders placed per day by last-touch channel · fct_order_attribution direct"
          cube="fct_order_attribution"
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
            valueType="count"
          />
        </ChartCard>

        <ChartCard
          title="Channel summary"
          subtitle="Click a channel to drill down · fct_order_attribution + fct_daily_pnl direct · Net Profit from channel_pnl"
          cube="fct_order_attribution"
          className="xl:col-span-2"
        >
          <ChannelSummaryTable
            rows={channelRows}
            totalOrders={totalOrders}
            totalRev={totalRev}
            totalSpend={totalSpend}
          />
        </ChartCard>
      </div>
    </div>
  )
}
