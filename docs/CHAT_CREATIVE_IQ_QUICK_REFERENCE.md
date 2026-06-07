# Creative IQ Chat — Quick Reference

## 🎯 What You Can Ask

### Tags & Performance
```
"Which neuro tags are strong winners?"
"Show me misleading hooks"
"What's the top performing tag?"
"Which tags should we increase spend on?"
"Compare CTR vs ROAS by tag"
```

### Video Funnel
```
"Show me the video funnel for humor tag"
"What's our biggest funnel dropoff stage?"
"Compare hook rates across tags"
"Which tag has the best completion rate?"
```

### Ad Performance
```
"Which ads have the highest ROAS?"
"Show ad performance for [ad ID]"
"Ad performance by tag for [tag name]"
"Which ads are misleading hooks?"
```

### Spend & Budget
```
"How much are we spending per category?"
"Show spend trend by tag"
"Which categories drive the most revenue?"
"Where should we shift budget?"
```

---

## 📊 Tag Classifications (What They Mean)

| Badge | Meaning | Action |
|-------|---------|--------|
| 🟢 **Strong Winner** | High CTR + High ROAS | **Increase spend** |
| 🟦 **Converter** | High ROAS, Low CTR | **Optimize hook/CTA** |
| 🔴 **Misleading Hook** | High CTR, Low ROAS | **Pause or fix landing page** |
| 🔵 **Hook Winner** | High attention, Low revenue | **Test better offer** |
| ⚫ **Weak** | Low across all metrics | **Pause** |
| ⚪ **Needs Data** | Too low spend/impressions | **Run longer** |

---

## 📈 Key Metrics at a Glance

| Metric | Target | What It Is |
|--------|--------|-----------|
| **ROAS** | ≥ 2.5× | Revenue per rupee spent |
| **CTR** | ≥ 2.5% | % of viewers who clicked |
| **Hook Rate** | ≥ 15% | % who stopped at 3 seconds |
| **Completion** | ≥ 85% | % who watched full video |
| **CPA** | ÷ AOV | Cost per attributed order |
| **Spend** | ₹ 500 min | Minimum for reliable classification |

---

## 🚀 Common Workflows

### 1. Find & Allocate Budget to Winners
```
You: "Show me strong winners"
Chat: Returns 8 strong tags with spend & ROAS
You: "Increase spend on humor_wholesome by 50%"
Action: Create new ad with same neuro tags, launch
```

### 2. Debug Underperforming Tags
```
You: "Why is social_proof underperforming?"
Chat: Shows video funnel, identifies 60% drop at 25% watch
You: "The hook is weak. Let's test 3 new creatives."
Action: New briefs focusing on stronger opening
```

### 3. Catch Misleading Hooks
```
You: "Show misleading hooks"
Chat: novelty_shock has 11% CTR but 0.9× ROAS
Action: Pause immediately (save ₹80K/month), test LP variants
```

### 4. Optimize Spend Distribution
```
You: "Spend by category"
Chat: humor (3.4× ROAS) vs social_proof (0.9× ROAS)
You: "Shift 50% from social_proof to humor"
Action: Reallocate ₹210K → humor briefs
```

---

## ⚡ Pro Tips

✅ **Do:**
- Ask one question at a time
- Use specific date ranges ("last 7 days", not "recent")
- Check both ROAS *and* spend (high ROAS on ₹50K ≠ ₹500K)
- Use tag codes: "humor", "urgency_fomo", "social_proof"
- Look for patterns across video stages (hook → 50% → completion)

❌ **Don't:**
- Trust tags with spend < ₹500 (too noisy)
- Judge CTR in isolation (misleading hooks trap!)
- Pause a tag after 1–2 days (need ≥ 1K impressions min)
- Mix platform/placement metrics (cross-contamination)

---

## 🔌 Behind the Scenes

When you ask, the chat:
1. **Detects** it's a creative/tag question (vs P&L question)
2. **Calls** `getCreativeIQAnalysis` tool
3. **Fetches** from `/api/chat/creative-iq` endpoint
4. **Scores** each tag (revenue + ROAS + CTR + hook + order rate + confidence)
5. **Classifies** as strong_winner / converter / misleading_hook / etc.
6. **Returns** sorted results with KPI cards + charts

Data sources:
- `meta_ad_performance` — video funnel, spend, delivery
- `meta_neurotag_analysis` — tag mapping, split-credit metrics
- `order_attribution` — real warehouse-attributed orders (not Meta pixel)

---

## 📝 Response Format

You'll see:
- **KPI Cards** at top: Tags Scored, Strong Winners, Misleading Hooks, Total Spend
- **Leaderboard Table** (if asking about tags): sortable by Signal, Score, ROAS, CTR
- **Funnel Chart** (if asking about video flow): stage-by-stage drop-off with % pass rates
- **Narrative Insight** below: 3–6 bullet points with actionable recommendations

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| "Chat doesn't recognize my question" | Use keywords: tag, creative, neuro, funnel, hook, completion |
| "No results returned" | Check date range has data; some tags may be <₹500 spend |
| "Old data showing" | Chat fetches fresh each time; refresh browser if needed |
| "API error 500" | Check Cube connection (CUBE_MCP_URL, SELERIC_API_KEY env) |

---

## 📚 Related Docs

- **Full Creative IQ guide:** `docs/CREATIVE_IQ_MODULE.md`
- **Integration details:** `docs/CHAT_CREATIVE_IQ_INTEGRATION.md`
- **Calculation glossary:** `docs/calculation_and_queries/BUSINESS_CALCULATIONS_GLOSSARY.md`
