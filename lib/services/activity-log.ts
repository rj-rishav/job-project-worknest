import { ActivityAction, EntityType, type Prisma } from "@prisma/client"
import prisma from "@/lib/db/prisma"

interface CreateActivityLogParams {
  action: ActivityAction
  entityType: EntityType
  entityId?: string
  metadata?: Prisma.JsonObject
  workspaceId: string
  userId: string
}

/**
 * Create an immutable activity log entry
 */
export async function createActivityLog({
  action,
  entityType,
  entityId,
  metadata,
  workspaceId,
  userId,
}: CreateActivityLogParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        metadata: metadata || {},
        workspaceId,
        userId,
      },
    })
  } catch (error) {
    console.error("Failed to create activity log:", error)
    // Don't throw - activity logs should not break the main operation
    return null
  }
}

/**
 * Get activity logs for a workspace with pagination
 */
export async function getWorkspaceActivityLogs(
  workspaceId: string,
  options?: {
    action?: ActivityAction
    entityType?: EntityType
    userId?: string
    limit?: number
    offset?: number
  }
) {
  const { action, entityType, userId, limit = 50, offset = 0 } = options || {}

  const where = {
    workspaceId,
    ...(action && { action }),
    ...(entityType && { entityType }),
    ...(userId && { userId }),
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    logs,
    total,
    hasMore: offset + logs.length < total,
  }
}
