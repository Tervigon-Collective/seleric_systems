import type { SchemaCache } from "@/lib/cube-client"
import { getCubeDomainInstructions } from "../instructions/cube-domain"
import { createPnlTools, getPnlInstructions } from "./pnl-tools"
import { queryTools, getQueryInstructions } from "./query-tools"
import { createSchemaTool } from "./schema-tool"
import { pythonTools, getPythonInstructions } from "./python-tool"
import { createCreativeIQTools, getCreativeIQInstructions } from "./creative-iq-tools"

export function createChatTools(schema: SchemaCache) {
  return {
    ...createPnlTools(schema),
    ...queryTools,
    ...createSchemaTool(schema),
    ...pythonTools,
    ...createCreativeIQTools(),
  }
}

/** Aggregates per-domain instructions. Add new tool modules here. */
export function buildDomainInstructions(schema: SchemaCache): string {
  return [
    getCubeDomainInstructions(),
    getPnlInstructions(schema),
    getQueryInstructions(),
    getPythonInstructions(),
    getCreativeIQInstructions(),
  ].join("\n\n")
}
