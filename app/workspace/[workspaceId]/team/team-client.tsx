"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemberTable } from "./components/member-table"
import { TeamFilters } from "./components/team-filters"
import { InviteMemberDialog } from "./components/invite-member-dialog"
import type { Membership, User } from "@prisma/client"

type MemberWithUser = Membership & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface TeamClientProps {
  workspaceId: string
  initialMembers: MemberWithUser[]
  initialSearch?: string
  initialRoleFilter?: string
}

export function TeamClient({
  workspaceId,
  initialMembers,
  initialSearch,
  initialRoleFilter,
}: TeamClientProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">Manage workspace members and permissions</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <TeamFilters
        workspaceId={workspaceId}
        initialSearch={initialSearch}
        initialRoleFilter={initialRoleFilter}
      />

      <MemberTable workspaceId={workspaceId} members={initialMembers} />

      <InviteMemberDialog
        workspaceId={workspaceId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  )
}
