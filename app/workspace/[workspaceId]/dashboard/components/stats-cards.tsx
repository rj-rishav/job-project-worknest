import { CheckCircle2, ListTodo, Users, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  metrics: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    overdueTasks: number
    memberCount: number
    completionRate: number
  }
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: metrics.totalTasks,
      icon: ListTodo,
      description: `${metrics.completionRate}% completion rate`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: metrics.completedTasks,
      icon: CheckCircle2,
      description: "Tasks finished",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Members",
      value: metrics.memberCount,
      icon: Users,
      description: "Team members",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Overdue",
      value: metrics.overdueTasks,
      icon: AlertCircle,
      description: "Need attention",
      color: metrics.overdueTasks > 0 ? "text-red-600" : "text-gray-600",
      bgColor: metrics.overdueTasks > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
