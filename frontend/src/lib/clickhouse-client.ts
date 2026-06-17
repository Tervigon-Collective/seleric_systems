import "server-only"

import { serverLog } from "./server-log"

/**
 * Minimal ClickHouse HTTP client for server-side dashboard queries that need
 * to read raw `gold.fct_daily_pnl` columns directly (bypassing the Cube
 * semantic layer). Used by `lib/dashboard/queries/pnl-clickhouse.ts` so that
 * the /pnl page can match the canonical P&L bridge:
 *
 *   net_sales_excl_gst = gross_sales_excl_gst
 *                      − total_discounts_excl_gst
 *                      − notes_return_refund_excl_gst
 *                      − notes_adjustment_refund_excl_gst
 *   (cancellations are audit-only, never subtracted)
 *
 * Cube measures use a slightly different bridge (placement vs refund-event
 * axes) which makes their `net_sales_excl_tax` / `net_profit` columns drift
 * from the SQL formula in months with non-trivial cancellation/return
 * timing. Querying ClickHouse directly side-steps that and guarantees the
 * dashboard matches `scripts/reconcile_daily_pnl_audit.py`.
 */

export interface ClickHouseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  secure: boolean
}

function readConfig(): ClickHouseConfig {
  const host = process.env.CLICKHOUSE_HOST
  if (!host) throw new Error("CLICKHOUSE_HOST env var is required but not set")
  return {
    host,
    port: Number(process.env.CLICKHOUSE_PORT ?? "8123"),
    user: process.env.CLICKHOUSE_USER ?? "default",
    password: process.env.CLICKHOUSE_PASSWORD ?? "",
    database: process.env.CLICKHOUSE_DATABASE ?? "gold",
    secure: (process.env.CLICKHOUSE_SECURE ?? "false").toLowerCase() === "true",
  }
}

function buildUrl(cfg: ClickHouseConfig, params: Record<string, string>): string {
  const protocol = cfg.secure ? "https" : "http"
  const qs = new URLSearchParams({ database: cfg.database, ...params })
  return `${protocol}://${cfg.host}:${cfg.port}/?${qs.toString()}`
}

function basicAuthHeader(cfg: ClickHouseConfig): string {
  return `Basic ${Buffer.from(`${cfg.user}:${cfg.password}`).toString("base64")}`
}

/**
 * Execute a ClickHouse SQL query and return the response as parsed JSON rows
 * (one object per row, keyed by SELECT alias). The SQL must not already
 * include a FORMAT clause — this helper appends `FORMAT JSONEachRow`.
 *
 * @throws if the HTTP response is non-2xx or if a row fails to JSON-parse.
 */
export async function clickHouseQuery<T = Record<string, unknown>>(
  sql: string,
  options: { signal?: AbortSignal } = {},
): Promise<T[]> {
  const cfg = readConfig()
  const url = buildUrl(cfg, {})
  const body = `${sql.trim()}\nFORMAT JSONEachRow`
  const t0 = Date.now()

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Authorization: basicAuthHeader(cfg),
    },
    body,
    signal: options.signal,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      `ClickHouse ${res.status} ${res.statusText} — ${text.slice(0, 400)}`,
    )
  }

  const raw = await res.text()
  const lines = raw.split("\n").filter((l) => l.length > 0)
  const rows: T[] = []
  for (const line of lines) {
    try {
      rows.push(JSON.parse(line) as T)
    } catch (err) {
      throw new Error(`ClickHouse JSON parse error: ${err} · line: ${line.slice(0, 200)}`)
    }
  }

  serverLog("info", `clickhouse (${Date.now() - t0}ms)`, `${rows.length} rows`)
  return rows
}
