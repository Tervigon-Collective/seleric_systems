"use server"

import { parseTagRows, scoreTags } from "@/lib/dashboard/neurotag-scorer"
import { fetchNeurotagData } from "@/lib/dashboard/queries/neurotag"
import { fetchAdFunnelData } from "@/lib/dashboard/queries/ad-funnel"
import { serverLog } from "@/lib/server-log"

interface CreativeIQRequest {
  startDate: string
  endDate: string
  tagCode?: string
  adId?: string
  includeFunnel?: boolean
}

interface DashboardDateRange {
  start: string
  end: string
  spanDays: number
  isDefault: boolean
}

interface DashboardBrandFilter {
  id: number
  isDefault: boolean
}

interface CreativeIQMetadata {
  tagsScored: number
  strongWinners: number
  misleadingHooks: number
  converters: number
  totalSpend: number
  topTag?: string
}

export async function POST(request: Request) {
  try {
    const body: CreativeIQRequest = await request.json()
    const { startDate, endDate, tagCode, adId, includeFunnel = true } = body

    // Parse date range and brand filter (use default if not specified)
    const range: DashboardDateRange = {
      start: startDate,
      end: endDate,
      spanDays: 30,
      isDefault: false,
    }

    const brand: DashboardBrandFilter = { id: 0, isDefault: true }

    // Fetch neurotag + ad funnel data in parallel
    const [neurotagData, adFunnelData] = await Promise.all([
      fetchNeurotagData(range, brand),
      includeFunnel ? fetchAdFunnelData(range, brand) : Promise.resolve(null),
    ])

    // Parse and score tags
    const rawTags = neurotagData.tagLeaderboard ?? []
    const parsed = parseTagRows(rawTags)
    const scoredTags = scoreTags(parsed)
    const misleadingHooks = scoredTags.filter((t) => t.classification === "misleading_hook")
    const strongWinners = scoredTags.filter((t) => t.classification === "strong_winner")
    const converters = scoredTags.filter((t) => t.classification === "conversion_winner")

    // Filter by tag code if specified
    let filteredTags = scoredTags
    if (tagCode) {
      filteredTags = scoredTags.filter((t) => t.tag_code?.toLowerCase() === tagCode.toLowerCase())
    }

    // Filter by ad if specified
    let filteredAds = neurotagData.adLeaderboard ?? []
    if (adId) {
      filteredAds = filteredAds.filter(
        (ad: Record<string, unknown>) =>
          String(ad["meta_ad_performance.ad_id"] || ad["ad_id"] || "").includes(adId)
      )
    }

    // Calculate metadata
    const totalSpend = scoredTags.reduce((sum, t) => sum + (t.spend_fc || 0), 0)
    const topTag = scoredTags[0]?.tag_code || scoredTags[0]?.hack_name

    const metadata: CreativeIQMetadata = {
      tagsScored: scoredTags.filter((t) => t.classification !== "needs_more_data").length,
      strongWinners: strongWinners.length,
      misleadingHooks: misleadingHooks.length,
      converters: converters.length,
      totalSpend,
      topTag,
    }

    // Build response rows based on what's requested
    const rows: Record<string, unknown>[] = []

    // Add scored tags (primary response)
    rows.push(
      ...filteredTags.map((tag) => ({
        _type: "tag",
        ...tag,
      }))
    )

    // Add funnel data if requested
    if (includeFunnel && adFunnelData) {
      rows.push({
        _type: "funnel_totals",
        ...adFunnelData.funnelTotals?.[0],
      })
    }

    // Add ad data if filtered or if comprehensive view
    if (adId || filteredTags.length === 0) {
      rows.push(
        ...filteredAds.map((ad: Record<string, unknown>) => ({
          _type: "ad",
          ...ad,
        }))
      )
    }

    // Add misleading hooks if any
    if (misleadingHooks.length > 0) {
      rows.push(
        ...misleadingHooks.map((tag) => ({
          _type: "misleading_hook",
          ...tag,
        }))
      )
    }

    serverLog("info", "creative-iq-analysis", {
      startDate,
      endDate,
      tagsReturned: filteredTags.length,
      adsFetched: filteredAds.length,
      metadata,
    })

    return Response.json(
      {
        rows,
        metadata,
        type: "creative_iq",
      },
      { status: 200 }
    )
  } catch (error) {
    serverLog("error", "creative-iq-analysis-error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return Response.json(
      {
        error: String(error),
        message: "Failed to fetch Creative IQ analysis",
      },
      { status: 500 }
    )
  }
}
