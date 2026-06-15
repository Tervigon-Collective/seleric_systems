import "server-only"

import { cubeLoad, cubeMeta, type CubeLoadQuery } from "./cube-rest"
import { serverLog } from "./server-log"

// `orders_created` is the full Shopify placement universe (active + COD pending +
// cancelled + refunded + voided + RTO draft). It is the correct denominator for
// blended CAC because ad spend is paid for every placement, not just the active
// + cancelled slice that `total_orders` represents. Keeping `total_orders`
// alongside for downstream tooling that wants the financially-confirmed bucket.
const PNL_MEASURES = [
  "daily_pnl.gross_revenue",
  "daily_pnl.total_sales_ex_gst",
  "daily_pnl.total_cogs",
  "daily_pnl.gross_profit",
  "daily_pnl.total_ad_spend",
  "daily_pnl.net_profit",
  "daily_pnl.orders_created",
  "daily_pnl.total_orders",
  "daily_pnl.active_orders",
]

const CHANNEL_MEASURES = [
  "channel_pnl.meta_attributed_revenue",
  "channel_pnl.meta_ad_spend",
  "channel_pnl.meta_net_profit",
  "channel_pnl.meta_attributed_orders",
  "channel_pnl.google_attributed_revenue",
  "channel_pnl.google_ad_spend",
  "channel_pnl.google_net_profit",
  "channel_pnl.google_attributed_orders",
  "channel_pnl.organic_attributed_revenue",
  "channel_pnl.organic_net_profit",
  "channel_pnl.organic_attributed_orders",
]

function dailyPnlQuery(args: Record<string, unknown>): CubeLoadQuery {
  const startDate = args.start_date as string
  const endDate = (args.end_date as string | undefined) ?? startDate
  const groupByDay = Boolean(args.group_by_day)
  return {
    measures: PNL_MEASURES,
    timeDimensions: [
      {
        dimension: "daily_pnl.report_date",
        ...(groupByDay ? { granularity: "day" } : {}),
        dateRange: [startDate, endDate],
      },
    ],
    timezone: "Asia/Kolkata",
    ...(groupByDay ? { order: { "daily_pnl.report_date": "asc" } } : {}),
  }
}

function channelPnlQuery(args: Record<string, unknown>): CubeLoadQuery {
  const startDate = args.start_date as string
  const endDate = (args.end_date as string | undefined) ?? startDate
  return {
    measures: CHANNEL_MEASURES,
    timeDimensions: [
      {
        dimension: "channel_pnl.date_start",
        dateRange: [startDate, endDate],
      },
    ],
    timezone: "Asia/Kolkata",
  }
}

export async function resolveCubeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  serverLog("info", `cube → ${toolName}`, JSON.stringify(args).slice(0, 200))
  const t0 = Date.now()
  let result: unknown

  switch (toolName) {
    case "cube_daily_pnl": {
      result = await cubeLoad(dailyPnlQuery(args))
      break
    }
    case "cube_channel_pnl": {
      result = await cubeLoad(channelPnlQuery(args))
      break
    }
    case "cube_query": {
      const query = args.query as CubeLoadQuery
      if (!query) throw new Error("cube_query requires a query argument")
      result = await cubeLoad(query)
      break
    }
    case "cube_meta": {
      result = await cubeMeta()
      break
    }
    default:
      throw new Error(`Unknown cube tool: ${toolName}`)
  }

  serverLog(
    "info",
    `cube ← ${toolName} (${Date.now() - t0}ms)`,
    Array.isArray(result) ? `${result.length} rows` : typeof result
  )
  return result
}
