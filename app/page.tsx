import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "WorkNest | Multi-tenant Task Management",
  description: "Collaborative task management for modern teams",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-8 py-16 text-center page-enter">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg">
          <svg
            className="h-10 w-10 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">WorkNest</h1>
        <p className="mb-8 max-w-2xl text-xl text-muted-foreground">
          Collaborative task management for modern teams. Organize, track, and deliver projects with
          ease.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/signin"
            className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all duration-150 ease-out hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium transition-all duration-150 ease-out hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3 stagger-children">
          <div className="space-y-2 transition-all duration-200 ease-out hover:-translate-y-1">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-200 ease-out hover:bg-primary/20 hover:scale-110">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Task Management</h3>
            <p className="text-sm text-muted-foreground">
              Create, assign, and track tasks with ease
            </p>
          </div>

          <div className="space-y-2 transition-all duration-200 ease-out hover:-translate-y-1">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-200 ease-out hover:bg-primary/20 hover:scale-110">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Team Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together with role-based permissions
            </p>
          </div>

          <div className="space-y-2 transition-all duration-200 ease-out hover:-translate-y-1">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-200 ease-out hover:bg-primary/20 hover:scale-110">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Activity Tracking</h3>
            <p className="text-sm text-muted-foreground">Monitor all changes with detailed logs</p>
          </div>
        </div>
      </main>
    </div>
  )
}
