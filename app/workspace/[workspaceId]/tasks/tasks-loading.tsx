export function TasksLoading() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-muted relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          <div className="h-4 w-64 animate-pulse rounded bg-muted relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="h-10 w-40 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-10 flex-1 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
