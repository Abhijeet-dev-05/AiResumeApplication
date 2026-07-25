import { useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import UploadSection from '../components/resume-checker/UploadSection'
import ScoreRings from '../components/resume-checker/ScoreRings'
import ScoreBreakdown from '../components/resume-checker/ScoreBreakdown'
import SkillsGrid from '../components/resume-checker/SkillsGrid'
import StrengthsWeaknesses from '../components/resume-checker/StrengthsWeaknesses'
import ProjectFeedback from '../components/resume-checker/ProjectFeedback'
import CareerGuidance from '../components/resume-checker/CareerGuidance'
import ResumeImprovements from '../components/resume-checker/ResumeImprovements'
import FinalVerdict from '../components/resume-checker/FinalVerdict'
import { FullPageSkeleton } from '../components/ui/Skeleton'
import { useResumeChecker } from '../hooks/useResumeChecker'
import { FileSearch, RotateCcw } from 'lucide-react'

export default function ResumeChecker({ activePage = 'resume-checker', onNavigate }) {
  const { data, loading, error, analyze, reset } = useResumeChecker()
  const resultsRef = useRef(null)

  // Scroll into view when results arrive
  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [data])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title="Resume Checker" badge="ATS Analysis" />

        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-8">

          {/* ── Upload Card ─────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileSearch className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Upload Your Resume
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get a detailed ATS analysis, skill breakdown, career guidance, and scoring — in seconds.
              </p>
            </div>
            <UploadSection
              onAnalyze={analyze}
              loading={loading}
              error={error}
            />
          </div>

          {/* ── Loading Skeletons ────────────────────── */}
          {loading && <FullPageSkeleton />}

          {/* ── Results ─────────────────────────────── */}
          {data && !loading && (
            <div ref={resultsRef} className="space-y-6">

              {/* Analyse again button */}
              <div className="flex justify-end">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl px-4 py-2 hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Analyse another resume
                </button>
              </div>

              {/* 1. Score rings */}
              <ScoreRings data={data} />

              {/* 2. Score breakdown + Skills side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScoreBreakdown breakdown={data.score_breakdown} />
                <SkillsGrid skills={data.technical_skills} />
              </div>

              {/* 3. Strengths, Weaknesses, Issues */}
              <StrengthsWeaknesses data={data} />

              {/* 4. Project Feedback */}
              {data.project_feedback?.length > 0 && (
                <ProjectFeedback projects={data.project_feedback} />
              )}

              {/* 5. Resume Improvements + Top Job Roles */}
              <ResumeImprovements
                improvements={data.resume_improvements}
                jobRoles={data.recommended_job_roles}
              />

              {/* 6. Career Guidance */}
              <CareerGuidance guidance={data.career_guidance} />

              {/* 7. Final Verdict */}
              <FinalVerdict verdict={data.final_verdict} />

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
