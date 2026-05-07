"use client"

import { useState } from "react"
import { Role } from "@/lib/types"
import { WorkspaceInfoForm } from "./components/workspace-info-form"
import { DeleteWorkspaceDialog } from "./components/delete-workspace-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface SettingsClientProps {
  workspaceId: string
  workspace: {
    id: string
    name: string
    description: string | null
    slug: string
    createdAt: Date
    updatedAt: Date
  }
  userRole: Role
}

export function SettingsClient({ workspaceId, workspace, userRole }: SettingsClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const canUpdate = userRole === Role.OWNER || userRole === Role.ADMIN
  const canDelete = userRole === Role.OWNER

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace settings and preferences
        </p>
      </div>

      {/* Workspace Information */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Information</CardTitle>
          <CardDescription>Update your workspace name and description</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkspaceInfoForm
            workspaceId={workspaceId}
            workspace={workspace}
            canUpdate={canUpdate}
          />
        </CardContent>
      </Card>

      {/* Workspace Details (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>Additional workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
            <p className="mt-1 text-sm text-foreground font-mono">{workspace.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Workspace Slug</label>
            <p className="mt-1 text-sm text-foreground font-mono">{workspace.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="mt-1 text-sm text-foreground">
              {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="mt-1 text-sm text-foreground">
              {new Date(workspace.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {canDelete && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Delete Workspace</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once you delete a workspace, there is no going back. This will permanently delete
                  all tasks, members, and activity logs associated with this workspace.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteWorkspaceDialog
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
