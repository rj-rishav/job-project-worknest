export function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>

      {/* Workspace Info Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-4">
          <div>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-24 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="rounded-lg border border-destructive bg-card p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-4 h-10 w-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
