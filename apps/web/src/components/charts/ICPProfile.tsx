"use client"

import { useMemo } from "react"
import { ChartCard } from "./ChartCard"
import { fmtCurrency, fmtCount, fmtPct } from "./format"
import type { ICPData } from "@/lib/dashboard/queries/icp"

// ── Constants ─────────────────────────────────────────────────────────────────

const G  = "gold__fct_meta_ads_breakdown_daily"
const OA = "order_attribution"
const PP = "product_performance"
const NT = "meta_neurotag_analysis"

const CAT_COLORS: Record<string, string> = {
  "Emotional Triggers":             "bg-rose-500/15 text-rose-400 border-rose-500/20",
  "Cognitive Fluency":              "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "Behavioral Economics & Nudging": "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Social Proof & Validation":      "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Sensory Integration":            "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Memory & Recall":                "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Temporal Manipulation":          "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Identity Manipulation":          "bg-pink-500/15 text-pink-400 border-pink-500/20",
}

const PLATFORM_CLS: Record<string, string> = {
  instagram:        "bg-pink-500/15 text-pink-400 border-pink-500/20",
  facebook:         "bg-blue-500/15 text-blue-400 border-blue-500/20",
  audience_network: "bg-violet-500/15 text-violet-400 border-violet-500/20",
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function n(v: unknown) { const x = Number(v ?? 0); return isFinite(x) ? x : 0 }

function humanize(s: string) {
  if (!s || s === "unknown" || s === "Unknown") return "Unknown"
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function engScore(ctr: number, hookRate: number, holdRate: number, maxCtr: number, maxHook: number, maxHold: number) {
  return (ctr / maxCtr) * 0.40 + (hookRate / maxHook) * 0.35 + (holdRate / maxHold) * 0.25
}

// ── Data models ───────────────────────────────────────────────────────────────

interface EngRow {
  key: string
  label: string
  sublabel?: string
  spend: number
  spendPct: number
  impressions: number
  ctr: number
  hookRate: number
  holdRate: number
  score: number
}

interface PlacementRow {
  platform: string
  position: string
  spend: number
  spendPct: number
  impressions: number
  purchases: number
  hookRate: number
  cpa: number
}

interface ContentCat {
  name: string
  spend: number
  revenue: number
  roas: number
  isTop: boolean
}

interface BuyerProfile {
  orders: number
  revenue: number
  aov: number
  ncrRevenue: number
  ncrBase: number
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseAgeGender(rows: Record<string, unknown>[]) {
  // Build per-age aggregate (collapse gender)
  const byAge = new Map<string, { spend: number; impressions: number; clicks: number; views3s: number; thruplay: number }>()
  // Build per-gender aggregate
  const byGender = new Map<string, { spend: number; impressions: number; clicks: number; views3s: number; thruplay: number }>()

  for (const r of rows) {
    const age    = String(r[`${G}.age`]    ?? "")
    const gender = String(r[`${G}.gender`] ?? "")
    if (!age || age === "Unknown") continue
    const d = { spend: n(r[`${G}.spend`]), impressions: n(r[`${G}.impressions`]), clicks: n(r[`${G}.clicks`]), views3s: n(r[`${G}.video_views_3s`]), thruplay: n(r[`${G}.video_thruplay_15s`]) }
    const a = byAge.get(age) ?? { spend: 0, impressions: 0, clicks: 0, views3s: 0, thruplay: 0 }
    byAge.set(age, { spend: a.spend + d.spend, impressions: a.impressions + d.impressions, clicks: a.clicks + d.clicks, views3s: a.views3s + d.views3s, thruplay: a.thruplay + d.thruplay })
    if (gender !== "unknown" && gender !== "") {
      const g = byGender.get(gender) ?? { spend: 0, impressions: 0, clicks: 0, views3s: 0, thruplay: 0 }
      byGender.set(gender, { spend: g.spend + d.spend, impressions: g.impressions + d.impressions, clicks: g.clicks + d.clicks, views3s: g.views3s + d.views3s, thruplay: g.thruplay + d.thruplay })
    }
  }

  function toEngRows(map: Map<string, { spend: number; impressions: number; clicks: number; views3s: number; thruplay: number }>, totalSpend: number) {
    const raw = [...map.entries()].map(([key, d]) => {
      const ctr  = d.impressions > 0 ? d.clicks   / d.impressions : 0
      const hook = d.impressions > 0 ? d.views3s  / d.impressions : 0
      const hold = d.views3s     > 0 ? d.thruplay / d.views3s     : 0
      return { key, ctr, hook, hold, spend: d.spend, impressions: d.impressions, spendPct: totalSpend > 0 ? d.spend / totalSpend : 0 }
    })
    const maxCtr  = Math.max(...raw.map(r => r.ctr),  0.001)
    const maxHook = Math.max(...raw.map(r => r.hook), 0.001)
    const maxHold = Math.max(...raw.map(r => r.hold), 0.001)
    return raw
      .map(r => ({ ...r, score: engScore(r.ctr, r.hook, r.hold, maxCtr, maxHook, maxHold), ctr: r.ctr, hookRate: r.hook, holdRate: r.hold }))
      .sort((a, b) => b.spend - a.spend)
  }

  const totalSpend = [...byAge.values()].reduce((s, d) => s + d.spend, 0)
  const ageRows    = toEngRows(byAge, totalSpend).filter(r => r.spendPct >= 0.01)
  const genderRows = toEngRows(byGender, totalSpend).filter(r => r.spendPct >= 0.05)

  // Per-cell rows (age × gender) for the detailed table
  const rawRows = rows.filter(r => {
    const age = String(r[`${G}.age`] ?? ""); return age !== "Unknown" && age !== ""
  })

  return { ageRows, genderRows, rawRows, totalSpend }
}

function parseDevice(rows: Record<string, unknown>[]) {
  const total = rows.reduce((s, r) => s + n(r[`${G}.spend`]), 0)
  const raw = rows
    .filter(r => String(r[`${G}.device_platform`] ?? "") !== "unknown")
    .map(r => {
      const spend       = n(r[`${G}.spend`])
      const impressions = n(r[`${G}.impressions`])
      const views3s     = n(r[`${G}.video_views_3s`])
      const thruplay    = n(r[`${G}.video_thruplay_15s`])
      const ctr         = impressions > 0 ? n(r[`${G}.clicks`]) / impressions : 0
      const hookRate    = impressions > 0 ? views3s  / impressions : 0
      const holdRate    = views3s     > 0 ? thruplay / views3s     : 0
      return {
        key:      String(r[`${G}.device_platform`] ?? ""),
        label:    humanize(String(r[`${G}.device_platform`] ?? "")),
        spend, impressions,
        spendPct: total > 0 ? spend / total : 0,
        ctr, hookRate, holdRate, score: 0,
      }
    })
  const maxCtr  = Math.max(...raw.map(r => r.ctr),      0.001)
  const maxHook = Math.max(...raw.map(r => r.hookRate),  0.001)
  const maxHold = Math.max(...raw.map(r => r.holdRate),  0.001)
  return raw
    .map(r => ({ ...r, score: engScore(r.ctr, r.hookRate, r.holdRate, maxCtr, maxHook, maxHold) }))
    .sort((a, b) => b.spend - a.spend)
}

function parseRegion(rows: Record<string, unknown>[]) {
  const total = rows.reduce((s, r) => s + n(r[`${G}.spend`]), 0)
  return rows
    .filter(r => {
      const region = String(r[`${G}.region`] ?? "")
      return region !== "" && region !== "unknown" && region !== "Unknown"
    })
    .slice(0, 8)
    .map(r => {
      const spend       = n(r[`${G}.spend`])
      const impressions = n(r[`${G}.impressions`])
      const views3s     = n(r[`${G}.video_views_3s`])
      const ctr         = impressions > 0 ? n(r[`${G}.clicks`]) / impressions : 0
      const hookRate    = impressions > 0 ? views3s / impressions : 0
      return {
        region:   String(r[`${G}.region`] ?? ""),
        spend, impressions,
        spendPct: total > 0 ? spend / total : 0,
        ctr, hookRate,
      }
    })
    .sort((a, b) => b.spend - a.spend)
}

function parsePlacement(rows: Record<string, unknown>[]) {
  const total = rows.reduce((s, r) => s + n(r[`${G}.spend`]), 0)
  return rows
    .map(r => {
      const spend       = n(r[`${G}.spend`])
      const impressions = n(r[`${G}.impressions`])
      const purchases   = n(r[`${G}.purchases`])
      const views3s     = n(r[`${G}.video_views_3s`])
      return {
        platform: String(r[`${G}.publisher_platform`] ?? ""),
        position: String(r[`${G}.platform_position`]  ?? ""),
        spend, impressions, purchases,
        spendPct: total > 0 ? spend / total : 0,
        hookRate: impressions > 0 ? views3s / impressions : 0,
        cpa:      purchases > 0 ? spend / purchases : 0,
      }
    })
    .sort((a, b) => b.spend - a.spend)
}

function parseBuyerProfile(
  metaBuyer: Record<string, unknown>[],
  categoryBreakdown: Record<string, unknown>[],
): BuyerProfile {
  const row = metaBuyer[0] ?? {}
  const orders  = n(row[`${OA}.meta_attributed_orders`])
  const revenue = n(row[`${OA}.meta_attributed_revenue`])
  let ncrRevenue = 0, ncrBase = 0
  for (const r of categoryBreakdown) {
    ncrRevenue += n(r[`${NT}.new_customer_revenue_sc`])
    ncrBase    += n(r[`${NT}.net_revenue_sc`])
  }
  return { orders, revenue, aov: orders > 0 ? revenue / orders : 0, ncrRevenue, ncrBase }
}

function parseContentDNA(categoryBreakdown: Record<string, unknown>[]): ContentCat[] {
  const cats = categoryBreakdown
    .map(r => {
      const spend   = n(r[`${NT}.spend_sc`])
      const revenue = n(r[`${NT}.net_revenue_sc`])
      return {
        name:    String(r[`${NT}.category_name`] ?? ""),
        spend, revenue,
        roas:    spend > 0 ? revenue / spend : 0,
        isTop:   false,
      }
    })
    .filter(c => c.name && c.spend > 500)
    .sort((a, b) => b.roas - a.roas)
  const maxRoas = cats[0]?.roas ?? 0
  return cats.map((c, i) => ({ ...c, isTop: i < 3 && c.roas > 0 && maxRoas > 0 }))
}

// ── Winner derivation ─────────────────────────────────────────────────────────

interface Winners {
  age: string | null
  gender: string | null
  device: string | null
  region: string | null
  format: string | null
  topCategories: string[]
  aov: number
  ncrPct: number
}

function deriveWinners(
  ageGender: ReturnType<typeof parseAgeGender>,
  devices: ReturnType<typeof parseDevice>,
  regions: ReturnType<typeof parseRegion>,
  placements: ReturnType<typeof parsePlacement>,
  buyer: BuyerProfile,
  content: ContentCat[],
): Winners {
  const bestAge    = [...ageGender.ageRows].sort((a, b) => b.score - a.score)[0]?.key ?? null
  const bestGender = [...ageGender.genderRows].sort((a, b) => b.score - a.score)[0]?.key ?? null
  const bestDevice = [...devices].sort((a, b) => b.score - a.score)[0]?.label ?? null
  const topRegion  = regions[0]?.region ?? null
  const bestFormat = placements
    .filter(p => p.purchases >= 3 && p.cpa > 0)
    .sort((a, b) => a.cpa - b.cpa)[0]
  const formatLabel = bestFormat
    ? `${humanize(bestFormat.platform)} ${humanize(bestFormat.position)}`
    : null
  const topCats = content.filter(c => c.isTop).map(c => c.name.replace(/ & /g, " & ").split(" ")[0])
  const ncrPct  = buyer.ncrBase > 0 ? buyer.ncrRevenue / buyer.ncrBase : 0
  return {
    age: bestAge, gender: bestGender, device: bestDevice,
    region: topRegion, format: formatLabel,
    topCategories: topCats,
    aov: buyer.aov, ncrPct,
  }
}

// ── Sub-section renderers ─────────────────────────────────────────────────────

function SpendBar({ pct, max }: { pct: number; max: number }) {
  const w = max > 0 ? (pct / max) * 100 : 0
  return (
    <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-night-850">
      <div className="h-1.5 rounded-full bg-indigo-500/60" style={{ width: `${Math.min(100, w)}%` }} />
    </div>
  )
}

function AgeGenderSection({ data }: { data: ReturnType<typeof parseAgeGender> }) {
  const { ageRows, genderRows, totalSpend } = data
  if (ageRows.length === 0) {
    return <p className="text-xs text-stone-400 dark:text-night-600 italic">No demographic data for this period.</p>
  }
  const maxAge    = Math.max(...ageRows.map(r => r.spendPct),    0.001)
  const maxGender = Math.max(...genderRows.map(r => r.spendPct), 0.001)
  const bestAge   = [...ageRows].sort((a, b) => b.score - a.score)[0]?.key
  const bestGen   = [...genderRows].sort((a, b) => b.score - a.score)[0]?.key

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Age */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-stone-400 dark:text-night-500 uppercase tracking-wide">Age group</p>
          {ageRows.map(r => (
            <div key={r.key} className={`flex items-center gap-2 text-[11px] rounded px-1.5 py-0.5 ${r.key === bestAge ? "bg-indigo-500/10 dark:bg-indigo-500/15" : ""}`}>
              <span className={`w-12 shrink-0 font-medium ${r.key === bestAge ? "text-indigo-400" : "text-stone-600 dark:text-night-300"}`}>{r.key}</span>
              <SpendBar pct={r.spendPct} max={maxAge} />
              <span className="w-8 text-right tabular-nums text-stone-400 dark:text-night-600">{fmtPct(r.spendPct * 100)}</span>
              <span className={`w-8 text-right tabular-nums ${r.ctr > 0 ? "text-stone-500 dark:text-night-400" : "text-stone-300 dark:text-night-700"}`}>{r.ctr > 0 ? fmtPct(r.ctr * 100) : "—"}</span>
            </div>
          ))}
          <p className="text-[9px] text-stone-300 dark:text-night-700 pt-0.5">% spend · CTR</p>
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-stone-400 dark:text-night-500 uppercase tracking-wide">Gender</p>
          {genderRows.map(r => (
            <div key={r.key} className={`flex items-center gap-2 text-[11px] rounded px-1.5 py-0.5 ${r.key === bestGen ? "bg-indigo-500/10 dark:bg-indigo-500/15" : ""}`}>
              <span className={`w-14 shrink-0 font-medium capitalize ${r.key === bestGen ? "text-indigo-400" : "text-stone-600 dark:text-night-300"}`}>{r.key}</span>
              <SpendBar pct={r.spendPct} max={maxGender} />
              <span className="w-8 text-right tabular-nums text-stone-400 dark:text-night-600">{fmtPct(r.spendPct * 100)}</span>
            </div>
          ))}
          <p className="text-[9px] text-stone-300 dark:text-night-700 pt-0.5 opacity-0">—</p>
        </div>
      </div>
      <p className="text-[9px] text-stone-300 dark:text-night-700">Highlighted row = best engagement score (CTR 40% · Hook 35% · Hold 25%) · {fmtCurrency(totalSpend)} total</p>
    </div>
  )
}

function DeviceSection({ rows }: { rows: ReturnType<typeof parseDevice> }) {
  if (rows.length === 0) return <p className="text-xs text-stone-400 dark:text-night-600 italic">No device data.</p>
  const best   = [...rows].sort((a, b) => b.score - a.score)[0]?.key
  const maxPct = Math.max(...rows.map(r => r.spendPct), 0.001)
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.key} className={`flex items-center gap-2 text-[11px] rounded px-1.5 py-0.5 ${r.key === best ? "bg-indigo-500/10 dark:bg-indigo-500/15" : ""}`}>
          <span className={`w-24 shrink-0 font-medium ${r.key === best ? "text-indigo-400" : "text-stone-600 dark:text-night-300"}`}>{r.label}</span>
          <SpendBar pct={r.spendPct} max={maxPct} />
          <span className="w-8 text-right tabular-nums text-stone-400 dark:text-night-600">{fmtPct(r.spendPct * 100)}</span>
          <span className="w-12 text-right tabular-nums text-stone-500 dark:text-night-400">
            {r.hookRate > 0 ? `${r.hookRate.toFixed(0)}% hook` : "—"}
          </span>
        </div>
      ))}
      <p className="text-[9px] text-stone-300 dark:text-night-700">% spend · Hook rate</p>
    </div>
  )
}

function FormatSection({ rows }: { rows: ReturnType<typeof parsePlacement> }) {
  if (rows.length === 0) return <p className="text-xs text-stone-400 dark:text-night-600 italic">No placement data.</p>
  const withPurchases = rows.filter(r => r.purchases >= 3 && r.cpa > 0)
  const bestCpa  = withPurchases.length > 0 ? withPurchases.reduce((b, r) => r.cpa < b.cpa ? r : b) : null
  const totalSpd = rows.reduce((s, r) => s + r.spend, 0)

  return (
    <div className="space-y-2">
      {bestCpa && (
        <div className="flex items-center gap-1.5 text-[11px] mb-3">
          <span className="text-stone-400 dark:text-night-600">Best CPA format:</span>
          <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium ${PLATFORM_CLS[bestCpa.platform] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"}`}>
            {humanize(bestCpa.platform)}
          </span>
          <span className="text-stone-700 dark:text-night-200 font-medium">{humanize(bestCpa.position)}</span>
          <span className="text-stone-400 dark:text-night-600 tabular-nums">— {fmtCurrency(bestCpa.cpa)} CPA</span>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-stone-100 dark:border-night-850">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-night-900 border-b border-stone-100 dark:border-night-850 text-stone-400 dark:text-night-500">
              <th className="px-2 py-1.5 text-left font-medium min-w-[140px]">Format</th>
              <th className="px-2 py-1.5 text-right font-medium">Spend %</th>
              <th className="px-2 py-1.5 text-right font-medium">Hook %</th>
              <th className="px-2 py-1.5 text-right font-medium">Orders</th>
              <th className="px-2 py-1.5 text-right font-medium">CPA</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map(r => {
              const isBest = bestCpa && r.platform === bestCpa.platform && r.position === bestCpa.position
              return (
                <tr key={`${r.platform}:${r.position}`} className={`border-b border-stone-50 dark:border-night-875 last:border-0 ${isBest ? "bg-emerald-500/[0.04]" : ""}`}>
                  <td className="px-2 py-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`rounded border px-1 py-0.5 text-[9px] font-medium ${PLATFORM_CLS[r.platform] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"}`}>
                        {humanize(r.platform)}
                      </span>
                      <span className={isBest ? "text-emerald-500 font-medium" : "text-stone-700 dark:text-night-200"}>{humanize(r.position)}</span>
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">
                    {totalSpd > 0 ? fmtPct(r.spendPct * 100) : "—"}
                  </td>
                  <td className={`px-2 py-1.5 text-right tabular-nums ${r.hookRate * 100 >= 20 ? "text-emerald-500 font-medium" : "text-stone-500 dark:text-night-400"}`}>
                    {r.hookRate > 0 ? fmtPct(r.hookRate * 100) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-stone-500 dark:text-night-400">
                    {r.purchases > 0 ? fmtCount(r.purchases) : "—"}
                  </td>
                  <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${isBest ? "text-emerald-500" : r.cpa > 0 ? "text-stone-600 dark:text-night-300" : "text-stone-300 dark:text-night-700"}`}>
                    {r.cpa > 0 ? fmtCurrency(r.cpa) : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-stone-300 dark:text-night-700">Orders = pixel-attributed · CPA shown only where orders ≥ 3</p>
    </div>
  )
}

function GeographySection({ rows }: { rows: ReturnType<typeof parseRegion> }) {
  if (rows.length === 0) return <p className="text-xs text-stone-400 dark:text-night-600 italic">No regional data.</p>
  const maxPct = rows[0]?.spendPct ?? 0.001
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={r.region} className="flex items-center gap-2 text-[11px]">
          <span className={`w-5 shrink-0 text-[9px] tabular-nums text-stone-300 dark:text-night-700`}>{i + 1}</span>
          <span className={`w-28 shrink-0 truncate font-medium ${i === 0 ? "text-indigo-400" : "text-stone-600 dark:text-night-300"}`} title={r.region}>
            {r.region}
          </span>
          <SpendBar pct={r.spendPct} max={maxPct} />
          <span className="w-8 text-right tabular-nums text-stone-400 dark:text-night-600">{fmtPct(r.spendPct * 100)}</span>
          <span className="w-12 text-right tabular-nums text-stone-500 dark:text-night-400">
            {r.ctr > 0 ? `${(r.ctr * 100).toFixed(1)}%` : "—"}
          </span>
        </div>
      ))}
      <p className="text-[9px] text-stone-300 dark:text-night-700 pt-0.5">% of ad spend · CTR · top 8 regions</p>
    </div>
  )
}

function BuyerProfileSection({ buyer, topProducts }: { buyer: BuyerProfile; topProducts: Record<string, unknown>[] }) {
  const products = topProducts.map(r => ({
    title:    String(r[`${PP}.product_title`] ?? ""),
    qty:      n(r[`${PP}.total_quantity`]),
    revenue:  n(r[`${PP}.net_line_revenue_ex_gst`]),
  })).filter(p => p.title)

  const ncrPct = buyer.ncrBase > 0 ? buyer.ncrRevenue / buyer.ncrBase : 0

  return (
    <div className="space-y-4">
      {/* Buyer metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">Real AOV</p>
          <p className="text-sm font-semibold tabular-nums text-stone-800 dark:text-night-100 mt-0.5">
            {buyer.aov > 0 ? fmtCurrency(buyer.aov) : "—"}
          </p>
          <p className="text-[9px] text-stone-400 dark:text-night-600">attributed</p>
        </div>
        <div>
          <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">New Customer</p>
          <p className={`text-sm font-semibold tabular-nums mt-0.5 ${ncrPct > 0.5 ? "text-emerald-500" : ncrPct > 0 ? "text-stone-800 dark:text-night-100" : "text-stone-400 dark:text-night-600"}`}>
            {ncrPct > 0 ? fmtPct(ncrPct * 100) : "—"}
          </p>
          <p className="text-[9px] text-stone-400 dark:text-night-600">of revenue</p>
        </div>
        <div>
          <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">Orders</p>
          <p className="text-sm font-semibold tabular-nums text-stone-800 dark:text-night-100 mt-0.5">
            {buyer.orders > 0 ? fmtCount(buyer.orders) : "—"}
          </p>
          <p className="text-[9px] text-stone-400 dark:text-night-600">attributed</p>
        </div>
      </div>

      {/* Top products */}
      {products.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-stone-400 dark:text-night-600 uppercase tracking-wide">Top products bought</p>
          {products.map((p, i) => {
            const maxRev = products[0]?.revenue ?? 1
            return (
              <div key={p.title} className="flex items-center gap-2 text-[11px]">
                <span className="text-[9px] w-4 shrink-0 text-stone-300 dark:text-night-700 tabular-nums">{i + 1}</span>
                <span className={`flex-1 truncate font-medium ${i === 0 ? "text-stone-700 dark:text-night-200" : "text-stone-600 dark:text-night-300"}`} title={p.title}>
                  {p.title}
                </span>
                <div className="w-16 h-1.5 rounded-full bg-stone-100 dark:bg-night-850 shrink-0">
                  <div className="h-1.5 rounded-full bg-emerald-500/50" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                </div>
                <span className="w-14 text-right tabular-nums text-stone-400 dark:text-night-600 shrink-0">{fmtCurrency(p.revenue)}</span>
              </div>
            )
          })}
          <p className="text-[9px] text-stone-300 dark:text-night-700">All-channel Shopify revenue</p>
        </div>
      )}
    </div>
  )
}

function ContentDNASection({ cats }: { cats: ContentCat[] }) {
  if (cats.length === 0) return <p className="text-xs text-stone-400 dark:text-night-600 italic">No tagged ad data for content DNA.</p>
  const maxRoas = cats[0]?.roas ?? 0.001
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cats.filter(c => c.isTop).map(c => (
          <span key={c.name} className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium ${CAT_COLORS[c.name] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"}`}>
            {c.name.split(" ")[0]}
            <span className="opacity-70 tabular-nums">{c.roas.toFixed(1)}×</span>
          </span>
        ))}
        {cats.filter(c => c.isTop).length === 0 && (
          <p className="text-[11px] text-stone-400 dark:text-night-600 italic">Insufficient tagged ad data</p>
        )}
      </div>
      <div className="space-y-1.5">
        {cats.slice(0, 6).map(c => (
          <div key={c.name} className="flex items-center gap-2 text-[11px]">
            <span className={`w-3 h-3 rounded-sm shrink-0 ${(CAT_COLORS[c.name] ?? "").replace(/text-\S+/g, "").replace(/border-\S+/g, "").trim()}`} />
            <span className={`flex-1 font-medium truncate ${c.isTop ? "text-stone-700 dark:text-night-200" : "text-stone-500 dark:text-night-400"}`} title={c.name}>
              {c.name}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-stone-100 dark:bg-night-850 shrink-0">
              <div className="h-1.5 rounded-full bg-indigo-500/60" style={{ width: `${(c.roas / maxRoas) * 100}%` }} />
            </div>
            <span className={`w-10 text-right tabular-nums shrink-0 ${c.isTop ? "text-emerald-500 font-medium" : "text-stone-400 dark:text-night-600"}`}>
              {c.roas.toFixed(1)}×
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-stone-300 dark:text-night-700">Split-credit ROAS · tagged ads only · top 3 = buyer content DNA</p>
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({ winners }: { winners: Winners }) {
  const chips: { label: string; hint: string; cls: string }[] = []
  if (winners.gender) chips.push({ label: humanize(winners.gender), hint: "best-engaging gender", cls: winners.gender.toLowerCase() === "female" ? "text-rose-400 border-rose-500/30 bg-rose-500/10" : "text-sky-400 border-sky-500/30 bg-sky-500/10" })
  if (winners.age)    chips.push({ label: winners.age,              hint: "best-engaging age",    cls: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" })
  if (winners.device) chips.push({ label: winners.device,           hint: "top device",           cls: "text-stone-600 dark:text-night-300 border-stone-300 dark:border-night-700 bg-stone-50 dark:bg-night-850" })
  if (winners.region) chips.push({ label: winners.region,           hint: "top region by spend",  cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" })
  if (winners.format) chips.push({ label: winners.format,           hint: "best CPA format",      cls: "text-pink-400 border-pink-500/30 bg-pink-500/10" })
  winners.topCategories.slice(0, 2).forEach(cat => chips.push({
    label: cat, hint: "content DNA", cls: "text-teal-400 border-teal-500/30 bg-teal-500/10"
  }))

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Ideal Buyer Profile</p>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c.label}
                  title={c.hint}
                  className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${c.cls}`}
                >
                  {c.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 dark:text-night-600 italic">Not enough data to build ICP — check date range and brand filter.</p>
          )}
        </div>
        <div className="shrink-0 text-right space-y-0.5">
          {winners.aov > 0 && (
            <div>
              <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">AOV</p>
              <p className="text-sm font-semibold tabular-nums text-stone-800 dark:text-night-100">{fmtCurrency(winners.aov)}</p>
            </div>
          )}
          {winners.ncrPct > 0 && (
            <div className="mt-1.5">
              <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">New customers</p>
              <p className={`text-sm font-semibold tabular-nums ${winners.ncrPct > 0.5 ? "text-emerald-500" : "text-stone-700 dark:text-night-200"}`}>{fmtPct(winners.ncrPct * 100)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  icpData: ICPData
  categoryBreakdown: Record<string, unknown>[]
}

export function ICPProfile({ icpData, categoryBreakdown }: Props) {
  const { ageGenderParsed, devices, regions, placements, buyer, content, winners } = useMemo(() => {
    const ageGenderParsed = parseAgeGender(icpData.ageGender)
    const devices         = parseDevice(icpData.device)
    const regions         = parseRegion(icpData.region)
    const placements      = parsePlacement(icpData.placement)
    const buyer           = parseBuyerProfile(icpData.metaBuyer, categoryBreakdown)
    const content         = parseContentDNA(categoryBreakdown)
    const winners         = deriveWinners(ageGenderParsed, devices, regions, placements, buyer, content)
    return { ageGenderParsed, devices, regions, placements, buyer, content, winners }
  }, [icpData, categoryBreakdown])

  return (
    <div className="space-y-4">
      {/* ICP summary */}
      <SummaryCard winners={winners} />

      {/* Row 1: Demographics + Device */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Demographics" subtitle="Who engages with your ads — engagement score: CTR 40% · Hook 35% · Hold 25%">
            <AgeGenderSection data={ageGenderParsed} />
          </ChartCard>
        </div>
        <ChartCard title="Device" subtitle="Where your audience watches">
          <DeviceSection rows={devices} />
        </ChartCard>
      </div>

      {/* Row 2: Format + Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Format Performance" subtitle="Placement-level CPA from pixel purchases" cube={`${G} · placement`}>
          <FormatSection rows={placements} />
        </ChartCard>
        <ChartCard title="Geographic Reach" subtitle="Where your ad spend and engagement concentrates">
          <GeographySection rows={regions} />
        </ChartCard>
      </div>

      {/* Row 3: Buyer Profile + Content DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Buyer Profile" subtitle="Warehouse-attributed Meta buyers + Shopify top products">
          <BuyerProfileSection buyer={buyer} topProducts={icpData.topProducts} />
        </ChartCard>
        <ChartCard title="Content DNA" subtitle="Which neuro-tag categories your buyers respond to most">
          <ContentDNASection cats={content} />
        </ChartCard>
      </div>
    </div>
  )
}
