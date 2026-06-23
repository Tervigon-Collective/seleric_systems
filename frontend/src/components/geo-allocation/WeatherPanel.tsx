import type { GeoWeatherRow } from "@/lib/dashboard/queries/geo-allocation"
import { WeatherBadge } from "./WeatherBadge"

interface Props {
  weather: GeoWeatherRow[]
}

export function WeatherPanel({ weather }: Props) {
  if (!weather.length) return null

  const total = weather.reduce((s, r) => s + r.n, 0)

  return (
    <div className="rounded-xl border border-insight-border dark:border-night-800 bg-white dark:bg-night-900 p-4 flex flex-col gap-3 shadow-sm dark:shadow-none">
      <div>
        <h2 className="text-sm font-medium text-stone-900 dark:text-night-50">Weather Coverage</h2>
        <p className="text-xs text-stone-500 dark:text-night-500 mt-0.5">Stage distribution across scored campaigns today</p>
      </div>
      <div className="flex flex-col gap-2">
        {weather.map((row) => {
          const pct = total > 0 ? Math.round((row.n / total) * 100) : 0
          return (
            <div key={row.weather_stage} className="flex items-center gap-3">
              <div className="w-36 shrink-0">
                <WeatherBadge stage={row.weather_stage} />
              </div>
              <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-night-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-stone-400 dark:bg-night-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-stone-500 dark:text-night-400 w-16 text-right">
                {row.n} ({pct}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
