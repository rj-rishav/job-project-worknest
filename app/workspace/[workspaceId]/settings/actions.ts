"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/db/prisma"
import { getRequiredUserId } from "@/lib/auth/session"
import { verifyWorkspaceRole } from "@/lib/auth/workspace"
import { createActivityLog } from "@/lib/services/activity-log"
import { updateWorkspaceSchema } from "@/lib/validators/workspace"
import { handleError, ForbiddenError } from "@/lib/utils/errors"
import { successResponse, type ApiResponse } from "@/lib/utils/response"
import { EntityType, Role, type Workspace } from "@prisma/client"

/**
 * Update workspace settings
 * RBAC: Admin/Owner can update
 */
export async function updateWorkspace(
  workspaceId: string,
  data: unknown
): Promise<ApiResponse<Workspace>> {
  try {
    const userId = await getRequiredUserId()
    const validated = updateWorkspaceSchema.parse(data)

    // RBAC: Only Admin/Owner can update workspace
    await verifyWorkspaceRole(workspaceId, Role.ADMIN)

    // Get current workspace for comparison
    const currentWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!currentWorkspace) {
      throw new ForbiddenError("Workspace not found")
    }

    // Update workspace
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
      },
    })

    // Create activity log
    await createActivityLog({
      action: "UPDATED",
      entityType: EntityType.WORKSPACE,
      entityId: workspaceId,
      metadata: {
        changes: {
          ...(validated.name &&
            validated.name !== currentWorkspace.name && {
              name: { from: currentWorkspace.name, to: validated.name },
            }),
          ...(validated.description !== currentWorkspace.description && {
            description: { from: currentWorkspace.description, to: validated.description },
          }),
        },
      },
      workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${workspaceId}/settings`)
    revalidatePath(`/workspace/${workspaceId}`)

    return successResponse(workspace)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete workspace (cascade delete all related data)
 * RBAC: Owner ONLY
 * Requires confirmation with workspace name
 */
export async function deleteWorkspace(
  workspaceId: string,
  confirmationName: string
): Promise<ApiResponse<{ success: true }>> {
  try {
    const userId = await getRequiredUserId()

    // RBAC: Only Owner can delete workspace
    await verifyWorkspaceRole(workspaceId, Role.OWNER)

    // Get workspace for name verification
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      throw new ForbiddenError("Workspace not found")
    }

    // Verify confirmation name matches exactly
    if (workspace.name !== confirmationName) {
      throw new ForbiddenError("Workspace name does not match. Deletion cancelled.")
    }

    // Create activity log BEFORE deletion
    await createActivityLog({
      action: "DELETED",
      entityType: EntityType.WORKSPACE,
      entityId: workspaceId,
      metadata: {
        name: workspace.name,
        deletedBy: userId,
      },
      workspaceId,
      userId,
    })

    // Delete workspace (cascade delete handled by Prisma schema)
    await prisma.workspace.delete({
      where: { id: workspaceId },
    })

    // Redirect to dashboard after deletion
    redirect("/dashboard")
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get workspace settings
 */
export async function getWorkspaceSettings(workspaceId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, Role.VIEWER)

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!workspace) {
      throw new ForbiddenError("Workspace not found")
    }

    return successResponse(workspace)
  } catch (error) {
    return handleError(error)
  }
}
