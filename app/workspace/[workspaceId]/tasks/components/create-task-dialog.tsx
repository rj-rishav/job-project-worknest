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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskStatus, TaskPriority } from "@/lib/types"
import { createTask } from "../actions"

interface CreateTaskDialogProps {
  workspaceId: string
  members: Array<{ id: string; name: string | null; email: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({
  workspaceId,
  members,
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    status: string
    priority: string
    assigneeId: string
    dueDate: string
  }>({
    title: "",
    description: "",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigneeId: "unassigned",
    dueDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createTask({
        ...formData,
        workspaceId,
        assigneeId: formData.assigneeId === "unassigned" ? null : formData.assigneeId,
        dueDate: formData.dueDate || null,
      })

      if (result.success) {
        toast.success("Task created successfully")
        onOpenChange(false)
        setFormData({
          title: "",
          description: "",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          assigneeId: "unassigned",
          dueDate: "",
        })
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">Create Task</DialogTitle>
            <DialogDescription className="text-base">
              Add a new task to your workspace and assign it to team members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, descriptive title"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details, context, or requirements"
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="status" className="text-sm font-semibold">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as TaskStatus })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as TaskPriority })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="assignee" className="text-sm font-semibold">
                  Assignee
                </Label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="dueDate" className="text-sm font-semibold">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-11 font-semibold min-w-[120px]">
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
