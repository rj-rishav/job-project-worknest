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
import { ActivityAction, EntityType } from "@prisma/client"

interface ActivityFiltersProps {
  workspaceId: string
  users: Array<{ id: string; name: string | null; email: string }>
  initialFilters: {
    action?: string
    userId?: string
    entityType?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
}

const entityTypes = [
  { value: EntityType.TASK, label: "Task" },
  { value: EntityType.MEMBER, label: "Member" },
  { value: EntityType.WORKSPACE, label: "Workspace" },
]

export function ActivityFilters({ workspaceId, users, initialFilters }: ActivityFiltersProps) {
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
    <div className="flex flex-wrap gap-4">
      <Select
        value={initialFilters.action || "all"}
        onValueChange={(value) => updateFilter("action", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value={ActivityAction.CREATED}>Created</SelectItem>
          <SelectItem value={ActivityAction.UPDATED}>Updated</SelectItem>
          <SelectItem value={ActivityAction.DELETED}>Deleted</SelectItem>
          <SelectItem value={ActivityAction.INVITED}>Invited</SelectItem>
          <SelectItem value={ActivityAction.REMOVED}>Removed</SelectItem>
          <SelectItem value={ActivityAction.ROLE_CHANGED}>Role Changed</SelectItem>
          <SelectItem value={ActivityAction.STATUS_CHANGED}>Status Changed</SelectItem>
          <SelectItem value={ActivityAction.ASSIGNED}>Assigned</SelectItem>
          <SelectItem value={ActivityAction.UNASSIGNED}>Unassigned</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={initialFilters.entityType || "all"}
        onValueChange={(value) => updateFilter("entityType", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Entity Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {entityTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={initialFilters.userId || "all"}
        onValueChange={(value) => updateFilter("userId", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="User" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name || user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search activity..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
