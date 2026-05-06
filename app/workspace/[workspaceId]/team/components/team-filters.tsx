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
import { Role } from "@prisma/client"

interface TeamFiltersProps {
  workspaceId: string
  initialSearch?: string
  initialRoleFilter?: string
}

export function TeamFilters({ workspaceId, initialSearch, initialRoleFilter }: TeamFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(initialSearch || "")

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={initialRoleFilter || "all"}
        onValueChange={(value) => updateFilter("role", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value={Role.OWNER}>Owner</SelectItem>
          <SelectItem value={Role.ADMIN}>Admin</SelectItem>
          <SelectItem value={Role.MEMBER}>Member</SelectItem>
          <SelectItem value={Role.VIEWER}>Viewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
