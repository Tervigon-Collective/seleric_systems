import "server-only"

import { clickHouseQuery } from "@/lib/clickhouse-client"

export type ActionType = "SCALE" | "LAUNCH" | "PAUSE" | "HOLD" | "SWITCH_PRODUCT"

export interface GeoAllocationRow {
  city: string
  state: string
  product_name: string
  campaign_name: string
  adset_name: string
  orders_7d: number
  attributed_revenue: number
  effective_city_spend: number
  roas: number
  opportunity_score: number
  recommended_action: ActionType
  budget_modifier: number
  reason: string
  weather_stage: string
  weather_score: number
  broad_discovery_flag: number
}

export interface GeoAllocationSummaryRow {
  recommended_action: ActionType
  n: number
  avg_roas: number
  cities: number
  products: number
}

export interface GeoWeatherRow {
  weather_stage: string
  n: number
}

export interface GeoAllocationData {
  rows: GeoAllocationRow[]
  summary: GeoAllocationSummaryRow[]
  weather: GeoWeatherRow[]
  reportDate: string
}

export async function fetchGeoAllocationData(
  reportDate: string,
  brandId = 20,
): Promise<GeoAllocationData> {
  const [rawRows, rawSummary, rawWeather] = await Promise.all([
    clickHouseQuery<Record<string, unknown>>(`
      SELECT
        city, state, product_name, campaign_name, adset_name,
        orders_7d, attributed_revenue, effective_city_spend,
        round(roas, 2)              AS roas,
        round(opportunity_score, 1) AS opportunity_score,
        recommended_action, budget_modifier, reason,
        weather_stage,
        round(weather_score, 1)     AS weather_score,
        broad_discovery_flag
      FROM gold.mart_geo_product_opportunity FINAL
      WHERE report_date = '${reportDate}'
        AND brand_id = ${brandId}
      ORDER BY opportunity_score DESC
      LIMIT 500
    `),

    clickHouseQuery<Record<string, unknown>>(`
      SELECT
        recommended_action,
        count()                      AS n,
        round(avg(roas), 2)          AS avg_roas,
        countDistinct(city)          AS cities,
        countDistinct(product_name)  AS products
      FROM gold.mart_geo_product_opportunity FINAL
      WHERE report_date = '${reportDate}'
        AND brand_id = ${brandId}
      GROUP BY recommended_action
      ORDER BY n DESC
    `),

    clickHouseQuery<Record<string, unknown>>(`
      SELECT
        weather_stage,
        count() AS n
      FROM gold.mart_geo_product_opportunity FINAL
      WHERE report_date = '${reportDate}'
        AND brand_id = ${brandId}
        AND weather_stage != ''
      GROUP BY weather_stage
      ORDER BY n DESC
    `),
  ])

  const rows: GeoAllocationRow[] = rawRows.map((r) => ({
    city:                 String(r.city ?? ""),
    state:                String(r.state ?? ""),
    product_name:         String(r.product_name ?? ""),
    campaign_name:        String(r.campaign_name ?? ""),
    adset_name:           String(r.adset_name ?? ""),
    orders_7d:            Number(r.orders_7d ?? 0),
    attributed_revenue:   Number(r.attributed_revenue ?? 0),
    effective_city_spend: Number(r.effective_city_spend ?? 0),
    roas:                 Number(r.roas ?? 0),
    opportunity_score:    Number(r.opportunity_score ?? 0),
    recommended_action:   String(r.recommended_action ?? "HOLD") as ActionType,
    budget_modifier:      Number(r.budget_modifier ?? 1),
    reason:               String(r.reason ?? ""),
    weather_stage:        String(r.weather_stage ?? "UNKNOWN"),
    weather_score:        Number(r.weather_score ?? 0),
    broad_discovery_flag: Number(r.broad_discovery_flag ?? 0),
  }))

  const summary: GeoAllocationSummaryRow[] = rawSummary.map((r) => ({
    recommended_action: String(r.recommended_action) as ActionType,
    n:         Number(r.n ?? 0),
    avg_roas:  Number(r.avg_roas ?? 0),
    cities:    Number(r.cities ?? 0),
    products:  Number(r.products ?? 0),
  }))

  const weather: GeoWeatherRow[] = rawWeather.map((r) => ({
    weather_stage: String(r.weather_stage ?? "UNKNOWN"),
    n:             Number(r.n ?? 0),
  }))

  return { rows, summary, weather, reportDate }
}
