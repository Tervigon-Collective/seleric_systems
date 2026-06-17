"use client"

import { useEffect, useState } from "react"
import type { ScoredTag, SignalClass } from "@/lib/dashboard/neurotag-scorer"
import { fmtCurrency, fmtCount, fmtPct } from "./format"

const C = "meta_neurotag_analysis"

const BADGE: Record<SignalClass, { label: string; cls: string }> = {
  strong_winner:       { label: "Strong",    cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  conversion_winner:   { label: "Converter", cls: "bg-teal-500/15 text-teal-400 border border-teal-500/30" },
  creative_hook_winner:{ label: "Hook",      cls: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  misleading_hook:     { label: "Mislead",   cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
  weak_attention:      { label: "Weak",      cls: "bg-stone-500/15 text-stone-400 border border-stone-500/30" },
  needs_more_data:     { label: "Data?",     cls: "bg-slate-700/30 text-slate-500 border border-slate-600/20" },
}

type SortKey = "score" | "spend" | "roas" | "ctr" | "cpa" | "hook_rate"

interface AdRow {
  ad_id: string
  ad_name: string
  campaign_name: string
  adset_name: string
  spend_sc: number
  spend_fc: number
  net_revenue_sc: number
  attributed_orders_sc: number
  impressions_sc: number
  clicks_sc: number
  new_customer_revenue_sc: number
}

function parseAdRows(rows: Record<string, unknown>[]): AdRow[] {
  return rows.map((r) => ({
    ad_id:                  String(r[`${C}.ad_id`] ?? ""),
    ad_name:                String(r[`${C}.ad_name`] ?? "—"),
    campaign_name:          String(r[`${C}.campaign_name`] ?? "—"),
    adset_name:             String(r[`${C}.adset_name`] ?? "—"),
    spend_sc:               Number(r[`${C}.spend_sc`] ?? 0),
    spend_fc:               Number(r[`${C}.spend_fc`] ?? 0),
    net_revenue_sc:         Number(r[`${C}.net_revenue_sc`] ?? 0),
    attributed_orders_sc:   Number(r[`${C}.attributed_orders_sc`] ?? 0),
    impressions_sc:         Number(r[`${C}.impressions_sc`] ?? 0),
    clicks_sc:              Number(r[`${C}.clicks_sc`] ?? 0),
    new_customer_revenue_sc:Number(r[`${C}.new_customer_revenue_sc`] ?? 0),
  }))
}

function AdDrawer({
  tag,
  start,
  end,
  brand,
  onClose,
}: {
  tag: ScoredTag
  start: string
  end: string
  brand: number
  onClose: () => void
}) {
  const [ads, setAds] = useState<AdRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setErr(null)
    const url = `/api/neurotag/ads?tag=${encodeURIComponent(tag.tag_code)}&start=${start}&end=${end}&brand=${brand}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setAds(parseAdRows(data.rows ?? []))
        if (data.error) setErr(data.error)
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [tag.tag_code, start, end, brand])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const badge = BADGE[tag.classification]
  const totalSpend = ads.reduce((s, a) => s + a.spend_sc, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-stone-200 dark:border-night-700 bg-white dark:bg-night-925 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-night-800 px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.cls}`}>
                {badge.label}
              </span>
              <span className="font-mono text-xs text-stone-400 dark:text-night-500">{tag.tag_code}</span>
              {tag.classification !== "needs_more_data" && (
                <span className="text-xs text-stone-400 dark:text-night-600">
                  score {(tag.score * 100).toFixed(0)}
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-night-50 truncate">{tag.hack_name}</h2>
            <p className="text-xs text-stone-500 dark:text-night-500">{tag.category_name}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-night-850 hover:text-stone-700 dark:hover:text-night-200 transition-colors"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tag summary strip */}
        <div className="grid grid-cols-4 gap-px border-b border-stone-200 dark:border-night-800 bg-stone-100 dark:bg-night-850">
          {[
            { label: "Spend (SC)", value: fmtCurrency(tag.spend) },
            { label: "ROAS",       value: `${tag.roas.toFixed(2)}×` },
            { label: "CTR",        value: fmtPct(tag.ctr * 100) },
            { label: "Orders",     value: fmtCount(tag.attributed_orders) },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-night-925 px-4 py-3">
              <p className="text-[10px] text-stone-400 dark:text-night-600">{kpi.label}</p>
              <p className="text-sm font-semibold text-stone-800 dark:text-night-100">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Ad list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-night-600 py-8 justify-center">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading ads…
            </div>
          )}

          {!loading && err && (
            <p className="text-sm text-amber-400 py-4">Failed to load: {err}</p>
          )}

          {!loading && !err && ads.length === 0 && (
            <p className="text-sm text-stone-500 dark:text-night-500 py-8 text-center">
              No ads found for this tag in the selected period.
            </p>
          )}

          {!loading && ads.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 dark:text-night-600">
                {ads.length} ad{ads.length !== 1 ? "s" : ""} · total spend {fmtCurrency(totalSpend)} (split-credit)
              </p>
              <div className="space-y-2">
                {ads.map((ad) => {
                  const roas = ad.spend_sc > 0 ? ad.net_revenue_sc / ad.spend_sc : 0
                  const ctr  = ad.impressions_sc > 0 ? ad.clicks_sc / ad.impressions_sc : 0
                  const cpa  = ad.attributed_orders_sc > 0 ? ad.spend_sc / ad.attributed_orders_sc : 0

                  return (
                    <div
                      key={ad.ad_id}
                      className="rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900 p-3 space-y-2"
                    >
                      {/* Ad name + campaign */}
                      <div>
                        <p className="text-xs font-medium text-stone-800 dark:text-night-100 leading-snug" title={ad.ad_name}>
                          {ad.ad_name}
                        </p>
                        <p className="text-[10px] text-stone-400 dark:text-night-600 mt-0.5 truncate" title={ad.campaign_name}>
                          {ad.campaign_name}
                        </p>
                        <p className="text-[10px] text-stone-400 dark:text-night-600 truncate" title={ad.adset_name}>
                          {ad.adset_name}
                        </p>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: "Spend",   value: fmtCurrency(ad.spend_sc), highlight: false },
                          { label: "ROAS",    value: `${roas.toFixed(2)}×`,    highlight: roas >= 2.5 },
                          { label: "CTR",     value: fmtPct(ctr * 100),        highlight: false },
                          { label: "Orders",  value: fmtCount(ad.attributed_orders_sc), highlight: false },
                          { label: "CPA",     value: cpa > 0 ? fmtCurrency(cpa) : "—", highlight: false },
                        ].map((m) => (
                          <div key={m.label}>
                            <p className="text-[9px] text-stone-400 dark:text-night-600 uppercase tracking-wide">{m.label}</p>
                            <p className={`text-xs font-semibold tabular-nums ${m.highlight ? "text-emerald-500" : "text-stone-700 dark:text-night-200"}`}>
                              {m.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Revenue bar */}
                      {ad.net_revenue_sc > 0 && totalSpend > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-stone-200 dark:bg-night-800">
                            <div
                              className="h-1 rounded-full bg-emerald-500/60"
                              style={{ width: `${Math.min(100, (ad.spend_sc / totalSpend) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-stone-400 dark:text-night-600 tabular-nums whitespace-nowrap">
                            {((ad.spend_sc / totalSpend) * 100).toFixed(0)}% of tag spend
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface Props {
  tags: ScoredTag[]
  title?: string
  start: string
  end: string
  brand: number
  /** When `focusNonce` changes, filter the table to `focusText`… */
  focusText?: string
  /** …and open the ad drawer for this tag. */
  focusTagCode?: string
  focusNonce?: number
}

export function NeuroTagLeaderboard({ tags, start, end, brand, focusText, focusTagCode, focusNonce = 0 }: Props) {
  const [creditMode, setCreditMode] = useState<"split" | "full">("split")
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [selected, setSelected] = useState<ScoredTag | null>(null)
  const [filter, setFilter] = useState("")

  // Respond to a search-result selection coming from the universal search.
  useEffect(() => {
    if (!focusNonce) return
    setFilter(focusText ?? "")
    if (focusTagCode) {
      const t = tags.find((x) => x.tag_code === focusTagCode)
      if (t) setSelected(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce])

  if (!tags.length) {
    return <p className="text-sm text-stone-500 dark:text-night-500">No data for this period.</p>
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1))
    else { setSortKey(key); setSortDir(1) }
  }

  const q = filter.trim().toLowerCase()
  const visible = q
    ? tags.filter(
        (t) =>
          t.tag_code.toLowerCase().includes(q) ||
          t.hack_name.toLowerCase().includes(q) ||
          t.category_name.toLowerCase().includes(q),
      )
    : tags

  const sorted = [...visible].sort((a, b) => {
    const av = Number(a[sortKey] ?? 0)
    const bv = Number(b[sortKey] ?? 0)
    return sortDir * (bv - av)
  })

  function hdr(key: SortKey, label: string) {
    const active = sortKey === key
    return (
      <th
        onClick={() => toggleSort(key)}
        className="cursor-pointer select-none px-3 py-2 text-right text-xs font-medium text-stone-400 dark:text-night-500 hover:text-stone-700 dark:hover:text-night-200 whitespace-nowrap"
      >
        {label}{active ? (sortDir === 1 ? " ↓" : " ↑") : ""}
      </th>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-xs text-stone-500 dark:text-night-500">
              {q ? `${sorted.length} of ${tags.length}` : tags.length} tags · Spend uses {creditMode}-credit · click a row to see ads
            </p>
            {q && (
              <button
                onClick={() => setFilter("")}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/20"
              >
                <span className="truncate max-w-[140px]">filtered: {filter}</span>
                <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex rounded-lg border border-stone-200 dark:border-night-700 overflow-hidden text-xs">
            {(["split", "full"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setCreditMode(m)}
                className={`px-3 py-1 transition-colors ${
                  creditMode === m
                    ? "bg-stone-100 dark:bg-night-800 text-stone-900 dark:text-night-50 font-medium"
                    : "text-stone-500 dark:text-night-500 hover:bg-stone-50 dark:hover:bg-night-875"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900">
                <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500 w-8">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500">Signal</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500 min-w-[180px]">Tag · Hack</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-stone-400 dark:text-night-500">Category</th>
                {hdr("score",     "Score")}
                {hdr("spend",     "Spend")}
                {hdr("roas",      "ROAS")}
                {hdr("hook_rate", "Hook %")}
                {hdr("ctr",       "CTR")}
                {hdr("cpa",       "CPA")}
                <th className="px-3 py-2 text-right text-xs font-medium text-stone-400 dark:text-night-500">Rev (SC)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-stone-400 dark:text-night-500">Orders</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((tag, i) => {
                const badge = BADGE[tag.classification]
                const displaySpend = creditMode === "split" ? tag.spend : tag.spend_fc
                const isSelected = selected?.tag_code === tag.tag_code
                return (
                  <tr
                    key={tag.tag_code}
                    onClick={() => setSelected(tag)}
                    className={`border-b border-stone-100 dark:border-night-850 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-stone-100 dark:bg-night-850"
                        : "hover:bg-stone-50 dark:hover:bg-night-875"
                    }`}
                  >
                    <td className="px-3 py-2 text-stone-400 dark:text-night-600 tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-mono text-stone-500 dark:text-night-500 text-[10px]">{tag.tag_code}</div>
                      <div className="text-stone-800 dark:text-night-200 truncate max-w-[200px]" title={tag.hack_name}>
                        {tag.hack_name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-stone-500 dark:text-night-400 truncate max-w-[120px]">{tag.category_name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {tag.classification === "needs_more_data" ? (
                        <span className="text-stone-400 dark:text-night-600">—</span>
                      ) : (
                        <span className={`font-medium ${tag.score >= 0.65 ? "text-emerald-500" : tag.score >= 0.4 ? "text-stone-700 dark:text-night-300" : "text-stone-400 dark:text-night-600"}`}>
                          {(tag.score * 100).toFixed(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-700 dark:text-night-200">{fmtCurrency(displaySpend)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-medium ${tag.roas >= 2.5 ? "text-emerald-500" : tag.roas >= 1.5 ? "text-stone-700 dark:text-night-200" : "text-red-400"}`}>
                      {tag.roas.toFixed(2)}×
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${tag.hook_rate >= 20 ? "text-emerald-500 font-medium" : tag.hook_rate >= 10 ? "text-stone-600 dark:text-night-300" : "text-stone-400 dark:text-night-600"}`}>
                      {tag.hook_rate > 0 ? `${tag.hook_rate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">{fmtPct(tag.ctr * 100)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">
                      {tag.cpa > 0 ? fmtCurrency(tag.cpa) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-700 dark:text-night-200">{fmtCurrency(tag.net_revenue)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-stone-600 dark:text-night-300">{fmtCount(tag.attributed_orders)}</td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-sm text-stone-400 dark:text-night-600">
                    No tags match “{filter}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <AdDrawer
          tag={selected}
          start={start}
          end={end}
          brand={brand}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
