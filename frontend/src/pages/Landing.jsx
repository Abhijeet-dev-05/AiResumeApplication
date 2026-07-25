import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Sparkles, ArrowRight, CheckCircle2, Star, Zap, Shield, Globe, Brain, FileText, BarChart2, MessageSquare } from 'lucide-react'

// ─── Animated counter ─────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        start += step
        if (start >= target) { setCount(target); clearInterval(timer) }
        else setCount(start)
      }, 20)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Floating card (hero decoration) ─────────────────────
function FloatCard({ className, children }) {
  return (
    <div className={`absolute bg-card border border-border rounded-2xl shadow-lg px-4 py-3 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

const FEATURES = [
  {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    title: 'Resume Checker',
    desc: 'Deep ATS analysis with health score, skill extraction, strengths & weaknesses, career guidance and final verdict.',
    badge: 'Live',
    badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Cover Letter Generator',
    desc: 'AI-written, job-specific cover letters that stream in real time. Edit, copy, download as .txt or .doc instantly.',
    badge: 'Live',
    badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    icon: BarChart2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    title: 'Resume Scorer',
    desc: 'Match your resume against any job description. Keyword gap analysis, ATS score, pie charts and industry feedback.',
    badge: 'Live',
    badgeCls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    icon: Globe,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'Profile Builder',
    desc: 'Generate a stunning personal portfolio website from your resume in seconds. Get a live shareable link for recruiters.',
    badge: 'Live',
    badgeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    icon: Brain,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    title: 'Interview Prep',
    desc: 'AI generates 50+ personalized interview questions from your resume. Follow-ups, expected answers, red flags & readiness score.',
    badge: 'Live',
    badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  },
  {
    icon: MessageSquare,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    title: 'AI Career Coach',
    desc: 'Interactive AI chatbot that answers your career questions based on your resume. Split-panel view with PDF preview and real-time streaming chat.',
    badge: 'Live',
    badgeCls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma',   role: 'SDE at Amazon',     text: 'Resume Genie helped me crack Amazon. The ATS checker flagged issues I never noticed and the interview prep was spot on.',    stars: 5 },
  { name: 'Rohit Verma',    role: 'Full Stack Dev',     text: 'Generated my portfolio website in 30 seconds. Sent the link to 10 recruiters. Got 3 interview calls the same week.',       stars: 5 },
  { name: 'Aisha Khan',     role: 'ML Engineer',        text: 'The interview question generator is insane. It asked questions from every single thing on my resume. I was shocked.',        stars: 5 },
  { name: 'Vikram Nair',    role: 'Backend Engineer',   text: 'Cover letter was tailored perfectly to the JD. It even matched keywords I missed. Got shortlisted for 4 out of 5 jobs.',   stars: 5 },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Your Resume', desc: 'Upload any PDF resume. Our AI reads everything — skills, projects, experience, and education.' },
  { step: '02', title: 'Choose Your Tool',   desc: 'Pick from 5 AI-powered tools. Each one is designed for a specific career goal.' },
  { step: '03', title: 'Get Results in 30s', desc: 'Groq-powered AI delivers detailed analysis, scores, questions, and content in seconds.' },
  { step: '04', title: 'Land Your Dream Job',desc: 'Apply with confidence. Share your portfolio, ace interviews, and get hired faster.' },
]

export default function Landing({ onGetStarted, onLogin }) {
  const { dark, setDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-black text-lg tracking-tight text-foreground">Resume<span className="text-primary">Genie</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors">
              {dark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={onLogin} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign in</button>
            <button onClick={onGetStarted} className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/4 blur-[80px]" />
        </div>

        {/* Floating decoration cards */}
        <FloatCard className="top-28 left-[8%] hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">ATS Score: 94/100</span>
          </div>
        </FloatCard>

        <FloatCard className="top-40 right-[8%] hidden lg:block" style={{ animationDelay: '1s' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-bold text-foreground">Interview Ready</p>
              <p className="text-xs text-muted-foreground">52 questions generated</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="bottom-32 left-[10%] hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <div>
              <p className="text-xs font-bold text-foreground">Portfolio Live!</p>
              <p className="text-xs text-muted-foreground">Share with recruiters</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="bottom-48 right-[8%] hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs font-bold text-foreground">Cover Letter</p>
              <p className="text-xs text-muted-foreground">Tailored in 30 sec</p>
            </div>
          </div>
        </FloatCard>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 text-xs font-semibold mb-6 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            Powered by Groq AI — Lightning Fast Inference
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Land Your Dream Job
            <br />
            <span className="text-primary">10x Faster</span> with AI
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Resume Genie is your all-in-one AI career toolkit. Analyze resumes, generate cover letters, score against job descriptions, build portfolio websites, and prepare for interviews — all in seconds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
            <button onClick={onGetStarted}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-bold text-base px-8 py-4 rounded-2xl shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all duration-200">
              Start for Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onLogin}
              className="flex items-center gap-2 border border-border bg-card text-foreground font-semibold text-base px-8 py-4 rounded-2xl hover:bg-muted hover:-translate-y-1 transition-all duration-200">
              Sign In
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-muted-foreground">
            {['Free to use', 'No credit card', '5 AI Tools', 'Instant results'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Resumes Analyzed',    value: 5,  suffix: '+' },
            { label: 'Cover Letters',        value: 10, suffix: '+' },
            { label: 'Interviews Prepared', value: 3,  suffix: '+' },
            { label: 'Jobs Landed',          value: 5,  suffix: '+' },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-primary mb-1">
                <Counter target={value} suffix={suffix} />
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">Features</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">Everything You Need to<br /><span className="text-primary">Get Hired</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Five AI-powered tools that work together to give you an unfair advantage in your job search.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeCls}`}>{f.badge}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">From Resume to <span className="text-primary">Hired</span><br />in 4 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-border z-10" />
                )}
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <span className="text-xs font-black text-primary">{s.step}</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4">Loved by <span className="text-primary">Job Seekers</span></h2>
            <p className="text-lg text-muted-foreground">Real results from real candidates who used Resume Genie to land their dream jobs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{t.name.split(' ').map(w => w[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ready to Land Your<br /><span className="text-primary">Dream Job?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of candidates using Resume Genie to get hired faster. Free to use. No credit card required.
          </p>
          <button onClick={onGetStarted}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-bold text-lg px-10 py-4 rounded-2xl shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all duration-200 mx-auto">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">No credit card · Free forever · 5 AI tools included</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-border py-10 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-black text-foreground">Resume<span className="text-primary">Genie</span></span>
          </div>
          <p className="text-sm text-muted-foreground">Built with ♥ using Groq AI · © 2025 ResumeGenie</p>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</button>
            <button onClick={onGetStarted} className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity">Get Started</button>
          </div>
        </div>
      </footer>

    </div>
  )
}
