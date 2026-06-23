# Geo-Allocation Decision Algorithm — Pseudocode Reference

This doc describes exactly how the system goes from raw data to a SCALE / PAUSE /
LAUNCH / SWITCH_PRODUCT / HOLD decision for each city × product × campaign row.
Written for inspection and fixing — every data point, every formula, every branch.

---

## Overview

```
for each (city, product, campaign) row:
    1. collect_inputs(city, product, campaign)
    2. compute_six_scores(inputs)
    3. composite_score = weighted_sum(six_scores)
    4. action = evaluate_rules(composite_score, inputs)
    5. emit(city, product, campaign, composite_score, action, reason)
```

---

## Step 1 — Input Collection

Four data sources are fetched once and joined in memory before scoring.

### 1a. Sales Velocity  (`mart_city_product_sales`)

```
for each (city, product):
    orders_7d  = SUM(orders)  WHERE order_date in [report_date - 7d .. report_date]
    orders_30d = SUM(orders)  WHERE order_date in [report_date - 30d .. report_date]
```

Only rows with `orders_7d > 0` are kept (no dead cities).

### 1b. Campaign Performance  (`mart_city_campaign_attributed`)

```
for each (city, product, campaign, adset):
    attributed_orders    = SUM(attributed_orders)   over last 7d
    attributed_revenue   = SUM(attributed_revenue)  over last 7d
    effective_city_spend = SUM(effective_city_spend) over last 7d

    roas = attributed_revenue / effective_city_spend  (0 if spend == 0)
```

> NOTE: `effective_city_spend` is a pre-aggregated expression inside the
> ClickHouse view, so outer GROUP BY causes ILLEGAL_AGGREGATION (Code 184).
> Fix: fetch raw per-day rows (no GROUP BY in SQL), aggregate across order_date
> in Python. This is currently implemented correctly.

Rows where `attributed_orders == 0` after aggregation are dropped.

### 1c. Season Map  (`dim_th_sku_seasonal_map`)

```
for each product:
    primary_season = any(season)        -- e.g. "Monsoon", "Summer", "All Seasons"
    stock_status   = any(stock_status)  -- "OK" | "LOW" | "CRITICAL_LOW" | "OOS"
```

> NOTE: `can_advertise` column is typed NOTHING (all nulls) — never use it.
> Stock guard uses `stock_status` instead.

### 1d. Adset Geo  (`dim_adset_geo`)

```
for each adset_id:
    is_broad_advantage = any(is_broad_advantage)   -- 0 or 1
    included_cities    = any(included_cities)       -- Array(String)
```

Broad Advantage flag means Meta is running the adset without explicit geo
targeting. If a city converts under this adset but is NOT in `included_cities`,
it is a "free discovery" signal.

### 1e. Weather  (`fct_city_weather_day`)

```
for each city:
    weather_stage = lookup by canonical_city_name on report_date
                    (falls back to report_date - 1 if today not yet ingested)
                    (returns "UNKNOWN" if city not in weather DB)
```

City name normalisation before lookup:

```
canonical_city_name =
    if lower(trim(city)) in WEATHER_CITY_VARIANTS:
        WEATHER_CITY_VARIANTS[lower(trim(city))]   -- e.g. "mumbai subueban" → "Mumbai"
    else:
        city.strip().title()                        -- e.g. "MUMBAI" → "Mumbai"
```

Current variant map covers: Mumbai Subueban, Navi Mumbai, Thane, Bengaluru,
Bengaluru Urban, Gurugram, Noida, Ghaziabad, Faridabad, New Delhi,
Secunderabad, Howrah, North 24 Parganas.
Cities outside this list that don't have exact match → `weather_stage = "UNKNOWN"`.

---

## Step 2 — Pre-Join: Product Name Resolution

`mart_city_campaign_attributed.product_name` carries full Shopify titles:
  `"TrimEase Paw Trimmer 🐾 Silent, Precise Grooming for Dogs & Cats"`

`dim_th_sku_seasonal_map.product_name` carries short canonical names:
  `"TrimEase Paw Trimmer"`

Resolution algorithm (applied before merge):

```
function resolve_canonical_name(full_title, canonical_names_list):
    best = ""

    # Pass 1: prefix match (most specific)
    for name in canonical_names_list:
        if full_title.startswith(name) and len(name) > len(best):
            best = name

    # Pass 2: substring match (fallback)
    if best == "":
        for name in canonical_names_list:
            if name in full_title and len(name) > len(best):
                best = name

    return best if best != "" else full_title   -- unresolved → keep original
```

Applied to both `df_sales.product_name` and `df_camp.product_name` before joining.

---

## Step 3 — Six Scoring Components (all produce 0–100)

### 3a. Sales Velocity Score

```
baseline = max(orders_30d / (lookback_days_baseline / lookback_days_velocity), 1.0)
         = max(orders_30d / (30 / 7), 1.0)
         = max(orders_30d / 4.286, 1.0)
         -- baseline = average 7-day window inside the 30-day period

velocity_ratio = orders_7d / baseline

sales_velocity_score = min(velocity_ratio / velocity_norm_cap, 1.0) × 100
                     -- velocity_norm_cap = 3.0  (3× baseline = score 100)
```

**Interpretation:**
- velocity_ratio = 1.0 → performing at baseline → score 33
- velocity_ratio = 3.0 → 3× baseline → score 100
- velocity_ratio < 1.0 → declining → score < 33

**Current issue to consider:** baseline uses `orders_30d / 4.286` which assumes
uniform daily distribution. A city that had all its sales in the first 3 weeks
and went quiet will show a low 7d score against a high 30d baseline. The
baseline could alternatively use the prior-7d window (orders day -14 to day -8)
for a more recent comparison.

### 3b. Campaign ROAS Score

```
roas = attributed_revenue / effective_city_spend   (0 if spend == 0)

campaign_roas_score = min(roas / roas_norm_cap, 1.0) × 100
                    -- roas_norm_cap = 5.0  (5x ROAS = score 100)
```

**Interpretation:**
- roas = 0 → score 0
- roas = 2.5 (target) → score 50
- roas = 5.0 (cap) → score 100
- roas > 5.0 → capped at 100

**Current note:** rows with `effective_city_spend == 0` (no spend in this city
for this campaign) get roas = 0 → roas_score = 0. These rows can still SCALE
if sales_velocity is high, or LAUNCH if score ≥ 70 and no spend.

### 3c. Season Match Score

```
if primary_season == current_season:          -- e.g. "Monsoon" == "Monsoon"
    season_score = 100
elif primary_season in ("All Seasons", "all_seasons"):
    season_score = 80
else:                                          -- wrong season product
    season_score = 20
```

`current_season` is set in `geo_campaign_rules.yaml → global.current_season`.

**Current note:** Off-season products (score 20) can still SCALE if ROAS and
velocity are both very high — the weighted composite can still reach 70 without
full season score. Whether this is desired is a tuning question.

### 3d. Inventory Score

```
block_statuses = ["OOS", "CRITICAL_LOW"]

if stock_status.upper() in block_statuses:
    inventory_score = 0     -- hard block
    inventory_ok    = False
else:
    inventory_score = 100   -- OK or LOW (still has stock)
    inventory_ok    = True
```

`inventory_ok` is also used as a **hard gate** in SCALE and LAUNCH rules —
even if composite_score is high, blocked inventory prevents those actions.

### 3e. Broad Discovery Score

```
geo_info        = adset_geo[adset_id]   (or empty if adset not in dim_adset_geo)
is_broad        = geo_info.is_broad_advantage     (bool)
included_cities = geo_info.included_cities        (set of city strings)

city_in_explicit = any(c.strip().lower() == city.strip().lower()
                       for c in included_cities)

broad_flag  = 1  if (is_broad AND NOT city_in_explicit)  else 0
broad_score = 100 if broad_flag == 1  else 0
```

**Interpretation:** This signals that Meta found this city organically through
Broad Advantage targeting — the city was NOT explicitly included in the adset's
geo targeting. A positive broad_flag means the algorithm should note this as an
expansion opportunity.

**Current note:** `broad_discovery` has weight 0.05 (5% of score). With score 100,
it contributes at most 5 points. Its main value is as a filter/flag on the report,
not as a primary score driver. The `broad_discovery_flag` column in the mart is
the actionable signal, not the score component.

### 3f. Weather Score

```
weather_score = weather_scores_map[weather_stage]

weather_scores_map = {
    "RAIN_ACTIVE":    100,
    "RAIN_EMERGING":   75,
    "HUMIDITY_HIGH":   60,
    "RAIN_DECLINING":  40,
    "HEAT_HIGH":       30,
    "COLD_HIGH":       20,
    "DRY":             20,
    "UNKNOWN":         20,
}
```

**Current note:** UNKNOWN scores the same as DRY/COLD_HIGH (20). For cities
outside the 28-city weather DB (183 rows today), this suppresses the weather
component but doesn't zero it. Weather weight is 0.15 so UNKNOWN costs the row
up to 12 points vs a RAIN_ACTIVE city. This is a reasonable penalty for
missing data but worth revisiting if many important cities are UNKNOWN.

---

## Step 4 — Composite Score

```
w = scoring_weights from geo_campaign_rules.yaml

opportunity_score = round(
    w.sales_velocity  × sales_velocity_score   +   -- 0.30
    w.campaign_roas   × campaign_roas_score    +   -- 0.25
    w.season_match    × season_match_score     +   -- 0.15
    w.inventory       × inventory_score        +   -- 0.10
    w.broad_discovery × broad_score            +   -- 0.05
    w.weather         × weather_score,             -- 0.15
    2)

-- weights must sum to 1.0; score range is 0.0 – 100.0
```

### Score ceiling examples

| Scenario | Score |
|----------|-------|
| All max (ROAS 5x, 3× velocity, Monsoon, stock OK, broad, RAIN_ACTIVE) | 100 |
| Good ROAS 3x, normal velocity, Monsoon, stock OK, no broad, RAIN_EMERGING | ~72 |
| High ROAS 4x, no velocity data, Monsoon, stock OK, no broad, RAIN_ACTIVE | ~57 |
| No ROAS (spend=0), good velocity, Monsoon, stock OK, no broad, DRY | ~45 |
| OOS product, any ROAS | max ~72 (inventory_score = 0 → -10 pts, but inventory_ok = False also blocks SCALE/LAUNCH) |

---

## Step 5 — Decision Rules (first match wins)

```
signal_orders = max(orders_7d, attributed_orders)
-- uses total city sales as a proxy for signal strength because
-- attributed_orders (Meta-only) is often < 3 even when city has real demand

---

RULE 1: SCALE
    if opportunity_score >= scale.opportunity_score_gte    -- 70
   AND roas >= scale.campaign_roas_gte                     -- 2.5
   AND inventory_ok == True
   AND signal_orders >= global.min_orders_signal           -- 3
    → action = "SCALE"
    → budget_modifier = 1.25
    → reason includes: score, ROAS, orders, season, weather_stage

---

RULE 2: SWITCH_PRODUCT
    if weather_stage == switch_product.trigger_weather_stage   -- "RAIN_DECLINING"
   AND product_name in switch_product.from_products
       -- ["Rover Raincoat", "StormGuard Jacket", "ZephyrLite Vest"]
    → action = "SWITCH_PRODUCT"
    → budget_modifier = 0.0
    → reason = "Rain declining in {city}. Shift budget from {product} to: {to_products}"

---

RULE 3: LAUNCH
    if opportunity_score >= launch.opportunity_score_gte   -- 70
   AND effective_city_spend == 0                           -- no recent spend in this city
   AND inventory_ok == True
    → action = "LAUNCH"
    → budget_modifier = 1.0
    → reason includes: score, city, product, season, weather_stage

---

RULE 4: PAUSE
    if opportunity_score <= pause.opportunity_score_lte    -- 30
   AND roas <= pause.campaign_roas_lte                     -- 1.5
    → action = "PAUSE"
    → budget_modifier = 0.0
    → reason includes: score, ROAS, threshold

---

RULE 5: HOLD  (catch-all)
    → action = "HOLD"
    → budget_modifier = 1.0
    → reason = "no decisive signal, maintain current budget"
```

### Rule evaluation notes

**SCALE takes priority over SWITCH_PRODUCT.** If a rain-product is still
generating excellent ROAS during declining rain (ROAS ≥ 2.5, score ≥ 70),
it SCALEs rather than switches. SWITCH_PRODUCT only fires on products that
are not making the SCALE cut.

**LAUNCH fires even with roas = 0** (no spend in the city). The score can
still reach ≥ 70 if sales_velocity + season + weather are all strong. This
means the system can recommend launching a campaign in a city where the
product is already selling organically — which is correct intent.

**PAUSE requires BOTH score ≤ 30 AND roas ≤ 1.5.** A row with low score
but no spend (roas = 0) will PAUSE (0 ≤ 1.5 is true). A row with low score
but acceptable ROAS will HOLD. Consider whether a separate rule for
"low score + zero spend + low orders" is needed.

**HOLD is a residual.** Most rows (321/341 on 2026-06-23) end up here because:
- Score 30–70 range (not decisive either way)
- Has some spend but ROAS below 2.5 (not good enough to SCALE, not bad enough to PAUSE)

---

## Step 6 — Output Row

```
emit {
    report_date,
    brand_id,
    city, state,
    season          = primary_season,
    product_name,
    campaign_id, campaign_name,
    adset_id, adset_name,
    orders_7d,
    attributed_revenue,
    effective_city_spend,
    roas,

    -- score components (all 0–100)
    sales_velocity_score,
    campaign_roas_score,
    season_match_score,
    inventory_score,
    broad_discovery_flag,     -- 0 or 1 (not scaled to 100)
    weather_stage,
    weather_score,

    -- decision
    opportunity_score,        -- composite 0–100
    recommended_action,       -- SCALE | LAUNCH | SWITCH_PRODUCT | PAUSE | HOLD
    budget_modifier,          -- 0.0 | 1.0 | 1.25
    reason,                   -- human-readable string
}
```

Written to `gold.mart_geo_product_opportunity` (ReplacingMergeTree).
Re-running for the same `(report_date, brand_id, city, product_name, campaign_id)`
replaces the existing row on the next `OPTIMIZE TABLE FINAL` or when queried
with `SELECT ... FINAL`.

---

## Known Gaps / Things to Fix

1. **Baseline for velocity is 30d average, not prior-7d.**
   Using `orders_30d / 4.3` means a city that peaked 3 weeks ago has a high
   baseline and scores low even if it's trending up this week.
   Alternative: `baseline = orders_days_8_to_14` (the 7 days before the current window).

2. **PAUSE fires when roas = 0 AND score ≤ 30.**
   A city with zero spend and zero attributed revenue will always have roas = 0,
   which satisfies the PAUSE condition if score is also low. This could cause
   PAUSE on cities where the campaign simply hasn't been run yet (better action: LAUNCH or HOLD).
   Fix: add `AND effective_city_spend > 0` to the PAUSE rule.

3. **183 UNKNOWN weather cities (54% of rows today).**
   UNKNOWN scores the same as DRY (20), suppressing weather signal for cities
   outside the 28-city weather DB. Extend CITY_DB in `ingest_weather.py` or
   use state-level fallback (e.g., if city is in Maharashtra, use Mumbai's weather stage).

4. **Off-season products can still SCALE if ROAS is very high.**
   season_match_score = 20 for off-season. With weight 0.15, this costs 12 points
   vs an exact-match product. A row with ROAS 5x (roas_score 100) + 3× velocity
   (vel_score 100) + no weather data + stock OK can score 78 and SCALE.
   If this is undesired, add `AND primary_season in [current_season, "All Seasons"]`
   as a hard gate on SCALE.

5. **SWITCH_PRODUCT from_products list is hardcoded in YAML.**
   Currently: "Rover Raincoat", "StormGuard Jacket", "ZephyrLite Vest".
   If these product names don't exactly match `product_name` after canonical
   resolution, SWITCH_PRODUCT never fires. Verify the resolved names match.

6. **signal_orders uses max(orders_7d, attributed_orders).**
   This allows a city with high organic sales but no Meta attribution to SCALE.
   This is intentional (avoid under-counting), but means you may SCALE a
   campaign for a city that is already converting via other channels. Adding
   a spend-presence check (`effective_city_spend > 0`) to SCALE would ensure
   there's actually a Meta campaign to scale.

7. **No deduplication of city name variants before scoring.**
   "Mumbai" and "MUMBAI" and "Mumbai Subueban" are scored as separate rows and
   can all independently SCALE. The mart has no canonical city merge —
   each raw `ship_city` value is its own row. This inflates SCALE counts
   for large cities (Mumbai shows 3–4 rows). Normalising `city` to canonical
   form before GROUP BY in `fetch_campaign_perf` would fix this.

---

*All code references: `backend/scripts/build_geo_opportunity_mart.py` · `config/geo_campaign_rules.yaml`*
