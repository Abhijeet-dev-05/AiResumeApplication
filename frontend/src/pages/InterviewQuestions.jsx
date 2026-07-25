import { useState, useRef, useCallback, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { useInterviewQuestions } from '../hooks/useInterviewQuestions'
import { FullPageSkeleton } from '../components/ui/Skeleton'
import {
  Upload, FileText, X, Sparkles, AlertCircle, RotateCcw,
  ChevronDown, ChevronUp, Clock, Target, Zap,
  CheckCircle2, AlertTriangle, TrendingUp, Brain,
  Copy, CheckCheck, Search, BookOpen, Award,
} from 'lucide-react'

const DIFF = {
  Easy:   { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  Medium: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  Hard:   { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  Expert: { cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

const CAT_COLORS = {
  blue:   { border: 'border-blue-200 dark:border-blue-800',   bg: 'bg-blue-50 dark:bg-blue-900/10',   title: 'text-blue-700 dark:text-blue-300',     badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  green:  { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/10', title: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  orange: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/10', title: 'text-amber-700 dark:text-amber-300',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  red:    { border: 'border-red-200 dark:border-red-800',     bg: 'bg-red-50 dark:bg-red-900/10',     title: 'text-red-700 dark:text-red-300',       badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  purple: { border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-900/10', title: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  pink:   { border: 'border-pink-200 dark:border-pink-800',   bg: 'bg-pink-50 dark:bg-pink-900/10',   title: 'text-pink-700 dark:text-pink-300',     badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  yellow: { border: 'border-yellow-200 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-900/10', title: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
}

function UploadZone({ file, onFile, onRemove, disabled }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const handleFile = useCallback((f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { alert('PDF only'); return }
    onFile(f)
  }, [onFile])
  return (
    <div onClick={() => !file && !disabled && inputRef.current?.click()}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' :
          dragging ? 'border-primary bg-primary/5 scale-[1.01]' :
          file ? 'border-primary/40 bg-primary/5 cursor-default' :
          'border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer'}`}>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} disabled={disabled} />
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size/1024).toFixed(1)} KB</p>
            </div>
          </div>
          {!disabled && (
            <button onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Drop resume here</p>
          <p className="text-xs text-muted-foreground">or <span className="text-primary underline underline-offset-2">browse</span> · PDF only</p>
        </div>
      )}
    </div>
  )
}

function ScoreGauge({ label, score, color = 'primary' }) {
  const colorMap = { primary: 'bg-primary', emerald: 'bg-emerald-500', amber: 'bg-amber-500', blue: 'bg-blue-500', purple: 'bg-purple-500' }
  const textMap  = { primary: 'text-primary', emerald: 'text-emerald-600 dark:text-emerald-400', amber: 'text-amber-600 dark:text-amber-400', blue: 'text-blue-600 dark:text-blue-400', purple: 'text-purple-600 dark:text-purple-400' }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className={`font-bold ${textMap[color]}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colorMap[color]}`}
          style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ReportCard({ report }) {
  if (!report) return null
  const overall = report.readiness_score || 0
  const badge = overall >= 75 ? { label: 'Interview Ready', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
    : overall >= 50 ? { label: 'Needs Preparation', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
    : { label: 'More Work Needed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Interview Readiness Report</h2>
            <p className="text-xs text-muted-foreground">AI-powered assessment</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Big score */}
      <div className="flex items-center gap-6 p-4 bg-muted/40 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-black text-primary">{overall}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Overall</div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          <ScoreGauge label="Technical" score={report.technical_score||0} color="blue" />
          <ScoreGauge label="Projects" score={report.project_score||0} color="emerald" />
          <ScoreGauge label="System Design" score={report.system_design_score||0} color="purple" />
          <ScoreGauge label="Problem Solving" score={report.problem_solving_score||0} color="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {report.strong_areas?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Strong Areas</p>
            <ul className="space-y-1.5">
              {report.strong_areas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.weak_areas?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weak Areas</p>
            <ul className="space-y-1.5">
              {report.weak_areas.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />{w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {report.high_priority_topics?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">High Priority Topics to Revise</p>
          <div className="flex flex-wrap gap-2">
            {report.high_priority_topics.map((t, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
      )}

      {(report.probability_technical_round || report.probability_hr_round) && (
        <div className="grid grid-cols-2 gap-3">
          {report.probability_technical_round && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{report.probability_technical_round}</p>
              <p className="text-xs text-muted-foreground mt-1">Technical Round</p>
            </div>
          )}
          {report.probability_hr_round && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{report.probability_hr_round}</p>
              <p className="text-xs text-muted-foreground mt-1">HR Round</p>
            </div>
          )}
        </div>
      )}

      {report.final_advice && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Interviewer's Final Advice</p>
          <p className="text-sm text-foreground leading-relaxed">{report.final_advice}</p>
        </div>
      )}
    </div>
  )
}

function QuestionCard({ q, idx }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const diff = DIFF[q.difficulty] || DIFF.Medium

  const handleCopy = async (e) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(q.question)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all bg-card ${open ? 'border-primary/30 shadow-md' : 'border-border hover:border-primary/20 hover:shadow-sm'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${diff.cls}`}>{q.difficulty}</span>
            {q.estimated_time && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />{q.estimated_time}
              </span>
            )}
            {q.skill_tested && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[150px]">{q.skill_tested}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {q.why_asked && (
            <div className="flex items-start gap-2.5">
              <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why Asked</p>
                <p className="text-sm text-foreground">{q.why_asked}</p>
              </div>
            </div>
          )}
          {q.expected_answer && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">Expected Answer</p>
              <p className="text-sm text-foreground leading-relaxed">{q.expected_answer}</p>
            </div>
          )}
          {q.follow_ups?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Follow-up Questions</p>
              <ul className="space-y-1.5">
                {q.follow_ups.map((fu, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />{fu}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {q.red_flags?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5">Red Flags</p>
              <ul className="space-y-1">
                {q.red_flags.map((rf, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />{rf}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryPanel({ cat, searchTerm, diffFilter }) {
  const [collapsed, setCollapsed] = useState(false)
  const cc = CAT_COLORS[cat.color] || CAT_COLORS.blue

  const filtered = (cat.questions || []).filter(q => {
    const matchSearch = !searchTerm || q.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDiff   = !diffFilter || q.difficulty === diffFilter
    return matchSearch && matchDiff
  })

  if (filtered.length === 0) return null

  return (
    <div className={`border rounded-2xl overflow-hidden ${cc.border}`}>
      <button onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center justify-between px-6 py-4 ${cc.bg} transition-colors hover:opacity-90`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cat.icon}</span>
          <div className="text-left">
            <p className={`font-bold text-base ${cc.title}`}>{cat.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cc.badge}`}>
            {filtered.length} questions
          </span>
          {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {!collapsed && (
        <div className="p-4 space-y-3 bg-card">
          {filtered.map((q, i) => (
            <QuestionCard key={q.id || i} q={q} idx={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Candidate summary bar ────────────────────────────────
function CandidateSummary({ summary }) {
  if (!summary) return null
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{summary.name || 'Candidate'}</p>
            <p className="text-sm text-muted-foreground">{summary.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{summary.total_questions || 0}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.readiness_score || 0}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Readiness</p>
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              {summary.interview_difficulty || 'Medium'}
            </span>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Difficulty</p>
          </div>
        </div>
      </div>
      {summary.key_skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {summary.key_skills.map(s => (
            <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function InterviewQuestions({ activePage = 'interview-questions', onNavigate }) {
  const [file,        setFile]       = useState(null)
  const [search,      setSearch]     = useState('')
  const [diffFilter,  setDiffFilter] = useState('')
  const [activeTab,   setActiveTab]  = useState('questions') // 'questions' | 'report'
  const resultsRef = useRef(null)

  const { data, loading, error, generate, reset } = useInterviewQuestions()

  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [data])

  const handleGenerate = () => {
    if (!file || loading) return
    generate(file)
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setSearch('')
    setDiffFilter('')
    setActiveTab('questions')
  }

  const totalQ = data?.categories?.reduce((acc, c) => acc + (c.questions?.length || 0), 0) || 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Interview Prep" badge="AI Question Bank" />
        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Hero banner ──────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">AI Interview Question Generator</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Upload your resume and get a personalized question bank generated by an AI Senior Interviewer.
                  Every question targets your specific skills, projects, and experience.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Resume-Specific Questions','Follow-up Questions','Expected Answers','Red Flags','Readiness Report'].map(t => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Upload card ──────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Upload Your Resume</h3>
            <UploadZone file={file} onFile={setFile} onRemove={() => setFile(null)} disabled={loading} />
            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={handleGenerate} disabled={!file || loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${!file || loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'}`}>
                <Sparkles className="w-4 h-4" />
                {loading ? 'Generating questions...' : 'Generate Interview Questions'}
              </button>
              {data && !loading && (
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Start over
                </button>
              )}
            </div>
            {loading && <p className="text-xs text-muted-foreground">AI is analyzing your resume and generating targeted questions — takes 30–60 seconds...</p>}
          </div>

          {/* ── Loading ──────────────────────────────── */}
          {loading && <FullPageSkeleton />}

          {/* ── Results ──────────────────────────────── */}
          {data && !loading && (
            <div ref={resultsRef} className="space-y-6">

              {/* Candidate summary */}
              <CandidateSummary summary={data.candidate_summary} />

              {/* Tab switcher */}
              <div className="flex gap-2 bg-muted rounded-xl p-1 w-fit">
                {[
                  { id: 'questions', label: `Questions (${totalQ})`, icon: BookOpen },
                  { id: 'report',    label: 'Readiness Report',       icon: TrendingUp },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {/* Questions tab */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">All Difficulties</option>
                      {['Easy','Medium','Hard','Expert'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Category panels */}
                  <div className="space-y-4">
                    {data.categories?.map((cat, i) => (
                      <CategoryPanel key={cat.id || i} cat={cat} searchTerm={search} diffFilter={diffFilter} />
                    ))}
                  </div>
                </div>
              )}

              {/* Report tab */}
              {activeTab === 'report' && <ReportCard report={data.report} />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
