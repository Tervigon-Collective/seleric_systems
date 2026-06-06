"use client"

import { useState } from "react"
import { fmtCurrency, fmtCount, fmtPct } from "./format"

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
  link_clicks: number
  clicks: number
  net_revenue: number
  attributed_orders: number
  new_customer_revenue: number
  thruplay: number
  hook_rate: number
  hold_rate_p100: number
  cost_per_thruplay: number
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
): AdRow[] {
  // Build tag map from meta_neurotag_analysis rows: ad_id → tags[]
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

  // adRows come from meta_ad_performance (already deduplicated at ad grain by cube)
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
      return {
        ad_id: adId,
        ad_name:              String(r[`${AP}.ad_name`] ?? "—"),
        campaign_name:        String(r[`${AP}.campaign_name`] ?? "—"),
        adset_name:           String(r[`${AP}.adset_name`] ?? "—"),
        spend,
        spend_fc:             spend,
        impressions,
        link_clicks,
        clicks,
        net_revenue,
        attributed_orders:    orders,
        new_customer_revenue: 0,
        thruplay,
        hook_rate,
        hold_rate_p100:       n(r[`${AP}.hold_rate_p100`]),
        cost_per_thruplay:    n(r[`${AP}.cost_per_thruplay`]),
        roas:       n(r[`${AP}.roas`]),
        ctr:        impressions > 0 ? clicks / impressions : 0,
        link_ctr:   impressions > 0 ? link_clicks / impressions : 0,
        cpa:        orders > 0 ? spend / orders : 0,
        tags: tagMap.get(adId) ?? [],
      }
    })
    .filter((r) => r.ad_id !== "")
    .sort((a, b) => b.spend - a.spend)
}

type SortKey = "spend" | "roas" | "ctr" | "hook_rate" | "cpa" | "orders"

interface Props {
  rows: AdRow[]
}

export function AdPerformanceTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("spend")
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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
              {hdr("hook_rate", "Hook %")}
              {hdr("ctr",       "CTR")}
              {hdr("roas",      "ROAS")}
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
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {fmtCount(ad.attributed_orders)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {ad.cpa > 0 ? fmtCurrency(ad.cpa) : "—"}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${ad.ad_id}-expanded`} className="bg-stone-50 dark:bg-night-900 border-b border-stone-100 dark:border-night-850">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Full tag list */}
                          <div>
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

                          {/* Video metrics */}
                          <div>
                            <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 mb-1.5 uppercase tracking-wide">
                              Video Performance
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { label: "Hook Rate",    value: ad.hook_rate > 0 ? `${ad.hook_rate.toFixed(1)}%` : "—" },
                                { label: "Completion",   value: ad.hold_rate_p100 > 0 ? `${ad.hold_rate_p100.toFixed(1)}%` : "—" },
                                { label: "Thruplay",     value: fmtCount(ad.thruplay) },
                                { label: "₹/Thruplay",  value: ad.cost_per_thruplay > 0 ? fmtCurrency(ad.cost_per_thruplay) : "—" },
                              ].map((m) => (
                                <div key={m.label}>
                                  <p className="text-[9px] text-stone-400 dark:text-night-600 uppercase tracking-wide">{m.label}</p>
                                  <p className="text-xs font-semibold text-stone-700 dark:text-night-200">{m.value}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {[
                                { label: "Link Clicks",    value: fmtCount(ad.link_clicks) },
                                { label: "Purchase Value", value: fmtCurrency(ad.net_revenue) },
                                { label: "ROAS",           value: `${ad.roas.toFixed(2)}×` },
                              ].map((m) => (
                                <div key={m.label}>
                                  <p className="text-[9px] text-stone-400 dark:text-night-600 uppercase tracking-wide">{m.label}</p>
                                  <p className="text-xs font-semibold text-stone-700 dark:text-night-200">{m.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-stone-400 dark:text-night-600">
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
