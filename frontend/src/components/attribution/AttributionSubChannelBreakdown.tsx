import { ChartCard } from "@/components/charts/ChartCard"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type {
  MetaPlatformRow,
  MetaPlacementRow,
  GoogleNetworkRow,
  GoogleDeviceRow,
} from "@/lib/dashboard/queries/attribution"

function pct(part: number, total: number): string {
  if (total === 0) return "—"
  return `${((part / total) * 100).toFixed(1)}%`
}

function SpendBar({ share }: { share: number }) {
  return (
    <div className="w-16 h-1.5 rounded-full bg-slate-700 dark:bg-night-700 overflow-hidden">
      <div
        className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
        style={{ width: `${Math.min(share * 100, 100)}%` }}
      />
    </div>
  )
}

function labelPlatform(s: string): string {
  const map: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    audience_network: "Audience Network",
    threads: "Threads",
    unknown: "Unknown",
  }
  return map[s] ?? s
}

function labelPosition(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function labelNetwork(s: string): string {
  const map: Record<string, string> = {
    SEARCH: "Search",
    CONTENT: "Display",
    DISCOVER: "Discover",
    YOUTUBE: "YouTube",
    GMAIL: "Gmail",
    SEARCH_PARTNERS: "Search Partners",
  }
  return map[s] ?? s
}

function labelDevice(s: string): string {
  const map: Record<string, string> = {
    MOBILE: "Mobile",
    DESKTOP: "Desktop",
    TABLET: "Tablet",
    CONNECTED_TV: "Connected TV",
    OTHER: "Other",
  }
  return map[s] ?? s
}

const thCls =
  "border-b border-slate-800 dark:border-night-800 bg-slate-900 dark:bg-night-875 px-2.5 py-2 text-left text-slate-400 dark:text-night-400 font-medium whitespace-nowrap text-xs"
const tdCls = "px-2.5 py-1.5 text-slate-300 dark:text-night-200 whitespace-nowrap text-xs"
const trCls =
  "border-b border-slate-800/40 dark:border-night-800/40 hover:bg-slate-800/20 dark:hover:bg-night-850/30"

function MetaPlatformTable({ rows }: { rows: MetaPlatformRow[] }) {
  const total = rows.reduce((s, r) => s + r.spend, 0)
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 dark:border-night-800">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Platform</th>
            <th className={thCls}>Spend</th>
            <th className={thCls}>Share</th>
            <th className={thCls}>Impressions</th>
            <th className={thCls}>Clicks</th>
            <th className={thCls}>Purchases</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.publisher_platform} className={trCls}>
              <td className={tdCls}>{labelPlatform(r.publisher_platform)}</td>
              <td className={tdCls}>{fmtCurrency(r.spend)}</td>
              <td className={tdCls}>
                <div className="flex items-center gap-2">
                  <SpendBar share={r.spend / total} />
                  <span className="text-slate-400 dark:text-night-400 tabular-nums">
                    {pct(r.spend, total)}
                  </span>
                </div>
              </td>
              <td className={tdCls}>{fmtCount(r.impressions)}</td>
              <td className={tdCls}>{fmtCount(r.clicks)}</td>
              <td className={tdCls}>{r.purchases > 0 ? fmtCount(r.purchases) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetaPlacementTable({ rows }: { rows: MetaPlacementRow[] }) {
  const total = rows.reduce((s, r) => s + r.spend, 0)
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 dark:border-night-800">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Publisher</th>
            <th className={thCls}>Placement</th>
            <th className={thCls}>Spend</th>
            <th className={thCls}>Share</th>
            <th className={thCls}>Clicks</th>
            <th className={thCls}>Purchases</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.publisher_platform}__${r.platform_position}`} className={trCls}>
              <td className={tdCls}>
                <span className="text-slate-400 dark:text-night-500">
                  {labelPlatform(r.publisher_platform)}
                </span>
              </td>
              <td className={tdCls}>{labelPosition(r.platform_position)}</td>
              <td className={tdCls}>{fmtCurrency(r.spend)}</td>
              <td className={tdCls}>
                <div className="flex items-center gap-2">
                  <SpendBar share={r.spend / total} />
                  <span className="text-slate-400 dark:text-night-400 tabular-nums">
                    {pct(r.spend, total)}
                  </span>
                </div>
              </td>
              <td className={tdCls}>{fmtCount(r.clicks)}</td>
              <td className={tdCls}>{r.purchases > 0 ? fmtCount(r.purchases) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GoogleBreakdownTable({
  rows,
  labelKey,
  labelFn,
}: {
  rows: (GoogleNetworkRow | GoogleDeviceRow)[]
  labelKey: "network" | "device"
  labelFn: (s: string) => string
}) {
  const total = rows.reduce((s, r) => s + r.spend, 0)
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 dark:border-night-800">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>{labelKey === "network" ? "Network" : "Device"}</th>
            <th className={thCls}>Spend</th>
            <th className={thCls}>Share</th>
            <th className={thCls}>ROAS</th>
            <th className={thCls}>Conversions</th>
            <th className={thCls}>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const key = (r as unknown as Record<string, unknown>)[labelKey] as string
            return (
              <tr key={key} className={trCls}>
                <td className={tdCls}>{labelFn(key)}</td>
                <td className={tdCls}>{fmtCurrency(r.spend)}</td>
                <td className={tdCls}>
                  <div className="flex items-center gap-2">
                    <SpendBar share={r.spend / total} />
                    <span className="text-slate-400 dark:text-night-400 tabular-nums">
                      {pct(r.spend, total)}
                    </span>
                  </div>
                </td>
                <td className={tdCls}>{r.roas > 0 ? `${r.roas.toFixed(2)}x` : "—"}</td>
                <td className={tdCls}>{r.conversions > 0 ? r.conversions.toFixed(1) : "—"}</td>
                <td className={tdCls}>{fmtCount(r.clicks)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface Props {
  metaPlatform: MetaPlatformRow[]
  metaPlacement: MetaPlacementRow[]
  googleNetwork: GoogleNetworkRow[]
  googleDevice: GoogleDeviceRow[]
}

export function AttributionSubChannelBreakdown({
  metaPlatform,
  metaPlacement,
  googleNetwork,
  googleDevice,
}: Props) {
  if (
    metaPlatform.length === 0 &&
    metaPlacement.length === 0 &&
    googleNetwork.length === 0 &&
    googleDevice.length === 0
  ) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 dark:text-night-200 tracking-wide uppercase">
        Sub-channel Breakdown · Spend
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {metaPlatform.length > 0 && (
          <ChartCard
            title="Meta · by Publisher Platform"
            subtitle="Spend split across Facebook / Instagram / Audience Network · fct_meta_ads_breakdown_daily"
            cube="meta_ad_breakdown"
          >
            <MetaPlatformTable rows={metaPlatform} />
          </ChartCard>
        )}

        {metaPlacement.length > 0 && (
          <ChartCard
            title="Meta · by Placement"
            subtitle="Spend split by publisher × placement (Feed, Reels, Stories…) · fct_meta_ads_breakdown_daily"
            cube="meta_ad_breakdown"
          >
            <MetaPlacementTable rows={metaPlacement} />
          </ChartCard>
        )}

        {googleNetwork.length > 0 && (
          <ChartCard
            title="Google · by Network"
            subtitle="Spend split across Search / Display / YouTube / Discover · fct_google_ads_daily"
            cube="google_ad_performance"
          >
            <GoogleBreakdownTable
              rows={googleNetwork}
              labelKey="network"
              labelFn={labelNetwork}
            />
          </ChartCard>
        )}

        {googleDevice.length > 0 && (
          <ChartCard
            title="Google · by Device"
            subtitle="Spend split across Mobile / Desktop / Tablet · fct_google_ads_daily"
            cube="google_ad_performance"
          >
            <GoogleBreakdownTable
              rows={googleDevice}
              labelKey="device"
              labelFn={labelDevice}
            />
          </ChartCard>
        )}
      </div>
    </div>
  )
}
