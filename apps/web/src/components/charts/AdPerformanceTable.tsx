"use client"

import { useEffect, useState } from "react"
import { fmtCurrency, fmtCount, fmtPct } from "./format"
import { AdPlacementBreakdown } from "./AdPlacementBreakdown"
import { AdEngagementBreakdown } from "./AdEngagementBreakdown"

const C  = "meta_neurotag_analysis"  // tag map source
const AP = "meta_ad_performance"     // ad leaderboard source

const CAT_COLORS: Record<string, string> = {
  "Emotional Triggers":                "bg-rose-500/15 text-rose-400 border-rose-500/20",
  "Cognitive Fluency":                 "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "Behavioral Economics & Nudging":    "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Social Proof & Validation":         "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Sensory Integration":               "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Memory & Recall":                   "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Temporal Manipulation":             "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Identity Manipulation":             "bg-pink-500/15 text-pink-400 border-pink-500/20",
}
function tagChipCls(cat: string) {
  return CAT_COLORS[cat] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"
}

export interface AdRow {
  ad_id: string
  ad_name: string
  campaign_name: string
  adset_name: string
  spend: number
  spend_fc: number
  impressions: number
  reach: number
  link_clicks: number
  clicks: number
  net_revenue: number
  attributed_orders: number
  new_customer_revenue: number
  add_to_cart: number
  initiate_checkout: number
  thruplay: number
  video_views_3s: number
  video_p50_views: number
  video_p75_views: number
  video_p100_views: number
  hook_rate: number
  hold_rate_p50: number
  hold_rate_p100: number
  cost_per_thruplay: number
  frequency: number
  roas_delta: number | null
  ncr_pct: number
  // derived
  roas: number
  ctr: number
  link_ctr: number
  cpa: number
  tags: { tag_code: string; hack_name: string; category_name: string }[]
}

function n(v: unknown) { const x = Number(v ?? 0); return isFinite(x) ? x : 0 }

export function parseAdLeaderboard(
  adRows: Record<string, unknown>[],
  tagMapRows: Record<string, unknown>[],
  priorAdRows: Record<string, unknown>[] = [],
  ncrMapRows: Record<string, unknown>[] = [],
): AdRow[] {
  // Build tag map: ad_id → tags[]
  const tagMap = new Map<string, { tag_code: string; hack_name: string; category_name: string }[]>()
  for (const r of tagMapRows) {
    const adId = String(r[`${C}.ad_id`] ?? "")
    const tag  = {
      tag_code:      String(r[`${C}.tag_code`] ?? ""),
      hack_name:     String(r[`${C}.hack_name`] ?? "—"),
      category_name: String(r[`${C}.category_name`] ?? "—"),
    }
    if (!adId || tag.tag_code === "__untagged__") continue
    const list = tagMap.get(adId) ?? []
    if (!list.some((t) => t.tag_code === tag.tag_code)) list.push(tag)
    tagMap.set(adId, list)
  }

  // Prior-period ROAS: ad_id → roas
  const priorRoasMap = new Map<string, number>()
  for (const r of priorAdRows) {
    const adId = String(r[`${AP}.ad_id`] ?? "")
    if (adId) priorRoasMap.set(adId, n(r[`${AP}.roas`]))
  }

  // Per-ad NCR: ad_id → { ncr, revenue } (from meta_neurotag_analysis, tagged ads only)
  const ncrMap = new Map<string, { ncr: number; revenue: number }>()
  for (const r of ncrMapRows) {
    const adId = String(r[`${C}.ad_id`] ?? "")
    if (!adId) continue
    ncrMap.set(adId, {
      ncr:     n(r[`${C}.new_customer_revenue_sc`]),
      revenue: n(r[`${C}.net_revenue_sc`]),
    })
  }

  return adRows
    .map((r) => {
      const adId        = String(r[`${AP}.ad_id`] ?? "")
      const spend       = n(r[`${AP}.spend`])
      const impressions = n(r[`${AP}.impressions`])
      const clicks      = n(r[`${AP}.clicks`])
      const link_clicks = n(r[`${AP}.link_clicks`])
      const net_revenue = n(r[`${AP}.purchase_value`])
      const orders      = n(r[`${AP}.purchases`])
      const thruplay    = n(r[`${AP}.video_thruplay_15s`])
      const hook_rate   = n(r[`${AP}.hook_rate`])
      const roas        = n(r[`${AP}.roas`])
      const frequency   = n(r[`${AP}.frequency`])
      const priorRoas   = priorRoasMap.get(adId) ?? null
      const ncr         = ncrMap.get(adId)
      return {
        ad_id: adId,
        ad_name:              String(r[`${AP}.ad_name`] ?? "—"),
        campaign_name:        String(r[`${AP}.campaign_name`] ?? "—"),
        adset_name:           String(r[`${AP}.adset_name`] ?? "—"),
        spend,
        spend_fc:             spend,
        impressions,
        reach:                n(r[`${AP}.reach`]),
        link_clicks,
        clicks,
        net_revenue,
        attributed_orders:    orders,
        new_customer_revenue: ncr?.ncr ?? 0,
        add_to_cart:          n(r[`${AP}.add_to_cart`]),
        initiate_checkout:    n(r[`${AP}.initiate_checkout`]),
        thruplay,
        video_views_3s:       n(r[`${AP}.video_views_3s`]),
        video_p50_views:      n(r[`${AP}.video_p50_views`]),
        video_p75_views:      n(r[`${AP}.video_p75_views`]),
        video_p100_views:     n(r[`${AP}.video_p100_views`]),
        hook_rate,
        hold_rate_p50:        n(r[`${AP}.hold_rate_p50`]),
        hold_rate_p100:       n(r[`${AP}.hold_rate_p100`]),
        cost_per_thruplay:    n(r[`${AP}.cost_per_thruplay`]),
        frequency,
        roas_delta:           priorRoas !== null ? roas - priorRoas : null,
        ncr_pct:              ncr && ncr.revenue > 0 ? ncr.ncr / ncr.revenue : 0,
        roas,
        ctr:        impressions > 0 ? clicks / impressions : 0,
        link_ctr:   impressions > 0 ? link_clicks / impressions : 0,
        cpa:        orders > 0 ? spend / orders : 0,
        tags: tagMap.get(adId) ?? [],
      }
    })
    .filter((r) => r.ad_id !== "")
    .sort((a, b) => b.spend - a.spend)
}

type SortKey = "spend" | "roas" | "ctr" | "hook_rate" | "cpa" | "orders" | "frequency"

interface Props {
  rows: AdRow[]
  /** When `focusNonce` changes, seed the search box with this query… */
  focusQuery?: string
  /** …and expand + scroll to this ad. */
  focusAdId?: string
  focusNonce?: number
  /** Date range + brand for the lazy per-ad placement breakdown. */
  start?: string
  end?: string
  brand?: number
}

export function AdPerformanceTable({ rows, focusQuery, focusAdId, focusNonce = 0, start, end, brand }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend")
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Respond to a search-result selection coming from the universal search.
  useEffect(() => {
    if (!focusNonce) return
    setSearch(focusQuery ?? "")
    if (focusAdId) {
      setExpanded(focusAdId)
      requestAnimationFrame(() => {
        document.getElementById(`ciq-ad-${focusAdId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1))
    else { setSortKey(key); setSortDir(1) }
  }

  const filtered = rows.filter((r) =>
    !search || r.ad_name.toLowerCase().includes(search.toLowerCase()) ||
    r.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some((t) => t.hack_name.toLowerCase().includes(search.toLowerCase()))
  )

  const sorted = [...filtered].sort((a, b) => {
    const av = Number((a as unknown as Record<string, unknown>)[sortKey] ?? 0)
    const bv = Number((b as unknown as Record<string, unknown>)[sortKey] ?? 0)
    return sortDir * (bv - av)
  })

  function hdr(key: SortKey, label: string, right = true) {
    const active = sortKey === key
    return (
      <th
        onClick={() => toggleSort(key)}
        className={`cursor-pointer select-none px-3 py-2 text-xs font-medium text-stone-400 dark:text-night-500 hover:text-stone-700 dark:hover:text-night-200 whitespace-nowrap ${right ? "text-right" : "text-left"}`}
      >
        {label}{active ? (sortDir === 1 ? " ↓" : " ↑") : ""}
      </th>
    )
  }

  const tagged   = rows.filter((r) => r.tags.length > 0).length
  const untagged = rows.length - tagged

  return (
    <div className="space-y-3">
      {/* Summary + search */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500 dark:text-night-500">
          {rows.length} ads · {tagged} tagged · {untagged} untagged
        </p>
        <input
          type="search"
          placeholder="Search ad / campaign / tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-lg border border-stone-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-1.5 text-xs text-stone-800 dark:text-night-100 placeholder:text-stone-400 dark:placeholder:text-night-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900">
              <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500 min-w-[220px]">
                Ad · Campaign
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500 min-w-[140px]">
                Tags
              </th>
              {hdr("spend",     "Spend")}
              {hdr("frequency", "Freq")}
              {hdr("hook_rate", "Hook %")}
              {hdr("ctr",       "CTR")}
              {hdr("roas",      "ROAS")}
              <th className="px-3 py-2 text-right text-xs font-medium text-stone-400 dark:text-night-500 whitespace-nowrap">ROAS Δ</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-stone-400 dark:text-night-500 whitespace-nowrap">NCR %</th>
              {hdr("orders",    "Orders")}
              {hdr("cpa",       "CPA")}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ad) => {
              const isExpanded = expanded === ad.ad_id
              return (
                <>
                  <tr
                    key={ad.ad_id}
                    id={`ciq-ad-${ad.ad_id}`}
                    onClick={() => setExpanded(isExpanded ? null : ad.ad_id)}
                    className={`border-b border-stone-100 dark:border-night-850 cursor-pointer transition-colors ${
                      isExpanded
                        ? "bg-stone-100 dark:bg-night-850"
                        : "hover:bg-stone-50 dark:hover:bg-night-875"
                    }`}
                  >
                    {/* Ad name + campaign */}
                    <td className="px-3 py-2">
                      <p className="font-medium text-stone-800 dark:text-night-100 truncate max-w-[220px]" title={ad.ad_name}>
                        {ad.ad_name}
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-night-600 truncate max-w-[220px]" title={ad.campaign_name}>
                        {ad.campaign_name}
                      </p>
                    </td>

                    {/* Tag chips */}
                    <td className="px-3 py-2">
                      {ad.tags.length === 0 ? (
                        <span className="text-[10px] text-stone-400 dark:text-night-600 italic">untagged</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {ad.tags.slice(0, 3).map((t) => (
                            <span
                              key={t.tag_code}
                              title={`${t.hack_name} · ${t.category_name}`}
                              className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-medium ${tagChipCls(t.category_name)}`}
                            >
                              {t.tag_code}
                            </span>
                          ))}
                          {ad.tags.length > 3 && (
                            <span className="text-[9px] text-stone-400 dark:text-night-600 self-center">
                              +{ad.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Metrics */}
                    <td className="px-3 py-2 text-right tabular-nums text-stone-700 dark:text-night-200">
                      {fmtCurrency(ad.spend)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums text-xs ${
                      ad.frequency > 3.5 ? "text-red-400 font-medium" : ad.frequency > 2 ? "text-amber-400" : "text-stone-500 dark:text-night-400"
                    }`}>
                      {ad.frequency > 0 ? ad.frequency.toFixed(1) : "—"}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-medium ${
                      ad.hook_rate >= 20 ? "text-emerald-500" : ad.hook_rate >= 10 ? "text-stone-700 dark:text-night-200" : "text-stone-400 dark:text-night-600"
                    }`}>
                      {ad.hook_rate > 0 ? `${ad.hook_rate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {fmtPct(ad.ctr * 100)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-medium ${
                      ad.roas >= 2.5 ? "text-emerald-500" : ad.roas >= 1.5 ? "text-stone-700 dark:text-night-200" : "text-red-400"
                    }`}>
                      {ad.roas.toFixed(2)}×
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums text-xs ${
                      ad.roas_delta === null ? "text-stone-400 dark:text-night-700" :
                      ad.roas_delta > 0 ? "text-emerald-500" : "text-red-400"
                    }`}>
                      {ad.roas_delta === null ? "—" :
                        `${ad.roas_delta > 0 ? "▲" : "▼"} ${Math.abs(ad.roas_delta).toFixed(2)}×`}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums text-xs ${
                      ad.ncr_pct > 0.6 ? "text-emerald-500" : ad.ncr_pct > 0.3 ? "text-stone-600 dark:text-night-300" : "text-stone-400 dark:text-night-600"
                    }`}>
                      {ad.ncr_pct > 0 ? `${(ad.ncr_pct * 100).toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {fmtCount(ad.attributed_orders)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {ad.cpa > 0 ? fmtCurrency(ad.cpa) : "—"}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${ad.ad_id}-expanded`} className="bg-stone-50 dark:bg-night-900 border-b border-stone-100 dark:border-night-850">
                      <td colSpan={11} className="px-3 py-3">
                        <div className="flex gap-6">
                          {/* Tags */}
                          <div className="w-48 shrink-0">
                            <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 mb-1.5 uppercase tracking-wide">
                              Neuro Tags ({ad.tags.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {ad.tags.map((t) => (
                                <div
                                  key={t.tag_code}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] ${tagChipCls(t.category_name)}`}
                                >
                                  <span className="font-mono font-medium">{t.tag_code}</span>
                                  <span className="opacity-75">· {t.hack_name}</span>
                                </div>
                              ))}
                              {ad.tags.length === 0 && (
                                <span className="text-stone-400 dark:text-night-600 text-xs italic">No tags mapped</span>
                              )}
                            </div>
                          </div>

                          {/* Video funnel */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 mb-2 uppercase tracking-wide">
                              Video Funnel
                            </p>
                            <VideoFunnel ad={ad} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Engagement context (age/gender, publisher, device) */}
                  {isExpanded && start && end && brand !== undefined && (
                    <tr key={`${ad.ad_id}-engagement`} className="bg-stone-50 dark:bg-night-900 border-b border-stone-100 dark:border-night-850">
                      <td colSpan={11} className="px-3 pb-3 pt-2 align-top">
                        <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 mb-1.5 uppercase tracking-wide">
                          Audience &amp; Platform Context
                        </p>
                        <AdEngagementBreakdown adId={ad.ad_id} start={start} end={end} brand={brand} />
                      </td>
                    </tr>
                  )}

                  {/* Per-ad placement breakdown */}
                  {isExpanded && start && end && brand !== undefined && (
                    <tr key={`${ad.ad_id}-placement`} className="bg-stone-50 dark:bg-night-900 border-b border-stone-100 dark:border-night-850">
                      <td colSpan={11} className="px-3 pb-3 align-top">
                        <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 mb-1.5 uppercase tracking-wide">
                          Placement &amp; Platform
                        </p>
                        <AdPlacementBreakdown adId={ad.ad_id} start={start} end={end} brand={brand} />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-sm text-stone-400 dark:text-night-600">
                  No ads match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Video funnel mini-chart ──────────────────────────────────────────────────

function VideoFunnel({ ad }: { ad: AdRow }) {
  const steps = [
    { label: "3s Views",   count: ad.video_views_3s,  pct: ad.impressions > 0 ? ad.video_views_3s  / ad.impressions : 0 },
    { label: "Thruplay",   count: ad.thruplay,         pct: ad.impressions > 0 ? ad.thruplay         / ad.impressions : 0 },
    { label: "50% View",   count: ad.video_p50_views,  pct: ad.impressions > 0 ? ad.video_p50_views  / ad.impressions : 0 },
    { label: "75% View",   count: ad.video_p75_views,  pct: ad.impressions > 0 ? ad.video_p75_views  / ad.impressions : 0 },
    { label: "Completion", count: ad.video_p100_views, pct: ad.impressions > 0 ? ad.video_p100_views / ad.impressions : 0 },
  ].filter((s) => s.count > 0)

  const maxPct = Math.max(...steps.map((s) => s.pct), 0.001)

  const kpis = [
    { label: "Hook Rate",     value: ad.hook_rate > 0     ? `${ad.hook_rate.toFixed(1)}%`     : "—", hi: ad.hook_rate >= 20 },
    { label: "50% Hold",      value: ad.hold_rate_p50 > 0 ? `${ad.hold_rate_p50.toFixed(1)}%` : "—", hi: false },
    { label: "Completion",    value: ad.hold_rate_p100 > 0 ? `${ad.hold_rate_p100.toFixed(1)}%` : "—", hi: false },
    { label: "₹/Thruplay",   value: ad.cost_per_thruplay > 0 ? fmtCurrency(ad.cost_per_thruplay) : "—", hi: false },
    { label: "ATC",           value: ad.add_to_cart > 0  ? fmtCount(ad.add_to_cart)          : "—", hi: false },
    { label: "Checkout",      value: ad.initiate_checkout > 0 ? fmtCount(ad.initiate_checkout) : "—", hi: false },
    { label: "Purchase Value", value: fmtCurrency(ad.net_revenue), hi: false },
    { label: "ROAS",          value: `${ad.roas.toFixed(2)}×`, hi: ad.roas >= 2.5 },
  ]

  return (
    <div className="space-y-3">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-2">
        {kpis.map((k) => (
          <div key={k.label} className="min-w-0">
            <p className="text-[9px] text-stone-400 dark:text-night-600 uppercase tracking-wide">{k.label}</p>
            <p className={`text-xs font-semibold tabular-nums ${k.hi ? "text-emerald-500" : "text-stone-700 dark:text-night-200"}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Funnel bars */}
      {steps.length > 0 && (
        <div className="space-y-1">
          {/* Header row */}
          <div className="flex items-center gap-2 pb-0.5">
            <span className="text-[9px] text-stone-400 dark:text-night-600 w-16 text-right">
              Impr {fmtCount(ad.impressions)}
            </span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-night-800" />
            <span className="text-[9px] text-stone-400 dark:text-night-600 w-10 text-right">% impr</span>
            <span className="text-[9px] text-stone-400 dark:text-night-600 w-10 text-right">count</span>
          </div>
          {steps.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[9px] text-stone-400 dark:text-night-600 w-16 text-right whitespace-nowrap">
                {s.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-night-800">
                <div
                  className="h-2 rounded-full bg-indigo-500/60"
                  style={{ width: `${(s.pct / maxPct) * 100}%` }}
                />
              </div>
              <span className="text-[9px] tabular-nums text-stone-500 dark:text-night-400 w-10 text-right">
                {(s.pct * 100).toFixed(1)}%
              </span>
              <span className="text-[9px] tabular-nums text-stone-400 dark:text-night-600 w-10 text-right">
                {fmtCount(s.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
