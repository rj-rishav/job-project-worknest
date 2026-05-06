"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db/prisma"
import { getRequiredUserId } from "@/lib/auth/session"
import { verifyWorkspaceAccess, verifyWorkspaceRole } from "@/lib/auth/workspace"
import { createActivityLog } from "@/lib/services/activity-log"
import { inviteMemberSchema, updateMemberRoleSchema } from "@/lib/validators/member"
import { handleError, ForbiddenError } from "@/lib/utils/errors"
import { successResponse, type ApiResponse } from "@/lib/utils/response"
import { EntityType, Role, type Membership, type User } from "@prisma/client"

type MemberWithUser = Membership & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

/**
 * Get workspace members with search and filter
 */
export async function getMembers(
  workspaceId: string,
  search?: string,
  roleFilter?: Role
): Promise<ApiResponse<MemberWithUser[]>> {
  try {
    await verifyWorkspaceAccess(workspaceId)

    const where = {
      workspaceId,
      ...(roleFilter && { role: roleFilter }),
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }),
    }

    const members = await prisma.membership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first, then ADMIN, MEMBER, VIEWER
        { createdAt: "asc" },
      ],
    })

    return successResponse(members)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Invite a new member to the workspace
 */
export async function inviteMember(data: unknown): Promise<ApiResponse<MemberWithUser>> {
  try {
    const userId = await getRequiredUserId()
    const validated = inviteMemberSchema.parse(data)

    // RBAC: Only Admin/Owner can invite
    await verifyWorkspaceRole(validated.workspaceId, Role.ADMIN)

    // Check if user exists
    let invitedUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // If user doesn't exist, create a placeholder (they'll complete signup later)
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email: validated.email,
          name: validated.email.split("@")[0], // Use email prefix as temporary name
        },
      })
    }

    // Check if already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: invitedUser.id,
          workspaceId: validated.workspaceId,
        },
      },
    })

    if (existingMembership) {
      throw new ForbiddenError("User is already a member of this workspace")
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId: invitedUser.id,
        workspaceId: validated.workspaceId,
        role: validated.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Create activity log
    await createActivityLog({
      action: "INVITED",
      entityType: EntityType.MEMBER,
      entityId: invitedUser.id,
      metadata: { email: validated.email, role: validated.role },
      workspaceId: validated.workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${validated.workspaceId}/team`)

    return successResponse(membership)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  membershipId: string,
  workspaceId: string,
  data: unknown
): Promise<ApiResponse<MemberWithUser>> {
  try {
    const userId = await getRequiredUserId()
    const validated = updateMemberRoleSchema.parse(data)

    // RBAC: Only Admin/Owner can change roles
    const currentUserMembership = await verifyWorkspaceRole(workspaceId, Role.ADMIN)

    // Get the membership being updated
    const targetMembership = await prisma.membership.findUnique({
      where: { id: membershipId, workspaceId },
      include: { user: true },
    })

    if (!targetMembership) {
      throw new ForbiddenError("Member not found")
    }

    // Prevent changing own role
    if (targetMembership.userId === userId) {
      throw new ForbiddenError("You cannot change your own role")
    }

    // Only OWNER can change another OWNER's role
    if (targetMembership.role === Role.OWNER && currentUserMembership.role !== Role.OWNER) {
      throw new ForbiddenError("Only owners can change another owner's role")
    }

    // Only OWNER can promote to OWNER
    if (validated.role === Role.OWNER && currentUserMembership.role !== Role.OWNER) {
      throw new ForbiddenError("Only owners can promote members to owner")
    }

    // Check if this is the last owner and they're being demoted
    if (targetMembership.role === Role.OWNER && validated.role !== Role.OWNER) {
      const ownerCount = await prisma.membership.count({
        where: { workspaceId, role: Role.OWNER },
      })

      if (ownerCount <= 1) {
        throw new ForbiddenError("Cannot change role of the last owner")
      }
    }

    // Update role
    const updatedMembership = await prisma.membership.update({
      where: { id: membershipId },
      data: { role: validated.role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Create activity log
    await createActivityLog({
      action: "ROLE_CHANGED",
      entityType: EntityType.MEMBER,
      entityId: targetMembership.userId,
      metadata: {
        email: targetMembership.user.email,
        oldRole: targetMembership.role,
        newRole: validated.role,
      },
      workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${workspaceId}/team`)

    return successResponse(updatedMembership)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Remove member from workspace
 */
export async function removeMember(
  membershipId: string,
  workspaceId: string
): Promise<ApiResponse<{ success: true }>> {
  try {
    const userId = await getRequiredUserId()

    // RBAC: Only Admin/Owner can remove members
    const currentUserMembership = await verifyWorkspaceRole(workspaceId, Role.ADMIN)

    // Get the membership being removed
    const targetMembership = await prisma.membership.findUnique({
      where: { id: membershipId, workspaceId },
      include: { user: true },
    })

    if (!targetMembership) {
      throw new ForbiddenError("Member not found")
    }

    // Prevent removing yourself
    if (targetMembership.userId === userId) {
      // Check if you're the last owner
      if (targetMembership.role === Role.OWNER) {
        const ownerCount = await prisma.membership.count({
          where: { workspaceId, role: Role.OWNER },
        })

        if (ownerCount <= 1) {
          throw new ForbiddenError("Cannot remove yourself as the last owner")
        }
      }
    }

    // Only OWNER can remove another OWNER
    if (targetMembership.role === Role.OWNER && currentUserMembership.role !== Role.OWNER) {
      throw new ForbiddenError("Only owners can remove other owners")
    }

    // Check if this is the last owner
    if (targetMembership.role === Role.OWNER) {
      const ownerCount = await prisma.membership.count({
        where: { workspaceId, role: Role.OWNER },
      })

      if (ownerCount <= 1) {
        throw new ForbiddenError("Cannot remove the last owner")
      }
    }

    // Remove membership
    await prisma.membership.delete({
      where: { id: membershipId },
    })

    // Create activity log
    await createActivityLog({
      action: "REMOVED",
      entityType: EntityType.MEMBER,
      entityId: targetMembership.userId,
      metadata: {
        email: targetMembership.user.email,
        role: targetMembership.role,
      },
      workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${workspaceId}/team`)

    return successResponse({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
