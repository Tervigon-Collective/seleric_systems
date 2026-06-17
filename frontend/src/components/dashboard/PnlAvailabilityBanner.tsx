import type { PnlSchemaStatus } from "@/lib/dashboard/pnl-breakdown-constants"

interface Props {
  schema: PnlSchemaStatus
}

export function PnlAvailabilityBanner({ schema }: Props) {
  if (!schema.cubeExists) {
    return (
      <div className="rounded-xl border border-red-300/60 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
        <p className="font-medium">canonical_pnl cube not found in schema</p>
        <p className="mt-1 text-xs opacity-90">
          The audited P&L view is unavailable. Check Cube deployment or CUBE_API_URL.
        </p>
      </div>
    )
  }

  if (schema.missing.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-300/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
        {schema.missing.length} measure{schema.missing.length === 1 ? "" : "s"} not in Cube schema
      </p>
      <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
        Flagged rows are omitted from queries. Available: {schema.available.length} /{" "}
        {schema.available.length + schema.missing.length}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-amber-700 dark:text-amber-300 hover:underline">
          Show missing measures
        </summary>
        <ul className="mt-2 max-h-40 overflow-y-auto space-y-0.5 text-[11px] font-mono text-amber-800 dark:text-amber-200/90">
          {schema.missing.map((key) => (
            <li key={key}>{key.replace("canonical_pnl.", "")}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
