"use client"

import { useMemo } from "react"
import { fmtCurrency } from "@/components/charts/format"
import type { PnlGranularity } from "@/components/charts/PnlCandlestickChart"
import {
  TIME_SERIES_TABLE_ROWS,
  visibleTimeSeriesRows,
  type TimeSeriesRowKind,
} from "@/lib/dashboard/pnl-breakdown-constants"

const P = "canonical_pnl"
const DATE_RE = /report_date|report_month/i

function findDateKey(rows: Record<string, unknown>[]): string {
  if (!rows.length) return `${P}.report_date`
  return Object.keys(rows[0]).find((k) => DATE_RE.test(k)) ?? `${P}.report_date`
}

function formatLabel(iso: string, granularity: PnlGranularity): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso.slice(0, 10)
    return granularity === "month"
      ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  } catch {
    return iso.slice(0, 10)
  }
}

function cellValue(row: Record<string, unknown>, key: string): number | null {
  const raw = row[key]
  if (raw == null || raw === "") return null
  const n = Number(raw)
  return isFinite(n) ? n : null
}

function displayValue(v: number, kind: TimeSeriesRowKind): number {
  if (kind === "cost") return Math.abs(v)
  return v
}

function valueClass(v: number, kind: TimeSeriesRowKind): string {
  if (kind === "total") {
    return v >= 0
      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
      : "text-red-500 dark:text-red-400 font-semibold"
  }
  if (kind === "subtotal") return "text-stone-800 dark:text-night-100 font-medium"
  if (kind === "cost") return "text-stone-500 dark:text-night-400"
  return "text-stone-700 dark:text-night-200"
}

function totalClass(v: number, kind: TimeSeriesRowKind): string {
  if (kind === "total") {
    return v >= 0
      ? "text-emerald-600 dark:text-emerald-400 font-bold"
      : "text-red-500 dark:text-red-400 font-bold"
  }
  if (kind === "subtotal") return "text-stone-900 dark:text-night-50 font-bold"
  if (kind === "cost") return "text-stone-600 dark:text-night-300 font-semibold"
  return "text-stone-800 dark:text-night-100 font-bold"
}

interface Props {
  rows: Record<string, unknown>[]
  granularity: PnlGranularity
}

export function PnlTimeSeriesTable({ rows, granularity }: Props) {
  const dateKey = useMemo(() => findDateKey(rows), [rows])

  const tableRows = useMemo(
    () => visibleTimeSeriesRows(rows, TIME_SERIES_TABLE_ROWS),
    [rows]
  )

  const dateCols = useMemo(
    () => rows.map((r) => formatLabel(String(r[dateKey] ?? ""), granularity)),
    [rows, dateKey, granularity]
  )

  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    for (const { resolvedKey } of tableRows) {
      let sum = 0
      for (const row of rows) {
        const v = cellValue(row, resolvedKey)
        if (v != null) sum += v
      }
      map[resolvedKey] = sum
    }
    return map
  }, [rows, tableRows])

  if (!rows.length) {
    return <p className="text-sm text-stone-500 dark:text-night-500 py-4">No data available.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-max">
        <thead>
          <tr className="bg-stone-50 dark:bg-night-850">
            <th className="sticky left-0 z-10 bg-stone-50 dark:bg-night-850 text-left px-3 py-2 text-[10px] uppercase tracking-wide text-stone-500 dark:text-night-500 font-medium min-w-[200px] border-b border-r border-stone-200 dark:border-night-800">
              Line item
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-semibold text-stone-600 dark:text-night-300 min-w-[80px] border-b border-l-2 border-stone-300 dark:border-night-700 whitespace-nowrap bg-stone-100/80 dark:bg-night-800/60">
              Total
            </th>
            {dateCols.map((label, i) => (
              <th
                key={i}
                className="px-2 py-2 text-right text-[10px] font-medium text-stone-500 dark:text-night-500 min-w-[72px] border-b border-stone-200 dark:border-night-800 whitespace-nowrap"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map(({ resolvedKey, label, kind, indent }) => {
            const isSection = kind === "subtotal" || kind === "total"
            const rawTotal = totals[resolvedKey]
            const total = displayValue(rawTotal, kind)
            return (
              <tr
                key={resolvedKey}
                className={`${isSection ? "border-t-2 border-stone-300 dark:border-night-700" : "border-t border-stone-100 dark:border-night-800/60"}`}
              >
                <td
                  className={`sticky left-0 z-10 px-3 py-1.5 whitespace-nowrap border-r border-stone-200 dark:border-night-800 ${
                    isSection
                      ? "bg-stone-50 dark:bg-night-850 font-medium text-stone-700 dark:text-night-200"
                      : "bg-white dark:bg-night-900 text-stone-500 dark:text-night-400"
                  }`}
                  style={indent ? { paddingLeft: `${12 + indent * 12}px` } : undefined}
                >
                  {label}
                </td>

                <td
                  className={`px-3 py-1.5 text-right tabular-nums border-l-2 border-stone-300 dark:border-night-700 bg-stone-100/60 dark:bg-night-800/40 ${totalClass(rawTotal, kind)}`}
                >
                  {fmtCurrency(total)}
                </td>

                {rows.map((row, i) => {
                  const raw = cellValue(row, resolvedKey)
                  const valid = raw != null
                  const display = valid ? displayValue(raw!, kind) : null
                  return (
                    <td
                      key={i}
                      className={`px-2 py-1.5 text-right tabular-nums ${
                        valid
                          ? valueClass(raw!, kind)
                          : "text-stone-300 dark:text-night-700"
                      } ${isSection ? "bg-stone-50/60 dark:bg-night-850/60" : ""}`}
                    >
                      {valid ? fmtCurrency(display!) : "—"}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
