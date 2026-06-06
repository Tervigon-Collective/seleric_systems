"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { fmtCurrency } from "./format"
import { useChartTheme } from "@/hooks/useChartTheme"
import { COGS_BREAKDOWN_LINES, type CogsBreakdown } from "@/lib/dashboard/cogs-breakdown"

interface Step {
  name: string
  value: number
  kind: "start" | "delta" | "subtotal" | "total"
  segment?: "cogs" | "revenue"
  unavailable?: boolean
}

interface Props {
  steps: Step[]
  cogsBreakdown?: CogsBreakdown
  height?: number
}

function CogsTooltipBreakdown({ breakdown }: { breakdown: CogsBreakdown }) {
  return (
    <div className="mt-1 pt-1 border-t border-stone-200 dark:border-night-700 space-y-0.5">
      <p className="text-[10px] uppercase tracking-wide opacity-70">Operating cost breakdown</p>
      {COGS_BREAKDOWN_LINES.map(({ label, key }) => (
        <div key={key} className="flex justify-between gap-3 text-xs">
          <span>{label}</span>
          <span>{fmtCurrency(breakdown[key])}</span>
        </div>
      ))}
      <div className="flex justify-between gap-3 text-xs font-medium pt-0.5 border-t border-stone-200/60 dark:border-night-700/60">
        <span>Total ops cost</span>
        <span>{fmtCurrency(breakdown.totalOperatingCost)}</span>
      </div>
    </div>
  )
}

/** Stepped P&L waterfall: sales → product COGS → gross profit → ad spend → ops costs → net profit. */
export function PnlWaterfallChart({ steps, cogsBreakdown, height = 260 }: Props) {
  const ct = useChartTheme()

  if (!steps.some((s) => s.value !== 0)) {
    return <p className="text-sm text-stone-500 dark:text-night-500">No P&L data for this period.</p>
  }

  const floating = steps.map((step) => ({
    name: step.name,
    value: Math.abs(step.value),
    signed: step.value,
    segment: step.segment,
    unavailable: step.unavailable,
    fill:
      step.unavailable
        ? "#94a3b8"
        : step.segment === "cogs"
          ? "#f97316"
          : step.segment === "revenue"
            ? step.kind === "delta"
              ? "#fb7185"
              : "#60a5fa"
            : step.kind === "delta"
              ? "#fb7185"
              : step.kind === "total"
                ? "#34d399"
                : step.kind === "subtotal"
                  ? "#a78bfa"
                  : "#60a5fa",
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={floating} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
        <XAxis
          dataKey="name"
          tick={{ fill: ct.tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={58}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={fmtCurrency}
          tick={{ fill: ct.tick, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={62}
        />
        <ReferenceLine y={0} stroke={ct.grid} strokeWidth={1.5} strokeDasharray="4 2" />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const row = payload[0]?.payload as (typeof floating)[number] | undefined
            if (!row) return null
            const showBreakdown = row.segment === "cogs" && cogsBreakdown
            return (
              <div className="rounded-md border border-stone-200 dark:border-night-700 bg-white dark:bg-night-900 px-3 py-2 text-stone-900 dark:text-night-50 shadow-md">
                <p className="text-xs font-medium">{row.name}</p>
                <p className="text-sm">{fmtCurrency(row.signed)}</p>
                {row.unavailable && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">No data in cube</p>
                )}
                {showBreakdown && <CogsTooltipBreakdown breakdown={cogsBreakdown} />}
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {floating.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
