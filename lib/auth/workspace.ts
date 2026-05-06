import { Role } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { getRequiredUserId } from "./session"
import { redirect } from "next/navigation"

/**
 * Verify user has access to a workspace and return membership
 * Redirects to dashboard if no access
 */
export async function verifyWorkspaceAccess(workspaceId: string) {
  const userId = await getRequiredUserId()

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      workspace: true,
      user: true,
    },
  })

  if (!membership) {
    redirect("/dashboard")
  }

  return membership
}

/**
 * Verify user has a specific role or higher in a workspace
 * Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
 */
export async function verifyWorkspaceRole(workspaceId: string, requiredRole: Role) {
  const membership = await verifyWorkspaceAccess(workspaceId)

  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  }

  if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
    throw new Error("Insufficient permissions")
  }

  return membership
}

/**
 * Check if user is workspace owner
 */
export async function isWorkspaceOwner(workspaceId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, Role.OWNER)
    return true
  } catch {
    return false
  }
}

/**
 * Check if user is workspace admin or higher
 */
export async function isWorkspaceAdmin(workspaceId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, Role.ADMIN)
    return true
  } catch {
    return false
  }
}

/**
 * Get user's workspace membership or null
 */
export async function getWorkspaceMembership(workspaceId: string) {
  const userId = await getRequiredUserId()

  return await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      workspace: true,
      user: true,
    },
  })
}

/**
 * Get all workspaces the user has access to
 */
export async function getUserWorkspaces() {
  const userId = await getRequiredUserId()

  return await prisma.membership.findMany({
    where: {
      userId,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      workspace: {
        name: "asc",
      },
    },
  })
}
