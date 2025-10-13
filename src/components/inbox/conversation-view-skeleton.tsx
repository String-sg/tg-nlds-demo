import { Skeleton } from '@/components/ui/skeleton'

export function ConversationViewSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar Skeleton */}
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              {/* Name Skeleton */}
              <Skeleton className="h-4 w-32" />
              {/* Subtitle Skeleton */}
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Action buttons skeletons */}
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-stone-50 px-6 py-4">
        <div className="space-y-6">
          {/* Date separator skeleton */}
          <div className="flex items-center justify-center">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          {/* Message skeletons - alternating left and right */}
          <div className="space-y-4">
            {/* Received message (left) */}
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[70%]">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-64 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Sent message (right) */}
            <div className="flex justify-end">
              <div className="max-w-[70%]">
                <Skeleton className="h-20 w-72 rounded-lg" />
              </div>
            </div>

            {/* Received message (left) */}
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[70%]">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-56 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Sent message (right) */}
            <div className="flex justify-end">
              <div className="max-w-[70%]">
                <Skeleton className="h-14 w-48 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="flex-shrink-0 border-t border-stone-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-md" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
    </div>
  )
}
