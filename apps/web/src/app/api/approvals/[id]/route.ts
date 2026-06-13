import { NextResponse } from "next/server"
import { applyDecision } from "@/lib/services/approval.service"

export const dynamic = "force-dynamic"

// GET: direct approve/reject from email links (?token=...&decision=approved|rejected)
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const decision = url.searchParams.get("decision") as "approved" | "rejected" | null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  if (!decision || !["approved", "rejected"].includes(decision)) {
    return NextResponse.redirect(new URL(`/control/approvals?highlight=${id}`, appUrl))
  }

  const result = await applyDecision(id, token, decision)
  if (!result.ok) {
    return NextResponse.json({ error: result.error, ...result.extra }, { status: result.httpStatus })
  }
  return NextResponse.redirect(new URL(`/control/approvals?actioned=${result.status}&id=${id}`, appUrl))
}

// POST: called from the control panel UI
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""

  let body: { decision?: string; rejectedReason?: string; modifiedPayload?: Record<string, unknown> } = {}
  try {
    body = await request.json()
  } catch {
    // no body is fine if decision comes from query
  }

  const decision = body.decision as "approved" | "rejected" | undefined
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 })
  }

  const result = await applyDecision(id, token, decision, body)
  if (!result.ok) {
    return NextResponse.json({ error: result.error, ...result.extra }, { status: result.httpStatus })
  }
  return NextResponse.json({ status: result.status, actionId: result.actionId })
}
