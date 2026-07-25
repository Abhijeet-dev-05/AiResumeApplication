import { CheckCircle2, AlertTriangle, XCircle, Star } from 'lucide-react'

const DECISION_CONFIG = {
  hire: {
    label: 'Hire',
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    titleColor: 'text-emerald-700 dark:text-emerald-300',
  },
  borderline: {
    label: 'Borderline',
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    titleColor: 'text-amber-700 dark:text-amber-300',
  },
  reject: {
    label: 'Reject',
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    badgeBg: 'bg-red-500',
    badgeText: 'text-white',
    titleColor: 'text-red-700 dark:text-red-300',
  },
}

function resolveConfig(decision) {
  if (!decision) return DECISION_CONFIG.borderline
  const d = decision.toLowerCase()
  if (d.includes('hire') && !d.includes('borderline')) return DECISION_CONFIG.hire
  if (d.includes('reject')) return DECISION_CONFIG.reject
  return DECISION_CONFIG.borderline
}

export default function FinalVerdict({ verdict }) {
  if (!verdict) return null
  const cfg = resolveConfig(verdict.hiring_decision)
  const Icon = cfg.icon

  return (
    <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-6 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.badgeBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Final Verdict
            </p>
            <p className={`text-xl font-bold ${cfg.titleColor}`}>
              {cfg.label}
            </p>
          </div>
        </div>

        {/* Confidence */}
        {verdict.confidence && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
            <div className="flex items-center gap-1 justify-end">
              {['High', 'Very High'].some(v =>
                verdict.confidence?.toLowerCase().includes(v.toLowerCase())
              ) ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))
              ) : verdict.confidence?.toLowerCase().includes('medium') ? (
                <>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  <Star className="w-4 h-4 text-muted-foreground" />
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-muted-foreground" />
                  ))}
                </>
              )}
              <span className="text-xs font-medium text-muted-foreground ml-1">
                {verdict.confidence}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Overall impression */}
      {verdict.overall_impression && (
        <div className="bg-card/80 rounded-xl px-4 py-3 mb-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Overall Impression
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {verdict.overall_impression}
          </p>
        </div>
      )}

      {/* Summary / Final Recommendations */}
      {verdict.summary && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Final Recommendations
          </p>
          <p className="text-sm text-foreground leading-relaxed">{verdict.summary}</p>
        </div>
      )}
    </div>
  )
}
