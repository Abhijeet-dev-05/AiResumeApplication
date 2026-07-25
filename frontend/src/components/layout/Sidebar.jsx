import { FileSearch, FileText, BarChart2, MessageSquare, Globe, Brain, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const tools = [
  { id: 'resume-checker',      label: 'Resume Checker',         icon: FileSearch,    available: true  },
  { id: 'cover-letter',        label: 'Cover Letter Generator', icon: FileText,      available: true  },
  { id: 'resume-scorer',       label: 'Resume Scorer',          icon: BarChart2,     available: true  },
  { id: 'profile-builder',     label: 'Profile Builder',        icon: Globe,         available: true  },
  { id: 'interview-questions', label: 'Interview Prep',         icon: Brain,         available: true  },
  { id: 'career-coach',        label: 'AI Career Coach',        icon: MessageSquare, available: true  },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function Sidebar({ activePage = 'resume-checker', onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-20">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sidebar-foreground text-sm leading-tight">Resume Genie</p>
            <p className="text-xs text-muted-foreground">AI Career Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-3">Tools</p>
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activePage === tool.id
          return (
            <div key={tool.id}>
              {tool.available ? (
                <button
                  onClick={() => onNavigate && onNavigate(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </button>
              ) : (
                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed opacity-50">
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-muted-foreground flex-1">{tool.label}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full shrink-0">Soon</span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{getInitials(user.full_name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
