"use client"

import { usePathname } from "next/navigation"
import { useDomainChat } from "./DomainChatProvider"
import { ChatView } from "./ChatView"

const DOMAIN_ROUTES = ["/pnl", "/ads/neurotag"]

export function DomainChatDrawer() {
  const pathname = usePathname()
  const { context, isOpen, openDrawer, closeDrawer, getContext } = useDomainChat()

  const isDomainRoute = DOMAIN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r + "?")
  )

  if (!isDomainRoute || !context) return null

  return (
    <>
      {!isOpen && (
        <button
          onClick={openDrawer}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-stone-900 dark:bg-night-100 px-4 py-3 text-sm font-medium text-white dark:text-night-950 shadow-lg hover:bg-stone-700 dark:hover:bg-white transition-colors font-sans"
          aria-label="Open AI assistant"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Ask AI
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            onClick={closeDrawer}
            aria-hidden
          />

          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-stone-200 dark:border-night-800 bg-white dark:bg-night-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-night-800 px-4 py-3 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-stone-900 dark:text-night-50 font-sans">
                  {context.domain === "pnl" ? "P&L Assistant" : "Creative IQ Assistant"}
                </h2>
                <p className="text-xs text-stone-500 dark:text-night-500 font-sans">
                  {context.filters.start} → {context.filters.end}
                  {context.tab ? ` · ${context.tab}` : ""}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-1.5 text-stone-500 dark:text-night-500 hover:bg-stone-100 dark:hover:bg-night-875 transition-colors"
                aria-label="Close assistant"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <ChatView
                mode="embedded"
                getContext={getContext}
                suggestedPrompts={context.suggestedPrompts}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
