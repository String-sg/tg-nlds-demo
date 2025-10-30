import { User } from 'lucide-react'

interface AppMetadata {
  rating?: number
  ratingCount?: number
  ageRating?: string
  chartPosition?: number
  chartCategory?: string
  languages: string[]
  size?: string
}

interface AppMetadataBarProps {
  metadata: AppMetadata
  developerName: string
}

export function AppMetadataBar({ metadata, developerName }: AppMetadataBarProps) {
  const formatLanguages = (languages: string[]) => {
    if (languages.length === 0) return 'EN'
    if (languages.length === 1) return languages[0]
    const additional = languages.length - 1
    return `${languages[0]} + ${additional} More`
  }

  return (
    <div className="border-b border-stone-200 bg-stone-50 px-6 py-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {/* Age */}
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
            AGE
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            {metadata.ageRating || '4+'}
          </div>
          <div className="text-xs text-stone-500">Years Old</div>
        </div>

        {/* Chart */}
        {metadata.chartPosition && (
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
              CHART
            </div>
            <div className="text-2xl font-semibold text-stone-900">
              No. {metadata.chartPosition}
            </div>
            <div className="text-xs text-stone-500">{metadata.chartCategory}</div>
          </div>
        )}

        {/* Developer */}
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
            DEVELOPER
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-stone-200">
              <User className="size-4 text-stone-600" />
            </div>
          </div>
          <div className="text-xs text-stone-500 line-clamp-2">{developerName}</div>
        </div>

        {/* Language */}
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
            LANGUAGE
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            {metadata.languages[0] || 'EN'}
          </div>
          <div className="text-xs text-stone-500">
            {metadata.languages.length > 1
              ? `+ ${metadata.languages.length - 1} More`
              : null}
          </div>
        </div>

        {/* Size */}
        {metadata.size && (
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
              SIZE
            </div>
            <div className="text-2xl font-semibold text-stone-900">{metadata.size.split(' ')[0]}</div>
            <div className="text-xs text-stone-500">MB</div>
          </div>
        )}
      </div>
    </div>
  )
}
