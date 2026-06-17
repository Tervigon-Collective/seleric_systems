"use client"

import { useEffect, useState } from "react"
import { fmtCurrency, fmtCount, fmtPct } from "./format"

const G = "gold__fct_meta_ads_breakdown_daily"

type BreakdownTab = "age_gender" | "publisher" | "device" | "region"

const PLATFORM_CLS: Record<string, string> = {
  instagram:        "bg-pink-500/15 text-pink-400 border-pink-500/20",
  facebook:         "bg-blue-500/15 text-blue-400 border-blue-500/20",
  audience_network: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  threads:          "bg-stone-500/15 text-stone-400 border-stone-500/20",
}
const GENDER_CLS: Record<string, string> = {
  female:  "text-rose-400",
  male:    "text-sky-400",
  unknown: "text-stone-400 dark:text-night-500",
}

function humanize(s: string) {
  if (!s || s === "unknown") return "Unknown"
  return s
    .replace(/_/g, " ")
    .replace(/\ban\b/gi, "AN")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function n(v: unknown) { const x = Number(v ?? 0); return isFinite(x) ? x : 0 }

interface SegRow {
  label:       string
  sublabel?:   string
  labelCls?:   string
  chipCls?:    string
  spend:       number
  impressions: number
  clicks:      number
  views3s:     number
  thruplay:    number
}

function parseCommon(r: Record<string, unknown>) {
  return {
    spend:       n(r[`${G}.spend`]),
    impressions: n(r[`${G}.impressions`]),
    clicks:      n(r[`${G}.clicks`]),
    views3s:     n(r[`${G}.video_views_3s`]),
    thruplay:    n(r[`${G}.video_thruplay_15s`]),
  }
}

function parseAgeGender(rows: Record<string, unknown>[]): SegRow[] {
  return rows
    .filter((r) => {
      const age    = String(r[`${G}.age`]    ?? "")
      const gender = String(r[`${G}.gender`] ?? "")
      return age !== "Unknown" && age !== "" && gender !== "unknown" && gender !== ""
    })
    .map((r) => ({
      label:    String(r[`${G}.age`]    ?? "Unknown"),
      sublabel: humanize(String(r[`${G}.gender`] ?? "unknown")),
      labelCls: GENDER_CLS[String(r[`${G}.gender`] ?? "unknown")],
      ...parseCommon(r),
    }))
    .sort((a, b) => b.spend - a.spend)
}

function parsePublisher(rows: Record<string, unknown>[]): SegRow[] {
  return rows
    .filter((r) => String(r[`${G}.publisher_platform`] ?? "") !== "unknown")
    .map((r) => ({
      label:   humanize(String(r[`${G}.publisher_platform`] ?? "unknown")),
      chipCls: PLATFORM_CLS[String(r[`${G}.publisher_platform`] ?? "")],
      ...parseCommon(r),
    }))
    .sort((a, b) => b.spend - a.spend)
}

function parseDevice(rows: Record<string, unknown>[]): SegRow[] {
  return rows
    .filter((r) => String(r[`${G}.device_platform`] ?? "") !== "unknown")
    .map((r) => ({
      label: humanize(String(r[`${G}.device_platform`] ?? "unknown")),
      ...parseCommon(r),
    }))
    .sort((a, b) => b.spend - a.spend)
}

function parseRegion(rows: Record<string, unknown>[]): SegRow[] {
  return rows
    .filter((r) => {
      const v = String(r[`${G}.region`] ?? "")
      return v !== "" && v.toLowerCase() !== "unknown"
    })
    .map((r) => ({
      label: String(r[`${G}.region`] ?? "Unknown"),
      ...parseCommon(r),
    }))
    .sort((a, b) => b.spend - a.spend)
}

interface Props {
  adId:  string
  start: string
  end:   string
  brand: number
}

const TABS: { key: BreakdownTab; label: string }[] = [
  { key: "age_gender", label: "Age & Gender" },
  { key: "publisher",  label: "Publisher"    },
  { key: "device",     label: "Device"       },
  { key: "region",     label: "Region"       },
]

const BT_MAP: Record<BreakdownTab, string> = {
  age_gender: "age_and_gender",
  publisher:  "publisher_platform",
  device:     "platform_device",
  region:     "region",
}

function parseForTab(tab: BreakdownTab, raw: Record<string, unknown>[]): SegRow[] {
  if (tab === "age_gender") return parseAgeGender(raw)
  if (tab === "publisher")  return parsePublisher(raw)
  if (tab === "device")     return parseDevice(raw)
  return parseRegion(raw)
}

export function AdEngagementBreakdown({ adId, start, end, brand }: Props) {
  const [activeTab, setActiveTab] = useState<BreakdownTab>("age_gender")
  const [segData,   setSegData]   = useState<Partial<Record<BreakdownTab, SegRow[]>>>({})
  const [loading,   setLoading]   = useState<Partial<Record<BreakdownTab, boolean>>>({})
  const [errors,    setErrors]    = useState<Partial<Record<BreakdownTab, string>>>({})

  function fetchTab(tab: BreakdownTab) {
    if (segData[tab]) return
    setLoading((l) => ({ ...l, [tab]: true }))
    const url = `/api/ads/engagement?ad_id=${encodeURIComponent(adId)}&breakdown_type=${BT_MAP[tab]}&start=${start}&end=${end}&brand=${brand}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setSegData((prev) => ({ ...prev, [tab]: parseForTab(tab, d.rows ?? []) }))
        if (d.error) setErrors((e) => ({ ...e, [tab]: d.error }))
      })
      .catch((err) => setErrors((e) => ({ ...e, [tab]: String(err) })))
      .finally(() => setLoading((l) => ({ ...l, [tab]: false })))
  }

  // Reset and reload when the ad changes
  useEffect(() => {
    setSegData({})
    setErrors({})
    setActiveTab("age_gender")
    setLoading((l) => ({ ...l, age_gender: true }))
    const url = `/api/ads/engagement?ad_id=${encodeURIComponent(adId)}&breakdown_type=${BT_MAP["age_gender"]}&start=${start}&end=${end}&brand=${brand}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setSegData({ age_gender: parseAgeGender(d.rows ?? []) })
        if (d.error) setErrors((e) => ({ ...e, age_gender: d.error }))
      })
      .catch((err) => setErrors((e) => ({ ...e, age_gender: String(err) })))
      .finally(() => setLoading((l) => ({ ...l, age_gender: false })))
  }, [adId, start, end, brand]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTab(tab: BreakdownTab) {
    setActiveTab(tab)
    fetchTab(tab)
  }

  const rows       = segData[activeTab]
  const isLoading  = loading[activeTab]
  const err        = errors[activeTab]
  const totalSpend = (rows ?? []).reduce((s, r) => s + r.spend, 0)

  return (
    <div className="space-y-2">
      {/* Tab strip */}
      <div className="flex items-center gap-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTab(t.key)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
              activeTab === t.key
                ? "bg-stone-200 dark:bg-night-700 text-stone-700 dark:text-night-100"
                : "text-stone-400 dark:text-night-600 hover:text-stone-600 dark:hover:text-night-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-night-600 py-1.5">
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading…
        </div>
      )}
      {err && !isLoading && (
        <p className="text-[11px] text-amber-400 py-1">Failed to load: {err}</p>
      )}
      {!isLoading && !err && rows && rows.length === 0 && (
        <p className="text-[11px] text-stone-400 dark:text-night-600 italic py-1">No data for this ad in the selected period.</p>
      )}
      {!isLoading && rows && rows.length > 0 && (
        <SegTable rows={rows} totalSpend={totalSpend} showTop={activeTab === "region" ? 15 : undefined} />
      )}
    </div>
  )
}

function SegTable({ rows, totalSpend, showTop }: { rows: SegRow[]; totalSpend: number; showTop?: number }) {
  const visible = showTop ? rows.slice(0, showTop) : rows

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900 text-stone-400 dark:text-night-500">
            <th className="px-2.5 py-1.5 text-left font-medium min-w-[130px]">Segment</th>
            <th className="px-2.5 py-1.5 text-right font-medium">Spend</th>
            <th className="px-2.5 py-1.5 text-left font-medium w-24">% of ad</th>
            <th className="px-2.5 py-1.5 text-right font-medium">Impr</th>
            <th className="px-2.5 py-1.5 text-right font-medium">CPM</th>
            <th className="px-2.5 py-1.5 text-right font-medium">CTR</th>
            <th className="px-2.5 py-1.5 text-right font-medium">Hook %</th>
            <th className="px-2.5 py-1.5 text-right font-medium">Hold %</th>
            <th className="px-2.5 py-1.5 text-right font-medium">Thruplay</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r, i) => {
            const pct      = totalSpend > 0 ? (r.spend / totalSpend) * 100 : 0
            const cpm      = r.impressions > 0 ? (r.spend / r.impressions) * 1000 : 0
            const ctr      = r.impressions > 0 ? (r.clicks  / r.impressions) * 100 : 0
            const hookRate = r.impressions > 0 ? (r.views3s / r.impressions) * 100 : 0
            const holdRate = r.views3s     > 0 ? (r.thruplay / r.views3s)   * 100 : 0
            return (
              <tr key={i} className="border-b border-stone-100 dark:border-night-850 last:border-0">
                {/* Segment label */}
                <td className="px-2.5 py-1.5">
                  {r.chipCls ? (
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[9px] font-medium ${r.chipCls}`}>
                      {r.label}
                    </span>
                  ) : (
                    <span className={`font-medium ${r.labelCls ?? "text-stone-700 dark:text-night-200"}`}>
                      {r.label}
                    </span>
                  )}
                  {r.sublabel && (
                    <span className={`ml-1.5 text-[9px] ${r.labelCls ?? "text-stone-400 dark:text-night-600"}`}>
                      {r.sublabel}
                    </span>
                  )}
                </td>

                {/* Spend */}
                <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-700 dark:text-night-200">
                  {fmtCurrency(r.spend)}
                </td>

                {/* % of ad bar */}
                <td className="px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 flex-1 rounded-full bg-stone-200 dark:bg-night-800">
                      <span className="block h-1 rounded-full bg-indigo-500/60" style={{ width: `${Math.min(100, pct)}%` }} />
                    </span>
                    <span className="w-6 text-right text-[9px] tabular-nums text-stone-400 dark:text-night-600">
                      {pct.toFixed(0)}%
                    </span>
                  </span>
                </td>

                {/* Impr */}
                <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">
                  {fmtCount(r.impressions)}
                </td>

                {/* CPM */}
                <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">
                  {cpm > 0 ? fmtCurrency(cpm) : "—"}
                </td>

                {/* CTR */}
                <td className={`px-2.5 py-1.5 text-right tabular-nums ${ctr >= 1.5 ? "text-emerald-500 font-medium" : "text-stone-500 dark:text-night-400"}`}>
                  {r.clicks > 0 ? fmtPct(ctr) : "—"}
                </td>

                {/* Hook % */}
                <td className={`px-2.5 py-1.5 text-right tabular-nums font-medium ${hookRate >= 20 ? "text-emerald-500" : "text-stone-500 dark:text-night-400"}`}>
                  {r.views3s > 0 ? fmtPct(hookRate) : "—"}
                </td>

                {/* Hold % (thruplay / 3s views) */}
                <td className={`px-2.5 py-1.5 text-right tabular-nums ${holdRate >= 25 ? "text-emerald-500 font-medium" : "text-stone-500 dark:text-night-400"}`}>
                  {r.thruplay > 0 ? fmtPct(holdRate) : "—"}
                </td>

                {/* Thruplay count */}
                <td className="px-2.5 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">
                  {r.thruplay > 0 ? fmtCount(r.thruplay) : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {showTop && rows.length > showTop && (
        <p className="px-2.5 py-1.5 text-[9px] text-stone-400 dark:text-night-600 border-t border-stone-100 dark:border-night-850">
          Showing top {showTop} of {rows.length} regions by spend
        </p>
      )}
    </div>
  )
}
