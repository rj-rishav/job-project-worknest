"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from "@/lib/validators/workspace"
import { updateWorkspace } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface WorkspaceInfoFormProps {
  workspaceId: string
  workspace: {
    name: string
    description: string | null
  }
  canUpdate: boolean
}

export function WorkspaceInfoForm({ workspaceId, workspace, canUpdate }: WorkspaceInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    },
  })

  const onSubmit = async (data: UpdateWorkspaceInput) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update workspace settings")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateWorkspace(workspaceId, data)

      if (result.success) {
        toast.success("Workspace updated successfully")
      } else {
        toast.error(result.error || "Failed to update workspace")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter workspace name"
          disabled={!canUpdate || isSubmitting}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Enter workspace description (optional)"
          disabled={!canUpdate || isSubmitting}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {canUpdate && (
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      )}

      {!canUpdate && (
        <p className="text-sm text-muted-foreground">
          You need Admin or Owner permissions to update workspace settings
        </p>
      )}
    </form>
  )
}
