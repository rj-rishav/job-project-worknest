import { Suspense } from "react"
import { Metadata } from "next"
import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { getDashboardData, getDashboardInsights } from "@/lib/services/dashboard"
import { StatsCards } from "./components/stats-cards"
import { RecentTasks } from "./components/recent-tasks"
import { ActivityFeed } from "./components/activity-feed"
import { DashboardInsights } from "./components/dashboard-insights"
import { DashboardLoading } from "./dashboard-loading"

export const metadata: Metadata = {
  title: "Dashboard | WorkNest",
  description: "Overview of your workspace activity and metrics",
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  await verifyWorkspaceAccess(workspaceId)

  const [dashboardData, insights] = await Promise.all([
    getDashboardData(workspaceId),
    getDashboardInsights(workspaceId),
  ])

  return (
    <Suspense fallback={<DashboardLoading />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your workspace activity and metrics
          </p>
        </div>

        <DashboardInsights insights={insights} />

        <StatsCards metrics={dashboardData.metrics} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTasks tasks={dashboardData.recentTasks} workspaceId={workspaceId} />
          <ActivityFeed activities={dashboardData.recentActivity} />
        </div>
      </div>
    </Suspense>
  )
}
