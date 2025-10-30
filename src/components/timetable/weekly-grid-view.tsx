/**
 * Weekly Grid View Component
 *
 * Displays teacher's weekly timetable in a traditional grid format.
 * Shows time slots (08:00-16:00) × days (Mon-Fri) with lesson cards positioned appropriately.
 */

'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LessonCard, LessonCardSkeleton, EmptyLessonSlot } from './lesson-card'
import type { WeekSchedule, LessonSlot, DayOfWeek } from '@/types/timetable'
import { WEEKDAYS, DAY_NAMES_SHORT } from '@/types/timetable'
import {
  generateTimeSlots,
  getCurrentTime,
  isCurrentTimeInRange,
  isDateToday,
  formatDate,
} from '@/lib/timetable/date-utils'
import { getLessonsInTimeRange } from '@/lib/timetable/schedule-adapter'
import { getLessonsWithConflicts } from '@/lib/timetable/conflict-detector'
import { cn } from '@/lib/utils'

export interface WeeklyGridViewProps {
  schedule: WeekSchedule
  isLoading?: boolean
  startHour?: number
  endHour?: number
  onLessonClick?: (lesson: LessonSlot) => void
}

export function WeeklyGridView({
  schedule,
  isLoading = false,
  startHour = 8,
  endHour = 16,
  onLessonClick,
}: WeeklyGridViewProps) {
  // Generate time slots (30-minute intervals)
  const timeSlots = useMemo(
    () => generateTimeSlots(startHour, endHour, 30),
    [startHour, endHour]
  )

  // Get current time for indicator
  const currentTime = getCurrentTime()
  const showCurrentTimeIndicator = timeSlots.some((slot) =>
    isCurrentTimeInRange(slot.time, timeSlots[timeSlots.length - 1].time)
  )

  // Get lessons with conflicts
  const conflictedLessonIds = useMemo(
    () => getLessonsWithConflicts(
      schedule.days.flatMap(d => d.lessons),
      schedule.conflicts
    ),
    [schedule]
  )

  if (isLoading) {
    return <WeeklyGridSkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Week header */}
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <div>
          <h2 className="text-2xl font-bold">Weekly Timetable</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(schedule.weekStart, 'MMM d')} -{' '}
            {formatDate(schedule.weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {schedule.totalLessons} lesson{schedule.totalLessons !== 1 ? 's' : ''} this week
        </div>
      </div>

      {/* Grid container */}
      <ScrollArea className="flex-1">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[80px_repeat(5,1fr)] gap-px bg-background pb-2">
            {/* Empty corner for time column */}
            <div />

            {/* Day headers */}
            {WEEKDAYS.map((day, index) => {
              const dayDate = schedule.days[day]?.date
              const isToday = dayDate ? isDateToday(dayDate) : false

              return (
                <div
                  key={day}
                  className={cn(
                    'text-center font-semibold',
                    isToday && 'text-blue-600'
                  )}
                >
                  <div className="text-sm">{DAY_NAMES_SHORT[day]}</div>
                  {dayDate && (
                    <div className="text-xs text-muted-foreground">
                      {formatDate(dayDate, 'd MMM')}
                    </div>
                  )}
                  {isToday && (
                    <div className="mt-1 text-xs font-normal text-blue-600">Today</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grid body */}
          <div className="relative grid grid-cols-[80px_repeat(5,1fr)] gap-px bg-muted">
            {/* Time column */}
            <div className="flex flex-col">
              {timeSlots.map((slot, idx) => (
                <div
                  key={slot.time}
                  className={cn(
                    'flex items-center justify-end border-b bg-background pr-2 text-xs text-muted-foreground',
                    idx === 0 ? 'h-16' : 'h-24'
                  )}
                >
                  {slot.time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {WEEKDAYS.map((day) => {
              const daySchedule = schedule.days[day]
              const isToday = daySchedule?.date ? isDateToday(daySchedule.date) : false

              return (
                <div key={day} className="relative flex flex-col">
                  {/* Time slot cells */}
                  {timeSlots.map((slot, idx) => {
                    // Find lessons in this time slot
                    const nextSlotTime =
                      idx < timeSlots.length - 1
                        ? timeSlots[idx + 1].time
                        : '23:59'

                    const lessonsInSlot = daySchedule
                      ? getLessonsInTimeRange(
                          daySchedule.lessons,
                          day,
                          slot.time,
                          nextSlotTime
                        )
                      : []

                    return (
                      <div
                        key={slot.time}
                        className={cn(
                          'relative border-b bg-background',
                          idx === 0 ? 'h-16' : 'h-24',
                          isToday && 'bg-blue-50/50'
                        )}
                      >
                        {/* Render lessons that start in this slot */}
                        {lessonsInSlot
                          .filter((lesson) => lesson.startTime === slot.time)
                          .map((lesson) => {
                            const hasConflict = conflictedLessonIds.has(lesson.id)

                            return (
                              <div
                                key={lesson.id}
                                className="absolute inset-x-0 top-0 p-1"
                                style={{
                                  // Calculate height based on lesson duration
                                  height: `${calculateLessonHeight(lesson.startTime, lesson.endTime, 30)}px`,
                                }}
                              >
                                <LessonCard
                                  lesson={lesson}
                                  variant="grid"
                                  hasConflict={hasConflict}
                                  onClick={() => onLessonClick?.(lesson)}
                                />
                              </div>
                            )
                          })}

                        {/* Show empty state if no lessons in entire day */}
                        {idx === 0 &&
                          daySchedule &&
                          daySchedule.lessons.length === 0 && (
                            <div className="absolute inset-x-0 top-8 p-1">
                              <EmptyLessonSlot />
                            </div>
                          )}
                      </div>
                    )
                  })}

                  {/* Current time indicator (for today only) */}
                  {isToday && showCurrentTimeIndicator && (
                    <CurrentTimeIndicator
                      currentTime={currentTime}
                      startHour={startHour}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

/**
 * Calculate lesson card height based on duration
 * Each 30-minute slot is 96px tall (24px × 4 per hour)
 */
function calculateLessonHeight(startTime: string, endTime: string, slotMinutes: number): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startTotalMin = startHour * 60 + startMin
  const endTotalMin = endHour * 60 + endMin
  const durationMin = endTotalMin - startTotalMin

  // Base height per 30-minute slot is 96px
  const heightPerSlot = 96
  const height = (durationMin / slotMinutes) * heightPerSlot

  return Math.max(height - 8, 80) // Subtract padding, min height 80px
}

/**
 * Current time indicator - red line showing current time
 */
function CurrentTimeIndicator({
  currentTime,
  startHour,
}: {
  currentTime: string
  startHour: number
}) {
  const [currentHour, currentMin] = currentTime.split(':').map(Number)
  const totalMinutes = (currentHour - startHour) * 60 + currentMin

  // Each 30-minute slot is 96px, first slot is 64px
  const pixelsPerMinute = 96 / 30
  const topPosition = 64 + totalMinutes * pixelsPerMinute

  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center"
      style={{ top: `${topPosition}px` }}
    >
      <div className="h-0.5 flex-1 bg-red-500" />
      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500">
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  )
}

/**
 * Loading skeleton for weekly grid
 */
function WeeklyGridSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="mb-4 space-y-2 border-b pb-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Grid skeleton */}
      <div className="flex-1">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-px">
          {/* Time column */}
          <div className="space-y-px">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-muted" />
            ))}
          </div>

          {/* Day columns */}
          {Array.from({ length: 5 }).map((_, dayIdx) => (
            <div key={dayIdx} className="space-y-px">
              {Array.from({ length: 16 }).map((_, slotIdx) => (
                <div key={slotIdx} className="h-24 bg-background p-1">
                  {slotIdx % 3 === 0 && <LessonCardSkeleton variant="grid" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
