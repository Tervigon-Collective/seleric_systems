import { NextResponse } from "next/server"
import { getPendingApprovals } from "@/lib/services/approval.service"

export const dynamic = "force-dynamic"

export async function GET() {
  const actions = await getPendingApprovals()
  return NextResponse.json(actions)
}
