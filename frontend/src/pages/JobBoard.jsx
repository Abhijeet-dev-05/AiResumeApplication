import { useState, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header  from '../components/layout/Header'
import { useJobs } from '../hooks/useJobs'
import {
  Search, MapPin, Building2, Briefcase, Clock, ExternalLink,
  Filter, RotateCcw, AlertCircle, TrendingUp, Loader2,
  ChevronDown, Home, GraduationCap, Users, Globe,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────
function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}

const TYPE_COLORS = {
  'Full-time':  'bg-primary/10 text-primary',
  'Part-time':  'bg-secondary text-secondary-foreground',
  'Contractor': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Internship': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Remote':     'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

// ── Job Detail Modal ──────────────────────────────────────
function JobModal({ job, onClose }) {
  const ext = job.detected_extensions || {}
  const applyUrl = job.apply_options?.[0]?.link || job.share_link

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl z-10">
          <div className="flex items-center gap-4 min-w-0">
            {job.thumbnail ? (
              <img src={job.thumbnail} alt={job.company_name}
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-border shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                {initials(job.company_name)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-bold text-foreground text-base leading-tight">{job.title}</h2>
              <p className="text-sm text-primary font-medium">{job.company_name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg">
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
            {ext.work_from_home && (
              <span className="flex items-center gap-1.5 text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-3 py-1.5 rounded-full font-medium">
                <Home className="w-3 h-3" />Remote
              </span>
            )}
            {ext.schedule_type && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${TYPE_COLORS[ext.schedule_type] || 'bg-muted text-muted-foreground'}`}>
                {ext.schedule_type}
              </span>
            )}
            {ext.posted_at && (
              <span className="flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3" />{ext.posted_at}
              </span>
            )}
            {job.via && (
              <span className="flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                <Globe className="w-3 h-3" />via {job.via}
              </span>
            )}
          </div>

          {/* Qualifications */}
          {ext.qualifications && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />Qualifications
              </p>
              <p className="text-sm text-foreground">{ext.qualifications}</p>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />Job Description
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Highlights */}
          {job.job_highlights?.map((h, i) => (
            <div key={i} className="bg-muted/40 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />{h.title}
              </p>
              <ul className="space-y-1.5">
                {h.items?.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1 shrink-0">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Apply options */}
          <div className="space-y-2 pt-1">
            {job.apply_options?.length > 0 ? (
              job.apply_options.map((opt, i) => (
                <a key={i} href={opt.link} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md
                    ${i === 0 ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-border text-foreground hover:bg-muted'}`}>
                  <ExternalLink className="w-4 h-4" />Apply on {opt.title}
                </a>
              ))
            ) : applyUrl && (
              <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-md">
                <ExternalLink className="w-4 h-4" />View Job
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────
function JobCard({ job, onClick }) {
  const ext = job.detected_extensions || {}
  const applyUrl = job.apply_options?.[0]?.link

  return (
    <div onClick={() => onClick(job)}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group space-y-3">

      {/* Top row */}
      <div className="flex items-start gap-3">
        {job.thumbnail ? (
          <img src={job.thumbnail} alt={job.company_name}
            className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-border shrink-0 group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
            {initials(job.company_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" />{job.company_name}
          </p>
        </div>
      </div>

      {/* Location + remote */}
      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
            <MapPin className="w-3 h-3" />{job.location}
          </span>
        )}
        {ext.work_from_home && (
          <span className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-2.5 py-1 rounded-full font-medium">
            <Home className="w-3 h-3" />Remote
          </span>
        )}
        {ext.schedule_type && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[ext.schedule_type] || 'bg-muted text-muted-foreground'}`}>
            {ext.schedule_type}
          </span>
        )}
      </div>

      {/* Description preview */}
      {job.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{job.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-2">
          {ext.posted_at && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />{ext.posted_at}
            </span>
          )}
          {job.via && (
            <span className="text-xs text-muted-foreground">via {job.via}</span>
          )}
        </div>
        {applyUrl && (
          <a href={applyUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────
function FilterPanel({ filters, setFilters, onSearch, loading }) {
  const JOB_TYPES = [
    { label: 'Any Type', value: '' },
    { label: 'Full-time', value: '' },         // google_jobs uses ltype
    { label: 'Remote',    value: '' },
    { label: 'Contractor', value: '' },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Search Jobs</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Query */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Job title, role, keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Location (e.g. Bangalore, India)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Work from home filter */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.ltype === '1'}
            onChange={e => setFilters(f => ({ ...f, ltype: e.target.checked ? '1' : '' }))}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm text-foreground flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-teal-500" />Work from home / Remote only
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSearch}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'}`}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Searching...</>
            : <><Search className="w-4 h-4" />Search Jobs</>}
        </button>
        <button
          onClick={() => setFilters({ q: '', location: '', ltype: '' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />Clear
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function JobBoard({ activePage = 'job-board', onNavigate }) {
  const [filters, setFilters]       = useState({ q: '', location: '', ltype: '' })
  const [selectedJob, setSelectedJob] = useState(null)
  const [localSearch, setLocalSearch] = useState('')
  const resultsRef = useRef(null)

  const { jobs, loading, error, load } = useJobs()

  const handleSearch = () => {
    if (!filters.q.trim()) return
    load(filters)
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const displayed = jobs.filter(j => {
    if (!localSearch) return true
    const q = localSearch.toLowerCase()
    return (
      j.title?.toLowerCase().includes(q) ||
      j.company_name?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Job Board" badge="Powered by Google Jobs" />
        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto space-y-6">

          {/* Hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Live Job Board</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Real-time job listings powered by Google Jobs via SerpAPI. Search by title, location, or filter remote-only roles.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Google Jobs Data', 'Remote Filter', 'Direct Apply Links', 'Real-Time Results', 'Full Job Details'].map(t => (
                    <span key={t} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} loading={loading} />

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          <div ref={resultsRef}>
            {/* Results header */}
            {!loading && jobs.length > 0 && (
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{displayed.length}</span> jobs found
                  {filters.q && <> for "<span className="text-primary font-medium">{filters.q}</span>"</>}
                  {filters.location && <> in <span className="text-primary font-medium">{filters.location}</span></>}
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    placeholder="Filter results..."
                    className="pl-8 pr-4 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-52"
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

            {/* Initial empty state */}
            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">Search for jobs above</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Enter a job title like "React Developer" or "Python Engineer" and click Search Jobs.
                </p>
              </div>
            )}

            {/* No local filter match */}
            {!loading && jobs.length > 0 && displayed.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <p className="text-muted-foreground text-sm">No results match "<span className="text-foreground font-medium">{localSearch}</span>"</p>
                <button onClick={() => setLocalSearch('')} className="text-xs text-primary underline underline-offset-2">Clear filter</button>
              </div>
            )}

            {/* Job cards */}
            {!loading && displayed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayed.map((job, i) => (
                  <JobCard key={job.job_id || i} job={job} onClick={setSelectedJob} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  )
}
