import { z } from "zod"
import { okRows } from "../tool-result"
import type { DomainChatContext } from "../domain-context"

export function createPageContextTool(ctx: DomainChatContext | null) {
  return {
    getPageContext: {
      description:
        "Return the on-screen data snapshot already visible on the current page. Call this FIRST before fetching from Cube — the data may already be present. Returns rows from the active tab/view with all computed metrics.",
      inputSchema: z.object({}),
      execute: (_: Record<string, never>) => {
        if (!ctx?.snapshot?.rows?.length) {
          return Promise.resolve(okRows([], { type: "table", label: "No page context available" }))
        }
        return Promise.resolve(
          okRows(ctx.snapshot.rows, {
            type: "table",
            label: ctx.snapshot.label ?? "Page snapshot",
          })
        )
      },
    },
  }
}
