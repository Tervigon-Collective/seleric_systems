import "server-only"

import { getCubeDetails, loadSchema, type SchemaCache } from "@/lib/cube-client"
import {
  ALL_PNL_MEASURES,
  PNL_BREAKDOWN_SECTIONS,
  PNL_CUBE,
  type PnlSchemaStatus,
} from "./pnl-breakdown-constants"

export {
  ALL_PNL_MEASURES,
  PNL_BREAKDOWN_SECTIONS,
  PNL_CUBE,
  TREND_MEASURES,
  WATERFALL_MEASURES,
  fullPnlWaterfallSteps,
  rowValue,
  type PnlSchemaStatus,
  type WaterfallStep,
} from "./pnl-breakdown-constants"

export function resolvePnlSchema(schema: SchemaCache): PnlSchemaStatus {
  const cube = getCubeDetails(schema, PNL_CUBE)
  if (!cube) {
    return {
      cubeExists: false,
      available: [],
      missing: [...ALL_PNL_MEASURES],
      measureDefs: PNL_BREAKDOWN_SECTIONS.flatMap((s) => s.measures),
    }
  }

  const availableSet = new Set(cube.measures.map((m) => m.name))
  const available: string[] = []
  const missing: string[] = []

  for (const key of ALL_PNL_MEASURES) {
    if (availableSet.has(key)) available.push(key)
    else missing.push(key)
  }

  return {
    cubeExists: true,
    available,
    missing,
    measureDefs: PNL_BREAKDOWN_SECTIONS.flatMap((s) => s.measures),
  }
}

export async function probePnlSchema(): Promise<PnlSchemaStatus> {
  const schema = await loadSchema()
  return resolvePnlSchema(schema)
}
