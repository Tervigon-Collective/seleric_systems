# SELERIC Decision Intelligence System
## Complete Technical Blueprint & Development Specification

**Version:** 1.0  
**Date:** June 2026  
**Classification:** Internal Engineering Reference  
**Authors:** Senior Data Architecture & Product Systems Team

---

# TABLE OF CONTENTS

1. Executive Overview
2. Problem Statement
3. System Goals
4. Non-Goals
5. Functional Requirements
6. Non-Functional Requirements
7. High-Level Design (HLD)
8. Low-Level Design (LLD)
9. Architecture Diagram
10. Data Flow
11. Source Systems & Required Data Points
12. Canonical Entities
13. Data Warehouse Design
14. Bronze / Raw Layer
15. Silver / Normalized Layer
16. Gold / Mart Layer
17. Fact & Dimension Tables
18. Analysis Marts
19. Metric Definitions
20. Product Performance Scoring Model
21. Campaign Quality Scoring Model
22. Funnel Analysis Model
23. Profitability Analysis Model
24. Inventory Readiness Model
25. Seasonality / Context Analysis Model
26. Human Intelligence Extraction Model
27. Forecast Readiness Model
28. Recommendation Engine Logic
29. Classification Logic
30. API Requirements
31. Backend Services
32. Frontend / Dashboard Requirements
33. Job Orchestration
34. Data Quality Checks
35. Testing Strategy
36. Monitoring & Observability
37. Security & Tenant Isolation
38. Build Roadmap
39. MVP Scope
40. Future Forecasting Layer

---

## 1. EXECUTIVE OVERVIEW

SELERIC is a Decision Intelligence platform designed for ecommerce brands operating across direct-to-consumer, marketplace, and omnichannel sales environments. The system ingests data from all commercial touchpoints — advertising platforms, storefronts, inventory systems, customer interactions, weather APIs, and human management intelligence — and converts that data into a structured, normalized, and actionable layer of business understanding.

The system is explicitly designed to **diagnose before it predicts**. Most BI tools surface raw metrics. SELERIC surfaces normalized, multi-factor explanations of why a product is performing, why a campaign is delivering, where a funnel is leaking, and what action the business should take today, this week, and in the next 30 days.

SELERIC is not a dashboard that shows orders and revenue. It is an intelligence layer that answers questions such as:

- Is this product truly strong, or is it propped up by ad spend and discounts?
- Is this campaign generating quality demand or just cheap clicks?
- Which products are hidden gems being missed due to low traffic allocation?
- Is this SKU ready to scale, or is it a stock-constrained winner?
- What is the seasonal opportunity in the next 20 days, and is the business ready?
- Which data is clean enough to forecast, and which is not?

The system is built in phases. Phase 1 through Phase 5 build the analysis and decision layer. Phase 6 builds forecast readiness scoring. Phase 7 introduces actual forecasting only after the analysis layer can correctly diagnose the present.

---

## 2. PROBLEM STATEMENT

### 2.1 The Raw Metrics Problem

Ecommerce operators typically rely on platform-native dashboards — Shopify analytics, Meta Ads Manager, Google Ads reporting — which surface raw metrics: orders, revenue, ROAS, CTR, CPC. These metrics are useful individually but systematically misleading when used to make scaling decisions because:

- **Orders** are influenced by ad spend, discounts, stock availability, seasonality, and marketplace visibility — not only product quality.
- **Platform ROAS** counts all attributed revenue without subtracting refunds, discounts, marketplace fees, COGS, or shipping.
- **CTR** measures creative thumb-stop performance, not intent quality or downstream conversion.
- **Conversion rate** collapses when stock runs low, pricing changes, or creatives mismatch the landing page.

Operators who scale based on raw metrics often discover that growth was manufactured by increased ad spend, discounting, or seasonal tailwinds — not by fundamentally strong products.

### 2.2 The Normalization Problem

A product selling 500 units per month with zero ad spend, full-price conversion, and high repeat rate is fundamentally different from a product selling 2,000 units per month with heavy paid support, 30% discount dependency, and 18% return rate. Raw order comparison makes the second product look superior. Normalized analysis reveals the first product is the real asset.

### 2.3 The Fragmentation Problem

Business intelligence is scattered across:
- Shopify (orders, products, customers)
- Meta Ads (spend, ROAS, creatives)
- Google Ads (search, shopping, display)
- Amazon Seller Central (marketplace)
- Inventory systems (stock, procurement)
- Customer support (tickets, complaints)
- Review platforms (NPS, product reviews)
- Finance/accounting (COGS, margins)
- Leadership meetings (strategic intelligence)

No single system joins these into a coherent picture. SELERIC builds that joined picture.

### 2.4 The Human Intelligence Problem

Management, sales teams, procurement officers, and support staff carry real-time market intelligence that never enters any data system. A distributor flagging that competitors have launched monsoon products, or a support agent noticing an uptick in "wet coat smell" complaints — these signals are as valuable as any dashboard metric. SELERIC captures, structures, and integrates this intelligence.

### 2.5 The Premature Forecasting Problem

Many analytics tools attempt forecasting without first establishing whether the underlying data is reliable, complete, or attributable. A forecast built on incomplete SKU join coverage, missing attribution windows, or stock-constrained demand signals produces directionally wrong guidance. SELERIC introduces a Forecast Readiness Score that gates all forecasting.

---

## 3. SYSTEM GOALS

1. Build a unified data foundation that joins all commercial and operational data sources into a single normalized entity spine.
2. Create a multi-layer analysis system that correctly explains current business performance before any prediction is attempted.
3. Define and compute normalized, multi-factor metrics that account for traffic, spend, inventory availability, pricing, returns, and customer satisfaction.
4. Score every product, campaign, and funnel stage using a documented, reproducible formula.
5. Classify products and campaigns into actionable categories with specific recommended actions.
6. Capture and structure human intelligence from meetings, transcripts, notes, and feedback.
7. Integrate seasonality, weather signals, and search/market trends into product and category readiness scoring.
8. Produce a daily intelligence report combining all signals into prioritized actions.
9. Gate forecasting behind a Forecast Readiness Score to prevent premature or misleading predictions.
10. Build a system that improves over time by tracking whether recommendations led to the expected outcomes.

---

## 4. NON-GOALS

The following are explicitly out of scope for this specification:

1. **PostHog** — Excluded completely. Session and behavioral analytics are handled through first-party website event tracking and server-side ecommerce events only.
2. **Real-time streaming analytics** — The system operates on daily and intra-day batch jobs. True real-time event streaming is a future capability.
3. **Automated campaign execution** — The system produces recommendations but does not push budget changes or ad edits to platforms automatically (Phase 7+ consideration).
4. **Customer-level personalization** — SELERIC operates at the product, campaign, SKU, and category level. Customer segmentation may be introduced in later phases but is not part of the analysis layer.
5. **ERP replacement** — SELERIC reads from inventory and procurement systems but does not replace them.
6. **Full demand forecasting** — Forecasting is introduced only in Phase 7, after the analysis layer has proven ability to diagnose the present. The Phase 7 design is included as a blueprint but is not built in Phases 1–6.
7. **Third-party reseller or affiliate tracking** — Out of scope for v1.
8. **Mobile app analytics** — Web and ecommerce event tracking only for v1.

---

## 5. FUNCTIONAL REQUIREMENTS

### FR-01: Data Ingestion
- The system must ingest structured data from Shopify, Meta Ads, Google Ads, Amazon Seller Central, inventory management systems, and customer support platforms via API connectors.
- The system must accept file uploads (CSV, XLSX, JSON) for sources without API access.
- The system must accept human intelligence input via manual form, text note, or uploaded transcript (TXT, PDF, DOCX).
- All ingested data must be timestamped with ingestion time and source identifier.
- Incremental and full-refresh ingestion modes must be supported per source.

### FR-02: Data Normalization
- All source data must be normalized into canonical entities: Product, SKU, Order, Campaign, Adset, Ad, Creative, Customer, Session, Inventory, Vendor, Season, Location.
- Currency normalization to a single base currency must be applied.
- Date and timezone normalization to IST must be applied.
- SKU/product identifier resolution must join across Shopify, Amazon, and internal catalog identifiers.

### FR-03: Data Quality Scoring
- Every data source must receive a daily data quality score covering freshness, completeness, duplicate rate, null rate, and join coverage.
- An overall analysis confidence score must be computed daily.
- Data quality issues must block or flag analysis outputs with a confidence warning.

### FR-04: Metric Computation
- All metrics defined in Section 19 must be computed daily at the SKU, product, category, campaign, channel, and business level.
- Metrics must be stored in mart tables with grain of (date, entity_id).

### FR-05: Scoring Engines
- Product Performance Score must be computed for every active SKU daily using the formula defined in Section 20.
- Campaign Quality Score must be computed for every active campaign/adset daily using Section 21.
- Funnel analysis must be computed per product, campaign, and channel daily.
- Profitability analysis must compute contribution margin at the order, product, and campaign level.
- Inventory readiness and reorder risk must be computed daily.
- Seasonality context score must be computed daily for each season and category.
- Forecast Readiness Score must be computed for each SKU and category.

### FR-06: Classification Engine
- Every product must be classified daily into exactly one primary classification and up to two secondary classifications from the list in Section 29.
- Every campaign must be classified into exactly one primary classification.
- Classifications must be explainable — the system must store which factors drove the classification.

### FR-07: Recommendation Engine
- The system must generate at least one prioritized recommendation per active product and campaign per day.
- Recommendations must include: action type, owner, priority level, expected impact, and confidence score.
- Recommendations must be stored with a status field (pending / actioned / dismissed / outcome-measured).

### FR-08: Human Intelligence Module
- The system must accept text notes, meeting transcripts, and structured form inputs.
- An LLM extraction layer must parse these inputs and produce structured signal records.
- Extracted signals must be stored in the human intelligence mart and surfaced in the recommendation feed.

### FR-09: Seasonality Intelligence
- The system must compute a seasonality context score combining weather data, historical sales patterns, search trend data, campaign response, and human intelligence signals.
- Scores must be computed for each of the three primary Indian commercial seasons: Summer, Monsoon, Winter.
- A 7-day and 20-day forecast of seasonality score movement must be produced using available trend signals (not ML forecasting — rule-based trend extrapolation in Phase 1–5).

### FR-10: Daily Intelligence Report
- The system must generate a structured daily intelligence email/report for each client account.
- The report must include: today's scores, key alerts, recommended actions, risk flags, and product/campaign spotlights.

### FR-11: Forecast Readiness Gating
- No SKU, category, or campaign may enter a forecasting workflow unless its Forecast Readiness Score exceeds 40.
- Readiness score bands must be surfaced in the dashboard and API.

### FR-12: Action Outcome Tracking
- All actioned recommendations must be trackable.
- The system must compare post-action metrics at 7 days and 30 days against pre-action baseline.
- Recommendation accuracy must be logged and used to tune scoring weights over time.

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### NFR-01: Performance
- Dashboard queries must respond in under 3 seconds for pre-aggregated mart reads.
- Scoring jobs for up to 500 active SKUs must complete within 30 minutes of source data refresh.
- API endpoints must respond in under 500ms for mart-backed queries.

### NFR-02: Data Freshness
- Advertising data (Meta, Google) must refresh every 6 hours.
- Order and inventory data must refresh every 3 hours or on webhook trigger.
- Weather data must refresh every 12 hours.
- Scoring and mart computation must run once daily at 06:00 IST after all source refreshes complete.

### NFR-03: Reliability
- The ingestion pipeline must have 99.5% uptime.
- Failed ingestion jobs must retry with exponential backoff and alert on 3 consecutive failures.
- Mart computation failures must not block dashboard reads — last-known-good marts must remain accessible.

### NFR-04: Scalability
- The system must support up to 50 client accounts in Phase 1–5 on a shared infrastructure.
- The data warehouse must be migrable from PostgreSQL to ClickHouse or BigQuery/Snowflake without application-layer changes (using dbt as the abstraction layer).

### NFR-05: Auditability
- All scoring computations must store the input factor values and weights used, not just the final score.
- All recommendation generations must store the rule or formula that triggered the recommendation.
- All LLM extraction outputs must store the original input text and the raw LLM response.

### NFR-06: Tenant Isolation
- Each client account's data must be fully isolated at the database schema or partition level.
- No cross-tenant data leakage is permitted in any API response or mart query.

### NFR-07: Security
- All API endpoints must require authentication via JWT.
- All source credentials (API keys, OAuth tokens) must be stored in an encrypted secrets store.
- PII fields (customer email, name, address) must be masked or pseudonymized in analysis marts.

---

## 7. HIGH-LEVEL DESIGN (HLD)

### 7.1 System Layers

SELERIC is structured as five distinct layers that process data progressively from raw ingestion to actionable intelligence.

```
LAYER 1: SOURCE SYSTEMS
  Shopify, Meta Ads, Google Ads, Amazon, Inventory, Support, Weather, Search Trends, Human Input

LAYER 2: INGESTION & RAW STORAGE
  API Connectors, File Upload Handlers, Webhook Receivers, Object Storage (Raw), Bronze Tables

LAYER 3: NORMALIZATION & ENTITY RESOLUTION
  Silver Tables, dbt Transformations, Entity Spine, Canonical Models, SKU/Product Join, Attribution

LAYER 4: ANALYSIS & SCORING
  Gold Marts, Metric Computation, Scoring Engines, Classification Engine, Recommendation Engine

LAYER 5: INTELLIGENCE DELIVERY
  Dashboard, API Layer, Daily Report Email, Notification Service, Action Log
```

### 7.2 Key Design Principles

**Diagnosis before prediction.** The system builds analysis depth before introducing any forecasting. Forecasting gates are enforced through the Forecast Readiness Score.

**Normalized metrics over raw metrics.** Every performance measure is adjusted for the confounding factors that distort raw numbers. Orders per in-stock day. Contribution ROAS not platform ROAS. High-intent conversion rate, not blended conversion rate.

**Explainable scoring.** Every score stores its inputs. No black-box outputs. Engineering teams and business users can trace any score back to source values.

**Recommendation as a first-class entity.** Recommendations are not outputs appended to dashboards. They are stored entities with status, owner, priority, expected impact, and measured outcomes.

**Human intelligence as a data source.** Management meetings, support feedback, and field observations are treated as a formal data input with structured extraction, confidence scoring, and integration into the scoring models.

### 7.3 Core Data Flows

Three primary flows run through SELERIC:

**Flow A — Commercial Data:** Source APIs → Bronze (raw) → Silver (normalized, joined) → Gold Marts (metrics) → Scores → Classifications → Recommendations → Dashboard/API/Email

**Flow B — Human Intelligence:** Text/Transcript Input → LLM Extraction → Structured Signal → Human Intelligence Mart → Score Integration → Recommendation Feed

**Flow C — Context/Seasonality:** Weather API + Search Trends + Historical Sales → Context Analysis Mart → Seasonality Score → Category/Product Relevance Score → Campaign Recommendations

---

## 8. LOW-LEVEL DESIGN (LLD)

### 8.1 Ingestion Layer

Each source connector is implemented as a Python class inheriting from a `BaseConnector` interface:

```python
class BaseConnector:
    def authenticate(self) -> bool
    def fetch_incremental(self, since: datetime) -> List[RawRecord]
    def fetch_full(self) -> List[RawRecord]
    def validate_schema(self, records: List[RawRecord]) -> ValidationResult
    def write_raw(self, records: List[RawRecord], destination: RawTable) -> WriteResult
```

Each connector produces records to a `raw__{source}__{entity}` table in the Bronze layer with mandatory fields: `ingested_at`, `source_system`, `source_record_id`, `raw_payload` (JSONB), `schema_version`.

### 8.2 Transformation Layer

dbt models transform Bronze to Silver to Gold. The model hierarchy:

```
models/
  bronze/          -- raw source views (no transformation, just schema validation)
  staging/         -- source-specific cleaning (stg__shopify__orders, stg__meta__campaigns)
  intermediate/    -- entity resolution and joining (int__sku_spine, int__order_attribution)
  marts/           -- final analysis tables (mart_product_analysis_daily, etc.)
  metrics/         -- metric definitions using dbt metrics layer
```

### 8.3 Entity Resolution

The entity resolution service maintains a mapping table `entity_resolution` that links:
- Shopify product_id → canonical_product_id
- Amazon ASIN → canonical_product_id
- Google Shopping product_id → canonical_product_id
- All variant/SKU-level identifiers → canonical_sku_id

Resolution uses a combination of exact match (barcode/EAN), fuzzy match (product title), and manual override records.

### 8.4 Metric Computation

Metrics are computed by dbt SQL models that read from Silver tables and write to Gold marts. Metric grain is always `(date, entity_id, entity_type)`. All numeric metrics carry a `confidence_flag` derived from the source data quality score for that day.

### 8.5 Scoring Engines

Scoring engines are Python services that:
1. Read metric values from Gold marts
2. Apply configured weight vectors
3. Normalize sub-scores to 0–10 range
4. Compute weighted final score
5. Write score + factor breakdown to the scoring table

Weights are stored in a `scoring_config` table per client, allowing per-account tuning without code changes.

### 8.6 Recommendation Engine

The recommendation engine is a rules engine backed by YAML/database rule definitions. Each rule has:
- `trigger_conditions`: SQL-expressible conditions on mart data
- `recommendation_type`: enum value from the recommendation taxonomy
- `priority_formula`: expression producing 1–10 priority score
- `owner_mapping`: department/role responsible
- `expected_impact_formula`: expression producing an impact estimate

Rules are evaluated daily against the scoring mart. Triggered rules produce recommendation records.

### 8.7 LLM Extraction Pipeline

Human intelligence inputs are processed through an LLM extraction pipeline:

```
Input Text/Transcript
  → Chunking (if >4000 tokens)
  → Extraction Prompt (structured JSON output instruction)
  → LLM API (Claude/OpenAI)
  → Response Parsing
  → Schema Validation (Pydantic)
  → Signal Records → Human Intelligence Mart
```

The extraction prompt instructs the model to return a JSON array of signal records with fields: `season`, `category`, `product_sku`, `signal_type`, `observation`, `urgency` (1–5), `confidence` (0–1), `owner`, `recommended_action`, `expected_impact`.

---

## 9. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SELERIC SYSTEM ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ SOURCE SYSTEMS                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Shopify  │ │Meta Ads  │ │Google Ads│ │ Amazon   │ │Inventory │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐          │
│  │ Support  │ │ Reviews  │ │ Weather  │ │  Search  │ │  Human   │          │
│  │ Tickets  │ │/Returns  │ │   APIs   │ │  Trends  │ │  Input   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │ API Connectors / File Upload / Webhooks
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ INGESTION SERVICE                                                            │
│  Python Connectors │ Schema Validation (Pydantic) │ Object Storage (Raw)    │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ BRONZE LAYER (PostgreSQL / ClickHouse)                                       │
│  raw__shopify__orders │ raw__meta__campaigns │ raw__google__ads              │
│  raw__amazon__orders  │ raw__inventory__stock │ raw__support__tickets        │
│  raw__weather__signals │ raw__search__trends  │ raw__human__inputs           │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │ dbt staging models
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ SILVER LAYER (Normalized & Joined)                                           │
│  stg__orders │ stg__campaigns │ stg__products │ stg__inventory               │
│  stg__sessions │ stg__support │ stg__weather │ stg__search_trends            │
│  Entity Resolution: int__sku_spine │ int__order_attribution                  │
│  int__campaign_product_join │ int__funnel_sessions                           │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │ dbt mart models
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ GOLD / MART LAYER                                                            │
│  mart_product_analysis_daily │ mart_campaign_analysis_daily                  │
│  mart_funnel_analysis_daily  │ mart_profitability_analysis_daily             │
│  mart_inventory_analysis_daily│ mart_customer_quality_daily                  │
│  mart_context_analysis_daily │ mart_human_intelligence_signals               │
│  mart_forecast_readiness     │ mart_recommendation_log                       │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────────────┐
│ SCORING ENGINES │   │  CLASSIFICATION │   │ RECOMMENDATION ENGINE           │
│ Product Score   │   │  ENGINE         │   │ Rules Engine (YAML/DB)          │
│ Campaign Score  │   │  Product Class  │   │ Priority Scoring                │
│ Funnel Score    │   │  Campaign Class │   │ Owner Assignment                │
│ Seasonality     │   │  Season Class   │   │ Impact Estimation               │
│ Forecast Ready  │   └────────┬────────┘   └─────────────┬───────────────────┘
└────────┬────────┘            │                           │
         └────────────────────▼───────────────────────────▼
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ INTELLIGENCE DELIVERY LAYER                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐ │
│  │  FastAPI      │ │  Next.js      │ │  Daily Email  │ │  Action Log &    │ │
│  │  API Layer    │ │  Dashboard    │ │  Report       │ │  Outcome Tracker │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ LLM INTELLIGENCE PIPELINE (Parallel Flow)                                    │
│  Human Input → Chunking → LLM API → Pydantic Validation → HI Mart           │
│                           ↓                                                  │
│                  Human Intelligence Signals → Score Integration              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ ORCHESTRATION (Dagster / Airflow)                                            │
│  Ingestion DAGs │ Transformation DAGs │ Scoring DAGs │ Report DAGs          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. DATA FLOW

### End-to-End Flow Description

**Step 1 — Source Extraction (Every 3–6 hours)**
Scheduled jobs trigger API connectors for each source system. Connectors authenticate, fetch incremental records since last successful run, validate schemas using Pydantic models, and write raw JSONB records to Bronze tables with metadata (ingestion timestamp, source, run_id).

**Step 2 — Raw Storage**
Raw records land in partitioned Bronze tables. Object storage (S3 or GCS) receives a compressed JSONB snapshot for every ingestion run as archival backup.

**Step 3 — Staging Transformation (dbt, runs after ingestion)**
dbt staging models clean each source: cast data types, normalize dates to IST, standardize currency, handle nulls with documented defaults, deduplicate on source record ID. Output is `stg__*` tables.

**Step 4 — Entity Resolution & Intermediate Joins**
The entity resolution service resolves product and SKU identifiers across sources into `canonical_product_id` and `canonical_sku_id`. Intermediate dbt models build the unified order-to-product-to-campaign attribution join, the funnel session spine, and the inventory-to-order availability timeline.

**Step 5 — Mart Computation (dbt, runs once daily at 06:00 IST)**
dbt mart models compute all analysis metrics at the required grain for each mart table. These are the primary read tables for scoring engines and the API.

**Step 6 — Scoring Engine Jobs (Python, runs after mart completion)**
Scoring services read from mart tables, apply weighted formulas, compute sub-scores and final scores, and write to scoring tables (`score_product_daily`, `score_campaign_daily`, `score_forecast_readiness_daily`).

**Step 7 — Classification Engine (Python, runs after scoring)**
Classification rules evaluate score combinations and metric thresholds to assign product and campaign classifications. Results written to `classification_product_daily`.

**Step 8 — Recommendation Engine (Python, runs after classification)**
Rule engine evaluates all active rules against scoring + classification data. Triggered rules generate recommendation records written to `mart_recommendation_log` with status = 'pending'.

**Step 9 — LLM Extraction (Async, triggered on human input submission)**
Human input submissions trigger an async LLM extraction job. Extracted signals are written to `mart_human_intelligence_signals` and trigger a re-evaluation of relevant product/category scores.

**Step 10 — Intelligence Delivery (06:30–07:00 IST)**
The daily report generator reads from all mart and scoring tables, assembles the structured daily intelligence report, and sends it via email. The dashboard API serves mart data on demand with sub-500ms response times via indexed queries.

**Step 11 — Action Tracking (Continuous)**
When a recommendation is marked as actioned, the system records the action date and pre-action metric snapshot. At T+7 days and T+30 days, automated jobs compute post-action metric changes and write outcomes to the recommendation log.

---

## 11. SOURCE SYSTEMS & REQUIRED DATA POINTS

### 11.1 Shopify

**Orders endpoint:** order_id, created_at, updated_at, financial_status, fulfillment_status, total_price, subtotal_price, total_discounts, total_tax, currency, line_items (product_id, variant_id, sku, quantity, price, discount_allocations), customer_id, shipping_address (city, state, country), source_name, referring_site, tags, note_attributes, refunds (refund_line_items, transactions)

**Products endpoint:** product_id, title, handle, vendor, product_type, tags, variants (variant_id, sku, price, compare_at_price, inventory_item_id, inventory_quantity), images, published_at, status

**Customers endpoint:** customer_id, email (to be pseudonymized), orders_count, total_spent, created_at, tags, accepts_marketing

**Inventory endpoint:** inventory_item_id, sku, available, location_id, updated_at

### 11.2 Meta Ads

**Campaigns:** campaign_id, campaign_name, objective, status, budget_remaining, created_time, start_time, stop_time

**Ad Sets:** adset_id, campaign_id, name, targeting, optimization_goal, bid_strategy, daily_budget, lifetime_budget, status

**Ads:** ad_id, adset_id, name, creative_id, status, created_time

**Insights (at ad, adset, campaign level):** date_start, date_stop, impressions, clicks, spend, reach, frequency, ctr, cpc, cpm, actions (purchase, add_to_cart, view_content, initiate_checkout, complete_registration), action_values, cost_per_action_type, conversion_values, roas

**Creatives:** creative_id, name, title, body, image_url, video_id, call_to_action, object_story_spec

### 11.3 Google Ads

**Campaigns:** campaign_id, name, status, advertising_channel_type, budget, start_date, end_date

**Ad Groups:** ad_group_id, campaign_id, name, status, cpc_bid

**Ads:** ad_id, ad_group_id, type, headlines, descriptions, final_urls, status

**Keywords:** keyword_id, ad_group_id, text, match_type, status, quality_score, first_page_cpc_micros

**Metrics (daily, by campaign/adgroup/ad/keyword):** impressions, clicks, cost, conversions, conversion_value, all_conversions, search_impression_share, quality_score_components

**Shopping:** product_id (merchant center), clicks, impressions, cost, conversions, conversion_value, benchmark_ctr

### 11.4 Amazon Seller Central

**Orders:** amazon_order_id, purchase_date, order_status, fulfillment_channel, sales_channel, ship_service_level, order_items (asin, seller_sku, quantity, item_price, item_tax, promotion_discount), buyer_info (anonymized)

**Inventory:** sku, asin, fnsku, condition, quantity (fulfillable, inbound, reserved, unfulfillable), per_unit_volume, min_replenishment_level

**Advertising (SP, SB, SD):** campaign_id, adgroup_id, ad_id, date, impressions, clicks, spend, sales, orders, acos, roas, keyword, match_type, targeting_type

**Business Reports:** asin, sessions, session_percentage, page_views, page_views_percentage, buy_box_percentage, units_ordered, units_ordered_b2b, unit_session_percentage, ordered_product_sales, total_order_items

**Returns:** return_request_date, order_id, sku, return_quantity, return_reason, resolution

### 11.5 Inventory Management System

Required fields: sku, product_name, opening_stock (date), closing_stock (date), available_stock, reserved_stock, incoming_stock, incoming_expected_date, reorder_point, reorder_quantity, vendor_id, vendor_lead_time_days, last_purchase_price, storage_location, warehouse_id, stockout_flag

### 11.6 Customer Support Platform

Required fields: ticket_id, created_at, resolved_at, channel, product_sku, issue_category (enum: defect, size_fit, delivery, quality, damaged, wrong_item, return_request, general), sentiment_label, resolution_type, tags, agent_notes (to be excluded from PII marts)

### 11.7 Weather APIs (IMD / OpenWeatherMap)

Required fields: date, city, state, region, temperature_c, feels_like_c, temperature_departure_from_normal, humidity_pct, rainfall_mm, rainfall_forecast_mm_7day, heat_wave_flag, cold_wave_flag, thunderstorm_warning, fog_warning, monsoon_onset_flag, monsoon_withdrawal_flag, weather_summary

### 11.8 Search & Market Trends

Required fields: date, keyword, region, search_volume_index (0–100), trend_direction (rising/falling/stable), year_over_year_change, related_queries, platform (google_trends / amazon_search / meta_interest)

### 11.9 Website Event Tracking (First-Party)

Required server-side and client-side ecommerce events (no third-party behavioral analytics tool):

Events: `page_view`, `product_view`, `collection_view`, `search`, `add_to_cart`, `remove_from_cart`, `checkout_started`, `checkout_step_completed`, `purchase`, `refund_initiated`, `review_viewed`, `trust_element_viewed`, `image_gallery_interaction`, `price_comparison_viewed`, `related_product_clicked`

Required event properties: event_id, event_timestamp, session_id (hashed), user_id (pseudonymized), device_type, browser, geo_country, geo_state, geo_city, traffic_source, traffic_medium, traffic_campaign, page_url, product_id, product_sku, category, price_displayed, quantity, cart_value, checkout_step

### 11.10 Human Intelligence Input

Accepted formats: plain text, DOCX transcript, PDF transcript, structured form fields.

Structured form fields: date, meeting_type (enum: founder_review, monday_review, marketing_meeting, procurement_meeting, support_review, sales_feedback, distributor_call, ad_hoc), participants, season_context, duration_minutes, raw_notes_text.

---

## 12. CANONICAL ENTITIES

These are the normalized, source-agnostic master entities that SELERIC operates on:

| Entity | Canonical ID | Description |
|--------|-------------|-------------|
| Product | canonical_product_id | A sellable product across all channels |
| SKU | canonical_sku_id | A specific variant of a product |
| Order | canonical_order_id | A completed transaction from any channel |
| OrderLine | canonical_order_line_id | A single product line within an order |
| Campaign | canonical_campaign_id | An ad campaign on any platform |
| Adset | canonical_adset_id | An ad set / ad group within a campaign |
| Ad | canonical_ad_id | A specific ad unit |
| Creative | canonical_creative_id | An ad creative (image/video/copy) |
| Customer | canonical_customer_id | A buyer across channels (pseudonymized) |
| Session | canonical_session_id | A single website visit session |
| InventoryRecord | canonical_inv_record_id | A stock position at a point in time |
| Vendor | canonical_vendor_id | A supplier or manufacturer |
| SupportTicket | canonical_ticket_id | A customer support interaction |
| HumanSignal | canonical_signal_id | An extracted human intelligence record |
| SeasonContext | canonical_season_context_id | A dated season scoring record |
| WeatherRecord | canonical_weather_id | A weather observation for a location/date |

---

## 13. DATA WAREHOUSE DESIGN

### Technology Stack (Phase 1–5)
- **Primary warehouse:** PostgreSQL 16 with partitioning and columnar extension (pg_mooncake or Citus for analytical queries)
- **Migration path:** dbt models are written to be compatible with ClickHouse and BigQuery SQL dialects, enabling migration without model rewrites

### Schema Organization

```
Database: seleric_{tenant_id}

Schemas:
  raw        -- Bronze layer (source tables)
  staging    -- dbt staging models
  intermediate -- dbt intermediate models (entity resolution, joins)
  marts      -- Gold layer (analysis marts)
  dimensions -- Dimension tables
  facts      -- Fact tables
  scores     -- Scoring output tables
  config     -- System configuration tables
  audit      -- Data quality and run logs
```

### Partitioning Strategy
- All mart tables and fact tables partitioned by `date` (monthly partitions).
- All raw tables partitioned by `ingested_at` (daily partitions), with retention of 90 days in hot storage and archival to object storage beyond.

### Indexing Strategy
- Primary keys on all canonical ID columns.
- Composite indexes on `(date, canonical_entity_id)` for all mart tables.
- BRIN indexes on `ingested_at` for raw tables.
- Partial indexes on `is_active = true` for dimension tables.

---

## 14. BRONZE / RAW LAYER

All raw tables follow this standard schema:

```sql
CREATE TABLE raw.{source}__{entity} (
  raw_record_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_system       TEXT NOT NULL,          -- e.g., 'shopify', 'meta_ads'
  source_entity       TEXT NOT NULL,          -- e.g., 'orders', 'campaigns'
  source_record_id    TEXT NOT NULL,          -- original ID from source
  source_updated_at   TIMESTAMPTZ,            -- last modified time from source
  run_id              TEXT NOT NULL,          -- ingestion job run identifier
  schema_version      TEXT NOT NULL DEFAULT '1.0',
  is_duplicate        BOOLEAN DEFAULT FALSE,
  raw_payload         JSONB NOT NULL,         -- complete source record
  validation_errors   JSONB,                  -- schema validation issues if any
  tenant_id           TEXT NOT NULL
) PARTITION BY RANGE (ingested_at);
```

**Standard raw tables:**
- `raw.shopify__orders`
- `raw.shopify__order_refunds`
- `raw.shopify__products`
- `raw.shopify__inventory_levels`
- `raw.shopify__customers`
- `raw.meta__campaigns`
- `raw.meta__adsets`
- `raw.meta__ads`
- `raw.meta__insights_daily`
- `raw.meta__creatives`
- `raw.google__campaigns`
- `raw.google__ad_groups`
- `raw.google__ads`
- `raw.google__keywords`
- `raw.google__metrics_daily`
- `raw.amazon__orders`
- `raw.amazon__inventory`
- `raw.amazon__advertising`
- `raw.amazon__business_report`
- `raw.amazon__returns`
- `raw.inventory__stock_levels`
- `raw.inventory__purchase_orders`
- `raw.support__tickets`
- `raw.weather__daily`
- `raw.search_trends__keywords`
- `raw.website__events`
- `raw.human__inputs`

---

## 15. SILVER / NORMALIZED LAYER

Silver tables are dbt staging and intermediate models. They clean, cast, and normalize source data without business logic.

### Key Staging Model Patterns

**stg__shopify__orders:**
- Cast: order_id → canonical_order_id, customer_id → canonical_customer_id
- Normalize: currency to INR using daily exchange rate, timestamps to IST
- Derive: total_discounts_pct = total_discounts / subtotal_price
- Filter: exclude test orders (tagged 'test'), orders with financial_status = 'voided'
- Deduplicate: on (source_record_id), keep latest ingested_at

**stg__meta__insights_daily:**
- Cast and normalize date fields
- Compute: ctr = clicks / impressions, cpc = spend / clicks, cpm = (spend / impressions) * 1000
- Flatten: actions array into individual columns (purchase_count, atc_count, view_content_count)
- Derive: attributed_revenue_meta = sum of action_values where action_type = 'purchase'

**int__sku_spine:**
The master entity resolution table. Built by joining the entity_resolution mapping table with all source product/variant tables.

```sql
-- Grain: one row per canonical_sku_id
int__sku_spine:
  canonical_sku_id,
  canonical_product_id,
  shopify_variant_id,
  shopify_product_id,
  amazon_asin,
  amazon_sku,
  google_shopping_product_id,
  internal_sku_code,
  sku_name,
  product_name,
  category_l1,
  category_l2,
  brand,
  is_active,
  resolution_confidence  -- high/medium/low based on match method
```

**int__order_attribution:**
Joins orders with campaign attribution using UTM parameters, platform click IDs, and platform-reported conversion attribution.

**int__funnel_sessions:**
Aggregates website events into session-level funnel records with flags for each funnel stage reached.

---

## 16. GOLD / MART LAYER

Gold marts are the primary read tables for all APIs, dashboards, scoring engines, and reports. Full definitions in Section 18.

---

## 17. FACT & DIMENSION TABLES

### Dimension Tables

**dim_date:**
```sql
date_key DATE PRIMARY KEY,
year INT, quarter INT, month INT, week_of_year INT, day_of_week INT,
day_name TEXT, month_name TEXT, is_weekend BOOLEAN, is_holiday BOOLEAN,
fiscal_year INT, fiscal_quarter INT,
season_name TEXT,   -- Summer / Monsoon / Winter / Transition
is_peak_season BOOLEAN
```

**dim_product:**
```sql
canonical_product_id TEXT PRIMARY KEY,
product_name TEXT, product_handle TEXT,
brand TEXT, vendor TEXT,
category_l1 TEXT, category_l2 TEXT, category_l3 TEXT,
product_type TEXT, tags TEXT[],
launched_at DATE, discontinued_at DATE,
is_active BOOLEAN, is_seasonal BOOLEAN,
season_relevance TEXT[],  -- ['monsoon','winter']
bundle_type TEXT,         -- 'standalone','bundle_parent','bundle_component'
acquisition_product BOOLEAN, retention_product BOOLEAN
```

**dim_sku:**
```sql
canonical_sku_id TEXT PRIMARY KEY,
canonical_product_id TEXT REFERENCES dim_product,
sku_name TEXT, sku_code TEXT,
color TEXT, size TEXT, variant_attributes JSONB,
price NUMERIC, compare_at_price NUMERIC, cogs NUMERIC,
weight_g NUMERIC, is_active BOOLEAN,
shopify_variant_id TEXT, amazon_asin TEXT
```

**dim_campaign:**
```sql
canonical_campaign_id TEXT PRIMARY KEY,
platform TEXT,  -- meta / google / amazon
campaign_name TEXT, campaign_objective TEXT,
target_season TEXT, target_category TEXT,
budget_type TEXT, is_active BOOLEAN,
start_date DATE, end_date DATE
```

**dim_adset:**
```sql
canonical_adset_id TEXT PRIMARY KEY,
canonical_campaign_id TEXT,
adset_name TEXT, optimization_goal TEXT,
audience_type TEXT, budget_daily NUMERIC,
targeting_summary TEXT, is_active BOOLEAN
```

**dim_ad:**
```sql
canonical_ad_id TEXT PRIMARY KEY,
canonical_adset_id TEXT, canonical_creative_id TEXT,
ad_name TEXT, ad_format TEXT, is_active BOOLEAN
```

**dim_creative:**
```sql
canonical_creative_id TEXT PRIMARY KEY,
creative_name TEXT, creative_format TEXT,  -- image/video/carousel
headline TEXT, body_copy TEXT,
image_url TEXT, video_id TEXT,
call_to_action TEXT, seasonal_tag TEXT,
product_featured TEXT[], category_featured TEXT[],
created_at DATE
```

**dim_channel:**
```sql
channel_id TEXT PRIMARY KEY,
channel_name TEXT, channel_type TEXT,  -- paid/organic/marketplace/direct
platform TEXT, is_paid BOOLEAN
```

**dim_customer:**
```sql
canonical_customer_id TEXT PRIMARY KEY,  -- pseudonymized
first_order_date DATE, last_order_date DATE,
order_count INT, total_revenue_lifetime NUMERIC,
customer_segment TEXT, acquisition_channel TEXT,
geo_state TEXT, geo_city TEXT  -- no PII fields
```

**dim_location:**
```sql
location_id TEXT PRIMARY KEY,
city TEXT, state TEXT, region TEXT,
country TEXT, pin_code_prefix TEXT,
climate_zone TEXT, urbanization_level TEXT,
latitude NUMERIC, longitude NUMERIC
```

**dim_season_context:**
```sql
season_context_id TEXT PRIMARY KEY,
season_name TEXT,  -- Summer / Monsoon / Winter
usual_start_month INT, usual_end_month INT,
relevant_categories TEXT[],
trigger_keywords TEXT[],
primary_regions TEXT[]
```

**dim_vendor:**
```sql
canonical_vendor_id TEXT PRIMARY KEY,
vendor_name TEXT, vendor_type TEXT,
lead_time_days_avg INT, lead_time_days_stddev NUMERIC,
reliability_score NUMERIC,  -- 0-10
ontime_delivery_rate NUMERIC,
minimum_order_quantity INT,
active_sku_count INT
```

**dim_offer:**
```sql
offer_id TEXT PRIMARY KEY,
offer_name TEXT, offer_type TEXT,  -- percentage/flat/bogo/bundle
discount_value NUMERIC, discount_pct NUMERIC,
start_date DATE, end_date DATE,
applicable_skus TEXT[], applicable_categories TEXT[],
platform TEXT
```

**dim_human_signal_type:**
```sql
signal_type_id TEXT PRIMARY KEY,
signal_type_name TEXT,  -- market_observation / competitor_signal / demand_signal / risk_signal / inventory_signal / campaign_insight
signal_category TEXT,
default_confidence_band NUMERIC,
default_urgency_band INT
```

### Core Fact Tables

**fact_orders:**
```sql
-- Grain: one row per order line
order_line_id TEXT PRIMARY KEY,
canonical_order_id TEXT,
canonical_customer_id TEXT,
canonical_sku_id TEXT,
canonical_product_id TEXT,
channel_id TEXT,
order_date DATE,
fulfillment_date DATE,
quantity INT,
unit_price NUMERIC,
line_revenue NUMERIC,
discount_amount NUMERIC,
discount_pct NUMERIC,
cogs NUMERIC,
gross_margin NUMERIC,
is_first_order BOOLEAN,
attributed_campaign_id TEXT,
attributed_adset_id TEXT,
traffic_source TEXT,
traffic_medium TEXT,
platform TEXT,  -- shopify / amazon / offline
order_status TEXT,
fulfillment_status TEXT
```

**fact_refunds:**
```sql
-- Grain: one row per refund line
refund_line_id TEXT PRIMARY KEY,
canonical_order_id TEXT,
canonical_sku_id TEXT,
refund_date DATE,
refund_quantity INT,
refund_amount NUMERIC,
refund_reason TEXT,
resolution_type TEXT
```

**fact_ad_performance_daily:**
```sql
-- Grain: date × ad × placement
perf_id TEXT PRIMARY KEY,
date DATE,
canonical_ad_id TEXT,
canonical_adset_id TEXT,
canonical_campaign_id TEXT,
platform TEXT,
impressions BIGINT,
clicks BIGINT,
spend NUMERIC,
reach BIGINT,
frequency NUMERIC,
attributed_purchases INT,
attributed_revenue NUMERIC,
attributed_atc INT,
attributed_checkout_starts INT,
platform_roas NUMERIC,
ctr NUMERIC,
cpc NUMERIC,
cpm NUMERIC
```

**fact_inventory_daily:**
```sql
-- Grain: date × sku × location
inv_record_id TEXT PRIMARY KEY,
date DATE,
canonical_sku_id TEXT,
location_id TEXT,
opening_stock INT,
closing_stock INT,
available_stock INT,
reserved_stock INT,
incoming_stock INT,
incoming_expected_date DATE,
units_sold INT,
units_returned INT,
stockout_flag BOOLEAN,
reorder_triggered BOOLEAN
```

**fact_sessions_daily:**
```sql
-- Grain: date × product × channel (aggregated from raw events)
session_agg_id TEXT PRIMARY KEY,
date DATE,
canonical_product_id TEXT,
traffic_source TEXT, traffic_medium TEXT,
device_type TEXT, geo_state TEXT,
total_sessions INT,
product_page_views INT,
add_to_cart_events INT,
checkout_starts INT,
purchases INT,
high_intent_sessions INT,  -- sessions with >60s dwell + scroll >50%
bounce_sessions INT
```

**fact_support_tickets_daily:**
```sql
-- Grain: date × sku × issue category
support_agg_id TEXT PRIMARY KEY,
date DATE,
canonical_sku_id TEXT,
issue_category TEXT,
ticket_count INT,
resolved_count INT,
avg_resolution_hours NUMERIC,
return_related_count INT,
defect_related_count INT,
size_fit_related_count INT
```

---

## 18. ANALYSIS MARTS

### mart_product_analysis_daily
**Grain:** date × canonical_sku_id

```sql
date DATE,
canonical_sku_id TEXT,
canonical_product_id TEXT,
-- Volume
orders INT, units_sold INT,
-- Availability
in_stock_days INT, stockout_days INT, availability_rate NUMERIC,
sales_velocity_per_instock_day NUMERIC,
-- Revenue & Profitability
gross_revenue NUMERIC, net_revenue NUMERIC,
total_discounts NUMERIC, total_refunds NUMERIC,
cogs NUMERIC, contribution_margin NUMERIC, contribution_margin_pct NUMERIC,
-- Traffic & Conversion
product_page_views INT, total_sessions INT,
orders_per_1000_sessions NUMERIC,
high_intent_conversion_rate NUMERIC,
add_to_cart_rate NUMERIC,
-- Paid Dependency
paid_orders INT, organic_orders INT, paid_dependency_score NUMERIC,
ad_spend_attributed NUMERIC, contribution_roas NUMERIC, platform_roas NUMERIC,
-- Demand Quality
organic_demand_share NUMERIC, repeat_view_rate NUMERIC,
search_demand_lift NUMERIC, product_demand_quality_score NUMERIC,
-- Customer Quality
return_rate NUMERIC, refund_rate NUMERIC, complaint_rate NUMERIC,
repeat_purchase_rate NUMERIC, review_score_avg NUMERIC,
-- Scoring
product_performance_score NUMERIC,
-- Classification
primary_classification TEXT, secondary_classification_1 TEXT,
-- Forecast
forecast_readiness_score NUMERIC, forecast_readiness_band TEXT,
-- Meta
data_confidence_flag TEXT, computed_at TIMESTAMPTZ
```

### mart_campaign_analysis_daily
**Grain:** date × canonical_campaign_id

```sql
date DATE, canonical_campaign_id TEXT, canonical_adset_id TEXT,
platform TEXT, campaign_name TEXT,
-- Volume
impressions BIGINT, clicks BIGINT, spend NUMERIC,
-- Quality
ctr NUMERIC, cpc NUMERIC, cpm NUMERIC, frequency NUMERIC,
click_to_session_rate NUMERIC, high_intent_session_rate NUMERIC,
-- Attribution
attributed_purchases INT, attributed_revenue NUMERIC,
attributed_atc INT, attributed_checkout_starts INT,
-- ROAS Comparison
platform_roas NUMERIC, contribution_roas NUMERIC, break_even_roas NUMERIC,
-- Campaign Margin
total_ad_spend NUMERIC, campaign_contribution_margin NUMERIC,
campaign_cm_pct NUMERIC,
-- Funnel
campaign_atc_rate NUMERIC, campaign_checkout_rate NUMERIC,
campaign_purchase_rate NUMERIC,
-- Fatigue
creative_fatigue_score NUMERIC, paid_dependency_score NUMERIC,
-- Scoring
campaign_quality_score NUMERIC, campaign_classification TEXT,
-- Forecast
forecast_readiness_score NUMERIC,
data_confidence_flag TEXT, computed_at TIMESTAMPTZ
```

### mart_funnel_analysis_daily
**Grain:** date × canonical_product_id × traffic_source

```sql
date DATE, canonical_product_id TEXT, traffic_source TEXT, channel_type TEXT,
-- Funnel Stages
impressions BIGINT, clicks BIGINT,
landing_sessions INT, product_page_views INT,
qualified_sessions INT, add_to_cart_events INT,
checkout_starts INT, purchases INT,
refunds INT, repeat_purchases INT,
-- Stage Conversion Rates
click_to_session_rate NUMERIC, session_to_pdp_rate NUMERIC,
pdp_to_atc_rate NUMERIC, atc_to_checkout_rate NUMERIC,
checkout_to_purchase_rate NUMERIC, purchase_conversion_rate NUMERIC,
-- Per-Session Economics
revenue_per_session NUMERIC, revenue_per_qualified_session NUMERIC,
contribution_per_session NUMERIC,
-- Leakage
primary_leakage_stage TEXT, leakage_severity TEXT,
funnel_efficiency_score NUMERIC,
computed_at TIMESTAMPTZ
```

### mart_profitability_analysis_daily
**Grain:** date × canonical_sku_id × channel

```sql
date DATE, canonical_sku_id TEXT, channel TEXT,
orders INT, units_sold INT,
gross_revenue NUMERIC, discounts NUMERIC, refunds NUMERIC,
net_revenue NUMERIC, cogs NUMERIC, shipping_cost NUMERIC,
packaging_cost NUMERIC, payment_fees NUMERIC, platform_fees NUMERIC,
ad_spend_allocated NUMERIC,
contribution_margin NUMERIC, contribution_margin_pct NUMERIC,
profit_per_order NUMERIC, profit_per_session NUMERIC,
break_even_roas NUMERIC, contribution_roas NUMERIC,
discount_leakage_pct NUMERIC, refund_leakage_pct NUMERIC,
is_profitable BOOLEAN, profitability_tier TEXT,
computed_at TIMESTAMPTZ
```

### mart_inventory_analysis_daily
**Grain:** date × canonical_sku_id

```sql
date DATE, canonical_sku_id TEXT, location_id TEXT,
opening_stock INT, closing_stock INT, available_stock INT,
in_stock_days_rolling_30 INT, stockout_days_rolling_30 INT,
availability_rate_30d NUMERIC,
sales_velocity_per_instock_day NUMERIC,
inventory_days_cover NUMERIC, demand_adjusted_days_cover NUMERIC,
incoming_stock INT, incoming_expected_date DATE,
vendor_lead_time_days INT, vendor_reliability_score NUMERIC,
reorder_risk_score NUMERIC, scale_blocker_flag BOOLEAN,
reorder_recommended BOOLEAN, reorder_urgency TEXT,
computed_at TIMESTAMPTZ
```

### mart_customer_quality_daily
**Grain:** date × canonical_sku_id

```sql
date DATE, canonical_sku_id TEXT,
orders_period INT, return_rate NUMERIC, refund_rate NUMERIC,
replacement_rate NUMERIC, complaint_rate NUMERIC,
support_ticket_rate NUMERIC, defect_rate NUMERIC,
size_fit_issue_rate NUMERIC, delivery_complaint_rate NUMERIC,
review_score_avg NUMERIC, review_count INT,
negative_review_rate NUMERIC, positive_review_rate NUMERIC,
repeat_purchase_rate_30d NUMERIC, repeat_purchase_rate_90d NUMERIC,
cross_sell_rate NUMERIC, ltv_index NUMERIC,
return_adjusted_product_score NUMERIC,
customer_satisfaction_score NUMERIC,
computed_at TIMESTAMPTZ
```

### mart_context_analysis_daily
**Grain:** date × season_name × category_l1

```sql
date DATE, season_name TEXT, category_l1 TEXT,
-- Weather
temperature_avg NUMERIC, humidity_avg NUMERIC, rainfall_mm NUMERIC,
rainfall_forecast_7d NUMERIC, temperature_departure NUMERIC,
heat_wave_flag BOOLEAN, cold_wave_flag BOOLEAN,
weather_score NUMERIC,
-- Historical Baseline
historical_sales_index NUMERIC, yoy_category_lift NUMERIC,
season_onset_lag_days INT,
-- Campaign Response
campaign_ctr_lift_vs_baseline NUMERIC, campaign_roas_lift NUMERIC,
seasonal_atc_lift NUMERIC,
-- Search Demand
search_trend_index NUMERIC, search_trend_direction TEXT,
search_trend_lift_vs_30d NUMERIC,
-- Human Intelligence
hi_signal_count INT, hi_urgency_avg NUMERIC, hi_confidence_avg NUMERIC,
-- Composite
season_context_score NUMERIC, category_season_fit_score NUMERIC,
region_season_fit_score NUMERIC,
recommended_action TEXT, preparation_window_days INT,
computed_at TIMESTAMPTZ
```

### mart_human_intelligence_signals
**Grain:** one row per extracted signal

```sql
signal_id TEXT PRIMARY KEY,
input_id TEXT,  -- references the original human input
extraction_date DATE, input_date DATE,
meeting_type TEXT, speaker TEXT,
season TEXT, category TEXT,
product_sku TEXT, canonical_sku_id TEXT,
signal_type TEXT,
observation TEXT,  -- LLM-extracted text
urgency INT,  -- 1-5
confidence NUMERIC,  -- 0-1.0
owner TEXT, department TEXT,
recommended_action TEXT, expected_impact TEXT,
signal_to_data_match TEXT,  -- confirmed/contradicts/unseen
data_corroboration_flag BOOLEAN,
is_actioned BOOLEAN, actioned_date DATE,
human_validated BOOLEAN, validated_by TEXT
```

### mart_recommendation_log
**Grain:** one row per recommendation

```sql
recommendation_id TEXT PRIMARY KEY,
generated_date DATE, entity_type TEXT, entity_id TEXT,
recommendation_type TEXT,
recommendation_text TEXT,
priority_score NUMERIC,  -- 1-10
department_owner TEXT, individual_owner TEXT,
expected_impact_type TEXT, expected_impact_value NUMERIC,
confidence_score NUMERIC,
trigger_rule_id TEXT, trigger_factors JSONB,
status TEXT,  -- pending / actioned / dismissed / outcome_measured
actioned_date DATE, actioned_by TEXT,
action_notes TEXT,
metric_baseline JSONB,   -- snapshot of key metrics at generation
metric_7d JSONB,         -- metric values 7 days after action
metric_30d JSONB,        -- metric values 30 days after action
outcome_assessment TEXT, outcome_delta NUMERIC
```

### mart_forecast_readiness
**Grain:** date × entity_type × entity_id

```sql
date DATE, entity_type TEXT, entity_id TEXT,
-- Component Scores
data_quality_score NUMERIC,
historical_depth_score NUMERIC,
attribution_coverage_score NUMERIC,
stock_availability_quality_score NUMERIC,
season_context_signal_score NUMERIC,
demand_stability_score NUMERIC,
human_validation_score NUMERIC,
-- Composite
forecast_readiness_score NUMERIC,
readiness_band TEXT,  -- 'do_not_forecast' / 'directional_only' / 'forecast_with_band' / 'forecast_and_act'
-- Blocking Factors
blocking_factors JSONB,  -- list of factors preventing higher score
recommended_improvement TEXT,
computed_at TIMESTAMPTZ
```

---

## 19. METRIC DEFINITIONS

### 19.1 Data Quality Metrics

| Metric | Definition | Computation |
|--------|-----------|-------------|
| freshness_lag_hours | Hours since last successful ingestion | NOW() - last_ingested_at |
| completeness_rate | % of expected records received vs expected | records_received / expected_records |
| duplicate_rate | % of records that are duplicates | duplicate_records / total_records |
| critical_null_rate | % of rows with null in critical fields | rows_with_critical_nulls / total_rows |
| sku_join_coverage | % of order lines successfully joined to canonical SKU | joined_lines / total_lines |
| campaign_join_coverage | % of sessions with campaign attribution | attributed_sessions / total_paid_sessions |
| attribution_coverage | % of revenue with valid attribution | attributed_revenue / total_revenue |
| reconciliation_gap | Absolute difference between source-reported total and warehouse total | ABS(source_total - warehouse_total) |
| source_to_warehouse_variance_pct | Percentage variance between source and warehouse aggregates | (source - warehouse) / source |
| analysis_confidence_score | Weighted composite of above metrics | Weighted average, 0–100 |

### 19.2 Traffic Quality Metrics

| Metric | Definition |
|--------|-----------|
| qualified_session_rate | Sessions with ≥30s dwell AND ≥1 product page view / total sessions |
| paid_vs_organic_split | % of sessions from paid sources |
| new_vs_returning_rate | % of sessions from new visitors |
| bounce_rate | Sessions with single page view and <10s dwell / total sessions |
| geo_relevance_rate | Sessions from target geographies / total sessions |
| device_conversion_split | Conversion rate segmented by device type |
| traffic_quality_score | Weighted: 30% qualified session rate + 25% source intent mix + 20% bounce rate inverse + 15% geo relevance + 10% device mix |

### 19.3 Creative & Campaign Quality Metrics

| Metric | Definition |
|--------|-----------|
| ctr | clicks / impressions |
| cpc | spend / clicks |
| cpm | (spend / impressions) × 1000 |
| frequency | impressions / unique reach |
| creative_fatigue_score | When frequency > 3.5 AND CTR decline ≥ 20% vs D1-3 performance |
| click_to_session_rate | Sessions from campaign / clicks reported by platform |
| high_intent_session_rate | High-intent sessions from campaign / total sessions from campaign |
| campaign_contribution_margin | Net revenue from attributed orders − COGS − shipping − platform fees − ad spend |
| platform_roas | attributed_revenue_platform / ad_spend |
| contribution_roas | net_revenue_attributed / (ad_spend + cogs + fulfillment_costs) |
| break_even_roas | 1 / gross_margin_pct |
| campaign_quality_score | Weighted composite — see Section 21 |
| paid_dependency_score | % of product revenue requiring paid media |

### 19.4 Website / PDP / Session Behavior Metrics

| Metric | Definition |
|--------|-----------|
| product_page_views | Count of product_view events for the SKU |
| add_to_cart_rate | add_to_cart events / product_page_views |
| checkout_start_rate | checkout_started events / add_to_cart events |
| checkout_completion_rate | purchases / checkout_started events |
| high_intent_session_conversion_rate | Purchases / high_intent_sessions |
| section_engagement | % of sessions with scroll beyond key page section |
| price_exposure | % of sessions where compare_at_price was visible |
| review_trust_exposure | % of sessions where review section was scrolled to |
| conversion_readiness_score | Composite: ATC rate + checkout completion rate + high-intent CVR + trust exposure |
| friction_classification | Stage with the largest absolute drop in funnel for this product |

### 19.5 Funnel Quality Metrics

| Metric | Definition |
|--------|-----------|
| click_to_session_rate | landing_sessions / platform_reported_clicks |
| session_to_pdp_rate | product_page_views / total_sessions |
| pdp_to_atc_rate | add_to_cart_events / product_page_views |
| atc_to_checkout_rate | checkout_starts / add_to_cart_events |
| checkout_to_purchase_rate | purchases / checkout_starts |
| purchase_conversion_rate | purchases / landing_sessions |
| revenue_per_session | net_revenue / total_sessions |
| revenue_per_qualified_session | net_revenue / qualified_sessions |
| contribution_per_session | contribution_margin / total_sessions |
| primary_leakage_stage | Stage with the largest relative drop vs category benchmark |

### 19.6 Product Demand Quality Metrics

| Metric | Definition |
|--------|-----------|
| sales_velocity_per_instock_day | units_sold / in_stock_days (rolling 30d) |
| orders_per_1000_sessions | (orders / product_page_sessions) × 1000 |
| high_intent_conversion_rate | orders / high_intent_sessions |
| organic_demand_share | organic_orders / total_orders |
| paid_dependency | paid_attributed_orders / total_orders |
| repeat_view_rate | return_product_page_sessions / total_product_page_sessions |
| search_demand_lift | search_trend_index today / search_trend_index 30d ago |
| product_demand_quality_score | Weighted composite — see Section 20 |

### 19.7 Profitability Metrics

| Metric | Definition |
|--------|-----------|
| gross_revenue | sum(unit_price × quantity) before discounts |
| net_revenue | gross_revenue − discounts − refunds |
| contribution_margin | net_revenue − cogs − shipping − packaging − payment_fees − platform_fees − ad_spend |
| contribution_margin_pct | contribution_margin / net_revenue |
| contribution_roas | net_revenue / (ad_spend + cogs + fulfillment) |
| profit_per_order | contribution_margin / order_count |
| profit_per_session | contribution_margin / total_sessions |
| break_even_roas | 1 / (1 − cogs_pct − fulfillment_pct − fees_pct) |
| discount_leakage_pct | total_discounts / gross_revenue |
| refund_leakage_pct | total_refunds / gross_revenue |

### 19.8 Inventory & Operational Readiness Metrics

| Metric | Definition |
|--------|-----------|
| availability_rate | in_stock_days / total_days (rolling 30d) |
| sales_velocity_per_instock_day | units_sold / in_stock_days |
| inventory_days_cover | available_stock / avg_daily_sales |
| demand_adjusted_days_cover | available_stock / projected_daily_demand |
| reorder_risk_score | Triggered when days_cover < vendor_lead_time × 1.5 |
| scale_blocker_flag | TRUE when availability_rate < 70% OR days_cover < 14 |

### 19.9 Customer Satisfaction Metrics

| Metric | Definition |
|--------|-----------|
| return_rate | returned_units / units_sold |
| refund_rate | refunded_orders / total_orders |
| complaint_rate | support_tickets / orders |
| repeat_purchase_rate_30d | customers_with_2plus_orders_in_30d / customers_with_1plus_order_in_30d |
| ltv_index | customer_lifetime_value_index normalized to 0–10 |
| return_adjusted_product_score | product_performance_score × (1 − return_rate) |

### 19.10 Seasonality Context Metrics

| Metric | Definition |
|--------|-----------|
| weather_score | Composite: temperature_departure + rainfall_index + humidity_index + warning_flags |
| seasonality_index | Historical sales lift for category in this date window vs annual average |
| category_season_fit | % of category SKUs that have season_relevance matching current season |
| search_trend_lift | search_volume_index today / 30d moving average |
| season_context_score | Weighted: 30% weather + 20% historical + 15% campaign response + 15% product demand + 10% search trends + 10% human intelligence |

### 19.11 Human Intelligence Metrics

| Metric | Definition |
|--------|-----------|
| human_signal_count | Count of signals extracted in rolling 30d window for entity |
| urgency_score | Weighted avg urgency of signals for entity (1–5 scale) |
| confidence_score | Weighted avg confidence of signals for entity (0–1.0) |
| signal_repetition | Count of signals with same signal_type from different sources |
| department_agreement | % of departments with at least one corroborating signal |
| signal_to_data_match | % of signals where warehouse data confirms the observation |
| unseen_signal_flag | Signal type not seen in data (may be leading indicator) |

---

## 20. PRODUCT PERFORMANCE SCORING MODEL

### Formula v1

```
Product Performance Score (0–10) =

  (0.20 × Demand Quality Score)
+ (0.20 × Profitability Score)
+ (0.15 × Conversion Efficiency Score)
+ (0.15 × Customer Satisfaction Score)
+ (0.10 × Inventory Scalability Score)
+ (0.10 × Campaign Efficiency Score)
+ (0.05 × Retention Value Score)
+ (0.05 × Strategic Fit Score)
```

### Component Definitions

**Demand Quality Score (0–10)**
Inputs: organic_demand_share, sales_velocity_per_instock_day vs category median, orders_per_1000_sessions vs category median, search_demand_lift, paid_dependency (inverse)
Formula: Normalize each to 0–10, apply equal weights within component.
High score = strong organic demand, sells when in stock, above-average qualified conversion.

**Profitability Score (0–10)**
Inputs: contribution_margin_pct vs target threshold (brand-configurable, default 30%), break_even_roas coverage, discount_leakage_pct (inverse), refund_leakage_pct (inverse)
High score = healthy contribution margin, sells without heavy discounting, low refund leakage.

**Conversion Efficiency Score (0–10)**
Inputs: high_intent_conversion_rate vs category benchmark, pdp_to_atc_rate vs benchmark, atc_to_checkout_rate, checkout_to_purchase_rate, price_exposure rate, review_trust_exposure rate
High score = product page converts well when the right traffic arrives.

**Customer Satisfaction Score (0–10)**
Inputs: return_rate (inverse), complaint_rate (inverse), review_score_avg, negative_review_rate (inverse)
Formula: review_score normalized to 0–10 + (1 − return_rate) × 10 averaged with others.
High score = customers like what they receive.

**Inventory Scalability Score (0–10)**
Inputs: availability_rate_30d, demand_adjusted_days_cover, scale_blocker_flag (if TRUE → score capped at 3), vendor_reliability_score
High score = product is reliably in stock and supply chain can support scale.

**Campaign Efficiency Score (0–10)**
Inputs: contribution_roas vs break_even_roas (ratio), campaign_quality_score of best associated campaign, paid_dependency (inverse applied here as efficiency measure)
High score = campaigns for this product generate real margin, not just platform ROAS.

**Retention Value Score (0–10)**
Inputs: repeat_purchase_rate_30d, repeat_purchase_rate_90d, cross_sell_rate, ltv_index
High score = customers bought this product and came back.

**Strategic Fit Score (0–10)**
Inputs: season_context_score of matching season, category_season_fit, human_intelligence_signal_score for the SKU, is_acquisition_product or is_retention_product flags
High score = product is contextually relevant right now and strategically important.

### Score Storage
Every score record stores:
- All 8 component scores
- All individual metric inputs per component
- Weight configuration used (config_version)
- data_confidence_flag
- computed_at

---

## 21. CAMPAIGN QUALITY SCORING MODEL

### Formula v1

```
Campaign Quality Score (0–10) =

  (0.25 × Demand Quality Signal)
+ (0.25 × Profitability Signal)
+ (0.20 × Traffic Quality Signal)
+ (0.15 × Funnel Efficiency Signal)
+ (0.10 × Creative Health Signal)
+ (0.05 × Scale Signal)
```

### Component Definitions

**Demand Quality Signal**
Inputs: high_intent_session_rate, click_to_session_rate, high_intent_conversion_rate of attributed traffic
High score = campaign brings people who actually want to buy.

**Profitability Signal**
Inputs: contribution_roas vs break_even_roas, campaign_contribution_margin_pct
Capped: if contribution_roas < break_even_roas, this component scores 0–2 maximum.
High score = campaign generates real margin after all costs.

**Traffic Quality Signal**
Inputs: click_to_session_rate, qualified_session_rate of attributed traffic, geo_relevance, device_conversion_split
High score = clicks become real, qualified sessions.

**Funnel Efficiency Signal**
Inputs: pdp_to_atc_rate, atc_to_checkout_rate, checkout_to_purchase_rate of campaign-attributed sessions
High score = traffic moving through the funnel without major leakage.

**Creative Health Signal**
Inputs: creative_fatigue_score (inverse), frequency vs 3.5 threshold, CTR trend direction
High score = creative is not fatigued, CTR is holding.

**Scale Signal**
Inputs: profitable_at_current_spend BOOLEAN, marginal_contribution_positive BOOLEAN, inventory_days_cover > 21 for featured products
High score = campaign has room to scale both financially and operationally.

---

## 22. FUNNEL ANALYSIS MODEL

### Funnel Stage Definitions

| Stage | Trigger Event | Definition |
|-------|--------------|------------|
| 1. Impression | platform_impression | Ad served to a user |
| 2. Click | platform_click | User clicked the ad |
| 3. Landing Session | session_started after ad click | Session began from campaign traffic |
| 4. Product Page View | product_view event | User viewed the product detail page |
| 5. Qualified Session | dwell ≥ 30s + ≥1 PDP view | Session with genuine engagement |
| 6. Add to Cart | add_to_cart event | Product added to cart |
| 7. Checkout Start | checkout_started event | Checkout process initiated |
| 8. Purchase | purchase event | Transaction completed |
| 9. No Return | absence of refund_initiated in 30d | Purchase not returned |
| 10. Repeat Purchase | second purchase event within 90d | Customer purchased again |

### Leakage Classification

The funnel model identifies the single stage with the largest relative drop vs category benchmark. This is the `primary_leakage_stage`. Leakage severity is classified:

- **Critical:** Stage conversion rate > 50% below category benchmark
- **High:** 30–50% below
- **Medium:** 15–30% below
- **Normal:** within 15% of benchmark

### Funnel Diagnostic Questions Answered

- Which stage has the most drop-off for this product from this source?
- Is the leakage at ad-to-click (creative problem) or click-to-session (landing page mismatch)?
- Is the leakage at PDP-to-ATC (product page problem) or ATC-to-checkout (pricing/trust problem)?
- Is checkout completion low (payment friction) or is checkout start low (price sensitivity)?

---

## 23. PROFITABILITY ANALYSIS MODEL

### Unit Economics Hierarchy

The profitability model computes economics at four levels:
1. **Line-level:** per order line
2. **Order-level:** all lines in an order
3. **SKU-daily:** aggregated per SKU per day
4. **Campaign-daily:** aggregated for all orders attributed to a campaign

### Cost Component Mapping

```
Gross Revenue
  − Discounts                → Net Revenue Before Refunds
  − Refunds                  → Net Revenue
  − COGS                     → Gross Margin
  − Shipping Cost            → Post-Shipping Margin
  − Packaging Cost
  − Payment Processing Fees  → Pre-Platform Margin
  − Marketplace/Platform Fees
  − Ad Spend (attributed)    → Contribution Margin
```

### Break-Even ROAS Calculation

```
Break-Even ROAS = 1 / (1 − cogs_pct − fulfillment_pct − fees_pct − target_cm_pct)

Where:
  cogs_pct = COGS / gross_revenue
  fulfillment_pct = (shipping + packaging) / gross_revenue
  fees_pct = (payment_fees + platform_fees) / gross_revenue
  target_cm_pct = minimum acceptable contribution margin (brand-configured, default 10%)
```

Any campaign or product where contribution_roas < break_even_roas is flagged as margin-negative.

### Discount Dependency Analysis

A SKU is flagged as discount-dependent if:
- average_discount_pct > 15% AND
- orders on discount_days / total_orders > 60%

---

## 24. INVENTORY READINESS MODEL

### Availability Scoring

```
availability_rate = in_stock_days_30d / 30

Grade:
  ≥ 95%  → A (Reliable)
  85–94% → B (Acceptable)
  70–84% → C (Risk)
  < 70%  → D (Scale Blocker)
```

### Days Cover Calculation

```
inventory_days_cover = available_stock / avg_daily_sales_30d
demand_adjusted_days_cover = available_stock / projected_daily_demand_20d
```

Where `projected_daily_demand_20d` accounts for seasonality score uplift. If the season context score is ≥ 7, the projected demand is elevated by the season uplift factor.

### Reorder Risk Score

```
reorder_risk_score = 0–10

Computed from:
  - days_cover vs vendor_lead_time ratio (40%)
  - availability_rate_30d (30%)
  - vendor_reliability_score (20%)
  - incoming_stock coverage vs projected demand (10%)

scale_blocker_flag = TRUE when:
  (availability_rate < 70%) OR
  (demand_adjusted_days_cover < vendor_lead_time_days) OR
  (reorder_risk_score ≥ 7)
```

---

## 25. SEASONALITY / CONTEXT ANALYSIS MODEL

### Season Context Score Formula

```
Season Context Score (0–10) =

  (0.30 × Weather Signal Score)
+ (0.20 × Historical Sales Pattern Score)
+ (0.15 × Campaign Performance Signal Score)
+ (0.15 × Product Demand Signal Score)
+ (0.10 × Search/Market Trend Score)
+ (0.10 × Human Intelligence Signal Score)
```

### Weather Signal Score Computation

Computed per season (Summer / Monsoon / Winter) per date:

**Monsoon:**
- rainfall_mm > 5 → +2 points
- rainfall_forecast_7d_mm > 30 → +2 points
- humidity > 80% → +1.5 points
- monsoon_onset_flag = TRUE → +2 points
- thunderstorm_warning = TRUE → +0.5 points
- temperature_departure_negative = TRUE → +1 point (cooling from summer peak)
Cap at 10.

**Summer:**
- temperature_c > 38 → +2 points per degree above threshold (capped at +4)
- heat_wave_flag = TRUE → +2 points
- temperature_departure_positive > 2 → +1 point
- rainfall_mm < 1 (dry) → +1 point
Cap at 10.

**Winter:**
- temperature_c < 15 → +2 points
- temperature_c < 10 → additional +2 points
- cold_wave_flag = TRUE → +2 points
- fog_warning = TRUE → +1 point
Cap at 10.

### Historical Sales Pattern Score

Computed using a 3-year sales history (where available) at the category level:
- Normalize category revenue by month to an index (annual average = 5)
- Apply rolling smoothing (7-day centered moving average)
- Score = normalized historical index for this date window

### Action Thresholds

| Context Score | Stage | Recommended Preparation |
|--------------|-------|------------------------|
| 0–2 | Dormant | Monitor only |
| 3–4 | Early Signal | Start content planning, inventory check |
| 5–6 | Preparation Window | Launch awareness, confirm stock |
| 7–8 | Active Season | Increase spend, push campaigns |
| 9–10 | Peak Spike | Aggressive scaling, daily monitoring |

### 7-Day and 20-Day Forecast (Rule-Based, Phase 1–5)

Phase 1–5 does not use ML forecasting for seasonality. Instead:
- 7-day score forecast = current score + weighted sum of (weather_forecast_trend × 0.4 + search_trend_direction_7d × 0.3 + historical_score_7d_ahead × 0.3)
- 20-day score forecast = historical_score_20d_ahead × 0.5 + current_trend_extrapolation × 0.3 + human_intelligence_signal_20d × 0.2

---

## 26. HUMAN INTELLIGENCE EXTRACTION MODEL

### Ingestion Flow

```
Input received (text / transcript / form)
  → Saved to raw.human__inputs with metadata
  → Chunked if > 3000 tokens
  → Each chunk → LLM extraction API call
  → Response parsed to structured JSON
  → Pydantic schema validation
  → Validated records → mart_human_intelligence_signals
  → Failed records → extraction_errors table for manual review
```

### LLM Extraction Prompt

```
System: You are a business intelligence analyst. Extract structured signals from business meeting notes and transcripts. Return ONLY a JSON array. No preamble. No markdown.

Each signal must have these exact fields:
  season: "Summer" | "Monsoon" | "Winter" | "General" | null
  category: string or null
  product_sku: string or null
  signal_type: "demand_signal" | "competitor_signal" | "market_observation" | "inventory_signal" | "campaign_insight" | "risk_signal" | "product_opportunity" | "consumer_behavior"
  observation: string (the extracted insight in 1-3 sentences)
  urgency: integer 1-5 (1=low, 5=critical)
  confidence: float 0.0-1.0
  owner: string or null (department or role who should act)
  recommended_action: string or null
  expected_impact: string or null

User: Extract signals from the following text: {input_text}
```

### Signal Validation Rules

Post-extraction validation (Pydantic):
- signal_type must be one of the defined enum values
- urgency must be integer 1–5
- confidence must be float 0.0–1.0
- observation must be non-empty string
- At least one of: season, category, product_sku must be non-null

### Signal Integration

Extracted signals that reference a canonical_sku_id or category trigger a re-computation of the `human_intelligence_signal_score` for that entity, which feeds into the product_performance_score and season_context_score on next daily run.

---

## 27. FORECAST READINESS MODEL

### Formula

```
Forecast Readiness Score (0–100) =

  (25 × data_quality_sub_score)
+ (20 × historical_depth_sub_score)
+ (15 × attribution_coverage_sub_score)
+ (15 × stock_availability_quality_sub_score)
+ (10 × season_context_signal_sub_score)
+ (10 × demand_stability_sub_score)
+ (5  × human_validation_sub_score)
```

### Sub-Score Definitions

**data_quality_sub_score (0–1.0)**
= analysis_confidence_score / 100
Based on completeness, freshness, null rate, join coverage for this SKU.

**historical_depth_sub_score (0–1.0)**
- < 30 days of data → 0.0
- 30–89 days → 0.3
- 90–179 days → 0.6
- 180–364 days → 0.8
- 365+ days → 1.0

**attribution_coverage_sub_score (0–1.0)**
= attributed_revenue / total_revenue (for this SKU, rolling 90d)

**stock_availability_quality_sub_score (0–1.0)**
= availability_rate_90d
Products with significant stockout periods have distorted demand signals. High stockouts reduce readiness.

**season_context_signal_sub_score (0–1.0)**
= season_context_score / 10 for relevant season
High score = good contextual data to condition the forecast.

**demand_stability_sub_score (0–1.0)**
Computed as 1 − coefficient_of_variation(weekly_orders, rolling_12_weeks)
Stable demand = high score. Highly volatile = low score.

**human_validation_sub_score (0–1.0)**
= min(1.0, (human_validated_signals_count × 0.25))
At least 4 validated human signals for this SKU/category scores 1.0.

### Readiness Bands

| Score | Band | Action |
|-------|------|--------|
| 0–39 | do_not_forecast | Block forecasting. Surface blocking factors. |
| 40–59 | directional_only | Allow trend direction only, no point forecast. |
| 60–79 | forecast_with_band | Allow forecast with confidence intervals. |
| 80–100 | forecast_and_act | Full forecast. Attach to recommendation engine. |

---

## 28. RECOMMENDATION ENGINE LOGIC

### Rule Structure

Each rule is defined as:

```yaml
rule_id: REC-001
name: scale_winner_product
trigger:
  product_performance_score: ">= 7.5"
  availability_rate_30d: ">= 0.85"
  contribution_roas: "> break_even_roas"
  primary_classification: "scale_winner"
recommendation_type: "scale_product"
recommendation_text: "Product {product_name} scores {score}/10 and is profitable. Recommend increasing traffic allocation and ad budget."
priority_formula: "product_performance_score * 1.2"
owner: "performance_marketing"
expected_impact_type: "revenue"
expected_impact_formula: "current_daily_revenue * 0.3 * 20"  # 30% lift over 20 days
confidence_formula: "min(1.0, forecast_readiness_score / 80)"
```

### Core Recommendation Types

| Type | Trigger Conditions | Owner |
|------|--------------------|-------|
| scale_product | PPS ≥ 7.5, availability ≥ 85%, CM positive | Performance Mktg |
| increase_traffic | High conv rate, low traffic, low paid dependency | Performance Mktg |
| reduce_paid_spend | Contribution ROAS < break-even, high paid dependency | Performance Mktg |
| fix_pdp | PDP-to-ATC rate < 50% of category benchmark | Product/Content |
| improve_trust_proof | Review count < 10 OR review_trust_exposure < 40% | Content Team |
| improve_price_justification | High compare_at_price but low add_to_cart rate | Pricing Team |
| reorder_inventory | reorder_risk_score ≥ 7 OR days_cover < lead_time | Procurement |
| block_scaling | scale_blocker_flag = TRUE | Procurement |
| pause_sku | PPS < 3.0 AND profitability_score < 2 AND no seasonality signal | Category Mgmt |
| bundle_sku | Low standalone orders, high cross_sell_rate with complement SKU | Category Mgmt |
| reduce_discount_dependency | discount_dependent = TRUE AND cm_pct < threshold | Pricing Team |
| investigate_returns | return_rate > 15% OR return_rate trending up 3 weeks | Product/QA |
| refresh_creative | creative_fatigue_score ≥ 7 OR CTR declining ≥ 25% over 7d | Creative Team |
| shift_campaign_budget | Low-quality campaign draining budget, higher-quality campaign underfunded | Performance Mktg |
| prepare_seasonal_campaign | season_context_score ≥ 5, category_season_fit ≥ 70%, forecast 20d score ≥ 7 | Marketing |
| launch_procurement_alert | Seasonal score rising + demand_adjusted_days_cover < 30 | Procurement |

### Priority Score

Recommendations are ranked by priority_score within each owner/department. Scores range 1–10. The score combines:
- Expected impact magnitude
- Urgency (time sensitivity of the opportunity or risk)
- Confidence in the trigger data
- Whether a human signal corroborates the system signal (bonus: +1 if signal_to_data_match = 'confirmed')

### Deduplication

If a recommendation of the same type for the same entity already exists with status = 'pending', no duplicate is generated. The existing recommendation's `last_triggered_at` is updated instead.

---

## 29. CLASSIFICATION LOGIC

### Product Classifications

Classification is assigned based on score thresholds and metric combinations. Rules are evaluated in priority order; the first matching rule assigns the primary classification.

| Classification | Primary Conditions |
|---------------|-------------------|
| **scale_winner** | PPS ≥ 7.5 AND contribution_cm_pct ≥ target AND availability ≥ 85% AND return_rate < 10% |
| **hidden_gem** | orders_per_1000_sessions ≥ 1.5× category median AND total_sessions < category median AND PPS ≥ 6.0 |
| **volume_trap** | order_count ≥ category top_quartile AND cm_pct < target AND paid_dependency > 70% AND return_rate > 12% |
| **stock_constrained_winner** | PPS ≥ 6.5 AND availability_rate < 70% AND sales_velocity_per_instock_day ≥ category 75th percentile |
| **discount_dependent** | discount_dependent_flag = TRUE AND contribution_roas < 1.5× break_even_roas |
| **return_risk** | return_rate > 18% OR complaint_rate > 5% OR negative_review_rate > 25% |
| **low_quality_demand** | paid_dependency > 85% AND high_intent_conversion_rate < 0.3× benchmark AND organic_demand_share < 10% |
| **margin_risk** | cm_pct < 0% OR (cm_pct < 10% AND discount_leakage > 20%) |
| **seasonal_opportunity** | season_context_score ≥ 6.5 AND category_season_fit ≥ 70% AND current_orders < expected_seasonal_orders |
| **bundle_anchor** | cross_sell_rate ≥ 30% AND is frequently co-purchased with ≥ 2 other SKUs |
| **acquisition_product** | new_customer_rate ≥ 60% AND repeat_purchase_rate < 20% |
| **retention_product** | repeat_purchase_rate_90d ≥ 40% OR cross_sell_contribution ≥ 25% |
| **kill_pause_candidate** | PPS < 2.5 AND cm_pct < 0% AND no seasonal signal AND no human signal |

Products not matching any primary classification receive: `requires_investigation`.

### Campaign Classifications

| Classification | Conditions |
|---------------|-----------|
| **profitable_scaler** | Campaign quality score ≥ 7.5 AND contribution_roas > break_even × 1.5 AND scale headroom exists |
| **quality_demand_driver** | High-intent session rate ≥ benchmark AND contribution_roas > break_even AND budget < optimal |
| **clickbait_traffic** | CTR > benchmark × 2 AND click_to_session_rate < 60% AND high_intent_rate < 20% |
| **platform_roas_trap** | platform_roas > 3 AND contribution_roas < break_even |
| **creative_fatigue** | creative_fatigue_score ≥ 7 AND CTR declining for ≥ 7 days |
| **ad_to_page_mismatch** | click_to_session_rate > 80% AND pdp_to_atc_rate < 30% of benchmark |
| **low_intent_traffic** | qualified_session_rate < 20% AND contribution_per_session < 0 |
| **profitable_but_underfunded** | contribution_roas > break_even × 2 AND spend < 50% of budget capacity AND inventory cover > 21d |
| **high_spend_low_margin** | spend > account 75th percentile AND contribution_roas < break_even |

---

## 30. API REQUIREMENTS

### Authentication
All API endpoints require Bearer JWT token. Tokens encode `tenant_id`, `user_id`, `role`. All queries are automatically scoped to `tenant_id`.

### Standard Response Envelope
```json
{
  "status": "success" | "error",
  "data": { ... },
  "meta": {
    "computed_at": "ISO8601",
    "data_freshness": "ISO8601",
    "confidence_flag": "high" | "medium" | "low",
    "page": 1,
    "total": 240
  },
  "errors": []
}
```

### Endpoint Definitions

**Product Analysis**
```
GET /api/v1/products
  Query: date, category, classification, min_score, max_score, page, limit
  Returns: list of product analysis records

GET /api/v1/products/{sku_id}
  Returns: full product analysis detail with all scores and factors

GET /api/v1/products/{sku_id}/history
  Query: start_date, end_date
  Returns: time series of product scores and key metrics

GET /api/v1/products/{sku_id}/recommendations
  Returns: active recommendations for this SKU
```

**Campaign Analysis**
```
GET /api/v1/campaigns
  Query: date, platform, classification, min_score
  Returns: campaign analysis list

GET /api/v1/campaigns/{campaign_id}
  Returns: full campaign analysis

GET /api/v1/campaigns/{campaign_id}/funnel
  Returns: funnel stage breakdown for campaign

GET /api/v1/campaigns/{campaign_id}/creatives
  Returns: creative performance for campaign ads
```

**Funnel Analysis**
```
GET /api/v1/funnel
  Query: date, product_id, traffic_source, channel
  Returns: funnel stage metrics and leakage analysis

GET /api/v1/funnel/leakage
  Query: date, min_severity
  Returns: all active funnel leakage points ranked by severity
```

**Profitability**
```
GET /api/v1/profitability/products
  Query: date, channel, min_cm_pct, max_cm_pct
  Returns: profitability records for all SKUs

GET /api/v1/profitability/campaigns
  Query: date, platform
  Returns: campaign-level profitability

GET /api/v1/profitability/breakdown/{sku_id}
  Returns: full unit economics breakdown for SKU
```

**Inventory Analysis**
```
GET /api/v1/inventory
  Query: reorder_risk_min, scale_blocker_only, low_cover_days_max
  Returns: inventory readiness records

GET /api/v1/inventory/alerts
  Returns: all active inventory risk alerts ranked by urgency

GET /api/v1/inventory/{sku_id}
  Returns: full inventory analysis and reorder recommendation
```

**Seasonality / Context**
```
GET /api/v1/context/seasons
  Query: date
  Returns: current season scores for all three seasons

GET /api/v1/context/categories
  Query: date, season
  Returns: category season fit scores

GET /api/v1/context/forecast
  Query: days_ahead (7 or 20)
  Returns: projected season context scores
```

**Recommendations**
```
GET /api/v1/recommendations
  Query: status, owner, priority_min, entity_type, entity_id
  Returns: recommendation feed

PATCH /api/v1/recommendations/{rec_id}
  Body: { "status": "actioned" | "dismissed", "actioned_by": "user_id", "notes": "..." }
  Returns: updated recommendation

GET /api/v1/recommendations/outcomes
  Query: date_range, recommendation_type
  Returns: outcome tracking for actioned recommendations
```

**Human Intelligence**
```
POST /api/v1/human-intelligence/upload
  Body: multipart/form-data with file or text
  Returns: input_id, status, extracted_signal_count

GET /api/v1/human-intelligence/signals
  Query: date_range, season, category, urgency_min
  Returns: extracted signal records

PATCH /api/v1/human-intelligence/signals/{signal_id}
  Body: { "human_validated": true, "validated_by": "user_id" }
```

**Forecast Readiness**
```
GET /api/v1/forecast-readiness
  Query: entity_type, min_band, date
  Returns: forecast readiness scores and bands

GET /api/v1/forecast-readiness/{entity_id}
  Returns: full readiness breakdown with blocking factors
```

**Data Quality**
```
GET /api/v1/data-quality/sources
  Returns: per-source quality scores

GET /api/v1/data-quality/alerts
  Returns: active data quality issues
```

---

## 31. BACKEND SERVICES

### Service Architecture (Microservices-Lite)

SELERIC uses a modular monolith in Phase 1–3, decomposable to microservices in Phase 4+.

**Ingestion Service**
- Manages all source connectors
- Schedules incremental and full refreshes
- Writes raw records to Bronze layer
- Publishes `ingestion_completed` events
- Tech: Python, FastAPI, APScheduler, SQLAlchemy

**Transformation Service**
- Wraps dbt CLI execution
- Triggers dbt model runs on `ingestion_completed` events
- Manages dbt DAG sequencing (staging → intermediate → marts)
- Publishes `mart_refresh_completed` events
- Tech: Python, dbt-core, subprocess/dbt-runner

**Metric Computation Service**
- Executes dbt metrics layer
- Computes derived metrics not expressible in pure dbt SQL
- Writes to metric store
- Tech: Python, dbt-metrics, pandas for complex computations

**Scoring Service**
- Reads from Gold marts
- Executes scoring formulas per entity
- Stores scored records with factor breakdown
- Publishes `scores_updated` events
- Tech: Python, numpy, SQLAlchemy

**Classification Service**
- Reads scoring output
- Evaluates classification rules
- Assigns primary and secondary classifications
- Tech: Python, rule engine (custom YAML-backed)

**Recommendation Engine Service**
- Reads scoring + classification output
- Evaluates recommendation rules
- Generates, deduplicates, and stores recommendations
- Tech: Python, YAML rule engine

**Human Intelligence Service**
- Accepts text/file inputs
- Manages LLM extraction pipeline
- Validates and stores signal records
- Triggers score re-evaluation for affected entities
- Tech: Python, FastAPI, OpenAI/Claude API, Pydantic

**Data Quality Service**
- Computes data quality metrics per source per day
- Publishes quality alerts
- Blocks or flags analysis outputs below confidence threshold
- Tech: Python, dbt tests, Great Expectations or custom validators

**Analysis API Service**
- Serves all read API endpoints
- Reads exclusively from Gold mart tables
- Handles authentication, tenant scoping, pagination
- Tech: Python, FastAPI, SQLAlchemy, Redis (query cache)

**Notification Service**
- Generates daily intelligence report
- Sends email via transactional email provider (SendGrid / AWS SES)
- Manages alert notifications
- Tech: Python, Jinja2 templates, email provider SDK

**Admin / Config Service**
- Manages client configuration (scoring weights, thresholds, cost mappings)
- Manages entity resolution override records
- Manages source connector credentials (read/write to secrets store)
- Tech: Python, FastAPI

---

## 32. FRONTEND / DASHBOARD REQUIREMENTS

### Technology Stack
- Next.js 14 (App Router)
- TypeScript
- Recharts / ECharts for data visualization
- Tailwind CSS
- SWR or React Query for data fetching
- Zustand for client state

### Dashboard Pages

**1. Executive Overview**
Widgets: Today's business health score, revenue vs plan, top 5 alerts, season context scores (Summer/Monsoon/Winter), top recommendation priority, data confidence indicator, key metric trend sparklines (GMV, orders, CM%, ROAS)

**2. Product Intelligence**
Views:
- Product classification matrix (scatter plot: demand quality vs profitability)
- Ranked product list with filters (classification, score band, category)
- Product detail drilldown: all sub-scores, metric breakdown, trend charts, active recommendations
- Hidden gems surfacing panel
- Comparison view: up to 4 SKUs side by side

**3. Campaign Intelligence**
Views:
- Campaign classification table
- Platform ROAS vs Contribution ROAS comparison chart per campaign
- Creative performance matrix (CTR × contribution ROAS, size = spend)
- Campaign drilldown: funnel metrics, creative breakdown, attributed product performance
- Budget reallocation recommendation view

**4. Funnel Diagnostics**
Views:
- Full funnel visualization (Sankey or step chart) by product / campaign / channel
- Leakage heatmap: all products × funnel stages, color-coded by severity
- Comparison: this week vs last week funnel
- Drilldown to specific stage diagnostics

**5. Profitability View**
Views:
- P&L waterfall chart: gross revenue → contribution margin by cost component
- SKU profitability scatter (margin% vs orders, color = classification)
- Break-even ROAS tracker per SKU and campaign
- Discount dependency analysis
- Margin trend chart rolling 90d

**6. Inventory Readiness**
Views:
- Inventory risk table sorted by reorder urgency
- Days cover vs expected demand chart per SKU
- Scale blocker list: SKUs blocked from scaling due to stock
- Vendor reliability dashboard
- Procurement alert timeline

**7. Seasonality / Context Intelligence**
Views:
- Season score gauges (Summer, Monsoon, Winter) with 7d and 20d forecast bars
- Category season fit heatmap
- Weather signal timeline
- Search trend chart for key seasonal categories
- Human intelligence signals panel for season-related signals

**8. Human Intelligence Inbox**
Views:
- Signal submission form (text or file upload)
- Extracted signal review table with validation controls
- Signal-to-data match indicator (system confirms or contradicts signal)
- Signal history by meeting/source
- Urgency-ranked signals awaiting action

**9. Recommendation Feed**
Views:
- Prioritized action list (Today's Top 10 Recommendations)
- Filter by owner, type, entity type, priority
- Mark as actioned with notes
- Dismiss with reason
- Outcome tracking panel for actioned items

**10. Action Outcome Tracker**
Views:
- Timeline of actioned recommendations
- Before/after metric comparison at 7d and 30d
- Recommendation accuracy rate by type and department
- Learning summary: which recommendation types are most accurate

**11. Forecast Readiness View**
Views:
- Readiness score matrix per SKU (color-coded by band)
- Blocking factors breakdown for low-readiness SKUs
- Improvement pathway: what is needed to reach next readiness band
- Ready-for-forecast list (band ≥ 60)

**12. Data Quality Monitor**
Views:
- Source health table: freshness, completeness, coverage per connector
- Data quality alert feed
- Analysis confidence indicators per domain
- SKU join coverage and attribution coverage trends

---

## 33. JOB ORCHESTRATION

### Technology: Dagster (preferred) or Apache Airflow

### DAG Definitions

**DAG: ingestion_all_sources**
- Schedule: Every 3 hours (order/inventory sources), every 6 hours (ad platforms)
- Steps: authenticate → fetch_incremental → validate_schema → write_bronze → publish_event
- Retry: 3 attempts, exponential backoff (5m, 15m, 45m)
- Alerting: Slack + email on 3rd failure

**DAG: dbt_staging**
- Trigger: `ingestion_completed` events (accumulate, run when all critical sources complete or at 04:00 IST)
- Steps: run dbt staging models → run dbt tests → publish event
- On test failure: flag data quality issue, do not block mart run (mart runs with confidence = low)

**DAG: dbt_marts**
- Trigger: `staging_completed`
- Steps: run intermediate models → run mart models → run mart tests → publish event

**DAG: scoring_pipeline**
- Trigger: `mart_refresh_completed`
- Steps: product_scoring → campaign_scoring → funnel_scoring → profitability_scoring → inventory_scoring → context_scoring → forecast_readiness_scoring
- Each step is parallel where dependencies allow

**DAG: classification_and_recommendations**
- Trigger: `scores_updated`
- Steps: classify_products → classify_campaigns → generate_recommendations → deduplicate_recommendations

**DAG: daily_report**
- Schedule: 07:00 IST daily
- Steps: assemble_report_data → render_email_template → send_email → log_send_event

**DAG: outcome_measurement**
- Schedule: Daily
- Steps: find_recommendations_7d_ago_actioned → compute_metric_delta_7d → find_recommendations_30d_ago_actioned → compute_metric_delta_30d → write_outcomes

**DAG: human_intelligence_extraction**
- Trigger: On human input submission (near-real-time, max 15 min lag)
- Steps: chunk_input → extract_signals → validate_signals → write_signals → trigger_score_refresh

---

## 34. DATA QUALITY CHECKS

### Freshness Checks (per source, daily)
- Assert: `ingested_at` for latest record is within expected freshness window
- Severity: Critical if > 24h stale, High if > 12h stale

### Completeness Checks
- Assert: Record count ≥ 90% of rolling 7-day average
- Assert: All required columns are non-null for ≥ 99% of records

### Referential Integrity Checks
- Assert: All order lines in `stg__orders` join to a valid `canonical_sku_id`
- Assert: All attributed campaign IDs in orders join to a valid `canonical_campaign_id`
- Assert: coverage ≥ 80% (below this → attribution_coverage flag set to LOW)

### Reconciliation Checks
- Assert: Sum of warehouse-computed daily revenue is within 2% of Shopify-reported daily revenue
- Assert: Sum of warehouse ad spend is within 1% of platform-reported spend

### Duplicate Checks
- Assert: Duplicate rate on source_record_id < 0.5% per source per day

### Business Logic Checks
- Assert: No order with negative price
- Assert: COGS is populated for ≥ 95% of order lines
- Assert: Campaign spend > 0 for all ad records
- Assert: Conversion events don't exceed session counts

### dbt Test Suite
Every mart model has:
- `not_null` tests on primary key and critical metric columns
- `unique` test on grain columns
- `accepted_values` tests on classification and flag columns
- `relationships` tests for foreign key joins
- Custom generic tests for business logic assertions

---

## 35. TESTING STRATEGY

### Unit Tests (pytest)
- Every scoring formula function has unit tests with known input/output pairs
- Every LLM extraction parser has tests against sample transcripts
- Every recommendation rule has tests against mocked mart data

### Integration Tests
- Connector integration tests run against sandbox/test accounts for each source
- End-to-end pipeline tests on synthetic data: Bronze → Silver → Gold → Score → Classification → Recommendation

### dbt Tests
- Schema tests (not_null, unique, relationships) on all staging and mart models
- Custom data tests for business logic assertions
- Freshness tests in sources.yml

### API Tests
- FastAPI TestClient tests for all endpoints
- Auth/tenant isolation tests (cross-tenant query injection tests)
- Performance tests: mart-backed endpoints must respond < 500ms

### Regression Tests
- Scoring output on a fixed synthetic dataset must not change between releases unless formula weights are intentionally changed
- Regression suite runs on every PR

### Data Quality Tests
- Synthetic data with known quality issues injected to verify quality checks fire correctly

---

## 36. MONITORING & OBSERVABILITY

### Application Monitoring
- All Python services emit structured JSON logs with: service, function, run_id, tenant_id, duration_ms, status, record_count
- Log aggregation: Loki or CloudWatch Logs
- APM traces: OpenTelemetry (Jaeger or Tempo backend)

### Pipeline Monitoring
- Dagster built-in monitoring for DAG runs: status, duration, record counts
- Custom sensor: Alert if scoring pipeline has not completed by 07:00 IST
- Data freshness sensor: Alert if any critical source not refreshed within SLA

### Dashboard Monitoring
- Dashboard query latency tracked at P50, P95, P99
- API error rate tracked per endpoint
- User session tracking (first-party, no external analytics tool)

### Business Metric Monitoring
- Automated alerts if: total daily orders drop >30% vs 7-day average (source failure indicator)
- Automated alerts if: average product performance score drops >15% week-over-week (data quality issue)

### Alerting Channels
- Slack: All pipeline failures, data quality critical alerts
- Email: Daily summary of pipeline health, data quality digest

---

## 37. SECURITY & TENANT ISOLATION

### Authentication
- JWT tokens signed with RS256, 1-hour expiry with refresh token rotation
- API keys available for server-to-server integrations (hashed storage)

### Tenant Isolation
- All database queries include `WHERE tenant_id = :tenant_id` enforced at the ORM/query layer
- Database schemas segregated per tenant for larger accounts
- No cross-tenant joins possible in any ORM model

### Secrets Management
- Source API keys and OAuth tokens stored in HashiCorp Vault or AWS Secrets Manager
- No plaintext credentials in code, environment variables, or logs
- Credential rotation handled by admin service with zero-downtime rotation

### PII Handling
- Customer emails, names, and addresses masked in all mart tables
- canonical_customer_id is a pseudonymized hash
- Raw order tables (Bronze) retain source fields for reconciliation but are access-controlled
- Support ticket agent notes not surfaced in any mart or API

### Audit Logging
- All API write operations (recommendation status updates, human intelligence submissions) logged with user_id, timestamp, action, payload hash
- Audit logs retained 1 year minimum, immutable

### Data Encryption
- Data at rest: AES-256 (database encryption)
- Data in transit: TLS 1.3
- Object storage: server-side encryption enabled

---

## 38. BUILD ROADMAP

### Phase 1: Data Foundation & Entity Spine (Weeks 1–6)

**Objective:** Build reliable data ingestion and normalization. Nothing runs without clean data.

Deliverables:
- Ingestion connectors: Shopify (orders, products, inventory, customers, refunds)
- Ingestion connectors: Meta Ads (campaigns, adsets, ads, insights, creatives)
- Ingestion connectors: Google Ads (campaigns, ad groups, ads, keywords, metrics)
- Bronze schema and raw tables
- dbt staging models for above sources
- Entity resolution: canonical product/SKU spine
- dim_date, dim_product, dim_sku, dim_channel
- fact_orders, fact_refunds, fact_ad_performance_daily
- Data quality framework: freshness, completeness, reconciliation checks
- Admin service: client configuration, cost mapping (COGS, fulfillment costs)
- Basic data quality dashboard

---

### Phase 2: Core Analysis Marts (Weeks 7–12)

**Objective:** Build all mart tables and compute core metrics.

Deliverables:
- Amazon Seller Central connector (orders, inventory, advertising, returns)
- Inventory management connector
- Website event tracking integration (first-party events)
- mart_product_analysis_daily (volume, revenue, basic profitability, availability)
- mart_campaign_analysis_daily (platform metrics, attribution, basic ROAS)
- mart_funnel_analysis_daily (stage metrics and conversion rates)
- mart_profitability_analysis_daily (full unit economics)
- mart_inventory_analysis_daily (availability, days cover, reorder metrics)
- dim_campaign, dim_adset, dim_ad, dim_creative, dim_vendor
- All metric definitions implemented
- dbt test suite for all marts

---

### Phase 3: Scoring Engines (Weeks 13–18)

**Objective:** Score every product, campaign, and funnel segment.

Deliverables:
- Customer support connector
- mart_customer_quality_daily
- Product Performance Scoring engine (all 8 components)
- Campaign Quality Scoring engine (all 6 components)
- Inventory readiness and reorder risk scoring
- Profitability tiering
- Funnel efficiency scoring and leakage detection
- score_product_daily, score_campaign_daily tables
- Scoring validation: unit tests, regression suite
- Score drilldown API: explain why a product scored X

---

### Phase 4: Recommendation Engine (Weeks 19–24)

**Objective:** Convert scores into prioritized, actionable recommendations.

Deliverables:
- Weather API connector (OpenWeatherMap + IMD where available)
- Search trends connector (Google Trends API)
- mart_context_analysis_daily
- Seasonality scoring engine (Summer, Monsoon, Winter)
- Human intelligence ingestion service
- LLM extraction pipeline
- mart_human_intelligence_signals
- Classification engine (product and campaign classifications)
- Recommendation engine (all 16 rule types)
- mart_recommendation_log with status tracking
- Human intelligence API endpoints

---

### Phase 5: Dashboard & Daily Intelligence Report (Weeks 25–32)

**Objective:** Deliver intelligence to users.

Deliverables:
- Full Next.js dashboard (all 12 pages)
- FastAPI analysis API service (all endpoints)
- Daily intelligence report email (template + automation DAG)
- Recommendation feed UI with action tracking
- Outcome measurement pipeline (7d and 30d delta)
- Action outcome tracker dashboard page
- User authentication and tenant management UI
- Role-based access control

---

### Phase 6: Forecast Readiness (Weeks 33–36)

**Objective:** Gate the forecasting layer with a formal readiness score.

Deliverables:
- mart_forecast_readiness
- Forecast Readiness Scoring engine (all 7 components)
- Forecast readiness dashboard page
- API endpoints for readiness scores
- Blocking factor surfacing and improvement pathway logic
- Forecast readiness band integration into recommendation engine (unlock forecasting recommendations for ready entities)

---

### Phase 7: Forecasting Layer (Weeks 37–48, only after Phase 6 validated)

**Objective:** Build forecasting for entities with Forecast Readiness Score ≥ 60.

Deliverables:
- Demand forecasting models: statistical baselines (Holt-Winters, SARIMA) for SKUs with readiness ≥ 60
- Revenue forecasting at product, category, and business level
- Inventory requirement forecasting (demand × lead time × safety stock)
- Campaign spend optimization modeling (given forecast demand and margin targets)
- Forecast confidence intervals and accuracy tracking
- Forecast vs actual comparison (weekly cadence)
- Forecast integration into recommendation engine (proactive reorder, campaign budget suggestions)

**ML stack for Phase 7:**
- scikit-learn / statsmodels for statistical forecasting
- Prophet for seasonal trend decomposition
- XGBoost for feature-rich demand models (where data depth supports it)
- MLflow for model tracking and versioning
- Feast or custom feature store for model features
- Batch inference: daily forecast generation job

---

### Phase 8: Optimization & Action Learning (Weeks 49–60)

**Objective:** Close the loop. Make the system smarter from outcomes.

Deliverables:
- Recommendation accuracy scoring by type, owner, and department
- Automatic weight tuning: adjust scoring formula weights based on which factors predicted successful outcomes
- A/B testing framework for recommendation rule variants
- Campaign spend optimization API (push budget suggestions, require human approval before execution)
- Anomaly detection: flag unexpected metric deviations for investigation
- Cohort analysis: product launch performance cohorts
- Long-range planning tool: annual seasonal preparation calendar with auto-populated preparation alerts

---

## 39. MVP SCOPE

The MVP is Phase 1 + Phase 2, targeting an 8-week delivery.

### MVP Includes:
- Shopify, Meta Ads, Google Ads connectors
- Bronze layer and dbt staging models
- Entity resolution (SKU spine)
- mart_product_analysis_daily (orders, revenue, basic margin, basic availability)
- mart_campaign_analysis_daily (spend, platform ROAS, contribution ROAS, basic funnel)
- mart_funnel_analysis_daily (stage conversion rates)
- mart_profitability_analysis_daily (contribution margin, break-even ROAS)
- Basic Product Performance Score (3 components: demand, profitability, campaign efficiency)
- Data quality monitoring
- Read API (products, campaigns, profitability)
- Minimal dashboard (Product Intelligence, Campaign Intelligence, Profitability)
- Daily email report: top 5 product alerts, top 5 campaign alerts

### MVP Excludes (Phase 3+):
- Amazon, inventory, support, weather, search connectors
- Full 8-component product scoring
- Classification engine
- Recommendation engine
- Human intelligence module
- Seasonality intelligence
- Forecast readiness
- Full dashboard (Funnel Diagnostics, Inventory, Context, Human Intelligence, Recommendations)

### MVP Success Criteria:
- Data is fresh (< 12h lag) for all three connected sources
- Product Performance Score diverges meaningfully from raw order count (validating normalization is working)
- Contribution ROAS diverges from Platform ROAS for ≥ 30% of campaigns (validating cost adjustment is working)
- Dashboard loads in < 3 seconds
- Daily email sends by 07:30 IST with < 2% skip rate

---

## 40. FUTURE FORECASTING LAYER DESIGN

This section is a blueprint only. Forecasting is not built until Phase 6 (Forecast Readiness) is operational and Phase 7 funding and timeline are confirmed.

### Design Principles for the Forecasting Layer

1. **Demand signal first.** The forecasting layer only uses demand signals that have been normalized for availability constraints. A stockout distorts demand; the model must use stock-available periods only.

2. **Causal feature integration.** Forecasts include seasonality context scores, weather signals, search trend signals, and human intelligence signals as external features, not just historical order data.

3. **Confidence banding is mandatory.** All forecasts include P10, P50, and P90 estimates. No point forecast is surfaced without a confidence interval.

4. **Forecast only what is ready.** The Forecast Readiness Score gates all forecasting. Entities below the readiness threshold are excluded and shown blocking factors.

5. **Forecast serves the recommendation engine.** The primary consumer of forecasts is the recommendation engine, not the dashboard. Forecasts trigger procurement alerts, campaign preparation recommendations, and inventory reorder triggers.

### Forecasting Models (Phase 7)

| Entity | Model Type | Features |
|--------|-----------|---------|
| SKU weekly demand | Holt-Winters or Prophet | historical_demand, availability, season_context, search_lift, promo_flag |
| Category monthly revenue | SARIMA with external regressors | historical_revenue, weather_score, season_context, paid_spend |
| Campaign budget optimization | XGBoost regression | historical_roas, saturation_curve, quality_score, season_score |
| Inventory requirements | Demand forecast × safety stock formula | demand_forecast_p90, vendor_lead_time, reliability_factor |

### Forecast Accuracy Tracking

Every forecast is stored with:
- forecast_date (when generated)
- target_date (what it predicted)
- model_version
- p10_value, p50_value, p90_value
- actual_value (filled in after target_date passes)
- mape (mean absolute percentage error)
- within_confidence_band (boolean)

Accuracy is tracked as rolling 13-week MAPE by model and entity type. Models below MAPE target trigger retraining alerts.

---

## APPENDIX A: TECHNICAL STACK SUMMARY

| Component | Technology |
|-----------|-----------|
| Language | Python 3.11+ |
| API Framework | FastAPI |
| Data Transformation | dbt-core 1.8+ |
| Primary Database (Phase 1–5) | PostgreSQL 16 |
| Analytical Database (Phase 4+) | ClickHouse or BigQuery/Snowflake |
| Object Storage | AWS S3 or GCS |
| Orchestration | Dagster (preferred) or Apache Airflow |
| Schema Validation | Pydantic v2 |
| ORM | SQLAlchemy 2.0 |
| LLM Extraction | Anthropic Claude API or OpenAI API |
| Frontend | Next.js 14 (App Router), TypeScript |
| Charts | Recharts + ECharts |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Data Fetching | SWR or React Query |
| Secrets Management | HashiCorp Vault or AWS Secrets Manager |
| Email | AWS SES or SendGrid |
| Cache | Redis |
| Logging | Structured JSON → Loki or CloudWatch |
| Tracing | OpenTelemetry → Jaeger/Tempo |
| Container | Docker + Docker Compose (dev), Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Testing | pytest, dbt tests, FastAPI TestClient |

---

## APPENDIX B: GLOSSARY

| Term | Definition |
|------|-----------|
| Contribution Margin (CM) | Net revenue minus all variable costs including COGS, fulfillment, fees, and ad spend |
| Break-Even ROAS | The minimum platform ROAS required for a campaign to be contribution-margin positive |
| Platform ROAS | Revenue attributed by the ad platform / ad spend. Does not subtract returns, fees, or COGS |
| Contribution ROAS | Net revenue after all costs / ad spend. The real economic return of advertising |
| Paid Dependency Score | % of a product's orders that required paid media attribution |
| Sales Velocity per In-Stock Day | Units sold divided by days the product was in stock (eliminates stockout distortion) |
| Scale Blocker | A product or SKU that cannot be scaled due to inventory, quality, or margin constraints |
| Hidden Gem | A product with above-average conversion quality but below-average traffic allocation |
| Volume Trap | A product with high order count but negative or low contribution margin |
| Forecast Readiness Score | A composite score (0–100) determining whether a SKU has sufficient data quality and depth to support accurate forecasting |
| Human Signal | A structured intelligence record extracted from a meeting transcript, note, or observation |
| Season Context Score | A composite score (0–10) combining weather, historical patterns, search trends, campaign response, and human intelligence to assess seasonal relevance |

---

*End of SELERIC Decision Intelligence System Technical Blueprint v1.0*
*This document is intended as an engineering implementation reference and should be version-controlled alongside the codebase.*
