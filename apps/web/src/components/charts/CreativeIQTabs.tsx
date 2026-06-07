"use client"

import { useState } from "react"
import { ChartCard } from "@/components/charts/ChartCard"
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart"
import { NeuroTagLeaderboard } from "@/components/charts/NeuroTagLeaderboard"
import { AdPerformanceTable, parseAdLeaderboard } from "@/components/charts/AdPerformanceTable"
import { AdsFunnelView } from "@/components/charts/AdsFunnelView"
import { TagStageHeatmap } from "@/components/charts/TagStageHeatmap"
import { VideoFunnelPanel } from "@/components/charts/VideoFunnelPanel"
import { TrendChart } from "@/components/chat/TrendChart"
import type { ScoredTag } from "@/lib/dashboard/neurotag-scorer"

type Tab = "funnel" | "tags" | "ads" | "tagfunnel"

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: "funnel",    label: "Funnel",     desc: "Per-stage winners & tags" },
  { key: "tags",      label: "Tag View",   desc: "Score every neuro-tag" },
  { key: "ads",       label: "Ad View",    desc: "Per-ad with tag chips" },
  { key: "tagfunnel", label: "Tag Funnel", desc: "One tag's video retention" },
]

interface Props {
  scoredTags: ScoredTag[]
  misleadingHooks: ScoredTag[]
  categoryBreakdown: Record<string, unknown>[]
  spendTrend: Record<string, unknown>[]
  adLeaderboard: Record<string, unknown>[]
  adTagMap: Record<string, unknown>[]
  funnelAdRows: Record<string, unknown>[]
  funnelTotals: Record<string, unknown>[]
  funnelTagMap: Record<string, unknown>[]
  funnelCategoryStage: Record<string, unknown>[]
  funnelAdAttribution: Record<string, unknown>[]
  start: string
  end: string
  brand: number
}

export function CreativeIQTabs({
  scoredTags,
  misleadingHooks,
  categoryBreakdown,
  spendTrend,
  adLeaderboard,
  adTagMap,
  funnelAdRows,
  funnelTotals,
  funnelTagMap,
  funnelCategoryStage,
  funnelAdAttribution,
  start,
  end,
  brand,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("funnel")

  const adRows = parseAdLeaderboard(adLeaderboard, adTagMap)

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-stone-200 dark:border-night-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-stone-900 dark:text-night-50 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-indigo-500"
                : "text-stone-500 dark:text-night-500 hover:text-stone-700 dark:hover:text-night-300"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[10px] ${activeTab === tab.key ? "text-stone-400 dark:text-night-600" : "text-stone-400 dark:text-night-700"}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Funnel tab — stage-centric ads funnel (default) */}
      {activeTab === "funnel" && (
        <ChartCard
          title="Ads Funnel — Reach → Impressions → video depth → Order"
          subtitle="Click a stage to see the ads that won or lost it, and the neuro tags driving each step"
          cube="meta_ad_performance"
          className="xl:col-span-2"
        >
          <AdsFunnelView
            adRows={funnelAdRows}
            funnelTotals={funnelTotals}
            adTagMap={funnelTagMap}
            adAttribution={funnelAdAttribution}
          />
        </ChartCard>
      )}

      {/* Neuro-tag × stage heatmap (under the funnel) */}
      {activeTab === "funnel" && (
        <ChartCard
          title="Neuro category × funnel stage — lift heatmap"
          subtitle="Which psychological frames over- or under-index at each stage (spend-weighted vs average)"
          cube="meta_neurotag_analysis"
          className="xl:col-span-2"
        >
          <TagStageHeatmap categoryStage={funnelCategoryStage} />
        </ChartCard>
      )}

      {/* Tags tab */}
      {activeTab === "tags" && (
        <>
          <ChartCard
            title="Tag Signal Leaderboard"
            subtitle="All tags ranked by score · Hook % = 3s scroll-stop rate · toggle split/full credit"
            cube="meta_neurotag_analysis"
          >
            <NeuroTagLeaderboard tags={scoredTags} start={start} end={end} brand={brand} />
          </ChartCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChartCard
              title="Spend by category (split-credit)"
              subtitle="Which creative categories consume budget"
              cube="meta_neurotag_analysis"
            >
              <HorizontalBarChart
                rows={categoryBreakdown}
                labelKey="meta_neurotag_analysis.category_name"
                measureKeys={[
                  "meta_neurotag_analysis.spend_sc",
                  "meta_neurotag_analysis.net_revenue_sc",
                ]}
                height={300}
              />
            </ChartCard>

            <ChartCard
              title="Daily spend trend"
              subtitle="Split-credit vs full-credit spend over time"
              cube="meta_neurotag_analysis"
            >
              <TrendChart rows={spendTrend} />
            </ChartCard>
          </div>

          {misleadingHooks.length > 0 && (
            <ChartCard
              title={`Misleading hooks — ${misleadingHooks.length} tag${misleadingHooks.length !== 1 ? "s" : ""}`}
              subtitle="High CTR (≥ 2.5%) but ROAS ≤ 1.5× — creative drives clicks, not revenue"
              cube="meta_neurotag_analysis"
            >
              <NeuroTagLeaderboard
                tags={misleadingHooks}
                title="Misleading hooks"
                start={start}
                end={end}
                brand={brand}
              />
            </ChartCard>
          )}
        </>
      )}

      {/* Ads tab */}
      {activeTab === "ads" && (
        <ChartCard
          title="Ad Performance with Tag Mapping"
          subtitle="Every active ad · expand a row for full tag list and video metrics · click header to sort"
          cube="meta_neurotag_analysis"
          className="xl:col-span-2"
        >
          <AdPerformanceTable rows={adRows} />
        </ChartCard>
      )}

      {/* Tag Funnel tab — single-tag video retention */}
      {activeTab === "tagfunnel" && (
        <ChartCard
          title="Video Funnel by Tag"
          subtitle="Scroll-stop → 15s hold → 50% view → completion → link click → order · red bar = biggest funnel gap"
          cube="meta_neurotag_analysis"
          className="xl:col-span-2"
        >
          <VideoFunnelPanel tags={scoredTags} />
        </ChartCard>
      )}
    </div>
  )
}
