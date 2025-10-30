/**
 * Today's Schedule Widget Component
 *
 * Compact widget showing today's upcoming lessons for the home dashboard.
 * Displays next 3 lessons with quick navigation to full timetable.
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, ArrowRight, CalendarOff } from 'lucide-react'
import { useTodaySchedule } from '@/hooks/queries/use-timetable-queries'
import { LessonCard, LessonCardSkeleton } from './lesson-card'
import {
  getCurrentTime,
  isUpcoming,
  isTimePast,
  formatTimeRange,
} from '@/lib/timetable/date-utils'
import Link from 'next/link'

export interface TodayScheduleWidgetProps {
  teacherId: string
  maxLessons?: number
  onViewAll?: () => void
}

export function TodayScheduleWidget({
  teacherId,
  maxLessons = 3,
  onViewAll,
}: TodayScheduleWidgetProps) {
  const { data: daySchedule, isLoading } = useTodaySchedule(teacherId)

  if (isLoading) {
    return <TodayScheduleWidgetSkeleton />
  }

  if (!daySchedule || daySchedule.lessons.length === 0) {
    return <EmptyScheduleWidget />
  }

  const currentTime = getCurrentTime()

  // Get upcoming lessons (not past)
  const upcomingLessons = daySchedule.lessons.filter(
    (lesson) => !isTimePast(lesson.endTime, daySchedule.date)
  )

  // Get next few lessons
  const nextLessons = upcomingLessons.slice(0, maxLessons)

  // Find the next lesson
  const nextLesson = upcomingLessons.find((lesson) =>
    isUpcoming(lesson.startTime, daySchedule.date)
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Today&apos;s Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll} asChild>
            <Link href="/teaching?tab=timetable">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        {upcomingLessons.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {upcomingLessons.length} lesson{upcomingLessons.length !== 1 ? 's' : ''} remaining today
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {nextLessons.map((lesson, index) => {
          const isNext = lesson.id === nextLesson?.id

          return (
            <div
              key={lesson.id}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              {/* Time */}
              <div className="flex flex-col items-center gap-0.5 text-sm">
                <span className="font-semibold">{lesson.startTime}</span>
                <span className="text-xs text-muted-foreground">to</span>
                <span className="font-semibold">{lesson.endTime}</span>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-border" />

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium leading-none">{lesson.className}</h4>
                  {isNext && (
                    <Badge variant="default" className="text-xs">
                      Up Next
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lesson.subjectName}
                </p>
                {lesson.location && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{lesson.location}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Show more indicator */}
        {upcomingLessons.length > maxLessons && (
          <div className="pt-2 text-center">
            <Button variant="outline" size="sm" onClick={onViewAll} className="w-full" asChild>
              <Link href="/teaching?tab=timetable">
                +{upcomingLessons.length - maxLessons} more lesson
                {upcomingLessons.length - maxLessons !== 1 ? 's' : ''}
              </Link>
            </Button>
          </div>
        )}

        {/* All lessons complete */}
        {upcomingLessons.length === 0 && daySchedule.lessons.length > 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="mb-2 rounded-full bg-green-100 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">All lessons complete!</p>
            <p className="text-xs text-muted-foreground">No more classes today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Empty state when no lessons scheduled
 */
function EmptyScheduleWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Today&apos;s Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <CalendarOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium">No classes today</p>
          <p className="text-xs text-muted-foreground">Enjoy your free day!</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for widget
 */
function TodayScheduleWidgetSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex flex-col gap-1">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-12 w-px bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for smaller spaces
 */
export function CompactTodaySchedule({ teacherId }: { teacherId: string }) {
  const { data: daySchedule, isLoading } = useTodaySchedule(teacherId)

  if (isLoading || !daySchedule) return null

  const currentTime = getCurrentTime()
  const nextLesson = daySchedule.lessons.find((lesson) =>
    isUpcoming(lesson.startTime, daySchedule.date)
  )

  if (!nextLesson) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 text-sm">
        <span className="font-medium">Up Next:</span>{' '}
        <span>{nextLesson.className}</span>
        <span className="ml-2 text-muted-foreground">
          at {nextLesson.startTime}
        </span>
      </div>
    </div>
  )
}
