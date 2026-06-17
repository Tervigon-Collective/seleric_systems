import { prisma } from "@/lib/prisma"

export async function getInsights(params: {
  limit: number
  severity: string | null
  cursor: string | null
}) {
  const { limit, severity, cursor } = params
  return prisma.insight.findMany({
    where: {
      ...(severity ? { severity: severity as "CRITICAL" | "WARNING" | "INFO" } : {}),
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      dismissedAt: null,
      OR: [{ snoozedUntil: null }, { snoozedUntil: { lt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      severity: true,
      title: true,
      what: true,
      why: true,
      evidence: true,
      confidence: true,
      agent: true,
      createdAt: true,
      signalId: true,
      signal: {
        select: { entityType: true, entityId: true, signalType: true, firedAt: true },
      },
    },
  })
}

export async function dismissInsight(id: string): Promise<void> {
  await prisma.insight.update({
    where: { id },
    data: { dismissedAt: new Date() },
  })
}

export async function snoozeInsight(id: string, hours: 1 | 4 | 24): Promise<Date> {
  const until = new Date(Date.now() + hours * 60 * 60 * 1000)
  await prisma.insight.update({
    where: { id },
    data: { snoozedUntil: until },
  })
  return until
}
