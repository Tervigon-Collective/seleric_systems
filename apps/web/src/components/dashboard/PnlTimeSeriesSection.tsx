"use client"

import { useState, useMemo } from "react"
import { ChartCard } from "@/components/charts/ChartCard"
import { PnlCandlestickChart, type PnlGranularity } from "@/components/charts/PnlCandlestickChart"
import { PnlTimeSeriesTable } from "./PnlTimeSeriesTable"

interface Props {
  dailyRows: Record<string, unknown>[]
  spanDays: number
}

const DATE_RE = /report_date|report_month/i

function groupByMonth(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  if (!rows.length) return []
  const dk = Object.keys(rows[0]).find((k) => DATE_RE.test(k)) ?? "canonical_pnl.report_date"
  const map = new Map<string, Record<string, unknown>>()

  for (const row of rows) {
    const monthKey = String(row[dk] ?? "").slice(0, 7)
    if (monthKey.length < 7) continue
    if (!map.has(monthKey)) {
      map.set(monthKey, { [dk]: `${monthKey}-01T00:00:00.000` })
    }
    const agg = map.get(monthKey)!
    for (const [k, v] of Object.entries(row)) {
      if (k === dk) continue
      const prev = Number(agg[k] ?? 0)
      const curr = Number(v ?? 0)
      if (isFinite(prev) && isFinite(curr)) agg[k] = prev + curr
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a[dk]).localeCompare(String(b[dk])),
  )
}

export function PnlTimeSeriesSection({ dailyRows, spanDays }: Props) {
  const [granularity, setGranularity] = useState<PnlGranularity>(spanDays > 45 ? "month" : "day")

  const displayRows = useMemo(
    () => (granularity === "month" ? groupByMonth(dailyRows) : dailyRows),
    [dailyRows, granularity],
  )

  if (!dailyRows.length) return null

  return (
    <div className="xl:col-span-2 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500 dark:text-night-500">View by:</span>
        {(["day", "month"] as PnlGranularity[]).map((g) => (
          <button
            key={g}
            onClick={() => setGranularity(g)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              granularity === g
                ? "bg-stone-800 dark:bg-night-200 text-white dark:text-night-900"
                : "bg-stone-100 dark:bg-night-800 text-stone-600 dark:text-night-300 hover:bg-stone-200 dark:hover:bg-night-700"
            }`}
          >
            {g === "day" ? "Daily" : "Monthly"}
          </button>
        ))}
        <span className="ml-1 text-[10px] text-stone-400 dark:text-night-600">
          {displayRows.length} period{displayRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ChartCard
        title="P&L Candlestick"
        subtitle="High = net sales · Body top = gross profit · Body bottom = net profit · Green = profitable"
        cube="canonical_pnl"
      >
        <PnlCandlestickChart rows={displayRows} granularity={granularity} height={320} />
      </ChartCard>

      <ChartCard
        title="P&L Time Series"
        subtitle="Gross sales → net sales → product COGS → gross profit → ad spend → ops costs → net profit · scroll right"
        cube="canonical_pnl"
      >
        <PnlTimeSeriesTable rows={displayRows} granularity={granularity} />
      </ChartCard>
    </div>
  )
}
