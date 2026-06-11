import type { SchemaCache } from "@/lib/cube-client"
import { getCubeDomainInstructions } from "../instructions/cube-domain"
import { createPnlTools, getPnlInstructions } from "./pnl-tools"
import { queryTools, getQueryInstructions } from "./query-tools"
import { createSchemaTool } from "./schema-tool"
import { pythonTools, getPythonInstructions } from "./python-tool"
import { createCreativeIQTools, getCreativeIQInstructions } from "./creative-iq-tools"
import { createPageContextTool } from "./page-context-tool"
import type { DomainChatContext } from "../domain-context"

export function createChatTools(schema: SchemaCache, ctx?: DomainChatContext | null) {
  if (ctx?.domain === "pnl") {
    return {
      ...createPageContextTool(ctx),
      ...createPnlTools(schema),
      ...createSchemaTool(schema),
      ...pythonTools,
    }
  }

  if (ctx?.domain === "creative-iq") {
    return {
      ...createPageContextTool(ctx),
      ...createCreativeIQTools(ctx.filters.brandId),
      ...createSchemaTool(schema),
      ...pythonTools,
    }
  }

  if (ctx?.domain === "dashboard") {
    return {
      ...createPageContextTool(ctx),
      ...createPnlTools(schema),
      ...queryTools,
      ...createSchemaTool(schema),
      ...pythonTools,
    }
  }

  if (ctx?.domain === "meta-ads") {
    return {
      ...createPageContextTool(ctx),
      ...queryTools,
      ...createSchemaTool(schema),
      ...pythonTools,
    }
  }

  if (ctx?.domain === "shopify") {
    return {
      ...createPageContextTool(ctx),
      ...queryTools,
      ...createSchemaTool(schema),
      ...pythonTools,
    }
  }

  // Central chat: all tools, no page context
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
