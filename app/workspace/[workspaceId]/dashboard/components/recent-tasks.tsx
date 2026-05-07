import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "../../tasks/components/status-badge"
import { PriorityBadge } from "../../tasks/components/priority-badge"
import type { TaskWithAssignee } from "@/lib/types"

interface RecentTasksProps {
  tasks: TaskWithAssignee[]
  workspaceId: string
}

export function RecentTasks({ tasks, workspaceId }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 flex-col items-center justify-center text-center space-y-4">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No tasks yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start by creating your first task
              </p>
            </div>
            <Button asChild size="sm">
              <Link href={`/workspace/${workspaceId}/tasks`}>Create Task</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Tasks</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/workspace/${workspaceId}/tasks`}>
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/workspace/${workspaceId}/tasks`}
              className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.assignee && (
                  <p className="text-xs text-muted-foreground">
                    Assigned to {task.assignee.name || task.assignee.email}
                  </p>
                )}
              </div>
              {task.dueDate && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-xs font-medium">{format(new Date(task.dueDate), "MMM d")}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
