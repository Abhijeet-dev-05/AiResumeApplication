// Animated SVG circular score ring
function ScoreRing({ score, label, size = 96 }) {
  const radius = 36
  const stroke = 7
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const pct = Math.min(100, Math.max(0, score))
  const offset = circumference - (pct / 100) * circumference

  // color based on score
  let trackColor, fillColor, textColor
  if (pct >= 75) {
    trackColor = '#d1fae5'
    fillColor = '#10b981'
    textColor = 'text-emerald-600 dark:text-emerald-400'
  } else if (pct >= 50) {
    trackColor = 'oklch(0.9869 0.0214 95.2774)'
    fillColor = 'oklch(0.7686 0.1647 70.0804)'
    textColor = 'text-amber-600 dark:text-amber-400'
  } else {
    trackColor = '#fee2e2'
    fillColor = 'oklch(0.6368 0.2078 25.3313)'
    textColor = 'text-red-500 dark:text-red-400'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
            className="transition-colors duration-300"
          />
          {/* Progress */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold leading-none ${textColor}`}>{score}</span>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center leading-tight max-w-[88px]">
        {label}
      </span>
    </div>
  )
}

export default function ScoreRings({ data }) {
  const rings = [
    { score: data.overall_score,    label: 'Overall Score' },
    { score: data.ats_score,        label: 'ATS Score' },
    { score: data.technical_score,  label: 'Technical' },
    { score: data.project_score,    label: 'Projects' },
    { score: data.readability_score,label: 'Readability' },
    { score: data.formatting_score, label: 'Formatting' },
  ]

  // Badge color for overall
  const overall = data.overall_score
  let verdictBadge = ''
  let verdictLabel = ''
  if (overall >= 75) { verdictBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'; verdictLabel = 'Strong Resume' }
  else if (overall >= 50) { verdictBadge = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'; verdictLabel = 'Needs Work' }
  else { verdictBadge = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'; verdictLabel = 'Weak Resume' }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground text-base">Score Overview</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${verdictBadge}`}>
          {verdictLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 justify-items-center">
        {rings.map((r) => (
          <ScoreRing key={r.label} score={r.score} label={r.label} />
        ))}
      </div>
    </div>
  )
}
