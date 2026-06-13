"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

const TABS = [
  { id: "channel", label: "Channel" },
  { id: "campaign", label: "Campaign" },
  { id: "ad", label: "Ad" },
  { id: "sku", label: "SKU" },
  { id: "orders", label: "Orders" },
] as const

type TabId = (typeof TABS)[number]["id"]

interface Props {
  activeView: string
  searchParams?: Record<string, string | string[] | undefined>
}

function buildParams(searchParams: Props["searchParams"]): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
    else if (value !== undefined) params.set(key, value)
  }
  return params
}

export function AttributionViewTabs({ activeView, searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleClick(tab: TabId) {
    const params = buildParams(searchParams)
    params.set("view", tab)
    params.delete("channel")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {TABS.map((tab) => {
        const active = activeView === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleClick(tab.id)}
            disabled={isPending}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              active
                ? "bg-stone-900 text-white dark:bg-night-100 dark:text-night-950"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-night-850 dark:text-night-300 dark:hover:bg-night-800"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
