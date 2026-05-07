import "dotenv/config"
import { PrismaClient, EntityType, Role, TaskStatus, TaskPriority } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Starting database seed...")

  // Create demo users
  const hashedPassword = await bcrypt.hash("Password123", 10)

  const user1 = await prisma.user.upsert({
    where: { email: "owner@worknest.com" },
    update: {},
    create: {
      email: "owner@worknest.com",
      name: "John Owner",
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: "admin@worknest.com" },
    update: {},
    create: {
      email: "admin@worknest.com",
      name: "Jane Admin",
      password: hashedPassword,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: "member@worknest.com" },
    update: {},
    create: {
      email: "member@worknest.com",
      name: "Bob Member",
      password: hashedPassword,
    },
  })

  console.log("✅ Created demo users")

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      description: "Demo workspace for Acme Corporation",
    },
  })

  console.log("✅ Created demo workspace")

  // Create memberships
  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user1.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user2.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      workspaceId: workspace.id,
      role: Role.ADMIN,
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user3.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      workspaceId: workspace.id,
      role: Role.MEMBER,
    },
  })

  console.log("✅ Created memberships")

  // Create demo tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Set up project infrastructure",
      description: "Initialize the project with Next.js, Prisma, and authentication",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      workspaceId: workspace.id,
      assigneeId: user1.id,
      createdById: user1.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: "Design database schema",
      description: "Create comprehensive database schema with proper relations and indexes",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      workspaceId: workspace.id,
      assigneeId: user2.id,
      createdById: user1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Implement task management",
      description: "Build CRUD operations for tasks with filters and search",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      workspaceId: workspace.id,
      assigneeId: user2.id,
      createdById: user1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  await prisma.task.create({
    data: {
      title: "Build team management screen",
      description: "Create UI for inviting and managing team members",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      workspaceId: workspace.id,
      assigneeId: user3.id,
      createdById: user1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Implement activity logging",
      description: "Add comprehensive activity tracking across all operations",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      workspaceId: workspace.id,
      createdById: user1.id,
    },
  })

  console.log("✅ Created demo tasks")

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        action: "CREATED",
        entityType: EntityType.WORKSPACE,
        entityId: workspace.id,
        metadata: { name: workspace.name },
        workspaceId: workspace.id,
        userId: user1.id,
      },
      {
        action: "INVITED",
        entityType: EntityType.MEMBER,
        entityId: user2.id,
        metadata: { email: user2.email, role: Role.ADMIN },
        workspaceId: workspace.id,
        userId: user1.id,
      },
      {
        action: "INVITED",
        entityType: EntityType.MEMBER,
        entityId: user3.id,
        metadata: { email: user3.email, role: Role.MEMBER },
        workspaceId: workspace.id,
        userId: user1.id,
      },
      {
        action: "CREATED",
        entityType: EntityType.TASK,
        entityId: task1.id,
        metadata: { title: task1.title },
        workspaceId: workspace.id,
        userId: user1.id,
      },
      {
        action: "CREATED",
        entityType: EntityType.TASK,
        entityId: task2.id,
        metadata: { title: task2.title },
        workspaceId: workspace.id,
        userId: user1.id,
      },
      {
        action: "STATUS_CHANGED",
        entityType: EntityType.TASK,
        entityId: task1.id,
        metadata: { from: TaskStatus.TODO, to: TaskStatus.DONE },
        workspaceId: workspace.id,
        userId: user1.id,
      },
    ],
  })

  console.log("✅ Created activity logs")

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📧 Demo credentials:")
  console.log("   Owner:  owner@worknest.com / Password123")
  console.log("   Admin:  admin@worknest.com / Password123")
  console.log("   Member: member@worknest.com / Password123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
