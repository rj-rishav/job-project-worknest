import { describe, it, expect, beforeEach, vi } from "vitest"
import { Role } from "@prisma/client"
import { createTask, updateTask, deleteTask } from "@/app/workspace/[workspaceId]/tasks/actions"
import { inviteMember, updateMemberRole } from "@/app/workspace/[workspaceId]/team/actions"
import { setupTestScenario, createTestTask } from "../helpers/test-data"

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Error Handling", () => {
  let scenario: Awaited<ReturnType<typeof setupTestScenario>>

  beforeEach(async () => {
    scenario = await setupTestScenario()
  })

  describe("Unauthorized Access Errors", () => {
    it("should return proper error when user not in workspace", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.outsider.id),
      }))

      // Outsider tries to create task in workspace they don't belong to
      await expect(async () => {
        await createTask({
          title: "Unauthorized Task",
          workspaceId: scenario.workspace.id,
        })
      }).rejects.toThrow()
    })

    it("should return proper error when viewer tries to edit", async () => {
      const task = await createTestTask({
        title: "Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Updated",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Viewers cannot edit tasks")
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("should return proper error when member tries to edit others task", async () => {
      const task = await createTestTask({
        title: "Admin Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.admin.id,
      })

      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Hacked",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("only edit your own tasks")
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("should return proper error when member tries to delete others task", async () => {
      const task = await createTestTask({
        title: "Admin Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.admin.id,
      })

      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await deleteTask(task.id, scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("only delete your own tasks")
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("should return proper error when member tries to invite", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await inviteMember({
        email: "newuser@test.com",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Insufficient permissions")
      }
    })
  })

  describe("Validation Errors", () => {
    beforeEach(() => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))
    })

    it("should return validation error for missing required field", async () => {
      const result = await createTask({
        title: "",
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Title is required")
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("should return validation error for invalid email", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await inviteMember({
        email: "not-an-email",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Invalid email")
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("should return validation error for invalid enum value", async () => {
      const result = await createTask({
        title: "Valid Title",
        status: "INVALID_STATUS" as any,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })

    it("should return validation error for field too long", async () => {
      const result = await createTask({
        title: "a".repeat(201),
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("must be less than 200 characters")
        expect(result.code).toBe("VALIDATION_ERROR")
      }
    })
  })

  describe("Not Found Errors", () => {
    beforeEach(() => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))
    })

    it("should return error when updating non-existent task", async () => {
      const result = await updateTask("non-existent-id", scenario.workspace.id, {
        title: "Updated",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Task not found")
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("should return error when deleting non-existent task", async () => {
      const result = await deleteTask("non-existent-id", scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Task not found")
      }
    })

    it("should return error when updating non-existent member", async () => {
      const result = await updateMemberRole("non-existent-id", scenario.workspace.id, {
        role: Role.VIEWER,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Member not found")
      }
    })
  })

  describe("Business Logic Errors", () => {
    it("should return error when inviting existing member", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await inviteMember({
        email: scenario.users.member.email,
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("already a member")
        expect(result.code).toBe("FORBIDDEN")
      }
    })

    it("should return error when trying to change own role", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.admin.id, scenario.workspace.id, {
        role: Role.OWNER,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("cannot change your own role")
      }
    })

    it("should return error when admin tries to promote to owner", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.member.id, scenario.workspace.id, {
        role: Role.OWNER,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error).toContain("Only owners can promote members to owner")
      }
    })
  })

  describe("Error Response Structure", () => {
    it("should have consistent error response structure", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await createTask({
        title: "",
        workspaceId: scenario.workspace.id,
      })

      expect(result).toHaveProperty("success")
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result).toHaveProperty("error")
        expect(typeof result.error).toBe("string")
        expect(result.error.length).toBeGreaterThan(0)
      }
    })

    it("should include error code when available", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const task = await createTestTask({
        title: "Task",
        workspaceId: scenario.workspace.id,
        createdById: scenario.users.member.id,
      })

      const result = await updateTask(task.id, scenario.workspace.id, {
        title: "Updated",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result).toHaveProperty("code")
        expect(result.code).toBeDefined()
      }
    })
  })
})
