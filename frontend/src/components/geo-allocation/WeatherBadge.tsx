const WEATHER_CONFIG: Record<string, { icon: string; className: string }> = {
  RAIN_ACTIVE:    { icon: "🌧", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 ring-blue-200 dark:ring-blue-800" },
  RAIN_EMERGING:  { icon: "🌦", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-800" },
  RAIN_DECLINING: { icon: "⛅", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 ring-violet-200 dark:ring-violet-800" },
  HUMIDITY_HIGH:  { icon: "💧", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 ring-teal-200 dark:ring-teal-800" },
  HEAT_HIGH:      { icon: "☀", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 ring-orange-200 dark:ring-orange-800" },
  COLD_HIGH:      { icon: "❄", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-800" },
  DRY:            { icon: "🌤", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 ring-yellow-200 dark:ring-yellow-800" },
  UNKNOWN:        { icon: "–",  className: "bg-stone-100 text-stone-500 dark:bg-night-850 dark:text-night-400 ring-stone-200 dark:ring-night-700" },
}

export function WeatherBadge({ stage }: { stage: string }) {
  const cfg = WEATHER_CONFIG[stage] ?? WEATHER_CONFIG.UNKNOWN
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${cfg.className}`}>
      <span aria-hidden>{cfg.icon}</span>
      <span>{stage.replace("_", " ")}</span>
    </span>
  )
}
