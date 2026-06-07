import { z } from "zod"
import { dateRangeSchema } from "../schemas"
import { fail, okRows, runTool } from "../tool-result"

export function getCreativeIQInstructions(): string {
  return `## Creative IQ — Neuro Tag Analysis
When user asks about **creatives, neuro tags, ads, video funnel, hook rate, completion rate, tag performance**, use getCreativeIQAnalysis.

### Key questions this answers:
- "Which neuro tags are winners?" → strong_winner (CTR ≥ 2.5% & ROAS ≥ 2.5×) or conversion_winner (ROAS ≥ 2.5% & CTR < 2.5%)
- "Which ads have high hook rate?" → fetch tag data, look at \`hook_rate\` column
- "Show me misleading hooks" → tags with CTR ≥ 2.5% but ROAS ≤ 1.5×
- "What's the video funnel for [tag]?" → fetch by tag_code, show impression → 3s → 25% → 50% → 75% → 100% → thruplay → link_clicks → orders
- "Ad performance by tag" → include adLeaderboard + tag mapping

### Scoring model (tags):
- **Revenue** (28%) + **ROAS** (20%) + **CTR** (18%) + **CPC efficiency** (10%) + **Order rate** (10%) + **Hook rate** (8%) + **Confidence** (6%)
- High score = strong tag

### Classifications:
- **strong_winner**: CTR ≥ 2.5% AND ROAS ≥ 2.5× (or score ≥ 0.65) — high attention + high conversion
- **conversion_winner**: ROAS ≥ 2.5% AND CTR < 2.5% — converts well but low hook
- **misleading_hook**: CTR ≥ 2.5% AND ROAS ≤ 1.5× — attracts clicks, doesn't convert (red flag)
- **creative_hook_winner**: high CTR + high reach but low revenue (< 15% of max) — good attention hook
- **weak_attention**: score < 0.25 — underperforming
- **needs_more_data**: spend < ₹500 OR impressions < 1,000 — not enough data yet

### Data returned by getCreativeIQAnalysis:
- **scoredTags**: all tags with classification + score + spend + ROAS + CTR + hook_rate + orders
- **adLeaderboard**: all ads with tags, spend, hook%, CTR, ROAS, orders, CPA
- **funnelTotals**: period-level funnel (reach → impressions → video depths → link clicks → orders)
- **misleadingHooks**: list of high-CTR, low-ROAS tags (separate)

### When interpreting results:
- Always cite the **classification badge** first ("This tag is a strong_winner because...")
- Compare **spend** and **ROAS** side-by-side: spend < ₹10K = lower confidence, ROAS >= 2.5× = strong signal
- **Hook rate** (3s view rate) = first signal of creative appeal; **completion rate** = viewer satisfaction
- **Misleading hooks** require immediate action: either improve landing page (to convert) or pause to save budget`
}

export function createCreativeIQTools() {
  return {
    getCreativeIQAnalysis: {
      description:
        "Fetch Creative IQ data: neuro tags, ad performance, scoring, funnels, and classifications. Returns scoredTags, adLeaderboard, funnelTotals, misleadingHooks, and per-stage metrics for any date range and optional tag/ad filter.",
      inputSchema: dateRangeSchema.extend({
        tagCode: z
          .string()
          .optional()
          .describe(
            "Optional neuro-tag code filter (e.g. 'humor', 'urgency'). If provided, returns only that tag's analysis."
          ),
        adId: z
          .string()
          .optional()
          .describe("Optional Meta ad ID filter. If provided, returns only that ad's performance + tags."),
        includeFunnel: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Include full video funnel analysis (reach → impressions → video depths → orders). Set false for tag-only view."
          ),
      }),
      execute: ({ startDate, endDate, tagCode, adId, includeFunnel }: {
        startDate: string
        endDate?: string
        tagCode?: string
        adId?: string
        includeFunnel?: boolean
      }) =>
        runTool(async () => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/chat/creative-iq`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate,
              endDate: endDate || startDate,
              tagCode,
              adId,
              includeFunnel: includeFunnel ?? true,
            }),
          })

          if (!response.ok) {
            const text = await response.text()
            return fail(`Creative IQ fetch failed: ${response.status} ${text}`)
          }

          const data = await response.json()
          return okRows(data.rows || [], {
            type: data.type || "table",
          })
        }),
    },
  }
}
