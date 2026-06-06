from dataclasses import dataclass, field
from typing import Literal

SignalClass = Literal[
    "strong_winner", "conversion_winner", "creative_hook_winner",
    "misleading_hook", "weak_attention", "needs_more_data"
]


@dataclass
class TagMetrics:
    tag_code: str
    hack_name: str
    category_name: str
    ads_count: int
    spend: float
    impressions: int
    clicks: int
    ctr: float
    cpc: float
    gross_revenue: float
    net_revenue: float
    roas: float
    cpa: float | None
    attributed_orders: int
    click_to_order_rate: float
    new_customer_revenue: float
    avg_attribution_confidence: float = 0.8


@dataclass
class ScoredTag:
    tag_code: str
    hack_name: str
    category_name: str
    score: float
    classification: SignalClass
    score_components: dict[str, float] = field(default_factory=dict)


MIN_SPEND_THRESHOLD = 1_000    # ₹ — below this = needs_more_data
MIN_IMPRESSIONS = 5_000
CTR_MISLEADING_FLOOR = 0.025    # above this CTR but low conversion
ROAS_MISLEADING_CEIL = 1.5      # low ROAS despite high CTR

WEIGHTS = dict(
    revenue=0.30,
    roas=0.20,
    ctr=0.20,
    cpc_eff=0.10,
    order_rate=0.10,
    confidence=0.10,
)


def score_tags(tags: list[TagMetrics]) -> list[ScoredTag]:
    if not tags:
        return []

    max_rev = max(t.gross_revenue for t in tags) or 1
    max_roas = max(t.roas for t in tags) or 1
    max_ctr = max(t.ctr for t in tags) or 1
    max_cpc = max(t.cpc for t in tags) or 1
    max_or = max(t.click_to_order_rate for t in tags) or 1

    results = []
    for t in tags:
        if t.spend < MIN_SPEND_THRESHOLD or t.impressions < MIN_IMPRESSIONS:
            results.append(ScoredTag(
                tag_code=t.tag_code, hack_name=t.hack_name,
                category_name=t.category_name, score=0.0,
                classification="needs_more_data", score_components={}
            ))
            continue

        components = dict(
            revenue=t.gross_revenue / max_rev,
            roas=t.roas / max_roas,
            ctr=t.ctr / max_ctr,
            cpc_eff=1 - (t.cpc / max_cpc),
            order_rate=t.click_to_order_rate / max_or,
            confidence=t.avg_attribution_confidence,
        )
        score = sum(WEIGHTS[k] * v for k, v in components.items())

        high_ctr = t.ctr >= CTR_MISLEADING_FLOOR
        low_roas = t.roas <= ROAS_MISLEADING_CEIL
        high_roas = t.roas >= 2.5

        if high_ctr and low_roas:
            cls: SignalClass = "misleading_hook"
        elif high_ctr and high_roas:
            cls = "strong_winner"
        elif high_roas and not high_ctr:
            cls = "conversion_winner"
        elif high_ctr and t.gross_revenue < (max_rev * 0.15):
            cls = "creative_hook_winner"
        elif score < 0.25:
            cls = "weak_attention"
        else:
            cls = "strong_winner" if score >= 0.65 else "conversion_winner"

        results.append(ScoredTag(
            tag_code=t.tag_code, hack_name=t.hack_name,
            category_name=t.category_name, score=round(score, 4),
            classification=cls, score_components=components,
        ))

    return sorted(results, key=lambda x: x.score, reverse=True)
