"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import type { DomainChatContext } from "@/lib/chat/domain-context"

type UiUpdate = {
  tab?: string
  focus?: { adId?: string; tagCode?: string; query?: string }
}

type DomainChatContextValue = {
  context: DomainChatContext | null
  isOpen: boolean
  getContext: () => DomainChatContext | null
  registerDomainContext: (ctx: DomainChatContext) => void
  updateUiContext: (ui: UiUpdate) => void
  clearDomainContext: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const DomainChatCtx = createContext<DomainChatContextValue | null>(null)

export function DomainChatProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<DomainChatContext | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const contextRef = useRef<DomainChatContext | null>(null)

  const registerDomainContext = useCallback((ctx: DomainChatContext) => {
    contextRef.current = ctx
    setContext(ctx)
  }, [])

  const updateUiContext = useCallback((ui: UiUpdate) => {
    setContext((prev) => {
      if (!prev) return prev
      const updated: DomainChatContext = {
        ...prev,
        tab: ui.tab ?? prev.tab,
        focus: ui.focus ?? prev.focus,
      }
      contextRef.current = updated
      return updated
    })
  }, [])

  const clearDomainContext = useCallback(() => {
    contextRef.current = null
    setContext(null)
  }, [])

  const getContext = useCallback(() => contextRef.current, [])
  const openDrawer = useCallback(() => setIsOpen(true), [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])

  return (
    <DomainChatCtx.Provider
      value={{
        context,
        isOpen,
        getContext,
        registerDomainContext,
        updateUiContext,
        clearDomainContext,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </DomainChatCtx.Provider>
  )
}

export function useDomainChat(): DomainChatContextValue {
  const ctx = useContext(DomainChatCtx)
  if (!ctx) throw new Error("useDomainChat must be used within DomainChatProvider")
  return ctx
}
