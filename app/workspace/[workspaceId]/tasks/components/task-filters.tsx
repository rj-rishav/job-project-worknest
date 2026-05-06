"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskStatus, TaskPriority } from "@prisma/client"

interface TaskFiltersProps {
  workspaceId: string
  members: Array<{ id: string; name: string | null; email: string }>
  initialFilters: {
    status?: string
    priority?: string
    assigneeId?: string
    search?: string
  }
}

export function TaskFilters({ workspaceId, members, initialFilters }: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(initialFilters.search || "")

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page") // Reset to page 1 when filtering
    router.push(`?${params.toString()}`)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("q", searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  return (
    <div className="flex gap-4">
      <Select
        value={initialFilters.status || "all"}
        onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={initialFilters.priority || "all"}
        onValueChange={(value) => updateFilter("priority", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
          <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
          <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
          <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={initialFilters.assigneeId || "all"}
        onValueChange={(value) => updateFilter("assigneeId", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name || member.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
