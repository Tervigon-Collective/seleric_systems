import { pythonGet } from "@/lib/api/python-proxy"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  return pythonGet("/ads/engagement", request.nextUrl.searchParams)
}
