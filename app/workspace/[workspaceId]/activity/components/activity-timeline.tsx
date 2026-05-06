"use client"

import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ActivityLog, User } from "@prisma/client"

type ActivityWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface ActivityTimelineProps {
  workspaceId: string
  logs: ActivityWithUser[]
  total: number
  page: number
  hasMore: boolean
}

const actionLabels: Record<string, string> = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  INVITED: "invited",
  REMOVED: "removed",
  ROLE_CHANGED: "changed role of",
  STATUS_CHANGED: "changed status of",
  ASSIGNED: "assigned",
  UNASSIGNED: "unassigned",
}

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 border-green-200",
  UPDATED: "bg-blue-100 text-blue-800 border-blue-200",
  DELETED: "bg-red-100 text-red-800 border-red-200",
  INVITED: "bg-purple-100 text-purple-800 border-purple-200",
  REMOVED: "bg-orange-100 text-orange-800 border-orange-200",
  ROLE_CHANGED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  STATUS_CHANGED: "bg-blue-100 text-blue-800 border-blue-200",
  ASSIGNED: "bg-green-100 text-green-800 border-green-200",
  UNASSIGNED: "bg-gray-100 text-gray-800 border-gray-200",
}

const entityIcons: Record<string, string> = {
  task: "📋",
  member: "👤",
  workspace: "🏢",
}

export function ActivityTimeline({ logs, total, page, hasMore }: ActivityTimelineProps) {
  const router = useRouter()

  if (logs.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No activity yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity will appear here as actions are performed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {logs.map((log, index) => {
          const metadata = log.metadata as any
          const isLast = index === logs.length - 1

          return (
            <div key={log.id} className="relative flex gap-4 pb-8">
              {/* Timeline line */}
              {!isLast && <div className="absolute left-5 top-12 h-full w-px bg-border" />}

              {/* Avatar */}
              <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground ring-4 ring-background">
                {(log.user.name || log.user.email).charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold text-foreground">
                        {log.user.name || log.user.email}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {actionLabels[log.action] || log.action.toLowerCase()}
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {entityIcons[log.entityType] || ""} {log.entityType}
                      </span>
                    </p>

                    {/* Metadata details */}
                    {metadata?.title && (
                      <p className="text-sm text-muted-foreground">"{metadata.title}"</p>
                    )}
                    {metadata?.email && (
                      <p className="text-sm text-muted-foreground">{metadata.email}</p>
                    )}
                    {metadata?.oldRole && metadata?.newRole && (
                      <p className="text-sm text-muted-foreground">
                        from <span className="font-medium">{metadata.oldRole}</span> to{" "}
                        <span className="font-medium">{metadata.newRole}</span>
                      </p>
                    )}
                    {metadata?.from && metadata?.to && (
                      <p className="text-sm text-muted-foreground">
                        from <span className="font-medium">{metadata.from}</span> to{" "}
                        <span className="font-medium">{metadata.to}</span>
                      </p>
                    )}

                    {/* Action badge and timestamp */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${actionColors[log.action] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                      >
                        {log.action}
                      </Badge>
                      <span
                        className="text-xs text-muted-foreground"
                        title={format(new Date(log.createdAt), "PPpp")}
                      >
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} activities
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => router.push(`?page=${page - 1}`)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => router.push(`?page=${page + 1}`)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
