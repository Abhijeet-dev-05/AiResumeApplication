export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  )
}

export function ScoreRingsSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ rows = 4 }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
      <Skeleton className="h-5 w-48 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
  )
}

export function FullPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ScoreRingsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={5} />
      </div>
      <CardSkeleton rows={6} />
      <CardSkeleton rows={4} />
    </div>
  )
}
