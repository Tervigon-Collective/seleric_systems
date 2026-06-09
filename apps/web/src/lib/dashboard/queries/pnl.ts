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
 * The /pnl dashboard now reads `gold.fct_daily_pnl` directly via ClickHouse
 * HTTP rather than going through the Cube semantic layer. This guarantees
 * Net sales / Gross profit / Net profit match the canonical bridge defined
 * in `scripts/reconcile_daily_pnl_audit.py` (the Cube's `net_sales_excl_tax`
 * column is materialised on a different refund axis and drifts by the size
 * of cancellation/voided refund timing each month).
 *
 * The output rows still use cube-style `canonical_pnl.*` measure keys so the
 * existing breakdown / waterfall / time-series components consume them
 * unchanged.
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
