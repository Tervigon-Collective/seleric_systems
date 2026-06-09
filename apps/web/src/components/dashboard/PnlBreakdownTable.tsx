"use client"

import { formatMeasureValue } from "@/components/charts/format"
import {
  inclGstValue,
  PNL_BREAKDOWN_SECTIONS,
  rowValue,
  measureDefFormat,
  type PnlSchemaStatus,
} from "@/lib/dashboard/pnl-breakdown-constants"

interface Props {
  row: Record<string, unknown>
  priorRow: Record<string, unknown>
  priorLabel: string
  schema: PnlSchemaStatus
}

function pctOfNetSales(value: number | null, netSales: number | null): string {
  if (value == null || netSales == null || netSales === 0) return "—"
  return `${((value / Math.abs(netSales)) * 100).toFixed(1)}%`
}

function priorDeltaPct(curr: number | null, prev: number | null): number | null {
  if (curr == null || prev == null || prev === 0) return null
  return ((curr - prev) / Math.abs(prev)) * 100
}

function formatDeltaPct(pct: number): string {
  const sign = pct > 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}

function deltaColorClass(pct: number, isDeduction: boolean): string {
  const favorable = isDeduction ? pct < 0 : pct > 0
  return favorable
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400"
}

export function PnlBreakdownTable({ row, priorRow, priorLabel, schema }: Props) {
  const availableSet = new Set(schema.available)
  const netSales = rowValue(row, "canonical_pnl.net_sales_excl_tax") ??
    rowValue(row, "canonical_pnl.net_revenue_excl_tax")

  const hasAnyValue = schema.available.some((key) => rowValue(row, key) != null)
  if (!hasAnyValue) {
    return (
      <p className="text-sm text-stone-500 dark:text-night-500 py-4">
        No P&L data for this period. Check date range or Cube connectivity.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {PNL_BREAKDOWN_SECTIONS.map((section) => {
        const sectionMeasures = section.measures.filter((m) => availableSet.has(m.key))
        const sectionMissing = section.measures.filter((m) => !availableSet.has(m.key))
        if (!sectionMeasures.length && !sectionMissing.length) return null

        return (
          <div key={section.id}>
            <div className="mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-night-400">
                {section.title}
              </h3>
              {section.subtitle && (
                <p className="text-[11px] text-stone-500 dark:text-night-500 mt-0.5">{section.subtitle}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-night-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 dark:bg-night-850 text-left text-[10px] uppercase tracking-wide text-stone-500 dark:text-night-500">
                    <th className="px-3 py-2 font-medium">Line item</th>
                    <th className="px-3 py-2 font-medium text-right">Excl-GST</th>
                    <th className="px-3 py-2 font-medium text-right">Incl-GST</th>
                    <th className="px-3 py-2 font-medium text-right">% of net sales</th>
                    <th className="px-3 py-2 font-medium text-right">Prior ({priorLabel})</th>
                    <th className="px-3 py-2 font-medium text-right">Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-night-800">
                  {sectionMeasures.map((def) => {
                    const fmt = measureDefFormat(def)
                    const curr = rowValue(row, def.key)
                    const prev = rowValue(priorRow, def.key)
                    const deltaPct = priorDeltaPct(curr, prev)
                    const isDeduction = def.deduction
                    const displayCurr =
                      curr != null && isDeduction && fmt === "currency" ? -Math.abs(curr) : curr
                    const inclRaw = fmt === "currency" ? inclGstValue(row, def.key) : null
                    const displayIncl =
                      inclRaw != null && isDeduction ? -Math.abs(inclRaw) : inclRaw

                    return (
                      <tr
                        key={def.key}
                        className={`hover:bg-stone-50/80 dark:hover:bg-night-875/50 ${
                          def.audit ? "text-stone-500 dark:text-night-500" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <span className="text-stone-800 dark:text-night-100">{def.label}</span>
                          {def.audit && (
                            <span className="ml-1.5 rounded bg-stone-200/80 dark:bg-night-800 px-1 py-0.5 text-[9px] uppercase tracking-wide text-stone-500 dark:text-night-500">
                              audit
                            </span>
                          )}
                          {curr == null && (
                            <span className="ml-1.5 rounded bg-amber-100 dark:bg-amber-950/40 px-1 py-0.5 text-[9px] text-amber-700 dark:text-amber-300">
                              no data
                            </span>
                          )}
                          {def.description && (
                            <p className="mt-0.5 text-[10px] text-stone-400 dark:text-night-600 leading-snug">
                              {def.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium text-stone-900 dark:text-night-50">
                          {displayCurr != null ? formatMeasureValue(displayCurr, def.key) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-700 dark:text-night-200 text-xs">
                          {displayIncl != null ? formatMeasureValue(displayIncl, def.key) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-500 dark:text-night-500 text-xs">
                          {fmt === "currency" ? pctOfNetSales(curr, netSales) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-stone-500 dark:text-night-500 text-xs">
                          {prev != null ? formatMeasureValue(prev, def.key) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-xs">
                          {deltaPct != null ? (
                            <span className={deltaColorClass(deltaPct, Boolean(isDeduction))}>
                              {formatDeltaPct(deltaPct)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {sectionMissing.map((def) => (
                    <tr key={def.key} className="bg-amber-50/50 dark:bg-amber-950/10">
                      <td className="px-3 py-2 text-stone-500 dark:text-night-500" colSpan={6}>
                        <span>{def.label}</span>
                        <span className="ml-2 rounded bg-amber-200/80 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:text-amber-200">
                          not in cube
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
