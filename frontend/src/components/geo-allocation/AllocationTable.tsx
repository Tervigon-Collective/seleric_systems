"use client"

import { useState } from "react"
import type { GeoAllocationRow, ActionType } from "@/lib/dashboard/queries/geo-allocation"
import { ActionBadge } from "./ActionBadge"
import { WeatherBadge } from "./WeatherBadge"

const TABS: { label: string; action: ActionType | "ALL" }[] = [
  { label: "All",    action: "ALL" },
  { label: "Scale",  action: "SCALE" },
  { label: "Launch", action: "LAUNCH" },
  { label: "Switch", action: "SWITCH_PRODUCT" },
  { label: "Pause",  action: "PAUSE" },
  { label: "Hold",   action: "HOLD" },
]

function fmt(n: number, prefix = ""): string {
  if (!isFinite(n) || n === 0) return "—"
  if (Math.abs(n) >= 100_000) return `${prefix}${(n / 100_000).toFixed(1)}L`
  if (Math.abs(n) >= 1_000)   return `${prefix}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  return `${prefix}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function ScoreBar({ score }: { score: number }) {
  const w = Math.min(Math.max(score, 0), 100)
  const color =
    w >= 70 ? "bg-emerald-500 dark:bg-emerald-500" :
    w >= 40 ? "bg-amber-500 dark:bg-amber-500" :
              "bg-red-500 dark:bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-stone-100 dark:bg-night-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }} />
      </div>
      <span className="text-xs tabular-nums text-stone-600 dark:text-night-300">{w}</span>
    </div>
  )
}

interface Props {
  rows: GeoAllocationRow[]
}

export function AllocationTable({ rows }: Props) {
  const [activeTab, setActiveTab] = useState<ActionType | "ALL">("ALL")
  const [search, setSearch] = useState("")

  const filtered = rows.filter((r) => {
    if (activeTab !== "ALL" && r.recommended_action !== activeTab) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.city.toLowerCase().includes(q) ||
        r.product_name.toLowerCase().includes(q) ||
        r.campaign_name.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = Object.fromEntries(
    TABS.map((t) => [
      t.action,
      t.action === "ALL" ? rows.length : rows.filter((r) => r.recommended_action === t.action).length,
    ])
  )

  return (
    <div className="rounded-xl border border-insight-border dark:border-night-800 bg-white dark:bg-night-900 shadow-sm dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-insight-border dark:border-night-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-stone-900 dark:text-night-50">Allocation Actions</h2>
          <p className="text-xs text-stone-500 dark:text-night-500 mt-0.5">{filtered.length} of {rows.length} campaigns · top 500 by score</p>
        </div>
        <input
          type="search"
          placeholder="Filter city, product, campaign..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-stone-200 dark:border-night-700 bg-stone-50 dark:bg-night-850 px-3 py-1.5 text-xs text-stone-800 dark:text-night-100 placeholder:text-stone-400 dark:placeholder:text-night-500 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-night-600 w-64"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-insight-border dark:border-night-800 overflow-x-auto">
        {TABS.map((tab) => {
          const count = counts[tab.action] ?? 0
          const active = activeTab === tab.action
          return (
            <button
              key={tab.action}
              onClick={() => setActiveTab(tab.action)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "border-stone-900 dark:border-night-100 text-stone-900 dark:text-night-50"
                  : "border-transparent text-stone-500 dark:text-night-400 hover:text-stone-800 dark:hover:text-night-200"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="rounded-full bg-stone-100 dark:bg-night-800 px-1.5 py-0.5 text-[10px] tabular-nums">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-night-875">
              {["City", "Product", "Campaign", "Action", "Weather", "ROAS", "Score", "7d Orders", "Spend", "Reason"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-stone-500 dark:text-night-400 whitespace-nowrap border-b border-stone-100 dark:border-night-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-stone-400 dark:text-night-500">
                  No campaigns match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-50 dark:border-night-875 hover:bg-stone-50/60 dark:hover:bg-night-875/60 transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-stone-800 dark:text-night-100 whitespace-nowrap">
                    {row.city}
                    {row.state ? <span className="text-stone-400 dark:text-night-500 font-normal"> · {row.state}</span> : null}
                  </td>
                  <td className="px-3 py-2.5 text-stone-700 dark:text-night-200 max-w-[160px]">
                    <span className="block truncate" title={row.product_name}>{row.product_name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-stone-500 dark:text-night-400 max-w-[180px]">
                    <span className="block truncate" title={row.campaign_name}>{row.campaign_name || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <ActionBadge action={row.recommended_action} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <WeatherBadge stage={row.weather_stage} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-stone-700 dark:text-night-200 whitespace-nowrap">
                    {row.roas > 0 ? `${row.roas.toFixed(2)}x` : "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <ScoreBar score={row.opportunity_score} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-stone-600 dark:text-night-300 whitespace-nowrap">
                    {row.orders_7d || "—"}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-stone-600 dark:text-night-300 whitespace-nowrap">
                    {row.effective_city_spend > 0 ? fmt(row.effective_city_spend, "₹") : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-stone-500 dark:text-night-400 max-w-[280px]">
                    <span className="block truncate" title={row.reason}>{row.reason}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
