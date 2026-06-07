# Testing & Verification Checklist

## ✅ What Was Implemented

Your chat can now answer Creative IQ questions with real data. Here's what to test.

---

## 🧪 Test Cases

### Test 1: Strong Winners Query
```
STEP 1: In chat, ask:
"Which neuro tags are strong winners?"

EXPECTED RESULT:
✓ KPI card shows "Strong Winners: 8" (or some number > 0)
✓ Leaderboard appears with columns: Tag, Score, Spend, ROAS, CTR
✓ At least 1 tag with classification = "strong_winner" (CTR ≥ 2.5% AND ROAS ≥ 2.5×)
✓ ROAS values are colored green (≥ 2.5×)

TIMEOUT: Should load within 10 seconds
```

### Test 2: Misleading Hooks
```
STEP 1: In chat, ask:
"Show misleading hooks"

EXPECTED RESULT:
✓ KPI card shows "Misleading Hooks: X" 
✓ If X > 0: Red-flagged table with tags showing high CTR but low ROAS
✓ Each tag shows: CTR ≥ 2.5% AND ROAS ≤ 1.5×
✓ ROAS colored red (< 1.5×)
✓ If X = 0: Message "No misleading hooks detected"

TIMEOUT: Should load within 10 seconds
```

### Test 3: Video Funnel for Single Tag
```
STEP 1: In chat, ask:
"Show me the video funnel for humor tag"

EXPECTED RESULT:
✓ Funnel visualization appears with stages:
  - Impressions
  - 3s Views (hook rate)
  - 25% Viewed
  - 50% Viewed
  - 75% Viewed
  - 100% Viewed
  - Link Clicks (CTR)
  - Orders
✓ Each bar shows count + % of previous stage
✓ Biggest drop flagged red
✓ Metrics summary: scroll-stop rate, completion rate, cost/thruplay

TIMEOUT: Should load within 10 seconds
```

### Test 4: Ad Performance by Tag
```
STEP 1: In chat, ask:
"Show ad performance for humor tag"

EXPECTED RESULT:
✓ Table of ads using that tag
✓ Columns: Ad Name, Tags, Spend, Hook%, CTR, ROAS, Orders, CPA
✓ Sortable headers
✓ Expandable rows (if UI supports)

TIMEOUT: Should load within 10 seconds
```

### Test 5: API Direct Call (Optional)
```
STEP 1: Open terminal, run:
curl -X POST http://localhost:3000/api/chat/creative-iq \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-05-01",
    "endDate": "2026-06-08"
  }'

EXPECTED RESULT:
✓ HTTP 200 OK
✓ JSON response with:
  {
    "rows": [
      { "_type": "tag", ... },
      { "_type": "funnel_totals", ... },
      ...
    ],
    "metadata": {
      "tagsScored": <number>,
      "strongWinners": <number>,
      "misleadingHooks": <number>,
      ...
    }
  }
✓ At least 3+ rows returned

TIMEOUT: Should complete within 30 seconds
```

---

## 🔧 Troubleshooting

### Issue: Chat doesn't recognize "creative" questions
**Diagnosis:**
- Open browser DevTools → Console
- Check if errors appear when asking creative question

**Fix:**
1. Verify `createCreativeIQTools()` is exported from `tools/index.ts`
2. Verify `getCreativeIQInstructions()` is included in `buildDomainInstructions()`
3. Clear chat history & refresh page
4. Try exact phrases: "neuro tags", "misleading hooks", "video funnel"

---

### Issue: API returns 500 error
**Diagnosis:**
- Check server logs for error message
- Verify Cube connection

**Fix:**
1. Check `.env` has `CUBE_MCP_URL` and `SELERIC_API_KEY`
2. Test Cube directly:
   ```bash
   curl -H "Authorization: Bearer $SELERIC_API_KEY" \
     "$CUBE_MCP_URL/api/v1/graphql" -d '{"query":"..."}'
   ```
3. Verify Cube datasource has tables:
   - `meta_neurotag_analysis`
   - `meta_ad_performance`
   - `order_attribution`

---

### Issue: Results show old data
**Diagnosis:**
- Dashboard page has 5-min cache (`revalidate: 300`)
- Chat API fetches fresh on each request

**Fix:**
- Chat results should be fresh every time
- If stale: try different date range, or hardrefresh (Ctrl+Shift+R)

---

### Issue: "Cannot find name 'process'" TypeScript error
**Diagnosis:**
- Missing @types/node in compilation

**Fix:**
- This should not occur in development (Next.js handles it)
- If building standalone: ensure `tsconfig.json` has `"dom", "es2015"` in lib

---

## 📋 Verification Checklist

Before considering the integration complete:

- [ ] Chat responds to "Which tags are strong winners?" query
- [ ] Strong winners table displays with ≥1 entry
- [ ] ROAS column is colored appropriately (green ≥ 2.5×, red < 1.5×)
- [ ] Misleading hooks query works (shows red-flagged tags or "none")
- [ ] Video funnel query shows all 8 stages with pass rates
- [ ] Tag-filtering works: ask "Show humor tag performance"
- [ ] Date range filtering works: ask "Show winners for last 7 days"
- [ ] API endpoint responds to POST request
- [ ] Metadata counts match results (tagsScored = number of tags returned)
- [ ] No console errors when running queries
- [ ] Chat displays KPI cards + charts (not just raw JSON)
- [ ] Narrative insight appears below charts (3-6 bullets)

---

## 📊 Expected Results (Sample Data)

If your Cube has data, you should see something like:

### KPI Cards
```
Tags Scored: 42          Strong Winners: 8
Misleading Hooks: 3      Converters: 12
```

### Tag Leaderboard (Sample)
```
Tag                  Score   Spend      ROAS   CTR    Hook%
─────────────────────────────────────────────────────────────
humor_wholesome      0.82   ₹150K      3.2×   8.5%   16.2%
urgency_fomo         0.78   ₹210K      2.8×   7.2%   14.5%
motivational_hero    0.71   ₹120K      2.4×   6.8%   13.2%
social_proof_stats   0.65   ₹95K       2.1×   6.2%   12.1%
...
```

### Video Funnel (Sample)
```
Impressions  ━━━━━━━━━━━━━━━━━━━━━ 2.1M  (100%)
3s Views     ━━━━━━━━━━━━━━━━━━    340K  (16.2%)
25% Hold     ━━━━━━━━━━━━━━━━━━    280K  (82.4%)
50% View     ━━━━━━━━━━━━━━━━━     210K  (75.0%) ← Gap
75% View     ━━━━━━━━━━━━━━━━━━    180K  (85.7%)
100% View    ━━━━━━━━━━━━━━━━━━    160K  (88.9%)
Link Clicks  ━━━━━━━━━━━━━━        24K   (1.1%)
Orders       ━━━                   310   (1.3% of clicks)

Cost/Thruplay: ₹485
```

---

## 🚀 Performance Expectations

| Operation | Expected Time |
|-----------|---------------|
| Query strong winners | 2-5 seconds |
| Fetch misleading hooks | 2-5 seconds |
| Video funnel for 1 tag | 3-8 seconds |
| API direct call | 5-15 seconds |
| Full page load | 10-20 seconds (if Cube is responsive) |

*Slower if Cube datasource is under heavy load or network is slow.*

---

## 📝 Logs to Check

If something goes wrong, check server logs for:

```
[creative-iq-analysis] startDate: 2026-05-01, endDate: 2026-06-08, ...
```

or

```
[creative-iq-analysis-error] error: "...", stack: "..."
```

These are logged via `serverLog()` in `route.ts`.

---

## 🎯 Success Criteria

✅ **Integration is successful if:**
1. Chat responds to creative/tag questions (doesn't ignore them)
2. Data is fetched from Cube (not returning empty results unless Cube has no data)
3. Tags are scored & classified correctly
4. Results match the expected format (KPI cards + table/funnel)
5. No TypeScript errors in the web app build
6. API endpoint responds successfully (HTTP 200)
7. Performance is acceptable (< 10 seconds per query in chat)

---

## 📞 Support

If tests fail:
1. **Check logs** — server logs + browser DevTools console
2. **Verify Cube** — can you query it directly?
3. **Check env** — is `CUBE_MCP_URL` set correctly?
4. **Read docs** — `docs/CHAT_CREATIVE_IQ_INTEGRATION.md` has troubleshooting section
5. **Review code** — verify `tools/index.ts` exports the new tool
