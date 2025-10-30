/**
 * Lesson Detail Popover
 *
 * Displays full lesson information in a popover when clicking on a lesson card.
 * Shows class name, subject, time range, location, duration, and teacher role.
 */

'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, Calendar, AlertTriangle } from 'lucide-react'
import type { LessonSlot } from '@/types/timetable'
import { formatTimeRange, formatDuration } from '@/lib/timetable/date-utils'
import { cn } from '@/lib/utils'

export interface LessonDetailPopoverProps {
  lesson: LessonSlot
  children: React.ReactNode
  hasConflict?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LessonDetailPopover({
  lesson,
  children,
  hasConflict = false,
  open,
  onOpenChange,
}: LessonDetailPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        side="right"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header: Class Name & Subject */}
          <div>
            <h3 className="font-semibold text-base">{lesson.className}</h3>
            <p className="text-sm text-muted-foreground">{lesson.subjectName}</p>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Details */}
          <div className="space-y-2.5">
            {/* Time Range */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {formatTimeRange(lesson.startTime, lesson.endTime, true)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDuration(lesson.startTime, lesson.endTime)}
                </div>
              </div>
            </div>

            {/* Location */}
            {lesson.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="text-sm">{lesson.location}</div>
              </div>
            )}

            {/* Year Level */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm">{lesson.yearLevel}</div>
            </div>

            {/* Teacher Role */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm capitalize">
                {lesson.role.replace('_', ' ')}
              </div>
            </div>

            {/* Conflict Warning */}
            {hasConflict && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 border border-red-200">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                <div className="text-sm text-red-900">
                  <div className="font-medium">Schedule Conflict</div>
                  <div className="text-xs text-red-700">
                    This lesson overlaps with another scheduled class
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Class Type Badge */}
          <div className="flex items-center gap-2 pt-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                lesson.color
              )}
            >
              {lesson.type === 'subject' && 'Subject Class'}
              {lesson.type === 'form' && 'Form Class'}
              {lesson.type === 'cca' && 'CCA'}
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
