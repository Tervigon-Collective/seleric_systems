import "server-only"

import {
  fullPnlWaterfallSteps,
  PNL_BREAKDOWN_SECTIONS,
  type PnlSchemaStatus,
  type WaterfallStep,
} from "../pnl-breakdown"
import { type DashboardBrandFilter } from "../brand-filter"
import { type DashboardDateRange } from "../date-ranges"
import { fetchPnlDirectClickHouse, PNL_DIRECT_MEASURES } from "./pnl-clickhouse"

export interface PnlDashboardData {
  schema: PnlSchemaStatus
  periodRow: Record<string, unknown>
  priorRow: Record<string, unknown>
  priorLabel: string
  dailyTrend: Record<string, unknown>[]
  waterfallSteps: WaterfallStep[]
}

/**
 * The /pnl dashboard reads certified finance rollups + ad spend tables directly
 * via ClickHouse (same sources as MCP `daily_pnl`). Output rows use
 * cube-style `canonical_pnl.*` measure keys for existing breakdown components.
 */
export async function fetchPnlDashboardData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter,
): Promise<PnlDashboardData> {
  const fetched = await fetchPnlDirectClickHouse(range, brand)

  const available: string[] = [...new Set<string>([...PNL_DIRECT_MEASURES])]
  const availableSet = new Set<string>(available)
  const measureDefs = PNL_BREAKDOWN_SECTIONS.flatMap((s) => s.measures)
  const missing = measureDefs
    .map((m) => m.key)
    .filter((k) => !availableSet.has(k))

  const schema: PnlSchemaStatus = {
    cubeExists: true,
    available,
    missing,
    measureDefs,
  }

  return {
    schema,
    periodRow: fetched.periodRow,
    priorRow: fetched.priorRow,
    priorLabel: fetched.priorLabel,
    dailyTrend: fetched.dailyTrend,
    waterfallSteps: fullPnlWaterfallSteps(fetched.periodRow, availableSet),
  }
}
