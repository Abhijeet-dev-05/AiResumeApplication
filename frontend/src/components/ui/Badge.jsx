const variants = {
  default:     'bg-secondary text-secondary-foreground',
  primary:     'bg-primary/15 text-accent-foreground',
  accent:      'bg-accent text-accent-foreground',
  success:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning:     'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  destructive: 'bg-destructive/15 text-destructive',
  muted:       'bg-muted text-muted-foreground',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
