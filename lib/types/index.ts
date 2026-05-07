/**
 * Shared types for client and server components
 * These mirror Prisma types but don't import from @prisma/client
 * to avoid bundling Prisma in client components
 */

// Enums
export const Role = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const ActivityAction = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  INVITED: "INVITED",
  REMOVED: "REMOVED",
  ROLE_CHANGED: "ROLE_CHANGED",
  STATUS_CHANGED: "STATUS_CHANGED",
  ASSIGNED: "ASSIGNED",
  UNASSIGNED: "UNASSIGNED",
} as const

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]

export const EntityType = {
  TASK: "TASK",
  MEMBER: "MEMBER",
  WORKSPACE: "WORKSPACE",
} as const

export type EntityType = (typeof EntityType)[keyof typeof EntityType]

// Base types (simplified versions of Prisma types)
export interface User {
  id: string
  email: string
  name: string | null
  image?: string | null // Optional since not all queries include it
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface Membership {
  id: string
  role: Role
  userId: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  workspaceId: string
  assigneeId: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  action: ActivityAction
  entityType: EntityType
  entityId: string | null
  metadata: any
  workspaceId: string
  userId: string
  createdAt: Date
}

// Composite types - flexible to handle different query selections
export type MemberWithUser = Membership & {
  user: User
}

export type TaskWithAssignee = Task & {
  assignee: Omit<User, "image"> | null
}

export type ActivityWithUser = ActivityLog & {
  user: User
}
