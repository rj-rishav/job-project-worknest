import { Metadata } from "next"
import { getRequiredSession } from "@/lib/auth/session"
import { getUserWorkspaces } from "@/lib/auth/workspace"
import { redirect } from "next/navigation"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Dashboard | WorkNest",
  description: "Your WorkNest workspaces",
}

export default async function DashboardPage() {
  const session = await getRequiredSession()
  const workspaces = await getUserWorkspaces()

  // If user has workspaces, redirect to the first one
  if (workspaces.length > 0) {
    redirect(`/workspace/${workspaces[0].workspaceId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Welcome, {session.user.name || session.user.email}!
          </h1>
          <p className="mt-2 text-gray-600">You don&apos;t have any workspaces yet.</p>
          <p className="mt-4 text-sm text-gray-500">
            Contact your administrator to be added to a workspace.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
