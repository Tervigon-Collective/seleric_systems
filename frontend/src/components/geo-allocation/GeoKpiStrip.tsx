import type { GeoAllocationSummaryRow } from "@/lib/dashboard/queries/geo-allocation"

const ACTION_ORDER = ["SCALE", "LAUNCH", "SWITCH_PRODUCT", "PAUSE", "HOLD"] as const

const ACTION_STYLE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SCALE:          { label: "Scale",  bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  LAUNCH:         { label: "Launch", bg: "bg-sky-50 dark:bg-sky-950/30",         text: "text-sky-700 dark:text-sky-400",         border: "border-sky-200 dark:border-sky-800" },
  PAUSE:          { label: "Pause",  bg: "bg-red-50 dark:bg-red-950/30",          text: "text-red-700 dark:text-red-400",          border: "border-red-200 dark:border-red-800" },
  HOLD:           { label: "Hold",   bg: "bg-stone-50 dark:bg-night-900",         text: "text-stone-500 dark:text-night-400",      border: "border-stone-200 dark:border-night-800" },
  SWITCH_PRODUCT: { label: "Switch", bg: "bg-amber-50 dark:bg-amber-950/30",      text: "text-amber-700 dark:text-amber-400",      border: "border-amber-200 dark:border-amber-800" },
}

function Tile({
  label, count, sub, bg, text, border,
}: {
  label: string; count: number; sub: string; bg: string; text: string; border: string
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${bg} ${border}`}>
      <p className={`text-xs font-medium uppercase tracking-wider ${text}`}>{label}</p>
      <p className={`text-3xl font-semibold tabular-nums ${text}`}>{count}</p>
      <p className="text-xs text-stone-500 dark:text-night-500">{sub}</p>
    </div>
  )
}

interface Props {
  summary: GeoAllocationSummaryRow[]
}

export function GeoKpiStrip({ summary }: Props) {
  const byAction = Object.fromEntries(summary.map((r) => [r.recommended_action, r]))

  const totalRows = summary.reduce((s, r) => s + r.n, 0)
  const allCities = Math.max(...summary.map((r) => r.cities), 0)
  const allProducts = Math.max(...summary.map((r) => r.products), 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {ACTION_ORDER.map((action) => {
        const row = byAction[action]
        const s = ACTION_STYLE[action]
        return (
          <Tile
            key={action}
            label={s.label}
            count={row?.n ?? 0}
            sub={row ? `${row.cities} cities · ${row.avg_roas}x avg ROAS` : "no signal today"}
            bg={s.bg}
            text={s.text}
            border={s.border}
          />
        )
      })}
      <Tile
        label="Coverage"
        count={totalRows}
        sub={`${allCities} cities · ${allProducts} products`}
        bg="bg-stone-50 dark:bg-night-900"
        text="text-stone-700 dark:text-night-300"
        border="border-stone-200 dark:border-night-800"
      />
    </div>
  )
}
