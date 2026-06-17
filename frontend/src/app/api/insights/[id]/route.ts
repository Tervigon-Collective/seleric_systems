import { NextResponse } from "next/server"
import { dismissInsight, snoozeInsight } from "@/lib/services/insight.service"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params
  const body: { action: "dismiss" | "snooze"; snoozeDuration?: 1 | 4 | 24 } =
    await request.json()

  if (body.action === "dismiss") {
    await dismissInsight(id)
    return NextResponse.json({ ok: true, action: "dismissed" })
  }

  if (body.action === "snooze") {
    const hours = body.snoozeDuration ?? 1
    const until = await snoozeInsight(id, hours)
    return NextResponse.json({ ok: true, action: "snoozed", until })
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 })
}
