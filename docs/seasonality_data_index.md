# SELERIC Seasonality & Data Coverage Index

**Generated:** June 2026  
**Reference:** `seleric_seasonal_intelligence_blueprint.md`  
**Purpose:** Maps blueprint data requirements against current ClickHouse gold.* state

---

## TL;DR

Roughly at **Phase 1 complete, Phase 2 partially done**. Core ecommerce + ad spend data is solid. Inventory, support, weather, search trends, and human intelligence are entirely absent. About **40% of blueprint-required data exists today**.

---

## What Exists in ClickHouse (gold.*)

### Source Systems — Ingested & Modeled

| Source | Status | Tables |
|--------|--------|--------|
| Shopify Orders | ✅ Full | `fct_orders`, `fct_order_items`, `fct_refund_line_items`, `fct_payments` |
| Shopify Customers | ✅ Full | `dim_customers` (LTV, repeat rate, geo, lifecycle) |
| Shopify COGS | ✅ Full | `fct_product_variant_cost`, `fct_product_variant_cost_history` (SCD2) |
| Meta Ads | ✅ Full + Extra | `fct_meta_ads_daily`, `fct_meta_ads_hourly`, `mart_meta_ad_daily_performance`, `mart_meta_ad_daily_attribution` |
| Meta Creatives (Neurohack) | ✅ SELERIC-specific | `dim_neurohack`, `dim_ad_neurohack_map`, `mart_meta_ad_neurotag_daily` |
| Google Ads | ✅ Full | `fct_google_ads_daily`, `fct_google_ads_hourly` |
| Website Session Funnel | ⚠️ Partial | `fct_session_funnel` — per-session grain; needs daily rollup by product × source |
| Last-Touch Attribution | ✅ Full | `fct_order_attribution` (Meta + Google attributed orders/revenue) |

### Metrics Computable Today

- Gross/net revenue, discounts, refunds, contribution margin ✅
- COGS per order line (point-in-time cost joins) ✅
- Shipping, packaging, gateway fee, RTO cost per order ✅
- Platform ROAS, CTR, CPC, CPM, hook rate, hold rate ✅
- Contribution ROAS (net revenue / total variable cost) ✅
- Break-even ROAS (all cost components available) ✅
- Discount dependency rate ✅
- Refund rate / return rate ✅
- Repeat purchase rate (from `fct_orders` + `dim_customers`) ✅
- Paid vs organic split (via `fct_order_attribution`) ✅
- Creative fatigue signals — CTR trend by ad (partial; need frequency over time) ⚠️
- Funnel stage conversion rates (need daily rollup from `fct_session_funnel`) ⚠️

---

## What's Missing

### Source Systems — Entirely Absent

| Source | Blueprint Phase | What's Blocked Without It |
|--------|----------------|--------------------------|
| **Inventory Management System** | Phase 2 | `fact_inventory_daily`, `mart_inventory_analysis_daily`, availability rate, days cover, reorder risk, `scale_blocker_flag`, Inventory Scalability sub-score (10% of Product Performance Score) |
| **Amazon Seller Central** | Phase 2 | Amazon orders/revenue, ASIN-level performance, Amazon advertising, Amazon returns, buy-box %, marketplace channel separation |
| **Customer Support Platform** | Phase 3 | `fact_support_tickets_daily`, `mart_customer_quality_daily`, complaint rate, defect rate, size/fit issues, Customer Satisfaction sub-score (15% of Product Performance Score) |
| **Review Platform** | Phase 3 | `review_score_avg`, `negative_review_rate`, Customer Satisfaction sub-score |
| **Weather APIs (IMD / OpenWeatherMap)** | Phase 4 | `mart_context_analysis_daily`, `weather_score`, monsoon/heat wave/cold wave flags, Season Context Score (30% weather-driven) |
| **Google Trends / Search Data** | Phase 4 | `search_trend_index`, `search_demand_lift`, search sub-score (10% of Season Context Score) |
| **Human Intelligence Module** | Phase 4 | `mart_human_intelligence_signals`, LLM extraction pipeline, human validation scoring |

---

## Gold Mart Tables — Blueprint vs. Reality

| Blueprint Mart | Status | Gap |
|----------------|--------|-----|
| `mart_product_analysis_daily` | ⚠️ Partially buildable | Availability metrics need inventory; customer satisfaction needs support/reviews; sessions need rollup |
| `mart_campaign_analysis_daily` | ✅ ~80% buildable | Missing `click_to_session_rate` (need clean session–campaign join), `creative_fatigue_score`, `high_intent_session_rate` definition |
| `mart_funnel_analysis_daily` | ⚠️ Partially buildable | `fct_session_funnel` is per-session; needs daily rollup by `product × traffic_source`; high-intent session definition unclear |
| `mart_profitability_analysis_daily` | ✅ ~90% buildable | All cost components exist; needs per-SKU × channel aggregation from `fct_order_items` |
| `mart_inventory_analysis_daily` | ❌ Blocked | No inventory data source |
| `mart_customer_quality_daily` | ⚠️ 30% buildable | Refund rate ✅, repeat purchase rate ✅; complaint rate ❌, review score ❌, defect/size-fit ❌ |
| `mart_context_analysis_daily` | ❌ Blocked | No weather, no search trends, no historical season index, no human intelligence |
| `mart_human_intelligence_signals` | ❌ Not built | No ingestion pipeline, no LLM extraction |
| `mart_recommendation_log` | ❌ Not built | Scoring engines not built, no rule engine |
| `mart_forecast_readiness` | ❌ Blocked | Depends on 4+ missing inputs |

---

## Dimension Tables — Blueprint vs. Reality

| Blueprint Dimension | Status | Notes |
|--------------------|--------|-------|
| `dim_date` | ❓ Likely exists | Not confirmed in gold.* |
| `dim_product` | ❓ | Implied by product metadata on orders; no standalone gold dim confirmed |
| `dim_sku` | ❓ | Variant cost tables exist; no canonical `dim_sku` with `category_l1`, `season_relevance` confirmed |
| `dim_campaign` / `dim_adset` / `dim_ad` | ⚠️ | Campaign/adset/ad metadata embedded in fact tables, not normalized to dedicated dims |
| `dim_creative` | ⚠️ | `dim_neurohack` covers tag taxonomy; no `dim_creative` with headline/body/CTA |
| `dim_channel` | ❓ | Not confirmed |
| `dim_customer` | ✅ | `gold.dim_customers` covers most required fields |
| `dim_location` | ❓ | Geo present at order level, not a standalone dim |
| `dim_season_context` | ❌ | Not built |
| `dim_vendor` | ❌ | No vendor/supplier data |
| `dim_offer` | ❌ | No offers/promotions dim; discount amounts on orders only |
| `dim_human_signal_type` | ❌ | HI module not built |

---

## Buildable Right Now (No New Data Sources Required)

These are Phase 2 completable with existing data:

1. **`mart_profitability_analysis_daily`** — All inputs in `fct_order_items`. Aggregate by `(date, sku, channel)` with full cost waterfall.
2. **`mart_campaign_analysis_daily`** (80%) — Meta + Google fact tables + attribution. Missing: clean `click_to_session_rate`, `high_intent_session_rate`.
3. **`mart_product_analysis_daily`** (partial) — Revenue, refund rate, discount rate, paid dependency, repeat purchase rate, basic contribution margin. Availability rate blocked.
4. **`mart_funnel_analysis_daily`** (basic stages only) — `fct_session_funnel` needs daily rollup + campaign attribution join.
5. **`mart_customer_quality_daily`** (partial) — Refund + repeat purchase metrics only. From `fct_orders` + `fct_refund_line_items` + `dim_customers`.
6. **Basic Product Performance Score** (5 of 8 components) — Demand quality, profitability, conversion efficiency, campaign efficiency, retention value. Blocked: inventory scalability, customer satisfaction, strategic fit.

---

## Priority Gaps to Fill

| Priority | Missing Input | Unlocks |
|----------|--------------|---------|
| 1 | **Inventory Management connector** | Availability rate, days cover, reorder risk, Inventory Scalability Score (10% of PPS), `scale_blocker_flag`, reorder recommendations |
| 2 | **Customer Support / Returns data** | Complaint rate, defect rate, Customer Satisfaction Score (15% of PPS), `return_risk` and `volume_trap` classifications |
| 3 | **Review platform data** | `review_score_avg`, `negative_review_rate` — needed to complete Customer Satisfaction Score |
| 4 | **Weather API (IMD / OpenWeatherMap)** | Season Context Score (30% weight), monsoon/summer/winter signal scoring, seasonal campaign recommendations |
| 5 | **Search Trends (Google Trends)** | `search_demand_lift` metric — feeds Demand Quality Score and Season Context Score |
| 6 | **Amazon Seller Central** | Marketplace channel separation, ASIN-level analysis, Amazon ad attribution |
| 7 | **Human Intelligence Module** | `mart_human_intelligence_signals`, Strategic Fit sub-score, corroboration of data signals, human validation for Forecast Readiness |

---

## Scoring Model Coverage

| Score | Blueprint Components | Can Compute Now | Blocked |
|-------|---------------------|-----------------|---------|
| **Product Performance Score** | 8 components | 5 of 8 (demand quality, profitability, conversion efficiency, campaign efficiency, retention value) | Inventory Scalability (no inventory), Customer Satisfaction (no support/reviews), Strategic Fit (no season/HI data) |
| **Campaign Quality Score** | 6 components | 4 of 6 (profitability signal, traffic quality signal, creative health, scale signal partial) | Demand Quality Signal (high-intent session rate needs definition), Funnel Efficiency (campaign-attributed funnel needs session join) |
| **Season Context Score** | 6 components | 1 of 6 (historical sales pattern partial) | Weather ❌, Campaign response (partial), Product demand signal (partial), Search trends ❌, Human intelligence ❌ |
| **Forecast Readiness Score** | 7 components | 3 of 7 (data quality, attribution coverage, demand stability) | Historical depth (need longer data), Stock availability quality ❌, Season context signal ❌, Human validation ❌ |

---

## Seasonality Intelligence — Specific Gaps

The Season Context Score formula (Section 25 of blueprint) requires:

```
Season Context Score (0–10) =
  (0.30 × Weather Signal Score)       ← ❌ BLOCKED — no weather data
+ (0.20 × Historical Sales Pattern)   ← ⚠️ PARTIAL — have Shopify sales history; need category indexing
+ (0.15 × Campaign Performance Signal)← ⚠️ PARTIAL — have Meta/Google data; need season tagging on campaigns
+ (0.15 × Product Demand Signal)      ← ⚠️ PARTIAL — have orders + sessions; missing availability normalization
+ (0.10 × Search/Market Trend Score)  ← ❌ BLOCKED — no search trends data
+ (0.10 × Human Intelligence Signal)  ← ❌ BLOCKED — no HI module
```

**What can be approximated today:** Historical sales pattern index (from `fct_orders` grouped by category × month) + partial campaign response signal. This yields a rough 35% coverage of the season score, driven entirely by internal sales and ad data.

**Minimum viable Season Context Score** requires at least weather data (Priority 4 above) and search trends (Priority 5) to be meaningful.

---

*Last updated: June 2026*
