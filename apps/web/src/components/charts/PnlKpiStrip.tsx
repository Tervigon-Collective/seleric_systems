"use client"

import { useState } from "react"
import { COGS_BREAKDOWN_LINES, type CogsBreakdown } from "@/lib/dashboard/cogs-breakdown"
import { PNL_KPI_LABELS, PNL_KPI_MEASURES } from "@/lib/dashboard/pnl-kpi-constants"

interface Props {
  current: Record<string, unknown>
  prior: Record<string, unknown>
  priorLabel: string
  cogsBreakdownCurrent: CogsBreakdown
  cogsBreakdownPrior: CogsBreakdown
  /** simple = value + delta only (Executive Overview); detailed = prior + expandable breakdown */
  variant?: "simple" | "detailed"
}

function fmtNum(v: unknown, key: string): string {
  if (v == null || v === "") return "—"
  const n = Number(v)
  if (!isFinite(n)) return String(v)
  if (/order|count/i.test(key)) return n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
  if (/pct|margin/i.test(key)) return `${n.toFixed(1)}%`
  const abs = Math.abs(n)
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (abs >= 1_000) return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  return `₹${n.toFixed(2)}`
}

function fmtCurrency(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`
  if (abs >= 1_000) return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  return `₹${n.toFixed(0)}`
}

function pct(curr: unknown, prev: unknown): number | undefined {
  const c = Number(curr)
  const p = Number(prev)
  if (!isFinite(c) || !isFinite(p) || p === 0) return undefined
  return ((c - p) / Math.abs(p)) * 100
}

type BreakdownLine = { label: string; value: string; isSubtotal?: boolean; isTotal?: boolean; prefix?: string }

function buildBreakdown(
  kpiKey: string,
  current: Record<string, unknown>,
  cogsBreakdown: CogsBreakdown,
): BreakdownLine[] | null {
  const get = (k: string) => Number(current[k] ?? 0)

  if (kpiKey === "daily_pnl.net_profit") {
    const salesExGst = get("daily_pnl.total_sales_ex_gst")
    const cogs = get("daily_pnl.total_cogs")
    const grossProfit = get("daily_pnl.gross_profit")
    const adSpend = get("daily_pnl.total_ad_spend")
    const contribution = grossProfit - adSpend
    const opsCosts =
      cogsBreakdown.shippingCost +
      cogsBreakdown.packagingCost +
      cogsBreakdown.gatewayFees +
      cogsBreakdown.rtoCost
    const netProfit = get("daily_pnl.net_profit")
    return [
      { label: "Net sales ex GST", value: fmtCurrency(salesExGst) },
      { label: "− COGS", value: fmtCurrency(cogs) },
      { label: "= Gross profit", value: fmtCurrency(grossProfit), isSubtotal: true },
      { label: "− Ad spend", value: fmtCurrency(adSpend) },
      { label: "= Before ops costs", value: fmtCurrency(contribution), isSubtotal: true },
      { label: "− Shipping, packaging, fees, RTO", value: fmtCurrency(opsCosts) },
      { label: "= Net profit", value: fmtCurrency(netProfit), isTotal: true },
    ]
  }

  if (kpiKey === "daily_pnl.gross_profit") {
    const salesExGst = get("daily_pnl.total_sales_ex_gst")
    const cogs = get("daily_pnl.total_cogs")
    const grossProfit = get("daily_pnl.gross_profit")
    return [
      { label: "Net sales ex GST", value: fmtCurrency(salesExGst) },
      { label: "− COGS", value: fmtCurrency(cogs) },
      { label: "= Gross profit", value: fmtCurrency(grossProfit), isTotal: true },
    ]
  }

  if (kpiKey === "daily_pnl.total_cogs") {
    const lines: BreakdownLine[] = COGS_BREAKDOWN_LINES.map(({ label, key }) => ({
      label,
      value: fmtCurrency(cogsBreakdown[key]),
    }))
    lines.push({
      label: "Total COGS",
      value: fmtCurrency(cogsBreakdown.totalOperatingCost),
      isTotal: true,
    })
    return lines
  }

  if (kpiKey === "daily_pnl.gross_margin_pct") {
    const grossProfit = get("daily_pnl.gross_profit")
    const salesExGst = get("daily_pnl.total_sales_ex_gst")
    const marginPct = salesExGst !== 0 ? (grossProfit / salesExGst) * 100 : 0
    return [
      { label: "Gross profit", value: fmtCurrency(grossProfit) },
      { label: "÷ Net sales ex GST", value: fmtCurrency(salesExGst) },
      { label: "= Gross margin", value: `${marginPct.toFixed(1)}%`, isTotal: true },
    ]
  }

  return null
}

function BreakdownList({ lines }: { lines: BreakdownLine[] }) {
  return (
    <ul className="mt-1 space-y-0.5 border-t border-stone-200 dark:border-night-800 pt-1.5">
      {lines.map((line, i) => (
        <li
          key={i}
          className={`flex justify-between gap-2 text-[10px] tabular-nums ${
            line.isTotal
              ? "font-medium text-stone-600 dark:text-night-400 pt-0.5 border-t border-stone-200/80 dark:border-night-800/80"
              : line.isSubtotal
              ? "font-medium text-stone-500 dark:text-night-500"
              : "text-stone-500 dark:text-night-500"
          }`}
        >
          <span>{line.label}</span>
          <span>{line.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** #01 P&L KPI strip — selected period total vs prior period. */
export function PnlKpiStrip({
  current,
  prior,
  priorLabel,
  cogsBreakdownCurrent,
  cogsBreakdownPrior: _cogsBreakdownPrior,
  variant = "detailed",
}: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const isSimple = variant === "simple"

  const hasData = PNL_KPI_MEASURES.some((key) => current[key] != null && current[key] !== "")
  if (!hasData) {
    return <p className="text-sm text-stone-500 dark:text-night-500">No P&L data for this period.</p>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {PNL_KPI_MEASURES.map((key) => {
        const trend = pct(current[key], prior[key])
        const invert = /spend|cogs/i.test(key)
        const trendPositive = invert ? (trend ?? 0) < 0 : (trend ?? 0) > 0
        const breakdown = isSimple ? null : buildBreakdown(key, current, cogsBreakdownCurrent)
        const isExpanded = !isSimple && expandedKey === key
        const isClickable = !isSimple && breakdown !== null

        return (
          <div
            key={key}
            onClick={() => isClickable && setExpandedKey(isExpanded ? null : key)}
            className={`rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-850 px-4 py-3 flex flex-col gap-1 min-w-[130px] transition-colors ${
              isClickable
                ? "cursor-pointer hover:bg-stone-100 dark:hover:bg-night-800 select-none"
                : ""
            } ${isExpanded ? "bg-stone-100 dark:bg-night-800" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500 dark:text-night-500 uppercase tracking-wide">
                {PNL_KPI_LABELS[key]}
              </span>
              {isClickable && (
                <span className="text-[9px] text-stone-400 dark:text-night-600">
                  {isExpanded ? "▲" : "▼"}
                </span>
              )}
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-night-50">{fmtNum(current[key], key)}</span>
            {!isSimple && (
              <span className="text-xs text-stone-500 dark:text-night-500">
                Prior ({priorLabel}): {fmtNum(prior[key], key)}
              </span>
            )}
            {trend !== undefined && (
              <span
                className={`text-xs font-medium ${
                  trendPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}% vs prior
              </span>
            )}
            {isExpanded && breakdown && <BreakdownList lines={breakdown} />}
          </div>
        )
      })}
    </div>
  )
}
