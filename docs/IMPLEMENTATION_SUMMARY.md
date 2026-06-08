# Implementation Summary: Creative IQ Chat Integration

## What Was Built

Your chat feature now understands **Creative IQ queries** (neuro tags, ad performance, video funnels, creative insights) and returns real data with intelligent analysis.

---

## Files Created

### 1. Tool Definition
**File:** `apps/web/src/lib/chat/tools/creative-iq-tools.ts`

- **Exports:** 
  - `createCreativeIQTools()` — the `getCreativeIQAnalysis` tool
  - `getCreativeIQInstructions()` — system prompt guidance

- **Tool Schema:**
  ```typescript
  getCreativeIQAnalysis({
    startDate: string,
    endDate: string,
    tagCode?: string,       // e.g. "humor_wholesome"
    adId?: string,          // Meta ad ID
    includeFunnel?: boolean // default: true
  })
  ```

---

### 2. Backend API Handler
**File:** `apps/web/src/app/api/chat/creative-iq/route.ts`

- **Endpoint:** `POST /api/chat/creative-iq`
- **What it does:**
  1. Fetches neurotag data + ad funnel from Cube
  2. Scores each tag (weighted: revenue 28% + ROAS 20% + CTR 18% + CPC 10% + order rate 10% + hook 8% + confidence 6%)
  3. Classifies tags (strong_winner | conversion_winner | misleading_hook | creative_hook_winner | weak_attention | needs_more_data)
  4. Filters by tag code or ad ID if specified
  5. Returns rows + metadata (KPI counts)

- **Response:**
  ```json
  {
    "rows": [...tags, ...funnel_totals, ...ads, ...misleading_hooks],
    "metadata": {
      "tagsScored": 42,
      "strongWinners": 8,
      "misleadingHooks": 3,
      "converters": 12,
      "totalSpend": 3200000
    },
    "type": "creative_iq"
  }
  ```

---

### 3. Tool Registration
**File:** `apps/web/src/lib/chat/tools/index.ts` (updated)

Added imports & exports:
```typescript
import { createCreativeIQTools, getCreativeIQInstructions } from "./creative-iq-tools"

export function createChatTools(schema: SchemaCache) {
  return {
    // ... existing tools
    ...createCreativeIQTools(),  // ← NEW
  }
}

export function buildDomainInstructions(schema: SchemaCache): string {
  return [
    // ... existing instructions
    getCreativeIQInstructions(), // ← NEW
  ].join("\n\n")
}
```

---

### 4. System Prompt Update
**File:** `apps/web/src/lib/chat/system-prompt.ts` (updated)

Added instruction:
```
For questions about creatives, neuro tags, ad hooks, video completion, 
or psychological frames → use getCreativeIQAnalysis (not Cube query tools).
```

---

## Files Created for Documentation

1. **`docs/CHAT_CREATIVE_IQ_INTEGRATION.md`** (10.8K)
   - Comprehensive integration guide
   - Example conversations
   - API reference
   - Classification system explained
   - Troubleshooting section

2. **`docs/CHAT_CREATIVE_IQ_QUICK_REFERENCE.md`** (4.9K)
   - 1-page cheat sheet
   - Common workflows
   - Pro tips
   - Quick troubleshooting

---

## How It Works (User Perspective)

### Example 1: Ask About Winners
```
User: "Which neuro tags are strong winners?"

Chat detects: Creative IQ question
→ Calls: getCreativeIQAnalysis(startDate, endDate)
→ API fetches: tag scores + classifications
→ Returns: 42 tags scored, 8 strong winners

Display:
┌─ KPI Cards ──────────────────────────┐
│ Tags Scored: 42                       │
│ Strong Winners: 8                     │
│ Misleading Hooks: 3                   │
│ Converters: 12                        │
└───────────────────────────────────────┘

┌─ Tag Leaderboard ──────────────────────┐
│ Tag          │ Score │ ROAS │ CTR │ Spend │
├──────────────┼───────┼──────┼─────┼───────┤
│ humor_...    │  0.82 │ 3.2× │ 8.5%│ ₹150K │
│ urgency_...  │  0.78 │ 2.8× │ 7.2%│ ₹210K │
│ [6 more...] │       │      │     │       │
└──────────────────────────────────────────┘

Interpretation: 
- Humor + Urgency drive 3×+ ROAS
- Increase spend on both, test new briefs in these categories
```

### Example 2: Spot Misleading Hooks
```
User: "Show misleading hooks"

Display: 3 tags with high CTR but low ROAS
- novelty_shock: 10.2% CTR, 1.1× ROAS (₹80K spend)
- curiosity_gap: 9.8% CTR, 0.9× ROAS (₹65K spend)  
- surprise_unexpected: 11.5% CTR, 1.3× ROAS (₹95K spend)

⚠️ Action: Pause to save ₹240K/month, or test LP variants
```

---

## Data Flow

```
User asks about creatives
         ↓
Chat tool (getCreativeIQAnalysis)
         ↓
API: POST /api/chat/creative-iq
         ↓
Cube queries (fetchNeurotagData + fetchAdFunnelData)
         ├─ meta_neurotag_analysis (tag scores, splits)
         ├─ meta_ad_performance (video funnel, spend)
         └─ order_attribution (real warehouse orders)
         ↓
Tag scoring & classification (neurotag-scorer.ts)
         ↓
Filter by tag/ad (if specified)
         ↓
Return rows + metadata
         ↓
Chat displays: KPI cards + leaderboard/funnel/table
         ↓
LLM generates narrative insight (3-6 bullet points)
```

---

## Key Features

✅ **Smart Classification**
- Scores tags using 7-component weighted model
- 6 classifications: strong_winner, converter, misleading_hook, hook_winner, weak_attention, needs_more_data
- Eligibility gates: spend ≥ ₹500, impressions ≥ 1,000

✅ **Flexible Querying**
- Can filter by tag code (e.g. "humor_wholesome")
- Can filter by ad ID
- Optional funnel inclusion for light queries

✅ **Real Attribution**
- Uses warehouse-attributed orders (not Meta pixel, which overcounts 3–4×)
- Last-touch attribution by ad ID

✅ **Comprehensive Metrics**
- Video stages: hook (3s) → 25% → 50% → 75% → 100% → thruplay → CTR → orders
- Split-credit & full-credit spend tracking
- Per-tag: ROAS, CTR, CPC, CPA, order rate, hook rate, confidence

---

## Integration Points

| System | Integration |
|--------|-------------|
| **Cube** | Queries `meta_neurotag_analysis`, `meta_ad_performance`, `order_attribution` |
| **Dashboard** | Reuses scoring logic from `neurotag-scorer.ts` + `ad-funnel.ts` |
| **Chat system** | Integrated into tool registry + domain instructions |
| **Existing pages** | No changes to `/ads/neurotag` or other pages — chat-only feature |

---

## Testing the Integration

### 1. **In Chat UI**
```
Ask: "Which neuro tags are strong winners?"
Expected: KPI cards + leaderboard with ≥1 strong winner

Ask: "Show misleading hooks"
Expected: Red-flagged tags with high CTR, low ROAS

Ask: "Show the video funnel for humor tag"
Expected: Funnel visualization: impressions → 3s → 25% → ... → orders
```

### 2. **Via API**
```bash
curl -X POST http://localhost:3000/api/chat/creative-iq \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-05-01",
    "endDate": "2026-06-08",
    "includeFunnel": true
  }'

# Expected: JSON with rows + metadata
```

---

## Limitations & Notes

⚠️ **Known Constraints:**
- Requires live Cube connection (check `CUBE_MCP_URL` env var)
- Tag classification requires ≥ ₹500 spend + 1,000 impressions
- Video funnel ratios can be non-additive across tags when aggregating (don't use for multi-tag views)
- Placement breakdown (`/api/ads/placement`) not included in chat (can be added later)

📝 **Future Enhancements:**
- Add Google Ads neuro-tag analysis (when available)
- Multi-tag funnel comparison (complex due to ratios)
- Predictive scoring (next 7-day performance forecast)
- Alerts: "Strong winner reached budget cap" or "Misleading hook detected"

---

## How to Use

1. **In chat, ask about creatives:**
   - "Which tags are strong winners?"
   - "Show misleading hooks"
   - "Video funnel for humor tag"

2. **Chat automatically:**
   - Detects it's a Creative IQ question
   - Calls the tool
   - Fetches data from API
   - Displays KPI cards + charts + narrative

3. **Reference the guide:**
   - Quick reference: `docs/CHAT_CREATIVE_IQ_QUICK_REFERENCE.md`
   - Full details: `docs/CHAT_CREATIVE_IQ_INTEGRATION.md`

---

## Code Quality

✅ **TypeScript** — fully typed (except pre-existing build issues in approvals/route.ts)
✅ **Error handling** — API catches and logs errors with stack traces
✅ **Logging** — serverLog tracks all queries for debugging
✅ **Performance** — parallel fetches (neurotag + funnel) reduce latency
✅ **Reusable** — leverages existing queries + scoring functions from dashboard

---

## Next Steps

1. **Test in chat UI** — ask a creative question and verify results
2. **Check Cube connection** — if API returns 500, verify Cube datasource
3. **Read the guides** — `CHAT_CREATIVE_IQ_QUICK_REFERENCE.md` for common use cases
4. **Monitor usage** — check serverLog output for query patterns
5. **Extend** — add more domains (Google Ads, forecasting, alerts) as needed
