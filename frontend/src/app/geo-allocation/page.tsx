import { Suspense } from "react"
import { fetchGeoAllocationData } from "@/lib/dashboard/queries/geo-allocation"
import { GeoKpiStrip } from "@/components/geo-allocation/GeoKpiStrip"
import { AllocationTable } from "@/components/geo-allocation/AllocationTable"
import { WeatherPanel } from "@/components/geo-allocation/WeatherPanel"
import { GeoDatePicker } from "@/components/geo-allocation/GeoDatePicker"
import { RunMartButton } from "@/components/geo-allocation/RunMartButton"

export const revalidate = 120

interface SearchParams {
  date?: string
}

export default async function GeoAllocationPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const today      = new Date().toISOString().slice(0, 10)
  const reportDate = searchParams?.date ?? today

  let data
  let error: string | null = null

  try {
    data = await fetchGeoAllocationData(reportDate)
  } catch (e) {
    error = String(e)
    data = null
  }

  return (
    <main className="p-6 space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-night-50">
            Geo-Campaign Allocation
          </h1>
          <p className="text-sm text-stone-500 dark:text-night-500 mt-1">
            Daily SCALE / PAUSE / LAUNCH / SWITCH decisions · city × product × campaign · monsoon season · brand 20
          </p>
          {error && (
            <p className="mt-2 text-sm text-amber-500">
              Could not load mart data for {reportDate}: {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <GeoDatePicker currentDate={reportDate} />
          </Suspense>
          <RunMartButton date={reportDate} />
        </div>
      </header>

      {/* KPI Strip */}
      {data && <GeoKpiStrip summary={data.summary} />}

      {/* Weather + Table row */}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">
          <WeatherPanel weather={data.weather} />
          <AllocationTable rows={data.rows} />
        </div>
      )}

      {!data && !error && (
        <div className="rounded-xl border border-stone-200 dark:border-night-800 p-12 text-center text-stone-400 dark:text-night-500">
          No mart data for {reportDate}. Click &quot;Rebuild mart&quot; to generate it.
        </div>
      )}
    </main>
  )
}
