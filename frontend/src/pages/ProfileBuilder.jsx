import { useState, useRef, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { useProfileBuilder } from '../hooks/useProfileBuilder'
import {
  Upload, FileText, X, Sparkles, AlertCircle,
  Globe, Copy, CheckCheck, ExternalLink, RefreshCw,
  User, Loader2, Eye, EyeOff,
} from 'lucide-react'

// ─── Upload Zone ──────────────────────────────────────────
function UploadZone({ file, onFile, onRemove, disabled }) {
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
        onClick={() => !file && !disabled && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' :
            dragging ? 'border-primary bg-primary/5 scale-[1.01]' :
            file ? 'border-primary/40 bg-primary/5 cursor-default' :
            'border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer'}`}
      >
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
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            {!disabled && (
              <button onClick={(e) => { e.stopPropagation(); onRemove() }}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop your resume here</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or <span className="text-primary underline underline-offset-2">browse files</span> · PDF only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Share Link Card ──────────────────────────────────────
function ShareCard({ shareUrl, profileId }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Portfolio Live!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Share this link with recruiters</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm text-foreground font-mono truncate flex-1">{shareUrl}</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors shrink-0">
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <a href={`/profile/${profileId}`} target="_blank" rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
        <ExternalLink className="w-4 h-4" />
        Open Portfolio
      </a>
    </div>
  )
}

// ─── Existing Profile Card ────────────────────────────────
function ExistingProfileCard({ profile, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(profile.share_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{profile.name || 'My Portfolio'}</p>
            <p className="text-xs text-muted-foreground">{profile.title || 'Portfolio website'}</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full font-medium shrink-0">
          Live
        </span>
      </div>

      <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 mb-3">
        <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground font-mono truncate flex-1">
          {profile.share_url}
        </span>
        <button onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity shrink-0">
          {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-2">
        <a href={`/profile/${profile.profile_id}`} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
          View
        </a>
        <button onClick={onRegenerate}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </button>
      </div>
    </div>
  )
}

// ─── Loading Steps display ────────────────────────────────
const STEPS = [
  'Reading your resume...',
  'Extracting skills and projects...',
  'Designing your portfolio layout...',
  'Writing HTML & CSS...',
  'Adding animations and effects...',
  'Saving your profile...',
]

function LoadingSteps() {
  const [step, setStep] = useState(0)
  useState(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 8000)
    return () => clearInterval(iv)
  })
  return (
    <div className="space-y-3">
      {STEPS.map((s, i) => (
        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all
            ${i < step ? 'bg-emerald-500' : i === step ? 'bg-primary' : 'bg-muted'}`}>
            {i < step ? (
              <CheckCheck className="w-3 h-3 text-white" />
            ) : i === step ? (
              <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            )}
          </div>
          <span className={`text-sm transition-colors ${i === step ? 'text-foreground font-medium' : i < step ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Preview Toggle ───────────────────────────────────────
function PreviewPanel({ profileId }) {
  const [show, setShow] = useState(false)
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Portfolio Preview</span>
        </div>
        <button onClick={() => setShow(s => !s)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {show ? 'Hide' : 'Show Preview'}
        </button>
      </div>
      {show && (
        <div className="relative" style={{ height: '600px' }}>
          <iframe
            src={`/profile/${profileId}`}
            title="Portfolio Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
      {!show && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Click Show Preview to see your portfolio</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function ProfileBuilder({ activePage = 'profile-builder', onNavigate }) {
  const [file,        setFile]       = useState(null)
  const [regenerating,setRegenerating] = useState(false)

  const { profile, result, loading, fetching, error, generate, reset } = useProfileBuilder()

  const activeResult = result || null
  const activeProfile = profile

  const handleGenerate = () => {
    if (!file || loading) return
    generate(file)
  }

  const handleRegenerate = () => {
    setFile(null)
    reset()
    setRegenerating(true)
  }

  const showResult  = activeResult && !loading
  const profileData = showResult ? activeResult : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Profile Builder" badge="Portfolio Generator" />

        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Hero banner ────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
                  <Globe className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">AI Portfolio Generator</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    Upload your resume and get a stunning, professional portfolio website in seconds.
                    Share the live link directly with recruiters — no hosting required.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {['Fully Responsive', 'Live Link', 'Recruiter Ready', 'ATS Friendly', 'Animated UI'].map(tag => (
                      <span key={tag} className="text-xs bg-primary/15 text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Left column — input + existing ─────── */}
            <div className="space-y-5">

              {/* Existing profile */}
              {!fetching && activeProfile && !regenerating && !showResult && (
                <ExistingProfileCard profile={activeProfile} onRegenerate={handleRegenerate} />
              )}

              {/* Generation card */}
              {(!activeProfile || regenerating || showResult) && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {regenerating ? 'Regenerate Portfolio' : 'Generate Portfolio'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload your resume PDF and let AI build your full portfolio website.
                    </p>
                  </div>

                  <UploadZone
                    file={file}
                    onFile={setFile}
                    onRemove={() => setFile(null)}
                    disabled={loading}
                  />

                  {error && (
                    <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <button onClick={handleGenerate} disabled={!file || loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                      ${!file || loading
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'}`}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Building portfolio...</>
                      : <><Sparkles className="w-4 h-4" /> Build My Portfolio</>
                    }
                  </button>

                  {loading && (
                    <div className="bg-muted/40 rounded-xl p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        AI is working...
                      </p>
                      <LoadingSteps />
                      <p className="text-xs text-muted-foreground mt-4">
                        This takes 30–90 seconds. Generating a full portfolio website.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Share card after generation */}
              {showResult && profileData && (
                <ShareCard
                  shareUrl={profileData.share_url}
                  profileId={profileData.profile_id}
                />
              )}

              {/* Regenerate option when viewing fresh result */}
              {showResult && (
                <button onClick={handleRegenerate}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate again with different resume
                </button>
              )}
            </div>

            {/* ── Right column — info + preview ──────── */}
            <div className="space-y-5">

              {/* How it works */}
              {!showResult && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-foreground text-sm mb-4">How it works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Upload Resume', desc: 'Upload your PDF resume. The AI reads everything — skills, projects, experience, education.' },
                      { step: '02', title: 'AI Generates Website', desc: 'A complete, animated HTML portfolio is generated — fully responsive with dark theme and smooth animations.' },
                      { step: '03', title: 'Share the Link', desc: 'Get a permanent live link. Share it with recruiters directly — works on any device without any setup.' },
                    ].map(({ step, title, desc }) => (
                      <div key={step} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{step}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview panel once we have a result */}
              {(showResult && profileData) && (
                <PreviewPanel profileId={profileData.profile_id} />
              )}

              {/* Also show preview of existing profile */}
              {!showResult && !regenerating && activeProfile && !fetching && (
                <PreviewPanel profileId={activeProfile.profile_id} />
              )}

              {/* What's included */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground text-sm mb-4">What's included</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Hero Section', 'About Me', 'Skills Grid', 'Project Cards',
                    'Work Timeline', 'Education', 'Certifications', 'Achievements',
                    'Contact Form', 'Mobile Menu', 'Scroll Animation', 'Dark Theme',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
