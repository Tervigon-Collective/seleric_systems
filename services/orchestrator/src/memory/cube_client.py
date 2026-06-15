"""Cube metrics via direct Cube.js REST API (CUBE_API_URL/cubejs-api/v1/load).

Auth: SELERIC_API_KEY bearer if set, else HS256 JWT from CUBEJS_API_SECRET.
"""

import json
import os
import time
from datetime import date, timedelta
from typing import Any

import httpx
import structlog

logger = structlog.get_logger()

_EMPTY_METRICS: dict[str, Any] = {
    "spend_7d": None,
    "spend_30d": None,
    "revenue_7d": None,
    "revenue_30d": None,
    "net_profit_7d": None,
    "net_profit_30d": None,
    "orders_7d": None,
    "orders_30d": None,
    "today_spend": None,
    "today_revenue": None,
    "today_net_profit": None,
    "today_orders": None,
}

# Orders measure: prefer `orders_created` (full Shopify "Created at" placement
# universe) as the denominator for entity-level CAC and "orders" counts. The
# orchestrator's downstream signals (high_cac, low_revenue) need the same
# placement universe that the dashboard uses. `total_orders` (active + cancelled)
# is kept so agents that want the financially-confirmed slice can read it
# explicitly.
_MEASURES = [
    "daily_pnl.total_ad_spend",
    "daily_pnl.gross_revenue",
    "daily_pnl.net_profit",
    "daily_pnl.gross_profit",
    "daily_pnl.total_sales_ex_gst",
    "daily_pnl.total_cogs",
    "daily_pnl.orders_created",
    "daily_pnl.total_orders",
]


def _cube_api_url() -> str:
    url = os.getenv("CUBE_API_URL")
    if not url:
        raise RuntimeError("CUBE_API_URL env var is required but not set")
    return url.rstrip("/")


def _auth_headers() -> dict[str, str]:
    api_key = os.getenv("SELERIC_API_KEY", "")
    if api_key:
        return {"Authorization": f"Bearer {api_key}"}
    secret = os.getenv("CUBEJS_API_SECRET", "")
    if secret:
        import jwt  # PyJWT
        token = jwt.encode(
            {"iat": int(time.time()), "exp": int(time.time()) + 3600},
            secret,
            algorithm="HS256",
        )
        return {"Authorization": f"Bearer {token}"}
    return {}


async def _cube_load(query: dict, client: httpx.AsyncClient) -> list[dict]:
    base = _cube_api_url()
    t0 = time.monotonic()
    resp = await client.post(
        f"{base}/cubejs-api/v1/load",
        json={"query": query},
    )
    elapsed_ms = int((time.monotonic() - t0) * 1000)
    if resp.status_code != 200:
        raise RuntimeError(f"Cube load failed: {resp.status_code} — {resp.text[:200]}")
    data = resp.json().get("data", [])
    logger.info("cube_load", rows=len(data), elapsed_ms=elapsed_ms)
    return data


def _daily_pnl_query(start_date: str, end_date: str, group_by_day: bool = False) -> dict:
    return {
        "measures": _MEASURES,
        "timeDimensions": [
            {
                "dimension": "daily_pnl.report_date",
                **({"granularity": "day"} if group_by_day else {}),
                "dateRange": [start_date, end_date],
            }
        ],
        "timezone": "Asia/Kolkata",
        **({"order": {"daily_pnl.report_date": "asc"}} if group_by_day else {}),
    }


def _sum_rows(rows: list[dict], measure: str) -> float | None:
    values = []
    for row in rows:
        v = row.get(measure)
        if v is not None:
            try:
                values.append(float(v))
            except (ValueError, TypeError):
                pass
    return round(sum(values), 2) if values else None


async def get_today_spend() -> dict[str, Any]:
    today = date.today().isoformat()
    headers = _auth_headers()
    try:
        async with httpx.AsyncClient(headers=headers, timeout=30) as client:
            rows = await _cube_load(_daily_pnl_query(today, today), client)
            logger.info("cube_daily_pnl_result", row_count=len(rows))
            return {"today_pnl": rows}
    except Exception as exc:
        logger.error("cube_daily_pnl_failed", error=str(exc))
        return {}


async def get_entity_metrics(entity_id: str, entity_type: str = "campaign") -> dict[str, Any]:
    """Fetch aggregated metrics for 7d, 30d windows plus today."""
    metrics: dict[str, Any] = {"entity_id": entity_id}
    today = date.today().isoformat()
    headers = _auth_headers()

    try:
        async with httpx.AsyncClient(headers=headers, timeout=30) as client:
            # Today
            try:
                rows = await _cube_load(_daily_pnl_query(today, today), client)
                if rows:
                    metrics["today_spend"] = _sum_rows(rows, "daily_pnl.total_ad_spend")
                    metrics["today_revenue"] = _sum_rows(rows, "daily_pnl.gross_revenue")
                    metrics["today_net_profit"] = _sum_rows(rows, "daily_pnl.net_profit")
                    metrics["today_orders"] = _sum_rows(
                        rows, "daily_pnl.orders_created"
                    ) or _sum_rows(rows, "daily_pnl.total_orders")
            except Exception as exc:
                logger.warning("cube_today_fetch_failed", error=str(exc))

            # 7d and 30d
            for days, suffix in [(7, "7d"), (30, "30d")]:
                start = (date.today() - timedelta(days=days)).isoformat()
                try:
                    rows = await _cube_load(
                        {
                            "measures": _MEASURES,
                            "timeDimensions": [
                                {
                                    "dimension": "daily_pnl.report_date",
                                    "granularity": "day",
                                    "dateRange": [start, today],
                                }
                            ],
                            "timezone": "Asia/Kolkata",
                        },
                        client,
                    )
                    metrics[f"spend_{suffix}"] = _sum_rows(rows, "daily_pnl.total_ad_spend")
                    metrics[f"revenue_{suffix}"] = _sum_rows(rows, "daily_pnl.gross_revenue")
                    metrics[f"net_profit_{suffix}"] = _sum_rows(rows, "daily_pnl.net_profit")
                    metrics[f"orders_{suffix}"] = _sum_rows(
                        rows, "daily_pnl.orders_created"
                    ) or _sum_rows(rows, "daily_pnl.total_orders")
                except Exception as exc:
                    logger.warning("cube_period_fetch_failed", suffix=suffix, error=str(exc))
                    for key in ("spend", "revenue", "net_profit", "orders"):
                        metrics.setdefault(f"{key}_{suffix}", None)

    except Exception as exc:
        logger.error("cube_rest_connection_failed", error=str(exc))
        return {**_EMPTY_METRICS, "entity_id": entity_id}

    return metrics


async def health_check() -> bool:
    try:
        base = _cube_api_url()
        headers = _auth_headers()
        async with httpx.AsyncClient(headers=headers, timeout=10) as client:
            resp = await client.get(f"{base}/cubejs-api/v1/meta")
            ok = resp.status_code == 200
            logger.info("cube_health_check", status=resp.status_code, ok=ok)
            return ok
    except Exception as exc:
        logger.error("cube_health_check_failed", error=str(exc))
        return False
