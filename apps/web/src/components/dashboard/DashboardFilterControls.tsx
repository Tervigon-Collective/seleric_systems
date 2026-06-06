"use client"

import { DateRangeControls } from "./DateRangeControls"

interface Props {
  start: string
  end: string
  spanDays: number
  searchParams?: Record<string, string | string[] | undefined>
}

export function DashboardFilterControls({ start, end, spanDays, searchParams }: Props) {
  return (
    <DateRangeControls start={start} end={end} spanDays={spanDays} searchParams={searchParams} />
  )
}
