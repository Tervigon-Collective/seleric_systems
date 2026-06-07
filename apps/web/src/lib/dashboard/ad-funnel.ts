// Pure (client-safe) logic for the stage-centric ads funnel.
// Source rows come from meta_ad_performance (ad grain) + meta_neurotag_analysis (ad → tag map).

const AP = "meta_ad_performance"
const NT = "meta_neurotag_analysis"

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
  { key: "thruplay",    label: "Thruplay",    field: "thruplay",    prev: "v100",        kind: "video",    hint: "15s+ / completed plays" },
  { key: "linkclick",   label: "Link Click",  field: "link_clicks", prev: "impressions", kind: "convert",  hint: "clicked through (CTR)" },
  { key: "order",       label: "Order",       field: "orders",      prev: "linkclick",   kind: "convert",  hint: "purchased (CVR)" },
]

const STAGE_BY_KEY = new Map(STAGES.map((s) => [s.key, s]))
const VIDEO_GAP_KEYS = new Set(["v3s", "v25", "v50", "v75", "v100", "thruplay"])

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
  orders: number
  purchase_value: number
  roas: number
  hook_rate: number
  tags: AdTag[]
}

export function parseAdFunnelRows(
  adRows: Record<string, unknown>[],
  tagMapRows: Record<string, unknown>[],
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

  return adRows
    .map((r) => {
      const adId = String(r[`${AP}.ad_id`] ?? "")
      return {
        ad_id: adId,
        ad_name: String(r[`${AP}.ad_name`] ?? "—"),
        campaign_name: String(r[`${AP}.campaign_name`] ?? "—"),
        adset_name: String(r[`${AP}.adset_name`] ?? "—"),
        spend: n(r[`${AP}.spend`]),
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
        orders: n(r[`${AP}.purchases`]),
        purchase_value: n(r[`${AP}.purchase_value`]),
        roas: n(r[`${AP}.roas`]),
        hook_rate: n(r[`${AP}.hook_rate`]),
        tags: tagMap.get(adId) ?? [],
      }
    })
    .filter((a) => a.ad_id !== "")
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
  stages: FunnelStage[]
}

/** Sum a FunnelAd field across all ads (fallback when no totals row available). */
function sumField(ads: FunnelAd[], field: keyof FunnelAd): number {
  return ads.reduce((acc, a) => acc + n(a[field] as number), 0)
}

export function buildFunnelTotals(
  totalsRow: Record<string, unknown> | undefined,
  ads: FunnelAd[],
): FunnelTotals {
  // Prefer the exact (no-dimension) totals row; fall back to summing ads.
  const get = (field: keyof FunnelAd, cubeKey: string): number =>
    totalsRow ? n(totalsRow[cubeKey]) : sumField(ads, field)

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
    order: get("orders", `${AP}.purchases`),
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

  return { reach: counts.reach, impressions: counts.impressions, frequency, cpm, spend, stages }
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
