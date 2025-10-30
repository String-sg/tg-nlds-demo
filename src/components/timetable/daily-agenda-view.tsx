/**
 * Daily Agenda View Component
 *
 * Displays teacher's schedule for a specific day in chronological order.
 * Shows "up next" highlighting and empty states.
 */

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LessonCard, LessonCardSkeleton } from './lesson-card'
import { CalendarIcon, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import type { DaySchedule, LessonSlot } from '@/types/timetable'
import {
  formatDate,
  getRelativeDayName,
  getCurrentTime,
  isUpcoming,
  isTimePast,
  isDateToday,
} from '@/lib/timetable/date-utils'
import { getLessonsWithConflicts } from '@/lib/timetable/conflict-detector'

export interface DailyAgendaViewProps {
  daySchedule: DaySchedule
  isLoading?: boolean
  onDateChange?: (direction: 'prev' | 'next') => void
  onLessonClick?: (lesson: LessonSlot) => void
}

export function DailyAgendaView({
  daySchedule,
  isLoading = false,
  onDateChange,
  onLessonClick,
}: DailyAgendaViewProps) {
  const currentTime = getCurrentTime()
  const isToday = isDateToday(daySchedule.date)

  // Find the next upcoming lesson
  const nextLessonId = useMemo(() => {
    if (!isToday) return null

    const upcomingLessons = daySchedule.lessons.filter((lesson) =>
      isUpcoming(lesson.startTime, daySchedule.date)
    )

    return upcomingLessons.length > 0 ? upcomingLessons[0].id : null
  }, [daySchedule, isToday, currentTime])

  // Get conflicted lesson IDs
  const conflictedLessonIds = useMemo(() => {
    if (!daySchedule.hasConflicts) return new Set<string>()

    // We need full week conflicts to determine which lessons conflict
    // For now, just return empty set (will be populated when we have full schedule)
    return new Set<string>()
  }, [daySchedule])

  if (isLoading) {
    return <DailyAgendaSkeleton />
  }

  // Group lessons into past, current, and upcoming
  const { pastLessons, currentLesson, upcomingLessons } = useMemo(() => {
    if (!isToday) {
      return {
        pastLessons: [],
        currentLesson: null,
        upcomingLessons: daySchedule.lessons,
      }
    }

    const past: LessonSlot[] = []
    const upcoming: LessonSlot[] = []
    let current: LessonSlot | null = null

    for (const lesson of daySchedule.lessons) {
      if (isTimePast(lesson.endTime, daySchedule.date)) {
        past.push(lesson)
      } else if (
        currentTime >= lesson.startTime &&
        currentTime < lesson.endTime
      ) {
        current = lesson
      } else {
        upcoming.push(lesson)
      }
    }

    return { pastLessons: past, currentLesson: current, upcomingLessons: upcoming }
  }, [daySchedule, currentTime, isToday])

  const hasLessons = daySchedule.lessons.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {getRelativeDayName(daySchedule.date)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(daySchedule.date, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange?.('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange?.('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {!hasLessons ? (
          <EmptyDayState date={daySchedule.date} />
        ) : (
          <div className="space-y-6">
            {/* Current lesson (if any) */}
            {currentLesson && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                  Currently In Progress
                </div>
                <LessonCard
                  lesson={currentLesson}
                  variant="agenda"
                  isUpNext={false}
                  hasConflict={conflictedLessonIds.has(currentLesson.id)}
                  onClick={() => onLessonClick?.(currentLesson)}
                />
              </div>
            )}

            {/* Upcoming lessons */}
            {upcomingLessons.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  {isToday ? 'Upcoming' : 'Scheduled Lessons'}
                </div>
                <div className="space-y-3">
                  {upcomingLessons.map((lesson, index) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      variant="agenda"
                      isUpNext={isToday && lesson.id === nextLessonId}
                      hasConflict={conflictedLessonIds.has(lesson.id)}
                      onClick={() => onLessonClick?.(lesson)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past lessons (collapsed by default) */}
            {isToday && pastLessons.length > 0 && (
              <div className="space-y-2 opacity-60">
                <div className="text-sm font-semibold text-muted-foreground">
                  Completed
                </div>
                <div className="space-y-3">
                  {pastLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      variant="compact"
                      hasConflict={conflictedLessonIds.has(lesson.id)}
                      onClick={() => onLessonClick?.(lesson)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Summary card */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {daySchedule.lessons.length} lesson
                      {daySchedule.lessons.length !== 1 ? 's' : ''} scheduled
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculateTotalMinutes(daySchedule.lessons)} minutes of teaching
                    </div>
                  </div>
                </div>
                {daySchedule.hasConflicts && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Info className="h-4 w-4" />
                    Scheduling conflicts detected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

/**
 * Empty state when no lessons are scheduled
 */
function EmptyDayState({ date }: { date: Date }) {
  const isToday = isDateToday(date)

  return (
    <Card className="flex h-64 items-center justify-center border-dashed">
      <div className="text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No classes scheduled</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isToday
            ? 'Enjoy your free day!'
            : 'No lessons scheduled for this date.'}
        </p>
      </div>
    </Card>
  )
}

/**
 * Loading skeleton for daily agenda
 */
function DailyAgendaSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 animate-pulse rounded bg-muted" />
          <div className="h-10 w-10 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Lessons skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <LessonCardSkeleton key={i} variant="agenda" />
        ))}
      </div>
    </div>
  )
}

/**
 * Calculate total teaching minutes for a day
 */
function calculateTotalMinutes(lessons: LessonSlot[]): number {
  return lessons.reduce((total, lesson) => {
    const [startHour, startMin] = lesson.startTime.split(':').map(Number)
    const [endHour, endMin] = lesson.endTime.split(':').map(Number)

    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin

    return total + (endTotalMin - startTotalMin)
  }, 0)
}
