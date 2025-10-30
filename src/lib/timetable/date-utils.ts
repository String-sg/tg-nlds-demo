/**
 * Date Utility Functions
 *
 * Helper functions for date and time manipulation in the timetable feature.
 * Uses date-fns for date operations.
 */

import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  parse,
  isToday,
  isSameDay,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  differenceInMinutes,
  addMinutes,
} from 'date-fns'
import type { DayOfWeek, TimeSlot } from '@/types/timetable'
import { WEEKDAYS, ALL_DAYS } from '@/types/timetable'

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // 1 = Monday
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Get array of dates for a week (Mon-Sun)
 */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/**
 * Get array of weekday dates only (Mon-Fri)
 */
export function getWeekdayDates(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
}

/**
 * Get the day of week as DayOfWeek type (0-6)
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  return getDay(date) as DayOfWeek
}

/**
 * Check if a date is a weekday (Mon-Fri)
 */
export function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date)
  return WEEKDAYS.includes(day)
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatString: string = 'MMM d, yyyy'): string {
  return format(date, formatString)
}

/**
 * Format date as weekday name
 */
export function formatWeekday(date: Date, short: boolean = false): string {
  return format(date, short ? 'EEE' : 'EEEE')
}

/**
 * Format date for week header (e.g., "Jan 27 - Feb 2, 2025")
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart)
  const startMonth = format(weekStart, 'MMM')
  const endMonth = format(weekEnd, 'MMM')
  const year = format(weekEnd, 'yyyy')

  if (startMonth === endMonth) {
    return `${startMonth} ${format(weekStart, 'd')} - ${format(weekEnd, 'd')}, ${year}`
  } else {
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}, ${year}`
  }
}

/**
 * Get previous week start date
 */
export function getPreviousWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1)
}

/**
 * Get next week start date
 */
export function getNextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1)
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date): boolean {
  return isToday(date)
}

/**
 * Check if two dates are the same day
 */
export function isSameDayAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

/**
 * Parse time string to Date object (today's date with specified time)
 */
export function parseTime(timeStr: string, baseDate: Date = new Date()): Date {
  return parse(timeStr, 'HH:mm', startOfDay(baseDate))
}

/**
 * Format time for display (e.g., "9:00 AM")
 */
export function formatTime(timeStr: string, use24Hour: boolean = false): string {
  const time = parseTime(timeStr)
  return format(time, use24Hour ? 'HH:mm' : 'h:mm a')
}

/**
 * Format time range (e.g., "9:00 AM - 10:00 AM")
 */
export function formatTimeRange(
  startTime: string,
  endTime: string,
  use24Hour: boolean = false
): string {
  return `${formatTime(startTime, use24Hour)} - ${formatTime(endTime, use24Hour)}`
}

/**
 * Check if current time is within a time range
 */
export function isCurrentTimeInRange(startTime: string, endTime: string): boolean {
  const now = new Date()
  const currentTime = format(now, 'HH:mm')
  return currentTime >= startTime && currentTime < endTime
}

/**
 * Get current time as HH:MM string
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

/**
 * Check if a time slot is in the past for today
 */
export function isTimePast(endTime: string, date: Date = new Date()): boolean {
  if (!isToday(date)) return false
  const currentTime = getCurrentTime()
  return endTime <= currentTime
}

/**
 * Check if a lesson is upcoming (starts in the future today)
 */
export function isUpcoming(startTime: string, date: Date = new Date()): boolean {
  if (!isToday(date)) return false
  const currentTime = getCurrentTime()
  return startTime > currentTime
}

/**
 * Generate time slots for timetable grid
 */
export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 16,
  intervalMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startDate = new Date()
  startDate.setHours(startHour, 0, 0, 0)

  const totalMinutes = (endHour - startHour) * 60
  const numSlots = totalMinutes / intervalMinutes

  for (let i = 0; i <= numSlots; i++) {
    const slotTime = addMinutes(startDate, i * intervalMinutes)
    const hour = slotTime.getHours()
    const minute = slotTime.getMinutes()
    const timeStr = format(slotTime, 'HH:mm')

    slots.push({
      time: timeStr,
      hour,
      minute,
      label: format(slotTime, 'h:mm a'),
    })
  }

  return slots
}

/**
 * Calculate duration in minutes between two times
 */
export function getMinutesDuration(startTime: string, endTime: string): number {
  const start = parseTime(startTime)
  const end = parseTime(endTime)
  return differenceInMinutes(end, start)
}

/**
 * Calculate duration in hours between two times
 */
export function getHoursDuration(startTime: string, endTime: string): number {
  return getMinutesDuration(startTime, endTime) / 60
}

/**
 * Format duration for display (e.g., "1h 30m" or "45m")
 */
export function formatDuration(startTime: string, endTime: string): string {
  const minutes = getMinutesDuration(startTime, endTime)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

/**
 * Get all dates in a month
 */
export function getMonthDates(date: Date = new Date()): Date[] {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

/**
 * Get calendar grid dates (including padding for previous/next month)
 */
export function getCalendarGridDates(date: Date = new Date()): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)

  // Start from the Monday of the week containing the 1st of the month
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })

  // End on the Sunday of the week containing the last day of the month
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

/**
 * Check if date is in current month
 */
export function isInCurrentMonth(date: Date, monthDate: Date): boolean {
  return format(date, 'MM-yyyy') === format(monthDate, 'MM-yyyy')
}

/**
 * Round time to nearest interval (e.g., nearest 30 minutes)
 */
export function roundTimeToInterval(time: string, intervalMinutes: number = 30): string {
  const date = parseTime(time)
  const minutes = date.getMinutes()
  const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes
  const roundedDate = new Date(date)
  roundedDate.setMinutes(roundedMinutes)
  return format(roundedDate, 'HH:mm')
}

/**
 * Check if time is on the hour
 */
export function isOnTheHour(time: string): boolean {
  return time.endsWith(':00')
}

/**
 * Get relative day name (Today, Tomorrow, Yesterday, or weekday name)
 */
export function getRelativeDayName(date: Date): string {
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const yesterday = addDays(today, -1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, tomorrow)) return 'Tomorrow'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return formatWeekday(date)
}

/**
 * Check if week is current week
 */
export function isCurrentWeek(weekStart: Date): boolean {
  const currentWeekStart = getWeekStart()
  return isSameDay(weekStart, currentWeekStart)
}

/**
 * Get week number of year
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2
}

/**
 * Get overlap period between two time ranges
 */
export function getTimeRangeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): { start: string; end: string } | null {
  if (!doTimeRangesOverlap(start1, end1, start2, end2)) {
    return null
  }

  const overlapStart = start1 > start2 ? start1 : start2
  const overlapEnd = end1 < end2 ? end1 : end2

  return { start: overlapStart, end: overlapEnd }
}

/**
 * Sort times ascending
 */
export function sortTimes(times: string[]): string[] {
  return [...times].sort((a, b) => a.localeCompare(b))
}

/**
 * Check if date is a school day (Mon-Fri, not holiday)
 * Note: Holiday checking can be added later
 */
export function isSchoolDay(date: Date): boolean {
  return isWeekday(date)
  // TODO: Add holiday checking when holiday data is available
}
