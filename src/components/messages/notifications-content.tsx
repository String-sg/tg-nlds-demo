'use client'

import { Bell } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationsContent() {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900">Notifications</h2>
        <p className="text-sm text-stone-600 mt-1">Stay updated with important alerts</p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <Bell className="size-12 text-stone-400 mb-4" />
          <h3 className="text-base font-semibold text-stone-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-sm text-stone-600 max-w-md">
            You&apos;ll see notifications here when there are important updates or alerts.
          </p>
        </div>
      </ScrollArea>
    </div>
  )
}
