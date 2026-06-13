import { ChartCard } from "@/components/charts/ChartCard"
import { DataTable } from "@/components/chat/DataTable"
import { fmtCurrency } from "@/components/charts/format"
import type { AttributionOrdersData } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionOrdersData
}

function n(v: unknown): number {
  return Number(v ?? 0)
}

function fmtMoney(v: unknown): string {
  const x = n(v)
  return x !== 0 ? fmtCurrency(x) : "—"
}

export function AttributionOrdersView({ data }: Props) {
  const { orderRows } = data

  const tableRows = orderRows.map((r) => {
    const platform = String(r["order_attribution.lt_platform"] ?? "other")
    const campaign = r["order_attribution.lt_campaign_name"]
    const attrOrders = n(r["order_attribution.attributed_orders"])
    const placedOrders = n(r["order_attribution.placed_orders"])
    const gap = placedOrders - attrOrders
    const rawDate = String(r["order_attribution.order_date"] ?? r["order_attribution.order_date.day"] ?? "")
    const isUnattributed = !campaign || platform === "other"

    return {
      Date: rawDate.slice(0, 10) || "—",
      Platform: isUnattributed ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} ⚠` : platform.charAt(0).toUpperCase() + platform.slice(1),
      Campaign: campaign ? String(campaign) : "Unattributed",
      "Attr. Orders": attrOrders > 0 ? String(attrOrders) : "—",
      "Placed Orders": placedOrders > 0 ? String(placedOrders) : "—",
      "Attr. Gap": gap > 0 ? String(gap) : "—",
      "Attr. Revenue": fmtMoney(r["order_attribution.attributed_net_revenue_ex_gst"]),
    }
  })

  const totalPlaced = orderRows.reduce((s, r) => s + n(r["order_attribution.placed_orders"]), 0)
  const totalAttribted = orderRows.reduce((s, r) => s + n(r["order_attribution.attributed_orders"]), 0)
  const totalUnattributed = totalPlaced - totalAttribted
  const attrPct = totalPlaced > 0 ? ((totalAttribted / totalPlaced) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-night-800 dark:bg-night-875 dark:text-night-400">
        Placed Orders = all orders touching the channel. Attr. Orders = orders with last-touch credit granted. Attr. Gap = placed − attributed.
        Attribution rate: <strong>{attrPct}%</strong> ({totalAttribted} attributed of {totalPlaced} placed). Unattributed: {totalUnattributed}.
        ⚠ = no campaign resolved.
      </div>

      <ChartCard
        title="Order attribution trace"
        subtitle="Platform × campaign × day — last-touch warehouse orders"
        cube="order_attribution"
        className="xl:col-span-2"
      >
        {tableRows.length > 0 ? (
          <DataTable rows={tableRows} />
        ) : (
          <p className="text-sm text-stone-500 dark:text-night-500">No order attribution data for this period.</p>
        )}
      </ChartCard>
    </div>
  )
}
