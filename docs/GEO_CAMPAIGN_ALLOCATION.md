# Geo-Campaign Allocation Module

Daily decision system that outputs **SCALE / PAUSE / LAUNCH / HOLD / SWITCH_PRODUCT** actions for every
city × product × campaign combination — wired to weather data and season context for the Tilting Heads
(brand 20) monsoon campaign.

---

## Table of Contents

1. [High-Level Design (HLD)](#1-high-level-design)
2. [Data Flow](#2-data-flow)
3. [Low-Level Design (LLD)](#3-low-level-design)
4. [Scoring Algorithm](#4-scoring-algorithm)
5. [Decision Rules](#5-decision-rules)
6. [Schema Reference](#6-schema-reference)
7. [Operations Runbook](#7-operations-runbook)
8. [Configuration Reference](#8-configuration-reference)
9. [Lead/Lag Analysis](#9-leadlag-analysis)

---

## 1. High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Sources                                 │
│                                                                     │
│  gold.mart_city_product_sales        gold.mart_city_campaign_       │
│  (city × product daily orders)       attributed (city × campaign    │
│                                       × product ROAS)               │
│  gold.dim_th_sku_seasonal_map        gold.dim_adset_geo             │
│  (season, stock_status per SKU)      (Broad Advantage flag)         │
│                                                                     │
│  gold.fct_city_weather_day                                          │
│  (Open-Meteo daily: rain, humidity, temp, forecast)                 │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  Direct ClickHouse SQL
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Scoring Mart Builder                            │
│         backend/scripts/build_geo_opportunity_mart.py               │
│                                                                     │
│  Reads all 5 sources → 6-component score → decision rules          │
│  → writes gold.mart_geo_product_opportunity (ReplacingMergeTree)   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐       ┌──────────────────────────────────┐
│  CLI Report         │       │  FastAPI (orchestrator)           │
│  run_geo_allocation │       │  GET  /geo-allocation             │
│  _report.py         │       │  POST /geo-allocation/run         │
│  → JSON + CSV +     │       └──────────────┬───────────────────┘
│    terminal table   │                      │ proxy
└─────────────────────┘                      ▼
                               ┌──────────────────────────────────┐
                               │  Next.js Frontend                 │
                               │  /geo-allocation                  │
                               │                                   │
                               │  GeoKpiStrip    WeatherPanel      │
                               │  AllocationTable (tabbed, search) │
                               │  GeoDatePicker  RunMartButton     │
                               └──────────────────────────────────┘
```

### Boundaries

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Data warehouse | ClickHouse `gold.*` | Raw orders, attribution, ad spend, weather |
| Mart builder | Python 3.11, pandas | Score calculation, ReplacingMergeTree write |
| Weather ingest | Python + Open-Meteo | Daily city weather → `fct_city_weather_day` |
| API | FastAPI (orchestrator) | Read mart, trigger rebuild |
| Frontend | Next.js App Router | Dashboard, date picker, run button |
| Config | `config/geo_campaign_rules.yaml` | All thresholds — no code change needed to tune |

---

## 2. Data Flow

### Daily run (production)

```
06:00 IST  ingest_weather.py        → gold.fct_city_weather_day
06:10 IST  build_geo_opportunity_mart.py → gold.mart_geo_product_opportunity
06:20 IST  run_geo_allocation_report.py  → reports/geo_allocation_YYYY-MM-DD.{json,csv}
```

### Data lineage per scored row

```
fct_order_items (ship_city, product_title, order_date)
    │
    ├─► fct_order_attribution (order_id → campaign_id, adset_id)
    │       │
    │       └─► fct_meta_ads_daily (spend per adset)
    │
    └─► mart_city_product_sales (city × product × date: orders, revenue)
            │
            └─► mart_city_campaign_attributed
                (city × campaign × product × date: attributed ROAS, effective_city_spend)

dim_th_sku_seasonal_map  →  season + stock_status per product
dim_adset_geo            →  is_broad_advantage + included_cities per adset
fct_city_weather_day     →  weather_stage per city × date
```

### Effective city spend derivation

Meta's API reports spend at the adset level. To get per-city spend, the mart
uses order attribution share:

```
effective_city_spend_for_city =
    adset_total_spend × (attributed_orders_from_city / total_attributed_orders_in_adset)
```

This is pre-computed in `gold.mart_city_campaign_attributed`. It is an
**aggregate expression inside the view**, so outer GROUP BY on it raises
`ILLEGAL_AGGREGATION (Code 184)`. The mart builder avoids this by fetching
raw per-day rows and aggregating in Python.

---

## 3. Low-Level Design

### 3.1 Mart builder (`build_geo_opportunity_mart.py`)

```
main()
 ├── load_config()              → geo_campaign_rules.yaml
 ├── fetch_sales_velocity()     → sumIf(orders, order_date >= d7_start)
 ├── fetch_campaign_perf()      → raw daily rows, aggregated in Python
 ├── fetch_season_map()         → any(season), any(stock_status)
 ├── fetch_adset_geo()          → any(is_broad_advantage), any(included_cities)
 ├── fetch_weather()            → weather_stage per city (falls back to yesterday)
 ├── resolve_canonical_name()   → prefix/substring match: full Shopify title → short name
 ├── merge(df_camp, df_sales)   → join on city × product_name
 └── score_row() × N
      ├── vel_score = _norm(orders_7d / baseline, velocity_norm_cap)
      ├── roas_score = _norm(roas, roas_norm_cap)
      ├── season_score = 100|80|20
      ├── inventory_score = 100 if stock_status NOT IN (OOS, CRITICAL_LOW) else 0
      ├── broad_score = 100 if broad_advantage AND city not in included_cities else 0
      ├── weather_score = lookup(weather_stage) from weather_scores config
      ├── opportunity_score = weighted sum (weights from config)
      └── decision (SCALE > SWITCH_PRODUCT > LAUNCH > PAUSE > HOLD)
```

### 3.2 ClickHouse ILLEGAL_AGGREGATION workaround

`gold.mart_city_campaign_attributed` is a view that contains `sum(spend) / ...`
expressions. ClickHouse inlines views at parse time, so wrapping in a subquery
does not help — the outer aggregation still sees the inner `sum()` as a nested
aggregate.

**Fix:** `fetch_campaign_perf()` issues a SELECT with **no outer GROUP BY**,
fetches per-day rows, and aggregates across `order_date` in pandas:

```python
agg = df.groupby([city, product, campaign, adset], as_index=False).agg(
    attributed_orders    = ("attributed_orders", "sum"),
    attributed_revenue   = ("attributed_revenue", "sum"),
    effective_city_spend = ("effective_city_spend", "sum"),
)
```

### 3.3 City name normalization

Two city name surfaces exist:
- `mart_city_product_sales.city` — raw Shopify `ship_city` (e.g. "Mumbai Subueban", "MUMBAI", "Bengaluru")
- `fct_city_weather_day.city` — canonical Open-Meteo city names (e.g. "Mumbai", "Bangalore")

Normalization chain:
1. `WEATHER_CITY_VARIANTS` dict in `build_geo_opportunity_mart.py` maps known variants
2. Falls back to `city.strip().title()` for canonical casing
3. Weather lookup: `weather_lookup.get(_weather_city_key(city), "UNKNOWN")`

Product name normalization:
- `mart_city_campaign_attributed.product_name` = full Shopify title ("TrimEase Paw Trimmer 🐾 Silent...")
- `dim_th_sku_seasonal_map.product_name` = short canonical name ("TrimEase Paw Trimmer")
- `resolve_canonical_name()`: prefix match → substring match → fallback to original

### 3.4 Weather ingest (`ingest_weather.py`)

```
CITY_DB (28 cities) → Open-Meteo API (free, no key)
    params: past_days=7, forecast_days=7, daily+hourly fields
    → compute_weather_stage(rain_mm, rain_prob, prev_rain_mm, humidity, temp_max)
    → INSERT INTO gold.fct_city_weather_day FORMAT JSONEachRow
    → 0.15s sleep between cities (rate limit)
```

Weather stage thresholds:
| Condition | Stage |
|-----------|-------|
| rain_mm > 10 | RAIN_ACTIVE |
| rain_mm > 2 OR rain_prob > 60 | RAIN_EMERGING |
| prev_rain_mm > 5 AND rain_mm ≤ 2 | RAIN_DECLINING |
| humidity > 80 | HUMIDITY_HIGH |
| temp_max > 38 | HEAT_HIGH |
| temp_max < 15 | COLD_HIGH |
| (else) | DRY |

### 3.5 Frontend architecture

```
app/geo-allocation/page.tsx          (Server Component)
 ├── fetchGeoAllocationData()         reads gold.mart_geo_product_opportunity FINAL
 ├── GeoKpiStrip                      SCALE/PAUSE/HOLD/SWITCH tile counts
 ├── WeatherPanel                     weather stage distribution bars
 └── AllocationTable                  (Client Component)
      ├── tabs: All / Scale / Launch / Switch / Pause / Hold
      ├── text search (city, product, campaign)
      └── ScoreBar, ActionBadge, WeatherBadge

app/api/geo-allocation/route.ts       thin proxy → FastAPI GET /geo-allocation
app/api/geo-allocation/run/route.ts   thin proxy → FastAPI POST /geo-allocation/run
```

---

## 4. Scoring Algorithm

Each city × product × campaign row gets an **opportunity score 0–100**:

```
opportunity_score =
    0.30 × sales_velocity_score    +
    0.25 × campaign_roas_score     +
    0.15 × season_match_score      +
    0.10 × inventory_score         +
    0.05 × broad_discovery_score   +
    0.15 × weather_score
```

### Component definitions

| Component | Input | Formula |
|-----------|-------|---------|
| `sales_velocity_score` | orders_7d, orders_30d | `min(orders_7d / (orders_30d/4.3), velocity_cap) / velocity_cap × 100` |
| `campaign_roas_score` | roas | `min(roas / roas_cap, 1) × 100` · capped at 5.0x |
| `season_match_score` | primary_season | 100 (exact match), 80 (All Seasons), 20 (other) |
| `inventory_score` | stock_status | 100 (OK/LOW), 0 (OOS/CRITICAL_LOW) |
| `broad_discovery_score` | is_broad_advantage, city not in included_cities | 100 if broad + city not targeted, else 0 |
| `weather_score` | weather_stage | see weather_scores in config |

### Weather score map

| Stage | Score | Rationale |
|-------|-------|-----------|
| RAIN_ACTIVE | 100 | Peak monsoon demand |
| RAIN_EMERGING | 75 | Demand rising fast |
| HUMIDITY_HIGH | 60 | Hygiene/care products relevant |
| RAIN_DECLINING | 40 | Transitioning — SWITCH_PRODUCT check |
| HEAT_HIGH | 30 | Off-season for rain products |
| COLD_HIGH | 20 | Off-season |
| DRY | 20 | Off-season baseline |
| UNKNOWN | 20 | No weather data for this city |

---

## 5. Decision Rules

Evaluated in order — **first match wins**:

```
1. SCALE          score ≥ 70 AND roas ≥ 2.5 AND inventory_ok AND signal_orders ≥ 3
2. SWITCH_PRODUCT weather_stage == RAIN_DECLINING AND product in from_products
3. LAUNCH         score ≥ 70 AND effective_city_spend == 0 AND inventory_ok
4. PAUSE          score ≤ 30 AND roas ≤ 1.5
5. HOLD           catch-all
```

`signal_orders = max(orders_7d, attributed_orders)` — uses total sales as signal
since Meta-attributed orders undercount for new cities.

### SWITCH_PRODUCT

Fires when rain is declining and a "from_product" is in the campaign. The action
means: pause this adset and allocate budget to hygiene/post-rain SKUs. Configured
in `switch_product.from_products` / `switch_product.to_products` in the YAML.

Budget modifiers:
| Action | Modifier |
|--------|---------|
| SCALE | 1.25× (increase budget 25%) |
| LAUNCH | 1.0× (new campaign at current budget) |
| PAUSE | 0.0× (zero out) |
| SWITCH_PRODUCT | 0.0× (pause this, reallocate elsewhere) |
| HOLD | 1.0× (no change) |

---

## 6. Schema Reference

### `gold.mart_geo_product_opportunity`

Engine: `ReplacingMergeTree()` · ORDER BY `(report_date, brand_id, city, product_name, campaign_id)`

| Column | Type | Description |
|--------|------|-------------|
| report_date | Date | Scoring run date |
| brand_id | Int32 | Brand (20 = Tilting Heads) |
| city | String | Raw ship_city |
| state | String | Ship state |
| season | String | Product's primary season |
| product_name | String | Canonical short product name |
| campaign_id | String | Meta campaign ID |
| campaign_name | String | Meta campaign name |
| adset_id | String | Meta adset ID |
| adset_name | String | Meta adset name |
| orders_7d | Int32 | City × product orders in last 7d |
| attributed_revenue | Float32 | Meta-attributed revenue last 7d |
| effective_city_spend | Float32 | Pro-rated adset spend to this city last 7d |
| roas | Float32 | attributed_revenue / effective_city_spend |
| sales_velocity_score | Float32 | 0–100 |
| campaign_roas_score | Float32 | 0–100 |
| season_match_score | Float32 | 0–100 |
| inventory_score | Float32 | 0 or 100 |
| broad_discovery_flag | UInt8 | 1 if Broad Advantage city not explicitly targeted |
| weather_stage | String | RAIN_ACTIVE / RAIN_EMERGING / … / UNKNOWN |
| weather_score | Float32 | 0–100 |
| opportunity_score | Float32 | Weighted composite 0–100 |
| recommended_action | String | SCALE / LAUNCH / PAUSE / HOLD / SWITCH_PRODUCT |
| budget_modifier | Float32 | 0.0 – 1.25 |
| reason | String | Human-readable justification |

### `gold.fct_city_weather_day`

Engine: `ReplacingMergeTree()` · ORDER BY `(date, city)`

| Column | Type | Description |
|--------|------|-------------|
| date | Date | Weather date |
| city | String | Canonical city name |
| state | String | State |
| latitude | Float32 | |
| longitude | Float32 | |
| rainfall_mm | Float32 | Daily precipitation (mm) |
| rain_probability | Float32 | Max rain probability % |
| humidity_max | Float32 | Max relative humidity % |
| temperature_max | Float32 | Max temperature °C |
| temperature_min | Float32 | Min temperature °C |
| weather_code | Int32 | WMO weather code |
| forecast_1d_rain | Float32 | Tomorrow's forecast rain mm |
| forecast_3d_rain | Float32 | 3-day cumulative forecast mm |
| forecast_7d_rain | Float32 | 7-day cumulative forecast mm |
| weather_stage | String | Computed stage (see §3.4) |
| fetched_at | DateTime | Ingest timestamp |

### `gold.mart_city_weather_sales_lag` (VIEW)

Joins `fct_city_weather_day` × `mart_city_product_sales` at D-3..D+3 offsets.

| Column | Description |
|--------|-------------|
| weather_date | The weather event date |
| weather_city | Canonical city |
| weather_stage | Stage on weather_date |
| rainfall_mm | Rain on weather_date |
| product_name | Canonical product |
| order_date | Sales date (weather_date + day_offset) |
| day_offset | Integer -3..+3 |
| orders | Orders on order_date |
| net_revenue | Revenue on order_date |

---

## 7. Operations Runbook

### Manual run for a specific date

```bash
# 1. Ingest weather (if not already done today)
py backend/scripts/ingest_weather.py

# 2. Build scoring mart
py backend/scripts/build_geo_opportunity_mart.py --date 2026-06-23

# 3. Generate report
py backend/scripts/run_geo_allocation_report.py --date 2026-06-23

# Files written to:
# backend/scripts/reports/geo_allocation_2026-06-23.json
# backend/scripts/reports/geo_allocation_2026-06-23.csv
```

### Dry run (no write to ClickHouse)

```bash
py backend/scripts/build_geo_opportunity_mart.py --dry-run --date 2026-06-23
```

### Rebuild mart from dashboard

Click **Rebuild mart** on `/geo-allocation` — calls `POST /api/geo-allocation/run?report_date=YYYY-MM-DD`.
The FastAPI backend runs `build_geo_opportunity_mart.py` as a background subprocess.
Reload the page after ~30s to see updated data.

### View lead/lag analysis

```sql
SELECT weather_stage, day_offset, avg(orders) AS avg_orders
FROM gold.mart_city_weather_sales_lag
GROUP BY weather_stage, day_offset
ORDER BY weather_stage, day_offset
```

### Tune thresholds

All scoring weights and decision thresholds live in `config/geo_campaign_rules.yaml`.
Edit the file and re-run the mart builder — no code changes needed.

Key values:

```yaml
global:
  target_roas: 2.5          # SCALE requires roas >= this
  min_orders_signal: 3      # SCALE requires signal_orders >= this

scoring_weights:
  sales_velocity: 0.30
  campaign_roas:  0.25
  season_match:   0.15
  inventory:      0.10
  broad_discovery: 0.05
  weather:        0.15

scale:
  opportunity_score_gte: 70
  budget_modifier: 1.25

pause:
  opportunity_score_lte: 30
  campaign_roas_lte: 1.5
```

### Add new cities to weather coverage

Edit `CITY_DB` in `backend/scripts/ingest_weather.py`. Add `{ name, lat, lon, state, variants }`.
Run `ingest_weather.py` once to backfill.

Add the variant mapping in `WEATHER_CITY_VARIANTS` in `build_geo_opportunity_mart.py`
to ensure mart cities resolve to the new canonical name.

### Check why a city shows UNKNOWN weather

```bash
py -c "
import io, requests, pandas as pd
r = requests.post('http://clickhouse.seleric.com:8123/?database=gold',
    data='SELECT city FROM gold.fct_city_weather_day GROUP BY 1\nFORMAT TSVWithNames'.encode(),
    auth=('seleric_admin789','SelericDB7890'))
print(r.text[:2000])
"
```

If the city is missing from the output, it's not in `CITY_DB`. If it's present
but the mart shows UNKNOWN, add a variant mapping.

---

## 8. Configuration Reference

**File:** `config/geo_campaign_rules.yaml`

```yaml
version: "1.0"
ruleset: monsoon_geo_campaign_mvp

global:
  brand_id: 20
  current_season: Monsoon           # Change to Summer/Winter to shift season_scores
  target_roas: 2.5
  min_orders_signal: 3
  lookback_days_velocity: 7
  lookback_days_baseline: 30

scoring_weights:                    # Must sum to 1.0
  sales_velocity:  0.30
  campaign_roas:   0.25
  season_match:    0.15
  inventory:       0.10
  broad_discovery: 0.05
  weather:         0.15

weather_scores:
  RAIN_ACTIVE:    100
  RAIN_EMERGING:   75
  HUMIDITY_HIGH:   60
  RAIN_DECLINING:  40
  HEAT_HIGH:       30
  COLD_HIGH:       20
  DRY:             20
  UNKNOWN:         20

season_scores:
  exact_match:  100
  all_seasons:   80
  no_match:      20

inventory:
  block_statuses: [OOS, CRITICAL_LOW]
  ok_score: 100
  block_score: 0

scale:
  opportunity_score_gte: 70
  campaign_roas_gte: 2.5
  budget_modifier: 1.25
  label: SCALE

launch:
  opportunity_score_gte: 70
  budget_modifier: 1.0
  label: LAUNCH

pause:
  opportunity_score_lte: 30
  campaign_roas_lte: 1.5
  budget_modifier: 0.0
  label: PAUSE

hold:
  budget_modifier: 1.0
  label: HOLD

switch_product:
  trigger_weather_stage: RAIN_DECLINING
  from_products:
    - Rover Raincoat
    - StormGuard Jacket
    - ZephyrLite Vest
  to_products:
    - Paw Cleanser
    - Daily Pet Wipes
    - Tick & Flea Shampoo
    - No-Rinse Hygiene Spray
    - Aloe Fresh Deodorant

roas_norm_cap:     5.0
velocity_norm_cap: 3.0
```

---

## 9. Lead/Lag Analysis

**View:** `gold.mart_city_weather_sales_lag`

**Purpose:** Measure the lagged sales impact of weather events.
Analysts can query: "do RAIN_ACTIVE events drive more orders 2 days before or after?"

**Key finding (2026-06-23):**

| Stage | D-2 | D-1 | D0 | D+1 |
|-------|-----|-----|----|-----|
| RAIN_ACTIVE | 1.96 | 2.02 | 1.82 | 1.38 |
| RAIN_EMERGING | 1.25 | 1.19 | 1.26 | 1.34 |
| DRY | 1.12 | 1.18 | 1.44 | 1.49 |

Orders peak **before** rain arrives (D-2/D-1), not during it. Customers buy
in anticipation. Campaign scaling should begin at RAIN_EMERGING, not RAIN_ACTIVE.

**Sample query:**

```sql
SELECT
    weather_stage,
    day_offset,
    round(avg(orders), 2)           AS avg_orders,
    round(avg(net_revenue), 0)      AS avg_revenue,
    count()                         AS city_product_days
FROM gold.mart_city_weather_sales_lag
WHERE weather_stage IN ('RAIN_ACTIVE', 'RAIN_EMERGING', 'RAIN_DECLINING')
GROUP BY weather_stage, day_offset
ORDER BY weather_stage, day_offset
```

**Setup:** Run once:

```bash
py backend/scripts/setup_weather_lag_view.py --sample
```

---

*Last updated: 2026-06-23. Branch: phase-1.*
