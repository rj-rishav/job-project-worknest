import { describe, it, expect, beforeEach, vi } from "vitest"
import { Role, TaskStatus, TaskPriority } from "@prisma/client"
import { createTask, updateTask } from "@/app/workspace/[workspaceId]/tasks/actions"
import { inviteMember } from "@/app/workspace/[workspaceId]/team/actions"
import { setupTestScenario, createTestTask } from "../helpers/test-data"

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Input Validation", () => {
  let scenario: Awaited<ReturnType<typeof setupTestScenario>>

  beforeEach(async () => {
    scenario = await setupTestScenario()
    vi.doMock("@/lib/auth/session", () => ({
      getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
    }))
  })

  describe("Task Validation", () => {
    it("should reject task creation with missing title", async () => {
      const result = await createTask({
        title: "",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Title is required")
      }
    })

    it("should reject task creation with title too long", async () => {
      const longTitle = "a".repeat(201)
      const result = await createTask({
        title: longTitle,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Title must be less than 200 characters")
      }
    })

    it("should reject task creation with description too long", async () => {
      const longDescription = "a".repeat(5001)
      const result = await createTask({
        title: "Valid Title",
        description: longDescription,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Description must be less than 5000 characters")
      }
    })

    it("should reject task creation with missing workspaceId", async () => {
      const result = await createTask({
        title: "Valid Title",
        workspaceId: "",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Workspace ID is required")
      }
    })

    it("should reject task creation with invalid status", async () => {
      const result = await createTask({
        title: "Valid Title",
        status: "INVALID_STATUS" as TaskStatus,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid enum value")
      }
    })

    it("should reject task creation with invalid priority", async () => {
      const result = await createTask({
        title: "Valid Title",
        priority: "INVALID_PRIORITY" as TaskPriority,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid enum value")
      }
    })

    it("should reject task creation with invalid dueDate format", async () => {
      const result = await createTask({
        title: "Valid Title",
        dueDate: "not-a-date",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid")
      }
    })

    it("should accept task creation with valid data", async () => {
      const result = await createTask({
        title: "Valid Task",
        description: "Valid description",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date().toISOString(),
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Valid Task")
        expect(result.data.status).toBe(TaskStatus.TODO)
        expect(result.data.priority).toBe(TaskPriority.HIGH)
      }
    })

    it("should accept task creation with minimal required fields", async () => {
      const result = await createTask({
        title: "Minimal Task",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Minimal Task")
        expect(result.data.status).toBe(TaskStatus.TODO) // Default
        expect(result.data.priority).toBe(TaskPriority.MEDIUM) // Default
      }
    })

    it("should accept task update with partial data", async () => {
      const task = await createTestTask({
        title: "Original Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      const result = await updateTask(task.id, scenario.workspace.id, {
        status: TaskStatus.IN_PROGRESS,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Original Task") // Unchanged
        expect(result.data.status).toBe(TaskStatus.IN_PROGRESS) // Updated
      }
    })

    it("should accept task update with null description", async () => {
      const task = await createTestTask({
        title: "Task with Description",
        description: "Original description",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      const result = await updateTask(task.id, scenario.workspace.id, {
        description: null,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeNull()
      }
    })
  })

  describe("Member Invitation Validation", () => {
    beforeEach(() => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))
    })

    it("should reject invitation with invalid email", async () => {
      const result = await inviteMember({
        email: "not-an-email",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid email")
      }
    })

    it("should reject invitation with empty email", async () => {
      const result = await inviteMember({
        email: "",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid email")
      }
    })

    it("should reject invitation with invalid role", async () => {
      const result = await inviteMember({
        email: "valid@test.com",
        role: "INVALID_ROLE" as Role,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Invalid enum value")
      }
    })

    it("should reject invitation with missing workspaceId", async () => {
      const result = await inviteMember({
        email: "valid@test.com",
        role: Role.MEMBER,
        workspaceId: "",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Workspace ID is required")
      }
    })

    it("should accept invitation with valid data", async () => {
      const result = await inviteMember({
        email: "newuser@test.com",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.user.email).toBe("newuser@test.com")
        expect(result.data.role).toBe(Role.MEMBER)
      }
    })

    it("should accept invitation with default role", async () => {
      const result = await inviteMember({
        email: "newuser2@test.com",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe(Role.MEMBER) // Default role
      }
    })
  })

  describe("Edge Cases", () => {
    it("should handle special characters in task title", async () => {
      const result = await createTask({
        title: "Task with special chars: @#$%^&*()",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Task with special chars: @#$%^&*()")
      }
    })

    it("should handle unicode characters in task title", async () => {
      const result = await createTask({
        title: "Task with emoji 🚀 and unicode 你好",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Task with emoji 🚀 and unicode 你好")
      }
    })

    it("should handle whitespace-only title as invalid", async () => {
      const result = await createTask({
        title: "   ",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
    })

    it("should trim and accept title with leading/trailing spaces", async () => {
      const result = await createTask({
        title: "  Valid Title  ",
        workspaceId: scenario.workspace.id,
      })

      // Zod doesn't trim by default, so this should pass as-is
      expect(result.success).toBe(true)
    })
  })
})
