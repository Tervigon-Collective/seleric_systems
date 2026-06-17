"use client"

import { useEffect } from "react"
import { useDomainChat } from "./DomainChatProvider"
import type { DomainChatContext } from "@/lib/chat/domain-context"

export function DomainChatRegistrar({ context }: { context: DomainChatContext }) {
  const { registerDomainContext, clearDomainContext } = useDomainChat()

  useEffect(() => {
    registerDomainContext(context)
    return () => clearDomainContext()
    // registerDomainContext and clearDomainContext are stable useCallback refs.
    // context is a server-serialized prop — re-register whenever it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context])

  return null
}
