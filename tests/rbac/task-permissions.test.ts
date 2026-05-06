import { describe, it, expect, beforeEach, vi } from "vitest"
import { Role, TaskStatus, TaskPriority } from "@prisma/client"
import { createTask, updateTask, deleteTask } from "@/app/workspace/[workspaceId]/tasks/actions"
import { setupTestScenario, createTestTask, prisma } from "../helpers/test-data"

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("RBAC - Task Permissions", () => {
  let scenario: Awaited<ReturnType<typeof setupTestScenario>>

  beforeEach(async () => {
    scenario = await setupTestScenario()
  })

  describe("Task Creation", () => {
    it("should allow MEMBER to create task", async () => {
      // Mock auth as member
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await createTask({
        title: "Member Task",
        description: "Created by member",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Member Task")
        expect(result.data.createdById).toBe(scenario.users.member.id)
      }
    })

    it("should allow ADMIN to create task", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await createTask({
        title: "Admin Task",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
    })

    it("should allow OWNER to create task", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await createTask({
        title: "Owner Task",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
    })

    it("should allow VIEWER to create task", async () => {
      // Note: Current implementation allows viewers to create tasks
      // This might be a business decision to review
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const result = await createTask({
        title: "Viewer Task",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Task Update - MEMBER Role", () => {
    it("should allow MEMBER to update their own task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Updated Task",
        status: TaskStatus.IN_PROGRESS,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Updated Task")
        expect(result.data.status).toBe(TaskStatus.IN_PROGRESS)
      }
    })

    it("should NOT allow MEMBER to update another user's task", async () => {
      // Create task as admin
      const task = await createTestTask({
        title: "Admin Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.admin.id,
      })

      // Try to update as member
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Hacked Task",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("only edit your own tasks")
      }
    })
  })

  describe("Task Update - ADMIN Role", () => {
    it("should allow ADMIN to update any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Update as admin
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Admin Updated Task",
        priority: TaskPriority.HIGH,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Admin Updated Task")
        expect(result.data.priority).toBe(TaskPriority.HIGH)
      }
    })
  })

  describe("Task Update - OWNER Role", () => {
    it("should allow OWNER to update any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Update as owner
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Owner Updated Task",
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Owner Updated Task")
      }
    })
  })

  describe("Task Update - VIEWER Role", () => {
    it("should NOT allow VIEWER to update any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Try to update as viewer
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Viewer Hacked Task",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Viewers cannot edit tasks")
      }
    })
  })

  describe("Task Delete - MEMBER Role", () => {
    it("should allow MEMBER to delete their own task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(true)

      // Verify task is deleted
      const deletedTask = await prisma.task.findUnique({ where: { id: task.id } })
      expect(deletedTask).toBeNull()
    })

    it("should NOT allow MEMBER to delete another user's task", async () => {
      // Create task as admin
      const task = await createTestTask({
        title: "Admin Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.admin.id,
      })

      // Try to delete as member
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("only delete your own tasks")
      }

      // Verify task still exists
      const existingTask = await prisma.task.findUnique({ where: { id: task.id } })
      expect(existingTask).not.toBeNull()
    })
  })

  describe("Task Delete - ADMIN Role", () => {
    it("should allow ADMIN to delete any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Delete as admin
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(true)

      // Verify task is deleted
      const deletedTask = await prisma.task.findUnique({ where: { id: task.id } })
      expect(deletedTask).toBeNull()
    })
  })

  describe("Task Delete - OWNER Role", () => {
    it("should allow OWNER to delete any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Delete as owner
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(true)
    })
  })

  describe("Task Delete - VIEWER Role", () => {
    it("should NOT allow VIEWER to delete any task", async () => {
      // Create task as member
      const task = await createTestTask({
        title: "Member Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      // Try to delete as viewer
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Viewers cannot delete tasks")
      }

      // Verify task still exists
      const existingTask = await prisma.task.findUnique({ where: { id: task.id } })
      expect(existingTask).not.toBeNull()
    })
  })
})
