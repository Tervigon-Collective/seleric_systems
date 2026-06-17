"use client"

import { useSearchParams } from "next/navigation"

import { BrandFilterControls } from "@/components/dashboard/BrandFilterControls"
import { DEFAULT_BRAND_ID } from "@/lib/dashboard/brand-filter-constants"

function searchParamsFromUrl(params: URLSearchParams): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = {}
  params.forEach((value, key) => {
    const existing = result[key]
    if (existing === undefined) {
      result[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      result[key] = [existing, value]
    }
  })
  return result
}

function brandIdFromSearchParams(searchParams: Record<string, string | string[] | undefined>): number {
  const raw = searchParams.brand
  const brandStr = Array.isArray(raw) ? raw[0] : raw
  if (!brandStr) return DEFAULT_BRAND_ID

  const parsed = Number(brandStr)
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) return DEFAULT_BRAND_ID
  return parsed
}

export function SidebarBrandFilter() {
  const urlParams = useSearchParams()
  const searchParams = searchParamsFromUrl(urlParams)
  const brandId = brandIdFromSearchParams(searchParams)

  return <BrandFilterControls brandId={brandId} searchParams={searchParams} variant="sidebar" />
}
