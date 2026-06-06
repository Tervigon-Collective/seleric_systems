"use client"

import { useState } from "react"
import { fmtCount, fmtCurrency, measureFormat, type MeasureFormat } from "@/components/charts/format"
import { COGS_BREAKDOWN_LINES, type CogsBreakdown } from "@/lib/dashboard/cogs-breakdown"

interface MetricDef {
  label: string
  key: string
  format?: MeasureFormat
}

interface Props {
  current: Record<string, unknown>
  prior: Record<string, unknown>
  priorLabel: string
  metrics: MetricDef[]
  cogsBreakdown: CogsBreakdown
}

type BreakdownLine = { label: string; value: string; isSubtotal?: boolean; isTotal?: boolean }

function fmt(v: unknown, format: MeasureFormat): string {
  const n = Number(v)
  if (!isFinite(n)) return "—"
  if (format === "count") return fmtCount(n)
  if (format === "ratio") return `${n.toFixed(2)}x`
  return fmtCurrency(n)
}

function pct(curr: unknown, prev: unknown): number | undefined {
  const c = Number(curr)
  const p = Number(prev)
  if (!isFinite(c) || !isFinite(p) || p === 0) return undefined
  return ((c - p) / Math.abs(p)) * 100
}

function netSales(current: Record<string, unknown>): number {
  return Number(
    current["canonical_pnl.net_sales_excl_tax"] ??
      current["canonical_pnl.net_revenue_excl_tax"] ??
      0,
  )
}

function buildBreakdown(
  kpiKey: string,
  current: Record<string, unknown>,
  cogsBreakdown: CogsBreakdown,
): BreakdownLine[] | null {
  const get = (k: string) => Number(current[k] ?? 0)

  if (kpiKey === "canonical_pnl.net_profit") {
    const sales = netSales(current)
    const productCost = get("canonical_pnl.product_cost")
    const grossProfit = get("canonical_pnl.gross_profit")
    const adSpend = get("canonical_pnl.total_ad_spend")
    const opsCosts =
      cogsBreakdown.shippingCost +
      cogsBreakdown.packagingCost +
      cogsBreakdown.gatewayFees +
      cogsBreakdown.rtoCost
    const netProfit = get("canonical_pnl.net_profit")
    return [
      { label: "Net sales ex GST", value: fmtCurrency(sales) },
      { label: "− Product COGS", value: fmtCurrency(productCost) },
      { label: "= Gross profit", value: fmtCurrency(grossProfit), isSubtotal: true },
      { label: "− Ad spend", value: fmtCurrency(adSpend) },
      { label: "= Before ops costs", value: fmtCurrency(grossProfit - adSpend), isSubtotal: true },
      { label: "− Shipping, packaging, fees, RTO", value: fmtCurrency(opsCosts) },
      { label: "= Net profit", value: fmtCurrency(netProfit), isTotal: true },
    ]
  }

  if (kpiKey === "canonical_pnl.gross_profit") {
    const sales = netSales(current)
    const productCost = get("canonical_pnl.product_cost")
    const grossProfit = get("canonical_pnl.gross_profit")
    return [
      { label: "Net sales ex GST", value: fmtCurrency(sales) },
      { label: "− Product COGS", value: fmtCurrency(productCost) },
      { label: "= Gross profit", value: fmtCurrency(grossProfit), isTotal: true },
    ]
  }

  if (kpiKey === "canonical_pnl.product_cost") {
    const lines: BreakdownLine[] = COGS_BREAKDOWN_LINES.map(({ label, key }) => ({
      label,
      value: fmtCurrency(cogsBreakdown[key]),
    }))
    lines.push({
      label: "Total operating cost",
      value: fmtCurrency(cogsBreakdown.totalOperatingCost),
      isTotal: true,
    })
    return lines
  }

  if (kpiKey === "canonical_pnl.total_ad_spend") {
    const meta = get("canonical_pnl.meta_spend")
    const google = get("canonical_pnl.google_spend")
    const total = get("canonical_pnl.total_ad_spend")
    const lines: BreakdownLine[] = []
    if (current["canonical_pnl.meta_spend"] != null) {
      lines.push({ label: "Meta", value: fmtCurrency(meta) })
    }
    if (current["canonical_pnl.google_spend"] != null) {
      lines.push({ label: "Google", value: fmtCurrency(google) })
    }
    if (lines.length) {
      lines.push({ label: "Total ad spend", value: fmtCurrency(total), isTotal: true })
      return lines
    }
    return null
  }

  if (kpiKey === "canonical_pnl.net_sales_excl_tax" || kpiKey === "canonical_pnl.net_revenue_excl_tax") {
    const grossSales = get("canonical_pnl.gross_sales_excl_tax")
    const discounts = get("canonical_pnl.total_discounts_excl_tax")
    const returns = get("canonical_pnl.returns_excl_tax")
    const cancelled = get("canonical_pnl.cancelled_revenue")
    const netSalesVal = netSales(current)
    if (!current["canonical_pnl.gross_sales_excl_tax"]) return null
    const lines: BreakdownLine[] = [
      { label: "Gross sales ex GST", value: fmtCurrency(grossSales) },
    ]
    if (current["canonical_pnl.cancelled_revenue"] != null) {
      lines.push({ label: "incl. cancelled (audit)", value: fmtCurrency(cancelled) })
    }
    lines.push(
      { label: "− Discounts", value: fmtCurrency(discounts) },
      { label: "− Returns", value: fmtCurrency(returns) },
      { label: "= Net sales ex GST", value: fmtCurrency(netSalesVal), isTotal: true },
    )
    return lines
  }

  if (kpiKey === "canonical_pnl.mer") {
    const sales = netSales(current)
    const adSpend = get("canonical_pnl.total_ad_spend")
    const mer = adSpend !== 0 ? sales / adSpend : 0
    return [
      { label: "Net sales ex GST", value: fmtCurrency(sales) },
      { label: "÷ Ad spend", value: fmtCurrency(adSpend) },
      { label: "= MER", value: `${mer.toFixed(2)}x`, isTotal: true },
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

export function PnlHeadlineKpis({ current, prior, priorLabel, metrics, cogsBreakdown }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  return (
    <div className="flex flex-wrap gap-3">
      {metrics.map(({ label, key, format }) => {
        const resolvedFormat = format ?? measureFormat(key)
        const currVal = current[key]
        const prevVal = prior[key]
        const trend = pct(currVal, prevVal)
        const invert = /spend|cost|cpc|cpm|cpa/i.test(key)
        const trendPositive = invert ? (trend ?? 0) < 0 : (trend ?? 0) > 0
        const breakdown = buildBreakdown(key, current, cogsBreakdown)
        const isExpanded = expandedKey === key
        const isClickable = breakdown !== null

        return (
          <div
            key={key}
            onClick={() => isClickable && setExpandedKey(isExpanded ? null : key)}
            className={`rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-850 px-4 py-3 flex flex-col gap-1 min-w-[140px] transition-colors ${
              isClickable
                ? "cursor-pointer hover:bg-stone-100 dark:hover:bg-night-800 select-none"
                : ""
            } ${isExpanded ? "bg-stone-100 dark:bg-night-800" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500 dark:text-night-500 uppercase tracking-wide">
                {label}
              </span>
              {isClickable && (
                <span className="text-[9px] text-stone-400 dark:text-night-600">
                  {isExpanded ? "▲" : "▼"}
                </span>
              )}
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-night-50">
              {fmt(currVal, resolvedFormat)}
            </span>
            <span className="text-xs text-stone-500 dark:text-night-500">
              Prior ({priorLabel}): {fmt(prevVal, resolvedFormat)}
            </span>
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
