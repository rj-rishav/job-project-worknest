import { z } from "zod"
import { Role } from "@prisma/client"

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role).default(Role.MEMBER),
  workspaceId: z.string().min(1, "Workspace ID is required"),
})

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
})

export const memberFilterSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  search: z.string().optional(),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type MemberFilterInput = z.infer<typeof memberFilterSchema>
