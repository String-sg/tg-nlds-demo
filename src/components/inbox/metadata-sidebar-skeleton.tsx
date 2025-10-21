import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User,
  Clock,
  FileText,
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from 'lucide-react'

export function MetadataSidebarSkeleton() {
  return (
    <ScrollArea className="h-full min-h-0">
      {/* Student Info Card Skeleton */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Parent Contact Info Skeleton */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
          <User className="h-3.5 w-3.5" />
          <span>Parent/Guardian</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Metadata Skeleton */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Conversation Details</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-start justify-between">
            <span className="text-xs text-stone-600">Status</span>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-start justify-between">
            <span className="text-xs text-stone-600">Started</span>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-start justify-between">
            <span className="text-xs text-stone-600">Last Activity</span>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-start justify-between">
            <span className="text-xs text-stone-600">Messages</span>
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="flex-shrink-0 border-b border-stone-200 bg-white p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>Quick Actions</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </ScrollArea>
  )
}
