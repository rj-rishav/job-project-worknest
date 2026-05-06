import { describe, it, expect, beforeEach, vi } from "vitest"
import { Role } from "@prisma/client"
import {
  inviteMember,
  updateMemberRole,
  removeMember,
} from "@/app/workspace/[workspaceId]/team/actions"
import { setupTestScenario, createTestUser, prisma } from "../helpers/test-data"

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("RBAC - Team Management Permissions", () => {
  let scenario: Awaited<ReturnType<typeof setupTestScenario>>

  beforeEach(async () => {
    scenario = await setupTestScenario()
  })

  describe("Invite Member", () => {
    it("should allow ADMIN to invite member", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await inviteMember({
        email: "newmember@test.com",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.user.email).toBe("newmember@test.com")
        expect(result.data.role).toBe(Role.MEMBER)
      }
    })

    it("should allow OWNER to invite member", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await inviteMember({
        email: "newmember2@test.com",
        role: Role.ADMIN,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(true)
    })

    it("should NOT allow MEMBER to invite member", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await inviteMember({
        email: "newmember3@test.com",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Insufficient permissions")
      }
    })

    it("should NOT allow VIEWER to invite member", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.viewer.id),
      }))

      const result = await inviteMember({
        email: "newmember4@test.com",
        role: Role.MEMBER,
        workspaceId: scenario.workspace.id,
      })

      expect(result.success).toBe(false)
    })

    it("should prevent inviting existing member", async () => {
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
        expect(result.error).toContain("already a member")
      }
    })
  })

  describe("Update Member Role", () => {
    it("should allow ADMIN to change MEMBER role", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.member.id, scenario.workspace.id, {
        role: Role.VIEWER,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe(Role.VIEWER)
      }
    })

    it("should allow OWNER to change ADMIN role", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await updateMemberRole(scenario.memberships.admin.id, scenario.workspace.id, {
        role: Role.MEMBER,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe(Role.MEMBER)
      }
    })

    it("should NOT allow ADMIN to change OWNER role", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.owner.id, scenario.workspace.id, {
        role: Role.ADMIN,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Only owners can change another owner's role")
      }
    })

    it("should NOT allow ADMIN to promote to OWNER", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.member.id, scenario.workspace.id, {
        role: Role.OWNER,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Only owners can promote members to owner")
      }
    })

    it("should NOT allow changing own role", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await updateMemberRole(scenario.memberships.admin.id, scenario.workspace.id, {
        role: Role.OWNER,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("cannot change your own role")
      }
    })

    it("should NOT allow demoting last OWNER", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      // Create a second owner first
      const secondOwner = await createTestUser({ email: "owner2@test.com" })
      const secondOwnerMembership = await prisma.membership.create({
        data: {
          userId: secondOwner.id,
          workspaceId: scenario.workspace.id,
          role: Role.OWNER,
        },
      })

      // Now demote the second owner (should work)
      const result1 = await updateMemberRole(secondOwnerMembership.id, scenario.workspace.id, {
        role: Role.ADMIN,
      })
      expect(result1.success).toBe(true)

      // Try to demote the last owner (should fail)
      const result2 = await updateMemberRole(scenario.memberships.owner.id, scenario.workspace.id, {
        role: Role.ADMIN,
      })

      expect(result2.success).toBe(false)
      if (!result2.success) {
        expect(result2.error).toContain("Cannot change role of the last owner")
      }
    })
  })

  describe("Remove Member", () => {
    it("should allow ADMIN to remove MEMBER", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await removeMember(scenario.memberships.member.id, scenario.workspace.id)

      expect(result.success).toBe(true)

      // Verify member is removed
      const membership = await prisma.membership.findUnique({
        where: { id: scenario.memberships.member.id },
      })
      expect(membership).toBeNull()
    })

    it("should allow OWNER to remove ADMIN", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await removeMember(scenario.memberships.admin.id, scenario.workspace.id)

      expect(result.success).toBe(true)
    })

    it("should NOT allow ADMIN to remove OWNER", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.admin.id),
      }))

      const result = await removeMember(scenario.memberships.owner.id, scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Only owners can remove other owners")
      }
    })

    it("should NOT allow removing last OWNER", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.owner.id),
      }))

      const result = await removeMember(scenario.memberships.owner.id, scenario.workspace.id)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Cannot remove the last owner")
      }
    })

    it("should NOT allow MEMBER to remove anyone", async () => {
      vi.doMock("@/lib/auth/session", () => ({
        getRequiredUserId: vi.fn().mockResolvedValue(scenario.users.member.id),
      }))

      const result = await removeMember(scenario.memberships.viewer.id, scenario.workspace.id)

      expect(result.success).toBe(false)
    })
  })
})
