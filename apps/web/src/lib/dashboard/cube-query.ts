import "server-only"

import { callCubeTool, withCubeSession } from "@/lib/cube-client"
import { cubeErrorMessage, extractRows, type CubeRow } from "@/lib/chat/cube-rows"
import { IST_TIMEZONE } from "@/lib/chat/pnl"

let lastCubeError: string | null = null

export function getLastCubeError(): string | null {
  return lastCubeError
}

export function resetCubeErrors(): void {
  lastCubeError = null
}

function logCubeError(label: string, raw: unknown): void {
  const msg = cubeErrorMessage(raw)
  if (msg) {
    lastCubeError = msg
    console.error(`[cube] ${label}:`, msg)
  }
}

function logCubeException(label: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  lastCubeError = msg
  console.error(`[cube] ${label} failed:`, msg)
}

/**
 * Applies timezone. Does not inject a default row cap — callers set `limit`
 * explicitly for top-N listings. Omitting limit avoids skewed totals on
 * aggregate KPI rows (measures-only) and on full dimensional/time-series fetches.
 */
export function buildCubeQuery(query: Record<string, unknown>): Record<string, unknown> {
  return { timezone: IST_TIMEZONE, ...query }
}

export async function runCubeQuery(query: Record<string, unknown>): Promise<CubeRow[]> {
  const raw = await callCubeTool("cube_query", {
    query: buildCubeQuery(query),
  })
  const rows = extractRows(raw)
  if (!rows.length) logCubeError("cube_query", raw)
  return rows
}

/** Like runCubeQuery but never throws — returns [] on connection errors. */
export async function safeCubeQuery(
  query: Record<string, unknown>,
  label: string
): Promise<CubeRow[]> {
  try {
    return await runCubeQuery(query)
  } catch (err) {
    logCubeException(label, err)
    return []
  }
}

export async function runCubeToolRows(
  toolName: string,
  args: Record<string, unknown>
): Promise<CubeRow[]> {
  const raw = await callCubeTool(toolName, args)
  const rows = extractRows(raw)
  if (!rows.length) logCubeError(toolName, raw)
  return rows
}

/** Run dashboard fetches on a single reused MCP SSE connection. */
export async function runDashboardCubeFetch<T>(fn: () => Promise<T>): Promise<T> {
  resetCubeErrors()
  return withCubeSession(fn)
}
