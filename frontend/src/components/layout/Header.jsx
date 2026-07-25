import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Header({ title = 'Resume Checker', badge = 'ATS Analysis' }) {
  const { dark, setDark } = useTheme()

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-foreground text-sm">{title}</h1>
        {badge && (
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium ml-1">
            {badge}
          </span>
        )}
      </div>

      <button
        onClick={() => setDark(!dark)}
        className="w-9 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark
          ? <Sun className="w-4 h-4 text-primary" />
          : <Moon className="w-4 h-4 text-muted-foreground" />
        }
      </button>
    </header>
  )
}
