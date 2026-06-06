import "server-only"

import { type DashboardBrandFilter } from "./brand-filter"
import { safeCubeQuery } from "./cube-query"
import { priorDateRange, toCubeDateRange, type DashboardDateRange } from "./date-ranges"
import { q } from "./query-helpers"
import { PNL_KPI_MEASURES } from "./pnl-kpi-constants"
import { COGS_BREAKDOWN_MEASURES, cogsBreakdownFromRow, type CogsBreakdown } from "./cogs-breakdown"

export interface KpiPeriodCompare {
  current: Record<string, unknown>
  prior: Record<string, unknown>
  priorLabel: string
  cogsBreakdownCurrent: CogsBreakdown
  cogsBreakdownPrior: CogsBreakdown
}

/** #01 — period total vs prior period (2 daily_pnl + 2 canonical_pnl queries). */
export async function fetchKpiPeriodCompare(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<KpiPeriodCompare> {
  const prior = priorDateRange(range)
  const [currentRows, priorRows, currentCostRows, priorCostRows] = await Promise.all([
    safeCubeQuery(
      q("daily_pnl", brand, {
        measures: [...PNL_KPI_MEASURES],
        timeDimensions: [{ dimension: "daily_pnl.report_date", dateRange: toCubeDateRange(range) }],
      }),
      "kpiCurrent"
    ),
    safeCubeQuery(
      q("daily_pnl", brand, {
        measures: [...PNL_KPI_MEASURES],
        timeDimensions: [{ dimension: "daily_pnl.report_date", dateRange: prior }],
      }),
      "kpiPrior"
    ),
    safeCubeQuery(
      q("canonical_pnl", brand, {
        measures: [...COGS_BREAKDOWN_MEASURES],
        timeDimensions: [{ dimension: "canonical_pnl.report_date", dateRange: toCubeDateRange(range) }],
      }),
      "cogsCurrent"
    ),
    safeCubeQuery(
      q("canonical_pnl", brand, {
        measures: [...COGS_BREAKDOWN_MEASURES],
        timeDimensions: [{ dimension: "canonical_pnl.report_date", dateRange: prior }],
      }),
      "cogsPrior"
    ),
  ])

  return {
    current: enrichKpiRow(currentRows[0] ?? {}),
    prior: enrichKpiRow(priorRows[0] ?? {}),
    priorLabel: `${prior[0]} → ${prior[1]}`,
    cogsBreakdownCurrent: cogsBreakdownFromRow(currentCostRows[0] ?? {}),
    cogsBreakdownPrior: cogsBreakdownFromRow(priorCostRows[0] ?? {}),
  }
}

function enrichKpiRow(row: Record<string, unknown>): Record<string, unknown> {
  const sales = Number(row["daily_pnl.total_sales_ex_gst"] ?? 0)
  const gross = Number(row["daily_pnl.gross_profit"] ?? 0)
  const pct = sales > 0 ? (gross / sales) * 100 : null
  return { ...row, "daily_pnl.gross_margin_pct": pct }
}
