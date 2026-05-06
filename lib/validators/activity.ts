import { z } from "zod"
import { ActivityAction, EntityType } from "@prisma/client"

export const activityFilterSchema = z.object({
  action: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return Object.values(ActivityAction).includes(val as ActivityAction)
        ? (val as ActivityAction)
        : undefined
    }),
  userId: z.string().optional(),
  entityType: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return Object.values(EntityType).includes(val as EntityType) ? (val as EntityType) : undefined
    }),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
})

export type ActivityFilterInput = z.infer<typeof activityFilterSchema>
