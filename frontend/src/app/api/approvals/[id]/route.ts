import { pythonMutate } from "@/lib/api/python-proxy"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// GET: email-link approval/rejection — apply the decision via Python, then redirect.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params
  const url = request.nextUrl
  const token = url.searchParams.get("token") ?? ""
  const decision = url.searchParams.get("decision") as "approved" | "rejected" | null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin

  if (!decision || !["approved", "rejected"].includes(decision)) {
    return NextResponse.redirect(new URL(`/control/approvals?highlight=${id}`, appUrl))
  }

  const resp = await pythonMutate("POST", `/approvals/${id}`, { decision, token })
  const data = await resp.json()
  if (resp.status !== 200) {
    return NextResponse.json({ error: data.detail ?? data.error }, { status: resp.status })
  }
  return NextResponse.redirect(
    new URL(`/control/approvals?actioned=${decision}&id=${id}`, appUrl),
  )
}

// POST: called from the control panel UI
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params
  const url = request.nextUrl
  const token = url.searchParams.get("token") ?? ""

  let body: { decision?: string; rejectedReason?: string; modifiedPayload?: Record<string, unknown> } = {}
  try {
    body = await request.json()
  } catch {
    // empty body
  }

  const decision = body.decision as "approved" | "rejected" | undefined
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 })
  }

  return pythonMutate("POST", `/approvals/${id}`, { ...body, token })
}
