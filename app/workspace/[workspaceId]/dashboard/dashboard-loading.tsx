export function DashboardLoading() {
  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-4 w-96 animate-pulse rounded bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        ))}
      </div>

      {/* Content sections skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-muted relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  )
}
