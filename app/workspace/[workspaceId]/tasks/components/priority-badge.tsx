import { Badge } from "@/components/ui/badge"
import { TaskPriority } from "@/lib/types"

const priorityConfig = {
  [TaskPriority.LOW]: { label: "Low", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  [TaskPriority.HIGH]: {
    label: "High",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  [TaskPriority.URGENT]: { label: "Urgent", className: "bg-red-100 text-red-800 hover:bg-red-100" },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
