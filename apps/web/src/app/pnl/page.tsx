import { AreaTrendChart } from "@/components/charts/AreaTrendChart"
import { ChartCard } from "@/components/charts/ChartCard"
import { PnlWaterfallChart } from "@/components/charts/PnlWaterfallChart"
import { TrendChart } from "@/components/chat/TrendChart"
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls"
import { PnlHeadlineKpis } from "@/components/dashboard/PnlHeadlineKpis"
import { brandLabel, parseDashboardBrandFilter } from "@/lib/dashboard/brand-filter"
import { PnlAvailabilityBanner } from "@/components/dashboard/PnlAvailabilityBanner"
import { PnlBreakdownTable } from "@/components/dashboard/PnlBreakdownTable"
import { PnlTimeSeriesSection } from "@/components/dashboard/PnlTimeSeriesSection"
import { cogsBreakdownFromRow } from "@/lib/dashboard/cogs-breakdown"
import {
  dateRangeLabel,
  parseDashboardDateRange,
  type DashboardSearchParams,
} from "@/lib/dashboard/date-ranges"
import { fetchPnlDashboardData, type PnlDashboardData } from "@/lib/dashboard/queries/pnl"
import { DomainChatRegistrar } from "@/components/chat/DomainChatRegistrar"
import { buildPnlContext } from "@/lib/chat/domain-context"

export const revalidate = 60

const HEADLINE_KPIS = [
  { label: "Net sales ex GST", key: "canonical_pnl.net_sales_excl_tax" },
  { label: "COGS", key: "canonical_pnl.product_cost" },
  { label: "Gross profit", key: "canonical_pnl.gross_profit" },
  { label: "Total ad spend", key: "canonical_pnl.total_ad_spend" },
  { label: "Net profit", key: "canonical_pnl.net_profit" },
  { label: "MER", key: "canonical_pnl.mer", format: "ratio" as const },
  { label: "Orders created", key: "canonical_pnl.orders_created", format: "count" as const },
]

export default async function PnlDashboardPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams
}) {
  const range = parseDashboardDateRange(searchParams)
  const brand = parseDashboardBrandFilter(searchParams)
  const rangeLabel = dateRangeLabel(range)
  const brandText = brandLabel(brand)

  let data: PnlDashboardData | null = null
  let error: string | null = null

  try {
    data = await fetchPnlDashboardData(range, brand)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    data = null
  }

  const cogsBreakdown = cogsBreakdownFromRow(data?.periodRow ?? {})
  const headlineKpis = HEADLINE_KPIS.filter((k) => data?.schema.available.includes(k.key) ?? false)

  return (
    <main className="p-6 space-y-6">
      {data && (
        <DomainChatRegistrar
          context={buildPnlContext(data, range, brand)}
        />
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-night-50">P&L Dashboard</h1>
          <p className="text-sm text-stone-500 dark:text-night-500 mt-1">
            Certified rollups (int_finance_daily_rollups + ad spend) · {brandText} · {rangeLabel} · IST report_date
          </p>
          <p className="text-xs text-stone-400 dark:text-night-600 mt-1">
            net_sales from finance rollups · gross_profit = net_sales − net COGS · net_profit = net_sales − net COGS − ad spend ·
            Incl-GST column = excl × 1.18 on taxable revenue, costs/ad spend unchanged
          </p>
          {error && (
            <p className="mt-2 text-sm text-amber-400">ClickHouse error — {error}</p>
          )}
        </div>
        <DashboardFilterControls
          start={range.start}
          end={range.end}
          spanDays={range.spanDays}
          searchParams={searchParams}
        />
      </header>

      {data && <PnlAvailabilityBanner schema={data.schema} />}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {headlineKpis.length > 0 && data && (
          <ChartCard
            title="Headline KPIs"
            subtitle={`${range.spanDays}d total vs prior ${range.spanDays}d · tap a card to expand breakdown`}
            cube="canonical_pnl"
            className="xl:col-span-2"
          >
            <PnlHeadlineKpis
              current={data.periodRow}
              prior={data.priorRow}
              priorLabel={data.priorLabel}
              metrics={headlineKpis}
              cogsBreakdown={cogsBreakdown}
            />
          </ChartCard>
        )}

        {data && (
          <ChartCard
            title="P&L waterfall"
            subtitle="Gross sales → net sales → COGS → gross profit → ad spend → ops costs → net profit"
            cube="canonical_pnl"
            className="xl:col-span-2"
          >
            <PnlWaterfallChart
              steps={data.waterfallSteps}
              cogsBreakdown={cogsBreakdown}
              height={320}
            />
          </ChartCard>
        )}

        {data && (data.dailyTrend?.length ?? 0) > 0 && (
          <PnlTimeSeriesSection
            dailyRows={data.dailyTrend}
            spanDays={range.spanDays}
          />
        )}

        {data && (data.dailyTrend?.length ?? 0) > 0 && (
          <ChartCard
            title="Profit & spend trend"
            subtitle="Daily gross_profit · net_profit · ad spend"
            cube="canonical_pnl"
          >
            <TrendChart rows={data.dailyTrend} />
          </ChartCard>
        )}

        {data &&
          (data.dailyTrend?.length ?? 0) > 0 &&
          data.schema.available.includes("canonical_pnl.total_operating_cost") && (
            <ChartCard
              title="Operating cost trend"
              subtitle="Daily total_operating_cost"
              cube="canonical_pnl"
            >
              <AreaTrendChart
                rows={data.dailyTrend.map((r) => {
                  const dateKey =
                    Object.keys(r).find((k) => /report_date/i.test(k)) ?? "canonical_pnl.report_date"
                  return {
                    [dateKey]: r[dateKey],
                    "canonical_pnl.total_operating_cost": r["canonical_pnl.total_operating_cost"],
                  }
                })}
              />
            </ChartCard>
          )}

        {data && (
          <ChartCard
            title="Full P&L breakdown"
            subtitle="All audited financial line items · period vs prior"
            cube="canonical_pnl"
            className="xl:col-span-2"
          >
            <PnlBreakdownTable
              row={data.periodRow}
              priorRow={data.priorRow}
              priorLabel={data.priorLabel}
              schema={data.schema}
            />
          </ChartCard>
        )}
      </div>
    </main>
  )
}
