import "server-only"

import { resolveCubeTool } from "./cube-presets"
import { cubeMeta } from "./cube-rest"

export type CubeToolCaller = (toolName: string, args: Record<string, unknown>) => Promise<unknown>

/** Thin compatibility shim — callers that wrap logic in withCubeSession just get fn() directly. */
export async function withCubeSession<T>(fn: () => Promise<T>): Promise<T> {
  return fn()
}

export async function callCubeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  return resolveCubeTool(toolName, args)
}

// ── Schema cache ─────────────────────────────────────────────────────────────

interface CubeMeasure {
  name: string
  title: string
  type: string
  format?: string
  description?: string
}

interface CubeDimension {
  name: string
  title: string
  type: string
  description?: string
}

interface CubeInfo {
  name: string
  title: string
  measures: CubeMeasure[]
  dimensions: CubeDimension[]
}

export interface SchemaCache {
  cheatSheet: string
  cubes: CubeInfo[]
  fetchedAt: number
}

let _schemaCache: SchemaCache | null = null

export async function loadSchema(): Promise<SchemaCache> {
  if (_schemaCache && Date.now() - _schemaCache.fetchedAt < 60 * 60 * 1000) {
    return _schemaCache
  }

  const meta = await cubeMeta()
  _schemaCache = {
    cheatSheet: "",
    cubes: meta.cubes as CubeInfo[],
    fetchedAt: Date.now(),
  }
  return _schemaCache
}

export function buildSchemaContext(schema: SchemaCache): string {
  const cubeList = schema.cubes.map((c) => `- **${c.name}**: ${c.title}`).join("\n")
  return `## Cube inventory (call exploreSchema for full measure/dimension list)\n${cubeList}`
}

export function getCubeDetails(schema: SchemaCache, cubeName: string): CubeInfo | undefined {
  return schema.cubes.find((c) => c.name === cubeName)
}
