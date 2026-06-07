export interface RawSkuRow {
  sku: string
  productTitle: string
  qty: number
  unitCost: number          // pure ex-GST product cost per unit (placed_product_cost / qty)
  shippingPerUnit: number   // real shipping per unit (placed_shipping_cost / qty) — was hardcoded 117
  packagingPerUnit: number  // real packaging per unit (placed_packaging_cost / qty) — was hardcoded 10
  rtoPerUnit: number        // real reverse-logistics cost per unit (rto_cost / qty)
  gatewayFeePerUnit: number   // placed_gateway_fee / qty (₹/unit on gross ASP)
  gatewayPct: number        // gateway fee % on gross ASP (placed_gateway_fee / gross_line_revenue × 100)
  returnRatePct: number     // real return rate (returned_units / qty × 100) — was hardcoded 12
  asp: number | null        // avg_unit_price (GST-inclusive)
  grossRevenue: number      // gross_line_revenue (GST-inclusive, placement)
  netRevenueExGst: number   // net_line_revenue_ex_gst (net of returns)
  placedProductCost: number
  placedShippingCost: number
  placedPackagingCost: number
  placedGatewayFee: number
  totalCogs: number         // gold total_cogs (= placed product cost total)
  totalEffectiveCogs: number // placed product + shipping + packaging
}

export interface RawCampaignRow {
  campaignName: string
  spend: number
  purchases: number
}

/** Per-variant data with campaign spend allocated proportionally by qty share. */
export interface VariantData {
  sku: string
  qty: number
  qtyShare: number          // this variant's qty / product totalQty
  cogs: number              // pure ex-GST product cost per unit (negotiation lever)
  shippingPerUnit: number   // real shipping per unit (segregated from DB)
  packagingPerUnit: number  // real packaging per unit (segregated from DB)
  rtoPerUnit: number        // real reverse-logistics cost per unit
  gatewayFeePerUnit: number   // placed_gateway_fee / qty
  gatewayPct: number        // gateway fee % on gross ASP
  returnRatePct: number     // real return rate %
  asp: number | null        // variant-specific selling price
  grossRevenue: number
  netRevenueExGst: number
  totalCogs: number
  totalEffectiveCogs: number
  allocatedAdSpend: number  // product adSpend × qtyShare
  allocatedPurchases: number
  cac: number               // allocatedAdSpend / allocatedPurchases
}

export interface ProductGroup {
  productBase: string         // "TH-198-UFOBALL"
  productTitle: string        // from highest-qty variant
  totalQty: number            // sum across variants
  avgCogs: number             // qty-weighted pure product cost per unit (ex-GST)
  avgShippingPerUnit: number  // qty-weighted real shipping per unit
  avgPackagingPerUnit: number // qty-weighted real packaging per unit
  avgRtoPerUnit: number       // qty-weighted real reverse-logistics cost per unit
  avgGatewayPct: number       // qty-weighted effective gateway fee %
  avgReturnRatePct: number    // qty-weighted real return rate %
  asp: number | null          // qty-weighted avg selling price
  grossRevenue: number        // total gross revenue (incl GST)
  netRevenueExGst: number     // total net revenue ex-GST
  totalCogs: number           // sum of gold total_cogs (product cost total)
  totalEffectiveCogs: number  // sum of placed product + shipping + packaging
  variants: string[]          // all variant SKU codes
  variantData: VariantData[]
  // Filled after campaign matching:
  adSpend: number
  adPurchases: number
  cac: number
  matchedCampaigns: string[]
}

/**
 * Extracts the base product code from a SKU — strips size/colour/number suffix.
 *
 * "TH-198-UFOBALL-1"         → "TH-198-UFOBALL"
 * "TH-368-AVOCOOLMAT - L"    → "TH-368-AVOCOOLMAT"  (space stops match)
 * "TH-336-PAWTECH-GRAY"      → "TH-336-PAWTECH"
 * "TH-152-TANGLELEASH-BLACK" → "TH-152-TANGLELEASH"
 * "TH-285-FLIPPYFISHTOY"     → "TH-285-FLIPPYFISHTOY"
 */
const PRODUCT_BASE_RE = /^([A-Z]{2,3}-\d{2,5}-[A-Z]+)/i

export function extractProductBase(sku: string): string {
  const m = sku.match(PRODUCT_BASE_RE)
  return m ? m[1].toUpperCase() : sku.toUpperCase()
}

/** Meta CAC for unit-economics sim — 0 when organic (no ad spend). */
export function resolveProductCac(
  product: Pick<ProductGroup, "adSpend" | "cac" | "totalQty">,
): number {
  if (product.adSpend <= 0) return 0
  if (product.cac > 0) return Math.round(product.cac)
  if (product.totalQty > 0) return Math.round(product.adSpend / product.totalQty)
  return 0
}

export function resolveVariantCac(
  variant: Pick<VariantData, "allocatedAdSpend" | "cac" | "qty">,
  product: Pick<ProductGroup, "adSpend" | "cac" | "totalQty">,
): number {
  if (variant.allocatedAdSpend > 0) {
    if (variant.cac > 0) return Math.round(variant.cac)
    if (variant.qty > 0) return Math.round(variant.allocatedAdSpend / variant.qty)
  }
  return resolveProductCac(product)
}

/** Period ROAS = gross revenue ÷ ad spend (ROAS_AGG). */
export function productPeriodRoas(
  product: Pick<ProductGroup, "adSpend" | "grossRevenue">,
): number {
  return product.adSpend > 0 ? product.grossRevenue / product.adSpend : 0
}

export function variantPeriodRoas(
  variant: Pick<VariantData, "allocatedAdSpend" | "grossRevenue">,
): number {
  return variant.allocatedAdSpend > 0 ? variant.grossRevenue / variant.allocatedAdSpend : 0
}

/** Groups variant-level SKU rows into product-level groups. */
export function groupSkusByProduct(skus: RawSkuRow[]): ProductGroup[] {
  const map = new Map<string, RawSkuRow[]>()
  for (const row of skus) {
    const base = extractProductBase(row.sku)
    map.set(base, [...(map.get(base) ?? []), row])
  }

  const groups: ProductGroup[] = []
  for (const [productBase, rows] of map) {
    const totalQty = rows.reduce((s, r) => s + r.qty, 0)

    // Qty-weighted average of any per-unit / per-unit-rate field across variants.
    // (For per-unit costs and the return rate this is exact: rate × qty = the total.)
    const wAvg = (pick: (r: RawSkuRow) => number) =>
      totalQty > 0
        ? rows.reduce((s, r) => s + pick(r) * r.qty, 0) / totalQty
        : pick(rows[0] ?? ({} as RawSkuRow)) || 0

    const avgCogs = wAvg((r) => r.unitCost)
    const avgShippingPerUnit = wAvg((r) => r.shippingPerUnit)
    const avgPackagingPerUnit = wAvg((r) => r.packagingPerUnit)
    const avgRtoPerUnit = wAvg((r) => r.rtoPerUnit)
    const avgReturnRatePct = wAvg((r) => r.returnRatePct)

    const aspNumerator = rows.reduce((s, r) => (r.asp !== null ? s + r.asp * r.qty : s), 0)
    const aspQty = rows.reduce((s, r) => (r.asp !== null ? s + r.qty : s), 0)
    const asp = aspQty > 0 ? aspNumerator / aspQty : null

    const grossRevenue = rows.reduce((s, r) => s + r.grossRevenue, 0)
    const netRevenueExGst = rows.reduce((s, r) => s + r.netRevenueExGst, 0)
    const totalCogs = rows.reduce((s, r) => s + r.totalCogs, 0)
    const totalEffectiveCogs = rows.reduce((s, r) => s + r.totalEffectiveCogs, 0)
    const avgGatewayPct = grossRevenue > 0
      ? (rows.reduce((s, r) => s + r.placedGatewayFee, 0) / grossRevenue) * 100
      : wAvg((r) => r.gatewayPct)
    const dominantRow = rows.slice().sort((a, b) => b.qty - a.qty)[0]

    // variantData filled with zeros for ad allocation — populated after matching
    const variantData: VariantData[] = rows.map((r) => ({
      sku: r.sku,
      qty: r.qty,
      qtyShare: totalQty > 0 ? r.qty / totalQty : 0,
      cogs: r.unitCost,
      shippingPerUnit: r.shippingPerUnit,
      packagingPerUnit: r.packagingPerUnit,
      rtoPerUnit: r.rtoPerUnit,
      gatewayFeePerUnit: r.gatewayFeePerUnit,
      gatewayPct: r.gatewayPct,
      returnRatePct: r.returnRatePct,
      asp: r.asp,
      grossRevenue: r.grossRevenue,
      netRevenueExGst: r.netRevenueExGst,
      totalCogs: r.totalCogs,
      totalEffectiveCogs: r.totalEffectiveCogs,
      allocatedAdSpend: 0,
      allocatedPurchases: 0,
      cac: 0,
    }))

    groups.push({
      productBase,
      productTitle: dominantRow.productTitle,
      totalQty,
      avgCogs: Math.round(avgCogs * 100) / 100,
      avgShippingPerUnit: Math.round(avgShippingPerUnit * 100) / 100,
      avgPackagingPerUnit: Math.round(avgPackagingPerUnit * 100) / 100,
      avgRtoPerUnit: Math.round(avgRtoPerUnit * 100) / 100,
      avgGatewayPct: Math.round(avgGatewayPct * 100) / 100,
      avgReturnRatePct: Math.round(avgReturnRatePct * 100) / 100,
      asp,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      netRevenueExGst: Math.round(netRevenueExGst * 100) / 100,
      totalCogs: Math.round(totalCogs * 100) / 100,
      totalEffectiveCogs: Math.round(totalEffectiveCogs * 100) / 100,
      variants: rows.map((r) => r.sku),
      variantData,
      adSpend: 0,
      adPurchases: 0,
      cac: 0,
      matchedCampaigns: [],
    })
  }

  return groups.sort((a, b) => b.totalQty - a.totalQty)
}

const NUMERIC_PREFIX_RE = /\b([A-Z]{2,3}-\d{2,5})\b/i

function extractNumericPrefix(campaignName: string): string | null {
  const m = campaignName.match(NUMERIC_PREFIX_RE)
  return m ? m[1].toUpperCase() : null
}

/** Prefer full productBase in campaign name (TH-198-UFOBALL-23APR), fall back to TH-198 prefix. */
function resolveCampaignProduct(
  campaignName: string,
  products: ProductGroup[],
  prefixMap: Map<string, ProductGroup>,
): ProductGroup | undefined {
  const upper = campaignName.toUpperCase()
  let best: ProductGroup | undefined
  let bestLen = 0
  for (const product of products) {
    if (upper.includes(product.productBase) && product.productBase.length > bestLen) {
      best = product
      bestLen = product.productBase.length
    }
  }
  if (best) return best

  const prefix = extractNumericPrefix(campaignName)
  return prefix ? prefixMap.get(prefix) : undefined
}

/**
 * Matches campaigns to products and fills ad spend.
 * Variant-level CAC is allocated proportionally by qty share.
 */
export function matchCampaignsToProducts(
  products: ProductGroup[],
  campaigns: RawCampaignRow[],
): ProductGroup[] {
  const prefixMap = new Map<string, ProductGroup>()
  for (const product of products) {
    const m = product.productBase.match(/^([A-Z]{2,3}-\d{2,5})/i)
    if (m) prefixMap.set(m[1].toUpperCase(), product)
  }

  type Bucket = { spend: number; purchases: number; names: string[] }
  const buckets = new Map<string, Bucket>()

  for (const campaign of campaigns) {
    const product = resolveCampaignProduct(campaign.campaignName, products, prefixMap)
    if (!product) continue

    const b = buckets.get(product.productBase) ?? { spend: 0, purchases: 0, names: [] }
    buckets.set(product.productBase, {
      spend: b.spend + campaign.spend,
      purchases: b.purchases + campaign.purchases,
      names: [...b.names, campaign.campaignName],
    })
  }

  return products.map((product) => {
    const b = buckets.get(product.productBase) ?? { spend: 0, purchases: 0, names: [] }
    const cac = b.purchases > 0 ? b.spend / b.purchases : 0

    // Allocate campaign spend to each variant by its qty share
    const variantData: VariantData[] = product.variantData.map((v) => {
      const allocatedAdSpend = Math.round(b.spend * v.qtyShare * 100) / 100
      const allocatedPurchases = Math.round(b.purchases * v.qtyShare)
      const variantCac = allocatedPurchases > 0 ? allocatedAdSpend / allocatedPurchases : cac
      return {
        ...v,
        allocatedAdSpend,
        allocatedPurchases,
        cac: Math.round(variantCac * 100) / 100,
      }
    })

    return {
      ...product,
      adSpend: Math.round(b.spend * 100) / 100,
      adPurchases: b.purchases,
      cac: Math.round(cac * 100) / 100,
      matchedCampaigns: b.names,
      variantData,
    }
  })
}
