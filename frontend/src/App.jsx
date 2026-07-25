import { useState, useEffect } from 'react'
import { ThemeContext } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing            from './pages/Landing'
import Login              from './pages/Login'
import Signup             from './pages/Signup'
import ResumeChecker      from './pages/ResumeChecker'
import CoverLetter        from './pages/CoverLetter'
import ResumeScorer       from './pages/ResumeScorer'
import ProfileBuilder     from './pages/ProfileBuilder'
import CareerCoach         from './pages/CareerCoach'
import InterviewQuestions from './pages/InterviewQuestions'
import JobBoard           from './pages/JobBoard'

const APP_PAGES = {
  'resume-checker':      ResumeChecker,
  'cover-letter':        CoverLetter,
  'resume-scorer':       ResumeScorer,
  'profile-builder':     ProfileBuilder,
  'interview-questions': InterviewQuestions,
  'career-coach':        CareerCoach,
  'job-board':           JobBoard,
}

// ── Inner app ─────────────────────────────────────────────
function Inner() {
  const { user, loading } = useAuth()
  const [screen,     setScreen]     = useState('landing') // 'landing' | 'login' | 'signup'
  const [activePage, setActivePage] = useState('resume-checker')
  const [prevUser,   setPrevUser]   = useState(null)

  // When user logs out (was logged in, now null) → go to login not landing
  useEffect(() => {
    if (prevUser && !user && !loading) {
      setScreen('landing')
    }
    setPrevUser(user)
  }, [user, loading])

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Already logged in — skip landing
  if (user) {
    const PageComponent = APP_PAGES[activePage] || ResumeChecker
    return <PageComponent activePage={activePage} onNavigate={setActivePage} />
  }

  // Landing page
  if (screen === 'landing') {
    return (
      <Landing
        onGetStarted={() => setScreen('signup')}
        onLogin={() => setScreen('login')}
      />
    )
  }

  // Auth screens
  if (screen === 'login') {
    return (
      <Login
        onNavigate={setActivePage}
        onSwitchToSignup={() => setScreen('signup')}
      />
    )
  }

  return (
    <Signup
      onNavigate={setActivePage}
      onSwitchToLogin={() => setScreen('login')}
    />
  )
}

// ── Root ──────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Inner />
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  )
}
