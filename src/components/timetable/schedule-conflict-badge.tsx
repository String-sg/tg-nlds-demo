/**
 * Schedule Conflict Badge Component
 *
 * Floating badge that displays conflict count and opens detail dialog.
 * Shows when scheduling conflicts are detected.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import type { ScheduleConflict } from '@/types/timetable'
import { ConflictDetailDialog } from './conflict-detail-dialog'
import { cn } from '@/lib/utils'

export interface ScheduleConflictBadgeProps {
  conflicts: ScheduleConflict[]
  className?: string
  position?: 'fixed' | 'static'
}

export function ScheduleConflictBadge({
  conflicts,
  className,
  position = 'fixed',
}: ScheduleConflictBadgeProps) {
  const [showDialog, setShowDialog] = useState(false)

  if (conflicts.length === 0) return null

  const severityCounts = conflicts.reduce(
    (acc, conflict) => {
      const severity = getConflictSeverity(conflict)
      acc[severity]++
      return acc
    },
    { minor: 0, moderate: 0, severe: 0 }
  )

  const hasSevere = severityCounts.severe > 0
  const hasModerate = severityCounts.moderate > 0

  return (
    <>
      <Button
        variant={hasSevere ? 'destructive' : hasModerate ? 'default' : 'secondary'}
        size="sm"
        className={cn(
          'gap-2 shadow-lg',
          position === 'fixed' && 'fixed bottom-4 right-4 z-50',
          className
        )}
        onClick={() => setShowDialog(true)}
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="font-semibold">
          {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''}
        </span>
        <Badge variant="secondary" className="ml-1">
          {hasSevere && `${severityCounts.severe} Severe`}
          {hasModerate && !hasSevere && `${severityCounts.moderate} Moderate`}
          {!hasSevere && !hasModerate && `${severityCounts.minor} Minor`}
        </Badge>
      </Button>

      <ConflictDetailDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        conflicts={conflicts}
      />
    </>
  )
}

/**
 * Inline conflict indicator for compact display
 */
export function InlineConflictIndicator({
  conflictCount,
  onClick,
}: {
  conflictCount: number
  onClick?: () => void
}) {
  if (conflictCount === 0) return null

  return (
    <Badge
      variant="destructive"
      className="cursor-pointer gap-1"
      onClick={onClick}
    >
      <AlertTriangle className="h-3 w-3" />
      {conflictCount}
    </Badge>
  )
}

/**
 * Get conflict severity based on overlap duration
 */
function getConflictSeverity(
  conflict: ScheduleConflict
): 'minor' | 'moderate' | 'severe' {
  const overlapMinutes = timeToMinutes(conflict.overlapEnd) - timeToMinutes(conflict.overlapStart)

  if (overlapMinutes <= 15) return 'minor'
  if (overlapMinutes <= 45) return 'moderate'
  return 'severe'
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
