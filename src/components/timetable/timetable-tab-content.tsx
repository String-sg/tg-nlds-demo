/**
 * Timetable Tab Content Component
 *
 * Main timetable interface for the Teaching page.
 * Allows switching between different timetable views and exporting PDF.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, List, LayoutGrid, CalendarDays } from 'lucide-react'
import { WeeklyGridView } from './weekly-grid-view'
import { DailyAgendaView } from './daily-agenda-view'
import { MonthCalendarView } from './month-calendar-view'
import { ExportPDFButton } from './export-pdf-button'
import { ScheduleConflictBadge } from './schedule-conflict-badge'
import { useTeacherWeekSchedule, useTeacherDaySchedule, useTeacherName } from '@/hooks/queries/use-timetable-queries'
import { getWeekStart, getNextWeek, getPreviousWeek } from '@/lib/timetable/date-utils'
import { Card } from '@/components/ui/card'
import type { TimetableView } from '@/types/timetable'
import { classesToLessonSlots } from '@/lib/timetable/schedule-adapter'
import { useQuery } from '@tanstack/react-query'
import { fetchTeacherClassesWithSchedule } from '@/lib/queries/timetable-queries'

export interface TimetableTabContentProps {
  teacherId: string
  showControls?: boolean // Whether to show view controls and export button (default: true)
}

export function TimetableTabContent({ teacherId, showControls = true }: TimetableTabContentProps) {
  const [view, setView] = useState<TimetableView>('week')
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Fetch teacher name
  const { data: teacherName = 'Teacher' } = useTeacherName(teacherId)

  // Fetch data based on current view
  const { data: weekSchedule, isLoading: isLoadingWeek } = useTeacherWeekSchedule(
    teacherId,
    weekStart
  )

  const { data: daySchedule, isLoading: isLoadingDay } = useTeacherDaySchedule(
    teacherId,
    selectedDate
  )

  // Fetch all lessons for month view
  const { data: allClasses } = useQuery({
    queryKey: ['teacher-classes-schedule', teacherId],
    queryFn: () => fetchTeacherClassesWithSchedule(teacherId),
  })

  const allLessons = allClasses ? classesToLessonSlots(allClasses) : []

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setWeekStart(direction === 'prev' ? getPreviousWeek(weekStart) : getNextWeek(weekStart))
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1))
    setSelectedDate(newDate)
  }

  const handleMonthChange = (newMonth: Date) => {
    // Month view navigation handled internally
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          {/* View selector */}
          <Tabs value={view} onValueChange={(v) => setView(v as TimetableView)}>
            <TabsList>
              <TabsTrigger value="week">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Week
              </TabsTrigger>
              <TabsTrigger value="day">
                <List className="mr-2 h-4 w-4" />
                Day
              </TabsTrigger>
              <TabsTrigger value="month">
                <CalendarDays className="mr-2 h-4 w-4" />
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Export button */}
          {view === 'week' && weekSchedule && (
            <ExportPDFButton
              weekSchedule={weekSchedule}
              teacherName={teacherName}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {view === 'week' && weekSchedule && (
          <WeeklyGridView
            schedule={weekSchedule}
            isLoading={isLoadingWeek}
          />
        )}

        {view === 'day' && daySchedule && (
          <DailyAgendaView
            daySchedule={daySchedule}
            isLoading={isLoadingDay}
            onDateChange={handleDateChange}
          />
        )}

        {view === 'month' && (
          <MonthCalendarView
            lessons={allLessons}
            onMonthChange={handleMonthChange}
          />
        )}
      </div>

      {/* Conflict badge (floating) */}
      {weekSchedule && weekSchedule.hasConflicts && (
        <ScheduleConflictBadge conflicts={weekSchedule.conflicts} />
      )}
    </div>
  )
}
