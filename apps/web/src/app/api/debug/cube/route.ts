import { NextResponse } from "next/server"
import { callCubeTool, loadSchema } from "@/lib/cube-client"
import { extractRows } from "@/lib/chat/cube-rows"

export const dynamic = "force-dynamic"

function probeResult(raw: unknown) {
  return {
    type: typeof raw,
    rowCount: extractRows(raw).length,
    preview: typeof raw === "string" ? raw.slice(0, 400) : raw,
  }
}

/** Dev-only: probe live MCP schema + sample queries. */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not available in production" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const toolName = searchParams.get("name")

  if (toolName) {
    const args: Record<string, unknown> = {}
    if (toolName !== "cube_pnl_today_yesterday" && toolName !== "cube_meta") {
      args.start_date = searchParams.get("start") ?? "2026-05-07"
      args.end_date = searchParams.get("end") ?? "2026-06-06"
    }
    if (toolName === "cube_daily_pnl") args.start_date = searchParams.get("start") ?? "2026-06-05"
    const raw = await callCubeTool(toolName, args)
    return NextResponse.json({ tool: toolName, ...probeResult(raw) })
  }

  const schema = await loadSchema()
  const cubeNames = schema.cubes.map((c) => c.name)

  const probes = [
    {
      label: "canonical_pnl",
      query: {
        measures: ["canonical_pnl.net_profit"],
        timeDimensions: [{ dimension: "canonical_pnl.report_date", granularity: "day", dateRange: ["2026-05-07", "2026-06-06"] }],
        timezone: "Asia/Kolkata",
      },
    },
    {
      label: "gold_channel_pnl",
      query: {
        measures: ["gold_channel_pnl.attributed_revenue_ex_gst"],
        timeDimensions: [{ dimension: "gold_channel_pnl.report_date", dateRange: ["2026-05-07", "2026-06-06"] }],
        timezone: "Asia/Kolkata",
      },
    },
    {
      label: "commerce_orders",
      query: {
        measures: ["commerce_orders.orders"],
        timeDimensions: [{ dimension: "commerce_orders.order_date", granularity: "day", dateRange: ["2026-05-07", "2026-06-06"] }],
        timezone: "Asia/Kolkata",
      },
    },
  ]

  const results: Record<string, unknown> = {}
  for (const { label, query } of probes) {
    const raw = await callCubeTool("cube_query", { query })
    results[label] = probeResult(raw)
  }

  return NextResponse.json({ cubeNames, probes: results })
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not available in production" }, { status: 404 })
  }
  const body = (await req.json()) as { query?: Record<string, unknown> }
  const raw = await callCubeTool("cube_query", { query: body.query ?? {} })
  return NextResponse.json(probeResult(raw))
}
