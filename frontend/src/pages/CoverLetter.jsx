import { useState, useRef, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { useCoverLetter } from '../hooks/useCoverLetter'
import {
  Upload, FileText, X, Sparkles, AlertCircle, Copy,
  Download, RotateCcw, CheckCheck, Pencil, Save, Square,
} from 'lucide-react'

// ─── File Upload Zone ────────────────────────────────────
function UploadZone({ file, onFile, onRemove }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { alert('Please upload a PDF file.'); return }
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
        className={`
          border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${dragging ? 'border-primary bg-primary/5' : file ? 'border-primary/40 bg-primary/5 cursor-default' : 'border-border hover:border-primary/50 hover:bg-muted/40'}
        `}
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
            <button onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop resume or <span className="text-primary font-medium underline underline-offset-2">browse</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Streaming cursor blink ───────────────────────────────
function StreamingCursor() {
  return <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
}

// ─── Word count badge ─────────────────────────────────────
function WordCount({ text }) {
  const count = text.trim() ? text.trim().split(/\s+/).length : 0
  const color = count < 300 ? 'text-amber-500' : count <= 550 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
  return (
    <span className={`text-xs font-medium ${color}`}>
      {count} words {count < 350 ? '(too short)' : count > 500 ? '(too long)' : '(good length)'}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────
export default function CoverLetter({ activePage = 'cover-letter', onNavigate }) {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  const { text, streaming, done, error, generate, cancel, reset, updateText } = useCoverLetter()

  const handleGenerate = () => {
    if (!file || !jobDesc.trim()) return
    setEditMode(false)
    generate(file, jobDesc)
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setJobDesc('')
    setEditMode(false)
  }

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as .txt
  const handleDownloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cover_letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download as .doc (rich text — opens in Word)
  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Cover Letter</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 2.5cm; }
        p { margin-bottom: 12pt; }
      </style></head>
      <body>
        ${text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
      </body></html>`
    const blob = new Blob([htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cover_letter.doc'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Save (show confirmation toast — in a real app this would persist to DB)
  const handleSave = () => {
    localStorage.setItem('resume_genie_cover_letter', text)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  const canGenerate = file && jobDesc.trim().length > 20 && !streaming
  const showOutput = streaming || done || text.length > 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Cover Letter Generator" badge="AI Powered" />
        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Input Card ─────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Generate Cover Letter</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload your resume and paste the job description. The AI will tailor a professional cover letter.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Upload */}
              <UploadZone
                file={file}
                onFile={setFile}
                onRemove={() => setFile(null)}
              />

              {/* Job Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Job Description
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here — title, responsibilities, required skills..."
                  rows={7}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {jobDesc.length}/3000 characters
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${canGenerate
                    ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              >
                <Sparkles className="w-4 h-4" />
                {streaming ? 'Generating...' : 'Generate Cover Letter'}
              </button>

              {streaming && (
                <button
                  onClick={cancel}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  Stop
                </button>
              )}

              {(done || text) && !streaming && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start over
                </button>
              )}
            </div>

            {streaming && (
              <p className="text-xs text-muted-foreground">
                AI is writing your cover letter — words will appear as they are generated...
              </p>
            )}
          </div>

          {/* ── Output Card ────────────────────────────── */}
          {showOutput && (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Cover Letter</span>
                  {done && <WordCount text={text} />}
                  {streaming && (
                    <span className="text-xs text-primary font-medium animate-pulse">
                      Writing...
                    </span>
                  )}
                </div>

                {/* Action buttons — only show when done */}
                {done && (
                  <div className="flex items-center gap-2">
                    {savedMsg && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Saved!
                      </span>
                    )}
                    <button
                      onClick={() => setEditMode(!editMode)}
                      title={editMode ? 'View mode' : 'Edit mode'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                        ${editMode
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    >
                      <Pencil className="w-3 h-3" />
                      {editMode ? 'Editing' : 'Edit'}
                    </button>
                    <button
                      onClick={handleSave}
                      title="Save to browser"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleCopy}
                      title="Copy to clipboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {copied ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    {/* Download dropdown */}
                    <div className="relative group">
                      <button
                        title="Download"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-xl shadow-lg z-20 hidden group-hover:block">
                        <button
                          onClick={handleDownloadTxt}
                          className="w-full text-left px-3.5 py-2.5 text-sm text-foreground hover:bg-muted rounded-t-xl transition-colors"
                        >
                          Download .txt
                        </button>
                        <button
                          onClick={handleDownloadDoc}
                          className="w-full text-left px-3.5 py-2.5 text-sm text-foreground hover:bg-muted rounded-b-xl transition-colors"
                        >
                          Download .doc
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content — view or edit */}
              <div className="p-6">
                {editMode && done ? (
                  <textarea
                    value={text}
                    onChange={(e) => updateText(e.target.value)}
                    className="w-full min-h-[500px] bg-transparent text-sm text-foreground leading-relaxed resize-none focus:outline-none font-serif"
                    style={{ fontFamily: 'var(--font-serif)' }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[120px]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {text}
                    {streaming && <StreamingCursor />}
                  </div>
                )}
              </div>

              {/* Edit mode hint */}
              {editMode && (
                <div className="px-6 pb-4">
                  <p className="text-xs text-muted-foreground">
                    You are editing the cover letter directly. Changes are reflected immediately.
                    Click <strong>Save</strong> to store locally or <strong>Download</strong> to export.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
