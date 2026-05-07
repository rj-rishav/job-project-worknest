"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db/prisma"
import { getRequiredUserId } from "@/lib/auth/session"
import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { createActivityLog } from "@/lib/services/activity-log"
import { createTaskSchema, updateTaskSchema, type TaskFilterInput } from "@/lib/validators/task"
import { handleError, ForbiddenError } from "@/lib/utils/errors"
import { successResponse, type ApiResponse } from "@/lib/utils/response"
import { EntityType, Role, type Task } from "@prisma/client"

/**
 * Get tasks with filters, search, and pagination
 */
export async function getTasks(
  workspaceId: string,
  filters?: TaskFilterInput,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ tasks: Task[]; total: number; hasMore: boolean }>> {
  try {
    await verifyWorkspaceAccess(workspaceId)

    const skip = (page - 1) * limit

    const where = {
      workspaceId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { description: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.task.count({ where }),
    ])

    return successResponse({
      tasks,
      total,
      hasMore: skip + tasks.length < total,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Create a new task
 */
export async function createTask(data: unknown): Promise<ApiResponse<Task>> {
  try {
    const userId = await getRequiredUserId()
    const validated = createTaskSchema.parse(data)

    // Verify workspace access
    await verifyWorkspaceAccess(validated.workspaceId)

    // Create task
    const task = await prisma.task.create({
      data: {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        assigneeId: validated.assigneeId,
        workspaceId: validated.workspaceId,
        createdById: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create activity log
    await createActivityLog({
      action: "CREATED",
      entityType: EntityType.TASK,
      entityId: task.id,
      metadata: { title: task.title },
      workspaceId: validated.workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${validated.workspaceId}/tasks`)

    return successResponse(task)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  workspaceId: string,
  data: unknown
): Promise<ApiResponse<Task>> {
  try {
    const userId = await getRequiredUserId()
    const validated = updateTaskSchema.parse(data)

    // Verify workspace access
    const membership = await verifyWorkspaceAccess(workspaceId)

    // Get existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, workspaceId },
    })

    if (!existingTask) {
      throw new ForbiddenError("Task not found")
    }

    // RBAC: Members can only edit their own tasks, Admin+ can edit all
    if (membership.role === Role.MEMBER && existingTask.createdById !== userId) {
      throw new ForbiddenError("You can only edit your own tasks")
    }

    // Viewers cannot edit
    if (membership.role === Role.VIEWER) {
      throw new ForbiddenError("Viewers cannot edit tasks")
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.status && { status: validated.status }),
        ...(validated.priority && { priority: validated.priority }),
        ...(validated.dueDate !== undefined && {
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        }),
        ...(validated.assigneeId !== undefined && { assigneeId: validated.assigneeId }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create activity log with serialized changes
    const serializedChanges = {
      ...validated,
      dueDate:
        validated.dueDate instanceof Date ? validated.dueDate.toISOString() : validated.dueDate,
    }

    await createActivityLog({
      action: "UPDATED",
      entityType: EntityType.TASK,
      entityId: task.id,
      metadata: { title: task.title, changes: serializedChanges },
      workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${workspaceId}/tasks`)

    return successResponse(task)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  taskId: string,
  workspaceId: string
): Promise<ApiResponse<{ success: true }>> {
  try {
    const userId = await getRequiredUserId()

    // Verify workspace access
    const membership = await verifyWorkspaceAccess(workspaceId)

    // Get existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, workspaceId },
    })

    if (!existingTask) {
      throw new ForbiddenError("Task not found")
    }

    // RBAC: Members can only delete their own tasks, Admin+ can delete all
    if (membership.role === Role.MEMBER && existingTask.createdById !== userId) {
      throw new ForbiddenError("You can only delete your own tasks")
    }

    // Viewers cannot delete
    if (membership.role === Role.VIEWER) {
      throw new ForbiddenError("Viewers cannot delete tasks")
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    })

    // Create activity log
    await createActivityLog({
      action: "DELETED",
      entityType: EntityType.TASK,
      entityId: taskId,
      metadata: { title: existingTask.title },
      workspaceId,
      userId,
    })

    revalidatePath(`/workspace/${workspaceId}/tasks`)

    return successResponse({ success: true })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get workspace members for assignee dropdown
 */
export async function getWorkspaceMembers(workspaceId: string) {
  try {
    await verifyWorkspaceAccess(workspaceId)

    const members = await prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(members.map((m) => m.user))
  } catch (error) {
    return handleError(error)
  }
}
