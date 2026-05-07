import { verifyWorkspaceAccess } from "@/lib/auth/workspace"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
    <div className="flex min-h-screen flex-col bg-background">
      <Sidebar workspaceId={workspaceId} />
      <Header
        workspaceName={membership.workspace.name}
        userName={membership.user.name || "User"}
        userEmail={membership.user.email}
      />
      <main className="ml-64 flex-1 pt-16">
        <div className="p-6">{children}</div>
      </main>
      <div className="ml-64">
        <Footer />
      </div>
      <Toaster />
    </div>
  )
}
