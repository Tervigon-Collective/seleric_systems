import { createHmac, timingSafeEqual } from "crypto"
import { prisma } from "@/lib/prisma"
import { Queue } from "bullmq"
import Redis from "ioredis"

export type ApprovalResult =
  | { ok: true; status: "approved" | "rejected"; actionId: string }
  | { ok: false; error: string; httpStatus: number; extra?: Record<string, unknown> }

export async function getPendingApprovals() {
  const actions = await prisma.pendingAction.findMany({
    where: {
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: [{ expiresAt: "asc" }],
    select: {
      id: true,
      agent: true,
      actionType: true,
      actionPayload: true,
      rationale: true,
      expectedOutcome: true,
      confidence: true,
      riskLevel: true,
      classification: true,
      guardrailRule: true,
      expiresAt: true,
      createdAt: true,
      signalId: true,
      signal: {
        select: { entityType: true, entityId: true, signalType: true },
      },
    },
  })

  // Sort HIGH risk first within each expiry bucket
  return actions.sort((a, b) => {
    const exp = a.expiresAt.getTime() - b.expiresAt.getTime()
    if (exp !== 0) return exp
    const riskOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return (riskOrder[a.riskLevel] ?? 1) - (riskOrder[b.riskLevel] ?? 1)
  })
}

function verifyToken(actionId: string, signalId: string, token: string): boolean {
  const secret = process.env.APPROVAL_SECRET ?? "dev-secret-change-in-prod"
  const msg = `${actionId}:${signalId}`
  const expected = createHmac("sha256", secret).update(msg).digest("base64url").replace(/=/g, "")
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

function getExecuteQueue(): Queue {
  const redisConn = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  })
  return new Queue("execute-action", { connection: redisConn })
}

export async function applyDecision(
  id: string,
  token: string,
  decision: "approved" | "rejected",
  body: { rejectedReason?: string; modifiedPayload?: Record<string, unknown> } = {},
): Promise<ApprovalResult> {
  const action = await prisma.pendingAction.findUnique({
    where: { id },
    select: { id: true, status: true, expiresAt: true, signalId: true, agent: true, actionType: true, actionPayload: true },
  })

  if (!action) return { ok: false, error: "not_found", httpStatus: 404 }
  if (action.status !== "PENDING") return { ok: false, error: "already_actioned", httpStatus: 409, extra: { status: action.status } }
  if (action.expiresAt < new Date()) return { ok: false, error: "expired", httpStatus: 410 }
  if (!verifyToken(id, action.signalId, token)) return { ok: false, error: "invalid_token", httpStatus: 403 }

  const actor = "founder"

  if (decision === "approved") {
    const finalPayload = body.modifiedPayload ?? action.actionPayload

    await prisma.pendingAction.update({
      where: { id },
      data: { status: "APPROVED", approvedBy: actor, approvedAt: new Date(), actionPayload: finalPayload as object },
    })
    await prisma.auditLog.create({
      data: {
        signalId: action.signalId,
        event: "action_approved",
        actor,
        payload: { actionId: id, actionType: action.actionType, modifiedPayload: !!body.modifiedPayload },
      },
    })

    const queue = getExecuteQueue()
    await queue.add("exec", {
      actionId: id,
      agent: action.agent,
      actionType: action.actionType,
      actionPayload: finalPayload,
      signalId: action.signalId,
    })
    await queue.close()

    return { ok: true, status: "approved", actionId: id }
  } else {
    await prisma.pendingAction.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedReason: body.rejectedReason ?? "Rejected by founder",
        rejectedAt: new Date(),
      },
    })
    await prisma.auditLog.create({
      data: {
        signalId: action.signalId,
        event: "action_rejected",
        actor,
        payload: { actionId: id, actionType: action.actionType, reason: body.rejectedReason },
      },
    })

    return { ok: true, status: "rejected", actionId: id }
  }
}
