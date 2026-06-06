import "server-only"

import {
  fullPnlWaterfallSteps,
  probePnlSchema,
  TREND_MEASURES,
  WATERFALL_MEASURES,
  type PnlSchemaStatus,
  type WaterfallStep,
} from "../pnl-breakdown"
import { type DashboardBrandFilter } from "../brand-filter"
import { priorDateRange, type DashboardDateRange } from "../date-ranges"
import { runDashboardCubeFetch, safeCubeQuery } from "../cube-query"
import { q, td } from "../query-helpers"

export interface PnlDashboardData {
  schema: PnlSchemaStatus
  periodRow: Record<string, unknown>
  priorRow: Record<string, unknown>
  priorLabel: string
  dailyTrend: Record<string, unknown>[]
  waterfallSteps: WaterfallStep[]
}

function pickMeasures(requested: readonly string[], available: string[]): string[] {
  const set = new Set(available)
  return requested.filter((m) => set.has(m))
}

function mergeMeasureLists(...lists: string[][]): string[] {
  return [...new Set(lists.flat())]
}

export async function fetchPnlDashboardData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<PnlDashboardData> {
  return runDashboardCubeFetch(async () => {
    const schema = await probePnlSchema()
    const prior = priorDateRange(range)

    const periodMeasures = mergeMeasureLists(
      schema.available,
      pickMeasures(WATERFALL_MEASURES, schema.available),
      pickMeasures(TREND_MEASURES, schema.available)
    )

    const [periodRows, priorRows, dailyTrend] = await Promise.all([
      periodMeasures.length
        ? safeCubeQuery(
            q("canonical_pnl", brand, {
              measures: periodMeasures,
              timeDimensions: [td("canonical_pnl.report_date", range)],
            }),
            "pnlPeriod"
          )
        : Promise.resolve([]),
      periodMeasures.length
        ? safeCubeQuery(
            q("canonical_pnl", brand, {
              measures: periodMeasures,
              timeDimensions: [{ dimension: "canonical_pnl.report_date", dateRange: prior }],
            }),
            "pnlPrior"
          )
        : Promise.resolve([]),
      pickMeasures(TREND_MEASURES, schema.available).length
        ? safeCubeQuery(
            q("canonical_pnl", brand, {
              measures: pickMeasures(TREND_MEASURES, schema.available),
              timeDimensions: [td("canonical_pnl.report_date", range, "day")],
              order: { "canonical_pnl.report_date": "asc" },
            }),
            "pnlTrend"
          )
        : Promise.resolve([]),
    ])

    const periodRow = periodRows[0] ?? {}
    const availableSet = new Set(schema.available)

    return {
      schema,
      periodRow,
      priorRow: priorRows[0] ?? {},
      priorLabel: `${prior[0]} → ${prior[1]}`,
      dailyTrend,
      waterfallSteps: fullPnlWaterfallSteps(periodRow, availableSet),
    }
  })
}
