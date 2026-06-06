import "server-only"

import { DEFAULT_BRAND_ID } from "./brand-filter-constants"
import { type DashboardSearchParams } from "./date-ranges"

export { DEFAULT_BRAND_ID } from "./brand-filter-constants"

export interface DashboardBrandFilter {
  id: number
  isDefault: boolean
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseDashboardBrandFilter(searchParams?: DashboardSearchParams): DashboardBrandFilter {
  const raw = firstParam(searchParams?.brand)
  if (!raw) return { id: DEFAULT_BRAND_ID, isDefault: true }

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    return { id: DEFAULT_BRAND_ID, isDefault: true }
  }

  return { id: parsed, isDefault: parsed === DEFAULT_BRAND_ID }
}

export function brandLabel(brand: DashboardBrandFilter): string {
  return `Brand ${brand.id}`
}

export type CubeFilter = {
  member: string
  operator: "equals"
  values: string[]
}

export function brandCubeFilter(cube: string, brand: DashboardBrandFilter): CubeFilter {
  return {
    member: `${cube}.brand_id`,
    operator: "equals",
    values: [String(brand.id)],
  }
}

export function withBrandFilter(
  cube: string,
  brand: DashboardBrandFilter,
  query: Record<string, unknown>
): Record<string, unknown> {
  const existing = Array.isArray(query.filters) ? query.filters : []
  return {
    ...query,
    filters: [...existing, brandCubeFilter(cube, brand)],
  }
}
