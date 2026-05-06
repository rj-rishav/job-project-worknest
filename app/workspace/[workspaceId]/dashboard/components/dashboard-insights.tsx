import { AlertTriangle, TrendingUp, Calendar } from "lucide-react"

interface DashboardInsightsProps {
  insights: {
    overdueTasks: number
    mostActiveUser: { name: string | null; email: string } | null
    upcomingDeadlines: number
  }
}

export function DashboardInsights({ insights }: DashboardInsightsProps) {
  const hasInsights =
    insights.overdueTasks > 0 || insights.mostActiveUser || insights.upcomingDeadlines > 0

  if (!hasInsights) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {insights.overdueTasks > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-sm font-medium text-red-900">
            You have {insights.overdueTasks} overdue task{insights.overdueTasks !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {insights.upcomingDeadlines > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-medium text-blue-900">
            {insights.upcomingDeadlines} task{insights.upcomingDeadlines !== 1 ? "s" : ""} due this
            week
          </p>
        </div>
      )}

      {insights.mostActiveUser && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-green-900">
            Most active: {insights.mostActiveUser.name || insights.mostActiveUser.email}
          </p>
        </div>
      )}
    </div>
  )
}
