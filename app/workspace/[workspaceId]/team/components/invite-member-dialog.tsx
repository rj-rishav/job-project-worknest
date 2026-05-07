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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Role } from "@/lib/types"
import { inviteMember } from "../actions"

interface InviteMemberDialogProps {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ workspaceId, open, onOpenChange }: InviteMemberDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    email: string
    role: string
  }>({
    email: "",
    role: Role.MEMBER,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await inviteMember({
        ...formData,
        workspaceId,
      })

      if (result.success) {
        toast.success("Member invited successfully")
        onOpenChange(false)
        setFormData({
          email: "",
          role: Role.MEMBER,
        })
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to invite member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>Add a new member to your workspace</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="member@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                They'll receive an invitation to join this workspace
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.VIEWER}>
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">Can view only</div>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.MEMBER}>
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">
                        Can create and edit own tasks
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.ADMIN}>
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        Can manage tasks and members
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.OWNER}>
                    <div>
                      <div className="font-medium">Owner</div>
                      <div className="text-xs text-muted-foreground">
                        Full access including deletion
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Can create and edit own tasks</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
