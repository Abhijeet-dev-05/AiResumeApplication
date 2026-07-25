import { useState, useRef, useCallback, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header  from '../components/layout/Header'
import { initCareerCoach, streamCareerCoachChat } from '../services/api'
import {
  Upload, FileText, X, Send, Brain, Sparkles,
  User, Bot, Loader2, AlertCircle, RotateCcw,
  ChevronDown, Lightbulb, MessageSquare,
} from 'lucide-react'

// ─── Suggested prompts ─────────────────────────────────────
const SUGGESTIONS = [
  { icon: '🎯', text: 'What career path suits me best?' },
  { icon: '🔍', text: 'What are my skill gaps?' },
  { icon: '📈', text: 'How can I improve my resume?' },
  { icon: '💡', text: 'What should I learn next?' },
  { icon: '🏢', text: 'How to crack Google or Amazon?' },
  { icon: '💰', text: 'What salary can I expect?' },
  { icon: '🚀', text: 'Give me a 6-month learning roadmap' },
  { icon: '🎤', text: 'Prepare me for a technical interview' },
]

// ─── Upload zone ───────────────────────────────────────────
function UploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback(async (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return }
    setLoading(true)
    setError('')
    try {
      await onFile(f)
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load resume.')
    } finally {
      setLoading(false)
    }
  }, [onFile])

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6">
        <Brain className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">AI Career Coach</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
        Upload your resume and get personalized career coaching — skill gaps, learning roadmaps, interview prep, and more.
      </p>

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`w-full max-w-sm border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all
          ${loading ? 'opacity-60 cursor-not-allowed' :
            dragging ? 'border-primary bg-primary/5 scale-[1.02]' :
            'border-border hover:border-primary/50 hover:bg-muted/40'}`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} disabled={loading} />
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Reading your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop your resume here</p>
            <p className="text-xs text-muted-foreground">or <span className="text-primary underline underline-offset-2">browse files</span> · PDF only</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-4 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-2 w-full max-w-sm">
        {['Career Guidance', 'Skill Gap Analysis', 'Interview Prep', 'Learning Roadmap'].map(t => (
          <div key={t} className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Single chat message ───────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  const isStream = msg.streaming

  // Format AI markdown-like text
  const formatText = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-foreground mt-2">{line.slice(2,-2)}</p>
      }
      if (line.match(/^#{1,3} /)) {
        return <p key={i} className="font-bold text-foreground text-base mt-3">{line.replace(/^#+\s/, '')}</p>
      }
      if (line.trim() === '') return <br key={i} />
      return <p key={i}>{line}</p>
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isUser ? 'bg-primary' : 'bg-muted border border-border'}`}>
        {isUser
          ? <User className="w-4 h-4 text-primary-foreground" />
          : <Bot className="w-4 h-4 text-primary" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-muted text-foreground rounded-tl-sm border border-border'
        }`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="space-y-0.5">
            {formatText(msg.content)}
            {isStream && (
              <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse align-middle rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PDF viewer panel ──────────────────────────────────────
function ResumePanel({ file, onRemove }) {
  const url = useRef(file ? URL.createObjectURL(file) : null)
  useEffect(() => {
    url.current = file ? URL.createObjectURL(file) : null
    return () => { if (url.current) URL.revokeObjectURL(url.current) }
  }, [file])

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{file?.name}</span>
        </div>
        <button onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* PDF embed */}
      <div className="flex-1 overflow-hidden">
        {url.current && (
          <iframe
            src={url.current}
            title="Resume Preview"
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  )
}

// ─── Chat panel ────────────────────────────────────────────
function ChatPanel({ context, onRemove }) {
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [streaming,setStreaming] = useState(false)
  const [error,    setError]    = useState('')
  const bottomRef  = useRef(null)
  const controlRef = useRef(null)
  const textareaRef = useRef(null)

  // Welcome message
  useEffect(() => {
    setHistory([{
      role: 'assistant',
      content: "👋 Hi! I've read your resume completely. I'm your personal AI Career Coach — ask me anything about your career, skills, projects, interview prep, learning roadmap, or salary guidance. What would you like to explore today?",
      streaming: false,
    }])
  }, [])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return

    setInput('')
    setError('')

    // Add user message
    const userMsg = { role: 'user', content: msg }
    setHistory(h => [...h, userMsg])

    // Add empty streaming assistant message
    setHistory(h => [...h, { role: 'assistant', content: '', streaming: true }])
    setStreaming(true)

    const historyForApi = [...history, userMsg].map(m => ({ role: m.role, content: m.content }))

    controlRef.current = streamCareerCoachChat(
      context, historyForApi, msg,
      (chunk) => {
        setHistory(h => {
          const updated = [...h]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      },
      () => {
        setStreaming(false)
        setHistory(h => {
          const updated = [...h]
          updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false }
          return updated
        })
      },
      (err) => {
        setStreaming(false)
        setError(err)
        setHistory(h => h.slice(0, -1)) // remove empty message
      }
    )
  }, [input, history, context, streaming])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    controlRef.current?.abort()
    setHistory([{
      role: 'assistant',
      content: "Chat cleared! Ready for new questions. What would you like to know?",
      streaming: false,
    }])
    setInput('')
    setError('')
    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Career Coach AI</p>
            <p className="text-xs text-muted-foreground">Your path to professional success</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Resume loaded
          </div>
          <button onClick={clearChat} title="Clear chat"
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onRemove} title="Change resume"
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages — this is the ONLY scrollable area — min-h-0 is critical for flex children */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {history.map((msg, i) => <Message key={i} msg={msg} />)}

        {/* Suggestions — show after welcome message only */}
        {history.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s.text)}
                className="flex items-center gap-2 bg-muted/60 border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl px-3 py-2.5 text-left transition-all group">
                <span className="text-base shrink-0">{s.icon}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground leading-tight">{s.text}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-card/50 shrink-0">
        <div className="flex gap-3 items-end bg-muted/40 border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:bg-background transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your career... (Shift + Enter for new line)"
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[120px] leading-6"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
              ${!input.trim() || streaming
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg'}`}
          >
            {streaming
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────
export default function CareerCoach({ activePage = 'career-coach', onNavigate }) {
  const [file,    setFile]    = useState(null)
  const [context, setContext] = useState(null)

  const handleFile = async (f) => {
    const { context: ctx } = await initCareerCoach(f)
    setFile(f)
    setContext(ctx)
  }

  const handleRemove = () => {
    setFile(null)
    setContext(null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header title="Career Coach" badge="AI Powered" />

        {/* Main split panel */}
        <div className="flex-1 overflow-hidden min-h-0">
          {!context ? (
            /* Upload state */
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-lg">
                <UploadZone onFile={handleFile} />
              </div>
            </div>
          ) : (
            /* Split panel */
            <div className="h-full grid grid-cols-2 divide-x divide-border">
              {/* LEFT — PDF Resume viewer */}
              <ResumePanel file={file} onRemove={handleRemove} />

              {/* RIGHT — Chatbot */}
              <ChatPanel context={context} onRemove={handleRemove} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
