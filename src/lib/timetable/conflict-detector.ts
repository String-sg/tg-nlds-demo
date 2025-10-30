/**
 * Conflict Detection
 *
 * Algorithms for detecting scheduling conflicts in teacher timetables.
 * Identifies overlapping lessons, double-booked time slots, and validation issues.
 *
 * Performance: O(n²) worst case, but optimized with early exits and pre-sorting.
 * Typical case: <100ms for 40 lessons per week.
 */

import type {
  LessonSlot,
  ScheduleConflict,
  DayOfWeek,
  TimetableStats,
} from '@/types/timetable'
import { getTimeRangeOverlap, doTimeRangesOverlap } from './date-utils'
import { groupLessonsByDay, calculateTotalHours } from './schedule-adapter'

/**
 * Detect all scheduling conflicts for a teacher
 * Returns array of conflicts with overlap details
 */
export function detectConflicts(lessons: LessonSlot[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = []

  // Group by day for efficiency
  const lessonsByDay = groupLessonsByDay(lessons)

  // Check each day independently
  for (const day in lessonsByDay) {
    const dayLessons = lessonsByDay[day as unknown as DayOfWeek]
    const dayConflicts = detectDayConflicts(dayLessons, day as unknown as DayOfWeek)
    conflicts.push(...dayConflicts)
  }

  return conflicts
}

/**
 * Detect conflicts within a single day
 * More efficient than checking all lessons
 */
function detectDayConflicts(
  lessons: LessonSlot[],
  day: DayOfWeek
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = []

  // Sort by start time for efficiency
  const sortedLessons = [...lessons].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  // Check each pair of lessons
  for (let i = 0; i < sortedLessons.length; i++) {
    for (let j = i + 1; j < sortedLessons.length; j++) {
      const lessonA = sortedLessons[i]
      const lessonB = sortedLessons[j]

      // Early exit: if B starts after A ends, no more conflicts for A
      if (lessonB.startTime >= lessonA.endTime) {
        break
      }

      // Check for overlap
      const overlap = getTimeRangeOverlap(
        lessonA.startTime,
        lessonA.endTime,
        lessonB.startTime,
        lessonB.endTime
      )

      if (overlap) {
        conflicts.push({
          id: `conflict-${lessonA.id}-${lessonB.id}`,
          lessonA,
          lessonB,
          overlapStart: overlap.start,
          overlapEnd: overlap.end,
          day,
        })
      }
    }
  }

  return conflicts
}

/**
 * Check if a specific lesson has conflicts
 */
export function hasLessonConflict(
  lesson: LessonSlot,
  allLessons: LessonSlot[]
): boolean {
  return allLessons.some(
    (other) =>
      other.id !== lesson.id &&
      other.day === lesson.day &&
      doTimeRangesOverlap(
        lesson.startTime,
        lesson.endTime,
        other.startTime,
        other.endTime
      )
  )
}

/**
 * Get all lessons that conflict with a specific lesson
 */
export function getConflictingLessons(
  lesson: LessonSlot,
  allLessons: LessonSlot[]
): LessonSlot[] {
  return allLessons.filter(
    (other) =>
      other.id !== lesson.id &&
      other.day === lesson.day &&
      doTimeRangesOverlap(
        lesson.startTime,
        lesson.endTime,
        other.startTime,
        other.endTime
      )
  )
}

/**
 * Check if lessons exist at a specific time slot
 */
export function getLessonsAtTimeSlot(
  lessons: LessonSlot[],
  day: DayOfWeek,
  time: string
): LessonSlot[] {
  return lessons.filter(
    (lesson) =>
      lesson.day === day &&
      lesson.startTime <= time &&
      lesson.endTime > time
  )
}

/**
 * Find time slots with multiple lessons (conflicts)
 */
export function findConflictedTimeSlots(
  lessons: LessonSlot[],
  day: DayOfWeek
): string[] {
  const dayLessons = lessons.filter((l) => l.day === day)
  const conflictedSlots = new Set<string>()

  // Generate 30-minute intervals from earliest to latest lesson
  const times = dayLessons.flatMap((l) => [l.startTime, l.endTime])
  const earliest = Math.min(...times.map(timeToMinutes))
  const latest = Math.max(...times.map(timeToMinutes))

  for (let minutes = earliest; minutes < latest; minutes += 30) {
    const timeStr = minutesToTime(minutes)
    const lessonsAtTime = getLessonsAtTimeSlot(dayLessons, day, timeStr)

    if (lessonsAtTime.length > 1) {
      conflictedSlots.add(timeStr)
    }
  }

  return Array.from(conflictedSlots).sort()
}

/**
 * Validate lesson doesn't conflict with existing lessons
 * Returns validation result with conflict details
 */
export function validateNewLesson(
  newLesson: Omit<LessonSlot, 'id'>,
  existingLessons: LessonSlot[]
): {
  valid: boolean
  conflicts: LessonSlot[]
  message?: string
} {
  // Check basic time validity
  if (newLesson.startTime >= newLesson.endTime) {
    return {
      valid: false,
      conflicts: [],
      message: 'Start time must be before end time',
    }
  }

  // Check for conflicts with existing lessons
  const conflicts = existingLessons.filter(
    (existing) =>
      existing.day === newLesson.day &&
      doTimeRangesOverlap(
        newLesson.startTime,
        newLesson.endTime,
        existing.startTime,
        existing.endTime
      )
  )

  if (conflicts.length > 0) {
    return {
      valid: false,
      conflicts,
      message: `Conflicts with ${conflicts.length} existing lesson${conflicts.length > 1 ? 's' : ''}`,
    }
  }

  return {
    valid: true,
    conflicts: [],
  }
}

/**
 * Calculate timetable statistics
 */
export function calculateTimetableStats(lessons: LessonSlot[]): TimetableStats {
  const conflicts = detectConflicts(lessons)
  const lessonsByDay = groupLessonsByDay(lessons)

  // Count lessons by type
  const lessonsByType = {
    subject: lessons.filter((l) => l.type === 'subject').length,
    form: lessons.filter((l) => l.type === 'form').length,
    cca: lessons.filter((l) => l.type === 'cca').length,
  }

  // Count lessons by day
  const lessonsByDayCount: Record<DayOfWeek, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }

  for (const day in lessonsByDay) {
    lessonsByDayCount[day as unknown as DayOfWeek] =
      lessonsByDay[day as unknown as DayOfWeek].length
  }

  // Calculate average (weekdays only)
  const weekdayLessons = [1, 2, 3, 4, 5].reduce(
    (sum, day) => sum + lessonsByDayCount[day as DayOfWeek],
    0
  )
  const averageLessonsPerDay = weekdayLessons / 5

  return {
    totalLessons: lessons.length,
    totalHours: calculateTotalHours(lessons),
    lessonsByType,
    lessonsByDay: lessonsByDayCount,
    averageLessonsPerDay,
    conflictCount: conflicts.length,
  }
}

/**
 * Get lessons with conflicts (marked for UI highlighting)
 */
export function getLessonsWithConflicts(
  lessons: LessonSlot[],
  conflicts: ScheduleConflict[]
): Set<string> {
  const conflictedLessonIds = new Set<string>()

  for (const conflict of conflicts) {
    conflictedLessonIds.add(conflict.lessonA.id)
    conflictedLessonIds.add(conflict.lessonB.id)
  }

  return conflictedLessonIds
}

/**
 * Group conflicts by day for organized display
 */
export function groupConflictsByDay(
  conflicts: ScheduleConflict[]
): Record<DayOfWeek, ScheduleConflict[]> {
  const grouped: Partial<Record<DayOfWeek, ScheduleConflict[]>> = {}

  for (const conflict of conflicts) {
    if (!grouped[conflict.day]) {
      grouped[conflict.day] = []
    }
    grouped[conflict.day]!.push(conflict)
  }

  return grouped as Record<DayOfWeek, ScheduleConflict[]>
}

/**
 * Get conflict severity (based on overlap duration)
 */
export function getConflictSeverity(
  conflict: ScheduleConflict
): 'minor' | 'moderate' | 'severe' {
  const overlapMinutes =
    timeToMinutes(conflict.overlapEnd) - timeToMinutes(conflict.overlapStart)

  if (overlapMinutes <= 15) return 'minor'
  if (overlapMinutes <= 45) return 'moderate'
  return 'severe'
}

/**
 * Format conflict for display
 */
export function formatConflictMessage(conflict: ScheduleConflict): string {
  const severity = getConflictSeverity(conflict)
  const duration =
    timeToMinutes(conflict.overlapEnd) - timeToMinutes(conflict.overlapStart)

  return `${conflict.lessonA.className} and ${conflict.lessonB.className} overlap for ${duration} minutes (${conflict.overlapStart} - ${conflict.overlapEnd}). Severity: ${severity}.`
}

/**
 * Check if timetable has any conflicts
 */
export function hasConflicts(lessons: LessonSlot[]): boolean {
  return detectConflicts(lessons).length > 0
}

/**
 * Get conflict summary for display
 */
export function getConflictSummary(
  conflicts: ScheduleConflict[]
): {
  total: number
  minor: number
  moderate: number
  severe: number
  affectedLessons: number
} {
  const affectedLessons = new Set<string>()

  let minor = 0
  let moderate = 0
  let severe = 0

  for (const conflict of conflicts) {
    affectedLessons.add(conflict.lessonA.id)
    affectedLessons.add(conflict.lessonB.id)

    const severity = getConflictSeverity(conflict)
    if (severity === 'minor') minor++
    if (severity === 'moderate') moderate++
    if (severity === 'severe') severe++
  }

  return {
    total: conflicts.length,
    minor,
    moderate,
    severe,
    affectedLessons: affectedLessons.size,
  }
}

// Helper functions

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Find gaps in schedule (free periods)
 */
export function findScheduleGaps(
  lessons: LessonSlot[],
  day: DayOfWeek,
  minGapMinutes: number = 30
): Array<{ start: string; end: string; duration: number }> {
  const dayLessons = lessons
    .filter((l) => l.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (dayLessons.length === 0) return []

  const gaps: Array<{ start: string; end: string; duration: number }> = []

  for (let i = 0; i < dayLessons.length - 1; i++) {
    const current = dayLessons[i]
    const next = dayLessons[i + 1]

    const gapStart = current.endTime
    const gapEnd = next.startTime
    const duration = timeToMinutes(gapEnd) - timeToMinutes(gapStart)

    if (duration >= minGapMinutes) {
      gaps.push({ start: gapStart, end: gapEnd, duration })
    }
  }

  return gaps
}

/**
 * Calculate teaching load (consecutive hours without breaks)
 */
export function calculateTeachingLoad(
  lessons: LessonSlot[],
  day: DayOfWeek
): {
  consecutiveHours: number
  longestStretch: { start: string; end: string; hours: number }
} {
  const dayLessons = lessons
    .filter((l) => l.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (dayLessons.length === 0) {
    return {
      consecutiveHours: 0,
      longestStretch: { start: '00:00', end: '00:00', hours: 0 },
    }
  }

  let maxStretch = { start: '', end: '', hours: 0 }
  let currentStretch = {
    start: dayLessons[0].startTime,
    end: dayLessons[0].endTime,
  }

  for (let i = 1; i < dayLessons.length; i++) {
    const prev = dayLessons[i - 1]
    const current = dayLessons[i]

    // If lessons are consecutive (or overlap), extend stretch
    if (current.startTime <= prev.endTime) {
      currentStretch.end = current.endTime > currentStretch.end ? current.endTime : currentStretch.end
    } else {
      // Gap found, check if current stretch is longest
      const hours =
        (timeToMinutes(currentStretch.end) -
          timeToMinutes(currentStretch.start)) /
        60

      if (hours > maxStretch.hours) {
        maxStretch = { ...currentStretch, hours }
      }

      // Start new stretch
      currentStretch = {
        start: current.startTime,
        end: current.endTime,
      }
    }
  }

  // Check final stretch
  const hours =
    (timeToMinutes(currentStretch.end) - timeToMinutes(currentStretch.start)) /
    60

  if (hours > maxStretch.hours) {
    maxStretch = { ...currentStretch, hours }
  }

  return {
    consecutiveHours: maxStretch.hours,
    longestStretch: maxStretch,
  }
}
