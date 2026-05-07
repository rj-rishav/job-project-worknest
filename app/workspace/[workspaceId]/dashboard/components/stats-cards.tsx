import { CheckCircle2, ListTodo, Users, AlertCircle, TrendingUp } from "lucide-react"
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
      trend: metrics.completionRate >= 70 ? "positive" : "neutral",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: "Completed",
      value: metrics.completedTasks,
      icon: CheckCircle2,
      description: "Tasks finished",
      trend: "positive",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-100 dark:border-green-900/50",
    },
    {
      title: "Active Members",
      value: metrics.memberCount,
      icon: Users,
      description: "Team members",
      trend: "neutral",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-100 dark:border-purple-900/50",
    },
    {
      title: "Overdue",
      value: metrics.overdueTasks,
      icon: AlertCircle,
      description: metrics.overdueTasks > 0 ? "Need attention" : "All on track",
      trend: metrics.overdueTasks > 0 ? "negative" : "positive",
      color:
        metrics.overdueTasks > 0
          ? "text-red-600 dark:text-red-400"
          : "text-gray-600 dark:text-gray-400",
      bgColor:
        metrics.overdueTasks > 0
          ? "bg-red-50 dark:bg-red-950/30"
          : "bg-gray-50 dark:bg-gray-950/30",
      borderColor:
        metrics.overdueTasks > 0
          ? "border-red-100 dark:border-red-900/50"
          : "border-gray-100 dark:border-gray-900/50",
    },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`group relative overflow-hidden border-2 ${stat.borderColor} transition-all duration-200 ease-out hover:shadow-lg hover:scale-[1.01] hover:-translate-y-1`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {stat.title}
            </CardTitle>
            <div
              className={`rounded-xl p-2.5 ${stat.bgColor} transition-transform duration-200 ease-out group-hover:scale-110`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
              {stat.trend === "positive" && (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.description}</p>
          </CardContent>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
        </Card>
      ))}
    </div>
  )
}
