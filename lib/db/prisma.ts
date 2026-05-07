import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

let prismaInstance: PrismaClient | null = null

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables")
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined
} & typeof global

// Lazy initialization - only create client when first accessed
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = globalThis.prismaGlobal ?? prismaClientSingleton()
      if (process.env.NODE_ENV !== "production") {
        globalThis.prismaGlobal = prismaInstance
      }
    }
    return (prismaInstance as any)[prop]
  },
})

export default prisma
