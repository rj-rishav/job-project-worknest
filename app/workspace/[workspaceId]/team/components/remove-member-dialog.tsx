"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { removeMember } from "../actions"
import type { Membership, User } from "@prisma/client"

type MemberWithUser = Membership & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface RemoveMemberDialogProps {
  workspaceId: string
  member: MemberWithUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RemoveMemberDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)

    try {
      const result = await removeMember(member.id, workspaceId)

      if (result.success) {
        toast.success("Member removed successfully")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to remove member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">
              {member.user.name || member.user.email}
            </span>{" "}
            from this workspace? They will lose access to all workspace resources.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={loading}>
            {loading ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
