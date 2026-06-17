import { pythonGet } from "@/lib/api/python-proxy"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  return pythonGet("/control/stats", request.nextUrl.searchParams)
}
