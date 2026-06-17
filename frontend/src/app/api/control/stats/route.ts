import { NextResponse } from "next/server"
import { getControlStats } from "@/lib/services/control.service"

export const dynamic = "force-dynamic"

export async function GET() {
  const stats = await getControlStats()
  return NextResponse.json(stats)
}
