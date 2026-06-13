import { ChartCard } from "@/components/charts/ChartCard"
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionSkuData } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionSkuData
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

export function AttributionSkuView({ data }: Props) {
  const { skuRows } = data

  const top10 = skuRows.slice(0, 10)

  const tableRows = skuRows.map((r) => {
    const rev = n(r["product_performance.net_line_revenue_ex_gst"])
    const gp = n(r["product_performance.gross_profit_ex_gst"])
    const gpPct = rev > 0 ? ((gp / rev) * 100).toFixed(1) + "%" : "—"
    return {
      SKU: String(r["product_performance.sku"] ?? "—"),
      Product: String(r["product_performance.product_title"] ?? "—").slice(0, 50),
      "Revenue (ex-GST)": fmtMoney(rev),
      Units: n(r["product_performance.total_quantity"]) > 0 ? fmtCount(n(r["product_performance.total_quantity"])) : "—",
      COGS: fmtMoney(r["product_performance.total_cogs"]),
      "Gross Profit": fmtMoney(gp),
      "GP%": gpPct,
    }
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
        SKU data covers all orders in the date range regardless of attribution channel — no per-channel SKU breakdown is available in the current data model.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Top 10 SKUs by revenue" subtitle="Net line revenue ex-GST" cube="product_performance">
          <HorizontalBarChart
            rows={top10}
            labelKey="product_performance.sku"
            measureKeys={["product_performance.net_line_revenue_ex_gst", "product_performance.gross_profit_ex_gst"]}
            height={300}
          />
        </ChartCard>

        <ChartCard title="SKU performance table" subtitle="Revenue, units, COGS, gross profit" cube="product_performance" className="xl:col-span-2">
          {tableRows.length > 0 ? (
            <DataTable rows={tableRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No SKU data for this period.</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
