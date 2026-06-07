"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  searchCreative,
  type CreativeSearchSelect,
  type SearchEntry,
  type SearchHit,
  type SearchKind,
} from "@/lib/dashboard/creative-search"
import { fmtCurrency } from "./format"

const KIND_CHIP: Record<SearchKind, { label: string; cls: string }> = {
  tag:      { label: "Tag",      cls: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" },
  ad:       { label: "Ad",       cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  category: { label: "Category", cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
}

/** Render a title with the matched character positions emphasized. */
function Highlighted({ text, positions }: { text: string; positions: number[] }) {
  if (!positions.length) return <>{text}</>
  const set = new Set(positions)
  return (
    <>
      {Array.from(text).map((ch, i) =>
        set.has(i) ? (
          <mark key={i} className="bg-transparent text-indigo-500 dark:text-indigo-300 font-semibold">
            {ch}
          </mark>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  )
}

function RightMetric({ entry }: { entry: SearchEntry }) {
  const { spend, roas, score, count } = entry.metrics
  if (entry.kind === "tag") {
    return (
      <div className="text-right shrink-0">
        {typeof score === "number" && score > 0 && (
          <p className="text-xs font-semibold tabular-nums text-stone-700 dark:text-night-200">
            {(score * 100).toFixed(0)}
          </p>
        )}
        <p className="text-[10px] tabular-nums text-stone-400 dark:text-night-600">
          {fmtCurrency(spend ?? 0)}{typeof roas === "number" ? ` · ${roas.toFixed(1)}×` : ""}
        </p>
      </div>
    )
  }
  if (entry.kind === "ad") {
    return (
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold tabular-nums text-stone-700 dark:text-night-200">
          {fmtCurrency(spend ?? 0)}
        </p>
        {typeof roas === "number" && (
          <p className={`text-[10px] tabular-nums ${roas >= 2.5 ? "text-emerald-500" : roas >= 1.5 ? "text-stone-400 dark:text-night-500" : "text-red-400"}`}>
            {roas.toFixed(2)}×
          </p>
        )}
      </div>
    )
  }
  return (
    <div className="text-right shrink-0">
      <p className="text-xs font-semibold tabular-nums text-stone-700 dark:text-night-200">{fmtCurrency(spend ?? 0)}</p>
      <p className="text-[10px] tabular-nums text-stone-400 dark:text-night-600">{count ?? 0} tags</p>
    </div>
  )
}

interface Props {
  index: SearchEntry[]
  onSelect: (sel: CreativeSearchSelect) => void
}

export function UniversalSearch({ index, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hits = useMemo<SearchHit[]>(
    () => (query.trim() ? searchCreative(index, query, 12) : []),
    [index, query],
  )

  // Reset highlight to the top whenever the result set changes.
  useEffect(() => setActive(0), [query])

  // Close on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  // Global shortcuts: "/" or Cmd/Ctrl+K focuses the search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function choose(hit: SearchHit) {
    onSelect(hit.entry.select)
    setQuery(hit.entry.title)
    setOpen(false)
    inputRef.current?.blur()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); return }
    if (!hits.length) return
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => (i + 1) % hits.length) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + hits.length) % hits.length) }
    else if (e.key === "Enter") { e.preventDefault(); const h = hits[active]; if (h) choose(h) }
  }

  const counts = useMemo(() => {
    const c: Record<SearchKind, number> = { tag: 0, ad: 0, category: 0 }
    for (const h of hits) c[h.entry.kind]++
    return c
  }, [hits])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-night-600"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search ads, neuro tags, categories…"
          aria-label="Search ads, neuro tags and categories"
          className="w-full rounded-xl border border-stone-200 dark:border-night-800 bg-white dark:bg-night-900 pl-10 pr-16 py-2.5 text-sm text-stone-800 dark:text-night-100 placeholder:text-stone-400 dark:placeholder:text-night-600 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-night-200"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-stone-200 dark:border-night-700 px-1.5 py-0.5 text-[10px] font-medium text-stone-400 dark:text-night-600">
            /
          </kbd>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 dark:border-night-800 bg-white dark:bg-night-900 shadow-xl">
          {hits.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-400 dark:text-night-600">
              No ads, tags, or categories match “{query.trim()}”.
            </div>
          ) : (
            <>
              <ul className="max-h-[26rem] overflow-y-auto py-1">
                {hits.map((hit, i) => {
                  const chip = KIND_CHIP[hit.entry.kind]
                  return (
                    <li key={`${hit.entry.kind}:${hit.entry.id}`}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(hit)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                          i === active ? "bg-stone-100 dark:bg-night-850" : "hover:bg-stone-50 dark:hover:bg-night-875"
                        }`}
                      >
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${chip.cls}`}>
                          {chip.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-stone-800 dark:text-night-100">
                            <Highlighted text={hit.entry.title} positions={hit.positions} />
                          </span>
                          <span className="block truncate text-[11px] text-stone-400 dark:text-night-600">
                            {hit.entry.subtitle}
                          </span>
                        </span>
                        <RightMetric entry={hit.entry} />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-stone-200 dark:border-night-800 px-3 py-1.5 text-[10px] text-stone-400 dark:text-night-600">
                <span>
                  {counts.tag > 0 && `${counts.tag} tag${counts.tag !== 1 ? "s" : ""}`}
                  {counts.tag > 0 && (counts.ad > 0 || counts.category > 0) ? " · " : ""}
                  {counts.ad > 0 && `${counts.ad} ad${counts.ad !== 1 ? "s" : ""}`}
                  {counts.ad > 0 && counts.category > 0 ? " · " : ""}
                  {counts.category > 0 && `${counts.category} categor${counts.category !== 1 ? "ies" : "y"}`}
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-stone-200 dark:border-night-700 px-1">↑↓</kbd>
                  <kbd className="rounded border border-stone-200 dark:border-night-700 px-1">↵</kbd>
                  to open
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
