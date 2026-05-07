import { Suspense } from "react"
import { Metadata } from "next"
import { getWorkspaceSettings } from "./actions"
import { getWorkspaceMembership } from "@/lib/auth/workspace"
import { SettingsClient } from "./settings-client"
import { SettingsLoading } from "./settings-loading"
import { Role } from "@prisma/client"

export const metadata: Metadata = {
  title: "Settings | WorkNest",
  description: "Manage your workspace settings and preferences",
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params

  const [settingsResult, membership] = await Promise.all([
    getWorkspaceSettings(workspaceId),
    getWorkspaceMembership(workspaceId),
  ])

  if (!settingsResult.success) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error loading settings</h3>
          <p className="text-sm text-muted-foreground">{settingsResult.error}</p>
        </div>
      </div>
    )
  }

  const userRole = membership?.role || Role.VIEWER

  return (
    <Suspense fallback={<SettingsLoading />}>
      <div className="page-enter">
        <SettingsClient
          workspaceId={workspaceId}
          workspace={settingsResult.data}
          userRole={userRole}
        />
      </div>
    </Suspense>
  )
}
