/**
 * Timetable Query Functions
 *
 * Server-side query functions for fetching teacher timetable data from Supabase.
 * Uses existing JSONB schedule field in classes table.
 */

import { createClient } from '@/lib/supabase/client'
import type { ClassWithSchedule, LessonSlot, WeekSchedule, DaySchedule, DayOfWeek, ScheduleEntry } from '@/types/timetable'
import { classesToLessonSlots, groupLessonsByDay } from '@/lib/timetable/schedule-adapter'
import { detectConflicts } from '@/lib/timetable/conflict-detector'
import { getWeekDates, getDayOfWeek } from '@/lib/timetable/date-utils'
import { startOfDay } from 'date-fns'

/**
 * Fetch all classes with schedules for a teacher
 * Returns classes with parsed schedule data
 */
export async function fetchTeacherClassesWithSchedule(
  teacherId: string
): Promise<ClassWithSchedule[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('teacher_classes')
    .select(`
      role,
      class:classes (
        id,
        name,
        subject_name,
        type,
        year_level,
        schedule
      )
    `)
    .eq('teacher_id', teacherId)

  if (error) throw error

  if (!data || data.length === 0) {
    return []
  }

  // Transform to ClassWithSchedule format
  return data
    .filter((item) => item.class !== null)
    .map((item) => {
      const cls = item.class as {
        id: string
        name: string
        subject_name: string
        type: 'subject' | 'form' | 'cca'
        year_level: string
        schedule: unknown
      }

      return {
        id: cls.id,
        name: cls.name,
        subject_name: cls.subject_name,
        type: cls.type,
        year_level: cls.year_level,
        schedule: cls.schedule,
        role: item.role,
      } as ClassWithSchedule
    })
}

/**
 * Fetch complete week schedule for a teacher
 * Includes lessons, conflicts, and statistics
 */
export async function fetchTeacherWeekSchedule(
  teacherId: string,
  weekStart: Date
): Promise<WeekSchedule> {
  // Fetch all teacher's classes with schedules
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  // Convert to lesson slots
  const allLessons = classesToLessonSlots(classes)

  // Get week dates
  const weekDates = getWeekDates(weekStart)
  const weekEnd = weekDates[weekDates.length - 1]

  // Group lessons by day
  const lessonsByDay = groupLessonsByDay(allLessons)

  // Detect conflicts
  const conflicts = detectConflicts(allLessons)

  // Build day schedules
  const days: DaySchedule[] = weekDates.map((date) => {
    const dayOfWeek = getDayOfWeek(date) as DayOfWeek
    const dayLessons = lessonsByDay[dayOfWeek] || []

    return {
      date,
      dayOfWeek,
      lessons: dayLessons,
      hasConflicts: conflicts.some((c) => c.day === dayOfWeek),
    }
  })

  return {
    weekStart,
    weekEnd,
    days,
    totalLessons: allLessons.length,
    conflicts,
    hasConflicts: conflicts.length > 0,
  }
}

/**
 * Fetch day schedule for a teacher
 * Returns lessons for a specific date
 */
export async function fetchTeacherDaySchedule(
  teacherId: string,
  date: Date
): Promise<DaySchedule> {
  // Fetch all teacher's classes
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  // Convert to lesson slots
  const allLessons = classesToLessonSlots(classes)

  // Get day of week
  const dayOfWeek = getDayOfWeek(date) as DayOfWeek

  // Filter lessons for this day
  const dayLessons = allLessons
    .filter((lesson) => lesson.day === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Detect conflicts for this day
  const allConflicts = detectConflicts(allLessons)
  const dayConflicts = allConflicts.filter((c) => c.day === dayOfWeek)

  return {
    date: startOfDay(date),
    dayOfWeek,
    lessons: dayLessons,
    hasConflicts: dayConflicts.length > 0,
  }
}

/**
 * Fetch schedule for a specific class
 * Returns all lesson times for a class throughout the week
 */
export async function fetchClassSchedule(classId: string): Promise<LessonSlot[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('classes')
    .select('id, name, subject_name, type, year_level, schedule')
    .eq('id', classId)
    .single()

  if (error) throw error

  if (!data) return []

  // Get teacher role (default to 'teacher' if not found)
  const { data: teacherClass } = await supabase
    .from('teacher_classes')
    .select('role')
    .eq('class_id', classId)
    .single()

  const classWithSchedule: ClassWithSchedule = {
    id: data.id,
    name: data.name,
    subject_name: data.subject_name || '',
    type: data.type as 'subject' | 'form' | 'cca',
    year_level: data.year_level || '',
    schedule: (data.schedule as unknown as ScheduleEntry[]) || [],
    role: (teacherClass?.role as 'teacher' | 'form_teacher') || 'teacher',
  }

  return classesToLessonSlots([classWithSchedule])
}

/**
 * Fetch month schedule for a teacher
 * Returns lessons grouped by date for calendar view
 */
export async function fetchTeacherMonthSchedule(
  teacherId: string,
  monthDate: Date
): Promise<Map<string, LessonSlot[]>> {
  // Fetch all teacher's classes
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  // Convert to lesson slots
  const allLessons = classesToLessonSlots(classes)

  // Group by day of week (since schedule repeats weekly)
  const lessonsByDay = groupLessonsByDay(allLessons)

  // Map lessons to specific dates in the month
  // Note: This is a simplified version - assumes weekly recurring schedule
  // For now, just return the lessons grouped by day of week
  const lessonsMap = new Map<string, LessonSlot[]>()

  for (const day in lessonsByDay) {
    const dayKey = day.toString()
    lessonsMap.set(dayKey, lessonsByDay[day as unknown as DayOfWeek])
  }

  return lessonsMap
}

/**
 * Fetch teacher name for display
 * Helper function for PDF export and headers
 */
export async function fetchTeacherName(teacherId: string): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('teachers')
    .select('name')
    .eq('id', teacherId)
    .single()

  if (error) throw error

  return data?.name || 'Teacher'
}

/**
 * Check if teacher has any scheduled classes
 */
export async function hasScheduledClasses(teacherId: string): Promise<boolean> {
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  // Check if any class has a non-empty schedule
  return classes.some(
    (cls) => cls.schedule && Array.isArray(cls.schedule) && cls.schedule.length > 0
  )
}

/**
 * Get quick stats for teacher's schedule
 * Used for dashboard widget
 */
export async function fetchTeacherScheduleStats(teacherId: string): Promise<{
  totalClasses: number
  totalLessons: number
  classesWithSchedule: number
}> {
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  const classesWithSchedule = classes.filter(
    (cls) => cls.schedule && Array.isArray(cls.schedule) && cls.schedule.length > 0
  )

  const allLessons = classesToLessonSlots(classesWithSchedule)

  return {
    totalClasses: classes.length,
    totalLessons: allLessons.length,
    classesWithSchedule: classesWithSchedule.length,
  }
}

/**
 * Fetch classes that need schedule setup
 * Returns classes without schedules for teacher
 */
export async function fetchClassesNeedingSchedule(
  teacherId: string
): Promise<ClassWithSchedule[]> {
  const classes = await fetchTeacherClassesWithSchedule(teacherId)

  return classes.filter(
    (cls) => !cls.schedule || !Array.isArray(cls.schedule) || cls.schedule.length === 0
  )
}
