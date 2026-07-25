import Badge from '../ui/Badge'
import {
  Compass, BookOpen, Code2, Award, ExternalLink,
  Clock, Briefcase, TrendingUp, DollarSign
} from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  if (!children) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  )
}

function BadgeList({ items, variant = 'accent' }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant={variant}>{item}</Badge>
      ))}
    </div>
  )
}

function BulletList({ items }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">—</p>
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function CareerGuidance({ guidance }) {
  if (!guidance) return null

  const levelVariant =
    guidance.current_level?.toLowerCase().includes('senior') ? 'success' :
    guidance.current_level?.toLowerCase().includes('mid') ? 'warning' : 'primary'

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-foreground text-base">Career Guidance</h2>
          {guidance.recommended_career_path && (
            <p className="text-sm text-primary font-medium mt-1">
              → {guidance.recommended_career_path}
            </p>
          )}
        </div>
        {guidance.current_level && (
          <Badge variant={levelVariant} className="shrink-0 text-xs px-3 py-1">
            {guidance.current_level}
          </Badge>
        )}
      </div>

      {/* Reason */}
      {guidance.reason && (
        <div className="bg-accent/30 border border-accent-foreground/10 rounded-xl px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{guidance.reason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <Section icon={Code2} title="Next Skills to Learn">
            <BadgeList items={guidance.next_skills_to_learn} variant="primary" />
          </Section>

          <Section icon={TrendingUp} title="Technologies to Learn">
            <BadgeList items={guidance.technologies_to_learn} variant="accent" />
          </Section>

          <Section icon={Briefcase} title="Projects to Build">
            <BulletList items={guidance.recommended_projects} />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Section icon={Award} title="Recommended Certifications">
            <BadgeList items={guidance.recommended_certifications} variant="success" />
          </Section>

          <Section icon={BookOpen} title="Learning Resources">
            {guidance.learning_resources && guidance.learning_resources.length > 0 ? (
              <ul className="space-y-1.5">
                {guidance.learning_resources.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-foreground">{r}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </Section>

          <Section icon={Clock} title="Estimated Learning Time">
            {guidance.estimated_learning_time && (
              <p className="text-sm font-medium text-foreground">
                {guidance.estimated_learning_time}
              </p>
            )}
          </Section>
        </div>
      </div>

      {/* Roles row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Entry Level Roles</p>
          <BadgeList items={guidance.entry_level_roles} variant="muted" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mid Level Roles</p>
          <BadgeList items={guidance.mid_level_roles} variant="accent" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Long Term Growth</p>
          <p className="text-sm text-foreground leading-relaxed">
            {guidance.long_term_growth || '—'}
          </p>
        </div>
      </div>

      {/* Salary */}
      {guidance.expected_salary_range && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
          <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-sm">₹</span>
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Expected Salary Range — India (Entry Level)
            </p>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
              {guidance.expected_salary_range}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
