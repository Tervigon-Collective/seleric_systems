import type { ActionType } from "@/lib/dashboard/queries/geo-allocation"

const CONFIG: Record<ActionType, { label: string; className: string }> = {
  SCALE:          { label: "SCALE",   className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800" },
  LAUNCH:         { label: "LAUNCH",  className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 ring-sky-200 dark:ring-sky-800" },
  PAUSE:          { label: "PAUSE",   className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-red-200 dark:ring-red-800" },
  HOLD:           { label: "HOLD",    className: "bg-stone-100 text-stone-500 dark:bg-night-850 dark:text-night-400 ring-stone-200 dark:ring-night-700" },
  SWITCH_PRODUCT: { label: "SWITCH",  className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-200 dark:ring-amber-800" },
}

const FALLBACK = { label: "—", className: "bg-stone-100 text-stone-400 dark:bg-night-850 dark:text-night-500 ring-stone-200 dark:ring-night-700" }

export function ActionBadge({ action }: { action: string }) {
  const cfg = CONFIG[action as ActionType] ?? FALLBACK
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
