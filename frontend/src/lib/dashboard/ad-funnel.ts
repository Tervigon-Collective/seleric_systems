// Pure (client-safe) logic for the stage-centric ads funnel.
// Source rows come from meta_ad_performance (ad grain) + meta_neurotag_analysis (ad → tag map).

const AP = "meta_ad_performance"
const NT = "meta_neurotag_analysis"
const OA = "order_attribution"

function n(v: unknown): number {
  const x = Number(v ?? 0)
  return isFinite(x) ? x : 0
}

// ── Stage model ────────────────────────────────────────────────────────────
export type StageKind = "audience" | "video" | "convert"

export interface StageDef {
  key: string
  label: string
  field: keyof FunnelAd  // numeric count field on FunnelAd
  prev: string | null    // previous stage key used for the step pass-rate
  kind: StageKind
  hint: string
}

// Top → bottom. Audience stages rank by volume; video/convert stages rank by pass-rate.
export const STAGES: StageDef[] = [
  { key: "reach",       label: "Reach",       field: "reach",       prev: null,          kind: "audience", hint: "unique accounts reached" },
  { key: "impressions", label: "Impressions", field: "impressions", prev: "reach",       kind: "audience", hint: "total times shown" },
  { key: "v3s",         label: "3s Views",    field: "video_views", prev: "impressions", kind: "video",    hint: "scroll-stop · the hook" },
  { key: "v25",         label: "25% Viewed",  field: "video_p25",   prev: "v3s",         kind: "video",    hint: "held past the hook" },
  { key: "v50",         label: "50% Viewed",  field: "video_p50",   prev: "v25",         kind: "video",    hint: "mid-video retention" },
  { key: "v75",         label: "75% Viewed",  field: "video_p75",   prev: "v50",         kind: "video",    hint: "deep retention" },
  { key: "v100",        label: "100% Viewed", field: "video_p100",  prev: "v75",         kind: "video",    hint: "watched to the end" },
  // Thruplay = 15s-or-complete plays. NOT downstream of 100%-viewed (a sub-15s video
  // completes before "100%" of a longer one), so anchor it to 3s views — a clean ≤100%
  // share of scroll-stoppers — instead of producing a meaningless >600% step.
  { key: "thruplay",    label: "Thruplay",    field: "thruplay",    prev: "v3s",         kind: "video",    hint: "15s+/complete plays · share of 3s views (not a sequential step)" },
  { key: "linkclick",   label: "Link Click",  field: "link_clicks", prev: "impressions", kind: "convert",  hint: "clicked through (CTR)" },
  // On-site conversion (LPV → ATC → Checkout) is the PDP funnel — a separate module — and
  // is Meta-pixel attributed. It is intentionally NOT here. The only outcome we keep is
  // Orders, from OUR warehouse attribution (real, last-touch), as click → real order.
  { key: "order",       label: "Orders",      field: "orders",      prev: "linkclick",   kind: "convert",  hint: "real warehouse-attributed orders · click → order" },
]

const STAGE_BY_KEY = new Map(STAGES.map((s) => [s.key, s]))
// thruplay excluded — it is not a clean sequential step, so it can't be the "biggest drop".
const VIDEO_GAP_KEYS = new Set(["v3s", "v25", "v50", "v75", "v100"])

// ── Ad model ───────────────────────────────────────────────────────────────
export interface AdTag {
  tag_code: string
  hack_name: string
  category_name: string
}

export interface FunnelAd {
  ad_id: string
  ad_name: string
  campaign_name: string
  adset_name: string
  spend: number
  reach: number
  impressions: number
  video_views: number // 3s
  video_p25: number
  video_p50: number
  video_p75: number
  video_p100: number
  thruplay: number
  link_clicks: number
  clicks: number
  landing_page_views: number
  add_to_cart: number
  initiate_checkout: number
  orders: number          // REAL warehouse-attributed Meta orders (last-touch, by ad_id)
  purchase_value: number  // REAL attributed net revenue (ex-GST)
  roas: number            // REAL ROAS = purchase_value / spend
  hook_rate: number
  tags: AdTag[]
}

export function parseAdFunnelRows(
  adRows: Record<string, unknown>[],
  tagMapRows: Record<string, unknown>[],
  attributionRows: Record<string, unknown>[] = [],
): FunnelAd[] {
  // ad_id → tags[] (skip untagged, dedupe by tag_code)
  const tagMap = new Map<string, AdTag[]>()
  for (const r of tagMapRows) {
    const adId = String(r[`${NT}.ad_id`] ?? "")
    const code = String(r[`${NT}.tag_code`] ?? "")
    if (!adId || !code || code === "__untagged__") continue
    const tag: AdTag = {
      tag_code: code,
      hack_name: String(r[`${NT}.hack_name`] ?? "—"),
      category_name: String(r[`${NT}.category_name`] ?? "—"),
    }
    const list = tagMap.get(adId) ?? []
    if (!list.some((t) => t.tag_code === code)) list.push(tag)
    tagMap.set(adId, list)
  }

  // ad_id → real warehouse attribution (last-touch). Orders/revenue/ROAS below are REAL,
  // not Meta pixel — join is on ad_id (ad_name is not unique).
  const realByAd = buildAdRealMap(attributionRows)

  return adRows
    .map((r) => {
      const adId = String(r[`${AP}.ad_id`] ?? "")
      const spend = n(r[`${AP}.spend`])
      const real = realByAd.get(adId)
      const realRevenue = real?.realRevenue ?? 0
      return {
        ad_id: adId,
        ad_name: String(r[`${AP}.ad_name`] ?? "—"),
        campaign_name: String(r[`${AP}.campaign_name`] ?? "—"),
        adset_name: String(r[`${AP}.adset_name`] ?? "—"),
        spend,
        reach: n(r[`${AP}.reach`]),
        impressions: n(r[`${AP}.impressions`]),
        video_views: n(r[`${AP}.video_views`]),
        video_p25: n(r[`${AP}.video_p25_views`]),
        video_p50: n(r[`${AP}.video_p50_views`]),
        video_p75: n(r[`${AP}.video_p75_views`]),
        video_p100: n(r[`${AP}.video_p100_views`]),
        thruplay: n(r[`${AP}.video_thruplay_15s`]),
        link_clicks: n(r[`${AP}.link_clicks`]),
        clicks: n(r[`${AP}.clicks`]),
        landing_page_views: n(r[`${AP}.landing_page_views`]),
        add_to_cart: n(r[`${AP}.add_to_cart`]),
        initiate_checkout: n(r[`${AP}.initiate_checkout`]),
        orders: real?.realOrders ?? 0,
        purchase_value: realRevenue,
        roas: spend > 0 ? realRevenue / spend : 0,
        hook_rate: n(r[`${AP}.hook_rate`]),
        tags: tagMap.get(adId) ?? [],
      }
    })
    .filter((a) => a.ad_id !== "")
}

// ── Ad-grain real attribution (warehouse, last-touch) ────────────────────────
// The pixel funnel tail (ATC→Checkout→Purchase) overcounts vs true orders. Real
// attribution (gold.fct_order_attribution) resolves to the ad — join on lt_ad_id
// (ad_name is NOT unique: one name can have several ad_ids). Each ad card shows its
// true Meta orders/revenue and a real ROAS (true revenue ÷ that ad's own spend).
export interface AdReal {
  realOrders: number   // Meta last-touch attributed orders for the ad
  realRevenue: number  // Meta attributed net revenue (ex-GST)
  placedOrders: number // orders where Meta touched the journey (pre last-touch credit)
}

export function buildAdRealMap(
  attributionRows: Record<string, unknown>[],
): Map<string, AdReal> {
  const map = new Map<string, AdReal>()
  for (const r of attributionRows) {
    const adId = String(r[`${OA}.lt_ad_id`] ?? "")
    if (!adId) continue // null bucket = order not resolved to a specific ad
    map.set(adId, {
      realOrders: n(r[`${OA}.meta_attributed_orders`]),
      realRevenue: n(r[`${OA}.meta_attributed_revenue`]),
      placedOrders: n(r[`${OA}.placed_orders`]),
    })
  }
  return map
}

function adCount(ad: FunnelAd, stageKey: string): number {
  const def = STAGE_BY_KEY.get(stageKey)
  if (!def) return 0
  return n(ad[def.field] as number)
}

// ── Headline funnel ──────────────────────────────────────────────────────────
export interface FunnelStage {
  key: string
  label: string
  kind: StageKind
  hint: string
  count: number
  pctOfImpr: number // bar width baseline = impressions
  pctOfPrev: number // step rate vs configured prev stage
  prevLabel: string
  isGap: boolean
}

export interface FunnelTotals {
  reach: number
  impressions: number
  frequency: number
  cpm: number
  spend: number
  realOrders: number   // REAL warehouse-attributed Meta orders (the Orders stage)
  realRevenue: number  // REAL attributed net revenue (ex-GST)
  realRoas: number     // realRevenue / spend
  stages: FunnelStage[]
}

/** Sum a FunnelAd field across all ads (fallback when no totals row available). */
function sumField(ads: FunnelAd[], field: keyof FunnelAd): number {
  return ads.reduce((acc, a) => acc + n(a[field] as number), 0)
}

/** Brand totals of REAL attributed orders/revenue, summed over all attribution rows
 *  (includes the null-ad bucket — orders Meta-attributed but not resolved to an ad). */
export function sumRealTotals(
  attributionRows: Record<string, unknown>[],
): { orders: number; revenue: number } {
  let orders = 0
  let revenue = 0
  for (const r of attributionRows) {
    orders += n(r[`${OA}.meta_attributed_orders`])
    revenue += n(r[`${OA}.meta_attributed_revenue`])
  }
  return { orders, revenue }
}

export function buildFunnelTotals(
  totalsRow: Record<string, unknown> | undefined,
  ads: FunnelAd[],
  realTotals?: { orders: number; revenue: number },
): FunnelTotals {
  // Prefer the exact (no-dimension) totals row; fall back to summing ads.
  const get = (field: keyof FunnelAd, cubeKey: string): number =>
    totalsRow ? n(totalsRow[cubeKey]) : sumField(ads, field)

  // Real attributed orders/revenue: use the exact brand totals when provided,
  // else fall back to summing the ads' (already-real) per-ad orders/revenue.
  const realOrders = realTotals ? realTotals.orders : sumField(ads, "orders")
  const realRevenue = realTotals ? realTotals.revenue : sumField(ads, "purchase_value")

  const counts: Record<string, number> = {
    reach: get("reach", `${AP}.reach`),
    impressions: get("impressions", `${AP}.impressions`),
    v3s: get("video_views", `${AP}.video_views`),
    v25: get("video_p25", `${AP}.video_p25_views`),
    v50: get("video_p50", `${AP}.video_p50_views`),
    v75: get("video_p75", `${AP}.video_p75_views`),
    v100: get("video_p100", `${AP}.video_p100_views`),
    thruplay: get("thruplay", `${AP}.video_thruplay_15s`),
    linkclick: get("link_clicks", `${AP}.link_clicks`),
    order: realOrders, // REAL attributed orders, not pixel purchases
  }

  const impressions = counts.impressions || 1
  const spend = get("spend", `${AP}.spend`)
  const frequency = totalsRow ? n(totalsRow[`${AP}.frequency`]) : counts.reach > 0 ? counts.impressions / counts.reach : 0
  const cpm = totalsRow ? n(totalsRow[`${AP}.cpm`]) : counts.impressions > 0 ? (spend / counts.impressions) * 1000 : 0

  const stages: FunnelStage[] = STAGES.map((def) => {
    const count = counts[def.key] ?? 0
    const prevCount = def.prev ? counts[def.prev] ?? 0 : 0
    return {
      key: def.key,
      label: def.label,
      kind: def.kind,
      hint: def.hint,
      count,
      pctOfImpr: (count / impressions) * 100,
      pctOfPrev: def.prev ? (prevCount > 0 ? (count / prevCount) * 100 : 0) : 100,
      prevLabel: def.prev ? STAGE_BY_KEY.get(def.prev)?.label ?? "" : "",
      isGap: false,
    }
  })

  // Biggest step drop among video retention stages = the headline funnel gap.
  let worstKey = ""
  let worstDrop = 101
  for (const s of stages) {
    if (!VIDEO_GAP_KEYS.has(s.key)) continue
    if (s.pctOfPrev < worstDrop) {
      worstDrop = s.pctOfPrev
      worstKey = s.key
    }
  }
  const gap = stages.find((s) => s.key === worstKey)
  if (gap) gap.isGap = true

  return {
    reach: counts.reach,
    impressions: counts.impressions,
    frequency,
    cpm,
    spend,
    realOrders,
    realRevenue,
    realRoas: spend > 0 ? realRevenue / spend : 0,
    stages,
  }
}

// ── Per-stage analysis: strong / weak ads + neuro-tag rollup ─────────────────
export interface ScoredAd {
  ad: FunnelAd
  count: number
  prevCount: number
  passRate: number // 0..1 (rate stages) or share of stage volume (audience stages)
  score: number
  waste: number
}

export interface ScoredStageTag {
  tag_code: string
  hack_name: string
  category_name: string
  count: number
  prevCount: number
  passRate: number
  spend: number
  adCount: number
  score: number
  waste: number
}

export interface StageAnalysis {
  stage: FunnelStage
  isRateStage: boolean
  strong: ScoredAd[]
  weak: ScoredAd[]
  tags: ScoredStageTag[]
  weakTags: ScoredStageTag[]
}

const MIN_SPEND = 500
const FULL_CONF_SPEND = 20_000 // ₹ at which spend-confidence saturates
const MIN_PREV = 50            // min upstream volume for a meaningful pass-rate
const W_RATE = 0.5
const W_VOL = 0.35
const W_CONF = 0.15

function confidence(spend: number): number {
  return Math.min(spend / FULL_CONF_SPEND, 1)
}

export function analyzeStage(
  ads: FunnelAd[],
  stageKey: string,
  opts: { topAds?: number; topTags?: number } = {},
): StageAnalysis | null {
  const def = STAGE_BY_KEY.get(stageKey)
  const stageList = buildFunnelTotals(undefined, ads).stages
  const stage = stageList.find((s) => s.key === stageKey)
  if (!def || !stage) return null

  const topAds = opts.topAds ?? 6
  const topTags = opts.topTags ?? 8
  const isRateStage = def.kind !== "audience" && def.prev !== null

  // ── Ads ──
  const eligible = ads
    .map((ad) => {
      const count = adCount(ad, stageKey)
      const prevCount = def.prev ? adCount(ad, def.prev) : ad.impressions
      const passRate = isRateStage
        ? prevCount > 0 ? count / prevCount : 0
        : 0 // filled with volume share below
      return { ad, count, prevCount, passRate }
    })
    .filter((e) =>
      e.ad.spend >= MIN_SPEND &&
      e.count > 0 &&
      (isRateStage ? e.prevCount >= MIN_PREV : true),
    )

  const maxRate = Math.max(...eligible.map((e) => e.passRate), 1e-9)
  const maxVol = Math.max(...eligible.map((e) => e.count), 1e-9)

  const scoredAds: ScoredAd[] = eligible.map((e) => {
    const rateNorm = isRateStage ? e.passRate / maxRate : e.count / maxVol
    const volNorm = e.count / maxVol
    const conf = confidence(e.ad.spend)
    const score = W_RATE * rateNorm + W_VOL * volNorm + W_CONF * conf
    const waste = conf * (1 - rateNorm) // budget that reached the step but failed it
    return {
      ad: e.ad,
      count: e.count,
      prevCount: e.prevCount,
      passRate: isRateStage ? e.passRate : volNorm,
      score,
      waste,
    }
  })

  const strong = [...scoredAds].sort((a, b) => b.score - a.score).slice(0, topAds)
  const weak = [...scoredAds].sort((a, b) => b.waste - a.waste).slice(0, topAds)

  // ── Tags (fan out: each tag of a multi-tag ad gets the ad's counts) ──
  const tagAgg = new Map<string, ScoredStageTag>()
  for (const ad of ads) {
    if (ad.spend < MIN_SPEND) continue
    const count = adCount(ad, stageKey)
    if (count <= 0) continue
    const prevCount = def.prev ? adCount(ad, def.prev) : ad.impressions
    for (const t of ad.tags) {
      const cur = tagAgg.get(t.tag_code) ?? {
        tag_code: t.tag_code,
        hack_name: t.hack_name,
        category_name: t.category_name,
        count: 0,
        prevCount: 0,
        passRate: 0,
        spend: 0,
        adCount: 0,
        score: 0,
        waste: 0,
      }
      cur.count += count
      cur.prevCount += prevCount
      cur.spend += ad.spend
      cur.adCount += 1
      tagAgg.set(t.tag_code, cur)
    }
  }

  const tagArr = [...tagAgg.values()].filter(
    (t) => t.spend >= MIN_SPEND && (isRateStage ? t.prevCount >= MIN_PREV : true),
  )
  for (const t of tagArr) {
    t.passRate = isRateStage ? (t.prevCount > 0 ? t.count / t.prevCount : 0) : 0
  }
  const maxTagRate = Math.max(...tagArr.map((t) => t.passRate), 1e-9)
  const maxTagVol = Math.max(...tagArr.map((t) => t.count), 1e-9)
  for (const t of tagArr) {
    const rateNorm = isRateStage ? t.passRate / maxTagRate : t.count / maxTagVol
    const volNorm = t.count / maxTagVol
    const conf = confidence(t.spend)
    t.score = W_RATE * rateNorm + W_VOL * volNorm + W_CONF * conf
    t.waste = conf * (1 - rateNorm)
    if (!isRateStage) t.passRate = volNorm
  }

  const tags = [...tagArr].sort((a, b) => b.score - a.score).slice(0, topTags)
  const weakTags = isRateStage
    ? [...tagArr].sort((a, b) => b.waste - a.waste).slice(0, topTags)
    : []

  return { stage, isRateStage, strong, weak, tags, weakTags }
}

// ── Per-ad classification (stage-specific vs full-funnel strength) ────────────
// Implements "a hook that wins 3s but loses P25 isn't a true winner".
export type AdLabel = "hook_winner" | "retention_winner" | "conversion_winner" | "clickbait_risk"

export const AD_LABEL_META: Record<AdLabel, { label: string; cls: string }> = {
  hook_winner:       { label: "Hook winner",       cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  retention_winner:  { label: "Retention winner",  cls: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  conversion_winner: { label: "Conversion winner", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  clickbait_risk:    { label: "Clickbait risk",    cls: "bg-red-500/15 text-red-400 border-red-500/30" },
}

function wAvg(num: number, den: number): number {
  return den > 0 ? num / den : 0
}

/** Label ads vs impression-weighted account averages. One ad can carry multiple labels. */
export function classifyAds(ads: FunnelAd[]): Map<string, AdLabel[]> {
  const elig = ads.filter((a) => a.spend >= MIN_SPEND && a.impressions >= 1000)

  let sImp = 0, s3s = 0, sP25 = 0, sP75 = 0, sLink = 0, sOrders = 0
  for (const a of elig) {
    sImp += a.impressions
    s3s += a.video_views
    sP25 += a.video_p25
    sP75 += a.video_p75
    sLink += a.link_clicks
    sOrders += a.orders
  }
  const avgHook = wAvg(s3s, sImp)        // 3s / impressions
  const avgP25  = wAvg(sP25, s3s)        // p25 / 3s (held past the hook)
  const avgP75  = wAvg(sP75, s3s)        // p75 / 3s (deep retention)
  const avgCtr  = wAvg(sLink, sImp)
  const avgCvr  = wAvg(sOrders, sLink)   // click → REAL order (warehouse, no pixel)

  const out = new Map<string, AdLabel[]>()
  for (const a of elig) {
    const hook = wAvg(a.video_views, a.impressions)
    const p25  = wAvg(a.video_p25, a.video_views)
    const p75  = wAvg(a.video_p75, a.video_views)
    const ctr  = wAvg(a.link_clicks, a.impressions)
    const cvr  = wAvg(a.orders, a.link_clicks)

    const hookStrong = hook >= avgHook * 1.15
    const attnStrong = hookStrong || ctr >= avgCtr * 1.15
    const heldHook   = avgP25 > 0 && p25 >= avgP25 * 0.95
    // Conversion strength from REAL attribution only (real click→order rate or real ROAS).
    const convStrong = cvr >= avgCvr * 1.15 || a.roas >= 2.5

    const labels: AdLabel[] = []
    if (attnStrong && !heldHook) labels.push("clickbait_risk")
    if (hookStrong && heldHook) labels.push("hook_winner")
    if (avgP75 > 0 && p75 >= avgP75 * 1.15) labels.push("retention_winner")
    if (convStrong && a.orders >= 1) labels.push("conversion_winner")
    if (labels.length) out.set(a.ad_id, labels)
  }
  return out
}

// ── Neuro-category × stage heatmap (lift vs spend-weighted column average) ────
export interface HeatStageDef { key: string; label: string; measure: string }

export const HEAT_STAGES: HeatStageDef[] = [
  // Ad-performance / creative stages only — hold rates + CTR are Meta delivery metrics.
  // On-site conversion rates (Click→LPV, LPV→ATC, ATC→CO, CO→Buy) are Meta-pixel and
  // belong to the PDP funnel module, so they are intentionally excluded here.
  { key: "hook",  label: "Hook 3s",   measure: `${NT}.hook_rate` },
  { key: "h50",   label: "50%",       measure: `${NT}.hold_rate_p50` },
  { key: "h75",   label: "75%",       measure: `${NT}.hold_rate_p75` },
  { key: "h100",  label: "100%",      measure: `${NT}.hold_rate_p100` },
  { key: "ctr",   label: "CTR",       measure: `${NT}.ctr` },
]

export interface HeatCell { stageKey: string; rate: number; lift: number }
export interface HeatRow { category: string; spend: number; cells: HeatCell[] }
export interface HeatmapData { stages: HeatStageDef[]; rows: HeatRow[] }

export function parseCategoryStageHeatmap(rows: Record<string, unknown>[]): HeatmapData {
  const cats = rows
    .map((r) => ({
      category: String(r[`${NT}.category_name`] ?? "—"),
      spend: n(r[`${NT}.spend_sc`]),
      rates: Object.fromEntries(HEAT_STAGES.map((s) => [s.key, n(r[s.measure])])) as Record<string, number>,
    }))
    .filter((c) => c.category !== "Untagged" && c.category !== "—" && c.spend > 0)

  // spend-weighted column averages
  const colAvg: Record<string, number> = {}
  for (const s of HEAT_STAGES) {
    let num = 0
    let den = 0
    for (const c of cats) {
      num += c.rates[s.key] * c.spend
      den += c.spend
    }
    colAvg[s.key] = den > 0 ? num / den : 0
  }

  const heatRows: HeatRow[] = cats.map((c) => ({
    category: c.category,
    spend: c.spend,
    cells: HEAT_STAGES.map((s) => {
      const rate = c.rates[s.key]
      const avg = colAvg[s.key]
      return { stageKey: s.key, rate, lift: avg > 0 ? ((rate - avg) / avg) * 100 : 0 }
    }),
  }))

  return { stages: HEAT_STAGES, rows: heatRows }
}
