const C = "meta_neurotag_analysis"

export type SignalClass =
  | "strong_winner"
  | "conversion_winner"
  | "creative_hook_winner"
  | "misleading_hook"
  | "weak_attention"
  | "needs_more_data"

export interface TagMetrics {
  ad_id: string
  ad_name: string
  tag_code: string
  hack_name: string
  category_name: string
  spend: number
  spend_fc: number
  impressions: number
  clicks: number
  link_clicks: number
  net_revenue: number
  attributed_orders: number
  new_customer_revenue: number
  thruplay: number
  // video ratios (pre-computed by cube, non-additive)
  hook_rate: number       // 3s stop rate %
  hold_rate_15s: number   // 15s retention %
  hold_rate_p50: number   // 50% completion %
  hold_rate_p75: number   // 75% completion %
  hold_rate_p100: number  // full completion %
  cost_per_thruplay: number
}

export interface ScoredTag extends TagMetrics {
  roas: number
  ctr: number
  link_ctr: number  // link_clicks / impressions
  cpc: number
  cpa: number
  score: number
  classification: SignalClass
}

const MIN_SPEND = 500
const MIN_IMPRESSIONS = 1_000
const CTR_MISLEADING_FLOOR = 0.025
const ROAS_MISLEADING_CEIL = 1.5

const WEIGHTS = {
  revenue:    0.28,
  roas:       0.20,
  ctr:        0.18,
  cpc_eff:    0.10,
  order_rate: 0.10,
  hook:       0.08,  // video hook quality
  confidence: 0.06,
}

function n(v: unknown): number {
  const num = Number(v ?? 0)
  return isFinite(num) ? num : 0
}

export function parseTagRows(rows: Record<string, unknown>[]): TagMetrics[] {
  return rows.map((r) => ({
    ad_id:                String(r[`${C}.ad_id`] ?? ""),
    ad_name:              String(r[`${C}.ad_name`] ?? "—"),
    tag_code:             String(r[`${C}.tag_code`] ?? "__untagged__"),
    hack_name:            String(r[`${C}.hack_name`] ?? "—"),
    category_name:        String(r[`${C}.category_name`] ?? "—"),
    spend:                n(r[`${C}.spend_sc`]),
    spend_fc:             n(r[`${C}.spend_fc`]),
    impressions:          n(r[`${C}.impressions_sc`]),
    clicks:               n(r[`${C}.clicks_sc`]),
    link_clicks:          n(r[`${C}.link_clicks_sc`]),
    net_revenue:          n(r[`${C}.net_revenue_sc`]),
    attributed_orders:    n(r[`${C}.attributed_orders_sc`]),
    new_customer_revenue: n(r[`${C}.new_customer_revenue_sc`]),
    thruplay:             n(r[`${C}.video_thruplay_15s_sc`]),
    hook_rate:            n(r[`${C}.hook_rate`]),
    hold_rate_15s:        n(r[`${C}.hold_rate_15s`]),
    hold_rate_p50:        n(r[`${C}.hold_rate_p50`]),
    hold_rate_p75:        n(r[`${C}.hold_rate_p75`]),
    hold_rate_p100:       n(r[`${C}.hold_rate_p100`]),
    cost_per_thruplay:    n(r[`${C}.cost_per_thruplay`]),
  }))
}

export function scoreTags(tags: TagMetrics[]): ScoredTag[] {
  if (!tags.length) return []

  const maxRev   = Math.max(...tags.map((t) => t.net_revenue), 1)
  const maxRoas  = Math.max(...tags.map((t) => (t.spend > 0 ? t.net_revenue / t.spend : 0)), 1)
  const maxCtr   = Math.max(...tags.map((t) => (t.impressions > 0 ? t.clicks / t.impressions : 0)), 1)
  const maxCpc   = Math.max(...tags.map((t) => (t.clicks > 0 ? t.spend / t.clicks : 0)), 1)
  const maxOr    = Math.max(...tags.map((t) => (t.clicks > 0 ? t.attributed_orders / t.clicks : 0)), 1)
  const maxHook  = Math.max(...tags.map((t) => t.hook_rate), 1)

  return tags
    .map((t) => {
      const roas     = t.spend > 0 ? t.net_revenue / t.spend : 0
      const ctr      = t.impressions > 0 ? t.clicks / t.impressions : 0
      const link_ctr = t.impressions > 0 ? t.link_clicks / t.impressions : 0
      const cpc      = t.clicks > 0 ? t.spend / t.clicks : 0
      const cpa      = t.attributed_orders > 0 ? t.spend / t.attributed_orders : 0
      const orderRate = t.clicks > 0 ? t.attributed_orders / t.clicks : 0

      if (t.spend < MIN_SPEND || t.impressions < MIN_IMPRESSIONS) {
        return { ...t, roas, ctr, link_ctr, cpc, cpa, score: 0, classification: "needs_more_data" as SignalClass }
      }

      const components = {
        revenue:    t.net_revenue / maxRev,
        roas:       roas / maxRoas,
        ctr:        ctr / maxCtr,
        cpc_eff:    maxCpc > 0 ? 1 - cpc / maxCpc : 0,
        order_rate: orderRate / maxOr,
        hook:       maxHook > 0 ? t.hook_rate / maxHook : 0,
        confidence: 0.8,
      }
      const score = Object.entries(WEIGHTS).reduce(
        (acc, [k, w]) => acc + w * (components[k as keyof typeof components] ?? 0),
        0,
      )

      const highCtr  = ctr >= CTR_MISLEADING_FLOOR
      const lowRoas  = roas <= ROAS_MISLEADING_CEIL
      const highRoas = roas >= 2.5

      let classification: SignalClass
      if (highCtr && lowRoas)                                   classification = "misleading_hook"
      else if (highCtr && highRoas)                             classification = "strong_winner"
      else if (highRoas && !highCtr)                            classification = "conversion_winner"
      else if (highCtr && t.net_revenue < maxRev * 0.15)       classification = "creative_hook_winner"
      else if (score < 0.25)                                    classification = "weak_attention"
      else                                                      classification = score >= 0.65 ? "strong_winner" : "conversion_winner"

      return { ...t, roas, ctr, link_ctr, cpc, cpa, score: Math.round(score * 1000) / 1000, classification }
    })
    .sort((a, b) => b.score - a.score)
}
