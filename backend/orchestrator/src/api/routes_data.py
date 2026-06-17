"""Data query routes: ads, neurotag, COGS, creative IQ.

These mirror the Next.js /api/ads/*, /api/neurotag/*, /api/tools/cogs-data,
and /api/chat/creative-iq routes. All data comes from the Cube semantic layer.
"""

import asyncio
import os
from typing import Any, Optional

import httpx
import structlog
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from src.memory.cube_client import _auth_headers, _cube_load

logger = structlog.get_logger()
router = APIRouter()

DEFAULT_BRAND_ID = int(os.getenv("DEFAULT_BRAND_ID", "1"))

G = "gold__fct_meta_ads_breakdown_daily"
C_NEUROTAG = "meta_neurotag_analysis"
C_ORDER_ITEMS = "gold__fct_order_items"
C_MARKETING = "marketing_performance"
C_NEUROTAG_SCORER = "meta_neurotag_analysis"

BREAKDOWN_DIMS: dict[str, list[str]] = {
    "age_and_gender":     [f"{G}.age", f"{G}.gender"],
    "publisher_platform": [f"{G}.publisher_platform"],
    "platform_device":    [f"{G}.device_platform"],
    "region":             [f"{G}.region"],
}


def _brand_filter(cube: str, brand_id: int) -> dict:
    return {"member": f"{cube}.brand_id", "operator": "equals", "values": [str(brand_id)]}


async def _query(q: dict) -> list[dict]:
    headers = _auth_headers()
    async with httpx.AsyncClient(headers=headers, timeout=30) as client:
        return await _cube_load(q, client)


# ── Ads: placement breakdown ──────────────────────────────────────────────────


@router.get("/ads/placement")
async def ads_placement(
    ad_id: str = Query(...),
    start: str = Query(...),
    end: str = Query(...),
    brand: Optional[int] = Query(default=None),
):
    brand_id = brand or DEFAULT_BRAND_ID
    query = {
        "measures": [
            f"{G}.spend", f"{G}.impressions", f"{G}.clicks",
            f"{G}.purchases", f"{G}.video_views_3s", f"{G}.video_thruplay_15s",
        ],
        "dimensions": [f"{G}.platform_position", f"{G}.publisher_platform"],
        "timeDimensions": [{"dimension": f"{G}.report_date", "dateRange": [start, end]}],
        "filters": [
            _brand_filter(G, brand_id),
            {"member": f"{G}.breakdown_type", "operator": "equals", "values": ["placement"]},
            {"member": f"{G}.ad_id", "operator": "equals", "values": [ad_id]},
        ],
        "order": {f"{G}.spend": "desc"},
        "limit": 50,
    }
    try:
        rows = await _query(query)
        return {"rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Ads: engagement breakdown ─────────────────────────────────────────────────


@router.get("/ads/engagement")
async def ads_engagement(
    ad_id: str = Query(...),
    breakdown_type: str = Query(...),
    start: str = Query(...),
    end: str = Query(...),
    brand: Optional[int] = Query(default=None),
):
    brand_id = brand or DEFAULT_BRAND_ID
    dims = BREAKDOWN_DIMS.get(breakdown_type)
    if not dims:
        raise HTTPException(status_code=400, detail=f"Unknown breakdown_type: {breakdown_type}")

    query = {
        "measures": [
            f"{G}.spend", f"{G}.impressions", f"{G}.clicks",
            f"{G}.video_views_3s", f"{G}.video_thruplay_15s",
        ],
        "dimensions": dims,
        "timeDimensions": [{"dimension": f"{G}.report_date", "dateRange": [start, end]}],
        "filters": [
            _brand_filter(G, brand_id),
            {"member": f"{G}.breakdown_type", "operator": "equals", "values": [breakdown_type]},
            {"member": f"{G}.ad_id", "operator": "equals", "values": [ad_id]},
        ],
        "order": {f"{G}.spend": "desc"},
        "limit": 30 if breakdown_type == "region" else 100,
    }
    try:
        rows = await _query(query)
        return {"rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Neurotag ads ──────────────────────────────────────────────────────────────


@router.get("/neurotag/ads")
async def neurotag_ads(
    tag: str = Query(...),
    start: str = Query(...),
    end: str = Query(...),
    brand: Optional[int] = Query(default=None),
):
    brand_id = brand or DEFAULT_BRAND_ID
    query = {
        "measures": [
            f"{C_NEUROTAG}.spend_sc",
            f"{C_NEUROTAG}.spend_fc",
            f"{C_NEUROTAG}.net_revenue_sc",
            f"{C_NEUROTAG}.attributed_orders_sc",
            f"{C_NEUROTAG}.impressions_sc",
            f"{C_NEUROTAG}.clicks_sc",
            f"{C_NEUROTAG}.new_customer_revenue_sc",
        ],
        "dimensions": [
            f"{C_NEUROTAG}.ad_id",
            f"{C_NEUROTAG}.ad_name",
            f"{C_NEUROTAG}.campaign_name",
            f"{C_NEUROTAG}.adset_name",
        ],
        "timeDimensions": [{"dimension": f"{C_NEUROTAG}.report_date", "dateRange": [start, end]}],
        "filters": [
            _brand_filter(C_NEUROTAG, brand_id),
            {"member": f"{C_NEUROTAG}.tag_code", "operator": "equals", "values": [tag]},
        ],
        "order": {f"{C_NEUROTAG}.spend_sc": "desc"},
        "limit": 100,
    }
    try:
        rows = await _query(query)
        return {"rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── COGS data ─────────────────────────────────────────────────────────────────


def _num(v: Any) -> float:
    try:
        n = float(v)
        return n if n == n else 0.0  # NaN check
    except (TypeError, ValueError):
        return 0.0


def _per_unit(total: float, qty: float) -> float:
    return total / qty if qty > 0 else 0.0


@router.get("/tools/cogs-data")
async def cogs_data(
    dateFrom: str = Query(default="2025-01-01"),
    dateTo: Optional[str] = Query(default=None),
    brand: Optional[int] = Query(default=None),
):
    import datetime as dt
    date_to = dateTo or dt.date.today().isoformat()
    if dateFrom > date_to:
        dateFrom, date_to = date_to, dateFrom

    brand_id = brand or DEFAULT_BRAND_ID

    sku_query = {
        "dimensions": [
            f"{C_ORDER_ITEMS}.sku",
            f"{C_ORDER_ITEMS}.product_title",
        ],
        "measures": [
            f"{C_ORDER_ITEMS}.quantity",
            f"{C_ORDER_ITEMS}.placed_product_cost",
            f"{C_ORDER_ITEMS}.placed_shipping_cost",
            f"{C_ORDER_ITEMS}.placed_packaging_cost",
            f"{C_ORDER_ITEMS}.placed_gateway_fee",
            f"{C_ORDER_ITEMS}.total_cogs",
            f"{C_ORDER_ITEMS}.rto_cost",
            f"{C_ORDER_ITEMS}.returned_units",
            f"{C_ORDER_ITEMS}.avg_unit_price",
            f"{C_ORDER_ITEMS}.gross_line_revenue",
            f"{C_ORDER_ITEMS}.gross_line_revenue_ex_gst",
            f"{C_ORDER_ITEMS}.net_line_revenue_ex_gst",
        ],
        "timeDimensions": [{"dimension": f"{C_ORDER_ITEMS}.order_date", "dateRange": [dateFrom, date_to]}],
        "filters": [_brand_filter(C_ORDER_ITEMS, brand_id)],
        "order": {f"{C_ORDER_ITEMS}.quantity": "desc"},
        "timezone": "Asia/Kolkata",
    }

    campaign_query = {
        "dimensions": [f"{C_MARKETING}.campaign_name"],
        "measures": [f"{C_MARKETING}.ad_spend", f"{C_MARKETING}.purchases"],
        "timeDimensions": [{"dimension": f"{C_MARKETING}.date_start", "dateRange": [dateFrom, date_to]}],
        "filters": [_brand_filter(C_MARKETING, brand_id)],
        "order": {f"{C_MARKETING}.ad_spend": "desc"},
        "timezone": "Asia/Kolkata",
    }

    try:
        headers = _auth_headers()
        async with httpx.AsyncClient(headers=headers, timeout=30) as client:
            sku_rows_raw, campaign_rows_raw = await asyncio.gather(
                _cube_load(sku_query, client),
                _cube_load(campaign_query, client),
            )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    p = f"{C_ORDER_ITEMS}."
    skus = []
    for r in sku_rows_raw:
        if not r.get(f"{p}sku"):
            continue
        qty = _num(r.get(f"{p}quantity"))
        placed_product = _num(r.get(f"{p}placed_product_cost"))
        placed_shipping = _num(r.get(f"{p}placed_shipping_cost"))
        placed_packaging = _num(r.get(f"{p}placed_packaging_cost"))
        placed_gateway = _num(r.get(f"{p}placed_gateway_fee"))
        rto_cost = _num(r.get(f"{p}rto_cost"))
        returned_units = _num(r.get(f"{p}returned_units"))
        gross_revenue = _num(r.get(f"{p}gross_line_revenue"))
        gross_revenue_ex_gst = _num(r.get(f"{p}gross_line_revenue_ex_gst"))
        net_revenue_ex_gst = _num(r.get(f"{p}net_line_revenue_ex_gst"))
        asp_measure = _num(r.get(f"{p}avg_unit_price"))
        asp = asp_measure if asp_measure > 0 else _per_unit(gross_revenue, qty)
        total_cogs = _num(r.get(f"{p}total_cogs"))

        skus.append({
            "sku": str(r[f"{p}sku"]),
            "productTitle": str(r.get(f"{p}product_title") or ""),
            "qty": qty,
            "unitCost": _per_unit(placed_product, qty),
            "shippingPerUnit": _per_unit(placed_shipping, qty),
            "packagingPerUnit": _per_unit(placed_packaging, qty),
            "rtoPerUnit": _per_unit(rto_cost, qty),
            "gatewayFeePerUnit": _per_unit(placed_gateway, qty),
            "gatewayPct": (placed_gateway / gross_revenue * 100) if gross_revenue > 0 else 0,
            "returnRatePct": (returned_units / qty * 100) if qty > 0 else 0,
            "asp": asp if asp > 0 else None,
            "grossRevenue": gross_revenue,
            "netRevenueExGst": net_revenue_ex_gst,
            "placedProductCost": placed_product,
            "placedShippingCost": placed_shipping,
            "placedPackagingCost": placed_packaging,
            "placedGatewayFee": placed_gateway,
            "totalCogs": total_cogs,
            "totalEffectiveCogs": placed_product + placed_shipping + placed_packaging,
        })

    mp = f"{C_MARKETING}."
    campaigns = [
        {
            "campaignName": str(r[f"{mp}campaign_name"]),
            "spend": _num(r.get(f"{mp}ad_spend")),
            "purchases": _num(r.get(f"{mp}purchases")),
        }
        for r in campaign_rows_raw
        if r.get(f"{mp}campaign_name")
    ]

    return {"skus": skus, "campaigns": campaigns}


# ── Creative IQ ───────────────────────────────────────────────────────────────


class CreativeIQRequest(BaseModel):
    startDate: str
    endDate: str
    tagCode: Optional[str] = None
    adId: Optional[str] = None
    includeFunnel: bool = True


def _score_tag(tag: dict) -> dict:
    """Classify a tag based on CTR, CVR, and ROAS signals."""
    spend = _num(tag.get("spend_fc") or tag.get(f"{C_NEUROTAG_SCORER}.spend_fc"))
    revenue = _num(tag.get("net_revenue_sc") or tag.get(f"{C_NEUROTAG_SCORER}.net_revenue_sc"))
    impressions = _num(tag.get("impressions_sc") or tag.get(f"{C_NEUROTAG_SCORER}.impressions_sc"))
    clicks = _num(tag.get("clicks_sc") or tag.get(f"{C_NEUROTAG_SCORER}.clicks_sc"))
    orders = _num(tag.get("attributed_orders_sc") or tag.get(f"{C_NEUROTAG_SCORER}.attributed_orders_sc"))

    ctr = clicks / impressions if impressions > 0 else 0
    cvr = orders / clicks if clicks > 0 else 0
    roas = revenue / spend if spend > 0 else 0

    # Classification thresholds (mirrors TypeScript neurotag-scorer.ts)
    if spend < 500:
        classification = "needs_more_data"
    elif ctr >= 0.02 and cvr < 0.01:
        classification = "misleading_hook"
    elif roas >= 2.5 and cvr >= 0.015:
        classification = "strong_winner"
    elif roas >= 1.5 and orders >= 5:
        classification = "conversion_winner"
    else:
        classification = "needs_more_data"

    return {
        **tag,
        "ctr": round(ctr * 100, 3),
        "cvr": round(cvr * 100, 3),
        "roas": round(roas, 2),
        "classification": classification,
        "spend_fc": spend,
    }


@router.post("/chat/creative-iq")
async def creative_iq(body: CreativeIQRequest):
    brand_id = DEFAULT_BRAND_ID

    neurotag_query = {
        "measures": [
            f"{C_NEUROTAG_SCORER}.spend_sc", f"{C_NEUROTAG_SCORER}.spend_fc",
            f"{C_NEUROTAG_SCORER}.net_revenue_sc", f"{C_NEUROTAG_SCORER}.attributed_orders_sc",
            f"{C_NEUROTAG_SCORER}.impressions_sc", f"{C_NEUROTAG_SCORER}.clicks_sc",
            f"{C_NEUROTAG_SCORER}.new_customer_revenue_sc",
        ],
        "dimensions": [
            f"{C_NEUROTAG_SCORER}.tag_code", f"{C_NEUROTAG_SCORER}.hack_name",
            f"{C_NEUROTAG_SCORER}.category_name",
        ],
        "timeDimensions": [{"dimension": f"{C_NEUROTAG_SCORER}.report_date",
                             "dateRange": [body.startDate, body.endDate]}],
        "filters": [_brand_filter(C_NEUROTAG_SCORER, brand_id)],
        "order": {f"{C_NEUROTAG_SCORER}.spend_fc": "desc"},
        "limit": 200,
    }

    try:
        tag_rows = await _query(neurotag_query)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    scored = [_score_tag(r) for r in tag_rows]

    if body.tagCode:
        scored = [t for t in scored if str(t.get("tag_code", "")).lower() == body.tagCode.lower()]

    misleading = [t for t in scored if t["classification"] == "misleading_hook"]
    winners = [t for t in scored if t["classification"] == "strong_winner"]
    converters = [t for t in scored if t["classification"] == "conversion_winner"]
    total_spend = sum(t.get("spend_fc", 0) for t in scored)
    top_tag = scored[0].get("tag_code") or scored[0].get("hack_name") if scored else None

    rows = [{"_type": "tag", **t} for t in scored]
    rows += [{"_type": "misleading_hook", **t} for t in misleading]

    return {
        "rows": rows,
        "metadata": {
            "tagsScored": len([t for t in scored if t["classification"] != "needs_more_data"]),
            "strongWinners": len(winners),
            "misleadingHooks": len(misleading),
            "converters": len(converters),
            "totalSpend": total_spend,
            "topTag": top_tag,
        },
        "type": "creative_iq",
    }
