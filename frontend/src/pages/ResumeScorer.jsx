import { useState, useRef, useCallback, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { useResumeScorer } from '../hooks/useResumeScorer'
import { FullPageSkeleton } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import {
  Upload, FileText, X, Sparkles, AlertCircle,
  RotateCcw, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Building2, Layers,
  TrendingUp, Lightbulb, Wrench,
} from 'lucide-react'

// ─── helpers ─────────────────────────────────────────────
function scoreColor(v) {
  if (v >= 75) return '#10b981'
  if (v >= 50) return 'oklch(0.7686 0.1647 70.0804)'
  return 'oklch(0.6368 0.2078 25.3313)'
}
function scoreBadgeVariant(v) {
  if (v >= 75) return 'success'
  if (v >= 50) return 'warning'
  return 'destructive'
}
function recommendationConfig(r) {
  if (!r) return { label: r, variant: 'muted', icon: AlertTriangle }
  const l = r.toLowerCase()
  if (l.includes('strongly')) return { label: r, variant: 'success', icon: CheckCircle2 }
  if (l.includes('not')) return { label: r, variant: 'destructive', icon: XCircle }
  if (l.includes('weak') || l.includes('average')) return { label: r, variant: 'warning', icon: AlertTriangle }
  return { label: r, variant: 'primary', icon: CheckCircle2 }
}

// ─── Upload Zone (reused pattern) ────────────────────────
function UploadZone({ file, onFile, onRemove }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const handleFile = useCallback((f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { alert('PDF only'); return }
    onFile(f)
  }, [onFile])
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">Resume (PDF)</p>
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${dragging ? 'border-primary bg-primary/5' : file ? 'border-primary/40 bg-primary/5 cursor-default' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop resume or <span className="text-primary font-medium underline underline-offset-2">browse</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Score Donut (single metric) ─────────────────────────
function ScoreDonut({ score, label, size = 110 }) {
  const color = scoreColor(score)
  const data = [{ value: score }, { value: 100 - score }]
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="62%" outerRadius="80%"
              startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="var(--muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground leading-none">{score}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center max-w-[90px] leading-tight">{label}</span>
    </div>
  )
}

// ─── Score Overview (donuts + radar) ─────────────────────
function ScoreOverview({ data }) {
  const donuts = [
    { score: data.overall_match_score,   label: 'Overall Match' },
    { score: data.ats_score,             label: 'ATS Score' },
    { score: data.technical_match_score, label: 'Technical Match' },
    { score: data.project_match_score,   label: 'Project Relevance' },
    { score: data.experience_match_score,label: 'Experience Match' },
    { score: data.education_match_score, label: 'Education Match' },
  ]
  const radarData = [
    { subject: 'ATS',         score: data.ats_score },
    { subject: 'Technical',   score: data.technical_match_score },
    { subject: 'Projects',    score: data.project_match_score },
    { subject: 'Experience',  score: data.experience_match_score },
    { subject: 'Education',   score: data.education_match_score },
    { subject: 'Readability', score: data.readability_score },
    { subject: 'Grammar',     score: data.grammar_score },
    { subject: 'Formatting',  score: data.formatting_score },
  ]
  const overall = data.overall_match_score
  const badge = overall >= 75 ? { label: 'Strong Match', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
    : overall >= 50 ? { label: 'Moderate Match', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
    : { label: 'Weak Match', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-base">Score Overview</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 justify-items-center">
        {donuts.map(d => <ScoreDonut key={d.label} score={d.score} label={d.label} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-border">
        {/* Radar chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skill Radar</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Radar name="Score" dataKey="score" stroke="oklch(0.7686 0.1647 70.0804)"
                  fill="oklch(0.7686 0.1647 70.0804)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Readability / Grammar / Formatting bar */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality Scores</p>
          {[
            { label: 'Readability', score: data.readability_score },
            { label: 'Grammar',     score: data.grammar_score },
            { label: 'Formatting',  score: data.formatting_score },
          ].map(({ label, score }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">{label}</span>
                <span className="text-muted-foreground font-mono text-xs">{score}/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Keyword Analysis (pie chart) ────────────────────────
function KeywordAnalysis({ matching, missing }) {
  const matchCount = matching?.length || 0
  const missCount  = missing?.length  || 0
  const pieData = [
    { name: 'Matched',  value: matchCount, color: '#10b981' },
    { name: 'Missing',  value: missCount,  color: 'oklch(0.6368 0.2078 25.3313)' },
  ]
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-5">Keyword Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="flex flex-col items-center">
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} keywords`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{matchCount}</p>
              <p className="text-xs text-muted-foreground">Matched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{missCount}</p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </div>
          </div>
        </div>
        {/* Lists */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Matching Keywords</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {matching?.map(k => <Badge key={k} variant="success">{k}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Missing Keywords</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {missing?.map(k => <Badge key={k} variant="destructive">{k}</Badge>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skill Gap (pie chart) ────────────────────────────────
function SkillGap({ present, missing, gap }) {
  const presCount = present?.length || 0
  const missCount = missing?.length || 0
  const pieData = [
    { name: 'Present', value: presCount, color: '#10b981' },
    { name: 'Missing', value: missCount, color: 'oklch(0.6368 0.2078 25.3313)' },
  ]
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-5">Skill Gap Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div style={{ height: 190, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                  dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} skills`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills Present</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {present?.map(s => <Badge key={s} variant="success">{s}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills Missing</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {missing?.map(s => <Badge key={s} variant="destructive">{s}</Badge>)}
            </div>
          </div>
        </div>
      </div>
      {gap && gap.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gap Analysis</p>
          <ul className="space-y-1.5">
            {gap.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Strengths & Weaknesses ───────────────────────────────
function StrengthsWeaknesses({ strengths, weaknesses }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold text-foreground text-sm">Strengths</h3>
        </div>
        <ul className="space-y-2">
          {strengths?.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{s}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-foreground text-sm">Weaknesses</h3>
        </div>
        <ul className="space-y-2">
          {weaknesses?.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />{w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Project Feedback ─────────────────────────────────────
function ScorerProjectFeedback({ projects }) {
  const [open, setOpen] = useState(null)
  if (!projects?.length) return null
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-4">
        Project Evaluation
        <span className="ml-2 text-xs font-normal text-muted-foreground">({projects.length} reviewed)</span>
      </h2>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{p.project_name || 'Project'}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.relevance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge variant={p.technical_complexity?.toLowerCase().includes('high') ? 'success' : 'muted'}>
                  {p.technical_complexity?.split('–')[0]?.trim() || 'N/A'}
                </Badge>
                {open === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {open === i && (
              <div className="px-5 pb-5 pt-4 border-t border-border space-y-3">
                {p.business_value && (
                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Business Value</p>
                      <p className="text-sm text-foreground">{p.business_value}</p></div>
                  </div>
                )}
                {p.feedback && (
                  <div className="bg-muted/60 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Feedback</p>
                    <p className="text-sm text-foreground leading-relaxed">{p.feedback}</p>
                  </div>
                )}
                {p.improvements && (
                  <div className="flex items-start gap-2.5">
                    <Wrench className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Improvements</p>
                      <p className="text-sm text-foreground">{p.improvements}</p></div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ATS Feedback ─────────────────────────────────────────
function AtsFeedback({ atsFeedback }) {
  const [openPanel, setOpenPanel] = useState(null)
  if (!atsFeedback) return null
  const panels = [
    { key: 'issues',           label: 'ATS Issues',       icon: XCircle,       iconClass: 'text-destructive' },
    { key: 'formatting_issues',label: 'Formatting Issues', icon: AlertTriangle, iconClass: 'text-amber-500' },
    { key: 'grammar_issues',   label: 'Grammar Issues',   icon: AlertTriangle, iconClass: 'text-amber-500' },
    { key: 'missing_sections', label: 'Missing Sections', icon: AlertCircle,   iconClass: 'text-primary' },
  ]
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-4">ATS Review</h2>
      <div className="space-y-2">
        {panels.map(({ key, label, icon: Icon, iconClass }) => {
          const items = atsFeedback[key]
          if (!items?.length) return null
          const isOpen = openPanel === key
          return (
            <div key={key} className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => setOpenPanel(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${iconClass}`} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">{items.length}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isOpen && (
                <ul className="px-4 py-3 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Industry Feedback ────────────────────────────────────
function IndustryFeedback({ feedback }) {
  if (!feedback) return null
  const cards = [
    { key: 'startup',         label: 'Startup',         icon: '🚀' },
    { key: 'product_company', label: 'Product Company', icon: '📦' },
    { key: 'service_company', label: 'Service Company', icon: '🏢' },
    { key: 'faang',           label: 'FAANG',           icon: '🌐' },
  ]
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Building2 className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground text-base">Industry Specific Feedback</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ key, label, icon }) => (
          feedback[key] ? (
            <div key={key} className="bg-muted/40 border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                <span className="mr-1.5">{icon}</span>{label}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{feedback[key]}</p>
            </div>
          ) : null
        ))}
      </div>
    </div>
  )
}

// ─── Improvement Suggestions ──────────────────────────────
function ImprovementSuggestions({ suggestions }) {
  if (!suggestions?.length) return null
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground text-base">Improvement Suggestions</h2>
      </div>
      <ul className="space-y-2">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{s}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Final Recommendation Card ────────────────────────────
function FinalRecommendation({ recommendation, summary }) {
  const cfg = recommendationConfig(recommendation)
  const Icon = cfg.icon
  const variantStyles = {
    success:     'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning:     'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    primary:     'bg-primary/5 border-primary/20',
    muted:       'bg-muted border-border',
  }
  const iconStyles = {
    success: 'bg-emerald-500', destructive: 'bg-destructive',
    warning: 'bg-amber-500',  primary: 'bg-primary', muted: 'bg-muted-foreground',
  }
  const titleStyles = {
    success: 'text-emerald-700 dark:text-emerald-300',
    destructive: 'text-red-700 dark:text-red-300',
    warning: 'text-amber-700 dark:text-amber-300',
    primary: 'text-primary', muted: 'text-foreground',
  }
  const v = cfg.variant
  return (
    <div className={`rounded-2xl border-2 p-6 shadow-sm ${variantStyles[v]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[v]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Recommendation</p>
          <p className={`text-xl font-bold ${titleStyles[v]}`}>{recommendation}</p>
        </div>
      </div>
      {summary && (
        <div className="bg-card/80 border border-border rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Summary</p>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function ResumeScorer({ activePage = 'resume-scorer', onNavigate }) {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const { data, loading, error, score, reset } = useResumeScorer()
  const resultsRef = useRef(null)

  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [data])

  const handleScore = () => {
    if (!file || !jobDesc.trim()) return
    score(file, jobDesc)
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setJobDesc('')
  }

  const canScore = file && jobDesc.trim().length > 20 && !loading

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Resume Scorer" badge="JD Match" />
        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Input Card ──────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Score Your Resume</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload your resume and paste the job description. Get a detailed ATS match score with charts.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <UploadZone file={file} onFile={setFile} onRemove={() => setFile(null)} />
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Job Description</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description — title, responsibilities, required skills..."
                  rows={7}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
                <p className="text-xs text-muted-foreground mt-1">{jobDesc.length}/3000 characters</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleScore} disabled={!canScore}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${canScore ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                <Sparkles className="w-4 h-4" />
                {loading ? 'Scoring...' : 'Score Resume'}
              </button>
              {data && !loading && (
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Start over
                </button>
              )}
            </div>
            {loading && <p className="text-xs text-muted-foreground">Analyzing resume against job description — takes 20–40 seconds...</p>}
          </div>

          {/* ── Loading ──────────────────────────────── */}
          {loading && <FullPageSkeleton />}

          {/* ── Results ──────────────────────────────── */}
          {data && !loading && (
            <div ref={resultsRef} className="space-y-6">
              <ScoreOverview data={data} />
              <KeywordAnalysis matching={data.matching_keywords} missing={data.missing_keywords} />
              <SkillGap present={data.skills_present} missing={data.missing_skills} gap={data.skill_gap_analysis} />
              <StrengthsWeaknesses strengths={data.strengths} weaknesses={data.weaknesses} />
              <ScorerProjectFeedback projects={data.project_feedback} />
              <AtsFeedback atsFeedback={data.ats_feedback} />
              <IndustryFeedback feedback={data.industry_feedback} />
              <ImprovementSuggestions suggestions={data.improvement_suggestions} />
              <FinalRecommendation recommendation={data.final_recommendation} summary={data.summary} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
