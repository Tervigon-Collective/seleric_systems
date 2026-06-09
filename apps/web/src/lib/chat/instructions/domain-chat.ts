import type { DomainChatContext } from "../domain-context"

export function buildPageContextInstructions(ctx: DomainChatContext): string {
  const tabNote = ctx.tab ? `\n- Active tab: **${ctx.tab}**` : ""
  const focusNote = ctx.focus?.tagCode
    ? `\n- Focused tag: ${ctx.focus.tagCode}`
    : ctx.focus?.adId
      ? `\n- Focused ad: ${ctx.focus.adId}`
      : ""

  const domainRules =
    ctx.domain === "pnl"
      ? `- Call **getPageContext** first to read the on-screen daily trend, waterfall, and KPI snapshot.
- Do not call getDailyPnl/getPnlTrend unless the user asks for a different date range, brand, or granularity not covered by the snapshot.
- The snapshot contains up to 31 daily rows. Use them for trend questions directly.`
      : `- Call **getPageContext** first to read the on-screen neuro-tag leaderboard snapshot.
- Do not call getCreativeIQAnalysis unless the user asks for a different date range, specific tag filter, or ad filter not in the snapshot.
- The snapshot contains the top 15 scored tags with classifications and scores already computed.`

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
