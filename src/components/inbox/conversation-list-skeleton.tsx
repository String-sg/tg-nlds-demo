import { Skeleton } from '@/components/ui/skeleton'

export function ConversationListSkeleton() {
  return (
    <div className="divide-y divide-stone-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Avatar Skeleton */}
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Student name */}
                  <Skeleton className="h-4 w-32" />
                  {/* Parent name and class */}
                  <Skeleton className="h-3 w-40" />
                </div>
                {/* Timestamp */}
                <Skeleton className="h-3 w-12 flex-shrink-0" />
              </div>

              {/* Message preview */}
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
