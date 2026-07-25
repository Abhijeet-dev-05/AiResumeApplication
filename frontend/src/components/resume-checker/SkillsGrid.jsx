import Badge from '../ui/Badge'

const CATEGORIES = [
  { key: 'programming_languages', label: 'Programming Languages', variant: 'primary' },
  { key: 'frameworks',            label: 'Frameworks',            variant: 'accent' },
  { key: 'libraries',             label: 'Libraries',             variant: 'accent' },
  { key: 'databases',             label: 'Databases',             variant: 'primary' },
  { key: 'cloud',                 label: 'Cloud Platforms',       variant: 'primary' },
  { key: 'devops',                label: 'DevOps Tools',          variant: 'accent' },
  { key: 'ai_ml',                 label: 'AI / ML',               variant: 'primary' },
  { key: 'version_control',       label: 'Version Control',       variant: 'muted' },
  { key: 'developer_tools',       label: 'Developer Tools',       variant: 'muted' },
  { key: 'soft_skills',           label: 'Soft Skills',           variant: 'success' },
]

export default function SkillsGrid({ skills }) {
  const populated = CATEGORIES.filter(
    (c) => skills[c.key] && skills[c.key].length > 0
  )

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-foreground text-base mb-5">Extracted Skills</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {populated.map(({ key, label, variant }) => (
          <div key={key}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills[key].map((skill) => (
                <Badge key={skill} variant={variant}>
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
