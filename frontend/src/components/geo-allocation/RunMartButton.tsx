"use client"

import { useState } from "react"

interface Props {
  date: string
}

export function RunMartButton({ date }: Props) {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle")

  async function handleRun() {
    setState("running")
    try {
      const res = await fetch(
        `/api/geo-allocation/run?report_date=${date}`,
        { method: "POST" },
      )
      if (!res.ok) throw new Error(await res.text())
      setState("done")
      setTimeout(() => setState("idle"), 4000)
    } catch {
      setState("error")
      setTimeout(() => setState("idle"), 4000)
    }
  }

  const labels = {
    idle:    "Rebuild mart",
    running: "Running…",
    done:    "Queued",
    error:   "Failed",
  }

  return (
    <button
      onClick={handleRun}
      disabled={state === "running"}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        state === "idle"    ? "bg-stone-900 dark:bg-night-100 text-white dark:text-night-900 hover:bg-stone-700 dark:hover:bg-night-200 focus:ring-stone-700" :
        state === "running" ? "bg-stone-400 dark:bg-night-600 text-white cursor-not-allowed" :
        state === "done"    ? "bg-emerald-600 text-white focus:ring-emerald-600" :
                              "bg-red-600 text-white focus:ring-red-600"
      }`}
    >
      {labels[state]}
    </button>
  )
}
