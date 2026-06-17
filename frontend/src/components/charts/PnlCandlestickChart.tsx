"use client"

import { useMemo } from "react"
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { fmtCurrency } from "./format"
import { useChartTheme } from "@/hooks/useChartTheme"

export type PnlGranularity = "day" | "month"

interface CandlePoint {
  date: string
  label: string
  high: number
  open: number
  close: number
  low: number
  net_profit: number
  net_sales: number
  gross_profit: number
  ad_spend: number
  ops_cost: number
}

const P = "canonical_pnl"
const DATE_RE = /report_date|report_month/i

function findDateKey(row: Record<string, unknown>): string {
  return Object.keys(row).find((k) => DATE_RE.test(k)) ?? `${P}.report_date`
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

function buildCandles(rows: Record<string, unknown>[], granularity: PnlGranularity): CandlePoint[] {
  if (!rows.length) return []
  const dk = findDateKey(rows[0])
  return rows.map((row) => {
    const netSales = Number(row[`${P}.net_sales_excl_tax`] ?? 0)
    const grossProfit = Number(row[`${P}.gross_profit`] ?? 0)
    const netProfit = Number(row[`${P}.net_profit`] ?? 0)
    const adSpend = Number(row[`${P}.total_ad_spend`] ?? 0)
    const opsCost = Number(row[`${P}.total_operating_cost`] ?? 0)
    const dateStr = String(row[dk] ?? "")
    return {
      date: dateStr,
      label: formatLabel(dateStr, granularity),
      high: Math.max(netSales, grossProfit, 0),
      open: grossProfit,
      close: netProfit,
      low: Math.min(0, netProfit),
      net_profit: netProfit,
      net_sales: netSales,
      gross_profit: grossProfit,
      ad_spend: adSpend,
      ops_cost: opsCost,
    }
  })
}

function makeCandleShape(yMin: number, yMax: number) {
  const range = yMax - yMin || 1
  return function CandleShape(props: Record<string, unknown>) {
    const background = props.background as { y: number; height: number } | undefined
    const payload = props.payload as CandlePoint | undefined
    const x = props.x as number
    const width = props.width as number
    if (!background || !payload || background.height === 0) return null

    const toY = (v: number) =>
      background.y + background.height * (1 - (v - yMin) / range)

    const cx = x + width / 2
    const bw = Math.max(width * 0.55, 3)

    const yH = toY(payload.high)
    const yO = toY(payload.open)
    const yC = toY(payload.close)
    const yL = toY(payload.low)

    const bodyTop = Math.min(yO, yC)
    const bodyBot = Math.max(yO, yC)
    const bodyH = Math.max(bodyBot - bodyTop, 1.5)
    const color = payload.net_profit >= 0 ? "#10b981" : "#f43f5e"

    return (
      <g>
        {/* Upper wick: revenue → gross profit (COGS drag) */}
        <line x1={cx} y1={yH} x2={cx} y2={bodyTop} stroke={color} strokeWidth={1.5} opacity={0.65} />
        {/* Body: gross profit → net profit (ad + ops cost) */}
        <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH} fill={color} fillOpacity={0.85} rx={1.5} />
        {/* Lower wick: net profit → 0 (only on loss days) */}
        {payload.low < payload.close - 1 && (
          <line x1={cx} y1={bodyBot} x2={cx} y2={yL} stroke={color} strokeWidth={1.5} opacity={0.65} />
        )}
      </g>
    )
  }
}

interface Props {
  rows: Record<string, unknown>[]
  granularity: PnlGranularity
  height?: number
}

export function PnlCandlestickChart({ rows, granularity, height = 300 }: Props) {
  const ct = useChartTheme()
  const candles = useMemo(() => buildCandles(rows, granularity), [rows, granularity])

  const { yMin, yMax } = useMemo(() => {
    if (!candles.length) return { yMin: 0, yMax: 1 }
    const lo = Math.min(...candles.map((c) => c.low))
    const hi = Math.max(...candles.map((c) => c.high))
    const pad = (hi - lo) * 0.12 || 1000
    return { yMin: lo - pad, yMax: hi + pad }
  }, [candles])

  const shape = useMemo(() => makeCandleShape(yMin, yMax), [yMin, yMax])

  if (!candles.length) {
    return <p className="text-sm text-stone-500 dark:text-night-500">No trend data available.</p>
  }

  const n = candles.length
  const tickInterval = n <= 14 ? 0 : n <= 45 ? Math.ceil(n / 10) : Math.ceil(n / 6)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={candles} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: ct.tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval}
          height={28}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={fmtCurrency}
          tick={{ fill: ct.tick, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <ReferenceLine y={0} stroke={ct.grid} strokeWidth={1.5} strokeDasharray="4 2" />
        <Tooltip
          content={({ active, payload: pl }) => {
            if (!active || !pl?.length) return null
            const d = pl[0]?.payload as CandlePoint
            if (!d) return null
            return (
              <div className="rounded-lg border border-stone-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2.5 shadow-md min-w-[160px]">
                <p className="text-[11px] font-semibold text-stone-700 dark:text-night-200 mb-1.5">{d.label}</p>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between gap-4 text-stone-500 dark:text-night-400">
                    <span>Net Sales</span>
                    <span className="tabular-nums">{fmtCurrency(d.net_sales)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-stone-500 dark:text-night-400">
                    <span>Ops Cost</span>
                    <span className="tabular-nums">−{fmtCurrency(d.ops_cost)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-stone-600 dark:text-night-300 font-medium">
                    <span>Gross Profit</span>
                    <span className="tabular-nums">{fmtCurrency(d.gross_profit)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-stone-500 dark:text-night-400">
                    <span>Ad Spend</span>
                    <span className="tabular-nums">−{fmtCurrency(d.ad_spend)}</span>
                  </div>
                  <div
                    className={`flex justify-between gap-4 font-semibold pt-1 border-t border-stone-100 dark:border-night-800 ${
                      d.net_profit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    <span>Net Profit</span>
                    <span className="tabular-nums">{fmtCurrency(d.net_profit)}</span>
                  </div>
                </div>
              </div>
            )
          }}
        />
        {/* Invisible bar to anchor Recharts layout; all drawing done in custom shape */}
        <Bar dataKey="high" shape={shape as never} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
