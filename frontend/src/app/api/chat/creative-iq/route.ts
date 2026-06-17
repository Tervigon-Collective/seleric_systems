import { pythonMutate } from "@/lib/api/python-proxy"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  return pythonMutate("POST", "/chat/creative-iq", body)
}
