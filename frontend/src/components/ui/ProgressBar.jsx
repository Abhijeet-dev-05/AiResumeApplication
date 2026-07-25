function getColor(score) {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-primary'
  return 'bg-destructive'
}

export default function ProgressBar({ score, max = 100, showLabel = true, className = '' }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100))
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
          {score}
        </span>
      )}
    </div>
  )
}
