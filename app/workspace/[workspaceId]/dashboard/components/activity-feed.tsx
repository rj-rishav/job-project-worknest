import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ActivityWithUser } from "@/lib/types"

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
  CREATED:
    "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900",
  UPDATED:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  DELETED:
    "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900",
  INVITED:
    "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  REMOVED:
    "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900",
  ROLE_CHANGED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
  STATUS_CHANGED:
    "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  ASSIGNED:
    "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900",
  UNASSIGNED:
    "bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400 border-gray-200 dark:border-gray-900",
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Activity will appear here as your team creates and updates tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity) => {
            const metadata = activity.metadata as any

            return (
              <div
                key={activity.id}
                className="group flex items-start gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-3 px-3 py-3 rounded-lg transition-all duration-200"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground ring-2 ring-primary/20 shadow-sm">
                  {(activity.user.name || activity.user.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold text-foreground">
                        {activity.user.name || activity.user.email}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {actionLabels[activity.action] || activity.action.toLowerCase()}
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {activity.entityType.toLowerCase()}
                      </span>
                    </p>
                  </div>
                  {metadata?.title && (
                    <p className="text-xs font-medium text-muted-foreground truncate">
                      "{metadata.title}"
                    </p>
                  )}
                  {metadata?.email && (
                    <p className="text-xs font-medium text-muted-foreground truncate">
                      {metadata.email}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold px-2 py-0.5 border ${actionColors[activity.action] || "bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400 border-gray-200 dark:border-gray-900"}`}
                    >
                      {activity.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
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
