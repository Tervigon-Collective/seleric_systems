"use client"

import { useState, useMemo } from "react"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { CampaignAdRow, CampaignAdSkuRow } from "@/lib/dashboard/queries/attribution"
import type { CampaignRollupOrders } from "@/lib/dashboard/queries/attribution-clickhouse"
import type { CubeRow } from "@/lib/chat/cube-rows"

function n(v: unknown) { return Number(v ?? 0) }
function fmt(v: number) { return v !== 0 ? fmtCurrency(v) : "—" }
function fmtRoas(rev: number, spend: number) {
  return spend > 0 ? `${(rev / spend).toFixed(2)}x` : "—"
}
function fmtPct(v: number) { return v > 0 ? `${(v * 100).toFixed(1)}%` : "—" }
function fmtUnits(v: number) { return v > 0 ? fmtCount(v) : "—" }

// ── Tree nodes ──────────────────────────────────────────────────────────────

interface SkuNode { sku: string; productTitle: string; units: number; revenue: number }

interface AdNode {
  adId: string; adName: string
  orders: number; revenue: number; units: number
  spend: number; ctr: number; cpc: number; hookRate: number
  skus: SkuNode[]
}

interface AdsetNode {
  adsetName: string
  orders: number; revenue: number; units: number
  spend: number; ctr: number; cpc: number; hookRate: number
  ads: AdNode[]
}

interface CampaignNode {
  platform: string
  campaignName: string
  orders: number; revenue: number; units: number
  spend: number; impressions: number
  ctr: number; cpc: number; hookRate: number
  adsets: AdsetNode[]
}

// ── Delivery aggregators ────────────────────────────────────────────────────

interface RawDelivery {
  spend: number; impressions: number; clicks: number; videoViews3s: number
}
const ZERO: RawDelivery = { spend: 0, impressions: 0, clicks: 0, videoViews3s: 0 }
function addRaw(a: RawDelivery, b: RawDelivery): RawDelivery {
  return {
    spend: a.spend + b.spend,
    impressions: a.impressions + b.impressions,
    clicks: a.clicks + b.clicks,
    videoViews3s: a.videoViews3s + b.videoViews3s,
  }
}

// ── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(
  adRows: CampaignAdRow[],
  skuRows: CampaignAdSkuRow[],
  rollupOrders: CampaignRollupOrders | undefined,
  metaDelivery: CubeRow[],
  adDelivery: CubeRow[],
  googleDelivery: CubeRow[],
): CampaignNode[] {
  // ── Build Meta ad-level delivery + roll up to adset & campaign in one pass ──
  // (ctr/cpc/hook_rate in the raw daily table are pre-computed per-day ratios;
  //  summing them gives wrong results — we always aggregate raw additive counts.)
  const adDeliveryByAdId = new Map<string, RawDelivery>()
  const adsetDeliveryByKey = new Map<string, RawDelivery>()   // key: campaign_name||adset_name
  const metaCampaignDeliveryFromAds = new Map<string, RawDelivery>()  // key: campaign_name

  for (const r of adDelivery) {
    const adId = String(r["meta_ad_performance.ad_id"] ?? "")
    const adsetName = String(r["meta_ad_performance.adset_name"] ?? "")
    const campaignName = String(r["meta_ad_performance.campaign_name"] ?? "")
    const m: RawDelivery = {
      spend: n(r["meta_ad_performance.spend"]),
      impressions: n(r["meta_ad_performance.impressions"]),
      clicks: n(r["meta_ad_performance.clicks"]),
      videoViews3s: n(r["meta_ad_performance.video_views_3s"]),
    }
    if (adId) adDeliveryByAdId.set(adId, m)
    if (campaignName && adsetName) {
      const k = `${campaignName}||${adsetName}`
      adsetDeliveryByKey.set(k, addRaw(adsetDeliveryByKey.get(k) ?? ZERO, m))
    }
    if (campaignName) {
      metaCampaignDeliveryFromAds.set(
        campaignName,
        addRaw(metaCampaignDeliveryFromAds.get(campaignName) ?? ZERO, m),
      )
    }
  }

  // Authoritative Meta campaign-level delivery (covers campaigns with no rows in adDelivery's top-N).
  // Hook rate isn't available here, so we still source video_views_3s from the ad-level rollup.
  const metaCampaignDelivery = new Map<string, { spend: number; impressions: number; clicks: number }>()
  for (const r of metaDelivery) {
    const name = String(r["marketing_performance.campaign_name"] ?? "")
    if (name) metaCampaignDelivery.set(name, {
      spend: n(r["marketing_performance.ad_spend"]),
      impressions: n(r["marketing_performance.impressions"]),
      clicks: n(r["marketing_performance.clicks"]),
    })
  }

  // Google campaign-level delivery (ctr/cpc are valid per-campaign ratios in Google reporting).
  const googleCampaignDelivery = new Map<string, {
    spend: number; impressions: number; clicks: number; ctr: number; cpc: number
  }>()
  for (const r of googleDelivery) {
    const name = String(r["google_ad_performance.campaign_name"] ?? "")
    if (name) googleCampaignDelivery.set(name, {
      spend: n(r["google_ad_performance.spend"]),
      impressions: n(r["google_ad_performance.impressions"]),
      clicks: n(r["google_ad_performance.clicks"]),
      ctr: n(r["google_ad_performance.ctr"]),
      cpc: n(r["google_ad_performance.cpc"]),
    })
  }

  // SKU lookup: ad_id → sku rows (revenue + units)
  const skuByAdId = new Map<string, SkuNode[]>()
  for (const r of skuRows) {
    const key = r.ad_id
    if (!skuByAdId.has(key)) skuByAdId.set(key, [])
    skuByAdId.get(key)!.push({
      sku: r.sku, productTitle: r.product_title, units: r.units, revenue: r.revenue,
    })
  }

  // Group adRows → platform → campaign → adset → ad (keyed by platform so two
  // platforms with the same campaign_name don't collide).
  const campaignMap = new Map<
    string,
    { platform: string; campaignName: string; adsets: Map<string, Map<string, { adName: string; orders: number }>> }
  >()
  for (const r of adRows) {
    const cKey = `${r.platform}||${r.campaign_name}`
    if (!campaignMap.has(cKey)) {
      campaignMap.set(cKey, { platform: r.platform, campaignName: r.campaign_name, adsets: new Map() })
    }
    const entry = campaignMap.get(cKey)!
    if (!entry.adsets.has(r.adset_name)) entry.adsets.set(r.adset_name, new Map())
    const adMap = entry.adsets.get(r.adset_name)!
    const adKey = r.ad_id || r.ad_name
    if (!adMap.has(adKey)) adMap.set(adKey, { adName: r.ad_name, orders: 0 })
    adMap.get(adKey)!.orders += r.orders
  }

  const campaigns: CampaignNode[] = []
  for (const [, entry] of campaignMap) {
    const { platform, campaignName, adsets: adsetMap } = entry
    const adsets: AdsetNode[] = []
    let campaignRevenue = 0
    let campaignUnits = 0

    for (const [adsetName, adMap] of adsetMap) {
      const ads: AdNode[] = []
      let adsetRevenue = 0
      let adsetUnits = 0

      for (const [adKey, adData] of adMap) {
        const adId = adKey.startsWith("Unknown") ? "" : adKey
        const adDeliv = adDeliveryByAdId.get(adId) ?? ZERO
        const adCtr = adDeliv.impressions > 0 ? adDeliv.clicks / adDeliv.impressions : 0
        const adCpc = adDeliv.clicks > 0 ? adDeliv.spend / adDeliv.clicks : 0
        const adHookRate = adDeliv.impressions > 0 ? adDeliv.videoViews3s / adDeliv.impressions : 0

        const adSkus = (skuByAdId.get(adId) ?? []).sort((a, b) => b.revenue - a.revenue)
        const adRevenue = adSkus.reduce((s, r) => s + r.revenue, 0)
        const adUnits = adSkus.reduce((s, r) => s + r.units, 0)

        adsetRevenue += adRevenue
        adsetUnits += adUnits

        ads.push({
          adId,
          adName: adData.adName,
          orders: adData.orders,
          revenue: adRevenue,
          units: adUnits,
          spend: adDeliv.spend,
          ctr: adCtr,
          cpc: adCpc,
          hookRate: adHookRate,
          skus: adSkus,
        })
      }

      const asDeliv = adsetDeliveryByKey.get(`${campaignName}||${adsetName}`) ?? ZERO
      const asCtr = asDeliv.impressions > 0 ? asDeliv.clicks / asDeliv.impressions : 0
      const asCpc = asDeliv.clicks > 0 ? asDeliv.spend / asDeliv.clicks : 0
      const asHookRate = asDeliv.impressions > 0 ? asDeliv.videoViews3s / asDeliv.impressions : 0
      // Adset-direct distinct orders (correct: sum-of-ad-orders can over-count if one order touches multiple ads).
      const adsetOrdersDirect = rollupOrders?.adset.get(`${platform}||${campaignName}||${adsetName}`)
        ?? ads.reduce((s, a) => s + a.orders, 0)

      campaignRevenue += adsetRevenue
      campaignUnits += adsetUnits

      adsets.push({
        adsetName,
        orders: adsetOrdersDirect,
        revenue: adsetRevenue,
        units: adsetUnits,
        spend: asDeliv.spend,
        ctr: asCtr,
        cpc: asCpc,
        hookRate: asHookRate,
        ads: ads.sort((a, b) => b.revenue - a.revenue),
      })
    }

    // Campaign-level delivery: prefer authoritative source per platform.
    let cSpend = 0
    let cImpressions = 0
    let cClicks = 0
    let cCtr = 0
    let cCpc = 0
    let cHookRate = 0

    if (platform === "google") {
      const gd = googleCampaignDelivery.get(campaignName)
      if (gd) {
        cSpend = gd.spend
        cImpressions = gd.impressions
        cClicks = gd.clicks
        cCtr = gd.ctr
        cCpc = gd.cpc
      }
      // No hook rate for Google
    } else if (platform === "meta") {
      const md = metaCampaignDelivery.get(campaignName)
      if (md) {
        cSpend = md.spend
        cImpressions = md.impressions
        cClicks = md.clicks
      }
      cCtr = cImpressions > 0 ? cClicks / cImpressions : 0
      cCpc = cClicks > 0 ? cSpend / cClicks : 0
      // Hook rate: derive from ad-level rollup; use that source's impressions as denominator
      // so numerator/denominator are consistent (avoids skew from adDelivery row-limit truncation).
      const adsAgg = metaCampaignDeliveryFromAds.get(campaignName)
      if (adsAgg && adsAgg.impressions > 0) {
        cHookRate = adsAgg.videoViews3s / adsAgg.impressions
      }
    }

    const campaignOrdersDirect = rollupOrders?.campaign.get(`${platform}||${campaignName}`)
      ?? adsets.reduce((s, a) => s + a.orders, 0)

    campaigns.push({
      platform,
      campaignName,
      orders: campaignOrdersDirect,
      revenue: campaignRevenue,
      units: campaignUnits,
      spend: cSpend,
      impressions: cImpressions,
      ctr: cCtr,
      cpc: cCpc,
      hookRate: cHookRate,
      adsets: adsets.sort((a, b) => b.revenue - a.revenue),
    })
  }

  return campaigns.sort((a, b) => b.revenue - a.revenue)
}

// ── Shared table styles ───────────────────────────────────────────────────────

const TH = "px-3 py-2 text-left text-xs font-medium text-slate-400 dark:text-night-400 whitespace-nowrap border-b border-slate-800 dark:border-night-800 bg-slate-900 dark:bg-night-875"
const TD = "px-3 py-2 text-xs text-slate-300 dark:text-night-200 whitespace-nowrap"
const TR_BASE = "border-b border-slate-800/50 dark:border-night-800/50"

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  adRows: CampaignAdRow[]
  skuRows: CampaignAdSkuRow[]
  rollupOrders?: CampaignRollupOrders
  metaDelivery: CubeRow[]
  adDelivery: CubeRow[]
  googleDelivery?: CubeRow[]
}

export function AttributionCampaignDrilldown({
  adRows, skuRows, rollupOrders, metaDelivery, adDelivery, googleDelivery,
}: Props) {
  const [openCampaigns, setOpenCampaigns] = useState<Set<string>>(new Set())
  const [openAdsets, setOpenAdsets] = useState<Set<string>>(new Set())
  const [openAds, setOpenAds] = useState<Set<string>>(new Set())

  const campaigns = useMemo(
    () => buildTree(adRows, skuRows, rollupOrders, metaDelivery, adDelivery, googleDelivery ?? []),
    [adRows, skuRows, rollupOrders, metaDelivery, adDelivery, googleDelivery]
  )

  function toggleSet(set: Set<string>, key: string): Set<string> {
    const next = new Set(set)
    if (next.has(key)) { next.delete(key) } else { next.add(key) }
    return next
  }

  if (!campaigns.length) {
    return <p className="text-sm text-slate-500 dark:text-night-500">No campaign data for this period.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 dark:border-night-800">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className={TH} style={{ minWidth: 280 }}>Campaign / Adset / Ad / SKU</th>
            <th className={TH}>Orders</th>
            <th className={TH}>Revenue (Gross Ex-GST)</th>
            <th className={TH}>Spend</th>
            <th className={TH}>ROAS</th>
            <th className={TH}>Units</th>
            <th className={TH}>CTR</th>
            <th className={TH}>CPC</th>
            <th className={TH}>Hook Rate</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const cKey = `${c.platform}||${c.campaignName}`
            const cOpen = openCampaigns.has(cKey)
            return [
              // Campaign row
              <tr
                key={`c-${cKey}`}
                className={`${TR_BASE} hover:bg-slate-800/30 dark:hover:bg-night-850/40 cursor-pointer`}
                onClick={() => setOpenCampaigns(toggleSet(openCampaigns, cKey))}
              >
                <td className={TD}>
                  <span className="mr-1.5 text-slate-500">{cOpen ? "▼" : "▶"}</span>
                  <span className="font-semibold text-slate-100 dark:text-night-50">{c.campaignName}</span>
                </td>
                <td className={TD}>{fmtCount(c.orders)}</td>
                <td className={TD}>{fmt(c.revenue)}</td>
                <td className={TD}>{fmt(c.spend)}</td>
                <td className={TD}>{fmtRoas(c.revenue, c.spend)}</td>
                <td className={TD}>{fmtUnits(c.units)}</td>
                <td className={TD}>{fmtPct(c.ctr)}</td>
                <td className={TD}>{fmt(c.cpc)}</td>
                <td className={TD}>{fmtPct(c.hookRate)}</td>
              </tr>,

              // Adset rows (visible when campaign is open)
              ...(cOpen ? c.adsets.map((a) => {
                const aKey = `${cKey}||${a.adsetName}`
                const aOpen = openAdsets.has(aKey)
                return [
                  <tr
                    key={`a-${aKey}`}
                    className={`${TR_BASE} hover:bg-slate-800/20 dark:hover:bg-night-850/30 cursor-pointer bg-slate-900/30 dark:bg-night-900/20`}
                    onClick={() => setOpenAdsets(toggleSet(openAdsets, aKey))}
                  >
                    <td className={TD}>
                      <span className="inline-block w-5" />
                      <span className="mr-1.5 text-slate-500">{aOpen ? "▼" : "▶"}</span>
                      <span className="text-slate-300 dark:text-night-300">{a.adsetName}</span>
                    </td>
                    <td className={TD}>{fmtCount(a.orders)}</td>
                    <td className={TD}>{fmt(a.revenue)}</td>
                    <td className={TD}>{fmt(a.spend)}</td>
                    <td className={TD}>{fmtRoas(a.revenue, a.spend)}</td>
                    <td className={TD}>{fmtUnits(a.units)}</td>
                    <td className={TD}>{fmtPct(a.ctr)}</td>
                    <td className={TD}>{fmt(a.cpc)}</td>
                    <td className={TD}>{fmtPct(a.hookRate)}</td>
                  </tr>,

                  // Ad rows (visible when adset is open)
                  ...(aOpen ? a.ads.map((ad) => {
                    const adKey = `${aKey}||${ad.adId || ad.adName}`
                    const adOpen = openAds.has(adKey)
                    return [
                      <tr
                        key={`ad-${adKey}`}
                        className={`${TR_BASE} hover:bg-slate-800/20 dark:hover:bg-night-850/30 cursor-pointer bg-slate-900/50 dark:bg-night-900/40`}
                        onClick={() => setOpenAds(toggleSet(openAds, adKey))}
                      >
                        <td className={TD}>
                          <span className="inline-block w-10" />
                          <span className="mr-1.5 text-slate-500">{adOpen ? "▼" : "▶"}</span>
                          <span className="text-slate-400 dark:text-night-400">{ad.adName}</span>
                        </td>
                        <td className={TD}>{fmtCount(ad.orders)}</td>
                        <td className={TD}>{fmt(ad.revenue)}</td>
                        <td className={TD}>{fmt(ad.spend)}</td>
                        <td className={TD}>{fmtRoas(ad.revenue, ad.spend)}</td>
                        <td className={TD}>{fmtUnits(ad.units)}</td>
                        <td className={TD}>{fmtPct(ad.ctr)}</td>
                        <td className={TD}>{fmt(ad.cpc)}</td>
                        <td className={TD}>{fmtPct(ad.hookRate)}</td>
                      </tr>,

                      // SKU rows (visible when ad is open)
                      ...(adOpen ? ad.skus.map((sku) => (
                        <tr key={`sku-${adKey}||${sku.sku}`} className={`${TR_BASE} bg-slate-950/40 dark:bg-night-950/30`}>
                          <td className={TD}>
                            <span className="inline-block w-16" />
                            <span className="text-slate-500 dark:text-night-600 mr-1">SKU</span>
                            <span className="text-slate-400 dark:text-night-400">{sku.sku}</span>
                            {sku.productTitle && sku.productTitle !== sku.sku && (
                              <span className="ml-2 text-slate-600 dark:text-night-600">{sku.productTitle}</span>
                            )}
                          </td>
                          <td className={TD}>—</td>
                          <td className={TD}>{fmt(sku.revenue)}</td>
                          <td className={TD}>—</td>
                          <td className={TD}>—</td>
                          <td className={TD}>{fmtCount(sku.units)}</td>
                          <td className={TD}>—</td>
                          <td className={TD}>—</td>
                          <td className={TD}>—</td>
                        </tr>
                      )) : []),
                    ]
                  }).flat() : []),
                ]
              }).flat() : []),
            ]
          })}
        </tbody>
      </table>
      <div className="px-3 py-1 text-xs text-slate-600 dark:text-night-600">
        Orders = distinct from fct_order_attribution (campaign/adset/ad direct counts) · Revenue = net_price/1.18 from fct_order_items · Spend/CTR/CPC/Hook from Meta delivery; Google CTR/CPC from Google Ads reporting
      </div>
    </div>
  )
}
