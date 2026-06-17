import { ChartCard } from "@/components/charts/ChartCard"
import { DataTable } from "@/components/chat/DataTable"
import { AttributionCampaignDrilldown } from "./AttributionCampaignDrilldown"
import { fmtCurrency, fmtCount } from "@/components/charts/format"
import type { AttributionCampaignData, AttributionChannel } from "@/lib/dashboard/queries/attribution"

interface Props {
  data: AttributionCampaignData
  channel: AttributionChannel
}

function n(v: unknown) { return Number(v ?? 0) }
function fmtMoney(v: unknown) { const x = n(v); return x !== 0 ? fmtCurrency(x) : "—" }
function fmtRoas(v: unknown) { const x = n(v); return x > 0 ? `${x.toFixed(2)}x` : "—" }
function fmtPct(v: unknown) { const x = n(v); return x > 0 ? `${(x * 100).toFixed(1)}%` : "—" }

function buildGoogleRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => ({
    Campaign: String(r["google_ad_performance.campaign_name"] ?? "—"),
    Spend: fmtMoney(r["google_ad_performance.spend"]),
    Impressions: n(r["google_ad_performance.impressions"]) > 0 ? fmtCount(n(r["google_ad_performance.impressions"])) : "—",
    Clicks: n(r["google_ad_performance.clicks"]) > 0 ? fmtCount(n(r["google_ad_performance.clicks"])) : "—",
    Conversions: n(r["google_ad_performance.conversions"]) > 0 ? `${n(r["google_ad_performance.conversions"]).toFixed(1)}` : "—",
    Revenue: fmtMoney(r["google_ad_performance.conversion_value"]),
    ROAS: fmtRoas(r["google_ad_performance.roas"]),
    CTR: fmtPct(r["google_ad_performance.ctr"]),
    CPC: fmtMoney(r["google_ad_performance.cpc"]),
    CPA: fmtMoney(r["google_ad_performance.cost_per_conversion"]),
  }))
}

export function AttributionCampaignView({ data, channel }: Props) {
  const { adRows, skuRows, rollupOrders, metaDelivery, adDelivery, googleDelivery } = data

  // Filter rows by platform using the platform field
  function filterFor(platform: string) {
    return {
      adRows: adRows.filter((r) => r.platform === platform),
      skuRows: skuRows.filter((r) => r.platform === platform),
    }
  }

  const googleRows = buildGoogleRows(googleDelivery)

  if (channel === "meta") {
    const f = filterFor("meta")
    return (
      <div className="space-y-4">
        <InfoBanner channel="meta" />
        <ChartCard
          title="Meta — campaign drill-down"
          subtitle="Click campaign → adset → ad to expand · SKUs show gross revenue from fct_order_items"
          cube="fct_order_attribution"
        >
          <AttributionCampaignDrilldown
            adRows={f.adRows}
            skuRows={f.skuRows}
            rollupOrders={rollupOrders}
            metaDelivery={metaDelivery}
            adDelivery={adDelivery}
          />
        </ChartCard>
      </div>
    )
  }

  if (channel === "google") {
    return (
      <div className="space-y-4">
        <InfoBanner channel="google" />
        <ChartCard
          title="Google — campaign performance"
          subtitle="Spend, conversions, and ROAS by campaign · Google Ads reporting"
          cube="google_ad_performance"
        >
          {googleRows.length > 0 ? (
            <DataTable rows={googleRows} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-night-500">No Google campaign data for this period.</p>
          )}
        </ChartCard>
      </div>
    )
  }

  if (channel === "organic") {
    const f = filterFor("organic")
    return (
      <div className="space-y-4">
        <InfoBanner channel="organic" />
        <ChartCard
          title="Organic — campaign drill-down"
          subtitle="Click campaign → adset → source to expand · Orders with no paid last-touch"
          cube="fct_order_attribution"
        >
          <AttributionCampaignDrilldown
            adRows={f.adRows}
            skuRows={f.skuRows}
            rollupOrders={rollupOrders}
            metaDelivery={[]}
            adDelivery={[]}
          />
        </ChartCard>
      </div>
    )
  }

  // channel === "all"
  const meta = filterFor("meta")
  const organic = filterFor("organic")
  return (
    <div className="space-y-6">
      <InfoBanner channel="all" />
      <ChartCard
        title="Meta — campaign drill-down"
        subtitle="Click campaign → adset → ad → SKUs"
        cube="fct_order_attribution"
      >
        <AttributionCampaignDrilldown
          adRows={meta.adRows}
          skuRows={meta.skuRows}
          rollupOrders={rollupOrders}
          metaDelivery={metaDelivery}
          adDelivery={adDelivery}
        />
      </ChartCard>
      <ChartCard
        title="Google — campaign performance"
        subtitle="Google Ads reporting · no order-level SKU attribution available"
        cube="google_ad_performance"
      >
        {googleRows.length > 0 ? (
          <DataTable rows={googleRows} />
        ) : (
          <p className="text-sm text-stone-500 dark:text-night-500">No Google campaign data for this period.</p>
        )}
      </ChartCard>
      <ChartCard
        title="Organic — campaign drill-down"
        subtitle="Orders with no paid last-touch"
        cube="fct_order_attribution"
      >
        <AttributionCampaignDrilldown
          adRows={organic.adRows}
          skuRows={organic.skuRows}
          rollupOrders={rollupOrders}
          metaDelivery={[]}
          adDelivery={[]}
        />
      </ChartCard>
    </div>
  )
}

function InfoBanner({ channel }: { channel: string }) {
  const text: Record<string, string> = {
    meta: "Meta · campaign → adset → ad drill-down · SKU revenue = gross placed value ex GST (net_price/1.18) · Spend/CTR/CPC/Hook from Meta delivery",
    google: "Google · campaign performance from Google Ads reporting · ROAS = conversion value / spend",
    organic: "Organic · orders with no paid last-touch · no spend or ROAS",
    all: "All channels · click Meta/Organic campaigns to expand drill-down · Google shows campaign-level delivery only",
  }
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-night-800 dark:bg-night-875 dark:text-night-400">
      {text[channel] ?? ""}
    </div>
  )
}
