# Creative IQ — Neuro Tag Analysis

**Route:** `/ads/neurotag` ([apps/web/src/app/ads/neurotag/page.tsx](../apps/web/src/app/ads/neurotag/page.tsx))
**Status:** Active
**Scope:** Creative-level Meta ads analysis — video funnel, neuro-tag scoring, per-ad/per-stage diagnostics

This module answers *which creatives and which psychological frames (neuro tags) move each step of the ad funnel*, and reconciles delivery/pixel metrics against **real warehouse-attributed** orders.

---

## 1. Data sources (cubes)

| Source | Alias | Role | Grain |
|---|---|---|---|
| `meta_ad_performance` | `AP` | Full video funnel + delivery metrics, spend, **pixel** purchases | one row per ad |
| `meta_neurotag_analysis` | `NT` | Ad → neuro-tag map, split-credit (`_sc`) / full-credit (`_fc`) tag metrics, video ratios | tag / ad×tag |
| `order_attribution` | `OA` | **Real warehouse** last-touch orders/revenue (joined on `lt_ad_id = ad_id`) | ad |

**Core principle** ([ad-funnel.ts](../apps/web/src/lib/dashboard/ad-funnel.ts)): the **Orders** outcome is *real* warehouse attribution (`order_attribution`), **not** Meta pixel. The pixel tail (LPV→ATC→Checkout→Purchase) overcounts ~3–4× and is intentionally excluded from this module — it belongs to the separate "PDP funnel" module. Join is on `ad_id` because `ad_name` is **not** unique (one name can map to several `ad_id`s).

**Server queries:**
- [queries/ad-funnel.ts](../apps/web/src/lib/dashboard/queries/ad-funnel.ts) — funnel rows, totals, tag map, category×stage, real attribution
- [queries/neurotag.ts](../apps/web/src/lib/dashboard/queries/neurotag.ts) — tag leaderboard, category breakdown, spend trend, ad leaderboard, ad→tag map

**Client logic:**
- [neurotag-scorer.ts](../apps/web/src/lib/dashboard/neurotag-scorer.ts) — tag scoring + classification
- [ad-funnel.ts](../apps/web/src/lib/dashboard/ad-funnel.ts) — stage model, per-stage scoring, per-ad labels, heatmap

---

## 2. Page-level KPI strip

Counts of tags by classification ([page.tsx:64-99](../apps/web/src/app/ads/neurotag/page.tsx#L64-L99)):

| Label | Calculation |
|---|---|
| **Tags scored** | count where `classification != needs_more_data` (of N unique active tags) |
| **Strong winners** | count where `classification == strong_winner` (sub: "ROAS ≥ 2.5×") |
| **Misleading hooks** | count where `classification == misleading_hook` (turns red if > 0) |
| **Converters** | count where `classification == conversion_winner` |

---

## 3. Tabs

Tab bar ([CreativeIQTabs.tsx:16-21](../apps/web/src/components/charts/CreativeIQTabs.tsx#L16-L21)):

| Key | Label | Description |
|---|---|---|
| `funnel` | **Funnel** | Per-stage winners & tags (default) |
| `tags` | **Tag View** | Score every neuro-tag |
| `ads` | **Ad View** | Per-ad with tag chips |
| `tagfunnel` | **Tag Funnel** | One tag's video retention |

---

### Tab 1 — Funnel (stage-centric ads funnel)

Components: [AdsFunnelView.tsx](../apps/web/src/components/charts/AdsFunnelView.tsx) + [TagStageHeatmap.tsx](../apps/web/src/components/charts/TagStageHeatmap.tsx)

**Stage model** ([ad-funnel.ts:26-43](../apps/web/src/lib/dashboard/ad-funnel.ts#L26-L43)) — top→bottom, each anchored to a `prev` stage for its pass-rate:

| Stage | Field | Prev | Kind | Hint |
|---|---|---|---|---|
| Reach | `reach` | — | audience | unique accounts reached |
| Impressions | `impressions` | reach | audience | total times shown |
| 3s Views | `video_views` | impressions | video | scroll-stop · the hook |
| 25% Viewed | `video_p25` | 3s | video | held past the hook |
| 50% Viewed | `video_p50` | 25% | video | mid-video retention |
| 75% Viewed | `video_p75` | 50% | video | deep retention |
| 100% Viewed | `video_p100` | 75% | video | watched to end |
| Thruplay | `thruplay` | **3s** (not 100%) | video | 15s+/complete · share of 3s, *not a sequential step* |
| Link Click | `link_clicks` | impressions | convert | CTR |
| Orders | `orders` | linkclick | convert | real warehouse-attributed · click→order |

> **Thruplay anchoring:** a sub-15s video "completes" before "100%" of a longer one, so anchoring to 100% would yield a meaningless >600% step. It is pinned to 3s views instead and **excluded** from gap detection (`VIDEO_GAP_KEYS` = `v3s, v25, v50, v75, v100`).

**Headline funnel bars** ([buildFunnelTotals](../apps/web/src/lib/dashboard/ad-funnel.ts#L219-L291)):
- **Bar width** = `count / impressions × 100` (`pctOfImpr`)
- **Right-side value** = `count / prevCount × 100` (`pctOfPrev`, the step pass-rate)
- **Biggest video drop** = lowest `pctOfPrev` among the 5 sequential video stages → flagged red as `isGap`
- **Frequency** = `impressions / reach`; **CPM** = `spend / impressions × 1000`
- **Orders / Revenue / ROAS** = real warehouse totals (`realOrders`, `realRevenue`, `realRevenue / spend`)

**Summary cards** ([AdsFunnelView.tsx:80-88](../apps/web/src/components/charts/AdsFunnelView.tsx#L80-L88)): Reach, Impressions, Frequency, Spend, **Orders** (last-touch), **Revenue** (ex-GST), **ROAS**, CPM. The three real-attribution cards get an emerald border.

**Per-stage detail** ([analyzeStage](../apps/web/src/lib/dashboard/ad-funnel.ts#L336-L439)) — runs on stage click:
- **Eligibility:** `spend ≥ 500` (`MIN_SPEND`), `count > 0`, and for rate stages `prevCount ≥ 50` (`MIN_PREV`)
- **Ad score** = `0.5·rateNorm + 0.35·volNorm + 0.15·confidence`
  - `rateNorm` = passRate ÷ max passRate (audience stages use volume share)
  - `volNorm` = count ÷ max count
  - `confidence` = `min(spend / 20,000, 1)` (`FULL_CONF_SPEND`)
- **Waste** = `confidence × (1 − rateNorm)` — budget that reached the step but failed it
- **"Worked" column** = top ads by score; **"Didn't work"** = top ads by waste
- **Tag rollup** = tags fanned out (each tag of a multi-tag ad inherits the ad's counts), scored the same way; weak-tags ranked by waste (rate stages only)

ROAS color thresholds: ≥2.5 green · ≥1.5 neutral · <1.5 red.

**Neuro category × stage heatmap** ([parseCategoryStageHeatmap](../apps/web/src/lib/dashboard/ad-funnel.ts#L517-L549)):
- Columns (`HEAT_STAGES`): **Hook 3s, 50%, 75%, 100%, CTR** (creative/delivery rates only)
- **Cell = lift** = `(rate − colAvg) / colAvg × 100`, where `colAvg` is the **spend-weighted** column average
- Green = over-indexes, red = under-indexes; intensity scales with |lift| up to ±30%, hidden if |lift| < 3%

---

### Tab 2 — Tag View

Components: [NeuroTagLeaderboard.tsx](../apps/web/src/components/charts/NeuroTagLeaderboard.tsx), HorizontalBarChart, TrendChart.

**Derived per-tag metrics** ([neurotag-scorer.ts:97-103](../apps/web/src/lib/dashboard/neurotag-scorer.ts#L97-L103)):
- `roas = net_revenue / spend`
- `ctr = clicks / impressions`, `link_ctr = link_clicks / impressions`
- `cpc = spend / clicks`, `cpa = spend / attributed_orders`, `orderRate = attributed_orders / clicks`

**Score** = weighted sum of max-normalized components ([:48-56, 109-121](../apps/web/src/lib/dashboard/neurotag-scorer.ts#L48-L56)):

| Component | Weight | Formula |
|---|---|---|
| revenue | 0.28 | `net_revenue / maxRev` |
| roas | 0.20 | `roas / maxRoas` |
| ctr | 0.18 | `ctr / maxCtr` |
| cpc_eff | 0.10 | `1 − cpc/maxCpc` (cheaper = better) |
| order_rate | 0.10 | `orderRate / maxOr` |
| hook | 0.08 | `hook_rate / maxHook` |
| confidence | 0.06 | fixed 0.8 |

**Classification** ([:123-133](../apps/web/src/lib/dashboard/neurotag-scorer.ts#L123-L133)) — gated by `spend ≥ 500` AND `impressions ≥ 1000`, else `needs_more_data`:

| Class | Badge | Rule |
|---|---|---|
| `misleading_hook` | **Mislead** (red) | CTR ≥ 2.5% AND ROAS ≤ 1.5× |
| `strong_winner` | **Strong** (emerald) | CTR ≥ 2.5% AND ROAS ≥ 2.5× (or score ≥ 0.65) |
| `conversion_winner` | **Converter** (teal) | ROAS ≥ 2.5× AND CTR < 2.5% (or score < 0.65 fallback) |
| `creative_hook_winner` | **Hook** (blue) | high CTR AND revenue < 15% of max |
| `weak_attention` | **Weak** (stone) | score < 0.25 |
| `needs_more_data` | **Data?** (slate) | below spend/impressions floors |

**Leaderboard columns:** Signal · Tag·Hack · Category · Score (×100) · Spend · ROAS · Hook % · CTR · CPA · Rev(SC) · Orders. Sortable; **split/full credit toggle** swaps `spend_sc` ↔ `spend_fc`. Clicking a row opens [AdDrawer](../apps/web/src/components/charts/NeuroTagLeaderboard.tsx#L50) → `/api/neurotag/ads?tag=…`, listing each ad with Spend, ROAS, CTR, Orders, CPA + "% of tag spend" bar.

**Side charts:**
- *Spend by category (split-credit)* — `spend_sc` vs `net_revenue_sc` per `category_name`
- *Daily spend trend* — split vs full credit over time
- *Misleading hooks* card (only when any exist) — high CTR (≥2.5%), low ROAS (≤1.5×)

---

### Tab 3 — Ad View

Component: [AdPerformanceTable.tsx](../apps/web/src/components/charts/AdPerformanceTable.tsx).

Pulls **all** ads from `meta_ad_performance` (tagged + untagged), joins NT tag chips. This tab's ROAS/orders use **pixel** `purchases`/`roas` (unlike the Funnel tab's real attribution).

- Derived: `ctr = clicks/impr`, `link_ctr = link_clicks/impr`, `cpa = spend/orders`
- **Columns:** Ad·Campaign · Tags · Spend · Hook% · CTR · ROAS · Orders · CPA (sortable, searchable by ad/campaign/tag)
- **Expand a row** → full neuro-tag list + Video Performance: Hook Rate, Completion (`hold_rate_p100`), Thruplay, ₹/Thruplay, Link Clicks, Purchase Value, ROAS
- Color thresholds: ROAS 2.5/1.5, Hook% 20/10

**Placement & Platform split** (in the expanded row) — [AdPlacementBreakdown.tsx](../apps/web/src/components/charts/AdPlacementBreakdown.tsx), lazily fetched per ad from [/api/ads/placement](../apps/web/src/app/api/ads/placement/route.ts):
- Source: **`gold__fct_meta_ads_breakdown_daily`** (the raw "all columns" view) filtered to `breakdown_type = placement` and the single `ad_id`. The curated `meta_ad_breakdown` cube drops `ad_id`; this raw view keeps it, so placement IS available at **ad grain**.
- Platform rollup chips (Instagram / Facebook / Audience Network / Threads, % of ad spend) + per-placement table: Spend · % of ad · Impr · CTR · Hook% (`video_views_3s/impr`) · Thruplay · Orders (pixel `purchases`) · CPA.
- ⚠️ This breakdown table has **no `purchase_value`** → **no revenue/ROAS at placement grain**; orders are Meta-pixel `purchases`. Never sum across `breakdown_type` values (~8× overcount) — only the `placement` slice is requested.

---

### Tab 4 — Tag Funnel (single-tag video retention)

Component: [VideoFunnelPanel.tsx](../apps/web/src/components/charts/VideoFunnelPanel.tsx) ([buildFunnel](../apps/web/src/components/charts/VideoFunnelPanel.tsx#L33)).

Reconstructs absolute counts from a tag's ratio measures:

| Step | Calculation |
|---|---|
| Impressions | `impressions` |
| 3s Stop | `hook_rate/100 × impr` |
| 15s Hold | `hold_rate_15s/100 × 3s_stop` |
| 50% View | `hold_rate_p50/100 × impr` |
| Thruplay | `thruplay` (raw) |
| Link Click | `link_clicks` |
| Order | `attributed_orders` |

Steps with 0 are dropped. **Biggest gap** = lowest `pctOfPrev` (excluding Impressions) → red bar "⚠ Biggest funnel gap — X% drop-off". Summary callout: Scroll-stop rate, Full completion, Cost/thruplay.

---

## 4. Two per-ad label systems (don't confuse them)

**A) Tag classification badges** (Tags / Tag-Funnel tabs) — the 6 `SignalClass` values in §3 Tab 2.

**B) Per-ad funnel labels** ([classifyAds](../apps/web/src/lib/dashboard/ad-funnel.ts#L457-L497), shown in the Funnel tab's ad cards) — compares each ad against **impression-weighted account averages**; an ad can carry multiple:

| Label | Color | Rule |
|---|---|---|
| **Hook winner** | blue | hook ≥ 1.15× avg AND held the hook (p25 ≥ 0.95× avg) |
| **Retention winner** | indigo | p75/3s ≥ 1.15× avg |
| **Conversion winner** | emerald | real CVR ≥ 1.15× avg OR ROAS ≥ 2.5× (AND orders ≥ 1) |
| **Clickbait risk** | red | strong attention (hook or CTR ≥ 1.15× avg) BUT didn't hold the hook |

Encodes the thesis: *"a hook that wins 3s but loses P25 isn't a true winner."* Eligibility: `spend ≥ 500` AND `impressions ≥ 1000`. Conversion strength uses **real** (warehouse) click→order rate / ROAS, never pixel.

---

## 5. Shared constants

| Constant | Value | Where |
|---|---|---|
| `MIN_SPEND` | ₹500 | both scorers |
| `MIN_IMPRESSIONS` | 1,000 | tag scorer |
| `MIN_PREV` | 50 | funnel rate-stage eligibility |
| `FULL_CONF_SPEND` | ₹20,000 | confidence saturation |
| `CTR_MISLEADING_FLOOR` | 2.5% | misleading-hook gate |
| `ROAS_MISLEADING_CEIL` | 1.5× | misleading-hook gate |
| ROAS color | 2.5 / 1.5 | green / neutral / red everywhere |

---

## 6. Pixel vs real attribution — quick reference

| Surface | Orders / ROAS source |
|---|---|
| Funnel tab (summary cards, Orders stage, ad cards) | **Real** warehouse (`order_attribution`, last-touch by `lt_ad_id`) |
| Tag View leaderboard / drawer | `meta_neurotag_analysis` attributed orders + net revenue (split-credit) |
| Ad View table | **Pixel** (`meta_ad_performance.purchases` / `.roas`) |
| Tag Funnel | `meta_neurotag_analysis` ratios + attributed orders |

Related: [GOLD_SEMANTIC_LAYER.md](./GOLD_SEMANTIC_LAYER.md) · [calculation_and_queries/BUSINESS_CALCULATIONS_GLOSSARY.md](./calculation_and_queries/BUSINESS_CALCULATIONS_GLOSSARY.md)
