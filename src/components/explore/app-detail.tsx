import { ScrollArea } from '@/components/ui/scroll-area'
import { AppInfoSection } from './app-info-section'
import { AppDescription } from './app-description'
import { AppDeveloperInfo } from './app-developer-info'
import type { App } from '@/types/explore'

interface AppDetailProps {
  app: App
}

export function AppDetail({ app }: AppDetailProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="bg-gradient-to-b from-white to-[#F5E3DF] pb-8">
          <div className="mx-auto w-full max-w-5xl flex flex-col">
          {/* App Info Section */}
          <AppInfoSection
            name={app.name}
            tagline={app.tagline}
            icon={app.icon}
            gradient={app.gradient}
            inAppPurchases={app.inAppPurchases}
            thirdParty={app.thirdParty}
          />

          {/* Description */}
          <AppDescription
            fullDescription={app.fullDescription}
            features={app.features}
            platforms={app.platforms}
          />

          {/* Developer Info */}
          <AppDeveloperInfo developer={app.developer} />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
