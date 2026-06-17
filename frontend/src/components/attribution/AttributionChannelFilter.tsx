"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

const CHANNELS = [
  { id: "all", label: "All Channels" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "organic", label: "Organic" },
] as const

interface Props {
  activeChannel: string
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

export function AttributionChannelFilter({ activeChannel, searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleChange(channel: string) {
    const params = buildParams(searchParams)
    if (channel === "all") params.delete("channel")
    else params.set("channel", channel)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 dark:text-night-500">Channel</span>
      <select
        value={activeChannel}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900 focus:border-stone-500 focus:outline-none dark:border-night-700 dark:bg-night-875 dark:text-night-50 disabled:opacity-50"
      >
        {CHANNELS.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.label}
          </option>
        ))}
      </select>
    </div>
  )
}
