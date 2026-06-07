# Chat + Creative IQ Integration Guide

## Overview

You can now ask questions about **neuro tags, ad performance, creative insights, and video funnel metrics** directly in the chat interface. The chat will automatically use the Creative IQ module to answer these queries with real data.

---

## What Questions Can You Ask?

### Creative & Tag Performance
- **"Which neuro tags are strong winners?"**
  - Returns tags classified as `strong_winner` (CTR ≥ 2.5% AND ROAS ≥ 2.5×)
- **"Show me the top performing tags this month"**
  - Ranked by score with spend, ROAS, CTR, hook rate
- **"What are misleading hooks?"**
  - Tags with high CTR (≥ 2.5%) but low ROAS (≤ 1.5×) — drive clicks but don't convert

### Ad Performance
- **"Which ads have the highest hook rate?"**
  - Shows 3-second view rates (scroll-stop metric)
- **"Ad performance by neuro tag for [tag name]"**
  - All ads using that tag + their metrics
- **"Show me conversion winners"**
  - Tags with ROAS ≥ 2.5× but CTR < 2.5% — convert well but low attention

### Video Funnel Analysis
- **"What's the video funnel for [tag]?"**
  - Impressions → 3s Views → 25% → 50% → 75% → 100% → Thruplay → Link Clicks → Orders
- **"Show me funnel dropoff for [category]"**
  - Identify biggest retention gaps per stage
- **"Compare completion rates across [tag category]"**
  - 100% view rate (full video completion) by tag

### Cross-Tab Analysis
- **"Which categories are we spending most on?"**
  - Spend breakdown by psychological frame (split-credit)
- **"Show spend trend by tag over time"**
  - Daily spend: split-credit vs full-credit
- **"What's the ROAS distribution?"**
  - Tags ranked by ROAS with performance bands

---

## How It Works (Behind the Scenes)

### 1. **Tool Invocation**
When you ask about creatives, the chat uses:
```
getCreativeIQAnalysis(startDate, endDate, optional: tagCode, adId, includeFunnel)
```

### 2. **Data Fetching**
The tool calls the API endpoint `/api/chat/creative-iq` which:
- Fetches scored tags with classifications
- Pulls ad leaderboard + tag mappings  
- Gets video funnel totals (if includeFunnel=true)
- Filters by tag code or ad ID if specified
- Returns misleading hooks as a separate stream

### 3. **Scoring & Classification**

**Tag Score** = weighted combination of:
| Component | Weight | What It Means |
|-----------|--------|---------------|
| Revenue | 28% | Absolute net revenue |
| ROAS | 20% | Revenue / spend efficiency |
| CTR | 18% | Click-through rate (attention metric) |
| CPC efficiency | 10% | Lower cost per click = better |
| Order rate | 10% | Click → order conversion |
| Hook rate | 8% | 3-second scroll-stop rate |
| Confidence | 6% | Fixed bonus for sufficient spend |

**Classification Badges:**

| Badge | Class | Rules | Meaning |
|-------|-------|-------|---------|
| 🟢 **Strong Winner** | `strong_winner` | CTR ≥ 2.5% AND ROAS ≥ 2.5× | High attention + high conversion |
| 🟦 **Converter** | `conversion_winner` | ROAS ≥ 2.5% AND CTR < 2.5% | Converts well, low attention hook |
| 🔴 **Misleading Hook** | `misleading_hook` | CTR ≥ 2.5% AND ROAS ≤ 1.5× | Attracts clicks, low conversion → **pause or fix** |
| 🔵 **Hook Winner** | `creative_hook_winner` | High CTR + high reach, low revenue | Good attention, needs better offer/LP |
| ⚫ **Weak** | `weak_attention` | Score < 0.25 | Underperforming |
| ⚪ **Needs Data** | `needs_more_data` | Spend < ₹500 OR impressions < 1,000 | Insufficient data for classification |

### 4. **Response Format**

The chat displays:
- **Tag leaderboard** (if asking about tags) with sortable columns: Signal · Category · Score · Spend · ROAS · CTR · Orders
- **Ad performance table** (if asking about ads) with tag chips, placement/platform breakdown
- **Funnel visualization** (if asking about video flow) with stage pass-rates and biggest gap highlighted red
- **KPI cards** summarizing counts: Tags Scored, Strong Winners, Misleading Hooks, Converters

---

## Example Conversations

### Example 1: Finding Strong Winners
**You:** "What are our strongest neuro tags this month?"
```
Chat: Let me fetch the Creative IQ analysis for this month.
[Tool: getCreativeIQAnalysis(startDate='2026-05-01', endDate='2026-06-08')]

Returns: 42 tags scored, 8 strong winners
  - humor_wholesome: ROAS 3.2× (₹150K spend, 8.5% CTR)
  - urgency_fomo: ROAS 2.8× (₹210K spend, 7.2% CTR)
  - [5 more strong winners...]
```
**Insight:** These two tags drive disproportionate value — double down on creative brief & spend allocation.

### Example 2: Spotting Misleading Hooks
**You:** "Show me misleading hooks."
```
Chat: Found 3 tags with high CTR but low ROAS:
  - novelty_shock: 10.2% CTR but ROAS 1.1× (₹80K spend)
  - curiosity_gap: 9.8% CTR but ROAS 0.9× (₹65K spend)
  - surprise_unexpected: 11.5% CTR but ROAS 1.3× (₹95K spend)

⚠️ These drive clicks but don't convert. Action:
  - Review landing page (LPV→Checkout drop-off)
  - Or pause to save ₹240K/month
```

### Example 3: Video Funnel Analysis
**You:** "Show me the video funnel for the humor_wholesome tag."
```
Chat: Video retention for humor_wholesome (₹150K spend):
  
  Impressions ━━━━━━━━━━━━━━━━━━━ 2.1M (100%)
  3s Views   ━━━━━━━━━━━━━━━━━━━ 340K (16.2%)  Hook rate = 16.2%
  25% Hold   ━━━━━━━━━━━━━━━━━━━ 280K (82.4%)
  50% View   ━━━━━━━━━━━━━━━━━━━ 210K (75.0%)  ← Biggest gap: 25% drop
  75% View   ━━━━━━━━━━━━━━━━━━━ 180K (85.7%)
  100% View  ━━━━━━━━━━━━━━━━━━━ 160K (88.9%)
  Link Click ━━━━━━━━━━━━━━━━━━━ 24K  (1.1%)
  Order      ━━━━━━━━━━━━━━━━━━━ 310  (1.3% of clicks)

Insight: Strong hook → excellent completion (88.9%) but CTR bottleneck. 
  → CTA placement or link copy needs test.
```

### Example 4: Category Spending Breakdown
**You:** "Which creative categories are we spending most on?"
```
Chat: Spend by neuro category (split-credit):

  motivational      ₹450K  (28%)  Revenue: ₹1.1L  (ROAS 2.4×)
  humor             ₹380K  (24%)  Revenue: ₹1.3L  (ROAS 3.4×) ✓
  urgency           ₹290K  (18%)  Revenue: ₹580K  (ROAS 2.0×)
  social_proof      ₹210K  (13%)  Revenue: ₹180K  (ROAS 0.9×) ⚠️
  curiosity         ₹160K  (10%)  Revenue: ₹320K  (ROAS 2.0×)
  
Recommendation: Reduce social_proof (underperforming), shift to humor (best ROAS).
```

---

## Key Metrics Explained

### Attribution & Spend Models
- **Split-Credit Spend** (`spend_sc`) — Portion of ad spend attributed to each tag when an ad has multiple tags
- **Full-Credit Spend** (`spend_fc`) — Full ad spend attributed to each tag (useful for cap budgets per tag)
- **Real Attribution** — Warehouse-based last-touch orders (not Meta pixel, which overcounts 3–4×)

### Performance Ratios
| Metric | Formula | What It Means |
|--------|---------|---------------|
| **ROAS** | net_revenue ÷ spend | Revenue per rupee spent; 2.5× = healthy |
| **CTR** | clicks ÷ impressions | Click-through rate; 2.5%+ = strong hook |
| **CPC** | spend ÷ clicks | Cost per click; lower = more efficient |
| **CPA** | spend ÷ orders | Cost per attributed order |
| **Hook Rate** | 3s_views ÷ impressions | % that scroll-stopped; drives initial appeal |
| **Completion Rate** | 100%_views ÷ impressions | % that watched full video; measures satisfaction |

### Funnel Stages (Per-Ad Attribution)
1. **Reach** — unique accounts shown the ad
2. **Impressions** — total times served
3. **3s Views (Hook)** — scroll-stopped for 3+ seconds
4. **Video Depths** — 25%, 50%, 75%, 100% completion rates
5. **Link Clicks** — CTR
6. **Orders** — real warehouse-attributed conversions

---

## API Reference

### Endpoint: `POST /api/chat/creative-iq`

**Request:**
```json
{
  "startDate": "2026-05-01",
  "endDate": "2026-06-08",
  "tagCode": "humor_wholesome",  // optional
  "adId": "12345",               // optional (Meta ad ID)
  "includeFunnel": true          // optional (default: true)
}
```

**Response:**
```json
{
  "rows": [
    {
      "_type": "tag",
      "tag_code": "humor_wholesome",
      "hack_name": "Humor: Wholesome",
      "category_name": "humor",
      "score": 0.82,
      "classification": "strong_winner",
      "spend_sc": 150000,
      "roas": 3.2,
      "ctr": 0.085,
      "hook_rate": 16.2,
      "attributed_orders": 310,
      "net_revenue_sc": 480000
    },
    {
      "_type": "funnel_totals",
      "reach": 12000000,
      "impressions": 18000000,
      "video_views": 2100000,
      "video_p25": 1840000,
      "video_p50": 1470000,
      "link_clicks": 180000,
      "orders": 2340,
      "spend": 3200000,
      "roas": 2.15
    },
    // ... more rows
  ],
  "metadata": {
    "tagsScored": 42,
    "strongWinners": 8,
    "misleadingHooks": 3,
    "converters": 12,
    "totalSpend": 3200000,
    "topTag": "humor_wholesome"
  }
}
```

---

## Implementation Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/chat/tools/creative-iq-tools.ts` | Tool definition + instructions |
| `apps/web/src/app/api/chat/creative-iq/route.ts` | Backend API handler |
| `apps/web/src/lib/chat/tools/index.ts` | Tool registration (updated) |
| `apps/web/src/lib/chat/system-prompt.ts` | System prompt with Creative IQ guidance (updated) |

---

## Troubleshooting

### "Chat doesn't recognize creative/tag questions"
- Ensure `getCreativeIQInstructions()` is included in `buildDomainInstructions()`
- Check that `createCreativeIQTools()` is exported in tools/index.ts

### "API returns 500 error"
- Verify Cube datasource connection (check `CUBE_MCP_URL`, `SELERIC_API_KEY` env vars)
- Check that queries can fetch from `meta_neurotag_analysis` and `meta_ad_performance` cubes

### "Results show old data"
- Creative IQ data is cached via `revalidate: 300` (5 minutes) on the `/ads/neurotag` page
- The chat API fetches fresh data on each request; if you want updated data, click the chat "Refresh" button

---

## Tips for Best Results

1. **Be specific with date ranges** — "last 7 days", "this month", "since May 1st"
2. **Ask one question at a time** — Chat works best with focused queries
3. **Use tag names or codes** — The chat understands "humor", "urgency_fomo", "social_proof", etc.
4. **Compare metrics side-by-side** — "Show me ROAS vs CTR by tag" → scatter plot with outliers labeled
5. **Look for actionable insights** — "Which misleading hooks should we pause?" → clear list with savings estimate

---

## What's Next?

- **Extend to multi-channel** — Add Google Ads, Pinterest, TikTok neuro-tag analysis
- **Build predictive scoring** — Forecast tag performance based on historical patterns
- **Create playbooks** — "If misleading_hook, then [action]" automation
- **Monitor continuously** — Set alerts for strong winners reaching budget caps
