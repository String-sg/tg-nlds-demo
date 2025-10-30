import { type LucideIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppDetailHeader } from './app-detail-header'
import { AppInfoSection } from './app-info-section'
import { AppMetadataBar } from './app-metadata-bar'
import { AppScreenshots } from './app-screenshots'
import { AppDescription } from './app-description'
import { AppDeveloperInfo } from './app-developer-info'
import { AppReviews } from './app-reviews'

interface Developer {
  name: string
  website?: string
  support?: string
}

interface AppMetadata {
  rating?: number
  ratingCount?: number
  ageRating?: string
  chartPosition?: number
  chartCategory?: string
  languages: string[]
  size?: string
}

export interface AppDetailData {
  key: string
  name: string
  tagline: string
  description: string
  fullDescription: string
  icon: LucideIcon
  category: string
  gradient?: string
  thirdParty?: boolean
  developer: Developer
  metadata: AppMetadata
  features?: string[]
  screenshots?: string[]
  inAppPurchases?: boolean
  platforms?: string[]
}

interface AppDetailProps {
  app: AppDetailData
  onClose: () => void
}

export function AppDetail({ app, onClose }: AppDetailProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header with navigation */}
      <AppDetailHeader onBack={onClose} />

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {/* App Info Section */}
          <AppInfoSection
            name={app.name}
            tagline={app.tagline}
            icon={app.icon}
            gradient={app.gradient}
            inAppPurchases={app.inAppPurchases}
            thirdParty={app.thirdParty}
          />

          {/* Metadata Bar */}
          <AppMetadataBar
            metadata={app.metadata}
            developerName={app.developer.name}
          />

          {/* Screenshots */}
          <AppScreenshots
            screenshots={app.screenshots}
            appName={app.name}
          />

          {/* Description */}
          <AppDescription
            fullDescription={app.fullDescription}
            features={app.features}
            platforms={app.platforms}
          />

          {/* Developer Info */}
          <AppDeveloperInfo developer={app.developer} />

          {/* Ratings & Reviews */}
          <AppReviews metadata={app.metadata} />
        </div>
      </ScrollArea>
    </div>
  )
}
