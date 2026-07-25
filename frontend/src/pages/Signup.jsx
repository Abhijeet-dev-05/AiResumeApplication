import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Eye, EyeOff, Sparkles, Mail, Lock, User,
  AlertCircle, Loader2, Check, X,
} from 'lucide-react'

// ── Password strength rules ───────────────────────────────
const RULES = [
  { id: 'length',  label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',         test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',         test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                   test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character',        test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p) },
]

function PasswordRules({ password }) {
  if (!password) return null
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const ok = rule.test(password)
        return (
          <li key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {ok
              ? <Check className="w-3 h-3 shrink-0" />
              : <X className="w-3 h-3 shrink-0" />
            }
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

function StrengthBar({ password }) {
  const score = useMemo(() => RULES.filter(r => r.test(password)).length, [password])
  if (!password) return null
  const pct = (score / RULES.length) * 100
  const color = score <= 2 ? 'bg-destructive' : score <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
  const label = score <= 2 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong'
  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>{label}</p>
    </div>
  )
}

export default function Signup({ onNavigate, onSwitchToLogin }) {
  const { register, login } = useAuth()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setError('')
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const allRulesPassed = useMemo(() => RULES.every(r => r.test(form.password)), [form.password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password || !form.confirm_password) {
      setError('Please fill in all fields.'); return
    }
    if (!allRulesPassed) { setError('Password does not meet requirements.'); return }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password, form.confirm_password)
      // auto-login after successful registration
      await login(form.email, form.password)
      setSuccess(true)
      setTimeout(() => onNavigate('resume-checker'), 1200)
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(' '))
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start analyzing resumes with AI</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-foreground">Account created!</p>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" name="full_name" value={form.full_name}
                    onChange={handleChange} placeholder="Jane Doe" autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={show.password ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                  <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <StrengthBar password={form.password} />
                <PasswordRules password={form.password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={show.confirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password}
                    onChange={handleChange} placeholder="••••••••" autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow
                      ${form.confirm_password && form.confirm_password !== form.password ? 'border-destructive' : 'border-input'}`} />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm_password && form.confirm_password !== form.password && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                  : 'Create Account'
                }
              </button>
            </form>
          )}

          {!success && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin}
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <span className="text-primary font-medium">Groq AI</span>
        </p>
      </div>
    </div>
  )
}
