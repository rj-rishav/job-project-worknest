"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { deleteWorkspace } from "../actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2 } from "lucide-react"

interface DeleteWorkspaceDialogProps {
  workspaceId: string
  workspaceName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: DeleteWorkspaceDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const isConfirmationValid = confirmationInput === workspaceName

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast.error("Workspace name does not match")
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteWorkspace(workspaceId, confirmationInput)

      if (!isMountedRef.current) return

      if (result.success) {
        toast.success("Workspace deleted successfully")
        // Redirect is handled by the server action
      } else {
        toast.error(result.error || "Failed to delete workspace")
        setIsDeleting(false)
      }
    } catch (error) {
      if (!isMountedRef.current) return
      toast.error("An unexpected error occurred")
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      setConfirmationInput("")
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Workspace
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the workspace and all
            associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <h4 className="text-sm font-semibold text-destructive mb-2">
              Warning: This will permanently delete:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All tasks and their data</li>
              <li>All team members and their roles</li>
              <li>All activity logs</li>
              <li>All workspace settings</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-mono font-semibold">{workspaceName}</span> to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Enter workspace name"
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmationInput && !isConfirmationValid && (
              <p className="text-sm text-destructive">Workspace name does not match</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
