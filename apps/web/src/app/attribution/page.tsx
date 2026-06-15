import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls"
import { brandLabel, parseDashboardBrandFilter } from "@/lib/dashboard/brand-filter"
import { dateRangeLabel, parseDashboardDateRange, type DashboardSearchParams } from "@/lib/dashboard/date-ranges"
import { AttributionViewTabs } from "@/components/attribution/AttributionViewTabs"
import { AttributionChannelFilter } from "@/components/attribution/AttributionChannelFilter"
import { AttributionChannelView } from "@/components/attribution/AttributionChannelView"
import { AttributionCampaignView } from "@/components/attribution/AttributionCampaignView"
import { AttributionAdView } from "@/components/attribution/AttributionAdView"
import { AttributionSkuView } from "@/components/attribution/AttributionSkuView"
import { AttributionOrdersView } from "@/components/attribution/AttributionOrdersView"
import {
  fetchAttributionChannel,
  fetchAttributionCampaigns,
  fetchAttributionAds,
  fetchAttributionSkus,
  fetchAttributionOrders,
  type AttributionChannel,
} from "@/lib/dashboard/queries/attribution"

export const revalidate = 60

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

const VALID_VIEWS = ["channel", "campaign", "ad", "sku", "orders"] as const
type ViewId = (typeof VALID_VIEWS)[number]

function parseView(raw: string | undefined): ViewId {
  if (raw && (VALID_VIEWS as readonly string[]).includes(raw)) return raw as ViewId
  return "channel"
}

function parseChannel(raw: string | undefined): AttributionChannel {
  if (raw === "meta" || raw === "google" || raw === "organic") return raw
  return "all"
}

export default async function AttributionPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams
}) {
  const range = parseDashboardDateRange(searchParams)
  const brand = parseDashboardBrandFilter(searchParams)
  const view = parseView(firstParam(searchParams?.view))
  const channel = parseChannel(firstParam(searchParams?.channel))
  const rangeLabel = dateRangeLabel(range)
  const brandText = brandLabel(brand)

  const showChannelFilter = view === "campaign" || view === "orders"

  let content: React.ReactNode
  let error: string | null = null

  try {
    if (view === "channel") {
      const data = await fetchAttributionChannel(range, brand)
      content = <AttributionChannelView data={data} searchParams={searchParams} />
    } else if (view === "campaign") {
      const data = await fetchAttributionCampaigns(range, brand, channel)
      content = <AttributionCampaignView data={data} channel={channel} />
    } else if (view === "ad") {
      const data = await fetchAttributionAds(range, brand)
      content = <AttributionAdView data={data} />
    } else if (view === "sku") {
      const data = await fetchAttributionSkus(range, brand)
      content = <AttributionSkuView data={data} />
    } else {
      const data = await fetchAttributionOrders(range, brand, channel)
      content = <AttributionOrdersView data={data} />
    }
  } catch (e) {
    error = String(e)
    content = null
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-night-50">Attribution</h1>
          <p className="text-sm text-stone-500 dark:text-night-500 mt-1">
            Multi-channel attribution · {brandText} · {rangeLabel} · last-touch model
          </p>
          {error && (
            <p className="mt-2 text-sm text-amber-400">
              Data unavailable — check Cube connection. {error}
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

      <div className="flex flex-wrap items-center gap-3">
        <AttributionViewTabs activeView={view} searchParams={searchParams} />
        {showChannelFilter && (
          <AttributionChannelFilter activeChannel={channel} searchParams={searchParams} />
        )}
      </div>

      {content}
    </main>
  )
}
