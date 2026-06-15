"use client"

import {
  formatInr,
  formatCount,
  formatRatio,
  prettyLabel,
  valueColor,
} from "@/lib/chat/visualization"
import { aggregatePeriod, bestMonthLabel } from "@/lib/chat/visualization/aggregate"
import { analyzeColumns } from "@/lib/chat/visualization/column-semantics"
import type { CubeRow } from "@/lib/chat/visualization/column-semantics"
import type { PeriodSummary } from "@/lib/chat/visualization"

function derivePeriodLabel(rows: CubeRow[], dateKey: string | null): string | null {
  if (!dateKey || !rows.length) return null
  const dates = rows
    .map((r) => String(r[dateKey] ?? "").slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}/.test(d))
    .sort()
  if (!dates.length) return null
  const fmt = (d: string) => {
    const dt = new Date(d)
    return isNaN(dt.getTime())
      ? d.slice(0, 7)
      : dt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
  }
  const first = dates[0]
  const last = dates[dates.length - 1]
  if (first.slice(0, 7) === last.slice(0, 7)) return fmt(first)
  return `${fmt(first)} – ${fmt(last)}`
}

function KpiTile({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-night-875 border border-insight-border dark:border-night-800 px-4 py-3 flex flex-col gap-1 min-w-[140px] flex-1">
      <span className="text-[11px] text-stone-500 dark:text-night-500 font-sans leading-tight">{label}</span>
      <span className={`text-xl font-semibold font-serif ${className}`}>{value}</span>
    </div>
  )
}

function formatSummaryValue(key: string, val: number | null): string {
  if (val == null) return "—"
  if (/ltv.?cac/i.test(key)) return formatRatio(val)
  if (/orders?/i.test(key)) return formatCount(val)
  if (/margin|pct|rate/i.test(key)) return `${val.toFixed(1)}%`
  return formatInr(val, { signed: /profit/i.test(key) })
}

export function buildKpiTiles(summary: PeriodSummary, seriesRows: CubeRow[]) {
  const profile = analyzeColumns(seriesRows)
  const tiles: { label: string; value: string; className: string }[] = []

  const pick = (pattern: RegExp) => {
    const key = Object.keys(summary).find((k) => pattern.test(k))
    return key ? { key, val: summary[key] as number } : null
  }

  const revenue = pick(/sales_ex|gross_revenue|revenue/i)
  const spend = pick(/ad_spend|spend/i)
  const grossProfit = pick(/gross_profit/i)
  const netProfit = pick(/net_profit/i)
  // Prefer orders_created (full placement universe). Fall back to total/net/active
  // only when the payload is missing the placement measure. Tile is labelled
  // accordingly below.
  const orders =
    pick(/\.orders_created$|orders_created/i) ??
    pick(/\.placed_orders$|placed_orders/i) ??
    pick(/\.orders$|^orders$/i) ??
    pick(/total_orders|net_orders|active_orders/i)
  const cac = summary["derived.cac"] ?? pick(/cac/i)?.val
  const ltv = summary["derived.ltv_estimate"]
  const ltvCac = summary["derived.ltv_cac"]

  if (revenue) {
    tiles.push({
      label: "Period revenue (ex-GST)",
      value: formatSummaryValue(revenue.key, revenue.val),
      className: "text-stone-900 dark:text-night-50",
    })
  }
  if (spend) {
    tiles.push({
      label: "Total ad spend",
      value: formatSummaryValue(spend.key, spend.val),
      className: "text-insight-cost",
    })
  }
  if (grossProfit) {
    tiles.push({
      label: "Total gross profit",
      value: formatSummaryValue(grossProfit.key, grossProfit.val),
      className: "text-insight-positive",
    })
  }
  if (netProfit) {
    const v = netProfit.val ?? 0
    tiles.push({
      label: "Total net profit",
      value: formatSummaryValue(netProfit.key, v),
      className: valueColor(netProfit.key, v),
    })
  }
  if (orders) {
    // Label hints which universe the count covers so a viewer doesn't conflate
    // placement counts with the financially-confirmed slice.
    const k = orders.key.toLowerCase()
    const ordersLabel =
      /orders_created|placed_orders|\.orders$|^orders$/.test(k)
        ? "Orders placed"
        : /active/.test(k)
          ? "Active orders"
          : /net/.test(k)
            ? "Net orders (excl. returns)"
            : "Orders (active + cancelled)"
    tiles.push({
      label: ordersLabel,
      value: formatCount(orders.val),
      className: "text-stone-900 dark:text-night-50",
    })
  }

  const revVal = revenue?.val ?? 0
  const ordVal = orders?.val ?? 0
  if (ordVal > 0 && revVal > 0) {
    const aov = revVal / ordVal
    tiles.push({
      label: "Blended AOV (approx)",
      value: formatInr(aov),
      className: "text-stone-900 dark:text-night-50",
    })
  }

  if (cac != null) {
    tiles.push({
      label: "Avg CAC (spend ÷ orders placed)",
      value: formatInr(cac),
      className: "text-insight-cost",
    })
  }

  if (grossProfit && revenue && revenue.val) {
    const margin = ((grossProfit.val ?? 0) / revenue.val) * 100
    const isImpossible = margin > 100 || margin < -100
    tiles.push({
      label: "Gross margin (avg)",
      value: isImpossible ? `⚠ ${margin.toFixed(1)}%` : `${margin.toFixed(1)}%`,
      className: isImpossible
        ? "text-red-600 dark:text-red-400"
        : "text-stone-900 dark:text-night-50",
    })
  }

  if (ltv != null) {
    tiles.push({
      label: "Estimated LTV (1yr horizon)",
      value: formatInr(ltv),
      className: "text-stone-900 dark:text-night-50",
    })
  }

  if (ltvCac != null) {
    tiles.push({
      label: "LTV : CAC ratio",
      value: formatRatio(ltvCac),
      className: Number(ltvCac) < 1 ? "text-orange-600" : "text-insight-cost",
    })
  }

  // Only show "best month" when there are multiple time points — meaningless for a single period.
  const profitKey = profile.columns.find((c) => c.metricRole === "profit" && /net/i.test(c.key))?.key
  if (seriesRows.length >= 2 && netProfit) {
    const best = bestMonthLabel(seriesRows, profile.dateKey, profitKey ?? null)
    if (best) {
      const bestRow = [...seriesRows].sort(
        (a, b) => Number(b[profitKey ?? ""] ?? 0) - Number(a[profitKey ?? ""] ?? 0)
      )[0]
      const bestVal = Number(bestRow?.[profitKey ?? ""] ?? 0)
      tiles.push({
        label: `Best month (net)`,
        value: `${best} ${formatInr(bestVal, { signed: true })}`,
        className: bestVal >= 0 ? "text-insight-positive" : "text-insight-negative",
      })
    }
  }

  return tiles.slice(0, 11)
}

export function KpiSummaryGrid({
  seriesRows,
  summaryRows,
}: {
  seriesRows: CubeRow[]
  summaryRows?: CubeRow[]
}) {
  const base = summaryRows?.length === 1 ? summaryRows : seriesRows
  const summary = aggregatePeriod(base.length <= 3 && base.length > 0 ? base : seriesRows)
  const tiles = buildKpiTiles(summary, seriesRows)

  if (!tiles.length) return null

  const profile = analyzeColumns(seriesRows)
  const periodLabel = derivePeriodLabel(seriesRows, profile.dateKey)

  return (
    <div className="rounded-xl bg-insight-canvas dark:bg-night-900 border border-insight-border dark:border-night-800 p-4 my-3">
      {periodLabel && (
        <p className="text-[11px] font-sans text-stone-400 dark:text-night-600 uppercase tracking-widest mb-3">
          {periodLabel}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <KpiTile key={t.label} label={t.label} value={t.value} className={t.className} />
        ))}
      </div>
    </div>
  )
}
