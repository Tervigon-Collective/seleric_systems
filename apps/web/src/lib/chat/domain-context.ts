import { z } from "zod"
import type { ScoredTag } from "@/lib/dashboard/neurotag-scorer"

// Minimal types to avoid server-only imports
type PnlDataInput = {
  periodRow: Record<string, unknown>
  priorRow: Record<string, unknown>
  waterfallSteps: { name: string; value: number; kind: string }[]
  dailyTrend: Record<string, unknown>[]
}

type AdFunnelDataInput = {
  funnelTotals?: Record<string, unknown>[]
} | null

export const domainChatContextSchema = z.object({
  domain: z.enum(["pnl", "creative-iq"]),
  tab: z.string().optional(),
  filters: z.object({
    start: z.string(),
    end: z.string(),
    brandId: z.number(),
  }),
  focus: z
    .object({
      adId: z.string().optional(),
      tagCode: z.string().optional(),
      query: z.string().optional(),
    })
    .optional(),
  summary: z.record(z.unknown()),
  snapshot: z.object({
    rows: z.array(z.record(z.unknown())),
    label: z.string().optional(),
  }),
  suggestedPrompts: z.array(z.string()),
})

export type DomainChatContext = z.infer<typeof domainChatContextSchema>
export type DomainId = DomainChatContext["domain"]

export function parseDomainChatContext(raw: unknown): DomainChatContext | null {
  if (!raw) return null
  const result = domainChatContextSchema.safeParse(raw)
  return result.success ? result.data : null
}

const PNL_KPI_KEYS = [
  "canonical_pnl.net_sales_excl_tax",
  "canonical_pnl.gross_profit",
  "canonical_pnl.total_ad_spend",
  "canonical_pnl.net_profit",
  "canonical_pnl.mer",
  "canonical_pnl.orders_created",
]

export function buildPnlContext(
  data: PnlDataInput,
  range: { start: string; end: string },
  brand: { id: number }
): DomainChatContext {
  const summary: Record<string, unknown> = {}
  for (const k of PNL_KPI_KEYS) {
    if (data.periodRow[k] != null) summary[k] = data.periodRow[k]
  }
  summary.priorPeriod = Object.fromEntries(
    PNL_KPI_KEYS.filter((k) => data.priorRow[k] != null).map((k) => [k, data.priorRow[k]])
  )
  summary.waterfall = data.waterfallSteps
    .filter((s) => s.kind !== "start")
    .map((s) => ({ label: s.name, value: s.value, kind: s.kind }))

  return {
    domain: "pnl",
    filters: { start: range.start, end: range.end, brandId: brand.id },
    summary,
    snapshot: {
      rows: data.dailyTrend.slice(0, 31),
      label: "Daily P&L trend",
    },
    suggestedPrompts: [
      "Why is net profit negative this period?",
      "Which cost line hurt us most in the waterfall?",
      "Compare this period to prior period MER",
      "Show me the daily revenue trend",
    ],
  }
}

export function buildCreativeIqContext(
  scoredTags: ScoredTag[],
  adFunnel: AdFunnelDataInput,
  range: { start: string; end: string },
  brand: { id: number },
  ui?: { tab?: string; focus?: { adId?: string; tagCode?: string; query?: string } }
): DomainChatContext {
  const topTags = scoredTags
    .filter((t) => t.classification !== "needs_more_data")
    .slice(0, 15)

  const misleadingHooks = scoredTags
    .filter((t) => t.classification === "misleading_hook")
    .slice(0, 10)

  const summary: Record<string, unknown> = {
    totalTags: scoredTags.length,
    scoredTags: scoredTags.filter((t) => t.classification !== "needs_more_data").length,
    strongWinners: scoredTags.filter((t) => t.classification === "strong_winner").length,
    misleadingHooks: misleadingHooks.length,
    converters: scoredTags.filter((t) => t.classification === "conversion_winner").length,
    funnelTotals: adFunnel?.funnelTotals?.[0] ?? {},
    topMisleadingHooks: misleadingHooks.map((t) => ({
      tag_code: t.tag_code,
      hack_name: t.hack_name,
      classification: t.classification,
      ctr: t.ctr,
      roas: t.roas,
    })),
  }

  return {
    domain: "creative-iq",
    tab: ui?.tab,
    focus: ui?.focus,
    filters: { start: range.start, end: range.end, brandId: brand.id },
    summary,
    snapshot: {
      rows: topTags as unknown as Record<string, unknown>[],
      label: "Top neuro-tags by score",
    },
    suggestedPrompts: [
      "Which tags should we pause?",
      "Where is the biggest drop-off in the funnel?",
      "Explain the misleading hooks",
      "Which ads are strong winners?",
    ],
  }
}
