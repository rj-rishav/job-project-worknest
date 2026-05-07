"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskTable } from "./components/task-table"
import { TaskFilters } from "./components/task-filters"
import { CreateTaskDialog } from "./components/create-task-dialog"
import type { Task } from "@/lib/types"

interface TasksClientProps {
  workspaceId: string
  initialTasks: Task[]
  initialTotal: number
  initialHasMore: boolean
  members: Array<{ id: string; name: string | null; email: string }>
  initialFilters: {
    status?: string
    priority?: string
    assigneeId?: string
    search?: string
  }
  initialPage: number
}

export function TasksClient({
  workspaceId,
  initialTasks,
  initialTotal,
  initialHasMore,
  members,
  initialFilters,
  initialPage,
}: TasksClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage and track your workspace tasks</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskFilters workspaceId={workspaceId} members={members} initialFilters={initialFilters} />

      <TaskTable
        workspaceId={workspaceId}
        tasks={initialTasks}
        members={members}
        total={initialTotal}
        page={initialPage}
        hasMore={initialHasMore}
      />

      <CreateTaskDialog
        workspaceId={workspaceId}
        members={members}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
