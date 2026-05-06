import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Create a test user
 */
export async function createTestUser(data?: { email?: string; name?: string; password?: string }) {
  const email = data?.email || `test-${Date.now()}@example.com`
  const hashedPassword = await bcrypt.hash(data?.password || "password123", 10)

  return await prisma.user.create({
    data: {
      email,
      name: data?.name || "Test User",
      password: hashedPassword,
    },
  })
}

/**
 * Create a test workspace
 */
export async function createTestWorkspace(data?: {
  name?: string
  slug?: string
  description?: string
}) {
  const timestamp = Date.now()
  return await prisma.workspace.create({
    data: {
      name: data?.name || `Test Workspace ${timestamp}`,
      slug: data?.slug || `test-workspace-${timestamp}`,
      description: data?.description || "Test workspace description",
    },
  })
}

/**
 * Create a membership
 */
export async function createMembership(
  userId: string,
  workspaceId: string,
  role: Role = Role.MEMBER
) {
  return await prisma.membership.create({
    data: {
      userId,
      workspaceId,
      role,
    },
    include: {
      user: true,
      workspace: true,
    },
  })
}

/**
 * Create a test task
 */
export async function createTestTask(data: {
  title: string
  workspaceId: string
  createdById: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: Date
}) {
  return await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || TaskStatus.TODO,
      priority: data.priority || TaskPriority.MEDIUM,
      workspaceId: data.workspaceId,
      createdById: data.createdById,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Setup a complete test scenario with workspace and users
 */
export async function setupTestScenario() {
  // Create workspace
  const workspace = await createTestWorkspace()

  // Create users with different roles
  const owner = await createTestUser({ email: "owner@test.com", name: "Owner User" })
  const admin = await createTestUser({ email: "admin@test.com", name: "Admin User" })
  const member = await createTestUser({ email: "member@test.com", name: "Member User" })
  const viewer = await createTestUser({ email: "viewer@test.com", name: "Viewer User" })
  const outsider = await createTestUser({ email: "outsider@test.com", name: "Outsider User" })

  // Create memberships
  const ownerMembership = await createMembership(owner.id, workspace.id, Role.OWNER)
  const adminMembership = await createMembership(admin.id, workspace.id, Role.ADMIN)
  const memberMembership = await createMembership(member.id, workspace.id, Role.MEMBER)
  const viewerMembership = await createMembership(viewer.id, workspace.id, Role.VIEWER)

  return {
    workspace,
    users: {
      owner,
      admin,
      member,
      viewer,
      outsider,
    },
    memberships: {
      owner: ownerMembership,
      admin: adminMembership,
      member: memberMembership,
      viewer: viewerMembership,
    },
  }
}

/**
 * Create a second workspace for multi-tenancy tests
 */
export async function createSecondWorkspace(userId: string, role: Role = Role.OWNER) {
  const workspace = await createTestWorkspace({
    name: "Second Workspace",
    slug: `second-workspace-${Date.now()}`,
  })

  const membership = await createMembership(userId, workspace.id, role)

  return { workspace, membership }
}

export { prisma }
