import { beforeAll, afterAll, beforeEach } from "vitest"
import { execSync } from "child_process"

// Set test environment
process.env.NODE_ENV = "test"
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/worknest_test"

beforeAll(async () => {
  // Push schema to test database
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" })
  } catch (error) {
    console.error("Failed to setup test database:", error)
    throw error
  }
})

beforeEach(async () => {
  // Clean database before each test
  const { PrismaClient } = await import("@prisma/client")
  const prisma = new PrismaClient()

  try {
    // Delete in correct order to respect foreign keys
    await prisma.activityLog.deleteMany()
    await prisma.task.deleteMany()
    await prisma.membership.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  } finally {
    await prisma.$disconnect()
  }
})

afterAll(async () => {
  // Cleanup
  const { PrismaClient } = await import("@prisma/client")
  const prisma = new PrismaClient()
  await prisma.$disconnect()
})
