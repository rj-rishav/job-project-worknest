import prisma from "@/lib/db/prisma"
import { TaskStatus } from "@prisma/client"

/**
 * Get comprehensive dashboard data with optimized queries
 * All queries scoped by workspace_id
 */
export async function getDashboardData(workspaceId: string) {
  const now = new Date()

  // Execute all queries in parallel for performance
  const [taskMetrics, memberCount, recentTasks, recentActivity, overdueCount] = await Promise.all([
    // Task metrics - single aggregation query
    prisma.task.groupBy({
      by: ["status"],
      where: { workspaceId },
      _count: true,
    }),

    // Member count - efficient count query
    prisma.membership.count({
      where: { workspaceId },
    }),

    // Recent tasks - limited with includes
    prisma.task.findMany({
      where: { workspaceId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent activity - limited with user data
    prisma.activityLog.findMany({
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
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Overdue tasks count
    prisma.task.count({
      where: {
        workspaceId,
        dueDate: {
          lt: now,
        },
        status: {
          notIn: [TaskStatus.DONE, TaskStatus.CANCELLED],
        },
      },
    }),
  ])

  // Process task metrics
  const totalTasks = taskMetrics.reduce((sum, metric) => sum + metric._count, 0)
  const completedTasks = taskMetrics.find((m) => m.status === TaskStatus.DONE)?._count || 0
  const inProgressTasks = taskMetrics.find((m) => m.status === TaskStatus.IN_PROGRESS)?._count || 0

  return {
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks: overdueCount,
      memberCount,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    recentTasks,
    recentActivity,
  }
}

/**
 * Get task completion trend for the last 7 days
 */
export async function getTaskCompletionTrend(workspaceId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const completedTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      status: TaskStatus.DONE,
      updatedAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      updatedAt: true,
    },
  })

  // Group by day
  const trendData = new Map<string, number>()

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split("T")[0]
    trendData.set(dateKey, 0)
  }

  completedTasks.forEach((task) => {
    const dateKey = task.updatedAt.toISOString().split("T")[0]
    if (trendData.has(dateKey)) {
      trendData.set(dateKey, (trendData.get(dateKey) || 0) + 1)
    }
  })

  return Array.from(trendData.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}

/**
 * Get quick insights for the dashboard
 */
export async function getDashboardInsights(workspaceId: string) {
  const now = new Date()

  const [overdueTasks, mostActiveUser, upcomingDeadlines] = await Promise.all([
    // Overdue tasks
    prisma.task.count({
      where: {
        workspaceId,
        dueDate: { lt: now },
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      },
    }),

    // Most active user (most activity logs)
    prisma.activityLog.groupBy({
      by: ["userId"],
      where: { workspaceId },
      _count: true,
      orderBy: { _count: { userId: "desc" } },
      take: 1,
    }),

    // Upcoming deadlines (next 7 days)
    prisma.task.count({
      where: {
        workspaceId,
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      },
    }),
  ])

  let mostActiveUserData = null
  if (mostActiveUser.length > 0) {
    mostActiveUserData = await prisma.user.findUnique({
      where: { id: mostActiveUser[0].userId },
      select: { name: true, email: true },
    })
  }

  return {
    overdueTasks,
    mostActiveUser: mostActiveUserData,
    upcomingDeadlines,
  }
}
