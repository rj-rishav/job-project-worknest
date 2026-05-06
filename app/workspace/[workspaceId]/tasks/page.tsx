import { Suspense } from "react"
import { Metadata } from "next"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { getTasks, getWorkspaceMembers } from "./actions"
import { TasksClient } from "./tasks-client"
import { TasksLoading } from "./tasks-loading"

export const metadata: Metadata = {
  title: "Tasks | WorkNest",
  description: "Manage and track your workspace tasks",
}

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { workspaceId } = await params
  const search = await searchParams

  const filters = {
    status: search.status as TaskStatus | undefined,
    priority: search.priority as TaskPriority | undefined,
    assigneeId: search.assigneeId as string | undefined,
    search: search.q as string | undefined,
  }

  const page = Number(search.page) || 1

  const [tasksResult, membersResult] = await Promise.all([
    getTasks(workspaceId, filters, page),
    getWorkspaceMembers(workspaceId),
  ])

  if (!tasksResult.success || !membersResult.success) {
    const errorMessage = !tasksResult.success
      ? tasksResult.error
      : !membersResult.success
        ? membersResult.error
        : "Unknown error"

    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error loading tasks</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksClient
        workspaceId={workspaceId}
        initialTasks={tasksResult.data.tasks}
        initialTotal={tasksResult.data.total}
        initialHasMore={tasksResult.data.hasMore}
        members={membersResult.data}
        initialFilters={filters}
        initialPage={page}
      />
    </Suspense>
  )
}
