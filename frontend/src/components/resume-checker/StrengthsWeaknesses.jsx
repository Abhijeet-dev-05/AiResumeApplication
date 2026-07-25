import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '../ui/Badge'

function CollapsiblePanel({ title, items, icon: Icon, iconClass, emptyText }) {
  const [open, setOpen] = useState(false)
  if (!items || items.length === 0) return null
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconClass}`} />
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function StrengthsWeaknesses({ data }) {
  return (
    <div className="space-y-4">
      {/* Strengths & Weaknesses side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="font-semibold text-foreground text-sm">Strengths</h2>
          </div>
          <ul className="space-y-2">
            {data.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-foreground text-sm">Weaknesses</h2>
          </div>
          <ul className="space-y-2">
            {data.weaknesses?.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Skills & Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.missing_skills?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Missing Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.missing_skills.map((s) => (
                <Badge key={s} variant="destructive">{s}</Badge>
              ))}
            </div>
          </div>
        )}
        {data.missing_keywords?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Missing Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.missing_keywords.map((k) => (
                <Badge key={k} variant="warning">{k}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible issue panels */}
      <div className="space-y-2">
        <CollapsiblePanel
          title="ATS Issues"
          items={data.ats_issues}
          icon={XCircle}
          iconClass="text-destructive"
        />
        <CollapsiblePanel
          title="Grammar Issues"
          items={data.grammar_issues}
          icon={AlertTriangle}
          iconClass="text-amber-500"
        />
        <CollapsiblePanel
          title="Formatting Issues"
          items={data.formatting_issues}
          icon={AlertTriangle}
          iconClass="text-amber-500"
        />
      </div>
    </div>
  )
}
