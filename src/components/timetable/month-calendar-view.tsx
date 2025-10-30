/**
 * Month Calendar View Component
 *
 * Displays teacher's schedule in a traditional month calendar format.
 * Shows colored dots for lessons and allows clicking dates to see daily schedule.
 */

'use client'

import { useState, useMemo } from 'react'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LessonCard } from './lesson-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LessonSlot, DayOfWeek } from '@/types/timetable'
import {
  getDayOfWeek,
  formatDate,
  isDateToday,
  isSameDayAs,
} from '@/lib/timetable/date-utils'
import { groupLessonsByDay } from '@/lib/timetable/schedule-adapter'
import { cn } from '@/lib/utils'

export interface MonthCalendarViewProps {
  lessons: LessonSlot[] // All lessons for the teacher (recurring weekly)
  currentMonth?: Date
  onMonthChange?: (date: Date) => void
  onDateClick?: (date: Date) => void
  isLoading?: boolean
}

export function MonthCalendarView({
  lessons,
  currentMonth = new Date(),
  onMonthChange,
  onDateClick,
  isLoading = false,
}: MonthCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date>(currentMonth)

  // Group lessons by day of week (since schedule repeats weekly)
  const lessonsByDay = useMemo(() => groupLessonsByDay(lessons), [lessons])

  // Get lessons for a specific date based on day of week
  const getLessonsForDate = (date: Date): LessonSlot[] => {
    const dayOfWeek = getDayOfWeek(date) as DayOfWeek
    return lessonsByDay[dayOfWeek] || []
  }

  // Get lessons for selected date
  const selectedDateLessons = selectedDate ? getLessonsForDate(selectedDate) : []

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onDateClick?.(date)
    }
  }

  if (isLoading) {
    return <MonthCalendarSkeleton />
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{formatDate(month, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const prev = new Date(month)
                prev.setMonth(prev.getMonth() - 1)
                handleMonthChange(prev)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const next = new Date(month)
                next.setMonth(next.getMonth() + 1)
                handleMonthChange(next)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <div className="grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_300px]">
          {/* Calendar */}
          <div className="flex flex-col">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={handleMonthChange}
              className="w-full max-w-none rounded-md border p-4"
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "flex-1 rounded-md text-muted-foreground font-normal text-sm",
                row: "flex w-full mt-2",
                cell: "flex-1 relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: "h-14 w-full p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
              components={{
                DayButton: (props) => {
                  const dayLessons = getLessonsForDate(props.day.date)

                  return (
                    <CalendarDayButton {...props}>
                      <span>{props.day.date.getDate()}</span>
                      {/* Lesson indicators */}
                      {dayLessons.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {dayLessons.slice(0, 3).map((lesson, idx) => {
                            const colorClass = lesson.color?.includes('green')
                              ? 'bg-green-500'
                              : lesson.color?.includes('orange')
                                ? 'bg-orange-500'
                                : lesson.color?.includes('blue')
                                  ? 'bg-blue-500'
                                  : 'bg-stone-500'

                            return (
                              <div
                                key={idx}
                                className={cn('h-1.5 w-1.5 rounded-full', colorClass)}
                              />
                            )
                          })}
                          {dayLessons.length > 3 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                          )}
                        </div>
                      )}
                    </CalendarDayButton>
                  )
                },
              }}
            />

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Subject</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Form</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">CCA</span>
              </div>
            </div>
          </div>

          {/* Selected date details */}
          <div className="hidden lg:flex lg:flex-col rounded-md border bg-muted/50">
            <div className="flex-shrink-0 border-b bg-background px-4 py-3">
              <h3 className="font-semibold text-sm">
                {selectedDate ? formatDate(selectedDate, 'EEEE, MMM d') : 'Select a date'}
              </h3>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                {selectedDate ? (
                  selectedDateLessons.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          variant="compact"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                      No classes scheduled for this day
                    </div>
                  )
                ) : (
                  <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                    Click a date to see scheduled classes
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for month calendar
 */
function MonthCalendarSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="flex gap-1">
            <div className="h-9 w-9 animate-pulse rounded bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <div className="grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_300px]">
          <div className="h-[500px] animate-pulse rounded-md bg-muted" />
          <div className="hidden lg:block">
            <div className="h-full animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
