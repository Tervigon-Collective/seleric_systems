// Generated client lives at apps/web (schema.prisma generator.output).
// Default @prisma/client stubs throw "did not initialize yet".
import { PrismaClient } from "../../../apps/web/src/generated/prisma"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
