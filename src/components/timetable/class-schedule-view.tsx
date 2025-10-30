/**
 * Class Schedule View Component
 *
 * Displays when a specific class meets during the week.
 * Shows all meeting times in a clean, simple layout.
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Calendar } from 'lucide-react'
import type { LessonSlot } from '@/types/timetable'
import { DAY_NAMES, WEEKDAYS } from '@/types/timetable'
import { formatTimeRange, formatDuration } from '@/lib/timetable/date-utils'
import { groupLessonsByDay } from '@/lib/timetable/schedule-adapter'
import { cn } from '@/lib/utils'

export interface ClassScheduleViewProps {
  lessons: LessonSlot[]
  className?: string
  isLoading?: boolean
}

export function ClassScheduleView({
  lessons,
  className,
  isLoading = false,
}: ClassScheduleViewProps) {
  if (isLoading) {
    return <ClassScheduleSkeleton />
  }

  if (lessons.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No schedule set</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This class doesn&apos;t have a schedule yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get class info from first lesson
  const classInfo = lessons[0]

  // Group by day
  const lessonsByDay = groupLessonsByDay(lessons)

  // Calculate total weekly hours
  const totalMinutes = lessons.reduce((total, lesson) => {
    const [startHour, startMin] = lesson.startTime.split(':').map(Number)
    const [endHour, endMin] = lesson.endTime.split(':').map(Number)
    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin
    return total + (endTotalMin - startTotalMin)
  }, 0)

  const totalHours = totalMinutes / 60

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{classInfo.className}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {classInfo.subjectName} • {classInfo.yearLevel}
            </p>
          </div>
          <Badge variant="secondary">
            {totalHours}h per week
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weekly schedule */}
          <div className="space-y-3">
            {WEEKDAYS.map((day) => {
              const dayLessons = lessonsByDay[day]

              if (!dayLessons || dayLessons.length === 0) return null

              return (
                <div
                  key={day}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  {/* Day label */}
                  <div className="flex w-24 flex-col items-start">
                    <span className="font-semibold">{DAY_NAMES[day]}</span>
                    <span className="text-xs text-muted-foreground">
                      {dayLessons.length} session{dayLessons.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Lessons for this day */}
                  <div className="flex-1 space-y-2">
                    {dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 rounded-md bg-muted/50 p-2"
                      >
                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatTimeRange(lesson.startTime, lesson.endTime, false)}
                          </span>
                        </div>

                        {/* Duration */}
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(lesson.startTime, lesson.endTime)}
                        </Badge>

                        {/* Location */}
                        {lesson.location && (
                          <>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{lesson.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{lessons.length}</div>
                <div className="text-xs text-muted-foreground">
                  Lessons per week
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">
                  Teaching time
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(lessons.map(l => l.day)).size}
                </div>
                <div className="text-xs text-muted-foreground">
                  Days per week
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for class schedule
 */
function ClassScheduleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
              <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
