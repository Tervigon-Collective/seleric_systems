"use client"

import type { ScoredTag } from "@/lib/dashboard/neurotag-scorer"
import { useState } from "react"

const BADGE_CLS: Record<string, string> = {
  strong_winner:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  conversion_winner:    "bg-teal-500/15 text-teal-400 border border-teal-500/30",
  creative_hook_winner: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  misleading_hook:      "bg-red-500/15 text-red-400 border border-red-500/30",
  weak_attention:       "bg-stone-500/15 text-stone-400 border border-stone-500/30",
  needs_more_data:      "bg-slate-700/30 text-slate-500 border border-slate-600/20",
}
const BADGE_LABEL: Record<string, string> = {
  strong_winner: "Strong", conversion_winner: "Converter",
  creative_hook_winner: "Hook", misleading_hook: "Mislead",
  weak_attention: "Weak", needs_more_data: "Data?",
}

function pct(v: number) { return `${v.toFixed(1)}%` }
function fmtCur(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v)
}

interface FunnelStep {
  label: string
  value: number
  pctOfPrev: number
  pctOfTop: number
  isGap: boolean
}

function buildFunnel(tag: ScoredTag): FunnelStep[] {
  const imp = tag.impressions
  if (imp === 0) return []

  // Derive absolute counts from ratios
  const stop3s    = (tag.hook_rate / 100) * imp
  const watch15   = (tag.hold_rate_15s / 100) * stop3s
  const watch50   = (tag.hold_rate_p50 / 100) * imp  // hold_rate is of impressions
  const watch100  = (tag.hold_rate_p100 / 100) * imp
  const thruplay  = tag.thruplay
  const linkClk   = tag.link_clicks
  const orders    = tag.attributed_orders

  const steps: { label: string; value: number }[] = [
    { label: "Impressions",   value: imp },
    { label: "3s Stop",       value: stop3s },
    { label: "15s Hold",      value: watch15 },
    { label: "50% View",      value: watch50 },
    { label: "Thruplay",      value: thruplay },
    { label: "Link Click",    value: linkClk },
    { label: "Order",         value: orders },
  ].filter((s) => s.value > 0)

  const result: FunnelStep[] = []
  for (let i = 0; i < steps.length; i++) {
    const curr = steps[i].value
    const prev = steps[i - 1]?.value ?? curr
    const pctOfPrev = prev > 0 ? (curr / prev) * 100 : 100
    result.push({
      label: steps[i].label,
      value: curr,
      pctOfPrev,
      pctOfTop: (curr / imp) * 100,
      isGap: false,
    })
  }

  // Mark biggest drop as the funnel gap (exclude impressions row)
  let worstIdx = 1
  let worstDrop = 100
  for (let i = 1; i < result.length; i++) {
    if (result[i].pctOfPrev < worstDrop) { worstDrop = result[i].pctOfPrev; worstIdx = i }
  }
  if (result[worstIdx]) result[worstIdx].isGap = true

  return result
}

interface Props { tags: ScoredTag[] }

export function VideoFunnelPanel({ tags }: Props) {
  const scored = tags.filter((t) => t.classification !== "needs_more_data")
  const [selected, setSelected] = useState<string>(scored[0]?.tag_code ?? "")

  const tag = tags.find((t) => t.tag_code === selected)
  const funnel = tag ? buildFunnel(tag) : []

  return (
    <div className="flex gap-4 min-h-[420px]">
      {/* Tag selector sidebar */}
      <div className="w-64 shrink-0 overflow-y-auto rounded-lg border border-stone-200 dark:border-night-800">
        <div className="px-3 py-2 border-b border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900">
          <p className="text-xs font-medium text-stone-500 dark:text-night-500">Select tag to inspect</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-night-850">
          {scored.map((t) => {
            const badgeCls = BADGE_CLS[t.classification]
            const isActive = t.tag_code === selected
            return (
              <button
                key={t.tag_code}
                onClick={() => setSelected(t.tag_code)}
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-stone-100 dark:bg-night-850"
                    : "hover:bg-stone-50 dark:hover:bg-night-875"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-medium ${badgeCls}`}>
                    {BADGE_LABEL[t.classification]}
                  </span>
                  <span className="font-mono text-[9px] text-stone-400 dark:text-night-500">{t.tag_code}</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-night-200 truncate">{t.hack_name}</p>
                <p className="text-[10px] text-stone-400 dark:text-night-600">
                  Hook {t.hook_rate.toFixed(1)}% · ROAS {t.roas.toFixed(2)}×
                </p>
              </button>
            )
          })}
          {scored.length === 0 && (
            <p className="px-3 py-4 text-xs text-stone-400 dark:text-night-600">No scored tags.</p>
          )}
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="flex-1 min-w-0">
        {!tag ? (
          <div className="flex items-center justify-center h-full text-sm text-stone-400 dark:text-night-600">
            Select a tag to view its funnel
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tag header */}
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${BADGE_CLS[tag.classification]}`}>
                    {BADGE_LABEL[tag.classification]}
                  </span>
                  <span className="font-mono text-xs text-stone-400 dark:text-night-500">{tag.tag_code}</span>
                </div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-night-50">{tag.hack_name}</h3>
                <p className="text-xs text-stone-500 dark:text-night-500">{tag.category_name}</p>
              </div>
              <div className="ml-auto flex gap-4">
                {[
                  { label: "Spend", value: fmtCur(tag.spend) },
                  { label: "ROAS",  value: `${tag.roas.toFixed(2)}×` },
                  { label: "Hook",  value: pct(tag.hook_rate) },
                  { label: "Done",  value: pct(tag.hold_rate_p100) },
                ].map((k) => (
                  <div key={k.label} className="text-right">
                    <p className="text-[10px] text-stone-400 dark:text-night-600">{k.label}</p>
                    <p className="text-sm font-semibold text-stone-800 dark:text-night-100">{k.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel bars */}
            {funnel.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-night-600">No video data available for this tag.</p>
            ) : (
              <div className="space-y-1.5">
                {funnel.map((step, i) => (
                  <div key={step.label}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-medium w-20 shrink-0 ${
                        step.isGap ? "text-red-400" : "text-stone-500 dark:text-night-500"
                      }`}>
                        {step.label}
                      </span>
                      <div className="flex-1 h-5 rounded bg-stone-100 dark:bg-night-850 relative overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${
                            step.isGap
                              ? "bg-red-500/40"
                              : i === 0
                              ? "bg-stone-400/40 dark:bg-night-600/60"
                              : "bg-indigo-500/40"
                          }`}
                          style={{ width: `${Math.max(2, step.pctOfTop)}%` }}
                        />
                        <span className="absolute right-2 top-0 h-full flex items-center text-[10px] font-medium text-stone-700 dark:text-night-300">
                          {step.value >= 1000
                            ? `${(step.value / 1000).toFixed(1)}k`
                            : step.value.toFixed(0)}
                        </span>
                      </div>
                      <span className={`text-[10px] w-12 text-right shrink-0 tabular-nums ${
                        step.isGap ? "text-red-400 font-semibold" : "text-stone-400 dark:text-night-600"
                      }`}>
                        {i === 0 ? "100%" : pct(step.pctOfPrev)}
                      </span>
                    </div>
                    {step.isGap && (
                      <div className="ml-20 mt-0.5 mb-1">
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                          ⚠ Biggest funnel gap — {pct(100 - step.pctOfPrev)} drop-off
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary callout */}
            {funnel.length > 0 && (
              <div className="rounded-lg border border-stone-200 dark:border-night-800 bg-stone-50 dark:bg-night-900 p-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-stone-400 dark:text-night-600">Scroll-stop rate</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-night-100">{pct(tag.hook_rate)}</p>
                  <p className="text-[10px] text-stone-500 dark:text-night-500">of impressions → 3s</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 dark:text-night-600">Full completion</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-night-100">{pct(tag.hold_rate_p100)}</p>
                  <p className="text-[10px] text-stone-500 dark:text-night-500">of impressions → 100%</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 dark:text-night-600">Cost / thruplay</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-night-100">
                    {tag.cost_per_thruplay > 0 ? fmtCur(tag.cost_per_thruplay) : "—"}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-night-500">to reach 15s</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
