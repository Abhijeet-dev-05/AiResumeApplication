import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header  from '../components/layout/Header'
import { useJobs } from '../hooks/useJobs'
import {
  Search, MapPin, Building2, Briefcase, Clock, ExternalLink,
  Filter, RotateCcw, AlertCircle, Sparkles, ChevronDown,
  GraduationCap, Users, TrendingUp, Loader2,
} from 'lucide-react'

// ── Constants ─────────────────────────────────────────────
const EXPERIENCE_OPTIONS = ['Fresher', '1-2 years', '2-4 years', '4-6 years', '6+ years']
const JOB_TYPE_OPTIONS   = ['Full Time', 'Part Time', 'Remote', 'Internship', 'Contract']
const LIMIT_OPTIONS      = ['10', '20', '30', '50']

// ── Helpers ───────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days === 0) return hours <= 1 ? 'Just now' : `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}

const EXP_COLORS = {
  'Fresher':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  '1-2 years': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '2-4 years': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  '4-6 years': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '6+ years':  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}
const TYPE_COLORS = {
  'Full Time':  'bg-primary/10 text-primary',
  'Part Time':  'bg-secondary text-secondary-foreground',
  'Remote':     'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Internship': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Contract':   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

// ── Job Detail Modal ──────────────────────────────────────
function JobModal({ job, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
              {initials(job.company)}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground text-base leading-tight truncate">{job.job_title || job.title}</h2>
              <p className="text-sm text-primary font-medium">{job.company}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {job.location && (
              <span className="flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                <MapPin className="w-3 h-3" />{job.location}
              </span>
            )}
            {job.job_type && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${TYPE_COLORS[job.job_type] || 'bg-muted text-muted-foreground'}`}>
                {job.job_type}
              </span>
            )}
            {job.experience && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${EXP_COLORS[job.experience] || 'bg-muted text-muted-foreground'}`}>
                {job.experience}
              </span>
            )}
            {job.posted_date && (
              <span className="flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3" />{timeAgo(job.posted_date)}
              </span>
            )}
          </div>

          {/* About company */}
          {job.about_company && (
            <div className="bg-muted/40 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />About the Company
              </p>
              <p className="text-sm text-foreground leading-relaxed">{job.about_company}</p>
            </div>
          )}

          {/* Job description */}
          {job.job_description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />Job Description
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{job.job_description}</p>
            </div>
          )}

          {/* Role & Responsibilities */}
          {job.role_and_responsibility && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />Roles & Responsibilities
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{job.role_and_responsibility}</p>
            </div>
          )}

          {/* Education & Skills */}
          {job.education_and_skills && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />Education & Skills Required
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{job.education_and_skills}</p>
            </div>
          )}

          {/* Apply button */}
          {job.apply_link && (
            <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md">
              <ExternalLink className="w-4 h-4" />Apply Now
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────
function JobCard({ job, onClick }) {
  return (
    <div
      onClick={() => onClick(job)}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
          {initials(job.company)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {job.job_title || job.title}
          </h3>
          <p className="text-xs text-primary font-medium mt-0.5">{job.company}</p>
        </div>
        {job.posted_date && (
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />{timeAgo(job.posted_date)}
          </span>
        )}
      </div>

      {/* Description preview */}
      {job.job_description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {job.job_description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
            <MapPin className="w-3 h-3" />{job.location}
          </span>
        )}
        {job.job_type && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[job.job_type] || 'bg-muted text-muted-foreground'}`}>
            {job.job_type}
          </span>
        )}
        {job.experience && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${EXP_COLORS[job.experience] || 'bg-muted text-muted-foreground'}`}>
            {job.experience}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-muted-foreground">Click to view details</span>
        <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────
function FilterPanel({ filters, setFilters, onSearch, loading }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Search & Filter Jobs</h3>
      </div>

      {/* Search row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filters.title}
            onChange={e => setFilters(f => ({ ...f, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Job title, role, keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Location (e.g. Bangalore, Remote)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={filters.company}
            onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}
            placeholder="Company"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filters.experience}
            onChange={e => setFilters(f => ({ ...f, experience: e.target.value }))}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">Experience</option>
            {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filters.job_type}
            onChange={e => setFilters(f => ({ ...f, job_type: e.target.value }))}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">Job Type</option>
            {JOB_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filters.limit}
            onChange={e => setFilters(f => ({ ...f, limit: e.target.value }))}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            {LIMIT_OPTIONS.map(o => <option key={o} value={o}>Show {o}</option>)}
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSearch}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'}`}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
            : <><Search className="w-4 h-4" /> Search Jobs</>
          }
        </button>
        <button
          onClick={() => setFilters({ title: '', location: '', company: '', experience: '', job_type: '', limit: '20' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function JobBoard({ activePage = 'job-board', onNavigate }) {
  const [filters, setFilters] = useState({
    title: '', location: '', company: '', experience: '', job_type: '', limit: '20',
  })
  const [selectedJob, setSelectedJob] = useState(null)
  const [localSearch, setLocalSearch] = useState('')
  const resultsRef = useRef(null)

  const { jobs, loading, error, load, reset } = useJobs()

  // Don't auto-load — wait for user to search
  // useEffect(() => { load({ limit: '20' }) }, [load])

  const handleSearch = () => {
    load(filters)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // Client-side local filter on loaded results
  const displayed = jobs.filter(j => {
    if (!localSearch) return true
    const q = localSearch.toLowerCase()
    return (
      j.title?.toLowerCase().includes(q) ||
      j.job_title?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.job_description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Job Board" badge="Live Jobs" />
        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto space-y-6">

          {/* ── Hero ──────────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Live Job Board</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Real-time job postings aggregated from across the internet. Filter by title, location, experience, and job type to find your perfect role.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Real-Time Listings', 'Filter by Location', 'Filter by Experience', 'Full Job Details', 'Direct Apply Link'].map(t => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Filters ───────────────────────────────── */}
          <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} loading={loading} />

          {/* ── Error ─────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* ── Results ───────────────────────────────── */}
          <div ref={resultsRef}>
            {/* Results header */}
            {!loading && jobs.length > 0 && (
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{displayed.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{jobs.length}</span> jobs
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    placeholder="Filter results..."
                    className="pl-8 pr-4 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56"
                  />
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-muted rounded-full w-20" />
                      <div className="h-5 bg-muted rounded-full w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state — before first search */}
            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">Search for jobs</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Enter a job title, location, or use filters above and click Search Jobs.</p>
              </div>
            )}

            {/* No local filter results */}
            {!loading && jobs.length > 0 && displayed.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <p className="text-muted-foreground text-sm">No results match "<span className="text-foreground font-medium">{localSearch}</span>"</p>
                <button onClick={() => setLocalSearch('')} className="text-xs text-primary underline underline-offset-2">Clear filter</button>
              </div>
            )}

            {/* Job cards grid */}
            {!loading && displayed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayed.map((job, i) => (
                  <JobCard key={job.id ?? i} job={job} onClick={setSelectedJob} />
                ))}
              </div>
            )}
          </div>

          {/* ── Load more ─────────────────────────────── */}
          {!loading && jobs.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => load({ ...filters, limit: String(Number(filters.limit) + 20) })}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Load more jobs
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Job Detail Modal ───────────────────────── */}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  )
}
