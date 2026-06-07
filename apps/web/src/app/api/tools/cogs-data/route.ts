import { NextResponse } from "next/server"
import { callCubeTool } from "@/lib/cube-client"
import type { RawSkuRow, RawCampaignRow } from "@/lib/campaign-sku-matcher"

function extractRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
  }
  return []
}

function num(v: unknown): number {
  const n = Number(v)
  return isFinite(n) ? n : 0
}

/** Safe per-unit / ratio: returns 0 when the denominator is 0 or missing. */
function perUnit(total: number, qty: number): number {
  return qty > 0 ? total / qty : 0
}

function normalizeDateRange(from: string, to: string): { from: string; to: string } {
  if (from <= to) return { from, to }
  return { from: to, to: from }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const rawFrom = url.searchParams.get("dateFrom") ?? "2025-01-01"
  const rawTo = url.searchParams.get("dateTo") ?? new Date().toISOString().slice(0, 10)
  const { from: dateFrom, to: dateTo } = normalizeDateRange(rawFrom, rawTo)

  try {
    const [skuRaw, campaignRaw] = await Promise.all([
      // Per-SKU economics from gold.fct_order_items (full-column view).
      // Costs are SEGREGATED here — product / shipping / packaging / gateway / RTO
      // are separate placement totals, so we derive true per-unit rates instead of
      // stripping hardcoded shipping (117) / packaging (10) constants from a blended cost.
      callCubeTool("cube_query", {
        query: {
          dimensions: [
            "gold__fct_order_items.sku",
            "gold__fct_order_items.product_title",
          ],
          measures: [
            "gold__fct_order_items.quantity",
            "gold__fct_order_items.placed_product_cost",
            "gold__fct_order_items.placed_shipping_cost",
            "gold__fct_order_items.placed_packaging_cost",
            "gold__fct_order_items.placed_gateway_fee",
            "gold__fct_order_items.rto_cost",
            "gold__fct_order_items.returned_units",
            "gold__fct_order_items.avg_unit_price",
            "gold__fct_order_items.gross_line_revenue",
            "gold__fct_order_items.gross_line_revenue_ex_gst",
            "gold__fct_order_items.net_line_revenue_ex_gst",
          ],
          timeDimensions: [
            {
              dimension: "gold__fct_order_items.order_date",
              dateRange: [dateFrom, dateTo],
            },
          ],
          order: { "gold__fct_order_items.quantity": "desc" },
          limit: 500,
          timezone: "Asia/Kolkata",
        },
      }),
      // Campaign ad spend + purchases grouped by campaign name
      callCubeTool("cube_query", {
        query: {
          dimensions: ["ad_performance.campaign_name"],
          measures: ["ad_performance.ad_spend", "ad_performance.purchases"],
          timeDimensions: [
            {
              dimension: "ad_performance.date_start",
              dateRange: [dateFrom, dateTo],
            },
          ],
          order: { "ad_performance.ad_spend": "desc" },
          limit: 500,
          timezone: "Asia/Kolkata",
        },
      }),
    ])

    // --- SKUs ---
    const skuRows = extractRows(skuRaw)
    const skus: RawSkuRow[] = skuRows
      .filter((r) => r["gold__fct_order_items.sku"])
      .map((r) => {
        const qty = num(r["gold__fct_order_items.quantity"])
        const placedProductCost = num(r["gold__fct_order_items.placed_product_cost"])
        const placedShipping = num(r["gold__fct_order_items.placed_shipping_cost"])
        const placedPackaging = num(r["gold__fct_order_items.placed_packaging_cost"])
        const placedGateway = num(r["gold__fct_order_items.placed_gateway_fee"])
        const rtoCost = num(r["gold__fct_order_items.rto_cost"])
        const returnedUnits = num(r["gold__fct_order_items.returned_units"])
        const grossRevenue = num(r["gold__fct_order_items.gross_line_revenue"])
        const grossRevenueExGst = num(r["gold__fct_order_items.gross_line_revenue_ex_gst"])
        const netRevenueExGst = num(r["gold__fct_order_items.net_line_revenue_ex_gst"])
        const aspMeasure = num(r["gold__fct_order_items.avg_unit_price"])
        const asp = aspMeasure > 0 ? aspMeasure : perUnit(grossRevenue, qty)

        return {
          sku: String(r["gold__fct_order_items.sku"]),
          productTitle: String(r["gold__fct_order_items.product_title"] ?? ""),
          qty,
          // Pure ex-GST product cost per unit (already segregated — no constants stripped).
          unitCost: perUnit(placedProductCost, qty),
          // Real per-unit ops costs that used to be the hardcoded 117 / 10.
          shippingPerUnit: perUnit(placedShipping, qty),
          packagingPerUnit: perUnit(placedPackaging, qty),
          rtoPerUnit: perUnit(rtoCost, qty),
          // Effective gateway rate on the ex-GST revenue base the engine multiplies against.
          gatewayPct: grossRevenueExGst > 0 ? (placedGateway / grossRevenueExGst) * 100 : 0,
          // Real return rate (returned_units pre-filtered to RETURNED + IN_PROGRESS).
          returnRatePct: qty > 0 ? (returnedUnits / qty) * 100 : 0,
          asp: asp > 0 ? asp : null,
          grossRevenue,
          netRevenueExGst,
        }
      })

    // --- Campaigns ---
    const campaignRows = extractRows(campaignRaw)
    const campaigns: RawCampaignRow[] = campaignRows
      .filter((r) => r["ad_performance.campaign_name"])
      .map((r) => ({
        campaignName: String(r["ad_performance.campaign_name"]),
        spend: num(r["ad_performance.ad_spend"]),
        purchases: num(r["ad_performance.purchases"]),
      }))

    return NextResponse.json({ skus, campaigns })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
