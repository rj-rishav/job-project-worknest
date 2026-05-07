import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, Clock } from "lucide-react"
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
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">No tasks yet</p>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Create your first task to start tracking work and collaborating with your team
              </p>
            </div>
            <Button asChild size="default" className="mt-2">
              <Link href={`/workspace/${workspaceId}/tasks`}>Create Your First Task</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 transition-all duration-200 ease-out hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1 transition-all duration-150 ease-out hover:gap-2"
        >
          <Link href={`/workspace/${workspaceId}/tasks`}>
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/workspace/${workspaceId}/tasks`}
              className="group flex items-start justify-between gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-3 px-3 py-3 rounded-lg transition-all duration-150 ease-out"
            >
              <div className="flex-1 space-y-2 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150 ease-out line-clamp-1">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-2 ring-primary/20">
                      {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground truncate">
                      {task.assignee.name || task.assignee.email}
                    </p>
                  </div>
                )}
              </div>
              {task.dueDate && (
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <p className="text-xs font-medium">Due</p>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {format(new Date(task.dueDate), "MMM d")}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
