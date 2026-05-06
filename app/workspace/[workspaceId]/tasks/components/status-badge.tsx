import { Badge } from "@/components/ui/badge"
import { TaskStatus } from "@prisma/client"

const statusConfig = {
  [TaskStatus.TODO]: { label: "To Do", variant: "secondary" as const },
  [TaskStatus.IN_PROGRESS]: { label: "In Progress", variant: "default" as const },
  [TaskStatus.IN_REVIEW]: { label: "In Review", variant: "outline" as const },
  [TaskStatus.DONE]: { label: "Done", variant: "default" as const },
  [TaskStatus.CANCELLED]: { label: "Cancelled", variant: "destructive" as const },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  )
}
