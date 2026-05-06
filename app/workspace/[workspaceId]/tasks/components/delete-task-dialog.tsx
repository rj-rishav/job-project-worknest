"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteTask } from "../actions"
import type { Task } from "@prisma/client"

interface DeleteTaskDialogProps {
  workspaceId: string
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTaskDialog({ workspaceId, task, open, onOpenChange }: DeleteTaskDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await deleteTask(task.id, workspaceId)

      if (result.success) {
        toast.success("Task deleted successfully")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to delete task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
