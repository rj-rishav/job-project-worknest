import { Suspense } from "react"
import { Metadata } from "next"
import { getMembers } from "./actions"
import { TeamClient } from "./team-client"
import { TeamLoading } from "./team-loading"

export const metadata: Metadata = {
  title: "Team | WorkNest",
  description: "Manage workspace members and permissions",
}

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { workspaceId } = await params
  const search = await searchParams

  const searchQuery = search.q as string | undefined
  const roleFilter = search.role as string | undefined

  const membersResult = await getMembers(workspaceId, searchQuery, roleFilter as any)

  if (!membersResult.success) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error loading team</h3>
          <p className="text-sm text-muted-foreground">{membersResult.error}</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<TeamLoading />}>
      <TeamClient
        workspaceId={workspaceId}
        initialMembers={membersResult.data}
        initialSearch={searchQuery}
        initialRoleFilter={roleFilter}
      />
    </Suspense>
  )
}
