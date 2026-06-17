import "server-only"

import { type DashboardBrandFilter, withBrandFilter } from "./brand-filter"
import { toCubeDateRange, type DashboardDateRange } from "./date-ranges"

export function td(dim: string, range: DashboardDateRange, granularity?: "day") {
  return {
    dimension: dim,
    ...(granularity ? { granularity } : {}),
    dateRange: toCubeDateRange(range),
  }
}

export function q(
  cube: string,
  brand: DashboardBrandFilter,
  query: Record<string, unknown>
): Record<string, unknown> {
  return withBrandFilter(cube, brand, query)
}
