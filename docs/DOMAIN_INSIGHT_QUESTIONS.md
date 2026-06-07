# Domain Insight Questions — What the Brain Can Answer

**Status:** Active (2026-06-08)  
**Audience:** Product, agents, orchestrator, chat  
**Related:** [DATA_FLOW.md](./DATA_FLOW.md) · [REQUIREMENTS.md](./REQUIREMENTS.md) · [seleric_queries_reference.md](./seleric_queries_reference.md) · [BUSINESS_CALCULATIONS_GLOSSARY.md](./calculation_and_queries/BUSINESS_CALCULATIONS_GLOSSARY.md) · [cogs_simulation_calculation.md](./cogs_simulation_calculation.md) · [CREATIVE_IQ_MODULE.md](./CREATIVE_IQ_MODULE.md)

This document maps **domain-specific questions** a DTC founder needs answered — beyond generic BI — to the data ground, signal types, agents, and action types in the multi-agent system.

---

## The domain user and their real job

The primary user is a **founder/operator** of an India DTC brand on Shopify, advertising on Meta/Google. They must answer continuously:

1. **Am I making money today?** — not revenue, but *net profit* after COGS, ads, packaging, shipping, gateway, and RTO
2. **Where is profit leaking?** — channel, campaign, SKU, returns, COD vs prepaid
3. **Should I change ads, price, inventory, or discount — and by how much?**
4. **Did the last decision work?** — outcome feedback, not gut feel

Generic questions (“what’s ROAS?”) are table stakes. This domain needs **causal, cross-system, unit-economics-aware** questions.

---

## Data ground (what the brain can reason over)

| Layer | What it holds | Used for |
|---|---|---|
| **ClickHouse gold** (`fct_daily_pnl`, `fct_orders`, `fct_meta_ads_*`, neurotag marts) | Canonical P&L, orders, ads, attribution, creative tags | Metrics, trends, cross-cube synthesis |
| **Cube semantic layer** | 29+ chart views, channel P&L, neurotag analysis | Chat, dashboards, agent context |
| **Postgres (Prisma)** | Signals, insights, pending actions, outcomes, embeddings | Memory, approval queue, learning loop |
| **Redis** | Entity session memory | “What happened last time on this campaign?” |
| **Live APIs** | Pipeboard (Meta/Google), Shopify MCP | Real-time inventory, write actions |
| **Creative IQ** | 550 neurohack tags, hook/hold rates, classifications | Creative psychology → performance |

### Signal types (orchestrator routing)

Defined in `services/orchestrator/src/nodes/route_agents.py` and `docs/REQUIREMENTS.md`:

| Signal | Agents invoked |
|---|---|
| `roas_drop` | insight, meta |
| `spend_spike` | insight, meta |
| `cpa_spike` | insight, meta |
| `budget_exhausted` | meta |
| `revenue_drop` | insight, shopify |
| `conversion_drop` | insight, shopify |
| `stock_critical` | shopify |
| `ltv_decline` | insight, shopify |
| `high_return_rate` | insight, shopify |
| `blended_roas_drop` | insight, meta, shopify |

---

## Tier 1 — Domain-specific questions (beyond generic BI)

### P&L and unit economics (India-specific)

| Question | Data source / tool |
|---|---|
| Is today’s net profit real or inflated by attribution? | `daily_pnl.net_profit` — never stitch Shopify revenue − Meta spend |
| How much margin did RTO, gateway fees, and packaging eat this week? | P&L waterfall: `packaging_cost`, `shipping_cost`, `payment_gateway_fees`, `rto_cost` |
| Is gross margin healthy but net profit negative because ad spend scaled? | `gross_profit` vs `contribution_margin` vs `net_profit` |
| COD vs prepaid: which payment mix is destroying margin? | `payment_method_pnl`, `cod_pct`, `prepaid_pct` |
| If I negotiate 8% lower product cost on SKU X, what break-even price do I need? | COGS simulation engine ([cogs_simulation_calculation.md](./cogs_simulation_calculation.md)) |

### Ads × commerce (the hard join)

| Question | Data source / tool |
|---|---|
| ROAS dropped — is it an ads problem or a site/conversion problem? | `blended_roas_drop` → insight + meta + shopify agents |
| Campaign has great Meta ROAS but attributed Shopify revenue is weak | `marketing_performance` vs `dw_meta_ads_attribution` |
| Which campaigns spend >₹50K with ROAS <2? | Cross-cube merge + Python ranking (chat pattern) |
| When during the day does this campaign burn budget with worst CPA? | `ad_performance.hourly_window` |
| Should I pause this campaign or just cut budget 10%? | Meta agent + guardrail rules (`config/rules.yaml`) |

### Inventory × ads (unique to DTC)

| Question | Data source / tool |
|---|---|
| Hero SKU has 6 days of stock — should I pause ads? | `stock_critical` → shopify agent |
| Revenue dropped — traffic, conversion, or stockouts on top SKUs? | Orders funnel + product performance + ad spend |
| Restock to 200 units — how many days of runway? | Shopify agent velocity analysis (orders/day, days remaining) |

### Creative intelligence (differentiator)

| Question | Data source / tool |
|---|---|
| Which psychological hooks convert vs just stop the scroll? | Creative IQ: `strong_winner`, `conversion_winner`, `creative_hook_winner`, `misleading_hook` |
| High CTR but low ROAS — which tags are misleading hooks? | Scatter: CTR vs ROAS by ad/tag |
| Which neurohack tags correlate with new customer revenue? | `meta_neurotag_analysis.new_customer_revenue` |
| Strong 3s hook but weak 15s hold — creative fatigue or wrong offer? | `hook_rate` vs `hold_rate_15s` |

### Customer and returns

| Question | Data source / tool |
|---|---|
| Return rate spiked — product quality or ad overpromise? | `high_return_rate` + creative tag correlation |
| Which SKUs have high return rate but still positive gross profit after RTO? | `product_performance` + `rto_cost` |
| LTV declining — acquisition mix shift or repeat purchase drop? | `ltv_decline` + `customer_ltv` / acquisition cubes |

---

## Tier 2 — Complex questions the system answers as a brain

These require **multi-source reasoning**, not a single chart.

### Diagnostic (Insight Agent + context assembly)

The orchestrator assembles: signal snapshot + 7d/30d metrics + Redis session + pgvector similar past situations → then diagnoses.

| Complex question | How the brain answers |
|---|---|
| Why did ROAS on Campaign X drop 43% in 2 hours? | Current vs 7d avg, hour-of-day pattern, funnel step drop (LPV → ATC → checkout), similar past insights |
| Is this spend spike intentional or auction inflation? | Session memory + spend trend + campaign config from Pipeboard |
| Revenue down 20% but ad spend flat — what broke? | Routes shopify + insight: CVR, AOV, stock, return rate, channel mix |
| Have we seen this exact situation before and what worked? | pgvector similarity on `context_snapshot` → past InsightCards + InsightOutcome scores |

### Prescriptive (Meta + Shopify agents → Guardrail)

Agents cite numbers and quantify expected outcomes. Guardrail classifies AUTO / QUEUE / BLOCK per `config/rules.yaml`.

| Complex question | Recommended action types |
|---|---|
| Sustained ROAS <1.0 for 48h on a low-spend campaign | AUTO: `pause_campaign` (if rules pass) |
| Underperforming adset — cut budget or pause? | `shift_budget` (−10% auto if spend <₹500/day) or `pause_adset` |
| Top SKU stockout in 5 days | `restock_product`, `pause_ads_for_product`, `adjust_price`, `create_discount` |
| Margin compression from returns on SKU X | `adjust_price`, `tag_product`, pause misleading creative tags |

**Meta agent action types:** `pause_campaign`, `shift_budget`, `adjust_bid`, `pause_adset`  
**Shopify agent action types:** `restock_product`, `adjust_price`, `create_discount`, `pause_ads_for_product`, `tag_product`

### Learning loop (Outcome store → calibration)

After 24h / 48h / 7d windows, `InsightOutcome` scores ROAS, revenue, spend, and net profit deltas. If `outcome_score < -0.5`, signal rules get recalibrated.

| Complex question | Brain capability |
|---|---|
| Did pausing Campaign Y last month actually improve net profit? | Outcome history + before/after metrics |
| Should we trust ROAS drop signals for this entity? | Calibration feedback when past actions had poor outcomes |
| Which action types work best for `spend_spike` signals? | Aggregate outcomes by `signal_type` + `action_type` |

### Interactive “chief of staff” (Chat)

Chat chains Cube + Creative IQ + Python analysis for ad-hoc complex queries. See [CHAT.md](./CHAT.md) and [cube-domain.ts](../apps/web/src/lib/chat/instructions/cube-domain.ts).

Examples:

- Compare Meta ROAS to overall net margin this month — is paid media profitable at the company level?
- Which campaigns have highest attributed gross profit, not just revenue?
- Rank creatives by hook rate vs conversion — flag misleading hooks spending >₹500
- Simulate 5% price increase on top 5 SKUs given measured RTO and CAC — impact on net margin

---

## Proactive questions (signal-driven brain)

Questions the system should **surface without being asked**, mapped to signals:

| Signal | Founder question answered | Typical insight |
|---|---|---|
| `roas_drop` | Which campaign is bleeding money right now? | Creative fatigue, audience saturation, landing page, or attribution window |
| `spend_spike` | Why did spend jump 40% with flat revenue? | Budget change vs CPM inflation vs learning phase |
| `cpa_spike` | Are we paying too much per purchase? | Funnel leak vs bid strategy vs offer mismatch |
| `revenue_drop` | Why are orders down? | Traffic, CVR, AOV, stock, discount removal |
| `stock_critical` | Will I stockout before restock arrives? | Days of inventory, ad spend on OOS risk |
| `blended_roas_drop` | Is the whole business model degrading? | Cross-channel: ads efficiency + store conversion + margin |
| `ltv_decline` | Are we acquiring worse customers? | Cohort / acquisition channel shift |
| `high_return_rate` | Are returns eating profit on hero products? | SKU-level return rate vs ad creative promise |

### Signal → brain flow

```
Signal fired (every 15 min)
    → Validate + dedupe
    → Assemble context (Redis session + pgvector + Cube metrics)
    → Route agents (insight + meta/shopify)
    → Guardrail (AUTO / QUEUE / BLOCK)
    → Execute or approval queue
    → Record outcome (24h / 48h / 7d)
    → Calibrate signal rules if poor outcome
```

---

## Tier 3 — Hard questions within reach (roadmap-worthy)

The data ground supports these; full automation may require additional agent logic or pre-aggregations.

| Question | Data source |
|---|---|
| Campaign X drives traffic to SKU Y — is that SKU profitable after returns? | `gold_campaign_product_performance` |
| Do urgency-hook ads drive higher returns on premium SKUs? | Creative tags × `product_performance.return_rate` |
| Are we under-provisioning RTO cost in P&L for COD-heavy weeks? | `cod_pct`, `rto_cost`, `payment_method_pnl` |
| Shift ₹X from bottom-quartile ROAS campaigns to top-quartile — expected net profit lift? | Cross-cube merge + simulation |
| Will a 10% discount on SKU X recover velocity without killing margin given current CAC? | COGS engine + shopify velocity |

---

## Honest limits (what the system should not pretend to answer)

| Limitation | Detail |
|---|---|
| SKU-level revenue + COGS in one Cube query | Nested aggregate limitation — use Python/raw gold query or pre-aggregation |
| Creative name ↔ product title joins | Not reliably joinable — synthesize in text, state limitation |
| Causal “why Meta changed” | Can hypothesize from data; cannot see Meta auction internals |
| Write actions without approval | Budget increases, high-spend pauses, price changes, discounts → QUEUE |
| Company net profit from stitched tables | Always use `daily_pnl.net_profit` — never `shopify_orders.gross_revenue − dw_meta_ads_attribution.ad_spend` |

---

## Question taxonomy summary

| Tier | Example | Mode |
|---|---|---|
| **Operational** | Am I profitable today? | Dashboard / chat |
| **Diagnostic** | Why did ROAS drop on Campaign X? | Signal → Insight Agent |
| **Prescriptive** | Pause or cut budget 10%? | Meta/Shopify Agent → Guardrail |
| **Strategic** | Which creative psychology actually converts? | Creative IQ + neurotag marts |
| **Learning** | Did last month’s pause help net profit? | InsightOutcome + calibration |
| **Simulation** | What price/COGS change hits 10% net margin? | COGS engine + measured RTO/CAC |

---

## Example composite insight (target output)

> Campaign “Summer Prospecting” ROAS fell from 2.1 → 1.2 because LPV→ATC dropped 18% while spend held flat. Similar situations resolved after pausing misleading-hook creatives (tag: `urgency_scarcity`). Recommend −10% budget on adset Y (AUTO) and queue price review on hero SKU Z where return rate hit 14%. Last time we paused a low-spend campaign here, net profit improved 12% in 7 days.

This is the domain-native value proposition: **connecting ads psychology, Shopify unit economics, India-specific cost stack (GST, RTO, COD), and executable actions with a learning loop.**

---

## Implementation mapping (for agents)

| Component | File / location |
|---|---|
| Signal → agent routing | `services/orchestrator/src/nodes/route_agents.py` |
| Insight diagnosis prompt | `services/orchestrator/src/prompts/insight.j2` |
| Meta action proposals | `services/orchestrator/src/prompts/meta.j2` |
| Shopify action proposals | `services/orchestrator/src/prompts/shopify.j2` |
| Guardrail rules | `config/rules.yaml` |
| Outcome scoring | `services/worker/src/jobs/record-outcome.ts` |
| Chat domain routing | `apps/web/src/lib/chat/instructions/cube-domain.ts` |
| Creative IQ classifications | `apps/web/src/lib/dashboard/neurotag-scorer.ts` |
| Prisma models | `packages/db/prisma/schema.prisma` |
