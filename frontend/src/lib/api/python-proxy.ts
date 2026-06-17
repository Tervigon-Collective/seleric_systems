/**
 * Thin proxy helpers for Next.js routes that now live in the Python backend.
 *
 * NEXT_PUBLIC_PYTHON_API_URL — set in docker-compose for container-to-container
 *   calls (e.g. http://orchestrator:8000). Defaults to localhost for local dev.
 */
import "server-only"
import { NextResponse } from "next/server"

const PYTHON_BASE = process.env.PYTHON_API_URL ?? "http://localhost:8000"

/** Forward a GET request (with its query string) to the Python backend. */
export async function pythonGet(
  path: string,
  searchParams: URLSearchParams,
): Promise<NextResponse> {
  const qs = searchParams.toString()
  const url = `${PYTHON_BASE}${path}${qs ? `?${qs}` : ""}`
  try {
    const resp = await fetch(url, { cache: "no-store" })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}

/** Forward a PATCH/POST/PUT request with a JSON body to the Python backend. */
export async function pythonMutate(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<NextResponse> {
  const url = `${PYTHON_BASE}${path}`
  try {
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
