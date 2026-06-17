import type { DomainChatContext } from "../domain-context"

export function buildPageContextInstructions(ctx: DomainChatContext): string {
  const tabNote = ctx.tab ? `\n- Active tab: **${ctx.tab}**` : ""
  const focusNote = ctx.focus?.tagCode
    ? `\n- Focused tag: ${ctx.focus.tagCode}`
    : ctx.focus?.adId
      ? `\n- Focused ad: ${ctx.focus.adId}`
      : ""

  const DOMAIN_RULES: Record<string, string> = {
    "pnl": `- Call **getPageContext** first to read the on-screen daily trend, waterfall, and KPI snapshot.
- Do not call getDailyPnl/getPnlTrend unless the user asks for a different date range, brand, or granularity not covered by the snapshot.
- The snapshot contains up to 31 daily rows. Use them for trend questions directly.`,
    "creative-iq": `- Call **getPageContext** first to read the on-screen neuro-tag leaderboard snapshot.
- Do not call getCreativeIQAnalysis unless the user asks for a different date range, specific tag filter, or ad filter not in the snapshot.
- The snapshot contains the top 15 scored tags with classifications and scores already computed.`,
    "dashboard": `- Call **getPageContext** first to read the on-screen KPI snapshot, channel breakdown, and daily net profit trend.
- The summary contains current and prior period P&L KPIs from the daily_pnl cube. Use these before fetching additional data.
- Use getDailyPnl or getChannelBreakdown only if the user asks for a specific metric, date range, or channel breakdown not in the snapshot.
- For channel ROAS questions use runQuery with the channel_pnl or marketing_performance cube.`,
    "meta-ads": `- Call **getPageContext** first to read the on-screen ad performance snapshot (CPC, CPM, top campaigns by ROAS, funnel).
- The snapshot contains top campaigns by ROAS and funnel totals. Use these for initial analysis.
- For deeper campaign or adset analysis use runQuery with the marketing_performance cube (dimensions: campaign_name or adset_name).
- For attribution (attributed revenue vs spend) use mergeQueryResults joining marketing_performance + dw_meta_ads_attribution on campaign_name.`,
    "shopify": `- Call **getPageContext** first to read the on-screen top products and order trends.
- The snapshot contains top products by net sales from the product_performance cube. Use for initial product analysis.
- For order trends use runQuery with shopify_orders cube (created_at_ist dimension).
- For SKU-level margin use runQuery with product_performance cube (measures: net_line_revenue_ex_gst, gross_profit_ex_gst).
- For geo or UTM breakdown use runQuery with shopify_orders with the relevant dimension filter.`,
  }

  const domainRules = DOMAIN_RULES[ctx.domain] ?? `- Call **getPageContext** first to read the on-screen snapshot.`

  return `## Page context (domain: ${ctx.domain})
- Date range: ${ctx.filters.start} → ${ctx.filters.end}${tabNote}${focusNote}

### On-screen summary (already fetched — use this before calling tools)
\`\`\`json
${JSON.stringify(ctx.summary, null, 2)}
\`\`\`

### Domain rules
${domainRules}
- Always cite on-screen data first; reference the summary above when answering questions about totals or classifications without repeating raw numbers.`
}
