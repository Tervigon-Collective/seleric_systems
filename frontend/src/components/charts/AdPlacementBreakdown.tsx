"use client"

import { useEffect, useState } from "react"
import { fmtCurrency, fmtCount, fmtPct } from "./format"

const G = "gold__fct_meta_ads_breakdown_daily"

// Publisher platform → chip colour.
const PLATFORM_CLS: Record<string, string> = {
  instagram:        "bg-pink-500/15 text-pink-400 border-pink-500/20",
  facebook:         "bg-blue-500/15 text-blue-400 border-blue-500/20",
  audience_network: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  messenger:        "bg-sky-500/15 text-sky-400 border-sky-500/20",
  threads:          "bg-stone-500/15 text-stone-400 border-stone-500/20",
}
function platformCls(p: string) {
  return PLATFORM_CLS[p] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"
}
function humanize(s: string) {
  if (!s || s === "unknown") return "Unknown"
  return s
    .replace(/_/g, " ")
    .replace(/\ban\b/gi, "AN")
    .replace(/\bdma\b/gi, "DMA")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface PlacementRow {
  position: string
  platform: string
  spend: number
  impressions: number
  clicks: number
  purchases: number
  views3s: number
  thruplay: number
  ctr: number
  hookRate: number
  cpa: number
}

function n(v: unknown) { const x = Number(v ?? 0); return isFinite(x) ? x : 0 }

function parseRows(rows: Record<string, unknown>[]): PlacementRow[] {
  return rows
    .map((r) => {
      const spend = n(r[`${G}.spend`])
      const impressions = n(r[`${G}.impressions`])
      const clicks = n(r[`${G}.clicks`])
      const purchases = n(r[`${G}.purchases`])
      const views3s = n(r[`${G}.video_views_3s`])
      const thruplay = n(r[`${G}.video_thruplay_15s`])
      return {
        position: String(r[`${G}.platform_position`] ?? "unknown"),
        platform: String(r[`${G}.publisher_platform`] ?? "unknown"),
        spend,
        impressions,
        clicks,
        purchases,
        views3s,
        thruplay,
        ctr: impressions > 0 ? clicks / impressions : 0,
        hookRate: impressions > 0 ? views3s / impressions : 0,
        cpa: purchases > 0 ? spend / purchases : 0,
      }
    })
    .sort((a, b) => b.spend - a.spend)
}

interface Props {
  adId: string
  start: string
  end: string
  brand: number
}

export function AdPlacementBreakdown({ adId, start, end, brand }: Props) {
  const [rows, setRows] = useState<PlacementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    const url = `/api/ads/placement?ad_id=${encodeURIComponent(adId)}&start=${start}&end=${end}&brand=${brand}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setRows(parseRows(data.rows ?? []))
        if (data.error) setErr(data.error)
      })
      .catch((e) => !cancelled && setErr(String(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [adId, start, end, brand])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-night-600 py-2">
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading placements…
      </div>
    )
  }

  if (err) return <p className="text-[11px] text-amber-400 py-1">Failed to load placements: {err}</p>
  if (rows.length === 0) {
    return <p className="text-[11px] text-stone-400 dark:text-night-600 py-1 italic">No placement breakdown for this ad in the selected period.</p>
  }

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0)

  // Best format: placement with lowest CPA (where purchases > 0), else highest CTR
  const avgCpa = totalSpend > 0 && rows.reduce((s, r) => s + r.purchases, 0) > 0
    ? totalSpend / rows.reduce((s, r) => s + r.purchases, 0)
    : 0
  const rowsWithPurchases = rows.filter((r) => r.purchases > 0 && r.cpa > 0)
  const bestFormat = rowsWithPurchases.length > 0
    ? rowsWithPurchases.reduce((best, r) => r.cpa < best.cpa ? r : best)
    : rows.reduce((best, r) => r.ctr > best.ctr ? r : best)

  // Platform rollup (sum placements by publisher_platform).
  const byPlatform = new Map<string, number>()
  for (const r of rows) byPlatform.set(r.platform, (byPlatform.get(r.platform) ?? 0) + r.spend)
  const platformRollup = [...byPlatform.entries()].sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-2">
      {/* Best format badge */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-stone-400 dark:text-night-600">Best format:</span>
        <span className="font-medium text-emerald-500">
          {humanize(bestFormat.platform)} {humanize(bestFormat.position)}
        </span>
        {rowsWithPurchases.length > 0 && avgCpa > 0 ? (
          <span className="text-stone-400 dark:text-night-600 tabular-nums">
            {fmtCurrency(bestFormat.cpa)} CPA vs {fmtCurrency(avgCpa)} avg
          </span>
        ) : (
          <span className="text-stone-400 dark:text-night-600 tabular-nums">
            {fmtPct(bestFormat.ctr * 100)} CTR
          </span>
        )}
      </div>

      {/* Platform rollup chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {platformRollup.map(([platform, spend]) => (
          <span
            key={platform}
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${platformCls(platform)}`}
          >
            {humanize(platform)}
            <span className="opacity-70 tabular-nums">{totalSpend > 0 ? `${((spend / totalSpend) * 100).toFixed(0)}%` : "—"}</span>
          </span>
        ))}
      </div>

      {/* Per-placement table */}
      <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900 text-stone-400 dark:text-night-500">
              <th className="px-2.5 py-1.5 text-left font-medium min-w-[150px]">Placement</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Spend</th>
              <th className="px-2.5 py-1.5 text-left font-medium w-24">% of ad</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Impr</th>
              <th className="px-2.5 py-1.5 text-right font-medium">CTR</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Hook %</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Thruplay</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Orders</th>
              <th className="px-2.5 py-1.5 text-right font-medium">CPA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = totalSpend > 0 ? (r.spend / totalSpend) * 100 : 0
              return (
                <tr key={`${r.platform}:${r.position}`} className="border-b border-stone-100 dark:border-night-850 last:border-0">
                  <td className="px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block rounded border px-1 py-0.5 text-[9px] font-medium ${platformCls(r.platform)}`}>
                        {humanize(r.platform)}
                      </span>
                      <span className="text-stone-700 dark:text-night-200">{humanize(r.position)}</span>
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-700 dark:text-night-200">{fmtCurrency(r.spend)}</td>
                  <td className="px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1 flex-1 rounded-full bg-stone-200 dark:bg-night-800">
                        <span className="block h-1 rounded-full bg-indigo-500/60" style={{ width: `${Math.min(100, pct)}%` }} />
                      </span>
                      <span className="w-7 text-right text-[9px] tabular-nums text-stone-400 dark:text-night-600">{pct.toFixed(0)}%</span>
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">{fmtCount(r.impressions)}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">{fmtPct(r.ctr * 100)}</td>
                  <td className={`px-2.5 py-1.5 text-right tabular-nums ${r.hookRate * 100 >= 20 ? "text-emerald-500 font-medium" : "text-stone-500 dark:text-night-400"}`}>
                    {r.views3s > 0 ? fmtPct(r.hookRate * 100) : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">{fmtCount(r.thruplay)}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">{fmtCount(r.purchases)}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">{r.cpa > 0 ? fmtCurrency(r.cpa) : "—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-stone-400 dark:text-night-600">
        Placement spend Σ {fmtCurrency(totalSpend)} · pixel purchases · no revenue/ROAS at placement grain
      </p>
    </div>
  )
}
