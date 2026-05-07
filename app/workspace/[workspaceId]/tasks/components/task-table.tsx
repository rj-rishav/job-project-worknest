"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { PriorityBadge } from "./priority-badge"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import type { Task } from "@/lib/types"

interface TaskTableProps {
  workspaceId: string
  tasks: Task[]
  members: Array<{ id: string; name: string | null; email: string }>
  total: number
  page: number
  hasMore: boolean
}

export function TaskTable({ workspaceId, tasks, members, total, page, hasMore }: TaskTableProps) {
  const router = useRouter()
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)

  if (tasks.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10 shadow-lg">
            <svg
              className="h-10 w-10 text-primary"
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
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">No tasks found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get started by creating your first task to track work, assign team members, and
              monitor progress
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border-2 border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead className="w-[40%] font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Assignee</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId)

              return (
                <TableRow
                  key={task.id}
                  className="group hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-0"
                >
                  <TableCell className="font-medium py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 font-medium">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="py-4">
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell className="py-4">
                    {assignee ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-primary-foreground ring-2 ring-primary/20 shadow-sm">
                          {(assignee.name || assignee.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {assignee.name || assignee.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    {task.dueDate ? (
                      <span className="text-sm font-medium">
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">No due date</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => setEditTask(task)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setDeleteTask(task)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{(page - 1) * 20 + 1}</span> to{" "}
          <span className="font-semibold text-foreground">{Math.min(page * 20, total)}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> tasks
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => router.push(`?page=${page - 1}`)}
            className="font-medium"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => router.push(`?page=${page + 1}`)}
            className="font-medium"
          >
            Next
          </Button>
        </div>
      </div>

      {editTask && (
        <EditTaskDialog
          workspaceId={workspaceId}
          task={editTask}
          members={members}
          open={!!editTask}
          onOpenChange={(open) => !open && setEditTask(null)}
        />
      )}

      {deleteTask && (
        <DeleteTaskDialog
          workspaceId={workspaceId}
          task={deleteTask}
          open={!!deleteTask}
          onOpenChange={(open) => !open && setDeleteTask(null)}
        />
      )}
    </>
  )
}
