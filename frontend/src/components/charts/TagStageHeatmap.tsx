"use client"

import { useMemo } from "react"
import { parseCategoryStageHeatmap } from "@/lib/dashboard/ad-funnel"

interface Props {
  categoryStage: Record<string, unknown>[]
}

// Smooth green/red background by lift (relative % vs spend-weighted column average).
function cellStyle(lift: number): React.CSSProperties {
  const clamp = Math.max(-1, Math.min(1, lift / 30))
  if (Math.abs(lift) < 3) return {}
  const alpha = 0.08 + 0.34 * Math.abs(clamp)
  const rgb = lift > 0 ? "16,185,129" : "239,68,68"
  return { backgroundColor: `rgba(${rgb},${alpha.toFixed(2)})` }
}

function liftText(lift: number): string {
  if (Math.abs(lift) < 1) return "·"
  return `${lift > 0 ? "+" : ""}${lift.toFixed(0)}%`
}

export function TagStageHeatmap({ categoryStage }: Props) {
  const heat = useMemo(() => parseCategoryStageHeatmap(categoryStage), [categoryStage])

  if (heat.rows.length === 0) {
    return <p className="text-sm text-stone-400 dark:text-night-600">No tagged spend for this period.</p>
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900">
              <th className="px-3 py-2 text-left font-medium text-stone-400 dark:text-night-500 min-w-[200px] sticky left-0 bg-stone-50 dark:bg-night-900">
                Neuro category
              </th>
              {heat.stages.map((s) => (
                <th key={s.key} className="px-2 py-2 text-center font-medium text-stone-400 dark:text-night-500 whitespace-nowrap">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heat.rows.map((row) => (
              <tr key={row.category} className="border-b border-stone-100 dark:border-night-850">
                <td className="px-3 py-1.5 text-stone-700 dark:text-night-200 sticky left-0 bg-white dark:bg-night-900">
                  {row.category}
                </td>
                {row.cells.map((c) => {
                  // ctr is a 0–1 fraction; every other rate is already 0–100.
                  const displayRate = c.stageKey === "ctr" ? c.rate * 100 : c.rate
                  return (
                    <td
                      key={c.stageKey}
                      title={`rate ${displayRate.toFixed(1)}% · ${liftText(c.lift)} vs avg`}
                      className="px-2 py-1.5 text-center tabular-nums text-stone-700 dark:text-night-200"
                      style={cellStyle(c.lift)}
                    >
                      {liftText(c.lift)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-stone-400 dark:text-night-600">
        Each cell = a category&apos;s lift vs the spend-weighted average for that stage
        (<span className="text-emerald-500">green</span> = over-indexes,{" "}
        <span className="text-red-400">red</span> = under-indexes). Creative / ad-delivery
        stages only — on-site conversion (LPV→ATC→Checkout→Buy) lives in the PDP funnel module.
      </p>
    </div>
  )
}
