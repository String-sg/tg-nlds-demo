import { ChevronRight, Star } from 'lucide-react'
import { comingSoonToast } from '@/lib/coming-soon-toast'

interface AppMetadata {
  rating?: number
  ratingCount?: number
}

interface AppReviewsProps {
  metadata: AppMetadata
}

export function AppReviews({ metadata }: AppReviewsProps) {
  if (!metadata.rating || !metadata.ratingCount) {
    return null
  }

  return (
    <div className="px-6 py-8">
      <button
        type="button"
        onClick={() => comingSoonToast.feature('Ratings & Reviews')}
        className="group w-full"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-1 text-left">
              <h3 className="text-base font-semibold text-stone-900 group-hover:underline">
                Ratings & Reviews
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.floor(metadata.rating!)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-stone-900">
                  {metadata.rating.toFixed(1)}
                </span>
                <span className="text-sm text-stone-500">
                  • {metadata.ratingCount.toLocaleString()} ratings
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="size-5 text-stone-400 transition-colors group-hover:text-stone-600" />
        </div>
      </button>
    </div>
  )
}
