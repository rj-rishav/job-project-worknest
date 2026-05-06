import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/sonner"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const membership = await verifyWorkspaceAccess(workspaceId)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar workspaceId={workspaceId} />
      <Header
        workspaceName={membership.workspace.name}
        userName={membership.user.name || "User"}
        userEmail={membership.user.email}
      />
      <main className="ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}
