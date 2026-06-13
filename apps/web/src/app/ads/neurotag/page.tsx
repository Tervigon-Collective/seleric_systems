import { CreativeIQTabs } from "@/components/charts/CreativeIQTabs"
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls"
import { brandLabel, parseDashboardBrandFilter } from "@/lib/dashboard/brand-filter"
import { dateRangeLabel, parseDashboardDateRange, type DashboardSearchParams } from "@/lib/dashboard/date-ranges"
import { parseTagRows, scoreTags } from "@/lib/dashboard/neurotag-scorer"
import { fetchNeurotagData } from "@/lib/dashboard/queries/neurotag"
import { fetchAdFunnelData, type AdFunnelData } from "@/lib/dashboard/queries/ad-funnel"
import { fetchICPData, type ICPData } from "@/lib/dashboard/queries/icp"
import { DomainChatRegistrar } from "@/components/chat/DomainChatRegistrar"
import { buildCreativeIqContext } from "@/lib/chat/domain-context"

export const revalidate = 300

export default async function NeuroTagPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams
}) {
  const range      = parseDashboardDateRange(searchParams)
  const brand      = parseDashboardBrandFilter(searchParams)
  const rangeLabel = dateRangeLabel(range)
  const brandText  = brandLabel(brand)

  let data
  let adFunnel: AdFunnelData | null = null
  let icpData: ICPData | null = null
  let error: string | null = null
  try {
    ;[data, adFunnel, icpData] = await Promise.all([
      fetchNeurotagData(range, brand),
      fetchAdFunnelData(range, brand),
      fetchICPData(range, brand),
    ])
  } catch (e) {
    error = String(e)
    data  = null
  }

  const rawTags      = data?.tagLeaderboard ?? []
  const parsed       = parseTagRows(rawTags)
  const scoredTags   = scoreTags(parsed)
  const misleading   = scoredTags.filter((t) => t.classification === "misleading_hook")

  return (
    <main className="p-6 space-y-6">
      <DomainChatRegistrar
        context={buildCreativeIqContext(scoredTags, adFunnel, range, brand)}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-night-50">
            Creative IQ — Neuro Tag Analysis
          </h1>
          <p className="text-sm text-stone-500 dark:text-night-500 mt-1">
            Ad funnel · per-stage winners & neuro-tag attribution · {brandText} · {rangeLabel}
          </p>
          {error && (
            <p className="mt-2 text-sm text-amber-400">
              Cube unavailable — data may be empty. Check CUBE_API_URL / SELERIC_API_KEY.
            </p>
          )}
        </div>
        <DashboardFilterControls
          start={range.start}
          end={range.end}
          spanDays={range.spanDays}
          searchParams={searchParams}
        />
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Ads scored",
            value: scoredTags.filter((t) => t.classification !== "needs_more_data").length,
            sub:   `of ${scoredTags.length} unique ads active this period`,
          },
          {
            label: "Strong winners",
            value: scoredTags.filter((t) => t.classification === "strong_winner").length,
            sub:   "ROAS ≥ 2.5× & CTR ≥ 2.5%",
          },
          {
            label: "Misleading hooks",
            value: misleading.length,
            sub:   "high CTR · low ROAS",
            warn:  misleading.length > 0,
          },
          {
            label: "Converters",
            value: scoredTags.filter((t) => t.classification === "conversion_winner").length,
            sub:   "low CTR · high ROAS",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-stone-200 dark:border-night-800 bg-white dark:bg-night-900 p-4 shadow-sm dark:shadow-none"
          >
            <p className="text-xs text-stone-500 dark:text-night-500">{kpi.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${kpi.warn ? "text-red-400" : "text-stone-900 dark:text-night-50"}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-stone-400 dark:text-night-600 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabbed content */}
      <CreativeIQTabs
        scoredTags={scoredTags}
        misleadingHooks={misleading}
        categoryBreakdown={data?.categoryBreakdown ?? []}
        spendTrend={data?.spendTrend ?? []}
        adLeaderboard={data?.adLeaderboard ?? []}
        adTagMap={data?.adTagMap ?? []}
        adNcrMap={data?.adNcrMap ?? []}
        priorAdLeaderboard={data?.priorAdLeaderboard ?? []}
        funnelAdRows={adFunnel?.adRows ?? []}
        funnelTotals={adFunnel?.funnelTotals ?? []}
        funnelTagMap={adFunnel?.adTagMap ?? []}
        funnelCategoryStage={adFunnel?.categoryStage ?? []}
        funnelAdAttribution={adFunnel?.adAttribution ?? []}
        icpData={icpData ?? { ageGender: [], device: [], region: [], placement: [], metaBuyer: [], topProducts: [] }}
        start={range.start}
        end={range.end}
        brand={brand.id}
      />
    </main>
  )
}
