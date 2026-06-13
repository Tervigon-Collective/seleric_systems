"use client"

import { useMemo } from "react"
import { fmtCurrency } from "./format"

const AP = "meta_ad_performance"

function n(v: unknown) { const x = Number(v ?? 0); return isFinite(x) ? x : 0 }

interface AdSignal {
  ad_id: string
  ad_name: string
  campaign_name: string
  spend: number
  roas: number
  frequency: number
  hook_rate: number
  roas_delta: number | null
}

interface Bucket {
  key: "kill" | "scale" | "fatiguing" | "needs_budget"
  label: string
  desc: string
  action: string
  headerCls: string
  ads: AdSignal[]
  metricLabel: (ad: AdSignal) => string
}

interface Props {
  adLeaderboard: Record<string, unknown>[]
  priorAdLeaderboard: Record<string, unknown>[]
}

export function ActionCenter({ adLeaderboard, priorAdLeaderboard }: Props) {
  const buckets = useMemo<Bucket[]>(() => {
    const priorRoasMap = new Map<string, number>()
    for (const r of priorAdLeaderboard) {
      const id = String(r[`${AP}.ad_id`] ?? "")
      if (id) priorRoasMap.set(id, n(r[`${AP}.roas`]))
    }

    const kill: AdSignal[] = []
    const scale: AdSignal[] = []
    const fatiguing: AdSignal[] = []
    const needsBudget: AdSignal[] = []

    for (const r of adLeaderboard) {
      const ad_id       = String(r[`${AP}.ad_id`] ?? "")
      if (!ad_id) continue
      const spend       = n(r[`${AP}.spend`])
      const roas        = n(r[`${AP}.roas`])
      const frequency   = n(r[`${AP}.frequency`])
      const hook_rate   = n(r[`${AP}.hook_rate`])
      const ad_name     = String(r[`${AP}.ad_name`] ?? "—")
      const campaign_name = String(r[`${AP}.campaign_name`] ?? "—")
      const priorRoas   = priorRoasMap.get(ad_id) ?? null
      const roas_delta  = priorRoas !== null ? roas - priorRoas : null

      const sig: AdSignal = { ad_id, ad_name, campaign_name, spend, roas, frequency, hook_rate, roas_delta }

      // Mutually exclusive with priority: kill > fatiguing > needs_budget > scale
      if (spend > 1000 && roas < 1.5 && frequency > 3) {
        kill.push(sig)
      } else if (
        roas_delta !== null &&
        priorRoas !== null && priorRoas > 0 &&
        roas_delta / priorRoas < -0.30 &&
        frequency > 2.5
      ) {
        fatiguing.push(sig)
      } else if (hook_rate > 20 && spend < 500) {
        needsBudget.push(sig)
      } else if (roas > 2.5 && frequency < 2.5 && spend < 5000) {
        scale.push(sig)
      }
    }

    return [
      {
        key: "kill",
        label: "Pause",
        desc: "High spend · low ROAS · high freq",
        action: "Pause these ads",
        headerCls: "text-red-400 border-red-500/25 bg-red-500/[0.05]",
        ads: kill.sort((a, b) => b.spend - a.spend).slice(0, 5),
        metricLabel: (ad) => `${fmtCurrency(ad.spend)} · ${ad.roas.toFixed(1)}× · ${ad.frequency.toFixed(1)}f`,
      },
      {
        key: "fatiguing",
        label: "Refresh",
        desc: "ROAS declining · frequency rising",
        action: "Refresh creative or cut budget",
        headerCls: "text-amber-400 border-amber-500/25 bg-amber-500/[0.05]",
        ads: fatiguing.sort((a, b) => b.spend - a.spend).slice(0, 5),
        metricLabel: (ad) => ad.roas_delta !== null
          ? `${ad.roas.toFixed(1)}× ROAS · ${ad.roas_delta > 0 ? "+" : ""}${ad.roas_delta.toFixed(1)}× Δ`
          : `${ad.roas.toFixed(1)}× ROAS`,
      },
      {
        key: "needs_budget",
        label: "Fund",
        desc: "Strong hook · underfunded",
        action: "Allocate more budget",
        headerCls: "text-sky-400 border-sky-500/25 bg-sky-500/[0.05]",
        ads: needsBudget.sort((a, b) => b.hook_rate - a.hook_rate).slice(0, 5),
        metricLabel: (ad) => `${ad.hook_rate.toFixed(1)}% hook · ${fmtCurrency(ad.spend)} spend`,
      },
      {
        key: "scale",
        label: "Scale",
        desc: "High ROAS · low frequency · room to grow",
        action: "Increase budget",
        headerCls: "text-emerald-400 border-emerald-500/25 bg-emerald-500/[0.05]",
        ads: scale.sort((a, b) => b.roas - a.roas).slice(0, 5),
        metricLabel: (ad) => `${ad.roas.toFixed(1)}× ROAS · ${fmtCurrency(ad.spend)} spend`,
      },
    ]
  }, [adLeaderboard, priorAdLeaderboard])

  const hasAnySignal = buckets.some((b) => b.ads.length > 0)
  if (!hasAnySignal) return null

  return (
    <div className="rounded-xl border border-stone-200 dark:border-night-800 bg-white dark:bg-night-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-night-800">
        <p className="text-sm font-semibold text-stone-900 dark:text-night-50">Action Center</p>
        <p className="text-xs text-stone-400 dark:text-night-500 mt-0.5">What to do right now, based on your active ads</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-stone-100 dark:divide-night-800">
        {buckets.map((bucket) => (
          <div key={bucket.key} className="p-3 space-y-2 min-w-0">
            <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${bucket.headerCls}`}>
              {bucket.label}
              {bucket.ads.length > 0 && (
                <span className="opacity-70">· {bucket.ads.length}</span>
              )}
            </div>
            <p className="text-[10px] text-stone-400 dark:text-night-600">{bucket.desc}</p>
            {bucket.ads.length === 0 ? (
              <p className="text-[10px] text-stone-300 dark:text-night-700 italic">None right now</p>
            ) : (
              <ul className="space-y-1.5">
                {bucket.ads.map((ad) => (
                  <li key={ad.ad_id} className="min-w-0">
                    <p className="text-[11px] font-medium text-stone-700 dark:text-night-200 truncate" title={ad.ad_name}>
                      {ad.ad_name}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-night-600 tabular-nums">
                      {bucket.metricLabel(ad)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
