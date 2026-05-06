import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { redirect } from "next/navigation"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  await verifyWorkspaceAccess(workspaceId)

  // Redirect to dashboard
  redirect(`/workspace/${workspaceId}/dashboard`)
}
