"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DEFAULT_BRAND_ID } from "@/lib/dashboard/brand-filter-constants"

interface Props {
  brandId: number
  searchParams?: Record<string, string | string[] | undefined>
  variant?: "header" | "sidebar"
}

function buildSearchParams(searchParams: Props["searchParams"]): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    } else if (value !== undefined) {
      params.set(key, value)
    }
  }
  return params
}

export function BrandFilterControls({ brandId, searchParams, variant = "header" }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [draftBrand, setDraftBrand] = useState(String(brandId))

  useEffect(() => {
    setDraftBrand(String(brandId))
  }, [brandId])

  function pushBrand(nextBrand: number) {
    const params = buildSearchParams(searchParams)
    if (nextBrand === DEFAULT_BRAND_ID) {
      params.delete("brand")
    } else {
      params.set("brand", String(nextBrand))
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function applyDraft() {
    const parsed = Number(draftBrand)
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) return
    pushBrand(parsed)
  }

  const parsedDraft = Number(draftBrand)
  const canApply =
    Number.isFinite(parsedDraft) &&
    parsedDraft > 0 &&
    Number.isInteger(parsedDraft) &&
    parsedDraft !== brandId

  const isSidebar = variant === "sidebar"

  return (
    <div
      className={
        isSidebar
          ? "flex w-full flex-col gap-2"
          : "flex flex-wrap items-end gap-2 rounded-xl border border-insight-border bg-white p-3 shadow-sm dark:border-night-800 dark:bg-night-900 dark:shadow-none"
      }
    >
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-night-500">Brand</span>
        <input
          type="number"
          min={1}
          step={1}
          value={draftBrand}
          onChange={(event) => setDraftBrand(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyDraft()
          }}
          className={`rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900 focus:border-insight-positive focus:outline-none dark:border-night-700 dark:bg-night-875 dark:text-night-50 [color-scheme:light] dark:[color-scheme:dark] ${
            isSidebar ? "w-full" : "w-20"
          }`}
        />
      </label>

      <div className={`flex flex-wrap gap-1.5 ${isSidebar ? "" : "items-end"}`}>
        <button
          type="button"
          onClick={() => pushBrand(DEFAULT_BRAND_ID)}
          disabled={isPending || brandId === DEFAULT_BRAND_ID}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            brandId === DEFAULT_BRAND_ID
              ? "bg-insight-positive text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-night-850 dark:text-night-300 dark:hover:bg-night-800"
          }`}
        >
          Default ({DEFAULT_BRAND_ID})
        </button>

        <button
          type="button"
          onClick={applyDraft}
          disabled={!canApply || isPending}
          className="rounded bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-night-100 dark:text-night-950 dark:hover:bg-white"
        >
          {isPending ? "Applying..." : "Apply"}
        </button>
      </div>

      <span className="text-xs text-stone-500 dark:text-night-500">brand_id · {brandId}</span>
    </div>
  )
}
