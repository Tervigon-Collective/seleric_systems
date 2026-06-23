import { pythonMutate } from "@/lib/api/python-proxy"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  // pythonMutate doesn't forward query params, so build the path manually
  const PYTHON_BASE = process.env.PYTHON_API_URL ?? "http://localhost:8000"
  const url = `${PYTHON_BASE}/geo-allocation/run${qs ? `?${qs}` : ""}`
  try {
    const resp = await fetch(url, { method: "POST", cache: "no-store" })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
