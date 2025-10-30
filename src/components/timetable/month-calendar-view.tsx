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
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
        </CardHeader>
        <CardContent className="flex flex-col items-center">
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
              day: "h-12 w-full p-0 font-normal aria-selected:opacity-100",
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
                                : 'bg-gray-500'

                          return (
                            <div
                              key={idx}
                              className={cn('h-1.5 w-1.5 rounded-full', colorClass)}
                            />
                          )
                        })}
                        {dayLessons.length > 3 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
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
        </CardContent>
      </Card>

      {/* Selected date details */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate ? formatDate(selectedDate, 'EEEE, MMM d') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
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
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Loading skeleton for month calendar
 */
function MonthCalendarSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
      <Card className="hidden lg:block">
        <CardHeader>
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
