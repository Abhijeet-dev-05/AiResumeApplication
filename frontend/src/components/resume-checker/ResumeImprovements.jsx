import { Briefcase, ArrowUpCircle } from 'lucide-react'
import Badge from '../ui/Badge'

export default function ResumeImprovements({ improvements, jobRoles }) {
  const hasImprovements = improvements && improvements.length > 0
  const hasRoles = jobRoles && jobRoles.length > 0

  if (!hasImprovements && !hasRoles) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Resume Improvements */}
      {hasImprovements && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Resume Improvements</h2>
          </div>
          <ul className="space-y-2">
            {improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Job Roles */}
      {hasRoles && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Top 5 Job Roles</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {jobRoles.map((role, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-primary">#{i + 1}</span>
                <span className="text-sm text-foreground font-medium">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
