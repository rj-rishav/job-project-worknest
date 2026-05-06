import { auth } from "./index"
import { redirect } from "next/navigation"

/**
 * Get the current authenticated user session
 * Throws error if not authenticated
 */
export async function getRequiredSession() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  return session
}

/**
 * Get the current authenticated user session
 * Returns null if not authenticated
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user ID
 * Throws error if not authenticated
 */
export async function getRequiredUserId() {
  const session = await getRequiredSession()
  return session.user.id
}
