/**
 * Timetable Type Definitions
 *
 * Comprehensive types for the teacher timetable feature.
 * Designed to work with current JSONB schedule field and future dedicated tables.
 */

// Day of week enum (0 = Sunday, 6 = Saturday)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Raw schedule entry format (from JSONB)
export interface ScheduleEntry {
  day: DayOfWeek
  start_time: string // "HH:MM" format (e.g., "09:00")
  end_time: string // "HH:MM" format (e.g., "10:00")
  location?: string // Room number or location name
}

// Class with schedule data
export interface ClassWithSchedule {
  id: string
  name: string
  subject_name: string
  type: 'subject' | 'form' | 'cca'
  year_level: string
  schedule: ScheduleEntry[] // Parsed from JSONB
  role: 'teacher' | 'form_teacher' // Teacher's role for this class
}

// Normalized lesson slot for rendering
export interface LessonSlot {
  id: string // Unique identifier: {classId}-{day}-{startTime}
  classId: string
  className: string
  subjectName: string
  type: 'subject' | 'form' | 'cca'
  day: DayOfWeek
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  location?: string
  yearLevel: string
  role: 'teacher' | 'form_teacher'
  color?: string // Computed color for UI
}

// Schedule for a single day
export interface DaySchedule {
  date: Date
  dayOfWeek: DayOfWeek
  lessons: LessonSlot[]
  hasConflicts: boolean
}

// Schedule for a week
export interface WeekSchedule {
  weekStart: Date
  weekEnd: Date
  days: DaySchedule[] // Array of 7 days (Sun-Sat)
  totalLessons: number
  conflicts: ScheduleConflict[]
  hasConflicts: boolean
}

// Schedule conflict information
export interface ScheduleConflict {
  id: string // Unique conflict identifier
  lessonA: LessonSlot
  lessonB: LessonSlot
  overlapStart: string // "HH:MM"
  overlapEnd: string // "HH:MM"
  day: DayOfWeek
  date?: Date // Optional: specific date if conflict is date-specific
}

// Timetable view mode
export type TimetableView = 'week' | 'day' | 'class' | 'month'

// Time slot for grid rendering
export interface TimeSlot {
  time: string // "HH:MM"
  hour: number // 0-23
  minute: number // 0 or 30 (30-minute slots)
  label: string // Display label (e.g., "9:00 AM")
}

// Grid cell data for weekly view
export interface GridCell {
  day: DayOfWeek
  timeSlot: TimeSlot
  lesson?: LessonSlot
  hasConflict: boolean
  isCurrentTime: boolean
}

// Month calendar day data
export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  lessons: LessonSlot[]
  lessonCount: number
  hasConflicts: boolean
}

// PDF export options
export interface PDFExportOptions {
  teacherName: string
  weekStart: Date
  weekEnd: Date
  schedule: WeekSchedule
  includeLocations: boolean
  includeColors: boolean
}

// Timetable filter options
export interface TimetableFilters {
  classType?: 'subject' | 'form' | 'cca'
  yearLevel?: string
  dayOfWeek?: DayOfWeek
  timeRange?: {
    start: string // "HH:MM"
    end: string // "HH:MM"
  }
}

// Timetable statistics
export interface TimetableStats {
  totalLessons: number
  totalHours: number
  lessonsByType: Record<'subject' | 'form' | 'cca', number>
  lessonsByDay: Record<DayOfWeek, number>
  averageLessonsPerDay: number
  conflictCount: number
}

// Time range for conflict detection
export interface TimeRange {
  start: string // "HH:MM"
  end: string // "HH:MM"
}

// Constants
export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5] // Mon-Fri
export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6] // Sun-Sat

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

// Default time range for school day
export const SCHOOL_DAY_START = '08:00'
export const SCHOOL_DAY_END = '16:00'

// Color mapping for class types
export const CLASS_TYPE_COLORS: Record<string, string> = {
  subject: 'bg-green-100 border-green-300 text-green-900',
  form: 'bg-orange-100 border-orange-300 text-orange-900',
  cca: 'bg-blue-100 border-blue-300 text-blue-900',
}

export const CLASS_TYPE_COLORS_DARK: Record<string, string> = {
  subject: 'dark:bg-green-900 dark:border-green-700 dark:text-green-100',
  form: 'dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100',
  cca: 'dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100',
}
