/**
 * Lesson Card Component
 *
 * Reusable component for displaying a lesson in various formats (grid, agenda, list).
 * Shows class name, time, location, and conflict indicators.
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, AlertTriangle } from 'lucide-react'
import type { LessonSlot } from '@/types/timetable'
import { cn } from '@/lib/utils'
import { formatTimeRange, formatDuration } from '@/lib/timetable/date-utils'
import { LessonDetailPopover } from './lesson-detail-popover'

export interface LessonCardProps {
  lesson: LessonSlot
  variant?: 'grid' | 'agenda' | 'compact'
  isUpNext?: boolean
  hasConflict?: boolean
  onClick?: () => void
  className?: string
}

export function LessonCard({
  lesson,
  variant = 'grid',
  isUpNext = false,
  hasConflict = false,
  onClick,
  className,
}: LessonCardProps) {
  // Grid variant: Minimal card for weekly grid view with popover
  if (variant === 'grid') {
    const [open, setOpen] = useState(false)

    const cardContent = (
      <Card
        className={cn(
          'h-full cursor-pointer rounded-md border-0 !border-l-0 p-1.5 transition-all hover:shadow-md',
          lesson.color,
          hasConflict && '!border-l-2 border-red-500 bg-red-50',
          isUpNext && 'ring-2 ring-blue-500',
          className
        )}
      >
        <div className="flex h-full flex-col justify-between gap-0.5">
          {/* Class name - single line, truncated */}
          <div className="text-sm font-semibold leading-tight truncate">
            {lesson.className}
          </div>

          {/* Bottom section: time and optional conflict indicator */}
          <div className="flex items-center justify-between gap-1">
            <div className="text-[10px] text-muted-foreground">
              {lesson.startTime}
            </div>

            {/* Conflict indicator - minimal */}
            {hasConflict && (
              <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
            )}
          </div>

          {/* Up next indicator - minimal badge */}
          {isUpNext && (
            <div className="mt-0.5">
              <Badge variant="default" className="text-[10px] px-1 py-0 h-4">
                Up Next
              </Badge>
            </div>
          )}
        </div>
      </Card>
    )

    return (
      <LessonDetailPopover
        lesson={lesson}
        hasConflict={hasConflict}
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen && onClick) {
            onClick()
          }
        }}
      >
        {cardContent}
      </LessonDetailPopover>
    )
  }

  // Agenda variant: Expanded card for daily agenda view
  if (variant === 'agenda') {
    return (
      <Card
        className={cn(
          'cursor-pointer rounded-md border-l-4 transition-all hover:shadow-md',
          lesson.color,
          hasConflict && 'border-red-500 bg-red-50',
          isUpNext && 'ring-2 ring-blue-500',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Time column */}
          <div className="flex flex-col items-center gap-1 text-sm">
            <span className="font-semibold">{lesson.startTime}</span>
            <span className="text-xs text-muted-foreground">to</span>
            <span className="font-semibold">{lesson.endTime}</span>
            <span className="text-xs text-muted-foreground">
              ({formatDuration(lesson.startTime, lesson.endTime)})
            </span>
          </div>

          {/* Divider */}
          <div className="h-20 w-px bg-border" />

          {/* Content column */}
          <div className="flex-1">
            {/* Class name & badges */}
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold">{lesson.className}</h3>
              {hasConflict && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Conflict
                </Badge>
              )}
              {isUpNext && <Badge variant="default">Up Next</Badge>}
            </div>

            {/* Subject & year level */}
            <p className="mb-2 text-sm text-muted-foreground">
              {lesson.subjectName} • {lesson.yearLevel}
            </p>

            {/* Location & role */}
            <div className="flex items-center gap-4 text-sm">
              {lesson.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lesson.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{lesson.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Compact variant: Minimal card for lists and widgets
  return (
    <Card
      className={cn(
        'cursor-pointer rounded-md border-l-4 transition-all hover:shadow-sm',
        lesson.color,
        hasConflict && 'border-red-500 bg-red-50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-3">
        {/* Time */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">
            {formatTimeRange(lesson.startTime, lesson.endTime, false)}
          </div>
        </div>

        {/* Class info */}
        <div className="flex-1 px-3">
          <div className="font-medium">{lesson.className}</div>
          {lesson.location && (
            <div className="text-sm text-muted-foreground">{lesson.location}</div>
          )}
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {hasConflict && <AlertTriangle className="h-4 w-4 text-red-500" />}
          {isUpNext && <Badge variant="default" className="text-xs">Up Next</Badge>}
        </div>
      </div>
    </Card>
  )
}

/**
 * Empty lesson slot component
 * Shows in grid when no lesson is scheduled
 */
export function EmptyLessonSlot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full items-center justify-center rounded-md border border-dashed border-muted-foreground/20 bg-muted/5',
        className
      )}
    >
      <span className="text-[10px] text-muted-foreground/50">Free</span>
    </div>
  )
}

/**
 * Lesson skeleton for loading states
 */
export function LessonCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'agenda' | 'compact' }) {
  if (variant === 'grid') {
    return (
      <Card className="h-full animate-pulse rounded-md p-1.5">
        <div className="flex h-full flex-col justify-between gap-0.5">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      </Card>
    )
  }

  if (variant === 'agenda') {
    return (
      <Card className="animate-pulse rounded-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
          <div className="h-20 w-px bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="animate-pulse rounded-md p-3">
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 flex-1 rounded bg-muted" />
      </div>
    </Card>
  )
}
