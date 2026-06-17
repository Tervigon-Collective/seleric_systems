import { NextResponse } from "next/server"
import { getActionHistory } from "@/lib/services/action.service"

export const dynamic = "force-dynamic"

export async function GET() {
  const actions = await getActionHistory()
  return NextResponse.json(actions)
}
