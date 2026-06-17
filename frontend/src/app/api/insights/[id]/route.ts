import { pythonMutate } from "@/lib/api/python-proxy"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json()
  return pythonMutate("PATCH", `/insights/${params.id}`, body)
}
