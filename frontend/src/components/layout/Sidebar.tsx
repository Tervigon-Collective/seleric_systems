"use client"

import Link from "next/link"
import { Suspense } from "react"
import { usePathname } from "next/navigation"

import { SidebarBrandFilter } from "./SidebarBrandFilter"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pnl", label: "P&L Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/ads", label: "Ads" },
  { href: "/attribution", label: "Attribution" },
  { href: "/ads/neurotag", label: "Creative IQ" },
  { href: "/shopify", label: "Shopify" },
  { href: "/chat", label: "Chat" },
  { href: "/control", label: "Control" },
  { href: "/tools", label: "Tools" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-night-800 dark:bg-night-925">
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-night-600">
          Navigation
        </p>
        <nav className="flex flex-col gap-0.5 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? "bg-stone-100 font-medium text-stone-900 dark:bg-night-850 dark:text-night-50"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-night-400 dark:hover:bg-night-875 dark:hover:text-night-50"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-stone-200 p-4 dark:border-night-800">
        <Suspense
          fallback={
            <div className="h-24 animate-pulse rounded-lg bg-stone-100 dark:bg-night-850" aria-hidden />
          }
        >
          <SidebarBrandFilter />
        </Suspense>
      </div>
    </aside>
  )
}
