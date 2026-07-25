import { useState } from 'react'
import { ChevronDown, ChevronUp, Layers, TrendingUp, Lightbulb, Wrench } from 'lucide-react'
import Badge from '../ui/Badge'

function complexityVariant(val) {
  if (!val) return 'muted'
  const v = val.toLowerCase()
  if (v.includes('high')) return 'success'
  if (v.includes('medium') || v.includes('moderate')) return 'warning'
  return 'muted'
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {project.project_name || 'Unnamed Project'}
            </p>
            {project.technical_complexity && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {project.technical_complexity}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Badge variant={complexityVariant(project.technical_complexity)}>
            {project.technical_complexity?.split('–')[0]?.trim() || 'N/A'}
          </Badge>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {project.problem_solved && (
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Problem Solved</p>
                <p className="text-sm text-foreground">{project.problem_solved}</p>
              </div>
            </div>
          )}

          {project.business_impact && (
            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Business Impact</p>
                <p className="text-sm text-foreground">{project.business_impact}</p>
              </div>
            </div>
          )}

          {project.feedback && (
            <div className="bg-muted/60 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Feedback</p>
              <p className="text-sm text-foreground leading-relaxed">{project.feedback}</p>
            </div>
          )}

          {project.improvements && (
            <div className="flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Improvements</p>
                <p className="text-sm text-foreground leading-relaxed">{project.improvements}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectFeedback({ projects }) {
  if (!projects || projects.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-4">
        Project Feedback
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          ({projects.length} project{projects.length !== 1 ? 's' : ''} reviewed)
        </span>
      </h2>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <ProjectCard key={i} project={p} />
        ))}
      </div>
    </div>
  )
}
