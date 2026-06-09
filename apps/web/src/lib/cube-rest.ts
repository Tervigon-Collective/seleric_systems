import "server-only"

import { serverLog } from "./server-log"

export interface CubeLoadQuery {
  measures?: string[]
  dimensions?: string[]
  timeDimensions?: Array<{
    dimension: string
    granularity?: string
    dateRange?: [string, string] | string
  }>
  filters?: Array<{ member: string; operator: string; values?: string[] }>
  order?: Record<string, "asc" | "desc">
  limit?: number
  timezone?: string
}

export interface CubeMeta {
  cubes: Array<{
    name: string
    title: string
    measures: Array<{ name: string; title: string; type: string; format?: string; description?: string }>
    dimensions: Array<{ name: string; title: string; type: string; description?: string }>
  }>
}

function cubeApiUrl(): string {
  const url = process.env.CUBE_API_URL
  if (!url) throw new Error("CUBE_API_URL env var is required but not set")
  return url.replace(/\/$/, "")
}

async function buildJWT(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const toB64URL = (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  const header = toB64URL(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })).buffer as ArrayBuffer)
  const now = Math.floor(Date.now() / 1000)
  const payload = toB64URL(enc.encode(JSON.stringify({ iat: now, exp: now + 3600 })).buffer as ArrayBuffer)
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`))
  return `${header}.${payload}.${toB64URL(sig)}`
}

export async function authHeaders(): Promise<Record<string, string>> {
  const apiKey = process.env.SELERIC_API_KEY
  if (apiKey) return { Authorization: `Bearer ${apiKey}` }
  const secret = process.env.CUBEJS_API_SECRET
  if (secret) return { Authorization: `Bearer ${await buildJWT(secret)}` }
  return {}
}

export async function cubeLoad(query: CubeLoadQuery): Promise<Record<string, unknown>[]> {
  const base = cubeApiUrl()
  const headers = await authHeaders()
  const t0 = Date.now()
  const res = await fetch(`${base}/cubejs-api/v1/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Cube load failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as { data?: Record<string, unknown>[] }
  const rows = json.data ?? []
  serverLog("info", `cube load (${Date.now() - t0}ms)`, `${rows.length} rows`)
  return rows
}

export async function cubeMeta(): Promise<CubeMeta> {
  const base = cubeApiUrl()
  const headers = await authHeaders()
  const t0 = Date.now()
  const res = await fetch(`${base}/cubejs-api/v1/meta`, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Cube meta failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as CubeMeta
  serverLog("info", `cube meta (${Date.now() - t0}ms)`, `${json.cubes?.length ?? 0} cubes`)
  return json
}
