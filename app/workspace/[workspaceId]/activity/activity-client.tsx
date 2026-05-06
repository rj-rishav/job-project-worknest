"use client"

import { ActivityFilters } from "./components/activity-filters"
import { ActivityTimeline } from "./components/activity-timeline"
import type { ActivityLog, User } from "@prisma/client"

type ActivityWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface ActivityClientProps {
  workspaceId: string
  initialLogs: ActivityWithUser[]
  initialTotal: number
  initialHasMore: boolean
  users: Array<{ id: string; name: string | null; email: string }>
  initialFilters: {
    action?: string
    userId?: string
    entityType?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
  initialPage: number
}

export function ActivityClient({
  workspaceId,
  initialLogs,
  initialTotal,
  initialHasMore,
  users,
  initialFilters,
  initialPage,
}: ActivityClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">
          Track all actions and changes in your workspace
        </p>
      </div>

      <ActivityFilters workspaceId={workspaceId} users={users} initialFilters={initialFilters} />

      <ActivityTimeline
        workspaceId={workspaceId}
        logs={initialLogs}
        total={initialTotal}
        page={initialPage}
        hasMore={initialHasMore}
      />
    </div>
  )
}
