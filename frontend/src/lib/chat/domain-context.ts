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
  domain: z.enum(["pnl", "creative-iq", "dashboard", "meta-ads", "shopify"]),
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

type DashboardDataInput = {
  kpiPeriodCompare: {
    current: Record<string, unknown>
    prior: Record<string, unknown>
    priorLabel: string
  }
  channelRevenue: Record<string, unknown>[]
  netProfitTrend: Record<string, unknown>[]
}

export function buildDashboardContext(
  data: DashboardDataInput,
  range: { start: string; end: string },
  brand: { id: number }
): DomainChatContext {
  const summary: Record<string, unknown> = {
    current: data.kpiPeriodCompare.current,
    prior: data.kpiPeriodCompare.prior,
    priorLabel: data.kpiPeriodCompare.priorLabel,
    channelRevenue: data.channelRevenue[0] ?? {},
  }

  return {
    domain: "dashboard",
    filters: { start: range.start, end: range.end, brandId: brand.id },
    summary,
    snapshot: {
      rows: data.netProfitTrend.slice(0, 31),
      label: "Daily net profit trend",
    },
    suggestedPrompts: [
      "What's driving the change in net profit?",
      "Compare Meta vs Google ROAS this period",
      "Which channel has the best return?",
      "Show me the gross margin trend",
    ],
  }
}

type MetaAdsDataInput = {
  cpcCpmCpaCurrent: Record<string, unknown>[]
  cpcCpmCpaPrior: Record<string, unknown>[]
  purchaseFunnel: Record<string, unknown>[]
  topCampaignsRoas: Record<string, unknown>[]
}

export function buildMetaAdsContext(
  data: MetaAdsDataInput,
  range: { start: string; end: string },
  brand: { id: number }
): DomainChatContext {
  const summary: Record<string, unknown> = {
    current: data.cpcCpmCpaCurrent[0] ?? {},
    prior: data.cpcCpmCpaPrior[0] ?? {},
    funnelTotals: data.purchaseFunnel[0] ?? {},
  }

  return {
    domain: "meta-ads",
    filters: { start: range.start, end: range.end, brandId: brand.id },
    summary,
    snapshot: {
      rows: data.topCampaignsRoas.slice(0, 10),
      label: "Top campaigns by ROAS",
    },
    suggestedPrompts: [
      "Which campaign has the best ROAS?",
      "Show me the purchase funnel drop-off",
      "Compare CPA this period vs last period",
      "Which adsets should we scale?",
    ],
  }
}

type ShopifyDataInput = {
  topProducts: Record<string, unknown>[]
  revenueOrdersDaily: Record<string, unknown>[]
}

export function buildShopifyContext(
  data: ShopifyDataInput,
  range: { start: string; end: string },
  brand: { id: number }
): DomainChatContext {
  return {
    domain: "shopify",
    filters: { start: range.start, end: range.end, brandId: brand.id },
    summary: {
      topProductCount: data.topProducts.length,
    },
    snapshot: {
      rows: data.topProducts.slice(0, 10),
      label: "Top products by net sales",
    },
    suggestedPrompts: [
      "Which products have the best gross margin?",
      "What's the return rate trend?",
      "Show me top UTM sources by revenue",
      "Which products should we promote?",
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
