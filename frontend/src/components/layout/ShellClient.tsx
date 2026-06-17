"use client"

import { DomainChatProvider } from "@/components/chat/DomainChatProvider"
import { DomainChatDrawer } from "@/components/chat/DomainChatDrawer"

export function ShellClient({ children }: { children: React.ReactNode }) {
  return (
    <DomainChatProvider>
      <div className="flex min-h-screen bg-stone-50 dark:bg-night-950">
        {children}
      </div>
      <DomainChatDrawer />
    </DomainChatProvider>
  )
}
