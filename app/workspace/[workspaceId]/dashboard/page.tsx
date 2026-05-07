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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-base text-muted-foreground">
            Monitor your workspace activity, track progress, and manage your team
          </p>
        </div>

        {/* Insights Section */}
        <DashboardInsights insights={insights} />

        {/* Stats Cards */}
        <StatsCards metrics={dashboardData.metrics} />

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTasks tasks={dashboardData.recentTasks} workspaceId={workspaceId} />
          <ActivityFeed activities={dashboardData.recentActivity} />
        </div>
      </div>
    </Suspense>
  )
}
