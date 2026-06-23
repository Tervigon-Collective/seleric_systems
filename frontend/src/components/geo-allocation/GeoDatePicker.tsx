"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface Props {
  currentDate: string
}

export function GeoDatePicker({ currentDate }: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const sp         = useSearchParams()

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(sp.toString())
      params.set("date", e.target.value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, sp],
  )

  return (
    <input
      type="date"
      value={currentDate}
      onChange={onChange}
      className="rounded-lg border border-stone-200 dark:border-night-700 bg-stone-50 dark:bg-night-850 px-3 py-1.5 text-xs text-stone-800 dark:text-night-100 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-night-600"
    />
  )
}
