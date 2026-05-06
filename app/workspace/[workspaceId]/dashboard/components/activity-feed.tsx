import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ActivityLog, User } from "@prisma/client"

type ActivityWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "email">
}

interface ActivityFeedProps {
  activities: ActivityWithUser[]
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
  CREATED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
  DELETED: "bg-red-100 text-red-800",
  INVITED: "bg-purple-100 text-purple-800",
  REMOVED: "bg-orange-100 text-orange-800",
  ROLE_CHANGED: "bg-yellow-100 text-yellow-800",
  STATUS_CHANGED: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-green-100 text-green-800",
  UNASSIGNED: "bg-gray-100 text-gray-800",
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 flex-col items-center justify-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const metadata = activity.metadata as any

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {(activity.user.name || activity.user.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        {activity.user.name || activity.user.email}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {actionLabels[activity.action] || activity.action.toLowerCase()}
                      </span>{" "}
                      <span className="font-medium text-foreground">{activity.entityType}</span>
                    </p>
                  </div>
                  {metadata?.title && (
                    <p className="text-xs text-muted-foreground">"{metadata.title}"</p>
                  )}
                  {metadata?.email && (
                    <p className="text-xs text-muted-foreground">{metadata.email}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${actionColors[activity.action] || "bg-gray-100 text-gray-800"}`}
                    >
                      {activity.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
