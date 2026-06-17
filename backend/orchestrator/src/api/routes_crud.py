"""CRUD API routes: insights, approvals, control stats, action history.

These mirror the Next.js /api/* routes, allowing the frontend to call the
Python backend directly for all read/write operations on application data.
"""

import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Literal, Optional

import structlog
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from src.db.client import get_pool
from src.memory.redis_client import get_client as get_redis

logger = structlog.get_logger()
router = APIRouter()


# ── helpers ─────────────────────────────────────────────────────────────────


def _row_to_dict(row) -> dict:
    """Convert asyncpg Record to dict, serialising non-JSON-native types."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
        elif hasattr(v, "__class__") and v.__class__.__name__ == "Decimal":
            d[k] = float(v)
    return d


def _verify_hmac(action_id: str, signal_id: str, token: str) -> bool:
    import base64
    secret = os.getenv("APPROVAL_SECRET", "dev-secret-change-in-prod")
    msg = f"{action_id}:{signal_id}"
    # TS: createHmac("sha256", secret).update(msg).digest("base64url").replace(/=/g, "")
    raw = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).digest()
    expected_b64 = base64.urlsafe_b64encode(raw).rstrip(b"=").decode()
    try:
        return hmac.compare_digest(token, expected_b64)
    except Exception:
        return False


async def _enqueue_execute_action(payload: dict) -> None:
    """Push an execute-action job onto the BullMQ Redis queue.

    BullMQ (Node.js) stores waiting jobs as:
      HSET bull:execute-action:{id}  data <json>  opts <json>  ...
      LPUSH bull:execute-action:wait  {id}
    """
    redis = await get_redis()
    job_id = str(uuid.uuid4())
    ts = int(datetime.now(timezone.utc).timestamp() * 1000)
    job_data = {
        "id": job_id,
        "name": "exec",
        "data": json.dumps(payload),
        "opts": json.dumps({"attempts": 3, "backoff": {"type": "exponential", "delay": 5000}}),
        "timestamp": str(ts),
        "processedOn": "",
        "finishedOn": "",
        "returnvalue": "",
        "failedReason": "",
        "attemptsMade": "0",
        "stacktrace": "[]",
    }
    await redis.hset(f"bull:execute-action:{job_id}", mapping=job_data)
    await redis.lpush("bull:execute-action:wait", job_id)
    logger.info("execute_action_enqueued", job_id=job_id, action_id=payload.get("actionId"))


# ── Insights ─────────────────────────────────────────────────────────────────


@router.get("/insights")
async def list_insights(
    limit: int = Query(default=20, ge=1, le=100),
    severity: Optional[str] = Query(default=None),
    cursor: Optional[str] = Query(default=None),
):
    pool = await get_pool()
    conditions = [
        '"dismissedAt" IS NULL',
        '("snoozedUntil" IS NULL OR "snoozedUntil" < NOW())',
    ]
    params: list[Any] = []
    idx = 1

    if severity:
        conditions.append(f'severity = ${idx}::"InsightSeverity"')
        params.append(severity.upper())
        idx += 1

    if cursor:
        conditions.append(f'"createdAt" < ${idx}')
        params.append(datetime.fromisoformat(cursor))
        idx += 1

    where = " AND ".join(conditions)
    params.append(limit)

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT i.id, i.severity, i.title, i.what, i.why, i.evidence,
                   i.confidence, i.agent, i."createdAt", i."signalId",
                   s."entityType", s."entityId", s."signalType", s."firedAt"
            FROM "Insight" i
            LEFT JOIN "Signal" s ON s.id = i."signalId"
            WHERE {where}
            ORDER BY i."createdAt" DESC
            LIMIT ${idx}
            """,
            *params,
        )

    result = []
    for row in rows:
        d = _row_to_dict(row)
        signal = None
        if d.get("signalId"):
            signal = {
                "entityType": d.pop("entityType", None),
                "entityId": d.pop("entityId", None),
                "signalType": d.pop("signalType", None),
                "firedAt": d.pop("firedAt", None),
            }
        else:
            d.pop("entityType", None)
            d.pop("entityId", None)
            d.pop("signalType", None)
            d.pop("firedAt", None)
        d["signal"] = signal
        result.append(d)

    return result


class InsightPatch(BaseModel):
    action: Literal["dismiss", "snooze"]
    hours: Optional[int] = None


@router.patch("/insights/{insight_id}")
async def patch_insight(insight_id: str, body: InsightPatch):
    pool = await get_pool()
    if body.action == "dismiss":
        async with pool.acquire() as conn:
            await conn.execute(
                'UPDATE "Insight" SET "dismissedAt" = NOW() WHERE id = $1',
                insight_id,
            )
        return {"ok": True, "action": "dismiss"}

    if body.action == "snooze":
        hours = body.hours or 1
        if hours not in (1, 4, 24):
            raise HTTPException(status_code=400, detail="hours must be 1, 4, or 24")
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                'UPDATE "Insight" SET "snoozedUntil" = NOW() + ($1 * INTERVAL \'1 hour\') '
                'WHERE id = $2 RETURNING "snoozedUntil"',
                hours,
                insight_id,
            )
        until = row["snoozedUntil"].isoformat() if row else None
        return {"ok": True, "action": "snooze", "snoozedUntil": until}

    raise HTTPException(status_code=400, detail="action must be dismiss or snooze")


# ── Approvals ────────────────────────────────────────────────────────────────


@router.get("/approvals")
async def list_approvals():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT pa.id, pa.agent, pa."actionType", pa."actionPayload",
                   pa.rationale, pa."expectedOutcome", pa.confidence,
                   pa."riskLevel", pa.classification, pa."guardrailRule",
                   pa."expiresAt", pa."createdAt", pa."signalId",
                   s."entityType", s."entityId", s."signalType"
            FROM "PendingAction" pa
            LEFT JOIN "Signal" s ON s.id = pa."signalId"
            WHERE pa.status = 'PENDING' AND pa."expiresAt" > NOW()
            ORDER BY pa."expiresAt" ASC
            """
        )

    result = []
    for row in rows:
        d = _row_to_dict(row)
        signal = {
            "entityType": d.pop("entityType", None),
            "entityId": d.pop("entityId", None),
            "signalType": d.pop("signalType", None),
        }
        d["signal"] = signal
        result.append(d)

    # Sort HIGH risk first within each expiry bucket
    risk_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    result.sort(key=lambda x: (x.get("expiresAt") or "", risk_order.get(x.get("riskLevel", "MEDIUM"), 1)))
    return result


class ApprovalDecision(BaseModel):
    decision: Literal["approved", "rejected"]
    token: str
    rejectedReason: Optional[str] = None
    modifiedPayload: Optional[dict] = None


@router.post("/approvals/{action_id}")
async def apply_approval(action_id: str, body: ApprovalDecision):
    pool = await get_pool()
    async with pool.acquire() as conn:
        action = await conn.fetchrow(
            """
            SELECT id, status, "expiresAt", "signalId", agent, "actionType", "actionPayload"
            FROM "PendingAction" WHERE id = $1
            """,
            action_id,
        )

    if not action:
        raise HTTPException(status_code=404, detail="not_found")
    if action["status"] != "PENDING":
        raise HTTPException(status_code=409, detail=f"already_actioned:{action['status']}")
    if action["expiresAt"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="expired")
    if not _verify_hmac(action_id, action["signalId"], body.token):
        raise HTTPException(status_code=403, detail="invalid_token")

    actor = "founder"

    async with pool.acquire() as conn:
        if body.decision == "approved":
            final_payload = body.modifiedPayload or json.loads(action["actionPayload"])
            await conn.execute(
                """
                UPDATE "PendingAction"
                SET status = 'APPROVED'::"ActionStatus",
                    "approvedBy" = $1,
                    "approvedAt" = NOW(),
                    "actionPayload" = $2::jsonb,
                    "updatedAt" = NOW()
                WHERE id = $3
                """,
                actor,
                json.dumps(final_payload),
                action_id,
            )
            await conn.execute(
                """
                INSERT INTO "AuditLog" (id, "signalId", event, actor, payload, "createdAt")
                VALUES ($1, $2, 'action_approved', $3, $4::jsonb, NOW())
                """,
                str(uuid.uuid4()),
                action["signalId"],
                actor,
                json.dumps({"actionId": action_id, "actionType": action["actionType"],
                            "modifiedPayload": body.modifiedPayload is not None}),
            )
            await _enqueue_execute_action({
                "actionId": action_id,
                "agent": action["agent"],
                "actionType": action["actionType"],
                "actionPayload": final_payload,
                "signalId": action["signalId"],
            })
            return {"ok": True, "status": "approved", "actionId": action_id}

        else:  # rejected
            await conn.execute(
                """
                UPDATE "PendingAction"
                SET status = 'REJECTED'::"ActionStatus",
                    "rejectedReason" = $1,
                    "rejectedAt" = NOW(),
                    "updatedAt" = NOW()
                WHERE id = $2
                """,
                body.rejectedReason or "Rejected by founder",
                action_id,
            )
            await conn.execute(
                """
                INSERT INTO "AuditLog" (id, "signalId", event, actor, payload, "createdAt")
                VALUES ($1, $2, 'action_rejected', $3, $4::jsonb, NOW())
                """,
                str(uuid.uuid4()),
                action["signalId"],
                actor,
                json.dumps({"actionId": action_id, "actionType": action["actionType"],
                            "reason": body.rejectedReason}),
            )
            return {"ok": True, "status": "rejected", "actionId": action_id}


# ── Control stats ─────────────────────────────────────────────────────────────


@router.get("/control/stats")
async def control_stats():
    pool = await get_pool()
    async with pool.acquire() as conn:
        pending_count = await conn.fetchval(
            """SELECT COUNT(*) FROM "PendingAction"
               WHERE status = 'PENDING' AND "expiresAt" > NOW()"""
        )
        executed_today = await conn.fetchval(
            """SELECT COUNT(*) FROM "PendingAction"
               WHERE status = 'EXECUTED'
               AND "executedAt" >= date_trunc('day', NOW())"""
        )
        approved_7d = await conn.fetchval(
            """SELECT COUNT(*) FROM "PendingAction"
               WHERE status = 'APPROVED'
               AND "approvedAt" >= NOW() - INTERVAL '7 days'"""
        )
        rejected_7d = await conn.fetchval(
            """SELECT COUNT(*) FROM "PendingAction"
               WHERE status = 'REJECTED'
               AND "rejectedAt" >= NOW() - INTERVAL '7 days'"""
        )
        avg_outcome = await conn.fetchval(
            """SELECT AVG("outcomeScore") FROM "InsightOutcome"
               WHERE "measuredAt" >= NOW() - INTERVAL '30 days'"""
        )
        per_agent_proposals = await conn.fetch(
            """SELECT agent, COUNT(*) AS cnt FROM "PendingAction"
               WHERE "createdAt" >= NOW() - INTERVAL '7 days'
               GROUP BY agent"""
        )
        per_agent_decisions = await conn.fetch(
            """SELECT agent, status, COUNT(*) AS cnt FROM "PendingAction"
               WHERE status IN ('APPROVED', 'REJECTED')
               AND "createdAt" >= NOW() - INTERVAL '7 days'
               GROUP BY agent, status"""
        )

    approval_rate = (
        int(approved_7d) / (int(approved_7d) + int(rejected_7d))
        if (approved_7d or 0) + (rejected_7d or 0) > 0
        else None
    )

    agent_map: dict[str, dict] = {}
    for row in per_agent_proposals:
        agent_map[row["agent"]] = {"proposalCount": int(row["cnt"]), "approved": 0, "rejected": 0}
    for row in per_agent_decisions:
        a = row["agent"]
        if a not in agent_map:
            agent_map[a] = {"proposalCount": 0, "approved": 0, "rejected": 0}
        if row["status"] == "APPROVED":
            agent_map[a]["approved"] = int(row["cnt"])
        elif row["status"] == "REJECTED":
            agent_map[a]["rejected"] = int(row["cnt"])

    per_agent = [
        {
            "agent": agent,
            "proposalCount": v["proposalCount"],
            "approvalRate": (
                v["approved"] / (v["approved"] + v["rejected"])
                if v["approved"] + v["rejected"] > 0
                else None
            ),
        }
        for agent, v in agent_map.items()
    ]

    return {
        "pendingCount": int(pending_count or 0),
        "executedToday": int(executed_today or 0),
        "approvalRate": approval_rate,
        "avgOutcomeScore": float(avg_outcome) if avg_outcome is not None else None,
        "perAgent": per_agent,
    }


# ── Action history ────────────────────────────────────────────────────────────


@router.get("/actions/history")
async def action_history():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT pa.id, pa.agent, pa."actionType", pa."actionPayload",
                   pa.rationale, pa."expectedOutcome", pa.confidence,
                   pa."riskLevel", pa.classification, pa.status,
                   pa."executedAt", pa."executionResult", pa."executionError",
                   pa."approvedBy", pa."signalId",
                   s."entityType", s."entityId", s."signalType"
            FROM "PendingAction" pa
            LEFT JOIN "Signal" s ON s.id = pa."signalId"
            WHERE pa.status IN ('EXECUTED', 'FAILED')
            ORDER BY pa."executedAt" DESC NULLS LAST
            LIMIT 100
            """
        )

        result = []
        for row in rows:
            d = _row_to_dict(row)
            signal_id = d.get("signalId")
            signal = {
                "entityType": d.pop("entityType", None),
                "entityId": d.pop("entityId", None),
                "signalType": d.pop("signalType", None),
                "insights": [],
            }
            if signal_id:
                outcomes = await conn.fetch(
                    """
                    SELECT io."windowHours", io."outcomeScore", io."metricDeltas", io."measuredAt"
                    FROM "InsightOutcome" io
                    JOIN "Insight" i ON i.id = io."insightId"
                    WHERE i."signalId" = $1
                    ORDER BY io."windowHours" ASC
                    LIMIT 5
                    """,
                    signal_id,
                )
                if outcomes:
                    signal["insights"] = [{"outcomes": [_row_to_dict(o) for o in outcomes]}]
            d["signal"] = signal
            result.append(d)

    return result
