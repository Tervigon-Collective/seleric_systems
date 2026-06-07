"use client"

import { useMemo, useState } from "react"
import { fmtCurrency, fmtCount, fmtPct } from "./format"
import {
  analyzeStage,
  buildFunnelTotals,
  parseAdFunnelRows,
  type FunnelStage,
  type ScoredAd,
  type ScoredStageTag,
} from "@/lib/dashboard/ad-funnel"

// Category colour map (mirrors AdPerformanceTable) — falls back to stone.
const CAT_COLORS: Record<string, string> = {
  "Emotional Triggers":             "bg-rose-500/15 text-rose-400 border-rose-500/20",
  "Cognitive Fluency":              "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "Behavioral Economics & Nudging": "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Social Proof & Validation":      "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Sensory Integration":            "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Memory & Recall":                "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Temporal Manipulation":          "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Identity Manipulation":          "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Visual Perception":              "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
}
function tagChipCls(cat: string) {
  return CAT_COLORS[cat] ?? "bg-stone-500/15 text-stone-400 border-stone-500/20"
}

const KIND_BAR: Record<string, string> = {
  audience: "bg-stone-400/40 dark:bg-night-600/60",
  video: "bg-indigo-500/45",
  convert: "bg-emerald-500/45",
}

function roasCls(roas: number) {
  return roas >= 2.5
    ? "text-emerald-500"
    : roas >= 1.5
    ? "text-stone-600 dark:text-night-300"
    : "text-red-400"
}

interface Props {
  adRows: Record<string, unknown>[]
  funnelTotals: Record<string, unknown>[]
  adTagMap: Record<string, unknown>[]
}

export function AdsFunnelView({ adRows, funnelTotals, adTagMap }: Props) {
  const ads = useMemo(() => parseAdFunnelRows(adRows, adTagMap), [adRows, adTagMap])
  const totals = useMemo(() => buildFunnelTotals(funnelTotals[0], ads), [funnelTotals, ads])

  const gapKey = totals.stages.find((s) => s.isGap)?.key ?? "v3s"
  const [selected, setSelected] = useState<string>(gapKey)

  const analysis = useMemo(() => analyzeStage(ads, selected), [ads, selected])
  // Use the exact (no-dimension) totals for the header so it matches the funnel bar.
  const selectedStage = totals.stages.find((s) => s.key === selected) ?? analysis?.stage

  if (ads.length === 0) {
    return (
      <p className="text-sm text-stone-400 dark:text-night-600">
        No ad delivery data for this period.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Audience summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Reach", value: fmtCount(totals.reach), sub: "unique accounts" },
          { label: "Impressions", value: fmtCount(totals.impressions), sub: "total shown" },
          { label: "Frequency", value: `${totals.frequency.toFixed(2)}×`, sub: "impr / reach" },
          { label: "CPM", value: fmtCurrency(totals.cpm), sub: "per 1k impr" },
          { label: "Spend", value: fmtCurrency(totals.spend), sub: "period total" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900 px-3 py-2"
          >
            <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">{k.label}</p>
            <p className="text-sm font-semibold text-stone-800 dark:text-night-100 tabular-nums">{k.value}</p>
            <p className="text-[10px] text-stone-400 dark:text-night-600">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-4">
        {/* Funnel bars */}
        <div className="rounded-lg border border-stone-200 dark:border-night-800 p-3 space-y-1.5">
          <p className="text-xs font-medium text-stone-500 dark:text-night-500 mb-1">
            Click a stage to see which ads &amp; neuro tags won or lost it
          </p>
          {totals.stages.map((s) => (
            <FunnelBar
              key={s.key}
              stage={s}
              active={s.key === selected}
              onClick={() => setSelected(s.key)}
            />
          ))}
          <p className="text-[10px] text-stone-400 dark:text-night-600 pt-1">
            Bar width = % of impressions · right value = step pass-rate vs previous stage ·
            <span className="text-red-400"> red</span> = biggest video drop-off
          </p>
        </div>

        {/* Stage detail */}
        <div className="min-w-0">
          {analysis && selectedStage ? (
            <StageDetail
              stage={selectedStage}
              isRateStage={analysis.isRateStage}
              strong={analysis.strong}
              weak={analysis.weak}
              tags={analysis.tags}
              weakTags={analysis.weakTags}
            />
          ) : (
            <p className="text-sm text-stone-400 dark:text-night-600">Select a stage.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function FunnelBar({
  stage,
  active,
  onClick,
}: {
  stage: FunnelStage
  active: boolean
  onClick: () => void
}) {
  const barCls = stage.isGap ? "bg-red-500/50" : KIND_BAR[stage.kind]
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-md px-2 py-1.5 transition-colors ${
        active ? "bg-stone-100 dark:bg-night-850 ring-1 ring-indigo-500/50" : "hover:bg-stone-50 dark:hover:bg-night-875"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-medium w-24 shrink-0 ${
            stage.isGap ? "text-red-400" : "text-stone-600 dark:text-night-300"
          }`}
          title={stage.hint}
        >
          {stage.label}
        </span>
        <div className="flex-1 h-5 rounded bg-stone-100 dark:bg-night-850 relative overflow-hidden">
          <div
            className={`h-full rounded ${barCls}`}
            style={{ width: `${Math.max(2, Math.min(100, stage.pctOfImpr))}%` }}
          />
          <span className="absolute right-2 top-0 h-full flex items-center text-[10px] font-medium tabular-nums text-stone-700 dark:text-night-200">
            {fmtCount(stage.count)}
          </span>
        </div>
        <span
          className={`text-[10px] w-12 text-right shrink-0 tabular-nums ${
            stage.isGap ? "text-red-400 font-semibold" : "text-stone-400 dark:text-night-600"
          }`}
        >
          {stage.kind === "audience" && stage.key === "reach" ? "—" : `${stage.pctOfPrev.toFixed(0)}%`}
        </span>
      </div>
    </button>
  )
}

function StageDetail({
  stage,
  isRateStage,
  strong,
  weak,
  tags,
  weakTags,
}: {
  stage: FunnelStage
  isRateStage: boolean
  strong: ScoredAd[]
  weak: ScoredAd[]
  tags: ScoredStageTag[]
  weakTags: ScoredStageTag[]
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold text-stone-900 dark:text-night-50">{stage.label}</h3>
        <span className="text-xs text-stone-500 dark:text-night-500">{stage.hint}</span>
        <div className="ml-auto flex gap-4 text-right">
          <div>
            <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">Volume</p>
            <p className="text-sm font-semibold tabular-nums text-stone-800 dark:text-night-100">{fmtCount(stage.count)}</p>
          </div>
          {isRateStage && (
            <div>
              <p className="text-[10px] text-stone-400 dark:text-night-600 uppercase tracking-wide">
                Pass-rate vs {stage.prevLabel}
              </p>
              <p className={`text-sm font-semibold tabular-nums ${stage.isGap ? "text-red-400" : "text-stone-800 dark:text-night-100"}`}>
                {fmtPct(stage.pctOfPrev)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Worked / Didn't work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AdColumn
          title={isRateStage ? "Worked — strongest at this stage" : "Top contributors"}
          accent="emerald"
          ads={strong}
          isRateStage={isRateStage}
        />
        <AdColumn
          title={isRateStage ? "Didn't work — spend, weak pass-through" : "Lowest efficiency"}
          accent="red"
          ads={weak}
          isRateStage={isRateStage}
        />
      </div>

      {/* Tag rollup */}
      <div>
        <p className="text-xs font-medium text-stone-600 dark:text-night-300 mb-1.5">
          Neuro tags that drove this stage
          <span className="text-[10px] text-stone-400 dark:text-night-600 ml-1.5 font-normal">
            multi-tag ads counted under each tag
          </span>
        </p>
        {tags.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-night-600">No tagged ads cleared the spend threshold for this stage.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <TagPill key={t.tag_code} tag={t} isRateStage={isRateStage} tone="strong" />
            ))}
          </div>
        )}
        {isRateStage && weakTags.length > 0 && (
          <>
            <p className="text-[10px] text-stone-400 dark:text-night-600 mt-2 mb-1">Tags that dragged it down</p>
            <div className="flex flex-wrap gap-1.5">
              {weakTags.slice(0, 6).map((t) => (
                <TagPill key={t.tag_code} tag={t} isRateStage={isRateStage} tone="weak" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AdColumn({
  title,
  accent,
  ads,
  isRateStage,
}: {
  title: string
  accent: "emerald" | "red"
  ads: ScoredAd[]
  isRateStage: boolean
}) {
  const dot = accent === "emerald" ? "bg-emerald-500" : "bg-red-500"
  return (
    <div className="rounded-lg border border-stone-200 dark:border-night-800 p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 dark:text-night-400 mb-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        {title}
      </p>
      {ads.length === 0 ? (
        <p className="text-xs text-stone-400 dark:text-night-600">No qualifying ads.</p>
      ) : (
        <div className="space-y-1.5">
          {ads.map((s) => (
            <div
              key={s.ad.ad_id}
              className="rounded-md border border-stone-100 dark:border-night-850 bg-stone-50/60 dark:bg-night-900 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-stone-800 dark:text-night-100 truncate" title={s.ad.ad_name}>
                  {s.ad.ad_name}
                </p>
                <span className="text-[11px] font-semibold tabular-nums shrink-0 text-stone-700 dark:text-night-200">
                  {isRateStage ? fmtPct(s.passRate * 100) : fmtCount(s.count)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[10px] text-stone-400 dark:text-night-600 truncate" title={s.ad.campaign_name}>
                  {s.ad.campaign_name}
                </p>
                <span className="text-[10px] tabular-nums shrink-0 text-stone-400 dark:text-night-600">
                  {fmtCurrency(s.ad.spend)} · <span className={roasCls(s.ad.roas)}>{s.ad.roas.toFixed(2)}×</span>
                </span>
              </div>
              {s.ad.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.ad.tags.slice(0, 4).map((t) => (
                    <span
                      key={t.tag_code}
                      title={`${t.hack_name} · ${t.category_name}`}
                      className={`inline-block px-1 py-0.5 rounded border text-[9px] font-medium ${tagChipCls(t.category_name)}`}
                    >
                      {t.tag_code}
                    </span>
                  ))}
                  {s.ad.tags.length > 4 && (
                    <span className="text-[9px] text-stone-400 dark:text-night-600 self-center">+{s.ad.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TagPill({
  tag,
  isRateStage,
  tone,
}: {
  tag: ScoredStageTag
  isRateStage: boolean
  tone: "strong" | "weak"
}) {
  const metric = isRateStage ? fmtPct(tag.passRate * 100) : fmtCount(tag.count)
  return (
    <div
      title={`${tag.hack_name} · ${tag.category_name} · ${tag.adCount} ad${tag.adCount !== 1 ? "s" : ""} · ${fmtCurrency(tag.spend)}`}
      className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-lg border text-[10px] ${tagChipCls(tag.category_name)} ${
        tone === "weak" ? "opacity-70" : ""
      }`}
    >
      <span className="font-mono font-medium">{tag.tag_code}</span>
      <span className="opacity-75 max-w-[120px] truncate">{tag.hack_name}</span>
      <span className="font-semibold tabular-nums">{metric}</span>
    </div>
  )
}
