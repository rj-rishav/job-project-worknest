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
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
      borderColor: "border-indigo-200/60 dark:border-indigo-800/40",
      gradient:
        "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)",
    },
    {
      title: "Completed",
      value: metrics.completedTasks,
      icon: CheckCircle2,
      description: "Tasks finished",
      trend: "positive",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
      gradient:
        "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)",
    },
    {
      title: "Active Members",
      value: metrics.memberCount,
      icon: Users,
      description: "Team members",
      trend: "neutral",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-50 dark:bg-violet-950/30",
      borderColor: "border-violet-200/60 dark:border-violet-800/40",
      gradient:
        "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)",
    },
    {
      title: "Overdue",
      value: metrics.overdueTasks,
      icon: AlertCircle,
      description: metrics.overdueTasks > 0 ? "Need attention" : "All on track",
      trend: metrics.overdueTasks > 0 ? "negative" : "positive",
      iconColor:
        metrics.overdueTasks > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-slate-600 dark:text-slate-400",
      iconBg:
        metrics.overdueTasks > 0
          ? "bg-rose-50 dark:bg-rose-950/30"
          : "bg-slate-50 dark:bg-slate-950/30",
      borderColor:
        metrics.overdueTasks > 0
          ? "border-rose-200/60 dark:border-rose-800/40"
          : "border-slate-200/60 dark:border-slate-800/40",
      gradient:
        metrics.overdueTasks > 0
          ? "linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(244, 63, 94, 0.02) 100%)"
          : "linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0.02) 100%)",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`group relative overflow-hidden border-2 ${stat.borderColor} transition-all duration-200 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1`}
          style={{ background: stat.gradient }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div
              className={`rounded-xl p-2.5 ${stat.iconBg} ring-1 ring-black/5 transition-all duration-200 ease-out group-hover:scale-110 group-hover:shadow-md dark:ring-white/10`}
            >
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                {stat.value}
              </div>
              {stat.trend === "positive" && (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
