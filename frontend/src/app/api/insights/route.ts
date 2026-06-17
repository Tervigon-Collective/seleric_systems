import { NextResponse } from "next/server"
import { getInsights } from "@/lib/services/insight.service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200)
  const severity = searchParams.get("severity")
  const cursor = searchParams.get("cursor")

  try {
    const insights = await getInsights({ limit, severity, cursor })
    return NextResponse.json(insights)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/insights] error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
