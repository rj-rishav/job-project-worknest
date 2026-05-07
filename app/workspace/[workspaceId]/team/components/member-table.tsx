"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RemoveMemberDialog } from "./remove-member-dialog"
import { updateMemberRole } from "../actions"
import { Role, type Membership, type User } from "@/lib/types"

type MemberWithUser = Membership & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface MemberTableProps {
  workspaceId: string
  members: MemberWithUser[]
}

const roleConfig = {
  [Role.OWNER]: { label: "Owner", className: "bg-purple-100 text-purple-800" },
  [Role.ADMIN]: { label: "Admin", className: "bg-blue-100 text-blue-800" },
  [Role.MEMBER]: { label: "Member", className: "bg-green-100 text-green-800" },
  [Role.VIEWER]: { label: "Viewer", className: "bg-gray-100 text-gray-800" },
}

export function MemberTable({ workspaceId, members }: MemberTableProps) {
  const router = useRouter()
  const [removeMember, setRemoveMember] = useState<MemberWithUser | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const handleRoleChange = async (membershipId: string, newRole: string) => {
    setUpdatingRole(membershipId)

    try {
      const result = await updateMemberRole(membershipId, workspaceId, { role: newRole })

      if (result.success) {
        toast.success("Role updated successfully")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to update role")
    } finally {
      setUpdatingRole(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10 shadow-lg">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">No members found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Invite your first team member to start collaborating on tasks and projects
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border-2 border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead className="w-[35%] font-semibold">Member</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.id}
                className="group hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground ring-2 ring-primary/20 shadow-sm">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {member.user.name || "Unnamed User"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {member.user.email}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                    disabled={updatingRole === member.id}
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue>
                        <Badge
                          variant="secondary"
                          // className={`${roleConfig[member.role].className} font-semibold border`}
                        >
                          {roleConfig[member.role].label}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.OWNER}>Owner</SelectItem>
                      <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      <SelectItem value={Role.MEMBER}>Member</SelectItem>
                      <SelectItem value={Role.VIEWER}>Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setRemoveMember(member)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {removeMember && (
        <RemoveMemberDialog
          workspaceId={workspaceId}
          member={removeMember}
          open={!!removeMember}
          onOpenChange={(open) => !open && setRemoveMember(null)}
        />
      )}
    </>
  )
}
