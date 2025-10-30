import { type LucideIcon } from 'lucide-react'

export interface Developer {
  name: string
  website?: string
  support?: string
}

export interface AppMetadata {
  rating?: number
  ratingCount?: number
  ageRating?: string
  chartPosition?: number
  chartCategory?: string
  languages: string[]
  size?: string
}

export interface App {
  key: string
  name: string
  description: string
  tagline: string
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
