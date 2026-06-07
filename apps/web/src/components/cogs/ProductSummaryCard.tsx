"use client"

import {
  type ProductGroup,
  type VariantData,
  productPeriodRoas,
  variantPeriodRoas,
} from "@/lib/campaign-sku-matcher"
import { MetricTile } from "./MetricTile"

const fmt = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

export function ProductSummaryCard({
  product,
  variant,
}: {
  product: ProductGroup
  variant?: VariantData
}) {
  if (variant) {
    const variantAsp =
      variant.asp !== null
        ? fmt(variant.asp)
        : variant.qty > 0 && variant.grossRevenue > 0
          ? fmt(variant.grossRevenue / variant.qty)
          : "—"
    const variantRoas = variantPeriodRoas(variant)

    return (
      <div className="rounded-xl border border-insight-border dark:border-night-800 bg-white dark:bg-night-900 p-3 shadow-sm dark:shadow-none">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-night-500">
          Variant data — {variant.sku}
          <span className="ml-2 normal-case text-stone-400 dark:text-night-600">
            ({(variant.qtyShare * 100).toFixed(0)}% of {product.productBase} qty)
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <MetricTile
            label="Units sold"
            value={variant.qty.toLocaleString("en-IN")}
            sub={`${(variant.qtyShare * 100).toFixed(0)}% of product`}
            compact
          />
          <MetricTile
            label="Product cost / unit"
            value={fmt(variant.cogs)}
            sub={`+ ship ₹${Math.round(variant.shippingPerUnit)} + pkg ₹${Math.round(variant.packagingPerUnit)} = ₹${Math.round(variant.cogs + variant.shippingPerUnit + variant.packagingPerUnit)}`}
            compact
          />
          <MetricTile
            label="Total COGS"
            value={variant.totalEffectiveCogs > 0 ? fmt(variant.totalEffectiveCogs) : "—"}
            sub={
              variant.qty > 0 && variant.totalEffectiveCogs > 0
                ? `₹${Math.round(variant.totalEffectiveCogs / variant.qty)}/u · product ₹${Math.round(variant.totalCogs)}`
                : undefined
            }
            compact
          />
          <MetricTile
            label="Gross sales"
            value={variant.grossRevenue > 0 ? fmt(variant.grossRevenue) : "—"}
            sub={`ASP ${variantAsp}`}
            compact
          />
          <MetricTile
            label="Net rev (ex-GST)"
            value={variant.netRevenueExGst > 0 ? fmt(variant.netRevenueExGst) : "—"}
            compact
          />
          <MetricTile
            label="Returns / gateway"
            value={`${variant.returnRatePct.toFixed(1)}%`}
            sub={`RTO ₹${Math.round(variant.rtoPerUnit)}/u · gw ${variant.gatewayPct.toFixed(1)}%`}
            compact
          />
          <MetricTile
            label="Alloc. ad spend"
            value={variant.allocatedAdSpend > 0 ? fmt(variant.allocatedAdSpend) : "—"}
            sub={
              variant.allocatedPurchases > 0
                ? `${variant.allocatedPurchases} purch · CAC ${fmt(variant.cac)}`
                : "Qty-share allocated"
            }
            compact
          />
          <MetricTile
            label="ROAS"
            value={variantRoas > 0 ? `${variantRoas.toFixed(2)}x` : "—"}
            sub={variant.allocatedAdSpend > 0 ? "rev ÷ ad spend" : undefined}
            compact
          />
        </div>
        {product.matchedCampaigns.length > 0 && (
          <p className="mt-2 truncate text-[10px] text-stone-400 dark:text-night-600">
            Campaigns: {product.matchedCampaigns.slice(0, 3).join(" · ")}
            {product.matchedCampaigns.length > 3 && ` +${product.matchedCampaigns.length - 3}`}
          </p>
        )}
      </div>
    )
  }

  const aspDisplay =
    product.asp !== null
      ? fmt(product.asp)
      : product.totalQty > 0 && product.grossRevenue > 0
        ? fmt(product.grossRevenue / product.totalQty)
        : "—"
  const periodRoas = productPeriodRoas(product)

  return (
    <div className="rounded-xl border border-insight-border dark:border-night-800 bg-white dark:bg-night-900 p-3 shadow-sm dark:shadow-none">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-night-500">
        Period data — {product.productBase}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        <MetricTile
          label="Units sold"
          value={product.totalQty.toLocaleString("en-IN")}
          sub={product.variants.length > 1 ? `${product.variants.length} variants` : undefined}
          compact
        />
        <MetricTile
          label="Product cost / unit"
          value={fmt(product.avgCogs)}
          sub={`+ ship ₹${Math.round(product.avgShippingPerUnit)} + pkg ₹${Math.round(product.avgPackagingPerUnit)} = ₹${Math.round(product.avgCogs + product.avgShippingPerUnit + product.avgPackagingPerUnit)}`}
          compact
        />
        <MetricTile
          label="Total COGS"
          value={product.totalEffectiveCogs > 0 ? fmt(product.totalEffectiveCogs) : "—"}
          sub={
            product.totalQty > 0 && product.totalEffectiveCogs > 0
              ? `₹${Math.round(product.totalEffectiveCogs / product.totalQty)}/u · product ₹${Math.round(product.totalCogs)}`
              : undefined
          }
          compact
        />
        <MetricTile
          label="Gross sales"
          value={product.grossRevenue > 0 ? fmt(product.grossRevenue) : "—"}
          sub={`ASP ${aspDisplay}`}
          compact
        />
        <MetricTile
          label="Net rev (ex-GST)"
          value={product.netRevenueExGst > 0 ? fmt(product.netRevenueExGst) : "—"}
          compact
        />
        <MetricTile
          label="Returns / gateway"
          value={`${product.avgReturnRatePct.toFixed(1)}%`}
          sub={`RTO ₹${Math.round(product.avgRtoPerUnit)}/u · gw ${product.avgGatewayPct.toFixed(1)}%`}
          compact
        />
        <MetricTile
          label="Ad spend"
          value={product.adSpend > 0 ? fmt(product.adSpend) : "—"}
          sub={
            product.adPurchases > 0
              ? `${product.adPurchases} purch · CAC ${fmt(product.cac)}`
              : product.matchedCampaigns.length === 0
                ? "No campaigns"
                : undefined
          }
          compact
        />
        <MetricTile
          label="ROAS"
          value={periodRoas > 0 ? `${periodRoas.toFixed(2)}x` : "—"}
          sub={product.adSpend > 0 ? "rev ÷ ad spend" : undefined}
          compact
        />
      </div>
      {product.matchedCampaigns.length > 0 && (
        <p className="mt-2 truncate text-[10px] text-stone-400 dark:text-night-600">
          {product.matchedCampaigns.slice(0, 3).join(" · ")}
          {product.matchedCampaigns.length > 3 && ` +${product.matchedCampaigns.length - 3}`}
        </p>
      )}
    </div>
  )
}
