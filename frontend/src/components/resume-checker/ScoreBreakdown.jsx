import ProgressBar from '../ui/ProgressBar'

const SECTION_META = {
  contact_information:  { label: 'Contact Information',  max: 5  },
  professional_summary: { label: 'Professional Summary', max: 10 },
  technical_skills:     { label: 'Technical Skills',     max: 20 },
  projects:             { label: 'Projects',              max: 25 },
  experience:           { label: 'Work Experience',       max: 15 },
  education:            { label: 'Education',             max: 5  },
  formatting:           { label: 'Formatting',            max: 10 },
  grammar:              { label: 'Grammar & Readability', max: 5  },
  certifications:       { label: 'Certifications',        max: 5  },
}

function pct(score, max) {
  return Math.round((score / max) * 100)
}

export default function ScoreBreakdown({ breakdown }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-5">Section Breakdown</h2>
      <div className="space-y-4">
        {Object.entries(SECTION_META).map(([key, meta]) => {
          const section = breakdown[key]
          if (!section) return null
          const percentage = pct(section.score, meta.max)
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{meta.label}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {section.score}/{meta.max}
                </span>
              </div>
              <ProgressBar score={percentage} showLabel={false} />
              {section.feedback && (
                <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
                  {section.feedback}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
