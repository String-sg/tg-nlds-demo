import { ExternalLink, HelpCircle } from 'lucide-react'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface Developer {
  name: string
  website?: string
  support?: string
}

interface AppDeveloperInfoProps {
  developer: Developer
}

export function AppDeveloperInfo({ developer }: AppDeveloperInfoProps) {
  const handleLinkClick = (type: 'website' | 'support', url?: string) => {
    if (url) {
      comingSoonToast.feature(`${type === 'website' ? 'Developer website' : 'Support page'}`)
    }
  }

  return (
    <div className="border-b border-stone-200 px-6 py-8">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-stone-900">
          {developer.name}
        </h3>

        <div className="space-y-2">
          {developer.website && (
            <button
              type="button"
              onClick={() => handleLinkClick('website', developer.website)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ExternalLink className="size-4" />
              <span>Website</span>
            </button>
          )}

          {developer.support && (
            <button
              type="button"
              onClick={() => handleLinkClick('support', developer.support)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <HelpCircle className="size-4" />
              <span>Support</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
