import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { SignInForm } from "@/components/auth/signin-form"

export const metadata: Metadata = {
  title: "Sign In | WorkNest",
  description: "Sign in to your WorkNest workspace",
}

export default async function SignInPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">WorkNest</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your workspace</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
