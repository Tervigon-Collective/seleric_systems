import "server-only"

import { type DashboardBrandFilter } from "../brand-filter"
import { safeCubeQuery, runDashboardCubeFetch } from "../cube-query"
import { type DashboardDateRange } from "../date-ranges"
import { q, td } from "../query-helpers"

export interface ShopifyDashboardData {
  revenueOrdersDaily: Record<string, unknown>[]
  topProducts: Record<string, unknown>[]
  returnCancel: Record<string, unknown>[]
  revenueByGeo: Record<string, unknown>[]
  utmBreakdown: Record<string, unknown>[]
  discountImpact: Record<string, unknown>[]
  unitsPerOrder: Record<string, unknown>[]
  fulfillmentMix: Record<string, unknown>[]
  marginBySku: Record<string, unknown>[]
  shippingRevenue: Record<string, unknown>[]
}

async function safeQuery(
  cube: string,
  brand: DashboardBrandFilter,
  query: Record<string, unknown>,
  label: string
) {
  return safeCubeQuery(q(cube, brand, query), label)
}

export async function fetchShopifyDashboardData(
  range: DashboardDateRange,
  brand: DashboardBrandFilter
): Promise<ShopifyDashboardData> {
  return runDashboardCubeFetch(async () => {
    const [
      revenueOrdersDaily,
      topProducts,
      returnCancel,
      revenueByGeo,
      utmBreakdown,
      discountImpact,
      unitsPerOrder,
      fulfillmentMix,
      marginBySku,
      shippingRevenue,
    ] = await Promise.all([
      safeQuery(
        "shopify_orders",
        brand,
        {
          measures: [
            "shopify_orders.gross_revenue",
            "shopify_orders.net_sales_ex_gst",
            "shopify_orders.net_orders",
            "shopify_orders.aov",
          ],
          timeDimensions: [td("shopify_orders.created_at_ist", range, "day")],
          order: { "shopify_orders.created_at_ist": "asc" },
        },
        "revenueOrdersDaily"
      ),
      safeQuery(
        "product_performance",
        brand,
        {
          dimensions: ["product_performance.product_title"],
          measures: [
            "product_performance.gross_line_revenue_ex_gst",
            "product_performance.net_line_revenue_ex_gst",
            "product_performance.total_quantity",
            "product_performance.gross_profit_ex_gst",
            "product_performance.total_cogs",
          ],
          timeDimensions: [td("product_performance.created_at_ist", range)],
          order: { "product_performance.net_line_revenue_ex_gst": "desc" },
          limit: 15,
        },
        "topProducts"
      ),
      safeQuery(
        "product_performance",
        brand,
        {
          dimensions: ["product_performance.product_title"],
          measures: [
            "product_performance.returned_units",
            "product_performance.cancelled_units",
            "product_performance.total_quantity",
            "product_performance.total_line_discounts",
          ],
          timeDimensions: [td("product_performance.created_at_ist", range)],
          order: { "product_performance.returned_units": "desc" },
          limit: 20,
        },
        "returnCancel"
      ),
      safeQuery(
        "shopify_orders",
        brand,
        {
          dimensions: ["shopify_orders.ship_country", "shopify_orders.ship_province"],
          measures: ["shopify_orders.gross_revenue", "shopify_orders.net_orders", "shopify_orders.aov"],
          timeDimensions: [td("shopify_orders.created_at_ist", range)],
          order: { "shopify_orders.gross_revenue": "desc" },
          limit: 50,
        },
        "revenueByGeo"
      ),
      safeQuery(
        "shopify_orders",
        brand,
        {
          dimensions: [
            "shopify_orders.utm_source",
            "shopify_orders.utm_medium",
            "shopify_orders.utm_campaign",
          ],
          measures: ["shopify_orders.gross_revenue", "shopify_orders.net_orders", "shopify_orders.aov"],
          timeDimensions: [td("shopify_orders.created_at_ist", range)],
          order: { "shopify_orders.gross_revenue": "desc" },
          limit: 30,
        },
        "utmBreakdown"
      ),
      safeQuery(
        "shopify_order_line_items",
        brand,
        {
          measures: [
            "shopify_order_line_items.total_line_discounts",
            "shopify_order_line_items.net_line_revenue_ex_gst",
            "shopify_order_line_items.gross_profit_ex_gst",
            "shopify_order_line_items.total_cogs",
            "shopify_order_line_items.avg_unit_price",
            "shopify_order_line_items.avg_discounted_unit_price",
          ],
          timeDimensions: [td("shopify_order_line_items.created_at_ist", range, "day")],
          order: { "shopify_order_line_items.created_at_ist": "asc" },
        },
        "discountImpact"
      ),
      safeQuery(
        "shopify_order_line_items",
        brand,
        {
          measures: [
            "shopify_order_line_items.units_per_order",
            "shopify_order_line_items.avg_unit_price",
            "shopify_order_line_items.avg_discounted_unit_price",
            "shopify_order_line_items.unique_products",
          ],
          timeDimensions: [td("shopify_order_line_items.created_at_ist", range, "day")],
          order: { "shopify_order_line_items.created_at_ist": "asc" },
        },
        "unitsPerOrder"
      ),
      safeQuery(
        "shopify_orders",
        brand,
        {
          dimensions: ["shopify_orders.fulfillment_status"],
          measures: ["shopify_orders.orders", "shopify_orders.gross_revenue"],
          timeDimensions: [td("shopify_orders.created_at_ist", range)],
          order: { "shopify_orders.orders": "desc" },
        },
        "fulfillmentMix"
      ),
      safeQuery(
        "product_performance",
        brand,
        {
          dimensions: ["product_performance.sku", "product_performance.product_title"],
          measures: [
            "product_performance.gross_profit_ex_gst",
            "product_performance.total_cogs",
            "product_performance.net_line_revenue_ex_gst",
            "product_performance.avg_unit_price",
            "product_performance.avg_discounted_unit_price",
            "product_performance.total_quantity",
          ],
          timeDimensions: [td("product_performance.created_at_ist", range)],
          order: { "product_performance.gross_profit_ex_gst": "desc" },
          limit: 20,
        },
        "marginBySku"
      ),
      safeQuery(
        "shopify_orders",
        brand,
        {
          measures: [
            "shopify_orders.gross_revenue",
            "shopify_orders.shipping_revenue",
            "shopify_orders.net_sales_ex_gst",
            "shopify_orders.orders_with_shipping",
          ],
          timeDimensions: [td("shopify_orders.created_at_ist", range, "day")],
          order: { "shopify_orders.created_at_ist": "asc" },
        },
        "shippingRevenue"
      ),
    ])

    return {
      revenueOrdersDaily,
      topProducts,
      returnCancel,
      revenueByGeo,
      utmBreakdown,
      discountImpact,
      unitsPerOrder,
      fulfillmentMix,
      marginBySku,
      shippingRevenue,
    }
  })
}
