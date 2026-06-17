import { rowDimValue, type CubeRow } from "@/lib/chat/cube-rows"

/** Balancing bucket so channel stack reconciles to daily_pnl.net_profit. */
export const CHANNEL_NET_PROFIT_RECON_MEASURE = "derived.unattributed_and_ops"

const CHANNEL_NET_PROFIT_MEASURES = [
  "channel_pnl.meta_net_profit",
  "channel_pnl.google_net_profit",
  "channel_pnl.organic_net_profit",
] as const

function dayKey(row: CubeRow, dim: string): string {
  return rowDimValue(row, dim).slice(0, 10)
}

function channelNetProfitSum(row: CubeRow): number {
  return CHANNEL_NET_PROFIT_MEASURES.reduce(
    (sum, measure) => sum + Number(row[measure] ?? 0),
    0,
  )
}

/**
 * Meta/Google/Organic net profit uses attributed revenue minus full platform ad spend.
 * That sum does not partition company net profit — add a balancing series from daily_pnl.
 */
export function reconcileChannelNetProfitRows(
  channelRows: CubeRow[],
  dailyPnlRows: CubeRow[],
): CubeRow[] {
  const dailyByDate = new Map<string, CubeRow>()
  for (const row of dailyPnlRows) {
    const key = dayKey(row, "daily_pnl.report_date")
    if (key) dailyByDate.set(key, row)
  }

  return channelRows.map((row) => {
    const key = dayKey(row, "channel_pnl.date_start")
    const daily = key ? dailyByDate.get(key) : undefined
    const companyNet = daily ? Number(daily["daily_pnl.net_profit"] ?? 0) : 0
    const recon = companyNet - channelNetProfitSum(row)
    return { ...row, [CHANNEL_NET_PROFIT_RECON_MEASURE]: recon }
  })
}
