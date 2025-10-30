/**
 * Calendar Content Component
 *
 * Main page component for the calendar/timetable view.
 * Provides proper page structure with header and content sections.
 * Follows the same layout pattern as other pages (Teaching, Home, etc.)
 */

'use client'

import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'
import { TimetableTabContent } from './timetable/timetable-tab-content'
import { comingSoonToast } from '@/lib/coming-soon-toast'

export interface CalendarContentProps {
  teacherId?: string
}

export function CalendarContent({ teacherId }: CalendarContentProps) {
  if (!teacherId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Timetable</h1>
              <p className="text-sm text-muted-foreground">
                View your teaching schedule and manage your classes
              </p>
            </div>
            <Button size="sm" onClick={() => comingSoonToast.feature('Quick action')}>
              <Plus className="mr-2 size-4" />
              Quick action
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto h-full w-full max-w-5xl px-6 py-6">
          <TimetableTabContent teacherId={teacherId} showControls={true} />
        </div>
      </div>
    </div>
  )
}
