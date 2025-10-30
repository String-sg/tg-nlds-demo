import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface AppInfoSectionProps {
  name: string
  tagline: string
  icon: LucideIcon
  gradient?: string
  inAppPurchases?: boolean
  thirdParty?: boolean
}

export function AppInfoSection({
  name,
  tagline,
  icon: Icon,
  gradient,
  inAppPurchases,
  thirdParty,
}: AppInfoSectionProps) {
  return (
    <div className="border-b border-stone-200 px-8 py-6">
      <div className="flex items-start gap-6">
        {/* App Icon */}
        <div
          className={`flex size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient || 'from-stone-400 to-stone-600'} shadow-md`}
        >
          <Icon className="size-12 text-white" />
        </div>

        {/* App Info & CTA */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-stone-900">{name}</h2>
              {thirdParty && (
                <Badge variant="secondary" className="text-xs font-medium">
                  3rd party
                </Badge>
              )}
            </div>
            <p className="text-base text-stone-600">{tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={() => comingSoonToast.feature('App installation')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Open
            </Button>
            {inAppPurchases && (
              <p className="text-xs text-stone-500">In-App Purchases</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
