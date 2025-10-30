/**
 * Schedule Adapter
 *
 * Adapter layer for converting between JSONB schedule data and application types.
 * This abstraction allows for easy migration to dedicated timetable tables in the future.
 *
 * Migration Strategy:
 * - Phase 1: Use parseScheduleFromJSON to read from classes.schedule JSONB field
 * - Phase 2: Swap implementation to read from dedicated lessons table
 * - All consuming code remains unchanged
 */

import type {
  ScheduleEntry,
  ClassWithSchedule,
  LessonSlot,
  DayOfWeek,
  CLASS_TYPE_COLORS,
} from '@/types/timetable'
import { CLASS_TYPE_COLORS as COLORS } from '@/types/timetable'

/**
 * Parse schedule data from JSONB field
 * Handles null, invalid, or malformed data gracefully
 */
export function parseScheduleFromJSON(jsonb: unknown): ScheduleEntry[] {
  // Handle null or undefined
  if (!jsonb) return []

  // If already parsed as array
  if (Array.isArray(jsonb)) {
    return jsonb
      .filter(isValidScheduleEntry)
      .map((entry) => ({
        day: entry.day as DayOfWeek,
        start_time: entry.start_time,
        end_time: entry.end_time,
        location: entry.location,
      }))
  }

  // If string (needs parsing)
  if (typeof jsonb === 'string') {
    try {
      const parsed = JSON.parse(jsonb)
      if (Array.isArray(parsed)) {
        return parseScheduleFromJSON(parsed)
      }
    } catch (error) {
      console.error('Failed to parse schedule JSON:', error)
      return []
    }
  }

  return []
}

/**
 * Validate schedule entry has required fields
 */
function isValidScheduleEntry(entry: unknown): entry is ScheduleEntry {
  if (!entry || typeof entry !== 'object') return false

  const e = entry as Record<string, unknown>

  return (
    typeof e.day === 'number' &&
    e.day >= 0 &&
    e.day <= 6 &&
    typeof e.start_time === 'string' &&
    typeof e.end_time === 'string' &&
    isValidTimeFormat(e.start_time) &&
    isValidTimeFormat(e.end_time)
  )
}

/**
 * Validate time string is in HH:MM format
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Convert class data with schedule to array of lesson slots
 * This is the main transformation function for rendering
 */
export function classToLessonSlots(
  classData: ClassWithSchedule
): LessonSlot[] {
  const schedule = parseScheduleFromJSON(classData.schedule)

  return schedule.map((entry) => ({
    id: `${classData.id}-${entry.day}-${entry.start_time}`,
    classId: classData.id,
    className: classData.name,
    subjectName: classData.subject_name,
    type: classData.type,
    day: entry.day,
    startTime: entry.start_time,
    endTime: entry.end_time,
    location: entry.location,
    yearLevel: classData.year_level,
    role: classData.role,
    color: getLessonColor(classData.type),
  }))
}

/**
 * Convert multiple classes to flat array of lesson slots
 * Useful for teacher's complete schedule
 */
export function classesToLessonSlots(
  classes: ClassWithSchedule[]
): LessonSlot[] {
  return classes.flatMap(classToLessonSlots)
}

/**
 * Get color classes for a lesson type
 */
export function getLessonColor(
  type: 'subject' | 'form' | 'cca'
): string {
  return COLORS[type] || COLORS.subject
}

/**
 * Get lessons for a specific day
 */
export function getLessonsForDay(
  lessons: LessonSlot[],
  day: DayOfWeek
): LessonSlot[] {
  return lessons
    .filter((lesson) => lesson.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * Get lessons for a specific day and time range
 */
export function getLessonsInTimeRange(
  lessons: LessonSlot[],
  day: DayOfWeek,
  startTime: string,
  endTime: string
): LessonSlot[] {
  return getLessonsForDay(lessons, day).filter((lesson) => {
    // Lesson overlaps with time range if:
    // lesson.start < range.end AND lesson.end > range.start
    return lesson.startTime < endTime && lesson.endTime > startTime
  })
}

/**
 * Group lessons by day of week
 */
export function groupLessonsByDay(
  lessons: LessonSlot[]
): Record<DayOfWeek, LessonSlot[]> {
  const grouped: Partial<Record<DayOfWeek, LessonSlot[]>> = {}

  for (const lesson of lessons) {
    if (!grouped[lesson.day]) {
      grouped[lesson.day] = []
    }
    grouped[lesson.day]!.push(lesson)
  }

  // Sort lessons within each day by start time
  for (const day in grouped) {
    grouped[day as unknown as DayOfWeek]!.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    )
  }

  return grouped as Record<DayOfWeek, LessonSlot[]>
}

/**
 * Group lessons by class
 */
export function groupLessonsByClass(
  lessons: LessonSlot[]
): Record<string, LessonSlot[]> {
  const grouped: Record<string, LessonSlot[]> = {}

  for (const lesson of lessons) {
    if (!grouped[lesson.classId]) {
      grouped[lesson.classId] = []
    }
    grouped[lesson.classId].push(lesson)
  }

  return grouped
}

/**
 * Calculate total teaching hours for lessons
 */
export function calculateTotalHours(lessons: LessonSlot[]): number {
  let totalMinutes = 0

  for (const lesson of lessons) {
    const [startHour, startMin] = lesson.startTime.split(':').map(Number)
    const [endHour, endMin] = lesson.endTime.split(':').map(Number)

    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = endHour * 60 + endMin

    totalMinutes += endTotalMin - startTotalMin
  }

  return totalMinutes / 60 // Return hours
}

/**
 * Filter lessons by class type
 */
export function filterByType(
  lessons: LessonSlot[],
  type: 'subject' | 'form' | 'cca'
): LessonSlot[] {
  return lessons.filter((lesson) => lesson.type === type)
}

/**
 * Filter lessons by year level
 */
export function filterByYearLevel(
  lessons: LessonSlot[],
  yearLevel: string
): LessonSlot[] {
  return lessons.filter((lesson) => lesson.yearLevel === yearLevel)
}

/**
 * Check if a lesson is happening at a specific time
 */
export function isLessonAtTime(
  lesson: LessonSlot,
  time: string
): boolean {
  return time >= lesson.startTime && time < lesson.endTime
}

/**
 * Find the current lesson (if any) at a given time
 */
export function getCurrentLesson(
  lessons: LessonSlot[],
  day: DayOfWeek,
  currentTime: string
): LessonSlot | undefined {
  return getLessonsForDay(lessons, day).find((lesson) =>
    isLessonAtTime(lesson, currentTime)
  )
}

/**
 * Find the next upcoming lesson
 */
export function getNextLesson(
  lessons: LessonSlot[],
  day: DayOfWeek,
  currentTime: string
): LessonSlot | undefined {
  return getLessonsForDay(lessons, day)
    .filter((lesson) => lesson.startTime > currentTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0]
}

/**
 * Convert schedule to JSONB format for database storage
 * (Future use when implementing schedule editing)
 */
export function scheduleToJSON(schedule: ScheduleEntry[]): string {
  return JSON.stringify(schedule)
}

/**
 * Validate complete schedule data
 */
export function validateSchedule(schedule: ScheduleEntry[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  for (const [index, entry] of schedule.entries()) {
    if (!isValidScheduleEntry(entry)) {
      errors.push(`Entry ${index}: Invalid schedule entry format`)
      continue
    }

    // Check time logic
    if (entry.start_time >= entry.end_time) {
      errors.push(
        `Entry ${index}: Start time (${entry.start_time}) must be before end time (${entry.end_time})`
      )
    }

    // Check reasonable times (school hours)
    const [startHour] = entry.start_time.split(':').map(Number)
    const [endHour] = entry.end_time.split(':').map(Number)

    if (startHour < 6 || startHour > 22) {
      errors.push(`Entry ${index}: Start time seems outside school hours`)
    }

    if (endHour < 6 || endHour > 22) {
      errors.push(`Entry ${index}: End time seems outside school hours`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
