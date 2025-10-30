/**
 * Conflict Detail Dialog Component
 *
 * Modal dialog displaying detailed information about scheduling conflicts.
 * Shows conflicting lessons, overlap times, and severity.
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Clock, MapPin, ArrowRight } from 'lucide-react'
import type { DayOfWeek } from '@/types/timetable'
import type { ScheduleConflict } from '@/types/timetable'
import { DAY_NAMES } from '@/types/timetable'
import { formatTimeRange } from '@/lib/timetable/date-utils'
import {
  getConflictSeverity,
  formatConflictMessage,
  groupConflictsByDay,
} from '@/lib/timetable/conflict-detector'
import { cn } from '@/lib/utils'

export interface ConflictDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflicts: ScheduleConflict[]
}

export function ConflictDetailDialog({
  open,
  onOpenChange,
  conflicts,
}: ConflictDetailDialogProps) {
  // Group by day for organized display
  const conflictsByDay = groupConflictsByDay(conflicts)

  // Count by severity
  const severityCounts = conflicts.reduce(
    (acc, conflict) => {
      const severity = getConflictSeverity(conflict)
      acc[severity]++
      return acc
    },
    { minor: 0, moderate: 0, severe: 0 }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Schedule Conflicts Detected
          </DialogTitle>
          <DialogDescription>
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found in
            your timetable. Review and resolve these scheduling issues.
          </DialogDescription>
        </DialogHeader>

        {/* Summary badges */}
        <div className="flex gap-2">
          {severityCounts.severe > 0 && (
            <Badge variant="destructive">
              {severityCounts.severe} Severe
            </Badge>
          )}
          {severityCounts.moderate > 0 && (
            <Badge variant="default" className="bg-orange-500">
              {severityCounts.moderate} Moderate
            </Badge>
          )}
          {severityCounts.minor > 0 && (
            <Badge variant="secondary">
              {severityCounts.minor} Minor
            </Badge>
          )}
        </div>

        {/* Conflict list */}
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-6">
            {Object.entries(conflictsByDay).map(([dayStr, dayConflicts]) => {
              const day = parseInt(dayStr) as DayOfWeek

              return (
                <div key={day}>
                  <h3 className="mb-3 font-semibold">{DAY_NAMES[day]}</h3>
                  <div className="space-y-3">
                    {dayConflicts.map((conflict) => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Help text */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-semibold">How to resolve conflicts:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Review overlapping lesson times</li>
            <li>Adjust class schedules to avoid conflicts</li>
            <li>Contact administration if conflicts persist</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Individual conflict card
 */
function ConflictCard({ conflict }: { conflict: ScheduleConflict }) {
  const severity = getConflictSeverity(conflict)

  const severityColors = {
    minor: 'border-yellow-300 bg-yellow-50',
    moderate: 'border-orange-300 bg-orange-50',
    severe: 'border-red-300 bg-red-50',
  }

  const severityBadgeVariants = {
    minor: 'secondary' as const,
    moderate: 'default' as const,
    severe: 'destructive' as const,
  }

  return (
    <Card className={cn('border-l-4 p-4', severityColors[severity])}>
      {/* Header with severity */}
      <div className="mb-3 flex items-center justify-between">
        <Badge variant={severityBadgeVariants[severity]} className="capitalize">
          {severity} Conflict
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Overlap: {formatTimeRange(conflict.overlapStart, conflict.overlapEnd, false)}
          </span>
        </div>
      </div>

      {/* Conflicting lessons */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
        {/* Lesson A */}
        <LessonConflictInfo
          className={conflict.lessonA.className}
          subject={conflict.lessonA.subjectName}
          time={formatTimeRange(conflict.lessonA.startTime, conflict.lessonA.endTime, false)}
          location={conflict.lessonA.location}
        />

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
        </div>

        {/* Lesson B */}
        <LessonConflictInfo
          className={conflict.lessonB.className}
          subject={conflict.lessonB.subjectName}
          time={formatTimeRange(conflict.lessonB.startTime, conflict.lessonB.endTime, false)}
          location={conflict.lessonB.location}
        />
      </div>

      {/* Detailed message */}
      <p className="mt-3 text-xs text-muted-foreground">
        {formatConflictMessage(conflict)}
      </p>
    </Card>
  )
}

/**
 * Lesson info in conflict card
 */
function LessonConflictInfo({
  className,
  subject,
  time,
  location,
}: {
  className: string
  subject: string
  time: string
  location?: string
}) {
  return (
    <div className="rounded-md bg-background/50 p-3">
      <div className="font-semibold">{className}</div>
      <div className="text-sm text-muted-foreground">{subject}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <Clock className="h-3 w-3" />
        <span>{time}</span>
      </div>
      {location && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
      )}
    </div>
  )
}
