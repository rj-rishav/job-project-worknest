import prisma from "@/lib/db/prisma"
import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { activityFilterSchema } from "@/lib/validators/activity"
import { handleError } from "@/lib/utils/errors"
import { successResponse, type ApiResponse } from "@/lib/utils/response"
import type { ActivityLog, Prisma, User } from "@prisma/client"

type ActivityWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

/**
 * Get activity logs with filters, search, and pagination
 * READ-ONLY - Activity logs are immutable
 */
export async function getActivityLogs(
  workspaceId: string,
  filters?: Record<string, string | undefined>,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ logs: ActivityWithUser[]; total: number; hasMore: boolean }>> {
  try {
    // Verify workspace access (Viewer+ can read logs)
    await verifyWorkspaceAccess(workspaceId)

    // Validate filters
    const validated = filters
      ? activityFilterSchema.parse(filters)
      : {
          action: undefined,
          userId: undefined,
          entityType: undefined,
          dateFrom: undefined,
          dateTo: undefined,
          search: undefined,
        }

    const skip = (page - 1) * limit

    // Build where clause with all filters
    const where: Prisma.ActivityLogWhereInput = {
      workspaceId,
      ...(validated.action && { action: validated.action }),
      ...(validated.userId && { userId: validated.userId }),
      ...(validated.entityType && { entityType: validated.entityType }),
    }

    // Handle date range filters
    if (validated.dateFrom || validated.dateTo) {
      where.createdAt = {
        ...(validated.dateFrom && { gte: new Date(validated.dateFrom) }),
        ...(validated.dateTo && { lte: new Date(validated.dateTo) }),
      }
    }

    // Search in metadata (title, email, etc.)
    if (validated.search) {
      // Search in metadata JSON field
      // Note: This is a simple implementation. For production, consider full-text search
      where.OR = [
        {
          metadata: {
            path: ["title"],
            string_contains: validated.search,
          },
        },
        {
          metadata: {
            path: ["email"],
            string_contains: validated.search,
          },
        },
      ]
    }

    // Execute queries in parallel
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
          createdAt: "desc", // Stable ordering using indexed column
        },
        take: limit,
        skip,
      }),
      prisma.activityLog.count({ where }),
    ])

    return successResponse({
      logs,
      total,
      hasMore: skip + logs.length < total,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get unique users who have activity in this workspace
 * For filter dropdown
 */
export async function getActivityUsers(workspaceId: string) {
  try {
    await verifyWorkspaceAccess(workspaceId)

    // Get distinct user IDs from activity logs
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["userId"],
      orderBy: {
        user: {
          name: "asc",
        },
      },
    })

    const users = activities.map((a) => a.user)

    return successResponse(users)
  } catch (error) {
    return handleError(error)
  }
}
