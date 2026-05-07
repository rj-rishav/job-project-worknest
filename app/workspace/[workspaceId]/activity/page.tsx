import { Suspense } from "react"
import { Metadata } from "next"
import { getActivityLogs, getActivityUsers } from "./actions"
import { ActivityClient } from "./activity-client"
import { ActivityLoading } from "./activity-loading"

export const metadata: Metadata = {
  title: "Activity Logs | WorkNest",
  description: "Track all actions and changes in your workspace",
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { workspaceId } = await params
  const search = await searchParams

  const filters = {
    action: search.action as string | undefined,
    userId: search.userId as string | undefined,
    entityType: search.entityType as string | undefined,
    dateFrom: search.dateFrom as string | undefined,
    dateTo: search.dateTo as string | undefined,
    search: search.q as string | undefined,
  }

  const page = Number(search.page) || 1

  const [logsResult, usersResult] = await Promise.all([
    getActivityLogs(workspaceId, filters, page),
    getActivityUsers(workspaceId),
  ])

  if (!logsResult.success || !usersResult.success) {
    const errorMessage = !logsResult.success
      ? logsResult.error
      : !usersResult.success
        ? usersResult.error
        : "Unknown error"

    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error loading activity</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<ActivityLoading />}>
      <div className="page-enter">
        <ActivityClient
          workspaceId={workspaceId}
          initialLogs={logsResult.data.logs}
          initialTotal={logsResult.data.total}
          initialHasMore={logsResult.data.hasMore}
          users={usersResult.data}
          initialFilters={filters}
          initialPage={page}
        />
      </div>
    </Suspense>
  )
}
