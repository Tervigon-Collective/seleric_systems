import { ChartCard } from "@/components/charts/ChartCard"
import { ComboLineBarChart } from "@/components/charts/ComboLineBarChart"
import { DonutChart } from "@/components/charts/DonutChart"
import { GroupedBarChart } from "@/components/charts/GroupedBarChart"
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart"
import { RankedList } from "@/components/charts/RankedList"
import { StackedAreaChart } from "@/components/charts/StackedAreaChart"
import { StackedBarChart } from "@/components/charts/StackedBarChart"
import { DataTable } from "@/components/chat/DataTable"
import { TrendChart } from "@/components/chat/TrendChart"
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls"
import { brandLabel, parseDashboardBrandFilter } from "@/lib/dashboard/brand-filter"
import { geoLabel, RETURN_CANCEL_SERIES, skuLabel, utmLabel } from "@/lib/dashboard/page-helpers"
import { fetchShopifyDashboardData } from "@/lib/dashboard/queries/shopify"
import { DomainChatRegistrar } from "@/components/chat/DomainChatRegistrar"
import { buildShopifyContext } from "@/lib/chat/domain-context"
import {
  dateRangeLabel,
  parseDashboardDateRange,
  type DashboardSearchParams,
} from "@/lib/dashboard/date-ranges"

export const revalidate = 60

export default async function ShopifyPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams
}) {
  const range = parseDashboardDateRange(searchParams)
  const brand = parseDashboardBrandFilter(searchParams)
  const rangeLabel = dateRangeLabel(range)
  const brandText = brandLabel(brand)

  let data
  let error: string | null = null
  try {
    data = await fetchShopifyDashboardData(range, brand)
  } catch (e) {
    error = String(e)
    data = null
  }

  const geoRows =
    data?.revenueByGeo.map((r) => ({
      ...r,
      geo: geoLabel(r),
    })) ?? []

  const utmDonut = (data?.utmBreakdown ?? []).slice(0, 6).map((r) => ({
    name: utmLabel(r),
    value: Number(r["shopify_orders.gross_revenue"] ?? 0),
  }))

  const fulfillmentDonut = (data?.fulfillmentMix ?? []).map((r) => ({
    name: String(r["shopify_orders.fulfillment_status"] ?? "Unknown"),
    value: Number(r["shopify_orders.orders"] ?? 0),
  }))

  const marginRows =
    data?.marginBySku.map((r) => ({
      ...r,
      label: skuLabel(r),
    })) ?? []

  return (
    <main className="p-6 space-y-6">
      {data && (
        <DomainChatRegistrar
          context={buildShopifyContext(data, range, brand)}
        />
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-night-50">Shopify Store</h1>
          <p className="text-sm text-stone-500 dark:text-night-500 mt-1">
            Store & product analytics · {brandText} · {rangeLabel} · created_at_ist (IST)
          </p>
          {error && (
            <p className="mt-2 text-sm text-amber-400">
              Cube unavailable — charts may be empty. Check CUBE_API_URL / SELERIC_API_KEY.
            </p>
          )}
        </div>
        <DashboardFilterControls
          start={range.start}
          end={range.end}
          spanDays={range.spanDays}
          searchParams={searchParams}
        />
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Orders & gross revenue daily" subtitle="net_orders bar · gross revenue + AOV lines" cube="shopify_orders">
          <ComboLineBarChart
            rows={data?.revenueOrdersDaily ?? []}
            barMeasures={["shopify_orders.net_orders"]}
            lineMeasures={["shopify_orders.gross_revenue", "shopify_orders.aov"]}
          />
        </ChartCard>

        <ChartCard title="Top products by net sales" subtitle="Ranked by net line sales ex GST" cube="product_performance">
          <HorizontalBarChart
            rows={data?.topProducts ?? []}
            labelKey="product_performance.product_title"
            measureKeys={["product_performance.net_line_revenue_ex_gst", "product_performance.gross_profit_ex_gst"]}
          />
        </ChartCard>

        <ChartCard title="Return & cancel by product" subtitle="Returned vs cancelled units" cube="product_performance">
          <StackedBarChart
            rows={data?.returnCancel ?? []}
            series={[...RETURN_CANCEL_SERIES]}
            categoryKey="product_performance.product_title"
          />
        </ChartCard>

        <ChartCard title="Gross revenue by geography" subtitle="Country & province ranked · gross_revenue" cube="shopify_orders">
          <RankedList
            rows={geoRows}
            labelKey="geo"
            valueKey="shopify_orders.gross_revenue"
            countKey="shopify_orders.net_orders"
          />
        </ChartCard>

        <ChartCard title="UTM source breakdown" subtitle="Donut + table" cube="shopify_orders">
          <DonutChart slices={utmDonut} />
          <DataTable rows={(data?.utmBreakdown ?? []).slice(0, 8)} />
        </ChartCard>

        <ChartCard title="Discount impact" subtitle="Daily discounts vs net sales" cube="shopify_order_line_items">
          <GroupedBarChart rows={data?.discountImpact ?? []} />
        </ChartCard>

        <ChartCard title="Units per order & AOV" subtitle="Basket size over time" cube="shopify_order_line_items">
          <TrendChart rows={data?.unitsPerOrder ?? []} />
        </ChartCard>

        <ChartCard title="Fulfillment status mix" subtitle="Period total" cube="shopify_orders">
          <DonutChart slices={fulfillmentDonut} />
        </ChartCard>

        <ChartCard title="Gross margin by SKU" subtitle="gross_profit_ex_gst ranked by SKU" cube="product_performance">
          <HorizontalBarChart
            rows={marginRows}
            labelKey="label"
            measureKeys={["product_performance.gross_profit_ex_gst", "product_performance.net_line_revenue_ex_gst"]}
            height={320}
          />
        </ChartCard>

        <ChartCard title="Shipping revenue contribution" subtitle="Stacked area daily" cube="shopify_orders">
          <StackedAreaChart
            rows={data?.shippingRevenue ?? []}
            series={[
              { label: "Gross revenue", measure: "shopify_orders.gross_revenue" },
              { label: "Shipping revenue", measure: "shopify_orders.shipping_revenue" },
            ]}
          />
        </ChartCard>
      </div>
    </main>
  )
}
